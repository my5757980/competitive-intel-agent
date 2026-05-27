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
        result = await scrape_with_unlocker("https://example.com")
        assert "<html>" in result


@pytest.mark.asyncio
async def test_scrape_raises_on_403():
    with patch("tools.web_unlocker.BRIGHT_DATA_API_KEY", "test-key"), \
         patch("tools.web_unlocker.BRIGHT_DATA_PROXY_URL", ""):
        async with httpx.AsyncClient() as client:
            pass
        from tools.web_unlocker import scrape_with_unlocker
        with patch("httpx.AsyncClient") as mock_client:
            mock_instance = AsyncMock()
            mock_instance.__aenter__ = AsyncMock(return_value=mock_instance)
            mock_instance.__aexit__ = AsyncMock(return_value=False)
            mock_instance.post.side_effect = httpx.HTTPStatusError(
                "403", request=None, response=None
            )
            mock_client.return_value = mock_instance
            with pytest.raises(httpx.HTTPStatusError):
                await scrape_with_unlocker("https://blocked-site.com")
