/* 1.29.3f : « Statistiques globales » compactes (proposition A) — affichage seul.
   Vérifie à 390 px et 1280 px (données réelles pc-20261104, date figée 04/11/2026 02:20) que chaque valeur et chaque évolution reste affichée et lisible,
   sans mini-graphiques, mobile en 3 colonnes. Port 8393. Lancer depuis cj-emu. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs');
let pass=0,tot=0;const check=(n,ok,x)=>{tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,600):''));};
const DATA=fs.readFileSync(process.env.CJ_DATA||'/workspace/backups/recup-20261103/pc-20261104.json','utf8');
const EXP={stu:['373'],cls:['10'],held:['75','▼ −4','11 → 7','neu'],A:['1078','▼ −45','135 → 90','good'],U:['1072','▼ −45','135 → 90','good'],S:['27','▼ −1','4 → 3','good'],M:['17','= stable','0 → 0','flat'],L:['36','▼ −5','7 → 2','good'],K:['15','▲ +3','0 → 3','bad']};
(async()=>{const srv=serve('/workspace/cj-deploy',8393);const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 for(const [w,m] of [[390,true],[1280,false]]){const p=await open(b,8393,{w,h:900,dpr:1,mobile:m,data:DATA,now:'2026-11-04T02:20:00'});await tab(p,'home');await sleep(800);
  const r=await p.evaluate(()=>{const c=document.getElementById('homeStats'),cr=c.getBoundingClientRect(),o={};
   const vis=e=>{if(!e)return false;const q=e.getBoundingClientRect();return q.width>0&&q.height>0&&q.left>=cr.left-1&&q.right<=cr.right+1&&e.scrollWidth<=e.clientWidth+1&&getComputedStyle(e).visibility!=='hidden';};
   c.querySelectorAll('.hs').forEach(h=>{const k=[...h.classList].find(x=>x.startsWith('k-')).slice(2),ev=h.querySelector('.hs-ev'),pl=h.querySelector('.hs-b'),vs=h.querySelector('.hs-vs'),v=h.querySelector('.hs-v'),l=h.querySelector('.hs-l');
    o[k]={v:v.textContent,vV:vis(v),l:l.textContent,lV:vis(l),b:pl&&pl.textContent,bV:vis(pl),vs:vs&&vs.textContent,vsV:vis(vs),cl:ev&&['good','bad','neu','flat','none'].find(x=>ev.classList.contains(x))};});
   const g=c.querySelector('.hs-grid');return {o,h:Math.round(cr.height),bars:c.querySelectorAll('svg').length,cols:getComputedStyle(g).gridTemplateColumns.split(' ').length};});
  for(const k in EXP){const e=EXP[k],g=r.o[k]||{};check(w+' px : '+k+' = '+e[0]+' visible',g.v===e[0]&&g.vV&&g.lV,g);
   if(e[1])check(w+' px : '+k+' évolution « '+e[1]+' » ('+e[2]+', '+e[3]+') visible',g.b===e[1]&&g.vs===e[2]&&g.cl===e[3]&&g.bV&&g.vsV,g);}
  check(w+' px : Absences et Non justifiées restent deux tuiles séparées',!!(r.o.A&&r.o.U)&&/Absences/.test(r.o.A.l)&&/Non justifiées/.test(r.o.U.l),[r.o.A&&r.o.A.l,r.o.U&&r.o.U.l]);
  check(w+' px : plus de mini-graphiques ni d’icônes (aucun svg)',r.bars===0,r.bars);
  check(w+' px : grille en 3 colonnes',r.cols===3,r.cols);
  if(w===390)check('390 px : carte ≤ 300 px de haut (avant : 594) — '+r.h+' px',r.h<=300,r.h);
  check(w+' px : aucune erreur JS',p.errs.length===0,p.errs);await p.ctx.close();}
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);})();
