---
id: "003"
title: CompeteIQ GTM Intel Architecture Plan
stage: plan
date: 2026-05-23
surface: agent
model: claude-sonnet-4-6
feature: 001-gtm-intel-agent
branch: 001-gtm-intel-agent
user: Muhammad Yaseen
command: /sp.plan
labels: ["plan","architecture","crewai","fastapi","nextjs","bright-data","sse","docker"]
links:
  spec: specs/001-gtm-intel-agent/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-gtm-intel-agent/plan.md
  - specs/001-gtm-intel-agent/research.md
  - specs/001-gtm-intel-agent/data-model.md
  - specs/001-gtm-intel-agent/quickstart.md
  - specs/001-gtm-intel-agent/contracts/openapi.yaml
tests:
  - none
---

## Prompt

Feature: 001-gtm-intel-agent — CompeteIQ GTM Intelligence AI Agent

Spec: specs/001-gtm-intel-agent/spec.md

Architecture decisions:
- Backend: Python 3.12 + FastAPI (async) — 4 routers: /monitor, /search, /enrich, /report
- AI Agents: CrewAI with 4 agents: CompetitorMonitorAgent, MarketResearchAgent, LeadEnricherAgent, IntelligenceReporterAgent
- Bright Data Tools: WebUnlockerTool, SerpApiTool, WebScraperApiTool, BrightDataMcpTool
- Pydantic v2 models for all request/response
- Frontend: Next.js 15 App Router + TypeScript + Tailwind CSS + shadcn/ui
- Real-time progress via SSE for report generation
- No database — stateless
- Docker Compose: backend (8000) + frontend (3000)
- Deploy: Railway + Vercel

## Response snapshot

Complete implementation plan at specs/001-gtm-intel-agent/plan.md with:
- All 6 constitution gates: PASS
- research.md: 8 architectural decisions resolved
- data-model.md: 9 Pydantic v2 models defined
- contracts/openapi.yaml: 6 endpoints fully typed
- quickstart.md: 3-step Docker Compose start
- Source tree: 25+ files mapped across backend/ and frontend/
- 7 implementation phases defined
- 2 ADR suggestions surfaced

## Outcome

- ✅ Impact: Full architecture plan ready — 7 phases, all Bright Data integrations mapped, SSE streaming designed
- 🧪 Tests: pytest planned for 3 Bright Data tool wrappers
- 📁 Files: plan.md, research.md, data-model.md, quickstart.md, contracts/openapi.yaml
- 🔁 Next prompts: /sp.tasks — generate actionable task list
- 🧠 Reflection: SSE for report streaming is the right call — WebSocket adds unnecessary complexity for one-way progress

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): all constitution gates PASS
- Prompt variant (if applicable): initial
- Next experiment: /sp.tasks to generate T001+ implementation tasks
