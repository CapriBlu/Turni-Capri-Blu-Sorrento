function setFastChoice(group, value) {
  const hiddenInput = document.getElementById(group + "Status");
  if (!hiddenInput) return;

  hiddenInput.value = value;

  document.querySelectorAll(`[data-group="${group}"]`).forEach((button) => {
    button.classList.toggle("active", button.dataset.value === value);
  });
}

function syncFastChoices() {
  setFastChoice("pranzo", document.getElementById("pranzoStatus").value || "riposo");
  setFastChoice("sera", document.getElementById("seraStatus").value || "riposo");
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
  syncFastChoices();
  document.getElementById("shiftEditorBackdrop").classList.add("open");
}

function closeShiftMenu() {
  activeEdit = null;
  document.getElementById("shiftEditorBackdrop").classList.remove("open");
}

function createFastShiftEditor() {
  const oldEditor = document.getElementById("shiftEditorBackdrop");
  if (oldEditor) oldEditor.remove();

  const editor = document.createElement("div");
  editor.id = "shiftEditorBackdrop";
  editor.className = "editor-backdrop";
  editor.innerHTML = `
    <div class="shift-editor fast-editor" role="dialog" aria-modal="true" aria-labelledby="editorTitle">
      <div class="editor-head">
        <h2 id="editorTitle">Modifica turno</h2>
        <button id="closeShiftBtn" type="button" class="editor-close-btn" aria-label="Chiudi">×</button>
      </div>

      <div class="fast-shift-grid">
        <div class="fast-panel mattina">
          <div class="fast-panel-head">
            <div class="editor-code apertura-code">A</div>
            <span>Apertura / Pranzo</span>
          </div>
          <input id="pranzoStatus" type="hidden" value="riposo" />
          <div class="quick-choice-row" aria-label="Scelta turno apertura">
            <button type="button" class="quick-choice" data-group="pranzo" data-value="apertura"><strong>A</strong><small>Apertura</small></button>
            <button type="button" class="quick-choice" data-group="pranzo" data-value="pranzo"><strong>P</strong><small>Pranzo</small></button>
            <button type="button" class="quick-choice" data-group="pranzo" data-value="riposo"><strong>R</strong><small>Riposo</small></button>
          </div>
          <label class="fast-time-label" for="pranzoTime">Orario</label>
          <input id="pranzoTime" class="fast-time-input" type="text" placeholder="10:30-15:30" />
        </div>

        <div class="fast-panel serale">
          <div class="fast-panel-head">
            <div class="editor-code sera-code">S</div>
            <span>Sera / Cena</span>
          </div>
          <input id="seraStatus" type="hidden" value="riposo" />
          <div class="quick-choice-row" aria-label="Scelta turno serale">
            <button type="button" class="quick-choice" data-group="sera" data-value="sera"><strong>S</strong><small>Sera</small></button>
            <button type="button" class="quick-choice" data-group="sera" data-value="cena"><strong>C</strong><small>Cena</small></button>
            <button type="button" class="quick-choice" data-group="sera" data-value="riposo"><strong>R</strong><small>Riposo</small></button>
          </div>
          <label class="fast-time-label" for="seraTime">Orario</label>
          <input id="seraTime" class="fast-time-input" type="text" placeholder="18:30-23:30" />
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

  document.getElementById("closeShiftBtn").addEventListener("click", closeShiftMenu);
  document.getElementById("cancelShiftBtn").addEventListener("click", closeShiftMenu);

  editor.querySelectorAll(".quick-choice").forEach((button) => {
    button.addEventListener("click", () => {
      setFastChoice(button.dataset.group, button.dataset.value);
    });
  });

  document.getElementById("clearShiftBtn").addEventListener("click", () => {
    document.getElementById("pranzoTime").value = "";
    document.getElementById("seraTime").value = "";
    setFastChoice("pranzo", "riposo");
    setFastChoice("sera", "riposo");
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

createFastShiftEditor();
