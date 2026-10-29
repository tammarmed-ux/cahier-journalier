/* 1.29.2 (r) : page d’accueil publique A autonome (/accueil/) — chargement 1440/390 sans débordement, repères « à fournir »,
   service worker : /accueil/ ni servie ni mise en cache par l’app, copie locale de l’app intacte, index.html inchangé. Port 8059. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const fs=require('fs'),http=require('http'),path=require('path'),cp=require('child_process');
const D='/workspace/cj-deploy',PORT=8059,BASE='http://localhost:'+PORT+'/',sleep=ms=>new Promise(r=>setTimeout(r,ms));let pass=0,tot=0;
function check(n,ok,x){tot++;if(ok){pass++;console.log('ok   - '+n);}else console.log('FAIL - '+n+(x!==undefined?' :: '+JSON.stringify(x).slice(0,700):''));}
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.svg':'image/svg+xml','.ttf':'font/ttf','.jpg':'image/jpeg','.ico':'image/x-icon','.webmanifest':'application/manifest+json'};
const WA_INV='https://wa.me/212691679101?text='+encodeURIComponent("Bonjour, je suis enseignant(e) d'EPS et je souhaite demander un accès à l'application TATABO3 pour l'utiliser avec mes classes.\nNom et prénom :\nÉtablissement :\nVille :\nMerci d'avance pour votre retour.").replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
const WA_CON='https://wa.me/212691679101?text='+encodeURIComponent("Bonjour, je vous contacte au sujet de l'application TATABO3.\nNom et prénom :\nÉtablissement :\nMa question :").replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase());
const hits=[];let DOWN=false;
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);hits.push(u);if(DOWN){q.socket.destroy();return;}if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r);}).listen(PORT);
(async()=>{
 /* 1) fichiers */
 const A=D+'/accueil/';const html=fs.readFileSync(A+'index.html','utf8');
 const refs=[...html.matchAll(/(?:src|href)="([^"#][^"]*)"|url\(([^)]+)\)/g)].map(m=>(m[1]||m[2]).replace(/["']/g,'')).filter(u=>!/^(https?:|\/$|data:)/.test(u));
 const miss=refs.filter(u=>!fs.existsSync(path.join(A,u)));check('toutes les ressources de /accueil/ existent ('+refs.length+')',miss.length===0,miss);
 {const hs=[...html.matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map(m=>m[1].replace(/&amp;/g,'&'));const dt=hs.map(h=>{const u=new URL(h);return u.origin+u.pathname+'|'+u.searchParams.get('text');});
  check('liens WhatsApp : 6 (3 invitation, 3 contact), numéro 212691679101, texte décodé identique au message demandé',hs.length===6&&dt.filter(x=>x==='https://wa.me/212691679101|'+decodeURIComponent(WA_INV.split('text=')[1])).length===3&&dt.filter(x=>x==='https://wa.me/212691679101|'+decodeURIComponent(WA_CON.split('text=')[1])).length===3&&decodeURIComponent(WA_INV.split('text=')[1]).split('\n').length===5,dt);}
 const sz=cp.execSync('du -sb '+A).toString().split('\t')[0];check('poids de /accueil/ < 500 Ko ('+sz+' o)',+sz<500000);
 /* démarrage = fichiers préchargés (ASSETS de sw.js) : ne grandit pas par rapport à backup-pre-1.29.2r et reste ≤ 720 Ko */
 const core=get=>{const w=get('sw.js').toString();const m=w.slice(w.indexOf('const ASSETS'),w.indexOf('const LAZY_ASSETS')).replace(/\/\*[\s\S]*?\*\//g,'');return [...m.matchAll(/'([^']+)'/g)].map(x=>x[1]).reduce((a,f)=>a+get(f.replace('./','')).length,0);};
 const c1=core(f=>fs.readFileSync(path.join(D,f))),c0=core(f=>cp.execSync('git -C '+D+' show backup-pre-1.29.2r:'+f));
 check('démarrage (préchargement) '+c1+' o ≤ avant '+c0+' o et ≤ 720 Ko (737 280 o)',c1<=c0&&c1<=737280,[c0,c1]);
 check('index.html : /accueil/ seulement via CJAcc (hors session, en ligne, navigateur)',/L\[boot\?'replace':'assign'\]\('accueil\/'\)/.test(fs.readFileSync(D+'/index.html','utf8')));
 const sw=fs.readFileSync(D+'/sw.js','utf8');const lists=sw.slice(sw.indexOf('const ASSETS'),sw.indexOf('const SDK_PREFIX'));
 check('sw.js : /accueil/ absent du préchargement et des listes de cache',!/accueil/.test(lists));
 check('aucun lien vers les données de l’app dans la page (localStorage, firebase, classRegister)',!/localStorage|firebase|classRegister|indexedDB/i.test(html));
 const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 /* 2) rendu 1440 / 390 */
 for(const [w,h,mob] of [[1440,900,false],[390,844,true]]){const ctx=await b.createBrowserContext();const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
  await p.setViewport({width:w,height:h,isMobile:mob,hasTouch:mob});await p.goto(BASE+'accueil/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
  const r=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth,title:document.title,
   imgs:[...document.images].map(i=>[i.getAttribute('src'),i.naturalWidth]),fonts:['800 20px Poppins','400 16px Inter','600 20px Caveat'].map(f=>document.fonts.check(f)&&[...document.fonts].some(x=>x.family.replace(/"/g,'')===f.split(' ').pop()&&x.status==='loaded')),
   svg:document.querySelectorAll('svg.ic').length,txt:document.body.innerText,se:[...document.querySelectorAll('a')].filter(a=>/Se connecter/.test(a.textContent)).map(a=>a.getAttribute('href')),
   inv:[...document.querySelectorAll('a')].filter(a=>/Demander une invitation/.test(a.textContent)).map(a=>a.getAttribute('href')),h1:document.querySelector('h1').innerText}));
  const tag=' ('+w+' px)';
  check('page chargée sans erreur JS'+tag,errs.length===0&&/TATABO3/.test(r.title),errs);
  check('aucun débordement horizontal'+tag,r.sw===r.cw&&r.cw===w,[r.sw,r.cw]);
  check('images chargées'+tag,r.imgs.length>=6&&r.imgs.every(x=>x[1]>0),r.imgs);
  check('polices auto-hébergées chargées (Poppins, Inter, Caveat)'+tag,r.fonts.every(Boolean),r.fonts);
  check('pictos SVG injectés'+tag,r.svg>20,r.svg);
  check('titre « Le cahier journalier d’EPS qui vous fait gagner du temps. »'+tag,/Le cahier journalier d’EPS qui vous fait gagner du temps\./.test(r.h1.replace(/\s+/g,' ')),r.h1);
  check('« Se connecter » → écran de connexion de l’app (/#connexion, pas de renvoi vers /accueil/)'+tag,r.se.length>=1&&r.se.every(x=>x==='/#connexion'),r.se);
  check('« Demander une invitation » (3 boutons) → WhatsApp +212 691 679 101, nouvel onglet, message d’accès exact (accents, retours à la ligne)'+tag,r.inv.length===3&&r.inv.every(x=>x===WA_INV),r.inv);
  const con=await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/^(Contact|Poser une question)/.test(a.textContent.trim())).map(a=>({t:a.textContent.trim(),h:a.getAttribute('href'),tg:a.target,rel:a.rel})));
  const inv2=await p.evaluate(()=>[...document.querySelectorAll('a')].filter(a=>/Demander une invitation/.test(a.textContent)).map(a=>a.target+'|'+a.rel));
  check('« Contact » (menu, pied de page, menu ☰) et « Poser une question » → WhatsApp, message de contact exact ; tous en nouvel onglet rel=noopener'+tag,con.length===3&&con.filter(x=>x.t==='Contact').length===2&&con.every(x=>x.h===WA_CON&&x.tg==='_blank'&&/noopener/.test(x.rel))&&inv2.every(x=>x==='_blank|noopener'),[con,inv2]);
  check('aucun lien provisoire restant (« Lien à définir », #demander-une-invitation, #contact)'+tag,!/Lien à définir|href="#(demander-une-invitation|contact)"/.test(await p.content()));
  {const nt=new Promise(res=>ctx.once('targetcreated',async t=>{const pg=await t.page().catch(()=>null);if(pg){await pg.setRequestInterception(true).catch(()=>{});pg.on('request',q=>q.abort().catch(()=>{}));}res(t.url());setTimeout(()=>pg&&pg.close().catch(()=>{}),300);}));await p.evaluate(()=>{const a=[...document.querySelectorAll('a.btn.or')].find(a=>/Demander une invitation/.test(a.textContent)&&a.offsetParent);a.scrollIntoView({block:'center'});});await sleep(200);
   const bx=await (await p.$$('a.btn.or')).reduce(async(acc,h)=>(await acc)||((await h.boundingBox())&&/Demander une invitation/.test(await h.evaluate(e=>e.textContent))&&h),Promise.resolve(null));const bb=await bx.boundingBox();
   await p.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2);const u=await Promise.race([nt,sleep(4000).then(()=>'')]);
   check('vrai clic « Demander une invitation » → nouvel onglet sur wa.me (la page d’accueil reste ouverte)'+tag,(u.startsWith('https://wa.me/212691679101?text=')||u.startsWith('https://api.whatsapp.com/send/?phone=212691679101&text='))&&/accueil\/$/.test(p.url()),[u.slice(0,80),p.url()]);}
  check('témoignages = 3 cartes « Exemple — à remplacer par un vrai témoignage »'+tag,(r.txt.match(/Exemple — à remplacer par un vrai témoignage/gi)||[]).length===3);
  check('photo EPS marquée « à fournir » et mentions légales « à fournir »'+tag,/photo EPS réelle à fournir/.test(await p.$eval('.fin .art',e=>e.innerHTML))&&/Mentions légales \(à fournir\)/i.test(r.txt));
  check('aucun chiffre inventé (pas de %, « + de », « utilisateurs »)'+tag,!/\d+\s?%|\+\s?de\s?\d|\d+\s+(professeurs|utilisateurs|enseignants)/i.test(r.txt));
  if(mob){const vis=()=>p.evaluate(()=>getComputedStyle(document.getElementById('navList')).display);const v0=await vis();await p.click('.nav .burger');await sleep(150);const v1=await vis();const ae=await p.$eval('.nav .burger',e=>e.getAttribute('aria-expanded'));
   const cov=await p.evaluate(()=>{const h=document.querySelector('header.nav').getBoundingClientRect(),l=[...document.querySelectorAll('#navList a,.nav .act a')].map(a=>a.getBoundingClientRect().bottom);return{hb:h.bottom,mx:Math.max(...l)};});
   check('menu mobile ouvert : fond opaque sous tous les liens (pas de texte superposé au héros)',cov.hb>=cov.mx,cov);
   await p.evaluate(()=>document.querySelector('#navList a[href="#faq"]').click());await sleep(150);const v2=await vis();
   check('menu mobile : ☰ ouvre la navigation, un lien la referme',v0==='none'&&v1==='flex'&&ae==='true'&&v2==='none',[v0,v1,ae,v2]);}
  await ctx.close();}
 /* 2z) ordinateur : chaque partie tient dans un écran, atteinte par le menu ; téléphone sans contrainte */
 for(const [w,h] of [[1366,657],[1280,633],[1920,950],[1536,730]]){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:w,height:h});await p.goto(BASE+'accueil/',{waitUntil:'networkidle0'});await p.evaluate(()=>document.fonts.ready);
  const r=await p.evaluate(()=>{const H=innerHeight;const S=[...document.querySelectorAll('section')].map(s=>{const R=s.getBoundingClientRect();let mb=0;for(const e of s.querySelectorAll('*')){const q=e.getBoundingClientRect();if(q.width&&q.height&&getComputedStyle(e).position!=='absolute'&&!e.closest('.art'))mb=Math.max(mb,q.bottom-R.top);}return{id:s.id||s.className,h:Math.round(R.height),mb:Math.round(mb)};});
   const hero=document.querySelector('.hero').getBoundingClientRect();const cta=[...document.querySelectorAll('.hero .cta .btn')].map(e=>Math.round(e.getBoundingClientRect().bottom-hero.top));return{H,S,cta};});
  check(w+'×'+h+' : chaque partie (accueil, fonctionnalités, avantages, FAQ, témoignages, contact) tient dans un écran, les 2 boutons du haut visibles',r.S.length===6&&r.S.every(x=>Math.abs(x.h-r.H)<=1&&x.mb<=r.H)&&r.cta.length===2&&r.cta.every(y=>y<=r.H),r);
  const nav=[];for(const [t,id] of [['Fonctionnalités','fonctions'],['Avantages','etapes'],['FAQ','faq']]){await p.evaluate(t=>[...document.querySelectorAll('.nav ul a')].find(a=>a.textContent.trim()===t).click(),t);await sleep(1300);
   nav.push(await p.evaluate(id=>{const R=document.getElementById(id).getBoundingClientRect();return{id,top:Math.round(R.top),bot:Math.round(R.bottom),H:innerHeight};},id));}
  check(w+'×'+h+' : menu → Fonctionnalités / Avantages / FAQ : la partie remplit exactement l’écran (haut non caché, bas visible)',nav.every(x=>Math.abs(x.top)<=1&&x.bot<=x.H+1),nav);
  await ctx.close();}
 /* 3) service worker de l’app */
 {const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844});
  await p.evaluateOnNewDocument(()=>{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));});
  await p.setRequestInterception(true);p.on('request',q=>{const u=q.url();(u.startsWith(BASE)||u.startsWith('data:')||u.startsWith('blob:'))?q.continue():q.abort();});
  await p.goto(BASE+'#connexion',{waitUntil:'networkidle2'});
  await p.waitForFunction(()=>navigator.serviceWorker.controller||false,{timeout:20000}).catch(()=>null);
  if(!(await p.evaluate(()=>!!navigator.serviceWorker.controller))){await p.reload({waitUntil:'networkidle2'});await p.waitForFunction(()=>!!navigator.serviceWorker.controller,{timeout:20000});}
  await sleep(1500);
  const snap=()=>p.evaluate(async()=>{const o={};for(const n of await caches.keys()){const c=await caches.open(n);o[n]={keys:(await c.keys()).map(r=>new URL(r.url).pathname),idx:await (await c.match(location.origin+'/index.html')||new Response('')).text(),root:await (await c.match(location.origin+'/')||new Response('')).text()};}return o;});
  const s0=await snap();const cn=Object.keys(s0).find(k=>k.startsWith('cahier-'));
  check('app : service worker actif, cache '+cn,!!cn&&/id="landing"/.test(s0[cn].idx),Object.keys(s0));
  hits.length=0;await p.goto(BASE+'accueil/',{waitUntil:'networkidle0'});const t=await p.title();
  check('/accueil/ ouverte sous le service worker de l’app = page d’accueil (réseau)',/TATABO3 — Le cahier journalier/.test(t)&&hits.includes('/accueil/'),t);
  const s1=await snap();
  check('aucune ressource /accueil/ dans le cache de l’app',!Object.values(s1).some(c=>c.keys.some(k=>/accueil/.test(k))),Object.values(s1).map(c=>c.keys.filter(k=>/accueil/.test(k))));
  check('copies locales ./index.html et ./ de l’app inchangées après la visite',s1[cn].idx===s0[cn].idx&&/id="landing"/.test(s1[cn].root),[s1[cn].idx.length,s1[cn].root.length]);
  DOWN=true;await p.goto(BASE,{waitUntil:'domcontentloaded'}).catch(()=>null);await sleep(1500);
  const off=await p.evaluate(()=>!!document.getElementById('landing')&&!!document.getElementById('tabs'));
  check('serveur coupé (hors ligne) : / ouvre toujours l’application depuis le cache (pas la page d’accueil)',off);
  DOWN=false;await ctx.close();}
 /* 4) correction d’un cache écrasé par l’ancienne version : l’installation recopie « ./ » depuis index.html */
 check('sw.js : à l’installation, « ./ » recopié depuis ./index.html',/c\.match\('\.\/index\.html'\)\)\.then\(r => r && c\.put\('\.\/', r\)\)/.test(sw));
 check('sw.js : seule la navigation / ou /index.html remplace la copie de l’app',/url\.pathname === SCOPE \|\| url\.pathname === SCOPE \+ 'index\.html'/.test(sw));
 await b.close();srv.close();console.log(pass+'/'+tot+' passed');process.exit(pass===tot?0:1);
})().catch(e=>{console.log('FATAL',e&&e.stack||e);process.exit(1);});
