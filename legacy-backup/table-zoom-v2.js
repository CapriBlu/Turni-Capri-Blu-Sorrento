(() => {
  const min = 0.82;
  const max = 1.18;
  const step = 0.06;
  const key = "capriBluTableZoomV2";

  const card = document.querySelector(".table-card");
  const minus = document.getElementById("zoomOutBtn");
  const plus = document.getElementById("zoomInBtn");
  const reset = document.getElementById("zoomResetBtn");
  const label = document.getElementById("zoomValue");

  if (!card || !minus || !plus || !reset || !label) return;

  let zoom = Number(localStorage.getItem(key));
  if (!Number.isFinite(zoom)) zoom = 1;
  zoom = Math.min(max, Math.max(min, zoom));

  function px(name, value) {
    card.style.setProperty(name, Math.round(value) + "px");
  }

  function rem(name, value) {
    card.style.setProperty(name, value.toFixed(3) + "rem");
  }

  function apply() {
    zoom = Math.round(zoom * 100) / 100;
    card.style.setProperty("--table-zoom", zoom.toFixed(2));
    px("--zoom-table-width", 740 * zoom);
    px("--zoom-name-width", 92 * zoom);
    px("--zoom-cell-width", 72 * zoom);
    rem("--zoom-th-font", 0.66 * zoom);
    rem("--zoom-th-small-font", 0.52 * zoom);
    rem("--zoom-name-font", 0.73 * zoom);
    rem("--zoom-time-font", 0.72 * zoom);
    label.textContent = Math.round(zoom * 100) + "%";
    minus.disabled = zoom <= min + 0.001;
    plus.disabled = zoom >= max - 0.001;
    localStorage.setItem(key, zoom.toFixed(2));
  }

  minus.addEventListener("click", () => {
    zoom = Math.max(min, zoom - step);
    apply();
  });

  plus.addEventListener("click", () => {
    zoom = Math.min(max, zoom + step);
    apply();
  });

  reset.addEventListener("click", () => {
    zoom = 1;
    apply();
  });

  apply();
})();
