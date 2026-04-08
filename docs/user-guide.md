# Foydalanuvchi Qo'llanmasi

## Rollar va huquqlar

| Rol | Syllabus yaratish | Ko'rib chiqish | Tasdiqlash | Foydalanuvchi boshqaruv |
|-----|:-----------------:|:--------------:|:----------:|:------------------------:|
| `super_admin` | ✓ | ✓ | ✓ | ✓ |
| `university_admin` | ✓ | ✓ | ✓ | — |
| `reviewer` | — | ✓ | ✓ | — |
| `teacher` | ✓ | — | — | — |

---

## Tizimga kirish

1. `http://localhost:3000/login` sahifasini oching
2. Email va parolni kiriting
3. **Kirish** tugmasini bosing

Akkaunt yo'q bo'lsa `/register` sahifasida ro'yxatdan o'ting (yoki admin yaratib beradi).

---

## AI Sozlash (birinchi marta)

AI syllabus generatsiyasidan foydalanish uchun avval kalit kiritish kerak.

1. **Sozlamalar** (yon panelda) sahifasiga boring
2. Provayderni tanlang:
   - **OpenAI** — `platform.openai.com/api-keys`
   - **OpenRouter** — `openrouter.ai/keys` (ko'p modellar, arzonroq)
   - **Gemini** — `aistudio.google.com/apikey` (bepul kvota bor)
   - **Boshqa** — istalgan OpenAI-compatible API
3. API kalitni kiriting
4. Model nomini kiriting (masalan: `gpt-4o`, `gemini-2.0-flash`)
5. **Saqlash** tugmasini bosing

---

## Syllabus Yaratish

### Oddiy yo'l

1. Yon paneldan **Yangi syllabus** ni bosing
2. To'ldiring:
   - **Sarlavha** — kurs nomi
   - **Kurs kodi** — masalan `CS101`
   - **Kredit soatlar** — 1–10
   - **Tavsif** va **Maqsadlar** (ixtiyoriy)
3. **Syllabus yaratish** tugmasini bosing

### AI yordamida

1. Sarlavha va kurs kodini kiriting
2. **AI yaratsin** tugmasini bosing
3. AI kontent avtomatik yaratiladi
4. Kerak bo'lsa tahrir qiling
5. **Syllabus yaratish** ni bosing

---

## Syllabus Jarayoni

### O'qituvchi uchun

```
Yaratish → Tahrirlash → Ko'rib chiqishga yuborish → Natijani kutish
```

1. Syllabusni yarating (`QORALAMA` holat)
2. Tahrirlash sahifasida o'zgartiring
3. **Ko'rib chiqishga yuborish** tugmasini bosing
4. `KO'RIB CHIQILMOQDA` holatga o'tadi
5. Natija: **Tasdiqlangan** yoki **Rad etilgan**
6. Rad etilsa — izohni o'qib, tahrirlang va qayta yuboring

### Ko'rib chiquvchi uchun

1. **Syllabuslar** ro'yxatida `KO'RIB CHIQILMOQDA` filtri
2. Syllabusni oching
3. **Ko'rib chiqish** tugmasini bosing
4. Izoh yozing (ixtiyoriy)
5. **Tasdiqlash** yoki **Rad etish**

---

## Eksport

Tasdiqlangan syllabusni yuklab olish:

1. Syllabus sahifasini oching
2. **PDF** yoki **DOCX** tugmasini bosing
3. Fayl avtomatik yuklanadi

---

## Foydalanuvchi Boshqaruvi (Super Admin)

1. Yon paneldan **Foydalanuvchilar** ni bosing
2. **Yangi foydalanuvchi** tugmasini bosing
3. To'ldiring:
   - **To'liq ism**
   - **Email** — login uchun ishlatiladi
   - **Parol** — kamida 8 belgi
   - **Rol** — huquqlarni belgilaydi
4. **Yaratish** tugmasini bosing

Foydalanuvchi darhol tizimga kira oladi.

### Foydalanuvchini tahrirlash

Jadvalda qalam belgisini bosing → Ism, rol yoki holatni o'zgartiring → Saqlash.

### Foydalanuvchini bloklash

Tahrirlash modalida **Faol akkaunt** tugmachasini o'chiring. Bloklangan foydalanuvchi tizimga kira olmaydi.

---

## Versiya Tarixi

Har bir o'zgartirish avtomatik saqlanadi. Syllabus sahifasida **Versiyalar** tugmasi orqali oldingi holatlarni ko'rish mumkin.

---

## Tez-tez so'raladigan savollar

**Parolimni unutdim. Nima qilaman?**  
Hozircha parolni tiklash funksiyasi yo'q. Admin bilan bog'laning — u yangi parol bilan akkaunt yaratib beradi.

**AI generatsiya ishlamayapti?**  
Sozlamalar sahifasida API kalit kiritilganligini tekshiring. Kalit noto'g'ri bo'lsa, yangi kalit kiriting.

**Rate limit xatosi chiqdi?**  
AI so'rovlar soatiga 20 ta bilan cheklangan. Bir soat kutib, qayta urinib ko'ring.

**Tasdiqlangan syllabusni tahrirlasa bo'ladimi?**  
Yo'q. Avval `ARXIVLANGAN` holatga o'tkazilishi kerak (admin tomonidan). Keyin yangi versiya yaratiladi.
