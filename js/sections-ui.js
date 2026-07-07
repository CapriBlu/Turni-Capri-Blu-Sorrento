/*
  Capri Blu Turni - Sections UI
  --------------------------------------------------
  Gestisce solo:
  - apertura/chiusura sezioni già renderizzate da script.js;
  - pulsante rapido aggiungi persona nella colonna Staff.
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

  function patchRenderTable() {
    if (typeof window.renderTable !== "function" || window.renderTable.__sectionsPatched) return;

    const originalRenderTable = window.renderTable;
    window.renderTable = function patchedRenderTable() {
      originalRenderTable.apply(this, arguments);
      applyCollapsedSections();
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

  function init() {
    patchRenderTable();
    applyCollapsedSections();
    setupSectionClicks();
    injectAddPersonButton();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
