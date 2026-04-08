from fastapi import APIRouter, Depends

from app.core.deps import require_teacher
from app.modules.auth.models import User
from app.modules.ai import service
from app.modules.ai.schemas import AISyllabusGenerateRequest, AIGenerateResponse

router = APIRouter(prefix="/ai", tags=["AI"])


@router.post("/generate", response_model=AIGenerateResponse)
async def generate(
    body: AISyllabusGenerateRequest,
    current_user: User = Depends(require_teacher),
):
    """
    Generate syllabus content using GPT-4o.
    Rate limit: 20 requests/hour per user.
    """
    return await service.generate_syllabus(
        body,
        str(current_user.id),
        current_user.openai_api_key,
        current_user.ai_base_url,
        current_user.ai_model,
    )
