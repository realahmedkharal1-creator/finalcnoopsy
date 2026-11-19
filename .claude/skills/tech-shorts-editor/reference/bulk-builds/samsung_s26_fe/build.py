import json
T0=0.82; T1=59.0
cuts=[2.17,6.06,10.11,15.07,21.13,23.12,25.89,27.41,31.0,33.69,38.96,42.17,44.87,47.34,50.88,53.11,54.88,56.06]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/s26_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
B=[br(3.4,6.0,48.6),br(6.2,8.5,443.3),br(8.5,10.1,448.3),br(10.4,12.8,453.5),br(12.8,15.0,456.5),
 br(15.3,18.4,489.9,"split_top"),br(18.4,21.1,493.5,"split_top"),
 br(21.3,23.1,472.9),br(23.4,25.8,78.1),br(26.0,27.4,119.0),br(27.6,30.9,115.0),br(31.2,33.7,111.8),
 br(33.9,37.0,158.4,"split_top"),br(37.0,38.6,161.9,"split_top"),br(38.6,39.1,163.8,"split_top"),
 br(39.2,42.2,183.8),br(42.5,44.9,327.8),br(45.2,46.6,336.8),br(46.6,47.4,340.5),
 br(48.0,50.8,584.3),br(51.0,52.4,588.8),br(52.4,53.2,590.5)]
CEN=[.47,.52,.50,.52,.46,.52,.52,.47,.50,.48,.57,.48,.45,.50,.47,.50,.65,.63,.63,.50,.52,.52]
for b,c in zip(B,CEN): b['center']=c
L=[(T0,3.4,"full"),(3.4,15.2,"circle"),(15.2,21.2,"split"),(21.2,33.8,"circle"),(33.8,39.15,"split"),(39.15,53.3,"circle"),(53.3,58.8,"full"),(58.8,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#D6F4EA","bottom":"#7BCBB0","color":"#08332A"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*GALAXY S26 FE REVIEW*"],0.77,48),
 sc(3.6,6.0,["*SAMSUNG GALAXY*","*S26 FE*"],0.07,54),
 sc(6.3,10.0,["Almost *Rs 228,500*"],0.07,56),
 sc(10.5,15.0,["*512GB* Variant","Almost *Rs 290,500*"],0.07,52),
 sc(15.4,18.3,["*6.7\"* Dynamic AMOLED"],0.50,48),sc(18.5,21.0,["*120Hz* Refresh Rate"],0.50,50),
 sc(21.4,23.0,["*IP68* Rated"],0.07,56),
 sc(23.5,25.8,["*Exynos 2500*"],0.07,56),sc(26.1,27.3,["*3nm* Chipset"],0.07,56),
 sc(27.7,30.8,["*8GB* RAM | *UFS 4.0*"],0.07,50),sc(31.3,33.6,["*2.7M+* Benchmark"],0.07,54),
 sc(34.0,37.0,["*Vapor Chamber*","Stable *120FPS*"],0.50,46),
 sc(39.3,42.1,["*One UI 9*","*7 Years* Updates"],0.07,52),
 sc(42.6,44.8,["*50MP* Main"],0.07,56),sc(45.3,47.3,["*8MP* 3x Telephoto"],0.07,50),
 sc(48.1,50.7,["*4900mAh* Battery"],0.07,54),sc(51.1,53.1,["*45W* Charging"],0.07,56),
 sc(53.5,58.6,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(58.8),"end":END+3.4,"title":"samsung galaxy s26 fe","image":"assets/s26_product.png","tint":"#D8F0E8","dark":"#134A3C","badges":["assets/priceoye.png"],
  "rows":['6.7" Dynamic AMOLED 120Hz',"Exynos 2500 (3nm)","8GB RAM | UFS 4.0","50MP + 8MP 3x Telephoto","4900mAh Battery","45W Charging","IP68 | 7 Years Updates"],
  "icons":["display","chip","storage","camera","battery","battery","water"],"price":"Almost Rs 228,500"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,33.8,39.15)]+[{"t":f(t),"type":"blur"} for t in (15.2,21.2,58.8)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,15.2,21.2,33.8,39.15,58.8)]+[{"t":f(6.5),"name":"ding"},{"t":f(59.0),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.6,"split_x":0.658,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1094,"cy_px":450,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/s26_raw/plan.json","w"),indent=1); print("final",END)
