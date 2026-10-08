import sys,unicodedata
from pdfminer.high_level import extract_text
from bidi.algorithm import get_display
def nf(t):
    out=''
    for ch in t:
        out+=unicodedata.normalize('NFKC',ch)[::-1] if 0xFEF5<=ord(ch)<=0xFEFC else unicodedata.normalize('NFKC',ch)
    return out
t=nf(extract_text(sys.argv[1])).replace(' ','')
ok=[n for n in sys.argv[2:] if unicodedata.normalize('NFKC',get_display(n)).replace(' ','') in t]
print('%d/%d'%(len(ok),len(sys.argv)-2))
