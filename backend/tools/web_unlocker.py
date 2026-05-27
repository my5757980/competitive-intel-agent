import httpx
import os

BRIGHT_DATA_API_KEY = os.getenv("BRIGHT_DATA_API_KEY", "")
BRIGHT_DATA_PROXY_URL = os.getenv("BRIGHT_DATA_PROXY_URL", "")

UNLOCKER_API = "https://api.brightdata.com/request"
TIMEOUT = 30.0


async def scrape_with_unlocker(url: str, country: str = "us") -> str:
    """Fetch a URL via Bright Data Web Unlocker. Falls back to direct fetch if zone not configured."""
    if BRIGHT_DATA_PROXY_URL:
        return await _scrape_via_proxy(url)
    if BRIGHT_DATA_API_KEY:
        try:
            return await _scrape_via_api(url, country)
        except httpx.HTTPStatusError:
            # Zone not created yet — fall back to direct request for demo
            return await _scrape_direct(url)
    return await _scrape_direct(url)


async def _scrape_via_api(url: str, country: str) -> str:
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        resp = await client.post(
            UNLOCKER_API,
            headers={
                "Authorization": f"Bearer {BRIGHT_DATA_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"zone": "web_unlocker1", "url": url, "country": country, "format": "raw"},
        )
        resp.raise_for_status()
        return resp.text


async def _scrape_via_proxy(url: str) -> str:
    proxies = {"http://": BRIGHT_DATA_PROXY_URL, "https://": BRIGHT_DATA_PROXY_URL}
    async with httpx.AsyncClient(proxies=proxies, timeout=TIMEOUT, verify=False) as client:
        resp = await client.get(url)
        resp.raise_for_status()
        return resp.text


async def _scrape_direct(url: str) -> str:
    """Direct HTTP fetch — used as demo fallback when Bright Data zone is not configured."""
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    }
    async with httpx.AsyncClient(timeout=TIMEOUT, follow_redirects=True) as client:
        resp = await client.get(url, headers=headers)
        resp.raise_for_status()
        return resp.text
