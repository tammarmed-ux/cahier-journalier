from PIL import Image,ImageDraw,ImageFont
ims=[('/tmp/v28p-proc-coll.png','1. Note procédurale · sport collectif'),('/tmp/v28p-proc-athle.png','2. Note procédurale · athlétisme'),('/tmp/v28p-notes-coll.png','3. Notes /20 · mêmes notes (synchro)')]
I=[Image.open(a) for a,_ in ims];g=36;W=sum(i.width for i in I)+g*(len(I)+1);H=max(i.height for i in I)+g*2+56
c=Image.new('RGB',(W,H),'#e5e7eb');d=ImageDraw.Draw(c);f=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',30);x=g
for (a,t),i in zip(ims,I):c.paste(i,(x,g+56));d.text((x,g-4),t,fill='#0b2545',font=f);x+=i.width+g
c.save('/workspace/cj128-procedurale.png');print(c.size)
