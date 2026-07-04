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
const values = ["", "P", "F", "Fer", "P+Rit"];
const classMap = {
  "P": "cell-p",
  "F": "cell-f",
  "Fer": "cell-fer",
  "P+Rit": "cell-rit"
};

const weekStoragePrefix = "capriBluTurniStaffWeekV1-";
const requestsKey = "capriBluRichiesteStaffV1";

const monthInput = document.getElementById("monthInput");
const table = document.getElementById("presenceTable");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");

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
  const saved = localStorage.getItem(weekStoragePrefix + weekValue);
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

function finalCellValue(name, day, date, manualData) {
  const cellKey = name + "-" + day;
  const manualValue = manualData[cellKey] || "";

  if (manualValue === "P+Rit") return manualValue;

  const auto = automaticValue(name, date);
  if (auto) return auto;

  return manualValue;
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
  html += "</tr></thead><tbody>";

  staffNames.forEach((name) => {
    html += "<tr><td>" + name + "</td>";
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month - 1, day);
      const value = finalCellValue(name, day, date, manualData);
      const cls = classMap[value] || "";
      html += "<td class='presence-cell " + cls + "' data-name='" + name + "' data-day='" + day + "'>" + value + "</td>";
    }
    html += "</tr>";
  });

  html += "</tbody>";
  table.innerHTML = html;
}

function nextValue(current) {
  const index = values.indexOf(current);
  if (index < 0) return "P";
  return values[(index + 1) % values.length];
}

monthInput.value = localStorage.getItem("capriBluPresenzeMese") || currentMonthValue();
renderTable();

table.addEventListener("click", (event) => {
  const cell = event.target.closest(".presence-cell");
  if (!cell) return;

  const data = readData();
  const key = cell.dataset.name + "-" + cell.dataset.day;
  const newValue = nextValue(cell.textContent.trim());

  if (newValue) data[key] = newValue;
  else delete data[key];

  saveData(data);
  renderTable();
});

monthInput.addEventListener("input", () => {
  localStorage.setItem("capriBluPresenzeMese", monthInput.value);
  renderTable();
});

printBtn.addEventListener("click", () => window.print());

resetBtn.addEventListener("click", () => {
  if (!confirm("Cancellare solo le modifiche manuali di questo mese? I dati automatici dai turni resteranno visibili.")) return;
  localStorage.removeItem(storageKey());
  renderTable();
});
