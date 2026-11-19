import json
T0=0.82; T1=55.6
cuts=[2.17,4.58,10.51,13.89,18.03,19.72,23.78,27.66,30.52,32.64,36.54,40.0,43.02,44.65,47.56,49.44,51.15,52.26]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/iph_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full"): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":0.5}
B=[br(3.4,6.0,113.0),br(6.0,8.5,117.9),br(8.5,10.7,120.8),br(11.0,13.9,125.0),br(14.0,16.6,135.6),br(16.7,19.7,154.1),
 br(20.5,22.9,181.0),br(22.9,24.1,183.9),br(24.2,28.3,196.2),
 br(28.3,30.5,203.1),br(30.6,32.3,188.5,"split_top"),br(32.3,33.4,285.0,"split_top"),
 br(33.6,36.4,249.0),br(36.6,40.0,231.1),
 br(40.6,42.9,336.6),br(43.2,45.7,349.5),br(45.7,47.4,394.8),br(47.6,49.6,276.95)]
L=[(T0,3.4,"full"),(3.4,30.6,"circle"),(30.6,33.5,"split"),(33.5,49.7,"circle"),(49.7,55.0,"full"),(55.0,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#C9E4F5","bottom":"#6FA8D6","color":"#0E2A40"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*IPHONE 15 REVIEW*"],0.77,52),
 sc(3.6,5.9,["*iPhone 15*","Official PTA"],0.07,56),
 sc(6.2,10.5,["Almost *Rs 150,000 - 160,000*"],0.07,42),
 sc(11.1,13.8,["*6.1\"* Compact Size"],0.07,54),sc(14.1,16.5,["*Aluminium* Frame"],0.07,54),sc(16.8,19.6,["*Dual Camera* Module","IP Rating"],0.07,52),
 sc(20.6,24.0,["*Dynamic Island*","*Ceramic Shield*"],0.07,52),sc(24.4,27.5,["Only *60Hz* Refresh Rate"],0.07,50),
 sc(28.4,30.4,["*A16 Bionic*"],0.07,58),sc(30.8,33.3,["*60FPS* Gaming"],0.50,54),
 sc(33.7,36.3,["*128GB* Base Storage"],0.07,52),
 sc(36.7,39.9,["*iOS Updates*","Till *2029 / 2030*"],0.07,52),
 sc(40.7,42.8,["*48MP* Main"],0.07,56),sc(43.3,45.6,["*12MP* Ultrawide"],0.07,56),sc(45.8,47.4,["*4K 60FPS* Video"],0.07,52),
 sc(47.7,49.5,["*No* Telephoto Lens"],0.07,52),
 sc(50.0,54.8,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(55.0),"end":END+3.4,"title":"iphone 15","image":"assets/iph_product.png","tint":"#DCEBF7","dark":"#1D3A52","badges":["assets/priceoye.png"],
  "rows":['6.1" OLED 60Hz',"Apple A16 Bionic","128GB Storage","48MP + 12MP Camera","4K 60FPS Video","Dynamic Island | IP68","Updates Till 2029/30"],
  "icons":["display","chip","storage","camera","camera","dot","os"],"price":"Almost Rs 150,000"}]
tfl=(3.4,30.6,33.5); tbl=(55.0,)
tr=[{"t":f(t),"type":"flash"} for t in (3.4,30.6)]+[{"t":f(t),"type":"blur"} for t in (33.5,55.0)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,30.6,33.5,55.0)]+[{"t":f(6.4),"name":"ding"},{"t":f(55.2),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.49,"y":0.30,"full_x":0.5,"split_x":0.46,"split_zoom":1.12,"split_y":0.383,
 "circle":{"side_px":700,"cx_px":530,"cy_px":850,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/iph_raw/plan.json","w"),indent=1); print("final",END)
