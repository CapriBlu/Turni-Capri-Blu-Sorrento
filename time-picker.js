function convertTurnInputsToTimePicker() {
  ["pranzoTime", "seraTime"].forEach((id) => {
    const input = document.getElementById(id);
    if (!input) return;

    input.type = "time";
    input.step = "900";
    input.placeholder = "--:--";
    input.inputMode = "numeric";

    const currentValue = input.value || "";
    const match = currentValue.match(/(\d{1,2}):(\d{2})/);
    if (match) {
      input.value = `${String(match[1]).padStart(2, "0")}:${match[2]}`;
    }
  });
}

const timePickerObserver = new MutationObserver(() => {
  convertTurnInputsToTimePicker();
});

timePickerObserver.observe(document.body, {
  childList: true,
  subtree: true
});

convertTurnInputsToTimePicker();
