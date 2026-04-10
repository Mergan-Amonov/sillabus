from pydantic import BaseModel, field_validator


class AISyllabusGenerateRequest(BaseModel):
    course_title: str
    course_code: str
    credit_hours: int
    level: str = "undergraduate"
    department: str | None = None
    faculty: str | None = None
    language: str = "uzbek"
    semester: int | None = None
    academic_year: str | None = None
    lecture_hours: int | None = None
    practice_hours: int | None = None
    lab_hours: int | None = None
    self_study_hours: int | None = None
    prerequisites: str | None = None
    instructions: str | None = None
    additional_requirements: str | None = None

    @field_validator("course_title", "course_code")
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Field cannot be empty")
        return v.strip()

    @field_validator("credit_hours")
    @classmethod
    def positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("Credit hours must be positive")
        return v

    @field_validator("level")
    @classmethod
    def valid_level(cls, v: str) -> str:
        allowed = ("undergraduate", "graduate", "doctoral")
        if v not in allowed:
            raise ValueError(f"Level must be one of: {', '.join(allowed)}")
        return v

    @field_validator("language")
    @classmethod
    def valid_language(cls, v: str) -> str:
        allowed = ("uzbek", "russian", "english")
        if v not in allowed:
            raise ValueError(f"Language must be one of: {', '.join(allowed)}")
        return v


class AIGenerateResponse(BaseModel):
    prompt_version: str
    generated: dict
    mapped: dict | None = None
    tokens_used: int
