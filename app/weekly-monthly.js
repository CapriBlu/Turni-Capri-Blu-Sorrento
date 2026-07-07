var monthlyPublishedStoreName='capriBluAppPublishedMonthlyWeeksV1';
function wmReadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||fallback)}catch(e){return JSON.parse(fallback)}}
function wmSaveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function wmWeekNumber(){var value=currentWeek();if(!value||value==='no-week')return 0;var parts=value.split('-W');return Number(parts[1])||0}
function applyWeekTone(){
  var tone=wmWeekNumber()%6;
  document.body.setAttribute('data-week-tone',String(tone));
}
function getCurrentWeekSnapshot(){
  var source=wmReadJson('capriBluAppTurniByWeekV1','{}');
  var week=currentWeek();
  return JSON.parse(JSON.stringify(source[week]||{}));
}
function updateWeeklyMonthlyStatus(){
  var box=document.getElementById('weeklyMonthlyStatus');
  if(!box)return;
  var published=wmReadJson(monthlyPublishedStoreName,'{}');
  var week=currentWeek();
  if(published[week]){
    box.textContent='Settimana inviata al mensile.';
    box.classList.add('is-published');
  }else{
    box.textContent='Non ancora inviata al mensile.';
    box.classList.remove('is-published');
  }
}
function sendWeekToMonthly(){
  var week=currentWeek();
  if(!week||week==='no-week'){alert('Seleziona una settimana.');return}
  var snapshot=getCurrentWeekSnapshot();
  if(!Object.keys(snapshot).length){alert('Questa settimana non ha turni compilati.');return}
  var published=wmReadJson(monthlyPublishedStoreName,'{}');
  if(published[week]&&!confirm('Questa settimana è già nel mensile. Vuoi aggiornarla?'))return;
  published[week]={sentAt:new Date().toISOString(),data:snapshot};
  wmSaveJson(monthlyPublishedStoreName,published);
  updateWeeklyMonthlyStatus();
  if(typeof renderMonthlySummary==='function')renderMonthlySummary();
  var s=document.getElementById('saveStatus');
  if(s)s.textContent='Inviata al mensile '+week;
}
function setupWeeklyMonthly(){
  var btn=document.getElementById('sendWeekToMonthlyBtn');
  if(btn)btn.addEventListener('click',sendWeekToMonthly);
  var input=document.getElementById('weekInput');
  if(input)input.addEventListener('change',function(){applyWeekTone();updateWeeklyMonthlyStatus()});
  applyWeekTone();
  updateWeeklyMonthlyStatus();
}
setupWeeklyMonthly();
