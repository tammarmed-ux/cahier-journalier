/* 1.29.1 (-v) : captures des fonds sport (intro, page d’accueil, connexion) par thème */
const puppeteer=require('/workspace/cj-emu/node_modules/puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');
const D='/workspace/cj-deploy',OUT='/workspace/backups/v1.29.1-preview/';const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp4':'video/mp4','.webmanifest':'application/manifest+json','.ttf':'font/ttf','.jpg':'image/jpeg'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(8025);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--autoplay-policy=user-gesture-required']});const errs=[];
for(const [th,nm] of [['','actuel'],['neon','neon'],['terrain','vert']])for(const vp of [{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true,sfx:''},{width:1280,height:800,deviceScaleFactor:1,sfx:'-bureau'}]){
 const ctx=await b.createBrowserContext();
 const pi=await ctx.newPage();await pi.setViewport(vp);await pi.evaluateOnNewDocument(th=>{try{if(th)localStorage.setItem('cj.theme',th);localStorage.setItem('cahier.authOk',JSON.stringify({uid:'x',ok:true}));}catch(e){}},th);
 await pi.goto('http://localhost:8025/',{waitUntil:'domcontentloaded'});await pi.waitForSelector('#splash');await sleep(900);await pi.screenshot({path:OUT+'fond-'+nm+'-intro'+vp.sfx+'.png'});await pi.close();
 const c2=await b.createBrowserContext();await ctx.close();const p=await c2.newPage();p.on('pageerror',e=>errs.push(e.message));await p.setViewport(vp);
await p.evaluateOnNewDocument(th=>{try{if(th)localStorage.setItem('cj.theme',th);}catch(e){}},th);
 await p.goto('http://localhost:8025/',{waitUntil:'networkidle2'});await p.evaluate(()=>window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash());await sleep(900);
 await p.screenshot({path:OUT+'fond-'+nm+'-landing'+vp.sfx+'.png'});
 if(!vp.sfx){await p.evaluate(()=>window.CJLanding&&CJLanding.toLogin&&CJLanding.toLogin());await sleep(700);await p.screenshot({path:OUT+'fond-'+nm+'-connexion.png'});}
 await c2.close();}
console.log('errs',errs.length,errs.join('|').slice(0,300));srv.close();await b.close();})();
