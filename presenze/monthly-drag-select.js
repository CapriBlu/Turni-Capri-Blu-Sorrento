const monthlySelection = new Set();
let monthlyDragging = false;
let monthlyDidDrag = false;
const monthlyCopiedKey = "capriBluPresenzeCopiaV1";

function monthlyCellKey(cell) {
  return cell.dataset.name + "-" + cell.dataset.day;
}

function monthlyStorageKey() {
  return "capriBluPresenzeMensili-" + monthInput.value;
}

function monthlyReadData() {
  try {
    return JSON.parse(localStorage.getItem(monthlyStorageKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function monthlySaveData(data, message = "Salvato") {
  localStorage.setItem(monthlyStorageKey(), JSON.stringify(data));
  if (typeof setAutosaveStatus === "function") {
    setAutosaveStatus(message + " " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
  }
}

function monthlyGetRecord(cell) {
  const data = monthlyReadData();
  const saved = data[monthlyCellKey(cell)];
  if (saved) return typeof saved === "string" ? { value: saved, minutes: 0 } : saved;
  return {
    value: cell.dataset.value || "",
    minutes: Number(cell.dataset.minutes || 0)
  };
}

function monthlySelectedCells() {
  return Array.from(document.querySelectorAll(".presence-cell.multi-selected"));
}

function monthlyClearVisualSelection() {
  document.querySelectorAll(".presence-cell.multi-selected").forEach((cell) => {
    cell.classList.remove("multi-selected");
  });
  monthlySelection.clear();
}

function monthlyAddCell(cell) {
  if (!cell || monthlySelection.has(monthlyCellKey(cell))) return;
  monthlySelection.add(monthlyCellKey(cell));
  cell.classList.add("multi-selected");
}

function monthlyRestoreVisualSelection() {
  document.querySelectorAll(".presence-cell").forEach((cell) => {
    cell.classList.toggle("multi-selected", monthlySelection.has(monthlyCellKey(cell)));
  });
}

function monthlyRerenderKeepSelection() {
  if (typeof renderTable === "function") renderTable();
  monthlyRestoreVisualSelection();
}

function monthlyCopySelection() {
  const cells = monthlySelectedCells();
  if (!cells.length) return;
  const records = cells.map((cell) => monthlyGetRecord(cell));
  localStorage.setItem(monthlyCopiedKey, JSON.stringify(records));
  if (typeof setAutosaveStatus === "function") {
    setAutosaveStatus(cells.length === 1 ? "Cella copiata" : `${cells.length} celle copiate`);
  }
}

function monthlyReadCopiedRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(monthlyCopiedKey) || "null");
    if (!saved) return [];
    return Array.isArray(saved) ? saved : [saved];
  } catch (error) {
    return [];
  }
}

function monthlyPasteSelection() {
  const cells = monthlySelectedCells();
  const records = monthlyReadCopiedRecords();
  if (!cells.length || !records.length) return;

  const data = monthlyReadData();
  cells.forEach((cell, index) => {
    const source = records.length === cells.length ? records[index] : records[index % records.length];
    data[monthlyCellKey(cell)] = {
      value: source?.value || "",
      minutes: Number(source?.minutes || 0)
    };
  });

  monthlySaveData(data, cells.length === 1 ? "Incollato" : `${cells.length} celle incollate`);
  monthlyRerenderKeepSelection();
}

function monthlyClearSelectionValues() {
  const cells = monthlySelectedCells();
  if (!cells.length) return;
  const data = monthlyReadData();
  cells.forEach((cell) => delete data[monthlyCellKey(cell)]);
  monthlySaveData(data, cells.length === 1 ? "Cella svuotata" : `${cells.length} celle svuotate`);
  monthlyRerenderKeepSelection();
}

function monthlySelectCellOnly(cell) {
  monthlyClearVisualSelection();
  monthlyAddCell(cell);
}

// Selezione multipla: tieni premuto il tasto sinistro e trascina sulle celle.
table.addEventListener("mousedown", (event) => {
  if (event.button !== 0) return;
  const cell = event.target.closest(".presence-cell");
  if (!cell) return;

  monthlyDragging = true;
  monthlyDidDrag = false;
  monthlySelectCellOnly(cell);
  event.preventDefault();
});

table.addEventListener("mouseover", (event) => {
  if (!monthlyDragging) return;
  const cell = event.target.closest(".presence-cell");
  if (!cell) return;
  monthlyDidDrag = true;
  monthlyAddCell(cell);
});

document.addEventListener("mouseup", () => {
  if (!monthlyDragging) return;
  monthlyDragging = false;
});

// Se hai trascinato, non aprire il menu della singola cella.
table.addEventListener("click", (event) => {
  if (!monthlyDidDrag) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  monthlyDidDrag = false;
}, true);

copyBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  monthlyCopySelection();
}, true);

pasteBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  monthlyPasteSelection();
}, true);

clearBtn?.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopImmediatePropagation();
  monthlyClearSelectionValues();
}, true);

document.addEventListener("keydown", (event) => {
  if (!monthlySelectedCells().length) return;

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
    event.preventDefault();
    event.stopImmediatePropagation();
    monthlyCopySelection();
  }

  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
    event.preventDefault();
    event.stopImmediatePropagation();
    monthlyPasteSelection();
  }

  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    event.stopImmediatePropagation();
    monthlyClearSelectionValues();
  }
}, true);
