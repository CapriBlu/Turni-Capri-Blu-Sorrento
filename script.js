const names = [
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

const days = [
  { key: "lunedi", label: "Lunedì" },
  { key: "martedi", label: "Martedì" },
  { key: "mercoledi", label: "Mercoledì" },
  { key: "giovedi", label: "Giovedì" },
  { key: "venerdi", label: "Venerdì" },
  { key: "sabato", label: "Sabato" },
  { key: "domenica", label: "Domenica" }
];

const defaultStaff = names.map((nome) => ({
  nome,
  turni: createEmptyWeek()
}));

const storageKey = "capriBluTurniStaffV5";
const oldStorageKeys = ["capriBluTurniStaffV4", "capriBluTurniStaffV3", "capriBluTurniStaffV2", "capriBluTurniStaff"];
const weekKey = "capriBluTurniSettimanaV2";
let staff = loadStaff();
let activeEdit = null;

const scheduleBody = document.getElementById("scheduleBody");
const weekInput = document.getElementById("weekInput");
const weekRange = document.getElementById("weekRange");

weekInput.value = localStorage.getItem(weekKey) || getISOWeekString(new Date());
updateWeekHeader();

function createEmptyWeek() {
  const turni = {};
  days.forEach((day) => {
    turni[day.key] = { pranzo: "Riposo", sera: "Riposo" };
  });
  return turni;
}

function loadStaff() {
  const saved = localStorage.getItem(storageKey);
  if (saved) return normalizeStaff(JSON.parse(saved));

  for (const key of oldStorageKeys) {
    const oldSaved = localStorage.getItem(key);
    if (oldSaved) return normalizeStaff(JSON.parse(oldSaved));
  }

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
          pranzo: value[0] || "Riposo",
          sera: value[1] || "Riposo"
        };
      } else {
        normalized.turni[day.key] = {
          pranzo: value?.pranzo || value?.apertura || "Riposo",
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
      const shift = person.turni[day.key] || { pranzo: "Riposo", sera: "Riposo" };
      const td = document.createElement("td");
      const isSplit = isWorking(shift.pranzo) && isWorking(shift.sera);

      if (isSplit) td.classList.add("day-spezzato");

      td.innerHTML = `
        <button class="shift-cell two-fields" type="button" data-person="${personIndex}" data-day="${day.key}" aria-label="Modifica turno ${person.nome} ${day.label}">
          <span class="shift-time ${slotClass(shift.pranzo, "pranzo")}">${shift.pranzo}</span>
          <span class="shift-time ${slotClass(shift.sera, "sera")}">${shift.sera}</span>
        </button>
      `;

      row.appendChild(td);
    });

    scheduleBody.appendChild(row);
  });
}

function updateCellColorsAndText(personIndex, dayKey) {
  const row = scheduleBody.children[personIndex];
  if (!row) return;

  const dayIndex = days.findIndex((day) => day.key === dayKey);
  const td = row.children[dayIndex + 1];
  const shift = staff[personIndex].turni[dayKey];
  const times = td.querySelectorAll(".shift-time");

  td.classList.toggle("day-spezzato", isWorking(shift.pranzo) && isWorking(shift.sera));

  times[0].textContent = shift.pranzo;
  times[0].className = `shift-time ${slotClass(shift.pranzo, "pranzo")}`;

  times[1].textContent = shift.sera;
  times[1].className = `shift-time ${slotClass(shift.sera, "sera")}`;
}

function slotClass(value, part) {
  if (!isWorking(value)) return "riposo";
  return part === "pranzo" ? "pranzo" : "sera";
}

function isWorking(value) {
  if (!value) return false;
  const clean = value.trim().toLowerCase();
  return clean !== "" && clean !== "riposo" && clean !== "riposto" && clean !== "-" && clean !== "—" && clean !== "vuoto";
}

function detectPranzoStatus(value) {
  const clean = (value || "").trim().toLowerCase();
  if (!isWorking(value)) return "riposo";
  if (clean === "apertura" || clean === "a") return "apertura";
  return "pranzo";
}

function detectSeraStatus(value) {
  const clean = (value || "").trim().toLowerCase();
  if (!isWorking(value)) return "riposo";
  if (clean === "cena") return "cena";
  return "sera";
}

function openShiftMenu(personIndex, dayKey) {
  activeEdit = { personIndex, dayKey };
  const person = staff[personIndex];
  const dayLabel = days.find((day) => day.key === dayKey)?.label || dayKey;
  const shift = person.turni[dayKey];

  document.getElementById("editorTitle").textContent = `${person.nome} - ${dayLabel}`;
  document.getElementById("pranzoStatus").value = detectPranzoStatus(shift.pranzo);
  document.getElementById("pranzoTime").value = isWorking(shift.pranzo) && !["Apertura", "Pranzo", "A"].includes(shift.pranzo) ? shift.pranzo : "";
  document.getElementById("seraStatus").value = detectSeraStatus(shift.sera);
  document.getElementById("seraTime").value = isWorking(shift.sera) && !["Sera", "Cena", "S"].includes(shift.sera) ? shift.sera : "";
  document.getElementById("shiftEditorBackdrop").classList.add("open");
}

function closeShiftMenu() {
  activeEdit = null;
  document.getElementById("shiftEditorBackdrop").classList.remove("open");
}

function createShiftEditor() {
  const editor = document.createElement("div");
  editor.id = "shiftEditorBackdrop";
  editor.className = "editor-backdrop";
  editor.innerHTML = `
    <div class="shift-editor wide-editor" role="dialog" aria-modal="true" aria-labelledby="editorTitle">
      <div class="editor-head">
        <h2 id="editorTitle">Modifica turno</h2>
      </div>

      <div class="editor-grid">
        <div class="editor-panel">
          <div class="editor-code apertura-code">A</div>
          <select id="pranzoStatus" aria-label="Stato apertura pranzo">
            <option value="apertura">Apertura</option>
            <option value="pranzo">Pranzo</option>
            <option value="riposo">Riposo</option>
          </select>
          <input id="pranzoTime" type="text" placeholder="10:30-15:30" />
        </div>

        <div class="editor-panel">
          <div class="editor-code sera-code">S</div>
          <select id="seraStatus" aria-label="Stato sera cena">
            <option value="sera">Sera</option>
            <option value="cena">Cena</option>
            <option value="riposo">Riposo</option>
          </select>
          <input id="seraTime" type="text" placeholder="18:30-23:30" />
        </div>
      </div>

      <div class="editor-actions">
        <button id="clearShiftBtn" type="button" class="secondary-btn">Tutto riposo</button>
        <button id="cancelShiftBtn" type="button" class="secondary-btn">Annulla</button>
        <button id="saveShiftBtn" type="button" class="primary-btn">Salva</button>
      </div>
    </div>
  `;

  document.body.appendChild(editor);

  editor.addEventListener("click", (event) => {
    if (event.target === editor) closeShiftMenu();
  });

  document.getElementById("cancelShiftBtn").addEventListener("click", closeShiftMenu);

  document.getElementById("clearShiftBtn").addEventListener("click", () => {
    document.getElementById("pranzoStatus").value = "riposo";
    document.getElementById("pranzoTime").value = "";
    document.getElementById("seraStatus").value = "riposo";
    document.getElementById("seraTime").value = "";
  });

  document.getElementById("saveShiftBtn").addEventListener("click", () => {
    if (!activeEdit) return;

    const { personIndex, dayKey } = activeEdit;
    const pranzoStatus = document.getElementById("pranzoStatus").value;
    const pranzoTime = document.getElementById("pranzoTime").value.trim();
    const seraStatus = document.getElementById("seraStatus").value;
    const seraTime = document.getElementById("seraTime").value.trim();

    const pranzoLabel = pranzoStatus === "apertura" ? "Apertura" : "Pranzo";
    const seraLabel = seraStatus === "cena" ? "Cena" : "Sera";

    staff[personIndex].turni[dayKey] = {
      pranzo: pranzoStatus === "riposo" ? "Riposo" : pranzoTime || pranzoLabel,
      sera: seraStatus === "riposo" ? "Riposo" : seraTime || seraLabel
    };

    saveStaff();
    updateCellColorsAndText(personIndex, dayKey);
    closeShiftMenu();
  });
}

function getISOWeekString(date) {
  const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayNumber = localDate.getDay() || 7;
  localDate.setDate(localDate.getDate() + 4 - dayNumber);
  const yearStart = new Date(localDate.getFullYear(), 0, 1);
  const weekNumber = Math.ceil((((localDate - yearStart) / 86400000) + 1) / 7);
  return `${localDate.getFullYear()}-W${String(weekNumber).padStart(2, "0")}`;
}

function mondayFromWeekValue(value) {
  const [yearText, weekText] = value.split("-W");
  const year = Number(yearText);
  const week = Number(weekText);
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  const dayOfWeek = simple.getDay() || 7;

  if (dayOfWeek <= 4) {
    simple.setDate(simple.getDate() - dayOfWeek + 1);
  } else {
    simple.setDate(simple.getDate() + 8 - dayOfWeek);
  }

  return simple;
}

function updateWeekHeader() {
  const monday = mondayFromWeekValue(weekInput.value);
  const formatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "2-digit" });
  const longFormatter = new Intl.DateTimeFormat("it-IT", { day: "2-digit", month: "long", year: "numeric" });

  days.forEach((day, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const th = document.querySelector(`[data-day-header="${day.key}"]`);
    if (th) th.innerHTML = `${day.label}<br><small>${formatter.format(date)}</small>`;
  });

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  weekRange.textContent = `${longFormatter.format(monday)} - ${longFormatter.format(sunday)}`;
}

scheduleBody.addEventListener("input", (event) => {
  const target = event.target;
  const personIndex = Number(target.dataset.person);

  if (Number.isNaN(personIndex)) return;

  if (target.dataset.field) {
    staff[personIndex][target.dataset.field] = target.textContent.trim();
    saveStaff();
  }
});

scheduleBody.addEventListener("click", (event) => {
  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  const personIndex = Number(cell.dataset.person);
  const dayKey = cell.dataset.day;
  openShiftMenu(personIndex, dayKey);
});

weekInput.addEventListener("input", () => {
  localStorage.setItem(weekKey, weekInput.value);
  updateWeekHeader();
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  oldStorageKeys.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(weekKey);
  staff = structuredClone(defaultStaff);
  weekInput.value = getISOWeekString(new Date());
  updateWeekHeader();
  renderTable();
});

createShiftEditor();
renderTable();
