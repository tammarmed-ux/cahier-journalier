/* v1.28.0 : barèmes officiels d’athlétisme OP 2007 (Note/06 TC, Note/07 1BAC-2BAC) — données, monotonie, conversion (palier supérieur), temps mn.ss,
   onglet « Note procéd. » : essais → meilleur essai → note PRODUIT automatique, forçage manuel, sexe manquant, Performance manuelle, synchro Notes /20 + PDF */
const puppeteer=require('puppeteer-core');const fs=require('fs');const http=require('http');const path=require('path');const cp=require('child_process');
const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const KEY='classRegister.v2';const D='/workspace/cj-deploy';
const MT={'.html':'text/html; charset=utf-8','.js':'text/javascript','.webmanifest':'application/manifest+json','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.ico':'image/x-icon','.jpg':'image/jpeg','.ttf':'font/ttf'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u.endsWith('/'))u+='index.html';const f=path.join(D,u);
  if(!f.startsWith(D)||!fs.existsSync(f)||fs.statSync(f).isDirectory()){r.writeHead(404);return r.end('404');}
  r.writeHead(200,{'Content-Type':MT[path.extname(f)]||'application/octet-stream','Cache-Control':'no-cache'});fs.createReadStream(f).pipe(r);}).listen(8016);
const URL='http://localhost:8016/?emu=1';
// ---------- 1. fichier de données seul (Node) ----------
global.window={};require(D+'/op2007-athle.js');const O=window.OP2007_ATHLE;
const tsec=t=>{const m=/^(\d+)(?:\.(\d+))?$/.exec(String(t));if(!m)return NaN;const d=m[2]||'0';return +m[1]*60+ +((d+'0').slice(0,2));};
let cnt=0,errsM=[],shape=true;
['TC','1BAC','2BAC'].forEach(lv=>['G','F'].forEach(sx=>O.order.forEach(ev=>{const c=O.grids[lv]&&O.grids[lv][sx]&&O.grids[lv][sx][ev];if(!c||c.length!==20){shape=false;return;}cnt+=20;
  const v=c.map(x=>O.events[ev].u==='mn'?tsec(x):+x);v.forEach((x,i)=>{if(!(x>0))errsM.push(lv+' '+sx+' '+ev+' palier '+(i+1)+' illisible');if(i&&(O.events[ev].low?!(x<v[i-1]):!(x>v[i-1])))errsM.push(lv+' '+sx+' '+ev+' palier '+(i+1)+' : '+c[i-1]+' → '+c[i]);});})));
check('données : 3 niveaux × 2 sexes × 6 épreuves × 20 paliers = 720 valeurs',shape&&cnt===720&&O.order.length===6,cnt);
check('monotonie stricte de chaque colonne (temps décroissants, distances/hauteurs croissantes)',errsM.length===0,errsM.join(' ; '));
check('paliers : TC 0,30 → 6 ; 1BAC et 2BAC 0,35 → 7 (colonne Note/20 ignorée)',O.step.TC===0.3&&O.step['1BAC']===0.35&&O.step['2BAC']===0.35&&O.max.TC===6&&O.max['1BAC']===7&&O.max['2BAC']===7&&Math.abs(20*O.step.TC-6)<1e-9&&Math.abs(20*O.step['2BAC']-7)<1e-9);
const G=O.grids;
check('cellules témoins : TC G 1000 m 5.29→2.57 ; TC F 600 m « 4.2 » = 4′20″ ; 2BAC G 1000 m 5.17 ; 2BAC F hauteur 130',G.TC.G.endurance[0]+''==='5.29'&&G.TC.G.endurance[19]+''==='2.57'&&tsec(G.TC.F.endurance[2])===260&&G['2BAC'].G.endurance[0]+''==='5.17'&&+G['2BAC'].F.hauteur[19]===130);
const src=fs.readFileSync(D+'/op2007-athle.js','utf8');
check('correction du propriétaire : 1BAC garçons poids, palier 20 = 1150 cm (commentaire « faute de frappe dans la source (115) »)',+G['1BAC'].G.poids[19]===1150&&/faute de frappe dans la source \(« 115 »\), confirmé par le propriétaire : 1150/.test(src));
(async()=>{
const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,protocolTimeout:60000,args:['--no-sandbox','--disable-dev-shm-usage']});
const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const errs=[],dialogs=[];let dlgAns=true;p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>{dialogs.push(d.message());dlgAns?d.accept():d.dismiss();});
await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');}catch(e){}});
const unlock=()=>p.evaluate(()=>{window.CJIntro&&window.CJIntro.skipSplash&&window.CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');const g=document.getElementById('gate');if(g)g.style.display='none';});
await p.goto(URL,{waitUntil:'networkidle2'});
// ---------- 2. conversion (code de l’application) ----------
const L=await p.evaluate(()=>{const A=window.CJR,T=A.athTime,M=(lv,sx,ev,t)=>{const r=A.athMark(lv,sx,ev,t);return r.err?'err:'+r.err:r.v;};
  const P=(t)=>M('2BAC','G','poids',t),E=(t)=>M('2BAC','G','endurance',t);
  return {t:[T('5.17'),T('4.2'),T("3'25"),T('3:25'),T('3.25'),T('3,25'),T('3 min 25'),T('3′25″'),T('4.75'),T('abc'),T('5.09')],
   poids:[P('920'),P('947'),P('948'),P('893'),P('892'),P('1222'),P('1300'),P('537'),P('520'),P('517'),P('400'),P('9,20 m')],
   endu:[E('3.30'),E('3.25'),E('3.26'),E('3.33'),E('2.45'),E('2.30'),E('5.17'),E('5.20'),E('5.25'),E('5.30'),E("3'30")],
   tc:[M('TC','G','poids','1111'),M('TC','G','poids','1110'),M('TC','G','poids','1056'),M('TC','G','poids','426'),M('TC','G','poids','410'),M('TC','G','poids','406'),M('TC','G','poids','11,11 m')],
   b1:[M('1BAC','G','poids','1150'),M('1BAC','G','poids','1149'),M('1BAC','G','poids','1099'),M('1BAC','G','poids','1100'),M('1BAC','G','poids','1154')],
   spr:[M('2BAC','G','vitesse','9,53'),M('2BAC','G','vitesse','9,6'),M('2BAC','G','vitesse','9,84'),M('2BAC','G','vitesse','15,5'),M('2BAC','G','vitesse','15,8'),M('2BAC','G','vitesse','5.17'),M('TC','G','vitesse','16,9 s')],
   un:[M('TC','F','longueur','3,75'),M('TC','F','longueur','375'),M('TC','F','longueur','375 cm'),M('2BAC','F','hauteur','1,30 m'),M('2BAC','F','hauteur','130'),M('TC','F','endurance','4.2'),M('TC','F','endurance','4.21'),M('1BAC','F','triple','855')],
   er:[M('2BAC','','poids','920'),M('2BAC','G','endurance','4.75'),M('2BAC','G','','920')],
   best:[A.athBest('endurance',['3.40','3.25','x']),A.athBest('poids',['8,75 m','920','abc']),A.athBest('poids',['','',''])].map(b=>({i:b.best&&b.best.i,v:b.best&&b.best.val,bad:b.bad}))};});
check('temps mn.ss : 5.17 = 317 s · 4.2 = 4′20″ · 3\'25 = 3:25 = 3.25 = 3,25 = « 3 min 25 » = 3′25″ = 205 s · 4.75 et « abc » refusés',JSON.stringify(L.t)==='[317,260,205,205,205,205,205,205,null,null,309]',JSON.stringify(L.t));
check('exemple du propriétaire (2BAC G poids) : 920 → 5,25 ; 947 (palier pile) → 5,25 ; 948 → 5,6 ; 893 → 5,25 ; 892 → 4,9 ; 1222 → 7 ; 1300 → 7 ; « 9,20 m » → 5,25',JSON.stringify(L.poids.filter((x,i)=>[0,1,2,3,4,5,6,11].includes(i)))==='[5.25,5.25,5.6,5.25,4.9,7,7,5.25]',JSON.stringify(L.poids));
check('sous le palier 1 (poids 2BAC G, palier 1 = 537, écart 20) : 537 → 0,35 ; 520 → 0,35 ; 517 → 0 ; 400 → 0',JSON.stringify(L.poids.slice(7,11))==='[0.35,0.35,0,0]',JSON.stringify(L.poids.slice(7,11)));
check('temps (2BAC G 1000 m) : 3.30 → 5,25 (entre 3.33 et 3.25) ; 3.25 → 5,25 ; 3.26 → 5,25 ; 3.33 → 4,9 ; 2.45 → 7 ; 2.30 → 7 ; 5.17 → 0,35 ; 5.20 → 0,35 ; 5.25 → 0 ; 5.30 → 0 ; 3\'30 → 5,25',JSON.stringify(L.endu)==='[5.25,5.25,5.25,4.9,7,7,0.35,0.35,0,0,5.25]',JSON.stringify(L.endu));
check('TC G poids (pas 0,30) : 1111 → 6 ; 1110 → 6 ; 1056 → 5,7 ; 426 → 0,3 ; 410 → 0,3 ; 406 → 0 ; « 11,11 m » → 6',JSON.stringify(L.tc)==='[6,6,5.7,0.3,0.3,0,6]',JSON.stringify(L.tc));
check('1BAC G poids (palier 20 = 1150) : 1150 → 7 ; 1149 → 7 ; 1099 → 6,65 ; 1100 → 7 ; 1154 → 7',JSON.stringify(L.b1)==='[7,7,6.65,7,7]',JSON.stringify(L.b1));
check('sprint (secondes) : 9,53 → 7 ; 9,6 → 7 ; 9,84 → 6,65 ; 15,5 → 0,35 ; 15,8 → 0 ; 5.17 (hors limites) refusé ; « 16,9 s » TC → 0,3',JSON.stringify(L.spr)==='[7,7,6.65,0.35,0,"err:fmt",0.3]',JSON.stringify(L.spr));
check('unités : longueur 3,75 m = 375 = « 375 cm » → 6 ; hauteur « 1,30 m » = 130 → 7 ; TC F 600 m 4.2 → 0,9 ; 4.21 → 0,9 ; 1BAC F triple 855 → 7',JSON.stringify(L.un)==='[6,6,6,7,7,0.9,0.9,7]',JSON.stringify(L.un));
check('erreurs : sexe absent → « sex » ; format → « fmt » ; épreuve absente → « evt »',JSON.stringify(L.er)==='["err:sex","err:fmt","err:evt"]');
check('meilleur essai : temps → le plus petit (3.25, essai 2), distance → la plus grande (920, essai 2), essai illisible ignoré et signalé',JSON.stringify(L.best)==='[{"i":1,"v":205,"bad":[2]},{"i":1,"v":920,"bad":[2]},{"i":null,"v":null,"bad":[]}]',JSON.stringify(L.best));
const gs=await p.evaluate(()=>{const g=window.CJR.evtGuess;return [g('Athlétisme – endurance'),g('Course de demi-fond'),g('Lancer du poids'),g('Saut en longueur'),g('Triple saut'),g('Saut en hauteur'),g('Vitesse 80 m'),g('Athlétisme')];});
check('épreuve déduite du nom de l’activité (endurance, demi-fond, poids, longueur, triple, hauteur, vitesse) ; « Athlétisme » seul → à choisir',JSON.stringify(gs)==='["endurance","endurance","poids","longueur","triple","hauteur","vitesse",""]',JSON.stringify(gs));
// ---------- 3. interface (onglet Note procéd.) ----------
await p.evaluate(KEY=>{const d=JSON.parse(localStorage.getItem(KEY));d.settings.teacher='Mohamed Tammar – Lycée qualifiant Baja';
  const c=d.classes.find(x=>x.name==='2BACSP4');d.periods[0]='Lancer du poids';d.periods[1]='Athlétisme – endurance';d.periods[2]='Gymnastique';
  d.classes.push({id:'c1b',name:'1BACSE2'});
  const N=[['AIT BENALI Yassine','G'],['BENNANI Salma','F'],['CHAKIR Omar','G'],['DAOUDI Imane','F'],['EL AMRANI Hamza',''],['FASSI Nour','F'],['GHALI Anas','G'],['HAJJI Khadija','F']];
  d.students=N.map((n,i)=>({id:'s'+i,classId:c.id,name:n[0],...(n[1]?{sex:n[1]}:{}),sid:'J13'+(1000000+i),dob:'',parent:'',phone:'',notes:'',created:1}));
  d.students.push({id:'b0',classId:'c1b',name:'KADIRI Ayoub',sex:'G',sid:'M200000001',dob:'',parent:'',phone:'',notes:'',created:1});
  d.ui.cls=c.id;d.ui.per=0;localStorage.setItem(KEY,JSON.stringify(d));},KEY);
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);
const base=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);const CID=base.classes.find(x=>x.name==='2BACSP4').id;
const goTab=async t=>{await p.evaluate(t=>document.querySelector('#tabs button[data-tab="'+t+'"]').click(),t);await sleep(400);};
const notes=async()=>{await goTab('attendance');await sleep(300);};
const A='section.view.active ';
async function type(sid,k,v,i){await p.evaluate((A,sid,k,v,i)=>{const el=document.querySelector(A+'tr[data-sid="'+sid+'"] input[data-k="'+k+'"]'+(i!=null?'[data-i="'+i+'"]':''));el.focus();el.value=v;el.dispatchEvent(new Event('change',{bubbles:true}));el.blur();},A,sid,k,v,i);await sleep(60);}
const ess=(sid,i,v)=>type(sid,'essai',v,i);
const val=(sid,k)=>p.evaluate((A,sid,k)=>{const i=document.querySelector(A+'tr[data-sid="'+sid+'"] input[data-k="'+k+'"]');return i?i.value:null;},A,sid,k);
const cls=(sid,k,i)=>p.evaluate((A,sid,k,i)=>{const el=document.querySelector(A+'tr[data-sid="'+sid+'"] input[data-k="'+k+'"]'+(i!=null?'[data-i="'+i+'"]':''));return el?{c:el.parentNode.className,ti:el.parentNode.title||'',ph:el.placeholder}:null;},A,sid,k,i);
const td=(sid,sel)=>p.evaluate((A,sid,sel)=>{const t=document.querySelector(A+'tr[data-sid="'+sid+'"] '+sel);return t?{t:t.textContent,c:t.className,ti:t.title||''}:null;},A,sid,sel);
const ev=(sid,per=0,cid=CID)=>p.evaluate((sid,k)=>{const s=window.CJR.byId(sid);return s&&s.ev&&s.ev[k]?JSON.parse(JSON.stringify(s.ev[k])):null;},sid,cid+'|'+per);
const hd=()=>p.evaluate(()=>[...document.querySelectorAll('#procWrap thead th.t')].map(t=>t.textContent));
await goTab('proc');
const st=await p.evaluate(()=>({act:document.querySelector('#tabs button.active').dataset.tab,evt:document.getElementById('procEvt').value,ntr:document.getElementById('procNtr').value,sess:document.querySelectorAll('#procWrap th[data-sess],#procWrap td.c').length,bar:document.getElementById('procEval').textContent}));
const h0=await hd();
check('onglet Note procéd. (sans colonnes de séances) : épreuve « poids » déduite de « Lancer du poids », 3 essais par défaut, Essai 1-3 (cm) · Produit /7 · Perf. /7 · Procéd. /14',st.act==='proc'&&st.evt==='poids'&&st.ntr==='3'&&st.sess===0&&JSON.stringify(h0)==='["Essai 1cm","Essai 2cm","Essai 3cm","Produit/7","Perf./7","Procéd./14"]',JSON.stringify([st.evt,st.ntr,st.sess,h0]));
const fit={};for(const W of [375,390]){await p.setViewport({width:W,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});await sleep(250);fit[W]=await p.evaluate(()=>{const w=document.getElementById('procWrap');return [w.scrollWidth,w.clientWidth,document.documentElement.scrollWidth-innerWidth];});}
check('iPhone 375 et 390 px : élève + 3 essais + Produit + Perf. + Procéd. tiennent sans défilement horizontal',Object.values(fit).every(x=>x[0]<=x[1]+1&&x[2]<=0),JSON.stringify(fit));
check('barre : barème appliqué au meilleur essai, palier supérieur entre deux paliers, Produit modifiable, Performance à la main',/Produit \/7 \+ Performance \/7 = 14/.test(st.bar)&&/meilleur essai/.test(st.bar)&&/entre deux paliers → note du palier supérieur/.test(st.bar)&&/Performance saisie à la main/.test(st.bar),st.bar.slice(-260));
await ess('s0',0,'920');
const e0=await ev('s0'),c0=await cls('s0','g1'),b0=await cls('s0','essai',0);
check('exemple du propriétaire : 2BAC garçon, poids, 1er essai 920 cm → Produit 5,25/7 (calculé, case « auto », meilleur essai en évidence, palier 15/20)',(await val('s0','g1'))==='5,25'&&e0.prodAuto===true&&JSON.stringify(e0.essais)==='["920"]'&&e0.perfEvent==='poids'&&/auto/.test(c0.c)&&/best/.test(b0.c)&&/920 cm → palier 15\/20 → Produit 5,25/.test(b0.ti),JSON.stringify([e0,c0,b0]));
check('la note Performance (comportement moteur) reste vide et manuelle',(await val('s0','g2'))===''&&e0.g2==null);
await type('s0','g2','6');check('Performance saisie à la main (6) → Procéd. 11,25 ; Produit toujours calculé',(await td('s0','td.sub')).t==='11,25'&&(await ev('s0')).prodAuto===true&&(await ev('s0')).g2===6);
// essais multiples
await ess('s2',0,'8,75 m');const m1=await val('s2','g1');await ess('s2',1,'893');const m2=await val('s2','g1');await ess('s2',2,'948');const m3=await val('s2','g1');const bb=await cls('s2','essai',2),b1x=await cls('s2','essai',0);
check('trois essais : 8,75 m → 4,9 ; + 893 → 5,25 ; + 948 → 5,6 ; le meilleur (essai 3) est mis en évidence',m1==='4,9'&&m2==='5,25'&&m3==='5,6'&&/best/.test(bb.c)&&!/best/.test(b1x.c),JSON.stringify([m1,m2,m3]));
await ess('s1',0,'640');await ess('s1',1,'abc');const f1=await cls('s1','essai',1);
check('fille (barème F) : 640 → 5,25 ; essai illisible « abc » signalé et ignoré',(await val('s1','g1'))==='5,25'&&/bad/.test(f1.c)&&/Format non reconnu/.test(f1.ti),JSON.stringify(f1));
// forçage manuel du Produit
await type('s2','g1','6');const fo=await cls('s2','g1'),e2=await ev('s2');
check('forçage manuel du Produit (6 au lieu de 5,6) : prodAuto retiré, case « ✎ » orange avec le barème rappelé',e2.g1===6&&!e2.prodAuto&&/forced/.test(fo.c)&&/Produit saisi à la main \(barème : 5,6\)/.test(fo.ti),JSON.stringify([e2,fo]));
await ess('s2',1,'1010');check('nouvel essai (1010) : le Produit saisi à la main (6) est conservé',(await ev('s2')).g1===6&&(await val('s2','g1'))==='6');
await type('s2','g1','');const re=await ev('s2');
check('Produit effacé → barème réappliqué au meilleur essai (1010 → 5,95)',re.g1===5.95&&re.prodAuto===true&&(await val('s2','g1'))==='5,95',JSON.stringify(re));
// sexe manquant
const ns=await cls('s4','essai',0);const s4b=await p.evaluate(()=>JSON.stringify(window.CJR.byId('s4')));
await ess('s4',0,'900');const s4a=await p.evaluate(()=>window.CJR.byId('s4'));
check('sexe absent de la fiche : cases signalées (« sexe ? »), essai gardé, aucune note calculée, fiche inchangée',/nosex/.test(ns.c)&&ns.ph==='sexe ?'&&!s4a.sex&&JSON.stringify(s4a.ev[CID+'|0'].essais)==='["900"]'&&s4a.ev[CID+'|0'].g1==null&&(()=>{const x=JSON.parse(s4b),y=JSON.parse(JSON.stringify(s4a));delete x.ev;delete y.ev;return JSON.stringify(x)===JSON.stringify(y);})(),JSON.stringify([ns,s4a.ev]));
// effacement
await ess('s7',0,'700');const g7=await val('s7','g1');await ess('s7',0,'');
check('effacement du seul essai : Produit calculé et entrée supprimés',g7==='5,6'&&(await ev('s7'))===null&&(await val('s7','g1'))==='',g7);
// nombre d’essais
await p.select('#procNtr','4');await sleep(300);const h4=await hd();await p.select('#procNtr','3');await sleep(300);
check('nombre d’essais réglable (4 → colonne Essai 4, retour à 3)',h4.filter(x=>/^Essai/.test(x)).length===4&&(await hd()).filter(x=>/^Essai/.test(x)).length===3,JSON.stringify(h4));
await ess('s3',0,'560');await ess('s5',0,'455');await ess('s6',0,'1180');await type('s1','g2','5');await type('s3','g2','4,5');await type('s6','g2','6,5');
await shotProc('/tmp/v28a-proc.png');
// synchro Notes /20
await notes();
const n0={g1:await val('s0','g1'),g1c:(await cls('s0','g1')).c,g2:await val('s0','g2'),s2:await val('s2','g1')};
check('Notes /20 (onglet Absences) : mêmes notes (Produit 5,25 « auto », Perf. 6 ; s2 5,95)',n0.g1==='5,25'&&/auto/.test(n0.g1c)&&n0.g2==='6'&&n0.s2==='5,95',JSON.stringify(n0));
await type('s0','con','2');const tot0=(await td('s0','td.tot')).t;
check('Notes /20 : Note = 5,25 + 6 + 2 + 3 = 16,25',tot0==='16,25',tot0);
for(const [sid,c] of [['s1','2'],['s3','2,5'],['s6','3']])await type(sid,'con',c);
await type('s3','g1','5');
await shotNotes('/tmp/v28a-notes.png');
await goTab('proc');
const back={g1:await val('s3','g1'),c:(await cls('s3','g1')).c,sub:(await td('s3','td.sub')).t};
check('Notes /20 → onglet Note procéd. : Produit 5 tapé à la main (marqué ✎), Procéd. 9,5',back.g1==='5'&&/forced/.test(back.c)&&back.sub==='9,5',JSON.stringify(back));
// changement d’épreuve
dlgAns=false;dialogs.length=0;await p.select('#procEvt','vitesse');await sleep(300);
check('changement d’épreuve avec des essais saisis : confirmation ; refus → rien ne change',dialogs.length===1&&/essais déjà saisis/.test(dialogs[0])&&(await p.evaluate(()=>document.getElementById('procEvt').value))==='poids'&&(await val('s0','g1'))==='5,25',JSON.stringify(dialogs));
dlgAns=true;await p.select('#procEvt','vitesse');await sleep(300);
const ch={s0:await val('s0','g1'),s3:await val('s3','g1'),raw:await p.evaluate(A=>document.querySelector(A+'tr[data-sid="s0"] input[data-k="essai"]').value,A),c:(await cls('s0','essai',0)).c};
check('épreuve changée (vitesse) : « 920 » impossible pour un sprint → Produit calculé retiré, essai signalé et gardé ; Produit manuel (5) intact',ch.s0===''&&ch.s3==='5'&&ch.raw==='920'&&/bad/.test(ch.c),JSON.stringify(ch));
await p.select('#procEvt','poids');await sleep(300);
check('retour au poids → Produit recalculé (5,25)',(await val('s0','g1'))==='5,25'&&(await ev('s0')).prodAuto===true);
// 1BAC : Produit /7 (barème) + Performance /6
await p.evaluate(()=>{const s=document.getElementById('procClass');s.value='c1b';s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(300);
const h1=await hd();await ess('b0',0,'1150');await type('b0','g2','6,5');const r1={g1:await val('b0','g1'),g2:await val('b0','g2')};await type('b0','g2','6');
check('1BAC : Produit /7 (barème) · Performance /6 = /13 ; poids 1150 → 7 ; Performance 6,5 refusée ; 6 → Procéd. 13',JSON.stringify(h1)==='["Essai 1cm","Essai 2cm","Essai 3cm","Produit/7","Perf./6","Procéd./13"]'&&r1.g1==='7'&&r1.g2===''&&(await td('b0','td.sub')).t==='13',JSON.stringify([h1,r1]));
await p.evaluate(CID=>{const s=document.getElementById('procClass');s.value=CID;s.dispatchEvent(new Event('change',{bubbles:true}));},CID);await sleep(300);
// persistance
await p.reload({waitUntil:'networkidle2'});await unlock();await sleep(300);await goTab('proc');
const per=await p.evaluate(CID=>({evt:document.getElementById('procEvt').value,g1:document.querySelector('#procWrap tr[data-sid="s0"] input[data-k="g1"]').value,es:[...document.querySelectorAll('#procWrap tr[data-sid="s2"] input[data-k="essai"]')].map(x=>x.value),ev:window.CJR.db().evals.evt[CID+'|0']}),CID);
check('après rechargement : épreuve, essais et notes conservés',per.evt==='poids'&&per.g1==='5,25'&&JSON.stringify(per.es)==='["8,75 m","1010","948"]'&&per.ev==='poids',JSON.stringify(per));
// ancien aperçu : perfRaw → essai 1
const lg=await p.evaluate(()=>{const n=window.CJR.normEv?window.CJR.normEv({'x|0':{perfRaw:'920',perfAuto:true,g2:5}}):null;return n;});
if(lg)check('données de l’aperçu précédent (perfRaw) relues comme essai 1, ancienne note Performance gardée comme note manuelle',JSON.stringify(lg)==='{"x|0":{"g2":5,"essais":["920"]}}',JSON.stringify(lg));
// PDF
async function pdf(){await p.evaluate(()=>{window.__lastPdf=null;});await p.evaluate(()=>document.getElementById('procGradesPdf').click());try{await p.waitForFunction(()=>window.__lastPdf,{timeout:30000});}catch(e){return null;}
  const r=await p.evaluate(async()=>{const x=window.__lastPdf,buf=new Uint8Array(await x.blob.arrayBuffer());let s='';for(let i=0;i<buf.length;i+=8192)s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192));return btoa(s);});
  const f='/tmp/v28a_'+Date.now()+'.pdf';fs.writeFileSync(f,Buffer.from(r,'base64'));return {f,t:cp.execSync('pdftotext -layout '+f+' -').toString()};}
const pd=await pdf();const T=pd?pd.t.replace(/[ \t]+/g,' '):'',T1=T.replace(/\s+/g,' ');
check('PDF relevé : colonne « Meilleur essai » (920 cm), Produit calculé 5,25, Produit forcé marqué « * », règle du palier supérieur expliquée',!!pd&&/Meilleur/.test(T)&&/AIT BENALI Yassine 920 cm 5,25 6 11,25/.test(T)&&/DAOUDI Imane 560 cm 5\s*\* 4,5 9,5/.test(T)&&/barème OP 2007 2BAC/.test(T1)&&/prend la note du palier supérieur/.test(T1),pd&&T.split('\n').filter(l=>/AIT BENALI|DAOUDI/.test(l)).join(' / '));
if(pd)fs.copyFileSync(pd.f,'/tmp/v28a-athle.pdf');
// données
const after=await p.evaluate(K=>JSON.parse(localStorage.getItem(K)),KEY);
const canon=o=>Array.isArray(o)?o.map(canon):o&&typeof o==='object'?Object.keys(o).sort().reduce((a,k)=>(a[k]=canon(o[k]),a),{}):o;
const strip=o=>{const c=JSON.parse(JSON.stringify(o));c.students.forEach(s=>delete s.ev);delete c.evals;delete c.ui;delete c.lastBackup;return canon(c);};
{const x=strip(base),y=strip(after);for(const k of Object.keys(x))if(JSON.stringify(x[k])!==JSON.stringify(y[k])){if(Array.isArray(x[k]))x[k].forEach((e,i)=>{if(JSON.stringify(e)!==JSON.stringify(y[k][i]))console.log('DIFF',k,i,JSON.stringify(e),'||',JSON.stringify(y[k][i]));});else console.log('DIFF',k);}}
const evKeys=new Set();after.students.forEach(s=>Object.values(s.ev||{}).forEach(e=>Object.keys(e).forEach(k=>evKeys.add(k))));
check('données inchangées hors s.ev et DB.evals ; champs ev : g1, g2, con, aps, t, essais, perfEvent, prodAuto',JSON.stringify(strip(base))===JSON.stringify(strip(after))&&[...evKeys].every(k=>['g1','g2','con','aps','t','essais','perfEvent','prodAuto'].includes(k)),[...evKeys].join(','));
check('aucune erreur de page',errs.length===0,errs.join(' | ').slice(0,300));
srv.close();await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);
// captures (390 px, barre du bas visible)
async function shotProc(f){await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();});await sleep(2600);
  await p.evaluate(()=>{const g=document.getElementById('procEval');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-150);});await sleep(300);await p.screenshot({path:f});}
async function shotNotes(f){await p.evaluate(()=>{document.activeElement&&document.activeElement.blur();});await sleep(2600);
  await p.evaluate(()=>{const g=document.getElementById('attEval');window.scrollTo(0,g.getBoundingClientRect().top+window.scrollY-112);const w=document.getElementById('gridWrap');w.scrollLeft=w.scrollWidth;});await sleep(300);await p.screenshot({path:f});}
})().catch(e=>{console.log('FATAL',e);process.exit(1);});
