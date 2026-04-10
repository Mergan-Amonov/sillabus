import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import uuid4

from app.core.security import hash_password
from app.modules.auth.models import User, UserRole


SYLLABUS_PAYLOAD = {
    "title": "Introduction to Computer Science",
    "course_code": "CS101",
    "credit_hours": 3,
    "description": "A foundational course covering basic CS concepts.",
    "objectives": "Understand algorithms, data structures, and programming.",
}


@pytest.mark.asyncio
async def test_create_syllabus(client: AsyncClient, auth_headers: dict):
    response = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == SYLLABUS_PAYLOAD["title"]
    assert data["status"] == "draft"


@pytest.mark.asyncio
async def test_create_syllabus_requires_auth(client: AsyncClient):
    response = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD)
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_create_syllabus_invalid_credit_hours(client: AsyncClient, auth_headers: dict):
    payload = {**SYLLABUS_PAYLOAD, "credit_hours": 0}
    response = await client.post("/api/v1/syllabuses", json=payload, headers=auth_headers)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_list_syllabuses(client: AsyncClient, auth_headers: dict):
    await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    response = await client.get("/api/v1/syllabuses", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert data["total"] >= 1


@pytest.mark.asyncio
async def test_get_syllabus(client: AsyncClient, auth_headers: dict):
    create = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    syllabus_id = create.json()["id"]

    response = await client.get(f"/api/v1/syllabuses/{syllabus_id}", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["id"] == syllabus_id


@pytest.mark.asyncio
async def test_get_nonexistent_syllabus(client: AsyncClient, auth_headers: dict):
    response = await client.get(f"/api/v1/syllabuses/{uuid4()}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_update_syllabus(client: AsyncClient, auth_headers: dict):
    create = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    syllabus_id = create.json()["id"]

    response = await client.patch(
        f"/api/v1/syllabuses/{syllabus_id}",
        json={"title": "Updated Title", "credit_hours": 4},
        headers=auth_headers,
    )
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["credit_hours"] == 4


@pytest.mark.asyncio
async def test_submit_for_review(client: AsyncClient, auth_headers: dict):
    create = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    syllabus_id = create.json()["id"]

    response = await client.post(f"/api/v1/syllabuses/{syllabus_id}/submit", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["status"] == "pending_review"


@pytest.mark.asyncio
async def test_delete_draft_syllabus(client: AsyncClient, auth_headers: dict):
    create = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    syllabus_id = create.json()["id"]

    response = await client.delete(f"/api/v1/syllabuses/{syllabus_id}", headers=auth_headers)
    assert response.status_code == 204

    response = await client.get(f"/api/v1/syllabuses/{syllabus_id}", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_syllabus_versions_tracked(client: AsyncClient, auth_headers: dict):
    create = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD, headers=auth_headers)
    syllabus_id = create.json()["id"]

    await client.patch(
        f"/api/v1/syllabuses/{syllabus_id}",
        json={"title": "Version 2"},
        headers=auth_headers,
    )

    response = await client.get(f"/api/v1/syllabuses/{syllabus_id}/versions", headers=auth_headers)
    assert response.status_code == 200
    versions = response.json()
    assert len(versions) >= 2


@pytest.mark.asyncio
async def test_create_syllabus_without_university(client: AsyncClient, db_session: AsyncSession):
    # Regression: ISSUE-001 — 500 error when creating syllabus without university_id
    # Found by /qa on 2026-04-10
    # Report: .gstack/qa-reports/qa-report-localhost-2026-04-10.md
    user = User(
        email="no_uni@test.com",
        hashed_password=hash_password("TestPass123"),
        full_name="No University User",
        role=UserRole.TEACHER,
        university_id=None,
    )
    db_session.add(user)
    await db_session.commit()

    await client.post(
        "/api/v1/auth/login",
        json={"email": "no_uni@test.com", "password": "TestPass123"},
    )

    response = await client.post("/api/v1/syllabuses", json=SYLLABUS_PAYLOAD)
    assert response.status_code in (401, 422)
    if response.status_code == 422:
        assert "universitetga" in response.json()["detail"].lower() or "university" in response.json()["detail"].lower()
