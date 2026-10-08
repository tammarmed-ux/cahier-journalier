/* v1.28.0 : « Note procédurale » (OP 2007) — 3e affichage de l’écran Absences, synchronisé avec Notes /20 (même champ s.ev), maxima par niveau,
   athlétisme (Produit / Performance, performance brute facultative, barèmes branchables sans changement de schéma), sports collectifs, gymnastique, PDF */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8015);
const URL='http://localhost:8015/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
const NAMES=[['AIT BENALI Yassine','G','J130245871'],['BENNANI Salma','F','J132457812'],['CHAKIR Omar','G','J135784521'],['DAOUDI Imane','F','J136985214'],['EL AMRANI Hamza','G','J138521479'],['محمد الإدريسي','G','J139874563'],['FASSI Nour','F','K140258963'],['GHALI Anas','G','K141369852'],['HAJJI Khadija','F','K142587413'],['فاطمة الزهراء العلوي','F','K143698521'],['IDRISSI Mehdi','G','K144785236'],['JABRI Sara','F','K145896314']];
await p.evaluate((KEY,N)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods[0]='Basket-ball';d.periods[1]='Athlétisme – vitesse';d.periods[2]='Gymnastique';
  d.classes.push({id:'ctc1',name:'TCS1'});
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n[0],sex:n[1],sid:n[2],dob:'',parent:'',phone:'',notes:'',created:1}));
  d.students.push({id:'t0',classId:'ctc1',name:'TAZI Rim',sex:'F',sid:'M100000001',dob:'',parent:'',phone:'',notes:'',created:1});
  d.sessions={};const put=(per,s,id,m)=>{const k=c.id+'|'+per+'|'+s;d.sessions[k]=d.sessions[k]||{date:'',marks:{}};if(id)d.sessions[k].marks[id]=m;};
  for(let s=0;s<6;s++){put(0,s,null);put(1,s,null);}
  put(0,0,'s2',{s:'A',j:false,r:''});put(0,1,'s2',{s:'A',j:false,r:''});put(0,2,'s2',{s:'L',j:false,r:''});put(0,3,'s2',{s:'ST',j:false,r:''});put(0,2,'s6',{s:'M',j:false,r:''});
  put(1,1,'s3',{s:'A',j:false,r:''});put(1,2,'s7',{s:'L',j:false,r:''});
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY,NAMES);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const base=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);const CID=base.classes.find(x=>x.name==='2BACSP4').id;
const tab=()=>p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());
const view=async v=>{await p.evaluate(v=>document.querySelector('#attView button[data-v="'+v+'"]').click(),v);await sleep(250);};
const cycle=async n=>{await p.evaluate(n=>document.querySelector('#attPeriods [data-p="'+n+'"]').click(),n);await sleep(300);};
const head=()=>p.evaluate(()=>[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent));
async function type(sid,k,val){await p.evaluate((sid,k,val)=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input[data-k="'+k+'"]');i.focus();i.value=val;i.dispatchEvent(new Event('change',{bubbles:true}));i.blur();},sid,k,val);await sleep(50);}
const val=(sid,k)=>p.evaluate((sid,k)=>{const i=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] input[data-k="'+k+'"]');return i?i.value:null;},sid,k);
const cell=(sid,c)=>p.evaluate((sid,c)=>{const t=document.querySelector('#gridWrap tr[data-sid="'+sid+'"] td.'+c);return t?t.textContent:null;},sid,c);
await tab();await sleep(500);
// ---- placement : bascule à 3 positions sur l’écran Absences
const seg=await p.evaluate(()=>{const bs=[...document.querySelectorAll('#attView button')];return {t:bs.map(b=>b.textContent),on:bs.filter(b=>b.classList.contains('on')).map(b=>b.dataset.v),fit:bs.every(b=>{const r=b.getBoundingClientRect();return r.left>=0&&r.right<=innerWidth&&r.height>=36;}),ovf:document.documentElement.scrollWidth-innerWidth,bar:document.querySelectorAll('#tabs button').length};});
check('écran Absences : bascule « Absences | Note procédurale | Notes /20 » (Notes /20 par défaut), entièrement visible sur iPhone, barre du bas à 5 onglets inchangée',JSON.stringify(seg.t)==='["Absences","Note procédurale","Notes /20"]'&&seg.on[0]==='notes'&&seg.fit&&seg.ovf<=0&&seg.bar===5,JSON.stringify(seg));
// ---- sport collectif 2BAC
await view('proc');
check('Note procédurale, sport collectif 2BAC : Individuel /7 · Collectif /7 · Procéd. /14 (+ Année)',JSON.stringify(await head())==='["Individuel/7","Collectif/7","Procéd./14","Année"]',JSON.stringify(await head()));
const barP=await p.evaluate(()=>document.getElementById('attEval').textContent);
check('barre : « Note procédurale · barème 2BAC », APS, Individuel /7 + Collectif /7 = 14',/Note procédurale · barème 2BAC/.test(barP)&&/Individuel \/7 \+ Collectif \/7 = 14/.test(barP)&&!/Performance brute/.test(barP),barP);
await type('s0','g1','8');const r8=await val('s0','g1');
check('saisie hors barème refusée dans la Note procédurale (8 sur /7)',r8===''&&await p.evaluate(()=>!window.CJR.byId('s0').ev));
await type('s0','g1','6,5');await type('s0','g2','5');
check('saisie dans Note procédurale : Procéd. = 6,5 + 5 = 11,5',await cell('s0','sub')==='11,5',await cell('s0','sub'));
await view('notes');
const n1={g1:await val('s0','g1'),g2:await val('s0','g2'),tot:await cell('s0','tot')};
check('synchronisation Note procédurale → Notes /20 : Indiv. 6,5 · Coll. 5 affichés, note « — » (Concept. manquante)',n1.g1==='6,5'&&n1.g2==='5'&&n1.tot==='—',JSON.stringify(n1));
await type('s0','con','2');await type('s0','g1','7');
check('Notes /20 : Concept. 2 → Note = 7 + 5 + 2 + 3 = 17',await cell('s0','tot')==='17',await cell('s0','tot'));
await view('proc');
check('synchronisation Notes /20 → Note procédurale : Individuel 7, Procéd. 12',await val('s0','g1')==='7'&&await cell('s0','sub')==='12');
const ev0=await p.evaluate(CID=>window.CJR.byId('s0').ev,CID);
check('une seule source : s.ev["classe|0"] = {g1:7, g2:5, con:2, aps, t} (aucun stockage en double)',JSON.stringify(Object.keys(ev0))===JSON.stringify([CID+'|0'])&&ev0[CID+'|0'].g1===7&&ev0[CID+'|0'].g2===5&&ev0[CID+'|0'].con===2&&JSON.stringify(Object.keys(ev0[CID+'|0']).sort())==='["aps","con","g1","g2","t"]',JSON.stringify(ev0));
// démo : notes saisies dans la Note procédurale, Concept. dans Notes /20
const DEMO={s1:[6,6.5,2.5],s2:[5,4,1],s3:[5.5,6,2],s4:[3,4,1],s5:[6.5,7,3],s6:[4.5,5,2],s7:[5,5.5,1.5],s8:[6,6,2.5],s9:[7,6.5,3],s10:[4,4.5,1.5]};
const fr=x=>String(x).replace('.',',');
for(const [sid,v] of Object.entries(DEMO)){await type(sid,'g1',fr(v[0]));await type(sid,'g2',fr(v[1]));}await type('s11','g1','6');
const footP=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tfoot td')].slice(-4).map(t=>t.textContent));
check('pied : moyennes Individuel / Collectif / Procéd.',footP[2]!==''&&/\d/.test(footP[0]),JSON.stringify(footP));
await view('notes');for(const [sid,v] of Object.entries(DEMO))await type(sid,'con',fr(v[2]));
check('Notes /20 : totaux à partir des notes saisies dans la Note procédurale (s2 : 5 + 4 + 1 + 1,25 = 11,25 ; s6 : 4,5 + 5 + 2 + 2,75 = 14,25 ; s11 incomplet)',await cell('s2','tot')==='11,25'&&await cell('s6','tot')==='14,25'&&await cell('s11','tot')==='—',[await cell('s2','tot'),await cell('s6','tot')].join(' '));
// captures : Notes /20 (sport collectif)
const shot=async(file)=>{await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();});await sleep(2600);await p.setViewport({width:390,height:1240,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(300);
  await p.evaluate(()=>{const g=document.getElementById('attView');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-112);const w=document.getElementById('gridWrap');w.scrollTop=0;w.scrollLeft=w.scrollWidth;});await sleep(300);await p.screenshot({path:file});
  await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(200);};
await shot('/tmp/v28p-notes-coll.png');
await view('proc');await shot('/tmp/v28p-proc-coll.png');
// ---- PDF : note procédurale dans le relevé
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);try{await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});}catch(e){return null;}
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:x.name,b64:btoa(s)};});
  const f='/tmp/v28p_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));return {f,name:r.name,t:cp.execSync('pdftotext -layout '+f+' -').toString()};}
const pc=await pdf(()=>document.getElementById('attGradesPdf').click());
check('PDF relevé (sport collectif) : colonne « Procéd. /14 » (AIT BENALI 7 · 5 · 12 · 2 … 17) et formule de la note procédurale',!!pc&&/Procéd\. \/14/.test(pc.t)&&/AIT BENALI Yassine\s+7\s+5\s+12\s+2\b/.test(pc.t)&&/Note procédurale \/14 = note individuelle \+ note collective/.test(pc.t.replace(/\s+/g,' ')),pc&&(pc.t.split('\n').find(l=>/AIT BENALI/.test(l))||'').trim());
if(pc)fs.copyFileSync(pc.f,'/tmp/v28p-coll.pdf');
// ---- athlétisme (cycle 2)
await cycle(1);
check('Note procédurale, athlétisme 2BAC : Produit /7 · Performance /7 · Procéd. /14 (APS déduite de « Athlétisme – vitesse »)',JSON.stringify(await head())==='["Produit/7","Performance/7","Procéd./14","Année"]',JSON.stringify(await head()));
const barA=await p.evaluate(()=>({t:document.getElementById('attEval').textContent,raw:!!document.getElementById('attRaw'),rawOn:document.getElementById('attRaw')&&document.getElementById('attRaw').checked,evt:!!document.getElementById('attEvt')}));
check('athlétisme : « Performance brute (facultatif) » décochée par défaut, pas de choix d’épreuve tant qu’aucun barème officiel n’est fourni, note saisie à la main',barA.raw&&!barA.rawOn&&!barA.evt&&/saisie à la main \(barèmes officiels à venir\)/.test(barA.t),JSON.stringify(barA));
const ATH={s0:[6,5.5],s1:[5.5,6,'13,1'],s2:[4.5,4,'14,6'],s3:[6.5,6.5,'12,4'],s4:[3.5,3,'15,2'],s5:[7,6.5,'12,2'],s6:[5,5,'13,4'],s7:[6,5.5],s8:[4,4.5]};
for(const [sid,v] of Object.entries(ATH)){await type(sid,'g1',fr(v[0]));await type(sid,'g2',fr(v[1]));}
check('athlétisme : Procéd. = Produit + Performance (s3 : 6,5 + 6,5 = 13)',await cell('s3','sub')==='13',await cell('s3','sub'));
await p.evaluate(()=>{const c=document.getElementById('attRaw');c.click();});await sleep(300);
check('case cochée : colonne « Perf. brute » à côté de la note Performance ; sur iPhone les 4 colonnes tiennent à côté des noms',(await head()).map(t=>t.replace('temps/dist.','')).join('|')==='Produit/7|Perf. brute|Performance/7|Procéd./14|Année'&&await p.evaluate(()=>{const w=document.getElementById('gridWrap');w.scrollLeft=w.scrollWidth;const nm=document.querySelector('#gridWrap thead th.nm').getBoundingClientRect().right,g=document.querySelector('#gridWrap tbody tr[data-sid] td.t.g').getBoundingClientRect().left;w.scrollLeft=0;return g>=nm-1;}),JSON.stringify(await head()));
for(const [sid,v] of Object.entries(ATH))if(v[2])await type(sid,'pr',v[2]);
const ev3=await p.evaluate(CID=>window.CJR.byId('s3').ev[CID+'|1'],CID);
check('performance brute enregistrée dans le même champ (ev.pr = « 12,4 »), note Performance inchangée sans barème (6,5)',ev3.pr==='12,4'&&ev3.g2===6.5&&await val('s3','g2')==='6,5',JSON.stringify(ev3));
await view('notes');
const hn=await head();const sn={g1:await val('s3','g1'),g2:await val('s3','g2')};
check('Notes /20 athlétisme : Produit /7 · Perf. /7 · Concept. /3 · Comport. /3 · Note /20, mêmes valeurs (6,5 · 6,5)',JSON.stringify(hn)==='["Produit/7","Perf./7","Concept./3","Comport./3","Note/20","Année"]'&&sn.g1==='6,5'&&sn.g2==='6,5',JSON.stringify([hn,sn]));
await type('s3','g2','6');await view('proc');
check('modification dans Notes /20 → Note procédurale (Performance 6, Procéd. 12,5) ; performance brute conservée',await val('s3','g2')==='6'&&await cell('s3','sub')==='12,5'&&await val('s3','pr')==='12,4');
await shot('/tmp/v28p-proc-athle.png');
// barème branché (fictif, pour le test uniquement) : la note Performance est proposée d’après la performance brute
await p.evaluate(()=>{window.CJR.PERF_TABLES.__test={l:'Épreuve de test (fictive)',u:'s',low:true,'2BAC':{G:[[12.5,7],[13.5,6],[14.5,5]],F:[[13.5,7],[14.5,6]]}};});
await p.evaluate(()=>window.renderAttendance?0:0);await view('notes');await view('proc');
const hasEvt=await p.evaluate(()=>!!document.getElementById('attEvt'));
await p.select('#attEvt','__test');await sleep(300);
await type('s7','pr','13,2');const g8=await val('s7','g2');await type('s1','pr','14,4');const g1f=await val('s1','g2');
check('barème branché sans changement de schéma : choix d’épreuve (DB.evals.evt), 13,2 s (garçon) → 6 ; 14,4 s (fille) → 6',hasEvt&&g8==='6'&&g1f==='6'&&await p.evaluate(K=>JSON.parse(localStorage.getItem(K)).evals.evt[Object.keys(JSON.parse(localStorage.getItem(K)).evals.evt)[0]]==='__test',KEY),JSON.stringify({hasEvt,g8,g1f}));
check('lecture des performances : 12,4 · 1\'45 · 1:45.3 · 4,20 m · 420 cm',await p.evaluate(()=>{const f=window.CJR.perfParse;return f('12,4')===12.4&&f("1'45")===105&&Math.abs(f('1:45.3')-105.3)<1e-9&&f('4,20 m')===4.2&&f('420 cm')===4.2&&f('abc')===null;}));
await p.select('#attEvt','');await sleep(200);await p.evaluate(()=>{delete window.CJR.PERF_TABLES.__test;});await type('s7','pr','');await type('s7','g2','5,5');await type('s1','pr','13,1');await type('s1','g2','6');
// ---- gymnastique (cycle 3)
await cycle(2);
check('Note procédurale, gymnastique 2BAC : Gymnastique /14 · Procéd. /14',JSON.stringify(await head())==='["Gymnastique/14","Procéd./14","Année"]',JSON.stringify(await head()));
await type('s0','g1','15');const r15=await val('s0','g1');await type('s0','g1','12,5');
check('gymnastique : 15 refusé, 12,5 → Procéd. 12,5 ; Notes /20 : Gym. /14 = 12,5',r15===''&&await cell('s0','sub')==='12,5'&&(await view('notes'),await val('s0','g1'))==='12,5');
await view('proc');
// ---- maxima par niveau
const mx=await p.evaluate(()=>{const A=window.CJR,DB=A.db(),o={},nm={TC:'TCS9','1BAC':'1BACLSH9','2BAC':'2BACSP9'};
  ['TC','1BAC','2BAC'].forEach(l=>{const id='x'+l;DB.classes.push({id,name:nm[l]});DB.evals=DB.evals||{};DB.evals.aps=DB.evals.aps||{};['coll','athle','gym'].forEach((a,i)=>{DB.evals.aps[id+'|'+i]=a;const s=A.gradeSpec(id,i);o[l+'-'+a]=s.proc.map(c=>c.lf+' '+c.max).join(' + ')+' = '+s.procMax;delete DB.evals.aps[id+'|'+i];});DB.classes.pop();});return o;});
const expM={'TC-coll':'Individuel 6 + Collectif 6 = 12','TC-athle':'Produit 6 + Performance 6 = 12','TC-gym':'Gymnastique 12 = 12','1BAC-coll':'Individuel 6 + Collectif 7 = 13','1BAC-athle':'Produit 7 + Performance 6 = 13','1BAC-gym':'Gymnastique 13 = 13','2BAC-coll':'Individuel 7 + Collectif 7 = 14','2BAC-athle':'Produit 7 + Performance 7 = 14','2BAC-gym':'Gymnastique 14 = 14'};
check('maxima OP 2007 par niveau : athlétisme Produit 6/7/7 + Performance 6/6/7, sports collectifs 6/6/7 + 6/7/7, gymnastique 12/13/14 → procédurale /12 · /13 · /14',Object.keys(expM).every(k=>mx[k]===expM[k]),JSON.stringify(mx));
await p.evaluate(()=>{const s=document.getElementById('attClass');s.value='ctc1';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);await cycle(0);
check('classe TCS1 (TC), sport collectif : Individuel /6 · Collectif /6 · Procéd. /12',JSON.stringify(await head())==='["Individuel/6","Collectif/6","Procéd./12","Année"]',JSON.stringify(await head()));
await p.evaluate(CID=>{const s=document.getElementById('attClass');s.value=CID;s.dispatchEvent(new Event('change',{bubbles:true}));},CID);await sleep(300);await cycle(0);
// ---- persistance, normalisation, champs futurs
await p.evaluate((K,CID)=>{const d=JSON.parse(localStorage.getItem(K));d.students.find(s=>s.id==='s10').ev[CID+'|0'].zz='futur';localStorage.setItem(K,JSON.stringify(d));},KEY,CID);
await p.reload({waitUntil:'networkidle2'});await unlock();await tab();await sleep(400);await view('proc');
const per=await p.evaluate(CID=>({sub:document.querySelector('#gridWrap tr[data-sid="s0"] td.sub').textContent,pr:window.CJR.byId('s3').ev[CID+'|1'].pr,zz:window.CJR.byId('s10').ev[CID+'|0'].zz}),CID);
check('après rechargement : notes, performance brute et champ futur inconnu conservés',per.sub==='12'&&per.pr==='12,4'&&per.zz==='futur',JSON.stringify(per));
await cycle(1);const rawAuto=await p.evaluate(()=>({h:[...document.querySelectorAll('#gridWrap thead th.t')].map(t=>t.textContent).join('|'),dis:document.getElementById('attRaw').disabled}));
check('colonne « Perf. brute » réaffichée d’office quand des performances existent (case verrouillée)',/Perf\. brute/.test(rawAuto.h)&&rawAuto.dis,JSON.stringify(rawAuto));
const pa=await pdf(()=>document.getElementById('attGradesPdf').click());
check('PDF relevé (athlétisme) : Produit /7 · Perf. brute · Perf. /7 · Procéd. /14 (FASSI… 13,4 · 5 · 10)',!!pa&&/Produit\s+Perf\.\s+Perf\.\s+Procéd\./.test(pa.t)&&/brute/.test(pa.t)&&/\/14/.test(pa.t)&&/FASSI Nour\s+5\s+13,4\s+5\s+10\b/.test(pa.t),pa&&(pa.t.split('\n').find(l=>/FASSI/.test(l))||'').trim());
if(pa)fs.copyFileSync(pa.f,'/tmp/v28p-athle.pdf');
// ---- données
const after=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
const canon=o=>Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.keys(o).sort().reduce((a,k)=>(a[k]=canon(o[k]),a),{}):o;
const strip=o=>{const c=JSON.parse(JSON.stringify(o));c.students.forEach(s=>delete s.ev);delete c.evals;delete c.ui;delete c.lastBackup;return canon(c);};
check('données inchangées hors champs additifs (séances, classes, réglages, élèves hors ev)',JSON.stringify(strip(base))===JSON.stringify(strip(after)));
// ---- affichage Absences toujours là
await view('abs');check('affichage Absences : Abs. · R · AJ · Pts · Année',JSON.stringify(await head())==='["Abs.","R","AJ","Pts","Année"]');
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
