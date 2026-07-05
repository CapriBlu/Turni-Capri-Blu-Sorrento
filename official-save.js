const officialSavePath = "save/turni-attuali.json";
const officialSaveLoadedAtKey = "capriBluOfficialSaveLoadedAt";
const localChangesAfterOfficialKey = "capriBluLocalChangesAfterOfficial";
const loadOfficialSaveBtn = document.getElementById("loadOfficialSaveBtn");
const saveSourceStatus = document.getElementById("saveSourceStatus");

function setSaveSourceStatus(mode, text) {
  if (!saveSourceStatus) return;
  saveSourceStatus.classList.remove("local", "official", "changed");
  saveSourceStatus.classList.add(mode);
  saveSourceStatus.textContent = text;
}

function updateSaveSourceStatus() {
  const loadedAt = localStorage.getItem(officialSaveLoadedAtKey);
  const hasLocalChanges = localStorage.getItem(localChangesAfterOfficialKey) === "true";

  if (loadedAt && hasLocalChanges) {
    setSaveSourceStatus("changed", "Ufficiale + modifiche locali");
    return;
  }

  if (loadedAt) {
    setSaveSourceStatus("official", "Dati ufficiali caricati");
    return;
  }

  setSaveSourceStatus("local", "Dati locali");
}

function markLocalChangesAfterOfficial() {
  if (!localStorage.getItem(officialSaveLoadedAtKey)) return;
  localStorage.setItem(localChangesAfterOfficialKey, "true");
  updateSaveSourceStatus();
}

function hasUsefulOfficialSnapshot(snapshot) {
  if (!snapshot || !snapshot.weeklyStaff || !snapshot.requests) return false;
  if (Array.isArray(snapshot.staff) && snapshot.staff.length > 0) return true;
  return Object.values(snapshot.weeklyStaff).some((weekStaff) => Array.isArray(weekStaff) && weekStaff.length > 0);
}

function hasLocalTurniData() {
  const currentWeek = document.getElementById("weekInput")?.value || "";
  const currentWeekKey = "capriBluTurniStaffWeekV1-" + currentWeek;
  return Boolean(
    localStorage.getItem(currentWeekKey) ||
    localStorage.getItem("capriBluTurniStaffV5") ||
    localStorage.getItem(officialSaveLoadedAtKey)
  );
}

async function fetchOfficialSnapshot() {
  const response = await fetch(officialSavePath + "?v=" + Date.now(), { cache: "no-store" });
  if (!response.ok) throw new Error("HTTP " + response.status);
  return response.json();
}

function applyOfficialSnapshot(snapshot) {
  localStorage.removeItem(localChangesAfterOfficialKey);
  restoreSession(snapshot);
  localStorage.setItem(officialSaveLoadedAtKey, new Date().toISOString());
  localStorage.removeItem(localChangesAfterOfficialKey);
  updateSaveSourceStatus();
}

const saveStaffBeforeOfficialStatus = saveStaff;
saveStaff = function () {
  saveStaffBeforeOfficialStatus();
  markLocalChangesAfterOfficial();
};

const saveRequestsBeforeOfficialStatus = saveRequests;
saveRequests = function () {
  saveRequestsBeforeOfficialStatus();
  markLocalChangesAfterOfficial();
};

async function loadOfficialSave() {
  try {
    setAutosaveStatus("Carico salvataggio ufficiale...");

    const snapshot = await fetchOfficialSnapshot();
    if (!hasUsefulOfficialSnapshot(snapshot)) {
      alert("Il file save/turni-attuali.json è vuoto o non contiene turni salvati.");
      setAutosaveStatus("Salvataggio ufficiale vuoto");
      return;
    }

    const confirmLoad = confirm("Caricare il salvataggio ufficiale da save/turni-attuali.json? Le modifiche locali verranno sostituite dai dati del file ufficiale.");
    if (!confirmLoad) {
      setAutosaveStatus("Caricamento annullato");
      return;
    }

    applyOfficialSnapshot(snapshot);
    setAutosaveStatus("Salvataggio ufficiale caricato");
  } catch (error) {
    console.error(error);
    alert("Non riesco a caricare save/turni-attuali.json. Controlla che il file esista nella cartella save.");
    setAutosaveStatus("Errore caricamento ufficiale");
  }
}

async function autoLoadOfficialSaveIfNeeded() {
  if (hasLocalTurniData()) {
    updateSaveSourceStatus();
    return;
  }

  try {
    setAutosaveStatus("Cerco salvataggio ufficiale...");
    const snapshot = await fetchOfficialSnapshot();

    if (!hasUsefulOfficialSnapshot(snapshot)) {
      setAutosaveStatus("Nessun salvataggio ufficiale trovato");
      updateSaveSourceStatus();
      return;
    }

    applyOfficialSnapshot(snapshot);
    setAutosaveStatus("Salvataggio ufficiale caricato automaticamente");
  } catch (error) {
    console.warn("Salvataggio ufficiale non caricato automaticamente", error);
    updateSaveSourceStatus();
  }
}

loadOfficialSaveBtn?.addEventListener("click", loadOfficialSave);
autoLoadOfficialSaveIfNeeded();
