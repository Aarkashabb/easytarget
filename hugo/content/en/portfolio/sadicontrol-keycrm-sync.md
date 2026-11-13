---
title: "SadiControl → KeyCRM: Site Visits Without Manual Entry"
description: "n8n case for landscaping company Sadi: site visits from SadiControl land in KeyCRM orders every day. 52 nodes, 14 of 14 runs without errors."
date: 2026-11-13
weight: 9
launched: "2026-07"
long_form: true
industry: "crm"
industry_label: "CRM Integration"
platform: "N8N"
nodes: 52
short_body: "Every day, site visits from SadiControl land in KeyCRM orders with no manual entry. 14 of 14 runs succeeded, over 500 visits per month."
subtitle: "Daily sync of site visits from the SadiControl system into KeyCRM orders for a landscaping company."
challenge: "Site visits from SadiControl (over 500 per month) were copied into KeyCRM by hand. Clients and sites had to be matched without losses or duplicates."
solution:
  - "Every day at 22:00 Kyiv time the workflow pulls the day's visits from SadiControl."
  - "It groups visits by site and appends them to one order per month."
  - "It finds the buyer in KeyCRM by phone or creates a new one with a tag."
  - "It tracks order versions in an n8n table and collects errors at the end of the run."
impact:
  - "14 of 14 runs without errors between 29.10 and 12.11.2026."
  - "Estimated 10–15 minutes per visit: 80–125 hours per month."
  - "An order edited by a manager is left untouched by the automation."
  - "The buyer tag lets the team match a buyer to the client in SadiControl."
stack:
  - "n8n"
  - "SadiControl"
  - "KeyCRM API"
  - "n8n data tables"
result_value: "14/14"
result_unit: ""
result_label: "successful runs in two weeks"
complexity_summary: "5 versions · SadiControl → KeyCRM, daily"
---

Every evening the automation pulls all of the day's site visits from the SadiControl system and writes them into orders in KeyCRM. It runs for the landscaping company [Sadi](https://sadi.com.ua/) (Kyiv and region): garden care, landscape design, irrigation. Before the automation, everything from SadiControl was copied into KeyCRM by hand, with over 500 visits per month. Over two weeks, 29.10–12.11.2026, the workflow ran 14 times out of 14 without errors.

## Project at a glance

- Client: [Sadi](https://sadi.com.ua/), a landscaping company. We have worked with the client since 2023: back then it was a Make automation, and in 2026 we built the SadiControl → KeyCRM integration.
- Systems: SadiControl (visit tracking), KeyCRM, n8n.
- Launch: July 2026 (first version); the current version, v5, has run since 2 September 2026.
- Schedule: every day at 22:00 Kyiv time.

## The task

Everything that happened on site visits was recorded in SadiControl, while managers work with orders in KeyCRM. Previously each visit was copied from one system to the other by hand. There are more than 500 visits per month. By our estimate, copying one visit took 10–15 minutes, which is roughly 80–125 hours per month. This is an estimate, not a measurement.

## What we built

The n8n workflow has 52 nodes. The main steps:

1. Every day at 22:00 Kyiv time it logs in to SadiControl and pulls the list of sites and all visits for the day.
2. It groups the visits by site.
3. For each site it checks the order versions table: is there already an open order for this month (one site, one order per month)?
4. If the order exists and is still in the "Імпортовано" (Imported) status, new visits are appended to it. Until the end of the month, all visits for that site go into one order.
5. If the order is already in another status, we leave it alone: a new order (new version) is created for the new visits. The same applies if a site needs two orders in a month: the first is closed and a second is created, but this is rare.
6. We look for the buyer in KeyCRM by phone number. If there is no number or the buyer is not found, we create a new buyer and set a tag that lets the team match it to the client in SadiControl.
7. Created versions are written to an n8n table marked "active", and the old version is deactivated.
8. There are pauses between KeyCRM requests to stay within API limits. Update errors do not stop the whole run: they are collected and raised at the end.

## Numbers

| Metric | Value |
|---|---|
| Visits per month (before automation) | over 500 |
| Time saved | estimated 10–15 min per visit, 80–125 h per month |
| Runs, 29.10–12.11.2026 | 14, all successful |
| Run duration | about 90 seconds on average, longest 206 seconds |
| Nodes in the workflow | 52 |
| Workflow versions | 5 (10.07 to 02.09.2026) |

n8n keeps run history for about two weeks, so this period is shown, not the whole time the workflow has been running.

## What was hard

The client's initial requirements were imprecise. So we had to build several versions and keep refining them: five versions in eight weeks. The v5 diagram shows the results: handling of departments, an order status check, order versions, migration of old orders into a new table, and pauses for KeyCRM API limits.

## What we would do differently

> We would start by analysing one real month of the client's data and agree with the managers what counts as one order before development. Imprecise requirements cost us several versions.

## Workflow diagram

Schedule 22:00 → log in to SadiControl → sites and visits → group by site → check order versions → update the active order or create a new version → find or create the buyer with a tag → create the order and status in KeyCRM → write the version to the table → pause for API limits → collect errors.

## Cost and who it is for

The project cost $350. This is a reduced price because we have worked with the client for a long time: a new client would pay more. According to our [public pricing](/en/tsiny/), a CRM integration costs from $360 and order sync between two systems costs $760–1,280. These are guidelines, not an offer.

This approach suits companies where site visits, jobs or requests are recorded in one system and orders are managed in another.

## FAQ

### How much does a similar integration cost?

Public guidelines from our pricing page: CRM integration from $360, order sync between two systems $760–1,280. The final price depends on the number of systems, data quality and API limits.

### Will the automation overwrite a manager's edits?

No. New visits are appended only to orders in the "Імпортовано" (Imported) status. If the status has been changed, the order is left alone and a new version is created for new visits.

### What if the buyer does not exist in KeyCRM yet?

The buyer is created automatically with a tag that lets the team match it to the client in the tracking system.

### Does it work in real time?

In this project the sync is daily, but the schedule can be made more frequent: runs can happen as often as needed.
