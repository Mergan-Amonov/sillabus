from pydantic import BaseModel, ConfigDict, field_validator
from uuid import UUID
from datetime import datetime
from typing import Any
from app.modules.syllabus.models import SyllabusStatus


class SyllabusCreateRequest(BaseModel):
    title: str
    course_code: str
    credit_hours: int
    description: str | None = None
    objectives: str | None = None
    content: dict[str, Any] | None = None

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
    credit_hours: int | None = None
    description: str | None = None
    objectives: str | None = None
    content: dict[str, Any] | None = None

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
