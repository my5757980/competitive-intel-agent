import { NextRequest, NextResponse } from 'next/server';
import { enrichCompany } from '@/lib/tools/web-scraper-api';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  try {
    const { company } = await req.json();
    if (!company) return NextResponse.json({ error: 'company is required' }, { status: 422 });

    const raw = await enrichCompany(company);

    // raw.data_source already names the service that really answered.
    return NextResponse.json({
      ...raw,
      collected_at: new Date().toISOString(),
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Enrichment failed', detail: msg }, { status: 500 });
  }
}
