import httpx
import os

BRIGHT_DATA_API_KEY = os.getenv("BRIGHT_DATA_API_KEY", "")
SERP_BASE = "https://api.brightdata.com/serp/google"
TIMEOUT = 20.0


async def search_serp(query: str, num_results: int = 10, date_filter: str | None = None) -> list[dict]:
    """Search via Bright Data SERP API. Falls back to DuckDuckGo if zone not configured."""
    params: dict = {"q": query, "num": num_results, "brd_json": "1"}
    if date_filter == "past_week":
        params["tbs"] = "qdr:w"
    elif date_filter == "past_month":
        params["tbs"] = "qdr:m"

    if BRIGHT_DATA_API_KEY:
        try:
            async with httpx.AsyncClient(timeout=TIMEOUT) as client:
                resp = await client.get(
                    SERP_BASE,
                    params=params,
                    headers={"Authorization": f"Bearer {BRIGHT_DATA_API_KEY}"},
                )
                resp.raise_for_status()
                return _parse_serp_response(resp.json())
        except (httpx.HTTPStatusError, Exception):
            pass  # Fall through to DuckDuckGo fallback

    return await _search_duckduckgo(query, num_results)


async def _search_duckduckgo(query: str, num_results: int) -> list[dict]:
    """Fallback search using DuckDuckGo Instant Answer API."""
    try:
        async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
            resp = await client.get(
                "https://api.duckduckgo.com/",
                params={"q": query, "format": "json", "no_html": "1", "skip_disambig": "1"},
                headers={"User-Agent": "CompeteIQ/1.0 GTM Intelligence Agent"},
            )
            data = resp.json()
        results = []
        for topic in data.get("RelatedTopics", [])[:num_results]:
            if "Text" in topic and "FirstURL" in topic:
                results.append({
                    "title": topic.get("Text", "")[:80],
                    "url": topic.get("FirstURL", ""),
                    "snippet": topic.get("Text", ""),
                    "source_date": None,
                    "relevance_signal": "duckduckgo",
                })
        if data.get("AbstractText"):
            results.insert(0, {
                "title": data.get("Heading", query),
                "url": data.get("AbstractURL", ""),
                "snippet": data.get("AbstractText", ""),
                "source_date": None,
                "relevance_signal": "duckduckgo_abstract",
            })
        return results
    except Exception:
        return []


def _parse_serp_response(data: dict) -> list[dict]:
    results = []
    for item in data.get("organic", []):
        results.append({
            "title": item.get("title", ""),
            "url": item.get("link", item.get("url", "")),
            "snippet": item.get("description", item.get("snippet", "")),
            "source_date": item.get("date"),
            "relevance_signal": item.get("sitelinks_title"),
        })
    return results
