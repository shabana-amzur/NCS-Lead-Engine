# MVP Roadmap

## Phase 1: Blueprint and Setup

Duration: 1 week

Deliverables:

- Confirm target industries and ideal customer profile
- Finalise service categories
- Choose search provider
- Choose enrichment providers
- Confirm CRM target
- Confirm compliance review process

## Phase 2: Search Engine MVP

Duration: 2 weeks

Deliverables:

- Service keyword library
- Query generator
- Search job scheduler
- Raw signal storage
- Source URL deduplication
- Basic admin script to run searches

Success criteria:

- Engine can run service-specific searches.
- Engine stores source URLs and snippets.
- Duplicate URLs are filtered.

## Phase 3: AI Qualification

Duration: 2 weeks

Deliverables:

- Intent classifier
- Service matcher
- Lead scoring model
- Score explanation generator
- Outreach draft generator

Success criteria:

- At least 80% of reviewed leads are correctly classified by service.
- Sales users can understand why each lead was scored.

## Phase 4: Dashboard

Duration: 2 weeks

Deliverables:

- Lead list page
- Lead detail page
- Service and score filters
- Source evidence panel
- Lead status workflow
- CSV export
- Suppression list

Success criteria:

- Sales users can review and export leads without developer help.

## Phase 5: Enrichment and CRM

Duration: 2-3 weeks

Deliverables:

- Companies House lookup
- Company website enrichment
- Public contact page discovery
- CRM integration
- Audit log

Success criteria:

- Leads can be pushed into CRM with source evidence and service fit.

## Phase 6: Production Hardening

Duration: 2 weeks

Deliverables:

- Authentication
- Role-based access
- Error monitoring
- Rate limiting
- API key management
- Data retention policy
- Export audit trail

Success criteria:

- System is ready for controlled daily use by NCS sales and marketing.

## Suggested MVP Timeline

Total: 9-12 weeks.

Fast prototype: 3-4 weeks if the first version is command-line plus CSV export only.

## Team Needed

- 1 full-stack developer
- 1 backend/data engineer
- 1 AI engineer or AI-capable backend engineer
- 1 sales/compliance stakeholder from NCS

## First Build Recommendation

Start with a private internal MVP:

1. Search provider integration
2. PostgreSQL database
3. AI lead scoring
4. Simple dashboard
5. CSV export

Do CRM integration after sales users confirm the lead quality.

