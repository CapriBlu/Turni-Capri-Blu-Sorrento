window.addEventListener('DOMContentLoaded', function () {
  var min = 0.80;
  var max = 1.20;
  var step = 0.10;
  var key = 'capriBluTableZoomV3';

  var table = document.querySelector('#shiftTable');
  var scroll = document.querySelector('.table-scroll');
  var minus = document.querySelector('#zoomOutBtn');
  var plus = document.querySelector('#zoomInBtn');
  var reset = document.querySelector('#zoomResetBtn');
  var label = document.querySelector('#zoomValue');

  if (!table || !scroll || !minus || !plus || !reset || !label) return;

  var zoom = parseFloat(localStorage.getItem(key));
  if (!isFinite(zoom)) zoom = 1;

  function clamp(value) {
    return Math.max(min, Math.min(max, value));
  }

  function apply() {
    zoom = clamp(Math.round(zoom * 100) / 100);
    table.style.zoom = zoom;
    table.style.transformOrigin = 'top left';
    table.style.webkitTransformOrigin = 'top left';
    table.style.setProperty('--table-zoom', zoom);
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
    zoom = 1;
    apply();
  };

  apply();
});
