const quickTimes = ["9", "10", "12", "15:30", "16", "17", "19"];

function setFastChoice(group, value) {
  const hiddenInput = document.getElementById(group + "Status");
  if (!hiddenInput) return;

  hiddenInput.value = value;

  document.querySelectorAll(`[data-group="${group}"]`).forEach((button) => {
    button.classList.toggle("active", button.dataset.value === value);
  });
}

function setQuickTime(group, value) {
  const input = document.getElementById(group + "Time");
  if (!input) return;

  input.value = value;

  document.querySelectorAll(`[data-time-group="${group}"]`).forEach((button) => {
    button.classList.toggle("active", button.dataset.time === value);
  });
}

function syncQuickTimes() {
  ["pranzo", "sera"].forEach((group) => {
    const input = document.getElementById(group + "Time");
    const value = input ? input.value : "";
    document.querySelectorAll(`[data-time-group="${group}"]`).forEach((button) => {
      button.classList.toggle("active", button.dataset.time === value);
    });
  });
}

function timeButtons(group) {
  return quickTimes.map((time) => `<button type="button" class="quick-time-btn" data-time-group="${group}" data-time="${time}">${time}</button>`).join("");
}

function syncFastChoices() {
  setFastChoice("pranzo", document.getElementById("pranzoStatus").value || "riposo");
  setFastChoice("sera", document.getElementById("seraStatus").value || "riposo");
  syncQuickTimes();
}

function stablePersonKey(person, index) {
  if (!person) return "";
  if (person.id) return String(person.id);
  return `${String(person.nome || "Staff").trim().toLowerCase()}::${index}`;
}

function resolveActivePersonIndex() {
  if (!activeEdit) return -1;

  if (activeEdit.personKey) {
    const byKey = staff.findIndex((person, index) => stablePersonKey(person, index) === activeEdit.personKey);
    if (byKey >= 0) return byKey;
  }

  if (activeEdit.personName) {
    const byName = staff.findIndex((person) => person.nome === activeEdit.personName);
    if (byName >= 0) return byName;
  }

  const fallback = Number(activeEdit.personIndex);
  return Number.isInteger(fallback) && fallback >= 0 && fallback < staff.length ? fallback : -1;
}

function openShiftMenu(personIndex, dayKey) {
  const safeIndex = Number(personIndex);
  const person = staff[safeIndex];
  if (!person || !person.turni || !person.turni[dayKey]) return;

  activeEdit = {
    personIndex: safeIndex,
    personKey: stablePersonKey(person, safeIndex),
    personName: person.nome,
    dayKey
  };

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
          <input id="pranzoTime" class="fast-time-input" type="text" placeholder="Scrivi o scegli sotto" />
          <div class="quick-time-row" aria-label="Orari rapidi apertura">
            ${timeButtons("pranzo")}
          </div>
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
          <input id="seraTime" class="fast-time-input" type="text" placeholder="Scrivi o scegli sotto" />
          <div class="quick-time-row" aria-label="Orari rapidi sera">
            ${timeButtons("sera")}
          </div>
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

  editor.querySelectorAll(".quick-time-btn").forEach((button) => {
    button.addEventListener("click", () => {
      setQuickTime(button.dataset.timeGroup, button.dataset.time);
    });
  });

  document.getElementById("pranzoTime").addEventListener("input", syncQuickTimes);
  document.getElementById("seraTime").addEventListener("input", syncQuickTimes);

  document.getElementById("clearShiftBtn").addEventListener("click", () => {
    document.getElementById("pranzoTime").value = "";
    document.getElementById("seraTime").value = "";
    setFastChoice("pranzo", "riposo");
    setFastChoice("sera", "riposo");
    syncQuickTimes();
  });

  document.getElementById("saveShiftBtn").addEventListener("click", () => {
    if (!activeEdit) return;

    const personIndex = resolveActivePersonIndex();
    if (personIndex < 0 || !staff[personIndex]) return;

    const { dayKey } = activeEdit;
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

function installDirectTouchShiftEditorFallback() {
  let touchStart = null;

  document.addEventListener("touchstart", (event) => {
    const cell = event.target.closest?.("#shiftTable .shift-cell");
    if (!cell || event.touches.length !== 1) {
      touchStart = null;
      return;
    }

    const touch = event.touches[0];
    touchStart = {
      cell,
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };
  }, { capture: true, passive: true });

  document.addEventListener("touchmove", (event) => {
    if (!touchStart || !event.touches.length) return;
    const touch = event.touches[0];
    const dx = Math.abs(touch.clientX - touchStart.x);
    const dy = Math.abs(touch.clientY - touchStart.y);
    if (dx > 14 || dy > 14) touchStart = null;
  }, { capture: true, passive: true });

  document.addEventListener("touchend", (event) => {
    if (!touchStart) return;

    const { cell, x, y, time } = touchStart;
    touchStart = null;

    const touch = event.changedTouches && event.changedTouches[0];
    if (!touch) return;

    const dx = Math.abs(touch.clientX - x);
    const dy = Math.abs(touch.clientY - y);
    const elapsed = Date.now() - time;

    if (dx > 14 || dy > 14) return;
    if (elapsed > 520) return;
    if (!document.body.contains(cell)) return;

    const personIndex = Number(cell.dataset.person);
    const dayKey = cell.dataset.day;
    if (!Number.isFinite(personIndex) || !dayKey) return;

    event.preventDefault();
    event.stopPropagation();
    openShiftMenu(personIndex, dayKey);
  }, { capture: true, passive: false });
}

createFastShiftEditor();
installDirectTouchShiftEditorFallback();
