const defaultStaff = [
  {
    nome: "Mario",
    ruolo: "Sala",
    turni: {
      lunedi: ["10:30-15:30", "18:30-23:30"],
      martedi: ["Riposo", "18:30-23:30"],
      mercoledi: ["11:00-15:00", "Riposo"],
      giovedi: ["10:30-15:30", "18:30-23:30"],
      venerdi: ["Riposo", "19:00-00:00"],
      sabato: ["12:00-16:00", "19:00-00:00"],
      domenica: ["Riposo", "Riposo"]
    }
  },
  {
    nome: "Anna",
    ruolo: "Cameriera",
    turni: {
      lunedi: ["11:00-15:00", "Riposo"],
      martedi: ["Riposo", "18:30-23:30"],
      mercoledi: ["10:30-14:30", "20:00-23:30"],
      giovedi: ["Riposo", "Riposo"],
      venerdi: ["11:00-15:30", "19:00-00:00"],
      sabato: ["12:00-16:00", "19:00-00:00"],
      domenica: ["11:00-15:00", "Riposo"]
    }
  },
  {
    nome: "Luca",
    ruolo: "Cucina",
    turni: {
      lunedi: ["09:30-15:30", "Riposo"],
      martedi: ["09:30-15:30", "18:00-23:00"],
      mercoledi: ["Riposo", "Riposo"],
      giovedi: ["09:30-15:30", "18:00-23:00"],
      venerdi: ["09:30-15:30", "18:00-23:30"],
      sabato: ["09:30-15:30", "18:00-23:30"],
      domenica: ["10:00-15:00", "Riposo"]
    }
  },
  {
    nome: "Giulia",
    ruolo: "Bar",
    turni: {
      lunedi: ["Riposo", "18:00-23:30"],
      martedi: ["11:00-15:00", "Riposo"],
      mercoledi: ["11:00-15:00", "18:30-23:30"],
      giovedi: ["Riposo", "18:30-23:30"],
      venerdi: ["11:00-15:00", "19:00-00:00"],
      sabato: ["12:00-16:00", "19:00-00:00"],
      domenica: ["Riposo", "Riposo"]
    }
  }
];

const days = [
  { key: "lunedi", label: "Lunedì" },
  { key: "martedi", label: "Martedì" },
  { key: "mercoledi", label: "Mercoledì" },
  { key: "giovedi", label: "Giovedì" },
  { key: "venerdi", label: "Venerdì" },
  { key: "sabato", label: "Sabato" },
  { key: "domenica", label: "Domenica" }
];

const storageKey = "capriBluTurniStaff";
const weekKey = "capriBluTurniSettimana";
let staff = loadStaff();

const scheduleBody = document.getElementById("scheduleBody");
const weekInput = document.getElementById("weekInput");
const savedWeek = localStorage.getItem(weekKey);

if (savedWeek) {
  weekInput.value = savedWeek;
}

function loadStaff() {
  const saved = localStorage.getItem(storageKey);
  return saved ? JSON.parse(saved) : structuredClone(defaultStaff);
}

function saveStaff() {
  localStorage.setItem(storageKey, JSON.stringify(staff));
}

function renderTable() {
  scheduleBody.innerHTML = "";

  staff.forEach((person, personIndex) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td contenteditable="true" data-person="${personIndex}" data-field="nome">${person.nome}</td>
      <td class="role" contenteditable="true" data-person="${personIndex}" data-field="ruolo">${person.ruolo}</td>
    `;

    days.forEach((day) => {
      const slots = person.turni[day.key] || ["Riposo", "Riposo"];
      const td = document.createElement("td");
      const isSplit = isWorking(slots[0]) && isWorking(slots[1]);

      if (isSplit) td.classList.add("day-spezzato");

      td.innerHTML = `
        <div class="shift-cell">
          <div class="shift-slot ${slotClass(slots[0], 0)}" contenteditable="true" data-person="${personIndex}" data-day="${day.key}" data-slot="0">${slots[0]}</div>
          <div class="shift-slot ${slotClass(slots[1], 1)}" contenteditable="true" data-person="${personIndex}" data-day="${day.key}" data-slot="1">${slots[1]}</div>
        </div>
      `;

      row.appendChild(td);
    });

    const total = document.createElement("td");
    total.className = "total";
    total.textContent = `${calculateWeeklyHours(person).toFixed(1).replace(".0", "")} h`;
    row.appendChild(total);

    scheduleBody.appendChild(row);
  });
}

function slotClass(value, slotIndex) {
  if (!isWorking(value)) return "riposo";
  return slotIndex === 0 ? "pranzo" : "cena";
}

function isWorking(value) {
  if (!value) return false;
  const clean = value.trim().toLowerCase();
  return clean !== "" && clean !== "riposo" && clean !== "-" && clean !== "—" && clean !== "vuoto";
}

function calculateWeeklyHours(person) {
  return days.reduce((weekTotal, day) => {
    const slots = person.turni[day.key] || [];
    return weekTotal + slots.reduce((dayTotal, slot) => dayTotal + calculateSlotHours(slot), 0);
  }, 0);
}

function calculateSlotHours(value) {
  if (!isWorking(value)) return 0;

  const match = value.match(/(\d{1,2})[:.](\d{2})\s*-\s*(\d{1,2})[:.](\d{2})/);
  if (!match) return 0;

  const start = Number(match[1]) * 60 + Number(match[2]);
  let end = Number(match[3]) * 60 + Number(match[4]);

  if (end < start) end += 24 * 60;

  return (end - start) / 60;
}

scheduleBody.addEventListener("input", (event) => {
  const target = event.target;
  const personIndex = Number(target.dataset.person);

  if (Number.isNaN(personIndex)) return;

  if (target.dataset.field) {
    staff[personIndex][target.dataset.field] = target.textContent.trim();
  }

  if (target.dataset.day) {
    const day = target.dataset.day;
    const slot = Number(target.dataset.slot);
    staff[personIndex].turni[day][slot] = target.textContent.trim() || "Riposo";
  }

  saveStaff();
  renderTable();
});

weekInput.addEventListener("input", () => {
  localStorage.setItem(weekKey, weekInput.value);
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  localStorage.removeItem(weekKey);
  staff = structuredClone(defaultStaff);
  weekInput.value = "Esempio: 6 - 12 Luglio 2026";
  renderTable();
});

renderTable();
