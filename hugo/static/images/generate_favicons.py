#!/usr/bin/env python3
"""Generate the PNG favicons referenced by hugo/layouts/partials/head.html.

Draws the brand star from hugo/static/favicon.svg (blue -> purple gradient) with plain
Python (no Pillow needed): 4x4 supersampled polygon fill written as PNG via zlib.

  python3 hugo/static/images/generate_favicons.py

Writes next to this script: favicon-32x32.png, favicon-32x32-light.png (transparent),
apple-touch-icon.png (180x180, opaque brand-ink background: iOS fills transparency with black).
"""
import os
import struct
import zlib

# Star path from favicon.svg (viewBox 0 0 24 24)
STAR = [(12, 2), (14.5, 9.5), (22, 12), (14.5, 14.5), (12, 22), (9.5, 14.5), (2, 12), (9.5, 9.5)]
C1, C2 = (0x3B, 0x82, 0xF6), (0xA8, 0x55, 0xF7)  # gradient start/end, top-left -> bottom-right
INK = (0x0D, 0x1C, 0x32)  # --c-ink in styles.css
SS = 4


def inside(px, py, poly):
    hit = False
    j = len(poly) - 1
    for i in range(len(poly)):
        xi, yi = poly[i]
        xj, yj = poly[j]
        if (yi > py) != (yj > py) and px < (xj - xi) * (py - yi) / (yj - yi) + xi:
            hit = not hit
        j = i
    return hit


def render(size, scale, bg):
    """Star scaled to `scale` of the canvas, centred; bg is an (r,g,b) tuple or None (transparent)."""
    k = size * scale / 24.0
    off = size * (1 - scale) / 2
    poly = [(x * k + off, y * k + off) for x, y in STAR]
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            cov = sum(inside(x + (sx + .5) / SS, y + (sy + .5) / SS, poly) for sy in range(SS) for sx in range(SS)) / (SS * SS)
            t = min(1.0, max(0.0, ((x + .5) + (y + .5)) / (2.0 * size)))  # diagonal gradient across the canvas
            fg = [C1[i] + (C2[i] - C1[i]) * t for i in range(3)]
            if bg is None:
                row += bytes([round(c) for c in fg] + [round(255 * cov)])
            else:
                row += bytes([round(fg[i] * cov + bg[i] * (1 - cov)) for i in range(3)])
        rows.append(bytes([0]) + bytes(row))
    return size, rows, bg is None


def write_png(path, size, rows, alpha):
    def chunk(tag, data):
        c = struct.pack(">I", len(data)) + tag + data
        return c + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6 if alpha else 2, 0, 0, 0)
    with open(path, "wb") as f:
        f.write(b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(b"".join(rows), 9)) + chunk(b"IEND", b""))
    print("wrote", os.path.relpath(path), os.path.getsize(path), "bytes")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    small = render(32, 1.0, None)
    write_png(os.path.join(here, "favicon-32x32.png"), *small)
    write_png(os.path.join(here, "favicon-32x32-light.png"), *small)
    write_png(os.path.join(here, "apple-touch-icon.png"), *render(180, 0.68, INK))
