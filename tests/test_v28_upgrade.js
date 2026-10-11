/* Publication 1.28.0 : mise à jour réelle v1.27.0 → v1.28.0 (service worker) avec un jeu de données de la taille réelle
   (9 classes, 343 élèves, absences A/AJ, retards, M/MJ, ST, dispensés, tests physiques, groupes, photos) :
   classRegister.v2 identique octet pour octet, mêmes statistiques élève par élève, photos intactes,
   champs nouveaux (s.ev, DB.evals) ajoutés seulement à la première saisie d’une note. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8043;
const VOLD='/tmp/v27root';if(!fs.existsSync(VOLD+'/index.html')){fs.mkdirSync(VOLD,{recursive:true});cp.execSync('git -C '+D+' archive v1.27.0 | tar -x -C '+VOLD);}
let ROOT=VOLD;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain','.xml':'application/xml'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
// ---------- jeu de données « forme 1.27.0 » de la taille réelle ----------
let seedR=20261009;const rnd=()=>{seedR=(seedR*1103515245+12345)%2147483648;return seedR/2147483648;};const pick=a=>a[Math.floor(rnd()*a.length)];
const CL=['TCS1','TCS2','TCLSH1','1BACSE1','1BACSH2','2BACSP1','2BACSP4','2BACSVT2','2BACLSH1'];
const SIZES=[40,39,37,38,36,40,38,39,36]; // = 343
const FN=['Yassine','Salma','Omar','Nour','Adam','Imane','Mehdi','Aya','Rayan','Hiba','Anas','Lina','Ilyas','Douae','Reda','Rim','Hamza','Malak','Ismail','Sara'];
const LN=['AIT BENALI','BENNANI','CHAKIR','EL IDRISSI','LAHLOU','TAZI','FASSI','AMRANI','KETTANI','SAIDI','OUAZZANI','BERRADA','ZIANI','HAKIMI','SEBTI','NACIRI','TOUZANI','CHRAIBI','FILALI','GHARBI'];
const AR=['العلوي يوسف','بامعروف ياسين','رؤوفي سلمى','مسناوي إيمان','الصباحي حمزة','سيفي نور','الإدريسي سارة','بنعلي هدى','الزهراني ليلى','بوزيد مريم'];
function buildData(base){const d=JSON.parse(JSON.stringify(base));
  d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.periods=['Basket-ball','Athlétisme','Gymnastique','Hand-ball'];
  d.cal.cycles=[{from:'2026-09-14',to:'2026-10-24'},{from:'2026-11-02',to:'2026-12-19'},{from:'2027-01-04',to:'2027-02-27'},{from:'2027-03-08',to:'2027-05-15'}];d.cal.start='2026-09-14';
  d.cal.holidays=[{id:'h1',from:'2026-10-25',to:'2026-11-01',label:'Vacances intermédiaires',approx:false,off:false},{id:'h2',from:'2026-11-06',to:'',label:'Marche Verte',approx:false,off:false}];
  d.classes=CL.map((n,i)=>{const c={id:'c'+i,name:n};if(i===2)c.capM=4;if(i===8)c.cap=2;if(i%3===0){c.grp={names:['G1','G2','G3','G4'],of:{}};}return c;});
  d.students=[];let k=0;CL.forEach((n,ci)=>{for(let j=0;j<SIZES[ci];j++,k++){const ar=k%7===3;const f=rnd()<0.5;
    const s={id:'u'+String(k).padStart(3,'0'),classId:'c'+ci,name:ar?AR[k%AR.length]:pick(LN)+' '+pick(FN),dob:(2007+Math.floor(rnd()*4))+'-0'+(1+Math.floor(rnd()*9))+'-1'+Math.floor(rnd()*9),sid:'J1'+(30000000+k*1777),parent:'',phone:k%11?'':'06'+(10000000+k),notes:k%17?'':'Asthme',created:1757000000000+k,sex:f?'F':'G'};
    if(k%31===5)s.dispense={type:k%2?'S1':'annee',since:'2026-09-20'};
    if(k%2===0)s.phys={h:150+Math.floor(rnd()*40),w:45+Math.floor(rnd()*30),v30:+(4.2+rnd()*2).toFixed(2),nav:+(3+Math.floor(rnd()*20)/2)};
    if(k===42)s.futur={champ:'version future',n:1};
    if(d.classes[ci].grp&&j<SIZES[ci]-3)d.classes[ci].grp.of[s.id]=j%4;
    d.students.push(s);}});
  d.sessions={};const dates=['2026-09-15','2026-09-22','2026-09-29','2026-10-06','2026-10-13','2026-10-20'];
  CL.forEach((n,ci)=>{const ids=d.students.filter(s=>s.classId==='c'+ci).map(s=>s.id);[0,1].forEach(p=>{const S=p===0?6:2;for(let si=0;si<S;si++){const marks={};
    ids.forEach(id=>{const x=rnd();let m=null;if(x<0.06)m={s:'A',j:rnd()<0.3,r:''};else if(x<0.09)m={s:'L',j:false,r:''};else if(x<0.11)m={s:'M',j:rnd()<0.5,r:'Certificat'};else if(x<0.13)m={s:'ST',j:false,r:''};if(m)marks[id]=m;});
    d.sessions['c'+ci+'|'+p+'|'+si]={date:p===0?dates[si]:'2026-11-1'+(si+2),marks};}});});
  d.cal.tt=CL.map((n,ci)=>({id:'t'+ci,type:'class',day:1+ci%6,start:'08:30',end:'10:30',classId:'c'+ci,room:'Terrain '+(ci%3+1)}));d.cal.asInit=true;
  d.ui.cls='c6';d.lastBackup=Date.now();return d;}
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:180000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
const base=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)),KEY);
const data=buildData(base);
await p.evaluate((KEY,s)=>localStorage.setItem(KEY,s),KEY,JSON.stringify(data));
// photos déjà présentes (synchronisées depuis l’aperçu, par exemple) : 60 élèves
const jpg='data:image/jpeg;base64,'+fs.readFileSync(fs.readdirSync('/tmp/trombi/av').map(f=>'/tmp/trombi/av/'+f).sort()[0]).toString('base64');
const phIds=data.students.filter((s,i)=>i%6===0).map(s=>s.id);
await p.evaluate((ids,jpg)=>new Promise((res,rej)=>{const r=indexedDB.open('cahier-photos',1);r.onupgradeneeded=()=>{const db=r.result;['p','q'].forEach(n=>db.createObjectStore(n,{keyPath:'id'}));db.createObjectStore('m',{keyPath:'k'});};
  r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readwrite');ids.forEach((id,i)=>tx.objectStore('p').put({id,d:jpg,t:1791400000000+i}));tx.oncomplete=()=>{db.close();res();};tx.onerror=()=>rej(tx.error);};}),phIds,jpg);
await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(1500);
// enregistrement réel par v1.27.0 (même chemin que la synchronisation / restauration) : la forme stockée est exactement celle de 1.27.0
const ap=await p.evaluate(s=>window.CJApp.applyJSON(s),JSON.stringify(data));await sleep(800);await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(800);
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="students"]').click();});await sleep(300);
const FP=()=>p.evaluate(()=>{const R=window.CJR,d=R.db();const o={sem:R.semver,classes:d.classes.length,students:d.students.length,sessions:Object.keys(d.sessions).length,stu:{},tally:{}};
  Object.values(d.sessions).forEach(r=>Object.values(r.marks).forEach(m=>{const k=m.s+(m.j?'J':'');o.tally[k]=(o.tally[k]||0)+1;}));
  d.students.forEach(s=>{const y=R.yearStat(s.classId,s.id);o.stu[s.id]={n:s.name,c:s.classId,sid:s.sid,dob:s.dob,sex:s.sex||'',dsp:JSON.stringify(R.dspOf?R.dspOf(s)||null:s.dispense||null),phys:JSON.stringify(s.phys||null),
    y:JSON.stringify(y,(k,v)=>typeof v==='number'?Math.round(v*1000)/1000:v),p0:JSON.stringify(R.perStat(s.classId,s.id,0)),grp:(d.classes.find(c=>c.id===s.classId).grp||{of:{}}).of[s.id]};});return o;});
const raw=()=>p.evaluate(KEY=>localStorage.getItem(KEY),KEY);
const photos=()=>p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('cahier-photos');r.onsuccess=()=>{const db=r.result;if(!db.objectStoreNames.contains('p')){db.close();return res({n:0});}const q=db.transaction('p').objectStore('p').getAll();q.onsuccess=()=>{db.close();res({n:q.result.length,ids:q.result.map(x=>x.id).sort().join(','),bytes:q.result.reduce((a,x)=>a+x.d.length,0)});};};}));
const fp27=await FP();const raw27=await raw();const ph27=await photos();
check('v1.27.0 chargée avec 9 classes, 343 élèves, '+fp27.sessions+' séances, marques '+JSON.stringify(fp27.tally),fp27.sem==='1.27.0'&&fp27.classes===9&&fp27.students===343&&fp27.tally.A>0&&fp27.tally.AJ>0&&fp27.tally.L>0&&fp27.tally.M>0&&fp27.tally.MJ>0&&fp27.tally.ST>0);
// ---------- mise à jour : le serveur sert maintenant 1.28.0 ----------
ROOT=D;let sem='';for(let i=0;i<8&&sem!=='1.28.1';i++){await p.reload({waitUntil:'networkidle2'});await sleep(1200);sem=await p.evaluate(()=>window.CJR&&window.CJR.semver);}
await unlock();await sleep(1200);
const caches=await p.evaluate(()=>caches.keys());
check('mise à jour réelle par le service worker v1.27.0 → v'+sem+', cache '+caches.join(','),sem==='1.28.1'&&caches.includes('cahier-v28-1')&&!caches.includes('cahier-v27'));
const raw28=await raw();
check('classRegister.v2 identique octet pour octet après la mise à jour ('+raw27.length+' car.)',raw27===raw28);
const fp28=await FP();
const diff=Object.keys(fp27.stu).filter(id=>JSON.stringify({...fp27.stu[id]})!==JSON.stringify({...fp28.stu[id]}));
check('343 élèves : mêmes nom, classe, Massar, naissance, sexe, groupe, dispense, tests physiques et statistiques (A, AJ, R, M, MJ, ST, points) avant/après',fp28.students===343&&diff.length===0&&JSON.stringify(fp27.tally)===JSON.stringify(fp28.tally)&&fp27.sessions===fp28.sessions,diff.slice(0,3).map(id=>JSON.stringify(fp27.stu[id])+' ≠ '+JSON.stringify(fp28.stu[id])).join(' | ').slice(0,400));
const dsp=Object.values(fp28.stu).filter(s=>s.dsp!=='null').length,phy=Object.values(fp28.stu).filter(s=>s.phys!=='null').length;
check('dispensés ('+dsp+') et tests physiques ('+phy+') présents dans v1.28.0',dsp===11&&phy===172);
const ph28=await photos();
check('photos IndexedDB intactes ('+ph28.n+' photos)',ph28.n===phIds.length&&ph28.ids===ph27.ids&&ph28.bytes===ph27.bytes);
const lazy=JSON.parse(raw28);
check('aucun champ nouveau ajouté au chargement : ni s.ev, ni DB.evals',!lazy.evals&&lazy.students.every(s=>!s.ev));
// affichage : liste des élèves, fiche avec photo, grille Notes /20
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="students"]').click();});await sleep(500);
await p.evaluate(()=>{const f=document.getElementById('stuClassFilter');f.value='';f.dispatchEvent(new Event('change'));});await sleep(400);
const cnt=await p.evaluate(()=>document.body.innerText.match(/(\d+) sur (\d+) élèves/));
check('onglet Élèves : « 343 sur 343 élèves »',cnt&&cnt[1]==='343'&&cnt[2]==='343',cnt&&cnt[0]);
const pa=await p.evaluate(()=>window.CJR.photoAll().then(o=>Object.keys(o).length));
check('photos lisibles par 1.28.0 (trombinoscope / fiche)',pa===phIds.length,String(pa));
// première note : seuls s.ev (cet élève) et éventuellement DB.evals apparaissent
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(800);
const sid0=await p.evaluate(()=>{const tr=document.querySelector('#gridWrap tr[data-sid]');return tr&&tr.dataset.sid;});
await p.evaluate(sid=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input.gin[data-k="g1"]');i.focus();i.value='5';i.dispatchEvent(new Event('change',{bubbles:true}));},sid0);await sleep(1500);
const after=JSON.parse(await raw());const strip=x=>{const y=JSON.parse(JSON.stringify(x));delete y.evals;delete y.ui;delete y.lastBackup;y.students.forEach(s=>delete s.ev);const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.keys(v).sort().reduce((o,k)=>(o[k]=canon(v[k]),o),{}):v;return JSON.stringify(canon(y));};
const withEv=after.students.filter(s=>s.ev).map(s=>s.id);
check('première note saisie ('+sid0+') : seul s.ev de cet élève ajouté ; élèves, séances, classes, réglages inchangés (mêmes valeurs ; ordre des clés indifférent)',withEv.length===1&&withEv[0]===sid0&&strip(after)===strip(lazy),JSON.stringify({withEv,evals:!!after.evals}));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
fs.writeFileSync('/tmp/v28-release-upgrade-proof.json',JSON.stringify({from:fp27.sem,to:sem,students:343,sessions:fp27.sessions,tally:fp27.tally,classRegisterV2Equal:raw27===raw28,bytes:raw27.length,photos:ph28.n,lazyOk:!lazy.evals},null,1));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
