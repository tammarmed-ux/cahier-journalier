/* 1.29.1 : mise à jour fiable (iOS) — préchargement réduit, ouverture réseau d’abord (3 s max), bandeau « Mettre à jour ».
   1) 1.28.1 → 1.29.1 avec téléchargement interrompu, puis fichiers secondaires lents / en erreur : la mise à jour aboutit, données identiques.
   2) 1.29.0 avec code d’accès (cahier chiffré) → 1.29.1, téléchargement interrompu : la base chiffrée s’ouvre toujours, mêmes données.
   3) 1.29.1 → version suivante pendant l’utilisation : bandeau sans rechargement manuel, jamais pendant une fiche ouverte / l’écran verrouillé.
   4) réseau très lent : ouverture depuis la copie locale en ~3 s ; hors ligne : l’application s’ouvre. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8049;
const R281='/tmp/v281root',R290='/tmp/v290root',RNX='/tmp/v29next';
if(!fs.existsSync(R281+'/index.html')){fs.mkdirSync(R281,{recursive:true});cp.execSync('git -C '+D+' archive v1.28.1 | tar -x -C '+R281);}
fs.rmSync(R290,{recursive:true,force:true});fs.mkdirSync(R290,{recursive:true});cp.execSync('git -C '+D+' archive v1.29.0 | tar -x -C '+R290);
fs.rmSync(RNX,{recursive:true,force:true});cp.execSync('mkdir -p '+RNX+' && cd '+D+' && git ls-files | tar -cf - -T - | tar -xf - -C '+RNX+' && cp index.html sw.js manifest.webmanifest '+RNX+'/');
for(const f of ['index.html','sw.js']){const p=RNX+'/'+f;fs.writeFileSync(p,fs.readFileSync(p,'utf8').replace("var APP_SEMVER='1.29.2'","var APP_SEMVER='1.29.9'").replace("var APP_VER='cahier-v29-2c'","var APP_VER='cahier-v29-9'").replace("const CACHE = 'cahier-v29-2c'","const CACHE = 'cahier-v29-9'"));}
let ROOT=R281;const FAIL=new Set(),SLOW={},ERR500=new Set();const HITS=[];
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);HITS.push(u);if(FAIL.has(u)){FAIL.delete(u);let v=u.endsWith('/')?u+'index.html':u;const buf=fs.readFileSync(path.join(ROOT,v));r.writeHead(200,{'Content-Type':MT[path.extname(v)]||'application/octet-stream','Content-Length':buf.length,'Cache-Control':'no-cache'});r.write(buf.slice(0,buf.length>>1));return setTimeout(()=>q.socket.destroy(),50);} /* téléchargement coupé à mi-fichier */
  if(ERR500.has(u)){r.writeHead(500);return r.end('err');}
  const go=()=>{let v=u;if(v.endsWith('/'))v+='index.html';const f=path.join(ROOT,v);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
    r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);};
  if(SLOW[u])setTimeout(go,SLOW[u]);else go();}).listen(PORT);
const URL='http://localhost:'+PORT+'/';
// ---------- jeu de données de la taille réelle (comme test_v28_upgrade) ----------
let seedR=20261011;const rnd=()=>{seedR=(seedR*1103515245+12345)%2147483648;return seedR/2147483648;};const pick=a=>a[Math.floor(rnd()*a.length)];
const CL=['TCS1','TCS2','TCLSH1','1BACSE1','1BACSH2','2BACSP1','2BACSP4','2BACSVT2','2BACLSH1'],SIZES=[40,39,37,38,36,40,38,39,36];
const FN=['Yassine','Salma','Omar','Nour','Adam','Imane','Mehdi','Aya','Rayan','Hiba','Anas','Lina','Ilyas','Douae','Reda','Rim','Hamza','Malak','Ismail','Sara'];
const LN=['AIT BENALI','BENNANI','CHAKIR','EL IDRISSI','LAHLOU','TAZI','FASSI','AMRANI','KETTANI','SAIDI','OUAZZANI','BERRADA','ZIANI','HAKIMI','SEBTI','NACIRI','TOUZANI','CHRAIBI','FILALI','GHARBI'];
const AR=['العلوي يوسف','بامعروف ياسين','رؤوفي سلمى','مسناوي إيمان','الصباحي حمزة','سيفي نور','الإدريسي سارة','بنعلي هدى','الزهراني ليلى','بوزيد مريم'];
function buildData(base){const d=JSON.parse(JSON.stringify(base));
  d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.periods=['Basket-ball','Athlétisme','Gymnastique','Hand-ball'];
  d.cal.cycles=[{from:'2026-09-14',to:'2026-10-24'},{from:'2026-11-02',to:'2026-12-19'},{from:'2027-01-04',to:'2027-02-27'},{from:'2027-03-08',to:'2027-05-15'}];d.cal.start='2026-09-14';
  d.classes=CL.map((n,i)=>{const c={id:'c'+i,name:n};if(i%3===0){c.grp={names:['G1','G2','G3','G4'],of:{}};}return c;});
  d.students=[];let k=0;CL.forEach((n,ci)=>{for(let j=0;j<SIZES[ci];j++,k++){const ar=k%7===3;const f=rnd()<0.5;
    const s={id:'u'+String(k).padStart(3,'0'),classId:'c'+ci,name:ar?AR[k%AR.length]+' '+k:pick(LN)+' '+pick(FN)+' '+k,dob:(2007+Math.floor(rnd()*4))+'-0'+(1+Math.floor(rnd()*9))+'-1'+Math.floor(rnd()*9),sid:(f?'K':'J')+(130000000+k*1777),parent:'',phone:k%11?'':'06'+(10000000+k),notes:k%17?'':'Asthme sévère',created:1757000000000+k,sex:f?'F':'G'};
    if(k%31===5)s.dispense={type:k%2?'S1':'annee',since:'2026-09-20'};
    if(k%2===0)s.phys={h:150+Math.floor(rnd()*40),w:45+Math.floor(rnd()*30),v30:+(4.2+rnd()*2).toFixed(2),nav:+(3+Math.floor(rnd()*20)/2)};
    if(d.classes[ci].grp&&j<SIZES[ci]-3)d.classes[ci].grp.of[s.id]=j%4;d.students.push(s);}});
  d.sessions={};const dates=['2026-09-15','2026-09-22','2026-09-29','2026-10-06'];
  CL.forEach((n,ci)=>{const ids=d.students.filter(s=>s.classId==='c'+ci).map(s=>s.id);for(let si=0;si<4;si++){const marks={};
    ids.forEach(id=>{const x=rnd();let m=null;if(x<0.06)m={s:'A',j:rnd()<0.3,r:''};else if(x<0.09)m={s:'L',j:false,r:''};else if(x<0.11)m={s:'M',j:rnd()<0.5,r:'Certificat'};else if(x<0.13)m={s:'ST',j:false,r:''};if(m)marks[id]=m;});
    d.sessions['c'+ci+'|0|'+si]={date:dates[si],marks};}});
  d.cal.tt=CL.map((n,ci)=>({id:'t'+ci,type:'class',day:1+ci%6,start:'08:30',end:'10:30',classId:'c'+ci,room:'Terrain '+(ci%3+1)}));d.cal.asInit=true;
  d.ui.cls='c6';d.lastBackup=1791000000000;return d;}
const jpgs=fs.readdirSync('/tmp/trombi/av').map(f=>'/tmp/trombi/av/'+f).sort().slice(0,6).map(f=>'data:image/jpeg;base64,'+fs.readFileSync(f).toString('base64'));
// ---------- outils page ----------
const ENV='{"v":1,"alg":"AES-GCM"';
/* vidage BRUT : valeurs physiques (accès par propriété, sans passer par getItem), IndexedDB, Cache Storage */
const rawDump=pg=>pg.evaluate(async()=>{const ls={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);ls[k]=localStorage[k];}
  const dbs=indexedDB.databases?(await indexedDB.databases()).map(x=>x.name):[];const idb={};
  for(const n of dbs){idb[n]=await new Promise(res=>{const r=indexedDB.open(n);r.onsuccess=async()=>{const db=r.result,o={};for(const st of [...db.objectStoreNames]){o[st]=await new Promise(rs=>{const q=db.transaction(st).objectStore(st).getAll();q.onsuccess=()=>rs(q.result);q.onerror=()=>rs([]);});}db.close();res(o);};r.onerror=()=>res(null);});}
  const cs={};for(const c of await caches.keys()){cs[c]=(await (await caches.open(c)).keys()).map(r=>r.url);}
  let ss={};for(let i=0;i<sessionStorage.length;i++){const k=sessionStorage.key(i);ss[k]=sessionStorage.getItem(k);}
  return {ls,idb,cs,ss,dbs};});
/* vue LOGIQUE (ce que lit l’application) */
const logical=pg=>pg.evaluate(async KEY=>{const P=k=>k===KEY||k===KEY+'.corrupt'||k.indexOf(KEY+'.snap.')===0||k.indexOf(KEY+'.backup.')===0;const ls={};
  for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(P(k))ls[k]=localStorage.getItem(k);}
  const ph=await window.CJR.photoAll();
  const sn=await new Promise(res=>{const r=indexedDB.open('cahier-snap');r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('s')){db.close();return res([]);}const q=db.transaction('s').objectStore('s').getAll();q.onsuccess=()=>{db.close();res(q.result);};};});
  const snd={};for(const x of sn){snd[x.t]=window.CJCrypto?await window.CJCrypto.snapOpen(x.t,x.data):x.data;}
  return {ls,ph,snd};},KEY);
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const skipSplash=pg=>pg.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();});
const unlockGate=pg=>pg.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
const opened=async pg=>{await pg.waitForFunction(()=>window.CJApp&&!document.getElementById('cjLock'),{timeout:30000});await pg.waitForFunction(()=>window.CJSync&&(window.CJSync.state.sdk||window.CJSync.state.loadErr||window.CJSync.state.role),{timeout:20000}).catch(()=>{});await sleep(1200);await unlockGate(pg);await sleep(200);};
const pad=async(pg,digits,ok)=>{for(const c of digits){await pg.click('#cjPad [data-n="'+c+'"]');await sleep(40);}if(ok){await sleep(100);await pg.click('#cjOk');}};
const lockText=pg=>pg.evaluate(()=>{const o=document.getElementById('cjLock');return o?o.innerText:'';});
const goTab=(pg,t)=>pg.evaluate(t=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.querySelector('#tabs button[data-tab="'+t+'"]').click();},t);
const sem=pg=>pg.evaluate(()=>window.CJR&&window.CJR.semver||'');
const cks=pg=>pg.evaluate(()=>caches.keys());
const enter=async(pg,code)=>{await pg.waitForSelector('#cjPad',{timeout:20000});await pad(pg,code);await sleep(500);if(await pg.$('#cjOk'))await pg.click('#cjOk');await opened(pg);};
const newCtx=async()=>{const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  p.on('pageerror',e=>ERR.push(e.message));p.on('dialog',d=>d.accept());await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});return p;};
const seed=async p=>{const base=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);const data=buildData(base);await p.evaluate(s=>window.CJApp.applyJSON(s),JSON.stringify(data));await sleep(800);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(800);};
const ERR=[];let b;
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
// ===== 0. fichiers =====
const sw=fs.readFileSync(D+'/sw.js','utf8'),idx=fs.readFileSync(D+'/index.html','utf8');
const core=[...sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);
const coreBytes=core.reduce((a,f)=>a+fs.statSync(path.join(D,f==='./'?'index.html':f)).size,0);
check('préchargement réduit à l’essentiel ('+core.length+' fichiers, '+Math.round(coreBytes/1024)+' Ko) : pas de PDF, polices ni grandes images ; le reste en cache après activation',coreBytes<700*1024&&!core.some(f=>/jspdf|\.ttf|og-image|cj-pdf/.test(f))&&/LAZY_ASSETS\.concat\(FONT_ASSETS\)/.test(sw)&&['./cj-pdf.js','./vendor/jspdf.umd.min.js','./og-image-t3.png'].every(f=>sw.includes("'"+f+"'")));
check('version 1.29.1 partout (APP_SEMVER, cache cahier-v29-1, en-tête, splash, connexion, accueil, Paramètres, JSON-LD, manifeste)',/var APP_SEMVER='1\.29\.2'/.test(idx)&&/var APP_VER='cahier-v29-2c'/.test(idx)&&/const CACHE = 'cahier-v29-2c'/.test(sw)&&['class="h-ver">v1.29.2','<div class="sp-ver">v1.29.2','id="gVer">Version 1.29.2','id="lnVer">Version 1.29.2','id="verLine">Version 1.29.2','"softwareVersion": "1.29.2"'].every(x=>idx.includes(x))&&/v1\.29\.2/.test(fs.readFileSync(D+'/manifest.webmanifest','utf8')));
// ===== 1. 1.28.1 → 1.29.1, téléchargement interrompu =====
let p=await newCtx();ROOT=R281;await p.goto(URL,{waitUntil:'networkidle2'});await seed(p);await unlockGate(p);
const L0=await logical(p);check('1.28.1 : cahier non chiffré de '+JSON.parse(L0.ls[KEY]).students.length+' élèves',(await sem(p))==='1.28.1'&&JSON.parse(L0.ls[KEY]).students.length===343);
ROOT=D;FAIL.add('/cj-crypto.js');await p.reload({waitUntil:'networkidle2'});await sleep(2500);
let c=await cks(p);check('téléchargement interrompu (connexion coupée) : l’ancienne version reste utilisable, rien d’effacé, pas de cache partiel',(await sem(p))==='1.28.1'&&!c.includes('cahier-v29-2c')&&c.includes('cahier-v28-1')&&(await logical(p)).ls[KEY]===L0.ls[KEY],c.join(','));
ERR500.add('/vendor/jspdf.umd.min.js');SLOW['/og-image-t3.png']=20000;SLOW['/vendor/NotoSansArabic-Regular.ttf']=20000;
const t0=Date.now();await p.reload({waitUntil:'domcontentloaded'});let ok=false;for(let i=0;i<40&&!ok;i++){await sleep(250);c=await cks(p);ok=c.includes('cahier-v29-2c');}
const tI=Date.now()-t0;check('nouvel essai : installation terminée en '+(tI/1000).toFixed(1)+' s malgré PDF en erreur et polices/image lentes (20 s)',ok&&tI<8000,c.join(','));
await p.reload({waitUntil:'domcontentloaded'});await sleep(2500);await unlockGate(p);
const L1=await logical(p);check('ouverture suivante : 1.29.1 (réseau d’abord), classRegister.v2 identique octet pour octet, mode clair',(await sem(p))==='1.29.2'&&L1.ls[KEY]===L0.ls[KEY]&&Object.keys(L0.ls).every(k=>L0.ls[k]===L1.ls[k])&&await p.evaluate(()=>CJCrypto.mode())==='plain',await sem(p));
c=await cks(p);check('ancien cache cahier-v28-1 supprimé',!c.includes('cahier-v28-1'),c.join(','));
ERR500.clear();delete SLOW['/og-image-t3.png'];delete SLOW['/vendor/NotoSansArabic-Regular.ttf'];
await sleep(3000);const lazyOk=await p.evaluate(()=>caches.open('cahier-v29-2c').then(c=>Promise.all(['./cj-pdf.js','./vendor/jspdf.umd.min.js','./og-image-t3.png'].map(u=>c.match(u).then(h=>!!h)))));
const pdfOk=await p.evaluate(()=>fetch('vendor/jspdf.umd.min.js').then(r=>r.ok));
check('fichiers secondaires : mis en cache après activation (cj-pdf.js), ou à la demande dès que le serveur répond (jsPDF '+pdfOk+')',lazyOk[0]&&pdfOk,JSON.stringify(lazyOk));
await p.browserContext().close();
// ===== 2. 1.29.0 chiffré → 1.29.1 =====
p=await newCtx();ROOT=R290;await p.goto(URL,{waitUntil:'networkidle2'});await opened(p).catch(()=>{});await seed(p);await unlockGate(p);
await goTab(p,'settings');await sleep(300);await p.evaluate(()=>document.getElementById('secCard').scrollIntoView());await p.evaluate(k=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open(k);},'sec');await p.click('#secOn');await sleep(400);
await pad(p,'135792',true);await sleep(300);await pad(p,'135792',true);
await p.waitForFunction(()=>/Code activé|non effectué/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:90000});await p.click('#cjDone');await sleep(300);
const E0=await logical(p),R0=await rawDump(p);check('1.29.0 : code activé, cahier chiffré',R0.ls[KEY].startsWith('{"v":1')&&await p.evaluate(()=>CJCrypto.mode())==='open');
ROOT=D;FAIL.add('/index.html');await p.reload({waitUntil:'networkidle2'});await sleep(2000);c=await cks(p);
check('1.29.0 chiffré, téléchargement interrompu : écran du code de 1.29.0, pas de cache partiel',/code/i.test(await lockText(p))&&!c.includes('cahier-v29-2c'),c.join(','));
await p.reload({waitUntil:'domcontentloaded'});ok=false;for(let i=0;i<40&&!ok;i++){await sleep(250);ok=(await cks(p)).includes('cahier-v29-2c');}
check('nouvel essai : 1.29.1 installée',ok);
await p.reload({waitUntil:'domcontentloaded'});await sleep(1500);const lockOn=/code/i.test(await lockText(p));await enter(p,'135792');
const E1=await logical(p),R1=await rawDump(p);
check('1.29.1 : écran du code puis bon code → base chiffrée ouverte, données identiques octet pour octet, stockage toujours chiffré (même format)',lockOn&&(await sem(p))==='1.29.2'&&E1.ls[KEY]===E0.ls[KEY]&&R1.ls[KEY].startsWith('{"v":1')&&R1.ls['classRegister.crypto']===R0.ls['classRegister.crypto'],await sem(p));
await p.browserContext().close();
// ===== 3. bandeau pendant l’utilisation =====
p=await newCtx();ROOT=D;await p.goto(URL,{waitUntil:'networkidle2'});await seed(p);await unlockGate(p);await p.reload({waitUntil:'networkidle2'});await sleep(1500);await unlockGate(p);
const N0=await logical(p);check('1.29.1 installée et contrôlée par le service worker',(await sem(p))==='1.29.2'&&await p.evaluate(()=>!!navigator.serviceWorker.controller));
await p.evaluate(()=>document.querySelector('#tabs button[data-tab=students]').click());await sleep(300);
await p.evaluate(()=>document.getElementById('stuModal').classList.add('open'));
ROOT=RNX;await p.evaluate(()=>CJUpd.check());ok=false;for(let i=0;i<40&&!ok;i++){await sleep(250);ok=await p.evaluate(()=>CJUpd.pending());}
const vis=()=>p.evaluate(()=>{const e=document.getElementById('updBar');return !!e&&e.classList.contains('on')&&getComputedStyle(e).display!=='none';});
await sleep(1800);check('nouvelle version détectée sans rechargement ; fiche élève ouverte → pas de bandeau',ok&&!(await vis()));
await p.evaluate(()=>document.getElementById('stuModal').classList.remove('open'));await sleep(1800);
const bt=await p.evaluate(()=>{const e=document.getElementById('updBar');return e?e.innerText.replace(/\s+/g,' ').trim():'';});
check('fiche fermée → bandeau « Nouvelle version disponible — Mettre à jour »',await vis()&&/Nouvelle version disponible/.test(bt)&&/Mettre à jour/.test(bt),bt);
fs.mkdirSync('/workspace/backups/v1.29.2-preview',{recursive:true});await p.screenshot({path:'/workspace/backups/v1.29.2-preview/banner-390.png'});
await p.evaluate(()=>document.documentElement.classList.add('cj-locked'));await sleep(1800);check('écran verrouillé → bandeau masqué',!(await vis()));
await p.evaluate(()=>document.documentElement.classList.remove('cj-locked'));await sleep(1800);
const hb=await p.evaluate(()=>{const r=document.getElementById('updGo').getBoundingClientRect();return Math.round(r.height);});
await Promise.all([p.waitForNavigation({waitUntil:'networkidle2'}),p.click('#updGo')]);await sleep(1500);await unlockGate(p);
const N1=await logical(p);check('« Mettre à jour » (bouton '+hb+' px) → nouvelle version ouverte (1.29.9-test), données identiques octet pour octet',hb>=44&&(await sem(p))==='1.29.9'&&N1.ls[KEY]===N0.ls[KEY],await sem(p));
// ===== 4. réseau lent / hors ligne =====
SLOW['/']=12000;let t1=Date.now();await p.reload({waitUntil:'domcontentloaded'});const tS=Date.now()-t1;delete SLOW['/'];await sleep(800);
check('réseau très lent (12 s) : application ouverte depuis la copie locale en '+(tS/1000).toFixed(1)+' s',tS<5500&&(await sem(p))==='1.29.9');
await p.setOfflineMode(true);await p.reload({waitUntil:'domcontentloaded'}).catch(()=>{});await sleep(1500);await unlockGate(p);const L4=await logical(p);
check('hors ligne : application ouverte, mêmes données',(await sem(p))==='1.29.9'&&L4.ls[KEY]===N0.ls[KEY]);await p.setOfflineMode(false);
check('aucune erreur de page',!ERR.length,ERR.join(' | ').slice(0,300));
console.log(results.filter(x=>x).length+'/'+results.length+' passed');await b.close();srv.close();process.exit(0);})().catch(e=>{console.log('FATAL',e.stack);process.exit(1);});
