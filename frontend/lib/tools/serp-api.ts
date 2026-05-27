const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY ?? '';
const SERP_BASE = 'https://api.brightdata.com/serp/google';

export interface SerpResult {
  title: string; url: string; snippet: string;
  source_date: string | null; relevance_signal: string | null;
}

export async function searchSerp(query: string, numResults = 10, dateFilter?: string | null): Promise<SerpResult[]> {
  const params = new URLSearchParams({ q: query, num: String(numResults), brd_json: '1' });
  if (dateFilter === 'past_week') params.set('tbs', 'qdr:w');
  if (dateFilter === 'past_month') params.set('tbs', 'qdr:m');

  if (BRIGHT_DATA_API_KEY) {
    try {
      const resp = await fetch(`${SERP_BASE}?${params}`, {
        headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}` },
        signal: AbortSignal.timeout(20_000),
      });
      if (resp.ok) return parseSerpResponse(await resp.json());
    } catch {}
  }
  return searchDuckDuckGo(query, numResults);
}

async function searchDuckDuckGo(query: string, numResults: number): Promise<SerpResult[]> {
  try {
    const params = new URLSearchParams({ q: query, format: 'json', no_html: '1', skip_disambig: '1' });
    const resp = await fetch(`https://api.duckduckgo.com/?${params}`, {
      headers: { 'User-Agent': 'CompeteIQ/1.0 GTM Intelligence Agent' },
      signal: AbortSignal.timeout(20_000),
      redirect: 'follow',
    });
    const data = await resp.json();
    const results: SerpResult[] = [];
    for (const topic of ((data.RelatedTopics ?? []) as Record<string, string>[]).slice(0, numResults)) {
      if (topic.Text && topic.FirstURL) {
        results.push({ title: topic.Text.slice(0, 80), url: topic.FirstURL, snippet: topic.Text, source_date: null, relevance_signal: 'duckduckgo' });
      }
    }
    if (data.AbstractText) {
      results.unshift({ title: data.Heading ?? query, url: data.AbstractURL ?? '', snippet: data.AbstractText, source_date: null, relevance_signal: 'duckduckgo_abstract' });
    }
    return results;
  } catch { return []; }
}

function parseSerpResponse(data: Record<string, unknown>): SerpResult[] {
  return ((data.organic as Record<string, unknown>[]) ?? []).map((item) => ({
    title: String(item.title ?? ''),
    url: String(item.link ?? item.url ?? ''),
    snippet: String(item.description ?? item.snippet ?? ''),
    source_date: item.date ? String(item.date) : null,
    relevance_signal: item.sitelinks_title ? String(item.sitelinks_title) : null,
  }));
}
