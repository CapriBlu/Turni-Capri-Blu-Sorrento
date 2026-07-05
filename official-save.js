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

    const response = await fetch(officialSavePath + "?v=" + Date.now(), { cache: "no-store" });
    if (!response.ok) throw new Error("HTTP " + response.status);

    const snapshot = await response.json();
    if (!snapshot || !snapshot.weeklyStaff || !snapshot.requests) {
      alert("Il file save/turni-attuali.json non contiene una sessione valida.");
      setAutosaveStatus("Salvataggio ufficiale non valido");
      return;
    }

    const confirmLoad = confirm("Caricare il salvataggio ufficiale da save/turni-attuali.json? Le modifiche locali verranno sostituite dai dati del file ufficiale.");
    if (!confirmLoad) {
      setAutosaveStatus("Caricamento annullato");
      return;
    }

    localStorage.removeItem(localChangesAfterOfficialKey);
    restoreSession(snapshot);
    localStorage.setItem(officialSaveLoadedAtKey, new Date().toISOString());
    localStorage.removeItem(localChangesAfterOfficialKey);
    updateSaveSourceStatus();
    setAutosaveStatus("Salvataggio ufficiale caricato");
  } catch (error) {
    console.error(error);
    alert("Non riesco a caricare save/turni-attuali.json. Controlla che il file esista nella cartella save.");
    setAutosaveStatus("Errore caricamento ufficiale");
  }
}

loadOfficialSaveBtn?.addEventListener("click", loadOfficialSave);
updateSaveSourceStatus();
