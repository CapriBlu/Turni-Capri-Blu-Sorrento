const sessionBackupKey = "capriBluAutoSessionBackupV1";

function getSessionSnapshot() {
  const weeklyStaff = {};

  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.startsWith(weekStoragePrefix)) {
      weeklyStaff[key.replace(weekStoragePrefix, "")] = JSON.parse(localStorage.getItem(key) || "[]");
    }
  }

  weeklyStaff[weekInput.value] = staff;

  return {
    app: "Capri Blu Turni",
    version: 1,
    savedAt: new Date().toISOString(),
    currentWeek: weekInput.value,
    staff,
    weeklyStaff,
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

function downloadSession() {
  autoSaveSession();
  const snapshot = getSessionSnapshot();
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(snapshot, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Turni-CapriBlu-${date}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  setAutosaveStatus("Sessione scaricata");
}

function restoreSession(snapshot) {
  if (!snapshot || !snapshot.weeklyStaff || !snapshot.requests) {
    alert("File sessione non valido.");
    return;
  }

  Object.entries(snapshot.weeklyStaff).forEach(([week, weekStaff]) => {
    localStorage.setItem(weekStoragePrefix + week, JSON.stringify(normalizeStaff(weekStaff)));
  });

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
const uploadSessionBtn = document.getElementById("uploadSessionBtn");
const sessionFileInput = document.getElementById("sessionFileInput");

downloadSessionBtn?.addEventListener("click", downloadSession);
uploadSessionBtn?.addEventListener("click", () => sessionFileInput?.click());
sessionFileInput?.addEventListener("change", handleSessionFile);

autoSaveSession();
