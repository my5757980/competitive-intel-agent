---
id: "002"
title: CompeteIQ GTM Intel Agent Spec
stage: spec
date: 2026-05-23
surface: agent
model: claude-sonnet-4-6
feature: 001-gtm-intel-agent
branch: 001-gtm-intel-agent
user: Muhammad Yaseen
command: /sp.specify
labels: ["spec","gtm","bright-data","crewai","hackathon","competitor-monitoring","serp","lead-enrichment"]
links:
  spec: specs/001-gtm-intel-agent/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-gtm-intel-agent/spec.md
  - specs/001-gtm-intel-agent/checklists/requirements.md
tests:
  - none
---

## Prompt

Feature: CompeteIQ GTM Intelligence AI Agent

Build a complete GTM (Go-To-Market) Intelligence platform for the Bright Data Web Data UNLOCKED Hackathon.

Core Features:
1. Competitor Monitoring — User enters competitor URLs/names, AI agent scrapes their website using Bright Data Web Unlocker, extracts: pricing, product features, job postings, recent changes
2. Market Search Intelligence — SERP API searches Google/Bing for competitor news, funding rounds, product launches, hiring signals — returns structured results
3. Lead Enrichment — User enters company name/LinkedIn URL, Web Scraper API fetches structured company data: size, tech stack, recent news, decision makers
4. Intelligence Report Generation — CrewAI reporter agent synthesizes all data into a structured business intelligence report with actionable insights

User Stories:
- Sales rep enters "monitor Salesforce pricing page" → gets real-time pricing data + changes
- Marketing manager searches "competitor product launches this week" → gets structured SERP results
- SDR enriches a lead company → gets company profile, tech stack, hiring signals
- Manager requests "full intelligence report on HubSpot" → gets comprehensive PDF-ready report

Tech: Python 3.12 + FastAPI + CrewAI + Bright Data (Web Unlocker + SERP API + Web Scraper API + MCP Server) + Next.js 15 dashboard

## Response snapshot

Feature spec created at `specs/001-gtm-intel-agent/spec.md` with:
- 4 user stories (P1-P4): Competitor Monitoring, Market Search, Lead Enrichment, Intelligence Report
- 12 functional requirements (FR-001 to FR-012)
- 8 success criteria (SC-001 to SC-008) — all measurable and time-bound
- 4 edge cases documented
- Checklist created at specs/001-gtm-intel-agent/checklists/requirements.md — all items passing

## Outcome

- ✅ Impact: Complete feature spec ready — 4 user stories, 12 FRs, 8 SCs, 0 clarifications needed
- 🧪 Tests: none at spec stage
- 📁 Files: specs/001-gtm-intel-agent/spec.md, checklists/requirements.md
- 🔁 Next prompts: /sp.plan — architecture and implementation plan
- 🧠 Reflection: Stateless design + partial failure tolerance (FR-009) are key for hackathon demo reliability

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): checklist all pass
- Prompt variant (if applicable): initial
- Next experiment: /sp.plan with full architecture
