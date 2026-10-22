/* TATABO3 1.29.2 (s) — mise en page ORDINATEUR (≥ 1024 px), chargée à la demande par college.js.
   Affichage seulement : aucune donnée, clé, synchronisation, exportation ni importation touchée ; mêmes éléments, mêmes identifiants, mêmes gestionnaires.
   Toutes les règles sont dans @media (min-width:1024px) et sous html.cj-dk : téléphone et tablette en portrait (< 1024 px) inchangés ;
   si ce fichier ne se charge pas, la présentation actuelle reste en place. */
(function(){if(window.CJDesk)return;var D=document,H=D.documentElement;
var SB=248;  /* largeur de la barre latérale */
var css='@media (min-width:1024px){'+
/* ---------- coque : en-tête en haut, navigation latérale, contenu pleine largeur ---------- */
'html.cj-dk body{background-attachment:fixed}'+
'html.cj-dk header.top{padding-left:24px!important;padding-right:120px!important;display:flex;align-items:center;gap:18px}'+
'html.cj-dk header.top .h-title{flex:0 0 auto}html.cj-dk header.top .sub{padding-left:0!important;font-size:13px;opacity:.9;margin:0;border-left:1px solid currentColor;border-color:rgba(255,255,255,.28);padding:2px 0 2px 16px!important}'+
'html.cj-dk nav.tabs{position:fixed!important;top:var(--dk-hh,58px)!important;bottom:0!important;left:0!important;right:auto!important;width:'+SB+'px;max-width:none!important;margin:0!important;border-radius:0!important;border:0!important;border-right:1px solid var(--t-nav-line,var(--line))!important;box-shadow:none!important;'+
 'display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:4px;padding:18px 14px!important;z-index:19;overflow:auto}'+
'html.cj-dk nav.tabs button{flex:0 0 auto!important;width:100%!important;min-height:48px!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:14px!important;'+
 'padding:7px 12px!important;border-radius:14px;font-size:15px!important;letter-spacing:0!important;line-height:1.2!important;text-align:left!important;white-space:nowrap!important;overflow:visible!important;transition:background .15s}'+
'html.cj-dk nav.tabs button:hover{background:color-mix(in srgb,var(--pri) 7%,transparent)}'+
'html.cj-dk nav.tabs button.active{background:color-mix(in srgb,var(--t-nav-act,var(--pri)) 10%,transparent)}'+
'html.cj-dk nav.tabs button .ti{width:38px!important;height:38px!important;border-radius:12px!important;transform:none!important}'+
'html.cj-dk nav.tabs button .ti svg{width:22px!important;height:22px!important}'+
'html.cj-dk nav.tabs:after{content:"TATABO3 · version ordinateur";margin-top:auto;padding:12px 12px 0;font-size:11.5px;color:var(--muted);border-top:1px solid var(--line)}'+
'html.cj-dk main{max-width:none!important;margin:0 0 0 '+SB+'px!important;padding:26px 32px 48px!important;min-height:calc(100vh - var(--dk-hh,58px));box-sizing:border-box}'+
'html.cj-dk main>.view{max-width:1560px;margin:0 auto}'+
'html.cj-dk .fab{right:32px!important;bottom:32px!important}'+
'html.cj-dk #updBar{right:28px;bottom:28px}'+
/* ---------- modales : centrées, dimensionnées pour l’ordinateur ---------- */
'html.cj-dk .modal{align-items:center!important;padding:32px;box-sizing:border-box}'+
'html.cj-dk .modal .sheet{max-width:760px;max-height:88vh;border-radius:22px!important;padding:22px 26px 24px!important;box-shadow:0 30px 80px -20px rgba(2,12,30,.55)}'+
'html.cj-dk #detModal .sheet,html.cj-dk #testModal .sheet,html.cj-dk #grpModal .sheet,html.cj-dk #trombiModal .sheet{max-width:1040px}'+
'html.cj-dk .pq-sheet{max-width:860px!important;left:50%!important;right:auto!important;transform:translateX(-50%)}'+
/* ---------- Accueil : tableau de bord ---------- */
'html.cj-dk #homeBody{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,1fr);grid-template-areas:"hero hero today" "qh qh today" "quick quick today" "stats stats cmp" "stats stats watch" "tt cal cal";column-gap:22px;align-items:start}'+
'html.cj-dk #homeStats .hs-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important}html.cj-dk #homeStats .hs.wide{grid-column:span 2!important}'+
'html.cj-dk #homeCal .hc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px}html.cj-dk #homeCal .hc-list>.hc-sep{grid-column:1 / -1}'+
'html.cj-dk #homeWatch{align-self:start}'+
'html.cj-dk #homeBody>*{margin-bottom:20px;min-width:0}'+
'html.cj-dk #homeHero{grid-area:hero}html.cj-dk #homeBody>.qa-h{grid-area:qh;margin-bottom:8px}html.cj-dk #homeQuick{grid-area:quick;grid-template-columns:repeat(6,minmax(0,1fr))!important;gap:12px!important}'+
'html.cj-dk #homeToday{grid-area:today;align-self:stretch;margin-bottom:20px}html.cj-dk #ttCard{grid-area:tt}html.cj-dk #homeCmp{grid-area:cmp}html.cj-dk #homeWatch{grid-area:watch}html.cj-dk #homeStats{grid-area:stats}html.cj-dk #homeCal{grid-area:cal}'+
/* ---------- Absences / Note procédurale : grille pleine largeur ---------- */
'html.cj-dk #gridWrap table.grid th.holh,html.cj-dk #gridWrap table.grid td.holc{width:30px;min-width:30px}'+
'html.cj-dk #procWrap input.pin{max-width:118px;margin:0 auto;display:block}'+
'html.cj-dk #view-attendance>.card:first-child,html.cj-dk #view-proc>.card:first-child{padding:16px 20px}'+
/* ---------- fiche élève et tests physiques ---------- */
'html.cj-dk #detBody .ptests{grid-template-columns:repeat(4,minmax(0,1fr))!important}html.cj-dk #detBody>.stats{grid-template-columns:repeat(8,minmax(0,1fr))!important}'+
'html.cj-dk #testBody ul.list.gedit{columns:2;column-gap:28px}html.cj-dk #testBody ul.list.gedit>li{break-inside:avoid}'+
/* ---------- Élèves : grille de fiches ---------- */
'html.cj-dk #stuList{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:4px}'+
'html.cj-dk #stuList>li{margin:0;border:1px solid var(--line);border-radius:14px}'+
/* ---------- Rapports : réglages et alertes à gauche, bilan à droite ---------- */
'html.cj-dk #view-reports.active{display:grid;grid-template-columns:380px minmax(0,1fr);column-gap:22px;align-items:start}'+
'html.cj-dk #view-reports>*{grid-column:2}html.cj-dk #view-reports>.card:first-of-type{grid-column:1;grid-row:1;position:sticky;top:calc(var(--dk-hh,58px) + 18px)}'+
'html.cj-dk #view-reports>#repAlerts{grid-column:1;grid-row:2}'+
/* ---------- Paramètres : liste à gauche, rubrique à droite ---------- */
'html.cj-dk #view-settings.active{display:grid;grid-template-columns:360px minmax(0,1fr);column-gap:28px;align-items:start}'+
'html.cj-dk #view-settings>*{grid-column:2;min-width:0}'+
'html.cj-dk #view-settings>#psList{display:block!important;grid-column:1;grid-row:1 / span 40;position:sticky;top:calc(var(--dk-hh,58px) + 18px);max-height:calc(100vh - var(--dk-hh,58px) - 36px);overflow:auto;padding-right:4px}'+
'html.cj-dk #view-settings>#psHead{display:block!important}html.cj-dk #view-settings #psBack{display:none!important}'+
'html.cj-dk #view-settings:not(.ps-sub)>#psHead #psTitle:before{content:"Choisissez une rubrique dans la liste"}'+
'html.cj-dk #view-settings:not(.ps-sub)>#psHead{padding:80px 20px;text-align:center;color:var(--muted);border:2px dashed var(--line);border-radius:22px;margin-top:52px}'+
'html.cj-dk #view-settings>p{grid-column:1 / -1}'+
'}';
var st=D.createElement('style');st.id='deskCss';st.textContent=css;D.head.appendChild(st);
/* rubrique ouverte surlignée dans la liste */
var rs='@media (min-width:1024px){';['sync','sec','cls','pts','annee','hol','pdf','bk','snap','theme','mod','onb','dz'].forEach(function(k){rs+='html.cj-dk #view-settings[data-psv="'+k+'"] [data-ps-open="'+k+'"]{background:color-mix(in srgb,var(--pri) 10%,transparent);box-shadow:inset 3px 0 0 var(--pri)}';});
st.textContent+=rs+'}';
/* hauteur réelle de l’en-tête (variable CSS, sans toucher aux éléments) */
var hd=D.querySelector('header.top');function hh(){if(hd)H.style.setProperty('--dk-hh',hd.offsetHeight+'px');}
hh();if(window.ResizeObserver&&hd)new ResizeObserver(hh).observe(hd);
H.classList.add('cj-dk');window.CJDesk={v:1};})();
