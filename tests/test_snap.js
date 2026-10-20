/* Sauvegardes de sécurité locales : création à la changement de version, rétention 7, restauration + annulation, repli IndexedDB, données illisibles, synchro */
const CUR=(require('fs').readFileSync('/workspace/cj-deploy/sw.js','utf8').match(/CACHE = '([^']+)'/)||[])[1];
const puppeteer=require('puppeteer-core');const fs=require('fs');
const P='cahier-journalier-2830a',AUTH='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',MOD='tammar.med@gmail.com';
const KEY='classRegister.v2',SNAP=KEY+'.snap.',SNAPM=KEY+'.snapm.';
const results=[];function check(n,ok,x){results.push({n,ok:!!ok});console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
async function waitFor(page,fn,arg,timeout=20000){return page.waitForFunction(fn,{timeout,polling:200},arg);}
const snaps=p=>p.evaluate(async()=>{const l=await window.CJApp.snapshots();return l.map(x=>({t:x.t,why:x.why,nc:x.nc,ns:x.ns,where:x.where}));});
const H=async p=>{await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin());document.documentElement.classList.remove('cj-locked');const g=document.getElementById('gate');if(g)g.style.display='none';const s=document.getElementById('splash');if(s)s.remove();});};
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
await p.goto('http://localhost:8000/',{waitUntil:'networkidle2'});await H(p);
// données : 3 élèves, ancienne version de l'app mémorisée
const seed=(n,tag)=>p.evaluate((KEY,n,tag)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<n;i++)d.students.push({id:tag+i,classId:d.classes[0].id,name:tag+' Élève '+i,sid:'K10000000'+i,dob:'',parent:'',phone:'',notes:'',created:1});
  d.sessions={};d.sessions[d.classes[0].id+'|0|0']={date:'',marks:{}};localStorage.setItem(KEY,JSON.stringify(d));},KEY,n,tag);
await seed(3,'V18');
const before=await p.evaluate(KEY=>{localStorage.setItem('cahier.appVersion','cahier-v18');Object.keys(localStorage).filter(k=>k.indexOf(KEY+'.snap')===0).forEach(k=>localStorage.removeItem(k));return localStorage.getItem(KEY);},KEY);
await p.reload({waitUntil:'networkidle2'});await H(p);
let l=await snaps(p);
check('version change → 1 snapshot "Avant mise à jour"',l.length===1&&new RegExp('Avant mise à jour cahier-v18 → '+CUR).test(l[0].why),JSON.stringify(l));
const snapRaw=await p.evaluate((SNAP)=>{const k=Object.keys(localStorage).find(k=>k.indexOf(SNAP)===0);return localStorage.getItem(k);},SNAP);
check('snapshot = exact copy of pre-update classRegister.v2',snapRaw===before);
check('app version stored',await p.evaluate(()=>localStorage.getItem('cahier.appVersion'))===CUR);
const after=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).students.length,KEY);
check('classRegister.v2 key untouched (same data)',after===3);
await p.reload({waitUntil:'networkidle2'});await H(p);
check('same version: no new snapshot',(await snaps(p)).length===1);
// carte Paramètres
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);
const card=await p.evaluate(()=>({t:document.querySelector('#snapCard h2').textContent,rows:document.querySelectorAll('#snapList .snaprow').length,txt:document.querySelector('#snapList').innerText,btns:[...document.querySelectorAll('#snapCard button')].map(x=>x.textContent.trim())}));
check('card "Sauvegardes de sécurité" lists snapshot with date, classes, students',card.t==='Sauvegardes de sécurité'&&card.rows===1&&/classes?/.test(card.txt)&&/3 élèves/.test(card.txt)&&/\d{2}\/\d{2}\/\d{4} à \d{2}h\d{2}/.test(card.txt),card.txt.replace(/\n/g,' | '));
check('buttons Restaurer / Télécharger (JSON) / Créer maintenant',card.btns.some(x=>x==='Restaurer')&&card.btns.some(x=>/Télécharger \(JSON\)/.test(x))&&card.btns.some(x=>/Créer une sauvegarde maintenant/.test(x)),card.btns.join(' | '));
// création manuelle
await p.evaluate(k=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open(k);},'snap');await p.click('#snapNow');await sleep(500);
check('"Créer maintenant" adds a snapshot',(await snaps(p)).length===2);
// rétention : 12 instantanés de contenus différents → 7
for(let i=0;i<12;i++){await seed(4+i,'R'+i);await p.evaluate(()=>window.CJApp.snapshot('test',{force:true}));await sleep(5);}
l=await snaps(p);
check('retention: only last 7 kept',l.length===7,'n='+l.length);
check('retention: newest kept, sorted desc',l[0].ns===15&&l.every((x,i)=>!i||l[i-1].t>x.t)&&l[6].ns===9,l.map(x=>x.ns).join(','));
check('daily snapshot flag set / no duplicate for identical data',await p.evaluate(()=>{const a=window.CJApp.snapshot('dup',{});return !!(a.skip||a.same);}));
// restauration + annulation
await seed(2,'A');await p.reload({waitUntil:'networkidle2'});await H(p);
await p.evaluate(()=>window.CJApp.snapshot('etat A',{force:true}));
await seed(5,'B');await p.reload({waitUntil:'networkidle2'});await H(p);
const listBefore=await snaps(p);const rowA=listBefore.find(x=>x.why==='etat A');
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);
await Promise.all([p.waitForNavigation({waitUntil:'networkidle2',timeout:30000}),p.evaluate(t=>document.querySelector('#snapList .snaprow[data-t="'+t+'"] [data-snap="rs"]').click(),rowA.t)]);
await H(p);
const restored=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).students.map(s=>s.name),KEY);
check('Restaurer: data = snapshot A (reloaded)',restored.length===2&&restored[0].startsWith('A '),restored.join(','));
l=await snaps(p);const pre=l.find(x=>/^Avant restauration du /.test(x.why));
check('restore first snapshots the current state (5 students)',!!pre&&pre.ns===5,JSON.stringify(pre));
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);
await Promise.all([p.waitForNavigation({waitUntil:'networkidle2',timeout:30000}),p.evaluate(t=>document.querySelector('#snapList .snaprow[data-t="'+t+'"] [data-snap="rs"]').click(),pre.t)]);await H(p);
const undone=await p.evaluate(KEY=>JSON.parse(localStorage.getItem(KEY)).students.map(s=>s.name),KEY);
check('undo: restoring the "Avant restauration" snapshot brings back the 5 students',undone.length===5&&undone[0].startsWith('B '),undone.join(','));
check('still ≤ 7 snapshots after restores',(await snaps(p)).length<=7);
// données illisibles : jamais écrasées par du vide
await p.evaluate(KEY=>{localStorage.setItem(KEY,'{"classes":[');},KEY);
await p.reload({waitUntil:'networkidle2'});await H(p);
const rec=await p.evaluate(KEY=>({n:undefined,corrupt:localStorage.getItem(KEY+'.corrupt'),app:window.CJR.db().students.length}),KEY);
check('corrupt local data: raw copy kept + last valid snapshot recovered (no silent blank)',rec.corrupt==='{"classes":['&&rec.app>0,JSON.stringify({app:rec.app,corrupt:rec.corrupt}));
check('corrupt key itself left untouched on load (nothing overwritten)',await p.evaluate(KEY=>localStorage.getItem(KEY)==='{"classes":[',KEY));
// repli IndexedDB quand localStorage est plein pour les instantanés
const idb=await p.evaluate(async(SNAP)=>{const os=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){if(String(k).indexOf(SNAP)===0)throw new Error('QuotaExceededError');return os.apply(this,arguments);};
  const d=JSON.parse(JSON.stringify(window.CJR.db()));d.students.push({id:'idbx',classId:d.classes[0].id,name:'IDB Élève',sid:'',dob:'',parent:'',phone:'',notes:'',created:1});localStorage.setItem('classRegister.v2',JSON.stringify(d));
  const r=window.CJApp.snapshot('via idb',{force:true});const ok=r.p?await r.p:r.ok;Storage.prototype.setItem=os;const l=await window.CJApp.snapshots();return {ok,where:(l.find(x=>x.why==='via idb')||{}).where,n:l.length};},SNAP);
check('localStorage full → snapshot stored in IndexedDB and listed',idb.ok===true&&idb.where==='idb',JSON.stringify(idb));
// écriture du stockage plein : libère le plus ancien instantané pour sauver les données
const q=await p.evaluate(async(KEY,SNAP)=>{const os=Storage.prototype.setItem;let fails=1;const before=Object.keys(localStorage).filter(k=>k.indexOf(SNAP)===0).length;
  Storage.prototype.setItem=function(k,v){if(fails>0&&k===KEY){fails--;throw new Error('QuotaExceededError');}return os.apply(this,arguments);};
  const i=document.getElementById('setTeacher');document.querySelector('#tabs button[data-tab="settings"]').click();i.value='Quota test';i.dispatchEvent(new Event('change'));
  Storage.prototype.setItem=os;const after=Object.keys(localStorage).filter(k=>k.indexOf(SNAP)===0).length;return {before,after,saved:JSON.parse(localStorage.getItem(KEY)).settings.teacher};},KEY,SNAP);
check('storage full on save → oldest snapshot dropped, data still saved',q.saved==='Quota test'&&q.after<q.before,JSON.stringify(q));
// applyJSON vide sur données non vides → instantané préalable
const emp=await p.evaluate(async()=>{const A=window.CJApp;const n0=(await A.snapshots()).length;const b=JSON.parse(A.getJSON());b.students=[];b.sessions={};A.applyJSON(JSON.stringify(b));const l=await A.snapshots();return {n0,has:l.some(x=>/Avant remplacement par des données vides/.test(x.why))};});
check('replacing good data by empty data (sync) is preceded by a snapshot',emp.has,JSON.stringify(emp));
// --- synchro cloud : la restauration devient l'état en ligne ---
/* émulateurs remis à zéro (comme test_gate) : le compte modérateur peut déjà exister après un autre test */
await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
await fetch(`${FS}/emulator/v1/projects/${P}:securityRules`,{method:'PUT',body:JSON.stringify({rules:{files:[{content:require('fs').readFileSync('/workspace/cj-deploy/firestore.rules','utf8')}]}})});
const su=await j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:MOD,password:'ModPass-123456',returnSecureToken:true})});
await j(AUTH+`/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:update`,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:su.localId,emailVerified:true})});
const ctx2=await b.createBrowserContext();const m=await ctx2.newPage();await m.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
m.on('pageerror',e=>errs.push('mod '+e.message));m.on('dialog',d=>d.accept());
await m.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
await m.goto('http://localhost:8000/?emu=1',{waitUntil:'networkidle2'});
await waitFor(m,()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);await m.evaluate(()=>window.CJIntro&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));await sleep(400);
await m.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<3;i++)d.students.push({id:'m'+i,classId:d.classes[0].id,name:'CLOUD1 Élève '+i,sid:'',dob:'',parent:'',phone:'',notes:'',created:1});localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await m.reload({waitUntil:'networkidle2'});await waitFor(m,()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);await m.evaluate(()=>window.CJIntro&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));await sleep(400);
await m.type('#gEmail',MOD);await m.type('#gPass','ModPass-123456');await m.click('#gGo');
await waitFor(m,()=>window.CJSync.state.role==='mod'&&!document.documentElement.classList.contains('cj-locked'),null,30000);
const synced=()=>waitFor(m,()=>{const s=window.CJSync.state,x=window.CJSync.meta();return s.ready&&!x.dirty&&!s.uploading;},null,30000);
await synced();
const cloud=async()=>{const d=await j(`${FS}/v1/projects/${P}/databases/(default)/documents/users/${su.localId}/cahier/meta`,{headers:{Authorization:'Bearer owner'}});return d.fields&&d.fields.data?d.fields.data.stringValue:'';};
check('cloud has CLOUD1 data',(await cloud()).includes('CLOUD1 Élève 2'));
await m.evaluate(()=>window.CJApp.snapshot('etat CLOUD1',{force:true}));
await m.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();const d=window.CJR.db();d.students=d.students.slice(0,1);d.students[0].name='CLOUD2 seul';const i=document.getElementById('setThreshold');i.value=d.settings.threshold;i.dispatchEvent(new Event('change'));});
await sleep(600);await synced();await sleep(500);
check('cloud now has CLOUD2 (after local edit)',(await cloud()).includes('CLOUD2 seul'));
await m.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(600);
const rowT=await m.evaluate(async()=>{const l=await window.CJApp.snapshots();return l.find(x=>x.why==='etat CLOUD1').t;});
await Promise.all([m.waitForNavigation({waitUntil:'networkidle2',timeout:60000}).catch(()=>{}),m.evaluate(t=>document.querySelector('#snapList .snaprow[data-t="'+t+'"] [data-snap="rs"]').click(),rowT)]);
await waitFor(m,()=>window.CJSync&&window.CJSync.state.ready,null,30000);await sleep(800);
const c2=await cloud();
check('restore → restored data became the cloud state',c2.includes('CLOUD1 Élève 2')&&!c2.includes('CLOUD2 seul'));
check('login gate / role intact after restore (mod, unlocked)',await m.evaluate(()=>window.CJSync.state.role==='mod'&&!document.documentElement.classList.contains('cj-locked')));
await m.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);
await m.evaluate(()=>{const sp=document.getElementById('splash');if(sp)sp.remove();document.getElementById('snapCard').scrollIntoView();});await sleep(400);
await m.screenshot({path:'/workspace/cj-sauvegardes.png'});
// mode modérateur (lecture seule) : pas de carte, pas d'instantané
const ro=await m.evaluate(()=>{const A=window.CJApp;const n0=Object.keys(localStorage).filter(k=>k.indexOf('classRegister.v2.snap.')===0).length;A.enterView(A.getJSON(),'Test');const r=A.snapshot('vue',{force:true});const vis=getComputedStyle(document.getElementById('snapCard')).display;const n1=Object.keys(localStorage).filter(k=>k.indexOf('classRegister.v2.snap.')===0).length;A.exitView();return {skip:!!r.skip,vis,same:n0===n1};});
check('moderator read-only view: card hidden, no snapshot written',ro.skip&&ro.vis==='none'&&ro.same,JSON.stringify(ro));
check('no page errors',errs.filter(e=>!/firebase|Firestore|auth\/|net::ERR|Failed to load resource|WebChannel|googleapis/i.test(e)).length===0,errs.slice(0,3).join('|'));
const pass=results.filter(r=>r.ok).length;console.log(`\n${pass}/${results.length} passed`);await b.close();process.exit(pass===results.length?0:1);
})().catch(e=>{console.error(e);process.exit(2);});
