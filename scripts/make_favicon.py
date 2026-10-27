#!/usr/bin/env python3
"""Generate img/favicon.png from the high-res academy logo (img/eca-logo.jpg).
White background -> transparent (smoothstep alpha keying), square crop, 128x128."""
import numpy as np
from PIL import Image

SRC = "img/eca-logo.jpg"
OUT = "img/favicon.png"
SIZE = 128

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(np.float32)

# whiteness = luminance 0..1 ; alpha: 255 below lo, 0 above hi, smooth in between
lum = (0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]) / 255.0
LO, HI = 0.80, 0.965
t = np.clip((lum - LO) / (HI - LO), 0.0, 1.0)
alpha = ((1.0 - t) ** 2 * (3.0 - 2.0 * t) * 255.0).astype(np.uint8)  # smoothstep

# drop the "EGYPT CHESS ACADEMY" text: it's the LAST contiguous content block,
# much shorter than the crown+ECA block above it -> cut at its start
rows = (alpha > 8).sum(axis=1)
h_img = alpha.shape[0]
blocks = []  # [start, end] of content row-runs
in_run, s = False, 0
for y in range(h_img):
    if rows[y] > 0 and not in_run: in_run, s = True, y
    elif rows[y] == 0 and in_run: in_run = False; blocks.append((s, y))
if in_run: blocks.append((s, h_img))
if len(blocks) >= 2:
    largest = max(e - s for s, e in blocks)
    while len(blocks) >= 2:  # keep dropping small bottom blocks (the text lines)
        s_, e_ = blocks[-1]
        if (e_ - s_) < largest * 0.35:
            alpha[s_:, :] = 0
            blocks.pop()
            print("cut text block at y =", s_, "height", e_ - s_)
        else:
            break

# bbox of visible content
ys, xs = np.where(alpha > 8)
y0, y1, x0, x1 = ys.min(), ys.max(), xs.min(), xs.max()
print("content bbox:", x0, y0, x1, y1, "size:", x1 - x0, y1 - y0)

# square crop with 7% padding around content
h, w = alpha.shape
side = max(y1 - y0, x1 - x0)
pad = int(side * 0.07)
side += pad * 2
cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
l = max(0, cx - side // 2); r = min(w, l + side)
t0 = max(0, cy - side // 2); b = min(h, t0 + side)
# re-adjust to keep square
if r - l < side: l = r - side
if b - t0 < side: t0 = b - side
l = max(0, l); t0 = max(0, t0)

rgb = a[t0:b, l:r].astype(np.uint8)
al = alpha[t0:b, l:r]
mark = Image.fromarray(np.dstack([rgb, al])).resize((SIZE, SIZE), Image.LANCZOS)

# white rounded badge so the logo reads on light AND dark tab strips
badge = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
draw = Image.new("L", (SIZE, SIZE), 0)
from PIL import ImageDraw
d = ImageDraw.Draw(draw)
d.rounded_rectangle([1, 1, SIZE - 2, SIZE - 2], radius=int(SIZE * 0.22), fill=255)
white = Image.new("RGBA", (SIZE, SIZE), (255, 255, 255, 255))
badge.paste(white, (0, 0), draw)
badge.alpha_composite(mark)
badge.save(OUT)
print("saved", OUT, badge.size)
