# Génère la table OP 2009 (collège) de college.js depuis baremes_op2009_college_final.json (validé le 2026-10-21).
# Ordre des paliers comme op2007-athle.js : du plus faible (0,3) au meilleur (6) ; temps m.ss gardés tels qu'imprimés.
import json,re,sys
SRC='/workspace/college-baremes/baremes_op2009_college_final.json'
d=json.load(open(SRC))
MAP={'1000m':'endurance','600m':'endurance','poids_4kg':'poids','poids_3kg':'poids','vitesse_80m':'vitesse','vitesse_60m':'vitesse','triple_saut':'triple','longueur':'longueur','hauteur':'hauteur'}
G={}
for lv in ('1AC','2AC','3AC'):
  G[lv]={}
  for sx,S in (('garcons','G'),('filles','F')):
    g={}
    for k,e in d[lv][sx].items():
      ev=MAP[k];rows=e['rows'][::-1]
      assert len(rows)==20 and abs(rows[0]['note']-0.3)<1e-9 and abs(rows[-1]['note']-6)<1e-9,(lv,sx,k)
      g[ev]=[r['printed'] if e['unit']=='m.ss' else (int(r['value']) if r['value']==int(r['value']) else r['value']) for r in rows]
    assert sorted(g)==sorted(['endurance','poids','vitesse','triple','longueur','hauteur']),(lv,sx)
    G[lv][S]=g
data=json.dumps(G,separators=(',',':'),ensure_ascii=False)
p='/workspace/cj-deploy/college.js';s=open(p,encoding='utf8').read()
s2=re.sub(r'/\*OP2009\*/.*?/\*\/OP2009\*/','/*OP2009*/'+data.replace('\\','\\\\')+'/*/OP2009*/',s,flags=re.S)
assert s2!=s or data in s
open(p,'w',encoding='utf8').write(s2);print('ok',len(data))
