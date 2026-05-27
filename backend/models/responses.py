from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class PricingTier(BaseModel):
    name: str
    price: str | None = None
    features: list[str] = []


class CompetitorIntelligence(BaseModel):
    target_url: str
    company_name: str | None = None
    pricing_tiers: list[PricingTier] = []
    product_claims: list[str] = []
    job_count: int | None = None
    job_titles: list[str] = []
    page_summary: str = ""
    raw_signals: list[str] = []
    collected_at: datetime
    data_source: str = "bright_data_web_unlocker"


class SearchResult(BaseModel):
    title: str
    url: str
    snippet: str
    source_date: str | None = None
    relevance_signal: str | None = None


class SearchResponse(BaseModel):
    query: str
    results: list[SearchResult] = []
    total_results: int = 0
    collected_at: datetime
    data_source: str = "bright_data_serp_api"


class CompanyProfile(BaseModel):
    name: str
    industry: str | None = None
    size_range: str | None = None
    headquarters: str | None = None
    website: str | None = None
    recent_news: list[str] = []
    tech_signals: list[str] = []
    linkedin_followers: int | None = None
    collected_at: datetime
    data_source: str = "bright_data_web_scraper_api"


class ReportSection(BaseModel):
    title: str
    content: str
    confidence: Literal["high", "medium", "low"] = "medium"
    sources: list[str] = []


class IntelligenceReport(BaseModel):
    competitor: str
    sections: list[ReportSection] = []
    executive_summary: str = ""
    recommended_actions: list[str] = []
    data_completeness: float = 0.0
    generated_at: datetime
    generation_time_seconds: float = 0.0


class ProgressEvent(BaseModel):
    agent: str
    status: Literal["starting", "running", "complete", "failed"]
    message: str
    timestamp: datetime


class ErrorResponse(BaseModel):
    error: str
    detail: str | None = None
    source: str | None = None
