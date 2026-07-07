/*
  Capri Blu Turni - Kitchen save hooks
  Mantiene Pizzeria/Cucina allineate con autosave e stato salvataggio ufficiale.
*/

(function () {
  function hookKitchenSave() {
    if (typeof saveKitchenData !== "function" || saveKitchenData.__kitchenSaveHooksReady) return;

    const originalSaveKitchenData = saveKitchenData;

    saveKitchenData = function hookedSaveKitchenData() {
      const result = originalSaveKitchenData.apply(this, arguments);

      if (typeof autoSaveSession === "function") {
        autoSaveSession();
      }

      if (typeof markLocalChangesAfterOfficial === "function") {
        markLocalChangesAfterOfficial();
      }

      return result;
    };

    saveKitchenData.__kitchenSaveHooksReady = true;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hookKitchenSave);
  } else {
    hookKitchenSave();
  }
})();
