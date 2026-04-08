# Silabuys

> Universitetlar uchun AI yordamida syllabus yaratish, tasdiqlash va boshqarish platformasi.

[![CI](https://github.com/Mergan-Amonov/sillabus/actions/workflows/ci.yml/badge.svg)](https://github.com/Mergan-Amonov/sillabus/actions/workflows/ci.yml)
[![Python](https://img.shields.io/badge/Python-3.12-blue)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Mundarija

- [Loyiha haqida](#loyiha-haqida)
- [Imkoniyatlar](#imkoniyatlar)
- [Tech Stack](#tech-stack)
- [Tezkor ishga tushirish](#tezkor-ishga-tushirish)
- [Rollar](#rollar)
- [AI Sozlash](#ai-sozlash)
- [Hujjatlar](#hujjatlar)
- [Loyiha tuzilishi](#loyiha-tuzilishi)
- [Hissa qo'shish](#hissa-qoshish)
- [Litsenziya](#litsenziya)

---

## Loyiha haqida

**Silabuys** — o'quv dasturlarini (syllabus) raqamli boshqarish uchun mo'ljallangan veb-platforma. O'qituvchilar syllabus yaratadi, ko'rib chiquvchilar tasdiqlaydi, tasdiqlangan syllabuslar PDF/DOCX formatida eksport qilinadi.

### Syllabus Jarayoni

```
O'qituvchi          Ko'rib chiquvchi        Eksport
    │                      │                   │
 Yaratish              Ko'rib chiqish         PDF
 Tahrirlash    ──►     Tasdiqlash    ──►      DOCX
 AI bilan              Rad etish
```

---

## Imkoniyatlar

| Imkoniyat | Tavsif |
|-----------|--------|
| 🤖 AI Generatsiya | OpenAI, OpenRouter, Gemini orqali syllabus kontentini avtomatik yaratish |
| 👥 Rollar | 4 ta rol: Super Admin, Universitet Admin, Ko'rib chiquvchi, O'qituvchi |
| ✅ Workflow | Qoralama → Ko'rib chiqish → Tasdiqlangan/Rad etilgan |
| 📋 Versiya tarixi | Har bir o'zgarish avtomatik saqlanadi |
| 📄 Eksport | PDF va DOCX formatlarida yuklab olish |
| 🔑 Shaxsiy AI kalit | Har bir foydalanuvchi o'z AI kalitini ishlatadi |
| 👤 Foydalanuvchi boshqaruvi | Admin paneldan akkaunt yaratish va boshqarish |
| 🛡️ Xavfsizlik | JWT, bcrypt, Rate limiting, Audit log |

---

## Tech Stack

| Qatlam | Texnologiya |
|--------|-------------|
| **Frontend** | Next.js 15, React 19, TypeScript, Tailwind CSS, Zustand |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Alembic, Pydantic v2 |
| **Database** | PostgreSQL 16 |
| **Cache** | Redis 7 |
| **Storage** | MinIO (S3-compatible) |
| **AI** | OpenAI / OpenRouter / Gemini |
| **Proxy** | Nginx |
| **Container** | Docker, Docker Compose |
| **CI/CD** | GitHub Actions |

---

## Tezkor Ishga Tushirish

### Talab

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) o'rnatilgan

### Qadamlar

```bash
# 1. Klonlash
git clone https://github.com/Mergan-Amonov/sillabus.git
cd sillabus

# 2. Environment sozlash
cp .env.example .env
```

`.env` faylida `POSTGRES_PASSWORD` ni o'zgartiring, qolganlarini default qoldirishingiz mumkin.

```bash
# 3. Ishga tushirish
docker compose up -d --build

# 4. Migration (birinchi marta)
docker exec silabuys_backend alembic upgrade head
```

### Manzillar

| Servis | URL |
|--------|-----|
| 🌐 Frontend | http://localhost:3000 |
| ⚙️ Backend API | http://localhost:8000 |
| 📖 API Docs | http://localhost:8000/docs |
| 🗄️ MinIO Console | http://localhost:9001 |

### Admin kirish

`.env` faylidagi `FIRST_SUPERADMIN_EMAIL` va `FIRST_SUPERADMIN_PASSWORD` qiymatlari bilan kiring.

Default: `admin@silabuys.uz` / `Admin123!!`

---

## Rollar

| Rol | Syllabus yaratish | Ko'rib chiqish | Tasdiqlash | Foydalanuvchi boshqaruvi |
|-----|:-----------------:|:--------------:|:----------:|:------------------------:|
| `super_admin` | ✅ | ✅ | ✅ | ✅ |
| `university_admin` | ✅ | ✅ | ✅ | — |
| `reviewer` | — | ✅ | ✅ | — |
| `teacher` | ✅ | — | — | — |

---

## AI Sozlash

Har bir foydalanuvchi **Sozlamalar** sahifasida o'z AI kalitini kiritadi. Quyidagi provayderlar qo'llab-quvvatlanadi:

| Provayder | Base URL | Model misoli |
|-----------|----------|--------------|
| **OpenAI** | *(bo'sh)* | `gpt-4o` |
| **OpenRouter** | `https://openrouter.ai/api/v1` | `google/gemini-2.0-flash-001` |
| **Gemini** | `https://generativelanguage.googleapis.com/v1beta/openai/` | `gemini-2.0-flash` |
| **Boshqa** | Istalgan OpenAI-compatible URL | — |

---

## Hujjatlar

| Hujjat | Tavsif |
|--------|--------|
| [📐 Arxitektura](docs/architecture.md) | Tizim arxitekturasi, DB sxemasi, workflow |
| [🔌 API Reference](docs/api.md) | Barcha endpoint'lar batafsil tavsifi |
| [👤 Foydalanuvchi qo'llanmasi](docs/user-guide.md) | Platforma bilan ishlash bo'yicha yo'riqnoma |
| [🚀 Deploy qo'llanmasi](docs/deployment.md) | Production server-ga joylashtirish |
| [💻 Ishlab chiqish](docs/development.md) | Lokal muhit sozlash va kod yozish |
| [📋 O'zgarishlar jurnali](CHANGELOG.md) | Versiyalar tarixi |

---

## Loyiha Tuzilishi

```
silabuys/
├── backend/                    # FastAPI backend
│   ├── app/
│   │   ├── core/               # Konfiguratsiya, DB, xavfsizlik
│   │   ├── modules/
│   │   │   ├── auth/           # Autentifikatsiya va foydalanuvchilar
│   │   │   ├── syllabus/       # Syllabus CRUD va workflow
│   │   │   ├── ai/             # AI generatsiya
│   │   │   └── export/         # PDF va DOCX eksport
│   │   └── migrations/         # Alembic migratsiyalar
│   ├── tests/                  # Avtomatik testlar
│   ├── entrypoint.sh           # Migration + seed + server ishga tushirish
│   └── Dockerfile              # Dev va Production stage-lar
│
├── frontend/                   # Next.js frontend
│   └── src/
│       ├── app/                # Sahifalar (App Router)
│       │   ├── (auth)/         # Login, Register
│       │   └── (dashboard)/    # Protected sahifalar
│       ├── components/         # UI komponentlar
│       ├── hooks/              # Zustand store
│       ├── lib/                # API funksiyalar
│       └── types/              # TypeScript interfeyslari
│
├── nginx/
│   ├── nginx.conf              # Production (SSL + security)
│   └── nginx.dev.conf          # Development proxy
│
├── docs/                       # Hujjatlar
├── .github/workflows/ci.yml    # GitHub Actions CI/CD
├── docker-compose.yml          # Development muhit
├── docker-compose.prod.yml     # Production muhit
├── deploy.sh                   # Bir buyruqli deploy skript
└── .env.production.example     # Production env namunasi
```

---

## Hissa Qo'shish

[CONTRIBUTING.md](CONTRIBUTING.md) ni o'qing. Xato topgan bo'lsangiz [Issue oching](https://github.com/Mergan-Amonov/sillabus/issues).

---

## Litsenziya

[MIT](LICENSE) © 2025 Silabuys
