/* v1.28.0 (-i) : écran Absences sans bascule « Absences | Notes /20 » — seul l’affichage Notes /20 reste ; saisie P/A/ST/M/R/MJ/AJ inchangée ;
   aucune donnée d’absence supprimée (Comport., Année, fiche, Rapports). SHOT=before|after : captures seules (BEFORE : 892bb63 depuis /tmp/cj-before3). */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const SHOT=process.env.SHOT||'';const D=SHOT==='before'?'/tmp/cj-before3':'/workspace/cj-deploy';const PORT=SHOT==='before'?8030:8029;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Etc/GMT-1');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now();
  const c=d.classes.find(x=>x.name==='1BACLSH2');const N=['بامعروف ياسين','رؤوفي سلمى','AIT BENALI Yassine','BENNANI Salma','مسناوي إيمان','CHAKIR Omar'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
  d.sessions={};d.sessions[c.id+'|0|0']={date:'',marks:{s0:{s:'A'},s1:{s:'L'},s3:{s:'M'}}};d.sessions[c.id+'|0|1']={date:'',marks:{s0:{s:'A'},s2:{s:'ST'},s4:{s:'A',j:true}}};
  d.ui.cls=c.id;d.ui.per=0;d.ui.mode='cycle';localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(600);
if(SHOT){await p.evaluate(()=>window.scrollTo(0,0));await sleep(800);await p.screenshot({path:'/tmp/v28s-'+SHOT+'0.png'});await p.addStyleTag({content:'#toast{display:none!important}'});await p.evaluate(()=>{const c=document.getElementById('attCard')||document.querySelector('#view-attendance .card');window.scrollTo(0,c.getBoundingClientRect().top+window.scrollY-112);});await sleep(1500);
  await p.screenshot({path:'/tmp/v28s-'+SHOT+'.png'});await p.evaluate(()=>{const w=document.getElementById('gridWrap');window.scrollTo(0,w.getBoundingClientRect().top+window.scrollY-112);w.scrollLeft=w.scrollWidth;});await sleep(600);await p.screenshot({path:'/tmp/v28s-'+SHOT+'2.png'});
  console.log('shot',SHOT,errs.length?'errors '+errs.join('|'):'ok');srv.close();await b.close();process.exit(0);}
const base=await p.evaluate(K=>localStorage.getItem(K),KEY);
const R=await p.evaluate(()=>({sw:!!document.getElementById('attView'),txt:document.getElementById('view-attendance').textContent,head:[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent),
  eval:!document.getElementById('attEval').classList.contains('hidden'),legend:[...document.querySelectorAll('#view-attendance .legend2 .lg')].map(x=>x.textContent).join(' '),
  row0:[...document.querySelectorAll('#gridWrap tr[data-sid="s0"] td.c')].slice(0,2).map(t=>t.textContent.trim()),tab:document.querySelector('#tabs button[data-tab="attendance"]').textContent.trim()}));
check('plus de bascule « Absences | Notes /20 » (ni libellé « Affichage »)',!R.sw&&!/Affichage/.test(R.txt),String(R.sw));
check('affichage Notes /20 seul : barre du barème + colonnes de notes, Comport., Note (+ Année, masquée ≤ 480 px comme avant)',R.eval&&R.head.slice(-3).map(x=>x.replace(/\/.*/,'')).join('|')==='Comport.|Note|Année'&&!R.head.includes('Abs.'),R.head.join('|'));
check('grille et codes inchangés : légende P A ST M R MJ AJ, marques existantes affichées (s0 : A A)',/^P A ST M R MJ AJ/.test(R.legend)&&R.row0.join()==='A,A',R.legend+' / '+R.row0.join());
check('onglet du bas toujours « Absences »',R.tab==='Absences',R.tab);
// saisie Rapide : P → A → … stockée comme avant
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s5"] td.c[data-s="0"]').click());await sleep(250);
let m=await p.evaluate(()=>{const d=window.CJR.db();return d.sessions[d.ui.cls+'|0|0'].marks.s5||null;});
check('toucher une case (mode Rapide) → s5 = A, stocké dans sessions["classe|0|0"].marks comme avant',m&&m.s==='A',JSON.stringify(m));
const comp=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tr[data-sid="s0"] td.comp, #gridWrap tr[data-sid="s0"] td.yr')].map(t=>t.textContent));
check('les absences continuent d’alimenter Comport. et Année (s0 : 2 absences → Comport. < max, Année 2)',comp.length===2&&comp[1].startsWith('2')&&/^\d/.test(comp[0])&&parseFloat(comp[0].replace(',','.'))<4,JSON.stringify(comp));
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s5"] td.c[data-s="0"]').click());await sleep(150);
for(let i=0;i<6;i++){const v=await p.evaluate(()=>{const d=window.CJR.db();return (d.sessions[d.ui.cls+'|0|0'].marks.s5||{}).s||'P';});if(v==='P')break;await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s5"] td.c[data-s="0"]').click());await sleep(120);}
// fiche + Rapports
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s0"] td.comp').click());await sleep(400);
const fiche=await p.evaluate(()=>document.getElementById('detBody').textContent.replace(/\s+/g,' '));
check('fiche élève : « Année entière » (Absences, Retards, Points retirés) + tableau « Par cycle » (Abs., Retards, Just., Pts)',/Année entière/.test(fiche)&&/Points retirés \(année\)/.test(fiche)&&/Par cycle.*Abs\..*Retards.*Just\..*Pts/.test(fiche),fiche.slice(0,200));
await p.evaluate(()=>{const m=document.querySelector('#detModal [data-close]');m&&m.click();});await sleep(200);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="reports"]').click());await sleep(600);
const rep=await p.evaluate(()=>({h:[...document.querySelectorAll('#view-reports thead th')].map(t=>t.textContent.replace(/[▾▴]/g,'').trim()).join('|')}));
check('Rapports : Points retirés, Abs., Non just., Retards, Just. toujours affichés',/Points retirés/.test(rep.h)&&/Abs\./.test(rep.h)&&/Retards/.test(rep.h)&&/Just\./.test(rep.h),rep.h);
const after=await p.evaluate(K=>localStorage.getItem(K),KEY);
const canon=o=>Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.keys(o).sort().reduce((a,k)=>(a[k]=canon(o[k]),a),{}):o;
const sess=s=>{const o=JSON.parse(s).sessions,r={};Object.keys(o).sort().forEach(k=>{r[k]=Object.keys(o[k].marks).sort().map(i=>i+':'+o[k].marks[i].s+(o[k].marks[i].j?'J':'')+(o[k].marks[i].r||'')).join(',');});return JSON.stringify(r);};
check('aucune donnée d’absence supprimée (mêmes codes A/R/M/ST/AJ par élève et par séance après aller-retour A → P)',sess(base)===sess(after),sess(after).slice(0,200));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
