from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.schemas.subject_folder import (
    SubjectFolderCreate,
    SubjectFolderResponse,
    SubjectFolderUpdate,
)
from app.services.subject_folder_service import SubjectFolderService
from app.services.subject_service import SubjectService

router = APIRouter(
    prefix="/subject-folders",
    tags=["subject-folders"],
)


@router.post(
    "",
    response_model=SubjectFolderResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_folder(
    payload: SubjectFolderCreate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(
        db,
        payload.subject_id,
    )

    if subject is None:
        raise AppError(
            404,
            "subject_not_found",
            "Subject not found.",
        )

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this subject.",
        )

    return SubjectFolderService.create_folder(
        db=db,
        subject=subject,
        folder_data=payload,
    )


@router.get(
    "",
    response_model=list[SubjectFolderResponse],
)
def get_folders(
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    folders = SubjectFolderService.get_all_folders(db)

    return [
        folder
        for folder in folders
        if folder.subject.faculty_id == current_user.faculty_id
    ]


@router.get(
    "/{folder_id}",
    response_model=SubjectFolderResponse,
)
def get_folder(
    folder_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    folder = SubjectFolderService.get_folder(
        db,
        folder_id,
    )

    if folder is None:
        raise AppError(
            404,
            "folder_not_found",
            "Folder not found.",
        )

    if folder.subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this folder.",
        )

    return folder


@router.put(
    "/{folder_id}",
    response_model=SubjectFolderResponse,
)
def update_folder(
    folder_id: UUID,
    payload: SubjectFolderUpdate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    folder = SubjectFolderService.get_folder(
        db,
        folder_id,
    )

    if folder is None:
        raise AppError(
            404,
            "folder_not_found",
            "Folder not found.",
        )

    if folder.subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this folder.",
        )

    return SubjectFolderService.update_folder(
        db=db,
        folder=folder,
        folder_data=payload,
    )


@router.delete("/{folder_id}")
def delete_folder(
    folder_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    folder = SubjectFolderService.get_folder(
        db,
        folder_id,
    )

    if folder is None:
        raise AppError(
            404,
            "folder_not_found",
            "Folder not found.",
        )

    if folder.subject.faculty_id != current_user.faculty_id:
        raise AppError(
            403,
            "forbidden",
            "You do not own this folder.",
        )

    SubjectFolderService.delete_folder(
        db,
        folder,
    )

    return {
        "message": "Folder deleted successfully."
    }