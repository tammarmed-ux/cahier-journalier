/* 1.29.2 (c) : Vacances et jours fériés en cartes + indisponibilité sur une plage horaire (créneau neutralisé) + compatibilité des données */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy',O='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8033);
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8033/?emu=1',{waitUntil:'networkidle2'});
// 1. ancien export réel (1.29.1) : chargé tel quel, entrées sans heures identiques
const OLD=JSON.parse(fs.readFileSync('/workspace/backups/data-AVANT-1.29.1-20261020.json','utf8'));
await p.evaluate((K,d)=>localStorage.setItem(K,JSON.stringify(d)),KEY,OLD);await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const L=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
check('ancien export 1.29.1 : 347 élèves, 50 séances, 16 dates de vacances/fériés lues à l’identique (aucun champ ajouté)',L.students.length===347&&Object.keys(L.sessions).length===50&&JSON.stringify(L.cal.holidays)===JSON.stringify(OLD.cal.holidays));
// import via applyJSON / normaliseur (même chemin que « Restaurer »)
const imp=await p.evaluate(d=>{const A=window.CJR;const f=A.normalize||A.normDB||A.sanitize;return f?JSON.stringify(f(JSON.parse(JSON.stringify(d))).cal.holidays):'nofn';},OLD);
console.log('normalizer',imp==='nofn'?'(non exposé)':'ok');
// 2. indisponibilité horaire
const cid=OLD.cal.tt[0].classId,day=OLD.cal.tt[0].day,st=OLD.cal.tt[0].start,en=OLD.cal.tt[0].end;
const before=await p.evaluate((cid)=>window.CJR.colsOf(cid,2).map(c=>c.hol?'H':'s'+c.s).join(','),cid);
let dd='2026-12-14';while(((new Date(dd+'T12:00Z').getUTCDay()+6)%7+1)!==day){const d=new Date(dd+'T12:00Z');d.setUTCDate(d.getUTCDate()+1);dd=d.toISOString().slice(0,10);}
await p.evaluate((K,dd,st,en)=>{const d=JSON.parse(localStorage.getItem(K));d.cal.holidays.push({id:'hTEST',from:dd,to:'',label:'Réunion administration',approx:false,off:false,startTime:st,endTime:en});d.cal.holidays.push({id:'hTEST2',from:'2026-12-16',to:'',label:'Conseil de classe',approx:false,off:false,startTime:'14:00',endTime:'16:00'});localStorage.setItem(K,JSON.stringify(d));},KEY,dd,st,en);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
console.log('DBG',await p.evaluate((cid,dd)=>{const db=window.CJR.db();return JSON.stringify([db.cal.holidays.find(h=>h.id==='hTEST'),window.CJR.colsOf(cid,2).filter(c=>c.date===dd).map(c=>[c.s,!!c.hol,c.slot&&c.slot.start]),db.cal.cycles[2]]);},cid,dd));
const r=await p.evaluate((cid,dd)=>{const a=window.CJR.colsOf(cid,2);const hit=a.filter(c=>c.hol&&c.date===dd);return {dd,hit:hit.length,slot:hit[0]&&hit[0].slot.start,n:a.n,after:a.map(c=>c.hol?'H':'s'+c.s).join(','),sameDay:window.CJR.db().cal.tt.filter(t=>t.day===hit[0].slot.day).length};},cid,dd);
r.before=before;
console.log(JSON.stringify(r));
check('plage horaire hors créneau (16/12 14:00–16:00) : séance du 16/12 conservée',r.after.split(',').filter(x=>x==='H').length===r.before.split(',').filter(x=>x==='H').length+1,r.before+' → '+r.after);
check('plage horaire : seul le créneau qui chevauche est neutralisé (1 colonne grisée), les autres créneaux du jour restent des séances',r.hit===1&&r.slot===st);
check('aucune erreur JS',errs.length===0,errs.join('|'));
// 3. captures : écran en 3 thèmes (+ ⓘ), formulaire avec heures, grille avec créneau neutralisé
const theme=t=>p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},t);
const openHol=async()=>{await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);await p.evaluate(()=>window.CJPS&&CJPS.open('hol'));await sleep(500);
 await p.evaluate(()=>{const e=document.getElementById('holCard');e.scrollIntoView({block:'start'});window.scrollBy(0,-110);});await sleep(300);};
for(const th of ['terrain','neon','']){const sx=th?'-'+th:'';await p.reload({waitUntil:'networkidle2'});await unlock();await theme(th);await openHol();
 const n=await p.evaluate(()=>document.querySelectorAll('#holCard .hy-card').length);check('cartes affichées '+(th||'actuel'),n>=15,n);
 await p.screenshot({path:O+'feries'+sx+'.png'});
 if(!th){await p.click('#holCard [data-pq-open="holSheet"]');await sleep(350);await p.screenshot({path:O+'feries-info.png'});await p.keyboard.press('Escape');await sleep(200);
  await p.click('#holNew');await sleep(300);const hid0=await p.evaluate(()=>getComputedStyle(document.getElementById('holHours')).display);
  await p.click('#holAllDay');await sleep(200);const hid1=await p.evaluate(()=>getComputedStyle(document.getElementById('holHours')).display);
  check('« Toute la journée » coché par défaut, décocher affiche les heures',hid0==='none'&&hid1!=='none',hid0+'/'+hid1);
  await p.evaluate(()=>{const v=(i,x)=>{const e=document.getElementById(i);e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}));};v('holFrom','2027-01-20');v('holStart','10:00');v('holEnd','12:00');v('holLabel','Inspection');});
  await p.evaluate(()=>document.getElementById('holCard').querySelector('form,.hy-form')?.scrollIntoView({block:'center'}));await sleep(200);
  await p.screenshot({path:O+'feries-form-heures.png'});
  await p.click('#holSave');await sleep(400);
  const e=await p.evaluate(()=>window.CJR.db().cal.holidays.find(h=>h.from==='2027-01-20'));
  check('ajout avec heures : startTime/endTime enregistrés, autres champs inchangés',e&&e.startTime==='10:00'&&e.endTime==='12:00'&&e.label==='Inspection',JSON.stringify(e));
  const old=await p.evaluate(()=>JSON.stringify(window.CJR.db().cal.holidays.filter(h=>h.id.indexOf('hTEST')<0&&h.from!=='2027-01-20').sort((a,b)=>a.id<b.id?-1:1)));
  check('entrées existantes inchangées après ajout',old===JSON.stringify(OLD.cal.holidays.slice().sort((a,b)=>a.id<b.id?-1:1)));}}
// grille Absences avec le créneau neutralisé
await p.reload({waitUntil:'networkidle2'});await unlock();await theme('');
await p.evaluate((K,cid)=>{const d=window.CJR.db();d.ui.cls=cid;d.ui.per=2;},KEY,cid);
await p.evaluate((K,cid)=>{const d=JSON.parse(localStorage.getItem(K));d.ui.cls=cid;d.ui.per=2;localStorage.setItem(K,JSON.stringify(d));},KEY,cid);
await p.reload({waitUntil:'networkidle2'});await unlock();
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(700);
const g=await p.evaluate(dd=>{const all=[...document.querySelectorAll('.holv')].filter(x=>!x.children.length&&/Réunion|Réun/.test((x.textContent||'')+(x.getAttribute('title')||'')));const t=all[0];if(t)t.scrollIntoView({block:'center',inline:'center'});return all.length+':'+(t?t.outerHTML.slice(0,200):'');},r.dd);console.log('G',g);
check('grille : colonne grisée « Réunion administration » visible',!g.startsWith('0'));await sleep(300);
await p.screenshot({path:O+'feries-grille-creneau.png'});
// 4. champs de service retirés de l’écran, valeurs conservées et utilisées
await p.reload({waitUntil:'networkidle2'});await unlock();await theme('');
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);await p.evaluate(()=>window.CJPS&&CJPS.open('annee'));await sleep(500);
const sv=await p.evaluate(()=>{const c=window.CJR.db().cal;return {ui:['setOblig','setPerWeek','setDayMin','setDayMax','setFriMax'].filter(i=>document.getElementById(i)).length,note:/Utilisés pour le contrôle du service/.test(document.body.innerText),v:[c.oblig,c.perWeek,c.dayMin,c.dayMax,c.friMax].join('/')};});
check('service : 5 champs + texte retirés, valeurs conservées 21/2/2/6/4',sv.ui===0&&!sv.note&&sv.v==='21/2/2/6/4',JSON.stringify(sv));
await p.evaluate(()=>{const e=document.getElementById('cycOfficial');e.scrollIntoView({block:'center'});});await sleep(300);
await p.screenshot({path:O+'service-masque.png'});
// valeur absente -> défaut ; valeur personnalisée -> conservée et utilisée
await p.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K));delete d.cal.oblig;delete d.cal.friMax;d.cal.dayMax=5;localStorage.setItem(K,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();
const sv2=await p.evaluate(()=>{const c=window.CJR.db().cal;return [c.oblig,c.perWeek,c.dayMin,c.dayMax,c.friMax].join('/');});
check('service : valeurs absentes -> 21 / 4 par défaut, valeur stockée (5) conservée',sv2==='21/2/2/5/4',sv2);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(300);await p.evaluate(()=>window.CJPS&&CJPS.open('tt'));await sleep(400);
const box=await p.evaluate(()=>{const b=document.getElementById('svcBox');return b?b.innerText.slice(0,160):'none';});console.log('svcBox',box);
await b.close();srv.close();console.log(results.filter(x=>x).length+'/'+results.length+' passed','errs',errs.join('|'));})();
