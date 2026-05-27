# Research: 001-gtm-intel-agent

**Date**: 2026-05-23
**Feature**: CompeteIQ GTM Intelligence AI Agent

## Decision 1: CrewAI vs LangChain for Multi-Agent Orchestration

- **Decision**: CrewAI
- **Rationale**: CrewAI provides role-based agents with defined goals, backstories, and tool lists — ideal for the 4-agent pattern (Monitor, Research, Enrich, Report). LangChain requires more boilerplate for multi-agent delegation. CrewAI's crew.kickoff() is simpler for demo scenarios.
- **Alternatives considered**: LangGraph (too complex for hackathon speed), AutoGen (less Python-native tooling), raw OpenAI function calling (no agent coordination)

## Decision 2: Bright Data Web Unlocker Integration Pattern

- **Decision**: httpx async POST to Bright Data Web Unlocker proxy endpoint with Bearer token auth
- **Rationale**: Web Unlocker accepts a JSON body `{url, country, format}` and returns rendered HTML. Using httpx async preserves FastAPI's non-blocking behavior. The response is parsed with BeautifulSoup for text extraction.
- **Alternatives considered**: Playwright via Bright Data Scraping Browser (heavier, slower for simple pages), sync requests (blocks FastAPI event loop)

## Decision 3: Bright Data SERP API Integration Pattern

- **Decision**: httpx async GET to `https://api.brightdata.com/serp/google?q={query}&brd_json=1`
- **Rationale**: SERP API returns structured JSON when `brd_json=1` is set. Returns organic results, featured snippets, related searches. No HTML parsing needed — direct structured data.
- **Alternatives considered**: SerpAPI.com (third-party, separate cost), raw Google scraping (fragile, blocked)

## Decision 4: Bright Data Web Scraper API Integration Pattern

- **Decision**: httpx async GET to Bright Data pre-built scraper for LinkedIn company pages and generic web pages
- **Rationale**: Bright Data has 660+ pre-built scrapers. For company enrichment, the LinkedIn scraper returns structured JSON with employee count, industry, recent posts. For unknown sites, the generic scraper extracts structured text.
- **Alternatives considered**: Manual scraping each site (brittle, maintenance burden), third-party enrichment APIs (cost, not Bright Data)

## Decision 5: Real-Time Progress Delivery for Report Generation

- **Decision**: Server-Sent Events (SSE) via FastAPI's StreamingResponse
- **Rationale**: SSE is simpler than WebSockets for one-way server-to-client streaming. FastAPI's StreamingResponse supports async generators natively. Frontend EventSource API is built into all modern browsers — no extra library needed.
- **Alternatives considered**: WebSocket (overkill for one-way stream), polling (wastes requests), long-polling (adds complexity)

## Decision 6: LLM Provider for Intelligence Reporter Agent

- **Decision**: Groq (llama-3.3-70b-versatile) as primary, OpenAI GPT-4o as fallback
- **Rationale**: Groq provides ultra-fast inference (300+ tokens/sec) which reduces report generation time significantly. For hackathon demos, speed matters. If GROQ_API_KEY not set, fall back to OpenAI. Both are configurable via env vars per constitution.
- **Alternatives considered**: OpenAI only (slower, higher cost), local Ollama (too slow, not demo-reliable), Anthropic Claude (no official CrewAI integration yet)

## Decision 7: Frontend Component Library

- **Decision**: shadcn/ui + Tailwind CSS
- **Rationale**: shadcn/ui components (Card, Table, Badge, Progress, Textarea) give professional look with zero design effort. All components are local files — no external CDN dependency. Tailwind handles spacing/colors. Together they enable fast UI construction for hackathon.
- **Alternatives considered**: MUI (too heavy, opinionated), Chakra UI (React 18+ compatibility issues), plain Tailwind (too much custom CSS work)

## Decision 8: HTML Content Extraction Strategy

- **Decision**: BeautifulSoup4 + custom extraction heuristics per content type
- **Rationale**: BeautifulSoup handles HTML from Web Unlocker responses. Custom heuristics extract pricing tables (look for `<table>` with currency symbols), job postings (look for structured job listing patterns), and product features (look for `<ul>`/`<li>` near headings). GPT-4o cleans and structures the raw extraction.
- **Alternatives considered**: Readability.js (Node only), Trafilatura (Python, better for articles than pricing pages), full LLM extraction (too slow and expensive for every scrape)

## Resolved Clarifications

All technical unknowns resolved. No NEEDS CLARIFICATION items remain from spec.
