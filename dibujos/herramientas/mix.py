"""mix.py (escrito para el ensayo: el zip del kit no lo traía). Regla de la skill:
- la música a exactamente el 50 % del nivel de la voz (−6 dB, RMS medido solo donde hay voz: «gated RMS»);
- los efectos al 50 % o menos, con los picos por debajo de 0,7 × el pico de la voz;
- la voz NO se toca; sin compresión ni «ducking»: una sola ganancia lineal + limitador sobre la mezcla final.
Uso: python3 mix.py voice.mp3 music.wav sfx.wav [salida.wav]  -> out/mix.wav (y lo imprime medido).
     Sin música (para ponerla en CapCut):  python3 mix.py voice.mp3 - sfx.wav out/mix_sin_musica.wav"""
import subprocess
import sys
import wave

import numpy as np

SR = 48000


def lee(ruta):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", ruta, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).copy()


def rms_gated(x, umbral_db=-40.0, ref=None):
    """RMS en ventanas de 50 ms, contando solo las que superan umbral_db respecto al pico de ref (o de x)."""
    n = int(0.05 * SR)
    v = x[: len(x) // n * n].reshape(-1, n)
    r = np.sqrt((v ** 2).mean(axis=1) + 1e-12)
    base = (ref if ref is not None else r).max()
    sel = r > base * 10 ** (umbral_db / 20)
    return float(np.sqrt((r[sel] ** 2).mean())) if sel.any() else 0.0


def db(x):
    return 20 * np.log10(max(x, 1e-9))


voz = lee(sys.argv[1])
musica = lee(sys.argv[2]) if sys.argv[2] != "-" else np.zeros(1, np.float32)
sfx = lee(sys.argv[3])
SALIDA = sys.argv[4] if len(sys.argv) > 4 else "out/mix.wav"
N = max(len(voz), len(musica), len(sfx))
voz, musica, sfx = (np.pad(x, (0, N - len(x))) for x in (voz, musica, sfx))
rv = rms_gated(voz)
gm = (rv * 0.5) / rms_gated(musica) if rms_gated(musica) > 0 else 0.0
gs = (rv * 0.5) / max(rms_gated(sfx), 1e-9)
gs = min(gs, 0.7 * np.abs(voz).max() / max(np.abs(sfx).max(), 1e-9))  # ningún golpe asoma sobre la narración
m, e = musica * gm, sfx * gs
print(f"voz {db(rv):.1f} dB | música {(db(rms_gated(m)) - db(rv)) if gm else float('nan'):+.1f} dB respecto a la voz | efectos {db(rms_gated(e)) - db(rv):+.1f} dB, pico {np.abs(e).max() / np.abs(voz).max():.2f}× el de la voz")
mezcla = voz + m + e
pcm = (np.clip(mezcla / max(1.0, np.abs(mezcla).max()), -1, 1) * 32767).astype(np.int16)
with wave.open(SALIDA, "wb") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("ok", SALIDA, N / SR, "s")
