/* 1.29.2a : captures ⓘ de la note procédurale (PC 1280 / 1366, mobile 390) — noms fictifs */
const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');
const O='/workspace/backups/v1.29.2-preview/info-fix/',SFX=process.argv[2]||'avant',PORT=8244;
const srv=serve('/workspace/cj-deploy',PORT);
async function prep(p){await p.evaluate(()=>{const K='classRegister.v2',d=JSON.parse(localStorage.getItem(K));const c=d.classes.find(x=>/^2BAC/.test(x.name))||d.classes[0];
  const N=['AIT BENALI Yassine','BENNANI Salma','CHAKIR Omar','DAOUDI Imane','EL AMRANI Hamza','FASSI Nour','GHARBI Rayan','HAKIMI Lina'];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n,sex:i%2?'F':'G',sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));d.ui.cls=c.id;d.ui.per=1;localStorage.setItem(K,JSON.stringify(d));});
 await p.reload({waitUntil:'networkidle2'});await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.getElementById('gate').style.display='none';window.CJGateOpen=true;});await sleep(1500);
 await tab(p,'proc');await sleep(600);await p.evaluate(()=>{const c=document.querySelector('#procPeriods [data-p="1"]');c&&c.click();});await sleep(400);
 if(await p.$eval('#procAps',s=>s.value)!=='athle'){await p.select('#procAps','athle');await sleep(500);}
 const ev=await p.$$eval('#procEvt option',o=>o.map(x=>x.value).filter(Boolean));if(await p.$eval('#procEvt',s=>s.value)==='')await p.select('#procEvt',ev.find(v=>/poids|longueur|jav|disq/i.test(v))||ev[0]);await sleep(500);
 await p.evaluate(()=>document.getElementById('procEval').scrollIntoView({block:'center'}));await sleep(300);}
async function geo(p){return p.evaluate(()=>{const s=document.getElementById('procSheet'),pn=s&&s.querySelector('.pq-pan'),r=s.getBoundingClientRect(),q=pn.getBoundingClientRect();
 return {hidden:s.hidden,sheet:[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)],pan:[Math.round(q.left),Math.round(q.top),Math.round(q.width),Math.round(q.height)],vw:innerWidth,vh:innerHeight,ttl:(document.getElementById('procSheetT')||{}).textContent,
  vis:(()=>{const x=q.left+q.width/2,y=q.top+30;const e=document.elementFromPoint(x,y);return !!(e&&pn.contains(e));})()};});}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const out={};
 for(const [w,h] of [[1280,720],[1366,768],[390,844]]){const p=await open(b,PORT,{w,h,dpr:1});await prep(p);
  await p.screenshot({path:O+'note-proc-'+w+'-'+SFX+'.png'});await p.click('#procInfo');await sleep(500);
  out[w]=await geo(p);await p.screenshot({path:O+'info-'+w+'-'+SFX+'.png'});out[w].errs=p.errs.length;await p.ctx.close();}
 console.log(JSON.stringify(out));await b.close();srv.close();})();
