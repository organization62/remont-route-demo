const contentKey = "remontRouteContent";
const adminDefaults = window.SITE_CONTENT;
let draft = { ...adminDefaults, ...JSON.parse(localStorage.getItem(contentKey) || "{}") };

const mainForm = document.querySelector("#mainForm");
const trustEditor = document.querySelector("#trustEditor");
const packagesEditor = document.querySelector("#packagesEditor");
const projectsEditor = document.querySelector("#projectsEditor");
const adminStatus = document.querySelector("#adminStatus");

function field(name, value, label, tag = "input", type = "text") {
  const safeValue = String(value ?? "").replaceAll('"', "&quot;");
  if (tag === "textarea") {
    return `<label>${label}<textarea data-name="${name}">${value ?? ""}</textarea></label>`;
  }
  return `<label>${label}<input data-name="${name}" type="${type}" value="${safeValue}"></label>`;
}

function fileField(name, label) {
  return `<label>${label}<input data-upload-name="${name}" type="file" accept="image/*"></label>`;
}

function fillMainForm() {
  [...mainForm.elements].forEach((input) => {
    if (input.name) input.value = draft[input.name] ?? "";
  });
}

mainForm.addEventListener("submit", (event) => {
  event.preventDefault();
});

function renderRepeaters() {
  trustEditor.innerHTML = draft.trust.map((item, index) => `
    <article class="admin-mini" data-list="trust" data-index="${index}">
      ${field("value", item.value, "Значение")}
      ${field("label", item.label, "Подпись")}
    </article>
  `).join("");

  packagesEditor.innerHTML = draft.packages.map((item, index) => `
    <article class="admin-mini" data-list="packages" data-index="${index}">
      ${field("name", item.name, "Название")}
      ${field("price", item.price, "Цена")}
      ${field("text", item.text, "Описание", "textarea")}
      <label class="admin-check"><input data-name="featured" type="checkbox" ${item.featured ? "checked" : ""}> Выделить карточку</label>
    </article>
  `).join("");

  projectsEditor.innerHTML = draft.projects.map((item, index) => `
    <article class="admin-mini" data-list="projects" data-index="${index}">
      ${field("name", item.name, "Название")}
      ${field("area", item.area, "Площадь")}
      ${field("image", item.image, "Изображение")}
      ${fileField("image", "Выбрать фото объекта")}
      ${field("text", item.text, "Описание", "textarea")}
    </article>
  `).join("");
}

function readImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function collectDraft() {
  const next = { ...draft };
  [...mainForm.elements].forEach((input) => {
    if (input.name) next[input.name] = input.value.trim();
  });

  document.querySelectorAll(".admin-mini").forEach((card) => {
    const list = card.dataset.list;
    const index = Number(card.dataset.index);
    const item = { ...next[list][index] };
    card.querySelectorAll("[data-name]").forEach((input) => {
      item[input.dataset.name] = input.type === "checkbox" ? input.checked : input.value.trim();
    });
    next[list][index] = item;
  });

  return next;
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

document.querySelector("#adminSave").addEventListener("click", () => {
  draft = collectDraft();
  localStorage.setItem(contentKey, JSON.stringify(draft));
  if (adminStatus) adminStatus.textContent = "Изменения сохранены. Можно открыть сайт и проверить результат.";
});

document.querySelector("#adminExport").addEventListener("click", () => {
  downloadJson(collectDraft());
});

document.querySelector("#adminReset").addEventListener("click", () => {
  localStorage.removeItem(contentKey);
  draft = { ...adminDefaults };
  fillMainForm();
  renderRepeaters();
  if (adminStatus) adminStatus.textContent = "Демо-данные сброшены до исходной версии.";
});

document.addEventListener("change", async (event) => {
  const input = event.target;
  if (input.type !== "file" || !input.files?.length) return;

  const file = input.files[0];
  if (!file.type.startsWith("image/")) return;

  const dataUrl = await readImage(file);
  const mainTarget = input.dataset.uploadTarget;
  const listTarget = input.dataset.uploadName;

  if (mainTarget) {
    const target = mainForm.elements[mainTarget];
    if (target) target.value = dataUrl;
    if (adminStatus) adminStatus.textContent = "Фото добавлено. Не забудьте сохранить изменения.";
  }

  if (listTarget) {
    const card = input.closest(".admin-mini");
    const target = card?.querySelector(`[data-name="${listTarget}"]`);
    if (target) target.value = dataUrl;
    if (adminStatus) adminStatus.textContent = "Фото объекта добавлено. Не забудьте сохранить изменения.";
  }
});

fillMainForm();
renderRepeaters();
