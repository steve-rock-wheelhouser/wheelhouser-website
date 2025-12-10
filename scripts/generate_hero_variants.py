#!/usr/bin/env python3
"""
Generate responsive hero image variants (PNG and WebP) from
`assets/images/hero-background-image.png`.

Creates:
 - assets/images/hero-1200.png
 - assets/images/hero-800.png
 - assets/images/hero-480.png
 - and corresponding .webp files

Usage:
  python3 scripts/generate_hero_variants.py

Requires Pillow: `pip install --user Pillow`
"""
import os
from PIL import Image

ROOT = os.path.join(os.path.dirname(__file__), '..')
SRC = os.path.join(ROOT, 'assets', 'images', 'hero-background-image.png')
OUT_DIR = os.path.join(ROOT, 'assets', 'images')

VARIANTS = [
    (1200, 'hero-1200'),
    (800, 'hero-800'),
    (480, 'hero-480'),
]

if not os.path.exists(SRC):
    print(f"Source hero image not found: {SRC}")
    raise SystemExit(1)

os.makedirs(OUT_DIR, exist_ok=True)

print(f"Opening source: {SRC}")
with Image.open(SRC) as im:
    orig_w, orig_h = im.size
    for width, name in VARIANTS:
        # preserve aspect ratio
        ratio = width / orig_w
        height = max(1, int(orig_h * ratio))
        resized = im.resize((width, height), Image.LANCZOS)
        out_png = os.path.join(OUT_DIR, f"{name}.png")
        out_webp = os.path.join(OUT_DIR, f"{name}.webp")
        print(f"Saving {out_png} ({width}x{height})")
        resized.save(out_png, format='PNG', optimize=True)
        print(f"Saving {out_webp} ({width}x{height})")
        resized.save(out_webp, format='WEBP', quality=80, method=6)

print("Done. Generated hero variants in assets/images/")
