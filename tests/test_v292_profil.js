/* 1.29.2 (n) : profil C, Mon service, Thème et police, champs retirés, seuil par cycle dans Classes. Port 8054, profil jetable, réseau externe coupé. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8054,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
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
const setV=(p,sel,v)=>p.evaluate((s,v)=>{const el=document.querySelector(s);el.value=v;el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));},sel,v);
const KEYS=d=>({teacher:d.settings.teacher,spp:d.spp,arFont:d.settings.arFont,school:d.settings.school,autoDate:d.settings.autoDate,threshold:d.settings.threshold});
const vis=(p,s)=>p.evaluate(s=>{const x=document.querySelector(s);return !!x&&x.getClientRects().length>0&&getComputedStyle(x).display!=='none';},s);
async function openP(p,k){await p.evaluate(k=>{document.querySelector('#tabs button[data-tab="settings"]').click();CJPS.open(k);},k);await settle(p);}
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const L=JSON.parse(LYC),K0=KEYS(L);
 const p=await page(LYC,false);const j0=await J(p);
 /* 1. valeurs inchangées après chargement + enregistrement (+ rechargement) */
 const k1=await p.evaluate(()=>{const d=CJR.db();return {teacher:d.settings.teacher,spp:d.spp,arFont:d.settings.arFont,school:d.settings.school,autoDate:d.settings.autoDate,threshold:d.settings.threshold,prof:'profile' in d.settings};});
 await p.evaluate(()=>CJR.cx.persist());await settle(p);
 const k2=await p.evaluate(()=>{const d=JSON.parse(localStorage.getItem('classRegister.v2')||'null');return d&&d.settings?{teacher:d.settings.teacher,spp:d.spp,arFont:d.settings.arFont,school:d.settings.school,autoDate:d.settings.autoDate,threshold:d.settings.threshold,prof:'profile' in d.settings}:null;});
 await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';});await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});await sleep(900);
 const k3=await p.evaluate(()=>{const d=CJR.db();return {teacher:d.settings.teacher,spp:d.spp,arFont:d.settings.arFont,school:d.settings.school,autoDate:d.settings.autoDate,threshold:d.settings.threshold,prof:'profile' in d.settings};});
 const exp=Object.assign({},K0,{prof:false});
 check('teacher, spp, arFont, school, autoDate, threshold inchangés après chargement + enregistrement + rechargement (et aucun profil écrit)',[k1,k2||{},k3].every(k=>JSON.stringify(k)===JSON.stringify(exp)),{exp,k1,k2,k3});
 /* 2. Paramètres : plus de panneau Établissement ; champs retirés ; police dans Thème ; seuil dans Classes */
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="settings"]').click());await settle(p);
 const ui=await p.evaluate(()=>({ets:!!document.querySelector('[data-ps-open="ets"]'),list:[...document.querySelectorAll('[data-ps-open]')].map(x=>x.getAttribute('data-ps-open')),spp:document.getElementById('setSpp').type,te:document.getElementById('setTeacher').type,ad:document.getElementById('setAutoDate').hidden,adLbl:[...document.querySelectorAll('label')].some(l=>/Inscrire la date du jour/.test(l.textContent)),
   ar:(document.getElementById('setArFont').closest('.card')||{}).id,arT:(document.querySelector('#themeCard h2')||{}).textContent,th:(document.getElementById('setThreshold').closest('.card')||{}).id,thL:document.querySelector('label[for="setThreshold"]').textContent,
   seances:[...document.querySelectorAll('label')].some(l=>/Séances par cycle|Enseignant \/ établissement/.test(l.textContent))}));
 check('panneau Établissement retiré, « Séances par cycle », « Enseignant / établissement » et la case date du jour retirés de l’écran',!ui.ets&&!ui.list.includes('ets')&&ui.spp==='hidden'&&ui.te==='hidden'&&ui.ad&&!ui.adLbl&&!ui.seances,ui);
 check('Police arabe dans « 🎨 Thème et police »',ui.ar==='themeCard'&&/Thème et police/.test(ui.arT),ui);
 check('Seuil dans la carte Classes, libellé « par cycle »',ui.th==='clsCard'||(await p.evaluate(()=>!!document.getElementById('setThreshold').closest('[data-ps]')&&document.getElementById('setThreshold').closest('[data-ps]').getAttribute('data-ps')==='cls')),ui);
 check('libellé « Seuil d’alerte par cycle (absences non justifiées) »',ui.thL.trim()==='Seuil d’alerte par cycle (absences non justifiées)',ui.thL);
 await openP(p,'cls');check('seuil visible dans le panneau Classes',await vis(p,'#setThreshold'));
 await setV(p,'#setThreshold','6');check('seuil modifiable (6)',await p.evaluate(()=>CJR.db().settings.threshold)===6);await setV(p,'#setThreshold','5');check('seuil remis à 5',await p.evaluate(()=>CJR.db().settings.threshold)===5);
 /* 3. Compte et synchronisation : carte professionnelle pré-remplie, Mon service */
 const j1=await J(p);await openP(p,'sync');
 const c=await p.evaluate(()=>{const k=document.querySelector('#pfCard .pfC');return k&&{name:k.querySelector('.n b').textContent,ty:k.querySelector('.ty').textContent,cv:(k.querySelector('.ty.cv')||{}).textContent,dd:[...k.querySelectorAll('dd')].map(x=>x.textContent),hint:!!k.querySelector('.pf-hint'),svg:!!k.querySelector('.pf-av svg'),
   svc:!!document.querySelector('#pfWrap #cxCard [data-cxm="college"]'),svcH:(document.querySelector('#cxCard h2')||{}).textContent,order:document.getElementById('pfWrap').nextElementSibling.id};});
 check('carte professionnelle pré-remplie (E. Tammar Mohamed, LYCÉE, civilité M., Lycée qualifiant Baja), illustration, « Mon service » dessous, avant Synchronisation',c&&c.name==='E. Tammar Mohamed'&&c.ty==='LYCÉE'&&c.cv==='M.'&&c.dd[0]==='Lycée qualifiant Baja'&&c.hint&&c.svg&&c.svc&&c.svcH==='Mon service'&&c.order==='syncCard',c);
 check('carte et Mon service visibles seulement dans ce panneau',await vis(p,'#pfCard .pfC')&&await vis(p,'#cxCard'));
 {const a=JSON.parse(await J(p)),z=JSON.parse(j1);check('affichage du profil : aucune donnée écrite',JSON.stringify(a)===JSON.stringify(z),Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(z[k])).map(k=>[k,JSON.stringify(a[k]).slice(0,300),JSON.stringify(z[k]).slice(0,300)]));}
 /* Lycée | Collège depuis Mon service : même clé settings.school */
 await tap(p,'#cxCard [data-cxm="college"]');await settle(p);
 const s1=await p.evaluate(()=>({s:CJR.db().settings.school,ty:document.querySelector('#pfCard .ty').textContent}));
 await tap(p,'#cxCard [data-cxm="lycee"]');await settle(p);
 const s2=await p.evaluate(()=>({s:CJR.db().settings.school,ty:document.querySelector('#pfCard .ty').textContent,ls:localStorage.getItem('cahier.school')}));
 check('Lycée | Collège dans Mon service : settings.school / cahier.school, pastille du badge suit',s1.s==='college'&&s1.ty==='COLLÈGE'&&s2.s==='lycee'&&s2.ty==='LYCÉE'&&s2.ls==='lycee',[s1,s2]);
 /* 4. édition */
 await tap(p,'#pfCard [data-pf="edit"]');await settle(p);
 check('feuille d’édition : champs pré-remplis',await p.evaluate(()=>document.getElementById('pfNom').value==='Tammar'&&document.getElementById('pfPre').value==='Mohamed'&&document.getElementById('pfEtab').value==='Lycée qualifiant Baja'&&document.querySelectorAll('#pfAref option').length===13));
 {const j1x=await p.evaluate(()=>{const d=JSON.parse(CJApp.getJSON());delete d.ui;return JSON.stringify(d);});const t0=await p.evaluate(()=>CJR.db().settings.teacher);await tap(p,'#pfS [data-pf="save"]');await settle(p);
  const z=await p.evaluate(()=>{const d=JSON.parse(CJApp.getJSON());const pr=d.settings.profile;delete d.settings.profile;delete d.ui;return {te:d.settings.teacher,pr,j:JSON.stringify(d),hdr:document.getElementById('hdrSub').textContent};});
  const ref=JSON.parse(j1x);
  check('enregistrer sans rien changer : settings.teacher = « E. Tammar Mohamed - Lycée qualifiant Baja », identique octet pour octet ; seul settings.profile ajouté',t0===L.settings.teacher&&z.te==='E. Tammar Mohamed - Lycée qualifiant Baja'&&z.te===L.settings.teacher&&z.j===j1x&&z.pr&&z.pr.civ==='M.'&&z.hdr.startsWith('E. Tammar Mohamed - Lycée qualifiant Baja'),{te:z.te,pr:z.pr,same:z.j===j1x});
  await tap(p,'#pfCard [data-pf="edit"]');await settle(p);}
 await tap(p,'#pfS [data-pfc="Mme"]');await setV(p,'#pfAref','Rabat-Salé-Kénitra');await setV(p,'#pfProv','Kénitra');await setV(p,'#pfVille','Kénitra');await setV(p,'#pfDob','1985-04-12');await tap(p,'#pfS [data-pf="save"]');await settle(p);
 const e1=await p.evaluate(()=>{const d=JSON.parse(CJApp.getJSON());return {pr:d.settings.profile,te:d.settings.teacher,dobIn:JSON.stringify(d).includes('1985-04-12'),ls:JSON.parse(localStorage.getItem('cahier.profile')),hdr:document.getElementById('hdrSub').textContent,svg:document.querySelector('#pfCard .pf-av svg').innerHTML.includes('#FBE3EC'),
   raw:(localStorage.getItem('classRegister.v2')||'').includes('1985-04-12')};});
 check('Mme : settings.teacher garde « E. » (Enseignant/Enseignante) ; settings.profile (liste blanche), en-tête suit, illustration Mme',e1.pr&&e1.pr.civ==='Mme'&&e1.pr.nom==='Tammar'&&e1.pr.aref==='Rabat-Salé-Kénitra'&&e1.pr.t>0&&!('dob' in e1.pr)&&Object.keys(e1.pr).every(k=>['civ','nom','pre','aref','prov','ville','etab','t'].includes(k))&&e1.te==='E. Tammar Mohamed - Lycée qualifiant Baja'&&e1.hdr.startsWith(e1.te)&&e1.svg,e1);
 check('date de naissance : seulement dans cahier.profile sur l’appareil (pas dans les données / export)',!e1.dobIn&&!e1.raw&&e1.ls.dob==='1985-04-12'&&e1.ls.teacher===e1.te,e1);
 /* 5. synchro avec un appareil 1.29.1 : settings.profile retiré → remis d’après la copie de l’appareil */
 const re=await p.evaluate(async()=>{const d=CJR.db();delete d.settings.profile;CJR.cx.render();await new Promise(r=>setTimeout(r,300));return {pr:CJR.db().settings.profile,te:CJR.db().settings.teacher};});
 check('profil retiré par une version 1.29.1 : remis automatiquement',re.pr&&re.pr.civ==='Mme'&&re.pr.ville==='Kénitra'&&re.te==='E. Tammar Mohamed - Lycée qualifiant Baja',re);
 const ot=await p.evaluate(async()=>{const d=CJR.db();delete d.settings.profile;d.settings.teacher='M. Autre Compte';CJR.cx.render();await new Promise(r=>setTimeout(r,300));const r={pr:CJR.db().settings.profile||null,name:document.querySelector('#pfCard .n b').textContent,dob:document.querySelector('#pfCard dd:last-of-type').textContent};return r;});
 check('autre compte sur le même appareil (settings.teacher différent) : la copie n’est pas appliquée',ot.pr===null&&ot.name==='E. Autre Compte'&&!/1985|12\/04/.test(ot.dob),ot);
 const pa=await p.evaluate(async()=>{const o={};for(const t of ['E. Ouali Hind - Lycée qualifiant Baja','M. Alami Karim - Collège Ibn Sina','Mme Bennani Salma Nour - Lycée X','Mme. Idrissi Aya']){const d=CJR.db(),k=d.settings.teacher,pr=d.settings.profile;d.settings.teacher=t;delete d.settings.profile;localStorage.removeItem('cahier.profile');CJR.cx.render();await new Promise(r=>setTimeout(r,150));o[t]=[document.querySelector('#pfCard .n b').textContent,document.querySelector('#pfCard .ty.cv').textContent,document.querySelector('#pfCard dd').textContent];d.settings.teacher=k;d.settings.profile=pr;}CJR.cx.render();return o;});
 check('pré-remplissage : préfixes « E. », « M. », « Mme » reconnus (nom, civilité, établissement)',JSON.stringify(Object.values(pa))===JSON.stringify([['E. Ouali Hind','M.','Lycée qualifiant Baja'],['E. Alami Karim','M.','Collège Ibn Sina'],['E. Bennani Salma Nour','Mme','Lycée X'],['E. Idrissi Aya','Mme','à compléter']]),pa);
 /* 6. photo */
 await p.evaluate(()=>{const d=CJR.db();d.settings.teacher='E. Tammar Mohamed - Lycée qualifiant Baja';CJR.cx.render();});await settle(p);await sleep(300);
 await tap(p,'#pfCard [data-pf="photo"]');await settle(p);
 const ph0=await p.evaluate(()=>({opts:[...document.querySelectorAll('#pfS .opt')].map(x=>x.textContent.trim()),ill:document.querySelector('#pfS [data-pf="ill"]').disabled,cap:document.getElementById('pfCam').getAttribute('capture')}));
 check('choix de photo : prendre / galerie / revenir à l’illustration (inactif sans photo)',ph0.opts.length===3&&/Prendre une photo/.test(ph0.opts[0])&&/galerie/.test(ph0.opts[1])&&/Revenir à l’illustration/.test(ph0.opts[2])&&ph0.ill&&ph0.cap==='user',ph0);
 const img='/tmp/pf_test.png';if(!fs.existsSync(img)){const c=await p.evaluate(()=>{const c=document.createElement('canvas');c.width=1200;c.height=900;const x=c.getContext('2d');for(let i=0;i<4000;i++){x.fillStyle='hsl('+(i*37%360)+',70%,'+(30+i%50)+'%)';x.fillRect(Math.random()*1200,Math.random()*900,30,30);}return c.toDataURL('image/png');});fs.writeFileSync(img,Buffer.from(c.split(',')[1],'base64'));}
 const fi=await p.$('#pfGal');await fi.uploadFile(img);await p.evaluate(()=>document.getElementById('pfGal').dispatchEvent(new Event('change',{bubbles:true})));await sleep(1500);
 const ph1=await p.evaluate(async()=>{const r=await CJR.photo.get('_prof');const d=r&&r.d;let w=0,h=0;if(d){const im=new Image();im.src=d;await im.decode();w=im.naturalWidth;h=im.naturalHeight;}return {ok:!!d,jpg:d&&d.startsWith('data:image/jpeg'),kb:d?Math.ceil((d.length-d.indexOf(',')-1)*3/4):0,w,h,img:!!document.querySelector('#pfCard .pf-av img'),inDb:CJApp.getJSON().includes('_prof')};});
 check('photo : 256×256 JPEG ≤ 25 Ko, stockage photo « _prof », affichée sur la carte, hors des données',ph1.ok&&ph1.jpg&&ph1.kb<=25600&&ph1.w===256&&ph1.h===256&&ph1.img&&!ph1.inDb,ph1);
 await tap(p,'#pfCard [data-pf="photo"]');await settle(p);await tap(p,'#pfS [data-pf="ill"]');await sleep(600);
 const ph2=await p.evaluate(async()=>({r:await CJR.photo.get('_prof'),svg:!!document.querySelector('#pfCard .pf-av svg')}));
 check('« Revenir à l’illustration » : photo supprimée, illustration Mme',!(ph2.r&&ph2.r.d)&&ph2.svg,ph2);
 /* 7. seuil par cycle */
 const al=await p.evaluate(()=>{const d=CJR.db(),th=d.settings.threshold,cn=CJR.cyNow(),A=CJApp;let yr=0,cy=0;
   return {cn,th};});
 check('cycle en cours calculé',typeof al.cn==='number'&&al.cn>=0,al);
 /* 8. code d’accès activé : la copie de l’appareil (cahier.profile, avec la date de naissance) est chiffrée, jamais en clair */
 await p.evaluate(()=>{const d=CJR.db();d.settings.teacher='E. Tammar Mohamed - Lycée qualifiant Baja';CJR.cx.render();});await sleep(300);
 await tap(p,'#pfCard [data-pf="edit"]');await settle(p);await setV(p,'#pfDob','1985-04-12');await tap(p,'#pfS [data-pf="save"]');await settle(p);
 const pl=await p.evaluate(()=>localStorage.getItem('cahier.profile'));
 await p.evaluate(()=>CJCrypto.enable('135792'));await p.waitForFunction(()=>CJCrypto.mode()==='open',{timeout:60000});await sleep(3800);
 const raw=async()=>p.evaluate(()=>{const o={};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);o[k]=localStorage[k];}return o;});
 const r1=await raw(),pc=r1['cahier.profile']||'';
 check('code activé : cahier.profile rechiffré (enveloppe e), plus de nom / établissement / date en clair',/^\{"e":"/.test(pc)&&!/Tammar|Baja|1985/.test(pc)&&/1985/.test(pl),pc.slice(0,80));
 await tap(p,'#pfCard [data-pf="edit"]');await settle(p);await setV(p,'#pfVille','Kenitra-2');await tap(p,'#pfS [data-pf="save"]');await sleep(1200);
 const r2=await raw();check('code activé : enregistrement du profil → copie écrite chiffrée',/^\{"e":"/.test(r2['cahier.profile'])&&!/Tammar|Baja|1985|Kenitra/.test(r2['cahier.profile']),String(r2['cahier.profile']).slice(0,80));
 const leakK=Object.keys(r2).filter(k=>/Tammar|1985-04-12/.test(r2[k]));
 check('code activé : aucune clé localStorage avec le nom ou la date de naissance en clair',leakK.length===0,leakK);
 await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>CJCrypto.unlock('135792'));await p.waitForFunction(()=>window.CJR&&CJR.cxMode&&document.querySelector('#pfCard'),{timeout:20000}).catch(()=>{});await sleep(1500);
 await openP(p,'sync');await sleep(800);
 const dd=await p.evaluate(()=>[...document.querySelectorAll('#pfCard dd')].map(x=>x.textContent));
 check('après déverrouillage : copie déchiffrée (date de naissance affichée)',dd.some(x=>x.startsWith('12/04/1985')),dd);
 await p.evaluate(()=>CJCrypto.disable());await sleep(3800);
 const r3=await raw();check('code désactivé : la copie repasse en clair comme le cahier (date gardée)',/1985-04-12/.test(r3['cahier.profile']||''),String(r3['cahier.profile']).slice(0,80));
 check('aucune erreur JS',p.errs.length===0,p.errs);
 await p.ctx.close();
 /* 8. lecture seule (modérateur) : pas d’édition */
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})().catch(e=>{console.error(e);process.exit(1);});
