import pytest
from unittest.mock import patch, MagicMock
from httpx import AsyncClient
from uuid import uuid4


@pytest.mark.asyncio
async def test_export_requires_auth(client: AsyncClient):
    response = await client.get(f"/api/v1/export/{uuid4()}/pdf")
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_export_pdf_not_found(client: AsyncClient, auth_headers: dict):
    response = await client.get(f"/api/v1/export/{uuid4()}/pdf", headers=auth_headers)
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_export_pdf_success(client: AsyncClient, auth_headers: dict):
    # Create syllabus first
    create = await client.post(
        "/api/v1/syllabuses",
        json={
            "title": "Export Test Course",
            "course_code": "EXP101",
            "credit_hours": 3,
            "description": "A course for export testing.",
        },
        headers=auth_headers,
    )
    assert create.status_code == 201
    syllabus_id = create.json()["id"]

    response = await client.get(f"/api/v1/export/{syllabus_id}/pdf", headers=auth_headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"
    assert len(response.content) > 100


@pytest.mark.asyncio
async def test_export_docx_success(client: AsyncClient, auth_headers: dict):
    create = await client.post(
        "/api/v1/syllabuses",
        json={
            "title": "Docx Export Test",
            "course_code": "DOCX101",
            "credit_hours": 2,
        },
        headers=auth_headers,
    )
    syllabus_id = create.json()["id"]

    response = await client.get(f"/api/v1/export/{syllabus_id}/docx", headers=auth_headers)
    assert response.status_code == 200
    assert "wordprocessingml" in response.headers["content-type"]
    assert len(response.content) > 100
