var days=[['lunedi','Lun'],['martedi','Mar'],['mercoledi','Mer'],['giovedi','Gio'],['venerdi','Ven'],['sabato','Sab'],['domenica','Dom']];
var departments=[
  {key:'sala',title:'Sala',people:['Pawel','Rafaele','Gaetano','Rose','Shan','Brendon','Vittorio','Dylan','Lorenzo','Sabbit','Annachiara','Natalia','Carmine'],values:['Riposo','A','P','S','A/S','P/S','10','12','15:30','16','17','19']},
  {key:'pizzeria',title:'Pizzeria',people:['LUCA','MARIO','IGOR','CRISTIAN','PIETRO'],values:['Riposo','M','S','M/S','12/chius']},
  {key:'cucina',title:'Cucina / Lavaggio',people:['ANTONINO','Lavapiatti','AJITH','DIEGO','Saja'],values:['Riposo','M','S','M/S','12/chius']}
];
var storeName='capriBluAppTurniByWeekV1';
var weekStoreName='capriBluAppCurrentWeekV1';
var allData={};
var activeCell=null;
try{allData=JSON.parse(localStorage.getItem(storeName)||'{}')}catch(e){allData={}}
function currentWeek(){var input=document.getElementById('weekInput');return input&&input.value?input.value:'no-week'}
function weekData(){var key=currentWeek();if(!allData[key])allData[key]={};return allData[key]}
function cellKey(dep,person,day){return dep+'_'+person+'_'+day}
function cellValue(dep,person,day){return weekData()[cellKey(dep,person,day)]||'Riposo'}
function saveAll(){localStorage.setItem(storeName,JSON.stringify(allData));localStorage.setItem(weekStoreName,currentWeek())}
function saveCell(dep,person,day,value){weekData()[cellKey(dep,person,day)]=value;saveAll();var s=document.getElementById('saveStatus');if(s){s.textContent='Salvato '+currentWeek()}}
function depByKey(key){return departments.find(function(dep){return dep.key===key})}
function thisWeek(){var d=new Date();var day=d.getDay()||7;d.setDate(d.getDate()+4-day);var y=new Date(d.getFullYear(),0,1);var w=Math.ceil((((d-y)/86400000)+1)/7);return d.getFullYear()+'-W'+String(w).padStart(2,'0')}
function previousWeek(value){var parts=value.split('-W');var year=Number(parts[0]);var week=Number(parts[1]);week=week-1;if(week<1){year=year-1;week=52}return year+'-W'+String(week).padStart(2,'0')}
function setupWeek(){var input=document.getElementById('weekInput');if(!input)return;input.value=localStorage.getItem(weekStoreName)||thisWeek();updateWeekLabel();input.addEventListener('change',function(){localStorage.setItem(weekStoreName,input.value);updateWeekLabel();renderSchedule()})}
function updateWeekLabel(){var label=document.getElementById('weekRange');if(label)label.textContent='Settimana '+currentWeek()}

function renderSchedule(){
  var root=document.getElementById('scheduleSections');
  if(!root)return;
  root.innerHTML='';
  departments.forEach(function(dep){
    var card=document.createElement('div');
    card.className='department-card';
    var html='<button class="department-title" type="button">'+dep.title+'</button>';
    dep.people.forEach(function(person){
      html+='<div class="employee-row"><div class="employee-name">'+person+'</div><div class="days-grid">';
      days.forEach(function(day){
        html+='<button class="shift-btn" type="button" data-dep="'+dep.key+'" data-person="'+person+'" data-day="'+day[0]+'"><span class="shift-day">'+day[1]+'</span><span class="shift-value">'+cellValue(dep.key,person,day[0])+'</span></button>';
      });
      html+='</div></div>';
    });
    card.innerHTML=html;
    root.appendChild(card);
  });
}
function setupTabs(){
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.tab-btn').forEach(function(item){item.classList.remove('active')});
      document.querySelectorAll('.view').forEach(function(view){view.classList.remove('active-view')});
      btn.classList.add('active');
      var view=document.getElementById(btn.dataset.view+'View');
      if(view){view.classList.add('active-view')}
    });
  });
}
function applyShift(value){
  if(!activeCell)return;
  activeCell.querySelector('.shift-value').textContent=value;
  saveCell(activeCell.dataset.dep,activeCell.dataset.person,activeCell.dataset.day,value);
  closeShiftEditor();
}
function openShiftEditor(cell){
  activeCell=cell;
  var dep=depByKey(cell.dataset.dep);
  if(!dep)return;
  var editor=document.getElementById('shiftEditor');
  var title=document.getElementById('shiftEditorTitle');
  var options=document.getElementById('shiftOptions');
  var custom=document.getElementById('customShiftInput');
  title.textContent=dep.title+' - '+cell.dataset.person+' - '+cell.dataset.day;
  options.innerHTML='';
  dep.values.forEach(function(value){
    var btn=document.createElement('button');
    btn.className='shift-option-btn';
    btn.type='button';
    btn.textContent=value;
    btn.addEventListener('click',function(){applyShift(value)});
    options.appendChild(btn);
  });
  custom.value=cell.querySelector('.shift-value').textContent;
  editor.classList.add('open');
  editor.setAttribute('aria-hidden','false');
}
function closeShiftEditor(){
  var editor=document.getElementById('shiftEditor');
  editor.classList.remove('open');
  editor.setAttribute('aria-hidden','true');
  activeCell=null;
}
function setupShiftEditor(){
  var close=document.getElementById('closeShiftEditorBtn');
  var save=document.getElementById('saveCustomShiftBtn');
  var editor=document.getElementById('shiftEditor');
  if(close)close.addEventListener('click',closeShiftEditor);
  if(save)save.addEventListener('click',function(){var input=document.getElementById('customShiftInput');applyShift((input.value||'Riposo').trim()||'Riposo')});
  if(editor)editor.addEventListener('click',function(event){if(event.target===editor)closeShiftEditor()});
}
function setupCellTap(){
  document.getElementById('scheduleSections').addEventListener('click',function(event){
    var cell=event.target.closest('.shift-btn');
    if(!cell)return;
    openShiftEditor(cell);
  });
}
function setupCopyPreviousWeek(){
  var btn=document.getElementById('copyPreviousWeekBtn');
  if(!btn)return;
  btn.addEventListener('click',function(){
    var current=currentWeek();
    var previous=previousWeek(current);
    if(!allData[previous]){alert('Nessun turno trovato nella settimana '+previous);return}
    if(!confirm('Copiare i turni da '+previous+' a '+current+'?'))return;
    allData[current]=JSON.parse(JSON.stringify(allData[previous]));
    saveAll();
    renderSchedule();
    var s=document.getElementById('saveStatus');
    if(s){s.textContent='Copiata '+previous}
  });
}
setupTabs();
setupWeek();
renderSchedule();
setupCellTap();
setupShiftEditor();
setupCopyPreviousWeek();
