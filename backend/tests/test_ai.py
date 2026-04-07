import pytest
from unittest.mock import AsyncMock, patch
from httpx import AsyncClient


AI_PAYLOAD = {
    "course_title": "Introduction to Python",
    "course_code": "PY101",
    "credit_hours": 3,
    "level": "undergraduate",
    "department": "Computer Science",
    "instructions": "Focus on practical projects",
}

MOCK_AI_RESPONSE = {
    "title": "Introduction to Python",
    "description": "A comprehensive introduction to Python programming.",
    "objectives": "Learn Python basics\nBuild practical applications",
    "content": {
        "weeks": [{"week": 1, "topic": "Python Basics", "activities": ["Lecture"], "assessment": "Quiz"}],
        "assessment_breakdown": {"midterm": 30, "final": 40, "assignments": 20, "attendance": 10},
        "required_textbooks": ["Python Crash Course - Eric Matthes"],
        "recommended_resources": ["Python docs"],
    },
}


@pytest.mark.asyncio
async def test_ai_generate_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/ai/generate", json=AI_PAYLOAD)
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_ai_generate_invalid_level(client: AsyncClient, auth_headers: dict):
    payload = {**AI_PAYLOAD, "level": "invalid_level"}
    response = await client.post("/api/v1/ai/generate", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_empty_title(client: AsyncClient, auth_headers: dict):
    payload = {**AI_PAYLOAD, "course_title": ""}
    response = await client.post("/api/v1/ai/generate", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_ai_generate_success(client: AsyncClient, auth_headers: dict):
    mock_response = AsyncMock()
    mock_response.choices = [AsyncMock()]
    mock_response.choices[0].message.content = '{"title": "Intro to Python", "description": "Course desc", "objectives": "obj", "content": {}}'
    mock_response.usage.total_tokens = 500

    with patch("app.modules.ai.service._get_client") as mock_client:
        mock_openai = AsyncMock()
        mock_openai.chat.completions.create = AsyncMock(return_value=mock_response)
        mock_client.return_value = mock_openai

        with patch("app.modules.ai.service.check_rate_limit", return_value=True):
            response = await client.post("/api/v1/ai/generate", json=AI_PAYLOAD, headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert "generated" in data
    assert "prompt_version" in data
    assert data["prompt_version"] == "v1"


@pytest.mark.asyncio
async def test_ai_rate_limit_enforced(client: AsyncClient, auth_headers: dict):
    with patch("app.modules.ai.service.check_rate_limit", return_value=False):
        response = await client.post("/api/v1/ai/generate", json=AI_PAYLOAD, headers=auth_headers)

    assert response.status_code == 429
