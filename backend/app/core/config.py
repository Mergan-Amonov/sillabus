from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyHttpUrl, field_validator
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    APP_NAME: str = "SilaBuys"
    APP_ENV: str = "development"
    DEBUG: bool = False
    SECRET_KEY: str

    # Database
    DATABASE_URL: str
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "silabuys"
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str

    # JWT
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis
    REDIS_URL: str = "redis://localhost:6379/0"

    # MinIO
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET_NAME: str = "silabuys"
    MINIO_USE_SSL: bool = False

    # AI — default: local Ollama (no key required)
    # Set OPENAI_API_KEY to use a cloud provider instead
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "llama3.2"
    OPENAI_BASE_URL: str = "http://host.docker.internal:11434/v1"
    OPENAI_MAX_TOKENS: int = 8192
    AI_RATE_LIMIT_PER_HOUR: int = 100

    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @field_validator("ALLOWED_ORIGINS", mode="before")
    @classmethod
    def parse_origins(cls, v: str) -> str:
        return v

    def get_allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]

    # Encryption (Fernet key for sensitive fields)
    ENCRYPTION_KEY: str = ""

    # First super admin (seed)
    FIRST_SUPERADMIN_EMAIL: str = "admin@silabuys.uz"
    FIRST_SUPERADMIN_PASSWORD: str


settings = Settings()
