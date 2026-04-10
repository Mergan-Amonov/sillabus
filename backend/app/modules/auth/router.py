from fastapi import APIRouter, Depends, Request, Response, status, Cookie
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.core.config import settings
from app.core.database import get_db
from app.core.deps import get_current_active_user, require_super_admin
from app.modules.auth import service
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    UniversityCreateRequest,
    UniversityResponse,
    UpdateApiKeyRequest,
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    UserListResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])

_SECURE = settings.APP_ENV == "production"
_ACCESS_MAX_AGE = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
_REFRESH_MAX_AGE = settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600


def _set_auth_cookies(response: Response, access_token: str, refresh_token: str) -> None:
    response.set_cookie(
        key="sb_access_token",
        value=access_token,
        httponly=True,
        secure=_SECURE,
        samesite="strict",
        max_age=_ACCESS_MAX_AGE,
        path="/",
    )
    response.set_cookie(
        key="sb_refresh_token",
        value=refresh_token,
        httponly=True,
        secure=_SECURE,
        samesite="strict",
        max_age=_REFRESH_MAX_AGE,
        path="/api/v1/auth/refresh",
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(key="sb_access_token", path="/")
    response.delete_cookie(key="sb_refresh_token", path="/api/v1/auth/refresh")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user = await service.register_user(body, db, ip_address=request.client.host if request.client else None)
    return user


@router.post("/login", response_model=UserResponse)
async def login(
    body: UserLoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    token_data = await service.login_user(
        body.email, body.password, db,
        ip_address=request.client.host if request.client else None,
    )
    _set_auth_cookies(response, token_data.access_token, token_data.refresh_token)
    result = await service.get_user_by_email(body.email, db)
    return UserResponse.from_user(result)


@router.post("/refresh", response_model=UserResponse)
async def refresh(
    response: Response,
    db: AsyncSession = Depends(get_db),
    sb_refresh_token: Annotated[str | None, Cookie()] = None,
):
    if not sb_refresh_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token missing")
    token_data = await service.refresh_tokens(sb_refresh_token, db)
    _set_auth_cookies(response, token_data.access_token, token_data.refresh_token)
    user = await service.get_user_by_token(token_data.access_token, db)
    return UserResponse.from_user(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    sb_refresh_token: Annotated[str | None, Cookie()] = None,
):
    if sb_refresh_token:
        await service.logout_user(sb_refresh_token, db)
    _clear_auth_cookies(response)


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_active_user)):
    return UserResponse.from_user(current_user)


@router.patch("/me/api-key", response_model=UserResponse)
async def update_api_key(
    body: UpdateApiKeyRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    if body.openai_api_key is not None:
        from app.core.encryption import encrypt_value
        current_user.openai_api_key_encrypted = encrypt_value(body.openai_api_key) if body.openai_api_key else None
    current_user.ai_base_url = body.ai_base_url or None
    current_user.ai_model = body.ai_model or None
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.from_user(current_user)


# ── Admin: User management ────────────────────────────────────────────────────
@router.get("/users", response_model=UserListResponse)
async def list_users(
    page: int = 1,
    size: int = 20,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    items, total = await service.admin_list_users(db, page, size)
    return UserListResponse(items=[UserResponse.from_user(u) for u in items], total=total)


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: AdminCreateUserRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user = await service.admin_create_user(body, db)
    await db.commit()
    await db.refresh(user)
    return UserResponse.from_user(user)


@router.patch("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    body: AdminUpdateUserRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    user = await service.admin_update_user(user_id, body, db)
    await db.commit()
    await db.refresh(user)
    return UserResponse.from_user(user)


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    await service.admin_delete_user(user_id, db)
    await db.commit()


# Super admin only
@router.post("/universities", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
async def create_university(
    body: UniversityCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    return await service.create_university(body, db)
