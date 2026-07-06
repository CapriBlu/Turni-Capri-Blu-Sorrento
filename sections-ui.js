/*
  Capri Blu Turni - Sections UI
  --------------------------------------------------
  Gestisce:
  - sezioni Sala/Cucina/Pizzeria espandibili;
  - pulsante rapido aggiungi persona nella colonna Staff;
  - aggiunta persona da menu contestuale sulla colonna nomi.
*/

(function () {
  const storageKey = "capriBluCollapsedShiftSectionsV1";

  function readState() {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || "{}");
    } catch (error) {
      return {};
    }
  }

  function saveState(state) {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }

  function getScheduleBody() {
    return document.getElementById("scheduleBody") || window.scheduleBody;
  }

  function insertSalaHeader() {
    const body = getScheduleBody();
    if (!body || body.querySelector('.shift-section-row[data-section="sala"]')) return;

    const header = document.createElement("tr");
    header.className = "shift-section-row";
    header.dataset.section = "sala";
    header.innerHTML = '<td colspan="8"><button type="button" class="shift-section-toggle" data-section="sala"><span class="section-arrow">▾</span> Sala</button></td>';
    body.insertBefore(header, body.firstChild);

    let row = header.nextElementSibling;
    while (row && !row.classList.contains("kitchen-section-row") && !row.classList.contains("shift-section-row")) {
      row.dataset.sectionGroup = "sala";
      row = row.nextElementSibling;
    }
  }

  function normalizeKitchenHeaders() {
    const body = getScheduleBody();
    if (!body) return;

    body.querySelectorAll(".kitchen-section-row").forEach((row) => {
      const text = row.textContent.trim().toLowerCase();
      const isPizzeria = text.includes("pizzeria");
      const title = isPizzeria ? "Pizzeria" : "Cucina / Lavaggio";
      const section = isPizzeria ? "pizzeria" : "cucina";

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

  function applyCollapsedSections() {
    const body = getScheduleBody();
    if (!body) return;

    const state = readState();

    body.querySelectorAll(".shift-section-row").forEach((header) => {
      const section = header.dataset.section;
      const collapsed = Boolean(state[section]);
      header.classList.toggle("collapsed", collapsed);

      const arrow = header.querySelector(".section-arrow");
      if (arrow) arrow.textContent = collapsed ? "▸" : "▾";
    });

    body.querySelectorAll("tr[data-section-group]").forEach((row) => {
      row.classList.toggle("section-hidden", Boolean(state[row.dataset.sectionGroup]));
    });
  }

  function setupSections() {
    insertSalaHeader();
    normalizeKitchenHeaders();
    applyCollapsedSections();
  }

  function patchRenderTable() {
    if (typeof window.renderTable !== "function" || window.renderTable.__sectionsPatched) return;

    const originalRenderTable = window.renderTable;
    window.renderTable = function patchedRenderTable() {
      originalRenderTable.apply(this, arguments);
      setupSections();
    };
    window.renderTable.__sectionsPatched = true;
  }

  function setupSectionClicks() {
    const body = getScheduleBody();
    if (!body || body.__sectionsClickReady) return;

    body.addEventListener("click", (event) => {
      const toggle = event.target.closest(".shift-section-toggle");
      if (!toggle) return;

      event.preventDefault();
      event.stopPropagation();

      const state = readState();
      const section = toggle.dataset.section;
      state[section] = !state[section];
      saveState(state);
      applyCollapsedSections();
    });

    body.__sectionsClickReady = true;
  }

  function injectAddPersonButton() {
    const staffHeader = document.querySelector("#shiftTable th:first-child");
    if (!staffHeader || staffHeader.querySelector("#quickAddPersonBtn")) return;

    staffHeader.innerHTML = '<span class="staff-header-label">Staff</span><button id="quickAddPersonBtn" class="quick-add-person-btn" type="button" title="Aggiungi persona">+</button>';
    document.getElementById("quickAddPersonBtn")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (typeof window.addPerson === "function") window.addPerson();
    });
  }

  function setupNameContextMenu() {
    const body = getScheduleBody();
    if (!body || body.__nameContextReady) return;

    body.addEventListener("contextmenu", (event) => {
      const nameCell = event.target.closest('td[data-field="nome"], .kitchen-name-cell');
      if (!nameCell) return;

      event.preventDefault();
      event.stopPropagation();

      if (confirm("Aggiungere una nuova persona?")) {
        if (typeof window.addPerson === "function") window.addPerson();
      }
    });

    body.__nameContextReady = true;
  }

  function init() {
    patchRenderTable();
    setupSections();
    setupSectionClicks();
    injectAddPersonButton();
    setupNameContextMenu();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
