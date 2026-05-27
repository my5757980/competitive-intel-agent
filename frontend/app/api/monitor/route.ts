import { NextRequest, NextResponse } from 'next/server';
import { scrapeWithUnlocker } from '@/lib/tools/web-unlocker';
import { extractCompetitorIntelligence } from '@/lib/tools/content-extractor';
import Groq from 'groq-sdk';

export const maxDuration = 60;

const COMPANY_RE = /https?:\/\/(?:www\.)?([^./]+)/;

export async function POST(req: NextRequest) {
  try {
    const { target, country = 'us', focus = ['pricing', 'product', 'hiring'] } = await req.json();
    if (!target) return NextResponse.json({ error: 'target is required' }, { status: 422 });

    const html = await scrapeWithUnlocker(target, country);
    const extracted = extractCompetitorIntelligence(html, target);

    const prompt = `Analyze this competitor website data from ${target}.
Focus areas: ${focus.join(', ')}.

Extracted data:
- Pricing tiers: ${JSON.stringify(extracted.pricing_tiers)}
- Product claims: ${extracted.product_claims.join(', ')}
- Job count: ${extracted.job_count}
- Page summary: ${extracted.page_summary.slice(0, 500)}

Write a 2-3 sentence strategic summary of what this tells us about the competitor.`;

    const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 300,
    });
    const summary = response.choices[0].message.content ?? '';
    const match = target.match(COMPANY_RE);
    const companyName = match ? match[1].charAt(0).toUpperCase() + match[1].slice(1) : target;

    return NextResponse.json({
      target_url: target,
      company_name: companyName,
      pricing_tiers: extracted.pricing_tiers,
      product_claims: extracted.product_claims,
      job_count: extracted.job_count,
      job_titles: extracted.job_titles,
      page_summary: summary,
      raw_signals: extracted.raw_signals,
      collected_at: new Date().toISOString(),
      data_source: 'bright_data_web_unlocker',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Monitor failed', detail: msg }, { status: 500 });
  }
}
