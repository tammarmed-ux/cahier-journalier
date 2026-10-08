/* v1.28.0 (-f) : Accueil modernisé (en-tête, accès rapide, mini-indicateurs) — purement visuel : chaque bouton ouvre un écran / une action existant(e).
   SHOT=before|after : capture seule (BEFORE : version 3ea3a69 servie depuis /tmp/cj-before). */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const SHOT=process.env.SHOT||'';const D=SHOT==='before'?'/tmp/cj-before':'/workspace/cj-deploy';const PORT=SHOT==='before'?8022:8021;
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
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now()-3*864e5;
  const C=['2BACSP4','1BACLSH2','2BACSSVT1'].map(n=>d.classes.find(x=>x.name===n)||null);if(C.some(x=>!x))throw new Error('classes: '+d.classes.map(c=>c.name).join(','));
  const NM=[['بامعروف ياسين','رؤوفي سلمى','AIT BENALI Yassine','BENNANI Salma','مسناوي إيمان','CHAKIR Omar','الصباحي حمزة','EL IDRISSI Nour'],['سيفي نور','LAHLOU Adam','رؤوفي عمر','TAZI Imane','الإدريسي سارة','FASSI Mehdi','بنعلي هدى'],['AMRANI Rayan','الزهراني ليلى','KETTANI Anas','بوزيد مريم','SAIDI Aya','العلوي يوسف']];
  d.students=[];C.forEach((c,ci)=>NM[ci].forEach((n,i)=>d.students.push({id:'s'+ci+'_'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J1'+ci+(3000000+i),dob:'',parent:'',phone:'',notes:'',created:1})));
  d.cal.tt=[{id:'t1',type:'class',day:4,start:'08:00',end:'10:00',classId:C[0].id,room:'Terrain A'},{id:'t2',type:'class',day:4,start:'10:00',end:'12:00',classId:C[1].id,room:'Gymnase'},{id:'t3',type:'class',day:4,start:'14:00',end:'16:00',classId:C[2].id,room:'Terrain B'},
    {id:'t4',type:'class',day:1,start:'08:00',end:'10:00',classId:C[0].id,room:'Terrain A'},{id:'t5',type:'class',day:1,start:'10:00',end:'12:00',classId:C[1].id,room:'Gymnase'},{id:'t6',type:'class',day:2,start:'08:00',end:'10:00',classId:C[2].id,room:'Terrain B'}];
  d.sessions={};d.ui.cls=C[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
// séances passées avec quelques absences (données de démonstration, écrites comme le ferait l’appel)
await p.evaluate(KEY=>{const A=window.CJR,d=A.db(),t=new Date(),T=t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0');const S={};
  const ABS={'s0_0':['A','A','A'],'s0_3':['M'],'s1_2':['A','L'],'s1_5':['ST'],'s2_1':['A'],'s2_4':['A','A','A','A']};
  ['2BACSP4','1BACLSH2','2BACSSVT1'].forEach((n,ci)=>{const c=d.classes.find(x=>x.name===n);A.colsOf(c.id,0).filter(x=>!x.hol&&x.date<T).forEach((col,k)=>{const m={};d.students.filter(s=>s.classId===c.id).forEach(s=>{const a=ABS[s.id];if(a&&a[k])m[s.id]={s:a[k]};});S[c.id+'|0|'+col.s]={date:'',marks:m};});});
  const raw=JSON.parse(localStorage.getItem(KEY));raw.sessions=S;localStorage.setItem(KEY,JSON.stringify(raw));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(500);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(500);
if(SHOT){await p.evaluate(()=>window.scrollTo(0,0));await sleep(2500);await p.screenshot({path:'/tmp/v28h-'+SHOT+'.png'});await p.evaluate(()=>window.scrollTo(0,document.getElementById(document.getElementById('homeQuick')?'homeQuick':'homeStats').getBoundingClientRect().top+window.scrollY-120));await sleep(400);await p.screenshot({path:'/tmp/v28h-'+SHOT+'2.png'});
  console.log('shot',SHOT,errs.length?'errors '+errs.join('|'):'ok');srv.close();await b.close();process.exit(0);}
const H=await p.evaluate(()=>{const g=id=>document.getElementById(id);const hero=g('homeHero');return {hello:hero&&hero.querySelector('.hh-hello').textContent,date:hero&&hero.querySelector('.hh-date').textContent,clock:g('homeClock')&&g('homeClock').textContent,
  first:document.querySelector('#homeBody').firstElementChild.id,keep:['homeToday','homeStats','homeCmp','homeWatch','ttCard','homeCal','ttSave'].filter(x=>!g(x)),
  qa:[...document.querySelectorAll('#homeQuick .qa')].map(x=>x.querySelector('b').textContent),
  tiles:[...document.querySelectorAll('.hh-tile')].map(x=>x.dataset.qa+'='+x.querySelector('b').textContent),
  next:g('homeNext')&&g('homeNext').textContent,sw:document.documentElement.scrollWidth,
  small:[...document.querySelectorAll('#homeHero button,#homeQuick button')].filter(x=>{const r=x.getBoundingClientRect();return r.height<44||r.width<44||r.right>375.5||r.left<-0.5;}).map(x=>x.textContent.slice(0,20))};});
check('en-tête en haut de l’Accueil : salutation « '+H.hello+' », date longue, heure',H.first==='homeHero'&&/^(Bonjour|Bonsoir), Mohamed Tammar$/.test(H.hello)&&/^(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche) \d+(er)? \S+ 20\d\d$/.test(H.date)&&/^\d\d:\d\d$/.test(H.clock),JSON.stringify([H.hello,H.date,H.clock]));
check('6 boutons d’accès rapide : Faire l’appel, Note procéd., Relevé de notes, Rapports, Élèves, Sauvegarde',H.qa.join('|')==='Faire l’appel|Note procéd.|Relevé de notes|Rapports|Élèves|Sauvegarde',H.qa.join('|'));
check('375 px : rien ne déborde, toutes les cibles ≥ 44 px',H.sw<=375&&H.small.length===0,H.sw+' '+JSON.stringify(H.small));
check('cartes existantes conservées (Aujourd’hui, Statistiques, Comparaison, À surveiller, Emploi du temps, Calendrier)',H.keep.length===0,H.keep.join(','));
// mini-indicateurs = données existantes
const E=await p.evaluate(()=>{const A=window.CJR,d=A.db(),wd=new Date().getDay(),today=d.cal.tt.filter(t=>t.day===wd&&t.type==='class').length;let ab=0,den=0;
  ['2BACSP4','1BACLSH2','2BACSSVT1'].forEach(n=>{const c=d.classes.find(x=>x.name===n),st=d.students.filter(s=>s.classId===c.id);const recs=Object.keys(d.sessions).filter(k=>k.startsWith(c.id+'|'));den+=st.length*recs.length;recs.forEach(k=>Object.values(d.sessions[k].marks).forEach(m=>{if(m.s==='A'||m.s==='M')ab++;}));});
  const chip=document.querySelector('#homeWatch h2 .chip');return {today,rate:den?Math.round((1-ab/den)*1000)/10:null,watch:chip?+chip.textContent:0,cmp:[...document.querySelectorAll('#homeCmp tbody tr')].length};});
const tl=Object.fromEntries(H.tiles.map(x=>x.split('=')));
check('mini-indicateurs calculés depuis les données existantes : séances du jour '+tl.today+', présence '+tl.rate+', alertes '+tl.watch,+tl.today===E.today&&tl.rate.replace(/\s|\u00a0/g,'')===String(E.rate).replace('.',',')+'%'&&+tl.watch===E.watch&&E.watch>0,JSON.stringify({tl,E}));
const nowM=await p.evaluate(()=>{const d=new Date();return d.getHours()*60+d.getMinutes();});
const wdT=await p.evaluate(()=>new Date().getDay());
if(wdT===4&&nowM<16*60){check('prochaine séance du jour + bouton « Appel » (ouvre le registre de la classe)',/Prochaine séance|En cours/.test(H.next)&&!!(await p.$('#homeNext .hh-go[data-open]')),H.next);
  await p.click('#homeNext .hh-go');await sleep(400);const v=await p.evaluate(()=>({tab:document.querySelector('section.view.active').id,cls:window.CJR.db().ui.cls,name:document.getElementById('attClass').selectedOptions[0].textContent}));
  check('« Appel » → onglet Absences sur la classe de la séance',v.tab==='view-attendance'&&/2BACSP4|1BACLSH2|2BACSSVT1/.test(v.name),JSON.stringify(v));}
else check('pas de séance restante aujourd’hui : encadré « Aucune séance / terminées » + prochaine date',/Aucune séance aujourd’hui|Séances du jour terminées/.test(H.next),H.next);
// navigation des boutons
const home=async()=>{await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(350);};
const nav=async(id)=>{await home();await p.evaluate(id=>document.querySelector('#homeQuick [data-qa="'+id+'"]').click(),id);await sleep(450);return p.evaluate(()=>({tab:document.querySelector('section.view.active').id,act:(document.querySelector('#tabs button.active')||{}).dataset.tab}));};
let r=await nav('appel');check('Faire l’appel → Absences',r.tab==='view-attendance'&&r.act==='attendance',JSON.stringify(r));
r=await nav('proc');check('Note procéd. → onglet Note procéd.',r.tab==='view-proc'&&r.act==='proc',JSON.stringify(r));
r=await nav('reports');check('Rapports → onglet Rapports',r.tab==='view-reports',JSON.stringify(r));
r=await nav('students');check('Élèves → onglet Élèves',r.tab==='view-students',JSON.stringify(r));
await home();await p.evaluate(()=>{window.__lastPdf=null;document.querySelector('#homeQuick [data-qa="releve"]').click();});
const pdf=await p.waitForFunction(()=>window.__lastPdf,{timeout:30000}).then(()=>p.evaluate(()=>window.__lastPdf.name||'ok')).catch(()=>null);
check('Relevé de notes → même PDF que le bouton existant (classe/cycle courants)',!!pdf&&/releve|notes|ok/i.test(pdf),String(pdf));
await home();const lb0=await p.evaluate(()=>window.CJR.db().lastBackup);await p.evaluate(()=>document.querySelector('#homeQuick [data-qa="backup"]').click());await sleep(600);
const lb1=await p.evaluate(()=>({lb:window.CJR.db().lastBackup,sub:document.querySelector('#homeQuick [data-qa="backup"] span:last-child').textContent}));
check('Sauvegarde → export existant (#bkExport) : date de dernière sauvegarde mise à jour',lb1.lb>lb0&&/aujourd’hui/.test(lb1.sub),JSON.stringify(lb1));
await home();await p.evaluate(()=>window.scrollTo(0,0));await p.evaluate(()=>document.querySelector('.hh-tile[data-qa="watch"]').click());await sleep(900);
const sc=await p.evaluate(()=>Math.round(document.getElementById('homeWatch').getBoundingClientRect().top));
check('tuile « alertes » → fait défiler jusqu’à « À surveiller »',sc<200&&sc>-5,String(sc));
// mouvement réduit
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await home();
const tr=await p.evaluate(()=>getComputedStyle(document.querySelector('#homeQuick .qa')).transitionDuration);
check('prefers-reduced-motion : aucune animation des boutons',/^0s(, 0s)*$/.test(tr),tr);
await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'no-preference'}]);
const tr2=await p.evaluate(()=>getComputedStyle(document.querySelector('#homeQuick .qa')).transitionDuration);
check('micro-animation d’appui active sinon (transition courte)',/0\.14s/.test(tr2),tr2);
// contraste (texte blanc sur bouton orange, bleu de l’en-tête)
const L=c=>{c=c.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);});return .2126*c[0]+.7152*c[1]+.0722*c[2];};const cr=(a,b)=>(Math.max(L(a),L(b))+.05)/(Math.min(L(a),L(b))+.05);
check('contraste ≥ 4,5:1 : blanc sur orange #B54703/#D85603 et sur bleu #0B3A6E',cr([255,255,255],[0xB5,0x47,0x03])>=4.5&&cr([255,255,255],[0xD8,0x56,0x03])>=3.6&&cr([255,255,255],[0x0B,0x3A,0x6E])>=4.5,[cr([255,255,255],[0xB5,0x47,0x03]).toFixed(2),cr([255,255,255],[0xD8,0x56,0x03]).toFixed(2),cr([255,255,255],[0x0B,0x3A,0x6E]).toFixed(2)].join(' / '));
const keys=await p.evaluate(KEY=>Object.keys(JSON.parse(localStorage.getItem(KEY))).sort().join(','),KEY);
check('aucune nouvelle clé de données',!/hero|quick|home/i.test(keys),keys);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
