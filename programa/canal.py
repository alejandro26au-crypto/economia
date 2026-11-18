#!/usr/bin/env python3
"""Canal de economía: el programa que hace los vídeos.

    canal comprobar                 ¿está todo instalado?
    canal ideas                     lista de ideas con su guion
    canal guion nuevo N "Título"    crea la ficha de la fórmula viral (Textos/N - Título.json) para rellenarla
    canal guion N                   comprueba la ficha con la fórmula, escribe el guion (.txt) y, si no
                                     existe, un borrador de escenas en src/ideas/N.ts
    canal voz N                     coge el audio más nuevo de «Pon aquí tu voz», lo nivela y apunta cuándo dice cada palabra
    canal prueba N                  prepara tiempos de mentira (sin voz) para ver el vídeo antes de grabar
    canal montar N [--variante S | --nueva] [--prueba] [--rapido]
                                     hace el short N y lo deja en «Vídeos listos» con su .txt para subirlo.
                                     Usa la variante guardada de la idea (la misma que la hoja); --nueva sortea otra.
                                     --prueba usa los tiempos de mentira; --rapido lo hace a media resolución
    canal foto N SEGUNDO [--prueba] saca un fotograma (PNG) para revisar cómo queda
    canal revisar N [--prueba]      una foto de cada escena en una sola hoja (1-2 min): revisar antes de montar
    canal todo N                    voz + montar seguidos (cuando el MP3 ya está en «Pon aquí tu voz»)

N es el número de la idea: el guion está en «Textos/N - Título.txt» y las escenas en «src/ideas/N.ts».
"""
import difflib
import json
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

    modelo = WhisperModel(os.environ.get("OCEANO_WHISPER", "small"), device="cpu", compute_type="int8")
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
    "sonar": ("0.45*sin(2*PI*1180*t)*exp(-2.2*t)*min(1,t*60)", 1.4, "aecho=0.8:0.7:300:0.3"),
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


# ---------------------------------------------------------------- generador de guiones (la fórmula)
TRAMOS = [
    ("gancho", "GANCHO raro y sin explicar (1-2 frases). Nada de 'because': que el espectador no entienda todavía."),
    ("rival", "RIVAL PODEROSO: alguien o algo grande que va contra el héroe (un rey, una flota, el mayor depredador)."),
    ("burlas", "BURLAS Y APODO: se ríen del héroe y le ponen un apodo (escríbelo también en 'apodo')."),
    ("pista_falsa", "PISTA FALSA: la explicación equivocada que todos creen."),
    ("raro", "TRES frases que escalan: 'Then something weird happened.' / 'Then it got weirder.' / 'Then the weirdest part.'"),
    ("giro", "GIRO: la verdad, en pocas palabras y con sorpresa."),
    ("ciencia", "CIENCIA ESCONDIDA: el porqué real, con un dato concreto y comprobado (cifras en número)."),
    ("final", "FINAL QUE HACE LOOP: frase seca que se queda a medias y se completa con la primera frase del gancho."),
]
PALABRAS_OBJETIVO = (150, 180)  # ~60 s de voz
ESCENARIO_DEFECTO = {"gancho": "barco", "rival": "palacio", "burlas": "barco", "pista_falsa": "barco", "raro": "naufragio", "giro": "laboratorio", "ciencia": "arrecife", "final": "barco"}
REPARTO_DEFECTO = [{"tipo": "bent", "nombre": "heroe"}, {"tipo": "capitan", "nombre": "capi"}, {"tipo": "marinero", "nombre": "risas"}]


def fichas():
    out = {}
    for f in sorted(TEXTOS.glob("*.json")):
        m = re.match(r"(\d+)\s*-\s*(.+)\.json$", f.name)
        if m:
            out[int(m.group(1))] = f
    return out


def texto_ficha(fi):
    """Los 8 tramos de la fórmula en orden (los tres 'raro' juntos)."""
    out = []
    for k, _ in TRAMOS:
        v = fi.get(k, "")
        out.append(" ".join(v) if isinstance(v, list) else str(v))
    return [p.strip() for p in out]


def revisar_ficha(fi):
    """Comprueba la ficha con la fórmula. Devuelve (fallos, avisos)."""
    fallos, avisos = [], []
    for k, ayuda in TRAMOS:
        v = fi.get(k)
        if not v or (isinstance(v, list) and not all(str(x).strip() for x in v)):
            fallos.append(f"Falta «{k}»: {ayuda}")
    raro = fi.get("raro", [])
    if not isinstance(raro, list) or len(raro) != 3:
        fallos.append("«raro» tiene que ser una lista de TRES frases que van a más (escalada x3).")
    elif not re.search(r"something weird happen", raro[0], re.I):
        fallos.append("La 1ª frase de «raro» tiene que decir «Then something weird happened».")
    elif not all(re.search(r"weird", r, re.I) for r in raro):
        avisos.append("Mejor si las 3 frases de «raro» dicen weird / weirder / weirdest (suena el efecto «raro» en cada una).")
    apodo = fi.get("apodo", "").strip()
    if not apodo:
        fallos.append("Falta «apodo»: el mote que le ponen al héroe.")
    elif apodo.lower() not in fi.get("burlas", "").lower():
        fallos.append(f"El apodo «{apodo}» tiene que salir en «burlas».")
    gancho = fi.get("gancho", "")
    if len(gancho.split()) > 22:
        avisos.append("El gancho es largo: que quepa en 2-4 segundos (20 palabras como mucho).")
    if re.search(r"\b(because|that's why|the reason)\b", gancho, re.I):
        fallos.append("El gancho explica demasiado: quita el «because/that's why». El misterio se resuelve en el giro.")
    final = fi.get("final", "").strip()
    # formato fijo (18 nov 2026): el final cierra con «Now you know.»
    if not re.search(r"now you know\.?$", final, re.I):
        avisos.append("El final debe cerrar con «Now you know.» (formato fijo del canal).")
    ciencia = fi.get("ciencia", "")
    if not re.search(r"\d", ciencia) and not re.search(r"\b(hotter|faster|bigger|longer|older|times|nearly|almost)\b", ciencia, re.I):
        avisos.append("La ciencia no tiene ninguna cifra ni comparación: un dato concreto engancha más.")
    if not fi.get("fuentes"):
        fallos.append("Faltan «fuentes»: cada dato tiene que estar comprobado (artículo científico, NOAA, museo…).")
    n = sum(len(p.split()) for p in texto_ficha(fi))
    if not PALABRAS_OBJETIVO[0] <= n <= PALABRAS_OBJETIVO[1]:
        avisos.append(f"El guion tiene {n} palabras; para ~60 s apunta a {PALABRAS_OBJETIVO[0]}-{PALABRAS_OBJETIVO[1]}.")
    return fallos, avisos


def borrador_ts(n, fi):
    """Escenas de borrador: una por tramo de la fórmula; cada una empieza en la primera palabra de su tramo."""
    tramos = texto_ficha(fi)
    norm = [normal(w) for w in " ".join(tramos).split()]
    esc = fi.get("escenarios", {})
    reparto = fi.get("reparto") or REPARTO_DEFECTO
    bloques, pos, base = [], 0, 0
    for (clave, _), texto in zip(TRAMOS, tramos):
        trozos = texto.split()
        lineas = [f"    // {clave}: {texto[:70]}", "    {"]
        if pos > 0 and trozos:
            primera = normal(trozos[0])
            vez = sum(1 for w in norm[base : pos + 1] if w == primera)
            lineas.append(f'      desde: "{trozos[0].strip(".,!?;:")}{"#" + str(vez) if vez > 1 else ""}",')
            base = pos
        lineas.append(f'      escenario: "{esc.get(clave, ESCENARIO_DEFECTO[clave])}",')
        lineas.append("      actores: [")
        for i, a in enumerate(reparto):
            x = 0.3 + 0.4 * i / max(1, len(reparto) - 1)
            lineas.append(f'        {{ tipo: "{a["tipo"]}", nombre: "{a.get("nombre", a["tipo"])}", x: {x:.2f}, z: 0.4 }},')
        lineas += ["      ],", "    },"]
        bloques.append("\n".join(lineas))
        pos += len(trozos)
    cab = f"// Borrador hecho por «canal guion {n}». Ajusta escenarios, personajes, acciones y planos.\n"
    cab += 'import { Idea } from "../motor/tipos";\n\n'
    return cab + f"export const idea{n}: Idea = {{\n  n: {n},\n  titulo: {json.dumps(fi.get('titulo', ''))},\n  escenas: [\n" + "\n".join(bloques) + "\n  ],\n};\n"


def cmd_guion(args):
    if args and args[0] == "nuevo":
        try:
            n = int(args[1])
        except (IndexError, ValueError):
            fallo('Ejemplo:  canal guion nuevo 1 "The Whale With a Harpoon"')
        titulo = " ".join(args[2:]).strip() or "Sin titulo"
        f = TEXTOS / f"{n} - {titulo}.json"
        if f.exists():
            fallo(f"Ya existe «{f.name}».")
        ficha = {"titulo": titulo, "dato": "", "fuentes": [], "apodo": "", "reparto": REPARTO_DEFECTO, "escenarios": dict(ESCENARIO_DEFECTO)}
        for k, ayuda in TRAMOS:
            ficha[k] = ["Then something weird happened. ", "Then it got weirder. ", "Then the weirdest part. "] if k == "raro" else ""
            ficha["_ayuda_" + k] = ayuda
        TEXTOS.mkdir(exist_ok=True)
        f.write_text(json.dumps(ficha, ensure_ascii=False, indent=2), encoding="utf-8")
        print(f"✓ Ficha creada: «Textos/{f.name}». Rellénala (en español) y luego:  canal guion {n}")
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
        fallo("La ficha no cumple la fórmula todavía.")
    guion = "\n".join(texto_ficha(fi))
    titulo = fi.get("titulo") or re.match(r"\d+\s*-\s*(.+)\.json$", fs[n].name).group(1)
    for viejo in TEXTOS.glob(f"{n} - *.txt"):
        viejo.unlink()
    (TEXTOS / f"{n} - {titulo}.txt").write_text(guion + "\n", encoding="utf-8")
    palabras = len(guion.split())
    print(f"✓ Guion escrito: «Textos/{n} - {titulo}.txt» ({palabras} palabras, unos {palabras / 2.8:.0f} s).")
    ts = RAIZ / "src" / "ideas" / f"{n}.ts"
    if not ts.exists():
        ts.write_text(borrador_ts(n, fi), encoding="utf-8")
        print(f"✓ Borrador de escenas: src/ideas/{n}.ts (apúntalo en src/ideas/lista.ts).")
    print("\n" + guion)


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


def chequear_planos(n, pf):
    """Avisa de planos con la cámara metida en un objeto o con el personaje fuera del encuadre (medio segundo)."""
    js = SALIDA / "chequeo.js"
    r = subprocess.run([npx(), "esbuild", "programa/chequeo.ts", "--bundle", "--platform=node", f"--outfile={js}", "--log-level=error"], cwd=RAIZ, env=entorno())
    if r.returncode == 0:
        subprocess.run(["node", str(js), str(pf)], cwd=RAIZ, env=entorno())


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


def cmd_montar(args):
    n, d = idea(args)
    props, pf, musica = preparar_props(n, args)
    v = props["variante"]
    bruto = SALIDA / f"short-{n}.mp4"
    registro = SALIDA / f"short-{n}.log"
    print(f"Haciendo el short {n} «{d['titulo']}» (variante {v})… suele tardar entre 1 y 10 minutos.", flush=True)
    inicio = time.time()
    hilos = "100%" if NUBE else "50%"  # en la nube no hay gráfica: todos los núcleos dibujan
    orden = [npx(), "remotion", "render", "src/index.ts", "short", str(bruto), f"--props={pf}", f"--concurrency={hilos}", "--crf=20", "--x264-preset=veryfast", "--log=error"]
    if "--rapido" in args:
        orden.append("--scale=0.5")
    with open(registro, "w", encoding="utf-8") as reg:
        r = subprocess.run(orden, cwd=RAIZ, stdout=reg, stderr=subprocess.STDOUT, env=entorno())
    if r.returncode != 0 or not bruto.exists():
        fallo(f"El motor no ha podido hacer el vídeo. Mira salida/short-{n}.log\n" + registro.read_text(encoding="utf-8")[-1500:])
    LISTOS.mkdir(exist_ok=True)
    final = LISTOS / f"{n} - {d['titulo']} ({v}){' PRUEBA' if '--prueba' in args else ''}.mp4"
    # volumen de YouTube (−14 LUFS) sin volver a comprimir la imagen
    subprocess.run([ffmpeg(), "-v", "error", "-y", "-i", str(bruto), "-c:v", "copy", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", str(final)], check=True)
    primera = re.split(r"(?<=[.!?])\s", d["guion"])[0]
    tags = TAGS
    for fi in TEXTOS.glob(f"{n} - *.json"):
        tags = json.loads(fi.read_text(encoding="utf-8")).get("hashtags", TAGS)
    txt = f"{d['titulo']}\n\n{primera}\n\n{tags}\n"
    if musica:
        txt += f"\nMúsica: {musica} (pon aquí su crédito si su licencia lo pide)\n"
    final.with_suffix(".txt").write_text(txt, encoding="utf-8")
    print(f"✓ Short listo en {time.time() - inicio:.0f} s: «{LISTOS.name}/{final.name}»")


def cmd_foto(args):
    n, _ = idea(args)
    try:
        seg = float(args[1])
    except (IndexError, ValueError):
        fallo("Dime el segundo. Ejemplo:  canal foto 1 3.5")
    props, pf, _ = preparar_props(n, args)
    out = SALIDA / f"foto-{n}-{seg:g}s.png"
    r = subprocess.run([npx(), "remotion", "still", "src/index.ts", "short", str(out), f"--props={pf}", f"--frame={int(seg * 30)}", "--log=error"], cwd=RAIZ, env=entorno())
    if r.returncode != 0:
        fallo("No se ha podido sacar la foto (mira el error de arriba).")
    print(f"✓ {out}")


def tiempos_escenas(n, props):
    """Segundo central de cada escena (según la palabra «desde» de cada una)."""
    pal = props["palabras"]
    ts_src = (RAIZ / "src" / "ideas" / f"{n}.ts").read_text(encoding="utf-8")
    # igual que el montaje (indicePalabra en tiempo.tsx): un número es el índice de la palabra; un texto se busca
    # desde la palabra donde empieza la escena anterior (incluida)
    desdes = re.findall(r'\n    \{\n      desde: (?:"([^"]+)"|(\d+))', ts_src)
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
        procesos.append(subprocess.Popen([npx(), "remotion", "still", str(paquete), "short", str(out), f"--props={pf}", f"--frame={int(seg * 30)}", "--scale=0.5", "--log=error"], cwd=RAIZ, env=entorno()))
        if len(procesos) >= (4 if NUBE else 3):
            procesos.pop(0).wait()
    for p in procesos:
        p.wait()
    hoja = SALIDA / f"revision-{n}.jpg"
    columnas = 4
    entradas = []
    for f in fotos:
        entradas += ["-i", str(f)]
    filas = (len(fotos) + columnas - 1) // columnas
    capas = "".join(f"[{i}:v]scale=405:720[v{i}];" for i in range(len(fotos)))
    huecos = len(fotos)
    pos = "|".join(f"{(i % columnas) * 405}_{(i // columnas) * 720}" for i in range(huecos))
    filtro = capas + "".join(f"[v{i}]" for i in range(huecos)) + f"xstack=inputs={huecos}:layout={pos}:fill=white"
    if huecos == 1:
        filtro = "[0:v]scale=405:720"
    subprocess.run([ffmpeg(), "-v", "error", "-y", *entradas, "-filter_complex", filtro, str(hoja)], check=True)
    print(f"✓ Hoja de revisión: {hoja}  (variante {props['variante']}; {', '.join(f'{x}s' for x in segundos)})")
    chequear_planos(n, pf)


def cmd_todo(args):
    """Cuando llega la voz: la sincroniza y monta el vídeo final, sin pasos intermedios."""
    cmd_voz(args)
    cmd_montar([a for a in args if a != "--prueba"])


ORDENES = {"revisar": cmd_revisar, "todo": cmd_todo, "comprobar": cmd_comprobar, "ideas": cmd_ideas, "guion": cmd_guion, "voz": cmd_voz, "prueba": cmd_prueba, "montar": cmd_montar, "foto": cmd_foto}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ORDENES:
        print(__doc__)
        sys.exit(1)
    ORDENES[sys.argv[1]](sys.argv[2:])
