/* 1.29.1 (-x) : captures carte « Note procédurale » compacte (A) */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy',O='/workspace/backups/v1.29.1-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8028);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8028/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes.find(x=>x.name==='2BACSP4')||d.classes[0];d.periods[0]='Athlétisme – endurance';d.periods[1]='Handball';
 const N=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','DAOUDI Imane','EL AMRANI Hamza','FASSI Nour'];d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
 d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
for(const th of ['','terrain','neon']){
 await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="proc"]').click());await sleep(500);
 await p.evaluate(()=>{const c=document.querySelector('#procPeriods [data-p="0"]');c&&c.click();});await sleep(300);
 if(await p.$('#procNtr')){await p.select('#procNtr','2');await sleep(300);}
 const sfx=th?'-'+th:'';const top=await p.evaluate(()=>{const e=document.getElementById('procEval');e.scrollIntoView({block:'center'});return e.getBoundingClientRect().height;});await sleep(200);
 await p.screenshot({path:O+'proc-A'+sfx+'.png'});console.log('h',th||'actuel',top);
 await p.click('#procInfo');await sleep(300);await p.screenshot({path:O+'proc-A-info'+sfx+'.png'});await p.keyboard.press('Escape');await sleep(200);
 await p.evaluate(()=>{const c=document.querySelector('#procPeriods [data-p="1"]');c&&c.click();});await sleep(400);
 await p.evaluate(()=>document.getElementById('procEval').scrollIntoView({block:'center'}));await sleep(200);await p.screenshot({path:O+'proc-A-sc'+sfx+'.png'});
 console.log('sc',await p.evaluate(()=>document.querySelector('#procEval .pq-badge').textContent));
}
console.log('errs',errs.length,errs.join('|'));await b.close();srv.close();})();
