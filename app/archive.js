var archiveSelectedMonthStoreName='capriBluAppArchiveSelectedMonthV1';
var archiveMonths=[
  ['01','Gennaio'],['02','Febbraio'],['03','Marzo'],['04','Aprile'],['05','Maggio'],['06','Giugno'],
  ['07','Luglio'],['08','Agosto'],['09','Settembre'],['10','Ottobre'],['11','Novembre'],['12','Dicembre']
];
function archiveCurrentYear(){return new Date().getFullYear()}
function archiveCurrentMonthKey(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function archiveSelectedMonth(){return localStorage.getItem(archiveSelectedMonthStoreName)||archiveCurrentMonthKey()}
function saveArchiveSelectedMonth(value){localStorage.setItem(archiveSelectedMonthStoreName,value)}
function archiveSelectMonth(value,label){
  saveArchiveSelectedMonth(value);
  renderArchiveMonths();
  var status=document.getElementById('archiveStatus');
  if(status)status.textContent='Mese selezionato: '+label+' '+value.slice(0,4);
}
function renderArchiveMonths(){
  var root=document.getElementById('archiveMonths');
  if(!root)return;
  var year=archiveCurrentYear();
  var current=archiveCurrentMonthKey();
  var selected=archiveSelectedMonth();
  root.innerHTML='';
  archiveMonths.forEach(function(month){
    var value=year+'-'+month[0];
    var btn=document.createElement('button');
    btn.type='button';
    btn.className='archive-month-btn';
    if(value===current)btn.classList.add('is-current-month');
    if(value===selected)btn.classList.add('is-selected-month');
    btn.textContent=month[1];
    btn.addEventListener('click',function(){archiveSelectMonth(value,month[1])});
    root.appendChild(btn);
  });
}
function setupArchivePage(){
  renderArchiveMonths();
  var open=document.getElementById('archiveOpenMonthlyBtn');
  var back=document.getElementById('archiveBackToWeekBtn');
  if(open)open.addEventListener('click',function(){var tab=document.querySelector('.tab-btn[data-view="mensile"]');if(tab)tab.click()});
  if(back)back.addEventListener('click',function(){var tab=document.querySelector('.tab-btn[data-view="turni"]');if(tab)tab.click()});
  document.querySelectorAll('[data-menu-view="archivio"]').forEach(function(btn){btn.addEventListener('click',renderArchiveMonths)});
}
setupArchivePage();
