from PIL import Image
import numpy as np
from collections import Counter

# Load the image
image_path = '/home/ubuntu/upload/IMG_6035.jpeg'
img = Image.open(image_path)

# Convert image to RGB if it's not already
img = img.convert('RGB')

# Get image data as numpy array
img_array = np.array(img)

# Reshape the array to a list of pixels
pixels = img_array.reshape(-1, 3)

# Filter out white/very light colors (cloud) and very dark colors
blue_pixels = []
for pixel in pixels:
    r, g, b = pixel
    # Skip white/very light colors (cloud part)
    if r > 200 and g > 200 and b > 200:
        continue
    # Skip very dark colors (background)
    if r < 20 and g < 20 and b < 20:
        continue
    # We're interested in blue colors
    if b > max(r, g) and b > 100:
        blue_pixels.append((int(r), int(g), int(b)))

# Separate into light and dark blues
light_blues = []
dark_blues = []

for r, g, b in blue_pixels:
    brightness = (r + g + b) / 3
    if brightness > 150:  # Adjust threshold as needed
        light_blues.append((r, g, b))
    else:
        dark_blues.append((r, g, b))

# Get average light and dark blue
if light_blues:
    avg_light_blue = tuple(map(int, np.mean(light_blues, axis=0)))
    light_blue_hex = f'#{avg_light_blue[0]:02x}{avg_light_blue[1]:02x}{avg_light_blue[2]:02x}'
    print(f"Average Light Blue: RGB {avg_light_blue}, Hex: {light_blue_hex}")

if dark_blues:
    avg_dark_blue = tuple(map(int, np.mean(dark_blues, axis=0)))
    dark_blue_hex = f'#{avg_dark_blue[0]:02x}{avg_dark_blue[1]:02x}{avg_dark_blue[2]:02x}'
    print(f"Average Dark Blue: RGB {avg_dark_blue}, Hex: {dark_blue_hex}")

# Get the most common blue colors
color_counter = Counter(blue_pixels)
most_common_blues = color_counter.most_common(5)

print("\nMost common blue colors in the logo:")
for color, count in most_common_blues:
    r, g, b = color
    hex_color = f'#{r:02x}{g:02x}{b:02x}'
    print(f"RGB: {color}, Hex: {hex_color}, Count: {count}")

# Suggest button colors based on the logo
print("\nSuggested Button Colors:")
if light_blues:
    print(f"Primary Button (Light Blue): {light_blue_hex}")
if dark_blues:
    print(f"Secondary Button (Dark Blue): {dark_blue_hex}")
    
# Get the most vibrant blue for primary action buttons
vibrant_blues = []
for r, g, b in blue_pixels:
    saturation = (max(r, g, b) - min(r, g, b)) / max(r, g, b) if max(r, g, b) > 0 else 0
    if saturation > 0.5 and b > 150:  # High saturation and reasonably bright blue
        vibrant_blues.append((r, g, b))

if vibrant_blues:
    avg_vibrant_blue = tuple(map(int, np.mean(vibrant_blues, axis=0)))
    vibrant_blue_hex = f'#{avg_vibrant_blue[0]:02x}{avg_vibrant_blue[1]:02x}{avg_vibrant_blue[2]:02x}'
    print(f"Action Button (Vibrant Blue): {vibrant_blue_hex}")

print("Text on Buttons: #FFFFFF (White)")

