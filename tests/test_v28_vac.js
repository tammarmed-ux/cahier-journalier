/* v1.28.0 (-e) : jours FÉRIÉS numérotés (S6), VACANCES sans numéro (date seule) et sans consommer de numéro : la numérotation reprend après (S7).
   Type férié / vacances = classement existant de l’application (holShort : « Vac. » / « Férié »). AFFICHAGE seulement : stockage inchangé. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8020);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8020/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods=d.periods.map((x,i)=>i===0?'Basket-ball':x);
  d.cal.cycles[0]={from:'2026-09-28',to:'2026-11-06'};
  if(!d.cal.holidays.some(h=>h.id==='h01'))throw new Error('vacances h01 absentes');
  d.cal.holidays.push({id:'hT',label:'Jour férié de test',from:'2026-10-15',to:'',approx:false,off:true});
  d.cal.tt=d.cal.tt.filter(t=>t.classId!==c.id);d.cal.tt.push({id:'tA',type:'class',day:1,start:'08:00',end:'10:00',classId:c.id,room:'Terrain'},{id:'tB',type:'class',day:4,start:'08:00',end:'10:00',classId:c.id,room:'Terrain'});
  const N=['بامعروف ياسين','رؤوفي سلمى','رؤوفي عمر','مسناوي إيمان','الصباحي حمزة','سيفي نور'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
  d.sessions={};d.ui.cls=c.id;d.ui.per=0;d.ui.mode='cycle';localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);

const CID=await p.evaluate(()=>window.CJR.db().classes.find(x=>x.name==='2BACSP4').id);
const goTab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(400);};
const hv=await p.evaluate(()=>{const H=window.CJR.db().cal.holidays;const a=H.find(h=>h.id==='h01'),b=H.find(h=>h.id==='hT');return {a:a.label,va:window.CJR.isVacH(a),vb:window.CJR.isVacH(b)};});
check('type : « '+hv.a+' » = vacances, « Jour férié de test » = férié (classement existant Vac. / Férié)',hv.va&&!hv.vb,JSON.stringify(hv));
await goTab('attendance');await p.evaluate(()=>document.querySelector('#attView button[data-v="abs"]').click());await sleep(300);
const H=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th')].slice(1,13).map(t=>({t:t.childNodes[0].textContent.replace(/\u00a0/g,'_'),d:(t.querySelector('small')||{}).textContent,c:t.className,s:t.dataset.sess,ti:t.title})));
const lab=H.map(h=>h.t+' '+h.d).join(',');
check('en-têtes : S1 28/09 … S5 12/10, S6 15/10 (férié numéroté), 19/10 et 22/10 (vacances : date seule), S7 26/10 … S10 05/11',lab==='S1 28/09,S2 01/10,S3 05/10,S4 08/10,S5 12/10,S6 15/10,_ 19/10,_ 22/10,S7 26/10,S8 29/10,S9 02/11,S10 05/11',lab);
check('férié : grisé/hachuré, info-bulle « Séance 6 – Férié : Jour férié de test · 15/10 (non comptée) »',/holh/.test(H[5].c)&&!/vach/.test(H[5].c)&&H[5].s===undefined&&H[5].ti==='Séance 6 – Férié : Jour férié de test · 15/10 (non comptée)',H[5].ti);
check('vacances : grisées/hachurées, aucun « S », info-bulle « Vacances : 1re période intermédiaire (vacances) · 19/10 (non comptée) »',/holh vach/.test(H[6].c)&&/holh vach/.test(H[7].c)&&!/S\d/.test(H[6].t+H[7].t)&&H[6].ti==='Vacances : '+hv.a+' · 19/10 (non comptée)'&&!/Séance/.test(H[6].ti+H[7].ti),H[6].ti);
check('S7 = 1re séance après les vacances, enregistrée sous l’index 5 (data-sess 5) ; info-bulle « Séance 7 »',H[8].s==='5'&&/^Séance 7/.test(H[8].ti)&&H[4].s==='4',JSON.stringify(H[8]));
await p.evaluate(()=>{document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="5"]').click();});await sleep(150);
await p.evaluate(()=>{document.querySelector('#gridWrap tr[data-sid="s3"] td.c[data-s="4"]').click();});await sleep(150);
const st=await p.evaluate(CID=>{const S=window.CJR.db().sessions;return Object.keys(S).filter(k=>k.startsWith(CID+'|0|')).map(k=>k+':'+JSON.stringify(S[k].marks));},CID);
check('stockage inchangé : absence de S7 (26/10) sous « classe|0|5 », de S5 (12/10) sous « classe|0|4 »',st.length===2&&st.some(x=>x.startsWith(CID+'|0|5:')&&/"s0":\{"s":"A"/.test(x))&&st.some(x=>x.startsWith(CID+'|0|4:')&&/"s3":\{"s":"A"/.test(x)),JSON.stringify(st));
const info=await p.evaluate(()=>document.getElementById('attInfo').textContent);const n=await p.evaluate(CID=>window.CJR.sessCount(CID,0),CID);
check('séances effectuées sans fériés ni vacances (2/9)',n===9&&/^2\/9 séances effectuées/.test(info),info);
await p.evaluate(()=>document.querySelector('#gridWrap th[data-sess="5"]').click());await sleep(300);
const t1=await p.evaluate(()=>document.getElementById('sessTitle').textContent);await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="5"]');td.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true}));});await sleep(300);
const t2=await p.evaluate(()=>document.getElementById('cellSub').textContent);await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
check('fenêtres : « Séance 7 » (séance) et « … · Séance 7 · … 26 oct. » (case)',t1==='Séance 7'&&/· Séance 7 ·/.test(t2),t1+' / '+t2);
// capture : en-têtes S5 · S6 (férié) · 19/10 · 22/10 · S7
await p.evaluate(()=>{const g=document.getElementById('gridWrap');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-260);const w=g.querySelector('.grid')?g:g;const th=g.querySelector('thead th:nth-child(6)'),nm=g.querySelector('thead th.nm');const sc=[g,...g.querySelectorAll('*')].find(e=>e.scrollWidth>e.clientWidth+5&&getComputedStyle(e).overflowX!=='visible');if(sc)sc.scrollLeft=th.offsetLeft-nm.offsetWidth;});await sleep(2700);
await p.screenshot({path:'/tmp/v28v-grid.png'});
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s0"] th.nm').click());await sleep(400);
const fiche=await p.evaluate(()=>document.getElementById('detModal').textContent);
check('fiche élève : absence « Cycle 1 · S7 »',/Cycle 1 · S7/.test(fiche),(fiche.match(/Cycle 1 · S\d+/)||[''])[0]);
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return btoa(s);});
  const f='/tmp/v28v_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r,'base64'));return {f,t:cp.execSync('pdftotext -layout '+f+' -').toString(),r:cp.execSync('pdftotext '+f+' -').toString().replace(/\s+/g,' ')};}
const ps=await pdf(()=>document.getElementById('detPdf').click());const PS=ps.t.replace(/\s+/g,' ');
await p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
check('PDF fiche élève : historique « S7 », férié « S6 », vacances sans numéro',/Cycle 1 S7/.test(PS)&&/S6 (\(C1\) )?\S+ 15\/10/.test(ps.r)&&/séances : (\(C1\) )?lun\. 19\/10 08:00 · (\(C1\) )?jeu\. 22\/10/.test(ps.r),(ps.r.match(/Jours fériés et vacances.{0,400}/)||[''])[0]);
await goTab('reports');
const pc=await pdf(()=>{const c=document.getElementById('repClass');[...c.options].forEach(o=>{if(o.textContent.startsWith('2BACSP4'))c.value=o.value;});c.dispatchEvent(new Event('change'));const s=document.getElementById('repScope');s.value='0';s.dispatchEvent(new Event('change'));document.getElementById('repExportPdf').click();});
const PC=pc.t.replace(/[ \t]+/g,' ');fs.copyFileSync(pc.f,'/tmp/v28v-cycle.pdf');
check('PDF registre : S1 … S6 S7 S8 S9 S10 (vacances sans S) et dates 15/10 19/10 22/10 26/10',/S1 S2 S3 S4 S5 S6 S7 S8 S9 S10/.test(PC)&&/12\/10 15\/10 19\/10 22\/10 26\/10 29\/10/.test(PC),(PC.match(/S1 S2.{0,60}/)||[''])[0]+' | '+(PC.match(/28\/09 01\/10.{0,80}/)||[''])[0]);
check('PDF tableau des fériés : « 1 séance : S6 jeu. 15/10 » et vacances « 2 séances : lun. 19/10 08:00 · jeu. 22/10 08:00 » (sans S)',/1 séance : S6 jeu\. 15\/10 08:00/.test(pc.r)&&/2 séances : lun\. 19\/10 08:00 · jeu\. 22\/10 08:00/.test(pc.r),(pc.r.match(/Séances concernées.{0,300}/)||[''])[0]);
const pr=await pdf(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();const s=document.getElementById('expClass');[...s.options].forEach(o=>{if(o.textContent.startsWith('2BACSP4'))s.value=o.value;});document.getElementById('pdfRecords').click();});
const PR=pr.t.replace(/\s+/g,' ');
check('PDF liste détaillée : « 26/10/2026 C1 S7 », « 12/10/2026 C1 S5 », férié « S6 », vacances « — »',/26\/10\/2026 C1 S7/.test(PR)&&/12\/10\/2026 C1 S5/.test(PR)&&/15\/10\/2026 C1 S6/.test(pr.r)&&/19\/10\/2026 C1 — Vacances/.test(pr.r),(pr.r.match(/Liste détaillée.{0,500}/)||[''])[0]);
fs.copyFileSync(pr.f,'/tmp/v28v-records.pdf');
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
