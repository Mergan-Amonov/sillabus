from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from app.core.database import get_db
from app.core.deps import get_current_active_user
from app.modules.auth.models import User
from app.modules.export import service

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/{syllabus_id}/pdf")
async def export_pdf(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    syllabus = await service.get_syllabus_for_export(syllabus_id, current_user, db)
    pdf_bytes = service.generate_pdf(syllabus)
    filename = f"{syllabus.course_code}_{syllabus.title[:30].replace(' ', '_')}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/{syllabus_id}/docx")
async def export_docx(
    syllabus_id: UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    syllabus = await service.get_syllabus_for_export(syllabus_id, current_user, db)
    docx_bytes = service.generate_docx(syllabus)
    filename = f"{syllabus.course_code}_{syllabus.title[:30].replace(' ', '_')}.docx"
    return Response(
        content=docx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
