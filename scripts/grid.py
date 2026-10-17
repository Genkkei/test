# Склейка длинного скриншота в колонки для просмотра: python3 scripts/grid.py in.png out.png [колонок]
import sys
from PIL import Image
im = Image.open(sys.argv[1]); w, h = im.size
cols = int(sys.argv[3]) if len(sys.argv) > 3 else (4 if w < 600 else 2)
ch = h // cols + 1
o = Image.new('RGB', (w * cols + 24 * (cols - 1), ch), 'white')
for i in range(cols):
    o.paste(im.crop((0, i * ch, w, min(h, (i + 1) * ch))), (i * (w + 24), 0))
s = min(1, 1900 / o.height, 1900 / o.width)
o.resize((int(o.width * s), int(o.height * s))).save(sys.argv[2])
