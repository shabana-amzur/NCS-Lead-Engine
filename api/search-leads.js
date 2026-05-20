const SERVICE_RULES = {
  "Cloud Migration": {
    query: '"Azure migration" OR "cloud migration" UK company consultant tender',
    roles: ["CTO", "IT Director", "Head of Infrastructure"],
    baseScore: 78
  },
  "Database Management": {
    query: '"SQL Server" OR "database support" UK company DBA tender',
    roles: ["IT Director", "Database Manager", "Head of Data"],
    baseScore: 80
  },
  "Power BI and Analytics": {
    query: '"Power BI consultant" OR "business intelligence" UK company dashboard reporting',
    roles: ["Head of Data", "BI Manager", "Operations Director"],
    baseScore: 74
  },
  "Data Maturity Assessment": {
    query: '"data maturity assessment" OR "data governance" UK company consultant',
    roles: ["Chief Data Officer", "Head of Data", "Operations Director"],
    baseScore: 73
  },
  "Oracle Fusion ERP": {
    query: '"Oracle Fusion ERP" UK company support implementation integration',
    roles: ["CFO", "ERP Programme Manager", "IT Director"],
    baseScore: 76
  }
};

const DEFAULT_SERVICE = "Cloud Migration";

function getServiceConfig(serviceName) {
  return SERVICE_RULES[serviceName] || SERVICE_RULES[DEFAULT_SERVICE];
}

function getDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Unknown source";
  }
}

function titleToCompany(title, domain) {
  const cleanTitle = title
    .replace(/\s[-|:]\s.*/, "")
    .replace(/\b(Ltd|Limited|PLC|LLP)\b.*/i, (match) => match)
    .trim();

  if (cleanTitle && cleanTitle.length <= 70) {
    return cleanTitle;
  }

  return domain
    .split(".")[0]
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function sourceTypeFromUrl(url, title, content) {
  const haystack = `${url} ${title} ${content}`.toLowerCase();
  if (haystack.includes("tender") || haystack.includes("procurement")) return "Tender";
  if (haystack.includes("jobs") || haystack.includes("careers") || haystack.includes("hiring")) return "Job Post";
  if (haystack.includes("news") || haystack.includes("press")) return "Company News";
  return "Public Web";
}

function scoreForResult(result, config) {
  const tavilyScore = typeof result.score === "number" ? Math.round(result.score * 10) : 0;
  const score = Math.min(95, config.baseScore + tavilyScore);
  return Math.max(55, score);
}

function buildLead(result, serviceName, config) {
  const domain = getDomain(result.url);
  const title = result.title || domain;
  const content = result.content || "Relevant public search result found for this service area.";
  const score = scoreForResult(result, config);
  const sourceType = sourceTypeFromUrl(result.url, title, content);
  const companyName = titleToCompany(title, domain);

  return {
    company_name: companyName,
    website: `https://${domain}`,
    location: "United Kingdom",
    industry: "To verify",
    company_size_estimate: "To verify",
    service_category: serviceName,
    urgency: score >= 85 ? "high" : "medium",
    lead_score: score,
    intent_signal: content,
    score_explanation: `Live Tavily result matched ${serviceName}. Review the evidence link before outreach.`,
    recommended_roles: config.roles,
    source_type: sourceType,
    source_url: result.url,
    is_demo_source: false,
    outreach_draft: `Hi, I noticed a public signal that may relate to ${serviceName.toLowerCase()}. NCS London helps UK businesses with practical delivery and support in this area. Would it be useful to compare priorities and see where outside support could reduce delivery risk?`
  };
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
  const query = request.query.query ? String(request.query.query) : config.query;

  try {
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
      return response.status(tavilyResponse.status).json({
        error: data?.error || data?.message || "Tavily search failed.",
        details: data
      });
    }

    const leads = (data.results || [])
      .filter((result) => result.url)
      .map((result) => buildLead(result, serviceName, config))
      .sort((a, b) => b.lead_score - a.lead_score);

    return response.status(200).json({
      query,
      provider: "tavily",
      leads
    });
  } catch (error) {
    return response.status(500).json({
      error: "Unable to complete live search.",
      details: error.message
    });
  }
}
