/* v1.28.0 : notes /20 (Évaluation OP 2007) — barèmes TC/1BAC/2BAC, saisie validée, note comportementale calculée, bascule Notes/Absences,
   APS par classe et cycle, champs additifs (s.ev, DB.evals) sans perte, compatibilité ancien client v1.27.0, relevé PDF, aperçu */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const OLD='/tmp/v27root';if(!fs.existsSync(OLD+'/index.html')){fs.mkdirSync(OLD,{recursive:true});cp.execSync('git -C '+D+' archive v1.27.0 | tar -x -C '+OLD);}
const SEM=(fs.readFileSync(D+'/index.html','utf8').match(/var APP_SEMVER='([^']+)'/)||[])[1];
const ROOT=D;const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const mk=ROOT=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);});const srv=mk(D).listen(8013),srvOld=mk(OLD).listen(8014);
const URL='http://localhost:8013/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
// ---- données de démonstration : 2BACSP4, sport collectif (Basket-ball), Lycée qualifiant Baja
const NAMES=[['AIT BENALI Yassine','G','J130245871'],['BENNANI Salma','F','J132457812'],['CHAKIR Omar','G','J135784521'],['DAOUDI Imane','F','J136985214'],['EL AMRANI Hamza','G','J138521479'],['محمد الإدريسي','G','J139874563'],['FASSI Nour','F','K140258963'],['GHALI Anas','G','K141369852'],['HAJJI Khadija','F','K142587413'],['فاطمة الزهراء العلوي','F','K143698521'],['IDRISSI Mehdi','G','K144785236'],['JABRI Sara','F','K145896314'],['KETTANI Ayoub','G','K146932587'],['LAHLOU Hiba','F','K147025896']];
await p.evaluate((KEY,N)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods[0]='Basket-ball';d.periods[1]='Athlétisme – vitesse';d.periods[2]='Gymnastique';
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n[0],sex:n[1],sid:n[2],dob:'',parent:'',phone:'',notes:'',created:1}));
  const tc=d.classes.find(x=>x.name==='1BACLSH1');d.students.push({id:'t0',classId:tc.id,name:'TEST Élève',sid:'J100000001',dob:'',parent:'',phone:'',notes:'',created:1});
  d.sessions={};const put=(s,id,m)=>{const k=c.id+'|0|'+s;d.sessions[k]=d.sessions[k]||{date:'',marks:{}};if(id)d.sessions[k].marks[id]=m;};
  for(let s=0;s<6;s++)put(s,null);
  // s2 : 2 A + 1 R + 1 ST → 3 − (1 + 0,25 + 0,5) = 1,25 ; s4 : 7 A → retrait limité à 3 → 0 ; s1 : 1 AJ + 1 MJ → 3 ; s6 : 1 M → 2,75
  put(0,'s2',{s:'A',j:false,r:''});put(1,'s2',{s:'A',j:false,r:''});put(2,'s2',{s:'L',j:false,r:''});put(3,'s2',{s:'ST',j:false,r:''});
  for(let s=0;s<6;s++)put(s,'s4',{s:'A',j:false,r:''});put(0,'s1',{s:'A',j:true,r:'Certificat'});put(1,'s1',{s:'M',j:true,r:''});put(2,'s6',{s:'M',j:false,r:''});put(4,'s9',{s:'L',j:false,r:''});
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY,NAMES);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const base=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);const CID=base.classes.find(x=>x.name==='2BACSP4').id;
// ---- barèmes OP 2007
const sc=await p.evaluate(()=>{const A=window.CJR,DB=A.db(),o={},nm={TC:'TCS1','1BAC':'1BACLSH9','2BAC':'2BACSP9'};
  ['TC','1BAC','2BAC'].forEach(l=>{const id='x'+l;DB.classes.push({id,name:nm[l]});['coll','athle','gym'].forEach((a,i)=>{DB.evals=DB.evals||{aps:{}};DB.evals.aps=DB.evals.aps||{};DB.evals.aps[id+'|'+i]=a;const s=A.gradeSpec(id,i);o[l+'-'+a]=s.cols.map(c=>c.max).join('+')+'+'+s.comp+'='+s.total;});DB.classes.pop();});delete DB.evals;return o;});
const expS={'TC-coll':'6+6+3+5=20','TC-athle':'6+6+3+5=20','TC-gym':'12+3+5=20','1BAC-coll':'6+7+3+4=20','1BAC-athle':'7+6+3+4=20','1BAC-gym':'13+3+4=20','2BAC-coll':'7+7+3+3=20','2BAC-athle':'7+7+3+3=20','2BAC-gym':'14+3+3=20'};
check('barèmes OP 2007 : athlétisme 6/7/7 + 6/6/7, sports collectifs 6/6/7 + 6/7/7, gymnastique 12/13/14, conceptuel 3, comportemental 5/4/3 = 20',Object.keys(expS).every(k=>sc[k]===expS[k]),JSON.stringify(sc));
const ag=await p.evaluate(()=>{const A=window.CJR;return [A.apsOf,0];});
// ---- écran Absences : colonnes notes par défaut
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(500);
const head=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent));
check('Absences, affichage par défaut « Notes /20 » (2BAC, sport collectif) : Indiv. /7 · Coll. /7 · Concept. /3 · Comport. /3 · Note /20 · Année',JSON.stringify(head)===JSON.stringify(['Indiv./7','Coll./7','Concept./3','Comport./3','Note/20','Année']),JSON.stringify(head));
const bar=await p.evaluate(()=>document.getElementById('attEval').textContent);
check('barre de barème : « Barème 2BAC », APS « Sport collectif » déduite de l’activité (Basket-ball), Indiv. /7 + Coll. /7 + Concept. /3 + Comport. /3 = 20',/Barème 2BAC/.test(bar)&&/Indiv\. \/7 \+ Coll\. \/7 \+ Concept\. \/3 \+ Comport\. \/3 = 20/.test(bar)&&await p.evaluate(()=>document.getElementById('attAps').value)==='coll',bar);
// ---- note comportementale calculée
const comp=await p.evaluate(()=>{const g=id=>{const tr=document.querySelector('#gridWrap tr[data-sid="'+id+'"]');return {v:tr.querySelector('td.comp').textContent,t:tr.querySelector('td.comp').title};};return {s0:g('s0'),s1:g('s1'),s2:g('s2'),s4:g('s4'),s6:g('s6'),s9:g('s9')};});
check('Comport. calculée : 3 − (0,5 × 2 A + 0,25 × 1 R + 0,5 × 1 ST) = 1,25 ; 6 A → 3 − 0,5 × 6 A = 0 ; AJ/MJ → 3 ; 1 M → 2,75 ; 1 R → 2,75 ; aucun → 3',comp.s2.v==='1,25'&&comp.s2.t==='Comport. = 3 − (0,5 × 2 A + 0,25 × 1 R + 0,5 × 1 ST) = 1,25'&&comp.s4.v==='0'&&comp.s4.t==='Comport. = 3 − 0,5 × 6 A = 0'&&comp.s1.v==='3'&&comp.s6.v==='2,75'&&comp.s9.v==='2,75'&&comp.s0.v==='3',JSON.stringify([comp.s2,comp.s4.t,comp.s1.v,comp.s6.v]));
// ---- saisie validée
async function type(sid,k,val){await p.evaluate((sid,k,val)=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input.gin[data-k="'+k+'"]');i.focus();i.value=val;i.dispatchEvent(new Event('change',{bubbles:true}));},sid,k,val);await sleep(60);}
const val=(sid,k)=>p.evaluate((sid,k)=>document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input.gin[data-k="'+k+'"]').value,sid,k);
await type('s0','g1','8');const r8=await val('s0','g1');await type('s0','g1','-1');const rm=await val('s0','g1');await type('s0','g1','abc');const ra=await val('s0','g1');
check('saisie refusée hors barème : 8 sur /7, −1, « abc » → case vide, rien enregistré',r8===''&&rm===''&&ra===''&&await p.evaluate(()=>!window.CJR.byId('s0').ev));
await type('s0','g1','6,5');await type('s0','g2','5.3');await type('s0','con','2,5');
const g0=await p.evaluate(CID=>{const tr=document.querySelector('#gridWrap tr[data-sid="s0"]');return {ev:window.CJR.byId('s0').ev,tot:tr.querySelector('td.tot').textContent,g2:tr.querySelector('input[data-k="g2"]').value};},CID);
check('saisie 6,5 / 5.3 (arrondi au quart → 5,25) / 2,5 : enregistrée dans s.ev["classe|0"], Note = 6,5 + 5,25 + 2,5 + 3 = 17,25',g0.ev&&g0.ev[CID+'|0'].g1===6.5&&g0.ev[CID+'|0'].g2===5.25&&g0.ev[CID+'|0'].con===2.5&&g0.ev[CID+'|0'].aps==='coll'&&g0.g2==='5,25'&&g0.tot==='17,25',JSON.stringify(g0));
await type('s2','g1','5');await type('s2','g2','4');const inc=await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s2"] td.tot').textContent);
await type('s2','con','1');const tot2=await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s2"] td.tot').textContent);
check('note incomplète « — » tant qu’il manque une note ; puis 5 + 4 + 1 + 1,25 = 11,25',inc==='—'&&tot2==='11,25',inc+' → '+tot2);
// démo : notes pour la plupart des élèves
const DEMO={s1:[6,6.5,2.5],s3:[5.5,6,2],s4:[3,4,1],s5:[6.5,7,3],s6:[4.5,5,2],s7:[5,5.5,1.5],s8:[6,6,2.5],s9:[7,6.5,3],s10:[4,4.5,1.5],s11:[5.5,6.5,2.5],s12:[3.5,4,1]};
for(const [sid,v] of Object.entries(DEMO)){await type(sid,'g1',String(v[0]).replace('.',','));await type(sid,'g2',String(v[1]).replace('.',','));await type(sid,'con',String(v[2]).replace('.',','));}
await type('s13','g1','6');
const foot=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tfoot td')].slice(-6).map(t=>t.textContent));
check('ligne de pied : moyennes de la classe par colonne',foot.length===6&&foot[4]!==''&&/,|\d/.test(foot[0]),JSON.stringify(foot));
// marquer une absence met à jour Comport. et la note
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s5"] td.c[data-s="5"]');td.click();});await sleep(300);
const s5=await p.evaluate(()=>{const tr=document.querySelector('#gridWrap tr[data-sid="s5"]');return [tr.querySelector('td.comp').textContent,tr.querySelector('td.tot').textContent];});
check('une absence ajoutée (S6) : Comport. 3 → 2,5 et Note 19,5 → 19 recalculées aussitôt',s5[0]==='2,5'&&s5[1]==='19',JSON.stringify(s5));
await p.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s5"] td.c[data-s="5"]');for(let i=0;i<6;i++)td.click();});await sleep(300);
const s5b=await p.evaluate(()=>window.CJR.db().sessions[window.CJR.db().ui.cls+'|0|5'].marks.s5||null);
check('retour à « Présent » après le cycle de codes (aucune marque résiduelle)',s5b===null,JSON.stringify(s5b));
// ---- capture d’aperçu (écran Absences, notes)
await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();window.scrollTo(0,0);});await sleep(2600);
await p.evaluate(()=>{const g=document.getElementById('attCard');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-118);const w=document.getElementById('gridWrap');w.scrollTop=0;w.scrollLeft=w.scrollWidth;});await sleep(300);
await p.screenshot({path:'/tmp/v28-notes-scroll.png'});console.log('INFO',await p.evaluate(()=>{const w=document.getElementById('gridWrap');return 'wrap '+w.clientWidth+' table '+w.querySelector('table').offsetWidth+' :: '+[...w.querySelectorAll('thead th')].map(t=>t.textContent.slice(0,8)+'='+t.offsetWidth).join(' ');}));
await p.evaluate(()=>{const w=document.getElementById('gridWrap');w.scrollLeft=0;window.scrollTo(0,0);});await sleep(200);
await p.screenshot({path:'/tmp/v28-notes-top.png'});
// ---- bascule Absences : compteurs conservés
await p.evaluate(()=>document.querySelector('#attView button[data-v="abs"]').click());await sleep(300);
const headA=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent));
const s2a=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tr[data-sid="s2"] td.t')].map(t=>t.textContent));
check('bascule « Absences » : colonnes Abs. · R · AJ · Pts · Année (compteurs intacts : s2 = 2 abs., 1 R, 0 AJ, −1,75 pts)',JSON.stringify(headA)===JSON.stringify(['Abs.','R','AJ','Pts','Année'])&&s2a[0]==='2'&&s2a[1]==='1'&&s2a[2]==='0'&&/1,75/.test(s2a[3]),JSON.stringify(s2a));
await p.evaluate(()=>document.querySelector('#attView button[data-v="notes"]').click());await sleep(300);
// ---- fiche élève : détail du calcul
await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s2"] td.comp').click());await sleep(400);
const det=await p.evaluate(()=>(document.getElementById('detComp')||{}).textContent||'');
check('toucher Comport. ouvre la fiche : formule « Comport. (Cycle 1) = 3 − (0,5 × 2 A + 0,25 × 1 R + 0,5 × 1 ST) = 1,25 » + coefficients',/Comport\. \(Cycle 1\) = 3 − \(0,5 × 2 A \+ 0,25 × 1 R \+ 0,5 × 1 ST\) = 1,25/.test(det)&&/A 0,5 · AJ 0 · M 0,25 · MJ 0 · R 0,25 · ST 0,5/.test(det),det.slice(0,200));
await p.evaluate(()=>{const m=document.querySelector('#detModal [data-close]');m&&m.click();});await sleep(200);
// ---- données : seules les nouvelles clés additives changent
const after=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
const canon=o=>Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.keys(o).sort().reduce((a,k)=>(a[k]=canon(o[k]),a),{}):o;
const strip=o=>{const c=JSON.parse(JSON.stringify(o));c.students.forEach(s=>delete s.ev);delete c.evals;delete c.ui;delete c.lastBackup;return canon(c);};
await sleep(400);const after2=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);{const A=strip(base),B=strip(after2);for(const k of Object.keys(A))if(JSON.stringify(A[k])!==JSON.stringify(B[k]))console.log('DIFF',k,JSON.stringify(A[k]).slice(0,300),'\n   ',JSON.stringify(B[k]).slice(0,300));}
check('données inchangées hors champs additifs : séances, élèves (hors ev), classes, réglages identiques ; clé classRegister.v2 seule',JSON.stringify(strip(base))===JSON.stringify(strip(after))&&after.students.filter(s=>s.ev).length===14,after.students.filter(s=>s.ev).length+' élèves notés');
// ---- APS : gymnastique
await p.select('#attAps','gym').catch(()=>{});
await sleep(500);
const headG=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent));
const s0g=await p.evaluate(()=>{const tr=document.querySelector('#gridWrap tr[data-sid="s0"]');return {g1:tr.querySelector('input[data-k="g1"]').value,tot:tr.querySelector('td.tot').textContent,over:tr.querySelector('td.g').classList.contains('over')};});
const evAps=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)).evals,KEY);
check('APS « Gymnastique » (2BAC) : Gym. /14 · Concept. /3 · Comport. /3 · Note /20 ; avertissement (note Coll. sans colonne : conservée, non comptée → 6,5 + 2,5 + 3 = 12), enregistré dans DB.evals.aps',JSON.stringify(headG)===JSON.stringify(['Gym./14','Concept./3','Comport./3','Note/20','Année'])&&dialogs.some(m=>/dépassent le barème « Gymnastique »/.test(m))&&s0g.tot==='12'&&evAps&&evAps.aps[CID+'|0']==='gym'&&s0g.g1==='6,5',JSON.stringify({headG,s0g,evAps}));
await p.select('#attAps','coll');await sleep(300);
const back=await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s0"] td.tot').textContent);
check('retour « Sport collectif » : notes et total inchangés (17,25)',back==='17,25',back);
// ---- persistance + normalisation
await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(400);
const per=await p.evaluate(()=>document.querySelector('#gridWrap tr[data-sid="s0"] td.tot').textContent);
check('après rechargement : notes conservées (normalisation de s.ev et DB.evals)',per==='17,25',per);
// ---- PDF relevé de notes
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);try{await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});}catch(e){return null;}
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:x.name,b64:btoa(s)};});
  const f='/tmp/v28_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));return {f,name:r.name};}
const pg=await pdf(()=>document.getElementById('attGradesPdf').click());
if(pg){fs.copyFileSync(pg.f,'/tmp/v28-releve.pdf');const t=cp.execSync('pdftotext -layout '+pg.f+' -').toString(),tn=t.replace(/\s+/g,' ');
  check('PDF relevé : nom Releve-notes_Cycle-1_2BACSP4, en-tête « Cahier d’EPS », titre « Relevé de notes · Cycle 1 », barème 2BAC OP 2007, colonnes',/^Releve-notes_Cycle_1_2BACSP4_/.test(pg.name)&&/Cahier d’EPS/.test(t)&&/Relevé de notes · Cycle 1/.test(tn)&&/barème 2BAC – Évaluation OP 2007 : Indiv\. \/7 \+ Coll\. \/7 \+ Concept\. \/3 \+ Comport\. \/3 = 20/.test(tn)&&/Indiv\. \/7/.test(tn)&&/Note \/20/.test(tn),pg.name);
  check('PDF : pied de page « Cahier d’EPS v'+SEM+' », école Lycée qualifiant Baja',new RegExp('Cahier d’EPS v'+SEM.replace(/\./g,'\\.')).test(tn)&&/Lycée qualifiant Baja/.test(tn));
  const ord=NAMES.map(n=>n[0]).filter(n=>!/[\u0600-\u06FF]/.test(n));const pos=ord.map(n=>tn.indexOf(n));
  check('PDF : ordre Massar/alphabétique de l’application, notes et totaux (AIT BENALI 17,25, CHAKIR 11,25, KETTANI incomplet)',pos.every((x,i)=>x>=0&&(i===0||x>pos[i-1]))&&/AIT BENALI Yassine.*?17,25/.test(tn)&&/CHAKIR Omar.*?11,25/.test(tn),JSON.stringify(pos));
  check('PDF : formule de la note comportementale et moyenne de la classe',/Comport\. \(note comportementale \/3\) = 3 – points retirés du cycle \(au plus 3\)/.test(tn)&&/Moyenne de la classe/.test(tn));
  const g=cp.execSync('/workspace/fonts/v/bin/python /workspace/cj-emu/ar_chk.py '+pg.f+' "محمد الإدريسي" "فاطمة الزهراء العلوي"',{encoding:'utf8'}).trim();
  check('PDF : noms arabes présents (محمد الإدريسي, فاطمة الزهراء العلوي)',g==='2/2',g.slice(0,120));
}else check('PDF relevé de notes généré',false);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(400);
await p.evaluate(CID=>{const c=document.getElementById('expClass');c.value=CID;c.dispatchEvent(new Event('change',{bubbles:true}));const e=document.getElementById('expPeriod');e.value='0';e.dispatchEvent(new Event('change',{bubbles:true}));},CID);
const pg2=await pdf(()=>document.getElementById('pdfGrades').click());
check('Paramètres › Exports : bouton « Relevé de notes /20 » (classe + cycle) → même relevé',!!pg2&&/^Releve-notes_Cycle_1_2BACSP4_/.test(pg2.name)&&/AIT BENALI Yassine/.test(cp.execSync('pdftotext -layout '+pg2.f+' -').toString()),pg2&&pg2.name);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(300);
// ---- compatibilité : ancien client v1.27.0 conserve les notes (champ élève inconnu préservé)
const raw28=await p.evaluate(K=>localStorage.getItem(K),KEY);const ctx2=await b.createBrowserContext();const q=await ctx2.newPage();q.on('pageerror',e=>errs.push('old:'+e.message));
await q.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});await q.goto(URL.replace('8013','8014'),{waitUntil:'networkidle2'});
await q.evaluate((K,r)=>localStorage.setItem(K,r),KEY,raw28);await q.reload({waitUntil:'networkidle2'});
const oldSem=await q.evaluate(()=>window.CJR.semver);
await q.evaluate(()=>{const A=window.CJR,DB=A.db();DB.settings.threshold=DB.settings.threshold;});
await q.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.querySelector('#tabs button[data-tab="attendance"]').click();});await sleep(300);
await q.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="0"]');td.click();});await sleep(600);
const oldRaw=await q.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
check('ancien client v'+oldSem+' qui enregistre (une marque ajoutée) : notes s.ev conservées pour les 14 élèves ; DB.evals ignoré',oldSem==='1.27.0'&&oldRaw.students.filter(s=>s.ev).length===14&&oldRaw.students.find(s=>s.id==='s0').ev[CID+'|0'].g1===6.5,JSON.stringify(oldRaw.students.find(s=>s.id==='s0').ev)+' evals='+JSON.stringify(oldRaw.evals));
await q.evaluate(()=>{const td=document.querySelector('#gridWrap tr[data-sid="s0"] td.c[data-s="0"]');for(let i=0;i<6;i++)td.click();});await sleep(600);
const back27=await q.evaluate(K=>localStorage.getItem(K),KEY);await ctx2.close();
await p.evaluate((K,r)=>localStorage.setItem(K,r),KEY,back27);await p.reload({waitUntil:'networkidle2'});await unlock();await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(400);
const reb=await p.evaluate(()=>({tot:document.querySelector('#gridWrap tr[data-sid="s0"] td.tot').textContent,aps:document.getElementById('attAps').value}));
check('retour sur v'+SEM+' : notes intactes, APS retrouvée depuis les notes (coll)',reb.tot==='17,25'&&reb.aps==='coll',JSON.stringify(reb));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();srvOld.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
