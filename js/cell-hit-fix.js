window.addEventListener('DOMContentLoaded', function () {
  var body = document.getElementById('scheduleBody');
  if (!body) return;

  var selectedCell = null;
  var copiedShift = null;
  var editBtn = null;
  var copyBtn = null;
  var pasteBtn = null;
  var label = null;

  function injectStyles() {
    if (document.getElementById('cellHitFixStyles')) return;
    var style = document.createElement('style');
    style.id = 'cellHitFixStyles';
    style.textContent = '.shift-cell.is-selected{outline:3px solid #ffd400!important;outline-offset:-3px!important;box-shadow:0 0 0 3px rgba(255,212,0,.35),0 10px 24px rgba(6,27,58,.18)!important}.cell-copy-toolbar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;padding:8px;border-radius:16px;background:rgba(255,255,255,.82);border:1px solid rgba(6,27,58,.12)}.cell-copy-toolbar button{min-height:36px;border:0;border-radius:999px;padding:8px 12px;background:#073b7a;color:#fff;font-weight:900}.cell-copy-toolbar button:nth-child(2){background:#0b63b6}.cell-copy-toolbar button:nth-child(3){background:#795200}.cell-copy-toolbar button:disabled{opacity:.45;filter:grayscale(1)}.cell-copy-toolbar .cell-copy-label{font-size:.78rem;font-weight:900;color:#073b7a}@media(max-width:760px){.cell-copy-toolbar{position:sticky;top:0;z-index:40;margin-top:6px}.cell-copy-toolbar button{flex:1 1 96px}}';
    document.head.appendChild(style);
  }

  function injectToolbar() {
    if (document.getElementById('cellCopyToolbar')) return;
    var toolbar = document.createElement('section');
    toolbar.id = 'cellCopyToolbar';
    toolbar.className = 'cell-copy-toolbar';
    toolbar.setAttribute('aria-label', 'Copia e incolla turni');
    toolbar.innerHTML = '<button id="editSelectedShiftBtn" type="button" disabled>Modifica</button><button id="copySelectedShiftBtn" type="button" disabled>Copia</button><button id="pasteSelectedShiftBtn" type="button" disabled>Incolla</button><span id="cellCopyLabel" class="cell-copy-label">Seleziona una cella</span>';

    var zoomBar = document.querySelector('.table-zoom-bar');
    if (zoomBar && zoomBar.parentElement) zoomBar.parentElement.insertBefore(toolbar, zoomBar.nextSibling);
    else body.parentElement.insertBefore(toolbar, body.parentElement.firstChild);

    editBtn = document.getElementById('editSelectedShiftBtn');
    copyBtn = document.getElementById('copySelectedShiftBtn');
    pasteBtn = document.getElementById('pasteSelectedShiftBtn');
    label = document.getElementById('cellCopyLabel');

    editBtn.addEventListener('click', openSelectedShiftEditor);
    copyBtn.addEventListener('click', function () { copySelectedShift(); refreshToolbar(); });
    pasteBtn.addEventListener('click', function () { pasteCopiedShift(); refreshToolbar(); });
  }

  function isTextEditingTarget(target) {
    if (!target) return false;
    var tag = String(target.tagName || '').toLowerCase();
    return target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
  }

  function getPersonIndexFromTarget(target) {
    if (!target || !target.closest) return -1;
    var holder = target.closest('[data-person]');
    if (!holder) return -1;
    var index = Number(holder.dataset.person);
    return Number.isInteger(index) ? index : -1;
  }

  function getShiftButtonFromEvent(event) {
    return event.target && event.target.closest ? event.target.closest('.shift-cell') : null;
  }

  function readCellInfo(cell) {
    if (!cell) return null;
    var personIndex = getPersonIndexFromTarget(cell);
    var dayKey = cell.dataset.day;
    if (personIndex < 0 || !dayKey || typeof staff === 'undefined' || !staff[personIndex]) return null;
    return { personIndex: personIndex, personName: staff[personIndex].nome, dayKey: dayKey };
  }

  function markSelected(cell) {
    body.querySelectorAll('.shift-cell.is-selected').forEach(function (item) { item.classList.remove('is-selected'); });
    if (!cell) { selectedCell = null; refreshToolbar(); return; }
    cell.classList.add('is-selected');
    selectedCell = readCellInfo(cell);
    refreshToolbar();
  }

  function resolveSelectedCellInfo() {
    if (!selectedCell || typeof staff === 'undefined') return null;
    if (Number.isInteger(selectedCell.personIndex) && staff[selectedCell.personIndex]) {
      return { personIndex: selectedCell.personIndex, personName: staff[selectedCell.personIndex].nome, dayKey: selectedCell.dayKey };
    }
    if (selectedCell.personName) {
      var byName = staff.findIndex(function (person) { return person.nome === selectedCell.personName; });
      if (byName >= 0) return { personIndex: byName, personName: staff[byName].nome, dayKey: selectedCell.dayKey };
    }
    return null;
  }

  function cloneShift(shift) {
    return { pranzo: shift && shift.pranzo ? shift.pranzo : 'Riposo', sera: shift && shift.sera ? shift.sera : 'Riposo' };
  }

  function showStatus(text) {
    var status = document.getElementById('autosaveStatus');
    if (!status) return;
    var oldText = status.textContent;
    status.textContent = text;
    window.clearTimeout(showStatus._timer);
    showStatus._timer = window.setTimeout(function () { status.textContent = oldText || 'Autosalvataggio attivo'; }, 1400);
  }

  function refreshToolbar() {
    var info = resolveSelectedCellInfo();
    if (editBtn) editBtn.disabled = !info;
    if (copyBtn) copyBtn.disabled = !info;
    if (pasteBtn) pasteBtn.disabled = !info || !copiedShift;
    if (label) label.textContent = info ? (info.personName + ' · ' + info.dayKey) : 'Seleziona una cella';
  }

  function openSelectedShiftEditor() {
    var info = resolveSelectedCellInfo();
    if (!info || typeof openShiftMenu !== 'function') return false;
    openShiftMenu(info.personIndex, info.dayKey);
    return true;
  }

  function copySelectedShift() {
    var info = resolveSelectedCellInfo();
    if (!info) return false;
    var person = staff[info.personIndex];
    var shift = person && person.turni ? person.turni[info.dayKey] : null;
    if (!shift) return false;
    copiedShift = cloneShift(shift);
    showStatus('Turno copiato');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText([copiedShift.pranzo, copiedShift.sera].join(' / ')).catch(function () {});
    refreshToolbar();
    return true;
  }

  function pasteCopiedShift() {
    var info = resolveSelectedCellInfo();
    if (!info || !copiedShift) return false;
    if (!staff[info.personIndex].turni) return false;
    staff[info.personIndex].turni[info.dayKey] = cloneShift(copiedShift);
    saveStaff();
    renderTable();
    showStatus('Turno incollato');
    selectedCell = info;
    window.setTimeout(function () {
      var selector = '.shift-cell[data-person="' + info.personIndex + '"][data-day="' + info.dayKey + '"]';
      var cell = body.querySelector(selector);
      if (cell) markSelected(cell);
      refreshToolbar();
    }, 0);
    return true;
  }

  injectStyles();
  injectToolbar();
  refreshToolbar();

  body.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.request-badge')) return;
    var cell = getShiftButtonFromEvent(event);
    if (!cell) return;
    markSelected(cell);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  body.addEventListener('dblclick', function (event) {
    var cell = getShiftButtonFromEvent(event);
    if (!cell) return;
    markSelected(cell);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    openSelectedShiftEditor();
  }, true);

  body.addEventListener('pointerdown', function (event) {
    var cell = getShiftButtonFromEvent(event);
    if (cell) markSelected(cell);
  }, true);

  body.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || target.dataset.field !== 'nome') return;
    var personIndex = getPersonIndexFromTarget(target);
    if (personIndex < 0 || typeof staff === 'undefined') return;
    event.stopPropagation();
    event.stopImmediatePropagation();
    try {
      staff[personIndex][target.dataset.field] = target.textContent.trim();
      saveStaff();
      populateRequestNames();
      renderRequests();
    } catch (error) {
      console.warn('Correzione indice nome non applicata:', error);
    }
  }, true);

  document.addEventListener('keydown', function (event) {
    if (!event.ctrlKey && !event.metaKey) return;
    if (isTextEditingTarget(event.target)) return;
    var key = String(event.key || '').toLowerCase();
    if (key === 'c') { if (copySelectedShift()) { event.preventDefault(); event.stopPropagation(); } return; }
    if (key === 'v') { if (pasteCopiedShift()) { event.preventDefault(); event.stopPropagation(); } return; }
    if (key === 'e') { if (openSelectedShiftEditor()) { event.preventDefault(); event.stopPropagation(); } }
  }, true);
});
