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

document.addEventListener("click", (event) => {
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

  if (event.shiftKey && anchorShiftCell) {
    selectShiftRange(anchorShiftCell, cell);
  } else {
    selectShiftCell(cell);
  }
}, true);

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

  if (!Number.isNaN(personIndex) && dayKey && typeof openShiftMenu === "function") {
    openShiftMenu(personIndex, dayKey);
  }
}, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearSelectedShiftCell();
    anchorShiftCell = null;
  }
});

prepareRequestBadges();
