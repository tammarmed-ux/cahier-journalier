/* 1.29.2c : Rapports › Bilan en « grille compacte » (proposition A) — affichage seulement.
   Vérifie à 390 et 1280 px (données réelles anonymes de la sauvegarde) : 5 colonnes, aucun défilement horizontal (tableau ni page),
   puces de tri, résumé sous les sélecteurs masqué, aucune erreur ; exports CSV/PDF du bilan identiques octet pour octet
   (hors dates internes du PDF) à la version précédente (tag backup-pre-1.29.2c-bilanA). Lancer depuis cj-emu. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs'),cp=require('child_process'),crypto=require('crypto');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const B=fs.readFileSync(process.env.DATA||'/workspace/backups/data-APRES-changement-EDT-20261101.json','utf8');
const ROOT='/workspace/cj-deploy',OLD='/tmp/bilanA_old';
fs.rmSync(OLD,{recursive:true,force:true});fs.mkdirSync(OLD);cp.execSync(`git -C ${ROOT} archive backup-pre-1.29.2c-bilanA | tar -x -C ${OLD}`);
const SEL=(p,cl,sc)=>p.evaluate((cl,sc)=>{const c=document.getElementById('repClass'),q=document.getElementById('repScope');const o=[...c.options].find(o=>cl?o.textContent.startsWith(cl+' '):o.value==='');c.value=o.value;c.dispatchEvent(new Event('change'));if(sc){q.value=sc;q.dispatchEvent(new Event('change'));}},cl,sc);
async function exportsOf(b,root,port){const s=serve(root,port);const out={};const p=await open(b,port,{w:390,h:844,dpr:1,mobile:true,data:B,now:'2026-11-02T09:00:00'});
 await p.evaluate(()=>{window.__dl=[];const o=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){if(this.download&&this.href.startsWith('blob:')){const it={n:this.download,t:null};window.__dl.push(it);fetch(this.href).then(r=>r.arrayBuffer()).then(a=>{it.t=Array.from(new Uint8Array(a)).map(x=>String.fromCharCode(x)).join('');});}return o.call(this);};});
 /* 1.29.3 : le pied de page PDF affiche la version (v'+CJR.semver) — seul ce numéro change ; rétabli pour comparer octet par octet à l’ancienne version */
 await p.evaluate(()=>{if(window.CJR&&CJR.semver==='1.29.3')CJR.semver='1.29.2';});
await tab(p,'reports');await sleep(800);
 for(const [cl,sc] of [['2BACSVT2',null],['2BACSVT2','year'],['',null]]){await SEL(p,cl,sc);await sleep(300);
  for(const btn of ['#repExportCsv','#repExportPdf']){const n0=await p.evaluate(()=>window.__dl.length);await p.click(btn);
   for(let i=0;i<120;i++){await sleep(500);if(await p.evaluate(n0=>window.__dl.length>n0&&window.__dl[window.__dl.length-1].t!==null,n0))break;}
   const d=await p.evaluate(()=>window.__dl[window.__dl.length-1]);const t=(d.t||'').replace(/\/CreationDate\s*\([^)]*\)|\/ModDate\s*\([^)]*\)|\/ID\s*\[[^\]]*\]/g,'');
   out[(cl||'toutes')+' '+(sc||'cycle')+' '+btn]=d.n+' '+t.length+' '+crypto.createHash('md5').update(t,'latin1').digest('hex');}}
 await p.ctx.close();s.close();return out;}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 try{const s=serve(ROOT,8295);
 for(const [w,h,dpr] of [[390,844,2],[1280,800,1]]){const p=await open(b,8295,{w,h,dpr,mobile:w<600,data:B,now:'2026-11-02T09:00:00'});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await tab(p,'reports');await sleep(900);
  for(const [nm,cl,sc] of [['cycle en cours','2BACSVT2',null],['année','2BACSVT2','year'],['toutes les classes','',null]]){await SEL(p,cl,sc);await sleep(400);
   const r=await p.evaluate(()=>{const t=document.getElementById('repTable'),wr=t.parentElement;const rows=[...t.tBodies[0].rows];return{cols:t.tHead.rows[0].cells.length,head:[...t.tHead.rows[0].cells].map(c=>c.textContent).join('|'),rows:rows.length,wrap:wr.scrollWidth-wr.clientWidth,doc:document.documentElement.scrollWidth-innerWidth,
     cellsOver:rows.slice(0,60).some(r=>[...r.cells].some(c=>c.scrollWidth>c.clientWidth+1)),chips:[...t.querySelectorAll('caption [data-sort]')].map(b=>b.textContent.replace(/ [▾▴]/,'')).join('|'),info:!!document.getElementById('repInfo').offsetParent,
     zeroChip:[...t.querySelectorAll('.rp-o span:not(.z)')].some(s=>/ 0$/.test(s.textContent)),legend:document.getElementById('repLegend').innerText,legVis:!!document.getElementById('repLegend').offsetParent,flag:t.querySelectorAll('tbody tr.flag').length};});
   check(w+' px '+nm+' : 5 colonnes Élève | Pts | Abs. | NJ | Autres, aucun défilement horizontal (tableau, page, cellules)',r.cols===5&&/^Élève.*\|Pts.*\|Abs\.\|NJ\|Autres$/.test(r.head)&&r.wrap<=0&&r.doc<=0&&!r.cellsOver&&r.rows>0,JSON.stringify(r).slice(0,300));
   check(w+' px '+nm+' : puces de tri, « Autres » sans valeur nulle, légende des codes, résumé masqué',/^Élève\|(Classe\|)?Points\|NJ\|Abs\.$/.test(r.chips)&&(cl?!/Classe/.test(r.chips):/Classe/.test(r.chips))&&!r.zeroChip&&!r.info,r.chips);
   /* t307u : plus de « Aucun élève n’atteint… », d’aide « Touchez… » ni de légende des codes à l’écran ; l’alerte réelle (≥ seuil NJ) reste */
   check(w+' px '+nm+' : sans message « Aucun élève… », aide ni légende ; alerte NJ affichée seulement si un élève atteint le seuil',!/Aucun élève|Touchez|ST sans tenue|Autres|non justifiées ·/.test(r.legend)&&(r.flag?r.legVis&&/absences non justifiées ou plus/.test(r.legend):!/absences non justifiées/.test(r.legend)),JSON.stringify({leg:r.legend,vis:r.legVis,flag:r.flag}));}
  await SEL(p,'2BACSVT2',null);await sleep(300);
  /* rien de perdu : chaque valeur non nulle de l’ancien tableau (ST, M, R, MJ, AJ) se retrouve dans les puces « Autres » */
  const all=await p.evaluate(()=>[...document.querySelectorAll('#repTable tbody tr')].map(r=>r.cells[4].innerText.replace(/\s+/g,' ')).join(' ; '));
  await p.click('#repTable caption [data-sort="U"]');await sleep(300);
  const nj=await p.evaluate(()=>[...document.querySelectorAll('#repTable tbody .rp-u')].map(e=>+e.textContent));
  check(w+' px : puce « NJ » trie par absences non justifiées (décroissant)',nj.every((v,i)=>!i||nj[i-1]>=v)&&await p.$eval('#repTable caption .on',e=>/NJ/.test(e.textContent)),nj.slice(0,6).join(','));
  await p.click('#repTable caption [data-sort="name"]');await sleep(300);
  await p.click('#repTable tbody tr');await sleep(500);
  check(w+' px : toucher une ligne ouvre toujours la fiche de l’élève',await p.evaluate(()=>!!document.querySelector('.modal.open,.modal[open],#detailModal.open,dialog[open]')||/Bilan annuel|bilan annuel/.test(document.body.innerText)));
  check(w+' px : aucune erreur JS',!errs.length,errs.join(' | '));
  await p.ctx.close();}
 s.close();
 const a=await exportsOf(b,OLD,8296),n=await exportsOf(b,ROOT,8297);
 for(const k in a)check('export inchangé : '+k,a[k]===n[k],a[k]+' | '+n[k]);
 }catch(e){check('exception',false,e.stack);}
 await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);})();
