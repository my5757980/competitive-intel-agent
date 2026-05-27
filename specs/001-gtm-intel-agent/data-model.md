# Data Model: 001-gtm-intel-agent

**Date**: 2026-05-23

## Pydantic v2 Models

### Request Models

```python
class MonitorRequest(BaseModel):
    target: str                          # URL or company name
    focus: list[str] = ["pricing", "features", "jobs"]
    country: str = "us"                  # Bright Data geo parameter

class SearchRequest(BaseModel):
    query: str
    num_results: int = 10
    date_filter: str | None = None       # "past_week", "past_month", None

class EnrichRequest(BaseModel):
    company: str                         # name or LinkedIn URL

class ReportRequest(BaseModel):
    competitor: str                      # company name
    include_sections: list[str] = ["overview", "pricing", "market", "hiring", "recommendations"]
```

### Response Models

```python
class PricingTier(BaseModel):
    name: str
    price: str | None
    features: list[str]

class CompetitorIntelligence(BaseModel):
    target_url: str
    company_name: str | None
    pricing_tiers: list[PricingTier]
    product_claims: list[str]
    job_count: int | None
    job_titles: list[str]
    page_summary: str
    raw_signals: list[str]
    collected_at: datetime
    data_source: str = "bright_data_web_unlocker"

class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source_date: str | None
    relevance_signal: str | None

class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult]
    total_results: int
    collected_at: datetime
    data_source: str = "bright_data_serp_api"

class CompanyProfile(BaseModel):
    name: str
    industry: str | None
    size_range: str | None              # "1-10", "11-50", "51-200", "201-500", "500+"
    headquarters: str | None
    website: str | None
    recent_news: list[str]
    tech_signals: list[str]
    linkedin_followers: int | None
    collected_at: datetime
    data_source: str = "bright_data_web_scraper_api"

class ReportSection(BaseModel):
    title: str
    content: str
    confidence: str                     # "high", "medium", "low"
    sources: list[str]

class IntelligenceReport(BaseModel):
    competitor: str
    sections: list[ReportSection]
    executive_summary: str
    recommended_actions: list[str]
    data_completeness: float            # 0.0–1.0, fraction of sources that returned data
    generated_at: datetime
    generation_time_seconds: float

class ProgressEvent(BaseModel):
    agent: str                          # "CompetitorMonitor", "MarketResearcher", etc.
    status: str                         # "starting", "running", "complete", "failed"
    message: str
    timestamp: datetime

class ErrorResponse(BaseModel):
    error: str
    detail: str | None
    source: str | None                  # which Bright Data tool failed
```

## Entity Relationships

```
ReportRequest
    └── triggers → IntelligenceReport
            ├── CompetitorIntelligence  (from MonitorRequest)
            ├── SearchResponse          (from SearchRequest)
            ├── CompanyProfile          (from EnrichRequest)
            └── ReportSection[]         (AI-synthesized from above 3)

ProgressEvent[] streamed via SSE during IntelligenceReport generation
```

## Validation Rules

- `MonitorRequest.target`: must be non-empty string; if URL, must start with http/https or be auto-prefixed
- `SearchRequest.query`: min length 3 characters
- `SearchRequest.num_results`: 1–20 range
- `EnrichRequest.company`: min length 2 characters
- `ReportRequest.competitor`: min length 2 characters
- All datetime fields: UTC timezone, ISO 8601 format
- `IntelligenceReport.data_completeness`: clamped to 0.0–1.0

## State Transitions

No persistent state — all entities are created per-request and returned in response.
SSE ProgressEvent stream: starting → running → complete (or failed) per agent.
