# Deploy Qo'llanmasi

## Server Talablari

| Talab | Minimum | Tavsiya |
|-------|---------|---------|
| CPU | 2 yadro | 4 yadro |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB | 50 GB |
| OS | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |

---

## Server Tayyorlash

### 1. Docker o'rnatish

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker  # Yoki qayta kirish
docker --version  # Tekshirish
```

### 2. Loyihani klonlash

```bash
git clone https://github.com/Mergan-Amonov/sillabus.git /opt/silabuys
cd /opt/silabuys
```

---

## Environment Sozlash

```bash
cp .env.production.example .env
nano .env
```

**Majburiy o'zgartiriladigan qiymatlar:**

```bash
# Kuchli kalitlar generatsiya qilish:
python3 -c "import secrets; print(secrets.token_hex(32))"

# .env dagi ushbu qiymatlarni o'zgartiring:
DOMAIN=sizning-domen.uz
SSL_EMAIL=admin@sizning-domen.uz
NEXT_PUBLIC_API_URL=https://sizning-domen.uz

SECRET_KEY=<yuqoridagi buyruqdan>
JWT_SECRET_KEY=<yuqoridagi buyruqdan, boshqa qiymat>

POSTGRES_PASSWORD=<kuchli parol>
DATABASE_URL=postgresql+asyncpg://silabuys_user:<POSTGRES_PASSWORD>@postgres:5432/silabuys

REDIS_PASSWORD=<kuchli parol>
REDIS_URL=redis://:<REDIS_PASSWORD>@redis:6379/0

MINIO_ACCESS_KEY=<foydalanuvchi nomi>
MINIO_SECRET_KEY=<kamida 8 belgilik parol>

FIRST_SUPERADMIN_EMAIL=admin@sizning-domen.uz
FIRST_SUPERADMIN_PASSWORD=<kuchli parol>

ALLOWED_ORIGINS=https://sizning-domen.uz
```

---

## Nginx Konfiguratsiya

`nginx/nginx.conf` faylida `${DOMAIN}` o'rniga domeningizni qo'ying:

```bash
sed -i "s/\${DOMAIN}/sizning-domen.uz/g" nginx/nginx.conf
```

---

## SSL Sertifikat Olish (birinchi marta)

```bash
chmod +x deploy.sh
./deploy.sh --ssl
```

> Domen DNS-i serverga ko'rsatilgan bo'lishi kerak.

---

## Deploy

```bash
./deploy.sh
```

Skript quyidagilarni bajaradi:
1. `git pull` — yangi kod olish
2. Docker image-larni build qilish
3. Eski konteynerlarni to'xtatish
4. Yangilarini ishga tushirish (migration + seed avtomatik)
5. Health check

---

## Yangilash

Yangi versiyani deploy qilish:

```bash
cd /opt/silabuys
./deploy.sh
```

---

## Monitoring

### Konteynerlar holati

```bash
docker compose -f docker-compose.prod.yml ps
```

### Loglarni ko'rish

```bash
# Backend
docker logs silabuys_backend -f --tail=100

# Frontend
docker logs silabuys_frontend -f --tail=100

# Nginx
docker logs silabuys_nginx -f --tail=100
```

### Resurslar

```bash
docker stats
```

### Health check

```bash
curl https://sizning-domen.uz/health
```

---

## Ma'lumotlar Bazasi Zaxira Nusxasi

### Zaxira olish

```bash
docker exec silabuys_postgres pg_dump \
  -U silabuys_user silabuys \
  > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Zaxiradan tiklash

```bash
docker exec -i silabuys_postgres psql \
  -U silabuys_user silabuys \
  < backup_20250101_120000.sql
```

### Avtomatik kunlik zaxira (crontab)

```bash
crontab -e
# Qo'shing:
0 2 * * * cd /opt/silabuys && docker exec silabuys_postgres pg_dump -U silabuys_user silabuys > /opt/backups/db_$(date +\%Y\%m\%d).sql
```

---

## Xavfsizlik Tekshiruvi

```bash
# Ochiq portlarni tekshirish (faqat 80 va 443 bo'lishi kerak)
ss -tlnp | grep LISTEN

# Firewall
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
sudo ufw status
```

---

## Muammolarni Hal Qilish

### Konteyner ishga tushmayapti

```bash
docker compose -f docker-compose.prod.yml logs backend
```

### SSL sertifikat yangilanmayapti

```bash
docker compose -f docker-compose.prod.yml --profile ssl run --rm certbot renew
docker compose -f docker-compose.prod.yml restart nginx
```

### Disk to'ldi

```bash
# Eski Docker image-larni tozalash
docker system prune -af

# Eski zaxira fayllarni o'chirish
find /opt/backups -name "*.sql" -mtime +30 -delete
```
