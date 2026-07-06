/*
  Capri Blu Turni - Top menu UI
  --------------------------------------------------
  Gestisce:
  - menu strumenti;
  - menu legenda;
  - archivio mensile/settimanale;
  - spostamento toolbar dentro il menu.
*/

(function () {
  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  function getISOWeekValue(date) {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayNumber = localDate.getDay() || 7;
    localDate.setDate(localDate.getDate() + 4 - dayNumber);
    const yearStart = new Date(localDate.getFullYear(), 0, 1);
    const weekNumber = Math.ceil((((localDate - yearStart) / 86400000) + 1) / 7);
    return `${localDate.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
  }

  function mondayFromISOWeek(weekValue) {
    const [yearText, weekText] = weekValue.split("-W");
    const date = new Date(Number(yearText), 0, 1 + (Number(weekText) - 1) * 7);
    const day = date.getDay() || 7;
    date.setDate(date.getDate() - day + 1);
    return date;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function formatShortDate(date) {
    return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
  }

  function createMonthlyLinks(today) {
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    return monthNames
      .map((monthName, index) => {
        const monthNumber = String(index + 1).padStart(2, "0");
        const monthValue = `${currentYear}-${monthNumber}`;
        const isCurrent = index === currentMonth;
        const className = isCurrent ? "archive-month-link current-archive-month" : "archive-month-link";
        const marker = isCurrent ? "🟢 " : "";
        return `<a href="presenze/?mese=${monthValue}" class="${className}" data-month="${monthValue}">${marker}${monthName}</a>`;
      })
      .join("");
  }

  function createWeeklyLinks(today) {
    const currentWeekValue = getISOWeekValue(today);
    const currentMonday = mondayFromISOWeek(currentWeekValue);

    return [-2, -1, 0, 1, 2, 3]
      .map((offset) => {
        const monday = addDays(currentMonday, offset * 7);
        const sunday = addDays(monday, 6);
        const weekValue = getISOWeekValue(monday);
        const isCurrent = weekValue === currentWeekValue;
        const className = isCurrent ? "archive-week-link current-archive-week" : "archive-week-link";
        const marker = isCurrent ? "🟢 " : "";
        const label = `${marker}${weekValue.replace("-W", " sett. ")} · ${formatShortDate(monday)}-${formatShortDate(sunday)}`;
        return `<button type="button" class="${className}" data-week="${weekValue}">${label}</button>`;
      })
      .join("");
  }

  function setupTopMenu() {
    const topCard = document.querySelector(".top-card");
    const toolbar = document.querySelector(".toolbar");
    const legend = document.querySelector(".legend");

    if (!topCard || !toolbar || document.getElementById("topToolsMenu")) return;

    const topLeftBar = document.createElement("div");
    topLeftBar.id = "topLeftControls";
    topLeftBar.className = "top-left-controls";

    const toolsMenu = document.createElement("div");
    toolsMenu.id = "topToolsMenu";
    toolsMenu.className = "top-tools-menu";
    toolsMenu.innerHTML = '<button id="topToolsMenuBtn" type="button" class="top-tools-menu-btn" aria-expanded="false">☰ Menu</button><div id="topToolsMenuPanel" class="top-tools-menu-panel" role="menu"></div>';

    const legendMenu = document.createElement("div");
    legendMenu.id = "topLegendMenu";
    legendMenu.className = "top-legend-menu";
    legendMenu.innerHTML = '<button id="topLegendMenuBtn" type="button" class="top-legend-menu-btn" aria-expanded="false">Legenda ▾</button><div id="topLegendMenuPanel" class="top-legend-menu-panel"></div>';

    topLeftBar.appendChild(toolsMenu);
    topLeftBar.appendChild(legendMenu);
    topCard.insertBefore(topLeftBar, topCard.firstChild);

    const toolsPanel = document.getElementById("topToolsMenuPanel");
    const toolsButton = document.getElementById("topToolsMenuBtn");
    const legendPanel = document.getElementById("topLegendMenuPanel");
    const legendButton = document.getElementById("topLegendMenuBtn");

    const statusWrap = document.createElement("div");
    statusWrap.className = "top-status-wrap";
    topLeftBar.appendChild(statusWrap);

    Array.from(toolbar.children).forEach((item) => {
      if (item.id === "saveSourceStatus" || item.id === "autosaveStatus") {
        statusWrap.appendChild(item);
      } else {
        toolsPanel.appendChild(item);
      }
    });

    const today = new Date();
    const archiveWrap = document.createElement("div");
    archiveWrap.className = "archive-submenu-wrap";
    archiveWrap.innerHTML = `
      <button id="archiveSubmenuBtn" type="button" class="archive-submenu-btn" aria-expanded="false">Archivio ▸</button>
      <div id="archiveSubmenuPanel" class="archive-submenu-panel">
        <button id="monthlyArchiveSubmenuBtn" type="button" class="archive-submenu-link archive-nested-btn" aria-expanded="false">Archivio mensile ▸</button>
        <div id="monthlyArchiveMonths" class="archive-months-panel">${createMonthlyLinks(today)}</div>
        <button id="weeklyArchiveSubmenuBtn" type="button" class="archive-submenu-link archive-nested-btn" aria-expanded="false">Archivio settimanale ▸</button>
        <div id="weeklyArchiveWeeks" class="archive-weeks-panel">${createWeeklyLinks(today)}</div>
      </div>
    `;
    toolsPanel.insertBefore(archiveWrap, toolsPanel.firstChild);

    const monthlyButton = document.getElementById("monthlyArchiveSubmenuBtn");
    const monthlyPanel = document.getElementById("monthlyArchiveMonths");
    const weeklyButton = document.getElementById("weeklyArchiveSubmenuBtn");
    const weeklyPanel = document.getElementById("weeklyArchiveWeeks");

    monthlyButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      weeklyPanel?.classList.remove("open");
      weeklyButton?.setAttribute("aria-expanded", "false");
      const isOpen = monthlyPanel.classList.toggle("open");
      monthlyButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    weeklyButton?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      monthlyPanel?.classList.remove("open");
      monthlyButton?.setAttribute("aria-expanded", "false");
      const isOpen = weeklyPanel.classList.toggle("open");
      weeklyButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    weeklyPanel?.addEventListener("click", (event) => {
      const weekButton = event.target.closest(".archive-week-link");
      if (!weekButton) return;

      const week = weekButton.dataset.week;
      const weekInput = document.getElementById("weekInput");
      if (!week || !weekInput) return;

      weekInput.value = week;
      weekInput.dispatchEvent(new Event("input", { bubbles: true }));
      weekInput.dispatchEvent(new Event("change", { bubbles: true }));
      closeToolsMenu();
    });

    if (legend && legendPanel) {
      Array.from(legend.children).forEach((item) => legendPanel.appendChild(item));
      legend.classList.add("legend-moved-to-menu");
    }

    function closeArchiveMenu() {
      archiveWrap.classList.remove("open");
      document.getElementById("archiveSubmenuBtn")?.setAttribute("aria-expanded", "false");
      monthlyPanel?.classList.remove("open");
      monthlyButton?.setAttribute("aria-expanded", "false");
      weeklyPanel?.classList.remove("open");
      weeklyButton?.setAttribute("aria-expanded", "false");
    }

    function closeToolsMenu() {
      toolsMenu.classList.remove("open");
      toolsButton.setAttribute("aria-expanded", "false");
      closeArchiveMenu();
    }

    function closeLegendMenu() {
      legendMenu.classList.remove("open");
      legendButton.setAttribute("aria-expanded", "false");
    }

    toolsButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeLegendMenu();
      const isOpen = toolsMenu.classList.toggle("open");
      toolsButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    legendButton.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      closeToolsMenu();
      const isOpen = legendMenu.classList.toggle("open");
      legendButton.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    archiveWrap.querySelector("#archiveSubmenuBtn")?.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = archiveWrap.classList.toggle("open");
      event.currentTarget.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    toolsPanel.addEventListener("click", (event) => {
      const archiveClick = event.target.closest(".archive-submenu-wrap");
      if (archiveClick) return;

      const clickable = event.target.closest("a, button");
      if (clickable && clickable.id !== "uploadSessionBtn") closeToolsMenu();
    });

    document.addEventListener("click", (event) => {
      if (!toolsMenu.contains(event.target)) closeToolsMenu();
      if (!legendMenu.contains(event.target)) closeLegendMenu();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeToolsMenu();
        closeLegendMenu();
      }
    });

    toolbar.classList.add("toolbar-compact-status");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupTopMenu);
  } else {
    setupTopMenu();
  }
})();
