/* 1.29.2a : TOUS les boutons ⓘ de la version ordinateur (1280 et 1366 px, 3 thèmes) ouvrent un panneau centré, large et lisible
   (avant : feuille réduite à 0 px de large par desk.js → colonne vide de 32–60 px avec ✕ et barre de défilement). Mobile 390 inchangé. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const PORT=8248;const srv=serve(process.env.CJ_ROOT||'/workspace/cj-deploy',PORT);const SH=process.env.SHOTS_INFO||'';
/* où trouver chaque ⓘ : [nom, préparation, sélecteur du bouton, feuille] */
const ps=k=>async p=>{await tab(p,'settings');await sleep(400);await p.evaluate(k=>window.CJPS&&CJPS.open(k),k);await sleep(500);};
const SPOTS=[
 ['Accueil › Calendrier des cycles',async p=>{await tab(p,'home');await sleep(500);},'#view-home [data-pq-open="calSheet"]','calSheet'],
 ['Absences › barème et légende',async p=>{await tab(p,'attendance');await sleep(600);},'#attInfoBtn','attSheet'],
 ['Note procédurale',async p=>{await tab(p,'proc');await sleep(600);},'#procInfo','procSheet'],
 ['Paramètres › Classes',ps('cls'),'#view-settings [data-pq-open="clsSheet"]','clsSheet'],
 ['Paramètres › Points retirés',ps('pts'),'#view-settings [data-pq-open="ptsSheet"]','ptsSheet'],
 ['Paramètres › Répartition cyclique',ps('annee'),'#view-settings [data-pq-open="cycSheet"]','cycSheet'],
 ['Paramètres › Vacances et jours fériés',ps('hol'),'#view-settings [data-pq-open="holSheet"]','holSheet']];
const lum=c=>{const m=c.match(/[\d.]+/g).map(Number);const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(m[0])+.7152*f(m[1])+.0722*f(m[2]);};
const geo=(p,id)=>p.evaluate(id=>{const s=document.getElementById(id);if(!s)return null;const pn=s.querySelector('.pq-pan'),r=s.getBoundingClientRect(),q=pn.getBoundingClientRect(),t=s.querySelector('.pq-hd b')||pn;const tr=t.getBoundingClientRect();
 const e=document.elementFromPoint(tr.left+Math.min(20,tr.width/2),tr.top+tr.height/2),cs=getComputedStyle(pn),ts=getComputedStyle(t);
 return {hidden:s.hidden,sw:Math.round(r.width),sh:Math.round(r.height),l:Math.round(q.left),t:Math.round(q.top),w:Math.round(q.width),h:Math.round(q.height),vw:innerWidth,vh:innerHeight,tOk:!!(e&&pn.contains(e)),tw:Math.round(tr.width),txt:pn.innerText.trim().length,bg:cs.backgroundColor,ink:ts.color};},id);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const theme of ['','terrain','neon'])for(const [w,h] of [[1280,720],[1366,768]]){const p=await open(b,PORT,{w,h,theme});const TN=(theme||'actuel')+' '+w+' px';
  for(const [nm,prep,sel,id] of SPOTS){await prep(p);const bt=await p.$(sel);const shown=bt&&await p.evaluate(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!!e.offsetParent;},bt);
   if(!shown){check(TN+' · '+nm+' : bouton ⓘ visible',false);continue;}
   await p.evaluate(e=>e.scrollIntoView({block:'center'}),bt);await sleep(150);await bt.click();await sleep(350);const g=await geo(p,id);
   const ok=g&&!g.hidden&&g.sw===g.vw&&g.sh===g.vh&&g.w>=Math.min(600,g.vw-64)&&Math.abs(g.l+g.w/2-g.vw/2)<2&&g.t>=0&&g.t+g.h<=g.vh&&g.tOk&&g.tw>60&&g.txt>40;
   const L1=lum(g.bg),L2=lum(g.ink),cr=(Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
   check(TN+' · '+nm+' : ⓘ → panneau centré '+(g&&g.w)+'×'+(g&&g.h)+' px, titre lisible (contraste '+cr.toFixed(1)+')',ok&&cr>=4.5,JSON.stringify(g));
   if(SH)await p.screenshot({path:SH+'/'+(theme||'actuel')+'-'+w+'-'+id+'.png'});
   await p.keyboard.press('Escape');await sleep(200);check(TN+' · '+nm+' : Échap ferme',await p.evaluate(id=>document.getElementById(id).hidden,id));}
  check(TN+' : aucune erreur JavaScript',p.errs.length===0,p.errs.join('|'));await p.ctx.close();}
 /* mobile : feuille du bas pleine largeur (inchangé) */
 const p=await open(b,PORT,{w:390,h:844,dpr:2});
 for(const [nm,prep,sel,id] of SPOTS){await prep(p);const bt=await p.$(sel);if(!bt||!await p.evaluate(e=>!!e.offsetParent,bt))continue;await p.evaluate(e=>e.scrollIntoView({block:'center'}),bt);await sleep(150);await bt.click();await sleep(350);const g=await geo(p,id);
  check('390 px · '+nm+' : feuille du bas inchangée (pleine largeur, collée en bas)',g&&!g.hidden&&g.l===0&&g.w===390&&Math.abs(g.t+g.h-844)<=1&&g.tOk,JSON.stringify(g));await p.keyboard.press('Escape');await sleep(200);}
 check('390 px : aucune erreur JavaScript',p.errs.length===0,p.errs.join('|'));await p.ctx.close();
}catch(e){check('exception',false,e.stack);}
await b.close();srv.close();const n=results.filter(x=>x).length;console.log(n+'/'+results.length+' passed');process.exit(n===results.length?0:1);})();
