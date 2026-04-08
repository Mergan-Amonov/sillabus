#!/bin/bash
set -e

echo "==> Running database migrations..."
alembic upgrade head

echo "==> Seeding super admin..."
python -c "
import asyncio, uuid
from app.core.database import AsyncSessionLocal
from app.core.security import hash_password
from app.core.config import settings
from sqlalchemy import text

async def seed():
    async with AsyncSessionLocal() as db:
        # Seed university
        result = await db.execute(text(\"SELECT id FROM universities WHERE slug='main'\"))
        uni_id = result.scalar()
        if not uni_id:
            uni_id = str(uuid.uuid4())
            await db.execute(text('''
                INSERT INTO universities (id, name, slug, schema_name, is_active)
                VALUES (:id, 'Bosh Universitet', 'main', 'tenant_main', true)
            '''), {'id': uni_id})
            print('University created.')

        result = await db.execute(text(\"SELECT id FROM universities WHERE slug='main'\"))
        uni_id = result.scalar()

        # Seed super admin
        result = await db.execute(text('SELECT id FROM users WHERE email=:e'), {'e': settings.FIRST_SUPERADMIN_EMAIL})
        if not result.scalar():
            await db.execute(text('''
                INSERT INTO users (id, email, hashed_password, full_name, role, is_active, university_id)
                VALUES (:id, :email, :pw, 'Super Admin', 'super_admin', true, :uid)
            '''), {
                'id': str(uuid.uuid4()),
                'email': settings.FIRST_SUPERADMIN_EMAIL,
                'pw': hash_password(settings.FIRST_SUPERADMIN_PASSWORD),
                'uid': uni_id,
            })
            print(f'Super admin created: {settings.FIRST_SUPERADMIN_EMAIL}')
        else:
            print('Super admin already exists.')

        await db.commit()

asyncio.run(seed())
"

echo "==> Starting server..."
exec gunicorn app.main:app \
    --workers ${GUNICORN_WORKERS:-4} \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --max-requests 1000 \
    --max-requests-jitter 100 \
    --access-logfile - \
    --error-logfile -
