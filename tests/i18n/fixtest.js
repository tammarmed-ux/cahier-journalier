// Met à jour les attentes d'un test (espace insécable) sur les lignes check(...) dont le titre contient un des motifs.
// node fixtest.js test.js "motif1" "motif2" ...  (appliqué à cj-emu et cj-deploy/tests si présents)
const fs=require('fs'),esprima=require('/workspace/cj-emu/node_modules/esprima');
const [f,...pats]=process.argv.slice(2);
for(const d of ['/workspace/cj-emu/','/workspace/cj-deploy/tests/']){const p=d+f;if(!fs.existsSync(p))continue;
  const L=fs.readFileSync(p,'utf8').split('\n');let n=0;
  L.forEach((line,i)=>{if(!pats.some(x=>line.includes(x)))return;if(!/check\(/.test(line))return;
    let toks;try{toks=esprima.tokenize(line,{range:true,tolerant:true});}catch(e){console.error('tok',i+1,e.message);return;}
    const ci=toks.findIndex((t,j)=>t.value==='check'&&toks[j+1]&&toks[j+1].value==='(');const title=toks[ci+2];
    const ed=[];toks.forEach(t=>{if(t===title||t.range[0]<title.range[1])return;let r=t.value,nr=r;
      if(t.type==='String'||t.type==='Template')nr=r.replace(/ ([:;?!])(?=[\s'"`)\\]|$)/g,'\\u00a0$1').replace(/« /g,'«\\u00a0').replace(/ »/g,'\\u00a0»');
      else if(t.type==='RegularExpression')nr=r.replace(/ ([:;!]|\\\?)/g,'\\u00a0$1').replace(/« /g,'«\\u00a0').replace(/ »/g,'\\u00a0»');
      if(nr!==r)ed.push([t.range[0],t.range[1],nr]);});
    if(!ed.length)return;let s=line;ed.reverse().forEach(([a,b,x])=>{s=s.slice(0,a)+x+s.slice(b);});L[i]=s;n++;console.log(p+':'+(i+1));});
  fs.writeFileSync(p,L.join('\n'));if(!n)console.log('rien',p);}
