/* 1.29.2 (h) : Accueil — Calendrier des cycles B (mêmes semaines que cal()), emoji d’activité (Calendrier + cartes Cycles B) ; captures 390 px */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',O='/workspace/backups/v1.29.2-preview/';const SHOT=process.env.SHOT!=='0';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const serve=(D,port)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(port);
const NEW=serve('/workspace/cj-deploy',8042);
const DATA=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const res=[];const check=(n,ok,x)=>{res.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+String(x).slice(0,300):''));};
const ALL=()=>{const A=window.CJR,db=A.db(),out={},cnt={students:db.students.length,classes:db.classes.length,sessions:Object.keys(db.sessions).length,marks:Object.values(db.sessions).reduce((n,r)=>n+Object.keys(r.marks||{}).length,0)};
 db.classes.forEach(c=>{A.studentsIn(c.id).forEach(s=>{for(let p=0;p<db.periods.length;p++){const g=A.gradeOf(c.id,s.id,p);out[c.id+'|'+s.id+'|'+p]=[g.comp.v,g.comp.max,g.comp.ded,g.comp.raw,g.total,g.partial];}});});
 return {cnt,out};};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=async(port,data)=>{const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';});return p;};


const p=await page(8042,DATA);const db0=await p.evaluate(()=>JSON.stringify(CJR.db()));
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(600);
const r=await p.evaluate(()=>{const e=document.getElementById('homeCal');const rows=[...e.querySelectorAll('.hc-row')];return {n:rows.length,txt:rows.map(x=>x.querySelector('.hc-t').textContent+'|'+x.querySelector('.hc-r').textContent+'|'+x.querySelectorAll('.hc-wk i').length+'|'+x.querySelectorAll('.hc-wk i.v').length+'|'+x.querySelector('.hc-ic').textContent),aria:rows.map(x=>x.getAttribute('aria-label')),sep:(e.querySelector('.hc-sep')||{}).textContent,btn:!!e.querySelector('[data-goset="1"]'),i:!!e.querySelector('[data-pq-open="calSheet"]'),leg:!!e.querySelector('.hc-leg'),ovf:document.documentElement.scrollWidth-innerWidth};});
console.log(JSON.stringify(r,null,1));
check('6 rangées, séparateur « Aujourd’hui », ⓘ, légende, bouton Paramètres, pas de débordement',r.n===6&&/^Aujourd’hui \d\d\/\d\d/.test(r.sep)&&r.btn&&r.i&&r.leg&&r.ovf<=0,r.sep);
check('mêmes semaines que l’ancienne carte (textes TX.cycWk / TX.cycHol dans aria-label)',r.aria[0].includes('3 semaines de cours')&&r.aria[0].includes('dont 2 semaines de vacances')&&r.aria[1].includes('5 semaines de cours')&&!r.aria[1].includes('vacances'),r.aria[0]);
check('emoji par activité (🏃 🏋️ 🏀 ⚡ 🏐 🦘)',r.txt.map(x=>x.split('|')[4]).join(' ')==='🏃 🏋️ 🏀 ⚡ 🏐 🦘',r.txt.map(x=>x.split('|')[4]).join(' '));
check('états d’après la date du jour (21/10/2026 : C1 TERMINÉ, C2 DANS 5 J)',/TERMINÉ/.test(r.txt[0])&&/DANS 5 J/.test(r.txt[1]),r.txt[0]+' / '+r.txt[1]);
await p.click('[data-pq-open="calSheet"]');await sleep(300);check('ⓘ ouvre la feuille d’aide',await p.evaluate(()=>!document.getElementById('calSheet').hidden));await p.evaluate(()=>document.querySelector('#calSheet [data-pq-close]').click());await sleep(200);
for(const th of ['','terrain','neon']){await p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');document.getElementById('homeCal').scrollIntoView({block:'start'});},th);await sleep(300);if(SHOT){const el=await p.$('#homeCal');await el.screenshot({path:O+'calendrier-B'+(th?'-'+th:'')+'.png'});}}
await p.evaluate(()=>document.documentElement.removeAttribute('data-theme'));
// Paramètres › Cycles et activités (cartes B)
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(500);
const em=await p.evaluate(()=>[...document.querySelectorAll('#periodNames .cyb-n .act-em')].map(x=>x.textContent).join(' '));
check('cartes Cycles B : emoji devant le nom de l’activité',em==='🏃 🏋️ 🏀 ⚡ 🏐 🦘',em);
check('helper actEmoji : accents/casse, repli sur le type',await p.evaluate(()=>{const f=window.CJR&&CJR.actEmoji;return !!f&&(f('TENNIS DE TABLE')==='🏓'&&f('Échecs')==='♟️'&&f('Handball')==='🤾'&&f('Course de relais')==='🏃'&&f('Zumba','gym')==='🤸'&&f('Zumba','coll')==='⚽');}));
if(SHOT){await p.evaluate(()=>CJPS.open('annee'));await sleep(500);await p.evaluate(()=>{const e=document.getElementById('periodNames');e.scrollIntoView({block:'start'});window.scrollBy(0,-110);});await sleep(300);await p.screenshot({path:O+'cycles-B-emoji.png'});}
check('aucune donnée modifiée',await p.evaluate(d=>{const x=JSON.parse(d),y=JSON.parse(JSON.stringify(CJR.db()));delete x.ui;delete y.ui;return JSON.stringify(x)===JSON.stringify(y);},db0));
check('aucune erreur JS',!p.errs.length,p.errs.join(' | '));
await b.close();NEW.close();console.log(res.filter(x=>x).length+'/'+res.length+' passed');process.exit(res.every(x=>x)?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
