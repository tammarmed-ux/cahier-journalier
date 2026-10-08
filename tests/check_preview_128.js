const puppeteer=require('puppeteer-core');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function run(b,URL){const ctx=await b.createBrowserContext();const p=await ctx.newPage();await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true});
const net=[];p.on('response',async r=>{if(/signInWithPassword/.test(r.url())&&r.status()===400){try{net.push('BODY '+(await r.text()).replace(/\s+/g,' ').slice(0,200));}catch(e){}}if(/identitytoolkit|securetoken|recaptcha/.test(r.url()))net.push(r.status()+' '+r.url().slice(0,90));});p.on('requestfailed',r=>{if(/google/.test(r.url()))net.push('FAILED '+r.url().slice(0,90)+' '+(r.failure()||{}).errorText);});
const logs=[];p.on('console',m=>logs.push(m.text().slice(0,200)));
await p.goto(URL,{waitUntil:'networkidle2'});await sleep(2000);await p.click('#lnLogin');await p.waitForSelector('#gate',{visible:true});await sleep(1500);
if(!(await p.evaluate(()=>{const e=document.getElementById('gEmail');return e&&e.offsetParent;}))){const t=await p.evaluateHandle(()=>[...document.querySelectorAll('#gate button,#gate a')].find(x=>/e-mail/i.test(x.textContent)));if(t)await t.click();await sleep(500);}
await p.type('#gEmail','preview-check-no-account-1280@example.com');await p.type('#gPass','Wrong-Password-000');
console.log(URL,'online',await p.evaluate(()=>navigator.onLine));await p.click('#gGo');await sleep(5000);
console.log(' result:',await p.evaluate(()=>{return [...document.querySelectorAll('#gate .g-err,#gate .err,#gate [role=alert],#gate .g-msg')].filter(e=>e.offsetParent).map(e=>e.className+': '+e.textContent).join(' || ')+' ## '+document.getElementById('gate').innerText.replace(/\s+/g,' ').slice(0,500);}));console.log(' net',JSON.stringify(net));console.log(' logs',logs.filter(l=>/auth|fire|network/i.test(l)).join(' | ').slice(0,500));await ctx.close();}
(async()=>{const b=await puppeteer.launch({executablePath:'/usr/bin/google-chrome',headless:true,args:['--no-sandbox']});
await run(b,'https://cahier-eps-ma--test-128-k1rpobyv.web.app/');await run(b,'https://cahier-eps-ma.web.app/');await b.close();})();
