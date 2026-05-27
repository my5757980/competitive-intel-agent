"use client";
import type { SearchResponse } from "@/lib/api";

export default function SearchResultList({ data }: { data: SearchResponse }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">
          Results for: <span className="text-sky-400">"{data.query}"</span>
        </h2>
        <span className="text-sm text-slate-400">{data.total_results} results · {data.data_source}</span>
      </div>

      {data.results.length === 0 ? (
        <p className="text-slate-500 text-sm py-4">No results found. Try a different query.</p>
      ) : (
        <div className="space-y-3">
          {data.results.map((r, i) => (
            <div key={i} className="p-4 bg-slate-800/40 border border-slate-700 rounded-lg hover:border-slate-600 transition">
              <div className="flex items-start justify-between gap-2 mb-1">
                <a href={r.url} target="_blank" rel="noopener"
                  className="text-sky-400 hover:text-sky-300 hover:underline font-medium text-sm leading-tight">
                  {r.title}
                </a>
                {r.source_date && (
                  <span className="shrink-0 text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded-full">
                    {r.source_date}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-1.5 truncate">{r.url}</p>
              <p className="text-sm text-slate-400 leading-relaxed">{r.snippet}</p>
              {r.relevance_signal && (
                <span className="mt-2 inline-block text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                  {r.relevance_signal}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-slate-600">Collected at {new Date(data.collected_at).toLocaleString()}</p>
    </div>
  );
}
