"""Motion-graphic cards for tech-shorts-editor, drawn with Pillow.

Each card in plan.json becomes a small folder of transparent PNG frames that
edit.py overlays on the video. A card is a list of layers; each layer has its
own entrance animation (pop / wipe / slide / fade) and start time.

Card types: pill, spec, words, price, text, display, sheet, subscribe, badge.
See SKILL.md section "Card catalogue" for the fields of each.
"""
import colorsys, math, re, shutil
import numpy as np
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

FONT_DIR = Path(__file__).resolve().parent.parent / "fonts"
FONT_FILES = {"regular": "Poppins-Regular.ttf", "medium": "Poppins-Medium.ttf", "semibold": "Poppins-SemiBold.ttf",
              "bold": "Poppins-Bold.ttf", "italic": "Poppins-ExtraBoldItalic.ttf", "display": "LilitaOne-Regular.ttf",
              "light": "Poppins-Light.ttf", "ital": "Poppins-Italic.ttf", "bolditalic": "Poppins-BoldItalic.ttf",
              "serif": "PlayfairDisplay-Italic.ttf"}
DEFAULT_Y = {"pill": 0.16, "spec": 0.20, "words": 0.60, "price": 0.68, "text": 0.14, "display": 0.48,
             "badge": 0.07, "subscribe": 0.72, "sheet": 0.50, "tag": 0.066, "product": 0.21}
GRADIENTS = {"green": ("#FFFFFF", "#6CF58A"), "cyan": ("#FFFFFF", "#8FE6FF"), "yellow": ("#FFFFFF", "#FFD84A"),
             "red": ("#FFFFFF", "#FF8A80"), "white": ("#FFFFFF", "#DDE6F2"), "purple": ("#FFFFFF", "#C4A6FF")}
OUTLINES = {"green": "#10B83A", "cyan": "#1B78E2", "yellow": "#E09A00", "red": "#D42A20", "white": "#1E2430",
            "purple": "#6D3FE0"}
_cache = {}


def font(name, size):
    key = (name, int(size))
    if key not in _cache:
        if name.startswith("gs"):                          # Google Sans, variable weight: "gs500", "gs700"
            f = ImageFont.truetype(str(FONT_DIR / "GoogleSans.ttf"), int(size))
            f.set_variation_by_axes([18, int(name[2:]), 0])
            _cache[key] = f
        elif name.startswith("is"):                        # Instrument Sans: "is95_700" = width 95, weight 700
            wd, wt = name[2:].split("_")
            f = ImageFont.truetype(str(FONT_DIR / "InstrumentSans.ttf"), int(size))
            f.set_variation_by_axes([int(wd), int(wt)])
            _cache[key] = f
        else:
            _cache[key] = ImageFont.truetype(str(FONT_DIR / FONT_FILES[name]), int(size))
    return _cache[key]


def rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def shade(h, k):
    return "#%02X%02X%02X" % tuple(max(0, min(255, int(c * k))) for c in rgb(h))


def accent(h, value=0.62, sat=0.32):
    """Darker, more saturated version of a pale tint (for bands and chips)."""
    hh, s, _ = colorsys.rgb_to_hsv(*[c / 255 for c in rgb(h)])
    return "#%02X%02X%02X" % tuple(int(c * 255) for c in colorsys.hsv_to_rgb(hh, max(s, sat), value))


def is_light(h):
    r, g, b = rgb(h)
    return 0.299 * r + 0.587 * g + 0.114 * b > 140


# ------------------------------------------------------------------ drawing helpers
def gradient(w, h, top, bottom):
    col = Image.new("RGB", (1, 2))
    col.putpixel((0, 0), rgb(top))
    col.putpixel((0, 1), rgb(bottom))
    return col.resize((max(1, w), max(1, h)), Image.BILINEAR)


def rounded_mask(w, h, r):
    m = Image.new("L", (w * 2, h * 2), 0)
    ImageDraw.Draw(m).rounded_rectangle((0, 0, w * 2 - 1, h * 2 - 1), radius=r * 2, fill=255)
    return m.resize((w, h), Image.LANCZOS)


def panel(w, h, r, top, bottom, alpha=215, border=(255, 255, 255, 215), bw=3, shadow=90, margin=28):
    """Glass panel with vertical gradient, light border and soft drop shadow. Returns image with `margin` px around."""
    w, h, r = int(w), int(h), int(min(r, h / 2))
    out = Image.new("RGBA", (w + 2 * margin, h + 2 * margin), (0, 0, 0, 0))
    mask = rounded_mask(w, h, r)
    if shadow:
        sh = Image.new("RGBA", out.size, (0, 0, 0, 0))
        sh.paste((0, 0, 0, shadow), (margin, margin + 8), mask)
        out = Image.alpha_composite(out, sh.filter(ImageFilter.GaussianBlur(12)))
    body = gradient(w, h, top, bottom).convert("RGBA")
    body.putalpha(mask.point(lambda v: v * alpha // 255))
    out.alpha_composite(body, (margin, margin))
    if bw:
        big = Image.new("RGBA", (w * 2, h * 2), (0, 0, 0, 0))
        ImageDraw.Draw(big).rounded_rectangle((bw, bw, w * 2 - 1 - bw, h * 2 - 1 - bw), radius=r * 2 - bw,
                                              outline=border, width=bw * 2)
        out.alpha_composite(big.resize((w, h), Image.LANCZOS), (margin, margin))
    return out


def rich(text, size, color="#FFFFFF", bold="semibold", light="regular", light_alpha=235, shadow=0,
         bold_color=None):
    """One line of text; *asterisks* mark the bold part. Returns a tight RGBA image."""
    segs, is_bold = [], False
    for part in str(text).split("*"):
        if part:
            segs.append((part, font(bold if is_bold else light, size), 255 if is_bold else light_alpha,
                         bold_color if is_bold and bold_color else color))
        is_bold = not is_bold
    if "*" not in str(text):                           # no markup: whole line in the bold face
        segs = [(t, font(bold, size), 255, color) for t, _, _, _ in segs]
    asc, desc = font(bold, size).getmetrics()
    pad = int(shadow * 3)
    w = int(sum(f.getlength(t) for t, f, _, _ in segs)) + 2 + 2 * pad
    img = Image.new("RGBA", (max(2, w), asc + desc + 2 * pad), (0, 0, 0, 0))
    d, x = ImageDraw.Draw(img), pad
    for t, f, a, col in segs:
        d.text((x, pad + asc), t, font=f, fill=rgb(col) + (a,), anchor="ls")
        x += f.getlength(t)
    if shadow:
        sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
        sh.paste((0, 0, 0, 150), (0, int(shadow / 2)), img.getchannel("A"))
        img = Image.alpha_composite(sh.filter(ImageFilter.GaussianBlur(shadow)), img)
    return img


def fancy(text, size, fname, fill, stroke=0, stroke_color="#FFFFFF", shadow=10, shadow_alpha=150):
    """Display text. `fill` is a hex colour or a GRADIENTS name. Optional outline and soft shadow."""
    f = font(fname, size)
    pad = int(stroke + shadow * 3 + 6)
    l, t, r, b = f.getbbox(text, stroke_width=int(stroke), anchor="ls")
    w, h = int(r - l) + 2 * pad, int(b - t) + 2 * pad
    org = (pad - l, pad - t)
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    outer = Image.new("L", (w, h), 0)
    ImageDraw.Draw(outer).text(org, text, font=f, fill=255, anchor="ls", stroke_width=int(stroke))
    if shadow:
        sh = Image.new("RGBA", (w, h), (0, 0, 0, 0))
        sh.paste((0, 0, 0, shadow_alpha), (0, int(shadow * 0.6)), outer)
        img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(shadow)))
    if stroke:
        img.paste(rgb(stroke_color) + (255,), (0, 0), outer)
    inner = Image.new("L", (w, h), 0)
    ImageDraw.Draw(inner).text(org, text, font=f, fill=255, anchor="ls")
    top, bottom = GRADIENTS.get(fill, (fill, fill))
    body = gradient(w, h - 2 * pad, top, bottom).convert("RGBA")
    full = Image.new("RGBA", (w, h), rgb(bottom) + (255,))
    full.paste(body, (0, pad))
    img.paste(full, (0, 0), inner)
    return img


def fit_size(text, size, fname, max_w):
    w = font(fname, size).getlength(text)
    return int(size * min(1.0, max_w / max(1.0, w)))


# ------------------------------------------------------------------ card builders
# each returns (canvas_w, canvas_h, layers); a layer is (image, x, y, start_s, anim)
def stack(items, gap, align="center"):
    """Lay images out vertically. items: (img, t0, anim). Returns w, h, layers."""
    w = max(i.width for i, _, _ in items)
    y, layers = 0, []
    for img, t0, anim in items:
        x = (w - img.width) // 2 if align == "center" else 0
        layers.append((img, x, y, t0, anim))
        y += img.height + gap
    return w, y - gap, layers


def card_pill(c, W, H, U):
    lines = c["text"] if isinstance(c["text"], list) else [c["text"]]
    size = c.get("size", 58) * U
    solid = c.get("fill")
    top, bottom = (solid, solid) if solid else (c.get("top", "#B4CDEE"), c.get("bottom", "#5C84C0"))
    color = c.get("color", "#111111" if solid else "#FFFFFF")
    items = []
    for n, line in enumerate(lines):
        if c.get("sub") and n == 0 and "*" not in line:
            line = f"*{line}* {c['sub']}"
        size_n = fit_size(line.replace("*", ""), size, "semibold", W * 0.84 - 80 * U)
        txt = rich(line, size_n, color, bold="bold" if solid else "semibold", light="regular", light_alpha=225)
        px, py = (44 if solid else 38) * U, (16 if solid else 20) * U
        pw, ph = txt.width + 2 * px, txt.height + 2 * py
        p = panel(pw, ph, 999 if solid else 22 * U, top, bottom, alpha=255 if solid else 220,
                  bw=0 if solid else 3)
        p.alpha_composite(txt, ((p.width - txt.width) // 2, (p.height - txt.height) // 2))
        items.append((p, n * 0.28, "pop" if solid else "wipe"))
    return stack(items, int(-34 * U))            # panels carry a 28px shadow margin, so overlap them


def card_spec(c, W, H, U):
    white = c.get("style") == "white"                 # white card, italic text, left aligned
    size = c.get("size", 60 if white else 52) * U
    color = c.get("color", "#111111" if white else "#0C1F15")
    bold, light = ("bolditalic", "ital") if white else ("semibold", "regular")
    txts = [rich(l, fit_size(l.replace("*", ""), size, bold, W * 0.8), color, bold=bold, light=light,
                 light_alpha=255) for l in c["lines"]]
    tw, th, tl = stack([(t, 0.12 + 0.14 * n, "wipe") for n, t in enumerate(txts)], int((-14 if white else 2) * U),
                       "left" if white else "center")
    px, py = 44 * U, 26 * U
    if white:
        p = panel(tw + 2 * px, th + 2 * py, 34 * U, "#FFFFFF", "#FFFFFF", alpha=255, bw=0, shadow=60)
    else:
        p = panel(tw + 2 * px, th + 2 * py, 26 * U, c.get("top", "#E6FDEE"), c.get("bottom", "#A6EBBF"), alpha=238)
    ox, oy = (p.width - tw) // 2, (p.height - th) // 2
    return p.width, p.height, [(p, 0, 0, 0.0, "pop")] + [(i, x + ox, y + oy, t, a) for i, x, y, t, a in tl]


def card_words(c, W, H, U):
    size = c.get("size", 84) * U
    gap, x, pills = int(-14 * U), 0, []
    for wd in c["words"]:
        txt = rich(wd["text"].upper(), size, "#FFFFFF", bold="bold", shadow=3 * U)
        p = panel(txt.width + 44 * U, txt.height + 6 * U, 20 * U, c.get("top", "#9DBDE8"),
                  c.get("bottom", "#4F79BA"), alpha=225)
        p.alpha_composite(txt, ((p.width - txt.width) // 2, (p.height - txt.height) // 2))
        pills.append((p, x, 0, float(wd.get("t", 0)), "pop"))
        x += p.width + gap
    return x - gap, max(p[0].height for p in pills), pills


def card_price(c, W, H, U):
    lines = c["lines"] if "lines" in c else [c["text"]]
    palette = ["green", "cyan", "yellow", "red"]
    size = c.get("size", 190) * U
    layers, y, w = [], 0, 0
    for n, ln in enumerate(lines):
        text, fill = (ln, palette[n % 4]) if isinstance(ln, str) else (ln["text"], ln.get("color", palette[n % 4]))
        s = fit_size(text, size * (1.0 + 0.12 * n), "italic", W * 0.8)
        img = fancy(text, s, "italic", fill, stroke=7 * U, stroke_color=OUTLINES.get(fill, "#FFFFFF"), shadow=10 * U)
        x = int(n * 46 * U)
        layers.append((img, x, y, n * 0.4, "pop"))
        w, y = max(w, x + img.width), y + int(img.height * 0.62)
    return w, y + int(layers[-1][0].height * 0.38), layers


def card_text(c, W, H, U):
    lines = c["text"] if isinstance(c["text"], list) else [c["text"]]
    size, color = c.get("size", 60) * U, c.get("color", "#FFFFFF")
    sh = 4 * U if is_light(color) else 0
    items = [(rich(l, fit_size(l.replace("*", ""), size, "semibold", W * 0.86), color, shadow=sh),
              n * 0.15, "wipe") for n, l in enumerate(lines)]
    if c.get("sub"):
        items.append((rich(c["sub"], size * 0.62, color, bold="regular", shadow=sh), len(lines) * 0.15, "wipe"))
    return stack(items, int(-10 * U), c.get("align", "center"))


def card_display(c, W, H, U):
    lines = c["text"] if isinstance(c["text"], list) else [c["text"]]
    size, color = c.get("size", 150) * U, c.get("color", "#FFFFFF")
    fname = c.get("font", "display")
    items = [(fancy(l, fit_size(l, size, fname, W * 0.86), fname, color, shadow=12 * U, shadow_alpha=140),
              n * 0.12, "pop") for n, l in enumerate(lines)]
    if c.get("sub"):
        items.append((fancy(c["sub"], fit_size(c["sub"], size * 0.5, fname, W * 0.86), fname, color,
                            shadow=8 * U, shadow_alpha=140), 0.15 + len(lines) * 0.12, "pop"))
    return stack(items, int(-52 * U))


def card_badge(c, W, H, U):
    d = int(c.get("size", 120) * U)
    p = panel(d, d, d, c.get("top", "#7C9BFF"), c.get("bottom", "#2F4FE0"), alpha=255, bw=3)
    t = rich(str(c["text"]), d * 0.6, "#FFFFFF", bold="bold")
    p.alpha_composite(t, ((p.width - t.width) // 2, (p.height - t.height) // 2))
    return p.width, p.height, [(p, 0, 0, 0.0, "pop")]


def card_subscribe(c, W, H, U):
    cw, ch, av = int(430 * U), int(330 * U), int(170 * U)
    p = panel(cw, ch, 26 * U, "#FFFFFF", "#DDE3EA", alpha=70, border=(255, 255, 255, 170), bw=2, shadow=50)
    m = (p.width - cw) // 2
    top = av // 2
    layers = [(p, 0, top, 0.0, "pop")]
    circle = rounded_mask(av, av, av)
    avatar = Image.new("RGBA", (av, av), (0, 0, 0, 0))
    src = c.get("avatar")
    if src and Path(src).exists():
        im = Image.open(src).convert("RGB")
        s = min(im.size)
        im = im.crop(((im.width - s) // 2, (im.height - s) // 2, (im.width + s) // 2, (im.height + s) // 2))
        avatar.paste(im.resize((av, av), Image.LANCZOS), (0, 0), circle)
    else:
        avatar.paste(gradient(av, av, "#FF8FA3", "#FF4D6D").convert("RGBA"), (0, 0), circle)
        t = rich((c.get("name") or "?")[:1].upper(), av * 0.55, "#FFFFFF", bold="bold")
        avatar.alpha_composite(t, ((av - t.width) // 2, (av - t.height) // 2))
    ring = Image.new("RGBA", (av * 2, av * 2), (0, 0, 0, 0))
    ImageDraw.Draw(ring).ellipse((3, 3, av * 2 - 4, av * 2 - 4), outline=(255, 255, 255, 235), width=int(10 * U))
    avatar.alpha_composite(ring.resize((av, av), Image.LANCZOS))
    layers.append((avatar, (p.width - av) // 2, m, 0.12, "pop"))
    name = rich(c.get("name", "Your Channel"), fit_size(c.get("name", "Your Channel"), 44 * U, "bold", cw * 0.9),
                "#FFFFFF", bold="bold", shadow=3 * U)
    y = m + av + int(4 * U)
    layers.append((name, (p.width - name.width) // 2, y, 0.3, "wipe"))
    y += name.height - int(14 * U)
    if c.get("tagline"):
        tag = rich(c["tagline"], 22 * U, "#FFFFFF", bold="regular", shadow=2 * U)
        layers.append((tag, (p.width - tag.width) // 2, y, 0.42, "fade"))
        y += tag.height - int(2 * U)
    states = ((c.get("button", "Subscribe"), "#FFFFFF", "#111111", 0.55, 1.15, "pop"),      # white
              ("Subscribing", "#F0305A", "#FFFFFF", 1.15, 1.75, "wipe"),                    # pink while "clicked"
              (c.get("button_done", "Subscribed"), "#FFFFFF", "#111111", 1.75, 1e9, "pop"))  # white again
    for label, bg, fg, t0, t1, anim in states:
        t = rich(label, 28 * U, fg, bold="semibold")
        b = panel(t.width + 70 * U, t.height + 14 * U, 999, bg, bg, alpha=255, bw=0, shadow=60, margin=14)
        b.alpha_composite(t, ((b.width - t.width) // 2, (b.height - t.height) // 2))
        layers.append((b, (p.width - b.width) // 2, y, t0, anim, t1))
    return p.width, top + p.height, layers


def load_product(path):
    """Open a product picture. If it has no transparency and sits on a plain background, cut the background out."""
    im = Image.open(path).convert("RGBA")
    if im.getchannel("A").getextrema()[0] < 250:
        return im.crop(im.getchannel("A").getbbox())
    rgb, (w, h) = im.convert("RGB"), im.size
    corners = [rgb.getpixel(p) for p in ((1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2))]
    if max(max(abs(a - b) for a, b in zip(c, corners[0])) for c in corners) > 24:
        return im                                       # busy background: leave as it is
    magic = (255, 0, 254)
    for p in ((0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1), (w // 2, 0), (w // 2, h - 1), (0, h // 2), (w - 1, h // 2)):
        if rgb.getpixel(p) != magic:
            ImageDraw.floodfill(rgb, p, magic, thresh=28)
    mask = rgb.point(lambda v: 0).convert("L")
    mask.putdata([0 if px == magic else 255 for px in rgb.getdata()])
    mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    im.putalpha(mask)
    return im.crop(mask.point(lambda v: 255 if v > 20 else 0).getbbox())


def paper(img, strength=0.55):
    """Subtle paper grain."""
    w, h = img.size
    lumps = Image.effect_noise((w // 3 + 1, h // 3 + 1), 46).filter(ImageFilter.GaussianBlur(1.1))
    lumps = lumps.resize((w, h), Image.BICUBIC).filter(ImageFilter.EMBOSS)          # raised, canvas-like relief
    fibres = Image.effect_noise((w // 10 + 1, h), 30).resize((w, h), Image.BILINEAR)  # short horizontal fibres
    tex = Image.blend(lumps, fibres, 0.3).convert("RGB")
    return Image.blend(img, ImageChops.soft_light(img, tex), strength)


def wavy_band(W, y0, y1, amp, phase):
    """Polygon for a horizontal band whose top and bottom edges wave gently (torn-paper look)."""
    def off(x, p):
        return amp * (0.6 * math.sin(x / (W * 0.16) + p) + 0.4 * math.sin(x / (W * 0.057) + p * 2.3))
    xs = list(range(0, W + 8, 8))
    return [(x, y0 + off(x, phase)) for x in xs] + [(x, y1 + off(x, phase + 1.7)) for x in reversed(xs)]


def row_icon(kind, d, ink="#505050"):
    """Small pictogram in a white circle. Drawn 4x and scaled down for smooth edges."""
    s = d * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    g = ImageDraw.Draw(img)
    g.ellipse((0, 0, s - 1, s - 1), fill=(255, 255, 255, 255))
    c, u, k = s / 2, s / 52, rgb(ink) + (255,)
    if kind == "display":
        g.rounded_rectangle((c - 7 * u, c - 12 * u, c + 7 * u, c + 12 * u), 3 * u, fill=k)
        g.line((c - 4 * u, c + 7 * u, c + 4 * u, c - 7 * u), fill=(255, 255, 255, 255), width=int(3 * u))
    elif kind == "chip":
        g.rounded_rectangle((c - 8 * u, c - 8 * u, c + 8 * u, c + 8 * u), 2 * u, fill=k)
        g.rectangle((c - 4 * u, c - 4 * u, c + 4 * u, c + 4 * u), fill=(255, 255, 255, 255))
        for i in (-5, 0, 5):
            g.line((c + i * u, c - 13 * u, c + i * u, c + 13 * u), fill=k, width=int(2 * u))
            g.line((c - 13 * u, c + i * u, c + 13 * u, c + i * u), fill=k, width=int(2 * u))
        g.rounded_rectangle((c - 8 * u, c - 8 * u, c + 8 * u, c + 8 * u), 2 * u, fill=k)
        g.rectangle((c - 3.5 * u, c - 3.5 * u, c + 3.5 * u, c + 3.5 * u), fill=(255, 255, 255, 255))
    elif kind == "storage":
        for j in (-9, -2, 5):
            g.rounded_rectangle((c - 12 * u, c + j * u, c + 12 * u, c + (j + 5) * u), 2 * u, fill=k)
            g.ellipse((c + 6 * u, c + (j + 1.2) * u, c + 8.6 * u, c + (j + 3.8) * u), fill=(255, 255, 255, 255))
    elif kind == "battery":
        g.rounded_rectangle((c - 7 * u, c - 10 * u, c + 7 * u, c + 13 * u), 3 * u, fill=k)
        g.rectangle((c - 3 * u, c - 13 * u, c + 3 * u, c - 10 * u), fill=k)
        g.polygon([(c + 1 * u, c - 6 * u), (c - 4 * u, c + 2 * u), (c - 0.5 * u, c + 2 * u), (c - 1.5 * u, c + 9 * u),
                   (c + 4 * u, c + 0 * u), (c + 0.5 * u, c + 0 * u)], fill=(255, 255, 255, 255))
    elif kind == "camera":
        g.rounded_rectangle((c - 12 * u, c - 7 * u, c + 12 * u, c + 10 * u), 3 * u, fill=k)
        g.rectangle((c - 5 * u, c - 10 * u, c + 5 * u, c - 6 * u), fill=k)
        g.ellipse((c - 5.5 * u, c - 4 * u, c + 5.5 * u, c + 7 * u), fill=(255, 255, 255, 255))
        g.ellipse((c - 3 * u, c - 1.5 * u, c + 3 * u, c + 4.5 * u), fill=k)
    elif kind == "water":
        g.ellipse((c - 8 * u, c - 3 * u, c + 8 * u, c + 13 * u), fill=k)
        g.polygon([(c, c - 13 * u), (c - 7.4 * u, c + 2 * u), (c + 7.4 * u, c + 2 * u)], fill=k)
    elif kind == "os":
        g.pieslice((c - 12 * u, c - 8 * u, c + 12 * u, c + 16 * u), 180, 360, fill=k)
        g.line((c - 7 * u, c - 6 * u, c - 10 * u, c - 11 * u), fill=k, width=int(2 * u))
        g.line((c + 7 * u, c - 6 * u, c + 10 * u, c - 11 * u), fill=k, width=int(2 * u))
        for ex in (-5, 5):
            g.ellipse((c + (ex - 1.6) * u, c - 2 * u, c + (ex + 1.6) * u, c + 1.2 * u), fill=(255, 255, 255, 255))
    else:
        g.ellipse((c - 5 * u, c - 5 * u, c + 5 * u, c + 5 * u), fill=k)
    return img.resize((d, d), Image.LANCZOS)


ICON_WORDS = [("battery", ("mah", "battery", "charg", "wh ")), ("camera", ("mp ", "mp+", "camera", "selfie")),
              ("water", ("ip5", "ip6", "water", "atm")),
              ("chip", ("snapdragon", "dimensity", "helio", "exynos", "tensor", "bionic", "unisoc", "intel", "ryzen",
                        "chip", "nm)")),
              ("storage", ("ram", "ufs", "storage", "ssd", "rom")),
              ("display", ('"', "”", "amoled", "oled", "lcd", "display", "hz")),
              ("os", ("android", " ui", "os", "years", "update", "windows"))]


def guess_icon(row):
    low = row.lower() + " "
    return next((kind for kind, words in ICON_WORDS if any(w in low for w in words)), "dot")


def seal(text, d, top="#2F6BE0", bottom="#1B3FA8", ribbon="#FFD43B"):
    """Round sale badge with a ribbon, for a hanging tag."""
    s = d * 3
    img = Image.new("RGBA", (int(s * 1.3), s), (0, 0, 0, 0))
    g, cx = ImageDraw.Draw(img), int(s * 0.65)
    g.ellipse((cx - s * 0.46, s * 0.04, cx + s * 0.46, s * 0.96), fill=rgb(ribbon) + (255,))
    body = gradient(int(s * 0.8), int(s * 0.8), top, bottom).convert("RGBA")
    body.putalpha(rounded_mask(int(s * 0.8), int(s * 0.8), s))
    img.alpha_composite(body, (cx - int(s * 0.4), int(s * 0.1)))
    g.polygon([(s * 0.02, s * 0.36), (s * 1.28, s * 0.36), (s * 1.2, s * 0.5), (s * 1.28, s * 0.64), (s * 0.02, s * 0.64),
               (s * 0.1, s * 0.5)], fill=rgb(ribbon) + (255,))
    t = rich(text.upper(), fit_size(text.upper(), s * 0.2, "bold", s * 0.95), "#1B2F7A", bold="bold")
    img.alpha_composite(t, (cx - t.width // 2, int(s * 0.5 - t.height / 2)))
    return img.resize((int(d * 1.3), d), Image.LANCZOS).rotate(-8, expand=True, resample=Image.BICUBIC)


def gtext(text, size, weight=500, color="#474747", track=0.0):
    """Google Sans text with letter-spacing (track, in px at this size). Returns a tight RGBA image."""
    f = font(f"gs{int(weight)}", size)
    asc, desc = f.getmetrics()
    xs, x = [], 0.0
    for ch in text:
        xs.append(x)
        x += f.getlength(ch) + track
    img = Image.new("RGBA", (max(2, int(x - track) + 4), asc + desc + 2), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    thin = font("gs400", size)
    for ch, cx in zip(text, xs):
        if ch == "|" and weight < 650:                     # separators are thinner and lighter than the words
            d.text((cx + 1, asc), ch, font=thin, fill=rgb(color) + (150,), anchor="ls")
        else:
            d.text((cx + 1, asc), ch, font=f, fill=rgb(color) + (255,), anchor="ls")
    return img


def rough(mask, u, amount=1.0):
    """Give a shape mask slightly irregular, torn-paper edges."""
    soft = mask.filter(ImageFilter.GaussianBlur(2.2 * u))
    noise = Image.effect_noise(mask.size, 70 * amount).filter(ImageFilter.GaussianBlur(1.6 * u))
    mixed = ImageChops.add(soft, noise, 2.0)               # (soft + noise) / 2
    return mixed.point(lambda v: 255 if v > 128 else 0).filter(ImageFilter.GaussianBlur(0.7))


def deepen(h):
    """Same hue, more saturated and darker: the colour of the price digits."""
    hh, sat, val = colorsys.rgb_to_hsv(*[c / 255 for c in rgb(h)])
    val = val * 0.74 if val > 0.35 else min(0.5, val + 0.12)
    return "#%02X%02X%02X" % tuple(int(c * 255) for c in colorsys.hsv_to_rgb(hh, min(1.0, sat + 0.22), val))


def gfit(text, size, weight, track, max_w):
    w = gtext(text, size, weight, track=track).width
    return size * min(1.0, max_w / max(1, w))


def swinging(badge, ax, length, u, centre, amp, period, phase):
    """A badge on a string that swings like a pendulum. Returns a draw(canvas, t) function."""
    if isinstance(badge, str) and Path(badge).suffix.lower() in (".png", ".jpg", ".jpeg", ".webp") and Path(badge).exists():
        b = Image.open(badge).convert("RGBA")
        k = 150 * u / max(b.size)
        b = b.resize((max(1, int(b.width * k)), max(1, int(b.height * k))), Image.LANCZOS)
        if b.getchannel("A").getextrema()[0] > 250:        # a logo on a solid tile: keep it, round the corners
            b.putalpha(rounded_mask(b.width, b.height, int(min(b.size) * 0.22)))
    else:
        b = seal(str(badge), int(125 * u))
    pad = int(26 * u)
    tag = Image.new("RGBA", (b.width + 2 * pad, b.height + 2 * pad), (0, 0, 0, 0))
    sh = Image.new("RGBA", tag.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 80), (pad + int(7 * u), pad + int(10 * u)), b.getchannel("A"))
    tag = Image.alpha_composite(tag, sh.filter(ImageFilter.GaussianBlur(7 * u)))
    tag.alpha_composite(b, (pad, pad))

    def draw(canvas, t):
        a = math.radians(centre + amp * math.exp(-0.18 * t) * math.cos(2 * math.pi * t / period + phase))
        tx, ty = ax + length * math.sin(a), -20 * u + length * math.cos(a)        # where the string meets the badge
        x0, pad_ = min(ax, tx) - 12, 12                    # draw the string on its own layer so it blends
        line = Image.new("RGBA", (int(abs(tx - ax)) + 2 * pad_ + 8, int(ty) + 8), (0, 0, 0, 0))
        g = ImageDraw.Draw(line)
        g.line((ax - x0 + 3 * u, 0, tx - x0 + 3 * u, ty + 3 * u), fill=(0, 0, 0, 30), width=max(2, int(5 * u)))
        g.line((ax - x0, 0, tx - x0, ty), fill=(255, 255, 255, 215), width=max(2, int(5 * u)))
        comp(canvas, line.filter(ImageFilter.GaussianBlur(0.8 * u)), x0, 0)
        r = tag.rotate(-math.degrees(a), resample=Image.BICUBIC, expand=True)
        cx, cy = tx + (b.height * 0.42) * math.sin(a), ty + (b.height * 0.42) * math.cos(a)
        comp(canvas, r, cx - r.width / 2, cy - r.height / 2)
    return draw


# Edge waves measured from the reference clip (pixels on a 1080x1920 frame). Each edge is a smooth wave that
# slides sideways while the sheet is on screen: the top edge drifts right, the bottom edge drifts left.
EDGE_TOP = dict(base=4.7, period=250, terms=((-3.6, -2.98, 1), (0.9, 0.4, 0.41)), speed=111)
EDGE_BOTTOM = dict(base=3.5, period=240, terms=((-0.52, 3.82, 1), (0.44, -0.11, 2), (0.8, 0.5, 0.39)), speed=-126)


def edge_wave(xs, t, e):
    """Edge offset (px) at positions xs (1080-scale) and time t (s)."""
    x = xs - e["speed"] * t
    out = np.full(xs.shape, e["base"], dtype=np.float32)
    for sn, cs, h in e["terms"]:
        k = 2 * np.pi * h * x / e["period"]
        out += sn * np.sin(k) + cs * np.cos(k)
    return out


def card_sheet(c, W, H, U):
    """Full-screen spec sheet in the reference layout (all numbers are pixels on a 1080x1920 frame)."""
    u = min(W / 1080, H / 1920) * c.get("scale", 1.0)
    ox, oy = (W - 1080 * u) / 2, (H - 1920 * u) / 2
    X = lambda v: int(ox + v * u)
    Y = lambda v: int(oy + v * u)
    tint = c.get("tint", "#D7DCC1")
    dark = c.get("dark") or accent(tint, 0.51, 0.31)
    chip_col = c.get("chip") or shade(dark, 1.09)
    rows = [re.sub(r"[ ]*\|[ ]*", "   |   ", str(r)) for r in c.get("rows", [])]     # airy separators
    size, track = 37 * u, -0.8 * u

    def width(s):
        return gtext(s, size, 500, track=track).width
    split = []
    for row in rows:                                       # wrap rows that are too long, as the reference does
        parts = [p.strip() for p in row.split("\n")]
        if len(parts) == 1 and width(row) > 790 * u:
            for sep in ("   |   ", " + "):
                if sep in row:
                    a, _, b = row.rpartition(sep)
                    parts = [a.strip(), b.strip()]
                    break
        split.append(parts)
    widest = max((width(p) for parts in split for p in parts), default=0)
    icon_x, text_x = (165, 244) if widest <= 700 * u else (125, 203)
    cy, centres = 972.0, []
    for parts in split:
        centres.append(cy)
        cy += 60 + 40 * (len(parts) - 1)
    panel_top, panel_bot = 885, (centres[-1] + 40 * (len(split[-1]) - 1) + 46 if rows else 1100)

    xs = (np.arange(W) - ox) / u
    yy = np.arange(H, dtype=np.float32)[:, None]
    tex_top = np.asarray(paper(Image.new("RGB", (W, H), rgb(tint)), 0.8), dtype=np.float32)
    tex_low = np.asarray(paper(Image.new("RGB", (W, H), rgb(dark)), 0.8), dtype=np.float32)
    rim = np.array(rgb(shade(chip_col, 0.86)), dtype=np.float32)
    pale = np.array([v + (255 - v) * 0.18 for v in rgb(tint)], dtype=np.float32)
    gx = ((np.arange(W) - ox) % (54 * u) < 1)[None, :]
    reach = 60 * u                                         # rows that can change as the edges move

    def cover(dist):                                      # anti-aliased step: 1 where dist > 0
        return np.clip(dist + 0.5, 0, 1)[..., None]

    def paint(y0, y1, top, bot):
        """Pixels of rows y0..y1 for given top/bottom edge curves (absolute rows)."""
        y = yy[y0:y1]
        img = tex_top[y0:y1] * (1 - cover(y - bot)) + tex_low[y0:y1] * cover(y - bot)
        grey = 239 - 38 * np.clip(1 - (y - top) / (38 * u), 0, 1) - 27 * np.clip(1 - (bot - y) / (38 * u), 0, 1)
        grey = grey - 3 * (gx | ((y - Y(panel_top)) % (54 * u) < 1))   # faint squared-paper grid
        a_ = cover(y - top - 2 * u) * cover(bot - 3.5 * u - y)
        img = img * (1 - a_) + grey[..., None] * a_       # white panel, shaded towards both edges
        a_ = cover(2 * u - np.abs(y - top))
        img = img * (1 - a_) + rim * a_                   # dark line on the top edge
        a_ = cover(y - bot + 4 * u) * cover(bot - y) * 0.92
        return img * (1 - a_) + pale * a_                 # pale line on the bottom edge

    def edges(t):
        top = (oy + u * (panel_top - 2 + edge_wave(xs, t, EDGE_TOP)))[None, :]
        bot = (oy + u * (panel_bot + edge_wave(xs, t, EDGE_BOTTOM)))[None, :]
        return top, bot
    t0_top, t0_bot = edges(0.0)
    still = np.clip(paint(0, H, t0_top, t0_bot), 0, 255).astype(np.uint8)
    bands = [(max(0, int(Y(panel_top) - reach)), int(Y(panel_top) + reach)),
             (int(Y(panel_bot) - reach), min(H, int(Y(panel_bot) + reach)))]

    def background(canvas, t):
        top, bot = edges(t)
        frame = still.copy()
        for y0, y1 in bands:
            frame[y0:y1] = np.clip(paint(y0, y1, top, bot), 0, 255).astype(np.uint8)
        canvas.alpha_composite(Image.fromarray(frame).convert("RGBA"))

    bg = Image.new("RGBA", (W, H), (0, 0, 0, 0))           # everything that sits on the paper
    src = c.get("image")
    if src and Path(src).exists():
        im = load_product(src)
        k = min(700 * u / im.width, 714 * u / im.height)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        px, py = X(538) - im.width // 2, Y(806) - im.height
        sh.paste((0, 0, 0, 105), (px + int(5 * u), py + int(8 * u)), im.getchannel("A"))
        bg = Image.alpha_composite(bg, sh.filter(ImageFilter.GaussianBlur(7 * u)))
        bg.alpha_composite(im, (px, py))

    title = c.get("title", "")
    t = gtext(title, gfit(title, 35.5 * u, 560, track, 640 * u), 560, "#FFFFFF", track)
    cw_, ch_ = int(t.width + 88 * u), int(74 * u)
    chip = Image.new("RGBA", (cw_ * 2, ch_ * 2), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle((0, 0, cw_ * 2 - 1, ch_ * 2 - 1), radius=ch_, fill=rgb(chip_col) + (255,),
                                           outline=rgb(shade(chip_col, 0.88)) + (255,), width=max(2, int(5 * u)))
    chip = chip.resize((cw_, ch_), Image.LANCZOS)
    chip.alpha_composite(t, ((cw_ - t.width) // 2, (ch_ - t.height) // 2))
    bg.alpha_composite(chip, (X(540) - cw_ // 2, Y(888) - ch_ // 2))

    icons = c.get("icons") or []
    d = int(46 * u)
    for n, parts in enumerate(split):
        kind = icons[n] if n < len(icons) else guess_icon(rows[n])
        ic = row_icon(kind, d)
        ish = Image.new("RGBA", (d + 20, d + 20), (0, 0, 0, 0))
        ish.paste((0, 0, 0, 40), (10, 12), ic.getchannel("A"))
        ish = ish.filter(ImageFilter.GaussianBlur(4 * u))
        ish.alpha_composite(ic, (10, 10))
        bg.alpha_composite(ish, (X(icon_x) - 10, Y(centres[n]) - d // 2 - 10))
        for m, p in enumerate(parts):
            img = gtext(p, gfit(p, size, 500, track, 800 * u), 500, "#4B4B4B", track)
            bg.alpha_composite(img, (X(text_x), Y(centres[n] + 40 * m) - img.height // 2))

    layers = []
    if c.get("price"):
        label, sep, value = c["price"].partition(" - ")
        label = label.strip() + " -" if sep else ""
        value = (value if sep else c["price"]).strip()
        value = re.sub(r"₹\s*", "Rs ", value)             # prices are written with "Rs"
        pw, ph = int(800 * u), int(95 * u)
        pill = Image.new("RGBA", (pw + 60, ph + 60), (0, 0, 0, 0))
        psh = Image.new("RGBA", pill.size, (0, 0, 0, 0))
        shape = Image.new("L", pill.size, 0)
        ImageDraw.Draw(shape).rounded_rectangle((30, 30, 30 + pw, 30 + ph), 22 * u, fill=255)
        shape = rough(shape, u, 0.55)
        psh.paste((0, 0, 0, 150), (int(8 * u), int(10 * u)), shape)
        pill = Image.alpha_composite(pill, psh.filter(ImageFilter.GaussianBlur(2.5 * u)))
        pill.paste((254, 254, 252, 255), (0, 0), shape)
        py = Y(panel_bot + 203) - ph // 2
        px = X(540) - pw // 2

        # Lettering measured from the reference: Instrument Sans, 74 px, label width 95, digits width 100,
        # wider word spaces and a 28 px gap before the price.
        def plan(k):
            fl, fd = font("is95_700", 73 * u * k), font("is100_700", 73 * u * k)
            items, pen = [], 0.0                           # (char, font, pen x)
            for ch in label:
                items.append((ch, fl, pen))
                pen += fl.getlength(ch) - 0.47 * u * k + (3.5 * u * k if ch == " " else 0)
            ink_end = pen - fl.getlength("-") + 0.47 * u * k + fl.getbbox("-", anchor="ls")[2] if label else 0
            pen = ink_end + 25 * u * k if label else 0
            first = True
            for ch in value:
                if first:
                    pen -= fd.getbbox(ch, anchor="ls")[0]  # line glyph ink up with the gap, not its side bearing
                items.append((ch, fd, pen))
                pen += fd.getlength(ch) - 0.21 * u * k
                first = False
            return items, pen
        k = 1.0
        items, total = plan(k)
        if total > 740 * u:                                # long prices shrink to fit the pill
            k = 740 * u / total
            items, total = plan(k)
        base = py + 74.5 * u * k + (ph - 95 * u * k) / 2   # baseline inside the pill
        x0 = X(540) - total / 2
        lab_img = Image.new("RGBA", pill.size, (0, 0, 0, 0))
        dl = ImageDraw.Draw(lab_img)
        nlabel = len(label)
        for ch, f, x in items[:nlabel]:
            dl.text((x0 + x - px + 30, base - py + 30), ch, font=f, fill=(0x53, 0x53, 0x53, 255), anchor="ls")
        pill.alpha_composite(lab_img)
        bg.alpha_composite(pill, (px - 30, py - 30))

        hh, ss, vv = colorsys.rgb_to_hsv(*[v / 255 for v in rgb(dark)])
        top_c = np.array(colorsys.hsv_to_rgb(hh, max(0.0, ss - 0.02), min(1.0, vv * 1.07))) * 255
        bot_c = np.array(colorsys.hsv_to_rgb(hh, min(1.0, ss + 0.30), vv * 0.66)) * 255
        if c.get("price_color"):
            top_c = bot_c = np.array(rgb(c["price_color"]), dtype=float)
        cap = 55 * u * k
        for i, (ch, f, x) in enumerate(items[nlabel:]):  # digits arrive one by one, growing up from the baseline
            if not ch.strip():
                continue
            bb = f.getbbox(ch, anchor="ls")
            m = Image.new("L", (int(bb[2] - bb[0]) + 4, int(bb[3] - bb[1]) + 4), 0)
            ImageDraw.Draw(m).text((2 - bb[0], 2 - bb[1]), ch, font=f, fill=255, anchor="ls")
            lx, ly = x0 + x + bb[0] - 2, base + bb[1] - 2
            rows = (ly + np.arange(m.height) - (base - cap)) / cap        # 0 at cap height, 1 on the baseline
            t = np.clip(rows, -0.1, 1.25)[:, None]
            col = top_c[None, :] + (bot_c - top_c)[None, :] * t
            fill = np.repeat(col[:, None, :], m.width, axis=1).clip(0, 255).astype(np.uint8)
            glyph = Image.fromarray(fill, "RGB").convert("RGBA")
            glyph.putalpha(m)
            layers.append((glyph, int(round(lx)), int(round(ly)), 0.07 + 0.09 * i, "grow"))
    layers.insert(0, (bg, 0, 0, 0.0, "none"))
    layers.insert(0, (background, 0, 0, 0.0, "dyn"))

    badges = (c.get("badges") or [])[:2]
    spots = [(X(255), 330 * u, 3, 21, 1.6, -0.9), (X(830), 500 * u, 12, 14, 1.8, 2.8)]
    for n, b in enumerate(badges):
        ax, length, centre, amp, period, phase = spots[n]
        layers.append((swinging(b, ax, length, u, centre, amp, period, phase), 0, 0, 0.0, "dyn"))
    return W, H, layers


def card_tag(c, W, H, U):
    """Small white name tag for the top-left corner (pair it with "progress": true for the yellow bar)."""
    t = rich(c["text"], c.get("size", 40) * U, "#111111", bold="bolditalic")
    p = panel(t.width + 28 * U, t.height + 2 * U, 10 * U, "#FFFFFF", "#FFFFFF", alpha=255, bw=0, shadow=40, margin=16)
    p.alpha_composite(t, ((p.width - t.width) // 2, (p.height - t.height) // 2))
    return p.width, p.height, [(p, 0, 0, 0.0, "wipe")]


def card_product(c, W, H, U):
    """Product title: thin brand line, then the model in italic serif sitting on a colour bar."""
    color = c.get("color", "#FFFFFF")
    brand = rich(c.get("brand", ""), fit_size(c.get("brand", ""), c.get("size", 104) * U, "light", W * 0.8), color,
                 bold="light", shadow=3 * U if is_light(color) else 0)
    model_color = c.get("model_color", color)
    ms = fit_size(c["model"], c.get("size", 104) * 1.12 * U, "serif", W * 0.8)
    model = rich(c["model"], ms, model_color, bold="serif")
    bar_w, bar_h = max(model.width + 70 * U, brand.width), ms * 0.62
    bar = panel(bar_w, bar_h, 8 * U, c.get("bar", "#0B3D12"), c.get("bar", "#0B3D12"), alpha=255, bw=0, shadow=0,
                margin=0)
    w = int(max(bar_w, brand.width, model.width))
    by = brand.height - int(34 * U)
    layers = [(brand, (w - brand.width) // 2, 0, 0.0, "wipe"),
              (bar, (w - bar.width) // 2, by + int(model.height * 0.44), 0.1, "wipe"),
              (model, (w - model.width) // 2, by, 0.3, "wipe")]
    return w, by + model.height, layers


BUILDERS = {"tag": card_tag, "product": card_product, "pill": card_pill, "spec": card_spec, "words": card_words, "price": card_price, "text": card_text,
            "display": card_display, "badge": card_badge, "subscribe": card_subscribe, "sheet": card_sheet}
ANIM_S = {"pop": 0.24, "wipe": 0.45, "slide": 0.32, "fade": 0.2, "none": 0.0, "grow": 0.17, "dyn": 0.0}


# ------------------------------------------------------------------ animation
def with_alpha(img, a):
    if a >= 0.999:
        return img
    out = img.copy()
    out.putalpha(img.getchannel("A").point(lambda v: int(v * a)))
    return out


def comp(canvas, img, x, y):
    x, y = int(x), int(y)
    sx, sy = max(0, -x), max(0, -y)
    ex, ey = min(img.width, canvas.width - x), min(img.height, canvas.height - y)
    if ex > sx and ey > sy:
        canvas.alpha_composite(img.crop((sx, sy, ex, ey)), (x + sx, y + sy))


def draw_layer(canvas, layer, t, U):
    img, x, y, t0, anim = layer[:5]
    if anim == "dyn":                                      # layer draws itself every frame (e.g. a swinging tag)
        return img(canvas, t)
    lt = t - t0
    if lt < 0 or (len(layer) > 5 and t >= layer[5]):
        return
    p = min(1.0, lt / ANIM_S[anim]) if ANIM_S[anim] else 1.0
    ease = 1 - (1 - p) ** 3
    if anim == "pop":
        back = 1 + 2.2 * (p - 1) ** 3 + 1.2 * (p - 1) ** 2          # overshoots to ~1.05 then settles
        s = 0.6 + 0.4 * back
        if abs(s - 1) > 0.004:
            w, h = max(1, int(img.width * s)), max(1, int(img.height * s))
            x, y = x + (img.width - w) / 2, y + (img.height - h) / 2
            img = img.resize((w, h), Image.BILINEAR)
        comp(canvas, with_alpha(img, min(1.0, lt / 0.1)), x, y)
    elif anim == "wipe":
        w = max(1, int(img.width * ease))
        comp(canvas, with_alpha(img.crop((0, 0, w, img.height)), min(1.0, lt / 0.12)), x, y)
    elif anim == "slide":
        comp(canvas, with_alpha(img, p), x, y + (1 - ease) * 50 * U)
    elif anim == "fade":
        comp(canvas, with_alpha(img, p), x, y)
    elif anim == "grow":                                   # scale up from the bottom-left corner (baseline)
        s = 0.3 + 0.7 * ease
        w, h = max(1, int(img.width * s)), max(1, int(img.height * s))
        comp(canvas, img.resize((w, h), Image.BILINEAR) if s < 0.995 else img, x, y + (img.height - h) * 0.78)
    else:
        comp(canvas, img, x, y)


def render_card(card, W, H, fps, out_dir):
    """Write the PNG frames of one card. Returns (ffmpeg input pattern, overlay x, overlay y)."""
    U = min(W, H) / 1080 * card.get("scale", 1.0)
    w, h, layers = BUILDERS[card["type"]](card, W, H, U)
    margin = 0 if card["type"] == "sheet" else int(40 * U)       # room for the pop overshoot
    cw, ch = w + 2 * margin, h + 2 * margin
    layers = [(l[0], l[1] + margin, l[2] + margin) + tuple(l[3:]) for l in layers]
    dur = max(0.2, card["end"] - card["start"])
    n = max(2, int(round(dur * fps)))
    settled = max(max(l[3] + ANIM_S[l[4]], l[5] if len(l) > 5 and l[5] < 1e8 else 0) for l in layers) + 1 / fps
    sheet = card["type"] == "sheet"
    moving = [l for l in layers if l[4] == "dyn"]
    still = [l for l in layers if l[4] != "dyn"]
    out_s = 0.0 if sheet else min(0.15, dur / 4)           # sheets cut out hard, like the reference
    out_dir = Path(out_dir)
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    runs, cur = [], []                                     # consecutive still layers form one cached run
    for l in layers:
        if l[4] == "dyn":
            if cur:
                runs.append(cur)
                cur = []
            runs.append(l)
        else:
            cur.append(l)
    if cur:
        runs.append(cur)
    cache = {}
    held = None
    for f in range(n):
        t = f / fps
        path = out_dir / f"f_{f:04d}.png"
        fading = out_s > 0 and t > dur - out_s
        if t >= settled and not fading and held and not moving:
            shutil.copyfile(held, path)
            continue
        canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        for i, run in enumerate(runs):
            if isinstance(run, tuple):
                draw_layer(canvas, run, t, U)
                continue
            if i in cache:
                canvas.alpha_composite(cache[i])
                continue
            part = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
            for layer in run:
                draw_layer(part, layer, t, U)
            canvas.alpha_composite(part)
            if t >= settled:
                cache[i] = part
        if sheet and f < 2:                                # arrives with a vertical motion blur
            k = (26, 7)[f]
            canvas = canvas.resize((cw, max(1, ch // k)), Image.BOX).resize((cw, ch), Image.BILINEAR)
        if fading:
            canvas = with_alpha(canvas, max(0.0, (dur - t) / out_s))
        canvas.save(path, compress_level=1)
        if t >= settled and not fading:
            held = path
    cx = card.get("x", 0.5) * W
    cy = card.get("y", DEFAULT_Y[card["type"]]) * H
    if card["type"] == "tag" and "x" not in card:        # tags hug the left edge
        cx = 0.047 * W + cw / 2 - margin
    x = min(max(cx - cw / 2, -margin), W - cw + margin)
    y = min(max(cy - ch / 2, -margin), H - ch + margin)
    return str(out_dir / "f_%04d.png"), int(x), int(y)
