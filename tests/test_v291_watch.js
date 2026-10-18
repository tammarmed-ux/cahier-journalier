/* 1.29.1 (-q) : « Élèves à surveiller » repliable (fermé par défaut, cj.ui.watchOpen) ; seuil d’absences non justifiées compté PAR CYCLE */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8017);
const URL='http://localhost:8017/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes.find(x=>x.name==='2BACSP4');d.settings.threshold=5;d.settings.points={A:0,L:0,M:0,K:0,S:0.5,J:0};
  const N=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','DAOUDI Imane'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13000000'+i,dob:'',parent:'',phone:'',notes:'',created:1}));
  d.sessions={};const put=(per,s,id,m)=>{const k=c.id+'|'+per+'|'+s;d.sessions[k]=d.sessions[k]||{date:'',marks:{}};if(id)d.sessions[k].marks[id]=m;};
  for(let s=0;s<8;s++){put(0,s,null);put(1,s,null);}
  for(let s=0;s<3;s++){put(0,s,'s0',{s:'A',j:false,r:''});put(1,s,'s0',{s:'A',j:false,r:''});}   /* 3 + 3 = 6 sur l’année, 3 par cycle */
  for(let s=0;s<5;s++)put(1,s,'s1',{s:'A',j:false,r:''});   /* 5 dans le cycle 2 */
  for(let s=0;s<6;s++)put(0,s,'s2',{s:'ST',j:false,r:''});   /* note comportementale atteinte (6 × 0,5 = 3) */
  for(let s=0;s<4;s++)put(0,s,'s3',{s:'A',j:false,r:''});
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const home=async()=>{await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);};
const W=()=>p.evaluate(()=>{const c=document.getElementById('homeWatch'),b=document.getElementById('watchTog'),w=document.getElementById('watchBody');
  return {open:c.classList.contains('open'),aria:b&&b.getAttribute('aria-expanded'),hidden:w.hidden,vis:w.getBoundingClientRect().height>0,chip:(c.querySelector('h2 .chip')||{}).textContent,
    chev:!!c.querySelector('h2 button svg.wt-c'),note:(w.querySelector('p')||{}).textContent,items:[...w.querySelectorAll('li[data-wsid]')].map(l=>l.dataset.wsid+':'+[...l.querySelectorAll('.chip')].map(x=>x.textContent).join('+')),
    ls:localStorage.getItem('cj.ui.watchOpen'),tile:(document.querySelector('[data-qa="watch"] b')||{}).textContent};});
const DATA0=await p.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K));return JSON.stringify([d.students,d.sessions,d.settings,d.classes]);},KEY);
const K0=await p.evaluate(()=>Object.keys(localStorage).sort().join());
await home();let w=await W();
check('carte fermée par défaut : en-tête titre + badge + chevron, liste masquée',!w.open&&w.aria==='false'&&w.hidden&&!w.vis&&w.chev&&w.chip==='2',JSON.stringify(w));
check('règle par cycle : 2 élèves (5 non just. dans C2 ; note comp. C1) — pas 6 sur l’année en 3 + 3',w.chip==='2'&&w.tile==='2',w.chip+' '+w.tile);
await p.click('#watchTog');await sleep(200);w=await W();
check('toucher l’en-tête : la carte s’ouvre (aria-expanded, cj.ui.watchOpen = 1)',w.open&&w.aria==='true'&&!w.hidden&&w.vis&&w.ls==='1',JSON.stringify(w));
check('badges : « note comp. C1 » et « 5 non just. C2 » ; élèves à 3 + 3 et 4 absents',JSON.stringify(w.items)===JSON.stringify(['s2:note comp. C1','s1:5 non just. C2']),JSON.stringify(w.items));
check('description : « …ou au moins 5 absences non justifiées dans un cycle. »',w.note==='Note comportementale atteinte dans un cycle, ou au moins 5 absences non justifiées dans un cycle.',w.note);
if(process.env.SHOTS){await p.evaluate(()=>{const c=document.getElementById('homeWatch');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-110);});await sleep(200);await p.screenshot({path:'/workspace/backups/v1.29.1-preview/surveiller-ouvert.png'});}
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await home();w=await W();
check('état ouvert conservé après rechargement',w.open&&!w.hidden);
await p.click('#watchTog');await sleep(200);w=await W();
check('re-toucher : refermée (cj.ui.watchOpen = 0)',!w.open&&w.hidden&&w.ls==='0'&&w.aria==='false');
if(process.env.SHOTS){await p.evaluate(()=>{const c=document.getElementById('homeWatch');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-300);});await sleep(200);await p.screenshot({path:'/workspace/backups/v1.29.1-preview/surveiller-ferme.png'});}
await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>document.querySelector('[data-qa="watch"]').click());await sleep(500);w=await W();
check('mini-indicateur « alertes » : ouvre la carte',w.open&&!w.hidden);
const tb=await p.evaluate(()=>{const b=document.getElementById('watchTog').getBoundingClientRect();return Math.round(b.height);});check('en-tête : cible ≥ 44 px',tb>=44,tb);
// 6 dans un cycle → 1 badge par cycle
await p.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K)),c=d.classes.find(x=>x.name==='2BACSP4');d.sessions[c.id+'|0|5'].marks.s3={s:'A',j:false,r:''};localStorage.setItem(K,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await home();w=await W();
check('élève à 5 dans C1 ajouté (« 5 non just. C1 »)',w.chip==='3'&&w.items.includes('s3:5 non just. C1'),JSON.stringify(w.items));
const DATA1=await p.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K));return JSON.stringify([d.students,d.settings,d.classes]);},KEY);
check('données inchangées (élèves, réglages, classes)',DATA1===JSON.stringify(JSON.parse(DATA0).filter((x,i)=>i!==1)));
const K1=await p.evaluate(()=>Object.keys(localStorage).sort());check('une seule nouvelle clé, d’affichage : cj.ui.watchOpen',K1.filter(k=>!K0.split(',').includes(k)).every(k=>k==='cj.ui.watchOpen'||/^classRegister\.v2\.snapm?\.\d+$|^cahier\.snapDay$/.test(k)),JSON.stringify(K1.filter(k=>!K0.split(',').includes(k))));
for(const T of ['terrain','neon']){await p.evaluate(T=>document.documentElement.setAttribute('data-theme',T),T);await sleep(100);
  const c=await p.evaluate(()=>{function L(c){const m=c.match(/[\d.]+/g).map(Number);const a=m.slice(0,3).map(x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4});return .2126*a[0]+.7152*a[1]+.0722*a[2];}
    function bg(e){while(e){const c=getComputedStyle(e).backgroundColor,m=c.match(/[\d.]+/g);if(m&&(m.length<4||+m[3]>.9))return c;e=e.parentElement;}return 'rgb(255,255,255)';}
    const e=document.querySelector('#homeWatch .wt-t'),r=(a,b)=>(Math.max(a,b)+.05)/(Math.min(a,b)+.05);return r(L(getComputedStyle(e).color),L(bg(e)));});
  check('titre lisible (AA) thème '+T,c>=4.5,c.toFixed(2));}
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
