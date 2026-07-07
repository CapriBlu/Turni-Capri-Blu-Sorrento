function normalizeShiftText(text){return String(text||'').trim().toLowerCase()}
function refreshShiftCellClasses(){
  document.querySelectorAll('.shift-btn').forEach(function(cell){
    var valueNode=cell.querySelector('.shift-value');
    var value=normalizeShiftText(valueNode?valueNode.textContent:'');
    cell.classList.remove('is-rest','is-filled','is-special');
    if(value==='riposo'||value==='off')cell.classList.add('is-rest');
    else if(value)cell.classList.add('is-filled');
    if(value.indexOf('/')>-1||value.indexOf(':')>-1||value.indexOf('cena')>-1||value.indexOf('pranzo')>-1)cell.classList.add('is-special');
  });
}
function setupThemeObserver(){
  refreshShiftCellClasses();
  var root=document.getElementById('scheduleSections');
  if(!root)return;
  var observer=new MutationObserver(refreshShiftCellClasses);
  observer.observe(root,{childList:true,subtree:true,characterData:true});
}
setupThemeObserver();
