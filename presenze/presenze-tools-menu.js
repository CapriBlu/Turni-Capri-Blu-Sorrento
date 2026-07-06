function setupPresenzeToolsMenu() {
  const topCard = document.querySelector('.top-card');
  const toolbar = document.querySelector('.toolbar');
  const legend = document.querySelector('.legend');
  if (!topCard || !toolbar || document.getElementById('presenzeTopMenu')) return;

  const topLeftBar = document.createElement('div');
  topLeftBar.className = 'presenze-top-left-controls';

  const menu = document.createElement('div');
  menu.id = 'presenzeTopMenu';
  menu.className = 'presenze-top-menu';
  menu.innerHTML = `
    <button id="presenzeTopMenuBtn" type="button" class="presenze-top-menu-btn" aria-expanded="false">☰ Menu</button>
    <div id="presenzeTopMenuPanel" class="presenze-top-menu-panel"></div>
  `;

  const legendMenu = document.createElement('div');
  legendMenu.id = 'presenzeLegendMenu';
  legendMenu.className = 'presenze-legend-menu';
  legendMenu.innerHTML = `
    <button id="presenzeLegendMenuBtn" type="button" class="presenze-legend-menu-btn" aria-expanded="false">Legenda ▾</button>
    <div id="presenzeLegendMenuPanel" class="presenze-legend-menu-panel"></div>
  `;

  topLeftBar.appendChild(menu);
  topLeftBar.appendChild(legendMenu);
  topCard.insertBefore(topLeftBar, topCard.firstChild);

  const panel = document.getElementById('presenzeTopMenuPanel');
  const menuBtn = document.getElementById('presenzeTopMenuBtn');
  const legendPanel = document.getElementById('presenzeLegendMenuPanel');
  const legendBtn = document.getElementById('presenzeLegendMenuBtn');

  const statusWrap = document.createElement('div');
  statusWrap.className = 'presenze-top-status-wrap';
  topLeftBar.appendChild(statusWrap);

  Array.from(toolbar.children).forEach((item) => {
    if (item.id === 'autosaveStatus') {
      statusWrap.appendChild(item);
      return;
    }
    panel.appendChild(item);
  });

  if (legend && legendPanel) {
    Array.from(legend.children).forEach((item) => legendPanel.appendChild(item));
    legend.classList.add('presenze-legend-moved');
  }

  function closeMenu() {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }

  function closeLegend() {
    legendMenu.classList.remove('open');
    legendBtn.setAttribute('aria-expanded', 'false');
  }

  menuBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeLegend();
    const isOpen = menu.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  legendBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    closeMenu();
    const isOpen = legendMenu.classList.toggle('open');
    legendBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  panel.addEventListener('click', (event) => {
    const clickable = event.target.closest('a, button');
    if (clickable) closeMenu();
  });

  document.addEventListener('click', (event) => {
    if (!menu.contains(event.target)) closeMenu();
    if (!legendMenu.contains(event.target)) closeLegend();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeMenu();
      closeLegend();
    }
  });

  toolbar.classList.add('presenze-toolbar-hidden');
}

setupPresenzeToolsMenu();
