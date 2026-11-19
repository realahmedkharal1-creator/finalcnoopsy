import json
T0=0.80; T1=58.1; CW=0.12
cuts=[1.95,6.62,12.89,15.5,18.82,21.9,25.78,29.19,32.68,36.85,41.2,43.63,46.83]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/pova_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    if hf: e["h_frac"]=hf
    return e
B=[br("20",3.4,6.5,1.0),
 br("6",6.5,8.2,10.9),br("12",8.2,9.8,36.4),br("19",9.8,12.8,61.0),
 br("8",12.8,15.9,14.7,"split_top"),br("27",15.9,18.9,101.3,"split_top"),
 br("23",18.9,22.0,81.0,"split_top"),
 br("54",22.0,26.0,231.6),
 br("61",26.0,29.0,250.2),br("66",29.0,32.7,267.0,"split_top"),
 br("108",33.0,36.2,508.4),
 br("109",36.2,39.17,511.95),br("110",39.17,42.07,515.35),br("61",42.07,43.62,253.9),
 br("40",43.8,48.0,159.6,"split_top")]
L=[(T0,3.4,"full"),(3.4,12.8,"circle"),(12.8,22.0,"split"),(22.0,29.0,"circle"),(29.0,32.7,"split"),(32.7,43.7,"circle"),(43.7,48.0,"split"),(48.0,56.6,"full"),(56.6,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#D9CCFF","bottom":"#9B86E8","color":"#FFFFFF"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*POVA CURVE 2 vs POCO M8*"],0.77,46),
 sc(3.6,6.4,["*TECNO POVA CURVE 2*","vs *POCO M8*"],0.07,54),
 sc(6.7,9.7,["*Pova Curve 2*","Almost *Rs 93,450*"],0.07,56),
 sc(10.0,12.7,["*Poco M8*","Almost *Rs 99,999*"],0.07,56),
 sc(13.0,15.8,["*Both* Plastic Body"],0.50,50),sc(16.0,18.8,["*Poco M8* Only 176g"],0.50,50),
 sc(19.0,21.9,["*Pova Curve 2*","Almost 200g"],0.50,50),
 sc(22.2,25.9,["*Poco M8*","*Snapdragon 6 Gen 3*"],0.07,54),
 sc(26.2,28.9,["*Pova Curve 2*","*Dimensity 7100*"],0.07,54),
 sc(29.1,30.8,["*12* Vapor Chamber"],0.50,50),sc(30.9,32.6,["*Pova* Better For Gaming"],0.50,46),
 sc(33.2,36.7,["*Pova Curve 2*","*8000mAh* Battery"],0.07,56),
 sc(37.1,40.1,["*Poco M8*","*5520mAh* Battery"],0.07,56),
 sc(40.4,43.5,["*Both* 45W Charging"],0.07,56),
 sc(44.0,47.9,["*Poco M8* Wins","Camera + Display + Battery"],0.50,46),
 sc(48.7,51.5,["*Camera:* 5/10 Both"],0.79,60),
 sc(51.9,56.4,["*Konsa Phone Pasand Aaya?*","Comment Karna"],0.79,56),
 {"type":"sheet","start":f(56.6),"end":f(56.6)+1.9,"title":"tecno pova curve 2","image":"assets/pova_product.png","tint":"#E4DCF5","dark":"#3C2E6B","badges":["assets/priceoye.png"],
  "rows":['6.78" 144Hz Curved AMOLED',"Dimensity 7100","8000mAh Battery","45W Charging","Vapor Chamber","195g Plastic Body"],
  "icons":["display","chip","battery","battery","dot","dot"],"price":"Almost Rs 93,450"},
 {"type":"sheet","start":f(56.6)+1.9,"end":END+3.4,"title":"poco m8","image":"assets/poco_product.png","tint":"#F6E58A","dark":"#2A2A2A","badges":["assets/priceoye.png"],
  "rows":['6.77" 120Hz Curved AMOLED',"Snapdragon 6 Gen 3","5520mAh Battery","45W Charging","176g Plastic Body"],
  "icons":["display","chip","battery","battery","dot"],"price":"Almost Rs 99,999"}]
tfl=(3.4,12.8,22.0,29.0,32.7,43.7); tbl=(12.8,56.6,)
tr=[{"t":f(t),"type":"flash"} for t in tfl]+[{"t":f(t),"type":"blur"} for t in tbl]
sfx=[{"t":f(t),"name":"whoosh"} for t in tfl+tbl]+[{"t":f(7.0),"name":"ding"},{"t":f(10.2),"name":"ding"},{"t":f(56.8),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.49,"y":0.30,"full_x":0.5,"split_x":0.46,"split_zoom":1.12,"split_y":0.383,
 "circle":{"side_px":700,"cx_px":525,"cy_px":836,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/pova_raw/plan.json","w"),indent=1); print("final",END)
