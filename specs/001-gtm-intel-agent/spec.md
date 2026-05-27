# Feature Specification: CompeteIQ GTM Intelligence AI Agent

**Feature Branch**: `001-gtm-intel-agent`
**Created**: 2026-05-23
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Competitor Website Monitoring (Priority: P1)

A sales rep or marketing manager enters a competitor's name or website URL and receives real-time intelligence extracted from that competitor's public web presence — including pricing, product features, job postings, and any recent changes detected on the page.

**Why this priority**: This is the core differentiator of the product and directly satisfies the Bright Data Web Unlocker integration requirement. Every other feature builds on this foundation.

**Independent Test**: Can be tested by entering "Salesforce pricing" and verifying that structured pricing data is returned with extracted figures, features list, and last-updated timestamp — without any other features being built.

**Acceptance Scenarios**:

1. **Given** a user enters a competitor URL (e.g., `salesforce.com/pricing`), **When** they submit the monitor request, **Then** the system returns a structured report containing: page title, detected pricing tiers, key product claims, and a timestamp.
2. **Given** a user enters a competitor name (e.g., "HubSpot"), **When** they submit the request, **Then** the system resolves the company to their main website and returns intelligence data.
3. **Given** a bot-protected or JavaScript-rendered competitor site, **When** monitored, **Then** the system successfully bypasses protections and returns data (not an empty/blocked response).
4. **Given** an invalid or unreachable URL, **When** submitted, **Then** the system returns a clear error message — not a crash or empty result.

---

### User Story 2 - Market Search Intelligence (Priority: P2)

A marketing manager searches for market signals — competitor news, product launches, funding rounds, or hiring trends — and receives structured, ranked results from live search engine data.

**Why this priority**: Market search is independently useful without competitor monitoring and demonstrates the SERP API integration clearly to hackathon judges.

**Independent Test**: Can be tested by searching "OpenAI product launch 2026" and verifying that structured search results with titles, URLs, snippets, and source dates are returned.

**Acceptance Scenarios**:

1. **Given** a user enters a search query (e.g., "Salesforce new product launch 2026"), **When** submitted, **Then** the system returns at least 5 structured search results with title, URL, snippet, and date.
2. **Given** a query about competitor hiring (e.g., "HubSpot hiring engineers"), **When** searched, **Then** results include job posting signals and company hiring trend indicators.
3. **Given** a very broad or ambiguous query, **When** searched, **Then** the system returns results with a relevance score and the user can refine.

---

### User Story 3 - Lead Company Enrichment (Priority: P3)

A sales development rep (SDR) enters a company name or LinkedIn URL and receives a structured company profile — including size, industry, tech stack signals, recent news, and key decision-maker hints — to help prioritize outreach.

**Why this priority**: Enrichment adds significant demo value and showcases the Web Scraper API, but can be deferred if time is short since the first two stories deliver a complete MVP.

**Independent Test**: Can be tested by entering "Stripe" and verifying a company profile card is returned with: employee count range, industry, recent public news, and any detected technology signals.

**Acceptance Scenarios**:

1. **Given** a user enters a company name (e.g., "Stripe"), **When** submitted, **Then** the system returns a structured profile: company size, industry, HQ location, and recent news items.
2. **Given** a user enters a LinkedIn company URL, **When** submitted, **Then** the system extracts structured data from the public page.
3. **Given** a small or lesser-known company, **When** searched, **Then** the system returns partial data with clearly labeled fields rather than failing entirely.

---

### User Story 4 - Intelligence Report Generation (Priority: P4)

A team manager requests a comprehensive intelligence report on a competitor, and the system synthesizes all available data (website monitoring + market search + enrichment) into a single structured report suitable for sharing with a team.

**Why this priority**: The report ties all three data sources together in one AI-generated output — excellent for hackathon demo but depends on the three prior stories.

**Independent Test**: Can be tested by requesting a report on "HubSpot" and verifying the output contains sections for: company overview, pricing intelligence, market position, hiring signals, and recommended actions — all in a single structured document.

**Acceptance Scenarios**:

1. **Given** a user enters a competitor name for a full report, **When** submitted, **Then** the system runs all three intelligence modules and returns a unified structured report.
2. **Given** the report generation takes more than 10 seconds, **When** in progress, **Then** the user sees a real-time progress indicator showing which agent is currently working.
3. **Given** one data source fails (e.g., site blocks scraping), **When** generating the report, **Then** the system includes available data and notes which source was unavailable — it does not fail completely.

---

### Edge Cases

- What happens when a competitor site is in a foreign language? (System returns data as-is with a language note)
- What happens when the Bright Data API rate limit is hit? (System returns a clear "service temporarily unavailable" message, not a 500 error)
- What happens when a user enters a non-existent company name? (System returns "no data found" with a suggestion to try a different query)
- What happens if the AI agent times out mid-report? (System returns partial results gathered so far with a "partial report" label)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST accept a competitor URL or name as input and return structured intelligence data extracted from their public web presence.
- **FR-002**: System MUST use Bright Data Web Unlocker to bypass bot detection on competitor websites — direct scraping without Bright Data is prohibited.
- **FR-003**: System MUST accept a free-text search query and return structured search engine results from at least one major search engine.
- **FR-004**: System MUST use Bright Data SERP API for all search engine queries.
- **FR-005**: System MUST accept a company name or public URL and return an enriched company profile with at minimum: size indicator, industry, and recent news.
- **FR-006**: System MUST use Bright Data Web Scraper API for structured company data enrichment.
- **FR-007**: System MUST provide a report generation feature that combines competitor monitoring + market search + enrichment into one unified output.
- **FR-008**: System MUST show a progress indicator during report generation (which agent is running).
- **FR-009**: System MUST handle partial failures gracefully — if one data source fails, other sources' data MUST still be returned.
- **FR-010**: System MUST never expose API keys in any response, frontend code, or public repository.
- **FR-011**: All intelligence results MUST include a timestamp indicating when the data was collected.
- **FR-012**: System MUST provide a web dashboard where all four features are accessible without technical knowledge.

### Key Entities

- **CompetitorMonitorRequest**: URL or name input, optional focus areas (pricing/jobs/features)
- **CompetitorIntelligence**: Extracted data — pricing tiers, product claims, job count, page summary, timestamp
- **SearchQuery**: Free-text query string, optional date filter, optional source filter
- **SearchResult**: Title, URL, snippet, source date, relevance signal
- **LeadEnrichmentRequest**: Company name or public URL
- **CompanyProfile**: Name, size range, industry, HQ, recent news items, tech signals
- **IntelligenceReport**: Compiled output containing all three intelligence types + AI-generated summary + recommended actions

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can submit a competitor monitoring request and receive structured intelligence data within 30 seconds for 90% of requests.
- **SC-002**: A user can search for market signals and receive at least 5 structured results within 15 seconds.
- **SC-003**: Lead enrichment returns a company profile with at least 4 populated fields for any Fortune 500 company.
- **SC-004**: Full intelligence report generation completes within 90 seconds for 80% of requests.
- **SC-005**: The system handles bot-protected sites successfully for at least 85% of tested competitor URLs (validated with known bot-protected sites).
- **SC-006**: Zero API keys or credentials appear in any HTTP response, frontend bundle, or git commit.
- **SC-007**: All four features are accessible from a single web dashboard without requiring any technical setup from the end user.
- **SC-008**: Partial failures do not crash the system — partial results are returned with clear labeling for at least 95% of partial-failure scenarios.
