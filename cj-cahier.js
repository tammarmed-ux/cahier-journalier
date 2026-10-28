/* TATABO3 1.29.2 (v) — « Mon Cahier Journalier » : PDF A4 complet généré sur l’appareil (module chargé seulement au toucher du bouton, Paramètres › Données).
   Pages : couverture · S.M. le Roi · informations · tableau de service · vacances · répartition cyclique · trombinoscope (1 page / classe)
           · puis par classe (ordre par niveau) : titre · tests anthropométriques · groupes · registres C1…C6 (séances + notes de l’app) · dos.
   LECTURE SEULE : données lues par window.CJR (mêmes fonctions que l’app : colsOf, rec, gradeSpec/gradeOf, photoAll…), profil par college.js (pfGet).
   Rien n’est écrit : ni données, ni schéma, ni clé de stockage, ni synchro, ni export existant, ni import Massar.
   Rendu : chaque page HTML (même maquette que l’aperçu validé « Ok Cahier ») est dessinée dans un canvas (SVG foreignObject, polices et images incluses),
   compressée en JPEG puis ajoutée au PDF (jsPDF déjà fourni, vendor/) une page à la fois (mémoire limitée sur iPhone) ; progression « page X/Y ».
   Fichiers chargés à la demande (mis en cache hors ligne par sw.js) : cahier/ (logo, portrait, illustration, couverture, Poppins) + vendor/Cairo, NotoNaskhArabic. */
(function(){'use strict';
if(window.CJCahier)return;
const DIR='cahier/',PAGE_W=793.7,PAGE_H=1122.5;
const SPL=(function(){
// Générateur d'éclaboussures / pinceaux (vectoriel, graine fixe) — même style que la couverture v3
function rng(seed){let s=seed%2147483647;if(s<=0)s+=2147483646;return()=>(s=s*16807%2147483647)/2147483647;}
const f=v=>v.toFixed(2);
const FLAT=(c,op)=>{op=op==null?1:+op;if(op>=1)return c;const h=String(c).replace('#','');if(h.length!==6)return c;const v=[0,2,4].map(i=>Math.round(parseInt(h.substr(i,2),16)*op+255*(1-op)));return '#'+v.map(x=>x.toString(16).padStart(2,'0')).join('');};

function smooth(p){const n=p.length;let d=`M${f(p[0][0])} ${f(p[0][1])}`;for(let i=0;i<n;i++){const p0=p[(i-1+n)%n],p1=p[i],p2=p[(i+1)%n],p3=p[(i+2)%n];
 d+=`C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;}return d+'Z';}
function mk(seed){const R=rng(seed);
 const blob=(cx,cy,r,col,op=1,spikes=6)=>{const n=44,sp=new Set();while(sp.size<spikes)sp.add(Math.floor(R()*n));const ph=[R()*6.3,R()*6.3,R()*6.3],p=[];
  for(let i=0;i<n;i++){const a=2*Math.PI*i/n;let rr=r*(0.9+0.08*Math.sin(3*a+ph[0])+0.06*Math.sin(7*a+ph[1])+0.05*Math.sin(13*a+ph[2])+0.06*(R()-.5));if(sp.has(i))rr*=1.12+0.22*R();p.push([cx+rr*Math.cos(a),cy+rr*Math.sin(a)]);}
  return `<path d="${smooth(p)}" fill="${FLAT(col,op)}"/>`;};
 const drops=(cx,cy,rmin,rmax,amin,amax,k,col,smax=1.6,op=1)=>{let o='';for(let i=0;i<k;i++){const a=amin+R()*(amax-amin),d=rmin+R()*(rmax-rmin),s=smax*(0.25+0.75*R())*(1-0.6*(d-rmin)/(rmax-rmin+1e-9)),x=cx+d*Math.cos(a),y=cy+d*Math.sin(a);
  o+=R()<.3?`<ellipse cx="${f(x)}" cy="${f(y)}" rx="${f(s*2.2)}" ry="${f(s*.7)}" transform="rotate(${f(a*180/Math.PI)} ${f(x)} ${f(y)})" fill="${FLAT(col,op)}"/>`:`<circle cx="${f(x)}" cy="${f(y)}" r="${f(s)}" fill="${FLAT(col,op)}"/>`;}return o;};
 const streak=(x0,y0,ang,len,w,col,op=1)=>{const a=ang*Math.PI/180,ux=Math.cos(a),uy=Math.sin(a),nx=-uy,ny=ux,N=24,t1=[],b1=[];
  for(let i=0;i<=N;i++){const t=i/N,ww=w*Math.pow(1-t,.8)*(0.85+0.3*R())*Math.min(1,t*8+.3),x=x0+ux*len*t,y=y0+uy*len*t;t1.push([x+nx*ww/2,y+ny*ww/2]);b1.push([x-nx*ww/2,y-ny*ww/2]);}
  return `<path d="M${t1.concat(b1.reverse()).map(p=>f(p[0])+' '+f(p[1])).join('L')}Z" fill="${FLAT(col,op)}"/>`;};
 const halftone=(cx,cy,rad,step,col,op,maxr=.55,clip)=>{let o='';for(let i=-40;i<=40;i++)for(let j=-40;j<=40;j++){const x=cx+i*step+(j%2?step/2:0),y=cy+j*step*.87;if(clip&&!clip(x,y))continue;const d=Math.hypot(x-cx,y-cy);if(d>rad)continue;const r=maxr*Math.pow(1-d/rad,1.2);if(r>.08)o+=`<circle cx="${f(x)}" cy="${f(y)}" r="${f(r)}"/>`;}return `<g fill="${FLAT(col,op)}">${o}</g>`;};
 const brush=(x0,x1,yc,h,tilt,col,N=90)=>{const t1=[],b1=[];for(let i=0;i<=N;i++){const t=i/N,x=x0+(x1-x0)*t,tp=Math.min(1,t*7,(1-t)*4),hh=h*(0.5+0.5*tp),y=yc+tilt*(t-.5);
  t1.push([x+(R()-.5)*1.0,y-hh/2+(R()-.5)*(i%3?0.6:1.7)]);b1.push([x+(R()-.5)*1.0,y+hh/2+(R()-.5)*(i%4?0.6:2.0)]);}
  return `<path d="M${t1.concat(b1.reverse()).map(p=>f(p[0])+' '+f(p[1])).join('L')}Z" fill="${col}"/>`;};
 const bristles=(x0,y,n,col,dir=1,spread=16)=>{let o='';for(let k=0;k<n;k++){const yy=y+(R()-.5)*spread,xs=x0+dir*R()*10,xe=xs+dir*(10+R()*24);o+=`<path d="M${f(xs)} ${f(yy)}L${f(xe)} ${f(yy+(R()-.5))}" stroke="${col}" stroke-width="${f(.3+R()*.8)}" stroke-linecap="round"/>`;}return o;};
 return {blob,drops,streak,halftone,brush,bristles,R};}
const NV='#0A3768',NV2='#082B53',MB='#1F5FA8',OR='#E85D04';
// grand coin (couverture/titre de classe/dos), repère coin haut-gauche
function bigCorner(seed,scale=1){const S=mk(seed);let g='';
 g+=S.halftone(0,0,70,2.4,MB,.55,.55,(x,y)=>y<58-0.75*x&&x<80&&x>=0&&y>=0);
 g+=S.blob(26,-2,34,MB,.5,7);g+=S.streak(-4,40,-33,92,9,OR);g+=S.streak(-2,48,-30,60,3.2,OR,.9);
 g+=S.blob(-4,-8,44,NV,1,8);g+=S.blob(34,-6,17,NV,1,5);g+=S.blob(0,-2,28,NV2,1,5);
 g+=S.streak(10,26,-28,62,7,NV);g+=S.streak(30,6,-12,44,4,MB);g+=S.blob(52,9,4.2,OR,1,5);
 g+=S.drops(0,0,36,72,0.05,1.45,46,NV,1.3);g+=S.drops(30,24,8,34,-0.6,1.2,22,OR,1.1);
 return scale===1?g:`<g transform="scale(${scale})">${g}</g>`;}
function lightCorner(seed){const S=mk(seed);let g='';
 g+=S.halftone(0,0,48,2.4,MB,.35,.5,(x,y)=>x>=0&&y>=0);g+=S.blob(-6,-5,22,MB,.35,6);
 g+=S.streak(-2,10,14,34,3.8,OR,.9);g+=S.blob(-4,-2,15,NV,.85,5);
 g+=S.drops(0,0,14,46,0.05,1.5,26,NV,1.0,.7);g+=S.drops(10,17,4,22,-0.2,1.4,12,OR,.9,.85);return g;}
// petit coin pour en-tête des pages intérieures
function smallCorner(seed){const S=mk(seed);let g='';
 g+=S.halftone(0,0,40,2.2,MB,.45,.45,(x,y)=>x>=0&&y>=0&&y<30);
 g+=S.blob(10,-6,20,MB,.45,6);g+=S.streak(-2,20,-22,46,4.5,OR);g+=S.blob(-3,-6,22,NV,1,6);g+=S.blob(-2,-2,13,NV2,1,4);
 g+=S.streak(4,13,-16,34,4,NV);g+=S.drops(0,0,20,40,0.1,1.4,26,NV,1);g+=S.drops(20,12,4,18,-0.4,1.2,10,OR,.9);return g;}
function brushSVG(seed,w=200,h=40,navy=NV,orange=OR){const S=mk(seed);
 const o=S.brush(w*.06,w*.995,h*.56,h*.66,-h*.06,orange)+S.bristles(w*.94,h*.56,6,orange,-1,h*.4);
 const n=S.brush(w*.005,w*.955,h*.44,h*.74,-h*.05,navy)+S.bristles(w*.01,h*.44,8,navy,1,h*.5);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${o}${n}</svg>`;}
return {mk,bigCorner,lightCorner,smallCorner,brushSVG,NV,NV2,MB,OR};

})();
const FLATTEN=(function(){
// Aplatissement : supprime toute transparence (alpha, fusion, ombres floues, filtres) — couleurs précalculées sur fond blanc.
const hx=c=>{c=c.replace('#','');if(c.length===3)c=c.split('').map(x=>x+x).join('');return [0,2,4].map(i=>parseInt(c.substr(i,2),16));};
const blendHex=(c,a)=>{const v=hx(c);return '#'+v.map(x=>Math.round(x*a+255*(1-a)).toString(16).padStart(2,'0')).join('');};
function flat(h){
 h=h.replace(/<([a-zA-Z]+)(\s[^<>]*?)(\/?)>/g,(m,tag,at,sl)=>{const o=at.match(/\s(?:fill-)?opacity="([\d.]+)"/);if(!o)return m;const a=+o[1];
   at=at.replace(/\s(?:fill-|stroke-)?opacity="[\d.]+"/g,'');if(a<1)at=at.replace(/\s(fill|stroke)="(#[0-9a-fA-F]{3,6})"/g,(q,k,c)=>` ${k}="${blendHex(c,a)}"`);return `<${tag}${at}${sl}>`;});
 h=h.replace(/text-shadow:[^;}"]*/g,'text-shadow:none');
 h=h.replace(/box-shadow:([^;}"]*)/g,(m,v)=>{const parts=v.split(/,(?![^(]*\))/).filter(x=>!/rgba|hsla/.test(x)&&!/^\s*-?[\d.]+\w*\s+-?[\d.]+\w*\s+[1-9][\d.]*\w*/.test(x.replace(/^\s*inset\s*/,'')));return 'box-shadow:'+(parts.length?parts.join(','):'none');});
 h=h.replace(/rgba\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*\)/g,(m,r,g,b,a)=>'#'+[r,g,b].map(v=>Math.round(+v*+a+255*(1-+a)).toString(16).padStart(2,'0')).join(''));
 h=h.replace(/(color-mix\(in srgb,\s*var\(--[\w-]+\)\s*[\d.]+%)\s*,\s*transparent\)/g,'$1,#fff)');
 h=h.replace(/mix-blend-mode:\s*[\w-]+;?/g,'').replace(/([;{\s"])opacity:\s*[\d.]+;?/g,'$1').replace(/filter:[^;}"]*;?/g,'');
 return h;}
return flat;

})();
/* classLevelSort — tri des classes par niveau (réutilisable tel quel dans cj-cahier.js).
   Collège : 1A (1AC, 1APIC…) < 2A < 3A ; lycée : TC < 1BAC < 2BAC ; puis filière (lettres), puis numéro (ordre naturel).
   Accepte des chaînes ou des objets {name}. Ne modifie pas le tableau reçu. */
/* Filières équivalentes pour le tri seulement (les noms affichés ne changent pas) : SH = LSH (Lettres & sciences humaines). */
var FIL_ALIAS={SH:'LSH'};
function classKey(name){var s=String(name||'').toUpperCase().replace(/[\s_\-.]/g,''),lv=99,rest=s,m;
  if((m=s.match(/^TC(.*)$/)))      {lv=10;rest=m[1];}
  else if((m=s.match(/^([12])BAC(.*)$/))){lv=10+(+m[1]);rest=m[2];}
  else if((m=s.match(/^([123])A(?:PIC|C)?(.*)$/))){lv=+m[1];rest=m[2];}
  var num=(rest.match(/(\d+)\s*$/)||[])[1],fil=rest.replace(/\d+\s*$/,'');fil=FIL_ALIAS[fil]||fil;
  return {lv:lv,fil:fil,num:num==null?-1:+num,raw:s};}
function classLevelSort(list){var nm=function(c){return typeof c==='string'?c:(c&&c.name)||'';};
  return list.slice().sort(function(a,b){var x=classKey(nm(a)),y=classKey(nm(b));
    return x.lv-y.lv||(x.fil<y.fil?-1:x.fil>y.fil?1:0)||x.num-y.num||x.raw.localeCompare(y.raw,'fr',{numeric:true});});}

function R3(D,GR,PH,LOGO,KING,FONTCSS){
let PHOTOS=PH||{};const okPh=d=>typeof d==='string'&&/^data:image\/(jpeg|webp|png);base64,/.test(d);
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const dmy=d=>d?d.slice(8,10)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'';
const dm=d=>d?d.slice(8,10)+'/'+d.slice(5,7):'';
const CYC=['#2563EB','#E8590C','#0CA678','#7048E8','#D6336C','#1098AD'];
const DAYS=['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
const CODE={P:'',A:'A',J:'AJ',M:'M',K:'MJ',L:'R',S:'ST','':'','#':''};
function pfParse(t){const p=String(t||'').split(/\s+[–—-]\s+/);let w=(p[0]||'').trim(),c='M.';const m=/^(Mme\.?|Mlle\.?|M\.|E\.|Pr\.?)\s+/i.exec(w);if(m){if(/^(mme|mlle)\.?$/i.test(m[1]))c='Mme';w=w.slice(m[0].length);}const x=w.split(/\s+/).filter(Boolean);return {civ:c,nom:x[0]||'',pre:x.slice(1).join(' '),etab:p.slice(1).join(' - ')};}
const PF=Object.assign(pfParse(D.teacher),D.profile||{});const CIV=/^E\.\s/.test(D.teacher||'')?'E.':(PF.civ==='Mme'?'Mme':'M.');let CUR='';
const TNAME=[PF.nom,PF.pre].filter(Boolean).join(' ');
const Y0=(D.year[0]||'').slice(0,4),YEAR=Y0+'–'+(+Y0+1);
const NSTU=D.classes.reduce((a,c)=>a+c.students.length,0);
const pic=n=>D.pictos[n]||'';
const ini=n=>{const w=String(n).trim().split(/\s+/);return (w[0]||'').slice(0,1)+(w[1]||'').slice(0,1);};
const age=d=>{if(!d)return '';const a=new Date(D.year[0]),b=new Date(d);let y=a.getFullYear()-b.getFullYear();if(a<new Date(a.getFullYear(),b.getMonth(),b.getDate()))y--;return y;};
const ph=(s,k)=>s.phys&&s.phys[k]!=null?String(s.phys[k]).replace('.',','):'';
const miss=t=>'<span class="miss">'+esc(t)+'</span>';
const BRUSH='data:image/svg+xml;utf8,'+encodeURIComponent(SPL.brushSVG(5));
const BRUSH2='data:image/svg+xml;utf8,'+encodeURIComponent(SPL.brushSVG(9,200,40));
const HL=SPL.smallCorner(11),HR=SPL.smallCorner(23);
const THEMES={
 V:{name:'v3 — bleu et orange',font:"'Poppins','Cairo'",css:`
  :root,.cjk-root{--p:#0A3768;--p2:#1F5FA8;--a:#E85D04;--g:#E85D04;--soft:#EEF3FA;--line:#D7DFEA;--ink:#1C2430}
  .hsp{position:absolute;top:0;width:60mm;height:32mm;z-index:1}.hsp.l{left:0;width:30mm;height:16mm;opacity:.9}.hsp.r{right:0;transform:scaleX(-1)}
  .hd{height:31mm;padding:7.5mm 12mm 0 14mm;overflow:visible;z-index:2}
  .hd h1{display:inline-block;font:900 italic 16.5pt/1.1 'Poppins','Cairo';color:#fff;padding:2.3mm 11mm 3.3mm 8mm;background:url("${BRUSH}") 0 0/100% 100% no-repeat;letter-spacing:.1pt;text-shadow:0 .5mm 0 rgba(8,43,83,.5);margin-left:-2mm}
  .hd p{margin:1.6mm 0 0 6mm;font:600 9pt 'Poppins','Cairo';color:#0A3768;opacity:1}
  .hd .pi{right:12mm;top:5.5mm;width:17mm;height:17mm;background:#E85D04;box-shadow:0 0 0 1.2mm #fff,0 1mm 2mm rgba(0,0,0,.25)}
  .hd .pi svg{width:11mm;height:11mm}
  .bd{padding:4mm 12mm 0;position:relative;z-index:2}
  .ft{left:12mm;right:12mm;bottom:5.5mm;border-top:.5mm solid #0A3768;align-items:center;color:#4b5563;font-family:'Poppins','Cairo';font-size:7.2pt}
  .ft:before{content:"";position:absolute;left:0;top:-.5mm;width:22mm;height:.5mm;background:#E85D04}
  .ft .fc{font-weight:800;color:#E85D04;letter-spacing:.06em}.ft b{color:#0A3768;letter-spacing:.08em}
  .sec-h{color:var(--p);border-left:2mm solid var(--a)}
  table.t th{background:#0A3768;color:#fff}
  table.t thead tr th:first-child{border-top-left-radius:1.5mm}table.t thead tr th:last-child{border-top-right-radius:1.5mm}
  .chip{background:var(--soft);color:var(--p);border:.3mm solid #C9D6EA}
  .card{border-radius:3mm;border-color:#D7DFEA;box-shadow:0 .7mm 0 #E85D04}
  .stats b{color:#0A3768}
  .kv div:nth-child(odd){background:#EEF3FA;color:#0A3768}
  table.rg2{table-layout:fixed;font-size:7.6pt}table.rg2 th{font-size:6.8pt;padding:.8mm .3mm;white-space:nowrap}table.rg2 th small{font-weight:500;font-size:6pt}
  table.rg2 th.n{width:6mm}table.rg2 th.nmh{width:34mm}table.rg2 th.g{width:9.5mm}table.rg2 th.h{background:#A07830!important}
  table.rg2 td{height:4.6mm;padding:0 .3mm;font-weight:700}table.rg2 td.nm{max-width:34mm;font-size:8pt}table.rg2 td.n{color:#667085;font-weight:600}
  table.rg2 td.pp{font-weight:500}table.rg2 td.k{font-weight:800}table.rg2 td.e{background:#FCFCFD}
  table.rg2 td.gn{font-weight:800;background:#F5F8FC}table.rg2 td.gv{font-weight:700}
  table.rg2 td.h{background:repeating-linear-gradient(135deg,#FBF5E6 0 1.1mm,#EFDDB5 1.1mm 1.5mm)!important;border-left:.3mm solid #E2CC9E;border-right:.3mm solid #E2CC9E;vertical-align:middle}table.rg2 td.h .hv{writing-mode:sideways-lr;font-size:7.6pt;font-weight:800;color:#855E14;white-space:nowrap;background:#FBF5E6;padding:1.5mm .4mm}
  @supports not (writing-mode:sideways-lr){table.rg2 td.h .hv{writing-mode:vertical-rl;transform:rotate(180deg)}}
  table.rg2 tr.dsp td.nm{background:#ECEEF2;color:#5A6372}
  .leg2{display:flex;flex-wrap:wrap;gap:1.2mm 3.2mm;margin-top:2mm;font-size:6.6pt;color:#1C2430;align-items:center}.leg2 .lt{font-weight:800}.leg2 i{display:inline-block;min-width:5mm;height:3.4mm;line-height:3.4mm;text-align:center;font-style:normal;font-weight:800;border:.25mm solid #D7DFEA;border-radius:.8mm;margin-right:1mm;vertical-align:middle}.leg2 i.hz{background:repeating-linear-gradient(135deg,#FBF5E6 0 .8mm,#EFDDB5 .8mm 1.1mm)}
  .cnote{font-size:6.3pt;color:#667085;line-height:1.35;margin-top:1.4mm}.cnote .se{float:right;font-weight:800;color:#0A3768;font-size:7pt;margin-left:3mm}
  .pg .visa{margin-top:2mm}.pg .visa div{height:13mm}
  .tb .av.ph{background:#E6ECF4;overflow:hidden;padding:0}.tb .av.ph img,.tph img{width:100%;height:100%;object-fit:cover;border-radius:50%;display:block}
  .tph{width:30mm;height:30mm;border-radius:50%;margin:0 auto 2mm;background:#EAF1FA;display:grid;place-items:center;overflow:hidden;border:.6mm solid #0A3768}.tph.ic svg{width:17mm;height:17mm;color:#0A3768}
  table.tt th{background:#0A3768;color:#fff}
  .pg table.tt td.k{font-weight:800;font-size:8.6pt;letter-spacing:.02em;padding-left:1mm;padding-right:.6mm;overflow:hidden}
  .cleg{margin-top:4mm}.clt{font:800 9pt 'Poppins';color:#0A3768;margin-bottom:2mm;border-left:1.2mm solid #E85D04;padding-left:2mm}.clg{display:grid;grid-template-columns:repeat(5,1fr);gap:1.8mm}.clg span{border-radius:1.6mm;padding:1.2mm 1.1mm 1.2mm 1.6mm;border:.4mm solid transparent;overflow:hidden;font:500 7.6pt 'Poppins';white-space:nowrap}.clg b{font-weight:800}
  .pg table.tt td{height:9.5mm}.pg table.tt td.h{font-size:7.2pt;white-space:nowrap;color:#0A3768}.pg table.tt td.c small.du{display:block;font-size:6.5pt;font-weight:600;opacity:.9;margin-top:.8mm}
  .pg table.tt tr.pz td{height:5.5mm}.pg table.tt td.pz{background:repeating-linear-gradient(135deg,#FFF1E6 0 2mm,#fff 2mm 4mm);color:#E85D04;font-size:7.5pt;font-weight:700;letter-spacing:.06em}
  .pg table.tt tr.tot td{height:7mm}.pg table.tt td.tt2{background:#EAF1FA;color:#0A3768;font-size:8.5pt}
  .tb{grid-template-columns:repeat(6,1fr);gap:2.4mm}.tb .s{height:30.5mm;display:flex;flex-direction:column;align-items:center;border-color:#D7DFEA;border-radius:2.5mm;border-bottom:.8mm solid #E85D04}
  .pg .tb .id{margin-top:auto;padding-top:1.8mm;font-size:6.3pt;color:#8A94A6;letter-spacing:.02em;font-family:'Poppins'}
  .tb .av{flex:none;width:15mm;height:15mm;font-size:13pt;font-family:'Cairo','NaskhAr'}
  .pg .tb .nm{font-size:7.8pt;font-family:'Cairo','Poppins';white-space:normal;height:auto;max-height:6.8mm;width:100%;line-height:1.1;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;text-overflow:clip}
  table.t td.nm{font-family:'Cairo','Poppins'}
  .note{background:#EEF3FA;border-left:1.6mm solid #E85D04}
  .leg b{border-color:#C9D6EA}
  .visa div{color:#0A3768;border-color:#C9D6EA}
  /* titre de classe */
  .clsV{background:#fff}
  .clsV .dec{position:absolute;inset:0;width:210mm;height:297mm}
  .clsV .lg{position:absolute;left:50%;top:12mm;width:30mm;margin-left:-15mm}.clsV .lg img{width:100%;display:block;mix-blend-mode:multiply}
  .clsV .big{position:absolute;left:0;right:0;top:76mm;text-align:center}
  .clsV .big .k{font:900 italic 17pt 'Poppins';letter-spacing:.3em;color:#0A3768;padding-left:.3em}
  .clsV .big .bw{display:inline-block;margin-top:3mm;padding:5mm 16mm 7mm 13mm;background:url("${BRUSH2}") 0 0/100% 100% no-repeat}
  .clsV .big h1{margin:0;font:900 italic 54pt/1 'Poppins';color:#fff;text-shadow:0 .8mm 0 rgba(8,43,83,.5)}
  .clsV .big .lv{display:inline-block;margin-top:5mm;background:#E85D04;color:#fff;font:700 13pt 'Poppins';padding:1.4mm 8mm;border-radius:10mm;box-shadow:0 1mm 0 #C24E03}
  .clsV .facts{position:absolute;left:30mm;right:30mm;top:156mm;display:grid;grid-template-columns:repeat(3,1fr);gap:5mm}
  .clsV .facts div{border:.5mm solid #0A3768;border-radius:4mm;text-align:center;padding:3.5mm 2mm;font:600 9.5pt 'Poppins';color:#667085;box-shadow:0 1mm 0 #E85D04;background:#fff}
  .clsV .facts b{display:block;font:800 24pt/1.05 'Poppins';color:#0A3768}
  .clsV .cyh{position:absolute;left:18mm;right:18mm;top:192mm;font:800 11pt 'Poppins';color:#0A3768;text-align:center;letter-spacing:.12em}
  .clsV .cy{position:absolute;left:18mm;right:18mm;top:200mm;display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}
  .clsV .cy div{background:#fff;border:.35mm solid #D7DFEA;border-radius:3mm;padding:2.6mm;display:flex;gap:2mm;align-items:center;font:700 8.4pt 'Poppins';color:#1C2430;border-left:2mm solid var(--c)}
  .clsV .cy svg{width:9mm;height:9mm;color:var(--c);flex:none}
  .clsV .cy small{display:block;font-weight:500;color:#667085;font-size:7pt}
  .clsV .foot,.backV .foot{position:absolute;left:0;right:0;bottom:0;height:9mm;background:#0A3768;display:flex;align-items:center;justify-content:center;gap:3mm;color:#fff;font:600 7.4pt 'Poppins';letter-spacing:.16em}
  .clsV .foot i,.backV .foot i{display:inline-block;width:10mm;height:.6mm;background:#E85D04}
  /* roi */
  .kingV{display:flex;align-items:center;justify-content:center}
  .kingV:before{content:"";position:absolute;inset:8mm;border:.6mm solid #0A3768;border-radius:2mm}
  .kingV:after{content:"";position:absolute;inset:10mm;border:.3mm solid #C9A44C;border-radius:1.4mm}
  .kingV .kframe{width:176mm;padding:2.6mm;border:.6mm solid #C9A44C;background:#fff;position:relative;z-index:2;box-shadow:0 0 0 1mm #fff,0 0 0 1.3mm #E3CF91}
  .kingV .kframe img{display:block;width:100%}
  /* dos */
  .backV{background:#fff}
  .backV .dec{position:absolute;inset:0;width:210mm;height:297mm}
  .backV .lg{position:absolute;left:50%;top:70mm;width:56mm;margin-left:-28mm}.backV .lg img{width:100%;display:block;mix-blend-mode:multiply}
  .backV .q{position:absolute;left:15mm;right:15mm;top:140mm;text-align:center}
  .backV .q .bw{display:inline-block;padding:4mm 14mm 6mm 12mm;background:url("${BRUSH}") 0 0/100% 100% no-repeat}
  .backV .q .ar{font:700 22pt 'Cairo','NaskhAr';color:#fff;direction:rtl}
  .backV .q .fr{font:800 italic 15pt 'Poppins';color:#0A3768;margin-top:4mm}
  .backV .sm{position:absolute;left:0;right:0;top:196mm;text-align:center;font:600 10pt/1.6 'Poppins';color:#1C2430}
  .backV .sm b{font:800 17pt 'Poppins';color:#0A3768;display:block}
  .backV .sm .t{display:inline-block;margin-top:3mm;font:700 9pt 'Poppins';color:#fff;background:#E85D04;border-radius:10mm;padding:1mm 6mm}
 `},
};
function baseCss(T){return `
${FONTCSS}
@page{size:A4;margin:0}*{box-sizing:border-box}
html,body{margin:0;padding:0;background:#888}
body,.cjk-root{font-family:${T.font},'NaskhAr',sans-serif;color:var(--ink);-webkit-print-color-adjust:exact;print-color-adjust:exact}
.pg{width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff;page-break-after:always;break-after:page;margin:0 auto}
.hd{position:relative;height:30mm;padding:6mm 12mm 0 12mm;overflow:hidden}
.hd .pi{position:absolute;right:12mm;top:5mm;width:19mm;height:19mm;border-radius:50%;background:rgba(255,255,255,.16);display:grid;place-items:center;z-index:2}
.hd .pi svg{width:13mm;height:13mm;color:#fff}
.hd h1{margin:0;font-size:20pt;font-weight:900;letter-spacing:.2pt;line-height:1.15;position:relative;z-index:2}
.hd p{margin:1mm 0 0;font-size:9.5pt;opacity:.9;position:relative;z-index:2}
.bd{padding:5mm 12mm 0}
.ft{position:absolute;left:12mm;right:12mm;bottom:6mm;display:flex;justify-content:space-between;font-size:7.5pt;color:#6b7280;border-top:.3mm solid var(--line);padding-top:1.6mm}
.act-pi{display:block;fill:currentColor}.act-pi .b,.act-pi .g{fill:none;stroke:currentColor;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.4}.act-pi .b{stroke-width:2.3}
.ar{font-family:'NaskhAr',${T.font},sans-serif}
.miss{color:#9aa1ad;font-style:italic;font-weight:400}
.sec-h{font-size:12.5pt;font-weight:800;margin:0 0 3mm;padding:0 0 0 3mm}
.card{border:.35mm solid var(--line);border-radius:2.5mm;padding:4mm;background:#fff}
.chip{display:inline-block;padding:.6mm 2.6mm;border-radius:10mm;font-size:8.5pt;font-weight:700}
table.t{width:100%;border-collapse:collapse;font-size:8pt}
table.t th{font-weight:700;padding:1mm .8mm;font-size:7.3pt;line-height:1.1;border:.25mm solid rgba(0,0,0,.08)}
table.t td{border:.25mm solid var(--line);padding:0 1mm;height:4.85mm;line-height:1;text-align:center}
table.t tr:nth-child(even) td{background:#fafbfc}
table.t td.nm{text-align:right;font-weight:700;white-space:nowrap;overflow:hidden;max-width:46mm;font-size:8.2pt;line-height:1;padding-top:0;padding-bottom:0}
/* couverture */
.cover .logo{position:absolute;left:50%;top:16mm;width:62mm;margin-left:-31mm;background:#fff;border-radius:4mm;padding:3mm;box-shadow:0 1.5mm 5mm rgba(0,0,0,.25);z-index:3}
.cover .logo img{width:100%;display:block}
.ttl{position:absolute;left:0;right:0;top:100mm;text-align:center;z-index:3}
.ttl .k{font-size:13pt;font-weight:800;letter-spacing:3pt;text-transform:uppercase}
.ttl h1{font-size:46pt;font-weight:900;margin:1mm 0 0;line-height:1.02;text-shadow:0 1mm 3mm rgba(0,0,0,.25)}
.ttl .y{display:inline-block;margin-top:4mm;font-size:13pt;font-weight:800;padding:1.2mm 6mm;border:.5mm solid rgba(255,255,255,.7);border-radius:10mm}
.ttl .ar{font-size:15pt;margin-top:2mm;opacity:.95}
.pics{position:absolute;left:0;right:0;display:flex;justify-content:center;gap:5mm;z-index:3}
.pics span{width:15mm;height:15mm;border-radius:50%;background:rgba(255,255,255,.95);display:grid;place-items:center;box-shadow:0 1mm 3mm rgba(0,0,0,.2)}
.pics svg{width:10.5mm;height:10.5mm}
.who{position:absolute;left:14mm;right:14mm;bottom:14mm;background:rgba(255,255,255,.96);color:var(--ink);border-radius:4mm;padding:5mm 6mm;text-align:center;z-index:3}
.who .n{font-size:21pt;font-weight:900;line-height:1.1;color:var(--p)}
.who .e{font-size:11pt;font-weight:700;margin-top:1mm}
.who .o{font-size:8.5pt;color:#5b6472;margin-top:1.5mm;display:flex;justify-content:center;gap:6mm}
/* roi */
.king{position:absolute;left:30mm;right:30mm;top:34mm;text-align:center}
.king .fr{padding:4mm;background:linear-gradient(135deg,#C9A44C,#F1DC94 40%,#B38728 70%,#E8CF7E);border-radius:2mm;box-shadow:0 2mm 6mm rgba(0,0,0,.25)}
.king .fr img{display:block;width:100%;border:1.2mm solid #fff}
.king .cap{margin-top:8mm;font-size:15pt;font-weight:800;color:var(--p)}
.king .cap .ar{display:block;font-size:19pt;margin-bottom:1mm;color:var(--ink)}
.king .cr{margin-top:3mm;font-size:6.5pt;color:#9aa1ad}
.flag{position:absolute;left:0;right:0;top:0;height:6mm;background:linear-gradient(90deg,#C1272D 0 100%)}
.flag:after{content:"★";position:absolute;left:50%;top:-1.2mm;margin-left:-3mm;color:#006233;font-size:8mm;line-height:1}
.kingpg{display:flex;align-items:center;justify-content:center}.kingpg .kframe{width:150mm;padding:3mm;border:.5mm solid #C9A44C;outline:.25mm solid #C9A44C;outline-offset:1.5mm;background:#fff}.kingpg .kframe img{display:block;width:100%}
/* infos */
.kv{display:grid;grid-template-columns:44mm 1fr;gap:0;font-size:10pt}
.kv div{padding:2.2mm 3mm;border-bottom:.3mm solid var(--line)}.kv div:nth-child(odd){font-weight:700;color:var(--p);background:var(--soft)}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:3mm;margin-top:5mm}
.stats .card{text-align:center}.stats b{display:block;font-size:20pt;color:var(--p);line-height:1.1}.stats small{font-size:8pt;color:#5b6472}
/* service */
table.tt{width:100%;border-collapse:separate;border-spacing:1mm;font-size:8pt;table-layout:fixed}
table.tt th{font-size:8pt;padding:1.5mm 0;border-radius:1.5mm;background:var(--soft);color:var(--p)}
table.tt td{height:11mm;border-radius:1.8mm;text-align:center;vertical-align:middle;background:#f6f7f9;font-weight:800;font-size:8.5pt}
table.tt td.h{background:transparent;color:#5b6472;font-weight:700;font-size:7.5pt}
table.tt td.c{color:#fff}
/* répartition */
.rc{display:grid;grid-template-columns:1fr;gap:3mm}
.rc .row{display:grid;grid-template-columns:20mm 1fr 44mm 26mm;align-items:center;gap:3mm;border:.35mm solid var(--line);border-left:2.2mm solid var(--c);border-radius:2.5mm;padding:3mm}
.rc .ic{width:16mm;height:16mm;border-radius:3mm;display:grid;place-items:center;background:color-mix(in srgb,var(--c) 14%,#fff);color:var(--c)}
.rc .ic svg{width:12mm;height:12mm}
.rc .a{font-size:13pt;font-weight:800}.rc .s{font-size:8pt;color:#5b6472}
.rc .d{font-size:9.5pt;font-weight:700;text-align:center}.rc .w{text-align:center;font-size:9pt}.rc .w b{display:block;font-size:15pt;color:var(--c)}
.tl{display:flex;height:9mm;border-radius:2mm;overflow:hidden;margin:2mm 0 5mm}
.tl i{display:block;height:100%;color:#fff;font:800 8pt/9mm ${T.font};text-align:center;font-style:normal}
.tl i.v{background:repeating-linear-gradient(135deg,#d9dde4 0 1.2mm,#eef0f3 1.2mm 2.4mm)}
/* trombi */
.tb{display:grid;grid-template-columns:repeat(5,1fr);gap:2.2mm}
.tb .s{border:.3mm solid var(--line);border-radius:2mm;text-align:center;padding:1.6mm 1mm 1.2mm;height:28.6mm;position:relative;overflow:hidden}
.tb .av{width:15mm;height:15mm;border-radius:50%;margin:0 auto 1mm;display:grid;place-items:center;font-weight:700;font-size:13pt;color:#fff;font-family:'NaskhAr'}
.tb .nm{font-size:8.6pt;font-weight:700;line-height:1.15;height:5mm;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
.tb .id{font-size:6.8pt;color:#6b7280}
.tb .no{position:absolute;left:1.2mm;top:1mm;font-size:6.5pt;font-weight:800;color:#9aa1ad}
/* titre classe */
.clsT{color:#fff}
.clsT .big{position:absolute;left:0;right:0;top:82mm;text-align:center}
.clsT .big .k{font-size:13pt;letter-spacing:4pt;font-weight:800;opacity:.9}
.clsT .big h1{font-size:64pt;font-weight:900;margin:0;line-height:1}
.clsT .big .lv{display:inline-block;margin-top:3mm;background:#fff;color:var(--p);font-weight:900;padding:1mm 6mm;border-radius:10mm;font-size:13pt}
.clsT .facts{position:absolute;left:18mm;right:18mm;top:150mm;display:grid;grid-template-columns:repeat(3,1fr);gap:4mm}
.clsT .facts div{background:rgba(255,255,255,.14);border:.4mm solid rgba(255,255,255,.35);border-radius:3mm;text-align:center;padding:4mm 2mm}
.clsT .facts b{display:block;font-size:22pt;line-height:1}
.clsT .cy{position:absolute;left:18mm;right:18mm;top:186mm;display:grid;grid-template-columns:repeat(3,1fr);gap:3mm}
.clsT .cy div{background:#fff;color:var(--ink);border-radius:3mm;padding:2.6mm;display:flex;gap:2mm;align-items:center;font-size:8.6pt;font-weight:700;border-left:2mm solid var(--c)}
.clsT .cy svg{width:9mm;height:9mm;color:var(--c);flex:none}
.clsT .cy small{display:block;font-weight:400;color:#5b6472;font-size:7pt}
/* groupes */
.gr{display:grid;grid-template-columns:1fr 1fr;gap:4mm}
.gr .g{border:.4mm solid var(--c);border-radius:3mm;min-height:60mm;padding:0 0 2mm;overflow:hidden}
.gr .g h3{margin:0 0 2mm;background:var(--c);color:#fff;font-size:10.5pt;padding:2mm 3mm}
.gr .g .ln{border-bottom:.3mm dashed var(--line);height:6.2mm;margin:0 3mm}
.note{background:var(--soft);border-radius:2.5mm;padding:3mm 4mm;font-size:9pt;margin-bottom:4mm}
/* registre */
table.rg td.h{background:#EEF0F3!important;vertical-align:middle}table.rg td.h .hv{writing-mode:vertical-rl;transform:rotate(180deg);font-size:8pt;font-weight:700;color:#6b7280;white-space:nowrap}
table.rg th.h{background:#9aa1ad!important}
table.rg td.cA{color:#C92A2A;font-weight:800}table.rg td.cR{color:#E67700;font-weight:800}table.rg td.cM{color:#1971C2;font-weight:800}table.rg td.cS{color:#7048E8;font-weight:800}
table.rg td.p{color:#2B8A3E}
.leg{display:flex;flex-wrap:wrap;gap:2mm 5mm;font-size:7.5pt;margin-top:2.5mm;color:#4b5563}
.leg b{display:inline-block;min-width:6mm;text-align:center;border:.3mm solid var(--line);border-radius:1mm;margin-right:1mm}
.visa{display:grid;grid-template-columns:2fr 1fr 1fr;gap:3mm;margin-top:3mm}.visa div{border:.3mm solid var(--line);border-radius:2mm;height:15mm;padding:1.2mm 2mm;font-size:7.5pt;font-weight:700;color:var(--p)}
table.t.hol td{height:8.6mm;font-size:9pt}table.t.hol td.hn{text-align:left;font-weight:700;padding-left:2.5mm}.ap{font-weight:400;font-size:7pt;color:#E67700;margin-left:1.5mm}
.ty{display:inline-block;padding:.6mm 2.4mm;border-radius:10mm;font-size:8pt;font-weight:800;color:var(--k);background:color-mix(in srgb,var(--k) 13%,#fff);border:.3mm solid color-mix(in srgb,var(--k) 40%,transparent)}
/* dos */
.back .q{position:absolute;left:20mm;right:20mm;top:110mm;text-align:center;z-index:3}
.back .q .ar{font-size:22pt;font-weight:700}
.back .q .fr{font-size:15pt;font-weight:800;margin-top:2mm}
.back .sm{position:absolute;left:0;right:0;bottom:22mm;text-align:center;font-size:9pt;z-index:3;opacity:.95}
.back .lg{position:absolute;left:50%;bottom:44mm;width:34mm;margin-left:-17mm;background:#fff;border-radius:3mm;padding:2mm;z-index:3}.back .lg img{width:100%;display:block}
${T.css}`;}

function frame(T,title,sub,picto,body,pg,extra){return `<section class="pg ${extra||''}"><svg class="hsp l" viewBox="0 0 60 32">${HL}</svg><svg class="hsp r" viewBox="0 0 60 32">${HR}</svg><div class="hd"><h1>${title}</h1><p>${sub||''}</p>${picto?'<div class="pi">'+picto+'</div>':''}</div><div class="bd">${body}</div><div class="ft"><span>Cahier journalier d’EPS · ${esc(CIV)} ${esc(TNAME)} · ${esc(PF.etab||'')} · ${YEAR}</span><span class="fc" style="color:${CUR?cc(CUR)[0]:'#E85D04'}">${CUR?'■ ':''}${esc(CUR)}</span><span><b>TATABO3</b> · p. ${pg}</span></div></section>`;}
function coverBg(k){return k==='A'?'<div class="lanes"></div><div class="stripe"></div>':k==='B'?'<div class="pitch"></div><div class="box1"></div><div class="box2"></div>':'<div class="blob1"></div><div class="blob2"></div>';}
const PIC6=['Course en durée','Basket-Ball','Football','Volleyball','Saut en longueur','Handball'];
function cover(k){const picRow=(top,col)=>`<div class="pics" style="top:${top}mm">${PIC6.map((n,i)=>`<span style="color:${CYC[i]}">${pic(n)}</span>`).join('')}</div>`;
 return `<section class="pg cover">${coverBg(k)}<div class="logo"><img src="${LOGO}" alt=""></div>
 <div class="ttl"><div class="k">Éducation physique et sportive</div><h1>Cahier<br>Journalier</h1><div class="ar">الدفتر اليومي لمادة التربية البدنية والرياضية</div><div class="y">Année scolaire ${YEAR}</div></div>
 ${picRow(k==='A'?196:200)}
 <div class="who"><div class="n">${esc(PF.civ==='Mme'?'Mme':'M.')} ${esc(TNAME)}</div><div class="e">Professeur d’EPS · ${esc(PF.etab||'')}</div><div class="o"><span>AREF : ${PF.aref?esc(PF.aref):miss('à compléter (Mon profil)')}</span><span>Direction provinciale : ${PF.prov?esc(PF.prov):miss('à compléter')}</span></div></div></section>`;}
function king(k){return `<section class="pg kingV"><div class="kframe"><img src="${KING}" alt="صاحب الجلالة الملك محمد السادس نصره الله"></div></section>`;}
function info(k,n){const svc=D.svc||{},h=m=>m?(m/60).toString().replace('.',',')+' h':'—';
 const rows=[['Nom',PF.nom],['Prénom',PF.pre],['Discipline','Éducation physique et sportive'],['Établissement',PF.etab],['Cycle',D.school==='college'?'Secondaire collégial (collège)':'Secondaire qualifiant (lycée)'],['AREF',PF.aref],['Direction provinciale',PF.prov],['Ville',PF.ville],['Année scolaire',YEAR]];
 const body=`<div style="display:flex;gap:6mm;align-items:flex-start"><div class="card" style="width:40mm;text-align:center">${okPh(PHOTOS._prof)?`<div class="tph"><img alt="" src="${PHOTOS._prof}"></div>`:`<div class="tph ic"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1"/></svg></div><small class="miss">photo du profil (si ajoutée)</small>`}</div>
 <div class="kv" style="flex:1">${rows.map(r=>`<div>${r[0]}</div><div>${r[1]?esc(r[1]):miss('à compléter dans Paramètres › Mon profil')}</div>`).join('')}</div></div>
 <div class="stats"><div class="card"><b>${D.classes.length}</b><small>classes</small></div><div class="card"><b>${NSTU}</b><small>élèves</small></div><div class="card"><b>${h(svc.cm)}</b><small>heures de classe / sem.</small></div><div class="card"><b>${h(svc.am)}</b><small>ASS / sem.</small></div></div>
 <h2 class="sec-h" style="margin-top:7mm">Mes classes</h2><div style="display:flex;flex-wrap:wrap;gap:2mm">${D.classes.map(c=>`<span class="chip">${esc(c.name)} · ${c.students.length} él.</span>`).join('')}</div>
 `;
 return frame(k,'Informations personnelles','Professeur d’éducation physique et sportive','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',body,n);}
const CCOL={'1BACSH1':['#E85D04','#FFE8D6','#8A3300','Orange'],'1BACLSH2':['#C92A2A','#FFE3E3','#7D1A1A','Rouge'],'1BACLSH4':['#8B5A2B','#F3E6D8','#5A3519','Brun'],'2BACSP4':['#1F5FA8','#DCE9F8','#0A3768','Bleu'],'2BACSP5':['#0C8599','#D5F1F5','#08525E','Turquoise'],'2BACSP6':['#2B8A3E','#DDF3E1','#1A5426','Vert'],'2BACSVT2':['#6741D9','#E9E3FB','#3B2385','Violet'],'2BACSVT1':['#D4A000','#FFF4C2','#6B5000','Or'],'1BACSH3':['#C2255C','#FDE2EC','#7A1238','Framboise']};
function cc(c){return CCOL[c]||[lvColor(c),'#EEF1F5','#1C2430','Gris'];}
function lvColor(c){return /^2BAC/.test(c||'')?'#1971C2':/^1BAC/.test(c||'')?'#E8590C':/^TC/.test(c||'')?'#0CA678':'#495057';}
function service(k,n){const hm=x=>{const[h,m]=String(x).split(':').map(Number);return h+(m||0)/60;};const pad=h=>String(h).padStart(2,'0')+':00';
 const TT=D.tt.filter(t=>t&&t.day>=1&&t.day<=6&&t.start&&t.end);
 const starts=TT.map(t=>Math.floor(hm(t.start))),ends=TT.map(t=>Math.ceil(hm(t.end)));
 const amS=Math.min(8,...starts.filter(h=>h<13)),amE=Math.max(12,...TT.filter(t=>hm(t.start)<13).map(t=>Math.ceil(hm(t.end))));
 const pmS=Math.min(14,...starts.filter(h=>h>=13)),pmE=Math.max(18,...ends.filter(h=>h>13));
 const rows=[];for(let h=amS;h<amE;h++)rows.push(h);rows.push('pause');for(let h=Math.max(pmS,amE);h<pmE;h++)rows.push(h);
 const used={};const dayH=[0,0,0,0,0,0,0];TT.forEach(t=>dayH[t.day]+=hm(t.end)-hm(t.start));
 const cell=(d,h)=>{if(used[d+'_'+h])return '';const t=TT.find(x=>x.day===d&&Math.floor(hm(x.start))===h);if(!t)return '<td></td>';
   const span=Math.max(1,Math.ceil(hm(t.end))-h);for(let i=1;i<span;i++)used[d+'_'+(h+i)]=1;
   const rs=span>1?` rowspan="${span}"`:'';const dur=`<small class="du">${t.start}–${t.end}</small>`;
   if(t.type==='as')return `<td class="c"${rs} style="background:#082B53;color:#fff;border:.45mm solid #082B53">ASS${span>1?dur:''}</td>`;const C=cc(t.cls);return `<td class="c k"${rs} style="background:${C[1]};color:${C[2]};border:.45mm solid ${C[0]};border-left:1.8mm solid ${C[0]}">${esc(t.cls)}${span>1?dur:''}</td>`;};
 const svc=D.svc||{};
 const body=`<table class="tt"><tr><th style="width:21mm">Horaire</th>${[1,2,3,4,5,6].map(d=>`<th>${DAYS[d]}</th>`).join('')}</tr>${rows.map(h=>h==='pause'?`<tr class="pz"><td class="h"></td><td colspan="6" class="pz">Pause déjeuner · ${pad(amE)} – ${pad(Math.max(pmS,amE))}</td></tr>`:`<tr><td class="h">${pad(h)} – ${pad(h+1)}</td>${[1,2,3,4,5,6].map(d=>cell(d,h)).join('')}</tr>`).join('')}<tr class="tot"><td class="h">Total</td>${[1,2,3,4,5,6].map(d=>`<td class="tt2">${dayH[d]?String(dayH[d]).replace('.',',')+' h':'—'}</td>`).join('')}</tr></table>
 <div class="stats"><div class="card"><b>${(svc.cm||0)/60} h</b><small>enseignement</small></div><div class="card"><b>${(svc.am||0)/60} h</b><small>ASS (sport scolaire)</small></div><div class="card"><b>${(svc.tot||0)/60} h</b><small>total / semaine</small></div><div class="card"><b>${(svc.ob||0)/60} h</b><small>service dû</small></div></div>
 <div class="cleg"><div class="clt">Couleurs des classes</div><div class="clg">${D.classes.map(c=>{const C=cc(c.name),hh=TT.filter(t=>t.cls===c.name).reduce((a,t)=>a+hm(t.end)-hm(t.start),0);return `<span style="background:${C[1]};color:${C[2]};border:.4mm solid ${C[0]};border-left:1.6mm solid ${C[0]}"><b>${esc(c.name)}</b> · ${String(hh).replace('.',',')} h</span>`;}).join('')}<span style="background:#082B53;color:#fff;font-size:7pt;padding-right:.8mm"><b>ASS</b> · Association sportive</span></div></div>`;
 return frame(k,'Tableau de service','Emploi du temps hebdomadaire · '+YEAR,'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',body,n);}
function vacances(k,n){const H=D.holidays.slice().sort((a,b)=>a.from<b.from?-1:a.from>b.from?1:0);
 const days=h=>{const a=new Date(h.from),b=new Date(h.to&&h.to>=h.from?h.to:h.from);return Math.round((b-a)/864e5)+1;};
 const kind=h=>h.tm?'t':h.vac?'v':'f';const KL={v:'Vacances',f:'Jour férié',t:'Indisponibilité'},KC={v:'#1098AD',f:'#E8590C',t:'#7048E8'};
 const tot=x=>H.filter(h=>kind(h)===x).reduce((a,h)=>a+days(h),0),cnt=x=>H.filter(h=>kind(h)===x).length;
 const body=`<table class="t hol"><thead><tr><th style="width:8mm">N°</th><th>Nom</th><th style="width:24mm">Du</th><th style="width:24mm">Au</th><th style="width:16mm">Jours</th><th style="width:30mm">Type</th></tr></thead><tbody>${H.map((h,i)=>{const k2=kind(h);return `<tr><td>${i+1}</td><td class="hn">${esc(h.label)}${h.approx?' <span class="ap">date approximative</span>':''}${h.tm?' <span class="ap">'+esc(h.tm)+'</span>':''}</td><td>${dmy(h.from)}</td><td>${h.to&&h.to!==h.from?dmy(h.to):'—'}</td><td style="font-weight:800">${days(h)}</td><td><span class="ty" style="--k:${KC[k2]}">${KL[k2]}</span></td></tr>`;}).join('')}</tbody></table>
 <div class="stats"><div class="card"><b style="color:${KC.v}">${cnt('v')}</b><small>périodes de vacances</small></div><div class="card"><b style="color:${KC.v}">${tot('v')} j</b><small>jours de vacances</small></div><div class="card"><b style="color:${KC.f}">${cnt('f')}</b><small>jours fériés / dates</small></div><div class="card"><b style="color:${KC.f}">${tot('f')} j</b><small>jours fériés</small></div></div>
 <p style="font-size:7.5pt;color:#6b7280;margin-top:3mm">Liste de l’app (Paramètres › Vacances et jours fériés), même classement vacances / férié que les grilles et le registre. Jours = du premier au dernier jour inclus (week-ends compris). Les créneaux de cours tombant ces jours-là ne sont pas comptés.</p>`;
 return frame(k,'Vacances et jours fériés','Calendrier scolaire '+YEAR+' · '+H.length+' dates','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M2.5 12h2M19.5 12h2M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>',body,n);}
function repart(k,n){const C=D.cycles,a=new Date(D.year[0]),z=new Date(D.year[1]),T=(z-a)/864e5;let seg='',prev=a;
 C.forEach((c,i)=>{const s=new Date(c.start),e=new Date(c.end);if(s>prev)seg+=`<i class="v" style="flex:${(s-prev)/864e5}"></i>`;seg+=`<i style="flex:${(e-s)/864e5+1};background:${CYC[i]}">C${i+1}</i>`;prev=new Date(+e+864e5);});
 const body=`<div class="tl">${seg}</div><div class="rc">${C.map((c,i)=>`<div class="row" style="--c:${CYC[i]}"><div class="ic">${c.emoji}</div><div><div class="s">${esc(c.name)} · ${c.aps==='coll'?'Sport collectif':c.aps==='athle'?'Athlétisme':esc(c.aps||'')}</div><div class="a">${esc(c.act)}</div></div><div class="d">${dm(c.start)} → ${dm(c.end)}<div class="s">${dmy(c.start).slice(6)}${c.start.slice(0,4)!==c.end.slice(0,4)?'–'+c.end.slice(0,4):''}</div></div><div class="w"><b>${c.weeks}</b>sem. de cours${c.skipped?'<div class="s">+ '+c.skipped+' sem. vacances</div>':''}</div></div>`).join('')}</div>
 <div class="leg"><span><b style="background:repeating-linear-gradient(135deg,#d9dde4 0 1.2mm,#eef0f3 1.2mm 2.4mm)">&nbsp;</b> vacances</span><span>10 séances par cycle · ${D.classes.length} classes</span></div>`;
 return frame(k,'Répartition cyclique','Programme annuel · 6 cycles · '+YEAR,pic('Course de vitesse'),body,n);}
function trombi(k,c,n){const COLS=['#1971C2','#E8590C','#0CA678','#7048E8','#D6336C','#1098AD'];
 const body=`<div class="tb">${c.students.map((s,i)=>`<div class="s"><span class="no">${i+1}</span>${okPh(PHOTOS[s.id])?`<div class="av ph"><img alt="" src="${PHOTOS[s.id]}"></div>`:`<div class="av" style="background:${s.sex==='F'?'#D6336C':'#1971C2'}">${esc(ini(s.name))}</div>`}<div class="nm" dir="auto">${esc(s.name)}</div><div class="id">${esc(s.sid)}</div></div>`).join('')}</div>`;
 const f=c.students.filter(s=>s.sex==='F').length;
 return frame(k,'Trombinoscope · '+esc(c.name),`${c.students.length} élèves · ${f} filles · ${c.students.length-f} garçons`,'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20c.8-3.5 3.2-5.5 6-5.5s5.2 2 6 5.5"/><circle cx="17" cy="9" r="2.6"/><path d="M15.5 14.3c2.6-.4 4.8 1.4 5.5 4.7"/></svg>',body,n);}
function clsTitle(k,c){const f=c.students.filter(s=>s.sex==='F').length;
 return `<section class="pg clsV"><svg class="dec" viewBox="0 0 210 297"><g>${SPL.bigCorner(31)}</g><g transform="translate(210 0) scale(-1 1)">${SPL.bigCorner(37)}</g><g transform="translate(0 288) scale(1 -1)">${SPL.lightCorner(41)}</g><g transform="translate(210 288) scale(-1 -1)">${SPL.lightCorner(43)}</g></svg>
 <div class="lg"><img src="${LOGO}" alt=""></div>
 <div class="big"><div class="k">CLASSE</div><div class="bw"><h1>${esc(c.name)}</h1></div><br><span class="lv" style="background:${cc(c.name)[0]};box-shadow:0 1mm 0 ${cc(c.name)[2]}">${esc(c.level||'')} · Année scolaire ${YEAR}</span></div>
 <div class="facts"><div><b>${c.students.length}</b>élèves</div><div><b>${f}</b>filles</div><div><b>${c.students.length-f}</b>garçons</div></div>
 <div class="cyh">PROGRAMME DE L’ANNÉE</div>
 <div class="cy">${D.cycles.map((cy,i)=>`<div style="--c:${CYC[i]}">${cy.emoji}<span>${esc(cy.act)}<small>${esc(cy.name)} · ${dm(cy.start)} – ${dm(cy.end)}</small></span></div>`).join('')}</div>
 <div class="foot"><i></i>ÉDUCATION PHYSIQUE ET SPORTIVE ☆ TATABO3<i></i></div></section>`;}
function anthroSum(c){const g=sx=>{const v=c.students.filter(s=>(s.sex==='F')===(sx==='F')&&s.phys.vma!=null).map(s=>s.phys.vma);return v.length?(Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10+'').replace('.',',')+' km/h <small>('+v.length+')</small>':'—';};
 return `<div class="stats" style="grid-template-columns:repeat(3,1fr);margin-top:4mm"><div class="card"><b style="font-size:14pt">${g('F')}</b><small>VMA moyenne · filles</small></div><div class="card"><b style="font-size:14pt">${g('G')}</b><small>VMA moyenne · garçons</small></div><div class="card"><b style="font-size:14pt">${c.students.filter(s=>Object.keys(s.phys).length).length} / ${c.students.length}</b><small>élèves avec au moins un test</small></div></div><p style="font-size:7.5pt;color:#6b7280;margin-top:2mm">IMC calculé à partir de la taille et du poids (indicatif). Âge au ${dmy(D.year[0])}.</p>`;}
function anthro(k,c,n){const K=[['h','Taille','cm'],['w','Poids','kg'],['imc','IMC',''],['vma','VMA','km/h'],['v30','30 m','s'],['dv','Dét. vert.','cm'],['soup','Soupl.','cm'],['mb','Méd.-ball','m']];
 const vals=k2=>c.students.map(s=>k2==='imc'?s.imc:s.phys[k2]).filter(v=>v!=null);
 const body=`<table class="t"><thead><tr><th>N°</th><th>Nom et prénom</th><th>S.</th><th>Âge</th>${K.map(x=>`<th>${x[1]}${x[2]?'<br><small>'+x[2]+'</small>':''}</th>`).join('')}</tr></thead><tbody>${c.students.map((s,i)=>`<tr><td>${i+1}</td><td class="nm" dir="auto">${esc(s.name)}</td><td>${s.sex==='F'?'F':'G'}</td><td>${age(s.dob)}</td>${K.map(x=>`<td>${x[0]==='imc'?(s.imc!=null?String(Math.round(s.imc*10)/10).replace('.',','):''):ph(s,x[0])}</td>`).join('')}</tr>`).join('')}</tbody>
 <tfoot><tr><td colspan="4" style="font-weight:800;text-align:right">Moyenne (saisis)</td>${K.map(x=>{const v=vals(x[0]);return `<td style="font-weight:800">${v.length?String(Math.round(v.reduce((a,b)=>a+b,0)/v.length*10)/10).replace('.',','):'—'}<br><small style="font-weight:400;color:#6b7280">${v.length}/${c.students.length}</small></td>`;}).join('')}</tr></tfoot></table>${anthroSum(c)}`;
 return frame(k,'Tests anthropométriques · '+esc(c.name),'Mesures et tests physiques saisis dans l’app (cases vides = à mesurer)','<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3.5" y="3.5" width="17" height="17" rx="4"/><path d="M7.6 11.2a4.4 4.4 0 0 1 8.8 0"/><path d="M12 11.2l2.3-2.6"/><path d="M8.5 17h7"/></svg>',body,n);}
function groups(k,c,n){const GC=['#E03131','#1971C2','#2F9E44','#F08C00','#7048E8'];let body;
 if(c.grp){body=`<div class="gr">${c.grp.names.map((g,i)=>`<div class="g" style="--c:${GC[i%5]}"><h3>${esc(g)} · ${c.grp.groups[i].length} él.</h3>${c.grp.groups[i].map(id=>{const s=c.students.find(x=>x.id===id);return `<div class="ln" dir="auto">${esc(s?s.name:'')}</div>`;}).join('')}</div>`).join('')}</div>`;}
 else body=`<div class="note">ℹ️ Aucun groupe de travail n’est encore défini pour <b>${esc(c.name)}</b> dans l’app (Élèves › Groupes). La page s’imprimera avec les groupes dès qu’ils existeront ; en attendant, le modèle ci-dessous peut être complété à la main.</div>
 <div class="gr">${['G1','G2','G3','G4'].map((g,i)=>`<div class="g" style="--c:${GC[i]}"><h3>${g}</h3>${'<div class="ln"></div>'.repeat(10)}</div>`).join('')}</div>`;
 return frame(k,'Répartition des groupes · '+esc(c.name),`${c.students.length} élèves · groupes de travail équilibrés`,pic('Football'),body,n);}
const VISA='<div class="visa"><div>Observations</div><div>Remarque du directeur</div><div>Remarque de l’inspecteur</div></div>';
const STC={P:['P','','#A5AEBC',0],A:['A','#FDEAEC','#C62F3A',1],J:['AJ','#E8F1FB','#2563A8',1],M:['M','#F3E8FF','#7E22CE',1],K:['MJ','#FAF5FF','#9333EA',1],L:['R','#FFF3DC','#B86E00',1],S:['ST','#DFF5F2','#0F766E',1]};
const nb=v=>v==null?'—':String(Math.round(v*100)/100).replace('.',',');
function registre(k,c,p,n){const r=c.reg[p]||{cols:[],marks:[]},cy=D.cycles[p]||{name:'Cycle '+(p+1),act:'',start:'',end:'',emoji:''},CC=cc(c.name),gc=(GR[c.name]||{cyc:[]}).cyc[p]||null;
 const sp=gc?gc.spec:{total:20,comp:3,cols:[{l:'Produit',max:7},{l:'Perf.',max:7},{l:'Concept.',max:3}]};const GAB={'Produit':'Prod','Perf.':'Perf','Indiv.':'Indv','Coll.':'Coll','Gym.':'Gym','Concept.':'Conc'};
 const gm={};if(gc)gc.rows.forEach(x=>gm[x.id]=x);
 const nos=r.cols.map(x=>x.hol!=null?null:x.no);
 r.cols.forEach((x,i)=>{if(x.hol==null)return;let a=i;while(a>=0&&r.cols[a].hol!=null)a--;let b=i;while(b<r.cols.length&&r.cols[b].hol!=null)b++;const pa=a>=0?r.cols[a].no:0,nx=b<r.cols.length?r.cols[b].no:null;if(nx!=null&&nx-pa-1===b-a-1)nos[i]=pa+(i-a);});
 const nC=r.cols.length,half=sp.total/2;
 const head=`<tr><th class="n">N°</th><th class="nmh">Nom et prénom</th><th class="g" style="background:${CC[0]}">Note<br><small>/${nb(sp.total)}</small></th>${r.cols.map((x,i)=>x.hol!=null?`<th class="h">${nos[i]?'S'+nos[i]:''}<br><small>${dm(x.date)}</small></th>`:`<th>S${x.no}<br><small>${dm(x.date)}</small></th>`).join('')}${sp.cols.map(q=>`<th class="g" style="background:${CC[0]}">${GAB[q.l]||q.l}<br><small>/${nb(q.max)}</small></th>`).join('')}<th class="g" style="background:${CC[0]}">Comp<br><small>/${nb(sp.comp)}</small></th></tr>`;
 const rows=c.students.map((s,i)=>{const g=gm[s.id]||null,dsp=g&&g.dc;
  const cells=r.marks[i].map((m,j)=>{const x=r.cols[j];if(x.hol!=null)return i?'':`<td class="h" rowspan="${c.students.length}"><span class="hv">${esc(x.hol)}</span></td>`;if(!x.held)return '<td class="e"></td>';const t=STC[m];if(!t)return '<td></td>';const dz=g&&g.da&&g.da[j]&&m==='P';return `<td class="${t[3]?'k':'pp'}" style="${dz?'background:#ECEEF2;':t[1]?'background:'+t[1]+';':''}color:${t[2]}">${t[0]}</td>`;}).join('');
  const tot=g?g.total:null,vals=g?g.vals:sp.cols.map(()=>null),cp=g&&g.comp?g.comp:null;
  return `<tr${dsp?' class="dsp"':''}><td class="n">${i+1}</td><td class="nm" dir="auto">${esc(s.name)}</td><td class="gn" style="color:${tot==null?'#A5AEBC':tot<half?'#C62F3A':'#0A3768'}">${nb(tot)}</td>${cells}${vals.map((v,q)=>`<td class="gv" style="color:${v==null?'#BEC4CE':v>sp.cols[q].max?'#C62F3A':'#1C2430'}">${nb(v)}</td>`).join('')}<td class="gv" style="color:${cp==null?'#BEC4CE':cp.v<cp.max?'#B86E00':'#1C2430'}">${cp==null?'—':nb(cp.v)}</td></tr>`;}).join('');
 const leg=`<div class="leg2"><b class="lt">Légende :</b><span><i style="color:#A5AEBC">P</i>Présent</span>${['A','J','M','K','L','S'].map(q=>`<span><i style="background:${STC[q][1]};color:${STC[q][2]}">${STC[q][0]}</i>${{A:'Absence non justifiée',J:'Absence justifiée',M:'Malade non justifié',K:'Malade justifié',L:'Retard',S:'Sans tenue'}[q]}</span>`).join('')}<span><i style="background:#ECEEF2"></i>Élève dispensé(e)</span><span><i class="hz"></i>Jour férié / vacances : motif indiqué, non compté</span></div>
 <div class="cnote">Codes : P = présent · A = absence non justifiée · AJ = absence justifiée · M = malade non justifié · MJ = malade justifié · R = retard · ST = sans tenue. Av = avertissement (−1) · Bn = bonus (+0,5), note comportementale entre 0 et le maximum. Ligne grise = élève dispensé(e) de sport. Hachures sable = jour férié ou vacances (motif indiqué) : créneau non compté. Note /${nb(sp.total)} = ${sp.cols.map(q=>(GAB[q.l]||q.l)+' /'+nb(q.max)).join(' + ')} + Comp /${nb(sp.comp)} (note comportementale).<span class="se">Séances effectuées : ${r.cols.filter(x=>x.held).length} / ${r.cols.filter(x=>x.hol==null).length}</span></div>`;
 const body=`<table class="t rg2" style="--cc:${CC[0]}"><thead>${head}</thead><tbody>${rows}</tbody></table>${leg}${VISA}`;
 return frame(k,`Registre des séances · ${esc(c.name)}`,`${esc(cy.name)} – ${esc(cy.act)} · du ${dmy(cy.start)} au ${dmy(cy.end)} · séances et notation`,cy.emoji,body,n);}
function back(k){return `<section class="pg backV"><svg class="dec" viewBox="0 0 210 297"><g>${SPL.bigCorner(51)}</g><g transform="translate(210 0) scale(-1 1)">${SPL.bigCorner(57)}</g><g transform="translate(0 288) scale(1 -1)">${SPL.bigCorner(61,.75)}</g><g transform="translate(210 288) scale(-1 -1)">${SPL.bigCorner(67,.75)}</g></svg>
 <div class="lg"><img src="${LOGO}" alt=""></div>
 <div class="q"><div class="bw"><div class="ar">العقل السليم في الجسم السليم</div></div><div class="fr">« Un esprit sain dans un corps sain »</div></div>
 <div class="sm"><b>${esc(CIV)} ${esc(TNAME)}</b>${esc(PF.etab||'')}<br>Cahier journalier d’EPS · Année scolaire ${YEAR}<br><span class="t">Généré avec TATABO3</span></div>
 <div class="foot"><i></i>ÉDUCATION PHYSIQUE ET SPORTIVE ☆ TATABO3<i></i></div></section>`;}
function build(){const k='V',T=THEMES[k];let n=0;const P=[];const add=(id,h)=>{P.push({id,h:h.replace('<section ','<section data-id="'+id+'" ')});};
 CUR='';n++;add('king',king(k));n++;add('info',info(k,++n));add('service',service(k,++n));add('vac',vacances(k,++n));add('repart',repart(k,++n));
 D.classes.forEach((c,i)=>{CUR=c.name;add('trombi'+i,trombi(k,c,++n));});
 D.classes.forEach((c,ci)=>{CUR=c.name;add('cls'+ci,clsTitle(k,c));n++;add('anthro'+ci,anthro(k,c,++n));add('grp'+ci,groups(k,c,++n));for(let p=0;p<6;p++)add('reg'+ci+'_'+p,registre(k,c,p,++n));});
 CUR='';add('back',back(k));
 return {css:baseCss(T),pages:P,PF,CIV,TNAME,YEAR};}
return build();
}

/* ---------- données : lecture seule depuis l’app (même calcul que les écrans) ---------- */
function extract(pf){const A=window.CJR,Db=A.db(),X=A.cx,C=A.cal();const per=Db.periods||[];
 const cyc=C.cycles.map((c,i)=>({i,name:A.cycleName(i),label:A.cycleLabel?A.cycleLabel(i):'',act:per[i]||'',emoji:A.actPicto(per[i])||A.actEmoji(per[i],A.cycAps(i))||'',aps:A.cycAps(i),start:c.start||'',end:c.end||'',weeks:(c.weeks||[]).length,skipped:(c.skipped||[]).length,bad:!!c.bad}));
 let svc=null;try{svc=X&&X.service?X.service():null;}catch(e){svc=null;}
 const tt=((Db.cal&&Db.cal.tt)||[]).map(t=>({day:t.day,start:t.start,end:t.end,type:t.type,cls:t.classId?(A.cls(t.classId)||{}).name||'':'',room:t.room}));
 const GR={};
 const classes=Db.classes.map(c=>{const list=A.studentsIn(c.id);const g=A.grpOf(c.id);let gm=null;
  if(g){const m=A.grpMembers(c.id);gm={names:g.names.map((n,i)=>A.grpName(g,i)),groups:m.groups.map(a=>a.map(s=>s.id||s)),none:(m.none||[]).map(s=>s.id||s)};}
  const sc=A.physScores(c.id)||{};
  const reg=C.cycles.map((cy,p)=>{const cols=A.colsOf(c.id,p),NO=A.colNos(c.id,p);
   return {cols:cols.map((x,k)=>x.hol?{hol:A.holShort(x.hol),vac:A.isVacH(x.hol),date:x.date}:{s:x.s,no:NO[k],date:A.sessDate(c.id,p,x.s)||'',held:!!A.rec(c.id,p,x.s)}),
    marks:list.map(st=>cols.map(x=>{if(x.hol)return '#';const r=A.rec(c.id,p,x.s);return r?A.codeOf(r.marks[st.id]):'';}))};});
  GR[c.name]={cyc:C.cycles.map((cy,p)=>{const sp=A.gradeSpec(c.id,p),cols=A.colsOf(c.id,p);
   return {spec:{total:sp.total,comp:sp.comp,cols:sp.cols.map(k=>({k:k.k,l:k.l,max:k.max}))},
    rows:list.map(s=>{const q=A.gradeOf(c.id,s.id,p);return {id:s.id,total:q.total,vals:sp.cols.map(k=>q.vals[k.k]==null?null:q.vals[k.k]),comp:q.comp?{v:q.comp.v,max:q.comp.max}:null,dc:!!A.dspInCycle(s,p),da:cols.map(x=>x.hol?0:(A.dspAt(s,c.id,p,x.s)?1:0))};})};})};
  return {id:c.id,name:c.name,level:A.levelOf(c.name),grp:gm,students:list.map(st=>({id:st.id,name:st.name,sid:st.sid,sex:st.sex,dob:st.dob,disp:!!st.dispense,phys:Object.assign({},st.phys||{}),imc:A.imcOf(st),score:sc[st.id]==null?null:sc[st.id]})),reg};});
 const last=C.cycles[C.cycles.length-1];
 const D={teacher:Db.settings.teacher,profile:pf||Db.settings.profile||null,school:Db.settings.school||'lycee',cycles:cyc,tt,svc,
  classes:classLevelSort(classes),
  holidays:((Db.cal&&Db.cal.holidays)||[]).map(h=>({from:h.from,to:h.to,label:h.label,vac:A.isVacH(h),approx:!!h.approx,off:!!h.off,tm:h.startTime?h.startTime+'–'+h.endTime:''})),
  year:[C.cycles[0]&&C.cycles[0].start||'',last&&last.end||''],
  pictos:Object.fromEntries(['Football','Handball','Basket-Ball','Volleyball','Gymnastique','Course en durée','Course de vitesse','Saut en longueur','Saut en hauteur','Lancer de poids','Relais','Tennis de table','Natation','Badminton','Lancer du disque','Haies','Javelot','Judo'].map(n=>[n,A.actPicto(n)||'']))};
 return {D,GR};}

/* ---------- rendu vectoriel (2w) : la page HTML est mise en page dans un iframe caché (mêmes polices TTF que le PDF),
   puis chaque élément est redessiné dans jsPDF dans l’ordre d’affichage CSS : fonds, bordures, ombres pleines, hachures,
   SVG (tracés), images (octets JPEG d’origine), texte réel (Poppins / Cairo / Noto Naskh, arabe mis en forme, ordre visuel). ---------- */
const PX=25.4/96,PT=0.75,BIG=1e5;
function binStr(ab){const a=new Uint8Array(ab);let s='';for(let i=0;i<a.length;i+=0x8000)s+=String.fromCharCode.apply(null,a.subarray(i,i+0x8000));return s;}
function ttfInfo(ab){const v=new DataView(ab),n=v.getUint16(4),T={};
 for(let i=0;i<n;i++){const o=12+i*16;T[String.fromCharCode(v.getUint8(o),v.getUint8(o+1),v.getUint8(o+2),v.getUint8(o+3))]=v.getUint32(o+8);}
 const asc=v.getInt16(T.hhea+4),desc=Math.abs(v.getInt16(T.hhea+6));
 const c=T.cmap,nt=v.getUint16(c+2);let f4=-1,f12=-1;
 for(let i=0;i<nt;i++){const pid=v.getUint16(c+4+i*8),eid=v.getUint16(c+6+i*8),off=c+v.getUint32(c+8+i*8),f=v.getUint16(off);
  if(f===12&&pid===3&&eid===10)f12=off;if(f===4&&((pid===3&&eid===1)||(pid===0&&f4<0)))f4=off;}
 const set=new Set();
 if(f12>=0){const ng=v.getUint32(f12+12);for(let i=0;i<ng;i++){const s=v.getUint32(f12+16+i*12),e=v.getUint32(f12+20+i*12),g=v.getUint32(f12+24+i*12);for(let u=s;u<=e;u++)if(g+u-s)set.add(u);}}
 else if(f4>=0){const sx=v.getUint16(f4+6),E=f4+14,S=E+sx+2,Dl=S+sx,RO=Dl+sx;
  for(let i=0;i<sx/2;i++){const e=v.getUint16(E+i*2),s=v.getUint16(S+i*2),d=v.getInt16(Dl+i*2),ro=v.getUint16(RO+i*2);
   for(let u=s;u<=e&&u<0xFFFF;u++){let g;if(!ro)g=(u+d)&0xFFFF;else{g=v.getUint16(RO+i*2+ro+(u-s)*2);if(g)g=(g+d)&0xFFFF;}if(g)set.add(u);}}}
 return {A:asc/(asc+desc),has:u=>set.has(u)};}
/* registre des polices : familles CSS → faces (graisse, italique) ; choix selon l’algorithme CSS Fonts */
function fontReg(list){const fam={};list.forEach(f=>{(fam[f.fam]=fam[f.fam]||[]).push(f);});
 function pick(name,w,it){const fs=fam[name];if(!fs)return null;let c=fs.filter(f=>f.it===it);if(!c.length)c=fs;
  const inR=c.find(f=>w>=f.w0&&w<=f.w1);if(inR)return inR;
  const up=c.filter(f=>f.w0>w).sort((a,b)=>a.w0-b.w0),dn=c.filter(f=>f.w1<w).sort((a,b)=>b.w1-a.w1);
  if(w>=400&&w<=500){const u5=up.filter(f=>f.w0<=500);return u5[0]||dn[0]||up[0];}
  return w<400?(dn[0]||up[0]):(up[0]||dn[0]);}
 return {pick,fam};}
const isAr=u=>(u>=0x0600&&u<=0x06FF)||(u>=0x0750&&u<=0x077F)||(u>=0x08A0&&u<=0x08FF)||(u>=0xFB50&&u<=0xFDFF)||(u>=0xFE70&&u<=0xFEFF);
function col(s){if(!s||s==='none'||s==='transparent')return null;
 const k=s.match(/^color\(srgb\s+([^)]+)\)/);/* color-mix() est calculé en « color(srgb r g b / a) » (composantes 0–1) */
 if(k){const q=k[1].split(/[\s\/]+/).filter(Boolean).map(v=>/%$/.test(v)?parseFloat(v)/100:parseFloat(v));const a=q.length>3?q[3]:1;if(!(a>0))return null;return {r:Math.round(q[0]*255),g:Math.round(q[1]*255),b:Math.round(q[2]*255),a};}
 let m=s.match(/^rgba?\(([^)]+)\)/);if(!m){if(typeof console!=='undefined')console.warn('cj-vec couleur ignorée',s);return null;}
 const p=m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);const a=p.length>3?p[3]:1;if(!(a>0))return null;return {r:p[0],g:p[1],b:p[2],a};}
const pxv=s=>parseFloat(s)||0;
/* longueur CSS quelconque → px (les dégradés calculés gardent souvent l’unité d’origine, ex. « 1.2mm ») */
const UNIT={px:1,mm:96/25.4,cm:96/2.54,in:96,pt:96/72,pc:16,q:96/101.6};const lenPx=s=>{const m=String(s).match(/^(-?[\d.]+(?:e-?\d+)?)([a-z]*)$/i);if(!m)return 0;const u=UNIT[(m[2]||'px').toLowerCase()];return u?parseFloat(m[1])*u:0;};
function splitTop(s){const o=[];let d=0,b='';for(const ch of s){if(ch==='('){d++;}else if(ch===')'){d--;}if(ch===','&&!d){o.push(b.trim());b='';}else b+=ch;}if(b.trim())o.push(b.trim());return o;}
function shadows(s){if(!s||s==='none')return [];return splitTop(s).map(x=>{const inset=/\binset\b/.test(x);const cm=x.match(/(?:rgba?|color)\([^)]*\)/);const c=col(cm?cm[0]:'rgb(0,0,0)');
 const n=x.replace(/rgba?\([^)]*\)/,'').replace('inset','').trim().split(/\s+/).map(pxv);return {inset,c,x:n[0]||0,y:n[1]||0,bl:n[2]||0,sp:n[3]||0};});}
/* tracés SVG « d » → segments absolus M/L/C/Z (arcs convertis en Bézier) */
function parsePath(d){const out=[];const re=/([MmLlHhVvCcSsQqTtAaZz])|([+-]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][+-]?\d+)?)/g;const tk=[];let m;
 while((m=re.exec(d)))tk.push(m[1]?m[1]:+m[2]);
 let i=0,cmd='',x=0,y=0,sx=0,sy=0,cx=0,cy=0,qx=0,qy=0,prev='';
 const num=()=>{const v=tk[i++];return typeof v==='number'?v:NaN;};
 const flag=()=>{/* drapeaux d’arc collés : « 011 » */const v=tk[i];if(typeof v!=='number')return NaN;const s=String(v);if(s.length>1&&/^[01]+$/.test(s.replace('.',''))&&!s.includes('.')){tk[i]=+s.slice(1);return +s[0];}i++;return v;};
 while(i<tk.length){if(typeof tk[i]==='string'){cmd=tk[i++];}else if(!cmd)break;
  const rel=cmd===cmd.toLowerCase(),C=cmd.toUpperCase();
  if(C==='Z'){out.push(['Z']);x=sx;y=sy;prev='Z';if(typeof tk[i]==='number')cmd=rel?'l':'L';continue;}
  if(C==='M'){let a=num(),b=num();if(rel){a+=x;b+=y;}x=sx=a;y=sy=b;out.push(['M',x,y]);cmd=rel?'l':'L';prev='M';continue;}
  if(C==='L'){let a=num(),b=num();if(rel){a+=x;b+=y;}x=a;y=b;out.push(['L',x,y]);}
  else if(C==='H'){let a=num();if(rel)a+=x;x=a;out.push(['L',x,y]);}
  else if(C==='V'){let b=num();if(rel)b+=y;y=b;out.push(['L',x,y]);}
  else if(C==='C'){let p=[num(),num(),num(),num(),num(),num()];if(rel)p=p.map((v,k)=>v+(k%2?y:x));out.push(['C'].concat(p));cx=p[2];cy=p[3];x=p[4];y=p[5];}
  else if(C==='S'){let p=[num(),num(),num(),num()];if(rel)p=p.map((v,k)=>v+(k%2?y:x));const r1=/[CS]/.test(prev)?[2*x-cx,2*y-cy]:[x,y];out.push(['C',r1[0],r1[1],p[0],p[1],p[2],p[3]]);cx=p[0];cy=p[1];x=p[2];y=p[3];}
  else if(C==='Q'||C==='T'){let q1,e;if(C==='Q'){let p=[num(),num(),num(),num()];if(rel)p=p.map((v,k)=>v+(k%2?y:x));q1=[p[0],p[1]];e=[p[2],p[3]];}
   else{let p=[num(),num()];if(rel){p[0]+=x;p[1]+=y;}q1=/[QT]/.test(prev)?[2*x-qx,2*y-qy]:[x,y];e=p;}
   out.push(['C',x+2/3*(q1[0]-x),y+2/3*(q1[1]-y),e[0]+2/3*(q1[0]-e[0]),e[1]+2/3*(q1[1]-e[1]),e[0],e[1]]);qx=q1[0];qy=q1[1];x=e[0];y=e[1];}
  else if(C==='A'){let rx=Math.abs(num()),ry=Math.abs(num()),ph=num(),fa=flag(),fs=flag(),ex=num(),ey=num();if(rel){ex+=x;ey+=y;}
   arcTo(out,x,y,rx,ry,ph,fa,fs,ex,ey);x=ex;y=ey;}
  else{i++;continue;}
  prev=C;if(isNaN(x)||isNaN(y))break;}
 return out;}
function arcTo(out,x1,y1,rx,ry,phi,fa,fs,x2,y2){if(!rx||!ry){out.push(['L',x2,y2]);return;}
 const p=phi*Math.PI/180,cp=Math.cos(p),sp=Math.sin(p),dx=(x1-x2)/2,dy=(y1-y2)/2,x1p=cp*dx+sp*dy,y1p=-sp*dx+cp*dy;
 let l=x1p*x1p/(rx*rx)+y1p*y1p/(ry*ry);if(l>1){rx*=Math.sqrt(l);ry*=Math.sqrt(l);}
 let num=rx*rx*ry*ry-rx*rx*y1p*y1p-ry*ry*x1p*x1p;num=num<0?0:num;let co=Math.sqrt(num/(rx*rx*y1p*y1p+ry*ry*x1p*x1p))*(fa===fs?-1:1);
 const cxp=co*rx*y1p/ry,cyp=-co*ry*x1p/rx,cx=cp*cxp-sp*cyp+(x1+x2)/2,cy=sp*cxp+cp*cyp+(y1+y2)/2;
 const ang=(ux,uy,vx,vy)=>{const a=Math.atan2(ux*vy-uy*vx,ux*vx+uy*vy);return a;};
 let t1=ang(1,0,(x1p-cxp)/rx,(y1p-cyp)/ry),dt=ang((x1p-cxp)/rx,(y1p-cyp)/ry,(-x1p-cxp)/rx,(-y1p-cyp)/ry);
 if(!fs&&dt>0)dt-=2*Math.PI;if(fs&&dt<0)dt+=2*Math.PI;
 const n=Math.ceil(Math.abs(dt)/(Math.PI/2)),h=dt/n,k=4/3*Math.tan(h/4);
 for(let j=0;j<n;j++){const a1=t1+j*h,a2=a1+h,c1=Math.cos(a1),s1=Math.sin(a1),c2=Math.cos(a2),s2=Math.sin(a2);
  const P=(X,Y)=>[cx+rx*X*cp-ry*Y*sp,cy+rx*X*sp+ry*Y*cp];
  const q1=P(c1-k*s1,s1+k*c1),q2=P(c2+k*s2,s2-k*c2),q3=P(c2,s2);out.push(['C',q1[0],q1[1],q2[0],q2[1],q3[0],q3[1]]);}}
const KAP=0.5522847498;
function ellSeg(cx,cy,rx,ry){const k=KAP;return [['M',cx+rx,cy],['C',cx+rx,cy+ry*k,cx+rx*k,cy+ry,cx,cy+ry],['C',cx-rx*k,cy+ry,cx-rx,cy+ry*k,cx-rx,cy],['C',cx-rx,cy-ry*k,cx-rx*k,cy-ry,cx,cy-ry],['C',cx+rx*k,cy-ry,cx+rx,cy-ry*k,cx+rx,cy],['Z']];}
function rrSeg(x,y,w,h,R){/* R=[tlx,tly,trx,try,brx,bry,blx,bly] en px */const k=1-KAP;
 if(!R||!R.some(v=>v>0.01))return [['M',x,y],['L',x+w,y],['L',x+w,y+h],['L',x,y+h],['Z']];
 const [a,b,c,d,e,f,g,hh]=R,o=[['M',x+a,y],['L',x+w-c,y]];
 if(c||d)o.push(['C',x+w-c*k,y,x+w,y+d*k,x+w,y+d]);o.push(['L',x+w,y+h-f]);
 if(e||f)o.push(['C',x+w,y+h-f*k,x+w-e*k,y+h,x+w-e,y+h]);o.push(['L',x+g,y+h]);
 if(g||hh)o.push(['C',x+g*k,y+h,x,y+h-hh*k,x,y+h-hh]);o.push(['L',x,y+b]);
 if(a||b)o.push(['C',x,y+b*k,x+a*k,y,x+a,y]);o.push(['Z']);return o;}
function radii(s,w,h){const g=(v)=>{const p=v.split(' ');const one=(q,ref)=>/%$/.test(q)?parseFloat(q)/100*ref:pxv(q);return [one(p[0],w),one(p[1]||p[0],h)];};
 const tl=g(s.borderTopLeftRadius),tr=g(s.borderTopRightRadius),br=g(s.borderBottomRightRadius),bl=g(s.borderBottomLeftRadius);
 let R=[tl[0],tl[1],tr[0],tr[1],br[0],br[1],bl[0],bl[1]];if(!R.some(v=>v>0))return null;
 const f=Math.min(1,w/((tl[0]+tr[0])||1e-9),w/((bl[0]+br[0])||1e-9),h/((tl[1]+bl[1])||1e-9),h/((tr[1]+br[1])||1e-9));return R.map(v=>v*f);}
const shrinkR=(R,t,r,b,l)=>R?[R[0]-l,R[1]-t,R[2]-r,R[3]-t,R[4]-r,R[5]-b,R[6]-l,R[7]-b].map(v=>v>0?v:0):null;
const growR=(R,s)=>R?R.map(v=>v>0?Math.max(0,v+s):0):null;
function bidiGetter(){return null;}

function Painter(doc,win,FR,stats){
 const fd=win.document,CS=new Map(),cs=(el,ps)=>{if(ps)return win.getComputedStyle(el,ps);let s=CS.get(el);if(!s){s=win.getComputedStyle(el);CS.set(el,s);}return s;};
 let cur={};const reset=()=>{cur={};};
 const GS=new Map();function gs(fa,sa){fa=Math.round(fa*1000)/1000;sa=Math.round(sa*1000)/1000;const k=fa+'/'+sa;if(cur.gs===k)return;let g=GS.get(k);if(!g){g=new doc.GState({opacity:fa,'stroke-opacity':sa});GS.set(k,g);}doc.setGState(g);cur.gs=k;}
 function fillC(c){const k=c.r+','+c.g+','+c.b;if(cur.f!==k){doc.setFillColor(c.r,c.g,c.b);cur.f=k;}}
 function strokeC(c){const k=c.r+','+c.g+','+c.b;if(cur.s!==k){doc.setDrawColor(c.r,c.g,c.b);cur.s=k;}}
 function path(seg,m){for(const p of seg){if(p[0]==='Z'){doc.close();continue;}
   const q=[];for(let i=1;i<p.length;i+=2){let X=p[i],Y=p[i+1];if(m){const x=X;X=m.a*x+m.c*Y+m.e;Y=m.b*x+m.d*Y+m.f;}q.push(X*PX,Y*PX);}
   if(p[0]==='M')doc.moveTo(q[0],q[1]);else if(p[0]==='L')doc.lineTo(q[0],q[1]);else doc.curveTo(q[0],q[1],q[2],q[3],q[4],q[5]);}}
 function fillSeg(seg,c,eo,m){if(!c)return;gs(c.a,cur.sa==null?1:1);fillC(c);path(seg,m);eo?doc.fillEvenOdd():doc.fill();}
 /* pile d’états : découpes (overflow) et transformations CSS, partagée par les ancêtres */
 let stack=[];
 function apply(chain){let i=0;while(i<stack.length&&i<chain.length&&stack[i]===chain[i])i++;
  while(stack.length>i){doc.restoreGraphicsState();stack.pop();reset();}
  for(;i<chain.length;i++){const e=chain[i];doc.saveGraphicsState();reset();
   if(e.m){doc.setCurrentTransformationMatrix(new doc.Matrix(e.m[0],e.m[1],e.m[2],e.m[3],e.m[4],e.m[5]));}
   else{path(e.seg,null);doc.clip();doc.discardPath();}
   stack.push(e);}}
 const SELF=new Map(),KIDS=new Map();
 function chainSelf(el){if(SELF.has(el))return SELF.get(el);const p=el.parentElement;let c=p&&el!==ROOT?chainKids(p):[];
  const t=TR.get(el);if(t)c=c.concat([t]);SELF.set(el,c);return c;}
 function chainKids(el){if(KIDS.has(el))return KIDS.get(el);let c=chainSelf(el);const s=cs(el);
  if((s.overflowX!=='visible'||s.overflowY!=='visible')&&!(el.tagName==='svg'&&el.parentElement&&el.parentElement.closest&&el.parentElement.closest('svg'))){
   const pb=padBox(el,s);c=c.concat([{seg:rrSeg(pb.x,pb.y,pb.w,pb.h,pb.R)}]);}
  KIDS.set(el,c);return c;}
 function padBox(el,s){const r=el.getBoundingClientRect(),bt=bwid(s,'Top'),br=bwid(s,'Right'),bb=bwid(s,'Bottom'),bl=bwid(s,'Left');
  return {x:r.left+bl,y:r.top+bt,w:r.width-bl-br,h:r.height-bt-bb,R:shrinkR(radii(s,r.width,r.height),bt,br,bb,bl),r,bt,br,bb,bl};}
 const bwid=(s,k)=>{const st=s['border'+k+'Style'];return st==='none'||st==='hidden'?0:pxv(s['border'+k+'Width']);};
 /* Les navigateurs arrondissent les épaisseurs de bordure au pixel écran (ex. 0,4 mm = 1,51 px → 1 px) : pour l’impression on reprend la valeur déclarée
    (style en ligne puis dernière règle qui s’applique) quand elle est compatible avec la valeur arrondie. */
 let RULES=null;function rules(){if(RULES)return RULES;RULES=[];const walk=L=>{for(const r of L){if(r.cssRules&&!r.selectorText){try{if(!r.media||win.matchMedia(r.media.mediaText).matches)walk(r.cssRules);}catch(e){}continue;}
   if(!r.selectorText||!r.style)continue;const w={};for(const k of ['Top','Right','Bottom','Left']){const v=r.style['border'+k+'Width'];if(v&&/[a-z]$/i.test(v)&&!/px$/.test(v))w[k]={v:lenPx(v),imp:r.style.getPropertyPriority('border-'+k.toLowerCase()+'-width')==='important'};}
   if(Object.keys(w).length)RULES.push({sel:r.selectorText,w});}};for(const sh of fd.styleSheets){try{walk(sh.cssRules);}catch(e){}}return RULES;}
 const BW=new WeakMap();function bw(el,s,k){const c=bwid(s,k);if(!c)return 0;let m=BW.get(el);if(!m){m={};const L=rules();
   for(const q of L){let ok=false;try{ok=el.matches(q.sel);}catch(e){}if(!ok)continue;for(const kk in q.w){if(m[kk]&&m[kk].imp&&!q.w[kk].imp)continue;m[kk]=q.w[kk];}}
   for(const kk of ['Top','Right','Bottom','Left']){const v=el.style&&el.style['border'+kk+'Width'];if(v&&!/px$/.test(v)&&/[a-z]$/i.test(v)&&!(m[kk]&&m[kk].imp))m[kk]={v:lenPx(v)};}BW.set(el,m);}
  const d=m[k];if(!d||!(d.v>0))return c;const dpr=win.devicePixelRatio||1;return (d.v>=c-1e-3&&d.v<c+1/dpr+1e-3)?d.v:c;}
 let ROOT=null;const TR=new Map();

 /* ---- boîte : ombres externes, fond, images de fond, ombres internes, bordures, contour ---- */
 function box(el,s){if(s.visibility!=='visible')return;const r=el.getBoundingClientRect();if(r.width<=0||r.height<=0)return;
  const x=r.left,y=r.top,w=r.width,h=r.height,R=radii(s,w,h),SH=shadows(s.boxShadow),ch=chainSelf(el);
  const outer=SH.filter(q=>!q.inset&&q.c).reverse(),inner=SH.filter(q=>q.inset&&q.c).reverse();
  for(const q of outer){apply(ch);doc.saveGraphicsState();reset();path(rrSeg(-BIG,-BIG,2*BIG,2*BIG,null));path(rrSeg(x,y,w,h,R));doc.clipEvenOdd();doc.discardPath();
   if(q.bl>0)stats.blur++;
   fillSeg(rrSeg(x+q.x-q.sp,y+q.y-q.sp,w+2*q.sp,h+2*q.sp,growR(R,q.sp)),q.c);doc.restoreGraphicsState();reset();}
  const coll=(el.tagName==='TD'||el.tagName==='TH')&&collapsed(el);
  const pb=padBox(el,s);
  const bg=col(s.backgroundColor);if(bg){apply(ch);const clipPad=s.backgroundClip==='padding-box';fillSeg(clipPad?rrSeg(pb.x,pb.y,pb.w,pb.h,pb.R):rrSeg(x,y,w,h,R),bg);}
  if(s.backgroundImage&&s.backgroundImage!=='none'){const L=splitTop(s.backgroundImage).reverse();
   for(const im of L){apply(ch);doc.saveGraphicsState();reset();path(rrSeg(x,y,w,h,R));doc.clip();doc.discardPath();
    if(/^repeating-linear-gradient/.test(im))stripes(im,pb.x,pb.y,pb.w,pb.h);
    else if(/^url\(/.test(im))bgImage(im,s,pb);
    else if(/^linear-gradient/.test(im)){stats.grad++;const cc=im.match(/(?:rgba?|color)\([^)]*\)/);if(cc)fillSeg(rrSeg(x,y,w,h,R),col(cc[0]));}
    doc.restoreGraphicsState();reset();}}
  for(const q of inner){apply(ch);doc.saveGraphicsState();reset();path(rrSeg(pb.x,pb.y,pb.w,pb.h,pb.R));doc.clip();doc.discardPath();
   if(q.bl>0)stats.blur++;
   const ix=pb.x+q.x+q.sp,iy=pb.y+q.y+q.sp,iw=pb.w-2*q.sp,ih=pb.h-2*q.sp;
   fillSeg(rrSeg(-BIG,-BIG,2*BIG,2*BIG,null).concat(iw>0&&ih>0?rrSeg(ix,iy,iw,ih,growR(pb.R,-q.sp)):[]),q.c,true);doc.restoreGraphicsState();reset();}
  borders(el,s,x,y,w,h,R,ch,coll);
  if(s.outlineStyle&&s.outlineStyle!=='none'){const ow=pxv(s.outlineWidth),oo=pxv(s.outlineOffset),oc=col(s.outlineColor);
   if(ow>0&&oc){apply(ch);const a=oo+ow;fillSeg(rrSeg(x-a,y-a,w+2*a,h+2*a,growR(R,a)).concat(rrSeg(x-oo,y-oo,w+2*oo,h+2*oo,growR(R,oo))),oc,true);}}}
 const COLL=new WeakMap();function collapsed(td){const t=td.closest('table');if(!t)return false;if(!COLL.has(t))COLL.set(t,cs(t).borderCollapse==='collapse');return COLL.get(t);}
 function borders(el,s,x,y,w,h,R,ch,coll){const S=['Top','Right','Bottom','Left'].map(k=>({w:bw(el,s,k),c:col(s['border'+k+'Color']),st:s['border'+k+'Style']}));
  if(!S.some(b=>b.w>0&&b.c))return;apply(ch);
  if(coll){/* tableau « border-collapse » : le trait est centré sur le bord de la cellule */
   const t=S[0],r=S[1],b=S[2],l=S[3];
   if(t.w&&t.c)fillSeg(rrSeg(x-l.w/2,y-t.w/2,w+(l.w+r.w)/2,t.w,null),t.c);
   if(b.w&&b.c)fillSeg(rrSeg(x-l.w/2,y+h-b.w/2,w+(l.w+r.w)/2,b.w,null),b.c);
   if(l.w&&l.c)fillSeg(rrSeg(x-l.w/2,y-t.w/2,l.w,h+(t.w+b.w)/2,null),l.c);
   if(r.w&&r.c)fillSeg(rrSeg(x+w-r.w/2,y-t.w/2,r.w,h+(t.w+b.w)/2,null),r.c);return;}
  const [bt,br,bb,bl]=S.map(b=>b.w),inR=shrinkR(R,bt,br,bb,bl);
  const solid=S.every(b=>b.st==='solid'||!b.w);
  const same=solid&&S.every(b=>b.w>0)&&S.every(b=>!b.w||(b.c&&S.find(q=>q.w).c&&b.c.r===S.find(q=>q.w).c.r&&b.c.g===S.find(q=>q.w).c.g&&b.c.b===S.find(q=>q.w).c.b&&b.c.a===S.find(q=>q.w).c.a));
  if(same){fillSeg(rrSeg(x,y,w,h,R).concat(rrSeg(x+bl,y+bt,w-bl-br,h-bt-bb,inR)),S.find(q=>q.w).c,true);return;}
  if(solid&&!R){/* coins droits : un rectangle par côté (évite les filets fantômes des bords confondus) */
   if(bt&&S[0].c)fillSeg(rrSeg(x,y,w,bt,null),S[0].c);if(bb&&S[2].c)fillSeg(rrSeg(x,y+h-bb,w,bb,null),S[2].c);
   if(bl&&S[3].c)fillSeg(rrSeg(x,y+bt,bl,h-bt-bb,null),S[3].c);if(br&&S[1].c)fillSeg(rrSeg(x+w-br,y+bt,br,h-bt-bb,null),S[1].c);return;}
  const poly=[[[x,y],[x+w,y],[x+w-br,y+bt],[x+bl,y+bt]],[[x+w,y],[x+w,y+h],[x+w-br,y+h-bb],[x+w-br,y+bt]],[[x+w,y+h],[x,y+h],[x+bl,y+h-bb],[x+w-br,y+h-bb]],[[x,y+h],[x,y],[x+bl,y+bt],[x+bl,y+h-bb]]];
  doc.saveGraphicsState();reset();path(rrSeg(x,y,w,h,R).concat(rrSeg(x+bl,y+bt,w-bl-br,h-bt-bb,inR)));doc.clipEvenOdd();doc.discardPath();
  S.forEach((b,i)=>{if(!b.w||!b.c)return;
   if(b.st==='dotted'||b.st==='dashed'){/* pointillés : trait centré, extrémités rondes */const line=[[x,y+bt/2,x+w,y+bt/2],[x+w-br/2,y,x+w-br/2,y+h],[x,y+h-bb/2,x+w,y+h-bb/2],[x+bl/2,y,x+bl/2,y+h]][i];
    gs(1,b.c.a);strokeC(b.c);doc.setLineWidth(b.w*PX);cur.lw=null;
    if(b.st==='dotted'){doc.setLineCap('round');doc.setLineDashPattern([0.001,2*b.w*PX],0);}else{doc.setLineCap('butt');doc.setLineDashPattern([2*b.w*PX,b.w*PX],0);}
    path([['M',line[0],line[1]],['L',line[2],line[3]]]);doc.stroke();doc.setLineDashPattern([],0);doc.setLineCap('butt');return;}
   const p=poly[i];fillSeg([['M',p[0][0],p[0][1]],['L',p[1][0],p[1][1]],['L',p[2][0],p[2][1]],['L',p[3][0],p[3][1]],['Z']],b.c);});
  doc.restoreGraphicsState();reset();}
 function stripes(im,x,y,w,h){const a=splitTop(im.slice(im.indexOf('(')+1,im.lastIndexOf(')')));let ang=180;
  if(/deg$/.test(a[0])){ang=parseFloat(a.shift());}else if(/^to /.test(a[0])){const t=a.shift();ang={'to top':0,'to right':90,'to bottom':180,'to left':270}[t]||180;}
  const th=ang*Math.PI/180,dx=Math.sin(th),dy=-Math.cos(th),Lg=Math.abs(w*dx)+Math.abs(h*dy),sx=x+w/2-dx*Lg/2,sy=y+h/2-dy*Lg/2;
  const stops=[];a.forEach(t=>{const cm=t.match(/^((?:rgba?|color)\([^)]*\)|transparent)\s*(.*)$/);if(!cm)return;const c=cm[1]==='transparent'?null:col(cm[1]);
   const ps=cm[2].trim()?cm[2].trim().split(/\s+/).map(q=>/%$/.test(q)?parseFloat(q)/100*Lg:lenPx(q)):[null];ps.forEach(p=>stops.push({c,p}));});
  if(stops.length<2)return;stops.forEach((q,i)=>{if(q.p==null)q.p=i?stops[i-1].p:0;if(i&&q.p<stops[i-1].p)q.p=stops[i-1].p;});
  const p0=stops[0].p,per=stops[stops.length-1].p-p0;if(!(per>0.05))return;
  const band=(t0,t1,c)=>{if(!c||t1<=t0)return;const nx=-dy*BIG/100,ny=dx*BIG/100;
   const A=[sx+dx*t0,sy+dy*t0],B=[sx+dx*t1,sy+dy*t1];fillSeg([['M',A[0]+nx,A[1]+ny],['L',B[0]+nx,B[1]+ny],['L',B[0]-nx,B[1]-ny],['L',A[0]-nx,A[1]-ny],['Z']],c);};
  for(let k=Math.floor(-p0/per)-1;k*per+p0<Lg+per;k++){const o=k*per;
   for(let i=0;i+1<stops.length;i++){const u=stops[i],v=stops[i+1];if(v.p<=u.p)continue;
    if(!u.c&&!v.c)continue;
    if(u.c&&v.c&&u.c.r===v.c.r&&u.c.g===v.c.g&&u.c.b===v.c.b&&u.c.a===v.c.a)band(o+u.p,o+v.p,u.c);
    else{stats.grad++;const n=6;for(let j=0;j<n;j++){const f=(j+.5)/n,U=u.c||Object.assign({},v.c,{a:0}),V2=v.c||Object.assign({},u.c,{a:0});
     band(o+u.p+(v.p-u.p)*j/n,o+u.p+(v.p-u.p)*(j+1)/n,{r:U.r+(V2.r-U.r)*f,g:U.g+(V2.g-U.g)*f,b:U.b+(V2.b-U.b)*f,a:U.a+(V2.a-U.a)*f});}}}}}
 function bgImage(im,s,pb){const m=im.match(/^url\(\s*["']?([\s\S]*?)["']?\s*\)$/);if(!m)return;const u=m[1];
  if(/^data:image\/svg\+xml/.test(u)){let t=u.slice(u.indexOf(',')+1);t=/;base64,/.test(u.slice(0,u.indexOf(',')+1))?atob(t):decodeURIComponent(t);
   const sv=new win.DOMParser().parseFromString(t,'image/svg+xml').documentElement;if(!sv||sv.nodeName!=='svg')return;
   const wrap=fd.createElement('div');wrap.style.cssText='position:absolute;margin:0;padding:0;border:0;left:'+(pb.x+win.scrollX)+'px;top:'+(pb.y+win.scrollY)+'px;width:'+pb.w+'px;height:'+pb.h+'px';
   const n=fd.importNode(sv,true);n.setAttribute('width','100%');n.setAttribute('height','100%');n.style.display='block';wrap.appendChild(n);fd.body.appendChild(wrap);
   const savedStack=stack.slice();svgShapes(n,null);fd.body.removeChild(wrap);void savedStack;return;}
  stats.bgimg++;}
 /* ---- SVG : chaque forme devient un tracé PDF (matrice écran exacte) ---- */
 const GEO=new Set(['cx','cy','r','rx','ry','x','y','width','height','d','points','x1','y1','x2','y2']);
 function svgShapes(svg,ch){const OPC=new Map();
  const opac=(el)=>{if(el===svg||!el||el.nodeType!==1)return parseFloat(cs(svg).opacity)||1;if(OPC.has(el))return OPC.get(el);const v=(parseFloat(cs(el).opacity)||0)*opac(el.parentNode);OPC.set(el,v);return v;};
  const CTM=new Map(),SC=new Map();
  const list=svg.querySelectorAll('circle,ellipse,rect,path,line,polyline,polygon');
  for(const el of list){if(el.closest('defs,clipPath,mask,symbol,pattern,marker'))continue;
   const par=el.parentNode;let plain=!el.hasAttribute('class')&&!el.hasAttribute('style')&&!el.hasAttribute('id');
   if(plain)for(const at of el.attributes)if(!GEO.has(at.name)){plain=false;break;}
   let st;if(plain){const k=el.tagName;let mp=SC.get(par);if(!mp){mp={};SC.set(par,mp);}st=mp[k]||(mp[k]=cs(el));}else st=cs(el);
   if(st.display==='none'||st.visibility!=='visible')continue;
   let m;if(plain||!el.transform||!el.transform.baseVal.numberOfItems){m=CTM.get(par);if(!m){m=el.getScreenCTM();CTM.set(par,m);}}else m=el.getScreenCTM();
   if(!m)continue;
   let seg;const A=(n)=>pxv(el.getAttribute(n));const t=el.tagName;
   if(t==='circle'){const r=A('r');if(r<=0)continue;seg=ellSeg(A('cx'),A('cy'),r,r);}
   else if(t==='ellipse'){const rx=A('rx'),ry=A('ry');if(rx<=0||ry<=0)continue;seg=ellSeg(A('cx'),A('cy'),rx,ry);}
   else if(t==='rect'){const w=A('width'),h=A('height');if(w<=0||h<=0)continue;let rx=el.hasAttribute('rx')?A('rx'):null,ry=el.hasAttribute('ry')?A('ry'):null;if(rx==null)rx=ry||0;if(ry==null)ry=rx;rx=Math.min(rx,w/2);ry=Math.min(ry,h/2);seg=rrSeg(A('x'),A('y'),w,h,rx||ry?[rx,ry,rx,ry,rx,ry,rx,ry]:null);}
   else if(t==='line')seg=[['M',A('x1'),A('y1')],['L',A('x2'),A('y2')]];
   else if(t==='polyline'||t==='polygon'){const p=(el.getAttribute('points')||'').trim().split(/[\s,]+/).map(parseFloat);seg=[];for(let i=0;i+1<p.length;i+=2)seg.push([i?'L':'M',p[i],p[i+1]]);if(t==='polygon')seg.push(['Z']);}
   else seg=parsePath(el.getAttribute('d')||'');
   if(!seg.length)continue;
   const op=opac(el),fc=t==='line'||t==='polyline'&&false?null:col(st.fill),sc=col(st.stroke);
   const fa=fc?fc.a*(parseFloat(st.fillOpacity)||0)*op:0,sa=sc?sc.a*(parseFloat(st.strokeOpacity)||0)*op:0,sw=pxv(st.strokeWidth);
   const doFill=fc&&fa>0&&t!=='line',doStroke=sc&&sa>0&&sw>0;if(!doFill&&!doStroke)continue;
   apply(ch||chainKids(svg));
   gs(doFill?fa:1,doStroke?sa:1);if(doFill)fillC(fc);
   if(doStroke){strokeC(sc);const sca=Math.sqrt(Math.abs(m.a*m.d-m.b*m.c));const lw=sw*sca*PX;if(cur.lw!==lw){doc.setLineWidth(lw);cur.lw=lw;}
    const cap=st.strokeLinecap||'butt',jn=st.strokeLinejoin||'miter';if(cur.cap!==cap){doc.setLineCap(cap==='square'?'square':cap==='round'?'round':'butt');cur.cap=cap;}
    if(cur.jn!==jn){doc.setLineJoin(jn==='round'?'round':jn==='bevel'?'bevel':'miter');cur.jn=jn;}
    const da=st.strokeDasharray&&st.strokeDasharray!=='none'?st.strokeDasharray.split(/[\s,]+/).map(v=>pxv(v)*sca*PX):null;if(da){doc.setLineDashPattern(da,0);}}
   path(seg,m);const eo=st.fillRule==='evenodd';
   if(doFill&&doStroke)eo?doc.fillStrokeEvenOdd():doc.fillStroke();else if(doFill)eo?doc.fillEvenOdd():doc.fill();else doc.stroke();
   if(doStroke&&st.strokeDasharray&&st.strokeDasharray!=='none')doc.setLineDashPattern([],0);
   stats.shapes++;}}
 /* ---- images : octets d’origine, object-fit, découpe arrondie ---- */
 const IMG=PainterImgCache;
 function image(el,s){if(s.visibility!=='visible')return;const src=el.currentSrc||el.src;if(!src||!el.naturalWidth)throw new Error('Image non décodée');
  const pb=padBox(el,s),pl=pxv(s.paddingLeft),pr=pxv(s.paddingRight),pt=pxv(s.paddingTop),pbm=pxv(s.paddingBottom);
  const cx=pb.x+pl,cy=pb.y+pt,cw=pb.w-pl-pr,chh=pb.h-pt-pbm;if(cw<=0||chh<=0)return;
  const nw=el.naturalWidth,nh=el.naturalHeight,fit=s.objectFit||'fill';let dw=cw,dh=chh;
  if(fit==='cover'||fit==='contain'||fit==='scale-down'||fit==='none'){let k=fit==='cover'?Math.max(cw/nw,chh/nh):fit==='none'?1:Math.min(cw/nw,chh/nh);if(fit==='scale-down')k=Math.min(1,k);dw=nw*k;dh=nh*k;}
  const op=(s.objectPosition||'50% 50%').split(' ').map((v,i)=>/%$/.test(v)?parseFloat(v)/100*((i?chh-dh:cw-dw)):pxv(v));
  const dx=cx+op[0],dy=cy+(op[1]==null?(chh-dh)/2:op[1]);
  const d=IMG.get(src)||imgData(el,src);
  apply(chainSelf(el));doc.saveGraphicsState();reset();path(rrSeg(cx,cy,cw,chh,shrinkR(pb.R,pt,pr,pbm,pl)));doc.clip();doc.discardPath();
  doc.addImage(d.data,d.fmt,dx*PX,dy*PX,dw*PX,dh*PX,d.alias,'NONE');doc.restoreGraphicsState();reset();stats.images++;}
 function imgData(el,src){let d;const m=/^data:image\/(jpeg|jpg|png);base64,/i.exec(src);
  if(m)d={data:src,fmt:/png/i.test(m[1])?'PNG':'JPEG'};
  else{const cv=document.createElement('canvas');cv.width=el.naturalWidth;cv.height=el.naturalHeight;const c=cv.getContext('2d');c.fillStyle='#fff';c.fillRect(0,0,cv.width,cv.height);c.drawImage(el,0,0);d={data:cv.toDataURL('image/jpeg',0.92),fmt:'JPEG'};cv.width=cv.height=0;}
  d.alias='im'+(IMG.size+1);IMG.set(src,d);return d;}
 /* ---- texte réel ---- */
 const AR=window.jspdf.jsPDF.API.processArabic;
 function families(s){return s.fontFamily.split(',').map(f=>f.trim().replace(/^["']|["']$/g,''));}
 function faceFor(u,faces){for(const f of faces)if(f&&f.info.has(u))return f;return null;}
 function textNode(node){const el=node.parentElement;if(!el)return;const s=cs(el);if(s.visibility!=='visible')return;const c=col(s.color);if(!c)return;
  const data=node.data;if(!/\S/.test(data))return;
  const fams=families(s),w=parseInt(s.fontWeight,10)||400,it=s.fontStyle!=='normal',faces=fams.map(f=>FR.pick(f,w,it));
  const prim=faces.find(Boolean);if(!prim)return;const A0=(faces[0]||prim).info.A;
  const fs=pxv(s.fontSize),ls=s.letterSpacing==='normal'?0:pxv(s.letterSpacing),tt=s.textTransform,wm=s.writingMode,vert=wm!=='horizontal-tb';
  const rg=fd.createRange(),ops=[];const re=/\S+/g;let m;
  const rect=(a,b)=>{rg.setStart(node,a);rg.setEnd(node,b);return rg.getClientRects();};
  const xf=t=>tt==='uppercase'?t.toUpperCase():tt==='lowercase'?t.toLowerCase():t;
  let tokIx=0;
  while((m=re.exec(data))){const t0=m.index,str=m[0];const cps=Array.from(str);let segs=[],o=t0;
   for(const ch of cps){const u=ch.codePointAt(0),f=/\s/.test(ch)?null:faceFor(u,faces),ar=isAr(u);const L=segs[segs.length-1];
    if(L&&L.f===f&&L.ar===ar)L.e=o+ch.length;else segs.push({s:o,e:o+ch.length,f,ar});o+=ch.length;}
   /* ponctuation neutre collée à un mot arabe : même segment */
   for(const g of segs){const R=rect(g.s,g.e);if(!R.length)continue;
    if(R.length===1){ops.push({t:xf(data.slice(g.s,g.e)),f:g.f,ar:g.ar,r:R[0],tok:tokIx});continue;}
    let q=g.s;for(const ch of Array.from(data.slice(g.s,g.e))){const r1=rect(q,q+ch.length);if(r1.length)ops.push({t:xf(ch),f:g.f,ar:g.ar,r:r1[0],tok:tokIx,ch:true});q+=ch.length;}}
   tokIx++;}
  /* regroupement des mots d’une même ligne */
  const G=[];for(const op of ops){const L=G[G.length-1];
   const sameLine=L&&L.f===op.f&&L.ar===op.ar&&!op.raster&&(vert?Math.abs(L.r.left-op.r.left)<0.6&&Math.abs(L.r.right-op.r.right)<0.6:Math.abs(L.r.top-op.r.top)<0.6&&Math.abs(L.r.bottom-op.r.bottom)<0.6);
   const ordered=sameLine&&(vert?(wm==='sideways-lr'?op.r.bottom<=L.r.top+0.6:op.r.top>=L.r.bottom-0.6):(op.ar?op.r.right<=L.r.left+0.6:op.r.left>=L.r.right-0.6));
   if(ordered&&L.f){L.t+=(op.tok!==L.tok?' ':'')+op.t;L.tok=op.tok;L.r={left:Math.min(L.r.left,op.r.left),right:Math.max(L.r.right,op.r.right),top:Math.min(L.r.top,op.r.top),bottom:Math.max(L.r.bottom,op.r.bottom)};}
   else G.push({t:op.t,f:op.f,ar:op.ar,tok:op.tok,r:{left:op.r.left,right:op.r.right,top:op.r.top,bottom:op.r.bottom}});}
  const TS=shadows(s.textShadow).filter(q=>q.c).reverse();apply(chainKids(el));
  for(const g of G){if(!g.f){rasterText(g,s,el);continue;}
   for(const q of TS){const cc=Object.assign({},q.c);if(q.bl>0){cc.a*=0.45;stats.blur++;}drawText(g,cc,fs,ls,wm,vert,A0,q.x,q.y);}
   drawText(g,c,fs,ls,wm,vert,A0,0,0);}}
 function drawText(g,c,fs,ls,wm,vert,A0,ox,oy){doc.setFont(g.f.name,'normal');doc.setFontSize(fs*PT);let str=g.t;
  if(g.ar){let sh=AR(str);if(Array.from(sh).some(ch=>!g.f.info.has(ch.codePointAt(0))))stats.arMiss++,sh=Array.from(sh).map((ch,i)=>g.f.info.has(ch.codePointAt(0))?ch:'').join('')||str;
   str=Array.from(sh).reverse().join('');}
  const n=Array.from(str).length,tw=doc.getTextWidth(str),len=(vert?g.r.bottom-g.r.top:g.r.right-g.r.left)*PX,o={baseline:'alphabetic'};
  if(g.ar){const hs=tw>0?len/tw:1;if(hs>0.6&&hs<1.6&&Math.abs(hs-1)>0.002)o.horizontalScale=hs;}
  else if(n){let csp=(len-tw)/n;const lim=Math.max(0.3*fs*PX,Math.abs(ls*PX)*1.5);if(Math.abs(csp)>lim)csp=ls*PX;if(Math.abs(csp)>0.0005)o.charSpace=csp;}
  let x,y;const W=g.r.right-g.r.left,H=g.r.bottom-g.r.top;
  if(!vert){x=g.r.left;y=g.r.top+H*A0;}
  else if(wm==='sideways-lr'){x=g.r.left+W*A0;y=g.r.bottom;o.angle=90;}
  else{x=g.r.right-W*A0;y=g.r.top;o.angle=-90;}
  gs(c.a,c.a);if(cur.t!==c.r+','+c.g+','+c.b){doc.setTextColor(c.r,c.g,c.b);cur.t=c.r+','+c.g+','+c.b;}
  doc.text(str,(x+ox)*PX,(y+oy)*PX,o);cur.f=null;/* la couleur du texte (rg) est aussi la couleur de remplissage */stats.texts++;}
 function rasterText(g,s,el){/* caractère absent des polices embarquées (émoji…) : petite image 300 dpi */
  const W=g.r.right-g.r.left,H=g.r.bottom-g.r.top;if(W<=0||H<=0)return;const S=4,cv=document.createElement('canvas');cv.width=Math.ceil(W*S);cv.height=Math.ceil(H*S);
  const c=cv.getContext('2d');c.scale(S,S);c.font=(s.fontStyle!=='normal'?'italic ':'')+s.fontWeight+' '+s.fontSize+' '+s.fontFamily;c.fillStyle=s.color;c.textBaseline='middle';c.fillText(g.t,0,H/2);
  const u=cv.toDataURL('image/png');cv.width=cv.height=0;doc.addImage(u,'PNG',g.r.left*PX,g.r.top*PX,W*PX,H*PX,undefined,'FAST');stats.raster++;}
 /* ---- ordre d’affichage CSS (contextes d’empilement) ---- */
 function collect(el,flow,ctx){for(const c of el.childNodes){if(c.nodeType===3){flow.push(c);continue;}if(c.nodeType!==1)continue;
   const s=cs(c);if(s.display==='none')continue;
   if(s.position!=='static'||TR.has(c)){const z=s.zIndex==='auto'?0:(+s.zIndex||0);const it={el:c,z,o:ctx.n++};(z<0?ctx.neg:z>0?ctx.pos:ctx.zero).push(it);continue;}
   flow.push(c);if(c.tagName==='svg'||c.tagName==='IMG')continue;collect(c,flow,ctx);}}
 function paintCtx(el){const s=cs(el);
  const ctx={neg:[],zero:[],pos:[],n:0},flow=[];
  box(el,s);if(el.tagName==='svg'){svgShapes(el);return;}if(el.tagName==='IMG'){image(el,s);return;}
  collect(el,flow,ctx);const by=(a,b)=>a.z-b.z||a.o-b.o;ctx.neg.sort(by);ctx.pos.sort(by);
  ctx.neg.forEach(i=>paintCtx(i.el));
  for(const n of flow){if(n.nodeType===3)textNode(n);else{const st=cs(n);box(n,st);if(n.tagName==='svg')svgShapes(n);else if(n.tagName==='IMG')image(n,st);}}
  ctx.zero.forEach(i=>paintCtx(i.el));ctx.pos.forEach(i=>paintCtx(i.el));}
 /* pseudo-éléments ::before/::after → éléments réels (même style calculé) pour être dessinés */
 function pseudos(root){const out=[];for(const el of root.querySelectorAll('*')){if(el.namespaceURI!=='http://www.w3.org/1999/xhtml'||/^(TD|TH|TR|TBODY|THEAD|TABLE|BR|IMG)$/.test(el.tagName))continue;
   for(const ps of ['::before','::after']){const p=cs(el,ps);const ct=p.content;if(!ct||ct==='none'||ct==='normal'||p.display==='none')continue;out.push([el,ps,p]);}}
  for(const [el,ps,p] of out){const n=fd.createElement('cjk-ps');for(let i=0;i<p.length;i++){const k=p[i];if(k==='content')continue;n.style.setProperty(k,p.getPropertyValue(k));}
   const m=p.content.match(/^"([\s\S]*)"$/);if(m&&m[1])n.textContent=m[1].replace(/\\([0-9a-f]{1,6}) ?/gi,(a,h)=>String.fromCodePoint(parseInt(h,16)));
   el.classList.add(ps==='::before'?'cjk-nob':'cjk-noa');if(ps==='::before')el.insertBefore(n,el.firstChild);else el.appendChild(n);}
  stats.pseudo+=out.length;}
 /* transformations CSS : mesurées sans transformation, appliquées par une matrice PDF */
 function transforms(root){const L=[];for(const el of root.querySelectorAll('*')){const s=cs(el);if(s.transform&&s.transform!=='none'&&!(el.namespaceURI==='http://www.w3.org/2000/svg'&&el.tagName!=='svg'))L.push([el,s.transform,s.transformOrigin]);}
  L.forEach(([el])=>el.style.setProperty('transform','none','important'));CS.clear();
  const Hpt=297*72/25.4;
  for(const [el,t,o] of L){const mm=t.match(/matrix(3d)?\(([^)]+)\)/);if(!mm)continue;const v=mm[2].split(',').map(parseFloat);
   const M=mm[1]?{a:v[0],b:v[1],c:v[4],d:v[5],e:v[12],f:v[13]}:{a:v[0],b:v[1],c:v[2],d:v[3],e:v[4],f:v[5]};
   const r=el.getBoundingClientRect(),org=o.split(' ').map(pxv),ox=r.left+org[0],oy=r.top+(org[1]||0);
   /* T(o)·M·T(−o) en px page, puis passage au repère PDF (pt, y vers le haut) */
   const e=ox+M.e-M.a*ox-M.c*oy,f=oy+M.f-M.b*ox-M.d*oy,s=0.75;
   TR.set(el,{m:[M.a,-M.b,-M.c,M.d,M.c*Hpt+s*e,Hpt-M.d*Hpt-s*f]});}
  stats.transforms+=L.length;}
 function page(root){ROOT=root;CS.clear();SELF.clear();KIDS.clear();TR.clear();pseudos(root);transforms(root);CS.clear();
  paintCtx(root);apply([]);}
 return {page};}
const PainterImgCache=new Map();

/* ---------- fichiers (cache hors ligne du service worker) ---------- */
const REQ={logo:'Logo du Ministère de l’Éducation nationale',king:'Portrait officiel de S.M. le Roi',splash:'Illustration de couverture',cover:'Modèle de couverture'};
function need(k,url){return fetch(url).then(r=>{if(!r.ok)throw new Error(String(r.status));return r;}).catch(e=>{throw new Error((REQ[k]||'Fichier')+' introuvable ('+url+') : le cahier n’a pas été créé. Reconnectez-vous une fois à Internet puis réessayez.');});}
function asData(k,url,mime){return need(k,url).then(r=>r.blob()).then(b=>new Promise((res,rej)=>{if(!b.size)return rej(new Error((REQ[k]||url)+' vide'));const f=new FileReader();f.onload=()=>res(String(f.result).replace(/^data:[^;,]*/,'data:'+mime));f.onerror=()=>rej(f.error);f.readAsDataURL(b);}));}
let ASP=null;
const FACES=[['Poppins','cahier/poppins-400.ttf',400,400,0],['Poppins','cahier/poppins-400i.ttf',400,400,1],['Poppins','cahier/poppins-500.ttf',500,500,0],['Poppins','cahier/poppins-600.ttf',600,600,0],
 ['Poppins','cahier/poppins-700.ttf',700,700,0],['Poppins','cahier/poppins-800.ttf',800,800,0],['Poppins','cahier/poppins-800i.ttf',800,800,1],['Poppins','cahier/poppins-900.ttf',900,900,0],['Poppins','cahier/poppins-900i.ttf',900,900,1],
 ['Cairo','vendor/Cairo-Regular.ttf',400,400,0],['Cairo','vendor/Cairo-Bold.ttf',700,900,0],['NaskhAr','vendor/NotoNaskhArabic-Regular.ttf',400,400,0],['NaskhAr','vendor/NotoNaskhArabic-Bold.ttf',700,700,0]];
function assets(){if(ASP)return ASP;
 ASP=Promise.all([asData('logo',DIR+'logo.jpg','image/jpeg'),asData('king',DIR+'roi.jpg','image/jpeg'),asData('splash',DIR+'splash.jpg','image/jpeg'),need('cover',DIR+'cover.html').then(r=>r.text()),
   Promise.all(FACES.map(f=>need('font',f[1]).then(r=>r.arrayBuffer())))])
  .then(([logo,king,splash,cover,fb])=>{
   const faces=FACES.map((f,i)=>({fam:f[0],w0:f[2],w1:f[3],it:!!f[4],name:'F'+i,file:'f'+i+'.ttf',ab:fb[i],info:ttfInfo(fb[i]),url:URL.createObjectURL(new Blob([fb[i]],{type:'font/ttf'}))}));
   const css=faces.map(f=>`@font-face{font-family:'${f.fam}';font-weight:${f.w0===f.w1?f.w0:f.w0+' '+f.w1};font-style:${f.it?'italic':'normal'};src:url(${f.url}) format('truetype')}`).join('');
   return {logo,king,splash,cover,faces,fontCss:css,popCss:css};})
  .catch(e=>{ASP=null;throw e;});
 return ASP;}
function photos(){const A=window.CJR;let all=Promise.resolve({});try{if(A.photoAll)all=A.photoAll();}catch(e){}
 return Promise.resolve(all).catch(()=>({})).then(o=>{o=Object.assign({},o||{});if(o._prof||!A.photo||!A.photo.get)return o;
  return Promise.resolve(A.photo.get('_prof')).then(r=>{if(r&&typeof r.d==='string')o._prof=r.d;return o;}).catch(()=>o);});}

/* ---------- pages ---------- */
const escH=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const okImg=u=>typeof u==='string'&&/^data:image\/(jpeg|jpg|png|webp|gif);base64,/i.test(u);
function coverPage(AS,R,PH){const t=FLATTEN(AS.cover),PF=R.PF,lv=[];R.D.classes.forEach(c=>{const l=c.level||'';if(l&&lv.indexOf(l)<0)lv.push(l);});
 const y0=(R.D.year[0]||'').slice(0,4),V={NAME:(R.CIV+' '+R.TNAME).trim(),ETAB:PF.etab,AREF:PF.aref,PROV:PF.prov,VILLE:PF.ville,NIV:lv.join(' · '),YEAR:y0?y0+' – '+(+y0+1):''};
 let h=t.replace(/\{\{(NAME|ETAB|AREF|PROV|VILLE|NIV|YEAR)\}\}/g,(m,k)=>escH(V[k]||'')).replace('{{LOGO}}',()=>AS.logo).replace('{{SPLASH}}',()=>AS.splash);
 /* photo de profil (même source que la page « Informations ») dans le cercle de l’encadré ; sinon l’icône */
 const ph=PH&&PH._prof;if(okImg(ph))h=h.replace(/<div class="ic">[\s\S]*?<\/svg><\/div>/,()=>'<div class="ic ph"><img src="'+ph+'" alt=""></div>');
 const m=h.match(/<style>([\s\S]*?)<\/style>/);const css=AS.popCss+(m?m[1]:'').replace(/(^|[},\s])body\{/,'$1body,.cjk-root{')+
  '.name .ic.ph{padding:.55mm;overflow:hidden}.name .ic.ph img{width:100%;height:100%;border-radius:50%;object-fit:cover;display:block}';
 h=h.replace(/<!--[\s\S]*?-->/g,'').replace(/<style>[\s\S]*?<\/style>/,'').trim();
 return {id:'cover',h:'<section class="pg" data-id="cover" style="width:210mm;height:297mm;position:relative;overflow:hidden;background:#fff">'+h+'</section>',css};}
function pagesOf(D,GR,PH,AS){const R=R3(D,GR,PH,AS.logo,AS.king,AS.fontCss);R.D=D;const css=FLATTEN(R.css);
 return [coverPage(AS,R,PH)].concat(R.pages.map(p=>({id:p.id,h:FLATTEN(p.h),css})));}
function fileName(D){const y=(D.year[0]||'').slice(0,4);return 'Cahier-journalier-EPS'+(y?'-'+y+'-'+(+y+1):'')+'.pdf';}
const tick=()=>new Promise(r=>setTimeout(r,0));

/* ---------- mise en page dans un iframe caché (même origine) ---------- */
const FIX='html{-webkit-text-size-adjust:100%;text-size-adjust:100%}html,body{margin:0;padding:0;background:#fff}.cjk-nob::before{content:none!important}.cjk-noa::after{content:none!important}';
function frame(css){return new Promise((res,rej)=>{const f=document.createElement('iframe');f.setAttribute('aria-hidden','true');f.tabIndex=-1;
 f.style.cssText='position:fixed;left:-12000px;top:0;width:800px;height:1200px;border:0;pointer-events:none';
 const to=setTimeout(()=>rej(new Error('Mise en page impossible')),20000);
 f.onload=()=>{clearTimeout(to);res(f);};f.srcdoc='<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>'+css+'\n'+FIX+'</style></head><body></body></html>';document.body.appendChild(f);});}
async function fontsReady(f,faces){const d=f.contentDocument;
 await Promise.all(faces.map(x=>d.fonts.load((x.it?'italic ':'')+x.w0+' 16px "'+x.fam+'"',x.fam==='Poppins'?'Aa':'\u0627\u0628')));await d.fonts.ready;
 const bad=[];d.fonts.forEach(ff=>{if(ff.status!=='loaded')bad.push(ff.family+' '+ff.weight);});if(bad.length)throw new Error('Polices non chargées : '+bad.join(', '));}
/* images obligatoires : page → [sélecteur, nom] */
const MUST={cover:[['.logo img','logo'],['.illu img','splash']],king:[['img','king']],back:[['.lg img','logo']]};
async function layout(f,pg){const d=f.contentDocument;d.body.innerHTML=pg.h;const root=d.body.firstElementChild;
 const im=Array.from(d.images);await Promise.all(im.map(i=>(i.complete&&i.naturalWidth?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r;})).then(()=>i.decode?i.decode().catch(()=>{}):0)));
 (MUST[pg.id]||[]).forEach(([sel,k])=>{const i=root.querySelector(sel);const r=i&&i.getBoundingClientRect();
  if(!i||!i.naturalWidth||!r||r.width<1||r.height<1)throw new Error((REQ[k]||k)+' non affiché (page '+pg.id+') : le cahier n’a pas été créé.');});
 im.forEach(i=>{if(!i.naturalWidth)i.style.visibility='hidden';});
 return root;}

async function make(o){o=o||{};const t0=Date.now(),prog=o.onProgress||function(){};
 if(!window.jspdf||!window.jspdf.jsPDF)throw new Error('jsPDF absent');
 const {D,GR}=extract(o.pf||null);const [PH,AS]=await Promise.all([photos(),assets()]);
 const pages=pagesOf(D,GR,PH,AS);const N=pages.length;prog(0,N);
 const pdf=new window.jspdf.jsPDF({unit:'mm',format:'a4',orientation:'portrait',compress:true,precision:3,floatPrecision:3});
 pdf.setProperties({title:'Cahier journalier d’EPS',subject:'Cahier journalier d’EPS',creator:'TATABO3',author:''});
 /* mise en forme arabe et ordre visuel faits ici (comme cj-pdf.js) : on retire ceux de jsPDF */
 const ev=pdf.internal.events,tp=ev.getTopics();Object.keys(tp.preProcessText||{}).forEach(id=>ev.unsubscribe(id));
 Object.keys(tp.postProcessText||{}).forEach(id=>{if(/isInputVisual/.test(String(tp.postProcessText[id][0])))ev.unsubscribe(id);});
 AS.faces.forEach(f=>{pdf.addFileToVFS(f.file,binStr(f.ab));pdf.addFont(f.file,f.name,'normal','normal','Identity-H');});
 const FR=fontReg(AS.faces);PainterImgCache.clear();
 const stats={shapes:0,texts:0,images:0,raster:0,blur:0,grad:0,bgimg:0,pseudo:0,transforms:0,arMiss:0};
 let fc=null,fp=null;
 try{fc=await frame(pages[0].css);fp=await frame(pages[1].css);await fontsReady(fc,AS.faces);await fontsReady(fp,AS.faces);
  for(let i=0;i<N;i++){const f=i===0?fc:fp;const root=await layout(f,pages[i]);
   if(i)pdf.addPage('a4','portrait');Painter(pdf,f.contentWindow,FR,stats).page(root);
   f.contentDocument.body.innerHTML='';pages[i]=null;prog(i+1,N);await tick();}}
 finally{[fc,fp].forEach(f=>{if(f&&f.parentNode)f.parentNode.removeChild(f);});}
 const u=new Uint8Array(pdf.output('arraybuffer'));fixOrdering(u);
 const blob=new Blob([u],{type:'application/pdf'});return {blob,name:fileName(D),pages:N,ms:Date.now()-t0,stats};}
/* jsPDF écrit « /Ordering (Identity-H) » (CIDSystemInfo) : la valeur correcte est « Identity » (même longueur, sans décaler la table xref) */
function fixOrdering(u){const A=Array.from('/Ordering (Identity-H)').map(c=>c.charCodeAt(0)),B=Array.from('/Ordering (Identity)  ').map(c=>c.charCodeAt(0)),n=A.length;
 for(let i=0;i<=u.length-n;i++){if(u[i]!==47||u[i+1]!==79)continue;let k=2;while(k<n&&u[i+k]===A[k])k++;if(k===n){u.set(B,i);i+=n-1;}}}

window.CJCahier={make,extract,pages:function(pf){const x=extract(pf||null);return Promise.all([photos(),assets()]).then(([PH,AS])=>pagesOf(x.D,x.GR,PH,AS));},render:R3,classLevelSort};
})();
