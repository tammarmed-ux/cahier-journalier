/* v1.25.1 : un client v1.24.0 (cache HTTP rempli + service worker) reçoit bien le logo B après mise à jour ; données inchangées */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');const crypto=require('crypto');
const seed=require('./seed_v24.js');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const IP={width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true};
const h=b=>crypto.createHash('sha1').update(b).digest('hex').slice(0,12);
function arch(tag,dir){if(!fs.existsSync(dir+'/index.html')){fs.mkdirSync(dir,{recursive:true});cp.execSync('git -C '+D+' archive '+tag+' | tar -x -C '+dir);}return dir;}
const R24=arch('v1.24.0','/tmp/v24root'),R250=arch('v1.25.0','/tmp/v250root');
/* serveur « façon Firebase Hosting » : en-têtes de firebase.json de la version servie, sinon max-age=3600 */
let ROOT=R24;const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain','.xml':'application/xml'};
function cc(root,u){let H=[];try{H=JSON.parse(fs.readFileSync(root+'/firebase.json','utf8')).hosting.headers;}catch(e){}
  for(const x of H){const re=new RegExp('^'+x.source.replace(/[.+?^${}()|[\]\\]/g,'\\$&').replace(/\*\*/g,'§').replace(/\*/g,'[^/]*').replace(/§/g,'.*')+'$');const c=(x.headers||[]).find(y=>/cache-control/i.test(y.key));if(c&&re.test(u))return c.value;}return 'max-age=3600';}
const hits={};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);const key=u;if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);hits[key]=(hits[key]||0)+1;
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':cc(ROOT,key)});fs.createReadStream(f).pipe(r);}).listen(8011);
const URL='http://localhost:8011/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});const errs=[];
async function client(){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport(IP);p.on('pageerror',e=>errs.push(e.message));
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
  ROOT=R24;await p.goto(URL,{waitUntil:'networkidle2'});await p.evaluate('('+seed.toString()+')('+JSON.stringify(KEY)+',"Lycée qualifiant Baja")');
  await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(1200);return p;}
const semver=p=>p.evaluate(()=>window.CJR&&window.CJR.semver);
async function upd(p,root,want){ROOT=root;let n=0,s='';while(n<6&&s!==want){await p.reload({waitUntil:'networkidle2'});n++;await sleep(1200);s=await semver(p);}return {n,s};}
const cached=(p,cache,u)=>p.evaluate(async(c,u)=>{const cc=await caches.open(c);const r=await cc.match(u);if(!r)return null;const a=new Uint8Array(await r.arrayBuffer());let s='';for(const x of a)s+=String.fromCharCode(x);return btoa(s);},cache,u).then(x=>x?h(Buffer.from(x,'base64')):null);
const file=(root,u)=>h(fs.readFileSync(root+'/'+u));
// ---------- diagnostic : v1.24.0 → v1.25.0 (ancien sw.js) reproduit le problème
const p1=await client();
check('client v1.24.0 prêt (service worker + cache HTTP remplis, logo carnet)',(await semver(p1))==='1.24.0'&&(await cached(p1,'cahier-v24','./favicon.ico'))===file(R24,'favicon.ico'));
const before=await p1.evaluate(K=>localStorage.getItem(K),KEY);
let u1=await upd(p1,R250,'1.25.0');
const stale=await cached(p1,'cahier-v25','./favicon.ico'),stale2=await cached(p1,'cahier-v25','./icons/icon-192.png');
check('diagnostic : avec le sw.js de 1.25.0, le nouveau cache recopie les anciennes icônes du cache HTTP (cause confirmée)',u1.s==='1.25.0'&&stale===file(R24,'favicon.ico')&&stale2===file(R24,'icons/icon-192.png')&&stale!==file(R250,'favicon.ico'),'favicon en cache '+stale+' = v1.24 '+file(R24,'favicon.ico')+' ≠ v1.25 '+file(R250,'favicon.ico'));
// ---------- correctif : ce même appareil (état v1.25.0 « bloqué ») → v1.25.1
const u2=await upd(p1,D,'1.25.1');
const ck=await p1.evaluate(()=>caches.keys());
check('mise à jour vers v1.25.1 en '+u2.n+' rechargement(s) normal(aux) ; anciens caches cahier-v24/v25 supprimés',u2.s==='1.25.1'&&u2.n<=2&&JSON.stringify(ck)==='["cahier-v25-1"]',JSON.stringify(ck));
const sw=fs.readFileSync(D+'/sw.js','utf8');const assets=[...sw.slice(sw.indexOf('const ASSETS'),sw.indexOf('];')).matchAll(/'\.\/([^']+)'/g)].map(m=>m[1]).filter(x=>x&&!x.endsWith('/'));
const bad=[];for(const a of assets){const c=await cached(p1,'cahier-v25-1','./'+a);if(c!==file(D,a))bad.push(a);}
check('toutes les ressources du nouveau cache = fichiers du serveur (aucune copie périmée, y compris favicon.ico au même nom)',bad.length===0&&assets.length>=15,bad.join(',')||assets.length+' fichiers');
async function logos(p){return p.evaluate(()=>[...document.querySelectorAll('img.sp-logo,.ln-brand img,.ln-art img,img.g-logo,img.h-logo')].map(i=>({src:i.getAttribute('src'),ok:i.complete&&i.naturalWidth>0})));}
const L=await logos(p1);
const served=await p1.evaluate(async()=>{const r=await fetch('icons/logo-b.svg');return await r.text();});
check('accueil, connexion, en-tête : logo B (icons/logo-b.svg) chargé, contenu = logo B (piste, sans livre)',L.length>=5&&L.every(x=>x.src==='icons/logo-b.svg'&&x.ok)&&/url\(#tr\)/.test(served)&&!/url\(#pg\)/.test(served),JSON.stringify(L.map(x=>x.src+':'+x.ok)));
const head=await p1.evaluate(()=>[...document.querySelectorAll('link[rel~="icon"],link[rel="apple-touch-icon"],link[rel="manifest"]')].map(l=>l.getAttribute('href')));
const man=await p1.evaluate(async()=>(await (await fetch('manifest.webmanifest')).json()).icons.map(i=>i.src));
check('favicons, apple-touch-icon et icônes du manifeste : nouvelles adresses (-b)',head.filter(x=>/icons\//.test(x)).every(x=>/-b[.-]/.test(x))&&man.every(x=>/-b[.-]/.test(x)),JSON.stringify(head)+' '+JSON.stringify(man));
const after=await p1.evaluate(K=>localStorage.getItem(K),KEY);
check('classRegister.v2 identique après v1.24.0 → v1.25.0 → v1.25.1 (chaîne brute)',!!before&&before===after,before&&before.length+' car.');
// captures (même appareil mis à jour) : accueil, connexion, en-tête
await p1.evaluate(()=>window.CJIntro&&window.CJIntro.skipSplash());await sleep(500);
await p1.screenshot({path:'/tmp/m1.png'});
await p1.evaluate(()=>window.CJLanding.toLogin());await sleep(500);await p1.screenshot({path:'/tmp/m2.png'});
await p1.evaluate(()=>{document.documentElement.classList.remove('cj-locked');window.scrollTo(0,0);});await sleep(500);await p1.screenshot({path:'/tmp/m3.png'});
// ---------- second client : v1.24.0 → v1.25.1 directement
const p2=await client();const b2=await p2.evaluate(K=>localStorage.getItem(K),KEY);const u3=await upd(p2,D,'1.25.1');const L2=await logos(p2);
check('client v1.24.0 → v1.25.1 directement : logo B en '+u3.n+' rechargement(s), cache unique cahier-v25-1, données identiques',u3.s==='1.25.1'&&u3.n<=2&&L2.every(x=>x.src==='icons/logo-b.svg'&&x.ok)&&JSON.stringify(await p2.evaluate(()=>caches.keys()))==='["cahier-v25-1"]'&&b2===(await p2.evaluate(K=>localStorage.getItem(K),KEY)));
check('en-têtes : icônes et favicon.ico servis en no-cache par firebase.json',cc(D,'/icons/logo-b.svg')==='no-cache'&&cc(D,'/favicon.ico')==='no-cache'&&cc(D,'/og-image-b.png')==='no-cache');
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,200));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
