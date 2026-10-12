#!/usr/bin/env python3
"""Turn raw simulator captures (PRE-198) into the web assets under public/app/.

Stills (1206x2622 PNG) become AVIF and WebP at 1x (402 px wide) and 2x
(804 px). Videos are cut to the segments listed in SEGMENTS and written as
H.264 MP4 and VP9 WebM at 804 px wide, each with a WebP poster. The test
account's profile photo is blurred wherever the Home header shows it, and the
Dynamic Island is painted out (the site's DeviceFrame draws its own). Widget
renders are cropped to the widget with transparent corners.

Usage: python3 scripts/process-app-captures.py <raw dir> [out dir]
Needs Pillow with AVIF support and ffmpeg (libx264, libvpx-vp9).
"""

import os
import subprocess
import sys

from PIL import Image, ImageDraw, ImageFilter

RAW = sys.argv[1]
OUT = sys.argv[2] if len(sys.argv) > 2 else "public/app"

# The Home header avatar on a 1206x2622 capture: centre and radius.
AVATAR = (1097, 270, 66)
# Stills whose top bar is the Home header (with the avatar).
AVATAR_STILLS = ("01-home", "01b-home-log", "01c-home-scrolled", "16-supplements-card", "17-achievement",
                 "17b-achievement-confetti", "18b-offline-waiting-list")

# Seconds to keep from each raw video, in order. Long model waits are cut out.
SEGMENTS = {
    "03-log-typed": [(0, 1.2), (1.8, 3.2), (4, 5), (7.8, 9.2), (9.5, 11), (16, 18), (34.6, 38)],
    "04-log-photo": [(0, 1.2), (2, 3), (4, 5), (7, 8.2), (12, 13.5), (18.5, 21), (33.5, 34.5),
                     (35, 36.5), (44.5, 46.5), (50, 52.5), (65, 66), (76, 78.4)],
    "08-chat-ask": [(0.5, 11)],
    "09-chat-log-it": [(0, 7.5)],
    "12-plan-week": [(0, 3.5), (7.5, 21.2)],
    "21-walkthrough": [(0, 2.5), (4.5, 10.5), (12, 13), (18.5, 20.5), (35, 39), (59.5, 62), (63, 65),
                       (66, 71), (72, 74.5), (109, 111), (111.5, 113.5), (115, 123)],
}
# Videos that show the Home header somewhere, so the avatar is blurred throughout.
AVATAR_VIDEOS = ("03-log-typed", "04-log-photo", "21-walkthrough")

WIDTHS = {"1x": 402, "2x": 804}

# Screen recordings (and frames taken from them) include the Dynamic Island,
# which the site's DeviceFrame draws itself. The pill on a 1206x2622 frame,
# padded a little, is painted over with the status bar colour just left of it.
ISLAND = (411, 38, 386, 118)  # x, y, width, height
ISLAND_SAMPLE_X = 405

# Widget renders: a 36 px margin around the widget, whose corner radius is 64 px.
WIDGET_MARGIN = 36
WIDGET_RADIUS = 64


def blur_avatar(im: Image.Image) -> Image.Image:
    x, y, r = AVATAR
    box = (x - r, y - r, x + r, y + r)
    region = im.crop(box).filter(ImageFilter.GaussianBlur(28))
    mask = Image.new("L", region.size, 0)
    ImageDraw.Draw(mask).ellipse((0, 0, 2 * r, 2 * r), fill=255)
    im.paste(region, box[:2], mask)
    return im


def paint_out_island(im: Image.Image) -> Image.Image:
    x, y, w, h = ISLAND
    if sum(im.getpixel((x + w // 2, y + h // 2))) < 20:
        fill = im.crop((ISLAND_SAMPLE_X, y, ISLAND_SAMPLE_X + 1, y + h)).resize((w, h))
        im.paste(fill, (x, y))
    return im


def widget(im: Image.Image) -> Image.Image:
    """Crop a widget render to the widget and make its corners transparent."""
    m = WIDGET_MARGIN
    im = im.convert("RGBA").crop((m, m, im.width - m, im.height - m))
    ss = 4
    mask = Image.new("L", (im.width * ss, im.height * ss), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, im.width * ss - 1, im.height * ss - 1),
                                           radius=WIDGET_RADIUS * ss, fill=255)
    im.putalpha(mask.resize(im.size, Image.LANCZOS))
    return im


def still(name: str) -> None:
    im = Image.open(os.path.join(RAW, name + ".png"))
    if im.size != (1206, 2622):
        # Widget renders: the render itself is the 2x asset, half of it the 1x.
        im = widget(im)
        for scale, factor in (("1x", 2), ("2x", 1)):
            out = im.resize((im.width // factor, im.height // factor), Image.LANCZOS)
            out.save(os.path.join(OUT, f"{name}@{scale}.avif"), quality=60)
            out.save(os.path.join(OUT, f"{name}@{scale}.webp"), quality=82, method=6)
        return
    im = paint_out_island(im.convert("RGB"))
    if name.startswith(AVATAR_STILLS):
        im = blur_avatar(im)
    for scale, width in WIDTHS.items():
        out = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
        out.save(os.path.join(OUT, f"{name}@{scale}.avif"), quality=60)
        out.save(os.path.join(OUT, f"{name}@{scale}.webp"), quality=82, method=6)


def video(name: str) -> None:
    src = os.path.join(RAW, name + ".mp4")
    segs = SEGMENTS.get(name)
    select = "+".join(f"between(t,{a},{b})" for a, b in segs) if segs else None
    # Resample to a constant 30 fps first: simulator recordings drop frames while
    # the screen is still, so a pause would otherwise vanish from the cut.
    filters = ["fps=30"]
    if select:
        filters.append(f"select='{select}',setpts=N/FRAME_RATE/TB")
    if name in AVATAR_VIDEOS:
        x, y, r = AVATAR
        filters.append(
            f"split[a][b];[b]crop={2*r}:{2*r}:{x-r}:{y-r},boxblur=24,format=rgba,"
            f"geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)':a='if(lte(hypot(X-{r},Y-{r}),{r}),255,0)'[c];"
            f"[a][c]overlay={x-r}:{y-r}"
        )
    ix, iy, iw, ih = ISLAND
    filters.append(
        f"split[m][n];[n]crop=2:{ih}:{ISLAND_SAMPLE_X}:{iy},scale={iw}:{ih}:flags=neighbor[p];"
        f"[m][p]overlay={ix}:{iy}"
    )
    filters.append("scale=804:-2")
    vf = ",".join(filters)
    base = os.path.join(OUT, name)
    common = ["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", src, "-vf", vf, "-an"]
    subprocess.run(common + ["-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p",
                             "-movflags", "+faststart", base + ".mp4"], check=True)
    subprocess.run(common + ["-c:v", "libvpx-vp9", "-crf", "40", "-b:v", "0", "-row-mt", "1",
                             base + ".webm"], check=True)
    subprocess.run(["ffmpeg", "-y", "-hide_banner", "-loglevel", "error", "-i", base + ".mp4",
                    "-frames:v", "1", "-c:v", "libwebp", "-quality", "80", base + "-poster.webp"], check=True)


def main() -> None:
    os.makedirs(OUT, exist_ok=True)
    names = sorted(os.listdir(RAW))
    for f in names:
        stem, ext = os.path.splitext(f)
        if ext == ".png":
            still(stem)
        elif ext == ".mp4":
            video(stem)
    for f in sorted(os.listdir(OUT)):
        size = os.path.getsize(os.path.join(OUT, f))
        flag = "  OVER 2 MB" if size > 2 * 1024 * 1024 else ""
        print(f"{size/1024:8.0f} KB  {f}{flag}")


if __name__ == "__main__":
    main()
