const kitchenWeekStoragePrefixMain = "capriBluTurniCucinaWeekV1-";
const kitchenPublishedWeekStoragePrefixMain = "capriBluTurniCucinaPublishedWeekV1-";
const kitchenForceVersionKey = "capriBluKitchenW28ForceVersionV2";

const kitchenMainSections = [
  { title: "Pizzeria", people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"] },
  { title: "Cucina / Lavaggio", people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"] }
];

const kitchenDefaultWeeks = {
  "2026-W28": {
    "LUCA": { "lunedi": "M/S", "martedi": "M/S", "mercoledi": "M/S", "giovedi": "Off", "venerdi": "M/S", "sabato": "M/S", "domenica": "S" },
    "MARIO": { "lunedi": "S", "martedi": "Off", "mercoledi": "S", "giovedi": "M/S", "venerdi": "M/S", "sabato": "S", "domenica": "M/S" },
    "IGOR": { "lunedi": "Off", "martedi": "S", "mercoledi": "M/S", "giovedi": "M/S", "venerdi": "S", "sabato": "M/S", "domenica": "M/S" },
    "CRISTIAN": { "lunedi": "", "martedi": "", "mercoledi": "", "giovedi": "S", "venerdi": "", "sabato": "S", "domenica": "S" },
    "PIETRO": { "lunedi": "Pietro", "martedi": "Pietro", "mercoledi": "", "giovedi": "", "venerdi": "", "sabato": "", "domenica": "" },
    "ANTONINO": { "lunedi": "M", "martedi": "M", "mercoledi": "Off", "giovedi": "M", "venerdi": "M", "sabato": "M", "domenica": "M" },
    "Lavapiatti": { "lunedi": "Off", "martedi": "M/S", "mercoledi": "M/S", "giovedi": "M/S", "venerdi": "M/S", "sabato": "M/S", "domenica": "M/S" },
    "AJITH": { "lunedi": "S", "martedi": "S", "mercoledi": "S", "giovedi": "Off", "venerdi": "S", "sabato": "S", "domenica": "S" },
    "DIEGO": { "lunedi": "M/S", "martedi": "S", "mercoledi": "M/S", "giovedi": "M/S", "venerdi": "Off", "sabato": "S", "domenica": "S" },
    "Saja": { "lunedi": "Off", "martedi": "12/chius", "mercoledi": "M/S", "giovedi": "12/chius", "venerdi": "12/chius", "sabato": "12/chius", "domenica": "12/chius" }
  }
};

function kitchenBlankWeekData() {
  const data = {};
  kitchenMainSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = {};
      days.forEach((day) => { data[name][day.key] = ""; });
    });
  });
  return data;
}

function kitchenCurrentWeekKey() {
  return kitchenWeekStoragePrefixMain + weekInput.value;
}

function kitchenPublishedWeekKey() {
  return kitchenPublishedWeekStoragePrefixMain + weekInput.value;
}

function copyKitchenWeekData(data) {
  return JSON.parse(JSON.stringify(data || {}));
}

function forceKitchenW28IfNeeded() {
  if (weekInput.value !== "2026-W28") return;
  const currentVersion = localStorage.getItem(kitchenForceVersionKey);
  if (currentVersion === "2") return;
  const data = copyKitchenWeekData(kitchenDefaultWeeks["2026-W28"]);
  localStorage.setItem(kitchenCurrentWeekKey(), JSON.stringify(data));
  localStorage.setItem(kitchenPublishedWeekKey(), JSON.stringify(data));
  localStorage.setItem(kitchenForceVersionKey, "2");
}

function readKitchenMainData() {
  forceKitchenW28IfNeeded();
  const saved = localStorage.getItem(kitchenCurrentWeekKey());
  const defaultData = kitchenDefaultWeeks[weekInput.value] || kitchenBlankWeekData();
  const parsed = safeJsonParse(saved, defaultData, kitchenCurrentWeekKey());
  const data = Object.assign(kitchenBlankWeekData(), parsed || defaultData || {});
  kitchenMainSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = Object.assign(kitchenBlankWeekData()[name], data[name] || {});
    });
  });
  return data;
}

function saveKitchenMainData(data) {
  localStorage.setItem(kitchenCurrentWeekKey(), JSON.stringify(data));
  if (weekInput.value === "2026-W28") localStorage.setItem(kitchenForceVersionKey, "2");
}

function kitchenShiftClass(value) {
  const clean = String(value || "").toLowerCase();
  if (!clean || clean === "off") return "riposo";
  if (clean === "m") return "pranzo";
  if (clean === "s") return "sera";
  if (clean === "m/s") return "spezzato";
  if (clean === "12/chius") return "sera";
  return "sera";
}

function kitchenCellContent(value) {
  const clean = String(value || "").trim();
  const display = clean || "Off";
  return `<span class="shift-time single ${kitchenShiftClass(display)}">${escapeHtml(display)}</span>`;
}

function renderKitchenRowsInMainTable() {
  const data = readKitchenMainData();
  const oldRows = scheduleBody.querySelectorAll(".kitchen-section-row, .kitchen-person-row");
  oldRows.forEach((row) => row.remove());

  kitchenMainSections.forEach((section) => {
    const sectionRow = document.createElement("tr");
    sectionRow.className = "kitchen-section-row";
    sectionRow.innerHTML = `<td colspan="8">${escapeHtml(section.title)}</td>`;
    scheduleBody.appendChild(sectionRow);

    section.people.forEach((name) => {
      const row = document.createElement("tr");
      row.className = "kitchen-person-row";
      row.innerHTML = `<td class="kitchen-name-cell">${escapeHtml(name)}</td>`;
      days.forEach((day) => {
        const value = data[name]?.[day.key] || "";
        const td = document.createElement("td");
        td.innerHTML = `<button class="shift-cell kitchen-shift-cell one-field" type="button" data-kitchen="true" data-name="${escapeHtml(name)}" data-day="${day.key}" aria-label="Modifica turno ${escapeHtml(name)} ${day.label}">${kitchenCellContent(value)}</button>`;
        row.appendChild(td);
      });
      scheduleBody.appendChild(row);
    });
  });
}

const originalRenderTableForKitchenMain = renderTable;
renderTable = function () {
  originalRenderTableForKitchenMain();
  renderKitchenRowsInMainTable();
};

function normalizeKitchenValue(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();
  if (!clean || lower === "off" || lower === "riposo" || lower === "r" || lower === "vuoto" || lower === "-") return "Off";
  if (lower === "m" || lower === "mattina") return "M";
  if (lower === "s" || lower === "sera") return "S";
  if (lower === "m/s" || lower === "ms" || lower === "spezzato") return "M/S";
  if (lower === "12/chius" || lower === "12 chius" || lower === "12/chiusura" || lower === "12 chiusura") return "12/chius";
  return clean;
}

function applyKitchenValueToSelected(value) {
  const cells = selectedShiftCells.filter((cell) => cell.dataset.kitchen === "true");
  if (!cells.length) return;
  const data = readKitchenMainData();
  cells.forEach((cell) => {
    const name = cell.dataset.name;
    const dayKey = cell.dataset.day;
    if (!data[name]) data[name] = {};
    data[name][dayKey] = normalizeKitchenValue(value);
  });
  saveKitchenMainData(data);
  renderTable();
  prepareRequestBadges?.();
}

function createKitchenMenuButton(label, value) {
  return createMenuButton(label, () => applyKitchenValueToSelected(value));
}

function showKitchenContextMenu(x, y) {
  hideShiftContextMenu();
  shiftContextMenu = document.createElement("div");
  shiftContextMenu.className = "shift-context-menu kitchen-context-menu";
  Object.assign(shiftContextMenu.style, {
    position: "fixed", left: x + "px", top: y + "px", zIndex: "99998", minWidth: "205px", padding: "6px",
    border: "1px solid #b8d7ff", borderRadius: "12px", background: "#ffffff", boxShadow: "0 14px 32px rgba(0, 34, 79, 0.22)"
  });
  shiftContextMenu.appendChild(createKitchenMenuButton("M - Mattina", "M"));
  shiftContextMenu.appendChild(createKitchenMenuButton("S - Sera", "S"));
  shiftContextMenu.appendChild(createKitchenMenuButton("M/S - Spezzato", "M/S"));
  shiftContextMenu.appendChild(createKitchenMenuButton("Off - Riposo", "Off"));
  shiftContextMenu.appendChild(createKitchenMenuButton("12/chius", "12/chius"));
  shiftContextMenu.appendChild(createKitchenMenuButton("Vuoto / Off", "Off"));
  shiftContextMenu.appendChild(createMenuButton("Copia selezione", copySelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Incolla", pasteSelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Deseleziona", () => { clearSelectedShiftCell(); anchorShiftCell = null; }));
  document.body.appendChild(shiftContextMenu);
  const rect = shiftContextMenu.getBoundingClientRect();
  shiftContextMenu.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + "px";
  shiftContextMenu.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + "px";
}

const originalShowShiftContextMenuForKitchen = showShiftContextMenu;
showShiftContextMenu = function (x, y) {
  if (selectedShiftCells.some((cell) => cell.dataset.kitchen === "true")) return showKitchenContextMenu(x, y);
  originalShowShiftContextMenuForKitchen(x, y);
};

const originalOpenShiftMenuForKitchen = openShiftMenu;
openShiftMenu = function (personIndex, dayKey) {
  const kitchenCell = selectedShiftCells.find((cell) => cell.dataset.kitchen === "true") || document.activeElement?.closest?.(".kitchen-shift-cell");
  if (kitchenCell) {
    if (!selectedShiftCells.includes(kitchenCell)) selectShiftCell(kitchenCell);
    const rect = kitchenCell.getBoundingClientRect();
    showKitchenContextMenu(rect.left + 8, rect.bottom + 8);
    return;
  }
  originalOpenShiftMenuForKitchen(personIndex, dayKey);
};

const originalApplyPastedTextToShiftsForKitchen = applyPastedTextToShifts;
applyPastedTextToShifts = function (text) {
  const startCell = getTopLeftSelectedShiftCell();
  if (!startCell?.dataset.kitchen) return originalApplyPastedTextToShiftsForKitchen(text);
  const start = getCellPosition(startCell);
  if (!start) return showCopyNotice("Seleziona una cella prima di incollare");
  const rows = String(text || "").replace(/\r/g, "").split("\n").filter((row, index, list) => !(index === list.length - 1 && row === "")).map((row) => row.split("\t"));
  const data = readKitchenMainData();
  let changed = 0;
  rows.forEach((rowValues, rowOffset) => {
    rowValues.forEach((value, colOffset) => {
      const row = document.getElementById("shiftTable")?.rows[start.row + rowOffset];
      const cell = row?.cells[start.col + colOffset]?.querySelector(".kitchen-shift-cell");
      if (!cell) return;
      const name = cell.dataset.name;
      const dayKey = cell.dataset.day;
      if (!data[name]) data[name] = {};
      data[name][dayKey] = normalizeKitchenValue(value);
      changed += 1;
    });
  });
  if (!changed) return showCopyNotice("Nessun turno cucina incollato");
  saveKitchenMainData(data);
  renderTable();
  selectedShiftCells = [];
  anchorShiftCell = null;
  showCopyNotice("Turni cucina incollati");
};

function publishKitchenMainToMonthly() {
  const data = readKitchenMainData();
  localStorage.setItem(kitchenPublishedWeekKey(), JSON.stringify(data));
}

document.getElementById("sendMonthlyBtn")?.addEventListener("click", publishKitchenMainToMonthly, true);
forceKitchenW28IfNeeded();
renderKitchenRowsInMainTable();
