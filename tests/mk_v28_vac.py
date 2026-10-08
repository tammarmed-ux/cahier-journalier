from PIL import Image,ImageDraw,ImageFont
f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30);f2=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',26)
g=36;grid=Image.open('/tmp/v28v-grid.png')
reg=Image.open('/tmp/v28vh3-3.png').crop((90,200,1577,1120));ch=Image.open('/tmp/v28vh1-1.png').crop((90,1371,1577,1885))
RW=1150
def fit(i):return i.resize((RW,int(i.height*RW/i.width)),Image.LANCZOS)
reg,ch=fit(reg),fit(ch)
W=g+grid.width+g+RW+g;H=g+96+max(grid.height,reg.height+g+60+ch.height)+g
c=Image.new('RGB',(W,H),'#e5e7eb');d=ImageDraw.Draw(c)
d.text((g,g-4),'1. Absences (téléphone)',fill='#0b2545',font=f);d.text((g,g+40),'S6 = férié · 19/10, 22/10 = vacances · S7',fill='#0f766e',font=f2)
c.paste(grid,(g,g+96));x=g+grid.width+g
d.text((x,g-4),'2. PDF bilan du cycle : registre + tableau',fill='#0b2545',font=f);d.text((x,g+40),'vacances : date seule, pas de numéro consommé',fill='#0f766e',font=f2)
c.paste(reg,(x,g+96));y=g+96+reg.height+g
d.text((x,y),'3. PDF : graphiques par séance (S5 · S6 · 19/10 · S7)',fill='#0b2545',font=f);c.paste(ch,(x,y+60))
c.save('/workspace/cj128-vacances.png');print(c.size)
