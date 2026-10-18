/* 1.29.1 (-o) : sports collectifs — pavé N1…N4 × N+/N/N- (Individuel, Collectif + résultat du match), gain identique pour l’équipe (groupe), anciennes notes conservées */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8016);
const URL='http://localhost:8016/?emu=1';
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());d.accept();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
const KEYS0=await p.evaluate(()=>Object.keys(localStorage).sort());
await p.evaluate((KEY)=>{const d=JSON.parse(localStorage.getItem(KEY));const c=d.classes.find(x=>x.name==='2BACSP4');d.periods[0]='Basket-ball';
  d.classes.push({id:'ctc1',name:'TCS1'});d.classes.push({id:'c1b',name:'1BACSE1'});
  const N=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','DAOUDI Imane'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13000000'+i,dob:'',parent:'',phone:'',notes:'',created:1}));
  d.students.push({id:'t0',classId:'ctc1',name:'TAZI Rim',sex:'F',sid:'M100000001',dob:'',parent:'',phone:'',notes:'',created:1});
  d.students.push({id:'u0',classId:'c1b',name:'ZOUBIR Ali',sex:'G',sid:'M100000002',dob:'',parent:'',phone:'',notes:'',created:1});
  d.students[3].ev={};d.students[3].ev[c.id+'|0']={g1:4.25,g2:3,aps:'coll',t:1};   /* ancienne note (sans niveau) */
  c.grp={names:['Rouge','Bleu'],of:{s0:0,s1:0,s2:1,s3:1},lock:false,at:1};
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const CID=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)).classes.find(x=>x.name==='2BACSP4').id,KEY);
const proc=async()=>{await p.evaluate(()=>document.querySelector('#tabs button[data-tab="proc"]').click());await sleep(400);};
const tapCell=async(sid,k)=>{await p.evaluate((sid,k)=>document.querySelector('#procWrap tr[data-sid="'+sid+'"] button.scb[data-k="'+k+'"]').click(),sid,k);await sleep(120);};
const pad=()=>p.evaluate(()=>({open:document.getElementById('scModal').classList.contains('open'),t:document.getElementById('scTitle').textContent,
  btn:[...document.querySelectorAll('#scPad button')].map(b=>b.textContent),hd:[...document.querySelectorAll('#scPad .h')].map(b=>b.textContent),
  padHidden:document.getElementById('scPad').classList.contains('hidden'),match:!document.getElementById('scMatch').classList.contains('hidden'),
  mOn:(document.querySelector('#scMatch button.on')||{}).dataset?.m||'',calc:document.getElementById('scCalc').textContent,sub:document.getElementById('scSub').textContent}));
const tapC=async c=>{await p.evaluate(c=>document.querySelector('#scPad button[data-c="'+c+'"]').click(),c);await sleep(150);};
const tapM=async m=>{await p.evaluate(m=>document.querySelector('#scMatch button[data-m="'+m+'"]').click(),m);await sleep(150);};
const ev=(sid,cid)=>p.evaluate((sid,cid)=>{const s=window.CJR.byId(sid);return s&&s.ev?s.ev[cid+'|0']||null:null;},sid,cid||CID);
const cellTxt=(sid,k)=>p.evaluate((sid,k)=>{const t=document.querySelector('#procWrap tr[data-sid="'+sid+'"] '+(k==='sub'?'td.sub':'button.scb[data-k="'+k+'"]'));return t?t.textContent:null;},sid,k);
const close=()=>p.evaluate(()=>{document.querySelector('#scModal [data-close]').click();});
await proc();
const h=await p.evaluate(()=>[...document.querySelectorAll('#procWrap thead th.t')].map(t=>t.textContent));
check('2BAC sport collectif : Individuel /7 + Collectif /7 = Procéd. /14',JSON.stringify(h)==='["Individuel/7","Collectif/7","Procéd./14"]',JSON.stringify(h));
const gi=await p.evaluate(()=>({b:document.querySelectorAll('#procWrap button.scb').length,i:document.querySelectorAll('#procWrap input.gin').length}));
check('cases Individuel / Collectif à toucher (pas de clavier)',gi.b===8&&gi.i===0,JSON.stringify(gi));
check('ancienne note conservée et affichée (4,25 + 3 = 7,25, sans code)',await cellTxt('s3','g1')==='4,25'&&await cellTxt('s3','g2')==='3'&&await cellTxt('s3','sub')==='7,25',[await cellTxt('s3','g1'),await cellTxt('s3','g2'),await cellTxt('s3','sub')].join(' '));
await tapCell('s0','g1');let P=await pad();
check('pavé Individuel ouvert : 4 colonnes N1…N4, 12 boutons',P.open&&P.hd.join()==='N1,N2,N3,N4'&&P.btn.length===12&&P.t==='AIT BENALI Yassine',JSON.stringify(P));
check('2BAC Individuel : N+ 1,5 · 3 · 5 · 7 / N 0,75 · 2,25 · 4 · 6 / N− 0 · 1,5 · 3 · 5',P.btn.join('|')==='N1+1,5|N2+3|N3+5|N4+7|N10,75|N22,25|N34|N46|N1−0|N2−1,5|N3−3|N4−5',P.btn.join('|'));
await tapC('N3+');let e0=await ev('s0');P=await pad();
check('toucher N3+ enregistre 5 (g1) + code N3+ et passe à l’élève suivant',e0&&e0.g1===5&&e0.sc1==='N3+'&&P.open&&P.t==='BENNANI Salma',JSON.stringify(e0)+' '+P.t);
await close();await sleep(150);
check('case Individuel : valeur + code',await cellTxt('s0','g1')==='5N3+',await cellTxt('s0','g1'));
await tapCell('s0','g2');P=await pad();
check('2BAC Collectif : N+ 1 · 2 · 3,5 · 5 / N 0,5 · 1,5 · 3 · 4,5 / N− 0 · 1 · 2,5 · 4',P.btn.join('|')==='N1+1|N2+2|N3+3,5|N4+5|N10,5|N21,5|N33|N44,5|N1−0|N2−1|N3−2,5|N4−4',P.btn.join('|'));
check('équipe indiquée (groupe Rouge)',/équipe Rouge/.test(P.sub),P.sub);
await tapC('N3');P=await pad();
check('Collectif : après le niveau → choix Victoire / Égalité / Défaite',P.match&&P.padHidden&&P.open&&P.t==='AIT BENALI Yassine',JSON.stringify(P));
const mT=await p.evaluate(()=>document.getElementById('scMatchT').textContent);check('titre du choix : équipe + attaque + défense N3 = 3',/équipe Rouge/.test(mT)&&/N3 = 3$/.test(mT),mT);
await tapM('E');e0=await ev('s0');P=await pad();
check('Égalité : Collectif = 3 + 1,5 = 4,5 (g2) ; scc 3, sc2 N3, scm E ; élève suivant',e0.g2===4.5&&e0.scc===3&&e0.sc2==='N3'&&e0.scm==='E'&&e0.g1===5&&P.t==='BENNANI Salma'&&!P.match,JSON.stringify(e0));
await tapC('N2');P=await pad();
check('coéquipier : résultat du match de l’équipe présélectionné (Égalité)',P.match&&P.mOn==='E',P.mOn);
await tapM('V');e0=await ev('s0');const e1=await ev('s1'),e2=await ev('s2');
check('Victoire pour s1 : 1,5 + 2 = 3,5',e1&&e1.g2===3.5&&e1.scm==='V',JSON.stringify(e1));
check('même gain pour toute l’équipe : s0 recalculé 3 + 2 = 5',e0.g2===5&&e0.scm==='V',JSON.stringify(e0));
check('autre équipe non modifiée',e2===null,JSON.stringify(e2));
P=await pad();check('détail du calcul affiché dans le pavé',P.t==='CHAKIR Omar'&&/= … \/ 14/.test(P.calc),P.calc);
await close();await sleep(150);
check('grille : Procéd. s0 = 5 + 5 = 10 ; case Collectif « 5 N3 · V »',await cellTxt('s0','sub')==='10'&&await cellTxt('s0','g2')==='5N3 · V',await cellTxt('s0','sub')+' / '+await cellTxt('s0','g2'));
const e3=await ev('s3');check('ancienne note de l’autre équipe intacte',e3&&e3.g1===4.25&&e3.g2===3&&!e3.scm,JSON.stringify(e3));
// Effacer
await tapCell('s2','g1');await tapC('N1-');await close();await sleep(120);await tapCell('s2','g1');await p.evaluate(()=>document.getElementById('scClear').click());await sleep(150);await close();
check('« Effacer la note » retire g1 et le code',await ev('s2')===null&&await cellTxt('s2','g1')==='–',JSON.stringify(await ev('s2')));
const free=async(sid,k,v)=>{await tapCell(sid,k);await p.evaluate(v=>{const i=document.getElementById('scFree');i.value=v;i.dispatchEvent(new Event('change',{bubbles:true}));},v);await sleep(150);await close();await sleep(100);};
await free('s3','g1','7,5');check('saisie libre hors barème refusée (7,5 sur /7) : ancienne note conservée',(await ev('s3')).g1===4.25);
await free('s3','g1','3,25');const e4=await ev('s3');check('saisie libre 3,25 : enregistrée sans code, case sans code',e4.g1===3.25&&!e4.sc1&&await cellTxt('s3','g1')==='3,25',JSON.stringify(e4));
await free('s3','g1','4,25');
// TC : exemple du barème
await p.evaluate(()=>{const s=document.getElementById('procCls')||null;});
await p.evaluate(()=>{window.CJR.db().ui.cls='ctc1';});await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();});await sleep(200);await proc();
const hT=await p.evaluate(()=>[...document.querySelectorAll('#procWrap thead th.t')].map(t=>t.textContent));
check('TC : Individuel /6 + Collectif /6 = /12',JSON.stringify(hT)==='["Individuel/6","Collectif/6","Procéd./12"]',JSON.stringify(hT));
await tapCell('t0','g1');P=await pad();
check('TC Individuel : N+ 1 · 2 · 4 · 6 / N 0,5 · 1,5 · 3,5 · 5,5 / N− 0 · 1 · 3 · 5',P.btn.join('|')==='N1+1|N2+2|N3+4|N4+6|N10,5|N21,5|N33,5|N45,5|N1−0|N2−1|N3−3|N4−5',P.btn.join('|'));
await tapC('N3');P=await pad();check('dernier élève : le pavé se ferme',!P.open);
await tapCell('t0','g2');P=await pad();
check('TC Collectif : N+ 1 · 2 · 3 · 4 / N 0,5 · 1,5 · 2,5 · 3,5',P.btn.slice(0,8).join('|')==='N1+1|N2+2|N3+3|N4+4|N10,5|N21,5|N32,5|N43,5',P.btn.join('|'));
check('élève sans groupe : gain pour lui seul (pas d’équipe affichée)',!/équipe/.test(P.sub),P.sub);
await tapC('N3');await tapM('E');
check('exemple du barème TC : 3,5 + 2,5 + 1,5 = 7,5 / 12',await cellTxt('t0','sub')==='7,5',await cellTxt('t0','sub'));
await tapCell('t0','g2');P=await pad();check('détail : « Individuel N3 3,5 + Collectif N3 2,5 + gain Égalité 1,5 = 7,5 / 12 »',P.calc==='Individuel N3 3,5 + Collectif N3 2,5 + gain Égalité 1,5 = 7,5 / 12',P.calc);
await close();
// 1BAC
await p.evaluate(()=>{window.CJR.db().ui.cls='c1b';});await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();});await sleep(200);await proc();
const hB=await p.evaluate(()=>[...document.querySelectorAll('#procWrap thead th.t')].map(t=>t.textContent));
check('1BAC : Individuel /6 + Collectif /7 = /13',JSON.stringify(hB)==='["Individuel/6","Collectif/7","Procéd./13"]',JSON.stringify(hB));
await tapCell('u0','g2');P=await pad();
check('1BAC Collectif : N3− 2,5 · N3 3 · N3+ 3,5 ; N4+ 5',P.btn.includes('N3−2,5')&&P.btn.includes('N33')&&P.btn.includes('N3+3,5')&&P.btn.includes('N4+5'),P.btn.join('|'));
await tapC('N4+');await tapM('V');check('1BAC : 5 + 2 = 7 = maximum Collectif',(await ev('u0','c1b')).g2===7,JSON.stringify(await ev('u0','c1b')));
// persistance / clés
await p.evaluate(()=>{window.CJR.db().ui.cls=window.CJR.db().classes.find(x=>x.name==='2BACSP4').id;});await p.evaluate(()=>{document.querySelector('#tabs button[data-tab="home"]').click();});await sleep(300);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const st=await p.evaluate(K=>{const d=JSON.parse(localStorage.getItem(K));return d.students.find(s=>s.id==='s0').ev;},KEY);
check('après rechargement : g1, g2 et champs additifs conservés (normEv)',JSON.stringify(st[CID+'|0'],['g1','g2','sc1','sc2','scc','scm'])==='{"g1":5,"g2":5,"sc1":"N3+","sc2":"N3","scc":3,"scm":"V"}',JSON.stringify(st));
const KEYS1=await p.evaluate(()=>Object.keys(localStorage).sort());
check('aucune nouvelle clé de stockage',KEYS1.every(k=>KEYS0.includes(k)||/^classRegister\.v2\.snapm?\.\d+$|^cahier\.snapDay$/.test(k))   /* seules les sauvegardes automatiques existantes */,JSON.stringify(KEYS1.filter(k=>!KEYS0.includes(k))));
await proc();check('après rechargement : grille affichée avec codes',await cellTxt('s0','g1')==='5N3+'&&await cellTxt('s0','g2')==='5N3 · V');
if(process.env.SHOTS){const O='/workspace/backups/v1.29.1-preview/';await p.evaluate(()=>{document.getElementById('procWrap').scrollIntoView({block:'start'});window.scrollBy(0,-20);});await sleep(200);await p.screenshot({path:O+'sc-grille.png'});
  await tapCell('s1','g1');await p.screenshot({path:O+'sc-pave-indiv.png'});await close();await sleep(100);
  await tapCell('s2','g2');await p.screenshot({path:O+'sc-pave-coll.png'});await tapC('N3+');await p.screenshot({path:O+'sc-pave-match.png'});await close();
  for(const T of ['neon','terrain']){await p.evaluate(T=>document.documentElement.setAttribute('data-theme',T),T);await sleep(150);await tapCell('s1','g2');await p.screenshot({path:O+'sc-pave-coll-'+(T==='neon'?'neon':'vert')+'.png'});await close();}
  await p.evaluate(()=>document.documentElement.removeAttribute('data-theme'));await sleep(100);}
// Notes /20 : saisie à la main → code retiré, total cohérent
await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(400);
const tot=await p.evaluate(()=>{const t=document.querySelector('#gridWrap tr[data-sid="s0"] td.tot');return t&&t.textContent;});
const ins=await p.evaluate(()=>[...document.querySelectorAll('#gridWrap tr[data-sid="s0"] input.gin')].map(i=>i.value));
check('Notes /20 : mêmes valeurs Individuel 5 / Collectif 5',ins[0]==='5'&&ins[1]==='5',JSON.stringify(ins)+' tot '+tot);
await p.evaluate(()=>{const i=document.querySelector('#gridWrap tr[data-sid="s0"] input.gin[data-k="g1"]');i.value='4,5';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(100);
const e9=await ev('s0');check('saisie à la main : g1 4,5, code N3+ retiré, collectif inchangé',e9.g1===4.5&&!e9.sc1&&e9.sc2==='N3'&&e9.g2===5,JSON.stringify(e9));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
