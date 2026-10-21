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
 '#cxCard .ps-cap{margin:16px 4px 6px}#cxSvc{margin:10px 4px 0}.ps-i-ets{background:#DCFCE7}';
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
function build(){if(!V||!window.CJPS||!CJPS.add||card)return;
  card=document.createElement('div');card.className='card';card.id='cxCard';
  card.innerHTML='<h2>Établissement</h2><div class="cx-seg" role="radiogroup" aria-label="Vous êtes un enseignant de"><button type="button" role="radio" data-cxm="lycee">🎓 Lycée</button><button type="button" role="radio" data-cxm="college">🎒 Collège</button></div>'+
   '<div class="cx-box"><div class="cx-row"><div class="t"><b>Service obligatoire</b></div><b id="cxOb"></b></div><div class="cx-row"><div class="t"><b>Niveaux reconnus</b><small>d’après le nom des classes</small></div><b id="cxLv"></b></div></div>'+
   '<div id="cxAss"><div class="ps-cap">Association sportive scolaire (ASS)</div><div class="cx-box">'+
   '<label class="cx-row"><div class="t"><b>Participer à l’ASS</b><small>Créneaux comptés dans le service, sans séance ni appel</small></div><input type="checkbox" role="switch" class="cx-sw" id="cxAsOn" aria-label="Participer à l’ASS"></label>'+
   SL.map(function(s,i){return '<label class="cx-row" data-cxr="'+i+'"><span class="cx-as">ASS</span><div class="t"><b>'+s.l+' 15:00–17:00</b><small>2 h</small></div><input type="checkbox" role="switch" class="cx-sw" data-cxs="'+i+'" aria-label="ASS '+s.l+' 15:00–17:00"></label>';}).join('')+
   '</div></div><p class="small muted" id="cxSvc"></p>';
  V.appendChild(card);CJPS.add('ets',card,'🏫','Établissement');
  var g=document.querySelector('#psList [data-psg~="cls"] .ps-card');
  if(g){row=document.createElement('button');row.type='button';row.className='ps-row';row.setAttribute('data-ps-open','ets');
    row.innerHTML='<span class="ps-ico ps-i-ets" aria-hidden="true">🎒</span><span class="ps-tx"><b>Établissement</b><small data-ps-sum="ets"></small></span><span class="ps-val" data-ps-val="ets"></span><span class="ps-chev" aria-hidden="true">›</span>';g.insertBefore(row,g.firstChild);}
  card.addEventListener('click',function(ev){var b=ev.target.closest('[data-cxm]');if(b&&b.getAttribute('aria-checked')!=='true')setMode(b.getAttribute('data-cxm'));});
  card.addEventListener('change',function(ev){var t=ev.target;if(t.id==='cxAsOn')setAll(t.checked);else if(t.hasAttribute('data-cxs'))setSlot(SL[+t.getAttribute('data-cxs')],t.checked);});
  panel();}
function panel(){if(!card)return;var c=isC(),d=R.db(),sv=X.service(),as=asList(),r=ro();
  card.querySelectorAll('[data-cxm]').forEach(function(b){b.setAttribute('aria-checked',String(b.getAttribute('data-cxm')===(c?'college':'lycee')));b.disabled=r;});
  card.querySelector('#cxOb').textContent=fh(Math.round(d.cal.oblig*60));card.querySelector('#cxLv').textContent=c?'1AC · 2AC · 3AC':'TC · 1BAC · 2BAC';
  card.querySelector('#cxAss').hidden=!c;var on=card.querySelector('#cxAsOn');on.checked=as.length>0;on.disabled=r;
  SL.forEach(function(s,i){var x=card.querySelector('[data-cxs="'+i+'"]');x.checked=as.some(function(t){return slotIs(t,s);});x.disabled=r||!as.length;card.querySelector('[data-cxr="'+i+'"]').classList.toggle('off',!as.length);});
  var ok=sv.tot===sv.ob;card.querySelector('#cxSvc').innerHTML=c?'Service\u00a0: classes '+fh(sv.cm)+' + ASS '+fh(sv.am)+' = <b style="color:var(--ink)">'+fh(sv.tot)+'</b>'+(ok?' ✓':' · service obligatoire '+fh(sv.ob)):'';
  if(row){var a=row.querySelector('[data-ps-sum]');a.textContent=(c?'Collège':'Lycée')+' · service '+fh(sv.ob)+(c?' · ASS '+fh(sv.am):'');}}
build();texts();
document.addEventListener('click',function(ev){if(ev.target.closest&&ev.target.closest('#tabs button,[data-ps-open="ets"],#psBack'))setTimeout(function(){texts();panel();},0);},true);

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
