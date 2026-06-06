const SERVICE_RULES = {
  "Cloud Migration": {
    queries: [
      '"cloud migration" "United Kingdom" ("tender" OR "procurement" OR "RFP")',
      '"Azure migration" "UK" ("hiring" OR "required" OR "consultant")',
      '"legacy infrastructure" "cloud migration" "UK" ("project" OR "programme")'
    ],
    serviceTerms: ["cloud migration", "azure migration", "legacy infrastructure", "cloud modernisation", "migrate to azure"],
    roles: ["CTO", "IT Director", "Head of Infrastructure"],
    ncsValue: "NCS can help assess the current estate, plan the migration path, reduce delivery risk, and provide practical Azure/cloud migration support across architecture, security, and managed operations.",
    baseScore: 52
  },
  "Database Management": {
    queries: [
      '"SQL Server" "UK" ("database support" OR "DBA" OR "performance issue")',
      '"database disaster recovery" "United Kingdom" ("tender" OR "support" OR "consultant")',
      '"Oracle DBA" "UK" ("urgent" OR "required" OR "support")'
    ],
    serviceTerms: ["sql server", "database support", "dba", "disaster recovery", "database performance", "oracle dba"],
    roles: ["IT Director", "Database Manager", "Head of Data"],
    ncsValue: "NCS can support database health checks, performance tuning, DBA support, high availability, disaster recovery readiness, and managed database operations for SQL Server and Oracle environments.",
    baseScore: 54
  },
  "Power BI and Analytics": {
    queries: [
      '"Power BI consultant" "UK" ("required" OR "hiring" OR "tender")',
      '"business intelligence" "UK" ("dashboard" OR "reporting project" OR "consultant")',
      '"Power BI" "United Kingdom" ("implementation" OR "reporting transformation")'
    ],
    serviceTerms: ["power bi", "business intelligence", "dashboard", "reporting", "analytics"],
    roles: ["Head of Data", "BI Manager", "Operations Director"],
    ncsValue: "NCS can help design reliable Power BI dashboards, improve reporting data models, integrate source systems, and turn operational data into decision-ready insight.",
    baseScore: 50
  },
  "Data Maturity Assessment": {
    queries: [
      '"data maturity assessment" "UK" ("consultant" OR "review" OR "tender")',
      '"data governance" "United Kingdom" ("review" OR "programme" OR "consultant")',
      '"data strategy" "UK" ("assessment" OR "maturity" OR "governance")'
    ],
    serviceTerms: ["data maturity", "data governance", "data strategy", "assessment", "data quality"],
    roles: ["Chief Data Officer", "Head of Data", "Operations Director"],
    ncsValue: "NCS can run a data maturity assessment, identify governance and quality gaps, create a practical improvement roadmap, and help teams move from assessment into delivery.",
    baseScore: 50
  },
  "Oracle Fusion ERP": {
    queries: [
      '"Oracle Fusion ERP" "UK" ("implementation" OR "support" OR "consultant")',
      '"Oracle Fusion" "United Kingdom" ("integration" OR "migration" OR "partner")',
      '"Oracle ERP" "UK" ("tender" OR "procurement" OR "support required")'
    ],
    serviceTerms: ["oracle fusion", "oracle erp", "erp implementation", "erp support", "oracle integration"],
    roles: ["CFO", "ERP Programme Manager", "IT Director"],
    ncsValue: "NCS can support Oracle Fusion ERP implementation, integration, stabilisation, reporting, and operational support across finance and business systems.",
    baseScore: 52
  }
};

const DEFAULT_SERVICE = "Cloud Migration";
const INTENT_TERMS = [
  "tender",
  "procurement",
  "rfp",
  "request for proposal",
  "required",
  "requirement",
  "seeking",
  "looking for",
  "hiring",
  "vacancy",
  "consultant",
  "support",
  "implementation",
  "migration",
  "modernisation",
  "transformation",
  "review",
  "assessment",
  "programme",
  "project",
  "partner",
  "urgent",
  "issue",
  "problem",
  "outage",
  "performance"
];

const STRONG_INTENT_TERMS = [
  "tender",
  "procurement",
  "rfp",
  "request for proposal",
  "support required",
  "urgent",
  "hiring",
  "seeking",
  "looking for",
  "consultant required",
  "implementation partner"
];

const WEAK_RESULT_TERMS = [
  "what is",
  "guide",
  "tutorial",
  "training course",
  "certification",
  "salary",
  "template",
  "definition"
];

const WEAK_DOMAINS = [
  "wikipedia.org",
  "youtube.com",
  "amazon.",
  "udemy.com",
  "coursera.org",
  "techtarget.com",
  "gartner.com"
];

function getServiceConfig(serviceName) {
  return SERVICE_RULES[serviceName] || SERVICE_RULES[DEFAULT_SERVICE];
}

function getRequestedServices(serviceName) {
  if (serviceName === "all") {
    return Object.keys(SERVICE_RULES);
  }

  return SERVICE_RULES[serviceName] ? [serviceName] : [DEFAULT_SERVICE];
}

function includesAny(haystack, terms) {
  return terms.some((term) => haystack.includes(term));
}

function matchedTerms(haystack, terms) {
  return terms.filter((term) => haystack.includes(term));
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown-source";
  }
}

function titleToCompany(title, domain) {
  const cleanTitle = title
    .replace(/\s[-|:]\s.*/, "")
    .replace(/\b(careers|jobs|vacancies|tenders|procurement)\b.*/i, "")
    .trim();

  if (cleanTitle && cleanTitle.length >= 3 && cleanTitle.length <= 70) {
    return cleanTitle;
  }

  return domain
    .split(".")[0]
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourceTypeFromUrl(url, title, content) {
  const haystack = `${url} ${title} ${content}`.toLowerCase();
  if (haystack.includes("tender") || haystack.includes("procurement") || haystack.includes("rfp")) return "Tender";
  if (haystack.includes("jobs") || haystack.includes("careers") || haystack.includes("hiring") || haystack.includes("vacancy")) return "Job Post";
  if (haystack.includes("news") || haystack.includes("press") || haystack.includes("announced")) return "Company News";
  return "Public Intent";
}

function qualifyResult(result, config) {
  const domain = getDomain(result.url);
  const haystack = `${domain} ${result.title || ""} ${result.content || ""}`.toLowerCase();
  const serviceMatches = matchedTerms(haystack, config.serviceTerms);
  const intentMatches = matchedTerms(haystack, INTENT_TERMS);
  const strongMatches = matchedTerms(haystack, STRONG_INTENT_TERMS);
  const weakMatch = includesAny(haystack, WEAK_RESULT_TERMS) || WEAK_DOMAINS.some((weakDomain) => domain.includes(weakDomain));

  if (weakMatch) {
    return null;
  }

  if (serviceMatches.length === 0 || intentMatches.length === 0) {
    return null;
  }

  const intentScore = Math.min(20, intentMatches.length * 4 + strongMatches.length * 5);
  const serviceScore = Math.min(15, serviceMatches.length * 5);
  const sourceBonus = sourceTypeFromUrl(result.url, result.title || "", result.content || "") === "Tender" ? 12 : 0;
  const tavilyScore = typeof result.score === "number" ? Math.round(result.score * 8) : 0;
  const leadScore = Math.min(96, config.baseScore + intentScore + serviceScore + sourceBonus + tavilyScore);

  if (leadScore < 68) {
    return null;
  }

  return {
    leadScore,
    serviceMatches,
    intentMatches,
    strongMatches
  };
}

function buildNeedStatement(serviceName, sourceType, intentMatches, content) {
  const signal = intentMatches.slice(0, 3).join(", ");
  const trimmedContent = content.length > 260 ? `${content.slice(0, 257)}...` : content;
  return `Need detected for ${serviceName}: ${sourceType.toLowerCase()} signal includes ${signal}. Evidence summary: ${trimmedContent}`;
}

function buildLeadType(sourceType, leadScore) {
  if (sourceType === "Tender") return "Tender / procurement opportunity";
  if (sourceType === "Job Post") return "Hiring signal / capability gap";
  if (sourceType === "Company News") return "Transformation or change signal";
  if (leadScore >= 85) return "High-intent public web signal";
  return "Potential public intent signal";
}

function buildRequirement(serviceName, sourceType, intentMatches, content) {
  const evidenceSummary = content.length > 320 ? `${content.slice(0, 317)}...` : content;
  const matchedIntent = intentMatches.slice(0, 4).join(", ");

  return `The source suggests a possible need for ${serviceName.toLowerCase()} support. The signal type is ${sourceType.toLowerCase()}, with buying-intent terms such as ${matchedIntent}. Evidence summary: ${evidenceSummary}`;
}

function buildApproachPlan(companyName, serviceName, sourceType, roles) {
  const primaryRoles = roles.slice(0, 2).join(" or ");

  return [
    `Verify the source first and confirm whether ${companyName} is the end customer, buyer, or publishing platform.`,
    `Approach ${primaryRoles || "the relevant technology decision-maker"} with a short message referencing the public ${sourceType.toLowerCase()} signal.`,
    `Lead with a practical offer: a 20-minute discovery call, quick risk review, or service-fit assessment for ${serviceName.toLowerCase()}.`,
    "Avoid over-claiming. Position NCS as a delivery partner that can reduce risk, fill capability gaps, and support the project team."
  ];
}

function buildLead(result, serviceName, config, qualification) {
  const domain = getDomain(result.url);
  const title = result.title || domain;
  const content = result.content || "Relevant public search result found for this service area.";
  const sourceType = sourceTypeFromUrl(result.url, title, content);
  const companyName = titleToCompany(title, domain);
  const leadType = buildLeadType(sourceType, qualification.leadScore);
  const requirement = buildRequirement(serviceName, sourceType, qualification.intentMatches, content);
  const ncsFit = config.ncsValue;
  const approachPlan = buildApproachPlan(companyName, serviceName, sourceType, config.roles);

  return {
    company_name: companyName,
    website: `https://${domain}`,
    location: "United Kingdom",
    industry: "To verify",
    company_size_estimate: "To verify",
    service_category: serviceName,
    lead_type: leadType,
    urgency: qualification.leadScore >= 85 ? "high" : "medium",
    lead_score: qualification.leadScore,
    requirement,
    ncs_fit: ncsFit,
    approach_plan: approachPlan,
    intent_signal: buildNeedStatement(serviceName, sourceType, qualification.intentMatches, content),
    score_explanation: `Qualified because the source contains service terms (${qualification.serviceMatches.join(", ")}) and buying-intent terms (${qualification.intentMatches.slice(0, 5).join(", ")}).`,
    recommended_roles: config.roles,
    source_type: sourceType,
    source_url: result.url,
    is_demo_source: false,
    outreach_draft: `Hi, I noticed a public ${sourceType.toLowerCase()} signal that suggests ${companyName} may need support with ${serviceName.toLowerCase()}. NCS London helps UK businesses deliver this work with practical consulting and managed support. Would it be useful to compare priorities and see where outside expertise could reduce delivery risk?`
  };
}

async function runTavilySearch(apiKey, query) {
  const tavilyResponse = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      query,
      search_depth: "basic",
      topic: "general",
      country: "united kingdom",
      include_answer: false,
      include_raw_content: false,
      include_images: false,
      max_results: 8
    })
  });

  const data = await tavilyResponse.json();

  if (!tavilyResponse.ok) {
    const error = new Error(data?.error || data?.message || "Tavily search failed.");
    error.status = tavilyResponse.status;
    error.details = data;
    throw error;
  }

  return data.results || [];
}

async function searchService(apiKey, serviceName, customQuery, compact = false) {
  const config = getServiceConfig(serviceName);
  const queries = customQuery
    ? [customQuery]
    : compact
      ? config.queries.slice(0, 2)
      : config.queries;
  const resultGroups = await Promise.all(queries.map((query) => runTavilySearch(apiKey, query)));
  const resultsByUrl = new Map();

  resultGroups.flat().forEach((result) => {
    if (result.url && !resultsByUrl.has(result.url)) {
      resultsByUrl.set(result.url, result);
    }
  });

  const leads = [...resultsByUrl.values()]
    .map((result) => {
      const qualification = qualifyResult(result, config);
      return qualification ? buildLead(result, serviceName, config, qualification) : null;
    })
    .filter(Boolean);

  return { serviceName, queries, leads };
}

export default async function handler(request, response) {
  if (request.method !== "GET") {
    response.setHeader("Allow", "GET");
    return response.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return response.status(500).json({
      error: "Missing TAVILY_API_KEY environment variable."
    });
  }

  const serviceName = String(request.query.service || "all");
  const customQuery = request.query.query ? String(request.query.query) : "";
  const requestedServices = getRequestedServices(serviceName);
  const compactSearch = requestedServices.length > 1;

  try {
    const serviceSearches = await Promise.all(
      requestedServices.map((name) => searchService(apiKey, name, customQuery, compactSearch))
    );
    const queries = serviceSearches.flatMap((search) => search.queries);
    const leadsByUrlAndService = new Map();

    serviceSearches.flatMap((search) => search.leads).forEach((lead) => {
      const key = `${lead.service_category}:${lead.source_url}`;
      const current = leadsByUrlAndService.get(key);
      if (!current || lead.lead_score > current.lead_score) {
        leadsByUrlAndService.set(key, lead);
      }
    });

    const leads = [...leadsByUrlAndService.values()]
      .sort((a, b) => b.lead_score - a.lead_score)
      .slice(0, requestedServices.length > 1 ? 25 : 10);

    return response.status(200).json({
      queries,
      provider: "tavily",
      qualification_mode: "buying_intent_only",
      services: requestedServices,
      leads
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      error: error.message || "Unable to complete live search.",
      details: error.details || null
    });
  }
}
