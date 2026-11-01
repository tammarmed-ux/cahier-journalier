/* 1.29.2b : versions de l’emploi du temps — invariants sur les exports RÉELS (30/10 avant changement, 01/11 après changement).
   Comparaison avec le code 1.29.2a (tag backup-pre-1.29.2b, servi depuis CJ_OLD). Aucune donnée réelle n’est modifiée : tout se passe dans un navigateur de test. */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const fs=require('fs');
const NEW='/workspace/cj-deploy',OLD=process.env.CJ_OLD||'/tmp/cj292b_old',PN=8253,PO=8254,SH=process.env.SHOTS_EDT||'';
const s1=serve(NEW,PN),s2=serve(OLD,PO);
const A_RAW=fs.readFileSync('/workspace/backups/data-AVANT-1.29.2-20261030.json','utf8'),B_RAW=fs.readFileSync('/workspace/backups/data-APRES-changement-EDT-20261101.json','utf8');
const A=JSON.parse(A_RAW),B=JSON.parse(B_RAW);const AFILE='/tmp/edt_ancien_30-10.json';fs.writeFileSync(AFILE,A_RAW);
const R=[];function check(n,ok,x){R.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x&&!ok?' :: '+String(x).slice(0,600):''));}
const SNAP=()=>{const X=window.CJR,D=X.db();X.calReset&&X.calReset();const o={};Object.keys(D.sessions).sort().forEach(k=>{const [c,p,s]=k.split('|');const cols=X.colsOf(c,+p),NO=X.colNos(c,+p);let no=null;cols.forEach((x,i)=>{if(x.s===+s)no=NO[i];});o[k]=X.sessDate(c,+p,+s)+'#'+no;});return o;};
const grid=()=>{const X=window.CJR,D=X.db();X.calReset&&X.calReset();const o={};D.classes.forEach(c=>{for(let p=0;p<D.periods.length;p++)o[c.id+'|'+p]=X.colsOf(c.id,p).map(x=>(x.hol?'H':'S'+x.s)+'@'+x.date+(x.slot?x.slot.start:''));});return o;};
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const canon=o=>Array.isArray(o)?o.map(canon):(o&&typeof o==='object'?Object.keys(o).sort().reduce((r,k)=>(r[k]=canon(o[k]),r),{}):o);const ceq=(a,b)=>eq(canon(a),canon(b)); /* même contenu, ordre des clés indifférent (normalize() réécrit {id,…} comme en 1.29.2) */
const diffN=(a,b)=>Object.keys(a).filter(k=>a[k]!==b[k]).length;
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
try{
 /* 1. Sans historique : calcul identique à 1.29.2a, sur les deux exports réels (toutes les colonnes de toutes les classes/cycles) */
 for(const [nm,raw] of [['export 30/10',A_RAW],['export 01/11 (après changement)',B_RAW]]){
  const po=await open(b,PO,{w:1280,h:720,data:raw,now:'2026-11-01T22:30:00'}),pn=await open(b,PN,{w:1280,h:720,data:raw,now:'2026-11-01T22:30:00'});
  const go=await po.evaluate(grid),gn=await pn.evaluate(grid),so=await po.evaluate(SNAP),sn=await pn.evaluate(SNAP);
  check(nm+' : sans historique, toutes les colonnes (dates, fériés, index) identiques à 1.29.2a ('+Object.keys(gn).length+' grilles)',eq(go,gn));
  check(nm+' : dates et numéros S des '+Object.keys(sn).length+' séances identiques à 1.29.2a',eq(so,sn));
  const ex=await pn.evaluate(()=>JSON.parse(window.CJApp.getJSON()));check(nm+' : pas de champ ajouté si aucun historique (export identique)',!('ttPrev' in ex.cal));
  check(nm+' : aucune erreur JavaScript',!pn.errs.length,pn.errs.join('|'));await po.ctx.close();await pn.ctx.close();}
 /* référence « vérité » : export 01/11 calculé avec l’ANCIEN emploi du temps (comme avant le changement) par le code 1.29.2a */
 const Bold=JSON.parse(B_RAW);Bold.cal.tt=A.cal.tt;const po=await open(b,PO,{w:1280,h:720,data:JSON.stringify(Bold),now:'2026-11-01T22:30:00'});const TRUTH=await po.evaluate(SNAP);await po.ctx.close();
 /* 2. Retrouver l’ancien emploi du temps (fichier 30/10) dans l’application, mobile 390 puis ordinateur 1280 */
 for(const [w,h] of [[390,844],[1280,720]]){const p=await open(b,PN,{w,h,dpr:w<600?2:1,data:B_RAW,now:'2026-11-01T22:30:00'});const L=w+' px';
  const S0=await p.evaluate(()=>JSON.stringify(window.CJR.db().sessions)),ST0=await p.evaluate(()=>JSON.stringify(window.CJR.db().students)),EV0=await p.evaluate(()=>JSON.stringify(window.CJR.db().evals||null));
  const before=await p.evaluate(SNAP);check(L+' : situation actuelle — '+diffN(before,TRUTH)+' séances affichées avec une autre date/numéro qu’à l’origine',diffN(before,TRUTH)===41,diffN(before,TRUTH));
  await tab(p,'home');await sleep(500);const lk=await p.$('#ttRecBtn');check(L+' : lien « Retrouver l’ancien emploi du temps » visible sur la carte Emploi du temps',lk&&await p.evaluate(e=>!!e.offsetParent,lk));
  if(SH){await p.evaluate(()=>document.getElementById('ttCard').scrollIntoView({block:'start'}));await sleep(200);await p.screenshot({path:SH+'/apres-'+w+'-1-carte-lien.png'});}
  await p.evaluate(()=>document.getElementById('ttRecBtn').click());await sleep(800);
  const fi=await p.$('#ttrFile');await fi.uploadFile(AFILE);await sleep(900);
  const pv=await p.evaluate(()=>({t:(document.getElementById('ttrPv')||{}).innerText||'',d:(document.getElementById('ttrDate')||{}).value,ok:!document.getElementById('ttrOk').disabled}));
  check(L+' : aperçu — 41 séances retrouvent leur date, date proposée 02/11/2026 (lendemain du changement saisi le 01/11)',/41 séances/.test(pv.t)&&pv.d==='2026-11-02'&&pv.ok&&!/⚠/.test(pv.t),JSON.stringify(pv));
  const g=await p.evaluate(()=>{const q=document.querySelector('#ttVerSheet .pq-pan').getBoundingClientRect();return {l:q.left,w:q.width,t:q.top,h:q.height,vw:innerWidth,vh:innerHeight};});
  check(L+' : feuille lisible (entièrement visible)',g.t>=0&&g.t+g.h<=g.vh+1&&g.w>=Math.min(360,g.vw-20),JSON.stringify(g));
  if(SH)await p.screenshot({path:SH+'/apres-'+w+'-2-retrouver.png'});
  await p.evaluate(()=>document.getElementById('ttrOk').click());await sleep(700);
  const after=await p.evaluate(SNAP);check(L+' : après « Retrouver » — les 68 séances ont exactement leur date et leur numéro d’origine',eq(after,TRUTH),JSON.stringify(Object.keys(after).filter(k=>after[k]!==TRUTH[k]).map(k=>k+' '+after[k]+' ≠ '+TRUTH[k])));
  const S1=await p.evaluate(()=>JSON.stringify(window.CJR.db().sessions)),ST1=await p.evaluate(()=>JSON.stringify(window.CJR.db().students)),EV1=await p.evaluate(()=>JSON.stringify(window.CJR.db().evals||null));
  check(L+' : séances, marques, élèves, notes : octet pour octet inchangés',S0===S1&&ST0===ST1&&EV0===EV1);
  const ex=await p.evaluate(()=>JSON.parse(window.CJApp.getJSON()));const exNo=JSON.parse(JSON.stringify(ex));delete exNo.cal.ttPrev;const Bn=JSON.parse(B_RAW);
  check(L+' : seul ajout = cal.ttPrev (1 version jusqu’au 02/11, ancien emploi du temps 19 créneaux), cal.tt actuel inchangé',ex.cal.ttPrev.length===1&&ex.cal.ttPrev[0].until==='2026-11-02'&&ex.cal.ttPrev[0].tt.length===19&&ceq(ex.cal.tt,Bn.cal.tt)&&eq(Object.keys(ex).sort(),Object.keys(Bn).sort())&&eq(Object.keys(ex.cal).sort(),Object.keys(Bn.cal).concat('ttPrev').sort()),JSON.stringify({n:ex.cal.ttPrev.length,u:ex.cal.ttPrev[0].until,l:ex.cal.ttPrev[0].tt.length,tt:ceq(ex.cal.tt,Bn.cal.tt),k:Object.keys(ex.cal)}));
  const fut=await p.evaluate(()=>{const X=window.CJR,D=X.db(),c=D.classes.find(c=>c.name==='1BACSH1');return X.colsOf(c.id,1).filter(x=>x.date>='2026-11-02'&&x.date<='2026-11-06').map(x=>x.date+' '+(x.slot&&x.slot.start));});
  check(L+' : à partir du 02/11 le nouvel emploi du temps s’applique (1BACSH1 : mardi 11:00, jeudi 16:00)',eq(fut,['2026-11-03 11:00','2026-11-05 16:00']),JSON.stringify(fut));
  await sleep(300);const bn=await p.evaluate(()=>{const e=document.getElementById('ttVer');return e?e.innerText:'';});check(L+' : bandeau « Emploi du temps en vigueur depuis le 02/11/2026 »',/en vigueur depuis le 02\/11\/2026/.test(bn),bn);
  await p.evaluate(()=>document.querySelector('[data-ttv="old"]').click());await sleep(400);const ol=await p.evaluate(()=>(document.getElementById('ttVerOld')||{}).innerText||'');check(L+' : « Voir l’ancien » liste l’ancien emploi du temps',/2BACSP6/.test(ol)&&/Lundi/.test(ol),ol.slice(0,200));
  if(SH){await p.evaluate(()=>document.getElementById('ttVer').scrollIntoView({block:'center'}));await sleep(200);await p.screenshot({path:SH+'/apres-'+w+'-3-bandeau.png'});}
  /* rechargement : l’historique persiste */
  await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';});await sleep(1000);
  check(L+' : après rechargement, dates d’origine toujours là',eq(await p.evaluate(SNAP),TRUTH));
  check(L+' : aucune erreur JavaScript',!p.errs.length,p.errs.join('|'));
  /* 3. Ancienne version (1.29.2a) qui synchronise : le champ disparaît → copie locale le rétablit, rien d’autre ne change */
  if(w===1280){const raw=await p.evaluate(()=>window.CJApp.getJSON());const o=JSON.parse(raw);delete o.cal.ttPrev;
   const po2=await open(b,PO,{w:1280,h:720,data:raw,now:'2026-11-01T22:30:00'});const oldView=await po2.evaluate(SNAP);check('ancienne version 1.29.2a avec des données versionnées : s’ouvre sans erreur (affiche comme aujourd’hui)',!po2.errs.length&&eq(oldView,before),po2.errs.join('|'));await po2.ctx.close();
   await p.evaluate(j=>window.CJApp.applyJSON(j),JSON.stringify(o));await sleep(400);
   const healed=await p.evaluate(()=>({n:(window.CJR.db().cal.ttPrev||[]).length}));check('données reçues SANS le champ (ancienne version synchronisée) : historique rétabli depuis la copie locale',healed.n===1&&eq(await p.evaluate(SNAP),TRUTH),JSON.stringify(healed));
   const Ao=JSON.parse(A_RAW);Ao.classes=Ao.classes.map(c=>Object.assign({},c,{id:'X'+c.id}));Ao.students=[];Ao.sessions={};Ao.cal.tt=[];
   await p.evaluate(j=>window.CJApp.applyJSON(j),JSON.stringify(Ao));await sleep(300);check('… mais pas sur les données d’un autre compte (classes différentes)',!(window=>0)()&&(await p.evaluate(()=>(window.CJR.db().cal.ttPrev||[]).length))===0);}
  await p.ctx.close();}
 /* 4. Changement d’emploi du temps à une date future de l’année : invariant « séances passées inchangées » */
 const Bh=JSON.parse(B_RAW);Bh.cal.ttPrev=[{until:'2026-11-02',tt:A.cal.tt,at:1}];
 for(const w of [390,1280]){const p=await open(b,PN,{w,h:w<600?844:720,dpr:w<600?2:1,data:JSON.stringify(Bh),now:'2026-11-20T18:00:00'});const L=w+' px · 20/11';
  const g0=await p.evaluate(grid),s0=await p.evaluate(SNAP);await tab(p,'home');await sleep(500);
  const sid=await p.evaluate(()=>{const D=window.CJR.db(),c=D.classes.find(c=>c.name==='1BACSH1');return D.cal.tt.find(t=>t.classId===c.id&&t.day===2).id;});
  await p.evaluate(id=>{const t=window.CJR.db().cal.tt.find(x=>x.id===id);document.querySelector('#ttCard [data-ttjump="'+t.day+'"]').click();document.querySelector('[data-edit="'+id+'"]').click();},sid);await sleep(400);
  await p.evaluate(()=>{const s=document.getElementById('ttDay');s.value='6';s.dispatchEvent(new Event('change',{bubbles:true}));const a=document.getElementById('ttStart'),e=document.getElementById('ttEnd');a.value='08:00';e.value='09:00';});
  if(SH){await p.evaluate(()=>document.getElementById('ttForm').scrollIntoView({block:'center'}));await sleep(200);await p.screenshot({path:SH+'/apres-'+w+'-4-formulaire.png'});}
  await p.evaluate(()=>document.getElementById('ttSave').click());await sleep(600);
  const sh=await p.evaluate(()=>{const x=document.getElementById('ttVerSheet');return x&&!x.hidden?{t:document.getElementById('ttVerT').textContent,d:document.getElementById('ttvDate').value}:null;});
  check(L+' : « Enregistrer » demande la date d’application (proposée : aujourd’hui 20/11)',sh&&/À partir de quand/.test(sh.t)&&sh.d==='2026-11-20',JSON.stringify(sh));
  check(L+' : rien n’est modifié tant que la date n’est pas confirmée',eq(await p.evaluate(grid),g0));
  if(SH)await p.screenshot({path:SH+'/apres-'+w+'-5-date-application.png'});
  await p.evaluate(()=>document.getElementById('ttvOk').click());await sleep(700);
  const g1=await p.evaluate(grid),s1=await p.evaluate(SNAP),v=await p.evaluate(()=>window.CJR.db().cal.ttPrev.map(x=>x.until));
  const pastSame=Object.keys(g0).every(k=>{const a=g0[k].filter(x=>x.split('@')[1]<'2026-11-20'),b2=g1[k].filter(x=>x.split('@')[1]<'2026-11-20');return eq(a,b2);});
  check(L+' : toutes les colonnes avant le 20/11 identiques (toutes classes, tous cycles)',pastSame);
  check(L+' : les 68 séances enregistrées gardent date et numéro',eq(s0,s1));
  check(L+' : 3 versions (jusqu’au 02/11, jusqu’au 20/11, actuelle)',eq(v,['2026-11-02','2026-11-20']),JSON.stringify(v));
  const nx=await p.evaluate(()=>{const X=window.CJR,D=X.db(),c=D.classes.find(c=>c.name==='1BACSH1');return X.colsOf(c.id,2).concat(X.colsOf(c.id,1)).filter(x=>x.date>='2026-11-20'&&x.date<='2026-11-28').map(x=>x.date+' '+(x.slot&&x.slot.start));});
  check(L+' : après le 20/11, 1BACSH1 a cours le samedi 08:00 (au lieu du mardi)',nx.includes('2026-11-21 08:00')&&!nx.includes('2026-11-24 11:00'),JSON.stringify(nx));
  /* 2e modification le même jour : pas de nouvelle question */
  const sid2=await p.evaluate(()=>{const D=window.CJR.db(),c=D.classes.find(c=>c.name==='1BACSH1');return D.cal.tt.find(t=>t.classId===c.id&&t.day===4).id;});
  await p.evaluate(id=>{const t=window.CJR.db().cal.tt.find(x=>x.id===id);document.querySelector('#ttCard [data-ttjump="'+t.day+'"]').click();document.querySelector('[data-edit="'+id+'"]').click();},sid2);await sleep(300);await p.evaluate(()=>{document.getElementById('ttStart').value='14:00';document.getElementById('ttEnd').value='15:00';document.getElementById('ttSave').click();});await sleep(500);
  check(L+' : 2e modification le même jour → appliquée directement à la nouvelle version (pas de nouvelle question)',await p.evaluate(()=>{const x=document.getElementById('ttVerSheet');return (!x||x.hidden)&&window.CJR.db().cal.ttPrev.length===2;}));
  check(L+' : séances passées toujours inchangées',eq(await p.evaluate(SNAP),s0));
  /* « Appliquer l’actuel à toute l’année » retire la dernière version (après confirmation) */
  if(w===1280){p.removeAllListeners('dialog');p.on('dialog',d=>d.accept());await p.evaluate(()=>document.querySelector('[data-ttv="undo"]').click());await sleep(500);
   check('« Appliquer l’actuel à toute l’année » : retire seulement la dernière version',eq(await p.evaluate(()=>window.CJR.db().cal.ttPrev.map(x=>x.until)),['2026-11-02']));}
  check(L+' : aucune erreur JavaScript',!p.errs.length,p.errs.join('|'));await p.ctx.close();}
 /* 5. Avant le début de l’année : aucune question (comportement inchangé) ; option « Depuis le début de l’année » = ancien comportement */
 {const p=await open(b,PN,{w:1280,h:720,data:A_RAW,now:'2026-09-01T10:00:00'});await tab(p,'home');await sleep(400);
  const sid=await p.evaluate(()=>window.CJR.db().cal.tt.find(t=>t.type!=='as').id);await p.evaluate(id=>{const t=window.CJR.db().cal.tt.find(x=>x.id===id);document.querySelector('#ttCard [data-ttjump="'+t.day+'"]').click();document.querySelector('[data-edit="'+id+'"]').click();},sid);await sleep(300);
  await p.evaluate(()=>{document.getElementById('ttStart').value='07:00';document.getElementById('ttEnd').value='07:55';document.getElementById('ttSave').click();});await sleep(500);
  check('avant le début de l’année : enregistrement direct, aucun historique créé',await p.evaluate(()=>{const x=document.getElementById('ttVerSheet');return (!x||x.hidden)&&!('ttPrev' in window.CJR.db().cal);}));await p.ctx.close();}
 {const p=await open(b,PN,{w:1280,h:720,data:A_RAW,now:'2026-11-20T10:00:00'});await tab(p,'home');await sleep(400);
  const sid=await p.evaluate(()=>window.CJR.db().cal.tt.find(t=>t.type!=='as').id);await p.evaluate(id=>{const t=window.CJR.db().cal.tt.find(x=>x.id===id);document.querySelector('#ttCard [data-ttjump="'+t.day+'"]').click();document.querySelector('[data-edit="'+id+'"]').click();},sid);await sleep(300);
  await p.evaluate(()=>{document.getElementById('ttStart').value='07:00';document.getElementById('ttEnd').value='07:55';document.getElementById('ttSave').click();});await sleep(500);
  await p.evaluate(()=>{document.querySelector('input[name="ttvMode"][value="all"]').checked=true;document.getElementById('ttvOk').click();});await sleep(500);
  check('option « Depuis le début de l’année » : ancien fonctionnement, aucun historique créé',await p.evaluate(()=>!('ttPrev' in window.CJR.db().cal)&&window.CJR.db().cal.tt.some(t=>t.start==='07:00')));
  check('aucune erreur JavaScript',!p.errs.length,p.errs.join('|'));await p.ctx.close();}
}catch(e){check('exception',false,e.stack);}
await b.close();s1.close();s2.close();const n=R.filter(x=>x).length;console.log(n+'/'+R.length+' passed');process.exit(n===R.length?0:1);})();
