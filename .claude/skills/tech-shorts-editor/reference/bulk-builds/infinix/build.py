import json
T0=0.78; T1=50.6; CW=0.12
cuts=[2.04,7.14,11.26,16.8,22.3,28.4,34.91,38.54,44.14]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":1.4},open("work/inf_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    return e
B=[br("2",3.4,5.15,1.6),
 br("5",5.15,7.45,9.55),br("10",7.45,11.26,31.9),
 br("7",11.26,12.97,19.85,"split_top"),br("22",12.97,14.27,94.2,"split_top"),br("86",14.27,17.2,314.2,"split_top"),
 br("21",17.2,18.78,92.3),
 br("46",18.78,20.9,156.3,"split_top"),br("39",20.9,24.0,133.9,"split_top"),br("69",24.0,25.4,247.7,"split_top"),
 br("103",25.4,28.1,409.2),
 br("105",28.4,31.9,425.2,"split_top"),br("83",31.9,34.9,304.25,"split_top"),
 br("23",34.95,36.8,96.1,"split_top"),br("10",36.8,38.7,33.7,"split_top"),br("8",38.7,40.16,22.3,"split_top"),
 br("2",40.16,42.1,1.55,"split_top"),br("84",42.1,44.14,307.6,"split_top")]
L=[(T0,3.4,"full"),(3.4,5.15,"circle"),(5.15,11.26,"hidden"),(11.26,17.2,"split"),(17.2,18.78,"circle"),(18.78,25.4,"split"),
   (25.4,28.4,"circle"),(28.4,34.9,"split"),(34.9,44.14,"split"),(44.14,48.8,"full"),(48.8,T1+2,"hidden")]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
MINT={"top":"#FFB8B8","bottom":"#F2736A","color":"#FFFFFF"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(MINT); d.update(k); return d
cards=[sc(0.95,3.3,["*INFINIX NOTE 60 PRO REVIEW*"],0.77,48),
 sc(3.5,5.1,["*7 Months* Use"],0.07,56),
 sc(5.3,7.4,["*INFINIX NOTE 60 PRO*"],0.07,50),
 sc(7.6,11.2,["Almost *Rs 118,999*"],0.07,56),
 sc(11.4,12.9,["*Glass* Back"],0.50,52),sc(13.0,14.2,["*Matrix* Display"],0.50,52),sc(14.3,17.1,["*Heart Rate* Sensor"],0.50,52),
 sc(17.3,18.7,["*Wireless* Charging"],0.07,54),
 sc(18.9,20.8,["*1.5K* Display"],0.50,52),sc(21.0,22.6,["*Good* Brightness"],0.50,52),sc(22.8,25.3,["Thora *Underpowered*"],0.50,50),
 sc(25.5,28.0,["*6500mAh* Battery"],0.07,54),
 sc(28.5,31.8,["*90W* Wired","*30W* Wireless"],0.07,54),
 sc(32.0,34.8,["*1 to 1.5 Days*","Battery Timing"],0.07,52),
 sc(35.1,36.7,["Camera *Weakness*"],0.50,52),sc(36.9,38.6,["*No* Telephoto Lens"],0.50,50),sc(38.8,40.5,["*Stabilisation* Weak"],0.50,50),
 sc(40.7,44.0,["Camera Ke Liye","*Reno 16F* Better"],0.50,50),
 sc(44.4,48.7,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(48.8),"end":END+3,"title":"infinix note 60 pro","image":"assets/inf_product.png","tint":"#F3DAD6","dark":"#5C2230","badges":["assets/priceoye.png","assets/infinix_badge.png"],
  "rows":['6.78" 1.5K AMOLED',"Snapdragon 7s Gen 4","8GB RAM | 256GB","6500mAh Battery","90W Wired | 30W Wireless","50MP OIS Camera","Glass Back | Matrix Display"],
  "icons":["display","chip","storage","battery","battery","camera","dot"],"price":"Almost Rs 118,999"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,5.15,17.2,25.4,28.4,44.14)]+[{"t":f(t),"type":"blur"} for t in (11.26,18.78,48.8)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,5.15,11.26,17.2,18.78,25.4,28.4,44.14,48.8)]+[{"t":f(8.0),"name":"ding"},{"t":f(49.0),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.618,"split_x":0.685,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1115,"cy_px":455,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/inf_raw/plan.json","w"),indent=1); print("final",END)
