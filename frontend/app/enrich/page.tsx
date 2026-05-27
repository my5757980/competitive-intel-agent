"use client";
import { useState } from "react";
import { enrichCompany, type CompanyProfile } from "@/lib/api";
import CompanyProfileCard from "@/components/CompanyProfileCard";

export default function EnrichPage() {
  const [company, setCompany] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CompanyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!company.trim()) return;
    setLoading(true); setError(null); setResult(null);
    try {
      const data = await enrichCompany({ company: company.trim() });
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
          <span>🏢</span> Lead Enrichment
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Enrich any company with industry, size, tech stack, and news via Bright Data Web Scraper API.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          placeholder="e.g. Stripe or linkedin.com/company/stripe"
          className="flex-1 bg-slate-800 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
        />
        <button
          type="submit"
          disabled={loading || !company.trim()}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:text-slate-500 text-white rounded-lg font-medium transition"
        >
          {loading ? "Enriching..." : "Enrich"}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
      )}

      {result && (
        <div className="p-5 bg-slate-800/40 border border-slate-700 rounded-xl">
          <CompanyProfileCard data={result} />
        </div>
      )}
    </div>
  );
}
