/* 1.29.2 (k) : niveau de chaque classe visible ; nom non reconnu → « Niveau ? » + choix du niveau (= renommer la classe) ; collège : aucune note calculée sans niveau.
   Sert /workspace/cj-deploy (port 8049), profil jetable, réseau externe coupé, données de démonstration locales jamais synchronisées. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8049,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const REN={'1BACSH1':'1AC1','1BACLSH2':'1AC2','1BACLSH4':'2AC1','2BACSP4':'2AC2','2BACSP5':'2AC3','2BACSP6':'3AC1','2BACSVT2':'3AC2','2BACSVT1':'Groupe A','1BACSH3':'1AC3'};
const COL=(()=>{const d=JSON.parse(LYC);d.classes.forEach(c=>c.name=REN[c.name]||c.name);d.settings.school='college';return JSON.stringify(d);})();
const LYU=(()=>{const d=JSON.parse(LYC);d.classes.find(c=>c.name==='2BACSVT1').name='Groupe A';return JSON.stringify(d);})();
let b;
async function page(data,block){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
  await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&/college\.js/.test(u))return q.abort();(u.startsWith('http://localhost:'+PORT)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});
  if(!block)await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});await sleep(900);p.ctx=ctx;return p;}
const GRADES=()=>{const R=CJR,d=R.db(),o={};d.classes.forEach(c=>d.periods.forEach((x,pi)=>R.studentsIn(c.id).forEach(s=>{const g=R.gradeOf?R.gradeOf(c.id,s.id,pi):null;})));return o;};
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const att=async(p,name)=>p.evaluate(async n=>{const d=CJR.db(),c=d.classes.find(x=>x.name===n);d.ui.cls=c.id;d.ui.per=d.periods.findIndex((x,i)=>CJR.cycAps(i)==='coll');document.querySelector('#tabs button[data-tab="attendance"]').click();CJR.cx.render();await new Promise(r=>setTimeout(r,250));
   const w=document.getElementById('cxLvW-att');return {warn:w&&w.textContent,picks:w?[...w.querySelectorAll('[data-cxl]')].map(x=>x.textContent):[],tots:[...document.querySelectorAll('#gridWrap td.tot')].map(x=>x.textContent),calc:d.periods.some((x,pi)=>CJR.studentsIn(c.id).some(s=>(g=>g.total!=null||g.proc!=null)(CJR.gradeOf(c.id,s.id,pi)))),opt:[...document.getElementById('attClass').options].find(o=>o.value===c.id).textContent};},name);
 /* collège : 8 classes reconnues + « Groupe A » */
 const p=await page(COL);const j0=await p.evaluate(()=>CJApp.getJSON());
 const cards=await p.evaluate(async()=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open('cls');await new Promise(r=>setTimeout(r,300));return [...document.querySelectorAll('#clsManage .clb-card')].map(k=>k.querySelector('.clb-n').textContent+'='+(k.querySelector('.cx-lvb')||{}).textContent+(k.querySelector('.cx-lvq')?'!':''));});
 check('Paramètres › Classes : pastille de niveau sur chaque carte (1AC/2AC/3AC), « Niveau ? » pour « Groupe A »',cards.length===9&&cards.includes('1AC1=1AC')&&cards.includes('2AC2=2AC')&&cards.includes('3AC2=3AC')&&cards.includes('Groupe A=Niveau ?!')&&cards.filter(x=>x.endsWith('!')).length===1,cards);
 await p.evaluate(async()=>{for(const t of ['attendance','proc','students']){document.querySelector('#tabs button[data-tab="'+t+'"]').click();await new Promise(r=>setTimeout(r,150));}});
 const opts=await p.evaluate(()=>['attClass','procClass','stuClassFilter'].map(id=>[...document.getElementById(id).options].map(o=>o.textContent)));
 check('sélecteurs de classe (Notes /20, Note procéd., Élèves) : « 1AC1 (40) · 1AC », « Groupe A (…) · Niveau ? »',opts.every(L=>L.some(t=>/^1AC1 \(\d+\) · 1AC$/.test(t))&&L.some(t=>/^Groupe A \(\d+\) · Niveau \?$/.test(t))),opts);
 const oth=await p.evaluate(()=>[...document.getElementById('repClass').options].map(o=>o.textContent).concat([...document.getElementById('expClass').options].map(o=>o.textContent)).filter(t=>/ · /.test(t)));
 check('autres listes de classes (Rapports, exports) : libellés inchangés',oth.length===0,oth);
 const a1=await att(p,'Groupe A');
 check('Notes /20 « Groupe A » : message « Niveau non reconnu — choisis le niveau » + choix 1AC / 2AC / 3AC',/Niveau non reconnu — choisis le niveau/.test(a1.warn||'')&&a1.picks.join()==='1AC,2AC,3AC'&&/rien n’est effacé/.test(a1.warn),a1);
 check('collège, niveau inconnu : aucune note /20 calculée (toutes « — », tous cycles)',a1.tots.length>10&&a1.tots.every(t=>t==='—')&&!a1.calc,a1.tots.slice(0,5));
 const gg=await p.evaluate(()=>{const d=CJR.db(),c=d.classes.find(x=>x.name==='Groupe A'),pi=d.periods.findIndex((x,i)=>CJR.cycAps(i)==='athle'),s=CJR.studentsIn(c.id)[0];return {ath:CJR.athEs(c.id,s.id,pi,['10.5']),json:null};});
 check('athlétisme, niveau inconnu : Produit non calculé (err lv)',gg.ath&&gg.ath.err==='lv',gg);
 const pr=await p.evaluate(async()=>{document.querySelector('#tabs button[data-tab="proc"]').click();await new Promise(r=>setTimeout(r,250));const w=document.getElementById('cxLvW-proc');return {w:!!w&&w.offsetHeight>0,sub:[...document.querySelectorAll('#procWrap td.sub')].map(x=>x.textContent).slice(0,40)};});
 check('Note procéd. « Groupe A » : même message, note procédurale « — »',pr.w&&pr.sub.length&&pr.sub.every(t=>t==='—'),pr);
 check('affichage seul : données enregistrées inchangées',await p.evaluate(()=>CJApp.getJSON())===j0);
 const a2=await att(p,'1AC1');
 check('classe reconnue : pas de message, notes calculées',!a2.warn&&a2.calc,a2.warn);
 /* choix du niveau = renommer après confirmation */
 await att(p,'Groupe A');await p.evaluate(()=>document.querySelector('#cxLvW-att [data-cxl="2AC"]').click());await sleep(100);
 const cf=await p.evaluate(()=>document.getElementById('cxLvW-att').textContent);
 check('choisir 2AC → confirmation « Renommer « Groupe A » en « 2AC-Groupe A » ? »',/Renommer «\u00a0Groupe A\u00a0» en «\u00a0 ?2AC-Groupe A\u00a0» ?\u00a0\?/.test(cf)||/Renommer «.Groupe A.» en «.2AC-Groupe A.»/.test(cf),cf);
 check('rien n’est modifié avant « Renommer »',await p.evaluate(()=>CJApp.getJSON())===j0);
 await p.evaluate(()=>document.querySelector('#cxLvW-att [data-cxno]').click());await sleep(100);
 check('Annuler : choix des niveaux réaffiché',await p.evaluate(()=>document.querySelectorAll('#cxLvW-att [data-cxl]').length===3));
 await p.evaluate(()=>document.querySelector('#cxLvW-att [data-cxl="2AC"]').click());await sleep(80);await p.evaluate(()=>document.querySelector('#cxLvW-att [data-cxgo]').click());await sleep(700);
 const af=await p.evaluate(()=>{const d=JSON.parse(CJApp.getJSON()),c=d.classes.find(x=>x.name==='2AC-Groupe A');return {c:!!c,lv:c&&CJR.levelOf(c.name),keys:c&&Object.keys(c).sort().join(),w:!!document.getElementById('cxLvW-att'),calc:d.periods.some((x,pi)=>CJR.studentsIn(c.id).some(s=>(g=>g.total!=null||g.proc!=null)(CJR.gradeOf(c.id,s.id,pi))))};});
 check('Renommer : classe « 2AC-Groupe A » (niveau 2AC), aucun nouveau champ de classe, message retiré, notes calculées',af.c&&af.lv==='2AC'&&!/lv|level/.test(af.keys)&&!af.w&&af.calc,af);
 const j1=JSON.parse(await p.evaluate(()=>CJApp.getJSON())),J0=JSON.parse(j0);J0.classes.forEach(c=>{if(c.name==='Groupe A')c.name='2AC-Groupe A';});delete J0.ui;delete j1.ui;/* points V/B : valeurs par défaut ajoutées par toute sauvegarde depuis 1.29.2 (f), hors de cette modification */['V','B'].forEach(k=>{if(!(k in J0.settings.points))delete j1.settings.points[k];});
 check('seule modification enregistrée : le nom de la classe',JSON.stringify(J0)===JSON.stringify(j1),[J0.settings,j1.settings]);
 check('noms proposés reconnus : 1AC-/2AC-/3AC- (collège)',await p.evaluate(()=>['1AC-X','2AC-Groupe A','3AC-B 2'].map(CJR.levelOf).join()==='1AC,2AC,3AC'));
 check('collège : aucune erreur JS',!p.errs.length,p.errs);await p.ctx.close();
 /* lycée : « Groupe A » non reconnu → pastille + message, calcul inchangé (2BAC comme avant) */
 const q0=await page(LYU,true);const l0=await q0.evaluate(()=>{const d=CJR.db(),o=[];d.classes.forEach(c=>d.periods.forEach((x,pi)=>CJR.studentsIn(c.id).forEach(s=>{const g=CJR.gradeOf(c.id,s.id,pi);o.push(g.total+'|'+g.proc);})));return o.join();});await q0.ctx.close();
 const q=await page(LYU);const l1=await q.evaluate(()=>{const d=CJR.db(),o=[];d.classes.forEach(c=>d.periods.forEach((x,pi)=>CJR.studentsIn(c.id).forEach(s=>{const g=CJR.gradeOf(c.id,s.id,pi);o.push(g.total+'|'+g.proc);})));return o.join();});
 check('lycée : toutes les notes /20 et procédurales identiques avec ou sans college.js (y compris la classe non reconnue)',l0===l1&&l0.length>1000);
 const la=await att(q,'Groupe A');
 check('lycée « Groupe A » : message + choix TC / 1BAC / 2BAC, barème 2BAC par défaut (comme avant), notes calculées',/Niveau non reconnu/.test(la.warn||'')&&la.picks.join()==='TC,1BAC,2BAC'&&/barème 2BAC appliqué par défaut/.test(la.warn)&&la.calc,la);
 const lc=await q.evaluate(async()=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open('cls');await new Promise(r=>setTimeout(r,300));return [...document.querySelectorAll('#clsManage .cx-lvb')].map(x=>x.textContent);});
 check('lycée : pastilles TC/1BAC/2BAC et « Niveau ? »',lc.includes('1BAC')&&lc.includes('2BAC')&&lc.includes('Niveau ?'),lc);
 check('lycée : aucune erreur JS',!q.errs.length,q.errs);await q.ctx.close();
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
