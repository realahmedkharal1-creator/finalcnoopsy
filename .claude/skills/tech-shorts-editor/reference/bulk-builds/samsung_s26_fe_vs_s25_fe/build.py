import json
T0=0.82; T1=60.3
cuts=[2.16,8.77,12.48,14.23,16.77,23.35,26.2,29.18,31.89,35.45,39.43,42.93,45.22,48.37,52.08,54.33,57.29]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/s26v_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
    if hf: e["h_frac"]=hf
    return e
B=[br(3.4,5.5,1.9),br(5.5,7.3,5.9),br(7.3,8.3,8.7),br(8.3,10.0,48.55),
 br(10.1,12.4,52.3),br(12.4,14.2,58.4),br(14.9,16.8,62.8),
 br(17.0,19.0,68.9,"split_top",hf=0.8),br(19.0,20.5,71.5,"split_top",hf=0.8),br(20.5,23.3,109.4,"split_top",hf=0.8),
 br(24.0,25.8,163.5),br(25.8,28.0,168.3),br(28.0,29.2,255.3),br(29.2,31.0,186.7),br(31.0,31.9,550.2),
 br(32.2,34.0,195.8),br(34.0,35.4,268.9),
 br(36.0,39.4,503.9,"split_top"),
 br(39.9,42.0,536.4),br(42.0,43.6,541.8),br(43.6,44.8,540.0),
 br(45.4,48.0,146.9),br(48.0,52.0,116.7,"split_top",hf=0.8)]
L=[(T0,3.4,"full"),(3.4,17.0,"circle"),(17.0,23.4,"split"),(23.4,36.0,"circle"),(36.0,39.5,"split"),(39.5,48.0,"circle"),(48.0,52.2,"split"),(52.2,59.5,"full"),(59.5,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#D6F4EA","bottom":"#7BCBB0","color":"#08332A"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*S26 FE vs S25 FE*"],0.77,52),
 sc(3.6,5.4,["*GALAXY S26 FE*"],0.07,54),sc(5.6,7.2,["*GALAXY S25 FE*"],0.07,54),
 sc(7.4,10.0,["*4 Changes*","Between Them"],0.07,54),
 sc(10.2,12.3,["*S26 FE*","Almost *Rs 228,500*"],0.07,52),sc(12.5,14.1,["*S25 FE*","Almost *Rs 190,000*"],0.07,52),
 sc(15.0,16.7,["*Only* Camera Island New"],0.07,48),
 sc(17.1,19.0,["*S25 FE:* LTPO"],0.50,52),sc(19.1,21.2,["*S26 FE:* LTPS"],0.50,52),
 sc(24.1,26.1,["*S26 FE* Performs Better"],0.07,46),sc(26.3,28.9,["*Exynos 2500*","*Vapor Chamber*"],0.07,50),
 sc(29.3,31.8,["*3 Lakh+* More Benchmark"],0.07,48),
 sc(32.3,35.3,["*4K 60FPS* Better Video"],0.07,50),
 sc(36.1,39.3,["*S26 FE:* USB 2.0"],0.50,52),
 sc(40.0,42.8,["*Both* 4900mAh"],0.07,54),sc(43.0,44.7,["*45W* Charging"],0.07,56),
 sc(45.5,47.9,["*S25 FE User?*","No Upgrade Needed"],0.07,50),
 sc(48.2,52.0,["*Samsung A Series?*","S26 FE Good Upgrade"],0.50,44),
 sc(52.6,59.3,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(59.5),"end":f(59.5)+1.9,"title":"samsung galaxy s26 fe","image":"assets/s26_product.png","tint":"#D8F0E8","dark":"#134A3C","badges":["assets/priceoye.png","assets/samsung_badge.png"],
  "rows":['6.7" LTPS AMOLED 120Hz',"Exynos 2500 + Vapor Chamber","4K 60FPS Video","4900mAh Battery","45W Charging","USB 2.0"],
  "icons":["display","chip","camera","battery","battery","dot"],"price":"Almost Rs 228,500"},
 {"type":"sheet","start":f(59.5)+1.9,"end":END+3.4,"title":"samsung galaxy s25 fe","image":"assets/s25_product.png","tint":"#DCE2F5","dark":"#1D2650","badges":["assets/priceoye.png","assets/samsung_badge.png"],
  "rows":['6.7" LTPO AMOLED 120Hz',"Exynos 2400","4900mAh Battery","45W Charging","USB 3.2"],
  "icons":["display","chip","battery","battery","dot"],"price":"Almost Rs 190,000"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,23.4,39.5)]+[{"t":f(t),"type":"blur"} for t in (17.0,36.0,48.0,59.5)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,17.0,23.4,36.0,39.5,48.0,59.5)]+[{"t":f(10.3),"name":"ding"},{"t":f(59.7),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.6,"split_x":0.658,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1090,"cy_px":450,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/s26v_raw/plan.json","w"),indent=1); print("final",END)
