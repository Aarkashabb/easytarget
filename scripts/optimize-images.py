#!/usr/bin/env python3
"""
Image optimization script for WebP conversion and JPEG compression
Requires: Pillow (PIL)

Install with: pip install Pillow
"""

import os
import sys
from pathlib import Path
from PIL import Image

def convert_png_to_webp(source_dir, quality=80):
    """Convert PNG files to WebP format"""
    source_path = Path(source_dir)
    converted = 0
    total_saved = 0

    print(f"📦 Converting PNG to WebP from {source_dir}...")

    for png_file in sorted(source_path.glob('*.png')):
        try:
            webp_file = png_file.with_suffix('.webp')

            # Open and convert
            img = Image.open(png_file)
            img.save(webp_file, 'WEBP', quality=quality, method=6)

            # Calculate sizes
            png_size = png_file.stat().st_size / 1024
            webp_size = webp_file.stat().st_size / 1024
            saved = ((1 - webp_size / png_size) * 100)
            total_saved += (png_size - webp_size)

            print(f"  ✅ {png_file.name}: {png_size:.1f}KB → {webp_size:.1f}KB (↓{saved:.1f}%)")
            converted += 1

        except Exception as e:
            print(f"  ❌ {png_file.name}: {e}")

    return converted, total_saved

def optimize_jpg(source_dir, quality=85):
    """Optimize JPEG files"""
    source_path = Path(source_dir)
    optimized = 0
    total_saved = 0

    print(f"\n🎨 Optimizing JPEG files from {source_dir}...")

    for jpg_file in sorted(source_path.glob('*.jpg')):
        try:
            original_size = jpg_file.stat().st_size / 1024

            # Open, optimize and save
            img = Image.open(jpg_file)
            img.save(jpg_file, 'JPEG', quality=quality, optimize=True)

            new_size = jpg_file.stat().st_size / 1024
            saved = ((1 - new_size / original_size) * 100) if original_size > 0 else 0
            total_saved += (original_size - new_size)

            print(f"  ✅ {jpg_file.name}: {original_size:.1f}KB → {new_size:.1f}KB (↓{saved:.1f}%)" if saved > 0 else f"  ✅ {jpg_file.name}: {new_size:.1f}KB")
            optimized += 1

        except Exception as e:
            print(f"  ❌ {jpg_file.name}: {e}")

    return optimized, total_saved

def main():
    print("🖼️  Image Optimization Script\n")

    # Define directories
    workflows_dir = 'hugo/static/img/workflows'
    blog_dir = 'hugo/static/images/blog'

    total_converted = 0
    total_optimized = 0
    grand_total_saved = 0

    # Convert PNGs
    if os.path.isdir(workflows_dir):
        converted, saved = convert_png_to_webp(workflows_dir, quality=80)
        total_converted = converted
        grand_total_saved += saved
    else:
        print(f"⚠️  Directory not found: {workflows_dir}")

    # Optimize JPGs
    if os.path.isdir(blog_dir):
        optimized, saved = optimize_jpg(blog_dir, quality=85)
        total_optimized = optimized
        grand_total_saved += saved
    else:
        print(f"⚠️  Directory not found: {blog_dir}")

    # Summary
    print(f"\n✅ Optimization complete!\n")
    print(f"📊 Summary:")
    print(f"  Converted: {total_converted} PNG files")
    print(f"  Optimized: {total_optimized} JPEG files")
    print(f"  Total saved: {grand_total_saved:.1f}KB")

    if total_converted == 0 and total_optimized == 0:
        print("\n⚠️  No files were processed. Check directory paths.")
        sys.exit(1)

if __name__ == '__main__':
    # Check for PIL/Pillow
    try:
        from PIL import Image
    except ImportError:
        print("❌ Pillow not found. Install with: pip install Pillow")
        sys.exit(1)

    main()
