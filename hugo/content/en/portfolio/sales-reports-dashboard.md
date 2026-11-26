---
title: "Sales Team Reports: From Discord to a Dashboard"
description: "n8n case for an education company: CRM sales reports without daily manual work, first in Discord and later in a dashboard with a funnel."
date: 2026-11-26
weight: 12
launched: "2026-09"
long_form: true
industry: "operations"
industry_label: "CRM / Reporting"
platform: "N8N"
nodes: 16
short_body: "The daily Discord report now builds itself. Over time it grew into a dashboard with leads, consultations and finance."
subtitle: "Automated sales team reports from NetHunt: first in Discord, then in a dashboard."
challenge: "Team members wrote their reports by hand, about 15 minutes a day. The texts varied, so comparing people or weeks was hard."
solution:
  - "n8n pulls records from NetHunt and calculates metrics per person."
  - "Daily and weekly reports are posted to Discord."
  - "Metrics flow into a dashboard with a funnel, consultations and finance."
  - "Numbers are calculated as of the event, so past reports stay unchanged."
impact:
  - "Daily and weekly reports are no longer written by hand."
  - "Estimate: 23 people × 15 minutes is about 6 hours a day."
  - "Numbers sit in one place in one format."
  - "Each period is compared with the previous one."
stack:
  - "n8n"
  - "NetHunt API"
  - "Google Sheets"
  - "n8n data tables"
  - "Discord"
  - "Firebase"
  - "QuickChart"
result_value: "15"
result_unit: "min"
result_label: "a day per person (estimate)"
complexity_summary: "NetHunt → n8n → Discord and dashboard"
screenshots:
  - file: "05-n8n-compute-metrics"
    w: 2000
    h: 340
    theme: "dark"
    caption: "The full metrics workflow: 16 nodes."
  - file: "06-n8n-compute-money"
    w: 1850
    h: 196
    theme: "dark"
    caption: "The money metrics workflow."
  - file: "07-n8n-executions"
    w: 1600
    h: 624
    theme: "dark"
    caption: "Successful runs, 23–26 November 2026."
---

An education company sells its programmes through a sales team: lead, consultation, package payment. Team members used to write reports about this work by hand. The first request was simple: a daily Discord report that builds itself. Over time it grew into a full dashboard.

## The project in brief

- Client: an education company, a sales team with lead-sorting managers and consultants. We do not name it.
- Systems: NetHunt (CRM), n8n, a dashboard inside the company's internal platform.
- People: 23 people in the team at launch.
- Result: a daily routine of about 15 minutes per person is gone.

## Before: reports by hand

At the end of the day everyone wrote a report: how many leads they took, how many they reached, who they passed on to a consultation. Roughly 15 minutes. There were also weekly and monthly reports, about 20 minutes each. The texts all looked different, so two people or two weeks could only be compared by eye.

## Step one: reports in Discord

The first reports started working in September 2026. We began with the daily one and ended up automating daily and weekly reports on leads and on consultations. n8n pulls the records from NetHunt, calculates metrics per person and posts a short report to Discord in a format the team knows. Nobody has to write these reports by hand any more.

[![Weekly consultation report in Discord](/img/case-screens/sales-reports-dashboard/08-discord-weekly.webp)](/img/case-screens/sales-reports-dashboard/08-discord-weekly.png)

*The weekly report in Discord (in Ukrainian). The name has been changed.*

## Step two: the dashboard

When we showed the client a test weekly report with charts, the idea came up to move everything into a separate dashboard. CRM data now reaches the company's platform every day, and the manager sees:

- a funnel from lead to payment with conversion between stages;
- "Leads", "Consultations" and "Finance" sections with a period selector (week or month in Finance) and comparison with the previous period;
- a table by person and by lead source that highlights weak spots, for example a share of rescheduled consultations above 35%;
- a checkbox selection of team members: compare two consultants or take a whole group;
- revenue and average order value in euros, shown separately. Not everyone has access to the amounts.

[![Dashboard: weekly leads and funnel](/img/case-screens/sales-reports-dashboard/01-leads-week.webp)](/img/case-screens/sales-reports-dashboard/01-leads-week.png)

*Weekly leads. The dashboard is shown with demo data.*

[![Dashboard: consultations and reschedules](/img/case-screens/sales-reports-dashboard/02-consultations-week.webp)](/img/case-screens/sales-reports-dashboard/02-consultations-week.png)

*Consultations and reschedules. Demo data.*

[![Dashboard: weekly finance](/img/case-screens/sales-reports-dashboard/03-finance-week.webp)](/img/case-screens/sales-reports-dashboard/03-finance-week.png)

*Finance. Demo data.*

[![Dashboard: daily leads](/img/case-screens/sales-reports-dashboard/04-leads-day.webp)](/img/case-screens/sales-reports-dashboard/04-leads-day.png)

*Daily leads. Demo data.*

## How it works

- Twice a day (morning and evening, Kyiv time) n8n pulls stage changes from the CRM and calculates the metrics. Evening calculations finish by 19:45, and a reconciliation runs in the morning.
- Results are stored in n8n data tables, from where a read-only channel picks them up. Once a day the platform syncs them into its own database. The page shows when the data was updated and warns if there has been no sync for a long time.
- Periods follow the way the company counts: the lead and consultation week runs Tuesday to Monday, the finance week Monday to Sunday, the month from the 6th to the 5th.

## The main challenge: numbers as of the event, not as of today

If you calculate from a record's current state, last week's numbers change every time a manager moves a deal to another stage. So the calculation restores the history: who the consultant was at the time of the consultation and which stage the record was in on the day of the event. Yesterday's report no longer changes today.

The second challenge: stages are named differently in different pipelines, so we had to agree separately on what counts as a "closing". The minimum payment is now shown on its own and is not part of closings. The mismatch in closings between Discord and the dashboard has been removed.

## What changed: a small routine that multiplies

15 minutes a day looks like a trifle. But every person spends them, every day. This is an estimate based on about 15 minutes per person.

- 1 person: 15 minutes a day.
- 23 people, as at launch: about 6 hours a day, or more than 120 hours a month (22 working days).
- 100 people: 1,500 minutes, which is 25 hours a day.

And that is only the daily reports, without weekly and monthly ones and without the manager's time. The routine is gone, and the numbers now sit in one place in one format. How much extra revenue this brought cannot be estimated, and we do not claim it.

> "Vania, thank you for all the goodies and the help! And for putting up with 150 thousand revisions"
>
> From a message by a member of the client's team (translated from Ukrainian)
