function prepareRequestBadges() {
  document.querySelectorAll(".request-badge").forEach((badge) => {
    if (badge.dataset.prepared === "true") return;

    const originalType = badge.textContent.trim() || "Richiesta";
    const note = badge.dataset.note || badge.getAttribute("title") || "Nessuna nota";

    badge.dataset.originalType = originalType;
    badge.dataset.note = note;
    badge.textContent = "Richiesta";
    badge.title = note;
    badge.dataset.prepared = "true";
    badge.setAttribute("aria-label", "Richiesta: " + note);
  });
}

let selectedShiftCells = [];
let anchorShiftCell = null;
let shiftContextMenu = null;
let isDraggingShiftSelection = false;
let dragStartShiftCell = null;
let dragMovedShiftSelection = false;
let suppressNextShiftClick = false;

function clearSelectedShiftCell() {
  selectedShiftCells.forEach((cell) => {
    cell.classList.remove("selected-shift-cell");
    cell.style.outline = "";
    cell.style.outlineOffset = "";
    cell.style.boxShadow = "";
  });
  selectedShiftCells = [];
}

function markShiftCell(cell) {
  if (!cell || selectedShiftCells.includes(cell)) return;
  selectedShiftCells.push(cell);
  cell.classList.add("selected-shift-cell");
  cell.style.outline = "3px solid #0b63b6";
  cell.style.outlineOffset = "-2px";
  cell.style.boxShadow = "0 0 0 2px #ffffff inset";
}

function getCellPosition(cell) {
  const td = cell.closest("td");
  const tr = cell.closest("tr");
  if (!td || !tr) return null;
  return { row: tr.rowIndex, col: td.cellIndex };
}

function selectShiftCell(cell) {
  clearSelectedShiftCell();
  anchorShiftCell = cell;
  markShiftCell(cell);
}

function selectShiftRange(fromCell, toCell) {
  const table = document.getElementById("shiftTable");
  const from = getCellPosition(fromCell);
  const to = getCellPosition(toCell);
  if (!table || !from || !to) {
    selectShiftCell(toCell);
    return;
  }

  clearSelectedShiftCell();

  const rowStart = Math.min(from.row, to.row);
  const rowEnd = Math.max(from.row, to.row);
  const colStart = Math.min(from.col, to.col);
  const colEnd = Math.max(from.col, to.col);

  for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex += 1) {
    const row = table.rows[rowIndex];
    if (!row) continue;

    for (let colIndex = colStart; colIndex <= colEnd; colIndex += 1) {
      const cellButton = row.cells[colIndex]?.querySelector(".shift-cell");
      if (cellButton) markShiftCell(cellButton);
    }
  }
}

function getShiftCellText(cell) {
  const parts = Array.from(cell.querySelectorAll(".shift-time"))
    .map((part) => part.textContent.trim())
    .filter(Boolean);

  return parts.length ? parts.join(" / ") : cell.textContent.trim();
}

function buildSelectedCellsText() {
  if (!selectedShiftCells.length) return "";

  const selectedMap = new Map();
  const positions = [];

  selectedShiftCells.forEach((cell) => {
    const position = getCellPosition(cell);
    if (!position) return;
    const key = position.row + ":" + position.col;
    selectedMap.set(key, getShiftCellText(cell));
    positions.push(position);
  });

  if (!positions.length) return "";

  const rowStart = Math.min(...positions.map((position) => position.row));
  const rowEnd = Math.max(...positions.map((position) => position.row));
  const colStart = Math.min(...positions.map((position) => position.col));
  const colEnd = Math.max(...positions.map((position) => position.col));
  const rows = [];

  for (let rowIndex = rowStart; rowIndex <= rowEnd; rowIndex += 1) {
    const values = [];
    for (let colIndex = colStart; colIndex <= colEnd; colIndex += 1) {
      values.push(selectedMap.get(rowIndex + ":" + colIndex) || "");
    }
    rows.push(values.join("\t"));
  }

  return rows.join("\n");
}

function getTopLeftSelectedShiftCell() {
  if (!selectedShiftCells.length) return anchorShiftCell;

  return selectedShiftCells
    .slice()
    .sort((a, b) => {
      const posA = getCellPosition(a);
      const posB = getCellPosition(b);
      if (!posA || !posB) return 0;
      if (posA.row !== posB.row) return posA.row - posB.row;
      return posA.col - posB.col;
    })[0];
}

function normalizePastedValue(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean || lower === "riposo" || lower === "riposto" || lower === "vuoto" || lower === "-" || lower === "—") {
    return "Riposo";
  }

  if (lower === "apertura" || lower === "a") return "Apertura";
  if (lower === "pranzo" || lower === "p") return "Pranzo";
  if (lower === "sera" || lower === "s") return "Sera";
  if (lower === "cena" || lower === "c") return "Cena";

  return clean;
}

function pastedValueLooksLikeSera(value) {
  const lower = String(value || "").trim().toLowerCase();
  if (["sera", "s", "cena", "c"].includes(lower)) return true;

  const match = lower.match(/(\d{1,2})[.:]/);
  if (!match) return false;

  const hour = Number(match[1]);
  return !Number.isNaN(hour) && hour >= 16;
}

function shiftFromPastedText(value) {
  const clean = String(value || "").trim();
  if (!clean) return { pranzo: "Riposo", sera: "Riposo" };

  const parts = clean.split("/").map((part) => normalizePastedValue(part));

  if (parts.length >= 2) {
    return {
      pranzo: parts[0] || "Riposo",
      sera: parts[1] || "Riposo"
    };
  }

  const single = normalizePastedValue(clean);

  if (single === "Riposo") {
    return { pranzo: "Riposo", sera: "Riposo" };
  }

  if (pastedValueLooksLikeSera(single)) {
    return { pranzo: "Riposo", sera: single };
  }

  return { pranzo: single, sera: "Riposo" };
}

function applyPastedTextToShifts(text) {
  if (typeof staff === "undefined" || typeof days === "undefined") {
    showCopyNotice("Dati turni non disponibili");
    return;
  }

  const startCell = getTopLeftSelectedShiftCell();
  const start = startCell ? getCellPosition(startCell) : null;
  if (!start) {
    showCopyNotice("Seleziona una cella prima di incollare");
    return;
  }

  const rows = String(text || "")
    .replace(/\r/g, "")
    .split("\n")
    .filter((row, index, list) => !(index === list.length - 1 && row === ""))
    .map((row) => row.split("\t"));

  if (!rows.length) {
    showCopyNotice("Niente da incollare");
    return;
  }

  let changed = 0;

  rows.forEach((rowValues, rowOffset) => {
    rowValues.forEach((value, colOffset) => {
      const rowIndex = start.row + rowOffset;
      const colIndex = start.col + colOffset;
      const personIndex = rowIndex - 1;
      const dayIndex = colIndex - 1;

      if (!staff[personIndex] || !days[dayIndex]) return;

      const dayKey = days[dayIndex].key;
      staff[personIndex].turni[dayKey] = shiftFromPastedText(value);
      changed += 1;
    });
  });

  if (!changed) {
    showCopyNotice("Nessun turno incollato");
    return;
  }

  saveStaff();
  renderTable();
  prepareRequestBadges();
  selectedShiftCells = [];
  anchorShiftCell = null;
  showCopyNotice("Turni incollati");
}

async function pasteSelectedCellsFromMenu() {
  let text = "";

  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      text = await navigator.clipboard.readText();
    }
  } catch (error) {
    text = "";
  }

  if (!text) {
    const manualText = window.prompt("Incolla qui i dati copiati da Excel o Google Sheets:");
    if (manualText === null) return;
    text = manualText;
  }

  if (!String(text).trim()) {
    showCopyNotice("Niente da incollare");
    return;
  }

  applyPastedTextToShifts(text);
}

function showCopyNotice(message) {
  const oldNotice = document.getElementById("shiftCopyNotice");
  if (oldNotice) oldNotice.remove();

  const notice = document.createElement("div");
  notice.id = "shiftCopyNotice";
  notice.textContent = message;
  notice.style.position = "fixed";
  notice.style.left = "50%";
  notice.style.bottom = "24px";
  notice.style.transform = "translateX(-50%)";
  notice.style.zIndex = "99999";
  notice.style.padding = "10px 16px";
  notice.style.borderRadius = "999px";
  notice.style.background = "#063b7a";
  notice.style.color = "#ffffff";
  notice.style.fontWeight = "800";
  notice.style.boxShadow = "0 8px 22px rgba(0, 0, 0, 0.22)";
  document.body.appendChild(notice);

  window.setTimeout(() => notice.remove(), 1300);
}

function copySelectedCellsFromMenu() {
  const text = buildSelectedCellsText();
  if (!text) {
    showCopyNotice("Nessuna cella selezionata");
    return;
  }

  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "readonly");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  area.style.top = "0";
  document.body.appendChild(area);
  area.select();

  try {
    document.execCommand("copy");
    showCopyNotice("Selezione copiata");
  } catch (error) {
    showCopyNotice("Usa CTRL + C");
  }

  area.remove();
}

function hideShiftContextMenu() {
  if (!shiftContextMenu) return;
  shiftContextMenu.remove();
  shiftContextMenu = null;
}

function createMenuButton(label, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = label;
  button.style.display = "block";
  button.style.width = "100%";
  button.style.padding = "10px 14px";
  button.style.border = "0";
  button.style.background = "#ffffff";
  button.style.color = "#063b7a";
  button.style.textAlign = "left";
  button.style.fontSize = "0.95rem";
  button.style.fontWeight = "800";
  button.style.cursor = "pointer";
  button.addEventListener("mouseenter", () => {
    button.style.background = "#eaf3ff";
  });
  button.addEventListener("mouseleave", () => {
    button.style.background = "#ffffff";
  });
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    hideShiftContextMenu();
    action();
  });
  return button;
}

function showShiftContextMenu(x, y) {
  hideShiftContextMenu();

  shiftContextMenu = document.createElement("div");
  shiftContextMenu.className = "shift-context-menu";
  shiftContextMenu.style.position = "fixed";
  shiftContextMenu.style.left = x + "px";
  shiftContextMenu.style.top = y + "px";
  shiftContextMenu.style.zIndex = "99998";
  shiftContextMenu.style.minWidth = "185px";
  shiftContextMenu.style.padding = "6px";
  shiftContextMenu.style.border = "1px solid #b8d7ff";
  shiftContextMenu.style.borderRadius = "12px";
  shiftContextMenu.style.background = "#ffffff";
  shiftContextMenu.style.boxShadow = "0 14px 32px rgba(0, 34, 79, 0.22)";

  shiftContextMenu.appendChild(createMenuButton("Copia selezione", copySelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Incolla", pasteSelectedCellsFromMenu));
  shiftContextMenu.appendChild(createMenuButton("Deseleziona", () => {
    clearSelectedShiftCell();
    anchorShiftCell = null;
  }));

  document.body.appendChild(shiftContextMenu);

  const rect = shiftContextMenu.getBoundingClientRect();
  const left = Math.min(x, window.innerWidth - rect.width - 8);
  const top = Math.min(y, window.innerHeight - rect.height - 8);
  shiftContextMenu.style.left = Math.max(8, left) + "px";
  shiftContextMenu.style.top = Math.max(8, top) + "px";
}

document.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  if (event.target.closest(".shift-context-menu")) return;

  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  hideShiftContextMenu();
  isDraggingShiftSelection = true;
  dragStartShiftCell = cell;
  dragMovedShiftSelection = false;
  document.body.style.userSelect = "none";
  selectShiftCell(cell);
}, true);

document.addEventListener("mouseover", (event) => {
  if (!isDraggingShiftSelection || !dragStartShiftCell) return;
  if ((event.buttons & 1) !== 1) return;

  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (cell !== dragStartShiftCell) dragMovedShiftSelection = true;
  selectShiftRange(dragStartShiftCell, cell);
}, true);

document.addEventListener("mouseup", () => {
  if (!isDraggingShiftSelection) return;

  if (dragMovedShiftSelection) suppressNextShiftClick = true;

  isDraggingShiftSelection = false;
  dragStartShiftCell = null;
  dragMovedShiftSelection = false;
  document.body.style.userSelect = "";
}, true);

document.addEventListener("click", (event) => {
  if (event.target.closest(".shift-context-menu")) return;
  hideShiftContextMenu();

  const badge = event.target.closest(".request-badge");
  if (badge) {
    prepareRequestBadges();
    return;
  }

  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (suppressNextShiftClick) {
    suppressNextShiftClick = false;
    return;
  }

  if (event.shiftKey && anchorShiftCell) {
    selectShiftRange(anchorShiftCell, cell);
  } else {
    selectShiftCell(cell);
  }
}, true);

document.addEventListener("contextmenu", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) {
    hideShiftContextMenu();
    return;
  }

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  if (!selectedShiftCells.includes(cell)) {
    selectShiftCell(cell);
  }

  showShiftContextMenu(event.clientX, event.clientY);
}, true);

document.addEventListener("copy", (event) => {
  const text = buildSelectedCellsText();
  if (!text) return;

  event.preventDefault();
  event.clipboardData.setData("text/plain", text);
});

document.addEventListener("dblclick", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();

  const personIndex = Number(cell.dataset.person);
  const dayKey = cell.dataset.day;
  clearSelectedShiftCell();
  anchorShiftCell = null;
  hideShiftContextMenu();

  if (!Number.isNaN(personIndex) && dayKey && typeof openShiftMenu === "function") {
    openShiftMenu(personIndex, dayKey);
  }
}, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearSelectedShiftCell();
    anchorShiftCell = null;
    hideShiftContextMenu();
  }
});

window.addEventListener("scroll", hideShiftContextMenu, true);
window.addEventListener("resize", hideShiftContextMenu);
window.addEventListener("blur", () => {
  isDraggingShiftSelection = false;
  dragStartShiftCell = null;
  dragMovedShiftSelection = false;
  document.body.style.userSelect = "";
});

prepareRequestBadges();
