/* 1.29.2 (e) : Classes B, Cycles et activités B, Points retirés A — 3 thèmes + vérifications (mêmes clés) */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',D='/workspace/cj-deploy',O='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8037);
const OLD=fs.readFileSync('/workspace/backups/data-AVANT-1.29.1-20261020.json','utf8');const res=[];const check=(n,ok,x)=>{res.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.evaluateOnNewDocument(o=>{if(!localStorage.getItem('classRegister.v2'))localStorage.setItem('classRegister.v2',o);localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},OLD);
await p.goto('http://localhost:8037/?emu=1',{waitUntil:'networkidle2'});
const prep=async th=>{await p.reload({waitUntil:'networkidle2'});await p.evaluate(t=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');document.querySelector('#tabs button[data-tab="settings"]').click();},th);await sleep(400);};
const open=async(k,sel)=>{await p.evaluate(k=>CJPS.open(k),k);await sleep(400);if(sel)await p.evaluate(s=>{const e=document.querySelector(s);e.scrollIntoView({block:'start'});window.scrollBy(0,-120);},sel);await sleep(250);};
const before=await p.evaluate(K=>localStorage.getItem(K),KEY);
for(const th of ['','terrain','neon']){const sx=th?'-'+th:'';await prep(th);
 await open('cls');check('classes '+(th||'actuel')+' : 9 cartes',await p.evaluate(()=>document.querySelectorAll('#clsManage .clb-card').length)===9);await p.screenshot({path:O+'classes-B'+sx+'.png'});
 await open('annee','#periodNames');check('cycles '+(th||'actuel')+' : 6 cartes',await p.evaluate(()=>document.querySelectorAll('#periodNames .cyb').length)===6);await p.screenshot({path:O+'cycles-B'+sx+'.png'});
 await open('pts');await p.screenshot({path:O+'points-A'+sx+'.png'});}
check('affichage seul : données inchangées après l’ouverture des 3 écrans',await p.evaluate(K=>localStorage.getItem(K),KEY)===before);
// interactions
await prep('');await open('cls');
await p.click('#clsManage .clb-card [data-clbed]');await sleep(300);await p.screenshot({path:O+'classes-B-edition.png'});
await p.evaluate(()=>{const i=document.querySelector('#clsManage .clb-card.ed .pwin');i.value='3';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
let r=await p.evaluate(()=>{const c=CJR.db().classes[0];return [c.pw,document.querySelector('#clsManage .clb-card .clb-sum').textContent];});check('S/sem modifié → c.pw=3, résumé à jour',r[0]===3&&/3 S\/sem/.test(r[1]),JSON.stringify(r));
await p.evaluate(()=>{const i=document.querySelector('#clsManage .clb-card.ed .pwin');i.value='2';i.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(200);
check('retour à 2 → clé pw supprimée comme avant',await p.evaluate(()=>!('pw' in CJR.db().classes[0])));
await p.click('#clbFlt [data-clbf="2BAC"]');await sleep(200);check('filtre 2BAC : 5 cartes visibles',await p.evaluate(()=>[...document.querySelectorAll('#clsManage .clb-card')].filter(x=>!x.hidden).length)===5);
await open('annee','#periodNames');await p.click('#periodNames .cyb[data-cyb="2"] [data-cybed]');await sleep(300);await p.evaluate(()=>{const e=document.querySelector('#periodNames .cyb.ed');e.scrollIntoView({block:'center'});});await sleep(200);
await p.screenshot({path:O+'cycles-B-edition.png'});
await p.click('#periodNames .cyb.ed [data-cyt="coll"]');await sleep(400);
r=await p.evaluate(()=>[CJR.db().evals.cyc&&CJR.db().evals.cyc[2],document.querySelector('#periodNames .cyb[data-cyb="2"] .cyb-tc .on').textContent]);check('type choisi → DB.evals.cyc[2]=coll (même clé), pastille active',r[0]==='coll'&&/Sport collectif/.test(r[1]),JSON.stringify(r));
await open('pts');const v0=await p.evaluate(()=>CJR.db().settings.points.A);await p.click('.pk-A [data-pstep="1"]');await sleep(200);
const v1=await p.evaluate(()=>CJR.db().settings.points.A);await p.click('.pk-A [data-pstep="-1"]');await sleep(200);const v2=await p.evaluate(()=>CJR.db().settings.points.A);
check('points A : ＋ → '+v1+', − → '+v2+' (pas 0,25, même clé settings.points.A)',v1===v0+0.25&&v2===v0,v0+'/'+v1+'/'+v2);
for(let i=0;i<5;i++)await p.click('.pk-J [data-pstep="-1"]');check('min 0',await p.evaluate(()=>CJR.db().settings.points.J)===0);
await p.evaluate(()=>{const i=document.getElementById('ptM');i.value='0.3';i.dispatchEvent(new Event('change',{bubbles:true}));});check('valeur précise 0,3 conservée',await p.evaluate(()=>CJR.db().settings.points.M)===0.3);
check('aucune erreur JS',!errs.length,errs.join('|'));
await b.close();srv.close();console.log(res.filter(x=>x).length+'/'+res.length+' passed');})();
