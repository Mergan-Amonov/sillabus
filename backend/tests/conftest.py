import uuid
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db
from app.modules.auth.models import User, UserRole, University
from app.core.security import hash_password

TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

engine = create_async_engine(
    TEST_DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestSessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


@pytest_asyncio.fixture(autouse=True)
async def setup_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def db_session():
    async with TestSessionLocal() as session:
        yield session
        await session.rollback()


@pytest_asyncio.fixture
async def client(db_session: AsyncSession):
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def test_university(db_session: AsyncSession) -> University:
    university = University(
        id=uuid.uuid4(),
        name="Test University",
        slug="test-university",
        schema_name="tenant_test_university",
    )
    db_session.add(university)
    await db_session.commit()
    await db_session.refresh(university)
    return university


@pytest_asyncio.fixture
async def teacher_user(db_session: AsyncSession, test_university: University) -> User:
    user = User(
        email="teacher@test.com",
        hashed_password=hash_password("TestPass123"),
        full_name="Test Teacher",
        role=UserRole.TEACHER,
        university_id=test_university.id,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def reviewer_user(db_session: AsyncSession, test_university: University) -> User:
    user = User(
        email="reviewer@test.com",
        hashed_password=hash_password("TestPass123"),
        full_name="Test Reviewer",
        role=UserRole.REVIEWER,
        university_id=test_university.id,
    )
    db_session.add(user)
    await db_session.commit()
    await db_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def auth_cookies(client: AsyncClient, teacher_user: User) -> dict:
    """Login — cookie is stored in client jar automatically."""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "teacher@test.com", "password": "TestPass123"},
    )
    assert response.status_code == 200, response.text
    return {}


# Alias for backwards compatibility
auth_headers = auth_cookies
