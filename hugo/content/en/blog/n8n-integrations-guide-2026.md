---
title: "How to Integrate N8N with Other Systems: A Practical Guide"
date: 2026-06-18
lastmod: 2026-06-18
description: "Four ways to connect any service to N8N: native nodes, HTTP Request, Webhooks, and the Code node — with real examples and a reliable integration checklist."
tags: ["N8N", "Integrations", "API", "Webhooks", "Automation"]
keywords: ["n8n integrations guide", "connect api to n8n", "n8n webhooks setup", "n8n http request node", "n8n code node javascript"]
author: "Ivan Blagoveshchenskyi"
cluster: "ai-integration"
clusterRole: "spoke"
draft: false
---

N8N's full potential only emerges when it is connected to every tool in your stack. An isolated N8N instance is just a pretty interface. N8N communicating with your CRM, database, messengers, email, and custom APIs becomes the operational nervous system of your business. This guide covers four ways to connect any service to N8N, and how to make those integrations reliable under real-world conditions.

If you have not yet set up [N8N self-hosted](/en/blog/start-with-self-hosted-n8n/), start there. And if your goal is to add AI capabilities to N8N, read our [AI integration guide](/en/blog/ai-integration-business-2026/) alongside this one.

## Overview of Integration Methods

N8N supports four ways to connect to external systems. Understanding the difference between them lets you choose the optimal approach for each specific service:

| Method | When to use | Complexity |
|--------|-------------|------------|
| Native nodes (400+) | A ready-made connector exists for the service | ⭐ Minimal |
| HTTP Request node | Any REST API without a native node | ⭐⭐ Low |
| Webhook trigger | Event-driven real-time response | ⭐⭐ Low |
| Code node (JS) | Custom logic, non-standard protocols | ⭐⭐⭐ Medium |

## Method 1: Native Nodes — Integration in 5 Minutes

N8N ships with 400+ native nodes for popular services: Google Workspace (Gmail, Sheets, Drive, Calendar), Slack, Telegram, Discord, Notion, Airtable, HubSpot, Salesforce, Pipedrive, Stripe, GitHub, Jira, Asana, PostgreSQL, MySQL, MongoDB, Redis — and hundreds more.

How to connect via a native node:

1. Drag the service node onto the workflow canvas
2. Click «Create new credential» → select authentication type (API Key or OAuth2)
3. Enter your keys or complete the OAuth flow in the browser
4. Select the operation (GET, CREATE, UPDATE, DELETE) and configure fields
5. Save — integration is ready in 5–15 minutes with zero code

> 💡 **Tip:** Store credentials with descriptive names: not «Google API key» but «Google Sheets — Production EasyTarget». When you reach 50+ credentials, you will thank yourself.

## Method 2: HTTP Request Node — Connect Any REST API

When no native node exists for your target service, the HTTP Request node covers 95% of cases. It supports any REST API — GET, POST, PUT, PATCH, DELETE — with full control over headers, query parameters, request body, and authentication method.

Example: connecting a custom internal API

```javascript
// HTTP Request configuration
Method: POST
URL: https://api.yourservice.com/v1/endpoint
Headers:
  Authorization: Bearer {{$credentials.apiKey}}
  Content-Type: application/json
Body (JSON):
{
  "param1": "{{$json.value1}}",
  "param2": "{{$json.value2}}"
}
```

Any SaaS tool with a REST API and documentation can be connected via HTTP Request in 30–60 minutes. This opens N8N to thousands of services that do not have native integrations.

## Method 3: Webhooks — Event-Driven Automation

Webhooks make N8N reactive: instead of polling a system every N minutes asking «is there anything new?», the source service pushes data to N8N the moment a relevant event occurs.

How to set up a Webhook trigger:

1. Add a Webhook node as the workflow trigger
2. N8N generates a unique URL: `https://n8n.yourdomain.com/webhook/[id]`
3. Paste this URL into your source service's webhook settings
4. Select which events should fire the webhook (new order, payment, form submission)
5. The workflow fires instantly on the event — no polling delay, no wasted API calls

Common webhook use cases:

- Shopify: new order placed → immediate N8N processing chain
- Stripe: successful payment → activate subscription in CRM
- GitHub: push to main → deploy trigger or Slack notification
- Calendly: new booking → prep task created for account manager
- Typeform/Tally: form submitted → lead qualification workflow

> ⚠️ **Important:** The Webhook URL is only active while the workflow is running. If the workflow is deactivated, incoming webhooks are not processed. Use N8N's «Test webhook» mode for debugging without activating the production workflow.

## Method 4: Code Node — JavaScript for Complex Logic

When standard nodes are not enough, the Code node lets you write full JavaScript directly inside the workflow. This enables unlimited custom logic: parsing non-standard formats, complex data transformations, binary file handling, and custom business logic.

```javascript
// Example: transform and filter an array of items
const items = $input.all();
const processed = items
  .map(item => ({
    id: item.json.id,
    fullName: item.json.firstName + ' ' + item.json.lastName,
    email: item.json.email.toLowerCase().trim(),
    isQualified: item.json.budget > 1000 && item.json.status === 'active',
    createdAt: new Date(item.json.timestamp).toISOString(),
  }))
  .filter(item => item.isQualified);

return processed.map(item => ({ json: item }));
```

The Code node supports async/await, built-in libraries (moment, lodash), and access to previous nodes via scoped variables. For most tasks, basic JavaScript is sufficient.

## Error Handling — Required for Every Integration

Even a perfectly configured integration can fail: the API returns a 429 rate limit error, the service goes down temporarily, or data arrives in an unexpected format. Without error handling, you learn about failures only when a customer complains.

- **Error Workflow:** a dedicated workflow triggered whenever the main workflow fails
- **Retry on Fail:** enable it in node settings with exponential backoff for transient errors
- **Try/Catch in Code nodes:** wrap risky operations to handle exceptions gracefully
- **Alerts:** send Telegram or Slack notifications on critical failures
- **Fallback logic:** if the API is unavailable, queue the request for retry

```javascript
// Telegram failure alert — Error Workflow
// Trigger: Execution Error Trigger
// → HTTP Request to Telegram Bot API:
POST https://api.telegram.org/bot{{TOKEN}}/sendMessage
{
  "chat_id": "{{CHAT_ID}}",
  "text": "❌ Workflow: {{$execution.workflowName}}\nError: {{$execution.error.message}}"
}
```

## Top 10 Business Integrations

| Integration | Method | Primary use case |
|-------------|--------|-----------------|
| Google Sheets | Native node | Data logging, reports, dashboards |
| Telegram Bot | Native node | Team notifications, alerts, bot replies |
| HubSpot CRM | Native node | Leads, contacts, deals, tickets |
| OpenAI | Native node | AI responses, classification, summarization |
| Stripe | Webhook + Native | Payments, subscriptions, refunds |
| Slack | Native node | Team notifications, approvals |
| PostgreSQL | Native node | Read/write data, analytics |
| GitHub/GitLab | Webhook + Native | CI/CD triggers, code review alerts |
| Calendly | Webhook | Bookings → CRM → prep tasks |
| Custom REST API | HTTP Request | Internal systems, ERP, custom SaaS |

## Reliable Integration Checklist

- [ ] Credentials stored in N8N Credentials Manager (never hardcoded in workflows)
- [ ] Retry on Fail enabled for all nodes calling external APIs
- [ ] Error Workflow configured and sending alerts to Telegram/Slack
- [ ] Real-data testing completed before production deployment
- [ ] API rate limits documented and accounted for in workflow logic
- [ ] Webhook URLs secured — access restricted to trusted source IPs where possible
- [ ] Execution logs retained and reviewed regularly

Need help with a specific integration or a professional audit of your current N8N workflows? Reach out — we solve complex technical automation challenges. [Book a free consultation →](https://calendly.com/blagoveshchenskyivan/30min)
