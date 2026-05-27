import { scrapeWithUnlocker } from './web-unlocker';

const BRIGHT_DATA_API_KEY = process.env.BRIGHT_DATA_API_KEY ?? '';
const SCRAPER_BASE = 'https://api.brightdata.com/datasets/v3';
const LINKEDIN_DATASET = 'gd_l1vikfnt1wgvvqz95w';

const KNOWN_TECH = ['React', 'Python', 'AWS', 'GCP', 'Azure', 'Kubernetes', 'Postgres', 'Stripe', 'Salesforce'];
const INDUSTRIES = ['software', 'fintech', 'healthcare', 'e-commerce', 'saas', 'ai', 'cloud', 'security'];

export interface CompanyRaw {
  name: string; industry: string | null; size_range: string | null;
  headquarters: string | null; website: string | null;
  recent_news: string[]; tech_signals: string[]; linkedin_followers: number | null;
}

export async function enrichCompany(company: string): Promise<CompanyRaw> {
  if (company.toLowerCase().includes('linkedin.com/company')) {
    return enrichViaLinkedIn(company);
  }
  return enrichViaWebUnlocker(company);
}

async function enrichViaLinkedIn(url: string): Promise<CompanyRaw> {
  if (!BRIGHT_DATA_API_KEY) return emptyProfile(url);
  try {
    const trigger = await fetch(`${SCRAPER_BASE}/trigger?dataset_id=${LINKEDIN_DATASET}&type=discover_new&discover_by=url`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([{ url }]),
      signal: AbortSignal.timeout(25_000),
    });
    if (!trigger.ok) return emptyProfile(url);
    const data = await trigger.json();
    const snapshotId = data?.snapshot_id;
    if (!snapshotId) return emptyProfile(url);

    const result = await fetch(`${SCRAPER_BASE}/snapshot/${snapshotId}`, {
      headers: { 'Authorization': `Bearer ${BRIGHT_DATA_API_KEY}` },
      signal: AbortSignal.timeout(30_000),
    });
    if (result.ok) {
      const items = await result.json();
      if (items?.[0]) return parseLinkedIn(items[0], url);
    }
  } catch {}
  return emptyProfile(url);
}

async function enrichViaWebUnlocker(company: string): Promise<CompanyRaw> {
  try {
    const domain = company.replace(/\s+/g, '').toLowerCase();
    const html = await scrapeWithUnlocker(`https://${domain}.com`);
    return {
      name: company,
      industry: guessIndustry(html),
      size_range: null,
      headquarters: null,
      website: `https://${domain}.com`,
      recent_news: [],
      tech_signals: extractTechSignals(html),
      linkedin_followers: null,
    };
  } catch {
    return emptyProfile(company);
  }
}

function parseLinkedIn(item: Record<string, unknown>, url: string): CompanyRaw {
  return {
    name: String(item.name ?? url),
    industry: item.industry ? String(item.industry) : null,
    size_range: item.company_size ? String(item.company_size) : null,
    headquarters: item.headquarters ? String(item.headquarters) : null,
    website: item.website ? String(item.website) : null,
    recent_news: ((item.updates as Record<string, string>[]) ?? []).slice(0, 3).map(p => p.text ?? ''),
    tech_signals: [],
    linkedin_followers: item.followers ? Number(item.followers) : null,
  };
}

function emptyProfile(name: string): CompanyRaw {
  return { name, industry: null, size_range: null, headquarters: null, website: null, recent_news: [], tech_signals: [], linkedin_followers: null };
}

function guessIndustry(html: string): string | null {
  const lower = html.toLowerCase();
  return INDUSTRIES.find(i => lower.includes(i))?.charAt(0).toUpperCase() + (INDUSTRIES.find(i => lower.includes(i))?.slice(1) ?? '') || null;
}

function extractTechSignals(html: string): string[] {
  return KNOWN_TECH.filter(t => html.toLowerCase().includes(t.toLowerCase()));
}
