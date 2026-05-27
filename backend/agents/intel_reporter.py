from config import get_settings
from groq import Groq


def get_groq_client():
    return Groq(api_key=get_settings().groq_api_key)


def build_reporter_prompt(
    competitor: str,
    monitor_data: dict,
    search_data: dict,
    enrich_data: dict,
    sections: list[str],
) -> str:
    return f"""You are a strategic intelligence analyst. Generate a competitive intelligence report for: {competitor}

## Data Collected

### Website Intelligence (Bright Data Web Unlocker)
- Pricing tiers: {monitor_data.get('pricing_tiers', [])}
- Product claims: {monitor_data.get('product_claims', [])}
- Job count: {monitor_data.get('job_count')}
- Summary: {monitor_data.get('page_summary', '')[:400]}

### Market Signals (Bright Data SERP API)
- Top results about {competitor}:
{chr(10).join([f"  - {r.get('title', '')}: {r.get('snippet', '')[:150]}" for r in search_data.get('results', [])[:5]])}

### Company Profile (Bright Data Web Scraper API)
- Industry: {enrich_data.get('industry')}
- Size: {enrich_data.get('size_range')}
- HQ: {enrich_data.get('headquarters')}
- Tech stack: {enrich_data.get('tech_signals', [])}
- Recent news: {enrich_data.get('recent_news', [])[:3]}

## Required Report Sections
{chr(10).join([f"- {s}" for s in sections])}

Generate a structured JSON report:
{{
  "executive_summary": "2-3 sentence summary",
  "sections": [
    {{
      "title": "section name",
      "content": "detailed analysis",
      "confidence": "high|medium|low",
      "sources": ["web_unlocker", "serp_api", "web_scraper_api"]
    }}
  ],
  "recommended_actions": ["action 1", "action 2", "action 3"]
}}

Return ONLY valid JSON, no markdown."""
