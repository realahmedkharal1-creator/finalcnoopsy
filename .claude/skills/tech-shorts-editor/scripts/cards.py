"""Motion-graphic cards for tech-shorts-editor, drawn with Pillow.

Each card in plan.json becomes a small folder of transparent PNG frames that
edit.py overlays on the video. A card is a list of layers; each layer has its
own entrance animation (pop / wipe / slide / fade) and start time.

Card types: pill, spec, words, price, text, display, sheet, subscribe, badge.
See SKILL.md section "Card catalogue" for the fields of each.
"""
import colorsys, math, shutil
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
    noise = Image.effect_noise(img.size, 22).filter(ImageFilter.GaussianBlur(0.8)).convert("RGB")
    return Image.blend(img, ImageChops.soft_light(img, noise), strength)


def wavy_band(W, y0, y1, amp, phase):
    """Polygon for a horizontal band whose top and bottom edges wave gently (torn-paper look)."""
    def off(x, p):
        return amp * (0.6 * math.sin(x / (W * 0.16) + p) + 0.4 * math.sin(x / (W * 0.057) + p * 2.3))
    xs = list(range(0, W + 8, 8))
    return [(x, y0 + off(x, phase)) for x in xs] + [(x, y1 + off(x, phase + 1.7)) for x in reversed(xs)]


def row_icon(kind, d, ink="#3C3C3C"):
    """Small pictogram in a white circle. Drawn 4x and scaled down for smooth edges."""
    s = d * 4
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    g = ImageDraw.Draw(img)
    g.ellipse((0, 0, s - 1, s - 1), fill=(255, 255, 255, 255))
    c, u, k = s / 2, s / 46, rgb(ink) + (255,)
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


def hanging(badge, x, length, W, u, lean):
    """A badge hanging on a thin string from the top edge. Returns (image, left x)."""
    if isinstance(badge, str) and Path(badge).suffix.lower() in (".png", ".jpg", ".jpeg", ".webp") and Path(badge).exists():
        b = load_product(badge)
        k = 150 * u / max(b.size)
        b = b.resize((int(b.width * k), int(b.height * k)), Image.LANCZOS)
    else:
        b = seal(str(badge), int(130 * u))
    w = b.width + int(abs(lean)) + 20
    img = Image.new("RGBA", (w, int(length) + b.height), (0, 0, 0, 0))
    bx = 10 if lean > 0 else w - b.width - 10
    top_x = bx + b.width / 2 + lean
    ImageDraw.Draw(img).line((top_x, 0, bx + b.width / 2, length + b.height * 0.12), fill=(255, 255, 255, 215),
                             width=max(2, int(3 * u)))
    sh = Image.new("RGBA", img.size, (0, 0, 0, 0))
    sh.paste((0, 0, 0, 70), (bx + int(6 * u), int(length) + int(10 * u)), b.getchannel("A"))
    img = Image.alpha_composite(img, sh.filter(ImageFilter.GaussianBlur(8 * u)))
    img.alpha_composite(b, (bx, int(length)))
    return img, int(x - bx - b.width / 2)


def card_sheet(c, W, H, U):
    """Full-screen spec sheet: textured tinted top with the product, torn white panel with icon rows, price pill."""
    u = min(W / 1080, H / 1920) * c.get("scale", 1.0)
    cw = int(1080 * u)
    ox = (W - cw) // 2
    tint = c.get("tint", "#DDE5C9")
    dark = c.get("dark") or accent(tint, 0.50, 0.42)
    rows = [str(r) for r in c.get("rows", [])]
    size = 37 * u
    max_w = cw * 0.70
    lines = []                                             # per row: list of text images
    for row in rows:
        parts = row.split("\n")
        if len(parts) == 1 and font("medium", size).getlength(row) > max_w:
            if font("medium", size * 0.88).getlength(row) > max_w:
                for sep in (" | ", "  |  ", " + "):
                    if sep in row:
                        a, _, b = row.rpartition(sep)
                        parts = [a, b]
                        break
        lines.append([rich(p.strip(), fit_size(p.strip(), size, "medium", max_w), "#4A4A4A", bold="medium")
                      for p in parts])
    pitch, extra = 60 * u, 40 * u
    panel_top = int(H * 0.461)
    rows_h = sum(pitch + extra * (len(l) - 1) for l in lines)
    panel_bot = int(panel_top + 58 * u + rows_h + 26 * u)

    bg = Image.new("RGB", (W, H), rgb(tint))
    g = ImageDraw.Draw(bg)
    g.rectangle((0, panel_bot - 30 * u, W, H), fill=rgb(dark))
    bg = paper(bg)
    g = ImageDraw.Draw(bg)
    g.polygon(wavy_band(W, panel_top - 7 * u, panel_top + 20 * u, 7 * u, 0.4), fill=rgb(dark))   # dark rim
    bg = bg.convert("RGBA")
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).polygon(wavy_band(W, panel_top + 6 * u, panel_bot + 8 * u, 8 * u, 0.9), fill=(0, 0, 0, 90))
    bg = Image.alpha_composite(bg, shadow.filter(ImageFilter.GaussianBlur(10 * u)))
    white = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(white).polygon(wavy_band(W, panel_top, panel_bot, 8 * u, 0.9), fill=(242, 242, 242, 255))
    grid = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, int(54 * u)):
        gd.line((x, panel_top, x, panel_bot), fill=(0, 0, 0, 7), width=1)
    for y in range(panel_top, panel_bot, int(54 * u)):
        gd.line((0, y, W, y), fill=(0, 0, 0, 7), width=1)
    grid.putalpha(ImageChops.multiply(grid.getchannel("A"), white.getchannel("A")))
    bg = Image.alpha_composite(Image.alpha_composite(bg, white), grid)
    layers = [(bg, 0, 0, 0.0, "fade")]

    badges = c.get("badges") or []
    spots = [(ox + cw * 0.15, 290 * u, 60 * u), (ox + cw * 0.88, 470 * u, -110 * u)]
    for n, b in enumerate(badges[:2]):
        img, bx = hanging(b, spots[n][0], spots[n][1], W, u, spots[n][2])
        layers.append((img, bx, 0, 0.15 + 0.15 * n, "slide"))

    src = c.get("image")
    if src and Path(src).exists():
        im = load_product(src)
        k = min(cw * 0.70 / im.width, (panel_top - 170 * u) / im.height)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
        pad = int(60 * u)
        holder = Image.new("RGBA", (im.width + 2 * pad, im.height + 2 * pad), (0, 0, 0, 0))
        sh = Image.new("RGBA", holder.size, (0, 0, 0, 0))
        sh.paste((0, 0, 0, 105), (pad + int(8 * u), pad + int(18 * u)), im.getchannel("A"))
        holder = Image.alpha_composite(holder, sh.filter(ImageFilter.GaussianBlur(16 * u)))
        holder.alpha_composite(im, (pad, pad))
        layers.append((holder, ox + (cw - holder.width) // 2, int(panel_top - 80 * u - im.height - pad), 0.1, "slide"))

    title = c.get("title", "")
    t = rich(title, fit_size(title, 35 * u, "semibold", cw * 0.6), "#FFFFFF", bold="semibold")
    chip_col = c.get("chip") or shade(dark, 1.12)
    chip = Image.new("RGBA", (int(t.width + 96 * u), int(74 * u)), (0, 0, 0, 0))
    ImageDraw.Draw(chip).rounded_rectangle((0, 0, chip.width - 1, chip.height - 1), radius=chip.height // 2,
                                           fill=rgb(chip_col) + (255,))
    chip.alpha_composite(t, ((chip.width - t.width) // 2, (chip.height - t.height) // 2))
    layers.append((chip, ox + (cw - chip.width) // 2, int(panel_top + 3 * u - chip.height / 2), 0.25, "pop"))

    icons = c.get("icons") or []
    d = int(46 * u)
    y = panel_top + 58 * u
    block_w = max((max(i.width for i in l) for l in lines), default=0) + 80 * u
    left = ox + max(cw * 0.115, (cw - block_w) / 2)
    for n, l in enumerate(lines):
        kind = icons[n] if n < len(icons) else guess_icon(rows[n])
        t0 = 0.35 + 0.08 * n
        layers.append((row_icon(kind, d), int(left), int(y + (pitch - d) / 2 - 2 * u), t0, "pop"))
        for m, img in enumerate(l):
            layers.append((img, int(left + 80 * u), int(y + m * extra + (pitch - img.height) / 2), t0, "wipe"))
        y += pitch + extra * (len(l) - 1)

    if c.get("price"):
        label, sep, value = c["price"].partition(" - ")
        text = f"{label} - *{value}*" if sep else f"*{label}*"
        ps = fit_size(c["price"], 78 * u, "bold", cw * 0.68)
        t = rich(text, ps, "#3F3F3F", bold="bold", light="bold", light_alpha=255,
                 bold_color=c.get("price_color") or shade(dark, 0.82))
        pp = panel(max(t.width + 90 * u, cw * 0.74), 100 * u, 22 * u, "#FFFFFF", "#FFFFFF", alpha=255, bw=0, shadow=95)
        pp.alpha_composite(t, ((pp.width - t.width) // 2, (pp.height - t.height) // 2))
        py = panel_bot + (H - panel_bot) * 0.36
        layers.append((pp, ox + (cw - pp.width) // 2, int(py - pp.height / 2), 0.55 + 0.08 * len(rows), "wipe"))
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
ANIM_S = {"pop": 0.24, "wipe": 0.45, "slide": 0.32, "fade": 0.2, "none": 0.0}


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
    out_s = min(0.15, dur / 4)
    out_dir = Path(out_dir)
    if out_dir.exists():
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True)
    held = None
    for f in range(n):
        t = f / fps
        path = out_dir / f"f_{f:04d}.png"
        fading = t > dur - out_s
        if t >= settled and not fading and held:
            shutil.copyfile(held, path)
            continue
        canvas = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
        for layer in layers:
            draw_layer(canvas, layer, t, U)
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
