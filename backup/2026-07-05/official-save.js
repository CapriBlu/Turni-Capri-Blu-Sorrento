const officialSavePath = "save/turni-attuali.json";
const loadOfficialSaveBtn = document.getElementById("loadOfficialSaveBtn");

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

    restoreSession(snapshot);
    setAutosaveStatus("Salvataggio ufficiale caricato");
  } catch (error) {
    console.error(error);
    alert("Non riesco a caricare save/turni-attuali.json. Controlla che il file esista nella cartella save.");
    setAutosaveStatus("Errore caricamento ufficiale");
  }
}

loadOfficialSaveBtn?.addEventListener("click", loadOfficialSave);
