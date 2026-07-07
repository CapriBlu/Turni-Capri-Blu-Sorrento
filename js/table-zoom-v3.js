window.addEventListener('DOMContentLoaded', function () {
  var min = 0.70;
  var max = 1.20;
  var step = 0.10;
  var key = 'capriBluTableZoomV3';

  var table = document.querySelector('#shiftTable');
  var card = document.querySelector('.table-card');
  var minus = document.querySelector('#zoomOutBtn');
  var plus = document.querySelector('#zoomInBtn');
  var reset = document.querySelector('#zoomResetBtn');
  var label = document.querySelector('#zoomValue');

  if (!table || !card || !minus || !plus || !reset || !label) return;

  var base = {
    tableWidth: 740,
    nameWidth: 92,
    cellWidth: 72,
    thFont: 0.66,
    thSmallFont: 0.52,
    nameFont: 0.73,
    timeFont: 0.72
  };

  var zoom = parseFloat(localStorage.getItem(key));
  if (!isFinite(zoom)) zoom = 0.90;

  function clamp(value) {
    return Math.max(min, Math.min(max, value));
  }

  function px(value) {
    return Math.round(value) + 'px';
  }

  function rem(value) {
    return (Math.round(value * 100) / 100) + 'rem';
  }

  function apply() {
    zoom = clamp(Math.round(zoom * 100) / 100);

    table.style.zoom = '';
    table.style.transform = '';
    table.style.webkitTransform = '';
    table.style.transformOrigin = '';
    table.style.webkitTransformOrigin = '';

    card.style.setProperty('--table-zoom', String(zoom));
    card.style.setProperty('--zoom-table-width', px(base.tableWidth * zoom));
    card.style.setProperty('--zoom-name-width', px(base.nameWidth * zoom));
    card.style.setProperty('--zoom-cell-width', px(base.cellWidth * zoom));
    card.style.setProperty('--zoom-th-font', rem(base.thFont * zoom));
    card.style.setProperty('--zoom-th-small-font', rem(base.thSmallFont * zoom));
    card.style.setProperty('--zoom-name-font', rem(base.nameFont * zoom));
    card.style.setProperty('--zoom-time-font', rem(base.timeFont * zoom));

    label.textContent = Math.round(zoom * 100) + '%';
    minus.disabled = zoom <= min + 0.001;
    plus.disabled = zoom >= max - 0.001;
    localStorage.setItem(key, String(zoom));
  }

  minus.onclick = function () {
    zoom = clamp(zoom - step);
    apply();
  };

  plus.onclick = function () {
    zoom = clamp(zoom + step);
    apply();
  };

  reset.onclick = function () {
    zoom = 0.90;
    apply();
  };

  apply();
});
