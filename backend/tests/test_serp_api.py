import pytest
from unittest.mock import AsyncMock, patch, MagicMock


MOCK_SERP_RESPONSE = {
    "organic": [
        {"title": "Stripe launches new AI features", "link": "https://stripe.com/blog/ai", "description": "Stripe announced...", "date": "2026-05-01"},
        {"title": "Stripe raises $500M", "link": "https://techcrunch.com/stripe", "description": "In a new round...", "date": "2026-04-15"},
    ]
}


@pytest.mark.asyncio
async def test_search_returns_list_of_dicts():
    mock_resp = MagicMock()
    mock_resp.json.return_value = MOCK_SERP_RESPONSE
    mock_resp.raise_for_status = lambda: None

    with patch("tools.serp_api.BRIGHT_DATA_API_KEY", "test-key"):
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client.get = AsyncMock(return_value=mock_resp)
            mock_client_class.return_value = mock_client

            from tools.serp_api import search_serp
            results = await search_serp("Stripe new features")

    assert isinstance(results, list)
    assert len(results) == 2
    assert results[0]["title"] == "Stripe launches new AI features"
    assert "url" in results[0]
    assert "snippet" in results[0]


@pytest.mark.asyncio
async def test_search_returns_empty_list_for_no_results():
    mock_resp = MagicMock()
    mock_resp.json.return_value = {"organic": []}
    mock_resp.raise_for_status = lambda: None

    with patch("tools.serp_api.BRIGHT_DATA_API_KEY", "test-key"):
        with patch("httpx.AsyncClient") as mock_client_class:
            mock_client = AsyncMock()
            mock_client.__aenter__ = AsyncMock(return_value=mock_client)
            mock_client.__aexit__ = AsyncMock(return_value=False)
            mock_client.get = AsyncMock(return_value=mock_resp)
            mock_client_class.return_value = mock_client

            from tools.serp_api import search_serp
            results = await search_serp("xyznonexistenttopic123")

    assert results == []
