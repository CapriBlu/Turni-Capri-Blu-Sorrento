/*
  Capri Blu Turni - Touch selection guard
  --------------------------------------------------
  Blocca solo la selezione testo nativa Android/Chrome sulle celle turno.
  Non gestisce copia/incolla e non cambia il click normale della cella.
*/
(function () {
  function isShiftCellTarget(target) {
    return target && target.closest && target.closest('#shiftTable .shift-cell, #shiftTable .shift-time');
  }

  function clearNativeSelection() {
    try {
      var selection = window.getSelection && window.getSelection();
      if (selection && selection.rangeCount) selection.removeAllRanges();
    } catch (error) {}
  }

  function blockNativeSelection(event) {
    if (!isShiftCellTarget(event.target)) return;
    event.preventDefault();
    event.stopPropagation();
    clearNativeSelection();
  }

  function injectStyle() {
    if (document.getElementById('touchSelectionGuardStyle')) return;
    var style = document.createElement('style');
    style.id = 'touchSelectionGuardStyle';
    style.textContent = '#shiftTable .shift-cell,#shiftTable .shift-cell *,#shiftTable .shift-time{user-select:none!important;-webkit-user-select:none!important;-ms-user-select:none!important;-webkit-touch-callout:none!important;touch-action:manipulation!important}#shiftTable td[data-field="nome"]{user-select:text!important;-webkit-user-select:text!important;-webkit-touch-callout:default!important}';
    document.head.appendChild(style);
  }

  function init() {
    injectStyle();

    document.addEventListener('selectstart', blockNativeSelection, true);
    document.addEventListener('contextmenu', blockNativeSelection, true);
    document.addEventListener('dragstart', blockNativeSelection, true);

    document.addEventListener('pointerdown', function (event) {
      if (isShiftCellTarget(event.target)) clearNativeSelection();
    }, true);

    document.addEventListener('pointerup', function (event) {
      if (isShiftCellTarget(event.target)) clearNativeSelection();
    }, true);

    document.addEventListener('selectionchange', function () {
      try {
        var selection = window.getSelection && window.getSelection();
        if (!selection || !selection.rangeCount) return;
        var node = selection.anchorNode;
        if (node && node.nodeType === 3) node = node.parentElement;
        if (node && node.closest && node.closest('#shiftTable .shift-cell')) clearNativeSelection();
      } catch (error) {}
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
