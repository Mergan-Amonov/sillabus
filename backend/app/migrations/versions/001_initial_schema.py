"""Initial schema: users, universities, syllabuses, audit_log

Revision ID: 001
Revises:
Create Date: 2026-04-07
"""
from typing import Sequence, Union
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Universities ────────────────────────────────────────────────────────
    op.create_table(
        "universities",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("slug", sa.String(100), nullable=False),
        sa.Column("schema_name", sa.String(63), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("slug"),
        sa.UniqueConstraint("schema_name"),
    )

    # ── Users ────────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("email", sa.String(255), nullable=False),
        sa.Column("hashed_password", sa.String(255), nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("role", sa.Enum("super_admin", "university_admin", "reviewer", "teacher", name="userrole"), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("university_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["university_id"], ["universities.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    # ── Refresh Tokens ───────────────────────────────────────────────────────
    op.create_table(
        "refresh_tokens",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("token", sa.Text(), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("revoked", sa.Boolean(), nullable=False, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("token"),
    )
    op.create_index("ix_refresh_tokens_token", "refresh_tokens", ["token"])

    # ── Syllabuses ───────────────────────────────────────────────────────────
    op.create_table(
        "syllabuses",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("title", sa.String(500), nullable=False),
        sa.Column("course_code", sa.String(50), nullable=False),
        sa.Column("credit_hours", sa.Integer(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("objectives", sa.Text(), nullable=True),
        sa.Column("content", postgresql.JSON(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "status",
            sa.Enum("draft", "pending_review", "approved", "rejected", "archived", name="syllabusstatus"),
            nullable=False,
            server_default="draft",
        ),
        sa.Column("university_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("reviewed_by", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("review_comment", sa.Text(), nullable=True),
        sa.Column("reviewed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
        sa.ForeignKeyConstraint(["reviewed_by"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_syllabuses_course_code", "syllabuses", ["course_code"])
    op.create_index("ix_syllabuses_status", "syllabuses", ["status"])
    op.create_index("ix_syllabuses_university_id", "syllabuses", ["university_id"])

    # ── Syllabus Versions ────────────────────────────────────────────────────
    op.create_table(
        "syllabus_versions",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("syllabus_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("version_number", sa.Integer(), nullable=False),
        sa.Column("snapshot", postgresql.JSON(astext_type=sa.Text()), nullable=False),
        sa.Column("changed_by", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["syllabus_id"], ["syllabuses.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_syllabus_versions_syllabus_id", "syllabus_versions", ["syllabus_id"])

    # ── Audit Log (append-only) ──────────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id", postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("resource_type", sa.String(100), nullable=False),
        sa.Column("resource_id", sa.String(255), nullable=True),
        sa.Column("details", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )

    # ── RLS Policies ─────────────────────────────────────────────────────────
    op.execute("ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY")
    op.execute("""
        CREATE POLICY audit_log_insert_only ON audit_logs
        FOR INSERT WITH CHECK (true)
    """)
    op.execute("""
        CREATE POLICY audit_log_select ON audit_logs
        FOR SELECT USING (true)
    """)
    # Prevent UPDATE and DELETE at DB level
    op.execute("""
        CREATE RULE audit_log_no_update AS ON UPDATE TO audit_logs DO INSTEAD NOTHING
    """)
    op.execute("""
        CREATE RULE audit_log_no_delete AS ON DELETE TO audit_logs DO INSTEAD NOTHING
    """)


def downgrade() -> None:
    op.execute("DROP RULE IF EXISTS audit_log_no_delete ON audit_logs")
    op.execute("DROP RULE IF EXISTS audit_log_no_update ON audit_logs")
    op.execute("ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY")
    op.drop_table("audit_logs")
    op.drop_index("ix_syllabus_versions_syllabus_id", "syllabus_versions")
    op.drop_table("syllabus_versions")
    op.drop_index("ix_syllabuses_university_id", "syllabuses")
    op.drop_index("ix_syllabuses_status", "syllabuses")
    op.drop_index("ix_syllabuses_course_code", "syllabuses")
    op.drop_table("syllabuses")
    op.drop_index("ix_refresh_tokens_token", "refresh_tokens")
    op.drop_table("refresh_tokens")
    op.drop_index("ix_users_email", "users")
    op.drop_table("users")
    op.drop_table("universities")
    op.execute("DROP TYPE IF EXISTS syllabusstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
