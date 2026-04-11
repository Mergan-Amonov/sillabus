"""Add syllabus meta fields: instructor phone, office hours, reviewers, approval info

Revision ID: 004
Revises: 003
Create Date: 2026-04-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "004"
down_revision: str = "003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("syllabuses", sa.Column("instructor_phone", sa.String(50), nullable=True))
    op.add_column("syllabuses", sa.Column("office_hours", sa.String(500), nullable=True))
    op.add_column("syllabuses", sa.Column("reviewer_1", JSONB, nullable=True))
    op.add_column("syllabuses", sa.Column("reviewer_2", JSONB, nullable=True))
    op.add_column("syllabuses", sa.Column("approval_info", JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column("syllabuses", "approval_info")
    op.drop_column("syllabuses", "reviewer_2")
    op.drop_column("syllabuses", "reviewer_1")
    op.drop_column("syllabuses", "office_hours")
    op.drop_column("syllabuses", "instructor_phone")
