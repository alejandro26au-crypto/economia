"""MÚSICA Y EFECTOS SINTETIZADOS por tramos, a partir del story.js de cada vídeo (sin descargar nada).
Lee los planos (SHOTS) y los momentos (SONIDOS: corte, golpe, remate, moneda, caja, billete, estrellas…) con
cortes.mjs y escribe music.wav y sfx.wav (stems para mix.py: música al 50 % de la voz, con y sin música).
Música: progresión con pad + arpegio a 100 BPM; cada plano cambia de acorde y de carácter según su luz
(«nube» = menor y más baja, «dorada» = cálida y llena, resto = ligera); se apaga 0,4 s antes de cada «remate».
Uso (desde la carpeta del vídeo):  python3 ../../herramientas/sonido.py   (lo llama audio.py)"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np

SR = 48000
HERE = Path(__file__).resolve().parent
d = json.loads(subprocess.run(["node", str(HERE / "cortes.mjs")], capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])
TOTAL = d["TOTAL"]; N = int(TOTAL / 30 * SR) + SR
rng = np.random.default_rng(7)
midi = lambda m: 440 * 2 ** ((m - 69) / 12)


def env(n, a=0.005, r=0.2):
    t = np.arange(n) / SR
    return np.minimum(1, t / max(a, 1e-4)) * np.exp(-t / r)


def lp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)


def hp(x, c):
    X = np.fft.rfft(x); f = np.fft.rfftfreq(len(x), 1 / SR); X *= 1 - 1 / (1 + (f / c) ** 4); return np.fft.irfft(X, len(x)).astype(np.float32)


def place(buf, sig, t0, g=1.0):
    i = int(t0 * SR); j = min(len(buf), i + len(sig))
    if 0 <= i < len(buf) and j > i:
        buf[i:j] += sig[: j - i] * g


def pluck(f, dur=0.4, bright=0.5):
    n = int(dur * SR); t = np.arange(n) / SR
    s = sum((bright ** k) * np.sin(2 * np.pi * f * (k + 1) * t) / (k + 1) for k in range(6))
    return (s * env(n, 0.003, dur * 0.35)).astype(np.float32)


def pad(fs, dur):
    n = int(dur * SR); t = np.arange(n) / SR; s = np.zeros(n)
    for f in fs:
        for det in (-0.6, 0.6):
            s += np.sin(2 * np.pi * (f + det) * t) + 0.3 * np.sin(2 * np.pi * 2 * (f + det) * t)
    a = np.minimum(1, t / 0.25) * np.minimum(1, (dur - t) / 0.3).clip(0)
    return lp((s * a / len(fs)).astype(np.float32), 1500)


# ---------------- música por tramos ----------------
music = np.zeros(N, np.float32)
MAYOR = [(60, [60, 64, 67]), (55, [55, 59, 62]), (57, [57, 60, 64]), (53, [53, 57, 60])]       # C G Am F
MENOR = [(57, [57, 60, 64]), (53, [53, 57, 60]), (52, [52, 55, 59]), (50, [50, 53, 57])]       # Am F Em Dm
beat = 60 / 100
remates = [s["f"] / 30 for s in d["SONIDOS"] if s["tipo"] == "remate"]
for i, sh in enumerate(d["SHOTS"]):
    t0, t1 = sh["a"] / 30, (sh["b"] + 1) / 30
    prog = MENOR if sh["light"] in ("nube", "rojo", "oscuro") else MAYOR
    root, ch = prog[i % len(prog)]
    vol = 0.55 if sh["light"] == "nube" else 1.0 if sh["light"] == "dorada" else 0.8
    place(music, pad([midi(m - 12) for m in ch], t1 - t0 + 0.3), t0, 0.22 * vol)
    place(music, pluck(midi(root - 24), t1 - t0, 0.3), t0, 0.35 * vol)                    # bajo
    k, t = 0, t0
    while t < t1:                                                                           # arpegio
        place(music, pluck(midi(ch[k % 3] + (12 if k % 4 == 3 else 0)), 0.35, 0.55), t, 0.16 * vol)
        k += 1; t += beat / 2
for r in remates:  # silencio corto antes de cada remate: el golpe se oye solo
    i, j = int((r - 0.4) * SR), int(r * SR)
    if 0 < i < j < N:
        music[i:j] *= np.linspace(1, 0.15, j - i)
        music[j:j + int(0.5 * SR)] *= np.linspace(0.15, 1, len(music[j:j + int(0.5 * SR)]))

# ---------------- efectos ----------------
def whoosh(dur=0.35):
    n = int(dur * SR); t = np.arange(n) / SR; x = rng.standard_normal(n).astype(np.float32)
    return (hp(lp(x, 3000), 300) * np.sin(np.pi * t / dur) ** 2).astype(np.float32)
def golpe():
    n = int(0.5 * SR); t = np.arange(n) / SR; f = 55 + 70 * np.exp(-t * 25)
    return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 7) + 0.3 * rng.standard_normal(n) * np.exp(-t * 60)).astype(np.float32)
def ding(f=1320, dur=0.6):
    n = int(dur * SR); t = np.arange(n) / SR
    return ((np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 2.76 * t)) * np.exp(-t * 6)).astype(np.float32)
def moneda():
    a = ding(2600, 0.25); b = np.pad(ding(3300, 0.2), (int(0.04 * SR), 0)); b = np.pad(b, (0, max(0, len(a) - len(b))))[: len(a)]
    return a * 0.7 + b * 0.5
def papel():
    n = int(0.3 * SR); x = rng.standard_normal(n).astype(np.float32); return hp(x, 2500) * env(n, 0.01, 0.08)
def estrellas():
    s = np.zeros(int(0.7 * SR), np.float32)
    for k, f in enumerate([1568, 1976, 2349, 3136]):
        place(s, ding(f, 0.4) * 0.4, k * 0.08)
    return s
SFX = {"corte": (whoosh, 0.5), "golpe": (golpe, 0.8), "remate": (golpe, 1.0), "moneda": (moneda, 0.6), "caja": (lambda: ding(1760, 0.9), 0.7),
       "billete": (papel, 0.6), "estrellas": (estrellas, 0.6)}
sfx = np.zeros(N, np.float32)
for s in d["SONIDOS"]:
    fn, g = SFX.get(s["tipo"], (golpe, 0.5))
    place(sfx, fn(), max(0, s["f"] / 30 - (0.18 if s["tipo"] == "corte" else 0)), g * s.get("g", 1))


def escribe(nombre, x):
    x = x / max(1e-6, np.abs(x).max()) * 0.8
    with wave.open(nombre, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes((x * 32767).astype(np.int16).tobytes())


escribe("music.wav", music); escribe("sfx.wav", sfx)
print(f"✓ music.wav y sfx.wav: {TOTAL / 30:.1f} s, {len(d['SHOTS'])} tramos de música, {len(d['SONIDOS'])} efectos")
