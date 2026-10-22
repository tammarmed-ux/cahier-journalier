/* Preuve : export réel (lycée) — notes /20 et notes procédurales identiques HEAD ca921ed vs 1.29.2 (j), pour chaque classe × cycle */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),crypto=require('crypto');
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const serve=(D,port)=>http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(port);
const DATA=fs.readFileSync(process.env.DATA||'/workspace/backups/data-APRES-1.29.1-20261020.json','utf8');
async function run(b,root,port,isNew){const s=serve(root,port);const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:1200,height:900});
 await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();(u.startsWith('http://localhost:'+port)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
 await p.evaluateOnNewDocument(o=>{if(!sessionStorage.getItem('s')){localStorage.clear();localStorage.setItem('classRegister.v2',o);sessionStorage.setItem('s','1');}localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));},DATA);
 await p.goto('http://localhost:'+port+'/?emu=1',{waitUntil:'networkidle2'});await p.evaluate(()=>{CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');window.CJGateOpen=true;});
 if(isNew)await p.waitForFunction(()=>CJR.cxMode,{timeout:10000});await new Promise(r=>setTimeout(r,1500));
 const out=await p.evaluate(async()=>{const d=CJR.db(),R=CJR,o={grades:{},views:{}};const tab=t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click();const w=()=>new Promise(r=>setTimeout(r,30));
  for(const c of d.classes)for(let pi=0;pi<d.periods.length;pi++){const sp=R.gradeSpec(c.id,pi);o.grades[c.name+'|'+pi]={sp:[sp.aps,sp.lv,sp.procMax,sp.comp,sp.total,sp.cols.map(k=>k.k+':'+k.max).join()],cap:R.capOf(c.id)};
    d.ui.cls=c.id;d.ui.per=pi;tab('attendance');R.cx?R.cx.render():0;await w();o.views['att|'+c.name+'|'+pi]=document.getElementById('view-attendance').innerHTML;
    tab('proc');await w();o.views['proc|'+c.name+'|'+pi]=document.getElementById('view-proc')?document.getElementById('view-proc').innerHTML:document.querySelector('.view.active').innerHTML;}
  o.json=CJApp.getJSON();return o;});
 await ctx.close();s.close();return out;}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
 const A=await run(b,'/tmp/cj-head',8051,false),B=await run(b,'/workspace/cj-deploy',8052,true);
 const keys=Object.keys(A.views);/* 1.29.2 (k) : seul ajout visible voulu = suffixe de niveau « · TC » dans les <option> des sélecteurs de classe ; retiré avant comparaison (les notes, elles, sont comparées strictement) */const sx=v=>v.replace(/ · (?:TC|1BAC|2BAC|1AC|2AC|3AC|Niveau \?)<\/option>/g,'</option>');let nsx=0;keys.forEach(k=>{if(sx(B.views[k])!==B.views[k])nsx++;B.views[k]=sx(B.views[k]);});console.log('vues avec suffixe de niveau retiré :',nsx);let dv=keys.filter(k=>A.views[k]!==B.views[k]);let dg=Object.keys(A.grades).filter(k=>JSON.stringify(A.grades[k])!==JSON.stringify(B.grades[k]));
 const h=x=>crypto.createHash('sha256').update(x).digest('hex').slice(0,16);
 const nStu=JSON.parse(DATA).students.length;
 const rep={data:process.env.DATA||'data-APRES-1.29.1-20261020.json',students:nStu,classes:JSON.parse(DATA).classes.length,cells:keys.length,gradeSpecs:Object.keys(A.grades).length,viewsDiff:dv,gradesDiff:dg,jsonSame:A.json===B.json,hashViewsHead:h(keys.map(k=>A.views[k]).join()),hashViewsNew:h(keys.map(k=>B.views[k]).join())};
 console.log(JSON.stringify(rep,null,1));fs.writeFileSync('/workspace/college-impl/preuve-lycee.json',JSON.stringify(rep,null,1));
 if(dv.length){const k=dv[0];const a=A.views[k],c=B.views[k];let i=0;while(a[i]===c[i])i++;console.log('first diff',k,a.slice(i-80,i+80),'\n VS \n',c.slice(i-80,i+80));}
 await b.close();})();
