const weekKey = "capriBluTurniCucinaWeekSelectedV1";
const weekStoragePrefix = "capriBluTurniCucinaWeekV1-";
const publishedWeekStoragePrefix = "capriBluTurniCucinaPublishedWeekV1-";

const dayKeys = ["lunedi", "martedi", "mercoledi", "giovedi", "venerdi", "sabato", "domenica"];
const dayLabels = ["Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato", "Domenica"];
const shiftOptions = ["", "M", "S", "M/S", "Off", "12/chius"];

const groups = [
  {
    title: "Turni Pizzeria",
    people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"]
  },
  {
    title: "Turni Cucina / Lavaggio",
    people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"]
  }
];

const weekInput = document.getElementById("weekInput");
const weekRange = document.getElementById("weekRange");
const table = document.getElementById("kitchenTable");
const autosaveStatus = document.getElementById("autosaveStatus");
const sendMonthlyBtn = document.getElementById("sendMonthlyBtn");
const printBtn = document.getElementById("printBtn");
const resetBtn = document.getElementById("resetBtn");

function safeJsonParse(value, fallback, keyToRemove = "") {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Dati cucina non leggibili:", keyToRemove || "senza chiave", error);
    if (keyToRemove) localStorage.removeItem(keyToRemove);
    return fallback;
  }
}

function getCurrentWeek() {
  const now = new Date();
  const date = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayNumber = date.getDay() || 7;
  date.setDate(date.getDate() + 4 - dayNumber);
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
  return date.getFullYear() + "-W" + String(weekNumber).padStart(2, "0");
}

function mondayFromWeek(weekValue) {
  const [yearText, weekText] = weekValue.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const day = simple.getDay() || 7;
  simple.setDate(simple.getDate() - day + 1);
  return simple;
}

function formatDate(date) {
  return date.toLocaleDateString("it-IT", { day: "2-digit", month: "2-digit" });
}

function updateWeekRange() {
  const monday = mondayFromWeek(weekInput.value);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  weekRange.textContent = formatDate(monday) + " / " + formatDate(sunday);
}

function blankData() {
  const data = {};
  groups.forEach((group) => {
    group.people.forEach((name) => {
      data[name] = {};
      dayKeys.forEach((day) => {
        data[name][day] = "";
      });
    });
  });
  return data;
}

function storageKey() {
  return weekStoragePrefix + weekInput.value;
}

function readData() {
  const saved = localStorage.getItem(storageKey());
  const data = Object.assign(blankData(), safeJsonParse(saved, {}, storageKey()));

  groups.forEach((group) => {
    group.people.forEach((name) => {
      data[name] = Object.assign(blankData()[name], data[name] || {});
    });
  });

  return data;
}

function saveData(data) {
  localStorage.setItem(storageKey(), JSON.stringify(data));
  setAutosaveStatus("Salvato " + new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" }));
}

function setAutosaveStatus(text) {
  if (!autosaveStatus) return;
  autosaveStatus.textContent = text;
}

function classForValue(value) {
  if (value === "M") return "cell-m";
  if (value === "S") return "cell-s";
  if (value === "M/S") return "cell-ms";
  if (value === "Off") return "cell-off";
  if (value === "12/chius") return "cell-chius";
  return "";
}

function nextValue(value) {
  const index = shiftOptions.indexOf(value);
  return shiftOptions[(index + 1) % shiftOptions.length];
}

function renderTable() {
  const data = readData();
  let html = "<thead><tr><th>Staff</th>";
  dayLabels.forEach((label) => {
    html += "<th>" + label + "</th>";
  });
  html += "</tr></thead><tbody>";

  groups.forEach((group) => {
    html += "<tr class='section-row'><td colspan='8'>" + group.title + "</td></tr>";
    group.people.forEach((name) => {
      html += "<tr><td>" + name + "</td>";
      dayKeys.forEach((day) => {
        const value = data[name]?.[day] || "";
        html += "<td class='shift-cell " + classForValue(value) + "' data-name='" + name + "' data-day='" + day + "' data-value='" + value + "'>" + value + "</td>";
      });
      html += "</tr>";
    });
  });

  html += "</tbody>";
  table.innerHTML = html;
}

function saveCell(cell, value) {
  const data = readData();
  const name = cell.dataset.name;
  const day = cell.dataset.day;
  if (!data[name]) data[name] = {};
  data[name][day] = value;
  saveData(data);
  renderTable();
}

function sendToMonthly() {
  const data = readData();
  localStorage.setItem(publishedWeekStoragePrefix + weekInput.value, JSON.stringify(data));
  setAutosaveStatus("Inviato al mensile " + weekInput.value);
  alert("Turni Cucina / Pizzeria inviati alle presenze mensili.");
}

weekInput.value = localStorage.getItem(weekKey) || getCurrentWeek();
updateWeekRange();
renderTable();
setAutosaveStatus("Pronto");

table.addEventListener("click", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  saveCell(cell, nextValue(cell.dataset.value || ""));
});

table.addEventListener("contextmenu", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;
  event.preventDefault();
  const value = prompt("Inserisci turno: M, S, M/S, Off, 12/chius", cell.dataset.value || "");
  if (value === null) return;
  saveCell(cell, value.trim());
});

weekInput.addEventListener("input", () => {
  localStorage.setItem(weekKey, weekInput.value);
  updateWeekRange();
  renderTable();
});

sendMonthlyBtn.addEventListener("click", sendToMonthly);
printBtn.addEventListener("click", () => window.print());
resetBtn.addEventListener("click", () => {
  if (!confirm("Cancellare i turni cucina/pizzeria di questa settimana?")) return;
  localStorage.removeItem(storageKey());
  renderTable();
  setAutosaveStatus("Settimana resettata");
});
