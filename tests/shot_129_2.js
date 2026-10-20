/* 1.29.2 : captures — textes d’aide retirés, Trombinoscope jaune, alertes repliables */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy',O='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8029);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8029/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes[0];
 const N=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','DAOUDI Imane','EL AMRANI Hamza','FASSI Nour','GHALI Anas','HAJJI Khadija','IDRISSI Sara','JABRI Ali'];
 d.students=N.map((n,i)=>({id:'s'+i,classId:(i<6?c.id:d.classes[1].id),name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
 d.sessions={};[c.id,d.classes[1].id].forEach(cid=>{for(let q=0;q<2;q++)for(let n=0;n<6;n++){const m={};d.students.filter(s=>s.classId===cid).forEach((s,i)=>{if(i<4&&(n+i)%2===0||i<5&&n<3)m[s.id]={s:'A',j:false,r:''};});d.sessions[cid+'|'+q+'|'+n]={date:'',marks:m};}});
 localStorage.setItem(KEY,JSON.stringify(d));},KEY);
const tab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(500);};
const vis=async(sel,f)=>{await p.evaluate(s=>{const e=document.querySelector(s);e&&e.scrollIntoView({block:'start'});window.scrollBy(0,s==='#setDayMin'?-260:-120);},sel);await sleep(300);await p.screenshot({path:O+f});};
for(const th of ['','terrain','neon']){const sx=th?'-'+th:'';
 await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);
 if(!th){await tab('home');await vis('#homeStats','stats-sans-evolution.png');await vis('#homeCmp','taux-sans-note.png');
   await tab('settings');await p.evaluate(()=>window.CJPS&&CJPS.open('annee'));await sleep(500);await vis('#setDayMin','heures-par-jour-sans-aide.png');}
 await tab('students');await vis('#trombiBtn','trombi-jaune'+sx+'.png');
 await tab('reports');await p.evaluate(()=>localStorage.setItem('cj.ui.alertsOpen','0'));await p.evaluate(()=>{document.getElementById('alertTog').click();document.getElementById('alertTog').click();});await sleep(300);
 await vis('#repAlerts','alertes-ferme'+sx+'.png');await p.click('#alertTog');await sleep(400);await vis('#repAlerts','alertes-ouvert'+sx+'.png');
 if(!th){console.log('alerts',await p.evaluate(()=>({n:document.getElementById('alertN').textContent,vis:[...document.querySelectorAll('#alertList li')].filter(l=>!l.hidden).length,more:document.getElementById('alertMore').textContent})));
  await p.click('#alertMore');await sleep(300);await vis('#repAlerts','alertes-tout.png');console.log('all',await p.evaluate(()=>[...document.querySelectorAll('#alertList li')].filter(l=>!l.hidden).length));}
}
console.log('texts',await p.evaluate(()=>/Taux d’absence = |Évolution\u00a0:|Heures de classe par jour/.test(document.body.innerText)));
console.log('errs',errs.length,errs.join('|'));await b.close();srv.close();})();
