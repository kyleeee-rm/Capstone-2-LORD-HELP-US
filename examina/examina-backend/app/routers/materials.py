import mimetypes
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.models.learning_material import LearningMaterial
from app.models.subject import Subject
from app.schemas.materials import (
    MaterialListItem,
    MaterialListResponse,
    MaterialStatusResponse,
    MaterialUploadResponse,
)
from app.services import storage

router = APIRouter(prefix="/subjects", tags=["Learning Materials"])

ALLOWED_CONTENT_TYPES = {
    "application/pdf": ".pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
}
ALLOWED_EXTENSIONS = {".pdf", ".docx"}

# Rough stepped estimate for the polling endpoint - contract shows
# progress_pct as an example value, not an exact formula. Revisit once
# Week 4 gives real per-chunk progress to compute against.
STATUS_PROGRESS = {
    "uploaded": 0,
    "extracting": 25,
    "chunking": 50,
    "embedding": 75,
    "ready": 100,
    "failed": 0,
}


def _get_owned_subject(db: Session, subject_id: uuid.UUID, faculty: Faculty) -> Subject:
    subject = db.get(Subject, subject_id)
    # Same error for "doesn't exist" and "exists but isn't yours" -
    # deliberately avoids leaking whether a given subject_id belongs to
    # someone else.
    if subject is None or subject.faculty_id != faculty.faculty_id:
        raise AppError(404, "subject_not_found", "Subject not found.")
    return subject


def _detect_extension(file: UploadFile) -> str | None:
    if file.content_type in ALLOWED_CONTENT_TYPES:
        return ALLOWED_CONTENT_TYPES[file.content_type]
    # Some clients send a generic/missing content-type - fall back to the
    # filename extension rather than rejecting a legitimate PDF/DOCX outright.
    suffix = Path(file.filename or "").suffix.lower()
    return suffix if suffix in ALLOWED_EXTENSIONS else None


def _try_count_pages(path: Path, extension: str) -> int | None:
    # Page count for DOCX isn't reliably derivable without full extraction
    # (Week 4's job) - only attempt this for PDFs.
    if extension != ".pdf":
        return None
    try:
        import fitz  # PyMuPDF

        with fitz.open(path) as doc:
            return doc.page_count
    except Exception:
        return None


@router.post(
    "/{subject_id}/materials",
    response_model=MaterialUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_material(
    subject_id: uuid.UUID,
    file: UploadFile = File(...),
    title: str = Form(...),
    description: str = Form(...),
    teaching_hours: float = Form(...),
    lesson_label: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_subject(db, subject_id, current_user)

    extension = _detect_extension(file)
    if extension is None:
        raise AppError(400, "unsupported_file_type", "Only PDF and DOCX files are accepted.")

    material_id = uuid.uuid4()

    # Streamed to disk with the size cap enforced during the write itself,
    # not checked afterward - a spoofed Content-Length shouldn't matter.
    storage_path, size_bytes = storage.save_upload_stream(
        subject_id=subject_id,
        material_id=material_id,
        extension=extension,
        file_obj=file.file,
    )

    total_pages = _try_count_pages(storage.get_absolute_path(storage_path), extension)
    file_type = file.content_type or mimetypes.guess_type(file.filename or "")[0] or "application/octet-stream"

    material = LearningMaterial(
        material_id=material_id,
        subject_id=subject_id,
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
        # Don't leave an orphaned file on disk if the DB insert fails.
        storage.delete_file(storage_path)
        db.rollback()
        raise

    return material


@router.get("/{subject_id}/materials", response_model=MaterialListResponse)
def list_materials(
    subject_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_subject(db, subject_id, current_user)
    materials = db.scalars(
        select(LearningMaterial).where(LearningMaterial.subject_id == subject_id)
    ).all()
    return MaterialListResponse(materials=materials)


@router.get("/{subject_id}/materials/{material_id}/status", response_model=MaterialStatusResponse)
def material_status(
    subject_id: uuid.UUID,
    material_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_subject(db, subject_id, current_user)

    material = db.get(LearningMaterial, material_id)
    if material is None or material.subject_id != subject_id:
        # NOTE: material_not_found isn't in API_CONTRACT-1.md yet - add it
        # when updating the contract doc.
        raise AppError(404, "material_not_found", "Material not found.")

    return MaterialStatusResponse(
        id=material.material_id,
        status=material.upload_status,
        progress_pct=STATUS_PROGRESS.get(material.upload_status, 0),
    )
