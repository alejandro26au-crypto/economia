#!/usr/bin/env python3
"""Clips para Shorts y TikTok a partir del vídeo largo: el vídeo en horizontal en el centro de un 1080×1920 con
franjas negras; arriba el GANCHO (amarillo, borde negro) y abajo «PARTE N» + «Historia completa en el canal».
    python3 programa/clips.py 1        (lee «Textos/1 - ….clips.json» y el vídeo de «Vídeos listos»)"""
import json, subprocess, sys
from pathlib import Path
import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parents[1]
FF = imageio_ffmpeg.get_ffmpeg_exe()
FUENTE = str(RAIZ / "public" / "fuentes" / "InterDisplay-Black.otf")


def esc(t):
    return t.replace("\\", "\\\\").replace(":", "\\:").replace("'", "’").replace("%", "\\%")


def main(n):
    lista = json.loads(next((RAIZ / "Textos").glob(f"{n} - *.clips.json")).read_text(encoding="utf-8"))
    video = sorted((RAIZ / "Vídeos listos").glob(f"{n} - *).mp4"))[-1]
    salida = RAIZ / "Vídeos listos" / f"{n} - clips"
    salida.mkdir(exist_ok=True)
    for c in lista:
        l1, _, l2 = c["gancho"].partition("|")
        dur = c["hasta"] - c["desde"]
        capa = Image.new("RGBA", (1080, 1920), (0, 0, 0, 0))
        d = ImageDraw.Draw(capa)

        def pon(t, y, tam, col, borde):
            f = ImageFont.truetype(FUENTE, tam)
            while d.textlength(t, font=f) > 1000:
                tam -= 4
                f = ImageFont.truetype(FUENTE, tam)
            d.text((540, y), t, font=f, fill=col, anchor="mm", stroke_width=borde, stroke_fill="black")

        pon(l1, 470, 84, "#ffd23f", 8)
        pon(l2, 575, 62, "white", 6)
        pon(f"PARTE {c['parte']}", 1430, 96, "#ffd23f", 8)
        pon("Historia completa en el canal", 1540, 48, "white", 5)
        png = salida / f".capa-{c['parte']}.png"
        capa.save(png)
        filtro = (f"[0:v]scale=1080:-2,pad=1080:1920:0:(1920-ih)/2:black[v];[v][1:v]overlay=0:0,"
                  f"fade=t=in:st=0:d=0.25,fade=t=out:st={dur - 0.3:.2f}:d=0.3[o]")
        out = salida / f"Parte {c['parte']}.mp4"
        subprocess.run([FF, "-v", "error", "-y", "-ss", str(c["desde"]), "-i", str(video), "-i", str(png), "-t", f"{dur:.2f}", "-filter_complex", filtro, "-map", "[o]", "-map", "0:a",
                        "-af", f"afade=t=in:st=0:d=0.15,afade=t=out:st={dur - 0.3:.2f}:d=0.3", "-c:v", "libx264", "-crf", "20",
                        "-preset", "veryfast", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", str(out)], check=True)
        png.unlink()
        print(f"✓ {out.name}  ({dur:.0f} s)")


if __name__ == "__main__":
    main(int(sys.argv[1]))
