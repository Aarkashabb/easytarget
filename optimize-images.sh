#!/bin/bash

# Image optimization script for WebP conversion
# Install: npm install -g imagemin imagemin-webp imagemin-mozjpeg

echo "🖼️  Optimizing images to WebP format..."

# Convert PNGs to WebP (workflows)
for file in hugo/static/img/workflows/*.png; do
  if [ -f "$file" ]; then
    output="${file%.png}.webp"
    echo "Converting $file → $output"
    cwebp -q 80 "$file" -o "$output"
  fi
done

# Compress JPGs (blog images)
for file in hugo/static/images/blog/*.jpg; do
  if [ -f "$file" ]; then
    echo "Optimizing $file"
    mozjpeg -quality 75 -outfile "$file" "$file" 2>/dev/null || echo "mozjpeg not available, skipping $file"
  fi
done

echo "✅ Image optimization complete!"
echo ""
echo "📊 Size comparison:"
echo "Before optimization:"
du -sh hugo/static/img/workflows/*.png | tail -1
du -sh hugo/static/img/workflows/ | tail -1

echo ""
echo "After WebP conversion:"
du -sh hugo/static/img/workflows/*.webp | tail -1
du -sh hugo/static/img/workflows/ | tail -1
