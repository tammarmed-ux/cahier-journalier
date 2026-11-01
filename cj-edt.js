/* TATABO3 1.29.2b — versions de l’emploi du temps : fenêtres « À partir de quand ce changement s’applique-t-il ? » et « Retrouver l’ancien emploi du temps ».
   Chargé à la demande par index.html (ttUi), hors démarrage. Écrit uniquement le champ additif DB.cal.ttPrev (jamais séances, marques, notes),
   après un instantané local de sécurité. Utilise les fonctions d’index.html transmises par ttUi() dans window.CJEdtA (db, persistNow, calReset, renderHome, sessDate, snapCreate…). */
(function(){if(window.CJEdt)return;var A=window.CJEdtA;   /* fonctions d’index.html transmises par ttUi() (le script principal est dans une fonction) */
var st=document.createElement('style');st.textContent="#ttVerSheet .pq-pan{max-height:88vh;overflow:auto}#ttVerSheet label.ttr{display:flex;gap:10px;align-items:flex-start;padding:10px;border:1px solid var(--line,rgba(0,0,0,.12));border-radius:12px;margin:8px 0;cursor:pointer;font-size:.9rem}\n#ttVerSheet label.ttr input[type=radio]{margin-top:3px;flex:none}#ttVerSheet input[type=date],#ttVerSheet select{margin-top:6px;max-width:100%}\n#ttVerSheet .ttv-pv{margin:10px 0;padding:8px 10px;border-radius:10px;background:var(--pri-soft,rgba(30,90,200,.07));font-size:.86rem}\n#ttVerSheet .actions{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}";document.head.appendChild(st);
function ttSig(tt){return JSON.stringify((tt||[]).map(function(t){return [t.type,t.day,t.start,t.end,t.classId];}).sort());}
function ttDefDate(){var t=A.todayStr(),held=false;try{held=A.occurrences(t,t).some(function(o){return o.s>=0&&A.rec(o.slot.classId,o.cyc,o.s);});}catch(e){}return held?A.addDays(t,1):t;}
function ttMinDate(){var a=A.isoOk(A.db().cal.start)?A.addDays(A.db().cal.start,1):'',f=A.ttFrom();if(f&&A.addDays(f,1)>a)a=A.addDays(f,1);return a;}
function ttSplit(D){if(!A.isoOk(D))return false;var P=A.ttVers().slice();if(P.length&&P[P.length-1].until>=D)return false;
  P.push({until:D,tt:JSON.parse(JSON.stringify(A.db().cal.tt)),at:Date.now()});A.db().cal.ttPrev=P;return true;}
function ttSnap(why){try{A.snapCreate(why,{force:true});}catch(e){}}
function ttDatesNow(){var o={};Object.keys(A.db().sessions).forEach(function(k){var a=k.split('|');o[k]=A.sessDate(a[0],+a[1],+a[2])+'#'+A.sessNo(a[0],+a[1],+a[2]);});return o;}
function ttSheetEl(){var x=A.$('ttVerSheet');if(x)return x;x=document.createElement('div');x.className='pq-sheet';x.id='ttVerSheet';x.setAttribute('role','dialog');x.setAttribute('aria-modal','true');x.setAttribute('aria-labelledby','ttVerT');x.hidden=true;
  x.innerHTML='<div class="pq-bd" data-pq-close="1"></div><div class="pq-pan"><div class="pq-grab" aria-hidden="true"></div><div class="pq-hd"><b id="ttVerT"></b><button type="button" class="pq-x" data-pq-close="1" aria-label="Fermer">✕</button></div><div id="ttVerBody"></div></div>';document.body.appendChild(x);return x;}
function ttSheetOpen(title,body){var x=ttSheetEl();A.$('ttVerT').textContent=title;A.$('ttVerBody').innerHTML=body;x.hidden=false;var c=x.querySelector('.pq-x');if(c)c.focus();return x;}
function ttSheetClose(){var x=A.$('ttVerSheet');if(x)x.hidden=true;}
var TTV_CB=null;
function chg(apply){
  var f=A.ttFrom(),D=ttDefDate(),mn=ttMinDate();if(mn&&D<mn)D=mn;TTV_CB=apply;
  ttSheetOpen('À partir de quand ce changement s’applique-t-il\u00a0?',
   '<p class="small">Les séances <b>avant</b> cette date gardent leurs dates et leurs numéros (S1, S2…)\u00a0: absences, notes et points restent exactement où ils sont. Seules les séances à partir de cette date suivent le nouvel emploi du temps.</p>'+
   '<label class="ttr"><input type="radio" name="ttvMode" value="d" checked><span><b>À partir du</b><br><input type="date" id="ttvDate" value="'+A.esc(D)+'"'+(mn?' min="'+A.esc(mn)+'"':'')+'><br><span class="small muted">Recommandé — séances passées protégées.</span></span></label>'+
   '<label class="ttr"><input type="radio" name="ttvMode" value="all"><span><b>'+(f?'Depuis le '+A.esc(A.dmy(f))+' (date du changement précédent)':'Depuis le début de l’année')+'</b><br><span class="small muted">'+(f?'Les séances entre le '+A.esc(A.dmy(f))+' et aujourd’hui sont aussi recalculées.':'Ancien fonctionnement\u00a0: toutes les séances, passées comprises, sont recalculées.')+'</span></span></label>'+
   '<div class="actions"><button type="button" class="btn sec" data-pq-close="1">Annuler</button><button type="button" class="btn" id="ttvOk">Appliquer</button></div>');}
function ttChangeOk(){var cb=TTV_CB;TTV_CB=null;if(!cb)return;var m=(document.querySelector('input[name="ttvMode"]:checked')||{}).value,D=(A.$('ttvDate')||{}).value||'';
  if(m==='d'){var mn=ttMinDate();if(!A.isoOk(D)||(mn&&D<mn)){A.toast('Choisissez une date à partir du '+A.dmy(mn));TTV_CB=cb;return;}ttSnap('Avant changement de l’emploi du temps');ttSplit(D);}
  ttSheetClose();cb();if(m==='d')setTimeout(function(){A.toast('Appliqué à partir du '+A.dmy(D)+' · séances passées inchangées');},2700);}
/* « Retrouver l’ancien emploi du temps » : l’emploi du temps d’une sauvegarde de sécurité de cet appareil ou d’un fichier de sauvegarde (.json) */
var TTR={src:[],pick:null};
function ttIds(){var o={};A.db().classes.forEach(function(c){o[c.id]=1;});return o;}
function ttFromJson(o){if(!o||!o.cal||!Array.isArray(o.cal.tt))return null;var L=A.ttSlotNorm(o.cal.tt,ttIds());return L.some(function(t){return !A.isAS(t);})?L:null;}
function ttChangedOn(){var cur={},mx=0,mn=0,old=TTR.pick?TTR.pick.tt:[];old.forEach(function(t){cur[t.id]=1;});
  A.db().cal.tt.forEach(function(t){if(cur[t.id]||!/^t[0-9a-z]{9,}$/.test(t.id))return;var ms=parseInt(t.id.slice(1,-6),36);if(ms>1.7e12&&ms<4e12){if(!mn||ms<mn)mn=ms;if(ms>mx)mx=ms;}});
  if(!mn)return '';var d=new Date(mn);return d.getFullYear()+'-'+A.pad(d.getMonth()+1)+'-'+A.pad(d.getDate());}
function ttPreview(old,D){var before=ttDatesNow(),keep=A.db().cal.ttPrev,had=Object.prototype.hasOwnProperty.call(A.db().cal,'ttPrev');A.db().cal.ttPrev=[{until:D,tt:old,at:0}];A.calReset();
  var after=ttDatesNow(),n=0,late=0;Object.keys(before).forEach(function(k){if(before[k]!==after[k])n++;if((after[k].split('#')[0]||'')>=D)late++;});
  if(had)A.db().cal.ttPrev=keep;else delete A.db().cal.ttPrev;A.calReset();return {n:n,late:late};}
function ttRecRender(){var P=TTR.pick,b='<p class="small">Si vous avez déjà modifié votre emploi du temps, les séances passées ont été recalculées avec le nouveau. Choisissez l’ancien emploi du temps\u00a0: il sera utilisé pour les séances <b>avant</b> la date indiquée. Rien d’autre n’est modifié (absences, notes, points restent attachés à leur séance).</p>';
  b+='<label class="f" for="ttrSrc">Ancien emploi du temps</label><select id="ttrSrc">'+(TTR.src.length?'':'<option value="">— aucune sauvegarde de cet appareil ne contient un autre emploi du temps —</option>')+TTR.src.map(function(x,i){return '<option value="'+i+'"'+(P===x?' selected':'')+'>'+A.esc(x.label)+'</option>';}).join('')+'</select>'+
   '<div style="margin-top:6px"><button type="button" class="btn sec sm" id="ttrFileBtn">📄 Choisir un fichier de sauvegarde (.json)…</button><input type="file" id="ttrFile" accept=".json,application/json" hidden></div>';
  if(P){var D=TTR.D,pv=ttPreview(P.tt,D);
    b+='<label class="f" for="ttrDate" style="margin-top:10px">Le nouvel emploi du temps s’applique à partir du</label><input type="date" id="ttrDate" value="'+A.esc(D)+'"'+(A.isoOk(A.db().cal.start)?' min="'+A.esc(A.addDays(A.db().cal.start,1))+'"':'')+'>'+
     '<div class="ttv-pv" id="ttrPv">'+(pv.n?'<b>'+pv.n+' séance'+(pv.n>1?'s':'')+'</b> retrouve'+(pv.n>1?'nt leur date et leur numéro':' sa date et son numéro')+' d’origine.':'Aucune séance enregistrée ne change de date.')+(pv.late?'<br>⚠ '+pv.late+' séance'+(pv.late>1?'s':'')+' enregistrée'+(pv.late>1?'s':'')+' à partir de cette date suive'+(pv.late>1?'nt':'')+' le nouvel emploi du temps.':'')+'<br><span class="muted">Ancien\u00a0: '+P.tt.filter(function(t){return !A.isAS(t);}).length+' créneaux · actuel\u00a0: '+A.db().cal.tt.filter(function(t){return !A.isAS(t);}).length+' créneaux.</span></div>';}
  b+='<div class="actions"><button type="button" class="btn sec" data-pq-close="1">Annuler</button><button type="button" class="btn" id="ttrOk"'+(P?'':' disabled')+'>Retrouver</button></div>';
  var x=A.$('ttVerSheet');if(x&&!x.hidden&&A.$('ttVerT').textContent==='Retrouver l’ancien emploi du temps')A.$('ttVerBody').innerHTML=b;else ttSheetOpen('Retrouver l’ancien emploi du temps',b);}
function ttRecSetPick(x){TTR.pick=x;var c=ttChangedOn();TTR.D=c?A.addDays(c,1):A.todayStr();ttRecRender();}
function ttRecOpen(){TTR={src:[],pick:null,D:A.todayStr()};var cur=ttSig(A.db().cal.tt),seen={};ttRecRender();
  A.snapListAll().then(function(l){return Promise.all(l.map(function(m){return A.snapGet(m.t).then(function(x){var o=x&&A.safeJson(x.data),tt=ttFromJson(o);if(!tt)return null;var g=ttSig(tt);if(g===cur||seen[g])return null;seen[g]=1;
    var d=new Date(m.t);return {tt:tt,label:'Sauvegarde du '+A.pad(d.getDate())+'/'+A.pad(d.getMonth()+1)+'/'+d.getFullYear()+' '+A.pad(d.getHours())+':'+A.pad(d.getMinutes())+(m.why?' — '+m.why:'')+' ('+tt.filter(function(t){return !A.isAS(t);}).length+' créneaux)'};}).catch(function(){return null;});}));})
  .then(function(a){TTR.src=a.filter(Boolean);if(TTR.src.length)ttRecSetPick(TTR.src[0]);else ttRecRender();});}
function ttRecFile(f){var r=new FileReader();r.onload=function(){var o=A.safeJson(r.result),tt=ttFromJson(o);if(!tt){A.toast('Fichier sans emploi du temps lisible pour ces classes');return;}if(ttSig(tt)===ttSig(A.db().cal.tt)){A.toast('Cet emploi du temps est identique à l’actuel');return;}
  var x={tt:tt,label:'Fichier '+String(f.name||'').slice(0,40)+' ('+tt.filter(function(t){return !A.isAS(t);}).length+' créneaux)'};TTR.src.unshift(x);ttRecSetPick(x);};r.readAsText(f);}
function ttRecOk(){var P=TTR.pick,D=(A.$('ttrDate')||{}).value||TTR.D;if(!P||!A.isoOk(D)||(A.isoOk(A.db().cal.start)&&D<=A.db().cal.start)){A.toast('Date invalide');return;}if(A.ttVers().length){A.toast('Un historique existe déjà');return;}
  ttSnap('Avant « Retrouver l’ancien emploi du temps »');A.db().cal.ttPrev=[{until:D,tt:JSON.parse(JSON.stringify(P.tt)),at:Date.now()}];ttSheetClose();A.persistNow();A.calReset();A.renderHome();A.toast('Ancien emploi du temps retrouvé jusqu’au '+A.dmy(A.addDays(D,-1)));}
document.addEventListener('click',function(e){var t=e.target;if(!t||!t.closest)return;
  if(t.closest('#ttvOk')){ttChangeOk();return;}
  if(t.closest('#ttrOk')){ttRecOk();return;}
  if(t.closest('#ttrFileBtn')){var fi=A.$('ttrFile');if(fi)fi.click();return;}
});
function undo(){var f=A.ttFrom();if(!confirm('Appliquer l’emploi du temps actuel à toute l’année\u00a0?\nLes séances avant le '+A.dmy(f)+' seront recalculées avec l’emploi du temps actuel (comme avant la version 1.29.2b). Une sauvegarde de sécurité est créée avant.'))return;
    ttSnap('Avant « Appliquer l’actuel à toute l’année »');var P=A.ttVers().slice();P.pop();A.db().cal.ttPrev=P;A.persistNow();A.calReset();A.renderHome();A.toast('Emploi du temps actuel appliqué à toute l’année');}
document.addEventListener('change',function(e){var t=e.target;if(!t)return;if(t.id==='ttrSrc'){var x=TTR.src[+t.value];if(x)ttRecSetPick(x);}else if(t.id==='ttrFile'&&t.files&&t.files[0])ttRecFile(t.files[0]);else if(t.id==='ttrDate'){TTR.D=t.value;ttRecRender();}});
window.CJEdt={change:chg,rec:ttRecOpen,undo:undo};
})();
