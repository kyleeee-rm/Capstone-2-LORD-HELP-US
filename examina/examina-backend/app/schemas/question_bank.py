from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.question_bank import BloomLevel, QuestionType


class QuestionBankResponse(BaseModel):
    question_id: UUID
    subject_id: UUID
    lesson: str
    question_text: str
    bloom_level: BloomLevel
    question_type: QuestionType
    choices: dict | None
    correct_answer: str
    usage_count: int
    source: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class QuestionRequirement(BaseModel):
    """One line item of a TOS/Bloom assessment configuration - e.g.
    'need 5 Understanding-level MCQs for Lesson 3'. Matches the shape
    FE2's Week 5 Assessment Customization UI will send once built.
    """

    lesson: str
    bloom_level: BloomLevel
    question_type: QuestionType
    required_count: int


class SufficiencyCheckRequest(BaseModel):
    subject_id: UUID
    requirements: list[QuestionRequirement]


class SufficiencyResult(BaseModel):
    lesson: str
    bloom_level: BloomLevel
    question_type: QuestionType
    required_count: int
    available_count: int
    sufficient: bool


class SufficiencyCheckResponse(BaseModel):
    subject_id: UUID
    results: list[SufficiencyResult]
    # True only if EVERY requirement is individually sufficient - per
    # aassesment-generation-option-1-AI-assessment-generation.txt's
    # "Are sufficient questions available?" branch, generation only
    # kicks in for the SPECIFIC gaps, not the whole assessment.
    overall_sufficient: bool