const monthlyArchiveKey = "capriBluArchivioPresenzeMensiliV1";

function archiveMonthInput() {
  return document.getElementById("monthInput");
}

function archiveStorageKey(month) {
  return "capriBluPresenzeMensili-" + month;
}

function readArchive() {
  try {
    return JSON.parse(localStorage.getItem(monthlyArchiveKey) || "{}");
  } catch (error) {
    return {};
  }
}

function saveArchive(archive) {
  localStorage.setItem(monthlyArchiveKey, JSON.stringify(archive));
}

function formatArchiveLabel(month) {
  const [year, monthNumber] = month.split("-");
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);
  return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
}

function currentMonthlyData() {
  const input = archiveMonthInput();
  if (!input?.value) return {};
  try {
    return JSON.parse(localStorage.getItem(archiveStorageKey(input.value)) || "{}");
  } catch (error) {
    return {};
  }
}

function refreshArchiveSelect() {
  const select = document.getElementById("archiveMonthSelect");
  if (!select) return;

  const archive = readArchive();
  const months = Object.keys(archive).sort().reverse();
  select.innerHTML = "";

  if (!months.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = "Archivio vuoto";
    select.appendChild(option);
    return;
  }

  months.forEach((month) => {
    const option = document.createElement("option");
    option.value = month;
    option.textContent = archive[month].label || formatArchiveLabel(month);
    select.appendChild(option);
  });
}

function archiveCurrentMonth() {
  const input = archiveMonthInput();
  if (!input?.value) return;

  const archive = readArchive();
  const month = input.value;

  archive[month] = {
    month,
    label: formatArchiveLabel(month),
    savedAt: new Date().toISOString(),
    data: currentMonthlyData()
  };

  saveArchive(archive);
  refreshArchiveSelect();

  if (typeof setAutosaveStatus === "function") {
    setAutosaveStatus("Archiviato " + formatArchiveLabel(month));
  }
}

function openArchivedMonth() {
  const input = archiveMonthInput();
  const select = document.getElementById("archiveMonthSelect");
  if (!input || !select?.value) return;

  const archive = readArchive();
  const item = archive[select.value];
  if (!item) return;

  input.value = item.month;
  localStorage.setItem("capriBluPresenzeMese", item.month);
  localStorage.setItem(archiveStorageKey(item.month), JSON.stringify(item.data || {}));

  if (typeof renderTable === "function") renderTable();
  if (typeof setAutosaveStatus === "function") setAutosaveStatus("Aperto " + (item.label || item.month));
}

function deleteArchivedMonth() {
  const select = document.getElementById("archiveMonthSelect");
  if (!select?.value) return;

  const archive = readArchive();
  const label = archive[select.value]?.label || select.value;
  if (!confirm("Eliminare dall'archivio " + label + "?")) return;

  delete archive[select.value];
  saveArchive(archive);
  refreshArchiveSelect();

  if (typeof setAutosaveStatus === "function") setAutosaveStatus("Archivio eliminato");
}

function buildArchiveControls() {
  const toolbar = document.querySelector(".toolbar");
  const printButton = document.getElementById("printBtn");
  if (!toolbar || !printButton || document.getElementById("archiveMonthBtn")) return;

  const saveBtn = document.createElement("button");
  saveBtn.id = "archiveMonthBtn";
  saveBtn.type = "button";
  saveBtn.className = "copy-btn";
  saveBtn.textContent = "Archivia mese";

  const select = document.createElement("select");
  select.id = "archiveMonthSelect";
  select.className = "archive-select";
  select.setAttribute("aria-label", "Archivio mensile");

  const openBtn = document.createElement("button");
  openBtn.id = "openArchiveBtn";
  openBtn.type = "button";
  openBtn.textContent = "Apri archivio";

  const deleteBtn = document.createElement("button");
  deleteBtn.id = "deleteArchiveBtn";
  deleteBtn.type = "button";
  deleteBtn.textContent = "Elimina archivio";

  toolbar.insertBefore(saveBtn, printButton);
  toolbar.insertBefore(select, printButton);
  toolbar.insertBefore(openBtn, printButton);
  toolbar.insertBefore(deleteBtn, printButton);

  saveBtn.addEventListener("click", archiveCurrentMonth);
  openBtn.addEventListener("click", openArchivedMonth);
  deleteBtn.addEventListener("click", deleteArchivedMonth);

  refreshArchiveSelect();
}

buildArchiveControls();
