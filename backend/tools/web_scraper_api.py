import httpx
import os
import re

BRIGHT_DATA_API_KEY = os.getenv("BRIGHT_DATA_API_KEY", "")
SCRAPER_BASE = "https://api.brightdata.com/datasets/v3"
LINKEDIN_DATASET = "gd_l1vikfnt1wgvvqz95w"
TIMEOUT = 25.0


async def enrich_company(company: str) -> dict:
    """Fetch structured company profile from Bright Data Web Scraper API."""
    if _is_linkedin_url(company):
        return await _enrich_via_linkedin(company)
    return await _enrich_via_web_unlocker(company)


def _is_linkedin_url(s: str) -> bool:
    return "linkedin.com/company" in s.lower()


async def _enrich_via_linkedin(url: str) -> dict:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        trigger = await client.post(
            f"{SCRAPER_BASE}/trigger",
            params={"dataset_id": LINKEDIN_DATASET, "type": "discover_new", "discover_by": "url"},
            headers={
                "Authorization": f"Bearer {BRIGHT_DATA_API_KEY}",
                "Content-Type": "application/json",
            },
            json=[{"url": url}],
        )
        trigger.raise_for_status()
        data = trigger.json()

    snapshot_id = data.get("snapshot_id", "")
    if not snapshot_id:
        return _empty_profile(url)

    async with httpx.AsyncClient(timeout=30.0) as client:
        result = await client.get(
            f"{SCRAPER_BASE}/snapshot/{snapshot_id}",
            headers={"Authorization": f"Bearer {BRIGHT_DATA_API_KEY}"},
        )
        if result.status_code == 200:
            items = result.json()
            if items:
                return _parse_linkedin_profile(items[0], url)

    return _empty_profile(url)


async def _enrich_via_web_unlocker(company: str) -> dict:
    from tools.web_unlocker import scrape_with_unlocker
    from tools.content_extractor import extract_competitor_intelligence
    from bs4 import BeautifulSoup

    search_url = f"https://www.google.com/search?q={company.replace(' ', '+')}+company+site:linkedin.com"
    try:
        html = await scrape_with_unlocker(f"https://{company.replace(' ', '')}.com")
        soup = BeautifulSoup(html, "lxml")

        description = ""
        meta = soup.find("meta", attrs={"name": "description"})
        if meta:
            description = meta.get("content", "")

        return {
            "name": company,
            "industry": _guess_industry(html),
            "size_range": None,
            "headquarters": None,
            "website": f"https://{company.replace(' ', '').lower()}.com",
            "recent_news": [],
            "tech_signals": _extract_tech_signals(html),
            "linkedin_followers": None,
            "description": description,
        }
    except Exception:
        return _empty_profile(company)


def _parse_linkedin_profile(item: dict, url: str) -> dict:
    return {
        "name": item.get("name", ""),
        "industry": item.get("industry"),
        "size_range": item.get("company_size"),
        "headquarters": item.get("headquarters"),
        "website": item.get("website"),
        "recent_news": [p.get("text", "") for p in item.get("updates", [])[:3]],
        "tech_signals": [],
        "linkedin_followers": item.get("followers"),
    }


def _empty_profile(company: str) -> dict:
    return {
        "name": company,
        "industry": None,
        "size_range": None,
        "headquarters": None,
        "website": None,
        "recent_news": [],
        "tech_signals": [],
        "linkedin_followers": None,
    }


def _guess_industry(html: str) -> str | None:
    industries = ["software", "fintech", "healthcare", "e-commerce", "saas", "ai", "cloud", "security"]
    html_lower = html.lower()
    for ind in industries:
        if ind in html_lower:
            return ind.capitalize()
    return None


def _extract_tech_signals(html: str) -> list[str]:
    known_tech = ["React", "Python", "AWS", "GCP", "Azure", "Kubernetes", "Postgres", "Stripe", "Salesforce"]
    return [t for t in known_tech if t.lower() in html.lower()]
