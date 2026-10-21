/* 1.29.2 (d) : groupes (3 à 6) dans le bloc Absences, sans défilement horizontal de la page — WebKit iPhone 375/390, 3 thèmes */
const {webkit,devices}=require('/workspace/pw/node_modules/playwright');const fs=require('fs'),http=require('http'),path=require('path');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2',D='/workspace/cj-deploy',O='/workspace/backups/v1.29.2-preview/';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8035);
const OLD=JSON.parse(fs.readFileSync('/workspace/backups/data-AVANT-1.29.1-20261020.json','utf8'));
const res=[];const check=(n,ok,x)=>{res.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));};
(async()=>{const b=await webkit.launch();
for(const NG of [3,6])for(const W of [375,390])for(const th of ['','terrain','neon']){
 const d=JSON.parse(JSON.stringify(OLD));const c=d.classes[0];const st=d.students.filter(s=>s.classId===c.id);
 c.grp={names:Array.from({length:NG},(_,i)=>'Groupe '+(i+1)),of:Object.fromEntries(st.slice(0,st.length-2).map((s,i)=>[s.id,i%NG]))};d.ui.cls=c.id;d.ui.grp=true;d.ui.per=0;
 const ctx=await b.newContext({...devices['iPhone 13'],viewport:{width:W,height:812}});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.addInitScript(([K,o])=>{localStorage.setItem(K,o);localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},[KEY,JSON.stringify(d)]);
 await p.goto('http://localhost:8035/?emu=1',{waitUntil:'networkidle'});
 await p.evaluate(t=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';if(t)document.documentElement.setAttribute('data-theme',t);else document.documentElement.removeAttribute('data-theme');},th);
 await p.evaluate(()=>document.querySelector('#tabs button[data-tab="attendance"]').click());await sleep(700);
 const m=await p.evaluate(()=>{const vw=document.documentElement.clientWidth;const s=document.querySelector('#attGrp .gstrip');const sr=s&&s.getBoundingClientRect();const card=document.getElementById('attR2').closest('.card').getBoundingClientRect();
  return {vw,sw:document.documentElement.scrollWidth,bw:document.body.scrollWidth,chips:s?s.children.length:0,stripIn:!!sr&&sr.right<=card.right+0.5&&sr.left>=card.left-0.5,sw2:document.getElementById('attGrpOn')&&document.getElementById('attGrpOn').checked,label:s&&s.children[0].textContent};});
 const tag=NG+'g '+W+' '+(th||'actuel');
 check(tag+' : page sans défilement horizontal',m.sw<=m.vw&&m.bw<=m.vw,JSON.stringify(m));
 check(tag+' : '+NG+' pastilles compactes dans leur bande, toggle « Par groupe » conservé',m.chips>=NG&&m.stripIn&&m.sw2===true&&/^G1 · \d+$/.test(m.label),m.label);
 await p.evaluate(()=>window.scrollTo(0,0));await sleep(150);
 await p.screenshot({path:O+'groupes-fix-'+NG+'g-'+W+(th?'-'+th:'')+'.png'});
 check(tag+' : aucune erreur JS',!errs.length,errs.join('|'));await ctx.close();}
await b.close();srv.close();console.log(res.filter(x=>x).length+'/'+res.length+' passed');})();
