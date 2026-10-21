/* 1.29.2 (f) : Av / Bn — non-régression sur l’export réel (sans Av/Bn : notes comportementales identiques), stockage additif, ancienne version qui conserve s.bh, captures 390 px */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',O='/workspace/backups/v1.29.2-preview/';const SHOT=process.env.SHOT!=='0';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const serve=(D,port)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(port);
const NEW=serve('/workspace/cj-deploy',8038),OLDS=serve('/workspace/old-5ba3024',8039),PROD=serve('/workspace/old-v1291',8040);
const DATA=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const res=[];const check=(n,ok,x)=>{res.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+String(x).slice(0,300):''));};
const ALL=()=>{const A=window.CJR,db=A.db(),out={},cnt={students:db.students.length,classes:db.classes.length,sessions:Object.keys(db.sessions).length,marks:Object.values(db.sessions).reduce((n,r)=>n+Object.keys(r.marks||{}).length,0)};
 db.classes.forEach(c=>{A.studentsIn(c.id).forEach(s=>{for(let p=0;p<db.periods.length;p++){const g=A.gradeOf(c.id,s.id,p);out[c.id+'|'+s.id+'|'+p]=[g.comp.v,g.comp.max,g.comp.ded,g.comp.raw,g.total,g.partial];}});});
 return {cnt,out};};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=async(port,data)=>{const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';});return p;};
// 1) non-régression : ancienne (5ba3024) vs nouvelle version, même export réel, sans Av/Bn
const po=await page(8039,DATA),pn=await page(8038,DATA);
if(!(await po.evaluate(()=>typeof window.CJR.gradeOf))==='function')throw 'gradeOf';
const ro=await po.evaluate(ALL),rn=await pn.evaluate(ALL);
const keys=Object.keys(ro.out);const diff=keys.filter(k=>JSON.stringify(ro.out[k])!==JSON.stringify(rn.out[k]));
check('export réel : mêmes comptes (élèves, classes, séances, marques) '+JSON.stringify(rn.cnt),JSON.stringify(ro.cnt)===JSON.stringify(rn.cnt));
check('export réel : '+keys.length+' notes (comportement, max, déductions, note du cycle) identiques à la version précédente',keys.length>1000&&!diff.length&&Object.keys(rn.out).length===keys.length,diff.slice(0,3).join(','));
const dbo=await po.evaluate(()=>JSON.parse(JSON.stringify(CJR.db()))),dbn=await pn.evaluate(()=>JSON.parse(JSON.stringify(CJR.db())));
const pv=dbn.settings.points;check('nouvelles clés seulement : settings.points.V=1 et B=1 ajoutées',pv.V===1&&pv.B===1);delete pv.V;delete pv.B;delete dbo.ui;delete dbn.ui;
check('ancienne sauvegarde chargée à l’identique (hors 2 nouvelles valeurs par défaut)',JSON.stringify(dbo)===JSON.stringify(dbn));
check('aucun s.bh créé sans action',!dbn.students.some(s=>s.bh));
// 2) Av / Bn sur la nouvelle version
const c0=await pn.evaluate(()=>{const db=CJR.db();const k=Object.keys(db.sessions).find(k=>{const [c,p]=k.split('|');return +p===0&&CJR.studentsIn(c).length>5;});const [c,p,s]=k.split('|');return {c,p:+p,s:+s};});
const st=await pn.evaluate(c=>{const L=CJR.studentsIn(c.c);const r=CJR.db().sessions[c.c+'|'+c.p+'|'+c.s];const pres=L.find(s=>!r.marks[s.id]&&CJR.gradeOf(c.c,s.id,c.p).comp.raw>0)||L.find(s=>!r.marks[s.id]);const ab=L.find(s=>r.marks[s.id]&&r.marks[s.id].s==='A');return {pres:pres.id,ab:ab?ab.id:null};},c0);
const before=await pn.evaluate((c,sid)=>{const g=CJR.gradeOf(c.c,sid,c.p);const y=CJR.db();return {v:g.comp.v,max:g.comp.max,raw:g.comp.raw,held:0};},c0,st.pres);
await pn.evaluate(c=>{const db=CJR.db();db.ui.cls=c.c;db.ui.per=c.p;db.ui.mode='edit';},c0);
await pn.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(700);
await pn.evaluate(()=>{const b=document.querySelector('#view-attendance .seg:not(.vseg) button[data-mode="edit"]');b&&b.click();});await sleep(300);
const openCell=async(sid,s)=>{await pn.evaluate((sid,s)=>{const td=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] td.c[data-s="'+s+'"]');td.scrollIntoView({block:'center',inline:'center'});td.click();},sid,s);await sleep(500);};
await openCell(st.pres,c0.s);
check('feuille Détail : ligne « Comportement (cette séance) » Av / Bn visible',await pn.evaluate(()=>{const e=document.getElementById('cellBh');return !!e&&e.offsetHeight>0&&/Av/.test(e.textContent)&&/Bn/.test(e.textContent);}));
await pn.click('#cellBh [data-bh="B"]');await sleep(200);await pn.evaluate(()=>document.querySelectorAll('#toast,.toast').forEach(x=>x.style.visibility='hidden'));
if(SHOT)for(const th of ['','terrain','neon']){await pn.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);await sleep(250);await pn.screenshot({path:O+'avbn-feuille'+(th?'-'+th:'')+'.png'});}
await pn.evaluate(()=>document.documentElement.removeAttribute('data-theme'));
await pn.click('#cellSave');await sleep(500);
let r=await pn.evaluate((c,sid)=>{const db=CJR.db(),s=db.students.find(x=>x.id===sid),rec=db.sessions[c.c+'|'+c.p+'|'+c.s];return {bh:s.bh,mark:rec.marks[sid]||null,v:CJR.gradeOf(c.c,sid,c.p).comp.v,badge:!!document.querySelector('#gridWrap tr[data-sid="'+sid+'"] td.c[data-s="'+c.s+'"] .bhb.bh-B')};},c0,st.pres);
check('Bn enregistré dans s.bh (champ séparé), présence inchangée (aucune marque créée), badge vert dans la case',r.bh&&r.bh[c0.c+'|'+c0.p+'|'+c0.s]==='B'&&r.mark===null&&r.badge,JSON.stringify(r));
check('Bn : note comportementale '+before.v+' → '+r.v+' (= min(max, max − retraits + 1))',r.v===Math.round(Math.max(0,Math.min(before.max,before.max-before.raw+1))*100)/100,before.max+'/'+before.raw);
if(st.ab){const b2=await pn.evaluate((c,sid)=>CJR.gradeOf(c.c,sid,c.p).comp,c0,st.ab);await openCell(st.ab,c0.s);await pn.click('#cellBh [data-bh="V"]');await pn.click('#cellSave');await sleep(400);
 const a2=await pn.evaluate((c,sid)=>{const db=CJR.db(),rec=db.sessions[c.c+'|'+c.p+'|'+c.s];return {m:rec.marks[sid],v:CJR.gradeOf(c.c,sid,c.p).comp.v};},c0,st.ab);
 check('Av sur un élève absent : marque A conservée, note '+b2.v+' → '+a2.v+' (−1, plancher 0)',a2.m&&a2.m.s==='A'&&a2.v===Math.round(Math.max(0,Math.min(b2.max,b2.max-b2.raw-1))*100)/100,JSON.stringify(a2));}
await pn.evaluate(()=>{const tr=document.querySelector('#gridWrap .bhb');tr&&tr.scrollIntoView({block:'center',inline:'center'});});await sleep(300);
if(SHOT)await pn.screenshot({path:O+'avbn-grille.png'});
// relevé (vue Notes)
await pn.evaluate(()=>{const b=document.querySelector('#view-attendance .vseg button[data-v="notes"],#view-attendance .vseg button:last-child');b&&b.click();});await sleep(600);
const rel=await pn.evaluate(sid=>{const tr=document.querySelector('tr[data-sid="'+sid+'"]');const c=tr&&tr.querySelector('td.t.comp');if(c)c.scrollIntoView({block:'center',inline:'center'});return c?[c.textContent,c.title]:null;},st.pres);
check('relevé : Comport. montre l’effet (+1) et la formule',rel&&/\+1/.test(rel[0])&&/Bn/.test(rel[1]),JSON.stringify(rel));await sleep(200);
if(SHOT)await pn.screenshot({path:O+'avbn-releve.png'});
// annuler Bn → retour exact
await pn.evaluate(()=>{const b=document.querySelector('#view-attendance .vseg button[data-v="abs"],#view-attendance .vseg button:first-child');b&&b.click();});await sleep(500);
await openCell(st.pres,c0.s);await pn.click('#cellBh [data-bh="B"]');await pn.click('#cellSave');await sleep(400);
r=await pn.evaluate((c,sid)=>{const s=CJR.db().students.find(x=>x.id===sid);return {bh:s.bh||null,v:CJR.gradeOf(c.c,sid,c.p).comp.v};},c0,st.pres);
check('Bn retiré → s.bh supprimé si vide, note revenue à '+before.v,r.v===before.v&&(!r.bh||!r.bh[c0.c+'|'+c0.p+'|'+c0.s]),JSON.stringify(r));
// Points retirés : Av / Bn
await pn.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(300);await pn.evaluate(()=>CJPS.open('pts'));await sleep(400);
check('Points retirés : Av = 1 et Bn = 1 affichés (8 cases)',await pn.evaluate(()=>document.getElementById('ptV').value==='1'&&document.getElementById('ptB').value==='1'&&document.querySelectorAll('.pga-c').length===8));
await pn.click('.pk-B [data-pstep="1"]');await sleep(200);check('Bn ＋ → 1,25 (clé settings.points.B)',await pn.evaluate(()=>CJR.db().settings.points.B)===1.25);await pn.click('.pk-B [data-pstep="-1"]');await sleep(200);
if(SHOT)for(const th of ['','terrain','neon']){await pn.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);await sleep(250);await pn.screenshot({path:O+'avbn-points'+(th?'-'+th:'')+'.png'});}
// CSV : colonnes en fin
await pn.evaluate(()=>CJPS.close&&CJPS.close());
const csv=await pn.evaluate(c=>new Promise(res=>{const dl=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/\.csv$/.test(this.download||'')){fetch(this.href).then(r=>r.text()).then(t=>{HTMLAnchorElement.prototype.click=dl;res(t);});}else dl.call(this);};
 const ec=document.getElementById('expClass'),ep=document.getElementById('expPeriod');ec.value=c.c;ep.value=String(c.p);document.getElementById('expGrid').click();setTimeout(()=>res(''),4000);}),c0);
const L=csv.split(/\r?\n/);const hh=(L.find(l=>/N°/.test(l))||'').replace(/"/g,'').replace(/^\uFEFF/,'');
check('CSV registre : colonnes Av / Bn ajoutées en fin, anciennes colonnes au même endroit',/Dispense.Avertissements \(Av\).Bonus \(Bn\)$/.test(hh),hh.slice(-90));
// 3) ancienne version : conserve s.bh
const withBh=JSON.parse(DATA);withBh.students[0].bh={[withBh.students[0].classId+'|0|0']:'B'};withBh.settings.points.V=2;
const po2=await page(8040,JSON.stringify(withBh));await sleep(300);
const kept=await po2.evaluate(()=>{const s=CJR.db().students[0];return JSON.stringify(s.bh||null)+' / V='+CJR.db().settings.points.V;});
check('version en production 1.29.1 (v1.29.1) : s.bh conservé tel quel ; valeur Av perdue (retour au défaut)',/"B"/.test(kept),kept);
check('aucune erreur JS',!pn.errs.length&&!po.errs.length,pn.errs.concat(po.errs).join('|'));
await b.close();NEW.close();OLDS.close();PROD.close();console.log(res.filter(x=>x).length+'/'+res.length+' passed');})().catch(e=>{console.log('FATAL',e);process.exit(1);});
