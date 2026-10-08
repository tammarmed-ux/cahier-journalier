/* v1.28.0 (-k) : « Statistiques globales » modernisées — tuile « Justifiées (AJ) » retirée, mini-graphique semaine précédente → semaine en cours
   (calculs vérifiés indépendamment à partir des séances enregistrées), couleur selon le sens, accessibilité. SHOT=before|after : captures seules. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const SHOT=process.env.SHOT||'';const D=SHOT==='before'?'/tmp/cj-before4':'/workspace/cj-deploy';const PORT=SHOT==='before'?8032:8031;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now();
  const C=['2BACSP4','1BACLSH2','2BACSSVT1'].map(n=>d.classes.find(x=>x.name===n));
  const NM=[['بامعروف ياسين','رؤوفي سلمى','AIT BENALI Yassine','BENNANI Salma','مسناوي إيمان','CHAKIR Omar','الصباحي حمزة','EL IDRISSI Nour'],['سيفي نور','LAHLOU Adam','رؤوفي عمر','TAZI Imane','الإدريسي سارة','FASSI Mehdi','بنعلي هدى'],['AMRANI Rayan','الزهراني ليلى','KETTANI Anas','بوزيد مريم','SAIDI Aya','العلوي يوسف']];
  d.students=[];C.forEach((c,ci)=>NM[ci].forEach((n,i)=>d.students.push({id:'s'+ci+'_'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J1'+ci+(3000000+i),dob:'',parent:'',phone:'',notes:'',created:1})));
  d.cal.tt=[{id:'t1',type:'class',day:1,start:'08:00',end:'10:00',classId:C[0].id,room:'Terrain A'},{id:'t2',type:'class',day:1,start:'10:00',end:'12:00',classId:C[1].id,room:'Gymnase'},{id:'t3',type:'class',day:2,start:'08:00',end:'10:00',classId:C[2].id,room:'Terrain B'},
    {id:'t4',type:'class',day:4,start:'08:00',end:'10:00',classId:C[0].id,room:'Terrain A'},{id:'t5',type:'class',day:3,start:'10:00',end:'12:00',classId:C[1].id,room:'Gymnase'},{id:'t6',type:'class',day:4,start:'14:00',end:'16:00',classId:C[2].id,room:'Terrain B'}];
  d.sessions={};d.ui.cls=C[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
// séances : toutes les séances passées enregistrées ; plus d’absences la semaine dernière, plus de retards cette semaine, ST identiques
const W=await p.evaluate(KEY=>{const A=window.CJR,d=A.db(),t=new Date(),iso=x=>x.getFullYear()+'-'+String(x.getMonth()+1).padStart(2,'0')+'-'+String(x.getDate()).padStart(2,'0');
  const T=iso(t),wd=(t.getDay()+6)%7+1,add=(s,n)=>{const q=new Date(s+'T12:00:00');q.setDate(q.getDate()+n);return iso(q);},from=add(T,1-wd),pfrom=add(from,-7),pto=add(T,-7);
  const raw=JSON.parse(localStorage.getItem(KEY)),S={};let nL=0,nC=0;
  d.classes.forEach(c=>{const st=d.students.filter(s=>s.classId===c.id);if(!st.length)return;for(let p=0;p<d.periods.length;p++)A.colsOf(c.id,p).filter(x=>!x.hol&&x.date&&x.date<=T).forEach(col=>{const m={};
    const last=col.date>=pfrom&&col.date<=pto,cur=col.date>=from&&col.date<=T;
    if(last&&c.name==='2BACSSVT1'&&!S.__skip){S.__skip=1;return;}   /* une séance de la semaine dernière non saisie → séances 5 → 6 (bleu, neutre) */
    if(last){nL++;m[st[0].id]={s:'A'};m[st[1].id]={s:'A'};m[st[2].id]={s:'ST'};m[st[3].id]={s:'M'};m[st[4].id]={s:'A',j:true};if(c.name==='2BACSP4'&&!S.__st){S.__st=1;m[st[6].id]={s:'ST'};}}
    else if(cur){nC++;m[st[0].id]={s:'A'};m[st[1].id]={s:'L'};m[st[2].id]={s:'ST'};m[st[3].id]={s:'L'};m[st[5].id]={s:'M',j:true};}
    else{m[st[(col.s)%st.length].id]={s:'A'};}
    S[c.id+'|'+p+'|'+col.s]={date:'',marks:m};});});
  delete S.__skip;delete S.__st;raw.sessions=S;localStorage.setItem(KEY,JSON.stringify(raw));return {T,from,pfrom,pto,nL,nC};},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(500);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(500);
const toStats=async()=>{await p.evaluate(()=>{const c=document.getElementById('homeStats');window.scrollTo(0,c.getBoundingClientRect().top+window.scrollY-100);});await sleep(900);};
if(SHOT){await p.addStyleTag({content:'header.top,#tabs,.fab,#toast{display:none!important}'});await toStats();await sleep(1200);await (await p.$('#homeStats')).screenshot({path:'/tmp/v28k-'+SHOT+'.png'});
  console.log('shot',SHOT,JSON.stringify(W),errs.length?'errors '+errs.join('|'):'ok');srv.close();await b.close();process.exit(0);}
console.log('INFO',JSON.stringify(W));
// calcul indépendant à partir des données
const exp=await p.evaluate(W=>{const A=window.CJR,d=A.db();const z=()=>({A:0,J:0,U:0,L:0,M:0,K:0,S:0,held:0});const pr=z(),cu=z();
  Object.keys(d.sessions).forEach(k=>{const [cid,p,s]=k.split('|'),r=d.sessions[k],col=A.colsOf(cid,+p).find(c=>c.s===+s&&!c.hol),dt=r.date||(col&&col.date)||'';
    const o=dt>=W.pfrom&&dt<=W.pto?pr:dt>=W.from&&dt<=W.T?cu:null;if(!o)return;o.held++;
    d.students.filter(x=>x.classId===cid).forEach(x=>{const m=r.marks[x.id];if(!m)return;if(m.s==='L')o.L++;else if(m.s==='M'){m.j?o.K++:o.M++;}else if(m.s==='ST')o.S++;else{o.A++;m.j?o.J++:o.U++;}});});
  return {pr,cu};},W);
const T=await p.evaluate(()=>[...document.querySelectorAll('#homeStats .hs')].map(x=>{const e=x.querySelector('.hs-ev');return {k:x.dataset.k||'',l:x.querySelector('.hs-l').textContent,v:x.querySelector('.hs-v').textContent,dir:e&&e.dataset.dir,pv:e&&e.dataset.prev,cu:e&&e.dataset.cur,cl:e&&[...e.classList].filter(c=>c!=='hs-ev').join(),b:e&&(e.querySelector('.hs-b')||{}).textContent,sr:e&&(e.querySelector('.sr')||{}).textContent};}));
const by=Object.fromEntries(T.filter(x=>x.k).map(x=>[x.k,x]));
check('9 tuiles : Élèves, Classes, Séances, Absences (A + AJ), Non justifiées, ST, M, R, MJ — plus de « Justifiées (AJ) »',T.map(x=>x.l).join('|')==='Élèves|Classes|Séances effectuées|Absences (A\u00a0+\u00a0AJ)|Non justifiées (A)|Sans tenue (ST)|Maladie (M)|Retards (R)|Maladie just. (MJ)'&&!T.some(x=>/^Justifiées/.test(x.l)),T.map(x=>x.l).join('|'));
const tot=await p.evaluate(()=>{const A=window.CJR,d=A.db(),t={A:0,U:0,L:0,M:0,K:0,S:0};d.students.forEach(s=>{const y=A.yearStat(s.classId,s.id);Object.keys(t).forEach(k=>t[k]+=y[k]);});return t;});
check('valeurs totales inchangées (mêmes calculs qu’avant)',['A','U','L','M','K','S'].every(k=>+by[k].v===tot[k]),JSON.stringify(tot));
const keys=['held','A','U','S','M','L','K'];
check('semaine précédente / en cours = calcul indépendant à partir des séances (held, A, A non just., ST, M, R, MJ)',keys.every(k=>+by[k].pv===exp.pr[k]&&+by[k].cu===exp.cu[k])&&exp.pr.held===W.nL&&exp.cu.held===W.nC,keys.map(k=>k+':'+by[k].pv+'→'+by[k].cu+' (attendu '+exp.pr[k]+'→'+exp.cu[k]+')').join(' '));
const dirOf=(a,b)=>b>a?'up':b<a?'down':'flat';
check('couleur selon le sens : baisse d’absences = vert (good), hausse = rouge (bad), stable = gris (flat)',['A','U','S','M','L','K'].every(k=>{const x=by[k],d=dirOf(+x.pv,+x.cu);return x.dir===d&&x.cl===(d==='flat'?'flat':d==='down'?'good':'bad');}),['A','U','S','M','L','K'].map(k=>k+':'+by[k].dir+'/'+by[k].cl).join(' '));
check('données de démo : A en baisse (vert), R en hausse (rouge), ST stable (gris)',by.A.cl==='good'&&by.L.cl==='bad'&&by.S.cl==='flat',[by.A.b,by.L.b,by.S.b].join(' | '));
check('Séances effectuées : couleur neutre (bleu) ou gris si stable — ni bon ni mauvais (démo : 5 → 6 = bleu ▲ +1)',by.held.cl===(by.held.dir==='flat'?'flat':'neu')&&by.held.cl==='neu'&&by.held.b==='▲ +1',by.held.dir+'/'+by.held.cl);
check('accessible sans la couleur : flèche ▲/▼ + nombre, texte lu « semaine dernière N, cette semaine M, en baisse de … (bon signe) »',/^▼ −\d+$/.test(by.A.b)&&/^▲ \+\d+$/.test(by.L.b)&&by.S.b==='= stable'&&/semaine dernière \d+, cette semaine \d+, en baisse de \d+ \(bon signe\)/.test(by.A.sr)&&/en hausse de \d+ \(à surveiller\)/.test(by.L.sr),by.A.sr);
const cap=await p.evaluate(()=>document.getElementById('hsCap').textContent);
check('légende : « semaine en cours (lun. → aujourd’hui) comparée à la même période de la semaine dernière » (ou semaine complète le dimanche)',/semaine en cours \(lun\. \d\d\/\d\d → \S+\. \d\d\/\d\d\) comparée à la même période de la semaine dernière \(lun\./.test(cap)||/semaine du lun\..*comparée à la semaine précédente/.test(cap),cap);
const L=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,ov:[...document.querySelectorAll('#homeStats .hs, #homeStats .hs-b')].filter(e=>{const r=e.getBoundingClientRect();return r.right>375.5||r.left<-0.5;}).length,clip:[...document.querySelectorAll('#homeStats .hs-b, #homeStats .hs-vs')].filter(e=>e.scrollWidth>e.clientWidth+1).length}));
check('375 px : rien ne déborde',L.sw<=375&&L.ov===0&&L.clip===0,JSON.stringify(L));
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await sleep(100);
const an=await p.evaluate(()=>getComputedStyle(document.querySelector('#homeStats .hs-bars rect')).animationName);check('mouvement réduit : pas d’animation des barres',an==='none',an);
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
// pas de comparaison si l’une des deux périodes est vide
await p.evaluate((KEY,W)=>{const A=window.CJR,raw=JSON.parse(localStorage.getItem(KEY));Object.keys(raw.sessions).forEach(k=>{const [cid,p,s]=k.split('|'),col=A.colsOf(cid,+p).find(c=>c.s===+s&&!c.hol);if(col&&col.date>=W.from)delete raw.sessions[k];});localStorage.setItem(KEY,JSON.stringify(raw));},KEY,W);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);
const N=await p.evaluate(()=>({ev:[...document.querySelectorAll('#homeStats .hs-ev')].map(e=>e.dataset.dir+':'+e.textContent),cap:document.getElementById('hsCap').textContent}));
check('aucune séance cette semaine → « — pas de comparaison » partout (pas de chiffre trompeur)',N.ev.length===7&&N.ev.every(x=>x==='none:— pas de comparaison')&&/Pas de comparaison/.test(N.cap),JSON.stringify(N.ev.slice(0,2)));
const k2=await p.evaluate(KEY=>Object.keys(JSON.parse(localStorage.getItem(KEY))).sort().join(','),KEY);check('aucune nouvelle clé de données',k2==='app,cal,classes,lastBackup,periods,sessions,settings,spp,students,ui,version',k2);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
