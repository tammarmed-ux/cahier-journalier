const puppeteer = require('puppeteer-core');
const P='cahier-journalier-2830a', AUTH='http://127.0.0.1:9099', FS='http://127.0.0.1:8080';
const URL='http://localhost:8000/?emu=1', KEY='classRegister.v2', MOD='tammar.med@gmail.com';
const results=[]; function check(name, ok, extra){results.push({name,ok:!!ok});console.log((ok?'PASS':'FAIL')+' - '+name+(extra?' :: '+extra:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const ERR=[];
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
async function signUp(email,pw){return j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:pw,returnSecureToken:true})});}
async function adminUpdate(body){return j(AUTH+`/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:update`,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify(body)});}
async function adminGet(path){return j(`${FS}/v1/projects/${P}/databases/(default)/documents/${path}`,{headers:{Authorization:'Bearer owner'}});}
async function waitFor(page,fn,arg,timeout=20000){return page.waitForFunction(fn,{timeout,polling:200},arg);}
async function ready(page){await waitFor(page,()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);await page.evaluate(()=>window.CJIntro&&(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));await sleep(500);}
async function newPage(browser,label,{onboarded=true}={}){
  const ctx=await browser.createBrowserContext();const page=await ctx.newPage();
  await page.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  if(onboarded)await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
  await page.evaluateOnNewDocument(()=>{window.__flash=[];const chk=w=>{const m=document.querySelector('main');if(m)window.__flash.push(w+':'+getComputedStyle(m).visibility+':'+document.documentElement.classList.contains('cj-locked'));};document.addEventListener('DOMContentLoaded',()=>{chk('dcl');requestAnimationFrame(()=>chk('raf'));});});
  page.on('dialog',d=>d.accept(d.type()==='prompt'?'SUPPRIMER':undefined));
  page.on('pageerror',e=>{ERR.push(label+' pageerror '+e.message);console.log(`[${label} pageerror]`,e.message);});
  page.on('console',m=>{if(m.type()==='error'){const t=m.text();ERR.push(label+' '+t);console.log(`[${label} console.error]`,t.slice(0,200));}});
  page.ctx=ctx;
  await page.goto(URL,{waitUntil:'networkidle2'});await ready(page);
  return page;
}
async function seed(page,prefix,n){
  await page.evaluate((KEY,prefix,n)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<n;i++)d.students.push({id:prefix+'s'+i,classId:d.classes[i%d.classes.length].id,name:prefix+' Élève '+i,notes:'',created:1});
    d.settings.teacher=prefix+' – Lycée';localStorage.setItem(KEY,JSON.stringify(d));},KEY,prefix,n);
  await page.reload({waitUntil:'networkidle2'});await ready(page);
}
const locked=page=>page.evaluate(()=>document.documentElement.classList.contains('cj-locked'));
const appText=page=>page.evaluate(()=>document.body.innerText);
async function gateSignIn(page,email,pw){
  await page.waitForSelector('#gEmail',{visible:true,timeout:15000});
  await page.$eval('#gEmail',e=>e.value='');await page.$eval('#gPass',e=>e.value='');
  await page.type('#gEmail',email);await page.type('#gPass',pw);await page.click('#gGo');
  await waitFor(page,e=>(window.CJSync.state.user&&window.CJSync.state.user.email===e)||document.getElementById('gDenied'),email);
}
async function gotoSettings(page){await page.click('#tabs button[data-tab="settings"]');await sleep(300);}
const role=page=>page.evaluate(()=>window.CJSync.state.role);
const ls=(page,k=KEY)=>page.evaluate(k=>localStorage.getItem(k),k);
const synced=page=>waitFor(page,()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading;},null,30000);
const hdr=page=>page.$eval('#hdrSub',e=>e.textContent);
async function tryOp(page,op,path,data){return page.evaluate(async(op,path,data)=>{const S=window.CJSync.state,F=S.sdk.F;try{const ref=path.split('/').length%2?F.collection(S.db,...path.split('/')):F.doc(S.db,...path.split('/'));
  if(op==='get'){const d=await F.getDocFromServer(ref);return 'ok:'+(d.exists()?'exists':'missing');}
  if(op==='list'){const q=await F.getDocsFromServer(ref);return 'ok:'+q.size;}
  if(op==='set'){await F.setDoc(ref,data);return 'ok';}}catch(e){return 'err:'+(e.code||e.message);}},op,path,data);}

(async()=>{
  await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});
  await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
  await fetch(`${FS}/emulator/v1/projects/${P}:securityRules`,{method:'PUT',body:JSON.stringify({rules:{files:[{content:require('fs').readFileSync('/workspace/cj-deploy/firestore.rules','utf8')}]}})});
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
  // ---------- 1. visitor ----------
  const vis=await newPage(browser,'visitor');
  check('visitor: app locked',await locked(vis));
  check('visitor: login form visible',await vis.$eval('#gate',e=>getComputedStyle(e).display!=='none')&&!!(await vis.$('#gEmail'))&&!!(await vis.$('#gGoogle'))&&!!(await vis.$('#gReset')));
  const vt=await appText(vis);
  check('visitor: no app UI text visible (tabs, header)',!/Paramètres|Absences|Rapports|élèves · /.test(vt),vt.slice(0,120).replace(/\n/g,' | '));
  check('visitor: main hidden from first paint',(await vis.evaluate(()=>window.__flash)).every(x=>x.includes(':hidden:true')),JSON.stringify(await vis.evaluate(()=>window.__flash)));
  check('visitor: no sign-up option',!/Créer un compte|S’inscrire|inscription/i.test(vt));
  check('visitor: titles/buttons in French',/Se connecter/.test(vt)&&/Se connecter avec Google/.test(vt)&&/Mot de passe oublié/.test(vt));
  await vis.screenshot({path:'/workspace/cj-login.png'});
  await vis.click('#gGo');await sleep(300);
  check('visitor: empty form error in French',(await appText(vis)).includes('Saisissez l’e-mail et le mot de passe.'));
  await vis.type('#gEmail','personne@example.com');await vis.type('#gPass','Mauvais-123');await vis.click('#gGo');
  await waitFor(vis,()=>/incorrect|Aucun compte|Erreur/.test(document.getElementById('gate').innerText));
  check('visitor: wrong credentials error in French',/incorrect|Aucun compte/.test(await vis.$eval('#gate',e=>e.innerText)),await vis.$eval('#gate .g-err',e=>e.textContent));
  await vis.evaluate(()=>document.getElementById('gReset').click());await sleep(1500);
  check('visitor: password reset message',/réinitialisation/.test(await vis.$eval('#gate',e=>e.innerText)));

  // ---------- 2. moderator ----------
  const modPw='ModPass-123456';const su=await signUp(MOD,modPw);const modUid=su.localId;
  const mod=await newPage(browser,'mod');
  await seed(mod,'MOD',3);
  check('mod device: seeded data hidden before sign-in',await locked(mod)&&!(await appText(mod)).includes('MOD'));
  await gateSignIn(mod,MOD,modPw);
  await waitFor(mod,()=>window.CJSync.state.role==='unverified');await sleep(300);
  check('unverified moderator: verification step inside gate, app locked',await locked(mod)&&!!(await mod.$('#gVerify'))&&!!(await mod.$('#gVerified')));
  await mod.click('#gVerify');await sleep(1200);
  check('  verification e-mail sent message',/vérification envoyé/.test(await mod.$eval('#gate',e=>e.innerText)));
  await adminUpdate({localId:modUid,emailVerified:true});
  await mod.click('#gVerified');
  await waitFor(mod,()=>window.CJSync.state.role==='mod'&&!document.documentElement.classList.contains('cj-locked'));
  check('verified moderator: app unlocked',true);
  await synced(mod);
  check('moderator local data adopted & synced',(await adminGet(`users/${modUid}/cahier/meta`)).fields.data.stringValue.includes('MOD Élève 2'));
  check('cahier.authOk stored',JSON.parse(await ls(mod,'cahier.authOk')).uid===modUid);
  await gotoSettings(mod);
  await waitFor(mod,()=>!document.getElementById('modCard').classList.contains('hidden')&&document.getElementById('mdCreate'));
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});   /* 1.29.1 (-u) : Paramètres en sous-pages — ouvrir « Espace modérateur » */
  check('moderator panel visible',true);
  check('settings: old sign-in form removed, status + Déconnexion kept',!(await mod.$('#syEmailOpen'))&&!(await mod.$('#syGoogle'))&&!!(await mod.$('#syOut'))&&(await mod.$eval('#syncCard',e=>e.innerText)).includes('Connecté en tant que'));
  async function createAccess(name,email){
    await mod.evaluate(()=>{document.getElementById('mdName').value='';document.getElementById('mdEmail').value='';});
    await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName',name);await mod.type('#mdEmail',email);await mod.$eval('#mdCreate',b=>b.click());
    await waitFor(mod,()=>document.getElementById('mdPw')&&!window.CJSync.state.mod.busy,null,20000);return mod.$eval('#mdPw',e=>e.textContent);}
  const pw1=await createAccess('Amina Benali','amina.test@example.com');
  check('moderator creates access (temp password)',pw1&&pw1.length===12);
  check('share message updated (no old Synchronisation path)',await mod.$eval('#mdMsg',e=>e.value.includes('connectez-vous avec votre e-mail')&&!e.value.includes('Se connecter avec e-mail')));
  const pw2=await createAccess('Youssef Alaoui','youssef.test@example.com');
  const aminaUid=(await adminGet('members/amina.test@example.com')).fields.uid.stringValue;
  const youUid=(await adminGet('members/youssef.test@example.com')).fields.uid.stringValue;

  // ---------- 3. member: onboarding then app ----------
  const mem=await newPage(browser,'member',{onboarded:false});
  check('new device: onboarding NOT shown before sign-in',!(await mem.$('#onb')));
  await seed(mem,'AMINA',7);
  await gateSignIn(mem,'amina.test@example.com',pw1);
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'));
  check('member signed in => app unlocked',true);
  await waitFor(mem,()=>document.getElementById('onb'));
  check('member: onboarding shown after sign-in',await mem.$eval('#onb h2',e=>e.textContent)==='Bienvenue');
  await mem.click('#onb .onb-skip');await sleep(500);
  check('onboarding closed + flag set',!(await mem.$('#onb'))&&!!(await ls(mem,'cahier.onboardingDone')));
  /* 1.29.0 : après l’accueil, le code d’accès est proposé (chiffrement local) ; « Annuler » le reporte */
  await waitFor(mem,()=>/Protégez les données/.test((document.getElementById('cjLock')||{}).innerText||''));
  check('1.29.0 : code d’accès proposé après l’accueil (Annuler possible)',!!(await mem.$('#cjCancel')));
  await mem.click('#cjCancel');await sleep(300);
  await synced(mem);
  check('member data synced',(await adminGet(`users/${aminaUid}/cahier/meta`)).fields.data.stringValue.includes('AMINA Élève 6'));
  check('member header shows own data',(await hdr(mem)).includes('AMINA – Lycée · 7 élèves'));
  check('member: no moderator panel',await mem.evaluate(()=>document.getElementById('modCard').classList.contains('hidden')));

  // ---------- 4. non-member refused ----------
  const out=await signUp('intrus@example.com','Intrus-123456');
  const intr=await newPage(browser,'intrus');
  await seed(intr,'INTRUS',2);
  await gateSignIn(intr,'intrus@example.com','Intrus-123456');
  await waitFor(intr,()=>document.getElementById('gDenied')&&window.CJSync.state.user===null);
  check('non-member: refused message',(await intr.$eval('#gDenied',e=>e.textContent))==='Accès non autorisé ou désactivé. Contactez l’administrateur.');
  check('non-member: signed out and app still locked',await locked(intr)&&(await intr.evaluate(()=>window.CJSync.state.user===null)));
  check('non-member: no app/data visible',!/INTRUS|Paramètres|Absences/.test(await appText(intr)));
  await sleep(1500);
  check('non-member: nothing uploaded',!(await adminGet(`users/${out.localId}/cahier/meta`)).fields);
  check('non-member: login form available again',!!(await intr.$('#gEmail')));
  await intr.screenshot({path:'/workspace/cj-refused.png'});

  // ---------- 5. read-only viewer ----------
  await mod.$eval('#mdRefresh',b=>b.click());
  await waitFor(mod,()=>{const L=window.CJSync.state.mod.list;return L&&L.some(m=>m.email==='amina.test@example.com'&&m.p)&&!window.CJSync.state.mod.loading;});
  const modLocal=await ls(mod);
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="view"]').click();});
  await waitFor(mod,()=>document.getElementById('roBar'));
  check('viewer: member data shown read-only',(await hdr(mod)).includes('AMINA – Lycée · 7 élèves')&&!(await locked(mod)));
  await mod.evaluate(()=>window.CJIntro.show());await sleep(300);
  check('viewer: no onboarding',!(await mod.$('#onb')));
  await mod.click('#roQuit');await sleep(800);
  check('viewer exit: own data back, localStorage identical',(await hdr(mod)).includes('MOD – Lycée')&&(await ls(mod))===modLocal);

  // ---------- 6. password change ----------
  await gotoSettings(mem);await mem.evaluate(()=>window.CJPS&&CJPS.open('sync'));await mem.waitForSelector('#pwOpen');await mem.click('#pwOpen');
  await mem.waitForSelector('#pwCur');await mem.type('#pwCur',pw1);await mem.type('#pwNew','NouveauMdp-2026');await mem.type('#pwNew2','NouveauMdp-2026');await mem.click('#pwGo');
  await waitFor(mem,()=>window.CJSync.state.pwMsg||window.CJSync.state.pwErr);
  check('member password change',(await mem.evaluate(()=>window.CJSync.state.pwMsg))==='Mot de passe modifié.');

  // ---------- 7. Dispensé still works (member) ----------
  await mem.click('#tabs button[data-tab="attendance"]');await sleep(500);
  await mem.evaluate(()=>{document.querySelector('#view-attendance .seg [data-mode="edit"]').click();});await sleep(300);
  await mem.evaluate(()=>document.querySelector('#gridWrap td.c[data-s="0"]').click());await sleep(300);
  await mem.click('#cellDsp');await sleep(300);await mem.click('#dspBtns [data-dt="annee"]');await sleep(400);
  await mem.evaluate(()=>document.querySelector('#cellModal .x').click());await sleep(300);
  /* 1.29.1 (-n) : la dispense commence aujourd’hui ; entre deux cycles (ex. dimanche après la fin du cycle 1) elle ne couvre que le cycle suivant — comportement voulu.
     Le test cherche donc le cycle couvert (celui qui contient la date du jour) au lieu de supposer le cycle 1. */
  let dspN=await mem.$$eval('#gridWrap td.c.dsp',t=>t.length),dspCyc=0;
  for(let pp=1;pp<6&&!dspN;pp++){await mem.evaluate(q=>{window.CJR.db().ui.per=q;},pp);await mem.click('#tabs button[data-tab="students"]');await sleep(250);await mem.click('#tabs button[data-tab="attendance"]');await sleep(400);dspN=await mem.$$eval('#gridWrap td.c.dsp',t=>t.length);dspCyc=pp;}
  const dspRec=await mem.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K));return (d.students.find(x=>x.dispense)||{}).dispense||null;},KEY);
  check('Dispensé works after login',dspN>0&&!!dspRec&&dspRec.type==='annee','cycle '+(dspCyc+1)+' · '+JSON.stringify(dspRec));
  await mem.evaluate(()=>{window.CJR.db().ui.per=0;});
  await synced(mem);

  // ---------- 8. offline relaunch with session ----------
  await mem.waitForFunction(()=>navigator.serviceWorker&&navigator.serviceWorker.controller,{timeout:20000}).catch(()=>{});
  await mem.reload({waitUntil:'networkidle2'});await ready(mem);
  await waitFor(mem,()=>!document.documentElement.classList.contains('cj-locked'));
  await sleep(1500);
  await mem.setOfflineMode(true);
  await mem.reload({waitUntil:'domcontentloaded'});
  await waitFor(mem,()=>window.CJIntro&&document.readyState!=='loading');await mem.evaluate(()=>(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));
  await waitFor(mem,()=>!document.documentElement.classList.contains('cj-locked'),null,20000).catch(()=>{});
  check('offline relaunch with session: app opens',!(await locked(mem)),JSON.stringify(await mem.evaluate(()=>({u:!!window.CJSync.state.user,role:window.CJSync.state.role,off:window.CJSync.state.offline,sdk:!!window.CJSync.state.sdk}))));
  check('offline relaunch: own data visible',(await hdr(mem)).includes('AMINA – Lycée · 7 élèves'));
  await mem.setOfflineMode(false);
  await waitFor(mem,()=>window.CJSync.state.role==='member',null,20000);
  check('back online: membership re-checked => member',true);

  // ---------- 9. sign-out -> login ----------
  await gotoSettings(mem);await synced(mem);
  await mem.evaluate(k=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open(k);},'sync');await mem.click('#syOut');
  await waitFor(mem,()=>document.documentElement.classList.contains('cj-locked')&&document.getElementById('gEmail'));
  check('Déconnexion returns to login',true);
  check('after sign-out: local data kept',(await ls(mem)).includes('AMINA Élève 6'));
  check('after sign-out: no data visible',!/AMINA/.test(await appText(mem)));

  // offline + no session
  const memOff=await mem.ctx.newPage();memOff.on('pageerror',e=>ERR.push('memOff pageerror '+e.message));memOff.on('console',m=>{if(m.type()==='error')ERR.push('memOff '+m.text());});
  await memOff.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await memOff.evaluateOnNewDocument(()=>{Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false});});await memOff.setOfflineMode(true);await memOff.goto(URL,{waitUntil:'domcontentloaded'});
  await waitFor(memOff,()=>window.CJIntro&&document.readyState!=='loading');await memOff.evaluate(()=>(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));
  await waitFor(memOff,()=>/Connexion Internet requise pour la première connexion/.test(document.getElementById('gate').innerText),null,15000).catch(()=>{});
  const offTxt=await memOff.$eval('#gate',e=>e.innerText);
  check('offline without session: "Connexion Internet requise…"',/Connexion Internet requise pour la première connexion/.test(offTxt)&&await locked(memOff),offTxt.replace(/\n/g,' | ').slice(0,160)+JSON.stringify(await memOff.evaluate(()=>({u:window.CJSync.state.user,on:navigator.onLine}))));
  await memOff.screenshot({path:'/tmp/offline-login.png'});await memOff.close();
  const memOff2=await mem.ctx.newPage();await memOff2.setOfflineMode(true);await memOff2.goto(URL,{waitUntil:'domcontentloaded'});
  await waitFor(memOff2,()=>window.CJIntro&&window.CJSync&&window.CJSync.state.user===null&&document.getElementById('gEmail'),null,20000);await memOff2.evaluate(()=>(window.CJIntro.skipSplash(),window.CJLanding&&window.CJLanding.shown()&&window.CJLanding.toLogin()));await sleep(400);
  await memOff2.type('#gEmail','amina.test@example.com');await memOff2.type('#gPass','x-123456');await memOff2.click('#gGo');
  await waitFor(memOff2,()=>/Connexion Internet requise pour la première connexion/.test(document.getElementById('gate').innerText),null,20000).catch(()=>{});
  check('offline sign-in attempt (navigator.onLine unreliable): same message',/Connexion Internet requise pour la première connexion/.test(await memOff2.$eval('#gate',e=>e.innerText)));
  await memOff2.close();
  await mem.reload({waitUntil:'networkidle2'});await ready(mem);

  // ---------- 10. switching users on the same device ----------
  await gateSignIn(mem,'youssef.test@example.com',pw2);
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'));
  await sleep(300);
  const h1=await hdr(mem);
  check('switch user: previous user data NOT shown',!h1.includes('AMINA')&&h1.includes('0 élève'),h1);
  check('switch user: no AMINA text anywhere',!/AMINA/.test(await appText(mem)));
  const bk=JSON.parse(await ls(mem,KEY+'.backup.'+aminaUid)||'null');
  check('switch user: previous data backed up to classRegister.v2.backup.<uid>',bk&&bk.data.includes('AMINA Élève 6'));
  await synced(mem);
  const ym=await adminGet(`users/${youUid}/cahier/meta`);
  check('switch user: nothing of the previous user uploaded to new account',ym.fields&&!ym.fields.data.stringValue.includes('AMINA'));
  await gotoSettings(mem);
  await mem.evaluate(()=>{const i=document.getElementById('setTeacher');i.value='YOUSSEF – Lycée';i.dispatchEvent(new Event('change',{bubbles:true}));});
  await sleep(500);await synced(mem);
  check('new user edits synced to own account',(await adminGet(`users/${youUid}/cahier/meta`)).fields.data.stringValue.includes('YOUSSEF – Lycée'));
  check('first user cloud data untouched',(await adminGet(`users/${aminaUid}/cahier/meta`)).fields.data.stringValue.includes('AMINA Élève 6')&&!(await adminGet(`users/${aminaUid}/cahier/meta`)).fields.data.stringValue.includes('YOUSSEF'));
  await mem.evaluate(k=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open(k);},'sync');await mem.click('#syOut');await waitFor(mem,()=>document.getElementById('gEmail'));
  await gateSignIn(mem,'amina.test@example.com','NouveauMdp-2026');
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'));
  await waitFor(mem,()=>document.getElementById('hdrSub').textContent.includes('AMINA – Lycée · 7 élèves'),null,15000).catch(()=>{});
  check('switch back: first user data restored',(await hdr(mem)).includes('AMINA – Lycée · 7 élèves'),await hdr(mem));
  check('switch back: no YOUSSEF data visible',!/YOUSSEF/.test(await appText(mem)));
  check('switch back: dispense kept',(await ls(mem)).includes('"dispense"'));
  check('switch back: second user backed up',(await ls(mem,KEY+'.backup.'+youUid)||'').includes('YOUSSEF – Lycée'));
  await synced(mem);
  check('after switching: first user cloud still has only own data',!(await adminGet(`users/${aminaUid}/cahier/meta`)).fields.data.stringValue.includes('YOUSSEF'));

  // ---------- 11. live disable ----------
  await mod.$eval('#mdRefresh',b=>b.click());await waitFor(mod,()=>!window.CJSync.state.mod.loading&&window.CJSync.state.mod.list);
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="toggle"]').click();});
  await waitFor(mem,()=>document.documentElement.classList.contains('cj-locked')&&document.getElementById('gDenied'),null,20000);
  check('disabled member: locked out live with message',(await mem.$eval('#gDenied',e=>e.textContent)).includes('Accès non autorisé ou désactivé'));
  check('disabled member: signed out, data hidden',(await mem.evaluate(()=>window.CJSync.state.user===null))&&!/AMINA/.test(await appText(mem)));
  await gateSignIn(mem,'amina.test@example.com','NouveauMdp-2026');
  await waitFor(mem,()=>document.getElementById('gDenied')&&window.CJSync.state.user===null);
  check('disabled member refused at sign-in',await locked(mem));
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="toggle"]').click();});
  await sleep(1500);
  await gateSignIn(mem,'amina.test@example.com','NouveauMdp-2026');
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'));
  check('reactivated member can enter again',true);
  // moderator sign-out
  await gotoSettings(mod);await mod.evaluate(k=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open(k);},'sync');await mod.click('#syOut');await waitFor(mod,()=>document.documentElement.classList.contains('cj-locked')&&document.getElementById('gEmail'));
  check('moderator Déconnexion returns to login',true);
  }catch(e){console.log('EXCEPTION',e.stack);results.push({name:'exception',ok:false});}
  finally{await browser.close();}
  const benign=ERR.filter(e=>!/ERR_INTERNET_DISCONNECTED/.test(e)&&!/^visitor Failed to load resource: the server responded with a status of 400/.test(e));
  check('no console errors',!benign.length,JSON.stringify(ERR.slice(0,8)));
  const f=results.filter(r=>!r.ok);console.log(`\n${results.length-f.length}/${results.length} passed`);f.forEach(r=>console.log('FAILED:',r.name));
})();
