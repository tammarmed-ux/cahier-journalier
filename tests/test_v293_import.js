/* 1.29.3 : lecture de l’export JSON réel de l’utilisateur (data-AVANT-1.29.3-20261102.json) dans la build 1.29.3, en local (aucun Firestore).
   Import par CJApp.applyJSON (chemin de « Importer une sauvegarde »), puis : export JSON identique à l’entrée (hors ui/lastBackup),
   chaque classe affichée en Absences, Note procédurale et Rapports avec le bon nombre d’élèves, tuiles de cycle, aucune erreur JS. Lancer depuis cj-emu. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(ok||x===undefined?'':' :: '+JSON.stringify(x).slice(0,600)));}
const F=process.env.DATA||'/workspace/backups/data-AVANT-1.29.3-20261102.json',RAW=fs.readFileSync(F,'utf8'),IN=JSON.parse(RAW);const PORT=8336;
const strip=o=>{o=JSON.parse(JSON.stringify(o));delete o.ui;delete o.lastBackup;return o;};
const canon=x=>Array.isArray(x)?x.map(canon):x&&typeof x==='object'?Object.keys(x).sort().reduce((o,k)=>(o[k]=canon(x[k]),o),{}):x;
(async()=>{const s=serve('/workspace/cj-deploy',PORT);const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [w,h] of [[390,844],[1280,800]]){const p=await open(b,PORT,{w,h,dpr:1,mobile:w<600,now:'2026-11-02T09:00:00'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.evaluate(s=>window.CJApp.applyJSON(s),RAW);await sleep(1500);
  const sem=await p.evaluate(()=>CJR.semver);const OUT=JSON.parse(await p.evaluate(()=>CJApp.getJSON()));
  const a=canon(strip(IN)),o=canon(strip(OUT));const dk=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(o[k]));
  check(w+' px : version '+sem+' ; import puis export JSON : '+OUT.classes.length+' classes, '+OUT.students.length+' élèves, '+Object.keys(OUT.sessions).length+' clés de séances, données identiques à l’export (hors ui/lastBackup)',sem==='1.29.3'&&dk.length===0&&OUT.classes.length===10&&OUT.students.length===351,dk);
  const bad=[];for(const c of IN.classes){const n=IN.students.filter(x=>x.classId===c.id).length;
   for(const t of ['attendance','proc']){await tab(p,t);await sleep(300);const pr=t==='attendance'?'att':'proc';
    await p.evaluate((pr,id)=>{const e=document.getElementById(pr+'Class');e.value=id;e.dispatchEvent(new Event('change',{bubbles:true}));},pr,c.id);await sleep(500);
    const r=await p.evaluate(pr=>{const w=document.getElementById(pr==='att'?'attWrap':'procWrap')||document;const tb=w.querySelector('table tbody');return {rows:tb?tb.rows.length:0,tiles:document.querySelectorAll('#'+pr+'Periods .pchip.cyt').length,title:!!document.querySelector('#'+pr+'Cycle .cy-l1')};},pr);
    if(r.rows<n||r.tiles!==6||!r.title)bad.push([c.name,t,n,r]);}}
  check(w+' px : les 10 classes affichées en Absences et Note procédurale (lignes ≥ élèves, 6 tuiles, titre du cycle)',!bad.length,bad);
  await tab(p,'reports');await sleep(800);const rp=[];for(const c of IN.classes){const n=IN.students.filter(x=>x.classId===c.id).length;await p.evaluate(id=>{const e=document.getElementById('repClass');e.value=id;e.dispatchEvent(new Event('change',{bubbles:true}));},c.id);await sleep(400);
   const r=await p.evaluate(()=>[...document.querySelectorAll('#view-reports table tbody tr')].filter(x=>x.offsetParent).length);rp.push(c.name+':'+r+'/'+n);if(r<n)rp.bad=1;}
  check(w+' px : Rapports › Bilan affiché pour les 10 classes (lignes ≥ élèves)',!rp.bad,rp);
  await tab(p,'home');await sleep(600);check(w+' px : aucune erreur JS',!errs.length,errs);
  const OUT2=JSON.parse(await p.evaluate(()=>CJApp.getJSON()));const d2=Object.keys(a).filter(k=>JSON.stringify(a[k])!==JSON.stringify(canon(strip(OUT2))[k]));
  check(w+' px : après navigation dans toutes les classes, données toujours identiques à l’export (hors ui)',d2.length===0,d2);
  await p.ctx.close();}
 await b.close();s.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);})();
