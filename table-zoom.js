(() => {
  const minZoom = 0.82;
  const maxZoom = 1.18;
  const step = 0.06;
  const storageKey = "capriBluTableZoomV1";

  const tableCard = document.querySelector(".table-card");
  const zoomOutBtn = document.getElementById("zoomOutBtn");
  const zoomInBtn = document.getElementById("zoomInBtn");
  const zoomResetBtn = document.getElementById("zoomResetBtn");
  const zoomValue = document.getElementById("zoomValue");

  if (!tableCard || !zoomOutBtn || !zoomInBtn || !zoomResetBtn || !zoomValue) return;

  const readZoom = () => {
    const saved = Number(localStorage.getItem(storageKey));
    if (!Number.isFinite(saved)) return 1;
    return Math.min(maxZoom, Math.max(minZoom, saved));
  };

  let zoom = readZoom();

  const applyZoom = () => {
    tableCard.style.setProperty("--table-zoom", zoom.toFixed(2));
    zoomValue.textContent = `${Math.round(zoom * 100)}%`;
    zoomOutBtn.disabled = zoom <= minZoom + 0.001;
    zoomInBtn.disabled = zoom >= maxZoom - 0.001;
    localStorage.setItem(storageKey, zoom.toFixed(2));
  };

  zoomOutBtn.addEventListener("click", () => {
    zoom = Math.max(minZoom, zoom - step);
    applyZoom();
  });

  zoomInBtn.addEventListener("click", () => {
    zoom = Math.min(maxZoom, zoom + step);
    applyZoom();
  });

  zoomResetBtn.addEventListener("click", () => {
    zoom = 1;
    applyZoom();
  });

  applyZoom();
})();
