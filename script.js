const defaults = window.SITE_CONTENT;

const money = new Intl.NumberFormat("ru-RU");
const areaInput = document.querySelector("#areaInput");
const areaOutput = document.querySelector("#areaOutput");
const calcTotal = document.querySelector("#calcTotal");
const calcDays = document.querySelector("#calcDays");
const objectType = document.querySelector("#objectType");
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
const dealForm = document.querySelector("#dealForm");
const formStatus = document.querySelector("#formStatus");
const timerHours = document.querySelector("#timerHours");
const timerMinutes = document.querySelector("#timerMinutes");
const timerSeconds = document.querySelector("#timerSeconds");
const roomTag = document.querySelector("#roomTag");
const roomTitle = document.querySelector("#roomTitle");
const roomText = document.querySelector("#roomText");
const roomBudget = document.querySelector("#roomBudget");
const roomDays = document.querySelector("#roomDays");
const roomRisk = document.querySelector("#roomRisk");

const roomData = {
  living: {
    tag: "Объект 01",
    title: "Квартира",
    text: "Новостройка, вторичка или апартаменты: демонтаж, черновые работы, инженерия, мокрые зоны, чистовая отделка и сдача по чеклисту.",
    budget: "от 18 000 ₽/м²",
    days: "45-110 дней",
    risk: "Во вторичке важно заложить скрытые дефекты, старую электрику, трубы и неровные основания."
  },
  kitchen: {
    tag: "Объект 02",
    title: "Офис",
    text: "Рабочие зоны, переговорные, входная группа, электрика, свет, покрытие пола и отделка без лишней остановки бизнеса.",
    budget: "от 22 000 ₽/м²",
    days: "30-90 дней",
    risk: "Критичны сроки открытия, согласование электрики, пожарные требования и график шумных работ."
  },
  bath: {
    tag: "Объект 03",
    title: "Дом",
    text: "Большая площадь, несколько санузлов, лестницы, инженерные узлы, теплые полы, котельная и поэтапная чистовая отделка.",
    budget: "от 28 000 ₽/м²",
    days: "90-180 дней",
    risk: "Важно заранее проверить инженерные системы, влажные зоны, лестничные узлы и поставки материалов."
  },
  hall: {
    tag: "Объект 04",
    title: "Коттедж",
    text: "Премиальная отделка, сложная геометрия, несколько уровней, авторские решения, комплектация и контроль большого количества подрядчиков.",
    budget: "от 45 000 ₽/м²",
    days: "120-240 дней",
    risk: "Главные риски: сложные узлы, сроки поставок, лестницы, мокрые зоны и синхронизация работ."
  }
};

if (editor && new URLSearchParams(location.search).get("demo") !== "1") {
  editor.hidden = true;
}

function getRate() {
  const selected = document.querySelector("input[name='level']:checked");
  return Number(selected.value);
}

function getComplexity() {
  const selected = document.querySelector("input[name='complexity']:checked");
  return selected ? Number(selected.value) : 1;
}

function updateCalculator() {
  const area = Number(areaInput.value);
  const typeMultiplier = objectType ? Number(objectType.value) : 1;
  const complexity = getComplexity();
  const total = Math.round(area * getRate() * typeMultiplier * complexity);
  const days = Math.round((area * 1.05 + 18) * typeMultiplier * (complexity > 1 ? 1.12 : 1));
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
        <div class="project-meta">
          <span>${item.name}</span>
          <b>${item.area}</b>
        </div>
        <div class="project-stats">
          <small>${item.budget || "по смете"}</small>
          <small>${item.days || "срок по проекту"}</small>
        </div>
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

function saveLead(form, source) {
  const data = new FormData(form);
  const leads = JSON.parse(localStorage.getItem("remontRouteLeads") || "[]");
  leads.unshift({
    createdAt: new Date().toLocaleString("ru-RU"),
    name: data.get("name").trim(),
    phone: data.get("phone").trim(),
    service: data.get("service") || "Аудит объекта",
    source
  });
  localStorage.setItem("remontRouteLeads", JSON.stringify(leads));
  form.reset();
}

function updateDealTimer() {
  if (!timerHours) return;
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  const diff = Math.max(0, end - now);
  const hours = Math.floor(diff / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  timerHours.textContent = String(hours).padStart(2, "0");
  timerMinutes.textContent = String(minutes).padStart(2, "0");
  timerSeconds.textContent = String(seconds).padStart(2, "0");
}

function updateRoom(key) {
  if (!roomTitle) return;
  const room = roomData[key] || roomData.living;
  roomTag.textContent = room.tag;
  roomTitle.textContent = room.title;
  roomText.textContent = room.text;
  roomBudget.textContent = room.budget;
  roomDays.textContent = room.days;
  roomRisk.textContent = room.risk;
}

areaInput.addEventListener("input", updateCalculator);
if (objectType) objectType.addEventListener("change", updateCalculator);
document.querySelectorAll("input[name='level'], input[name='complexity']").forEach((input) => {
  input.addEventListener("change", updateCalculator);
});

document.querySelectorAll(".room-zone").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".room-zone").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
    updateRoom(button.dataset.room);
  });
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

    saveLead(leadForm, "Главная страница");
    leadForm.elements.consent.checked = true;
    formStatus.textContent = "Заявка принята. Мы уточним объект, состояние, сроки и подготовим предварительный расчет.";
  });
}

if (dealForm) {
  dealForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!dealForm.reportValidity()) return;
    saveLead(dealForm, "Аудит объекта");
    dealForm.querySelector("button").textContent = "Аудит запрошен";
  });
}

const saved = JSON.parse(localStorage.getItem("remontRouteContent") || "{}");
if (saved.brandName === "Remont Route" || saved.brandName === "Контур Ремонт") {
  delete saved.brandName;
  delete saved.headline;
  delete saved.lead;
  delete saved.contactTitle;
  localStorage.setItem("remontRouteContent", JSON.stringify(saved));
}
if (saved.contactTitle === "Получите смету и маршрут ремонта") {
  delete saved.contactTitle;
  localStorage.setItem("remontRouteContent", JSON.stringify(saved));
}
if (saved.heroImage === "assets/renovation-hero.png") {
  delete saved.heroImage;
  delete saved.afterImage;
  delete saved.projects;
  localStorage.setItem("remontRouteContent", JSON.stringify(saved));
}
applyContent(saved);
updateCalculator();
updateRoom("living");
updateDealTimer();
setInterval(updateDealTimer, 1000);
