from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime
from typing import Any
from app.modules.syllabus.models import SyllabusStatus


class ReviewerInfo(BaseModel):
    name: str = ""
    title: str = ""
    org: str = ""


class ApprovalInfo(BaseModel):
    approver_name: str = ""
    date: str = ""           # "2025-09-25"
    council_date: str = ""
    council_number: str = ""


class SyllabusCreateRequest(BaseModel):
    title: str
    course_code: str
    credit_hours: int
    description: str | None = None
    objectives: str | None = None
    content: dict[str, Any] | None = None

    # Asosiy ma'lumotlar
    department: str | None = None
    faculty: str | None = None
    specialization: str | None = None
    academic_year: str | None = None
    semester: int | None = None
    language: str | None = None
    prerequisites: str | None = None

    # Soatlar taqsimoti
    lecture_hours: int | None = None
    practice_hours: int | None = None
    lab_hours: int | None = None
    self_study_hours: int | None = None

    # Baholash
    grading_policy: dict[str, Any] | None = None
    attendance_policy: str | None = None
    passing_grade: int | None = None

    # Resurslar
    textbooks: list[dict[str, Any]] | None = None
    online_resources: list[dict[str, Any]] | None = None

    # Kompetensiyalar
    learning_outcomes: list[str] | None = None
    competencies: list[str] | None = None

    # TIU meta (migration 004)
    instructor_phone: str | None = None
    office_hours: str | None = None
    reviewer_1: ReviewerInfo | None = None
    reviewer_2: ReviewerInfo | None = None
    approval_info: ApprovalInfo | None = None

    @field_validator("credit_hours")
    @classmethod
    def credit_hours_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Credit hours must be positive")
        return v

    @field_validator("title", "course_code")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()


class SyllabusUpdateRequest(BaseModel):
    title: str | None = None
    course_code: str | None = None
    credit_hours: int | None = None
    description: str | None = None
    objectives: str | None = None
    content: dict[str, Any] | None = None

    # Asosiy ma'lumotlar
    department: str | None = None
    faculty: str | None = None
    specialization: str | None = None
    academic_year: str | None = None
    semester: int | None = None
    language: str | None = None
    prerequisites: str | None = None

    # Soatlar taqsimoti
    lecture_hours: int | None = None
    practice_hours: int | None = None
    lab_hours: int | None = None
    self_study_hours: int | None = None

    # Baholash
    grading_policy: dict[str, Any] | None = None
    attendance_policy: str | None = None
    passing_grade: int | None = None

    # Resurslar
    textbooks: list[dict[str, Any]] | None = None
    online_resources: list[dict[str, Any]] | None = None

    # Kompetensiyalar
    learning_outcomes: list[str] | None = None
    competencies: list[str] | None = None

    # TIU meta (migration 004)
    instructor_phone: str | None = None
    office_hours: str | None = None
    reviewer_1: ReviewerInfo | None = None
    reviewer_2: ReviewerInfo | None = None
    approval_info: ApprovalInfo | None = None

    @field_validator("credit_hours")
    @classmethod
    def credit_hours_positive(cls, v: int | None) -> int | None:
        if v is not None and v <= 0:
            raise ValueError("Credit hours must be positive")
        return v


class SyllabusReviewRequest(BaseModel):
    action: str  # "approve" or "reject"
    comment: str | None = None

    @field_validator("action")
    @classmethod
    def valid_action(cls, v: str) -> str:
        if v not in ("approve", "reject"):
            raise ValueError("Action must be 'approve' or 'reject'")
        return v


class SyllabusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    course_code: str
    credit_hours: int
    description: str | None
    objectives: str | None
    content: dict[str, Any] | None
    status: SyllabusStatus
    university_id: UUID
    created_by: UUID
    reviewed_by: UUID | None
    review_comment: str | None
    reviewed_at: datetime | None
    created_at: datetime
    updated_at: datetime

    # Asosiy ma'lumotlar
    department: str | None = None
    faculty: str | None = None
    specialization: str | None = None
    academic_year: str | None = None
    semester: int | None = None
    language: str | None = None
    prerequisites: str | None = None

    # Soatlar taqsimoti
    lecture_hours: int | None = None
    practice_hours: int | None = None
    lab_hours: int | None = None
    self_study_hours: int | None = None

    # Baholash
    grading_policy: dict[str, Any] | None = None
    attendance_policy: str | None = None
    passing_grade: int | None = None

    # Resurslar
    textbooks: list[dict[str, Any]] | None = None
    online_resources: list[dict[str, Any]] | None = None

    # Kompetensiyalar
    learning_outcomes: list[str] | None = None
    competencies: list[str] | None = None

    # TIU meta (migration 004)
    instructor_phone: str | None = None
    office_hours: str | None = None
    reviewer_1: ReviewerInfo | None = None
    reviewer_2: ReviewerInfo | None = None
    approval_info: ApprovalInfo | None = None


class SyllabusListResponse(BaseModel):
    items: list[SyllabusResponse]
    total: int
    page: int
    size: int


class SyllabusVersionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    syllabus_id: UUID
    version_number: int
    snapshot: dict[str, Any]
    changed_by: UUID
    created_at: datetime
