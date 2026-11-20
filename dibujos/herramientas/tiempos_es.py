"""Tiempos de la voz en ESPAÑOL (o inglés) para el kit de dibujos. El timing.py del kit solo entiende inglés.
faster-whisper escucha la voz palabra a palabra y difflib empareja lo oído con el guion (como «oceano voz»).
Uso:  python3 tiempos_es.py voice.mp3 script.txt [es|en] [--max 60]  -> tiempos.json + web/tiempos.js
AVISA (y sale con código 1) si la voz no coincide con el guion (palabras que faltan o sobran) o si dura más de --max s."""
import difflib
import json
import re
import sys
import unicodedata

from faster_whisper import WhisperModel

voz, guion = sys.argv[1], sys.argv[2]
args = [a for a in sys.argv[3:]]
DMAX = float(args[args.index("--max") + 1]) if "--max" in args else None
idioma = args[0] if args and not args[0].startswith("--") else "es"
txt = open(guion, encoding="utf-8").read().strip()
frases = re.split(r"(?<=[.!?])\s+", txt)
norm = lambda w: re.sub(r"[^a-z0-9ñ]", "", "".join(c for c in unicodedata.normalize("NFD", w.lower()) if unicodedata.category(c) != "Mn"))
m = WhisperModel("small", device="cpu", compute_type="int8")
segs, _ = m.transcribe(voz, language=idioma, word_timestamps=True, initial_prompt=txt)
oidas = [(w.word.strip(), w.start, w.end) for s in segs for w in s.words if w.word.strip()]
a, de = [], []
for i, f in enumerate(frases):
    for w in f.split():
        a.append(norm(w))
        de.append(i)
b = [norm(w) for w, _, _ in oidas]
t = [None] * len(a)
for bl in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
    for k in range(bl.size):
        t[bl.a + k] = oidas[bl.b + k][1:]
res = []
for i, f in enumerate(frases):
    ts = [t[j] for j in range(len(a)) if de[j] == i and t[j]]
    if not ts:
        print("⚠ frase sin reconocer:", f)
        continue
    res.append([round(ts[0][0] * 30), round(ts[-1][1] * 30), f])
    print(f"{ts[0][0]:6.2f}-{ts[-1][1]:6.2f}  f{round(ts[0][0] * 30)}-{round(ts[-1][1] * 30)}  {f}  ({len(ts)}/{len(f.split())})")
pal = [{"p": w, "f0": round((t[j] or (0, 0))[0] * 30), "f1": round((t[j] or (0, 0))[1] * 30)} for j, w in enumerate(txt.split())]
json.dump({"frases": res, "palabras": pal}, open("tiempos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("✓ tiempos.json (usa 'frases' para FRASES de story.js y 'palabras' para los momentos clave)")

# ---------- AVISOS (Inercia): ¿la voz dice el guion EXACTO? ¿se pasa de duración? ----------
import os
import subprocess
dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", voz], capture_output=True, text=True).stdout or 0)
sm = difflib.SequenceMatcher(None, a, b, autojunk=False)
coinc = sum(bl.size for bl in sm.get_matching_blocks()) / max(1, len(a))
malo = False
print(f"\nVoz: {dur:.1f} s · {len(b)} palabras oídas · coincide el {coinc:.0%} del guion")
for op, i1, i2, j1, j2 in sm.get_opcodes():
    if op != "equal" and (i2 - i1 > 1 or j2 - j1 > 1 or op == "delete"):
        print(f"  ⚠ guion «{' '.join(txt.split()[i1:i2])}»  ≠  voz «{' '.join(w for w, _, _ in oidas[j1:j2])}»")
if coinc < 0.92:
    malo = True
    print("  ✗ La voz NO coincide con el guion: ¿se pegó el texto exacto en ElevenLabs? Repite la toma o corrige script.txt.")
if DMAX and dur > DMAX:
    malo = True
    print(f"  ✗ La voz dura {dur:.1f} s: se pasa de {DMAX:.0f} s. Sube la velocidad en ElevenLabs o recorta el guion.")
os.makedirs("web", exist_ok=True)
open("web/tiempos.js", "w", encoding="utf-8").write("export const PAL = " + json.dumps([[w["p"], w["f0"], w["f1"]] for w in pal], ensure_ascii=False) + ";\nexport const TOTAL_VOZ = " + str(round(dur * 30) + 15) + ";\n")
sys.exit(1 if malo else 0)
