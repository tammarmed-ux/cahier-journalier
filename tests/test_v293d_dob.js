/* 1.29.3d : date de naissance (jj/mm/aaaa) entre le nom et le code Massar — Élèves (cartes) et trombinoscope PDF (2 formats). Affichage seul.
   Données réelles (export local), aucune connexion Firestore. Un élève sans date : pas de ligne. Lancer depuis cj-emu. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(ok||x===undefined?'':' :: '+JSON.stringify(x).slice(0,600)));}
const ROOT='/workspace/cj-deploy',PORT=8347,OUT=process.env.OUT||'/workspace/backups/v1.29.3d-preview/';
const F=process.env.DATA||'/workspace/backups/data-AVANT-1.29.3-20261102.json';const IN=JSON.parse(fs.readFileSync(F,'utf8'));
const CID=IN.classes.find(c=>c.name==='2BACSVT1').id;const NOD=IN.students.find(s=>s.classId===CID&&s.dob);NOD.dob='';   /* un élève sans date (copie en mémoire seulement) */
const RAW=JSON.stringify(IN);const dmy=d=>d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4);
const strip=o=>{o=JSON.parse(JSON.stringify(o));delete o.ui;delete o.lastBackup;return o;};
const canon=x=>Array.isArray(x)?x.map(canon):x&&typeof x==='object'?Object.keys(x).sort().reduce((o,k)=>(o[k]=canon(x[k]),o),{}):x;
(async()=>{
 {const sw=fs.readFileSync(ROOT+'/sw.js','utf8');const a=[...sw.match(/ASSETS\s*=\s*\[([^\]]*)\]/)[1].matchAll(/'([^']+)'/g)].map(x=>x[1]);let t=0;for(const f of a){const p=f==='./'||f==='/'?'index.html':f.replace(/^\.?\//,'');try{t+=fs.statSync(ROOT+'/'+p).size}catch(e){}}
  check('budget de démarrage ≤ 736 875 o ('+t+' o)',t<=736875,t);}
 const s=serve(ROOT,PORT);const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [w,h] of [[390,844],[1280,800]]){const p=await open(b,PORT,{w,h,dpr:2,mobile:w<600,data:RAW,now:'2026-11-04T09:00:00'});
  await tab(p,'students');await sleep(500);await p.evaluate(id=>{const e=document.getElementById('stuClassFilter');e.value=id;e.dispatchEvent(new Event('change',{bubbles:true}));},CID);await sleep(700);
  const rows=await p.evaluate(()=>[...document.querySelectorAll('#stuList li.stu')].map(li=>({id:li.dataset.id,meta:li.querySelector('.meta').textContent})));
  const bad=[];for(const r of rows){const st=IN.students.find(x=>x.id===r.id);const want=st.dob?dmy(st.dob):null;
   if(want){const i=r.meta.indexOf(want),j=st.sid?r.meta.indexOf('#'+st.sid):1e9;if(i<0||i>j)bad.push(r);}else if(/\d\d\/\d\d\/\d{4}/.test(r.meta))bad.push(r);}
  check(w+' px : Élèves 2BACSVT1, '+rows.length+' cartes : date jj/mm/aaaa avant le code Massar, aucune ligne si pas de date',rows.length>=20&&rows.every(r=>IN.students.find(x=>x.id===r.id).classId===CID)&&!bad.length,bad.slice(0,3));
  await p.screenshot({path:OUT+'eleves-'+w+'.png'});
  const sc=await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);check(w+' px : pas de défilement horizontal',sc);
  for(const mode of ['page','group']){const r=await p.evaluate(async(cid,mode)=>{await new Promise((ok,ko)=>{const t0=Date.now();window.__lastPdf=null;CJR&&0;const q=()=>{};ok();});
     const go=document.getElementById('trbGo');window.__lastPdf=null;document.getElementById('trombiBtn').click();await new Promise(r=>setTimeout(r,300));
     document.getElementById('trbClass').value=cid;const f=document.querySelector('input[name="trbFmt"][value="'+mode+'"]');if(f)f.checked=true;go.click();
     for(let i=0;i<100&&!window.__lastPdf;i++)await new Promise(r=>setTimeout(r,200));if(!window.__lastPdf)return null;
     const buf=new Uint8Array(await window.__lastPdf.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return {name:window.__lastPdf.name,b64:btoa(s)};},CID,mode);
   if(w!==1280&&r){const fn=OUT+'trombi-'+mode+'.pdf';fs.writeFileSync(fn,Buffer.from(r.b64,'base64'));cp.execSync(`pdftoppm -r 110 -png -f 1 -l 1 ${fn} ${OUT}trombi-${mode}`);
     const txt=cp.execSync('pdftotext '+fn+' -').toString();const miss=IN.students.filter(x=>x.classId===CID&&x.dob&&!txt.includes(dmy(x.dob))).map(x=>x.name);
     check('PDF trombinoscope ('+mode+') : '+r.name+', date de chaque élève qui en a une',!miss.length,miss);
     check('PDF trombinoscope ('+mode+') : élève sans date → pas de date inventée ('+NOD.name+')',(txt.match(/\d\d\/\d\d\/\d{4}/g)||[]).filter(x=>!/2026$/.test(x)).length===IN.students.filter(x=>x.classId===CID&&x.dob).length,(txt.match(/\d\d\/\d\d\/\d{4}/g)||[]).length);}
   else if(!r)check(w+' px : PDF '+mode+' créé',false);}
  const OUTJ=JSON.parse(await p.evaluate(()=>CJApp.getJSON()));const dk=Object.keys(canon(strip(IN))).filter(k=>JSON.stringify(canon(strip(IN))[k])!==JSON.stringify(canon(strip(OUTJ))[k]));
  check(w+' px : données inchangées (export JSON identique, hors ui/lastBackup)',!dk.length,dk);check(w+' px : aucune erreur JS',!p.errs.length,p.errs);await p.ctx.close();}
 await b.close();s.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);})();
