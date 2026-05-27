from datetime import datetime, timezone

from tools.web_scraper_api import enrich_company
from models.requests import EnrichRequest
from models.responses import CompanyProfile


async def run_lead_enricher(req: EnrichRequest) -> CompanyProfile:
    raw = await enrich_company(req.company)

    return CompanyProfile(
        name=raw.get("name", req.company),
        industry=raw.get("industry"),
        size_range=raw.get("size_range"),
        headquarters=raw.get("headquarters"),
        website=raw.get("website"),
        recent_news=raw.get("recent_news", []),
        tech_signals=raw.get("tech_signals", []),
        linkedin_followers=raw.get("linkedin_followers"),
        collected_at=datetime.now(timezone.utc),
    )
