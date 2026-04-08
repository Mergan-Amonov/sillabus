from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_super_admin
from app.modules.auth import service
from app.modules.auth.models import User
from app.modules.auth.schemas import (
    UserRegisterRequest,
    UserLoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    UniversityCreateRequest,
    UniversityResponse,
    UpdateApiKeyRequest,
    AdminCreateUserRequest,
    AdminUpdateUserRequest,
    UserListResponse,
)

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: UserRegisterRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user = await service.register_user(body, db, ip_address=request.client.host if request.client else None)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(
    body: UserLoginRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    return await service.login_user(
        body.email, body.password, db,
        ip_address=request.client.host if request.client else None,
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    return await service.refresh_tokens(body.refresh_token, db)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(body: RefreshTokenRequest, db: AsyncSession = Depends(get_db)):
    await service.logout_user(body.refresh_token, db)


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
        current_user.openai_api_key = body.openai_api_key or None
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
