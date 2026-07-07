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
function dataBackupPayload(){
  return {
    createdAt:new Date().toISOString(),
    turni:JSON.parse(localStorage.getItem('capriBluAppTurniByWeekV1')||'{}'),
    settimana:localStorage.getItem('capriBluAppCurrentWeekV1')||'',
    richieste:JSON.parse(localStorage.getItem('capriBluAppRequestsV1')||'[]'),
    mensile:JSON.parse(localStorage.getItem('capriBluAppPublishedMonthlyWeeksV1')||'{}'),
    reparti:JSON.parse(localStorage.getItem('capriBluAppDepartmentOpenV1')||'{}'),
    archivio:localStorage.getItem('capriBluAppArchiveSelectedMonthV1')||''
  };
}
function downloadLocalBackup(){
  var blob=new Blob([JSON.stringify(dataBackupPayload(),null,2)],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var link=document.createElement('a');
  link.href=url;
  link.download='capri-blu-turni-dati.json';
  link.click();
  URL.revokeObjectURL(url);
}
function importLocalBackup(file){
  if(!file)return;
  var reader=new FileReader();
  reader.onload=function(){
    try{
      var data=JSON.parse(reader.result);
      if(!data||typeof data!=='object')throw new Error('Formato dati non valido');
      if(!confirm('Caricare questi dati? I dati locali attuali saranno sostituiti.'))return;
      localStorage.setItem('capriBluAppTurniByWeekV1',JSON.stringify(data.turni||{}));
      localStorage.setItem('capriBluAppCurrentWeekV1',data.settimana||'');
      localStorage.setItem('capriBluAppRequestsV1',JSON.stringify(data.richieste||[]));
      localStorage.setItem('capriBluAppPublishedMonthlyWeeksV1',JSON.stringify(data.mensile||{}));
      localStorage.setItem('capriBluAppDepartmentOpenV1',JSON.stringify(data.reparti||{}));
      localStorage.setItem('capriBluAppArchiveSelectedMonthV1',data.archivio||'');
      alert('Dati caricati. La pagina verrà aggiornata.');
      window.location.reload();
    }catch(error){
      alert('File non valido. Usa un backup JSON di Capri Blu Turni.');
    }
  };
  reader.readAsText(file);
}
function setupMainMenu(){
  var open=document.getElementById('mainMenuBtn');
  var close=document.getElementById('closeMainMenuBtn');
  var panel=document.getElementById('mainMenuPanel');
  if(open)open.addEventListener('click',showMainMenu);
  if(close)close.addEventListener('click',hideMainMenu);
  if(panel)panel.addEventListener('click',function(event){if(event.target===panel)hideMainMenu()});
  document.querySelectorAll('[data-menu-view]').forEach(function(button){button.addEventListener('click',function(){goToView(button.dataset.menuView)})});
  var send=document.getElementById('menuSendMonthlyBtn');
  if(send)send.addEventListener('click',function(){hideMainMenu();var btn=document.getElementById('sendWeekToMonthlyBtn');if(btn)btn.click()});
  var load=document.getElementById('menuLoadDataBtn');
  var file=document.getElementById('backupFileInput');
  if(load&&file)load.addEventListener('click',function(){hideMainMenu();file.click()});
  if(file)file.addEventListener('change',function(){importLocalBackup(file.files[0]);file.value=''});
  var download=document.getElementById('menuDownloadDataBtn');
  if(download)download.addEventListener('click',function(){hideMainMenu();downloadLocalBackup()});
  var print=document.getElementById('menuPrintBtn');
  if(print)print.addEventListener('click',function(){hideMainMenu();window.print()});
  var messages=document.getElementById('menuMessagesBtn');
  if(messages)messages.addEventListener('click',function(){hideMainMenu();alert('Messaggi personale in preparazione')});
  var week=document.getElementById('weekInput');
  if(week)week.addEventListener('change',updateMenuWeekLabel);
}
setupMainMenu();
