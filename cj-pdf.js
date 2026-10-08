/* Cahier d’EPS – exports PDF (jsPDF + AutoTable, bibliothèques locales, fonctionne hors ligne) */
(function(){
'use strict';
var A=window.CJR;if(!A||!window.jspdf)return;
var jsPDF=window.jspdf.jsPDF;
var W=210,H=297,M=14,TOP=30,BOT=17;
var PRI=[11,58,110],INK=[28,36,48],MUTED=[102,112,133],LINE=[222,227,236],WHITE=[255,255,255];
/* présence = vert, reste (absences) = rouge : couleurs accessibles fortes */
var PG=[22,163,74],PR=[220,38,38];
function restPct(r){return r==null?'—':pct(1-r,r>=0.995||r<=0.005?0:1);}
var DSP_F=[236,238,242],DSP_T=[90,99,114];
/* jours fériés / vacances : teinte sable hachurée (distincte du gris « dispensé » et des couleurs de groupe) */
var HOL_F=[251,245,230],HOL_L=[226,204,158],HOL_T=[133,94,20],HOL_H=[160,120,48];
/* statuts : couleurs identiques à l’application (cases) + couleurs de graphique */
var ST={
 P:{t:'P',l:'Présent',ch:[31,138,76],f:null,c:[165,174,188]},
 A:{t:'A',l:'Absence non justifiée',ch:[198,47,58],f:[253,234,236],c:[198,47,58]},
 J:{t:'AJ',l:'Absence justifiée',ch:[37,99,168],f:[232,241,251],c:[37,99,168]},
 M:{t:'M',l:'Maladie non justifiée',ch:[126,34,206],f:[243,232,255],c:[126,34,206]},
 K:{t:'MJ',l:'Maladie justifiée',ch:[192,132,252],f:[250,245,255],c:[147,51,234]},
 L:{t:'R',l:'Retard',ch:[217,119,6],f:[255,243,220],c:[184,110,0]},
 S:{t:'ST',l:'Sans tenue',ch:[15,118,110],f:[223,245,242],c:[15,118,110]}
};
var KEYS=['A','J','M','K','L','S'];
function rgb(h){h=String(h).replace('#','');return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
var GC=A.GRP_COL.map(rgb),GS=A.GRP_SOFT.map(rgb);
var AR=/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/;
var WA=/[^\x00-\xFF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]/g;
var HAS_AR=false,FONTS=null,FONTKEY='',LOGO=null,BIDI=null;

/* ---------- ressources (mises en cache par le service worker) ---------- */
function b64(buf){var a=new Uint8Array(buf),s='';for(var i=0;i<a.length;i+=8192)s+=String.fromCharCode.apply(null,a.subarray(i,i+8192));return btoa(s);}
function getBuf(u){return fetch(u).then(function(r){if(!r.ok)throw new Error(u+' '+r.status);return r.arrayBuffer();});}
var FCACHE={};
/* police arabe choisie dans Paramètres (Noto Sans Arabic par défaut) ; repli sur Noto si le fichier est indisponible */
function loadFonts(key){key=A.arFontKey(key);if(FCACHE[key]){FONTS=FCACHE[key];FONTKEY=key;return Promise.resolve(FONTS);}
  return Promise.all(A.arFontFiles(key).map(function(u){return getBuf(u).then(b64);})).then(function(a){FONTS=FCACHE[key]=a;FONTKEY=key;return a;},function(e){if(key!=='noto')return loadFonts('noto');throw e;});}
/* logo B (coureur orange, carré bleu à liseré clair, coins transparents) : icons/logo-b-pdf.png, 360 px */
function loadLogo(){if(LOGO)return Promise.resolve(LOGO);return getBuf('icons/logo-b-pdf.png').then(function(b){return (LOGO='data:image/png;base64,'+b64(b));}).catch(function(){return null;});}

/* ---------- texte ---------- */
function clean(s){return String(s==null?'':s).replace(/[\u202F\u2009\u2007]/g,' ').replace(/[\u200B-\u200F\u2066-\u2069\uFE0F]/g,'');}
function isAr(s){return HAS_AR&&AR.test(s);}
function prep(s){s=clean(s);return isAr(s)?s:s.replace(WA,'');}
/* --- arabe : mise en forme (lettres liées, lam-alef) puis ordre visuel UAX #9 (chiffres, latin, parenthèses) ---
   jsPDF n’écrit que du texte « visuel » : on fournit donc la chaîne déjà liée, réordonnée et avec parenthèses inversées. */
var AFORMS={1569:[65152,0,0,0],1570:[65153,65154,0,0],1571:[65155,65156,0,0],1572:[65157,65158,0,0],1573:[65159,65160,0,0],1574:[65161,65162,65163,65164],1575:[65165,65166,0,0],1576:[65167,65168,65169,65170],1577:[65171,65172,0,0],1578:[65173,65174,65175,65176],1579:[65177,65178,65179,65180],1580:[65181,65182,65183,65184],1581:[65185,65186,65187,65188],1582:[65189,65190,65191,65192],1583:[65193,65194,0,0],1584:[65195,65196,0,0],1585:[65197,65198,0,0],1586:[65199,65200,0,0],1587:[65201,65202,65203,65204],1588:[65205,65206,65207,65208],1589:[65209,65210,65211,65212],1590:[65213,65214,65215,65216],1591:[65217,65218,65219,65220],1592:[65221,65222,65223,65224],1593:[65225,65226,65227,65228],1594:[65229,65230,65231,65232],1601:[65233,65234,65235,65236],1602:[65237,65238,65239,65240],1603:[65241,65242,65243,65244],1604:[65245,65246,65247,65248],1605:[65249,65250,65251,65252],1606:[65253,65254,65255,65256],1607:[65257,65258,65259,65260],1608:[65261,65262,0,0],1609:[65263,65264,64488,64489],1610:[65265,65266,65267,65268],1649:[64336,64337,0,0],1655:[64477,0,0,0],1657:[64358,64359,64360,64361],1658:[64350,64351,64352,64353],1659:[64338,64339,64340,64341],1662:[64342,64343,64344,64345],1663:[64354,64355,64356,64357],1664:[64346,64347,64348,64349],1667:[64374,64375,64376,64377],1668:[64370,64371,64372,64373],1670:[64378,64379,64380,64381],1671:[64382,64383,64384,64385],1672:[64392,64393,0,0],1676:[64388,64389,0,0],1677:[64386,64387,0,0],1678:[64390,64391,0,0],1681:[64396,64397,0,0],1688:[64394,64395,0,0],1700:[64362,64363,64364,64365],1702:[64366,64367,64368,64369],1705:[64398,64399,64400,64401],1709:[64467,64468,64469,64470],1711:[64402,64403,64404,64405],1713:[64410,64411,64412,64413],1715:[64406,64407,64408,64409],1722:[64414,64415,0,0],1723:[64416,64417,64418,64419],1726:[64426,64427,64428,64429],1728:[64420,64421,0,0],1729:[64422,64423,64424,64425],1733:[64480,64481,0,0],1734:[64473,64474,0,0],1735:[64471,64472,0,0],1736:[64475,64476,0,0],1737:[64482,64483,0,0],1739:[64478,64479,0,0],1740:[64508,64509,64510,64511],1744:[64484,64485,64486,64487],1746:[64430,64431,0,0],1747:[64432,64433,0,0]};
var ALIG={1570:[65269,65270],1571:[65271,65272],1573:[65273,65274],1575:[65275,65276]};
function jtype(c){if(c===0x640)return 'D';if((c>=0x64B&&c<=0x65F)||c===0x670||(c>=0x6D6&&c<=0x6DC)||(c>=0x6DF&&c<=0x6E4)||(c>=0x6E7&&c<=0x6E8)||(c>=0x6EA&&c<=0x6ED))return 'T';var f=AFORMS[c];if(!f)return 'N';return f[2]?'D':f[1]?'R':'U';}
function shape(s){var a=[],i,n=s.length,out=[];for(i=0;i<n;i++)a.push(s.charCodeAt(i));
  function prevJ(k){for(k--;k>=0;k--){var t=jtype(a[k]);if(t==='T')continue;return t==='D';}return false;}
  function nextJ(k){for(k++;k<n;k++){var t=jtype(a[k]);if(t==='T')continue;return t==='D'||t==='R';}return false;}
  for(i=0;i<n;i++){var c=a[i],t=jtype(c);
    if(t==='N'||t==='T'||c===0x640){out.push(c);continue;}
    if(c===0x644){var j=i+1;while(j<n&&jtype(a[j])==='T')j++;if(ALIG[a[j]]){out.push(ALIG[a[j]][prevJ(i)?1:0]);for(var k=i+1;k<j;k++)out.push(a[k]);i=j;continue;}}
    var f=AFORMS[c],pj=prevJ(i),nj=t==='D'&&nextJ(i),form=pj&&nj?3:pj?1:nj?2:0;
    out.push(f[form]||f[pj&&f[1]?1:0]||c);}
  return String.fromCharCode.apply(null,out);}
var VC={};
function vis(s){if(!isAr(s))return s;var r=VC[s];if(r!=null)return r;var sh=shape(s);
  try{if(BIDI){var lv=BIDI.getEmbeddingLevels(sh);r=BIDI.getReorderedString(sh,lv);}else r=sh.split('').reverse().join('');}catch(e){r=sh;}
  return (VC[s]=r);}
function font(d,s,bold){d.setFont(isAr(s)?'NSA':'helvetica',bold?'bold':'normal');}
function fit(d,s,w){if(!w||d.getTextWidth(vis(s))<=w)return s;while(s.length>1&&d.getTextWidth(vis(s+'…'))>w)s=s.slice(0,-1);return s.replace(/\s+$/,'')+'…';}
function wrapL(d,s,w){if(!isAr(s))return d.splitTextToSize(s,w);var words=s.split(' '),lines=[],cur='';words.forEach(function(wd){var t=cur?cur+' '+wd:wd;if(cur&&d.getTextWidth(vis(t))>w){lines.push(cur);cur=wd;}else cur=t;});lines.push(cur);return lines;}
function T(d,s,x,y,o){o=o||{};s=prep(s);if(!s)return 0;font(d,s,o.bold);d.setFontSize(o.size||9);d.setTextColor.apply(d,o.color||INK);s=fit(d,s,o.maxW);var op={};if(o.align)op.align=o.align;var v=vis(s);d.text(v,x,y,op);return d.getTextWidth(v);}
function U(m){var e=new Error(m);e.userMsg=m;return e;}
function pl(n,w,ws){return n+' '+(n>1?(ws||w+'s'):w);}
function pct(x,dec){if(x==null||isNaN(x))return '—';var f=Math.pow(10,dec==null?1:dec);return String(Math.round(x*100*f)/f).replace('.',',')+' %';}
function r1(x){return Math.round(x*10)/10;}
function num(x){return A.fmtNum(x);}
function sexTxt(s){var x=A.sexOf(s);return x==='F'?'F':x==='G'?'G':'';}
function niceMax(v){if(v<=0)return 1;if(v<=5)return Math.ceil(v);var p=Math.pow(10,Math.floor(Math.log(v)/Math.LN10)),m=v/p;return (m<=1?1:m<=2?2:m<=2.5?2.5:m<=5?5:10)*p;}
function lcFirst(s){return s.charAt(0).toLowerCase()+s.slice(1);}

/* ---------- document, en-tête, pied de page ---------- */
function schoolYear(){var c=A.cal().cycles.filter(function(x){return !x.bad;});if(c.length){var y0=+c[0].start.slice(0,4),y1=+c[c.length-1].end.slice(0,4);return 'Année scolaire '+y0+'-'+(y1>y0?y1:y0+1);}var d=new Date(),y=d.getFullYear();if(d.getMonth()<7)y--;return 'Année scolaire '+y+'-'+(y+1);}
function genStr(){var d=new Date();return A.pad(d.getDate())+'/'+A.pad(d.getMonth()+1)+'/'+d.getFullYear()+' à '+A.pad(d.getHours())+'h'+A.pad(d.getMinutes());}
function meta(title,sub,head2){var DB=A.db();return {title:title,sub:sub,head2:head2,teacher:clean(DB.settings.teacher||A.user()||''),year:schoolYear(),gen:genStr()};}
function newDoc(m){
  var d=new jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true});
  if(HAS_AR&&FONTS){d.addFileToVFS('NSA-R.ttf',FONTS[0]);d.addFont('NSA-R.ttf','NSA','normal');d.addFileToVFS('NSA-B.ttf',FONTS[1]);d.addFont('NSA-B.ttf','NSA','bold');}
  /* texte déjà lié + réordonné par vis() : retirer la mise en forme arabe et le moteur bidi intégrés de jsPDF (double traitement) */
  try{var ev=d.internal.events,tp=ev.getTopics();Object.keys(tp.preProcessText||{}).forEach(function(id){ev.unsubscribe(id);});Object.keys(tp.postProcessText||{}).forEach(function(id){if(/isInputVisual/.test(String(tp.postProcessText[id][0])))ev.unsubscribe(id);});}catch(e){}
  d.setProperties({title:prep(m.title),subject:prep(m.sub||''),author:prep(m.teacher||'Cahier d’EPS'),creator:'Cahier d’EPS',keywords:'EPS, absences, bilan'});
  try{d.setLanguage('fr-FR');}catch(e){}
  d.setLineHeightFactor(1.2);
  return d;
}
function header(d,m){
  d.setFillColor.apply(d,PRI);d.rect(0,0,W,21,'F');
  d.setFillColor(232,93,4);d.rect(0,21,W,0.9,'F');
  var x=M;
  if(LOGO){d.addImage(LOGO,'PNG',M,3,15,15,'cjlogoB','FAST');x=M+19;}
  T(d,'Cahier d’EPS',x,10,{bold:1,size:13.5,color:WHITE});
  T(d,m.head2,x,16,{size:8.3,color:[214,222,255],maxW:W-2*M-95});
  if(m.teacher)T(d,m.teacher,W-M,9.6,{size:9,bold:1,align:'right',color:WHITE,maxW:88});
  T(d,m.year,W-M,15.6,{size:8,align:'right',color:[214,222,255]});
}
function footer(d,m,i,n){
  d.setDrawColor.apply(d,LINE);d.setLineWidth(0.3);d.line(M,H-11.5,W-M,H-11.5);
  T(d,'Document généré le '+m.gen+' · Cahier d’EPS v'+A.semver+' – cahier-eps-ma.web.app',M,H-7,{size:7,color:MUTED,maxW:150});
  T(d,'Page '+i+' / '+n,W-M,H-7,{size:7.5,bold:1,align:'right',color:MUTED});
}
function finish(d,m){var n=d.getNumberOfPages();for(var i=1;i<=n;i++){d.setPage(i);header(d,m);footer(d,m,i,n);}
  /* CIDSystemInfo conforme (Ordering « Identity » ; même longueur → table xref intacte) */
  var raw=d.output().replace(/\/Ordering \(Identity-H\)/g,'/Ordering (Identity)  '),u=new Uint8Array(raw.length);for(var k=0;k<raw.length;k++)u[k]=raw.charCodeAt(k)&255;
  return new Blob([u],{type:'application/pdf'});}
function titleBlock(d,m){T(d,m.title,M,32,{bold:1,size:16.5,color:INK,maxW:W-2*M});var y=38;if(m.sub){var s=prep(m.sub);font(d,s,false);d.setFontSize(9);d.setTextColor.apply(d,MUTED);var lines=wrapL(d,s,W-2*M);d.text(lines.map(vis),M,y);y+=lines.length*4.2;}return y+3;}
function ensure(d,y,need){if(y+need>H-BOT){d.addPage();return TOP;}return y;}
function section(d,y,t,sub,need){y=ensure(d,y,(need||0)+12);d.setFillColor.apply(d,PRI);d.rect(M,y-3.7,1.5,4.8,'F');T(d,t,M+3.6,y,{bold:1,size:11.5,color:INK,maxW:sub?110:W-2*M});if(sub)T(d,sub,W-M,y,{size:7.3,color:MUTED,align:'right',maxW:70});return y+5;}
function note(d,y,s,col){s=prep(s);font(d,s,false);d.setFontSize(7.6);d.setTextColor.apply(d,col||MUTED);var l=wrapL(d,s,W-2*M);y=ensure(d,y,l.length*3.6);d.text(l.map(vis),M,y);return y+l.length*3.6+1.5;}

/* ---------- cartes de synthèse ---------- */
function cards(d,y,items,per){per=per||4;var gap=3,w=(W-2*M-gap*(per-1))/per,h=18.5;y=ensure(d,y,h+2);
  items.forEach(function(it,i){var r=Math.floor(i/per),c=i%per,x=M+c*(w+gap),yy=y+r*(h+gap),col=it.c||PRI;
    d.setFillColor(248,249,253);d.setDrawColor.apply(d,LINE);d.setLineWidth(0.25);d.roundedRect(x,yy,w,h,2,2,'FD');
    d.setFillColor.apply(d,col);d.roundedRect(x,yy,1.6,h,0.8,0.8,'F');
    T(d,String(it.v),x+4.5,yy+8.2,{bold:1,size:14,color:col,maxW:it.rate!=null?w-22:w-6});
    if(it.rate!=null){T(d,restPct(it.rate),x+w-3,yy+8.2,{bold:1,size:11.5,color:PR,align:'right',maxW:16});var bw=w-7.5,bx0=x+4.5,by0=yy+h-2.3;d.setFillColor.apply(d,PR);d.rect(bx0,by0,bw,1.1,'F');d.setFillColor.apply(d,PG);d.rect(bx0,by0,bw*it.rate,1.1,'F');}
    T(d,it.l,x+4.5,yy+12.9,{size:7.4,bold:1,color:INK,maxW:w-6});
    if(it.s)T(d,it.s,x+4.5,yy+(it.rate!=null?15.4:16.3),{size:6.2,color:MUTED,maxW:w-6});});
  return y+Math.ceil(items.length/per)*(h+gap)+2;}

/* ---------- graphiques vectoriels ---------- */
function poly(d,pts,fill,stroke,lw){var rel=[];for(var i=1;i<pts.length;i++)rel.push([pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]]);if(fill)d.setFillColor.apply(d,fill);if(stroke){d.setDrawColor.apply(d,stroke);d.setLineWidth(lw||0.3);}d.lines(rel,pts[0][0],pts[0][1],[1,1],fill&&stroke?'FD':fill?'F':'S',!!fill);}
function arc(d,cx,cy,R,r,a0,a1,col){var n=Math.max(2,Math.ceil((a1-a0)/(Math.PI/48))),p=[],i,a;for(i=0;i<=n;i++){a=a0+(a1-a0)*i/n;p.push([cx+R*Math.cos(a),cy+R*Math.sin(a)]);}for(i=n;i>=0;i--){a=a0+(a1-a0)*i/n;p.push([cx+r*Math.cos(a),cy+r*Math.sin(a)]);}poly(d,p,col,WHITE,0.35);}
function donut(d,cx,cy,R,segs,center,centerSub,ccol){var tot=0;segs.forEach(function(s){tot+=s.v;});
  if(!tot){d.setDrawColor(230,233,240);d.setLineWidth(R*0.42);d.circle(cx,cy,R*0.79,'S');}
  else{var a0=-Math.PI/2;segs.forEach(function(s){if(!s.v)return;var a1=a0+2*Math.PI*s.v/tot;if(s.v===tot)a1=a0+2*Math.PI-1e-4;arc(d,cx,cy,R,R*0.58,a0,a1,s.c);a0=a1;});}
  T(d,center,cx,cy+1.2,{bold:1,size:11,align:'center',color:ccol||INK});if(centerSub)T(d,centerSub,cx,cy+4.8,{size:6,align:'center',color:MUTED});}
function donutLegend(d,x,y,segs,w){var tot=0;segs.forEach(function(s){tot+=s.v;});segs.forEach(function(s,i){var yy=y+i*5.2;d.setFillColor.apply(d,s.c);d.roundedRect(x,yy-2.6,3,3,0.6,0.6,'F');T(d,s.l,x+4.5,yy,{size:6.8,color:INK,maxW:w-19});T(d,String(s.v),x+w-10,yy,{size:7,bold:1,align:'right'});T(d,tot?pct(s.v/tot,0):'',x+w,yy,{size:6.5,align:'right',color:MUTED});});return y+segs.length*5.2;}
var SHORT={A:'Abs. non justifiée',J:'Abs. justifiée',M:'Maladie non just.',K:'Maladie justifiée',L:'Retard',S:'Sans tenue'};
function statusSegs(t){return [{l:'Présent',v:Math.max(0,t.slots-t.abs),c:ST.P.ch}].concat(KEYS.map(function(k){return {l:SHORT[k],v:t[k==='A'?'U':k],c:ST[k].ch};}));}
function axesY(d,px,py,pw,ph,lo,hi,ticks,fmt){for(var i=0;i<=ticks;i++){var v=lo+(hi-lo)*i/ticks,yy=py+ph-(v-lo)/(hi-lo)*ph;d.setDrawColor(i?236:200,i?239:205,i?244:214);d.setLineWidth(i?0.2:0.35);d.line(px,yy,px+pw,yy);T(d,fmt(v),px-1.4,yy+1,{size:5.8,align:'right',color:MUTED});}}
function xLabels(d,px,py,pw,cats){var n=cats.length,k=Math.ceil(n/18);cats.forEach(function(c,i){if(i%k)return;var xc=px+pw*(i+0.5)/n;if(c.l)T(d,c.l,xc,py+3.4,{size:n>12?5.4:6,align:'center',color:c.hol?HOL_T:INK,bold:1,maxW:pw/n*k-0.5});if(c.sub)T(d,c.sub,xc,py+6.2,{size:n>12?4.8:5.4,align:'center',color:MUTED,maxW:pw/n*k-0.3});});}
function emptyBox(d,x,y,w,h,msg){d.setFillColor(248,249,252);d.setDrawColor.apply(d,LINE);d.roundedRect(x,y,w,h,2,2,'FD');T(d,msg,x+w/2,y+h/2+1,{size:8,align:'center',color:MUTED});}
function chartTitle(d,x,y,t){T(d,t,x,y,{size:8.2,bold:1,color:INK});}
function lineChart(d,x,y,w,h,cats,title){chartTitle(d,x,y,title);y+=3;
  var vals=cats.map(function(c){return c.v;}).filter(function(v){return v!=null;});
  if(!vals.length){emptyBox(d,x,y,w,h-3,'Aucune séance effectuée');return;}
  var mn=Math.min.apply(null,vals),lo=Math.min(0.8,Math.max(0,Math.floor((mn-0.05)*10)/10));
  var px=x+9,pw=w-10,py=y+2,ph=h-12,n=cats.length;
  axesY(d,px,py,pw,ph,lo,1,4,function(v){return Math.round(v*100)+'%';});holBands(d,px,py,pw,ph,cats);
  var pts=[];cats.forEach(function(c,i){if(c.v==null)return;pts.push([px+pw*(i+0.5)/n,py+ph-(c.v-lo)/(1-lo)*ph,c.v]);});
  if(pts.length>1){var area=pts.map(function(p){return [p[0],p[1]];});area.push([pts[pts.length-1][0],py+ph]);area.push([pts[0][0],py+ph]);poly(d,area,[226,232,254],null);poly(d,pts.map(function(p){return [p[0],p[1]];}),null,PRI,0.7);}
  pts.forEach(function(p){d.setFillColor(255,255,255);d.setDrawColor.apply(d,PRI);d.setLineWidth(0.45);d.circle(p[0],p[1],0.95,'FD');if(n<=16)T(d,String(Math.round(p[2]*100)),p[0],p[1]-1.9,{size:5.4,align:'center',color:PRI,bold:1});});
  xLabels(d,px,py+ph,pw,cats);}
function stackBars(d,x,y,w,h,cats,title,keys){keys=keys||KEYS;chartTitle(d,x,y,title);y+=3;
  var tots=cats.map(function(c){var t=0;keys.forEach(function(k){t+=c.c[k]||0;});return t;}),mx=Math.max.apply(null,[0].concat(tots));
  if(!cats.length||!mx&&!cats.some(function(c){return c.hol;})){emptyBox(d,x,y,w,h-3,cats.length?'Aucune absence, aucun retard : excellent !':'Aucune donnée');return;}
  var top=niceMax(mx),ticks=top<=5?top:5,px=x+8,pw=w-9,py=y+3,ph=h-19,n=cats.length,slot=pw/n,bw=Math.min(9,slot*0.64);
  axesY(d,px,py,pw,ph,0,top,ticks,function(v){return String(Math.round(v*10)/10).replace('.',',');});holBands(d,px,py,pw,ph,cats);
  cats.forEach(function(c,i){var xc=px+slot*(i+0.5),yy=py+ph;keys.forEach(function(k){var v=c.c[k]||0;if(!v)return;var hh=v/top*ph;d.setFillColor.apply(d,ST[k].ch);d.rect(xc-bw/2,yy-hh,bw,hh,'F');yy-=hh;});if(tots[i])T(d,String(tots[i]),xc,yy-1,{size:5.6,bold:1,align:'center',color:INK});});
  xLabels(d,px,py+ph,pw,cats);
  var li=keys.map(function(k){return {l:ST[k].l,c:ST[k].ch};});if(cats.some(function(c){return c.hol;}))li.push({l:'Jour férié / vacances (non compté)',hatch:1});legend(d,x+2,py+ph+10.5,li,w-2);}
function legend(d,x,y,items,w){var cx=x,cy=y;items.forEach(function(it){d.setFontSize(6.3);var tw=d.getTextWidth(vis(prep(it.l)))+7;if(cx+tw>x+w){cx=x;cy+=4;}if(it.hatch){hatch(d,cx,cy-2.3,2.6,2.6);d.setDrawColor.apply(d,HOL_L);d.setLineWidth(0.2);d.rect(cx,cy-2.3,2.6,2.6,'S');}else{d.setFillColor.apply(d,it.c);d.roundedRect(cx,cy-2.3,2.6,2.6,0.5,0.5,'F');}T(d,it.l,cx+3.6,cy,{size:6.3,color:INK});cx+=tw;});return cy+4;}
function hBars(d,x,y,w,rows,title,keys){keys=keys||KEYS;chartTitle(d,x,y,title);y+=4;
  if(!rows.length){emptyBox(d,x,y,w,12,'Aucune absence, aucun retard : excellent !');return y+15;}
  var lw=52,bx=x+lw+2,bwid=w-lw-12,mx=0;rows.forEach(function(r){var t=0;keys.forEach(function(k){t+=r.c[k]||0;});r.t=t;if(t>mx)mx=t;});
  rows.forEach(function(r,i){var yy=y+i*5.3;if(i%2){d.setFillColor(248,249,253);d.rect(x,yy-0.6,w,5.3,'F');}
    T(d,r.l,x+1,yy+3.1,{size:6.8,color:r.dsp?DSP_T:INK,maxW:lw-1});var cx=bx;
    keys.forEach(function(k){var v=r.c[k]||0;if(!v)return;var ww=v/mx*bwid;d.setFillColor.apply(d,ST[k].ch);d.rect(cx,yy+0.5,ww,3.4,'F');cx+=ww;});
    T(d,String(r.t),cx+1.4,yy+3.1,{size:6.4,bold:1,color:INK});});
  var ly=y+rows.length*5.3+3;return legend(d,x+1,ly,keys.map(function(k){return {l:ST[k].l,c:ST[k].ch};}),w)+1;}
function pctBars(d,x,y,w,rows,title){chartTitle(d,x,y,title);y+=4;var lw=34,bx=x+lw+2,bwid=w-lw-25;
  rows.forEach(function(r,i){var yy=y+i*5.3;if(i%2){d.setFillColor(248,249,253);d.rect(x,yy-0.6,w,5.3,'F');}T(d,r.l,x+1,yy+3.1,{size:6.8,maxW:lw-1,bold:1});
    if(r.v==null){d.setFillColor(236,239,245);d.rect(bx,yy+0.5,bwid,3.4,'F');T(d,'—',bx+bwid+1.5,yy+3.1,{size:6.4,bold:1,color:MUTED});return;}
    d.setFillColor.apply(d,PR);d.rect(bx,yy+0.5,bwid,3.4,'F');d.setFillColor.apply(d,PG);d.rect(bx,yy+0.5,bwid*r.v,3.4,'F');
    var wg=T(d,pct(r.v),bx+bwid+1.5,yy+3.1,{size:6.4,bold:1,color:PG});T(d,restPct(r.v),bx+bwid+1.5+wg+1.6,yy+3.1,{size:6.4,bold:1,color:PR});});
  var ly=y+rows.length*5.3+1;d.setFillColor.apply(d,PG);d.rect(bx,ly,2.6,2.6,'F');T(d,'Présence',bx+3.8,ly+2,{size:6,color:INK});d.setFillColor.apply(d,PR);d.rect(bx+22,ly,2.6,2.6,'F');T(d,'Absences (reste)',bx+25.8,ly+2,{size:6,color:INK});
  return ly+5;}

/* ---------- tableaux (AutoTable : en-têtes répétés, sauts de page) ---------- */
function table(d,y,head,body,o){o=o||{};var fs=o.fs||7.4;
  d.autoTable({startY:y,head:head?[head]:undefined,body:body,foot:o.foot?[o.foot]:undefined,theme:'grid',
    margin:{top:TOP,left:o.left!=null?o.left:M,right:o.right!=null?o.right:M,bottom:BOT},
    tableWidth:o.width||'auto',
    styles:{font:'helvetica',fontSize:fs,cellPadding:{top:1.25,bottom:1.25,left:1.3,right:1.3},lineColor:LINE,lineWidth:0.2,textColor:INK,valign:'middle',overflow:'linebreak',halign:'center'},
    headStyles:{fillColor:o.headFill||PRI,textColor:255,fontStyle:'bold',fontSize:fs-0.3,halign:'center'},
    footStyles:{fillColor:[233,237,253],textColor:INK,fontStyle:'bold',halign:'center'},
    alternateRowStyles:{fillColor:[248,249,253]},
    columnStyles:o.cols||{},showHead:'everyPage',showFoot:'lastPage',rowPageBreak:'avoid',pageBreak:'auto',
    didParseCell:function(h){var t=h.cell.text.join(' ');if(isAr(t)){h.cell.styles.font='NSA';var fsx=h.cell.styles.fontStyle;if(fsx==='bolditalic')h.cell.styles.fontStyle='bold';else if(fsx==='italic')h.cell.styles.fontStyle='normal';h.cell.text=h.cell.text.map(function(x){return vis(clean(x));});}else h.cell.text=h.cell.text.map(function(x){return clean(x).replace(WA,'');});var rf=h.cell.raw&&h.cell.raw.styles&&h.cell.raw.styles.fillColor;if(o.cell)o.cell(h);if(rf&&h.section==='body')h.cell.styles.fillColor=rf;},
    didDrawCell:o.draw||undefined,didDrawPage:o.page||undefined});
  return d.lastAutoTable.finalY+6;}
function C(v,st){return st?{content:v,styles:st}:v;}
function stCell(code,show){var s=ST[code];if(!s)return '';return {content:show===false?'':s.t,styles:{fillColor:s.f||undefined,textColor:s.c,fontStyle:code==='P'?'normal':'bold'}};}
function zero(v,col){return v?{content:String(v),styles:{textColor:col||INK,fontStyle:'bold'}}:{content:'0',styles:{textColor:[190,196,206]}};}
function codesNote(d,y){return note(d,y,'Codes : P = présent · A = absence non justifiée · AJ = absence justifiée · M = maladie non justifiée · MJ = maladie justifiée · R = retard · ST = sans tenue. Ligne grise = élève dispensé(e) de sport. Hachures sable = jour férié ou vacances (motif indiqué) : créneau non compté. Taux de présence = séances où l’élève était présent (retards et sans tenue inclus) / séances effectuées.');}

/* ---------- jours fériés et vacances ---------- */
function hatch(d,x,y,w,h,step){step=step||1.6;d.setFillColor.apply(d,HOL_F);d.rect(x,y,w,h,'F');d.setDrawColor.apply(d,HOL_L);d.setLineWidth(0.22);
  for(var k=-h;k<w;k+=step){var lo=Math.max(0,-k),hi=Math.min(h,w-k);if(hi>lo)d.line(x+k+lo,y+h-lo,x+k+hi,y+h-hi);}}
function isVac(h){return A.holShort(h)===A.TX.vacShort;}
/* numéros affichés des colonnes fériées (S3, S4) ; vacances : pas de numéro (—) */
function snList(cols){var a=cols.filter(function(c){return c.n;}).map(function(c){return 'S'+c.n;});return a.length?a.join(', '):'—';}
function holType(h){return isVac(h)?'Vacances':'Jour férié';}
function holFull(h){var l=clean(h.label||'').trim()||'Jour férié';return l+(h.approx?' (date approximative)':'');}
function holCol(h){var s=A.holShort(h);return s;}
var WD=['dim.','lun.','mar.','mer.','jeu.','ven.','sam.'];
function wdd(iso){var q=iso.split('-'),dt=new Date(+q[0],q[1]-1,+q[2]);return WD[dt.getDay()]+' '+q[2]+'/'+q[1];}
function holDates(h){return h.to&&h.to>h.from?'du '+A.dmy(h.from)+'\nau '+A.dmy(h.to):wdd(h.from)+'/'+h.from.slice(0,4);}
function holEnd(h){return h.to&&h.to>h.from?h.to:h.from;}
function multi(p){return p==='year'||p==='s1'||p==='s2';}
function periodRange(p){var cy=A.cal().cycles;if(p==='s1'||p==='s2'){var v=A.scopeCycles(p).map(function(i){return cy[i];}).filter(function(c){return c&&!c.bad;});return v.length?[v[0].start,v[v.length-1].end]:null;}if(p==='year'){var v=cy.filter(function(c){return !c.bad;});return v.length?[v[0].start,v[v.length-1].end]:null;}var c=cy[p];return c&&!c.bad?[c.start,c.end]:null;}
function lastRecDate(cids){var DB=A.db(),mx='';cids.forEach(function(cid){for(var p=0;p<DB.periods.length;p++)for(var s=0,S=A.sessCount(cid,p);s<S;s++){if(!A.rec(cid,p,s))continue;var sd=A.sessDate(cid,p,s);if(sd&&sd>mx)mx=sd;}});return mx;}
/* fériés/vacances qui touchent la période [rg0, rg1] + créneaux de l’emploi du temps concernés (par classe) */
function holList(cids,ps,rg){var DB=A.db(),map={},out=[];if(!rg)return out;
  (DB.cal&&DB.cal.holidays||[]).forEach(function(h){if(holEnd(h)<rg[0]||h.from>rg[1])return;map[h.id]={h:h,cols:[],cls:{}};});
  cids.forEach(function(cid){ps.forEach(function(p){var NO=A.colNos(cid,p);A.colsOf(cid,p).forEach(function(c,ci){if(!c.hol||c.date<rg[0]||c.date>rg[1])return;var e=map[c.hol.id];if(!e)e=map[c.hol.id]={h:c.hol,cols:[],cls:{}};e.cols.push({cid:cid,p:p,date:c.date,slot:c.slot,n:NO[ci]});e.cls[cid]=(e.cls[cid]||0)+1;});});});
  Object.keys(map).forEach(function(k){out.push(map[k]);});out.sort(function(a,b){return a.h.from<b.h.from?-1:a.h.from>b.h.from?1:0;});return out;}
function allPs(){var a=[];for(var i=0;i<A.db().periods.length;i++)a.push(i);return a;}
function holCount(cid,p){return A.colsOf(cid,p).filter(function(c){return c.hol;}).length;}
function holTable(d,y,cids,ps,rg,sub){
  var L=holList(cids,ps,rg),multi=cids.length>1,nS=0;L.forEach(function(e){nS+=e.cols.length;});
  y=section(d,y,'Jours fériés et vacances de la période',sub||(rg?'du '+A.dmy(rg[0])+' au '+A.dmy(rg[1]):''),18+Math.min(L.length,6)*6);
  if(!rg){return note(d,y,'Dates des cycles non définies : impossible de situer les jours fériés et les vacances.');}
  if(!L.length)return note(d,y,'Aucun jour férié ni période de vacances pendant cette période.');
  var body=L.map(function(e){var n=e.cols.length,txt;
    if(!n){var inCyc=A.cal().cycles.some(function(c){return !c.bad&&c.start<=holEnd(e.h)&&c.end>=e.h.from;});txt=C(inCyc?'aucune (pas de cours '+(multi?'':'de la classe ')+'ce jour-là)':'aucune (entre deux cycles)',{textColor:MUTED,halign:'left'});}
    else if(multi){var k=Object.keys(e.cls).length;txt=C(pl(n,'créneau','créneaux')+' · '+pl(k,'classe'),{halign:'left',fontStyle:'bold',textColor:HOL_T});}
    else txt=C(pl(n,'séance')+' : '+e.cols.map(function(c){return (c.n?'S'+c.n+' ':'')+(ps.length>1?'(C'+(c.p+1)+') ':'')+wdd(c.date)+(c.slot&&c.slot.start?' '+c.slot.start:'');}).join(' · '),{halign:'left',textColor:HOL_T});
    return [C(holDates(e.h),{fontStyle:'bold'}),C(holFull(e.h),{halign:'left',fontStyle:'bold'}),holType(e.h),txt];});
  y=table(d,y,['Date(s)','Motif','Type','Séances concernées (non comptées)'],body,{fs:7.1,headFill:HOL_H,cols:{0:{cellWidth:28},1:{cellWidth:62},2:{cellWidth:19}},
    foot:[C('Total',{halign:'left'}),pl(L.length,'date'),'',C(multi?pl(nS,'créneau','créneaux')+' non compté'+(nS>1?'s':''):pl(nS,'séance')+' non comptée'+(nS>1?'s':''),{halign:'left'})],
    cell:function(h){if(h.section==='body')h.cell.styles.fillColor=HOL_F;}});
  return note(d,y,'Ces créneaux restent visibles (hachurés, avec leur motif) mais ne sont comptés ni dans les absences, ni dans les points retirés, ni dans les taux de présence. Les fêtes religieuses marquées « date approximative » sont à confirmer.');}
function holLegend(d,y,withDsp){y=ensure(d,y,8);var it=KEYS.map(function(k){return {l:ST[k].t+' = '+ST[k].l,c:ST[k].ch};});it.unshift({l:'P = présent',c:[165,174,188]});if(withDsp!==false)it.push({l:'Élève dispensé(e)',c:DSP_F.map(function(v){return v-14;})});it.push({l:'Jour férié / vacances : motif indiqué, non compté',hatch:1});
  T(d,'Légende :',M,y,{size:6.6,bold:1,color:INK});return legend(d,M+13,y,it,W-2*M-13)+1;}
/* bandes hachurées dans les graphiques par séance */
function holBands(d,px,py,pw,ph,cats){var n=cats.length;cats.forEach(function(c,i){if(!c.hol)return;var w=pw/n,x0=px+w*i;hatch(d,x0+0.25,py,w-0.5,ph,1.3);vtext(d,A.holShort(c.hol),x0+w/2,py+ph/2,ph-3,w>5?5.8:5);});}
function vtext(d,s,xc,yc,maxLen,size){s=prep(s);if(!s)return;font(d,s,true);d.setFontSize(size);d.setTextColor.apply(d,HOL_T);s=fit(d,s,maxLen);s=vis(s);var tw=d.getTextWidth(s);d.text(s,xc+size*0.3528*0.35,yc+tw/2,{angle:90});}

/* ---------- statistiques ---------- */
function agg(list,cid,p){var DB=A.db(),th=DB.settings.threshold,t={n:list.length,U:0,J:0,M:0,K:0,L:0,S:0,A:0,slots:0,dsp:0,alert:0,ded:0,f:0,g:0};
  list.forEach(function(s){var st=multi(p)?A.scopeStat(cid,s.id,p):A.yearStat(cid,s.id).per[p];['U','J','M','K','L','S','A'].forEach(function(k){t[k]+=st[k];});t.slots+=st.held;t.ded+=st.ded;
    if(multi(p)?A.dspInScope(s,p):A.dspInCycle(s,p))t.dsp++;if(st.U>=th)t.alert++;var x=A.sexOf(s);if(x==='F')t.f++;else if(x==='G')t.g++;});
  t.abs=t.U+t.J+t.M+t.K;t.rate=t.slots?(t.slots-t.abs)/t.slots:null;t.inc=t.abs+t.L+t.S;
  t.held=0;if(multi(p)){A.scopeCycles(p).forEach(function(i){t.held+=A.heldCount(cid,i);});}else t.held=A.heldCount(cid,p);return t;}
function stRate(st){return st.held?(st.held-st.A-st.M-st.K)/st.held:null;}
function kcounts(st){return {A:st.U,J:st.J,M:st.M,K:st.K,L:st.L,S:st.S};}
function sessSeries(cid,p,list){var out=[],last=-1,prev=null;
  var NO=A.colNos(cid,p);A.colsOf(cid,p).forEach(function(col,ci){
    if(col.hol){if(prev&&prev.hol&&prev.hol.id===col.hol.id){prev.n++;if(NO[ci])prev.l=prev.l.split('–')[0]+'–S'+NO[ci];return;}prev={hol:col.hol,n:1,l:NO[ci]?'S'+NO[ci]:'',sub:col.date.slice(8,10)+'/'+col.date.slice(5,7),c:{},v:null};out.push(prev);return;}
    var s=col.s,r=A.rec(cid,p,s);if(!r)return;prev=null;var c={A:0,J:0,M:0,K:0,L:0,S:0};
    list.forEach(function(st){var code=A.codeOf(r.marks[st.id]);if(code!=='P')c[code]++;});var abs=c.A+c.J+c.M+c.K,sd=A.sessDate(cid,p,s);
    out.push({l:'S'+NO[ci],sub:sd?sd.slice(8,10)+'/'+sd.slice(5,7):'',c:c,v:list.length?(list.length-abs)/list.length:null});last=out.length-1;});
  return out.slice(0,last+1);}
function cardsFor(t,cid,p,extra){var DB=A.db(),th=DB.settings.threshold,cap=cid?A.capOf(cid):null,avgDed=t.n?t.ded/t.n:0;
  var it=[{v:t.n,l:'Effectif',s:(t.f||t.g)?t.f+' filles · '+t.g+' garçons':pl(t.n,'élève')},
   {v:extra&&extra.held!=null?extra.held:t.held,l:'Séances effectuées',s:extra&&extra.heldSub||''},
   {v:pct(t.rate),l:'Taux de présence',s:t.slots?(t.slots-t.abs)+' présences / '+t.slots:'aucune séance',c:PG,rate:t.rate},
   {v:t.U,l:'Absences non justifiées',s:'A',c:ST.A.c},
   {v:t.J,l:'Absences justifiées',s:'AJ',c:ST.J.c},
   {v:t.M+' / '+t.K,l:'Maladie M / MJ',s:'non justifiée / justifiée',c:ST.M.c},
   {v:t.L,l:'Retards',s:'R',c:ST.L.c},
   {v:t.S,l:'Sans tenue',s:'ST',c:ST.S.c},
   {v:t.dsp,l:'Élèves dispensés',s:'dispense de sport',c:[107,114,128]},
   {v:t.alert,l:'Élèves en alerte',s:th+' abs. non justifiées ou plus',c:t.alert?ST.A.c:ST.P.ch}];
  if(cap!=null){it.push({v:'-'+num(r1(avgDed)),l:'Points retirés (moy.)',s:p==='year'?'par élève sur l’année':multi(p)?'par élève sur le semestre':'sur '+num(cap)+' pts par élève',c:[184,110,0]});
    it.push({v:multi(p)?num(r1(avgDed)):num(r1(cap-avgDed))+' / '+num(cap),l:multi(p)?'Total moyen retiré':'Note comportementale moy.',s:multi(p)?'somme des cycles':'note restante moyenne',c:PRI});}
  return it;}
function topRows(list,cid,p,max){return list.map(function(s){var st=multi(p)?A.scopeStat(cid,s.id,p):A.yearStat(cid,s.id).per[p];return {l:s.name,s:s,c:kcounts(st),t:st.U+st.J+st.M+st.K+st.L+st.S,dsp:multi(p)?A.dspInScope(s,p):A.dspInCycle(s,p)};}).filter(function(r){return r.t>0;}).sort(function(a,b){return b.t-a.t||b.c.A-a.c.A||A.cmpStu(a.s,b.s);}).slice(0,max||12);}
function grpCellOf(cid,s){var g=A.grpOf(cid),i=A.grpIdx(g,s.id);return i<0?(g?C('–'):null):C(String(i+1),{fillColor:GC[i],textColor:255,fontStyle:'bold'});}

/* ---------- blocs communs ---------- */
function chartsBlock(d,y,t,cats,lineTitle,barTitle){
  y=section(d,y,'Répartition et évolution','',55);
  var segs=statusSegs(t);donut(d,M+17,y+20,16,segs,pct(t.rate,0),'présence',PG);donutLegend(d,M+37,y+6,segs,43);
  lineChart(d,M+84,y+1,W-M-(M+84),52,cats,lineTitle);y+=58;
  y=section(d,y,barTitle,'',52);stackBars(d,M,y+1,W-2*M,56,cats,'Nombre d’élèves concernés');return y+62;}
function studentTable(d,y,list,cid,p){
  var DB=A.db(),th=DB.settings.threshold,year=multi(p),g=A.grpOf(cid),cap=A.capOf(cid);
  var head=['N°','Code Massar','Nom et prénom'];if(g)head.push('Grp');head.push('Sexe','Présence','A','AJ','M','MJ','R','ST','Pts retirés');if(!year)head.push('Note comp.');head.push('Observation');
  var tot={U:0,J:0,M:0,K:0,L:0,S:0,ded:0,held:0,abs:0},dspRows={};
  var body=list.map(function(s,i){var st=year?A.scopeStat(cid,s.id,p):A.yearStat(cid,s.id).per[p],dsp=year?A.dspInScope(s,p):A.dspInCycle(s,p),al=st.U>=th,r=stRate(st);
    ['U','J','M','K','L','S'].forEach(function(k){tot[k]+=st[k];});tot.ded+=st.ded;tot.held+=st.held;tot.abs+=st.A+st.M+st.K;if(dsp)dspRows[i]=1;
    var obs=[];if(dsp)obs.push('Dispensé(e) – '+A.dspShort(A.dspOf(s)));if(al)obs.push('Alerte : '+st.U+' abs. non just.');if(!year&&st.capped)obs.push('Note comp. épuisée');
    var row=[i+1,s.sid||'',C(s.name,{halign:'center',fontStyle:'bold'})];if(g)row.push(grpCellOf(cid,s));
    row.push(sexTxt(s),C(pct(r,0),{textColor:r==null?MUTED:PG,fontStyle:'bold'}),zero(st.U,ST.A.c),zero(st.J,ST.J.c),zero(st.M,ST.M.c),zero(st.K,ST.K.c),zero(st.L,ST.L.c),zero(st.S,ST.S.c),C(A.fmtPts(st.ded),{textColor:st.ded?[184,110,0]:[190,196,206],fontStyle:'bold'}));
    if(!year)row.push(C(num(r2(st.cap-st.ded))+' / '+num(st.cap),{fontStyle:'bold',textColor:st.capped?ST.A.c:INK}));
    row.push(C(obs.join(' · '),{halign:'left',fontSize:6.3,textColor:al?ST.A.c:dsp?DSP_T:MUTED}));return row;});
  var foot=['','',C('Total classe ('+list.length+')',{halign:'left'})];if(g)foot.push('');foot.push('',C(pct(tot.held?(tot.held-tot.abs)/tot.held:null,0),{fontStyle:'bold',textColor:PG}),tot.U,tot.J,tot.M,tot.K,tot.L,tot.S,A.fmtPts(r2(tot.ded)));if(!year)foot.push('');foot.push('');
  var cols={0:{cellWidth:7},1:{cellWidth:21,fontSize:6.6},2:{cellWidth:g?36:40}};
  var obsIdx=head.length-1;cols[obsIdx]={cellWidth:'auto'};
  return table(d,y,head,body,{fs:7.1,foot:foot,cols:cols,cell:function(h){if(h.section==='body'&&dspRows[h.row.index]){h.cell.styles.fillColor=DSP_F;if(h.column.index===2)h.cell.styles.textColor=DSP_T;}}});}
function r2(x){return Math.round(x*100)/100;}
function registerTable(d,y,list,cid,p){
  var cols=A.colsOf(cid,p),head=['N°','Nom et prénom'],nC=cols.length;
  var holIdx={},NO=A.colNos(cid,p);cols.forEach(function(c,i){if(c.hol){holIdx[2+i]=c.hol;head.push((NO[i]?'S'+NO[i]:'')+'\n'+c.date.slice(8,10)+'/'+c.date.slice(5,7));return;}var sd=A.sessDate(cid,p,c.s);head.push('S'+NO[i]+(sd?'\n'+sd.slice(8,10)+'/'+sd.slice(5,7):''));});
  head.push('A','R','Pts');
  var dsp={};var body=list.map(function(s,i){if(A.dspInCycle(s,p))dsp[i]=1;var row=[i+1,C(s.name,{halign:'center',fontStyle:'bold'})];
    cols.forEach(function(c){if(c.hol){row.push(C('',{fillColor:HOL_F}));return;}var r=A.rec(cid,p,c.s);if(!r){row.push(C('',{fillColor:[252,252,253]}));return;}var code=A.codeOf(r.marks[s.id]),cell=stCell(code);if(A.dspAt(s,cid,p,c.s)&&code==='P')cell.styles.fillColor=DSP_F;row.push(cell);});
    var st=A.perStat(cid,s.id,p);row.push(zero(st.A,ST.A.c),zero(st.L,ST.L.c),C(A.fmtPts(st.ded),{fontStyle:'bold'}));return row;});
  var nameW=nC>18?30:nC>12?36:44,rest=W-2*M-7-nameW-3*8,cw=nC?Math.min(10,rest/nC):8,fs=nC>20?5.6:nC>14?6.2:6.8;
  var cs={0:{cellWidth:6},1:{cellWidth:nameW,halign:'center'}};for(var i=0;i<nC;i++)cs[2+i]={cellWidth:cw};cs[2+nC]={cellWidth:7};cs[3+nC]={cellWidth:7};cs[4+nC]={cellWidth:9};
  var spans={};
  function flush(){Object.keys(spans).forEach(function(k){var sp=spans[k];d.setFillColor.apply(d,HOL_F);var tw2=sp.w-0.8,msg=A.holShort(sp.h);vtext(d,msg,sp.x+sp.w/2,(sp.y0+sp.y1)/2,sp.y1-sp.y0-3,sp.w>=6?7:5.8);});spans={};}
  var tw=6+nameW+nC*cw+23;return table(d,y,head,body,{fs:fs,cols:cs,width:tw,left:Math.max(M,(W-tw)/2),right:Math.max(M,(W-tw)/2),
    draw:function(h){var hh=holIdx[h.column.index];if(!hh||h.section!=='body')return;var c=h.cell;hatch(d,c.x,c.y,c.width,c.height,1.5);d.setDrawColor.apply(d,HOL_L);d.setLineWidth(0.2);d.line(c.x,c.y,c.x,c.y+c.height);d.line(c.x+c.width,c.y,c.x+c.width,c.y+c.height);
      var sp=spans[h.column.index];if(!sp)sp=spans[h.column.index]={x:c.x,w:c.width,y0:c.y,y1:c.y+c.height,h:hh};else{sp.y0=Math.min(sp.y0,c.y);sp.y1=Math.max(sp.y1,c.y+c.height);}},
    page:function(){flush();},
    cell:function(h){if(h.section==='head'){h.cell.styles.fontSize=nC>16?5:5.8;h.cell.styles.cellPadding=0.8;if(holIdx[h.column.index])h.cell.styles.fillColor=HOL_H;}else if(h.section==='body'){h.cell.styles.cellPadding={top:1.1,bottom:1.1,left:0.6,right:0.6};if(dsp[h.row.index]&&h.column.index===1){h.cell.styles.fillColor=DSP_F;h.cell.styles.textColor=DSP_T;}}}});}
function groupsBlock(d,y,cid,withTitle){
  var m=A.grpMembers(cid);if(!m)return y;var c=A.cls(cid),list=A.studentsIn(cid),mean=A.classMean(list),g=m.g;
  if(withTitle!==false){d.addPage();y=TOP;}
  y=section(d,y,'Groupes de travail – '+c.name,(g.lock?'Groupes verrouillés · ':'')+pl(g.names.length,'groupe'),40);
  y=note(d,y,'Groupes hétérogènes à l’intérieur (niveaux physiques mélangés), homogènes entre eux (effectifs à 1 près, niveau physique moyen proche) et mixtes (filles et garçons répartis). Niveau physique = indice composite des tests anthropométriques et physiques standardisés dans la classe (50 = moyenne de la classe) ; élève sans test = moyenne de la classe ('+num(r1(mean))+').');
  var rows=m.groups.map(function(a,i){var s=A.grpStats(a,mean);return [C(String(i+1),{fillColor:GC[i],textColor:255,fontStyle:'bold'}),C(A.grpName(g,i),{halign:'left',fontStyle:'bold',textColor:GC[i]}),s.n,s.f,s.m,s.u||'',num(r1(s.avg)),s.d||''];});
  var all=A.grpStats(list,mean);
  if(m.none.length){var sn=A.grpStats(m.none,mean);rows.push(['?',C('Sans groupe',{halign:'left'}),sn.n,sn.f,sn.m,sn.u||'',num(r1(sn.avg)),sn.d||'']);}
  y=table(d,y,['','Groupe','Effectif','Filles','Garçons','Non renseigné','Niveau physique moyen','Dispensés'],rows,{fs:7.6,foot:['',C('Classe',{halign:'left'}),all.n,all.f,all.m,all.u||'',num(r1(all.avg)),all.d||''],cols:{0:{cellWidth:8},1:{cellWidth:48}}});
  var sets=m.groups.map(function(a,i){return {i:i,a:a};});if(m.none.length)sets.push({i:-1,a:m.none});
  var colW=(W-2*M-6)/2;
  for(var k=0;k<sets.length;k+=2){var need=0;[sets[k],sets[k+1]].forEach(function(s){if(s)need=Math.max(need,12+s.a.length*5.2);});y=ensure(d,y,Math.min(need,120));var y0=y,ymax=y;
    [sets[k],sets[k+1]].forEach(function(s,j){if(!s)return;var col=s.i>=0?GC[s.i]:[102,112,133],st=A.grpStats(s.a,mean);
      var sorted=s.a.slice().sort(function(a,b){return A.cmpStu(a,b);});
      var body=sorted.map(function(x,n){var l=A.lvlOf(x),dp=A.dspActive(x);return [n+1,C(x.name,{halign:'center',fontStyle:'bold',textColor:dp?DSP_T:INK,fillColor:dp?DSP_F:undefined}),sexTxt(x),l==null?C('moy.',{textColor:MUTED}):num(Math.round(l)),dp?C('Dispensé',{textColor:DSP_T,fontSize:6}):''];});
      var title=(s.i>=0?A.grpName(g,s.i):'Sans groupe')+' – '+st.n+' él. · '+st.f+' F / '+st.m+' G · ind. phys. '+num(Math.round(st.avg));
      d.autoTable({startY:y0,head:[[{content:title,colSpan:5,styles:{halign:'left',fillColor:col,textColor:255,fontSize:7.6}}],['N°','Nom et prénom','Sexe','Ind. phys.','Obs.']],body:body,theme:'grid',
        margin:{top:TOP,left:M+j*(colW+6),right:W-M-(M+j*(colW+6))-colW,bottom:BOT},tableWidth:colW,
        styles:{font:'helvetica',fontSize:7,cellPadding:1.1,lineColor:LINE,lineWidth:0.2,textColor:INK,halign:'center',valign:'middle'},
        headStyles:{fillColor:s.i>=0?GS[s.i]:[242,244,247],textColor:col,fontStyle:'bold',fontSize:6.6},columnStyles:{0:{cellWidth:6},1:{halign:'center'},2:{cellWidth:9},3:{cellWidth:11},4:{cellWidth:13}},
        didParseCell:function(h){var t=h.cell.text.join(' ');if(isAr(t)){h.cell.styles.font='NSA';h.cell.text=h.cell.text.map(function(x){return vis(clean(x));});}else h.cell.text=h.cell.text.map(function(x){return clean(x).replace(WA,'');});}});
      ymax=Math.max(ymax,d.lastAutoTable.finalY);if(d.getCurrentPageInfo().pageNumber!==undefined){} });
    y=ymax+6;}
  return y;}

/* ================= rapports ================= */
function repCycle(o){var cid=o.cid,p=o.p,c=A.cls(cid);if(!c)throw U('Choisissez une classe.');var list=A.studentsIn(cid);if(!list.length)throw U('Aucun élève dans cette classe.');
  var cy=A.cal().cycles[p],t=agg(list,cid,p),S=A.sessCount(cid,p),cats=sessSeries(cid,p,list);
  var m=meta('Bilan · '+A.cycleLabel(p),'Classe '+c.name+' · '+pl(list.length,'élève')+(cy&&!cy.bad?' · du '+A.dmy(cy.start)+' au '+A.dmy(cy.end):'')+' · '+t.held+' séance'+(t.held>1?'s':'')+' effectuée'+(t.held>1?'s':'')+' sur '+S+' prévue'+(S>1?'s':'')+(holCount(cid,p)?' · '+pl(holCount(cid,p),'créneau férié ou de vacances','créneaux fériés ou de vacances')+' (non comptés)':'')+' · note comportementale : '+A.capTxt(cid),'Bilan '+A.cycleName(p)+' · Classe '+c.name);
  var d=newDoc(m),y=titleBlock(d,m);
  y=cards(d,y,cardsFor(t,cid,p,{heldSub:'sur '+S+' prévues'}));
  y=chartsBlock(d,y,t,cats,'Taux de présence par séance (%)','Absences et incidents par séance');
  var top=topRows(list,cid,p,12);y=section(d,y,'Élèves les plus concernés','absences, retards et sans tenue',20+top.length*5.3);y=hBars(d,M,y+1,W-2*M,top,'Nombre de séances par statut (12 premiers)')+4;
  y=section(d,y,'Détail par élève',A.cycleLabel(p),40);y=studentTable(d,y,list,cid,p);y=codesNote(d,y);
  d.addPage();y=section(d,TOP,'Registre des séances – '+A.cycleName(p),c.name);y=registerTable(d,y,list,cid,p);y=holLegend(d,y);y=codesNote(d,y);
  y=holTable(d,y+2,[cid],[p],periodRange(p),A.cycleLabel(p)+(periodRange(p)?' · du '+A.dmy(periodRange(p)[0])+' au '+A.dmy(periodRange(p)[1]):''));
  groupsBlock(d,y,cid);
  return {doc:d,meta:m,name:'Bilan_'+A.slug(A.cycleName(p))+'_'+A.slug(c.name)+'_'+A.todayStr()+'.pdf'};}
function repYear(o){var sc=o.scope==='s1'||o.scope==='s2'?o.scope:'year',sem=sc!=='year',cid=o.cid,c=A.cls(cid);if(!c)throw U('Choisissez une classe.');var list=A.studentsIn(cid);if(!list.length)throw U('Aucun élève dans cette classe.');
  var DB=A.db(),t=agg(list,cid,sc),cyc=A.cal().cycles,PS=A.scopeCycles(sc),P=PS.length,planned=0,i;PS.forEach(function(p){planned+=A.sessCount(cid,p);});
  var per=PS.map(function(p){return agg(list,cid,p);});var SL=sem?A.semName(sc):'année entière';
  var cats=per.map(function(tp,k){i=PS[k];return {l:'C'+(i+1),sub:String(DB.periods[i]||'').slice(0,12),v:tp.rate,c:{A:tp.U,J:tp.J,M:tp.M,K:tp.K,L:tp.L,S:tp.S}};});
  var m=meta((sem?'Bilan '+A.semName(sc)+' · Classe ':'Bilan annuel · Classe ')+c.name,pl(list.length,'élève')+' · '+t.held+' séance'+(t.held>1?'s':'')+' effectuée'+(t.held>1?'s':'')+' sur '+planned+' prévues · '+pl(P,'cycle')+(sem?' (cycles '+(PS[0]+1)+' à '+(PS[P-1]+1)+')':'')+(sem&&periodRange(sc)?' · du '+A.dmy(periodRange(sc)[0])+' au '+A.dmy(periodRange(sc)[1]):'')+' · note comportementale : '+A.capTxt(cid),(sem?'Bilan '+A.semName(sc):'Bilan annuel')+' · Classe '+c.name);
  var d=newDoc(m),y=titleBlock(d,m);
  y=cards(d,y,cardsFor(t,cid,sc,{heldSub:'sur '+planned+' prévues'}));
  y=chartsBlock(d,y,t,cats,'Taux de présence par cycle (%)','Absences et incidents par cycle');
  var top=topRows(list,cid,sc,12);y=section(d,y,'Élèves les plus concernés',SL,20+top.length*5.3);y=hBars(d,M,y+1,W-2*M,top,'Nombre de séances par statut (12 premiers)')+4;
  y=section(d,y,'Synthèse par cycle','',30);
  var hTot=0;y=table(d,y,['Cycle','Activité','Période','Séances','Fériés / vac.','Présence','A','AJ','M','MJ','R','ST','Pts moy.'],per.map(function(tp,k){var i=PS[k],cc=cyc[i],hc=holCount(cid,i);hTot+=hc;return [C(A.cycleName(i),{fontStyle:'bold'}),C(DB.periods[i]||'—',{halign:'left'}),cc&&!cc.bad?A.dmy(cc.start).slice(0,5)+' – '+A.dmy(cc.end).slice(0,5):'—',tp.held+' / '+A.sessCount(cid,i),hc?C(String(hc),{fillColor:HOL_F,textColor:HOL_T,fontStyle:'bold'}):C('0',{textColor:[190,196,206]}),C(pct(tp.rate,1),{fontStyle:'bold',textColor:tp.rate==null?MUTED:PG}),zero(tp.U,ST.A.c),zero(tp.J,ST.J.c),zero(tp.M,ST.M.c),zero(tp.K,ST.K.c),zero(tp.L,ST.L.c),zero(tp.S,ST.S.c),A.fmtPts(tp.n?r1(tp.ded/tp.n):0)];}),{fs:7.2,foot:[sem?SL:'Année','','',t.held+' / '+planned,String(hTot),C(pct(t.rate,1),{fontStyle:'bold',textColor:t.rate==null?MUTED:PG}),t.U,t.J,t.M,t.K,t.L,t.S,A.fmtPts(t.n?r1(t.ded/t.n):0)],cols:{1:{cellWidth:32}}});
  y=note(d,y,'Fériés / vac. = créneaux de l’emploi du temps tombant un jour férié ou pendant les vacances : non comptés dans les séances ni dans le taux de présence (détail en fin de document).');
  y=section(d,y,'Détail par élève – '+SL,c.name,40);y=studentTable(d,y,list,cid,sc);
  y=section(d,y,'Points retirés par cycle','limités par la note comportementale ('+A.capTxt(cid)+')',30);
  var head=['N°','Nom et prénom'];PS.forEach(function(p){head.push('C'+(p+1));});head.push('Total');
  var dsp={};y=table(d,y,head,list.map(function(s,n){var yy=sem?A.groupStat(cid,s.id,PS):A.yearStat(cid,s.id);if(sem?A.dspInScope(s,sc):A.dspOf(s))dsp[n]=1;var row=[n+1,C(s.name,{halign:'center',fontStyle:'bold'})];yy.per.forEach(function(st){row.push(C(A.fmtPts(st.ded),{textColor:st.capped?ST.A.c:st.ded?INK:[190,196,206],fontStyle:st.ded?'bold':'normal'}));});row.push(C(A.fmtPts(yy.ded),{fontStyle:'bold'}));return row;}),{fs:7,cols:{0:{cellWidth:7},1:{cellWidth:60}},cell:function(h){if(h.section==='body'&&dsp[h.row.index]){h.cell.styles.fillColor=DSP_F;}}});
  y=codesNote(d,y);
  y=holTable(d,y+2,[cid],PS,periodRange(sc),(sem?SL:'année scolaire')+(periodRange(sc)?' · du '+A.dmy(periodRange(sc)[0])+' au '+A.dmy(periodRange(sc)[1]):''));
  groupsBlock(d,y,cid);
  return {doc:d,meta:m,name:(sem?'Bilan-'+A.slug(A.semName(sc))+'_':'Bilan-annuel_')+A.slug(c.name)+'_'+A.todayStr()+'.pdf'};}
function repAll(o){o=o||{};var sc=o.scope==null||o.scope==='year'?'year':(o.scope==='s1'||o.scope==='s2')?o.scope:+o.scope;if(sc!=='year'&&sc!=='s1'&&sc!=='s2'&&!(sc>=0))sc='year';
  var sem=sc==='s1'||sc==='s2',PS=A.scopeCycles(sc),detail=!!o.detail,SL=sc==='year'?'année entière':sem?A.semName(sc):A.cycleLabel(sc),gen=detail||sc!=='year';
  var DB=A.db(),th=DB.settings.threshold,cls=DB.classes.filter(function(c){return A.countIn(c.id);});if(!cls.length)throw U('Aucun élève enregistré.');
  var T0={n:0,U:0,J:0,M:0,K:0,L:0,S:0,A:0,slots:0,dsp:0,alert:0,ded:0,f:0,g:0,held:0,abs:0},rows=[];
  cls.forEach(function(c){var list=A.studentsIn(c.id),t=agg(list,c.id,sc);rows.push({c:c,t:t});['n','U','J','M','K','L','S','slots','dsp','alert','ded','f','g','held','abs'].forEach(function(k){T0[k]+=t[k];});});
  T0.rate=T0.slots?(T0.slots-T0.abs)/T0.slots:null;
  var m=meta(gen?'Bilan de toutes les classes · '+SL:'Synthèse de toutes les classes',pl(cls.length,'classe')+' · '+pl(T0.n,'élève')+' · '+SL+(sem?' (cycles '+(PS[0]+1)+' à '+(PS[PS.length-1]+1)+')':'')+' · '+pl(T0.held,'séance')+' effectuée'+(T0.held>1?'s':'')+' (cumul) · seuil d’alerte : '+th+' absences non justifiées',gen?'Bilan · toutes les classes · '+SL:'Synthèse annuelle · toutes les classes');
  var d=newDoc(m),y=titleBlock(d,m);
  var it=cardsFor(T0,null,sc,{heldSub:'toutes classes'});it[0].s=pl(cls.length,'classe')+((T0.f||T0.g)?' · '+T0.f+' F / '+T0.g+' G':'');y=cards(d,y,it);
  y=section(d,y,'Comparaison des classes','',60);
  var segs=statusSegs(T0);donut(d,M+17,y+20,16,segs,pct(T0.rate,0),'présence',PG);donutLegend(d,M+37,y+6,segs,43);
  var yb=pctBars(d,M+84,y+1,W-M-(M+84),rows.map(function(r){return {l:r.c.name,v:r.t.rate};}),'Taux de présence par classe');y=Math.max(y+46,yb)+4;
  y=section(d,y,'Absences et incidents par classe','',60);stackBars(d,M,y+1,W-2*M,60,rows.map(function(r){return {l:r.c.name,c:{A:r.t.U,J:r.t.J,M:r.t.M,K:r.t.K,L:r.t.L,S:r.t.S}};}),'Nombre de séances concernées ('+(sc==='year'?'année':SL)+')');y+=66;
  y=section(d,y,'Tableau récapitulatif par classe','',40);
  y=table(d,y,['Classe','Note comp.','Effectif','F / G','Séances','Présence','Absence','A','AJ','M','MJ','R','ST','Disp.','Alertes','Pts moy.'],rows.map(function(r){var t=r.t;var ci=A.capInfo(r.c.id);return [C(r.c.name,{halign:'left',fontStyle:'bold'}),C(num(ci.v)+(ci.man?' *':ci.lv?' ('+ci.lv+')':''),{textColor:ci.man?[184,110,0]:INK}),t.n,(t.f||t.g)?t.f+' / '+t.g:'—',t.held,C(pct(t.rate,1),{fontStyle:'bold',textColor:t.rate==null?MUTED:PG}),C(restPct(t.rate),{fontStyle:'bold',textColor:t.rate==null?MUTED:PR}),zero(t.U,ST.A.c),zero(t.J,ST.J.c),zero(t.M,ST.M.c),zero(t.K,ST.K.c),zero(t.L,ST.L.c),zero(t.S,ST.S.c),t.dsp||'',t.alert?C(String(t.alert),{textColor:ST.A.c,fontStyle:'bold'}):'',A.fmtPts(t.n?r1(t.ded/t.n):0)];}),{fs:7.2,foot:['Total','',T0.n,(T0.f||T0.g)?T0.f+' / '+T0.g:'—',T0.held,C(pct(T0.rate,1),{fontStyle:'bold',textColor:T0.rate==null?MUTED:PG}),C(restPct(T0.rate),{fontStyle:'bold',textColor:T0.rate==null?MUTED:PR}),T0.U,T0.J,T0.M,T0.K,T0.L,T0.S,T0.dsp,T0.alert,A.fmtPts(T0.n?r1(T0.ded/T0.n):0)],cols:{0:{cellWidth:26},1:{cellWidth:16}}});
  y=note(d,y,'Note comp. = note comportementale par cycle (pts) : par défaut selon le niveau — Connaissances comportementales (OP 2007) : TC 5 · 1BAC 4 · 2BAC 3'+(rows.some(function(r){return A.capInfo(r.c.id).man;})?' ; * = valeur personnalisée pour la classe':'')+'.');
  var al=[];DB.students.forEach(function(s){if(!A.cls(s.classId))return;var yy=multi(sc)?A.scopeStat(s.classId,s.id,sc):A.yearStat(s.classId,s.id).per[sc];if(yy.U>=th)al.push({s:s,y:yy});});
  al.sort(function(a,b){return b.y.U-a.y.U||A.cmpStu(a.s,b.s);});
  y=section(d,y,'Élèves en alerte',al.length?pl(al.length,'élève')+' · '+th+' abs. non justifiées ou plus':'aucun élève',20);
  if(!al.length)y=note(d,y,'Aucun élève n’atteint '+th+' absences non justifiées. Bravo !',ST.P.ch);
  else y=table(d,y,['N°','Classe','Code Massar','Nom et prénom','A','AJ','M','MJ','R','ST','Pts retirés'],al.map(function(a,i){var q=a.y;return [i+1,C(A.clsName(a.s.classId),{fontStyle:'bold'}),a.s.sid||'',C(a.s.name,{halign:'center',fontStyle:'bold'}),C(String(q.U),{textColor:ST.A.c,fontStyle:'bold'}),zero(q.J,ST.J.c),zero(q.M,ST.M.c),zero(q.K,ST.K.c),zero(q.L,ST.L.c),zero(q.S,ST.S.c),A.fmtPts(q.ded)];}),{fs:7.1,cols:{0:{cellWidth:7},3:{cellWidth:52}}});
  if(detail){
    y=section(d,y,'Détail par élève – '+SL,pl(T0.n,'élève')+' · '+pl(cls.length,'classe')+' · sous-total par classe',40);
    var body=[],sub={},n=0;
    cls.forEach(function(c,ci){var q=rows[ci].t;
      A.studentsIn(c.id).forEach(function(s){n++;var st=multi(sc)?A.scopeStat(c.id,s.id,sc):A.yearStat(c.id,s.id).per[sc],rt=stRate(st);
        body.push([n,C(c.name,{fontStyle:'bold'}),s.sid||'',C(s.name,{halign:'center',fontStyle:'bold'}),sexTxt(s),C(pct(rt,0),{textColor:rt==null?MUTED:PG,fontStyle:'bold'}),zero(st.U,ST.A.c),zero(st.J,ST.J.c),zero(st.M,ST.M.c),zero(st.K,ST.K.c),zero(st.L,ST.L.c),zero(st.S,ST.S.c),C(A.fmtPts(st.ded),{textColor:st.ded?[184,110,0]:[190,196,206],fontStyle:'bold'})]);});
      sub[body.length]=1;body.push([{content:'Sous-total '+c.name+' · '+pl(q.n,'élève'),colSpan:5,styles:{halign:'left',fontStyle:'bold'}},C(pct(q.rate,0),{fontStyle:'bold',textColor:q.rate==null?MUTED:PG}),q.U,q.J,q.M,q.K,q.L,q.S,A.fmtPts(r2(q.ded))]);});
    y=table(d,y,['N°','Classe','Code Massar','Nom et prénom','Sexe','Présence','A','AJ','M','MJ','R','ST','Pts retirés'],body,{fs:7,foot:[{content:'Total général · '+pl(T0.n,'élève'),colSpan:5,styles:{halign:'left'}},C(pct(T0.rate,0),{fontStyle:'bold',textColor:T0.rate==null?MUTED:PG}),T0.U,T0.J,T0.M,T0.K,T0.L,T0.S,A.fmtPts(r2(T0.ded))],cols:{0:{cellWidth:7},1:{cellWidth:19},2:{cellWidth:21},3:{cellWidth:44}},
      cell:function(h){if(h.section==='body'&&sub[h.row.index]){h.cell.styles.fillColor=[221,228,252];h.cell.styles.fontStyle='bold';}}});
    y=codesNote(d,y);}
  var ids=cls.map(function(c){return c.id;}),yr=periodRange(sc),lr=lastRecDate(ids);
  y=holTable(d,y,ids,PS,yr&&lr?[yr[0],lr<yr[1]?lr:yr[1]]:yr,yr?'du '+A.dmy(yr[0])+' au '+A.dmy(lr&&lr<yr[1]?lr:yr[1])+' · toutes classes':'');
  return {doc:d,meta:m,name:(gen?'Bilan_toutes-classes_'+A.slug(sc==='year'?'annee':sem?A.semName(sc):A.cycleName(sc))+'_':'Synthese_toutes-classes_')+A.todayStr()+'.pdf'};}
function repStudents(o){var DB=A.db(),sc=o.scope==='s1'||o.scope==='s2'?o.scope:'year',sem=sc!=='year',cid=o.cid||'',list=A.studentsIn(cid);if(!list.length)throw U('Aucun élève à exporter.');
  var cl=DB.classes.filter(function(c){return (!cid||c.id===cid)&&A.countIn(c.id);});
  var f=0,g=0,dp=0;list.forEach(function(s){var x=A.sexOf(s);if(x==='F')f++;else if(x==='G')g++;if(A.dspActive(s))dp++;});
  var m=meta('Liste des élèves'+(cid?' · Classe '+A.clsName(cid):' · toutes les classes')+(sem?' · '+A.semName(sc):''),pl(list.length,'élève')+' · '+pl(cl.length,'classe')+' · absences cumulées sur '+(sem?'le '+A.semName(sc).toLowerCase()+' (cycles '+(A.scopeCycles(sc)[0]+1)+' à '+(A.scopeCycles(sc).slice(-1)[0]+1)+')':'l’année'),'Liste des élèves'+(cid?' · '+A.clsName(cid):'')+(sem?' · '+A.semName(sc):''));
  var d=newDoc(m),y=titleBlock(d,m);
  y=cards(d,y,[{v:list.length,l:'Élèves',s:pl(cl.length,'classe')},{v:f,l:'Filles',c:[219,39,119]},{v:g,l:'Garçons',c:[37,99,235]},{v:dp,l:'Dispensés (en cours)',c:[107,114,128]}]);
  if(cl.length>1){y=section(d,y,'Effectifs par classe','',58);var cats=cl.map(function(c){var a=A.studentsIn(c.id),ff=0,gg=0;a.forEach(function(s){var x=A.sexOf(s);if(x==='F')ff++;else if(x==='G')gg++;});return {l:c.name,c:{F:ff,G:gg,U:a.length-ff-gg}};});
    ST.F={l:'Filles',ch:[244,114,182]};ST.G={l:'Garçons',ch:[96,165,250]};ST.U={l:'Sexe non renseigné',ch:[190,196,206]};stackBars(d,M,y+1,W-2*M,56,cats,'Nombre d’élèves',['F','G','U']);y+=62;
    y=section(d,y,'Récapitulatif par classe','',30);var tot=[0,0,0,0,0];
    y=table(d,y,['Classe','Effectif','Filles','Garçons','Sexe non renseigné','Dispensés','Groupes','Tests physiques'],cl.map(function(c){var a=A.studentsIn(c.id),ff=0,gg=0,dd=0,tt=0;a.forEach(function(s){var x=A.sexOf(s);if(x==='F')ff++;else if(x==='G')gg++;if(A.dspActive(s))dd++;if(A.hasPhys(s))tt++;});tot[0]+=a.length;tot[1]+=ff;tot[2]+=gg;tot[3]+=dd;tot[4]+=tt;var gp=A.grpOf(c.id);return [C(c.name,{halign:'left',fontStyle:'bold'}),a.length,ff,gg,a.length-ff-gg||'',dd||'',gp?gp.names.length:'—',tt+' / '+a.length];}),{fs:7.4,foot:[C('Total',{halign:'left'}),tot[0],tot[1],tot[2],tot[0]-tot[1]-tot[2]||'',tot[3]||'','',tot[4]+' / '+tot[0]]});}
  cl.forEach(function(c,ci){var a=A.studentsIn(c.id),gp=A.grpOf(c.id);if(ci||cl.length>1){d.addPage();y=TOP;}
    y=section(d,y,'Classe '+c.name,pl(a.length,'élève'),20);
    var head=['N°','Code Massar','Nom et prénom','Sexe','Naissance'];if(gp)head.push('Grp');head.push('Parent / tuteur','Téléphone','Abs.','Dispense');
    var dsp={};y=table(d,y,head,a.map(function(s,i){var yy=A.scopeStat(c.id,s.id,sc);if(A.dspOf(s))dsp[i]=1;var row=[i+1,s.sid||'',C(s.name,{halign:'center',fontStyle:'bold'}),sexTxt(s),A.dmy(s.dob)];if(gp)row.push(grpCellOf(c.id,s));row.push(C(s.parent||'',{halign:'left'}),s.phone||'',zero(yy.A,yy.U>=DB.settings.threshold?ST.A.c:INK),C(A.dspOf(s)?A.dspShort(A.dspOf(s)):'',{fontSize:6.3,textColor:DSP_T}));return row;}),{fs:7,cols:{0:{cellWidth:7},1:{cellWidth:21,fontSize:6.5},2:{cellWidth:44}},cell:function(h){if(h.section==='body'&&dsp[h.row.index])h.cell.styles.fillColor=DSP_F;}});});
  return {doc:d,meta:m,name:'Eleves_'+(sem?A.slug(A.semName(sc))+'_':'')+A.slug(cid?A.clsName(cid):'toutes-classes')+'_'+A.todayStr()+'.pdf'};}
function repRecords(o){var DB=A.db(),sc=o.scope==='s1'||o.scope==='s2'?o.scope:'year',sem=sc!=='year',PS=A.scopeCycles(sc),cid=o.cid||'',rows=[],t={A:0,J:0,M:0,K:0,L:0,S:0},byCls={},byCyc={};
  DB.classes.forEach(function(c){if(cid&&c.id!==cid)return;var list=A.studentsIn(c.id);
    PS.forEach(function(p){for(var s=0,S=A.sessCount(c.id,p);s<S;s++){var r=A.rec(c.id,p,s);if(!r)continue;var sd=A.sessDate(c.id,p,s);
      list.forEach(function(st){var mk=r.marks[st.id];if(!mk)return;var code=A.codeOf(mk);t[code]++;(byCls[c.id]=byCls[c.id]||{A:0,J:0,M:0,K:0,L:0,S:0})[code]++;(byCyc[p]=byCyc[p]||{A:0,J:0,M:0,K:0,L:0,S:0})[code]++;
        rows.push({c:c,p:p,s:s,sd:sd,st:st,code:code,r:mk.r||'',dsp:A.dspAt(st,c.id,p,s)});});}});});
  if(!rows.length)throw U(sem?'Aucune absence ni retard enregistré pour le '+A.semName(sc).toLowerCase()+'.':'Aucune absence ni retard enregistré pour l’instant.');
  var tot=rows.length;
  var m=meta('Détail des absences et incidents'+(cid?' · Classe '+A.clsName(cid):' · toutes les classes')+(sem?' · '+A.semName(sc):''),(sem?A.semName(sc)+' (cycles '+(PS[0]+1)+' à '+(PS[PS.length-1]+1)+') · ':'')+pl(tot,'incident')+' enregistré'+(tot>1?'s':'')+' (absences, maladies, retards, sans tenue) · classés par classe puis par date','Détail des absences'+(cid?' · '+A.clsName(cid):'')+(sem?' · '+A.semName(sc):''));
  var d=newDoc(m),y=titleBlock(d,m);
  y=cards(d,y,[{v:tot,l:'Incidents au total',s:'hors présences'},{v:t.A,l:'Absences non justifiées',c:ST.A.c},{v:t.J,l:'Absences justifiées',c:ST.J.c},{v:t.M+' / '+t.K,l:'Maladie M / MJ',c:ST.M.c},{v:t.L,l:'Retards',c:ST.L.c},{v:t.S,l:'Sans tenue',c:ST.S.c},{v:rows.filter(function(r){return r.r;}).length,l:'Avec motif',s:'motif saisi'},{v:Object.keys(rows.reduce(function(a,r){a[r.st.id]=1;return a;},{})).length,l:'Élèves concernés'}]);
  y=section(d,y,cid?'Répartition par cycle':'Répartition par classe','',60);
  var cats=cid?Object.keys(byCyc).map(function(p){return {l:'C'+(+p+1),sub:String(DB.periods[p]||'').slice(0,12),c:byCyc[p]};}):DB.classes.filter(function(c){return byCls[c.id];}).map(function(c){return {l:c.name,c:byCls[c.id]};});
  stackBars(d,M,y+1,W-2*M,58,cats,'Nombre d’incidents');y+=64;
  rows.sort(function(a,b){return DB.classes.indexOf(a.c)-DB.classes.indexOf(b.c)||(a.sd||'9').localeCompare(b.sd||'9')||a.p-b.p||a.s-b.s||A.cmpStu(a.st,b.st);});
  var per={};rows.forEach(function(r){var k=r.st.id;if(!per[k])per[k]={st:r.st,c:r.c,A:0,J:0,M:0,K:0,L:0,S:0,t:0};per[k][r.code]++;per[k].t++;});
  var pr=Object.keys(per).map(function(k){return per[k];}).sort(function(a,b){return b.t-a.t||b.A-a.A||A.cmpStu(a.st,b.st);});
  y=section(d,y,'Récapitulatif par élève',pl(pr.length,'élève')+' concerné'+(pr.length>1?'s':''),30);
  var hh=['N°'];if(!cid)hh.push('Classe');hh.push('Nom et prénom','Code Massar','A','AJ','M','MJ','R','ST','Total');
  y=table(d,y,hh,pr.map(function(x,i){var r=[i+1];if(!cid)r.push(C(x.c.name,{fontStyle:'bold'}));r.push(C(x.st.name,{halign:'center',fontStyle:'bold'}),x.st.sid||'',zero(x.A,ST.A.c),zero(x.J,ST.J.c),zero(x.M,ST.M.c),zero(x.K,ST.K.c),zero(x.L,ST.L.c),zero(x.S,ST.S.c),C(String(x.t),{fontStyle:'bold'}));return r;}),{fs:7,cols:{0:{cellWidth:7},[cid?1:2]:{cellWidth:50}}});
  var scope=DB.classes.filter(function(c){return (!cid||c.id===cid)&&A.countIn(c.id);}),ids=scope.map(function(c){return c.id;}),yr=periodRange(sc),lr=lastRecDate(ids),rg=yr?[yr[0],lr&&lr<yr[1]?lr:yr[1]]:null,hr=[];
  if(rg)scope.forEach(function(c){holList([c.id],PS,rg).forEach(function(e){if(e.cols.length)hr.push({hol:e.h,c:c,sd:e.cols[0].date,p:e.cols[0].p,cols:e.cols});});});
  var hn=0;hr.forEach(function(x){hn+=x.cols.length;});
  if(hr.length){rows=rows.concat(hr);rows.sort(function(a,b){return DB.classes.indexOf(a.c)-DB.classes.indexOf(b.c)||(a.sd||'9').localeCompare(b.sd||'9')||(a.hol?-1:0)-(b.hol?-1:0)||a.p-b.p||(a.s||0)-(b.s||0)||(a.st&&b.st?A.cmpStu(a.st,b.st):0);});}
  y=section(d,y,'Liste détaillée',pl(tot,'ligne')+(hr.length?' + '+pl(hr.length,'jour férié / vacances','jours fériés / vacances'):''),30);
  var head=['Date','Cycle','Séance'];if(!cid)head.push('Classe');head.push('Nom et prénom','Code Massar','Statut','Motif');
  var dsp={},hrow={};y=table(d,y,head,rows.map(function(r,i){if(r.hol){hrow[i]=1;var hx=[C(A.dmy(r.sd),{fontStyle:'bold',textColor:HOL_T}),C('C'+(r.p+1),{textColor:HOL_T}),C(snList(r.cols),{textColor:HOL_T})];if(!cid)hx.push(C(r.c.name,{fontStyle:'bold',textColor:HOL_T}));
      hx.push({content:holType(r.hol)+' : '+holFull(r.hol)+' – '+pl(r.cols.length,'séance')+' non comptée'+(r.cols.length>1?'s':'')+' ('+r.cols.map(function(c){return wdd(c.date);}).join(', ')+')',colSpan:4,styles:{halign:'left',fontStyle:'bolditalic',textColor:HOL_T}});return hx;}
    if(r.dsp)dsp[i]=1;var row=[r.sd?A.dmy(r.sd):'—','C'+(r.p+1),'S'+A.sessNo(r.c.id,r.p,r.s)];if(!cid)row.push(C(r.c.name,{fontStyle:'bold'}));row.push(C(r.st.name,{halign:'center',fontStyle:'bold'}),r.st.sid||'',{content:ST[r.code].t+' – '+ST[r.code].l,styles:{fillColor:ST[r.code].f,textColor:ST[r.code].c,fontStyle:'bold',halign:'left'}},C(r.r,{halign:'left'}));return row;}),{fs:6.9,cols:{0:{cellWidth:17},1:{cellWidth:10},2:{cellWidth:11}},cell:function(h){if(h.section==='body'&&hrow[h.row.index])h.cell.styles.fillColor=HOL_F;},
    draw:function(h){if(h.section==='body'&&hrow[h.row.index]&&h.column.index===0){var c=h.cell;hatch(d,c.x+0.4,c.y+0.6,1.6,c.height-1.2,1.1);}}});
  y=note(d,y,'Seuls les incidents sont listés (les présences ne figurent pas). Lignes sable = jours fériés et vacances : séances non comptées dans les absences ni dans les taux de présence. Pour les données brutes complètes, utilisez l’export CSV (Excel).');
  y=holTable(d,y+2,ids,PS,rg,rg?'du '+A.dmy(rg[0])+' au '+A.dmy(rg[1])+(ids.length>1?' · '+pl(ids.length,'classe'):''):'');
  return {doc:d,meta:m,name:'Absences-detail_'+(sem?A.slug(A.semName(sc))+'_':'')+A.slug(cid?A.clsName(cid):'toutes-classes')+'_'+A.todayStr()+'.pdf'};}
function repStudent(o){var s=A.byId(o.sid);if(!s)throw U('Élève introuvable.');var DB=A.db(),cid=s.classId,y0=A.yearStat(cid,s.id),th=DB.settings.threshold,P=DB.periods.length,g=A.grpOf(cid),gi=A.grpIdx(g,s.id);
  var m=meta('Fiche de suivi · '+s.name,'Classe '+A.clsName(cid)+(s.sid?' · Code Massar '+s.sid:'')+' · année entière','Fiche élève · Classe '+A.clsName(cid));
  var d=newDoc(m),y=titleBlock(d,m);
  var dp=A.dspOf(s),info=[['Classe',A.clsName(cid)],['Code Massar',s.sid||'—'],['Sexe',A.sexOf(s)==='F'?'Fille':A.sexOf(s)==='G'?'Garçon':'—'],['Date de naissance',s.dob?A.dmy(s.dob):'—'],['Groupe',gi>=0?A.grpName(g,gi):'—'],['Indice physique',A.lvlOf(s)!=null?num(A.lvlOf(s))+' / 100 (50 = moyenne classe)':'—'],['Parent / tuteur',s.parent||'—'],['Téléphone',s.phone||'—'],['Dispense de sport',dp?A.dspLabel(dp)+(dp.since?' depuis le '+A.dmy(dp.since):''):'Non']];
  var body=[];for(var i=0;i<info.length;i+=2){var r=[C(info[i][0],{fontStyle:'bold',textColor:MUTED,halign:'left'}),C(info[i][1],{halign:'left'})];if(info[i+1])r.push(C(info[i+1][0],{fontStyle:'bold',textColor:MUTED,halign:'left'}),C(info[i+1][1],{halign:'left'}));else r.push('','');body.push(r);}
  var ph=A.photoData&&A.photoData(s.id),y0p=y;   /* 1.28.0 : photo de l’élève (si elle est chargée dans la fiche) en face des informations */
  y=table(d,y,null,body,{fs:7.8,cols:{0:{cellWidth:30},2:{cellWidth:30}},right:ph?M+31:M});
  if(ph){try{d.setDrawColor.apply(d,LINE);d.setLineWidth(0.3);d.addImage(ph,'JPEG',W-M-28,y0p,28,28);d.roundedRect(W-M-28,y0p,28,28,1.5,1.5,'S');y=Math.max(y,y0p+30);}catch(e){}}
  if(s.notes)y=note(d,y,'Remarques : '+s.notes,INK);
  var t={n:1,U:y0.U,J:y0.J,M:y0.M,K:y0.K,L:y0.L,S:y0.S,slots:y0.held,abs:y0.A+y0.M+y0.K};t.rate=t.slots?(t.slots-t.abs)/t.slots:null;
  y=cards(d,y,[{v:y0.held,l:'Séances effectuées'},{v:pct(t.rate),l:'Taux de présence',c:PG,rate:t.rate},{v:y0.U,l:'Absences non justifiées',c:y0.U>=th?ST.A.c:ST.A.c,s:y0.U>=th?'seuil d’alerte atteint':''},{v:y0.J,l:'Absences justifiées',c:ST.J.c},{v:y0.M+' / '+y0.K,l:'Maladie M / MJ',c:ST.M.c},{v:y0.L,l:'Retards',c:ST.L.c},{v:y0.S,l:'Sans tenue',c:ST.S.c},{v:A.fmtPts(y0.ded),l:'Points retirés (année)',c:[184,110,0]}]);
  y=section(d,y,'Répartition et évolution','',55);var segs=statusSegs(t);donut(d,M+17,y+20,16,segs,pct(t.rate,0),'présence',PG);donutLegend(d,M+37,y+6,segs,43);
  stackBars(d,M+84,y+1,W-M-(M+84),56,y0.per.map(function(st,i){return {l:'C'+(i+1),c:kcounts(st)};}),'Séances concernées par cycle');y+=62;
  y=section(d,y,'Détail par cycle','',30);
  var hT=0;y=table(d,y,['Cycle','Activité','Séances','Fériés / vac.','Présence','A','AJ','M','MJ','R','ST','Pts retirés'],y0.per.map(function(st,i){var hc=holCount(cid,i);hT+=hc;return [C(A.cycleName(i),{fontStyle:'bold'}),C(DB.periods[i]||'—',{halign:'left'}),st.held,hc?C(String(hc),{fillColor:HOL_F,textColor:HOL_T,fontStyle:'bold'}):C('0',{textColor:[190,196,206]}),pct(stRate(st),0),zero(st.U,ST.A.c),zero(st.J,ST.J.c),zero(st.M,ST.M.c),zero(st.K,ST.K.c),zero(st.L,ST.L.c),zero(st.S,ST.S.c),C(A.fmtPts(st.ded)+(st.ded?' / '+num(st.cap):''),{textColor:st.capped?ST.A.c:INK,fontStyle:'bold'})];}),{fs:7.2,foot:['Année','',y0.held,String(hT),pct(t.rate,0),y0.U,y0.J,y0.M,y0.K,y0.L,y0.S,A.fmtPts(y0.ded)],cols:{1:{cellWidth:40}}});
  y=testsOfStudent(d,y,s);
  var hist=A.historyOf(s.id),yr=periodRange('year'),lr=lastRecDate([cid]),rg=yr?[yr[0],lr&&lr<yr[1]?lr:yr[1]]:null,hh=[];
  if(rg&&hist.length)holList([cid],allPs(),rg).forEach(function(e){if(e.cols.length)hh.push({hol:e.h,date:e.cols[0].date,p:e.cols[0].p,cols:e.cols});});
  y=section(d,y,'Historique des absences et incidents',pl(hist.length,'ligne')+(hh.length?' · '+pl(hh.length,'jour férié / vacances','jours fériés / vacances'):''),20);
  var hrow={};if(hh.length){hist=hist.concat(hh);hist.sort(function(a,b){return (a.date||'9').localeCompare(b.date||'9')||(a.hol?-1:0)-(b.hol?-1:0)||a.p-b.p||(a.s||0)-(b.s||0);});}
  if(!hist.length)y=note(d,y,'Aucune absence, aucun retard, aucun oubli de tenue. Félicitations !',ST.P.ch);
  else y=table(d,y,['Date','Cycle','Séance','Classe','Statut','Motif'],hist.map(function(x,i){if(x.hol){hrow[i]=1;return [C(A.dmy(x.date),{fontStyle:'bold',textColor:HOL_T}),C(A.cycleName(x.p),{textColor:HOL_T}),C(snList(x.cols),{textColor:HOL_T}),C(A.clsName(cid),{textColor:HOL_T}),{content:holType(x.hol)+' : '+holFull(x.hol)+' – '+pl(x.cols.length,'séance')+' non comptée'+(x.cols.length>1?'s':''),colSpan:2,styles:{halign:'left',fontStyle:'bolditalic',textColor:HOL_T}}];}return [x.date?A.dmy(x.date):'—',A.cycleName(x.p),'S'+A.sessNo(x.cid,x.p,x.s),A.clsName(x.cid),{content:ST[x.code].t+' – '+ST[x.code].l,styles:{fillColor:ST[x.code].f,textColor:ST[x.code].c,fontStyle:'bold',halign:'left'}},C(x.r||'',{halign:'left'})];}),{fs:7.2,cols:{0:{cellWidth:20},4:{cellWidth:46}},cell:function(h){if(h.section==='body'&&hrow[h.row.index])h.cell.styles.fillColor=HOL_F;}});
  y=codesNote(d,y);
  y=holTable(d,y+2,[cid],allPs(),rg,rg?'du '+A.dmy(rg[0])+' au '+A.dmy(rg[1])+' · classe '+A.clsName(cid):'');
  return {doc:d,meta:m,name:'Fiche_'+A.slug(s.name)+'_'+A.todayStr()+'.pdf'};}
function repGroups(o){var DB=A.db(),cid=o.cid||'',cl=DB.classes.filter(function(c){return (!cid||c.id===cid)&&A.grpOf(c.id)&&A.countIn(c.id);});
  if(!cl.length)throw U(cid?'Aucun groupe pour cette classe : créez-les dans l’écran Absences (👥 Groupes).':'Aucune classe n’a encore de groupes.');
  var m=meta('Groupes de travail'+(cid?' · Classe '+A.clsName(cid):' · toutes les classes'),'Composition et équilibre des groupes (mixité, niveaux, effectifs) · '+pl(cl.length,'classe'),'Groupes de travail'+(cid?' · '+A.clsName(cid):''));
  var d=newDoc(m),y=titleBlock(d,m);
  cl.forEach(function(c,i){if(i){d.addPage();y=TOP;}
    var mm=A.grpMembers(c.id),list=A.studentsIn(c.id),mean=A.classMean(list);
    var st=mm.groups.map(function(a){return A.grpStats(a,mean);});
    y=cards(d,y,[{v:list.length,l:'Élèves',s:pl(mm.g.names.length,'groupe')},{v:st.map(function(s){return s.n;}).join(' / '),l:'Effectifs',s:'par groupe'},{v:st.map(function(s){return s.f;}).join(' / '),l:'Filles',s:'par groupe',c:[219,39,119]},{v:st.map(function(s){return s.m;}).join(' / '),l:'Garçons',s:'par groupe',c:[37,99,235]},{v:num(r1(Math.max.apply(null,st.map(function(s){return s.avg;}))-Math.min.apply(null,st.map(function(s){return s.avg;})))),l:'Écart d’indice physique',s:'entre groupes (sur 100)',c:ST.P.ch}],5);
    y=groupsBlock(d,y,c.id,false);});
  return {doc:d,meta:m,name:'Groupes_'+A.slug(cid?A.clsName(cid):'toutes-classes')+'_'+A.todayStr()+'.pdf'};}

/* ---------- tests anthropométriques et physiques ---------- */
function testVals(list,k){return list.map(function(s){return k==='imc'?A.imcOf(s):A.phys(s,k);}).filter(function(v){return v!=null;});}
function mstat(v){if(!v.length)return null;var t=0;v.forEach(function(x){t+=x;});var m=t/v.length,q=0;v.forEach(function(x){q+=(x-m)*(x-m);});return {n:v.length,m:m,sd:Math.sqrt(q/v.length),min:Math.min.apply(null,v),max:Math.max.apply(null,v)};}
function f2(x){return x==null?'—':num(Math.round(x*100)/100);}
function allTests(){var out=[];A.TESTS.forEach(function(t){out.push(t);if(t.k==='w')out.push({k:'imc',l:'IMC',u:'kg/m²',d:0});});return out;}
var IMC_COL={Maigreur:[28,126,214],Normal:[31,138,76],Surpoids:[217,119,6],'Obésité':[198,47,58]};
function testsOfStudent(d,y,s){var list=A.studentsIn(s.classId),sx=A.sexOf(s),same=list.filter(function(x){return sx&&A.sexOf(x)===sx;}),rows=[];
  allTests().forEach(function(t){var v=t.k==='imc'?A.imcOf(s):A.phys(s,t.k),cs=mstat(testVals(list,t.k)),ss=sx?mstat(testVals(same,t.k)):null,pos='';
    if(v!=null&&cs&&cs.n>1&&cs.sd&&t.d){var z=(v-cs.m)/cs.sd*t.d;pos=z>=1?'Nettement au-dessus':z>=0.3?'Au-dessus de la moyenne':z>-0.3?'Dans la moyenne':z>-1?'En dessous de la moyenne':'Nettement en dessous';}
    if(t.k==='imc'&&v!=null)pos=A.imcCat(v);
    rows.push([C(t.l,{halign:'left',fontStyle:'bold'}),v==null?C('—',{textColor:MUTED}):C(f2(v)+' '+t.u,{fontStyle:'bold',textColor:t.k==='imc'&&v!=null?IMC_COL[A.imcCat(v)]:INK}),cs?f2(cs.m):'—',ss?f2(ss.m):'—',cs?f2(cs.min)+' – '+f2(cs.max):'—',C(pos,{halign:'left',textColor:MUTED})]);});
  y=section(d,y,'Tests anthropométriques et physiques','indice physique : '+(A.lvlOf(s)==null?'—':num(A.lvlOf(s))+' / 100'),40);
  y=table(d,y,['Test','Résultat','Moy. classe','Moy. '+(sx==='F'?'filles':sx==='G'?'garçons':'même sexe'),'Min – max classe','Position'],rows,{fs:7.2,cols:{0:{cellWidth:44},5:{cellWidth:40}}});
  return note(d,y,'Position par rapport à la classe (écart à la moyenne en écarts-types ; pour la vitesse 30 m et la FC de repos, une valeur plus basse est meilleure). IMC indicatif (seuils 18,5 / 25 / 30).');}
function repTests(o){var DB=A.db(),cid=o.cid||'',cl=DB.classes.filter(function(c){return (!cid||c.id===cid)&&A.studentsIn(c.id).some(A.hasPhys);});
  if(!cl.length)throw U(cid?'Aucun test physique saisi pour cette classe (Élèves › 📏 Tests physiques).':'Aucun test physique saisi pour l’instant.');
  var m=meta('Tests anthropométriques et physiques'+(cid?' · Classe '+A.clsName(cid):' · toutes les classes'),'Résultats individuels, statistiques par test, IMC et indice physique (50 = moyenne de la classe) · '+pl(cl.length,'classe'),'Tests physiques'+(cid?' · '+A.clsName(cid):''));
  var d=newDoc(m),y=titleBlock(d,m),TT=allTests();
  cl.forEach(function(c,ci){if(ci){d.addPage();y=TOP;}var list=A.studentsIn(c.id),tested=list.filter(A.hasPhys),sc=A.physScores(c.id);
    var imcs=testVals(list,'imc'),cat={Maigreur:0,Normal:0,Surpoids:0,'Obésité':0};imcs.forEach(function(b){cat[A.imcCat(b)]++;});
    var ims=mstat(imcs),vma=mstat(testVals(list,'vma')),filled=0,cells=0;list.forEach(function(s){A.TESTS.forEach(function(t){cells++;if(A.phys(s,t.k)!=null)filled++;});});
    y=section(d,y,'Classe '+c.name,pl(list.length,'élève'),30);
    y=cards(d,y,[{v:tested.length+' / '+list.length,l:'Élèves testés',s:'au moins un test'},{v:pct(cells?filled/cells:0,0),l:'Complétude',s:filled+' résultats sur '+cells},{v:ims?num(r1(ims.m)):'—',l:'IMC moyen',s:ims?imcs.length+' élèves mesurés':'taille et poids requis',c:ST.P.ch},{v:vma?num(r1(vma.m))+' km/h':'—',l:'VMA moyenne',s:vma?vma.n+' élèves':'',c:PRI}]);
    y=section(d,y,'IMC et indice physique','',56);
    var segs=Object.keys(cat).map(function(k){return {l:k,v:cat[k],c:IMC_COL[k]};});donut(d,M+17,y+20,16,segs,imcs.length?String(imcs.length):'0','mesurés');donutLegend(d,M+37,y+6,segs,43);
    var bins=[{l:'< 35',sub:'faible',c:{A:0}},{l:'35–45',c:{A:0}},{l:'45–55',sub:'moyen',c:{A:0}},{l:'55–65',c:{A:0}},{l:'≥ 65',sub:'élevé',c:{A:0}}];
    Object.keys(sc).forEach(function(id){var v=sc[id],b=v<35?0:v<45?1:v<55?2:v<65?3:4;bins[b].c.A++;});bins.forEach(function(b){b.l=b.l.replace('≥','>=');});
    bins.forEach(function(b){b.c={X:b.c.A};});ST.X={l:'Élèves (indice physique sur 100)',ch:PRI};stackBars(d,M+84,y+1,W-M-(M+84),56,bins,'Répartition de l’indice physique (nombre d’élèves)',['X']);y+=62;
    y=section(d,y,'Statistiques par test','',40);
    var F=list.filter(function(s){return A.sexOf(s)==='F';}),G=list.filter(function(s){return A.sexOf(s)==='G';});
    y=table(d,y,['Test','Unité','Mesurés','Moyenne','Écart-type','Min','Max','Moy. filles','Moy. garçons'],TT.map(function(t){var a=mstat(testVals(list,t.k)),f=mstat(testVals(F,t.k)),g=mstat(testVals(G,t.k));return [C(t.l,{halign:'left',fontStyle:'bold'}),t.u,a?a.n:0,C(a?f2(a.m):'—',{fontStyle:'bold'}),a?f2(a.sd):'—',a?f2(a.min):'—',a?f2(a.max):'—',f?f2(f.m):'—',g?f2(g.m):'—'];}),{fs:7.1,cols:{0:{cellWidth:44}}});
    d.addPage();y=section(d,TOP,'Résultats individuels – '+c.name,'valeurs brutes · indice sur 100',20);
    var head=['N°','Nom et prénom','Sexe','Taille','Poids','IMC','Dét. V','Dét. H','FC rep.','Palier','VMA','30 m','Soupl.','Méd.-b.','Équil.','Indice'];
    var units=['','','','cm','kg','','cm','cm','bpm','','km/h','s','cm','m','s','/100'];
    var dsp={};y=table(d,y,head.map(function(h,i){return units[i]?h+'\n('+units[i]+')':h;}),list.map(function(s,i){if(A.dspActive(s))dsp[i]=1;var b=A.imcOf(s),row=[i+1,C(s.name,{halign:'center',fontStyle:'bold'}),sexTxt(s),f2(A.phys(s,'h')),f2(A.phys(s,'w')),b==null?'—':C(num(b),{textColor:IMC_COL[A.imcCat(b)],fontStyle:'bold'})];
      ['dv','dh','fc','nav','vma','v30','soup','mb','eq'].forEach(function(k){var v=A.phys(s,k);row.push(v==null?C('—',{textColor:[190,196,206]}):f2(v));});var ix=sc[s.id];row.push(ix==null?C('—',{textColor:MUTED}):C(num(Math.round(ix)),{fontStyle:'bold',textColor:ix>=55?ST.P.ch:ix<45?ST.A.c:INK}));return row;}),
      {fs:6.6,cols:{0:{cellWidth:6},1:{cellWidth:38}},cell:function(h){if(h.section==='head'){h.cell.styles.fontSize=5.8;h.cell.styles.cellPadding=0.8;}if(h.section==='body'&&dsp[h.row.index])h.cell.styles.fillColor=DSP_F;}});
    y=note(d,y,'Indice physique : moyenne des scores standardisés (z) de la classe pour chaque test disponible (IMC noté par l’écart à la zone 18,5–25 ; vitesse 30 m et FC de repos : plus bas = mieux ; navette et VMA comptent comme un seul test d’endurance), ramenée sur 100 (50 = moyenne de la classe). Ligne grise = élève dispensé(e).');});
  return {doc:d,meta:m,name:'Tests-physiques_'+A.slug(cid?A.clsName(cid):'toutes-classes')+'_'+A.todayStr()+'.pdf'};}


/* relevé de notes /20 d’une classe pour un cycle (Évaluation OP 2007) */
function repGrades(o){var cid=o.cid,p=+o.p||0,c=A.cls(cid);if(!c)throw U('Choisissez une classe.');var list=A.studentsIn(cid);if(!list.length)throw U('Aucun élève dans cette classe.');
  var DB=A.db(),sp=A.gradeSpec(cid,p),act=DB.periods[p]||'',scale=sp.cols.map(function(k){return k.l+' /'+num(k.max);}).join(' + ')+' + Comport. /'+num(sp.comp)+' = '+num(sp.total);
  var m=meta('Relevé de notes · '+A.cycleLabel(p),'Classe '+c.name+' · '+pl(list.length,'élève')+' · APS : '+sp.apsL+(act?' ('+act+')':'')+' · barème '+sp.lv+(sp.lvKnown?'':' (niveau non reconnu)')+' – Évaluation OP 2007 : '+scale,'Relevé de notes · '+A.cycleName(p)+' · Classe '+c.name);
  var d=newDoc(m),y=titleBlock(d,m),G=list.map(function(s){return A.gradeOf(cid,s.id,p);}),done=G.filter(function(g){return g.total!=null;}),tv=done.map(function(g){return g.total;});
  var avg=tv.length?r2(tv.reduce(function(a,b){return a+b;},0)/tv.length):null,half=sp.total/2;
  y=cards(d,y,[{v:avg==null?'—':num(avg),l:'Moyenne de la classe',s:'sur '+num(sp.total),c:PRI},{v:tv.length?num(Math.max.apply(null,tv)):'—',l:'Note la plus haute',s:tv.length?'note la plus basse : '+num(Math.min.apply(null,tv)):'',c:PG},
    {v:String(tv.filter(function(x){return x>=half;}).length),l:'Notes de '+num(half)+' et plus',s:'sur '+pl(tv.length,'note complète','notes complètes'),c:PG},{v:done.length+' / '+list.length,l:'Notes complètes',s:'saisie : '+sp.cols.map(function(k){return k.l;}).join(', '),c:done.length<list.length?ST.L.c:PG}]);
  y=section(d,y,'Notes du cycle',sp.apsL+' · '+A.cycleLabel(p),30);
  var raw=sp.aps==='athle'&&G.some(function(g){return g.essais&&g.essais.length;}),sub=sp.proc.length>1,pa=[],evt=sp.aps==='athle'?A.evtOf(cid,p):'',man=0;   /* note procédurale (sous-total) ; meilleur essai si des essais sont saisis */
  var head=['N°','Code Massar','Nom et prénom'];sp.cols.forEach(function(k){if(raw&&k.k==='g1')head.push('Meilleur essai');head.push(k.l+' /'+num(k.max));if(sub&&k.k===sp.proc[sp.proc.length-1].k)head.push('Procéd. /'+num(sp.procMax));});head.push('A','M','R','ST','Comport. /'+num(sp.comp),'Note /'+num(sp.total));
  var dsp={},acc={},cp=[];sp.cols.forEach(function(k){acc[k.k]=[];});
  var body=list.map(function(s,i){var g=G[i],st=g.comp.st;if(A.dspInCycle(s,p))dsp[i]=1;var row=[i+1,s.sid||'',C(s.name,{halign:'center',fontStyle:'bold'})];
    sp.cols.forEach(function(k){var v=g.vals[k.k];if(raw&&k.k==='g1'){var ar=g.essais.length?A.athOf(cid,s.id,p):null,ok=ar&&ar.val!=null;row.push(g.essais.length?C(String(ok?A.athFmt(evt,ar.val):g.essais.filter(function(x){return x;}).join(' / ')).replace(/[\u2032\u2019]/g,"'").replace(/\u2033/g,'"'),{textColor:MUTED}):'');   /* ′ ″ absents de la police PDF (WinAnsi) → ' " */}
if(v!=null&&v<=k.max)acc[k.k].push(v);var star=raw&&k.k==='g1'&&g.essais.length&&!g.prodAuto&&v!=null;if(star)man++;   /* note Produit tapée à la main malgré des essais */
      row.push(v==null?C('—',{textColor:[190,196,206]}):C(num(v)+(star?' *':''),{fontStyle:'bold',textColor:v>k.max?ST.A.c:INK}));
      if(sub&&k.k===sp.proc[sp.proc.length-1].k){if(g.proc!=null)pa.push(g.proc);row.push(g.proc==null?C('—',{textColor:MUTED}):C(num(g.proc),{fontStyle:'bold',textColor:PRI}));}});
    cp.push(g.comp.v);row.push(zero(st.U,ST.A.c),zero(st.M,ST.M.c),zero(st.L,ST.L.c),zero(st.S,ST.S.c),C(num(g.comp.v),{fontStyle:'bold',textColor:g.comp.v<g.comp.max?[184,110,0]:INK}));
    row.push(g.total==null?C('—',{textColor:MUTED}):C(num(g.total),{fontStyle:'bold',textColor:g.total<half?ST.A.c:PRI}));return row;});
  function av(a){return a.length?num(r2(a.reduce(function(x,y){return x+y;},0)/a.length)):'—';}
  var foot=['','',C('Moyenne de la classe',{halign:'left'})];sp.cols.forEach(function(k){if(raw&&k.k==='g1')foot.push('');foot.push(av(acc[k.k]));if(sub&&k.k===sp.proc[sp.proc.length-1].k)foot.push(av(pa));});foot.push('','','','',av(cp),avg==null?'—':num(avg));
  var cols={0:{cellWidth:7},1:{cellWidth:22,fontSize:6.6},2:{cellWidth:raw?40:44}};
  y=table(d,y,head,body,{fs:7.4,foot:foot,cols:cols,cell:function(h){if(h.section==='body'&&dsp[h.row.index]){h.cell.styles.fillColor=DSP_F;}}});
  var P=DB.settings.points;
  y=note(d,y,'Comport. (note comportementale /'+num(sp.comp)+') = '+num(sp.comp)+' – points retirés du cycle (au plus '+num(sp.comp)+') ; points retirés = A × '+num(P.A)+' + AJ × '+num(P.J)+' + M × '+num(P.M)+' + MJ × '+num(P.K)+' + R × '+num(P.L)+' + ST × '+num(P.S)+'. A = absence non justifiée, M = maladie non justifiée, R = retard, ST = sans tenue.');
  if(raw||evt)y=note(d,y,'Produit (athlétisme) : barème OP 2007 '+sp.lv+(evt?' – '+A.athEvtL(evt):'')+' (garçons / filles) appliqué au meilleur essai ; une performance comprise entre deux paliers prend la note du palier supérieur ; moins bien que le palier 1 : note du palier 1 si l’écart ne dépasse pas celui des paliers 1 et 2, sinon 0 ; palier 20 atteint ou dépassé : note maximale. Performance (comportement moteur) : note saisie par le professeur.'+(man?' * = note Produit saisie à la main (remplace la note du barème).':''));
  y=note(d,y,(sub?'Note procédurale /'+num(sp.procMax)+' = '+sp.proc.map(function(k){return k.t.toLowerCase();}).join(' + ')+'. ':'')+'Note /'+num(sp.total)+' = '+sp.cols.map(function(k){return k.t.toLowerCase();}).join(' + ')+' + note comportementale ; « — » = note incomplète.'+(Object.keys(dsp).length?' Lignes grisées : élèves dispensés.':''));
  return {doc:d,meta:m,name:'Releve-notes_'+A.slug(A.cycleName(p))+'_'+A.slug(c.name)+'_'+A.todayStr()+'.pdf'};}
var REP={cycle:repCycle,year:repYear,all:repAll,students:repStudents,records:repRecords,student:repStudent,groups:repGroups,tests:repTests,grades:repGrades};
window.CJPDF={
  make:function(kind,o){var f=REP[kind];if(!f)return Promise.reject(new Error('type inconnu'));
    HAS_AR=AR.test(JSON.stringify(A.db().students))||AR.test(JSON.stringify(A.db().classes))||AR.test(String(A.db().settings.teacher||''))||AR.test(JSON.stringify(A.db().periods));
    try{if(!BIDI&&window.bidi_js)BIDI=window.bidi_js();}catch(e){BIDI=null;}
    return Promise.all([loadLogo(),HAS_AR?loadFonts(A.db().settings.arFont).catch(function(){HAS_AR=false;}):null]).then(function(){
      var r=f(o||{});return {blob:finish(r.doc,r.meta),name:r.name};});},
  _test:{ST:ST}
};
})();
