const defaultStaff = [
  {
    nome: "Mario",
    turni: {
      lunedi: { apertura: "10:30-15:30", sera: "18:30-23:30" },
      martedi: { apertura: "Riposo", sera: "18:30-23:30" },
      mercoledi: { apertura: "11:00-15:00", sera: "Riposo" },
      giovedi: { apertura: "10:30-15:30", sera: "18:30-23:30" },
      venerdi: { apertura: "Riposo", sera: "19:00-00:00" },
      sabato: { apertura: "12:00-16:00", sera: "19:00-00:00" },
      domenica: { apertura: "Riposo", sera: "Riposo" }
    }
  },
  {
    nome: "Anna",
    turni: {
      lunedi: { apertura: "11:00-15:00", sera: "Riposo" },
      martedi: { apertura: "Riposo", sera: "18:30-23:30" },
      mercoledi: { apertura: "10:30-14:30", sera: "20:00-23:30" },
      giovedi: { apertura: "Riposo", sera: "Riposo" },
      venerdi: { apertura: "11:00-15:30", sera: "19:00-00:00" },
      sabato: { apertura: "12:00-16:00", sera: "19:00-00:00" },
      domenica: { apertura: "11:00-15:00", sera: "Riposo" }
    }
  },
  {
    nome: "Luca",
    turni: {
      lunedi: { apertura: "09:30-15:30", sera: "Riposo" },
      martedi: { apertura: "09:30-15:30", sera: "18:00-23:00" },
      mercoledi: { apertura: "Riposo", sera: "Riposo" },
      giovedi: { apertura: "09:30-15:30", sera: "18:00-23:00" },
      venerdi: { apertura: "09:30-15:30", sera: "18:00-23:30" },
      sabato: { apertura: "09:30-15:30", sera: "18:00-23:30" },
      domenica: { apertura: "10:00-15:00", sera: "Riposo" }
    }
  },
  {
    nome: "Giulia",
    turni: {
      lunedi: { apertura: "Riposo", sera: "18:00-23:30" },
      martedi: { apertura: "11:00-15:00", sera: "Riposo" },
      mercoledi: { apertura: "11:00-15:00", sera: "18:30-23:30" },
      giovedi: { apertura: "Riposo", sera: "18:30-23:30" },
      venerdi: { apertura: "11:00-15:00", sera: "19:00-00:00" },
      sabato: { apertura: "12:00-16:00", sera: "19:00-00:00" },
      domenica: { apertura: "Riposo", sera: "Riposo" }
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

const storageKey = "capriBluTurniStaffV2";
const oldStorageKey = "capriBluTurniStaff";
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
  if (saved) return normalizeStaff(JSON.parse(saved));

  const oldSaved = localStorage.getItem(oldStorageKey);
  if (oldSaved) return normalizeStaff(JSON.parse(oldSaved));

  return structuredClone(defaultStaff);
}

function normalizeStaff(list) {
  return list.map((person) => {
    const normalized = {
      nome: person.nome || "Staff",
      turni: {}
    };

    days.forEach((day) => {
      const value = person.turni?.[day.key];

      if (Array.isArray(value)) {
        normalized.turni[day.key] = {
          apertura: value[0] || "Riposo",
          sera: value[1] || "Riposo"
        };
      } else {
        normalized.turni[day.key] = {
          apertura: value?.apertura || "Riposo",
          sera: value?.sera || "Riposo"
        };
      }
    });

    return normalized;
  });
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
    `;

    days.forEach((day) => {
      const shift = person.turni[day.key] || { apertura: "Riposo", sera: "Riposo" };
      const td = document.createElement("td");
      const isSplit = isWorking(shift.apertura) && isWorking(shift.sera);

      if (isSplit) td.classList.add("day-spezzato");

      td.innerHTML = `
        <div class="shift-cell four-fields">
          <div class="shift-code apertura-code">A</div>
          <div class="shift-time ${slotClass(shift.apertura, "apertura")}" contenteditable="true" data-person="${personIndex}" data-day="${day.key}" data-part="apertura">${shift.apertura}</div>
          <div class="shift-code sera-code">S</div>
          <div class="shift-time ${slotClass(shift.sera, "sera")}" contenteditable="true" data-person="${personIndex}" data-day="${day.key}" data-part="sera">${shift.sera}</div>
        </div>
      `;

      row.appendChild(td);
    });

    scheduleBody.appendChild(row);
  });
}

function updateColors() {
  staff.forEach((person, personIndex) => {
    const row = scheduleBody.children[personIndex];
    if (!row) return;

    days.forEach((day, dayIndex) => {
      const td = row.children[dayIndex + 1];
      const shift = person.turni[day.key] || { apertura: "Riposo", sera: "Riposo" };
      const apertura = td.querySelector('[data-part="apertura"]');
      const sera = td.querySelector('[data-part="sera"]');

      td.classList.toggle("day-spezzato", isWorking(shift.apertura) && isWorking(shift.sera));

      if (apertura) {
        apertura.classList.remove("apertura", "sera", "riposo");
        apertura.classList.add(slotClass(shift.apertura, "apertura"));
      }

      if (sera) {
        sera.classList.remove("apertura", "sera", "riposo");
        sera.classList.add(slotClass(shift.sera, "sera"));
      }
    });
  });
}

function slotClass(value, part) {
  if (!isWorking(value)) return "riposo";
  return part === "apertura" ? "apertura" : "sera";
}

function isWorking(value) {
  if (!value) return false;
  const clean = value.trim().toLowerCase();
  return clean !== "" && clean !== "riposo" && clean !== "-" && clean !== "—" && clean !== "vuoto";
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
    const part = target.dataset.part;
    staff[personIndex].turni[day][part] = target.textContent.trim() || "Riposo";
  }

  saveStaff();
  updateColors();
});

scheduleBody.addEventListener("focusout", () => {
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
  localStorage.removeItem(oldStorageKey);
  localStorage.removeItem(weekKey);
  staff = structuredClone(defaultStaff);
  weekInput.value = "Esempio: 6 - 12 Luglio 2026";
  renderTable();
});

renderTable();
