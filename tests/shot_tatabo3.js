/* 1.29.1 (-h/-i) : captures (THEME=terrain|neon : thème mémorisé) de la nouvelle identité TATABO3 (page d’accueil publique, connexion, splash) */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8091,O=process.env.OUT||'/tmp/t3';fs.mkdirSync(O,{recursive:true});
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();if(process.env.THEME)await p.evaluateOnNewDocument(t=>{try{localStorage.setItem('cj.theme',t);}catch(e){}},process.env.THEME);const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
await p.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});await sleep(700);await p.screenshot({path:O+'/splash.png'});
await sleep(3000);await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();});await sleep(800);await p.screenshot({path:O+'/landing.png'});
await p.evaluate(()=>{const x=document.querySelector('[data-ln=login]');x&&x.click();});await sleep(1500);await p.screenshot({path:O+'/login.png'});
const info=await p.evaluate(()=>({title:document.title,wm:[...document.querySelectorAll('img.wm')].map(i=>i.naturalWidth+'x'+i.naturalHeight+':'+i.getBoundingClientRect().height),icons:[...document.querySelectorAll('link[rel*=icon]')].map(l=>l.getAttribute('href'))}));
console.log(JSON.stringify(info),'errors',errs.length,errs.slice(0,2));await b.close();srv.close();})();
