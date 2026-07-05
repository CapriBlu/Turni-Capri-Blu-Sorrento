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

let selectedShiftCell = null;

function clearSelectedShiftCell() {
  if (!selectedShiftCell) return;
  selectedShiftCell.classList.remove("selected-shift-cell");
  selectedShiftCell.style.outline = "";
  selectedShiftCell.style.outlineOffset = "";
  selectedShiftCell.style.boxShadow = "";
  selectedShiftCell = null;
}

function selectShiftCell(cell) {
  clearSelectedShiftCell();
  selectedShiftCell = cell;
  selectedShiftCell.classList.add("selected-shift-cell");
  selectedShiftCell.style.outline = "3px solid #0b63b6";
  selectedShiftCell.style.outlineOffset = "-2px";
  selectedShiftCell.style.boxShadow = "0 0 0 2px #ffffff inset";
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
  selectShiftCell(cell);
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

  if (!Number.isNaN(personIndex) && dayKey && typeof openShiftMenu === "function") {
    openShiftMenu(personIndex, dayKey);
  }
}, true);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") clearSelectedShiftCell();
});

prepareRequestBadges();
