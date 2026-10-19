/* 1.29.1 (-t) : Paramètres — « Créer un accès », « Utilisateurs » et « Thème » repliables, repliés par défaut (état en mémoire seulement) */
const puppeteer=require('/workspace/cj-emu/node_modules/puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const OUT='/workspace/backups/v1.29.1-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8021);
const URL='http://localhost:8021/';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';localStorage.setItem(KEY,JSON.stringify(d));},KEY);
const fake=()=>p.evaluate(()=>{const S=CJSync.state;S.user={uid:'modUid',email:'mohamed.tammar@exemple.ma',emailVerified:true};S.role='mod';
  S.mod=Object.assign(S.mod||{},{loading:false,busy:false,list:[
   {id:'amina.benali@exemple.ma',email:'amina.benali@exemple.ma',name:'Mme Amina Benali',active:true,uid:'u1',p:{lastSyncAt:Date.now()-3600e3,classCount:4,studentCount:132},cands:[]},
   {id:'youssef.alaoui@exemple.ma',email:'youssef.alaoui@exemple.ma',name:'M. Youssef Alaoui',active:true,uid:'u2',p:{lastSyncAt:Date.now()-86400e3,classCount:3,studentCount:98},cands:[]},
   {id:'karim.idrissi@exemple.ma',email:'karim.idrissi@exemple.ma',name:'M. Karim Idrissi',active:false,p:null,cands:[]}]});
  window.dispatchEvent(new Event('offline'));});
const open=async th=>{await p.evaluate(th=>{if(th)localStorage.setItem('cj.theme',th);else localStorage.removeItem('cj.theme');},th);await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(800);
  await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);await fake();await sleep(300);};
const clk=async q=>{await p.evaluate(q=>document.querySelector(q).scrollIntoView({block:'center'}),q);await sleep(120);await p.click(q);};
const tap=async k=>{await p.evaluate(k=>document.querySelector('.pf-tog[data-pf="'+k+'"]').scrollIntoView({block:'center'}),k);await sleep(120);await p.click('.pf-tog[data-pf="'+k+'"]');};
const st=()=>p.evaluate(()=>{const r={};document.querySelectorAll('.pf-tog').forEach(b=>{const w=document.getElementById(b.getAttribute('aria-controls'));const bb=b.getBoundingClientRect();
  r[b.dataset.pf]={exp:b.getAttribute('aria-expanded'),hid:!!(w&&w.hidden),h:Math.round(bb.height),w:Math.round(bb.width),t:b.innerText.replace(/\s+/g,' ').trim()};});return r;});
await open('');
let s=await st();
check('5 sections repliables présentes (Créer un accès, Utilisateurs, Thème, Classes, Sauvegarde)',s.acc&&s.users&&s.theme&&s.cls&&s.bk&&/🏫\s*Classes\s*9/.test(s.cls.t)&&/💾\s*Sauvegarde et restauration/.test(s.bk.t),JSON.stringify(s));
check('toutes repliées par défaut (aria-expanded=false, contenu masqué)',['acc','users','theme','cls','bk'].every(k=>s[k]&&s[k].exp==='false'&&s[k].hid),JSON.stringify(s));
check('en-têtes compacts : icône + titre + chevron, 44–56 px de haut',['acc','users','theme'].every(k=>s[k].h>=44&&s[k].h<=56)&&/🔑\s*Créer un accès/.test(s.acc.t)&&/👥\s*Utilisateurs\s*3/.test(s.users.t)&&/🎨\s*Thème/.test(s.theme.t),JSON.stringify(s));
check('Classes et Sauvegarde : contenu masqué, ouverture au toucher, fonctions présentes',await (async()=>{const h=await p.evaluate(()=>['addClassBtn','bkExport','bkImportBtn','phExport'].every(id=>document.getElementById(id).offsetParent===null));await tap('cls');await tap('bk');await sleep(200);
  const v0=0;const v=await p.evaluate(()=>['addClassBtn','newClassName','bkExport','bkImportBtn','phExport','phImportBtn'].every(id=>document.getElementById(id).offsetParent!==null)&&document.querySelectorAll('#clsManage .clsrow[data-cid]').length===9);
  await tap('cls');await tap('bk');await sleep(200);return h&&v;})());
await p.evaluate(()=>{const i=document.getElementById('newClassName');i.value='TCS9';document.getElementById('addClassBtn').click();});await sleep(400);
check('ajout de classe (bouton existant) : compteur Classes mis à jour (10), section toujours repliée',await p.evaluate(()=>document.querySelector('.pf-tog[data-pf="cls"] .pf-n').textContent==='10'&&document.getElementById('pf-cls').hidden&&JSON.parse(localStorage.getItem('classRegister.v2')).classes.length===10));
await p.evaluate(()=>{window.confirm=()=>true;const r=[...document.querySelectorAll('#clsManage .clsrow[data-cid]')].find(x=>x.querySelector('input').value==='TCS9');r&&r.querySelector('button').click();});await sleep(400);
check('compteur Utilisateurs = 3',await p.evaluate(()=>document.querySelector('.pf-tog[data-pf="users"] .pf-n').textContent==='3'));
const hClosed=await p.evaluate(()=>({mod:Math.round(document.getElementById('modCard').getBoundingClientRect().height),th:Math.round(document.getElementById('themeCard').getBoundingClientRect().height)}));
check('cartes repliées compactes (modérateur ≤ 260 px, thème ≤ 90 px)',hClosed.mod<=260&&hClosed.th<=90,JSON.stringify(hClosed));
check('champs et liste masqués quand replié',await p.evaluate(()=>[document.getElementById('mdName'),document.getElementById('mdCreate'),document.querySelector('#modCard .mrow'),document.getElementById('themeSw')].every(e=>e&&e.offsetParent===null)));
await p.setViewport({width:390,height:1700,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(300);await sleep(2800);await p.evaluate(()=>window.scrollTo(0,0));await sleep(300);await p.screenshot({path:OUT+'parametres-ferme.png'});await p.evaluate(()=>{const c=document.querySelector('[data-pfw="bk"]').closest('.card');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-80);});await sleep(300);await p.screenshot({path:OUT+'parametres-ferme-2.png'});await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(200);
for(const k of ['acc','users','theme'])await tap(k);await sleep(250);
s=await st();
check('ouverture au toucher (les 3)',['acc','users','theme'].every(k=>s[k].exp==='true'&&!s[k].hid),JSON.stringify(s));
check('contenu visible : Nom, E-mail, Créer l’accès, Actualiser, 3 utilisateurs, 3 thèmes',await p.evaluate(()=>['mdName','mdEmail','mdCreate','mdRefresh','themeSw'].every(id=>document.getElementById(id).offsetParent!==null)&&[...document.querySelectorAll('#modCard .mrow')].filter(r=>r.offsetParent).length===3&&document.querySelectorAll('#themeSw .thopt').length===3));
var keys0=await p.evaluate(()=>Object.keys(localStorage).sort().join());await p.type('#mdName','Mme Test');await p.evaluate(()=>document.activeElement.blur());
await p.evaluate(()=>window.dispatchEvent(new Event('offline')));await sleep(200);
s=await st();
check('état ouvert conservé après réaffichage (mémoire), saisie conservée',['acc','users'].every(k=>s[k].exp==='true'&&!s[k].hid)&&await p.evaluate(()=>document.getElementById('mdName').value==='Mme Test'),JSON.stringify(s));
await clk('#themeSw [data-th="terrain"]');await sleep(200);
check('changement de thème toujours fonctionnel (Vert terrain)',await p.evaluate(()=>document.documentElement.getAttribute('data-theme')==='terrain'&&localStorage.getItem('cj.theme')==='terrain'));
await clk('#themeSw [data-th=""]');await sleep(200);
check('retour au thème Actuel',await p.evaluate(()=>!document.documentElement.getAttribute('data-theme')&&localStorage.getItem('cj.theme')===null));
await p.evaluate(()=>{const c=document.getElementById('themeCard');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-70);});await sleep(300);
await p.setViewport({width:390,height:1500,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(300);await p.evaluate(()=>{const c=document.getElementById('themeCard');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-70);});await sleep(300);await p.screenshot({path:OUT+'parametres-ouvert.png'});await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(200);
await tap('acc');await sleep(150);
check('refermer « Créer un accès »',(await st()).acc.hid);
await p.evaluate(()=>{CJSync.state.mod.cred={name:'Mme Test',email:'test@exemple.ma',pw:'Abc-123-xyz'};window.dispatchEvent(new Event('offline'));});await sleep(200);
check('accès créé : section rouverte automatiquement, mot de passe provisoire visible',await p.evaluate(()=>{const c=document.getElementById('mdCred');return c&&c.offsetParent!==null&&!document.getElementById('pf-acc').hidden;}));
await p.evaluate(()=>{CJSync.state.mod.cred=null;window.dispatchEvent(new Event('offline'));});await sleep(200);
const keys1=await p.evaluate(()=>Object.keys(localStorage).sort().join());
check('aucune clé enregistrée pour l’état replié/ouvert',keys0===keys1,keys0+' | '+keys1);
const AA=async th=>{await open(th);for(const k of ['acc','users'])await tap(k);await sleep(150);
  return p.evaluate(()=>{const L=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);};
    const bg=e=>{for(let x=e;x;x=x.parentElement){const s=getComputedStyle(x);const gi=s.backgroundImage.match(/rgba?\([^)]+\)/g);if(gi&&s.backgroundImage!=='none')return gi.sort((a,b)=>L(b)-L(a))[0];const c=s.backgroundColor;if(c&&!/rgba\(0, 0, 0, 0\)|transparent/.test(c))return c;}return 'rgb(255,255,255)';};
    const cr=e=>{const a=L(getComputedStyle(e).color),b2=L(bg(e));return Math.round(((Math.max(a,b2)+.05)/(Math.min(a,b2)+.05))*100)/100;};
    return [...document.querySelectorAll('.pf-ti,.pf-n')].map(e=>cr(e));});};
for(const th of ['','terrain','neon']){const r=await AA(th);check('contraste AA des en-têtes ('+(th||'actuel')+')',r.length>=4&&r.every(x=>x>=4.5),r.join(','));
  if(th){await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>{const c=document.getElementById('themeCard');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-70);});await sleep(250);await p.screenshot({path:OUT+'parametres-ouvert-'+th+'.png'});}}
check('aucune erreur JS',!errs.length,errs.join('|').slice(0,300));
console.log(results.filter(Boolean).length+'/'+results.length+' passed');srv.close();await b.close();process.exit(results.every(Boolean)?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
