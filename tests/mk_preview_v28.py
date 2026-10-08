from PIL import Image,ImageDraw,ImageFont
import subprocess,shutil
a=Image.open('/tmp/v28-notes-top.png');b=Image.open('/tmp/v28-notes-scroll.png')
g=40;W=a.width+b.width+g*3;H=max(a.height,b.height)+g*2+50
c=Image.new('RGB',(W,H),'#e5e7eb');c.paste(a,(g,g+50));c.paste(b,(a.width+2*g,g+50))
d=ImageDraw.Draw(c);f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28)
d.text((g,g-10),'1. Affichage Notes /20 · 2BAC · sport collectif',fill='#0b2545',font=f)
d.text((a.width+2*g,g-10),'2. Grille glissée vers les notes',fill='#0b2545',font=f)
c.save('/workspace/cj128-preview-notes.png')
subprocess.run(['pdftoppm','-r','110','-png','-f','1','-l','1','/tmp/v28-releve.pdf','/tmp/v28pdf'],check=True)
shutil.copy('/tmp/v28pdf-1.png','/workspace/cj128-preview-pdf.png')
