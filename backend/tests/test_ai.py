import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import AsyncClient


AI_PAYLOAD = {
    "course_title": "Introduction to Python",
    "course_code": "PY101",
    "credit_hours": 3,
    "level": "undergraduate",
    "department": "Computer Science",
    "faculty": "Information Technologies",
    "language": "uzbek",
    "semester": 1,
    "academic_year": "2024-2025",
    "lecture_hours": 2,
    "practice_hours": 2,
    "self_study_hours": 4,
    "prerequisites": "None",
    "instructions": "Focus on practical projects",
}

MOCK_GENERATED = {
    "course_description": "This course introduces Python programming.",
    "learning_outcomes": [
        "Students will be able to write Python scripts",
        "Students will be able to use OOP concepts",
    ],
    "competencies": ["Critical thinking", "Problem solving"],
    "weekly_schedule": [
        {
            "week": 1,
            "topic": "Introduction",
            "lecture_content": "Lecture content",
            "practice_content": "Practice content",
            "self_study": "Read chapter 1",
            "hours": {"lecture": 2, "practice": 2, "self_study": 4},
        }
    ],
    "grading_policy": {"current_control": 30, "midterm": 30, "final": 40},
    "attendance_policy": "80% attendance required",
    "passing_grade": 55,
    "textbooks": [
        {
            "title": "Learning Python",
            "author": "Mark Lutz",
            "year": 2023,
            "publisher": "O'Reilly",
            "required": True,
        }
    ],
    "online_resources": [
        {
            "name": "Python docs",
            "url": "https://docs.python.org",
            "description": "Official docs",
        }
    ],
    "assessment_breakdown": [
        {"type": "Current control", "weight": 30, "description": "Quizzes"},
        {"type": "Midterm", "weight": 30, "description": "Written exam"},
        {"type": "Final", "weight": 40, "description": "Comprehensive exam"},
    ],
}


@pytest.mark.asyncio
async def test_ai_generate_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/ai/generate", json=AI_PAYLOAD)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_ai_generate_invalid_level(client: AsyncClient, auth_headers: dict):
    payload = {**AI_PAYLOAD, "level": "invalid_level"}
    response = await client.post("/api/v1/ai/generate", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_invalid_language(client: AsyncClient, auth_headers: dict):
    payload = {**AI_PAYLOAD, "language": "french"}
    response = await client.post("/api/v1/ai/generate", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_empty_title(client: AsyncClient, auth_headers: dict):
    payload = {**AI_PAYLOAD, "course_title": ""}
    response = await client.post("/api/v1/ai/generate", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_minimal_payload(client: AsyncClient, auth_headers: dict):
    """Yangi optional fieldlar bo'lmasa ham ishlashi kerak."""
    minimal = {
        "course_title": "Math",
        "course_code": "MATH101",
        "credit_hours": 2,
    }
    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = __import__("json").dumps(MOCK_GENERATED)
    mock_response.usage.total_tokens = 500

    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch("app.modules.ai.service.AsyncOpenAI", return_value=mock_client):
        with patch("app.modules.ai.service.check_rate_limit", return_value=True):
            with patch("app.modules.ai.service.settings") as mock_settings:
                mock_settings.OPENAI_API_KEY = "sk-test-key"
                mock_settings.OPENAI_MODEL = "gpt-4o"
                mock_settings.OPENAI_MAX_TOKENS = 4096
                mock_settings.AI_RATE_LIMIT_PER_HOUR = 20
                response = await client.post(
                    "/api/v1/ai/generate", json=minimal, headers=auth_headers
                )

    assert response.status_code == 200
    data = response.json()
    assert data["prompt_version"] == "v2"
    assert "generated" in data
    assert "mapped" in data


@pytest.mark.asyncio
async def test_ai_generate_success(client: AsyncClient, auth_headers: dict):
    import json

    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = json.dumps(MOCK_GENERATED)
    mock_response.usage.total_tokens = 500

    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch("app.modules.ai.service.AsyncOpenAI", return_value=mock_client):
        with patch("app.modules.ai.service.check_rate_limit", return_value=True):
            with patch("app.modules.ai.service.settings") as mock_settings:
                mock_settings.OPENAI_API_KEY = "sk-test-key"
                mock_settings.OPENAI_MODEL = "gpt-4o"
                mock_settings.OPENAI_MAX_TOKENS = 4096
                mock_settings.AI_RATE_LIMIT_PER_HOUR = 20
                response = await client.post(
                    "/api/v1/ai/generate", json=AI_PAYLOAD, headers=auth_headers
                )

    assert response.status_code == 200
    data = response.json()
    assert data["prompt_version"] == "v2"
    assert "generated" in data
    assert "mapped" in data

    # generated strukturasini tekshir
    g = data["generated"]
    assert "course_description" in g
    assert "learning_outcomes" in g
    assert "weekly_schedule" in g
    assert "grading_policy" in g
    assert "textbooks" in g
    assert "online_resources" in g

    # mapped strukturasini tekshir
    m = data["mapped"]
    assert m["description"] == MOCK_GENERATED["course_description"]
    assert "Students will be able to write Python scripts" in m["objectives"]
    assert m["grading_policy"] == MOCK_GENERATED["grading_policy"]
    assert m["passing_grade"] == 55
    assert isinstance(m["content"]["weeks"], list)
    assert len(m["content"]["weeks"]) == 1


@pytest.mark.asyncio
async def test_ai_generate_markdown_stripped(client: AsyncClient, auth_headers: dict):
    """Model JSON ni markdown ichiga o'raganda ham ishlashi kerak."""
    import json

    wrapped = f"```json\n{json.dumps(MOCK_GENERATED)}\n```"

    mock_response = MagicMock()
    mock_response.choices = [MagicMock()]
    mock_response.choices[0].message.content = wrapped
    mock_response.usage.total_tokens = 300

    mock_client = AsyncMock()
    mock_client.chat.completions.create = AsyncMock(return_value=mock_response)

    with patch("app.modules.ai.service.AsyncOpenAI", return_value=mock_client):
        with patch("app.modules.ai.service.check_rate_limit", return_value=True):
            with patch("app.modules.ai.service.settings") as mock_settings:
                mock_settings.OPENAI_API_KEY = "sk-test-key"
                mock_settings.OPENAI_MODEL = "gpt-4o"
                mock_settings.OPENAI_MAX_TOKENS = 4096
                mock_settings.AI_RATE_LIMIT_PER_HOUR = 20
                response = await client.post(
                    "/api/v1/ai/generate", json=AI_PAYLOAD, headers=auth_headers
                )

    assert response.status_code == 200
    assert response.json()["prompt_version"] == "v2"


@pytest.mark.asyncio
async def test_ai_rate_limit_enforced(client: AsyncClient, auth_headers: dict):
    mock_client = AsyncMock()

    with patch("app.modules.ai.service.AsyncOpenAI", return_value=mock_client):
        with patch("app.modules.ai.service.check_rate_limit", return_value=False):
            with patch("app.modules.ai.service.settings") as mock_settings:
                mock_settings.OPENAI_API_KEY = "sk-test-key"
                mock_settings.OPENAI_MODEL = "gpt-4o"
                mock_settings.OPENAI_MAX_TOKENS = 4096
                mock_settings.AI_RATE_LIMIT_PER_HOUR = 20
                response = await client.post(
                    "/api/v1/ai/generate", json=AI_PAYLOAD, headers=auth_headers
                )

    assert response.status_code == 429
