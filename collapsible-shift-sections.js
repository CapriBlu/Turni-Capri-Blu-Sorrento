const collapsedShiftSectionsKey = "capriBluCollapsedShiftSectionsV1";

function readCollapsedShiftSections() {
  try {
    return JSON.parse(localStorage.getItem(collapsedShiftSectionsKey) || "{}");
  } catch (error) {
    return {};
  }
}

function saveCollapsedShiftSections(state) {
  localStorage.setItem(collapsedShiftSectionsKey, JSON.stringify(state));
}

function insertSalaSectionHeader() {
  if (scheduleBody.querySelector('.shift-section-row[data-section="sala"]')) return;

  const header = document.createElement("tr");
  header.className = "shift-section-row";
  header.dataset.section = "sala";
  header.innerHTML = `<td colspan="8"><button type="button" class="shift-section-toggle" data-section="sala"><span class="section-arrow">▾</span> Sala</button></td>`;
  scheduleBody.insertBefore(header, scheduleBody.firstChild);

  let row = header.nextElementSibling;
  while (row && !row.classList.contains("kitchen-section-row") && !row.classList.contains("shift-section-row")) {
    row.dataset.sectionGroup = "sala";
    row = row.nextElementSibling;
  }
}

function normalizeKitchenSectionHeaders() {
  scheduleBody.querySelectorAll(".kitchen-section-row").forEach((row) => {
    const title = row.textContent.trim().toLowerCase().includes("pizzeria") ? "Pizzeria" : "Cucina / Lavaggio";
    const section = title.toLowerCase().includes("pizzeria") ? "pizzeria" : "cucina";
    row.classList.add("shift-section-row");
    row.dataset.section = section;
    row.innerHTML = `<td colspan="8"><button type="button" class="shift-section-toggle" data-section="${section}"><span class="section-arrow">▾</span> ${title}</button></td>`;

    let next = row.nextElementSibling;
    while (next && !next.classList.contains("kitchen-section-row") && !next.classList.contains("shift-section-row")) {
      next.dataset.sectionGroup = section;
      next = next.nextElementSibling;
    }
  });
}

function applyCollapsedShiftSections() {
  const state = readCollapsedShiftSections();

  scheduleBody.querySelectorAll(".shift-section-row").forEach((header) => {
    const section = header.dataset.section;
    const isCollapsed = !!state[section];
    header.classList.toggle("collapsed", isCollapsed);
    const arrow = header.querySelector(".section-arrow");
    if (arrow) arrow.textContent = isCollapsed ? "▸" : "▾";
  });

  scheduleBody.querySelectorAll("tr[data-section-group]").forEach((row) => {
    row.classList.toggle("section-hidden", !!state[row.dataset.sectionGroup]);
  });
}

function setupCollapsibleShiftSections() {
  if (!scheduleBody) return;
  insertSalaSectionHeader();
  normalizeKitchenSectionHeaders();
  applyCollapsedShiftSections();
}

const originalRenderTableForCollapseSections = renderTable;
renderTable = function () {
  originalRenderTableForCollapseSections();
  setupCollapsibleShiftSections();
};

scheduleBody.addEventListener("click", (event) => {
  const toggle = event.target.closest(".shift-section-toggle");
  if (!toggle) return;

  event.preventDefault();
  event.stopPropagation();

  const section = toggle.dataset.section;
  const state = readCollapsedShiftSections();
  state[section] = !state[section];
  saveCollapsedShiftSections(state);
  applyCollapsedShiftSections();
});

setupCollapsibleShiftSections();
