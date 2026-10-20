/* 1.29.1 (-l) : contrastes AA de la page d’accueil publique (entière) et de l’écran de connexion, par thème (fonction scan() reprise de scan_full.js). THEMES=,terrain,neon SHOTS=dossier */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8198,THEMES=(process.env.THEMES||',terrain,neon').split(','),O=process.env.SHOTS||'';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const SF=fs.readFileSync(__dirname+'/scan_full.js','utf8');const SCAN=SF.slice(SF.indexOf('const scan=()=>p.evaluate(')+'const scan=()=>p.evaluate('.length,SF.indexOf('\nconst go='));const fn=SCAN.slice(0,SCAN.lastIndexOf(');'));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});let total=0;
for(const th of THEMES){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.evaluateOnNewDocument(t=>{try{if(t)localStorage.setItem('cj.theme',t);}catch(e){}},th);
  await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});await p.goto('http://localhost:'+PORT+'/',{waitUntil:'networkidle2'});await sleep(500);
  await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();});await sleep(900);
  const scan=()=>p.evaluate('('+fn+')()');
  await p.evaluate(()=>{window.__FULL=true;});const A=await scan();if(O)await p.screenshot({path:O+'/landing-'+(th||'actuel')+'.png'});
  await p.evaluate(()=>{const x=document.querySelector('[data-ln=login]');x&&x.click();});await sleep(900);await p.evaluate(()=>{window.__FULL=true;});const G=await scan();if(O)await p.screenshot({path:O+'/login-'+(th||'actuel')+'.png'});
  console.log('== '+(th||'actuel')+' : accueil '+A.length+' · connexion '+G.length+' texte(s) sous le seuil');[...A,...G].slice(0,25).forEach(x=>console.log('   ',x.r,'<',x.need,x.cls,'«'+x.t+'»',x.fg,x.bg));total+=A.length+G.length;await ctx.close();}
await b.close();srv.close();process.exit(total?1:0);})();
