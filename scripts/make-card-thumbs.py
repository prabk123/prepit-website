#!/usr/bin/env python3
"""Card thumbnails for /guides and the related-features row (PRE-289).

Each thumbnail is the telling part of one app still (the rings, the chart,
the Log it card) at close to the size it is on the phone, instead of the top
of the whole screen. Crops come from public/app/<name>-light@2x.webp (804 px
wide) and are written to public/app/thumbs/<name>@1x and @2x as AVIF and WebP,
804 x 500 at 2x. Keep THUMBS in step with CARD_THUMBS in src/lib/captures.ts.

Usage: python3 scripts/make-card-thumbs.py
"""

import os

from PIL import Image

SRC = "public/app"
OUT = "public/app/thumbs"
WIDTH, HEIGHT = 804, 500

# Still name -> top of the 804 x 500 crop, in 2x pixels.
THUMBS = {
    "01-home": 220,  # Energy, Satiety and Mood rings, and the top of Eaten
    "01b-home-log": 690,  # the Log, with breakfast and coffee
    "02-chat-chart": 1040,  # the Protein per day bars against the target line
    "05-meal-detail": 250,  # a meal's calories, macros, servings and time
    "05b-meal-detail-scrolled": 260,  # the meal's Energy and Satiety cards
    "06-signal-energy": 200,  # the Energy ring and what it measures
    "11-check-in-report": 280,  # "Your steadiest week yet" and the goal card
    "13-grocery-list": 240,  # Grocery List, the estimate and the first aisle
    "22-action-button-siri": 120,  # "What did you eat?"
    "23-home-screen-widgets": 150,  # the Meal plan widget
    "23b-home-screen-widgets": 150,  # the Today's calories widget
}


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name, top in THUMBS.items():
        im = Image.open(os.path.join(SRC, f"{name}-light@2x.webp")).convert("RGB")
        assert im.width == WIDTH, name
        im = im.crop((0, top, WIDTH, top + HEIGHT))
        for scale, factor in (("1x", 2), ("2x", 1)):
            out = im.resize((WIDTH // factor, HEIGHT // factor), Image.LANCZOS)
            out.save(os.path.join(OUT, f"{name}@{scale}.avif"), quality=60)
            out.save(os.path.join(OUT, f"{name}@{scale}.webp"), quality=82, method=6)
        print(name)


if __name__ == "__main__":
    main()
