from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.schemas.subject import (
    SubjectCreate,
    SubjectResponse,
    SubjectUpdate,
)
from app.services.subject_service import SubjectService

router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_subject(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    return SubjectService.create_subject(
        db=db,
        faculty_id=current_user.faculty_id,
        subject_data=payload,
    )


@router.get("", response_model=list[SubjectResponse])
def get_subjects(
    archived: bool = Query(False),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subjects = SubjectService.get_all_subjects(
        db=db,
        archived=archived,
    )

    return [
        subject
        for subject in subjects
        if subject.faculty_id == current_user.faculty_id
    ]


@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

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

    return subject


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject(
    subject_id: UUID,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

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

    return SubjectService.update_subject(
        db=db,
        subject=subject,
        subject_data=payload,
    )


@router.patch("/{subject_id}/archive")
def archive_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

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

    if subject.is_archived:
        raise AppError(
            400,
            "already_archived",
            "Subject is already archived.",
        )

    SubjectService.archive_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject archived successfully.",
    }


@router.patch("/{subject_id}/restore")
def restore_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

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

    if not subject.is_archived:
        raise AppError(
            400,
            "not_archived",
            "Subject is not archived.",
        )

    SubjectService.restore_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject restored successfully.",
    }


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

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

    SubjectService.delete_subject(
        db=db,
        subject=subject,
    )

    return {
        "message": "Subject deleted successfully.",
    }