/* 1.29.0 (-c) : « une classe = une page » — chaque PDF généré avec des classes de 30, 40, 44 et 45 élèves (noms latins, arabes, très longs).
   44 élèves → tableau d’élèves sur UNE page ; 45 → deux pages, ligne d’en-tête répétée, aucune ligne coupée ; police du corps ≥ 7 pt.
   DIR=… PORT=… REPORT=1 : mesure seule (comparaison avant / après). */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8044,REPORT=!!process.env.REPORT,OUT=process.env.OUT||'/workspace/pdf44/'+(REPORT?'before':'after');
fs.mkdirSync(OUT,{recursive:true});const KEY='classRegister.v2';
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const SIZES={TCS30:30,'1BAC40':40,'2BAC44':44,'2BAC45':45};
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:600000,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.emulateTimezone('Etc/GMT-1');await p.setViewport({width:390,height:844});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const open=async()=>{await p.goto('http://localhost:'+PORT+'/',{waitUntil:'networkidle2'});await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});await sleep(400);};
await open();
await p.evaluate((KEY,SIZES)=>{const d=JSON.parse(localStorage.getItem(KEY));let seed=4242;const R=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};const pick=a=>a[Math.floor(R()*a.length)];
  const FN_F=['Salma','Imane','Hajar','Aya','Khadija','Meryem','Fatima-Zahra','Hiba','Oumaima','Nour','Chaïmae','Inès','Rania','Ghita','Sara'],FN_G=['Youssef','Mohamed','Amine','Hamza','Anas','Othmane','Ilyas','Zakaria','Ayoub','Mehdi','Achraf','Réda','Saâd','Omar','Adam'];
  const LN=['EL AMRANI','BENALI','TAZI','ALAOUI','IDRISSI','BENNANI','CHRAÏBI','EL FASSI','BERRADA','LAHLOU','OUAZZANI','NACIRI','SQALLI','KETTANI','BENJELLOUN','ZNIBER'];
  const AR_F=['سلمى','إيمان','هاجر','خديجة','مريم','فاطمة الزهراء'],AR_G=['يوسف','محمد','أمين','حمزة','عثمان','زكرياء'],AR_L=['العلوي','بنعلي','التازي','الإدريسي','بناني','الفاسي'];
  const LONG=['EL OUAZZANI BENJELLOUN IDRISSI Fatima-Zahra Chaïmae','عبد الرحمن بن عبد الله الإدريسي العلوي الحسني','BENABDELJALIL EL KHATTABI Mohamed-Amine'];
  d.classes=Object.keys(SIZES).map((n,i)=>({id:'k'+i,name:n}));d.students=[];d.sessions={};d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  d.periods=['Course en durée','Lancer de poids','Basket-ball','Gymnastique au sol','Hand-ball','Course de vitesse'];d.evals={cyc:{'0':'athle','1':'coll','2':'coll','3':'gym','4':'coll','5':'athle'}};
  d.cal.tt=[];d.classes.forEach((c,ci)=>{d.cal.tt.push({id:'t'+ci,type:'class',day:1+ci,start:'08:00',end:'10:00',classId:c.id,room:'Terrain'});
    for(let i=0;i<SIZES[c.name];i++){const f=R()<0.5,ar=R()<0.25;let name=ar?(pick(f?AR_F:AR_G)+' '+pick(AR_L)):(pick(LN)+' '+pick(f?FN_F:FN_G));if(i%15===7)name=LONG[(i+ci)%3];
      const s={id:'s'+ci+'_'+i,classId:c.id,name,sid:(f?'K':'J')+String(130000000+Math.floor(R()*8e8)).slice(0,9),dob:'2008-0'+(1+i%9)+'-1'+(i%9),parent:'Parent '+i,phone:'06'+String(Math.floor(R()*1e8)).padStart(8,'0'),notes:'',created:1,sex:f?'F':'G'};
      s.phys={h:Math.round(f?150+R()*22:160+R()*25),w:Math.round(45+R()*30),dv:Math.round(30+R()*20),dh:Math.round(150+R()*60),fc:Math.round(58+R()*28),nav:Math.round((6+R()*5)*2)/2,vma:Math.round((10+R()*4)*10)/10,v30:Math.round((4.6+R()*1.2)*100)/100,soup:Math.round(-8+R()*28),mb:Math.round((4+R()*4)*10)/10,eq:Math.round(5+R()*40)};
      if(i===3)s.dispense={type:'annee',since:'2026-09-14'};d.students.push(s);}});
  d.ui.cls='k0';d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY,SIZES);
await open();
await p.evaluate(KEY=>{const A=window.CJR,d=JSON.parse(localStorage.getItem(KEY));let seed=99;const R=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
  d.classes.forEach(c=>{const st=d.students.filter(s=>s.classId===c.id);for(let pp=0;pp<2;pp++){const S=A.sessCount(c.id,pp);for(let s=0;s<S;s++){const marks={};st.forEach(x=>{const r=R();
      if(r<0.04)marks[x.id]={s:'A',j:false,r:''};else if(r<0.06)marks[x.id]={s:'A',j:true,r:'Certificat'};else if(r<0.075)marks[x.id]={s:'L',j:false,r:''};else if(r<0.09)marks[x.id]={s:'ST',j:false,r:''};else if(r<0.1)marks[x.id]={s:'M',j:false,r:''};});
      d.sessions[c.id+'|'+pp+'|'+s]={date:'',marks};}}
    const sp=A.gradeSpec(c.id,0);st.forEach((x,i)=>{if(i%11===5)return;const e={};sp.cols.forEach(k=>{e[k.k]=Math.round(R()*k.max*4)/4;});x.ev=x.ev||{};x.ev[c.id+'|0']=e;});});
  localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await open();
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(300);
for(const cid of ['k0','k1','k2','k3']){await p.evaluate(cid=>{const s=document.getElementById('attClass');s.value=cid;s.dispatchEvent(new Event('change'));},cid);await sleep(80);
  await p.evaluate(()=>document.querySelector('#attGrp [data-grp="open"]').click());await sleep(80);await p.evaluate(()=>document.getElementById('grpGen').click());await sleep(150);await p.evaluate(()=>document.querySelector('#grpModal .x').click());}
console.log('seed',JSON.stringify(await p.evaluate(()=>window.CJR.db().classes.map(c=>c.name+'='+window.CJR.studentsIn(c.id).length+(c.grp?'/g':'')))));
const make=async(kind,o)=>p.evaluate(async(kind,o)=>{const L=['vendor/jspdf.umd.min.js','vendor/jspdf.plugin.autotable.min.js','vendor/bidi-js.min.js','cj-pdf.js'];
  if(!window.CJPDF)for(const s of L)await new Promise((res,rej)=>{const e=document.createElement('script');e.src=s;e.onload=res;e.onerror=rej;document.head.appendChild(e);});
  const t0=performance.now();const r=await window.CJPDF.make(kind,o);const a=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));
  return {b64:btoa(s),name:r.name,ms:Math.round(performance.now()-t0),log:window.CJPDF._test.log?window.CJPDF._test.log():null};},kind,o);
const pages=f=>+cp.execSync('pdfinfo "'+f+'"').toString().match(/Pages:\s+(\d+)/)[1];
const ptxt=(f,i)=>cp.execSync('pdftotext -layout -f '+i+' -l '+i+' "'+f+'" -').toString();
const N={k0:30,k1:40,k2:44,k3:45};const SUM=[];
async function gen(label,kind,o){const r=await make(kind,o);const f=OUT+'/'+label+'.pdf';fs.writeFileSync(f,Buffer.from(r.b64,'base64'));const n=pages(f);SUM.push({label,pages:n,ms:r.ms,log:r.log});return {f,n,log:r.log||[]};}
const perClass=[['releve','grades',c=>({cid:c,p:0})],['bilan-cycle','cycle',c=>({cid:c,p:0})],['bilan-annuel','year',c=>({cid:c})],['liste','students',c=>({cid:c})],['tests','tests',c=>({cid:c})],['groupes','groups',c=>({cid:c})],['trombi','trombi',c=>({cid:c,mode:'page'})],['absences','records',c=>({cid:c})]];
const R={};
for(const [lab,kind,mk] of perClass)for(const cid of ['k0','k1','k2','k3'])R[lab+'-'+N[cid]]=await gen(lab+'-'+N[cid],kind,mk(cid));
for(const [lab,kind,o] of [['synthese','all',{}],['bilan-toutes','all',{scope:'year',detail:true}],['tests-toutes','tests',{}],['liste-toutes','students',{}]])R[lab]=await gen(lab,kind,o);
SUM.forEach(s=>console.log('PDF',s.label.padEnd(18),'pages',String(s.pages).padStart(2),(s.ms+'ms').padStart(7),s.log?s.log.map(t=>t.tag+':'+t.n+'→p'+t.start+(t.end>t.start?'-'+t.end:'')+' '+t.fs+'pt/'+t.pad+(t.off?' +'+t.off:'')).join(' | '):''));
fs.writeFileSync(OUT+'/summary.json',JSON.stringify(SUM,null,1));
if(REPORT){srv.close();await b.close();process.exit(0);}
const one=(lab,tag)=>[30,40,44].map(n=>{const t=R[lab+'-'+n].log.filter(l=>l.tag===tag);return t.length===1&&t[0].start===t[0].end&&t[0].minBody>=7;});
const two=(lab,tag,head)=>{const x=R[lab+'-45'],t=x.log.filter(l=>l.tag===tag);if(t.length!==2)return false;const [a,c]=t;const h1=ptxt(x.f,c.start);return a.start===a.end&&c.start===a.end+1&&a.n+c.n===45&&c.off===a.n&&a.minBody>=7&&c.minBody>=7&&head.every(h=>h1.includes(h));};
for(const [lab,tag,head] of [['releve','releve',['Nom et prénom','Note /20','Comport.']],['bilan-cycle','detail',['Nom et prénom','Présence']],['bilan-cycle','registre',['Nom et prénom']],['bilan-annuel','detail',['Nom et prénom','Présence']],['bilan-annuel','points',['Nom et prénom','Total']]]){
  check(lab+' / '+tag+' : 30, 40 et 44 élèves → tableau sur une seule page, corps ≥ 7 pt',one(lab,tag).every(Boolean),JSON.stringify(one(lab,tag)));
  check(lab+' / '+tag+' : 45 élèves → 2 pages, en-tête répété, 45 lignes entières, corps ≥ 7 pt',two(lab,tag,head),JSON.stringify(R[lab+'-45'].log.filter(l=>l.tag===tag)));}
for(const [lab,tg,head] of [['liste','liste:',['Nom et prénom','Téléphone']],['tests','tests:',['Nom et prénom','Indice']]]){
  const t=n=>R[lab+'-'+n].log.filter(l=>l.tag.startsWith(tg));
  check(lab+' : 30, 40 et 44 élèves → une page, corps ≥ 7 pt',[30,40,44].every(n=>t(n).length===1&&t(n)[0].start===t(n)[0].end&&t(n)[0].minBody>=7),JSON.stringify([30,40,44].map(n=>t(n))));
  const q=t(45);check(lab+' : 45 élèves → 2 pages, en-tête répété',q.length===2&&q[1].start===q[0].end+1&&q[0].n+q[1].n===45&&head.every(h=>ptxt(R[lab+'-45'].f,q[1].start).includes(h)),JSON.stringify(q));}
check('relevé 30 / 40 / 44 élèves : document entier sur 1 page (en-tête, cartes, tableau, notes)',[30,40,44].every(n=>R['releve-'+n].n===1),[30,40,44].map(n=>R['releve-'+n].n).join(','));
check('relevé 45 élèves : 2 pages',R['releve-45'].n===2,R['releve-45'].n);
const rt=ptxt(R['releve-44'].f,1),rts=rt.replace(/\s+/g,' ');
check('relevé : titre avec la classe (« Relevé de notes · Cycle 1 – Course en durée – 2BAC44 »)',/Relevé de notes · Cycle 1 – Course en durée – 2BAC44/.test(rts),rt.split('\n').find(l=>/Relevé/.test(l)));
const hl=rt.split('\n').find(l=>/Nom et prénom/.test(l))||'';
check('relevé : Note /20 juste après le nom ; plus de « Procéd. » ni de colonnes A / M / R / ST',/Nom et prénom\s+Note \/20/.test(hl)&&!/Procéd\./.test(rt)&&!/\bST\b/.test(hl)&&!/\s(A|M|R)\s/.test(' '+hl+' '),hl.trim());
{const x=R['bilan-cycle-44'],lg=x.log,dp=lg.find(l=>l.tag==='detail'),rp=lg.find(l=>l.tag==='registre'),T=ptxt(x.f,dp.start).replace(/\s+/g,' '),G=ptxt(x.f,rp.start).replace(/\s+/g,' ');check('bilan de cycle (1.29.1-d) : Note /20 après le nom, Produit / Perf. / Concept., A et R retirés, Pts conservé',/Note/.test(T)&&/\/20/.test(T)&&/Produi/.test(T)&&/Perf\. \/7/.test(T)&&/Conce/.test(T)&&!/ A AJ /.test(T)&&/ AJ M MJ ST /.test(T)&&/Note/.test(G)&&/Produi/.test(G)&&/Pts/.test(G)&&!/ A R Pts/.test(G),T.slice(0,300)+' || '+G.slice(0,200));}
check('bilan de cycle : titre avec la classe',/Bilan · Cycle 1 – Course en durée – 2BAC44/.test(ptxt(R['bilan-cycle-44'].f,1).replace(/\s+/g,' ')));
for(const lab of ['synthese','bilan-toutes']){const t=R[lab].log.filter(l=>l.tag.startsWith('classe:'));
  const ok=t.length===5&&['TCS30','1BAC40','2BAC44'].every(c=>{const x=t.find(l=>l.tag==='classe:'+c);return x&&x.start===x.end;})&&(()=>{const z=t.filter(l=>l.tag==='classe:2BAC45');return z.length===2&&z[1].start===z[0].end+1&&z[0].n+z[1].n===45;})();
  const dist=new Set(t.filter(l=>l.tag!=='classe:2BAC45').map(l=>l.start)).size===3;
  check(lab+' : une page par classe (30 / 40 / 44 sur une page chacune, 45 sur deux), corps ≥ 7 pt',ok&&dist&&t.every(l=>l.minBody>=7),JSON.stringify(t.map(l=>[l.tag,l.n,l.start,l.end,l.fs,l.pad])));}
{const t=R['tests-toutes'].log;check('tests toutes classes : résultats individuels une page par classe (45 → 2)',t.length===5&&t.filter(l=>l.tag!=='tests:2BAC45').every(l=>l.start===l.end),JSON.stringify(t.map(l=>[l.tag,l.n,l.start,l.end])));}
{const t=R['liste-toutes'].log;check('liste toutes classes : une page par classe (45 → 2)',t.length===5&&t.filter(l=>l.tag!=='liste:2BAC45').every(l=>l.start===l.end),JSON.stringify(t.map(l=>[l.tag,l.n,l.start,l.end])));}
check('noms arabes rendus avec la police arabe intégrée (relevé 44)',/NSA|Noto/i.test(cp.execSync('pdffonts "'+R['releve-44'].f+'"').toString())&&/[\u0600-\u06FF\uFB50-\uFEFF]/.test(rt));
check('aucune erreur JavaScript',errs.length===0,errs.join(' | '));
console.log(results.filter(Boolean).length+'/'+results.length+' passed');srv.close();await b.close();process.exit(results.every(Boolean)?0:1);
})().catch(e=>{console.error('FATAL',e);process.exit(1);});
