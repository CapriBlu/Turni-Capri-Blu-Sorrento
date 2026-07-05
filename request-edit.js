const editableRequestTypes = ["Ferie", "Riposo", "Permesso", "Altro"];

function normalizeRequestTypeName(type) {
  return type === "Festa" ? "Riposo" : type;
}

function normalizeStoredRequests() {
  let changed = false;

  requests.forEach((request) => {
    const normalized = normalizeRequestTypeName(request.type);
    if (request.type !== normalized) {
      request.type = normalized;
      changed = true;
    }
  });

  if (changed) {
    saveRequests();
    renderRequests();
    renderTable();
  }
}

function nextRequestType(currentType) {
  const normalized = normalizeRequestTypeName(currentType);
  const currentIndex = editableRequestTypes.indexOf(normalized);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % editableRequestTypes.length;
  return editableRequestTypes[nextIndex];
}

requestsBody.addEventListener("click", (event) => {
  const typeBadge = event.target.closest(".request-pill");
  if (!typeBadge) return;

  const row = typeBadge.closest("tr");
  if (!row) return;

  const deleteButton = row.querySelector(".delete-request");
  if (!deleteButton) return;

  const index = Number(deleteButton.dataset.index);
  if (Number.isNaN(index) || !requests[index]) return;

  requests[index].type = nextRequestType(requests[index].type);
  saveRequests();
  renderRequests();
  renderTable();
});

normalizeStoredRequests();
