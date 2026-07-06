#!/bin/bash

echo "Creating placeholder icons..."

mkdir -p /tmp/icon_assets

convert -size 1024x1024 xc:#667eea -fill white -draw "circle 512,512 512,100" /tmp/icon_assets/icon.png 2>/dev/null || \
echo "Note: ImageMagick not installed, using base64 fallback"

if [ ! -f "/tmp/icon_assets/icon.png" ]; then
  echo "iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAADlJREFUeNrs0DERACAMBMAHLxK7/4E5l0wAAQAA//+m/wBmAAAAAElFTkSuQmCC" | base64 -d > /tmp/icon_assets/icon.png
fi

cp /tmp/icon_assets/icon.png "$1/icon.png"

if command -v sips &> /dev/null; then
  sips -s format icns /tmp/icon_assets/icon.png --out "$1/icon.icns" 2>/dev/null || echo "Warning: Failed to create icns"
fi

if command -v convert &> /dev/null; then
  convert /tmp/icon_assets/icon.png -resize 256x256 "$1/icon.ico" 2>/dev/null || echo "Warning: Failed to create ico"
fi

echo "Icons created in: $1"
