# CompeteIQ Quick Start

## Prerequisites

- Docker + Docker Compose installed
- Bright Data account (free credits at brightdata.com)
- Groq API key (free at console.groq.com) OR OpenAI API key

## 3-Step Start

### Step 1 — Clone and Configure

```bash
git clone https://github.com/yourusername/competitive-intel-agent
cd competitive-intel-agent
cp .env.example .env
# Edit .env and add your API keys
```

### Step 2 — Add API Keys to .env

```bash
BRIGHT_DATA_API_KEY=your_bright_data_api_key
GROQ_API_KEY=your_groq_api_key          # OR use OPENAI_API_KEY
OPENAI_API_KEY=                          # optional fallback
```

### Step 3 — Start Everything

```bash
docker compose up
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Test It Works

```bash
# Test competitor monitoring
curl -X POST http://localhost:8000/monitor \
  -H "Content-Type: application/json" \
  -d '{"target": "stripe.com/pricing"}'

# Test market search
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query": "Stripe new features 2026"}'
```

## Get Bright Data Credits

1. Go to brightdata.com → Sign up
2. Billing → Apply promo code from lablab.ai hackathon kickoff (May 25)
3. Copy your API key from the dashboard
4. Paste into `.env` as `BRIGHT_DATA_API_KEY`

## Common Issues

| Issue | Fix |
|-------|-----|
| "BRIGHT_DATA_API_KEY not set" | Add key to .env, restart containers |
| Port 3000 already in use | Change frontend port in docker-compose.yml |
| Scraping returns empty | Check Bright Data credit balance |
| Report takes >90s | Reduce `include_sections` in request |
