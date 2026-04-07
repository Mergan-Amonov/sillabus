import pytest
from httpx import AsyncClient


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
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


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
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_me_with_token(client: AsyncClient, auth_headers: dict):
    response = await client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["email"] == "teacher@test.com"


@pytest.mark.asyncio
async def test_refresh_token(client: AsyncClient, teacher_user):
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    refresh_token = login.json()["refresh_token"]

    response = await client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


@pytest.mark.asyncio
async def test_refresh_token_reuse_rejected(client: AsyncClient, teacher_user):
    login = await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    refresh_token = login.json()["refresh_token"]

    await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    # Try to reuse the same refresh token
    response = await client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 403
