#!/usr/bin/env python3
import math
from PIL import Image, ImageDraw

def create_apple_notes_icon(size, is_maskable=False):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    margin = 0 if is_maskable else int(size * 0.06)
    radius = int(size * 0.22) if not is_maskable else int(size * 0.15)
    rect = [margin, margin, size - margin, size - margin]

    # Warm paper background with slight gradient or clean light yellow-ivory
    # Base background: crisp ivory/white
    draw.rounded_rectangle(rect, radius=radius, fill=(255, 255, 255, 255))

    # Top yellow header band (iconic Apple Notes yellow)
    header_height = int(size * 0.28)
    # We clip or draw the top band
    # Let's draw an inner rounded rect for top band
    top_band = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    top_draw = ImageDraw.Draw(top_band)
    top_draw.rounded_rectangle(rect, radius=radius, fill=(245, 179, 1, 255)) # Vibrant Apple Notes Yellow
    
    # Mask out everything below header_height + margin
    cut_rect = [0, margin + header_height, size, size]
    top_draw.rectangle(cut_rect, fill=(0, 0, 0, 0))
    
    # Composite header onto base
    img = Image.alpha_composite(img, top_band)
    draw = ImageDraw.Draw(img)

    # Ruled lines (classic Apple Notes ruled paper lines)
    line_start_y = margin + header_height + int(size * 0.08)
    line_spacing = int(size * 0.12)
    line_x1 = margin + int(size * 0.14)
    line_x2 = size - margin - int(size * 0.14)

    line_color = (226, 232, 240, 255) # subtle divider line
    accent_text_color = (200, 205, 215, 255)

    y = line_start_y
    line_index = 0
    while y < size - margin - int(size * 0.08):
        draw.line([(line_x1, y), (line_x2, y)], fill=line_color, width=max(2, int(size * 0.015)))
        # Simulated handwritten note text on the first two lines
        if line_index == 0:
            # Draw pencil / pen symbol or scribbles
            draw.line([(line_x1, y - int(size * 0.04)), (line_x1 + int(size * 0.45), y - int(size * 0.04))], fill=(100, 116, 139, 255), width=max(3, int(size * 0.025)))
        elif line_index == 1:
            draw.line([(line_x1, y - int(size * 0.04)), (line_x1 + int(size * 0.32), y - int(size * 0.04))], fill=(148, 163, 184, 255), width=max(3, int(size * 0.025)))
        elif line_index == 2:
            draw.line([(line_x1, y - int(size * 0.04)), (line_x1 + int(size * 0.52), y - int(size * 0.04))], fill=(148, 163, 184, 255), width=max(3, int(size * 0.025)))
        y += line_spacing
        line_index += 1

    # Add stylish pencil icon in the bottom right corner
    pencil_size = int(size * 0.28)
    px = size - margin - int(size * 0.12)
    py = size - margin - int(size * 0.12)

    # Pencil body angled at -45 deg
    draw.polygon([
        (px - pencil_size, py - int(pencil_size * 0.25)),
        (px - int(pencil_size * 0.25), py - pencil_size),
        (px, py - int(pencil_size * 0.75)),
        (px - int(pencil_size * 0.75), py)
    ], fill=(234, 138, 0, 255)) # Warm amber pencil

    # Pencil tip
    draw.polygon([
        (px - pencil_size, py - int(pencil_size * 0.25)),
        (px - int(pencil_size * 0.75), py),
        (px - pencil_size - int(pencil_size * 0.2), py + int(pencil_size * 0.1))
    ], fill=(50, 50, 50, 255))

    # Outer border / shadow outline
    draw.rounded_rectangle(rect, radius=radius, outline=(220, 220, 225, 200), width=max(1, int(size * 0.01)))

    return img

def main():
    icons = [
        ("icons/icon-192.png", 192, False),
        ("icons/icon-512.png", 512, False),
        ("icons/icon-maskable.png", 512, True),
        ("icons/apple-touch-icon.png", 180, False),
        ("icons/favicon.png", 64, False),
    ]

    for path, size, maskable in icons:
        img = create_apple_notes_icon(size, maskable)
        img.save(path, "PNG")
        print(f"Generated {path} ({size}x{size})")

if __name__ == "__main__":
    main()
