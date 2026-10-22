/* TATABO3 1.29.2 (j) — mode Collège. Chargé après le démarrage (hors préchargement, jamais bloquant).
   Additif : réglage facultatif DB.settings.school ('college' | 'lycee') ; absent = Lycée → comportement, notes, PDF et exports inchangés.
   Si une ancienne version retire ce réglage, le choix gardé sur l’appareil (localStorage « cahier.school ») puis les noms de classes (1AC, 2AC, 3AC…) le remplacent.
   Collège (OP 2009) : 1AC/2AC/3AC · athlétisme produit 6 + performance 8/7/6 · sports collectifs individuel 6 + collectif 8/7/6 (bandes N1…N4 du lycée adaptées + gain du match 2) ·
   gymnastique 14/13/12 · conceptuel 3 · comportemental 3/4/5 · service 24 h · ASS facultative (mercredi et vendredi 15:00–17:00).
   Barèmes d’athlétisme : baremes_op2009_college_final.json (validé le 21/10/2026), table générée par tests/build_college.py. */
(function(){
var R=window.CJR,X=R&&R.cx;if(!X||X.CX.ready)return;var CX=X.CX,TX=R.TX;CX.ready=1;
var LK='cahier.school';
var GR=/*OP2009*/{"1AC":{"G":{"endurance":["6.12","6.04","5.56","5.48","5.40","5.32","5.24","5.16","5.08","5.00","4.52","4.44","4.36","4.28","4.20","4.12","4.04","3.56","3.48","3.40"],"poids":[194,214,234,254,274,294,314,334,354,374,414,454,494,539,584,629,674,719,764,809],"vitesse":[18.5,18.1,17.7,17.3,16.8,16.4,16,15.6,15.2,14.8,14.3,13.9,13.5,13.1,12.7,12.2,11.8,11.4,11,10.6],"triple":[415,440,465,490,515,540,565,590,615,640,665,690,715,750,785,820,855,890,925,960],"longueur":[1.05,1.2,1.35,1.5,1.65,1.8,1.95,2.1,2.25,2.4,2.55,2.7,2.85,3,3.15,3.3,3.45,3.6,3.75,3.9],"hauteur":[48,51.5,55,58.5,62,65.5,69,72.5,76,79.5,83,86.5,90,95,100,105,110,115,120,125]},"F":{"endurance":["4.49","4.41","4.33","4.25","4.17","4.09","4.01","3.53","3.45","3.37","3.29","3.21","3.13","3.05","2.57","2.49","2.41","2.33","2.25","2.17"],"poids":[114,139,164,189,214,239,264,289,314,339,374,409,444,484,524,564,604,644,684,724],"vitesse":[14.6,14.3,14,13.7,13.4,13.1,12.8,12.5,12.2,11.9,11.6,11.3,11,10.7,10.4,10.1,9.8,9.5,9.2,8.9],"triple":[230,255,280,305,330,355,380,405,430,455,480,505,530,565,600,635,670,705,740,775],"longueur":[0.78,0.92,1.06,1.2,1.34,1.48,1.62,1.76,1.9,2.04,2.18,2.32,2.46,2.6,2.74,2.88,3.02,3.16,3.3,3.44],"hauteur":[34,37,40,43,46,49,52,55,58,61,64,67,70,75,80,85,90,95,100,105]}},"2AC":{"G":{"endurance":["6.1","6.02","5.54","5.46","5.38","5.3","5.22","5.14","5.06","4.58","4.5","4.42","4.34","4.26","4.18","4.1","4.02","3.54","3.46","3.38"],"poids":[221,241,261,281,301,321,341,361,381,401,441,481,521,571,621,671,721,771,821,871],"vitesse":[18.5,18.1,17.7,17.3,16.8,16.4,16,15.6,15.2,14.8,14.3,13.9,13.5,13.1,12.7,12.2,11.8,11.4,11,10.6],"triple":[420,445,470,495,520,545,570,595,620,645,670,695,720,755,790,825,860,895,930,965],"longueur":[1.32,1.47,1.62,1.77,1.92,2.07,2.22,2.37,2.52,2.67,2.82,2.97,3.12,3.27,3.42,3.57,3.72,3.87,4.02,4.17],"hauteur":[53,56.5,60,63.5,67,70.5,74,77.5,81,84.5,88,91.5,95,100,105,110,115,120,125,130]},"F":{"endurance":["4.47","4.39","4.31","4.23","4.15","4.07","3.59","3.51","3.43","3.35","3.27","3.19","3.11","3.03","2.55","2.47","2.39","2.31","2.23","2.15"],"poids":[139,164,189,214,239,264,289,314,339,364,399,434,469,509,549,589,629,669,709,749],"vitesse":[14.5,14.2,13.9,13.6,13.3,13,12.7,12.4,12.1,11.8,11.5,11.2,10.9,10.6,10.3,10,9.7,9.4,9.1,8.8],"triple":[241,266,291,316,341,366,391,416,441,466,491,516,541,576,611,646,681,716,751,786],"longueur":[0.68,0.82,0.96,1.1,1.24,1.38,1.52,1.66,1.8,1.94,2.08,2.22,2.36,2.5,2.64,2.78,2.92,3.06,3.2,3.34],"hauteur":[39,42,45,48,51,54,57,60,63,66,69,72,75,80,85,90,95,100,105,110]}},"3AC":{"G":{"endurance":["5.55","5.47","5.39","5.31","5.23","5.15","5.07","4.59","4.51","4.43","4.35","4.27","4.19","4.11","4.03","3.55","3.47","3.39","3.31","3.23"],"poids":[308,328,348,368,388,408,428,448,468,488,528,568,608,658,708,758,808,858,908,958],"vitesse":[17.9,17.5,17.1,16.7,16.3,15.9,15.4,15,14.6,14.2,13.8,13.4,13,12.6,12.2,11.8,11.4,11,10.6,10.1],"triple":[427,452,477,502,527,552,577,602,627,652,677,702,727,762,797,832,867,902,937,972],"longueur":[1.49,1.64,1.79,1.94,2.09,2.24,2.39,2.54,2.69,2.84,2.99,3.14,3.29,3.44,3.59,3.74,3.89,4.04,4.19,4.34],"hauteur":[58,61.5,65,68.5,72,75.5,79,82.5,86,89.5,93,96.5,100,105,110,115,120,125,130,135]},"F":{"endurance":["4.46","4.38","4.3","4.22","4.14","4.06","3.58","3.5","3.42","3.34","3.26","3.18","3.1","3.02","2.54","2.46","2.38","2.3","2.22","2.14"],"poids":[180,205,230,255,280,305,330,355,380,405,440,475,510,545,580,615,650,685,720,755],"vitesse":[14.5,14.2,13.9,13.6,13.3,13,12.7,12.4,12.1,11.8,11.5,11.2,10.9,10.6,10.3,10,9.7,9.4,9.1,8.8],"triple":[260,285,310,335,360,385,410,435,460,485,510,535,560,595,630,665,700,735,770,805],"longueur":[0.77,0.91,1.05,1.19,1.33,1.47,1.61,1.75,1.89,2.03,2.17,2.31,2.45,2.59,2.73,2.87,3.01,3.15,3.29,3.43],"hauteur":[44,47,50,53,56,59,62,65,68,71,74,77,80,85,90,95,100,105,110,115]}}}/*/OP2009*/;
function ls(k,v){try{if(v===undefined)return localStorage.getItem(k);localStorage.setItem(k,v);}catch(e){}return null;}
function nrm(r){var s=String(r==null?'':r);try{s=s.normalize('NFD').replace(/[\u0300-\u036f]/g,'');}catch(e){}return s.toUpperCase().replace(/[^A-Z0-9]/g,'');}
/* niveau collège d’après le nom de la classe : 1AC3, 2ASC1, 3APIC2, « 1ère année collège », الأولى إعدادي… */
function colLv(s,r){var m=/^([123])(ERE|RE|ER|E|EME|IEME|ND|NDE)?(ANNEE)?(AC|ASC|APIC|COL)/.exec(s);if(m)return m[1]+'AC';
  m=/^(PREMIERE|DEUXIEME|TROISIEME)ANNEE(DU|DE|D)?(COL|AC)/.exec(s);if(m)return {P:'1AC',D:'2AC',T:'3AC'}[s[0]];
  r=String(r||'');if(/إعدادي|اعدادي/.test(r)){if(/أولى|اولى/.test(r))return '1AC';if(/ثانية/.test(r))return '2AC';if(/ثالثة/.test(r))return '3AC';}return '';}
function lycName(r){var s=nrm(r);return /جذع|باك/.test(String(r||''))||/^(TC|TRONCCOMMUN|[12](ERE|RE|ER|E|EME|IEME|ND|NDE)?(ANNEE)?(DU|DE|D)?BAC|PREMIEREANNEE|DEUXIEMEANNEE(DU|DE|D)?BAC)/.test(s);}
/* déduction d’après les classes qui ont des élèves (les classes vides créées à l’installation ne comptent pas) */
function infer(d){var c=0,l=0,h={};(d.students||[]).forEach(function(s){h[s.classId]=1;});(d.classes||[]).forEach(function(x){if(!h[x.id])return;if(colLv(nrm(x.name),x.name))c++;else if(lycName(x.name))l++;});return c>l?'college':l>c?'lycee':'';}
var MC={d:null,k:'',m:'lycee'};
function mode(){var d=R.db(),st=d.settings||{},lo=ls(LK)||'',k=(st.school||'')+'|'+lo+'|'+(d.students||[]).length+'|'+(d.classes||[]).map(function(c){return c.name;}).join('\n');
  if(MC.d===d&&MC.k===k)return MC.m;MC.d=d;MC.k=k;MC.m=st.school||(/^(college|lycee)$/.test(lo)?lo:'')||infer(d)||'lycee';return MC.m;}
function isC(){return mode()==='college';}

/* ---- crochets du cœur (index.html : CX) ---- */
CX.lv=function(s,r){return isC()?colLv(s,r):'';};
CX.dlv=function(){return isC()?'1AC':'2BAC';};
CX.cap=function(){return isC()?'1AC 3 · 2AC 4 · 3AC 5':'TC 5 · 1BAC 4 · 2BAC 3';};
R.cxMode=mode;R.cxCap=function(){return isC()?'(OP 2009)\u00a0: 1AC 3 · 2AC 4 · 3AC 5':null;};
var L3=['1AC','2AC','3AC'];
L3.forEach(function(l,i){X.LEVEL_CAP[l]=[3,4,5][i];X.APS.coll.max[l]=[6,[8,7,6][i]];X.APS.athle.max[l]=[6,[8,7,6][i]];X.APS.gym.max[l]=[[14,13,12][i]];X.TT_LV[l]=l;});
/* sports collectifs (même principe que le lycée) : individuel /6 = bandes TC/1BAC ; collectif = attaque + défense (N1…N4) + gain du match (V 2 · E 1,5 · D 1, inchangé)
   1AC 6 + 2 = 8 (bandes TC × 1,5, demi-points exacts) · 2AC 5 + 2 = 7 (bandes 1BAC/2BAC) · 3AC 4 + 2 = 6 (bandes TC) */
var B6=[[0,1],[1,2],[3,4],[5,6]];X.SC_IND['1AC']=B6;X.SC_IND['2AC']=B6;X.SC_IND['3AC']=B6;
X.SC_COL['1AC']=[[0,1.5],[1.5,3],[3,4.5],[4.5,6]];X.SC_COL['2AC']=[[0,1],[1,2],[2.5,3.5],[4,5]];X.SC_COL['3AC']=[[0,1],[1,2],[2,3],[3,4]];
var xi=X.LVO.indexOf('x');X.LVO.splice(xi<0?X.LVO.length:xi,0,'1AC','2AC','3AC');
var O=window.OP2007_ATHLE;if(O&&O.grids)L3.forEach(function(l){if(GR[l]){O.grids[l]=GR[l];O.max[l]=6;O.step[l]=0.3;}});

/* ---- textes (lycée : textes d’origine) ---- */
var T0={capAuto:TX.clsCapAuto,ph:TX.clsNamePh},P0=null,Q0=null;
TX.clsCapAuto=function(v){var t=T0.capAuto(v);return isC()?t.replace(/\(OP 2007\)\s?:\s?TC 5 · 1BAC 4 · 2BAC 3/,'(OP 2009) : 1AC 3 · 2AC 4 · 3AC 5'):t;};
function texts(){var c=isC(),p=document.querySelector('#clsSheet .pq-hd+p.small'),q=document.querySelector('#procCard+p.small');
  if(q){if(Q0==null)Q0=q.textContent;var u=c?Q0.replace('barème OP 2007','barème OP 2009'):Q0;if(q.textContent!==u)q.textContent=u;}TX.clsNamePh=c?'ex. 1AC3':T0.ph;var i=document.getElementById('clsName');if(i&&i.placeholder===(c?T0.ph:'ex. 1AC3'))i.placeholder=TX.clsNamePh;
  if(p){if(P0==null)P0=p.textContent;var t=c?P0.replace('1BACLSH1','1AC3').replace(/\(OP 2007\)(\s*:\s*)TC 5 · 1BAC 4 · 2BAC 3/,function(x,sp){return '(OP 2009)'+sp+'1AC 3 · 2AC 4 · 3AC 5';}):P0;if(p.textContent!==t)p.textContent=t;}}

/* ---- styles (3 thèmes) ---- */
var css='html{--cx-a:#0B3A6E;--cx-on:#fff;--cx-as:#8A5300;--cx-ass:#FFF3DC}html[data-theme="terrain"]{--cx-a:#1C6B3A}html[data-theme="neon"]{--cx-a:#C6FF00;--cx-on:#0A0A12;--cx-as:#FBCB4B;--cx-ass:#3A2E10}'+
 '.lv-1AC{--c:#0F766E;--s:#E3F4F1}.lv-2AC{--c:#6D28D9;--s:#F1EAFE}.lv-3AC{--c:#B54703;--s:#FDEEE3}'+
 'html[data-theme="neon"] #ttCard .lv-1AC{--c:#2DD4BF;--s:#0F2E2B}html[data-theme="neon"] #ttCard .lv-2AC{--c:#B69CFF;--s:#241B3D}html[data-theme="neon"] #ttCard .lv-3AC{--c:#FF9F5A;--s:#3A2414}'+
 '#cxChoice h2{margin:0 0 14px}.cx-tiles{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:4px}'+
 '.cx-tile{position:relative;border:1.5px solid color-mix(in srgb,currentColor 18%,transparent);border-radius:14px;padding:14px 10px 12px;text-align:center;background:transparent;color:inherit;font:inherit;cursor:pointer}'+
 '.cx-tile .ic{display:block;font-size:26px;line-height:1}.cx-tile b{display:block;font-size:16px;margin-top:6px}.cx-tile small{display:block;font-size:11.5px;opacity:.7;margin-top:3px;line-height:1.3}'+
 '.cx-tile[aria-checked="true"]{border-color:var(--cx-a);box-shadow:0 0 0 1.5px var(--cx-a);background:color-mix(in srgb,var(--cx-a) 8%,transparent)}'+
 '.cx-tile[aria-checked="true"]:after{content:"✓";position:absolute;top:7px;right:8px;width:20px;height:20px;border-radius:50%;background:var(--cx-a);color:var(--cx-on);font-size:12px;font-weight:800;line-height:20px}'+
 '.cx-tile:focus-visible{outline:3px solid var(--cx-a);outline-offset:2px}#cxGo[disabled]{opacity:.55}'+
 '.cx-seg{display:grid;grid-template-columns:1fr 1fr;background:color-mix(in srgb,currentColor 8%,transparent);border-radius:12px;padding:4px;gap:4px;margin:2px 0 12px}'+
 '.cx-seg button{all:unset;box-sizing:border-box;text-align:center;padding:10px 0;border-radius:9px;font-weight:750;font-size:15px;cursor:pointer}.cx-seg button[aria-checked="true"]{background:var(--cx-a);color:var(--cx-on);box-shadow:0 1px 4px rgba(0,0,0,.18)}.cx-seg button:focus-visible{outline:3px solid var(--acc);outline-offset:-3px}'+
 '.cx-box{border:1px solid var(--line);border-radius:12px;overflow:hidden;margin:0 0 4px;background:var(--card)}'+
 '.cx-row{display:flex;align-items:center;gap:10px;padding:10px 12px;border-top:1px solid var(--line);font-size:14px}.cx-row:first-child{border-top:0}.cx-row .t{flex:1;min-width:0}.cx-row .t b{display:block;font-size:14.5px}.cx-row .t small{display:block;color:var(--muted);font-size:12px}'+
 '.cx-row.off{opacity:.5}.cx-as{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:22px;padding:0 7px;border-radius:7px;font-size:11.5px;font-weight:800;color:var(--cx-as);background:var(--cx-ass)}'+
 '.cx-sw{-webkit-appearance:none;appearance:none;margin:0;width:42px;height:25px;border-radius:999px;background:color-mix(in srgb,currentColor 22%,transparent);position:relative;flex:none;cursor:pointer;transition:background .15s}'+
 '.cx-sw:after{content:"";position:absolute;top:3px;left:3px;width:19px;height:19px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .15s}.cx-sw:checked{background:var(--cx-a)}.cx-sw:checked:after{left:20px}'+
 'html[data-theme="neon"] .cx-sw:checked:after{background:#0A0A12}.cx-sw:focus-visible{outline:3px solid var(--acc);outline-offset:2px}.cx-sw:disabled{opacity:.5}'+
 '#cxCard .ps-cap{margin:16px 4px 6px}#cxSvc{margin:10px 4px 0}';
var st=document.createElement('style');st.id='cxCss';st.textContent=css;document.head.appendChild(st);

/* ---- service et ASS ---- */
function fh(m){var h=Math.floor(m/60),r=Math.round(m%60);return h+' h'+(r?' '+(r<10?'0':'')+r:'');}
var SL=[{day:3,id:'tASm',l:'Mercredi'},{day:5,id:'tASv',l:'Vendredi'}];
function slotIs(t,s){return X.isAS(t)&&t.day===s.day&&t.start==='15:00'&&t.end==='17:00';}
function slotNew(s){return {id:s.id+X.uid().slice(-4),type:'as',day:s.day,start:'15:00',end:'17:00',classId:'',room:''};}
function asList(){return R.db().cal.tt.filter(X.isAS);}
function ro(){try{return !!(window.CJApp&&CJApp.viewing());}catch(e){return false;}}
function save(){MC.d=null;texts();X.persist();X.render();panel();}
var DEF=['1BACLSH1','1BACLSH2','1BACLSH3','1BACLSH4','2BACSP4','2BACSP5','2BACSP6','2BACSSVT1','2BACSSVT2'];
/* première ouverture → Collège : les 9 classes d’exemple créées à l’installation sont retirées SEULEMENT si elles sont intactes (aucun élève, séance, créneau, note ni réglage) */
function dropDef(d){var cs=d.classes;if(cs.length!==DEF.length||!cs.every(function(c,i){return c.name===DEF[i]&&c.capM==null&&c.pw==null;}))return;var id={};cs.forEach(function(c){id[c.id]=1;});
  if(d.students.length||Object.keys(d.sessions||{}).length||d.cal.tt.some(function(t){return id[t.classId];}))return;d.classes=[];if(d.ui)d.ui.cls='';}
function setMode(m,first){if(ro())return;var d=R.db(),tt=d.cal.tt,as=tt.filter(X.isAS);if(first&&m==='college')dropDef(d);d.settings.school=m;ls(LK,m);d.cal.asInit=true;
  if(m==='college'){if(d.cal.oblig===21)d.cal.oblig=24;
    if(as.length===1&&as[0].day===5&&as[0].start==='15:00'&&as[0].end==='18:00'){tt.splice(tt.indexOf(as[0]),1);SL.forEach(function(s){tt.push(slotNew(s));});}}   /* créneau AS du lycée jamais modifié → créneaux ASS du collège */
  else{if(d.cal.oblig===24)d.cal.oblig=21;
    if(as.length===2&&SL.every(function(s){return as.some(function(t){return slotIs(t,s);});})){as.forEach(function(t){tt.splice(tt.indexOf(t),1);});tt.push(X.defAS());}}
  save();}
function setSlot(s,on){if(ro())return;var d=R.db(),tt=d.cal.tt;d.cal.asInit=true;
  if(on){if(!tt.some(function(t){return slotIs(t,s);}))tt.push(slotNew(s));}else for(var i=tt.length-1;i>=0;i--)if(slotIs(tt[i],s))tt.splice(i,1);save();}
function setAll(on){if(ro())return;var d=R.db(),tt=d.cal.tt;d.cal.asInit=true;
  if(on)SL.forEach(function(s){if(!tt.some(function(t){return slotIs(t,s);}))tt.push(slotNew(s));});else for(var i=tt.length-1;i>=0;i--)if(X.isAS(tt[i]))tt.splice(i,1);save();}

/* ---- Paramètres › Établissement ---- */
var V=document.getElementById('view-settings'),card=null,row=null;
function e(t){return String(t==null?'':t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
/* 1.29.2 (n) : le panneau « Établissement » est retiré de Paramètres ; ses contrôles (Lycée | Collège, service, ASS — mêmes clés settings.school / cahier.school / cal.tt)
   forment la carte « Mon service » du panneau « Compte et synchronisation », sous la carte professionnelle (profil). */
function build(){if(!V||!window.CJPS||card)return;var sc=document.getElementById('syncCard');if(!sc)return;
  var w=document.createElement('div');w.id='pfWrap';w.innerHTML='<div id="pfCard"></div>';sc.parentNode.insertBefore(w,sc);
  card=document.createElement('div');card.className='card';card.id='cxCard';
  card.innerHTML='<h2>Mon service</h2><div class="cx-seg" role="radiogroup" aria-label="Vous êtes un enseignant de"><button type="button" role="radio" data-cxm="lycee">🎓 Lycée</button><button type="button" role="radio" data-cxm="college">🎒 Collège</button></div>'+
   '<div class="cx-box"><div class="cx-row"><div class="t"><b>Service obligatoire</b></div><b id="cxOb"></b></div><div class="cx-row"><div class="t"><b>Niveaux reconnus</b><small>d’après le nom des classes</small></div><b id="cxLv"></b></div></div>'+
   '<div id="cxAss"><div class="ps-cap">Association sportive scolaire (ASS)</div><div class="cx-box">'+
   '<label class="cx-row"><div class="t"><b>Participer à l’ASS</b><small>Créneaux comptés dans le service, sans séance ni appel</small></div><input type="checkbox" role="switch" class="cx-sw" id="cxAsOn" aria-label="Participer à l’ASS"></label>'+
   SL.map(function(s,i){return '<label class="cx-row" data-cxr="'+i+'"><span class="cx-as">ASS</span><div class="t"><b>'+s.l+' 15:00–17:00</b><small>2 h</small></div><input type="checkbox" role="switch" class="cx-sw" data-cxs="'+i+'" aria-label="ASS '+s.l+' 15:00–17:00"></label>';}).join('')+
   '</div></div><p class="small muted" id="cxSvc"></p>';
  w.appendChild(card);
  card.addEventListener('click',function(ev){var b=ev.target.closest('[data-cxm]');if(b&&b.getAttribute('aria-checked')!=='true')setMode(b.getAttribute('data-cxm'));});
  card.addEventListener('change',function(ev){var t=ev.target;if(t.id==='cxAsOn')setAll(t.checked);else if(t.hasAttribute('data-cxs'))setSlot(SL[+t.getAttribute('data-cxs')],t.checked);});
  pfInit();panel();}
function panel(){if(!card)return;var c=isC(),d=R.db(),sv=X.service(),as=asList(),r=ro();
  card.querySelectorAll('[data-cxm]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-cxm')===(c?'college':'lycee')));b.disabled=r;});
  card.querySelector('#cxOb').textContent=fh(Math.round(d.cal.oblig*60));card.querySelector('#cxLv').textContent=c?'1AC · 2AC · 3AC':'TC · 1BAC · 2BAC';
  card.querySelector('#cxAss').hidden=!c;var on=card.querySelector('#cxAsOn');on.checked=as.length>0;on.disabled=r;
  SL.forEach(function(s,i){var x=card.querySelector('[data-cxs="'+i+'"]');x.checked=as.some(function(t){return slotIs(t,s);});x.disabled=r||!as.length;card.querySelector('[data-cxr="'+i+'"]').classList.toggle('off',!as.length);});
  var ok=sv.tot===sv.ob;card.querySelector('#cxSvc').innerHTML=c?'Service\u00a0: classes '+fh(sv.cm)+' + ASS '+fh(sv.am)+' = <b style="color:var(--ink)">'+fh(sv.tot)+'</b>'+(ok?' ✓':' · service obligatoire '+fh(sv.ob)):'';
  if(row){var a=row.querySelector('[data-ps-sum]');a.textContent=(c?'Collège':'Lycée')+' · service '+fh(sv.ob)+(c?' · ASS '+fh(sv.am):'');}pfDraw();}
/* ---- Profil de l’enseignant — carte professionnelle (1.29.2 n, proposition C) ----
   Stockage (additif, aucune clé existante modifiée) :
   · settings.teacher (texte existant) est RÉÉCRIT seulement quand l’enseignant enregistre son profil : « M. Nom Prénom - Établissement » → en-tête, salutation, PDF inchangés sur toutes les versions ;
   · settings.profile = {civ, nom, pre, aref, prov, ville, etab, t} (liste blanche, textes ≤ 80, gardée par normalize depuis 1.29.2 n ; une version 1.29.1 le retire) ;
   · copie sur l’appareil localStorage « cahier.profile » = {teacher, p, dob} : remise dans settings.profile si une synchro 1.29.1 l’a retiré (seulement si settings.teacher est resté le même) ;
   · date de naissance : UNIQUEMENT dans cette copie locale (jamais dans les données, la synchro, les sauvegardes ni les PDF) ;
   · photo : stockage photo des élèves (IndexedDB, chiffrée comme elles, synchro users/{uid}/photos) sous l’identifiant réservé « _prof », 256 px JPEG ≤ 25 Ko ; absente → illustration M. / Mme.
   Rien n’est écrit tant que l’enseignant n’enregistre pas : le profil affiché est pré-rempli d’après settings.teacher. */
var PK='cahier.profile',PFID='_prof',PFK=['civ','nom','pre','aref','prov','ville','etab'],pfPh=null,pfPhOk=false;
var AREF=['Tanger-Tétouan-Al Hoceïma','L’Oriental','Fès-Meknès','Rabat-Salé-Kénitra','Béni Mellal-Khénifra','Casablanca-Settat','Marrakech-Safi','Drâa-Tafilalet','Souss-Massa','Guelmim-Oued Noun','Laâyoune-Sakia El Hamra','Dakhla-Oued Ed-Dahab'];
var PF_M='<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="48" fill="#DCE8F7"/><path d="M14 92c4-18 18-26 34-26s30 8 34 26" fill="#1E4E8C"/><path d="M40 62h16v10l-8 6-8-6z" fill="#E9B98F"/><path d="M38 70l10 8 10-8 4 2-14 14-14-14z" fill="#fff"/><ellipse cx="48" cy="42" rx="17" ry="20" fill="#F1C59C"/><path d="M30 40c0-14 8-21 18-21s18 7 18 21c-3-6-8-9-12-9-6 0-9 3-15 3-4 0-7 2-9 6z" fill="#2B2018"/><circle cx="41" cy="43" r="2" fill="#2B2018"/><circle cx="55" cy="43" r="2" fill="#2B2018"/><path d="M42 52c4 3 8 3 12 0" stroke="#9A5B3C" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M36 52c2 9 7 13 12 13s10-4 12-13c-2 3-6 5-12 5s-10-2-12-5z" fill="#3A2C22" opacity=".85"/></svg>';
var PF_F='<svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="48" fill="#FBE3EC"/><path d="M14 92c4-18 18-26 34-26s30 8 34 26" fill="#B4235A"/><path d="M28 46c0-18 9-28 20-28s20 10 20 28v22c-6 4-13 6-20 6s-14-2-20-6z" fill="#3B2418"/><path d="M41 62h14v10l-7 5-7-5z" fill="#E9B98F"/><ellipse cx="48" cy="43" rx="15" ry="18" fill="#F3CDA8"/><path d="M33 40c2-11 8-16 15-16s13 5 15 16c-5-6-10-8-15-8s-10 2-15 8z" fill="#3B2418"/><circle cx="42" cy="44" r="2" fill="#2B2018"/><circle cx="54" cy="44" r="2" fill="#2B2018"/><path d="M43 52c3 2 7 2 10 0" stroke="#B35454" stroke-width="2" fill="none" stroke-linecap="round"/></svg>';
var pfCss='#pfWrap{display:none}#view-settings.ps-sub[data-psv="sync"]>#pfWrap{display:block}'+
 '.pfC{position:relative;border-radius:18px;padding:16px;color:#fff;background:linear-gradient(135deg,var(--pri),color-mix(in srgb,var(--pri) 55%,var(--acc)));overflow:hidden;margin:0 0 12px;box-shadow:0 6px 18px rgba(0,0,0,.18)}'+
 'html[data-theme="neon"] .pfC{background:linear-gradient(135deg,#1B2A06,#0E3B44);border:1px solid #2F3A1A}html[data-theme="terrain"] .pfC{background:linear-gradient(135deg,#1F5F3A,#2E7D4F)}'+
 '.pfC:after{content:"";position:absolute;right:-30px;top:-30px;width:140px;height:140px;border-radius:50%;background:rgba(255,255,255,.08);pointer-events:none}'+
 '.pfC .top{display:flex;gap:12px;align-items:center;position:relative}.pfC .n{min-width:0}.pfC .n b{display:block;font-size:18px;line-height:1.2;overflow-wrap:anywhere}.pfC .n small{opacity:.85;font-size:12.5px}'+
 '.pfC .ty{display:inline-block;margin-top:6px;font-size:11px;font-weight:800;padding:2px 8px;border-radius:6px;background:rgba(255,255,255,.2);letter-spacing:.04em}'+
 '.pfC dl{display:grid;grid-template-columns:auto 1fr;gap:4px 10px;margin:12px 0 0;font-size:12.5px;position:relative}.pfC dt{opacity:.78}.pfC dd{margin:0;font-weight:650;overflow-wrap:anywhere}.pfC dd i{opacity:.75;font-weight:400}'+
 '.pfC .pf-ed{position:absolute;right:8px;top:8px;z-index:1;border:0;border-radius:10px;width:36px;height:36px;font-size:16px;color:#fff;background:rgba(255,255,255,.18);cursor:pointer}'+
 '.pf-av{position:relative;flex:none;width:76px;height:76px;border-radius:50%;padding:0;border:0;background:none;cursor:pointer}.pf-av>span{display:block;width:100%;height:100%;border-radius:50%;overflow:hidden;box-shadow:0 0 0 3px rgba(255,255,255,.85)}.pf-av svg,.pf-av img{width:100%;height:100%;display:block;object-fit:cover}'+
 '.pf-av i{position:absolute;right:-2px;bottom:-2px;width:26px;height:26px;border-radius:50%;background:#fff;color:#222;font-size:13px;line-height:26px;text-align:center;font-style:normal;box-shadow:0 1px 4px rgba(0,0,0,.3)}'+
 '.pf-hint{position:relative;margin:10px 0 0;font-size:12px;opacity:.9}'+
 '#pfBd{position:fixed;inset:0;z-index:1200;background:rgba(10,12,20,.45)}#pfBd[hidden],#pfS[hidden]{display:none}'+
 '#pfS{position:fixed;left:0;right:0;bottom:0;z-index:1201;max-width:560px;margin:0 auto;background:var(--card);color:var(--ink);border-radius:18px 18px 0 0;padding:14px 16px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25);max-height:88vh;overflow:auto}'+
 '#pfS h3{margin:0 0 10px;font-size:16px}#pfS label.f{display:block;margin:10px 0 4px}#pfS input,#pfS select{width:100%;box-sizing:border-box}#pfS .two{display:grid;grid-template-columns:1fr 1fr;gap:8px}'+
 '#pfS .lock{font-size:12px;color:var(--muted);margin-top:4px}#pfS .acts{display:flex;gap:8px;margin-top:14px}#pfS .acts .btn{flex:1}'+
 '#pfS .opt{all:unset;box-sizing:border-box;display:flex;align-items:center;gap:12px;width:100%;padding:12px 4px;border-top:1px solid var(--line);font-size:15px;cursor:pointer}#pfS .opt:first-of-type{border-top:0}#pfS .opt[disabled]{opacity:.45;cursor:default}#pfS .opt .i{width:30px;text-align:center;font-size:18px}'+
 '#pfS .avs{display:flex;gap:12px;align-items:center;margin:0 0 8px}#pfS .avs span{width:52px;height:52px;border-radius:50%;overflow:hidden;flex:none}#pfS .avs svg{width:100%;height:100%;display:block}#pfS .avs small{color:var(--muted);font-size:12px}'+
 '#pfS .opt:focus-visible,.pf-av:focus-visible,.pfC .pf-ed:focus-visible{outline:3px solid var(--acc);outline-offset:2px}';
var st3=document.createElement('style');st3.id='pfCss';st3.textContent=pfCss;document.head.appendChild(st3);
function pfCopy(){try{var c=JSON.parse(ls(PK)||'null');return c&&typeof c==='object'?c:null;}catch(x){return null;}}
function pfClean(p){var o={};PFK.forEach(function(k){var v=p&&p[k];if(typeof v==='string'&&v.trim())o[k]=v.trim().slice(0,80);});if(o.civ&&o.civ!=='M.'&&o.civ!=='Mme')delete o.civ;return o;}
function pfParse(t){var p=String(t||'').split(/\s+[–—-]\s+/),w=(p[0]||'').trim(),c='M.',m=/^(Mme|Mlle|M\.|E\.|Pr\.?)\s+/i.exec(w);if(m){if(/^ml?l?e$|^mme$/i.test(m[1]))c='Mme';w=w.slice(m[0].length);}
  var x=w.split(/\s+/).filter(Boolean);return pfClean({civ:c,nom:x[0]||'',pre:x.slice(1).join(' '),etab:p.slice(1).join(' - ')});}
function pfTeacher(p){var n=[p.civ,p.nom,p.pre].filter(Boolean).join(' ');return p.etab?(n?n+' - ':'')+p.etab:n;}
function pfHas(q){return !!(q&&typeof q==='object'&&PFK.some(function(k){return q[k];}));}
function pfOwn(c,s){return !!c&&(c.teacher===s.teacher||(pfHas(c.p)&&pfHas(s.profile)&&c.p.nom===s.profile.nom&&c.p.pre===s.profile.pre));}
/* profil affiché : enregistré → copie de l’appareil (si settings.teacher inchangé) → pré-rempli d’après settings.teacher */
function pfGet(){var s=R.db().settings,c=pfCopy(),own=pfOwn(c,s),q=pfHas(s.profile)?s.profile:own&&pfHas(c.p)?c.p:null;return {p:q||pfParse(s.teacher),saved:!!q,dob:own&&typeof c.dob==='string'?c.dob:''};}
/* après une synchro avec un appareil 1.29.1 (settings.profile retiré) : on le remet d’après la copie de l’appareil ; si le profil enregistré a changé ailleurs : la copie suit */
function pfReapply(){var s=R.db().settings,c=pfCopy();if(!c)return;
  if(pfHas(s.profile)){if(pfOwn(c,s)&&(c.teacher!==s.teacher||JSON.stringify(c.p)!==JSON.stringify(s.profile))){c.teacher=s.teacher;c.p=s.profile;ls(PK,JSON.stringify(c));}return;}
  if(pfHas(c.p)&&c.teacher===s.teacher&&!ro()){s.profile=pfClean(c.p);if(c.p.t>0)s.profile.t=+c.p.t;X.persist();}}
function pfSave(p,dob){if(ro())return;var s=R.db().settings,o=pfClean(p);o.t=Date.now();s.profile=o;s.teacher=pfTeacher(o);
  ls(PK,JSON.stringify({teacher:s.teacher,p:o,dob:/^\d{4}-\d{2}-\d{2}$/.test(dob||'')?dob:''}));X.persist();X.render();pfDraw();}
function pfAv(civ){return pfPhOk&&pfPh?'<img alt="" src="'+pfPh+'">':(civ==='Mme'?PF_F:PF_M);}
function pfLoadPh(){var P=R.photo;if(!P||!P.get)return;P.get(PFID).then(function(r){var d=r&&r.d,ok=typeof d==='string'&&/^data:image\/(jpeg|webp|png);base64,/.test(d);if(ok!==pfPhOk||d!==pfPh){pfPhOk=ok;pfPh=ok?d:null;pfDraw();}}).catch(function(){});}
function pfDob(d){return d?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'';}
var pfLast='';
function pfDraw(){var el=document.getElementById('pfCard');if(!el)return;var g=pfGet(),p=g.p,c=isC(),r=ro(),q=function(v,ph){return v?e(v):'<i>'+ph+'</i>';};
  var h='<div class="pfC">'+(r?'':'<button type="button" class="pf-ed" data-pf="edit" aria-label="Modifier le profil">✎</button>')+
   '<div class="top"><button type="button" class="pf-av" data-pf="photo" aria-label="Photo du profil'+(r?'':' : changer')+'"'+(r?' disabled':'')+'><span>'+pfAv(p.civ)+'</span>'+(r?'':'<i aria-hidden="true">📷</i>')+'</button>'+
   '<div class="n"><small>Professeur d’EPS</small><b>'+e([p.civ||'M.',p.nom,p.pre].filter(Boolean).join(' '))+'</b><span class="ty">'+(c?'COLLÈGE':'LYCÉE')+'</span></div></div>'+
   '<dl><dt>Établissement</dt><dd>'+q(p.etab,'à compléter')+'</dd><dt>AREF</dt><dd>'+q(p.aref,'à choisir')+'</dd><dt>Direction prov.</dt><dd>'+q(p.prov,'—')+'</dd><dt>Ville</dt><dd>'+q(p.ville,'—')+'</dd>'+
   '<dt>Naissance</dt><dd>'+(g.dob?e(pfDob(g.dob))+' <i>🔒 sur cet appareil</i>':'<i>🔒 sur cet appareil</i>')+'</dd></dl>'+
   (g.saved||r?'':'<p class="pf-hint">Pré-rempli d’après « '+e(R.db().settings.teacher||'—')+' » — touchez ✎ pour vérifier.</p>')+'</div>';
  if(h!==pfLast){pfLast=h;el.innerHTML=h;}}
function pfSheet(h){var bd=document.getElementById('pfBd'),sh=document.getElementById('pfS');if(!bd){bd=document.createElement('div');bd.id='pfBd';bd.hidden=true;sh=document.createElement('div');sh.id='pfS';sh.hidden=true;sh.setAttribute('role','dialog');sh.setAttribute('aria-modal','true');document.body.appendChild(bd);document.body.appendChild(sh);}
  if(h==null){bd.hidden=sh.hidden=true;sh.innerHTML='';return null;}sh.innerHTML=h;bd.hidden=sh.hidden=false;var f=sh.querySelector('input,button,select');if(f)f.focus({preventScroll:true});return sh;}
function pfEdit(){if(ro())return;var g=pfGet(),p=g.p,cv=p.civ||'M.',inp=function(id,l,v,ph){return '<label class="f" for="'+id+'">'+l+'</label><input type="text" id="'+id+'" maxlength="80" dir="auto" value="'+e(v||'')+'"'+(ph?' placeholder="'+e(ph)+'"':'')+'>';};
  var sh=pfSheet('<h3 id="pfT">Profil de l’enseignant</h3><div class="cx-seg" role="radiogroup" aria-label="Civilité">'+['M.','Mme'].map(function(c){return '<button type="button" role="radio" data-pfc="'+c+'" aria-checked="'+(c===cv)+'">'+c+'</button>';}).join('')+'</div>'+
   '<div class="two"><div>'+inp('pfNom','Nom',p.nom)+'</div><div>'+inp('pfPre','Prénom',p.pre)+'</div></div>'+
   '<label class="f" for="pfDob">Date de naissance</label><input type="date" id="pfDob" value="'+e(g.dob)+'"><div class="lock">🔒 Gardée sur cet appareil seulement (jamais envoyée, ni dans les sauvegardes ni dans les PDF)</div>'+
   '<label class="f" for="pfAref">Direction régionale (AREF)</label><select id="pfAref"><option value="">— Choisir —</option>'+AREF.map(function(a){return '<option'+(a===p.aref?' selected':'')+'>'+e(a)+'</option>';}).join('')+'</select>'+
   '<div class="two"><div>'+inp('pfProv','Direction provinciale',p.prov)+'</div><div>'+inp('pfVille','Ville',p.ville)+'</div></div>'+
   inp('pfEtab','Établissement de travail',p.etab,'ex. Lycée qualifiant …')+
   '<p class="small muted" style="margin:10px 0 0">Lycée / Collège, service et ASS : carte « Mon service ». Affiché en haut et sur les PDF : <b id="pfPrev"></b></p>'+
   '<div class="acts"><button type="button" class="btn sec" data-pf="cancel">Annuler</button><button type="button" class="btn" data-pf="save">Enregistrer</button></div>');
  sh.setAttribute('aria-labelledby','pfT');sh.dataset.civ=cv;pfPrev();}
function pfForm(){var sh=document.getElementById('pfS'),v=function(id){var x=sh.querySelector('#'+id);return x?x.value:'';};return {civ:sh.dataset.civ,nom:v('pfNom'),pre:v('pfPre'),aref:v('pfAref'),prov:v('pfProv'),ville:v('pfVille'),etab:v('pfEtab')};}
function pfPrev(){var b=document.getElementById('pfPrev');if(b)b.textContent=pfTeacher(pfClean(pfForm()))||'—';}
function pfPhotoSheet(){if(ro())return;var g=pfGet(),cv=g.p.civ||'M.';
  var sh=pfSheet('<h3 id="pfT">Photo du profil</h3><div class="avs"><span>'+PF_M+'</span><span>'+PF_F+'</span><small>Sans photo : illustration selon la civilité (M. / Mme)</small></div>'+
   '<button type="button" class="opt" data-pf="cam"><span class="i" aria-hidden="true">📷</span>Prendre une photo</button>'+
   '<button type="button" class="opt" data-pf="gal"><span class="i" aria-hidden="true">🖼</span>Choisir dans la galerie</button>'+
   '<button type="button" class="opt" data-pf="ill"'+(pfPhOk?'':' disabled')+'><span class="i" aria-hidden="true">↺</span>Revenir à l’illustration '+e(cv)+'</button>'+
   '<p class="small muted" style="margin:8px 0 0">Recadrée 256 px, ≤ 25 Ko, chiffrée et synchronisée comme les photos d’élèves.</p>'+
   '<input type="file" accept="image/*" capture="user" id="pfCam" hidden><input type="file" accept="image/*" id="pfGal" hidden>'+
   '<div class="acts"><button type="button" class="btn sec" data-pf="cancel">Fermer</button></div>');sh.setAttribute('aria-labelledby','pfT');}
/* photo : carré central 256 px, JPEG de qualité décroissante jusqu’à ≤ 25 Ko */
function pfFile(f){if(!f||!/^image\//.test(f.type||'image/'))return;var u=URL.createObjectURL(f),im=new Image();
  im.onload=function(){var c=document.createElement('canvas');c.width=c.height=256;var x=c.getContext('2d'),m=Math.min(im.naturalWidth,im.naturalHeight);
    x.fillStyle='#fff';x.fillRect(0,0,256,256);x.drawImage(im,(im.naturalWidth-m)/2,(im.naturalHeight-m)/2,m,m,0,0,256,256);URL.revokeObjectURL(u);
    var d=null,qs=[.86,.78,.7,.62,.54,.46,.38,.3];for(var i=0;i<qs.length;i++){var t=c.toDataURL('image/jpeg',qs[i]);if(Math.ceil((t.length-t.indexOf(',')-1)*3/4)<=25*1024){d=t;break;}}
    if(!d){toast2('Photo trop lourde, essayez une autre image.');return;}
    R.photo.set(PFID,d).then(function(){pfPh=d;pfPhOk=true;pfLast='';pfDraw();pfSheet(null);toast2('Photo du profil enregistrée');}).catch(function(){toast2('Photo non enregistrée');});};
  im.onerror=function(){URL.revokeObjectURL(u);toast2('Image illisible');};im.src=u;}
function toast2(t){var z=document.getElementById('toast');if(z&&window.CJApp&&CJApp.toast)CJApp.toast(t);else if(z){z.textContent=t;z.classList.add('show');setTimeout(function(){z.classList.remove('show');},2200);}}
function pfInit(){
  document.addEventListener('click',function(ev){var t=ev.target;if(!t.closest)return;
    if(t.closest('#pfBd')){pfSheet(null);return;}
    var c=t.closest('#pfS [data-pfc]');if(c){var sh=document.getElementById('pfS');sh.dataset.civ=c.getAttribute('data-pfc');sh.querySelectorAll('[data-pfc]').forEach(function(b){b.setAttribute('aria-checked',String(b===c));});pfPrev();return;}
    var b=t.closest('[data-pf]');if(!b||!t.closest('#pfCard,#pfS'))return;var a=b.getAttribute('data-pf');
    if(a==='edit')pfEdit();else if(a==='photo')pfPhotoSheet();else if(a==='cancel')pfSheet(null);
    else if(a==='save'){var dob=document.getElementById('pfDob').value;pfSave(pfForm(),dob);pfSheet(null);toast2('Profil enregistré');}
    else if(a==='cam')document.getElementById('pfCam').click();else if(a==='gal')document.getElementById('pfGal').click();
    else if(a==='ill'&&!ro()&&R.photo&&R.photo.del)R.photo.del(PFID).then(function(){pfPh=null;pfPhOk=false;pfLast='';pfDraw();pfSheet(null);toast2('Illustration rétablie');});});
  document.addEventListener('input',function(ev){if(ev.target.closest&&ev.target.closest('#pfS'))pfPrev();});
  document.addEventListener('change',function(ev){var t=ev.target;if(t.id==='pfCam'||t.id==='pfGal'){pfFile(t.files&&t.files[0]);t.value='';}});
  document.addEventListener('keydown',function(ev){if(ev.key==='Escape'){var sh=document.getElementById('pfS');if(sh&&!sh.hidden)pfSheet(null);}});
  var hs=document.getElementById('hdrSub');if(hs)new MutationObserver(function(){pfReapply();pfDraw();}).observe(hs,{childList:true,characterData:true,subtree:true});
  pfReapply();pfDraw();pfLoadPh();setTimeout(pfLoadPh,3000);}
build();texts();
document.addEventListener('click',function(ev){if(ev.target.closest&&ev.target.closest('#tabs button,[data-ps-open="sync"],#psBack'))setTimeout(function(){texts();panel();},0);},true);

/* ---- niveau de chaque classe, visible (1.29.2 k) ----
   Le niveau est lu dans le NOM de la classe (seule donnée de classe gardée par toutes les versions : 1.29.1 ne garde que id, name, cap, capM, pw, grp).
   Nom non reconnu : pastille « Niveau ? » + message là où l’on note ; choisir le niveau = renommer la classe (« 1AC-… »), après confirmation.
   Collège : aucune note /20 ni note procédurale calculée tant que le niveau est inconnu (« — », données non modifiées).
   Lycée : calcul inchangé (barème 2BAC par défaut, comme avant), signalé par la même pastille. */
var LVS={college:['1AC','2AC','3AC'],lycee:['TC','1BAC','2BAC']};
CX.unk=function(cid){if(!isC())return false;var c=R.cls(cid);return !!c&&!R.levelOf(c.name);};
CX.opt=function(c,sel){return sel&&/^(attClass|procClass|stuClassFilter)$/.test(sel.id)?' · '+(R.levelOf(c.name)||'Niveau ?'):'';};
css+='#clsManage .clb-p.cx-lvb{font-weight:750;background:color-mix(in srgb,var(--cx-a) 12%,var(--card));border-color:color-mix(in srgb,var(--cx-a) 35%,transparent);color:var(--ink)}'+
 'html[data-theme="neon"] #clsManage .clb-p.cx-lvb{background:#232A12;border-color:#5C7A00;color:#E8FF9E}'+
 '#clsManage .clb-p.cx-lvq,.cx-lvw{background:#FFF3DC;border:1px solid #F2C46B;color:#7A4A00}html[data-theme="neon"] #clsManage .clb-p.cx-lvq,html[data-theme="neon"] .cx-lvw{background:#3A2E10;border-color:#8A6A12;color:#FBCB4B}'+
 '.cx-lvw{border-radius:12px;padding:10px 12px;margin:0 0 10px;font-size:13.5px;line-height:1.35}.cx-lvw small{display:block;margin-top:6px;font-size:12px;opacity:.85}'+
 '.cx-lvp{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.cx-lvp button{all:unset;box-sizing:border-box;min-height:36px;padding:6px 14px;border-radius:999px;font-weight:750;font-size:14px;cursor:pointer;background:var(--card);color:var(--ink);border:1.5px solid currentColor}'+
 '.cx-lvp button.go{background:var(--cx-a);color:var(--cx-on);border-color:var(--cx-a)}.cx-lvp button:focus-visible{outline:3px solid var(--acc);outline-offset:2px}';
st.textContent=css;
function deco(){document.querySelectorAll('#clsManage .clb-card').forEach(function(k){var c=R.cls(k.dataset.clb),ch=k.querySelector('.clb-ch');if(!c||!ch)return;var l=R.levelOf(c.name),b=ch.querySelector('.cx-lvb'),t=l||'Niveau ?',cl='clb-p cx-lvb'+(l?'':' cx-lvq');
  if(!b){b=document.createElement('span');ch.insertBefore(b,ch.firstChild);}if(b.textContent!==t)b.textContent=t;if(b.className!==cl)b.className=cl;var ti=l?'Niveau reconnu dans le nom : '+l:'Niveau non reconnu dans le nom de la classe';if(b.title!==ti)b.title=ti;});}
function newName(c,l){return l+'-'+String(c.name).trim();}
function warn(){var cid=R.db().ui.cls,c=R.cls(cid),unk=!!c&&!R.levelOf(c.name),m=isC()?'college':'lycee';
  [['attCard','att'],['procCard','proc']].forEach(function(x){var card=document.getElementById(x[0]),id='cxLvW-'+x[1],w=document.getElementById(id);if(!card)return;
    if(!unk){if(w)w.parentNode.removeChild(w);return;}
    if(w&&w.getAttribute('data-cid')===cid&&w.getAttribute('data-m')===m)return;if(!w){w=document.createElement('div');w.id=id;w.className='cx-lvw';w.setAttribute('role','alert');card.parentNode.insertBefore(w,card);}
    w.setAttribute('data-cid',cid);w.setAttribute('data-m',m);
    w.innerHTML='<b>⚠ Niveau non reconnu</b> — choisis le niveau de «\u00a0'+e(c.name)+'\u00a0»\u00a0:<div class="cx-lvp">'+LVS[m].map(function(l){return '<button type="button" data-cxl="'+l+'">'+l+'</button>';}).join('')+'</div>'+
     '<small>Le niveau est lu dans le nom de la classe\u00a0: elle sera renommée (ex. «\u00a0'+e(newName(c,LVS[m][0]))+'\u00a0»), modifiable dans Paramètres › Classes. '+(m==='college'?'En attendant, les notes /20 restent «\u00a0—\u00a0» (rien n’est effacé).':'En attendant, barème 2BAC appliqué par défaut (comme avant).')+'</small>';});}
document.addEventListener('click',function(ev){var t=ev.target;if(!t.closest)return;var w=t.closest('.cx-lvw');if(!w)return;var c=R.cls(w.getAttribute('data-cid'));if(!c)return;
  var b=t.closest('[data-cxl]'),go=t.closest('[data-cxgo]'),no=t.closest('[data-cxno]');
  if(b&&!go){var l=b.getAttribute('data-cxl'),nn=newName(c,l);w.querySelector('.cx-lvp').innerHTML='<span style="flex-basis:100%">Renommer «\u00a0'+e(c.name)+'\u00a0» en «\u00a0'+e(nn)+'\u00a0»\u00a0?</span><button type="button" class="go" data-cxgo="'+l+'">Renommer</button><button type="button" data-cxno="1">Annuler</button>';return;}
  if(no){w.removeAttribute('data-cid');warn();return;}
  if(go&&!ro()){var nn2=newName(c,go.getAttribute('data-cxgo'));if(R.db().classes.some(function(x){return x!==c&&x.name===nn2;})){w.querySelector('.cx-lvp span').textContent='Une classe porte déjà le nom «\u00a0'+nn2+'\u00a0».';return;}
    c.name=nn2;MC.d=null;X.persist();X.render();setTimeout(function(){deco();warn();panel();},0);}});
function obs(id,f){var el=document.getElementById(id);if(el)new MutationObserver(function(){f();}).observe(el,{childList:true});}
obs('clsManage',deco);obs('gridWrap',warn);obs('procWrap',warn);deco();warn();
document.addEventListener('change',function(ev){if(ev.target&&/^(attClass|procClass)$/.test(ev.target.id))setTimeout(warn,0);},true);
/* ---- Paramètres › « Répartition cyclique » (1.29.2 l, proposition C) — affichage seulement ----
   Une frise des mois (repère « aujourd’hui ») + une ligne de temps : une carte par cycle (activité, type, dates, semaines, pauses de vacances).
   Les écrans d’origine (#calSettings « Dates des cycles », #periodNames « Cycles et activités ») restent dans la page avec leurs gestionnaires :
   ✎ dates = même bouton [data-cyed] ; ✎ activité / type = clic sur le ✎ d’origine [data-cybed] ; la carte d’origine ouverte s’affiche en feuille (dialogue).
   Mêmes champs, mêmes écritures ; rien n’est lu ni écrit ailleurs. Sans ce fichier : écran 1.29.2 (k) inchangé. */
(function(){
var M=['janv.','févr.','mars','avr.','mai','juin','juil.','août','sept.','oct.','nov.','déc.'];
var s2=document.createElement('style');s2.id='rcCss';
s2.textContent='html.rc-on #calSettings>.cy-head,html.rc-on #calSettings>.cy-tl,html.rc-on #calSettings>label.f,html.rc-on #cycDates>.cy-card:not(.ed),html.rc-on #periodNames>.cyb:not(.ed){display:none}'+
 'html.rc-on #cycDates,html.rc-on #periodNames{display:block;margin:0}'+
 'html.rc-on #cycDates>.cy-card.ed,html.rc-on #periodNames>.cyb.ed{position:fixed;left:0;right:0;bottom:0;z-index:1201;max-width:560px;margin:0 auto;border-radius:18px 18px 0 0;padding:14px 16px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -8px 30px rgba(0,0,0,.25);max-height:85vh;overflow:auto;outline:0;background:var(--card)}'+
 '#rcBd{position:fixed;inset:0;z-index:1200;background:rgba(10,12,20,.45)}#rcBd[hidden]{display:none}'+
 '.rc-ok{display:block;width:100%;margin-top:12px;min-height:42px;border-radius:12px;border:0;font:inherit;font-weight:750;background:var(--pri);color:#fff;cursor:pointer}html[data-theme="terrain"] .rc-ok{background:#FCD34D;color:#1A1A1A}html[data-theme="neon"] .rc-ok{background:#C6FF00;color:#0A0A12}'+
 '.rc-sh{display:block;font-size:12px;color:var(--muted);margin:0 0 8px}'+
 '#rcSec{margin:0 0 12px}#rcSec .rc-h{display:flex;align-items:center;justify-content:space-between;gap:8px}#rcSec .rc-h b{font-size:16px}'+
 '#rcSec .rc-sub{font-size:12.5px;color:var(--muted);margin:0}'+
 '#rcSec .rc-x0{--c:var(--cy0)}#rcSec .rc-x1{--c:var(--cy1)}#rcSec .rc-x2{--c:var(--cy2)}#rcSec .rc-x3{--c:var(--cy3)}#rcSec .rc-x4{--c:var(--cy4)}#rcSec .rc-x5{--c:var(--cy5)}'+
 '#rcSec .rc-fr{position:relative;margin:18px 0 4px}#rcSec .rc-fr .cy-tl{height:22px;border-radius:8px;margin:0}'+
 '#rcSec .rc-fr .cy-tl i[class^="cy-c"]{color:#fff;font:800 11px/22px system-ui,sans-serif;text-align:center;font-style:normal;overflow:hidden}html[data-theme="neon"] #rcSec .rc-fr .cy-tl i[class^="cy-c"]{color:#0A0A12}'+
 '#rcSec .rc-now{position:absolute;top:-4px;bottom:-4px;width:2px;margin-left:-1px;background:var(--ink);border-radius:2px}#rcSec .rc-now b{position:absolute;top:-16px;left:-26px;font-size:9.5px;white-space:nowrap}'+
 '#rcSec .rc-mo{position:relative;height:13px;font-size:10px;color:var(--muted);margin:3px 0 12px}#rcSec .rc-mo span{position:absolute;transform:translateX(-50%);white-space:nowrap}'+
 '#rcSec .rc-v{position:relative;padding-left:26px}#rcSec .rc-v:before{content:"";position:absolute;left:9px;top:8px;bottom:8px;width:2px;background:var(--line)}'+
 '#rcSec .rc-it{position:relative;margin-bottom:8px}#rcSec .rc-dot{position:absolute;left:-23px;top:12px;width:14px;height:14px;border-radius:50%;background:var(--c);border:3px solid var(--card);box-shadow:0 0 0 1px var(--line);box-sizing:border-box}'+
 '#rcSec .rc-it.on .rc-dot{box-shadow:0 0 0 3px color-mix(in srgb,var(--c) 40%,transparent)}'+
 '#rcSec .rc-k{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--c);border-radius:12px;padding:8px 9px}'+
 '#rcSec .rc-t,#rcSec .rc-m{display:flex;align-items:center;gap:6px}#rcSec .rc-m{margin-top:5px;flex-wrap:wrap}#rcSec .rc-t .rc-dt,#rcSec .rc-m .rc-ed{margin-left:auto}'+
 '#rcSec .rc-lab{font-size:12.5px;font-weight:800;color:var(--c)}'+
 '#rcSec .rc-pill{font-size:10px;font-weight:800;background:var(--acc);color:#fff;border-radius:6px;padding:1px 6px}html[data-theme="neon"] #rcSec .rc-pill{background:#C6FF00;color:#0A0A12}html[data-theme="terrain"] #rcSec .rc-pill{background:#FCD34D;color:#1A1A1A}'+
 '#rcSec .rc-act{font-weight:800;font-size:15px;line-height:1.25;display:flex;gap:6px;align-items:flex-start;margin-top:3px}#rcSec .rc-act svg{width:20px;height:20px;flex:none}'+
 '#rcSec .rc-ed{border:0;background:none;color:var(--muted);font-size:15px;width:32px;height:32px;margin:-6px -4px -6px 0;border-radius:8px;cursor:pointer}'+
 '#rcSec .rc-dt{border:1px solid var(--line);background:var(--bg);color:var(--ink);border-radius:8px;font:700 13px/1.2 system-ui,sans-serif;padding:5px 8px;cursor:pointer;white-space:nowrap;min-height:30px}#rcSec .rc-dt span{color:var(--muted);font-weight:400;margin-left:3px}'+
 '#rcSec .rc-ty{font:inherit;font-size:11.5px;padding:3px 8px;border-radius:999px;background:var(--bg);border:1px solid var(--line);color:var(--ink);cursor:pointer}#rcSec .rc-ty i{color:var(--muted);font-style:normal}'+
 'html[data-theme="neon"] #rcSec .rc-ty,html[data-theme="neon"] #rcSec .rc-dt{background:#1B1E27}#rcSec .rc-wk{font-size:11.5px;color:var(--muted)}'+
 '#rcSec .rc-gp{font-size:11px;color:var(--muted);margin:-2px 0 8px;display:flex;align-items:center;gap:6px}#rcSec .rc-gp i{display:inline-block;width:34px;height:8px;border-radius:4px;background:repeating-linear-gradient(135deg,var(--cyh1) 0 4px,var(--cyh2) 4px 8px)}'+
 '#rcSec button:focus-visible{outline:3px solid var(--acc);outline-offset:2px}';
document.head.appendChild(s2);
function q(s,r){return (r||document).querySelector(s);}
function iso(d){return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function dd(s){return new Date(s+'T12:00:00');}
var last='';
function build(){var cs=document.getElementById('calSettings'),pn=document.getElementById('periodNames');if(!cs||!pn||!q('#cycDates',cs))return;
  var sec=document.getElementById('rcSec');if(!sec){sec=document.createElement('section');sec.id='rcSec';sec.setAttribute('aria-label','Répartition cyclique');cs.parentNode.insertBefore(sec,cs);
    var bd=document.createElement('div');bd.id='rcBd';bd.hidden=true;document.body.appendChild(bd);document.documentElement.classList.add('rc-on');}
  var cyc=(R.db().cal||{}).cycles||[],P=[].map.call(pn.querySelectorAll('.cyb[data-cyb]'),function(k){var i=+k.dataset.cyb,d=q('#cycDates .cy-card[data-i="'+i+'"]'),n=k.querySelector('.cyb-n'),em=n&&n.querySelector('.act-em'),ty=k.querySelector('.cyb-ty');
    return {i:i,lab:(k.querySelector('.cyb-l')||{}).textContent||'',em:em?em.innerHTML:'',act:n?(em?n.textContent.replace(em.textContent,''):n.textContent).trim():'',ph:!!(n&&n.querySelector('i.muted')),ty:ty?ty.innerHTML:'',
      dt:d?(d.querySelector('.cy-d')||{}).firstChild.textContent.trim():'',wk:d?(d.querySelector('small')||{}).textContent||'':'',pill:d&&d.querySelector('.cy-pill')?d.querySelector('.cy-pill').textContent:'',on:!!(d&&d.classList.contains('on'))};});
  var ok=cyc.length&&cyc[0].from&&cyc[cyc.length-1].to,t0=ok?dd(cyc[0].from):0,t1=ok?dd(cyc[cyc.length-1].to):0,pos=function(x){return Math.max(0,Math.min(100,(x-t0)/(t1-t0)*100));};
  var tw=P.reduce(function(a,p){return a+(parseInt(p.wk,10)||0);},0),tl=q('.cy-tl',cs),fr='';
  if(tl){var c=tl.cloneNode(true),n=0;c.querySelectorAll('i[class^="cy-c"]').forEach(function(x){x.textContent=String(++n);});fr=c.outerHTML;}
  var mo='',now='';if(ok&&t1>t0){for(var y=t0.getFullYear(),m=t0.getMonth();new Date(y,m,1)<=t1;m++){var a=new Date(y,m,1),z=new Date(y,m+1,1);mo+='<span style="left:'+((pos(Math.max(a,t0))+pos(Math.min(z,t1)))/2).toFixed(1)+'%">'+M[a.getMonth()]+'</span>';}
    var td=iso(new Date());if(td>=cyc[0].from&&td<=cyc[cyc.length-1].to)now='<span class="rc-now" style="left:'+pos(dd(td)).toFixed(1)+'%"><b>aujourd’hui</b></span>';}
  /* 1.29.2 (m) : le titre est celui de la page (« Répartition cyclique », h2 du panneau) ; la carte garde ⓘ et le résumé sur une ligne */
  var h='<div class="rc-h"><span class="rc-sub">'+P.length+' cycles'+(ok?' · '+e(cyc[0].from.slice(8,10)+'/'+cyc[0].from.slice(5,7))+' → '+e(cyc[cyc.length-1].to.slice(8,10)+'/'+cyc[cyc.length-1].to.slice(5,7)):'')+(tw?' · '+tw+' semaines de cours':'')+'</span>'+
   '<button type="button" class="pq-ib pq-i cy-i" data-pq-open="cycSheet" aria-label="Comment sont utilisées ces dates ?" aria-haspopup="dialog" aria-expanded="false">ⓘ</button></div>'+
   (fr?'<div class="rc-fr" aria-hidden="true">'+fr+now+'</div><div class="rc-mo" aria-hidden="true">'+mo+'</div>':'')+'<div class="rc-v">'+
   P.map(function(p){var r=cyc[p.i]||{},r2=cyc[p.i+1]||{},g=r.to&&r2.from?Math.round((dd(r2.from)-dd(r.to))/864e5)-1:0;
    return '<div class="rc-it rc-x'+(p.i%6)+(p.on?' on':'')+'" data-rc="'+p.i+'"><span class="rc-dot" aria-hidden="true"></span><div class="rc-k">'+
     '<div class="rc-t"><span class="rc-lab">'+e(p.lab)+'</span>'+(p.pill?'<span class="rc-pill">'+e(p.pill)+'</span>':'')+
     '<button type="button" class="rc-dt" data-cyed="'+p.i+'" aria-label="Modifier les dates du '+e(p.lab)+'">'+e(p.dt)+'<span aria-hidden="true">✎</span></button></div>'+
     '<div class="rc-act" dir="auto">'+(p.em?'<span aria-hidden="true">'+p.em+'</span>':'')+(p.ph?'<i class="muted" style="font-weight:400">'+e(p.act)+'</i>':'<span>'+e(p.act)+'</span>')+'</div>'+
     '<div class="rc-m"><button type="button" class="rc-ty" data-rcact="'+p.i+'" aria-label="Type d’activité du '+e(p.lab)+' : modifier">'+p.ty+'</button><span class="rc-wk">'+e(p.wk)+'</span>'+
     '<button type="button" class="rc-ed" data-rcact="'+p.i+'" aria-label="Modifier l’activité du '+e(p.lab)+'">✎</button></div></div></div>'+
     (g>=7?'<div class="rc-gp"><i aria-hidden="true"></i>Pause · '+Math.round(g/7)+' sem. (vacances)</div>':'');}).join('')+'</div>';
  if(h!==last){last=h;sec.innerHTML=h;}
  sheet();}
/* feuille d’édition : la carte d’origine ouverte (.cy-card.ed / .cyb.ed) + bouton Terminé (même bouton bascule que le ✎ d’origine) */
function sheet(){var dc=q('#cycDates>.cy-card.ed'),ac=q('#periodNames>.cyb.ed'),bd=document.getElementById('rcBd');
  if(dc&&!dc.querySelector('.rc-ok')){dc.insertAdjacentHTML('beforeend','<button type="button" class="rc-ok" data-cyed="'+dc.dataset.i+'">Terminé</button>');dc.setAttribute('role','dialog');dc.setAttribute('aria-label','Dates du cycle '+(+dc.dataset.i+1));}
  if(ac&&!ac.querySelector('.rc-ok')){ac.insertAdjacentHTML('beforeend','<button type="button" class="rc-ok" data-cybed="1">Terminé</button>');ac.setAttribute('role','dialog');ac.setAttribute('aria-label','Activité du cycle '+(+ac.dataset.cyb+1));}
  if(bd){var on=!!(dc||ac);if(bd.hidden===on)bd.hidden=!on;}}
function closeAll(){var a=q('#periodNames>.cyb.ed [data-cybed]');if(a)a.click();var d=q('#cycDates>.cy-card.ed');if(d){var b=d.querySelector('.cy-d');if(b)b.click();}}
document.addEventListener('click',function(ev){var t=ev.target;if(!t.closest)return;
  if(t.closest('#rcBd')){closeAll();return;}
  var a=t.closest('#rcSec [data-rcact]');if(a){var i=a.getAttribute('data-rcact'),d=q('#cycDates>.cy-card.ed');if(d){var b=d.querySelector('.cy-d');if(b)b.click();}var k=q('#periodNames>.cyb[data-cyb="'+i+'"]');if(k&&!k.classList.contains('ed')){var x=k.querySelector('[data-cybed]');if(x)x.click();}setTimeout(sheet,0);return;}
  /* ouvrir les dates ferme l’activité ouverte (une seule feuille) */
  if(t.closest('#rcSec [data-cyed]')){var o=q('#periodNames>.cyb.ed [data-cybed]');if(o)o.click();}},true);
document.addEventListener('keydown',function(ev){if(ev.key==='Escape'&&(q('#cycDates>.cy-card.ed')||q('#periodNames>.cyb.ed')))closeAll();});
var tm=0;function sch(){if(!tm)tm=setTimeout(function(){tm=0;build();},0);}
['calSettings','periodNames'].forEach(function(id){var el=document.getElementById(id);if(el)new MutationObserver(sch).observe(el,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});});
build();
})();
/* les listes de classes déjà affichées reprennent leur libellé */
X.render();

/* ---- choix à la première ouverture : « Vous êtes un enseignant de : » ---- */
var asked=false,pick='';
/* écran à part (#cxGate) : copie de l’habillage de l’écran de connexion (règles CSS #gate recopiées), l’écran de connexion n’est jamais modifié */
function gateCss(){if(document.getElementById('cxGateCss'))return;var out=[];
  function walk(rs,wrap){[].forEach.call(rs,function(r){if(r.cssRules&&r.media){var a=[];walk(r.cssRules,a);if(a.length)out.push('@media '+r.media.mediaText+'{'+a.join('')+'}');return;}
    if(r.selectorText&&/#gate\b/.test(r.selectorText)&&!/cj-locked/.test(r.selectorText))(wrap||out).push(r.cssText.replace(/#gate\b/g,'#cxGate'));});}
  [].forEach.call(document.styleSheets,function(sh){try{walk(sh.cssRules,null);}catch(e){}});
  var st=document.createElement('style');st.id='cxGateCss';st.textContent=out.join('\n')+'#cxGate{display:block}';document.head.appendChild(st);}
function ask(){var g0=document.getElementById('gate');if(!g0)return;asked=true;gateCss();
  var g=document.createElement('div');g.id='cxGate';g.setAttribute('role','dialog');g.setAttribute('aria-modal','true');g.setAttribute('aria-labelledby','cxT');
  var hd=g0.querySelector('.g-head'),ver=document.getElementById('gVer');
  g.innerHTML='<div class="g-wrap">'+(hd?'<div class="g-head">'+hd.innerHTML.replace(/\sid="[^"]*"/g,'')+'</div>':'')+'<div class="g-card"><div id="cxChoice"><h2 id="cxT" tabindex="-1">Vous êtes un enseignant de&nbsp;:</h2><div class="cx-tiles" role="radiogroup" aria-labelledby="cxT">'+
   '<button type="button" class="cx-tile" role="radio" aria-checked="false" data-cxp="lycee"><span class="ic" aria-hidden="true">🎓</span><b>Lycée</b><small>TC · 1BAC · 2BAC</small><small>Service 21 h</small></button>'+
   '<button type="button" class="cx-tile" role="radio" aria-checked="false" data-cxp="college"><span class="ic" aria-hidden="true">🎒</span><b>Collège</b><small>1AC · 2AC · 3AC</small><small>Service 24 h</small></button></div>'+
   '<button type="button" class="btn" id="cxGo" disabled>Continuer</button></div></div>'+(ver?'<div class="g-ver">'+e(ver.textContent)+'</div>':'')+'</div>';
  var sub=g.querySelector('.g-sub');if(sub)sub.textContent='✓ Connecté';
  document.body.appendChild(g);
  g.addEventListener('click',function(ev){var t=ev.target.closest('[data-cxp]');
    if(t){pick=t.getAttribute('data-cxp');g.querySelectorAll('[data-cxp]').forEach(function(x){x.setAttribute('aria-checked',String(x===t));});var go=document.getElementById('cxGo');go.disabled=false;go.textContent='Continuer avec '+(pick==='college'?'Collège':'Lycée');return;}
    if(ev.target.closest('#cxGo')&&pick){if(g.parentNode)g.parentNode.removeChild(g);setMode(pick,1);}});
  try{document.getElementById('cxT').focus();}catch(x){}}
/* déconnexion pendant le choix : l’écran est retiré (redemandé à la prochaine ouverture) */
setInterval(function(){var g=document.getElementById('cxGate');if(g&&!window.CJGateOpen){g.parentNode.removeChild(g);asked=false;}},1000);
var tries=0,iv=setInterval(function(){if(asked){clearInterval(iv);return;}if(!window.CJGateOpen||ro())return;
  var d=R.db(),S=window.CJSync&&CJSync.state;if((d.settings&&d.settings.school)||ls(LK)||infer(d)){clearInterval(iv);return;}
  tries++;if(!S||!S.user||S.ready||!navigator.onLine||tries>20)ask();},700);   /* attend les données du compte (20 × 0,7 s au plus) */
})();
