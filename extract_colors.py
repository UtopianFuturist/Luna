from PIL import Image
import numpy as np
from collections import Counter

# Load the image
image_path = '/home/ubuntu/upload/IMG_6035.jpeg'
img = Image.open(image_path)

# Convert image to RGB if it's not already
img = img.convert('RGB')

# Resize for faster processing
img = img.resize((100, 100))

# Get image data as numpy array
img_array = np.array(img)

# Reshape the array to a list of pixels
pixels = img_array.reshape(-1, 3)

# Filter out white/very light colors (cloud) and very dark colors
filtered_pixels = []
for pixel in pixels:
    r, g, b = pixel
    # Skip white/very light colors (cloud part)
    if r > 200 and g > 200 and b > 200:
        continue
    # Skip very dark colors (background)
    if r < 20 and g < 20 and b < 20:
        continue
    # We're interested in blue colors
    if b > max(r, g):
        filtered_pixels.append((r, g, b))

# Count occurrences of each color
color_counter = Counter(map(tuple, filtered_pixels))

# Get the most common colors
most_common_colors = color_counter.most_common(5)

print("Most common blue colors in the logo:")
for color, count in most_common_colors:
    r, g, b = color
    hex_color = f'#{r:02x}{g:02x}{b:02x}'
    print(f"RGB: {color}, Hex: {hex_color}, Count: {count}")

# Extract light and dark blue for button styling
light_blues = []
dark_blues = []

for pixel in filtered_pixels:
    r, g, b = pixel
    brightness = (r + g + b) / 3
    if brightness > 100:  # Adjust threshold as needed
        light_blues.append((r, g, b))
    else:
        dark_blues.append((r, g, b))

# Get average light and dark blue
if light_blues:
    avg_light_blue = tuple(map(int, np.mean(light_blues, axis=0)))
    light_blue_hex = f'#{avg_light_blue[0]:02x}{avg_light_blue[1]:02x}{avg_light_blue[2]:02x}'
    print(f"\nAverage Light Blue: RGB {avg_light_blue}, Hex: {light_blue_hex}")

if dark_blues:
    avg_dark_blue = tuple(map(int, np.mean(dark_blues, axis=0)))
    dark_blue_hex = f'#{avg_dark_blue[0]:02x}{avg_dark_blue[1]:02x}{avg_dark_blue[2]:02x}'
    print(f"Average Dark Blue: RGB {avg_dark_blue}, Hex: {dark_blue_hex}")

# Suggest button colors based on the logo
print("\nSuggested Button Colors:")
if light_blues:
    print(f"Primary Button: {light_blue_hex}")
if dark_blues:
    print(f"Secondary Button: {dark_blue_hex}")
print("Text on Buttons: #FFFFFF (White)")

