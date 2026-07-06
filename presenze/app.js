const defaultPresenceStaffNames = [
  "Pawel",
  "Rafaele",
  "Gaetano",
  "Rosè",
  "Shan",
  "Brendon",
  "Vittorio",
  "Dylan",
  "Lorenzo",
  "Sabbit",
  "Annachiara",
  "Natalia",
  "Carmine"
];

const presenceSections = [
  {
    key: "sala",
    title: "Sala",
    type: "sala",
    getNames: () => window.CapriBluStaff?.getStaffNames() || defaultPresenceStaffNames.slice()
  },
  {
    key: "pizzeria",
    title: "Pizzeria",
    type: "cucina",
    getNames: () => ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"]
  },
  {
    key: "cucina",
    title: "Cucina / Lavaggio",
    type: "cucina",
    getNames: () => ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"]
  }
];

const monthlyStoragePrefix = "capriBluPresenzeMensili-";
const oldKitchenMonthlyStoragePrefix = "capriBluPresenzeMensiliCucina-";
const salaPublishedWeekPrefix = "capriBluTurniStaffPublishedWeekV1-";
const kitchenPublishedWeekPrefix = "capriBluTurniCucinaPublishedWeekV1-";
const copiedPresenceKey = "capriBluPresenzeCopiaV1";
const requestsKey = "capriBluRichiesteStaffV1";

const dayKeys = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const classMap = {
  "P": "cell-p",
  "F": "cell-f",
  "Fer": "cell-fer",
  "MAL": "cell-mal",
  "P+Rit": "cell-rit"
};

const monthInput = document.getElementById("monthInput");
const table = document.getElementById("presenceTable");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");
const copyBtn = document.getElementById("copyBtn");
const pasteBtn = document.getElementById("pasteBtn");
const clearBtn = document.getElementById("clearBtn");
const autosaveStatus = document.getElementById("autosaveStatus");
let activeCell = null;
let selectedCell = null;
let menuBackdrop = null;
let copiedRecord = null;

function safeJsonParse(value, fallback, keyToRemove = "") {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Dati locali non leggibili:", keyToRemove || "senza chiave", error);
    if (keyToRemove) localStorage.removeItem(keyToRemove);
    return fallback;
  }
}

function currentMonthValue() {
  const now = new Date();
  return now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
}

function storageKey(month = monthInput.value) {
  return monthlyStoragePrefix + month;
}

function oldKitchenStorageKey(month = monthInput.value) {
  return oldKitchenMonthlyStoragePrefix + month;
}

function readData() {
  const key = storageKey();
  const data = safeJsonParse(localStorage.getItem(key), {}, key);
  const oldKitchenKey = oldKitchenStorageKey();
  const oldKitchenData = safeJsonParse(localStorage.getItem(oldKitchenKey), {}, oldKitchenKey);
  return { ...oldKitchenData, ...data };
}

function setAutosaveStatus(text) {
  if (!autosaveStatus) return;
  autosaveStatus.textContent = text;
}

function saveData(data) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
  setAutosaveStatus("Presenze salvate " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
}

function readRequests() {
  return safeJsonParse(localStorage.getItem(requestsKey), [], requestsKey);
}

function daysInMonth(value) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

function dayLabel(year, month, day) {
  const names = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  return names[new Date(year, month - 1, day).getDay()];
}

function toISODate(date) {
  return date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0") + "-" + String(date.getDate()).padStart(2, "0");
}

function getISOWeekString(date) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = localDate.getDay() || 7;
  localDate.setDate(localDate.getDate() + 4 - dayNumber);
  const yearStart = new Date(localDate.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((localDate - yearStart) / 86400000) + 1) / 7);
  return localDate.getFullYear() + "-W" + String(weekNumber).padStart(2, "0");
}

function isWorking(value) {
  if (!value) return false;
  const clean = String(value).trim().toLowerCase();
  return clean !== "" && clean !== "riposo" && clean !== "riposto" && clean !== "off" && clean !== "-" && clean !== "—" && clean !== "vuoto";
}

function normalizeRequestType(type) {
  const clean = String(type || "").toLowerCase();
  return clean === "riposo" ? "festa" : clean;
}

function autoValueFromRequests(name, dateISO, section) {
  if (section.type !== "sala") return "";
  const request = readRequests().find((item) => item.name === name && item.date === dateISO);
  if (!request) return "";
  const type = normalizeRequestType(request.type);
  if (type === "ferie") return "Fer";
  if (type === "festa" || type === "permesso" || type === "altro") return "F";
  return "";
}

function autoValueFromKitchenShift(name, dayKey, kitchenData) {
  const value = kitchenData?.[name]?.[dayKey] || "";
  if (!value) return "";
  return isWorking(value) ? "P" : "F";
}

function autoValueFromSalaShift(name, dayKey, staff) {
  const person = Array.isArray(staff) ? staff.find((item) => item.nome === name) : null;
  if (!person) return "";
  const shift = person.turni?.[dayKey];
  if (!shift) return "";
  const hasPranzo = isWorking(shift.pranzo || shift.apertura);
  const hasSera = isWorking(shift.sera);
  return hasPranzo || hasSera ? "P" : "F";
}

function autoValueFromShift(name, date, section) {
  const weekValue = getISOWeekString(date);
  const dayIndex = (date.getDay() || 7) - 1;
  const dayKey = dayKeys[dayIndex];

  if (section.type === "cucina") {
    const key = kitchenPublishedWeekPrefix + weekValue;
    const data = safeJsonParse(localStorage.getItem(key), {}, key);
    return autoValueFromKitchenShift(name, dayKey, data);
  }

  const key = salaPublishedWeekPrefix + weekValue;
  const staff = safeJsonParse(localStorage.getItem(key), [], key);
  return autoValueFromSalaShift(name, dayKey, staff);
}

function automaticValue(name, date, section) {
  const dateISO = toISODate(date);
  const requestValue = autoValueFromRequests(name, dateISO, section);
  if (requestValue) return requestValue;
  return autoValueFromShift(name, date, section);
}

function getManualValue(record) {
  if (!record) return "";
  if (typeof record === "string") return record;
  return record.value || "";
}

function getManualMinutes(record) {
  if (!record || typeof record === "string") return 0;
  return Number(record.minutes || 0);
}

function displayValue(value, minutes) {
  if (value === "P+Rit" && minutes > 0) return "P+Rit " + minutes + "m";
  return value;
}

function makeCellKey(name, day) {
  return name + "-" + day;
}

function finalCellInfo(name, day, date, manualData, section) {
  const manualRecord = manualData[makeCellKey(name, day)];
  const manualValue = getManualValue(manualRecord);
  const minutes = getManualMinutes(manualRecord);
  if (manualValue) return { value: manualValue, minutes, manual: true };
  const auto = automaticValue(name, date, section);
  return { value: auto || "", minutes: 0, manual: false };
}

function addCount(counts, value, minutes) {
  if (value === "P") counts.presenze += 1;
  if (value === "F") counts.feste += 1;
  if (value === "Fer") counts.ferie += 1;
  if (value === "MAL") counts.malattia += 1;
  if (value === "P+Rit") {
    counts.presenze += 1;
    counts.ritardi += 1;
    counts.minuti += Number(minutes || 0);
  }
}

function selectCell(cell) {
  if (selectedCell) selectedCell.classList.remove("selected-cell");
  selectedCell = cell;
  if (selectedCell) selectedCell.classList.add("selected-cell");
}

function getCellKey(cell) {
  return makeCellKey(cell.dataset.name, cell.dataset.day);
}

function getCellRecord(cell) {
  const data = readData();
  const record = data[getCellKey(cell)];
  if (record) return typeof record === "string" ? { value: record, minutes: 0 } : record;
  return { value: cell.dataset.value || "", minutes: Number(cell.dataset.minutes || 0) };
}

function renderTable() {
  const manualData = readData();
  const [year, month] = monthInput.value.split("-").map(Number);
  const totalDays = daysInMonth(monthInput.value);
  const oldSelectedKey = selectedCell ? getCellKey(selectedCell) : "";

  let html = "<thead><tr><th>Staff</th>";
  for (let day = 1; day <= totalDays; day++) {
    html += "<th><span class='day-number'>" + day + "</span><span class='day-name'>" + dayLabel(year, month, day) + "</span></th>";
  }
  html += "<th>P</th><th>F</th><th>Fer</th><th>MAL</th><th>Rit</th><th>Min</th></tr></thead><tbody>";

  presenceSections.forEach((section) => {
    html += "<tr class='section-row'><td colspan='" + (totalDays + 7) + "'>" + section.title + "</td></tr>";
    section.getNames().forEach((name) => {
      const counts = { presenze: 0, feste: 0, ferie: 0, malattia: 0, ritardi: 0, minuti: 0 };
      html += "<tr><td>" + name + "</td>";
      for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month - 1, day);
        const info = finalCellInfo(name, day, date, manualData, section);
        addCount(counts, info.value, info.minutes);
        const cls = classMap[info.value] || "";
        const manualClass = info.manual ? " manual-cell" : "";
        html += "<td class='presence-cell " + cls + manualClass + "' data-name='" + name + "' data-day='" + day + "' data-value='" + info.value + "' data-minutes='" + info.minutes + "'>" + displayValue(info.value, info.minutes) + "</td>";
      }
      html += "<td class='total-cell'>" + counts.presenze + "</td>";
      html += "<td class='total-cell'>" + counts.feste + "</td>";
      html += "<td class='total-cell'>" + counts.ferie + "</td>";
      html += "<td class='total-cell'>" + counts.malattia + "</td>";
      html += "<td class='total-cell'>" + counts.ritardi + "</td>";
      html += "<td class='total-cell'>" + counts.minuti + "</td></tr>";
    });
  });

  html += "</tbody>";
  table.innerHTML = html;

  if (oldSelectedKey) {
    const [name, day] = oldSelectedKey.split("-");
    const restored = table.querySelector(`.presence-cell[data-name="${CSS.escape(name)}"][data-day="${CSS.escape(day)}"]`);
    if (restored) selectCell(restored);
  }
}

function createMenu() {
  menuBackdrop = document.createElement("div");
  menuBackdrop.id = "presenceMenuBackdrop";
  menuBackdrop.className = "presence-menu-backdrop";
  menuBackdrop.innerHTML = `
    <div class="presence-menu-panel" role="dialog" aria-modal="true">
      <h2>Seleziona presenza</h2>
      <p id="presenceMenuSubtitle">Scegli una voce per questa casella</p>
      <div class="presence-menu-grid">
        <button type="button" data-value="P" class="menu-p">P<br><small>Presenza</small></button>
        <button type="button" data-value="F" class="menu-f">F<br><small>Festa</small></button>
        <button type="button" data-value="Fer" class="menu-fer">Fer<br><small>Ferie</small></button>
        <button type="button" data-value="MAL" class="menu-mal">MAL<br><small>Malattia</small></button>
        <button type="button" data-value="P+Rit" class="menu-rit">P+Rit<br><small>Ritardo</small></button>
        <button type="button" data-value="" class="menu-empty">Vuoto<br><small>Cancella</small></button>
      </div>
      <div class="presence-menu-actions">
        <button type="button" id="presenceCopyBtn">Copia</button>
        <button type="button" id="presencePasteBtn">Incolla</button>
      </div>
      <button type="button" id="presenceMenuClose" class="presence-menu-close">Annulla</button>
    </div>
  `;
  document.body.appendChild(menuBackdrop);
  menuBackdrop.addEventListener("click", (event) => { if (event.target === menuBackdrop) closePresenceMenu(); });
  document.getElementById("presenceMenuClose").addEventListener("click", closePresenceMenu);
  document.getElementById("presenceCopyBtn").addEventListener("click", () => { if (activeCell) copyCell(activeCell); closePresenceMenu(); });
  document.getElementById("presencePasteBtn").addEventListener("click", () => { if (activeCell) pasteCell(activeCell); closePresenceMenu(); });
  menuBackdrop.querySelectorAll("[data-value]").forEach((button) => {
    button.addEventListener("click", () => {
      const cellToSave = activeCell;
      if (!cellToSave) return;
      closePresenceMenu();
      saveCellValue(cellToSave, button.dataset.value);
    });
  });
}

function openPresenceMenu(cell) {
  activeCell = cell;
  selectCell(cell);
  if (!menuBackdrop) createMenu();
  const subtitle = document.getElementById("presenceMenuSubtitle");
  if (subtitle) subtitle.textContent = cell.dataset.name + " - giorno " + cell.dataset.day;
  menuBackdrop.classList.add("open");
}

function closePresenceMenu() {
  if (menuBackdrop) menuBackdrop.classList.remove("open");
  activeCell = null;
}

function saveCellRecord(cell, record) {
  const data = readData();
  data[getCellKey(cell)] = record;
  saveData(data);
  renderTable();
}

function saveCellValue(cell, value) {
  const data = readData();
  const key = getCellKey(cell);
  const oldRecord = data[key];
  if (!value) {
    delete data[key];
    saveData(data);
    renderTable();
    return;
  }
  if (value === "P+Rit") {
    const oldMinutes = getManualMinutes(oldRecord);
    const minutesText = prompt("Quanti minuti di ritardo?", oldMinutes ? String(oldMinutes) : "");
    if (minutesText === null) return;
    const minutes = Number(String(minutesText).replace(/[^0-9]/g, ""));
    data[key] = { value: "P+Rit", minutes: Number.isFinite(minutes) ? minutes : 0 };
  } else {
    data[key] = { value, minutes: 0 };
  }
  saveData(data);
  renderTable();
}

function copyCell(cell = selectedCell) {
  if (!cell) return;
  copiedRecord = getCellRecord(cell);
  localStorage.setItem(copiedPresenceKey, JSON.stringify(copiedRecord));
  setAutosaveStatus("Cella copiata");
}

function pasteCell(cell = selectedCell) {
  if (!cell) return;
  if (!copiedRecord) copiedRecord = safeJsonParse(localStorage.getItem(copiedPresenceKey), null, copiedPresenceKey);
  if (!copiedRecord) return;
  saveCellRecord(cell, { value: copiedRecord.value || "", minutes: Number(copiedRecord.minutes || 0) });
}

function clearSelectedCell() {
  if (!selectedCell) return;
  saveCellValue(selectedCell, "");
}

window.getPresenceStorageKey = function (month) {
  return storageKey(month || monthInput.value);
};
window.getPresenceDepartmentLabel = function () { return "Presenze Staff"; };
window.getPresenceDepartmentKey = function () { return "all"; };

monthInput.value = localStorage.getItem("capriBluPresenzeMese") || currentMonthValue();
renderTable();
setAutosaveStatus("Pronto");

table.addEventListener("click", (event) => {
  const cell = event.target.closest(".presence-cell");
  if (!cell) return;
  openPresenceMenu(cell);
});

monthInput.addEventListener("input", () => {
  localStorage.setItem("capriBluPresenzeMese", monthInput.value);
  renderTable();
});

copyBtn?.addEventListener("click", () => copyCell());
pasteBtn?.addEventListener("click", () => pasteCell());
clearBtn?.addEventListener("click", clearSelectedCell);
printBtn.addEventListener("click", () => window.print());

document.addEventListener("keydown", (event) => {
  if (!selectedCell) return;
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c") {
    event.preventDefault();
    copyCell();
  }
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v") {
    event.preventDefault();
    pasteCell();
  }
  if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    clearSelectedCell();
  }
});

resetBtn.addEventListener("click", () => {
  if (!confirm("Cancellare solo le modifiche manuali di questo mese? I dati inviati dai turni resteranno visibili.")) return;
  localStorage.removeItem(storageKey());
  renderTable();
  setAutosaveStatus("Mese resettato");
});