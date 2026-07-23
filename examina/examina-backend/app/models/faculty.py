import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Faculty(Base):
    """Replaces the old `User` model. Renamed + reshaped to match ERD V5's
    Faculty table — see CHANGES_FACULTY_MIGRATION.md for the full diff."""

    __tablename__ = "faculty"

    faculty_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # CHANGED: replaces `username`. Login identity is now email.
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # CHANGED: renamed from `hashed_password` to match ERD column name.
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)

    first_name: Mapped[str] = mapped_column(String(128), nullable=False)
    last_name: Mapped[str] = mapped_column(String(128), nullable=False)

    # NEW: single value ("faculty") for now, no branching logic yet.
    # Server-assigned only — never settable from RegisterRequest.
    role: Mapped[str] = mapped_column(String(32), nullable=False, default="faculty", server_default="faculty")

    # NEW: column exists, NOT enforced at login yet (per team decision —
    # revisit when there's an actual reason to deactivate an account, e.g.
    # an admin panel). Search "status-check" in routers/auth.py for the spot
    # to wire it in later.
    status: Mapped[str] = mapped_column(String(32), nullable=False, default="active", server_default="active")

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False
    )

    # NEW
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="faculty", cascade="all, delete-orphan"
    )
