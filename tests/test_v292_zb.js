/* 1.29.2 (zb) : numéro de version retiré de l’en-tête (téléphone) et du haut de la barre latérale (ordinateur) ; logo T3 et nom TATABO3
   centrés verticalement l’un avec l’autre, ligne « E. Tammar Mohamed - … » alignée sous le logo ; version toujours dans Paramètres › À propos. Affichage seulement. Port 8240. */
const puppeteer=require('puppeteer-core');const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');
const D='/workspace/cj-deploy',PORT=8240,OUT=process.env.SHOTS||'';serve(D,PORT);
let pass=0,fail=0;const check=(n,ok,x)=>{ok?pass++:fail++;console.log((ok?'PASS':'FAIL')+' - '+n+(ok?'':' '+JSON.stringify(x)));};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 for(const [w,h,theme] of [[390,844,''],[360,740,'neon'],[390,844,'terrain'],[1280,800,''],[1440,900,'neon']]){const p=await open(b,PORT,{w,h,theme});await tab(p,'home');await sleep(1200);
  const tag=' — '+w+' px'+(theme?' '+theme:'');
  const r=await p.evaluate(()=>{const R=e=>{if(!e||!e.getClientRects().length)return null;const c=e.getBoundingClientRect();return {l:c.left,t:c.top,r:c.right,b:c.bottom,cy:(c.top+c.bottom)/2};};
   const pc=document.documentElement.classList.contains('cj-dk'),root=pc?document.querySelector('#dkSide .dk-brand'):document.querySelector('header.top');
   const vis=[...document.querySelectorAll('.h-ver')].filter(e=>e.getClientRects().length&&e.getBoundingClientRect().width>0).length;
   const txt=[...document.querySelectorAll('header.top,#dkSide')].map(e=>e.innerText).join(' ');
   return {pc,vis,ver:/v1\.29|1\.29\.2/.test(txt),logo:R(root.querySelector('.h-logo')),wm:R(root.querySelector('.wm')),sub:pc?null:R(document.getElementById('hdrSub')),subTxt:document.getElementById('hdrSub').textContent,
    pill:pc?null:R(document.getElementById('syncPill')),sw:document.documentElement.scrollWidth-innerWidth};});
  check('numéro de version absent de l’en-tête'+(w>=1024?' et de la barre latérale':'')+tag,!r.vis&&!r.ver,r);
  check('logo T3 et nom TATABO3 centrés verticalement l’un avec l’autre (±1 px)'+tag,r.logo&&r.wm&&Math.abs(r.logo.cy-r.wm.cy)<=1&&r.wm.l>r.logo.r,r);
  if(!r.pc){check('ligne « '+r.subTxt+' » sous le logo (écart ≥ 4 px), alignée à gauche avec lui ; logo centré avec le bouton « Local »'+tag,r.sub&&r.sub.t-r.logo.b>=4&&Math.abs(r.sub.l-r.logo.l)<=1&&Math.abs(r.pill.cy-r.logo.cy)<=2&&r.wm.r<r.pill.l&&r.sw<=0,r);}
  else check('PC : logo bien placé dans le haut de la barre latérale, sans débordement'+tag,r.logo.l>=8&&r.sw<=0,r);
  await tab(p,'settings');await sleep(600);
  const v=await p.evaluate(()=>{const e=document.getElementById('verLine');return e&&e.textContent;});
  check('version toujours indiquée dans Paramètres (« '+v+' »)'+tag,/^Version 1\.29\.2/.test(v||''),v);
  check('aucune erreur JS'+tag,!p.errs.length,p.errs);
  if(OUT&&!theme){await tab(p,'home');await sleep(600);await p.evaluate(()=>scrollTo(0,0));await sleep(200);
   await p.screenshot({path:OUT+(w<600?'/entete-'+w+'.png':'/barre-laterale-haut-'+w+'.png'),clip:w<600?{x:0,y:0,width:w,height:160}:{x:0,y:0,width:640,height:260}});}
  await p.ctx.close();}
 console.log(pass+'/'+(pass+fail)+' passed');await b.close();process.exit(fail?1:0);})();
