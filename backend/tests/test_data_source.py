"""data_source must name whatever really served the data, so a fallback is never shown as Bright Data."""
import json
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

import httpx
import pytest

from models.requests import MonitorRequest, ReportRequest


def mock_http(handler):
    """Every httpx.AsyncClient made inside the block answers from `handler` instead of the network."""
    real_client = httpx.AsyncClient

    def client(*args, **kwargs):
        kwargs.pop("proxies", None)
        return real_client(*args, transport=httpx.MockTransport(handler), **kwargs)

    return patch("httpx.AsyncClient", side_effect=client)


def page(request: httpx.Request) -> httpx.Response:
    return httpx.Response(200, text="<html><body><h1>Pricing plans</h1></body></html>", request=request)


def bright_data_refuses(request: httpx.Request) -> httpx.Response:
    if request.url.host == "api.brightdata.com":
        return httpx.Response(403, request=request)
    return page(request)


class FakeGroq:
    """Stands in for the Groq client and remembers every prompt it was sent."""

    def __init__(self, content: str):
        self.prompts: list[str] = []
        self.content = content
        self.chat = SimpleNamespace(completions=SimpleNamespace(create=self.create))

    def create(self, **kwargs):
        self.prompts.append(kwargs["messages"][0]["content"])
        return SimpleNamespace(choices=[SimpleNamespace(message=SimpleNamespace(content=self.content))])


# --- Web Unlocker -----------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_unlocker_labels_a_bright_data_page_as_bright_data():
    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(page):
        from tools.web_unlocker import scrape_with_unlocker
        html, source = await scrape_with_unlocker("https://example.com")
    assert "Pricing plans" in html
    assert source == "bright_data_web_unlocker"


@pytest.mark.asyncio
async def test_unlocker_labels_the_fallback_as_a_direct_fetch_when_bright_data_refuses():
    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(bright_data_refuses):
        from tools.web_unlocker import scrape_with_unlocker
        html, source = await scrape_with_unlocker("https://example.com")
    assert "Pricing plans" in html
    assert source == "direct_fetch"


@pytest.mark.asyncio
async def test_unlocker_labels_a_fetch_without_a_key_as_a_direct_fetch():
    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", ""), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(page):
        from tools.web_unlocker import scrape_with_unlocker
        _, source = await scrape_with_unlocker("https://example.com")
    assert source == "direct_fetch"


@pytest.mark.asyncio
async def test_monitor_reports_the_source_that_served_the_page():
    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(bright_data_refuses), \
         patch("agents.competitor_monitor._groq_client", return_value=FakeGroq("summary")):
        from agents.competitor_monitor import run_competitor_monitor
        result = await run_competitor_monitor(MonitorRequest(target="https://example.com"))
    assert result.data_source == "direct_fetch"


@pytest.mark.asyncio
async def test_monitor_error_blames_the_site_not_bright_data_when_the_direct_fetch_fails():
    def site_refuses(request: httpx.Request) -> httpx.Response:
        return httpx.Response(403, request=request)

    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", ""), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(site_refuses):
        from routers.monitor import monitor_competitor
        resp = await monitor_competitor(MonitorRequest(target="https://blocked-site.com"))
    body = json.loads(resp.body)
    assert resp.status_code == 503
    assert body["source"] == "direct_fetch"
    assert "Bright Data" not in body["error"]
    assert "blocked-site.com" in body["detail"]


@pytest.mark.asyncio
async def test_monitor_error_blames_bright_data_when_bright_data_is_unreachable():
    def bright_data_down(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("connection refused", request=request)

    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), mock_http(bright_data_down):
        from routers.monitor import monitor_competitor
        resp = await monitor_competitor(MonitorRequest(target="https://example.com"))
    body = json.loads(resp.body)
    assert resp.status_code == 503
    assert body["source"] == "bright_data_web_unlocker"
    assert "Bright Data" in body["error"]


# --- SERP API ---------------------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_search_labels_the_duckduckgo_fallback_as_duckduckgo():
    def serp_refuses(request: httpx.Request) -> httpx.Response:
        if request.url.host == "api.brightdata.com":
            return httpx.Response(401, request=request)
        return httpx.Response(200, json={"RelatedTopics": [{"Text": "Stripe news", "FirstURL": "https://ddg.example/stripe"}]},
                              request=request)

    with patch("tools.serp_api.BRIGHT_DATA_API_KEY", "test-key"), mock_http(serp_refuses):
        from agents.market_researcher import run_market_researcher
        from models.requests import SearchRequest
        result = await run_market_researcher(SearchRequest(query="Stripe news"))
    assert result.total_results == 1
    assert result.data_source == "duckduckgo"


@pytest.mark.asyncio
async def test_search_labels_bright_data_results_as_bright_data():
    def serp_answers(request: httpx.Request) -> httpx.Response:
        return httpx.Response(200, json={"organic": [{"title": "Stripe", "link": "https://stripe.com"}]}, request=request)

    with patch("tools.serp_api.BRIGHT_DATA_API_KEY", "test-key"), mock_http(serp_answers):
        from tools.serp_api import search_serp
        results, source = await search_serp("Stripe news")
    assert len(results) == 1
    assert source == "bright_data_serp_api"


# --- Web Scraper API (company profile) --------------------------------------------------------------

def test_linkedin_profile_is_labelled_web_scraper_api():
    from tools.web_scraper_api import _parse_linkedin_profile
    profile = _parse_linkedin_profile({"name": "Stripe"}, "https://linkedin.com/company/stripe")
    assert profile["data_source"] == "bright_data_web_scraper_api"


def test_empty_profile_says_nothing_came_back():
    from tools.web_scraper_api import _empty_profile
    assert _empty_profile("Stripe")["data_source"] == "none"


@pytest.mark.asyncio
async def test_profile_from_the_website_carries_the_fetch_that_served_it():
    with patch("tools.web_unlocker.scrape_with_unlocker",
               AsyncMock(return_value=("<html><body>SaaS on AWS</body></html>", "direct_fetch"))):
        from agents.lead_enricher import run_lead_enricher
        from models.requests import EnrichRequest
        profile = await run_lead_enricher(EnrichRequest(company="Stripe"))
    assert profile.data_source == "direct_fetch"
    assert profile.tech_signals == ["AWS"]


# --- Full report ------------------------------------------------------------------------------------

REPORT_JSON = json.dumps({
    "executive_summary": "summary",
    "sections": [{"title": "Overview", "content": "text", "confidence": "low",
                  "sources": ["web_unlocker", "direct_fetch", "bright_data_serp_api", "web_scraper_api"]}],
    "recommended_actions": [],
})


async def run_report(monitor_source: str, search: tuple, profile: dict):
    events = []

    async def collect(event):
        events.append(event)

    reporter = FakeGroq(REPORT_JSON)
    with patch("agents.competitor_monitor.scrape_with_unlocker",
               AsyncMock(return_value=("<html><body><h1>Plans</h1></body></html>", monitor_source))), \
         patch("agents.competitor_monitor._groq_client", return_value=FakeGroq("summary")), \
         patch("agents.market_researcher.search_serp", AsyncMock(return_value=search)), \
         patch("agents.lead_enricher.enrich_company", AsyncMock(return_value=profile)), \
         patch("agents.crew.get_groq_client", return_value=reporter):
        from agents.crew import run_full_report
        report = await run_full_report(ReportRequest(competitor="Stripe"), collect)
    return report, [e.message for e in events], reporter.prompts[0]


@pytest.mark.asyncio
async def test_report_never_claims_bright_data_when_every_step_fell_back():
    report, messages, prompt = await run_report(
        "direct_fetch", ([], "duckduckgo"), {"name": "Stripe", "data_source": "none"})

    assert not any("via Bright Data" in m for m in messages), messages
    assert any("direct fetch" in m for m in messages), messages
    for name in ("Bright Data Web Unlocker", "Bright Data SERP API", "Bright Data Web Scraper API"):
        assert name not in prompt
    assert report.sections[0].sources == ["direct_fetch"]
    # The page was fetched; the search and the profile came back empty, so they do not count.
    assert report.data_completeness == pytest.approx(1 / 3)


@pytest.mark.asyncio
async def test_report_credits_bright_data_when_bright_data_served_everything():
    report, messages, prompt = await run_report(
        "bright_data_web_unlocker",
        ([{"title": "Stripe", "url": "https://stripe.com", "snippet": "news"}], "bright_data_serp_api"),
        {"name": "Stripe", "industry": "Fintech", "data_source": "bright_data_web_scraper_api"})

    assert any("via Bright Data Web Unlocker" in m for m in messages), messages
    assert any("via Bright Data SERP API" in m for m in messages), messages
    assert any("via Bright Data Web Scraper API" in m for m in messages), messages
    assert "Bright Data Web Unlocker" in prompt
    assert report.sections[0].sources == ["bright_data_serp_api"]
    assert report.data_completeness == pytest.approx(1.0)
