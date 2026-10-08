from PIL import Image, ImageDraw, ImageFont
P=['/tmp/v28t-before.png','/tmp/v28t-after.png','/tmp/v28t-after-form.png']
L=['AVANT (321c845, -g) : grille compacte','APRÈS (-h) : puces Lun→Sam, cartes par jour','APRÈS (-h) : formulaire « Modifier » (appui sur un créneau)']
F='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
try: font=ImageFont.truetype(F,30)
except: font=ImageFont.load_default()
ims=[Image.open(p).convert('RGB') for p in P]
pad=40;top=90;W=sum(i.width for i in ims)+pad*(len(ims)+1);H=max(i.height for i in ims)+top+pad
out=Image.new('RGB',(W,H),(236,240,246));d=ImageDraw.Draw(out);x=pad
for im,l in zip(ims,L):
    d.text((x,28),l if len(l)<40 else l[:38]+'…',fill=(11,58,110),font=font) if False else None
    # wrap label to panel width
    words=l.split(' ');lines=[''];
    for w in words:
        t=(lines[-1]+' '+w).strip()
        if d.textlength(t,font=font)<=im.width: lines[-1]=t
        else: lines.append(w)
    for k,ln in enumerate(lines[:2]): d.text((x,12+k*36),ln,fill=(11,58,110),font=font)
    out.paste(im,(x,top));x+=im.width+pad
out.save('/workspace/cj128-creneaux.png',optimize=True);print(out.size)
