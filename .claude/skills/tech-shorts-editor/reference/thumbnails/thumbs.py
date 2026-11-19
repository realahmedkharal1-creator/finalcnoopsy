import json
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
import numpy as np
F="/home/user/finalcnoopsy/.claude/skills/tech-shorts-editor/fonts/PlayfairDisplay-Italic.ttf"
W,H=1080,1920
def pf(size,wt=800):
    f=ImageFont.truetype(F,int(size))
    try: f.set_variation_by_axes([wt])
    except Exception: pass
    return f
def make(frame,cx,ptop,scale,out,lines,target=570,tint=(66,88,80),big=1.3,color=(255,255,255),stroke=0):
    src=Image.open(frame).convert("RGB");scale=min(1.6,max(1.2,(H-target)/(src.height-ptop)));im=src.resize((int(src.width*scale),int(src.height*scale)),Image.LANCZOS)
    x0=int(cx*scale-W/2);x0=max(0,min(im.width-W,x0));im=im.crop((x0,0,x0+W,im.height))
    off=H-im.height                                   # bottom-aligned: the frame always reaches the bottom edge
    a=np.array(im).astype(np.float32);im=Image.fromarray(a.astype(np.uint8))
    lum=float(np.array(im.convert("L")).mean());gain=min(1.1,max(0.55,92/max(lum,1)))
    im=ImageEnhance.Color(im).enhance(0.62);a=np.array(im).astype(np.float32)*gain
    a=a*0.80+np.array(tint,np.float32)*0.22;a=np.clip((a-110)*1.22+104,0,255);im=Image.fromarray(a.astype(np.uint8))
    canvas=Image.new("RGB",(W,H))
    if off>0:
        ext=im.crop((0,0,W,60)).resize((W,off+260),Image.BILINEAR).filter(ImageFilter.GaussianBlur(40))
        canvas.paste(ext.crop((0,0,W,off+260)),(0,0))
        m=Image.new("L",(W,H),0);md=ImageDraw.Draw(m)
        for i in range(260): md.line((0,off+i,W,off+i),fill=int(255*i/260))
        md.rectangle((0,off+260,W,H),fill=255)
        full=canvas.copy();canvas.paste(im,(0,off));comp=Image.composite(canvas,full,m)
    else:
        canvas.paste(im,(0,off));comp=canvas
    yy,xx=np.mgrid[0:H,0:W].astype(np.float32);v=np.sqrt(((xx-W/2)/(W*0.75))**2+((yy-H*0.55)/(H*0.7))**2)
    ca=np.array(comp).astype(np.float32)*(1-0.38*np.clip(v,0,1.2)[...,None]**2)
    comp=Image.fromarray(np.clip(ca,0,255).astype(np.uint8)).convert("RGBA")
    dd=ImageDraw.Draw(comp);size=210
    while max(dd.textlength(t,font=pf(size)) for t in lines)>960 and size>120: size-=6
    ys=[340,340+int(size*1.05)]
    for t,y in zip(lines,ys):
        f=pf(size);lay=Image.new("RGBA",(W,H),(0,0,0,0));d=ImageDraw.Draw(lay)
        import re
        segs=[(p,(pf(size*big) if p[0].isdigit() else f)) for p in re.findall(r"\d+|\D+",t)]
        wsum=sum(d.textlength(x,font=ff) for x,ff in segs);x=W/2-wsum/2
        for x_t,ff in segs: d.text((x+6,y+10),x_t,font=ff,fill=(0,0,0,170),anchor="ls");x+=d.textlength(x_t,font=ff)
        lay=lay.filter(ImageFilter.GaussianBlur(10));d=ImageDraw.Draw(lay);x=W/2-wsum/2
        for x_t,ff in segs: d.text((x,y),x_t,font=ff,fill=color+(255,),anchor="ls",stroke_width=stroke,stroke_fill=(0,0,0,255));x+=d.textlength(x_t,font=ff)
        comp.alpha_composite(lay)
    comp.convert("RGB").save(out,quality=95)
T={"inf":("hand_full.png",950,190,1.55,["7 Months","Later!"]),
"viv":("hand_viv.png",960,45,1.3,["Vivo V80","First Look!"]),
"pova":("hand_pova.png",981,165,1.37,["Pova vs","Poco M8!"]),
"hon20":("hand_hon20.png",930,150,1.5,["Honor Play","20C Review!"]),
"nubia":("hand_nubia.png",990,135,1.34,["Neo 5 Max","vs Neo 5 Pro!"]),
"findx":("hand_findx.png",990,120,1.5,["Find X10","Pro Max!"]),
"game":("hand_game.png",940,225,1.45,["Best Gaming","Phones!"]),
"iph":("hand_iph.png",945,165,1.6,["iPhone 15","Worth It?"]),
"poco":("hand_poco.png",1011,255,1.6,["3 Poco","Phones!"]),
"pixel":("hand_pixel.png",945,135,1.4,["Pixel 9a","Review!"]),
"s26":("hand_s26.png",930,165,1.45,["Galaxy S26","FE Review!"]),
"s26v":("hand_s26v.png",960,110,1.5,["S26 FE vs","S25 FE!"]),
"origin":("hand_origin.png",990,105,1.42,["Origin OS 7","Review!"])}
if __name__=="__main__":
    import sys
    for k,(fr,cx,pt,s,l) in T.items():
        if len(sys.argv)>1 and k not in sys.argv[1:]: continue
        make(fr,cx,pt,s,f"thumb_{k}.png",l)
