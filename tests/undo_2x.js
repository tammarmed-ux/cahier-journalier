/* 1.29.2 (x) : défait les changements propres à 2x pour que les tests des versions précédentes comparent seulement LEUR changement.
   2x = barre latérale ordinateur (desk.js réécrit : comparé au desk.js de backup-pre-1.29.2x), cache cahier-v29-2x,
   « Test navette (palier) » masqué (index.html, cj-pdf.js), carte « Tableaux Excel (CSV) » masquée (index.html) et bloc « Relevé de notes (CSV) » en fin de college.js. */
const cp=require('child_process');
const IDX=[["{k:'nav',hid:1,l:","{k:'nav',l:"],["\n/* 1.29.2 (x) : « Test navette (palier) » masqué (même rôle que la VMA) ; valeurs enregistrées conservées */\nvar TESTV=TESTS.filter(function(t){return !t.hid;});",""],
 ["aria-label=\"Test\">'+TESTV.map(","aria-label=\"Test\">'+TESTS.map("],["if(k&&TESTK[k]&&!TESTK[k].hid)testK=k;","if(k&&TESTK[k])testK=k;"],
 ["var TI_RX=[['sid',/massar|\\bcode\\b|\\bcne\\b|matricule|\\bid\\b/],","var TI_RX=[['sid',/massar|\\bcode\\b|\\bcne\\b|matricule|\\bid\\b/],['nav',/navette|palier|leger|\\bluc\\b/],"],
 ["t=String(st.notes||''),v={},m;\n      m=/","t=String(st.notes||''),v={},m;\n      m=/(?:test\\s+)?(?:navette|palier|luc[\\s-]*l[ée]ger|l[ée]ger)[^0-9\\n]{0,25}?(\\d{1,2}(?:[.,]\\d{1,2})?)/i.exec(t);if(m)v.nav=tiNum(m[1]);\n      m=/"],
 ["'+TESTV.map(function(t){return '<option value=\"'+t.k+'\"'+(TI.map[j]","'+TESTS.map(function(t){return '<option value=\"'+t.k+'\"'+(TI.map[j]"],["(Taille, Poids, VMA,","(Taille, Poids, Navette, VMA,"],
 ["  TESTV.forEach(function(t){var v=phys(s,t.k);","  TESTS.forEach(function(t){var v=phys(s,t.k);"],["TESTS:TESTS,TESTV:TESTV,","TESTS:TESTS,"],
 ["(«\\u00a0VMA\\u00a0»)","(«\\u00a0navette\\u00a0», «\\u00a0palier\\u00a0», «\\u00a0VMA\\u00a0»)"],["'cahier-v29-2a-test'","'cahier-v29-2w'"],['<div class="csvline" hidden>','<div class="csvline">']];
/* 2z : une seule barre de défilement sur l’écran d’accès (CSS ajouté après la règle html,body overflow-x) */
IDX.unshift(["html.cj-locked,html:has(>body>#cjLock){overflow:hidden}",""],["/* 1.29.2 (d) pas de défilement horizontal ; bloc A compact ; date/heure iOS ; (z) accès/PIN : 1 ascenseur */","/* 1.29.2 (d) : jamais de défilement horizontal de la page (seule la grille défile, dans son cadre) ; groupes compacts dans le bloc A ; champs date/heure iOS alignés */"]);
/* 2z (g) : déconnexion / visite hors session → /accueil/ ; ancienne page d’accueil intégrée retirée (texte d’origine relu dans backup-pre-1.29.2z) */
{const Z0=cp.execSync('git -C '+require('path').join(__dirname,'..')+' show backup-pre-1.29.2z:index.html').toString(),
 cut=(a,b)=>{const i=Z0.indexOf(a);return Z0.slice(i,Z0.indexOf(b,i));},
 LAND='<!-- 1.29.2 (z) : ancienne page d’accueil intégrée retirée (remplacée par /accueil/) -->\n<div id="landing" hidden></div>',
 Z1=require('fs').readFileSync(require('path').join(__dirname,'..','index.html'),'utf8'),
 ES=(()=>{const i=Z1.indexOf('<script>/* 1.29.2 (z) : hors session');return Z1.slice(i,Z1.indexOf('</script>',i)+9);})();
 IDX.unshift([ES,cut('<script>/* page d’accueil publique','<meta name="format-detection"').replace(/\n$/,'')],
  [LAND,cut('<!-- Page d’accueil publique : HTML statique','\n<!-- Login gate')],
  ["function toLanding(){if(window.CJAcc)window.CJAcc();}","function toLanding(){H.classList.add('cj-land');var l=document.getElementById('landing');if(l)l.scrollTop=0;}"],
  ["ui(true);try{sessionStorage.removeItem('cj.login');}catch(e){}setTimeout(function(){if(window.CJAcc)CJAcc();},400);});","ui(true);});"],
  ["  if(!S.auth1){S.auth1=1;if(!u&&window.CJAcc&&CJAcc(1))return;}   /* 1.29.2 (z) : visite hors session → /accueil/ */\n",""],
  ["html.cj-sa #gate .g-back{display:none}",""]);}
/* 2za : sous-titres gris de Paramètres masqués, lignes compactes */
IDX.unshift([".ps-tx small{display:none}/* 2za : sous-titres gris masqués (résumés toujours calculés) */",".ps-tx small:empty{display:none}"],["padding:7px 12px 7px 14px;min-height:48px;","padding:9px 12px 9px 14px;min-height:56px;"]);
IDX.unshift(["\nheader.top .h-ver,#dkSide .h-ver{display:none!important}header.top .h-title+.sub{margin-top:6px}/* 2zb : numéro de version retiré de l’en-tête (toujours dans Paramètres › À propos) */",""]);
const PDF=[["function allTests(){var out=[];(A.TESTV||A.TESTS).forEach(","function allTests(){var out=[];A.TESTS.forEach("],["list.forEach(function(s){(A.TESTV||A.TESTS).forEach(function(t){cells++;","list.forEach(function(s){A.TESTS.forEach(function(t){cells++;"],
 ["endurance\u00a0: VMA (navette)","navette et VMA comptent comme un seul test d’endurance"],["'FC rep.','VMA',","'FC rep.','Palier','VMA',"],
 ["var units=['','','','cm','kg','','cm','cm','bpm','km/h',","var units=['','','','cm','kg','','cm','cm','bpm','','km/h',"],["['dv','dh','fc','vma','v30','soup','mb','eq'].forEach","['dv','dh','fc','nav','vma','v30','soup','mb','eq'].forEach"]];
const rep=(L,x)=>L.reduce((t,[a,b])=>t.split(a).join(b),x);
const missing=(L,x)=>L.filter(([a])=>!x.includes(a)).map(([a])=>a.slice(0,50));
module.exports={IDX,PDF,index:x=>rep(IDX,x),pdf:x=>rep(PDF,x),missing,
 desk2w:D=>cp.execSync('git -C '+D+' show backup-pre-1.29.2x:desk.js').toString(),
 /* fichier tel qu’il était juste avant 2x (desk.js) ou avec les changements 2x défaits */
 /* 2za : ligne « Mon Cahier Journalier » → sous-page (bloc exact défait, voir undo_2za_college.json) */
 college:x=>require('./undo_2y.js').college(rep(require('./undo_2za_college.json'),x)).replace(/\n\/\* 1\.29\.2 \(x\) : « Relevé de notes \(CSV\) »[\s\S]*$/,'\n'),
 file:(D,f,x)=>f==='college.js'?module.exports.college(x):f==='desk.js'?module.exports.desk2w(D):f==='cj-pdf.js'?rep(PDF,x):f==='index.html'?rep(IDX,x):x};
