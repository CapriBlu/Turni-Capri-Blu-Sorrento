window.addEventListener('DOMContentLoaded', function () {
  var panel = document.querySelector('#topToolsMenuPanel');
  var week = document.querySelector('.week-box');
  var sync = document.querySelector('.top-sync-actions');

  if (!panel) return;
  if (document.querySelector('#menuControlGroup')) return;
  if (!week && !sync) return;

  var group = document.createElement('div');
  group.id = 'menuControlGroup';
  group.className = 'menu-control-group';

  var title = document.createElement('div');
  title.className = 'menu-control-title';
  title.textContent = 'Settimana e GitHub';
  group.appendChild(title);

  if (week) group.appendChild(week);
  if (sync) group.appendChild(sync);

  panel.insertBefore(group, panel.firstChild);
});
