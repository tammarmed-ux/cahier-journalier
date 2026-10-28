/* 1.29.2 (v) : « Mon Cahier Journalier » — Paramètres › Données, ligne au-dessus de « Exporter les documents ».
   Au toucher : cj-cahier.js (chargé à la demande) produit sur l’appareil le PDF A4 complet (97 pages avec les données du propriétaire), lecture seule.
   1.29.2 (w) : carte compacte sans sous-titre, bouton « Télécharger la version physique (PAPERASSE) ⬇️ » ; PDF vectoriel qualité impression
   (texte réel et polices intégrées, arabe, photos d’origine) ; portrait du Roi obligatoire en p. 2 (sinon arrêt), logo du Ministère en haut au centre p. 1 et p. 97,
   barres de couleur de la p. 4 collées à gauche et jamais sous les noms (Chrome + WebKit), photo « _prof » dans le cercle de la couverture (sinon icône).
   Compare à backup-pre-1.29.2w. Ports 8070/8071. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2w',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2w | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.woff':'font/woff','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const loaded=[];
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}if(P===8070)loaded.push(u);r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8070),S2=serve(B,8071);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');let b;
async function page(port,{w=390,h=844,block=null}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.req=[];p.on('request',q=>{const u=q.url();p.req.push(u);(block&&block.test(u))?q.abort():(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');if(!localStorage.getItem('cahier.cryptoLater'))localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC);
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
   const nr=n.getBoundingClientRect();return {grp:g&&g.getAttribute('data-psg'),next:n&&n.getAttribute('data-ps-open'),title:e.querySelector('b').textContent,btn:bt.textContent,vis:!!e.offsetParent&&bb.width>0,inRow:bb.left>=rb.left&&bb.right<=rb.right+1,ovf:document.documentElement.scrollWidth>innerWidth,cls:bt.className,
    small:e.querySelectorAll('small').length,txt:e.querySelector('.ps-tx').innerText.replace(/\s+/g,' ').trim(),h:Math.round(rb.height),hNext:Math.round(nr.height)};});
  check(lab+' : Paramètres › Données : ligne « Mon Cahier Journalier » juste au-dessus de « Exporter les documents », sans sous-titre, bouton exactement « Télécharger la version physique (PAPERASSE) ⬇️ »',r&&/pdf/.test(r.grp)&&r.next==='pdf'&&r.title==='Mon Cahier Journalier'&&r.btn==='Télécharger la version physique (PAPERASSE) ⬇️'&&!r.small&&r.txt==='Mon Cahier Journalier Télécharger la version physique (PAPERASSE) ⬇️'&&/\bbtn\b/.test(r.cls)&&r.vis&&r.inRow&&!r.ovf,r);
  check(lab+' : carte compacte ('+(r&&r.h)+' px, ≤ 100 px)',r&&r.h<=100,r);
  if(w<600)await p.evaluate(async()=>{const c=document.createElement('canvas');c.width=c.height=600;const x=c.getContext('2d');x.fillStyle='#1971c2';x.fillRect(0,0,600,600);x.fillStyle='#fff';x.font='bold 220px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('TM',300,310);await CJR.photo.set('_prof',c.toDataURL('image/jpeg',.9));});
  const s0=await snap(p),i0=await idb(p);const prog=[];await p.exposeFunction('__pg',t=>prog.push(t));
  await p.evaluate(()=>{const bt=document.getElementById('cjcBtn');new MutationObserver(()=>window.__pg(bt.textContent)).observe(bt,{childList:true,characterData:true,subtree:true});window.__lastPdf=null;bt.click();});
  const t0=Date.now();await p.waitForFunction(()=>window.__lastPdf&&window.__lastPdf.blob,{timeout:300000,polling:400}).catch(()=>{});const ms=Date.now()-t0;
  const o=await p.evaluate(async()=>{const x=window.__lastPdf;if(!x)return null;const t=new TextDecoder('latin1').decode(new Uint8Array(await x.blob.arrayBuffer()));return {name:x.name,size:x.blob.size,head:t.slice(0,5),pages:(t.match(/\/Type \/Page[^s]/g)||[]).length,imgs:(t.match(/\/Subtype \/Image/g)||[]).length,b64:(()=>{return null;})()};});
  const raw=await p.evaluate(async()=>{const a=new Uint8Array(await window.__lastPdf.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return btoa(s);}).catch(()=>null);
  const PF='/tmp/t292w-'+w+'.pdf';if(raw)fs.writeFileSync(PF,Buffer.from(raw,'base64'));
  const sh=c=>{try{return cp.execSync(c,{encoding:'utf8'});}catch(e){return '';}};
  const im=pg=>sh('pdfimages -list -f '+pg+' -l '+pg+' '+PF).split('\n').slice(2).filter(Boolean).map(l=>l.trim().split(/\s+/)).map(a=>({type:a[2],w:+a[3],h:+a[4],enc:a[8]}));
  check(lab+' : PDF créé sur l’appareil et remis par le chemin habituel ('+(o&&o.name)+', '+(o&&o.size)+' o, '+ms+' ms)',o&&o.head==='%PDF-'&&/^Cahier-journalier-EPS-2026-2027\.pdf$/.test(o.name)&&o.size<16.9e6,o);
  check(lab+' : 97 pages A4',o&&o.pages===97&&sh('pdfinfo '+PF).match(/Pages:\s+(\d+)/)[1]==='97'&&/595\.\d* x 841\.\d* pts \(A4\)/.test(sh('pdfinfo '+PF)),o);
  {const fo=sh('pdffonts '+PF).split('\n').filter(l=>/CID TrueType/.test(l)),t19=sh('pdftotext -f 19 -l 19 '+PF+' -'),t7=sh('pdftotext -f 7 -l 7 '+PF+' -');
   check(lab+' : PDF vectoriel — polices intégrées (Poppins/arabe), texte réel extractible (registre, trombinoscope en arabe)',fo.length>=4&&fo.every(l=>/Identity-H\s+yes/.test(l))&&/Registre des séances/.test(t19)&&/Nom et prénom/.test(t19)&&/[\u0600-\u06FF\uFB50-\uFEFF]{3}/.test(t19)&&/Trombinoscope/.test(t7),{fonts:fo.length,t19:t19.slice(0,120)});}
  {const L=[760,763],a=im(1),k=im(2),z=im(97);const isL=x=>x.w===L[0]&&x.h===L[1]&&x.enc==='jpeg';
   check(lab+' : photos d’origine haute définition (JPEG non recompressés) : logo p. 1 et p. 97, couverture, portrait du Roi p. 2',a.some(isL)&&a.some(x=>x.w===2048&&x.h===810)&&z.some(isL)&&k.some(x=>x.w===1184&&x.h===1664&&x.enc==='jpeg'),{a,k,z});
   check(lab+(w<600?' : photo « _prof » dans le cercle de la couverture (p. 1)':' : sans photo « _prof » : icône dans le cercle de la couverture'),w<600?a.some(x=>x.w===600&&x.h===600):a.length===2,a);}
  check(lab+' : progression « Génération… page X/97 » puis bouton rétabli',prog.includes('Génération… page 1/97')&&prog.includes('Génération… page 97/97')&&/Télécharger/.test(prog[prog.length-1]),prog.slice(-3));
  check(lab+' : localStorage identique octet pour octet, IndexedDB inchangé',s0===await snap(p)&&i0===await idb(p));
  check(lab+' : aucune erreur JS',!p.errs.length,p.errs);
  {const m=await p.evaluate(async()=>{const pg=await CJCahier.pages();const one=async(id,sel)=>{const P=pg.find(x=>x.id===id)||pg[id==='back'?pg.length-1:0];const f=document.createElement('iframe');f.style.cssText='position:fixed;left:-3000px;top:0;width:794px;height:1123px;border:0';document.body.appendChild(f);
     await new Promise(r=>{f.onload=r;f.srcdoc='<!doctype html><html><head><meta charset="utf-8"><style>'+(P.css||'')+'</style></head><body style="margin:0">'+P.h+'</body></html>';});
     const d=f.contentDocument;await new Promise(r=>setTimeout(r,400));const s=d.querySelector('section')||d.body,S=s.getBoundingClientRect(),i=d.querySelector(sel),R=i&&i.getBoundingClientRect(),mm=S.width/210;
     const o=i?{id:P.id,cx:Math.round(((R.left+R.right)/2-S.left)/mm*10)/10,top:Math.round((R.top-S.top)/mm*10)/10,w:Math.round(R.width/mm),ok:i.complete&&i.naturalWidth>0,first:![...d.querySelectorAll('img')].some(x=>x!==i&&x.getBoundingClientRect().top<R.top-1)}:{id:P.id,none:true};f.remove();return o;};
    const ph=pg[0].h.match(/<div class="ic ph"><img/)!==null;return {c:await one('cover','.logo img'),b:await one('back','.lg img'),k:pg[1].id+'|'+((pg[1].h.match(/<img/g)||[]).length),ph,n:pg.length,last:pg[pg.length-1].id};});
   check(lab+' : logo du Ministère en haut au centre de la p. 1 et de la p. 97',m.c.ok&&m.b.ok&&Math.abs(m.c.cx-105)<=1.5&&Math.abs(m.b.cx-105)<=1.5&&m.c.top<40&&m.b.top<80&&m.c.first&&m.b.first&&m.n===97&&m.last==='back',m);
   check(lab+' : portrait du Roi en p. 2',/^king\|1$/.test(m.k),m.k);
   check(lab+' : photo « _prof » dans le cercle de la couverture '+(w<600?'(présente)':'(absente → icône)'),w<600?m.ph:!m.ph,m.ph);}
  /* p. 4 : barres de couleur collées à gauche, jamais sous les noms (tableau et légende) */
  {const q=await p.evaluate(async()=>{const pg=await CJCahier.pages();const P=pg.find(x=>x.id==='service');const f=document.createElement('iframe');f.style.cssText='position:fixed;left:-3000px;top:0;width:800px;height:1200px;border:0';document.body.appendChild(f);
    await new Promise(r=>{f.onload=r;f.srcdoc='<!doctype html><html><head><meta charset="utf-8"><style>'+P.css+'</style></head><body style="margin:0">'+P.h+'</body></html>';});const d=f.contentDocument;await d.fonts.ready;await new Promise(r=>setTimeout(r,300));const out=[];
    const chk=el=>{const s=getComputedStyle(el),R=el.getBoundingClientRect(),bl=parseFloat(s.borderLeftWidth),bt=parseFloat(s.borderTopWidth),rg=d.createRange();rg.selectNodeContents(el);const T=[...rg.getClientRects()].filter(x=>x.width>0);
     out.push({n:el.textContent.trim().slice(0,10),bar:bl,thin:bt,gap:Math.min(...T.map(x=>x.left))-(R.left+bl),clip:R.right-parseFloat(s.borderRightWidth)-Math.max(...T.map(x=>x.right)),sh:s.boxShadow});};
    d.querySelectorAll('table.tt td.k,.clg span').forEach(chk);f.remove();return out;});
   const bad=q.filter(x=>x.sh!=='none'||x.gap<0.5||x.clip<0||(!/^ASS/.test(x.n)&&x.bar<x.thin*2));
   check(lab+' : p. 4 — barres de couleur collées à gauche (bordure), jamais sous les noms ni coupées ('+q.length+' cases)',q.length>=20&&!bad.length,bad);}
  if(w<600){const d=await p.evaluate(async()=>{const pg=await CJCahier.pages();const t=pg.map(x=>x.h).join('');const svc=pg.find(x=>x.id==='svc'||/Tableau de service/.test(x.h));
    return {n:pg.length,ids:pg.slice(0,8).map(x=>x.id),ass:/>ASS</.test(svc?svc.h:''),as:/>AS</.test(t),dots:/dot|pointill/.test(pg[0].css+pg[1].css)};});
   check('pages : couverture, roi, informations, service, vacances, répartition, trombinoscope… (97)',d.n===97&&d.ids[0]==='cover',d);
   check('libellé « ASS » (jamais « AS »)',d.ass&&!d.as,d);}
  await p.ctx.close();}
 /* portrait du Roi manquant : arrêt, aucun PDF, message d’erreur */
 {const p=await page(8070,{block:/\/cahier\/roi\.jpg/});const warn=[];p.on('console',m=>{if(m.type()==='warning')warn.push(m.text());});const toasts=[];await p.exposeFunction('__tt',t=>toasts.push(t));
  await p.evaluate(()=>new MutationObserver(()=>document.querySelectorAll('.toast,#toast,[class*="toast"]').forEach(e=>e.textContent&&window.__tt(e.textContent))).observe(document.body,{childList:true,subtree:true,characterData:true}));
  await tab(p,'settings');await sleep(600);const s0=await snap(p);
  await p.evaluate(()=>{window.__lastPdf=null;document.getElementById('cjcBtn').click();});await p.waitForFunction(()=>{const b=document.getElementById('cjcBtn');return !b.disabled;},{timeout:120000,polling:300}).catch(()=>{});await sleep(800);
  const e=await p.evaluate(()=>CJCahier.make({}).then(()=>'made',x=>String(x&&x.message||x)));
  const r={pdf:await p.evaluate(()=>!!window.__lastPdf),btn:await p.evaluate(()=>document.getElementById('cjcBtn').textContent),toasts:[...new Set(toasts)].slice(0,3),e};
  check('portrait du Roi introuvable : génération arrêtée, aucun PDF, message « Impossible de créer le cahier journalier », données intactes',!r.pdf&&/Portrait officiel de S\.M\. le Roi introuvable/.test(e)&&/le cahier n’a pas été créé/.test(e)&&r.toasts.some(t=>/Impossible de créer le cahier journalier/.test(t))&&r.btn==='Télécharger la version physique (PAPERASSE) ⬇️'&&s0===await snap(p),r);await p.ctx.close();}
 /* WebKit (moteur de Safari) : p. 4 et génération complète */
 if(fs.existsSync('/workspace/cj-emu/cahier2w/wk.js')&&fs.existsSync('/workspace/wk/node_modules/playwright')){let o='';o=await new Promise(res=>cp.exec('node /workspace/cj-emu/cahier2w/wk.js',{encoding:'utf8',env:Object.assign({},process.env,{BASE:'http://localhost:8070/',GEN:'1'}),timeout:300000},(e,so,se)=>res(String(so||'')+String(se||'')+(e&&!so?String(e):''))));/* asynchrone : le serveur de test tourne dans ce processus */
  const j=(o.match(/^\{"engine".*$/m)||[])[0],g=(o.match(/^GEN (\{.*\}) \d+$/m)||[])[1];const J=j&&JSON.parse(j),G=g&&JSON.parse(g);
  check('WebKit : p. 4 — barres collées à gauche, jamais sous les noms (tableau + légende)',J&&J.n>=20&&!J.bad.length,J&&J.bad);
  check('WebKit : PDF complet (97 pages, aucun caractère arabe manquant, aucune erreur)',G&&G.pages===97&&G.stats.arMiss===0&&/errs \[\]/.test(o),G||o.slice(-300));}
 /* rendu identique à l’aperçu validé (« Ok Cahier ») : mêmes pages HTML sur les mêmes données */
 const V='/workspace/cahier-journalier-v3/src/render-v3.js';
 if(fs.existsSync(V)){const src=fs.readFileSync(D+'/cj-cahier.js','utf8');const a=src.indexOf('const SPL=(function(){'),z=src.indexOf('/* ---------- données');
  const M=new Function(src.slice(a,z)+'\nreturn {R3,classLevelSort};')(),RV=require(V);
  const DD=JSON.parse(fs.readFileSync('/workspace/cahier-journalier-proposals/data.json','utf8'));DD.classes=M.classLevelSort(DD.classes);
  const g=JSON.parse(fs.readFileSync('/workspace/cahier-journalier-v3/src/grades.json','utf8')),GR={};g.classes.forEach(c=>GR[c.name]=c);
  const W2=s=>s.replace(/box-shadow:inset 0 0 0 ([\d.]+mm) ([^,;"]+),inset ([\d.]+mm) 0 0 \2/g,'border:$1 solid $2;border-left:$3 solid $2').replace(/box-shadow:inset 0 0 0 \.45mm #082B53/g,'border:.45mm solid #082B53').replace('<span style="background:#082B53;color:#fff"><b>ASS</b>','<span style="background:#082B53;color:#fff;font-size:7pt;padding-right:.8mm"><b>ASS</b>');/* (w) p. 4 : barres en bordures (rendu identique Chrome/WebKit/PDF) */
  const r=M.R3(DD,GR,{},'L','K',''),F=RV.build('V',{full:true,noCover:true}),sec=F.html.split(/(?=<section )/).slice(1).map(s=>s.replace(/<\/body><\/html>$/,''));
  const nm=s=>W2(s).replace(/data:image\/jpeg;base64,[A-Za-z0-9+/=]+|(?<=src=")[LK](?=")/g,'IMG');
  check('96 pages intérieures identiques à l’aperçu validé (render-v3 ; p. 4 : barres de couleur en bordures depuis w)',r.pages.length===96&&r.pages.every((p,i)=>nm(p.h)===nm(sec[i])),r.pages.filter((p,i)=>nm(p.h)!==nm(sec[i])).map(p=>p.id).slice(0,5));}
 /* code : lecture seule, rien d’autre ne change */
 const cj=fs.readFileSync(D+'/cj-cahier.js','utf8');
 check('cj-cahier.js lecture seule (aucune écriture : localStorage, IndexedDB, save, photo.set, synchro)',!/localStorage|indexedDB|\.setItem|\bsave\(|photo\.set|\.put\(|Firestore|firebase/i.test(cj));
 const X=require('./undo_2x.js');   /* 2x : changements propres à 2x défaits (barre latérale, cache 2x, navette masquée) */
 const ni=X.index(fs.readFileSync(D+'/index.html','utf8')),oi=fs.readFileSync(B+'/index.html','utf8');
 check('index.html : seulement la version et window.CJR.pdf={lib:pdfLib,deliver:deliverPdf}',ni.replace(/window\.CJR\.pdf=\{lib:pdfLib,deliver:deliverPdf\};[^\n]*\n/,'').replace("'cahier-v29-2w'","'cahier-v29-2v'")===oi.replace(/window\.CJR\.pdf=\{lib:pdfLib,deliver:deliverPdf\};[^\n]*\n/,''));
 const nc=X.college(fs.readFileSync(D+'/college.js','utf8')),oc=fs.readFileSync(B+'/college.js','utf8');
 const cut=x=>x.replace(/\/\* 1\.29\.2 \(v\) : « Mon Cahier Journalier »[\s\S]*?\n\}\)\(\);\n(?=\}\)\(\);)/,'');
 check('college.js : seul le bloc « Mon Cahier Journalier » change',cut(nc)===cut(oc)&&nc!==oc);
 check('cj-pdf.js, desk.js, cj-crypto.js, op2007-athle.js, vendor/ inchangés',['cj-pdf.js','desk.js','cj-crypto.js','op2007-athle.js','core.js'].filter(f=>fs.existsSync(D+'/'+f)).every(f=>X.file(D,f,fs.readFileSync(D+'/'+f,'utf8'))===fs.readFileSync(B+'/'+f,'utf8'))&&cp.execSync('git -C '+D+' diff --stat backup-pre-1.29.2w -- vendor').toString()==='');
 const sw=fs.readFileSync(D+'/sw.js','utf8'),A=(sw.match(/ASSETS\s*=\s*\[([\s\S]*?)\]/)||[])[1].match(/'[^']+'/g).map(x=>x.slice(1,-1)),LZ=(sw.match(/LAZY_ASSETS\s*=\s*\[([\s\S]*?)\]/)||[])[1].match(/'[^']+'/g).map(x=>x.slice(1,-1));
 const sz=A.reduce((t,f)=>t+fs.statSync(D+'/'+(f==='./'?'index.html':f.replace(/^\.\//,''))).size,0);
 const need=['./cj-cahier.js','./cahier/cover.html','./cahier/logo.jpg','./cahier/roi.jpg','./cahier/splash.jpg'].concat(['400','400i','500','600','700','800','800i','900','900i'].map(x=>'./cahier/poppins-'+x+'.ttf'));
 check('sw.js : cj-cahier.js et cahier/ hors démarrage, mis en cache à la demande (LAZY_ASSETS), fichiers présents',need.every(f=>LZ.includes(f)&&!A.includes(f)&&fs.existsSync(D+'/'+f.slice(2)))&&/'cahier-v29-2z'/.test(sw)&&!/\.woff'/.test(sw.match(/LAZY_ASSETS\s*=\s*\[([\s\S]*?)\]/)[1]));
 check('budget de démarrage ≤ 737 280 o ('+sz+' o)',sz<=737280);
 console.log(pass+'/'+tot+' passed');await b.close();S1.close();S2.close();process.exit(pass===tot?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
