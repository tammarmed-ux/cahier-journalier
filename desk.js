/* TATABO3 1.29.2 (t) — mise en page ORDINATEUR (≥ 1024 px), chargée à la demande par college.js.
   Affichage seulement : aucune donnée, clé, synchronisation, exportation ni importation touchée ; mêmes éléments, mêmes identifiants, mêmes gestionnaires.
   Toutes les règles sont dans @media (min-width:1024px) et sous html.cj-dk : téléphone et tablette en portrait (< 1024 px) inchangés ;
   si ce fichier ne se charge pas, la présentation actuelle reste en place. */
(function(){if(window.CJDesk)return;var D=document,H=D.documentElement;
var css='@media (min-width:1024px){'+
/* ---------- coque : en-tête en haut, navigation latérale, contenu pleine largeur ---------- */
'html.cj-dk{--dk-sb:248px}html.cj-dk body{background-attachment:fixed}'+
'html.cj-dk header.top{padding-left:24px!important;padding-right:120px!important;display:flex;align-items:center;gap:18px}'+
'html.cj-dk header.top .h-title{flex:0 0 auto}html.cj-dk header.top .sub{padding-left:0!important;font-size:13px;opacity:.9;margin:0;border-left:1px solid currentColor;border-color:rgba(255,255,255,.28);padding:2px 0 2px 16px!important}'+
'html.cj-dk nav.tabs{position:fixed!important;top:var(--dk-hh,58px)!important;bottom:0!important;left:0!important;right:auto!important;width:var(--dk-sb);max-width:none!important;margin:0!important;border-radius:0!important;border:0!important;border-right:1px solid var(--t-nav-line,var(--line))!important;box-shadow:none!important;'+
 'display:flex!important;flex-direction:column!important;justify-content:flex-start!important;gap:4px;padding:18px 14px!important;z-index:19;overflow:auto}'+
'html.cj-dk nav.tabs button{flex:0 0 auto!important;width:100%!important;min-height:48px!important;flex-direction:row!important;justify-content:flex-start!important;align-items:center!important;gap:14px!important;'+
 'padding:7px 12px!important;border-radius:14px;font-size:15px!important;letter-spacing:0!important;line-height:1.2!important;text-align:left!important;white-space:nowrap!important;overflow:visible!important;transition:background .15s}'+
'html.cj-dk nav.tabs button:hover{background:color-mix(in srgb,var(--pri) 7%,transparent)}'+
'html.cj-dk nav.tabs button.active{background:color-mix(in srgb,var(--t-nav-act,var(--pri)) 10%,transparent)}'+
'html.cj-dk nav.tabs button .ti{width:38px!important;height:38px!important;border-radius:12px!important;transform:none!important}'+
'html.cj-dk nav.tabs button .ti svg{width:22px!important;height:22px!important}'+
'html.cj-dk nav.tabs:after{content:"TATABO3 · version ordinateur";margin-top:auto;padding:12px 12px 0;font-size:11.5px;color:var(--muted);border-top:1px solid var(--line)}'+
'html.cj-dk main{max-width:none!important;margin:0 0 0 var(--dk-sb)!important;padding:26px 32px 48px!important;min-height:calc(100vh - var(--dk-hh,58px));box-sizing:border-box}'+
'html.cj-dk main>.view{max-width:1560px;margin:0 auto}'+
'html.cj-dk .fab{right:32px!important;bottom:32px!important}'+
'html.cj-dk #updBar{right:28px;bottom:28px}'+
/* ---------- modales : centrées, dimensionnées pour l’ordinateur ---------- */
'html.cj-dk .modal{align-items:center!important;padding:32px;box-sizing:border-box}'+
'html.cj-dk .modal .sheet{max-width:760px;max-height:88vh;border-radius:22px!important;padding:22px 26px 24px!important;box-shadow:0 30px 80px -20px rgba(2,12,30,.55)}'+
'html.cj-dk #detModal .sheet,html.cj-dk #testModal .sheet,html.cj-dk #grpModal .sheet,html.cj-dk #trombiModal .sheet{max-width:1040px}'+
'html.cj-dk .pq-sheet{max-width:860px!important;left:50%!important;right:auto!important;transform:translateX(-50%)}'+
/* ---------- Accueil : tableau de bord (6 pistes ; rien de coupé, tuiles de même hauteur) ---------- */
'html.cj-dk #homeBody{display:grid;container:dkhome / inline-size;grid-template-columns:repeat(6,minmax(0,1fr));grid-template-areas:"hero hero hero hero today today" "qh qh qh qh today today" "quick quick quick quick today today" "stats stats stats stats cmp cmp" "stats stats stats stats watch watch" "tt tt tt cal cal cal";column-gap:22px;align-items:start}'+
'html.cj-dk #homeBody>*{margin-bottom:20px;min-width:0}'+
'html.cj-dk #homeHero{grid-area:hero}html.cj-dk #homeBody>.qa-h{grid-area:qh;margin-bottom:8px}'+
'html.cj-dk #homeToday{grid-area:today;align-self:stretch;margin-bottom:20px}html.cj-dk #homeCmp{grid-area:cmp}html.cj-dk #homeWatch{grid-area:watch;align-self:start}html.cj-dk #homeStats{grid-area:stats}'+
'html.cj-dk #ttCard{grid-area:tt;align-self:stretch}html.cj-dk #homeCal{grid-area:cal;align-self:stretch;container-type:inline-size}'+
/* accès rapide : 3 × 2, 6 sur une ligne seulement quand la place suffit ; titres et sous-titres entiers */
'html.cj-dk #homeQuick{grid-area:quick;grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:12px!important}'+
'@container dkhome (min-width:1500px){html.cj-dk #homeQuick{grid-template-columns:repeat(6,minmax(0,1fr))!important}}'+
'html.cj-dk #homeQuick .qa{min-width:0;height:100%;box-sizing:border-box}'+
'html.cj-dk #homeQuick .qa b,html.cj-dk #homeQuick .qa span{max-width:100%;white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:break-word}'+
/* statistiques globales : tuiles d’au moins 176 px, pastilles qui passent à la ligne */
'html.cj-dk #homeStats .hs-grid{grid-template-columns:repeat(auto-fill,minmax(176px,1fr))!important}html.cj-dk #homeStats .hs.wide{grid-column:auto!important}'+
'html.cj-dk #homeStats .hs-b{white-space:normal;max-width:100%;box-sizing:border-box;line-height:1.3}html.cj-dk #homeStats .hs-l{overflow-wrap:break-word;min-width:0}html.cj-dk #homeStats .hs-top{min-width:0;flex-wrap:wrap}'+
/* calendrier des cycles : 1 colonne, 2 quand la carte est large */
'html.cj-dk #homeCal .hc-list>.hc-sep{grid-column:1 / -1}html.cj-dk #homeCal .hc-t{white-space:normal;overflow:visible;text-overflow:clip}'+
'@container (min-width:640px){html.cj-dk #homeCal .hc-list{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:14px}}'+
/* aujourd’hui : « Prochain cycle : Cycle 2 – …, à partir du … » d’une seule phrase */
'html.cj-dk #homeToday .curcyc{display:block}html.cj-dk #homeToday .curcyc b{display:inline}'+
/* emploi du temps : même style que « Calendrier des cycles » (contenu et comportement inchangés) */
'html.cj-dk #ttCard .tw-h{flex-wrap:wrap;row-gap:8px}html.cj-dk #ttCard .tw-h h2{flex:1 1 auto;margin:0;white-space:nowrap}'+
'html.cj-dk #ttCard .tw-add{min-height:36px!important;height:auto;font-size:13.5px!important;padding:0 14px 0 10px!important;margin-left:auto;border-radius:999px;flex:0 0 auto}html.cj-dk #ttCard .tw-add svg{width:16px;height:16px}'+
'html.cj-dk #ttCard .svc{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--ok);border-radius:12px;padding:9px 12px;margin:10px 0 8px}html.cj-dk #ttCard .svc.bad{border-left-color:var(--warn)}'+
'html.cj-dk #ttCard .svc-main{font-size:14px}html.cj-dk #ttCard .svc-main b{font-size:16px}html.cj-dk #ttCard #svcTot{white-space:nowrap}'+
'html.cj-dk #ttCard .tw-chip{border-radius:12px;min-height:48px}'+
'html.cj-dk #ttCard .tw-card{position:relative;border-left-width:4px;border-radius:12px;padding:9px 10px 9px 54px;min-height:50px;box-sizing:border-box;box-shadow:none}'+
'html.cj-dk #ttCard .tw-card:before{content:"";position:absolute;left:12px;top:50%;margin-top:-16px;width:32px;height:32px;border-radius:9px;background:color-mix(in srgb,var(--c) 16%,var(--card,#fff))}'+
'html.cj-dk #ttCard .tw-card:after{content:"";position:absolute;left:19px;top:50%;margin-top:-9px;width:18px;height:18px;background:var(--c);-webkit-mask:url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2%27/%3E%3Ccircle cx=%279%27 cy=%277%27 r=%274%27/%3E%3Cpath d=%27M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75%27/%3E%3C/svg%3E\") center/contain no-repeat;mask:url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2%27/%3E%3Ccircle cx=%279%27 cy=%277%27 r=%274%27/%3E%3Cpath d=%27M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75%27/%3E%3C/svg%3E\") center/contain no-repeat}'+
'html.cj-dk #ttCard .lv-as .tw-card:after{-webkit-mask-image:url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3%27/%3E%3C/svg%3E\");mask-image:url(\"data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27black%27 stroke-width=%272.2%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpath d=%27M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3%27/%3E%3C/svg%3E\")}'+
'html.cj-dk #ttCard .tw-r1{min-width:0}html.cj-dk #ttCard .tw-main b{font-size:14px;font-weight:700;white-space:normal;overflow-wrap:anywhere}'+
'html.cj-dk #ttCard .tw-lv{font-size:10.5px;font-weight:800;letter-spacing:.04em;padding:2px 7px;color:#fff}html[data-theme="neon"].cj-dk #ttCard .tw-lv{color:#0b0b14}'+
'html.cj-dk #ttCard .tw-meta{font-size:12px;margin-top:3px}'+
/* ---------- Absences / Note procédurale : grille pleine largeur ---------- */
'html.cj-dk #gridWrap table.grid th.holh,html.cj-dk #gridWrap table.grid td.holc{width:30px;min-width:30px}'+
'html.cj-dk #procWrap input.pin{max-width:118px;margin:0 auto;display:block}'+
/* tous les élèves à pleine hauteur, la page défile ; en-tête des séances collé sous l’en-tête de l’application,
   colonne des noms collée, ligne « Absents · Moy. » collée en bas ; défilement horizontal seulement si la grille est plus large */
'html.cj-dk .gridcard{overflow:clip!important}html.cj-dk .gridwrap{max-height:none!important;overscroll-behavior:auto}'+
'html.cj-dk .gridwrap.dk-fit{overflow:visible!important}html.cj-dk .gridwrap.dk-fit table.grid thead th{top:var(--dk-hh,58px)}'+
'html.cj-dk #gridWrap table.grid .nm,html.cj-dk #procWrap table.grid .nm{width:190px;min-width:190px;max-width:190px}'+
'html.cj-dk #view-attendance>.card:first-child,html.cj-dk #view-proc>.card:first-child{padding:16px 20px}'+
/* ---------- fiche élève et tests physiques ---------- */
'html.cj-dk #detBody .ptests{grid-template-columns:repeat(4,minmax(0,1fr))!important}html.cj-dk #detBody>.stats{grid-template-columns:repeat(8,minmax(0,1fr))!important}'+
'html.cj-dk #testBody ul.list.gedit{columns:2;column-gap:28px}html.cj-dk #testBody ul.list.gedit>li{break-inside:avoid}'+
/* ---------- Élèves : grille de fiches ---------- */
'html.cj-dk #stuList{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px;padding:4px}'+
'html.cj-dk #stuList>li{margin:0;border:1px solid var(--line);border-radius:14px}'+
'html.cj-dk #stuList .stu .name,#stuList .stu .meta{white-space:normal;overflow:visible;text-overflow:clip}'+
'html.cj-dk #stuList>li.stu-more{grid-column:1 / -1;border:0!important;border-radius:0;background:none!important;box-shadow:none!important;justify-self:stretch;text-align:center;padding:12px 0 6px}'+
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
'html.cj-dk .ps-tx small{white-space:normal;overflow:visible;text-overflow:clip}'+
'html.cj-dk .hy-l{display:block;-webkit-line-clamp:none;overflow:visible}html.cj-dk .hy-top .chip{white-space:normal;max-width:100%;box-sizing:border-box}'+
'}'+
/* ---------- 1024–1199 px : barre latérale compacte (icône + libellé) pour laisser la place au contenu ---------- */
'@media (min-width:1024px) and (max-width:1199.98px){html.cj-dk{--dk-sb:96px}'+
'html.cj-dk nav.tabs{padding:12px 8px!important;gap:2px}html.cj-dk nav.tabs:after{display:none}'+
'html.cj-dk nav.tabs button{flex-direction:column!important;justify-content:center!important;gap:4px!important;padding:8px 2px!important;min-height:66px!important;font-size:11.5px!important;text-align:center!important;white-space:normal!important}'+
'html.cj-dk nav.tabs button .ti{width:34px!important;height:34px!important}'+
'html.cj-dk main{padding:22px 24px 44px!important}}';
var st=D.createElement('style');st.id='deskCss';st.textContent=css;D.head.appendChild(st);
/* rubrique ouverte surlignée dans la liste */
var rs='@media (min-width:1024px){';['sync','sec','cls','pts','annee','hol','pdf','bk','snap','theme','mod','onb','dz'].forEach(function(k){rs+='html.cj-dk #view-settings[data-psv="'+k+'"] [data-ps-open="'+k+'"]{background:color-mix(in srgb,var(--pri) 10%,transparent);box-shadow:inset 3px 0 0 var(--pri)}';});
st.textContent+=rs+'}';
/* hauteur réelle de l’en-tête (variable CSS, sans toucher aux éléments) */
var hd=D.querySelector('header.top');function hh(){if(hd)H.style.setProperty('--dk-hh',hd.offsetHeight+'px');}
hh();if(window.ResizeObserver&&hd)new ResizeObserver(hh).observe(hd);
/* grilles Absences / Note procéd. : « dk-fit » quand la grille tient en largeur (pas de défilement interne) */
function fit(w){var t=w.querySelector('table');w.classList.toggle('dk-fit',!!t&&t.offsetWidth<=w.clientWidth+1);}
function fitAll(){var g=D.querySelectorAll('.gridwrap');for(var i=0;i<g.length;i++)fit(g[i]);}
(function(){var g=D.querySelectorAll('.gridwrap');for(var i=0;i<g.length;i++)(function(w){if(window.MutationObserver)new MutationObserver(function(){fit(w);}).observe(w,{childList:true});if(window.ResizeObserver)new ResizeObserver(function(){fit(w);}).observe(w);})(g[i]);})();
window.addEventListener('resize',fitAll);
H.classList.add('cj-dk');fitAll();window.CJDesk={v:2};})();
