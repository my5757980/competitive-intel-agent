<!--
SYNC IMPACT REPORT
==================
Version change: [TEMPLATE] → 1.0.0
Modified principles: N/A (initial population from template)
Added sections:
  - I. Bright Data Integration (REQUIRED)
  - II. AI-First Architecture
  - III. Type Safety & Async
  - IV. Security & Secrets
  - V. Hackathon Delivery Speed
  - VI. Stateless Demo Design
  - Tech Stack & Deployment
  - Development Workflow
  - Governance
Templates reviewed:
  - .specify/templates/spec-template.md ✅ aligned
  - .specify/templates/plan-template.md ✅ aligned
  - .specify/templates/tasks-template.md ✅ aligned
Deferred TODOs: none
-->

# CompeteIQ Constitution

## Core Principles

### I. Bright Data Integration (NON-NEGOTIABLE)

Every data-collection feature MUST demonstrably use at least one Bright Data product.
Permitted tools: MCP Server, Web Unlocker, SERP API, Web Scraper API, Scraping Browser, Proxies.
Direct HTTP scraping without Bright Data proxy/unlocker is FORBIDDEN.
All Bright Data credentials MUST come from environment variables — never hardcoded.
**Rationale**: Hackathon rule — submissions without Bright Data usage are disqualified.

### II. AI-First Architecture

The system MUST use CrewAI multi-agent framework for all intelligence tasks.
Four specialized agents are required: Competitor Monitor, Market Researcher, Lead Enricher, Intelligence Reporter.
Each agent MUST have a clearly defined role, goal, backstory, and tool list.
Agent results MUST be structured Pydantic models — no raw string returns.
LLM provider MUST be configurable via env var (OPENAI_API_KEY or GROQ_API_KEY).
**Rationale**: Judges evaluate AI integration quality — single-agent or LLM-only calls score lower.

### III. Type Safety & Async

All Python code MUST use type hints on every function signature and Pydantic v2 for request/response models.
All FastAPI endpoints MUST be async.
All Bright Data API calls MUST be wrapped in async httpx or aiohttp — no blocking requests.
Frontend MUST use TypeScript — no plain JavaScript files.
**Rationale**: Type safety prevents runtime errors during live hackathon demos.

### IV. Security & Secrets

API keys and credentials MUST only be read from environment variables.
A `.env.example` file MUST exist listing every required env var with a placeholder value.
The `.env` file MUST be in `.gitignore` — never committed.
CORS MUST be configured to allow only the frontend origin in production.
**Rationale**: Accidental secret leakage disqualifies projects from public GitHub submission.

### V. Hackathon Delivery Speed

Each feature MUST be independently demoable — partial builds MUST still run.
No feature flags, no backwards-compatibility shims — implement and ship.
Docker Compose MUST start the full stack with a single `docker compose up` command.
README MUST include a 3-step Quick Start that works on a fresh machine.
**Rationale**: Hackathon deadline is fixed — a working MVP beats a broken full product.

### VI. Stateless Demo Design

Backend MUST be stateless — no persistent database required for the hackathon demo.
All intelligence results MUST be returned directly in API responses (JSON).
In-memory caching (Python dict / LRU cache) is acceptable for repeated queries.
**Rationale**: Eliminates database setup friction and reduces demo failure surface area.

## Tech Stack & Deployment

**Backend**: Python 3.12 + FastAPI + CrewAI + httpx
**Frontend**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
**AI Providers**: OpenAI GPT-4o (primary) or Groq llama-3.3-70b (fallback)
**Bright Data Tools**: MCP Server, Web Unlocker, SERP API, Web Scraper API
**Containerization**: Docker + Docker Compose (multi-service)
**Deploy — Backend**: Railway
**Deploy — Frontend**: Vercel
**Testing**: pytest (backend unit tests only — no heavy test suite)
**Package Manager**: uv (Python), npm (Node)

## Development Workflow

1. All work MUST follow the SpecKit Plus pipeline: Constitution → Specify → Plan → Tasks → Implement.
2. Every prompt interaction MUST produce a PHR (Prompt History Record) in `history/prompts/`.
3. Tasks MUST be completed in dependency order — foundational before feature work.
4. Each completed task MUST leave the app in a runnable state.
5. Commits MUST reference the task ID (e.g., `T003: implement SERP API tool`).
6. Architecturally significant decisions MUST be surfaced as ADR suggestions — never auto-created.

## Governance

This constitution is the authoritative source of project principles for CompeteIQ.
All implementation decisions MUST align with these principles.
Amendments require: (a) clear rationale, (b) version bump, (c) update to LAST_AMENDED_DATE.
Version policy: MAJOR = principle removal/redefinition | MINOR = new principle/section | PATCH = wording fix.
Constitution supersedes any conflicting guidance in README or inline comments.

**Version**: 1.0.0 | **Ratified**: 2026-05-23 | **Last Amended**: 2026-05-23
