/* 1.29.2 (v) : « Mon Cahier Journalier » — Paramètres › Données, ligne au-dessus de « Exporter les documents ».
   Au toucher : cj-cahier.js (chargé à la demande) produit sur l’appareil le PDF A4 complet (97 pages avec les données du propriétaire), lecture seule.
   Compare à backup-pre-1.29.2v. Ports 8070/8071. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2v',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2v | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const loaded=[];
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}if(P===8070)loaded.push(u);r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8070),S2=serve(B,8071);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');let b;
async function page(port,{w=390,h=844}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.req=[];p.on('request',q=>{const u=q.url();p.req.push(u);(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});
 await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});
 await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:10000}).catch(()=>{});await sleep(3500);p.ctx=ctx;return p;}
const tab=(p,t)=>p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);
const snap=p=>p.evaluate(()=>{const o=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o.push([k,localStorage.getItem(k)]);}return JSON.stringify(o.sort());});
const idb=p=>p.evaluate(()=>new Promise(res=>{try{const out={};const q=indexedDB.databases?indexedDB.databases():Promise.resolve([]);q.then(L=>Promise.all(L.map(d=>new Promise(ok=>{const r=indexedDB.open(d.name);r.onsuccess=()=>{const db=r.result,st=[...db.objectStoreNames];if(!st.length){db.close();out[d.name]=[];return ok();}const t=db.transaction(st,'readonly');const c={};st.forEach(s=>{const g=t.objectStore(s).count();g.onsuccess=()=>c[s]=g.result;});t.oncomplete=()=>{db.close();out[d.name]=c;ok();};};r.onerror=()=>ok();})))).then(()=>res(JSON.stringify(out)));}catch(e){res('err');}}));
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox','--lang=fr-FR']});
 for(const [lab,w,h] of [['390 px',390,844],['1280 px',1280,900]]){loaded.length=0;const p=await page(8070,{w,h});
  {const ld=p.req.filter(u=>/cj-cahier|\/cahier\//.test(u)),wc=await p.evaluate(()=>!!window.CJCahier);check(lab+' : cj-cahier.js et cahier/ ne sont pas chargés par la page au démarrage (seulement mis en cache hors ligne par le service worker, comme desk.js)',!ld.length&&!wc,[ld,wc]);}
  await tab(p,'settings');await sleep(700);
  const r=await p.evaluate(()=>{const e=document.getElementById('cjcRow');if(!e)return null;e.scrollIntoView({block:'center'});const g=e.closest('.ps-grp'),n=e.nextElementSibling,bt=document.getElementById('cjcBtn'),bb=bt.getBoundingClientRect(),rb=e.getBoundingClientRect();
   return {grp:g&&g.getAttribute('data-psg'),next:n&&n.getAttribute('data-ps-open'),title:e.querySelector('b').textContent,btn:bt.textContent.trim(),vis:!!e.offsetParent&&bb.width>0,inRow:bb.left>=rb.left&&bb.right<=rb.right+1,ovf:document.documentElement.scrollWidth>innerWidth,cls:bt.className};});
  check(lab+' : Paramètres › Données : ligne « Mon Cahier Journalier » juste au-dessus de « Exporter les documents », bouton « Télécharger mon cahier journalier d’EPS »',r&&/pdf/.test(r.grp)&&r.next==='pdf'&&r.title==='Mon Cahier Journalier'&&/Télécharger mon cahier journalier d’EPS$/.test(r.btn)&&/\bbtn\b/.test(r.cls)&&r.vis&&r.inRow&&!r.ovf,r);
  const s0=await snap(p),i0=await idb(p);const prog=[];await p.exposeFunction('__pg',t=>prog.push(t));
  await p.evaluate(()=>{const bt=document.getElementById('cjcBtn');new MutationObserver(()=>window.__pg(bt.textContent)).observe(bt,{childList:true,characterData:true,subtree:true});window.__lastPdf=null;bt.click();});
  const t0=Date.now();await p.waitForFunction(()=>window.__lastPdf&&window.__lastPdf.blob,{timeout:300000,polling:400}).catch(()=>{});const ms=Date.now()-t0;
  const o=await p.evaluate(async()=>{const x=window.__lastPdf;if(!x)return null;const t=new TextDecoder('latin1').decode(new Uint8Array(await x.blob.arrayBuffer()));return {name:x.name,size:x.blob.size,head:t.slice(0,5),pages:(t.match(/\/Type \/Page[^s]/g)||[]).length,imgs:(t.match(/\/Subtype \/Image/g)||[]).length};});
  check(lab+' : PDF créé sur l’appareil et remis par le chemin habituel ('+(o&&o.name)+', '+(o&&o.size)+' o, '+ms+' ms)',o&&o.head==='%PDF-'&&/^Cahier-journalier-EPS-2026-2027\.pdf$/.test(o.name)&&o.size<16.9e6,o);
  check(lab+' : 97 pages A4 (1 image par page)',o&&o.pages===97&&o.imgs===97,o);
  check(lab+' : progression « Génération… page X/97 » puis bouton rétabli',prog.includes('Génération… page 1/97')&&prog.includes('Génération… page 97/97')&&/Télécharger/.test(prog[prog.length-1]),prog.slice(-3));
  check(lab+' : localStorage identique octet pour octet, IndexedDB inchangé',s0===await snap(p)&&i0===await idb(p));
  check(lab+' : aucune erreur JS',!p.errs.length,p.errs);
  if(w<600){const d=await p.evaluate(async()=>{const pg=await CJCahier.pages();const t=pg.map(x=>x.h).join('');const svc=pg.find(x=>x.id==='svc'||/Tableau de service/.test(x.h));
    return {n:pg.length,ids:pg.slice(0,8).map(x=>x.id),ass:/>ASS</.test(svc?svc.h:''),as:/>AS</.test(t),dots:/dot|pointill/.test(pg[0].css+pg[1].css)};});
   check('pages : couverture, roi, informations, service, vacances, répartition, trombinoscope… (97)',d.n===97&&d.ids[0]==='cover',d);
   check('libellé « ASS » (jamais « AS »)',d.ass&&!d.as,d);}
  await p.ctx.close();}
 /* rendu identique à l’aperçu validé (« Ok Cahier ») : mêmes pages HTML sur les mêmes données */
 const V='/workspace/cahier-journalier-v3/src/render-v3.js';
 if(fs.existsSync(V)){const src=fs.readFileSync(D+'/cj-cahier.js','utf8');const a=src.indexOf('const SPL=(function(){'),z=src.indexOf('/* ---------- données');
  const M=new Function(src.slice(a,z)+'\nreturn {R3,classLevelSort};')(),RV=require(V);
  const DD=JSON.parse(fs.readFileSync('/workspace/cahier-journalier-proposals/data.json','utf8'));DD.classes=M.classLevelSort(DD.classes);
  const g=JSON.parse(fs.readFileSync('/workspace/cahier-journalier-v3/src/grades.json','utf8')),GR={};g.classes.forEach(c=>GR[c.name]=c);
  const r=M.R3(DD,GR,{},'L','K',''),F=RV.build('V',{full:true,noCover:true}),sec=F.html.split(/(?=<section )/).slice(1).map(s=>s.replace(/<\/body><\/html>$/,''));
  const nm=s=>s.replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+|(?<=src=")[LK](?=")/g,'IMG');
  check('96 pages intérieures identiques à l’aperçu validé (render-v3)',r.pages.length===96&&r.pages.every((p,i)=>nm(p.h)===nm(sec[i])),r.pages.filter((p,i)=>nm(p.h)!==nm(sec[i])).map(p=>p.id).slice(0,5));}
 /* code : lecture seule, rien d’autre ne change */
 const cj=fs.readFileSync(D+'/cj-cahier.js','utf8');
 check('cj-cahier.js lecture seule (aucune écriture : localStorage, IndexedDB, save, photo.set, synchro)',!/localStorage|indexedDB|\.setItem|\bsave\(|photo\.set|\.put\(|Firestore|firebase/i.test(cj));
 const ni=fs.readFileSync(D+'/index.html','utf8'),oi=fs.readFileSync(B+'/index.html','utf8');
 check('index.html : seulement la version et window.CJR.pdf={lib:pdfLib,deliver:deliverPdf}',ni.replace(/window\.CJR\.pdf=\{lib:pdfLib,deliver:deliverPdf\};[^\n]*\n/,'').replace("'cahier-v29-2v'","'cahier-v29-2u'")===oi);
 const nc=fs.readFileSync(D+'/college.js','utf8'),oc=fs.readFileSync(B+'/college.js','utf8');
 check('college.js : seul le bloc « Mon Cahier Journalier » est ajouté',nc.replace(/\/\* 1\.29\.2 \(v\) : « Mon Cahier Journalier »[\s\S]*?\n\}\)\(\);\n(?=\}\)\(\);)/,'')===oc);
 check('cj-pdf.js, desk.js, cj-crypto.js, op2007-athle.js, vendor/ inchangés',['cj-pdf.js','desk.js','cj-crypto.js','op2007-athle.js'].every(f=>fs.readFileSync(D+'/'+f,'utf8')===fs.readFileSync(B+'/'+f,'utf8'))&&cp.execSync('git -C '+D+' diff --stat backup-pre-1.29.2v -- vendor').toString()==='');
 const sw=fs.readFileSync(D+'/sw.js','utf8'),A=(sw.match(/ASSETS\s*=\s*\[([\s\S]*?)\]/)||[])[1].match(/'[^']+'/g).map(x=>x.slice(1,-1)),LZ=(sw.match(/LAZY_ASSETS\s*=\s*\[([\s\S]*?)\]/)||[])[1].match(/'[^']+'/g).map(x=>x.slice(1,-1));
 const sz=A.reduce((t,f)=>t+fs.statSync(D+'/'+(f==='./'?'index.html':f.replace(/^\.\//,''))).size,0);
 const need=['./cj-cahier.js','./cahier/cover.html','./cahier/logo.jpg','./cahier/roi.jpg','./cahier/splash.jpg'].concat(['400','400i','500','600','700','800','800i','900','900i'].map(x=>'./cahier/poppins-'+x+'.woff'));
 check('sw.js : cj-cahier.js et cahier/ hors démarrage, mis en cache à la demande (LAZY_ASSETS), fichiers présents',need.every(f=>LZ.includes(f)&&!A.includes(f)&&fs.existsSync(D+'/'+f.slice(2)))&&/'cahier-v29-2v'/.test(sw));
 check('budget de démarrage ≤ 737 280 o ('+sz+' o)',sz<=737280);
 console.log(pass+'/'+tot+' passed');await b.close();S1.close();S2.close();process.exit(pass===tot?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
