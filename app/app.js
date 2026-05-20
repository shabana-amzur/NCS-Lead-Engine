const serviceNames = [
  "Cloud Migration",
  "Database Management",
  "Power BI and Analytics",
  "Data Maturity Assessment",
  "Oracle Fusion ERP"
];

let leads = [
  {
    company_name: "Northbank Finance Group",
    website: "https://northbank-finance.example",
    location: "London, United Kingdom",
    industry: "Financial Services",
    company_size_estimate: "500-1000",
    service_category: "Database Management",
    urgency: "high",
    lead_score: 91,
    intent_signal: "Requesting SQL Server performance, high availability, and disaster recovery readiness support.",
    score_explanation: "Strong database fit, tender signal, UK location, and recent public evidence.",
    recommended_roles: ["IT Director", "Database Manager", "Head of Data"],
    source_type: "Tender",
    source_url: "https://tenders.example/northbank-sql-performance-support",
    is_demo_source: true,
    outreach_draft: "Hi, I noticed Northbank Finance Group appears to be reviewing SQL Server performance and resilience. NCS London helps UK businesses strengthen database operations, availability, and disaster recovery without slowing core teams. Would it be useful to compare priorities for the project?"
  },
  {
    company_name: "Arden Manufacturing Ltd",
    website: "https://arden-manufacturing.example",
    location: "Birmingham, United Kingdom",
    industry: "Manufacturing",
    company_size_estimate: "250-500",
    service_category: "Cloud Migration",
    urgency: "high",
    lead_score: 84,
    intent_signal: "Seeking an Azure Migration Lead to support migration from legacy on-premise systems to Microsoft Azure.",
    score_explanation: "Strong cloud migration fit, hiring signal, UK location, and recent public evidence.",
    recommended_roles: ["CTO", "IT Director", "Head of Infrastructure"],
    source_type: "Job Post",
    source_url: "https://jobs.example/arden-azure-migration-lead",
    is_demo_source: true,
    outreach_draft: "Hi, I noticed Arden Manufacturing appears to be investing in Azure migration. NCS London supports UK businesses with cloud migration planning, delivery, and security review. Would it be useful to compare notes on where outside support could reduce delivery risk?"
  },
  {
    company_name: "Marlow Retail Systems",
    website: "https://marlow-retail.example",
    location: "Manchester, United Kingdom",
    industry: "Retail",
    company_size_estimate: "100-250",
    service_category: "Power BI and Analytics",
    urgency: "medium",
    lead_score: 79,
    intent_signal: "Started a reporting modernisation programme to improve Power BI dashboards across operations.",
    score_explanation: "Good analytics fit, public programme signal, UK location, and relevant operational reporting need.",
    recommended_roles: ["Head of Data", "BI Manager", "Operations Director"],
    source_type: "Public Web",
    source_url: "https://news.example/marlow-retail-bi-programme",
    is_demo_source: true,
    outreach_draft: "Hi, I noticed Marlow Retail Systems appears to be modernising Power BI reporting. NCS London helps teams turn operational data into reliable dashboards and decision-ready insight. Would a short conversation around the reporting roadmap be useful?"
  },
  {
    company_name: "Cavendish Care Services",
    website: "https://cavendish-care.example",
    location: "Leeds, United Kingdom",
    industry: "Healthcare",
    company_size_estimate: "250-500",
    service_category: "Data Maturity Assessment",
    urgency: "medium",
    lead_score: 78,
    intent_signal: "Announced a data governance and data maturity review to improve reporting, compliance, and operational insight.",
    score_explanation: "Good data maturity fit with public company news and a clear business improvement theme.",
    recommended_roles: ["Chief Data Officer", "Head of Data", "Operations Director"],
    source_type: "Company News",
    source_url: "https://press.example/cavendish-data-governance",
    is_demo_source: true,
    outreach_draft: "Hi, I noticed Cavendish Care Services appears to be reviewing data governance and maturity. NCS London helps organisations assess data maturity and turn findings into practical improvement plans. Would it be useful to discuss how similar reviews are usually structured?"
  },
  {
    company_name: "Orchid Logistics",
    website: "https://orchid-logistics.example",
    location: "London, United Kingdom",
    industry: "Logistics",
    company_size_estimate: "100-250",
    service_category: "Oracle Fusion ERP",
    urgency: "medium",
    lead_score: 76,
    intent_signal: "Hiring for Oracle Fusion ERP support and integration work across finance and operations systems.",
    score_explanation: "Relevant Oracle Fusion signal, UK location, and clear integration/support language.",
    recommended_roles: ["CFO", "ERP Programme Manager", "IT Director"],
    source_type: "Job Post",
    source_url: "https://jobs.example/orchid-oracle-fusion-consultant",
    is_demo_source: true,
    outreach_draft: "Hi, I noticed Orchid Logistics appears to be working on Oracle Fusion ERP support and integration. NCS London helps businesses stabilise ERP operations and connect finance and operational systems. Would it be useful to compare where additional support could help?"
  }
];

const leadList = document.querySelector("#leadList");
const leadDetail = document.querySelector("#leadDetail");
const serviceFilter = document.querySelector("#serviceFilter");
const qualifiedCount = document.querySelector("#qualifiedCount");
const averageScore = document.querySelector("#averageScore");
const hotCount = document.querySelector("#hotCount");
const exportButton = document.querySelector("#exportButton");
const refreshButton = document.querySelector("#refreshButton");
const statusBar = document.querySelector("#statusBar");

let selectedLead = leads[0];

function initFilters() {
  serviceNames.forEach((service) => {
    const option = document.createElement("option");
    option.value = service;
    option.textContent = service;
    serviceFilter.appendChild(option);
  });
}

function filteredLeads() {
  if (serviceFilter.value === "all") {
    return leads;
  }
  return leads.filter((lead) => lead.service_category === serviceFilter.value);
}

function renderMetrics(items) {
  qualifiedCount.textContent = items.length;
  averageScore.textContent = items.length
    ? Math.round(items.reduce((sum, lead) => sum + lead.lead_score, 0) / items.length)
    : 0;
  hotCount.textContent = items.filter((lead) => lead.urgency === "high").length;
}

function renderLeadList() {
  const items = filteredLeads();
  renderMetrics(items);
  leadList.innerHTML = "";

  if (items.length === 0) {
    leadList.innerHTML = `<div class="empty-list">No leads found for this service yet.</div>`;
    leadDetail.innerHTML = `<div class="empty-state">Run a live search or choose another service.</div>`;
    return;
  }

  items.forEach((lead) => {
    const button = document.createElement("button");
    button.className = `lead-item ${lead.company_name === selectedLead.company_name ? "active" : ""}`;
    button.innerHTML = `
      <div class="lead-row">
        <div>
          <div class="lead-name">${escapeHtml(lead.company_name)}</div>
          <div class="lead-meta">${escapeHtml(lead.location)} · ${escapeHtml(lead.industry)}</div>
        </div>
        <div class="score">${escapeHtml(String(lead.lead_score))}</div>
      </div>
      <div class="tag-row">
        <span class="tag">${escapeHtml(lead.service_category)}</span>
        <span class="tag ${escapeHtml(lead.urgency)}">${escapeHtml(lead.urgency)} urgency</span>
        <span class="tag">${escapeHtml(lead.source_type)}</span>
      </div>
    `;
    button.addEventListener("click", () => {
      selectedLead = lead;
      renderLeadList();
      renderDetail();
    });
    leadList.appendChild(button);
  });

  if (!items.includes(selectedLead) && items.length > 0) {
    selectedLead = items[0];
    renderLeadList();
    renderDetail();
  }
}

function renderDetail() {
  const lead = selectedLead;
  if (!lead) {
    leadDetail.innerHTML = `<div class="empty-state">Run a live search or choose a lead.</div>`;
    return;
  }

  const evidenceMarkup = lead.is_demo_source
    ? `<div class="demo-source">
        <strong>Demo evidence source</strong>
        <span>${escapeHtml(lead.source_url)}</span>
        <p>This is sample data for the prototype. Live reference links will appear here after a real search provider is connected.</p>
      </div>`
    : `<a href="${escapeHtml(lead.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(lead.source_url)}</a>`;

  leadDetail.innerHTML = `
    <div class="detail-stack">
      <div class="detail-title">
        <div>
          <p class="eyebrow">${escapeHtml(lead.service_category)}</p>
          <h2>${escapeHtml(lead.company_name)}</h2>
          <p class="detail-meta">${escapeHtml(lead.location)} · ${escapeHtml(lead.industry)} · ${escapeHtml(lead.company_size_estimate)} employees</p>
        </div>
        <div class="score">${escapeHtml(String(lead.lead_score))}</div>
      </div>

      <div class="section">
        <h3>Intent Signal</h3>
        <p>${escapeHtml(lead.intent_signal)}</p>
      </div>

      <div class="section">
        <h3>Score Explanation</h3>
        <p>${escapeHtml(lead.score_explanation)}</p>
      </div>

      <div class="section">
        <h3>Decision-Maker Roles</h3>
        <div class="tag-row">
          ${lead.recommended_roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join("")}
        </div>
      </div>

      <div class="section">
        <h3>Evidence</h3>
        ${evidenceMarkup}
      </div>

      <div class="section">
        <h3>Outreach Draft</h3>
        <p class="outreach">${escapeHtml(lead.outreach_draft)}</p>
      </div>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function downloadCsv() {
  if (leads.length === 0) {
    setStatus("There are no leads to export yet.", "error");
    return;
  }

  const headers = Object.keys(leads[0]);
  const rows = leads.map((lead) =>
    headers.map((header) => `"${String(lead[header]).replaceAll('"', '""')}"`).join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "ncs-qualified-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function setStatus(message, state = "neutral") {
  statusBar.textContent = message;
  statusBar.className = `status-bar ${state}`;
}

async function searchLiveLeads() {
  const service = serviceFilter.value === "all" ? "Cloud Migration" : serviceFilter.value;
  refreshButton.disabled = true;
  setStatus(`Searching for public buying-intent signals for ${service}...`, "loading");

  try {
    const response = await fetch(`/api/search-leads?service=${encodeURIComponent(service)}`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Live search failed.");
    }

    leads = data.leads;
    selectedLead = leads[0] || null;
    serviceFilter.value = service;
    renderLeadList();
    renderDetail();
    if (leads.length === 0) {
      setStatus(`No qualified buying-intent leads found for ${service}. Try another service or broaden the query later.`, "neutral");
    } else {
      setStatus(`Live Tavily search complete. ${leads.length} qualified need signals found for ${service}.`, "success");
    }
  } catch (error) {
    setStatus(`Live search failed: ${error.message}`, "error");
  } finally {
    refreshButton.disabled = false;
  }
}

serviceFilter.addEventListener("change", renderLeadList);
exportButton.addEventListener("click", downloadCsv);
refreshButton.addEventListener("click", searchLiveLeads);

initFilters();
renderLeadList();
renderDetail();
