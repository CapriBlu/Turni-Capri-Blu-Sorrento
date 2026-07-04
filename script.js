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

const storageKey = "capriBluTurniStaffV3";
const oldStorageKeys = ["capriBluTurniStaffV2", "capriBluTurniStaff"];
const weekKey = "capriBluTurniSettimana";
let staff = loadStaff();
let activeEdit = null;

const scheduleBody = document.getElementById("scheduleBody");
const weekInput = document.getElementById("weekInput");
const savedWeek = localStorage.getItem(weekKey);

if (savedWeek) {
  weekInput.value = savedWeek;
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
        <button class="shift-cell four-fields" type="button" data-person="${personIndex}" data-day="${day.key}" aria-label="Modifica turno ${person.nome} ${day.label}">
          <span class="shift-code apertura-code">A</span>
          <span class="shift-time ${slotClass(shift.apertura, "apertura")}">${shift.apertura}</span>
          <span class="shift-code sera-code">S</span>
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

  td.classList.toggle("day-spezzato", isWorking(shift.apertura) && isWorking(shift.sera));

  times[0].textContent = shift.apertura;
  times[0].className = `shift-time ${slotClass(shift.apertura, "apertura")}`;

  times[1].textContent = shift.sera;
  times[1].className = `shift-time ${slotClass(shift.sera, "sera")}`;
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

function openShiftMenu(personIndex, dayKey) {
  activeEdit = { personIndex, dayKey };
  const person = staff[personIndex];
  const dayLabel = days.find((day) => day.key === dayKey)?.label || dayKey;
  const shift = person.turni[dayKey];

  document.getElementById("editorTitle").textContent = `${person.nome} - ${dayLabel}`;
  document.getElementById("aperturaStatus").value = isWorking(shift.apertura) ? "apertura" : "riposo";
  document.getElementById("aperturaTime").value = isWorking(shift.apertura) ? shift.apertura : "";
  document.getElementById("seraStatus").value = isWorking(shift.sera) ? "sera" : "riposo";
  document.getElementById("seraTime").value = isWorking(shift.sera) ? shift.sera : "";
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
    <div class="shift-editor" role="dialog" aria-modal="true" aria-labelledby="editorTitle">
      <h2 id="editorTitle">Modifica turno</h2>

      <div class="editor-row">
        <div class="editor-code apertura-code">A</div>
        <select id="aperturaStatus">
          <option value="apertura">Apertura</option>
          <option value="riposo">Riposo</option>
        </select>
        <input id="aperturaTime" type="text" placeholder="10:30-15:30" />
      </div>

      <div class="editor-row">
        <div class="editor-code sera-code">S</div>
        <select id="seraStatus">
          <option value="sera">Sera</option>
          <option value="riposo">Riposo</option>
        </select>
        <input id="seraTime" type="text" placeholder="18:30-23:30" />
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
    document.getElementById("aperturaStatus").value = "riposo";
    document.getElementById("aperturaTime").value = "";
    document.getElementById("seraStatus").value = "riposo";
    document.getElementById("seraTime").value = "";
  });

  document.getElementById("saveShiftBtn").addEventListener("click", () => {
    if (!activeEdit) return;

    const { personIndex, dayKey } = activeEdit;
    const aperturaStatus = document.getElementById("aperturaStatus").value;
    const aperturaTime = document.getElementById("aperturaTime").value.trim();
    const seraStatus = document.getElementById("seraStatus").value;
    const seraTime = document.getElementById("seraTime").value.trim();

    staff[personIndex].turni[dayKey] = {
      apertura: aperturaStatus === "riposo" ? "Riposo" : aperturaTime || "A",
      sera: seraStatus === "riposo" ? "Riposo" : seraTime || "S"
    };

    saveStaff();
    updateCellColorsAndText(personIndex, dayKey);
    closeShiftMenu();
  });
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
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(storageKey);
  oldStorageKeys.forEach((key) => localStorage.removeItem(key));
  localStorage.removeItem(weekKey);
  staff = structuredClone(defaultStaff);
  weekInput.value = "Esempio: 6 - 12 Luglio 2026";
  renderTable();
});

createShiftEditor();
renderTable();
