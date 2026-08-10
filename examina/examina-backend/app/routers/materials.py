import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.models.learning_material import LearningMaterial
from app.models.material_chunk import MaterialChunk
from app.models.subject_folder import SubjectFolder
from app.schemas.materials import (
    MaterialActionResponse,
    MaterialListItem,
    MaterialListResponse,
    MaterialStatusResponse,
    MaterialUploadResponse,
    MaterialUpdateRequest,
)
from app.services import storage
from app.services.material_processing_service import process_material
from app.services.material_service import MaterialService


router = APIRouter(prefix="/subject-folders", tags=["Learning Materials"])

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

STATUS_PROGRESS = {
    "uploaded": 0,
    "extracting": 25,
    "chunking": 50,
    "embedding": 75,
    "ready": 100,
    "failed": 0,
}


def _get_owned_folder(db: Session, folder_id: uuid.UUID, faculty: Faculty) -> SubjectFolder:
    folder = db.get(SubjectFolder, folder_id)
    if folder is None or folder.subject.faculty_id != faculty.faculty_id:
        raise AppError(404, "folder_not_found", "Subject folder not found.")
    return folder


def _get_owned_material(
    db: Session,
    folder_id: uuid.UUID,
    material_id: uuid.UUID,
    faculty: Faculty,
) -> LearningMaterial:
    _get_owned_folder(db, folder_id, faculty)

    material = db.get(LearningMaterial, material_id)

    if material is None or material.folder_id != folder_id:
        raise AppError(404, "material_not_found", "Material not found.")

    if material.faculty_id != faculty.faculty_id:
        raise AppError(404, "material_not_found", "Material not found.")

    return material


def _detect_extension(file: UploadFile) -> str | None:
    if file.content_type in ALLOWED_CONTENT_TYPES:
        return ALLOWED_CONTENT_TYPES[file.content_type]

    suffix = Path(file.filename or "").suffix.lower()
    return suffix if suffix in ALLOWED_EXTENSIONS else None


def _try_count_pages(path: Path, extension: str) -> int | None:
    if extension != ".pdf":
        return None

    try:
        import fitz

        with fitz.open(path) as doc:
            return doc.page_count
    except Exception:
        return None


@router.post(
    "/{folder_id}/materials",
    response_model=MaterialUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_material(
    folder_id: uuid.UUID,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    teaching_hours: float = Form(...),
    lesson_label: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_folder(db, folder_id, current_user)

    extension = _detect_extension(file)

    if extension is None:
        raise AppError(
            400,
            "unsupported_file_type",
            "Only PDF and DOCX files are accepted.",
        )

    material_id = uuid.uuid4()

    storage_path, size_bytes = storage.save_upload_stream(
        folder_id=folder_id,
        material_id=material_id,
        extension=extension,
        file_obj=file.file,
    )

    total_pages = _try_count_pages(
        storage.get_absolute_path(storage_path),
        extension,
    )

    file_type = (
        file.content_type
        or mimetypes.guess_type(file.filename or "")[0]
        or "application/octet-stream"
    )

    material = LearningMaterial(
        material_id=material_id,
        folder_id=folder_id,
        faculty_id=current_user.faculty_id,
        title=title,
        description=description,
        file_name=file.filename,
        file_type=file_type,
        file_size=size_bytes,
        total_pages=total_pages,
        teaching_hours=teaching_hours,
        lesson_label=lesson_label,
        storage_path=storage_path,
    )

    try:
        db.add(material)
        db.commit()
        db.refresh(material)
    except Exception:
        storage.delete_file(storage_path)
        db.rollback()
        raise

    background_tasks.add_task(
        process_material,
        material.material_id,
    )

    return material


@router.get(
    "/{folder_id}/materials",
    response_model=MaterialListResponse,
)
def list_materials(
    folder_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_folder(db, folder_id, current_user)

    materials = db.scalars(
        select(LearningMaterial).where(
            LearningMaterial.folder_id == folder_id,
        )
    ).all()

    chunk_counts = dict(
        db.execute(
            select(
                MaterialChunk.material_id,
                func.count(MaterialChunk.chunk_id),
            )
            .where(
                MaterialChunk.material_id.in_(
                    [m.material_id for m in materials]
                )
            )
            .group_by(MaterialChunk.material_id)
        ).all()
    )

    items = [
        MaterialListItem.model_validate(m).model_copy(
            update={
                "chunk_count": chunk_counts.get(
                    m.material_id,
                    0,
                )
            }
        )
        for m in materials
    ]

    return MaterialListResponse(materials=items)


@router.get(
    "/{folder_id}/materials/{material_id}/status",
    response_model=MaterialStatusResponse,
)
def material_status(
    folder_id: uuid.UUID,
    material_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    material = _get_owned_material(
        db,
        folder_id,
        material_id,
        current_user,
    )

    return MaterialStatusResponse(
        id=material.material_id,
        status=material.upload_status,
        progress_pct=STATUS_PROGRESS.get(
            material.upload_status,
            0,
        ),
    )

@router.patch(
    "/{folder_id}/materials/{material_id}",
    response_model=MaterialUploadResponse,
)
def update_material(
    folder_id: uuid.UUID,
    material_id: uuid.UUID,
    payload: MaterialUpdateRequest,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    material = _get_owned_material(
        db=db,
        folder_id=folder_id,
        material_id=material_id,
        faculty=current_user,
    )

    if "filename" in payload.model_fields_set:
        material.file_name = payload.filename

    if "title" in payload.model_fields_set:
        material.title = payload.title

    if "description" in payload.model_fields_set:
        material.description = payload.description

    if "teaching_hours" in payload.model_fields_set:
        material.teaching_hours = payload.teaching_hours

    if "lesson_label" in payload.model_fields_set:
        material.lesson_label = payload.lesson_label

    db.commit()
    db.refresh(material)

    return material

@router.delete(
    "/{folder_id}/materials/{material_id}",
    response_model=MaterialActionResponse,
)
def delete_material(
    folder_id: uuid.UUID,
    material_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    material = _get_owned_material(
        db=db,
        folder_id=folder_id,
        material_id=material_id,
        faculty=current_user,
    )

    MaterialService.delete_material(
        db=db,
        material=material,
    )

    return MaterialActionResponse(
        message="Material deleted successfully.",
    )