"""add is_archived to learning_materials

Revision ID: 45c754783b46
Revises: 52d6a134baef
Create Date: 2026-08-06 01:43:03.469615
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "45c754783b46"
down_revision: Union[str, None] = "52d6a134baef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "learning_materials",
        sa.Column(
            "is_archived",
            sa.Boolean(),
            nullable=False,
            server_default=sa.false(),
        ),
    )


def downgrade() -> None:
    op.drop_column("learning_materials", "is_archived")