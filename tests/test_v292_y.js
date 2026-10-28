/* 1.29.2 (y) : non-régression avec de VRAIS clics (souris Chrome, moteur WebKit de Safari) — données réelles (347 élèves).
   1. barre latérale (1280 / 1440 px, 3 thèmes, Chrome et WebKit) : chaque commande est au premier plan et répond au clic
      (réduire / agrandir, menu, Synchro, Thème, carte du professeur, + Ajouter un élève) ; état réduit conservé après rechargement.
   2. « Télécharger la version physique (PAPERASSE) » de bout en bout : PDF réellement produit et téléchargé (ordinateur Chrome + WebKit, téléphone Chrome),
      y compris quand le clic d’origine a expiré (bouton « Enregistrer le cahier ») ; iPhone (WebKit) : fenêtre « PDF prêt », Partager reçoit le fichier PDF.
      Fichiers chargés au toucher (cj-cahier.js, cahier/roi.jpg, logo.jpg, splash.jpg, polices) en 200, sans erreur JS ; tous dans LAZY_ASSETS de sw.js.
   3. téléphone, Note procéd. : icône CSV en 2e ligne, 1re ligne comme en 2w (choix de l’APS non rétréci).
   Usage : NODE_PATH=<puppeteer-core>:<playwright> node tests/test_v292_y.js */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const {webkit}=require('playwright');const {wopen}=require('/workspace/cj-emu/wk_h.js');
const fs=require('fs'),cp=require('child_process'),path=require('path');
const D=path.resolve(__dirname,'..'),PORT=8231,BASE='http://localhost:'+PORT+'/',DL='/tmp/t2y-dl';serve(D,PORT);
let pass=0,fail=0;function check(n,ok,info){if(ok){pass++;console.log('ok   - '+n);}else{fail++;console.log('FAIL - '+n+(info!==undefined?' :: '+JSON.stringify(info).slice(0,900):''));}}
const CTL=['.dk-col','#syncPill','#themeBtn','.dk-prof',...['home','students','attendance','proc','reports','settings'].map(t=>'#tabs button[data-tab="'+t+'"]')];
const HIT=sels=>sels.map(sel=>{const e=document.querySelector(sel);if(!e)return {sel,ok:false,why:'absent'};const r=e.getBoundingClientRect();if(!r.width)return {sel,ok:false,why:'invisible'};
 const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return {sel,ok:!!t&&(t===e||e.contains(t)),x:r.left+r.width/2,y:r.top+r.height/2,top:t?(t.tagName+'#'+t.id+'.'+t.className).slice(0,50):null};});
const ST=()=>({mini:document.documentElement.classList.contains('dk-mini'),w:Math.round(document.getElementById('dkSide').getBoundingClientRect().width),key:localStorage.getItem('tatabo3.desk.mini'),
 tab:(document.querySelector('#tabs button.active')||{}).dataset.tab,h1:document.querySelector('#dkBar h1').textContent,psv:document.getElementById('view-settings').getAttribute('data-psv'),
 th:(()=>{const p=document.getElementById('thPop');return !!p&&p.getBoundingClientRect().width>0&&getComputedStyle(p).visibility!=='hidden';})(),add:document.getElementById('addChoice').classList.contains('open')});
/* adaptateurs : un clic réel au centre de l’élément (Chrome : souris CDP ; WebKit : clic Playwright avec test d’accessibilité au pointeur) */
const CH={eval:(p,f,a)=>p.evaluate(f,a),click:async(p,sel)=>{const [h]=await p.evaluate(HIT,[sel]);if(!h.ok)throw new Error(sel+' recouvert par '+h.top);await p.mouse.click(h.x,h.y);},reload:p=>p.reload({waitUntil:'networkidle2'})};
const WK={eval:(p,f,a)=>p.evaluate(f,a),click:(p,sel)=>p.click(sel,{timeout:4000}),reload:p=>p.reload({waitUntil:'networkidle'})};
async function after(p){await p.evaluate(()=>{try{CJIntro.skipSplash();}catch(e){}document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';window.CJGateOpen=true;});await sleep(1500);}
async function sidebar(name,A,p,w,th){const bad=[];const st=()=>A.eval(p,ST);const E=async(lbl,f)=>{try{await f();}catch(e){bad.push(lbl+' : '+e.message.split('\n')[0]);}};
 const h0=(await A.eval(p,HIT,CTL)).filter(x=>!x.ok);if(h0.length)bad.push('recouverts : '+h0.map(x=>x.sel+'→'+x.top).join(', '));
 for(const t of ['students','attendance','proc','reports','settings','home'])await E('menu '+t,async()=>{await A.click(p,'#tabs button[data-tab="'+t+'"]');await sleep(350);const s=await st();if(s.tab!==t)throw new Error('onglet '+s.tab);});
 await E('Synchro',async()=>{await A.click(p,'#syncPill');await sleep(500);const s=await st();if(s.tab!=='settings'||s.psv!=='sync')throw new Error(JSON.stringify(s));});
 await E('carte du professeur',async()=>{await A.click(p,'#tabs button[data-tab="home"]');await sleep(300);await A.click(p,'.dk-prof');await sleep(400);const s=await st();if(s.tab!=='settings')throw new Error(s.tab);});
 await E('Thème',async()=>{await A.click(p,'#themeBtn');await sleep(400);const s=await st();if(!s.th)throw new Error('fenêtre fermée');await p.keyboard.press('Escape');await sleep(200);if((await st()).th){await A.click(p,'#themeBtn');await sleep(300);}});
 await E('+ Ajouter un élève',async()=>{await A.click(p,'#tabs button[data-tab="students"]');await sleep(400);await A.click(p,'#dkBar .dk-add');await sleep(400);const s=await st();if(!s.add)throw new Error('fenêtre non ouverte');
  await A.eval(p,()=>{document.getElementById('addChoice').classList.remove('open');document.body.style.overflow='';});});
 await E('réduire',async()=>{await A.click(p,'#tabs button[data-tab="home"]');await sleep(300);await A.click(p,'.dk-col');await sleep(500);const s=await st();if(!s.mini||s.w!==76||s.key!=='1')throw new Error(JSON.stringify(s));});
 const h1=(await A.eval(p,HIT,CTL)).filter(x=>!x.ok);if(h1.length)bad.push('réduit, recouverts : '+h1.map(x=>x.sel+'→'+x.top).join(', '));
 await E('réduit : menu',async()=>{await A.click(p,'#tabs button[data-tab="reports"]');await sleep(350);if((await st()).tab!=='reports')throw new Error('');});
 await E('rechargement réduit',async()=>{await A.reload(p);await after(p);const s=await st();if(!s.mini||s.w!==76)throw new Error(JSON.stringify(s));});
 await E('agrandir',async()=>{await A.click(p,'.dk-col');await sleep(500);const s=await st();if(s.mini||s.w!==248||s.key!=='0')throw new Error(JSON.stringify(s));});
 check(name+' '+w+' px'+(th?' thème '+th:'')+' : chaque commande de la barre latérale au premier plan et active au vrai clic (menu, Synchro, Thème, carte, + Ajouter, réduire/agrandir, réduit après rechargement)',!bad.length&&!p.errs.length,bad.concat(p.errs));}
const pdfOk=f=>{try{const i=cp.execSync('pdfinfo "'+f+'"',{encoding:'utf8'});const n=+(/Pages:\s+(\d+)/.exec(i)||[])[1];return n;}catch(e){return 0;}};
const NEED=['cj-cahier.js','cahier/roi.jpg','cahier/logo.jpg','cahier/splash.jpg','cahier/poppins-400.ttf','cahier/cover.html'];
(async()=>{
 /* 0. statique */
 const sw=fs.readFileSync(D+'/sw.js','utf8'),LZ=(/const LAZY_ASSETS = \[([\s\S]*?)\];/.exec(sw)||[])[1]||'',AS=(/const ASSETS = \[([\s\S]*?)\];/.exec(sw)||[])[1]||'';
 const cf=fs.readdirSync(D+'/cahier').filter(f=>/\.(jpe?g|png|ttf|woff2?|html)$/.test(f)).map(f=>'cahier/'+f);
 check('sw.js : cache cahier-v29-2z ; cj-cahier.js et tous les fichiers de cahier/ dans LAZY_ASSETS (hors démarrage)',/const CACHE = 'cahier-v29-2z'/.test(sw)&&['cj-cahier.js'].concat(cf).every(f=>LZ.includes("'./"+f+"'")&&!AS.includes("'./"+f+"'")),cf.filter(f=>!LZ.includes("'./"+f+"'")));
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const wb=await webkit.launch();
 /* 1. barre latérale */
 for(const w of [1280,1440])for(const th of ['','terrain','neon']){const p=await open(b,PORT,{w,h:800,theme:th});await sidebar('Chrome',CH,p,w,th);await p.ctx.close();
  const q=await wopen(wb,{base:BASE,w,h:800,theme:th,sw:false});await sidebar('WebKit',WK,q,w,th);await q.ctx.close();}
 /* 2. cahier journalier */
 async function chromeCahier(lbl,o,expire){fs.rmSync(DL,{recursive:true,force:true});fs.mkdirSync(DL);const p=await open(b,PORT,o);const got=[];
  p.on('response',r=>{const u=r.url();const k=NEED.find(f=>u.endsWith('/'+f));if(k)got.push(k+':'+r.status());});
  const s=await b.target().createCDPSession();await s.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL,browserContextId:p.ctx.id});
  if(expire)await p.evaluateOnNewDocument(()=>{});if(expire)await p.evaluate(()=>{Object.defineProperty(navigator,'userActivation',{configurable:true,get:()=>({isActive:false,hasBeenActive:true})});});
  await tab(p,'settings');await sleep(900);await CH.click(p,'#cjcBtn');let t='';for(let i=0;i<150;i++){await sleep(1000);t=await p.evaluate(()=>document.getElementById('cjcBtn').textContent);if(!/Génération/.test(t)&&i>1)break;}
  let readyTxt='';if(/Enregistrer le cahier/.test(t)){readyTxt=t;await sleep(300);if(fs.readdirSync(DL).length)readyTxt+=' (déjà téléchargé ?)';await CH.click(p,'#cjcBtn');}
  let f=null;for(let i=0;i<30&&!f;i++){await sleep(500);f=fs.readdirSync(DL).find(x=>/\.pdf$/.test(x));}
  const n=f?pdfOk(DL+'/'+f):0,lbl2=await p.evaluate(()=>document.getElementById('cjcBtn').textContent);
  if(o.w>=1024&&!expire)await p.screenshot({path:'/tmp/t2y-cahier-pc.png'});
  const r={f,n,readyTxt,lbl2,got:[...new Set(got)],errs:p.errs};await p.ctx.close();return r;}
 let r=await chromeCahier('pc',{w:1280,h:800},false);
 check('Chrome ordinateur 1280 px (barre latérale) : vrai clic → cahier PDF téléchargé ('+r.n+' pages), fichiers du cahier chargés en 200, sans erreur',r.f==='Cahier-journalier-EPS-2026-2027.pdf'&&r.n>=90&&NEED.every(k=>r.got.includes(k+':200'))&&!r.errs.length&&/PAPERASSE/.test(r.lbl2),r);
 r=await chromeCahier('pc',{w:1440,h:900},true);
 check('Chrome ordinateur 1440 px, clic d’origine expiré : bouton « Enregistrer le cahier » puis vrai clic → PDF téléchargé ('+r.n+' pages), bouton remis à l’état initial',/^⬇️ Enregistrer le cahier \(PDF · \d+ Mo\)$/.test(r.readyTxt)&&r.f&&r.n>=90&&/PAPERASSE/.test(r.lbl2)&&!r.errs.length,r);
 r=await chromeCahier('mob',{w:390,h:844,mobile:true},true);
 check('Chrome téléphone 390 px (Android), clic expiré : « Enregistrer le cahier » puis vrai toucher → PDF téléchargé ('+r.n+' pages)',/Enregistrer le cahier/.test(r.readyTxt)&&r.f&&r.n>=90&&!r.errs.length,r);
 { const q=await wopen(wb,{base:BASE,w:1280,h:800,sw:false});await q.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(900);
   const dl=q.waitForEvent('download',{timeout:150000}).catch(()=>null);await WK.click(q,'#cjcBtn');
   let t='';for(let i=0;i<150;i++){await sleep(1000);t=await q.evaluate(()=>document.getElementById('cjcBtn').textContent);if(!/Génération/.test(t)&&i>1)break;}
   if(/Enregistrer le cahier/.test(t))await WK.click(q,'#cjcBtn');const d=await dl;let n=0;if(d){const f='/tmp/t2y-wk.pdf';await d.saveAs(f);n=pdfOk(f);}
   check('WebKit ordinateur 1280 px : vrai clic → cahier PDF téléchargé ('+n+' pages), sans erreur',!!d&&d.suggestedFilename()==='Cahier-journalier-EPS-2026-2027.pdf'&&n>=90&&!q.errs.length,[t,q.errs,q.logs]);await q.ctx.close();}
 { const q=await wopen(wb,{base:BASE,mobile:true,sw:false});
   await q.evaluate(()=>{window.__sh=null;navigator.canShare=d=>!!(d&&d.files&&d.files.length);navigator.share=d=>{const f=d.files[0];window.__sh={name:f.name,type:f.type,size:f.size};return Promise.resolve();};});
   await q.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(900);await WK.click(q,'#cjcBtn');
   let t='';for(let i=0;i<150;i++){await sleep(1000);t=await q.evaluate(()=>document.getElementById('cjcBtn').textContent);if(!/Génération/.test(t)&&i>1)break;}
   const m=await q.evaluate(()=>({open:document.getElementById('pdfModal').classList.contains('open'),share:!!document.getElementById('pdfShare'),href:(document.getElementById('pdfOpen')||{}).href||''}));
   await q.screenshot({path:'/tmp/t2y-cahier-iphone.png'});if(m.share)await WK.click(q,'#pdfShare');await sleep(500);const sh=await q.evaluate(()=>window.__sh);
   check('WebKit iPhone : vrai toucher → fenêtre « PDF prêt » (pas de bouton intermédiaire), « Partager / Enregistrer » reçoit le PDF (Cahier-journalier…, application/pdf, > 1 Mo), lien « Ouvrir » en blob:',/PAPERASSE/.test(t)&&m.open&&m.share&&/^blob:/.test(m.href)&&!!sh&&sh.name==='Cahier-journalier-EPS-2026-2027.pdf'&&sh.type==='application/pdf'&&sh.size>1e6&&!q.errs.length,[t,m,sh,q.errs]);await q.ctx.close();}
 /* 3. téléphone, Note procéd. */
 for(const w of [360,390,430]){const p=await open(b,PORT,{w,h:844,mobile:false});await tab(p,'proc');await sleep(800);
  const x=await p.evaluate(()=>{const e=document.getElementById('procEval'),R=e.querySelectorAll('.pq-row'),c=e.querySelectorAll('[data-csvrel]');return {r1:[...R[0].children].map(k=>k.id||k.className),r2last:R[1].lastElementChild.hasAttribute('data-csvrel'),n:c.length,cw:Math.round(c[0].getBoundingClientRect().width),of:[...R].some(r=>r.scrollWidth>r.clientWidth+1),sw:document.documentElement.scrollWidth>innerWidth};});
  check(w+' px Note procéd. : 1re ligne sans icône CSV (APS, épreuve, essais, PDF comme en 2w), icône CSV 32 px en fin de 2e ligne, sans débordement',x.n===1&&x.r2last&&x.cw===32&&!x.r1.some(k=>/csv/i.test(k))&&x.r1[x.r1.length-1]==='procGradesPdf'&&!x.of&&!x.sw,x);
  if(w===390){await p.evaluate(()=>document.getElementById('procEval').scrollIntoView());await sleep(200);const el=await p.$('#procEval .pqA')||await p.$('#procEval');await el.screenshot({path:'/tmp/t2y-proc-390.png'});}
  await p.setViewport({width:1280,height:800});await sleep(900);const d=await p.evaluate(()=>{const c=document.querySelector('#procEval [data-csvrel]'),pd=document.getElementById('procGradesPdf');return !!c&&pd.nextElementSibling===c&&!c.classList.contains('pq-csvm');});
  if(w===390)check('390 → 1280 px : icône CSV revenue à côté du relevé PDF',d);await p.ctx.close();}
 await b.close();await wb.close();console.log(pass+'/'+(pass+fail)+' passed');process.exit(fail?1:0);})().catch(e=>{console.log('FAIL - exception '+e.stack);process.exit(1);});
