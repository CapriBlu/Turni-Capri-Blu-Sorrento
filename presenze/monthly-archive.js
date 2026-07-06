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
  if (typeof setAutosaveStatus === "function") setAutosaveStatus("Archiviato " + formatArchiveLabel(month));
}

function openArchiveManager() {
  const archive = readArchive();
  const months = Object.keys(archive).sort().reverse();

  if (!months.length) {
    alert("Archivio mensile vuoto.");
    return;
  }

  const list = months.map((month, index) => `${index + 1}) ${archive[month].label || formatArchiveLabel(month)}`).join("\n");
  const answer = prompt("Archivio mensile:\n\n" + list + "\n\nScrivi il numero del mese da aprire, oppure lascia vuoto per annullare.");
  if (!answer) return;

  const index = Number(answer) - 1;
  const month = months[index];
  if (!month) {
    alert("Numero archivio non valido.");
    return;
  }

  const item = archive[month];
  const input = archiveMonthInput();
  if (!input) return;

  input.value = item.month;
  localStorage.setItem("capriBluPresenzeMese", item.month);
  localStorage.setItem(archiveStorageKey(item.month), JSON.stringify(item.data || {}));
  if (typeof renderTable === "function") renderTable();
  if (typeof setAutosaveStatus === "function") setAutosaveStatus("Aperto " + (item.label || item.month));
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

  const manageBtn = document.createElement("button");
  manageBtn.id = "openArchiveManagerBtn";
  manageBtn.type = "button";
  manageBtn.textContent = "Gestisci archivio";

  toolbar.insertBefore(saveBtn, printButton);
  toolbar.insertBefore(manageBtn, printButton);

  saveBtn.addEventListener("click", archiveCurrentMonth);
  manageBtn.addEventListener("click", openArchiveManager);
}

buildArchiveControls();