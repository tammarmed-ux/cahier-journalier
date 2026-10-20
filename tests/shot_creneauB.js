/* 1.29.1 (-q) : « Élèves à surveiller » repliable (fermé par défaut, cj.ui.watchOpen) ; seuil d’absences non justifiées compté PAR CYCLE */
const puppeteer=require('/workspace/cj-emu/node_modules/puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8018);
const URL='http://localhost:8018/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.evaluateOnNewDocument((TH)=>{const T0=new Date(2026,9,20,10,50).getTime(),OD=Date,off=T0-OD.now();class FD extends OD{constructor(...a){if(!a.length)super(OD.now()+off);else super(...a);}static now(){return OD.now()+off;}}window.Date=FD;try{if(TH)localStorage.setItem('cj.theme',TH);else localStorage.removeItem('cj.theme');}catch(e){}},process.env.THEME||'');
await p.goto(URL,{waitUntil:'networkidle2'});
const DD=JSON.parse(fs.readFileSync('/workspace/creneau-proposals/data.json','utf8'));
await p.goto(URL,{waitUntil:'networkidle2'});
await p.evaluate((KEY,DD)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.classes=DD.classes.map((n,i)=>({id:'c'+i,name:n}));d.students=d.classes.map((c,i)=>({id:'s'+i,classId:c.id,name:'Élève '+i,sex:'G',sid:'J1'+i,dob:'',parent:'',phone:'',notes:'',created:1}));
  d.cal=d.cal||{};d.cal.tt=DD.tt.map((x,i)=>x[3]==='AS'?{id:'tAS',type:'as',day:x[0],start:x[1],end:x[2],classId:'',room:''}:{id:'t'+i,type:'class',day:x[0],start:x[1],end:x[2],classId:'c'+DD.classes.indexOf(x[3]),room:x[4]});
  d.ui.cls='c0';localStorage.setItem(KEY,JSON.stringify(d));},KEY,DD);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);
await p.evaluate(()=>{const c=document.querySelector('#ttCard .tw-chips');window.scrollTo(0,c.getBoundingClientRect().top+scrollY-120);});await sleep(300);
await p.screenshot({path:process.env.OUT});


console.log('errs',errs.length,errs.join('|').slice(0,200));srv.close();await b.close();})().catch(e=>{console.log('FATAL',e);process.exit(1);});
