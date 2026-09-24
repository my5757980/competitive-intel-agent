import pytest
import httpx
from unittest.mock import AsyncMock, patch


@pytest.mark.asyncio
async def test_scrape_returns_html_on_200():
    mock_resp = AsyncMock()
    mock_resp.text = "<html><body><h1>Hello</h1></body></html>"
    mock_resp.raise_for_status = lambda: None

    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), \
         patch("httpx.AsyncClient.post", return_value=mock_resp):
        from tools.web_unlocker import scrape_with_unlocker
        html, source = await scrape_with_unlocker("https://example.com")
        assert "<html>" in html
        assert source == "bright_data_web_unlocker"


@pytest.mark.asyncio
async def test_scrape_raises_on_403():
    """A 403 from Bright Data falls back to a direct fetch; when the site refuses that too, it raises."""
    seen = []

    def refuse(request: httpx.Request) -> httpx.Response:
        seen.append((request.method, str(request.url)))
        return httpx.Response(403, request=request)

    real_client = httpx.AsyncClient

    def client_that_is_refused(*args, **kwargs):
        return real_client(*args, transport=httpx.MockTransport(refuse), **kwargs)

    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""), \
         patch("tools.web_unlocker.httpx.AsyncClient", side_effect=client_that_is_refused):
        from tools.web_unlocker import scrape_with_unlocker
        with pytest.raises(httpx.HTTPStatusError):
            await scrape_with_unlocker("https://blocked-site.com")
    assert seen == [("POST", "https://api.brightdata.com/request"), ("GET", "https://blocked-site.com")]
