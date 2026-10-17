/* 1.29.1 (-i) : intro (splash) selon le thème — capture iPhone (390×844 @3x) de l’état final de l’animation. THEME=terrain|neon, OUT=fichier */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8195;
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf','.mp4':'video/mp4'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.evaluateOnNewDocument(t=>{try{if(t)localStorage.setItem('cj.theme',t);}catch(e){}
  /* garder l’intro affichée pour la capture */new MutationObserver(()=>{const s=document.getElementById('splash');if(s&&s.classList.contains('out'))s.classList.remove('out');}).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});},process.env.THEME||'');
await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
await p.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,300));
const first=await p.evaluate(()=>({th:document.documentElement.getAttribute('data-theme'),bg:getComputedStyle(document.getElementById('splash')).backgroundColor}));
await p.evaluate(()=>{const s=document.getElementById('splash');s.style.display='flex';s.style.opacity='1';document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}});});
await new Promise(r=>setTimeout(r,300));
const info=await p.evaluate(()=>{const g=e=>{const c=getComputedStyle(e);return {color:c.color,op:c.opacity};};return {name:g(document.querySelector('#splash .sp-name')),ver:g(document.querySelector('#splash .sp-ver')),wmA:getComputedStyle(document.documentElement).getPropertyValue('--wmA')};});
console.log(JSON.stringify({first,info}));await p.screenshot({path:process.env.OUT||'/tmp/splash.png'});await b.close();srv.close();})();
