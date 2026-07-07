const sendMonthlyBtn = document.getElementById("sendMonthlyBtn");

function publishWeekToMonthly() {
  const weekInput = document.getElementById("weekInput");
  if (!weekInput || !weekInput.value) return;

  const weekValue = weekInput.value;
  const sourceKey = "capriBluTurniStaffWeekV1-" + weekValue;
  const publishedKey = "capriBluTurniStaffPublishedWeekV1-" + weekValue;
  const kitchenSourceKey = "capriBluTurniCucinaWeekV1-" + weekValue;
  const kitchenPublishedKey = "capriBluTurniCucinaPublishedWeekV1-" + weekValue;
  const currentData = localStorage.getItem(sourceKey) || localStorage.getItem("capriBluTurniStaffV5");
  const kitchenData = localStorage.getItem(kitchenSourceKey);

  if (!currentData && !kitchenData) {
    alert("Non ci sono turni da inviare per questa settimana.");
    return;
  }

  if (currentData) {
    localStorage.setItem(publishedKey, currentData);
  }

  if (kitchenData) {
    localStorage.setItem(kitchenPublishedKey, kitchenData);
  }

  localStorage.setItem("capriBluUltimaSettimanaInviata", weekValue);
  alert("Turni inviati al mensile per la settimana " + weekValue + ".");
}

if (sendMonthlyBtn) {
  sendMonthlyBtn.addEventListener("click", publishWeekToMonthly);
}
