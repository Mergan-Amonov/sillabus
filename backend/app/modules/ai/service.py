import json
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.core.redis_client import check_rate_limit, get_ai_rate_limit_key
from app.modules.ai.prompts.v1 import SYSTEM_PROMPT, SYLLABUS_GENERATE_TEMPLATE, PROMPT_VERSION
from app.modules.ai.schemas import AISyllabusGenerateRequest, AIGenerateResponse

async def generate_syllabus(
    data: AISyllabusGenerateRequest,
    user_id: str,
    user_api_key: str | None = None,
    user_base_url: str | None = None,
    user_model: str | None = None,
) -> AIGenerateResponse:
    api_key = user_api_key or settings.OPENAI_API_KEY
    if not api_key or api_key.startswith("sk-placeholder"):
        from app.core.exceptions import AppException
        raise AppException(400, "API kalit kiritilmagan. Sozlamalar sahifasidan kalitingizni kiriting.")
    base_url = user_base_url or None
    model = user_model or settings.OPENAI_MODEL
    rate_key = await get_ai_rate_limit_key(user_id)
    allowed = await check_rate_limit(rate_key, settings.AI_RATE_LIMIT_PER_HOUR, window_seconds=3600)
    if not allowed:
        raise RateLimitError(f"AI generation limit: {settings.AI_RATE_LIMIT_PER_HOUR} requests/hour")

    user_prompt = SYLLABUS_GENERATE_TEMPLATE.format(
        course_title=data.course_title,
        course_code=data.course_code,
        credit_hours=data.credit_hours,
        level=data.level,
        department=data.department or "General",
        instructions=data.instructions or "None",
    )

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    response = await client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=settings.OPENAI_MAX_TOKENS,
        temperature=0.7,
        response_format={"type": "json_object"},
    )

    content = response.choices[0].message.content
    generated = json.loads(content)
    tokens_used = response.usage.total_tokens if response.usage else 0

    return AIGenerateResponse(
        prompt_version=PROMPT_VERSION,
        generated=generated,
        tokens_used=tokens_used,
    )
