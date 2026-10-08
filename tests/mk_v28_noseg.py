from PIL import Image, ImageDraw, ImageFont
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30)
P=[('AVANT (-h) : bascule Absences | Notes /20','/tmp/v28s-before0.png'),('APRÈS (-i) : plus de bascule','/tmp/v28s-after0.png'),('APRÈS : grille + notes (inchangées)','/tmp/v28s-after2.png')]
ims=[Image.open(f).convert('RGB') for _,f in P];pad=40;lab=60
out=Image.new('RGB',(pad+sum(i.width+pad for i in ims),max(i.height for i in ims)+lab+pad),(236,240,246));d=ImageDraw.Draw(out);x=pad
for (l,_),im in zip(P,ims):
    while d.textlength(l,font=font)>im.width: l=l[:-2]
    d.text((x,16),l,fill=(11,58,110),font=font);out.paste(im,(x,lab));x+=im.width+pad
out.save('/workspace/cj128-sans-bascule.png',optimize=True);print(out.size)
