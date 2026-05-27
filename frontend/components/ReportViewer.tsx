"use client";
import type { IntelligenceReport } from "@/lib/api";

const confidenceStyle = {
  high: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  low: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function ReportViewer({ report }: { report: IntelligenceReport }) {
  const completeness = Math.round(report.data_completeness * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-white">
            Intelligence Report: {report.competitor}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Generated in {report.generation_time_seconds}s · {new Date(report.generated_at).toLocaleString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Data completeness</span>
          <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${completeness > 66 ? "bg-emerald-500" : completeness > 33 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${completeness}%` }}
            />
          </div>
          <span className="text-xs text-slate-400">{completeness}%</span>
        </div>
      </div>

      {report.executive_summary && (
        <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl">
          <h3 className="text-xs font-semibold text-sky-400 uppercase tracking-wide mb-2">Executive Summary</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{report.executive_summary}</p>
        </div>
      )}

      <div className="space-y-3">
        {report.sections.map((section, i) => (
          <details key={i} open={i === 0} className="group bg-slate-800/40 border border-slate-700 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between px-5 py-3.5 cursor-pointer hover:bg-slate-700/30 transition select-none">
              <span className="font-semibold text-white text-sm">{section.title}</span>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full border ${confidenceStyle[section.confidence]}`}>
                  {section.confidence}
                </span>
                <span className="text-slate-500 group-open:rotate-180 transition-transform">▾</span>
              </div>
            </summary>
            <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-slate-700/50 pt-3">
              {section.content}
              {section.sources.length > 0 && (
                <div className="mt-2 flex gap-1 flex-wrap">
                  {section.sources.map((s, j) => (
                    <span key={j} className="text-xs px-1.5 py-0.5 bg-slate-700 rounded text-slate-500">{s}</span>
                  ))}
                </div>
              )}
            </div>
          </details>
        ))}
      </div>

      {report.recommended_actions.length > 0 && (
        <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
          <h3 className="text-xs font-semibold text-amber-400 uppercase tracking-wide mb-3">Recommended Actions</h3>
          <ol className="space-y-2">
            {report.recommended_actions.map((action, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="shrink-0 w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs flex items-center justify-center font-semibold">
                  {i + 1}
                </span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
