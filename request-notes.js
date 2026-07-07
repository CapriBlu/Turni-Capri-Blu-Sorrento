/*
  Capri Blu Turni - Request notes only
  Pulizia profonda step 1:
  - rimossa selezione multipla celle
  - rimosso copia/incolla turni
  - rimosso trascinamento celle
  - rimosso menu tasto destro personalizzato

  Questo file ora gestisce solo eventuali badge/nota richiesta,
  lasciando il click normale della cella a script.js / shift-buttons.js.
*/

function prepareRequestBadges() {
  document.querySelectorAll(".request-badge").forEach((badge) => {
    if (badge.dataset.prepared === "true") return;

    const originalType = badge.textContent.trim() || "Richiesta";
    const note = badge.dataset.note || badge.getAttribute("title") || "Nessuna nota";

    badge.dataset.originalType = originalType;
    badge.dataset.note = note;
    badge.textContent = "Richiesta";
    badge.title = note;
    badge.dataset.prepared = "true";
    badge.setAttribute("aria-label", "Richiesta: " + note);
  });
}

document.addEventListener("click", (event) => {
  const badge = event.target.closest(".request-badge");
  if (!badge) return;

  prepareRequestBadges();

  if (typeof openNotePopup === "function") {
    event.preventDefault();
    event.stopPropagation();
    openNotePopup(badge.dataset.note || badge.getAttribute("title") || "Nessuna nota");
  }
});

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", prepareRequestBadges);
} else {
  prepareRequestBadges();
}
