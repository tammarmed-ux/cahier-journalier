/* v1.28.0 (-g) : photo personnelle de l’élève — mode local (IndexedDB « cahier-photos ») : ajout / remplacement / suppression,
   recadrage + compression (≤ 25 Ko, 256 px), place dans la fiche (en face de Classe / Code / Sexe / Naissance), avatars de la liste,
   persistance, classRegister.v2 inchangé, sauvegarde JSON inchangée, fichier de photos à part, PDF fiche. Images : illustrations générées (aucune vraie personne). */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';const IMG=__dirname+'/phimg/';const SHOT=process.env.SHOT||'';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8023);
(async()=>{
const DL='/tmp/v28p-dl';fs.rmSync(DL,{recursive:true,force:true});fs.mkdirSync(DL);
if(!fs.existsSync('/tmp/phimg/noise.jpg'))cp.execSync(`python3 -c "import os;from PIL import Image;Image.frombytes('RGB',(1500,2000),os.urandom(9000000)).resize((3000,4000)).save('/tmp/phimg/noise.jpg',quality=95)"`);
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:90000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:375,height:812,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const cdp=await p.target().createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:DL,browserContextId:ctx.id}).catch(async()=>{await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:DL});});
const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text());});p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto('http://localhost:8023/?emu=1',{waitUntil:'networkidle2'});
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';const c=d.classes.find(x=>x.name==='2BACSP4');
  const N=['العلوي عبد الرحيم بن محمد','بامعروف ياسين','رؤوفي سلمى','مسناوي إيمان','AIT BENALI Yassine','BENNANI Salma'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'2008-0'+(i+1)+'-1'+i,parent:'',phone:'',notes:'',created:1}));d.ui.cls=c.id;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const goTab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(350);};
const closeAll=()=>p.evaluate(()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';});
const fiche=async id=>{await closeAll();await goTab('students');await p.evaluate(id=>document.querySelector('.stu[data-id="'+id+'"]').click(),id);await sleep(400);};
const idb=()=>p.evaluate(()=>new Promise(res=>{const r=indexedDB.open('cahier-photos');r.onsuccess=()=>{const d=r.result,t=d.transaction(['p','q'],'readonly'),o={};t.objectStore('p').getAll().onsuccess=e=>o.p=e.target.result.map(x=>({id:x.id,t:x.t,n:x.d.length,d:x.d.slice(0,30),w:0,full:x.d}));t.objectStore('q').getAll().onsuccess=e=>o.q=e.target.result;t.oncomplete=()=>res(o);};}));
const dims=d=>p.evaluate(d=>new Promise(res=>{const i=new Image();i.onload=()=>res(i.naturalWidth+'x'+i.naturalHeight);i.onerror=()=>res('err');i.src=d;}),d);
await goTab('students');const LS0=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);
await fiche('s0');
const L=await p.evaluate(()=>{const b=document.getElementById('detPhoto'),dl=document.querySelector('#detBody .idcard .kv'),sh=document.querySelector('#detBody');const rb=b.getBoundingClientRect(),rd=dl.getBoundingClientRect();
  return {txt:b.textContent,w:Math.round(rb.width),h:Math.round(rb.height),side:rd.right<=rb.left+0.5&&rb.top<rd.bottom,dts:[...dl.querySelectorAll('dt')].map(x=>x.textContent),over:sh.scrollWidth>sh.clientWidth+1,in375:rb.right<=375,rest:[...document.querySelectorAll('#detBody .kv2 dt')].map(x=>x.textContent)};});
check('fiche : case photo « Ajouter une photo » EN FACE de Classe / Code élève / Sexe / Date de naissance ('+L.w+'×'+L.h+' px), rien ne déborde à 375 px (nom arabe long)',/Ajouter une photo/.test(L.txt)&&L.side&&L.w>=88&&L.w<=110&&L.h===L.w&&L.dts.join('|')==='Classe|Code élève|Sexe|Date de naissance'&&!L.over&&L.in375,JSON.stringify(L));
await p.click('#detPhoto');await sleep(300);
const M=await p.evaluate(()=>({open:document.getElementById('phMenu').classList.contains('open'),b:[...document.querySelectorAll('#phMenu .phm .btn')].filter(x=>!x.classList.contains('hidden')).map(x=>x.textContent),cap:document.getElementById('phCam').getAttribute('capture'),acc:document.getElementById('phGal').accept,sub:document.getElementById('phMenuSub').textContent}));
check('appui sur la case → menu « Prendre une photo » (appareil photo) / « Choisir dans la galerie » (sans « Supprimer » tant qu’il n’y a pas de photo)',M.open&&M.b.join('|')==='📷 Prendre une photo|🖼 Choisir dans la galerie|Annuler'&&M.cap==='environment'&&M.acc==='image/*',JSON.stringify(M));
if(SHOT){await p.evaluate(()=>window.scrollTo(0,0));await sleep(400);await p.screenshot({path:'/tmp/v28p-menu0.png'});}
// galerie
const up=async(sel,file)=>{const el=await p.$(sel);await el.uploadFile(file);await p.waitForFunction(()=>document.getElementById('phCrop').classList.contains('open'),{timeout:15000});await sleep(250);};
await up('#phGal',IMG+'a1.jpg');
const C=await p.evaluate(()=>({menu:document.getElementById('phMenu').classList.contains('open'),z:document.getElementById('phZoom').value,w:Math.round(document.getElementById('phWrap').getBoundingClientRect().width)}));
check('image choisie → fenêtre « Recadrer la photo » (carré '+C.w+' px, zoom, glisser)',!C.menu&&C.z==='1'&&C.w>=250&&C.w<=280,JSON.stringify(C));
await p.evaluate(()=>{const z=document.getElementById('phZoom');z.value='1.4';z.dispatchEvent(new Event('input',{bubbles:true}));});
const wr=await p.$eval('#phWrap',e=>{const r=e.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};});
await p.mouse.move(wr.x,wr.y);await p.mouse.down();await p.mouse.move(wr.x+30,wr.y+40,{steps:5});await p.mouse.up();
if(SHOT){await sleep(300);await p.screenshot({path:'/tmp/v28p-crop.png'});}
await p.click('#phSave');await sleep(800);
let I=await idb();const r0=I.p.find(x=>x.id==='s0');
const bytes0=r0?Math.floor((r0.n-r0.full.indexOf(',')-1)*3/4):0;const dm0=r0?await dims(r0.full):'';
check('enregistrée dans IndexedDB « cahier-photos » : JPEG '+dm0+', '+(bytes0/1024).toFixed(1)+' Ko (≤ 25 Ko), envoi en attente noté',!!r0&&/^data:image\/jpeg;base64,/.test(r0.d)&&dm0==='256x256'&&bytes0<=25600&&I.q.some(x=>x.id==='s0'),JSON.stringify({d:r0&&r0.d,dm0,bytes0,q:I.q}));
const F1=await p.evaluate(()=>{const b=document.getElementById('detPhoto'),av=document.querySelector('#detBody .sheet-head .avatar');return {has:b.classList.contains('has'),img:!!b.querySelector('img'),av:!!av.querySelector('img'),crop:document.getElementById('phCrop').classList.contains('open')};});
check('fiche : la photo remplace la silhouette, mini-photo à la place des initiales en haut',F1.has&&F1.img&&F1.av&&!F1.crop,JSON.stringify(F1));
const LS1=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);
check('classRegister.v2 strictement identique (aucun octet ajouté, aucune image)',LS1===LS0&&!/data:image/.test(LS1),LS0.length+' → '+LS1.length);
// remplacement (appareil photo)
await p.click('#detPhoto');await sleep(300);
const hasDel=await p.evaluate(()=>!document.getElementById('phDel').classList.contains('hidden'));
await up('#phCam',IMG+'a2.jpg');await p.click('#phSave');await sleep(800);
I=await idb();const r1=I.p.find(x=>x.id==='s0');
check('remplacer (« Prendre une photo ») : nouvelle image, même élève, une seule entrée ; « Supprimer » proposé',hasDel&&r1&&r1.full!==r0.full&&r1.t>r0.t&&I.p.filter(x=>x.id==='s0').length===1,JSON.stringify({hasDel,t0:r0.t,t1:r1&&r1.t}));
// pire cas : bruit 3000×4000
await closeAll();await fiche('s1');await p.click('#detPhoto');await sleep(300);await up('#phGal','/tmp/phimg/noise.jpg');await p.click('#phSave');await sleep(1500);
I=await idb();const rn=I.p.find(x=>x.id==='s1');const bn=rn?Math.floor((rn.n-rn.full.indexOf(',')-1)*3/4):0;const dmn=rn?await dims(rn.full):'';
check('pire cas (bruit 3000×4000, 11 Mo) : compressée à '+(bn/1024).toFixed(1)+' Ko ('+dmn+') ≤ 25 Ko',!!rn&&bn<=25600&&bn>0,dmn);
for(const [id,f] of [['s2','a3.jpg'],['s3','a4.jpg'],['s4','a5.jpg']]){await closeAll();await fiche(id);await p.click('#detPhoto');await sleep(250);await up('#phGal',IMG+f);await p.click('#phSave');await sleep(700);}
// remet une illustration pour s1 (la photo « bruit » n’a servi qu’au test de taille)
await closeAll();await fiche('s1');await p.click('#detPhoto');await sleep(250);await up('#phGal',IMG+'a2.jpg');await p.click('#phSave');await sleep(700);
await closeAll();await goTab('students');await sleep(600);
const LI=await p.evaluate(()=>[...document.querySelectorAll('#stuList li.stu')].map(li=>li.dataset.id+':'+(li.querySelector('.avatar img')?'img':li.querySelector('.avatar').textContent)));
check('liste des élèves : avatar rond avec la photo (42 px, même place que les initiales), initiales sinon',LI.filter(x=>/:img$/.test(x)).length===5&&LI.some(x=>/^s5:[^i]/.test(x)),LI.join(' '));
if(SHOT){await p.evaluate(()=>window.scrollTo(0,0));await sleep(2900);await p.screenshot({path:'/tmp/v28p-list.png'});}
// persistance
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(600);await fiche('s0');await sleep(500);
const P2=await p.evaluate(()=>({img:!!document.querySelector('#detPhoto img'),known:window.CJR.photo.known().sort().join(',')}));
check('persistance après rechargement : photos relues depuis IndexedDB (fiche + liste)',P2.img&&P2.known==='s0,s1,s2,s3,s4',JSON.stringify(P2));
if(SHOT){await p.evaluate(()=>{document.getElementById('detModal').querySelector('.sheet').scrollTop=0;});await sleep(500);await p.screenshot({path:'/tmp/v28p-fiche.png'});
  await p.click('#detPhoto');await sleep(400);await p.screenshot({path:'/tmp/v28p-menu.png'});await closeAll();await fiche('s0');await sleep(400);}
// PDF fiche avec photo
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return btoa(s);});
  const f='/tmp/v28p_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r,'base64'));return f;}
const nimg=f=>cp.execSync('pdfimages -list '+f+' | tail -n +3 | wc -l').toString().trim();
const pf1=await pdf(()=>document.getElementById('detPdf').click());fs.copyFileSync(pf1,'/tmp/v28p-fiche.pdf');
await closeAll();await fiche('s5');const pf0=await pdf(()=>document.getElementById('detPdf').click());
check('PDF fiche élève : photo en face des informations (1 image de plus que sans photo)',+nimg(pf1)===+nimg(pf0)+1,nimg(pf0)+' → '+nimg(pf1));
// sauvegarde JSON inchangée + fichier de photos à part
await closeAll();await goTab('settings');
await p.evaluate(()=>document.getElementById('bkExport').click());await sleep(1200);
await p.evaluate(()=>document.getElementById('phExport').click());await sleep(1200);
const files=fs.readdirSync(DL);const bk=files.find(f=>/^cahier-journalier_\d|sauvegarde|backup/i.test(f)&&!/photos/.test(f))||files.find(f=>!/photos/.test(f));const pf=files.find(f=>/photos/.test(f));
const bkT=bk?fs.readFileSync(DL+'/'+bk,'utf8'):'';const phJ=pf?JSON.parse(fs.readFileSync(DL+'/'+pf,'utf8')):null;
check('sauvegarde JSON du cahier inchangée : aucune photo dedans',!!bk&&!/data:image|cahier-photos/.test(bkT)&&JSON.parse(bkT).students.length===6,files.join(','));
check('« Exporter les photos » : fichier SÉPARÉ '+pf+' (app cahier-photos, 5 photos, '+(pf?Math.round(fs.statSync(DL+'/'+pf).size/1024):0)+' Ko)',!!phJ&&phJ.app==='cahier-photos'&&phJ.photos.length===5&&phJ.photos.every(x=>/^data:image\/jpeg/.test(x.d)&&x.name),'');
// suppression
await fiche('s0');await p.click('#detPhoto');await sleep(300);await p.click('#phDel');await sleep(800);
I=await idb();const D1=await p.evaluate(()=>({ph:document.getElementById('detPhoto').textContent,av:document.querySelector('#detBody .sheet-head .avatar').textContent,menu:document.getElementById('phMenu').classList.contains('open')}));
check('supprimer (avec confirmation) : photo effacée de l’appareil, suppression en attente d’envoi, silhouette + initiales revenues',!I.p.some(x=>x.id==='s0')&&I.q.some(x=>x.id==='s0')&&/Ajouter une photo/.test(D1.ph)&&D1.av.length<=2&&!D1.menu,JSON.stringify(D1));
// import du fichier de photos
await closeAll();await goTab('settings');const fe=await p.$('#phFile');await fe.uploadFile(DL+'/'+pf);await sleep(1500);
I=await idb();check('« Importer des photos » (fichier à part) : photo de s0 restaurée',I.p.some(x=>x.id==='s0')&&I.p.length===5,I.p.map(x=>x.id).join(','));
const canon=v=>JSON.stringify(v,(k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.keys(x).sort().reduce((a,k)=>(a[k]=x[k],a),{}):x);
const LS2=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);const o0=JSON.parse(LS0),o2=JSON.parse(LS2);
check('classRegister.v2 : élèves, classes, séances identiques après toutes les opérations photo (ordre des champs ignoré : la sauvegarde JSON renormalise)',canon(o0.students)===canon(o2.students)&&canon(o0.sessions)===canon(o2.sessions)&&canon(o0.classes)===canon(o2.classes)&&!/data:image/.test(LS2),'');
check('mode local (sans compte) : aucune erreur de page ni de console',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
