const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8243;
const R291='/tmp/v291root',RNEW='/tmp/v292final';const DATA='/workspace/backups/data-APRES-1.29.1-20261020.json';
fs.rmSync(R291,{recursive:true,force:true});fs.mkdirSync(R291,{recursive:true});cp.execSync('git -C '+D+' archive v1.29.1 | tar -x -C '+R291);
fs.rmSync(RNEW,{recursive:true,force:true});cp.execSync('mkdir -p '+RNEW+' && cd '+D+' && git ls-files | tar -cf - -T - | tar -xf - -C '+RNEW);
let ROOT=R291;const FAIL=new Set(),SLOW={},ERR500=new Set();const HITS=[];
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);HITS.push(u);if(FAIL.has(u)){FAIL.delete(u);let v=u.endsWith('/')?u+'index.html':u;const buf=fs.readFileSync(path.join(ROOT,v));r.writeHead(200,{'Content-Type':MT[path.extname(v)]||'application/octet-stream','Content-Length':buf.length,'Cache-Control':'no-cache'});r.write(buf.slice(0,buf.length>>1));return setTimeout(()=>q.socket.destroy(),50);} /* téléchargement coupé à mi-fichier */
  if(ERR500.has(u)){r.writeHead(500);return r.end('err');}
  const go=()=>{let v=u;if(v.endsWith('/'))v+='index.html';const f=path.join(ROOT,v);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
    r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);};
  if(SLOW[u])setTimeout(go,SLOW[u]);else go();}).listen(PORT);
const URL='http://localhost:'+PORT+'/?emu=1';
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
try{
let p=await newCtx();ROOT=R291;await p.goto(URL,{waitUntil:'networkidle2'});await opened(p).catch(()=>{});
await p.evaluate(s=>window.CJApp.applyJSON(s),fs.readFileSync(DATA,'utf8'));await sleep(1000);await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(1000);await unlockGate(p);
const L0=await logical(p);const D0=JSON.parse(L0.ls[KEY]);let c=await cks(p);
check('1.29.1 (production actuelle) : '+D0.classes.length+' classes, '+D0.students.length+' élèves, cache '+c.join(','),(await sem(p))==='1.29.1'&&c.includes('cahier-v29-1')&&D0.students.length>300);
const extra=await p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});
ROOT=RNEW;await p.reload({waitUntil:'domcontentloaded'});let ok=false;for(let i=0;i<60&&!ok;i++){await sleep(250);c=await cks(p);ok=c.includes('cahier-v29-2a-test');}
check('mise à jour détectée : cache cahier-v29-2 installé',ok,c.join(','));
await sleep(1500);await p.reload({waitUntil:'domcontentloaded'});await opened(p);await p.waitForFunction(()=>window.CJR&&window.CJR.photoAll,{timeout:30000});
const L1=await logical(p);c=await cks(p);
check('après mise à jour : version 1.29.2, contrôlée par le service worker',(await sem(p))==='1.29.2'&&await p.evaluate(()=>!!navigator.serviceWorker.controller),await sem(p));
check('classRegister.v2 identique octet pour octet',L1.ls[KEY]===L0.ls[KEY]);
const dif=await p.evaluate(ex=>Object.keys(ex).filter(k=>!/^classRegister\.v2\.snap|^cahier\.(appVersion|snapDay|cryptoLater)$/.test(k)).filter(k=>localStorage.getItem(k)!==ex[k]).map(k=>k+'='+String(ex[k]).slice(0,60)+' → '+String(localStorage.getItem(k)).slice(0,60)),extra);
check('toutes les clés localStorage de 1.29.1 conservées à l’identique (hors horodatages techniques)',dif.length===0,dif.join(' | '));
check('photos et sauvegardes IndexedDB conservées',same(L1.ph,L0.ph)&&Object.keys(L0.snd).every(k=>same(L1.snd[k],L0.snd[k])));
const snaps=await p.evaluate(()=>window.CJApp&&window.CJApp.snapList?window.CJApp.snapList().map(s=>s.label||s.l||''):Object.keys(localStorage).filter(k=>k.indexOf('classRegister.v2.snapm.')===0).map(k=>localStorage.getItem(k)));
check('sauvegarde automatique « Avant mise à jour » créée',JSON.stringify(snaps).includes('Avant mise à jour'),JSON.stringify(snaps).slice(0,200));
check('ancien cache cahier-v29-1 supprimé, seul cahier-v29-2 reste',!c.includes('cahier-v29-1')&&c.includes('cahier-v29-2a-test'),c.join(','));
const vl=await p.evaluate(()=>{const e=document.getElementById('verLine');return e?e.textContent:'';});
check('Paramètres : « Version 1.29.2 »',vl.trim()==='Version 1.29.2',vl);
check('aucune erreur JavaScript',ERR.length===0,ERR.join(' | '));
}catch(e){check('exception',false,e.stack);}
await b.close();srv.close();const n=results.filter(x=>x).length;console.log(n+'/'+results.length+' PASS');process.exit(n===results.length?0:1);})();
