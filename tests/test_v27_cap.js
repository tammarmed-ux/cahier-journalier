/* v1.27.0 : note comportementale par niveau (TC 5 · 1BAC 4 · 2BAC 3, Connaissances comportementales OP 2007) :
   détection du niveau, mise à jour réelle v1.26.0 → v1.27.0 (historique inchangé, points recalculés), valeur personnalisée, Rapports, PDF */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const OLD='/tmp/v26root';if(!fs.existsSync(OLD+'/index.html')){fs.mkdirSync(OLD,{recursive:true});cp.execSync('git -C '+D+' archive v1.26.0 | tar -x -C '+OLD);}
const SEM=(fs.readFileSync(D+'/index.html','utf8').match(/var APP_SEMVER='([^']+)'/)||[])[1],CUR=(fs.readFileSync(D+'/sw.js','utf8').match(/const CACHE = '([^']+)'/)||[])[1];
let ROOT=OLD;const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(ROOT,u);
  if(!f.startsWith(ROOT)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8012);
const URL='http://localhost:8012/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
// ---- données de test sur v1.26.0 : classes par défaut + TC, libellés libres, valeurs personnalisées « anciennes » (champ cap)
await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.classes.forEach(c=>{if(c.name==='1BACLSH2')c.cap=2.5;if(c.name==='2BACSP4')c.cap=4;});
  d.classes.push({id:'cTC1',name:'TCS1',cap:4},{id:'cTC2',name:'TC LSH 2'},{id:'cTC3',name:'Tronc commun sciences 3'},{id:'c1B',name:'1ère année bac SM'},{id:'c2B',name:'2ème année Bac PC'},{id:'cO',name:'3AC1'});
  d.students=[];d.sessions={};
  d.classes.forEach((c,ci)=>{for(let k=0;k<2;k++){const id='s'+ci+'_'+k;d.students.push({id,classId:c.id,name:'Élève '+(k+1)+' '+c.name,sid:'J'+(100000000+ci*10+k),sex:k?'F':'G',dob:'',parent:'',phone:'',notes:'',created:1});}
    for(let s=0;s<10;s++){const key=c.id+'|0|'+s,m={};m['s'+ci+'_0']={s:'A',j:false,r:''};if(s<8)m['s'+ci+'_1']={s:'A',j:false,r:''};d.sessions[key]={date:'',marks:m};}
    for(let s=0;s<3;s++){const key=c.id+'|1|'+s,m={};m['s'+ci+'_0']={s:'ST',j:false,r:''};m['s'+ci+'_1']={s:s?'L':'A',j:!s,r:''};d.sessions[key]={date:'',marks:m};}});
  d.ui.cls=d.classes[0].id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>navigator.serviceWorker.ready.then(()=>true));await sleep(800);
const snapStats=()=>p.evaluate(()=>{const A=window.CJR,DB=A.db(),o={};DB.classes.forEach(c=>{o[c.name]={cap:A.capOf(c.id),st:{}};A.studentsIn(c.id).forEach(s=>{const y=A.yearStat(c.id,s.id);o[c.name].st[s.id]=y.per.slice(0,2).map(q=>({raw:q.raw,cap:q.cap,ded:q.ded}));});});return o;});
const before=await snapStats();const sem0=await p.evaluate(()=>window.CJR.semver);
const raw0=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
check('état initial : v1.26.0 avec '+raw0.classes.length+' classes et historique de séances',sem0==='1.26.0'&&raw0.classes.length===15,sem0);
// ---- mise à jour réelle par le service worker
ROOT=D;let n=0,s='';while(n<6&&s!==SEM){await p.reload({waitUntil:'networkidle2'});n++;await sleep(1200);s=await p.evaluate(()=>window.CJR&&window.CJR.semver);}
check('mise à jour v1.26.0 → v'+SEM+' (cache '+CUR+') en '+n+' rechargement(s)',s===SEM&&JSON.stringify(await p.evaluate(()=>caches.keys()))===JSON.stringify([CUR]));
await unlock();await sleep(300);
const after=await snapStats();const raw1=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
const table=Object.keys(before).map(k=>k+' : '+before[k].cap+' → '+after[k].cap);console.log('AVANT → APRÈS\n  '+table.join('\n  '));
fs.writeFileSync('/tmp/v27-cap-table.txt',table.join('\n'));
const exp={'1BACLSH1':4,'1BACLSH2':4,'1BACLSH3':4,'1BACLSH4':4,'2BACSP4':3,'2BACSP5':3,'2BACSP6':3,'2BACSSVT1':3,'2BACSSVT2':3,'TCS1':5,'TC LSH 2':5,'Tronc commun sciences 3':5,'1ère année bac SM':4,'2ème année Bac PC':3,'3AC1':3};
check('valeurs après mise à jour = règle OP 2007 (TC 5 · 1BAC 4 · 2BAC 3, autres 3), y compris classes à ancienne valeur personnalisée',Object.keys(exp).every(k=>after[k]&&after[k].cap===exp[k]),JSON.stringify(Object.fromEntries(Object.entries(after).map(([k,v])=>[k,v.cap]))));
check('valeurs avant (v1.26.0) : 1BAC 4, autres 3, personnalisées 1BACLSH2 2,5 · 2BACSP4 4 · TCS1 4',before['1BACLSH1'].cap===4&&before['TC LSH 2'].cap===3&&before['TCS1'].cap===4&&before['1BACLSH2'].cap===2.5&&before['2BACSP4'].cap===4&&before['1ère année bac SM'].cap===3);
check('historique inchangé : séances (absences, retards, tenues) et élèves identiques',JSON.stringify(raw0.sessions)===JSON.stringify(raw1.sessions)&&JSON.stringify(raw0.students)===JSON.stringify(raw1.students));
check('classes inchangées dans les données (aucune migration : ancien champ cap conservé, aucun champ ajouté)',JSON.stringify(raw0.classes)===JSON.stringify(raw1.classes));
let okR=true,okD=true,diffs=[];for(const k of Object.keys(before))for(const sid of Object.keys(before[k].st))before[k].st[sid].forEach((q,i)=>{const a=after[k].st[sid][i];if(a.raw!==q.raw)okR=false;if(a.ded!==Math.round(Math.min(a.raw,exp[k])*100)/100||a.cap!==exp[k])okD=false;if(a.ded!==q.ded)diffs.push(k+' '+sid+' C'+(i+1)+' '+q.ded+'→'+a.ded);});
check('points bruts inchangés ; points retirés recalculés avec la note de chaque classe (min(brut, note))',okR&&okD,diffs.slice(0,6).join(' | ')+(diffs.length>6?' …(+'+(diffs.length-6)+')':''));
check('exemple TC : 8 absences (4 pts bruts) → 3 retirés avant, 4 après ; 10 absences → 3 avant, 5 après',before['TC LSH 2'].st['s10_1'][0].ded===3&&after['TC LSH 2'].st['s10_1'][0].ded===4&&after['TC LSH 2'].st['s10_0'][0].ded===5,JSON.stringify([before['TC LSH 2'].st['s10_1'][0],after['TC LSH 2'].st['s10_1'][0],after['TC LSH 2'].st['s10_0'][0]]));
// ---- détection du niveau
const L=await p.evaluate(()=>{const f=window.CJR.levelOf,T={TC:['TC','TCS3','tcs1','tcl2','TC-LSH 1','TC SF','TC_SM 2','Tronc commun','tronc-commun sciences','TRONC COMMUN Lettres 2','جذع مشترك علمي'],'1BAC':['1BACSH1','1BACLSH1','1bac sm','1 BAC SE 2','1-BAC-SVT','1ère année bac','1ERE ANNEE BAC SH','1re bac','1er bac','Première année bac','1ère année du bac','الأولى باكالوريا'],'2BAC':['2BACSP4','2BACSSVT1','2bac pc','2 BAC SH','2-bac-sm','2ème année bac','2EME ANNÉE BAC','2e bac','2nde bac','Deuxième année bac','الثانية باكالوريا'],'':['3AC1','ASS','Classe A','','6AP','BTS 1']};const bad=[];Object.keys(T).forEach(k=>T[k].forEach(n=>{if(f(n)!==k)bad.push(n+'→'+f(n));}));return {bad,n:Object.values(T).flat().length};});
check('détection du niveau TC / 1BAC / 2BAC ('+L.n+' libellés : majuscules/minuscules, espaces, tirets, « Tronc commun », « 1ère année bac », « 2ème année bac », arabe)',L.bad.length===0,L.bad.join(', '));
// ---- Rapports : synthèse toutes classes + classe seule
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="reports"]').click();});await sleep(400);
await p.evaluate(()=>{const s=document.getElementById('repClass');s.value='';s.dispatchEvent(new Event('change'));const t=document.getElementById('repScope');t.value='0';t.dispatchEvent(new Event('change'));});await sleep(400);
const infoAll=await p.evaluate(()=>document.getElementById('repInfo').textContent);
await p.evaluate(()=>window.scrollTo(0,0));await sleep(200);{const bb=await p.evaluate(()=>{const r=document.getElementById('repInfo').closest('.card').getBoundingClientRect();return {y:r.top,h:r.height};});await p.screenshot({path:'/tmp/v27-rapports-all.png',clip:{x:0,y:0,width:390,height:Math.min(844,bb.y+bb.h+10)}});}
check('Rapports, toutes les classes : valeur par classe (5 pts (TC) : TCS1… · 4 pts (1BAC) : … · 3 pts …)',/note comportementale par cycle : 5 pts \(TC\) : TCS1, TC LSH 2, Tronc commun sciences 3 · 4 pts \(1BAC\) : 1BACLSH1, 1BACLSH2, 1BACLSH3, 1BACLSH4, 1ère année bac SM · 3 pts \(2BAC\) : 2BACSP4/.test(infoAll)&&/3 pts : 3AC1/.test(infoAll)&&!/selon la classe/.test(infoAll),infoAll.slice(infoAll.indexOf('note')));
await p.evaluate(()=>{const s=document.getElementById('repClass');s.value='cTC2';s.dispatchEvent(new Event('change'));});await sleep(300);
const infoOne=await p.evaluate(()=>document.getElementById('repInfo').textContent);
const cell=await p.evaluate(()=>{const td=document.querySelector('#repTable tbody tr td.ptsc');return td?td.textContent:'';});
check('Rapports, classe TC : « note comportementale : 5 pts par cycle (TC) » et points « / 5 »',/note comportementale : 5 pts par cycle \(TC\)/.test(infoOne)&&/\/ 5/.test(cell),infoOne.slice(infoOne.indexOf('note'))+' | '+cell);
await p.screenshot({path:'/tmp/v27-rapports.png'});
// ---- PDF
async function pdf(fn){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(fn);try{await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});}catch(e){return null;}
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:x.name,b64:btoa(s)};});
  const f='/tmp/v27_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));return {f,name:r.name};}
const txt=f=>cp.execSync('pdftotext -layout '+f+' -').toString().replace(/\s+/g,' ');
const pc=await pdf(()=>document.getElementById('repExportPdf').click());
if(pc){const t=txt(pc.f);check('PDF bilan du cycle (TC) : « note comportementale : 5 pts par cycle (TC) », points « / 5 »',/note comportementale : 5 pts par cycle \(TC\)/.test(t)&&/\/ 5/.test(t),t.slice(t.indexOf('note comp'),t.indexOf('note comp')+50));fs.copyFileSync(pc.f,'/tmp/v27-cycle-tc.pdf');}else check('PDF bilan du cycle',false);
await p.evaluate(()=>{const s=document.getElementById('repScope');s.value='year';s.dispatchEvent(new Event('change'));});await sleep(300);
const py=await pdf(()=>document.getElementById('repExportPdf').click());
if(py){const t=txt(py.f);check('PDF bilan annuel (TC) : note par cycle « 5 pts par cycle (TC) »',/note comportementale : 5 pts par cycle \(TC\)/.test(t)&&/limités par la note comportementale \(5 pts par cycle \(TC\)\)/.test(t));}else check('PDF bilan annuel',false);
const pa=await pdf(()=>document.getElementById('repAllPdf').click());
if(pa){const t=cp.execSync('pdftotext -layout '+pa.f+' -').toString();fs.copyFileSync(pa.f,'/tmp/v27-all.pdf');
  const row=n=>(t.split('\n').find(l=>l.trim().startsWith(n+' ')&&/\d\s*\/\s*\d/.test(l)&&/%/.test(l))||'');
  check('PDF synthèse toutes classes : colonne « Note comp. » par classe (TCS1 5 (TC), 1BACLSH2 4 (1BAC), 2BACSP4 3 (2BAC), 3AC1 3) + source OP 2007',/Note comp\./.test(t)&&/5 \(TC\)/.test(row('TCS1'))&&/4 \(1BAC\)/.test(row('1BACLSH2'))&&/3 \(2BAC\)/.test(row('2BACSP4'))&&/\s3\s/.test(row('3AC1'))&&/Connaissances comportementales \(OP 2007\) : TC 5 · 1BAC 4 · 2BAC 3/.test(t.replace(/\s+/g,' ')),[row('TCS1'),row('3AC1')].map(x=>x.trim().slice(0,40)).join(' | '));}else check('PDF synthèse',false);
// ---- Paramètres : réglage par classe (défaut selon le niveau / personnalisée)
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(500);
const ui=await p.evaluate(()=>{const l=document.querySelector('#clsManage .capline[data-cid="cTC1"]');return {n:document.querySelectorAll('#clsManage .capline').length,sel:l.querySelector('.capsel').value,opt:l.querySelector('.capsel option').textContent,dis:l.querySelector('.capin').disabled,v:l.querySelector('.capin').value,chip:(l.querySelector('.chip')||{}).textContent,info:(l.querySelector('.capinfo')||{}).textContent||'',help:document.querySelector('#clsManage').closest('.card').querySelector('p').textContent,old:(l.querySelector('.capold')||{}).textContent||''};});
check('Paramètres › Classes : option « Par défaut selon le niveau (TC 5 · 1BAC 4 · 2BAC 3) » sélectionnée, 5 pts, niveau TC, source OP 2007',ui.n===15&&ui.sel==='auto'&&ui.opt==='Par défaut selon le niveau (TC 5 · 1BAC 4 · 2BAC 3)'&&ui.dis&&ui.v==='5'&&ui.chip==='TC'&&/Connaissances comportementales \(OP 2007\)\s:\sTC 5 · 1BAC 4 · 2BAC 3/.test(ui.help),JSON.stringify(ui).slice(0,300));
check('ancienne valeur personnalisée signalée et conservée (TCS1 : 4 pts avant 1.27)',/Avant la version 1\.27 : 4 pts/.test(ui.old),ui.old);
const rec=()=>p.evaluate(()=>{const A=window.CJR;return {cap:A.capOf('cTC1'),ded:A.yearStat('cTC1','s9_0').per[0].ded,raw:A.yearStat('cTC1','s9_0').per[0].raw,cls:JSON.parse(localStorage.getItem('classRegister.v2')).classes.find(c=>c.id==='cTC1')};});
await p.select('#clsManage .capline[data-cid="cTC1"] .capsel','m');await sleep(300);
const m1=await rec();
check('« Valeur personnalisée » : reprend l’ancienne valeur (4) dans capM, enregistrée',m1.cap===4&&m1.cls.capM===4&&m1.cls.cap===4&&m1.ded===4,JSON.stringify(m1));
await p.evaluate(()=>{const i=document.querySelector('#clsManage .capline[data-cid="cTC1"] .capin');i.value='4.5';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
const m2=await rec();
check('valeur personnalisée 4,5 : points recalculés (10 abs. = 5 pts bruts → 4,5 retirés)',m2.cap===4.5&&m2.cls.capM===4.5&&m2.ded===4.5&&m2.raw===5,JSON.stringify(m2));
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const m3=await rec();check('valeur personnalisée conservée après rechargement (champ capM toléré par la normalisation / synchro)',m3.cap===4.5&&m3.cls.capM===4.5,JSON.stringify(m3.cls));
const js=await p.evaluate(()=>window.CJR.getJSON?window.CJR.getJSON():localStorage.getItem('classRegister.v2'));check('capM présent dans le JSON synchronisé / sauvegardé',/"capM":4\.5/.test(js));
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(400);
await p.select('#clsManage .capline[data-cid="cTC1"] .capsel','auto');await sleep(300);
const m4=await rec();check('retour « Par défaut selon le niveau » : 5 pts, capM supprimé, ancien champ cap conservé',m4.cap===5&&!('capM' in m4.cls)&&m4.cls.cap===4&&m4.ded===5,JSON.stringify(m4));
// renommage : la valeur par défaut suit le niveau
await p.evaluate(()=>{const r=document.querySelector('#clsManage .clsrow[data-cid="cO"] input[type=text]');r.value='TCL4';r.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
const rn=await p.evaluate(()=>({cap:window.CJR.capOf('cO'),v:document.querySelector('#clsManage .capline[data-cid="cO"] .capin').value}));
check('renommer « 3AC1 » en « TCL4 » : note par défaut 3 → 5',rn.cap===5&&rn.v==='5',JSON.stringify(rn));
await p.evaluate(()=>{const r=document.querySelector('#clsManage .clsrow[data-cid="cO"] input[type=text]');r.value='3AC1';r.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
// nouvelles classes
async function newCls(name,cap){await p.evaluate(()=>document.getElementById('addStudentBtn').click());await sleep(250);await p.evaluate(()=>document.getElementById('addClsChoice').click());await sleep(250);
  await p.evaluate((n,c)=>{const i=document.getElementById('ncName');i.value=n;i.dispatchEvent(new Event('input'));document.getElementById('ncCap').value=c;},name,cap);
  const hint=await p.evaluate(()=>document.getElementById('ncCapHint').textContent);await p.evaluate(()=>document.getElementById('ncSave').click());await sleep(300);
  return p.evaluate((n,h)=>{const A=window.CJR,c=A.db().classes.find(x=>x.name===n);return {cap:A.capOf(c.id),capM:c.capM,hint:h};},name,hint);}
const n1=await newCls('TC SF 5',''),n2=await newCls('1BAC SE 7',''),n3=await newCls('2BACPC 8',''),n4=await newCls('TCS9','6');
check('nouvelles classes : TC SF 5 → 5, 1BAC SE 7 → 4, 2BACPC 8 → 3 (sans champ personnalisé) ; aide « ici : 5 pts, TC »',n1.cap===5&&n2.cap===4&&n3.cap===3&&n1.capM===undefined&&n2.capM===undefined&&/ici\s:\s5 pts, TC/.test(n1.hint)&&/OP 2007/.test(n1.hint),JSON.stringify([n1,n2,n3]).slice(0,240));
check('nouvelle classe avec valeur saisie différente (TCS9 : 6) → valeur personnalisée capM = 6',n4.cap===6&&n4.capM===6,JSON.stringify(n4));
// capture Paramètres
await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(400);
await p.evaluate(()=>{const c=window.CJR.cls('c1B');})
;await p.select('#clsManage .capline[data-cid="c2B"] .capsel','m');await sleep(200);await p.evaluate(()=>{const i=document.querySelector('#clsManage .capline[data-cid="c2B"] .capin');i.value='3.5';i.dispatchEvent(new Event('change',{bubbles:true}));});
await sleep(3600);await p.evaluate(()=>{const r=document.querySelector('#clsManage .clsrow[data-cid="cTC1"]');window.scrollTo(0,r.getBoundingClientRect().top+window.scrollY-130);});await sleep(300);
await p.screenshot({path:'/tmp/v27-classes.png'});
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
