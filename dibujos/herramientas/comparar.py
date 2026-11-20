"""Hoja de fotos AL LADO de una de los romanos (la referencia de calidad), para revisar y para el «aprobado».
Uso (desde la carpeta del vídeo):  python3 ../../herramientas/comparar.py stills/a_sub stills/hoja.jpg [n_romano 0-13]"""
import glob
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

HERE = Path(__file__).resolve().parent
src, out = sys.argv[1], sys.argv[2]
k = int(sys.argv[3]) if len(sys.argv) > 3 else 11
ref = Image.open(HERE.parent / "kit" / "example" / "soldier" / "stills.jpg")  # 7 x 2 fotos de 270 x 480
rom = ref.crop(((k % 7) * 270, (k // 7) * 480, (k % 7) * 270 + 270, (k // 7) * 480 + 480)).resize((405, 720), Image.LANCZOS)
fs = sorted(glob.glob(src + "/f*.jpg"))
ims = [Image.open(f).resize((405, 720), Image.LANCZOS) for f in fs]
font = ImageFont.truetype(str(HERE / "fuentes" / "Inter-ExtraBold.otf"), 26)
W = 405 * (len(ims) + 1) + 30
hoja = Image.new("RGB", (W, 780), (24, 20, 28))
d = ImageDraw.Draw(hoja)
hoja.paste(rom, (0, 50)); d.text((12, 12), "REFERENCIA: romanos", font=font, fill=(255, 214, 10))
for i, (im, f) in enumerate(zip(ims, fs)):
    x = 405 * (i + 1) + 30
    hoja.paste(im, (x, 50)); d.text((x + 12, 12), f"{Path(f).stem}  ({int(Path(f).stem[1:]) / 30:.1f} s)", font=font, fill=(255, 255, 255))
hoja.save(out, quality=90)
print("✓", out, len(ims), "fotos + romanos")
