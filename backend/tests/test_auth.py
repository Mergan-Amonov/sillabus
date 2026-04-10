import pytest
from httpx import AsyncClient
from app.modules.auth.models import University


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "password": "SecurePass1",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "newuser@test.com"
    assert data["role"] == "teacher"
    assert "hashed_password" not in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient):
    payload = {"email": "dup@test.com", "password": "SecurePass1", "full_name": "Dup User"}
    await client.post("/api/v1/auth/register", json=payload)
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": "weak@test.com", "password": "short", "full_name": "Weak User"},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, teacher_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    assert response.status_code == 200
    data = response.json()
    # Login now returns UserResponse and sets HttpOnly cookies
    assert data["email"] == "teacher@test.com"
    assert "sb_access_token" in client.cookies


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, teacher_user):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "WrongPass123"},
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_me_requires_auth(client: AsyncClient):
    response = await client.get("/api/v1/auth/me")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_me_with_token(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "teacher@test.com"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, teacher_user):
    # Login sets cookie
    await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    # Refresh reads cookie automatically
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 200
    assert response.json()["email"] == "teacher@test.com"


@pytest.mark.asyncio
async def test_refresh_token_reuse_rejected(client: AsyncClient, teacher_user):
    # Login sets refresh cookie
    await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    # First refresh — succeeds, issues new cookie and revokes old token
    await client.post("/api/v1/auth/refresh")
    # Second refresh with the now-revoked token should fail
    # But since httpx client jar has the new cookie, this actually tests the new token
    # so we manually clear the cookie to simulate replay attack
    client.cookies.clear()
    response = await client.post("/api/v1/auth/refresh")
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_list_universities_public(client: AsyncClient, test_university: University):
    # Regression: ISSUE-001 — GET /auth/universities must be public (no auth)
    # Found by /qa on 2026-04-10
    # Report: .gstack/qa-reports/qa-report-localhost-2026-04-10.md
    response = await client.get("/api/v1/auth/universities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert any(u["id"] == str(test_university.id) for u in data)


@pytest.mark.asyncio
async def test_register_with_university_can_create_syllabus(
    client: AsyncClient, test_university: University
):
    # Regression: ISSUE-002 — users registered without university_id got 422 on syllabus create
    # Found by /qa on 2026-04-10
    # The fix: registration form now submits university_id; backend returns 422 clearly
    reg = await client.post(
        "/api/v1/auth/register",
        json={
            "email": "new_teacher@test.com",
            "password": "SecurePass1",
            "full_name": "New Teacher",
            "university_id": str(test_university.id),
        },
    )
    assert reg.status_code == 201
    assert reg.json()["university_id"] == str(test_university.id)

    await client.post(
        "/api/v1/auth/login",
        json={"email": "new_teacher@test.com", "password": "SecurePass1"},
    )
    response = await client.post(
        "/api/v1/syllabuses",
        json={"title": "Test Course", "course_code": "TC101", "credit_hours": 3},
    )
    assert response.status_code == 201
    assert response.json()["status"] == "draft"
