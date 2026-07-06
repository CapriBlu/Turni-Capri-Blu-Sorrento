function setupTopToolsMenu() {
  const topCard = document.querySelector('.top-card');
  const toolbar = document.querySelector('.toolbar');
  if (!topCard || !toolbar || document.getElementById('topToolsMenu')) return;

  const menu = document.createElement('div');
  menu.id = 'topToolsMenu';
  menu.className = 'top-tools-menu';
  menu.innerHTML = `
    <button id="topToolsMenuBtn" type="button" class="top-tools-menu-btn" aria-expanded="false">☰ Menu</button>
    <div id="topToolsMenuPanel" class="top-tools-menu-panel" role="menu"></div>
  `;

  topCard.insertBefore(menu, topCard.firstChild);

  const panel = document.getElementById('topToolsMenuPanel');
  const button = document.getElementById('topToolsMenuBtn');

  const statusWrap = document.createElement('div');
  statusWrap.className = 'toolbar-status-wrap';
  toolbar.appendChild(statusWrap);

  Array.from(toolbar.children).forEach((item) => {
    if (item === statusWrap) return;

    if (item.id === 'saveSourceStatus' || item.id === 'autosaveStatus') {
      statusWrap.appendChild(item);
      return;
    }

    panel.appendChild(item);
  });

  function closeMenu() {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
  }

  function toggleMenu(event) {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  button.addEventListener('click', toggleMenu);

  panel.addEventListener('click', (event) => {
    const clickable = event.target.closest('a, button');
    if (clickable && clickable.id !== 'uploadSessionBtn') closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });

  toolbar.classList.add('toolbar-compact-status');
}

setupTopToolsMenu();
