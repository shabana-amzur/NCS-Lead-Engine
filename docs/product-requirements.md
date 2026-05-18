# Product Requirements

## Product Name

NCS AI Lead Generation Engine

## Objective

Create a deep-search lead generation engine that discovers companies showing public buying intent for NCS London services, qualifies them using AI, and provides sales-ready lead records with source evidence.

## Target Users

- NCS sales team
- Business development managers
- Marketing team
- Account executives
- Leadership team reviewing pipeline quality

## Services To Track

The engine should track demand for the following NCS service areas:

- Managed services
- Security and vulnerability management
- Database management
- Licensing
- Oracle Fusion ERP
- Database migration
- Database administration
- Emergency database support
- Database disaster recovery
- Data maturity assessment
- Cloud strategy
- Cloud migration and modernisation
- Cloud security
- Advanced analysis and reporting
- Business intelligence
- Data integration
- Microsoft Power BI
- Artificial intelligence
- Business automation
- Salesforce consulting
- Elastic Cloud services

## Lead Sources

The MVP should search and process:

- Public web search results
- Company websites and press releases
- Job postings
- Public tenders and procurement notices
- News articles
- Technology partner pages
- Public directories
- Public LinkedIn/company pages where lawful and technically available
- NCS website form submissions, once integrated

## Core User Stories

### Search

As a sales user, I want the engine to search the web for companies showing service demand so that I can identify prospects before competitors do.

Acceptance criteria:

- Search can run by service area.
- Search can run by geography, with UK as the default.
- Search stores every source URL used as evidence.
- Search avoids duplicate leads from repeated sources.

### Qualification

As a sales user, I want every lead scored so that I can focus on the most relevant opportunities.

Acceptance criteria:

- Each lead has a score from 0 to 100.
- Each score includes a plain-English explanation.
- The system identifies the best-fit NCS service.
- The system labels urgency as low, medium, high, or critical.

### Enrichment

As a sales user, I want each company enriched with useful public business information.

Acceptance criteria:

- The lead record includes company website, location, industry, and company size estimate when available.
- The lead record recommends likely decision-maker roles.
- The lead record includes public contact channels where available.
- The lead record stores source links and timestamps.

### Outreach

As a sales user, I want AI-generated outreach drafts that reference the signal and NCS service fit.

Acceptance criteria:

- Outreach drafts are generated only from stored evidence.
- Drafts are concise and professional.
- Drafts include a service-specific value proposition.
- Drafts avoid unsupported claims.

### Export

As a sales user, I want to export qualified leads.

Acceptance criteria:

- Export to CSV is available in MVP.
- Future integrations should support HubSpot, Salesforce, Zoho, or Pipedrive.
- Export includes score, source, service fit, and outreach draft.

## Lead Record

Each lead should include:

- Company name
- Company website
- Company location
- Industry
- Company size estimate
- Service category
- Intent signal
- Intent source URL
- Intent source type
- Lead score
- Score explanation
- Urgency
- Recommended decision-maker roles
- Public contact page
- Public business email, if found lawfully
- LinkedIn company URL, if found lawfully
- Outreach draft
- Created date
- Last refreshed date

## Compliance Requirements

- Store source URLs for every lead.
- Avoid collecting sensitive personal data.
- Avoid private scraping or bypassing access controls.
- Respect robots.txt and website terms where applicable.
- Maintain suppression lists for companies or contacts that should not be contacted.
- Include unsubscribe or opt-out handling for outbound workflows.
- Separate public company intelligence from personal contact data.
- Log the lawful basis and source type for each contact data point.

## Non-Goals For MVP

- Real-time identification of individual searchers on Google or other search engines.
- Private social-media scraping.
- Bypassing login walls or paid access controls.
- Automated email sending without human review.
- Fully autonomous prospecting without compliance checks.

