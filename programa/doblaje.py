"""DOBLAJE con varias voces de ElevenLabs (narrador + personajes), traído del motor de curiosidades.

Cómo se usa (lo llama «oceano voz N» cuando la ficha reparte líneas entre varias voces):
  1. «oceano guion N» escribe «Textos/N - Title.voces.txt»: un bloque por voz con SUS líneas en orden y las
     etiquetas de Eleven v3 ([excited], [laughs], [whispers]…).
  2. En ElevenLabs (modelo Eleven v3) se genera un audio por voz con ese bloque tal cual y se deja en
     «Pon aquí tu voz» con el nombre de la voz dentro: «narrador.mp3», «capitan.mp3»…
     (o UN solo audio hecho con «Text to Dialogue» de v3 con todas las líneas en orden).
  3. Aquí: faster-whisper escucha cada audio palabra a palabra, difflib empareja lo oído con el texto de cada línea,
     se recorta cada línea de su audio y se pegan todas en el orden del guion con una pausa corta.
  4. Las pausas de más de 0,3 s se acortan a 0,2 s (siempre, como curiosidades). --acelerar X: la voz X veces más
     rápida sin cambiar el tono (en curiosidades se usaba 1.18).

Devuelve la ruta del WAV montado; luego «oceano voz» lo nivela y saca los tiempos de cada palabra como siempre.
"""
import difflib
import re
import subprocess
from pathlib import Path

from formula import quitar_etiquetas

PAUSA = 0.22  # segundos entre línea y línea
PAUSA_RAPIDA = 0.12  # con --acelerar
MARGEN = (0.06, 0.15)  # antes / después de cada línea al recortar (como curiosidades)
MARGEN_ETIQUETA = 1.2  # si la línea EMPIEZA con una etiqueta ([laughs], [sighs]…) se guarda hasta 1,2 s antes: la risa no tiene palabras


def _norm(s):
    return re.sub(r"[^a-z0-9]", "", s.lower())


def _buscar_audio(voz, audios):
    """El audio de esa voz: el más nuevo cuyo nombre contiene el nombre de la voz."""
    clave = _norm(voz)
    hay = [a for a in audios if clave and clave in _norm(a.stem)]
    return hay[0] if hay else None


def emparejar(lineas, oidas):
    """lineas: [texto hablado]; oidas: [(palabra, ini, fin)]. Devuelve [(ini, fin) | None] por línea."""
    palabras, de_linea = [], []
    for i, t in enumerate(lineas):
        for w in t.split():
            palabras.append(_norm(w))
            de_linea.append(i)
    b = [_norm(w) for w, _, _ in oidas]
    tiempos = [None] * len(palabras)
    for bl in difflib.SequenceMatcher(None, palabras, b, autojunk=False).get_matching_blocks():
        for k in range(bl.size):
            tiempos[bl.a + k] = oidas[bl.b + k][1:]
    out = []
    for i in range(len(lineas)):
        ts = [tiempos[j] for j in range(len(palabras)) if de_linea[j] == i and tiempos[j]]
        out.append((ts[0][0], ts[-1][1]) if ts else None)
    # líneas sin reconocer: el hueco entre la anterior y la siguiente
    for i, t in enumerate(out):
        if t is None:
            a = next((out[j][1] for j in range(i - 1, -1, -1) if out[j]), 0.0)
            z = next((out[j][0] for j in range(i + 1, len(out)) if out[j]), None)
            out[i] = (a, z if z is not None else a + 0.4 * len(lineas[i].split()))
    return out


def montar(lineas, audios, carpeta, ffmpeg, transcribir, acelerar=1.0, avisa=print):
    """lineas: [(voz, texto con etiquetas)] en el orden del guion. audios: los de «Pon aquí tu voz», del más nuevo
    al más viejo. transcribir(ruta) -> [(palabra, ini, fin)]. Devuelve el WAV con todo el doblaje montado."""
    carpeta = Path(carpeta)
    carpeta.mkdir(parents=True, exist_ok=True)
    voces = list(dict.fromkeys(v for v, _ in lineas))
    hablado = [quitar_etiquetas(t) for _, t in lineas]
    por_voz = {v: _buscar_audio(v, audios) for v in voces}
    faltan = [v for v, a in por_voz.items() if a is None]
    trozos = []  # (orden, ruta)
    if faltan and len(audios) >= 1 and all(a is None for a in por_voz.values()):
        # un solo audio con todo el diálogo (Eleven v3 «Text to Dialogue»): ya viene en orden
        avisa(f"  Uso «{audios[0].name}» como diálogo completo (no hay un audio por voz).")
        oidas = transcribir(audios[0])
        cortes = emparejar(hablado, oidas)
        for i, (a, z) in enumerate(cortes):
            trozos.append((i, audios[0], a, z))
    else:
        if faltan:
            raise SystemExit("Faltan los audios de: " + ", ".join(faltan) + " (el nombre del archivo tiene que llevar el de la voz).")
        for v in voces:
            idx = [i for i, (vv, _) in enumerate(lineas) if vv == v]
            avisa(f"  {v}: «{por_voz[v].name}» ({len(idx)} líneas)")
            oidas = transcribir(por_voz[v])
            cortes = emparejar([hablado[i] for i in idx], oidas)
            for i, (a, z) in zip(idx, cortes):
                trozos.append((i, por_voz[v], a, z))
    trozos.sort()
    # recorta cada línea (sin pisar la siguiente del mismo audio) y la deja en WAV mono 44,1 kHz
    pausa = PAUSA_RAPIDA if acelerar > 1.001 else PAUSA
    wavs = []
    for k, (i, ruta, a, z) in enumerate(trozos):
        sig = [t for t in trozos if t[1] == ruta and t[2] > a]
        tope = min((t[2] for t in sig), default=z + 1.0)
        previo = max((t[3] for t in trozos if t[1] == ruta and t[3] <= a), default=0.0)
        antes = MARGEN_ETIQUETA if re.match(r"\s*\[", lineas[i][1]) else MARGEN[0]
        ini = max(0.0, previo + 0.05 if previo else 0.0, a - antes)
        fin = min(tope - 0.02, z + MARGEN[1]) if tope > z else z + MARGEN[1]
        w = carpeta / f"linea{i:03d}.wav"
        subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(ruta), "-ss", f"{ini:.3f}", "-to", f"{max(fin, ini + 0.1):.3f}",
                        "-af", "afade=t=in:d=0.015,areverse,afade=t=in:d=0.03,areverse", "-ar", "44100", "-ac", "1", str(w)], check=True)
        wavs.append(w)
    silencio = carpeta / "pausa.wav"
    subprocess.run([ffmpeg, "-v", "error", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=mono", "-t", f"{pausa:.3f}", str(silencio)], check=True)
    lista = carpeta / "lista.txt"
    lista.write_text("".join(f"file '{w.name}'\nfile '{silencio.name}'\n" for w in wavs), encoding="utf-8")
    pegado = carpeta / "pegado.wav"
    subprocess.run([ffmpeg, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-c", "copy", str(pegado)], check=True)
    # como curiosidades: SIEMPRE acorta los silencios de más de 0,3 s a 0,2 s y, con --acelerar, sube la velocidad
    # sin cambiar el tono (allí lo normal era --acelerar 1.18)
    final = carpeta / "doblaje.wav"
    filtro = "silenceremove=stop_periods=-1:stop_duration=0.3:stop_threshold=-40dB:stop_silence=0.2"
    if acelerar > 1.001:
        filtro += f",atempo={acelerar:.3f}"
    subprocess.run([ffmpeg, "-v", "error", "-y", "-i", str(pegado), "-af", filtro, str(final)], check=True)
    return final


def quien_por_palabra(lineas):
    """La voz de cada palabra del guion (en el orden del .txt), para que hable el personaje que toca."""
    out = []
    for v, t in lineas:
        out += [v] * len(quitar_etiquetas(t).split())
    return out
