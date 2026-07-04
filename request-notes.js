function prepareRequestBadges() {
  document.querySelectorAll(".request-badge").forEach((badge) => {
    if (badge.dataset.prepared === "true") return;

    const fullText = badge.textContent.trim();
    const parts = fullText.split(" - ");
    const type = parts[0] || fullText;
    const note = parts.slice(1).join(" - ").trim();

    badge.textContent = type;
    badge.dataset.note = note;
    badge.dataset.prepared = "true";

    if (note) {
      badge.classList.add("has-note");
      badge.title = "Clicca per leggere la nota";
      badge.setAttribute("aria-label", `${type}: clicca per leggere la nota`);
      badge.setAttribute("role", "button");
      badge.setAttribute("tabindex", "0");
    }
  });
}

function showRequestNote(target) {
  const note = target.dataset.note;
  if (!note) return;

  alert(note);
}

document.addEventListener("click", (event) => {
  const badge = event.target.closest(".request-badge.has-note");
  if (!badge) return;

  event.stopPropagation();
  showRequestNote(badge);
});

document.addEventListener("keydown", (event) => {
  const badge = event.target.closest(".request-badge.has-note");
  if (!badge) return;
  if (event.key !== "Enter" && event.key !== " ") return;

  event.preventDefault();
  showRequestNote(badge);
});

const badgeObserver = new MutationObserver(() => {
  prepareRequestBadges();
});

badgeObserver.observe(document.body, {
  childList: true,
  subtree: true
});

prepareRequestBadges();
