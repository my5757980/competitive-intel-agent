// @ts-nocheck
import { load } from 'cheerio';
type CheerioAPI = ReturnType<typeof load>;

export interface ExtractedIntelligence {
  pricing_tiers: Array<{ name: string; price: string | null; features: string[] }>;
  product_claims: string[];
  job_count: number | null;
  job_titles: string[];
  page_summary: string;
  raw_signals: string[];
}

const CURRENCY_RE = /[\$€£¥₹]\s*[\d,]+|free|per month|\/mo|\/year/i;
const JOB_RE = /(\d+)\s*(?:open|current)?\s*(?:job|position|role|opening)/i;
const JOB_TITLE_RE = /engineer|developer|manager|analyst|designer|scientist|lead|director/i;
const SIGNAL_RE = /new|launch|announc|partner|integrat|award|certif|compli/i;

export function extractCompetitorIntelligence(html: string, _url: string): ExtractedIntelligence {
  const $ = load(html);
  $('script, style, nav, footer, head').remove();
  return {
    pricing_tiers: extractPricing($),
    product_claims: extractClaims($),
    job_count: extractJobCount($),
    job_titles: extractJobTitles($),
    page_summary: extractSummary($),
    raw_signals: extractSignals($),
  };
}

function extractPricing($: CheerioAPI) {
  const tiers: Array<{ name: string; price: string | null; features: string[] }> = [];

  $('table').each((_, table) => {
    const text = $(table).text();
    if (!CURRENCY_RE.test(text)) return;
    $(table).find('th').each((i, th) => {
      if (i >= 4) return;
      const name = $(th).text().trim();
      if (!name) return;
      let price: string | null = null;
      $(table).find('td').each((_, td) => {
        if (!price && CURRENCY_RE.test($(td).text())) price = $(td).text().trim();
      });
      tiers.push({ name, price, features: [] });
    });
    if (tiers.length) return false;
  });

  if (!tiers.length) {
    $('div, section').filter((_, el) => /pric|plan|tier/i.test($(el).attr('class') ?? '')).each((_, el) => {
      if (tiers.length >= 4) return false;
      const heading = $(el).find('h2, h3, h4').first().text().trim();
      if (!heading) return;
      const priceMatch = $(el).find('*').filter((_, e) => CURRENCY_RE.test($(e).text())).first().text().trim();
      const features = $(el).find('li').map((_, li) => $(li).text().trim()).get().slice(0, 5);
      tiers.push({ name: heading, price: priceMatch || null, features });
    });
  }
  return tiers;
}

function extractClaims($: CheerioAPI): string[] {
  const claims: string[] = [];
  $('h1, h2, h3').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 5 && text.length < 120) claims.push(text);
  });
  return [...new Set(claims)].slice(0, 8);
}

function extractJobCount($: CheerioAPI): number | null {
  const fullText = $('body').text();
  const match = fullText.match(JOB_RE);
  return match ? parseInt(match[1], 10) : null;
}

function extractJobTitles($: CheerioAPI): string[] {
  const titles: string[] = [];
  $('li, a, h3, h4').each((_, el) => {
    const text = $(el).text().trim();
    if (JOB_TITLE_RE.test(text) && text.length > 5 && text.length < 80) titles.push(text);
  });
  return [...new Set(titles)].slice(0, 6);
}

function extractSummary($: CheerioAPI): string {
  const paras: string[] = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text.length > 60) paras.push(text);
    if (paras.length === 3) return false;
  });
  return paras.join(' | ');
}

function extractSignals($: CheerioAPI): string[] {
  const signals: string[] = [];
  const fullText = $('body').text();
  const words = fullText.split(/\s+/);
  for (let i = 0; i < words.length - 5; i++) {
    const chunk = words.slice(i, i + 10).join(' ');
    if (SIGNAL_RE.test(chunk) && chunk.length > 10 && chunk.length < 150) {
      signals.push(chunk);
      i += 9;
    }
  }
  return [...new Set(signals)].slice(0, 5);
}
