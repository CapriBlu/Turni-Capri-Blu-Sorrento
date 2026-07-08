function publishWeeklyShifts(){
  if(!confirm('Preparare il registro settimanale e scaricare current-week.json?'))return;
  if(typeof sendWeekToMonthly==='function'){
    var ok=sendWeekToMonthly();
    if(!ok)return;
  }
  publishWeeklyOnline(true).then(function(){
    alert('Registro settimanale preparato. Caricalo in data/registry/weekly/current-week.json.');
  });
}
