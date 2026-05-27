---
title: "Getting Started with Self-Hosted N8N"
date: 2023-10-12
lastmod: 2026-05-27
description: "Step-by-step guide to deploying and securing your own N8N instance for teams. Docker setup, security configuration, and backup essentials."
image: "images/n8n-guide.svg"
tags: ["Guide", "N8N", "DevOps", "Automation"]
author: "Ivan Blagoveshchenskyi"
draft: false
---

Self-hosted N8N gives you full data ownership, unlimited executions, and the ability to tailor your own automation infrastructure. Here is how to start.

## What You Need

- VPS or cloud server (min. 1 GB RAM)
- Docker or Node.js 18+
- Domain with SSL certificate

## Docker Deployment

The simplest path is the official Docker image:

```bash
docker run -d \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8nio/n8n
```

## Securing Your Instance

Mandatory steps:

1. **Basic Auth** or **JWT** — restrict UI access
2. **HTTPS** via Nginx reverse proxy + Let's Encrypt
3. **Backup** — scheduled snapshots of `~/.n8n`

## Next Steps

After deployment, configure your first workflow and connect required credentials.

### Important: Security
Make sure to read [security best practices for no-code automation](/en/blog/security-best-practices-no-code-automation/) — they are critical for self-hosted N8N.

### ROI of Your Workflows
Verify your automation pays back. Check the [ROI calculation guide for workflow automation](/en/blog/calculating-roi-workflow-automation/).

### Real-World Examples
See [case studies from our team](/en/portfolio/) — concrete examples of how N8N solves business problems.

Need help? [Book a consultation](https://calendly.com/blagoveshchenskyivan/30min).
