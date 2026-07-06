const summaryToggleKey = 'capriBluPresenzeRiepilogoApertoV3';
const summaryLabels = ['P', 'F', 'Fer', 'MAL', 'Ass', 'Rit', 'Min'];

function countRow(row) {
  const result = { p: 0, f: 0, fer: 0, mal: 0, ass: 0, rit: 0, min: 0 };
  row.querySelectorAll('.presence-cell').forEach((cell) => {
    const value = cell.dataset.value || cell.textContent.trim();
    const minutes = Number(cell.dataset.minutes || 0);
    if (value === 'P') result.p += 1;
    if (value === 'F') result.f += 1;
    if (value === 'Fer') result.fer += 1;
    if (value === 'MAL') result.mal += 1;
    if (value === 'Ass') result.ass += 1;
    if (value === 'P+Rit') { result.p += 1; result.rit += 1; result.min += minutes; }
  });
  return result;
}

function collectSummaryRows() {
  const rows = [];
  let section = '';
  document.querySelectorAll('#presenceTable tbody tr').forEach((row) => {
    if (row.classList.contains('section-row')) {
      section = row.textContent.replace(/\s+persone\s*$/i, '').trim();
      return;
    }
    const name = row.cells?.[0]?.textContent?.trim();
    if (!name) return;
    rows.push({ section, name, totals: countRow(row) });
  });
  return rows;
}

function ensureSummaryPanel() {
  if (document.getElementById('summaryPanelBackdrop')) return;
  const backdrop = document.createElement('div');
  backdrop.id = 'summaryPanelBackdrop';
  backdrop.className = 'summary-panel-backdrop';
  backdrop.innerHTML = `
    <div class="summary-panel" role="dialog" aria-modal="true" aria-labelledby="summaryPanelTitle">
      <div class="summary-panel-head">
        <div>
          <p>Riepilogo mensile</p>
          <h2 id="summaryPanelTitle">Totali staff</h2>
        </div>
        <button id="summaryPanelClose" type="button">Chiudi</button>
      </div>
      <div class="summary-panel-scroll">
        <table class="summary-panel-table">
          <thead><tr><th>Reparto</th><th>Staff</th>${summaryLabels.map((label) => `<th>${label}</th>`).join('')}</tr></thead>
          <tbody id="summaryPanelBody"></tbody>
        </table>
      </div>
    </div>
  `;
  document.body.appendChild(backdrop);
  backdrop.addEventListener('click', (event) => { if (event.target === backdrop) closeSummaryPanel(); });
  document.getElementById('summaryPanelClose').addEventListener('click', closeSummaryPanel);
}

function renderSummaryPanel() {
  ensureSummaryPanel();
  const body = document.getElementById('summaryPanelBody');
  const rows = collectSummaryRows();
  body.innerHTML = rows.map(({ section, name, totals }) => `
    <tr><td>${section}</td><td>${name}</td><td>${totals.p}</td><td>${totals.f}</td><td>${totals.fer}</td><td>${totals.mal}</td><td>${totals.ass}</td><td>${totals.rit}</td><td>${totals.min}</td></tr>
  `).join('');
}

function openSummaryPanel(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  renderSummaryPanel();
  document.getElementById('summaryPanelBackdrop').classList.add('open');
  localStorage.setItem(summaryToggleKey, 'true');
}

function closeSummaryPanel() {
  document.getElementById('summaryPanelBackdrop')?.classList.remove('open');
  localStorage.setItem(summaryToggleKey, 'false');
}

function placeSummaryButton() {
  const panel = document.getElementById('presenzeTopMenuPanel');
  const toolbar = document.querySelector('.toolbar');
  const target = panel || toolbar;
  if (!target) return false;

  let btn = document.getElementById('summaryToggleBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'summaryToggleBtn';
    btn.type = 'button';
    btn.className = 'summary-toggle-btn';
    btn.textContent = 'Riepilogo';
    btn.addEventListener('click', openSummaryPanel);
  }

  if (btn.parentElement !== target) target.appendChild(btn);
  return true;
}

function setupSummaryToggle() {
  placeSummaryButton();
  setTimeout(placeSummaryButton, 80);
  setTimeout(placeSummaryButton, 300);
}

setupSummaryToggle();

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') closeSummaryPanel();
});
