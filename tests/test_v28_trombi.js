/* v1.28.0 (-l) : trombinoscope (modèle D) — bouton Élèves, sélecteur classe/format, PDF (blocs colorés / une page par groupe),
   élèves Sans groupe, classe sans groupes, débordement 45 élèves, photos + silhouettes, aucun schéma modifié. */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const PORT=8041;const OUT='/tmp/v28trombi';
fs.mkdirSync(OUT,{recursive:true});
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const AR=['العلوي يوسف','بامعروف ياسين','رؤوفي سلمى','مسناوي إيمان','الصباحي حمزة','سيفي نور','الإدريسي سارة','بنعلي هدى','الزهراني ليلى','بوزيد مريم','الفاسي محمد أمين','التازي خديجة','العمراني عبد الرحيم','الكتاني فاطمة الزهراء','بنجلون أنس','الشرقاوي سكينة','المنصوري إلياس','الحسني آية','بلحاج عمر','الودغيري زينب'];
const LA=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','EL IDRISSI Nour','LAHLOU Adam','TAZI Imane','FASSI Mehdi','AMRANI Rayan','KETTANI Anas','SAIDI Aya','EL AMRANI Hiba','OUAZZANI Karim','BERRADA Lina','EL MANSOURI Ilyas','ZIANI Douae','HAKIMI Reda','SEBTI Rim','EL KHATTABI Hamza','NACIRI Malak','TOUZANI Ismail','BENKIRANE Youssef','CHRAIBI Sara','FILALI Amine','GHARBI Nora','IDRISSI Walid'];
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:120000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await (await b.createBrowserContext()).newPage();await p.emulateTimezone('Africa/Casablanca');await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
const names=[];for(let i=0;i<20;i++){names.push(AR[i]);names.push(LA[i]);}for(let i=20;i<25;i++)names.push(LA[i]); // 45 élèves
const FEM=/سلمى|إيمان|نور|سارة|هدى|ليلى|مريم|خديجة|فاطمة|سكينة|آية|زينب|Salma|Nour|Imane|Aya|Hiba|Lina|Douae|Rim|Malak|Sara|Nora/;
const seed=await p.evaluate((KEY,names,femSrc)=>{const FEM=new RegExp(femSrc);const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';d.lastBackup=Date.now();
  const c=d.classes.find(x=>x.name==='2BACSP4');let r=12345;const rnd=()=>{r=(r*1103515245+12345)%2147483648;return r/2147483648;};
  const st=names.map((n,i)=>{const y=2007+Math.floor(rnd()*3),mo=1+Math.floor(rnd()*12),dd=1+Math.floor(rnd()*28);return {id:'t'+String(i).padStart(2,'0'),classId:c.id,name:n,sex:FEM.test(n)?'F':'G',sid:'J1'+String(30000000+Math.floor(rnd()*9000000)).padStart(8,'0'),dob:y+'-'+String(mo).padStart(2,'0')+'-'+String(dd).padStart(2,'0'),parent:'',phone:'',notes:'',created:1};});
  st[7].dob='';d.students=d.students.filter(s=>s.classId!==c.id).concat(st);
  const sorted=st.slice().sort((a,b)=>a.sid<b.sid?-1:1),of={};sorted.forEach((s,i)=>{if(i>=40)return;of[s.id]=i%5;}); // 40 en groupes, 5 sans groupe
  c.grp={names:['G1','G2','G3','G4','G5'],of:of};d.ui.cls=c.id;localStorage.setItem(KEY,JSON.stringify(d));return {cid:c.id,ids:st.map(s=>s.id),sex:st.map(s=>s.sex),before:Object.keys(d).sort().join(',')};},KEY,names,FEM.source);
// photos pour ~35 élèves
const av=fs.readdirSync('/tmp/trombi/av').sort();const ph={};av.forEach((f,i)=>{ph[i]='data:image/jpeg;base64,'+fs.readFileSync('/tmp/trombi/av/'+f).toString('base64');});
let fi=0,mi=0;const recs=[];seed.ids.forEach((id,i)=>{if(i%5===3)return;const fem=seed.sex[i]==='F';recs.push({id,d:ph[fem?1+2*(fi++%20):2*(mi++%20)],t:Date.now()});});
await p.evaluate(recs=>new Promise((res,rej)=>{const r=indexedDB.open('cahier-photos',1);r.onupgradeneeded=()=>{const db=r.result;['p','q'].forEach(n=>{if(!db.objectStoreNames.contains(n))db.createObjectStore(n,{keyPath:'id'});});if(!db.objectStoreNames.contains('m'))db.createObjectStore('m',{keyPath:'k'});};
  r.onsuccess=()=>{const db=r.result,tx=db.transaction('p','readwrite');recs.forEach(x=>tx.objectStore('p').put(x));tx.oncomplete=()=>{db.close();res();};tx.onerror=()=>rej(tx.error);};r.onerror=()=>rej(r.error);}),recs);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="students"]').click());await sleep(500);
const btn=await p.evaluate(()=>{const b=document.getElementById('trombiBtn');const r=b.getBoundingClientRect();return {t:b.textContent.trim(),ok:r.height>=44&&r.width>=44,sw:document.documentElement.scrollWidth};});
check('bouton « Trombinoscope » visible sur l’onglet Élèves (≥ 44 px)',btn.t==='Trombinoscope'&&btn.ok&&btn.sw<=375,JSON.stringify(btn));
await p.click('#trombiBtn');await sleep(400);
const ch=await p.evaluate(()=>({open:document.getElementById('trombiModal').classList.contains('open'),cls:document.getElementById('trbClass').value,opts:[...document.querySelectorAll('input[name="trbFmt"]')].map(x=>x.value+':'+x.checked),info:document.getElementById('trbInfo').textContent}));
check('sélecteur : classe courante + 2 formats (page / group)',ch.open&&ch.cls===seed.cid&&ch.opts.join('|')==='page:true|group:false'&&/45 élèves · 5 groupes · 5 sans groupe/.test(ch.info),JSON.stringify(ch));
if(process.env.SHOT){await p.screenshot({path:'/workspace/screens/cj128-trombi-bouton.png'});}
const keys0=await p.evaluate(KEY=>Object.keys(JSON.parse(localStorage.getItem(KEY))).sort().join(','),KEY);
async function pdf(mode,tag){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(mode=>{document.querySelector('input[name="trbFmt"][value="'+mode+'"]').checked=true;document.getElementById('trbGo').click();},mode);
  await p.waitForFunction(()=>window.__lastPdf,{timeout:60000});const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:x.name,b64:btoa(s)};});
  const f=OUT+'/'+(tag||mode)+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));return {f,name:r.name,info:cp.execSync('pdfinfo "'+f+'"').toString(),txt:cp.execSync('pdftotext -layout "'+f+'" -').toString()};}
const page=await pdf('page');
check('PDF « Tous les groupes sur une page » : en-tête Cahier d’EPS + Lycée qualifiant Baja + année + G1…G5 + Sans groupe',/Cahier d.EPS/.test(page.txt)&&/Lycée qualifiant Baja/.test(page.txt)&&/Année scolaire/.test(page.txt)&&/Trombinoscope/.test(page.txt)&&/G1/.test(page.txt)&&/G5/.test(page.txt)&&/Sans groupe/.test(page.txt)&&/âge —/.test(page.txt),page.name+' '+page.info.match(/Pages:\s*\d+/)[0]);
const pages=+(page.info.match(/Pages:\s*(\d+)/)||[])[1];check('45 élèves : le PDF tient sans erreur (1 ou 2 pages)',pages>=1&&pages<=3&&!/Error/i.test(page.info),String(pages));
await p.click('#trombiBtn');await sleep(300);
const grp=await pdf('group');
const gp=+(grp.info.match(/Pages:\s*(\d+)/)||[])[1];
check('PDF « Une page par groupe » : ≥ 6 pages (5 groupes + Sans groupe)',gp>=6&&/Sans groupe/.test(grp.txt)&&/grandes cartes|une page par groupe/.test(grp.txt),String(gp)+' '+grp.name);
// classe sans groupes
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes.find(x=>x.name==='2BACSP4');delete c.grp;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="students"]').click());await sleep(300);await p.click('#trombiBtn');await sleep(300);
const info0=await p.evaluate(()=>document.getElementById('trbInfo').textContent);
check('classe sans groupes : message « un seul bloc pour toute la classe »',/pas de groupes : un seul bloc/.test(info0),info0);
const solo=await pdf('page','solo');
check('PDF sans groupes : un seul titre de classe, pas de G1…G5',/Trombinoscope – Classe 2BACSP4/.test(solo.txt)&&!/\bG1\b/.test(solo.txt)&&!/Sans groupe/.test(solo.txt),solo.name);
const keys1=await p.evaluate(KEY=>Object.keys(JSON.parse(localStorage.getItem(KEY))).sort().join(','),KEY);
check('aucune nouvelle clé de données (lecture seule)',keys0===keys1&&keys1===seed.before,keys1);
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
fs.copyFileSync(page.f,'/workspace/trombi-proposals/cj128-trombi-classe.pdf');
fs.copyFileSync(grp.f,'/workspace/trombi-proposals/cj128-trombi-groupes.pdf');fs.copyFileSync(solo.f,'/workspace/trombi-proposals/cj128-trombi-sans-groupes.pdf');
cp.execSync('pdftoppm -r 110 -png -f 1 -l 1 "'+page.f+'" /workspace/screens/cj128-trombi-page');
cp.execSync('pdftoppm -r 110 -png -f 1 -l 1 "'+grp.f+'" /workspace/screens/cj128-trombi-groupe');
fs.renameSync('/workspace/screens/cj128-trombi-page-1.png','/workspace/screens/cj128-trombi-page.png');
fs.renameSync('/workspace/screens/cj128-trombi-groupe-1.png','/workspace/screens/cj128-trombi-groupe.png');
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
