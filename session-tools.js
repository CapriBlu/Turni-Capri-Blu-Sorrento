function capriBluSessionKeys() {
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (key && key.startsWith("capriBlu")) keys.push(key);
  }
  return keys.sort();
}

function saveCurrentSession() {
  const items = {};
  capriBluSessionKeys().forEach((key) => {
    items[key] = localStorage.getItem(key);
  });

  const session = {
    app: "Turni Capri Blu Sorrento",
    version: 1,
    savedAt: new Date().toISOString(),
    items
  };

  const blob = new Blob([JSON.stringify(session, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = now.toTimeString().slice(0, 5).replace(":", "-");
  const link = document.createElement("a");
  link.href = url;
  link.download = `turni-capri-blu-sessione-${date}-${time}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function loadSessionFromFile(file) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const session = JSON.parse(reader.result);
      if (!session || !session.items || typeof session.items !== "object") {
        alert("File sessione non valido.");
        return;
      }

      const confirmed = confirm("Caricare questa sessione? I turni e le richieste locali verranno sostituiti con quelli del file.");
      if (!confirmed) return;

      capriBluSessionKeys().forEach((key) => localStorage.removeItem(key));

      Object.entries(session.items).forEach(([key, value]) => {
        if (key.startsWith("capriBlu") && typeof value === "string") {
          localStorage.setItem(key, value);
        }
      });

      alert("Sessione caricata. La pagina verrà aggiornata.");
      window.location.reload();
    } catch (error) {
      alert("Non riesco a leggere il file sessione.");
    }
  };

  reader.readAsText(file);
}

function setupSessionTools() {
  const saveButton = document.getElementById("saveSessionBtn");
  const loadButton = document.getElementById("loadSessionBtn");
  const fileInput = document.getElementById("sessionFileInput");

  if (saveButton) saveButton.addEventListener("click", saveCurrentSession);
  if (loadButton && fileInput) {
    loadButton.addEventListener("click", () => fileInput.click());
    fileInput.addEventListener("change", () => {
      loadSessionFromFile(fileInput.files[0]);
      fileInput.value = "";
    });
  }
}

setupSessionTools();
