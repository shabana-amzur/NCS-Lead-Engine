const serviceNames = [
  "Cloud Migration",
  "Database Management",
  "Power BI and Analytics",
  "Data Maturity Assessment",
  "Oracle Fusion ERP"
];

let leads = [];

const leadList = document.querySelector("#leadList");
const leadDetail = document.querySelector("#leadDetail");
const serviceFilter = document.querySelector("#serviceFilter");
const qualifiedCount = document.querySelector("#qualifiedCount");
const averageScore = document.querySelector("#averageScore");
const hotCount = document.querySelector("#hotCount");
const exportButton = document.querySelector("#exportButton");
const refreshButton = document.querySelector("#refreshButton");
const statusBar = document.querySelector("#statusBar");
const navLinks = document.querySelectorAll("[data-nav-target]");

let selectedLead = null;

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
    leadList.innerHTML = `<div class="empty-list">No live leads loaded yet. Click refresh to search across NCS service areas.</div>`;
    leadDetail.innerHTML = `<div class="empty-state">Live Tavily results will appear here after search.</div>`;
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

  const leadType = lead.lead_type || `${lead.source_type} lead`;
  const requirement = lead.requirement || lead.intent_signal;
  const ncsFit = lead.ncs_fit || `NCS can support this opportunity through its ${lead.service_category} consulting, delivery, and managed services capability.`;
  const approachPlan = Array.isArray(lead.approach_plan) && lead.approach_plan.length
    ? lead.approach_plan
    : [
        "Review the evidence source before outreach.",
        "Contact the most relevant decision-maker role listed below.",
        "Reference the public signal briefly and offer a short discovery call."
      ];
  const evidenceMarkup = `<a href="${escapeHtml(lead.source_url)}" target="_blank" rel="noreferrer">${escapeHtml(lead.source_url)}</a>`;

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

      <div class="brief-grid">
        <div class="brief-card">
          <h3>Lead Type</h3>
          <p>${escapeHtml(leadType)}</p>
        </div>
        <div class="brief-card">
          <h3>Service Fit</h3>
          <p>${escapeHtml(lead.service_category)} · ${escapeHtml(lead.source_type)} · ${escapeHtml(lead.urgency)} urgency</p>
        </div>
      </div>

      <div class="section">
        <h3>Their Requirement</h3>
        <p>${escapeHtml(requirement)}</p>
      </div>

      <div class="section">
        <h3>What NCS Can Do</h3>
        <p>${escapeHtml(ncsFit)}</p>
      </div>

      <div class="section">
        <h3>How To Approach Them</h3>
        <ol class="approach-list">
          ${approachPlan.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
        </ol>
      </div>

      <div class="section">
        <h3>Decision-Maker Roles</h3>
        <div class="tag-row">
          ${lead.recommended_roles.map((role) => `<span class="tag">${escapeHtml(role)}</span>`).join("")}
        </div>
      </div>

      <div class="section">
        <h3>Suggested Opening Message</h3>
        <p class="outreach">${escapeHtml(lead.outreach_draft)}</p>
      </div>

      <div class="section">
        <h3>Evidence</h3>
        ${evidenceMarkup}
      </div>

      <div class="section support-section">
        <h3>Qualification Notes</h3>
        <p>${escapeHtml(lead.score_explanation)}</p>
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

function setActiveNav(target) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.navTarget === target);
  });
}

function scrollToSection(target) {
  if (target === "exports") {
    downloadCsv();
    setActiveNav(target);
    return;
  }

  const section = document.querySelector(`#${target}`);
  if (section) {
    section.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveNav(target);
  }
}

async function searchLiveLeads() {
  const service = serviceFilter.value;
  const serviceLabel = service === "all" ? "all NCS services" : service;
  refreshButton.disabled = true;
  setStatus(`Searching for public buying-intent signals across ${serviceLabel}...`, "loading");

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
      setStatus(`No qualified buying-intent leads found for ${serviceLabel}. Try another service or broaden the query later.`, "neutral");
    } else {
      setStatus(`Live Tavily search complete. ${leads.length} qualified need signals found across ${serviceLabel}.`, "success");
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
navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    scrollToSection(link.dataset.navTarget);
  });
});

initFilters();
renderLeadList();
renderDetail();
