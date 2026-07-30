"""retarget learning_materials to subject_folders

Revision ID: dc4a6c0a6363
Revises: c9d3cf92d551
Create Date: 2026-07-28 05:42:19.310448

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'dc4a6c0a6363'
down_revision: Union[str, None] = 'c9d3cf92d551'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_constraint("learning_materials_subject_id_fkey", "learning_materials", type_="foreignkey")
    op.drop_index("ix_learning_materials_subject_id", table_name="learning_materials")
    op.drop_column("learning_materials", "subject_id")

    op.add_column(
        "learning_materials",
        sa.Column("folder_id", postgresql.UUID(as_uuid=True), nullable=False),
    )
    op.create_foreign_key(
        "learning_materials_folder_id_fkey",
        "learning_materials",
        "subject_folders",
        ["folder_id"],
        ["folder_id"],
    )
    op.create_index("ix_learning_materials_folder_id", "learning_materials", ["folder_id"])


def downgrade() -> None:
    op.drop_index("ix_learning_materials_folder_id", table_name="learning_materials")
    op.drop_constraint("learning_materials_folder_id_fkey", "learning_materials", type_="foreignkey")
    op.drop_column("learning_materials", "folder_id")

    op.add_column(
        "learning_materials",
        sa.Column("subject_id", postgresql.UUID(as_uuid=True), nullable=False),
    )
    op.create_foreign_key(
        "learning_materials_subject_id_fkey",
        "learning_materials",
        "subjects",
        ["subject_id"],
        ["subject_id"],
    )
    op.create_index("ix_learning_materials_subject_id", "learning_materials", ["subject_id"])