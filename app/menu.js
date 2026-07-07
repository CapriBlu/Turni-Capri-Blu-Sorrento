function showMainMenu(){var p=document.getElementById('mainMenuPanel');if(p){p.classList.add('open');p.setAttribute('aria-hidden','false')}}
function hideMainMenu(){var p=document.getElementById('mainMenuPanel');if(p){p.classList.remove('open');p.setAttribute('aria-hidden','true')}}
function goToView(name){var tab=document.querySelector('.tab-btn[data-view="'+name+'"]');if(tab){tab.click()}hideMainMenu()}
function setupMainMenu(){
var a=document.getElementById('mainMenuBtn');
var b=document.getElementById('closeMainMenuBtn');
var p=document.getElementById('mainMenuPanel');
if(a)a.addEventListener('click',showMainMenu);
if(b)b.addEventListener('click',hideMainMenu);
if(p)p.addEventListener('click',function(e){if(e.target===p)hideMainMenu()});
document.querySelectorAll('[data-menu-view]').forEach(function(x){x.addEventListener('click',function(){goToView(x.dataset.menuView)})});
var c=document.getElementById('menuCopyWeekBtn');if(c)c.addEventListener('click',function(){hideMainMenu();var y=document.getElementById('copyPreviousWeekBtn');if(y)y.click()});
var d=document.getElementById('menuSendMonthlyBtn');if(d)d.addEventListener('click',function(){hideMainMenu();var y=document.getElementById('sendWeekToMonthlyBtn');if(y)y.click()});
}
setupMainMenu();
