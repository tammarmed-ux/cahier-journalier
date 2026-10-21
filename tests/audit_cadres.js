/* 1.29.2 (d) : audit des champs (WebKit, iPhone 375/390, 3 thèmes) — débordements, hauteurs, rayons */
const {webkit,devices}=require('/workspace/pw/node_modules/playwright');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',D='/workspace/cj-deploy';const SHOT=process.env.SHOTDIR||'';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8034);
const OLD=fs.readFileSync('/workspace/backups/data-AVANT-1.29.1-20261020.json','utf8');
const MEAS=()=>{const out=[];const vw=document.documentElement.clientWidth;if(document.documentElement.scrollWidth>vw+1||document.body.scrollWidth>vw+1)out.push('PAGE-LARGE '+document.documentElement.scrollWidth+'>'+vw);
 const els=[...document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=file]):not([type=hidden]),select,textarea')].filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0&&getComputedStyle(e).visibility!=='hidden';});
 for(const e of els){const r=e.getBoundingClientRect();const box=e.closest('.card,.pq-pan,.ttform,#gate,.ps-card,form,dialog,.sheet')||document.body;const b=box.getBoundingClientRect();
  const nm=(e.id||e.className||e.name||e.type).toString().slice(0,30)+'['+(e.type||e.tagName)+']';
  let scroller=null;for(let a=e.parentElement;a&&a!==document.body;a=a.parentElement){const o=getComputedStyle(a).overflowX;if(o==='auto'||o==='scroll'){scroller=a;break;}}
  if(!scroller&&(r.right>Math.min(b.right,vw)+0.5||r.left<Math.max(b.left,0)-0.5))out.push('DEBORDE '+nm+' '+Math.round(r.left)+'→'+Math.round(r.right)+' cadre '+Math.round(b.left)+'→'+Math.round(b.right));
  const p=e.parentElement,pr=p.getBoundingClientRect();if(e.scrollWidth>e.clientWidth+2&&/date|time/.test(e.type))out.push('CONTENU '+nm);
 }
 const rows={};for(const e of els){const r=e.getBoundingClientRect();const g=e.closest('.ttgrid,.row2,.cy-in,.grid2');if(!g)continue;const k=(g.id||g.className)+'@'+Math.round(r.top/4);(rows[k]=rows[k]||[]).push([e.id||e.type,Math.round(r.height),Math.round(r.width)]);}
 for(const k in rows){const h=rows[k].map(x=>x[1]);if(Math.max(...h)-Math.min(...h)>2)out.push('HAUTEURS '+k+' '+JSON.stringify(rows[k]));}
 return out;};
(async()=>{const b=await webkit.launch();const all={};
for(const W of [375,390])for(const th of ['','terrain','neon']){
 const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:W,height:812}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.dismiss());
 await p.addInitScript(([K,o])=>{if(!localStorage.getItem(K)){localStorage.setItem(K,o);}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},[KEY,OLD]);
 await p.goto('http://localhost:8034/?emu=1',{waitUntil:'networkidle'});const tag=W+(th?'-'+th:'');
 const setTh=()=>p.evaluate(t=>{if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);
 await setTh();await sleep(400);
 // écran de connexion (gate) tel qu’affiché
 const rec=async(n,sh)=>{const r=await p.evaluate(MEAS);all[tag+' '+n]=r;if(SHOT&&sh)await p.screenshot({path:SHOT+sh+(th?'-'+th:'')+'-'+W+'.png'});};
 await p.evaluate(()=>{const g=document.getElementById('gate');if(g)g.style.display='';});await rec('connexion','connexion');
 await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
 const tab=async t=>{await p.evaluate(t=>{window.CJPS&&CJPS.close&&CJPS.close();document.querySelector('#tabs button[data-tab="'+t+'"]').click();},t);await sleep(500);};
 for(const t of ['home','students','attendance','proc','reports']){await tab(t);await rec(t);}
 await tab('students');const add=await p.evaluate(()=>{const x=document.querySelector('#students [data-add],#addStudent,#stAdd,button.fab,#fabAdd');if(x){x.click();return x.id||x.className;}return '';});await sleep(500);await rec('fiche-eleve:'+add,'eleve');
 await p.keyboard.press('Escape');
 await tab('settings');const keys=await p.evaluate(()=>[...document.querySelectorAll('[data-ps]')].map(x=>x.getAttribute('data-ps')));
 for(const k of keys){await p.evaluate(k=>{CJPS.close&&CJPS.close();CJPS.open(k);},k);await sleep(350);await rec('param:'+k);
  if(k==='hol'){await p.click('#holNew');await sleep(200);await rec('param:hol-form','feries-form-jour');await p.click('#holAllDay');await sleep(200);await p.evaluate(()=>document.getElementById('holFrom').scrollIntoView({block:'center'}));await rec('param:hol-form-heures','feries-form-fix');}
  if(k==='annee'){const c=await p.$('.cy-card[data-i="1"] .cy-d');if(c){await c.click();await sleep(300);await rec('param:annee-edit','annee-edit');}}
 }
 await p.evaluate(()=>{CJPS.close&&CJPS.close();});
 const tt=await p.evaluate(()=>{const x=document.querySelector('[data-ttadd]');if(!x)return false;CJPS.open&&[...document.querySelectorAll('[data-ps]')].forEach(()=>0);return true;});
 const ttk=await p.evaluate(()=>{const c=document.getElementById('ttCard');return c&&c.getAttribute('data-ps');});
 if(ttk){await p.evaluate(k=>CJPS.open(k),ttk);await sleep(300);await p.evaluate(()=>document.querySelector('[data-ttadd]').click());await sleep(400);await rec('creneau-form','creneau');}
 if(errs.length)all[tag+' ERREURS']=errs;await ctx.close();}
fs.writeFileSync('/workspace/audit/cadres.json',JSON.stringify(all,null,1));
const U={};for(const k in all)for(const x of all[k]){const z=String(x).replace(/\d+→\d+/g,'#');(U[z]=U[z]||[]).push(k);}for(const z in U)console.log(z,' <= '+U[z].length+'x : '+[...new Set(U[z].map(k=>k.split(' ').slice(1).join(' ')))].join(', '));console.log('DONE');await b.close();srv.close();})();
