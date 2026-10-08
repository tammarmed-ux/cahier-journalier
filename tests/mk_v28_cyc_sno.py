from PIL import Image,ImageDraw,ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30);f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26)
def comp(ims,out):
  I=[Image.open(a) for a,_,_ in ims];g=36;W=sum(i.width for i in I)+g*(len(I)+1);H=max(i.height for i in I)+g*2+96
  c=Image.new('RGB',(W,H),'#e5e7eb');d=ImageDraw.Draw(c);x=g
  for (a,t,t2),i in zip(ims,I):c.paste(i,(x,g+96));d.text((x,g-4),t,fill='#0b2545',font=f);d.text((x,g+40),t2,fill='#0f766e',font=f2);x+=i.width+g
  c.save(out);print(out,c.size)
comp([('/tmp/v28c-settings.png','1. Paramètres › Cycles et activités','pointillé = auto (déduit du nom)'),('/tmp/v28c-proc.png','2. Exception pour une seule classe','barre Notes /20 · Note procéd.')],'/workspace/cj128-cycle-type.png')
comp([('/tmp/v28s-grid.png','Absences : séances numérotées en continu','S1–S4 fériés (non comptés) · 28/09 = S5')],'/workspace/cj128-seances-numerotees.png')
