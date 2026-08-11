from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.exceptions import AppError
from app.db.session import get_db
from app.deps import get_current_user
from app.models.faculty import Faculty
from app.models.question_bank import BloomLevel, QuestionType
from app.schemas.question_bank import (
    QuestionBankResponse,
    SufficiencyCheckRequest,
    SufficiencyCheckResponse,
)
from app.services.question_bank_service import QuestionBankService
from app.services.subject_service import SubjectService

router = APIRouter(
    prefix="/question-bank",
    tags=["question-bank"],
)


def _get_owned_subject(db: Session, subject_id: UUID, current_user: Faculty):
    subject = SubjectService.get_subject(db, subject_id)

    if subject is None:
        raise AppError(404, "subject_not_found", "Subject not found.")

    if subject.faculty_id != current_user.faculty_id:
        raise AppError(403, "forbidden", "You do not own this subject.")

    return subject


@router.get(
    "",
    response_model=list[QuestionBankResponse],
)
def search_questions(
    subject_id: UUID = Query(...),
    lesson: str | None = Query(None),
    bloom_level: BloomLevel | None = Query(None),
    question_type: QuestionType | None = Query(None),
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_subject(db, subject_id, current_user)

    return QuestionBankService.search(
        db=db,
        subject_id=subject_id,
        lesson=lesson,
        bloom_level=bloom_level,
        question_type=question_type,
    )


@router.post(
    "/sufficiency-check",
    response_model=SufficiencyCheckResponse,
)
def check_sufficiency(
    payload: SufficiencyCheckRequest,
    db: Session = Depends(get_db),
    current_user: Faculty = Depends(get_current_user),
):
    _get_owned_subject(db, payload.subject_id, current_user)

    return QuestionBankService.check_sufficiency(
        db=db,
        subject_id=payload.subject_id,
        requirements=payload.requirements,
    )