/* 1.29.2a : « Mon Cahier Journalier » sur ordinateur (1280 px, desk.js) avec l’export réel du propriétaire (9 classes, 351 élèves) :
   le PDF se crée, portrait officiel du Roi en page 2, logo du Ministère en couverture et en dos, images à la résolution d’origine (qualité impression).
   Résilience : 1re lecture d’un fichier du cahier en échec, polices non lisibles par adresse blob:, photo d’élève illisible → le cahier se crée quand même.
   Affichage / génération seulement : aucune donnée, clé ni synchronisation touchée. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const cp=require('child_process');const {serve}=require('/workspace/cj-emu/pc_h.js');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const PORT=8247,ORG='http://localhost:'+PORT;
const DATA_F=process.env.CJ_DATA||'/workspace/backups/data-AVANT-1.29.2-20261030.json';const OUT=process.env.CJ_OUT||'/tmp/cahier_pc';
const srv=serve('/workspace/cj-deploy',PORT);
const N_EXP=(()=>{const d=JSON.parse(fs.readFileSync(DATA_F,'utf8'));return {c:d.classes.length,s:d.students.length};})();
async function run(b,label,{failOnce=null,blobFonts=false,badPhoto=false}={}){
 const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:1280,height:650});const errs=[],warn=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='warning'||m.type()==='error')warn.push(m.text());});
 const seen=new Set();await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(failOnce&&u.endsWith(failOnce)&&!seen.has(u)){seen.add(u);return q.abort('connectionreset');}(u.startsWith(ORG)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((d,bf)=>{if(!sessionStorage.getItem('s')){localStorage.clear();localStorage.setItem('classRegister.v2',d);sessionStorage.setItem('s','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));
  if(bf){const o=URL.createObjectURL;URL.createObjectURL=function(x){return x&&x.type==='font/ttf'?'blob:'+location.origin+'/00000000-0000-0000-0000-000000000000':o.apply(this,arguments);};}},fs.readFileSync(DATA_F,'utf8'),blobFonts);
 await p.goto(ORG+'/?emu=1',{waitUntil:'networkidle2'});
 const un=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';window.CJGateOpen=true;});
 await un();await p.waitForFunction(()=>document.documentElement.classList.contains('cj-dk')&&document.getElementById('cjcRow'),{timeout:15000});
 if(badPhoto){await p.evaluate(async()=>{const d=JSON.parse(localStorage.getItem('classRegister.v2'));const db=await new Promise(r=>{const q=indexedDB.open('cahier-photos',1);q.onsuccess=()=>r(q.result);});
   const tx=db.transaction('p','readwrite'),os=tx.objectStore('p');d.students.slice(0,30).forEach((s,i)=>os.put({id:s.id,d:i%2?'data:image/jpeg;base64,/9j/AAAAAAAAAAAAAAAA':'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='}));await new Promise(r=>tx.oncomplete=r);});
  await p.reload({waitUntil:'networkidle2'});await un();await p.waitForFunction(()=>document.getElementById('cjcRow'),{timeout:15000});}
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);await p.evaluate(()=>document.getElementById('cjcRow').click());await sleep(500);
 const vis=await p.$eval('#cjcBtn',e=>{const r=e.getBoundingClientRect();return r.width>100&&r.height>20&&getComputedStyle(e).visibility==='visible';});
 const t0=Date.now();await p.click('#cjcBtn');let txt='',maxPg=0;for(let i=0;i<360;i++){await sleep(500);txt=await p.$eval('#cjcBtn',e=>e.textContent);const m=/page \d+\/(\d+)/.exec(txt);if(m)maxPg=+m[1];if(!/Génération/.test(txt))break;}
 if(/Enregistrer le cahier/.test(txt)){await p.click('#cjcBtn');await sleep(500);}
 const toast=await p.evaluate(()=>document.getElementById('toast').textContent);
 const pdf=await p.evaluate(async()=>{const x=window.__lastPdf;if(!x)return null;const a=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return {name:x.name,b64:btoa(s)};});
 await ctx.close();return {vis,txt,toast,pdf,errs,warn,ms:Date.now()-t0,maxPg};}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 const r=await run(b,'réel');
 check('1280 px (ordinateur) : bouton « Télécharger la version physique (PAPERASSE) » visible dans Paramètres › Mon Cahier Journalier',r.vis);
 check('export réel ('+N_EXP.c+' classes, '+N_EXP.s+' élèves) : PDF créé en '+(r.ms/1000).toFixed(1)+' s, pas de message « Impossible »',r.pdf&&!/Impossible/.test(r.toast),r.toast);
 if(r.pdf){fs.writeFileSync(OUT+'.pdf',Buffer.from(r.pdf.b64,'base64'));
  const info=cp.execSync('pdfinfo '+OUT+'.pdf').toString(),pages=+/Pages:\s+(\d+)/.exec(info)[1];
  check('nombre de pages = 7 pages générales + 10 par classe + dos ('+pages+')',pages===r.maxPg&&pages>=7+10*N_EXP.c,'progression '+r.maxPg);
  const L=cp.execSync('pdfimages -list '+OUT+'.pdf').toString().trim().split('\n').slice(2).map(l=>l.trim().split(/\s+/)).map(a=>({page:+a[0],w:+a[3],h:+a[4],enc:a[8],xppi:+a[12],yppi:+a[13]}));
  const king=L.filter(i=>i.page===2&&i.w===1184&&i.h===1664),logo1=L.filter(i=>i.page===1&&i.w===760&&i.h===763),logoN=L.filter(i=>i.page===pages&&i.w===760&&i.h===763);
  check('page 2 : portrait officiel de S.M. le Roi (1184×1664, fichier d’origine)',king.length===1,JSON.stringify(L.filter(i=>i.page===2)));
  check('couverture : logo du Ministère (760×763)',logo1.length>=1,JSON.stringify(L.filter(i=>i.page===1)));
  check('dos (dernière page) : logo du Ministère (760×763)',logoN.length>=1,JSON.stringify(L.filter(i=>i.page===pages)));
  check('qualité impression : images d’origine sans réduction (portrait 1184×1664 ≥ 150 ppi pleine page, logos ≥ 300 ppi)',king.length&&king[0].xppi>=150&&logo1.every(i=>i.w!==760||i.xppi>=300)&&logoN.every(i=>i.w!==760||i.xppi>=300),JSON.stringify(king.concat(logo1,logoN).map(i=>[i.page,i.w+'x'+i.h,i.xppi])));
  const txt=cp.execSync('pdftotext -f 3 -l 3 '+OUT+'.pdf -').toString();check('texte réel (non image) : page des informations lisible (Tammar)',/Tammar/i.test(txt),txt.slice(0,80));}
 check('aucune erreur JavaScript',r.errs.length===0,r.errs.join('|'));
 const r2=await run(b,'roi',{failOnce:'cahier/roi.jpg'});check('1re lecture de cahier/roi.jpg coupée : 2e essai réseau, cahier créé quand même',r2.pdf&&!/Impossible/.test(r2.toast),r2.toast);
 const r3=await run(b,'polices',{blobFonts:true});check('polices non lisibles par adresse blob: : chargées depuis leurs octets, cahier créé',r3.pdf&&!/Impossible/.test(r3.toast),r3.toast);
 if(r3.pdf){fs.writeFileSync(OUT+'-polices.pdf',Buffer.from(r3.pdf.b64,'base64'));const f=cp.execSync('pdffonts '+OUT+'-polices.pdf').toString();check('… avec les polices intégrées (Poppins)',/F\d|Poppins/i.test(f)&&f.split('\n').length>4);}
 const r4=await run(b,'photo',{badPhoto:true});check('photos d’élèves illisibles (30) : ignorées, cahier créé',r4.pdf&&!/Impossible/.test(r4.toast),r4.toast);
}catch(e){check('exception',false,e.stack);}
await b.close();srv.close();const n=results.filter(x=>x).length;console.log(n+'/'+results.length+' passed');process.exit(n===results.length?0:1);})();
