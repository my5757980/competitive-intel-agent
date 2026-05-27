---
id: "001"
title: CompeteIQ Constitution Init
stage: constitution
date: 2026-05-23
surface: agent
model: claude-sonnet-4-6
feature: none
branch: main
user: Muhammad Yaseen
command: /sp.constitution
labels: ["constitution","bright-data","hackathon","crewai","fastapi","nextjs"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - none
---

## Prompt

Project: CompeteIQ — GTM Intelligence AI Agent for Bright Data Hackathon

Principles:
- Tech Stack: Python 3.12 + FastAPI + Next.js 15 (App Router) + CrewAI + Bright Data APIs
- AI Agents: CrewAI multi-agent system with 4 specialized agents
- Bright Data Integration: MCP Server, Web Unlocker, SERP API, Web Scraper API (REQUIRED — hackathon rule)
- Database: None (stateless for hackathon demo) — results stored in memory/JSON
- Deployment: Railway (backend) + Vercel (frontend)
- API Keys: BRIGHT_DATA_API_KEY, OPENAI_API_KEY or GROQ_API_KEY in .env
- Code Quality: Type hints everywhere, Pydantic models, async/await
- Testing: pytest for backend, no heavy test suite (hackathon speed)
- Security: Never hardcode API keys, use .env.example
- Architecture: REST API backend + React frontend dashboard
- Working Directory: E:\New folder\competitive-intel-agent

## Response snapshot

Constitution v1.0.0 created at `.specify/memory/constitution.md` with 6 core principles:
I. Bright Data Integration (NON-NEGOTIABLE) — hackathon disqualification rule
II. AI-First Architecture — CrewAI 4-agent system required
III. Type Safety & Async — Pydantic v2, async FastAPI, TypeScript frontend
IV. Security & Secrets — .env only, .env.example required, .gitignore enforced
V. Hackathon Delivery Speed — Docker Compose single-command start, 3-step README
VI. Stateless Demo Design — no database, JSON responses, in-memory cache

## Outcome

- ✅ Impact: Project constitution established — all 6 principles ratified for CompeteIQ hackathon submission
- 🧪 Tests: none at this stage
- 📁 Files: .specify/memory/constitution.md written (v1.0.0)
- 🔁 Next prompts: /sp.specify — create feature spec for GTM intelligence agent
- 🧠 Reflection: Stateless design principle is critical for hackathon — eliminates DB setup as a demo failure point

## Evaluation notes (flywheel)

- Failure modes observed: none
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): initial
- Next experiment: run /sp.specify with full feature description
