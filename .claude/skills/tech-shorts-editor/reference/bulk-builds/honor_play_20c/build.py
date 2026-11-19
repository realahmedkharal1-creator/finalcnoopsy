import json
T0=0.80; T1=47.5; CW=0.12
cuts=[2.16,4.95,7.9,10.37,15.09,16.54,21.92,27.14,30.5,36.17,41.06,43.61]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":1.4},open("work/hon20_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    if hf: e["h_frac"]=hf
    return e
B=[br("3",3.3,4.5,12.4),br("65",4.5,5.5,463.7),
 br("21",5.5,7.7,104.4),br("31",7.7,10.5,151.2),
 br("23",10.8,13.4,110.7,"split_top"),br("30",13.4,16.4,147.85,"split_top"),
 br("37",17.1,21.8,197.5,"split_top"),
 br("26",22.2,27.1,119.3),br("36",27.2,31.9,183.0),
 br("34",32.2,36.0,174.3),
 br("79",36.4,39.5,571.8),br("80",39.5,41.2,575.7)]
L=[(T0,3.3,"full"),(3.3,10.5,"circle"),(10.5,16.5,"split"),(16.5,21.9,"split"),(21.9,41.2,"circle"),(41.2,45.8,"full"),(45.8,T1+2,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#FFF3A6","bottom":"#F2D45C","color":"#3A2F00"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.2,["*HONOR PLAY 20C REVIEW*"],0.77,50),
 sc(3.5,5.4,["*HONOR PLAY 20C*"],0.07,56),
 sc(5.7,7.6,["Almost *Rs 38,000*"],0.07,56),
 sc(7.9,10.4,["*Tiny Display* On The Back"],0.07,52),
 sc(10.9,13.3,["*2.01\"* Rear Display"],0.50,50),sc(13.5,16.3,["*Notifications* + Selfie"],0.50,48),
 sc(17.3,21.7,["*6.78\" HD+* TFT 90Hz"],0.50,50),
 sc(22.4,27.0,["*Unisoc T610*","*4GB* RAM | Android Go"],0.07,52),
 sc(27.4,30.6,["*Social Media* + Banking"],0.07,52),sc(30.8,31.9,["*Not* For Gaming"],0.07,54),
 sc(32.3,33.7,["*No* NFC"],0.07,56),sc(34.2,35.9,["*Basic* Camera"],0.07,56),
 sc(36.6,39.4,["*6000mAh* Battery"],0.07,56),sc(39.6,41.1,["*15W* Charging"],0.07,56),
 sc(41.5,45.6,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(45.8),"end":END+3,"title":"honor play 20c","image":"assets/hon20_product.png","tint":"#EAF0B8","dark":"#4F5A1C","badges":["assets/priceoye.png"],
  "rows":['6.78" HD+ TFT 90Hz','2.01" Rear Display',"Unisoc T610","4GB RAM | Android Go","Basic Camera | No NFC","6000mAh Battery | 15W Charging"],
  "icons":["display","dot","chip","storage","camera","battery"],"price":"Almost Rs 38,000"}]
tfl=(3.3,10.5,16.5,21.9); tbl=(10.5,21.9,45.8)
tr=[{"t":f(t),"type":"flash"} for t in (3.3,10.5,21.9)]+[{"t":f(t),"type":"blur"} for t in (45.8,)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.3,10.5,21.9,45.8)]+[{"t":f(5.9),"name":"ding"},{"t":f(46.0),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.54,"y":0.30,"full_x":0.552,"split_x":0.581,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1028,"cy_px":450,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/hon20_raw/plan.json","w"),indent=1); print("final",END)
