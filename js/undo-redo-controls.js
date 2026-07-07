/*
  Capri Blu Turni - Undo / Redo controls
  Aggiunge logica tipo Excel: Indietro / Avanti + Ctrl+Z, Ctrl+Y, Ctrl+Shift+Z.
*/
(function () {
  var maxHistory = 60;
  var undoStack = [];
  var redoStack = [];
  var isRestoring = false;
  var lastSnapshot = '';

  function canUseAppState() {
    return typeof staff !== 'undefined' && typeof requests !== 'undefined';
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeSnapshot() {
    if (!canUseAppState()) return null;

    return {
      staff: clone(staff),
      requests: clone(requests),
      week: document.getElementById('weekInput') ? document.getElementById('weekInput').value : ''
    };
  }

  function snapshotKey(snapshot) {
    try {
      return JSON.stringify(snapshot || {});
    } catch (error) {
      return '';
    }
  }

  function setButtonsState() {
    var undoBtn = document.getElementById('undoBtn');
    var redoBtn = document.getElementById('redoBtn');

    if (undoBtn) undoBtn.disabled = undoStack.length === 0;
    if (redoBtn) redoBtn.disabled = redoStack.length === 0;
  }

  function saveCurrentStateToStorage(snapshot) {
    if (!snapshot) return;

    try {
      var weekInput = document.getElementById('weekInput');
      var weekValue = snapshot.week || (weekInput ? weekInput.value : '');

      if (weekInput && weekValue) {
        weekInput.value = weekValue;
        localStorage.setItem('capriBluTurniSettimanaV2', weekValue);
      }

      if (weekValue) {
        localStorage.setItem('capriBluTurniStaffWeekV1-' + weekValue, JSON.stringify(snapshot.staff));
      }

      localStorage.setItem('capriBluTurniStaffV5', JSON.stringify(snapshot.staff));
      localStorage.setItem('capriBluRichiesteStaffV1', JSON.stringify(snapshot.requests));
    } catch (error) {
      console.warn('Undo/redo: salvataggio stato non riuscito', error);
    }
  }

  function renderCurrentState() {
    if (typeof updateWeekHeader === 'function') updateWeekHeader();
    if (typeof populateRequestNames === 'function') populateRequestNames();
    if (typeof renderRequests === 'function') renderRequests();
    if (typeof renderTable === 'function') renderTable();
    if (typeof syncStaffNames === 'function') syncStaffNames();
  }

  function applySnapshot(snapshot) {
    if (!snapshot || !canUseAppState()) return false;

    isRestoring = true;

    try {
      staff = clone(snapshot.staff || []);
      requests = clone(snapshot.requests || []);
      saveCurrentStateToStorage(snapshot);
      renderCurrentState();
      lastSnapshot = snapshotKey(makeSnapshot());
      setButtonsState();
      return true;
    } finally {
      setTimeout(function () {
        isRestoring = false;
      }, 0);
    }
  }

  function pushUndoSnapshot() {
    if (isRestoring || !canUseAppState()) return;

    var snapshot = makeSnapshot();
    var key = snapshotKey(snapshot);

    if (!key || key === lastSnapshot) return;

    if (lastSnapshot) {
      undoStack.push(JSON.parse(lastSnapshot));
      if (undoStack.length > maxHistory) undoStack.shift();
      redoStack = [];
    }

    lastSnapshot = key;
    setButtonsState();
  }

  function undo() {
    if (!undoStack.length) return;

    var current = makeSnapshot();
    var previous = undoStack.pop();

    if (current) redoStack.push(current);
    applySnapshot(previous);
  }

  function redo() {
    if (!redoStack.length) return;

    var current = makeSnapshot();
    var next = redoStack.pop();

    if (current) undoStack.push(current);
    applySnapshot(next);
  }

  function createControls() {
    if (document.getElementById('undoRedoControls')) return;

    var toolbar = document.querySelector('.toolbar');
    if (!toolbar) return;

    var controls = document.createElement('div');
    controls.id = 'undoRedoControls';
    controls.className = 'undo-redo-controls';
    controls.innerHTML = [
      '<button id="undoBtn" type="button" class="mini-history-btn" title="Indietro - Ctrl+Z" aria-label="Indietro ultima modifica">↶</button>',
      '<button id="redoBtn" type="button" class="mini-history-btn" title="Avanti - Ctrl+Y / Ctrl+Shift+Z" aria-label="Avanti modifica annullata">↷</button>'
    ].join('');

    toolbar.insertBefore(controls, toolbar.firstChild);

    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    setButtonsState();
  }

  function hookSaveFunctions() {
    if (typeof saveStaff === 'function' && !saveStaff.__undoRedoHooked) {
      var originalSaveStaff = saveStaff;
      saveStaff = function () {
        var result = originalSaveStaff.apply(this, arguments);
        pushUndoSnapshot();
        return result;
      };
      saveStaff.__undoRedoHooked = true;
    }

    if (typeof saveRequests === 'function' && !saveRequests.__undoRedoHooked) {
      var originalSaveRequests = saveRequests;
      saveRequests = function () {
        var result = originalSaveRequests.apply(this, arguments);
        pushUndoSnapshot();
        return result;
      };
      saveRequests.__undoRedoHooked = true;
    }
  }

  function hookKeyboard() {
    document.addEventListener('keydown', function (event) {
      var isCtrl = event.ctrlKey || event.metaKey;
      if (!isCtrl) return;

      var key = String(event.key || '').toLowerCase();
      var isUndo = key === 'z' && !event.shiftKey;
      var isRedo = key === 'y' || (key === 'z' && event.shiftKey);

      if (!isUndo && !isRedo) return;

      event.preventDefault();
      event.stopPropagation();

      if (isUndo) undo();
      if (isRedo) redo();
    }, true);
  }

  function init() {
    if (!canUseAppState()) return;

    lastSnapshot = snapshotKey(makeSnapshot());
    createControls();
    hookSaveFunctions();
    hookKeyboard();
    setButtonsState();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* Blocca selezione testo nativa Android/Chrome senza bloccare il tap normale. */
(function () {
  var tapCandidate = null;
  var lastBridgeOpenAt = 0;

  function getShiftCell(target) {
    return target && target.closest ? target.closest('#shiftTable .shift-cell') : null;
  }

  function isShiftCellTarget(target) {
    return target && target.closest && target.closest('#shiftTable .shift-cell, #shiftTable .shift-time');
  }

  function clearNativeSelection() {
    try {
      var selection = window.getSelection && window.getSelection();
      if (selection && selection.rangeCount) selection.removeAllRanges();
    } catch (error) {}
  }

  function blockNativeSelection(event) {
    if (!isShiftCellTarget(event.target)) return;
    event.preventDefault();
    clearNativeSelection();
  }

  function openCellEditor(cell) {
    if (!cell || !document.body.contains(cell)) return;
    var personIndex = Number(cell.dataset.person);
    var dayKey = cell.dataset.day;
    if (!Number.isFinite(personIndex) || !dayKey) return;
    if (typeof openShiftMenu !== 'function') return;
    lastBridgeOpenAt = Date.now();
    openShiftMenu(personIndex, dayKey);
  }

  function injectStyle() {
    if (document.getElementById('touchSelectionGuardStyle')) return;
    var style = document.createElement('style');
    style.id = 'touchSelectionGuardStyle';
    style.textContent = '#shiftTable .shift-cell,#shiftTable .shift-cell *,#shiftTable .shift-time{user-select:none!important;-webkit-user-select:none!important;-ms-user-select:none!important;-webkit-touch-callout:none!important;touch-action:manipulation!important}#shiftTable td[data-field="nome"]{user-select:text!important;-webkit-user-select:text!important;-webkit-touch-callout:default!important}';
    document.head.appendChild(style);
  }

  function initSelectionGuard() {
    injectStyle();

    document.addEventListener('selectstart', blockNativeSelection, true);
    document.addEventListener('contextmenu', blockNativeSelection, true);
    document.addEventListener('dragstart', blockNativeSelection, true);

    document.addEventListener('pointerdown', function (event) {
      var cell = getShiftCell(event.target);
      if (!cell) return;
      clearNativeSelection();
      if (event.pointerType === 'mouse') return;
      tapCandidate = {
        cell: cell,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        time: Date.now()
      };
    }, true);

    document.addEventListener('pointermove', function (event) {
      if (!tapCandidate || tapCandidate.pointerId !== event.pointerId) return;
      var dx = Math.abs(event.clientX - tapCandidate.x);
      var dy = Math.abs(event.clientY - tapCandidate.y);
      if (dx > 14 || dy > 14) tapCandidate = null;
    }, true);

    document.addEventListener('pointerup', function (event) {
      if (isShiftCellTarget(event.target)) clearNativeSelection();
      if (!tapCandidate || tapCandidate.pointerId !== event.pointerId) return;

      var candidate = tapCandidate;
      tapCandidate = null;
      var dx = Math.abs(event.clientX - candidate.x);
      var dy = Math.abs(event.clientY - candidate.y);
      var elapsed = Date.now() - candidate.time;

      if (dx > 14 || dy > 14) return;
      if (elapsed > 650) return;

      setTimeout(function () {
        if (Date.now() - lastBridgeOpenAt < 80) return;
        openCellEditor(candidate.cell);
      }, 0);
    }, true);

    document.addEventListener('click', function (event) {
      if (!isShiftCellTarget(event.target)) return;
      clearNativeSelection();
    }, true);

    document.addEventListener('selectionchange', function () {
      try {
        var selection = window.getSelection && window.getSelection();
        if (!selection || !selection.rangeCount) return;
        var node = selection.anchorNode;
        if (node && node.nodeType === 3) node = node.parentElement;
        if (node && node.closest && node.closest('#shiftTable .shift-cell')) clearNativeSelection();
      } catch (error) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSelectionGuard);
  } else {
    initSelectionGuard();
  }
})();
