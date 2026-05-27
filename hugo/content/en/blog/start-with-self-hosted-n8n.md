---
title: "Self-Hosted N8N: Complete Production Setup Guide (2026)"
date: 2026-05-26
lastmod: 2026-05-27
description: "Step-by-step guide to deploying production-ready self-hosted N8N with Docker, PostgreSQL, HTTPS, automated backups, and monitoring. Security best practices included."
image: "images/blog/start-with-self-hosted-n8n-hero.jpg"
tags: ["N8N", "Self-Hosting", "DevOps", "Docker", "Automation"]
keywords: ["self-hosted n8n", "n8n docker", "n8n setup", "n8n production", "n8n vps"]
author: "Ivan Blagoveshchenskyi"
draft: false
---

N8N Cloud starts at $20+/month for basic usage. A self-hosted instance on a $6-12 VPS gives you unlimited executions, full data ownership, and no surprise bills. This guide walks you from a blank VPS to a production-ready N8N instance with HTTPS, PostgreSQL, automated backups, and monitoring.

### What you will have after this guide:

- Production N8N with PostgreSQL, Traefik, and automatic HTTPS
- Automated daily backups with rotation and off-site storage
- Monitoring and alerts via Telegram or Slack
- A 15-point production readiness checklist

> **Who this is NOT for:** if you have fewer than 50 workflows and no technical person on the team, N8N Cloud is the right call. Self-hosting is justified when you hit 500+ executions/day, have GDPR requirements, or need full infrastructure control.

## Self-Hosted N8N vs N8N Cloud — Which to Choose

Before diving into setup, make sure self-hosting is actually the right choice.

![N8N Cloud vs Self-hosted comparison](/images/blog/n8n-cloud-vs-self-hosted.jpg)

| Parameter | N8N Cloud | Self-hosted |
|-----------|-----------|-------------|
| **Base price** | $20/mo (2,500 executions) | $6-12/mo (unlimited) |
| **Setup time** | ✅ 5 minutes | ❌ 2-4 hours |
| **Data control** | ❌ Data on N8N servers | ✅ Full ownership |
| **GDPR/Compliance** | ❌ Limited | ✅ Full control |
| **Updates** | ✅ Automatic | ❌ Manual |
| **Scaling** | ❌ Expensive | ✅ Horizontal |
| **Backup** | ✅ Built-in | ❌ Your responsibility |
| **Customization** | ❌ Limited | ✅ Unlimited |

Self-hosting is justified when: you process 500+ executions/day; you have GDPR or corporate security requirements; you need custom nodes or code modifications; you want to eliminate vendor lock-in; or you simply want to pay less at high volume.

If you have not picked a platform yet, start with our [Make vs Zapier vs N8N comparison](/en/blog/make-vs-zapier-vs-n8n-2026/).

## Prerequisites

### Hardware (VPS):
- **Minimum:** 1 vCPU, 1 GB RAM, 10 GB SSD — for testing only
- **Production:** 2 vCPU, 4 GB RAM, 40 GB SSD — non-negotiable
- **Recommended providers:** Hetzner CX21 ($6/mo), DigitalOcean ($12/mo), Vultr

### Software:
- Ubuntu 22.04 LTS or Debian 12
- Docker 24+ and Docker Compose v2
- Domain with a DNS A record pointed to your VPS IP

### Required skills:
- Basic Linux CLI (cd, ls, nano/vim)
- SSH access to a remote server
- Basic understanding of Docker volumes

## Step 1 — VPS Preparation

Connect to your server and run the base security setup. This script installs Docker and configures the firewall:

```bash
# System update
apt update && apt upgrade -y

# Install dependencies
apt install -y curl git ufw fail2ban

# Configure UFW firewall
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH
ufw allow 80/tcp   # HTTP
ufw allow 443/tcp  # HTTPS
ufw --force enable

# Install Docker
curl -fsSL https://get.docker.com | sh
usermod -aG docker $USER

# Verify
docker --version && docker compose version
```

> 💡 **Tip:** disable password SSH login. In `/etc/ssh/sshd_config` set `PasswordAuthentication no`, then restart: `systemctl restart sshd`

## Step 2 — Deploy N8N via Docker Compose

Create the directory structure and the core `docker-compose.yml` with PostgreSQL and Traefik:

```bash
mkdir -p /opt/n8n/{data,postgres,traefik/certs}
cd /opt/n8n
```

Create the `.env` file with all environment variables (replace all values with your own):

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

# Generate with: openssl rand -hex 32
N8N_ENCRYPTION_KEY=GENERATE_WITH_OPENSSL

N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=STRONG_PASSWORD_HERE

ACME_EMAIL=your@email.com
```

Now create the `docker-compose.yml` — the core of your deployment:

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
# Launch
docker compose up -d

# Watch logs
docker compose logs -f n8n

# Check status
docker compose ps
```

> ⚠️ **CRITICAL:** save `N8N_ENCRYPTION_KEY` in a secure location (1Password, Bitwarden). If the key is lost, all credentials stored in your workflows become unreadable and cannot be recovered.

## Step 3 — HTTPS and Security

HTTPS is handled automatically by Traefik and Let's Encrypt — the certificate is issued on first startup. Make sure your DNS A record points to your server IP before starting the containers.

### Additional security measures:
- Basic Auth is already enabled in `.env` — change the default credentials immediately
- Keep N8N updated: `docker compose pull && docker compose up -d`
- `fail2ban` protects against brute-force attacks on SSH and the web interface
- For enterprise setups: consider Authelia or Authentik as an OAuth2 proxy layer

General security principles for no-code/low-code infrastructure are covered in our [security best practices for no-code automation](/en/blog/security-best-practices-no-code-automation/) guide.

> 💡 **Need help securing your N8N instance?** [Book a free consultation](https://calendly.com/blagoveshchenskyivan/30min).

## Step 4 — Backup Strategy

> ⚠️ **CRITICAL:** a backup you have never tested restoring is not a backup. Run a restore drill at least once before you rely on this system for production workflows.

What to back up: the PostgreSQL dump, the `.n8n` data directory with your workflows, and the `.env` file — especially the encryption key.

```bash
#!/bin/bash
# /opt/n8n/backup.sh
BACKUP_DIR=/backups/n8n
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p $BACKUP_DIR

# PostgreSQL dump
docker exec n8n-postgres-1 pg_dump -U n8n n8n \
  > $BACKUP_DIR/postgres_$DATE.sql

# N8N data directory
tar -czf $BACKUP_DIR/n8n_data_$DATE.tar.gz /opt/n8n/data

# Delete backups older than 7 days
find $BACKUP_DIR -name '*.sql' -mtime +7 -delete
find $BACKUP_DIR -name '*.tar.gz' -mtime +7 -delete

# Off-site upload (rclone must be configured)
rclone copy $BACKUP_DIR remote:n8n-backups/
echo "Backup completed: $DATE"
```

```bash
chmod +x /opt/n8n/backup.sh
# Daily backup at 3 AM
echo '0 3 * * * /opt/n8n/backup.sh >> /var/log/n8n-backup.log 2>&1' | crontab -
```

## Step 5 — Monitoring and Observability

- **Health endpoint:** `GET https://n8n.yourdomain.com/healthz` → should return `{"status":"ok"}`
- **Uptime Kuma** (self-hosted): excellent for HTTP monitoring with Telegram alerts
- **BetterStack** or **UptimeRobot:** cloud alternative with a usable free plan
- **Portainer:** web UI for Docker container management
- **Execution log retention:** add `EXECUTIONS_DATA_MAX_AGE=720` to your `.env`

> 💡 **Tip:** configure an N8N Error Workflow — a dedicated workflow that sends a Telegram notification whenever any production workflow fails.

## Step 6 — Safe N8N Updates

```bash
# Always back up before updating
/opt/n8n/backup.sh

cd /opt/n8n
docker compose pull
docker compose up -d

# Verify after update
docker compose logs -f n8n
curl -s https://n8n.yourdomain.com/healthz
```

Check the N8N release notes on GitHub before every update — breaking changes appear occasionally, especially across major versions. Keep a rollback plan ready: a tested backup and the restore procedure documented.

## Common Problems and Solutions

### "Workflows stopped working after restart"
**Cause:** the `N8N_ENCRYPTION_KEY` was lost or changed. Credentials are encrypted with this key — without it they are unreadable.
**Fix:** restore from a backup where the key is preserved.

### "Webhook URL not working"
**Cause:** `WEBHOOK_URL` is not set or is set incorrectly. It must be the full URL with trailing slash: `WEBHOOK_URL=https://n8n.yourdomain.com/`

### "Out of memory / OOM kill"
**Fixes:** limit execution retention with `EXECUTIONS_DATA_MAX_AGE=720`, migrate from SQLite to PostgreSQL if you have not already, upgrade VPS to 4 GB RAM.

### "SSL certificate not issued"
**Check:** DNS A record points to the correct IP, ports 80 and 443 are open in UFW, `ACME_EMAIL` is set correctly. Traefik logs: `docker compose logs traefik`

## Production Readiness Checklist

- ☐ VPS with at least 2 GB RAM and 40 GB SSD
- ☐ Domain with correct DNS A record pointing to VPS IP
- ☐ Docker Compose deployment (not bare `docker run` commands)
- ☐ PostgreSQL instead of SQLite
- ☐ Traefik with HTTPS (Let's Encrypt) — certificate active
- ☐ Basic Auth OR OAuth2 proxy protecting the N8N UI
- ☐ `N8N_ENCRYPTION_KEY` stored in 1Password or Bitwarden
- ☐ Automated daily backup of PostgreSQL + `.n8n` data directory
- ☐ Off-site backup storage (S3/B2/GDrive via rclone)
- ☐ Restore procedure tested at least once
- ☐ Uptime monitoring configured (Uptime Kuma or equivalent)
- ☐ Telegram/Slack alerts for downtime and workflow failures
- ☐ UFW firewall active (only ports 22, 80, 443 open)
- ☐ SSH key-only authentication (`PasswordAuthentication no`)
- ☐ Update strategy documented

## When You Need Help

Self-hosted N8N is more demanding than it appears, especially at scale. If you are planning 1,000+ executions per day, running business-critical workflows, or need a GDPR-compliant configuration from day one — a managed setup is worth considering.

Validate the payback for your specific case before committing — our [ROI calculation guide for workflow automation](/en/blog/calculating-roi-workflow-automation/) walks through the numbers.

> 🚀 **We deploy production N8N turnkey:** server configuration, security hardening, backups, and monitoring. No headaches. [Book a consultation](https://calendly.com/blagoveshchenskyivan/30min) or browse [case studies in our portfolio](/en/portfolio/).

## Summary

Self-hosted N8N delivers real cost savings and full infrastructure control, but requires an upfront time investment and proper configuration. The path: VPS preparation → Docker Compose with PostgreSQL and Traefik → HTTPS → backups → monitoring. Follow the checklist, and your N8N instance will be a reliable foundation for your entire automation stack.
