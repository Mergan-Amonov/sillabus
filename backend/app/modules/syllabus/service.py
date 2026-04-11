from uuid import UUID
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.exceptions import NotFoundError, ForbiddenError, AppException
from fastapi import status as http_status
from app.modules.auth.models import User, UserRole
from app.modules.syllabus.models import Syllabus, SyllabusStatus, SyllabusVersion
from app.modules.syllabus.schemas import (
    SyllabusCreateRequest,
    SyllabusUpdateRequest,
    SyllabusReviewRequest,
)


async def create_syllabus(
    data: SyllabusCreateRequest,
    user: User,
    db: AsyncSession,
) -> Syllabus:
    if not user.university_id:
        raise AppException(
            status_code=http_status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Foydalanuvchi universitetga biriktirilmagan. Syllabus yaratish uchun universitetga a'zo bo'lish kerak.",
        )
    syllabus = Syllabus(
        title=data.title,
        course_code=data.course_code,
        credit_hours=data.credit_hours,
        description=data.description,
        objectives=data.objectives,
        content=data.content,
        university_id=user.university_id,
        created_by=user.id,
        # Asosiy ma'lumotlar
        department=data.department,
        faculty=data.faculty,
        specialization=data.specialization,
        academic_year=data.academic_year,
        semester=data.semester,
        language=data.language,
        prerequisites=data.prerequisites,
        # Soatlar taqsimoti
        lecture_hours=data.lecture_hours,
        practice_hours=data.practice_hours,
        lab_hours=data.lab_hours,
        self_study_hours=data.self_study_hours,
        # Baholash
        grading_policy=data.grading_policy,
        attendance_policy=data.attendance_policy,
        passing_grade=data.passing_grade,
        # Resurslar va kompetensiyalar
        textbooks=data.textbooks,
        online_resources=data.online_resources,
        learning_outcomes=data.learning_outcomes,
        competencies=data.competencies,
        # TIU meta
        instructor_phone=data.instructor_phone,
        office_hours=data.office_hours,
        reviewer_1=data.reviewer_1.model_dump() if data.reviewer_1 else None,
        reviewer_2=data.reviewer_2.model_dump() if data.reviewer_2 else None,
        approval_info=data.approval_info.model_dump() if data.approval_info else None,
    )
    db.add(syllabus)
    await db.flush()
    await _create_version(syllabus, user.id, db)
    return syllabus


async def get_syllabus(syllabus_id: UUID, user: User, db: AsyncSession) -> Syllabus:
    result = await db.execute(select(Syllabus).where(Syllabus.id == syllabus_id))
    syllabus = result.scalar_one_or_none()
    if not syllabus:
        raise NotFoundError("Syllabus")
    _check_access(syllabus, user)
    return syllabus


async def list_syllabuses(
    user: User,
    db: AsyncSession,
    status: SyllabusStatus | None = None,
    page: int = 1,
    size: int = 20,
) -> tuple[list[Syllabus], int]:
    query = select(Syllabus)

    if user.role == UserRole.TEACHER:
        query = query.where(Syllabus.created_by == user.id)
    elif user.role in (UserRole.REVIEWER, UserRole.UNIVERSITY_ADMIN):
        query = query.where(Syllabus.university_id == user.university_id)

    if status:
        query = query.where(Syllabus.status == status)

    count_result = await db.execute(select(func.count()).select_from(query.subquery()))
    total = count_result.scalar_one()

    query = query.offset((page - 1) * size).limit(size).order_by(Syllabus.created_at.desc())
    result = await db.execute(query)
    return result.scalars().all(), total


async def update_syllabus(
    syllabus_id: UUID,
    data: SyllabusUpdateRequest,
    user: User,
    db: AsyncSession,
) -> Syllabus:
    syllabus = await get_syllabus(syllabus_id, user, db)

    if syllabus.created_by != user.id and user.role not in (UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN):
        raise ForbiddenError("Only the creator can edit this syllabus")

    if syllabus.status == SyllabusStatus.APPROVED:
        raise ForbiddenError("Approved syllabuses cannot be edited")

    for field, value in data.model_dump(exclude_none=True).items():
        setattr(syllabus, field, value)
    syllabus.updated_at = datetime.now(timezone.utc)

    await _create_version(syllabus, user.id, db)
    return syllabus


async def submit_for_review(syllabus_id: UUID, user: User, db: AsyncSession) -> Syllabus:
    syllabus = await get_syllabus(syllabus_id, user, db)

    if syllabus.created_by != user.id:
        raise ForbiddenError("Only the creator can submit for review")
    if syllabus.status not in (SyllabusStatus.DRAFT, SyllabusStatus.REJECTED):
        raise ForbiddenError("Only draft or rejected syllabuses can be submitted for review")

    syllabus.status = SyllabusStatus.PENDING_REVIEW
    syllabus.updated_at = datetime.now(timezone.utc)
    return syllabus


async def review_syllabus(
    syllabus_id: UUID,
    data: SyllabusReviewRequest,
    user: User,
    db: AsyncSession,
) -> Syllabus:
    if user.role not in (UserRole.REVIEWER, UserRole.UNIVERSITY_ADMIN, UserRole.SUPER_ADMIN):
        raise ForbiddenError("You don't have permission to review syllabuses")

    result = await db.execute(select(Syllabus).where(Syllabus.id == syllabus_id))
    syllabus = result.scalar_one_or_none()
    if not syllabus:
        raise NotFoundError("Syllabus")

    if syllabus.status != SyllabusStatus.PENDING_REVIEW:
        raise ForbiddenError("Syllabus is not pending review")

    syllabus.status = SyllabusStatus.APPROVED if data.action == "approve" else SyllabusStatus.REJECTED
    syllabus.reviewed_by = user.id
    syllabus.review_comment = data.comment
    syllabus.reviewed_at = datetime.now(timezone.utc)
    syllabus.updated_at = datetime.now(timezone.utc)
    return syllabus


async def delete_syllabus(syllabus_id: UUID, user: User, db: AsyncSession) -> None:
    syllabus = await get_syllabus(syllabus_id, user, db)

    if syllabus.created_by != user.id and user.role not in (UserRole.SUPER_ADMIN, UserRole.UNIVERSITY_ADMIN):
        raise ForbiddenError("Insufficient permissions to delete this syllabus")
    if syllabus.status == SyllabusStatus.APPROVED:
        raise ForbiddenError("Approved syllabuses cannot be deleted")

    await db.delete(syllabus)


async def get_versions(syllabus_id: UUID, user: User, db: AsyncSession) -> list[SyllabusVersion]:
    syllabus = await get_syllabus(syllabus_id, user, db)
    result = await db.execute(
        select(SyllabusVersion)
        .where(SyllabusVersion.syllabus_id == syllabus.id)
        .order_by(SyllabusVersion.version_number.desc())
    )
    return result.scalars().all()


def _check_access(syllabus: Syllabus, user: User) -> None:
    if user.role == UserRole.SUPER_ADMIN:
        return
    if user.role == UserRole.TEACHER and syllabus.created_by != user.id:
        raise ForbiddenError("Access denied")
    if user.role in (UserRole.REVIEWER, UserRole.UNIVERSITY_ADMIN):
        if syllabus.university_id != user.university_id:
            raise ForbiddenError("Access denied")


async def _create_version(syllabus: Syllabus, user_id: UUID, db: AsyncSession) -> None:
    count_result = await db.execute(
        select(func.count()).where(SyllabusVersion.syllabus_id == syllabus.id)
    )
    version_num = (count_result.scalar_one() or 0) + 1

    snapshot = {
        "title": syllabus.title,
        "course_code": syllabus.course_code,
        "credit_hours": syllabus.credit_hours,
        "description": syllabus.description,
        "objectives": syllabus.objectives,
        "content": syllabus.content,
        "status": syllabus.status,
        "instructor_phone": syllabus.instructor_phone,
        "office_hours": syllabus.office_hours,
        "reviewer_1": syllabus.reviewer_1,
        "reviewer_2": syllabus.reviewer_2,
        "approval_info": syllabus.approval_info,
    }
    db.add(SyllabusVersion(
        syllabus_id=syllabus.id,
        version_number=version_num,
        snapshot=snapshot,
        changed_by=user_id,
    ))
