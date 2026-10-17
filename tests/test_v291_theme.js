/* 1.29.1 (-f) : sélecteur de thème — test (données intactes, persistance, contraste, PDF inchangés). Base de données d’essai reprise de measure_home_compact */
/* (origine) 1.29.0 (-c) : « une classe = une page » — chaque PDF généré avec des classes de 30, 40, 44 et 45 élèves (noms latins, arabes, très longs).
   44 élèves → tableau d’élèves sur UNE page ; 45 → deux pages, ligne d’en-tête répétée, aucune ligne coupée ; police du corps ≥ 7 pt.
   DIR=… PORT=… REPORT=1 : mesure seule (comparaison avant / après). */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8057,REPORT=!!process.env.REPORT,OUT="/tmp";
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
const p=await b.newPage();await p.emulateTimezone('Etc/GMT-1');
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

await p.evaluateOnNewDocument(()=>{const T=new Date('2026-10-13T07:40:00+01:00').getTime(),R=Date,o=R.now();class D extends R{constructor(...a){if(a.length)super(...a);else super(T+(R.now()-o));}static now(){return T+(R.now()-o);}};window.Date=D;});
await p.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const scan=()=>p.evaluate(()=>{const P=s=>{const m=s.match(/rgba?\(([^)]+)\)/);if(!m)return null;const a=m[1].split(/[ ,\/]+/).filter(Boolean).map(Number);return [a[0],a[1],a[2],a.length>3?a[3]:1];};
  const L=c=>{const f=x=>{x/=255;return x<=.03928?x/12.92:((x+.055)/1.055)**2.4;};return .2126*f(c[0])+.7152*f(c[1])+.0722*f(c[2]);};
  const over=(top,bot)=>{const a=top[3];return [top[0]*a+bot[0]*(1-a),top[1]*a+bot[1]*(1-a),top[2]*a+bot[2]*(1-a),1];};
  const bgOf=el=>{const st=[];for(let e=el;e;e=e.parentElement){const cs=getComputedStyle(e);if(cs.backgroundImage&&/gradient/.test(cs.backgroundImage)){const all=[...cs.backgroundImage.replace(/url\([^)]*\)/g,'').matchAll(/rgba?\([^)]+\)/g)].map(m=>P(m[0]));const op=all.filter(c=>c[3]>=.98);const bc=P(cs.backgroundColor);const ref=op.length?op[op.length-1]:(bc&&bc[3]>=.98?bc:null);const cols=all.filter(c=>c[3]>.15).map(c=>c[3]<.98&&ref?over(c,ref):c).filter(c=>c[3]>=.98||!ref);if(cols.length){st.push({grad:cols});break;}}
      const c=P(cs.backgroundColor);if(c&&c[3]>0){st.push(c);if(c[3]>=.98)break;}}
    let base=[255,255,255,1];const res=[];const fin=g=>{let b=base;for(let i=st.length-1;i>=0;i--){const x=st[i];if(x.grad)b=g;else b=over(x,b);}return b;};
    const g=st.find(x=>x.grad);if(g)return g.grad.map(c=>fin(c));return [fin(base)];};
  const out=[];const vis=e=>{const r=e.getBoundingClientRect();if(r.width<2||r.height<2||r.bottom<0||r.top>innerHeight)return false;const cs=getComputedStyle(e);return cs.visibility!=='hidden'&&+cs.opacity>.3;};
  document.querySelectorAll('body *').forEach(e=>{if(!vis(e))return;if(![...e.childNodes].some(n=>n.nodeType===3&&n.textContent.trim().length>1))return;if(e.closest('[aria-hidden=true],svg,.thsw'))return;
    const cs=getComputedStyle(e);let op=1;for(let x=e;x;x=x.parentElement)op*=+getComputedStyle(x).opacity;if(op<.5)return;const fg=P(cs.color);if(!fg)return;
    const fs=parseFloat(cs.fontSize),bold=+cs.fontWeight>=700,large=fs>=24||(bold&&fs>=18.66);const bgs=bgOf(e);
    const worst=Math.min(...bgs.map(b=>{const f=fg[3]<1?over(fg,b):fg;const a=L(f),c=L(b);return (Math.max(a,c)+.05)/(Math.min(a,c)+.05);}));
    const need=large?3:4.5;if(worst<need)out.push({t:e.textContent.trim().slice(0,34),cls:(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.split(' ').join('.'):'')+' <'+e.tagName.toLowerCase(),r:Math.round(worst*100)/100,need,fs});});
  return out;});
const go=async scr=>{await p.evaluate(s=>{document.querySelector('#tabs button[data-tab="'+s+'"]').click();},scr);await sleep(450);await p.evaluate(()=>scrollTo(0,0));await sleep(150);};

const snap=()=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k!=='cj.theme')o[k]=localStorage.getItem(k);}return o;});
await open();const S0=await snap(),RAW0=S0[KEY];
check('base d’essai chargée (classRegister.v2 présent)',RAW0&&RAW0.length>1000,RAW0&&RAW0.length);
let st=await p.evaluate(()=>({dt:document.documentElement.getAttribute('data-theme'),pri:getComputedStyle(document.documentElement).getPropertyValue('--pri').trim(),k:localStorage.getItem('cj.theme'),b:(()=>{const r=document.getElementById('themeBtn').getBoundingClientRect(),q=document.getElementById('syncPill').getBoundingClientRect();return {w:r.width,h:r.height,ov:!(r.left>=q.right||r.right<=q.left||r.top>=q.bottom||r.bottom<=q.top),al:document.getElementById('themeBtn').getAttribute('aria-label')};})()}));
check('par défaut : thème actuel (aucun data-theme, --pri #0B3A6E, aucune clé cj.theme)',st.dt===null&&/^#0B3A6E$/i.test(st.pri)&&st.k===null,JSON.stringify(st));
check('icône palette dans l’en-tête : 44×44, libellé, ne chevauche pas la pastille de synchro',st.b.w>=44&&st.b.h>=44&&!st.b.ov&&st.b.al==='Changer de thème',JSON.stringify(st.b));
await p.click('#themeBtn');await sleep(250);
let pk=await p.evaluate(()=>{const P=document.getElementById('thPop');return {open:P.classList.contains('open'),opts:[...P.querySelectorAll('.thopt')].map(b=>b.querySelector('.thn').firstChild.textContent+'='+b.dataset.th+':'+b.getAttribute('aria-checked')),h:Math.min(...[...P.querySelectorAll('.thopt')].map(b=>b.getBoundingClientRect().height))};});
check('sélecteur : 5 pastilles + noms, « Actuel » coché, cibles ≥ 44 px',pk.open&&pk.opts.join('|')==='Actuel=:true|Clair minimal=clair:false|Vert terrain=terrain:false|Verre=verre:false|Néon sport=neon:false'&&pk.h>=44,JSON.stringify(pk));
await p.keyboard.press('Escape');await sleep(150);check('Échap ferme le sélecteur',!(await p.evaluate(()=>document.getElementById('thPop').classList.contains('open'))));
const META={clair:'#F9F9FB',terrain:'#1C6B3A',verre:'#1E2A5E',neon:'#0A0A12'};const bad={};
for(const t of ['clair','terrain','verre','neon']){
  await go('home');await p.click('#themeBtn');await sleep(200);await p.click('#thPop [data-th="'+t+'"]');await sleep(250);
  let r=await p.evaluate(()=>({dt:document.documentElement.getAttribute('data-theme'),k:localStorage.getItem('cj.theme'),m:document.querySelector('meta[name="theme-color"]').content,open:document.getElementById('thPop').classList.contains('open')}));
  check('choix « '+t+' » : data-theme, clé cj.theme, couleur de barre d’état, sélecteur refermé',r.dt===t&&r.k===t&&r.m===META[t]&&!r.open,JSON.stringify(r));
  await open();r=await p.evaluate(()=>({dt:document.documentElement.getAttribute('data-theme'),c:{th:(document.querySelector('#themeSw [aria-checked="true"]')||{getAttribute:()=>null}).getAttribute('data-th')}}));
  check('« '+t+' » conservé après rechargement + coché dans Paramètres',r.dt===t&&r.c&&r.c.th===t,JSON.stringify(r));
  for(const s of ['home','students','attendance','proc','reports','settings']){await go(s);const f=await scan();if(f.length)bad[t+'/'+s]=f.slice(0,4);}
  await go('attendance');await p.evaluate(()=>{const c=document.querySelector('#gridWrap td.comp');c&&c.click();});await sleep(450);let f=await scan();if(f.length)bad[t+'/fiche']=f.slice(0,4);
  await p.evaluate(()=>{const m=document.querySelector('.modal.open [data-close]');m&&m.click();});await sleep(150);
  await go('home');await p.click('#themeBtn');await sleep(200);f=await scan();if(f.length)bad[t+'/sélecteur']=f.slice(0,4);await p.keyboard.press('Escape');
  await go('settings');await p.evaluate(()=>{const b=document.getElementById('secOn');b&&b.click();});await sleep(600);
  f=await p.evaluate(()=>!!document.getElementById('cjLock'));if(f){const g=await scan();const L=g.filter(x=>true);if(L.length)bad[t+'/code']=L.slice(0,4);await p.evaluate(()=>{const c=[...document.querySelectorAll('#cjLock button')].find(b=>/Annuler/.test(b.textContent));c&&c.click();});await sleep(300);}
  check('« '+t+' » : écran du code (verrouillage) affiché et lisible',f&&!bad[t+'/code'],JSON.stringify(bad[t+'/code']||''));}
check('contraste WCAG AA (≥ 4,5 ; ≥ 3 grands textes) : tous les textes visibles de Accueil, Élèves, Absences, Note procéd., Rapports, Paramètres, fiche élève, sélecteur et écran du code, dans les 4 thèmes',!Object.keys(bad).length,JSON.stringify(bad).slice(0,900));
/* PDF : même rendu quel que soit le thème */
const make=async(kind,o)=>p.evaluate(async(kind,o)=>{const L=['vendor/jspdf.umd.min.js','vendor/jspdf.plugin.autotable.min.js','vendor/bidi-js.min.js','cj-pdf.js'];
  if(!window.CJPDF)for(const s of L)await new Promise((res,rej)=>{const e=document.createElement('script');e.src=s;e.onload=res;e.onerror=rej;document.head.appendChild(e);});
  const r=await window.CJPDF.make(kind,o);const a=new Uint8Array(await r.blob.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s);},kind,o);
const pdfs={};for(const t of ['neon','']){await p.evaluate(t=>t?localStorage.setItem('cj.theme',t):localStorage.removeItem('cj.theme'),t);await open();
  for(const [k,o] of [['grades',{cid:'k2',p:0}],['cycle',{cid:'k0',p:0}]]){const f='/tmp/th_'+(t||'actuel')+'_'+k+'.pdf';fs.writeFileSync(f,Buffer.from(await make(k,o),'base64'));
    pdfs[(t||'actuel')+k]={txt:cp.execSync('pdftotext -layout "'+f+'" -').toString().replace(/\d\dh\d\d|\d{2}\/\d{2}\/\d{4} à \d\dh\d\d/g,''),img:(cp.execSync('pdftoppm -r 40 -png -f 1 -l 1 -singlefile "'+f+'" '+f+'_p'),fs.statSync(f+'_p.png').size),pg:cp.execSync('pdfinfo "'+f+'"').toString().match(/Pages:\s+(\d+)/)[1]};}}
check('PDF (relevé, bilan de cycle) identiques en thème Néon et en thème actuel (texte, pages, rendu)',['grades','cycle'].every(k=>pdfs['neon'+k].txt===pdfs['actuel'+k].txt&&pdfs['neon'+k].pg===pdfs['actuel'+k].pg&&Math.abs(pdfs['neon'+k].img-pdfs['actuel'+k].img)<200),JSON.stringify(Object.fromEntries(Object.entries(pdfs).map(([k,v])=>[k,[v.pg,v.img,v.txt.length]]))));
/* « Actuel » : retour au thème par défaut, clé supprimée */
await p.evaluate(()=>localStorage.setItem('cj.theme','neon'));await open();await go('settings');await p.click('#themeSw [data-th=""]');await sleep(200);
st=await p.evaluate(()=>({dt:document.documentElement.getAttribute('data-theme'),k:localStorage.getItem('cj.theme'),m:document.querySelector('meta[name="theme-color"]').content}));
check('Paramètres › « Actuel » : retour au thème par défaut, clé cj.theme supprimée',st.dt===null&&st.k===null&&st.m==='#0B3A6E',JSON.stringify(st));
await p.evaluate(()=>localStorage.setItem('cj.theme','<img src=x onerror=alert(1)>'));await open();st=await p.evaluate(()=>document.documentElement.getAttribute('data-theme'));
check('valeur inconnue dans cj.theme ignorée (thème actuel)',st===null,String(st));
const S1=await snap();const own=k=>/^cahier\.snapDay$|\.snapm?\.\d+$/.test(k);   /* instantanés quotidiens créés par l’application elle-même à l’ouverture */
const keys0=Object.keys(S0).filter(k=>!own(k)).sort().join(','),keys1=Object.keys(S1).filter(k=>!own(k)).sort().join(',');
check('classRegister.v2 strictement identique après tous les changements de thème et rechargements',S1[KEY]===RAW0,(S1[KEY]||'').length+' / '+RAW0.length);
check('aucune autre clé de stockage créée ou modifiée (seule « cj.theme » est utilisée)',keys0===keys1&&Object.keys(S0).filter(k=>!own(k)).every(k=>k==='cahier.cryptoLater'||S0[k]===S1[k]),keys0+' → '+keys1);
check('aucune erreur de page',!errs.length,errs.slice(0,3).join(' | '));
console.log(results.filter(Boolean).length+'/'+results.length+' passed');await b.close();srv.close();process.exit(results.every(Boolean)?0:1);})();
