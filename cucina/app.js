const weekKey = "capriBluTurniCucinaWeekSelectedV1";
const weekStoragePrefix = "capriBluTurniCucinaWeekV1-";
const publishedWeekStoragePrefix = "capriBluTurniCucinaPublishedWeekV1-";
const copiedKitchenShiftKey = "capriBluTurniCucinaCopiedShiftV1";

const dayKeys = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const dayLabels = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const shiftOptions = ["", "M", "S", "M/S", "Off", "12/chius"];

const groups = [
  {
    title: "Turni Pizzeria",
    people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"]
  },
  {
    title: "Turni Cucina / Lavaggio",
    people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"]
  }
];

const weekInput = document.getElementById("weekInput");
const weekRange = document.getElementById("weekRange");
const table = document.getElementById("kitchenTable");
const autosaveStatus = document.getElementById("autosaveStatus");
const sendMonthlyBtn = document.getElementById("sendMonthlyBtn");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");

let selectedCell = null;
let activeCell = null;
let menuBackdrop = null;
let copiedShift = null;
let isDragging = false;
let dragStarted = false;
let dragAnchor = null;
const multiSelectedKeys = new Set();

function safeJsonParse(value, fallback, keyToRemove = "") {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Dati cucina non leggibili:", keyToRemove || "senza chiave", error);
    if (keyToRemove) localStorage.removeItem(keyToRemove);
    return fallback;
  }
}

function getCurrentWeek() {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNumber);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return date.getFullYear() + "-W" + String(weekNumber).padStart(2, "0");
}

function mondayFromWeek(weekValue) {
  const [yearText, weekText] = weekValue.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay() || 7;
  simple.setDate(simple.getDate() - day + 1);
  return simple;
}

function formatDate(date) {
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

function updateWeekRange() {
  const monday = mondayFromWeek(weekInput.value);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  weekRange.textContent = formatDate(monday) + " / " + formatDate(sunday);
}

function blankData() {
  const data = {};
  groups.forEach((group) => {
    group.people.forEach((name) => {
      data[name] = {};
      dayKeys.forEach((day) => {
        data[name][day] = "";
      });
    });
  });
  return data;
}

function storageKey() {
  return weekStoragePrefix + weekInput.value;
}

function readData() {
  const saved = localStorage.getItem(storageKey());
  const data = Object.assign(blankData(), safeJsonParse(saved, {}, storageKey()));

  groups.forEach((group) => {
    group.people.forEach((name) => {
      data[name] = Object.assign(blankData()[name], data[name] || {});
    });
  });

  return data;
}

function saveData(data) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
  setAutosaveStatus("Salvato " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
}

function setAutosaveStatus(text) {
  if (!autosaveStatus) return;
  autosaveStatus.textContent = text;
}

function classForValue(value) {
  if (value === "M") return "cell-m";
  if (value === "S") return "cell-s";
  if (value === "M/S") return "cell-ms";
  if (value === "Off") return "cell-off";
  if (value === "12/chius") return "cell-chius";
  return "";
}

function getCellKey(cell) {
  return cell.dataset.name + "-" + cell.dataset.day;
}

function cellFromKey(key) {
  const [name, day] = key.split("-");
  return table.querySelector(`.shift-cell[data-name="${CSS.escape(name)}"][data-day="${CSS.escape(day)}"]`);
}

function clearSelection() {
  table.querySelectorAll(".selected-cell, .multi-selected").forEach((cell) => {
    cell.classList.remove("selected-cell", "multi-selected");
  });
  selectedCell = null;
  multiSelectedKeys.clear();
}

function selectCell(cell, keepMulti = false) {
  if (!keepMulti) clearSelection();
  selectedCell = cell;
  if (cell) {
    cell.classList.add("selected-cell");
    multiSelectedKeys.add(getCellKey(cell));
  }
}

function applyMultiSelection() {
  table.querySelectorAll(".multi-selected").forEach((cell) => cell.classList.remove("multi-selected"));
  multiSelectedKeys.forEach((key) => {
    const cell = cellFromKey(key);
    if (cell) cell.classList.add("multi-selected");
  });
}

function selectRange(anchor, target) {
  if (!anchor || !target) return;
  const rows = Array.from(table.querySelectorAll("tr")).filter((row) => row.querySelector(".shift-cell"));
  const anchorRow = rows.findIndex((row) => row.contains(anchor));
  const targetRow = rows.findIndex((row) => row.contains(target));
  const anchorDay = dayKeys.indexOf(anchor.dataset.day);
  const targetDay = dayKeys.indexOf(target.dataset.day);
  if (anchorRow < 0 || targetRow < 0 || anchorDay < 0 || targetDay < 0) return;

  const rowStart = Math.min(anchorRow, targetRow);
  const rowEnd = Math.max(anchorRow, targetRow);
  const dayStart = Math.min(anchorDay, targetDay);
  const dayEnd = Math.max(anchorDay, targetDay);

  multiSelectedKeys.clear();
  for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex += 1) {
    const cells = rows[rowIndex].querySelectorAll(".shift-cell");
    for (let dayIndex = dayStart; dayIndex <= dayEnd; dayIndex += 1) {
      const cell = cells[dayIndex];
      if (cell) multiSelectedKeys.add(getCellKey(cell));
    }
  }
  selectedCell = target;
  applyMultiSelection();
}

function selectedCells() {
  const cells = [];
  multiSelectedKeys.forEach((key) => {
    const cell = cellFromKey(key);
    if (cell) cells.push(cell);
  });
  if (!cells.length && selectedCell) cells.push(selectedCell);
  return cells;
}

function renderTable() {
  const data = readData();
  const oldSelected = selectedCell ? getCellKey(selectedCell) : "";
  const oldMulti = new Set(multiSelectedKeys);

  let html = "<thead><tr><th>Staff</th>";
  dayLabels.forEach((label) => {
    html += "<th>" + label + "</th>";
  });
  html += "</tr></thead><tbody>";

  groups.forEach((group) => {
    html += "<tr class='section-row'><td colspan='8'>" + group.title + "</td></tr>";
    group.people.forEach((name) => {
      html += "<tr><td>" + name + "</td>";
      dayKeys.forEach((day) => {
        const value = data[name]?.[day] || "";
        html += "<td class='shift-cell " + classForValue(value) + "' data-name='" + name + "' data-day='" + day + "' data-value='" + value + "'>" + value + "</td>";
      });
      html += "</tr>";
    });
  });

  html += "</tbody>";
  table.innerHTML = html;

  multiSelectedKeys.clear();
  oldMulti.forEach((key) => {
    if (cellFromKey(key)) multiSelectedKeys.add(key);
  });
  applyMultiSelection();
  if (oldSelected) {
    const restored = cellFromKey(oldSelected);
    if (restored) {
      selectedCell = restored;
      restored.classList.add("selected-cell");
    }
  }
}

function saveCells(cells, value) {
  if (!cells.length) return;
  const data = readData();
  cells.forEach((cell) => {
    const name = cell.dataset.name;
    const day = cell.dataset.day;
    if (!data[name]) data[name] = {};
    data[name][day] = value;
  });
  saveData(data);
  renderTable();
}

function copySelection() {
  const cell = selectedCell || selectedCells()[0];
  if (!cell) return;
  copiedShift = cell.dataset.value || "";
  localStorage.setItem(copiedKitchenShiftKey, copiedShift);
  setAutosaveStatus("Copiato: " + (copiedShift || "vuoto"));
}

function pasteSelection() {
  if (copiedShift === null || copiedShift === undefined) {
    copiedShift = localStorage.getItem(copiedKitchenShiftKey) || "";
  }
  const cells = selectedCells();
  if (!cells.length) return;
  saveCells(cells, copiedShift);
  setAutosaveStatus("Incollato: " + (copiedShift || "vuoto"));
}

function clearSelectionValues() {
  const cells = selectedCells();
  if (!cells.length) return;
  saveCells(cells, "");
}

function createMenu() {
  menuBackdrop = document.createElement("div");
  menuBackdrop.className = "kitchen-menu-backdrop";
  menuBackdrop.innerHTML = `
    <div class="kitchen-menu-panel" role="dialog" aria-modal="true">
      <h2>Seleziona turno</h2>
      <p id="kitchenMenuSubtitle">Scegli una voce</p>
      <div class="kitchen-menu-grid">
        <button type="button" data-value="M" class="menu-m">M<br><small>Mattina</small></button>
        <button type="button" data-value="S" class="menu-s">S<br><small>Sera</small></button>
        <button type="button" data-value="M/S" class="menu-ms">M/S<br><small>Spezzato</small></button>
        <button type="button" data-value="Off" class="menu-off">Off<br><small>Riposo</small></button>
        <button type="button" data-value="12/chius" class="menu-chius">12/chius<br><small>Fino chiusura</small></button>
        <button type="button" data-value="" class="menu-empty">Vuoto<br><small>Cancella</small></button>
      </div>
      <div class="kitchen-menu-actions">
        <button type="button" id="kitchenCopyBtn">Copia</button>
        <button type="button" id="kitchenPasteBtn">Incolla</button>
      </div>
      <button type="button" id="kitchenMenuClose" class="kitchen-menu-close">Annulla</button>
    </div>
  `;

  document.body.appendChild(menuBackdrop);
  menuBackdrop.addEventListener("click", (event) => {
    if (event.target === menuBackdrop) closeMenu();
  });

  document.getElementById("kitchenMenuClose").addEventListener("click", closeMenu);
  document.getElementById("kitchenCopyBtn").addEventListener("click", () => {
    copySelection();
    closeMenu();
  });
  document.getElementById("kitchenPasteBtn").addEventListener("click", () => {
    pasteSelection();
    closeMenu();
  });

  menuBackdrop.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const cells = selectedCells();
      saveCells(cells, button.dataset.value);
      closeMenu();
    });
  });
}

function openMenu(cell) {
  activeCell = cell;
  if (!multiSelectedKeys.has(getCellKey(cell))) selectCell(cell);
  if (!menuBackdrop) createMenu();
  const count = selectedCells().length;
  const subtitle = document.getElementById("kitchenMenuSubtitle");
  if (subtitle) {
    subtitle.textContent = count > 1 ? count + " caselle selezionate" : cell.dataset.name + " - " + cell.dataset.day;
  }
  menuBackdrop.classList.add("open");
}

function closeMenu() {
  if (menuBackdrop) menuBackdrop.classList.remove("open");
  activeCell = null;
}

function sendToMonthly() {
  const data = readData();
  localStorage.setItem(publishedWeekStoragePrefix + weekInput.value, JSON.stringify(data));
  setAutosaveStatus("Inviato al mensile " + weekInput.value);
  alert("Turni Cucina / Pizzeria inviati alle presenze mensili.");
}

weekInput.value = localStorage.getItem(weekKey) || getCurrentWeek();
updateWeekRange();
renderTable();
setAutosaveStatus("Pronto");

table.addEventListener("pointerdown", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  isDragging = true;
  dragStarted = false;
  dragAnchor = cell;
  selectCell(cell);
});

table.addEventListener("pointerover", (event) => {
  if (!isDragging || !dragAnchor) return;
  const cell = event.target.closest(".shift-cell");
  if (!cell || cell === dragAnchor) return;
  dragStarted = true;
  selectRange(dragAnchor, cell);
});

document.addEventListener("pointerup", () => {
  isDragging = false;
  dragAnchor = null;
});

table.addEventListener("dblclick", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  openMenu(cell);
});

table.addEventListener("contextmenu", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  event.preventDefault();
  openMenu(cell);
});

table.addEventListener("click", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  if (dragStarted) {
    dragStarted = false;
    return;
  }
  selectCell(cell);
});

weekInput.addEventListener("input", () => {
  localStorage.setItem(weekKey, weekInput.value);
  clearSelection();
  updateWeekRange();
  renderTable();
});

sendMonthlyBtn.addEventListener("click", sendToMonthly);
printBtn.addEventListener("click", () => window.print());
resetBtn.addEventListener("click", () => {
  if (!confirm("Cancellare i turni cucina/pizzeria di questa settimana?")) return;
  localStorage.removeItem(storageKey());
  clearSelection();
  renderTable();
  setAutosaveStatus("Settimana resettata");
});

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
    event.preventDefault();
    copySelection();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
    event.preventDefault();
    pasteSelection();
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    clearSelectionValues();
  }
  if (event.key === "Enter" && selectedCell) {
    event.preventDefault();
    openMenu(selectedCell);
  }
});
