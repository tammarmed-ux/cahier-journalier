/* 1.29.1 (-r) : tableau de service — variante B (onglets de jours + frise), purement visuel ; date simulée : mardi 20/10/2026 */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8019);
const URL='http://localhost:8019/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.evaluateOnNewDocument((TH)=>{const T0=new Date(2026,9,20,+(sessionStorage.getItem('fakeH')||10),+(sessionStorage.getItem('fakeM')||50)).getTime(),OD=Date,off=T0-OD.now();class FD extends OD{constructor(...a){if(!a.length)super(OD.now()+off);else super(...a);}static now(){return OD.now()+off;}}window.Date=FD;try{if(TH)localStorage.setItem('cj.theme',TH);else localStorage.removeItem('cj.theme');}catch(e){}},process.env.THEME||'');
await p.goto(URL,{waitUntil:'networkidle2'});
const DD=JSON.parse(fs.readFileSync(__dirname+'/tests_data/creneaux.json','utf8'));
await p.goto(URL,{waitUntil:'networkidle2'});
await p.evaluate((KEY,DD)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.classes=DD.classes.map((n,i)=>({id:'c'+i,name:n}));d.students=d.classes.map((c,i)=>({id:'s'+i,classId:c.id,name:'Élève '+i,sex:'G',sid:'J1'+i,dob:'',parent:'',phone:'',notes:'',created:1}));
  d.cal=d.cal||{};d.cal.tt=DD.tt.map((x,i)=>x[3]==='AS'?{id:'tAS',type:'as',day:x[0],start:x[1],end:x[2],classId:'',room:''}:{id:'t'+i,type:'class',day:x[0],start:x[1],end:x[2],classId:'c'+DD.classes.indexOf(x[3]),room:x[4]});
  d.ui.cls='c0';localStorage.setItem(KEY,JSON.stringify(d));},KEY,DD);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);
await p.evaluate(()=>{const c=document.querySelector('#ttCard .tw-chips');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-120);});await sleep(300);

const q=()=>p.evaluate(()=>{const Q=s=>[...document.querySelectorAll(s)];return {sel:Q('#ttCard .tw-chip.sel').map(x=>x.dataset.ttjump).join(),today:Q('#ttCard .tw-chip.today').map(x=>x.dataset.ttjump).join(),
  dots:Q('#ttCard .tw-chip').map(c=>[...c.querySelectorAll('.tw-dots i')].map(i=>i.className.replace('lv-','')).join('.')).join(' '),
  seq:Q('#ttCard .tw-tl > *').map(e=>e.classList.contains('tw-slot')?'S:'+e.dataset.edit+(e.classList.contains('cur')?'*':'')+((e.querySelector('.tw-now')||{}).textContent?'['+e.querySelector('.tw-now').textContent+']':''):e.classList.contains('tw-pause')?'P:'+e.textContent:e.classList.contains('tw-nowln')?'N:'+e.textContent:'?'),
  prog:(document.querySelector('#ttCard .tw-slot.cur .tw-prog i')||{style:{}}).style.width,meta:Q('#ttCard .tw-slot .tw-meta').map(m=>m.textContent),head:(document.querySelector('#ttCard .tw-dh')||{}).textContent,
  svc:!!document.getElementById('svcTot')&&document.getElementById('svcTot').textContent};});
let R=await q();
check('aujourd’hui (mardi) sélectionné par défaut',R.sel==='2'&&R.today==='2',R.sel+'/'+R.today);
check('pastilles de niveau sur les onglets (dans l’ordre des créneaux)',R.dots==='2BAC.TC.1BAC TC.2BAC.1BAC 1BAC.2BAC.TC 2BAC.TC 1BAC.as 2BAC.TC.2BAC',R.dots);
check('frise du mardi : créneau en cours (badge « En cours »), ligne 10:50, pause, créneau suivant',JSON.stringify(R.seq)===JSON.stringify(['S:t3','S:t4*[En cours]','N:10:50','P:Pause 12:30 – 14:30','S:t5']),JSON.stringify(R.seq));
check('progression du créneau en cours (20 min / 2 h = 17 %)',R.prog==='17%',R.prog);
check('lieu + durée ; « Lieu non précisé » si vide',JSON.stringify(R.meta)===JSON.stringify(['Terrain 12 h','Terrain 12 h','Lieu non précisé2 h']),JSON.stringify(R.meta));
check('en-tête du jour : Mardi · Aujourd’hui · 3 créneaux · 6 h',/^MardiAujourd’hui3 créneaux · 6 h$/.test(R.head),R.head);
check('total du service conservé',R.svc==='33 h / 21 h',R.svc);
await p.evaluate(()=>document.querySelector('#ttCard [data-ttjump="5"]').click());await sleep(250);R=await q();
check('vendredi : ASS affichée (« pas de séance à noter »), pas de ligne horaire hors jour',R.sel==='5'&&R.seq.join()==='S:t11,P:Pause 12:30 – 15:00,S:tAS'&&R.meta[1]==='pas de séance à noter3 h',JSON.stringify(R));
const tt0=await p.evaluate(()=>JSON.stringify(window.CJR.db().cal.tt));
await p.evaluate(()=>document.querySelector('#ttCard [data-edit="tAS"]').click());await sleep(300);
let F=await p.evaluate(()=>({edit:document.getElementById('ttForm').classList.contains('edit'),cls:document.getElementById('ttClass').value,on:!!document.querySelector('#ttCard .tw-slot.on[data-edit="tAS"]')}));
check('toucher une carte → formulaire « modifier » (ASS)',F.edit&&F.cls==='__as'&&F.on,JSON.stringify(F));
await p.evaluate(()=>{const g=id=>document.getElementById(id);g('ttDay').value='6';g('ttSave').click();});await sleep(300);R=await q();
check('enregistrer sur un autre jour → ce jour affiché',R.sel==='6'&&R.seq.includes('S:tAS'),JSON.stringify(R.seq));
await p.evaluate(()=>{document.querySelector('#ttCard [data-edit="tAS"]').click();});await sleep(200);await p.evaluate(()=>{const g=id=>document.getElementById(id);g('ttDay').value='5';g('ttSave').click();});await sleep(300);
check('aller-retour : créneaux identiques (aucune donnée changée)',await p.evaluate(()=>JSON.stringify(window.CJR.db().cal.tt))===tt0);
// avant les cours : « À suivre » et ligne avant le 1er créneau
await p.evaluate(()=>{sessionStorage.setItem('fakeH','7');sessionStorage.setItem('fakeM','40');});await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(300);R=await q();
check('7 h 40 : ligne horaire avant le 1er créneau, « À suivre »',R.seq.join()==='N:07:40,S:t3[À suivre],S:t4,P:Pause 12:30 – 14:30,S:t5',R.seq.join());
await p.evaluate(()=>{sessionStorage.setItem('fakeH','13');sessionStorage.setItem('fakeM','05');});await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(300);R=await q();
check('13 h 05 : ligne horaire dans la pause',R.seq.join()==='S:t3,S:t4,N:13:05,P:Pause 12:30 – 14:30,S:t5[À suivre]',R.seq.join());
for(const T of ['','terrain','neon']){await p.evaluate(T=>{if(T)document.documentElement.setAttribute('data-theme',T);else document.documentElement.removeAttribute('data-theme');},T);await sleep(120);
  const a=await p.evaluate(()=>{function L(c){const m=c.match(/[\d.]+/g).map(Number);const a=m.slice(0,3).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
    function bg(e){while(e){const gi=getComputedStyle(e).backgroundImage,gm=/gradient/.test(gi)&&gi.match(/rgba?\([^)]*\)/g);if(gm)return gm.reduce((w,c)=>L(c)>L(w)?c:w);   /* dégradé : la couleur la plus claire (cas le plus défavorable pour un texte clair) */
    const c=getComputedStyle(e).backgroundColor,m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>.9))return c;e=e.parentElement;}return 'rgb(255,255,255)';}
    const r=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05),bad=[];let n=0;document.querySelectorAll('#ttCard .tw-chips *,#ttCard .tw-day *').forEach(e=>{if(![...e.childNodes].some(t=>t.nodeType===3&&t.textContent.trim()))return;n++;const k=r(L(getComputedStyle(e).color),L(bg(e)));if(k<4.5)bad.push(e.textContent.trim().slice(0,12)+' '+k.toFixed(2));});return {n,bad};});
  check('contraste AA de la frise et des onglets – thème '+(T||'actuel'),a.n>15&&a.bad.length===0,JSON.stringify(a));}
// 1.29.1 (-s) : formulaire replié / compact
await p.evaluate(()=>document.documentElement.removeAttribute('data-theme'));
const FS=()=>p.evaluate(()=>{const f=document.getElementById('ttForm'),fr=f.getBoundingClientRect(),b=document.getElementById('ttBody');return {exp:document.getElementById('ttTog').getAttribute('aria-expanded'),hid:b.hidden,h:Math.round(fr.height),edit:f.classList.contains('edit'),title:document.getElementById('ttTog').textContent,
  inp:[...f.querySelectorAll('select,input')].map(i=>{const r=i.getBoundingClientRect();return {id:i.id,l:r.left,r:r.right,t:Math.round(r.top),h:Math.round(r.height)};}),fl:fr.left,frr:fr.right};});
let G=await FS();check('formulaire replié par défaut : une ligne « Ajouter un créneau » + chevron (≤ 64 px)',G.exp==='false'&&G.hid&&G.h<=64&&G.title==='Ajouter un créneau',JSON.stringify([G.exp,G.hid,G.h,G.title]));
await p.evaluate(()=>document.getElementById('ttTog').click());await sleep(200);G=await FS();
const I=Object.fromEntries(G.inp.map(x=>[x.id,x]));
check('ouvert : Jour + Classe sur une ligne, Début + Fin sur une ligne, champs de 44 px',!G.hid&&G.exp==='true'&&I.ttDay.t===I.ttClass.t&&I.ttStart.t===I.ttEnd.t&&G.inp.every(x=>x.h===44),JSON.stringify(G.inp));
check('aucun champ ne dépasse du formulaire (Fin compris)',G.inp.every(x=>x.l>=G.fl-0.5&&x.r<=G.frr+0.5),JSON.stringify(G.inp.map(x=>x.id+':'+Math.round(x.r)))+' / '+Math.round(G.frr));
check('formulaire ouvert compact (≤ 400 px)',G.h<=400,String(G.h));
await p.evaluate(()=>document.getElementById('ttTog').click());await sleep(200);G=await FS();check('re-toucher : replié',G.hid&&G.exp==='false');
await p.evaluate(()=>document.querySelector('#ttCard .tw-slot[data-edit]').click());await sleep(300);G=await FS();
check('toucher une carte : formulaire ouvert automatiquement en mode « modifier »',!G.hid&&G.edit&&G.exp==='true',JSON.stringify([G.hid,G.edit,G.title]));
await p.evaluate(()=>document.getElementById('ttCancel').click());await sleep(300);G=await FS();check('Annuler : formulaire replié',G.hid&&!G.edit);
await p.evaluate(()=>document.querySelector('#ttCard .tw-h [data-ttadd]').click());await sleep(500);G=await FS();check('bouton « Ajouter » en haut : ouvre le formulaire',!G.hid&&!G.edit);
for(const T of ['terrain','neon']){await p.evaluate(T=>document.documentElement.setAttribute('data-theme',T),T);await sleep(120);
  const c=await p.evaluate(()=>{function L(c){const m=c.match(/[\d.]+/g).map(Number);const a=m.slice(0,3).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
    function bg(e){while(e){const c=getComputedStyle(e).backgroundColor,m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>.9))return c;e=e.parentElement;}return 'rgb(255,255,255)';}
    const r=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);return [...document.querySelectorAll('#ttTog span,#ttForm label.f')].map(e=>r(L(getComputedStyle(e).color),L(bg(e))));});
  check('formulaire lisible (AA) – thème '+T,c.every(x=>x>=4.5),c.map(x=>x.toFixed(1)).join(' '));}
await p.evaluate(()=>document.documentElement.removeAttribute('data-theme'));
const keys=await p.evaluate(()=>Object.keys(localStorage).filter(k=>/tt|ttSel|creneau/i.test(k)));check('aucune clé de stockage ajoutée',keys.length===0,keys.join());
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
