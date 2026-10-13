/* v1.29.0 : chiffrement local AES-256-GCM + code d’accès (lien de test).
   Mise à jour réelle 1.28.1 → 1.29.0 (343 élèves / 9 classes, photos, 7 instantanés + repli IndexedDB, copie .backup, copie .corrupt),
   activation (sauvegarde, chiffrement, relecture, vérification octet pour octet), vidage brut sans aucune donnée en clair,
   écran de verrouillage, mauvais code + délais, verrouillage automatique, changement de code, exports PDF/CSV/JSON, restauration,
   import Massar, photos, échec simulé (retour au clair), désactivation (format d’origine), puis émulateurs : charge utile de synchro
   identique, première ouverture (proposition du code), « Code oublié » (effacement + reconnexion + rechargement depuis le compte). */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8047;const SHOT='/workspace/cj-emu/shots29';fs.mkdirSync(SHOT,{recursive:true});
const P='cahier-journalier-2830a',AUTH='http://127.0.0.1:9099',FS='http://127.0.0.1:8080';
const VOLD='/tmp/v281root';if(!fs.existsSync(VOLD+'/index.html')){fs.mkdirSync(VOLD,{recursive:true});cp.execSync('git -C '+D+' archive v1.28.1 | tar -x -C '+VOLD);}
let ROOT=VOLD;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain','.xml':'application/xml'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
const adminGet=p=>j(`${FS}/v1/projects/${P}/databases/(default)/documents/${p}`,{headers:{Authorization:'Bearer owner'}});
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
/* capture des fichiers produits par l’application (download → Blob) */
const hookBlobs=pg=>pg.evaluateOnNewDocument(()=>{const o=URL.createObjectURL;window.__blobs=[];URL.createObjectURL=function(b){try{if(b&&b.type&&!/^image\//.test(b.type))window.__blobs.push(b);}catch(e){}return o.apply(this,arguments);};});
const lastBlob=pg=>pg.evaluate(async()=>{const b=window.__blobs[window.__blobs.length-1];return b?{type:b.type,text:await b.text(),size:b.size}:null;});
const clickAndBlob=async(pg,sel)=>{await pg.evaluate(()=>{window.__blobs=[];});await pg.evaluate(s=>document.getElementById(s).click(),sel);for(let i=0;i<40;i++){const b=await lastBlob(pg);if(b)return b;await sleep(150);}return null;};
const ERR=[];
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:240000,args:['--no-sandbox','--disable-dev-shm-usage']});
// ================= 0. statique =================
const idx=fs.readFileSync(D+'/index.html','utf8'),sw=fs.readFileSync(D+'/sw.js','utf8'),cj=fs.readFileSync(D+'/cj-crypto.js','utf8');
check('version 1.29.0 / préversion cahier-v29-f (APP_VER = cache sw.js) ; cj-crypto.js en cache hors ligne',/var APP_SEMVER='1\.29\.0'/.test(idx)&&/var APP_VER='cahier-v29-f'/.test(idx)&&/const CACHE = 'cahier-v29-f'/.test(sw)&&/'\.\/cj-crypto\.js'/.test(sw));
check('firestore.rules et firebase.json identiques à 1.28.1',cp.execSync('git -C '+D+' diff v1.28.1 -- firestore.rules firebase.json').toString()==='');
/* 1.29.0 (-b) : relecture du français (« Maladie » → « Malade », espaces insécables, cohérence) — comparaisons faites à la relecture près : REV annule les corrections de contenu (cj-emu/i18n/content_fixes.py), NB ramène toute espace insécable à une espace simple */
const REV=[["une performance comprise entre deux performances de référence prend la note de la performance supérieure.","une performance comprise entre deux paliers prend la note du palier supérieur."],["entre deux performances de référence → note de la performance supérieure","entre deux paliers → note du palier supérieur"],["' → performance '+r.row+'/20","' → palier '+r.row+'/20"], /* 1.29.0 (-e) : « palier » → « performance » (affichage) */ ["it.unshift({l:'P = Présent',c:", "it.unshift({l:'P = présent',c:"], ["' (absent, malade, retard, sans tenue) · classés", "' (absences, maladies, retards, sans tenue) · classés"], ["M = malade non justifié, R = retard", "M = maladie non justifiée, R = retard"], ["M = malade non justifié · MJ = malade justifié", "M = maladie non justifiée · MJ = maladie justifiée"], ["l:'Malade M / MJ'", "l:'Maladie M / MJ'"], ["l:'Malade M / MJ',s:'non justifié / justifié'", "l:'Maladie M / MJ',s:'non justifiée / justifiée'"], ["Malade non just.", "Maladie non just."], ["Malade justifié", "Maladie justifiée"], ["Malade non justifié", "Maladie non justifiée"], ["sauvegarde du Cahier Journalier digital.", "sauvegarde du Cahier journalier digital."], [">Nom Z→A</option>", ">Nom Z–A</option>"], [">Nom A→Z</option>", ">Nom A–Z</option>"], ["'1er semestre':'2e semestre')+' (cycles '", "'1er semestre':'2ème semestre')+' (Cycles '"], ["{k:'soup',l:'Souplesse (flexion avant assis)'", "{k:'soup',l:'Souplesse (sit and reach)'"], ["M=malade non justifié R=retard MJ=malade justifié", "M=maladie non justifiée R=retard MJ=maladie justifiée"], ["['M','M','Malade']", "['M','M','Maladie']"], ["tM:'Malade (M)'", "tM:'Maladie (M)'"], ["data-v=\"M\">Malade</button>", "data-v=\"M\">Maladie</button>"], ["Malade just.", "Maladie just."], ["Malade non just.", "Maladie non just."], ["Malade justifié", "Maladie justifiée"], ["Malade non justifié", "Maladie non justifiée"], ["puis 🩺 Dispensé ; ses cases deviennent grises, les autres marques restent possibles", "puis 🩺 Dispensé ; ses cases deviennent violettes et barrées, les autres marques restent possibles"], ["Sans tenue → Malade → Retard → Malade justifié → Absence justifiée", "Sans tenue → Maladie → Retard → Maladie justifiée → Absence justifiée"], ["absent, sans tenue, malade, retard, absence justifiée", "absent, sans tenue, maladie, retard, absences justifiées"]];
const NB=s=>s.replace(/\\u00a0|\u00a0/g,' ');const UNW=s=>REV.slice().sort((a,b)=>b[0].length-a[0].length).reduce((t,r)=>t.split(r[0]).join(r[1]),NB(s));
const old=NB(cp.execSync('git -C '+D+' show v1.28.1:index.html',{maxBuffer:1e8}).toString());const idxN=UNW(idx);
const blk=(h,re)=>{const m=h.match(re);return m?m[1]:null;};
const syncOld=blk(old,/<script>\n(\/\* ================= Synchronisation Firebase[\s\S]*?)<\/script>/),syncNew=blk(idxN,/<script type="text\/x-cj-app" id="cjA2">\n(\/\* ================= Synchronisation Firebase[\s\S]*?)<\/script>/);
check('module de synchronisation (Auth + Firestore + invitations) : texte identique à 1.28.1 (à la relecture du français près)',!!syncOld&&syncOld===syncNew,(syncOld||'').length+' car.');
/* le reste de l’application : seules les lignes photo/instantané IndexedDB changent (passage par CJCrypto) */
const oL=old.split('\n'),nL=idxN.split('\n');const setO=new Set(oL),setN=new Set(nL);const rem=oL.filter(l=>!setN.has(l)),add=nL.filter(l=>!setO.has(l));
const remOk=rem.every(l=>/1\.28\.1|cahier-v28-1|^function ph(Get|Put|All)\(|^function snapGet|^  function putIdb|^  return idbRun\('readonly',function\(st\)\{return st\.get\(t\);\}\)|^<script>$|^<\/script>$|^var APP_SEMVER|^  <button data-tab="(home|students|attendance|proc|reports|settings)"/.test(l)); /* 1.29.0 (-f) : icônes de la barre d’onglets (style C) */
check('index.html : lignes retirées = version, 3 fonctions photo (phGet/phPut/phAll), 2 fonctions instantané IndexedDB, balises <script> ('+rem.length+')',remOk,rem.filter(l=>!/1\.28\.1|cahier-v28-1|^<script>$|^<\/script>$/.test(l)).map(l=>l.slice(0,60)).join(' | ').slice(0,400));
check('exports (bkExport / CSV / cj-pdf.js) et import Massar (bulk) inchangés (à la relecture du français près)',!add.some(l=>/bkExport|expGrid|expYear|expStudents|bulkGo|bulkText|function parseBulk/.test(l))&&cp.execSync('git -C '+D+' diff v1.28.1 -- op2007-athle.js').toString()===''&&NB(cp.execSync('git -C '+D+' show v1.28.1:cj-pdf.js',{maxBuffer:1e8}).toString())===UNW(cp.execSync('git -C '+D+' show cfabde0:cj-pdf.js',{maxBuffer:1e8}).toString()) /* 1.29.0 (-c) : mise en page PDF seule, couverte par test_v29_pdf44 */);
const keys=h=>[...new Set((h.match(/['"](classRegister\.v2[\w.]*|classRegister\.[\w.]+|cahier\.[A-Za-z][\w.]*)['"]/g)||[]).map(x=>x.slice(1,-1)))].sort();
const kOld=keys(old),kNew=keys(idx+cj);
check('noms de clés : tous ceux de 1.28.1 conservés ; ajouts seulement classRegister.crypto et cahier.cryptoLater',kOld.every(k=>kNew.includes(k))&&kNew.filter(k=>!kOld.includes(k)).sort().join()==='cahier.cryptoLater,classRegister.crypto',kNew.filter(k=>!kOld.includes(k)).join());
// ================= 1. 1.28.1 avec données réelles, puis mise à jour =================
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
p.on('pageerror',e=>ERR.push('pageerror '+e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});await hookBlobs(p);
await p.goto('http://localhost:'+PORT+'/',{waitUntil:'networkidle2'});
const base=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);const data=buildData(base);
const NAMES=data.students.map(s=>s.name.replace(/ \d+$/,'')),SIDS=data.students.map(s=>s.sid);
await p.evaluate(s=>window.CJApp.applyJSON(s),JSON.stringify(data));await sleep(600);
const phIds=data.students.filter((s,i)=>i%6===0).map(s=>s.id);
await p.evaluate((ids,jp)=>new Promise((res,rej)=>{const r=indexedDB.open('cahier-photos',1);r.onupgradeneeded=()=>{const db=r.result;['p','q'].forEach(n=>db.createObjectStore(n,{keyPath:'id'}));db.createObjectStore('m',{keyPath:'k'});};
  r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readwrite');ids.forEach((id,i)=>tx.objectStore('p').put({id,d:jp[i%jp.length],t:1791400000000+i}));tx.oncomplete=()=>{db.close();res();};tx.onerror=()=>rej(tx.error);};}),phIds,jpgs);
/* 7 instantanés dans localStorage + 2 dans le repli IndexedDB + copie d’un autre compte + copie « illisible » */
await p.evaluate(async KEY=>{const A=window.CJApp;for(let i=0;i<5;i++){A.snapshot('Test '+i,{force:true});await new Promise(r=>setTimeout(r,15));}
  const raw=localStorage.getItem(KEY);localStorage.setItem(KEY+'.backup.autreCompte',JSON.stringify({uid:'autreCompte',savedAt:1,updatedAt:1,dirty:false,linked:true,data:raw}));localStorage.setItem(KEY+'.corrupt',raw.slice(0,5000));
  await new Promise((res,rej)=>{const r=indexedDB.open('cahier-snap',1);r.onupgradeneeded=()=>r.result.createObjectStore('s',{keyPath:'t'});r.onsuccess=()=>{const db=r.result,tx=db.transaction('s','readwrite');
    [Date.now()+3600e3,Date.now()+3600e3+500].forEach((t,i)=>tx.objectStore('s').put({t,why:'Repli IDB '+i,u:'',nc:9,ns:343,nse:36,h:'x',v:'cahier-v28-1',data:raw}));tx.oncomplete=()=>{db.close();res();};tx.onerror=()=>rej(tx.error);};});},KEY);
await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(800);
const dump281=await rawDump(p);const L281=await logical(p);
const nSnap=Object.keys(dump281.ls).filter(k=>k.indexOf(KEY+'.snap.')===0).length;
check('1.28.1 : 343 élèves / 9 classes, '+phIds.length+' photos, '+nSnap+' instantanés localStorage + 2 IndexedDB (7 au total), copie .backup et .corrupt',JSON.parse(dump281.ls[KEY]).students.length===343&&JSON.parse(dump281.ls[KEY]).classes.length===9&&L281.ph&&Object.keys(L281.ph).length===phIds.length&&nSnap===5&&Object.keys(L281.snd).length===2);
check('1.28.1 : le vidage brut contient bien les noms en clair (contrôle du test)',NAMES.some(n=>JSON.stringify(dump281).includes(n)));
ROOT=D;let sem='';for(let i=0;i<8&&sem!=='1.29.0';i++){await p.reload({waitUntil:'networkidle2'});await sleep(1200);sem=await p.evaluate(()=>window.CJR&&window.CJR.semver);}
await unlockGate(p);await sleep(600);
const cachesNow=await p.evaluate(()=>caches.keys());
check('mise à jour réelle 1.28.1 → '+sem+' par le service worker (cache '+cachesNow.join(',')+')',sem==='1.29.0'&&cachesNow.includes('cahier-v29-f')&&!cachesNow.includes('cahier-v28-1'));
const L290=await logical(p);const dump290=await rawDump(p);
const kd=(a,b)=>{if(a===b)return 'égal';let i=0;while(a[i]===b[i])i++;return a.length+'/'+b.length+' @'+i+' '+a.slice(i-40,i+40)+' ≠ '+b.slice(i-40,i+40);};
const c281=Object.keys(L281.ls).filter(k=>k in L290.ls);
check('après mise à jour, sans code : mode « clair », classRegister.v2 / .backup / .corrupt / instantanés / photos / repli IDB identiques octet pour octet, aucune métadonnée (instantané « avant mise à jour » habituel)',await p.evaluate(()=>CJCrypto.mode())==='plain'&&L281.ls[KEY]===L290.ls[KEY]&&c281.length>=Object.keys(L281.ls).length-1&&c281.every(k=>L281.ls[k]===L290.ls[k])&&same(L281.ph,L290.ph)&&same(L281.snd,L290.snd)&&!dump290.ls['classRegister.crypto'],JSON.stringify([c281.length,Object.keys(L281.ls).length,c281.every(k=>L281.ls[k]===L290.ls[k]),same(L281.ph,L290.ph),same(L281.snd,L290.snd)])+Object.keys(L290.ls).filter(k=>!(k in L281.ls)).map(k=>dump290.ls[k.replace('.snap.','.snapm.')]||k).join(' ').slice(0,200));
// ================= 2. exports en clair (référence) =================
await goTab(p,'settings');await sleep(300);
const expClear={};for(const id of ['expGrid','expYear','expStudents']){expClear[id]=await clickAndBlob(p,id);}
const jsonClear=await clickAndBlob(p,'bkExport');
const strip=t=>{const o=JSON.parse(t);delete o.lastBackup;return JSON.stringify(o);};
// ================= 3. activation depuis Paramètres =================
await p.evaluate(()=>document.getElementById('secCard').scrollIntoView());await sleep(200);
const L290b=await logical(p);
check('carte « Sécurité de cet appareil » : code désactivé, bouton Activer',await p.evaluate(()=>/désactivé/.test(document.getElementById('secCard').innerText)&&!!document.getElementById('secOn')));
await p.click('#secOn');await sleep(400);
check('écran de mise en place : explication en français + 6 chiffres ou plus',/Protégez les données de vos élèves/.test(await lockText(p))&&/6 chiffres/.test(await lockText(p)));
await pad(p,'1357');await p.screenshot({path:SHOT+'/v29-1-code-mise-en-place.png'});
await pad(p,'92',true);await sleep(300);
check('étape de confirmation',/Confirmez votre code/.test(await lockText(p)));
await pad(p,'135791',true);await sleep(300);
check('codes différents → recommencer, rien n’est chiffré',/ne correspondent pas/.test(await lockText(p))&&await p.evaluate(()=>CJCrypto.mode())==='plain');
await pad(p,'135792',true);await sleep(300);await pad(p,'135792',true);
await p.waitForFunction(()=>/Code activé|non effectué/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:60000});
const tEnable=await p.evaluate(()=>JSON.stringify(CJCrypto.timings));
check('chiffrement terminé et vérifié (temps '+tEnable+')',/Code activé/.test(await lockText(p))&&await p.evaluate(()=>CJCrypto.mode())==='open');
await p.click('#cjDone');await sleep(300);
const dumpE=await rawDump(p);const LE=await logical(p);
const meta=JSON.parse(dumpE.ls['classRegister.crypto']);
check('métadonnées classRegister.crypto : PBKDF2-SHA-256 600 000 itérations, sel 128 bits, clé enveloppée (AES-GCM), aucun code stocké',meta.it===600000&&meta.kdf==='PBKDF2-SHA-256'&&Buffer.from(meta.salt,'base64').length===16&&meta.wrap&&meta.wrap.iv&&meta.wrap.ct&&!JSON.stringify(meta).includes('135792'));
const protK=Object.keys(dumpE.ls).filter(k=>k===KEY||k===KEY+'.corrupt'||k.indexOf(KEY+'.snap.')===0||k.indexOf(KEY+'.backup.')===0);
check('clés personnelles ('+protK.length+' : classRegister.v2, instantanés, .backup, .corrupt) : même nom, valeur = enveloppe {v:1,alg:AES-GCM,iv,ct}',protK.length===Object.keys(L290b.ls).length&&protK.length>=8&&protK.every(k=>dumpE.ls[k].startsWith(ENV)),protK.length+' / '+Object.keys(L290.ls).length);
const ivs=protK.map(k=>JSON.parse(dumpE.ls[k]).iv);check('IV 96 bits, tous différents',ivs.every(v=>Buffer.from(v,'base64').length===12)&&new Set(ivs).size===ivs.length);
const phRaw=dumpE.idb['cahier-photos'].p;check('photos IndexedDB : champ d remplacé par une enveloppe e ('+phRaw.length+')',phRaw.length===phIds.length+0&&phRaw.every(r=>!r.d&&r.e&&r.e.startsWith(ENV)));
check('instantanés de repli IndexedDB : champ data chiffré',dumpE.idb['cahier-snap'].s.every(r=>r.data.startsWith(ENV)));
const sDump=JSON.stringify(dumpE);
const leaks=[...NAMES,...SIDS,'Tammar','Baja','Asthme','Certificat'].filter(x=>sDump.includes(x));
if(leaks.length){const where=[];const walk=(o,pth)=>{if(typeof o==='string'){if(leaks.some(x=>o.includes(x)))where.push(pth+' = '+o.slice(Math.max(0,o.indexOf(leaks[0])-60),o.indexOf(leaks[0])+30));}else if(o&&typeof o==='object')Object.keys(o).forEach(k=>walk(o[k],pth+'/'+k));};walk(dumpE,'');console.log('LEAK',where.slice(0,5));}
const arN=NAMES.filter(n=>/[\u0600-\u06FF]/.test(n));
check('vidage brut (localStorage + IndexedDB + Cache Storage + sessionStorage) : aucun des 343 noms ('+arN.length+' en arabe), aucun code Massar, ni enseignant, ni établissement, ni remarque',leaks.length===0,leaks.slice(0,5).join(','));
check('Cache Storage : uniquement les fichiers de l’application et le SDK Firebase ('+Object.values(dumpE.cs).flat().length+' fichiers)',Object.values(dumpE.cs).flat().every(u=>u.startsWith('http://localhost:'+PORT+'/')||u.startsWith('https://www.gstatic.com/firebasejs/')));
const common=Object.keys(L290b.ls).filter(k=>k in LE.ls),gone=Object.keys(L290b.ls).filter(k=>!(k in LE.ls));
check('aller-retour : chaque valeur déchiffrée identique octet pour octet (classRegister.v2, instantanés, .backup, .corrupt, photos, repli IDB) ; seul le plus ancien instantané remplacé par « Avant chiffrement » (7 max)',common.length===Object.keys(L290b.ls).length-1&&gone.length===1&&common.every(k=>LE.ls[k]===L290b.ls[k])&&same(LE.ph,L290.ph)&&same(LE.snd,L290.snd),gone.join());
const newSnap=Object.keys(LE.ls).filter(k=>!(k in L290.ls));check('sauvegarde automatique « Avant chiffrement » créée (chiffrée)',newSnap.length===1&&dumpE.ls[KEY+'.snapm.'+newSnap[0].split('.').pop()].includes('Avant chiffrement'),newSnap.join());
check('CJApp.getJSON() (base des exports et de la synchro) = texte d’origine',await p.evaluate(KEY=>window.CJApp.getJSON(),KEY)===L290b.ls[KEY]);
// capture du vidage brut
const pg2=await ctx.newPage();await pg2.setViewport({width:390,height:844,deviceScaleFactor:2});
const cell=t=>String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;');
const rows=Object.keys(dumpE.ls).sort().map(k=>'<div class="r"><b>'+cell(k)+'</b><span>'+cell(String(dumpE.ls[k]).slice(0,120))+'…</span></div>').join('');
const phr=phRaw.slice(0,2).map(r=>'<div class="r"><b>IndexedDB cahier-photos › p › '+r.id+'</b><span>'+cell(JSON.stringify(r).slice(0,120))+'…</span></div>').join('')+(dumpE.idb['cahier-snap'].s[0]?'<div class="r"><b>IndexedDB cahier-snap › s › '+dumpE.idb['cahier-snap'].s[0].t+'</b><span>'+cell(JSON.stringify(dumpE.idb['cahier-snap'].s[0]).slice(0,120))+'…</span></div>':'');
await pg2.setContent('<html><head><style>body{font:11px/1.35 ui-monospace,Menlo,monospace;margin:10px;background:#0f172a;color:#e2e8f0}h3{font:600 15px -apple-system,sans-serif;margin:4px 0 8px}.r{border-bottom:1px solid #334155;padding:4px 0}.r b{display:block;color:#93c5fd;font-weight:600}.r span{display:block;word-break:break-all;color:#cbd5e1}p{font:12px -apple-system,sans-serif;color:#94a3b8}</style></head><body><h3>Stockage brut de l’appareil (1.29.0, code activé)</h3>'+rows+phr+'<p>Recherche dans tout le stockage (localStorage, IndexedDB, Cache Storage, sessionStorage) des 343 noms (dont '+arN.length+' en arabe), codes Massar, enseignant, établissement : 0 résultat.</p></body></html>');
await pg2.screenshot({path:SHOT+'/v29-4-stockage-brut.png',fullPage:true});await pg2.close();
// exports en mode chiffré
await goTab(p,'settings');await sleep(300);
const expEnc={};for(const id of ['expGrid','expYear','expStudents']){expEnc[id]=await clickAndBlob(p,id);}
check('exports CSV (registre, bilan annuel, liste des élèves) identiques au mode clair',['expGrid','expYear','expStudents'].every(id=>expClear[id]&&expEnc[id]&&expClear[id].text===expEnc[id].text&&expClear[id].text.length>1000),['expGrid','expYear','expStudents'].map(id=>(expEnc[id]||{}).size).join(','));
const jsonEnc=await clickAndBlob(p,'bkExport');
check('export JSON identique au mode clair (hors date lastBackup) et en clair',jsonEnc&&jsonClear&&strip(jsonEnc.text)===strip(jsonClear.text)&&JSON.parse(jsonEnc.text).students.length===343);
await p.evaluate(()=>{window.__lastPdf=null;});await goTab(p,'reports');await sleep(300);
await p.evaluate(()=>{const s=document.getElementById('repScope');s.value='year';s.dispatchEvent(new Event('change'));document.getElementById('repExportPdf').click();});
await p.waitForFunction(()=>window.__lastPdf,{timeout:40000}).catch(()=>{});
const pdf=await p.evaluate(async()=>{const x=window.__lastPdf;if(!x)return null;const u=new Uint8Array(await x.blob.arrayBuffer());return {name:x.name,head:String.fromCharCode.apply(null,u.subarray(0,5)),size:u.length};});
check('export PDF (bilan annuel) produit en mode chiffré',pdf&&pdf.head==='%PDF-'&&pdf.size>5000,JSON.stringify(pdf));
const LE2=await logical(p);await p.evaluate(()=>CJCrypto.flush());
// ================= 4. verrouillage à l’ouverture =================
await p.reload({waitUntil:'networkidle2'});await sleep(400);
const lk=await p.evaluate(()=>({mode:CJCrypto.mode(),app:!!window.CJApp,sync:!!window.CJSync,txt:document.body.innerText}));
check('ouverture : écran de verrouillage, application NON chargée, aucune donnée affichée',lk.mode==='locked'&&!lk.app&&!lk.sync&&!NAMES.some(n=>lk.txt.includes(n))&&/Entrez votre code/.test(lk.txt));
await p.screenshot({path:SHOT+'/v29-2-deverrouillage.png'});
for(let i=0;i<4;i++){await pad(p,'000000');await sleep(i<3?2600:2600);}
const m4=await p.evaluate(()=>CJCrypto.meta());const t4=await lockText(p);
check('4 mauvais codes : refusés, délai de 30 s imposé, rien effacé',m4.fail===4&&m4.until>Date.now()&&/réessayez dans/.test(t4)&&await p.evaluate(()=>CJCrypto.mode())==='locked',t4.split('\n').filter(x=>/essai|Code/.test(x)).join(' / '));
await pad(p,'135792');await sleep(1500);
check('pendant le délai, même le bon code est refusé',await p.evaluate(()=>CJCrypto.mode())==='locked'&&/réessayez dans/.test(await lockText(p)));
check('escalade : 5e échec → 60 s, 7e → 15 min max 1 h (table)',/DELAYS=\[0,0,0,0,30,60,300,900,3600\]/.test(cj));
await p.evaluate(()=>{const m=JSON.parse(localStorage.getItem('classRegister.crypto'));m.until=0;localStorage.setItem('classRegister.crypto',JSON.stringify(m));});  /* le temps passe */
await p.reload({waitUntil:'networkidle2'});await sleep(300);await pad(p,'135792');
await opened(p);await sleep(500);
const T1=await p.evaluate(()=>CJCrypto.timings);
check('bon code : application ouverte, compteur remis à zéro (déverrouillage '+T1.unlock+' ms dont PBKDF2, déchiffrement de tout '+T1.load+' ms)',await p.evaluate(()=>CJCrypto.meta().fail===0&&CJCrypto.mode()==='open'));
const LU=await logical(p);check('après déverrouillage : données identiques octet pour octet',same(LU,LE2));
check('343 élèves affichés',await (async()=>{await goTab(p,'students');await sleep(400);await p.evaluate(()=>{const f=document.getElementById('stuClassFilter');f.value='';f.dispatchEvent(new Event('change'));});await sleep(400);return p.evaluate(()=>/343 sur 343 élèves/.test(document.body.innerText));})(),await p.evaluate(()=>(document.body.innerText.match(/\d+ sur \d+ élèves/)||[''])[0]+' | '+document.documentElement.className+' | '+(window.CJR?CJR.db().students.length:'-')));
// enregistrement : temps de chiffrement d’une sauvegarde complète
const tSave=await p.evaluate(async KEY=>{const s=localStorage.getItem(KEY),r=[];for(let i=0;i<5;i++){const t0=performance.now();localStorage.setItem(KEY,s);await CJCrypto.flush();r.push(performance.now()-t0);}return {med:Math.round(r.sort((a,b)=>a-b)[2]),bytes:s.length,env:localStorage[KEY].length};},KEY);
check('enregistrement chiffré de classRegister.v2 ('+Math.round(tSave.bytes/1024)+' Ko → '+Math.round(tSave.env/1024)+' Ko compressés+chiffrés) : '+tSave.med+' ms',tSave.med<1500&&tSave.env<tSave.bytes);
// note saisie → rechargement
await goTab(p,'attendance');await sleep(800);
const sid0=await p.evaluate(()=>{const tr=document.querySelector('#gridWrap tr[data-sid]');return tr&&tr.dataset.sid;});
await p.evaluate(sid=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input.gin[data-k="g1"]');i.focus();i.value='5.25';i.dispatchEvent(new Event('change',{bubbles:true}));},sid0);await sleep(1500);
await p.evaluate(()=>CJCrypto.flush());
const evNow=await p.evaluate((KEY,sid)=>JSON.stringify(JSON.parse(localStorage.getItem(KEY)).students.find(s=>s.id===sid).ev||null),KEY,sid0);
check('saisie d’une note (5,25) enregistrée, valeur brute toujours chiffrée',/5\.25/.test(evNow)&&(await rawDump(p)).ls[KEY].startsWith(ENV)&&!JSON.stringify(await rawDump(p)).includes('5.25'),evNow+' '+sid0+' '+await p.evaluate(()=>document.querySelectorAll('#gridWrap tr[data-sid]').length+' rows, '+document.querySelectorAll('#gridWrap input.gin').length+' gin, '+document.documentElement.className+' '+(document.querySelector('#gridWrap .empty')||{textContent:''}).textContent));
// ================= 5. Paramètres › Sécurité, verrouillage automatique =================
await goTab(p,'settings');await sleep(300);await p.evaluate(()=>{document.getElementById('secCard').scrollIntoView({block:'center'});});await sleep(250);
const sc=await p.evaluate(()=>document.getElementById('secCard').innerText);
check('carte Sécurité : activé, réglage du verrouillage (5 min par défaut), Verrouiller / Changer le code / Désactiver, limites expliquées',/activé/.test(sc)&&/600 000/.test(sc)&&await p.evaluate(()=>document.getElementById('secAl').value==='5')&&/Verrouiller maintenant/.test(sc)&&/Changer le code/.test(sc)&&/Désactiver le chiffrement/.test(sc)&&/en mémoire/.test(sc)&&/exports PDF, CSV et JSON sont en clair/.test(sc),sc.replace(/\n+/g,' / ').slice(0,500));
check('Face ID : signalé honnêtement si indisponible (navigateur de test sans authentificateur)',/non disponible dans ce navigateur|Activer Face ID/.test(sc)||await p.evaluate(()=>!document.getElementById('secBio').classList.contains('hidden')));
await p.screenshot({path:SHOT+'/v29-3-parametres-securite.png'});
const vis=async(hidden)=>p.evaluate(h=>{Object.defineProperty(document,'hidden',{configurable:true,get:()=>h});Object.defineProperty(document,'visibilityState',{configurable:true,get:()=>h?'hidden':'visible'});document.dispatchEvent(new Event('visibilitychange'));},hidden);
const shift=ms=>p.evaluate(ms=>{const o=Date.now.__o||Date.now;const f=()=>o()+ms;f.__o=o;Date.now=f;},ms);
await p.evaluate(()=>{window.__mark=1;});await vis(true);await shift(2*60000);await vis(false);await sleep(1200);/* (horloge décalée de 2 min) */
check('2 min en arrière-plan (réglage 5 min) : reste ouvert',await p.evaluate(()=>window.__mark===1&&CJCrypto.mode()==='open'));
await vis(true);await shift((2+6)*60000);await vis(false);
await p.waitForFunction(()=>!window.__mark&&document.getElementById('cjLock'),{timeout:15000}).catch(()=>{});
check('6 min en arrière-plan : verrouillé automatiquement (rechargement → écran du code)',await p.evaluate(()=>!window.__mark&&CJCrypto.mode()==='locked'&&!window.CJApp));
await pad(p,'135792');await opened(p);
await goTab(p,'settings');await sleep(300);
await p.select('#secAl','0');await sleep(200);
check('réglage « immédiatement » enregistré',await p.evaluate(()=>CJCrypto.meta().al===0));
await p.evaluate(()=>{window.__mark=1;});await vis(true);await sleep(100);await vis(false);
await p.waitForFunction(()=>!window.__mark&&document.getElementById('cjLock'),{timeout:15000}).catch(()=>{});
check('réglage immédiat : verrouillé dès le retour au premier plan',await p.evaluate(()=>!window.__mark&&CJCrypto.mode()==='locked'));
await pad(p,'135792');await opened(p);
await goTab(p,'settings');await sleep(300);await p.select('#secAl','5');
await p.evaluate(()=>{window.__mark=1;});await p.click('#secLock');await p.waitForFunction(()=>!window.__mark&&document.getElementById('cjLock'),{timeout:15000}).catch(()=>{});
check('« Verrouiller maintenant »',await p.evaluate(()=>CJCrypto.mode()==='locked'));
await pad(p,'135792');await opened(p);
// ================= 6. changer le code =================
const envBefore=(await rawDump(p)).ls[KEY];
await goTab(p,'settings');await sleep(300);await p.click('#secPin');await sleep(300);await pad(p,'135792');
await p.waitForFunction(()=>/Nouveau code/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:20000});
await pad(p,'24681357',true);await sleep(300);await pad(p,'24681357',true);
await p.waitForFunction(()=>!document.getElementById('cjLock'),{timeout:30000});
const envAfter=(await rawDump(p)).ls[KEY];const m2=await p.evaluate(()=>CJCrypto.meta());
check('code changé (8 chiffres) : seule la clé enveloppée change, données non rechiffrées',envAfter===envBefore&&m2.len===8&&m2.wrap.ct!==meta.wrap.ct&&m2.salt!==meta.salt);
await p.reload({waitUntil:'networkidle2'});await sleep(300);await pad(p,'135792');await sleep(400);await pad(p,'35');await sleep(2500);
check('ancien code refusé',await p.evaluate(()=>CJCrypto.mode())==='locked'&&/incorrect/.test(await lockText(p)));
await pad(p,'24681357');await opened(p);
check('nouveau code accepté, mêmes données',same((await logical(p)).ph,LE.ph)&&await p.evaluate((KEY,sid)=>/5\.25/.test(JSON.stringify(JSON.parse(localStorage.getItem(KEY)).students.find(s=>s.id===sid).ev)),KEY,sid0));
// ================= 7. restauration JSON, import Massar, photo =================
await goTab(p,'settings');await sleep(300);
fs.writeFileSync('/tmp/v29-restore.json',jsonEnc.text);
const fi=await p.$('#bkFile');await fi.uploadFile('/tmp/v29-restore.json');await sleep(1500);
await p.evaluate(()=>{const b=[...document.querySelectorAll('.modal.open button, #cjLock button')].find(x=>/Restaurer|Remplacer|Confirmer/.test(x.textContent));if(b)b.click();});await sleep(1500);await p.evaluate(()=>CJCrypto.flush());
const afterRestore=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);
check('restauration d’une sauvegarde JSON en mode chiffré : données = fichier, stockage toujours chiffré',strip(afterRestore)===strip(jsonEnc.text)&&(await rawDump(p)).ls[KEY].startsWith(ENV),afterRestore.length+' / '+jsonEnc.text.length);
await goTab(p,'students');await sleep(300);
await p.evaluate(()=>{document.getElementById('bulkBtn').click();});await sleep(300);
await p.evaluate(()=>{const s=document.getElementById('bulkClass');s.value=s.options[0].value;s.dispatchEvent(new Event('change'));const t=document.getElementById('bulkText');t.value='Nom\tPrénom\tCode Massar\nZZMASSAR\tKarim\tJ999999901\nالمنصوري\tخديجة\tK999999902';t.dispatchEvent(new Event('input'));});await sleep(400);
await p.evaluate(()=>document.getElementById('bulkGo').click());await sleep(800);await p.evaluate(()=>CJCrypto.flush());
const imp=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).students.filter(s=>/J999999901|K999999902/.test(s.sid)).map(s=>s.name+'|'+s.sid),KEY);
const dImp=JSON.stringify(await rawDump(p));
check('import Massar (Nom / Prénom / Code Massar) en mode chiffré : 2 élèves ajoutés, aucun en clair dans le stockage',imp.length===2&&!/ZZMASSAR|J999999901|المنصوري/.test(dImp),imp.join(' ; '));
await goTab(p,'students');await sleep(300);const pid=data.students[1].id;
await p.evaluate(id=>document.querySelector('.stu[data-id="'+id+'"]').click(),pid);await sleep(400);await p.click('#detPhoto');await sleep(300);
const el=await p.$('#phGal');await el.uploadFile('/tmp/trombi/av/p05.jpg');await p.waitForFunction(()=>document.getElementById('phCrop').classList.contains('open'),{timeout:15000});await sleep(200);await p.click('#phSave');await sleep(900);
const phRec=await p.evaluate(id=>new Promise(res=>{const r=indexedDB.open('cahier-photos');r.onsuccess=()=>{const q=r.result.transaction('p').objectStore('p').get(id);q.onsuccess=()=>{r.result.close();res(q.result);};};}),pid);
check('nouvelle photo : enregistrée chiffrée (champ e), affichée dans la fiche',phRec&&!phRec.d&&phRec.e.startsWith(ENV)&&await p.evaluate(()=>!!document.querySelector('#detPhoto img')));
const pa=await p.evaluate(()=>window.CJR.photoAll().then(o=>Object.keys(o).length));check('photos lisibles par l’application (trombinoscope / fiche PDF) : '+pa,pa===phIds.length+1);
// ================= 8. échec simulé pendant l’activation → retour au clair =================
await goTab(p,'settings');await sleep(300);
await p.evaluate(()=>{document.getElementById('secOff').click();});await sleep(400);await pad(p,'24681357');
await p.waitForFunction(()=>!document.getElementById('cjLock'),{timeout:60000});await sleep(300);
const LD=await logical(p);const dumpD=await rawDump(p);
const LBefore=LD;
check('désactivation : métadonnées retirées, toutes les clés en clair, photos {id,d,t}, repli IDB en clair',!dumpD.ls['classRegister.crypto']&&Object.keys(LD.ls).every(k=>dumpD.ls[k]===LD.ls[k]&&!dumpD.ls[k].startsWith(ENV))&&dumpD.idb['cahier-photos'].p.every(r=>r.d&&!r.e)&&dumpD.idb['cahier-snap'].s.every(r=>!r.data.startsWith(ENV)));
await p.reload({waitUntil:'networkidle2'});await sleep(1500);await unlockGate(p);
check('après désactivation : plus de code demandé, mêmes données (format d’origine exact)',await p.evaluate(()=>CJCrypto.mode()==='plain'&&!!window.CJApp&&!document.getElementById('cjLock'))&&same(await logical(p),LBefore));
const plainRaw=(await rawDump(p)).ls[KEY];
check('le format en clair est relisible par 1.28.1 (même forme : JSON classRegister)',JSON.parse(plainRaw).app==='class-register'&&JSON.parse(plainRaw).students.length===345);
// échec injecté : écriture IndexedDB des photos impossible après l’écriture des clés localStorage
const Lpre=await logical(p);const Dpre=await rawDump(p);
await p.evaluate(()=>{const o=IDBObjectStore.prototype.put;window.__op=o;IDBObjectStore.prototype.put=function(v){if(this.name==='p'&&v&&v.e)throw new DOMException('simulé','QuotaExceededError');return o.apply(this,arguments);};});
await goTab(p,'settings');await sleep(300);await p.click('#secOn');await sleep(300);await pad(p,'112233',true);await sleep(300);await pad(p,'112233',true);
await p.waitForFunction(()=>/Code activé|non effectué/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:60000});
const failTxt=await lockText(p);
await p.evaluate(()=>{IDBObjectStore.prototype.put=window.__op;});
const Dpost=await rawDump(p);
const lsEq=Dpost.ls[KEY]===Dpre.ls[KEY]&&Object.keys(Lpre.ls).filter(k=>k in Dpost.ls).every(k=>Dpost.ls[k]===Dpre.ls[k])&&Object.keys(Dpost.ls).every(k=>!String(Dpost.ls[k]).startsWith(ENV));
check('échec simulé en cours d’activation : message clair, aucune métadonnée, valeurs en clair remises à l’identique, photos intactes',/non effectué/.test(failTxt)&&/Rien n’a été modifié/.test(failTxt)&&!Dpost.ls['classRegister.crypto']&&lsEq&&same(Dpost.idb['cahier-photos'].p,Dpre.idb['cahier-photos'].p)&&await p.evaluate(()=>CJCrypto.mode())==='plain',JSON.stringify([/non effectué/.test(failTxt),/Rien n’a été modifié/.test(failTxt),!Dpost.ls['classRegister.crypto'],lsEq,same(Dpost.idb['cahier-photos'].p,Dpre.idb['cahier-photos'].p)])+failTxt.split('\n').slice(1,4).join(' / '));
await p.click('#cjDone');await sleep(200);
const nSnapAfter=Object.keys(Dpost.ls).filter(k=>k.indexOf(KEY+'.snap.')===0).length;check('instantanés toujours au plus 7 ('+nSnapAfter+')',nSnapAfter<=7);
await ctx.close();
if(!process.env.SKIP_EMU){
// ================= 9. émulateurs : première ouverture, synchro identique, code oublié =================
await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
const EM='crypto.test@example.com',PW='Crypto-123456';
const su=await j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:EM,password:PW,returnSecureToken:true})});const UID=su.localId;
await j(`${FS}/v1/projects/${P}/databases/(default)/documents/members/${EM}`,{method:'PATCH',headers:{Authorization:'Bearer owner','content-type':'application/json'},body:JSON.stringify({fields:{email:{stringValue:EM},active:{booleanValue:true},uid:{stringValue:UID},name:{stringValue:'Test Crypto'}}})});
const ctx2=await b.createBrowserContext();const q=await ctx2.newPage();await q.emulateTimezone('Africa/Casablanca');await q.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
q.on('pageerror',e=>ERR.push('Q pageerror '+e.message));q.on('dialog',d=>d.accept());
await q.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
await q.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});await q.waitForFunction(()=>window.CJSync&&window.CJSync.state.sdk,{timeout:20000});
await q.evaluate(s=>window.CJApp.applyJSON(s),JSON.stringify(data));await sleep(400);
const signIn=async()=>{await skipSplash(q);await q.evaluate(()=>{if(window.CJLanding&&window.CJLanding.toGate)window.CJLanding.toGate();const b=document.getElementById('lnLogin');if(b)b.click();});
  await q.waitForSelector('#gEmail',{visible:true,timeout:15000}).catch(async()=>{await q.evaluate(()=>{const t=[...document.querySelectorAll('#gate button,#gate a')].find(x=>/e-mail/i.test(x.textContent));if(t)t.click();});await q.waitForSelector('#gEmail',{visible:true,timeout:8000});});
  await q.type('#gEmail',EM);await q.type('#gPass',PW);await q.click('#gGo');
  await q.waitForFunction(()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading&&!document.documentElement.classList.contains('cj-locked');},{timeout:60000,polling:300});};
await signIn();
const remote=async()=>{const m=await adminGet(`users/${UID}/cahier/meta`);const f=m.fields||{};if(!f.chunks||!+f.chunks.integerValue)return {meta:Object.keys(f).sort(),json:f.data&&f.data.stringValue};
  let out='';for(let i=0;i<+f.chunks.integerValue;i++){const c=await adminGet(`users/${UID}/cahier/chunk_${i}`);out+=c.fields.data.stringValue;}return {meta:Object.keys(f).sort(),json:out};};
const R0=await remote();
check('compte connecté (mode clair) : cahier envoyé ('+Math.round((R0.json||'').length/1024)+' Ko)',!!R0.json&&JSON.parse(R0.json).students.length===343);
await q.waitForFunction(()=>/Protégez les données/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:15000}).catch(()=>{});
check('première ouverture après connexion : le code est proposé automatiquement (explication + « Annuler » possible)',/Protégez les données/.test(await lockText(q))&&!!(await q.$('#cjCancel')));
await q.screenshot({path:SHOT+'/v29-1b-premiere-ouverture.png'});
await pad(q,'246810',true);await sleep(300);await pad(q,'246810',true);
await q.waitForFunction(()=>/Code activé/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:60000});await q.click('#cjDone');
// modification en mode chiffré → synchro
await q.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.querySelector('#tabs button[data-tab="attendance"]').click();});await sleep(800);
const qsid=await q.evaluate(()=>{const tr=document.querySelector('#gridWrap tr[data-sid]');return tr&&tr.dataset.sid;});
await q.evaluate(sid=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input.gin[data-k="g1"]');i.focus();i.value='4.75';i.dispatchEvent(new Event('change',{bubbles:true}));},qsid);await sleep(2500);
await q.evaluate(()=>window.CJSync.syncNow&&window.CJSync.syncNow());
await q.waitForFunction(()=>{const s=window.CJSync.state,m=window.CJSync.meta();return !m.dirty&&!s.uploading;},{timeout:30000});await sleep(800);
const R1=await remote();const local1=await q.evaluate(()=>window.CJApp.getJSON());
check('synchro en mode chiffré : document en ligne = JSON en clair d’origine, octet pour octet (aucune enveloppe envoyée), mêmes champs meta',R1.json===local1&&/4\.75/.test(R1.json)&&!R1.json.includes('"alg":"AES-GCM"')&&same(R1.meta,R0.meta),JSON.stringify([R1.json===local1,/4\.75/.test(R1.json||''),(R1.json||'').length,local1.length])+R1.meta.join(','));
const rawQ=await rawDump(q);check('stockage brut de l’appareil connecté : chiffré, aucun nom',rawQ.ls[KEY].startsWith(ENV)&&!NAMES.some(n=>JSON.stringify(rawQ.ls).includes(n)));
// code oublié : avertissement si non synchronisé
await q.reload({waitUntil:'networkidle2'});await sleep(400);
await q.evaluate(()=>{const m=JSON.parse(localStorage.getItem('classRegister.v2.sync'));m.dirty=true;localStorage.setItem('classRegister.v2.sync',JSON.stringify(m));});
await q.click('#cjForgot');await sleep(300);
check('« Code oublié ? » avec modifications non envoyées : avertissement de perte',/pas encore été envoyées/.test(await lockText(q))&&/définitivement perdues/.test(await lockText(q)));
await q.click('#cjBack');await sleep(200);
await q.evaluate(()=>{const m=JSON.parse(localStorage.getItem('classRegister.v2.sync'));m.dirty=false;localStorage.setItem('classRegister.v2.sync',JSON.stringify(m));});
await q.click('#cjForgot');await sleep(300);check('tout synchronisé : message rassurant',/tout était envoyé/.test(await lockText(q)));
await q.click('#cjWipe');await q.waitForNavigation({waitUntil:'networkidle2',timeout:30000}).catch(()=>{});await sleep(1500);
const wiped=await rawDump(q);
check('après effacement : plus de métadonnées ni de copie chiffrée, session de connexion supprimée → écran de connexion',!wiped.ls['classRegister.crypto']&&!Object.values(wiped.ls).some(v=>String(v).startsWith(ENV))&&!wiped.ls['cahier.authOk']&&await q.evaluate(()=>document.documentElement.classList.contains('cj-locked')&&CJCrypto.mode()==='plain'&&!(window.CJSync.state.user)));
const rem2=await remote();check('données en ligne intactes (pas d’envoi d’un cahier vide)',rem2.json===R1.json);
await signIn();await sleep(1500);
const back=await q.evaluate(()=>window.CJApp.getJSON());
check('reconnexion : cahier rechargé depuis le compte = version en ligne (343 élèves, note saisie en mode chiffré retrouvée ; seul l’état d’affichage ui diffère)',JSON.parse(back).students.length===343&&/4\.75/.test(back)&&(x=>{const o=JSON.parse(x);delete o.ui;return JSON.stringify(o);})(back)===(x=>{const o=JSON.parse(x);delete o.ui;return JSON.stringify(o);})(R1.json),(()=>{const A=back,B=R1.json||'';if(A===B)return 'égal';let i=0;while(A[i]===B[i])i++;return JSON.parse(back).students.length+' '+A.length+'/'+B.length+' @'+i+' '+A.slice(i-60,i+40)+' ≠ '+B.slice(i-60,i+40);})());
await q.waitForFunction(()=>/Protégez les données/.test((document.getElementById('cjLock')||{}).innerText||''),{timeout:15000}).catch(()=>{});
check('un nouveau code est proposé',/Protégez les données/.test(await lockText(q)));
await q.click('#cjCancel');await sleep(300);check('« Annuler » : reporté (cahier.cryptoLater), application utilisable',!(await q.$('#cjLock'))&&!!(await q.evaluate(()=>localStorage.getItem('cahier.cryptoLater'))));
await ctx2.close();
}
check('aucune erreur de page',ERR.length===0,ERR.join(' | ').slice(0,400));
fs.writeFileSync(SHOT+'/timings.json',JSON.stringify({enable:JSON.parse(tEnable),unlock:T1,save:tSave},null,1));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
