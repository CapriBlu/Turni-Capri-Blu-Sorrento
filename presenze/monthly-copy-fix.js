const monthlyClipboardFixedKey = "capriBluPresenzeCopiaFixedV1";

function monthlyFixedStorageKey() {
  return "capriBluPresenzeMensili-" + monthInput.value;
}

function monthlyFixedReadData() {
  try {
    return JSON.parse(localStorage.getItem(monthlyFixedStorageKey()) || "{}");
  } catch (error) {
    return {};
  }
}

function monthlyFixedSaveData(data, text) {
  localStorage.setItem(monthlyFixedStorageKey(), JSON.stringify(data));
  if (typeof setAutosaveStatus === "function") setAutosaveStatus(text);
}

function monthlyFixedKey(cell) {
  return cell.dataset.name + "-" + cell.dataset.day;
}

function monthlyFixedRecord(cell) {
  const data = monthlyFixedReadData();
  const saved = data[monthlyFixedKey(cell)];
  if (saved) return typeof saved === "string" ? { value: saved, minutes: 0 } : saved;
  return {
    value: cell.dataset.value || "",
    minutes: Number(cell.dataset.minutes || 0)
  };
}

function monthlyFixedCells() {
  const selected = Array.from(document.querySelectorAll(".presence-cell.multi-selected"));
  if (selected.length) return selected;
  const single = document.querySelector(".presence-cell.selected-cell");
  return single ? [single] : [];
}

function monthlyCopySelection() {
  const cells = monthlyFixedCells();
  if (!cells.length) return;
  const records = cells.map((cell) => monthlyFixedRecord(cell));
  localStorage.setItem(monthlyClipboardFixedKey, JSON.stringify(records));
  if (typeof setAutosaveStatus === "function") {
    setAutosaveStatus(cells.length === 1 ? "Cella copiata" : cells.length + " celle copiate");
  }
}

function monthlyReadCopiedRecords() {
  try {
    const saved = JSON.parse(localStorage.getItem(monthlyClipboardFixedKey) || "[]");
    return Array.isArray(saved) ? saved : [saved];
  } catch (error) {
    return [];
  }
}

function monthlyPasteSelection() {
  const cells = monthlyFixedCells();
  const records = monthlyReadCopiedRecords();
  if (!cells.length || !records.length) return;

  const data = monthlyFixedReadData();
  cells.forEach((cell, index) => {
    const record = records.length === cells.length ? records[index] : records[index % records.length];
    data[monthlyFixedKey(cell)] = {
      value: record.value || "",
      minutes: Number(record.minutes || 0)
    };
  });

  monthlyFixedSaveData(data, cells.length === 1 ? "Incollato" : cells.length + " celle incollate");
  renderTable();
}

function monthlyClearSelectionValues() {
  const cells = monthlyFixedCells();
  if (!cells.length) return;
  const data = monthlyFixedReadData();
  cells.forEach((cell) => delete data[monthlyFixedKey(cell)]);
  monthlyFixedSaveData(data, cells.length === 1 ? "Cella svuotata" : cells.length + " celle svuotate");
  renderTable();
}
