#!/usr/bin/env python3
"""
Dependency-free prototype for the NCS AI Lead Generation Engine.

This first version uses sample public-intent signals. Replace load_sample_signals()
with a search API connector once API keys are available.
"""

from __future__ import annotations

import argparse
import csv
import json
from dataclasses import dataclass, asdict
from datetime import date, datetime
from pathlib import Path
from typing import Iterable


ROOT = Path(__file__).resolve().parents[1]
DATA_PATH = ROOT / "data" / "sample_signals.json"
OUTPUT_PATH = ROOT / "outputs" / "qualified_leads.csv"


SERVICE_RULES = {
    "Cloud Migration": {
        "keywords": ["azure migration", "cloud migration", "legacy infrastructure", "migrate to azure", "modernisation"],
        "roles": ["CTO", "IT Director", "Head of Infrastructure"],
        "service_points": 30,
    },
    "Database Management": {
        "keywords": ["sql server", "database support", "dba", "performance", "disaster recovery", "high availability"],
        "roles": ["IT Director", "Database Manager", "Head of Data"],
        "service_points": 30,
    },
    "Power BI and Analytics": {
        "keywords": ["power bi", "business intelligence", "dashboard", "reporting", "analytics"],
        "roles": ["Head of Data", "BI Manager", "Operations Director"],
        "service_points": 28,
    },
    "Data Maturity Assessment": {
        "keywords": ["data maturity", "data governance", "data strategy", "compliance", "operational insight"],
        "roles": ["Chief Data Officer", "Head of Data", "Operations Director"],
        "service_points": 27,
    },
    "Oracle Fusion ERP": {
        "keywords": ["oracle fusion", "erp", "finance", "operations systems", "integration"],
        "roles": ["CFO", "ERP Programme Manager", "IT Director"],
        "service_points": 29,
    },
}

SOURCE_STRENGTH = {
    "tender": 25,
    "job_post": 21,
    "company_news": 18,
    "public_web": 15,
}


@dataclass
class QualifiedLead:
    company_name: str
    website: str
    location: str
    industry: str
    company_size_estimate: str
    service_category: str
    urgency: str
    lead_score: int
    intent_signal: str
    score_explanation: str
    recommended_roles: str
    source_type: str
    source_url: str
    outreach_draft: str


def load_sample_signals() -> list[dict]:
    return json.loads(DATA_PATH.read_text(encoding="utf-8"))


def generate_queries(region: str = "United Kingdom") -> list[str]:
    templates = [
        '"{keyword}" "{region}" "consultant"',
        '"{keyword}" "{region}" "support"',
        '"{keyword}" "{region}" "tender"',
        '"{keyword}" "{region}" "partner"',
    ]
    queries: list[str] = []
    for service in SERVICE_RULES.values():
        for keyword in service["keywords"][:3]:
            for template in templates:
                queries.append(template.format(keyword=keyword, region=region))
    return queries


def classify_service(signal: dict) -> tuple[str, int, list[str]]:
    haystack = f"{signal.get('title', '')} {signal.get('snippet', '')}".lower()
    best_service = "Managed Services"
    best_matches = 0
    best_points = 18
    best_roles = ["IT Director", "CTO", "Operations Director"]

    for service_name, rule in SERVICE_RULES.items():
        matches = sum(1 for keyword in rule["keywords"] if keyword in haystack)
        if matches > best_matches:
            best_service = service_name
            best_matches = matches
            best_points = int(rule["service_points"])
            best_roles = list(rule["roles"])

    return best_service, best_points, best_roles


def recency_points(published_at: str) -> int:
    try:
        published = datetime.strptime(published_at, "%Y-%m-%d").date()
    except ValueError:
        return 6

    age_days = (date.today() - published).days
    if age_days <= 7:
        return 15
    if age_days <= 21:
        return 12
    if age_days <= 60:
        return 8
    return 4


def score_signal(signal: dict) -> QualifiedLead:
    service, service_points, roles = classify_service(signal)
    source_points = SOURCE_STRENGTH.get(signal.get("source_type", ""), 10)
    recent_points = recency_points(signal.get("published_at", ""))
    uk_points = 10 if "united kingdom" in signal.get("location", "").lower() else 4
    company_fit_points = 8 if signal.get("company_size_estimate") else 5
    contactability_points = 8 if signal.get("website") else 3

    score = min(
        100,
        service_points + source_points + recent_points + uk_points + company_fit_points + contactability_points,
    )

    if score >= 85:
        urgency = "high"
    elif score >= 70:
        urgency = "medium"
    else:
        urgency = "low"

    signal_text = signal["snippet"].rstrip(".")
    outreach = (
        f"Hi, I noticed {signal['company_name']} appears to be working on "
        f"{service.lower()}. NCS London helps UK businesses deliver this kind "
        "of data and technology transformation with practical consulting, managed support, "
        "and delivery expertise. Would it be useful to compare priorities for the project?"
    )

    explanation = (
        f"{service} fit, {signal['source_type'].replace('_', ' ')} signal, "
        f"{signal.get('location', 'unknown location')}, and recent public evidence."
    )

    return QualifiedLead(
        company_name=signal["company_name"],
        website=signal.get("website", ""),
        location=signal.get("location", ""),
        industry=signal.get("industry", ""),
        company_size_estimate=signal.get("company_size_estimate", ""),
        service_category=service,
        urgency=urgency,
        lead_score=score,
        intent_signal=signal_text,
        score_explanation=explanation,
        recommended_roles=", ".join(roles),
        source_type=signal.get("source_type", ""),
        source_url=signal.get("source_url", ""),
        outreach_draft=outreach,
    )


def qualify_leads(signals: Iterable[dict]) -> list[QualifiedLead]:
    leads = [score_signal(signal) for signal in signals]
    return sorted(leads, key=lambda lead: lead.lead_score, reverse=True)


def export_csv(leads: list[QualifiedLead], path: Path = OUTPUT_PATH) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(asdict(leads[0]).keys()))
        writer.writeheader()
        for lead in leads:
            writer.writerow(asdict(lead))


def main() -> None:
    parser = argparse.ArgumentParser(description="Run the NCS lead engine prototype.")
    parser.add_argument("--queries", action="store_true", help="Print generated search queries.")
    parser.add_argument("--export", action="store_true", help="Export qualified sample leads to CSV.")
    args = parser.parse_args()

    if args.queries:
        for query in generate_queries():
            print(query)
        return

    leads = qualify_leads(load_sample_signals())

    if args.export:
        export_csv(leads)
        print(f"Exported {len(leads)} leads to {OUTPUT_PATH}")
        return

    print(json.dumps([asdict(lead) for lead in leads], indent=2))


if __name__ == "__main__":
    main()

