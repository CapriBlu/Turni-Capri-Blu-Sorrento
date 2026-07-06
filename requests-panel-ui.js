/*
  Capri Blu Turni - Requests panel UI
  --------------------------------------------------
  Sposta la card richieste in una finestra modale apribile dal menu strumenti.
*/

(function () {
  function setupRequestPanel() {
    const requestCard = document.querySelector(".requests-card");
    const toolbar = document.querySelector(".toolbar");

    if (!requestCard || !toolbar || document.getElementById("openRequestsPanelBtn")) return;

    const openButton = document.createElement("button");
    openButton.id = "openRequestsPanelBtn";
    openButton.type = "button";
    openButton.className = "requests-toolbar-btn";
    openButton.textContent = "Richieste";

    const monthlyLink = toolbar.querySelector(".monthly-link");
    if (monthlyLink && monthlyLink.nextSibling) {
      toolbar.insertBefore(openButton, monthlyLink.nextSibling);
    } else {
      toolbar.insertBefore(openButton, toolbar.firstChild);
    }

    const backdrop = document.createElement("div");
    backdrop.id = "requestsPanelBackdrop";
    backdrop.className = "requests-panel-backdrop";

    const panel = document.createElement("div");
    panel.className = "requests-panel-modal";
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "requestsPanelTitle");

    const closeButton = document.createElement("button");
    closeButton.id = "closeRequestsPanelBtn";
    closeButton.type = "button";
    closeButton.className = "requests-panel-close";
    closeButton.textContent = "×";
    closeButton.setAttribute("aria-label", "Chiudi richieste");

    const title = requestCard.querySelector("h2");
    if (title) title.id = "requestsPanelTitle";

    requestCard.classList.add("requests-card-modalized");
    panel.appendChild(closeButton);
    panel.appendChild(requestCard);
    backdrop.appendChild(panel);
    document.body.appendChild(backdrop);

    function openPanel() {
      backdrop.classList.add("open");
      document.body.classList.add("requests-panel-open");
    }

    function closePanel() {
      backdrop.classList.remove("open");
      document.body.classList.remove("requests-panel-open");
    }

    openButton.addEventListener("click", openPanel);
    closeButton.addEventListener("click", closePanel);

    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) closePanel();
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && backdrop.classList.contains("open")) closePanel();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setupRequestPanel);
  } else {
    setupRequestPanel();
  }
})();
