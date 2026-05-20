# NCS AI Lead Generation Engine

This workspace contains the product and technical blueprint for an AI-powered B2B lead generation engine for NCS London.

The engine is designed to discover public buying-intent signals from companies that may need NCS services, enrich those companies with compliant business information, score them, and prepare qualified leads for sales outreach.

## Business Goal

Help NCS London find UK businesses that are actively showing public demand for:

- Database migration and administration
- Emergency database support
- Database disaster recovery
- Cloud strategy, migration, modernisation, and security
- Oracle, Microsoft SQL, Azure, Salesforce, and Elastic services
- Power BI, business intelligence, analytics, and reporting
- Data engineering and data integration
- Data maturity assessment
- AI and business automation

## MVP Deliverables

- Deep search query generator based on NCS services
- Public web, news, job, tender, and company-signal search
- Lead deduplication and source logging
- AI-powered lead classification and scoring
- Company profile enrichment
- Decision-maker role recommendations
- Outreach message drafts
- CSV export and future CRM integration
- Compliance controls for GDPR-friendly B2B lead generation

## Working Prototype

This workspace now includes a dependency-free MVP prototype.

### Open The Front Page

Open this file in a browser:

```text
app/index.html
```

The page includes:

- Lead dashboard
- Service filter
- Lead scoring cards
- Evidence/source panel
- Decision-maker role recommendations
- Outreach draft
- Browser-side CSV export

The included leads are demo records. Their source URLs use reserved `.example` domains and are shown as non-clickable placeholders in the UI. Real clickable evidence links require connecting a live search provider.

### Run The Prototype Engine

Generate sample qualified leads:

```bash
python3 engine/lead_engine.py
```

Export scored leads to CSV:

```bash
python3 engine/lead_engine.py --export
```

Print generated search queries:

```bash
python3 engine/lead_engine.py --queries
```

The exported file is written to:

```text
outputs/qualified_leads.csv
```

### Deploy On Vercel

This is a static app, not a Next.js app. The included `vercel.json` tells Vercel to skip `next build` and deploy the `app/` folder directly.

### Connect Live Tavily Search

The dashboard can call a Vercel serverless function at:

```text
/api/search-leads
```

To enable live search:

1. Create a Tavily account and API key.
2. In Vercel, open the project settings.
3. Go to **Environment Variables**.
4. Add:

```text
TAVILY_API_KEY=your_tavily_key
```

5. Redeploy the project.
6. Open the dashboard and click the refresh button.

The API key is used only on the backend function and is not exposed in browser JavaScript.

The live search endpoint is intentionally strict. It filters out generic articles, tutorials, and broad informational pages, and only returns results that include both:

- A match to an NCS service area
- Public buying-intent language such as tender, procurement, hiring, support required, implementation, migration project, review, assessment, or urgent issue

## Documentation

- [Product Requirements](./docs/product-requirements.md)
- [System Architecture](./docs/system-architecture.md)
- [Database Schema](./docs/database-schema.sql)
- [AI Search and Scoring Logic](./docs/ai-search-and-scoring.md)
- [MVP Roadmap](./docs/mvp-roadmap.md)

## Compliance Position

This engine should detect public company-level buying intent. It should not claim to identify private individuals who searched the internet for a service unless those people explicitly submit a form, interact with NCS properties under proper consent, or appear in lawful public business contexts.

Recommended default: collect company-level signals, public source links, business contact channels, and role-based decision-maker recommendations.
