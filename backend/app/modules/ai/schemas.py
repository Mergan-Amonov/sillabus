from pydantic import BaseModel, field_validator


class AISyllabusGenerateRequest(BaseModel):
    course_title: str
    course_code: str
    credit_hours: int
    level: str = "undergraduate"
    department: str = ""
    instructions: str = ""

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


class AIGenerateResponse(BaseModel):
    prompt_version: str
    generated: dict
    tokens_used: int
