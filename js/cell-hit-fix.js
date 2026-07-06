window.addEventListener('DOMContentLoaded', function () {
  var body = document.getElementById('scheduleBody');
  if (!body) return;

  function rowIndexFromCell(cell) {
    var row = cell && cell.closest ? cell.closest('tr') : null;
    if (!row || !row.parentElement) return -1;
    return Array.prototype.indexOf.call(row.parentElement.children, row);
  }

  body.addEventListener('click', function (event) {
    var requestBadge = event.target.closest && event.target.closest('.request-badge');
    if (requestBadge) return;

    var cell = event.target.closest && event.target.closest('.shift-cell');
    if (!cell) return;

    var personIndex = rowIndexFromCell(cell);
    var dayKey = cell.dataset.day;

    if (personIndex < 0 || !dayKey || typeof openShiftMenu !== 'function') return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    openShiftMenu(personIndex, dayKey);
  }, true);

  body.addEventListener('input', function (event) {
    var target = event.target;
    if (!target || target.dataset.field !== 'nome') return;

    var personIndex = rowIndexFromCell(target);
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
});