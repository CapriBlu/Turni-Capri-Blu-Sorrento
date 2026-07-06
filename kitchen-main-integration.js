const kitchenWeekStoragePrefixMain = "capriBluTurniCucinaWeekV1-";
const kitchenPublishedWeekStoragePrefixMain = "capriBluTurniCucinaPublishedWeekV1-";

const kitchenMainSections = [
  { title: "Pizzeria", people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"] },
  { title: "Cucina / Lavaggio", people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"] }
];

function kitchenBlankWeekData() {
  const data = {};
  kitchenMainSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = {};
      days.forEach((day) => {
        data[name][day.key] = "";
      });
    });
  });
  return data;
}

function kitchenCurrentWeekKey() {
  return kitchenWeekStoragePrefixMain + weekInput.value;
}

function readKitchenMainData() {
  const saved = localStorage.getItem(kitchenCurrentWeekKey());
  const parsed = safeJsonParse(saved, {}, kitchenCurrentWeekKey());
  const data = Object.assign(kitchenBlankWeekData(), parsed || {});
  kitchenMainSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = Object.assign(kitchenBlankWeekData()[name], data[name] || {});
    });
  });
  return data;
}

function saveKitchenMainData(data) {
  localStorage.setItem(kitchenCurrentWeekKey(), JSON.stringify(data));
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
        td.innerHTML = `
          <button class="shift-cell kitchen-shift-cell one-field" type="button" data-kitchen="true" data-name="${escapeHtml(name)}" data-day="${day.key}" aria-label="Modifica turno ${escapeHtml(name)} ${day.label}">
            ${kitchenCellContent(value)}
          </button>
        `;
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

function saveKitchenCell(cell, value) {
  const name = cell.dataset.name;
  const dayKey = cell.dataset.day;
  if (!name || !dayKey) return;

  const data = readKitchenMainData();
  if (!data[name]) data[name] = {};
  data[name][dayKey] = normalizeKitchenValue(value);
  saveKitchenMainData(data);
  renderTable();
  prepareRequestBadges?.();
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
  shiftContextMenu.style.position = "fixed";
  shiftContextMenu.style.left = x + "px";
  shiftContextMenu.style.top = y + "px";
  shiftContextMenu.style.zIndex = "99998";
  shiftContextMenu.style.minWidth = "205px";
  shiftContextMenu.style.padding = "6px";
  shiftContextMenu.style.border = "1px solid #b8d7ff";
  shiftContextMenu.style.borderRadius = "12px";
  shiftContextMenu.style.background = "#ffffff";
  shiftContextMenu.style.boxShadow = "0 14px 32px rgba(0, 34, 79, 0.22)";

  shiftContextMenu.appendChild(createKitchenMenuButton("M - Mattina", "M"));
  shiftContextMenu.appendChild(createKitchenMenuButton("S - Sera", "S"));
  shiftContextMenu.appendChild(createKitchenMenuButton("M/S - Spezzato", "M/S"));
  shiftContextMenu.appendChild(createKitchenMenuButton("Off - Riposo", "Off"));
  shiftContextMenu.appendChild(createKitchenMenuButton("12/chius", "12/chius"));
  shiftContextMenu.appendChild(createKitchenMenuButton("Vuoto / Off", "Off"));
  shiftContextMenu.appendChild(createMenuButton("Copia selezione", copySelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Incolla", pasteSelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Deseleziona", () => {
    clearSelectedShiftCell();
    anchorShiftCell = null;
  }));

  document.body.appendChild(shiftContextMenu);
  const rect = shiftContextMenu.getBoundingClientRect();
  shiftContextMenu.style.left = Math.max(8, Math.min(x, window.innerWidth - rect.width - 8)) + "px";
  shiftContextMenu.style.top = Math.max(8, Math.min(y, window.innerHeight - rect.height - 8)) + "px";
}

const originalShowShiftContextMenuForKitchen = showShiftContextMenu;
showShiftContextMenu = function (x, y) {
  const hasKitchenSelected = selectedShiftCells.some((cell) => cell.dataset.kitchen === "true");
  if (hasKitchenSelected) {
    showKitchenContextMenu(x, y);
    return;
  }
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

const originalShiftFromPastedTextForKitchen = shiftFromPastedText;
shiftFromPastedText = function (value) {
  const startCell = getTopLeftSelectedShiftCell();
  if (startCell?.dataset.kitchen === "true") {
    return normalizeKitchenValue(value);
  }
  return originalShiftFromPastedTextForKitchen(value);
};

const originalApplyPastedTextToShiftsForKitchen = applyPastedTextToShifts;
applyPastedTextToShifts = function (text) {
  const startCell = getTopLeftSelectedShiftCell();
  if (!startCell?.dataset.kitchen) {
    originalApplyPastedTextToShiftsForKitchen(text);
    return;
  }

  const start = getCellPosition(startCell);
  if (!start) {
    showCopyNotice("Seleziona una cella prima di incollare");
    return;
  }

  const rows = String(text || "").replace(/\r/g, "").split("\n").filter((row, index, list) => !(index === list.length - 1 && row === "")).map((row) => row.split("\t"));
  const data = readKitchenMainData();
  let changed = 0;

  rows.forEach((rowValues, rowOffset) => {
    rowValues.forEach((value, colOffset) => {
      const rowIndex = start.row + rowOffset;
      const colIndex = start.col + colOffset;
      const row = document.getElementById("shiftTable")?.rows[rowIndex];
      const cell = row?.cells[colIndex]?.querySelector(".kitchen-shift-cell");
      if (!cell) return;
      const name = cell.dataset.name;
      const dayKey = cell.dataset.day;
      if (!data[name]) data[name] = {};
      data[name][dayKey] = normalizeKitchenValue(value);
      changed += 1;
    });
  });

  if (!changed) {
    showCopyNotice("Nessun turno cucina incollato");
    return;
  }

  saveKitchenMainData(data);
  renderTable();
  selectedShiftCells = [];
  anchorShiftCell = null;
  showCopyNotice("Turni cucina incollati");
};

function publishKitchenMainToMonthly() {
  const data = readKitchenMainData();
  localStorage.setItem(kitchenPublishedWeekStoragePrefixMain + weekInput.value, JSON.stringify(data));
}

const oldSendMonthlyButton = document.getElementById("sendMonthlyBtn");
oldSendMonthlyButton?.addEventListener("click", publishKitchenMainToMonthly, true);

renderKitchenRowsInMainTable();
