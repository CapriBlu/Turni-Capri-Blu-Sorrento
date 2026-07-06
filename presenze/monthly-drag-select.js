const mSel = new Set();
const mClipKey = "capriBluMensileClipboardV2";
let mStart = null;
let mDown = false;
let mBlockClick = false;
let mMenu = null;

function mKey(cell) {
  return cell.dataset.name + "-" + cell.dataset.day;
}

function mMonthInput() {
  return document.getElementById("monthInput");
}

function mDataKey() {
  return "capriBluPresenzeMensili-" + mMonthInput().value;
}

function mRead() {
  try {
    return JSON.parse(localStorage.getItem(mDataKey()) || "{}");
  } catch (e) {
    return {};
  }
}

function mSave(data, msg) {
  localStorage.setItem(mDataKey(), JSON.stringify(data));
  if (typeof setAutosaveStatus === "function") setAutosaveStatus(msg || "Salvato");
}

function mRecord(cell) {
  const data = mRead();
  const saved = data[mKey(cell)];
  if (saved) return typeof saved === "string" ? { value: saved, minutes: 0 } : saved;
  return { value: cell.dataset.value || "", minutes: Number(cell.dataset.minutes || 0) };
}

function mCells() {
  return Array.from(document.querySelectorAll(".presence-cell.multi-selected"));
}

function mClear() {
  document.querySelectorAll(".presence-cell.multi-selected").forEach((c) => c.classList.remove("multi-selected"));
  mSel.clear();
}

function mAdd(cell) {
  if (!cell) return;
  mSel.add(mKey(cell));
  cell.classList.add("multi-selected");
}

function mSingle(cell) {
  mClear();
  mAdd(cell);
}

function mRange(a, b) {
  if (!a || !b) return;
  const r1 = Math.min(a.parentElement.rowIndex, b.parentElement.rowIndex);
  const r2 = Math.max(a.parentElement.rowIndex, b.parentElement.rowIndex);
  const c1 = Math.min(a.cellIndex, b.cellIndex);
  const c2 = Math.max(a.cellIndex, b.cellIndex);
  mClear();
  Array.from(table.rows).forEach((row) => {
    if (row.rowIndex < r1 || row.rowIndex > r2) return;
    Array.from(row.cells).forEach((cell) => {
      if (cell.cellIndex < c1 || cell.cellIndex > c2) return;
      if (cell.classList.contains("presence-cell")) mAdd(cell);
    });
  });
}

function mCopy() {
  const cells = mCells();
  if (!cells.length) return;
  const minRow = Math.min(...cells.map((cell) => cell.parentElement.rowIndex));
  const minCol = Math.min(...cells.map((cell) => cell.cellIndex));
  const payload = cells.map((cell) => ({
    rowOffset: cell.parentElement.rowIndex - minRow,
    colOffset: cell.cellIndex - minCol,
    record: mRecord(cell)
  }));
  localStorage.setItem(mClipKey, JSON.stringify(payload));
  if (typeof setAutosaveStatus === "function") setAutosaveStatus(cells.length + " celle copiate");
}

function mClip() {
  try {
    const value = JSON.parse(localStorage.getItem(mClipKey) || "[]");
    return Array.isArray(value) ? value : [value];
  } catch (e) {
    return [];
  }
}

function mPaste() {
  const cells = mCells();
  const clip = mClip();
  if (!cells.length || !clip.length) return;
  const data = mRead();
  const destRow = Math.min(...cells.map((cell) => cell.parentElement.rowIndex));
  const destCol = Math.min(...cells.map((cell) => cell.cellIndex));
  let pasted = 0;

  clip.forEach((item, i) => {
    const source = item.record || item;
    const targetRow = table.rows[destRow + Number(item.rowOffset || 0)];
    const targetCell = targetRow?.cells?.[destCol + Number(item.colOffset || 0)];
    if (targetCell && targetCell.classList.contains("presence-cell")) {
      data[mKey(targetCell)] = { value: source.value || "", minutes: Number(source.minutes || 0) };
      pasted += 1;
    } else if (clip.length === cells.length) {
      const fallback = cells[i];
      if (fallback) {
        data[mKey(fallback)] = { value: source.value || "", minutes: Number(source.minutes || 0) };
        pasted += 1;
      }
    }
  });

  mSave(data, pasted + " celle incollate");
  renderTable();
}

function mEmpty() {
  const cells = mCells();
  if (!cells.length) return;
  const data = mRead();
  cells.forEach((cell) => delete data[mKey(cell)]);
  mSave(data, cells.length + " celle svuotate");
  renderTable();
}

function mApplyValue(value) {
  const cells = mCells();
  if (!cells.length) return;
  const data = mRead();
  cells.forEach((cell) => {
    if (!value) delete data[mKey(cell)];
    else data[mKey(cell)] = { value, minutes: 0 };
  });
  mSave(data, cells.length + " celle impostate: " + (value || "Vuoto"));
  renderTable();
}

function mHideMenu() {
  if (mMenu) mMenu.classList.remove("open");
}

function mShowMenu(x, y) {
  if (!mMenu) {
    mMenu = document.createElement("div");
    mMenu.className = "monthly-context-menu";
    mMenu.innerHTML = '<button data-a="set" data-v="P">P - Presenza</button><button data-a="set" data-v="F">F - Festa</button><button data-a="set" data-v="Fer">Fer - Ferie</button><button data-a="set" data-v="MAL">MAL - Malattia</button><button data-a="set" data-v="Ass">Ass - Assenza</button><button data-a="copy">Copia</button><button data-a="paste">Incolla</button><button data-a="clear">Svuota</button>';
    document.body.appendChild(mMenu);
    mMenu.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-a]");
      if (!b) return;
      e.preventDefault();
      e.stopPropagation();
      mHideMenu();
      if (b.dataset.a === "set") mApplyValue(b.dataset.v || "");
      if (b.dataset.a === "copy") mCopy();
      if (b.dataset.a === "paste") mPaste();
      if (b.dataset.a === "clear") mEmpty();
    });
  }
  mMenu.style.left = x + "px";
  mMenu.style.top = y + "px";
  mMenu.classList.add("open");
}

table.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const cell = e.target.closest(".presence-cell");
  if (!cell) return;
  mHideMenu();
  mDown = true;
  mStart = cell;
  mBlockClick = false;
  mSingle(cell);
  e.preventDefault();
});

table.addEventListener("pointermove", (e) => {
  if (!mDown || !mStart) return;
  const el = document.elementFromPoint(e.clientX, e.clientY);
  const cell = el && el.closest ? el.closest(".presence-cell") : null;
  if (!cell) return;
  if (cell !== mStart) mBlockClick = true;
  mRange(mStart, cell);
  e.preventDefault();
});

document.addEventListener("pointerup", () => {
  mDown = false;
  mStart = null;
});

table.addEventListener("click", (e) => {
  const cell = e.target.closest(".presence-cell");
  if (!cell) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  mBlockClick = false;
}, true);

table.addEventListener("dblclick", (e) => {
  const cell = e.target.closest(".presence-cell");
  if (!cell) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  mSingle(cell);
  if (typeof openPresenceMenu === "function") openPresenceMenu(cell);
}, true);

table.addEventListener("contextmenu", (e) => {
  const cell = e.target.closest(".presence-cell");
  if (!cell) return;
  e.preventDefault();
  e.stopImmediatePropagation();
  if (!cell.classList.contains("multi-selected")) mSingle(cell);
  mShowMenu(e.clientX, e.clientY);
});

document.addEventListener("click", (e) => {
  if (mMenu && !e.target.closest(".monthly-context-menu")) mHideMenu();
});

document.getElementById("clearBtn")?.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopImmediatePropagation();
  mEmpty();
}, true);

document.addEventListener("keydown", (e) => {
  if (!mCells().length) return;
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "c") { e.preventDefault(); e.stopImmediatePropagation(); mCopy(); }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "v") { e.preventDefault(); e.stopImmediatePropagation(); mPaste(); }
  if (e.key === "Delete" || e.key === "Backspace") { e.preventDefault(); e.stopImmediatePropagation(); mEmpty(); }
  if (e.key === "Escape") { mHideMenu(); mClear(); }
}, true);
