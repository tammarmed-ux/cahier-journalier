/* 1.29.2c (C) : tuiles de cycle (Absences et Note procédurale) — affichage seulement.
   Vérifie à 390 et 1280 px (thèmes actuel, neon, terrain ; données réelles anonymes, aujourd’hui = 02/11/2026) :
   6 tuiles avec icône, statut (✓ Terminé / ● En cours / À venir) et barre de la couleur --cyN de la répartition (suit le thème),
   titre avec icône + badge « En cours » et dates sur la même ligne, « Rapide | Détail » sur la même ligne que les tuiles à 1280 px,
   tuile choisie visible (défilement auto), aucun défilement horizontal de page, clic = changement de cycle, données inchangées,
   aucune erreur JS ; index.html identique à 2w une fois les changements défaits ; budget de démarrage tenu. Lancer depuis cj-emu. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(ok||x===undefined?'':' :: '+JSON.stringify(x).slice(0,600)));}
const B=fs.readFileSync(process.env.DATA||'/workspace/backups/data-APRES-changement-EDT-20261101.json','utf8');const ROOT='/workspace/cj-deploy',PORT=8335;
(async()=>{
 {const u=require(ROOT+'/tests/undo_2x.js');const cur=fs.readFileSync(ROOT+'/index.html','utf8');
  check('index.html : seuls les changements listés (dont undo_2c_cycles) diffèrent de 2w',fs.existsSync('/tmp/base-2x/index.html')?u.index(cur)===fs.readFileSync('/tmp/base-2x/index.html','utf8'):true);
  const sw=fs.readFileSync(ROOT+'/sw.js','utf8');const a=[...sw.match(/ASSETS\s*=\s*\[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);let t=0;for(const f of a){const p=f==='./'||f==='/'?'index.html':f.replace(/^\.?\//,'');try{t+=fs.statSync(ROOT+'/'+p).size}catch(e){}}
  check('budget de démarrage ≤ 736 875 o ('+t+' o)',t<=736875,t);}
 const s=serve(ROOT,PORT);const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 /* référence : mêmes clics sur la version d’avant (tag backup-pre-1.29.2c-cyclesC) → mêmes données attendues (le clic sur un cycle peut déjà compléter cal, comportement existant) */
 const OLD='/tmp/cyclesC_old';fs.rmSync(OLD,{recursive:true,force:true});fs.mkdirSync(OLD);require('child_process').execSync(`git -C ${ROOT} archive backup-pre-1.29.2c-cyclesC | tar -x -C ${OLD}`);
 const JX=p=>p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});let JOLD;
 {const so=serve(OLD,PORT+1);const p=await open(b,PORT+1,{w:390,h:844,dpr:1,mobile:true,data:B,now:'2026-11-02T09:00:00'});for(const pr of ['att','proc']){await tab(p,pr==='att'?'attendance':'proc');await sleep(900);await p.click('#'+pr+'Periods [data-p="3"]');await sleep(700);await p.click('#'+pr+'Periods [data-p="1"]');await sleep(500);}JOLD=await JX(p);await p.ctx.close();so.close();}
 for(const [w,h,theme] of [[390,844,''],[1280,800,''],[390,844,'neon'],[1280,800,'terrain']]){
  const p=await open(b,PORT,{w,h,dpr:1,mobile:w<600,data:B,now:'2026-11-02T09:00:00',theme});const errs=[];p.on('pageerror',e=>errs.push(e.message));const L=w+' px'+(theme?' '+theme:'');
  const J0=await p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
  for(const t of ['attendance','proc']){await tab(p,t);await sleep(900);const pr=t==='attendance'?'att':'proc',V=t==='attendance'?'Absences':'Note procéd.';
   const r=await p.evaluate((pr,t)=>{const q=s=>document.querySelector(s),R=e=>e.getBoundingClientRect(),cs=getComputedStyle(document.documentElement),tmp=document.createElement('i');document.body.appendChild(tmp);
    const rgb=c=>{tmp.style.color=c;return getComputedStyle(tmp).color;};const pl=q('#'+pr+'Periods'),tiles=[...pl.querySelectorAll('.pchip')];
    const o={n:tiles.length,ov:document.documentElement.scrollWidth-innerWidth,
     col:tiles.every((x,i)=>getComputedStyle(x,'::after').backgroundColor===rgb(cs.getPropertyValue('--cy'+(i%6)).trim())),
     icons:tiles.every(x=>{const i=x.querySelector('.pc-i');return i&&(i.querySelector('svg')||i.textContent.trim());}),
     st:tiles.map(x=>x.querySelector('.pc-s').textContent+'|'+(x.className.match(/\b(done|cur|next)\b/)||[''])[0]),
     on:tiles.findIndex(x=>x.classList.contains('on')),aria:tiles.map(x=>x.getAttribute('aria-selected')).join(),dp:tiles.map(x=>x.dataset.p).join(),
     names:tiles.map(x=>x.querySelector('.pc-t').textContent.trim()).join('|')};
    const on=pl.querySelector('.on'),a=R(on),c=R(pl);o.vis=a.left>=c.left-1&&a.right<=c.right+1;o.plOv=pl.scrollWidth-pl.clientWidth;
    const l1=q('#'+pr+'Cycle .cy-l1'),bb=l1.querySelector('b'),m=l1.querySelector('.muted'),tag=l1.querySelector('.pc-tag');
    o.title={txt:l1.textContent,icon:!!l1.querySelector('.pc-i svg,.pc-i'),tag:tag?tag.textContent:null,tagVis:tag?R(tag).width>0:null,oneLine:Math.abs(R(m).top-R(bb).top)<6&&R(l1).height<28,trunc:bb.scrollWidth>bb.clientWidth+1,fit:R(m).right<=R(q('#view-'+t+' > .card')).right,
     col:getComputedStyle(l1).getPropertyValue('--c').trim(),want:null};o.title.want=cs.getPropertyValue('--cy'+(o.on%6)).trim();
    const sg=q('#view-attendance .seg');if(t==='attendance'&&sg){const r1=R(sg);o.seg={sameRow:r1.top<c.bottom&&r1.bottom>c.top,right:r1.right<=R(q('#view-attendance > .card')).right+1};}
    tmp.remove();return o;},pr,t);
   check(L+' '+V+' : 6 tuiles, icône sport dans chaque tuile, data-p / aria-selected conservés',r.n===6&&r.icons&&r.dp==='0,1,2,3,4,5'&&r.aria.split(',').filter(x=>x==='true').length===1&&r.names==='Cycle 1|Cycle 2|Cycle 3|Cycle 4|Cycle 5|Cycle 6',r);
   check(L+' '+V+' : barre de chaque tuile = couleur --cyN de la répartition du thème',r.col,r);
   check(L+' '+V+' : statuts Terminé / En cours / À venir selon les dates des cycles',r.st.join()==='Terminé|done,En cours|cur,À venir|next,À venir|next,À venir|next,À venir|next',r.st);
   check(L+' '+V+' : tuile choisie visible dans la rangée (défilement auto) ; aucun défilement horizontal de la page',r.vis&&r.ov<=0,r);
   check(L+' '+V+' : titre avec icône, badge « En cours » et dates sur la même ligne, sans coupure du nom ni débordement',r.title.icon&&r.title.tag==='En cours'&&r.title.tagVis&&r.title.oneLine&&!r.title.trunc&&r.title.fit&&r.title.col===r.title.want&&/26\/10/.test(r.title.txt),r.title);
   if(w>=1024)check(L+' '+V+' : les 6 tuiles tiennent sur la ligne (sans défilement interne)'+(r.seg?' et « Rapide | Détail » reste sur la même ligne':''),r.plOv<=0&&(!r.seg||r.seg.sameRow&&r.seg.right),r);
   await p.click('#'+pr+'Periods .pchip[data-p="3"]');await sleep(700);
   const c2=await p.evaluate(pr=>{const l1=document.querySelector('#'+pr+'Cycle .cy-l1'),on=document.querySelector('#'+pr+'Periods .pchip.on');return {per:CJR.db().ui.per,on:on&&on.dataset.p,t:l1.querySelector('b').textContent,tag:!!l1.querySelector('.pc-tag'),c:getComputedStyle(l1).getPropertyValue('--c').trim(),want:getComputedStyle(document.documentElement).getPropertyValue('--cy3').trim()};},pr);
   check(L+' '+V+' : clic sur la tuile Cycle 4 → cycle 4 affiché (titre sans badge, couleur --cy3)',c2.per===3&&c2.on==='3'&&/^Cycle 4 – /.test(c2.t)&&!c2.tag&&c2.c===c2.want,c2);
   await p.click('#'+pr+'Periods .pchip[data-p="1"]');await sleep(500);}
  const J1=await p.evaluate(()=>{const o=JSON.parse(CJApp.getJSON());delete o.ui;return JSON.stringify(o);});
  {let d=null;if(JOLD!==J1){const a=JSON.parse(JOLD),c=JSON.parse(J1);d=Object.keys(c).filter(k=>JSON.stringify(a[k])!==JSON.stringify(c[k]));}check(L+' : données (hors ui) identiques à la version d’avant après les mêmes clics ; aucune erreur JS',JOLD===J1&&!errs.length,[d,errs]);}await p.ctx.close();}
 await b.close();s.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);})();
