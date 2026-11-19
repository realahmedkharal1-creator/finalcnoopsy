import json
T0=0.86; T1=53.9; CW=0.12
cuts=[2.12,4.97,6.93,8.08,10.03,14.91,18.31,22.67,25.34,28.27,33.93,36.20,38.98,41.19,43.15,44.74,46.22,47.50,50.33]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":3.4},open("work/reno_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0): 
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    return e
B=[br("13",3.4,6.0,59.3),br("17",6.0,10.0,72.8),
 br("15",10.2,12.6,61.9),br("18",12.6,14.9,74.5),br("90",15.0,18.3,526.6),
 br("39",18.6,21.0,169.9,"split_top"),br("36",21.0,22.7,159.0,"split_top"),br("37",22.7,25.3,161.7,"split_top"),
 br("58",25.4,28.2,268.2),br("59",28.2,29.6,270.7),
 br("108",29.7,32.0,650.0),br("109",32.0,34.0,653.8),br("123",34.0,36.2,739.6),br("108",36.3,38.9,651.5),
 br("85",39.0,41.2,457.7),br("87",41.3,43.1,467.0),
 br("91",43.2,44.7,528.8),br("106",44.8,47.5,642.2)]
L=[(T0,3.4,"full"),(3.4,18.4,"circle"),(18.4,25.4,"split"),(25.4,47.6,"circle"),(47.6,52.4,"full"),(52.4,T1+4,"hidden")]
L=[L[0]]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#E6F0D8","bottom":"#9CBD7C","color":"#1F3010"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*OPPO RENO 16F REVIEW*"],0.77,48),
 sc(3.6,5.9,["*2 Months* Use","*OPPO RENO 16F*"],0.07,52),
 sc(6.3,9.9,["Almost *Rs 162,000*"],0.07,56),
 sc(10.3,12.5,["*3D Pop-Up* Glass Back"],0.07,48),sc(12.7,14.8,["*IP69* Rated"],0.07,56),
 sc(15.1,18.2,["*Plastic Frame*","Feels Heavy"],0.07,50),
 sc(18.7,22.6,["*6.57\" FHD+*","*120Hz* Display"],0.50,48),
 sc(22.8,25.2,["*Dimensity 7300*"],0.50,52),
 sc(25.6,28.1,["*ColorOS 16*","*4 Years* Updates"],0.07,50),
 sc(29.8,33.8,["*50MP* Main","*50MP* 3.5x Telephoto"],0.07,48),
 sc(34.2,36.1,["*50MP* Front Camera"],0.07,50),sc(36.4,38.8,["*4K 30FPS* Video"],0.07,52),
 sc(39.1,41.1,["*7000mAh* Battery"],0.07,54),sc(41.4,43.0,["*80W* Charging"],0.07,56),
 sc(43.3,44.6,["*USB 2.0* Only"],0.07,54),sc(44.9,47.4,["*8GB RAM*","Weak At This Price"],0.07,50),
 sc(47.8,52.2,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(52.4),"end":END+3.4,"title":"oppo reno 16f","image":"assets/reno_product.png","tint":"#E8EFDC","dark":"#32452A","badges":["assets/priceoye.png","assets/oppo_badge.png"],
  "rows":['6.57" FHD+ 120Hz',"Dimensity 7300","8GB RAM","7000mAh Battery","80W Charging","50MP + 50MP 3.5x Telephoto","IP69 | USB 2.0"],
  "icons":["display","chip","storage","battery","battery","camera","water"],"price":"Almost Rs 162,000"}]
tr=[{"t":f(t),"type":"flash"} for t in (3.4,25.4)]+[{"t":f(t),"type":"blur"} for t in (18.4,52.4)]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,18.4,25.4,52.4)]+[{"t":f(6.4),"name":"ding"},{"t":f(52.6),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.49,"y":0.30,"full_x":0.5,"split_x":0.46,"split_zoom":1.12,"split_y":0.383,
 "circle":{"side_px":700,"cx_px":525,"cy_px":840,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/reno_raw/plan.json","w"),indent=1); print("final",END)
