import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import String, Text, DateTime, Enum, ForeignKey, Integer, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class SyllabusStatus(str, enum.Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"


class Syllabus(Base):
    __tablename__ = "syllabuses"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    course_code: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    credit_hours: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    objectives: Mapped[str | None] = mapped_column(Text, nullable=True)
    content: Mapped[dict | None] = mapped_column(JSON, nullable=True)  # structured content

    # Asosiy ma'lumotlar
    department: Mapped[str | None] = mapped_column(String(255), nullable=True)
    faculty: Mapped[str | None] = mapped_column(String(255), nullable=True)
    specialization: Mapped[str | None] = mapped_column(String(255), nullable=True)
    academic_year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    semester: Mapped[int | None] = mapped_column(Integer, nullable=True)
    language: Mapped[str | None] = mapped_column(String(20), nullable=True)
    prerequisites: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Soatlar taqsimoti
    lecture_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    practice_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    lab_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)
    self_study_hours: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Baholash
    grading_policy: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    attendance_policy: Mapped[str | None] = mapped_column(Text, nullable=True)
    passing_grade: Mapped[int | None] = mapped_column(Integer, nullable=True, default=55)

    # Resurslar
    textbooks: Mapped[list | None] = mapped_column(JSON, nullable=True)
    online_resources: Mapped[list | None] = mapped_column(JSON, nullable=True)

    # Kompetensiyalar
    learning_outcomes: Mapped[list | None] = mapped_column(JSON, nullable=True)
    competencies: Mapped[list | None] = mapped_column(JSON, nullable=True)

    status: Mapped[SyllabusStatus] = mapped_column(
        Enum(SyllabusStatus, values_callable=lambda obj: [e.value for e in obj]),
        default=SyllabusStatus.DRAFT,
        nullable=False,
        index=True,
    )
    university_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False, index=True)
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=False
    )
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id"), nullable=True
    )
    review_comment: Mapped[str | None] = mapped_column(Text, nullable=True)
    reviewed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    creator = relationship("User", foreign_keys=[created_by])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
    versions: Mapped[list["SyllabusVersion"]] = relationship(
        "SyllabusVersion", back_populates="syllabus", cascade="all, delete-orphan"
    )


class SyllabusVersion(Base):
    """Immutable version snapshot — no updates, only inserts."""
    __tablename__ = "syllabus_versions"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    syllabus_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("syllabuses.id", ondelete="CASCADE"), nullable=False, index=True
    )
    version_number: Mapped[int] = mapped_column(Integer, nullable=False)
    snapshot: Mapped[dict] = mapped_column(JSON, nullable=False)  # full data snapshot
    changed_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    syllabus: Mapped[Syllabus] = relationship("Syllabus", back_populates="versions")
