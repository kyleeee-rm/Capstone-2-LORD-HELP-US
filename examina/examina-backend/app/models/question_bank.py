import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum as SAEnum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class BloomLevel(str, enum.Enum):
    remembering = "Remembering"
    understanding = "Understanding"
    applying = "Applying"
    analyzing = "Analyzing"
    evaluating = "Evaluating"
    creating = "Creating"


class QuestionType(str, enum.Enum):
    multiple_choice = "multiple_choice"
    true_false = "true_false"


class QuestionBank(Base):
    """Week 4 pt.2 scope (BE2's task, filled in by Gail pending BE2
    availability - see dev log 2026-08-11). Fields explicitly requested:
    subject, lesson, bloom_level, question_type, usage_count - plus
    supporting fields needed to make those meaningful (traceability,
    generation provenance, approval status, duplicate-detection embedding
    ref), drawn from Algorithm-for-ai-assisted-generation.txt and
    major-module-features.txt.

    bloom_level and question_type are real Postgres enums, not strings -
    both are settled, low-churn value sets (Bloom's Taxonomy is a fixed
    academic standard; MCQ/True-False are the only question types this
    project accommodates per team decision 2026-08-11). Adding a new enum
    value later (e.g. a third question type) is a cheap ALTER TYPE ADD
    VALUE migration with no data migration needed - removing/renaming a
    value would be the expensive direction, which isn't anticipated here.

    Deliberately no relationship() to Subject/MaterialChunk - plain FK
    only, add relationship() later once coordinated with BE2/whoever else
    touches those models.
    """

    __tablename__ = "question_bank"

    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )

    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subjects.subject_id"),
        nullable=False,
        index=True,
    )

    # Free-text, populated automatically from the source LearningMaterial's
    # lesson_label at generation time (per prof's LM checklist selection),
    # not manually typed. Matches LearningMaterial.lesson_label's own
    # free-text pattern - no normalized Lesson entity exists yet.
    lesson: Mapped[str] = mapped_column(String(150), nullable=False)

    question_text: Mapped[str] = mapped_column(Text, nullable=False)

    bloom_level: Mapped[BloomLevel] = mapped_column(
        SAEnum(BloomLevel, name="bloom_level_enum", native_enum=True),
        nullable=False,
    )

    question_type: Mapped[QuestionType] = mapped_column(
        SAEnum(QuestionType, name="question_type_enum", native_enum=True),
        nullable=False,
    )

    # MCQ choices + answer key. JSONB chosen over a separate Choices table
    # for Week 4 scope - no per-choice analytics needed per
    # item-analysis-workflow.txt (P-value/mastery only, no discrimination
    # index/distractor effectiveness in core scope).
    choices: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    correct_answer: Mapped[str] = mapped_column(Text, nullable=False)

    # Anti-repetition tracking, per roadmap Week 5 "least-used tracking
    # column + index". Incremented each time this question is pulled into
    # an assembled exam.
    usage_count: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    # "ai_generated" | "manual" - per major-module-features.txt items 1a/1b.
    source: Mapped[str] = mapped_column(String(20), nullable=False)

    # Traceability to the source material chunk this question was
    # generated from - nullable since manually-uploaded questions have no
    # single source chunk. Per Week 9 Question Traceability roadmap item.
    # No existing traceability design to align with as of 2026-08-11.
    source_chunk_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("material_chunks.chunk_id"),
        nullable=True,
    )

    # Faculty Review workflow status, per Algorithm-for-ai-assisted-
    # generation.txt ("Faculty Review -> Save to Question Bank").
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="pending", server_default="pending"
    )

    # Duplicate-detection embedding ref - same pattern as MaterialChunk,
    # per AI_PROVIDER_ABSTRACTION.md. Nullable since a freshly-inserted
    # manual question may not be embedded yet.
    chroma_vector_id: Mapped[str | None] = mapped_column(
        String(64), nullable=True, unique=True
    )
    embedding_model: Mapped[str | None] = mapped_column(String(100), nullable=True)
    embedding_dimension: Mapped[int | None] = mapped_column(Integer, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )