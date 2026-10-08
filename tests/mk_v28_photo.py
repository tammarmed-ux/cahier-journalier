from PIL import Image,ImageDraw,ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30);f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26)
ims=[('/tmp/v28p-fiche.png','1. Fiche élève','photo en face de Classe / Code / Sexe / Naissance'),('/tmp/v28p-menu.png','2. Appui sur la photo','Prendre / Choisir / Supprimer'),('/tmp/v28p-crop.png','3. Recadrage','glisser + zoom → 256 px, ≤ 25 Ko'),('/tmp/v28p-list.png','4. Liste des élèves','avatar rond (initiales sinon)')]
I=[Image.open(a) for a,_,_ in ims];g=36;W=sum(i.width for i in I)+g*(len(I)+1);H=max(i.height for i in I)+g*2+96
c=Image.new('RGB',(W,H),'#e5e7eb');d=ImageDraw.Draw(c);x=g
for (a,t,t2),i in zip(ims,I):c.paste(i,(x,g+96));d.text((x,g-4),t,fill='#0b2545',font=f);d.text((x,g+40),t2,fill='#0f766e',font=f2);x+=i.width+g
d.text((g,H-g+2),'Illustrations générées (aucune photo de personne réelle) · démo Lycée qualifiant Baja',fill='#475569',font=f2)
c=c.crop((0,0,W,H+40)) if False else c
c.save('/workspace/cj128-photos.png');print(c.size)
