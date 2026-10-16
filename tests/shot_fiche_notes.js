/* 1.29.1 (-b) : « Télécharger tous les essais » — bouton à côté de « Essai 1 » (Note procédurale, athlétisme), PDF (1 page jusqu’à 44 élèves, triés par code Massar) et CSV ; lecture seule. */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8053,REPORT=!!process.env.REPORT,OUT=process.env.OUT||'/workspace/pdf44/essais';
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
const p=await b.newPage();await p.emulateTimezone('Etc/GMT-1');await p.setViewport({width:390,height:844,deviceScaleFactor:3});
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
const make=async(kind,o)=>p.evaluate(async(kind,o)=>{const L=['vendor/jspdf.umd.min.js','vendor/jspdf.plugin.autotable.min.js','vendor/bidi-js.min.js','cj-pdf.js'];
  if(!window.CJPDF)for(const s of L)await new Promise((res,rej)=>{const e=document.createElement('script');e.src=s;e.onload=res;e.onerror=rej;document.head.appendChild(e);});
  const t0=performance.now();const r=await window.CJPDF.make(kind,o);const a=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));
  return {b64:btoa(s),name:r.name,ms:Math.round(performance.now()-t0),log:window.CJPDF._test.log?window.CJPDF._test.log():null};},kind,o);
const pages=f=>+cp.execSync('pdfinfo "'+f+'"').toString().match(/Pages:\s+(\d+)/)[1];
const ptxt=(f,i)=>cp.execSync('pdftotext -layout -f '+i+' -l '+i+' "'+f+'" -').toString();
const raw0=await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.evals.evt=d.evals.evt||{};let k=0;
  d.classes.forEach(c=>{d.evals.evt[c.id+'|0']='endurance';d.students.filter(s=>s.classId===c.id).forEach((s,i)=>{if(i%9===4)return;k++;const m=3+(k%3),a=String(10+(k*7)%50),b=String(10+(k*13)%50);s.ev=s.ev||{};s.ev[c.id+'|0']=Object.assign(s.ev[c.id+'|0']||{},{essais:i%5===2?[m+'.'+a]:[m+'.'+a,(m-1+(i%2))+'.'+b,i%3?m+'.05':''].filter((x,j,arr)=>j<2||x),prodAuto:true,perfEvent:'endurance'});});});
  localStorage.setItem(KEY,JSON.stringify(d));return null;},KEY);
await open();const RAW0=await p.evaluate(KEY=>localStorage.getItem(KEY),KEY);
// ----- écran Note procédurale, classe de 44 -----
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="proc"]').click());await sleep(300);
const selCls=async cid=>{await p.evaluate(cid=>{const s=document.querySelector('#view-proc select');if(s){s.value=cid;s.dispatchEvent(new Event('change'));}window.CJR.db().ui.cls=cid;},cid);await sleep(200);};
await p.evaluate(()=>{const A=window.CJR;A.db().ui.cls='k2';A.db().ui.per=0;});await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();document.querySelector('#tabs button[data-tab="proc"]').click();});await sleep(500);

await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(600);await p.evaluate(()=>{const c=document.querySelector('#gridWrap td.comp');c&&c.click();});await sleep(700);
const info=await p.evaluate(()=>{const m=document.getElementById('detModal'),h=[...m.querySelectorAll('h3')].find(x=>/Notes \/20/.test(x.textContent));h&&h.scrollIntoView({block:'start'});return {has:!!document.getElementById('detComp'),txt:/Calcul|Comport\. \(Cycle/.test(m.textContent),h:!!h};});
console.log(JSON.stringify(info),await p.evaluate(()=>document.documentElement.className+' | '+[...document.body.children].filter(e=>getComputedStyle(e).display!=='none').map(e=>e.id||e.tagName).join(',')));await sleep(300);await p.screenshot({path:'/workspace/backups/v1.29.1-preview/fiche-notes.png'});await b.close();srv.close();})();
