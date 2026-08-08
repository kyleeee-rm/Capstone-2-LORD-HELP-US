import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class MaterialChunk(Base):
    """One row per text chunk produced during Week 4's extraction pipeline.
    Deliberately no relationship() to LearningMaterial for the same reason
    as learning_materials.py — plain FK only, add relationship() later once
    coordinated with whoever else touches this model.
    """

    __tablename__ = "material_chunks"

    chunk_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=uuid.uuid4
    )
    material_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("learning_materials.material_id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    chunk_index: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    page_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    # "page" for PDF-sourced chunks (real page numbers from PyMuPDF), or
    # "section" for DOCX-sourced chunks (heading-based counter — DOCX has
    # no native page concept). Lets FE render "Page 3" vs "Section 3"
    # correctly instead of mislabeling DOCX citations as real pages.
    locator_type: Mapped[str] = mapped_column(String(10), nullable=False, server_default="page")
    # Correlates this row to its vector in ChromaDB.
    chroma_vector_id: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    # Tagged per AI_PROVIDER_ABSTRACTION.md's checklist — lets us detect
    # mismatched vectors if the provider changes later.
    embedding_model: Mapped[str] = mapped_column(String(100), nullable=False)
    embedding_dimension: Mapped[int] = mapped_column(Integer, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )
