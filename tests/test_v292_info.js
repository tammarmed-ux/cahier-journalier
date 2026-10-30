/* 1.29.2a : bouton ⓘ sur ordinateur — la feuille d’explication s’affiche en panneau centré lisible (avant : feuille réduite à 0 px → colonne vide de 32 px avec barre de défilement).
   Ordinateur 1024 / 1280 / 1366 / 1440 : Note procédurale (athlétisme, épreuve, 3 essais), Absences, Paramètres › Répartition cyclique ; mobile 390 inchangé (feuille du bas pleine largeur). Affichage seulement. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const PORT=8246;const srv=serve('/workspace/cj-deploy',PORT);
async function prepProc(p){await tab(p,'proc');await sleep(600);await p.evaluate(()=>{const c=document.querySelector('#procPeriods [data-p="1"]');c&&c.click();});await sleep(400);
 if(await p.$eval('#procAps',s=>s.value)!=='athle'){await p.select('#procAps','athle');await sleep(500);}
 const ev=await p.$$eval('#procEvt option',o=>o.map(x=>x.value).filter(Boolean));if(await p.$eval('#procEvt',s=>s.value)==='')await p.select('#procEvt',ev[0]);await sleep(500);}
const geo=(p,id)=>p.evaluate(id=>{const s=document.getElementById(id),pn=s.querySelector('.pq-pan'),r=s.getBoundingClientRect(),q=pn.getBoundingClientRect(),t=s.querySelector('.pq-hd b');
 const hit=(x,y)=>{const e=document.elementFromPoint(x,y);return !!(e&&pn.contains(e));};const tr=t.getBoundingClientRect();
 return {hidden:s.hidden,sw:r.width,sh:r.height,l:q.left,t:q.top,w:q.width,h:q.height,vw:innerWidth,vh:innerHeight,ttl:t.textContent,tw:tr.width,tOk:hit(tr.left+5,tr.top+tr.height/2),txt:pn.innerText.length,
  bdTop:(()=>{const e=document.elementFromPoint(8,8);return !!(e&&e.classList.contains('pq-bd'));})()};},id);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 for(const [w,h] of [[1024,700],[1280,720],[1366,768],[1440,900]]){const p=await open(b,PORT,{w,h});await prepProc(p);
  check(w+' px : barre Note procédurale avec « 3 essais » et ⓘ',await p.$('#procNtr')&&await p.$eval('#procNtr',s=>s.value)==='3'&&await p.$('#procInfo'));
  await p.click('#procInfo');await sleep(400);let g=await geo(p,'procSheet');
  check(w+' px : ⓘ ouvre la feuille « Comment est calculée la note ? » sur tout l’écran (fond assombri cliquable)',!g.hidden&&g.sw===g.vw&&g.sh===g.vh&&g.bdTop,JSON.stringify([g.sw,g.sh]));
  check(w+' px : panneau centré, large (≥ 600 px), entièrement visible, titre lisible au premier plan',g.w>=Math.min(600,g.vw-64)&&Math.abs(g.l+g.w/2-g.vw/2)<2&&g.t>=0&&g.t+g.h<=g.vh&&g.tOk&&g.tw>150&&g.txt>120,JSON.stringify(g));
  await p.keyboard.press('Escape');await sleep(250);check(w+' px : Échap ferme la feuille',await p.$eval('#procSheet',s=>s.hidden));
  await p.click('#procInfo');await sleep(300);await p.mouse.click(10,g.vh-10);await sleep(250);check(w+' px : clic sur le fond ferme la feuille',await p.$eval('#procSheet',s=>s.hidden));
  if(w===1280){await tab(p,'attendance');await sleep(600);const bt=await p.$('#attInfoBtn');if(bt&&await p.evaluate(e=>!!e.offsetParent,bt)){await bt.click();await sleep(300);g=await geo(p,'attSheet');
    check('1280 px : ⓘ Absences — même panneau centré lisible',!g.hidden&&g.w>=600&&Math.abs(g.l+g.w/2-g.vw/2)<2&&g.tOk,JSON.stringify(g));await p.keyboard.press('Escape');await sleep(200);}
   else check('1280 px : ⓘ Absences présent',false);}
  check(w+' px : aucune erreur JavaScript',p.errs.length===0,p.errs.join('|'));await p.ctx.close();}
 /* mobile : feuille du bas pleine largeur, comme 1.29.2 */
 const p=await open(b,PORT,{w:390,h:844,dpr:2});await prepProc(p);await p.click('#procInfo');await sleep(400);const g=await geo(p,'procSheet');
 check('390 px (mobile) : feuille du bas inchangée (pleine largeur, collée en bas, poignée visible)',!g.hidden&&g.l===0&&g.w===390&&Math.abs(g.t+g.h-844)<1&&g.tOk&&await p.$eval('#procSheet .pq-grab',e=>getComputedStyle(e).display!=='none'),JSON.stringify(g));
 check('390 px : desk.js non appliqué',await p.evaluate(()=>!document.documentElement.classList.contains('cj-dk')));
 check('390 px : aucune erreur JavaScript',p.errs.length===0,p.errs.join('|'));await p.ctx.close();
}catch(e){check('exception',false,e.stack);}
await b.close();srv.close();const n=results.filter(x=>x).length;console.log(n+'/'+results.length+' passed');process.exit(n===results.length?0:1);})();
