#!/usr/bin/env python3
"""Assets for the link preview cards (PRE-312).

The preview renderer (Satori, behind next/og) draws only PNG and JPEG and
cannot read variable fonts, so this writes:

- src/assets/og/hero-cafe.jpg: the homepage hero photo (the cafe table and the
  phone with the protein chart), cropped to the 1200 x 630 card at 2x.
- src/assets/og/thumbs/<name>.jpg: each card thumbnail from public/app/thumbs
  (make-card-thumbs.py), as JPEG, for the feature and guide cards.
- src/app/fonts/ClashDisplay-Medium.ttf: a static weight-500 instance of the
  site's Clash Display, the calmer headline weight the light site uses.

Needs Pillow and fontTools (with brotli for the WOFF2 source).

Usage: python3 scripts/make-og-assets.py
"""

import os

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from PIL import Image

OUT = "src/assets/og"
CARD_W, CARD_H = 2400, 1260


def hero() -> None:
    im = Image.open("public/lifestyle/hero-cafe@2x.webp").convert("RGB")
    # 2048 x 1152 is wider than tall by less than the card, so scale to the
    # card's width and keep the middle band: the phone and the table survive.
    scale = CARD_W / im.width
    im = im.resize((CARD_W, round(im.height * scale)), Image.LANCZOS)
    top = (im.height - CARD_H) // 2
    im.crop((0, top, CARD_W, top + CARD_H)).save(f"{OUT}/hero-cafe.jpg", quality=82, optimize=True, progressive=True)


def thumbs() -> None:
    os.makedirs(f"{OUT}/thumbs", exist_ok=True)
    for file in sorted(os.listdir("public/app/thumbs")):
        if not file.endswith("@2x.webp"):
            continue
        name = file.removesuffix("@2x.webp")
        im = Image.open(f"public/app/thumbs/{file}").convert("RGB")
        im.save(f"{OUT}/thumbs/{name}.jpg", quality=85, optimize=True, progressive=True)


def font() -> None:
    var = TTFont("src/app/fonts/ClashDisplay-Variable.woff2")
    static = instantiateVariableFont(var, {"wght": 500})
    static.flavor = None
    static.save("src/app/fonts/ClashDisplay-Medium.ttf")


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    hero()
    thumbs()
    font()


if __name__ == "__main__":
    main()
