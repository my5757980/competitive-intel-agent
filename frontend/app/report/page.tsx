"use client";
import { useState } from "react";
import type { IntelligenceReport, ProgressEvent } from "@/lib/api";
import { streamReport } from "@/lib/api";
import ProgressFeed from "@/components/ProgressFeed";
import ReportViewer from "@/components/ReportViewer";

export default function ReportPage() {
  const [competitor, setCompetitor] = useState("");
  const [loading, setLoading] = useState(false);
  const [events, setEvents] = useState<ProgressEvent[]>([]);
  const [report, setReport] = useState<IntelligenceReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!competitor.trim()) return;

    setLoading(true);
    setError(null);
    setReport(null);
    setEvents([]);

    streamReport(
      { competitor: competitor.trim() },
      (event) => setEvents((prev) => [...prev, event]),
      (finalReport) => {
        setReport(finalReport);
        setLoading(false);
      },
      (errMsg) => {
        setError(errMsg);
        setLoading(false);
      }
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>📊</span> Intelligence Report
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Full competitive intelligence report — 4 AI agents run in sequence, live progress shown below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={competitor}
          onChange={(e) => setCompetitor(e.target.value)}
          placeholder="e.g. HubSpot or Salesforce"
          disabled={loading}
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !competitor.trim()}
          className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition"
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
      </form>

      {events.length > 0 && <ProgressFeed events={events} />}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {report && (
        <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
          <ReportViewer report={report} />
        </div>
      )}
    </div>
  );
}
