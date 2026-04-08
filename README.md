# Silabuys — Aqlli Syllabus Platformasi

Universitetlar uchun AI yordamida syllabus yaratish va boshqarish tizimi.

## Tech Stack

| Qatlam | Texnologiya |
|--------|------------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy (async), Alembic |
| Database | PostgreSQL 16 |
| Cache / Rate-limit | Redis 7 |
| File storage | MinIO |
| AI | OpenAI / OpenRouter / Gemini (har bir foydalanuvchi o'z kaliti) |
| Proxy | Nginx |
| Container | Docker, Docker Compose |

## Rollar

| Rol | Imkoniyatlar |
|-----|-------------|
| `super_admin` | Hamma narsa + universitet yaratish |
| `university_admin` | Universitetdagi syllabuslarni ko'rish va ko'rib chiqish |
| `reviewer` | Syllabuslarni ko'rib chiqish (approve/reject) |
| `teacher` | O'z syllabuslarini yaratish va tahrirlash |

## Lokal ishga tushirish

### Talab

- Docker Desktop

### 1. Klonlash

```bash
git clone https://github.com/Mergan-Amonov/sillabus.git
cd sillabus
```

### 2. Environment

```bash
cp .env.example .env
# .env faylini to'ldiring (POSTGRES_PASSWORD majburiy)
```

### 3. Ishga tushirish

```bash
docker compose up -d --build
```

### 4. Migration va seed (birinchi marta)

```bash
docker exec silabuys_backend alembic upgrade head
```

> Keyingi ishga tushirishlarda migration avtomatik bajariladi (production rejimida).

### 5. Ochish

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |

**Default admin:** `.env` dagi `FIRST_SUPERADMIN_EMAIL` / `FIRST_SUPERADMIN_PASSWORD`

---

## AI Sozlash

Har bir foydalanuvchi **Sozlamalar** sahifasida o'z AI kalitini kiritadi:

| Provayder | Base URL | Model misol |
|-----------|----------|-------------|
| OpenAI | (bo'sh) | `gpt-4o` |
| OpenRouter | `https://openrouter.ai/api/v1` | `google/gemini-2.0-flash-001` |
| Gemini | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |

---

## Production Deploy

### Server tayyorlash (Ubuntu 22.04)

```bash
# Docker o'rnatish
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Loyihani klonlash
git clone https://github.com/Mergan-Amonov/sillabus.git /opt/silabuys
cd /opt/silabuys
```

### Environment sozlash

```bash
cp .env.production.example .env
# .env faylini to'ldiring — barcha CHANGE_THIS qiymatlarini o'zgartiring

# Kuchli kalitlar generatsiya qilish:
python3 -c "import secrets; print(secrets.token_hex(32))"
```

### SSL sertifikat (birinchi marta)

```bash
# .env da DOMAIN va SSL_EMAIL to'ldirilgan bo'lishi kerak
./deploy.sh --ssl
```

### Deploy

```bash
chmod +x deploy.sh
./deploy.sh
```

### Yangilash

```bash
./deploy.sh
```

---

## API Endpoints

### Auth
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/v1/auth/register` | Ro'yxatdan o'tish |
| POST | `/api/v1/auth/login` | Kirish |
| POST | `/api/v1/auth/refresh` | Token yangilash |
| POST | `/api/v1/auth/logout` | Chiqish |
| GET | `/api/v1/auth/me` | Joriy foydalanuvchi |
| PATCH | `/api/v1/auth/me/api-key` | AI sozlamalarini yangilash |

### Syllabus
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| GET | `/api/v1/syllabuses` | Ro'yxat (pagination, filter) |
| POST | `/api/v1/syllabuses` | Yaratish |
| GET | `/api/v1/syllabuses/{id}` | Batafsil ko'rish |
| PATCH | `/api/v1/syllabuses/{id}` | Tahrirlash |
| DELETE | `/api/v1/syllabuses/{id}` | O'chirish |
| POST | `/api/v1/syllabuses/{id}/submit` | Ko'rib chiqishga yuborish |
| POST | `/api/v1/syllabuses/{id}/review` | Tasdiqlash / Rad etish |
| GET | `/api/v1/syllabuses/{id}/versions` | Versiya tarixi |

### AI & Export
| Method | Endpoint | Tavsif |
|--------|----------|--------|
| POST | `/api/v1/ai/generate` | AI syllabus generatsiyasi |
| GET | `/api/v1/export/{id}/pdf` | PDF export |
| GET | `/api/v1/export/{id}/docx` | DOCX export |

---

## Loyiha tuzilishi

```
silabuys/
├── backend/
│   ├── app/
│   │   ├── core/          # Config, DB, security, deps
│   │   ├── modules/
│   │   │   ├── auth/      # Login, register, JWT
│   │   │   ├── syllabus/  # CRUD, workflow
│   │   │   ├── ai/        # OpenAI integration
│   │   │   └── export/    # PDF, DOCX
│   │   └── migrations/    # Alembic
│   ├── Dockerfile
│   ├── entrypoint.sh      # Migration + seed + gunicorn
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router sahifalari
│   │   ├── components/    # UI komponentlar
│   │   ├── hooks/         # Zustand store
│   │   ├── lib/           # API funksiyalar
│   │   └── types/         # TypeScript types
│   └── Dockerfile
├── nginx/
│   ├── nginx.conf         # Production (SSL)
│   └── nginx.dev.conf     # Development
├── .github/workflows/ci.yml
├── docker-compose.yml          # Development
├── docker-compose.prod.yml     # Production
├── deploy.sh
└── .env.production.example
```

## Litsenziya

MIT
