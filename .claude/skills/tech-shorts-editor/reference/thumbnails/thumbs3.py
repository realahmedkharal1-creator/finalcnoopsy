import re,sys
import numpy as np,cv2
from PIL import Image,ImageDraw,ImageFont,ImageFilter,ImageEnhance
from rembg import new_session,remove
import thumbs as T
W,H=1080,1920
sess=new_session("isnet-general-use");sess_h=new_session("u2net_human_seg")
def scaled(frame,cx,ptop,target=570):
    src=Image.open(frame).convert("RGB");scale=min(1.6,max(1.2,(H-target)/(src.height-ptop)))
    im=src.resize((int(src.width*scale),int(src.height*scale)),Image.LANCZOS)
    x0=int(cx*scale-W/2);x0=max(0,min(im.width-W,x0));return im.crop((x0,0,x0+W,im.height))
def grade(im,lum=None,tint=(66,88,80)):
    if lum is None: lum=float(np.array(im.convert("L")).mean())
    gain=min(1.1,max(0.55,92/max(lum,1)))
    im=ImageEnhance.Color(im).enhance(0.62);a=np.array(im).astype(np.float32)*gain
    a=a*0.80+np.array(tint,np.float32)*0.22;a=np.clip((a-110)*1.22+104,0,255);return Image.fromarray(a.astype(np.uint8))
def cut(im):
    m1=np.array(remove(im,session=sess,only_mask=True,post_process_mask=True)).astype(np.float32)
    m2=np.array(remove(im,session=sess_h,only_mask=True,post_process_mask=True)).astype(np.float32)
    m=np.maximum(m1,m2*(m2>128));return Image.fromarray(np.clip(m,0,255).astype(np.uint8))
# ---- reference background from the Infinix frame (phone + hand removed, inpainted, blurred)
ref=scaled("hand_full.png",950,190)
mask=np.array(cut(ref).resize(ref.size))
mk=cv2.dilate((mask>40).astype(np.uint8)*255,np.ones((61,61),np.uint8))
small=cv2.resize(np.array(ref)[...,::-1],(W//4,ref.height//4));msmall=cv2.resize(mk,(W//4,ref.height//4),interpolation=cv2.INTER_NEAREST)
inp=cv2.inpaint(small,msmall,9,cv2.INPAINT_TELEA);inp=cv2.GaussianBlur(inp,(0,0),5)
bgim=Image.fromarray(cv2.resize(inp,(W,ref.height),interpolation=cv2.INTER_CUBIC)[...,::-1])
# grade + extend to full canvas
def full_bg():
    g=grade(bgim,lum=float(np.array(ref.convert("L")).mean()))
    off=H-g.height;canvas=Image.new("RGB",(W,H))
    ext=g.crop((0,0,W,60)).resize((W,max(off,1)+260),Image.BILINEAR).filter(ImageFilter.GaussianBlur(40))
    canvas.paste(ext.crop((0,0,W,off+260)),(0,0));full=canvas.copy();canvas.paste(g,(0,off))
    m=Image.new("L",(W,H),0);md=ImageDraw.Draw(m)
    for i in range(260): md.line((0,off+i,W,off+i),fill=int(255*i/260))
    md.rectangle((0,off+260,W,H),fill=255);return Image.composite(canvas,full,m)
BG=full_bg()
def make(frame,cx,ptop,out,lines,target=570,size_override=None):
    im=scaled(frame,cx,ptop,target)
    a=cut(im).resize(im.size);alpha=np.array(a).astype(np.float32)/255.
    alpha=np.clip((alpha-0.08)/0.84,0,1);alpha=np.array(Image.fromarray((alpha*255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))).astype(np.float32)/255.
    fg=grade(im,lum=float((np.array(im.convert("L")).astype(np.float32)*alpha).sum()/max(alpha.sum(),1)))
    off=H-im.height
    comp=BG.copy().convert("RGBA")
    lay=Image.new("RGBA",(W,H),(0,0,0,0));fa=Image.fromarray((alpha*255).astype(np.uint8))
    fgr=fg.convert("RGBA");fgr.putalpha(fa);lay.paste(fgr,(0,off))
    sh=Image.new("RGBA",(W,H),(0,0,0,0));shm=Image.new("L",(W,H),0);shm.paste(fa.point(lambda v:v*150//255),(0,off+26))
    sh.putalpha(shm.filter(ImageFilter.GaussianBlur(34)));comp.alpha_composite(sh);comp.alpha_composite(lay)
    yy,xx=np.mgrid[0:H,0:W].astype(np.float32);v=np.sqrt(((xx-W/2)/(W*0.75))**2+((yy-H*0.55)/(H*0.7))**2)
    ca=np.array(comp.convert("RGB")).astype(np.float32)*(1-0.38*np.clip(v,0,1.2)[...,None]**2)
    comp=Image.fromarray(np.clip(ca,0,255).astype(np.uint8)).convert("RGBA")
    dd=ImageDraw.Draw(comp);size=210
    while max(dd.textlength(t,font=T.pf(size)) for t in lines)>960 and size>120: size-=6
    ys=[340,340+int(size*1.05)]
    for t,y in zip(lines,ys):
        f=T.pf(size);ly=Image.new("RGBA",(W,H),(0,0,0,0));d=ImageDraw.Draw(ly)
        segs=[(p,(T.pf(size*1.3) if p[0].isdigit() else f)) for p in re.findall(r"\d+|\D+",t)]
        wsum=sum(d.textlength(x,font=ff) for x,ff in segs);x=W/2-wsum/2
        for x_t,ff in segs: d.text((x+6,y+10),x_t,font=ff,fill=(0,0,0,170),anchor="ls");x+=d.textlength(x_t,font=ff)
        ly=ly.filter(ImageFilter.GaussianBlur(10));d=ImageDraw.Draw(ly);x=W/2-wsum/2
        for x_t,ff in segs: d.text((x,y),x_t,font=ff,fill=(255,255,255,255),anchor="ls");x+=d.textlength(x_t,font=ff)
        comp.alpha_composite(ly)
    comp.convert("RGB").save(out,quality=95)
if __name__=="__main__":
    ks=sys.argv[1:] or [k for k in T.T if k!="inf"]
    for k in ks:
        fr,cx,pt,s,l=T.T[k];make(fr,cx,pt,f"thumbN_{k}.png",l);print(k)
