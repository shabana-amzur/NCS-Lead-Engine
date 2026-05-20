const SERVICE_RULES = {
  "Cloud Migration": {
    queries: [
      '"cloud migration" "United Kingdom" ("tender" OR "procurement" OR "RFP")',
      '"Azure migration" "UK" ("hiring" OR "required" OR "consultant")',
      '"legacy infrastructure" "cloud migration" "UK" ("project" OR "programme")'
    ],
    serviceTerms: ["cloud migration", "azure migration", "legacy infrastructure", "cloud modernisation", "migrate to azure"],
    roles: ["CTO", "IT Director", "Head of Infrastructure"],
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

function buildLead(result, serviceName, config, qualification) {
  const domain = getDomain(result.url);
  const title = result.title || domain;
  const content = result.content || "Relevant public search result found for this service area.";
  const sourceType = sourceTypeFromUrl(result.url, title, content);
  const companyName = titleToCompany(title, domain);

  return {
    company_name: companyName,
    website: `https://${domain}`,
    location: "United Kingdom",
    industry: "To verify",
    company_size_estimate: "To verify",
    service_category: serviceName,
    urgency: qualification.leadScore >= 85 ? "high" : "medium",
    lead_score: qualification.leadScore,
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

  const serviceName = String(request.query.service || DEFAULT_SERVICE);
  const config = getServiceConfig(serviceName);
  const queries = request.query.query ? [String(request.query.query)] : config.queries;

  try {
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
      .filter(Boolean)
      .sort((a, b) => b.lead_score - a.lead_score)
      .slice(0, 10);

    return response.status(200).json({
      queries,
      provider: "tavily",
      qualification_mode: "buying_intent_only",
      leads
    });
  } catch (error) {
    return response.status(error.status || 500).json({
      error: error.message || "Unable to complete live search.",
      details: error.details || null
    });
  }
}
