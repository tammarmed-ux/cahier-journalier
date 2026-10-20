/* 1.29.1 (-l) : captures iPhone (390×844 @3x) de la page d’accueil publique et de la connexion par thème : haut de page, fonctions, accès/sauvegarde, « Pour commencer ». THEME OUT=dossier PFX=préfixe */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8199,TH=process.env.THEME||'',O=process.env.OUT||'/tmp',X=process.env.PFX||(TH||'actuel');
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.evaluateOnNewDocument(t=>{try{if(t)localStorage.setItem('cj.theme',t);}catch(e){}},TH);
await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});await p.goto('http://localhost:'+PORT+'/',{waitUntil:'networkidle2'});await sleep(400);
await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();});await sleep(900);
await p.screenshot({path:O+'/'+X+'-landing.png'});
const at=async(sel,name)=>{await p.evaluate(s=>{const L=document.getElementById('landing');const e=document.querySelector(s);L.scrollTop=e.offsetTop;},sel);await sleep(400);await p.screenshot({path:O+'/'+X+'-landing-'+name+'.png'});};
await at('#fonctions','features');await at('.ln-trust','trust');await at('section[aria-labelledby=lnSTitle]','steps');
await p.evaluate(()=>{document.getElementById('landing').scrollTop=0;const x=document.querySelector('[data-ln=login]');x&&x.click();});await sleep(900);await p.screenshot({path:O+'/'+X+'-login.png'});
await b.close();srv.close();})();
