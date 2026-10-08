from PIL import Image, ImageDraw, ImageFont
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28)
P=[('AVANT (-j)','/tmp/v28k-before.png'),('APRÈS (-k) : sans AJ + évolution hebdo','/tmp/v28k-after.png')]
ims=[Image.open(f).convert('RGB') for _,f in P];pad=40;lab=56
out=Image.new('RGB',(pad+sum(i.width+pad for i in ims),max(i.height for i in ims)+lab+pad),(236,240,246));d=ImageDraw.Draw(out);x=pad
for (l,_),im in zip(P,ims):
    d.text((x,14),l,fill=(11,58,110),font=font);out.paste(im,(x,lab));x+=im.width+pad
out.save('/workspace/cj128-stats.png',optimize=True);print(out.size)
