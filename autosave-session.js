const sessionBackupKey = "capriBluAutoSessionBackupV1";
const publishedWeekPrefix = "capriBluTurniStaffPublishedWeekV1-";
const lastPublishedWeekKey = "capriBluUltimaSettimanaInviata";

function readJsonFromStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function getSessionSnapshot() {
  const weeklyStaff = {};
  const monthlyPublished = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);

    if (key && key.startsWith(weekStoragePrefix)) {
      weeklyStaff[key.replace(weekStoragePrefix, "")] = readJsonFromStorage(key, []);
    }

    if (key && key.startsWith(publishedWeekPrefix)) {
      monthlyPublished[key.replace(publishedWeekPrefix, "")] = readJsonFromStorage(key, []);
    }
  }

  weeklyStaff[weekInput.value] = staff;

  return {
    app: "Capri Blu Turni",
    saveType: "official",
    version: 2,
    savedAt: new Date().toISOString(),
    currentWeek: weekInput.value,
    lastPublishedWeek: localStorage.getItem(lastPublishedWeekKey) || "",
    staff,
    weeklyStaff,
    monthlyPublished,
    requests
  };
}

function setAutosaveStatus(text) {
  const status = document.getElementById("autosaveStatus");
  if (!status) return;
  status.textContent = text;
}

function autoSaveSession() {
  try {
    const snapshot = getSessionSnapshot();
    localStorage.setItem(sessionBackupKey, JSON.stringify(snapshot));
    setAutosaveStatus(`Salvato automaticamente ${new Date().toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" })}`);
  } catch (error) {
    setAutosaveStatus("Errore autosalvataggio");
    console.error(error);
  }
}

const originalSaveStaff = saveStaff;
saveStaff = function () {
  originalSaveStaff();
  autoSaveSession();
};

const originalSaveRequests = saveRequests;
saveRequests = function () {
  originalSaveRequests();
  autoSaveSession();
};

function downloadSnapshot(filename, statusText) {
  autoSaveSession();
  const snapshot = getSessionSnapshot();
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setAutosaveStatus(statusText);
}

function downloadSession() {
  const date = new Date().toISOString().slice(0, 10);
  downloadSnapshot(`Turni-CapriBlu-${date}.json`, "Sessione scaricata");
}

function downloadOfficialSave() {
  downloadSnapshot("turni-attuali.json", "Backup ufficiale scaricato");
}

function restoreSession(snapshot) {
  if (!snapshot || !snapshot.weeklyStaff || !snapshot.requests) {
    alert("File sessione non valido.");
    return;
  }

  Object.entries(snapshot.weeklyStaff).forEach(([week, weekStaff]) => {
    localStorage.setItem(weekStoragePrefix + week, JSON.stringify(normalizeStaff(weekStaff)));
  });

  if (snapshot.monthlyPublished) {
    Object.entries(snapshot.monthlyPublished).forEach(([week, weekStaff]) => {
      localStorage.setItem(publishedWeekPrefix + week, JSON.stringify(normalizeStaff(weekStaff)));
    });
  }

  if (snapshot.lastPublishedWeek) {
    localStorage.setItem(lastPublishedWeekKey, snapshot.lastPublishedWeek);
  }

  requests = Array.isArray(snapshot.requests) ? snapshot.requests : [];
  localStorage.setItem(requestsKey, JSON.stringify(requests));

  weekInput.value = snapshot.currentWeek || weekInput.value;
  localStorage.setItem(weekKey, weekInput.value);

  staff = loadStaff();
  updateWeekHeader();
  populateRequestNames();
  renderRequests();
  renderTable();
  autoSaveSession();
  setAutosaveStatus("Sessione caricata");
}

function handleSessionFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      restoreSession(JSON.parse(reader.result));
    } catch (error) {
      alert("Non riesco a leggere questo file sessione.");
      console.error(error);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

const downloadSessionBtn = document.getElementById("downloadSessionBtn");
const downloadOfficialSaveBtn = document.getElementById("downloadOfficialSaveBtn");
const uploadSessionBtn = document.getElementById("uploadSessionBtn");
const sessionFileInput = document.getElementById("sessionFileInput");

downloadSessionBtn?.addEventListener("click", downloadSession);
downloadOfficialSaveBtn?.addEventListener("click", downloadOfficialSave);
uploadSessionBtn?.addEventListener("click", () => sessionFileInput?.click());
sessionFileInput?.addEventListener("change", handleSessionFile);

autoSaveSession();