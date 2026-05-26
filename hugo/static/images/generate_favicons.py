#!/usr/bin/env python3
"""
Generate favicon PNG files from SVG
Run this script to create favicon-32x32.png, favicon-16x16.png, and apple-touch-icon.png
"""

try:
    from PIL import Image, ImageDraw
    import os

    def create_favicon(size, filename):
        """Create a favicon PNG with cyan plus sign"""
        img = Image.new('RGBA', (size, size), '#00BCD4')
        draw = ImageDraw.Draw(img)

        # Draw plus sign (white)
        bar_width = max(4, size // 8)
        center = size // 2
        half_length = (size - bar_width) // 2

        # Horizontal bar
        draw.rectangle(
            [(center - half_length, center - bar_width // 2),
             (center + half_length, center + bar_width // 2)],
            fill='white'
        )

        # Vertical bar
        draw.rectangle(
            [(center - bar_width // 2, center - half_length),
             (center + bar_width // 2, center + half_length)],
            fill='white'
        )

        img.save(filename, 'PNG')
        print(f"✓ Created {filename}")

    # Create favicon files
    sizes = {
        32: 'favicon-32x32.png',
        16: 'favicon-16x16.png',
        180: 'apple-touch-icon.png'
    }

    script_dir = os.path.dirname(os.path.abspath(__file__))

    for size, filename in sizes.items():
        filepath = os.path.join(script_dir, filename)
        create_favicon(size, filepath)

    print("\n✓ All favicon files created successfully!")

except ImportError:
    print("Pillow library not found. Install with: pip install pillow")
    print("\nAlternatively, use an online converter to generate PNG files from favicon.svg")
    print("Tools: https://convertio.co/svg-png/")
except Exception as e:
    print(f"Error: {e}")
