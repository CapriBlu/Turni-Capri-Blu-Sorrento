const sendMonthlyBtn = document.getElementById("sendMonthlyBtn");

function publishWeekToMonthly() {
  const weekInput = document.getElementById("weekInput");
  if (!weekInput || !weekInput.value) return;

  const weekValue = weekInput.value;
  const sourceKey = "capriBluTurniStaffWeekV1-" + weekValue;
  const publishedKey = "capriBluTurniStaffPublishedWeekV1-" + weekValue;
  const currentData = localStorage.getItem(sourceKey) || localStorage.getItem("capriBluTurniStaffV5");

  if (!currentData) {
    alert("Non ci sono turni da inviare per questa settimana.");
    return;
  }

  localStorage.setItem(publishedKey, currentData);
  localStorage.setItem("capriBluUltimaSettimanaInviata", weekValue);
  alert("Turni inviati al mensile per la settimana " + weekValue + ".");
}

if (sendMonthlyBtn) {
  sendMonthlyBtn.addEventListener("click", publishWeekToMonthly);
}
