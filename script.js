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

const kitchenSections = [
  { key: "pizzeria", title: "Pizzeria", people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"] },
  { key: "cucina", title: "Cucina / Lavaggio", people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"] }
];

const defaultStaff = names.map((nome) => ({
  nome,
  turni: createEmptyWeek()
}));

const storageKey = "capriBluTurniStaffV5";
const weekStoragePrefix = "capriBluTurniStaffWeekV1-";
const kitchenWeekStoragePrefix = "capriBluTurniCucinaWeekV1-";
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

function createEmptyWeek() {
  const turni = {};
  days.forEach((day) => {
    turni[day.key] = { pranzo: "Riposo", sera: "Riposo" };
  });
  return turni;
}

function createEmptyKitchenWeek() {
  const data = {};
  kitchenSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = {};
      days.forEach((day) => {
        data[name][day.key] = "Riposo";
      });
    });
  });
  return data;
}

function currentWeekStaffKey() {
  return weekStoragePrefix + weekInput.value;
}

function currentKitchenWeekKey() {
  return kitchenWeekStoragePrefix + weekInput.value;
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

function loadKitchenData() {
  const fallback = createEmptyKitchenWeek();
  const parsed = safeJsonParse(localStorage.getItem(currentKitchenWeekKey()), fallback, currentKitchenWeekKey());
  const data = { ...fallback, ...(parsed || {}) };

  kitchenSections.forEach((section) => {
    section.people.forEach((name) => {
      data[name] = { ...(fallback[name] || {}), ...(data[name] || {}) };
    });
  });

  return data;
}

function saveKitchenData(data) {
  localStorage.setItem(currentKitchenWeekKey(), JSON.stringify(data));
}

function loadRequests() {
  return safeJsonParse(localStorage.getItem(requestsKey), [], requestsKey);
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

function requestTypeClass(type) {
  const clean = String(type || "").trim().toLowerCase();
  if (clean === "ferie") return "request-ferie";
  if (clean === "festa" || clean === "riposo") return "request-festa";
  return "request-altro";
}

function renderSectionHeader(sectionKey, title) {
  const row = document.createElement("tr");
  row.className = "shift-section-row";
  row.dataset.section = sectionKey;
  row.innerHTML = `<td colspan="8"><button type="button" class="shift-section-toggle" data-section="${escapeHtml(sectionKey)}"><span class="section-arrow">▾</span> ${escapeHtml(title)}</button></td>`;
  scheduleBody.appendChild(row);
}

function renderTable() {
  scheduleBody.innerHTML = "";

  renderSectionHeader("sala", "Sala");

  staff.forEach((person, personIndex) => {
    const row = document.createElement("tr");
    row.dataset.sectionGroup = "sala";
    row.innerHTML = `<td contenteditable="true" data-person="${personIndex}" data-field="nome">${escapeHtml(person.nome)}</td>`;

    days.forEach((day, dayIndex) => {
      const shift = person.turni[day.key] || { pranzo: "Riposo", sera: "Riposo" };
      const td = document.createElement("td");
      const hasPranzo = isWorking(shift.pranzo);
      const hasSera = isWorking(shift.sera);
      const isSplit = hasPranzo && hasSera;
      const dateISO = getDateISOForDay(dayIndex);
      const cellRequests = getRequestsFor(person.nome, dateISO);
      const firstRequest = cellRequests[0];
      const requestClass = firstRequest ? requestTypeClass(firstRequest.type) : "";
      const requestNote = firstRequest?.note ? escapeHtml(firstRequest.note) : "Nessuna nota";
      const requestDot = firstRequest ? `<span class="request-dot" aria-hidden="true"></span>` : "";

      if (isSplit) td.classList.add("day-spezzato");
      if (firstRequest) td.classList.add("has-request", requestClass);

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
        <button class="shift-cell ${isSplit ? "two-fields" : "one-field"} ${requestClass}" type="button" data-person="${personIndex}" data-day="${day.key}" title="${requestNote}" aria-label="Modifica turno ${escapeHtml(person.nome)} ${day.label}">
          ${cellContent}
          ${requestDot}
        </button>
      `;

      row.appendChild(td);
    });

    scheduleBody.appendChild(row);
  });

  renderKitchenSections();
}

function renderKitchenSections() {
  const kitchenData = loadKitchenData();

  kitchenSections.forEach((section) => {
    renderSectionHeader(section.key, section.title);

    section.people.forEach((name) => {
      const row = document.createElement("tr");
      row.dataset.sectionGroup = section.key;
      row.innerHTML = `<td class="kitchen-name-cell">${escapeHtml(name)}</td>`;

      days.forEach((day) => {
        const value = kitchenData[name]?.[day.key] || "Riposo";
        const td = document.createElement("td");
        td.innerHTML = `
          <button class="shift-cell kitchen-shift-cell one-field" type="button" data-kitchen-section="${escapeHtml(section.key)}" data-name="${escapeHtml(name)}" data-day="${day.key}" aria-label="Modifica turno ${escapeHtml(name)} ${day.label}">
            <span class="shift-time single ${slotClass(value, "pranzo")}">${escapeHtml(value || "Riposo")}</span>
          </button>
        `;
        row.appendChild(td);
      });

      scheduleBody.appendChild(row);
    });
  });
}

function slotClass(value, part) {
  if (!isWorking(value)) return "riposo";
  return part === "pranzo" ? "pranzo" : "sera";
}

function isWorking(value) {
  if (!value) return false;
  const clean = String(value).trim().toLowerCase();
  return clean !== "" && clean !== "riposo" && clean !== "riposto" && clean !== "off" && clean !== "-" && clean !== "—" && clean !== "vuoto";
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

function normalizeKitchenValue(value) {
  const clean = String(value || "").trim();
  const lower = clean.toLowerCase();

  if (!clean || lower === "r" || lower === "riposo" || lower === "off" || lower === "-") return "Riposo";
  if (lower === "m" || lower === "mattina" || lower === "pranzo") return "M";
  if (lower === "s" || lower === "sera" || lower === "cena") return "S";
  if (["m/s", "ms", "m-s", "spezzato"].includes(lower)) return "M/S";
  if (["12/chius", "12 chius", "12/chiusura", "12 chiusura"].includes(lower)) return "12/chius";

  return clean;
}

function editKitchenCell(cell) {
  const name = cell.dataset.name;
  const dayKey = cell.dataset.day;
  const dayLabel = days.find((day) => day.key === dayKey)?.label || dayKey;
  const data = loadKitchenData();
  const current = data[name]?.[dayKey] || "Riposo";
  const next = window.prompt(`${name} - ${dayLabel}\nValori: M, S, M/S, Riposo, 12/chius`, current);

  if (next === null) return;
  if (!data[name]) data[name] = {};
  data[name][dayKey] = normalizeKitchenValue(next);
  saveKitchenData(data);
  renderTable();
}

function openShiftMenu() {
  console.warn("Editor turni non ancora pronto. Verifica shift-buttons.js.");
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
        <td><span class="request-pill ${String(request.type).toLowerCase()}" title="${escapeHtml(request.note || "Nessuna nota")}">${escapeHtml(request.type)}</span></td>
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
  }
});

scheduleBody.addEventListener("blur", (event) => {
  const target = event.target;
  const personIndex = Number(target.dataset.person);

  if (Number.isNaN(personIndex) || !target.dataset.field) return;
  renderTable();
}, true);

scheduleBody.addEventListener("click", (event) => {
  const kitchenCell = event.target.closest(".kitchen-shift-cell");
  if (kitchenCell) {
    editKitchenCell(kitchenCell);
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
  localStorage.removeItem(currentKitchenWeekKey());
  staff = structuredClone(defaultStaff);
  saveStaff();
  updateWeekHeader();
  populateRequestNames();
  renderRequests();
  renderTable();
});

syncStaffNames();
updateWeekHeader();
populateRequestNames();
renderRequests();
renderTable();
