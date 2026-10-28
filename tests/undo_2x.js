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
 ["(«\\u00a0VMA\\u00a0»)","(«\\u00a0navette\\u00a0», «\\u00a0palier\\u00a0», «\\u00a0VMA\\u00a0»)"],["'cahier-v29-2z'","'cahier-v29-2w'"],['<div class="csvline" hidden>','<div class="csvline">']];
const PDF=[["function allTests(){var out=[];(A.TESTV||A.TESTS).forEach(","function allTests(){var out=[];A.TESTS.forEach("],["list.forEach(function(s){(A.TESTV||A.TESTS).forEach(function(t){cells++;","list.forEach(function(s){A.TESTS.forEach(function(t){cells++;"],
 ["endurance\u00a0: VMA (navette)","navette et VMA comptent comme un seul test d’endurance"],["'FC rep.','VMA',","'FC rep.','Palier','VMA',"],
 ["var units=['','','','cm','kg','','cm','cm','bpm','km/h',","var units=['','','','cm','kg','','cm','cm','bpm','','km/h',"],["['dv','dh','fc','vma','v30','soup','mb','eq'].forEach","['dv','dh','fc','nav','vma','v30','soup','mb','eq'].forEach"]];
const rep=(L,x)=>L.reduce((t,[a,b])=>t.split(a).join(b),x);
const missing=(L,x)=>L.filter(([a])=>!x.includes(a)).map(([a])=>a.slice(0,50));
module.exports={IDX,PDF,index:x=>rep(IDX,x),pdf:x=>rep(PDF,x),missing,
 desk2w:D=>cp.execSync('git -C '+D+' show backup-pre-1.29.2x:desk.js').toString(),
 /* fichier tel qu’il était juste avant 2x (desk.js) ou avec les changements 2x défaits */
 college:x=>require('./undo_2y.js').college(x).replace(/\n\/\* 1\.29\.2 \(x\) : « Relevé de notes \(CSV\) »[\s\S]*$/,'\n'),
 file:(D,f,x)=>f==='college.js'?module.exports.college(x):f==='desk.js'?module.exports.desk2w(D):f==='cj-pdf.js'?rep(PDF,x):f==='index.html'?rep(IDX,x):x};
