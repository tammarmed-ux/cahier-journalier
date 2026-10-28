/* 1.29.2 (u) : classes affichées dans l’ordre des niveaux (1A < 2A < 3A < TC < 1BAC < 2BAC), puis filière (SH = LSH), puis numéro ; noms inconnus à la fin (ordre alphabétique).
   Affichage seulement : DB.classes (ordre enregistré), données, exports et import Massar inchangés. Compare à backup-pre-1.29.2u. Ports 8068/8069. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2u',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2u | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8068),S2=serve(B,8069);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');const STORED=JSON.parse(LYC).classes.map(c=>c.name);let b;
const EXP=['1BACSH1','1BACLSH2','1BACSH3','1BACLSH4','2BACSP4','2BACSP5','2BACSP6','2BACSVT1','2BACSVT2'];
async function page(port,{w=390,h=844}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});
 await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});
 await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:10000}).catch(()=>{});await sleep(1300);p.ctx=ctx;return p;}
const tab=(p,t)=>p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);
const SEL=['stuClassFilter','attClass','procClass','repClass','trbClass','expClass','tCls','fClass','bulkClass'];
async function lists(p){const o={};for(const t of ['home','students','attendance','proc','reports','settings']){await tab(p,t);await sleep(700);}
 await p.evaluate(()=>{try{document.getElementById('trombiBtn').click();}catch(e){}});await sleep(400);
 return Object.assign(o,await p.evaluate(SEL=>{const r={},nm=id=>{const c=CJR.db().classes.find(c=>c.id===id);return c?c.name:null;};
  for(const s of SEL){const e=document.getElementById(s);if(e&&e.options.length)r[s]=[...e.options].map(x=>nm(x.value)).filter(Boolean);}
  r.clsManage=[...document.querySelectorAll('#clsManage [data-cid]')].map(e=>nm(e.getAttribute('data-cid'))).filter((x,i,a)=>x&&a.indexOf(x)===i);
  r.homeCmp=[...document.querySelectorAll('#homeCmp [data-cmpcls]')].map(e=>nm(e.getAttribute('data-cmpcls'))).filter((x,i,a)=>x&&a.indexOf(x)===i);
  r.stored=CJR.db().classes.map(c=>c.name);r.saved=JSON.parse(localStorage.getItem('classRegister.v2')).classes.map(c=>c.name);return r;},SEL));}
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--lang=fr-FR']});
 /* 1. règle de tri (fonction réelle de l’app, sur une copie) */
 {const p=await page(8068);const r=await p.evaluate(()=>{const d=CJR.db(),sv=d.classes;d.classes=['Zeta','2BACSVT2','1BACLSH4','atelier','2BACSP6','1BACSH3','3AC2','TCS2','1AC10','1apic1','1AC2','2ASC1','tc-lsh1','1BACSH1','1BACLSH2','2BAC SP4'].map((n,i)=>({id:'x'+i,name:n}));const o=CJR.CS().map(c=>c.name),same=d.classes.map(c=>c.name);d.classes=sv;return {o,same};});
  check('ordre : collège 1A < 2A < 3A, puis TC < 1BAC < 2BAC, filière (SH = LSH), n° naturel (1AC2 < 1AC10), noms inconnus à la fin par ordre alphabétique',JSON.stringify(r.o)===JSON.stringify(['1AC2','1AC10','1apic1','2ASC1','3AC2','TCS2','tc-lsh1','1BACSH1','1BACLSH2','1BACSH3','1BACLSH4','2BAC SP4','2BACSP6','2BACSVT2','atelier','Zeta']),r.o);
  check('tri sur une copie : la liste d’origine n’est pas réordonnée',r.same[0]==='Zeta'&&r.same[1]==='2BACSVT2',r.same);await p.ctx.close();}
 /* 2. données réelles du propriétaire, téléphone et ordinateur */
 for(const [lab,w,h] of [['390 px',390,844],['1440 px',1440,900]]){const N=await page(8068,{w,h}),O=await page(8069,{w,h});const n=await lists(N),o=await lists(O);
  const ks=Object.keys(n).filter(k=>!['stored','saved','homeCmp'].includes(k)&&n[k].length);
  check(lab+' : listes et sélecteurs de classes dans l’ordre '+EXP.join(', ')+' ('+ks.join(', ')+')',ks.length>=7&&ks.every(k=>{const e=EXP.filter(x=>n[k].includes(x));return JSON.stringify(n[k])===JSON.stringify(e);})&&JSON.stringify(n.clsManage)===JSON.stringify(EXP)&&JSON.stringify(n.stuClassFilter)===JSON.stringify(EXP),ks.map(k=>k+':'+n[k].join(',')));
  check(lab+' : Accueil › Comparaison des classes : reste classée par taux d’absence (même ordre qu’en 2t)',JSON.stringify(n.homeCmp)===JSON.stringify(o.homeCmp)&&n.homeCmp.length===9,[n.homeCmp,o.homeCmp]);
  check(lab+' : avant (2t) les mêmes listes suivaient l’ordre enregistré (1BACSH3 en dernier)',JSON.stringify(o.clsManage)===JSON.stringify(STORED),o.clsManage);
  check(lab+' : mêmes classes dans chaque liste qu’avant (seul l’ordre change)',ks.every(k=>o[k]&&JSON.stringify([...n[k]].sort())===JSON.stringify([...o[k]].sort())),ks.filter(k=>!o[k]||JSON.stringify([...n[k]].sort())!==JSON.stringify([...o[k]].sort())));
  check(lab+' : ordre enregistré DB.classes et classRegister.v2 inchangé',JSON.stringify(n.stored)===JSON.stringify(STORED)&&JSON.stringify(n.saved)===JSON.stringify(STORED),[n.stored,n.saved]);
  const dn=await N.evaluate(()=>{const o=JSON.parse(localStorage.getItem('classRegister.v2'));delete o.ui;return JSON.stringify(o);}),dO=await O.evaluate(()=>{const o=JSON.parse(localStorage.getItem('classRegister.v2'));delete o.ui;return JSON.stringify(o);});
  check(lab+' : données (classRegister.v2 hors ui) identiques à 2t',dn===dO);
  check(lab+' : aucune erreur JS',!N.errs.length&&!O.errs.length,[N.errs,O.errs]);await N.ctx.close();await O.ctx.close();}
 /* 3. exports et import : code inchangé */
 const ni=fs.readFileSync(D+'/index.html','utf8'),oi=fs.readFileSync(B+'/index.html','utf8');
 const fn=(s,n)=>{const i=s.indexOf('function '+n+'(');let j=s.indexOf('\nfunction ',i+5);return s.slice(i,j);};
 const EX=['allStudents','exportGrid','exportScopeAll','exportYear','exportStudents','exportRecords','normalize','applyJSON'].filter(n=>oi.includes('function '+n+'('));
 check('exports CSV/JSON et normalisation : code identique ('+EX.join(', ')+')',EX.every(n=>fn(ni,n)===fn(oi,n)),EX.filter(n=>fn(ni,n)!==fn(oi,n)));
 const V2=x=>x.replace(/\/\* 1\.29\.2 \(v\) : « Mon Cahier Journalier »[\s\S]*?\n\}\)\(\);\n(?=\}\)\(\);)/,'');   /* 2v : bloc « Mon Cahier Journalier » ajouté en fin d’IIFE (défait pour la comparaison) */
 check('cj-pdf.js, college.js (hors bloc 2v), desk.js, cj-crypto.js, op2007-athle.js inchangés',['cj-pdf.js','college.js','desk.js','cj-crypto.js','op2007-athle.js'].every(f=>V2(fs.readFileSync(D+'/'+f,'utf8'))===fs.readFileSync(B+'/'+f,'utf8')));
 const rem=[],add=[];{const a=oi.split('\n'),c=ni.split('\n');const sa=new Set(c),sb=new Set(a);a.forEach(l=>{if(!sa.has(l))rem.push(l);});c.forEach(l=>{if(!sb.has(l))add.push(l);});}
 check('index.html : seules les lignes d’affichage changent (DB.classes → CS() pour lire une copie triée) + la version + CJR.CS (copie triée, pour college.js et les tests)',rem.every(l=>/cahier-v29-2t/.test(l)||add.includes(l.replace('window.CJR={semver:APP_SEMVER,','window.CJR={semver:APP_SEMVER,CS:CS,'))||add.some(x=>x===l.replace(/DB\.classes(?=\.(forEach|map|filter))/g,'CS()')))&&add.every(l=>rem.includes(l.replace('CS:CS,',''))||/cahier-v29-2w|^function clsK\(|^function CS\(|^window\.CJR\.pdf=\{lib:pdfLib,deliver:deliverPdf\};|^\/\* 1\.29\.2 \(u\)/.test(l)||rem.some(x=>x.replace(/DB\.classes(?=\.(forEach|map|filter))/g,'CS()')===l))&&!/DB\.classes\s*=|DB\.classes\.(sort|reverse|splice)/.test(add.join('\n')),{rem:rem.length,add:add.length});
 const sw=fs.readFileSync(D+'/sw.js','utf8'),A=(sw.match(/ASSETS\s*=\s*\[([\s\S]*?)\]/)||[])[1].match(/'[^']+'/g).map(x=>x.slice(1,-1)),sz=A.reduce((t,f)=>t+fs.statSync(D+'/'+(f==='./'?'index.html':f.replace(/^\.\//,''))).size,0);
 check('budget de démarrage ≤ 737 280 o ('+sz+' o)',sz<=737280);
 console.log(pass+'/'+tot+' passed');await b.close();S1.close();S2.close();process.exit(pass===tot?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
