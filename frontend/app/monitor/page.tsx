"use client";
import { useState } from "react";
import { monitorCompetitor, type CompetitorIntelligence } from "@/lib/api";
import CompetitorCard from "@/components/CompetitorCard";

export default function MonitorPage() {
  const [target, setTarget] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompetitorIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!target.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await monitorCompetitor({ target: target.trim() });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🔍</span> Competitor Monitor
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enter a competitor URL or company name to extract real-time intelligence via Bright Data Web Unlocker.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g. stripe.com/pricing or salesforce.com"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !target.trim()}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Scanning...
            </span>
          ) : "Monitor"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
          <CompetitorCard data={result} />
        </div>
      )}
    </div>
  );
}
