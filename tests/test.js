const puppeteer = require('puppeteer-core');
const P='cahier-journalier-2830a', AUTH='http://127.0.0.1:9099', FS='http://127.0.0.1:8080';
const URL='http://localhost:8000/?emu=1', KEY='classRegister.v2', MOD='tammar.med@gmail.com';
const results=[]; function check(name, ok, extra){results.push({name,ok:!!ok});console.log((ok?'PASS':'FAIL')+' - '+name+(extra?' :: '+extra:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
async function signUp(email,pw){return j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email,password:pw,returnSecureToken:true})});}
async function adminUpdate(body){return j(AUTH+`/identitytoolkit.googleapis.com/v1/projects/${P}/accounts:update`,{method:'POST',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify(body)});}
async function adminGet(path){return j(`${FS}/v1/projects/${P}/databases/(default)/documents/${path}`,{headers:{Authorization:'Bearer owner'}});}
async function waitFor(page,fn,arg,timeout=20000){return page.waitForFunction(fn,{timeout,polling:200},arg);}
async function newPage(browser,label){
  const ctx=await browser.createBrowserContext();const page=await ctx.newPage();
  await page.setViewport({width:430,height:900,deviceScaleFactor:2});
  page.on('dialog',d=>d.accept(d.type()==='prompt'?'SUPPRIMER':undefined));
  page.on('pageerror',e=>console.log(`[${label} pageerror]`,e.message));
  page.on('console',m=>{const t=m.text();if(/error|Error|refus|denied/i.test(t)&&!/favicon/.test(t))console.log(`[${label} console]`,t.slice(0,200));});
  await page.goto(URL,{waitUntil:'networkidle2'});
  await waitFor(page,()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);
  return page;
}
async function seed(page,prefix,n,notesLen=0){
  await page.evaluate((KEY,prefix,n,notesLen)=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];for(let i=0;i<n;i++)d.students.push({id:prefix+'s'+i,classId:d.classes[i%d.classes.length].id,name:prefix+' Élève '+i,notes:notesLen?('x'.repeat(notesLen)):'' ,created:1});
    d.settings.teacher=prefix+' – Lycée';localStorage.setItem(KEY,JSON.stringify(d));},KEY,prefix,n,notesLen);
  await page.reload({waitUntil:'networkidle2'});
  await waitFor(page,()=>window.CJSync&&window.CJSync.state.sdk&&window.CJSync.state.user!==undefined);
}
async function gotoSettings(page){await page.click('#tabs button[data-tab="settings"]');await sleep(300);}
async function signIn(page,email,pw){
  /* depuis 1.29 la connexion se fait sur l’écran d’accès (#gEmail/#gPass/#gGo) : l’ancien formulaire des Paramètres (#syEmailOpen) n’existe plus */
  await page.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();window.CJLanding&&CJLanding.shown&&CJLanding.shown()&&CJLanding.toLogin();});
  await page.waitForSelector('#gEmail',{visible:true,timeout:15000});await page.evaluate(()=>{document.getElementById('gEmail').value='';document.getElementById('gPass').value='';});
  await page.type('#gEmail',email);await page.type('#gPass',pw);await page.click('#gGo');
  await waitFor(page,e=>window.CJSync.state.user&&window.CJSync.state.user.email===e,email);
}
async function signOut(page){await page.evaluate(()=>window.CJSync.state.sdk.U.signOut(window.CJSync.state.auth));await waitFor(page,()=>window.CJSync.state.user===null);}
const role=page=>page.evaluate(()=>window.CJSync.state.role);
const ls=page=>page.evaluate(k=>localStorage.getItem(k),KEY);
const synced=page=>waitFor(page,()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading;},null,30000);
// direct Firestore ops from the page's own signed-in SDK
async function tryOp(page,op,path,data){return page.evaluate(async(op,path,data)=>{const S=window.CJSync.state,F=S.sdk.F;try{const ref=path.split('/').length%2?F.collection(S.db,...path.split('/')):F.doc(S.db,...path.split('/'));
  if(op==='get'){const d=await F.getDocFromServer(ref);return 'ok:'+(d.exists()?'exists':'missing');}
  if(op==='list'){const q=await F.getDocsFromServer(ref);return 'ok:'+q.size;}
  if(op==='set'){await F.setDoc(ref,data);return 'ok';}
  if(op==='del'){await F.deleteDoc(ref);return 'ok';}}catch(e){return 'err:'+(e.code||e.message);}},op,path,data);}

(async()=>{
  const browser=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
  try{
  /* émulateurs remis à zéro (comme test_gate) : le test ne dépend plus des comptes/invitations laissés par un autre test */
  await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});
  await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});
  await fetch(`${FS}/emulator/v1/projects/${P}:securityRules`,{method:'PUT',body:JSON.stringify({rules:{files:[{content:require('fs').readFileSync('/workspace/cj-deploy/firestore.rules','utf8')}]}})});
  // ---------- moderator account (email/password, initially UNVERIFIED = attacker scenario) ----------
  const modPw='ModPass-123456';
  const su=await signUp(MOD,modPw);const modUid=su.localId;check('moderator auth account created in emulator',!!modUid);
  const mod=await newPage(browser,'mod');
  check('no "Créer un compte" in login UI',await mod.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();return true;}) && !(await mod.evaluate(()=>document.body.innerText.includes('Créer un compte'))));
  await seed(mod,'MOD',3);
  await signIn(mod,MOD,modPw);
  await waitFor(mod,()=>window.CJSync.state.role==='unverified');
  check('unverified password account with moderator e-mail => role unverified',await role(mod)==='unverified');
  check('  modCard hidden',await mod.evaluate(()=>document.getElementById('modCard').classList.contains('hidden')));
  check('  rules: cannot list members',(await tryOp(mod,'list','members')).startsWith('err:permission-denied'));
  check('  rules: cannot write own cahier',(await tryOp(mod,'set',`users/${modUid}/cahier/meta`,{x:1})).startsWith('err:permission-denied'));
  check('  rules: cannot create members doc',(await tryOp(mod,'set','members/evil@x.com',{email:'evil@x.com',active:true})).startsWith('err:permission-denied'));
  // verify email (as if the link had been clicked), then "J'ai vérifié"
  await adminUpdate({localId:modUid,emailVerified:true});
  await mod.click('#gVerified');   /* écran d’accès (1.29) */
  await waitFor(mod,()=>window.CJSync.state.role==='mod');
  check('after e-mail verification => moderator',await role(mod)==='mod');
  await synced(mod);
  const modMeta=await adminGet(`users/${modUid}/cahier/meta`);
  check('moderator own data synced',modMeta.fields&&modMeta.fields.data.stringValue.includes('MOD Élève 2'));
  await waitFor(mod,()=>!document.getElementById('modCard').classList.contains('hidden')&&document.getElementById('mdCreate'));
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});   /* 1.29.1 (-u) : Paramètres en sous-pages — ouvrir « Espace modérateur » */
  check('modCard visible for moderator',true);
  const modLocalBefore=await ls(mod);
  const modMetaBefore=JSON.stringify(modMeta.fields);

  // ---------- create access for member 1 via UI ----------
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName','Amina Benali');await mod.type('#mdEmail','Amina.Test@Example.com');await mod.$eval('#mdCreate',b=>b.click());
  await waitFor(mod,()=>document.getElementById('mdPw')||(window.CJSync.state.mod.err),null,20000);
  const err1=await mod.evaluate(()=>window.CJSync.state.mod.err);if(err1)console.log('create err',err1);
  const pw1=await mod.$eval('#mdPw',e=>e.textContent);
  check('access created, temp password shown',pw1&&pw1.length===12,pw1);
  check('share message contains link, email, password',await mod.$eval('#mdMsg',(e,pw)=>e.value.includes('https://cahier-eps-ma.web.app/')&&e.value.includes('amina.test@example.com')&&e.value.includes(pw),pw1));
  check('moderator still signed in as moderator after creation',await mod.evaluate(m=>window.CJSync.state.user.email===m&&window.CJSync.state.role==='mod',MOD));
  const mem1Doc=await adminGet('members/amina.test@example.com');
  check('members doc: active true, uid set, createdBy',mem1Doc.fields&&mem1Doc.fields.active.booleanValue===true&&mem1Doc.fields.uid&&mem1Doc.fields.createdBy.stringValue===MOD);
  const mem1Uid=mem1Doc.fields.uid.stringValue;
  // duplicate
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName','Dup');await mod.type('#mdEmail','amina.test@example.com');await mod.$eval('#mdCreate',b=>b.click());
  await waitFor(mod,()=>window.CJSync.state.mod.err&&!window.CJSync.state.mod.busy);
  check('duplicate access refused',(await mod.evaluate(()=>window.CJSync.state.mod.err)).includes('déjà un accès'));
  await mod.evaluate(()=>{document.getElementById('mdName').value='';document.getElementById('mdEmail').value='';});

  // ---------- member signs in & syncs ----------
  const mem=await newPage(browser,'member');
  await seed(mem,'AMINA',7);
  await signIn(mem,'amina.test@example.com',pw1);
  await waitFor(mem,()=>window.CJSync.state.role==='member');
  check('member signed in => role member',true);
  await synced(mem);
  let m1=await adminGet(`users/${mem1Uid}/cahier/meta`);
  check('member data synced to users/{uid}/cahier/meta',m1.fields&&m1.fields.data.stringValue.includes('AMINA Élève 6'));
  await sleep(1500);
  let prof=await adminGet(`profiles/${mem1Uid}`);
  check('profile written (counts)',prof.fields&&prof.fields.studentCount.integerValue==='7'&&prof.fields.email.stringValue==='amina.test@example.com',JSON.stringify(prof.fields&&{s:prof.fields.studentCount,c:prof.fields.classCount}));
  check('member cannot read members list',(await tryOp(mem,'list','members')).startsWith('err:'));
  check('member can read own members doc',(await tryOp(mem,'get','members/amina.test@example.com'))==='ok:exists');
  check('member cannot activate/modify members doc',(await tryOp(mem,'set','members/amina.test@example.com',{email:'amina.test@example.com',active:true,name:'x'})).startsWith('err:permission-denied'));
  check('member cannot read moderator cahier',(await tryOp(mem,'get',`users/${modUid}/cahier/meta`)).startsWith('err:permission-denied'));
  check('member cannot list profiles',(await tryOp(mem,'list','profiles')).startsWith('err:'));
  check('member sees no modCard',await mem.evaluate(()=>document.getElementById('modCard').classList.contains('hidden')));

  // ---------- moderator list + read-only viewer ----------
  await mod.$eval('#mdRefresh',b=>b.click());
  await waitFor(mod,()=>{const L=window.CJSync.state.mod.list;return L&&L.length===1&&L[0].p;});
  const rowTxt=await mod.$eval('#modCard .mrow',e=>e.innerText);
  check('list shows name/email/active/counts',/Amina Benali/.test(rowTxt)&&/amina.test@example.com/.test(rowTxt)&&/Actif/.test(rowTxt)&&/7 élèves/.test(rowTxt),rowTxt.replace(/\n/g,' | '));
  // screenshot panel (with the one-time credential box visible from the first creation? it was replaced by dup error; recreate a second access for the screenshot)
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName','Youssef Alaoui');await mod.type('#mdEmail','youssef.test@example.com');await mod.$eval('#mdCreate',b=>b.click());
  await waitFor(mod,()=>document.getElementById('mdPw')&&!window.CJSync.state.mod.busy&&window.CJSync.state.mod.list&&window.CJSync.state.mod.list.length===2&&!window.CJSync.state.mod.loading);
  const pw2=await mod.$eval('#mdPw',e=>e.textContent);
  
  await mod.setViewport({width:430,height:2400,deviceScaleFactor:2});await mod.evaluate(()=>{document.getElementById('modCard').scrollIntoView();window.scrollBy(0,-90);});await sleep(500);
  const mc=await mod.$('#modCard');await mc.screenshot({path:'/workspace/cj-mod-panel.png'});
  await mod.setViewport({width:430,height:900,deviceScaleFactor:2});
  check('screenshot panel saved',true);

  const memCloudBefore=JSON.stringify((await adminGet(`users/${mem1Uid}/cahier/meta`)).fields);
  const dirtyBefore=await mod.evaluate(()=>window.CJSync.meta().dirty);
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="view"]').click();});
  await waitFor(mod,()=>document.getElementById('roBar'));
  check('viewer opened with banner',(await mod.$eval('#roBar',e=>e.innerText)).includes('Lecture seule – cahier de Amina Benali'));
  check('viewer shows member data (header)',(await mod.$eval('#hdrSub',e=>e.textContent)).includes('AMINA – Lycée · 7 élèves'));
  await mod.evaluate(()=>document.querySelector('#tabs button[data-tab="students"]').click());await sleep(500);
  check('viewer students list shows member students',(await mod.evaluate(()=>document.getElementById('stuList').innerText)).includes('AMINA Élève'));
  await mod.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(3000);
  await mod.screenshot({path:'/workspace/cj-mod-viewer.png'});
  // attendance tap in the viewer
  const sessBefore=await mod.evaluate(()=>document.getElementById('gridWrap').innerHTML);
  const tapped=await mod.evaluate(()=>{const c=document.querySelector('#gridWrap tbody td.c[data-s]')||document.querySelector('#gridWrap td.c[data-s]:not(.nh)');if(!c)return false;c.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));c.dispatchEvent(new PointerEvent('pointerup',{bubbles:true}));c.click();return true;});
  await sleep(800);
  check('viewer attendance tap reverted',tapped&&(await mod.evaluate(()=>document.getElementById('gridWrap').innerHTML))===sessBefore,'tapped='+tapped);
  check('viewer: revert toast shown',tapped&&(await mod.evaluate(()=>document.getElementById('toast').textContent)).includes('Lecture seule'));
  // try to edit in the viewer: attendance tap + class add + delete student
  await mod.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(600);
  const cell=await mod.$('#gridWrap td button, #gridWrap .cell, #gridWrap td[data-s]');
  const cellSel=await mod.evaluate(()=>{const g=document.getElementById('gridWrap');const c=g.querySelector('[data-sid][data-s], td[data-s], .c[data-s], button[data-s]');return c?c.outerHTML.slice(0,160):g.innerHTML.slice(0,300);});
  console.log('  grid cell sample:',cellSel);
  // generic edit attempt via app code path: mutate + persist through a UI action (settings teacher field)
  await mod.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);
  await mod.evaluate(()=>{const i=document.getElementById('setTeacher');i.value='HACKED';i.dispatchEvent(new Event('change',{bubbles:true}));});
  await sleep(600);
  check('viewer edit reverted in memory',(await mod.$eval('#hdrSub',e=>e.textContent)).includes('AMINA – Lycée'));
  await mod.evaluate(()=>{const i=document.getElementById('newClassName');i.value='ZZZ';document.getElementById('addClassBtn').click();});await sleep(600);
  check('viewer class add reverted',!(await mod.evaluate(()=>document.body.innerText.includes('ZZZ'))));
  check('rules: moderator cannot write member cahier',(await tryOp(mod,'set',`users/${mem1Uid}/cahier/meta`,{data:'x'})).startsWith('err:permission-denied'));
  check('rules: moderator cannot delete member cahier',(await tryOp(mod,'del',`users/${mem1Uid}/cahier/meta`)).startsWith('err:permission-denied'));
  check('rules: moderator cannot write member profile',(await tryOp(mod,'set',`profiles/${mem1Uid}`,{email:'amina.test@example.com'})).startsWith('err:permission-denied'));
  check('moderator localStorage untouched while viewing',(await ls(mod))===modLocalBefore);
  await sleep(2500);
  check('no upload happened while viewing (mod cloud meta unchanged)',JSON.stringify((await adminGet(`users/${modUid}/cahier/meta`)).fields)===modMetaBefore);
  check('member cloud data untouched',JSON.stringify((await adminGet(`users/${mem1Uid}/cahier/meta`)).fields)===memCloudBefore);
  await mod.evaluate(()=>document.getElementById('roQuit').click());await sleep(800);
  check('exit viewer: banner gone',!(await mod.$('#roBar')));
  check('exit viewer: own data back',(await mod.$eval('#hdrSub',e=>e.textContent)).includes('MOD – Lycée · 3 élèves'));
  check('exit viewer: localStorage identical',(await ls(mod))===modLocalBefore);
  check('exit viewer: sync meta not dirty',(await mod.evaluate(()=>window.CJSync.meta().dirty))===dirtyBefore);
  await sleep(2500);
  check('after exit: mod cloud meta still unchanged',JSON.stringify((await adminGet(`users/${modUid}/cahier/meta`)).fields)===modMetaBefore);
  // moderator still syncs own edits after viewing
  await mod.evaluate(()=>{const i=document.getElementById('setTeacher');i.value='MOD2 – Lycée';i.dispatchEvent(new Event('change',{bubbles:true}));});
  await sleep(500);await synced(mod);
  check('moderator own edit syncs after viewing',(await adminGet(`users/${modUid}/cahier/meta`)).fields.data.stringValue.includes('MOD2 – Lycée'));

  /* 1.29.1 (-u) : la suite (non-membre, désactivation, mot de passe, gros cahier, réinitialisation, compte existant) repose sur l’ancien flux (rôle « denied » visible dans les Paramètres, #pwOpen…) ;
     ces cas sont couverts par test_gate.js avec le comportement actuel (écran d’accès). LEGACY_ALL=1 pour les relancer tels quels. */
  if(process.env.LEGACY_ALL){
  // ---------- non-member ----------
  const out=await signUp('intrus@example.com','Intrus-123456');
  const intr=await newPage(browser,'intrus');
  await seed(intr,'INTRUS',2);
  await signIn(intr,'intrus@example.com','Intrus-123456');
  await waitFor(intr,()=>window.CJSync.state.role==='denied');
  check('non-member refused (message shown)',(await intr.evaluate(()=>document.getElementById('syncCard').innerText)).includes('Accès non autorisé ou désactivé. Contactez le modérateur.'));
  await sleep(2500);
  check('non-member: nothing uploaded',!(await adminGet(`users/${out.localId}/cahier/meta`)).fields);
  check('non-member: rules deny own write',(await tryOp(intr,'set',`users/${out.localId}/cahier/meta`,{data:'x'})).startsWith('err:permission-denied'));
  check('non-member: rules deny profile write',(await tryOp(intr,'set',`profiles/${out.localId}`,{email:'intrus@example.com'})).startsWith('err:permission-denied'));
  check('non-member: local data still there',(await intr.$eval('#hdrSub',e=>e.textContent)).includes('2 élèves'));

  // ---------- disable member (live) ----------
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="toggle"]').click();});
  await waitFor(mod,()=>{const L=window.CJSync.state.mod.list;return L&&L.some(m=>m.email==='amina.test@example.com'&&m.active===false);});
  await waitFor(mem,()=>window.CJSync.state.role==='denied');
  check('disabled member refused live',(await mem.evaluate(()=>document.getElementById('syncCard').innerText)).includes('Accès non autorisé ou désactivé'));
  check('disabled member: rules deny write',(await tryOp(mem,'set',`users/${mem1Uid}/cahier/meta`,{data:'x'})).startsWith('err:permission-denied'));
  check('disabled member: rules deny read of own cahier',(await tryOp(mem,'get',`users/${mem1Uid}/cahier/meta`)).startsWith('err:permission-denied'));
  // disabled member signing in again (fresh device)
  const mem2=await newPage(browser,'member-dev2');
  await signIn(mem2,'amina.test@example.com',pw1);
  await waitFor(mem2,()=>window.CJSync.state.role==='denied');
  check('disabled member refused at sign-in on another device',true);
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Amina'));r.querySelector('[data-mact="toggle"]').click();});
  await waitFor(mem,()=>window.CJSync.state.role==='member');
  check('reactivated member regains access live',true);
  await waitFor(mem2,()=>window.CJSync.state.role==='member');
  await waitFor(mem2,()=>document.getElementById('hdrSub').textContent.includes('7 élèves'),null,20000);
  check('second device pulled member data after reactivation',true);

  // ---------- member changes password ----------
  await gotoSettings(mem);
  await mem.waitForSelector('#pwOpen');await mem.click('#pwOpen');
  await mem.waitForSelector('#pwCur');await mem.type('#pwCur',pw1);await mem.type('#pwNew','NouveauMdp-2026');await mem.type('#pwNew2','NouveauMdp-2026');await mem.click('#pwGo');
  await waitFor(mem,()=>/Mot de passe modifié/.test(document.getElementById('syncCard').innerText)||window.CJSync.state.pwErr);
  check('member changed password',(await mem.evaluate(()=>window.CJSync.state.pwMsg))==='Mot de passe modifié.',await mem.evaluate(()=>window.CJSync.state.pwErr));
  await signOut(mem2);
  await signIn(mem2,'amina.test@example.com','NouveauMdp-2026');
  await waitFor(mem2,()=>window.CJSync.state.role==='member');
  check('sign-in with new password works',true);

  // ---------- big (chunked) data for member 2 ----------
  const y=await newPage(browser,'youssef');
  await seed(y,'YOUSSEF',300,3500);
  await signIn(y,'youssef.test@example.com',pw2);
  await waitFor(y,()=>window.CJSync.state.role==='member');
  await synced(y);
  const ym=await adminGet(`users/${(await adminGet('members/youssef.test@example.com')).fields.uid.stringValue}/cahier/meta`);
  check('chunked upload (>900 KB) accepted by rules',ym.fields&&+ym.fields.chunks.integerValue>=3,'chunks='+(ym.fields&&ym.fields.chunks.integerValue));
  await mod.$eval('#mdRefresh',b=>b.click());await waitFor(mod,()=>!window.CJSync.state.mod.loading&&window.CJSync.state.mod.list.some(m=>m.email==='youssef.test@example.com'&&m.p));
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Youssef'));r.querySelector('[data-mact="view"]').click();});
  await waitFor(mod,()=>document.getElementById('roBar'),null,20000);
  check('moderator views chunked cahier',(await mod.$eval('#hdrSub',e=>e.textContent)).includes('300 élèves'));
  await mod.click('#roQuit');await sleep(600);
  check('after 2nd view: moderator localStorage own data intact',(await mod.evaluate(k=>JSON.parse(localStorage.getItem(k)).settings.teacher,KEY))==='MOD2 – Lycée');

  // ---------- password reset e-mail ----------
  await mod.evaluate(()=>{const r=[...document.querySelectorAll('#modCard .mrow')].find(x=>x.innerText.includes('Youssef'));r.querySelector('[data-mact="reset"]').click();});
  await sleep(1500);
  const oob=await j(`${AUTH}/emulator/v1/projects/${P}/oobCodes`);
  check('password reset e-mail sent',(oob.oobCodes||[]).some(o=>o.email==='youssef.test@example.com'&&o.requestType==='PASSWORD_RESET'));

  // ---------- existing account path ----------
  await mod.evaluate(()=>{const v=document.getElementById('view-settings');if(!v.classList.contains('active'))document.querySelector('#tabs button[data-tab="settings"]').click();window.CJPS&&CJPS.open('mod');});await mod.type('#mdName','Intrus');await mod.type('#mdEmail','intrus@example.com');await mod.$eval('#mdCreate',b=>b.click());
  await waitFor(mod,()=>window.CJSync.state.mod.exist&&!window.CJSync.state.mod.busy);
  const inDoc=await adminGet('members/intrus@example.com');
  check('existing account: members doc left inactive until confirmed',inDoc.fields&&inDoc.fields.active.booleanValue===false);
  check('existing account: intruder still denied',(await tryOp(intr,'set',`users/${out.localId}/cahier/meta`,{data:'x'})).startsWith('err:permission-denied'));
  check('moderator still signed in (no secondary leak)',await mod.evaluate(m=>window.CJSync.state.auth.currentUser.email===m,MOD));
  }
  }catch(e){console.log('EXCEPTION',e.message);try{for(const p of (await browser.pages())){console.log('PAGE',await p.evaluate(()=>window.CJSync&&JSON.stringify({role:window.CJSync.state.role,mod:Object.assign({},window.CJSync.state.mod,{sec:null,list:(window.CJSync.state.mod.list||[]).map(m=>m.email+':'+m.active)}),log:window.CJSync.log.slice(-8)})));}}catch(x){console.log(x.message)}results.push({name:'exception',ok:false});}
  finally{await browser.close();}
  const f=results.filter(r=>!r.ok);console.log(`\n${results.length-f.length}/${results.length} passed`);f.forEach(r=>console.log('FAILED:',r.name));
})();
