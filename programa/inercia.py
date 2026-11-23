"""MOTOR DE CONTENIDO — INERCIA DEL CONSUMO (shorts de economía, dinero y consumo en español).

Flujo (todo automático salvo la voz):
  temas → guion (fórmula + auditoría ≥ 90) → voz del usuario → tiempos → decorado a medida → hoja de fotos aprobada →
  montaje en segundo plano → sonido con y sin música → subtítulos → 2 MP4 + ficha para publicar → medir a los 2 días.

Órdenes:  ./inercia instalar | comprobar | temas | guion nuevo N "Título" [--largo] | guion N | video N | voz N [voz.mp3]
          escena N | fotos N "30,140,…" | montar N | terminar N | publicar N | medir
"""
import datetime
import json
import os
import re
import shutil
import subprocess
import sys
import unicodedata
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from formula import (UMBRAL, auditar, frases, lineas_beat, modo_de, objetivo_palabras, PAL_POR_SEG,  # noqa: E402
                     texto_beat, tramos, tres_mas_debiles, validar, ficha_vacia)

RAIZ = Path(__file__).resolve().parent.parent
TEXTOS = RAIZ / "Textos"
DIB = RAIZ / "dibujos"
HERR = DIB / "herramientas"
VOZ_ENTRADA = RAIZ / "Pon aquí tu voz"
AJUSTES = json.loads((RAIZ / "ajustes.json").read_text(encoding="utf-8")) if (RAIZ / "ajustes.json").exists() else {}


def fallo(msg):
    print("✗ " + msg)
    sys.exit(1)


def slug(s):
    s = "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", "-", s).strip("-")[:48] or "video"


def fichas():
    out = {}
    for f in TEXTOS.glob("*.json"):
        m = re.match(r"(\d+)\s*-\s*(.+)\.json$", f.name)
        if m:
            fi = json.loads(f.read_text(encoding="utf-8"))
            if fi.get("formula") == "inercia":
                out[int(m.group(1))] = f
    return out


def cargar(n):
    fs = fichas()
    if n not in fs:
        fallo(f'No hay ficha {n} de Inercia del Consumo. Créala con:  ./inercia guion nuevo {n} "Título"')
    return fs[n], json.loads(fs[n].read_text(encoding="utf-8"))


def guardar(ruta, fi):
    ruta.write_text(json.dumps(fi, ensure_ascii=False, indent=2), encoding="utf-8")


def num(args, ejemplo):
    try:
        return int(args[0])
    except (IndexError, ValueError):
        fallo(f"Dime el número. Ejemplo:  ./inercia {ejemplo}")


def carpeta(fi, n):
    c = fi.get("carpeta")
    if not c:
        fallo(f"La ficha no tiene carpeta de vídeo. Créala con:  ./inercia video {n}")
    return RAIZ / c


def corre(cmd, cwd=None, check=True):
    print("  $ " + (cmd if isinstance(cmd, str) else " ".join(map(str, cmd))))
    r = subprocess.run(cmd, cwd=cwd, shell=isinstance(cmd, str))
    if check and r.returncode:
        fallo(f"Ha fallado (código {r.returncode}).")
    return r.returncode


# ----------------------------------------------------------------------------------------------------------------------
def cmd_instalar(_):
    """Deja el entorno listo (tras un reinicio de la nube o en un ordenador nuevo)."""
    corre(["bash", str(HERR / "instalar.sh")], check=False)


def cmd_comprobar(_):
    def linea(ok, txt):
        print(("  ✓ " if ok else "  ✗ ") + txt)
    linea(shutil.which("node") is not None, "node (three.js en Chromium)")
    linea(shutil.which("ffmpeg") is not None, "ffmpeg (montaje, −14 LUFS, revisión)")
    pw = subprocess.run(["npm", "root", "-g"], capture_output=True, text=True).stdout.strip()
    linea(Path(pw, "playwright").exists(), "playwright global (render de fotogramas)")
    for mod in ("numpy", "PIL", "faster_whisper"):
        linea(subprocess.run([sys.executable, "-c", f"import {mod}"], capture_output=True).returncode == 0, f"python: {mod}")
    linea((HERR / "fuentes" / "Inter-Black.otf").exists(), "fuente de subtítulos (Inter Black)")
    linea((DIB / "kit" / "example" / "soldier" / "stills.jpg").exists(), "referencia de calidad (romanos)")


def cmd_temas(_):
    f = TEXTOS / "temas.md"
    print(f.read_text(encoding="utf-8") if f.exists() else "Aún no hay temas apuntados (Textos/temas.md).")


# ----------------------------------------------------------------------------------------------------------------------
def entrega(fi, nota, desg):
    """La entrega del guion en el orden que pide el usuario: 1 estructurado, 2 auditoría, 3 limpio, 4 indicaciones, 5 fuentes."""
    nombres = {"hook": "HOOK", "promesa": "PROMESA", "climax": "CLÍMAX", "cta": "CTA"}
    out = [f"# {fi.get('titulo', '')}  ·  {('Short' if modo_de(fi) == 'short' else 'Vídeo largo')}", "", "## 1. Guion estructurado"]
    for k, _ in tramos(fi):
        t = texto_beat(fi.get(k, ""))
        if t:
            et = nombres.get(k) or re.sub(r"(\D+)(\d+)", lambda m: m.group(1).upper() + " " + m.group(2), k)
            out.append(f"**{et}** — {t}")
    out += ["", f"## 2. Auditoría final: {nota}/100 (mínimo {UMBRAL})"]
    for k, (p, m, ms) in desg.items():
        out.append(f"- {k}: {p}/{m}" + ("" if not ms else " — " + " | ".join(ms)))
    am = fi.get("auditoria_manual") or {}
    if am.get("notas"):
        out.append(f"- Lectura en voz alta (Claude): {am['notas']}")
    limpio = " ".join(texto_beat(fi.get(k, "")) for k, _ in tramos(fi) if texto_beat(fi.get(k, "")))
    n = len(limpio.split())
    out += ["", f"## 3. Guion limpio para locución ({n} palabras, ≈ {n / PAL_POR_SEG:.0f} s)", "```", limpio, "```", "",
            "## 4. Pausas, énfasis y ritmo"]
    ind = fi.get("indicaciones") or []
    out += [f"- {x}" for x in ind] or ["- (rellena «indicaciones» en la ficha)"]
    out += ["", "## 5. Fuentes consultadas"] + [f"- {x}" for x in (fi.get("fuentes") or [])]
    cif = [c for c in (fi.get("cifras") or []) if isinstance(c, dict) and c.get("cifra")]
    if cif:
        out += ["", "Cifras comprobadas:"] + [f"- {c['cifra']} → {c.get('fuente', '')}" for c in cif]
    return "\n".join(out) + "\n", limpio


def cmd_guion(args):
    if args and args[0] == "nuevo":
        n = num(args[1:], 'guion nuevo 1 "El truco del 0,99"')
        titulo = " ".join(a for a in args[2:] if not a.startswith("--")).strip() or "Sin título"
        f = TEXTOS / f"{n} - {titulo}.json"
        if f.exists() or n in fichas():
            fallo(f"Ya existe la ficha {n}.")
        TEXTOS.mkdir(exist_ok=True)
        guardar(f, ficha_vacia(titulo, "largo" if "--largo" in args else "short"))
        print(f"✓ Ficha creada: «Textos/{f.name}». Rellénala y luego:  ./inercia guion {n}")
        return
    n = num(args, "guion 1")
    ruta, fi = cargar(n)
    nota, desg, _ = auditar(fi)
    fallos, avisos = validar(fi)
    print(f"AUDITORÍA «{fi.get('titulo')}» ({modo_de(fi)}): {nota}/100 — mínimo {UMBRAL}")
    for k, (p, m, ms) in desg.items():
        print(f"  {k:12s} {p:2d}/{m}" + ("" if not ms else "  ← " + " | ".join(ms)))
    for a in avisos:
        print("  ⚠ " + a)
    if fallos and fi.get("prueba"):
        print("  ⚠ FICHA DE PRUEBA DEL MOTOR («prueba»: true): se escribe el guion aunque no pase (solo para probar el motor).")
        fallos = []
    if fallos:
        print("\nLOS TRES PUNTOS MÁS DÉBILES (corregir primero):")
        for k, ms in tres_mas_debiles(desg):
            print(f"  · {k}: {ms[0]}")
        for x in fallos:
            print("  ✗ " + x)
        fallo("El guion no pasa todavía (< 90 o le falta algo). Corrige y vuelve a auditar.")
    texto, limpio = entrega(fi, nota, desg)
    titulo = fi.get("titulo") or ruta.stem.split(" - ", 1)[1]
    (TEXTOS / f"{n} - {titulo}.txt").write_text(limpio + "\n", encoding="utf-8")
    (TEXTOS / f"{n} - {titulo}.entrega.md").write_text(texto, encoding="utf-8")
    if not (fi.get("auditoria_manual") or {}).get("leido_en_voz_alta"):
        print("  ⚠ Falta la auditoría manual: léelo en voz alta y apunta «auditoria_manual» en la ficha.")
    print(f"\n✓ Pasa ({nota}/100). Guion limpio: «Textos/{n} - {titulo}.txt». Entrega completa: «Textos/{n} - {titulo}.entrega.md».\n")
    print(texto)


# ----------------------------------------------------------------------------------------------------------------------
def cmd_video(args):
    """Crea la carpeta del vídeo desde la plantilla, con el guion aprobado y tiempos ESTIMADOS (hasta que llegue la voz)."""
    n = num(args, "video 1")
    ruta, fi = cargar(n)
    titulo = fi.get("titulo") or "video"
    txt = TEXTOS / f"{n} - {titulo}.txt"
    if not txt.exists():
        fallo(f"Primero aprueba el guion:  ./inercia guion {n}")
    dest = DIB / "videos" / f"{n}-{slug(titulo)}"
    if dest.exists():
        print(f"La carpeta ya existe: {dest.relative_to(RAIZ)} (no la toco).")
    else:
        shutil.copytree(DIB / "plantilla", dest, ignore=shutil.ignore_patterns("frames", "stills", "out", "node_modules", "lib", "toon.js", "toonbase.js"))
        shutil.copy(txt, dest / "script.txt")
        corre(["bash", str(HERR / "preparar.sh"), str(dest)])
        corre([sys.executable, str(HERR / "tiempos_estimados.py"), "script.txt"], cwd=dest)
        print(f"✓ Vídeo creado: {dest.relative_to(RAIZ)}. Ahora: decorado A MEDIDA en web/_world.js, ropa en web/roman.js, planos en web/story.js.")
    fi["carpeta"] = str(dest.relative_to(RAIZ))
    guardar(ruta, fi)


def cmd_voz(args):
    """Trae la voz del usuario, calcula los tiempos de cada palabra y avisa si no coincide con el guion o se pasa de duración."""
    n = num(args, "voz 1")
    ruta, fi = cargar(n)
    v = carpeta(fi, n)
    mp3 = Path(args[1]) if len(args) > 1 else None
    if not mp3:
        cand = sorted([p for p in VOZ_ENTRADA.glob("*") if p.suffix.lower() in (".mp3", ".wav", ".m4a")], key=lambda p: p.stat().st_mtime)
        if not cand and (v / "voice.mp3").exists():
            mp3 = v / "voice.mp3"
        elif not cand:
            fallo(f"No encuentro la voz. Déjala en «{VOZ_ENTRADA.name}/» o pásame la ruta:  ./inercia voz {n} ruta.mp3")
        else:
            mp3 = cand[-1]
    if mp3.resolve() != (v / "voice.mp3").resolve():
        corre(["ffmpeg", "-v", "error", "-y", "-i", str(mp3), "-ar", "44100", "-ac", "1", "-b:a", "192k", str(v / "voice.mp3")])
    dmax = float(fi.get("duracion_max_s") or (60 if modo_de(fi) == "short" else 1200))
    rc = corre([sys.executable, str(HERR / "tiempos_es.py"), "voice.mp3", "script.txt", "es", "--max", str(dmax)], cwd=v, check=False)
    corre([sys.executable, str(HERR / "boca.py"), "voice.mp3"], cwd=v)
    if rc:
        fallo("La voz no coincide con el guion o se pasa de duración (mira los avisos de arriba). Revísala antes de seguir.")
    print("✓ tiempos.json y web/tiempos.js listos: ata cada plano, cara y gesto a la palabra exacta en web/story.js.")


def comprobar_escena(n, fi, v=None, parar=True):
    """REGLA DEL USUARIO: espacios y personajes NO se repiten ni se inventan; solo salen si el guion los nombra.
    La ficha apunta en «escena» cada lugar y cada personaje con las PALABRAS del guion que lo justifican, y aquí se
    comprueba (1) que esas palabras están en el guion y (2) que story.js no usa ningún personaje que no esté apuntado."""
    from formula import sin_tildes
    guion = sin_tildes(" ".join(texto_beat(fi.get(k, "")) for k, _ in tramos(fi)))
    esc = fi.get("escena") or {}
    malos = []
    if not esc.get("lugares") or not esc.get("reparto"):
        malos.append('La ficha no tiene «escena»: {"lugares": {"tienda": ["tienda"]}, "reparto": {"clienta": ["pagas con tarjeta"]}} (cada uno con las palabras del guion que lo piden).')
    for tipo in ("lugares", "reparto"):
        for nombre, pals in (esc.get(tipo) or {}).items():
            falta = [p for p in pals if sin_tildes(p) not in guion]
            if not pals or falta:
                malos.append(f"{tipo[:-1] if tipo == 'lugares' else 'personaje'} «{nombre}»: el guion no dice {falta or '(ninguna palabra apuntada)'}. Si el guion no lo nombra, NO sale.")
    if v and (v / "web" / "story.js").exists():
        usados = set(re.findall(r"romanFront\(p,\s*'(\w+)'", (v / "web" / "story.js").read_text(encoding="utf-8")))
        for u in sorted(usados - set((esc.get("reparto") or {}).keys())):
            malos.append(f"story.js saca a «{u}», que no está en «escena.reparto» con palabras del guion: quítalo.")
    if malos:
        print("✗ ESCENA (espacios y personajes solo si el guion los nombra):")
        for m in malos:
            print("  · " + m)
        if parar:
            fallo("Corrige la escena antes de seguir.")
    else:
        print("✓ Escena: cada lugar y cada personaje sale del guion.")
    return not malos


def cmd_escena(args):
    n = num(args, "escena 1")
    _, fi = cargar(n)
    comprobar_escena(n, fi, RAIZ / fi["carpeta"] if fi.get("carpeta") else None)


def cmd_fotos(args):
    """Hoja de fotos (con subtítulos) y comparación lado a lado con los romanos."""
    n = num(args, 'fotos 1 "30,140,260"')
    _, fi = cargar(n)
    v = carpeta(fi, n)
    fr = args[1] if len(args) > 1 else "30,200,400,600"
    comprobar_escena(n, fi, v)
    corre(["bash", "rebuild.sh"], cwd=v)
    shutil.rmtree(v / "stills" / "a", ignore_errors=True); shutil.rmtree(v / "stills" / "a_sub", ignore_errors=True)
    corre(["node", "render.mjs", "stills/a", fr], cwd=v)
    corre([sys.executable, str(HERR / "subtitulos.py"), "stills/a", "stills/a_sub"], cwd=v)
    corre([sys.executable, str(HERR / "comparar.py"), "stills/a_sub", "stills/hoja.jpg"], cwd=v)
    print(f"✓ {v.relative_to(RAIZ)}/stills/hoja.jpg — REVÍSALA tú (textos cortados, personaje fuera de plano, cámara metida en algo,"
          " subtítulo sobre una cara, algo en pantalla que no diga el guion) antes de enseñarla.")


def cmd_montar(args):
    n = num(args, "montar 1")
    _, fi = cargar(n)
    v = carpeta(fi, n)
    comprobar_escena(n, fi, v)
    corre(["bash", "rebuild.sh"], cwd=v)
    total = json.loads(subprocess.run(["node", str(HERR / "cortes.mjs")], cwd=v, capture_output=True, text=True, check=True).stdout.strip().splitlines()[-1])["TOTAL"]
    corre(["bash", "rebuild.sh"], cwd=v)
    (v / "out").mkdir(exist_ok=True)
    # AHORRO: si el código del vídeo no cambió, se reanuda (solo los fotogramas que falten); si cambió después de montar,
    # se borran solo los fotogramas más viejos que el código (si no, saldrían planos desfasados)
    fr = sorted((v / "frames").glob("f*.jpg")) if (v / "frames").exists() else []
    if fr:
        hechos = {"main.js", "toon.js", "toonbase.js", "gestos.js"}  # los genera rebuild.sh: no cuentan como cambio
        codigo = max(p.stat().st_mtime for p in [*(v / "web").glob("*.js"), v / "tiempos.json"] if p.exists() and p.name not in hechos)
        viejos = [p for p in fr if p.stat().st_mtime < codigo]
        if viejos:
            for p in viejos:
                p.unlink()
            print(f"  · {len(viejos)} fotogramas eran de una versión anterior del vídeo: se rehacen. Los demás se reutilizan.")
        else:
            print(f"  · {len(fr)} fotogramas ya hechos con el código actual: se reutilizan (solo se monta lo que falte).")
    # montaje EN PARALELO y reanudable (montar.sh, de Citrino): si se corta, se vuelve a lanzar igual
    subprocess.Popen(f"nohup bash {HERR / 'montar.sh'} 0-{total - 1} > out/render.log 2>&1 &", cwd=v, shell=True).wait()
    print(f"✓ Montaje en paralelo en segundo plano: {total} fotogramas. Progreso: ls {v.relative_to(RAIZ)}/frames | wc -l · registro: out/render.log")


def cmd_terminar(args):
    """Sonido (con y sin música), subtítulos y los dos MP4, con revisión automática y hoja final."""
    n = num(args, "terminar 1")
    _, fi = cargar(n)
    v = carpeta(fi, n)
    titulo = fi.get("titulo") or "short"
    corre([sys.executable, "audio.py"], cwd=v)
    corre([sys.executable, str(HERR / "mix.py"), "voice.mp3", "music.wav", "sfx.wav", "out/mix.wav"], cwd=v)
    corre([sys.executable, str(HERR / "mix.py"), "voice.mp3", "-", "sfx.wav", "out/mix_sin_musica.wav"], cwd=v)
    subs = fi.get("subtitulos", True)
    frames = "frames"
    if subs:
        corre([sys.executable, str(HERR / "subtitulos.py"), "frames", "frames_sub"], cwd=v)
        frames = "frames_sub"
    env = f"FRAMES={frames} "
    corre(env + f'bash {HERR / "terminar.sh"} "{titulo}"', cwd=v)   # una sola codificación de imagen para los dos MP4
    print(f"✓ Dos MP4 en {v.relative_to(RAIZ)}/out/. REVISA out/hoja_final.jpg antes de enviar. Después:  ./inercia publicar {n}")


def cmd_publicar(args):
    n = num(args, "publicar 1")
    ruta, fi = cargar(n)
    v = carpeta(fi, n)
    f = v / "publicar.md"
    if not f.exists():
        tags = AJUSTES.get("hashtags", "#InerciaDelConsumo #Economia #Dinero #Shorts")
        f.write_text(f"""# Publicar — {fi.get('titulo')} (Inercia del Consumo)

## Título
{fi.get('titulo')}

## Descripción
(gancho en 1 línea) 👇

Datos reales:
• {fi.get('dato', '')}

{tags}

## Etiquetas
(15-20, separadas por comas, en español)

## Comentario fijado
(pregunta que invite a comentar, ligada a SU dinero)

## Ajustes
- Categoría: Educación · Idioma: Español
- Audiencia: no es para niños · Contenido alterado/sintético: no (animación)
- Miniatura del Short: (fotograma)

## Hora recomendada
Público de España y Latinoamérica: publicar entre las 18:00 y las 19:00 de España (12:00-13:00 de México, 14:00-15:00 de
Argentina): llega a España por la tarde y a América a mediodía. Martes a jueves suelen ir mejor que el fin de semana.
(Se ajusta con los datos del canal en docs/RESULTADOS.md cuando haya 3-5 vídeos medidos.)

## Subtítulos para YouTube
Subir out/subtitulos.srt (Subtítulos → Español → Subir archivo → Con tiempos).

## Fuentes
""" + "\n".join(f"- {x}" for x in fi.get("fuentes", [])) + "\n", encoding="utf-8")
        print(f"✓ Plantilla de {f.relative_to(RAIZ)}: rellénala y envíala en bloques para copiar.")
    if fi.get("prueba"):
        print("Ficha de prueba del motor: no se apunta como publicada.")
        return
    fi["publicado"] = fi.get("publicado") or datetime.date.today().isoformat()
    guardar(ruta, fi)
    res = RAIZ / "docs" / "RESULTADOS.md"
    if res.exists() and not fi.get("prueba") and fi.get("titulo") and fi["titulo"] not in res.read_text(encoding="utf-8"):
        with res.open("a", encoding="utf-8") as fh:
            fh.write(f"| {fi['publicado']} | {fi['titulo']} | | | | | | | |\n")
    print(f"Apuntado: publicado el {fi['publicado']} (fila en docs/RESULTADOS.md). A los 2 días, pedir la captura de YouTube Studio (Participación).")


def cmd_medir(_):
    hoy = datetime.date.today()
    nada = True
    for n, ruta in sorted(fichas().items()):
        fi = json.loads(ruta.read_text(encoding="utf-8"))
        if fi.get("publicado") and not fi.get("medicion"):
            dias = (hoy - datetime.date.fromisoformat(fi["publicado"])).days
            nada = False
            print(f"  {n} «{fi.get('titulo')}»: publicado hace {dias} días" + ("  → PEDIR captura de YouTube Studio (Participación)" if dias >= 2 else ""))
    if nada:
        print("Nada pendiente de medir.")


ORDENES = {"instalar": cmd_instalar, "comprobar": cmd_comprobar, "temas": cmd_temas, "guion": cmd_guion, "video": cmd_video, "voz": cmd_voz,
           "escena": cmd_escena, "fotos": cmd_fotos, "montar": cmd_montar, "terminar": cmd_terminar, "publicar": cmd_publicar, "medir": cmd_medir}

if __name__ == "__main__":
    if len(sys.argv) < 2 or sys.argv[1] not in ORDENES:
        print(__doc__)
        sys.exit(0)
    ORDENES[sys.argv[1]](sys.argv[2:])
