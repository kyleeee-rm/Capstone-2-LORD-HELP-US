"""create learning_materials table

Revision ID: ebbea10a9fac
Revises: ffeb468455d5
Create Date: 2026-07-27 00:00:00

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "ebbea10a9fac"
down_revision: Union[str, None] = "ffeb468455d5"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "learning_materials",
        sa.Column("material_id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "subject_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("subjects.subject_id"), nullable=False
        ),
        sa.Column(
            "faculty_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("faculty.faculty_id"), nullable=False
        ),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("file_name", sa.String(length=255), nullable=False),
        sa.Column("file_type", sa.String(length=100), nullable=False),
        sa.Column("file_size", sa.Numeric(precision=12, scale=0), nullable=False),
        sa.Column("total_pages", sa.Integer(), nullable=True),
        sa.Column("teaching_hours", sa.Numeric(precision=5, scale=2), nullable=False),
        sa.Column("lesson_label", sa.String(length=100), nullable=True),
        sa.Column("storage_path", sa.String(length=500), nullable=False),
        sa.Column("upload_status", sa.String(length=32), nullable=False, server_default="uploaded"),
        sa.Column("error_log", sa.Text(), nullable=True),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_learning_materials_subject_id", "learning_materials", ["subject_id"])


def downgrade() -> None:
    op.drop_index("ix_learning_materials_subject_id", table_name="learning_materials")
    op.drop_table("learning_materials")
