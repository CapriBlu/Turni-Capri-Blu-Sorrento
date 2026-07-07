var days=[['lunedi','Lun'],['martedi','Mar'],['mercoledi','Mer'],['giovedi','Gio'],['venerdi','Ven'],['sabato','Sab'],['domenica','Dom']];
var departments=[
  {key:'sala',title:'Sala',people:['Pawel','Rafaele','Gaetano','Rose','Shan','Brendon','Vittorio','Dylan','Lorenzo','Sabbit','Annachiara','Natalia','Carmine']},
  {key:'pizzeria',title:'Pizzeria',people:['LUCA','MARIO','IGOR','CRISTIAN','PIETRO']},
  {key:'cucina',title:'Cucina / Lavaggio',people:['ANTONINO','Lavapiatti','AJITH','DIEGO','Saja']}
];
var values=['Riposo','M','S','M/S','A','P','P/S','12/chius','10','12','15:30','16','17','19'];
var storeName='capriBluAppTurniV1';
var saved={};
try{saved=JSON.parse(localStorage.getItem(storeName)||'{}')}catch(e){saved={}}
function cellKey(person,day){return person+'_'+day}
function cellValue(person,day){return saved[cellKey(person,day)]||'Riposo'}
function saveCell(person,day,value){saved[cellKey(person,day)]=value;localStorage.setItem(storeName,JSON.stringify(saved));var s=document.getElementById('saveStatus');if(s){s.textContent='Salvato'}}

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
        html+='<button class="shift-btn" type="button" data-person="'+person+'" data-day="'+day[0]+'"><span class="shift-day">'+day[1]+'</span><span class="shift-value">'+cellValue(person,day[0])+'</span></button>';
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
function setupCellTap(){
  document.getElementById('scheduleSections').addEventListener('click',function(event){
    var cell=event.target.closest('.shift-btn');
    if(!cell)return;
    var current=cell.querySelector('.shift-value').textContent;
    var next=prompt('Turno '+cell.dataset.person+' '+cell.dataset.day+'\n'+values.join(', '),current);
    if(next===null)return;
    next=next.trim()||'Riposo';
    cell.querySelector('.shift-value').textContent=next;
    saveCell(cell.dataset.person,cell.dataset.day,next);
  });
}
setupTabs();
renderSchedule();
setupCellTap();
