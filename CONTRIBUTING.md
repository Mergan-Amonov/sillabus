# Hissa Qo'shish Qo'llanmasi

Loyihaga hissa qo'shmoqchi bo'lganingiz uchun rahmat!

## Qanday boshlash kerak

1. Repozitoriyni fork qiling
2. Feature branch oching:
   ```bash
   git checkout -b feature/yangi-imkoniyat
   ```
3. O'zgarishlarni qiling
4. Commit qiling:
   ```bash
   git commit -m "feat: yangi imkoniyat qo'shildi"
   ```
5. Push qiling va Pull Request oching

## Commit Xabarlari Formati

```
<tur>: <qisqacha tavsif>

Turlar:
  feat     — yangi imkoniyat
  fix      — xato tuzatish
  docs     — hujjat o'zgarishi
  refactor — qayta tuzish (funksiya o'zgarmaydi)
  test     — test qo'shish/o'zgartirish
  chore    — konfiguratsiya, build o'zgarishi
```

## Kod Uslubi

**Backend (Python):**
- PEP 8 ga rioya qiling
- Funksiyalar uchun type hint ishlating
- Async/await ishlatilsin

**Frontend (TypeScript):**
- `"use client"` faqat kerak bo'lganda
- Props uchun interfeys yozing
- `any` tipi ishlatmang

## Pull Request

- Nima qilingani va nima uchun qilingani tushuntiring
- Testlar o'tganligini tekshiring
- Bir PR — bir o'zgarish
