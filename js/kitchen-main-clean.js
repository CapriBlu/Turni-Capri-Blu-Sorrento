(function () {
  const kitchenWeekPrefix = "capriBluTurniCucinaWeekV1-";
  const kitchenPublishedPrefix = "capriBluTurniCucinaPublishedWeekV1-";

  const sections = [
    { title: "Pizzeria", people: ["LUCA", "MARIO", "IGOR", "CRISTIAN", "PIETRO"] },
    { title: "Cucina / Lavaggio", people: ["ANTONINO", "Lavapiatti", "AJITH", "DIEGO", "Saja"] }
  ];

  function canRun() {
    return typeof days !== "undefined" && typeof weekInput !== "undefined" && typeof scheduleBody !== "undefined";
  }

  function esc(value) {
    if (typeof escapeHtml === "function") return escapeHtml(value);
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function blankWeek() {
    const data = {};
    if (!canRun()) return data;

    sections.forEach((section) => {
      section.people.forEach((name) => {
        data[name] = {};
        days.forEach((day) => {
          data[name][day.key] = "";
        });
      });
    });

    return data;
  }

  function currentKey() {
    return kitchenWeekPrefix + weekInput.value;
  }

  function publishedKey() {
    return kitchenPublishedPrefix + weekInput.value;
  }

  function readData() {
    const fallback = blankWeek();
    const saved = localStorage.getItem(currentKey());
    let parsed = fallback;

    try {
      parsed = saved ? JSON.parse(saved) : fallback;
    } catch (error) {
      localStorage.removeItem(currentKey());
      parsed = fallback;
    }

    const data = Object.assign(fallback, parsed || {});
    sections.forEach((section) => {
      section.people.forEach((name) => {
        data[name] = Object.assign(fallback[name] || {}, data[name] || {});
      });
    });

    return data;
  }

  function saveData(data) {
    localStorage.setItem(currentKey(), JSON.stringify(data));
  }

  function normalize(value) {
    const clean = String(value || "").trim();
    const lower = clean.toLowerCase();

    if (!clean || lower === "off" || lower === "riposo" || lower === "r" || lower === "-") return "Off";
    if (lower === "m" || lower === "mattina") return "M";
    if (lower === "s" || lower === "sera") return "S";
    if (lower === "m/s" || lower === "ms" || lower === "spezzato") return "M/S";
    if (lower === "12/chius" || lower === "12 chius" || lower === "12/chiusura" || lower === "12 chiusura") return "12/chius";

    return clean;
  }

  function shiftClass(value) {
    const clean = String(value || "").toLowerCase();
    if (!clean || clean === "off") return "riposo";
    if (clean === "m") return "pranzo";
    if (clean === "m/s") return "spezzato";
    return "sera";
  }

  function cellContent(value) {
    const display = String(value || "").trim() || "Off";
    return `<span class="shift-time single ${shiftClass(display)}">${esc(display)}</span>`;
  }

  function renderKitchenRows() {
    if (!canRun()) return;

    const data = readData();
    scheduleBody.querySelectorAll(".kitchen-section-row, .kitchen-person-row").forEach((row) => row.remove());

    sections.forEach((section) => {
      const sectionRow = document.createElement("tr");
      sectionRow.className = "kitchen-section-row";
      sectionRow.innerHTML = `<td colspan="8">${esc(section.title)}</td>`;
      scheduleBody.appendChild(sectionRow);

      section.people.forEach((name) => {
        const row = document.createElement("tr");
        row.className = "kitchen-person-row";
        row.innerHTML = `<td class="kitchen-name-cell">${esc(name)}</td>`;

        days.forEach((day) => {
          const value = data[name]?.[day.key] || "";
          const td = document.createElement("td");
          td.innerHTML = `<button class="shift-cell kitchen-shift-cell one-field" type="button" data-name="${esc(name)}" data-day="${day.key}" aria-label="Modifica turno ${esc(name)} ${esc(day.label)}">${cellContent(value)}</button>`;
          row.appendChild(td);
        });

        scheduleBody.appendChild(row);
      });
    });
  }

  function editCell(cell) {
    if (!cell || !canRun()) return;

    const name = cell.dataset.name;
    const dayKey = cell.dataset.day;
    const dayLabel = days.find((day) => day.key === dayKey)?.label || dayKey;
    const data = readData();
    const current = data[name]?.[dayKey] || "Off";
    const next = window.prompt(`${name} - ${dayLabel}\nValori: M, S, M/S, Off, 12/chius`, current);

    if (next === null) return;
    if (!data[name]) data[name] = {};
    data[name][dayKey] = normalize(next);
    saveData(data);
    renderTable();
  }

  if (typeof renderTable === "function" && !renderTable.__kitchenCleanIntegrated) {
    const originalRenderTable = renderTable;
    renderTable = function () {
      originalRenderTable();
      renderKitchenRows();
    };
    renderTable.__kitchenCleanIntegrated = true;
  }

  document.addEventListener("click", function (event) {
    const cell = event.target.closest(".kitchen-shift-cell");
    if (!cell) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    editCell(cell);
  }, true);

  document.getElementById("sendMonthlyBtn")?.addEventListener("click", function () {
    if (!canRun()) return;
    localStorage.setItem(publishedKey(), JSON.stringify(readData()));
  }, true);

  renderKitchenRows();
})();
