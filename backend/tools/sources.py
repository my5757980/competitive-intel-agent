"""Where a piece of data really came from. Every response carries one of these as data_source, so a
fallback is never presented as Bright Data."""

BRIGHT_DATA_WEB_UNLOCKER = "bright_data_web_unlocker"
BRIGHT_DATA_SERP_API = "bright_data_serp_api"
BRIGHT_DATA_WEB_SCRAPER_API = "bright_data_web_scraper_api"
DIRECT_FETCH = "direct_fetch"  # plain GET, used when Web Unlocker is not configured or refuses
DUCKDUCKGO = "duckduckgo"      # DuckDuckGo Instant Answer API, used when the SERP API is not available
NO_DATA = "none"               # nothing came back

_LABELS = {
    BRIGHT_DATA_WEB_UNLOCKER: "Bright Data Web Unlocker",
    BRIGHT_DATA_SERP_API: "Bright Data SERP API",
    BRIGHT_DATA_WEB_SCRAPER_API: "Bright Data Web Scraper API",
    DIRECT_FETCH: "direct fetch (Bright Data unavailable)",
    DUCKDUCKGO: "DuckDuckGo (Bright Data unavailable)",
    NO_DATA: "nothing (no data came back)",
}


def label(source: str | None) -> str:
    return _LABELS.get(source or NO_DATA, source or NO_DATA)
