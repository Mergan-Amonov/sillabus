# Arxitektura

## Umumiy ko'rinish

```
┌─────────────────────────────────────────────────────────┐
│                      Brauzer / Client                    │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────┐
│                     Nginx (Reverse Proxy)                │
│          SSL termination · Rate limiting · Gzip          │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
┌──────────────────────┐   ┌─────────────────────────────┐
│  Frontend (Next.js)  │   │    Backend (FastAPI)         │
│  Port: 3000          │   │    Port: 8000                │
│                      │   │                              │
│  • App Router        │   │  • Auth modul               │
│  • Zustand store     │   │  • Syllabus modul           │
│  • Tailwind CSS      │   │  • AI modul                 │
│  • React Hook Form   │   │  • Export modul             │
└──────────────────────┘   └────┬──────────┬─────────────┘
                                │          │
               ┌────────────────┘          └──────────────┐
               ▼                                          ▼
┌──────────────────────┐              ┌───────────────────────┐
│  PostgreSQL 16       │              │  Redis 7              │
│  • users             │              │  • Rate limiting      │
│  • syllabuses        │              │  • Session cache      │
│  • refresh_tokens    │              └───────────────────────┘
│  • audit_logs        │
│  • syllabus_versions │              ┌───────────────────────┐
└──────────────────────┘              │  MinIO                │
                                      │  • PDF/DOCX fayllar  │
                                      └───────────────────────┘
```

---

## Backend Arxitekturasi

### Modul tuzilishi

Har bir modul o'zining `models`, `schemas`, `service`, `router` fayllariga ega:

```
modules/
├── auth/
│   ├── models.py     # SQLAlchemy modellari (User, University, RefreshToken)
│   ├── schemas.py    # Pydantic sxemalar (request/response)
│   ├── service.py    # Biznes mantiq
│   └── router.py     # FastAPI endpoint'lar
├── syllabus/
│   ├── models.py     # Syllabus, SyllabusVersion
│   ├── schemas.py
│   ├── service.py
│   └── router.py
├── ai/
│   ├── prompts/v1.py # System prompt va template
│   ├── schemas.py
│   ├── service.py    # OpenAI API integratsiya
│   └── router.py
└── export/
    ├── service.py    # ReportLab (PDF), python-docx (DOCX)
    └── router.py
```

### Ma'lumotlar oqimi

```
HTTP Request
    │
    ▼
Router (FastAPI endpoint)
    │
    ├── Dependency injection
    │   ├── get_db() → AsyncSession
    │   └── get_current_active_user() → User
    │
    ▼
Service (biznes mantiq)
    │
    ├── Validatsiya
    ├── DB so'rovlar (SQLAlchemy)
    └── Tashqi API (OpenAI)
    │
    ▼
Response (Pydantic schema)
```

---

## Frontend Arxitekturasi

### Next.js App Router tuzilishi

```
src/app/
├── (auth)/               # Auth sahifalar (layout yo'q)
│   ├── login/
│   └── register/
├── (dashboard)/          # Protected sahifalar (Sidebar layout)
│   └── dashboard/
│       ├── page.tsx          # Bosh sahifa
│       ├── syllabuses/       # Syllabus boshqaruv
│       ├── users/            # Foydalanuvchi boshqaruv
│       └── settings/         # Shaxsiy sozlamalar
└── page.tsx              # Redirect (login yoki dashboard)
```

### State boshqaruvi

```
Zustand Store (useAuthStore)
├── user: User | null
├── hydrated: boolean
├── setUser()
└── logout()
        │
        ▼ persist (localStorage)
Cookie Storage
├── sb_access_token (15 daqiqa)
└── sb_refresh_token (7 kun)
```

### API so'rovlar

```
lib/api.ts (Axios instance)
├── Interceptor: JWT token qo'shish
├── Interceptor: 401 → token yangilash → qayta yuborish
└── Interceptor: xatolik → /login ga yo'naltirish

lib/auth.ts      → /auth/* endpoint'lar
lib/syllabuses.ts → /syllabuses/* endpoint'lar
lib/users.ts      → /auth/users/* endpoint'lar
```

---

## Database Sxemasi

### Asosiy jadvallar

**universities**
```
id (UUID PK) | name | slug (UNIQUE) | schema_name | is_active | created_at
```

**users**
```
id (UUID PK) | email (UNIQUE) | hashed_password | full_name
role (userrole ENUM) | is_active | university_id (FK)
openai_api_key | ai_base_url | ai_model
created_at | updated_at
```

**syllabuses**
```
id (UUID PK) | title | course_code | credit_hours
description | objectives | content (JSON)
status (syllabusstatus ENUM) | university_id
created_by (FK users) | reviewed_by (FK users)
review_comment | reviewed_at | created_at | updated_at
```

**syllabus_versions** (o'zgarmas snapshot)
```
id (UUID PK) | syllabus_id (FK) | version_number
snapshot (JSON) | changed_by | created_at
```

**refresh_tokens**
```
id (UUID PK) | token (UNIQUE) | user_id (FK) | expires_at | revoked | created_at
```

**audit_logs** (faqat yozish, o'chirish taqiqlangan — RLS)
```
id (UUID PK) | user_id | action | resource_type | resource_id | details | ip_address | created_at
```

### ENUM turlari

```sql
userrole:      super_admin | university_admin | reviewer | teacher
syllabusstatus: draft | pending_review | approved | rejected | archived
```

---

## Xavfsizlik

### JWT

- **Access token**: 15 daqiqa muddatli, har so'rovda yuboriladi
- **Refresh token**: 7 kunlik, faqat yangilash uchun, DB-da saqlanadi va bekor qilinadi (revoke)
- Tokenlar `HttpOnly`-ga yaqin — js-cookie orqali, `secure: true`, `sameSite: strict`

### Parol

- bcrypt (work factor 12) bilan hash qilinadi
- Minimal: 8 belgi, bitta katta harf, bitta raqam

### Rate Limiting

- AI generatsiya: soatiga 20 ta so'rov (Redis-da saqlanadi)
- Nginx: API uchun minutiga 30, login uchun minutiga 10

### Audit Log

- Barcha muhim amallar (login, register, yaratish) `audit_logs` jadvalida saqlanadi
- PostgreSQL RLS orqali `UPDATE` va `DELETE` taqiqlangan

---

## Syllabus Workflow

```
         yaratish
O'qituvchi ──────► DRAFT
                     │
                     │ submit
                     ▼
               PENDING_REVIEW
                     │
          ┌──────────┴──────────┐
          │ approve             │ reject
          ▼                     ▼
       APPROVED             REJECTED
          │                     │
          │                     │ tahrirlash
          ▼                     ▼
       ARCHIVED              DRAFT
```
