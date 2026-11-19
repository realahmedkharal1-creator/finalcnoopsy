import json
T0=0.82; T1=49.0
cuts=[2.16,5.02,9.07,11.31,15.88,18.28,22.65,25.63,29.46,31.89,34.59,36.33,39.26,41.38,43.75,44.91,46.44,48.67]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/pixel_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
B=[br(3.4,6.3,1.0),br(6.4,9.0,71.5),
 br(9.4,11.0,83.3),br(11.0,13.0,111.0),br(13.3,15.4,122.7),br(15.4,18.2,141.0),
 br(18.9,21.0,152.4),br(21.0,22.6,156.1),
 br(22.9,25.0,85.3,"split_top"),
 br(26.2,29.3,220.4),br(29.9,32.0,295.3),br(32.2,34.6,538.4,"split_top"),
 br(34.9,36.7,331.9,"split_top"),br(36.8,39.4,439.9,"split_top"),br(39.5,41.4,447.4),br(41.6,43.7,273.8)]
L=[(T0,3.4,"full"),(3.4,22.7,"circle"),(22.7,25.1,"split"),(25.1,32.1,"circle"),(32.1,34.7,"split"),(34.7,39.45,"split"),(39.45,44.0,"circle"),(44.0,48.8,"full"),(48.8,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#DDE6FF","bottom":"#7B96E8","color":"#0F1E4A"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*GOOGLE PIXEL 9a REVIEW*"],0.77,48),
 sc(3.6,6.2,["*GOOGLE PIXEL 9a*"],0.07,54),
 sc(6.5,8.9,["Almost *Rs 90,000*","Non PTA"],0.07,54),
 sc(9.5,10.9,["*Aluminium* Frame"],0.07,54),sc(11.1,12.9,["*IP68* Rated"],0.07,56),
 sc(13.4,15.3,["*Flat* Camera Module"],0.07,52),sc(15.5,18.1,["Camera Doesn't *Wobble*"],0.07,48),
 sc(19.0,20.9,["*P-OLED* Display"],0.07,52),sc(21.1,22.5,["*120Hz* + Gorilla Glass"],0.07,50),
 sc(23.0,24.9,["Pixel 8: *Smaller Bezels*"],0.50,46),
 sc(26.3,29.2,["*Tensor G4*","*8GB* RAM"],0.07,54),
 sc(30.0,31.9,["*128GB* Storage Only"],0.07,50),sc(32.3,34.5,["*No 5G* In Pakistan"],0.50,52),
 sc(35.0,36.6,["*Best Camera*"],0.50,56),sc(36.9,39.3,["*5100mAh* Battery"],0.50,52),
 sc(39.6,41.3,["*23W* Charging"],0.07,56),sc(41.7,43.6,["*7 Years* Updates"],0.07,54),
 sc(44.2,48.5,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(48.8),"end":END+3.4,"title":"google pixel 9a","image":"assets/pixel_product.png","tint":"#DCE4FA","dark":"#1D2B5A","badges":["assets/priceoye.png"],
  "rows":["P-OLED 120Hz Gorilla Glass","Google Tensor G4","8GB RAM | 128GB","5100mAh Battery","23W Charging","IP68 | 7 Years Updates","No 5G In Pakistan"],
  "icons":["display","chip","storage","battery","battery","water","dot"],"price":"Almost Rs 90,000"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,25.1,39.45)]+[{"t":f(t),"type":"blur"} for t in (22.7,32.1,48.8)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,22.7,25.1,32.1,39.45,48.8)]+[{"t":f(6.6),"name":"ding"},{"t":f(49.0),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.52,"y":0.30,"full_x":0.5225,"split_x":0.511,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":970,"cy_px":440,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/pixel_raw/plan.json","w"),indent=1); print("final",END)
