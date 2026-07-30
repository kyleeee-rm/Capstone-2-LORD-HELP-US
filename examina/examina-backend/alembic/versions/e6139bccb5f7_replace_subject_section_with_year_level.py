"""replace subject section with year_level

Revision ID: e6139bccb5f7
Revises: dc4a6c0a6363
Create Date: 2026-07-30 06:17:28.579843

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = 'e6139bccb5f7'
down_revision: Union[str, None] = 'dc4a6c0a6363'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_column("subjects", "section")
    op.add_column(
        "subjects",
        sa.Column("year_level", sa.String(length=50), nullable=False, server_default="1"),
    )
    op.alter_column("subjects", "year_level", server_default=None)


def downgrade() -> None:
    op.add_column(
        "subjects",
        sa.Column("section", sa.String(length=50), nullable=False, server_default="TBD"),
    )
    op.alter_column("subjects", "section", server_default=None)
    op.drop_column("subjects", "year_level")
