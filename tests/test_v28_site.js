/* v1.28.0 : notes /20 (OP 2007) additives ; note comportementale par niveau (TC 5 · 1BAC 4 · 2BAC 3) ; logo B, marque, site, SEO, connexion ; aucune régression de données (mise à jour v1.27.0 → v1.28.0) */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const seed=require('./seed_v24.js');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy/';
const P='cahier-journalier-2830a',AUTH='http://127.0.0.1:9099',FS='http://127.0.0.1:8080',URL='http://localhost:8000/?emu=1';
async function j(url,opt){const r=await fetch(url,opt);const t=await r.text();try{return JSON.parse(t);}catch(e){return t;}}
const IP={width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true},DT={width:1280,height:800,deviceScaleFactor:1};
function pngSize(f){const b=fs.readFileSync(f);return [b.readUInt32BE(16),b.readUInt32BE(20)];}
(async()=>{
const idx=fs.readFileSync(D+'index.html','utf8');
// ================= 1. SEO / HTML statique =================
const head=idx.slice(0,idx.indexOf('</head>'));
check('<html lang="fr">',/<html lang="fr"/.test(idx));
check('titre SEO exact',head.includes('<title>Cahier Journalier EPS — registre d’absences et bilans pour professeurs d’EPS au Maroc</title>'));
const desc=(head.match(/<meta name="description" content="([^"]+)"/)||[])[1]||'';
check('meta description réelle (~150 caractères)',desc.length>=130&&desc.length<=165&&/EPS/.test(desc),desc.length+' : '+desc);
const og=k=>(head.match(new RegExp('<meta property="og:'+k+'" content="([^"]+)"'))||[])[1];
check('og:title, og:description, og:type website, og:url canonique',!!og('title')&&og('description')===desc&&og('type')==='website'&&og('url')==='https://cahier-eps-ma.web.app/');
check('og:image URL absolue 1200x630',og('image')==='https://cahier-eps-ma.web.app/og-image-b.png'&&og('image:width')==='1200'&&og('image:height')==='630'&&pngSize(D+'og-image-b.png').join('x')==='1200x630');
check('twitter:card summary_large_image + image',/<meta name="twitter:card" content="summary_large_image">/.test(head)&&/<meta name="twitter:image" content="https:\/\/cahier-eps-ma\.web\.app\/og-image-b\.png">/.test(head));
check('canonical + theme-color',head.includes('<link rel="canonical" href="https://cahier-eps-ma.web.app/">')&&head.includes('<meta name="theme-color" content="#0B3A6E">'));
let ld=null;try{ld=JSON.parse((head.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)||[])[1]);}catch(e){}
check('JSON-LD valide SoftwareApplication',!!ld&&ld['@context']==='https://schema.org'&&ld['@type']==='SoftwareApplication'&&ld.name&&ld.description&&ld.applicationCategory==='EducationalApplication'&&ld.operatingSystem==='Web, iOS, Android'&&ld.inLanguage==='fr'&&ld.url==='https://cahier-eps-ma.web.app/');
check('JSON-LD offre gratuite sur invitation (0 MAD), sans note/avis inventés',ld&&ld.offers&&ld.offers.price==='0'&&ld.offers.priceCurrency==='MAD'&&/invitation/.test(ld.offers.description)&&!ld.aggregateRating&&!ld.review);
check('un seul <h1> dans le HTML',(idx.match(/<h1[\s>]/g)||[]).length===1);
const land=idx.slice(idx.indexOf('<div id="landing">'),idx.indexOf('<!-- Login gate'));
check('page d’accueil en HTML statique (h1, 2 boutons, 4–6 fonctions, confiance, pied)',/<h1 class="ln-h1">/.test(land)&&/id="lnLogin"[^>]*>[\s\S]*?Se connecter/.test(land)&&/id="lnFeat"[^>]*>[\s\S]*?Voir les fonctions/.test(land)&&(n=>n>=4&&n<=6)((land.match(/class="ln-card"/g)||[]).length)&&/Accès sur invitation/.test(land)&&/Sauvegarde JSON/.test(land)&&/id="lnVer">Version 1\.28\.0</.test(land));
check('pas de faux chiffres ni faux témoignages',!/témoignage|avis client|\d+\s?(utilisateurs|enseignants|professeurs|écoles)|★|⭐/i.test(land));
const robots=fs.readFileSync(D+'robots.txt','utf8'),smap=fs.readFileSync(D+'sitemap.xml','utf8');
check('robots.txt (Allow /, Sitemap) + sitemap.xml (URL canonique)',/User-agent: \*/.test(robots)&&/Allow: \//.test(robots)&&/Sitemap: https:\/\/cahier-eps-ma\.web\.app\/sitemap\.xml/.test(robots)&&/<loc>https:\/\/cahier-eps-ma\.web\.app\/<\/loc>/.test(smap));
const man=JSON.parse(fs.readFileSync(D+'manifest.webmanifest','utf8'));
const iconOk=man.icons.filter(i=>/png$/.test(i.src)).every(i=>pngSize(D+i.src).join('x')===i.sizes);
check('manifeste : icônes 192/512 + maskable, couleurs, v1.28.0',iconOk&&man.icons.some(i=>i.purpose==='maskable'&&i.sizes==='512x512')&&man.theme_color==='#0B3A6E'&&!!man.background_color&&/v1\.28\.0/.test(man.name));
check('favicon ico/svg/png 32 + apple-touch-icon 180',fs.existsSync(D+'favicon.ico')&&fs.existsSync(D+'icons/favicon-b.ico')&&fs.existsSync(D+'icons/favicon-b.svg')&&pngSize(D+'icons/favicon-b-32.png').join('x')==='32x32'&&pngSize(D+'icons/apple-touch-icon-b.png').join('x')==='180x180'&&/rel="apple-touch-icon" sizes="180x180" href="icons\/apple-touch-icon-b\.png"/.test(head));
const lg=fs.readFileSync(D+'icons/logo-b.svg','utf8'),fv=fs.readFileSync(D+'icons/favicon-b.svg','utf8');
check('logo B : coureur orange #E85D04 + piste courbe, carré bleu #0B3A6E, sans livre ; logo.jpg conservé',/#0B3A6E/.test(lg)&&/#E85D04/.test(lg)&&/stroke="url\(#tr\)"/.test(lg)&&/rx="112"/.test(lg)&&!/url\(#pg\)/.test(lg)&&fs.existsSync(D+'logo.jpg'));
check('favicon.svg : piste épaissie (visible en 32 px), sans livre',/stroke-width="30"/.test(fv)&&/#E85D04/.test(fv)&&!/url\(#pg\)/.test(fv));
check('marque « Cahier d’EPS » partout (accueil, connexion, en-tête, splash, pied, manifeste, JSON-LD, og:site_name) ; plus aucun « Cahier EPS »',(idx.match(/Cahier d’<b>EPS<\/b>/g)||[]).length===5&&!/Cahier EPS|Cahier <b>EPS<\/b>/.test(idx)&&man.short_name==='Cahier d’EPS'&&/^Cahier d’EPS v1\.28\.0$/.test(man.name)&&ld.name==='Cahier d’EPS'&&/<meta property="og:site_name" content="Cahier d’EPS">/.test(head)&&/<meta name="apple-mobile-web-app-title" content="Cahier d’EPS">/.test(head)&&!/Cahier EPS/.test(fs.readFileSync(D+'cj-pdf.js','utf8')));
const sw=fs.readFileSync(D+'sw.js','utf8');
check('sw.js cahier-v28 met en cache logo (dont logo PDF), favicons, icônes, image og',/CACHE = 'cahier-v28(-[a-z])?'/.test(sw)&&['icons/logo-b.svg','icons/logo-b-pdf.png','icons/favicon-b.svg','icons/favicon-b.ico','icons/favicon-b-32.png','favicon.ico','og-image-b.png','icons/icon-b-192.png','icons/icon-b-512.png','icons/maskable-b-192.png','icons/maskable-b-512.png','icons/apple-touch-icon-b.png'].every(f=>sw.includes("'./"+f+"'")));
const fj=JSON.parse(fs.readFileSync(D+'firebase.json','utf8')).hosting.ignore;
check('firebase.json exclut .git/.firebase/tests/RELEASE/backups, sert robots/sitemap',['.git','**/.*/**','tests','RELEASE*','backups','**/backups/**'].every(x=>fj.includes(x))&&!fj.some(x=>/robots|sitemap/.test(x)));
// ================= 2. Preuve : clés de stockage et logique inchangées par rapport à v1.27.0 =================
const old=cp.execSync('git -C '+D+' show v1.27.0:index.html',{maxBuffer:1e8}).toString();
const keys=h=>[...new Set((h.match(/['"](classRegister\.v2[\w.]*|cahier\.[A-Za-z][\w.]*)['"]/g)||[]).map(x=>x.slice(1,-1)))].sort();
check('clés localStorage/IndexedDB identiques à v1.27.0',JSON.stringify(keys(old))===JSON.stringify(keys(idx)),keys(idx).join(','));
const scr=h=>{const o=[];h.replace(/<script(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g,(m,c)=>{o.push(c);});return o.join('\n').split('\n').map(l=>l.trim()).filter(Boolean);};
const cnt=a=>{const m=new Map();a.forEach(l=>m.set(l,(m.get(l)||0)+1));return m;};
/* v1.28.0 (-g) : module photo (bloc PHOTO-BEGIN…PHOTO-END) audité à part ci-dessous */
const PHB=(idx.match(/\/\*PHOTO-BEGIN\*\/([\s\S]*?)\/\*PHOTO-END\*\//)||['',''])[1];const idxNP=idx.replace(/\/\*PHOTO-BEGIN\*\/[\s\S]*?\/\*PHOTO-END\*\//,'');
const A=cnt(scr(old)),B=cnt(scr(idxNP));
const rem=[...A].filter(([l,n])=>(B.get(l)||0)<n).map(x=>x[0]),add=[...B].filter(([l,n])=>(A.get(l)||0)<n).map(x=>x[0]);
const REM_OK=["var sx=String(s.sex||'').toUpperCase();","Object.keys(s).forEach(function(k){if(!(k in o)&&k!=='sex'","var APP_SEMVER=","var APP_VER=","document.querySelectorAll('#view-attendance .seg button')","renderGrpBox();","var h='<table class=\"grid\"><thead>","h+='<th class=\"t\" title=\"Absences du cycle\">Abs.</th>","cols.forEach(function(c){if(c.hol&&si)return;h+='<td></td>';});","h+='</tbody><tfoot><tr><th class=\"nm\">Absents</th>';","h+='<td></td><td></td><td></td><td></td><td class=\"yr\"></td></tr></tfoot></table>';","return t(st.A,st.U>=th?' bad':'')","tr.classList.toggle('flag',yearStat(DB.ui.cls,sid).U>=DB.settings.threshold);","$('attClass').addEventListener('change'","cmpStu:cmpStu,sidKey:sidKey"];
/* v1.28.0 (-d) : numéro de séance affiché en continu (fériés compris) — mêmes lignes, seul le libellé (s+1) devient sessNo(…) */
const NRM=l=>l.replace(/sessNo\([^()]*\)/g,'N').replace(/\((?:\w+\.)?(?:s|sessS)\+1\)/g,'N');
const addN=new Set(add.map(NRM)),remN=new Set(rem.map(NRM));const labelOnly=l=>addN.has(NRM(l));
/* v1.28.0 (-d/-e) : en-tête férié « S<n> » (au lieu de « Férié »), vacances : date seule et type de cycle à côté de chaque nom de cycle (Paramètres) */
REM_OK.push("h+='<h3 style=\"margin-top:4px\">Informations personnelles</h3><dl class=\"kv\"><dt>Classe</dt>");   /* v1.28.0 (-g) : carte d’identité + photo */
REM_OK.push("cols.forEach(function(c){if(c.hol){h+='<th class=\"holh\" title=\"'+esc(c.hol.label)+'\">'","$('periodNames').innerHTML=DB.periods.map(function(n,i){return '<label class=\"cyrow\">","$('periodNames').addEventListener('change',function(e){var i=+e.target.dataset.pi,v=e.target.value.trim()");
REM_OK.push("h+='<div class=\"card\" id=\"ttCard\"><h2>'+esc(TX.ttTitle)+'</h2>","'</div><p class=\"small muted\">'+esc(TX.ttHelp)+'</p><div class=\"week\">';","for(var d=1;d<=6;d++){var sl=DB.cal.tt.filter(function(x){return x.day===d;}).sort(byStart);","h+='<div class=\"wk-row\">","h+='<div class=\"ttform\" id=\"ttForm\"><h3>'");   /* v1.28.0 (-h) : tableau de service modernisé (purement visuel) */
REM_OK.push("if(nx.length)h+='<h3>'+esc(TX.nextSess)+'</h3>'+occList(nx);");   /* v1.28.0 (-i) : carte « Aujourd’hui » = séances du jour seulement */
REM_OK.push("$('attView').addEventListener('click',function(e){var b=e.target.closest('[data-v]');");   /* v1.28.0 (-i) : bascule Absences | Notes /20 retirée */
REM_OK.push("function tile(v,l,c){return '<div class=\"stat'","h+='<div class=\"card\" id=\"homeStats\"><h2>'+esc(TX.statsTitle)+'</h2><div class=\"stats s3\">'","'<div class=\"stats s4\" style=\"margin-top:8px\">'+tile(T.A,TX.tAbs,'bad')");   /* v1.28.0 (-k) : Statistiques globales modernisées (homeStatsHtml), tuile AJ retirée */
const okTT=add.some(l=>l.startsWith("h+='<div class=\"card\" id=\"ttCard\"><div class=\"tw-h\"><h2>'+esc(TX.ttTitle)+'</h2><button type=\"button\" class=\"tw-add\" data-ttadd=\"1\"")&&l.includes('id=\"svcBox\"')&&l.includes('<b id=\"svcTot\">'))&&add.some(l=>l.startsWith("if(DB.cal.tt.length)for(var d=1;d<=6;d++)h+=ttDayHtml(d,DB.cal.tt.filter(function(x){return x.day===d;}).sort(byStart));"))&&add.some(l=>l.startsWith("h+='<div class=\"ttform'+(e?' edit':'')+'\" id=\"ttForm\"><h3>'"));
const okPhotoFiche=add.some(l=>l.startsWith("h+='<h3 style=\"margin-top:4px\">Informations personnelles</h3><div class=\"idcard\"><dl class=\"kv\"><dt>Classe</dt>"));
const okRem=okPhotoFiche&&okTT&&rem.every(l=>labelOnly(l)||REM_OK.some(x=>l.startsWith(x)))&&add.some(l=>/class=\"holh/.test(l)&&/'S'\+NO\[ci\]\)\+'<small>/.test(l)&&/^var NO=colNos\(cid,p\);cols\.forEach/.test(l))&&add.some(l=>/DB\.periods\[i\]=v;persistNow\(\);calReset\(\)/.test(l))&&add.some(l=>/^function sessNo\(cid,p,s\)\{var cols=colsOf\(cid,p\)/.test(l));
/* chaque ligne retirée a sa remplaçante (mêmes compteurs Abs./R/AJ/Pts dans l’affichage Absences, normalisation élève + ev) */
const okAdd=add.some(l=>l.startsWith("return t(st.A,st.U>=th?' bad':'')+t(st.L)+t(st.J)+'<td class=\"t pts'"))&&add.some(l=>l.includes("&&k!=='ev'&&"))&&add.some(l=>/var ev=normEv\(s\.ev\);if\(ev\)o\.ev=ev;/.test(l));
const noWrite=add.every(l=>!/setItem|removeItem|indexedDB|\.clear\(|F\.doc|setDoc|writeBatch|applyJSON|resetLocal|DB\.(?!evals\b|ui\.)[\w.]+\s*=[^=]|DB\.(?!evals\b)\w+\.(push|splice)|sessions\[[^\]]*\]\s*=|\.marks\[[^\]]*\]\s*=|\.marks\.\w+\s*=[^=]|delete\s+(?!e\[[kf]\]|e\.(pr|perfRaw|perfAuto|prodAuto|perfEvent)\b|s\.ev|DB\.evals\.(evt|ntr|aps)\[)/.test(l)||remN.has(NRM(l))||l.startsWith("window.CJR.photoData=function(id){return PH.cur&&PH.cur.id===id?PH.cur.d:null;};window.CJR.photoAll=function(){try{if(!window.indexedDB)return Promise.resolve({});return phAll('p').then(function(a){var o={};(a||[]).forEach(function(x){if(x&&x.id&&phOk(x.d))o[x.id]=x.d;});return o;}).catch(function(){return {};});}catch(e){return Promise.resolve({});}};"));   /* v1.28.0 (-l) : trombinoscope — lecture des photos (IndexedDB cahier-photos), aucune écriture */
check('logique JS : lignes retirées limitées à la version, aux colonnes de synthèse (déplacées dans sumHead/sumFoot/totalsHtml) et à la normalisation élève (+ ev) ('+rem.length+' retirées, '+add.length+' ajoutées)',okRem&&okAdd,JSON.stringify(rem.filter(l=>!labelOnly(l)&&!REM_OK.some(x=>l.startsWith(x)))).slice(0,300));
check('aucune écriture ajoutée sur les séances, marques, classes ou réglages : seules s.ev (notes de l’élève) et DB.evals (APS) sont écrites',noWrite,JSON.stringify(add.filter(l=>/DB\.(?!evals\b|ui\.)[\w.]+\s*=[^=]|delete\s/.test(l))).slice(0,300));
/* v1.28.0 (-g) : module photo : IndexedDB « cahier-photos » + users/{uid}/photos uniquement ; ni classRegister.v2, ni localStorage, ni DB.*, ni cahier/meta|chunk */
const phIdbNames=[...PHB.matchAll(/indexedDB\.open\('([^']+)'/g)].map(m=>m[1]),phDocs=[...PHB.matchAll(/F\.(?:doc|collection)\(S\.db,([^)]*)\)/g)].map(m=>m[1]);
check('module photo : seulement IndexedDB « cahier-photos » et Firestore users/{uid}/photos ; aucune écriture dans classRegister.v2 / localStorage / DB.* / cahier',PHB.length>2000&&phIdbNames.join()==='cahier-photos'&&phDocs.length>0&&phDocs.every(x=>/^'users',uid,'photos'/.test(x))&&!/localStorage|setItem|removeItem|persist\(|persistNow|DB\.\w+(\.\w+)*\s*=[^=]|DB\.\w+\.(push|splice)|delete\s+DB|'cahier'|chunk_|KEY\b/.test(PHB),JSON.stringify({phIdbNames,phDocs}));
/* v1.28.0 : cj-pdf.js — ajout du relevé de notes */
const pOld=cp.execSync('git -C '+D+' show v1.27.0:cj-pdf.js',{maxBuffer:1e8}).toString().split('\n'),pNew=fs.readFileSync(D+'cj-pdf.js','utf8').split('\n');
/* v1.28.0 (-d) : libellés de séance S1, S2… en continu (fériés compris) : registre, graphique, tableau des fériés, liste détaillée, historique élève */
const PDF_SNO=["cids.forEach(function(cid){ps.forEach(function(p){A.colsOf(cid,p).forEach(function(c){","else txt=C(pl(n,'séance')+' : '+e.cols.map(","A.colsOf(cid,p).forEach(function(col){","if(col.hol){if(prev&&prev.hol&&prev.hol.id===col.hol.id){prev.n++;return;}","out.push({l:'S'+(s+1)","var holIdx={};cols.forEach(function(c,i){if(c.hol){holIdx[2+i]=c.hol;head.push(","var dsp={},hrow={};y=table(d,y,head,rows.map(function(r,i){if(r.hol){","if(r.dsp)dsp[i]=1;var row=[r.sd?A.dmy(r.sd):'—','C'+(r.p+1),'S'+(r.s+1)];","else y=table(d,y,['Date','Cycle','Séance','Classe','Statut','Motif'],hist.map(function(x,i){if(x.hol){","function xLabels(d,px,py,pw,cats){","y=table(d,y,null,body,{fs:7.8,"];
const PA=cnt(pOld),PB=cnt(pNew),prem=[...PA].filter(([l,n])=>(PB.get(l)||0)<n).map(x=>x[0]),padd=[...PB].filter(([l,n])=>(PA.get(l)||0)<n).map(x=>x[0]);
const PDF_TRB=["/* ================= 1.28.0 (-l) : trombinoscope","var PHOTOS={};","function loadPhotos(){return (A.photoAll","function ageAt(dob,ref){","function ageTxt(s){","function dmyT(){","function silhouette(d,x,y,w,h){","function photo(d,s,x,y,w,h,r,bc){","function nameLines(d,s,w,size){","function lines(d,ls,cx,y,size,lh,col,bold){","function trSets(cid){","function fg(list){","function trMeta(cid,mode){","/* blocs colorés : un bloc par groupe","function trombiPage(d,y,sets){","function trombiGroupPages(d,y,sets,cname){","function trombi(o){","var REP={cycle:repCycle","return Promise.all([loadLogo(),HAS_AR?loadFonts(A.db().settings.arFont)"];
check('cj-pdf.js : relevé de notes ajouté (repGrades) et trombinoscope (trombi), aucune autre ligne retirée que l’enregistrement REP et les libellés de séance ('+prem.length+' retirées, '+padd.length+' ajoutées)',prem.every(l=>/^var REP=\{cycle:repCycle/.test(l)||PDF_SNO.some(x=>l.trim().startsWith(x))||PDF_TRB.some(x=>l.trim().startsWith(x)))&&prem.some(l=>/^var REP=\{cycle:repCycle/.test(l))&&padd.some(l=>/head\.push\(\(NO\[i\]\?'S'\+NO\[i\]:''\)/.test(l))&&padd.some(l=>/var ph=A\.photoData&&A\.photoData\(s\.id\)/.test(l))&&padd.some(l=>/^function xLabels\(.*if\(c\.l\)T\(d,c\.l,/.test(l))&&padd.some(l=>/grades:repGrades/.test(l))&&padd.some(l=>/trombi:trombi/.test(l))&&padd.every(l=>!/setItem|removeItem|indexedDB|setDoc|writeBatch/.test(l)),JSON.stringify({prem}).slice(0,300));
const lp=require('child_process').execSync('python3 -c "from PIL import Image;i=Image.open(\''+D+'icons/logo-b-pdf.png\');print(i.mode,i.size[0],i.size[1],i.getpixel((1,1))[3],i.getpixel((180,180))[3])"').toString().trim();
check('icons/logo-b-pdf.png : logo B 360 px, coins transparents (pas de carré blanc/rose)',lp==='RGBA 360 360 0 255',lp);
check('Firestore : mêmes chemins (users/{uid}/cahier/meta, chunk_i, members, profiles)',['function metaRef(uid){','function chunkRef(uid,i){','function memberRef(email){','function profileRef(uid){'].every(f=>{const g=h=>(h.split('\n').find(l=>l.includes(f))||'').trim();return g(old)&&g(old)===g(idx);}));
// ================= 3. Navigateur =================
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const errs=[];
async function newPage(vp,{onb=true}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport(vp);p.ctx=ctx;
  p.on('pageerror',e=>errs.push(e.message));if(onb)await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
  await p.evaluateOnNewDocument(()=>{document.addEventListener('DOMContentLoaded',()=>{window.__dcl={land:document.documentElement.classList.contains('cj-land'),locked:document.documentElement.classList.contains('cj-locked')};});});
  p.on('dialog',d=>d.accept());return p;}
const st=p=>p.evaluate(()=>{const H=document.documentElement,l=document.getElementById('landing'),g=document.getElementById('gate'),m=document.querySelector('main');const r=l.getBoundingClientRect();
  const h1=[...document.querySelectorAll('h1')];
  return {land:window.CJLanding&&window.CJLanding.shown(),ld:getComputedStyle(l).display,lh:r.height,gd:getComputedStyle(g).display,mv:getComputedStyle(m).visibility,locked:H.classList.contains('cj-locked'),h1:h1.length,h1vis:h1.length===1&&h1[0].getBoundingClientRect().height>0&&getComputedStyle(h1[0]).visibility==='visible',h1t:h1.map(x=>x.textContent).join('|'),ovf:l.scrollWidth-l.clientWidth,docOvf:document.documentElement.scrollWidth-window.innerWidth,open:!!window.CJGateOpen};});
const small=(p,sel)=>p.evaluate(sel=>[...document.querySelectorAll(sel)].filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed').map(e=>({t:(e.id||e.textContent.trim().slice(0,22)),h:Math.round(e.getBoundingClientRect().height)})).filter(x=>x.h>0&&x.h<44),sel);
// --- 3a. visiteur iPhone
const v=await newPage(IP,{onb:false});const vcons=[];v.on('console',m=>{if(/Google|auth/i.test(m.text()))vcons.push(m.text().slice(0,120));});await v.goto(URL,{waitUntil:'networkidle2'});await sleep(1500);
let s=await st(v);
check('iPhone sans session : page d’accueil visible, application masquée, verrou actif',s.land&&s.ld==='block'&&s.lh>=844&&s.gd==='none'&&s.mv==='hidden'&&s.locked&&(await v.evaluate(()=>window.__dcl.land)),JSON.stringify(s));
check('iPhone : un seul h1 visible',s.h1===1&&s.h1vis,s.h1t);
check('iPhone : pas de débordement horizontal',s.ovf<=0&&s.docOvf<=0,s.ovf+'/'+s.docOvf);
let sm=await small(v,'#landing .btn,#landing a');check('iPhone : boutons/liens de la page d’accueil ≥ 44 px',sm.length===0,JSON.stringify(sm));
check('splash plus court pour un visiteur (≤ 1,2 s)',await v.evaluate(()=>window.CJIntro.splashDone()));
await v.click('#lnFeat');await sleep(1400);
const fz=await v.evaluate(()=>({top:Math.round(document.getElementById('fonctions').getBoundingClientRect().top),sc:document.getElementById('landing').scrollTop}));
check('« Voir les fonctions » fait défiler jusqu’aux fonctions',fz.sc>200&&fz.top>=-5&&fz.top<=80,JSON.stringify(fz));
await v.click('#lnLogin');await v.waitForSelector('#gEmail',{visible:true,timeout:10000});await sleep(300);
s=await st(v);
const lt=await v.$eval('#gate',e=>e.innerText);
check('« Se connecter » ouvre l’écran de connexion (logo, accès sur invitation, e-mail/mot de passe, Google, oubli, note iPhone)',!s.land&&s.gd==='block'&&s.mv==='hidden'&&/Accès sur invitation/.test(lt)&&/E-mail/.test(lt)&&/Mot de passe/.test(lt)&&/Se connecter avec Google/.test(lt)&&/Mot de passe oublié/.test(lt)&&/\bou\b/.test(lt)&&/iPhone/.test(lt)&&/Version 1\.28\.0/.test(lt)&&!!(await v.$('#gate img.g-logo[src="icons/logo-b.svg"]')));
sm=await small(v,'#gate button,#gate input');check('iPhone : boutons et champs de connexion ≥ 44 px',sm.length===0,JSON.stringify(sm));
await v.click('#gBack');await sleep(300);s=await st(v);check('« Retour à l’accueil » réaffiche la page d’accueil',s.land&&s.gd==='none');
await v.click('#lnLogin');await v.waitForSelector('#gGoogle',{visible:true});
// --- 3b. Google (popup, émulateur) : pas d’erreur de domaine
const pop=new Promise(r=>{const h=t=>{if(t.type()==='page'){v.ctx.off('targetcreated',h);r(t);}};v.ctx.on('targetcreated',h);setTimeout(()=>r(null),8000);});
await v.click('#gGoogle');const pt=await pop;await sleep(2500);
const pu=pt?pt.url():'';const gerr=await v.evaluate(()=>[...document.querySelectorAll('#gate .g-err')].filter(e=>e.offsetParent!==null).map(e=>e.textContent).join(' | '));
check('Google : fenêtre de connexion ouverte (émulateur), aucune erreur de domaine',/emulator\/auth\/handler/.test(pu)&&/google\.com/.test(decodeURIComponent(pu))&&!/domain|domaine|unauthorized|non autoris/i.test(gerr),pu.slice(0,90)+' | '+gerr+' | '+vcons.join(' / '));
if(pt){try{const pp=await pt.page();if(pp)await pp.close();}catch(e){}}await sleep(800);
// --- 3c. connexion e-mail (membre invité) + premier lancement : présentation
const em='prof.v28@example.com',pw='Prof-v28-123';
const su=await j(AUTH+'/identitytoolkit.googleapis.com/v1/accounts:signUp?key=fake',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({email:em,password:pw,returnSecureToken:true})});
await j(`${FS}/v1/projects/${P}/databases/(default)/documents/members/${em}`,{method:'PATCH',headers:{'content-type':'application/json',Authorization:'Bearer owner'},body:JSON.stringify({fields:{email:{stringValue:em},active:{booleanValue:true}}})});
await v.$eval('#gEmail',e=>e.value='');await v.type('#gEmail',em);await v.type('#gPass',pw);await v.click('#gGo');
await v.waitForFunction(()=>window.CJGateOpen===true,{timeout:30000}).catch(()=>{});
s=await st(v);
check('connexion e-mail : application ouverte, page d’accueil et écran masqués, cahier.authOk mémorisé',s.open&&!s.locked&&!s.land&&s.mv==='visible'&&(await v.evaluate(u=>{const a=JSON.parse(localStorage.getItem('cahier.authOk')||'null');return !!a&&a.uid===u&&a.ok===true;},su.localId)),JSON.stringify(s));
await v.waitForSelector('#onb',{timeout:8000}).catch(()=>{});
check('présentation (onboarding) affichée après la première connexion',!!(await v.$('#onb')));
await v.evaluate(()=>{const x=document.querySelector('#onb .onb-skip');if(x)x.click();});await sleep(500);
check('un seul h1 dans l’application ouverte',(await v.evaluate(()=>document.querySelectorAll('h1').length))===1);
const hd=await v.evaluate(()=>{const r=document.querySelector('header.top .h-logo').getBoundingClientRect();return {logo:document.querySelector('header.top .h-logo').getAttribute('src'),w:r.width,ver:document.querySelector('header.top .h-ver').textContent,ttl:document.querySelector('header.top .h-ttl').textContent};});
check('en-tête : logo discret + titre + version',hd.logo==='icons/logo-b.svg'&&hd.w>=28&&hd.w<=40&&hd.ver==='v1.28.0'&&hd.ttl==='Cahier d’EPS',JSON.stringify(hd));
// --- 3d. synchronisation vers l’émulateur
await v.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(300);
await v.evaluate(()=>{const t=document.getElementById('setTeacher');t.value='Lycée qualifiant Baja';t.dispatchEvent(new Event('input',{bubbles:true}));t.dispatchEvent(new Event('change',{bubbles:true}));});
await v.waitForFunction(()=>{const s=window.CJSync.state,m=window.CJSync.meta();return s.ready&&!m.dirty&&!s.uploading&&m.lastSyncAt>0;},{timeout:30000}).catch(()=>{});
const remote=JSON.stringify(await j(`${FS}/v1/projects/${P}/databases/(default)/documents/users/${su.localId}/cahier`,{headers:{Authorization:'Bearer owner'}}));
check('synchronisation : données envoyées à l’émulateur Firestore (users/{uid}/cahier)',/Lycée qualifiant Baja/.test(remote)&&/meta/.test(remote),remote.slice(0,120));
// --- 3e. sauvegarde JSON téléchargée = données locales
const dl='/tmp/dl24_'+Date.now();fs.mkdirSync(dl,{recursive:true});
const cdp=await v.createCDPSession();await cdp.send('Browser.setDownloadBehavior',{behavior:'allow',downloadPath:dl,browserContextId:v.ctx.id}).catch(async()=>{await cdp.send('Page.setDownloadBehavior',{behavior:'allow',downloadPath:dl});});
await v.evaluate(()=>document.getElementById('bkExport').click());
let file=null;for(let i=0;i<40&&!file;i++){await sleep(250);file=fs.readdirSync(dl).find(f=>/^sauvegarde-cahier-journalier_.*\.json$/.test(f));}
let bk=null;try{bk=JSON.parse(fs.readFileSync(path.join(dl,file),'utf8'));}catch(e){}
const loc=await v.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
const strip=o=>{const c=JSON.parse(JSON.stringify(o));return {classes:c.classes,students:c.students,sessions:c.sessions,teacher:c.settings&&c.settings.teacher};};
check('sauvegarde JSON téléchargée (fichier valide, mêmes classes/élèves/séances que classRegister.v2)',!!bk&&JSON.stringify(strip(bk))===JSON.stringify(strip(loc))&&bk.settings.teacher==='Lycée qualifiant Baja',file||'aucun fichier');
// --- 3f. session présente : directement l’application (en ligne puis hors ligne)
await v.reload({waitUntil:'domcontentloaded'});await v.waitForFunction(()=>window.CJGateOpen===true,{timeout:20000}).catch(()=>{});
s=await st(v);check('session mémorisée : pas de page d’accueil, application ouverte directement',(await v.evaluate(()=>window.__dcl.land))===false&&!s.land&&s.open&&!(await v.evaluate(()=>!!document.getElementById('gEmail')&&document.getElementById('gEmail').offsetParent)),JSON.stringify(s));
await v.setOfflineMode(true);await v.reload({waitUntil:'domcontentloaded'}).catch(()=>{});await v.waitForFunction(()=>window.CJGateOpen===true,{timeout:20000}).catch(()=>{});
s=await st(v);check('hors ligne avec session : pas de page d’accueil, application ouverte',(await v.evaluate(()=>window.__dcl.land))===false&&!s.land&&s.open,JSON.stringify(s));
await v.setOfflineMode(false);
await v.screenshot({path:'/tmp/v28-app-iphone.png'});
// --- 3g. bureau
const dsk=await newPage(DT);await dsk.goto(URL,{waitUntil:'networkidle2'});await sleep(1500);s=await st(dsk);
check('bureau 1280x800 : page d’accueil, un h1, pas de débordement',s.land&&s.h1===1&&s.h1vis&&s.ovf<=0&&s.docOvf<=0,JSON.stringify(s));
await dsk.click('#lnLogin');await dsk.waitForSelector('#gEmail',{visible:true});const cw=await dsk.$eval('#gate .g-card',e=>e.getBoundingClientRect().width);
check('bureau : écran de connexion centré (carte ≤ 440 px)',cw>300&&cw<=440,String(cw));
// --- 3h. grille d’absences : tailles et codes inchangés
const g=await newPage(IP);await g.goto('http://localhost:8000/',{waitUntil:'networkidle2'});
await g.evaluate('('+seed.toString()+')('+JSON.stringify(KEY)+',"Lycée qualifiant Baja")');await g.reload({waitUntil:'networkidle2'});
await g.evaluate(()=>{window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked');document.querySelector('#tabs button[data-tab="attendance"]').click();});await sleep(500);
const gs=await g.evaluate(()=>{const c=[...document.querySelectorAll('#gridWrap td.c')];const r=c[0].getBoundingClientRect();const cs=k=>{const e=document.querySelector('#gridWrap td.c.'+k);return e?getComputedStyle(e).backgroundColor:null;};return {w:Math.round(r.width),h:Math.round(r.height),A:cs('A'),dsp:cs('dsp'),S:cs('S'),M:cs('M'),txt:[...new Set(c.map(x=>x.textContent.trim()))].sort().join(',')};});
check('grille (affichage Notes /20) : cases 40×44, couleurs A/ST/M et gris « dispensé » inchangés',gs.w>=40&&gs.w<=41&&gs.h===44&&gs.A==='rgb(253, 234, 236)'&&gs.dsp==='rgb(196, 201, 212)'&&(gs.M==='rgb(243, 232, 255)'||gs.M===null),JSON.stringify(gs));
const ga=await g.evaluate(()=>{const c=document.querySelector('#gridWrap td.c').getBoundingClientRect();return {sw:!!document.getElementById('attView'),w:Math.round(c.width),h:Math.round(c.height),th:[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent).join('|')};});
check('1.28.0 (-i) : plus de bascule « Absences | Notes /20 » — affichage Notes /20 seul, cases 40×44',!ga.sw&&ga.w>=40&&ga.w<=41&&ga.h===44&&!/^Abs\./.test(ga.th),JSON.stringify(ga));
await g.close();
// ================= 4. Mise à jour v1.27.0 → v1.28.0 : données existantes inchangées =================
const VOLD='/tmp/v27root';if(!fs.existsSync(VOLD+'/index.html')){fs.mkdirSync(VOLD,{recursive:true});cp.execSync('git -C '+D+' archive v1.27.0 | tar -x -C '+VOLD);}
let ROOT=VOLD;const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf','.txt':'text/plain','.xml':'application/xml'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8010);
const U=await newPage(IP);await U.goto('http://localhost:8010/?emu=1',{waitUntil:'networkidle2'});
await U.evaluate('('+seed.toString()+')('+JSON.stringify(KEY)+',"Lycée qualifiant Baja")');
await U.reload({waitUntil:'networkidle2'});await U.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(1500);
const all=p=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage.getItem(k);}return o;});
const oldsem=await U.evaluate(()=>window.CJR&&window.CJR.semver);const before=await all(U);
ROOT=D.replace(/\/$/,'');
let sem2='';for(let i=0;i<6&&sem2!=='1.28.0';i++){await U.reload({waitUntil:'networkidle2'});await sleep(1200);sem2=await U.evaluate(()=>window.CJR&&window.CJR.semver);}
await sleep(1500);const after=await all(U);
const caches=await U.evaluate(()=>caches.keys());
check('mise à jour réelle par le service worker : v'+oldsem+' → v'+sem2+' (cache cahier-v28 seul)',oldsem==='1.27.0'&&sem2==='1.28.0'&&caches.some(c=>/^cahier-v28(-[a-z])?$/.test(c))&&!caches.includes('cahier-v27'),JSON.stringify(caches));
const deq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
check('classRegister.v2 : contenu identique avant/après (deep-equal) et chaîne brute identique',deq(JSON.parse(before[KEY]),JSON.parse(after[KEY]))&&before[KEY]===after[KEY],(before[KEY]||'').length+' car.');
const changed=Object.keys(after).filter(k=>before[k]!==after[k]),gone=Object.keys(before).filter(k=>!(k in after));
check('aucune clé supprimée ; seules la version et la sauvegarde de sécurité « avant mise à jour » changent',gone.length===0&&changed.every(k=>k==='cahier.appVersion'||(/^classRegister\.v2\.snapm?\.\d+$/.test(k)&&!(k in before)))&&changed.filter(k=>/snapm\./.test(k)).every(k=>/Avant mise à jour cahier-v27 → cahier-v28/.test(after[k])),'modifiées : '+changed.join(', ')+(gone.length?' | supprimées : '+gone.join(','):''));
const shown=await U.evaluate(()=>({n:window.CJR.db().students.length,c:window.CJR.db().classes.length,t:window.CJR.db().settings.teacher}));
check('données existantes chargées par v1.28.0 (28 élèves, 9 classes, établissement)',shown.n===28&&shown.c===9&&shown.t==='Lycée qualifiant Baja',JSON.stringify(shown));
fs.writeFileSync('/tmp/v28-upgrade-proof.json',JSON.stringify({from:oldsem,to:sem2,keysBefore:Object.keys(before).sort(),keysAfter:Object.keys(after).sort(),changed,classRegisterV2Equal:before[KEY]===after[KEY],bytes:(before[KEY]||'').length},null,1));
srv.close();
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
