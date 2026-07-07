function readMonthlyJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||fallback)}catch(e){return JSON.parse(fallback)}}
function monthlyFormatDate(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function monthlyDateForWeekDay(weekValue,dayKey){
  var index=days.findIndex(function(day){return day[0]===dayKey});
  if(index<0||!weekValue||weekValue==='no-week')return '';
  var parts=weekValue.split('-W');
  var year=Number(parts[0]);
  var week=Number(parts[1]);
  var jan4=new Date(year,0,4);
  var jan4Day=jan4.getDay()||7;
  var monday=new Date(year,0,4-jan4Day+1);
  monday.setDate(monday.getDate()+(week-1)*7+index);
  return monthlyFormatDate(monday);
}
function currentMonthKey(){
  var firstDay=monthlyDateForWeekDay(currentWeek(),'lunedi');
  if(!firstDay)return '';
  return firstDay.slice(0,7);
}
function countMonthlyShifts(depKey,person,monthKey,data){
  var total=0;
  Object.keys(data).forEach(function(weekKey){
    days.forEach(function(day){
      var date=monthlyDateForWeekDay(weekKey,day[0]);
      if(date.slice(0,7)!==monthKey)return;
      var value=(data[weekKey]||{})[cellKey(depKey,person,day[0])];
      if(value&&value!=='Riposo')total++;
    });
  });
  return total;
}
function countMonthlyApprovedRequests(person,monthKey,items){
  return items.filter(function(item){return item.person===person&&item.status==='approvata'&&String(item.date||'').slice(0,7)===monthKey}).length;
}
function renderMonthlySummary(){
  var root=document.getElementById('monthlySummary');
  if(!root)return;
  var monthKey=currentMonthKey();
  if(!monthKey){root.innerHTML='Seleziona una settimana.';return}
  var data=readMonthlyJson('capriBluAppTurniByWeekV1','{}');
  var items=readMonthlyJson('capriBluAppRequestsV1','[]');
  var html='<div class="monthly-title">Riepilogo '+monthKey+'</div>';
  html+='<div class="monthly-grid monthly-head"><span>Persona</span><span>Turni</span><span>Richieste</span></div>';
  departments.forEach(function(dep){
    html+='<div class="monthly-dep">'+dep.title+'</div>';
    dep.people.forEach(function(person){
      var shifts=countMonthlyShifts(dep.key,person,monthKey,data);
      var approved=countMonthlyApprovedRequests(person,monthKey,items);
      html+='<div class="monthly-grid"><span>'+person+'</span><span>'+shifts+'</span><span>'+approved+'</span></div>';
    });
  });
  root.innerHTML=html;
}
function setupMonthlySummary(){
  renderMonthlySummary();
  var weekInput=document.getElementById('weekInput');
  if(weekInput)weekInput.addEventListener('change',renderMonthlySummary);
  var tab=document.querySelector('[data-view="mensile"]');
  if(tab)tab.addEventListener('click',renderMonthlySummary);
}
setupMonthlySummary();
