/* 1.29.2 (za) : Paramètres — sous-titres gris masqués sous chaque titre (téléphone et ordinateur), lignes compactes et régulières ;
   titres, icônes, chevrons et valeurs de droite conservés ; résumés toujours calculés (affichage seulement). Port 8236. Lancer depuis cj-emu. */
const puppeteer=require('puppeteer-core'),fs=require('fs');const {serve,open,tab,sleep}=require('/workspace/cj-emu/pc_h.js');
const D='/workspace/cj-deploy',PORT=8236,OUT=process.env.SHOTS||'';serve(D,PORT);
let pass=0,fail=0;const check=(n,ok,x)=>{ok?pass++:fail++;console.log((ok?'PASS':'FAIL')+' - '+n+(ok?'':' '+JSON.stringify(x)));};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
 for(const [w,h,theme] of [[390,844,''],[1280,800,''],[360,740,'neon'],[1280,800,'terrain']]){const p=await open(b,PORT,{w,h,theme});await tab(p,'settings');await sleep(1200);
  const r=await p.evaluate(()=>[...document.querySelectorAll('#psList .ps-row')].filter(e=>e.getClientRects().length).map(e=>{const s=e.querySelector('small[data-ps-sum]'),v=e.querySelector('.ps-val'),c=e.querySelector('.ps-chev'),t=e.querySelector('.ps-tx b'),i=e.querySelector('.ps-ico');
   return{k:e.getAttribute('data-ps-open')||e.id,h:e.clientHeight,l2:t&&t.getBoundingClientRect().height>24,t:t&&t.getClientRects().length?t.textContent:'',sum:s?s.textContent:null,sumShown:!!(s&&s.getClientRects().length),val:v?v.textContent:'',valShown:!!(v&&v.textContent&&v.getClientRects().length),chev:!!(c&&c.getClientRects().length),ico:!!(i&&i.getClientRects().length)};}));
  const tag=' — '+w+' px'+(theme?' '+theme:'');const std=r;const hs=[...new Set(std.filter(x=>!x.l2).map(x=>x.h))];
  check('sous-titres gris masqués sur toutes les lignes ('+std.length+', dont « Mon Cahier Journalier »)'+tag,std.length>=10&&std.some(x=>x.k==='cjc')&&r.every(x=>!x.sumShown),r.filter(x=>x.sumShown).map(x=>x.k));
  check('résumés toujours calculés (ex. Classes : '+((std.find(x=>x.k==='cls')||{}).sum||'').slice(0,30)+'…)'+tag,/classe/.test((std.find(x=>x.k==='cls')||{}).sum||'')&&/sauvegarde/i.test((std.find(x=>x.k==='bk')||{}).sum||''),std.map(x=>[x.k,x.sum]));
  check('titres, icônes et chevrons visibles'+tag,std.every(x=>x.t&&x.ico&&x.chev),std.filter(x=>!(x.t&&x.ico&&x.chev)));
  check('valeurs de droite conservées (classes, vacances, sauvegardes, thème « Actuel »)'+tag,['cls','hol','snap','theme'].every(k=>{const x=std.find(y=>y.k===k);return x&&x.valShown;}),std.map(x=>[x.k,x.val,x.valShown]));
  check('lignes compactes et régulières (titre sur une ligne : '+hs.join('/')+' px ; titre long sur 2 lignes ≤ 54 px)'+tag,hs.length===1&&hs[0]<=48&&std.every(x=>x.h<=54),std.map(x=>[x.k,x.h,x.l2]));
  check('aucune erreur JS'+tag,!p.errs.length,p.errs);
  if(OUT&&!theme){await p.evaluate(()=>scrollTo(0,0));await sleep(200);await p.screenshot({path:OUT+'/parametres-'+w+'.png'});}
  /* sous-page « Mon Cahier Journalier » : vrai toucher, bouton sur une ligne, cj-cahier.js non chargé */
  await p.evaluate(()=>document.getElementById('cjcRow').scrollIntoView({block:'center'}));await p.click('#cjcRow');await sleep(700);
  const q=await p.evaluate(()=>{const b=document.getElementById('cjcBtn'),c=b.getBoundingClientRect();return{cur:CJPS.cur(),title:document.getElementById('psTitle').textContent,txt:b.textContent,vis:c.width>0&&c.top>=0&&c.bottom<=innerHeight,one:b.scrollWidth<=b.clientWidth&&c.height<=48,cah:!!window.CJCahier||[...document.scripts].some(s=>/cj-cahier/.test(s.src))};});
  check('vrai toucher « Mon Cahier Journalier » → sous-page, bouton « Télécharger la version physique (PAPERASSE) ⬇️ » sur une ligne, cj-cahier.js non chargé'+tag,q.cur==='cjc'&&q.title==='Mon Cahier Journalier'&&q.txt==='Télécharger la version physique (PAPERASSE) ⬇️'&&q.vis&&q.one&&!q.cah,q);
  if(OUT&&!theme&&w<600)await p.screenshot({path:OUT+'/mon-cahier-sous-page-'+w+'.png'});
  if(w<600){await p.click('#psBack');await sleep(500);check('« ‹ Paramètres » revient à la liste'+tag,await p.evaluate(()=>!CJPS.cur()&&!document.getElementById('psList').hidden));}
  await p.ctx.close();}
 await b.close();console.log(pass+'/'+(pass+fail)+' passed');process.exit(fail?1:0);})().catch(e=>{console.log('FAIL - exception '+e.stack);process.exit(1);});
