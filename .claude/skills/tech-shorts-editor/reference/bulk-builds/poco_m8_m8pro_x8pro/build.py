import json
T0=0.82; T1=55.4
cuts=[2.16,3.37,4.74,5.31,5.86,6.14,7.53,11.06,11.8,12.54,14.82,18.36,22.39,24.34,28.14,29.16,31.08,33.19,35.99,39.71,43.19,45.24,47.87,48.15,50.25,51.46,52.88]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":1.4},open("work/poco_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
B=[br(3.4,6.9,56.6),
 br(7.6,11.1,99.1),br(11.2,12.9,264.9),br(12.9,14.8,490.8),
 br(15.3,18.0,116.7),br(18.4,20.3,503.2),br(20.3,22.4,509.8),
 br(22.5,24.3,505.5),
 br(24.8,27.9,298.7,"split_top"),br(27.9,31.0,271.3),
 br(31.2,33.5,119.8),br(33.5,35.3,278.1),br(35.3,36.1,275.6),
 br(36.2,39.5,601.5,"split_top"),
 br(40.2,43.0,444.3,"split_top"),br(43.2,45.2,452.8),
 br(45.5,47.8,632.8,"split_top"),br(47.9,50.1,485.8,"split_top")]
L=[(T0,3.4,"full"),(3.4,24.8,"circle"),(24.8,27.9,"split"),(27.9,36.2,"circle"),(36.2,39.6,"split"),(39.6,40.2,"circle"),(40.2,43.0,"split"),(43.0,45.5,"circle"),(45.5,50.2,"split"),(50.2,55.0,"full"),(55.0,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#FFE680","bottom":"#F5C400","color":"#2B2400"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*3 POCO PHONES*"],0.77,56),
 sc(3.6,6.9,["*M8* | *M8 Pro* | *X8 Pro*"],0.07,46),
 sc(7.7,11.0,["*Poco M8*","Almost *Rs 99,999*"],0.07,54),sc(11.3,12.8,["*M8 Pro*","Almost *Rs 130,000*"],0.07,50),sc(13.0,14.7,["*X8 Pro*","Almost *Rs 190,000*"],0.07,50),
 sc(15.4,17.9,["*Poco M8* Only *176g*"],0.07,50),sc(18.5,22.3,["*X8 Pro:* Aluminium + *IP68*"],0.07,44),
 sc(22.6,24.2,["*Compact* + Premium"],0.07,52),
 sc(24.9,27.8,["*M8 Pro:* 6.83\" 1.5K"],0.50,48),sc(28.0,30.9,["*Quad Curved* 120Hz"],0.07,52),
 sc(31.3,33.4,["*M8:* Snapdragon 6 Gen 3"],0.07,46),sc(33.6,36.0,["*M8 Pro:* Snapdragon 7s Gen 4"],0.07,42),
 sc(36.3,39.5,["*X8 Pro:* Dimensity 8500 Ultra"],0.50,42),
 sc(40.3,42.9,["*M8 Pro:* 6500mAh"],0.50,50),sc(43.3,45.1,["*100W* Charging"],0.07,56),
 sc(45.6,47.7,["*X8 Pro* 12GB"],0.50,54),sc(48.0,50.1,["*Under Rs 200,000*"],0.50,48),
 sc(50.5,55.0,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(55.0),"end":END+3,"title":"poco m8 pro","image":"assets/poco_product.png","tint":"#FBEFA8","dark":"#2D2A12","badges":["assets/priceoye.png"],
  "rows":['6.83" 1.5K Quad Curved 120Hz',"Snapdragon 7s Gen 4","6500mAh Battery","100W Charging","Almost Rs 130,000"],
  "icons":["display","chip","battery","battery","dot"],"price":"Almost Rs 130,000"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,24.8,36.2)]+[{"t":f(t),"type":"blur"} for t in (27.9,45.5,55.0)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,24.8,27.9,36.2,45.5,55.0)]+[{"t":f(7.8),"name":"ding"},{"t":f(55.2),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.55,"y":0.30,"full_x":0.565,"split_x":0.6,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1056,"cy_px":440,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/poco_raw/plan.json","w"),indent=1); print("final",END)
