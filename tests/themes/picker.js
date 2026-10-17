/* 1.29.1 (-f/-g) : sélecteur de thème (Actuel, Vert terrain, Néon sport ; une valeur retirée — clair, verre — ou inconnue revient à Actuel) — préférence d’affichage locale (clé « cj.theme »), n’altère aucune donnée (classRegister.v2, synchro, exports, chiffrement, PDF inchangés) */
(function(){var K='cj.theme',M=__META__,L=[
 {id:'',n:'Actuel',d:'Bleu & orange (par défaut)',sw:'linear-gradient(135deg,#0B3A6E 0 50%,#E85D04 50% 100%)'},
 {id:'terrain',n:'Vert terrain',d:'Vert pelouse, accent jaune',sw:'linear-gradient(135deg,#1C6B3A 0 50%,#FACC15 50% 100%)'},
 {id:'neon',n:'Néon sport',d:'Sombre, vert citron et cyan',sw:'linear-gradient(135deg,#0A0A12 0 50%,#C6FF00 50% 100%)'}];
 function ok(t){for(var i=0;i<L.length;i++)if(L[i].id===t)return true;return false;}
 function cur(){var t='';try{t=localStorage.getItem(K)||'';}catch(e){}return ok(t)?t:'';}
 function apply(t){var h=document.documentElement;if(t)h.setAttribute('data-theme',t);else h.removeAttribute('data-theme');var m=document.querySelector('meta[name="theme-color"]');if(m)m.setAttribute('content',M[t]||'#0B3A6E');}
 function html(c){return L.map(function(o){return '<button type="button" class="thopt" role="radio" aria-checked="'+(o.id===c)+'" data-th="'+o.id+'"><span class="thsw" style="background:'+o.sw+'"></span><span class="thn">'+o.n+'<small>'+o.d+'</small></span><span class="thck" aria-hidden="true">✓</span></button>';}).join('');}
 function render(){var c=cur(),a=document.getElementById('thList'),b=document.getElementById('themeSw');if(a)a.innerHTML=html(c);if(b)b.innerHTML=html(c);}
 function set(t){if(!ok(t))t='';try{if(t)localStorage.setItem(K,t);else localStorage.removeItem(K);}catch(e){}apply(t);render();}
 function pop(){return document.getElementById('thPop');}
 function close(){var p=pop(),b=document.getElementById('themeBtn');if(p)p.classList.remove('open');if(b)b.setAttribute('aria-expanded','false');}
 function open(){var p=pop(),b=document.getElementById('themeBtn');if(!p)return;render();p.classList.add('open');if(b)b.setAttribute('aria-expanded','true');var s=p.querySelector('[aria-checked="true"]');if(s)try{s.focus({preventScroll:true});}catch(e){}}
 document.addEventListener('click',function(e){var o=e.target.closest&&e.target.closest('[data-th]');if(o){var inPop=!!o.closest('#thPop');set(o.getAttribute('data-th'));if(inPop)close();return;}
   if(e.target.closest&&e.target.closest('#themeBtn')){var p=pop();if(p&&p.classList.contains('open'))close();else open();return;}
   if(!(e.target.closest&&e.target.closest('#thPop')))close();});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
 apply(cur());render();window.CJTheme={set:set,get:cur,list:function(){return L.map(function(o){return o.id;});},open:open,close:close};})();
