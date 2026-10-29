/* 1.29.2 (z) : barre latérale ordinateur — affichage seulement.
   1. bouton réduire/agrandir : icône SVG « barre latérale » (panel-left / panel-left-open, trait blanc), plus de chevrons « / », libellés
      « Réduire la barre » / « Agrandir la barre » ; bascule au VRAI clic (Chrome souris + WebKit), 1280 px, 3 thèmes, agrandie et réduite, même taille 32 px.
   2. menu latéral : aucune barre de défilement visible ; tient sans défiler à 1366×768 et 1280×720 (100 % et 125 %), agrandi et réduit ;
      la molette fait toujours défiler s’il manque de place ; aucun 2e ascenseur à côté de la barre.
   3. téléphone 390 px : desk.js non chargé (inchangé).
   4. écran d’accès (#gate), accueil intégré (#landing), code PIN (#cjLock) : UNE seule barre de défilement (celle de l’écran), la page masquée derrière ne défile plus
      (avant : html overflow-x:clip ⇒ body{overflow:hidden} sans effet ⇒ ascenseur du navigateur + ascenseur de l’écran) ; application ouverte : un seul ascenseur (le navigateur) ;
      390 px / iPhone : rendu identique au pixel près. Chrome lancé AVEC barres de défilement visibles. Port 8233.
   Usage : NODE_PATH=<puppeteer-core>:<playwright> node tests/test_v292_z.js */
const {serve,open,sleep}=require('/workspace/cj-emu/pc_h.js');const puppeteer=require('puppeteer-core');const {webkit}=require('playwright');const {wopen}=require('/workspace/cj-emu/wk_h.js');
const fs=require('fs'),path=require('path');const D=path.resolve(__dirname,'..'),PORT=8233,BASE='http://localhost:'+PORT+'/';serve(D,PORT);
let pass=0,fail=0;function check(n,ok,info){if(ok){pass++;console.log('ok   - '+n);}else{fail++;console.log('FAIL - '+n+(info!==undefined?' :: '+JSON.stringify(info).slice(0,900):''));}}
const OUT=process.env.SHOTS||'';
const BTN=()=>{const b=document.querySelector('#dkSide .dk-col'),s=b&&b.querySelector('svg'),r=b.getBoundingClientRect(),cs=s&&getComputedStyle(s);const t=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
 return{mini:document.documentElement.classList.contains('dk-mini'),w:Math.round(document.getElementById('dkSide').getBoundingClientRect().width),key:localStorage.getItem('tatabo3.desk.mini'),
  txt:b.textContent.trim(),svg:!!s,rect:!!(s&&s.querySelector('rect')),divider:!!(s&&s.querySelector('path[d="M9 3v18"]')),arrow:!!(s&&s.querySelector('path[d="m14 9 3 3-3 3"]')),ico:b.getAttribute('data-ico'),
  stroke:cs&&cs.stroke,color:cs&&cs.color,aria:b.getAttribute('aria-label'),title:b.title,exp:b.getAttribute('aria-expanded'),bw:Math.round(r.width),bh:Math.round(r.height),hit:!!t&&(t===b||b.contains(t)),cx:r.left+r.width/2,cy:r.top+r.height/2};};
const okExp=s=>!s.mini&&s.w===248&&s.svg&&s.rect&&s.divider&&!s.arrow&&s.ico==='panel-left'&&s.aria==='Réduire la barre'&&s.title==='Réduire la barre'&&s.exp==='true';
const okMini=s=>s.mini&&s.w===76&&s.svg&&s.rect&&s.divider&&s.arrow&&s.ico==='panel-left-open'&&s.aria==='Agrandir la barre'&&s.title==='Agrandir la barre'&&s.exp==='false'&&s.key==='1';
/* 2zc : trait = couleur du texte de la barre (blanc ; Néon sport #F5F7FA) */
const INK=/rgb\((255, 255, 255|245, 247, 250)\)/;
const common=s=>s.txt===''&&s.bw===32&&s.bh===32&&s.hit&&INK.test(s.color)&&(INK.test(s.stroke)||s.stroke==='currentcolor'||s.stroke==='currentColor');
const NAV=()=>{const n=document.getElementById('tabs'),cs=getComputedStyle(n);return{mini:document.documentElement.classList.contains('dk-mini'),ch:n.clientHeight,sh:n.scrollHeight,sbw:n.offsetWidth-n.clientWidth,sw:cs.scrollbarWidth,
 last:Math.round(n.querySelector('button[data-tab=settings]').getBoundingClientRect().bottom),nb:Math.round(n.getBoundingClientRect().bottom),
 extra:[...document.querySelectorAll('#dkSide, #dkSide *, header.top, header.top *, main, main>.view')].filter(e=>{const c=getComputedStyle(e).overflowY;return e.id!=='tabs'&&(c==='auto'||c==='scroll')&&e.scrollHeight>e.clientHeight+1&&e.getBoundingClientRect().left<300}).map(e=>e.tagName+'#'+e.id)};};
(async()=>{
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});const wb=await webkit.launch();
 const chClick=async(p)=>{const s=await p.evaluate(BTN);if(!s.hit)throw new Error('bouton recouvert');await p.mouse.click(s.cx,s.cy);};
 /* 1. icône + bascule au vrai clic */
 for(const th of ['','terrain','neon'])for(const eng of ['Chrome','WebKit']){
  const p=eng==='Chrome'?await open(b,PORT,{w:1280,h:800,theme:th}):await wopen(wb,{base:BASE,w:1280,h:800,theme:th,sw:false});
  if(eng==='WebKit'){await p.evaluate(()=>{try{CJIntro.skipSplash();}catch(e){}document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';window.CJGateOpen=true;});await sleep(1500);}
  const click=eng==='Chrome'?()=>chClick(p):()=>p.click('#dkSide .dk-col',{timeout:4000});
  const s0=await p.evaluate(BTN);if(OUT&&eng==='Chrome'&&!th)await p.screenshot({path:OUT+'/sidebar-agrandie-1280.png',clip:{x:0,y:0,width:320,height:800}});
  await click();await sleep(500);const s1=await p.evaluate(BTN);if(OUT&&eng==='Chrome'&&!th)await p.screenshot({path:OUT+'/sidebar-reduite-1280.png',clip:{x:0,y:0,width:200,height:800}});
  await click();await sleep(500);const s2=await p.evaluate(BTN);
  check(eng+' 1280 px thème '+(th||'actuel')+' : icône SVG barre latérale (agrandie : panel-left « Réduire la barre » ; réduite : panel-left-open « Agrandir la barre »), trait blanc (Néon : #F5F7FA), 32 px, sans chevrons, bascule au vrai clic aller-retour',
   okExp(s0)&&common(s0)&&okMini(s1)&&common(s1)&&okExp(s2)&&common(s2)&&s2.key==='0'&&!p.errs.length,[s0,s1,s2,p.errs]);
  await p.ctx.close();}
 /* 2. menu sans ascenseur visible, tient sans défiler (fenêtre utile du navigateur sous Windows) */
 for(const [lbl,w,h] of [['1366×768 à 100 %',1366,657],['1280×720 à 100 %',1280,609],['1366×768 à 125 %',1093,520],['1280×720 à 125 %',1024,480],['1440×900',1440,789]])for(const mini of [false,true]){
  const p=await open(b,PORT,{w,h});await p.evaluate(m=>{if(document.documentElement.classList.contains('dk-mini')!==m){const c=document.querySelector('.dk-col');if(getComputedStyle(c).display!=='none')c.click();}},mini);await sleep(600);
  const n=await p.evaluate(NAV);if(mini===false&&w<1200){await p.ctx.close();continue;}
  check(lbl+' ('+w+'×'+h+' utiles) '+(w<1200?'barre icônes 76 px (imposée < 1200 px)':n.mini?'réduite':'agrandie')+' : menu entier sans défilement, « Paramètres » visible, aucune barre de défilement, pas de 2e ascenseur',n.sh<=n.ch&&n.last<=n.nb&&n.sbw===0&&n.sw==='none'&&!n.extra.length&&!p.errs.length,n);
  if(OUT&&w===1366&&mini){await p.setViewport({width:1366,height:768});await sleep(500);await p.screenshot({path:OUT+'/sidebar-reduite-1366x768.png',clip:{x:0,y:0,width:420,height:768}});}
  await p.ctx.close();}
 {const p=await open(b,PORT,{w:1280,h:330});await p.evaluate(()=>{if(!document.documentElement.classList.contains('dk-mini'))document.querySelector('.dk-col').click();});await sleep(600);
  const n=await p.evaluate(NAV);const r=await p.evaluate(()=>{const e=document.getElementById('tabs').getBoundingClientRect();return{x:e.left+e.width/2,y:e.top+e.height/2};});await p.mouse.move(r.x,r.y);await p.mouse.wheel({deltaY:300});await sleep(500);
  const top=await p.evaluate(()=>document.getElementById('tabs').scrollTop);
  check('fenêtre très basse (1280×330) : menu plus haut que la place → défile à la molette, sans barre de défilement visible',n.sh>n.ch&&top>0&&n.sbw===0&&n.sw==='none',[n,top]);await p.ctx.close();}
 /* 3. téléphone */
 {const p=await open(b,PORT,{w:390,h:844});await sleep(500);const r=await p.evaluate(()=>({dk:document.documentElement.classList.contains('cj-dk'),s:!!document.getElementById('deskCss'),side:!!document.getElementById('dkSide')}));
  check('téléphone 390 px : desk.js non chargé, aucune barre latérale (inchangé)',!r.dk&&!r.s&&!r.side&&!p.errs.length,[r,p.errs]);await p.ctx.close();}

 /* 4. une seule barre de défilement (Chrome avec ascenseurs visibles comme sous Windows) */
 {const vb=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox'],ignoreDefaultArgs:['--hide-scrollbars']});
  const SB=()=>{const v=e=>e&&getComputedStyle(e).display!=='none'&&e.getBoundingClientRect().height>0;const own=e=>v(e)&&e.offsetWidth-e.clientWidth>0&&e.scrollHeight>e.clientHeight;
   const L=[];if(innerWidth-document.documentElement.clientWidth>0)L.push('navigateur');const top=document.getElementById('cjLock')?['cjLock']:['gate','landing'];for(const id of top)if(own(document.getElementById(id)))L.push(id);
   for(const e of document.querySelectorAll('main, main *, #dkSide, #dkSide *, nav.tabs'))if(own(e)&&e.getBoundingClientRect().height>200)L.push(e.tagName+'#'+e.id+'.'+(e.className||''));return L;};
  const OLD='html.cj-locked,html:has(>body>#cjLock){overflow-x:clip!important;overflow-y:visible!important}';
  const fresh=async(w,h,mob)=>{const ctx=await vb.createBrowserContext();const p=await ctx.newPage();p.errs=[];p.on('pageerror',e=>p.errs.push(e.message));await p.setViewport({width:w,height:h,isMobile:!!mob,hasTouch:!!mob});
   await p.goto(BASE+'#connexion',{waitUntil:'networkidle0'});await sleep(3000);p.ctx=ctx;return p;};   /* 2z (g) : « Se connecter » de /accueil/ */
  for(const [lbl,w,h] of [['1366×768',1366,657],['1280×720',1280,609],['1920×1080',1920,953]]){const p=await fresh(w,h);
   const land=await p.evaluate(()=>getComputedStyle(document.getElementById('landing')).display);const gate=await p.evaluate(SB);
   if(OUT&&w===1366)await p.screenshot({path:OUT+'/acces-1366x768.png'});
   await p.evaluate(()=>{const o=document.createElement('div');o.id='cjLock';o.style.cssText='position:fixed;inset:0;z-index:1100;overflow-y:auto;background:#0B3A6E';o.innerHTML='<div style="height:1600px">PIN</div>';document.body.appendChild(o);});await sleep(300);const pin=await p.evaluate(SB);
   await p.evaluate(()=>document.getElementById('cjLock').remove());await sleep(200);
   await p.evaluate(OLD=>{const s=document.createElement('style');s.id='zold';s.textContent=OLD;document.head.appendChild(s);},OLD);await sleep(300);const avant=await p.evaluate(SB);await p.evaluate(()=>document.getElementById('zold').remove());
   const g=await p.evaluate(()=>{const e=document.getElementById('gate');return e.scrollHeight>e.clientHeight;});
   check(lbl+' : écran de connexion (ancien accueil intégré masqué) et code PIN — une seule barre de défilement, celle de l’écran (avant la correction : '+avant.join(' + ')+')',
    land==='none'&&!gate.includes('navigateur')&&!pin.includes('navigateur')&&pin.length===1&&gate.length===(g?1:0)&&avant.includes('navigateur')&&!p.errs.length,{land,gate,pin,avant,g,errs:p.errs});
   await p.evaluate(()=>{try{CJIntro.skipSplash();}catch(e){}document.documentElement.classList.remove('cj-locked','cj-land');const x=document.getElementById('gate');if(x)x.style.display='none';window.CJGateOpen=true;});await sleep(1200);
   const app=await p.evaluate(SB);check(lbl+' : application ouverte — un seul ascenseur (navigateur), aucun ascenseur interne à côté de la barre latérale',app.length===1&&app[0]==='navigateur',app);
   await p.ctx.close();}
  {const p=await fresh(390,844,true);await p.evaluate(()=>document.documentElement.classList.remove('cj-land'));await sleep(500);const a=await p.screenshot();const s=await p.evaluate(SB);
   await p.evaluate(OLD=>{const s=document.createElement('style');s.id='zold';s.textContent=OLD;document.head.appendChild(s);},OLD);await sleep(300);const b2=await p.screenshot();
   check('390 px : écran d’accès identique au pixel près, sans ascenseur du navigateur',Buffer.compare(a,b2)===0&&!s.includes('navigateur'),s);await p.ctx.close();}
  await vb.close();}
 {const q=await wopen(wb,{base:BASE,mobile:true,sw:false});await sleep(1500);await q.evaluate(()=>{const H=document.documentElement;H.classList.remove('cj-land');H.classList.add('cj-locked');const g=document.getElementById('gate');g.style.display='';});await sleep(500);
  const a=await q.screenshot();const r=await q.evaluate(()=>({ov:getComputedStyle(document.documentElement).overflowY,g:getComputedStyle(document.getElementById('gate')).display,gt:Math.round(document.querySelector('#gate .g-card').getBoundingClientRect().top)}));
  await q.evaluate(()=>{const s=document.createElement('style');s.textContent='html.cj-locked,html:has(>body>#cjLock){overflow-x:clip!important;overflow-y:visible!important}';document.head.appendChild(s);});await sleep(300);const b2=await q.screenshot();fs.writeFileSync('/tmp/tz-a.png',a);fs.writeFileSync('/tmp/tz-b.png',b2);
  const px=require('child_process').execSync("python3 -c \"from PIL import Image,ImageChops;a=Image.open('/tmp/tz-a.png').convert('RGB');b=Image.open('/tmp/tz-b.png').convert('RGB');d=ImageChops.difference(a,b).convert('L').point(lambda v:255 if v else 0);print(sum(1 for v in d.getdata() if v))\"").toString().trim();
  check('WebKit iPhone : écran d’accès affiché, page derrière bloquée, rendu (zones sûres comprises) identique (≤ 9 pixels d’écran, coin du canevas)',r.ov==='hidden'&&r.g!=='none'&&+px<=9,[r,px]);await q.ctx.close();}
 await b.close();await wb.close();console.log(pass+'/'+(pass+fail)+' passed');process.exit(fail?1:0);})().catch(e=>{console.log('FAIL - exception '+e.stack);process.exit(1);});
