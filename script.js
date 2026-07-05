const names = window.CapriBluStaff?.getStaffNames() || [
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
const weekStoragePrefix = "capriBluTurniStaffWeekV1-";
const oldStorageKeys = ["capriBluTurniStaffV4", "capriBluTurniStaffV3", "capriBluTurniStaffV2", "capriBluTurniStaff"];
const weekKey = "capriBluTurniSettimanaV2";
const requestsKey = "capriBluRichiesteStaffV1";

const scheduleBody = document.getElementById("scheduleBody");
const weekInput = document.getElementById("weekInput");
const weekRange = document.getElementById("weekRange");
const requestName = document.getElementById("requestName");
const requestDate = document.getElementById("requestDate");
const requestType = document.getElementById("requestType");
const requestNote = document.getElementById("requestNote");
const requestsBody = document.getElementById("requestsBody");

weekInput.value = localStorage.getItem(weekKey) || getISOWeekString(new Date());
requestDate.value = toISODate(new Date());

let staff = loadStaff();
let requests = loadRequests();
let activeEdit = null;

updateWeekHeader();
populateRequestNames();

function createEmptyWeek() {
  const turni = {};
  days.forEach((day) => {
    turni[day.key] = { pranzo: "Riposo", sera: "Riposo" };
  });
  return turni;
}

function currentWeekStaffKey() {
  return weekStoragePrefix + weekInput.value;
}

function safeJsonParse(value, fallback, keyToRemove = "") {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.warn("Dati locali non leggibili:", keyToRemove || "senza chiave", error);
    if (keyToRemove) localStorage.removeItem(keyToRemove);
    return fallback;
  }
}

function loadStaff() {
  const weeklyKey = currentWeekStaffKey();
  const weeklySaved = localStorage.getItem(weeklyKey);
  const weeklyParsed = safeJsonParse(weeklySaved, null, weeklyKey);
  if (weeklyParsed) return normalizeStaff(weeklyParsed);

  const saved = localStorage.getItem(storageKey);
  const parsed = safeJsonParse(saved, null, storageKey);
  if (parsed) {
    const migrated = normalizeStaff(parsed);
    localStorage.setItem(weeklyKey, JSON.stringify(migrated));
    return migrated;
  }

  for (const key of oldStorageKeys) {
    const oldSaved = localStorage.getItem(key);
    const oldParsed = safeJsonParse(oldSaved, null, key);
    if (oldParsed) {
      const migrated = normalizeStaff(oldParsed);
      localStorage.setItem(weeklyKey, JSON.stringify(migrated));
      return migrated;
    }
  }

  return structuredClone(defaultStaff);
}

function loadRequests() {
  const saved = localStorage.getItem(requestsKey);
  return safeJsonParse(saved, [], requestsKey);
}

function saveRequests() {
  localStorage.setItem(requestsKey, JSON.stringify(requests));
}

function normalizeStaff(list) {
  return (Array.isArray(list) ? list : []).map((person) => {
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

function syncStaffNames() {
  window.CapriBluStaff?.updateFromStaff(staff);
}

function saveStaff() {
  localStorage.setItem(currentWeekStaffKey(), JSON.stringify(staff));
  localStorage.setItem(storageKey, JSON.stringify(staff));
  syncStaffNames();
}

function renderTable() {
  scheduleBody.innerHTML = "";

  staff.forEach((person, personIndex) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td contenteditable="true" data-person="${personIndex}" data-field="nome">${person.nome}</td>
    `;

    days.forEach((day, dayIndex) => {
      const shift = person.turni[day.key] || { pranzo: "Riposo", sera: "Riposo" };
      const td = document.createElement("td");
      const hasPranzo = isWorking(shift.pranzo);
      const hasSera = isWorking(shift.sera);
      const isSplit = hasPranzo && hasSera;
      const dateISO = getDateISOForDay(dayIndex);
      const cellRequests = getRequestsFor(person.nome, dateISO);

      if (isSplit) td.classList.add("day-spezzato");
      if (cellRequests.length) td.classList.add("has-request");

      const requestBadges = cellRequests.map((request) => {
        const noteAttr = request.note ? ` data-note="${escapeHtml(request.note)}"` : " data-note=\"Nessuna nota\"";
        return `<button class="request-badge ${request.type.toLowerCase()}" type="button"${noteAttr} title="${escapeHtml(request.note || "Nessuna nota")}">${escapeHtml(request.type)}</button>`;
      }).join("");

      let cellContent;

      if (isSplit) {
        cellContent = `
          <span class="shift-time ${slotClass(shift.pranzo, "pranzo")}">${escapeHtml(shift.pranzo)}</span>
          <span class="shift-time ${slotClass(shift.sera, "sera")}">${escapeHtml(shift.sera)}</span>
        `;
      } else {
        const singleValue = hasPranzo ? shift.pranzo : hasSera ? shift.sera : "Riposo";
        const singlePart = hasPranzo ? "pranzo" : hasSera ? "sera" : "riposo";
        cellContent = `<span class="shift-time single ${slotClass(singleValue, singlePart)}">${escapeHtml(singleValue)}</span>`;
      }

      td.innerHTML = `
        <button class="shift-cell ${isSplit ? "two-fields" : "one-field"}" type="button" data-person="${personIndex}" data-day="${day.key}" aria-label="Modifica turno ${person.nome} ${day.label}">
          ${cellContent}
        </button>
        ${requestBadges}
      `;

      row.appendChild(td);
    });

    scheduleBody.appendChild(row);
  });
}

function slotClass(value, part) {
  if (!isWorking(value)) return "riposo";
  return part === "pranzo" ? "pranzo" : "sera";
}

function isWorking(value) {
  if (!value) return false;
  const clean = String(value).trim().toLowerCase();
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
    renderTable();
    closeShiftMenu();
  });
}

function createNotePopup() {
  const popup = document.createElement("div");
  popup.id = "notePopupBackdrop";
  popup.className = "note-popup-backdrop";
  popup.innerHTML = `
    <div class="note-popup">
      <h3>Nota richiesta</h3>
      <p id="notePopupText"></p>
      <button id="notePopupClose" type="button">Chiudi</button>
    </div>
  `;
  document.body.appendChild(popup);

  popup.addEventListener("click", (event) => {
    if (event.target === popup) closeNotePopup();
  });

  document.getElementById("notePopupClose").addEventListener("click", closeNotePopup);
}

function openNotePopup(note) {
  document.getElementById("notePopupText").textContent = note || "Nessuna nota";
  document.getElementById("notePopupBackdrop").classList.add("open");
}

function closeNotePopup() {
  document.getElementById("notePopupBackdrop").classList.remove("open");
}

function populateRequestNames() {
  requestName.innerHTML = staff.map((person) => `<option value="${escapeHtml(person.nome)}">${escapeHtml(person.nome)}</option>`).join("");
}

function renderRequests() {
  requestsBody.innerHTML = "";

  if (!requests.length) {
    requestsBody.innerHTML = `<tr><td colspan="5" class="empty-requests">Nessuna richiesta inserita</td></tr>`;
    return;
  }

  requests
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((request) => {
      const originalIndex = requests.findIndex((item) => item.id === request.id);
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${escapeHtml(request.name)}</td>
        <td>${formatDateIT(request.date)}</td>
        <td><span class="request-pill ${request.type.toLowerCase()}" title="${escapeHtml(request.note || "Nessuna nota")}">${escapeHtml(request.type)}</span></td>
        <td>${escapeHtml(request.note || "")}</td>
        <td><button class="delete-request" type="button" data-index="${originalIndex}">Elimina</button></td>
      `;
      requestsBody.appendChild(row);
    });
}

function addRequest() {
  const name = requestName.value;
  const date = requestDate.value;
  const type = requestType.value;
  const note = requestNote.value.trim();

  if (!name || !date || !type) return;

  requests.push({
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    name,
    date,
    type,
    note
  });

  saveRequests();
  requestNote.value = "";
  renderRequests();
  renderTable();
}

function addPerson() {
  const typedName = window.prompt("Nome nuova persona:", "Nuovo staff");
  if (typedName === null) return;

  const nome = typedName.trim() || "Nuovo staff";

  staff.push({
    nome,
    turni: createEmptyWeek()
  });

  saveStaff();
  populateRequestNames();
  renderRequests();
  renderTable();
}

function getRequestsFor(name, dateISO) {
  return requests.filter((request) => request.name === name && request.date === dateISO);
}

function getDateISOForDay(dayIndex) {
  const monday = mondayFromWeekValue(weekInput.value);
  const date = new Date(monday);
  date.setDate(monday.getDate() + dayIndex);
  return toISODate(date);
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

function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateIT(dateISO) {
  const [year, month, day] = dateISO.split("-");
  return `${day}/${month}/${year}`;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

scheduleBody.addEventListener("input", (event) => {
  const target = event.target;
  const personIndex = Number(target.dataset.person);

  if (Number.isNaN(personIndex)) return;

  if (target.dataset.field) {
    staff[personIndex][target.dataset.field] = target.textContent.trim();
    saveStaff();
    populateRequestNames();
    renderRequests();
    renderTable();
  }
});

scheduleBody.addEventListener("click", (event) => {
  const requestBadge = event.target.closest(".request-badge");
  if (requestBadge) {
    event.stopPropagation();
    openNotePopup(requestBadge.dataset.note || "Nessuna nota");
    return;
  }

  const cell = event.target.closest(".shift-cell");
  if (!cell) return;

  const personIndex = Number(cell.dataset.person);
  const dayKey = cell.dataset.day;
  openShiftMenu(personIndex, dayKey);
});

weekInput.addEventListener("input", () => {
  saveStaff();
  localStorage.setItem(weekKey, weekInput.value);
  staff = loadStaff();
  updateWeekHeader();
  populateRequestNames();
  renderRequests();
  renderTable();
});

document.getElementById("addPersonBtn")?.addEventListener("click", addPerson);
document.getElementById("addRequestBtn").addEventListener("click", addRequest);

requestsBody.addEventListener("click", (event) => {
  const deleteButton = event.target.closest(".delete-request");
  if (!deleteButton) return;

  const index = Number(deleteButton.dataset.index);
  requests.splice(index, 1);
  saveRequests();
  renderRequests();
  renderTable();
});

document.getElementById("printBtn").addEventListener("click", () => {
  window.print();
});

document.getElementById("resetBtn").addEventListener("click", () => {
  localStorage.removeItem(currentWeekStaffKey());
  localStorage.removeItem(storageKey);
  staff = structuredClone(defaultStaff);
  saveStaff();
  updateWeekHeader();
  populateRequestNames();
  renderRequests();
  renderTable();
});

syncStaffNames();
createShiftEditor();
createNotePopup();
renderRequests();
renderTable();