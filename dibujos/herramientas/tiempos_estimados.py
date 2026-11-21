"""Tiempos ESTIMADOS del guion (antes de que llegue la voz): para preparar planos, fotos de prueba y subtítulos.
Reparte las palabras a ~2,7 palabras/s (voz efusiva de ElevenLabs en español), con pausas tras la puntuación.
Cuando llega la voz, tiempos_es.py los sustituye por los reales.
Uso (desde la carpeta del vídeo):  python3 ../../herramientas/tiempos_estimados.py script.txt [palabras_por_seg]"""
import json
import re
import sys

txt = open(sys.argv[1], encoding="utf-8").read().strip()
pps = float(sys.argv[2]) if len(sys.argv) > 2 else 2.7
FPS = 30
f, pal, frases, ini, i0 = 6, [], [], 6, 0
for w in txt.split():
    dur = FPS / pps * (0.7 + 0.06 * len(re.sub(r"\W", "", w)))
    pal.append({"p": w, "f0": round(f), "f1": round(f + dur * 0.92)})
    f += dur
    if re.search(r"[.!?…]$", w):
        frases.append([round(ini), round(f), " ".join(x["p"] for x in pal[i0:])])
        f += 9; ini = f; i0 = len(pal)
    elif re.search(r"[,:;]$", w):
        f += 4
json.dump({"frases": frases, "palabras": pal, "estimado": True}, open("tiempos.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
open("web/tiempos.js", "w", encoding="utf-8").write("// ESTIMADOS (sin voz todavía)\nexport const PAL = " + json.dumps([[w["p"], w["f0"], w["f1"]] for w in pal], ensure_ascii=False) + ";\nexport const TOTAL_VOZ = " + str(round(f + 20)) + ";\n")
print(f"✓ tiempos ESTIMADOS: {len(pal)} palabras, ~{f / FPS:.1f} s ({round(f + 20)} fotogramas). Se sustituyen al llegar la voz.")
