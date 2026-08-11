from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.question_bank import BloomLevel, QuestionBank, QuestionType
from app.schemas.question_bank import (
    QuestionRequirement,
    SufficiencyCheckResponse,
    SufficiencyResult,
)

# Only approved questions count as "available" - per the Faculty Review
# workflow in Algorithm-for-ai-assisted-generation.txt (generate ->
# validate -> Faculty Review -> save to bank). A question sitting in
# "pending" hasn't been reviewed yet and should never silently end up in
# an assembled exam.
AVAILABLE_STATUS = "approved"


class QuestionBankService:
    @staticmethod
    def search(
        db: Session,
        subject_id: UUID,
        lesson: str | None = None,
        bloom_level: BloomLevel | None = None,
        question_type: QuestionType | None = None,
    ) -> list[QuestionBank]:
        stmt = select(QuestionBank).where(
            QuestionBank.subject_id == subject_id,
            QuestionBank.status == AVAILABLE_STATUS,
        )

        if lesson is not None:
            stmt = stmt.where(QuestionBank.lesson == lesson)
        if bloom_level is not None:
            stmt = stmt.where(QuestionBank.bloom_level == bloom_level)
        if question_type is not None:
            stmt = stmt.where(QuestionBank.question_type == question_type)

        return list(db.scalars(stmt))

    @staticmethod
    def _count_available(
        db: Session,
        subject_id: UUID,
        req: QuestionRequirement,
    ) -> int:
        stmt = select(func.count()).select_from(QuestionBank).where(
            QuestionBank.subject_id == subject_id,
            QuestionBank.status == AVAILABLE_STATUS,
            QuestionBank.lesson == req.lesson,
            QuestionBank.bloom_level == req.bloom_level,
            QuestionBank.question_type == req.question_type,
        )
        return db.scalar(stmt) or 0

    @classmethod
    def check_sufficiency(
        cls,
        db: Session,
        subject_id: UUID,
        requirements: list[QuestionRequirement],
    ) -> SufficiencyCheckResponse:
        results: list[SufficiencyResult] = []

        for req in requirements:
            available = cls._count_available(db, subject_id, req)
            results.append(
                SufficiencyResult(
                    lesson=req.lesson,
                    bloom_level=req.bloom_level,
                    question_type=req.question_type,
                    required_count=req.required_count,
                    available_count=available,
                    sufficient=available >= req.required_count,
                )
            )

        return SufficiencyCheckResponse(
            subject_id=subject_id,
            results=results,
            overall_sufficient=all(r.sufficient for r in results),
        )