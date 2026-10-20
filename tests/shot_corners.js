/* 1.29.1 (-j) : coins de l’icône TATABO3 — captures agrandies (×3) de l’icône en ligne dans le splash, l’en-tête, la connexion, la page d’accueil et l’écran du code ; contrôle : fond = tracé arrondi, rayon CSS 22 % partout. THEME=terrain|neon OUT=fichier */
const puppeteer=require('puppeteer-core'),fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D=process.env.DIR||'/workspace/cj-deploy',PORT=+process.env.PORT||8196,TH=process.env.THEME||'';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(PORT);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
const p=await b.newPage();await p.evaluateOnNewDocument(t=>{try{if(t)localStorage.setItem('cj.theme',t);}catch(e){}
  new MutationObserver(()=>{const s=document.getElementById('splash');if(s&&s.classList.contains('out')&&!window.__spDone)s.classList.remove('out');}).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});},TH);
await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:true});
await p.goto('http://localhost:'+PORT+'/',{waitUntil:'domcontentloaded'});await sleep(400);
const shots=[],chk=[];const tmp='/tmp/corners_'+(TH||'actuel');fs.mkdirSync(tmp,{recursive:true});
async function grab(sel,lab,pad){const e=await p.$(sel);if(!e){chk.push(lab+': ABSENT');return;}
  const r=await p.evaluate((s)=>{const e=document.querySelector(s);const b=e.getBoundingClientRect();const c=getComputedStyle(e);const u=e.querySelector('use');const sym=document.querySelector(u.getAttribute('href'));const bg=sym.firstElementChild;
    return {x:b.left,y:b.top,w:b.width,h:b.height,rad:c.borderTopLeftRadius,ov:c.overflow,bgTag:bg.tagName,bgD:bg.getAttribute('d')||'',rx:bg.getAttribute('rx')};},sel);
  const ok=r.bgTag==='path'&&/A22 22/.test(r.bgD)&&(r.rad==='22%'||Math.abs(parseFloat(r.rad)-0.22*r.w)<0.6);chk.push(lab+': '+(ok?'OK':'KO')+' r='+r.rad+' / '+Math.round(r.w)+'px');
  const f=tmp+'/'+shots.length+'.png';await p.screenshot({path:f,clip:{x:Math.max(0,r.x-pad),y:Math.max(0,r.y-pad),width:r.w+2*pad,height:r.h+2*pad}});shots.push([f,lab]);}
await p.evaluate(()=>document.getAnimations().forEach(a=>{try{a.finish();}catch(e){}}));await sleep(200);
await grab('#splash .sp-logo','splash',22);
await p.evaluate(()=>{window.__spDone=1;window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();});await sleep(900);
await grab('.ln-art svg.t3m','page d’accueil',22);await grab('.ln-brand svg.t3m','accueil (barre)',10);
await p.evaluate(()=>{const x=document.querySelector('[data-ln=login]');x&&x.click();});await sleep(900);await grab('#gate svg.g-logo','connexion',18);
await p.evaluate(()=>{document.documentElement.className=document.documentElement.className.replace(/\bcj-(land|locked|gate)\S*/g,'');document.querySelectorAll('#splash,#gate,#landing,.ln').forEach(e=>e.style.display='none');scrollTo(0,0);});await sleep(500);
await grab('header.top .h-logo','en-tête',10);
await p.evaluate(()=>{const t=document.querySelector('#tabs button[data-tab="settings"]');t&&t.click();});await sleep(400);await p.evaluate(()=>{const s=document.getElementById('secOn');s&&s.click();});await sleep(900);
await grab('#cjLock svg.t3m','écran du code',18);
console.log(chk.join('\n'));fs.writeFileSync(tmp+'/list.json',JSON.stringify(shots));
const out=process.env.OUT||'/tmp/corners.png';
cp.execSync(`python3 - <<'P'
import json
from PIL import Image,ImageDraw,ImageFont
L=json.load(open('${tmp}/list.json'));F=ImageFont.truetype('/workspace/tatabo3-logos/fonts/Poppins-SemiBold.ttf',30)
ims=[(Image.open(f),l) for f,l in L];H=300
row=[(im.resize((round(im.width*H/im.height),H)),l) for im,l in ims]
W=sum(i.width for i,_ in row)+30*(len(row)+1);im=Image.new('RGB',(W,H+110),'#FFFFFF');d=ImageDraw.Draw(im);x=30
d.text((30,10),'Coins de l’icône — thème ${({'':'Actuel',terrain:'Vert terrain',neon:'Néon sport'})[TH]}',fill='#0B3A6E',font=F)
for i,l in row:
  im.paste(i,(x,60));d.text((x,H+68),l,fill='#334155',font=F);x+=i.width+30
im.save('${out}')
P`);
await b.close();srv.close();process.exit(chk.every(c=>/OK/.test(c))&&chk.length===6?0:1);})();
