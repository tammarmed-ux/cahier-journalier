import re,json
P='/workspace/cj-deploy/index.html';s=open(P,encoding='utf-8').read()
CSS=open('/workspace/cj-emu/themes/cjThemes.css',encoding='utf-8').read();META=json.load(open('/workspace/cj-emu/themes/meta.json'))
JS=open('/workspace/cj-emu/themes/picker.js',encoding='utf-8').read().replace('__META__',json.dumps(META))
B1='<!--cj-themes-head-->';E1='<!--/cj-themes-head-->'
head=B1+'\n<style id="cjThemes">\n'+CSS+'\n</style>\n<script>/* 1.29.1 (-f) : thème mémorisé appliqué avant affichage (préférence locale) */(function(){try{var t=localStorage.getItem(\'cj.theme\'),M='+json.dumps(META)+';if(M[t]){document.documentElement.setAttribute(\'data-theme\',t);var m=document.querySelector(\'meta[name="theme-color"]\');if(m)m.setAttribute(\'content\',M[t]);}}catch(e){}})();</script>\n'+E1
if B1 in s:s=re.sub(re.escape(B1)+'.*?'+re.escape(E1),lambda m:head,s,flags=re.S)
else:s=s.replace('</head>',head+'\n</head>',1)
PAL='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.84-.44-1.13-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.55-2.5 5.55-5.55C21.97 6.01 17.46 2 12 2z"/><circle cx="13.5" cy="6.5" r="1" fill="currentColor"/><circle cx="17.5" cy="10.5" r="1" fill="currentColor"/><circle cx="8.5" cy="7.5" r="1" fill="currentColor"/><circle cx="6.5" cy="12.5" r="1" fill="currentColor"/></svg>'
btn='  <button type="button" class="thbtn" id="themeBtn" aria-label="Changer de thème" aria-haspopup="true" aria-expanded="false" aria-controls="thPop" title="Thème"><i>'+PAL+'</i></button>'
if 'id="themeBtn"' not in s:
  a='<span class="lbl">Local</span></button>\n';assert s.count(a)==1;s=s.replace(a,a+btn+'\n',1)
popd='<div id="thPop" role="dialog" aria-label="Thème de l’application"><h3>Thème</h3><div class="thlist" id="thList" role="radiogroup" aria-label="Thème"></div></div>'
if 'id="thPop"' not in s:
  a='</header>\n\n<main>';assert s.count(a)==1;s=s.replace(a,'</header>\n'+popd+'\n\n<main>',1)
card='  <div class="card" id="themeCard"><h2>🎨 Thème</h2><p class="small muted" style="margin-top:0">Apparence de l’application sur cet appareil (aussi accessible par l’icône palette en haut). Vos données et les PDF ne changent pas.</p><div id="themeSw" role="radiogroup" aria-label="Thème"></div></div>'
if 'id="themeCard"' not in s:
  a='  <div class="card" id="secCard">';i=s.index(a);j=s.index('\n',i)+1;s=s[:j]+card+'\n'+s[j:]
B2='<!--cj-themes-js-->';E2='<!--/cj-themes-js-->';js=B2+'<script>\n'+JS+'</script>'+E2
if B2 in s:s=re.sub(re.escape(B2)+'.*?'+re.escape(E2),lambda m:js,s,flags=re.S)
else:
  i=s.rindex('</body>');s=s[:i]+js+'\n'+s[i:]
open(P,'w',encoding='utf-8').write(s);print('ok')
