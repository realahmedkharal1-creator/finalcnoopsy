"""Motion-graphic cards for tech-shorts-editor, drawn with Pillow.

Each card in plan.json becomes a small folder of transparent PNG frames that
edit.py overlays on the video. A card is a list of layers; each layer has its
own entrance animation (pop / wipe / slide / fade) and start time.

Card types: pill, spec, words, price, text, display, sheet, subscribe, badge.
See SKILL.md section "Card catalogue" for the fields of each.
"""
import colorsys, shutil
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

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


def card_sheet(c, W, H, U):
    """Full-screen spec sheet: product image, name chip, bullet rows, price pill."""
    tint = c.get("tint", "#DDE5C9")
    cw = int(min(W, H * 9 / 16))
    ox = (W - cw) // 2
    bg = Image.new("RGBA", (W, H), rgb(tint) + (255,))
    d = ImageDraw.Draw(bg)
    d.rectangle((0, int(H * 0.455), W, int(H * 0.725)), fill=rgb(shade(tint, 1.08)) + (255,))
    d.rectangle((0, int(H * 0.725), W, H), fill=rgb(accent(tint)) + (255,))
    layers = [(bg, 0, 0, 0.0, "fade")]
    src = c.get("image")
    if src and Path(src).exists():
        im = Image.open(src).convert("RGBA")
        k = min(cw * 0.62 / im.width, H * 0.36 / im.height)
        im = im.resize((int(im.width * k), int(im.height * k)), Image.LANCZOS)
        layers.append((im, ox + (cw - im.width) // 2, int(H * 0.235 - im.height / 2), 0.1, "slide"))
    t = rich(c.get("title", ""), 34 * U, "#FFFFFF", bold="semibold")
    chip = panel(t.width + 56 * U, t.height + 14 * U, 999, accent(tint, 0.6), accent(tint, 0.55), alpha=255, bw=0,
                 shadow=0, margin=4)
    chip.alpha_composite(t, ((chip.width - t.width) // 2, (chip.height - t.height) // 2))
    layers.append((chip, ox + (cw - chip.width) // 2, int(H * 0.455 - chip.height / 2), 0.25, "pop"))
    rows = c.get("rows", [])
    rs = min(36 * U, H * 0.235 / max(1, len(rows)) / 1.45)
    y = H * 0.485
    for n, row in enumerate(rows):
        t = rich(row, fit_size(row, rs, "medium", cw * 0.74), "#2B2F26", bold="medium")
        dot = Image.new("RGBA", (t.height, t.height), (0, 0, 0, 0))
        r = int(rs * 0.2)
        ImageDraw.Draw(dot).ellipse((t.height // 2 - r, t.height // 2 - r, t.height // 2 + r, t.height // 2 + r),
                                    fill=rgb(accent(tint, 0.5)) + (255,))
        layers.append((dot, ox + int(cw * 0.13), int(y), 0.35 + 0.08 * n, "fade"))
        layers.append((t, ox + int(cw * 0.2), int(y), 0.35 + 0.08 * n, "wipe"))
        y += rs * 1.45
    if c.get("price"):
        label, _, value = c["price"].partition(" - ")
        text = f"{label} - *{value}*" if value else f"*{label}*"
        t = rich(text, fit_size(c["price"], 58 * U, "bold", cw * 0.7), "#3A3A3A", bold="bold", light="semibold",
                 light_alpha=255, bold_color=c.get("price_color", accent(tint, 0.42, 0.45)))
        pp = panel(t.width + 60 * U, t.height + 16 * U, 18 * U, "#FFFFFF", "#F3F3F3", alpha=255, bw=0, shadow=70)
        pp.alpha_composite(t, ((pp.width - t.width) // 2, (pp.height - t.height) // 2))
        layers.append((pp, ox + (cw - pp.width) // 2, int(H * 0.82 - pp.height / 2),
                       0.55 + 0.08 * len(rows), "wipe"))
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
