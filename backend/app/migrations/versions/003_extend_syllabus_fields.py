"""Extend syllabus with department, hours, grading, resources, competencies

Revision ID: 003
Revises: 002
Create Date: 2025-04-08
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision: str = "003"
down_revision: str = "002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Asosiy ma'lumotlar
    op.add_column("syllabuses", sa.Column("department", sa.String(255), nullable=True))
    op.add_column("syllabuses", sa.Column("faculty", sa.String(255), nullable=True))
    op.add_column("syllabuses", sa.Column("specialization", sa.String(255), nullable=True))
    op.add_column("syllabuses", sa.Column("academic_year", sa.String(20), nullable=True))
    op.add_column("syllabuses", sa.Column("semester", sa.Integer, nullable=True))
    op.add_column("syllabuses", sa.Column("language", sa.String(20), nullable=True))
    op.add_column("syllabuses", sa.Column("prerequisites", sa.Text, nullable=True))

    # Soatlar taqsimoti
    op.add_column("syllabuses", sa.Column("lecture_hours", sa.Integer, nullable=True))
    op.add_column("syllabuses", sa.Column("practice_hours", sa.Integer, nullable=True))
    op.add_column("syllabuses", sa.Column("lab_hours", sa.Integer, nullable=True))
    op.add_column("syllabuses", sa.Column("self_study_hours", sa.Integer, nullable=True))

    # Baholash
    op.add_column("syllabuses", sa.Column("grading_policy", JSONB, nullable=True))
    op.add_column("syllabuses", sa.Column("attendance_policy", sa.Text, nullable=True))
    op.add_column("syllabuses", sa.Column("passing_grade", sa.Integer, nullable=True, server_default="55"))

    # Resurslar
    op.add_column("syllabuses", sa.Column("textbooks", JSONB, nullable=True))
    op.add_column("syllabuses", sa.Column("online_resources", JSONB, nullable=True))

    # Kompetensiyalar
    op.add_column("syllabuses", sa.Column("learning_outcomes", JSONB, nullable=True))
    op.add_column("syllabuses", sa.Column("competencies", JSONB, nullable=True))


def downgrade() -> None:
    op.drop_column("syllabuses", "competencies")
    op.drop_column("syllabuses", "learning_outcomes")
    op.drop_column("syllabuses", "online_resources")
    op.drop_column("syllabuses", "textbooks")
    op.drop_column("syllabuses", "passing_grade")
    op.drop_column("syllabuses", "attendance_policy")
    op.drop_column("syllabuses", "grading_policy")
    op.drop_column("syllabuses", "self_study_hours")
    op.drop_column("syllabuses", "lab_hours")
    op.drop_column("syllabuses", "practice_hours")
    op.drop_column("syllabuses", "lecture_hours")
    op.drop_column("syllabuses", "prerequisites")
    op.drop_column("syllabuses", "language")
    op.drop_column("syllabuses", "semester")
    op.drop_column("syllabuses", "academic_year")
    op.drop_column("syllabuses", "specialization")
    op.drop_column("syllabuses", "faculty")
    op.drop_column("syllabuses", "department")
