# Implementation Plan: 001-gtm-intel-agent

**Branch**: `001-gtm-intel-agent` | **Date**: 2026-05-23 | **Spec**: [spec.md](spec.md)

## Summary

Build CompeteIQ — a GTM Intelligence AI platform for the Bright Data Web Data UNLOCKED Hackathon. The system uses CrewAI multi-agent orchestration with Bright Data's Web Unlocker, SERP API, and Web Scraper API to provide real-time competitive intelligence through a Next.js dashboard backed by a FastAPI service.

## Technical Context

**Language/Version**: Python 3.12 (backend), TypeScript / Node 20 (frontend)
**Primary Dependencies**: FastAPI 0.115+, CrewAI 0.80+, httpx 0.27+, BeautifulSoup4, Pydantic v2, Next.js 15, Tailwind CSS, shadcn/ui
**Storage**: None — stateless, all results returned in API response
**Testing**: pytest (backend unit tests for Bright Data tool wrappers)
**Target Platform**: Docker (local) → Railway (backend) + Vercel (frontend)
**Project Type**: Web application (backend + frontend)
**Performance Goals**: Monitor <30s p90, Search <15s p90, Report <90s p80
**Constraints**: Bright Data API credits limited ($250/participant) — avoid redundant calls; SSE stream must not block FastAPI workers
**Scale/Scope**: Hackathon demo — single user, no auth, no multi-tenancy needed

## Constitution Check

| Principle | Gate | Status |
|-----------|------|--------|
| I. Bright Data Integration | All 4 routes use ≥1 Bright Data product | ✅ PASS |
| II. AI-First Architecture | 4 CrewAI agents with defined roles + tools | ✅ PASS |
| III. Type Safety & Async | All endpoints async, Pydantic v2 models, TypeScript frontend | ✅ PASS |
| IV. Security & Secrets | .env.example provided, .env in .gitignore, no keys in responses | ✅ PASS |
| V. Hackathon Delivery Speed | Docker Compose single command, 3-step README | ✅ PASS |
| VI. Stateless Demo Design | No database, all results in API response | ✅ PASS |

All gates pass. Proceeding to implementation.

## Project Structure

### Documentation (this feature)

```text
specs/001-gtm-intel-agent/
├── spec.md              ✅ done
├── research.md          ✅ done
├── data-model.md        ✅ done
├── quickstart.md        ✅ done
├── plan.md              ✅ this file
├── contracts/
│   └── openapi.yaml     ✅ done
└── tasks.md             ⏳ /sp.tasks next
```

### Source Code

```text
competitive-intel-agent/
├── backend/
│   ├── main.py                          # FastAPI app, CORS, router registration
│   ├── config.py                        # Settings from env vars (pydantic-settings)
│   ├── models/
│   │   ├── requests.py                  # MonitorRequest, SearchRequest, EnrichRequest, ReportRequest
│   │   └── responses.py                 # CompetitorIntelligence, SearchResponse, CompanyProfile, IntelligenceReport, ProgressEvent, ErrorResponse
│   ├── tools/
│   │   ├── web_unlocker.py              # Bright Data Web Unlocker async tool
│   │   ├── serp_api.py                  # Bright Data SERP API async tool
│   │   ├── web_scraper_api.py           # Bright Data Web Scraper API async tool
│   │   └── content_extractor.py         # BeautifulSoup HTML → structured data
│   ├── agents/
│   │   ├── competitor_monitor.py        # CrewAI Agent: CompetitorMonitorAgent
│   │   ├── market_researcher.py         # CrewAI Agent: MarketResearchAgent
│   │   ├── lead_enricher.py             # CrewAI Agent: LeadEnricherAgent
│   │   ├── intel_reporter.py            # CrewAI Agent: IntelligenceReporterAgent
│   │   └── crew.py                      # Crew assembly + kickoff orchestration
│   ├── routers/
│   │   ├── monitor.py                   # POST /monitor
│   │   ├── search.py                    # POST /search
│   │   ├── enrich.py                    # POST /enrich
│   │   └── report.py                    # POST /report, POST /report/stream (SSE)
│   ├── tests/
│   │   ├── test_web_unlocker.py
│   │   ├── test_serp_api.py
│   │   └── test_content_extractor.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/
│   │   ├── layout.tsx                   # Root layout, nav, dark theme
│   │   ├── page.tsx                     # Home — feature cards
│   │   ├── monitor/page.tsx             # Competitor monitor UI
│   │   ├── search/page.tsx              # Market search UI
│   │   ├── enrich/page.tsx              # Lead enrichment UI
│   │   └── report/page.tsx              # Full report UI with SSE progress
│   ├── components/
│   │   ├── CompetitorCard.tsx           # Displays CompetitorIntelligence
│   │   ├── SearchResultList.tsx         # Displays SearchResponse
│   │   ├── CompanyProfileCard.tsx       # Displays CompanyProfile
│   │   ├── ReportViewer.tsx             # Displays IntelligenceReport sections
│   │   ├── ProgressFeed.tsx             # SSE progress events display
│   │   └── ApiForm.tsx                  # Reusable input form component
│   ├── lib/
│   │   └── api.ts                       # fetch wrappers for all 4 endpoints
│   ├── package.json
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

**Structure Decision**: Web application (Option 2) — separate backend/ and frontend/ directories with Docker Compose linking them.

## Architecture Decision Record Suggestion

📋 **Architectural decision detected**: Using Server-Sent Events (SSE) over WebSockets for report progress streaming.
Document reasoning and tradeoffs? Run `/sp.adr sse-vs-websocket-report-streaming`

📋 **Architectural decision detected**: Stateless API design — no database, all results in response.
Document reasoning and tradeoffs? Run `/sp.adr stateless-hackathon-design`

## Phase Breakdown

### Phase 1 — Setup & Foundation
- Project scaffolding, Docker Compose, .env.example, README
- FastAPI app skeleton with CORS and health endpoint
- Next.js 15 app skeleton with layout and nav

### Phase 2 — Bright Data Tool Layer
- WebUnlockerTool (async httpx POST)
- SerpApiTool (async httpx GET)
- WebScraperApiTool (async httpx GET)
- ContentExtractor (BeautifulSoup HTML parsing)
- Unit tests for all tools (mock Bright Data responses)

### Phase 3 — CrewAI Agents (US1 — Competitor Monitor)
- CompetitorMonitorAgent with WebUnlockerTool
- POST /monitor router
- Frontend: monitor/page.tsx + CompetitorCard component

### Phase 4 — Market Search (US2)
- MarketResearchAgent with SerpApiTool
- POST /search router
- Frontend: search/page.tsx + SearchResultList component

### Phase 5 — Lead Enrichment (US3)
- LeadEnricherAgent with WebScraperApiTool
- POST /enrich router
- Frontend: enrich/page.tsx + CompanyProfileCard component

### Phase 6 — Intelligence Report + SSE (US4)
- IntelligenceReporterAgent (GPT-4o/Groq synthesis)
- Crew assembly in crew.py
- POST /report and POST /report/stream routers
- Frontend: report/page.tsx + ReportViewer + ProgressFeed components

### Phase 7 — Polish & Deploy
- README with 3-step quickstart
- Railway deploy config (backend)
- Vercel deploy config (frontend)
- Final demo test

## Complexity Tracking

> No constitution violations requiring justification.
