window.addEventListener('DOMContentLoaded', function () {
  var body = document.getElementById('scheduleBody');
  if (!body) return;

  var selected = null;
  var copied = null;
  var editBtn = null;
  var copyBtn = null;
  var pasteBtn = null;
  var label = null;

  function installStyle() {
    if (document.getElementById('cellCopyPasteStyle')) return;
    var style = document.createElement('style');
    style.id = 'cellCopyPasteStyle';
    style.textContent = '.shift-cell.is-selected{outline:3px solid #ffd400!important;outline-offset:-3px!important;box-shadow:0 0 0 3px rgba(255,212,0,.35),0 10px 24px rgba(6,27,58,.18)!important}.cell-copy-toolbar{display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:8px 0 12px;padding:8px;border-radius:16px;background:rgba(255,255,255,.86);border:1px solid rgba(6,27,58,.12)}.cell-copy-toolbar button{min-height:38px;border:0;border-radius:999px;padding:8px 13px;background:#073b7a;color:#fff;font-weight:900}.cell-copy-toolbar button:nth-child(2){background:#0b63b6}.cell-copy-toolbar button:nth-child(3){background:#795200}.cell-copy-toolbar button:disabled{opacity:.45;filter:grayscale(1)}.cell-copy-toolbar .cell-copy-label{font-size:.78rem;font-weight:900;color:#073b7a}@media(max-width:760px){.cell-copy-toolbar{position:sticky;top:0;z-index:50}.cell-copy-toolbar button{flex:1 1 90px}}';
    document.head.appendChild(style);
  }

  function installToolbar() {
    if (document.getElementById('cellCopyToolbar')) return;
    var toolbar = document.createElement('section');
    toolbar.id = 'cellCopyToolbar';
    toolbar.className = 'cell-copy-toolbar';
    toolbar.innerHTML = '<button id="editSelectedShiftBtn" type="button" disabled>Modifica</button><button id="copySelectedShiftBtn" type="button" disabled>Copia</button><button id="pasteSelectedShiftBtn" type="button" disabled>Incolla</button><span id="cellCopyLabel" class="cell-copy-label">Seleziona una cella</span>';
    var zoomBar = document.querySelector('.table-zoom-bar');
    if (zoomBar && zoomBar.parentElement) zoomBar.parentElement.insertBefore(toolbar, zoomBar.nextSibling);
    else document.querySelector('.table-card')?.parentElement?.insertBefore(toolbar, document.querySelector('.table-card'));

    editBtn = document.getElementById('editSelectedShiftBtn');
    copyBtn = document.getElementById('copySelectedShiftBtn');
    pasteBtn = document.getElementById('pasteSelectedShiftBtn');
    label = document.getElementById('cellCopyLabel');

    editBtn.addEventListener('click', editSelected);
    copyBtn.addEventListener('click', copySelected);
    pasteBtn.addEventListener('click', pasteSelected);
  }

  function readCell(cell) {
    if (!cell) return null;
    var personIndex = Number(cell.dataset.person);
    var dayKey = cell.dataset.day;
    if (!Number.isInteger(personIndex) || personIndex < 0 || !dayKey) return null;
    if (typeof staff === 'undefined' || !staff[personIndex]) return null;
    return { personIndex: personIndex, dayKey: dayKey };
  }

  function personLabel(info) {
    if (!info || typeof staff === 'undefined' || !staff[info.personIndex]) return '';
    return staff[info.personIndex].nome + ' · ' + info.dayKey;
  }

  function updateToolbar() {
    var ok = !!selected;
    if (editBtn) editBtn.disabled = !ok;
    if (copyBtn) copyBtn.disabled = !ok;
    if (pasteBtn) pasteBtn.disabled = !ok || !copied;
    if (label) label.textContent = ok ? personLabel(selected) : 'Seleziona una cella';
  }

  function mark(cell) {
    body.querySelectorAll('.shift-cell.is-selected').forEach(function (item) {
      item.classList.remove('is-selected');
    });
    selected = readCell(cell);
    if (cell && selected) cell.classList.add('is-selected');
    updateToolbar();
  }

  function cloneShift(shift) {
    return { pranzo: shift && shift.pranzo ? shift.pranzo : 'Riposo', sera: shift && shift.sera ? shift.sera : 'Riposo' };
  }

  function showStatus(text) {
    var status = document.getElementById('autosaveStatus');
    if (!status) return;
    status.textContent = text;
    window.clearTimeout(showStatus.timer);
    showStatus.timer = window.setTimeout(function () {
      status.textContent = 'Autosalvataggio attivo';
    }, 1300);
  }

  function editSelected() {
    if (!selected || typeof openShiftMenu !== 'function') return false;
    openShiftMenu(selected.personIndex, selected.dayKey);
    return true;
  }

  function copySelected() {
    if (!selected || typeof staff === 'undefined') return false;
    var person = staff[selected.personIndex];
    var shift = person && person.turni ? person.turni[selected.dayKey] : null;
    if (!shift) return false;
    copied = cloneShift(shift);
    showStatus('Turno copiato');
    updateToolbar();
    return true;
  }

  function pasteSelected() {
    if (!selected || !copied || typeof staff === 'undefined') return false;
    if (!staff[selected.personIndex] || !staff[selected.personIndex].turni) return false;
    staff[selected.personIndex].turni[selected.dayKey] = cloneShift(copied);
    saveStaff();
    renderTable();
    var keep = { personIndex: selected.personIndex, dayKey: selected.dayKey };
    window.setTimeout(function () {
      var cell = body.querySelector('.shift-cell[data-person="' + keep.personIndex + '"][data-day="' + keep.dayKey + '"]');
      mark(cell);
      showStatus('Turno incollato');
    }, 0);
    return true;
  }

  function isTextTarget(target) {
    var tag = String(target && target.tagName || '').toLowerCase();
    return target && (target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select');
  }

  installStyle();
  installToolbar();
  updateToolbar();

  body.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.request-badge')) return;
    var cell = event.target.closest && event.target.closest('.shift-cell');
    if (!cell) return;
    mark(cell);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }, true);

  body.addEventListener('pointerdown', function (event) {
    var cell = event.target.closest && event.target.closest('.shift-cell');
    if (cell) mark(cell);
  }, true);

  body.addEventListener('dblclick', function (event) {
    var cell = event.target.closest && event.target.closest('.shift-cell');
    if (!cell) return;
    mark(cell);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    editSelected();
  }, true);

  document.addEventListener('keydown', function (event) {
    if (!(event.ctrlKey || event.metaKey)) return;
    if (isTextTarget(event.target)) return;
    var key = String(event.key || '').toLowerCase();
    if (key === 'c') {
      if (copySelected()) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (key === 'v') {
      if (pasteSelected()) { event.preventDefault(); event.stopPropagation(); }
      return;
    }
    if (key === 'e') {
      if (editSelected()) { event.preventDefault(); event.stopPropagation(); }
    }
  }, true);
});
