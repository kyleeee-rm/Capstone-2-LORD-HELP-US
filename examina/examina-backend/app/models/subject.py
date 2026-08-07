import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Subject(Base):
    __tablename__ = "subjects"

    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    faculty_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("faculty.faculty_id"),
        nullable=False,
    )

    subject_code: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    subject_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    course: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
    )

    year_level: Mapped[str] = mapped_column(
    String(50),
    nullable=False,
    )

    semester: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    academic_year: Mapped[str] = mapped_column(
    String(20),
    nullable=False,
    )

    is_archived: Mapped[bool] = mapped_column(
    Boolean,
    default=False,
    nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    default=lambda: datetime.now(timezone.utc),
    nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    faculty: Mapped["Faculty"] = relationship(
        back_populates="subjects",
    )

    folders: Mapped[list["SubjectFolder"]] = relationship(
        back_populates="subject",
        cascade="all, delete-orphan",
    )