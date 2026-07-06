document.addEventListener('click', function (event) {
  const button = event.target.closest('#presenceMenuBackdrop [data-value]');
  if (!button) return;

  event.preventDefault();
  event.stopImmediatePropagation();

  const cell = typeof activeCell !== 'undefined' ? activeCell : null;
  if (!cell) return;

  const value = button.dataset.value || '';
  saveCellValue(cell, value);
  closePresenceMenu();
}, true);
