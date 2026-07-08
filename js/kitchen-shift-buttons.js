// Menu rapido per Pizzeria / Cucina: logica M, S, M/S, 12/chius, Riposo
(function () {
  let activeKitchenEdit = null;

  const kitchenChoices = [
    { value: "M", code: "M", label: "Mattina" },
    { value: "S", code: "S", label: "Sera" },
    { value: "M/S", code: "M/S", label: "Spezzato" },
    { value: "12/chius", code: "12", label: "12/chius" },
    { value: "Riposo", code: "R", label: "Riposo" }
  ];

  function cleanKitchenValue(value) {
    const clean = String(value || "").trim();
    const lower = clean.toLowerCase().replace(/\s+/g, " ");

    if (!clean || ["r", "riposo", "riposto", "off", "-", "—", "vuoto"].includes(lower)) return "Riposo";
    if (["m", "mattina", "pranzo", "p"].includes(lower)) return "M";
    if (["s", "sera", "cena", "c"].includes(lower)) return "S";
    if (["m/s", "ms", "m-s", "m s", "spezzato"].includes(lower)) return "M/S";
    if (["12/chius", "12 chius", "12 ch", "12/ch", "12 chiusura", "12/chiusura", "12"].includes(lower)) return "12/chius";

    return clean;
  }

  // Sovrascrive la vecchia normalizzazione a prompt, così anche caricamenti/salvataggi usano la stessa logica.
  window.normalizeKitchenValue = cleanKitchenValue;
  try {
    normalizeKitchenValue = cleanKitchenValue;
  } catch (error) {
    // In alcuni browser la binding globale può non essere riassegnabile: l'editor usa comunque cleanKitchenValue.
  }

  // Migliora i colori delle celle cucina/pizzeria.
  const previousSlotClass = window.slotClass;
  window.slotClass = function patchedSlotClass(value, part) {
    const normalized = cleanKitchenValue(value);
    if (normalized === "Riposo") return "riposo";
    if (normalized === "M/S") return "spezzato";
    if (normalized === "S" || normalized === "12/chius") return "sera";
    if (normalized === "M") return "pranzo";
    if (typeof previousSlotClass === "function") return previousSlotClass(value, part);
    return part === "sera" ? "sera" : "pranzo";
  };
  try {
    slotClass = window.slotClass;
  } catch (error) {}

  function choiceButtons() {
    return kitchenChoices.map((choice) => `
      <button type="button" class="kitchen-choice-btn" data-kitchen-choice="${choice.value}">
        <strong>${choice.code}</strong>
        <small>${choice.label}</small>
      </button>
    `).join("");
  }

  function setKitchenChoice(value) {
    const normalized = cleanKitchenValue(value);
    const input = document.getElementById("kitchenShiftValue");
    if (input) input.value = normalized;

    document.querySelectorAll("[data-kitchen-choice]").forEach((button) => {
      button.classList.toggle("active", cleanKitchenValue(button.dataset.kitchenChoice) === normalized);
    });
  }

  function createKitchenEditor() {
    if (document.getElementById("kitchenEditorBackdrop")) return;

    const editor = document.createElement("div");
    editor.id = "kitchenEditorBackdrop";
    editor.className = "editor-backdrop kitchen-editor-backdrop";
    editor.innerHTML = `
      <div class="shift-editor kitchen-fast-editor" role="dialog" aria-modal="true" aria-labelledby="kitchenEditorTitle">
        <div class="editor-head">
          <h2 id="kitchenEditorTitle">Modifica turno</h2>
          <button id="closeKitchenBtn" type="button" class="editor-close-btn" aria-label="Chiudi">×</button>
        </div>

        <div class="kitchen-editor-panel">
          <div class="fast-panel-head">
            <div class="editor-code kitchen-code">M/S</div>
            <span>Sistema Pizzeria / Cucina</span>
          </div>

          <input id="kitchenShiftValue" class="fast-time-input" type="text" placeholder="M, S, M/S, 12/chius, Riposo" />

          <div class="kitchen-choice-grid" aria-label="Scelte rapide pizzeria cucina">
            ${choiceButtons()}
          </div>
        </div>

        <div class="editor-actions">
          <button id="kitchenRestBtn" type="button" class="secondary-btn">Riposo</button>
          <button id="cancelKitchenBtn" type="button" class="secondary-btn">Annulla</button>
          <button id="saveKitchenBtn" type="button" class="primary-btn">Salva</button>
        </div>
      </div>
    `;

    document.body.appendChild(editor);

    editor.addEventListener("click", (event) => {
      if (event.target === editor) closeKitchenMenu();
    });

    document.getElementById("closeKitchenBtn").addEventListener("click", closeKitchenMenu);
    document.getElementById("cancelKitchenBtn").addEventListener("click", closeKitchenMenu);
    document.getElementById("kitchenRestBtn").addEventListener("click", () => setKitchenChoice("Riposo"));
    document.getElementById("kitchenShiftValue").addEventListener("input", (event) => setKitchenChoice(event.target.value));

    editor.querySelectorAll("[data-kitchen-choice]").forEach((button) => {
      button.addEventListener("click", () => setKitchenChoice(button.dataset.kitchenChoice));
    });

    document.getElementById("saveKitchenBtn").addEventListener("click", saveKitchenChoice);
  }

  function openKitchenMenu(cell) {
    const name = cell.dataset.name;
    const section = cell.dataset.kitchenSection || "pizzeria";
    const dayKey = cell.dataset.day;
    const dayLabel = days.find((day) => day.key === dayKey)?.label || dayKey;
    const data = loadKitchenData();
    const current = data[name]?.[dayKey] || "Riposo";

    activeKitchenEdit = { name, section, dayKey };

    createKitchenEditor();
    document.getElementById("kitchenEditorTitle").textContent = `${name} - ${dayLabel}`;
    document.querySelector(".kitchen-code").textContent = section === "pizzeria" ? "P" : "C";
    setKitchenChoice(current);
    document.getElementById("kitchenEditorBackdrop").classList.add("open");
  }

  function closeKitchenMenu() {
    activeKitchenEdit = null;
    document.getElementById("kitchenEditorBackdrop")?.classList.remove("open");
  }

  function saveKitchenChoice() {
    if (!activeKitchenEdit) return;

    const value = cleanKitchenValue(document.getElementById("kitchenShiftValue")?.value || "Riposo");
    const data = loadKitchenData();

    if (!data[activeKitchenEdit.name]) data[activeKitchenEdit.name] = {};
    data[activeKitchenEdit.name][activeKitchenEdit.dayKey] = value;

    saveKitchenData(data);
    renderTable();
    closeKitchenMenu();
  }

  window.openKitchenMenu = openKitchenMenu;
  window.closeKitchenMenu = closeKitchenMenu;
  window.editKitchenCell = openKitchenMenu;

  try {
    editKitchenCell = openKitchenMenu;
  } catch (error) {}
}());
