"use client";
import type { ProgressEvent } from "@/lib/api";
import { useEffect, useRef } from "react";

const statusIcon = {
  starting: <span className="text-slate-400 animate-pulse">⏳</span>,
  running: (
    <svg className="animate-spin h-4 w-4 text-sky-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  ),
  complete: <span className="text-emerald-400">✓</span>,
  failed: <span className="text-red-400">✗</span>,
};

const agentColors: Record<string, string> = {
  CompetitorMonitor: "sky",
  MarketResearcher: "violet",
  LeadEnricher: "emerald",
  IntelligenceReporter: "amber",
};

export default function ProgressFeed({ events }: { events: ProgressEvent[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events]);

  if (events.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wide">Agent Progress</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {events.map((e, i) => {
          const color = agentColors[e.agent] ?? "slate";
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg bg-${color}-500/5 border border-${color}-500/20`}>
              <div className="mt-0.5 shrink-0">{statusIcon[e.status]}</div>
              <div className="min-w-0">
                <span className={`text-xs font-semibold text-${color}-400`}>{e.agent}</span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{e.message}</p>
              </div>
              <span className="ml-auto text-xs text-slate-600 shrink-0">
                {new Date(e.timestamp).toLocaleTimeString()}
              </span>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
