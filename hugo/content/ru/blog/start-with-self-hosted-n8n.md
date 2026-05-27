---
title: "Self-Hosted N8N: полный гайд по production развёртыванию (2026)"
date: 2026-05-26
lastmod: 2026-05-27
description: "Пошаговая инструкция по разворачиванию production-ready self-hosted N8N с Docker, PostgreSQL, HTTPS, автоматическими бэкапами и мониторингом. Security best practices включены."
image: "/images/blog/start-with-self-hosted-n8n-hero.jpg"
tags: ["N8N", "Self-Hosting", "DevOps", "Docker", "Автоматизация"]
keywords: ["self-hosted n8n", "n8n docker", "n8n на своём сервере", "n8n настройка"]
author: "Ivan Blagoveshchenskyi"
draft: false
---

N8N Cloud стоит $20+/месяц уже при базовом использовании. Self-hosted на VPS за $6-12 — и вы получаете неограниченное количество executions, полный контроль над данными и никаких сюрпризов в счёте. В этом гайде пройдём путь от чистого VPS до production-ready N8N с HTTPS, PostgreSQL, автоматическими бэкапами и мониторингом.

### Что вы получите после этого гайда:

- Production N8N с PostgreSQL, Traefik и автоматическим HTTPS
- Автоматические ежедневные бэкапы с ротацией и off-site storage
- Мониторинг и алерты в Telegram/Slack
- Чек-лист production readiness из 15 пунктов

> **Кому НЕ подходит:** если у вас менее 50 workflows и нет технического человека в команде — N8N Cloud проще. Self-hosted оправдан при 500+ executions/день, требованиях GDPR или желании полного контроля.

## Self-hosted N8N vs N8N Cloud — что выбрать

Прежде чем погружаться в технические детали — решите, нужен ли вообще self-hosted.

![Сравнение N8N Cloud и Self-hosted](/images/blog/n8n-cloud-vs-self-hosted.jpg)

| Параметр | N8N Cloud | Self-hosted |
|----------|-----------|-------------|
| **Цена (базовая)** | $20/мес (2 500 executions) | $6-12/мес (неограниченно) |
| **Время на setup** | ✅ 5 минут | ❌ 2-4 часа |
| **Контроль данных** | ❌ Данные на серверах N8N | ✅ Полный контроль |
| **GDPR/Compliance** | ❌ Ограниченный | ✅ Полный |
| **Обновления** | ✅ Автоматически | ❌ Вручную |
| **Масштабирование** | ❌ Дорого | ✅ Горизонтально |
| **Бэкап** | ✅ Встроенный | ❌ Самостоятельно |
| **Кастомизация** | ❌ Ограниченная | ✅ Полная |

Self-hosted оправдан если: вы обрабатываете 500+ executions/день; есть требования GDPR или корпоративной безопасности; нужны кастомные ноды или модификации; важно избежать vendor lock-in; или просто хотите платить меньше при большом объёме.

Если ещё не определились с платформой — начните с нашего [сравнения Make vs Zapier vs N8N](/ru/blog/make-vs-zapier-vs-n8n-2026/).

## Что понадобится

### Железо (VPS):
- **Минимум:** 1 vCPU, 1 GB RAM, 10 GB SSD — для теста
- **Production:** 2 vCPU, 4 GB RAM, 40 GB SSD — обязательно
- **Рекомендуемые провайдеры:** Hetzner CX21 ($6/мес), DigitalOcean ($12/мес), Vultr

### Программное обеспечение:
- Ubuntu 22.04 LTS или Debian 12
- Docker 24+ и Docker Compose v2
- Домен с DNS A-записью на IP вашего VPS

### Необходимые навыки:
- Базовый Linux CLI (cd, ls, nano/vim)
- SSH-доступ к серверу
- Базовое понимание Docker volumes

## Шаг 1 — Подготовка VPS

Подключаемся к серверу и выполняем базовую настройку безопасности. Этот скрипт установит Docker и настроит фаервол:

```bash
# Обновление системы
apt update && apt upgrade -y

# Установка зависимостей
apt install -y curl git ufw fail2ban

# Настройка UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Установка Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Проверка
docker --version && docker compose version
```

> 💡 **Совет:** обязательно отключите password-login для SSH. В `/etc/ssh/sshd_config` установите `PasswordAuthentication no` и перезапустите: `systemctl restart sshd`

## Шаг 2 — Развёртывание N8N через Docker Compose

![Архитектура self-hosted N8N: VPS, Traefik reverse proxy, N8N, PostgreSQL, Cron в Docker network](/images/blog/n8n-self-hosted-architecture.jpg)

Создаём структуру директорий и основной `docker-compose.yml` с PostgreSQL и Traefik:

```bash
mkdir -p /opt/n8n/{data,postgres,traefik/certs}
cd /opt/n8n
```

Создаём файл `.env` со всеми переменными (замените значения на свои):

```bash
# /opt/n8n/.env
N8N_HOST=n8n.yourdomain.com
N8N_PROTOCOL=https
WEBHOOK_URL=https://n8n.yourdomain.com/

DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=n8n
DB_POSTGRESDB_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

POSTGRES_DB=n8n
POSTGRES_USER=n8n
POSTGRES_PASSWORD=CHANGE_THIS_STRONG_PASSWORD

# Генерация: openssl rand -hex 32
N8N_ENCRYPTION_KEY=GENERATE_WITH_OPENSSL

N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=STRONG_PASSWORD_HERE

ACME_EMAIL=your@email.com
```

Теперь `docker-compose.yml`:

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

# Проверка логов
docker compose logs -f n8n

# Проверка статуса
docker compose ps
```

> ⚠️ **КРИТИЧНО:** сохраните `N8N_ENCRYPTION_KEY` в надёжном месте (1Password, Bitwarden). Если ключ потерян — все credentials в workflows станут недействительными и восстановлению не подлежат.

## Шаг 3 — HTTPS и безопасность

HTTPS настраивается автоматически через Traefik и Let's Encrypt — сертификат выдаётся при первом запуске. Убедитесь, что DNS A-запись уже указывает на ваш IP до запуска.

### Дополнительные меры безопасности:
- Basic Auth уже включён в `.env` — смените default credentials
- Регулярные обновления: `docker compose pull && docker compose up -d`
- `fail2ban` защищает от brute-force атак
- Для enterprise: рассмотрите Authelia или Authentik как OAuth2 proxy

Общие принципы безопасности для no-code/low-code инфраструктуры — в нашем гайде [best practices безопасности для no-code автоматизации](/ru/blog/security-best-practices-no-code-automation/).

> 💡 **Нужна помощь с настройкой безопасности для вашего N8N?** [Забронируйте бесплатную консультацию](https://calendly.com/blagoveshchenskyivan/30min).

## Шаг 4 — Стратегия бэкапа

> ⚠️ **КРИТИЧНО:** бэкап без проверки восстановления — не бэкап. Протестируйте restore-процедуру хотя бы раз до того, как положиться на эту систему.

Что нужно бэкапить: PostgreSQL дамп, `.n8n` директория с workflows и `.env` файл (особенно encryption key).

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

# Удаление бэкапов старше 7 дней
find $BACKUP_DIR -name '*.sql' -mtime +7 -delete
find $BACKUP_DIR -name '*.tar.gz' -mtime +7 -delete

# Off-site upload (rclone должен быть настроен)
rclone copy $BACKUP_DIR remote:n8n-backups/
echo "Backup completed: $DATE"
```

```bash
chmod +x /opt/n8n/backup.sh
# Ежедневный бэкап в 3:00 ночи
echo '0 3 * * * /opt/n8n/backup.sh >> /var/log/n8n-backup.log 2>&1' | crontab -
```

## Шаг 5 — Мониторинг и observability

- **Health check:** `https://n8n.yourdomain.com/healthz` → должен вернуть `{"status":"ok"}`
- **Uptime Kuma** (self-hosted): идеален для HTTP-мониторинга с Telegram алертами
- **BetterStack** или **UptimeRobot:** cloud альтернатива с бесплатным планом
- **Portainer:** web UI для управления Docker контейнерами
- **Retention логов:** добавьте `EXECUTIONS_DATA_MAX_AGE=720` в `.env`

> 💡 **Совет:** настройте N8N Error Workflow — отдельный workflow, отправляющий Telegram-уведомление при любом failure в продакшн workflows.

## Шаг 6 — Безопасное обновление N8N

```bash
# Всегда делайте бэкап перед обновлением
/opt/n8n/backup.sh

cd /opt/n8n
docker compose pull
docker compose up -d

# Проверка после обновления
docker compose logs -f n8n
curl -s https://n8n.yourdomain.com/healthz
```

Перед каждым обновлением проверяйте N8N release notes на GitHub — иногда есть breaking changes, особенно при переходе между мажорными версиями.

## Распространённые ошибки и решения

### «Workflows не работают после рестарта»
**Причина:** потерян или изменён `N8N_ENCRYPTION_KEY`. Credentials зашифрованы этим ключом — без него они нечитаемы.
**Решение:** restore из бэкапа, где ключ сохранён.

### «Webhook URL не работает»
**Причина:** `WEBHOOK_URL` не установлен или установлен неверно. Должен быть полный URL: `WEBHOOK_URL=https://n8n.yourdomain.com/`

### «Out of memory / OOM kill»
**Решение:** ограничьте хранение executions (`EXECUTIONS_DATA_MAX_AGE=720`), перейдите на PostgreSQL если ещё на SQLite, рассмотрите upgrade VPS до 4 GB RAM.

### «SSL-сертификат не получен»
**Проверьте:** DNS A-запись указывает на правильный IP, порты 80 и 443 открыты в UFW, `ACME_EMAIL` установлен корректно. Логи: `docker compose logs traefik`

## Чек-лист production readiness

- ☐ VPS с минимум 2 GB RAM и 40 GB SSD
- ☐ Домен с правильной DNS A-записью
- ☐ Docker Compose деплой (не bare `docker run`)
- ☐ PostgreSQL вместо SQLite
- ☐ Traefik с HTTPS (Let's Encrypt) — сертификат активен
- ☐ Basic Auth ИЛИ OAuth2 proxy на UI
- ☐ `N8N_ENCRYPTION_KEY` сохранён в 1Password/Bitwarden
- ☐ Автоматический ежедневный бэкап PostgreSQL + `.n8n` директории
- ☐ Off-site storage бэкапов (S3/B2/GDrive через rclone)
- ☐ Restore-процедура протестирована хотя бы один раз
- ☐ Uptime мониторинг настроен (Uptime Kuma или аналог)
- ☐ Telegram/Slack алерты при downtime и workflow failures
- ☐ UFW firewall активен (открыты только 22, 80, 443)
- ☐ SSH key-only аутентификация (`PasswordAuthentication no`)
- ☐ Стратегия обновления задокументирована

## Когда нужна помощь

Self-hosted N8N сложнее, чем кажется, особенно при масштабировании. Если вы планируете 1 000+ executions/день, критичные бизнес-workflows или нужна GDPR-совместимая конфигурация — рассмотрите managed setup.

Проверьте окупаемость такого развёртывания заранее — наш [гайд по расчёту ROI для workflow автоматизации](/ru/blog/calculating-roi-workflow-automation/) поможет посчитать ваш конкретный кейс.

> 🚀 **Развернём production N8N под ключ:** сервер, безопасность, бэкапы, мониторинг. Без лишней головной боли. [Забронируйте консультацию](https://calendly.com/blagoveshchenskyivan/30min) или посмотрите [case studies в нашем портфолио](/ru/portfolio/).

## Итог

Self-hosted N8N — это реальная экономия и полный контроль, но требует начальных инвестиций времени и правильной настройки. Основные шаги: подготовка VPS → Docker Compose с PostgreSQL и Traefik → HTTPS → бэкапы → мониторинг. Следуйте чек-листу — и ваш N8N станет надёжным сердцем automation-инфраструктуры.
