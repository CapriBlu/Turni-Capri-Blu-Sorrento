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

const values = ["", "P", "F", "Fer", "P+Rit"];
const classMap = {
  "P": "cell-p",
  "F": "cell-f",
  "Fer": "cell-fer",
  "P+Rit": "cell-rit"
};

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

function renderTable() {
  const data = readData();
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
      const cellKey = name + "-" + day;
      const value = data[cellKey] || "";
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
  const newValue = nextValue(data[key] || "");

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
  if (!confirm("Cancellare le presenze di questo mese?")) return;
  localStorage.removeItem(storageKey());
  renderTable();
});
