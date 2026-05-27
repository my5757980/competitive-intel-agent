from datetime import datetime, timezone

from tools.serp_api import search_serp
from models.requests import SearchRequest
from models.responses import SearchResponse, SearchResult


async def run_market_researcher(req: SearchRequest) -> SearchResponse:
    raw_results = await search_serp(req.query, req.num_results, req.date_filter)

    search_results = [
        SearchResult(
            title=r.get("title", ""),
            url=r.get("url", ""),
            snippet=r.get("snippet", ""),
            source_date=r.get("source_date"),
            relevance_signal=r.get("relevance_signal"),
        )
        for r in raw_results
        if r.get("title") and r.get("url")
    ]

    return SearchResponse(
        query=req.query,
        results=search_results,
        total_results=len(search_results),
        collected_at=datetime.now(timezone.utc),
    )
