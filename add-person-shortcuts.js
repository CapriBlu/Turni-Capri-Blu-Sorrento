function injectAddPersonShortcut() {
  const staffHeader = document.querySelector('#shiftTable th:first-child');
  if (!staffHeader || staffHeader.querySelector('#quickAddPersonBtn')) return;

  staffHeader.innerHTML = `
    <span class="staff-header-label">Staff</span>
    <button id="quickAddPersonBtn" class="quick-add-person-btn" type="button" title="Aggiungi persona">+</button>
  `;

  document.getElementById('quickAddPersonBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof addPerson === 'function') addPerson();
  });
}

function setupNameColumnContextMenu() {
  scheduleBody.addEventListener('contextmenu', (event) => {
    const nameCell = event.target.closest('td[data-field="nome"], .kitchen-name-cell');
    if (!nameCell) return;

    event.preventDefault();
    event.stopPropagation();

    if (confirm('Aggiungere una nuova persona?')) {
      if (typeof addPerson === 'function') addPerson();
    }
  });
}

injectAddPersonShortcut();
setupNameColumnContextMenu();
