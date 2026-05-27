const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "/api";

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BACKEND}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export interface MonitorRequest { target: string; focus?: string[]; country?: string; }
export interface SearchRequest { query: string; num_results?: number; date_filter?: string | null; }
export interface EnrichRequest { company: string; }
export interface ReportRequest { competitor: string; include_sections?: string[]; }

export interface PricingTier { name: string; price: string | null; features: string[]; }
export interface CompetitorIntelligence {
  target_url: string; company_name: string | null; pricing_tiers: PricingTier[];
  product_claims: string[]; job_count: number | null; job_titles: string[];
  page_summary: string; raw_signals: string[]; collected_at: string; data_source: string;
}
export interface SearchResult { title: string; url: string; snippet: string; source_date: string | null; relevance_signal: string | null; }
export interface SearchResponse { query: string; results: SearchResult[]; total_results: number; collected_at: string; data_source: string; }
export interface CompanyProfile {
  name: string; industry: string | null; size_range: string | null; headquarters: string | null;
  website: string | null; recent_news: string[]; tech_signals: string[]; linkedin_followers: number | null;
  collected_at: string; data_source: string;
}
export interface ReportSection { title: string; content: string; confidence: "high" | "medium" | "low"; sources: string[]; }
export interface IntelligenceReport {
  competitor: string; sections: ReportSection[]; executive_summary: string;
  recommended_actions: string[]; data_completeness: number; generated_at: string; generation_time_seconds: number;
}
export interface ProgressEvent { agent: string; status: "starting" | "running" | "complete" | "failed"; message: string; timestamp: string; }

export const monitorCompetitor = (req: MonitorRequest) =>
  post<CompetitorIntelligence>("/monitor", req);

export const searchMarket = (req: SearchRequest) =>
  post<SearchResponse>("/search", req);

export const enrichCompany = (req: EnrichRequest) =>
  post<CompanyProfile>("/enrich", req);

export const generateReport = (req: ReportRequest) =>
  post<IntelligenceReport>("/report", req);

export function streamReport(
  req: ReportRequest,
  onProgress: (e: ProgressEvent) => void,
  onReport: (r: IntelligenceReport) => void,
  onError: (msg: string) => void
): EventSource {
  const es = new EventSource(
    `${BACKEND}/report/stream?competitor=${encodeURIComponent(req.competitor)}`
  );
  es.addEventListener("progress", (e) => {
    try { onProgress(JSON.parse(e.data)); } catch {}
  });
  es.addEventListener("report", (e) => {
    try { onReport(JSON.parse(e.data)); es.close(); } catch {}
  });
  es.addEventListener("error", () => { onError("Connection lost"); es.close(); });
  return es;
}
