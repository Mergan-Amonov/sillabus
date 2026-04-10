import json
import re
from openai import AsyncOpenAI
from app.core.config import settings
from app.core.exceptions import RateLimitError
from app.core.redis_client import check_rate_limit, get_ai_rate_limit_key
from app.modules.ai.prompts.v2 import (
    SYSTEM_PROMPT,
    SYLLABUS_GENERATE_TEMPLATE,
    LANGUAGE_INSTRUCTIONS,
    PROMPT_VERSION,
)
from app.modules.ai.schemas import AISyllabusGenerateRequest, AIGenerateResponse


def _build_client(user_api_key: str | None, user_base_url: str | None) -> tuple[AsyncOpenAI, str, str]:
    """
    Priority:
      1. User's own key + base_url  (cloud provider chosen by user)
      2. System default             (local Ollama by default)
    Returns (client, base_url, api_key).
    """
    if user_api_key:
        api_key = user_api_key
        base_url = user_base_url or None
    else:
        api_key = settings.OPENAI_API_KEY or "ollama"
        base_url = settings.OPENAI_BASE_URL or None

    client = AsyncOpenAI(api_key=api_key, base_url=base_url)
    return client, base_url, api_key


def _compute_hours(data: AISyllabusGenerateRequest) -> tuple[int, int, int]:
    """Compute default lecture/practice/self-study hours per week."""
    total_contact = data.credit_hours * 2  # rough default: 2 contact h/week per credit

    lecture_h = data.lecture_hours if data.lecture_hours is not None else max(1, total_contact - 1)
    practice_h = data.practice_hours if data.practice_hours is not None else (total_contact - lecture_h)
    self_study_h = data.self_study_hours if data.self_study_hours is not None else data.credit_hours * 2

    return lecture_h, practice_h, self_study_h


async def generate_syllabus(
    data: AISyllabusGenerateRequest,
    user_id: str,
    user_api_key: str | None = None,
    user_base_url: str | None = None,
    user_model: str | None = None,
) -> AIGenerateResponse:
    rate_key = await get_ai_rate_limit_key(user_id)
    allowed = await check_rate_limit(rate_key, settings.AI_RATE_LIMIT_PER_HOUR, window_seconds=3600)
    if not allowed:
        raise RateLimitError(f"AI generation limit: {settings.AI_RATE_LIMIT_PER_HOUR} requests/hour")

    client, _, _ = _build_client(user_api_key, user_base_url)
    model = user_model or settings.OPENAI_MODEL

    lecture_h, practice_h, self_study_h = _compute_hours(data)
    total_weeks = 16  # one semester = 16 weeks regardless of credit hours
    language_instruction = LANGUAGE_INSTRUCTIONS.get(data.language, LANGUAGE_INSTRUCTIONS["uzbek"])

    user_prompt = SYLLABUS_GENERATE_TEMPLATE.format(
        language_instruction=language_instruction,
        course_title=data.course_title,
        course_code=data.course_code,
        credit_hours=data.credit_hours,
        level=data.level,
        department=data.department or "General",
        faculty=data.faculty or "General",
        language=data.language,
        semester=data.semester or "Not specified",
        academic_year=data.academic_year or "Not specified",
        lecture_hours=data.lecture_hours or "Not specified",
        practice_hours=data.practice_hours or "Not specified",
        lab_hours=data.lab_hours or "Not specified",
        self_study_hours=data.self_study_hours or "Not specified",
        prerequisites=data.prerequisites or "None",
        instructions=(data.instructions or "") + (" " + data.additional_requirements if data.additional_requirements else ""),
        total_weeks=total_weeks,
        default_lecture_h=lecture_h,
        default_practice_h=practice_h,
        default_self_study_h=self_study_h,
    )

    try:
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
    except Exception as e:
        err = str(e)
        if "429" in err or "rate" in err.lower() or "quota" in err.lower():
            from app.core.exceptions import AppException
            raise AppException(429, "AI provayder vaqtinchalik chegaralandi. Bir oz kuting yoki boshqa modelni sinab ko'ring.")
        if "404" in err or "not found" in err.lower() or "No endpoints" in err:
            from app.core.exceptions import AppException
            raise AppException(400, f"Model topilmadi: '{model}'. Ollama da model borligini tekshiring: ollama pull {model}")
        if "401" in err or "403" in err:
            from app.core.exceptions import AppException
            raise AppException(401, "API kalit noto'g'ri. Sozlamalardan kalitni tekshiring.")
        if "connect" in err.lower() or "connection" in err.lower():
            from app.core.exceptions import AppException
            raise AppException(503, "AI serverga ulanib bo'lmadi. Ollama ishlab turganini tekshiring.")
        raise

    content = response.choices[0].message.content or ""

    # Strip markdown code fences if model wrapped JSON in ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", content)
    if match:
        content = match.group(1)

    # Try to extract the outermost JSON object even if there's surrounding text
    if not content.strip().startswith("{"):
        obj_match = re.search(r"\{[\s\S]+\}", content)
        if obj_match:
            content = obj_match.group(0)

    try:
        generated = json.loads(content)
    except json.JSONDecodeError:
        # Last resort: try to fix truncated JSON by finding the last complete field
        try:
            # Find last valid closing brace position
            fixed = content.rsplit("}", 1)[0] + "}" if "}" in content else content
            # Close any open arrays/objects
            open_brackets = fixed.count("[") - fixed.count("]")
            open_braces = fixed.count("{") - fixed.count("}")
            fixed += "]" * max(0, open_brackets) + "}" * max(0, open_braces)
            generated = json.loads(fixed)
        except Exception:
            import logging
            logging.getLogger(__name__).error("AI JSON parse failed. Content: %s", content[:500])
            from app.core.exceptions import AppException
            raise AppException(502, "Model JSON formatida javob bermadi. Qayta urinib ko'ring.")

    tokens_used = response.usage.total_tokens if response.usage else 0

    # Map generated fields directly to Syllabus model fields
    learning_outcomes = generated.get("learning_outcomes", [])
    mapped = {
        "description": generated.get("course_description"),
        "objectives": "\n".join(learning_outcomes) if learning_outcomes else None,
        "content": {
            "weeks": generated.get("weekly_schedule", []),
            "assessment_breakdown": generated.get("assessment_breakdown", []),
            "required_textbooks": [
                f"{t.get('author', '')}. {t.get('title', '')}. {t.get('publisher', '')}, {t.get('year', '')}."
                for t in generated.get("textbooks", [])
                if t.get("required")
            ],
            "recommended_resources": [
                r.get("name", "") for r in generated.get("online_resources", [])
            ],
        },
        "learning_outcomes": learning_outcomes if learning_outcomes else None,
        "competencies": generated.get("competencies"),
        "grading_policy": generated.get("grading_policy"),
        "attendance_policy": generated.get("attendance_policy"),
        "passing_grade": generated.get("passing_grade"),
        "textbooks": generated.get("textbooks"),
        "online_resources": generated.get("online_resources"),
    }

    return AIGenerateResponse(
        prompt_version=PROMPT_VERSION,
        generated=generated,
        mapped=mapped,
        tokens_used=tokens_used,
    )
