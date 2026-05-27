const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY ?? '';
const TIMEOUT_MS = 30_000;

export async function scrapeWithUnlocker(url: string, country = 'us'): Promise<string> {
  if (BRIGHT_DATA_API_KEY) {
    try {
      return await scrapeViaApi(url, country);
    } catch {
      return await scrapeDirect(url);
    }
  }
  return await scrapeDirect(url);
}

async function scrapeViaApi(url: string, country: string): Promise<string> {
  const resp = await fetch('https://api.brightdata.com/request', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ zone: 'web_unlocker1', url, country, format: 'raw' }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return resp.text();
}

async function scrapeDirect(url: string): Promise<string> {
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(TIMEOUT_MS),
    redirect: 'follow',
  });
  if (!resp.ok) throw new Error(`Scrape failed: HTTP ${resp.status}`);
  return resp.text();
}
