# API Reference

**Base URL:** `http://localhost:8000/api/v1`  
**Interaktiv hujjat:** `http://localhost:8000/docs` (faqat development rejimida)

Barcha so'rovlar `Content-Type: application/json` sarlavhasi bilan yuborilishi kerak.  
Himoyalangan endpoint'lar uchun `Authorization: Bearer <access_token>` sarlavhasi qo'shiladi.

---

## Autentifikatsiya

### POST `/auth/register`

Yangi foydalanuvchi ro'yxatdan o'tkazish.

**So'rov:**
```json
{
  "email": "jasur@university.uz",
  "password": "Parol123",
  "full_name": "Jasur Ahmadov",
  "university_id": "uuid (ixtiyoriy)"
}
```

**Javob:** `201 Created`
```json
{
  "id": "uuid",
  "email": "jasur@university.uz",
  "full_name": "Jasur Ahmadov",
  "role": "teacher",
  "is_active": true,
  "university_id": null,
  "created_at": "2025-01-01T00:00:00Z",
  "has_openai_key": false,
  "ai_base_url": null,
  "ai_model": null
}
```

**Xatolar:**
| Kod | Sabab |
|-----|-------|
| 409 | Email allaqachon mavjud |
| 422 | Validatsiya xatosi (parol zaif, email noto'g'ri) |

---

### POST `/auth/login`

Tizimga kirish va tokenlar olish.

**So'rov:**
```json
{
  "email": "jasur@university.uz",
  "password": "Parol123"
}
```

**Javob:** `200 OK`
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Xatolar:**
| Kod | Sabab |
|-----|-------|
| 403 | Email yoki parol noto'g'ri |

---

### POST `/auth/refresh`

Access tokenni yangilash.

**So'rov:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Javob:** `200 OK` — yangi `access_token` va `refresh_token`

---

### POST `/auth/logout`

Chiqish (refresh tokenni bekor qilish).

**So'rov:**
```json
{
  "refresh_token": "eyJ..."
}
```

**Javob:** `204 No Content`

---

### GET `/auth/me` 🔒

Joriy foydalanuvchi ma'lumotlari.

**Javob:** `200 OK` — `UserResponse` ob'ekti

---

### PATCH `/auth/me/api-key` 🔒

Shaxsiy AI sozlamalarini yangilash.

**So'rov:**
```json
{
  "openai_api_key": "sk-proj-...",
  "ai_base_url": "https://openrouter.ai/api/v1",
  "ai_model": "google/gemini-2.0-flash-001"
}
```

> Barcha maydonlar ixtiyoriy. `null` yuborish — o'chirish.

**Javob:** `200 OK` — yangilangan `UserResponse`

---

## Foydalanuvchilar Boshqaruvi (faqat super_admin)

### GET `/auth/users` 🔒👑

Barcha foydalanuvchilar ro'yxati.

**Query parametrlar:**
| Parametr | Tur | Default | Tavsif |
|----------|-----|---------|--------|
| page | int | 1 | Sahifa raqami |
| size | int | 20 | Bir sahifadagi yozuvlar |

**Javob:** `200 OK`
```json
{
  "items": [ /* UserResponse[] */ ],
  "total": 42
}
```

---

### POST `/auth/users` 🔒👑

Yangi foydalanuvchi yaratish (admin tomonidan).

**So'rov:**
```json
{
  "email": "yangi@university.uz",
  "password": "Parol123",
  "full_name": "Yangi Foydalanuvchi",
  "role": "teacher",
  "university_id": "uuid (ixtiyoriy)",
  "is_active": true
}
```

**Rollar:** `super_admin` | `university_admin` | `reviewer` | `teacher`

**Javob:** `201 Created` — `UserResponse`

---

### PATCH `/auth/users/{user_id}` 🔒👑

Foydalanuvchini yangilash.

**So'rov:**
```json
{
  "full_name": "Yangi Ism",
  "role": "reviewer",
  "is_active": false,
  "university_id": "uuid"
}
```

**Javob:** `200 OK` — yangilangan `UserResponse`

---

### DELETE `/auth/users/{user_id}` 🔒👑

Foydalanuvchini o'chirish.

**Javob:** `204 No Content`

---

## Syllabuslar

### GET `/syllabuses` 🔒

Syllabuslar ro'yxati. Ko'rish huquqi rolga qarab:
- `teacher` — faqat o'z syllabuslarini ko'radi
- `reviewer`, `university_admin` — universitetdagilarni ko'radi
- `super_admin` — hammasini ko'radi

**Query parametrlar:**
| Parametr | Tur | Tavsif |
|----------|-----|--------|
| page | int | Sahifa (default: 1) |
| size | int | Hajm (default: 20, max: 100) |
| status | string | Filter: `draft`, `pending_review`, `approved`, `rejected`, `archived` |

**Javob:** `200 OK`
```json
{
  "items": [ /* SyllabusResponse[] */ ],
  "total": 15,
  "page": 1,
  "size": 20
}
```

---

### POST `/syllabuses` 🔒

Yangi syllabus yaratish. Faqat `teacher` va undan yuqori rollar.

**So'rov:**
```json
{
  "title": "Dasturlash asoslari",
  "course_code": "CS101",
  "credit_hours": 3,
  "description": "Kurs haqida tavsif (ixtiyoriy)",
  "objectives": "Kurs maqsadlari (ixtiyoriy)",
  "content": { "hafta_1": "Kirish" }
}
```

**Javob:** `201 Created` — `SyllabusResponse`

---

### GET `/syllabuses/{id}` 🔒

Syllabusni batafsil ko'rish.

**Javob:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Dasturlash asoslari",
  "course_code": "CS101",
  "credit_hours": 3,
  "description": "...",
  "objectives": "...",
  "content": {},
  "status": "draft",
  "university_id": "uuid",
  "created_by": "uuid",
  "reviewed_by": null,
  "review_comment": null,
  "reviewed_at": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

---

### PATCH `/syllabuses/{id}` 🔒

Syllabusni yangilash. Faqat yaratuvchi yoki admin.  
`APPROVED` holatdagi syllabusni tahrirlash mumkin emas.

**So'rov:**
```json
{
  "title": "Yangilangan sarlavha",
  "credit_hours": 4,
  "description": "...",
  "objectives": "...",
  "content": {}
}
```

---

### DELETE `/syllabuses/{id}` 🔒

Syllabusni o'chirish. Faqat `draft` yoki `rejected` holatda.

**Javob:** `204 No Content`

---

### POST `/syllabuses/{id}/submit` 🔒

Syllabusni ko'rib chiqishga yuborish.  
Faqat yaratuvchi, faqat `draft` holatda.

**Javob:** `200 OK` — status `pending_review` ga o'tadi

---

### POST `/syllabuses/{id}/review` 🔒

Syllabusni tasdiqlash yoki rad etish.  
Faqat `reviewer`, `university_admin`, `super_admin`.

**So'rov:**
```json
{
  "action": "approve",
  "comment": "Yaxshi tayyorlangan (ixtiyoriy)"
}
```

`action`: `approve` | `reject`

**Javob:** `200 OK` — yangilangan holat

---

### GET `/syllabuses/{id}/versions` 🔒

Syllabus versiya tarixi.

**Javob:** `200 OK`
```json
[
  {
    "id": "uuid",
    "syllabus_id": "uuid",
    "version_number": 3,
    "snapshot": { "title": "...", "status": "draft", ... },
    "changed_by": "uuid",
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

---

## AI Generatsiya

### POST `/ai/generate` 🔒

Syllabus kontentini AI yordamida yaratish.  
Rate limit: soatiga 20 ta so'rov.  
Foydalanuvchi o'z AI kalitini **Sozlamalar** sahifasida kiritishi kerak.

**So'rov:**
```json
{
  "course_title": "Dasturlash asoslari",
  "course_code": "CS101",
  "credit_hours": 3,
  "level": "Bakalavr (ixtiyoriy)",
  "department": "Kompyuter fanlari (ixtiyoriy)",
  "instructions": "Qo'shimcha ko'rsatmalar (ixtiyoriy)"
}
```

**Javob:** `200 OK`
```json
{
  "prompt_version": "v1",
  "generated": {
    "course_description": "...",
    "learning_objectives": [...],
    "weekly_schedule": [...],
    "assessment": {...},
    "resources": [...]
  },
  "tokens_used": 1842
}
```

**Xatolar:**
| Kod | Sabab |
|-----|-------|
| 400 | API kalit kiritilmagan |
| 429 | Rate limit oshdi |

---

## Eksport

### GET `/export/{id}/pdf` 🔒

Syllabusni PDF formatida yuklab olish.

**Javob:** `200 OK`  
`Content-Type: application/pdf`  
`Content-Disposition: attachment; filename="syllabus_CS101.pdf"`

---

### GET `/export/{id}/docx` 🔒

Syllabusni DOCX formatida yuklab olish.

**Javob:** `200 OK`  
`Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document`

---

## Health Check

### GET `/health`

Tizim holati.

**Javob:** `200 OK`
```json
{
  "status": "ok",
  "app": "SilaBuys"
}
```

---

## Umumiy xatoliklar

| Kod | Ma'no | Tavsif |
|-----|-------|--------|
| 400 | Bad Request | Noto'g'ri so'rov |
| 401 | Unauthorized | Token yo'q yoki muddati o'tgan |
| 403 | Forbidden | Ruxsat yo'q |
| 404 | Not Found | Resurs topilmadi |
| 409 | Conflict | Mavjud resurs bilan to'qnashuv |
| 422 | Unprocessable Entity | Validatsiya xatosi |
| 429 | Too Many Requests | Rate limit oshdi |
| 500 | Internal Server Error | Server xatosi |

**Xato javobi formati:**
```json
{
  "detail": "Xato tavsifi"
}
```

---

## Belgilar

| Belgi | Ma'no |
|-------|-------|
| 🔒 | Avtorizatsiya talab qiladi |
| 👑 | Faqat `super_admin` |
