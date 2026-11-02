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
  await page.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.school','lycee');}catch(e){}});   /* 1.29.2 (j) : pas d’écran « Vous êtes un enseignant de : » (testé par test_v292_college) */
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
const hdr=page=>page.evaluate(()=>(()=>{const d=CJR.db(),n=d.students.length;return document.getElementById('hdrSub').textContent+' · '+n+' élève'+(n>1?'s':'');})());
async function tryOp(page,op,path,data){return page.evaluate(async(op,path,data)=>{const S=window.CJSync.state,F=S.sdk.F;try{const ref=path.split('/').length%2?F.collection(S.db,...path.split('/')):F.doc(S.db,...path.split('/'));
  if(op==='get'){const d=await F.getDocFromServer(ref);return 'ok:'+(d.exists()?'exists':'missing');}
  if(op==='list'){const q=await F.getDocsFromServer(ref);return 'ok:'+q.size;}
  if(op==='set'){await F.setDoc(ref,data);return 'ok';}}catch(e){return 'err:'+(e.code||e.message);}},op,path,data);}
/* 1.29.2c : « 🗑 Supprimer l’accès » (Espace modérateur) — émulateur local uniquement, comptes FICTIFS.
   Vérifie : confirmation (nom + e-mail), Annuler = rien ; OK = sauvegarde (fichier + localStorage) PUIS suppression
   de members/{email} seulement ; cahier (users/{uid}), profil, compte Auth, autres accès et données du modérateur intacts ;
   l’enseignant fictif est refusé ; restauration par « Créer un accès » + « Autoriser ce compte existant ». */
const fs=require('fs'),DL='/tmp/modrm_dl';
const SHOT=process.env.SHOT||'/workspace/backups/v1.29.2-preview/admin-supprimer-acces';
(async()=>{
  await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});
  await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
  await fetch(`${FS}/emulator/v1/projects/${P}:securityRules`,{method:'PUT',body:JSON.stringify({rules:{files:[{content:fs.readFileSync('/workspace/cj-deploy/firestore.rules','utf8')}]}})});
  fs.rmSync(DL,{recursive:true,force:true});fs.mkdirSync(DL,{recursive:true});fs.mkdirSync(SHOT,{recursive:true});
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
  const modPw='ModPass-123456';const su=await signUp(MOD,modPw);await adminUpdate({localId:su.localId,emailVerified:true});
  const mod=await newPage(browser,'mod');await seed(mod,'MOD',3);
  await gateSignIn(mod,MOD,modPw);
  await waitFor(mod,()=>window.CJSync.state.role==='mod'&&!document.documentElement.classList.contains('cj-locked'));
  await synced(mod);
  const modMeta=(await adminGet(`users/${su.localId}/cahier/meta`)).fields.data.stringValue;
  const cdp=await mod.target().createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL}).catch(()=>cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:DL}));
  await gotoSettings(mod);
  await waitFor(mod,()=>!document.getElementById('modCard').classList.contains('hidden')&&document.getElementById('mdCreate'));
  async function createAccess(name,email){
    await mod.evaluate(()=>{document.getElementById('mdName').value='';document.getElementById('mdEmail').value='';});
    await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName',name);await mod.type('#mdEmail',email);await mod.$eval('#mdCreate',b=>b.click());
    await waitFor(mod,()=>(document.getElementById('mdPw')||document.getElementById('mdAllow')||/existe/.test((document.getElementById('modCard')||{}).innerText||''))&&!window.CJSync.state.mod.busy,null,20000);
    return mod.evaluate(()=>{const p=document.getElementById('mdPw');return p?p.textContent:null;});}
  const FE='prof.factice@example.com',OE='autre.factice@example.com';
  const pw=await createAccess('Prof Factice',FE);
  await createAccess('Autre Factice',OE);
  check('accès fictifs créés',!!pw&&!!(await adminGet('members/'+FE)).fields&&!!(await adminGet('members/'+OE)).fields);
  const uid=(await adminGet('members/'+FE)).fields.uid.stringValue;
  // l’enseignant fictif se connecte et synchronise son cahier
  const mem=await newPage(browser,'factice');await seed(mem,'FACT',5);
  await gateSignIn(mem,FE,pw);
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'));
  await synced(mem);
  const meta0=(await adminGet(`users/${uid}/cahier/meta`)).fields.data.stringValue;
  check('cahier fictif synchronisé',meta0.includes('FACT Élève 4'));
  const prof0=JSON.stringify(await adminGet('profiles/'+uid));
  const oth0=JSON.stringify((await adminGet('members/'+OE)).fields);
  // ligne du modérateur
  await mod.$eval('#mdRefresh',b=>b.click());await waitFor(mod,()=>!window.CJSync.state.mod.loading&&window.CJSync.state.mod.list);
  await mod.evaluate(()=>{window.CJPS&&CJPS.open('mod');});await sleep(300);
  const row=await mod.evaluate(e=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes(e));if(!r)return null;const b=r.querySelector('[data-mact="remove"]');return{rm:b&&b.textContent.trim(),cls:b&&b.className,col:b&&getComputedStyle(b).color+'|'+getComputedStyle(b).backgroundColor,link:!!r.querySelector('[data-mact="link"]'),txt:r.innerText.replace(/\n/g,' | ')};},FE);
  check('ligne : bouton « 🗑 Supprimer l’accès » (danger), plus de « 🔗 Lier au compte »',row&&row.rm==='🗑 Supprimer l’accès'&&/danger/.test(row.cls)&&!row.link&&!/Lier au compte/.test(await mod.$eval('#modCard',e=>e.innerText)),JSON.stringify(row));
  check('aucun bouton « Supprimer l’accès » sur la ligne du modérateur',await mod.evaluate(m=>![...document.querySelectorAll('#modCard .mrow')].some(r=>r.innerText.toLowerCase().includes(m)&&r.querySelector('[data-mact="remove"]')),MOD));
  await mod.evaluate(e=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes(e));r.scrollIntoView({block:'center'});},FE);await sleep(200);
  await mod.screenshot({path:SHOT+'/emulateur-390-ligne.png'});
  /* capture des téléchargements (contexte de navigation privé : on lit le Blob au moment du clic) */
  await mod.evaluate(()=>{window.__dl=[];const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download){const it={n:this.download,t:null};window.__dl.push(it);fetch(this.href).then(r=>r.text()).then(t=>it.t=t);}return o.call(this);};});
  // 1) Annuler
  mod.removeAllListeners('dialog');let msg='';
  mod.once('dialog',d=>{msg=d.message();d.dismiss();});
  await mod.evaluate(e=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes(e));r.querySelector('[data-mact="remove"]').click();},FE);
  await sleep(1500);
  check('confirmation affichée avec nom + e-mail + avertissement',/Prof Factice/.test(msg)&&msg.includes(FE)&&/ne sont PAS effacées|pas effac/i.test(msg),msg.replace(/\n/g,' ⏎ '));
  check('Annuler : rien supprimé, aucune sauvegarde',!!(await adminGet('members/'+FE)).fields&&(await mod.evaluate(()=>window.__dl.length))===0&&!(await ls(mod,'tatabo3.mod.removed')));
  // 2) Confirmer
  mod.once('dialog',d=>d.accept());
  await mod.evaluate(e=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes(e));r.querySelector('[data-mact="remove"]').click();},FE);
  await waitFor(mod,e=>!window.CJSync.state.mod.busy&&!window.CJSync.state.mod.loading&&![...document.querySelectorAll('#modCard .mrow')].some(x=>x.innerText.includes(e)),FE,20000).catch(()=>{});
  await sleep(1000);
  const gone=await adminGet('members/'+FE);
  check('members/{e-mail} supprimé (accès révoqué)',gone&&gone.error&&gone.error.code===404,JSON.stringify(gone).slice(0,120));
  check('ligne retirée de la liste',!(await mod.$eval('#modCard',(e,f)=>e.innerText.includes(f),FE)));
  const dl=await mod.evaluate(()=>window.__dl);const files=dl.map(x=>x.n);
  const bk=dl.length&&dl[0].t?JSON.parse(dl[0].t):null;if(bk)fs.writeFileSync(DL+'/'+dl[0].n,dl[0].t);
  check('sauvegarde téléchargée avant suppression',bk&&bk.type==='tatabo3-acces-supprime'&&bk.path==='members/'+FE&&bk.data.uid===uid&&bk.data.name==='Prof Factice'&&/^acces-supprime_prof\.factice@example\.com_/.test(files[0]),files.join(',')+' '+JSON.stringify(bk).slice(0,300));
  const lsb=JSON.parse(await ls(mod,'tatabo3.mod.removed')||'[]');
  check('sauvegarde aussi dans localStorage « tatabo3.mod.removed »',lsb.length===1&&lsb[0].data.uid===uid);
  check('cahier de l’enseignant intact (users/{uid}/cahier/meta)',(await adminGet(`users/${uid}/cahier/meta`)).fields.data.stringValue===meta0);
  check('profil intact (profiles/{uid})',JSON.stringify(await adminGet('profiles/'+uid))===prof0);
  const look=await j(AUTH+`/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:lookup`,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({localId:[uid]})});
  check('compte Auth conservé (pas de suppression côté client)',look.users&&look.users.length===1);
  check('autre accès intact',JSON.stringify((await adminGet('members/'+OE)).fields)===oth0);
  check('données du modérateur intactes',(await adminGet(`users/${su.localId}/cahier/meta`)).fields.data.stringValue===modMeta&&!!(await adminGet('members/'+MOD)).error===!!(await adminGet('members/'+MOD)).error);
  // l’enseignant est refusé
  await waitFor(mem,()=>document.documentElement.classList.contains('cj-locked'),null,20000).catch(()=>{});
  const kept=await ls(mem);
  check('enseignant fictif verrouillé en direct',await locked(mem));
  check('ses données locales restent sur son appareil (non effacées)',kept&&kept.includes('FACT Élève 4'));
  await mem.reload({waitUntil:'networkidle2'});await ready(mem);
  if(await mem.evaluate(()=>!!window.CJSync.state.user))await waitFor(mem,()=>document.getElementById('gDenied')||window.CJSync.state.user===null,null,20000).catch(()=>{});
  if(await mem.$('#gEmail')){await gateSignIn(mem,FE,pw);await sleep(1500);}
  check('enseignant fictif refusé à la connexion',await locked(mem)&&(await mem.evaluate(()=>window.CJSync.state.role))!=='member');
  // restauration
  await mod.evaluate(()=>{window.CJPS&&CJPS.open('mod');});
  await createAccess('Prof Factice',FE);
  const allow=await mod.$('#mdAllow');if(allow){await allow.click();await waitFor(mod,()=>!window.CJSync.state.mod.busy,null,20000);await sleep(800);}
  const back=await adminGet('members/'+FE);
  check('restauration : « Créer un accès » + « Autoriser ce compte existant » recrée l’accès',!!allow&&back.fields&&back.fields.active.booleanValue!==false,JSON.stringify(back).slice(0,200));
  if(back.fields&&!back.fields.uid){await mod.$eval('#mdRefresh',b=>b.click());await waitFor(mod,()=>!window.CJSync.state.mod.loading);}
  await mem.reload({waitUntil:'networkidle2'});await ready(mem);
  if(await mem.$('#gEmail')&&await mem.$eval('#gEmail',e=>e.offsetParent!==null))await gateSignIn(mem,FE,pw);
  await waitFor(mem,()=>window.CJSync.state.role==='member'&&!document.documentElement.classList.contains('cj-locked'),null,25000).catch(()=>{});
  check('après restauration : l’enseignant retrouve son cahier',(await mem.evaluate(()=>window.CJSync.state.role))==='member'&&(await hdr(mem)).includes('FACT – Lycée · 5 élèves'),await hdr(mem).catch(()=>''));
  await mod.setViewport({width:1280,height:900,deviceScaleFactor:1});await mod.evaluate(()=>{window.CJPS&&CJPS.open('mod');});await sleep(400);
  await mod.screenshot({path:SHOT+'/emulateur-1280.png',fullPage:false});
  check('aucune erreur JS',ERR.filter(e=>/pageerror/.test(e)).length===0,ERR.join(' ; ').slice(0,400));
  }catch(e){check('exception',false,e.stack);}
  finally{await browser.close();}
  const f=results.filter(r=>!r.ok).length;console.log(`\n${results.length-f}/${results.length} passed`);process.exit(f?1:0);
})();
