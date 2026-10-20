/* 1.29.1 (-k) : intro sous WebKit (MID=1 : image figée au milieu de l’animation d’entrée) (moteur de Safari, iPhone 14 émulé) — capture agrandie de l’icône du splash. DIR, THEME, OUT */
const {webkit,devices}=require('playwright'),fs=require('fs'),http=require('http'),path=require('path');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8197,TH=process.env.THEME||'';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{const b=await webkit.launch();const c=await b.newContext({...devices['iPhone 14'],serviceWorkers:'block'});const p=await c.newPage();
await p.addInitScript(t=>{try{if(t)localStorage.setItem('cj.theme',t);}catch(e){}const rc=Node.prototype.removeChild;Node.prototype.removeChild=function(n){if(n&&n.id==='splash')return n;return rc.call(this,n);};new MutationObserver(()=>{const s=document.getElementById('splash');if(s&&s.classList.contains('out'))s.classList.remove('out');}).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});},TH);
await p.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});await p.waitForTimeout(500);
if(process.env.MID)await p.evaluate(()=>document.getAnimations().forEach(a=>{try{a.pause();a.currentTime=450;}catch(e){}}));else await p.evaluate(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}}));await p.waitForTimeout(1500);
const e=await p.$('#splash .sp-logo');const r=await e.boundingBox();const pad=26;
await p.screenshot({path:process.env.OUT||'/tmp/wk.png',clip:{x:r.x-pad,y:r.y-pad,width:r.width+2*pad,height:r.height+2*pad}});
console.log(JSON.stringify({ua:await p.evaluate(()=>navigator.userAgent.slice(0,60)),th:await p.evaluate(()=>document.documentElement.getAttribute('data-theme')),r}));await b.close();srv.close();})();
