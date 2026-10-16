/* Cahier d’EPS 1.29.0 — chiffrement local (AES-256-GCM) protégé par un code d’accès.
   - Clé de données (DEK) aléatoire 256 bits, AES-GCM, IV 96 bits neuf à chaque écriture, données associées = nom de la clé.
   - DEK enveloppée par une clé dérivée du code (PBKDF2-SHA-256, 600 000 itérations, sel aléatoire 128 bits) ; métadonnées dans « classRegister.crypto ».
   - Mêmes noms de clés : seule la VALEUR des clés personnelles devient une enveloppe {"v":1,"alg":"AES-GCM","z":"deflate-raw","iv":…,"ct":…}.
   - Sans code activé (aucune métadonnée), rien ne change : les scripts de l’application s’exécutent exactement comme avant. */
(function(){
'use strict';
var KEY='classRegister.v2',CKEY='classRegister.crypto',MKEY=KEY+'.sync',ITER=600000,PIN_MIN=6;
var LS=null;try{LS=window.localStorage;}catch(e){}
var SP=window.Storage&&Storage.prototype,oGet=SP&&SP.getItem,oSet=SP&&SP.setItem,oRem=SP&&SP.removeItem,oKey=SP&&SP.key;
var subtle=window.crypto&&window.crypto.subtle;
var HAS_Z=typeof window.CompressionStream==='function'&&typeof window.DecompressionStream==='function'&&(function(){try{new CompressionStream('deflate-raw');return true;}catch(e){return false;}})();
var ENV_HEAD='{"v":1,"alg":"AES-GCM"';
/* clés localStorage qui contiennent des données personnelles (élèves, notes, codes Massar…) */
function isProt(k){k=String(k);return k===KEY||k===KEY+'.corrupt'||k.indexOf(KEY+'.snap.')===0||k.indexOf(KEY+'.backup.')===0;}
function rawGet(k){try{return oGet.call(LS,k);}catch(e){return null;}}
function rawKeys(){var a=[];try{for(var i=0;i<LS.length;i++){var k=oKey.call(LS,i);if(k!=null)a.push(k);}}catch(e){}return a;}
function readMeta(){try{var m=JSON.parse(rawGet(CKEY)||'null');return m&&m.v===1&&m.wrap?m:null;}catch(e){return null;}}
function writeMeta(m){oSet.call(LS,CKEY,JSON.stringify(m));}
/* ---------- utilitaires ---------- */
var TE=new TextEncoder(),TD=new TextDecoder();
function b64(u8){u8=u8 instanceof Uint8Array?u8:new Uint8Array(u8);var s='',C=0x8000;for(var i=0;i<u8.length;i+=C)s+=String.fromCharCode.apply(null,u8.subarray(i,i+C));return btoa(s);}
function unb64(s){var b=atob(s),u=new Uint8Array(b.length);for(var i=0;i<b.length;i++)u[i]=b.charCodeAt(i);return u;}
function rnd(n){var u=new Uint8Array(n);crypto.getRandomValues(u);return u;}
function pipe(u8,T){var s=new Blob([u8]).stream().pipeThrough(T);return new Response(s).arrayBuffer().then(function(b){return new Uint8Array(b);});}
function isEnv(s){return typeof s==='string'&&s.lastIndexOf(ENV_HEAD,0)===0;}
function now(){return Date.now();}
/* ---------- clés ---------- */
function kek(pin,salt,it){return subtle.importKey('raw',TE.encode(String(pin)),'PBKDF2',false,['deriveKey']).then(function(base){
  return subtle.deriveKey({name:'PBKDF2',hash:'SHA-256',salt:salt,iterations:it},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt']);});}
function wrapRaw(k,raw,aad){var iv=rnd(12);return subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:TE.encode(aad)},k,raw).then(function(ct){return {iv:b64(iv),ct:b64(ct)};});}
function unwrapRaw(k,w,aad){return subtle.decrypt({name:'AES-GCM',iv:unb64(w.iv),additionalData:TE.encode(aad)},k,unb64(w.ct)).then(function(b){return new Uint8Array(b);});}
function dekKey(raw){return subtle.importKey('raw',raw,{name:'AES-GCM'},false,['encrypt','decrypt']);}
var DEK=null;   /* CryptoKey non extractible, en mémoire seulement pendant que l’application est déverrouillée */
/* ---------- enveloppes ---------- */
function sealWith(key,name,str){var u=TE.encode(str);return (HAS_Z?pipe(u,new CompressionStream('deflate-raw')):Promise.resolve(u)).then(function(z){var iv=rnd(12);
  return subtle.encrypt({name:'AES-GCM',iv:iv,additionalData:TE.encode(name)},key,z).then(function(ct){
    return ENV_HEAD+(HAS_Z?',"z":"deflate-raw"':'')+',"iv":"'+b64(iv)+'","ct":"'+b64(ct)+'"}';});});}
function openWith(key,name,env){var o=JSON.parse(env);if(!o||o.v!==1||o.alg!=='AES-GCM')return Promise.reject(new Error('enveloppe inconnue'));
  return subtle.decrypt({name:'AES-GCM',iv:unb64(o.iv),additionalData:TE.encode(name)},key,unb64(o.ct)).then(function(b){b=new Uint8Array(b);
    return o.z==='deflate-raw'?pipe(b,new DecompressionStream('deflate-raw')):b;}).then(function(u){return TD.decode(u);});}
function seal(name,str){return sealWith(DEK,name,str);}
function open(name,env){return openWith(DEK,name,env);}
/* ---------- état ---------- */
var META=readMeta(),MODE=META?'locked':'plain',CACHE={},GEN={},DIRTY={},BUSY=false,WAIT=[],LAST_ERR='',BAD=[];
var hiddenAt=0;
/* ---------- couche localStorage (uniquement quand le chiffrement est actif et déverrouillé) ---------- */
function own(o,k){return Object.prototype.hasOwnProperty.call(o,k);}
function install(){
  SP.getItem=function(k){if(this===LS&&MODE==='open'&&isProt(k)){k=String(k);return own(CACHE,k)?CACHE[k]:null;}return oGet.call(this,k);};
  SP.setItem=function(k,v){if(this===LS&&MODE==='open'&&isProt(k)){k=String(k);CACHE[k]=String(v);queue(k);return;}return oSet.call(this,k,v);};
  SP.removeItem=function(k){if(this===LS&&MODE==='open'&&isProt(k)){k=String(k);delete CACHE[k];GEN[k]=(GEN[k]||0)+1;delete DIRTY[k];return oRem.call(this,k);}return oRem.call(this,k);};
}
function uninstall(){SP.getItem=oGet;SP.setItem=oSet;SP.removeItem=oRem;}
function queue(k){GEN[k]=(GEN[k]||0)+1;DIRTY[k]=1;if(!BUSY){BUSY=true;Promise.resolve().then(pump);}}   /* démarre tout de suite (avant une éventuelle mise en veille d’iOS) */
function idle(){var w=WAIT;WAIT=[];w.forEach(function(f){f();});}
function pump(){var ks=Object.keys(DIRTY);if(!ks.length||MODE!=='open'){BUSY=false;idle();return;}
  var k=ks[0],g=GEN[k],v=CACHE[k];delete DIRTY[k];if(v==null){pump();return;}
  seal(k,v).then(function(env){if(GEN[k]!==g||MODE!=='open')return;writeEnv(k,env);}).catch(function(e){LAST_ERR='chiffrement\u00a0: '+(e&&e.message||e);warn();DIRTY[k]=1;})
    .then(function(){setTimeout(pump,0);});}
/* écriture atomique : un seul setItem remplace l’ancienne valeur ; stockage plein → on libère le plus ancien instantané (comme persistNow) */
function writeEnv(k,env){for(var tr=0;tr<12;tr++){try{oSet.call(LS,k,env);return true;}catch(e){if(!freeSnap(k))break;}}
  LAST_ERR='stockage plein\u00a0: «\u00a0'+k+'\u00a0» non enregistré';warn();return false;}
function freeSnap(except){var P=KEY+'.snap.',ts=rawKeys().filter(function(k){return k.indexOf(P)===0&&k!==except;}).map(function(k){return +k.slice(P.length);}).filter(Boolean).sort(function(a,b){return a-b;});
  if(!ts.length)return false;var t=ts[0];try{oRem.call(LS,P+t);oRem.call(LS,KEY+'.snapm.'+t);}catch(e){}delete CACHE[P+t];return true;}
function flush(){return new Promise(function(res){if(!BUSY&&!Object.keys(DIRTY).length)res();else{WAIT.push(res);if(!BUSY){BUSY=true;setTimeout(pump,0);}}});}
function warn(){try{console.warn('CJCrypto',LAST_ERR);if(window.CJApp&&CJApp.toast)CJApp.toast('⚠ '+LAST_ERR);}catch(e){}}
/* ---------- IndexedDB : photos (champ d) et instantanés de repli (champ data) ---------- */
function idbOpen(name){return new Promise(function(res,rej){var r;try{r=indexedDB.open(name);}catch(e){rej(e);return;}
  r.onupgradeneeded=function(){/* base absente : ne rien créer ici */r.transaction.abort();};r.onsuccess=function(){res(r.result);};r.onerror=function(){res(null);};r.onblocked=function(){res(null);};});}
function idbAll(db,st){return new Promise(function(res){if(!db||!db.objectStoreNames.contains(st)){res([]);return;}var q=db.transaction(st,'readonly').objectStore(st).getAll();q.onsuccess=function(){res(q.result||[]);};q.onerror=function(){res([]);};});}
function idbPutAll(db,st,recs){return new Promise(function(res,rej){if(!recs.length){res();return;}var t=db.transaction(st,'readwrite'),o=t.objectStore(st);recs.forEach(function(r){o.put(r);});t.oncomplete=function(){res();};t.onerror=t.onabort=function(){rej(t.error||new Error('IndexedDB'));};});}
function phSeal(v){if(MODE!=='open'||!v||typeof v.d!=='string')return Promise.resolve(v);return seal('ph:'+v.id,v.d).then(function(e){return {id:v.id,t:v.t,e:e};});}
function phOpen(r){if(!r||typeof r.e!=='string')return Promise.resolve(r);if(MODE!=='open')return Promise.resolve({id:r.id,t:r.t,d:null});
  return open('ph:'+r.id,r.e).then(function(d){return {id:r.id,d:d,t:r.t};},function(){return {id:r.id,t:r.t,d:null};});}
function snapSeal(t,raw){if(MODE!=='open'||typeof raw!=='string')return Promise.resolve(raw);return seal('snap:'+t,raw);}
function snapOpen(t,data){if(!isEnv(data)||MODE!=='open')return Promise.resolve(data);return open('snap:'+t,data).catch(function(){return null;});}
/* ---------- déverrouillage ---------- */
var DELAYS=[0,0,0,0,30,60,300,900,3600];   /* secondes d’attente après le n-ième échec (aucun effacement) */
function delayFor(n){return (n<DELAYS.length?DELAYS[n]:3600)*1000;}
function waitLeft(){var m=readMeta();return m&&m.until?Math.max(0,m.until-now()):0;}
function tryPin(pin){var m=readMeta();if(!m)return Promise.reject(new Error('nometa'));if(waitLeft())return Promise.reject(new Error('wait'));
  return kek(pin,unb64(m.salt),m.it).then(function(k){return unwrapRaw(k,m.wrap,'cj-dek-v1');}).then(function(raw){
    var mm=readMeta()||m;mm.fail=0;mm.until=0;writeMeta(mm);return raw;},
  function(){var mm=readMeta()||m;mm.fail=(mm.fail||0)+1;var d=delayFor(mm.fail);mm.until=d?now()+d:0;try{writeMeta(mm);}catch(e){}throw new Error('bad');});}
/* charge et déchiffre toutes les clés protégées ; une valeur restée en clair (migration interrompue) est rechiffrée */
function loadAll(){var ks=rawKeys().filter(isProt),t0=performance.now();CACHE={};BAD=[];
  return Promise.all(ks.map(function(k){var raw=rawGet(k);if(raw==null)return null;if(!isEnv(raw)){CACHE[k]=raw;return 'plain:'+k;}
    return open(k,raw).then(function(s){CACHE[k]=s;return null;},function(){BAD.push(k);return null;});})).then(function(r){
    /* une enveloppe illisible n’est jamais écrasée : on la met de côté sous un autre nom */
    BAD.forEach(function(k){try{oSet.call(LS,KEY+'.cryptbad.'+now()+'.'+k.slice(KEY.length),rawGet(k));oRem.call(LS,k);}catch(e){}});
    T.load=Math.round(performance.now()-t0);return r.filter(Boolean).map(function(x){return x.slice(6);});});}
function openApp(raw){return dekKey(raw).then(function(k){DEK=k;MODE='open';install();return loadAll();}).then(function(plain){plain.forEach(queue);release();
  try{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();}catch(e){}});}
/* ---------- exécution différée des scripts de l’application ---------- */
var Q=[],RELEASED=MODE==='plain';
function exec(id){var el=document.getElementById(id);if(!el)return;var s=document.createElement('script');s.text=el.text;el.parentNode.insertBefore(s,el);el.parentNode.removeChild(el);}
function release(){RELEASED=true;var q=Q;Q=[];q.forEach(exec);afterRelease();}
window.CJBoot={go:function(id){if(RELEASED)exec(id);else Q.push(id);}};
/* ---------- interface ---------- */
var CSS='#cjLock{position:fixed;inset:0;z-index:1100;overflow-y:auto;background:#0B3A6E;color:#fff;font:16px/1.4 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;padding:max(24px,env(safe-area-inset-top)) 20px max(24px,env(safe-area-inset-bottom))}'+
'#cjLock .w{max-width:380px;margin:0 auto;min-height:100%;display:flex;flex-direction:column;justify-content:center;align-items:stretch;text-align:center}'+
'#cjLock img{width:80px;height:80px;border-radius:20px;margin:0 auto 12px;box-shadow:0 12px 30px rgba(0,0,20,.4)}'+
'#cjLock h1{font-size:25px;margin:0 0 4px;font-weight:800}#cjLock h1 b{color:#FFB37A}#cjLock .s{opacity:.85;font-size:14.5px;margin:0 0 18px}'+
'#cjLock .dots{display:flex;justify-content:center;gap:12px;margin:6px 0 14px}#cjLock .dots i{width:14px;height:14px;border-radius:50%;border:2px solid #fff;display:block}#cjLock .dots i.on{background:#fff}'+
'#cjLock input{width:100%;box-sizing:border-box;font-size:20px;letter-spacing:8px;text-align:center;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.35);color:#fff;background:rgba(255,255,255,.1);outline:none}#cjLock input::placeholder{color:rgba(255,255,255,.6);letter-spacing:1px;font-size:15px}'+
'#cjLock .pad{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:10px auto 0;max-width:300px}#cjLock .pad button{height:62px;border-radius:31px;border:0;background:rgba(255,255,255,.14);color:#fff;font-size:26px;font-weight:600}#cjLock .pad button:active{background:rgba(255,255,255,.3)}#cjLock .pad button.t{font-size:15px;background:none}'+
'#cjLock .msg{min-height:22px;margin:10px 0 0;font-size:14px;color:#FFD2B0;font-weight:600}#cjLock .lk{background:none;border:0;color:#fff;text-decoration:underline;font-size:14.5px;margin-top:16px;opacity:.9}'+
'#cjLock .b{display:block;width:100%;margin-top:12px;padding:13px;border-radius:14px;border:0;font-size:16px;font-weight:700;background:#FFB37A;color:#0B3A6E}#cjLock .b.s2{background:rgba(255,255,255,.16);color:#fff}'+
'#cjLock .txt{text-align:left;font-size:14.5px;background:rgba(255,255,255,.1);border-radius:14px;padding:12px 14px;margin:0 0 14px}#cjLock .txt p{margin:0 0 8px}#cjLock .txt p:last-child{margin:0}'+
/* 1.29.1 (-c) : écran plus compact sur téléphone — clavier et « Valider » visibles sans défiler (affichage seul) */
'@media (max-height:900px){#cjLock{padding-top:max(14px,env(safe-area-inset-top));padding-bottom:max(14px,env(safe-area-inset-bottom))}#cjLock img{width:56px;height:56px;border-radius:15px;margin-bottom:6px}#cjLock h1{font-size:21px}#cjLock .s{font-size:14px;margin-bottom:10px}#cjLock .txt{font-size:13.5px;line-height:1.35;padding:9px 12px;margin-bottom:8px}#cjLock .txt p{margin-bottom:4px}#cjLock .dots{margin:2px 0 8px}#cjLock input{padding:7px}#cjLock .pad{gap:9px;margin-top:8px}#cjLock .pad button{height:52px;font-size:23px}#cjLock .msg{min-height:16px;margin-top:6px}#cjLock .lk{margin-top:8px}}'+
'#cjLock .busy{display:inline-block;width:18px;height:18px;border:3px solid rgba(255,255,255,.35);border-top-color:#fff;border-radius:50%;animation:cjsp 1s linear infinite;vertical-align:middle;margin-right:8px}@keyframes cjsp{to{transform:rotate(360deg)}}'+
'#secCard .row{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:8px 0}#secCard select{font-size:15px;padding:6px 8px;border-radius:10px}#secCard .ok{color:var(--ok,#1a7f37);font-weight:700}';
function css(){if(document.getElementById('cjCss'))return;var s=document.createElement('style');s.id='cjCss';s.textContent=CSS;document.head.appendChild(s);}
function h(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function overlay(html){css();var o=document.getElementById('cjLock');if(!o){o=document.createElement('div');o.id='cjLock';o.setAttribute('role','dialog');o.setAttribute('aria-modal','true');document.body.appendChild(o);}
  o.innerHTML='<div class="w">'+html+'</div>';return o;}
function closeOverlay(){var o=document.getElementById('cjLock');if(o)o.parentNode.removeChild(o);}
var HEAD='<img src="icons/logo-b.svg" alt=""><h1>Cahier d’<b>EPS</b></h1>';
function fmtWait(ms){var s=Math.ceil(ms/1000);return s>=60?Math.ceil(s/60)+' min':s+' s';}
/* saisie d’un code : clavier à l’écran + clavier du téléphone ; résout la valeur (ou null si annulé) */
function pinForm(o){o=o||{};return new Promise(function(res){
  var len=o.len||PIN_MIN,v='';
  var root=overlay(HEAD+'<p class="s" id="cjT">'+h(o.title||'Entrez votre code')+'</p>'+(o.intro||'')+
   '<div class="dots" id="cjDots"></div><input id="cjIn" type="password" inputmode="numeric" pattern="[0-9]*" autocomplete="off" maxlength="12" aria-label="Code" placeholder="'+(o.free?'6 chiffres ou plus':'')+'">'+
   '<div class="pad" id="cjPad">'+[1,2,3,4,5,6,7,8,9].map(function(n){return '<button type="button" data-n="'+n+'">'+n+'</button>';}).join('')+
   '<button type="button" class="t" data-x="bio" id="cjBio" style="visibility:'+(o.bio?'visible':'hidden')+'">Face ID</button><button type="button" data-n="0">0</button><button type="button" class="t" data-x="del" aria-label="Effacer">⌫</button></div>'+
   (o.free?'<button type="button" class="b" id="cjOk">Valider</button>':'')+
   '<p class="msg" id="cjMsg" role="alert"></p>'+(o.extra||'')+(o.cancel?'<button type="button" class="lk" id="cjCancel">Annuler</button>':''));
  var inp=root.querySelector('#cjIn'),dots=root.querySelector('#cjDots'),msg=root.querySelector('#cjMsg');
  function draw(){var n=Math.max(len,v.length);dots.innerHTML=o.free&&v.length>len?'':Array.apply(null,{length:n}).map(function(_,i){return '<i class="'+(i<v.length?'on':'')+'"></i>';}).join('');inp.value=v;}
  function submit(){if(o.free){if(v.length<PIN_MIN){msg.textContent='Au moins '+PIN_MIN+' chiffres.';return;}}else if(v.length<len)return;var x=v;v='';draw();res(x);}
  function key(n){if(v.length>=12)return;v+=n;draw();msg.textContent='';if(!o.free&&v.length===len)setTimeout(submit,120);}
  root.querySelector('#cjPad').addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;if(b.dataset.n!=null)key(b.dataset.n);else if(b.dataset.x==='del'){v=v.slice(0,-1);draw();}else if(b.dataset.x==='bio'&&o.onBio)o.onBio();});
  inp.addEventListener('input',function(){v=inp.value.replace(/\D/g,'').slice(0,12);draw();if(!o.free&&v.length===len)setTimeout(submit,120);});
  inp.addEventListener('keydown',function(e){if(e.key==='Enter')submit();});
  var ok=root.querySelector('#cjOk');if(ok)ok.addEventListener('click',submit);
  var c=root.querySelector('#cjCancel');if(c)c.addEventListener('click',function(){res(null);});
  if(o.wire)o.wire(root);draw();if(o.msg)msg.textContent=o.msg;
  root.setMsg=function(t){msg.textContent=t;};});}
function setMsg(t){var m=document.getElementById('cjMsg');if(m)m.textContent=t;}
function busy(t){overlay(HEAD+'<p class="s"><span class="busy"></span>'+h(t)+'</p>');}
/* écran de verrouillage */
function lockScreen(msg){var m=readMeta();if(!m)return;var w=waitLeft();
  pinForm({len:m.len||PIN_MIN,title:'Entrez votre code pour ouvrir le cahier',bio:!!(m.bio&&bioAvail()),onBio:bioUnlock,
    msg:msg||(w?'Trop d’essais\u00a0: réessayez dans '+fmtWait(w)+'.':''),
    extra:'<button type="button" class="lk" id="cjForgot">Code oublié\u00a0?</button>',
    wire:function(r){r.querySelector('#cjForgot').addEventListener('click',forgot);}}).then(function(pin){
    var w2=waitLeft();if(w2){lockScreen('Trop d’essais\u00a0: réessayez dans '+fmtWait(w2)+'.');return;}
    busy('Ouverture…');var t0=performance.now();
    tryPin(pin).then(function(raw){T.unlock=Math.round(performance.now()-t0);var t1=performance.now();return openApp(raw).then(function(){T.unlockLoad=Math.round(performance.now()-t1);closeOverlay();});},function(e){
      var mm=readMeta()||{},w3=waitLeft();lockScreen(e&&e.message==='bad'?('Code incorrect'+(w3?' — réessayez dans '+fmtWait(w3):'')+'.'):'Erreur\u00a0: '+(e&&e.message||e));});});
  if(m.bio&&bioAvail()&&!msg&&!w&&m.bioAuto!==false&&!lockScreen.tried){lockScreen.tried=true;setTimeout(bioUnlock,300);}}
/* ---------- code oublié ---------- */
function forgot(){var M={};try{M=JSON.parse(rawGet(MKEY)||'{}')||{};}catch(e){}
  var dirty=!!M.dirty,never=!M.syncedUid;
  overlay(HEAD+'<p class="s">Code oublié</p><div class="txt"><p>Les données de cet appareil sont chiffrées avec votre code\u00a0: sans lui, personne (pas même l’application) ne peut les relire.</p>'+
    '<p>Vous pouvez <b>effacer la copie chiffrée de cet appareil</b>, vous <b>reconnecter avec votre compte</b>, puis récupérer votre cahier <b>depuis la synchronisation en ligne</b>. Vous choisirez ensuite un nouveau code.</p>'+
    (dirty||never?'<p style="color:#FFD2B0"><b>⚠ Attention\u00a0:</b> '+(never?'ce cahier n’a jamais été synchronisé en ligne sur cet appareil.':'des modifications faites sur cet appareil n’ont pas encore été envoyées en ligne.')+' Elles seront <b>définitivement perdues</b>. Essayez d’abord de retrouver votre code.</p>':'<p>Dernière synchronisation\u00a0: tout était envoyé en ligne.</p>')+'</div>'+
    '<button type="button" class="b" id="cjWipe">'+(dirty||never?'Effacer quand même et me reconnecter':'Effacer et me reconnecter')+'</button><button type="button" class="b s2" id="cjBack">Retour</button>');
  document.getElementById('cjBack').addEventListener('click',function(){lockScreen();});
  document.getElementById('cjWipe').addEventListener('click',function(){
    if((dirty||never)&&!confirm('Les modifications non synchronisées seront perdues. Continuer\u00a0?'))return;
    busy('Effacement de la copie locale…');wipeLocal().then(function(){location.reload();});});}
function delDb(n){return new Promise(function(res){try{var r=indexedDB.deleteDatabase(n);r.onsuccess=r.onerror=r.onblocked=function(){res();};}catch(e){res();}});}
/* efface UNIQUEMENT la copie locale chiffrée + la session de connexion (pour imposer une reconnexion) ; les données en ligne ne sont pas touchées */
function wipeLocal(){var M={};try{M=JSON.parse(rawGet(MKEY)||'{}')||{};}catch(e){}
  rawKeys().forEach(function(k){if(isProt(k)||k.indexOf(KEY+'.snapm.')===0||k.indexOf(KEY+'.cryptbad.')===0||k===CKEY||k==='cahier.authOk'||k.indexOf('firebase:')===0)try{oRem.call(LS,k);}catch(e){}});
  /* méta de synchro : même appareil, mais « jamais synchronisé » → au prochain lancement, le cahier en ligne est rechargé (rien n’est envoyé) */
  try{oSet.call(LS,MKEY,JSON.stringify({deviceId:M.deviceId,updatedAt:0,dirty:false,syncedUid:null,lastSyncAt:0}));}catch(e){}
  return Promise.all(['cahier-photos','cahier-snap','firebaseLocalStorageDb'].map(delDb));}
/* ---------- activation / migration ---------- */
var T={};   /* mesures (ms) */
function photosAll(){return idbOpen('cahier-photos').then(function(db){return idbAll(db,'p').then(function(a){return {db:db,a:a};});});}
function snapsAll(){return idbOpen('cahier-snap').then(function(db){return idbAll(db,'s').then(function(a){return {db:db,a:a};});});}
function makeMeta(pin,raw,len,keep){var salt=rnd(16),t0=performance.now();return kek(pin,salt,ITER).then(function(k){T.kdf=Math.round(performance.now()-t0);return wrapRaw(k,raw,'cj-dek-v1');}).then(function(w){
  var m={v:1,alg:'AES-GCM-256',kdf:'PBKDF2-SHA-256',it:ITER,salt:b64(salt),wrap:w,len:len,al:keep&&keep.al!=null?keep.al:5,fail:0,until:0,at:keep&&keep.at||now(),z:HAS_Z};
  if(keep&&keep.bio)m.bio=keep.bio;return m;});}
/* chiffre tout : 1) sauvegarde automatique ; 2) chiffrement en mémoire + vérification ; 3) écriture ; 4) relecture + vérification ; en cas d’échec, retour au clair */
function enable(pin){if(MODE!=='plain')return Promise.reject(new Error('déjà actif'));var t0=performance.now(),raw=rnd(32),key,meta,done=[],phDb,snDb,phW=[],snW=[],plainPh=[],plainSn=[];
  try{if(window.CJApp){CJApp.getJSON();CJApp.snapshot('Avant chiffrement',{force:true});}}catch(e){}
  var ks,vals={};
  /* laisse l’application terminer le rangement des instantanés (7 au maximum) avant de relever les clés */
  return (window.CJApp&&CJApp.snapshots?CJApp.snapshots().catch(function(){}):Promise.resolve()).then(function(){return new Promise(function(r){setTimeout(r,200);});}).then(function(){
  ks=rawKeys().filter(isProt);ks.forEach(function(k){vals[k]=rawGet(k);});
  return dekKey(raw);}).then(function(k){key=k;return makeMeta(pin,raw,pin.length);}).then(function(m){meta=m;
    return Promise.all(ks.map(function(k){return sealWith(key,k,vals[k]).then(function(env){return openWith(key,k,env).then(function(back){if(back!==vals[k])throw new Error('vérification '+k);return [k,env];});});}));
  }).then(function(envs){
    return photosAll().then(function(P){phDb=P.db;plainPh=P.a.filter(function(r){return r&&typeof r.d==='string';});
      return Promise.all(plainPh.map(function(r){return sealWith(key,'ph:'+r.id,r.d).then(function(e){return openWith(key,'ph:'+r.id,e).then(function(b){if(b!==r.d)throw new Error('vérification photo');return {id:r.id,t:r.t,e:e};});});}));})
    .then(function(pw){phW=pw;return snapsAll();}).then(function(S){snDb=S.db;plainSn=S.a.filter(function(r){return r&&typeof r.data==='string'&&!isEnv(r.data);});
      return Promise.all(plainSn.map(function(r){return sealWith(key,'snap:'+r.t,r.data).then(function(e){return openWith(key,'snap:'+r.t,e).then(function(b){if(b!==r.data)throw new Error('vérification instantané');var c={};for(var x in r)c[x]=r[x];c.data=e;return c;});});}));})
    .then(function(sw){snW=sw;T.encrypt=Math.round(performance.now()-t0);
      /* écriture : métadonnées d’abord (sinon une enveloppe écrite serait illisible), puis chaque clé */
      writeMeta(meta);
      envs.forEach(function(p){var cur=rawGet(p[0]);
        if(cur==null){delete vals[p[0]];return;}            /* supprimée entre-temps par l’application (instantané le plus ancien) : on ne la recrée pas */
        if(cur!==vals[p[0]]){vals[p[0]]=cur;return;}        /* modifiée entre-temps : gardée telle quelle, rechiffrée juste après */
        oSet.call(LS,p[0],p[1]);done.push(p[0]);if(rawGet(p[0])!==p[1])throw new Error('relecture '+p[0]);});
      return (phDb?idbPutAll(phDb,'p',phW):Promise.resolve()).then(function(){return snDb?idbPutAll(snDb,'s',snW):null;});})
    .then(function(){/* relecture complète */DEK=key;var chk={};done.forEach(function(k){chk[k]=vals[k];});return verifyAll(chk,plainPh,plainSn);})
    .then(function(){[phDb,snDb].forEach(function(d){try{d&&d.close();}catch(e){}});CACHE=vals;MODE='open';install();
      /* toute clé personnelle encore en clair (écrite par l’application pendant l’opération) est reprise et chiffrée */
      rawKeys().filter(isProt).forEach(function(k){var r=rawGet(k);if(r!=null&&!isEnv(r)){CACHE[k]=r;queue(k);}else if(r==null)delete CACHE[k];});
      return flush();}).then(function(){T.enable=Math.round(performance.now()-t0);return T;});
  }).catch(function(e){/* échec : on remet exactement les valeurs en clair, on retire les métadonnées */
    done.forEach(function(k){try{oSet.call(LS,k,vals[k]);}catch(x){}});
    var p=Promise.resolve();if(phDb&&plainPh.length)p=idbPutAll(phDb,'p',plainPh).catch(function(){});
    return p.then(function(){return snDb&&plainSn.length?idbPutAll(snDb,'s',plainSn).catch(function(){}):null;}).then(function(){
      try{oRem.call(LS,CKEY);}catch(x){}DEK=null;MODE='plain';META=null;[phDb,snDb].forEach(function(d){try{d&&d.close();}catch(x){}});throw e;});});}
function verifyAll(vals,plainPh,plainSn){
  return Promise.all(Object.keys(vals).map(function(k){var env=rawGet(k);if(!isEnv(env))throw new Error('relecture '+k);return open(k,env).then(function(s){if(s!==vals[k])throw new Error('relecture '+k);});}))
  .then(function(){if(!plainPh.length)return;return photosAll().then(function(P){var by={};P.a.forEach(function(r){by[r.id]=r;});try{P.db&&P.db.close();}catch(e){}
    return Promise.all(plainPh.map(function(r){var x=by[r.id];if(!x||!x.e)throw new Error('relecture photo');return open('ph:'+r.id,x.e).then(function(d){if(d!==r.d)throw new Error('relecture photo');});}));});})
  .then(function(){if(!plainSn.length)return;return snapsAll().then(function(S){var by={};S.a.forEach(function(r){by[r.t]=r;});try{S.db&&S.db.close();}catch(e){}
    return Promise.all(plainSn.map(function(r){var x=by[r.t];if(!x||!isEnv(x.data))throw new Error('relecture instantané');return open('snap:'+r.t,x.data).then(function(d){if(d!==r.data)throw new Error('relecture instantané');});}));});});}
/* désactivation : remet le format en clair d’origine (mêmes chaînes, octet pour octet) */
function disable(){if(MODE!=='open')return Promise.reject(new Error('verrouillé'));
  return flush().then(function(){var ks=rawKeys().filter(isProt);
    return Promise.all(ks.map(function(k){var r=rawGet(k);return isEnv(r)?open(k,r).then(function(s){return [k,s];}):[k,r];}));})
  .then(function(pairs){
    return photosAll().then(function(P){return Promise.all(P.a.filter(function(r){return r&&r.e;}).map(function(r){return open('ph:'+r.id,r.e).then(function(d){return {id:r.id,d:d,t:r.t};});})).then(function(ph){return {P:P,ph:ph};});})
    .then(function(o){return snapsAll().then(function(S){return Promise.all(S.a.filter(function(r){return r&&isEnv(r.data);}).map(function(r){return open('snap:'+r.t,r.data).then(function(d){var c={};for(var x in r)c[x]=r[x];c.data=d;return c;});})).then(function(sn){o.S=S;o.sn=sn;return o;});});})
    .then(function(o){
      /* clés localStorage : en clair ; si le stockage est plein, on s’arrête et on garde le chiffrement (mélange accepté) */
      var undo=[];try{pairs.forEach(function(p){var cur=rawGet(p[0]);oSet.call(LS,p[0],p[1]);undo.push([p[0],cur]);});}
      catch(e){undo.forEach(function(u){try{oSet.call(LS,u[0],u[1]);}catch(x){}});throw new Error('stockage plein\u00a0: désactivation impossible pour le moment');}
      return (o.P.db?idbPutAll(o.P.db,'p',o.ph):Promise.resolve()).then(function(){return o.S.db?idbPutAll(o.S.db,'s',o.sn):null;}).then(function(){
        [o.P.db,o.S.db].forEach(function(d){try{d&&d.close();}catch(e){}});
        oRem.call(LS,CKEY);MODE='plain';uninstall();DEK=null;CACHE={};META=null;});});});}
/* changer le code : seule la clé de données est réenveloppée (aucune donnée n’est rechiffrée) */
function changePin(oldPin,newPin){return tryPin(oldPin).then(function(raw){var m=readMeta();return makeMeta(newPin,raw,newPin.length,m);}).then(function(m){writeMeta(m);});}
/* ---------- Face ID / Touch ID (WebAuthn PRF), si le navigateur le permet ---------- */
function bioAvail(){return !!(window.PublicKeyCredential&&navigator.credentials&&window.isSecureContext);}
function bioCheck(){if(!bioAvail()||!PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable)return Promise.resolve(false);
  return PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable().catch(function(){return false;});}
function prfKey(out){return subtle.importKey('raw',out,{name:'AES-GCM'},false,['encrypt','decrypt']);}
function prfGet(id,salt){return navigator.credentials.get({publicKey:{challenge:rnd(32),allowCredentials:[{type:'public-key',id:unb64(id)}],userVerification:'required',timeout:60000,extensions:{prf:{eval:{first:unb64(salt)}}}}})
  .then(function(c){var r=c&&c.getClientExtensionResults&&c.getClientExtensionResults();var f=r&&r.prf&&r.prf.results&&r.prf.results.first;if(!f)throw new Error('noprf');return f;});}
function bioEnroll(pin){var raw,salt=b64(rnd(32));return tryPin(pin).then(function(r){raw=r;
  return navigator.credentials.create({publicKey:{challenge:rnd(32),rp:{name:'Cahier d’EPS'},user:{id:rnd(16),name:'cahier-eps',displayName:'Cahier d’EPS'},
    pubKeyCredParams:[{type:'public-key',alg:-7},{type:'public-key',alg:-257}],authenticatorSelection:{authenticatorAttachment:'platform',residentKey:'preferred',userVerification:'required'},timeout:60000,
    extensions:{prf:{eval:{first:unb64(salt)}}}}});}).then(function(c){var r=c.getClientExtensionResults&&c.getClientExtensionResults();
    if(!r||!r.prf||r.prf.enabled===false)throw new Error('noprf');var id=b64(c.rawId);var f=r.prf.results&&r.prf.results.first;
    return (f?Promise.resolve(f):prfGet(id,salt)).then(function(out){return prfKey(out);}).then(function(k){return wrapRaw(k,raw,'cj-dek-bio-v1');}).then(function(w){var m=readMeta();m.bio={id:id,salt:salt,wrap:w};writeMeta(m);});});}
function bioUnlock(){var m=readMeta();if(!m||!m.bio)return;var t0=performance.now();
  prfGet(m.bio.id,m.bio.salt).then(prfKey).then(function(k){return unwrapRaw(k,m.bio.wrap,'cj-dek-bio-v1');}).then(function(raw){busy('Ouverture…');T.unlock=Math.round(performance.now()-t0);return openApp(raw).then(closeOverlay);})
  .catch(function(){setMsg('Face ID non utilisé\u00a0: touchez «\u00a0Face ID\u00a0» ou entrez votre code.');});}
/* ---------- verrouillage automatique ---------- */
function lockNow(){if(MODE!=='open')return;flush().then(function(){location.reload();});}
document.addEventListener('visibilitychange',function(){if(MODE!=='open')return;var m=readMeta();if(!m)return;
  if(document.hidden){hiddenAt=now();flush();}else if(hiddenAt&&now()-hiddenAt>=(m.al||0)*60000){lockNow();}});
window.addEventListener('pageshow',function(e){if(e.persisted&&MODE==='open'&&hiddenAt){var m=readMeta();if(m&&now()-hiddenAt>=(m.al||0)*60000)lockNow();}});
window.addEventListener('pagehide',function(){if(MODE==='open'){hiddenAt=hiddenAt||now();}});
/* ---------- première ouverture : proposer le code ---------- */
var LATER='cahier.cryptoLater';
function setupFlow(fromSettings){
  var intro='<div class="txt"><p><b>Protégez les données de vos élèves.</b></p>'+   /* 1.29.1 (-c) : texte fourni par le propriétaire (affichage seul) */
    '<p>Choisissez un code de 6 chiffres ou plus.</p>'+
    '<p>Ce code sera demandé à chaque ouverture de l’application.</p>'+
    '<p>En cas d’oubli, sélectionnez «\u00a0Code oublié\u00a0?\u00a0». Cela efface la copie locale de cet appareil\u00a0; vous pourrez la récupérer depuis votre compte synchronisé.</p></div>';
  function step1(msg){pinForm({free:true,title:'Choisissez votre code',intro:intro,msg:msg,cancel:true,extra:'<button type="button" class="lk" id="cjDl">Télécharger d’abord une sauvegarde (JSON)</button>',
      wire:function(r){r.querySelector('#cjDl').addEventListener('click',dlBackup);}}).then(function(a){
    if(a==null){if(!fromSettings)try{oSet.call(LS,LATER,String(now()));}catch(e){}closeOverlay();return;}
    pinForm({free:true,title:'Confirmez votre code',cancel:true}).then(function(b){if(b==null){step1();return;}if(a!==b){step1('Les deux codes ne correspondent pas. Recommencez.');return;}
      busy('Sauvegarde puis chiffrement de vos données…');
      enable(a).then(function(){try{oRem.call(LS,LATER);}catch(e){}
        overlay(HEAD+'<p class="s">Code activé</p><div class="txt"><p>✅ Vos données sur ce téléphone sont maintenant chiffrées (vérifiées après écriture).</p><p>Une sauvegarde de sécurité «\u00a0Avant chiffrement\u00a0» a été créée. Vous pouvez aussi en télécharger une copie.</p></div>'+
          '<button type="button" class="b" id="cjDone">Continuer</button><button type="button" class="b s2" id="cjDl2">Télécharger une sauvegarde (JSON)</button>');
        document.getElementById('cjDone').addEventListener('click',function(){closeOverlay();renderCard();});
        document.getElementById('cjDl2').addEventListener('click',dlBackup);renderCard();
      },function(e){overlay(HEAD+'<p class="s">Chiffrement non effectué</p><div class="txt"><p>⚠ '+h(e&&e.message||e)+'</p><p>Rien n’a été modifié\u00a0: vos données restent enregistrées comme avant (en clair).</p></div><button type="button" class="b" id="cjDone">Fermer</button>');
        document.getElementById('cjDone').addEventListener('click',closeOverlay);renderCard();});});});}
  step1();}
function dlBackup(){try{var js=CJApp.getJSON();CJApp.download('sauvegarde-cahier-journalier_'+CJApp.stamp()+'.json',js);}catch(e){alert('Téléchargement impossible\u00a0: '+(e&&e.message||e));}}
function maybeAsk(){if(MODE!=='plain'||readMeta()||!subtle)return;var tries=0;var iv=setInterval(function(){tries++;if(tries>600){clearInterval(iv);return;}
  if(!window.CJGateOpen||document.getElementById('cjLock')||document.getElementById('onb')||document.getElementById('splash')||!rawGet('cahier.onboardingDone'))return;
  var l=+rawGet(LATER)||0;clearInterval(iv);if(l&&now()-l<7*864e5)return;if(window.CJApp&&CJApp.viewing&&CJApp.viewing())return;setupFlow(false);},1000);}
/* ---------- carte Paramètres › Sécurité ---------- */
function renderCard(){var c=document.getElementById('secCard');if(!c)return;var m=readMeta(),on=MODE==='open'&&m;
  var hh='<h2>🔒 Sécurité de cet appareil</h2>';
  if(!on){hh+='<p class="small muted" style="margin-top:0">Code d’accès\u00a0: <b>désactivé</b>. Les données de ce téléphone sont enregistrées en clair dans le navigateur.</p>'+
    '<p class="small muted">Activez un code de 6 chiffres (ou plus)\u00a0: les données locales (élèves, codes Massar, notes, photos, sauvegardes de sécurité) seront chiffrées en AES-256 et le code sera demandé à chaque ouverture.</p>'+
    (subtle?'<div class="actions"><button class="btn" id="secOn">🔒 Activer le code d’accès</button></div>':'<p class="small">Ce navigateur ne permet pas le chiffrement.</p>');}
  else{hh+='<p class="small" style="margin-top:0">Code d’accès\u00a0: <span class="ok">activé</span> · données locales chiffrées (AES-256-GCM\u00a0; clé protégée par votre code, PBKDF2-SHA-256 '+(m.it/1000|0)+' 000 itérations).</p>'+
    '<div class="row"><label for="secAl" class="small">Verrouiller après</label><select id="secAl">'+[[0,'immédiatement'],[1,'1 min en arrière-plan'],[5,'5 min en arrière-plan'],[15,'15 min en arrière-plan'],[30,'30 min en arrière-plan'],[60,'1 h en arrière-plan']].map(function(o){return '<option value="'+o[0]+'"'+(o[0]===(m.al==null?5:m.al)?' selected':'')+'>'+o[1]+'</option>';}).join('')+'</select></div>'+
    '<div class="actions"><button class="btn" id="secLock">🔒 Verrouiller maintenant</button><button class="btn sec" id="secPin">Changer le code</button>'+
    '<button class="btn sec hidden" id="secBio">'+(m.bio?'Désactiver Face ID':'Activer Face ID')+'</button><button class="btn sec" id="secOff">Désactiver le chiffrement</button></div>'+
    '<p class="small muted" id="secBioInfo"></p>'+(T.unlock!=null?'<p class="small muted" id="secTime">Dernière ouverture\u00a0: '+T.unlock+' ms (code) + '+(T.load||0)+' ms (déchiffrement).</p>':'')+
    '<p class="small muted">Limites\u00a0: pendant l’utilisation, les données sont déchiffrées en mémoire\u00a0; les données en ligne sont protégées par le chiffrement de Google et les règles d’accès de votre compte (pas par ce code)\u00a0; les exports PDF, CSV et JSON sont en clair.</p>';}
  c.innerHTML=hh;
  var b=document.getElementById('secOn');if(b)b.addEventListener('click',function(){setupFlow(true);});
  if(!on)return;
  document.getElementById('secAl').addEventListener('change',function(){var mm=readMeta();mm.al=+this.value;writeMeta(mm);try{CJApp.toast('Verrouillage automatique enregistré');}catch(e){}});
  document.getElementById('secLock').addEventListener('click',lockNow);
  document.getElementById('secPin').addEventListener('click',function(){var mm=readMeta();
    pinForm({len:mm.len||PIN_MIN,title:'Code actuel',cancel:true}).then(function(old){if(old==null){closeOverlay();return;}busy('Vérification…');
      tryPin(old).then(function(){return ask2('Nouveau code');},function(){closeOverlay();alert('Code incorrect.');return null;}).then(function(nw){if(nw==null){closeOverlay();return;}
        busy('Changement du code…');changePin(old,nw).then(function(){closeOverlay();renderCard();CJApp.toast('Code modifié');},function(e){closeOverlay();alert('Échec\u00a0: '+(e&&e.message||e));});});});});
  document.getElementById('secOff').addEventListener('click',function(){var mm=readMeta();
    if(!confirm('Désactiver le chiffrement\u00a0? Les données de ce téléphone seront de nouveau enregistrées en clair et le code ne sera plus demandé.'))return;
    pinForm({len:mm.len||PIN_MIN,title:'Entrez votre code pour désactiver',cancel:true}).then(function(p){if(p==null){closeOverlay();return;}busy('Déchiffrement…');
      tryPin(p).then(function(){return disable().then(function(){closeOverlay();renderCard();CJApp.toast('Chiffrement désactivé');});},function(){closeOverlay();alert('Code incorrect.');})
      .catch(function(e){closeOverlay();alert('Échec\u00a0: '+(e&&e.message||e)+'\nVos données restent chiffrées et intactes.');});});});
  bioCheck().then(function(ok){var bb=document.getElementById('secBio'),inf=document.getElementById('secBioInfo');if(!bb)return;
    if(!ok){if(inf)inf.textContent='Face ID / Touch ID\u00a0: non disponible dans ce navigateur (code uniquement).';return;}
    bb.classList.remove('hidden');bb.addEventListener('click',function(){var mm=readMeta();
      if(mm.bio){delete mm.bio;writeMeta(mm);renderCard();return;}
      pinForm({len:mm.len||PIN_MIN,title:'Entrez votre code pour activer Face ID',cancel:true}).then(function(p){if(p==null){closeOverlay();return;}busy('Face ID…');
        bioEnroll(p).then(function(){closeOverlay();renderCard();CJApp.toast('Face ID activé');},function(e){closeOverlay();renderCard();
          var t=document.getElementById('secBioInfo');if(t)t.textContent=e&&e.message==='bad'?'Code incorrect.':'Face ID ne peut pas protéger la clé sur cet appareil (extension WebAuthn PRF non prise en charge)\u00a0: code uniquement.';});});});});}
function ask2(title){return pinForm({free:true,title:title,cancel:true}).then(function(a){if(a==null)return null;return pinForm({free:true,title:'Confirmez le nouveau code',cancel:true}).then(function(b){
  if(b==null)return null;if(a!==b){alert('Les deux codes ne correspondent pas.');return ask2(title);}return a;});});}
function afterRelease(){renderCard();var tries=0;var iv=setInterval(function(){if(document.getElementById('secCard')){renderCard();clearInterval(iv);}else if(++tries>20)clearInterval(iv);},250);maybeAsk();}
/* ---------- API ---------- */
window.CJCrypto={mode:function(){return MODE;},meta:readMeta,isProt:isProt,isEnv:isEnv,flush:flush,lock:lockNow,timings:T,lastError:function(){return LAST_ERR;},bad:function(){return BAD.slice();},
  phSeal:phSeal,phOpen:phOpen,snapSeal:snapSeal,snapOpen:snapOpen,enable:enable,disable:disable,changePin:changePin,unlock:function(pin){return tryPin(pin).then(openApp).then(closeOverlay);},
  wipeLocal:wipeLocal,setup:setupFlow,render:renderCard,iterations:ITER,compress:HAS_Z,
  bench:function(it){var s=rnd(16),t0=performance.now();return kek('123456',s,it||ITER).then(function(k){return wrapRaw(k,rnd(32),'x');}).then(function(){return Math.round(performance.now()-t0);});}};
if(MODE==='locked'){if(!subtle){overlay(HEAD+'<p class="s">Ce navigateur ne permet pas d’ouvrir le cahier chiffré (WebCrypto indisponible).</p>');}else lockScreen();}
else{if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',afterRelease);else setTimeout(afterRelease,0);}
})();
