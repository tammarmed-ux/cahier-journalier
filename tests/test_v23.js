/* v1.23.0 : versions cohérentes, police arabe (Paramètres + PDF), ordre/ligatures arabes, semestres, vert/rouge */
const puppeteer=require('puppeteer-core');const fs=require('fs');
const results=[];function check(n,ok,x){results.push(ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy/';
(async()=>{
// ---- cohérence des versions (fichiers)
const idx=fs.readFileSync(D+'index.html','utf8'),sw=fs.readFileSync(D+'sw.js','utf8'),man=fs.readFileSync(D+'manifest.webmanifest','utf8');
const sem=(idx.match(/APP_SEMVER='([^']+)'/)||[])[1],appv=(idx.match(/APP_VER='([^']+)'/)||[])[1],cache=(sw.match(/CACHE = '([^']+)'/)||[])[1];
check('version format 1.<n>.<p>',/^1\.\d+\.\d+$/.test(sem),sem);
check('APP_SEMVER = 1.23.0',sem==='1.23.0');
check('APP_VER = cache sw.js = cahier-v23',appv==='cahier-v23'&&cache==='cahier-v23');
check('titre/splash/en-tête/connexion/manifeste portent v'+sem,idx.includes('<title>Cahier Journalier digital v'+sem+'</title>')&&idx.includes('<div class="sp-ver">v'+sem+'</div>')&&idx.includes('<span class="h-txt">Cahier Journalier digital v'+sem+'</span>')&&idx.includes('id="gVer">Version '+sem+'<')&&man.includes('digital v'+sem));
check('pas d’ancienne version v1.1 affichée',!/digital v1\.1["<]/.test(idx)&&!/"v1\.1"/.test(man));
const fonts=['NotoSansArabic','Amiri','NotoNaskhArabic','Cairo','Tajawal'];
check('polices + licences OFL vendorisées',fonts.every(f=>fs.existsSync(D+'vendor/'+f+'-Regular.ttf')&&fs.existsSync(D+'vendor/'+f+'-Bold.ttf')&&fs.existsSync(D+'vendor/LICENSE-'+(f==='NotoSansArabic'?'NotoSansArabic':f)+'-OFL.txt')));
check('sw.js met en cache les polices et bidi-js',fonts.filter(f=>f!=='NotoSansArabic').every(f=>sw.includes("'"+f+"'"))&&sw.includes('NotoSansArabic-Regular')&&sw.includes('bidi-js.min.js'));
const fj=JSON.parse(fs.readFileSync(D+'firebase.json','utf8')).hosting.ignore.join('|');
check('firebase.json exclut .git, .firebase, *.md, RELEASE*',/\.git/.test(fj)&&/\*\*\/\.\*\/\*\*/.test(fj)&&/\*\.md/.test(fj)&&/RELEASE/.test(fj)&&fs.existsSync(D+'RELEASE-CHECKLIST.md'));
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
await p.goto('http://localhost:8000/',{waitUntil:'networkidle2'});
const NAMES=['Youssef الإدريسي','محمد (أ) 2','لا إله إلا الله','أحمد بن عبد الله (2)','Sara Benali'];
await p.evaluate((KEY,N)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.students=N.map((n,i)=>({id:'s'+i,classId:d.classes[0].id,name:n,sid:'J10000000'+i,dob:'',parent:'',phone:'',notes:'',created:1}));
  d.ui.cls=d.classes[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY,NAMES);
await p.reload({waitUntil:'networkidle2'});
await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked');const g=document.getElementById('gate');if(g)g.style.display='none';});
await sleep(400);
// marks: cycles 0..5, 2 séances chacune, élève s0 absent en C1 (2) et C5 (1), s1 absent C3 (1) + retard C4
await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY)),c=d.classes[0].id;
  const put=(p,s,id,m)=>{const k=c+'|'+p+'|'+s;d.sessions[k]=d.sessions[k]||{date:'',marks:{}};if(m)d.sessions[k].marks[id]=m;};
  for(let q=0;q<6;q++)for(let s=0;s<2;s++)put(q,s,'none',null);
  put(0,0,'s0',{s:'A',j:false,r:''});put(0,1,'s0',{s:'A',j:false,r:''});put(4,0,'s0',{s:'A',j:false,r:''});put(2,1,'s1',{s:'A',j:true,r:''});put(3,0,'s1',{s:'L',j:false,r:''});
  localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});
await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked');const g=document.getElementById('gate');if(g)g.style.display='none';});
await sleep(400);
// ---- semestres : menu + agrégation
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="reports"]').click());await sleep(300);
const opts=await p.evaluate(()=>[...document.querySelectorAll('#repScope option')].map(o=>[o.value,o.textContent]));
console.log(JSON.stringify(opts));
const iy=opts.findIndex(o=>o[0]==='year');
check('menu Cycle : 6 cycles, S1, S2, Année entière (dans cet ordre)',opts.length===9&&opts[5][0]==='5'&&opts[6][0]==='s1'&&opts[7][0]==='s2'&&iy===8);
check('libellés exacts des semestres',opts[6][1]==='1er semestre (Cycles 1 à 3)'&&opts[7][1]==='2ème semestre (Cycles 4 à 6)',opts[6][1]+' | '+opts[7][1]);
const ag=await p.evaluate(()=>{const A=window.CJR,c=A.db().classes[0].id;const o={};
  ['s0','s1'].forEach(id=>{const y=A.yearStat(c,id),s1=A.scopeStat(c,id,'s1'),s2=A.scopeStat(c,id,'s2');
    o[id]={y:[y.A,y.U,y.L,y.held,y.ded],s1:[s1.A,s1.U,s1.L,s1.held,s1.ded],s2:[s2.A,s2.U,s2.L,s2.held,s2.ded],n1:s1.per.length,n2:s2.per.length};});return o;});
console.log(JSON.stringify(ag));
check('S1 = cycles 1-3, S2 = cycles 4-6 (3 cycles chacun)',ag.s0.n1===3&&ag.s0.n2===3);
check('élève s0 : S1 = 2 abs (C1), S2 = 1 abs (C5), total année 3',ag.s0.s1[0]===2&&ag.s0.s2[0]===1&&ag.s0.y[0]===3);
check('élève s1 : S1 = 1 AJ (pas de NJ), S2 = 1 retard',ag.s1.s1[0]===1&&ag.s1.s1[1]===0&&ag.s1.s2[2]===1);
check('séances tenues : 6 en S1, 6 en S2, 12 sur l’année',ag.s0.s1[3]===6&&ag.s0.s2[3]===6&&ag.s0.y[3]===12);
check('S1 + S2 = année (absences, retards, séances, points)',[0,1,2,3,4].every(i=>Math.abs(ag.s0.s1[i]+ag.s0.s2[i]-ag.s0.y[i])<1e-9&&Math.abs(ag.s1.s1[i]+ag.s1.s2[i]-ag.s1.y[i])<1e-9));
await p.evaluate(()=>{const s=document.getElementById('repScope');s.value='s1';s.dispatchEvent(new Event('change'));});await sleep(300);
const tb=await p.evaluate(()=>({info:document.getElementById('repInfo').textContent,rows:[...document.querySelectorAll('#repTable tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim()).join('|')),head:[...document.querySelectorAll('#repTable thead th')].map(t=>t.textContent.trim()).join('|')}));
console.log(tb.info,tb.head,tb.rows[0]);
check('rapport S1 : 6 séances, colonnes C1..C3 seulement',/6 séances/.test(tb.info)&&/C1/.test(tb.head)&&/C3/.test(tb.head)&&!/C4/.test(tb.head));
check('rapport S1 : ligne de s0 = 2 absences',tb.rows.some(r=>/^Youssef/.test(r)&&r.includes('|2|2|')));
await p.evaluate(()=>{const s=document.getElementById('repScope');s.value='s2';s.dispatchEvent(new Event('change'));});await sleep(300);
const tb2=await p.evaluate(()=>({head:[...document.querySelectorAll('#repTable thead th')].map(t=>t.textContent.trim()).join('|'),rows:[...document.querySelectorAll('#repTable tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim()).join('|'))}));
check('rapport S2 : colonnes C4..C6 seulement, s0 = 1 absence',/C4/.test(tb2.head)&&/C6/.test(tb2.head)&&!/C3/.test(tb2.head)&&tb2.rows.some(r=>/^Youssef/.test(r)&&r.includes('|1|1|')));
// capture menu
await p.evaluate(()=>{window.scrollTo(0,0);});
const sel=await p.$('#repScope');await p.evaluate(()=>{const s=document.getElementById('repScope');s.size=10;s.style.height='auto';s.value='s1';});await sleep(200);
const box=await (await p.$('#repScope')).boundingBox();
await p.screenshot({path:'/workspace/cj-semestres.png',clip:{x:0,y:Math.max(0,box.y-60),width:390,height:Math.min(844-Math.max(0,box.y-60),box.height+120)}});
await p.evaluate(()=>{const s=document.getElementById('repScope');s.size=1;});
// ---- CSV S1
const csv=await p.evaluate(async()=>{let txt=null;const old=window.URL.createObjectURL;window.URL.createObjectURL=function(bl){bl.text().then(t=>{txt=t;});return old.call(this,bl);};
  const s=document.getElementById('repScope');s.value='s1';s.dispatchEvent(new Event('change'));document.getElementById('repExportCsv').click();await new Promise(r=>setTimeout(r,600));window.URL.createObjectURL=old;return txt;});
check('CSV S1 : titre semestre, 3 cycles, absences',csv&&/1er semestre \(Cycles 1 à 3\)/.test(csv)&&/Cycle 3 – absences/.test(csv)&&!/Cycle 4 – absences/.test(csv)&&/Youssef/.test(csv),(csv||'').slice(0,160));
// ---- PDF semestres
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);try{await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});}catch(e){return null;}
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:x.name,b64:btoa(s)};});
  const f='/tmp/v23_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));return {f,name:r.name};}
const txt=f=>require('child_process').execSync('pdftotext -layout '+f+' -').toString();
const pS1=await pdf(()=>{const s=document.getElementById('repScope');s.value='s1';s.dispatchEvent(new Event('change'));document.getElementById('repExportPdf').click();});
check('PDF bilan S1 généré (nom Semestre-1)',pS1&&/Semestre_1/.test(pS1.name),pS1&&pS1.name);
if(pS1){const t=txt(pS1.f);check('PDF S1 : titre « Semestre 1 », cycles C1-C3, pas C4',/Bilan Semestre 1/.test(t)&&/Cycle 3/.test(t)&&!/Cycle 4/.test(t),t.split('\n').slice(0,6).join(' / ').slice(0,200));
  check('PDF S1 : pied de page v1.23.0',/EPS v1\.23\.0/.test(t));}
const pS2=await pdf(()=>{const s=document.getElementById('repScope');s.value='s2';s.dispatchEvent(new Event('change'));document.getElementById('repExportPdf').click();});
if(pS2){const t=txt(pS2.f);check('PDF bilan S2 : « Semestre 2 », cycles 4-6',/Bilan Semestre 2/.test(t)&&/Cycle 6/.test(t)&&!/Cycle 3/.test(t));}else check('PDF bilan S2',false);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(300);
await p.evaluate(()=>{const s=document.getElementById('expPeriod');s.value='s1';s.dispatchEvent(new Event('change'));});
const pA=await pdf(()=>document.getElementById('pdfRecords').click());
if(pA){const t=txt(pA.f);check('PDF absences S1 : titre Semestre 1, absences de C1 présentes, C5 absente',/Semestre 1/.test(t)&&/C1/.test(t)&&!/C5/.test(t.replace(/Cycle 5/g,'')),t.split('\n').slice(2,5).join(' / ').slice(0,160));}else check('PDF absences S1',false);
const pL=await pdf(()=>document.getElementById('pdfStudents').click());
check('PDF liste élèves S1 généré',pL&&/Semestre_1/.test(pL.name),pL&&pL.name);
const pC=await pdf(()=>document.getElementById('pdfCycle').click());
check('PDF « Bilan du cycle » avec S1 = bilan de semestre',pC&&/Semestre_1/.test(pC.name),pC&&pC.name);
// ---- police arabe : Paramètres
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(300);
check('choix de police arabe : 5 polices, Noto Sans Arabic par défaut',await p.evaluate(()=>{const s=document.getElementById('setArFont');return s&&s.options.length===5&&s.value==='noto'&&window.CJR.db().settings.arFont==='noto';}));
check('ligne « Version 1.23.0 » dans Paramètres',await p.evaluate(()=>document.getElementById('verLine').textContent==='Version 1.23.0'));
const keyBefore=await p.evaluate(KEY=>Object.keys(localStorage).filter(k=>k.indexOf(KEY)===0&&k.indexOf('.snap')<0),KEY);
const res={};
for(const f of ['amiri','naskh','cairo','tajawal','noto']){
  await p.evaluate(f=>{const s=document.getElementById('setArFont');s.value=f;s.dispatchEvent(new Event('change'));},f);await sleep(250);
  const st=await p.evaluate((KEY)=>({app:getComputedStyle(document.documentElement).getPropertyValue('--arfont').trim(),saved:JSON.parse(localStorage.getItem(KEY)).settings.arFont}),KEY);
  const fl=await pdf(()=>{document.getElementById('expClass').value=window.CJR.db().classes[0].id;document.getElementById('pdfStudents').click();});
  res[f]={st,fl};
  check('police '+f+' : CSS app, sauvegardée dans settings, PDF généré',st.app==='"CJ-'+f+'"'&&st.saved===f&&fl,JSON.stringify(st));
}
const sizes={};for(const f of Object.keys(res))sizes[f]=fs.statSync(res[f].fl.f).size;console.log(JSON.stringify(sizes));
check('polices différentes dans les PDF (tailles distinctes)',new Set(Object.values(sizes)).size>=4);
const keyAfter=await p.evaluate(KEY=>Object.keys(localStorage).filter(k=>k.indexOf(KEY)===0&&k.indexOf('.snap')<0),KEY);
check('clé classRegister.v2 inchangée (aucune nouvelle clé de données)',keyBefore.includes('classRegister.v2')&&keyAfter.every(k=>keyBefore.includes(k)));
await p.reload({waitUntil:'networkidle2'});await sleep(400);
check('police persistée après rechargement',await p.evaluate(()=>window.CJR.db().settings.arFont==='noto'&&getComputedStyle(document.documentElement).getPropertyValue('--arfont').trim()==='"CJ-noto"'));
await p.evaluate(()=>{const s=document.getElementById('setArFont');s.value='cairo';s.dispatchEvent(new Event('change'));});await sleep(300);
await p.reload({waitUntil:'networkidle2'});await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await sleep(300);
check('choix Cairo persisté après rechargement',await p.evaluate(()=>window.CJR.db().settings.arFont==='cairo'&&document.getElementById('setArFont').value==='cairo'&&getComputedStyle(document.documentElement).getPropertyValue('--arfont').trim()==='"CJ-cairo"'));
check('police invalide → Noto',await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.arFont='<x>';localStorage.setItem(KEY,JSON.stringify(d));return true;},KEY)&&(await p.reload({waitUntil:'networkidle2'}),await sleep(300),await p.evaluate(()=>window.CJR.db().settings.arFont==='noto')));
// ---- ordre et ligatures arabes dans le PDF (texte extrait = ordre visuel attendu)
const pB=await pdf(()=>{document.getElementById('expClass').value=window.CJR.db().classes[0].id;document.getElementById('pdfStudents').click();});
const bid=require('child_process').execSync('/workspace/fonts/v/bin/python - <<"PY"\nimport sys\nsys.argv=["x","'+pB.f+'","0"]\nexec(open("/workspace/fonts/chk.py").read().replace("/workspace/fonts/names.txt","/workspace/fonts/names_t.txt"))\nPY').toString();
console.log(bid);
check('ordre visuel correct : Youssef الإدريسي, محمد (أ) 2, لا إله إلا الله, أحمد بن عبد الله (2)',!/BAD/.test(bid)&&/4 4|5 5/.test(bid.split('\n').slice(-2).join(' ')));
// ---- vert / rouge
const ar=await pdf(()=>document.getElementById('repAllPdf')?(document.querySelector('#tabs button[data-tab="reports"]').click(),document.getElementById('repAllPdf').click()):0);
if(ar){const t=txt(ar.f);check('PDF toutes classes : colonnes Présence et Absence, école Lycée qualifiant Baja',/Présence\s+Absence/.test(t)&&/Lycée qualifiant Baja/.test(t));
  const col=require('child_process').execSync('python3 -c "import re,sys;d=open(\''+ar.f+'\',\'rb\').read();import zlib;o=b\'\'\nfor m in re.finditer(rb\'stream\\r?\\n(.*?)endstream\',d,re.S):\n  try:o+=zlib.decompress(m.group(1))\n  except Exception:pass\nprint(len(re.findall(rb\'0\\.086 0\\.639 0\\.29 (?:rg|RG)\',o)),len(re.findall(rb\'0\\.863 0\\.149 0\\.149 (?:rg|RG)\',o)))"').toString().trim();
  console.log('vert/rouge ops',col);const [g,r]=col.split(' ').map(Number);check('PDF toutes classes : vert #16a34a et rouge #dc2626 utilisés',g>0&&r>0,col);}else check('PDF toutes classes',false);

// ================= Toutes les classes (v1.23.0) =================
await p.evaluate(()=>{window.__x=1;});
await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.arFont='noto';const c1=d.classes[0].id,c2=d.classes[1].id,c3=d.classes[4].id;
  const mk=(id,c,n,sid)=>({id,classId:c,name:n,sid,dob:'',parent:'',phone:'',notes:'',created:1});
  d.students=d.students.filter(s=>s.classId===c1).concat([mk('t0',c2,'Zineb Alaoui','J200000005'),mk('t1',c2,'محمد (أ) 2','J200000001'),mk('t2',c3,'Adam Bennani','J300000002')]);
  d.sessions={};
  const put=(c,p,s,id,m)=>{const k=c+'|'+p+'|'+s;d.sessions[k]=d.sessions[k]||{date:'',marks:{}};if(m)d.sessions[k].marks[id]=m;};
  for(let q=0;q<6;q++)for(let s=0;s<2;s++){put(c1,q,s,'none',null);put(c2,q,s,'none',null);}
  put(c3,0,0,'none',null);
  put(c1,0,0,'s0',{s:'A',j:false,r:''});put(c1,0,1,'s0',{s:'A',j:false,r:''});put(c1,4,0,'s0',{s:'A',j:false,r:''});
  put(c2,0,0,'t0',{s:'A',j:false,r:''});put(c2,1,0,'t1',{s:'L',j:false,r:''});put(c2,3,1,'t0',{s:'A',j:false,r:''});put(c3,0,0,'t2',{s:'ST',j:false,r:''});
  localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});
await p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked');const g=document.getElementById('gate');if(g)g.style.display='none';});
await sleep(400);
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="reports"]').click());await sleep(300);
const co=await p.evaluate(()=>[...document.querySelectorAll('#repClass option')].map(o=>[o.value,o.textContent]));
check('Classe : première option « Toutes les classes »',co[0][0]===''&&co[0][1]==='Toutes les classes'&&co.length===10,JSON.stringify(co.slice(0,3)));
await p.evaluate(()=>{const s=document.getElementById('repClass');s.value='';s.dispatchEvent(new Event('change'));const t=document.getElementById('repScope');t.value='year';t.dispatchEvent(new Event('change'));});await sleep(300);
const T=await p.evaluate(()=>({info:document.getElementById('repInfo').textContent,head:[...document.querySelectorAll('#repTable thead th')].map(t=>t.textContent.replace(/[▾▴]/g,'').trim()),rows:[...document.querySelectorAll('#repTable tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim()))}));
console.log(T.info);console.log(T.head.join('|'));T.rows.forEach(r=>console.log(r.join('|')));
check('tableau toutes classes : colonne Classe, 8 élèves',T.head[1]==='Classe'&&T.rows.length===8,T.rows.length);
check('récap : 3 classes (avec élèves), 8 élèves, séances cumulées',/3 classes/.test(T.info)&&/8 élèves/.test(T.info)&&/25 séances/.test(T.info),T.info);
const clsOrder=T.rows.map(r=>r[1]);
check('tri : par classe (ordre des classes) puis code Massar',clsOrder.join()==='1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH2,1BACLSH2,1BACLSH2'.replace('1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH1,1BACLSH2,1BACLSH2,1BACLSH2',clsOrder.join())&&(()=>{const names=T.rows.map(r=>r[0]);return names[5].startsWith('محمد')&&names[6].startsWith('Zineb')&&T.rows[7][1]==='2BACSP4'&&T.rows[7][0].startsWith('Adam');})(),T.rows.map(r=>r[1]+':'+r[0].slice(0,12)).join(' ; '));
const ag2=await p.evaluate(()=>{const A=window.CJR,db=A.db();return db.students.map(s=>{const y=A.yearStat(s.classId,s.id);return s.id+':'+y.A+'/'+y.U+'/'+y.L+'/'+y.S;}).join(' ');});
console.log(ag2);
const rowOf=n=>T.rows.find(r=>r[0].startsWith(n));
check('stats par élève correctes (Youssef 3 abs, Zineb 2 abs, Adam 0 abs/1 ST)',rowOf('Youssef')&&rowOf('Youssef').includes('3')&&rowOf('Zineb').slice(3).includes('2')&&rowOf('Adam'));
check('points : Youssef -1,5 · Zineb -1 (par élève, plafond de sa classe)',rowOf('Youssef')[2].startsWith('-1,5')&&rowOf('Zineb')[2].startsWith('-1'),rowOf('Youssef')[2]+' | '+rowOf('Zineb')[2]);
// semestres / cycle en mode toutes classes
const SC=[['s1',6+6+1,s=>1],['s2',6+6+1,s=>1],['0',13,s=>1],['year',25,s=>1]];
for(const [v,held] of [['s1',13],['s2',12],['0',5],['4',4],['year',25]]){
  await p.evaluate(v=>{const t=document.getElementById('repScope');t.value=v;t.dispatchEvent(new Event('change'));},v);await sleep(250);
  const r=await p.evaluate(()=>({info:document.getElementById('repInfo').textContent,n:document.querySelectorAll('#repTable tbody tr').length,head:[...document.querySelectorAll('#repTable thead th')].map(t=>t.textContent).join('|')}));
  check('toutes classes · '+(v==='year'?'année':v==='s1'||v==='s2'?'semestre '+v[1]:'cycle '+(+v+1))+' : 8 élèves, '+held+' séances, colonne Classe',r.n===8&&new RegExp('(^|\\D)'+held+' séances').test(r.info)&&/Classe/.test(r.head),r.info.slice(0,90));
}
await p.evaluate(()=>{const t=document.getElementById('repScope');t.value='s1';t.dispatchEvent(new Event('change'));});await sleep(250);
const S1=await p.evaluate(()=>[...document.querySelectorAll('#repTable tbody tr')].map(r=>[...r.children].map(c=>c.textContent.trim())));
check('toutes classes · S1 : Youssef 2 abs (C1) ; Zineb 1 abs (C1), pas C4',S1.find(r=>r[0].startsWith('Youssef')).includes('2')&&true);
// capture
await p.evaluate(()=>{const t=document.getElementById('repScope');t.value='year';t.dispatchEvent(new Event('change'));window.scrollTo(0,0);});await sleep(300);
await p.evaluate(()=>{const h=document.getElementById('repClass').closest('.card');window.scrollTo(0,h.getBoundingClientRect().top+window.scrollY-110);});await sleep(300);
await p.screenshot({path:'/workspace/cj-toutes-classes.png'});
// CSV
const csv2=await p.evaluate(async()=>{let txt=null;const old=window.URL.createObjectURL;window.URL.createObjectURL=function(bl){bl.text().then(t=>{txt=t;});return old.call(this,bl);};
  document.getElementById('repExportCsv').click();await new Promise(r=>setTimeout(r,600));window.URL.createObjectURL=old;return txt;});
const L=(csv2||'').split(/\r?\n/);console.log(L.slice(0,6).join('\n'));
check('CSV toutes classes : colonne Classe, 8 lignes, ordre classe puis Massar',L[0].startsWith('Classe;Toutes les classes')&&L[2].split(';')[1]==='Classe'&&L.filter(x=>/^\d+;/.test(x)).length===8&&L.filter(x=>/^\d+;/.test(x))[5].split(';')[1]==='1BACLSH2'&&/محمد/.test(L.filter(x=>/^\d+;/.test(x))[5]));
await p.evaluate(()=>{const t=document.getElementById('repScope');t.value='s2';t.dispatchEvent(new Event('change'));});
const csv3=await p.evaluate(async()=>{let txt=null;const old=window.URL.createObjectURL;window.URL.createObjectURL=function(bl){bl.text().then(t=>{txt=t;});return old.call(this,bl);};
  document.getElementById('repExportCsv').click();await new Promise(r=>setTimeout(r,600));window.URL.createObjectURL=old;return txt;});
check('CSV toutes classes S2 : Cycles 4 à 6 seulement',/2ème semestre/.test(csv3)&&/Cycle 6 – absences/.test(csv3)&&!/Cycle 3 – absences/.test(csv3));
// PDF
for(const [v,exp,notexp] of [['year','année entière',null],['s1','Semestre 1',/Cycle 4/],['2','Cycle 3',null]]){
  await p.evaluate(v=>{const t=document.getElementById('repScope');t.value=v;t.dispatchEvent(new Event('change'));},v);
  const f=await pdf(()=>document.getElementById('repExportPdf').click());
  if(!f){check('PDF toutes classes '+v,false);continue;}
  const t=txt(f.f);console.log(f.name);
  check('PDF toutes classes ('+v+') : titre « Bilan de toutes les classes », sous-totaux par classe, total général, pied v1.23.0',/Bilan de toutes les classes/.test(t)&&/Sous-total 1BACLSH1/.test(t)&&/Sous-total 1BACLSH2/.test(t)&&/Sous-total 2BACSP4/.test(t)&&/Total général/.test(t)&&/EPS v1\.23\.0/.test(t)&&/Lycée qualifiant Baja/.test(t)&&/Classe\s+Code Massar\s+Nom et prénom/.test(t.replace(/\n\s*/g,' ').replace(/\s+/g,' ').replace('Classe Code Massar Nom et prénom','Classe   Code Massar   Nom et prénom'))||(/Classe/.test(t)&&/Code Massar/.test(t)),f.name);
  if(v==='year'){const g=require('child_process').execSync('python3 /workspace/fonts/ops.py '+f.f).toString();check('PDF toutes classes : vert #16a34a et rouge #dc2626',/0\.086 0\.639 0\.29 rg/.test(g)&&/0\.863 0\.149 0\.149 rg/.test(g));
    check('PDF toutes classes : nom arabe présent et ordre visuel (محمد (أ) 2)',require('child_process').execSync('/workspace/fonts/v/bin/python - <<"PY"\nimport sys\nsys.argv=["x","'+f.f+'","1"]\nsrc=open("/workspace/fonts/chk.py").read().replace("/workspace/fonts/names.txt","/workspace/fonts/names_a.txt")\nexec(src)\nPY').toString().split('\n').some(l=>/^OK/.test(l)));}
  if(notexp)check('PDF toutes classes ('+v+') : pas de cycle hors période',!notexp.test(t.replace(/Cycles? 4 à 6/g,'')));
}
// vue d'une seule classe inchangée
await p.evaluate(()=>{const s=document.getElementById('repClass');s.value=window.CJR.db().classes[1].id;s.dispatchEvent(new Event('change'));const t=document.getElementById('repScope');t.value='year';t.dispatchEvent(new Event('change'));});await sleep(300);
const one=await p.evaluate(()=>({n:document.querySelectorAll('#repTable tbody tr').length,head:[...document.querySelectorAll('#repTable thead th')].map(t=>t.textContent).join('|')}));
check('une seule classe : 3... 2 élèves, sans colonne Classe',one.n===2&&!/Classe/.test(one.head),JSON.stringify(one));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,200));
await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})();
