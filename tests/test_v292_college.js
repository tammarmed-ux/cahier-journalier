/* 1.29.2 (j) : mode Collège — lycée strictement inchangé, choix à la première ouverture, Paramètres › Établissement (ASS), barèmes OP 2009, niveaux 1AC/2AC/3AC.
   Sert /workspace/cj-deploy tel quel (port 8046), profil jetable, réseau externe coupé. Lancer depuis cj-emu (node_modules). */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8046,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,600):''));}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const LYC=fs.readFileSync('/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
const REN={'1BACSH1':'1AC1','1BACLSH2':'1AC2','1BACLSH4':'2AC1','2BACSP4':'2AC2','2BACSP5':'2AC3','2BACSP6':'3AC1','2BACSVT2':'3AC2','2BACSVT1':'3AC3','1BACSH3':'1AC3'};
const COL=(()=>{const d=JSON.parse(LYC);d.classes.forEach(c=>c.name=REN[c.name]||c.name);d.settings.teacher='Collège test';return JSON.stringify(d);})();
let b;
async function page(data,{block=false,gate=false}={}){const tmp=fs.mkdtempSync('/tmp/cx-');const ctx=await b.createBrowserContext();const p=await ctx.newPage();
  await p.setViewport({width:390,height:844,deviceScaleFactor:1,isMobile:true,hasTouch:true});p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));p.on('dialog',d=>d.dismiss());
  /* 1.29.2 (l) : sans contourner le service worker, college.js pouvait être servi par lui malgré le blocage */if(block)await p.setBypassServiceWorker(true);
  await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();if(block&&/college\.js/.test(u))return q.abort();(u.startsWith('http://localhost:'+PORT)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.evaluateOnNewDocument((o)=>{if(!sessionStorage.getItem('seeded')){localStorage.clear();if(o)localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('seeded','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},data);
  await p.goto('http://localhost:'+PORT+'/?emu=1',{waitUntil:'networkidle2'});
  await p.evaluate(g=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';if(g)window.CJGateOpen=true;},gate);
  if(!block)await p.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});else await sleep(1200);
  p.ctx=ctx;return p;}
/* empreinte du calcul des notes : niveaux, maxima, note comportementale, barèmes, textes */
const PRINT=()=>{const R=CJR,d=R.db(),o={};d.classes.forEach(c=>{o[c.name]={lv:R.levelOf(c.name),cap:R.capOf(c.id),info:R.capInfo(c.id),sp:d.periods.map((x,p)=>{const s=R.gradeSpec(c.id,p);return [s.aps,s.lv,s.lvKnown,s.procMax,s.comp,s.total,s.cols.map(k=>k.max).join('/')];})};});
  o.ath=['TC','1BAC','2BAC'].map(l=>['G','F'].map(s=>[['vitesse','12'],['endurance','4.35'],['poids','845'],['longueur','4,2'],['hauteur','130'],['triple','900']].map(([e,v])=>JSON.stringify(R.athMark(l,s,e,v)))));
  o.tx=R.TX.clsCapAuto(4);o.ph=R.TX.clsNamePh;o.sheet=document.querySelector('#clsSheet .pq-hd+p.small').textContent;
  o.ttLeg=(document.querySelector('#ttCard .tw-legend')||{}).outerHTML||'';
  return JSON.stringify(o);};
(async()=>{
 b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 /* 1. lycée : identique avec et sans college.js */
 const p0=await page(LYC,{block:true});check('référence sans college.js : college.js réellement bloqué (service worker contourné)',await p0.evaluate(()=>!(CJR.cx&&CJR.cx.CX.ready)));const f0=await p0.evaluate(PRINT),j0=await p0.evaluate(()=>CJApp.getJSON());
 const v0=await p0.evaluate(()=>{document.querySelector('#tabs button[data-tab="attendance"]').click();return document.getElementById('view-attendance').innerHTML.replace(/ · (TC|1BAC|2BAC|1AC|2AC|3AC|Niveau \?)<\/option>/g,'</option>');});await p0.ctx.close();
 const p1=await page(LYC,{gate:true});await sleep(2500);const f1=await p1.evaluate(PRINT),j1=await p1.evaluate(()=>CJApp.getJSON());
 const v1=await p1.evaluate(()=>{document.querySelector('#tabs button[data-tab="attendance"]').click();return document.getElementById('view-attendance').innerHTML.replace(/ · (TC|1BAC|2BAC|1AC|2AC|3AC|Niveau \?)<\/option>/g,'</option>');});
 check('lycée : niveaux, maxima, notes comportementales, barèmes OP 2007, textes et légende identiques avec college.js',f0===f1,[f0.length,f1.length]);
 check('lycée : écran Absences / Notes /20 identique (HTML, hors libellé de niveau des options de classe)',v0===v1);
 check('lycée : données enregistrées identiques (aucune écriture, pas de réglage school ajouté)',j0===j1&&!/"school"/.test(j1));
 check('lycée déduit des noms de classes : pas d’écran de choix',await p1.evaluate(()=>CJR.cxMode()==='lycee'&&!document.getElementById('cxChoice')&&!document.getElementById('cxGate')));
 const ps=await p1.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();const r=document.querySelector('#psList [data-ps-open="ets"]');return {row:!!r,sum:r&&r.textContent,grp:r&&r.parentNode.firstChild===r};});
 check('Paramètres : ligne « Établissement » en tête de Classes & année scolaire (Lycée · service 21 h)',ps.row&&ps.grp&&/Lycée · service 21 h/.test(ps.sum),ps);
 const pn=await p1.evaluate(async()=>{CJPS.open('ets');await new Promise(r=>setTimeout(r,100));const c=document.getElementById('cxCard');return {vis:c.offsetHeight>0,seg:[...c.querySelectorAll('[data-cxm]')].map(x=>x.getAttribute('aria-checked')).join(),ass:c.querySelector('#cxAss').hidden,ob:c.querySelector('#cxOb').textContent,title:document.getElementById('psTitle').textContent};});
 check('Établissement (lycée) : sous-page visible, Lycée coché, section ASS masquée, service 21 h',pn.vis&&pn.seg==='true,false'&&pn.ass&&pn.ob==='21 h'&&pn.title==='Établissement',pn);
 const lt=await p1.evaluate(async()=>{const d=CJR.db(),o=[];document.querySelector('#tabs button[data-tab="proc"]').click();for(let p=0;p<d.periods.length;p++){d.ui.per=p;for(const c of d.classes){d.ui.cls=c.id;CJR.cx.render();o.push((document.querySelector('.view.active')||document.body).innerHTML);}}return o.join(' ');});
 check('lycée : Note procédurale de toutes les classes et cycles : « OP 2007 », jamais « OP 2009 » (2BAC finit par « AC »)',/OP 2007/.test(lt)&&!/OP 2009/.test(lt));
 check('lycée : aucune erreur JS',!p1.errs.length,p1.errs);await p1.ctx.close();
 /* 2. première ouverture (aucune donnée) */
 const p2=await page(null,{gate:true});await p2.evaluate(()=>{window.__gb0=document.getElementById('gBody').innerHTML;});await p2.waitForSelector('#cxChoice',{timeout:8000}).catch(()=>{});
 const ch=await p2.evaluate(()=>{const c=document.getElementById('cxChoice'),g=document.getElementById('gate');return c&&{h:c.querySelector('h2').textContent,tiles:[...c.querySelectorAll('.cx-tile b')].map(x=>x.textContent),btn:document.getElementById('cxGo').textContent,dis:document.getElementById('cxGo').disabled,txt:c.textContent,gate:getComputedStyle(document.getElementById('cxGate')).display,login:getComputedStyle(g).display,gb:document.getElementById('gBody').innerHTML===window.__gb0,ps:c.querySelectorAll('p').length};});
 check('choix : titre « Vous êtes un enseignant de : », 2 tuiles, bouton Continuer (désactivé avant le choix)',ch&&ch.h==='Vous êtes un enseignant de\u00a0:'&&ch.tiles.join()==='Lycée,Collège'&&ch.btn==='Continuer'&&ch.dis&&ch.gate==='block'&&ch.login==='none'&&ch.gb,ch);
 check('choix : phrase « Choisi une seule fois… » absente',ch&&!/choisi|une seule fois|modifiable/i.test(ch.txt)&&ch.ps===0,ch&&ch.txt);
 await p2.click('[data-cxp="college"]');const bt=await p2.evaluate(()=>[document.getElementById('cxGo').textContent,document.getElementById('cxGo').disabled]);
 check('choix : Collège coché → « Continuer avec Collège »',bt[0]==='Continuer avec Collège'&&!bt[1],bt);
 await p2.click('#cxGo');await sleep(600);
 const af=await p2.evaluate(()=>{const d=JSON.parse(CJApp.getJSON());return {school:d.settings.school,ls:localStorage.getItem('cahier.school'),ob:d.cal.oblig,as:d.cal.tt.filter(t=>t.type==='as').map(t=>t.day+' '+t.start+'-'+t.end).sort(),gate:!document.getElementById('cxGate'),mode:CJR.cxMode(),ncls:d.classes.length,gb:document.getElementById('gBody').textContent.slice(0,40)};});
 check('après Continuer : settings.school = college (enregistré), copie sur l’appareil, service 24 h, ASS mercredi + vendredi 15:00–17:00, écran fermé',af.school==='college'&&af.ls==='college'&&af.ob===24&&af.as.join()==='3 15:00-17:00,5 15:00-17:00'&&af.gate&&af.mode==='college',af);
 check('première ouverture → Collège : les 9 classes d’exemple vides de l’installation retirées',af.ncls===0,af.ncls);
 check('écran de connexion jamais modifié par le choix',!/enseignant de/.test(af.gb),af.gb);
 /* réglage relu après rechargement (normalize le garde) */
 await p2.reload({waitUntil:'networkidle2'});await p2.waitForFunction(()=>window.CJR&&CJR.cxMode,{timeout:8000});
 check('rechargement : réglage school conservé par la normalisation',await p2.evaluate(()=>CJR.db().settings.school==='college'&&CJR.cxMode()==='college'));
 check('choix : aucune erreur JS',!p2.errs.length,p2.errs);await p2.ctx.close();
 /* 3. collège : classes 1AC/2AC/3AC (mode déduit des noms, réglage absent) */
 const p3=await page(COL,{gate:true});await sleep(1500);
 const c3=await p3.evaluate(()=>{const R=CJR,d=R.db(),o={mode:R.cxMode(),choice:!!document.getElementById('cxChoice')};
   const ci=n=>d.classes.find(c=>c.name===n).id;o.lv=['1AC1','2AC1','3AC1'].map(n=>R.levelOf(n));o.cap=['1AC1','2AC1','3AC1'].map(n=>R.capOf(ci(n)));
   o.lvx=['1ère année collège','2ASC3','3APIC1','الأولى إعدادي','TC1','1BAC2'].map(R.levelOf);
   o.sp={};const P=d.periods.length;['1AC1','2AC1','3AC1'].forEach(n=>{for(let p=0;p<P;p++){const s=R.gradeSpec(ci(n),p);o.sp[n+'|'+s.aps]=[s.cols.map(k=>k.max).join('+'),s.comp,s.total,s.lv];}});
   o.m=[R.athMark('1AC','G','vitesse','10.6').v,R.athMark('1AC','G','vitesse','25').v,R.athMark('3AC','F','endurance','2.14').v,R.athMark('2AC','G','poids','871').v,R.athMark('2AC','F','hauteur','110').v,R.athMark('1AC','G','longueur','3,9').v,R.athMark('3AC','G','triple','972').v,R.athMark('1AC','F','vitesse','8.9').v];
   o.tx=R.TX.clsCapAuto(3);o.sheet=document.querySelector('#clsSheet .pq-hd+p.small').textContent;return o;});
 check('collège déduit des noms de classes, sans écran de choix',c3.mode==='college'&&!c3.choice,c3.mode);
 check('niveaux 1AC/2AC/3AC (y compris « 1ère année collège », 2ASC, 3APIC, arabe) ; noms lycée toujours reconnus (TC, 1BAC)',c3.lv.join()==='1AC,2AC,3AC'&&c3.lvx.join()==='1AC,2AC,3AC,1AC,TC,1BAC',c3.lvx);
 check('note comportementale 1AC 3 · 2AC 4 · 3AC 5',c3.cap.join()==='3,4,5',c3.cap);
 const exp={'1AC1|athle':['6+8+3',3,20,'1AC'],'2AC1|athle':['6+7+3',4,20,'2AC'],'3AC1|athle':['6+6+3',5,20,'3AC'],'1AC1|coll':['6+8+3',3,20,'1AC'],'2AC1|coll':['6+7+3',4,20,'2AC'],'3AC1|coll':['6+6+3',5,20,'3AC']};
 check('grilles /20 : athlétisme et sports collectifs 6+8/7/6 + conceptuel 3 + comportemental 3/4/5 = 20',Object.keys(exp).every(k=>JSON.stringify(c3.sp[k])===JSON.stringify(exp[k])),c3.sp);
 const gy=await p3.evaluate(()=>{const R=CJR,d=R.db();return ['1AC1','2AC1','3AC1'].map(n=>{const c=d.classes.find(x=>x.name===n);const s=R.APS?null:null;return R.capOf(c.id);});});
 const gm=await p3.evaluate(()=>{const X=CJR.cx;return ['1AC','2AC','3AC'].map(l=>X.APS.gym.max[l][0]+3+X.LEVEL_CAP[l]);});
 check('gymnastique 14/13/12 + 3 + 3/4/5 = 20',gm.join()==='20,20,20',gm);
 check('barèmes OP 2009 : meilleur palier 6, palier le plus faible 0,3 (1AC G 80 m 10,6 s → 6 ; 3AC F 600 m 2.14 → 6 ; 2AC G poids 871 → 6 ; 2AC F hauteur 110 → 6 ; 1AC G longueur 3,90 → 6 ; 3AC G triple 972 → 6 ; 1AC F 60 m 8,9 → 6)',c3.m[0]===6&&c3.m[2]===6&&c3.m[3]===6&&c3.m[4]===6&&c3.m[5]===6&&c3.m[6]===6&&c3.m[7]===6&&c3.m[1]<=0.3,c3.m);
 check('textes : note comportementale par défaut OP 2009 (1AC 3 · 2AC 4 · 3AC 5)',/OP 2009\) : 1AC 3 · 2AC 4 · 3AC 5/.test(c3.tx)&&/1AC 3 · 2AC 4 · 3AC 5/.test(c3.sheet)&&!/TC 5/.test(c3.sheet),[c3.tx,c3.sheet]);
 /* toutes les valeurs du JSON validé : chaque palier donne sa note */
 const J=JSON.parse(fs.readFileSync('/workspace/college-baremes/baremes_op2009_college_final.json','utf8'));const MAP={'1000m':'endurance','600m':'endurance','poids_4kg':'poids','poids_3kg':'poids','vitesse_80m':'vitesse','vitesse_60m':'vitesse','triple_saut':'triple','longueur':'longueur','hauteur':'hauteur'};
 const cases=[];['1AC','2AC','3AC'].forEach(l=>[['garcons','G'],['filles','F']].forEach(([sx,S])=>Object.entries(J[l][sx]).forEach(([k,e])=>e.rows.forEach(r=>cases.push([l,S,MAP[k],r.printed,r.note])))));
 const bad=await p3.evaluate(cs=>cs.filter(([l,s,e,v,n])=>{const m=CJR.athMark(l,s,e,v);return !(m&&Math.abs(m.v-n)<1e-9);}).slice(0,5),cases);
 check('barèmes OP 2009 : les '+cases.length+' valeurs du JSON validé donnent exactement leur note',cases.length===720&&!bad.length,bad);
 /* Note procédurale : athlétisme (OP 2009) et sport collectif (saisie libre) */
 const pr=await p3.evaluate(async()=>{const d=CJR.db(),R=CJR;const c=d.classes.find(x=>x.name==='1AC1');d.ui.cls=c.id;const pa=d.periods.findIndex((x,p)=>R.cycAps(p)==='athle'),pc=d.periods.findIndex((x,p)=>R.cycAps(p)==='coll');
   const out={};d.ui.per=pa;CJR.cx.render();document.querySelector('#tabs button[data-tab="proc"]')&&document.querySelector('#tabs button[data-tab="proc"]').click();await new Promise(r=>setTimeout(r,200));
   const v=document.querySelector('.view.active')||document.body;out.a=v.textContent.replace(/\s+/g,' ');
   d.ui.per=pc;CJR.cx.render();await new Promise(r=>setTimeout(r,200));out.c=(document.querySelector('.view.active')||document.body).textContent.replace(/\s+/g,' ');
   const b=document.querySelector('.view.active .scb');if(b){b.click();await new Promise(r=>setTimeout(r,200));out.pad=document.getElementById('scPad').classList.contains('hidden');out.sub=document.getElementById('scSub').textContent;out.free=!document.getElementById('scFreeW').classList.contains('hidden');}
   return out;});
 check('Note procédurale 1AC athlétisme : barème 1AC (OP 2009), jamais « OP 2007 »',/barème 1AC/.test(pr.a)&&/OP 2009/.test(pr.a)&&!/OP 2007/.test(pr.a),pr.a.slice(0,400));
 check('sport collectif 1AC : pavé N1…N4 affiché (barème 1AC), saisie libre toujours possible',pr.pad===false&&pr.free===true&&/barème 1AC/.test(pr.sub||''),pr);
 const bands=await p3.evaluate(()=>{const X=CJR.cx;return {ind:['1AC','2AC','3AC'].map(l=>X.SC_IND[l]),col:['1AC','2AC','3AC'].map(l=>X.SC_COL[l]),lyc:JSON.stringify([X.SC_IND.TC,X.SC_IND['1BAC'],X.SC_IND['2BAC'],X.SC_COL.TC,X.SC_COL['1BAC'],X.SC_COL['2BAC']])};});
 const B6=[[0,1],[1,2],[3,4],[5,6]];
 check('bandes collège : individuel /6 = bandes TC/1BAC pour 1AC, 2AC, 3AC',bands.ind.every(x=>JSON.stringify(x)===JSON.stringify(B6)),bands.ind);
 check('bandes collège : collectif 1AC 6 (TC × 1,5) · 2AC 5 (= 1BAC/2BAC) · 3AC 4 (= TC), demi-points, N4+ = maximum',JSON.stringify(bands.col)===JSON.stringify([[[0,1.5],[1.5,3],[3,4.5],[4.5,6]],[[0,1],[1,2],[2.5,3.5],[4,5]],[[0,1],[1,2],[2,3],[3,4]]])&&bands.col.flat(2).every(v=>v*2===Math.round(v*2)),bands.col);
 check('bandes lycée inchangées',bands.lyc===JSON.stringify([[[0,1],[1,2],[3,4],[5,6]],[[0,1],[1,2],[3,4],[5,6]],[[0,1.5],[1.5,3],[3,5],[5,7]],[[0,1],[1,2],[2,3],[3,4]],[[0,1],[1,2],[2.5,3.5],[4,5]],[[0,1],[1,2],[2.5,3.5],[4,5]]]),bands.lyc);
 /* pavé réel : maxima individuel 6, collectif N4+ + victoire = 8/7/6 */
 const pads=await p3.evaluate(async()=>{const d=CJR.db(),R=CJR,o={};const pc=d.periods.findIndex((x,p)=>R.cycAps(p)==='coll');
   for(const n of ['1AC1','2AC1','3AC1']){const c=d.classes.find(x=>x.name===n);d.ui.cls=c.id;d.ui.per=pc;CJR.cx.render();await new Promise(r=>setTimeout(r,150));
     const bs=[...document.querySelectorAll('.view.active .scb')];const g1=bs.find(b=>b.dataset.k==='g1'),g2=bs.find(b=>b.dataset.k==='g2');
     g1.click();await new Promise(r=>setTimeout(r,120));const v1=[...document.querySelectorAll('#scPad button[data-c]')].map(b=>b.dataset.c+'='+b.querySelector('b').textContent);document.querySelector('#scSheet [data-pq-close], #scSheet .pq-x')&&document.querySelector('#scSheet .pq-x').click();await new Promise(r=>setTimeout(r,120));
     g2.click();await new Promise(r=>setTimeout(r,120));const v2=[...document.querySelectorAll('#scPad button[data-c]')].map(b=>b.dataset.c+'='+b.querySelector('b').textContent);
     const b4=document.querySelector('#scPad button[data-c="N4+"]');b4.click();await new Promise(r=>setTimeout(r,150));const vb=document.querySelector('#scMatch button[data-m="V"]');let tot=null;if(vb){vb.click();await new Promise(r=>setTimeout(r,200));const s=d.students.find(x=>x.classId===c.id&&x.ev&&x.ev[c.id+'|'+pc]&&x.ev[c.id+'|'+pc].scm==='V');tot=s?s.ev[c.id+'|'+pc].g2:null;}
     document.querySelectorAll('.pq-sheet:not([hidden]) .pq-x').forEach(x=>x.click());await new Promise(r=>setTimeout(r,120));o[n]={v1,v2,tot};}return o;});
 check('pavé individuel : N4+ = 6 (1AC, 2AC, 3AC)',['1AC1','2AC1','3AC1'].every(n=>pads[n].v1.includes('N4+=6')&&pads[n].v1.includes('N1-=0')),pads);
 check('pavé collectif : N4+ = 6 / 5 / 4 puis + victoire 2 → 8 / 7 / 6',pads['1AC1'].v2.includes('N4+=6')&&pads['2AC1'].v2.includes('N4+=5')&&pads['3AC1'].v2.includes('N4+=4')&&pads['1AC1'].tot===8&&pads['2AC1'].tot===7&&pads['3AC1'].tot===6,pads);
 /* emploi du temps : légende 1AC/2AC/3AC */
 const tl=await p3.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();const l=document.querySelector('#ttCard .tw-legend');return l?[...l.children].map(x=>x.className+':'+x.textContent):[];});
 check('emploi du temps : pastilles de niveau 1AC / 2AC / 3AC et ASS',['lv-1AC:1AC','lv-2AC:2AC','lv-3AC:3AC'].every(x=>tl.includes(x))&&tl.some(x=>/ASS/.test(x)),tl);
 /* Paramètres › Établissement (collège) */
 await p3.evaluate(()=>{document.querySelector('#tabs button[data-tab="settings"]').click();});await sleep(200);
 const s0=await p3.evaluate(async()=>{const d=CJR.db();d.settings.school='college';CJPS.open('ets');await new Promise(r=>setTimeout(r,150));document.querySelector('[data-cxm="college"]').click();const c=document.getElementById('cxCard');
   return {ass:!c.querySelector('#cxAss').hidden,on:c.querySelector('#cxAsOn').checked,sl:[...c.querySelectorAll('[data-cxs]')].map(x=>x.checked),lab:[...c.querySelectorAll('.cx-row b')].map(x=>x.textContent),svc:c.querySelector('#cxSvc').textContent,txt:c.textContent};});
 check('Établissement (collège) : ASS visible, « Participer à l’ASS » + Mercredi / Vendredi 15:00–17:00, total « classes … + ASS … = … »',s0.ass&&s0.lab.includes('Participer à l’ASS')&&s0.lab.includes('Mercredi 15:00–17:00')&&s0.lab.includes('Vendredi 15:00–17:00')&&/^Service\u00a0: classes .+ \+ ASS .+ = /.test(s0.svc),s0);
 check('libellés : « ASS », jamais « AS » seul',!/\bAS\b/.test(s0.txt.replace(/ASS/g,'')),s0.txt);
 const ob0=await p3.evaluate(()=>CJR.db().cal.oblig);
 await p3.evaluate(()=>{document.querySelector('#cxAsOn').click();});await sleep(100);
 const s1=await p3.evaluate(()=>({as:CJR.db().cal.tt.filter(t=>t.type==='as').length,sl:[...document.querySelectorAll('#cxCard [data-cxs]')].map(x=>x.disabled)}));
 await p3.evaluate(()=>{document.querySelector('#cxAsOn').click();});await sleep(100);
 const s2=await p3.evaluate(()=>CJR.db().cal.tt.filter(t=>t.type==='as').map(t=>t.day+' '+t.start+'-'+t.end).sort());
 await p3.evaluate(()=>{document.querySelector('#cxCard [data-cxs="0"]').click();});await sleep(100);
 const s3=await p3.evaluate(()=>({as:CJR.db().cal.tt.filter(t=>t.type==='as').map(t=>t.day+' '+t.start+'-'+t.end),svc:document.getElementById('cxSvc').textContent,sv:CJR.cx.service().am}));
 check('ASS : désactiver retire tous les créneaux ASS (interrupteurs des créneaux grisés)',s1.as===0&&s1.sl.every(x=>x),s1);
 check('ASS : réactiver ajoute mercredi + vendredi 15:00–17:00',s2.join()==='3 15:00-17:00,5 15:00-17:00',s2);
 check('ASS : mercredi seul retiré → vendredi gardé, service ASS 2 h',s3.as.join()==='5 15:00-17:00'&&s3.sv===120&&/ASS 2 h/.test(s3.svc),s3);
 const sw=await p3.evaluate(async()=>{document.querySelector('[data-cxm="lycee"]').click();await new Promise(r=>setTimeout(r,100));const d=CJR.db();return {m:CJR.cxMode(),s:d.settings.school,ass:document.getElementById('cxAss').hidden,lv:CJR.levelOf('1AC1')};});
 check('retour au Lycée : mode lycée, ASS masquée, 1AC non reconnu',sw.m==='lycee'&&sw.s==='lycee'&&sw.ass&&sw.lv==='',sw);
 check('collège : aucune erreur JS',!p3.errs.length,p3.errs);await p3.ctx.close();
 /* 4. budget de démarrage : college.js hors préchargement, en LAZY_ASSETS */
 const sws=fs.readFileSync(D+'/sw.js','utf8');const A=sws.match(/const ASSETS = \[([\s\S]*?)\];/)[1],LZ=sws.match(/const LAZY_ASSETS = \[([\s\S]*?)\];/)[1];
 check('college.js : chargé après le démarrage (LAZY_ASSETS, pas dans ASSETS), no-cache',!/college/.test(A)&&/'\.\/college\.js'/.test(LZ)&&/"\/college\.js"/.test(fs.readFileSync(D+'/firebase.json','utf8')));
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
