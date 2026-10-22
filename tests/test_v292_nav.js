/* 1.29.2 (p) : barre d’onglets et bouton + sans position:fixed sur mobile (bug iOS 26 : éléments fixes décalés pendant le défilement). Port 8055. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8055,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const REN={'1BACSH1':'1AC1','1BACLSH2':'1AC2','1BACLSH4':'2AC1','2BACSP4':'2AC2','2BACSP5':'2AC3','2BACSP6':'3AC1','2BACSVT2':'3AC2','2BACSVT1':'Groupe A','1BACSH3':'1AC3'};
const COL=(()=>{const d=JSON.parse(LYC);d.classes.forEach(c=>c.name=REN[c.name]||c.name);d.settings.school='college';return JSON.stringify(d);})();
const LYU=(()=>{const d=JSON.parse(LYC);d.classes.find(c=>c.name==='2BACSVT1').name='Groupe A';return JSON.stringify(d);})();
let b;
async function page(data,block){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>{p.dlg=(p.dlg||[]).concat(d.message());d.accept();});
  if(block)await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&/college\.js/.test(u))return q.abort();(u.startsWith('http://localhost:'+PORT)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});
  if(!block)await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});await sleep(900);p.ctx=ctx;return p;}

/* vrai clic, après avoir amené l’élément au centre de l’écran (l’en-tête collant recouvre le haut) */
const tap=async(p,sel)=>{await p.evaluate(s=>{const e=document.querySelector(s);if(e&&getComputedStyle(e).position!=='fixed')e.scrollIntoView({block:'center'});},sel);await new Promise(r=>setTimeout(r,80));await p.click(sel);};
const J=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
const settle=p=>p.evaluate(()=>new Promise(r=>setTimeout(r,250)));
async function openAnnee(p){await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open('annee');});await settle(p);}
const nb=p=>p.evaluate(()=>{const n=document.getElementById('tabs').getBoundingClientRect(),f=document.getElementById('addStudentBtn'),fr=f.getBoundingClientRect(),cs=getComputedStyle(f);return {pos:getComputedStyle(document.getElementById('navPin')||document.getElementById('tabs')).position,nb:document.querySelectorAll('#tabs button').length,fw:Math.round(fr.width),nTop:Math.round(n.top),nBot:Math.round(n.bottom),vh:innerHeight,fPar:f.parentNode.id||f.parentNode.tagName,fVis:cs.display!=='none'&&fr.height>0,fBot:Math.round(fr.bottom),fRight:Math.round(innerWidth-fr.right),sy:Math.round(scrollY)};});
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const p=await page(LYC,false);
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="students"]').click());await settle(p);
 const out=[];for(const y of [0,800,2500,99999,300]){await p.evaluate(y=>window.scrollTo(0,y),y);await sleep(120);out.push(await nb(p));}
 check('Élèves : barre position:sticky, collée au bas de l’écran à chaque position de défilement (aucun position:fixed)',out.every(o=>o.pos==='sticky'&&o.nBot===o.vh&&o.nb===6),out);
 check('bouton + épinglé avec la barre (#navPin), 58 px, visible, au-dessus d’elle, à droite (18 px) ; #tabs garde ses 6 onglets',out.every(o=>o.fPar==='navPin'&&o.fVis&&o.fw===58&&o.fBot<=o.nTop-12&&o.fRight===18&&o.nb===6),out[0]);
 await p.setViewport({width:390,height:700,isMobile:true,hasTouch:true});await sleep(200);const o2=await nb(p);
 check('hauteur d’écran qui change (barre d’adresse iOS) : barre toujours en bas',o2.nBot===o2.vh&&o2.fBot<=o2.nTop-12,o2);
 await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});await sleep(200);
 await p.evaluate(()=>window.scrollTo(0,0));await p.click('#addStudentBtn');await sleep(300);
 check('bouton + : ouvre toujours le même choix « Ajouter » (même gestionnaire)',await p.evaluate(()=>[...document.querySelectorAll('.modal.open')].some(m=>m.id==='addChoice'||m.id==='stuModal')));
 await p.keyboard.press('Escape');await p.evaluate(()=>{document.querySelectorAll('.modal').forEach(m=>m.classList.remove('open','show'));});await sleep(200);
 for(const t of ['home','settings','attendance']){await p.evaluate(t=>{document.querySelector('#tabs button[data-tab="'+t+'"]').click();window.scrollTo(0,0);},t);await settle(p);const o=await nb(p);
   check('onglet '+t+' : barre en bas de l’écran, bouton + masqué',o.nBot===o.vh&&!o.fVis,o);}
 await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open('theme');window.scrollTo(0,0);});await settle(p);const o3=await nb(p);
 check('page courte (Thème et police) : barre en bas de l’écran, pas au milieu',o3.nBot===o3.vh,o3);
 await p.setViewport({width:1100,height:900});await sleep(300);
 const dk=await p.evaluate(()=>({par:document.getElementById('addStudentBtn').parentNode.id,pos:getComputedStyle(document.getElementById('addStudentBtn')).position,nav:getComputedStyle(document.getElementById('tabs')).position,pin:!!document.getElementById('navPin'),np:document.getElementById('tabs').parentNode.tagName}));
 check('ordinateur (≥ 900 px) : bouton + remis dans Élèves (position:fixed d’origine), barre comme avant',dk.par==='view-students'&&dk.pos==='fixed'&&dk.nav==='sticky'&&!dk.pin&&dk.np==='BODY',dk);
 check('aucune erreur JS',p.errs.length===0,p.errs);
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})().catch(e=>{console.error(e);process.exit(1);});
