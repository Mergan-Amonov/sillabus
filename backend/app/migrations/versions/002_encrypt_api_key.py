"""Encrypt openai_api_key: rename column and resize

Revision ID: 002
Revises: 001
Create Date: 2025-04-08
"""
from alembic import op
import sqlalchemy as sa

revision: str = "002"
down_revision: str = "001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "users",
        "openai_api_key",
        new_column_name="openai_api_key_encrypted",
        existing_type=sa.String(255),
        type_=sa.String(512),
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "users",
        "openai_api_key_encrypted",
        new_column_name="openai_api_key",
        existing_type=sa.String(512),
        type_=sa.String(255),
        nullable=True,
    )
