from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_active_user, require_teacher
from app.modules.auth.models import User
from app.modules.syllabus import service
from app.modules.syllabus.models import SyllabusStatus
from app.modules.syllabus.schemas import (
    SyllabusCreateRequest,
    SyllabusUpdateRequest,
    SyllabusReviewRequest,
    SyllabusResponse,
    SyllabusListResponse,
    SyllabusVersionResponse,
)

router = APIRouter(prefix="/syllabuses", tags=["Syllabus"])


@router.post("", response_model=SyllabusResponse, status_code=status.HTTP_201_CREATED)
async def create(
    body: SyllabusCreateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return await service.create_syllabus(body, current_user, db)


@router.get("", response_model=SyllabusListResponse)
async def list_all(
    status_filter: SyllabusStatus | None = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    items, total = await service.list_syllabuses(current_user, db, status_filter, page, size)
    return SyllabusListResponse(items=items, total=total, page=page, size=size)


@router.get("/{syllabus_id}", response_model=SyllabusResponse)
async def get_one(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await service.get_syllabus(syllabus_id, current_user, db)


@router.patch("/{syllabus_id}", response_model=SyllabusResponse)
async def update(
    syllabus_id: UUID,
    body: SyllabusUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await service.update_syllabus(syllabus_id, body, current_user, db)


@router.delete("/{syllabus_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    await service.delete_syllabus(syllabus_id, current_user, db)


@router.post("/{syllabus_id}/submit", response_model=SyllabusResponse)
async def submit(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_teacher),
):
    return await service.submit_for_review(syllabus_id, current_user, db)


@router.post("/{syllabus_id}/review", response_model=SyllabusResponse)
async def review(
    syllabus_id: UUID,
    body: SyllabusReviewRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await service.review_syllabus(syllabus_id, body, current_user, db)


@router.get("/{syllabus_id}/versions", response_model=list[SyllabusVersionResponse])
async def versions(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await service.get_versions(syllabus_id, current_user, db)
