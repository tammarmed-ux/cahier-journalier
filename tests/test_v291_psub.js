/* 1.29.1 (-u) : Paramètres façon réglages iOS — liste groupée + sous-pages (affichage seulement) */
const puppeteer=require('/workspace/cj-emu/node_modules/puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const OUT='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8024);
const URL='http://localhost:8024/';const SHOT=process.env.SHOT!=='0';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.students=[];d.classes.forEach((c,i)=>{for(let j=0;j<30+i;j++)d.students.push({id:'s'+i+'_'+j,classId:c.id,name:'Élève '+i+'-'+j,sex:j%2?'F':'G',sid:'',dob:'',parent:'',phone:'',notes:'',created:1});});d.lastBackup=Date.now()-3*3600e3;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
const fake=()=>p.evaluate(()=>{const S=CJSync.state;S.user={uid:'modUid',email:'mohamed.tammar@exemple.ma',emailVerified:true};S.role='mod';
  S.mod=Object.assign(S.mod||{},{loading:false,busy:false,list:[
   {id:'amina.benali@exemple.ma',email:'amina.benali@exemple.ma',name:'Mme Amina Benali',active:true,uid:'u1',p:{lastSyncAt:Date.now()-3600e3,classCount:4,studentCount:132},cands:[]},
   {id:'youssef.alaoui@exemple.ma',email:'youssef.alaoui@exemple.ma',name:'M. Youssef Alaoui',active:true,uid:'u2',p:{lastSyncAt:Date.now()-86400e3,classCount:3,studentCount:98},cands:[]},
   {id:'karim.idrissi@exemple.ma',email:'karim.idrissi@exemple.ma',name:'M. Karim Idrissi',active:false,p:null,cands:[]}]});
  window.dispatchEvent(new Event('offline'));});
const go=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(350);};
const open=async th=>{await p.evaluate(th=>{if(th)localStorage.setItem('cj.theme',th);else localStorage.removeItem('cj.theme');},th);await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(800);await go('settings');await fake();await sleep(400);};
const tap=async sel=>{await p.evaluate(q=>document.querySelector(q).scrollIntoView({block:'center'}),sel);await sleep(120);await p.click(sel);await sleep(250);};
const st=()=>p.evaluate(()=>{const V=document.getElementById('view-settings');const vis=e=>!!e&&e.offsetParent!==null;return {list:vis(document.getElementById('psList')),head:vis(document.getElementById('psHead')),cur:CJPS.cur(),
  title:document.getElementById('psTitle').textContent,cards:[...V.querySelectorAll(':scope>.card')].filter(vis).map(c=>c.dataset.ps||c.id||'?'),
  rows:[...document.querySelectorAll('#psList .ps-row')].filter(vis).map(r=>r.dataset.psOpen),hs:history.state&&history.state.cjps};});
await open('');
const keys0=await p.evaluate(()=>Object.keys(localStorage).filter(k=>!/snap/i.test(k)).sort().join());
let s=await st();
const ALL=['sync','sec','cls','pts','annee','hol','pdf','bk','snap','theme','mod','onb','dz'];
check('liste : les 13 sections en lignes (Établissement retiré, 1.29.2 n) (modérateur), aucune carte affichée',s.list&&!s.head&&s.cards.length===0&&JSON.stringify(s.rows)===JSON.stringify(ALL),JSON.stringify(s));
const caps=await p.evaluate(()=>[...document.querySelectorAll('#psList .ps-grp')].filter(g=>!g.hidden).map(g=>(g.querySelector('.ps-cap')||{textContent:''}).textContent));
check('groupes : Compte & sécurité / Classes & année scolaire / Données / Apparence / Modérateur / Présentation / (zone dangereuse en bas)',JSON.stringify(caps)===JSON.stringify(['Compte & sécurité','Classes & année scolaire','Données','Apparence','Modérateur','Présentation','']),JSON.stringify(caps));
const rowInfo=await p.evaluate(()=>[...document.querySelectorAll('#psList .ps-row')].map(r=>{const b=r.getBoundingClientRect();return {k:r.dataset.psOpen,h:Math.round(b.height),w:Math.round(b.width),t:r.querySelector('b').textContent,s:r.querySelector('small').textContent,v:r.querySelector('.ps-val').textContent,ico:!!r.querySelector('.ps-ico').textContent,ch:!!r.querySelector('.ps-chev')};}));
check('lignes : icône, titre, résumé, chevron ; ≥ 44 px ; dans l’écran',rowInfo.every(r=>r.ico&&r.ch&&r.t&&r.s&&r.h>=44&&r.w<=390),JSON.stringify(rowInfo.filter(r=>!(r.ico&&r.ch&&r.t&&r.s&&r.h>=44&&r.w<=390))));
const RI=Object.fromEntries(rowInfo.map(r=>[r.k,r]));
check('résumés/valeurs tirés de l’existant (9 classes · 306 élèves, thème Actuel, 3 utilisateurs, dernière sauvegarde, points A 0,5)',/^9 classes · 306 élèves/.test(RI.cls.s)&&RI.cls.v==='9'&&RI.theme.v==='Actuel'&&RI.mod.v==='3'&&/Dernière sauvegarde/.test(RI.bk.s)&&/^A 0,5/.test(RI.pts.s)&&/cycles · activités et dates/.test(RI.annee.s)&&/alerte à \d+ abs./.test(RI.cls.s)&&/mohamed\.tammar/.test(RI.sync.s),JSON.stringify(RI));
check('zone dangereuse en dernier, en rouge',await p.evaluate(()=>{const r=[...document.querySelectorAll('#psList .ps-row')].pop();return r.dataset.psOpen==='dz'&&getComputedStyle(r.querySelector('b')).color==='rgb(198, 47, 58)';}));
if(SHOT){await sleep(2600);await p.setViewport({width:390,height:1500,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(300);await p.evaluate(()=>scrollTo(0,0));await sleep(200);await p.screenshot({path:OUT+'param-ios-liste.png'});await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(200);}
/* sous-page Sauvegarde + retour (historique) + position de défilement */
await p.evaluate(()=>scrollTo(0,150));await sleep(150);const y0=await p.evaluate(()=>scrollY);
await p.evaluate(()=>document.querySelector('.ps-row[data-ps-open="bk"]').scrollIntoView({block:'center'}));await sleep(150);const y0b=await p.evaluate(()=>scrollY);await p.click('.ps-row[data-ps-open="bk"]');await sleep(250);const yb=await p.evaluate(()=>scrollY);await p.evaluate(()=>scrollTo(0,300));await sleep(100);
await p.evaluate(()=>scrollTo(0,0));await sleep(100);
s=await st();
check('« Sauvegarde et restauration » : sous-page seule, en-tête + « ‹ Paramètres », fonctions présentes',!s.list&&s.head&&s.title==='Sauvegarde et restauration'&&JSON.stringify(s.cards)==='["bk"]'&&s.hs==='bk'&&await p.evaluate(()=>['bkExport','bkImportBtn','phExport','phImportBtn','bkInfo'].every(id=>document.getElementById(id).offsetParent!==null)&&document.getElementById('psBack').textContent==='‹ Paramètres'),JSON.stringify(s));
if(SHOT)await p.screenshot({path:OUT+'param-ios-sauvegarde.png'});
await p.goBack();await sleep(400);s=await st();const y1=await p.evaluate(()=>scrollY);
check('retour du navigateur (iOS/Android) : liste revenue, position de défilement conservée',s.list&&!s.head&&s.cards.length===0&&y0b>50&&Math.abs(y1-y0b)<=2,JSON.stringify({s,y0b,y1}));
await tap('.ps-row[data-ps-open="snap"]');await tap('#psBack');s=await st();
check('bouton « ‹ Paramètres » : retour à la liste',s.list&&!s.head&&!s.hs,JSON.stringify(s));
/* Classes : ajout via le bouton existant, compteur mis à jour */
await tap('.ps-row[data-ps-open="cls"]');s=await st();
check('« Classes » : liste des classes et ajout visibles',JSON.stringify(s.cards)==='["cls"]'&&await p.evaluate(()=>document.querySelectorAll('#clsManage .clsrow[data-cid]').length===9&&document.getElementById('addClassBtn').offsetParent!==null));
await p.type('#newClassName','TCS9');await p.click('#addClassBtn');await sleep(500);
if(SHOT){await sleep(2600);await p.evaluate(()=>scrollTo(0,0));await sleep(200);await p.screenshot({path:OUT+'param-ios-classes.png'});}
await tap('#psBack');await sleep(300);
check('classe ajoutée (fonction inchangée), résumé mis à jour (10 classes)',await p.evaluate(()=>JSON.parse(localStorage.getItem('classRegister.v2')).classes.length===10&&document.querySelector('[data-ps-val="cls"]').textContent==='10'));
await tap('.ps-row[data-ps-open="cls"]');await p.evaluate(()=>{const r=[...document.querySelectorAll('#clsManage .clsrow[data-cid]')].find(x=>x.querySelector('input').value==='TCS9');r&&r.querySelector('button').click();});await sleep(400);await tap('#psBack');
/* Thème */
await tap('.ps-row[data-ps-open="theme"]');await tap('#themeSw [data-th="terrain"]');
check('« Thème » : changement de thème toujours fonctionnel',await p.evaluate(()=>document.documentElement.getAttribute('data-theme')==='terrain'&&localStorage.getItem('cj.theme')==='terrain'));
await tap('#psBack');await sleep(300);check('valeur Thème mise à jour (Vert terrain)',await p.evaluate(()=>document.querySelector('[data-ps-val="theme"]').textContent==='Vert terrain'));
await tap('.ps-row[data-ps-open="theme"]');await tap('#themeSw [data-th=""]');await tap('#psBack');
/* Modérateur : saisie conservée + mot de passe provisoire visible */
await tap('.ps-row[data-ps-open="mod"]');await p.type('#mdName','Mme Test');await p.evaluate(()=>document.activeElement.blur());
await p.evaluate(()=>{CJSync.state.mod.cred={name:'Mme Test',email:'test@exemple.ma',pw:'Abc-123-xyz'};window.dispatchEvent(new Event('offline'));});await sleep(300);
s=await st();
check('« Espace modérateur » : créer un accès + utilisateurs ; après création le mot de passe provisoire reste visible',JSON.stringify(s.cards)==='["mod"]'&&await p.evaluate(()=>['mdName','mdCreate','mdRefresh','mdCred','mdPw'].every(id=>document.getElementById(id)&&document.getElementById(id).offsetParent!==null)&&document.querySelectorAll('#modCard .mrow').length===3&&document.getElementById('mdName').value==='Mme Test'),JSON.stringify(s));
await p.evaluate(()=>{CJSync.state.mod.cred=null;window.dispatchEvent(new Event('offline'));});
/* changement d’onglet : retour à la liste */
await go('home');await go('settings');s=await st();check('changer d’onglet puis revenir : liste affichée',s.list&&!s.cur,JSON.stringify(s));
/* raccourci existant : pastille de synchro → sous-page Compte */
await p.evaluate(()=>{const x=document.getElementById('syncPill');x&&x.click();});await sleep(400);s=await st();
check('pastille de synchronisation : ouvre « Compte et synchronisation »',s.cur==='sync'&&JSON.stringify(s.cards)==='["sync"]',JSON.stringify(s));
await go('settings');
const keys1=await p.evaluate(()=>Object.keys(localStorage).filter(k=>!/snap/i.test(k)).sort().join());
check('aucune clé ajoutée (état en mémoire + historique)',keys0===keys1,keys0+' | '+keys1);
/* AA dans les 3 thèmes */
const AA=()=>p.evaluate(()=>{const L=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);};
  const bg=e=>{for(let x=e;x;x=x.parentElement){const s=getComputedStyle(x);const gi=s.backgroundImage.match(/rgba?\([^)]+\)/g);if(gi&&s.backgroundImage!=='none')return gi.sort((a,b)=>L(b)-L(a))[0];const c=s.backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;}return 'rgb(255,255,255)';};
  const cr=e=>{const a=L(getComputedStyle(e).color),b2=L(bg(e));return Math.round(((Math.max(a,b2)+.05)/(Math.min(a,b2)+.05))*100)/100;};
  const r=[...document.querySelectorAll('#psList .ps-tx b,#psList .ps-tx small,#psList .ps-val,#psList .ps-cap,#psList .ps-h1')].filter(e=>e.textContent.trim()&&e.offsetParent).map(cr);
  CJPS.open('bk',true);const bb=cr(document.getElementById('psBack')),tt=cr(document.getElementById('psTitle'));CJPS.close();return {min:Math.min(...r),n:r.length,back:bb,title:tt};});
for(const th of ['','terrain','neon']){await open(th);const r=await AA();check('contraste AA ('+(th||'actuel')+') : lignes, résumés, valeurs, retour',r.n>=30&&r.min>=4.5&&r.back>=4.5&&r.title>=4.5,JSON.stringify(r));
  if(th==='neon'&&SHOT){await sleep(2600);await p.setViewport({width:390,height:1500,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(300);await p.evaluate(()=>{scrollTo(0,0);document.activeElement&&document.activeElement.blur();});await sleep(200);await p.screenshot({path:OUT+'param-ios-neon.png'});await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});}}
check('aucune erreur JS',!errs.length,errs.join('|').slice(0,300));
console.log(results.filter(Boolean).length+'/'+results.length+' passed');srv.close();await b.close();process.exit(results.every(Boolean)?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
