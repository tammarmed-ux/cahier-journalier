/* 1.29.2 (s/t) : mise en page ordinateur (≥ 1024 px) — desk.js chargé par college.js seulement sur grand écran. Affichage seulement.
   Compare au code de backup-pre-1.29.2t (extrait dans /tmp/base-2t) : téléphone 390 px identique au pixel près (hors ligne d’en-tête : compteurs retirés en 2t),
   aucun texte coupé ni débordant à 1024/1152/1280/1366/1440/1920 px, repli identique si desk.js manque,
   données et notes lycée identiques, budget de démarrage inchangé. Ports 8064/8066. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',B='/tmp/base-2t',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
cp.execSync('rm -rf '+B+' && mkdir -p '+B+' && git -C '+D+' archive backup-pre-1.29.2t | tar -x -C '+B);
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const serve=(R,P)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(R,u);if(!f.startsWith(R)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(P);
const S1=serve(D,8064),S2=serve(B,8066);
/* 2u : classes enregistrées déjà dans l’ordre d’affichage (tri 2u sans effet) pour comparer la mise en page à 2s ; le tri est vérifié par test_v292_tri */
const LYC=(()=>{const o=JSON.parse(fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8')),E=['1BACSH1','1BACLSH2','1BACSH3','1BACLSH4','2BACSP4','2BACSP5','2BACSP6','2BACSVT1','2BACSVT2'];o.classes.sort((x,y)=>E.indexOf(x.name)-E.indexOf(y.name));return JSON.stringify(o);})();let b;
async function page(port,{w=1440,h=900,theme='',block=null}={}){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const mob=w<600;
 await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&block.test(u))return q.abort();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument((o,t)=>{const T=new Date('2026-10-22T10:00:00').getTime(),D0=Date.now(),RD=Date;window.Date=class extends RD{constructor(...a){a.length?super(...a):super(T+(RD.now()-D0));}static now(){return T+(RD.now()-D0);}};
  if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);if(t)localStorage.setItem('cahier.theme',t);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},LYC,theme);
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
 const roots=openModals.length?openModals:[document.querySelector('header.top'),document.querySelector('nav.tabs'),document.querySelector('main')];
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
/* 2t : l’en-tête n’affiche plus « · N élèves · N classes » ; pour comparer le reste au pixel près, on remet l’ancien texte */
const OLDH=p=>p.evaluate(()=>{const cr=document.getElementById('cjcRow');if(cr)cr.remove();   /* 2v : ligne « Mon Cahier Journalier » retirée pour comparer */
 const d=CJR.db(),n=d.students.length,c=d.classes.length;document.getElementById('hdrSub').textContent=(d.settings.teacher?d.settings.teacher+' · ':'')+n+' élève'+(n>1?'s':'')+' · '+c+' classe'+(c>1?'s':'');});
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
 check('budget de démarrage : mise en page sans hausse, seul le tri des classes 2u ajouté ('+bN+' o ≤ '+bO+' + 600 o, ≤ 737 280)',bN<=bO+600&&bN<=737280,[bN,bO]);
 const idxN=fs.readFileSync(D+'/index.html','utf8'),idxO=fs.readFileSync(B+'/index.html','utf8');
 const HO="  var n=DB.students.length,c=DB.classes.length;\n  $('hdrSub').textContent=(DB.settings.teacher?DB.settings.teacher+' · ':'')+plural(n,'élève')+' · '+c+' classe'+(c>1?'s':'');\n",HN="  $('hdrSub').textContent=DB.settings.teacher||'Élèves et absences';\n";
 const U2=x=>x.replace(/window\.CJR\.pdf=\{lib:pdfLib,deliver:deliverPdf\};[^\n]*\n/,'').replace(/\/\* 1\.29\.2 \(u\)[^\n]*\nfunction clsK\([^\n]*\nfunction CS\(\)[^\n]*\n/,'').split('CS()').join('DB.classes').replace('CS:CS,','').replace("'cahier-v29-2w'","'cahier-v29-2t'");
 check('index.html : seuls la version, le texte d’en-tête (sans compteurs, 2t) et le tri d’affichage des classes (2u, défait pour la comparaison) changent',idxO.includes(HO)&&U2(idxN)===idxO.replace("var APP_VER='cahier-v29-2s';","var APP_VER='cahier-v29-2t';").replace(HO,HN)&&/'cahier-v29-2w'/.test(idxN));
 check('college.js charge desk.js seulement si (min-width:1024px)',/matchMedia\('\(min-width:1024px\)'\)/.test(fs.readFileSync(D+'/college.js','utf8'))&&/s\.src='desk\.js'/.test(fs.readFileSync(D+'/college.js','utf8')));
 check('desk.js : tout le CSS sous @media (min-width:1024px)',(()=>{const t=fs.readFileSync(D+'/desk.js','utf8');return /@media\s*\(min-width:1024px\)/.test(t)&&!/@media\s*\(max-width/.test(t);})());
 /* 1. téléphone 390 px : identique au pixel près, desk.js jamais chargé */
 for(const th of ['','terrain','neon']){const O=await page(8066,{w:390,h:844,theme:th}),N=await page(8064,{w:390,h:844,theme:th});let same=0,dk=0;const hd=[];
  for(const t of TABS){await tab(O,t);await tab(N,t);await sleep(800);hd.push(await N.evaluate(()=>document.getElementById('hdrSub').textContent));await OLDH(N);await sleep(300);if(await shot(O)===await shot(N))same++;}
  dk=await N.evaluate(()=>document.documentElement.classList.contains('cj-dk')||!!document.getElementById('deskCss')||[...document.scripts].some(s=>/desk\.js/.test(s.src)));
  check('390 px thème '+(th||'actuel')+' : en-tête « E. Tammar Mohamed - Lycée qualifiant Baja » sans compteurs ; avec l’ancien texte remis, 6 pages identiques au pixel près ; desk.js non chargé, aucune erreur',hd.every(h=>h==='E. Tammar Mohamed - Lycée qualifiant Baja')&&same===6&&!dk&&!O.errs.length&&!N.errs.length,[hd[0],same,dk,O.errs,N.errs]);
  await O.ctx.close();await N.ctx.close();}
 /* 2. 1440 px : mise en page ordinateur sur toutes les pages */
 const N=await page(8064);const lay=[];
 for(const t of TABS){await tab(N,t);await sleep(700);lay.push(await N.evaluate(t=>{const nav=document.getElementById('tabs').getBoundingClientRect(),m=document.querySelector('main').getBoundingClientRect(),v=document.getElementById('view-'+t);
   return {t,dk:document.documentElement.classList.contains('cj-dk'),css:!!document.getElementById('deskCss'),navX:Math.round(nav.left),navW:Math.round(nav.width),navH:Math.round(nav.height),mainX:Math.round(m.left),sw:document.documentElement.scrollWidth,vis:!!v&&v.offsetParent!==null&&v.getBoundingClientRect().width>900};},t));}
 check('1440 px : barre latérale 248 px à gauche, contenu décalé, pas de défilement horizontal, sur les 6 pages',lay.every(l=>l.dk&&l.css&&l.navX===0&&l.navW===248&&l.navH>600&&l.mainX>=248&&l.sw===1440&&l.vis),lay);
 await tab(N,'home');await sleep(500);
 check('1440 px Accueil : accès rapide 3 × 2 (tuiles de même hauteur), statistiques en tuiles ≥ 176 px, Emploi du temps et Calendrier côte à côte, même haut et même hauteur',await N.evaluate(()=>{const q=[...document.querySelectorAll('#homeQuick .qa')].map(e=>e.getBoundingClientRect());const t=document.getElementById('ttCard').getBoundingClientRect(),c=document.getElementById('homeCal').getBoundingClientRect();
  return getComputedStyle(document.getElementById('homeQuick')).gridTemplateColumns.split(' ').length===3&&q.every(r=>Math.abs(r.height-q[0].height)<1)&&[...document.querySelectorAll('#homeStats .hs')].every(e=>e.getBoundingClientRect().width>=176)&&Math.abs(t.top-c.top)<1&&Math.abs(t.height-c.height)<1&&t.right<c.left;}));
 check('1440 px Accueil : emploi du temps au style du calendrier (bordure gauche couleur du niveau, tuile icône), « 21 h / 21 h » sur une ligne',await N.evaluate(()=>{const k=document.querySelector('#ttCard .tw-card');if(!k)return false;const s=getComputedStyle(k),a=getComputedStyle(k,'::after'),bf=getComputedStyle(k,'::before'),v=document.getElementById('svcTot');
  return s.borderLeftWidth==='4px'&&bf.width==='32px'&&a.maskImage.includes('svg')&&(!v||v.getClientRects().length===1);}));
 await tab(N,'settings');await sleep(400);await N.evaluate(()=>CJPS.open('annee'));await sleep(600);
 check('1440 px Paramètres : liste des rubriques visible à côté de la rubrique ouverte',await N.evaluate(()=>{const l=document.getElementById('psList').getBoundingClientRect();return l.width>200&&l.height>100&&l.left<600;}));
 await tab(N,'students');await sleep(500);await N.evaluate(()=>document.querySelector('#stuList li.stu').click());await sleep(800);
 check('1440 px fiche élève : fenêtre centrée et élargie',await N.evaluate(()=>{const s=document.querySelector('#detModal .sheet').getBoundingClientRect();return s.width>800&&Math.abs((s.left+s.right)/2-720)<30;}));
 check('1440 px : aucune erreur JS',N.errs.length===0,N.errs);
 /* 3. données et notes identiques (avec la mise en page ordinateur) */
 const O=await page(8066);
 check('données (classRegister.v2 hors ui) identiques à 2s',await J(O)===await J(N));
 const g0=await G(O),g1=await G(N);check('lycée : toutes les notes /20 et procédurales identiques à 2s ('+g1.split(',').length+')',g0===g1&&g0.length>1000);
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
   r.push(await P.evaluate(id=>{const w=document.getElementById(id),tb=w.querySelector('table'),th=tb.querySelector('thead th'),ft=tb.querySelector('tfoot th,tfoot td'),hh=document.querySelector('header.top').getBoundingClientRect().bottom;
    return {id,rows:tb.tBodies[0].rows.length,inner:w.scrollHeight-w.clientHeight,top:Math.round(th.getBoundingClientRect().top-hh),foot:ft?Math.round(innerHeight-ft.getBoundingClientRect().bottom):null,sw:document.documentElement.scrollWidth-innerWidth};},id));}
  check(w+' px Absences et Note procéd. : toutes les lignes affichées (pas de défilement interne), en-tête des séances collé sous l’en-tête, pied « Absents · Moy. » collé en bas',r.every(x=>x.rows>20&&x.inner<=1&&Math.abs(x.top)<=1&&x.foot===0&&x.sw<=0),r);
  await P.ctx.close();}
 /* 7. Élèves : « Voir tout (N) » sur toute la largeur de la grille, centré, sans cadre de carte */
 {const P=await page(8064,{w:1280,h:900});await tab(P,'students');await sleep(600);
  const v=await P.evaluate(()=>{const li=document.querySelector('#stuList li.stu-more'),bt=document.getElementById('stuMore'),l=document.getElementById('stuList');if(!li)return null;const a=li.getBoundingClientRect(),b=bt.getBoundingClientRect(),c=l.getBoundingClientRect(),s=getComputedStyle(li);
   return {full:a.width>c.width-30,centre:Math.abs((b.left+b.right)/2-(c.left+c.right)/2)<3,border:s.borderTopWidth,txt:bt.textContent};});
  check('1280 px Élèves : « Voir tout » sur toute la largeur, centré, sans cadre',!!v&&v.full&&v.centre&&v.border==='0px'&&/Voir tout/.test(v.txt),v);await P.ctx.close();}
 /* 4. repli : desk.js indisponible -> écran d’avant */
 const F=await page(8064,{block:/desk\.js/}),OB=await page(8066,{block:/desk\.js/});let fs0=0;for(const t of TABS){await tab(OB,t);await tab(F,t);await sleep(800);await OLDH(F);await sleep(300);if(await shot(OB)===await shot(F))fs0++;}
 check('repli : sans desk.js, les 6 pages à 1440 px identiques à 2s, sans erreur',fs0===6&&!F.errs.length&&!(await F.evaluate(()=>document.documentElement.classList.contains('cj-dk'))),[fs0,F.errs]);
 await b.close();S1.close();S2.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})();
