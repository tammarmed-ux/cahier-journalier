from PIL import Image,ImageDraw,ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30);f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26)
ims=[('/tmp/v28h-before.png','AVANT (1.28.0-e)','Accueil : cartes empilées'),('/tmp/v28h-after.png','APRÈS (1.28.0-f)','en-tête + prochaine séance + indicateurs'),('/tmp/v28h-after2.png','APRÈS (suite)','accès rapide + « Aujourd’hui »')]
I=[Image.open(a) for a,_,_ in ims];g=36;W=sum(i.width for i in I)+g*(len(I)+1);H=max(i.height for i in I)+g*2+96
c=Image.new('RGB',(W,H),'#e5e7eb');d=ImageDraw.Draw(c);x=g
for k,((a,t,t2),i) in enumerate(zip(ims,I)):
  c.paste(i,(x,g+96));d.text((x,g-4),t,fill='#9a3412' if k==0 else '#0b2545',font=f);d.text((x,g+40),t2,fill='#0f766e',font=f2);x+=i.width+g
c.save('/workspace/cj128-accueil.png');print(c.size)
