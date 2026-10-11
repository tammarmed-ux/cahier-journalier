/* v1.28.1 : (1) Accueil + statistiques + Aujourd’hui + tableau de service + PDF rendus chaque jour de la semaine, DIMANCHE compris ;
   (2) en-têtes de sécurité (firebase.json) ; (3) lien invitation ↔ compte dans l’espace modérateur (émulateurs, règles INCHANGÉES) :
   les invitations non liées fonctionnent exactement comme avant, le lien bloque un autre compte portant la même adresse, « Délier » revient à l’état d’avant. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8046;
const P='cahier-journalier-2830a',AUTH='http://127.0.0.1:9099',FSU='http://127.0.0.1:8080',FSB=`${FSU}/v1/projects/${P}/databases/(default)/documents`,MOD='tammar.med@gmail.com';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
let ROOT=D;const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
const signUp=(email,pw)=>j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:pw,returnSecureToken:true})});
const adminUpdate=body=>j(AUTH+`/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:update`,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify(body)});
const fget=(p,tok='owner')=>fetch(`${FSB}/${p}`,{headers:{Authorization:'Bearer '+tok}}).then(async r=>({code:r.status,j:await r.json().catch(()=>null)}));
const fput=(p,fields,tok='owner')=>fetch(`${FSB}/${p}`,{method:'PATCH',headers:{'Content-Type':'application/json',Authorization:'Bearer '+tok},body:JSON.stringify({fields})}).then(r=>r.status);
const sv=v=>typeof v==='boolean'?{booleanValue:v}:typeof v==='number'?{integerValue:String(v)}:{stringValue:String(v)};const F=o=>Object.fromEntries(Object.entries(o).map(([k,v])=>[k,sv(v)]));
const b64=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
const tok=(uid,email,ver)=>{const t=Math.floor(Date.now()/1000);return b64({alg:'none',typ:'JWT'})+'.'+b64({iss:'https://securetoken.google.com/'+P,aud:P,sub:uid,user_id:uid,iat:t,exp:t+3600,auth_time:t,email,email_verified:!!ver,firebase:{sign_in_provider:'password'}})+'.';};
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:120000,args:['--no-sandbox','--disable-dev-shm-usage']});
// ================= 0. statique =================
const idx=fs.readFileSync(D+'/index.html','utf8'),sw=fs.readFileSync(D+'/sw.js','utf8'),fj=JSON.parse(fs.readFileSync(D+'/firebase.json','utf8'));
check('version 1.28.1 / cache cahier-v28-1 (APP_VER = sw.js)',/var APP_SEMVER='1\.28\.1'/.test(idx)&&/var APP_VER='cahier-v28-1'/.test(idx)&&/const CACHE = 'cahier-v28-1'/.test(sw));
const rulesDiff=cp.execSync('git -C '+D+' diff v1.28.0 -- firestore.rules').toString();
check('firestore.rules identique à v1.28.0',rulesDiff==='');
const keys=h=>[...new Set((h.match(/['"](classRegister\.v2[\w.]*|cahier\.[A-Za-z][\w.]*)['"]/g)||[]).map(x=>x.slice(1,-1)))].sort().join();
const old=cp.execSync('git -C '+D+' show v1.28.0:index.html',{maxBuffer:1e8}).toString(),idb=h=>(h.match(/indexedDB\.open\('[^']+'/g)||[]).sort().join();
check('clés localStorage / bases IndexedDB identiques à v1.28.0',keys(idx)===keys(old)&&idb(idx)===idb(old),idb(idx));
const H=Object.fromEntries((fj.hosting.headers.find(h=>h.source==='**')||{headers:[]}).headers.map(h=>[h.key,h.value]));
check('en-têtes de sécurité sur ** : nosniff, Referrer-Policy, HSTS, X-Frame-Options SAMEORIGIN, frame-ancestors self, Permissions-Policy camera=(self)',H['X-Content-Type-Options']==='nosniff'&&H['Referrer-Policy']==='strict-origin-when-cross-origin'&&/max-age=\d{8}/.test(H['Strict-Transport-Security'])&&H['X-Frame-Options']==='SAMEORIGIN'&&H['Content-Security-Policy']==="frame-ancestors 'self'"&&/camera=\(self\)/.test(H['Permissions-Policy']),JSON.stringify(H));
const allH=JSON.stringify(fj.hosting.headers);
check('pas de COOP/COEP (connexion Google en fenêtre) ni de CSP de scripts',!/Cross-Origin-Opener-Policy|Cross-Origin-Embedder-Policy|script-src|default-src/.test(allH));
// ================= 1. chaque jour de la semaine, dimanche compris =================
const DAYS=['2026-10-12','2026-10-13','2026-10-14','2026-10-15','2026-10-16','2026-10-17','2026-10-18','2026-10-11'];
const NAMES=['lun.','mar.','mer.','jeu.','ven.','sam.','dim.','dim.'];
for(let di=0;di<DAYS.length;di++){const day=DAYS[di];
  const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  await p.evaluateOnNewDocument(t=>{const R=Date,T=new R(t).getTime(),o=R.now();class Fk extends R{constructor(...a){super(...(a.length?a:[T+(R.now()-o)]));}static now(){return T+(R.now()-o);}}window.Date=Fk;try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}},day+'T10:30:00');
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now();
    const C=['2BACSP4','1BACLSH2','TCS1'].map(n=>d.classes.find(x=>x.name===n)||d.classes[0]);
    const NM=['AIT BENALI Yassine','BENNANI Salma','بامعروف ياسين','رؤوفي سلمى','CHAKIR Omar','EL IDRISSI Nour'];d.students=[];
    C.forEach((c,ci)=>NM.forEach((n,i)=>d.students.push({id:'s'+ci+'_'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J1'+ci+(3000000+i),dob:'2009-0'+(1+i)+'-12',parent:'',phone:'',notes:'',created:1})));
    d.cal.tt=[1,2,3,4,5,6].map(dd=>({id:'t'+dd,type:'class',day:dd,start:'08:30',end:'10:30',classId:C[dd%3].id,room:'Terrain'}));d.ui.cls=C[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
  await p.reload({waitUntil:'networkidle2'});
  await p.evaluate(KEY=>{const A=window.CJR,d=A.db(),T=A.todayStr(),raw=JSON.parse(localStorage.getItem(KEY)),S={};
    d.classes.forEach(c=>{const st=d.students.filter(s=>s.classId===c.id);if(!st.length)return;A.colsOf(c.id,0).filter(x=>!x.hol&&x.date&&x.date<=T).forEach((col,k)=>{const m={};m[st[k%st.length].id]={s:['A','L','M','ST'][k%4],j:k%5===0};S[c.id+'|0|'+col.s]={date:'',marks:m};});});
    raw.sessions=S;localStorage.setItem(KEY,JSON.stringify(raw));},KEY);
  await p.reload({waitUntil:'networkidle2'});
  await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});await sleep(500);
  await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(500);
  const r=await p.evaluate(()=>({stats:!!document.getElementById('homeStats'),cap:(document.getElementById('hsCap')||{}).textContent||'',today:!!document.getElementById('homeToday'),tt:!!document.getElementById('ttCard'),tiles:document.querySelectorAll('#homeStats .hs').length,wd:new Date().getDay()}));
  const want=NAMES[di]+' '+day.slice(8,10)+'/'+day.slice(5,7);
  check(day+' ('+NAMES[di]+') : Accueil complet (statistiques, Aujourd’hui, tableau de service), légende « … '+want+' »',r.stats&&r.today&&r.tt&&r.tiles>=8&&r.cap.includes(want)&&errs.length===0,(errs[0]||'')+' '+r.cap.slice(0,140));
  if(di===6||di===0){await p.evaluate(()=>new Promise((res,rej)=>{const L=['vendor/jspdf.umd.min.js','vendor/jspdf.plugin.autotable.min.js','vendor/bidi-js.min.js','cj-pdf.js'];(function n(i){if(i>=L.length)return res();const e=document.createElement('script');e.src=L[i];e.onload=()=>n(i+1);e.onerror=rej;document.head.appendChild(e);})(0);}));
    const pdf=await p.evaluate(async()=>{const cid=window.CJR.db().ui.cls,out=[];for(const [k,o] of [['cycle',{cid,p:0}],['year',{cid}],['trombi',{cid,mode:'page'}],['grades',{cid,p:0}]]){try{const x=await window.CJPDF.make(k,o);out.push(k+':'+x.blob.size);}catch(e){out.push(k+':ERR '+e.message);}}return out;});
    check(day+' : PDF registre du cycle, bilan annuel, trombinoscope, relevé de notes générés',pdf.every(x=>/:\d{4,}$/.test(x))&&errs.length===0,pdf.join(' '));}
  if(di===6&&process.env.SHOT){await p.screenshot({path:'/workspace/screens/cj1281-accueil-dimanche-local.png'});}
  await p.browserContext().close();}
// ================= 1b. mise à jour réelle v1.28.0 → v1.28.1 (téléphones actuels) =================
{const V0='/tmp/v280root';if(!fs.existsSync(V0+'/index.html')){fs.mkdirSync(V0,{recursive:true});cp.execSync('git -C '+D+' archive v1.28.0 | tar -x -C '+V0);}
  ROOT=V0;const p=await (await b.createBrowserContext()).newPage();/* 1.28.0 plante sur l’Accueil le dimanche : on simule un lundi pour la partie 1.28.0 */await p.evaluateOnNewDocument(()=>{const R=Date,T=new R('2026-10-12T10:30:00').getTime(),o=R.now();class Fk extends R{constructor(...a){super(...(a.length?a:[T+(R.now()-o)]));}static now(){return T+(R.now()-o);}}window.Date=Fk;try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<40;i++)d.students.push({id:'u'+i,classId:d.classes[i%9].id,name:'Élève '+i,sid:'J1'+(1000+i),dob:'2009-01-0'+(1+i%9),notes:'',created:1,sex:i%2?'F':'G',ev:i===3?{[d.classes[3].id+'|0']:{g1:5,aps:'coll'}}:undefined,phys:i%3?{h:160}:undefined,dispense:i===7?{type:'annee',since:'2026-09-20'}:undefined});
    d.sessions={[d.classes[0].id+'|0|0']:{date:'2026-09-15',marks:{u0:{s:'A',j:true,r:''},u9:{s:'L',j:false,r:''},u18:{s:'M',j:false,r:'x'},u27:{s:'ST',j:false,r:''}}}};d.evals={aps:{[d.classes[3].id+'|0']:'coll'}};return window.CJApp.applyJSON(JSON.stringify(d));},KEY);
  await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(1500);
  const v0=await p.evaluate(()=>window.CJR.semver),raw0=await p.evaluate(K=>localStorage.getItem(K),KEY);
  ROOT=D;let sem='';for(let i=0;i<8&&sem!=='1.28.1';i++){await p.reload({waitUntil:'networkidle2'});await sleep(1200);sem=await p.evaluate(()=>window.CJR&&window.CJR.semver);}
  await sleep(1200);const raw1=await p.evaluate(K=>localStorage.getItem(K),KEY),cs=await p.evaluate(()=>caches.keys());
  check('mise à jour réelle v'+v0+' → v'+sem+' : classRegister.v2 identique octet pour octet, cache '+cs.join(','),v0==='1.28.0'&&sem==='1.28.1'&&raw0===raw1&&cs.includes('cahier-v28-1')&&!cs.includes('cahier-v28')&&errs.length===0,raw0.length+' car. '+errs.join('|'));
  await p.browserContext().close();}
// ================= 2. lien invitation ↔ compte (émulateurs) =================
await fetch(`${FSU}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});
await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
const modPw='ModPass-123456',mu=await signUp(MOD,modPw);await adminUpdate({localId:mu.localId,emailVerified:true});
const A1=await signUp('ancien@test.ma','Ancien-123456');      // invité avant 1.28.1 via « Autoriser ce compte existant » : fiche SANS uid
const A2=await signUp('lie@test.ma','LiePass-123456');         // créé par « Créer l’accès » : fiche AVEC uid (déjà lié)
const A3=await signUp('double@test.ma','Double-123456');       // deux profils avec la même adresse (cas ambigu)
// fiches members au format 1.28.0
await fput('members/ancien@test.ma',{name:sv('Mme Ancienne'),email:sv('ancien@test.ma'),active:sv(true),createdBy:sv(MOD)});
await fput('members/lie@test.ma',{name:sv('M. Lié'),email:sv('lie@test.ma'),active:sv(true),uid:sv(A2.localId),createdBy:sv(MOD)});
await fput('members/jamais@test.ma',{name:sv('M. Jamais connecté'),email:sv('jamais@test.ma'),active:sv(true),createdBy:sv(MOD)});
await fput('members/double@test.ma',{name:sv('Mme Double'),email:sv('double@test.ma'),active:sv(true),createdBy:sv(MOD)});
await fput('profiles/OLD-DOUBLE-UID',{uid:sv('OLD-DOUBLE-UID'),email:sv('double@test.ma'),name:sv('Mme Double'),classCount:sv(1),studentCount:sv(3)});
// le collègue « ancien » utilise l’application (vraie connexion, synchro, profil) AVANT la mise à jour du modérateur
const newPage=async(label,errs)=>{const ctx=await b.createBrowserContext();const pg=await ctx.newPage();await pg.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await pg.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});pg.on('dialog',d=>d.accept());pg.on('pageerror',e=>errs.push(label+' '+e.message));
  await pg.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});await pg.waitForFunction(()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined,{timeout:20000});
  await pg.evaluate(()=>window.CJIntro&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));await sleep(400);return pg;};
const signIn=async(pg,email,pw)=>{await pg.waitForSelector('#gEmail',{visible:true,timeout:15000});await pg.$eval('#gEmail',e=>e.value='');await pg.$eval('#gPass',e=>e.value='');await pg.type('#gEmail',email);await pg.type('#gPass',pw);await pg.click('#gGo');
  await pg.waitForFunction(e=>(window.CJSync.state.user&&window.CJSync.state.user.email===e),{timeout:20000},email);};
const synced=pg=>pg.waitForFunction(()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading;},{timeout:30000,polling:200});
const E=[];
const memberRun=async(email,pw,uid,label,seedN)=>{const pg=await newPage(label,E);
  if(seedN){await pg.evaluate((KEY,n)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<n;i++)d.students.push({id:'m'+i,classId:d.classes[0].id,name:'Élève '+i,notes:'',created:1});localStorage.setItem(KEY,JSON.stringify(d));},KEY,seedN);await pg.reload({waitUntil:'networkidle2'});await pg.waitForFunction(()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);await pg.evaluate(()=>window.CJIntro&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));}
  await signIn(pg,email,pw);await pg.waitForFunction(()=>['member','denied'].includes(window.CJSync.state.role),{timeout:20000});const role=await pg.evaluate(()=>window.CJSync.state.role);
  if(role==='member')await synced(pg);const n=await pg.evaluate(()=>window.CJR.db().students.length);await pg.browserContext().close();return {role,n};};
const r1=await memberRun('ancien@test.ma','Ancien-123456',A1.localId,'ancien',4);
const r3=await memberRun('double@test.ma','Double-123456',A3.localId,'double',2);
check('avant le lien (fiches 1.28.0 sans uid) : collègues « ancien » et « double » ont accès et synchronisent comme avant',r1.role==='member'&&r3.role==='member'&&r1.n===4,JSON.stringify([r1,r3]));
const metaBefore=JSON.stringify((await fget(`users/${A1.localId}/cahier/meta`)).j.fields);
// faille d’origine : un autre compte (même adresse, autre uid) passe tant que la fiche n’est pas liée
check('avant le lien : un autre compte portant la même adresse est accepté (faille de l’audit)',(await fput('users/INTRUS/cahier/meta',F({v:1}),tok('INTRUS','ancien@test.ma',false)))===200);
// le modérateur ouvre son espace
const mod=await newPage('mod',E);await signIn(mod,MOD,modPw);await mod.waitForFunction(()=>window.CJSync.state.role==='mod',{timeout:20000});
await mod.click('#tabs button[data-tab="settings"]');await mod.waitForFunction(()=>document.querySelectorAll('#modCard .mrow').length===4,{timeout:20000});await sleep(500);
const rows=await mod.evaluate(()=>Object.fromEntries([...document.querySelectorAll('#modCard .mrow')].map(r=>[r.dataset.mid,{st:(r.querySelector('.mlink')||{}).textContent,link:r.querySelectorAll('[data-mact="link"]').length,unlink:!!r.querySelector('[data-mact="unlink"]')}])));
const all=await mod.evaluate(()=>{const x=document.getElementById('mdLinkAll');return x&&x.textContent;});
check('espace modérateur : statut de lien par invitation + bouton « Lier l’invitation » (1 non ambiguë)',/liée à son compte/.test(rows['lie@test.ma'].st)&&rows['lie@test.ma'].unlink&&/non liée/.test(rows['ancien@test.ma'].st)&&rows['ancien@test.ma'].link===1&&/après sa première synchro/.test(rows['jamais@test.ma'].st)&&rows['jamais@test.ma'].link===0&&/2 comptes/.test(rows['double@test.ma'].st)&&rows['double@test.ma'].link===2&&/Lier l’invitation/.test(all||''),JSON.stringify(rows)+' | '+all);
if(process.env.SHOT){await mod.evaluate(()=>{const c=document.getElementById('modCard');window.scrollTo(0,c.getBoundingClientRect().top+window.scrollY-70);});await sleep(400);await mod.screenshot({path:'/workspace/screens/cj1281-invitations.png'});}
const memBefore=(await fget('members/ancien@test.ma')).j.fields;
await mod.click('#mdLinkAll');await mod.waitForFunction(()=>{const r=document.querySelector('#modCard .mrow[data-mid="ancien@test.ma"] .mlink');return r&&/liée à son compte/.test(r.textContent);},{timeout:20000});
const memAfter=(await fget('members/ancien@test.ma')).j.fields;
const same=k=>JSON.stringify(memBefore[k])===JSON.stringify(memAfter[k]);
check('« Lier » : members/ancien@test.ma reçoit uid = compte utilisé ; nom, e-mail, actif, créateur inchangés',memAfter.uid&&memAfter.uid.stringValue===A1.localId&&['name','email','active','createdBy'].every(same),JSON.stringify(Object.keys(memAfter)));
check('« Lier tout » ne touche pas les invitations ambiguës ni jamais connectées',!(await fget('members/double@test.ma')).j.fields.uid&&!(await fget('members/jamais@test.ma')).j.fields.uid);
check('après le lien : le compte de la collègue lit/écrit toujours son cahier',(await fget(`users/${A1.localId}/cahier/meta`,tok(A1.localId,'ancien@test.ma',false))).code===200);
check('après le lien : un autre compte portant la même adresse est REFUSÉ',(await fput('users/INTRUS2/cahier/meta',F({v:1}),tok('INTRUS2','ancien@test.ma',false)))===403);
const r1b=await memberRun('ancien@test.ma','Ancien-123456',A1.localId,'ancien2',0);
check('après le lien : la collègue se reconnecte dans l’application, accès membre, ses 4 élèves rechargés',r1b.role==='member'&&r1b.n===4,JSON.stringify(r1b));
check('cahier de la collègue inchangé par le lien',JSON.stringify((await fget(`users/${A1.localId}/cahier/meta`)).j.fields)===metaBefore);
// choix explicite parmi 2 comptes
await mod.evaluate(uid=>{document.querySelector('#modCard .mrow[data-mid="double@test.ma"] [data-mact="link"][data-uid="'+uid+'"]').click();},A3.localId);
await mod.waitForFunction(()=>{const r=document.querySelector('#modCard .mrow[data-mid="double@test.ma"] .mlink');return r&&/liée/.test(r.textContent)&&!/non liée/.test(r.textContent);},{timeout:20000});
check('cas ambigu : lien au compte choisi uniquement',(await fget('members/double@test.ma')).j.fields.uid.stringValue===A3.localId&&(await fput('users/OLD-DOUBLE-UID/cahier/meta',F({v:1}),tok('OLD-DOUBLE-UID','double@test.ma',false)))===403);
// délier
await mod.evaluate(()=>document.querySelector('#modCard .mrow[data-mid="ancien@test.ma"] [data-mact="unlink"]').click());
await mod.waitForFunction(()=>{const r=document.querySelector('#modCard .mrow[data-mid="ancien@test.ma"] .mlink');return r&&/non liée/.test(r.textContent);},{timeout:20000});
const memUn=(await fget('members/ancien@test.ma')).j.fields;
check('« Délier » : uid retiré, retour à la fiche d’avant (hors updatedAt)',!memUn.uid&&['name','email','active','createdBy'].every(k=>JSON.stringify(memBefore[k])===JSON.stringify(memUn[k])));
// le modérateur garde son accès et sa synchro
check('modérateur : accès et synchronisation intacts',await mod.evaluate(()=>window.CJSync.state.role==='mod'&&window.CJSync.state.ready));
check('aucune erreur de page',E.length===0,E.join(' | ').slice(0,300));
await fetch(`${FSU}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
