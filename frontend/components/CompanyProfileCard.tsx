"use client";
import type { CompanyProfile } from "@/lib/api";

export default function CompanyProfileCard({ data }: { data: CompanyProfile }) {
  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">{data.name}</h2>
          {data.website && (
            <a href={data.website} target="_blank" rel="noopener" className="text-xs text-sky-500 hover:underline">
              {data.website}
            </a>
          )}
        </div>
        <span className="text-xs px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-full">
          {data.data_source}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Industry", value: data.industry },
          { label: "Size", value: data.size_range },
          { label: "HQ", value: data.headquarters },
          { label: "Followers", value: data.linkedin_followers?.toLocaleString() },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/60 border border-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-500 mb-0.5">{label}</p>
            <p className="text-sm text-white font-medium">{value ?? "—"}</p>
          </div>
        ))}
      </div>

      {data.tech_signals.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Tech Signals</h3>
          <div className="flex flex-wrap gap-2">
            {data.tech_signals.map((t, i) => (
              <span key={i} className="px-2.5 py-1 bg-violet-500/10 border border-violet-500/30 rounded-full text-xs text-violet-300">
                {t}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.recent_news.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Recent News</h3>
          <ul className="space-y-1.5">
            {data.recent_news.map((n, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                <span>{n}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-xs text-slate-600">Collected at {new Date(data.collected_at).toLocaleString()}</p>
    </div>
  );
}
