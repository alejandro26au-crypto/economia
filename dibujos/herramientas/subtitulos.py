"""SUBTÍTULOS QUEMADOS (Inercia del Consumo). El motor del océano no los tenía.

Lee los tiempos de cada palabra (tiempos.json: «palabras» con f0/f1 en fotogramas a 30 fps) y escribe los subtítulos
encima de cada fotograma: grupos de 2-3 palabras (o palabra a palabra), letra gruesa blanca con borde oscuro, cifras y
palabras clave en AMARILLO, en el centro-bajo del cuadro. La palabra que suena da un pequeño «pop».

Uso (desde la carpeta del vídeo):
    python3 ../../herramientas/subtitulos.py frames frames_sub      # todos los fotogramas
    python3 ../../herramientas/subtitulos.py stills/a stills/a_sub   # fotos sueltas (f0123.jpg)

Ajustes opcionales en subtitulos.json (en la carpeta del vídeo):
    {"activos": true,                 # false = sin subtítulos (se copian los fotogramas tal cual)
     "modo": "grupos",                # "grupos" (2-3 palabras) o "palabra" (palabra a palabra)
     "max_palabras": 3, "max_letras": 16,
     "y": 0.70,                       # altura del centro del subtítulo (0 arriba, 1 abajo): centro-bajo
     "posiciones": [[f0, f1, 0.80]],  # mover el subtítulo en un tramo para no tapar una cara
     "apagar": [[f0, f1]],            # tramos sin subtítulo (p. ej. una pizarra con texto)
     "clave": ["truco", "cerebro"],   # palabras clave en amarillo (las cifras ya lo están)
     "tam": 92, "mayusculas": true}
"""
import json
import re
import shutil
import sys
import unicodedata
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

HERE = Path(__file__).resolve().parent
FUENTE = HERE / "fuentes" / "Inter-Black.otf"
BLANCO, AMARILLO, BORDE = (255, 255, 255), (255, 214, 10), (20, 14, 24)
NUMS = set("""cero uno una dos tres cuatro cinco seis siete ocho nueve diez once doce trece catorce quince veinte treinta
cuarenta cincuenta sesenta setenta ochenta noventa cien ciento doscientos trescientos quinientos mil millón millones
billón billones mitad doble triple""".split())
DINERO = set("€ $ euro euros dólar dólares peso pesos céntimo céntimos centavo centavos gratis".split())


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def es_clave(w, claves):
    base = re.sub(r"[^\wñáéíóúü%€$]", "", w.lower())
    return bool(re.search(r"\d|%|€|\$", w)) or base in NUMS or base in DINERO or sin_tildes(base) in claves


def grupos(pal, modo, maxp, maxl):
    """Corta las palabras en grupos de 2-3 (o de 1) respetando la puntuación."""
    out, g = [], []
    for w in pal:
        if not w["p"].strip():
            continue
        larg = sum(len(x["p"]) + 1 for x in g) + len(w["p"])
        if g and (modo == "palabra" or len(g) >= maxp or larg > maxl):
            out.append(g); g = []
        g.append(w)
        if re.search(r"[.!?…:;,]$", w["p"]):
            out.append(g); g = []
    if g:
        out.append(g)
    return out


def plan(tiempos, cfg):
    """Para cada fotograma: (grupo, índice de la palabra que suena) o None."""
    pal = [w for w in tiempos["palabras"] if w.get("f1", 0) > 0 or w.get("f0", 0) > 0]
    gs = grupos(pal, cfg.get("modo", "grupos"), cfg.get("max_palabras", 3), cfg.get("max_letras", 16))
    tramos = []
    for i, g in enumerate(gs):
        a = g[0]["f0"]
        b = gs[i + 1][0]["f0"] - 1 if i + 1 < len(gs) else g[-1]["f1"] + 12
        b = min(b, g[-1]["f1"] + 18)  # en las pausas largas, el subtítulo se va
        tramos.append((a, b, g))
    return tramos


def dibuja(im, g, f, cfg, claves, a):
    W, H = im.size
    tam = int(cfg.get("tam", 92) * W / 1080)
    t = f - a
    pop = 0.86 + 0.22 * min(1, t / 3) if t < 3 else (1.08 - 0.08 * min(1, (t - 3) / 3))  # entra con rebote
    may = cfg.get("mayusculas", True)
    font = ImageFont.truetype(str(FUENTE), int(tam * pop))
    palabras = [re.sub(r"[.,;:…]+$", "", (w["p"].upper() if may else w["p"]).strip("«»\"")) for w in g]
    habla = max([i for i, w in enumerate(g) if f >= w["f0"]] or [0])
    # medir: si no cabe en el 88 % del ancho, partir en dos líneas
    d0 = ImageDraw.Draw(im)
    esp = d0.textlength(" ", font=font)
    anchos = [d0.textlength(p, font=font) for p in palabras]
    lineas = [list(range(len(palabras)))]
    if sum(anchos) + esp * (len(anchos) - 1) > W * 0.88 and len(palabras) > 1:
        m = (len(palabras) + 1) // 2
        lineas = [list(range(m)), list(range(m, len(palabras)))]
    y_rel = cfg.get("y", 0.70)
    for p0, p1, yy in cfg.get("posiciones", []):
        if p0 <= f <= p1:
            y_rel = yy
    capa = Image.new("RGBA", im.size, (0, 0, 0, 0))
    sombra = Image.new("RGBA", im.size, (0, 0, 0, 0))
    d, ds = ImageDraw.Draw(capa), ImageDraw.Draw(sombra)
    alto = tam * 1.12
    y0 = H * y_rel - alto * len(lineas) / 2
    borde = max(6, int(tam * 0.13))
    for li, idx in enumerate(lineas):
        total = sum(anchos[i] for i in idx) + esp * (len(idx) - 1)
        x = (W - total) / 2
        y = y0 + li * alto
        for i in idx:
            col = AMARILLO if es_clave(g[i]["p"], claves) else BLANCO
            fi = font
            dy = 0
            if i == habla and len(g) > 1 and f - g[i]["f0"] < 4:  # la palabra que suena da un saltito
                dy = -tam * 0.06 * (1 - (f - g[i]["f0"]) / 4)
            ds.text((x + tam * 0.05, y + dy + tam * 0.08), palabras[i], font=fi, fill=(0, 0, 0, 150), stroke_width=borde, stroke_fill=(0, 0, 0, 150))
            d.text((x, y + dy), palabras[i], font=fi, fill=col, stroke_width=borde, stroke_fill=BORDE)
            x += anchos[i] + esp
    sombra = sombra.filter(ImageFilter.GaussianBlur(tam * 0.08))
    base = im.convert("RGBA")
    base.alpha_composite(sombra)
    base.alpha_composite(capa)
    return base.convert("RGB")


def main():
    src, dst = Path(sys.argv[1]), Path(sys.argv[2])
    cfg = json.loads(Path("subtitulos.json").read_text(encoding="utf-8")) if Path("subtitulos.json").exists() else {}
    dst.mkdir(parents=True, exist_ok=True)
    fot = sorted(src.glob("f*.jpg"))
    if not cfg.get("activos", True):
        for p in fot:
            shutil.copy(p, dst / p.name)
        print(f"subtítulos DESACTIVADOS: {len(fot)} fotogramas copiados a {dst}")
        return
    tiempos = json.loads(Path("tiempos.json").read_text(encoding="utf-8"))
    claves = {sin_tildes(c) for c in cfg.get("clave", [])}
    tr = plan(tiempos, cfg)
    apagar = cfg.get("apagar", [])
    n = 0
    for p in fot:
        f = int(p.stem[1:])
        g = next(((a, b, gg) for a, b, gg in tr if a <= f <= b), None)
        if g is None or any(x <= f <= y for x, y in apagar):
            shutil.copy(p, dst / p.name)
            continue
        im = dibuja(Image.open(p).convert("RGB"), g[2], f, cfg, claves, g[0])
        im.save(dst / p.name, quality=95)
        n += 1
    print(f"✓ subtítulos: {n}/{len(fot)} fotogramas con texto → {dst}")


if __name__ == "__main__":
    main()
