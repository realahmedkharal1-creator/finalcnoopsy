import json
T0=0.80; T1=54.3; CW=0.12
cuts=[1.96,4.73,7.26,11.31,16.39,20.36,27.16,29.35,33.93,37.49,42.0,47.56]
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":1.4},open("work/viv_raw/keep.json","w"))
END=f(T1)
C=json.load(open("centres.json"))
def br(key,a,b,ss,lay="full",hr=0.0,hf=None):
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":C[key]}
    if hr: e["headroom"]=hr
    if hf: e["h_frac"]=hf
    return e
B=[br("37",3.3,5.0,156.0),
 br("43",5.0,7.3,178.2),br("26",7.3,11.3,106.0),
 br("36",11.3,13.7,153.1,"split_top"),br("41",13.7,16.35,166.3,"split_top"),
 br("45",16.35,18.3,186.45),br("61",18.3,20.4,262.1),
 br("52",20.4,23.9,214.5),br("53",23.9,26.5,219.0,"split_top"),
 br("121",26.5,29.5,570.0,"split_top"),
 br("64",29.7,32.0,285.7),br("72",32.0,34.0,326.6,"split_top"),
 br("73",34.0,37.4,329.2,"split_top"),
 br("119",37.9,40.0,553.4,"split_top"),br("124",40.0,42.2,596.9,"split_top"),
 br("123",42.2,45.4,593.4),br("127",45.4,47.6,606.8)]
L=[(T0,3.3,"full"),(3.3,5.0,"circle"),(5.0,11.3,"hidden"),(11.3,16.35,"split"),(16.35,20.4,"circle"),(20.4,23.9,"circle"),
   (23.9,29.5,"split"),(29.7,32.0,"circle"),(32.0,37.4,"split"),(37.9,42.2,"split"),(42.2,47.6,"circle"),(47.6,52.2,"full"),(52.2,T1+2,"hidden")]
# fill gaps between layout blocks
L=[(L[0][0],L[0][1],L[0][2])]+[(max(L[i][0],L[i-1][1]),L[i][1],L[i][2]) for i in range(1,len(L))]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#B4CDEE","bottom":"#5C84C0","color":"#FFFFFF"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.2,["*VIVO V80 REVIEW*"],0.77,56),
 sc(3.4,4.95,["*VIVO V80*"],0.07,60),
 sc(5.2,7.2,["Almost *Rs 210,000*"],0.07,56),
 sc(7.5,11.2,["*512GB* Variant","Almost *Rs 250,000*"],0.07,54),
 sc(11.5,13.6,["*Floating* Camera Module"],0.50,48),sc(13.8,16.3,["*Glass Back* Premium Feel"],0.50,48),
 sc(16.5,20.3,["*IP68* + *IP69* Rated"],0.07,54),
 sc(20.6,23.8,["*6.59\"* 1.5K AMOLED"],0.07,56),
 sc(24.0,26.4,["*144Hz* Refresh Rate"],0.50,50),sc(26.6,29.4,["*Very Thin* Bezels"],0.50,50),
 sc(29.85,31.9,["*Snapdragon 7 Gen 4*"],0.07,52),
 sc(32.1,33.9,["*UFS 4.1* Storage"],0.50,52),
 sc(34.1,35.6,["*OriginOS 7*"],0.50,52),sc(35.8,37.3,["*4 Years* Android Updates"],0.50,48),
 sc(38.0,39.9,["*50MP* Main Sensor"],0.50,52),sc(40.1,42.1,["*50MP* Telephoto"],0.50,52),
 sc(42.4,45.3,["*7200mAh* Battery"],0.07,56),sc(45.5,47.5,["*90W* Fast Charging"],0.07,54),
 sc(47.9,52.0,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62),
 {"type":"sheet","start":f(52.3),"end":END+3,"title":"vivo v80","image":"assets/viv_product.png","tint":"#F8DDC5","dark":"#6B3A1E","badges":["assets/priceoye.png","assets/vivo_badge.png"],
  "rows":['6.59" 1.5K AMOLED 144Hz',"Snapdragon 7 Gen 4","UFS 4.1 Storage","7200mAh Battery","90W Charging","50MP Main | 50MP Telephoto","IP68 | IP69"],
  "icons":["display","chip","storage","battery","battery","camera","water"],"price":"Almost Rs 210,000"}]
tfl=(3.3,5.0,16.35,23.9,29.7,42.2,47.6); tbl=(11.3,20.4,52.2)
tr=[{"t":f(t),"type":"flash"} for t in tfl]+[{"t":f(t),"type":"blur"} for t in tbl]
sfx=[{"t":f(t),"name":"whoosh"} for t in tfl+tbl]+[{"t":f(5.4),"name":"ding"},{"t":f(52.5),"name":"ding"}]
for c in cards:
    if c["type"]=="spec": sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.584,"split_x":0.631,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1070,"cy_px":435,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/viv_raw/plan.json","w"),indent=1); print("final",END)
