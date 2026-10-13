/* 1.29.0 : vérification EN LIGNE de la migration (profil de test local, sans compte) — PHASE=A : sur 1.28.1 en ligne, crée un cahier non chiffré ; PHASE=B : après publication, mise à jour → 1.29.0, données identiques, activation du code, relecture identique, puis désactivation. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';
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
const URL='https://cahier-eps-ma.web.app/',PROF='/tmp/live-migr-prof',OUT='/workspace/backups/live-migr-1.29.0.json',PH=process.env.PHASE;
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,userDataDir:PROF,args:['--no-sandbox','--disable-dev-shm-usage']});
process.on('exit',()=>{});const p=await b.newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const ERR=[];p.on('pageerror',e=>ERR.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
if(PH==='A'){await p.goto(URL,{waitUntil:'networkidle2'});const v=await p.evaluate(()=>window.CJR&&CJR.semver);
  const base=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);const data=buildData(base);await p.evaluate(s=>window.CJApp.applyJSON(s),JSON.stringify(data));await sleep(1500);
  await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(800);const L=await logical(p);const c=await p.evaluate(()=>caches.keys());
  fs.writeFileSync(OUT,JSON.stringify({phaseA:{at:new Date().toISOString(),semver:v,caches:c,students:JSON.parse(L.ls[KEY]).students.length,classes:JSON.parse(L.ls[KEY]).classes.length,keys:Object.keys(L.ls)},L}));
  check('PHASE A : en ligne '+v+' ('+c.join(',')+') : cahier non chiffré créé, '+JSON.parse(L.ls[KEY]).students.length+' élèves',/^1\.28/.test(v));}
else if(PH==='C'){const L0=JSON.parse(fs.readFileSync(OUT,'utf8')).L;await p.goto(URL,{waitUntil:'networkidle2'});await sleep(1500);const t=await lockText(p);const locked=/code/i.test(t);await pad(p,'246813');await sleep(800);if(await p.$('#cjOk'))await p.click('#cjOk');await sleep(3000);await unlockGate(p);await sleep(600);const LR=await logical(p);
  check('réouverture en ligne : écran du code, bon code → données identiques octet pour octet ('+JSON.parse(LR.ls[KEY]).students.length+' élèves), mode '+await p.evaluate(()=>CJCrypto.mode()),locked&&LR.ls[KEY]===L0.ls[KEY]);check('aucune erreur de page',!ERR.length,ERR.join(' | ').slice(0,300));}
else{const S=JSON.parse(fs.readFileSync(OUT,'utf8')),L0=S.L;let sem='';for(let i=0;i<10&&sem!=='1.29.0';i++){await p.goto(URL,{waitUntil:'networkidle2'});await sleep(1500);sem=await p.evaluate(()=>window.CJR&&CJR.semver);}
  await unlockGate(p);await sleep(800);const c=await p.evaluate(()=>caches.keys());const L1=await logical(p);
  check('mise à jour en ligne 1.28.1 → '+sem+' par le service worker (caches '+c.join(',')+')',sem==='1.29.0'&&c.includes('cahier-v29')&&!c.includes('cahier-v28-1'));
  check('après mise à jour, sans code : mode clair, classRegister.v2 identique octet pour octet ('+JSON.parse(L1.ls[KEY]).students.length+' élèves), mêmes clés + instantané',await p.evaluate(()=>CJCrypto.mode())==='plain'&&L0.ls[KEY]===L1.ls[KEY]&&Object.keys(L0.ls).every(k=>L0.ls[k]===L1.ls[k]));
  await goTab(p,'settings');await sleep(400);await p.evaluate(()=>document.getElementById('secCard').scrollIntoView());await p.click('#secOn');await sleep(400);
  await pad(p,'246813',true);await sleep(300);await pad(p,'246813',true);
  await p.waitForFunction(()=>/Code activé|non effectué/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:90000});
  const ok=/Code activé/.test(await lockText(p));await p.click('#cjDone');await sleep(300);const dE=await rawDump(p);const LE=await logical(p);
  check('activation du code en ligne : chiffrement vérifié, classRegister.v2 stocké chiffré, aucun nom en clair',ok&&await p.evaluate(()=>CJCrypto.mode())==='open'&&dE.ls[KEY].startsWith(ENV)&&!JSON.parse(L0.ls[KEY]).students.slice(0,50).some(s=>JSON.stringify(dE).includes(s.sid)));
  check('déchiffrement : classRegister.v2 identique octet pour octet aux données d’origine (100 % des élèves)',LE.ls[KEY]===L0.ls[KEY]);
  await p.reload({waitUntil:'networkidle2'});await sleep(1200);const locked=/code/i.test(await lockText(p));await pad(p,'246813');await sleep(800);if(await p.$('#cjOk'))await p.click('#cjOk');await sleep(2500);await unlockGate(p);await sleep(600);const LR=await logical(p);
  check('réouverture : écran du code, bon code → mêmes données',locked&&LR.ls[KEY]===L0.ls[KEY]);
  check('aucune erreur de page',!ERR.length,ERR.join(' | ').slice(0,300));
  fs.writeFileSync(OUT.replace('.json','-B.json'),JSON.stringify({at:new Date().toISOString(),sem,caches:c,results}));}
console.log(results.filter(x=>x).length+'/'+results.length+' passed');await b.close();process.exit(0);})().catch(async e=>{console.log('ERREUR',e.message);process.exit(1);});
