window.addEventListener('DOMContentLoaded', function () {
  var monthsPanel = document.querySelector('#monthlyArchiveMonths');
  if (!monthsPanel) return;

  var currentMonth = monthsPanel.querySelector('.current-archive-month');
  if (currentMonth) {
    monthsPanel.insertBefore(currentMonth, monthsPanel.firstChild);
  }

  var weeksPanel = document.querySelector('#weeklyArchiveWeeks');
  if (!weeksPanel) return;

  var currentWeek = weeksPanel.querySelector('.current-archive-week');
  if (currentWeek) {
    weeksPanel.insertBefore(currentWeek, weeksPanel.firstChild);
  }
});
