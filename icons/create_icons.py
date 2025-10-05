#!/usr/bin/env python3
"""
Simple script to create placeholder icons for the extension.
Run this to generate the required icon files.
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size, filename):
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Draw a red circle background
    margin = size // 8
    draw.ellipse([margin, margin, size-margin, size-margin], fill=(255, 0, 0, 255))
    
    # Draw a play triangle
    triangle_size = size // 3
    center_x, center_y = size // 2, size // 2
    
    # Calculate triangle points
    points = [
        (center_x - triangle_size//2, center_y - triangle_size//2),
        (center_x - triangle_size//2, center_y + triangle_size//2),
        (center_x + triangle_size//2, center_y)
    ]
    
    draw.polygon(points, fill=(255, 255, 255, 255))
    
    # Save the image
    img.save(filename, 'PNG')
    print(f"Created {filename} ({size}x{size})")

def main():
    # Create icons directory if it doesn't exist
    os.makedirs('icons', exist_ok=True)
    
    # Create icons in different sizes
    sizes = [16, 32, 48, 128]
    
    for size in sizes:
        filename = f'icons/icon{size}.png'
        create_icon(size, filename)
    
    print("All icons created successfully!")

if __name__ == '__main__':
    try:
        main()
    except ImportError:
        print("PIL (Pillow) not found. Creating simple placeholder files...")
        # Create empty placeholder files
        sizes = [16, 32, 48, 128]
        for size in sizes:
            filename = f'icons/icon{size}.png'
            with open(filename, 'w') as f:
                f.write(f"# Placeholder icon {size}x{size}\n")
            print(f"Created placeholder {filename}")