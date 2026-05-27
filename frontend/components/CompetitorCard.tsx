"use client";
import type { CompetitorIntelligence, PricingTier } from "@/lib/api";

function Badge({ label, color = "slate" }: { label: string; color?: string }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs bg-${color}-500/20 text-${color}-300 border border-${color}-500/30`}>
      {label}
    </span>
  );
}

function PricingTable({ tiers }: { tiers: PricingTier[] }) {
  if (!tiers.length) return <p className="text-slate-500 text-sm">No pricing data found</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-700">
            <th className="text-left py-2 text-slate-400 font-medium">Plan</th>
            <th className="text-left py-2 text-slate-400 font-medium">Price</th>
            <th className="text-left py-2 text-slate-400 font-medium">Features</th>
          </tr>
        </thead>
        <tbody>
          {tiers.map((t, i) => (
            <tr key={i} className="border-b border-slate-800">
              <td className="py-2 font-medium text-white">{t.name}</td>
              <td className="py-2 text-sky-400">{t.price ?? "—"}</td>
              <td className="py-2 text-slate-400">{t.features.slice(0, 3).join(", ") || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CompetitorCard({ data }: { data: CompetitorIntelligence }) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-xl font-bold text-white">{data.company_name ?? data.target_url}</h2>
          <a href={data.target_url} target="_blank" rel="noopener" className="text-xs text-sky-500 hover:underline">
            {data.target_url}
          </a>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge label={data.data_source} color="sky" />
          {data.job_count != null && <Badge label={`${data.job_count} jobs`} color="emerald" />}
        </div>
      </div>

      <section>
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Pricing</h3>
        <PricingTable tiers={data.pricing_tiers} />
      </section>

      {data.product_claims.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Product Claims</h3>
          <div className="flex flex-wrap gap-2">
            {data.product_claims.map((c, i) => (
              <span key={i} className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-300">
                {c}
              </span>
            ))}
          </div>
        </section>
      )}

      {data.job_titles.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">Hiring Signals</h3>
          <ul className="space-y-1">
            {data.job_titles.map((t, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-center gap-2">
                <span className="text-emerald-400">→</span> {t}
              </li>
            ))}
          </ul>
        </section>
      )}

      {data.page_summary && (
        <section>
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-2">AI Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed bg-slate-800/50 p-3 rounded-lg border border-slate-700">
            {data.page_summary}
          </p>
        </section>
      )}

      <p className="text-xs text-slate-600">
        Collected at {new Date(data.collected_at).toLocaleString()}
      </p>
    </div>
  );
}
