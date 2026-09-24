# CompeteIQ — GTM Intelligence AI Agent

> AI-powered competitive intelligence platform. Built for the **Bright Data Web Data UNLOCKED Hackathon** on lablab.ai.

[![Track](https://img.shields.io/badge/Track-GTM%20Intelligence-blue)](https://lablab.ai/ai-hackathons/brightdata-ai-agents-web-data-hackathon)
[![Bright Data](https://img.shields.io/badge/Powered%20by-Bright%20Data-orange)](https://brightdata.com)

## What It Does

CompeteIQ runs a **4-step agent pipeline** backed by **Bright Data's infrastructure** to give GTM teams real-time competitive intelligence. Each step (CompetitorMonitor → MarketResearcher → LeadEnricher → IntelligenceReporter) pulls one kind of live web data, and Groq llama-3.3-70b turns it into analysis:

| Feature | Bright Data Tool | What You Get |
|---------|-----------------|--------------|
| 🔍 Competitor Monitor | Web Unlocker | Pricing, features, job postings from any competitor site |
| 🌐 Market Search | SERP API | Live market signals — launches, news, funding |
| 🏢 Lead Enrichment | Web Scraper API | Company profile: size, industry, tech stack, news |
| 📊 Intelligence Report | All 3 + Groq llama-3.3-70b | Full AI-synthesized competitive report with live progress |

## Quick Start (3 steps)

### Step 1 — Clone & Configure

```bash
git clone https://github.com/my5757980/competitive-intel-agent
cd competitive-intel-agent
cp .env.example .env
```

### Step 2 — Add API Keys to `.env`

```bash
BRIGHT_DATA_API_KEY=your_bright_data_api_key   # from brightdata.com
GROQ_API_KEY=your_groq_api_key                 # free at console.groq.com
```

> **Hackathon participants**: Get **$250 free Bright Data credits** with the promo code from the May 25 kickoff stream!

### Step 3 — Start Everything

```bash
docker compose up
```

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Architecture

The dashboard calls its own Next.js API routes (`frontend/app/api/*`), which run the pipeline in
TypeScript; that is what Vercel serves. `backend/` holds the original FastAPI version of the same
pipeline, which `docker compose up` starts on port 8000 with API docs at `/docs`.

```
Next.js 15 Dashboard (port 3000)
         ↕ REST + SSE
Next.js API routes (/api)          — FastAPI (port 8000) runs the same steps
         ↕ one sequential pipeline, plain async code (no agent framework)
┌─────────────────────────────────┐
│ CompetitorMonitor               │ → Bright Data Web Unlocker
│ MarketResearcher                │ → Bright Data SERP API
│ LeadEnricher                    │ → Bright Data Web Scraper API
│ IntelligenceReporter            │ → Groq llama-3.3-70b
└─────────────────────────────────┘
```

## Tech Stack

- **Pipeline**: Next.js API routes (TypeScript) in production; the same pipeline in Python 3.12 + FastAPI under `backend/`
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **AI**: Groq llama-3.3-70b
- **Bright Data**: Web Unlocker, SERP API, Web Scraper API
- **Deploy**: Vercel (dashboard + API routes)

## Bright Data Tools Used

- **Web Unlocker** — bypasses bot detection on competitor websites
- **SERP API** — real-time Google search results in structured JSON
- **Web Scraper API** — structured company data from LinkedIn and web

## When Bright Data Is Unavailable

With no `BRIGHT_DATA_API_KEY`, or when Bright Data refuses a call, each step falls back so the demo
still runs, and it says so. Every response's `data_source` names what really served the data:
`bright_data_web_unlocker`, `bright_data_serp_api` or `bright_data_web_scraper_api`, or the fallbacks
`direct_fetch` (a plain request to the site) and `duckduckgo`; `none` means nothing came back. The
report's progress feed, section sources and data-completeness score follow the same rule. The Lead
Enricher uses the Web Scraper API for LinkedIn company URLs; for a plain company name it reads the
company's own website through Web Unlocker.

## Hackathon Submission Checklist

- [x] Public GitHub repository
- [x] Uses at least one Bright Data product (uses 3)
- [x] Track 1: GTM Intelligence
- [x] Demo application
- [ ] Video presentation
- [ ] Deploy URL (Vercel)

## Local Development (without Docker)

```bash
# Backend
cd backend
pip install -r requirements.txt
cp ../.env.example ../.env
uvicorn main:app --reload

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

## Running Tests

```bash
cd backend
pytest tests/ -v
```
