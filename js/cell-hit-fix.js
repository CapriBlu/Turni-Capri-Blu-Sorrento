window.addEventListener('DOMContentLoaded', function () {
  var body = document.getElementById('scheduleBody');
  if (!body) return;

  var selectedCell = null;
  var copiedShift = null;

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

    return {
      personIndex: personIndex,
      personName: staff[personIndex].nome,
      dayKey: dayKey
    };
  }

  function markSelected(cell) {
    body.querySelectorAll('.shift-cell.is-selected').forEach(function (item) {
      item.classList.remove('is-selected');
    });

    if (!cell) return;
    cell.classList.add('is-selected');
    selectedCell = readCellInfo(cell);
  }

  function resolveSelectedCellInfo() {
    if (!selectedCell || typeof staff === 'undefined') return null;

    if (selectedCell.personName) {
      var byName = staff.findIndex(function (person) {
        return person.nome === selectedCell.personName;
      });

      if (byName >= 0) {
        return {
          personIndex: byName,
          personName: staff[byName].nome,
          dayKey: selectedCell.dayKey
        };
      }
    }

    if (Number.isInteger(selectedCell.personIndex) && staff[selectedCell.personIndex]) {
      return selectedCell;
    }

    return null;
  }

  function cloneShift(shift) {
    return {
      pranzo: shift && shift.pranzo ? shift.pranzo : 'Riposo',
      sera: shift && shift.sera ? shift.sera : 'Riposo'
    };
  }

  function showStatus(text) {
    var status = document.getElementById('autosaveStatus');
    if (!status) return;

    var oldText = status.textContent;
    status.textContent = text;

    window.clearTimeout(showStatus._timer);
    showStatus._timer = window.setTimeout(function () {
      status.textContent = oldText || 'Autosalvataggio attivo';
    }, 1400);
  }

  function copySelectedShift() {
    var info = resolveSelectedCellInfo();
    if (!info) return false;

    var person = staff[info.personIndex];
    var shift = person && person.turni ? person.turni[info.dayKey] : null;
    if (!shift) return false;

    copiedShift = cloneShift(shift);
    showStatus('Turno copiato');

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText([copiedShift.pranzo, copiedShift.sera].join(' / ')).catch(function () {});
    }

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
    }, 0);

    return true;
  }

  body.addEventListener('click', function (event) {
    var requestBadge = event.target.closest && event.target.closest('.request-badge');
    if (requestBadge) return;

    var cell = getShiftButtonFromEvent(event);
    if (!cell) return;

    markSelected(cell);

    var info = readCellInfo(cell);
    if (!info || typeof openShiftMenu !== 'function') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openShiftMenu(info.personIndex, info.dayKey);
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

    if (key === 'c') {
      if (copySelectedShift()) {
        event.preventDefault();
        event.stopPropagation();
      }
      return;
    }

    if (key === 'v') {
      if (pasteCopiedShift()) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
  }, true);
});
