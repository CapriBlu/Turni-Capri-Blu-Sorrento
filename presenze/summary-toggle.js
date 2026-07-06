const summaryToggleKey = 'capriBluPresenzeRiepilogoChiusoV1';
const summaryColumnCount = 7;

function markSummaryColumns() {
  const rows = document.querySelectorAll('#presenceTable tr');
  rows.forEach((row) => {
    const cells = Array.from(row.children);
    if (cells.length <= summaryColumnCount) return;
    cells.forEach((cell) => cell.classList.remove('summary-column'));
    cells.slice(-summaryColumnCount).forEach((cell) => cell.classList.add('summary-column'));
  });
}

function applySummaryState() {
  markSummaryColumns();
  const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
  document.body.classList.toggle('summary-collapsed', collapsed);
  document.querySelectorAll('#summaryToggleBtn, #summaryFloatingToggleBtn').forEach((btn) => {
    btn.textContent = collapsed ? 'Mostra riepilogo' : 'Nascondi riepilogo';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  });
}

function toggleSummary() {
  const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
  localStorage.setItem(summaryToggleKey, collapsed ? 'false' : 'true');
  applySummaryState();
}

function setupSummaryToggle() {
  const toolbar = document.querySelector('.toolbar');
  const resetBtn = document.getElementById('resetBtn');

  if (toolbar && !document.getElementById('summaryToggleBtn')) {
    const btn = document.createElement('button');
    btn.id = 'summaryToggleBtn';
    btn.type = 'button';
    btn.className = 'summary-toggle-btn';
    btn.setAttribute('aria-expanded', 'true');
    btn.addEventListener('click', toggleSummary);
    toolbar.insertBefore(btn, resetBtn || null);
  }

  if (!document.getElementById('summaryFloatingToggleBtn')) {
    const floating = document.createElement('button');
    floating.id = 'summaryFloatingToggleBtn';
    floating.type = 'button';
    floating.className = 'summary-floating-toggle-btn';
    floating.setAttribute('aria-expanded', 'true');
    floating.addEventListener('click', toggleSummary);
    document.body.appendChild(floating);
  }

  applySummaryState();
}

setupSummaryToggle();

const presenceTable = document.getElementById('presenceTable');
if (presenceTable) {
  const observer = new MutationObserver(applySummaryState);
  observer.observe(presenceTable, { childList: true, subtree: true });
}
