/* v1.28.0 (-g) : synchronisation des photos (émulateurs) : collection additive users/{uid}/photos/{idÉlève}, 1 document par photo,
   appareil A → appareil B (ajout, suppression), cahier (meta/chunks) sans image, règles actuelles suffisantes ;
   simulation de règles SANS cette collection : aucune erreur, photo gardée sur l’appareil, envoyée dès que les règles l’autorisent. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const P='cahier-journalier-2830a',AUTH='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',KEY='classRegister.v2';const D='/workspace/cj-deploy';const IMG=__dirname+'/phimg/';
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8024);
const RULES=fs.readFileSync(D+'/firestore.rules','utf8');
const setRules=c=>fetch(`${FS}/emulator/v1/projects/${P}:securityRules`,{method:'PUT',body:JSON.stringify({rules:{files:[{content:c}]}})});
const adminGet=p=>j(`${FS}/v1/projects/${P}/databases/(default)/documents/${p}`,{headers:{Authorization:'Bearer owner'}});
const ERR=[];
(async()=>{
await fetch(`${FS}/emulator/v1/projects/${P}/databases/(default)/documents`,{method:'DELETE'});await fetch(`${AUTH}/emulator/v1/projects/${P}/accounts`,{method:'DELETE'});await setRules(RULES);
const EM='photo.test@example.com',PW='Photo-123456';
const su=await j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:EM,password:PW,returnSecureToken:true})});const UID=su.localId;
await j(`${FS}/v1/projects/${P}/databases/(default)/documents/members/${EM}`,{method:'PATCH',headers:{Authorization:'Bearer owner','content-type':'application/json'},body:JSON.stringify({fields:{email:{stringValue:EM},active:{booleanValue:true},uid:{stringValue:UID},name:{stringValue:'Test Photo'}}})});
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:90000,args:['--no-sandbox','--disable-dev-shm-usage']});
async function dev(label,seedFn){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});p.on('dialog',d=>d.accept());
  p.on('pageerror',e=>ERR.push(label+' pageerror '+e.message));p.on('console',m=>{if(m.type()==='error')ERR.push(label+' console '+m.text());});
  await p.goto('http://localhost:8024/?emu=1',{waitUntil:'networkidle2'});await p.waitForFunction(()=>window.CJSync&&window.CJSync.state.sdk,{timeout:20000});
  await p.evaluate(seedFn,KEY);await p.reload({waitUntil:'networkidle2'});await p.waitForFunction(()=>window.CJSync&&window.CJSync.state.sdk,{timeout:20000});
  await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();if(window.CJLanding&&window.CJLanding.shown&&window.CJLanding.shown()&&window.CJLanding.toGate)window.CJLanding.toGate();});
  await p.evaluate(()=>{const b=[...document.querySelectorAll('#landing button,#landing a,#lnLogin')].find(x=>x.id==='lnLogin');if(b)b.click();});
  await p.waitForSelector('#gEmail',{visible:true,timeout:15000}).catch(async()=>{await p.evaluate(()=>{const t=[...document.querySelectorAll('#gate button,#gate a')].find(x=>/e-mail/i.test(x.textContent));if(t)t.click();});await p.waitForSelector('#gEmail',{visible:true,timeout:8000});});
  await p.type('#gEmail',EM);await p.type('#gPass',PW);await p.click('#gGo');
  await p.waitForFunction(()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading&&!document.documentElement.classList.contains('cj-locked');},{timeout:40000,polling:300});await sleep(500);return p;}
const seedA=KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';const c=d.classes[0];d.students=['بامعروف ياسين','رؤوفي سلمى','CHAKIR Omar'].map((n,i)=>({id:'ps'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J1'+(5000000+i),notes:'',created:1}));d.sessions={};localStorage.setItem(KEY,JSON.stringify(d));};
const seedB=KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.students=[];d.sessions={};localStorage.setItem(KEY,JSON.stringify(d));};
const A=await dev('A',seedA);
const addPhoto=async(p,id,file)=>{await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.querySelector('#tabs button[data-tab="students"]').click();});await sleep(400);
  await p.evaluate(id=>document.querySelector('.stu[data-id="'+id+'"]').click(),id);await sleep(400);await p.click('#detPhoto');await sleep(300);
  const el=await p.$('#phGal');await el.uploadFile(file);await p.waitForFunction(()=>document.getElementById('phCrop').classList.contains('open'),{timeout:15000});await sleep(200);await p.click('#phSave');await sleep(600);};
await addPhoto(A,'ps0',IMG+'a1.jpg');
const waitDoc=async(path,fn,ms=15000)=>{const t0=Date.now();let d;while(Date.now()-t0<ms){d=await adminGet(path);if(fn(d))return d;await sleep(400);}return d;};
const d0=await waitDoc(`users/${UID}/photos/ps0`,d=>d&&d.fields&&d.fields.d);
const sz=d0&&d0.fields&&d0.fields.d?d0.fields.d.stringValue.length:0;
check('A : photo envoyée dans users/{uid}/photos/ps0 (1 document, '+Math.round(sz/1024)+' Ko en base64, champs d/t/dev/st) — règles ACTUELLES, sans modification',sz>1000&&sz<36000&&!!d0.fields.t&&!!d0.fields.dev&&!!d0.fields.st,JSON.stringify(d0&&d0.fields?Object.keys(d0.fields):d0).slice(0,200));
const meta=await adminGet(`users/${UID}/cahier/meta`);const metaS=JSON.stringify(meta);
check('cahier en ligne (meta / chunks) sans aucune image : le document principal n’est pas alourdi',!!meta.fields&&!/data:image/.test(metaS)&&metaS.length<20000,metaS.length+' octets');
const q=await A.evaluate(()=>new Promise(res=>{const r=indexedDB.open('cahier-photos');r.onsuccess=()=>{r.result.transaction('q').objectStore('q').getAll().onsuccess=e=>res(e.target.result.length);};}));
check('A : file d’envoi vidée après confirmation du serveur',q===0,String(q));
const B=await dev('B',seedB);
await B.waitForFunction(()=>window.CJR.photo.known().includes('ps0'),{timeout:20000}).catch(()=>{});
const kB=await B.evaluate(()=>window.CJR.photo.known());
check('B (2e appareil, même compte) : photo de ps0 récupérée automatiquement (lecture incrémentale)',kB.includes('ps0'),JSON.stringify(kB));
await B.evaluate(()=>{document.querySelector('#tabs button[data-tab="students"]').click();});await sleep(400);await B.evaluate(()=>document.querySelector('.stu[data-id="ps0"]').click());await sleep(700);
check('B : photo affichée dans la fiche et dans la liste',await B.evaluate(()=>!!document.querySelector('#detPhoto img')&&!!document.querySelector('.stu[data-id="ps0"] .avatar img')));
// suppression sur A → B
await A.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.querySelector('#tabs button[data-tab="students"]').click();});await sleep(300);
await A.evaluate(()=>document.querySelector('.stu[data-id="ps0"]').click());await sleep(400);await A.click('#detPhoto');await sleep(300);await A.click('#phDel');
const dd=await waitDoc(`users/${UID}/photos/ps0`,d=>d&&d.fields&&d.fields.del);
check('A supprime : document remplacé par une marque de suppression {del:true} (pas d’image)',!!dd.fields.del&&!dd.fields.d,JSON.stringify(Object.keys(dd.fields||{})));
await B.waitForFunction(()=>!window.CJR.photo.known().includes('ps0'),{timeout:15000}).catch(()=>{});
check('B : suppression reçue en direct (photo retirée de l’appareil, silhouette revenue)',await B.evaluate(()=>!window.CJR.photo.known().includes('ps0')&&/Ajouter une photo/.test(document.getElementById('detPhoto').textContent)));
// règles sans la collection photos
const NO=RULES.replace('match /users/{uid}/{document=**} {','match /users/{uid}/cahier/{document=**} {');if(NO===RULES)throw new Error('rules variant');
await setRules(NO);
await A.reload({waitUntil:'networkidle2'});await A.waitForFunction(()=>{const s=window.CJSync.state;return s.ready&&!document.documentElement.classList.contains('cj-locked');},{timeout:40000});await sleep(1500);
const e0=ERR.length;await addPhoto(A,'ps1',IMG+'a3.jpg');await sleep(3000);
const stA=await A.evaluate(()=>({st:window.CJR.photo.state(),known:window.CJR.photo.known(),img:!!document.querySelector('#detPhoto img')}));
const dn=await adminGet(`users/${UID}/photos/ps1`);
check('règles SANS users/{uid}/photos (simulation) : photo gardée et affichée sur l’appareil, envoi suspendu, rien en ligne',stA.known.includes('ps1')&&stA.img&&stA.st.blocked&&!(dn.fields&&dn.fields.d),JSON.stringify(stA.st));
check('  … sans aucune erreur visible (page / console) ; la synchro du cahier continue',ERR.length===e0&&await A.evaluate(()=>window.CJSync.state.ready&&!window.CJSync.state.err),ERR.slice(e0).join(' | ').slice(0,300));
await setRules(RULES);
await A.reload({waitUntil:'networkidle2'});await A.waitForFunction(()=>window.CJSync.state.ready,{timeout:40000});
const d1=await waitDoc(`users/${UID}/photos/ps1`,d=>d&&d.fields&&d.fields.d,20000);
check('règles autorisant la collection : la photo en attente part au lancement suivant',!!(d1.fields&&d1.fields.d));
await B.waitForFunction(()=>window.CJR.photo.known().includes('ps1'),{timeout:20000}).catch(()=>{});
check('… et arrive sur B',await B.evaluate(()=>window.CJR.photo.known().includes('ps1')));
const list=await j(`${FS}/v1/projects/${P}/databases/(default)/documents/users/${UID}/photos`,{headers:{Authorization:'Bearer owner'}});
check('collection photos : 1 document par élève (2 : ps0 marqué supprimé, ps1)',(list.documents||[]).length===2,(list.documents||[]).map(d=>d.name.split('/').pop()).join(','));
// le modérateur ne peut que lire ; un autre utilisateur n’a pas accès
const su2=await j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:'autre@example.com',password:'Autre-123456',returnSecureToken:true})});
const rOther=await fetch(`${FS}/v1/projects/${P}/databases/(default)/documents/users/${UID}/photos/ps1`,{headers:{Authorization:'Bearer '+su2.idToken}});
check('règles actuelles : un autre compte ne peut pas lire les photos (403)',rOther.status===403,String(rOther.status));
check('aucune erreur de page sur A et B',ERR.length===0,ERR.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
