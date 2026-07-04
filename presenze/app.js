const staffNames = [
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

const dayKeys = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const classMap = {
  "P": "cell-p",
  "F": "cell-f",
  "Fer": "cell-fer",
  "MAL": "cell-mal",
  "P+Rit": "cell-rit"
};

const publishedWeekStoragePrefix = "capriBluTurniStaffPublishedWeekV1-";
const requestsKey = "capriBluRichiesteStaffV1";

const monthInput = document.getElementById("monthInput");
const table = document.getElementById("presenceTable");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");
let activeSelect = null;

function currentMonthValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return year + "-" + month;
}

function storageKey() {
  return "capriBluPresenzeMensili-" + monthInput.value;
}

function readData() {
  const saved = localStorage.getItem(storageKey());
  return saved ? JSON.parse(saved) : {};
}

function saveData(data) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
}

function readRequests() {
  const saved = localStorage.getItem(requestsKey);
  return saved ? JSON.parse(saved) : [];
}

function daysInMonth(value) {
  const parts = value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  return new Date(year, month, 0).getDate();
}

function dayLabel(year, month, day) {
  const names = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  return names[new Date(year, month - 1, day).getDay()];
}

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
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
  return clean !== "" && clean !== "riposo" && clean !== "riposto" && clean !== "-" && clean !== "—" && clean !== "vuoto";
}

function autoValueFromRequests(name, dateISO) {
  const requests = readRequests();
  const request = requests.find((item) => item.name === name && item.date === dateISO);
  if (!request) return "";

  const type = String(request.type || "").toLowerCase();
  if (type === "ferie") return "Fer";
  if (type === "festa") return "F";
  return "";
}

function autoValueFromShift(name, date) {
  const weekValue = getISOWeekString(date);
  const saved = localStorage.getItem(publishedWeekStoragePrefix + weekValue);
  if (!saved) return "";

  const staff = JSON.parse(saved);
  const person = staff.find((item) => item.nome === name);
  if (!person) return "";

  const dayIndex = (date.getDay() || 7) - 1;
  const dayKey = dayKeys[dayIndex];
  const shift = person.turni?.[dayKey];
  if (!shift) return "";

  const hasPranzo = isWorking(shift.pranzo || shift.apertura);
  const hasSera = isWorking(shift.sera);
  return hasPranzo || hasSera ? "P" : "F";
}

function automaticValue(name, date) {
  const dateISO = toISODate(date);
  const requestValue = autoValueFromRequests(name, dateISO);
  if (requestValue) return requestValue;
  return autoValueFromShift(name, date);
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

function finalCellInfo(name, day, date, manualData) {
  const cellKey = name + "-" + day;
  const manualRecord = manualData[cellKey];
  const manualValue = getManualValue(manualRecord);
  const minutes = getManualMinutes(manualRecord);

  if (manualValue) return { value: manualValue, minutes };

  const auto = automaticValue(name, date);
  return { value: auto || "", minutes: 0 };
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

function renderTable() {
  const manualData = readData();
  const parts = monthInput.value.split("-");
  const year = Number(parts[0]);
  const month = Number(parts[1]);
  const totalDays = daysInMonth(monthInput.value);

  let html = "<thead><tr><th>Staff</th>";
  for (let day = 1; day <= totalDays; day++) {
    html += "<th><span class='day-number'>" + day + "</span><span class='day-name'>" + dayLabel(year, month, day) + "</span></th>";
  }
  html += "<th>P</th><th>F</th><th>Fer</th><th>MAL</th><th>Rit</th><th>Min</th>";
  html += "</tr></thead><tbody>";

  staffNames.forEach((name) => {
    const counts = { presenze: 0, feste: 0, ferie: 0, malattia: 0, ritardi: 0, minuti: 0 };
    html += "<tr><td>" + name + "</td>";

    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const info = finalCellInfo(name, day, date, manualData);
      addCount(counts, info.value, info.minutes);
      const cls = classMap[info.value] || "";
      html += "<td class='presence-cell " + cls + "' data-name='" + name + "' data-day='" + day + "'>" + displayValue(info.value, info.minutes) + "</td>";
    }

    html += "<td class='total-cell'>" + counts.presenze + "</td>";
    html += "<td class='total-cell'>" + counts.feste + "</td>";
    html += "<td class='total-cell'>" + counts.ferie + "</td>";
    html += "<td class='total-cell'>" + counts.malattia + "</td>";
    html += "<td class='total-cell'>" + counts.ritardi + "</td>";
    html += "<td class='total-cell'>" + counts.minuti + "</td>";
    html += "</tr>";
  });

  html += "</tbody>";
  table.innerHTML = html;
}

function closeActiveSelect() {
  if (activeSelect) {
    activeSelect.remove();
    activeSelect = null;
  }
}

function saveCellValue(cell, value) {
  const data = readData();
  const key = cell.dataset.name + "-" + cell.dataset.day;
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

function openCellMenu(cell) {
  closeActiveSelect();

  const manualData = readData();
  const key = cell.dataset.name + "-" + cell.dataset.day;
  const currentValue = getManualValue(manualData[key]) || cell.textContent.trim().replace(/\s+\d+m$/, "");

  const select = document.createElement("select");
  select.className = "presence-select-menu";
  select.innerHTML = `
    <option value="">Vuoto</option>
    <option value="P">P - Presenza</option>
    <option value="F">F - Festa</option>
    <option value="Fer">Fer - Ferie</option>
    <option value="MAL">MAL - Malattia</option>
    <option value="P+Rit">P+Rit - Ritardo</option>
  `;
  select.value = currentValue === "P+Rit" ? "P+Rit" : currentValue;

  const rect = cell.getBoundingClientRect();
  select.style.position = "fixed";
  select.style.left = rect.left + "px";
  select.style.top = rect.top + "px";
  select.style.width = Math.max(rect.width, 150) + "px";
  select.style.zIndex = "9999";

  document.body.appendChild(select);
  activeSelect = select;
  select.focus();

  select.addEventListener("change", () => {
    const value = select.value;
    closeActiveSelect();
    saveCellValue(cell, value);
  });

  select.addEventListener("blur", () => {
    setTimeout(closeActiveSelect, 150);
  });
}

monthInput.value = localStorage.getItem("capriBluPresenzeMese") || currentMonthValue();
renderTable();

table.addEventListener("click", (event) => {
  const cell = event.target.closest(".presence-cell");
  if (!cell) return;
  openCellMenu(cell);
});

monthInput.addEventListener("input", () => {
  localStorage.setItem("capriBluPresenzeMese", monthInput.value);
  renderTable();
});

printBtn.addEventListener("click", () => window.print());

resetBtn.addEventListener("click", () => {
  if (!confirm("Cancellare solo le modifiche manuali di questo mese? I dati inviati dai turni resteranno visibili.")) return;
  localStorage.removeItem(storageKey());
  renderTable();
});
