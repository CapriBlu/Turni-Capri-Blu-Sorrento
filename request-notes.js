function prepareRequestBadges() {
  document.querySelectorAll(".request-badge").forEach((badge) => {
    const originalType = badge.dataset.originalType || badge.textContent.trim() || "Richiesta";
    const note = badge.dataset.note || badge.getAttribute("title") || "Nessuna nota";

    badge.dataset.originalType = originalType;
    badge.dataset.note = note;
    badge.textContent = "Richiesta";
    badge.title = note;
    badge.setAttribute("aria-label", `Richiesta: ${note}`);
  });
}

const badgeObserver = new MutationObserver(() => {
  prepareRequestBadges();
});

badgeObserver.observe(document.body, {
  childList: true,
  subtree: true
});

prepareRequestBadges();
