const summaryToggleKey = 'capriBluPresenzeRiepilogoChiusoV1';

function applySummaryState() {
  const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
  document.body.classList.toggle('summary-collapsed', collapsed);
  const btn = document.getElementById('summaryToggleBtn');
  if (btn) {
    btn.textContent = collapsed ? 'Mostra riepilogo' : 'Nascondi riepilogo';
    btn.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
  }
}

function setupSummaryToggle() {
  const toolbar = document.querySelector('.toolbar');
  const resetBtn = document.getElementById('resetBtn');
  if (!toolbar || document.getElementById('summaryToggleBtn')) return;

  const btn = document.createElement('button');
  btn.id = 'summaryToggleBtn';
  btn.type = 'button';
  btn.className = 'summary-toggle-btn';
  btn.setAttribute('aria-expanded', 'true');
  btn.addEventListener('click', () => {
    const collapsed = localStorage.getItem(summaryToggleKey) === 'true';
    localStorage.setItem(summaryToggleKey, collapsed ? 'false' : 'true');
    applySummaryState();
  });

  toolbar.insertBefore(btn, resetBtn || null);
  applySummaryState();
}

setupSummaryToggle();
