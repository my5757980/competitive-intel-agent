import re
from datetime import datetime, timezone

from tools.web_unlocker import scrape_with_unlocker
from tools.content_extractor import extract_competitor_intelligence
from models.requests import MonitorRequest
from models.responses import CompetitorIntelligence, PricingTier
from config import get_settings
from groq import Groq


def _groq_client():
    return Groq(api_key=get_settings().groq_api_key)


async def run_competitor_monitor(req: MonitorRequest) -> CompetitorIntelligence:
    html = await scrape_with_unlocker(req.target, req.country)
    extracted = extract_competitor_intelligence(html, req.target)

    prompt = f"""Analyze this competitor website data from {req.target}.
Focus areas: {', '.join(req.focus)}.

Extracted data:
- Pricing tiers: {extracted['pricing_tiers']}
- Product claims: {extracted['product_claims']}
- Job count: {extracted['job_count']}
- Job titles: {extracted['job_titles']}
- Page summary: {extracted['page_summary'][:500]}

Write a 2-3 sentence strategic summary of what this tells us about the competitor."""

    client = _groq_client()
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.1,
        max_tokens=300,
    )
    summary = response.choices[0].message.content

    tiers = [PricingTier(**t) if isinstance(t, dict) else t for t in extracted["pricing_tiers"]]

    return CompetitorIntelligence(
        target_url=req.target,
        company_name=_extract_company_name(req.target),
        pricing_tiers=tiers,
        product_claims=extracted["product_claims"],
        job_count=extracted["job_count"],
        job_titles=extracted["job_titles"],
        page_summary=summary,
        raw_signals=extracted["raw_signals"],
        collected_at=datetime.now(timezone.utc),
    )


def _extract_company_name(url: str) -> str:
    match = re.search(r"https?://(?:www\.)?([^./]+)", url)
    return match.group(1).capitalize() if match else url
