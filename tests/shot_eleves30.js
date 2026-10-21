/* 1.29.2 (g) : Élèves — 30 premiers puis « Voir tout (N) » / « Réduire » (affichage seul) ; recherche sur tous les élèves ; captures 390 px */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',O='/workspace/backups/v1.29.2-preview/';const SHOT=process.env.SHOT!=='0';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const serve=(D,port)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(port);
const NEW=serve('/workspace/cj-deploy',8041);
const DATA=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const res=[];const check=(n,ok,x)=>{res.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+String(x).slice(0,300):''));};
const ALL=()=>{const A=window.CJR,db=A.db(),out={},cnt={students:db.students.length,classes:db.classes.length,sessions:Object.keys(db.sessions).length,marks:Object.values(db.sessions).reduce((n,r)=>n+Object.keys(r.marks||{}).length,0)};
 db.classes.forEach(c=>{A.studentsIn(c.id).forEach(s=>{for(let p=0;p<db.periods.length;p++){const g=A.gradeOf(c.id,s.id,p);out[c.id+'|'+s.id+'|'+p]=[g.comp.v,g.comp.max,g.comp.ded,g.comp.raw,g.total,g.partial];}});});
 return {cnt,out};};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const page=async(port,data)=>{const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.accept());
 await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';});return p;};

const p=await page(8041,DATA);const db0=await p.evaluate(()=>JSON.stringify(CJR.db()));
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="students"]').click());await sleep(600);
const st=()=>p.evaluate(()=>({n:document.querySelectorAll('#stuList li.stu').length,btn:(document.getElementById('stuMore')||{}).textContent||'',cnt:document.getElementById('stuCount').textContent,ovf:document.documentElement.scrollWidth-innerWidth}));
let a=await st();check('toutes les classes : 30 élèves affichés + « Voir tout (347) », compteur intact',a.n===30&&a.btn==='Voir tout (347)'&&/^347 sur 347/.test(a.cnt)&&a.ovf<=0,JSON.stringify(a));
const shot=async n=>{if(!SHOT)return;await p.evaluate(()=>document.getElementById('stuMore').scrollIntoView({block:'center'}));await sleep(250);await p.screenshot({path:O+n});};
for(const th of ['','terrain','neon']){await p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);await sleep(250);await shot('eleves-30'+(th?'-'+th:'')+'.png');}
await p.evaluate(()=>document.documentElement.removeAttribute('data-theme'));
await p.click('#stuMore');await sleep(500);a=await st();check('Voir tout : 347 élèves + « Réduire »',a.n===347&&a.btn==='Réduire',JSON.stringify(a));
await shot('eleves-30-deplie.png');
await p.click('#stuMore');await sleep(500);a=await st();check('Réduire : retour à 30',a.n===30&&/^Voir tout/.test(a.btn),JSON.stringify(a));
// recherche : l’élève n° 300 (hors des 30 affichés) est trouvé
const far=await p.evaluate(()=>{const ids=[...document.querySelectorAll('#stuList li.stu')].map(l=>l.dataset.id);const s=CJR.db().students.find(s=>!ids.includes(s.id)&&s.sid);return s.sid;});
await p.type('#stuSearch',far);await sleep(500);a=await st();check('recherche sur tous les élèves (élève hors des 30 trouvé, sans bouton)',a.n>=1&&!a.btn,JSON.stringify(a)+' '+far);
await p.evaluate(()=>{const i=document.getElementById('stuSearch');i.value='';i.dispatchEvent(new Event('input'));});await sleep(400);
const cid=await p.evaluate(()=>{const db=CJR.db();const c=db.classes.find(c=>CJR.studentsIn(c.id).length>30)||db.classes.find(c=>CJR.studentsIn(c.id).length<=30);return c.id;});
await p.evaluate(c=>{const f=document.getElementById('stuClassFilter');f.value=c;f.dispatchEvent(new Event('change'));},cid);await sleep(500);
a=await st();const nc=await p.evaluate(c=>CJR.studentsIn(c).length,cid);check('filtre par classe ('+nc+' élèves) : '+(nc>30?'30 + Voir tout':'tous, sans bouton'),nc>30?(a.n===30&&a.btn==='Voir tout ('+nc+')'):(a.n===nc&&!a.btn),JSON.stringify(a));
check('aucune donnée modifiée par l’affichage',await p.evaluate(()=>JSON.stringify(CJR.db()))===db0||await p.evaluate(d=>{const x=JSON.parse(d),y=JSON.parse(JSON.stringify(CJR.db()));delete x.ui;delete y.ui;return JSON.stringify(x)===JSON.stringify(y);},db0));
check('aucune erreur JS',!p.errs.length,p.errs.join(' | '));
await b.close();NEW.close();console.log(res.filter(x=>x).length+'/'+res.length+' passed');process.exit(res.every(x=>x)?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
