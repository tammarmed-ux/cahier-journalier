// Extraction de toutes les chaînes potentiellement visibles (rejouable) : node extract.js [dir] > strings.tsv
const fs=require('fs'),path=require('path'),esprima=require('../node_modules/esprima'),parse5=require('../node_modules/parse5');
const D=process.argv[2]||'/workspace/cj-deploy';const out=[];
const visible=s=>{const t=s.replace(/<[^>]*>/g,' ').replace(/&[a-z]+;|&#\d+;/g,' ').replace(/[ \t\r\n]+/g,' ').replace(/^[ \t\r\n]+|[ \t\r\n]+$/g,'');
  if(!/[A-Za-zÀ-ÿ]{2,}/.test(t))return null;if(/^(https?:|data:|\.\/|\/|#|[.#]?[a-z][\w-]*\s*[{:(]|[\w.-]+\.(js|png|jpg|css|json|html|svg|ico|webmanifest)$)/i.test(t))return null;
  if(/^[\w$.\-\/\[\]=]+$/.test(t)&&!/[À-ÿ]/.test(t)&&!/^[A-ZÉ][a-zéèêàç]{2,}/.test(t))return null;   // identifiants
  if(/^[\w-]+(\s+[\w-]+)*$/.test(t)&&/^(?:[a-z0-9]+-)+[a-z0-9]+|^(?:btn|card|row|chip|lg|sm|hidden|muted|small|grow|sec)\b/.test(t)&&!/[À-ÿ]/.test(t))return null;   // classes CSS
  if(/[{};]\s*$/.test(t)&&/:/.test(t)&&!/[À-ÿ]/.test(t))return null;   // CSS
  return t;};
function jsStrings(file,code,lineOff){let toks;try{toks=esprima.tokenize(code,{loc:true,tolerant:true});}catch(e){console.error('tokenize',file,e.message);return;}
  toks.forEach(k=>{if(k.type!=='String'&&k.type!=='Template')return;let raw=k.value;let v;
    if(k.type==='String'){try{v=eval(raw);}catch(e){v=raw.slice(1,-1);}}else v=raw.replace(/^[`}]|(`|\$\{)$/g,'');
    const t=visible(v);if(t)out.push([file,k.loc.start.line+lineOff,'js',t]);});}
function html(file,src){const doc=parse5.parse(src,{sourceCodeLocationInfo:true});
  (function walk(n){if(n.nodeName==='script'){const c=n.childNodes&&n.childNodes[0];const ty=(n.attrs.find(a=>a.name==='type')||{}).value||'';
      if(c&&!/json/.test(ty))jsStrings(file,c.value,c.sourceCodeLocation.startLine-1);else if(c&&/json/.test(ty)){const re=/"((?:[^"\\]|\\.)*)"/g;let m;while((m=re.exec(c.value))){const t=visible(JSON.parse('"'+m[1]+'"'));if(t&&/\s/.test(t))out.push([file,c.sourceCodeLocation.startLine,'json-ld',t]);}}return;}
    if(n.nodeName==='style')return;
    if(n.nodeName==='#text'){const t=visible(n.value);if(t)out.push([file,n.sourceCodeLocation.startLine,'text',t]);}
    (n.attrs||[]).forEach(a=>{if(['placeholder','title','aria-label','alt','content','label','value'].includes(a.name)){const t=visible(a.value);if(t&&(a.name!=='value'||/\s/.test(t)))out.push([file,n.sourceCodeLocation.attrs?n.sourceCodeLocation.attrs[a.name].startLine:n.sourceCodeLocation.startLine,'@'+a.name,t]);}});
    (n.childNodes||[]).concat(n.content?n.content.childNodes:[]).forEach(walk);})(doc);}
html('index.html',fs.readFileSync(D+'/index.html','utf8'));
['cj-pdf.js','cj-crypto.js','sw.js','op2007-athle.js'].forEach(f=>jsStrings(f,fs.readFileSync(D+'/'+f,'utf8'),0));
const man=JSON.parse(fs.readFileSync(D+'/manifest.webmanifest','utf8'));(function w(o,k){if(typeof o==='string'){const t=visible(o);if(t)out.push(['manifest.webmanifest',0,k,t]);}else if(o&&typeof o==='object')Object.keys(o).forEach(x=>w(o[x],k+'.'+x));})(man,'');
['robots.txt','sitemap.xml'].forEach(f=>fs.readFileSync(D+'/'+f,'utf8').split('\n').forEach((l,i)=>{const t=visible(l);if(t&&/[À-ÿ]|\s[a-z]{3,}\s/.test(t))out.push([f,i+1,'txt',t]);}));
const seen=new Set();out.forEach(r=>{const key=r[0]+r[3];r.push(seen.has(key)?'dup':'');seen.add(key);});
process.stdout.write(out.map(r=>r.join('\t')).join('\n')+'\n');console.error(out.length+' chaînes ('+out.filter(r=>!r[4]).length+' uniques)');
