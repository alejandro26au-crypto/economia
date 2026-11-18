#!/usr/bin/env python3
"""Recorta dibujos del personaje (fondo blanco) y los deja con fondo transparente en public/personaje/.

El personaje se usa TAL CUAL está dibujado (tus imágenes): así es idéntico a la referencia.
- El fondo blanco que toca los bordes se vuelve transparente; lo blanco ENCERRADO por tinta (cara, manos) se queda.
- Se guarda el personaje (la mancha más grande) en NOMBRE.png y lo demás (¡!, ¿?, gotas, rayas) en NOMBRE-signos.png.
- Se agranda x2 para que se vea nítido en planos cerca.

Uso:  python3 programa/recortar.py imagen.png nombre [x0 y0 x1 y1]
"""
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

RAIZ = Path(__file__).resolve().parents[1]
SALIDA = RAIZ / "public" / "personaje"


def componentes(mask):
    """Etiqueta las manchas conectadas (8 vecinos) de una máscara booleana."""
    h, w = mask.shape
    etiqueta = np.zeros((h, w), np.int32)
    n = 0
    tam = []
    for y0, x0 in zip(*np.nonzero(mask)):
        if etiqueta[y0, x0]:
            continue
        n += 1
        cola = deque([(y0, x0)])
        etiqueta[y0, x0] = n
        c = 0
        while cola:
            y, x = cola.popleft()
            c += 1
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    yy, xx = y + dy, x + dx
                    if 0 <= yy < h and 0 <= xx < w and mask[yy, xx] and not etiqueta[yy, xx]:
                        etiqueta[yy, xx] = n
                        cola.append((yy, xx))
        tam.append(c)
    return etiqueta, tam


def recortar(img, nombre, caja=None, escala=2):
    im = Image.open(img).convert("RGB")
    if caja:
        im = im.crop(caja)
    im = im.resize((im.width * escala, im.height * escala), Image.LANCZOS)
    g = np.array(im.convert("L")).astype(np.float32)
    # tinta engordada un poco para cerrar huecos del trazo antes de buscar el fondo
    tinta = Image.fromarray(((g < 150) * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(5))
    tinta = np.array(tinta) > 0
    claro = ~tinta
    h, w = claro.shape
    fondo = np.zeros((h, w), bool)
    cola = deque()
    for x in range(w):
        for y in (0, h - 1):
            if claro[y, x]:
                fondo[y, x] = True
                cola.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if claro[y, x]:
                fondo[y, x] = True
                cola.append((y, x))
    while cola:
        y, x = cola.popleft()
        for yy, xx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= yy < h and 0 <= xx < w and claro[yy, xx] and not fondo[yy, xx]:
                fondo[yy, xx] = True
                cola.append((yy, xx))
    # huecos encerrados (entre el brazo y el cuerpo): blanco LISO, sin sombra ni rayado; la cara y las manos sí
    # tienen sombreado a lápiz, así que se quedan
    et, tams = componentes(claro & ~fondo)
    for i, t in enumerate(tams):
        if t < 600 * escala * escala / 4:
            continue
        m = et == i + 1
        if g[m].mean() > 252 and g[m].std() < 3.6:
            fondo |= m
    # alfa: dentro = opaco; en el fondo, solo lo que tiene tinta (bordes suaves del trazo)
    alfa = np.where(fondo, np.clip((235 - g) / 120, 0, 1), 1.0)
    figura = alfa > 0.05
    etiqueta, tam = componentes(figura)
    principal = int(np.argmax(tam)) + 1
    rgba = np.dstack([np.array(im), (alfa * 255).astype(np.uint8)])
    SALIDA.mkdir(parents=True, exist_ok=True)

    def guarda(m, ruta):
        r = rgba.copy()
        r[..., 3] = np.where(m, r[..., 3], 0)
        ys, xs = np.nonzero(r[..., 3] > 10)
        if not len(ys):
            return None
        Image.fromarray(r).save(ruta)
        return (int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max()))

    caja_p = guarda(etiqueta == principal, SALIDA / f"{nombre}.png")
    # la cara: la zona clara encerrada más grande y con sombreado (mide el tamaño de la cabeza para igualar dibujos)
    et2, tams2 = componentes(claro & ~fondo)
    cara = None
    for i in np.argsort(tams2)[::-1]:
        m = et2 == i + 1
        ys, xs = np.nonzero(m)
        if g[m].std() >= 3.6 and (xs.max() - xs.min()) > 0.6 * (ys.max() - ys.min()):
            cara = [int((xs.min() + xs.max()) / 2), int((ys.min() + ys.max()) / 2), int(xs.max() - xs.min())]
            break
    # los signos (¡!, ¿?, gotas, rayas): manchas no tan pequeñas fuera del personaje
    grandes = [i + 1 for i, t in enumerate(tam) if i + 1 != principal and t > 40 * escala * escala]
    guarda(np.isin(etiqueta, grandes), SALIDA / f"{nombre}-signos.png")
    print(f"✓ {nombre}: {im.width}×{im.height}, personaje en {caja_p}, cara {cara}")
    return {"caja": caja_p, "tam": [im.width, im.height], "cara": cara, "pies": caja_p[3] < im.height - 2}


def escribir_ts():
    """src/personaje/poses.ts con las medidas de todos los dibujos de public/personaje/medidas.json."""
    import json

    med = json.loads((SALIDA / "medidas.json").read_text(encoding="utf-8"))
    ts = "// HECHO POR programa/recortar.py — no editar a mano. Medidas de cada dibujo del personaje (px de la imagen):\n"
    ts += "// caja = donde está el personaje; cara = [centro x, centro y, ancho de la cara]; pies = se ven los pies.\n"
    ts += "export const DIBUJOS: Record<string, { caja: [number, number, number, number]; tam: [number, number]; cara: [number, number, number]; pies: boolean }> = "
    ts += json.dumps(med, indent=1) + ";\n"
    (RAIZ / "src" / "personaje" / "poses.ts").write_text(ts, encoding="utf-8")


def guardar_medida(nombre, info):
    import json

    f = SALIDA / "medidas.json"
    med = json.loads(f.read_text(encoding="utf-8")) if f.exists() else {}
    med[nombre] = info
    f.write_text(json.dumps(med, indent=1), encoding="utf-8")
    escribir_ts()


if __name__ == "__main__":
    a = sys.argv[1:]
    guardar_medida(a[1], recortar(a[0], a[1], tuple(int(v) for v in a[2:6]) if len(a) >= 6 else None))
