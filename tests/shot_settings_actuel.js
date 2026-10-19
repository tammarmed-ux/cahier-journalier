/* 1.29.1 (-t) : Paramètres — « Créer un accès », « Utilisateurs » et « Thème » repliables, repliés par défaut (état en mémoire seulement) */
const puppeteer=require('/workspace/cj-emu/node_modules/puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const OUT='/workspace/backups/v1.29.1-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8023);
const URL='http://localhost:8023/';
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
await open('');await sleep(2500);await p.evaluate(()=>window.scrollTo(0,0));await p.screenshot({path:'/workspace/settings-proposals/actuel.png',fullPage:true});
check('aucune erreur JS',!errs.length,errs.join('|').slice(0,300));
console.log(results.filter(Boolean).length+'/'+results.length+' passed');srv.close();await b.close();process.exit(results.every(Boolean)?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
