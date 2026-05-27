import pytest
from unittest.mock import AsyncMock, patch, MagicMock


def test_returns_dict_with_expected_keys():
    from tools.web_scraper_api import _empty_profile
    result = _empty_profile("Stripe")
    expected_keys = {"name", "industry", "size_range", "headquarters", "website", "recent_news", "tech_signals", "linkedin_followers"}
    assert expected_keys.issubset(result.keys())


def test_empty_profile_has_company_name():
    from tools.web_scraper_api import _empty_profile
    result = _empty_profile("TestCo")
    assert result["name"] == "TestCo"


def test_empty_profile_returns_empty_lists_not_none():
    from tools.web_scraper_api import _empty_profile
    result = _empty_profile("AnyCompany")
    assert isinstance(result["recent_news"], list)
    assert isinstance(result["tech_signals"], list)


def test_is_linkedin_url_detects_correctly():
    from tools.web_scraper_api import _is_linkedin_url
    assert _is_linkedin_url("https://linkedin.com/company/stripe") is True
    assert _is_linkedin_url("https://stripe.com") is False


def test_parse_linkedin_profile():
    from tools.web_scraper_api import _parse_linkedin_profile
    item = {
        "name": "Stripe",
        "industry": "Fintech",
        "company_size": "1001-5000",
        "headquarters": "San Francisco, CA",
        "website": "https://stripe.com",
        "followers": 250000,
        "updates": [{"text": "Stripe launches new feature"}],
    }
    result = _parse_linkedin_profile(item, "https://linkedin.com/company/stripe")
    assert result["name"] == "Stripe"
    assert result["industry"] == "Fintech"
    assert len(result["recent_news"]) == 1
