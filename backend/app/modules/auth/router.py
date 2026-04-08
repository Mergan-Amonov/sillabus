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


# Super admin only
@router.post("/universities", response_model=UniversityResponse, status_code=status.HTTP_201_CREATED)
async def create_university(
    body: UniversityCreateRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_super_admin),
):
    return await service.create_university(body, db)
