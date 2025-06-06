from PIL import Image

# Load the image
image_path = '/home/ubuntu/upload/IMG_6035.jpeg'
img = Image.open(image_path)

# Save the logo to the public directory
output_path = '/home/ubuntu/omnisky/public/logo.png'
img.save(output_path, 'PNG')

print(f"Logo saved to {output_path}")

