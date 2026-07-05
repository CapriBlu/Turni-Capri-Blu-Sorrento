function requestTypeClass(type) {
  const clean = String(type || "").trim().toLowerCase();
  if (clean === "ferie") return "request-ferie";
  if (clean === "festa" || clean === "riposo") return "request-festa";
  return "request-altro";
}

renderTable = function () {
  scheduleBody.innerHTML = "";

  staff.forEach((person, personIndex) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td contenteditable="true" data-person="${personIndex}" data-field="nome">${person.nome}</td>
    `;

    days.forEach((day, dayIndex) => {
      const shift = person.turni[day.key] || { pranzo: "Riposo", sera: "Riposo" };
      const td = document.createElement("td");
      const hasPranzo = isWorking(shift.pranzo);
      const hasSera = isWorking(shift.sera);
      const isSplit = hasPranzo && hasSera;
      const dateISO = getDateISOForDay(dayIndex);
      const cellRequests = getRequestsFor(person.nome, dateISO);
      const firstRequest = cellRequests[0];
      const requestClass = firstRequest ? requestTypeClass(firstRequest.type) : "";
      const requestNote = firstRequest?.note ? escapeHtml(firstRequest.note) : "Nessuna nota";
      const requestDot = firstRequest ? `<span class="request-dot" aria-hidden="true"></span>` : "";

      if (isSplit) td.classList.add("day-spezzato");
      if (firstRequest) td.classList.add("has-request", requestClass);

      let cellContent;

      if (isSplit) {
        cellContent = `
          <span class="shift-time ${slotClass(shift.pranzo, "pranzo")}">${escapeHtml(shift.pranzo)}</span>
          <span class="shift-time ${slotClass(shift.sera, "sera")}">${escapeHtml(shift.sera)}</span>
        `;
      } else {
        const singleValue = hasPranzo ? shift.pranzo : hasSera ? shift.sera : "Riposo";
        const singlePart = hasPranzo ? "pranzo" : hasSera ? "sera" : "riposo";
        cellContent = `<span class="shift-time single ${slotClass(singleValue, singlePart)}">${escapeHtml(singleValue)}</span>`;
      }

      td.innerHTML = `
        <button class="shift-cell ${isSplit ? "two-fields" : "one-field"} ${requestClass}" type="button" data-person="${personIndex}" data-day="${day.key}" title="${requestNote}" aria-label="Modifica turno ${person.nome} ${day.label}">
          ${cellContent}
          ${requestDot}
        </button>
      `;

      row.appendChild(td);
    });

    scheduleBody.appendChild(row);
  });
};

renderTable();
