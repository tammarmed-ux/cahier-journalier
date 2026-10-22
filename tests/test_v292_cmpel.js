/* 1.29.2 (q) : Comparaison des classes A (barres classées) et barre d’outils Élèves A — affichage seulement, comparé à l’écran d’origine (college.js bloqué). Port 8057. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8057,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const REN={'1BACSH1':'1AC1','1BACLSH2':'1AC2','1BACLSH4':'2AC1','2BACSP4':'2AC2','2BACSP5':'2AC3','2BACSP6':'3AC1','2BACSVT2':'3AC2','2BACSVT1':'Groupe A','1BACSH3':'1AC3'};
const COL=(()=>{const d=JSON.parse(LYC);d.classes.forEach(c=>c.name=REN[c.name]||c.name);d.settings.school='college';return JSON.stringify(d);})();
const LYU=(()=>{const d=JSON.parse(LYC);d.classes.find(c=>c.name==='2BACSVT1').name='Groupe A';return JSON.stringify(d);})();
let b;
async function page(data,block){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>{p.dlg=(p.dlg||[]).concat(d.message());d.accept();});
  if(block)await p.setBypassServiceWorker(true);await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&/college\.js/.test(u))return q.abort();(u.startsWith('http://localhost:'+PORT)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});
  if(!block)await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});await sleep(900);p.ctx=ctx;return p;}

/* vrai clic, après avoir amené l’élément au centre de l’écran (l’en-tête collant recouvre le haut) */
const tap=async(p,sel)=>{await p.evaluate(s=>{const e=document.querySelector(s);if(e&&getComputedStyle(e).position!=='fixed')e.scrollIntoView({block:'center'});},sel);await new Promise(r=>setTimeout(r,80));await p.click(sel);};
const J=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
const settle=p=>p.evaluate(()=>new Promise(r=>setTimeout(r,250)));
async function openAnnee(p){await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open('annee');});await settle(p);}
const home=p=>p.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();});
const stu=p=>p.evaluate(()=>{document.querySelector('#tabs button[data-tab="students"]').click();});
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const O=await page(LYC,true),N=await page(LYC,false);const j0=await J(N);const K0=await N.evaluate(()=>Object.keys(localStorage).sort());
 await home(O);await home(N);await settle(O);await settle(N);
 const ref=await O.evaluate(()=>[...document.querySelectorAll('#homeCmp table.cmp tbody tr')].map(tr=>{const t=[...tr.querySelectorAll('td')].map(x=>x.textContent.replace(/\s+/g,' ').trim());return {id:tr.dataset.cmpcls,name:t[0],n:+t[1],held:+t[2],abs:+t[3],rate:t[4],w:parseFloat(tr.querySelector('.bar i').style.width)||0};}));
 const nw=await N.evaluate(()=>({tbl:!!document.querySelector('#homeCmp table.cmp'),h2:document.querySelector('#homeCmp h2').textContent,sub:(document.querySelector('#homeCmp .q-sub')||{}).textContent,rows:[...document.querySelectorAll('#homeCmp .qxa li')].map(li=>{const m=li.querySelector('.mt').textContent.match(/^(\d+) élèves? · (\d+) séances? · (\d+) abs\.$/)||[];return {id:li.dataset.cmpcls,rk:+li.querySelector('.rk').textContent,name:li.querySelector('.nm span[dir]').textContent,lv:(li.querySelector('.q-lv')||{}).textContent,rate:li.querySelector('.rt').textContent.replace(/\s+/g,' ').trim(),n:+m[1],held:+m[2],abs:+m[3],w:parseFloat(li.querySelector('.br i').style.width)};})}));
 check('sans college.js : tableau d’origine (référence)',ref.length===9);
 const key=r=>[r.id,r.name,r.n,r.held,r.abs,r.rate,r.w].join('|');
 check('Comparaison A : 9 lignes, mêmes chiffres que le tableau d’origine (classe, élèves, séances, abs., taux, barre)',!nw.tbl&&nw.h2==='Comparaison des classes'&&nw.rows.length===9&&JSON.stringify(nw.rows.map(key).sort())===JSON.stringify(ref.map(key).sort()),{nw:nw.rows.slice(0,2),ref:ref.slice(0,2)});
 const rv=x=>parseFloat(x.rate.replace(',','.'));
 check('classées du taux le plus élevé au plus bas, rang 1…9, badge de niveau',nw.rows.every((r,i)=>r.rk===i+1&&(i===0||rv(nw.rows[i-1])>=rv(r))&&/^(1BAC|2BAC|TC)$/.test(r.lv)),nw.rows.map(r=>r.rk+':'+r.rate+':'+r.lv));
 const vis=()=>N.evaluate(()=>({n:[...document.querySelectorAll('#homeCmp .qxa li')].filter(l=>l.getClientRects().length>0).length,tog:!!document.querySelector('#homeCmp h2 .q-tog'),ex:(document.querySelector('#homeCmp .q-tog')||{getAttribute:()=>null}).getAttribute('aria-expanded'),rot:(()=>{const s=document.querySelector('#homeCmp .q-tog svg');return s?getComputedStyle(s).transform:'';})(),k:localStorage.getItem('cj.ui.cmpOpen')}));
 let v=await vis();check('repliée par défaut : 3 premières classes, flèche à côté du titre',v.n===3&&v.tog&&v.ex==='false'&&v.k===null,v);
 await tap(N,'#homeCmp .q-tog');await sleep(350);v=await vis();
 check('flèche : dépliée (9 classes), flèche tournée, état mémorisé (cj.ui.cmpOpen = 1), écran inchangé',v.n===9&&v.ex==='true'&&v.rot!=='none'&&v.k==='1'&&await N.evaluate(()=>document.querySelector('.view.active').id)==='view-home',v);
 await N.evaluate(()=>CJR.cx.render());await settle(N);v=await vis();check('accueil redessiné : reste dépliée',v.n===9&&v.ex==='true',v);
 await tap(N,'#homeCmp .q-tog');await sleep(300);v=await vis();check('re-toucher : repliée (cj.ui.cmpOpen = 0)',v.n===3&&v.k==='0',v);
 await N.evaluate(()=>CJR.cx.render());await settle(N);
 check('accueil redessiné : barres classées conservées',await N.evaluate(()=>!document.querySelector('#homeCmp table.cmp')&&document.querySelectorAll('#homeCmp .qxa li').length===9));
 const first=nw.rows[0];await tap(N,'#homeCmp .qxa li:first-child');await settle(N);
 const t1=await N.evaluate(()=>({v:document.querySelector('.view.active').id,cls:CJR.db().ui.cls}));
 await O.evaluate(id=>document.querySelector('#homeCmp tr[data-cmpcls="'+id+'"]').click(),first.id);await settle(O);
 const t0=await O.evaluate(()=>({v:document.querySelector('.view.active').id,cls:CJR.db().ui.cls}));
 check('toucher une classe : ouvre ses absences, comme le tableau d’origine',t1.v==='view-attendance'&&t1.cls===first.id&&JSON.stringify(t0)===JSON.stringify(t1),{t0,t1});
 /* Élèves */
 await stu(O);await stu(N);await settle(O);await settle(N);
 const el=await N.evaluate(()=>{const q=s=>document.querySelector(s),r=x=>x.getBoundingClientRect(),cv=document.createElement('canvas').getContext('2d');
   const fits=sel=>{const s=q(sel),cs=getComputedStyle(s);cv.font=cs.fontWeight+' '+cs.fontSize+' '+cs.fontFamily;const tw=cv.measureText(s.options[s.selectedIndex].text).width;return tw+parseFloat(cs.paddingLeft)+22<=r(s).width;};
   const tiles=['bulkBtn','testsBtn','trombiBtn'].map(id=>{const b=document.getElementById(id),x=r(b);return {t:b.textContent.trim(),w:Math.round(x.width),h:Math.round(x.height),svg:!!b.querySelector('svg'),par:b.parentNode.className,ov:b.scrollWidth>b.clientWidth+1};});
   return {tools:!!q('#stuTools'),ph:q('#stuSearch').placeholder,fF:fits('#stuClassFilter'),fS:fits('#stuSort'),side:Math.round(r(q('#stuClassFilter')).top)===Math.round(r(q('#stuSort')).top),cnt:q('#stuCount').textContent,tiles,inPage:r(q('#stuTools')).right<=innerWidth};});
 check('Élèves A : « Rechercher un élève… », filtre et tri côte à côte sans texte coupé, compteur',el.tools&&el.ph==='Rechercher un élève…'&&el.fF&&el.fS&&el.side&&el.cnt==='347 sur 347 élèves'&&el.inPage,el);
 check('3 tuiles égales avec icône : « Importer des élèves », « Tests physiques », « Trombinoscope » (sans parenthèses, rien de coupé)',JSON.stringify(el.tiles.map(t=>t.t))===JSON.stringify(['Importer des élèves','Tests physiques','Trombinoscope'])&&el.tiles.every(t=>t.svg&&t.par==='ex-a'&&!t.ov&&t.w===el.tiles[0].w&&t.h===el.tiles[0].h),el.tiles);
 const L=p=>p.evaluate(()=>[document.getElementById('stuCount').textContent,[...document.querySelectorAll('#stuList li[data-sid],#stuList .stu')].slice(0,12).map(x=>x.textContent.replace(/\s+/g,' ').slice(0,40)).join('|')]);
 const act=async(p,f)=>{await p.evaluate(f);await settle(p);return L(p);};
 for(const [n,f] of [['filtre de classe (2e classe)',()=>{const s=document.getElementById('stuClassFilter');s.selectedIndex=2;s.dispatchEvent(new Event('change',{bubbles:true}));}],
   ['tri Nom Z→A',()=>{const s=document.getElementById('stuSort');s.value='name-desc';s.dispatchEvent(new Event('change',{bubbles:true}));}],
   ['recherche « F134 »',()=>{const s=document.getElementById('stuSearch');s.value='F134';s.dispatchEvent(new Event('input',{bubbles:true}));}]]){
   const a=await act(O,f),c=await act(N,f);check('même résultat que l’écran d’origine : '+n,JSON.stringify(a)===JSON.stringify(c)&&a[1].length>0,[a[0],c[0]]);}
 const md=await N.evaluate(async()=>{const o={};for(const id of ['bulkBtn','testsBtn','trombiBtn']){document.getElementById(id).click();await new Promise(r=>setTimeout(r,400));o[id]=[...document.querySelectorAll('.modal.open')].map(m=>m.id).join();document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));document.body.style.overflow='';}return o;});
 check('tuiles : mêmes actions (import en masse, tests physiques, trombinoscope)',md.bulkBtn==='bulkModal'&&md.testsBtn==='testModal'&&md.trombiBtn==='trombiModal',md);
 const fb=await O.evaluate(()=>({t:document.getElementById('bulkBtn').textContent,tbl:!!document.querySelector('#stuTools')}));
 check('sans college.js : présentation d’origine (repli sûr)',/Import en masse/.test(fb.t)&&!fb.tbl,fb);
 check('données identiques à l’écran d’origine après les mêmes actions (affichage seulement)',await J(N)===await J(O));
 const K1=await N.evaluate(()=>Object.keys(localStorage).sort());check('une seule nouvelle clé (affichage) : cj.ui.cmpOpen',K1.filter(k=>!K0.includes(k)).every(k=>k==='cj.ui.cmpOpen'||/^classRegister\.v2\.snapm?\.\d+$|^cahier\.snapDay$/.test(k)),K1.filter(k=>!K0.includes(k)));
 const D3=(()=>{const d=JSON.parse(LYC);const keep=d.classes.slice(0,3).map(c=>c.id);d.classes=d.classes.filter(c=>keep.includes(c.id));d.students=d.students.filter(x=>keep.includes(x.classId));return JSON.stringify(d);})();
 const P3=await page(D3,false);await home(P3);await settle(P3);
 const v3=await P3.evaluate(()=>({n:document.querySelectorAll('#homeCmp .qxa li').length,tog:!!document.querySelector('#homeCmp .q-tog')}));
 check('3 classes : toutes affichées, pas de flèche',v3.n===3&&!v3.tog,v3);
 check('aucune erreur JS',N.errs.length===0&&O.errs.length===0,[N.errs,O.errs]);
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})().catch(e=>{console.error(e);process.exit(1);});
