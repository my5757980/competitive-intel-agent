# CompeteIQ — GTM Intelligence AI Agent

> AI-powered competitive intelligence platform. Built for the **Bright Data Web Data UNLOCKED Hackathon** on lablab.ai.

[![Track](https://img.shields.io/badge/Track-GTM%20Intelligence-blue)](https://lablab.ai/ai-hackathons/brightdata-ai-agents-web-data-hackathon)
[![Bright Data](https://img.shields.io/badge/Powered%20by-Bright%20Data-orange)](https://brightdata.com)

## What It Does

CompeteIQ uses **4 CrewAI agents** backed by **Bright Data's infrastructure** to give GTM teams real-time competitive intelligence:

| Feature | Bright Data Tool | What You Get |
|---------|-----------------|--------------|
| 🔍 Competitor Monitor | Web Unlocker | Pricing, features, job postings from any competitor site |
| 🌐 Market Search | SERP API | Live market signals — launches, news, funding |
| 🏢 Lead Enrichment | Web Scraper API | Company profile: size, industry, tech stack, news |
| 📊 Intelligence Report | All 3 + CrewAI | Full AI-synthesized competitive report with live progress |

## Quick Start (3 steps)

### Step 1 — Clone & Configure

```bash
git clone https://github.com/YOUR_USERNAME/competitive-intel-agent
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

```
Next.js 15 Dashboard (port 3000)
         ↕ REST API
FastAPI Backend (port 8000)
         ↕ CrewAI Agents
┌─────────────────────────────────┐
│ CompetitorMonitorAgent          │ → Bright Data Web Unlocker
│ MarketResearchAgent             │ → Bright Data SERP API
│ LeadEnricherAgent               │ → Bright Data Web Scraper API
│ IntelligenceReporterAgent       │ → Groq / GPT-4o
└─────────────────────────────────┘
```

## Tech Stack

- **Backend**: Python 3.12 + FastAPI + CrewAI 0.80
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS
- **AI**: Groq llama-3.3-70b (primary) / GPT-4o (fallback)
- **Bright Data**: Web Unlocker, SERP API, Web Scraper API
- **Deploy**: Railway (backend) + Vercel (frontend)

## Bright Data Tools Used

- **Web Unlocker** — bypasses bot detection on competitor websites
- **SERP API** — real-time Google search results in structured JSON
- **Web Scraper API** — structured company data from LinkedIn and web
- **MCP Server** — AI agent ↔ live web connectivity layer

## Hackathon Submission Checklist

- [x] Public GitHub repository
- [x] Uses at least one Bright Data product (uses 3)
- [x] Track 1: GTM Intelligence
- [x] Demo application
- [ ] Video presentation
- [ ] Deploy URL (Railway + Vercel)

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
"# competitive-intel-agent" 
