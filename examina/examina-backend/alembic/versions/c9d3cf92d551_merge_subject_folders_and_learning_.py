"""Merge subject folders and learning materials migrations

Revision ID: c9d3cf92d551
Revises: 27c7333810cb, ebbea10a9fac
Create Date: 2026-07-28 03:55:37.548382

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9d3cf92d551'
down_revision: Union[str, None] = ('27c7333810cb', 'ebbea10a9fac')
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
