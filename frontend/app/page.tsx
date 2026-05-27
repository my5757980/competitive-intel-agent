import Link from "next/link";

const features = [
  {
    href: "/monitor",
    icon: "🔍",
    title: "Competitor Monitor",
    description: "Scrape any competitor website in real-time. Extract pricing, features, and job postings using Bright Data Web Unlocker.",
    badge: "Web Unlocker",
    color: "from-sky-500/20 to-sky-600/10 border-sky-500/30",
  },
  {
    href: "/search",
    icon: "🌐",
    title: "Market Search",
    description: "Search live market signals — competitor launches, funding rounds, hiring trends — via Bright Data SERP API.",
    badge: "SERP API",
    color: "from-violet-500/20 to-violet-600/10 border-violet-500/30",
  },
  {
    href: "/enrich",
    icon: "🏢",
    title: "Lead Enrichment",
    description: "Enrich any company with structured data: size, industry, news, tech signals using Bright Data Web Scraper API.",
    badge: "Web Scraper API",
    color: "from-emerald-500/20 to-emerald-600/10 border-emerald-500/30",
  },
  {
    href: "/report",
    icon: "📊",
    title: "Intelligence Report",
    description: "Full competitive intelligence report synthesized by 4 CrewAI agents with live progress streaming.",
    badge: "All Tools + CrewAI",
    color: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-500/30 rounded-full text-sky-400 text-sm">
          <span>⚡</span> Bright Data Web Data UNLOCKED Hackathon
        </div>
        <h1 className="text-4xl font-bold text-white">
          CompeteIQ
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          AI-powered GTM intelligence. Monitor competitors, search market signals, enrich leads —
          all powered by real-time web data from Bright Data.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className={`block p-6 rounded-xl border bg-gradient-to-br ${f.color} hover:scale-[1.02] transition-transform`}
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{f.icon}</span>
              <span className="text-xs px-2 py-0.5 bg-slate-800/60 rounded-full text-slate-400 border border-slate-600/50">
                {f.badge}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-1">{f.title}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{f.description}</p>
          </Link>
        ))}
      </div>

      <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 text-sm text-slate-400">
        <strong className="text-slate-300">Quick start:</strong>{" "}
        Copy <code className="text-sky-400 bg-slate-800 px-1 rounded">.env.example</code> to{" "}
        <code className="text-sky-400 bg-slate-800 px-1 rounded">.env</code>, add your{" "}
        <code className="text-sky-400 bg-slate-800 px-1 rounded">BRIGHT_DATA_API_KEY</code>, then run{" "}
        <code className="text-sky-400 bg-slate-800 px-1 rounded">docker compose up</code>.
        Free $250 credits from the hackathon kickoff stream on May 25!
      </div>
    </div>
  );
}
