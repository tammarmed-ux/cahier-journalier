/* v1.28.0 : type d’activité choisi à côté de chaque nom de cycle (Paramètres) — source unique pour Notes /20, Note procéd. et PDF,
   exception par classe possible, déduction d’après le nom tant qu’aucun choix, notes jamais détruites, confirmation */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8018);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];let dlgAns=true;p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());dlgAns?d.accept():d.dismiss();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8018/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods=['Basket-ball','Athlétisme – vitesse','Gymnastique','','Handball','Endurance'];
  d.classes.push({id:'c1b',name:'1BACSE2'});
  d.students=[['AIT BENALI Yassine','G'],['BENNANI Salma','F'],['CHAKIR Omar','G']].map((n,i)=>({id:'s'+i,classId:c.id,name:n[0],sex:n[1],sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
  d.students.push({id:'b0',classId:'c1b',name:'KADIRI Ayoub',sex:'G',sid:'M200000001',dob:'',parent:'',phone:'',notes:'',created:1});
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const CID=await p.evaluate(()=>window.CJR.db().classes.find(x=>x.name==='2BACSP4').id);
const goTab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(400);};
const sel=()=>p.evaluate(()=>[...document.querySelectorAll('#periodNames select.cytype')].map(s=>({v:s.value,auto:s.classList.contains('auto'),t:s.options[s.selectedIndex].text})));
const setCy=async(i,v)=>{await p.evaluate((i,v)=>{const s=document.querySelector('#periodNames select[data-cy="'+i+'"]');s.value=v;s.dispatchEvent(new Event('change',{bubbles:true}));},i,v);await sleep(250);};
const db=()=>p.evaluate(()=>JSON.parse(JSON.stringify(window.CJR.db())));
const aps=(cid,per)=>p.evaluate((c,q)=>window.CJR.apsOf(c,q),cid,per);
await goTab('settings');
const s0=await sel();const rows=await p.evaluate(()=>[...document.querySelectorAll('#periodNames .cyrow')].map(r=>r.querySelector('span').textContent+'|'+!!r.querySelector('input[data-pi]')+'|'+!!r.querySelector('select.cytype')));
check('Paramètres › Année scolaire : à côté de chaque nom de cycle, un sélecteur Sport collectif / Athlétisme / Gymnastique (6 cycles)',rows.length===6&&rows.every(r=>/\|true\|true$/.test(r))&&await p.evaluate(()=>[...document.querySelector('#periodNames select.cytype').options].map(o=>o.value).join(','))==='coll,athle,gym',JSON.stringify(rows));
check('aucun choix enregistré : valeur déduite du nom (Basket → collectif, Athlétisme → athlétisme, Gymnastique → gym, vide → collectif, Endurance → athlétisme), marquée « auto »',JSON.stringify(s0.map(x=>x.v))==='["coll","athle","gym","coll","coll","athle"]'&&s0.every(x=>x.auto&&/\(auto\)/.test(x.t))&&!(await db()).evals,JSON.stringify(s0));
const fit=await p.evaluate(()=>{const r=[...document.querySelectorAll('#periodNames select.cytype')].map(s=>s.getBoundingClientRect());return r.every(x=>x.left>=0&&x.right<=innerWidth)&&document.documentElement.scrollWidth<=innerWidth;});
check('iPhone : sélecteurs visibles sans débordement',fit);
// renommer une activité sans choix → la déduction suit
await p.evaluate(()=>{const i=document.querySelector('#periodNames input[data-pi="3"]');i.value='Saut en longueur';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(250);
check('activité du cycle 4 renommée « Saut en longueur » (sans choix) → athlétisme (auto)',(await sel())[3].v==='athle'&&(await sel())[3].auto);
// choix explicite sans notes
dialogs.length=0;await setCy(3,'gym');const d1=await db();
check('choix explicite (cycle 4 = Gymnastique) : enregistré dans DB.evals.cyc, plus « auto », pas de confirmation sans notes, toutes les classes suivent',d1.evals&&d1.evals.cyc&&d1.evals.cyc['3']==='gym'&&!(await sel())[3].auto&&dialogs.length===0&&await aps(CID,3)==='gym'&&await aps('c1b',3)==='gym',JSON.stringify(d1.evals));
// Notes /20 et Note procéd. suivent
await p.evaluate(()=>{const DB=window.CJR.db();DB.ui.per=3;});await goTab('proc');
const hp=await p.evaluate(()=>[...document.querySelectorAll('#procWrap thead th.t')].map(t=>t.textContent).join('|'));
const np=await p.evaluate(()=>document.getElementById('procEval').textContent);
check('onglet Note procéd. (cycle 4) : Gymnastique /14, barre « type du cycle · Paramètres »',hp==='Gymnastique/14|Procéd./14'&&/type du cycle · Paramètres/.test(np),hp+' / '+np.slice(0,120));
// notes sport collectif au cycle 1, puis changement de type
await p.evaluate(()=>{const DB=window.CJR.db();DB.ui.per=0;});await goTab('proc');
const type=async(sid,k,v)=>{await p.evaluate((sid,k,v)=>{const i=document.querySelector('section.view.active tr[data-sid="'+sid+'"] input[data-k="'+k+'"]');i.focus();i.value=v;i.dispatchEvent(new Event('change',{bubbles:true}));i.blur();},sid,k,v);await sleep(60);};
await type('s0','g1','6');await type('s0','g2','6,5');await type('s1','g1','5');await type('s1','g2','4');
await goTab('settings');dlgAns=false;dialogs.length=0;await setCy(0,'gym');
const r1={dlg:dialogs.slice(),v:(await sel())[0].v,aps:await aps(CID,0),cyc:((await db()).evals.cyc||{})['0']};
check('cycle 1 → Gymnastique alors que des notes « Collectif » existent : confirmation (notes gardées, non comptées) ; refus → rien ne change',r1.dlg.length===1&&/2 élèves/.test(r1.dlg[0])&&/Rien n’est effacé/.test(r1.dlg[0])&&r1.v==='coll'&&r1.aps==='coll'&&!r1.cyc,JSON.stringify(r1));
dlgAns=true;await setCy(0,'gym');const e0=(await db()).students.find(s=>s.id==='s0').ev[CID+'|0'];
check('accepté : cycle 1 = Gymnastique ; les notes saisies restent dans s.ev (g1 6, g2 6,5), ev.aps mis à jour',(await aps(CID,0))==='gym'&&e0.g1===6&&e0.g2===6.5&&e0.aps==='gym',JSON.stringify(e0));
await goTab('attendance');await sleep(300);
const hn=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent).join('|'));
check('Notes /20 suit le type du cycle (Gym. /14 · Concept. · Comport. · Note)',/^Gym\.\/14\|Concept\.\/3\|Comport\.\/3\|Note\/20/.test(hn),hn);
await goTab('settings');await setCy(0,'coll');
await goTab('attendance');await sleep(300);
const back=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tr[data-sid="s0"] input.gin')].map(i=>i.dataset.k+'='+i.value).join(','));
check('retour à Sport collectif : les notes reviennent (Indiv. 6, Coll. 6,5)',/g1=6,g2=6,5/.test(back),back);
// exception pour une classe
dialogs.length=0;await p.evaluate(()=>{const s=document.getElementById('attAps');s.value='athle';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
const ov={d:(await db()).evals.aps,a:await aps(CID,0),b:await aps('c1b',0),note:await p.evaluate(()=>document.querySelector('#attEval .apsn').textContent)};
check('exception de classe (barre Notes /20) : 2BACSP4 cycle 1 = Athlétisme, 1BACSE2 reste Sport collectif ; « propre à cette classe · cycle : Sport collectif »',ov.d&&ov.d[CID+'|0']==='athle'&&ov.a==='athle'&&ov.b==='coll'&&/propre à cette classe · cycle : Sport collectif/.test(ov.note),JSON.stringify(ov));
await goTab('settings');const ovl=await p.evaluate(()=>(document.querySelector('#periodNames .cyrow small.cyov')||{}).textContent||'');
check('Paramètres signale la classe qui a son propre choix',/Choix propre à : 2BACSP4/.test(ovl),ovl);
await goTab('attendance');await p.evaluate(()=>{const s=document.getElementById('attAps');s.value='coll';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
check('rechoisir le type du cycle dans la barre → exception supprimée',!((await db()).evals.aps||{})[CID+'|0']&&await aps(CID,0)==='coll');
await p.evaluate(()=>{const s=document.getElementById('attAps');s.value='athle';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
await goTab('settings');dialogs.length=0;await setCy(0,'coll');
// le select vaut déjà coll (déduction) → forcer un changement réel : choisir athlé puis coll
await setCy(0,'athle');const dd=dialogs.slice();const d2=await db();
check('nouveau type du cycle choisi dans Paramètres : appliqué à toutes les classes, exceptions retirées (confirmation qui les cite)',d2.evals.cyc['0']==='athle'&&!(d2.evals.aps||{})[CID+'|0']&&await aps('c1b',0)==='athle'&&dd.some(m=>/toutes les classes/.test(m)),JSON.stringify([d2.evals,dd]));
await setCy(0,'coll');
// PDF suit
await p.evaluate(()=>{const DB=window.CJR.db();DB.ui.per=3;});await goTab('proc');
await p.evaluate(()=>{window.__lastPdf=null;document.getElementById('procGradesPdf').click();});await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});
const pt=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return btoa(s);});
fs.writeFileSync('/tmp/v28c.pdf',Buffer.from(pt,'base64'));const T=cp.execSync('pdftotext -layout /tmp/v28c.pdf -').toString().replace(/\s+/g,' ');
check('PDF relevé (cycle 4) : APS Gymnastique d’après le type du cycle',/APS : Gymnastique/.test(T)&&/Gym\. \/14/.test(T),T.slice(0,200));
// persistance + normalisation
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await goTab('settings');
const s3=await sel();check('après rechargement : choix conservés (cycle 1 collectif, cycle 4 gym, non « auto »)',s3[0].v==='coll'&&!s3[0].auto&&s3[3].v==='gym'&&!s3[3].auto,JSON.stringify(s3));
const ne=await p.evaluate(CID=>window.CJR.normEvals({cyc:{'0':'gym','1':'xx','a':'coll','12':'athle'},ntr:{[CID+'|0']:4,[CID+'|1']:9,[CID+'|2']:'3'},aps:{[CID+'|0']:'coll'}},{[CID]:1}),CID);
check('normalisation : cyc (n° de cycle → coll/athle/gym) et ntr (1 à 6) gardés, valeurs invalides retirées',JSON.stringify(ne)===JSON.stringify({aps:{[CID+'|0']:'coll'},ntr:{[CID+'|0']:4},cyc:{'0':'gym','12':'athle'}}),JSON.stringify(ne));
// ancienne donnée de l’aperçu (exception seule)
const old=await p.evaluate(()=>{const DB=window.CJR.db(),k=DB.classes[0].id+'|5';DB.evals.aps=DB.evals.aps||{};DB.evals.aps[k]='gym';const r=window.CJR.apsOf(DB.classes[0].id,5);delete DB.evals.aps[k];return r;});
check('compatibilité : une APS choisie par classe dans les aperçus précédents reste prise en compte (exception)',old==='gym');
await p.evaluate(()=>{const i=document.querySelector('#periodNames input[data-pi="3"]');i.value='Gymnastique au sol';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(2800);
await p.evaluate(()=>window.scrollTo(0,0));
await p.evaluate(()=>{const c=document.getElementById('periodNames');window.scrollTo(0,c.getBoundingClientRect().top+window.scrollY-200);});await sleep(400);
await p.screenshot({path:'/tmp/v28c-settings.png'});
// la barre Note procéd. avec exception, pour la capture
await p.evaluate(()=>{const DB=window.CJR.db();DB.ui.per=0;});await goTab('proc');
await p.evaluate(()=>{const s=document.getElementById('procAps');s.value='athle';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(2900);
await p.evaluate(()=>{const g=document.getElementById('procEval');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-150);});await sleep(300);await p.screenshot({path:'/tmp/v28c-proc.png'});
await p.evaluate(()=>{const s=document.getElementById('procAps');s.value='coll';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
