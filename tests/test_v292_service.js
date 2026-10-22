/* 1.29.2 (r) : Accueil › Emploi du temps (tableau de service) — ligne par jour (« Lun. 4 h · … ») et phrase d’aide retirées (affichage seulement).
   Compare au code de backup-pre-1.29.2r (extrait dans /tmp/base-2r) : mêmes totaux, même barre, même répartition Classes/ASS, mêmes créneaux, données identiques. Ports 8060/8062. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2r',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2r | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8060),S2=serve(B,8062);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');let b;
async function page(port,theme){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));
  await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument((o,t)=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);if(t)localStorage.setItem('cahier.theme',t);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC,theme||'');
  await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(t=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;if(t)document.documentElement.setAttribute('data-theme',t);},theme||'');
  await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});await sleep(900);
  await p.evaluate(()=>document.querySelector('#tabs button[data-tab="home"]').click());await sleep(400);return p;}
const read=p=>p.evaluate(()=>{const c=document.getElementById('ttCard'),x=id=>{const e=document.getElementById(id);return e?e.textContent.replace(/\s+/g,' ').trim():null;};
  return {card:!!c,h2:c&&c.querySelector('h2').textContent,main:x('svcBox')&&document.querySelector('#svcBox .svc-main').textContent.replace(/\s+/g,' ').trim(),tot:x('svcTot'),brk:x('svcBreak'),
   bar:(document.querySelector('#svcBox .svc-bar i')||{style:{}}).style.width,cls:document.getElementById('svcBox').className,days:x('svcDays'),
   help:/sont déduites de vos créneaux/.test(c.textContent),perDay:/Lun\.\s*\d/.test(document.getElementById('svcBox').textContent),
   warn:[...document.querySelectorAll('#svcBox .warnline')].map(e=>e.textContent),slots:[...c.querySelectorAll('.tw button, .tw [data-tt], button.slot')].length,
   txt:c.innerText.length};});
const J=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const O=await page(8062),N=await page(8060);const o=await read(O),n=await read(N);
 check('avant : ligne par jour et phrase d’aide présentes (référence)',!!o.days&&o.help&&o.perDay,o);
 check('carte « Emploi du temps (tableau de service) » présente',n.card&&/tableau de service/.test(n.h2),n.h2);
 check('ligne par jour retirée (#svcDays absent, aucun « Lun. 4 h »)',n.days===null&&!n.perDay,n);
 check('phrase « Les dates des séances S1, S2… sont déduites… » retirée',!n.help);
 check('« Service hebdomadaire : '+n.tot+' » identique ('+o.tot+')',n.tot===o.tot&&n.main===o.main&&/^Service hebdomadaire :/.test(n.main),[o.main,n.main]);
 check('barre identique ('+n.bar+') et même état ok/bad',n.bar===o.bar&&n.cls===o.cls,[o.bar,n.bar,o.cls,n.cls]);
 check('« '+n.brk+' » identique',n.brk===o.brk&&/^Classes : .+ · ASS : .+$/.test(n.brk),[o.brk,n.brk]);
 check('alertes de service identiques',JSON.stringify(n.warn)===JSON.stringify(o.warn),[o.warn,n.warn]);
 check('mêmes créneaux affichés ('+n.slots+')',n.slots===o.slots&&n.slots>0,[o.slots,n.slots]);
 check('données (classRegister.v2 hors ui) identiques entre avant et après',await J(O)===await J(N));
 check('aucune erreur JS',O.errs.length===0&&N.errs.length===0,[O.errs,N.errs]);
 for(const t of ['terrain','neon']){const P=await page(8060,t);const r=await read(P);const th=await P.evaluate(()=>document.documentElement.dataset.theme||'');
  check('thème '+t+' : carte sans ligne par jour ni phrase d’aide, mêmes totaux',r.days===null&&!r.help&&r.tot===o.tot&&r.brk===o.brk,[th,r]);}
 await b.close();S1.close();S2.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
