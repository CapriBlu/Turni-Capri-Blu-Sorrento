/*
  Capri Blu Turni - Undo/Redo menu placement
  Pulizia profonda step 4:
  tiene i controlli Indietro/Avanti dentro il menu compatto,
  evitando pulsanti isolati o fuori posizione su mobile.
*/

(function () {
  function moveUndoRedoControls() {
    const panel = document.getElementById("topToolsMenuPanel");
    const controls = document.getElementById("undoRedoControls");

    if (!panel || !controls || panel.contains(controls)) return;

    controls.classList.add("undo-redo-controls-in-menu");
    panel.insertBefore(controls, panel.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", moveUndoRedoControls);
  } else {
    moveUndoRedoControls();
  }

  window.addEventListener("load", moveUndoRedoControls);
})();
