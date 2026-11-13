---
title: "Ads to Sales by Product: Report for an Ad Agency"
description: "n8n case for the ad agency VashTargetolog: daily ad spend per ad and sales by SKU in one table, with no manual entry on either side."
date: 2026-11-13
weight: 2
launched: "2026-03"
long_form: true
industry: "marketing"
industry_label: "Marketing"
platform: "N8N"
nodes: 6
short_body: "A report for an ad agency: ad spend and sales by SKU in one table every day. Estimated saving from 30 minutes per day."
subtitle: "Daily Facebook and Instagram ad spend and store sales by product in one table for an ad agency."
challenge: "A media buyer calculated ad spend by hand and stores typed in units sold by hand. The agency needs fresh data to decide what to scale."
solution:
  - "Every morning (around 06:00) a template pulls yesterday's spend per ad from the Facebook Graph API."
  - "A webhook from the CRM updates units sold as soon as an order status changes."
  - "For stores on Sitniks, an order pull runs every evening at 22:50."
  - "A formula in the sheet links ads to a product by SKU and sums the weekly budget."
impact:
  - "At least 30 minutes per day saved for the agency (estimate)."
  - "About 30 minutes per day saved for the stores (estimate)."
  - "27 brand workflows, 19 active as of 12.11.2026."
  - "255 runs in two weeks, one error."
stack:
  - "n8n"
  - "Facebook Graph API"
  - "Google Sheets"
  - "Sitniks"
  - "KeyCRM"
  - "Webhook"
result_value: "30+"
result_unit: "min/day"
result_label: "estimated saving for the agency"
complexity_summary: "27 brand workflows · ads + sales"
screenshots:
  - file: "01-ad-stats"
    w: 2000
    h: 334
    theme: "dark"
    caption: "Ad statistics collection: schedule, sheet read, a Facebook Graph API request, processing and a row written to the sheet."
  - file: "02-sales-webhook"
    w: 2000
    h: 512
    theme: "dark"
    caption: "Sales by product: an order webhook, duplicate check, order and items from the CRM, a sheet update; plus a daily cleanup of old records."
  - file: "03-sales-to-sheet"
    w: 2000
    h: 311
    theme: "dark"
    caption: "A sales-sync variant: orders pulled from Sitniks, matched against the product sheet, rows appended to the sheet."
---

For the ad agency [VashTargetolog](https://www.instagram.com/vash.targetolog/) we built a report that brings daily ad spend per ad on Facebook and Instagram and sales by product from the agency's online-store clients into one table. Before, a media buyer calculated spend by hand and the stores typed in units sold per day themselves. Now everything lands in the table automatically, and the agency decides which ads to scale and which to switch off using fresh data.

## Project at a glance

- Client: the ad agency VashTargetolog. Its clients are online stores in different niches, not only clothing. The reports are identical for all of them.
- Launch: March 2026.
- Scale: 27 ad-statistics workflows (one per brand), 19 of them active as of 12.11.2026.
- Systems: n8n, Facebook Graph API, Google Sheets, Sitniks, KeyCRM, a webhook from the store's CRM.

## The task

The agency needs to see not only how much was spent on ads but also what people actually buy as a result. Before automation both sides were manual: a media buyer opened the ad account, looked at how much was spent on each ad, calculated it and entered it into a sheet. Stores opened the sheet and typed in units sold per day.

The budget decision depends on sales: based on units sold, the agency decides which ads to scale and which to switch off. The sooner the sales data appears, the better the decision.

## What we built

**Ads.** One workflow template per brand. Every morning, on average at 06:00 (it is set slightly differently for different brands), it reads the sheet, requests yesterday's data from the Facebook Graph API, parses the response in code and appends a new row to the client's sheet: the budget spent that day on each ad. That is six nodes. For a new brand the template is copied.

**Sales.** Only units sold go into the sheet. There are two ways:

1. Through a webhook from the CRM. As soon as an order status changes in the CRM, the workflow first checks whether the order has already been processed and remembers its number so it is not counted twice. Then it pulls the order with its products, fetches additional fields for each product, finds the row in the sheet and updates the quantity: practically in real time. One workflow run can correspond to one sale. A separate daily run at 03:00 clears orders older than 30 days from memory. 12 nodes in total.
2. For stores on Sitniks: every evening at 22:50 the workflow pulls orders from the CRM through the API, matches them with the products in the sheet, works out whether new rows are needed, updates existing rows and appends missing ones (nine nodes). The same chain is started by a manual upload form, so sales for any date can be loaded after the fact.

For some clients sales are now entered automatically; before, the stores typed them in themselves.

**The summary.** This is a weekly Google Sheets tab: one row per product, with the dates of the week in the columns. Our part does two things. The sales automation fills in units sold per day. And a formula links ads to a product by SKU: it takes the product's SKU, finds all ads with that SKU in the general ad-statistics report for the dates of the week and sums the budget spent on them. So for each product you see side by side how much was spent on ads that week and how many units were sold.

The system does not change ad budgets: it collects and combines data, and a person makes the decision.

## Numbers

| Metric | Value |
|---|---|
| Time saved, agency | at least 30 minutes per day (estimate) |
| Time saved, stores | about 30 minutes per day (estimate) |
| Ad statistics | 27 workflows, 19 active (12.11.2026) |
| Runs, 29.10–12.11.2026 | 255, one error, 9–10 seconds per run |
| Sales, webhook | at least 2,000 runs on 1–12.11.2026 (up to 170 per day), 7.6 s on average |
| Sales, evening pass (Sitniks) | 14 runs, 13 successful, 8.9 s on average |

The time saving is an estimate, not a measurement: we count time only, not money. n8n keeps run history for about two weeks, so the run numbers reflect that period, not the whole time the workflows have been running. For the webhook we can see at least 2,000 runs: that is the sample limit. We do not publish how many orders the stores get per month: the spread between clients is very large.

## What was hard

The difficulties come from input data: sometimes the media buyer enters a wrong SKU or the client forgets to add one. Because ads and sales are matched by SKU, such a record cannot be linked: the row does not reach the right product, and this cannot be fixed on the automation side. There were no other difficulties, including no problems with Facebook API limits.

## What we would do differently

Nine projects out of ten that connect to this report are standard. For them it is more sensible to keep the shared logic in one sub-workflow from the start and leave only parameters in each workflow: today the template is copied into 27 workflows, and any change has to be made in all of the copies. But one project in ten is custom and needs individual changes, so such a sub-workflow has to leave room for exceptions.

Limitation: ad statistics are collected for yesterday, not in real time; webhook sales update immediately, while the evening pass runs once a day.

## Workflow diagram

Ads: schedule 06:00 → read sheet → Facebook Graph API → parse response → new row in the client's sheet. Sales: CRM webhook → skip already processed → order and products → product extra fields → product row → update quantity. Evening: schedule 22:50 or form → orders from CRM → match with sheet products → add missing rows and update.

## Cost and who it is for

The project cost $350. The agency is now on a monthly maintenance plan, and changes it requests are covered by that plan. According to our [public pricing](/en/tsiny/), automated reporting costs roughly $440–760 and stock sync $320–600. These are guidelines, not an offer.

This approach suits agencies that run many ad accounts and stores that need to see sales by product next to advertising.

## FAQ

### Does the system change ad budgets?

No. It collects spend and sales and combines them in a sheet. A person decides on the budget.

### How much does a similar solution cost?

Public guidelines: automated reporting $440–760, stock sync $320–600. The final price depends on the number of systems, data quality and API limits.

### Does it work if a store uses a different CRM?

In this project sales come from the stores' CRMs: Sitniks and KeyCRM. If a CRM has an API or webhooks, it can be connected.

### What if a SKU is entered wrongly?

The sale will not land in the right row. This is an input-data error that the automation does not fix.

### How many ad accounts can be connected?

In this project there are 27 workflows, 19 active, and there were no problems with Facebook API limits.
