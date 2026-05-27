import { NextRequest } from 'next/server';
import { scrapeWithUnlocker } from '@/lib/tools/web-unlocker';
import { extractCompetitorIntelligence } from '@/lib/tools/content-extractor';
import { searchSerp } from '@/lib/tools/serp-api';
import { enrichCompany } from '@/lib/tools/web-scraper-api';
import Groq from 'groq-sdk';

export const maxDuration = 60;

const DEFAULT_SECTIONS = ['Overview', 'Pricing', 'Market', 'Hiring', 'Recommendations'];
const COMPANY_RE = /https?:\/\/(?:www\.)?([^./]+)/;

export async function GET(req: NextRequest) {
  const competitor = req.nextUrl.searchParams.get('competitor') ?? '';
  if (!competitor) {
    return new Response('competitor param required', { status: 422 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const emit = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      const ts = () => new Date().toISOString();
      const startTime = Date.now();
      let sourcesAvailable = 0;
      let monitorData: Record<string, unknown> = {};
      let searchData: Record<string, unknown> = {};
      let enrichData: Record<string, unknown> = {};

      // Agent 1 — CompetitorMonitor
      emit('progress', { agent: 'CompetitorMonitor', status: 'starting', message: `Scanning ${competitor} website via Bright Data Web Unlocker...`, timestamp: ts() });
      try {
        const target = competitor.startsWith('http') ? competitor : `https://${competitor.replace(/\s+/g, '').toLowerCase()}.com`;
        const html = await scrapeWithUnlocker(target);
        const extracted = extractCompetitorIntelligence(html, target);
        const match = target.match(COMPANY_RE);
        const companyName = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : competitor;
        monitorData = { target_url: target, company_name: companyName, ...extracted };
        sourcesAvailable++;
        emit('progress', { agent: 'CompetitorMonitor', status: 'complete', message: `Found ${extracted.pricing_tiers.length} pricing tiers, ${extracted.product_claims.length} product claims`, timestamp: ts() });
      } catch (e) {
        emit('progress', { agent: 'CompetitorMonitor', status: 'failed', message: `Scrape failed: ${String(e).slice(0, 100)}`, timestamp: ts() });
      }

      // Agent 2 — MarketResearcher
      emit('progress', { agent: 'MarketResearcher', status: 'starting', message: 'Searching market signals via Bright Data SERP API...', timestamp: ts() });
      try {
        const results = await searchSerp(`${competitor} product launch news 2026`, 8);
        const filtered = results.filter(r => r.title && r.url);
        searchData = { query: `${competitor} product launch news 2026`, results: filtered, total_results: filtered.length };
        sourcesAvailable++;
        emit('progress', { agent: 'MarketResearcher', status: 'complete', message: `Found ${filtered.length} market signals`, timestamp: ts() });
      } catch (e) {
        emit('progress', { agent: 'MarketResearcher', status: 'failed', message: `Search failed: ${String(e).slice(0, 100)}`, timestamp: ts() });
      }

      // Agent 3 — LeadEnricher
      emit('progress', { agent: 'LeadEnricher', status: 'starting', message: 'Enriching company profile via Bright Data Web Scraper API...', timestamp: ts() });
      try {
        const profile = await enrichCompany(competitor);
        enrichData = profile as unknown as Record<string, unknown>;
        sourcesAvailable++;
        emit('progress', { agent: 'LeadEnricher', status: 'complete', message: `Profile built: ${profile.industry ?? 'industry unknown'}, ${profile.size_range ?? 'size unknown'}`, timestamp: ts() });
      } catch (e) {
        emit('progress', { agent: 'LeadEnricher', status: 'failed', message: `Enrichment failed: ${String(e).slice(0, 100)}`, timestamp: ts() });
      }

      // Agent 4 — IntelligenceReporter
      emit('progress', { agent: 'IntelligenceReporter', status: 'starting', message: 'Synthesizing report with Groq llama-3.3-70b...', timestamp: ts() });
      try {
        const prompt = buildReporterPrompt(competitor, monitorData, searchData, enrichData, DEFAULT_SECTIONS);
        const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const response = await client.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 2000,
        });
        const reportJson = JSON.parse(response.choices[0].message.content ?? '{}');
        const sections = (reportJson.sections ?? []).map((s: Record<string, unknown>) => ({
          title: s.title ?? '', content: s.content ?? '',
          confidence: s.confidence ?? 'medium', sources: s.sources ?? [],
        }));
        const report = {
          competitor,
          sections,
          executive_summary: reportJson.executive_summary ?? '',
          recommended_actions: reportJson.recommended_actions ?? [],
          data_completeness: sourcesAvailable / 3,
          generated_at: ts(),
          generation_time_seconds: Math.round((Date.now() - startTime) / 100) / 10,
        };
        emit('progress', { agent: 'IntelligenceReporter', status: 'complete', message: `Report complete — ${sections.length} sections, ${sourcesAvailable}/3 data sources`, timestamp: ts() });
        emit('report', report);
      } catch (e) {
        emit('progress', { agent: 'IntelligenceReporter', status: 'failed', message: `Report synthesis failed: ${String(e).slice(0, 100)}`, timestamp: ts() });
        emit('error', { error: 'Report generation failed' });
      }

      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

function buildReporterPrompt(competitor: string, monitor: Record<string, unknown>, search: Record<string, unknown>, enrich: Record<string, unknown>, sections: string[]): string {
  const searchResults = ((search.results as Record<string, string>[]) ?? []).slice(0, 5).map(r => `  - ${r.title}: ${String(r.snippet ?? '').slice(0, 150)}`).join('\n');
  return `You are a strategic intelligence analyst. Generate a competitive intelligence report for: ${competitor}

## Data Collected

### Website Intelligence (Bright Data Web Unlocker)
- Pricing tiers: ${JSON.stringify(monitor.pricing_tiers ?? [])}
- Product claims: ${JSON.stringify(monitor.product_claims ?? [])}
- Job count: ${monitor.job_count ?? null}
- Summary: ${String(monitor.page_summary ?? '').slice(0, 400)}

### Market Signals (Bright Data SERP API)
- Top results about ${competitor}:
${searchResults}

### Company Profile (Bright Data Web Scraper API)
- Industry: ${enrich.industry ?? null}
- Size: ${enrich.size_range ?? null}
- HQ: ${enrich.headquarters ?? null}
- Tech stack: ${JSON.stringify(enrich.tech_signals ?? [])}
- Recent news: ${JSON.stringify((enrich.recent_news as string[]) ?? []).slice(0, 3)}

## Required Report Sections
${sections.map(s => `- ${s}`).join('\n')}

Generate a structured JSON report:
{
  "executive_summary": "2-3 sentence summary",
  "sections": [
    {
      "title": "section name",
      "content": "detailed analysis",
      "confidence": "high|medium|low",
      "sources": ["web_unlocker", "serp_api", "web_scraper_api"]
    }
  ],
  "recommended_actions": ["action 1", "action 2", "action 3"]
}

Return ONLY valid JSON, no markdown.`;
}
