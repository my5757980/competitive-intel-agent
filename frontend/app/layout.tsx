import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "CompeteIQ — GTM Intelligence",
  description: "AI-powered competitive intelligence powered by Bright Data",
};

const navLinks = [
  { href: "/monitor", label: "Monitor", icon: "🔍" },
  { href: "/search", label: "Search", icon: "🌐" },
  { href: "/enrich", label: "Enrich", icon: "🏢" },
  { href: "/report", label: "Report", icon: "📊" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-900 text-slate-100">
        <nav className="border-b border-slate-700 bg-slate-800/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            <Link href="/" className="font-bold text-xl text-sky-400 hover:text-sky-300 transition">
              CompeteIQ
            </Link>
            <div className="flex gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-1.5 rounded-md text-sm text-slate-300 hover:text-white hover:bg-slate-700 transition flex items-center gap-1.5"
                >
                  <span>{link.icon}</span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
        <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        <footer className="border-t border-slate-700 mt-16 py-4 text-center text-xs text-slate-500">
          Powered by{" "}
          <a href="https://brightdata.com" className="text-sky-500 hover:underline" target="_blank" rel="noopener">
            Bright Data
          </a>{" "}
          · Built for lablab.ai Hackathon 2026
        </footer>
      </body>
    </html>
  );
}
