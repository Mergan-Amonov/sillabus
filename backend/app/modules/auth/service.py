from datetime import datetime, timedelta, timezone
from uuid import UUID
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, text
from jose import JWTError

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_refresh_token,
)
from app.core.config import settings
from app.core.exceptions import ConflictError, NotFoundError, ForbiddenError
from app.modules.auth.models import User, University, RefreshToken, AuditLog, UserRole
from app.modules.auth.schemas import (
    UserRegisterRequest,
    TokenResponse,
    UniversityCreateRequest,
)


async def register_user(
    data: UserRegisterRequest,
    db: AsyncSession,
    ip_address: str | None = None,
) -> User:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise ConflictError("Email already registered")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=UserRole.TEACHER,
        university_id=data.university_id,
    )
    db.add(user)
    await db.flush()

    await _log(db, user.id, "register", "user", str(user.id), ip_address=ip_address)
    return user


async def login_user(
    email: str,
    password: str,
    db: AsyncSession,
    ip_address: str | None = None,
) -> TokenResponse:
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.hashed_password):
        raise ForbiddenError("Invalid credentials")

    access_token = create_access_token(
        str(user.id), extra={"role": user.role, "university_id": str(user.university_id) if user.university_id else None}
    )
    refresh_token_str = create_refresh_token(str(user.id))

    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(token=refresh_token_str, user_id=user.id, expires_at=expires_at))

    await _log(db, user.id, "login", "user", str(user.id), ip_address=ip_address)
    return TokenResponse(access_token=access_token, refresh_token=refresh_token_str)


async def refresh_tokens(refresh_token_str: str, db: AsyncSession) -> TokenResponse:
    try:
        user_id = verify_refresh_token(refresh_token_str)
    except JWTError:
        raise ForbiddenError("Invalid refresh token")

    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.token == refresh_token_str,
            RefreshToken.revoked == False,
            RefreshToken.expires_at > datetime.now(timezone.utc),
        )
    )
    stored = result.scalar_one_or_none()
    if not stored:
        raise ForbiddenError("Refresh token expired or revoked")

    stored.revoked = True

    result = await db.execute(select(User).where(User.id == UUID(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise ForbiddenError("User not found")

    new_access = create_access_token(
        str(user.id), extra={"role": user.role, "university_id": str(user.university_id) if user.university_id else None}
    )
    new_refresh = create_refresh_token(str(user.id))
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS)
    db.add(RefreshToken(token=new_refresh, user_id=user.id, expires_at=expires_at))

    return TokenResponse(access_token=new_access, refresh_token=new_refresh)


async def logout_user(refresh_token_str: str, db: AsyncSession) -> None:
    result = await db.execute(
        select(RefreshToken).where(RefreshToken.token == refresh_token_str, RefreshToken.revoked == False)
    )
    stored = result.scalar_one_or_none()
    if stored:
        stored.revoked = True


async def admin_create_user(data, db: AsyncSession) -> User:
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise ConflictError("Bu email allaqachon ro'yxatdan o'tgan")

    user = User(
        email=data.email,
        hashed_password=hash_password(data.password),
        full_name=data.full_name,
        role=data.role,
        university_id=data.university_id,
        is_active=data.is_active,
    )
    db.add(user)
    await db.flush()
    return user


async def admin_list_users(db: AsyncSession, page: int = 1, size: int = 20) -> tuple[list[User], int]:
    from sqlalchemy import func
    count_result = await db.execute(select(func.count()).select_from(User))
    total = count_result.scalar_one()
    result = await db.execute(
        select(User).order_by(User.created_at.desc()).offset((page - 1) * size).limit(size)
    )
    return result.scalars().all(), total


async def admin_update_user(user_id: str, data, db: AsyncSession) -> User:
    from uuid import UUID as _UUID
    result = await db.execute(select(User).where(User.id == _UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")
    if data.full_name is not None:
        user.full_name = data.full_name
    if data.role is not None:
        user.role = data.role
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.university_id is not None:
        user.university_id = data.university_id
    return user


async def admin_delete_user(user_id: str, db: AsyncSession) -> None:
    from uuid import UUID as _UUID
    result = await db.execute(select(User).where(User.id == _UUID(user_id)))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")
    await db.delete(user)


async def get_user_by_email(email: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.email == email, User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")
    return user


async def get_user_by_id(user_id: str, db: AsyncSession) -> User:
    result = await db.execute(select(User).where(User.id == UUID(user_id), User.is_active == True))
    user = result.scalar_one_or_none()
    if not user:
        raise NotFoundError("User")
    return user


async def get_user_by_token(access_token: str, db: AsyncSession) -> User:
    from app.core.security import verify_access_token
    user_id = verify_access_token(access_token)
    return await get_user_by_id(user_id, db)


async def list_universities(db: AsyncSession) -> list[University]:
    result = await db.execute(select(University).where(University.is_active == True).order_by(University.name))
    return result.scalars().all()


async def create_university(data: UniversityCreateRequest, db: AsyncSession) -> University:
    existing = await db.execute(select(University).where(University.slug == data.slug))
    if existing.scalar_one_or_none():
        raise ConflictError(f"University with slug '{data.slug}' already exists")

    schema_name = f"tenant_{data.slug.replace('-', '_')}"
    university = University(name=data.name, slug=data.slug, schema_name=schema_name)
    db.add(university)
    await db.flush()

    await db.execute(text(f"CREATE SCHEMA IF NOT EXISTS {schema_name}"))
    return university


async def _log(
    db: AsyncSession,
    user_id: UUID | None,
    action: str,
    resource_type: str,
    resource_id: str | None = None,
    details: str | None = None,
    ip_address: str | None = None,
) -> None:
    db.add(AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details,
        ip_address=ip_address,
    ))
