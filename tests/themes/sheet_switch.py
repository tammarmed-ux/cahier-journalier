from PIL import Image,ImageDraw,ImageFont
D='/workspace/backups/v1.29.1-preview/';TH=[('actuel','Actuel'),('terrain','Vert terrain'),('neon','Néon sport')];SC=[('picker','Sélecteur ouvert'),('home','Accueil'),('attendance','Absences'),('modal','Fiche élève')]
W,H=390*2,844*2;pad=36;lab=100;top=90
F=lambda n:ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',n)
sh=Image.new('RGB',(len(SC)*(W+pad)+pad+260,top+len(TH)*(H+lab+pad)+pad),'#E9EDF3');d=ImageDraw.Draw(sh)
for j,(k,l) in enumerate(SC):d.text((260+pad+j*(W+pad)+W/2-d.textlength(l,font=F(40))/2,30),l,font=F(40),fill='#14213A')
for i,(t,n) in enumerate(TH):
  y=top+i*(H+lab+pad);d.ellipse([pad,y+lab+H/2-50,pad+100,y+lab+H/2+50],fill='#0B3A6E');s=str(i+1);d.text((pad+50-d.textlength(s,font=F(50))/2,y+lab+H/2-30),s,font=F(50),fill='white')
  d.text((pad,y+lab+H/2+70),n,font=F(34),fill='#14213A')
  for j,(k,l) in enumerate(SC):
    x=260+pad+j*(W+pad);im=Image.open(D+'theme-switch-%s-%s.png'%(t,k)).convert('RGB').resize((W,H),Image.LANCZOS)
    m=Image.new('L',(W,H),0);ImageDraw.Draw(m).rounded_rectangle([0,0,W,H],radius=26,fill=255);d.rounded_rectangle([x-4,y+lab-4,x+W+4,y+lab+H+4],radius=30,fill='#C9D1DD');sh.paste(im,(x,y+lab),m)
sh.save(D+'theme-switch-all.png',optimize=True);sh.resize((sh.width//6,sh.height//6)).save('/tmp/tsa.png');print(sh.size)
