const SERVICE_RULES = {
  "Cloud Migration": {
    queries: [
      '"cloud migration" "United Kingdom" ("tender" OR "procurement" OR "RFP")',
      '"Azure migration" "UK" ("hiring" OR "required" OR "consultant")',
      '"cloud migration" ("looking for" OR "need" OR "recommend") site:linkedin.com/posts "UK"',
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
      '"database support" ("looking for" OR "need" OR "recommend") site:linkedin.com/posts "UK"',
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
      '"Power BI" ("looking for" OR "need" OR "recommend") site:linkedin.com/posts "UK"',
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
      '"data governance" ("looking for" OR "need" OR "recommend") site:linkedin.com/posts "UK"',
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
      '"Oracle Fusion" ("looking for" OR "need" OR "recommend") site:linkedin.com/posts "UK"',
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
const MARKET_RULES = {
  all: {
    label: "UK + UAE",
    querySuffix: '("United Kingdom" OR "UK" OR "London" OR "Manchester" OR "Birmingham" OR "United Arab Emirates" OR "UAE" OR "Dubai" OR "Abu Dhabi" OR "Sharjah")',
    country: ""
  },
  uk: {
    label: "United Kingdom",
    querySuffix: '("United Kingdom" OR "UK" OR "London" OR "Manchester" OR "Birmingham")',
    country: "united kingdom"
  },
  uae: {
    label: "United Arab Emirates",
    querySuffix: '("United Arab Emirates" OR "UAE" OR "Dubai" OR "Abu Dhabi" OR "Sharjah")',
    country: "united arab emirates"
  }
};

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

const GENERIC_TITLE_TERMS = [
  "contract",
  "tender",
  "rfp",
  "request for proposal",
  "job",
  "vacancy",
  "developer",
  "consultant",
  "partner",
  "bids",
  "government contracts",
  "eprocurement"
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

function getMarketConfig(market) {
  return MARKET_RULES[market] || MARKET_RULES.all;
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
  const lowerTitle = title.toLowerCase();
  const isGenericTitle = GENERIC_TITLE_TERMS.some((term) => lowerTitle.includes(term));
  const isAggregator = [
    "tenders",
    "bid",
    "jobs",
    "indeed",
    "linkedin",
    "reed",
    "totaljobs",
    "contract"
  ].some((term) => domain.includes(term));

  if (isGenericTitle || isAggregator) {
    return `${domain} (buyer to verify)`;
  }

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
  if (haystack.includes("linkedin.com")) return "LinkedIn Signal";
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

function cleanSnippet(content) {
  return String(content || "")
    .replace(/\*\*/g, "")
    .replace(/\\\*/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function extractDeadline(text) {
  const cleanText = cleanSnippet(text);
  const deadlinePatterns = [
    /\b(?:deadline|closing date|closes|closing|apply by|submission deadline|bid deadline|tender closes)[:\s-]*([A-Z][a-z]+ \d{1,2},? \d{4})/i,
    /\b(?:deadline|closing date|closes|closing|apply by|submission deadline|bid deadline|tender closes)[:\s-]*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})/i,
    /\b(?:deadline|closing date|closes|closing|apply by|submission deadline|bid deadline|tender closes)[:\s-]*(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})/i,
    /\b(\d{1,2}\s+[A-Z][a-z]+\s+\d{4})\b/,
    /\b([A-Z][a-z]+ \d{1,2},? \d{4})\b/
  ];

  for (const pattern of deadlinePatterns) {
    const match = cleanText.match(pattern);
    if (match?.[1]) {
      return match[1].replace(/\s+/g, " ").trim();
    }
  }

  return "No deadline found in source snippet";
}

function buildNeedStatement(serviceName, sourceType, intentMatches, content) {
  const signal = intentMatches.slice(0, 3).join(", ");
  return `Need detected for ${serviceName}: ${sourceType.toLowerCase()} signal includes ${signal}.`;
}

function buildLeadType(sourceType, leadScore) {
  if (sourceType === "Tender") return "Tender / procurement opportunity";
  if (sourceType === "Job Post") return "Hiring signal / capability gap";
  if (sourceType === "LinkedIn Signal") return "LinkedIn public-post signal";
  if (sourceType === "Company News") return "Transformation or change signal";
  if (leadScore >= 85) return "High-intent public web signal";
  return "Potential public intent signal";
}

function buildRequirement(serviceName, sourceType, intentMatches, content) {
  const cleanContent = cleanSnippet(content);
  const sourceDetail = cleanContent.length > 420 ? `${cleanContent.slice(0, 417)}...` : cleanContent;
  const matchedIntent = intentMatches.slice(0, 4).join(", ");

  if (sourceType === "Tender") {
    return `This appears to be a procurement opportunity for ${serviceName.toLowerCase()}. The source includes buying-intent terms such as ${matchedIntent}, which suggests an active requirement rather than general research. Review the tender page to confirm buyer name, scope, eligibility, submission steps, and commercial deadline. Source context: ${sourceDetail}`;
  }

  if (sourceType === "Job Post") {
    return `This appears to be a hiring signal connected to ${serviceName.toLowerCase()}. The organisation may be trying to fill an internal skills gap, deliver a project, or increase technical capacity. NCS can approach this as a support or delivery augmentation opportunity rather than only a recruitment signal. Source context: ${sourceDetail}`;
  }

  if (sourceType === "LinkedIn Signal") {
    return `This appears to be a public LinkedIn signal related to ${serviceName.toLowerCase()}. The post may indicate someone asking for recommendations, looking for a provider, discussing an active project, or highlighting a capability gap. Review the LinkedIn post before outreach to identify the person, company, and exact ask. Source context: ${sourceDetail}`;
  }

  return `This source suggests a possible requirement for ${serviceName.toLowerCase()} based on terms such as ${matchedIntent}. Treat it as a lead to verify: confirm the buyer, current project status, decision-maker, and whether NCS can help with advisory, delivery, or managed support. Source context: ${sourceDetail}`;
}

function buildApproachPlan(companyName, serviceName, sourceType, roles, deadline) {
  const primaryRoles = roles.slice(0, 2).join(" or ");
  const urgencyStep = deadline === "No deadline found in source snippet"
    ? "No deadline was visible in the search snippet, so check the evidence page first and prioritise if a closing date is listed there."
    : `Prioritise this lead quickly because the source appears to mention this deadline/date: ${deadline}.`;

  return [
    `Verify the source first and confirm whether ${companyName} is the end customer, buyer, or publishing platform.`,
    urgencyStep,
    `Approach ${primaryRoles || "the relevant technology decision-maker"} with a short message referencing the public ${sourceType.toLowerCase()} signal.`,
    `Lead with a practical offer: a 20-minute discovery call, quick risk review, or service-fit assessment for ${serviceName.toLowerCase()}.`,
    "Avoid over-claiming. Position NCS as a delivery partner that can reduce risk, fill capability gaps, and support the project team."
  ];
}

function buildLead(result, serviceName, config, qualification, marketLabel) {
  const domain = getDomain(result.url);
  const title = result.title || domain;
  const content = result.content || "Relevant public search result found for this service area.";
  const sourceType = sourceTypeFromUrl(result.url, title, content);
  const companyName = titleToCompany(title, domain);
  const deadline = extractDeadline(`${title}. ${content}`);
  const leadType = buildLeadType(sourceType, qualification.leadScore);
  const requirement = buildRequirement(serviceName, sourceType, qualification.intentMatches, content);
  const ncsFit = config.ncsValue;
  const approachPlan = buildApproachPlan(companyName, serviceName, sourceType, config.roles, deadline);

  return {
    company_name: companyName,
    buyer_company: companyName,
    website: `https://${domain}`,
    location: marketLabel,
    industry: "To verify",
    company_size_estimate: "To verify",
    service_category: serviceName,
    lead_type: leadType,
    urgency: qualification.leadScore >= 85 ? "high" : "medium",
    lead_score: qualification.leadScore,
    deadline,
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

async function runTavilySearch(apiKey, query, marketConfig) {
  const body = {
    query: `${query} ${marketConfig.querySuffix}`,
    search_depth: "basic",
    topic: "general",
    include_answer: false,
    include_raw_content: false,
    include_images: false,
    max_results: 8
  };

  if (marketConfig.country) {
    body.country = marketConfig.country;
  }

  const tavilyResponse = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
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

async function searchService(apiKey, serviceName, customQuery, marketConfig, compact = false) {
  const config = getServiceConfig(serviceName);
  const queries = customQuery
    ? [customQuery]
    : compact
      ? config.queries.slice(0, 2)
      : config.queries;
  const resultGroups = await Promise.all(queries.map((query) => runTavilySearch(apiKey, query, marketConfig)));
  const resultsByUrl = new Map();

  resultGroups.flat().forEach((result) => {
    if (result.url && !resultsByUrl.has(result.url)) {
      resultsByUrl.set(result.url, result);
    }
  });

  const leads = [...resultsByUrl.values()]
    .map((result) => {
      const qualification = qualifyResult(result, config);
      return qualification ? buildLead(result, serviceName, config, qualification, marketConfig.label) : null;
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
  const market = String(request.query.market || "all");
  const customQuery = request.query.query ? String(request.query.query) : "";
  const requestedServices = getRequestedServices(serviceName);
  const marketConfig = getMarketConfig(market);
  const compactSearch = requestedServices.length > 1;

  try {
    const serviceSearches = await Promise.all(
      requestedServices.map((name) => searchService(apiKey, name, customQuery, marketConfig, compactSearch))
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
      market: marketConfig.label,
      leads
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      error: error.message || "Unable to complete live search.",
      details: error.details || null
    });
  }
}
