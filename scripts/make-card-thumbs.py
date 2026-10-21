#!/usr/bin/env python3
"""Card thumbnails for /guides and the related-features row (PRE-289).

Each thumbnail is the telling part of one app still (the rings, the chart,
the Log it card) at close to the size it is on the phone, instead of the top
of the whole screen. Crops come from public/app/<name>-light@2x.webp (804 px
wide), or from a frame of the clip's public/app/<name>.mp4, and are written to
public/app/thumbs/<name>@1x and @2x as AVIF and WebP, 804 x 500 at 2x. Keep
THUMBS in step with CARD_THUMBS in src/lib/captures.ts.

Every crop starts and ends on a gap between elements, so no line of text or
card is cut (PRE-317). A crop shorter than 500 px is filled below with the
colour of its last row (the screen or card background); a taller one is
scaled down to 500 px high and centred on that colour.

Usage: python3 scripts/make-card-thumbs.py
Needs Pillow and, for FRAMES, ffmpeg.
"""

import os
import subprocess
import tempfile

from PIL import Image

SRC = "public/app"
OUT = "public/app/thumbs"
WIDTH, HEIGHT = 804, 500

# Thumbnail name -> (top, bottom) of the crop, in 2x pixels.
THUMBS = {
    "01-home": (96, 596),  # the Home header and the Energy, Satiety and Mood rings
    "04-log-photo": (490, 1150),  # the photo of the plate, on the Describe your meal sheet
    "01b-home-log": (768, 1256),  # the Log's 7 AM breakfast and 8 AM coffee
    "02-chat-chart": (1050, 1550),  # the Protein per day bars against the target line, with their days
    "05-meal-detail": (860, 1360),  # Meal items: what PrepIt assumed, under the meal's bold title
    "05b-meal-detail-scrolled": (262, 846),  # the meal's Energy and Satiety cards
    "06-signal-energy": (220, 712),  # the Energy ring and what it measures
    "11-check-in-report": (350, 845),  # the report's summary and goal, under its heading
    "12-plan-week": (410, 975),  # a plan's grocery list, its week of days and the daily target
    "13-grocery-list": (312, 812),  # the estimate and the first aisle, under the Grocery List heading
    "22-action-button-siri": (120, 620),  # "What did you eat?"
    "23b-home-screen-widgets": (80, 580),  # the Today's calories widget
}

# Thumbnails cut from a frame of a clip in public/app (804 px wide): name -> second.
FRAMES = {
    "04-log-photo": 9.5,
    "12-plan-week": 9.0,
}


def source(name: str) -> Image.Image:
    if name not in FRAMES:
        return Image.open(os.path.join(SRC, f"{name}-light@2x.webp")).convert("RGB")
    with tempfile.TemporaryDirectory() as tmp:
        png = os.path.join(tmp, "frame.png")
        subprocess.run(
            ["ffmpeg", "-v", "error", "-y", "-ss", str(FRAMES[name]), "-i", os.path.join(SRC, f"{name}.mp4"),
             "-frames:v", "1", png],
            check=True,
        )
        return Image.open(png).convert("RGB")


def thumb(im: Image.Image, top: int, bottom: int) -> Image.Image:
    part = im.crop((0, top, WIDTH, bottom))
    fill = part.getpixel((4, part.height - 1))
    out = Image.new("RGB", (WIDTH, HEIGHT), fill)
    if part.height > HEIGHT:
        width = round(WIDTH * HEIGHT / part.height)
        part = part.resize((width, HEIGHT), Image.LANCZOS)
        out.paste(part, ((WIDTH - width) // 2, 0))
    else:
        out.paste(part, (0, 0))
    return out


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    for name, (top, bottom) in THUMBS.items():
        im = source(name)
        assert im.width == WIDTH, name
        im = thumb(im, top, bottom)
        for scale, factor in (("1x", 2), ("2x", 1)):
            out = im.resize((WIDTH // factor, HEIGHT // factor), Image.LANCZOS)
            out.save(os.path.join(OUT, f"{name}@{scale}.avif"), quality=60)
            out.save(os.path.join(OUT, f"{name}@{scale}.webp"), quality=82, method=6)
        print(name)


if __name__ == "__main__":
    main()
