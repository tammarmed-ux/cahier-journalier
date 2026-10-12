# Corrections de contenu (exactes, comptées) — rejouable : python3 content_fixes.py [dir] ; journal JSON en sortie
import sys,json,re
D=sys.argv[1] if len(sys.argv)>1 else '/workspace/cj-deploy'
FIX=[ # (fichier, avant, après, catégorie, nb attendu ou None=>=1)
 ('index.html','absent, sans tenue, maladie, retard, absences justifiées','absent, sans tenue, malade, retard, absence justifiée','Malade',1),
 ('index.html','Sans tenue → Maladie → Retard → Maladie justifiée → Absence justifiée','Sans tenue → Malade → Retard → Malade justifié → Absence justifiée','Malade',1),
 ('index.html','puis 🩺 Dispensé ; ses cases deviennent violettes et barrées, les autres marques restent possibles','puis 🩺 Dispensé ; ses cases deviennent grises, les autres marques restent possibles','Exactitude',1),
 ('index.html','Maladie non justifiée','Malade non justifié','Malade',None),
 ('index.html','Maladie justifiée','Malade justifié','Malade',None),
 ('index.html','Maladie non just.','Malade non just.','Malade',None),
 ('index.html','Maladie just.','Malade just.','Malade',None),
 ('index.html','data-v="M">Maladie</button>','data-v="M">Malade</button>','Malade',1),
 ('index.html',"tM:'Maladie (M)'","tM:'Malade (M)'",'Malade',1),
 ('index.html',"['M','M','Maladie']","['M','M','Malade']",'Malade',1),
 ('index.html','M=maladie non justifiée R=retard MJ=maladie justifiée','M=malade non justifié R=retard MJ=malade justifié','Malade',1),
 ('index.html',"{k:'soup',l:'Souplesse (sit and reach)'","{k:'soup',l:'Souplesse (flexion avant assis)'",'Anglicisme',1),
 ('index.html',"'1er semestre':'2ème semestre')+' (Cycles '","'1er semestre':'2e semestre')+' (cycles '",'Orthographe / typographie',1),
 ('index.html','>Nom A–Z</option>','>Nom A→Z</option>','Cohérence',1),
 ('index.html','>Nom Z–A</option>','>Nom Z→A</option>','Cohérence',1),
 ('index.html','sauvegarde du Cahier journalier digital.','sauvegarde du Cahier Journalier digital.','Cohérence',1),
 ('cj-pdf.js','Maladie non justifiée','Malade non justifié','Malade',None),
 ('cj-pdf.js','Maladie justifiée','Malade justifié','Malade',None),
 ('cj-pdf.js','Maladie non just.','Malade non just.','Malade',None),
 ('cj-pdf.js',"l:'Maladie M / MJ',s:'non justifiée / justifiée'","l:'Malade M / MJ',s:'non justifié / justifié'",'Malade + accord',1),
 ('cj-pdf.js',"l:'Maladie M / MJ'","l:'Malade M / MJ'",'Malade',2),
 ('cj-pdf.js','M = maladie non justifiée · MJ = maladie justifiée','M = malade non justifié · MJ = malade justifié','Malade',1),
 ('cj-pdf.js','M = maladie non justifiée, R = retard','M = malade non justifié, R = retard','Malade',1),
 ('cj-pdf.js',"' (absences, maladies, retards, sans tenue) · classés","' (absent, malade, retard, sans tenue) · classés",'Malade',1),
 ('cj-pdf.js',"it.unshift({l:'P = présent',c:","it.unshift({l:'P = Présent',c:",'Cohérence',1),
]
log=[]
for f,a,b,cat,n in FIX:
    p=D+'/'+f;s=open(p,encoding='utf-8').read();lines=[]
    pos=0
    while True:
        i=s.find(a,pos)
        if i<0:break
        lines.append(s.count('\n',0,i)+1);pos=i+len(a)
    if (n is not None and len(lines)!=n) or not lines:
        raise SystemExit('ATTENDU %s × %r dans %s, trouvé %d'%(n,a,f,len(lines)))
    s=s.replace(a,b);open(p,'w',encoding='utf-8').write(s)
    log.append({'file':f,'lines':lines,'before':a,'after':b,'cat':cat,'count':len(lines)})
json.dump(log,open('content_log.json','w'),ensure_ascii=False,indent=1)
print(sum(x['count'] for x in log),'remplacements,',len(log),'règles')
