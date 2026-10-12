// Passe typographique rejouable (idempotente) : espace insécable avant : ; ? ! et à l'intérieur des « » — chaînes visibles seulement.
// node typo.js [dir] [--dry]  → écrit typo_log.json
const fs=require('fs'),esprima=require('../node_modules/esprima'),parse5=require('../node_modules/parse5');
const D=process.argv[2]&&!process.argv[2].startsWith('--')?process.argv[2]:'/workspace/cj-deploy';const DRY=process.argv.includes('--dry');
const ARABIC=/[\u0600-\u06FF]/;const log=[];
const RX=/ ([:;?!])(?=[\s"'`<)»\\$]|$)/g, RXo=/« /g, RXc=/ »/g;
function hasWords(s){return /[A-Za-zÀ-ÿ]{2,}/.test(s.replace(/<[^>]*>/g,' '));}
function codeLike(s){return /(^|[^\w])(function|return|var |===|&&|\|\||=>)/.test(s)||/\b\w+\s*\?\s*['"\w]+\s*:/.test(s);}
function fix(raw,nb){return raw.replace(RX,nb+'$1').replace(RXo,'«'+nb).replace(RXc,nb+'»');}
function lineOf(src,off){let n=1;for(let i=0;i<off;i++)if(src.charCodeAt(i)===10)n++;return n;}
function jsEdits(file,src,code,base,edits){let toks;try{toks=esprima.tokenize(code,{range:true,tolerant:true});}catch(e){console.error('tokenize',file,e.message);return;}
  toks.forEach((k,i)=>{if(k.type!=='String'&&k.type!=='Template')return;const raw=k.value;
    const glue=/^['"`] [:;?!] ?['"`]$/.test(raw)&&((toks[i-1]||{}).value==='+'||(toks[i+1]||{}).value==='+');   // ' : ' collé entre deux morceaux de texte visibles
    if(ARABIC.test(raw)||(!hasWords(raw)&&!glue)||codeLike(raw))return;
    const prev=toks.slice(Math.max(0,i-6),i).map(t=>t.value).join('');if(/console\.(log|warn|error|info)/.test(prev))return;
    const nr=fix(raw,'\\u00a0');if(nr!==raw)edits.push({file,s:base+k.range[0],e:base+k.range[1],old:raw,neu:nr,kind:'js'});});}
function htmlEdits(file,src,edits){const doc=parse5.parse(src,{sourceCodeLocationInfo:true});
  (function walk(n){if(n.nodeName==='script'){const c=n.childNodes&&n.childNodes[0];const ty=(n.attrs.find(a=>a.name==='type')||{}).value||'';
      if(c&&!/json/.test(ty))jsEdits(file,src,src.slice(c.sourceCodeLocation.startOffset,c.sourceCodeLocation.endOffset),c.sourceCodeLocation.startOffset,edits);
      else if(c){const L=c.sourceCodeLocation,raw=src.slice(L.startOffset,L.endOffset),nr=raw.replace(/"((?:[^"\\]|\\.)*)"/g,(m,x)=>hasWords(x)&&/\s/.test(x)?'"'+fix(x,'\u00a0')+'"':m);if(nr!==raw)edits.push({file,s:L.startOffset,e:L.endOffset,old:raw,neu:nr,kind:'json-ld'});}return;}
    if(n.nodeName==='style')return;
    if(n.nodeName==='#text'&&n.sourceCodeLocation){const L=n.sourceCodeLocation,raw=src.slice(L.startOffset,L.endOffset);if(!ARABIC.test(raw)&&hasWords(raw)){const nr=fix(raw,'\u00a0');if(nr!==raw)edits.push({file,s:L.startOffset,e:L.endOffset,old:raw,neu:nr,kind:'text'});}}
    (n.attrs||[]).forEach(a=>{if(!['placeholder','title','aria-label','alt','content','label'].includes(a.name)||!n.sourceCodeLocation.attrs)return;const L=n.sourceCodeLocation.attrs[a.name];const raw=src.slice(L.startOffset,L.endOffset);
      if(ARABIC.test(raw)||!hasWords(a.value))return;const nr=fix(raw,'\u00a0');if(nr!==raw)edits.push({file,s:L.startOffset,e:L.endOffset,old:raw,neu:nr,kind:'@'+a.name});});
    (n.childNodes||[]).concat(n.content?n.content.childNodes:[]).forEach(walk);})(doc);}
function apply(file,fn){const p=D+'/'+file,src=fs.readFileSync(p,'utf8'),edits=[];fn(file,src,edits);
  edits.sort((a,b)=>b.s-a.s);let out=src;edits.forEach(e=>{out=out.slice(0,e.s)+e.neu+out.slice(e.e);});
  edits.reverse().forEach(e=>{const ol=e.old.split('\n'),nl=e.neu.split('\n');ol.forEach((l,j)=>{if(l!==nl[j])log.push({file,line:lineOf(src,e.s)+j,kind:e.kind,before:l.trim(),after:nl[j].trim()});});});
  if(!DRY&&out!==src)fs.writeFileSync(p,out);}
apply('index.html',htmlEdits);
['cj-pdf.js','cj-crypto.js','sw.js','op2007-athle.js'].forEach(f=>apply(f,(file,src,ed)=>jsEdits(file,src,src,0,ed)));
fs.writeFileSync(__dirname+'/typo_log.json',JSON.stringify(log,null,1));
let n=0;log.forEach(r=>{n+=(r.after.match(/\u00a0|\\u00a0/g)||[]).length-(r.before.match(/\u00a0|\\u00a0/g)||[]).length;});
console.error(log.length+' lignes modifiées, ~'+n+' espaces insécables ajoutées'+(DRY?' (dry)':''));
