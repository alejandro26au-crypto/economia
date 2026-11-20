"""Tiempos de la voz en ESPAÑOL (o inglés) para el kit de dibujos. El timing.py del kit solo entiende inglés.
faster-whisper escucha la voz palabra a palabra y difflib empareja lo oído con el guion (como «oceano voz»).
Uso:  python3 tiempos_es.py voice.mp3 script.txt [es|en]   -> tiempos.json (frases y palabras en s y fotogramas)"""
import difflib
import json
import re
import sys
import unicodedata

from faster_whisper import WhisperModel

voz, guion = sys.argv[1], sys.argv[2]
idioma = sys.argv[3] if len(sys.argv) > 3 else "es"
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
