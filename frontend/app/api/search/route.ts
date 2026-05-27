import { NextRequest, NextResponse } from 'next/server';
import { searchSerp } from '@/lib/tools/serp-api';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { query, num_results = 10, date_filter } = await req.json();
    if (!query) return NextResponse.json({ error: 'query is required' }, { status: 422 });

    const raw = await searchSerp(query, num_results, date_filter);
    const results = raw.filter(r => r.title && r.url);

    return NextResponse.json({
      query,
      results,
      total_results: results.length,
      collected_at: new Date().toISOString(),
      data_source: 'bright_data_serp_api',
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Search failed', detail: msg }, { status: 500 });
  }
}
