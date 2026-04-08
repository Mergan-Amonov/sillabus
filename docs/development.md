# Ishlab Chiqish Qo'llanmasi

## Talab

| Vosita | Versiya |
|--------|---------|
| Docker Desktop | 4.x+ |
| Git | 2.x+ |

---

## Ishga tushirish

```bash
git clone https://github.com/Mergan-Amonov/sillabus.git
cd sillabus

# Environment
cp .env.example .env
# .env dagi POSTGRES_PASSWORD ni o'zgartiring

# Ishga tushirish
docker compose up -d --build

# Birinchi marta: migration
docker exec silabuys_backend alembic upgrade head
```

**Manzillar:**

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 (minioadmin / minioadmin123) |

---

## Loyiha tuzilishi

```
silabuys/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py       # Pydantic Settings (.env o'qiydi)
│   │   │   ├── database.py     # Async SQLAlchemy engine
│   │   │   ├── deps.py         # FastAPI dependency-lar
│   │   │   ├── exceptions.py   # Custom exception sinflar
│   │   │   ├── redis_client.py # Redis ulanish
│   │   │   └── security.py     # JWT, bcrypt
│   │   ├── modules/            # Har bir domain alohida modul
│   │   │   ├── auth/
│   │   │   ├── syllabus/
│   │   │   ├── ai/
│   │   │   └── export/
│   │   ├── migrations/         # Alembic
│   │   └── main.py             # FastAPI app, router ulash
│   ├── tests/
│   ├── entrypoint.sh           # Migration + seed + server
│   ├── Dockerfile
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── app/                # Next.js App Router
        │   ├── (auth)/         # Login, Register (route group)
        │   └── (dashboard)/    # Protected sahifalar
        │       └── dashboard/
        │           ├── page.tsx
        │           ├── syllabuses/
        │           ├── users/
        │           └── settings/
        ├── components/         # Qayta ishlatiladigan UI
        │   ├── Sidebar.tsx
        │   └── StatusBadge.tsx
        ├── hooks/
        │   └── useAuth.ts      # Zustand store
        ├── lib/
        │   ├── api.ts          # Axios instance (interceptor-lar)
        │   ├── auth.ts         # Auth API funksiyalar
        │   ├── syllabuses.ts   # Syllabus API funksiyalar
        │   └── users.ts        # Users API funksiyalar
        └── types/
            └── index.ts        # TypeScript interfeyslari
```

---

## Backend ishlab chiqish

### Yangi modul qo'shish

```
backend/app/modules/yangi_modul/
├── __init__.py
├── models.py    # SQLAlchemy modellari
├── schemas.py   # Pydantic sxemalar
├── service.py   # Biznes mantiq
└── router.py    # Endpoint'lar
```

`main.py` ga import qiling:
```python
from app.modules.yangi_modul.router import router as yangi_router
app.include_router(yangi_router, prefix=API_PREFIX)
```

### Yangi migration yaratish

```bash
# Modelda o'zgartirish qilib bo'lgandan keyin:
docker exec silabuys_backend alembic revision --autogenerate -m "tavsif"
docker exec silabuys_backend alembic upgrade head
```

### Testlar

```bash
docker exec silabuys_backend pytest tests/ -v
docker exec silabuys_backend pytest tests/test_auth.py -v  # Bitta fayl
```

### Backend loglarini ko'rish

```bash
docker logs silabuys_backend -f
```

---

## Frontend ishlab chiqish

### Yangi sahifa qo'shish

```
frontend/src/app/(dashboard)/dashboard/yangi_sahifa/page.tsx
```

Komponent `"use client"` direktivi bilan boshlanishi kerak (agar interaktiv bo'lsa):
```tsx
"use client";
export default function YangiSahifaPage() {
  return <div>...</div>;
}
```

### Yangi API funksiya qo'shish

```ts
// frontend/src/lib/yangi.ts
import { api } from "./api";

export async function birorNarsa(): Promise<SomeType> {
  const { data } = await api.get<SomeType>("/yangi-endpoint");
  return data;
}
```

### Frontend loglarini ko'rish

```bash
docker logs silabuys_frontend -f
```

---

## Foydali buyruqlar

```bash
# Konteynerlar holati
docker compose ps

# Backend qayta ishga tushirish
docker restart silabuys_backend

# Frontend qayta ishga tushirish (yangi sahifalar qo'shilganda)
docker restart silabuys_frontend

# Ma'lumotlar bazasiga kirish
docker exec -it silabuys_postgres psql -U silabuys_user -d silabuys

# Redis holatini tekshirish
docker exec silabuys_redis redis-cli ping

# Barcha konteynerlarni to'xtatish
docker compose down

# Hamma narsani tozalab qayta boshlash (ma'lumotlar o'chadi!)
docker compose down -v
docker compose up -d --build
```

---

## Environment o'zgaruvchilar

Barcha o'zgaruvchilar `.env` faylida saqlanadi. `.env.example` faylidan nusxa oling.

| O'zgaruvchi | Tavsif | Majburiy |
|-------------|--------|----------|
| `SECRET_KEY` | App maxfiy kaliti | ✓ |
| `JWT_SECRET_KEY` | JWT imzolash kaliti | ✓ |
| `DATABASE_URL` | PostgreSQL ulanish | ✓ |
| `POSTGRES_PASSWORD` | DB paroli | ✓ |
| `REDIS_URL` | Redis ulanish | ✓ |
| `MINIO_ENDPOINT` | MinIO manzil | ✓ |
| `MINIO_ACCESS_KEY` | MinIO foydalanuvchi | ✓ |
| `MINIO_SECRET_KEY` | MinIO parol | ✓ |
| `OPENAI_API_KEY` | Global fallback AI kaliti | — |
| `FIRST_SUPERADMIN_EMAIL` | Admin email | ✓ |
| `FIRST_SUPERADMIN_PASSWORD` | Admin paroli | ✓ |
| `ALLOWED_ORIGINS` | CORS manzillar | ✓ |

---

## Muammolarni hal qilish

### "404 Not Found" yangi sahifada

```bash
docker restart silabuys_frontend
```

Next.js hot-reload yangi papka/fayllarni ba'zan ko'rmaydi — restart kerak.

### Backend 500 xatosi

```bash
docker logs silabuys_backend 2>&1 | tail -50
```

### Migration xatosi

```bash
# Migratsiya holatini ko'rish
docker exec silabuys_backend alembic current

# Oxirgi migratsiyani bekor qilish
docker exec silabuys_backend alembic downgrade -1

# Qayta migration
docker exec silabuys_backend alembic upgrade head
```

### DB ulanmayapti

```bash
docker compose ps postgres  # "healthy" bo'lishi kerak
docker logs silabuys_postgres
```
