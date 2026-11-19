import json
T0=0.82; T1=59.6; CW=0.12
cuts=[2.15,5.64,7.98,11.24,16.03,18.52,22.49,28.56,31.45,33.78,36.83,38.96,41.83,44.72,47.99,50.79,52.33]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":1.4},open("work/findx_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    if hf: e["h_frac"]=hf
    return e
B=[br("72",3.3,5.7,205.4),
 br("3",5.7,9.4,7.7),br("221",9.4,11.5,889.0),
 br("73",11.5,13.3,208.75),br("75",13.3,16.0,212.6),
 br("76",16.3,18.5,216.2,"split_top"),br("84",18.5,20.0,243.8,"split_top"),br("81",20.0,22.5,232.3,"split_top"),br("77",22.5,24.1,220.9,"split_top"),
 br("105",24.3,28.5,325.8),
 br("102",28.7,31.5,307.2,"split_top"),
 br("106",31.8,33.7,330.8),
 br("121",34.0,36.8,383.7),br("131",37.0,38.8,424.5),br("125",39.0,42.4,400.6),
 br("160",42.4,44.6,565.3),br("61",44.7,48.2,168.0),
 br("213",48.3,50.2,836.8),br("214",50.2,52.5,839.2)]
L=[(T0,3.3,"full"),(3.3,16.0,"circle"),(16.0,24.2,"split"),(24.2,28.6,"circle"),(28.6,31.6,"split"),(31.6,52.6,"circle"),(52.6,57.6,"full"),(57.6,T1+2,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#DCE8C8","bottom":"#9BB77A","color":"#1F3010"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.98,3.2,["*FIND X10 PRO MAX REVIEW*"],0.77,48),
 sc(3.5,5.5,["*OPPO FIND X10 PRO MAX*"],0.07,50),
 sc(5.9,8.0,["*Not Launched*","In Pakistan Yet"],0.07,54),sc(8.3,11.3,["*Dec End / Jan*","Limited Quantity"],0.07,54),
 sc(11.8,15.8,["Almost *Rs 284,999*"],0.07,56),
 sc(16.4,18.4,["*Crystal Glass* Back"],0.50,50),sc(18.6,19.9,["*Aluminium* Frame"],0.50,52),sc(20.1,22.4,["*IP68* + *IP69*"],0.50,54),sc(22.6,24.0,["*Flagship* Feel"],0.50,54),
 sc(24.4,28.4,["*6.78\" 1.5K*","LTPO Display"],0.07,54),
 sc(28.8,31.4,["*144Hz* + *Dolby Vision*"],0.50,48),
 sc(31.9,33.6,["*Bright* In Sunlight"],0.07,54),
 sc(34.1,36.7,["*Dimensity 9600 Pro*"],0.07,52),sc(37.1,38.7,["*ColorOS 17*"],0.07,56),sc(39.1,41.7,["*4 Million+* Benchmark"],0.07,52),
 sc(42.5,44.5,["*3 x 200MP* Sensors"],0.07,54),sc(44.8,48.1,["*Hasselblad* Lens Kit","Telephoto Zoom"],0.07,52),
 sc(48.4,50.1,["*8000mAh* Battery"],0.07,56),sc(50.3,52.4,["*80W* Charging"],0.07,56),
 sc(52.9,57.4,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(57.6),"end":END+3,"title":"oppo find x10 pro max","image":"assets/findx_product.png","tint":"#E2EAD0","dark":"#4F5C2F","badges":["assets/priceoye.png"],
  "rows":['6.78" 1.5K LTPO 144Hz',"Dimensity 9600 Pro","ColorOS 17","3 x 200MP Hasselblad","8000mAh Battery","80W Charging","IP68 | IP69"],
  "icons":["display","chip","os","camera","battery","battery","water"],"price":"Almost Rs 284,999"}]
tfl=(3.3,16.0,24.2,28.6,31.6); tbl=(16.0,57.6)
tr=[{"t":f(t),"type":"flash"} for t in (3.3,24.2,31.6)]+[{"t":f(t),"type":"blur"} for t in (16.0,28.6,57.6)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.3,16.0,24.2,28.6,31.6,57.6)]+[{"t":f(11.9),"name":"ding"},{"t":f(57.8),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.613,"split_x":0.677,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1108,"cy_px":450,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/findx_raw/plan.json","w"),indent=1); print("final",END)
