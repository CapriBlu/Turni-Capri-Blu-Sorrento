function createTimeOptions(selectedValue = "") {
  const normalizedSelected = normalizeTimeValue(selectedValue);
  let options = `<option value="">Scegli ora</option>`;

  for (let hour = 8; hour <= 24; hour += 1) {
    for (let minute of [0, 15, 30, 45]) {
      if (hour === 24 && minute > 0) continue;

      const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const selected = value === normalizedSelected ? " selected" : "";
      options += `<option value="${value}"${selected}>${value}</option>`;
    }
  }

  return options;
}

function normalizeTimeValue(value) {
  const match = String(value || "").match(/(\d{1,2}):(\d{2})/);
  if (!match) return "";
  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
}

function replaceInputWithTimeSelect(id) {
  const element = document.getElementById(id);
  if (!element || element.tagName === "SELECT") return;

  const select = document.createElement("select");
  select.id = id;
  select.className = element.className;
  select.setAttribute("aria-label", element.getAttribute("aria-label") || "Seleziona orario");
  select.innerHTML = createTimeOptions(element.value);

  element.replaceWith(select);
}

function refreshTimeSelectOptions(id) {
  const select = document.getElementById(id);
  if (!select || select.tagName !== "SELECT") return;

  const currentValue = select.value;
  select.innerHTML = createTimeOptions(currentValue);
}

function convertTurnInputsToTimeMenus() {
  ["pranzoTime", "seraTime"].forEach((id) => {
    replaceInputWithTimeSelect(id);
    refreshTimeSelectOptions(id);
  });
}

const timePickerObserver = new MutationObserver(() => {
  convertTurnInputsToTimeMenus();
});

timePickerObserver.observe(document.body, {
  childList: true,
  subtree: true
});

convertTurnInputsToTimeMenus();
