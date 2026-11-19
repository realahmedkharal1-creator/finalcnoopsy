import json
T0=0.87; T1=50.2; CW=0.12
cuts=[2.11,5.40,7.38,9.17,11.72,13.10,17.53,22.04,26.52,28.85,32.16,34.24,38.25,41.64,43.91,45.18,46.73]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/s23_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
B=[br(3.4,5.4,20.3),br(5.4,7.4,89.8),br(7.4,9.2,96.3),
 br(9.7,11.7,108.8),br(11.7,13.1,113.6),br(13.1,15.5,94.8),br(15.5,17.5,120.0),
 br(17.9,19.8,136.1),br(19.8,22.0,144.7),br(22.0,24.3,228.3),br(24.3,26.5,183.3),
 br(26.8,28.9,208.6),br(29.3,32.1,215.2),br(32.2,34.2,415.5),
 br(34.8,36.8,92.8),br(36.8,38.2,89.9),
 br(38.5,41.6,257.9),br(41.7,43.9,274.9,"split_top")]
L=[(T0,3.4,"full"),(3.4,41.7,"circle"),(41.7,44.0,"split"),(44.0,49.2,"full"),(49.2,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#E4DAFF","bottom":"#A58CEB","color":"#22124D"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*SAMSUNG GALAXY S23*"],0.77,50),
 sc(3.6,5.3,["*SAMSUNG GALAXY*","*S23*"],0.07,54),
 sc(5.6,7.3,["*Official PTA*"],0.07,56),sc(7.5,9.1,["Almost *Rs 100,000*"],0.07,52),
 sc(9.8,11.6,["*Compact* Size"],0.07,56),sc(11.8,13.0,["*Gorilla Glass*","Victus 2"],0.07,50),
 sc(13.3,15.4,["Only *170g* Weight"],0.07,52),sc(15.6,17.4,["*Easy* To Hold"],0.07,56),
 sc(18.0,19.7,["*6.1\"* Dynamic AMOLED 2X"],0.07,44),sc(19.9,21.9,["*120Hz* Display"],0.07,54),
 sc(22.1,24.2,["*Ultrasonic*","Fingerprint"],0.07,52),sc(24.4,26.4,["*Dolby Atmos*","Stereo Speakers"],0.07,50),
 sc(26.9,28.8,["*Snapdragon 8 Gen 2*"],0.07,52),sc(29.4,32.0,["*8GB* RAM | *128GB*"],0.07,50),
 sc(32.3,34.1,["*7 Years* Updates"],0.07,54),
 sc(34.9,36.7,["*50MP* Main Sensor"],0.07,54),sc(36.9,38.1,["*Telephoto* Lens"],0.07,54),
 sc(38.6,41.5,["*3900mAh* Battery"],0.07,56),sc(41.8,43.8,["*Biggest*","Weakness"],0.50,50),
 sc(44.1,49.0,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(49.2),"end":END+3.4,"title":"samsung galaxy s23","image":"assets/s23_product.png","tint":"#E7E0F7","dark":"#2D2550","badges":["assets/priceoye.png","assets/samsung_badge.png"],
  "rows":['6.1" Dynamic AMOLED 2X 120Hz',"Snapdragon 8 Gen 2","8GB RAM | 128GB","50MP Main + Telephoto","3900mAh Battery","Gorilla Glass Victus 2 | 170g","7 Years Updates"],
  "icons":["display","chip","storage","camera","battery","dot","os"],"price":"Almost Rs 100,000"}]
tr=[{"t":f(3.4),"type":"flash"},{"t":f(41.7),"type":"flash"},{"t":f(44.0),"type":"blur"},{"t":f(49.2),"type":"blur"}]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,41.7,44.0,49.2)]+[{"t":f(7.6),"name":"ding"},{"t":f(49.4),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.49,"y":0.30,"full_x":0.5,"split_x":0.46,"split_zoom":1.12,"split_y":0.383,
 "circle":{"side_px":700,"cx_px":525,"cy_px":840,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/s23_raw/plan.json","w"),indent=1); print("final",END)
