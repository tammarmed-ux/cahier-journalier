const C=require('/workspace/presentation-cj/work/common.js');const {sleep,ev,fs}=C;const SD=require('/workspace/presentation-cj/work/seed.js');const G=require('/workspace/presentation-cj/work/gen.js');
const S=JSON.parse(fs.readFileSync(C.W+'students.json','utf8'));const OUT='/workspace/backups/v1.29.0-preview/';
(async()=>{const b=await C.launch();const {p}=await C.newPage(b);await p.setViewport({width:390,height:844,deviceScaleFactor:3,isMobile:true,hasTouch:false});
await p.goto('http://localhost:8000/',{waitUntil:'networkidle2'});await sleep(2500);await C.unlock(p);await sleep(1000);
console.log('ver',await ev(p,()=>window.APP_VER||''));
console.log('seed',await ev(p,new Function('S','CLS','SKIP','return ('+SD.seedBase.toString()+')(S,CLS,SKIP)'),S,G.CLS,''));await sleep(800);await C.unlock(p);await sleep(500);
await C.tab(p,'attendance');await sleep(600);
await ev(p,()=>{const s=document.querySelector('#view-attendance select');const c=CJR.db().classes.find(c=>c.name==='2BACSP4');s.value=c.id;s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(800);
await ev(p,()=>{const v=document.querySelector('.view.active');const b=[...v.querySelectorAll('button')].find(b=>b.textContent.trim()==='Cycle 1');b&&b.click();});await sleep(700);
// quelques marques M / MJ en mode Rapide (tap = A, S, M ...)
const rows=await ev(p,()=>[...document.querySelectorAll('#gridWrap tr[data-sid]')].map(t=>t.getAttribute('data-sid')));
const cols=await ev(p,()=>[...new Set([...document.querySelectorAll('#gridWrap td[data-s]')].map(t=>t.getAttribute('data-s')))]);
console.log(rows.length,'élèves',cols.join(','));
const tap=async(i,s,n)=>{for(let k=0;k<n;k++){await ev(p,(r,s)=>{const el=document.querySelector('#gridWrap tr[data-sid="'+r+'"] td[data-s="'+s+'"]');el.scrollIntoView({block:'center'});el.click();},rows[i],s);await sleep(350);}};
await tap(2,cols[0],3);await tap(4,cols[1],3);await tap(6,cols[0],5);await tap(7,cols[2],1);await sleep(2500);
await ev(p,()=>{const b=[...document.querySelectorAll('#view-attendance button')].find(b=>b.textContent.trim()==='Détail');b.click();});await sleep(4800);
await ev(p,(r,s)=>{const el=document.querySelector('#gridWrap tr[data-sid="'+r+'"] td[data-s="'+s+'"]');el.scrollIntoView({block:'center'});el.click();},rows[9],cols[1]);await sleep(900);
await ev(p,()=>{const b=[...document.querySelectorAll('#cellModal button')].find(b=>b.textContent.trim()==='Malade');b.click();});await sleep(700);
console.log('boutons',await ev(p,()=>[...document.querySelectorAll('#cellStatus button')].map(b=>b.textContent).join(' | ')));
await p.screenshot({path:OUT+'malade-statut-telephone.png'});
await ev(p,()=>{const b=[...document.querySelectorAll('#cellModal button')].find(b=>b.textContent.trim()==='Enregistrer');b.click();});await sleep(800);
// légende de la grille (téléphone)
await ev(p,()=>{document.querySelectorAll('.modal.open').forEach(m=>m.classList.remove('open'));const l=document.querySelector('.legend2');l.scrollIntoView({block:'start'});window.scrollBy(0,-70);});await sleep(800);
await p.screenshot({path:OUT+'malade-legende-appel-telephone.png'});
// PDF bilan de classe
await ev(p,()=>{window.__lastPdf=null;});await C.tab(p,'reports');await sleep(500);
await ev(p,()=>{const s=document.getElementById('repClass');s.value=CJR.db().classes.find(c=>c.name==='2BACSP4').id;s.dispatchEvent(new Event('change',{bubbles:true}));});await sleep(500);
await ev(p,()=>{const s=document.getElementById('repScope');const o=[...s.options].find(o=>/Cycle 1/.test(o.text));if(o){s.value=o.value;s.dispatchEvent(new Event('change',{bubbles:true}));}});await sleep(600);
await ev(p,()=>document.getElementById('repExportPdf').click());for(let k=0;k<60&&!(await ev(p,()=>!!window.__lastPdf));k++)await sleep(300);
const b64=await ev(p,async()=>{const b=window.__lastPdf.blob;const a=new Uint8Array(await b.arrayBuffer());let s='';for(let i=0;i<a.length;i+=32768)s+=String.fromCharCode.apply(null,a.subarray(i,i+32768));return btoa(s);});
fs.writeFileSync(__dirname+'/shots/bilan-classe.pdf',Buffer.from(b64,'base64'));console.log('pdf ok; erreurs',p.__errs);await b.close();})().catch(e=>{console.error(e);process.exit(1);});
