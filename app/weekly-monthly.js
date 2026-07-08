var monthlyPublishedStoreName='capriBluAppPublishedMonthlyWeeksV1';
function wmReadJson(key,fallback){try{return JSON.parse(localStorage.getItem(key)||fallback)}catch(e){return JSON.parse(fallback)}}
function wmSaveJson(key,value){localStorage.setItem(key,JSON.stringify(value))}
function wmWeekNumber(){var value=currentWeek();if(!value||value==='no-week')return 0;var parts=value.split('-W');return Number(parts[1])||0}
function applyWeekTone(){document.body.setAttribute('data-week-tone',String(wmWeekNumber()%6))}
function getCurrentWeekSnapshot(){var source=wmReadJson('capriBluAppTurniByWeekV1','{}');var week=currentWeek();return JSON.parse(JSON.stringify(source[week]||{}))}
function sendWeekToMonthly(){var week=currentWeek();if(!week||week==='no-week'){alert('Seleziona una settimana.');return false}var snapshot=getCurrentWeekSnapshot();if(!Object.keys(snapshot).length){alert('Questa settimana non ha turni compilati.');return false}var published=wmReadJson(monthlyPublishedStoreName,'{}');if(published[week]&&!confirm('Questa settimana è già nel registro mensile. Vuoi aggiornarla?'))return false;published[week]={sentAt:new Date().toISOString(),data:snapshot};wmSaveJson(monthlyPublishedStoreName,published);if(typeof renderMonthlySummary==='function')renderMonthlySummary();var s=document.getElementById('saveStatus');if(s)s.textContent='Registro mensile aggiornato '+week;return true}
function setupWeeklyMonthly(){var input=document.getElementById('weekInput');if(input)input.addEventListener('change',applyWeekTone);applyWeekTone()}
setupWeeklyMonthly();
