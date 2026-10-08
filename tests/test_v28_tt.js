/* v1.28.0 (-h) : tableau de service modernisé (carte « Emploi du temps » de l’Accueil + formulaire de créneau) — purement visuel.
   Vérifie : rendu (puces Lun→Sam, aujourd’hui, cartes de créneaux colorées par niveau), ajout / modification / suppression inchangés
   (même format de DB.cal.tt), 375 px, cibles ≥ 44 px, mouvement réduit, aucune erreur.
   SHOT=before|after : captures seules (BEFORE : commit 321c845 servi depuis /tmp/cj-before2). */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const SHOT=process.env.SHOT||'';const D=SHOT==='before'?'/tmp/cj-before2':'/workspace/cj-deploy';const PORT=SHOT==='before'?8026:8025;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Etc/GMT-1');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));let ACCEPT=true,dlg=[];p.on('dialog',d=>{dlg.push(d.message());ACCEPT?d.accept():d.dismiss();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now();
  const by=re=>d.classes.find(x=>re.test(x.name));if(!by(/^TC/))d.classes.push(Object.assign(JSON.parse(JSON.stringify(d.classes[0])),{id:'cTC1',name:'TCS1'}));const A=by(/^2BAC/),B=by(/^1BAC/),T=by(/^TC/);if(!A||!B||!T)throw new Error('classes: '+d.classes.map(c=>c.name).join(','));
  d.cal.tt=[{id:'t1',type:'class',day:1,start:'08:00',end:'10:00',classId:A.id,room:'Terrain A'},{id:'t2',type:'class',day:1,start:'10:00',end:'12:00',classId:B.id,room:'Gymnase'},
    {id:'t3',type:'class',day:2,start:'08:00',end:'10:00',classId:T.id,room:'Terrain B'},{id:'t4',type:'class',day:3,start:'14:00',end:'16:00',classId:A.id,room:''},
    {id:'t5',type:'class',day:4,start:'08:00',end:'10:00',classId:B.id,room:'Terrain A'},{id:'t6',type:'class',day:4,start:'10:00',end:'12:00',classId:T.id,room:'Gymnase'},{id:'t7',type:'class',day:4,start:'14:00',end:'16:00',classId:A.id,room:'Terrain B'},
    {id:'t8',type:'as',day:3,start:'16:00',end:'19:00',classId:'',room:'Stade'},{id:'t9',type:'class',day:5,start:'08:00',end:'10:00',classId:T.id,room:'Gymnase'}];
  localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);
const home=async()=>{await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);};
await home();
const toCard=async()=>{await p.evaluate(()=>{const c=document.getElementById('ttCard');window.scrollTo(0,c.getBoundingClientRect().top+window.scrollY-70);});await sleep(500);};
if(SHOT){await p.addStyleTag({content:'header,#tabs,.fab,#fab,nav.tabs,.topbar,#toast{display:none!important}'});const card=await p.$('#ttCard');await toCard();await sleep(1500);await card.screenshot({path:'/tmp/v28t-'+SHOT+'.png',captureBeyondViewport:true});
  await p.evaluate(()=>document.querySelector('#ttCard [data-edit="t6"]').click());await sleep(700);
  await p.evaluate(()=>{const f=document.getElementById('ttForm');window.scrollTo(0,f.getBoundingClientRect().top+window.scrollY-80);});await sleep(1200);
  const f=await p.$('#ttForm');await f.screenshot({path:'/tmp/v28t-'+SHOT+'-form.png'});
  console.log('shot',SHOT,errs.length?'errors '+errs.join('|'):'ok');srv.close();await b.close();process.exit(0);}
const tt0=await p.evaluate(()=>JSON.stringify(window.CJR.db().cal.tt));
const cols0=await p.evaluate(()=>{const A=window.CJR,d=A.db();return JSON.stringify(d.classes.map(c=>A.colsOf(c.id,0)));});
const R=await p.evaluate(()=>{const q=s=>[...document.querySelectorAll(s)],g=id=>document.getElementById(id),wd=new Date().getDay();
  return {wd,chips:q('#ttCard .tw-chip').map(x=>x.querySelector('b').textContent+'='+x.querySelector('span').textContent),today:q('#ttCard .tw-chip.today').map(x=>x.dataset.ttjump),
    dayToday:q('#ttCard .tw-day.today').map(x=>x.id),badge:q('#ttCard .tw-day.today .tw-today').map(x=>x.textContent),days:q('#ttCard .tw-day').length,free:q('#ttCard .tw-free').length,
    slots:q('#ttCard .tw-slot[data-edit]').map(x=>x.dataset.edit+':'+[...x.classList].filter(c=>/^lv-/.test(c))[0]+':'+x.querySelector('.tw-time b').textContent+'-'+x.querySelector('.tw-time i').textContent),
    old:q('#ttCard .wk-row,#ttCard button.slot').length,keep:['ttCard','svcBox','svcTot','ttForm','ttDay','ttClass','ttStart','ttEnd','ttRoom','ttSave'].filter(x=>!g(x)),
    bar:(document.querySelector('#svcBox .svc-bar i')||{}).style?document.querySelector('#svcBox .svc-bar i').style.width:null,legend:q('#ttCard .tw-legend span').map(x=>x.textContent),
    sw:document.documentElement.scrollWidth,
    small:q('#ttCard .tw-add,#ttCard .tw-chip,#ttCard .tw-slot,#ttForm .actions .btn,#ttForm select,#ttForm input').filter(x=>{const r=x.getBoundingClientRect();return r.height<44||r.width<44||r.right>375.5||r.left<-0.5;}).map(x=>(x.id||x.className)+':'+Math.round(x.getBoundingClientRect().height))};});
check('puces Lun→Sam avec nombre de créneaux',R.chips.join(' ')==='Lun=2 Mar=1 Mer=2 Jeu=3 Ven=1 Sam=–',R.chips.join(' '));
if(R.wd>=1&&R.wd<=6)check('indicateur « aujourd’hui » : puce + carte du jour + badge (jour '+R.wd+')',R.today.join()===String(R.wd)&&R.dayToday.join()==='ttd'+R.wd&&R.badge.join()==='Aujourd’hui',JSON.stringify([R.today,R.dayToday,R.badge]));
else check('dimanche : aucun jour marqué « aujourd’hui »',R.today.length===0&&R.dayToday.length===0);
check('6 cartes de jour, « Pas de cours » pour le samedi',R.days===6&&R.free===1,R.days+'/'+R.free);
check('9 cartes de créneaux (data-edit), triées, couleur par niveau TC/1BAC/2BAC + ASS',R.slots.join(' ')==='t1:lv-2BAC:08:00-10:00 t2:lv-1BAC:10:00-12:00 t3:lv-TC:08:00-10:00 t4:lv-2BAC:14:00-16:00 t8:lv-as:16:00-19:00 t5:lv-1BAC:08:00-10:00 t6:lv-TC:10:00-12:00 t7:lv-2BAC:14:00-16:00 t9:lv-TC:08:00-10:00',R.slots.join(' '));
check('légende des niveaux + barre de service + identifiants conservés',R.legend.join()==='TC,1BAC,2BAC,ASS'&&/^\d+%$/.test(R.bar)&&R.keep.length===0&&R.old===0,JSON.stringify([R.legend,R.bar,R.keep,R.old]));
check('375 px : rien ne déborde, cibles ≥ 44 px (Ajouter, puces, créneaux, formulaire)',R.sw<=375&&R.small.length===0,R.sw+' '+JSON.stringify(R.small));
// puces → défilement vers le jour
await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>document.querySelector('#ttCard [data-ttjump="5"]').click());await sleep(900);
let y=await p.evaluate(()=>Math.round(document.getElementById('ttd5').getBoundingClientRect().top));check('puce « Ven » → fait défiler jusqu’au vendredi',y>-5&&y<200,String(y));
await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>document.querySelector('#ttCard .tw-h [data-ttadd]').click());await sleep(900);
let F=await p.evaluate(()=>{const f=document.getElementById('ttForm');return {top:Math.round(f.getBoundingClientRect().top),edit:f.classList.contains('edit'),del:!!document.getElementById('ttDel')};});
check('bouton « + Ajouter » → formulaire de nouveau créneau à l’écran',F.top>-5&&F.top<300&&!F.edit&&!F.del,JSON.stringify(F));
// modifier
await p.evaluate(()=>document.querySelector('#ttCard [data-edit="t6"]').click());await sleep(500);
F=await p.evaluate(()=>{const f=document.getElementById('ttForm'),g=id=>document.getElementById(id);return {edit:f.classList.contains('edit'),on:!!document.querySelector('.tw-slot.on[data-edit="t6"]'),day:g('ttDay').value,s:g('ttStart').value,e:g('ttEnd').value,room:g('ttRoom').value,del:!!g('ttDel')};});
check('appui sur un créneau → formulaire « modifier » pré-rempli (+ bouton Supprimer)',F.edit&&F.on&&F.day==='4'&&F.s==='10:00'&&F.e==='12:00'&&F.room==='Gymnase'&&F.del,JSON.stringify(F));
await p.evaluate(()=>{const r=document.getElementById('ttRoom');r.value='Salle couverte';r.dispatchEvent(new Event('input',{bubbles:true}));document.getElementById('ttSave').click();});await sleep(500);
let T=await p.evaluate(()=>window.CJR.db().cal.tt);let t6=T.find(x=>x.id==='t6');
check('modification enregistrée, même format (id,type,day,start,end,classId,room)',T.length===9&&t6.room==='Salle couverte'&&Object.keys(t6).sort().join()==='classId,day,end,id,room,start,type'&&t6.day===4&&t6.start==='10:00',JSON.stringify(t6));
// ajouter
await p.evaluate(()=>{const g=id=>document.getElementById(id),c=g('ttClass');g('ttDay').value='6';c.value=[...c.options].find(o=>o.value&&o.value!=='__as').value;g('ttStart').value='09:00';g('ttEnd').value='11:00';g('ttRoom').value='Terrain C';g('ttSave').click();});await sleep(500);
T=await p.evaluate(()=>window.CJR.db().cal.tt);let nw=T.find(x=>x.day===6);
const R2=await p.evaluate(()=>({sat:document.querySelectorAll('#ttd6 .tw-slot').length,chip:document.querySelector('[data-ttjump="6"] span').textContent}));
check('ajout enregistré (même format) et affiché le samedi',T.length===10&&nw&&Object.keys(nw).sort().join()==='classId,day,end,id,room,start,type'&&nw.type==='class'&&R2.sat===1&&R2.chip==='1',JSON.stringify([nw,R2]));
// supprimer : confirmation
await p.evaluate(id=>document.querySelector('#ttCard [data-edit="'+id+'"]').click(),nw.id);await sleep(400);ACCEPT=false;dlg=[];await p.evaluate(()=>document.getElementById('ttDel').click());await sleep(300);
let n=await p.evaluate(()=>window.CJR.db().cal.tt.length);check('Supprimer demande confirmation ; « Annuler » ne supprime rien',dlg.length===1&&n===10,JSON.stringify(dlg)+' '+n);
ACCEPT=true;await p.evaluate(()=>document.getElementById('ttDel').click());await sleep(400);n=await p.evaluate(()=>window.CJR.db().cal.tt.length);
check('confirmation acceptée → créneau supprimé',n===9);
await p.evaluate(()=>{const g=id=>document.getElementById(id);document.querySelector('#ttCard [data-edit="t6"]').click();});await sleep(300);
await p.evaluate(()=>{const g=id=>document.getElementById(id);g('ttRoom').value='Gymnase';g('ttSave').click();});await sleep(400);
const tt1=await p.evaluate(()=>JSON.stringify(window.CJR.db().cal.tt));check('après aller-retour, emploi du temps identique à l’original (données intactes)',tt1===tt0,tt1.length+' vs '+tt0.length);
const cols1=await p.evaluate(()=>{const A=window.CJR,d=A.db();return JSON.stringify(d.classes.map(c=>A.colsOf(c.id,0)));});check('dates des séances inchangées (colsOf)',cols1===cols0);
// mouvement réduit
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await home();
let tr=await p.evaluate(()=>[...document.querySelectorAll('#ttCard .tw-slot,#ttCard .tw-chip,#ttCard .tw-add')].map(x=>getComputedStyle(x).transitionDuration).filter(x=>!/^0s(, 0s)*$/.test(x)));
check('prefers-reduced-motion : aucune animation',tr.length===0,tr.join());
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);await home();
tr=await p.evaluate(()=>getComputedStyle(document.querySelector('#ttCard .tw-slot')).transitionDuration);check('micro-animation d’appui sinon (0,14 s)',/0\.14s/.test(tr),tr);
// contraste
const L=c=>{c=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];};const cr=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);const hx=h=>[1,3,5].map(i=>parseInt(h.substr(i,2),16));
const pairs=[['#0F766E','#E3F4F1'],['#6D28D9','#F1EAFE'],['#B54703','#FDEEE3'],['#1F5FA8','#E8EFF8'],['#8A5300','#FFF3DC']].map(([a,c])=>cr(hx(a),hx(c)));
check('contraste ≥ 4,5:1 des badges horaires / niveaux',pairs.every(x=>x>=4.5),pairs.map(x=>x.toFixed(2)).join(' / '));
// état vide
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.cal.tt=[];localStorage.setItem(KEY,JSON.stringify(d));},KEY);await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await home();
const E=await p.evaluate(()=>({e:!!document.getElementById('ttEmpty'),chips:document.querySelectorAll('#ttCard .tw-chip').length,days:document.querySelectorAll('#ttCard .tw-day').length,form:!!document.getElementById('ttForm')}));
check('état vide illustré (+ bouton Ajouter), formulaire toujours présent',E.e&&E.chips===0&&E.days===0&&E.form,JSON.stringify(E));
await p.evaluate(()=>document.querySelector('#ttEmpty [data-ttadd]').click());await sleep(800);y=await p.evaluate(()=>Math.round(document.getElementById('ttForm').getBoundingClientRect().top));
check('« + Ajouter un créneau » (état vide) → formulaire',y>-5&&y<400,String(y));
const keys=await p.evaluate(KEY=>Object.keys(JSON.parse(localStorage.getItem(KEY))).sort().join(','),KEY);check('aucune nouvelle clé de données',!/tw|chip|ttadd/i.test(keys),keys);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
