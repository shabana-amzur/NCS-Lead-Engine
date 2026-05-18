# AI Search and Scoring Logic

## Search Strategy

The engine should not rely on one keyword. It should create many intent-focused search patterns for each service.

## Service Intent Templates

### Database Migration

- `"database migration" "UK" "consultant"`
- `"Oracle database migration" "looking for"`
- `"SQL Server migration" "support needed"`
- `"legacy database migration" "cloud"`
- `"database migration tender" "UK"`

### Emergency Database Support

- `"urgent DBA support" "UK"`
- `"emergency database support" "SQL Server"`
- `"Oracle DBA support" "24/7"`
- `"database performance issue" "consultant"`

### Cloud Migration

- `"Azure migration partner" "UK"`
- `"cloud migration consultant" "London"`
- `"migrate to Azure" "business"`
- `"cloud modernisation" "tender"`

### Power BI and Analytics

- `"Power BI consultant" "UK"`
- `"business intelligence consultant" "needed"`
- `"Power BI dashboard" "company"`
- `"data reporting project" "tender"`

### Data Maturity Assessment

- `"data maturity assessment" "UK"`
- `"data strategy consultant" "business"`
- `"data maturity model" "company"`
- `"improve data governance" "consultant"`

### Oracle Fusion ERP

- `"Oracle Fusion consultant" "UK"`
- `"Oracle Fusion ERP implementation"`
- `"Oracle ERP support" "company"`
- `"Oracle Fusion migration" "partner"`

### Salesforce Consulting

- `"Salesforce consultant" "UK"`
- `"Salesforce implementation partner"`
- `"Salesforce integration" "business"`
- `"Salesforce automation" "consultant"`

## Source Type Signals

### High-Intent Sources

- Public tenders
- Procurement notices
- Request-for-proposal pages
- Job postings for urgent migration or data roles
- Company pages announcing transformation projects
- News about system outages, security incidents, or digital transformation

### Medium-Intent Sources

- Blog posts discussing a relevant problem
- Hiring for long-term cloud/data roles
- Partner ecosystem announcements
- Technology migration case studies

### Low-Intent Sources

- Generic directory listings
- Broad company descriptions
- Old articles
- Weak keyword matches without a clear problem

## AI Classification Prompt

Use this prompt shape for classifying a signal:

```text
You are qualifying B2B sales leads for NCS London, a UK business transformation company offering database, cloud, data engineering, Oracle, Microsoft, Salesforce, security, AI, and automation services.

Given the source title, snippet, URL, extracted page text, and company details, decide:

1. Is this a real company-level buying-intent signal?
2. Which NCS service is the best fit?
3. What is the urgency?
4. What is the lead score from 0 to 100?
5. What evidence supports the score?
6. Which decision-maker roles should sales approach?

Return JSON only.
```

## Lead Score Formula

Suggested total: 100 points.

| Factor | Max Points | Description |
|---|---:|---|
| Service fit | 30 | How closely the signal matches an NCS service |
| Intent strength | 25 | Whether the company appears to need help now |
| Recency | 15 | How recent the signal is |
| UK relevance | 10 | Whether the company or project is UK-relevant |
| Company fit | 10 | Whether the company likely fits NCS target customers |
| Contactability | 10 | Whether public business contact paths are available |

## Score Bands

- 85-100: Hot lead
- 70-84: Strong lead
- 50-69: Nurture lead
- 30-49: Weak lead
- 0-29: Reject or archive

## Example Output

```json
{
  "is_qualified": true,
  "company_name": "Example Manufacturing Ltd",
  "service_category": "Cloud Migration",
  "urgency": "high",
  "lead_score": 86,
  "intent_signal": "Company is hiring an Azure migration contractor for a legacy infrastructure migration.",
  "score_explanation": "Strong cloud migration fit, recent hiring signal, UK location, and clear project language.",
  "recommended_roles": ["CTO", "IT Director", "Head of Infrastructure"],
  "outreach_angle": "Offer NCS support for Azure migration planning, delivery, and security review."
}
```

## Outreach Draft Rules

The AI should:

- Reference the public signal lightly.
- Avoid sounding invasive.
- Mention one relevant NCS service.
- Keep the first email under 120 words.
- Include a clear call to action.
- Avoid unsupported claims about the company.

Example:

```text
Hi {{first_name}},

I noticed {{company}} appears to be investing in {{signal_area}}. NCS London helps UK businesses with {{service}}, especially where teams need practical delivery support without slowing day-to-day operations.

Would it be useful to compare notes on your current priorities and where outside support could reduce delivery risk?

Best,
{{sender_name}}
```

