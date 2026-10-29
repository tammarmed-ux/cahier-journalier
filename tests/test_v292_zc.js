/* 1.29.2 (zc) : barre latérale ordinateur — Proposition A, une barre par thème (Actuel #0B3A6E→#082C55 / actif #FF9A4D ; Vert terrain #14532D→#0F4A27 / #FCD34D ;
   Néon sport #14141F→#0A0A12, bord cyan 1 px / #C6FF00). Icônes = couleur du texte, titres de section opaques, séparateurs 1 px, barre réduite comprise.
   Contraste WCAG ≥ 4,5:1 (textes et élément actif) sur les deux couleurs du dégradé. Téléphone inchangé. Port 8241. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core');const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');
const D='/workspace/cj-deploy',PORT=8241,OUT=process.env.SHOTS||'';serve(D,PORT);
let pass=0,fail=0;const check=(n,ok,x)=>{ok?pass++:fail++;console.log((ok?'PASS':'FAIL')+' - '+n+(ok?'':' '+JSON.stringify(x).slice(0,900)));};
const P=s=>{const m=String(s).match(/[\d.]+/g).map(Number);return {r:m[0],g:m[1],b:m[2],a:m.length>3?m[3]:1};};
const hex=h=>({r:parseInt(h.slice(1,3),16),g:parseInt(h.slice(3,5),16),b:parseInt(h.slice(5,7),16),a:1});
const over=(f,b)=>({r:f.r*f.a+b.r*(1-f.a),g:f.g*f.a+b.g*(1-f.a),b:f.b*f.a+b.b*(1-f.a),a:1});
const L=c=>{const f=v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4);};return .2126*f(c.r)+.7152*f(c.g)+.0722*f(c.b);};
const CR=(a,b)=>{const x=L(a),y=L(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);};
const T={'':{n:'Actuel',bg:['#0B3A6E','#082C55'],act:'#FF9A4D'},terrain:{n:'Vert terrain',bg:['#14532D','#0F4A27'],act:'#FCD34D'},neon:{n:'Néon sport',bg:['#14141F','#0A0A12'],act:'#C6FF00'}};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 for(const th of ['','terrain','neon'])for(const mini of [0,1]){const E=T[th],tag=' — '+E.n+(mini?' (barre réduite)':' (barre ouverte)')+' 1280 px';
  const p=await open(b,PORT,{w:1280,h:800,theme:th});await tab(p,'home');await sleep(800);
  const isMini=()=>p.evaluate(()=>document.documentElement.classList.contains('dk-mini'));
  if(!!(await isMini())!==!!mini){await p.click('.dk-col');await sleep(700);}
  const r=await p.evaluate(()=>{const S=document.getElementById('dkSide'),cs=e=>getComputedStyle(e),nb=[...document.querySelectorAll('nav.tabs button')].filter(e=>e.getClientRects().length);
   const ina=nb.find(e=>!e.classList.contains('active')),act=nb.find(e=>e.classList.contains('active')),sec=document.querySelector('nav.tabs button[data-tab=home]');const sa=getComputedStyle(sec,'::after'),bf=getComputedStyle(act,'::before');
   const svg=e=>{const s=e.querySelector('.ti svg');return s?cs(s).stroke:null;},pn=document.querySelector('.dk-pn b'),ps=document.querySelector('.dk-pn small');
   return {mini:document.documentElement.classList.contains('dk-mini'),bgi:cs(S).backgroundImage,br:[cs(S).borderRightWidth,cs(S).borderRightStyle,cs(S).borderRightColor],ink:cs(S).color,
    ina:{c:cs(ina).color,ti:cs(ina.querySelector('.ti')).color,svg:svg(ina)},act:{c:cs(act).color,bg:cs(act).backgroundColor,ti:cs(act.querySelector('.ti')).color,svg:svg(act),bar:bf.backgroundColor},
    sec:{content:sa.content,c:sa.color,o:sa.opacity,bg:sa.backgroundColor,h:sa.height},pn:pn&&pn.getClientRects().length?cs(pn).color:null,ps:ps&&ps.getClientRects().length?[cs(ps).color,cs(ps).opacity]:null,
    col:document.querySelector('.dk-col')?cs(document.querySelector('.dk-col')).color:null,pri:/var\(--pri\)|rgb/.test(cs(S).backgroundColor)?cs(S).backgroundColor:''};});
  check('état '+(mini?'réduit':'ouvert')+tag,r.mini===!!mini,r.mini);
  const want=E.bg.map(hex).map(c=>'rgb('+c.r+', '+c.g+', '+c.b+')');
  check('fond : dégradé '+E.bg.join(' → ')+' (pas la couleur du thème var(--pri))'+tag,r.bgi.includes(want[0])&&r.bgi.includes(want[1]),r.bgi);
  check('bord droit 1 px'+(th==='neon'?' cyan':'')+tag,r.br[0]==='1px'&&r.br[1]==='solid'&&(th!=='neon'||(()=>{const c=P(r.br[2]);return c.r===0&&c.g>200&&c.b>240;})()),r.br);
  check('icônes de la couleur du texte (élément inactif) ; icône et barre de l’élément actif '+E.act+tag,r.ina.ti===r.ina.c&&(!r.ina.svg||r.ina.svg===r.ina.c)&&(()=>{const a=hex(E.act),s='rgb('+a.r+', '+a.g+', '+a.b+')';return r.act.ti===s&&r.act.bar===s;})(),[r.ina,r.act]);
  if(!mini)check('titres de section opaques (opacité 1)'+tag,/Tableau de bord/i.test(r.sec.content)&&r.sec.o==='1',r.sec);
  else check('séparateurs de section : traits de 1 px opaques'+tag,r.sec.h==='1px'&&r.sec.o==='1'&&P(r.sec.bg).a>0,r.sec);
  /* contraste sur les deux couleurs du dégradé */
  const cr=[];for(const g of E.bg.map(hex)){const actBg=over(P(r.act.bg),g);
   cr.push(['texte inactif',CR(P(r.ina.c),g)],['élément actif (texte)',CR(P(r.act.c),actBg)],['élément actif (icône '+E.act+')',CR(P(r.act.ti),actBg)],['barre active',CR(P(r.act.bar),g)]);
   if(!mini){cr.push(['titre de section',CR(over(Object.assign(P(r.sec.c),{a:P(r.sec.c).a*Number(r.sec.o)}),g),g)]);if(r.pn)cr.push(['nom du professeur',CR(P(r.pn),over({r:255,g:255,b:255,a:.07},g))]);if(r.ps)cr.push(['établissement',CR(over(Object.assign(P(r.ps[0]),{a:Number(r.ps[1])}),over({r:255,g:255,b:255,a:.07},g)),over({r:255,g:255,b:255,a:.07},g))]);}}
  const low=cr.filter(x=>x[1]<4.5),mn=Math.min(...cr.map(x=>x[1]));
  check('contraste WCAG ≥ 4,5:1 pour les textes et l’élément actif (minimum '+mn.toFixed(2)+':1)'+tag,!low.length,low.map(x=>[x[0],x[1].toFixed(2)]));
  check('aucune erreur JS'+tag,!p.errs.length,p.errs);
  if(OUT)await p.screenshot({path:OUT+'/barre-'+(th||'actuel')+(mini?'-reduite':'-ouverte')+'-1280.png'});
  await p.ctx.close();}
 /* téléphone inchangé : aucune règle zc hors ordinateur */
 for(const th of ['','neon']){const p=await open(b,PORT,{w:390,h:844,theme:th});await sleep(500);
  const r=await p.evaluate(()=>({dk:document.documentElement.classList.contains('cj-dk'),sb:document.documentElement.classList.contains('dk-sbA'),side:(()=>{const s=document.getElementById('dkSide');return s?getComputedStyle(s).display:'absent';})()}));
  check('téléphone 390 px '+(th||'actuel')+' : pas de barre latérale, aucune règle zc appliquée',!r.dk&&!r.sb&&(r.side==='none'||r.side==='absent'),r);await p.ctx.close();}
 console.log(pass+'/'+(pass+fail)+' passed');await b.close();process.exit(fail?1:0);})();
