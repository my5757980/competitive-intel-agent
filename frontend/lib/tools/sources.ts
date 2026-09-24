// Where a piece of data really came from. Every response carries one of these as data_source,
// so a fallback is never presented as Bright Data. Mirrors backend/tools/sources.py.
export const BRIGHT_DATA_WEB_UNLOCKER = 'bright_data_web_unlocker';
export const BRIGHT_DATA_SERP_API = 'bright_data_serp_api';
export const BRIGHT_DATA_WEB_SCRAPER_API = 'bright_data_web_scraper_api';
export const DIRECT_FETCH = 'direct_fetch'; // plain GET, used when Web Unlocker is not configured or refuses
export const DUCKDUCKGO = 'duckduckgo';     // DuckDuckGo Instant Answer API, used when the SERP API is not available
export const NO_DATA = 'none';              // nothing came back

const LABELS: Record<string, string> = {
  [BRIGHT_DATA_WEB_UNLOCKER]: 'Bright Data Web Unlocker',
  [BRIGHT_DATA_SERP_API]: 'Bright Data SERP API',
  [BRIGHT_DATA_WEB_SCRAPER_API]: 'Bright Data Web Scraper API',
  [DIRECT_FETCH]: 'direct fetch (Bright Data unavailable)',
  [DUCKDUCKGO]: 'DuckDuckGo (Bright Data unavailable)',
  [NO_DATA]: 'nothing (no data came back)',
};

export function sourceLabel(source: unknown): string {
  const key = typeof source === 'string' && source ? source : NO_DATA;
  return LABELS[key] ?? key;
}
