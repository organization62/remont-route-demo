const defaults = window.SITE_CONTENT;

const money = new Intl.NumberFormat("ru-RU");
const areaInput = document.querySelector("#areaInput");
const areaOutput = document.querySelector("#areaOutput");
const calcTotal = document.querySelector("#calcTotal");
const calcDays = document.querySelector("#calcDays");
const compareRange = document.querySelector("#compareRange");
const afterLayer = document.querySelector(".after-layer");
const editor = document.querySelector("#editor");
const editorToggle = document.querySelector("#editorToggle");
const saveContent = document.querySelector("#saveContent");
const exportContent = document.querySelector("#exportContent");
const trustStrip = document.querySelector("#trustStrip");
const packageGrid = document.querySelector("#packageGrid");
const projectGrid = document.querySelector("#projectGrid");
const leadForm = document.querySelector("#leadForm");
const formStatus = document.querySelector("#formStatus");

function getRate() {
  const selected = document.querySelector("input[name='level']:checked");
  return Number(selected.value);
}

function updateCalculator() {
  const area = Number(areaInput.value);
  const total = area * getRate();
  const days = Math.round(area * 1.15 + 10);
  areaOutput.textContent = area;
  calcTotal.textContent = `${money.format(total)} ₽`;
  calcDays.textContent = `${days} дней`;
}

function applyContent(content) {
  const merged = { ...defaults, ...content };
  document.body.dataset.theme = merged.theme || "route";
  document.querySelectorAll("[data-image]").forEach((node) => {
    const src = merged[node.dataset.image];
    if (src) node.setAttribute("src", src);
  });
  document.documentElement.style.setProperty("--before-image", `url("${merged.beforeImage}")`);
  document.documentElement.style.setProperty("--after-image", `url("${merged.afterImage}")`);
  Object.entries(merged).forEach(([key, value]) => {
    if (Array.isArray(value)) return;
    document.querySelectorAll(`[data-edit="${key}"]`).forEach((node) => {
      node.textContent = value;
      if (key === "phone") {
        node.setAttribute("href", `tel:${value.replace(/[^\d+]/g, "")}`);
      }
    });
    const field = document.querySelector(`[data-field="${key}"]`);
    if (field) field.value = value;
  });
  renderCollections(merged);
}

function renderCollections(content) {
  if (trustStrip) {
    trustStrip.innerHTML = content.trust.map((item) => `
      <article><strong>${item.value}</strong><span>${item.label}</span></article>
    `).join("");
  }

  if (packageGrid) {
    packageGrid.innerHTML = content.packages.map((item) => `
      <article class="price-card${item.featured ? " featured" : ""}">
        <span>${item.name}</span>
        <h3>${item.price}</h3>
        <p>${item.text}</p>
      </article>
    `).join("");
  }

  if (projectGrid) {
    projectGrid.innerHTML = content.projects.map((item) => `
      <article>
        <img src="${item.image || content.afterImage}" alt="${item.name}">
        <span>${item.name}</span>
        <b>${item.area}</b>
        <p>${item.text}</p>
      </article>
    `).join("");
  }
}

function readEditorContent() {
  return Object.fromEntries(
    [...document.querySelectorAll("[data-field]")].map((field) => [field.dataset.field, field.value.trim()])
  );
}

function downloadJson(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "remont-route-content.json";
  link.click();
  URL.revokeObjectURL(url);
}

areaInput.addEventListener("input", updateCalculator);
document.querySelectorAll("input[name='level']").forEach((input) => {
  input.addEventListener("change", updateCalculator);
});

compareRange.addEventListener("input", () => {
  afterLayer.style.width = `${compareRange.value}%`;
});

editorToggle.addEventListener("click", () => {
  editor.classList.toggle("open");
});

saveContent.addEventListener("click", () => {
  const previousContent = JSON.parse(localStorage.getItem("remontRouteContent") || "{}");
  const nextContent = { ...previousContent, ...readEditorContent() };
  localStorage.setItem("remontRouteContent", JSON.stringify(nextContent));
  applyContent(nextContent);
});

exportContent.addEventListener("click", () => {
  const previousContent = JSON.parse(localStorage.getItem("remontRouteContent") || "{}");
  downloadJson({ ...defaults, ...previousContent, ...readEditorContent() });
});

if (leadForm) {
  leadForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!leadForm.reportValidity()) return;

    const data = new FormData(leadForm);
    const leads = JSON.parse(localStorage.getItem("remontRouteLeads") || "[]");
    leads.unshift({
      createdAt: new Date().toLocaleString("ru-RU"),
      name: data.get("name").trim(),
      phone: data.get("phone").trim(),
      service: data.get("service"),
      source: "Главная страница"
    });
    localStorage.setItem("remontRouteLeads", JSON.stringify(leads));
    leadForm.reset();
    leadForm.elements.consent.checked = true;
    formStatus.textContent = "Заявка сохранена в демо-CRM. Откройте страницу “Заявки”.";
  });
}

const saved = JSON.parse(localStorage.getItem("remontRouteContent") || "{}");
applyContent(saved);
updateCalculator();
