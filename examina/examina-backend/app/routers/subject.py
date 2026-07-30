from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.core.exceptions import AppError
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
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subjects = SubjectService.get_all_subjects(db)

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
        raise AppError(404, "subject_not_found", "Subject not found.")

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(403, "forbidden", "You do not own this subject.")

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
        raise AppError(404, "subject_not_found", "Subject not found.")

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(403, "forbidden", "You do not own this subject.")

    return SubjectService.update_subject(
        db=db,
        subject=subject,
        subject_data=payload,
    )


@router.delete("/{subject_id}")
def delete_subject(
    subject_id: UUID,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(404, "subject_not_found", "Subject not found.")

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(403, "forbidden", "You do not own this subject.")

    SubjectService.delete_subject(db, subject)

    return {"message": "Subject deleted successfully."}