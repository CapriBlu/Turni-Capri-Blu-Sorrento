/*
  Capri Blu Turni - Weekly switch fix
  Evita che il cambio settimana copi i turni della settimana corrente dentro la nuova.
*/
(function () {
  var weekInput = document.getElementById('weekInput');
  if (!weekInput) return;

  var WEEK_STORAGE_PREFIX = 'capriBluTurniStaffWeekV1-';
  var LEGACY_STORAGE_KEY = 'capriBluTurniStaffV5';
  var WEEK_KEY = 'capriBluTurniSettimanaV2';
  var activeWeekValue = weekInput.value;

  function saveWeekSnapshot(weekValue) {
    if (!weekValue || typeof staff === 'undefined') return;

    try {
      var data = typeof normalizeStaff === 'function' ? normalizeStaff(staff) : staff;
      localStorage.setItem(WEEK_STORAGE_PREFIX + weekValue, JSON.stringify(data));
      localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));

      if (typeof syncStaffNames === 'function') {
        syncStaffNames();
      }
    } catch (error) {
      console.warn('Salvataggio settimana non riuscito:', error);
    }
  }

  function refreshCurrentWeek() {
    if (typeof loadStaff === 'function') {
      staff = loadStaff();
    }

    if (typeof updateWeekHeader === 'function') updateWeekHeader();
    if (typeof populateRequestNames === 'function') populateRequestNames();
    if (typeof renderRequests === 'function') renderRequests();
    if (typeof renderTable === 'function') renderTable();
  }

  weekInput.addEventListener('input', function (event) {
    var nextWeekValue = weekInput.value;
    if (!nextWeekValue || nextWeekValue === activeWeekValue) return;

    // Blocca il vecchio listener di script.js, che salva usando già il nuovo valore.
    event.stopImmediatePropagation();

    saveWeekSnapshot(activeWeekValue);
    localStorage.setItem(WEEK_KEY, nextWeekValue);
    activeWeekValue = nextWeekValue;
    refreshCurrentWeek();
  }, true);
})();
