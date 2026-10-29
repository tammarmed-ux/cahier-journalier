/* 1.29.2 (z-g) : déconnexion et visite hors session → nouvelle page /accueil/ ; « Se connecter » → écran de connexion sans boucle ;
   app installée (standalone) et hors ligne → écran de connexion de l’app (jamais /accueil/, jamais l’ancien accueil intégré) ; données locales intactes.
   Firebase simulé (modules factices servis à la place de gstatic). Port 8235. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8235,BASE='http://localhost:'+PORT+'/',sleep=ms=>new Promise(r=>setTimeout(r,ms));
let pass=0,fail=0;const check=(n,ok,x)=>{ok?pass++:fail++;console.log((ok?'PASS':'FAIL')+' - '+n+(ok?'':' '+JSON.stringify(x)));};
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.ico':'image/x-icon','.jpg':'image/jpeg'};
let DOWN=false;http.createServer((q,r)=>{if(DOWN){q.socket.destroy();return;}let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const DATA=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const P=new Promise(()=>{});const NEVER='()=>new Promise(()=>{})';
const FAKE={'firebase-app.js':`export const getApps=()=>[];export const initializeApp=()=>({name:'[DEFAULT]'});`,
 'firebase-auth.js':`let cb=null,cur=window.__FU||null;const a={currentUser:cur};
export const initializeAuth=()=>a,getAuth=()=>a,indexedDBLocalPersistence={},browserLocalPersistence={},inMemoryPersistence={},browserPopupRedirectResolver={},connectAuthEmulator=()=>{};
export function onAuthStateChanged(x,f){cb=f;setTimeout(()=>f(cur),50);return()=>{};}
export function signOut(){cur=null;a.currentUser=null;window.__out=(window.__out||0)+1;setTimeout(()=>cb&&cb(null),10);return Promise.resolve();}
export class GoogleAuthProvider{};export const EmailAuthProvider={credential(){return{};}};
export const signInWithEmailAndPassword=${NEVER},signInWithPopup=${NEVER},createUserWithEmailAndPassword=${NEVER},sendPasswordResetEmail=${NEVER},sendEmailVerification=${NEVER},updateProfile=${NEVER},updatePassword=${NEVER},reauthenticateWithCredential=${NEVER};`,
 'firebase-firestore.js':`const ref=(...x)=>({path:x.slice(1).map(String).join('/')});
export const getFirestore=()=>({}),setLogLevel=()=>{},connectFirestoreEmulator=()=>{},doc=ref,collection=ref,query=(q)=>q,where=()=>({}),serverTimestamp=()=>({}),deleteField=()=>({}),Timestamp={now:()=>({})};
export function onSnapshot(r,ok){if(/members/.test(r.path))setTimeout(()=>ok({metadata:{fromCache:false},exists:()=>true,data:()=>({active:true,uid:'u1'})}),30);return()=>{};}
export const getDocFromServer=${NEVER},getDocsFromServer=${NEVER},setDoc=${NEVER},updateDoc=${NEVER},runTransaction=${NEVER};`};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 /* ouvre un onglet : user = session Firebase (simulée) ou null ; authOk = compte déjà mémorisé ; sa = app installée ; fb = Firebase simulé chargé */
 const tab=async({w=1366,h=657,user=null,authOk=false,sa=false,fb=true,sw=false}={})=>{const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
  await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());if(!sw)await p.setBypassServiceWorker(true);
  await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();const m=/^https:\/\/www\.gstatic\.com\/firebasejs\/[^/]+\/(firebase-[a-z]+\.js)$/.exec(u);
   if(m&&fb&&FAKE[m[1]])return q.respond({status:200,contentType:'text/javascript',headers:{'Access-Control-Allow-Origin':'*'},body:FAKE[m[1]]});
   (u.startsWith(BASE)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument((o,user,authOk,sa)=>{if(!localStorage.getItem('classRegister.v2'))localStorage.setItem('classRegister.v2',o);localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));
   if(authOk&&!localStorage.getItem('cahier.authOk'))localStorage.setItem('cahier.authOk',JSON.stringify({uid:'u1',email:'prof@example.com',t:Date.now(),ok:true}));
   if(user)window.__FU={uid:'u1',email:'prof@example.com',emailVerified:true,displayName:'Prof EPS',providerData:[],isAnonymous:false};
   if(sa){const mm=window.matchMedia.bind(window);window.matchMedia=q=>/display-mode:\s*standalone/.test(q)?{matches:true,media:q,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}:mm(q);try{Object.defineProperty(navigator,'standalone',{get:()=>true});}catch(e){}}},DATA,user,authOk,sa);
  p.ctx=ctx;return p;};
 const where=p=>p.evaluate(()=>({path:location.pathname,hash:location.hash,title:document.title,gate:(()=>{const g=document.getElementById('gate');return !!g&&getComputedStyle(g).display!=='none'&&document.documentElement.classList.contains('cj-locked');})(),
  email:(()=>{const e=document.getElementById('gEmail');return !!e&&e.getClientRects().length>0;})(),land:(()=>{const l=document.getElementById('landing');return l?getComputedStyle(l).display:'absent';})(),
  oldText:/dans votre poche/.test(document.body.innerText),back:(()=>{const e=document.getElementById('gBack');return !!e&&e.getClientRects().length>0;})(),app:!document.documentElement.classList.contains('cj-locked')}));
 const ACC=x=>x.path==='/accueil/'&&/TATABO3/.test(x.title);
 const LOGIN=x=>x.path==='/'&&x.gate&&x.email&&x.land==='none'&&!x.oldText&&!x.app;
 const store=p=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});

 /* 1. visite hors session (aucun compte mémorisé), navigateur en ligne : PC et téléphone */
 for(const [w,h,l] of [[1366,657,'PC 1366×768'],[390,844,'téléphone 390']]){const p=await tab({w,h});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(800);const x=await where(p);
  const hist=await p.evaluate(()=>history.length);
  check(l+' : visite de / hors session → /accueil/ (remplacement : « Précédent » ne revient pas sur /)',ACC(x)&&hist<=2&&!p.errs.length,[x,hist,p.errs]);
  /* « Se connecter » → écran de connexion de l’app, sans boucle (même après le retour de Firebase « pas de session ») */
  if(w<600){await p.click('.burger');await sleep(400);}   /* téléphone : « Se connecter » est dans le menu ☰ */
  await p.click('a.btn.gh');
  await p.waitForNavigation({waitUntil:'networkidle0'}).catch(()=>null);await sleep(2500);const y=await where(p);
  check(l+' : « Se connecter » → écran de connexion de l’app (formulaire, pas l’ancien accueil, adresse propre « / »), pas de retour vers /accueil/',LOGIN(y)&&y.hash===''&&!p.errs.length,[y,p.errs]);
  await p.reload({waitUntil:'networkidle0'});await sleep(1500);const z=await where(p);check(l+' : rechargement de l’écran de connexion → reste sur l’écran de connexion (pas de boucle)',LOGIN(z),z);
  if(w>600){await p.click('#gBack');await p.waitForNavigation({waitUntil:'networkidle0'}).catch(()=>null);await sleep(500);const r=await where(p);check(l+' : « Retour à l’accueil » de l’écran de connexion → /accueil/',ACC(r),r);}
  await p.ctx.close();}

 /* 2. compte mémorisé mais plus de session (déconnecté auparavant) : / → /accueil/ dès la réponse de Firebase */
 {const p=await tab({authOk:true,user:null});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(1500);const x=await where(p);
  check('compte mémorisé, session terminée : visite de / → /accueil/ (après vérification Firebase)',ACC(x)&&!p.errs.length,[x,p.errs]);await p.ctx.close();}

 /* 3. déconnexion (PC et téléphone) : application ouverte → Déconnexion → /accueil/ ; données locales intactes */
 for(const [w,h,l] of [[1366,657,'PC 1366×768'],[390,844,'téléphone 390']]){const p=await tab({w,h,authOk:true,user:true});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(2500);
  const a=await where(p);const before=await store(p);
  await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(800);
  await p.evaluate(()=>{const e=document.getElementById('syOut');e.scrollIntoView({block:'center'});});await sleep(300);await p.click('#syOut').catch(()=>p.evaluate(()=>document.getElementById('syOut').click()));
  await p.waitForNavigation({waitUntil:'networkidle0',timeout:8000}).catch(()=>null);await sleep(800);const x=await where(p);const after=await store(p);
  const lost=Object.keys(before).filter(k=>!(k in after)),chg=Object.keys(before).filter(k=>k in after&&after[k]!==before[k]&&!/^(cahier\.(meta|sync|log)|cj\.)/.test(k));
  check(l+' : application ouverte (session simulée) puis « Déconnexion » → /accueil/',a.app&&ACC(x),[a.app,x,p.errs]);
  check(l+' : déconnexion — aucune clé locale supprimée, données (classRegister.v2, compte mémorisé) identiques',!lost.length&&after['classRegister.v2']===before['classRegister.v2']&&after['cahier.authOk']===before['cahier.authOk'],{lost,chg});
  await p.ctx.close();}

 /* 4. application installée (standalone) : jamais /accueil/ ; écran de connexion, sans « Retour à l’accueil » ; déconnexion → écran de connexion */
 {const p=await tab({w:390,h:844,sa:true});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(1200);const x=await where(p);
  check('app installée, aucun compte : / reste dans l’app → écran de connexion (ancien accueil masqué, pas de « Retour à l’accueil »)',LOGIN(x)&&!x.back,x);await p.ctx.close();}
 {const p=await tab({w:390,h:844,sa:true,authOk:true,user:null});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(1500);const x=await where(p);
  check('app installée, compte mémorisé sans session : écran de connexion (pas /accueil/)',LOGIN(x),x);await p.ctx.close();}
 {const p=await tab({w:390,h:844,sa:true,authOk:true,user:true});await p.goto(BASE,{waitUntil:'networkidle0'});await sleep(2500);
  await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(800);await p.evaluate(()=>document.getElementById('syOut').scrollIntoView({block:'center'}));await sleep(300);await p.click('#syOut').catch(()=>p.evaluate(()=>document.getElementById('syOut').click()));await sleep(2000);const x=await where(p);
  check('app installée : « Déconnexion » → écran de connexion de l’app (pas /accueil/)',LOGIN(x),x);await p.ctx.close();}

 /* 5. hors ligne (service worker installé) : / → écran de connexion depuis le cache ; /accueil/ → renvoi vers l’écran de connexion */
 {const p=await tab({w:1366,h:657,fb:false,sw:true});await p.goto(BASE+'#connexion',{waitUntil:'networkidle0'});
  await p.waitForFunction(()=>navigator.serviceWorker.controller||false,{timeout:20000}).catch(()=>null);if(!(await p.evaluate(()=>!!navigator.serviceWorker.controller))){await p.reload({waitUntil:'networkidle0'});}await sleep(2500);
  await p.evaluate(()=>sessionStorage.clear());await p.setOfflineMode(true);DOWN=true;   /* hors ligne : réseau émulé coupé + serveur injoignable (l’émulation hors ligne ne s’applique pas aux requêtes du service worker) */
  await p.goto(BASE,{waitUntil:'domcontentloaded'}).catch(()=>null);await sleep(2000);const x=await where(p);
  check('hors ligne, aucun compte : / → application depuis le cache, écran de connexion (pas /accueil/, pas l’ancien accueil)',LOGIN(x)&&await p.evaluate(()=>!navigator.onLine&&!!document.getElementById('tabs')),x);
  await p.goto(BASE+'accueil/',{waitUntil:'domcontentloaded'}).catch(()=>null);await sleep(2000);const y=await where(p).catch(e=>({err:e.message}));
  check('hors ligne : ouvrir /accueil/ → renvoi vers l’écran de connexion de l’app (pas de page d’erreur)',LOGIN(y),y);
  await p.setOfflineMode(false);await p.evaluate(()=>sessionStorage.clear());await p.goto(BASE,{waitUntil:'domcontentloaded'}).catch(()=>null);await sleep(5000);const v=await where(p).catch(e=>({err:e.message}));
  check('réseau « en ligne » mais serveur injoignable : / → /accueil/ échoue → renvoi vers l’écran de connexion (pas de boucle)',LOGIN(v),v);
  DOWN=false;await p.goto(BASE+'accueil/',{waitUntil:'networkidle0'});const z=await where(p);check('de retour en ligne : /accueil/ servie par le réseau',ACC(z),z);
  const ks=await p.evaluate(async()=>{const o=[];for(const n of await caches.keys())for(const r of await (await caches.open(n)).keys())o.push(new URL(r.url).pathname);return o;});
  check('aucune ressource /accueil/ dans le cache de l’app',!ks.some(k=>/accueil/.test(k)),ks.filter(k=>/accueil/.test(k)));await p.ctx.close();}
 await b.close();console.log(pass+'/'+(pass+fail)+' passed');process.exit(fail?1:0);})().catch(e=>{console.log('FAIL - exception '+e.stack);process.exit(1);});
