const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy',O='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8032);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8032/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes.find(x=>/2BAC/.test(x.name))||d.classes[0];d.periods[0]='Athlétisme – endurance';
 d.students=Array.from({length:38},(_,i)=>({id:'s'+i,classId:c.id,name:'ÉLÈVE '+String(i+1).padStart(2,'0'),sex:i%2?'F':'G',sid:'J'+(1000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
 d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
for(const th of ['terrain','neon','']){const sx=th?'-'+th:'';
 await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);await p.evaluate(()=>window.CJPS&&CJPS.open('annee'));await sleep(500);
 await p.evaluate(()=>{const e=document.getElementById('calSettings');e.scrollIntoView({block:'start'});window.scrollBy(0,-110);});await sleep(300);
 console.log(th||'actuel',await p.evaluate(()=>({cards:document.querySelectorAll('.cy-card').length,on:[...document.querySelectorAll('.cy-card.on')].map(x=>x.dataset.i).join(),h:Math.round(document.getElementById('cycDates').getBoundingClientRect().height)})));
 await p.screenshot({path:O+'annee-B'+sx+'.png'});
 if(!th){await p.click('#calSettings [data-pq-open="cycSheet"]');await sleep(350);await p.screenshot({path:O+'annee-B-info.png'});await p.keyboard.press('Escape');await sleep(200);
  await p.click('.cy-card[data-i="1"] .cy-d');await sleep(400);await p.evaluate(()=>window.scrollBy(0,-60));await sleep(200);await p.screenshot({path:O+'annee-B-edition.png'});
  const before=await p.evaluate(K=>JSON.stringify(JSON.parse(localStorage.getItem(K)).cal.cycles),KEY);
  await p.evaluate(()=>{const c=document.querySelector('.cy-card[data-i="1"] .ct');c.value='2026-11-30';c.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(400);
  const after=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)).cal.cycles[1],KEY);console.log('edit',JSON.stringify(after),before.length);}
}
console.log('errs',errs.length,errs.join('|'));await b.close();srv.close();})();
