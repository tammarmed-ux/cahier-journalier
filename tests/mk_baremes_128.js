/* PNG lisible des barèmes OP 2007 transcrits (op2007-athle.js) — cellules douteuses en jaune, correction du propriétaire en vert */
const puppeteer=require('puppeteer-core');global.window={};require('/workspace/cj-deploy/op2007-athle.js');const O=window.OP2007_ATHLE;
const DOUBT={ // niveau|sexe|épreuve → paliers (1..20) : motif
 'TC|G|triple':{15:'écart +34/+36 (au lieu de +35)'},'TC|F|triple':{19:'787 : écart +44 puis +26 (≈ 778 attendu ?)'},
 '1BAC|F|poids':{14:'578 : écart +28 puis +40'},'1BAC|G|vitesse':{7:'écart −0,4',8:'cellule fusionnée',9:'cellule fusionnée',15:'cellule fusionnée',16:'cellule fusionnée',17:'cellule fusionnée',18:'cellule fusionnée',19:'2 décimales',20:'2 décimales'},
 '2BAC|G|vitesse':{2:'écart −0,4',18:'écart −0,4',19:'2 décimales',20:'2 décimales'},'TC|G|hauteur':{12:'écart irrégulier',13:'écart irrégulier'},'1BAC|G|hauteur':{9:'101 : arrondi irrégulier'},
 'TC|F|endurance':{3:'imprimé « 4.2 » = 4′20″',8:'imprimé « 3.4 » = 3′40″',13:'imprimé « 3 » = 3′00″',18:'imprimé « 2.2 » = 2′20″'},
 '1BAC|G|endurance':{2:'cellule fusionnée',3:'cellule fusionnée',4:'cellule fusionnée',17:'cellule fusionnée',18:'cellule fusionnée',19:'cellule fusionnée'},
 '2BAC|F|poids':{16:'cellule fusionnée',17:'cellule fusionnée'},'2BAC|F|vitesse':{16:'cellule fusionnée',17:'cellule fusionnée'}};
const FIX={'1BAC|G|poids':{20:'source « 115 » → 1150 (confirmé par le propriétaire)'}};
const evL={endurance:['1000 m','600 m','mn.ss'],poids:['Poids 4 kg','Poids 3 kg','cm'],vitesse:['80 m','60 m','s'],triple:['Triple saut','Triple saut','cm'],longueur:['Longueur','Longueur','m'],hauteur:['Hauteur','Hauteur','cm']};
const fr=x=>String(x).replace('.',',');
let h=`<!doctype html><meta charset="utf-8"><style>body{font:13px/1.25 "DejaVu Sans",Arial,sans-serif;margin:24px;color:#101828;background:#fff;width:1500px}
h1{font-size:22px;margin:0 0 4px;color:#0b2545}p{margin:2px 0 10px;color:#475467}h2{font-size:17px;margin:22px 0 6px;color:#0b2545}
table{border-collapse:collapse;width:100%}th,td{border:1px solid #d0d5dd;padding:3px 4px;text-align:center;white-space:nowrap}thead th{background:#eef2f9;font-size:12px}
td.n{background:#f8fafc;font-weight:700;color:#1d4ed8}td.r{color:#667085}tr:nth-child(even) td{background-image:linear-gradient(#0000000a,#0000000a)}
td.d{background:#fef3c7!important;outline:2px solid #f59e0b;outline-offset:-2px}td.f{background:#dcfce7!important;outline:2px solid #16a34a;outline-offset:-2px;font-weight:700}
th.g{background:#e0ecff}th.fe{background:#fde7f1}.lg span{display:inline-block;padding:2px 8px;margin-right:10px;border-radius:4px}ul{margin:4px 0 0;padding-left:18px;color:#344054;font-size:12px}</style>
<h1>Barèmes OP 2007 – athlétisme, transcrits dans op2007-athle.js (Cahier d’EPS 1.28.0, aperçu)</h1>
<p>Seule la colonne Note/06 (TC, pas 0,30) ou Note/07 (1BAC, 2BAC, pas 0,35) est utilisée ; la colonne Note/20 est ignorée. Temps en mn.ss (5.17 = 5 min 17 s), sprint en secondes, poids / triple saut / hauteur en cm, longueur en m.
Règle : une performance entre deux paliers prend la note du palier supérieur ; moins bien que le palier 1 → note du palier 1 si l’écart ne dépasse pas celui des paliers 1 → 2, sinon 0 ; palier 20 atteint ou dépassé → note maximale.</p>
<p class="lg"><span style="background:#fef3c7;outline:2px solid #f59e0b">cellule à vérifier</span><span style="background:#dcfce7;outline:2px solid #16a34a">corrigée par le propriétaire</span> G = garçons · F = filles · motifs détaillés en bas de page</p>`;
const notes=[];
['TC','1BAC','2BAC'].forEach(lv=>{const st=O.step[lv],mx=O.max[lv];
  h+=`<h2>${lv} – note /${String(mx).padStart(2,'0')} (pas ${fr(st.toFixed(2))})</h2><table><thead><tr><th rowspan=2>Palier</th><th rowspan=2>Note</th>`;
  O.order.forEach(e=>{h+=`<th colspan=2>${e==='endurance'?'Endurance':e==='vitesse'?'Vitesse':evL[e][0].replace(' 4 kg','')} <small>(${evL[e][2]})</small></th>`;});
  h+='</tr><tr>';O.order.forEach(e=>{h+=`<th class="g">G ${e==='endurance'||e==='vitesse'||e==='poids'?evL[e][0].replace('Poids ',''):''}</th><th class="fe">F ${e==='endurance'||e==='vitesse'||e==='poids'?evL[e][1].replace('Poids ',''):''}</th>`;});
  h+='</tr></thead><tbody>';
  for(let i=0;i<20;i++){h+=`<tr><td class="r">${i+1}</td><td class="n">${fr((st*(i+1)).toFixed(2))}</td>`;
    O.order.forEach(e=>['G','F'].forEach(sx=>{const k=lv+'|'+sx+'|'+e,d=DOUBT[k]&&DOUBT[k][i+1],f=FIX[k]&&FIX[k][i+1];const v=O.grids[lv][sx][e][i];
      if(d)notes.push(`${lv} ${sx==='G'?'garçons':'filles'} ${e} palier ${i+1} (${fr(v)}) : ${d}`);if(f)notes.push(`${lv} garçons ${e} palier ${i+1} : ${f}`);
      h+=`<td class="${f?'f':d?'d':''}" title="${f||d||''}">${e==='endurance'?String(v):fr(v)}</td>`;}));h+='</tr>';}
  h+='</tbody></table>';});
h+='<h2>Cellules à vérifier (lisibles, mais irrégulières ou fusionnées dans l’image source)</h2><ul>'+notes.map(n=>'<li>'+n+'</li>').join('')+'</ul>';
require('fs').writeFileSync('/tmp/baremes128.html',h);
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});const p=await b.newPage();await p.setViewport({width:1550,height:1000,deviceScaleFactor:1.5});
 await p.goto('file:///tmp/baremes128.html');await p.screenshot({path:'/workspace/cj128-baremes-transcrits.png',fullPage:true});await b.close();console.log(notes.length+' notes');})();
