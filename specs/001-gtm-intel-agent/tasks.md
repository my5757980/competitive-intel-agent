---
description: "Task list for CompeteIQ GTM Intelligence AI Agent"
---

# Tasks: 001-gtm-intel-agent — CompeteIQ GTM Intelligence AI Agent

**Input**: Design documents from `specs/001-gtm-intel-agent/`
**Prerequisites**: plan.md ✅ | spec.md ✅ | data-model.md ✅ | contracts/openapi.yaml ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1=Competitor Monitor, US2=Market Search, US3=Lead Enrichment, US4=Intelligence Report
- Include exact file paths in all descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project scaffolding, Docker Compose, environment config, README

- [x] T001 Create backend/ directory structure: `backend/main.py`, `backend/config.py`, `backend/models/`, `backend/tools/`, `backend/agents/`, `backend/routers/`, `backend/tests/`
- [x] T002 [P] Create frontend/ directory structure: `frontend/app/`, `frontend/components/`, `frontend/lib/`
- [x] T003 [P] Create `docker-compose.yml` with backend service (port 8000) and frontend service (port 3000), both reading from `.env`
- [x] T004 [P] Create `.env.example` with all required keys: `BRIGHT_DATA_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `BACKEND_URL=http://localhost:8000`
- [x] T005 [P] Create `README.md` with project description, 3-step quickstart (clone → edit .env → docker compose up), and feature overview
- [x] T006 Create `backend/requirements.txt` with: fastapi, uvicorn, crewai, httpx, beautifulsoup4, pydantic-settings, python-dotenv, lxml
- [x] T007 [P] Create `backend/Dockerfile`: python:3.12-slim base, copy requirements, pip install, expose 8000, uvicorn entrypoint
- [x] T008 [P] Create `frontend/package.json` with: next@15, react@18, typescript, tailwindcss, @radix-ui/react components (shadcn base)
- [x] T009 [P] Create `frontend/Dockerfile`: node:20-slim base, npm install, npm run build, expose 3000
- [x] T010 [P] Create `frontend/tailwind.config.ts` and `frontend/tsconfig.json` with Next.js 15 App Router settings

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core models, config, FastAPI skeleton, Next.js skeleton — MUST complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T011 Create `backend/config.py` using pydantic-settings: `Settings` class reading `BRIGHT_DATA_API_KEY`, `GROQ_API_KEY`, `OPENAI_API_KEY`, `BACKEND_URL` from env; raise ValueError if `BRIGHT_DATA_API_KEY` is empty
- [x] T012 [P] Create `backend/models/requests.py` with Pydantic v2 models: `MonitorRequest`, `SearchRequest`, `EnrichRequest`, `ReportRequest` (exact fields from `specs/001-gtm-intel-agent/data-model.md`)
- [x] T013 [P] Create `backend/models/responses.py` with Pydantic v2 models: `PricingTier`, `CompetitorIntelligence`, `SearchResult`, `SearchResponse`, `CompanyProfile`, `ReportSection`, `IntelligenceReport`, `ProgressEvent`, `ErrorResponse` (exact fields from `specs/001-gtm-intel-agent/data-model.md`)
- [x] T014 Create `backend/main.py`: FastAPI app instance, CORS middleware (allow origins from env), register routers (`/monitor`, `/search`, `/enrich`, `/report`), add `GET /health` endpoint returning `{"status": "ok", "bright_data_configured": bool}`
- [x] T015 [P] Create `frontend/app/layout.tsx`: root layout with dark background, top nav bar with links to Monitor/Search/Enrich/Report pages, Tailwind CSS applied globally
- [x] T016 [P] Create `frontend/app/page.tsx`: home dashboard with 4 feature cards (Monitor, Search, Enrich, Report) each with icon, title, description, and link button
- [x] T017 [P] Create `frontend/lib/api.ts`: async fetch wrappers for all 4 endpoints — `monitorCompetitor(req)`, `searchMarket(req)`, `enrichCompany(req)`, `generateReport(req)` — all using `NEXT_PUBLIC_BACKEND_URL` env var

**Checkpoint**: `docker compose up` starts both services, `/health` returns 200, home page loads with 4 feature cards

---

## Phase 3: User Story 1 — Competitor Monitor (Priority: P1) 🎯 MVP

**Goal**: User enters competitor URL/name → receives structured intelligence via Bright Data Web Unlocker

**Independent Test**: POST `http://localhost:8000/monitor` with `{"target": "stripe.com/pricing"}` returns JSON with `pricing_tiers`, `product_claims`, `collected_at` fields populated

### Implementation for User Story 1

- [x] T018 Create `backend/tools/web_unlocker.py`: async function `scrape_with_unlocker(url: str, country: str) -> str` using httpx POST to Bright Data Web Unlocker endpoint (`https://api.brightdata.com/request`) with Bearer auth, returns HTML string; raises `httpx.HTTPError` on failure
- [x] T019 Create `backend/tools/content_extractor.py`: function `extract_competitor_intelligence(html: str, url: str) -> dict` using BeautifulSoup4 to extract: pricing tables (look for `<table>` near currency symbols), product feature lists (`<ul>/<li>` near feature headings), job count (look for "jobs", "careers", "openings" patterns), page summary (first 3 meaningful paragraphs)
- [x] T020 [P] Create `backend/tests/test_web_unlocker.py`: unit test with mocked httpx response — verify `scrape_with_unlocker` returns HTML string on 200, raises on 403/429/500
- [x] T021 [P] Create `backend/tests/test_content_extractor.py`: unit test with fixture HTML — verify pricing tiers extracted, feature lists extracted, returns empty lists (not errors) for missing sections
- [x] T022 Create `backend/agents/competitor_monitor.py`: CrewAI `Agent` named "Competitor Monitor" with role "Web Intelligence Specialist", goal "Extract structured competitive intelligence from competitor websites", tool: `WebUnlockerCrewAITool` wrapping `scrape_with_unlocker` + `extract_competitor_intelligence`; returns `CompetitorIntelligence` Pydantic model
- [x] T023 Create `backend/routers/monitor.py`: `APIRouter` with `POST /monitor` endpoint — validates `MonitorRequest`, calls `CompetitorMonitorAgent`, catches `httpx.HTTPError` returning `ErrorResponse` with 503, returns `CompetitorIntelligence` on success
- [x] T024 [P] Create `frontend/components/CompetitorCard.tsx`: TypeScript component accepting `CompetitorIntelligence` prop — displays: target URL, pricing tiers table (name/price/features columns), product claims badges, job count, collected_at timestamp, data_source chip
- [x] T025 Create `frontend/app/monitor/page.tsx`: page with URL/company name text input, "Monitor" button, loading spinner, renders `CompetitorCard` on success, renders error alert on failure; calls `monitorCompetitor()` from `lib/api.ts`

**Checkpoint**: US1 fully functional — enter any URL in /monitor page, get structured data back

---

## Phase 4: User Story 2 — Market Search (Priority: P2)

**Goal**: User enters search query → receives structured SERP results via Bright Data SERP API

**Independent Test**: POST `http://localhost:8000/search` with `{"query": "Stripe new features 2026"}` returns JSON with `results` array of ≥5 items each having `title`, `url`, `snippet`

### Implementation for User Story 2

- [x] T026 Create `backend/tools/serp_api.py`: async function `search_serp(query: str, num_results: int, date_filter: str | None) -> list[dict]` using httpx GET to `https://api.brightdata.com/serp/google` with `q`, `num`, `brd_json=1` params and Bearer auth; parses JSON response and returns list of result dicts
- [x] T027 [P] Create `backend/tests/test_serp_api.py`: unit test with mocked httpx response — verify returns list of dicts with title/url/snippet keys on 200, returns empty list (not error) on empty results, raises on 503
- [x] T028 Create `backend/agents/market_researcher.py`: CrewAI `Agent` named "Market Researcher" with role "Market Intelligence Analyst", goal "Find market signals, competitor news, and buying intent from live search results", tool: `SerpApiCrewAITool` wrapping `search_serp`; returns `SearchResponse` Pydantic model
- [x] T029 Create `backend/routers/search.py`: `APIRouter` with `POST /search` endpoint — validates `SearchRequest` (min 3 chars), calls `MarketResearchAgent`, catches errors returning `ErrorResponse` with 503, returns `SearchResponse` on success
- [x] T030 [P] Create `frontend/components/SearchResultList.tsx`: TypeScript component accepting `SearchResponse` prop — displays: query as header, results as list of cards each showing title (link), snippet, source_date badge, relevance_signal if present; total_results count; collected_at timestamp
- [x] T031 Create `frontend/app/search/page.tsx`: page with query text input, optional date filter dropdown (past_week/past_month/any), "Search" button, loading spinner, renders `SearchResultList` on success, error alert on failure; calls `searchMarket()` from `lib/api.ts`

**Checkpoint**: US2 functional — enter any query in /search page, get SERP results back

---

## Phase 5: User Story 3 — Lead Enrichment (Priority: P3)

**Goal**: User enters company name/URL → receives enriched company profile via Bright Data Web Scraper API

**Independent Test**: POST `http://localhost:8000/enrich` with `{"company": "Stripe"}` returns JSON with `name`, `industry`, `size_range`, `recent_news` array populated

### Implementation for User Story 3

- [x] T032 Create `backend/tools/web_scraper_api.py`: async function `enrich_company(company: str) -> dict` using httpx GET to Bright Data Web Scraper API endpoint for company/LinkedIn data with Bearer auth; if input is LinkedIn URL use LinkedIn scraper endpoint, else use generic company scraper; returns structured dict
- [x] T033 [P] Create `backend/tests/test_web_scraper_api.py`: unit test with mocked httpx response — verify returns dict with expected keys on 200, returns partial dict (not error) when some fields missing, raises on 503
- [x] T034 Create `backend/agents/lead_enricher.py`: CrewAI `Agent` named "Lead Enricher" with role "Company Intelligence Specialist", goal "Build comprehensive company profiles from public web data for sales qualification", tool: `WebScraperApiCrewAITool` wrapping `enrich_company`; returns `CompanyProfile` Pydantic model
- [x] T035 Create `backend/routers/enrich.py`: `APIRouter` with `POST /enrich` endpoint — validates `EnrichRequest` (min 2 chars), calls `LeadEnricherAgent`, catches errors returning `ErrorResponse` with 503, returns `CompanyProfile` on success
- [x] T036 [P] Create `frontend/components/CompanyProfileCard.tsx`: TypeScript component accepting `CompanyProfile` prop — displays: company name as header, industry/size/HQ as info row with badges, recent_news as bullet list, tech_signals as tag cloud, linkedin_followers if present, collected_at timestamp
- [x] T037 Create `frontend/app/enrich/page.tsx`: page with company name/URL input, "Enrich" button, loading spinner, renders `CompanyProfileCard` on success, error alert on failure; calls `enrichCompany()` from `lib/api.ts`

**Checkpoint**: US3 functional — enter any company name in /enrich page, get company profile back

---

## Phase 6: User Story 4 — Intelligence Report + SSE (Priority: P4)

**Goal**: User enters competitor name → AI synthesizes all data sources into a full report with live progress streaming

**Independent Test**: POST `http://localhost:8000/report` with `{"competitor": "HubSpot"}` returns JSON with `sections` array (≥3 sections), `executive_summary`, `recommended_actions`, `data_completeness` between 0–1

### Implementation for User Story 4

- [x] T038 Create `backend/agents/intel_reporter.py`: CrewAI `Agent` named "Intelligence Reporter" with role "Strategic Intelligence Analyst", goal "Synthesize all competitive data into actionable business intelligence reports", LLM: Groq `llama-3.3-70b-versatile` (fallback to OpenAI `gpt-4o` if GROQ_API_KEY not set); no external tools needed — synthesizes data passed via task context
- [x] T039 Create `backend/agents/crew.py`: `CompeteIQCrew` class with `async def run_full_report(competitor: str, progress_callback: Callable) -> IntelligenceReport` method — runs all 4 agents sequentially: (1) monitor competitor homepage, (2) search market signals, (3) enrich company profile, (4) reporter synthesizes all → returns `IntelligenceReport`; calls `progress_callback(ProgressEvent)` before each agent starts
- [x] T040 Create `backend/routers/report.py`: `APIRouter` with two endpoints:
  - `POST /report`: runs `CompeteIQCrew.run_full_report()` synchronously, returns `IntelligenceReport`
  - `POST /report/stream`: returns `StreamingResponse` with `text/event-stream` content-type; uses async generator yielding `data: {ProgressEvent JSON}\n\n` for each agent step, then `event: report\ndata: {IntelligenceReport JSON}\n\n` as final event
- [x] T041 [P] Create `frontend/components/ProgressFeed.tsx`: TypeScript component accepting `events: ProgressEvent[]` prop — displays vertical timeline of agent progress events with: agent name, status icon (spinner/check/x), message, timestamp; auto-scrolls to latest event
- [x] T042 [P] Create `frontend/components/ReportViewer.tsx`: TypeScript component accepting `IntelligenceReport` prop — displays: competitor name as header, executive_summary in highlighted box, sections as expandable cards (title + content + confidence badge + sources list), recommended_actions as numbered checklist, data_completeness as progress bar, generation_time_seconds
- [x] T043 Create `frontend/app/report/page.tsx`: page with competitor name input, "Generate Report" button; on submit opens SSE connection to `/report/stream` using browser `EventSource` API; renders `ProgressFeed` updating live as events arrive; replaces with `ReportViewer` on final "report" event; shows error alert on "failed" event

**Checkpoint**: US4 functional — enter competitor in /report page, watch live agent progress, get full structured report

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, deploy configs, final integration validation

- [x] T044 Add global exception handler to `backend/main.py`: catch unhandled exceptions, return `ErrorResponse` with 500 and sanitized message (no stack traces in response)
- [x] T045 [P] Add request validation error handler to `backend/main.py`: catch Pydantic `ValidationError` and FastAPI `RequestValidationError`, return `ErrorResponse` with 400 and field-level error details
- [x] T046 [P] Create `railway.json` in project root: `{"build": {"builder": "DOCKERFILE", "dockerfilePath": "backend/Dockerfile"}, "deploy": {"startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT"}}`
- [x] T047 [P] Create `frontend/vercel.json`: `{"framework": "nextjs", "env": {"NEXT_PUBLIC_BACKEND_URL": "@backend_url"}}`
- [x] T048 [P] Add `.gitignore` to project root: `.env`, `__pycache__/`, `*.pyc`, `.next/`, `node_modules/`, `.pytest_cache/`
- [x] T049 Update `README.md` with: Bright Data tools used section, Track 1 GTM Intelligence description, hackathon submission checklist (GitHub repo ✅, demo URL ✅, video ⏳, Bright Data usage ✅)
- [x] T050 Run validation: `docker compose up` → test all 4 endpoints manually via `/docs` Swagger UI → confirm all return structured data → confirm SSE stream works in browser

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — MVP, most important
- **US2 (Phase 4)**: Depends on Foundational — independent of US1
- **US3 (Phase 5)**: Depends on Foundational — independent of US1/US2
- **US4 (Phase 6)**: Depends on US1 + US2 + US3 (uses all 3 agents)
- **Polish (Phase 7)**: Depends on US4 complete

### User Story Dependencies

- **US1 (P1)**: Depends only on Foundational
- **US2 (P2)**: Depends only on Foundational — can run in parallel with US1
- **US3 (P3)**: Depends only on Foundational — can run in parallel with US1/US2
- **US4 (P4)**: Depends on US1 + US2 + US3 (crew.py assembles all 3 agents)

### Within Each User Story

- Tool file → Agent file → Router file → Frontend component → Frontend page

### Parallel Opportunities

```bash
# Phase 1 parallel group (all independent):
T002 (frontend structure) || T003 (docker-compose) || T004 (.env.example) || T005 (README)

# Phase 2 parallel group:
T012 (requests models) || T013 (responses models) || T015 (layout) || T016 (home page) || T017 (api.ts)

# US1-US3 can all start after T014 (main.py) completes:
[US1: T018→T019→T022→T023→T024→T025] || [US2: T026→T028→T029→T030→T031] || [US3: T032→T034→T035→T036→T037]

# Tests within each story (parallel with each other):
T020 || T021  (US1 tests)
T027         (US2 test)
T033         (US3 test)
```

---

## Implementation Strategy

### MVP First (US1 Only — ~2 hours)

1. Complete Phase 1: Setup (T001–T010)
2. Complete Phase 2: Foundational (T011–T017)
3. Complete Phase 3: US1 Competitor Monitor (T018–T025)
4. **STOP and VALIDATE**: test `/monitor` endpoint, check frontend renders data
5. This alone satisfies Bright Data requirement and is demo-ready

### Full Hackathon Submission (~6 hours total)

1. Setup + Foundational → both services running
2. US1 (Competitor Monitor) → MVP checkpoint ✅
3. US2 (Market Search) → adds SERP demo ✅
4. US3 (Lead Enrichment) → adds enrichment demo ✅
5. US4 (Full Report + SSE) → the wow-factor demo ✅
6. Polish → deploy to Railway + Vercel ✅

---

## Notes

- [P] tasks have no file conflicts — safe to run in parallel
- US1–US3 can all be worked on simultaneously after Foundational phase
- US4 MUST wait for US1+US2+US3 (crew.py uses all three agents)
- Each Bright Data tool has its own test file — mock the httpx calls, never hit real API in tests
- SSE stream in T040: use `asyncio.sleep(0)` between yields to prevent blocking the event loop
- Commit after each checkpoint (T025, T031, T037, T043, T050)
- Total tasks: **50** | US1: 8 | US2: 6 | US3: 6 | US4: 6 | Setup: 10 | Foundational: 7 | Polish: 7
