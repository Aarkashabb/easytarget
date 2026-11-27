---
title: "Monthly Ad Reports for Agency Clients: an n8n Case"
description: "An n8n case for a marketing agency: a monthly report for each client with Facebook and Instagram ad metrics and Gemini recommendations in Google Slides."
date: 2026-11-27
weight: 7
launched: "2026-06"
long_form: true
faq_markdown: true
industry: "marketing"
industry_label: "Marketing / Reporting"
platform: "N8N"
nodes: 14
short_body: "Instead of bare numbers, the agency's client gets a monthly presentation with ad metrics and Gemini recommendations."
subtitle: "Monthly reports for agency clients: data from Google Sheets and Meta, Gemini analysis, a Google Slides presentation."
challenge: "Reports were written by hand or limited to bare numbers: average ROAS, budget spent, number of sales."
solution:
  - "n8n resolves the reporting month and pulls data from Google Sheets and Meta."
  - "The metrics are combined and sent to Gemini for analysis."
  - "Gemini gives recommendations on day, time and audience."
  - "The data is filled into a copy of a Google Slides template."
impact:
  - "A report is generated once a month for each client."
  - "Beyond summary numbers, it shows CPM, CTR and cost per click, message and sale."
  - "Gemini recommendations come with the numbers."
  - "The solution is growing: a dashboard with a client account area is in progress."
stack:
  - "n8n"
  - "Google Sheets"
  - "Meta (Facebook and Instagram) Ads"
  - "Google Gemini"
  - "Google Drive"
  - "Google Slides"
result_value: "1"
result_unit: "per month"
result_label: "report for each client"
complexity_summary: "Sheets and Meta → Gemini → Google Slides"
---

We automated monthly client reports for a marketing agency. n8n collects data from Google Sheets and Meta ads, sends the combined metrics to Gemini for analysis and fills in a Google Slides presentation. The report runs once a month for each client. It was launched in June 2026.

## The project in brief

- Client: a marketing agency. We don't name it.
- Task: monthly reporting to the agency's clients on Facebook and Instagram advertising.
- Systems: n8n, Google Sheets, Meta Ads, Gemini, Google Drive and Google Slides.
- Launch: June 2026.

## Before: a manual report or bare numbers

The report was either written by hand, or the client did not get it in the form it takes now. Previously clients received bare numbers: average ROAS, budget spent, number of sales and so on.

Numbers like these show the month's total but say little about what it is made of and what to try next.

## What the report includes now

The report covers the key Facebook and Instagram ad metrics, including:

| Metric | What it shows |
|---|---|
| CPM | the cost of a thousand impressions |
| CTR | the share of impressions that ended in a click |
| Cost per click | what one click costs |
| Cost per message | what one message enquiry costs |
| Cost per sale | how much ad spend goes into one sale |

Together these metrics help you follow the path from an ad impression to a message and a sale.

## Recommendations from Gemini

Once the data is combined, Gemini analyses it and adds recommendations. For example:

- which day was best for ads;
- which time performed better;
- which audience delivered the better result.

So the client gets not only a table of results but also pointers on what to look at next month.

## How it works

The n8n diagram has 14 nodes. Here is what they do:

1. Resolve the reporting month.
2. Read three Google Sheets tabs: “База” (base), “Факт” (actuals) and “Товари” (products).
3. Get ad statistics and ad data from Meta. Both requests are preceded by pauses to account for API rate limits.
4. Combine the metrics into one data set.
5. Send it to Gemini and parse the response into separate fields.
6. Copy a presentation template in Google Drive and fill it with the data in Google Slides.

Because every presentation starts as a copy of the template, the reports share the same structure and design.

The diagram on this page shows a manual trigger. In practice, the report runs once a month for each client.

## What changed

The client was happy with the result. Instead of a set of summary numbers, the report now includes more detailed ad metrics and recommendations on day, time and audience.

The solution has grown further: we are now turning these reports into a full dashboard with a client account area. It is still in progress.

## Who this fits

An agency or marketing team that reports on advertising to several clients or projects every month. Especially when part of the data sits in spreadsheets and part in the ad account.

To get started, you need to decide which metrics the client should see, where to take them from and what the report template looks like. Learn about [AI automation](/en/ai-avtomatyzaciya/) and [pricing](/en/tsiny/). For data controls in reporting, read [Financial Reporting Automation](/en/blog/financial-reporting-automation/).

## FAQ

### Which ad metrics are in the report?

The key Facebook and Instagram ad metrics, including CPM, CTR, cost per click, cost per message and cost per sale.

### What exactly does Gemini recommend?

Gemini analyses the data and points out, for example, which day and time performed better and which audience delivered the better result. These are recommendations, so check them before changing your ad settings.

### How often is the report generated?

Once a month, separately for each of the agency's clients.

### What format is the finished report?

A Google Slides presentation created from a template.

### How much does a similar solution cost?

It depends on the data sources, the set of metrics and the report template. See the [pricing](/en/tsiny/) page for reference points. If you are not sure where to start, there is an [automation audit](/en/automation-audit/).
