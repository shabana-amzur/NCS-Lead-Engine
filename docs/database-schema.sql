-- PostgreSQL schema for the NCS AI Lead Generation Engine MVP.

CREATE TABLE service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_keywords (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_category_id UUID NOT NULL REFERENCES service_categories(id) ON DELETE CASCADE,
    keyword TEXT NOT NULL,
    keyword_type TEXT NOT NULL DEFAULT 'primary',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(service_category_id, keyword)
);

CREATE TABLE search_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_category_id UUID REFERENCES service_categories(id),
    region TEXT NOT NULL DEFAULT 'United Kingdom',
    source_type TEXT NOT NULL,
    query TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued',
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE raw_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_job_id UUID REFERENCES search_jobs(id) ON DELETE SET NULL,
    source_type TEXT NOT NULL,
    source_url TEXT NOT NULL,
    title TEXT,
    snippet TEXT,
    published_at TIMESTAMPTZ,
    discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    content_hash TEXT,
    processed_at TIMESTAMPTZ,
    UNIQUE(source_url)
);

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    website TEXT,
    domain TEXT,
    location TEXT,
    country TEXT,
    industry TEXT,
    company_size_estimate TEXT,
    linkedin_url TEXT,
    companies_house_number TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(domain)
);

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    service_category_id UUID REFERENCES service_categories(id),
    status TEXT NOT NULL DEFAULT 'new',
    urgency TEXT NOT NULL DEFAULT 'medium',
    lead_score INTEGER NOT NULL CHECK (lead_score >= 0 AND lead_score <= 100),
    score_explanation TEXT NOT NULL,
    intent_signal TEXT NOT NULL,
    recommended_roles TEXT[] NOT NULL DEFAULT '{}',
    contact_page_url TEXT,
    public_business_email TEXT,
    lawful_basis_note TEXT,
    outreach_draft TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    raw_signal_id UUID REFERENCES raw_signals(id) ON DELETE SET NULL,
    source_url TEXT NOT NULL,
    source_type TEXT NOT NULL,
    evidence_snippet TEXT,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE lead_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_note TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE suppression_list (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    suppression_type TEXT NOT NULL,
    value TEXT NOT NULL,
    reason TEXT,
    created_by TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(suppression_type, value)
);

CREATE INDEX idx_raw_signals_source_type ON raw_signals(source_type);
CREATE INDEX idx_raw_signals_discovered_at ON raw_signals(discovered_at);
CREATE INDEX idx_companies_name ON companies(name);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_leads_score ON leads(lead_score DESC);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_service ON leads(service_category_id);

