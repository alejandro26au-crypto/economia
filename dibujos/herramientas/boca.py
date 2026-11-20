"""Boca que sigue la voz: mide el volumen de voice.mp3 en cada fotograma (30 fps) y escribe web/boca.js con
BOCA = [0..1 por fotograma] (0 = callado). Los personajes abren la boca según esto (gestos.js).
Uso (desde la carpeta del vídeo):  python3 ../../herramientas/boca.py voice.mp3"""
import json
import subprocess
import sys

import numpy as np

SR = 16000
raw = subprocess.run(["ffmpeg", "-v", "error", "-i", sys.argv[1], "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
x = np.frombuffer(raw, np.float32)
n = SR // 30
v = x[: len(x) // n * n].reshape(-1, n)
r = np.sqrt((v ** 2).mean(axis=1))
r = r / max(np.percentile(r, 95), 1e-6)
r = np.clip(r, 0, 1)
r[r < 0.12] = 0  # silencio = boca cerrada
s = np.convolve(r, [0.25, 0.5, 0.25], "same")  # suaviza un poco (sin perder sílabas)
open("web/boca.js", "w").write("export const BOCA = " + json.dumps([round(float(a), 2) for a in s]) + ";\n")
print(f"✓ web/boca.js: {len(s)} fotogramas, hablando el {100 * (s > 0.12).mean():.0f} %")
