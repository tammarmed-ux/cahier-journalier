/* 1.29.0 (-c) : « une classe = une page » — chaque PDF généré avec des classes de 30, 40, 44 et 45 élèves (noms latins, arabes, très longs).
   44 élèves → tableau d’élèves sur UNE page ; 45 → deux pages, ligne d’en-tête répétée, aucune ligne coupée ; police du corps ≥ 7 pt.
   DIR=… PORT=… REPORT=1 : mesure seule (comparaison avant / après). */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8046,REPORT=!!process.env.REPORT,OUT=process.env.OUT||'/workspace/pdf44/'+(REPORT?'before':'after');
fs.mkdirSync(OUT,{recursive:true});const KEY='classRegister.v2';
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const SIZES={TCS30:30,'1BAC40':40,'2BAC44':44,'2BAC45':45};
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.emulateTimezone('Etc/GMT-1');await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
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
await open();const O='/workspace/backups/v1.29.0-preview/';
for(const [t,f] of [['attendance','nav-C-app-1'],['home','nav-C-app-2']]){await p.click('#tabs button[data-tab='+t+']');await sleep(700);await p.screenshot({path:O+f+'.png'});}
const m=await p.evaluate(()=>[...document.querySelectorAll('#tabs button')].map(b=>{const r=b.getBoundingClientRect(),i=b.querySelector('.ti').getBoundingClientRect(),tx=document.createRange();tx.selectNodeContents(b);const lr=[...tx.getClientRects()].pop();return [b.dataset.tab,Math.round(r.width),Math.round(r.height),+(i.left+i.width/2-(r.left+r.width/2)).toFixed(1)];}));
console.log(JSON.stringify(m),errs.length?'ERR '+errs:'no-errors');await b.close();srv.close();})();
