/* 1.29.2 (l) : Paramètres › « Répartition cyclique » (proposition C) — affichage seulement.
   Chaque action (activité, type, dates, Rétablir, Recalculer, ⓘ) est faite une fois avec l’écran d’origine (college.js bloqué = 1.29.2 k)
   et une fois avec la ligne de temps (vrais clics) ; les données enregistrées doivent être identiques octet pour octet.
   Sert /workspace/cj-deploy (port 8053), profil jetable, réseau externe coupé (Firebase bloqué), export réel en local, jamais synchronisé. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const D='/workspace/cj-deploy',PORT=8053,sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
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
const setV=(p,sel,v)=>p.evaluate((s,v)=>{const el=document.querySelector(s);el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));},sel,v);
/* même suite d’actions : OLD = écran d’origine, NEW = ligne de temps */
const ACTS=[
 ['activité du cycle 3 renommée',async(p,nw)=>{if(nw){await tap(p,'#rcSec .rc-it[data-rc="2"] .rc-ed');}else await p.evaluate(()=>document.querySelector('#periodNames [data-cyb="2"] [data-cybed]').click());await settle(p);
   await setV(p,'#periodNames [data-cyb="2"] input[data-pi]','Handball');await settle(p);if(nw)await tap(p,'#periodNames>.cyb.ed .rc-ok');else await p.evaluate(()=>document.querySelector('#periodNames [data-cyb="2"] [data-cybed]').click());await settle(p);}],
 ['type du cycle 1 choisi (Sport collectif) puis repassé en Athlétisme',async(p,nw)=>{if(nw)await tap(p,'#rcSec .rc-it[data-rc="0"] .rc-ty');else await p.evaluate(()=>document.querySelector('#periodNames [data-cyb="0"] [data-cybed]').click());await settle(p);
   const c=async k=>{if(nw)await tap(p,'#periodNames>.cyb.ed [data-cyt="'+k+'"]');else await p.evaluate(k=>document.querySelector('#periodNames [data-cyb="0"] [data-cyt="'+k+'"]').click(),k);await settle(p);};await c('coll');await c('athle');
   if(nw)await tap(p,'#rcBd');else await p.evaluate(()=>document.querySelector('#periodNames [data-cyb="0"] [data-cybed]').click());await settle(p);}],
 ['dates du cycle 4 modifiées',async(p,nw)=>{if(nw)await tap(p,'#rcSec .rc-it[data-rc="3"] .rc-dt');else await p.evaluate(()=>document.querySelector('#cycDates [data-cyed="3"]').click());await settle(p);
   await setV(p,'#cycDates .cy-card[data-i="3"] .cf','2027-02-02');await settle(p);await setV(p,'#cycDates .cy-card[data-i="3"] .ct','2027-02-27');await settle(p);
   if(nw)await tap(p,'#cycDates>.cy-card.ed .rc-ok');else await p.evaluate(()=>document.querySelector('#cycDates [data-cyed="3"]').click());await settle(p);}],
 ['Recalculer automatiquement',async(p,nw)=>{await p.evaluate(()=>{document.querySelector('#calSettings details.cycauto').open=true;});await setV(p,'#cycAutoStart','2026-09-21');await setV(p,'#cycAutoW','5');
   if(nw)await tap(p,'#cycAutoGo');else await p.evaluate(()=>document.getElementById('cycAutoGo').click());await settle(p);}],
 ['Rétablir les dates 2026-2027',async(p,nw)=>{if(nw)await tap(p,'#cycOfficial');else await p.evaluate(()=>document.getElementById('cycOfficial').click());await settle(p);}]];
(async()=>{b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const O=await page(LYC,true),N=await page(LYC,false);await openAnnee(O);await openAnnee(N);
 check('écran d’origine sans college.js (référence 1.29.2 k) : pas de ligne de temps',await O.evaluate(()=>!document.getElementById('rcSec')&&!!document.querySelector('#cycDates .cy-card')));
 const v=await N.evaluate(()=>{const s=document.getElementById('rcSec'),vis=x=>!!x&&x.getClientRects().length>0&&getComputedStyle(x).display!=='none';
   const pan=s&&s.closest('[data-ps]'),h2=pan&&pan.querySelector('h2');return {title:h2&&h2.textContent,dup:s?s.querySelectorAll('h1,h2,h3,.rc-h b').length+[...s.querySelectorAll('*')].filter(x=>x.children.length===0&&x.textContent.trim()==='Répartition cyclique').length:9,sub:s&&s.querySelector('.rc-h .rc-sub').textContent,tile:[...document.querySelectorAll('*')].some(x=>x.children.length===0&&x.textContent.trim()==='Année scolaire'),before:s&&s.nextElementSibling&&s.nextElementSibling.id,items:s?s.querySelectorAll('.rc-it').length:0,acts:[...s.querySelectorAll('.rc-act')].map(x=>x.textContent.trim()),
   dts:[...s.querySelectorAll('.rc-dt')].map(x=>x.textContent.replace('✎','').trim()),ty:[...s.querySelectorAll('.rc-ty')].map(x=>x.textContent.trim()),wk:[...s.querySelectorAll('.rc-wk')].map(x=>x.textContent),
   gaps:[...s.querySelectorAll('.rc-gp')].map(x=>x.textContent),pill:[...s.querySelectorAll('.rc-pill')].map(x=>x.textContent),months:[...s.querySelectorAll('.rc-mo span')].map(x=>x.textContent),fr:s.querySelectorAll('.rc-fr .cy-tl i[class^="cy-c"]').length,
   info:!!s.querySelector('[data-pq-open="cycSheet"]'),oldCards:[...document.querySelectorAll('#cycDates .cy-card,#periodNames .cyb,#calSettings>.cy-head,#calSettings>.cy-tl')].some(vis),
   foot:vis(document.getElementById('cycOfficial'))&&vis(document.querySelector('#calSettings details.cycauto')),ref:{acts:CJR.db().periods.slice(),dts:CJR.db().cal.cycles.map(c=>c.from.slice(8,10)+'/'+c.from.slice(5,7)+' → '+c.to.slice(8,10)+'/'+c.to.slice(5,7))}};});
 check('titre unique « Répartition cyclique » (titre du panneau, plus « Année scolaire » ; la carte n’a plus de titre, garde ⓘ et le résumé), section avant les dates, 6 cartes, frise numérotée 1…6 avec les mois',v.title==='Répartition cyclique'&&v.dup===0&&!v.tile&&/^6 cycles · \d\d\/\d\d → \d\d\/\d\d · \d+ semaines de cours$/.test(v.sub)&&v.before==='calSettings'&&v.items===6&&v.fr===6&&v.months[0]==='sept.'&&v.months.slice(-1)[0]==='mai',v);
 check('cartes : activité, dates, type, semaines lus dans les données (mêmes textes que l’écran d’origine)',JSON.stringify(v.acts)===JSON.stringify(v.ref.acts)&&JSON.stringify(v.dts)===JSON.stringify(v.ref.dts)&&v.ty.every(t=>/(Athlétisme|Sport collectif|Gymnastique)/.test(t))&&v.wk.length===6,v);
 check('pauses de vacances entre cycles + badge À VENIR/EN COURS',v.gaps.length>=1&&v.gaps.every(t=>/^Pause · \d+ sem\. \(vacances\)$/.test(t))&&v.pill.length===1&&/^(À VENIR|EN COURS)$/.test(v.pill[0]),[v.gaps,v.pill]);
 check('anciennes cartes masquées ; Rétablir, Recalculer et ⓘ accessibles',!v.oldCards&&v.foot&&v.info,v);
 check('données identiques au départ',await J(O)===await J(N));
 for(const [n,f] of ACTS){await f(O,false);await f(N,true);const a=await J(O),c=await J(N);
   check('même écriture que l’écran d’origine : '+n,a===c&&a!==(globalThis.__prev||''),a===c?'identique mais inchangé':(()=>{const x=JSON.parse(a),y=JSON.parse(c);return Object.keys(x).filter(k=>JSON.stringify(x[k])!==JSON.stringify(y[k])).map(k=>[k,JSON.stringify(x[k]).slice(0,200),JSON.stringify(y[k]).slice(0,200)]);})());globalThis.__prev=a;}
 check('mêmes demandes de confirmation (type, Recalculer, Rétablir)',JSON.stringify(O.dlg)===JSON.stringify(N.dlg)&&(N.dlg||[]).length===3,[O.dlg,N.dlg]);
 const tl=await N.evaluate(()=>({a:document.querySelector('#rcSec .rc-it[data-rc="2"] .rc-act').textContent.trim(),d:document.querySelector('#rcSec .rc-it[data-rc="3"] .rc-dt').textContent.replace('✎','').trim(),ref:CJR.db().cal.cycles[3]}));
 check('la ligne de temps suit les modifications (Handball, dates du cycle 4)',tl.a==='Handball'&&tl.d===tl.ref.from.slice(8,10)+'/'+tl.ref.from.slice(5,7)+' → '+tl.ref.to.slice(8,10)+'/'+tl.ref.to.slice(5,7),tl);
 /* feuille d’édition */
 await tap(N,'#rcSec .rc-it[data-rc="4"] .rc-ed');await settle(N);
 const s1=await N.evaluate(()=>{const k=document.querySelector('#periodNames>.cyb.ed'),r=k&&k.getBoundingClientRect();return {i:k&&k.dataset.cyb,fixed:k&&getComputedStyle(k).position==='fixed',vis:!!r&&r.bottom<=innerHeight+1&&r.top>innerHeight/3,bd:!document.getElementById('rcBd').hidden,role:k&&k.getAttribute('role'),chips:k?[...k.querySelectorAll('.cyb-c')].map(x=>x.textContent.trim()+(x.classList.contains('on')?'*':'')):[],inp:!!(k&&k.querySelector('input[data-pi]'))};});
 check('✎ activité : feuille en bas d’écran (dialogue) avec nom, Auto / Sport collectif / Athlétisme / Gymnastique (Auto indiqué), voile',s1.i==='4'&&s1.fixed&&s1.vis&&s1.bd&&s1.role==='dialog'&&s1.inp&&s1.chips.length===4&&s1.chips.some(x=>/^Auto\*?$/.test(x)),s1);
 /* le voile recouvre la ligne de temps : on vérifie le chemin « une seule feuille » par un clic direct */await N.evaluate(()=>document.querySelector('#rcSec .rc-it[data-rc="1"] .rc-dt').click());await settle(N);
 const s2=await N.evaluate(()=>({a:document.querySelectorAll('#periodNames>.cyb.ed').length,d:[...document.querySelectorAll('#cycDates>.cy-card.ed')].map(x=>x.dataset.i),fx:(x=>x&&getComputedStyle(x).position)(document.querySelector('#cycDates>.cy-card.ed')),inp:!!document.querySelector('#cycDates>.cy-card.ed .cf')}));
 check('✎ dates : une seule feuille ouverte (l’activité se ferme), champs début/fin',s2.a===0&&s2.d.join()==='1'&&s2.fx==='fixed'&&s2.inp,s2);
 await N.keyboard.press('Escape');await settle(N);
 const s3=await N.evaluate(()=>({o:document.querySelectorAll('#cycDates>.cy-card.ed,#periodNames>.cyb.ed').length,bd:document.getElementById('rcBd').hidden}));
 check('Échap ferme la feuille et le voile',s3.o===0&&s3.bd,s3);
 await tap(N,'#rcSec [data-pq-open="cycSheet"]');await settle(N);
 check('ⓘ ouvre « Comment sont utilisées ces dates ? »',await N.evaluate(()=>!document.getElementById('cycSheet').hidden));
 check('aucune erreur JS',O.errs.length===0&&N.errs.length===0,O.errs.concat(N.errs));
 /* collège */
 const C=await page(COL,false);await openAnnee(C);
 const cv=await C.evaluate(()=>({m:CJR.cxMode(),n:document.querySelectorAll('#rcSec .rc-it').length}));
 await tap(C,'#rcSec .rc-it[data-rc="0"] .rc-ed');await settle(C);const cj0=await J(C);await setV(C,'#periodNames [data-cyb="0"] input[data-pi]','Endurance');await settle(C);await tap(C,'#periodNames>.cyb.ed .rc-ok');await settle(C);
 const cv2=await C.evaluate(()=>({p:CJR.db().periods[0],t:document.querySelector('#rcSec .rc-it[data-rc="0"] .rc-act').textContent.trim(),o:document.querySelectorAll('#periodNames>.cyb.ed').length}));
 check('mode Collège : même section, modification d’activité enregistrée et affichée',cv.m==='college'&&cv.n===6&&cv2.p==='Endurance'&&cv2.t==='Endurance'&&cv2.o===0&&C.errs.length===0,[cv,cv2,C.errs]);
 console.log(pass+'/'+tot+' passed');await b.close();srv.close();process.exit(pass===tot?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
