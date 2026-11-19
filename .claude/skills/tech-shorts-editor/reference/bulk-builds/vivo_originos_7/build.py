import json
T0=0.82; T1=43.6
cuts=[2.15,5.98,8.63,12.2,15.58,17.89,22.38,24.84,28.05,32.39,36.45,37.47,39.15,40.25]
CW=0.12
def f(t): return round(t-T0-sum(CW for c in cuts if c+CW/2<=t+1e-6),3)
segs=[]; a=T0
for c in cuts: segs.append([a,round(c-CW/2,3)]); a=round(c+CW/2,3)
segs.append([a,T1]); json.dump({"segments":segs,"tail_pad":0.5},open("work/origin_raw/keep.json","w"))
END=f(T1)
def br(a,b,ss,lay="full",c=0.5): return {"start":f(a),"end":f(b),"file":"long.mp4","ss":ss,"layout":lay,"center":c}
B=[br(3.4,5.3,9.5),br(5.3,7.4,11.8),br(7.4,8.6,14.4),br(8.9,11.0,75.6),br(11.0,12.2,98.6),br(12.5,15.5,89.0),
 br(15.8,17.9,171.3),br(18.3,20.0,174.3),br(20.0,22.4,196.2),br(22.6,24.8,225.6),br(25.3,28.0,257.6),
 br(28.3,30.5,263.7),br(30.5,32.3,283.1),br(32.8,35.0,321.2),br(35.0,36.4,331.7)]
L=[(T0,3.4,"full"),(3.4,36.5,"circle"),(36.5,T1+1,"full")]
layout=[{"start":f(a),"end":f(b),"mode":m} for a,b,m in L]
PILL={"top":"#E4DAFF","bottom":"#9C86F0","color":"#1E1250"}
def sc(a,b,lines,y,size=52,**k):
    d={"type":"spec","start":f(a),"end":f(b),"lines":lines,"y":y,"size":size}; d.update(PILL); d.update(k); return d
cards=[sc(0.95,3.3,["*ORIGIN OS 7 REVIEW*"],0.77,50),
 sc(3.6,5.3,["*vivo Origin OS 7*"],0.07,52),sc(5.5,8.5,["*Very Different*","From Origin OS 6"],0.07,50),
 sc(9.0,10.9,["*Interactive* Themes"],0.07,52),sc(11.0,12.2,["*Virtual Pet*"],0.07,56),sc(12.6,15.4,["Reacts To *Music* + *Charging*"],0.07,44),
 sc(15.9,17.8,["*Glass* Design"],0.07,56),sc(18.4,22.3,["*Translucent*","Control Center + Icons"],0.07,48),
 sc(22.7,24.7,["*Transparency* On / Off"],0.07,48),sc(25.4,27.9,["*Water Drop*","Animation"],0.07,52),
 sc(28.4,32.3,["*Origin Workbench*","Docs As Widgets"],0.07,48),
 sc(32.9,36.3,["*20-30%* Better Than OS 6","(Host Claims)"],0.07,44),
 sc(37.0,42.5,["*UI Kaisa Laga?*","Comment Karna"],0.79,62)]
tr=[{"t":f(3.4),"type":"flash"},{"t":f(36.5),"type":"blur"}]
sfx=[{"t":f(3.4),"name":"whoosh"},{"t":f(36.5),"name":"whoosh"}]
for c in cards: sfx.append({"t":c["start"],"name":"pop"})
plan={"preset":"gyan","head":{"x":0.52,"y":0.30,"full_x":0.523,"split_x":0.535,"split_zoom":1.12,"split_y":0.0,
 "circle":{"side_px":820,"cx_px":990,"cy_px":455,"size":0.463,"x":0.74,"y":0.85}},
 "layout":layout,"zooms":[],"transitions":tr,"broll":B,"cards":cards,"sfx":sfx,"bgm":"music.wav","audio":{"bgm_db":-30}}
json.dump(plan,open("work/origin_raw/plan.json","w"),indent=1); print("final",END)
