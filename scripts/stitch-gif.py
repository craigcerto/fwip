"""Stitch screenshot frames into an animated GIF."""
from pathlib import Path
from PIL import Image

FRAME_DIR = Path("/tmp/refrase-frames")
OUTPUT = Path("/Users/craigcerto/fwip/assets/demo.gif")
TARGET_WIDTH = 700

frames = sorted(FRAME_DIR.glob("frame-*.png"))
print(f"Found {len(frames)} frames")

if not frames:
    print("No frames found. Run record-demo-screenshots.ts first.")
    exit(1)

images = []
for f in frames:
    img = Image.open(f)
    # Resize to target width
    ratio = TARGET_WIDTH / img.width
    target_height = int(img.height * ratio)
    img = img.resize((TARGET_WIDTH, target_height), Image.LANCZOS)
    # Convert to RGB (GIF doesn't support RGBA well)
    img = img.convert("RGB")
    images.append(img)

print(f"Stitching {len(images)} frames at {TARGET_WIDTH}x{images[0].height}")

# Save as GIF - 100ms per frame = 10fps
images[0].save(
    OUTPUT,
    save_all=True,
    append_images=images[1:],
    duration=100,
    loop=0,
    optimize=True,
)

size_mb = OUTPUT.stat().st_size / 1024 / 1024
print(f"GIF saved: {OUTPUT} ({size_mb:.1f} MB)")

if size_mb > 5:
    print("Warning: GIF is large. Consider reducing frames or quality.")
    # Try with fewer frames
    every_other = images[::2]
    OUTPUT_SMALL = OUTPUT.with_name("demo-small.gif")
    every_other[0].save(
        OUTPUT_SMALL,
        save_all=True,
        append_images=every_other[1:],
        duration=200,
        loop=0,
        optimize=True,
    )
    small_mb = OUTPUT_SMALL.stat().st_size / 1024 / 1024
    print(f"Smaller version: {OUTPUT_SMALL} ({small_mb:.1f} MB)")
