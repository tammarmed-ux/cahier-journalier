# Génère corrections-orthographe.md à partir de content_log.json et typo_log_all.json
import json,re,collections
C=json.load(open('content_log.json'));T=json.load(open('typo_log_all.json'))+[{'file':'manifest.webmanifest','line':4,'kind':'description','before':'Cahier journalier du professeur d’EPS : élèves','after':'Cahier journalier du professeur d’EPS\u00a0: élèves'}]
out=['# Corrections d’orthographe et de typographie — préversion 1.29.0 (`cahier-v29-b`)','',
'Branche `v1.29-crypto`. Rejouable : `cd /workspace/cj-emu/i18n && node extract.js > strings.tsv` (liste exhaustive des chaînes visibles), `python3 content_fixes.py`, `node typo.js` (idempotent), `python3 report.py`.','',
'Légende : `⍽` = espace insécable U+00A0 (dans le code JavaScript elle est écrite `\\u00a0`).','']
cats=collections.Counter()
for c in C: cats[c['cat']]+=c['count']
def nb(s): return s.replace('\\u00a0','⍽').replace('\u00a0','⍽')
ntypo=0
for r in T: ntypo+=len(re.findall(r'\u00a0|\\u00a0',r['after']))-len(re.findall(r'\u00a0|\\u00a0',r['before']))
out+=['## Résumé','','| Catégorie | Corrections |','|---|---|']
for k,v in cats.most_common(): out.append('| %s | %d |'%(k,v))
out.append('| Typographie (espace insécable avant : ; ? ! et dans « ») | %d (sur %d lignes) |'%(ntypo,len(T)))
out.append('| **Total** | **%d** |'%(sum(cats.values())+ntypo)); out+=['']
out+=['## 1. Corrections de contenu (avant → après)','','| Fichier : ligne(s) | Catégorie | Avant | Après |','|---|---|---|---|']
for c in C: out.append('| %s : %s | %s | `%s` | `%s` |'%(c['file'],', '.join(map(str,c['lines'])),c['cat'],c['before'].replace('|','\\|'),c['after'].replace('|','\\|')))
out+=['','## 2. Typographie — espaces insécables (avant → après, extrait autour de chaque changement)','','| Emplacement | Type | Avant | Après |','|---|---|---|---|']
for r in T:
    b,a=r['before'],r['after']
    # découpe en fragments modifiés
    i=0;frags=[]
    import difflib
    sm=difflib.SequenceMatcher(None,b,a,autojunk=False)
    for op,i1,i2,j1,j2 in sm.get_opcodes():
        if op!='equal': frags.append((b[max(0,i1-30):i2+12],a[max(0,j1-30):j2+12]))
    for fb,fa in frags: out.append('| %s : %d | %s | `…%s…` | `…%s…` |'%(r['file'],r['line'],r['kind'],nb(fb).replace('|','\\|').replace('`',"'"),nb(fa).replace('|','\\|').replace('`',"'")))
out+=['',open('untouched.md').read()]
open('/workspace/backups/v1.29.0-preview/corrections-orthographe.md','w').write('\n'.join(out)+'\n')
print(dict(cats),ntypo,len(T))
