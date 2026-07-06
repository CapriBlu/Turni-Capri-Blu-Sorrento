function setupTopToolsMenu() {
  const topCard = document.querySelector('.top-card');
  const toolbar = document.querySelector('.toolbar');
  const legend = document.querySelector('.legend');
  if (!topCard || !toolbar || document.getElementById('topToolsMenu')) return;

  const topLeftBar = document.createElement('div');
  topLeftBar.id = 'topLeftControls';
  topLeftBar.className = 'top-left-controls';

  const menu = document.createElement('div');
  menu.id = 'topToolsMenu';
  menu.className = 'top-tools-menu';
  menu.innerHTML = `
    <button id="topToolsMenuBtn" type="button" class="top-tools-menu-btn" aria-expanded="false">☰ Menu</button>
    <div id="topToolsMenuPanel" class="top-tools-menu-panel" role="menu"></div>
  `;

  const legendMenu = document.createElement('div');
  legendMenu.id = 'topLegendMenu';
  legendMenu.className = 'top-legend-menu';
  legendMenu.innerHTML = `
    <button id="topLegendMenuBtn" type="button" class="top-legend-menu-btn" aria-expanded="false">Legenda ▾</button>
    <div id="topLegendMenuPanel" class="top-legend-menu-panel"></div>
  `;

  topLeftBar.appendChild(menu);
  topLeftBar.appendChild(legendMenu);
  topCard.insertBefore(topLeftBar, topCard.firstChild);

  const panel = document.getElementById('topToolsMenuPanel');
  const button = document.getElementById('topToolsMenuBtn');
  const legendPanel = document.getElementById('topLegendMenuPanel');
  const legendButton = document.getElementById('topLegendMenuBtn');

  const statusWrap = document.createElement('div');
  statusWrap.className = 'top-status-wrap';
  topLeftBar.appendChild(statusWrap);

  Array.from(toolbar.children).forEach((item) => {
    if (item.id === 'saveSourceStatus' || item.id === 'autosaveStatus') {
      statusWrap.appendChild(item);
      return;
    }
    panel.appendChild(item);
  });

  const archiveWrap = document.createElement('div');
  archiveWrap.className = 'archive-submenu-wrap';
  archiveWrap.innerHTML = `
    <button id="archiveSubmenuBtn" type="button" class="archive-submenu-btn" aria-expanded="false">Archivio ▸</button>
    <div id="archiveSubmenuPanel" class="archive-submenu-panel">
      <a href="presenze/" class="archive-submenu-link">Archivio mensile</a>
      <button id="weeklyArchiveBtn" type="button" class="archive-submenu-link">Archivio settimanale</button>
    </div>
  `;
  panel.insertBefore(archiveWrap, panel.firstChild);

  const weeklyArchiveBtn = document.getElementById('weeklyArchiveBtn');
  weeklyArchiveBtn?.addEventListener('click', () => {
    alert('Archivio settimanale: prossimo passaggio da strutturare.');
  });

  if (legend && legendPanel) {
    Array.from(legend.children).forEach((item) => legendPanel.appendChild(item));
    legend.classList.add('legend-moved-to-menu');
  }

  function closeToolsMenu() {
    menu.classList.remove('open');
    button.setAttribute('aria-expanded', 'false');
    closeArchiveSubmenu();
  }

  function closeLegendMenu() {
    legendMenu.classList.remove('open');
    legendButton.setAttribute('aria-expanded', 'false');
  }

  function closeArchiveSubmenu() {
    archiveWrap.classList.remove('open');
    document.getElementById('archiveSubmenuBtn')?.setAttribute('aria-expanded', 'false');
  }

  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLegendMenu();
    const isOpen = menu.classList.toggle('open');
    button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  legendButton.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeToolsMenu();
    const isOpen = legendMenu.classList.toggle('open');
    legendButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  archiveWrap.querySelector('#archiveSubmenuBtn')?.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const isOpen = archiveWrap.classList.toggle('open');
    event.currentTarget.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  panel.addEventListener('click', (event) => {
    const archiveClick = event.target.closest('.archive-submenu-wrap');
    if (archiveClick) return;
    const clickable = event.target.closest('a, button');
    if (clickable && clickable.id !== 'uploadSessionBtn') closeToolsMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeToolsMenu();
    if (!legendMenu.contains(event.target)) closeLegendMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeToolsMenu();
      closeLegendMenu();
    }
  });

  toolbar.classList.add('toolbar-compact-status');
}

setupTopToolsMenu();
