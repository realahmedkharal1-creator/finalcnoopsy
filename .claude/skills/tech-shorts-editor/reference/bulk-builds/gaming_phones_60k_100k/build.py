import json
T0=0.82; T1=51.6
cuts=[2.2,5.26,8.36,14.6,18.34,19.67,21.29,22.62,26.6,28.9,33.6,37.25,39.93,41.64,46.37,47.62,49.11]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":0.4},open("work/game_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":"split_top","center":0.5}
B=[br(3.4,5.7,138.0),br(5.7,8.3,190.5),
 br(8.5,12.2,304.4),br(12.3,13.7,187.8),br(13.7,14.6,202.6),
 br(14.7,15.6,292.7),br(15.6,17.5,307.3),br(17.5,18.3,200.2),
 br(18.5,20.1,326.8),br(20.1,21.3,324.1),br(21.4,22.6,404.3),
 br(22.7,24.8,375.2),br(24.8,26.5,604.9),
 br(26.7,28.5,219.6),
 br(29.0,31.2,334.5),br(31.2,32.6,387.3),br(32.6,33.6,389.1),
 br(33.8,35.2,203.8),br(35.2,37.2,140.0),
 br(37.6,39.4,320.0),br(39.4,39.9,190.6),
 br(40.0,43.9,208.7),br(44.0,46.3,190.5)]
L=[(T0,3.4,"full"),(3.4,46.4,"split"),(46.4,T1,"full")]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#FFD9A0","bottom":"#F2994A","color":"#3A1E00"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*BEST GAMING PHONES*"],0.77,50),
 sc(3.6,8.2,["*Rs 60,000 - 100,000*"],0.50,48),
 sc(8.6,12.2,["*Infinix GT 30 Pro*"],0.50,52),sc(12.4,14.5,["*Nubia Neo 5 Max*"],0.50,52),
 sc(14.8,17.4,["*60FPS* + *Triggers*"],0.50,52),
 sc(18.6,21.2,["*Xiaomi 14T*"],0.50,54),sc(21.4,22.6,["*vivo X90S*"],0.50,54),sc(22.8,26.4,["*iQOO Z10 Turbo Pro*"],0.50,46),
 sc(26.8,28.8,["Check *Condition*"],0.50,52),
 sc(29.1,33.5,["*6000mAh* Minimum"],0.50,52),
 sc(33.9,37.1,["*8GB* RAM | *128GB*"],0.50,50),
 sc(37.7,39.8,["*120Hz* Display"],0.50,52),
 sc(40.2,46.3,["*Bypass Charging*"],0.50,52),
 sc(46.8,51.4,["*Phone Kaisa Laga?*","Comment Karna"],0.79,62)]
tr=[{"t":f(3.4),"type":"flash"},{"t":f(46.4),"type":"blur"}]
sfx=[{"t":f(3.4),"name":"whoosh"},{"t":f(46.4),"name":"whoosh"}]
for c in cards: sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.57,"y":0.30,"full_x":0.599,"split_x":0.656,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":1090,"cy_px":450,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/game_raw/plan.json","w"),indent=1); print("final",END)
