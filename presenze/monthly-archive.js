const monthlyArchiveKey = "capriBluArchivioPresenzeMensiliV1";

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
  try {
    return JSON.parse(localStorage.getItem(archiveStorageKey(monthInput.value)) || "{}");
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
  const archive = readArchive();
  const month = monthInput.value;

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
  const select = document.getElementById("archiveMonthSelect");
  if (!select || !select.value) return;

  const archive = readArchive();
  const item = archive[select.value];
  if (!item) return;

  monthInput.value = item.month;
  localStorage.setItem("capriBluPresenzeMese", item.month);
  localStorage.setItem(archiveStorageKey(item.month), JSON.stringify(item.data || {}));

  if (typeof renderTable === "function") renderTable();
  if (typeof setAutosaveStatus === "function") setAutosaveStatus("Aperto " + (item.label || item.month));
}

function deleteArchivedMonth() {
  const select = document.getElementById("archiveMonthSelect");
  if (!select || !select.value) return;

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
  if (!toolbar || document.getElementById("archiveMonthBtn")) return;

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

  toolbar.insertBefore(saveBtn, printBtn);
  toolbar.insertBefore(select, printBtn);
  toolbar.insertBefore(openBtn, printBtn);
  toolbar.insertBefore(deleteBtn, printBtn);

  saveBtn.addEventListener("click", archiveCurrentMonth);
  openBtn.addEventListener("click", openArchivedMonth);
  deleteBtn.addEventListener("click", deleteArchivedMonth);

  refreshArchiveSelect();
}

buildArchiveControls();
