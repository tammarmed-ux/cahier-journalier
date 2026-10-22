/* 1.29.2 (s) : mise en page ordinateur (≥ 1024 px) — desk.js chargé par college.js seulement sur grand écran. Affichage seulement.
   Compare au code de backup-pre-1.29.2s (extrait dans /tmp/base-2s) : téléphone 390 px identique au pixel près, repli identique si desk.js manque,
   données et notes lycée identiques, budget de démarrage inchangé. Ports 8064/8066. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2s',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2s | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8064),S2=serve(B,8066);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');let b;
async function page(port,{w=1440,h=900,theme='',block=null}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&block.test(u))return q.abort();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o,t)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);if(t)localStorage.setItem('cahier.theme',t);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC,theme);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});
 await p.evaluate(t=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;if(t)document.documentElement.setAttribute('data-theme',t);},theme);
 await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:10000}).catch(()=>{});await sleep(1300);p.ctx=ctx;return p;}
const tab=(p,t)=>p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);
const TABS=['home','students','attendance','proc','reports','settings'];
const shot=async p=>{await p.evaluate(()=>window.scrollTo(0,0));await sleep(150);return (await p.screenshot({fullPage:true,encoding:'base64'}));};
const J=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
const G=p=>p.evaluate(()=>{const d=CJR.db(),o=[];d.classes.forEach(c=>d.periods.forEach((x,pi)=>CJR.studentsIn(c.id).forEach(s=>{const g=CJR.gradeOf(c.id,s.id,pi);o.push(g.total+'|'+g.proc);})));return o.join();});
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:240000,args:['--no-sandbox','--disable-dev-shm-usage']});
 /* 0. statique */
 const sw=fs.readFileSync(D+'/sw.js','utf8'),A=sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1],LZ=sw.match(/const LAZY_ASSETS = \[([\s\S]*?)\];/)[1];
 const budget=R=>{const s=fs.readFileSync(R+'/sw.js','utf8').match(/const ASSETS = \[([\s\S]*?)\];/)[1];return [...s.matchAll(/'([^']+)'/g)].map(m=>m[1]).reduce((t,f)=>t+fs.statSync(R+'/'+(f==='./'?'index.html':f)).size,0);};
 const bN=budget(D),bO=budget(B);
 check('desk.js : chargé après le démarrage (LAZY_ASSETS, pas dans ASSETS), en-tête no-cache',!/desk/.test(A)&&/'\.\/desk\.js'/.test(LZ)&&/"\/desk\.js"/.test(fs.readFileSync(D+'/firebase.json','utf8')));
 check('budget de démarrage inchangé ('+bN+' o = '+bO+' o, ≤ 737 280)',bN===bO&&bN<=737280,[bN,bO]);
 const idxN=fs.readFileSync(D+'/index.html','utf8'),idxO=fs.readFileSync(B+'/index.html','utf8');
 check('index.html : seule la version change (APP_VER cahier-v29-2s)',idxN===idxO.replace("var APP_VER='cahier-v29-2r';","var APP_VER='cahier-v29-2s';")&&/'cahier-v29-2s'/.test(idxN));
 check('college.js charge desk.js seulement si (min-width:1024px)',/matchMedia\('\(min-width:1024px\)'\)/.test(fs.readFileSync(D+'/college.js','utf8'))&&/s\.src='desk\.js'/.test(fs.readFileSync(D+'/college.js','utf8')));
 check('desk.js : tout le CSS sous @media (min-width:1024px)',(()=>{const t=fs.readFileSync(D+'/desk.js','utf8');return /@media\s*\(min-width:1024px\)/.test(t)&&!/@media\s*\(max-width/.test(t);})());
 /* 1. téléphone 390 px : identique au pixel près, desk.js jamais chargé */
 for(const th of ['','terrain','neon']){const O=await page(8066,{w:390,h:844,theme:th}),N=await page(8064,{w:390,h:844,theme:th});let same=0,dk=0;
  for(const t of TABS){await tab(O,t);await tab(N,t);await sleep(800);if(await shot(O)===await shot(N))same++;}
  dk=await N.evaluate(()=>document.documentElement.classList.contains('cj-dk')||!!document.getElementById('deskCss')||[...document.scripts].some(s=>/desk\.js/.test(s.src)));
  check('390 px thème '+(th||'actuel')+' : 6 pages identiques au pixel près, desk.js non chargé, aucune erreur',same===6&&!dk&&!O.errs.length&&!N.errs.length,[same,dk,O.errs,N.errs]);
  await O.ctx.close();await N.ctx.close();}
 /* 2. 1440 px : mise en page ordinateur sur toutes les pages */
 const N=await page(8064);const lay=[];
 for(const t of TABS){await tab(N,t);await sleep(700);lay.push(await N.evaluate(t=>{const nav=document.getElementById('tabs').getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),v=document.getElementById('view-'+t);
   return {t,dk:document.documentElement.classList.contains('cj-dk'),css:!!document.getElementById('deskCss'),navX:Math.round(nav.left),navW:Math.round(nav.width),navH:Math.round(nav.height),mainX:Math.round(m.left),sw:document.documentElement.scrollWidth,vis:!!v&&v.offsetParent!==null&&v.getBoundingClientRect().width>900};},t));}
 check('1440 px : barre latérale 248 px à gauche, contenu décalé, pas de défilement horizontal, sur les 6 pages',lay.every(l=>l.dk&&l.css&&l.navX===0&&l.navW===248&&l.navH>600&&l.mainX>=248&&l.sw===1440&&l.vis),lay);
 await tab(N,'home');await sleep(500);
 check('1440 px Accueil : accès rapide sur 6 colonnes, statistiques 4 colonnes',await N.evaluate(()=>getComputedStyle(document.getElementById('homeQuick')).gridTemplateColumns.split(' ').length===6&&getComputedStyle(document.querySelector('#homeStats .hs-grid')).gridTemplateColumns.split(' ').length===4));
 await tab(N,'settings');await sleep(400);await N.evaluate(()=>CJPS.open('annee'));await sleep(600);
 check('1440 px Paramètres : liste des rubriques visible à côté de la rubrique ouverte',await N.evaluate(()=>{const l=document.getElementById('psList').getBoundingClientRect();return l.width>200&&l.height>100&&l.left<600;}));
 await tab(N,'students');await sleep(500);await N.evaluate(()=>document.querySelector('#stuList li.stu').click());await sleep(800);
 check('1440 px fiche élève : fenêtre centrée et élargie',await N.evaluate(()=>{const s=document.querySelector('#detModal .sheet').getBoundingClientRect();return s.width>800&&Math.abs((s.left+s.right)/2-720)<30;}));
 check('1440 px : aucune erreur JS',N.errs.length===0,N.errs);
 /* 3. données et notes identiques (avec la mise en page ordinateur) */
 const O=await page(8066);
 check('données (classRegister.v2 hors ui) identiques à 2r',await J(O)===await J(N));
 const g0=await G(O),g1=await G(N);check('lycée : toutes les notes /20 et procédurales identiques à 2r ('+g1.split(',').length+')',g0===g1&&g0.length>1000);
 await N.ctx.close();
 /* 4. repli : desk.js indisponible -> écran d’avant */
 const F=await page(8064,{block:/desk\.js/});let fs0=0;for(const t of TABS){await tab(O,t);await tab(F,t);await sleep(800);if(await shot(O)===await shot(F))fs0++;}
 check('repli : sans desk.js, les 6 pages à 1440 px identiques à 2r, sans erreur',fs0===6&&!F.errs.length&&!(await F.evaluate(()=>document.documentElement.classList.contains('cj-dk'))),[fs0,F.errs]);
 await b.close();S1.close();S2.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})();
