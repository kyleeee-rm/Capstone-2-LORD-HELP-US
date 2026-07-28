import uuid
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class LearningMaterial(Base):
    """Matches ERD's LearningMaterials table, with two additions the ERD
        doesn't have — both flagged, not silently snuck in. See
        CHANGES_MATERIALS_MODULE.md for the full rationale.

        Deliberately has NO relationship() to SubjectFolder or Faculty. Those
        models are owned by teammates and adding a relationship here requires a
        matching back_populates on their side — get that wrong and the mapper
        fails at first use, not at import time, which makes it a nasty bug to
        trace. Plain FK columns only for now; add relationships later once
        coordinated with whoever owns subject_folder.py.
        """

    __tablename__ = "learning_materials"

    material_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    folder_id: Mapped[uuid.UUID] = mapped_column(
    UUID(as_uuid=True), ForeignKey("subject_folders.folder_id"), nullable=False, index=True
    )
    faculty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("faculty.faculty_id"), nullable=False
    )

    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Stored in bytes, exactly (Numeric, not Float) - ERD just says "decimal"
    # with no unit specified. Bytes is my assumption; flag with ERD owner.
    file_size: Mapped[Decimal] = mapped_column(Numeric(precision=12, scale=0), nullable=False)
    total_pages: Mapped[int | None] = mapped_column(Integer, nullable=True)
    teaching_hours: Mapped[Decimal] = mapped_column(Numeric(precision=5, scale=2), nullable=False)

    # ADDITION (not in ERD): optional lesson tag at upload time. Distinct
    # from MaterialChunks.lesson_name, which is chunk-level and can differ
    # per chunk once Week 4 chunking runs - this is just the faculty's
    # upload-time hint/default.
    lesson_label: Mapped[str | None] = mapped_column(String(100), nullable=True)

    # ADDITION (not in ERD): ERD has no column for where the file actually
    # lives. Needed internally so Week 4 extraction can find the bytes.
    # NEVER exposed in API responses - see schemas/materials.py.
    storage_path: Mapped[str] = mapped_column(String(500), nullable=False)

    upload_status: Mapped[str] = mapped_column(
        String(32), nullable=False, default="uploaded", server_default="uploaded"
    )
    error_log: Mapped[str | None] = mapped_column(Text, nullable=True)

    uploaded_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
