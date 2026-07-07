function updateMenuWeekLabel(){
  var label=document.getElementById('menuWeekLabel');
  var week=document.getElementById('weekInput');
  if(label&&week)label.textContent=week.value||'-';
}
function showMainMenu(){
  updateMenuWeekLabel();
  var panel=document.getElementById('mainMenuPanel');
  if(panel){panel.classList.add('open');panel.setAttribute('aria-hidden','false')}
}
function hideMainMenu(){
  var panel=document.getElementById('mainMenuPanel');
  if(panel){panel.classList.remove('open');panel.setAttribute('aria-hidden','true')}
}
function goToView(name){
  var tab=document.querySelector('.tab-btn[data-view="'+name+'"]');
  if(tab)tab.click();
  hideMainMenu();
}
function downloadLocalBackup(){
  var data={
    createdAt:new Date().toISOString(),
    turni:JSON.parse(localStorage.getItem('capriBluAppTurniByWeekV1')||'{}'),
    richieste:JSON.parse(localStorage.getItem('capriBluAppRequestsV1')||'[]'),
    mensile:JSON.parse(localStorage.getItem('capriBluAppPublishedMonthlyWeeksV1')||'{}'),
    archivio:JSON.parse(localStorage.getItem('capriBluAppArchiveSelectedMonthV1')||'null')
  };
  var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var link=document.createElement('a');
  link.href=url;
  link.download='capri-blu-turni-backup.json';
  link.click();
  URL.revokeObjectURL(url);
}
function setupMainMenu(){
  var open=document.getElementById('mainMenuBtn');
  var close=document.getElementById('closeMainMenuBtn');
  var panel=document.getElementById('mainMenuPanel');
  if(open)open.addEventListener('click',showMainMenu);
  if(close)close.addEventListener('click',hideMainMenu);
  if(panel)panel.addEventListener('click',function(event){if(event.target===panel)hideMainMenu()});
  document.querySelectorAll('[data-menu-view]').forEach(function(button){
    button.addEventListener('click',function(){goToView(button.dataset.menuView)});
  });
  var send=document.getElementById('menuSendMonthlyBtn');
  if(send)send.addEventListener('click',function(){hideMainMenu();var btn=document.getElementById('sendWeekToMonthlyBtn');if(btn)btn.click()});
  var backup=document.getElementById('menuBackupBtn');
  if(backup)backup.addEventListener('click',function(){hideMainMenu();downloadLocalBackup()});
  var print=document.getElementById('menuPrintBtn');
  if(print)print.addEventListener('click',function(){hideMainMenu();window.print()});
  var messages=document.getElementById('menuMessagesBtn');
  if(messages)messages.addEventListener('click',function(){hideMainMenu();alert('Messaggi personale in preparazione')});
  var week=document.getElementById('weekInput');
  if(week)week.addEventListener('change',updateMenuWeekLabel);
}
setupMainMenu();
