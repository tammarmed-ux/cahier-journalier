/* v1.29.0 : Face ID / Touch ID via WebAuthn PRF (authentificateur virtuel de Chrome avec PRF) — la clé de données est enveloppée
   une 2e fois par la sortie PRF ; sans PRF, l’option est refusée proprement (code uniquement). */
const puppeteer=require('puppeteer-core');const results=[];function check(n,ok,x){results.push(!!ok);console.log((ok?'PASS':'FAIL')+' - '+n+(x?' :: '+x:''));}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const pad=async(pg,d,ok)=>{for(const c of d){await pg.click('#cjPad [data-n="'+c+'"]');await sleep(40);}if(ok){await sleep(100);await pg.click('#cjOk');}};
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox','--disable-dev-shm-usage']});
async function run(prf){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
  const c=await p.createCDPSession();await c.send('WebAuthn.enable');
  const {authenticatorId}=await c.send('WebAuthn.addVirtualAuthenticator',{options:{protocol:'ctap2',ctap2Version:'ctap2_1',transport:'internal',hasResidentKey:true,hasUserVerification:true,isUserVerified:true,automaticPresenceSimulation:true,hasPrf:prf}});
  await p.evaluateOnNewDocument(()=>{try{localStorage.setItem('cahier.onboardingDone','1');localStorage.setItem('cahier.cryptoLater',String(Date.now()));}catch(e){}});
  await p.goto('http://localhost:8000/',{waitUntil:'networkidle2'});await sleep(800);
  await p.evaluate(()=>CJCrypto.enable('123456'));
  await p.evaluate(()=>{window.CJIntro&&CJIntro.skipSplash&&CJIntro.skipSplash();document.documentElement.classList.remove('cj-locked','cj-land');document.querySelector('#tabs button[data-tab="settings"]').click();CJCrypto.render();});await sleep(600);
  const vis=await p.evaluate(()=>!document.getElementById('secBio').classList.contains('hidden'));
  check((prf?'[PRF] ':'[sans PRF] ')+'bouton « Activer Face ID » proposé (authentificateur de plateforme présent)',vis);
  await p.click('#secBio');await sleep(300);await pad(p,'123456');
  await p.waitForFunction(()=>!document.getElementById('cjLock'),{timeout:20000}).catch(()=>{});await sleep(300);
  const m=await p.evaluate(()=>CJCrypto.meta());const info=await p.evaluate(()=>document.getElementById('secBioInfo').textContent);
  if(prf){
    check('[PRF] Face ID activé : 2e enveloppe de la clé (identifiant + sel PRF), code inchangé',!!(m.bio&&m.bio.id&&m.bio.salt&&m.bio.wrap&&m.wrap));
    await p.reload({waitUntil:'networkidle2'});
    await p.waitForFunction(()=>window.CJApp&&!document.getElementById('cjLock'),{timeout:20000}).catch(()=>{});
    check('[PRF] à l’ouverture : déverrouillé par Face ID sans saisir le code',await p.evaluate(()=>CJCrypto.mode()==='open'&&!!window.CJApp));
    check('[PRF] le code reste utilisable (après « Verrouiller », saisie du code)',await (async()=>{await c.send('WebAuthn.setUserVerified',{authenticatorId,isUserVerified:false});await p.evaluate(()=>CJCrypto.lock());await sleep(1500);await sleep(1500);await pad(p,'123456');await p.waitForFunction(()=>window.CJApp&&!document.getElementById('cjLock'),{timeout:20000}).catch(()=>{});return p.evaluate(()=>CJCrypto.mode()==='open');})());
  }else{
    check('[sans PRF] refus honnête : « code uniquement », aucune enveloppe biométrique',!m.bio&&/code uniquement/.test(info),info);
  }
  check((prf?'[PRF] ':'[sans PRF] ')+'aucune erreur de page',errs.length===0,errs.join('|'));await ctx.close();}
await run(true);await run(false);
await b.close();const ok=results.filter(Boolean).length;console.log(ok+'/'+results.length+' passed');process.exit(ok===results.length?0:1);})().catch(e=>{console.log('FATAL',e);process.exit(1);});
