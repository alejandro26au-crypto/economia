#!/usr/bin/env python3
"""Canal «Inercia del consumo»: el programa que hace los vídeos (motor 2D, src/motor).

    canal comprobar                 ¿está todo instalado?
    canal ideas                     lista de ideas con su guion
    canal guion nuevo N "Título"    crea la ficha de la fórmula viral (Textos/N - Título.json) para rellenarla
    canal guion N                   comprueba la ficha (vídeo largo), escribe el guion (.txt) y, si no
                                     existe, el borrador automático de escenas en src/ideas/N.ts
    canal borrador N [--forzar]     borrador automático de escenas a partir del guion (lugares de la ciudad,
                                     reparto, caras, signos, nubes, rótulos con las cifras y golpes)
    canal voz N                     coge el audio más nuevo de «Pon aquí tu voz», lo nivela y apunta cuándo dice cada palabra
    canal prueba N                  prepara tiempos de mentira (sin voz) para ver el vídeo antes de grabar
    canal montar N [--variante S | --nueva] [--prueba] [--rapido] [--max-minutos M]
                                     hace el vídeo N POR TRAMOS (se puede cortar y retomar: vuelve a lanzar la
                                     misma orden) y lo deja en «Vídeos listos» con su .txt para subirlo.
                                     Usa la variante guardada de la idea (la misma que la hoja); --nueva sortea otra.
                                     --prueba usa los tiempos de mentira; --rapido lo hace a media resolución
    canal foto N SEGUNDO [--prueba] saca un fotograma (PNG) para revisar cómo queda
    canal revisar N [--prueba]      una foto de cada escena en una sola hoja (1-2 min): revisar antes de montar
    canal todo N                    voz + montar seguidos (cuando el MP3 ya está en «Pon aquí tu voz»)

N es el número de la idea: el guion está en «Textos/N - Título.txt» y las escenas en «src/ideas/N.ts».
"""
import difflib
import json
import math
import os
import random
import re
import shutil
import subprocess
import sys
import time
import unicodedata
from pathlib import Path

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass

RAIZ = Path(__file__).resolve().parents[1]
TEXTOS = RAIZ / "Textos"
TU_VOZ = RAIZ / "Pon aquí tu voz"
TU_MUSICA = RAIZ / "Pon aquí tu música"
LISTOS = RAIZ / "Vídeos listos"
PUBLIC = RAIZ / "public"
SALIDA = RAIZ / "salida"
WINDOWS = os.name == "nt"
AUDIOS = (".mp3", ".wav", ".m4a", ".ogg", ".flac", ".aac")
AJUSTES = json.loads((RAIZ / "ajustes.json").read_text(encoding="utf-8")) if (RAIZ / "ajustes.json").exists() else {}
IDIOMA = AJUSTES.get("idioma", "en")  # idioma del CONTENIDO (guion, voz, subtítulos): "en" inglés, "es" español
TAGS = AJUSTES.get("hashtags", "#economia #dinero")
RITMO = float(AJUSTES.get("velocidad_voz", 1.0))  # 1.08 = la voz un 8 % más rápida (más ritmo, vídeo más corto)


NUBE = Path("/opt/pw-browsers/chromium_headless_shell-1243").exists()  # la nube de Claude (sin tarjeta gráfica)


def fallo(msg):
    print("\n✗ " + msg)
    sys.exit(1)


def ffmpeg():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        fallo("No encuentro ffmpeg. Vuelve a instalar (instalador/).")


def npx():
    local = RAIZ / "node" / ("npx.cmd" if WINDOWS else "bin/npx")
    if local.exists():
        return str(local)
    exe = shutil.which("npx.cmd" if WINDOWS else "npx") or shutil.which("npx")
    if not exe:
        fallo("No encuentro Node. Vuelve a instalar (instalador/).")
    return exe


def entorno():
    env = dict(os.environ)
    nodo = RAIZ / "node" / ("" if WINDOWS else "bin")
    if nodo.exists():
        env["PATH"] = str(nodo) + os.pathsep + env.get("PATH", "")
    return env


def normal(s):
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9ñ]", "", s)


def ideas():
    out = {}
    for f in sorted(TEXTOS.glob("*.txt")):
        m = re.match(r"(\d+)\s*-\s*(.+)\.txt$", f.name)
        if m:
            out[int(m.group(1))] = {"titulo": m.group(2).strip(), "guion": f.read_text(encoding="utf-8").strip()}
    return out


def idea(args):
    try:
        n = int(args[0])
    except (IndexError, ValueError):
        fallo("Dime el número de la idea. Ejemplo:  canal montar 1")
    todas = ideas()
    if n not in todas:
        fallo(f"No hay guion para la idea {n} en «Textos» (las que hay: {', '.join(map(str, todas))}).")
    if not (RAIZ / "src" / "ideas" / f"{n}.ts").exists():
        fallo(f"La idea {n} tiene guion pero no escenas: falta src/ideas/{n}.ts (y apuntarla en src/ideas/lista.ts).")
    return n, todas[n]


def duracion(audio):
    import av

    with av.open(str(audio)) as c:
        return float(c.duration / 1_000_000) if c.duration else 0.0


# ---------------------------------------------------------------- órdenes
def cmd_comprobar(_):
    bien = True

    def linea(ok, texto):
        nonlocal bien
        bien = bien and ok
        print(("  ✓ " if ok else "  ✗ ") + texto)

    print("Canal de economía — comprobación")
    linea((RAIZ / "node").exists() or shutil.which("node") is not None, "Node")
    linea((RAIZ / "node_modules" / "remotion").exists(), "Motor de vídeo (Remotion)")
    for mod, nombre in (("faster_whisper", "faster-whisper (escucha la voz)"), ("av", "PyAV (lee el audio)")):
        try:
            __import__(mod)
            linea(True, nombre)
        except Exception:
            linea(False, nombre)
    try:
        ffmpeg()
        linea(True, "ffmpeg")
    except SystemExit:
        linea(False, "ffmpeg")
    for n, d in ideas().items():
        voz = (PUBLIC / "voces" / str(n) / "tiempos.json").exists()
        print(f"  · Idea {n} «{d['titulo']}»: " + ("voz preparada" if voz else "sin voz todavía"))
    print("\nTodo listo." if bien else "\nFalta algo: ejecuta el instalador.")
    sys.exit(0 if bien else 1)


def cmd_ideas(_):
    for n, d in ideas().items():
        print(f"\n{n}. {d['titulo']}\n   {d['guion']}")


def cmd_voz(args):
    n, d = idea(args)
    audios = sorted([p for p in TU_VOZ.iterdir() if p.suffix.lower() in AUDIOS], key=lambda p: p.stat().st_mtime, reverse=True) if TU_VOZ.exists() else []
    if not audios:
        fallo("No hay ningún audio en «Pon aquí tu voz». Haz la voz en ElevenLabs con el guion y déjala ahí.")
    original = audios[0]
    print(f"Uso «{original.name}» para la idea {n}.")
    destino = PUBLIC / "voces" / str(n)
    destino.mkdir(parents=True, exist_ok=True)
    voz = destino / "voz.mp3"
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(original), "-af", f"silenceremove=start_periods=1:start_threshold=-45dB,atempo={RITMO},loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", "44100", "-ac", "1", "-b:a", "192k", str(voz)], check=True)

    texto = d["guion"]
    guion = texto.split()
    print("Escuchando la voz palabra a palabra (la primera vez descarga el modelo, ~500 MB)…", flush=True)
    from faster_whisper import WhisperModel

    modelo = WhisperModel(os.environ.get("CANAL_WHISPER", "small"), device="cpu", compute_type="int8")
    a = [normal(w) for w in guion]

    def escucha(pista):
        segs, _ = modelo.transcribe(str(voz), language=IDIOMA, word_timestamps=True, vad_filter=False, condition_on_previous_text=False, initial_prompt=pista)
        oidas = []
        for s in segs:
            for w in s.words or []:
                t = w.word.strip()
                if not t:
                    continue
                # "16" + ",500" -> "16,500" (las cifras con miles llegan partidas)
                if oidas and re.match(r"^[.,]\d", t) and re.search(r"\d$", oidas[-1][0]):
                    oidas[-1] = (oidas[-1][0] + t, oidas[-1][1], float(w.end))
                else:
                    oidas.append((t, float(w.start), float(w.end)))
        # cada palabra DEL GUION con el tiempo en que se oye
        b = [normal(w) for w, _, _ in oidas]
        tiempos = [None] * len(a)
        for bloque in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
            for k in range(bloque.size):
                tiempos[bloque.a + k] = (oidas[bloque.b + k][1], oidas[bloque.b + k][2])
        return tiempos

    # con el guion como pista, a veces se salta el principio del audio: se prueba también sin pista y gana la mejor
    tiempos = escucha(texto)
    if sum(t is not None for t in tiempos) < 0.9 * len(a):
        otra = escucha(None)
        if sum(t is not None for t in otra) > sum(t is not None for t in tiempos):
            tiempos = otra
    if not any(tiempos):
        fallo("No se oye ninguna palabra en ese audio. Vuelve a generar la voz.")
    # las que no se reconocen, repartidas en su hueco
    total = duracion(voz)
    claras = sum(t is not None for t in tiempos)
    i = 0
    while i < len(a):
        if tiempos[i] is None:
            j = i
            while j < len(a) and tiempos[j] is None:
                j += 1
            t0 = tiempos[i - 1][1] if i > 0 else 0.0
            t1 = tiempos[j][0] if j < len(a) else total
            paso = max(t1 - t0, 0.05) / (j - i)
            for k in range(i, j):
                tiempos[k] = (t0 + paso * (k - i), t0 + paso * (k - i + 1))
            i = j
        else:
            i += 1
    palabras = [{"p": w, "ini": round(t[0], 2), "fin": round(t[1], 2)} for w, t in zip(guion, tiempos)]
    (destino / "tiempos.json").write_text(json.dumps({"duracion": round(total, 2), "palabras": palabras}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ Voz preparada: {len(palabras)} palabras en {total:.1f} s ({claras} reconocidas).")
    if claras < 0.7 * len(a):
        print("  ⚠ La voz no parece decir el guion tal cual: el dibujo puede ir descuadrado. Genera la voz con el texto exacto.")
    print(f"  Siguiente:  canal montar {n}")


def cmd_prueba(args):
    """Tiempos inventados (~2,8 palabras por segundo, como una voz de ElevenLabs, con pausas) para ver el vídeo sin voz."""
    n, d = idea(args)
    t = 0.2
    palabras = []
    for w in d["guion"].split():
        dur = 0.17 + 0.028 * len(w)
        palabras.append({"p": w, "ini": round(t, 2), "fin": round(t + dur, 2)})
        t += dur + 0.04 + (0.2 if re.search(r"[.!?…:]$", w) else 0.08 if w.endswith(",") else 0)
    destino = PUBLIC / "voces" / str(n)
    destino.mkdir(parents=True, exist_ok=True)
    (destino / "prueba.json").write_text(json.dumps({"duracion": round(t, 2), "palabras": palabras}, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"✓ Tiempos de prueba para la idea {n}: {len(palabras)} palabras, {t:.1f} s.")


# Efectos de sonido hechos con ffmpeg (sin licencias). Suenan solos en cada cambio de cámara (whoosh), en cada
# cambio de escena (golpe), en cada "weird" del guion (raro) y en algunas acciones (pop, boing, chasquido).
SONIDOS = {
    "whoosh1": ("(random(0)*2-1)*pow(sin(PI*t/0.42),3)", 0.42, "highpass=f=500,lowpass=f=4200,volume=1.6"),
    "whoosh2": ("(random(0)*2-1)*pow(sin(PI*pow(t/0.5,0.6)),2)", 0.5, "bandpass=f=1400:width_type=o:w=2.2,volume=2.2"),
    "whoosh3": ("(random(0)*2-1)*pow(sin(PI*t/0.34),2)*(0.6+0.4*sin(2*PI*14*t))", 0.34, "highpass=f=900,lowpass=f=6000,volume=1.5"),
    "golpe": ("0.9*sin(2*PI*(50+90*exp(-9*t))*t)*exp(-5*t)+0.35*(random(0)*2-1)*exp(-35*t)", 0.7, "lowpass=f=2500"),
    "pop": ("0.7*sin(2*PI*(380+1700*t)*t)*exp(-28*t)", 0.16, "anull"),
    "boing": ("0.5*sin(2*PI*(170+90*sin(2*PI*9*t)*exp(-3*t))*t)*exp(-4*t)", 0.7, "anull"),
    "raro": ("0.32*sin(2*PI*(620-260*t+40*sin(2*PI*7*t))*t)*min(1,t*10)*exp(-1.6*t)+0.16*sin(2*PI*(931-390*t)*t)*exp(-2*t)", 1.3, "aecho=0.8:0.6:120:0.35"),
    "ding": ("0.5*sin(2*PI*1320*t)*exp(-3*t)+0.25*sin(2*PI*2640*t)*exp(-5*t)", 1.2, "anull"),
    "chasquido": ("0.9*(random(0)*2-1)*exp(-90*t)+0.6*sin(2*PI*2200*t)*exp(-60*t)", 0.25, "highpass=f=700"),
    "vuelo": ("(random(0)*2-1)*pow(sin(PI*t/1.0),2)*(0.5+0.5*sin(2*PI*3*t))", 1.0, "bandpass=f=900:width_type=o:w=2.5,volume=2.4"),
    "lapiz": ("(random(0)*2-1)*(0.5+0.5*sin(2*PI*11*t))*exp(-1.5*t)", 0.9, "highpass=f=2500,lowpass=f=7000,volume=1.2"),
    "sello": ("1.0*sin(2*PI*(70+60*exp(-20*t))*t)*exp(-9*t)+0.6*(random(0)*2-1)*exp(-40*t)", 0.5, "lowpass=f=1800"),
    "caja": ("0.45*sin(2*PI*2093*t)*exp(-6*t)+0.35*sin(2*PI*2637*(t-0.09))*exp(-6*(t-0.09))*gt(t,0.09)+0.3*(random(0)*2-1)*exp(-60*t)", 0.9, "anull"),
}


def efectos_sonido():
    carpeta = PUBLIC / "sfx"
    carpeta.mkdir(parents=True, exist_ok=True)
    for nombre, (expr, dur, filtro) in SONIDOS.items():
        f = carpeta / f"{nombre}.wav"
        if not f.exists():
            orden = [ffmpeg(), "-v", "error", "-y", "-f", "lavfi", "-i", f"aevalsrc='{expr}':d={dur}:s=44100"]
            orden += ["-af", f"{filtro},afade=t=out:st={dur * 0.8:.3f}:d={dur * 0.2:.3f}", str(f)]
            subprocess.run(orden, check=True)


# ---------------------------------------------------------------- guion de vídeo LARGO y borrador de escenas
PALABRAS_LARGO = (1500, 2200)  # 10-15 min de voz

# Lugares de la Ciudad Inercia y las palabras del guion que los llaman (el borrador elige el que más coincide).
LUGARES_CLAVE = {
    "casa": "tu tus te ti sueldo salario alquiler casa nevera compra familia hogar factura facturas bolsillo colchón ahorras ahorrar mes vida",
    "banco": "banco bancos banquero banqueros préstamo préstamos crédito créditos cuenta cuentas depósito depósitos intereses interés deuda deudas hipoteca hipotecas",
    "bolsa": "bolsa bolsas acciones acción wall street índice cotización inversores inversor inversión invertir fondo fondos burbuja especulación especuladores apuesta quiebra",
    "mercado": "comprar compras vender venta precio precios mercado oferta demanda tienda consumo consumir producto productos inflación supermercado",
    "puerto": "comercio barco barcos exportar importar exportaciones colonias mercancía mississippi compañía américa china aranceles mar",
    "cajeros": "efectivo cajero cajeros sacar retirar corralito pánico cola colas billetes monedas",
    "gobierno": "gobierno estado ley leyes impuestos presidente ministro central imprimir imprenta moneda reserva rey regente reina emperador político",
}
REPARTO_CLAVE = {
    "banquero": "banco bancos banquero banqueros prestamista",
    "inversor": "inversor inversores especulador especuladores accionista accionistas fondo trader",
    "politico": "gobierno político políticos ministro presidente congreso diputado",
    "trabajador": "trabajador trabajadores obrero obreros empleado empleados sueldo salario",
    "monarca": "rey reina regente monarca emperador duque",
    "estafador": "estafa estafador estafadores fraude timador ladrón ladrones",
    "economista": "economista economistas profesor universidad nobel",
}
CARAS_CLAVE = [
    # (palabras, cara, pose, signo)
    ("crisis quiebra quebró ruina arruinado arruinados perdió perdieron pérdidas desastre hundió desplomó cayó", "triste", "agotado", "sudor"),
    ("pánico miedo terror colapso explotó estalló", "asustado", "cabeza", "susto"),
    ("furioso rabia mentira mintió robaron robo engaño engañó traición", "enfadado", "cruza", "enfado"),
    ("rieron risa burla burlaron ridículo loco", "risa", "brazos", None),
    ("ganó ganaron millones fortuna rico ricos éxito subió duplicó triplicó", "feliz", "victoria", "dinero"),
    ("idea descubrió entendió inventó solución truco", "sorpresa", "senala", "idea"),
]
GIROS = {"pero": "¡PERO!", "aún": "¡Y AÚN PEOR!", "embargo": "¡PERO!", "hasta": "¡GIRO!", "entonces": "¡Y ENTONCES!"}
NUMERO = re.compile(r"\d")
UNIDAD = re.compile(r"^(millones|millón|mil|billones|dólares|euros|%|por|años|meses|días|horas|veces|marcos|pesos|libras)$", re.I)


def norm_es(w):
    return re.sub(r"[^a-záéíóúüñ0-9_]", "", w.lower())


def frases(texto):
    """Lista de (palabras, fin_de_párrafo) por frase; las palabras son las del guion tal cual (con signos)."""
    out = []
    for par in [p for p in re.split(r"\n\s*\n|\n", texto) if p.strip()]:
        trozos = re.split(r"(?<=[.!?…])\s+", par.strip())
        for k, t in enumerate(trozos):
            ws = t.split()
            if ws:
                out.append((ws, k == len(trozos) - 1))
    return out


def cifra_de(f, j):
    w = f[j].strip(".,;:!?…«»\"()¿¡")
    if j + 1 < len(f) and UNIDAD.match(norm_es(f[j + 1])):
        if norm_es(f[j + 1]) == "por" and j + 2 < len(f) and f[j + 2].lower().startswith("ciento"):
            return w + " %"
        return w + " " + f[j + 1].strip(".,;:!?…«»\"()")
    return w


def borrador_largo(n, titulo, guion, reparto_fijo=None):
    """Escenas de borrador (motor 2D): una escena cada ~40-80 palabras (cortando en frases y párrafos), lugar de la
    Ciudad Inercia por palabras clave (procurando cambiar: la cámara vuela siguiendo al billete), personajes que se
    nombran, caras/poses/signos por frase, rótulos con las cifras, NUBE con la cifra cuando la escena explica
    números, sello en los giros («Pero…», «Y aún…») y lluvia de billetes con los millones."""
    fs = frases(guion)
    escenas, actual, cuenta = [], [], 0
    for ws, fin_par in fs:
        actual.append(ws)
        cuenta += len(ws)
        if cuenta >= 80 or (cuenta >= 40 and fin_par):
            escenas.append(actual)
            actual, cuenta = [], 0
    if actual:
        if escenas and cuenta < 20:
            escenas[-1] += actual
        else:
            escenas.append(actual)
    bloques, idx, previo, nube_antes = [], 0, None, True
    usados = {}
    for k, frs in enumerate(escenas):
        palabras = [w for f in frs for w in f]
        bolsa = {norm_es(w) for w in palabras}
        puntos = {e: len(bolsa & set(c.split())) for e, c in LUGARES_CLAVE.items()}
        candidatos = sorted(puntos, key=lambda e: (-puntos[e], usados.get(e, 0)))
        lugar = next((e for e in candidatos if e != previo and puntos[e] > 0), None) or min((e for e in LUGARES_CLAVE if e != previo), key=lambda e: usados.get(e, 0))
        usados[lugar] = usados.get(lugar, 0) + 1
        previo = lugar
        figuras = [f for f, c in REPARTO_CLAVE.items() if bolsa & set(c.split())]
        if reparto_fijo:
            figuras = [f for f in reparto_fijo if f in figuras] or figuras
        lista = (["protagonista"] + figuras)[:3]
        acciones = {f: [] for f in lista}
        rotulos, golpes, cifras = [], [], []
        pos = idx
        for f in frs:
            ini = pos
            t = {norm_es(w) for w in f}
            quien = lista[0]
            for fg in lista[1:]:
                if t & set(REPARTO_CLAVE.get(fg, "").split()):
                    quien = fg
                    break
            primera = norm_es(f[0])
            if primera in GIROS or (primera == "y" and len(f) > 1 and norm_es(f[1]) == "aún"):
                golpes.append({"tipo": "sello", "en": ini, "texto": GIROS.get(primera, "¡Y AÚN PEOR!")})
            hecho = False
            for claves, cara, pose, signo in CARAS_CLAVE:
                hit = next((ini + j for j, w in enumerate(f) if norm_es(w) in claves.split()), None)
                if hit is not None:
                    acciones[quien] += [{"en": hit, "hace": "cara", "cara": cara}, {"en": hit, "hace": "pose", "pose": pose}]
                    if signo:
                        acciones[quien].append({"en": hit, "hace": "signo", "signo": signo})
                    if signo == "dinero" and not any(g["tipo"] == "lluvia" for g in golpes):
                        golpes.append({"tipo": "lluvia", "en": hit})
                    hecho = True
                    break
            if not hecho and f[-1].endswith("?"):
                acciones[quien] += [{"en": ini, "hace": "cara", "cara": "piensa"}, {"en": ini, "hace": "pose", "pose": "piensa"}, {"en": ini + len(f) - 1, "hace": "signo", "signo": "pregunta"}]
                hecho = True
            elif not hecho and f[-1].endswith("!"):
                acciones[quien] += [{"en": ini, "hace": "cara", "cara": "sorpresa"}, {"en": ini, "hace": "signo", "signo": "exclama"}]
                golpes.append({"tipo": "zoom", "en": ini, "a": 1.12})
                hecho = True
            if hecho and pos + len(f) < idx + len(palabras):
                acciones[quien] += [{"en": pos + len(f), "hace": "cara", "cara": "normal"}, {"en": pos + len(f), "hace": "pose", "pose": "brazos"}]
            for j, w in enumerate(f):
                if NUMERO.search(w):
                    cifras.append((ini + j, cifra_de(f, j).upper()))
                    break
            pos += len(f)
        # dos cifras o más en la escena (y no hubo nube justo antes): la explicación va DENTRO de la nube
        nube = None
        if len(cifras) >= 2 and not nube_antes:
            nube = {"tipo": "cifra", "texto": cifras[-1][1], "sub": cifras[0][1]}
            nube_antes = True
        else:
            nube_antes = False
            for j, (en, texto) in enumerate(cifras[:3]):
                rotulos.append({"en": en, "texto": texto, "hasta": min(en + 8, idx + len(palabras) - 1)})
                if j == 0:
                    golpes.append({"tipo": "temblor", "en": en})
        lineas = [f"    // {k + 1}. {' '.join(palabras)[:90]}…", "    {"]
        if k > 0:
            lineas.append(f"      desde: {idx},")
        lineas.append(f'      lugar: "{lugar}",')
        # ritmo: el gancho y los giros van en ALTA; las explicaciones (nube) en CALMA; el resto, normal
        ritmo = "calma" if nube else "alta" if k == 0 or any(g["tipo"] == "sello" for g in golpes) else "normal"
        lineas.append(f'      ritmo: "{ritmo}",')
        if nube:
            lineas.append(f"      nube: {json.dumps(nube, ensure_ascii=False)},")
        lineas.append("      actores: [")
        for a_i, fg in enumerate(lista):
            x = -150 if len(lista) > 1 and a_i == 0 else 0 if len(lista) == 1 else 150 + (a_i - 1) * 260
            extra = ", narra: true" if a_i == 0 else ""
            acc = json.dumps(acciones[fg], ensure_ascii=False)
            lineas.append(f'        {{ quien: "{fg}", x: {x}, mira: {1 if x <= 0 else -1}{extra}, acciones: {acc} }},')
        lineas.append("      ],")
        if rotulos:
            lineas.append(f"      rotulos: {json.dumps(rotulos, ensure_ascii=False)},")
        if golpes:
            lineas.append(f"      golpes: {json.dumps(golpes, ensure_ascii=False)},")
        lineas.append("    },")
        bloques.append("\n".join(lineas))
        idx += len(palabras)
    cab = f"// Borrador AUTOMÁTICO hecho por «canal borrador {n}» a partir del guion. Retoca lugares, personajes, acciones,\n"
    cab += "// nubes, rótulos y golpes. Escenas y acciones van por ÍNDICE de palabra del guion (lo más seguro).\n"
    cab += 'import { Idea } from "../motor/tipos";\n\n'
    return cab + f"export const idea{n}: Idea = {{\n  n: {n},\n  titulo: {json.dumps(titulo, ensure_ascii=False)},\n  escenas: [\n" + "\n".join(bloques) + "\n  ],\n};\n"


def apuntar_en_lista(n):
    lista = RAIZ / "src" / "ideas" / "lista.ts"
    s = lista.read_text(encoding="utf-8")
    if f'from "./{n}"' in s:
        return
    s = s.replace('import { Idea } from "../motor/tipos";\n', f'import {{ Idea }} from "../motor/tipos";\nimport {{ idea{n} }} from "./{n}";\n')
    s = re.sub(r"export const IDEAS: Idea\[\] = \[(.*?)\];", lambda m: f"export const IDEAS: Idea[] = [{m.group(1)}, idea{n}];", s, flags=re.S)
    lista.write_text(s, encoding="utf-8")


def cmd_borrador(args):
    """Escribe (o REESCRIBE con --forzar) el borrador de escenas src/ideas/N.ts a partir del guion."""
    n, d = idea_sin_escenas(args)
    ts = RAIZ / "src" / "ideas" / f"{n}.ts"
    if ts.exists() and "--forzar" not in args:
        fallo(f"Ya existe src/ideas/{n}.ts. Para rehacerlo desde el guion (se pierde lo retocado):  canal borrador {n} --forzar")
    fi = fichas().get(n)
    reparto = json.loads(fi.read_text(encoding="utf-8")).get("reparto") if fi else None
    ts.write_text(borrador_largo(n, d["titulo"], d["guion"], reparto if isinstance(reparto, list) else None), encoding="utf-8")
    apuntar_en_lista(n)
    cuantas = ts.read_text(encoding="utf-8").count("lugar:")
    print(f"✓ Borrador de escenas: src/ideas/{n}.ts ({cuantas} escenas), apuntado en src/ideas/lista.ts.")


def idea_sin_escenas(args):
    try:
        n = int(args[0])
    except (IndexError, ValueError):
        fallo("Dime el número. Ejemplo:  canal borrador 1")
    todas = ideas()
    if n not in todas:
        fallo(f"No hay guion para la idea {n} en «Textos».")
    return n, todas[n]


def fichas():
    out = {}
    for f in sorted(TEXTOS.glob("*.json")):
        m = re.match(r"(\d+)\s*-\s*(.+)\.json$", f.name)
        if m:
            out[int(m.group(1))] = f
    return out


def revisar_ficha(fi):
    """Comprueba la ficha del vídeo largo. Devuelve (fallos, avisos)."""
    fallos, avisos = [], []
    guion = fi.get("guion", "").strip()
    if not guion:
        fallos.append("Falta «guion»: el texto EXACTO que dirá la voz (párrafos separados por una línea en blanco).")
        return fallos, avisos
    n = len(guion.split())
    if not PALABRAS_LARGO[0] <= n <= PALABRAS_LARGO[1]:
        avisos.append(f"El guion tiene {n} palabras; para 10-15 min apunta a {PALABRAS_LARGO[0]}-{PALABRAS_LARGO[1]}.")
    gancho = " ".join(guion.split()[:75])
    if "?" not in gancho and not NUMERO.search(gancho):
        avisos.append("El gancho (primeros 30 s) no tiene ni pregunta ni cifra: empieza con la pregunta o la cifra brutal.")
    giros = len(re.findall(r"\b(pero|y aún|y entonces|sin embargo|hasta que|lo peor)\b", guion, re.I))
    if giros < n / 260:
        avisos.append(f"Pocos giros ({giros}): mete un «Y aún es peor…» / «Pero…» cada 1-2 minutos.")
    if not re.search(r"\b(tu|tus|te)\b", guion, re.I):
        avisos.append("No le hablas al espectador: compara con SU sueldo, SU alquiler, SU banco.")
    if not fi.get("fuentes"):
        fallos.append("Faltan «fuentes»: cada cifra tiene que estar comprobada (banco central, FMI, hemeroteca, libro).")
    if not fi.get("dato"):
        avisos.append("Falta «dato»: la cifra o el hecho central, en una frase.")
    return fallos, avisos


def cmd_guion(args):
    if args and args[0] == "nuevo":
        try:
            n = int(args[1])
        except (IndexError, ValueError):
            fallo('Ejemplo:  canal guion nuevo 1 "El hombre que imprimió dinero"')
        titulo = " ".join(args[2:]).strip() or "Sin titulo"
        f = TEXTOS / f"{n} - {titulo}.json"
        if f.exists():
            fallo(f"Ya existe «{f.name}».")
        ficha = {
            "titulo": titulo,
            "guion": "",
            "dato": "",
            "fuentes": [],
            "reparto": ["protagonista"],
            "hashtags": TAGS,
            "_ayuda": "guion = el texto EXACTO de la voz (1.500-2.200 palabras, párrafos con línea en blanco). Gancho en los primeros 30 s; un giro cada 1-2 min; compara con el bolsillo del espectador. reparto = figuras de src/reparto/reparto.ts que salen.",
        }
        TEXTOS.mkdir(exist_ok=True)
        f.write_text(json.dumps(ficha, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ Ficha creada: «Textos/{f.name}». Rellénala y luego:  canal guion {n}")
        return
    try:
        n = int(args[0])
    except (IndexError, ValueError):
        fallo("Dime el número. Ejemplo:  canal guion 1")
    fs = fichas()
    if n not in fs:
        fallo(f'No hay ficha para la idea {n}. Créala con:  canal guion nuevo {n} "Título"')
    fi = json.loads(fs[n].read_text(encoding="utf-8"))
    fallos, avisos = revisar_ficha(fi)
    for a in avisos:
        print("  ⚠ " + a)
    if fallos:
        for x in fallos:
            print("  ✗ " + x)
        fallo("La ficha no está lista todavía.")
    guion = fi["guion"].strip()
    titulo = fi.get("titulo") or re.match(r"\d+\s*-\s*(.+)\.json$", fs[n].name).group(1)
    for viejo in TEXTOS.glob(f"{n} - *.txt"):
        viejo.unlink()
    (TEXTOS / f"{n} - {titulo}.txt").write_text(guion + "\n", encoding="utf-8")
    palabras = len(guion.split())
    print(f"✓ Guion escrito: «Textos/{n} - {titulo}.txt» ({palabras} palabras, unos {palabras / 2.6 / 60:.1f} min).")
    if not (RAIZ / "src" / "ideas" / f"{n}.ts").exists():
        cmd_borrador([str(n)])


def elegir_variante(n, args):
    """La variante (cámara, colores…) se GUARDA por idea en Textos/variantes.json: la hoja de revisión, las fotos y
    el montaje usan la misma, así el vídeo final sale igual que lo revisado. --variante S la fija; --nueva sortea otra."""
    fich = TEXTOS / "variantes.json"
    guardadas = json.loads(fich.read_text(encoding="utf-8")) if fich.exists() else {}
    if "--variante" in args:
        v = int(args[args.index("--variante") + 1])
    elif "--nueva" in args or str(n) not in guardadas:
        v = random.randint(1, 9999)
    else:
        return int(guardadas[str(n)])
    guardadas[str(n)] = v
    fich.write_text(json.dumps(guardadas, indent=1, sort_keys=True) + "\n", encoding="utf-8")
    return v


def preparar_props(n, args):
    prueba = "--prueba" in args
    fich = PUBLIC / "voces" / str(n) / ("prueba.json" if prueba else "tiempos.json")
    if not fich.exists():
        fallo(f"Antes hay que preparar la voz:  canal voz {n}" + ("" if prueba else f"   (o probar sin voz:  canal prueba {n}  y  --prueba)"))
    t = json.loads(fich.read_text(encoding="utf-8"))
    variante = elegir_variante(n, args)
    musica = None
    pistas = [p for p in TU_MUSICA.iterdir() if p.suffix.lower() in AUDIOS] if TU_MUSICA.exists() else []
    if pistas:
        elegida = random.Random(variante).choice(sorted(pistas))
        (PUBLIC / "musica").mkdir(exist_ok=True)
        copia = PUBLIC / "musica" / ("actual" + elegida.suffix.lower())
        shutil.copyfile(elegida, copia)
        musica = f"musica/{copia.name}"
    efectos_sonido()
    props = {"n": n, "variante": variante, "duracion": t["duracion"], "palabras": t["palabras"], "voz": None if prueba else f"voces/{n}/voz.mp3", "musica": musica}
    SALIDA.mkdir(exist_ok=True)
    pf = SALIDA / f"props-{n}.json"
    pf.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")
    return props, pf, (pistas and elegida.name)


TRAMO_SEG = int(AJUSTES.get("tramo_segundos", 45))  # cada tramo se dibuja aparte (y se puede retomar)


def huella(props):
    """Huella de lo que cambia el dibujo: si cambia (voz, variante, escenas), los tramos viejos no valen."""
    import hashlib

    h = hashlib.sha1(json.dumps(props, sort_keys=True).encode("utf-8"))
    for f in sorted((RAIZ / "src").rglob("*.ts*")):
        h.update(f.read_bytes())
    return h.hexdigest()[:16]


def cmd_montar(args):
    """Monta el vídeo POR TRAMOS (de TRAMO_SEG segundos): cada tramo es un archivo aparte que se guarda al terminar.
    Si el proceso se corta (la nube corta a las 2 h), al volver a lanzar la misma orden sigue por el primer tramo que
    falta. Al final une los tramos SIN volver a comprimir (no se nota el corte) y les pone el audio entero."""
    n, d = idea(args)
    props, pf, musica = preparar_props(n, args)
    v = props["variante"]
    total = math.ceil((props["duracion"] + 0.7) * 30)
    carpeta = SALIDA / f"tramos-{n}{'-prueba' if '--prueba' in args else ''}"
    carpeta.mkdir(parents=True, exist_ok=True)
    marca = huella(props) + ("-rapido" if "--rapido" in args else "") + (f"-t{args[args.index('--tramo') + 1]}" if "--tramo" in args else "")
    if (carpeta / "huella.txt").exists() and (carpeta / "huella.txt").read_text().strip() != marca:
        print("Ha cambiado algo (voz, escenas o variante): empiezo los tramos de cero.")
        shutil.rmtree(carpeta)
        carpeta.mkdir(parents=True)
    (carpeta / "huella.txt").write_text(marca)
    seg_tramo = int(args[args.index("--tramo") + 1]) if "--tramo" in args else TRAMO_SEG
    paso = seg_tramo * 30
    tramos = [(a, min(total, a + paso) - 1) for a in range(0, total, paso)]
    hechos = sum((carpeta / f"v{k:03}.mp4").exists() for k in range(len(tramos)))
    print(f"Montando la idea {n} «{d['titulo']}» (variante {v}): {total / 30:.0f} s en {len(tramos)} tramos de {seg_tramo} s" + (f" ({hechos} ya hechos, sigo)" if hechos else "") + ".", flush=True)
    registro = SALIDA / f"montaje-{n}.log"
    hilos = "100%" if NUBE else "50%"
    paquete = SALIDA / "paquete-montaje"
    r = subprocess.run([npx(), "remotion", "bundle", "src/index.ts", f"--out-dir={paquete}", "--log=error"], cwd=RAIZ, env=entorno())
    if r.returncode != 0:
        fallo("No se ha podido preparar el proyecto (mira el error de arriba).")
    inicio = time.time()
    limite = float(args[args.index("--max-minutos") + 1]) if "--max-minutos" in args else (100 if NUBE else 1e9)
    for k, (a, b) in enumerate(tramos):
        out = carpeta / f"v{k:03}.mp4"
        if out.exists():
            continue
        if (time.time() - inicio) / 60 > limite:
            print(f"⏸ Paro aquí para no pasar el límite de la nube ({k}/{len(tramos)} tramos hechos). Vuelve a lanzar la MISMA orden y sigue donde lo dejó.")
            sys.exit(3)
        t0 = time.time()
        tmp = carpeta / f"v{k:03}.tmp.mp4"
        orden = [npx(), "remotion", "render", str(paquete), "video", str(tmp), f"--props={pf}", f"--frames={a}-{b}", f"--concurrency={hilos}", "--muted", "--crf=19", "--x264-preset=veryfast", "--log=error"]
        if "--rapido" in args:
            orden.append("--scale=0.5")
        with open(registro, "a", encoding="utf-8") as reg:
            r = subprocess.run(orden, cwd=RAIZ, stdout=reg, stderr=subprocess.STDOUT, env=entorno())
        if r.returncode != 0 or not tmp.exists():
            fallo(f"El tramo {k + 1} ha fallado. Mira salida/montaje-{n}.log\n" + registro.read_text(encoding="utf-8")[-1500:])
        tmp.rename(out)
        hechos_ahora = k + 1
        falta = (time.time() - inicio) / max(1, hechos_ahora - hechos) * (len(tramos) - hechos_ahora)
        print(f"  ✓ tramo {k + 1}/{len(tramos)} ({(b - a + 1) / 30:.0f} s de vídeo en {time.time() - t0:.0f} s). Faltan unos {falta / 60:.0f} min.", flush=True)
    # el audio entero de una vez (voz, música y efectos): así no hay saltos en el sonido entre tramos
    audio = carpeta / "audio.aac"
    if not audio.exists():
        print("  · Mezclando el audio…", flush=True)
        with open(registro, "a", encoding="utf-8") as reg:
            r = subprocess.run([npx(), "remotion", "render", str(paquete), "video", str(carpeta / "audio.tmp.aac"), f"--props={pf}", "--codec=aac", "--log=error"], cwd=RAIZ, stdout=reg, stderr=subprocess.STDOUT, env=entorno())
        if r.returncode != 0:
            fallo(f"No se ha podido mezclar el audio. Mira salida/montaje-{n}.log")
        (carpeta / "audio.tmp.aac").rename(audio)
    lista = carpeta / "lista.txt"
    lista.write_text("".join(f"file 'v{k:03}.mp4'\n" for k in range(len(tramos))), encoding="utf-8")
    LISTOS.mkdir(exist_ok=True)
    final = LISTOS / f"{n} - {d['titulo']} ({v}){' PRUEBA' if '--prueba' in args else ''}.mp4"
    # une los tramos sin recomprimir la imagen y pone el audio al volumen de YouTube (−14 LUFS)
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lista), "-i", str(audio), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", "-movflags", "+faststart", str(final)], check=True)
    primera = re.split(r"(?<=[.!?])\s", d["guion"])[0]
    tags = TAGS
    for fi in TEXTOS.glob(f"{n} - *.json"):
        tags = json.loads(fi.read_text(encoding="utf-8")).get("hashtags", TAGS)
    txt = f"{d['titulo']}\n\n{primera}\n\n{tags}\n"
    if musica:
        txt += f"\nMúsica: {musica} (pon aquí su crédito si su licencia lo pide)\n"
    final.with_suffix(".txt").write_text(txt, encoding="utf-8")
    print(f"✓ Vídeo listo: «{LISTOS.name}/{final.name}»")


def cmd_foto(args):
    n, _ = idea(args)
    try:
        seg = float(args[1])
    except (IndexError, ValueError):
        fallo("Dime el segundo. Ejemplo:  canal foto 1 3.5")
    props, pf, _ = preparar_props(n, args)
    out = SALIDA / f"foto-{n}-{seg:g}s.png"
    r = subprocess.run([npx(), "remotion", "still", "src/index.ts", "video", str(out), f"--props={pf}", f"--frame={int(seg * 30)}", "--log=error"], cwd=RAIZ, env=entorno())
    if r.returncode != 0:
        fallo("No se ha podido sacar la foto (mira el error de arriba).")
    print(f"✓ {out}")


def tiempos_escenas(n, props):
    """Segundo central de cada escena (según la palabra «desde» de cada una)."""
    pal = props["palabras"]
    ts_src = (RAIZ / "src" / "ideas" / f"{n}.ts").read_text(encoding="utf-8")
    # igual que el montaje (indicePalabra en tiempo.tsx): un número es el índice de la palabra; un texto se busca
    # desde la palabra donde empieza la escena anterior (incluida)
    desdes = re.findall(r'\n      desde: (?:"([^"]+)"|(\d+))', ts_src)
    inicios = [0.0]
    k = 0
    for dsd, num in desdes:
        if num:
            k = min(int(num), len(pal) - 1)
            inicios.append(pal[k]["ini"])
            continue
        txt, _, vez = dsd.partition("#")
        veces = int(vez or 1)
        for i in range(k, len(pal)):
            if normal(pal[i]["p"]) == normal(txt):
                veces -= 1
                if veces == 0:
                    inicios.append(pal[i]["ini"])
                    k = i
                    break
    fin = props["duracion"]
    bordes = inicios + [fin]
    return [round((bordes[i] + bordes[i + 1]) / 2, 2) for i in range(len(inicios))]


def cmd_revisar(args):
    """Una foto del centro de cada escena, en una hoja (salida/revision-N.jpg). Tarda 1-2 minutos."""
    n, d = idea(args)
    props, pf, _ = preparar_props(n, args)
    segundos = tiempos_escenas(n, props)
    paquete = SALIDA / "paquete"
    print(f"Revisando la idea {n}: {len(segundos)} escenas…", flush=True)
    r = subprocess.run([npx(), "remotion", "bundle", "src/index.ts", f"--out-dir={paquete}", "--log=error"], cwd=RAIZ, env=entorno())
    if r.returncode != 0:
        fallo("No se ha podido preparar el proyecto (mira el error de arriba).")
    fotos = []
    procesos = []
    for i, seg in enumerate(segundos):
        out = SALIDA / f"rev-{n}-{i + 1}.png"
        fotos.append(out)
        procesos.append(subprocess.Popen([npx(), "remotion", "still", str(paquete), "video", str(out), f"--props={pf}", f"--frame={int(seg * 30)}", "--scale=0.5", "--log=error"], cwd=RAIZ, env=entorno()))
        if len(procesos) >= (4 if NUBE else 3):
            procesos.pop(0).wait()
    for p in procesos:
        p.wait()
    hoja = SALIDA / f"revision-{n}.jpg"
    columnas = 3
    entradas = []
    for f in fotos:
        entradas += ["-i", str(f)]
    filas = (len(fotos) + columnas - 1) // columnas
    capas = "".join(f"[{i}:v]scale=640:360[v{i}];" for i in range(len(fotos)))
    huecos = len(fotos)
    pos = "|".join(f"{(i % columnas) * 640}_{(i // columnas) * 360}" for i in range(huecos))
    filtro = capas + "".join(f"[v{i}]" for i in range(huecos)) + f"xstack=inputs={huecos}:layout={pos}:fill=white"
    if huecos == 1:
        filtro = "[0:v]scale=640:360"
    subprocess.run([ffmpeg(), "-v", "error", "-y", *entradas, "-filter_complex", filtro, str(hoja)], check=True)
    print(f"✓ Hoja de revisión: {hoja}  (variante {props['variante']}; {', '.join(f'{x}s' for x in segundos)})")


def cmd_todo(args):
    """Cuando llega la voz: la sincroniza y monta el vídeo final, sin pasos intermedios."""
    cmd_voz(args)
    cmd_montar([a for a in args if a != "--prueba"])


ORDENES = {"borrador": cmd_borrador, "revisar": cmd_revisar, "todo": cmd_todo, "comprobar": cmd_comprobar, "ideas": cmd_ideas, "guion": cmd_guion, "voz": cmd_voz, "prueba": cmd_prueba, "montar": cmd_montar, "foto": cmd_foto}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ORDENES:
        print(__doc__)
        sys.exit(1)
    ORDENES[sys.argv[1]](sys.argv[2:])
