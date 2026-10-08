/* v1.28.0 : séances numérotées en continu S1, S2… jours fériés / vacances compris (AFFICHAGE seulement : enregistrement par index inchangé),
   grille, fenêtres, fiche élève, PDF (registre, graphique, liste détaillée, historique, tableau des fériés) */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8019);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8019/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods=d.periods.map((x,i)=>i===0?'Basket-ball':x);
  d.cal.cycles[0]={from:'2026-09-14',to:'2026-10-16'};
  d.cal.holidays.push({id:'hT',label:'Jour férié de test',from:'2026-09-14',to:'2026-09-24',approx:false,off:true});
  d.cal.tt=d.cal.tt.filter(t=>t.classId!==c.id);d.cal.tt.push({id:'tA',type:'class',day:1,start:'08:00',end:'10:00',classId:c.id,room:'Terrain'},{id:'tB',type:'class',day:4,start:'08:00',end:'10:00',classId:c.id,room:'Terrain'});
  const N=['بامعروف ياسين','رؤوفي سلمى','رؤوفي عمر','مسناوي إيمان','الصباحي حمزة','سيفي نور'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
  d.sessions={};d.ui.cls=c.id;d.ui.per=0;d.ui.mode='cycle';localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const CID=await p.evaluate(()=>window.CJR.db().classes.find(x=>x.name==='2BACSP4').id);
const goTab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(400);};
await goTab('attendance');await p.evaluate(()=>document.querySelector('#attView button[data-v="abs"]').click());await sleep(300);
const H=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th')].slice(1,9).map(t=>({t:t.childNodes[0].textContent,d:(t.querySelector('small')||{}).textContent,c:t.className,s:t.dataset.sess,ti:t.title})));
check('en-têtes : 14/09 = S1, 17/09 = S2, 21/09 = S3, 24/09 = S4 (fériés, plus « Férié »), 28/09 = S5, 01/10 = S6…',H.map(h=>h.t+' '+h.d).join(',')==='S1 14/09,S2 17/09,S3 21/09,S4 24/09,S5 28/09,S6 01/10,S7 05/10,S8 08/10'&&!H.some(h=>/Férié/.test(h.t)),JSON.stringify(H.map(h=>h.t+' '+h.d)));
check('colonnes fériées toujours grisées / hachurées (holh), motif dans l’info-bulle « Séance 1 – Férié : … (non comptée) »',H.slice(0,4).every(h=>/holh/.test(h.c)&&h.s===undefined)&&/Séance 1 – Férié : Jour férié de test( · 14\/09)? \(non comptée\)/.test(H[0].ti)&&!!(await p.evaluate(()=>document.querySelector('#gridWrap td.holc'))),H[0].ti);
check('S5 = 1re vraie séance : enregistrée sous l’index 0 (data-sess 0), info-bulle « Séance 5 »',H[4].s==='0'&&/^Séance 5/.test(H[4].ti)&&H[5].s==='1',JSON.stringify(H[4]));
// marquer A en S5 (index 0) puis S6 (index 1)
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="0"]');td.click();});await sleep(150);
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s3"] td.c[data-s="1"]');td.click();});await sleep(150);
const st=await p.evaluate(CID=>{const S=window.CJR.db().sessions;return Object.keys(S).filter(k=>k.startsWith(CID+'|0|')).map(k=>k+':'+JSON.stringify(S[k].marks));},CID);
check('stockage inchangé : l’absence de S5 est enregistrée sous « classe|0|0 », celle de S6 sous « classe|0|1 » (aucune renumérotation)',st.length===2&&st.some(x=>x.startsWith(CID+'|0|0:')&&/"s0":\{"s":"A"/.test(x))&&st.some(x=>x.startsWith(CID+'|0|1:')&&/"s3":\{"s":"A"/.test(x)),JSON.stringify(st));
const info=await p.evaluate(()=>document.getElementById('attInfo').textContent);const n=await p.evaluate(CID=>window.CJR.sessCount(CID,0),CID);
check('séances effectuées et nombre de séances sans les fériés (2/'+n+')',new RegExp('^2/'+n+' séances effectuées').test(info)&&n===await p.evaluate(CID=>window.CJR.colsOf(CID,0).filter(c=>!c.hol).length,CID),info);
// fenêtres
await p.evaluate(()=>document.querySelector('#gridWrap th[data-sess="0"]').click());await sleep(300);
const t1=await p.evaluate(()=>document.getElementById('sessTitle').textContent);await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="0"]');td.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));});await sleep(300);
const t2=await p.evaluate(()=>document.getElementById('cellSub').textContent);await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
check('fenêtre de séance « Séance 5 », fenêtre de case « … · Séance 5 · lun. 28 sept. »',t1==='Séance 5'&&/· Séance 5 ·/.test(t2),t1+' / '+t2);
await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>{const g=document.getElementById('gridWrap');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-260);});await sleep(2700);
await p.screenshot({path:'/tmp/v28s-grid.png'});
// fiche élève
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s0"] th.nm').click());await sleep(400);
const fiche=await p.evaluate(()=>document.getElementById('detModal').textContent);
check('fiche élève : absence listée « Cycle 1 · S5 »',/Cycle 1 · S5/.test(fiche),fiche.match(/Cycle 1 · S\d+/)&&fiche.match(/Cycle 1 · S\d+/)[0]);
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return btoa(s);});
  const f='/tmp/v28s_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r,'base64'));return {f,t:cp.execSync('pdftotext -layout '+f+' -').toString(),r:cp.execSync('pdftotext '+f+' -').toString().replace(/\s+/g,' ')};}
const ps=await pdf(()=>document.getElementById('detPdf').click());const PS=ps.t.replace(/\s+/g,' ');
await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
check('PDF fiche élève : historique « S5 », jour férié avec ses séances « S1, S2, S3, S4 », tableau « S1 lun. 14/09 … »',/Cycle 1 S5/.test(PS)&&/S1, S2, S3, S4/.test(PS)&&/S1 (\(C1\) )?\S+ 14\/09 08:00 · S2/.test(ps.r),(PS.match(/Historique.{0,300}/)||[''])[0]);
await goTab('reports');
const pc=await pdf(()=>{const c=document.getElementById('repClass');c.value=document.querySelector('#repClass option[value]').value;[...c.options].forEach(o=>{if(o.textContent.startsWith('2BACSP4'))c.value=o.value;});c.dispatchEvent(new Event('change'));const s=document.getElementById('repScope');s.value='0';s.dispatchEvent(new Event('change'));document.getElementById('repExportPdf').click();});
const PC=pc.t.replace(/[ \t]+/g,' ');fs.copyFileSync(pc.f,'/tmp/v28s-cycle.pdf');
check('PDF bilan du cycle : registre S1 … S4 (fériés hachurés) puis S5 28/09, S6 01/10 ; plus d’en-tête « Férié »',/S1 S2 S3 S4 S5 S6/.test(PC)&&/14\/09 17\/09 21\/09 24\/09 28\/09 01\/10/.test(PC)&&!/Férié\n|Férié 14/.test(PC),(PC.match(/S1 S2.{0,80}/)||[''])[0]);
check('PDF bilan : tableau des fériés « 4 séances : S1 lun. 14/09 08:00 · S2 … · S4 … »',/4 séances : S1 \S+ 14\/09 08:00 · S2 \S+ 17\/09 08:00 · S3 \S+ 21\/09 08:00 · S4 \S+ 24\/09/.test(pc.r),(pc.r.match(/4 séances.{0,120}/)||[''])[0]);
const pr=await pdf(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();const s=document.getElementById('expClass');[...s.options].forEach(o=>{if(o.textContent.startsWith('2BACSP4'))s.value=o.value;});document.getElementById('pdfRecords').click();});
const PR=pr.t.replace(/\s+/g,' ');
check('PDF liste détaillée : absences en « S5 » et « S6 », ligne fériée « S1, S2, S3, S4 »',/28\/09\/2026 C1 S5/.test(PR)&&/01\/10\/2026 C1 S6/.test(PR)&&/S1, S2, S3, S4/.test(pr.r),(PR.match(/Liste détaillée.{0,400}/)||[''])[0]);
// CSV inchangé (exports) : la fonction d’export n’utilise pas la numérotation affichée
const csvSrc=await p.evaluate(()=>document.documentElement.outerHTML.includes("head.push(holShort(c.hol)===TX.vacShort?TX.vacShort:TX.holHead)"));
check('exports CSV inchangés (en-têtes « Férié » et S1 = 1re vraie séance, comme en 1.27)',csvSrc);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
