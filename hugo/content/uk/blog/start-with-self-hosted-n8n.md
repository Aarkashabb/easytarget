---
title: "Self-Hosted N8N: повний гайд з production розгортання (2026)"
date: 2026-05-26
lastmod: 2026-05-27
description: "Покрокова інструкція з розгортання production-ready self-hosted N8N з Docker, PostgreSQL, HTTPS, автоматичними бекапами та моніторингом. Best practices безпеки включені."
image: "/images/blog/start-with-self-hosted-n8n-hero.jpg"
tags: ["N8N", "Self-Hosting", "DevOps", "Docker", "Автоматизація"]
keywords: ["self-hosted n8n", "n8n docker", "n8n налаштування", "n8n на своєму сервері"]
author: "Ivan Blagoveshchenskyi"
draft: false
---

N8N Cloud коштує $20+/місяць вже при базовому використанні. Self-hosted на VPS за $6-12 — і ви маєте необмежену кількість executions, повний контроль над даними та жодних сюрпризів у рахунку. У цьому гайді пройдемо шлях від чистого VPS до production-ready N8N з HTTPS, PostgreSQL, автоматичними бекапами та моніторингом.

### Що ви отримаєте після цього гайду:

- Production N8N з PostgreSQL, Traefik та автоматичним HTTPS
- Автоматичні щоденні бекапи з ротацією та off-site storage
- Моніторинг та алерти на Telegram/Slack
- Чек-лист production readiness з 15 пунктів

> **Кому НЕ підходить:** якщо у вас менше 50 workflows і немає технічної людини в команді — N8N Cloud простіше. Self-hosted виправданий при 500+ executions/день, вимогах GDPR або бажанні повного контролю.

## Self-hosted N8N vs N8N Cloud — що вибрати

Перш ніж занурюватися в технічні деталі — вирішіть, чи взагалі потрібен self-hosted.

![Порівняння N8N Cloud та Self-hosted](/images/blog/n8n-cloud-vs-self-hosted.jpg)

| Параметр | N8N Cloud | Self-hosted |
|----------|-----------|-------------|
| **Ціна (базова)** | $20/міс (2 500 executions) | $6-12/міс (необмежено) |
| **Час на setup** | ✅ 5 хвилин | ❌ 2-4 години |
| **Контроль даних** | ❌ Дані на серверах N8N | ✅ Повний контроль |
| **GDPR/Compliance** | ❌ Обмежений | ✅ Повний |
| **Оновлення** | ✅ Автоматично | ❌ Вручну |
| **Масштабування** | ❌ Дорого | ✅ Горизонтально |
| **Backup** | ✅ Вбудований | ❌ Самостійно |
| **Кастомізація** | ❌ Обмежена | ✅ Повна |

Self-hosted виправданий якщо: ви обробляєте 500+ executions/день; є вимоги GDPR або корпоративної безпеки; потрібні кастомні ноди або модифікації; вам важливо уникнути vendor lock-in; або просто хочете платити менше при великому обсязі.

Якщо ще не визначилися з платформою взагалі — почніть з нашого [порівняння Make vs Zapier vs N8N](/blog/make-vs-zapier-vs-n8n-2026/).

## Що знадобиться

### Залізо (VPS):
- **Мінімум:** 1 vCPU, 1 GB RAM, 10 GB SSD — для тесту
- **Production:** 2 vCPU, 4 GB RAM, 40 GB SSD — обов'язково
- **Рекомендовані провайдери:** Hetzner CX21 ($6/міс), DigitalOcean ($12/міс), Vultr

### Програмне забезпечення:
- Ubuntu 22.04 LTS або Debian 12
- Docker 24+ та Docker Compose v2
- Домен з DNS A-записом на IP вашого VPS

### Необхідні навики:
- Базовий Linux CLI (cd, ls, nano/vim)
- SSH-доступ до сервера
- Базове розуміння Docker volumes

## Крок 1 — Підготовка VPS

Підключаємося до сервера та виконуємо базове налаштування безпеки. Цей скрипт встановить Docker і налаштує файрвол:

```bash
# Оновлення системи
apt update && apt upgrade -y

# Встановлення залежностей
apt install -y curl git ufw fail2ban

# Налаштування UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Встановлення Docker
curl -fsSL https://get.docker.com | sh

# Додавання юзера до групи docker
usermod -aG docker $USER

# Перевірка
docker --version && docker compose version
```

> 💡 **Порада:** обов'язково вимкніть password-login для SSH. В `/etc/ssh/sshd_config` встановіть `PasswordAuthentication no` та перезапустіть: `systemctl restart sshd`

## Крок 2 — Розгортання N8N через Docker Compose

![Архітектура self-hosted N8N: VPS, Traefik reverse proxy, N8N, PostgreSQL, Cron у Docker network](/images/blog/n8n-self-hosted-architecture.jpg)

Створюємо структуру директорій та основний `docker-compose.yml` файл з PostgreSQL та Traefik:

```bash
# Структура директорій
mkdir -p /opt/n8n/{data,postgres,traefik/certs}
cd /opt/n8n
```

Створюємо файл `.env` з усіма змінними (замініть значення на свої):

```bash
# /opt/n8n/.env
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.yourdomain.com/

# Database
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Security — генеруємо: openssl rand -hex 32
N8N_ENCRYPTION_KEY=GENERATE_WITH_OPENSSL

# Basic Auth
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=STRONG_PASSWORD_HERE

# Email для Let's Encrypt
ACME_EMAIL=your@email.com
```

Тепер `docker-compose.yml` — серце вашого деплою:

```yaml
# /opt/n8n/docker-compose.yml
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    restart: unless-stopped
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/certs:/certs
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.email=${ACME_EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/certs/acme.json
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true

  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - ./postgres:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U ${POSTGRES_USER}']
      interval: 10s
      timeout: 5s
      retries: 5

  n8n:
    image: n8nio/n8n:latest
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    env_file: .env
    volumes:
      - ./data:/home/node/.n8n
    labels:
      - traefik.enable=true
      - traefik.http.routers.n8n.rule=Host(`${N8N_HOST}`)
      - traefik.http.routers.n8n.entrypoints=websecure
      - traefik.http.routers.n8n.tls.certresolver=letsencrypt
```

```bash
# Запуск
docker compose up -d

# Перевірка логів
docker compose logs -f n8n

# Перевірка статусу
docker compose ps
```

> ⚠️ **КРИТИЧНО:** збережіть `N8N_ENCRYPTION_KEY` в надійному місці (1Password, Bitwarden). Якщо ключ загублено — всі credentials у workflows стануть недійсними і відновленню не підлягають.

## Крок 3 — HTTPS і безпека

HTTPS налаштовується автоматично через Traefik і Let's Encrypt — сертифікат видається при першому запуску. Переконайтеся, що DNS A-запис вже вказує на ваш IP до запуску.

### Додаткові заходи безпеки:
- Basic Auth вже включений у `.env` — змініть default credentials
- Регулярні оновлення: `docker compose pull && docker compose up -d`
- `fail2ban` захищає від brute-force атак (встановлено на Кроці 1)
- Для enterprise: розгляньте Authelia або Authentik як OAuth2 proxy

Загальні принципи безпеки для no-code/low-code інфраструктури — у нашому гайді [best practices безпеки для no-code автоматизації](/blog/security-best-practices-no-code-automation/).

> 💡 **Потрібна допомога з налаштуванням безпеки для вашого N8N?** [Забронюйте безкоштовну консультацію](https://calendly.com/blagoveshchenskyivan/30min).

## Крок 4 — Стратегія бекапу

> ⚠️ **КРИТИЧНО:** бекап без перевірки відновлення — не бекап. Протестуйте restore процедуру хоча б раз перед тим, як покластися на цю систему.

Що потрібно бекапити: PostgreSQL дамп, `.n8n` директорія з workflows, та `.env` файл (особливо encryption key).

```bash
#!/bin/bash
# /opt/n8n/backup.sh
BACKUP_DIR=/backups/n8n
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL dump
docker exec n8n-postgres-1 pg_dump -U n8n n8n \
  > $BACKUP_DIR/postgres_$DATE.sql

# N8N data folder
tar -czf $BACKUP_DIR/n8n_data_$DATE.tar.gz /opt/n8n/data

# Видалення бекапів старше 7 днів
find $BACKUP_DIR -name '*.sql' -mtime +7 -delete
find $BACKUP_DIR -name '*.tar.gz' -mtime +7 -delete

# Off-site upload (rclone має бути налаштований)
rclone copy $BACKUP_DIR remote:n8n-backups/

echo "Backup completed: $DATE"
```

```bash
# Зробіть скрипт виконуваним та додайте в cron
chmod +x /opt/n8n/backup.sh

# Щоденний бекап о 3:00 ночі
echo '0 3 * * * /opt/n8n/backup.sh >> /var/log/n8n-backup.log 2>&1' | crontab -
```

## Крок 5 — Моніторинг та observability

- **Health check:** відкрийте `https://n8n.yourdomain.com/healthz` — повинен повернути `{"status":"ok"}`
- **Uptime Kuma** (self-hosted): ідеальний для HTTP monitoring з Telegram алертами
- **BetterStack** або **UptimeRobot:** cloud альтернатива з безкоштовним планом
- **Portainer:** web UI для управління Docker контейнерами
- **Execution logs:** зберігаються в PostgreSQL, налаштуйте retention: `EXECUTIONS_DATA_MAX_AGE=720`

> 💡 **Порада:** налаштуйте N8N Error Workflow — окремий workflow, що надсилає Telegram повідомлення при будь-якому failure у продакшн workflows.

## Крок 6 — Безпечне оновлення N8N

```bash
# Завжди робіть бекап перед оновленням
/opt/n8n/backup.sh

# Завантаження нового образу та перезапуск
cd /opt/n8n
docker compose pull
docker compose up -d

# Перевірка після оновлення
docker compose logs -f n8n
curl -s https://n8n.yourdomain.com/healthz
```

Перед кожним оновленням перевіряйте N8N release notes на GitHub — іноді є breaking changes, особливо при переході між мажорними версіями. Тримайте скрипт відкату з backup restore на випадок проблем.

## Поширені помилки та вирішення

### «Workflows не працюють після рестарту»
**Причина:** втрачено або змінено `N8N_ENCRYPTION_KEY`. Credentials зашифровані цим ключем — без нього вони нечитабельні.
**Рішення:** restore з бекапу, де ключ збережено.

### «Webhook URL не працює»
**Причина:** `WEBHOOK_URL` не встановлено або встановлено неправильно. Має бути повний URL з https:// і трейлінг слешем: `WEBHOOK_URL=https://n8n.yourdomain.com/`

### «Out of memory / OOM kill»
**Рішення:** обмежте кількість executions (`EXECUTIONS_DATA_MAX_AGE=720`), перейдіть на PostgreSQL якщо ще на SQLite, розгляньте upgrade VPS до 4 GB RAM.

### «SSL-сертифікат не отримано»
**Перевірте:** DNS A-запис вказує на правильний IP, порти 80 і 443 відкриті у UFW, `ACME_EMAIL` встановлено коректно. Логи Traefik: `docker compose logs traefik`

## Чек-лист production readiness

Перед тим як запускати продакшн workflows — перевірте кожен пункт:

- ☐ VPS з мінімум 2 GB RAM та 40 GB SSD
- ☐ Домен з правильною DNS A-записом
- ☐ Docker Compose деплой (не bare `docker run`)
- ☐ PostgreSQL замість SQLite
- ☐ Traefik з HTTPS (Let's Encrypt) — сертифікат активний
- ☐ Basic Auth АБО OAuth2 proxy на UI
- ☐ `N8N_ENCRYPTION_KEY` збережено в 1Password/Bitwarden
- ☐ Автоматичний щоденний бекап PostgreSQL + `.n8n` директорії
- ☐ Off-site storage бекапів (S3/B2/GDrive через rclone)
- ☐ Restore процедура протестована хоча б один раз
- ☐ Uptime моніторинг налаштований (Uptime Kuma або аналог)
- ☐ Telegram/Slack алерти при downtime та workflow failures
- ☐ UFW firewall активний (відкриті лише 22, 80, 443)
- ☐ SSH key-only аутентифікація (`PasswordAuthentication no`)
- ☐ Стратегія оновлення задокументована

## Коли потрібна допомога

Self-hosted N8N складніший, ніж здається, особливо при масштабуванні. Якщо ви плануєте 1 000+ executions/день, критичні business workflows або потрібна GDPR-сумісна конфігурація — розгляньте managed setup.

Перевірте окупність такого розгортання заздалегідь — наш [гайд з розрахунку ROI для workflow автоматизації](/blog/calculating-roi-workflow-automation/) допоможе порахувати ваш конкретний кейс.

> 🚀 **Ми розгорнемо production N8N під ключ:** сервер, безпека, бекапи, моніторинг. Без головного болю. [Забронюйте консультацію](https://calendly.com/blagoveshchenskyivan/30min) або подивіться [case studies в нашому портфоліо](/portfolio/).

## Підсумок

Self-hosted N8N — це реальна економія та повний контроль, але потребує початкових інвестицій часу та правильного налаштування. Основні кроки: підготовка VPS → Docker Compose з PostgreSQL та Traefik → HTTPS → бекапи → моніторинг. Дотримайтеся чек-листу — і ваш N8N буде надійним серцем automation-інфраструктури.
