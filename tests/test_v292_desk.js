/* 1.29.2 (x) : mise en page ORDINATEUR (≥ 1024 px) — barre latérale « A » (desk.js, chargé par college.js seulement sur grand écran). Affichage seulement.
   Compare au code de backup-pre-1.29.2x (2w, extrait dans /tmp/base-2x) : téléphone 390 px identique au pixel près, retour 1280 → 390 px identique,
   barre latérale 248 px / réduite 76 px (clé d’affichage tatabo3.desk.mini seulement), barre de titre par page, Accueil en 2 colonnes,
   aucun texte coupé ni débordant à 1024/1152/1280/1366/1440/1920 px, repli identique si desk.js manque, données et notes identiques,
   « Test navette (palier) » masqué mais ses valeurs conservées, budget de démarrage tenu. Ports 8064/8066. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2x',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2x | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8064),S2=serve(B,8066);
/* 2u : classes enregistrées déjà dans l’ordre d’affichage (tri 2u sans effet) pour comparer la mise en page à 2s ; le tri est vérifié par test_v292_tri */
const LYC=(()=>{const o=JSON.parse(fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8')),E=['1BACSH1','1BACLSH2','1BACSH3','1BACLSH4','2BACSP4','2BACSP5','2BACSP6','2BACSVT1','2BACSVT2'];o.classes.sort((x,y)=>E.indexOf(x.name)-E.indexOf(y.name));return JSON.stringify(o);})();let b;
async function page(port,{w=1440,h=900,theme='',block=null,data=null,mob}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();if(mob===undefined)mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&block.test(u))return q.abort();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o,t)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);if(t)localStorage.setItem('cahier.theme',t);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data||LYC,theme);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});
 await p.evaluate(t=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;if(t)document.documentElement.setAttribute('data-theme',t);},theme);
 await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:10000}).catch(()=>{});await sleep(1300);p.ctx=ctx;return p;}
const tab=(p,t)=>p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);
const SCAN=function SCAN(){const out=[],seen=new Set();
 const cs=e=>getComputedStyle(e);
 const isTile=e=>{if(e===document.body||e===document.documentElement)return false;const s=cs(e);if(/^inline/.test(s.display))return false;const r=parseFloat(s.borderTopLeftRadius)||0;
  const bw=parseFloat(s.borderLeftWidth)||0,bg=s.backgroundColor!=='rgba(0, 0, 0, 0)'||s.backgroundImage!=='none';return r>=6&&(bw>0||bg)&&e.getBoundingClientRect().width>40;};
 const scroller=e=>{const s=cs(e);return ['auto','scroll'].includes(s.overflowX);};
 const name=e=>{let s=[];for(let x=e;x&&x!==document.body&&s.length<4;x=x.parentElement)s.unshift(x.tagName.toLowerCase()+(x.id?'#'+x.id:'')+(x.classList.length?'.'+[...x.classList].slice(0,2).join('.'):''));return s.join('>');};
 const openModals=[...document.querySelectorAll('.modal')].filter(m=>cs(m).display!=='none'&&m.getBoundingClientRect().width>0);
 const roots=openModals.length?openModals:[document.querySelector('header.top'),document.querySelector('nav.tabs'),document.getElementById('dkSide'),document.querySelector('main')].filter(Boolean);
 for(const root of roots){const tw=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;
  while(n=tw.nextNode()){const t=n.textContent.trim();if(!t)continue;const el=n.parentElement;if(!el||['OPTION','SCRIPT','STYLE','TITLE'].includes(el.tagName))continue;
   const es=cs(el);if(es.visibility==='hidden')continue;const rg=document.createRange();rg.selectNodeContents(n);const rs=[...rg.getClientRects()].filter(r=>r.width>0.5&&r.height>0.5);if(!rs.length)continue;
   const R={l:Math.min(...rs.map(r=>r.left)),r:Math.max(...rs.map(r=>r.right)),t:Math.min(...rs.map(r=>r.top)),b:Math.max(...rs.map(r=>r.bottom))};
   /* invisible car dans un ancêtre masqué à 0 */let hid=false;for(let x=el;x&&x!==root.parentElement;x=x.parentElement){const s=cs(x);if(s.display==='none'||+s.opacity<0.05||(x.getBoundingClientRect().width<1&&s.overflow!=='visible')){hid=true;break;}}if(hid)continue;
   let why=null;
   /* 1. texte coupé par un ancêtre qui masque le débordement (… compris) : le texte dépasse la zone visible de cet ancêtre */
   let sr=false;
   for(let x=el;x&&x!==root;x=x.parentElement){const s=cs(x);if(scroller(x)||['auto','scroll'].includes(s.overflowY))break;const b=x.getBoundingClientRect();
    if((b.width<=2||b.height<=2)&&s.overflow!=='visible'){sr=true;break;}if(s.clip&&s.clip!=='auto'){sr=true;break;}
    const cx=['hidden','clip'].includes(s.overflowX),cy=['hidden','clip'].includes(s.overflowY);
    if(cx||cy){const L=b.left+x.clientLeft,T=b.top+x.clientTop,Rr=L+x.clientWidth,B=T+x.clientHeight;
     if(cx&&(R.l<L-1||R.r>Rr+1)){why='coupé'+(s.textOverflow==='ellipsis'?' (…)':'');break;}
     if(cy&&(R.t<T-1||R.b>B+1)){why='coupé vertical';break;}}
    if(isTile(x))break;}
   if(sr)continue;
   /* 2. sort de sa tuile */
   if(!why){let tile=null,sc=false;for(let x=el.parentElement;x&&x!==root.parentElement;x=x.parentElement){if(scroller(x)){sc=true;break;}if(isTile(x)){tile=x;break;}}
    if(tile&&!sc){const b=tile.getBoundingClientRect(),s=cs(tile);const L=b.left+parseFloat(s.borderLeftWidth),Rr=b.right-parseFloat(s.borderRightWidth);
     if(R.l<L-1||R.r>Rr+1)why='sort de la tuile '+name(tile).split('>').pop()+' ('+Math.round(Math.max(L-R.l,R.r-Rr))+' px)';}}
   if(why){const k=why+name(el)+t;if(seen.has(k))continue;seen.add(k);out.push({why,el:name(el),t:t.replace(/\s+/g,' ').slice(0,50)});}}}
 /* 4. élément d’une carte/tuile qui masque son contenu et le déborde (scrollWidth > clientWidth) */
 for(const root of roots)for(const e of root.querySelectorAll('*')){if(!e.closest('.card,.hs,.qa,.hc-row,.tw-card,.ps-card,.hy-card,.sheet'))continue;const s=cs(e);if(!['hidden','clip'].includes(s.overflowX)||s.display==='none')continue;
  const b=e.getBoundingClientRect();if(b.width<=2||b.height<=2||(s.clip&&s.clip!=='auto')||!e.textContent.trim()||e.offsetParent===null)continue;if(e.querySelector('.gridwrap,.tablewrap'))continue;
  if(e.scrollWidth>e.clientWidth+1){const k='sw'+name(e);if(!seen.has(k)){seen.add(k);out.push({why:'scrollWidth '+e.scrollWidth+' > clientWidth '+e.clientWidth,el:name(e),t:e.textContent.trim().replace(/\s+/g,' ').slice(0,50)});}}}
 /* 3. page plus large que l’écran */
 if(document.documentElement.scrollWidth>innerWidth)out.push({why:'page plus large que l’écran',el:'html',t:document.documentElement.scrollWidth+' > '+innerWidth});
 return out;};
/* 2x : boutons « Relevé de notes (CSV) » ajoutés et carte « Tableaux Excel (CSV) » masquée (demande du propriétaire) — défaits avant de comparer au pixel près avec 2w */
const NEUT=p=>p.evaluate(()=>{document.querySelectorAll('[data-csvrel],#csvGrades').forEach(e=>e.remove());const c=document.querySelector('.csvline');if(c)c.hidden=false;});
const TABS=['home','students','attendance','proc','reports','settings'];
const shot=async p=>{await p.evaluate(()=>window.scrollTo(0,0));await sleep(150);return (await p.screenshot({fullPage:true,encoding:'base64'}));};
const J=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
const G=p=>p.evaluate(()=>{const d=CJR.db(),o=[];d.classes.forEach(c=>d.periods.forEach((x,pi)=>CJR.studentsIn(c.id).forEach(s=>{const g=CJR.gradeOf(c.id,s.id,pi);o.push(g.total+'|'+g.proc);})));return o.join();});
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:240000,args:['--no-sandbox','--disable-dev-shm-usage']});
 /* 0. statique */
 const X=require('./undo_2x.js');
 const sw=fs.readFileSync(D+'/sw.js','utf8'),A=sw.match(/const ASSETS = \[([\s\S]*?)\];/)[1],LZ=sw.match(/const LAZY_ASSETS = \[([\s\S]*?)\];/)[1];
 const budget=R=>{const s=fs.readFileSync(R+'/sw.js','utf8').match(/const ASSETS = \[([\s\S]*?)\];/)[1];return [...s.matchAll(/'([^']+)'/g)].map(m=>m[1]).reduce((t,f)=>t+fs.statSync(R+'/'+(f==='./'?'index.html':f)).size,0);};
 const bN=budget(D),bO=budget(B);
 check('cj-pdf.js : seul le masquage de « Test navette (palier) » change',X.pdf(fs.readFileSync(D+'/cj-pdf.js','utf8'))===fs.readFileSync(B+'/cj-pdf.js','utf8'),X.missing(X.PDF,fs.readFileSync(D+'/cj-pdf.js','utf8')));
 check('desk.js : chargé après le démarrage (LAZY_ASSETS, pas dans ASSETS), en-tête no-cache',!/desk/.test(A)&&/'\.\/desk\.js'/.test(LZ)&&/"\/desk\.js"/.test(fs.readFileSync(D+'/firebase.json','utf8')));
 check('budget de démarrage ≤ 737 280 o et sans hausse ('+bN+' o ; 2w : '+bO+' o)',bN<=bO&&bN<=737280,[bN,bO]);
 const idxN=fs.readFileSync(D+'/index.html','utf8'),idxO=fs.readFileSync(B+'/index.html','utf8');
 const undo=X.index(idxN);
 check('index.html : seuls la version (cahier-v29-2z) et le masquage de « Test navette (palier) » changent',undo===idxO&&/var APP_VER='cahier-v29-2za'/.test(idxN)&&/const CACHE = 'cahier-v29-2za'/.test(fs.readFileSync(D+'/sw.js','utf8')),X.missing(X.IDX,idxN));
 check('college.js : seul le bloc « Relevé de notes (CSV) » ajouté en fin de fichier',X.college(fs.readFileSync(D+'/college.js','utf8'))===fs.readFileSync(B+'/college.js','utf8'));
 check('college.js charge desk.js seulement si (min-width:1024px)',/matchMedia\('\(min-width:1024px\)'\)/.test(fs.readFileSync(D+'/college.js','utf8'))&&/s\.src='desk\.js'/.test(fs.readFileSync(D+'/college.js','utf8')));
 check('desk.js : CSS sous @media (min-width:1024px), éléments ajoutés masqués hors de cette largeur, seule clé ajoutée tatabo3.desk.mini',(()=>{const t=fs.readFileSync(D+'/desk.js','utf8');return /@media\s*\(min-width:1024px\)/.test(t)&&!/@media\s*\(max-width/.test(t)&&/#dkSide,#dkBar\{display:none\}@media \(min-width:1024px\)/.test(t)&&[...t.matchAll(/localStorage\.(?:set|get|remove)Item\(([^,)]+)/g)].every(m=>m[1]==='MK')&&/MK='tatabo3\.desk\.mini'/.test(t);})());
 /* 1. téléphone 390 px : identique au pixel près, desk.js jamais chargé */
 for(const th of ['','terrain','neon']){const O=await page(8066,{w:390,h:844,theme:th}),N=await page(8064,{w:390,h:844,theme:th});let same=0,dk=0;const hd=[];
  for(const t of TABS){await tab(O,t);await tab(N,t);await sleep(800);hd.push(await N.evaluate(()=>document.getElementById('hdrSub').textContent));await NEUT(N);if(await shot(O)===await shot(N))same++;}
  dk=await N.evaluate(()=>document.documentElement.classList.contains('cj-dk')||!!document.getElementById('deskCss')||[...document.scripts].some(s=>/desk\.js/.test(s.src)));
  check('390 px thème '+(th||'actuel')+' : en-tête « E. Tammar Mohamed - Lycée qualifiant Baja », 6 pages identiques à 2w au pixel près (boutons CSV 2x retirés pour comparer) ; desk.js non chargé, aucune erreur',hd.every(h=>h==='E. Tammar Mohamed - Lycée qualifiant Baja')&&same===6&&!dk&&!O.errs.length&&!N.errs.length,[hd[0],same,dk,O.errs,N.errs]);
  await O.ctx.close();await N.ctx.close();}
 /* 2. 1440 px : mise en page ordinateur sur toutes les pages */
 const N=await page(8064);const lay=[];
 const TT={home:'Accueil',students:'Élèves',attendance:'Absences et notes /20',proc:'Note procédurale',reports:'Rapports',settings:'Paramètres'};
 for(const t of TABS){await tab(N,t);await sleep(700);lay.push(await N.evaluate(t=>{const g=e=>e?e.getBoundingClientRect():{left:-1,width:0,height:0,top:0,bottom:0},nav=g(document.getElementById('tabs')),sd=g(document.getElementById('dkSide')),m=g(document.querySelector('main')),hd=g(document.querySelector('header.top')),br=g(document.getElementById('dkBar')),v=document.getElementById('view-'+t),act=document.querySelector('#tabs button.active');
   return {t,dk:document.documentElement.classList.contains('cj-dk'),css:!!document.getElementById('deskCss'),sdX:Math.round(sd.left),sdW:Math.round(sd.width),sdH:Math.round(sd.height),navX:Math.round(nav.left),navW:Math.round(nav.width),navT:Math.round(nav.top),mainX:Math.round(m.left),
    hdT:Math.round(hd.top),hdR:Math.round(hd.left+hd.width),barT:Math.round(br.top),barH:Math.round(br.height),h1:(document.querySelector('#dkBar h1')||{}).textContent,act:act&&act.dataset.tab,bar:getComputedStyle(act,'::before').backgroundColor,
    fab:getComputedStyle(document.getElementById('addStudentBtn')).display,add:!document.querySelector('#dkBar .dk-add').hidden,sw:document.documentElement.scrollWidth,vis:!!v&&v.offsetParent!==null&&v.getBoundingClientRect().width>900,
    prof:(document.querySelector('#dkSide .dk-pn b')||{}).textContent,hh:getComputedStyle(document.documentElement).getPropertyValue('--dk-hh').trim()};},t));}
 check('1440 px : barre latérale fixe 248 px (logo, carte du professeur, menu), plus d’en-tête en haut (Synchro / Thème au pied de la barre), barre de titre 64 px avec le titre de la page, élément actif marqué orange, sur les 6 pages',
  lay.every(l=>l.dk&&l.css&&l.sdX===0&&l.sdW===248&&l.sdH===900&&l.navX===0&&l.navW===248&&l.navT>100&&l.mainX>=248&&l.hdT>800&&l.hdR<=248&&l.barT===0&&l.barH===64&&l.hh==='64px'&&l.h1===TT[l.t]&&l.act===l.t&&l.bar==='rgb(255, 122, 31)'&&l.fab==='none'&&l.add===(l.t==='students')&&l.sw===1440&&l.vis&&l.prof==='E. Tammar Mohamed'),lay);
 await tab(N,'home');await sleep(500);
 check('1440 px Accueil : 2 colonnes (gauche plus large), accès rapide 4 tuiles de même hauteur sur une ligne (Rapports / Élèves déjà dans le menu), statistiques en 3 colonnes',await N.evaluate(()=>{const c=[...document.querySelectorAll('#homeBody>.dk-hc')].map(e=>e.getBoundingClientRect());const q=[...document.querySelectorAll('#homeQuick .qa')].filter(e=>e.offsetParent!==null).map(e=>e.getBoundingClientRect());
  return c.length===2&&c[0].width>c[1].width*1.6&&c[0].right<c[1].left&&!!document.querySelector('.dk-hc #homeHero')&&!!document.querySelector('.dk-hc #homeCal')&&q.length===4&&q.every(r=>Math.abs(r.height-q[0].height)<1&&Math.abs(r.top-q[0].top)<1)&&getComputedStyle(document.querySelector('#homeStats .hs-grid')).gridTemplateColumns.split(' ').length===3;}));
 await tab(N,'students');await sleep(500);
 check('1440 px Élèves : « + Ajouter un élève » dans la barre de titre ouvre la même fenêtre que le bouton flottant',await N.evaluate(async()=>{const o=document.querySelector('#dkBar .dk-add');let hit=0;const f=document.getElementById('addStudentBtn'),h=()=>hit++;f.addEventListener('click',h);o.click();f.removeEventListener('click',h);await new Promise(r=>setTimeout(r,500));const m=[...document.querySelectorAll('.modal')].filter(m=>getComputedStyle(m).display!=='none');m.forEach(x=>{const c=x.querySelector('[data-close],.close,button.ghost');});return hit===1&&m.length>=1;}));
 await N.keyboard.press('Escape');await N.evaluate(()=>document.querySelectorAll('.modal').forEach(m=>{if(getComputedStyle(m).display!=='none'&&window.closeModal)closeModal(m.id);}));await sleep(400);
 await tab(N,'settings');await sleep(600);
 check('1440 px Paramètres : « Compte et synchronisation » ouvert d’office à côté de la liste ; ligne « Mon Cahier Journalier » ordinaire (chevron, sans sous-titre ni bouton)',await N.evaluate(()=>{const l=document.getElementById('psList').getBoundingClientRect(),r=document.getElementById('cjcRow');const rr=r&&r.getBoundingClientRect();
  return CJPS.cur()==='sync'&&l.width>=300&&l.width<=340&&!!r&&rr.height<=56&&!r.querySelector('#cjcBtn')&&!!r.querySelector('.ps-chev')&&![...r.querySelectorAll('small,.ps-sub')].some(e=>e.offsetParent!==null&&e.textContent.trim());}));
 await N.click('#cjcRow');await sleep(500);
 check('1440 px : vrai clic sur « Mon Cahier Journalier » → sous-page à côté de la liste (ligne surlignée), bouton PAPERASSE sur une ligne',await N.evaluate(()=>{const bt=document.getElementById('cjcBtn'),bb=bt.getBoundingClientRect(),l=document.getElementById('psList').getBoundingClientRect();
  return CJPS.cur()==='cjc'&&bb.left>l.right&&bb.width>0&&bt.scrollWidth<=bt.clientWidth&&bb.height<=48&&getComputedStyle(document.getElementById('cjcRow')).backgroundColor!=='rgba(0, 0, 0, 0)'&&!window.CJCahier;}));
 /* barre réduite : 76 px, mémorisée dans tatabo3.desk.mini seulement */
 {const k0=await N.evaluate(()=>Object.keys(localStorage).sort().join('|'));await N.evaluate(()=>document.querySelector('#dkSide .dk-col').click());await sleep(500);
  const m=await N.evaluate(()=>({w:Math.round(document.getElementById('dkSide').getBoundingClientRect().width),nw:Math.round(document.getElementById('tabs').getBoundingClientRect().width),mx:Math.round(document.querySelector('main').getBoundingClientRect().left),k:localStorage.getItem('tatabo3.desk.mini'),keys:Object.keys(localStorage).sort().join('|'),sw:document.documentElement.scrollWidth}));
  await N.reload({waitUntil:'networkidle2'});await N.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});await sleep(1800);
  const m2=await N.evaluate(()=>({mini:document.documentElement.classList.contains('dk-mini'),w:Math.round((document.getElementById('dkSide')||{getBoundingClientRect:()=>({width:0})}).getBoundingClientRect().width)}));
  await N.evaluate(()=>document.querySelector('#dkSide .dk-col').click());await sleep(500);const m3=await N.evaluate(()=>({w:Math.round(document.getElementById('dkSide').getBoundingClientRect().width),k:localStorage.getItem('tatabo3.desk.mini')}));
  check('1440 px barre réduite : 76 px (icônes), contenu décalé, gardée au rechargement, seule clé ajoutée « tatabo3.desk.mini » ; ré-agrandie à 248 px',m.w===76&&m.nw===76&&m.mx>=76&&m.mx<248&&m.k==='1'&&m.sw===1440&&m.keys===(k0+'|tatabo3.desk.mini').split('|').filter(Boolean).sort().join('|')&&m2.mini&&m2.w===76&&m3.w===248&&m3.k==='0',[k0,m,m2,m3]);}
 {const P=await page(8064,{w:1100,h:800});const r=await P.evaluate(()=>({w:Math.round(document.getElementById('dkSide').getBoundingClientRect().width),col:getComputedStyle(document.querySelector('#dkSide .dk-col')).display,sw:document.documentElement.scrollWidth}));
  check('1100 px : barre réduite aux icônes (76 px) d’office, bouton « réduire » masqué',r.w===76&&r.col==='none'&&r.sw===1100,r);await P.ctx.close();}
 await tab(N,'settings');await sleep(400);await N.evaluate(()=>CJPS.open('annee'));await sleep(600);
 check('1440 px Paramètres › Année : liste des rubriques visible à côté de la rubrique ouverte',await N.evaluate(()=>{const l=document.getElementById('psList').getBoundingClientRect();return l.width>200&&l.height>100&&l.left<600;}));
 await tab(N,'students');await sleep(500);await N.evaluate(()=>document.querySelector('#stuList li.stu').click());await sleep(800);
 check('1440 px fiche élève : fenêtre centrée et élargie',await N.evaluate(()=>{const s=document.querySelector('#detModal .sheet').getBoundingClientRect();return s.width>800&&Math.abs((s.left+s.right)/2-720)<30;}));
 check('1440 px : aucune erreur JS',N.errs.length===0,N.errs);
 /* 3. données et notes identiques (avec la mise en page ordinateur) */
 const O=await page(8066);
 check('données (classRegister.v2 hors ui) identiques à 2w',await J(O)===await J(N));
 const g0=await G(O),g1=await G(N);check('lycée : toutes les notes /20 et procédurales identiques à 2w ('+g1.split(',').length+')',g0===g1&&g0.length>1000);
 await N.ctx.close();
 /* 5. aucun texte coupé (…), débordant de sa tuile, ni scrollWidth > clientWidth, sur toutes les pages ordinateur, à 6 largeurs */
 const PS=['sync','sec','cls','pts','annee','hol','pdf','bk','snap','theme','mod','onb','dz'];
 for(const w of [1024,1152,1280,1366,1440,1920]){const P=await page(8064,{w,h:900});const bad=[];
  for(const t of TABS){await tab(P,t);await sleep(600);for(const x of await P.evaluate(SCAN))bad.push(t+': '+x.why+' '+x.el+' « '+x.t+' »');}
  for(const k of PS){await P.evaluate(k=>CJPS.open(k),k);await sleep(450);for(const x of await P.evaluate(SCAN))bad.push('param-'+k+': '+x.why+' '+x.el+' « '+x.t+' »');}
  await tab(P,'students');await sleep(500);await P.evaluate(()=>document.querySelector('#stuList li.stu').click());await sleep(800);for(const x of await P.evaluate(SCAN))bad.push('fiche: '+x.why+' '+x.el+' « '+x.t+' »');
  const T=await page(8064,{w,h:900});await tab(T,'students');await sleep(500);await T.evaluate(()=>{const b=[...document.querySelectorAll('#view-students button')].find(x=>/Tests physiques/.test(x.textContent));b.click();});await sleep(800);for(const x of await T.evaluate(SCAN))bad.push('tests: '+x.why+' '+x.el+' « '+x.t+' »');
  check(w+' px : 21 écrans ordinateur sans texte coupé ni débordant de sa carte/tuile, sans erreur JS',!bad.length&&!P.errs.length&&!T.errs.length,bad.concat(P.errs,T.errs).slice(0,8));
  await P.ctx.close();await T.ctx.close();}
 /* 6. Absences / Note procéd. : tous les élèves sans défilement interne ; en-tête des séances collé sous l’en-tête ; ligne « Absents · Moy. » visible */
 for(const w of [1024,1280]){const P=await page(8064,{w,h:900});const r=[];
  for(const [t,id] of [['attendance','gridWrap'],['proc','procWrap']]){await tab(P,t);await sleep(800);await P.evaluate(()=>window.scrollTo(0,900));await sleep(400);
   r.push(await P.evaluate(id=>{const w=document.getElementById(id),tb=w.querySelector('table'),th=tb.querySelector('thead th'),ft=tb.querySelector('tfoot th,tfoot td'),hh=document.getElementById('dkBar').getBoundingClientRect().bottom;
    return {id,rows:tb.tBodies[0].rows.length,inner:w.scrollHeight-w.clientHeight,top:Math.round(th.getBoundingClientRect().top-hh),foot:ft?Math.round(innerHeight-ft.getBoundingClientRect().bottom):null,end:scrollY+innerHeight>=document.documentElement.scrollHeight-1,nat:ft?Math.round(tb.getBoundingClientRect().bottom-ft.getBoundingClientRect().bottom):null,sw:document.documentElement.scrollWidth-innerWidth};},id));}
  check(w+' px Absences et Note procéd. : toutes les lignes affichées (pas de défilement interne), en-tête des séances collé sous la barre de titre, pied « Absents · Moy. » collé en bas (ou à sa place en fin de page)',r.every(x=>x.rows>20&&x.inner<=1&&Math.abs(x.top)<=1&&(x.foot===0||((x.end||Math.abs(x.nat)<=1)&&x.foot>=0&&x.foot<=24))&&x.sw<=0),r);
  await P.ctx.close();}
 /* 7. Élèves : « Voir tout (N) » sur toute la largeur de la grille, centré, sans cadre de carte */
 {const P=await page(8064,{w:1280,h:900});await tab(P,'students');await sleep(600);
  const v=await P.evaluate(()=>{const li=document.querySelector('#stuList li.stu-more'),bt=document.getElementById('stuMore'),l=document.getElementById('stuList');if(!li)return null;const a=li.getBoundingClientRect(),b=bt.getBoundingClientRect(),c=l.getBoundingClientRect(),s=getComputedStyle(li);
   return {full:a.width>c.width-30,centre:Math.abs((b.left+b.right)/2-(c.left+c.right)/2)<3,border:s.borderTopWidth,txt:bt.textContent};});
  check('1280 px Élèves : « Voir tout » sur toute la largeur, centré, sans cadre',!!v&&v.full&&v.centre&&v.border==='0px'&&/Voir tout/.test(v.txt),v);await P.ctx.close();}
 /* 4. repli : desk.js indisponible -> écran d’avant */
 const F=await page(8064,{block:/desk\.js/}),OB=await page(8066,{block:/desk\.js/});let fs0=0;for(const t of TABS){await tab(OB,t);await tab(F,t);await sleep(800);await NEUT(F);if(await shot(OB)===await shot(F))fs0++;}
 check('repli : sans desk.js, les 6 pages à 1440 px identiques à 2w, sans erreur',fs0===6&&!F.errs.length&&!(await F.evaluate(()=>document.documentElement.classList.contains('cj-dk'))),[fs0,F.errs]);
 await F.ctx.close();await OB.ctx.close();
 /* 8. retour 1280 → 390 px (fenêtre rétrécie) : en-tête et menu du bas rétablis, page identique à une page ouverte en 390 px (Absences / Note procéd. : identique à 2w rétréci de même) */
 {const N2=await page(8064,{w:1280,h:800,mob:false}),O2=await page(8066,{w:1280,h:800,mob:false});const res=[];
  for(const t of TABS){for(const p of [N2,O2]){await p.setViewport({width:1280,height:800});await sleep(300);await tab(p,t);await sleep(700);await p.setViewport({width:390,height:844});await sleep(900);}
   const a=await shot(N2),F2=await page(8064,{w:390,h:844,mob:false});await tab(F2,t);await sleep(900);const f=await shot(F2);await F2.ctx.close();await NEUT(N2);await sleep(200);const a2=await shot(N2),o=await shot(O2);
   const st=await N2.evaluate(()=>({dk:document.documentElement.classList.contains('cj-dk'),side:getComputedStyle(document.getElementById('dkSide')).display,bar:getComputedStyle(document.getElementById('dkBar')).display,hc:document.querySelectorAll('.dk-hc').length,
     order:[...document.getElementById('homeBody').children].map(e=>e.id||e.className).join(','),hd:Math.round(document.querySelector('header.top').getBoundingClientRect().top),nav:Math.round(innerHeight-document.getElementById('tabs').getBoundingClientRect().bottom)}));
   res.push({t,fresh:a===f,base:a2===o,...st});}
  const ord=await O2.evaluate(()=>[...document.getElementById('homeBody').children].map(e=>e.id||e.className).join(','));
  check('1280 → 390 px : barre latérale et barre de titre masquées, en-tête en haut et menu en bas, Accueil dans l’ordre d’origine, pages identiques à une page 390 px (Absences / Note procéd. identiques à 2w rétréci)',
   res.every(r=>r.side==='none'&&r.bar==='none'&&r.hc===0&&r.order===ord&&r.hd===0&&r.nav===0&&r.base&&(['attendance','proc'].includes(r.t)||r.fresh))&&!N2.errs.length,res.map(r=>[r.t,r.fresh,r.base,r.side,r.hc,r.hd,r.nav]));
  await N2.ctx.close();await O2.ctx.close();}
 /* 9. « Test navette (palier) » masqué (même rôle que la VMA) : valeurs enregistrées conservées, VMA inchangée, indice physique inchangé */
 {const o=JSON.parse(LYC),c0=o.classes[0];let i=0;o.students.filter(s=>s.classId===c0.id).forEach(s=>{s.phys=Object.assign({},s.phys,{nav:5+(i%8)*0.5,vma:9+(i%6)*0.5});i++;});const DAT=JSON.stringify(o);
  const res={};for(const [k,port,w] of [['N',8064,390],['O',8066,390],['W',8064,1280]]){const P=await page(port,{w,h:844,data:DAT});
   res[k]=await P.evaluate(async cid=>{const d=CJR.db(),st=d.students.filter(s=>s.classId===cid),r={};r.nav=st.map(s=>s.phys&&s.phys.nav).join();r.vma=st.map(s=>s.phys&&s.phys.vma).join();
    r.sc=JSON.stringify(CJR.physScores(cid));r.testsDef=CJR.TESTS.map(t=>t.k).join();r.testsVis=(CJR.TESTV||CJR.TESTS).map(t=>t.k).join();
    document.querySelector('#tabs button[data-tab=students]').click();await new Promise(z=>setTimeout(z,500));const b=[...document.querySelectorAll('#view-students button')].find(x=>/Tests physiques/.test(x.textContent));b.click();await new Promise(z=>setTimeout(z,800));
    const sel=document.getElementById('tCls');if(sel&&sel.value!==cid){sel.value=cid;sel.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(z=>setTimeout(z,500));}
    r.opts=[...document.querySelectorAll('#tKey option')].map(x=>x.value+':'+x.textContent).join('|');r.testTxt=document.getElementById('testBody').textContent.includes('navette (palier)');
    document.querySelectorAll('.modal').forEach(m=>{if(getComputedStyle(m).display!=='none'&&window.closeModal)closeModal(m.id);});await new Promise(z=>setTimeout(z,400));
    document.querySelector('#tabs button[data-tab=students]').click();const fl=document.getElementById('stuClassFilter');fl.value=cid;fl.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(z=>setTimeout(z,600));const li=document.querySelector('#stuList li.stu');const f=d.students.find(s=>s.id===li.dataset.id);li.click();await new Promise(z=>setTimeout(z,900));
    r.fiche=[...document.querySelectorAll('#detBody [data-pk]')].map(x=>x.dataset.pk).join();
    const v=document.querySelector('#detBody [data-pk=vma]');if(v){v.value='12.4';v.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(z=>setTimeout(z,900));}
    const ls=JSON.parse(localStorage.getItem('classRegister.v2')||'{}'),lf=(ls.students||[]).find(s=>s.id===f.id);r.after={nav:f.phys.nav,vma:f.phys.vma,lsNav:lf&&lf.phys&&lf.phys.nav,lsVma:lf&&lf.phys&&lf.phys.vma};
    const j=JSON.parse(CJApp.getJSON()),jf=j.students.find(s=>s.id===f.id);r.json={nav:jf.phys.nav,vma:jf.phys.vma};r.allNav=j.students.filter(s=>s.classId===cid).map(s=>s.phys&&s.phys.nav).join();return r;},c0.id);
   res[k].errs=P.errs;await P.ctx.close();}
  const N9=res.N,O9=res.O,W9=res.W;
  check('Test navette (palier) : absent de la saisie des tests (téléphone et ordinateur) et de la fiche élève ; VMA (navette) toujours proposée',[N9,W9].every(r=>!/^nav:/m.test(r.opts.split('|').join('\n'))&&r.opts.includes('vma:VMA (navette)')&&!r.testTxt&&r.fiche.split(',').includes('vma')&&!r.fiche.split(',').includes('nav'))&&/(^|\|)nav:/.test(O9.opts),[N9.opts,N9.fiche,W9.fiche]);
  check('Test navette (palier) : définition et valeurs enregistrées conservées (mémoire, localStorage, export JSON) même après modification de la VMA ; indice physique identique à 2w',
   [N9,W9].every(r=>r.testsDef===O9.testsDef&&r.testsDef.includes('nav')&&!r.testsVis.includes('nav')&&r.testsVis.includes('vma')&&r.nav===O9.nav&&r.nav.length>10&&r.sc===O9.sc&&r.after.nav!=null&&r.after.lsNav===r.after.nav&&r.json.nav===r.after.nav&&r.after.vma===12.4&&r.after.lsVma===12.4&&r.json.vma===12.4&&r.allNav===O9.allNav&&!r.errs.length),[N9.after,N9.json,W9.after,N9.sc===O9.sc,N9.errs,W9.errs]);}
 /* 10. CSV : carte « Tableaux Excel (CSV) » masquée (téléphone et ordinateur) ; « Relevé de notes (CSV) » à côté de chaque relevé PDF ; valeurs = relevé PDF */
 for(const w of [390,1440]){const P=await page(8064,{w,h:w<600?844:900});
  await tab(P,'settings');await sleep(400);await P.evaluate(()=>CJPS.open('pdf'));await sleep(600);
  const v=await P.evaluate(()=>{const vis=e=>!!e&&e.offsetParent!==null&&e.getBoundingClientRect().width>0;const pg=document.getElementById('pdfGrades'),cg=document.getElementById('csvGrades');
   return {old:['expGrid','expYear','expStudents','expRecords'].map(id=>vis(document.getElementById(id))),card:vis(document.querySelector('.csvline')),pdf:vis(pg),csv:vis(cg)&&pg.nextElementSibling===cg&&cg.textContent==='⬇️ Relevé de notes (CSV)'};});
  const ap=[];for(const [t,id] of [['attendance','attGradesPdf'],['proc','procGradesPdf']]){await tab(P,t);await sleep(700);ap.push(await P.evaluate(id=>{const e=document.getElementById(id),m=innerWidth<900&&id==='procGradesPdf',n=m?document.querySelectorAll('#procEval .pq-row')[1].lastElementChild:e&&e.nextElementSibling;return !!n&&n.hasAttribute('data-csvrel')&&n.offsetParent!==null&&n.title==='Relevé de notes (CSV)';},id));}
  check(w+' px : anciens boutons CSV et carte « Tableaux Excel (CSV) » masqués ; « ⬇️ Relevé de notes (CSV) » à côté du relevé PDF (Exporter les documents, Absences, Note procéd.)',v.old.every(x=>!x)&&!v.card&&v.pdf&&v.csv&&ap.every(Boolean),[v,ap]);
  if(w===390){const sc=await P.evaluate(()=>{const s=[];for(const id of ['attEval','procEval']){const e=document.getElementById(id);if(!e)continue;for(const b of e.querySelectorAll('.pq-row')){if(b.scrollWidth>b.clientWidth+1)s.push(id);}}return s;});
   await tab(P,'attendance');await sleep(500);check('390 px : rangée du barème sans débordement avec le bouton CSV',!sc.length&&await P.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),sc);}
  if(w===1440){
   const r=await P.evaluate(async()=>{const d=CJR.db(),nf=c=>CJR.gradesCsv(c.id).slice(1).reduce((t,l)=>t+l.slice(2).filter(Boolean).length,0),c=d.classes.slice().sort((a,b)=>nf(b)-nf(a))[0];d.ui.cls=c.id;let last=null;const oc=URL.createObjectURL;URL.createObjectURL=b=>{last=b;return oc.call(URL,b);};
    document.querySelector('#tabs button[data-tab=attendance]').click();await new Promise(z=>setTimeout(z,600));const sel=document.getElementById('attClass');if(sel&&sel.value!==c.id){sel.value=c.id;sel.dispatchEvent(new Event('change',{bubbles:true}));await new Promise(z=>setTimeout(z,600));}
    let name='';const ok=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(/\.csv$/.test(this.download))name=this.download;else return ok.call(this);};
    document.querySelector('[data-csvrel]').click();await new Promise(z=>setTimeout(z,300));HTMLAnchorElement.prototype.click=ok;
    const raw=last?new Uint8Array(await last.arrayBuffer()):null,txt=raw?new TextDecoder('utf-8',{ignoreBOM:true}).decode(raw):'';
    await CJR.pdf.lib();const pdfs=[];for(let p=0;p<6;p++){const x=await window.CJPDF.make('grades',{cid:c.id,p});const a=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));pdfs.push(btoa(s));}
    return {cls:c.name,name,bom:!!raw&&raw[0]===0xEF&&raw[1]===0xBB&&raw[2]===0xBF,type:last&&last.type,txt,pdfs,order:CJR.studentsIn(c.id).map(s=>s.sid)};});
   const OUTD='/workspace/backups/v1.29.2-preview/pc-sidebar-2x';fs.mkdirSync(OUTD,{recursive:true});fs.writeFileSync(OUTD+'/exemple-'+r.name,r.txt);
   const lines=r.txt.replace(/^\uFEFF/,'').split('\r\n').filter(Boolean).map(l=>l.split(';'));
   const PV=r.pdfs.map((b64,p)=>{const f='/tmp/t2x-rel-'+p+'.pdf';fs.writeFileSync(f,Buffer.from(b64,'base64'));const t=cp.execSync('pdftotext -layout '+f+' -',{encoding:'utf8'});const m={};
    for(const sid of r.order){const L=t.split('\n').find(l=>l.includes(sid));if(!L){m[sid]='?';continue;}const tk=L.slice(L.indexOf(sid)+sid.length).trim().split(/\s+/);const n=tk.find(x=>/^(\d+(,\d+)?|—)$/.test(x));m[sid]=n==='—'?'':n;}return m;});
   const diff=[];lines.slice(1).forEach((l,i)=>{const sid=l[1];for(let p=0;p<6;p++){if((l[2+p]||'')!==PV[p][sid])diff.push([sid,p+1,l[2+p],PV[p][sid]]);}});
   check('Relevé de notes (CSV) '+r.cls+' : UTF-8 avec BOM, « ; », en-tête Nom et prénom ; Code Massar ; S1 Test 1..3 ; S2 Test 1..3, élèves dans l’ordre du relevé PDF, noms arabes intacts',r.bom&&/\.csv$/.test(r.name)&&lines[0].join(';')==='Nom et prénom;Code Massar;S1 Test 1;S1 Test 2;S1 Test 3;S2 Test 1;S2 Test 2;S2 Test 3'&&lines.length-1===r.order.length&&lines.slice(1).every((l,i)=>l[1]===r.order[i]&&/[\u0600-\u06FF]/.test(l[0])&&l.length===8),[r.name,r.bom,lines[0],lines[1]]);
   const filled=lines.slice(1).reduce((t,l)=>t+l.slice(2).filter(Boolean).length,0);
   check('Relevé de notes (CSV) : 6 notes /20 par élève identiques aux 6 relevés PDF (cycles 1–3 = S1, 4–6 = S2 ; virgule décimale ; vide sans note) — '+filled+' notes',!diff.length&&filled>20&&lines.slice(1).every(l=>l.slice(2).every(x=>x===''||/^\d+(,\d+)?$/.test(x))),diff.slice(0,6));}
  check(w+' px CSV : aucune erreur JS',!P.errs.length,P.errs);await P.ctx.close();}
 await b.close();S1.close();S2.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})();
