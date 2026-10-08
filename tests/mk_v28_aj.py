from PIL import Image, ImageDraw, ImageFont
font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',28)
cols=[[('AVANT (-h)','/tmp/v28i-aj-before.png')],[('APRÈS (-i) : séances du jour','/tmp/v28i-aj-after.png')],[('APRÈS : aucune séance aujourd’hui','/tmp/v28i-aj-none.png'),('En-tête conservé : « Prochaine »','/tmp/v28i-aj-hero.png')]]
pad=40;lab=50;cw=702
H=max(sum(Image.open(f).height+lab+pad for _,f in c) for c in cols)+pad
out=Image.new('RGB',(pad+len(cols)*(cw+pad),H),(236,240,246));d=ImageDraw.Draw(out)
for i,c in enumerate(cols):
    x=pad+i*(cw+pad);y=pad//2
    for l,f in c:
        im=Image.open(f).convert('RGB');d.text((x,y+8),l,fill=(11,58,110),font=font);out.paste(im,(x,y+lab));y+=lab+im.height+pad
out.save('/workspace/cj128-aujourdhui.png',optimize=True);print(out.size)
