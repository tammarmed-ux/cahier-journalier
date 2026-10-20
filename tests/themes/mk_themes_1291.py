# 1.29.1 (-f) : génère le bloc <style id="cjThemes"> (thèmes terrain / néon ; 1.29.1 -g : « Clair minimal » et « Verre » retirés) à partir de /workspace/theme-proposals
import re,colorsys,os,runpy
PROP='/workspace/theme-proposals'
cwd=os.getcwd();os.chdir('/tmp')   # gen.py écrit ses fichiers dans le dossier courant -> /tmp (copie jetable)
for f in ['_pattern.txt']:open('/tmp/'+f,'w').write(open(PROP+'/'+f).read())
G=runpy.run_path(PROP+'/gen.py');os.chdir(cwd)
T={t['n']:t for t in G['T']};BRIDGE=open('/tmp/theme-bridge.css').read()
IDS={4:'terrain',10:'neon'};DARK=['neon']
APP={
'terrain':{'--t-hero-bg':'repeating-linear-gradient(90deg,rgba(255,255,255,.03) 0 34px,rgba(0,0,0,.04) 34px 68px),linear-gradient(150deg,#1B6B3D,#0F4223)','--t-stat-bg':'rgba(255,255,255,.08)','--t-stat-sub':'#fff','--t-hero-sub':'#fff','--t-hero-chip':'rgba(0,0,0,.18)','--warn':'#8A5300','--bad':'#B42330','--ok':'#16703D','--bg':'#F0F5F0','--card':'#fff','--ink':'#12301E','--muted':'#4B5E52','--line':'#DCE8DF','--pri':'#1C6B3A','--pri-2':'#2A9457','--pri-soft':'#E3F1E7','--pri-d':'#14532D','--pri-line':'#B9DCC4','--acc':'#B45309','--acc-d':'#92400E','--acc-soft':'#FEF3C7','--grad':'linear-gradient(135deg,#23824A 0%,#14532D 100%)','--focus':'0 0 0 3px rgba(28,107,58,.35)'},
'neon':{'--bg':'#0A0A12','--card':'#14141F','--t-s2':'#1B1B29','--t-input':'#1B1B29','--ink':'#F5F7FA','--muted':'#AEB3C4','--line':'#2C2C40','--pri':'#4FEAFF','--pri-2':'#00C8E0','--pri-soft':'rgba(0,229,255,.13)','--pri-d':'#9AF4FF','--pri-line':'rgba(0,229,255,.45)','--acc':'#C6FF00','--acc-d':'#A8DB00','--acc-soft':'rgba(198,255,0,.13)','--grad':'linear-gradient(135deg,#00B8D4 0%,#7C4DFF 100%)','--focus':'0 0 0 3px rgba(0,229,255,.45)','--t-fill':'#C6FF00','--t-fill-ink':'#0A0A12','--t-acc-fill':'#C6FF00','--t-acc-ink':'#0A0A12',
  '--ok':'#5EE38F','--ok-soft':'rgba(74,222,128,.14)','--bad':'#FF8FA3','--bad-soft':'rgba(255,95,162,.15)','--warn':'#FCD34D','--warn-soft':'rgba(251,191,36,.14)','--dsp':'#4b5563','--dsp-d':'#D1D5DB','--dsp-soft':'rgba(255,255,255,.08)','--dsp-ink':'#E5E7EB','--shadow':'none'}}
META={'terrain':'#1C6B3A','neon':'#0A0A12'}
def sc(t):return 'html[data-theme="%s"]'%t
DK='html[data-theme="neon"]'
out=['/* ===== 1.29.1 (-f) : thèmes d’affichage (préférence locale « cj.theme », aucune donnée) — généré par cj-emu/themes/mk_themes_1291.py ; sans data-theme = thème actuel inchangé ===== */']
# pont : html body -> html[data-theme] body
out.append(re.sub(r'/\*.*?\*/','',BRIDGE,flags=re.S).replace('html body','html[data-theme] body').strip())
for n,t in IDS.items():
    v=dict(T[n]['v']);v.update(APP[t])
    out.append(sc(t)+'{'+';'.join(k+':'+val for k,val in v.items())+(';color-scheme:dark' if t in DARK else '')+'}')
    ex=T[n]['extra']
    if ex:out.append(ex.replace('html body',sc(t)+' body'))
# --- sombres : correspondance automatique des fonds clairs codés en dur ---
def hx(h):
    h=h.lstrip('#');h=''.join(c*2 for c in h) if len(h)==3 else h;return tuple(int(h[i:i+2],16)/255 for i in (0,2,4))
def lum(c):
    f=lambda x:x/12.92 if x<=.03928 else ((x+.055)/1.055)**2.4
    r,g,b=c;return .2126*f(r)+.7152*f(g)+.0722*f(b)
def sat(c):return colorsys.rgb_to_hls(*c)[2]
def dkbg(c):
    if sat(c)<.25 or max(c)-min(c)<.06:return 'var(--t-s2)' if lum(c)<.93 else 'var(--card)'
    h,l,s=colorsys.rgb_to_hls(*c);return 'hsla(%d,%d%%,%d%%,.22)'%(h*360,min(s,0.9)*100,55)
def ltxt(c):
    h,l,s=colorsys.rgb_to_hls(*c)
    if s<.2:return 'var(--ink)' if l<.35 else 'var(--muted)'
    return 'hsl(%d,%d%%,%d%%)'%(h*360,min(s*100,95),78)
src=open('/workspace/cj-deploy/index.html',encoding='utf-8').read();head=src[:src.index('</head>')]
css=''.join(re.findall(r'<style>(.*?)</style>',head,flags=re.S));css=re.sub(r'/\*.*?\*/','',css,flags=re.S)
HEX=r'#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?\b'
def parse(s,i=0,ctx=None,acc=None):
    while i<len(s):
        j=s.find('{',i);k=s.find('}',i)
        if j<0 or (k>=0 and k<j):return k+1
        pre=s[i:j].strip()
        if pre.startswith('@media') or pre.startswith('@supports'):
            sub=[];i=parse(s,j+1,pre,sub);acc.append((pre,sub));continue
        if pre.startswith('@'):
            d=1;q=j+1
            while d:
                if s[q]=='{':d+=1
                elif s[q]=='}':d-=1
                q+=1
            i=q;continue
        e=s.find('}',j);acc.append((pre,s[j+1:e]));i=e+1
    return i
rules=[];parse(css,0,None,rules)
skip=re.compile(r'#cjLock|\.ln-|#land|\.land|splash|#gate|\.gate|\.hhero|\.hh-|\.qa\b|\.qa\.|\.qa |\.qa-h|nav\.tabs|header\.top|\.syncpill|\.remind|@media print|#updBar|\.ob-|#onb')
def conv(pre,body):
    if skip.search(pre):return None
    ds=[]
    for d in body.split(';'):
        if ':' not in d:continue
        p,val=d.split(':',1);p=p.strip();val=val.strip()
        imp=' !important' if '!important' in val else ''
        if p in('background','background-color'):
            hs=re.findall(HEX,val)
            if hs and 'url(' not in val and all(lum(hx(h))>.72 for h in hs):ds.append('background:'+dkbg(hx(hs[0]))+imp)
        elif p=='color':
            hs=re.findall(HEX,val)
            if len(hs)==1 and val.strip().lower() not in('#fff','#ffffff') and lum(hx(hs[0]))<.25:ds.append('color:'+ltxt(hx(hs[0]))+imp)
        elif p in('border','border-color','border-top','border-bottom','border-left','border-right'):
            hs=re.findall(HEX,val)
            if hs and all(lum(hx(h))>.6 for h in hs):ds.append(p+':'+re.sub(HEX,'var(--line)',val))
    if not ds:return None
    sels=[]
    for s in pre.split(','):
        s=s.strip()
        if not s:continue
        if s.startswith(':root'):return None
        if s.startswith('html'):
            rest=s[4:];sels+=['html[data-theme="%s"]'%t+rest for t in DARK]
        else:sels.append(DK+' '+s)
    return ','.join(sels)+'{'+';'.join(ds)+'}'
LIGHTT=['terrain','neon'];LK=':is('+','.join('html[data-theme="%s"]'%t for t in LIGHTT)+')'
def convL(pre,body):
    if skip.search(pre):return None
    ds=[]
    for d in body.split(';'):
        if ':' not in d:continue
        p_,val=d.split(':',1)
        if p_.strip()!='color':continue
        hs=re.findall(HEX,val)
        if len(hs)==1 and .17<lum(hx(hs[0]))<.7 and sat(hx(hs[0]))<.3:ds.append('color:var(--muted)')
    if not ds:return None
    sels=[]
    for x in pre.split(','):
        x=x.strip()
        if not x or x.startswith(':root'):return None
        sels+= ['html[data-theme="%s"]'%t+x[4:] for t in LIGHTT] if x.startswith('html') else [LK+' '+x]
    return ','.join(sels)+'{'+';'.join(ds)+'}'
auto=[]
for pre,body in rules:
    if isinstance(body,list):
        if 'print' in pre:continue
        inner=[c for c in (conv(a,b) for a,b in body if not isinstance(b,list)) if c]
        if inner:auto.append(pre+'{'+''.join(inner)+'}')
    else:
        c=conv(pre,body)
        if c:auto.append(c)
autoL=[]
for pre,body in rules:
    if isinstance(body,list):
        if 'print' in pre:continue
        inner=[c for c in (convL(a,b) for a,b in body if not isinstance(b,list)) if c]
        if inner:autoL.append(pre+'{'+''.join(inner)+'}')
    else:
        c=convL(pre,body)
        if c:autoL.append(c)
out+=autoL
out.append('/* sombre (néon) : fonds clairs codés en dur -> surfaces sombres ('+str(len(auto))+' règles générées) */')
out+=auto
HAND=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'dark-hand.css'),encoding='utf-8').read().replace('DK',DK)
out.append(re.sub(r'/\*.*?\*/','',HAND,flags=re.S).strip())
LIGHT=open(os.path.join(os.path.dirname(os.path.abspath(__file__)),'common-hand.css'),encoding='utf-8').read()
out.append(re.sub(r'/\*.*?\*/','',LIGHT,flags=re.S).strip())
res='\n'.join(out)
open('/workspace/cj-emu/themes/cjThemes.css','w').write(res)
import json;json.dump(META,open('/workspace/cj-emu/themes/meta.json','w'))
print(len(res),'octets,',len(auto),'règles auto')
