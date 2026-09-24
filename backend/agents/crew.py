"""Runs the four agents as one sequential pipeline in plain async Python (no agent framework), streaming progress."""
import asyncio
import json
import time
from datetime import datetime, timezone
from typing import Callable, Awaitable

from models.requests import MonitorRequest, SearchRequest, EnrichRequest, ReportRequest
from models.responses import IntelligenceReport, ReportSection, ProgressEvent
from agents.intel_reporter import get_groq_client, build_reporter_prompt
from tools.sources import NO_DATA, label


ProgressCallback = Callable[[ProgressEvent], Awaitable[None]]


async def _emit(callback: ProgressCallback, agent: str, status: str, message: str) -> None:
    await callback(ProgressEvent(
        agent=agent,
        status=status,
        message=message,
        timestamp=datetime.now(timezone.utc),
    ))


async def run_full_report(req: ReportRequest, progress_callback: ProgressCallback) -> IntelligenceReport:
    start = time.time()
    monitor_data: dict = {}
    search_data: dict = {}
    enrich_data: dict = {}
    # One entry per step that really returned data, naming the service that returned it.
    sources_used: list[str] = []

    await _emit(progress_callback, "CompetitorMonitor", "starting", f"Scanning {req.competitor} website...")
    try:
        from agents.competitor_monitor import run_competitor_monitor
        monitor_result = await run_competitor_monitor(MonitorRequest(target=req.competitor))
        monitor_data = monitor_result.model_dump()
        sources_used.append(monitor_result.data_source)
        await _emit(progress_callback, "CompetitorMonitor", "complete",
                    f"Found {len(monitor_result.pricing_tiers)} pricing tiers, {len(monitor_result.product_claims)} product claims"
                    f" via {label(monitor_result.data_source)}")
    except Exception as e:
        await _emit(progress_callback, "CompetitorMonitor", "failed", f"Scrape failed: {str(e)[:100]}")

    await _emit(progress_callback, "MarketResearcher", "starting", "Searching market signals...")
    try:
        from agents.market_researcher import run_market_researcher
        search_result = await run_market_researcher(SearchRequest(query=f"{req.competitor} product launch news 2026", num_results=8))
        search_data = search_result.model_dump()
        if search_result.results:
            sources_used.append(search_result.data_source)
        await _emit(progress_callback, "MarketResearcher", "complete",
                    f"Found {search_result.total_results} market signals via {label(search_result.data_source)}")
    except Exception as e:
        await _emit(progress_callback, "MarketResearcher", "failed", f"Search failed: {str(e)[:100]}")

    await _emit(progress_callback, "LeadEnricher", "starting", "Enriching company profile...")
    try:
        from agents.lead_enricher import run_lead_enricher
        enrich_result = await run_lead_enricher(EnrichRequest(company=req.competitor))
        enrich_data = enrich_result.model_dump()
        if enrich_result.data_source == NO_DATA:
            message = "No company profile data came back"
        else:
            sources_used.append(enrich_result.data_source)
            message = (f"Profile built: {enrich_result.industry or 'industry unknown'}, "
                       f"{enrich_result.size_range or 'size unknown'} via {label(enrich_result.data_source)}")
        await _emit(progress_callback, "LeadEnricher", "complete", message)
    except Exception as e:
        await _emit(progress_callback, "LeadEnricher", "failed", f"Enrichment failed: {str(e)[:100]}")

    sources_available = len(sources_used)

    await _emit(progress_callback, "IntelligenceReporter", "starting", "Synthesizing report with Groq llama-3.3-70b...")
    try:
        prompt = build_reporter_prompt(req.competitor, monitor_data, search_data, enrich_data, req.include_sections, sources_used)
        client = get_groq_client()
        response = await asyncio.to_thread(
            client.chat.completions.create,
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=2000,
        )
        report_json = json.loads(response.choices[0].message.content)

        sections = [
            ReportSection(
                title=s.get("title", ""),
                content=s.get("content", ""),
                confidence=s.get("confidence", "medium"),
                # Keep only sources that really returned data, whatever the model wrote.
                sources=[src for src in s.get("sources", []) if src in sources_used],
            )
            for s in report_json.get("sections", [])
        ]

        report = IntelligenceReport(
            competitor=req.competitor,
            sections=sections,
            executive_summary=report_json.get("executive_summary", ""),
            recommended_actions=report_json.get("recommended_actions", []),
            data_completeness=sources_available / 3.0,
            generated_at=datetime.now(timezone.utc),
            generation_time_seconds=round(time.time() - start, 2),
        )
        await _emit(progress_callback, "IntelligenceReporter", "complete",
                    f"Report complete — {len(sections)} sections, {sources_available}/3 data sources")
        return report

    except Exception as e:
        await _emit(progress_callback, "IntelligenceReporter", "failed", f"Report synthesis failed: {str(e)[:100]}")
        return IntelligenceReport(
            competitor=req.competitor,
            sections=[ReportSection(
                title="Partial Report",
                content="Report generation encountered errors. Partial data collected.",
                confidence="low",
                sources=[],
            )],
            executive_summary=f"Partial intelligence collected for {req.competitor}. {sources_available}/3 data sources available.",
            recommended_actions=["Retry with valid Bright Data and LLM API keys", "Check .env configuration"],
            data_completeness=sources_available / 3.0,
            generated_at=datetime.now(timezone.utc),
            generation_time_seconds=round(time.time() - start, 2),
        )
