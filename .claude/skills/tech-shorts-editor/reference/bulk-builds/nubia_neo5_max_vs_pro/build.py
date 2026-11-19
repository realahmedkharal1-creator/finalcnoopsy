import json
T0=0.82; T1=56.9; CW=0.12
cuts=[2.25,6.55,9.23,11.58,15.94,19.04,24.28,29.29,33.45,38.74,44.23]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/nubia_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    if hf: e["h_frac"]=hf
    return e
B=[br("4",3.4,5.3,15.75),br("3",5.3,6.5,13.85),
 br("58",6.5,9.3,208.3),br("133",9.3,11.6,608.0),
 br("71",11.6,16.0,280.1,"split_top"),
 br("104",16.1,19.0,475.4),
 br("61",19.4,24.3,223.0),
 br("152",24.4,26.3,695.5,"split_top"),br("153",26.3,28.4,697.8,"split_top"),br("154",28.4,29.4,700.1,"split_top"),
 br("88",29.6,33.5,406.3),
 br("165",33.8,36.2,740.5),
 br("159",36.4,38.8,707.4,"split_top"),
 br("114",39.1,42.4,547.4),br("115",42.4,44.3,551.0),
 br("187",44.6,47.5,851.3),br("188",47.5,49.7,854.5)]
L=[(T0,3.4,"full"),(3.4,11.6,"circle"),(11.6,16.0,"split"),(16.0,24.4,"circle"),(24.4,29.5,"split"),(29.5,36.3,"circle"),(36.3,38.9,"split"),(38.9,49.7,"circle"),(49.7,54.9,"full"),(54.9,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#FF6A55","bottom":"#F04B3A","color":"#FFFFFF"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.98,3.3,["*NUBIA NEO 5 MAX vs PRO*"],0.77,48),
 sc(3.6,5.2,["*NUBIA NEO 5 MAX*"],0.07,54),sc(5.4,6.4,["*NEO 5 PRO*"],0.07,56),
 sc(6.7,9.2,["*Neo 5 Max*","Almost *Rs 95,000*"],0.07,56),
 sc(9.4,11.5,["*Neo 5 Pro*","Almost *Rs 113,000*"],0.07,56),
 sc(11.8,13.8,["*Both* Gaming Phones"],0.50,50),sc(14.0,15.9,["*Triggers* + *IP64*"],0.50,52),
 sc(16.3,18.9,["*Neo 5 Max*","*Cooler* In The Box"],0.07,54),
 sc(19.6,24.2,["*Neo 5 Max*","*7.5\" 1.5K* 120Hz"],0.07,54),
 sc(24.6,29.3,["*Pro:* 6.8\" FHD+ AMOLED"],0.50,46),
 sc(29.8,33.4,["*Neo 5 Max*","*Dimensity 7100* | *8GB*"],0.07,52),
 sc(34.0,36.1,["*Neo 5 Pro*","*12GB* RAM"],0.07,54),
 sc(36.6,38.7,["*Both* 60FPS Gaming"],0.50,50),
 sc(39.3,42.3,["*Neo 5 Max*","*7100mAh* Battery"],0.07,54),sc(42.5,44.2,["*45W* Charging"],0.07,56),
 sc(44.8,47.4,["*Neo 5 Pro*","*6000mAh* Battery"],0.07,54),sc(47.6,49.6,["*80W* Charging"],0.07,56),
 sc(49.9,54.7,["*Konsa Phone Pasand Aaya?*","Comment Karna"],0.79,56),
 {"type":"sheet","start":f(54.9),"end":f(54.9)+1.9,"title":"nubia neo 5 max","image":"assets/max_product.png","tint":"#F3D5D0","dark":"#4A1A1A","badges":["assets/priceoye.png"],
  "rows":['7.5" 1.5K 120Hz',"Dimensity 7100","8GB RAM","7100mAh Battery","45W Charging","Shoulder Triggers | IP64","Cooler In The Box"],
  "icons":["display","chip","storage","battery","battery","dot","dot"],"price":"Almost Rs 95,000"},
 {"type":"sheet","start":f(54.9)+1.9,"end":END+3.4,"title":"nubia neo 5 pro","image":"assets/pro_product.png","tint":"#F3D5D0","dark":"#4A1A1A","badges":["assets/priceoye.png"],
  "rows":['6.8" Full HD+ AMOLED',"12GB RAM","6000mAh Battery","80W Charging","Shoulder Triggers | IP64","60FPS Gaming"],
  "icons":["display","storage","battery","battery","dot","dot"],"price":"Almost Rs 113,000"}]
tfl=(3.4,11.6,16.0,24.4,29.5,36.3,38.9); tbl=(54.9,)
tr=[{"t":f(t),"type":"flash"} for t in tfl]+[{"t":f(t),"type":"blur"} for t in tbl]
sfx=[{"t":f(t),"name":"whoosh"} for t in tfl+tbl]+[{"t":f(6.8),"name":"ding"},{"t":f(9.5),"name":"ding"},{"t":f(55.1),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.52,"y":0.30,"full_x":0.532,"split_x":0.55,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1002,"cy_px":435,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/nubia_raw/plan.json","w"),indent=1); print("final",END)
