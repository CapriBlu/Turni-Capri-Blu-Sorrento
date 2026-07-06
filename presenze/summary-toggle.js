const summaryToggleKey = 'capriBluPresenzeRiepilogoChiusoV1';
const summaryColumnCount = 7;

function markSummaryColumns() {
  const rows = document.querySelectorAll('#presenceTable tr');
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    cells.forEach((cell) => cell.classList.remove('summary-column'));
    if (row.classList.contains('section-row')) return;
    if (cells.length <= summaryColumnCount) return;
    cells.slice(-summaryColumnCount).forEach((cell) => cell.classList.add('summary-column'));
  });
}

function getSummaryBar() {
  return document.querySelector('.presenze-top-left-controls') || document.querySelector('.top-card') || document.querySelector('.toolbar');
}

function applySummaryState() {
  markSummaryColumns();
  const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
  document.body.classList.toggle('summary-collapsed', collapsed);
  const btn = document.getElementById('summaryToggleBtn');
  if (btn) {
    btn.textContent = collapsed ? 'Mostra riepilogo' : 'Nascondi riepilogo';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

function toggleSummary(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
  localStorage.setItem(summaryToggleKey, collapsed ? 'false' : 'true');
  applySummaryState();
}

function placeSummaryButton() {
  const bar = getSummaryBar();
  if (!bar) return false;

  let btn = document.getElementById('summaryToggleBtn');
  if (!btn) {
    btn = document.createElement('button');
    btn.id = 'summaryToggleBtn';
    btn.type = 'button';
    btn.className = 'summary-toggle-btn';
    btn.setAttribute('aria-expanded', 'true');
    btn.addEventListener('click', toggleSummary);
  }

  if (btn.parentElement !== bar) bar.appendChild(btn);
  applySummaryState();
  return true;
}

function setupSummaryToggle() {
  placeSummaryButton();
  setTimeout(placeSummaryButton, 50);
  setTimeout(placeSummaryButton, 250);
}

setupSummaryToggle();

const presenceTable = document.getElementById('presenceTable');
if (presenceTable) {
  const observer = new MutationObserver(applySummaryState);
  observer.observe(presenceTable, { childList: true, subtree: true });
}
