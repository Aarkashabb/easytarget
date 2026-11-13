---
title: "Voice AI Agent for Candidate Screening"
description: "n8n and ElevenLabs case: a voice agent calls candidates and updates KeyCRM. First three weeks of results, the hard parts and an honest word on price."
date: 2026-11-13
weight: 10
launched: "2026-09"
long_form: true
industry: "ai"
industry_label: "AI Agents"
platform: "N8N"
nodes: 60
short_body: "A voice agent calls candidates, runs the screening and moves the result into KeyCRM. In three weeks: 209 call attempts and 42 invitations from the agent."
subtitle: "A voice agent calls candidates itself, runs the screening and moves the result into KeyCRM."
challenge: "First-round candidate screening means many repetitive calls, after which a recruiter decided whom to invite to an interview."
solution:
  - "A candidate reaches a KeyCRM funnel stage: a dispatcher starts an ElevenLabs agent call over SIP."
  - "Phone and name are normalised; recruiters manage vacancy parameters in a Google Sheet."
  - "The call result moves the card to a stage; the recording and transcript are attached to the card."
  - "A Discord notification; if the candidate asks for a person, a manager calls back."
impact:
  - "209 call attempts in three weeks, 125 conversations."
  - "42 candidates invited by the agent, 54 of 73 together with managers."
  - "Of those invited by the agent, 26 of 42 came to the interview."
  - "After the script update the agent's share of invitations rose from 53% to 62%."
stack:
  - "n8n"
  - "KeyCRM"
  - "ElevenLabs Conversational AI"
  - "SIP telephony"
  - "Google Sheets"
  - "Discord"
result_value: "42"
result_unit: "invitations"
result_label: "from the agent in three weeks"
complexity_summary: "4 workflows · ElevenLabs + KeyCRM + SIP"
---

When a candidate reaches the right funnel stage in KeyCRM, a voice AI agent calls them itself, runs a short first-round screening and moves the result into the card. This is a solution for an education company that hires staff. Below are the numbers for the first three weeks, an honest breakdown of what was hard and an explanation of why such agents cost more than the rest of our work.

## Project at a glance

- Client: an education company (unnamed). It is the same client as in the case about the [AI assistant for company documents](/en/portfolio/telegram-rag-document-assistant/).
- Systems: n8n, KeyCRM, ElevenLabs Conversational AI, SIP telephony, Google Sheets, Discord for notifications.
- Launch: September 2026.

## The task

First-round screening takes many repetitive calls. Previously recruiters did it themselves and, based on the result, decided whether to invite the candidate to the first interview stage. The agent takes over exactly that call: the recruiter works with those who have already been invited.

## What we built

The work has two parts, and it helps to tell them apart.

**1. Automation around the call (n8n).** Four workflows, over 60 nodes in total.

1. **Dispatcher.** Takes candidates from three entry points: a schedule and two webhooks, one of which is an automatic callback. It starts calls in batches with pauses. A separate scenario covers a person who asked to be called back: the agent calls again at the time they named.
2. **Call launch.** For each candidate it reads the card and the buyer in KeyCRM, converts the phone to international format, puts the name in the vocative case so the agent addresses the person naturally, and loads the vacancy parameters. Before calling it checks that the vacancy has settings and that there is a phone number. If something is missing or the call could not be started, the card moves to a separate stage and a Discord notification is sent.
3. **Call result.** After the conversation ElevenLabs sends the result and the workflow decides how it ended: the candidate was invited, the AI declined, or a repeat call is needed (no answer, the candidate hung up, asked for a manager). The card gets a stage and a note, and a Discord notification is sent. In separate branches the call recording and transcript are attached to the card.
4. **Vacancy sync.** Recruiters manage vacancy parameters in a Google Sheet: job title, salary range, age, an extra question, a note for the agent, the funnel key and the vacancy name in the form needed for the agent's phrase. The workflow reads it on a schedule and via a manual webhook and updates a table in n8n. A new vacancy does not need a developer.

**2. The voice agent itself.** The conversation script, behaviour in dialogue, reactions to refusals and unexpected situations. This is not a workflow but a separate effort on conversation quality. The agent introduces itself as an AI right away and asks to go through a short screening. If the candidate wants to talk to a person, the manager gets a notification to call that particular candidate back.

## Numbers

The first three weeks of operation (29.09–20.10.2026) for one vacancy, excluding test calls. Two script variants were used in this period: the second from 12.10.

| Metric | Value |
|---|---|
| Call attempts | 209 |
| Connected | 125 (60%); the rest: no answer, busy, number unavailable |
| Conversations longer than 2 minutes | 52 |
| Candidates processed | 73 |
| Invited to an interview by the agent | 42 |
| Invited together with managers who picked up those who did not want to talk to the AI | 54 of 73 (74%) |
| Of those invited by the agent, came to the interview | 26 of 42 (62%) |
| Did not want to talk to the AI (hung up or refused) | 21 of 73 |

A conversation longer than 2 minutes does not yet mean a successful outcome; it only indicates that a conversation took place. The reports cover the first weeks, not the whole time the agent has been running.

Comparing the two script versions: after the greeting was updated on 12.10, the share of conversations longer than 2 minutes among those that took place rose from 33% to 54%, and the agent invited 62% of candidates instead of 53%. This is probably the effect of the new greeting, but it is not directly proven. The number of successful calls also rose, from 25 to 27 (their share of all attempts from 22% to 28%), even though the second period had fewer calls (97 against 112). Conversations became longer, so the cost of a successful call rose by roughly 50%, from $0.19 to $0.29 (counting all failed attempts). All 209 attempts cost $12.73 according to ElevenLabs, excluding taxes; this is the cost of the calls, not of the project.

## What was hard

Technically hard parts: a name dictionary with vocative case, phone normalisation and the checks before the call. But the main difficulty was different: the script and unexpected situations. We had to design how the AI should speak and handle what the script did not foresee: background noise, a candidate repeating themselves, the agent mishearing something. This had to be fixed in production, right away. For two weeks before launch we tested on safe calls and everything was fine, but it is impossible to test every scenario: people are different.

Most often it is the candidates themselves who hang up on the AI: in the first three weeks 21 of 73 did not want to talk to it. In the first script version (29.09–09.10) managers picked up and invited all seven who hung up. So handing over to a person was not a fallback but part of the job.

## What we would do differently

Nothing in principle: two weeks of testing on safe calls had already been done. The only thing that would change with the experience gained is setting up ElevenLabs itself faster for a new agent.

## An honest word on price

The automation around the call and fine-tuning the agent itself (script, conversational behaviour) are different kinds of work. The first can be planned precisely. The second needs live conversations, listening and many iterations, and its scope is hard to estimate in advance. That is why a voice AI agent is the most expensive service we offer. According to our [public pricing](/en/tsiny/) it costs roughly $1,440–3,000 and takes 2–4 weeks; telephony, STT/TTS and provider fees are paid separately. These are guidelines, not an offer. More about our [AI solutions](/en/ai-avtomatyzaciya/).

## Workflow diagram

KeyCRM stage → dispatcher → card, phone, name in vocative case, vacancy parameters → checks → ElevenLabs call over SIP → result → stage and note in the card, recording and transcript, Discord notification.

## FAQ

### How much does a voice AI agent cost?

Public guideline from our pricing page: $1,440–3,000, 2–4 weeks. The final price depends on the number of languages, scenario complexity, audio quality and error control. Telephony and provider fees are paid separately.

### Why is a voice agent more expensive than other automations?

The automation around the call is predictable, while fine-tuning the agent itself needs live conversations and many iterations. These are different kinds of work.

### Does it work with our CRM?

In this project the agent works with KeyCRM through webhooks and the API. The logic is the same across CRMs, so by our estimate it can be implemented in about 90% of them.

### Does the candidate know they are talking to an AI?

Yes: the agent introduces itself as an AI right away and asks to go through a short screening. If the candidate wants a person, a manager gets a notification to call back.
