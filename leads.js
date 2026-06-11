const leadsKey = "remontRouteLeads";
const leadsList = document.querySelector("#leadsList");
const exportLeads = document.querySelector("#exportLeads");
const clearLeads = document.querySelector("#clearLeads");

function getLeads() {
  return JSON.parse(localStorage.getItem(leadsKey) || "[]");
}

function renderLeads() {
  const leads = getLeads();
  if (!leads.length) {
    leadsList.innerHTML = `
      <article class="empty-state">
        <h2>Заявок пока нет</h2>
        <p>Оставьте тестовую заявку на главной странице, и она появится здесь.</p>
      </article>
    `;
    return;
  }

  leadsList.innerHTML = leads.map((lead) => `
    <article class="lead-card">
      <div>
        <span>${lead.createdAt}</span>
        <h2>${lead.name}</h2>
        <p>${lead.service}</p>
      </div>
      <a class="button ghost dark" href="tel:${lead.phone.replace(/[^\d+]/g, "")}">${lead.phone}</a>
    </article>
  `).join("");
}

function toCsv(leads) {
  const rows = [["Дата", "Имя", "Телефон", "Услуга", "Источник"], ...leads.map((lead) => [
    lead.createdAt,
    lead.name,
    lead.phone,
    lead.service,
    lead.source
  ])];
  return rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(";")).join("\n");
}

function downloadCsv() {
  const blob = new Blob([toCsv(getLeads())], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "remont-route-leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

exportLeads.addEventListener("click", downloadCsv);
clearLeads.addEventListener("click", () => {
  localStorage.removeItem(leadsKey);
  renderLeads();
});

renderLeads();
