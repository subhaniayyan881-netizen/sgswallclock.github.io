from PIL import Image
import os
from pathlib import Path

# Directory with clock images
assets_dir = Path(__file__).parent / 'assets'

# Clock images to process
clock_images = ['clock-black-gold.jpeg', 'clock-lcd.jpeg', 'clock-white.jpeg']

def crop_to_circle(image_path, output_path):
    """Crop image to circle and remove white background"""
    
    # Open image and convert to RGBA
    img = Image.open(image_path).convert('RGBA')
    
    # Get dimensions
    width, height = img.size
    size = min(width, height)
    
    # Calculate crop box (center square)
    left = (width - size) // 2
    top = (height - size) // 2
    right = left + size
    bottom = top + size
    
    # Crop to square
    img = img.crop((left, top, right, bottom))
    
    # Create circular mask
    mask = Image.new('L', (size, size), 0)
    from PIL import ImageDraw
    draw = ImageDraw.Draw(mask)
    draw.ellipse([0, 0, size, size], fill=255)
    
    # Apply mask
    img.putalpha(mask)
    
    # Remove white background by making it transparent
    data = img.getdata()
    new_data = []
    for item in data:
        # If pixel is white or near-white, make it transparent
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    
    img.putdata(new_data)
    
    # Convert back to RGB with white background for compatibility
    # Create a white background
    background = Image.new('RGB', (size, size), (255, 255, 255))
    background.paste(img, (0, 0), img)
    
    # Save as PNG (supports transparency better) and JPEG
    png_path = str(output_path).replace('.jpeg', '.png').replace('.jpg', '.png')
    background.save(png_path, 'PNG')
    print(f"✓ Processed: {output_path.name} → {Path(png_path).name}")

# Process each clock image
for clock_name in clock_images:
    input_path = assets_dir / clock_name
    if input_path.exists():
        crop_to_circle(input_path, input_path)
    else:
        print(f"✗ Not found: {clock_name}")

print("\nDone! Clock images have been cropped to circles.")
