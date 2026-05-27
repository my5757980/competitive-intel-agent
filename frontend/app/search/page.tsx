"use client";
import { useState } from "react";
import { searchMarket, type SearchResponse } from "@/lib/api";
import SearchResultList from "@/components/SearchResultList";

type DateFilter = "past_week" | "past_month" | "";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim().length < 3) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await searchMarket({
        query: query.trim(),
        num_results: 10,
        date_filter: dateFilter || null,
      });
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
          <span>🌐</span> Market Search
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Search live market signals — competitor news, launches, funding — via Bright Data SERP API.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Salesforce new product launch 2026"
          className="w-full bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
        />
        <div className="flex gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value as DateFilter)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm focus:outline-none focus:border-sky-500"
          >
            <option value="">Any time</option>
            <option value="past_week">Past week</option>
            <option value="past_month">Past month</option>
          </select>
          <button
            type="submit"
            disabled={loading || query.trim().length < 3}
            className="flex-1 px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition"
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
          <SearchResultList data={result} />
        </div>
      )}
    </div>
  );
}
