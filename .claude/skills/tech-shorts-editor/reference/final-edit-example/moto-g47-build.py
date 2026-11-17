import json
F="/tmp/claude-0/-home-user-finalcnoopsy/55987eaa-c84c-565d-b8a2-cac4e7e6594a/scratchpad/final4"; S="/tmp/claude-0/-home-user-finalcnoopsy/55987eaa-c84c-565d-b8a2-cac4e7e6594a/scratchpad"
cuts=[15.254,25.502,36.155,46.681,54.56]; CW=0.12; T0=0.73; T1=61.05
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,c]); a=c+CW
segs.append([a,T1])
grade=[l for l in open(S+"/final2/grades.txt") if l.startswith("A|")][0].split("|",1)[1].strip()
json.dump({"segments":segs,"tail_pad":0,"vf":grade},open(F+"/work/head_fixed/keep.json","w"))
cen=json.load(open(S+"/final3/centers.json")); cen.update({"2a":0.58,"2b":0.50,"5b":0.70,"11":0.50})
HF={"2a":0.70,"5b":0.80}
sh={"2a":[14.0,15.8],"2b":[124.0,127.8],"3":[171.98,175.8],"4a":[79.0,81.6],"4b":[143.0,145.8],"4c":[149.95,152.8],"5a":[206.0,209.0],"5b":[481.0,482.7],"6a":[249.0,252.4],"6b":[225.1,229.1],"8":[291.15,296.95],"9a":[262.0,264.4],"9b":[324.5,326.8],"10":[153.35,156.3],"11":[585.9,588.7],"12":[551.0,553.2]}
# (key, start, end, layout, headroom) in fixed time
B=[("2a",3.4,5.2,"full",.10),("2b",5.2,8.925,"full",.10),("3",8.925,12.746,"full",.10),
("4a",12.746,15.34,"split_top",0),("4b",15.34,18.14,"split_top",0),("4c",18.14,21.0,"split_top",0),
("5a",21.0,23.9,"full",.10),("5b",23.9,25.6,"full",.10),("6a",25.6,29.0,"split_top",0),("6b",29.0,33.0,"split_top",0),
("8",36.3,42.1,"full",.10),("9a",42.1,44.4,"split_top",0),("9b",44.4,46.8,"split_top",0),
("10",46.8,49.7,"full",.10),("11",49.7,52.5,"full",.10),("12",52.5,54.7,"full",.10)]
broll=[]
for k,a,b,lay,hr in B:
    e={"start":f(a),"end":f(b),"file":"long.mp4","ss":sh[k][0],"layout":lay,"center":cen[k]}
    if hr: e["headroom"]=hr
    if k in HF: e["h_frac"]=HF[k]
    broll.append(e)
L=[(0.73,3.4,"full"),(3.4,8.925,"circle"),(8.925,12.746,"hidden"),(12.746,21.0,"split"),(21.0,25.6,"circle"),(25.6,33.0,"split"),
(33.0,36.3,"full"),(36.3,42.1,"circle"),(42.1,46.8,"split"),(46.8,54.7,"circle"),(54.7,57.4,"full"),(57.4,61.05,"hidden")]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
layout[-1]["end"]=99
tr=[{"t":f(t),"type":"flash"} for t in (3.4,8.925,36.3)]+[{"t":f(t),"type":"blur"} for t in (12.746,25.6,42.1,57.4)]
def g(a,b,lines,y,size=80,**k): 
    d={"type":"glow","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(k); return d
cards=[g(0.9,3.3,["*MOTO G47* REVIEW"],.80,84),
g(3.6,6.0,["*PAKISTAN* LAUNCH"],.075,76),g(6.1,8.8,["*MOTOROLA* MOTO G47"],.075,76),
g(9.6,12.6,["*Rs 76,499*","Retail Price"],.075,84),
g(13.0,15.2,["*11.11* Sale"],.41,76),g(15.5,18.0,["*Vegan Leather* Back"],.41,72),g(18.3,20.9,["*Signature* Camera"],.41,76),
g(21.2,23.8,["*IP64* Rated"],.075,76),g(24.0,25.5,["*3.5mm* Jack"],.075,76),
g(25.9,28.9,['*6.67"* 120Hz IPS'],.41,72),g(30.7,32.9,["*Gorilla Glass* 7i"],.41,72),
g(33.4,36.2,["*1080p* Hota to Behtar"],.80,76),
{"type":"pill","start":f(36.6),"end":f(42.0),"text":["*Dimensity 6300*","*8GB* RAM","*128GB* Storage"],"y":.075},
g(42.3,44.3,["*Android 16* Hello UI"],.41,72),g(44.6,46.7,["*Smooth* Gaming"],.41,76),
g(47.0,49.6,["*108MP* Main Camera"],.075,76),g(49.9,52.4,["*5200mAh* Battery"],.075,76),g(52.7,54.6,["*20W* Charging"],.075,76),
g(55.0,57.3,["*COMMENT* KARNA"],.80,84),
{"type":"sheet","start":f(57.4),"end":99,"title":"motorola moto g47","image":"assets/phone_back.webp","tint":"#F3D3E3","dark":"#8E1B5A",
 "badges":["assets/priceoye.png","assets/moto_logo.png"],
 "rows":['6.67" 720p 120Hz IPS LCD | 1050 nits',"MediaTek Dimensity 6300","8GB RAM | 128GB Storage","5200mAh Battery | 20W Charging","108MP Main | 8MP Front","Corning Gorilla Glass 7i","Android 16 | 5G | NFC"],
 "icons":["display","chip","storage","battery","camera","dot","os"],"price":"Price - Rs 76,499"}]
sfx=[{"t":f(t),"name":"whoosh"} for t in (3.4,8.925,12.746,25.6,36.3,42.1,57.4)]+[{"t":f(10.0),"name":"ding"},{"t":f(57.6),"name":"ding"}]
sfx+=[{"t":f(t),"name":"pop"} for t in (0.9,3.6,6.1,13.0,15.5,18.3,21.2,24.0,25.9,30.7,33.4,36.6,42.3,44.6,47.0,49.9,52.7,55.0)]
plan={"preset":"gyan","head":{"x":0.575,"full_x":0.61,"split_x":0.673,"split_y":0.0,"split_zoom":1.12,
 "circle":{"side_px":760,"cx_px":1105,"cy_px":456,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":broll,"cards":cards,"sfx":sfx,"bgm":"music.wav",
 "audio":{"bgm_db":-30}}
json.dump(plan,open(F+"/work/head_fixed/plan.json","w"),indent=1)
print("final length",f(T1))
