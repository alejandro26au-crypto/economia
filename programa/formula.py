"""FÓRMULA DE GUIONES — «MOTOR DE GUIONES Y RETENCIÓN — INERCIA DEL CONSUMO» (prompt del usuario, 20 nov 2026).

Storytelling, divulgación y retención narrativa progresiva. Modelo: `auditar_misterio` del repo del océano, pero en
español y con DOS MODOS:
  - "short": YouTube Shorts (una historia central, primera recompensa temprana, ritmo ágil, bucles conectados,
    clímax contundente, sin información secundaria). 2 ciclos de recompensa/bucle (+1 opcional).
  - "largo": vídeos largos (más profundidad, varios ciclos de recompensa y anticipación, microganchos entre bloques,
    ejemplos y cambios de perspectiva, progresión global). De 3 a 10 ciclos.

ESTRUCTURA (columna vertebral, no jaula):
  1 HOOK · 2 PROMESA · 3 RECOMPENSA 1 · 4 BUCLE 1 · 5 RECOMPENSA 2 · 6 BUCLE 2 · (recompensa 3… / bucle 3…) ·
  7 CLÍMAX · 8 CTA breve y natural.

AUDITORÍA: nota sobre 100 por apartados (gancho 15, promesa 10, recompensas 15, bucles 15, clímax 15, ritmo 15,
CTA 5, datos 10). Con menos de 90 NO pasa: se corrigen los tres puntos más débiles y se vuelve a auditar.
La nota automática es una AYUDA: Claude también audita leyendo el guion en voz alta y verifica cada cifra.

Ficha: Textos/N - Título.json  (la crea `./inercia guion nuevo N "Título"`; `--largo` para el modo largo).
Campos: titulo, modo, duracion_s, dato, fuentes, cifras [{cifra, fuente}], hipotesis, tramos (hook…cta),
indicaciones (pausas, énfasis y ritmo), auditoria_manual (lo que vio Claude al leerlo en voz alta).
"""
import re
import unicodedata

UMBRAL = 90
PUNTOS = {"gancho": 15, "promesa": 10, "recompensas": 15, "bucles": 15, "climax": 15, "ritmo": 15, "cta": 5, "datos": 10}
# palabras por segundo de una voz de ElevenLabs en español con tono efusivo (medido en el short del cangrejo: 2,6-2,9)
PAL_POR_SEG = 2.7
MODOS = {
    #        ciclos mín/máx, opcionales, duración por defecto (s), máx. palabras por frase, máx. palabras del CTA
    "short": {"ciclos": (2, 3), "duracion": 50, "frase": 16, "cta": 14, "hook": 10},
    "largo": {"ciclos": (3, 10), "duracion": 600, "frase": 24, "cta": 30, "hook": 14},
}

AYUDA = {
    "hook": "HOOK: contradicción, dato o afirmación que choca con lo que el espectador cree saber. Primera frase corta "
            "(≤ 10 palabras en Short), sin «¿Sabías que…?» ni saludos.",
    "promesa": "PROMESA: anticipa QUÉ mecanismo, realidad o explicación va a descubrir («Al final vas a entender por qué…»), sin desvelarlo.",
    "recompensa": "RECOMPENSA: explicación relevante, concreta (cifra, fecha, lugar, precio) y con un ejemplo de la vida del espectador "
                  "(su sueldo, su súper, su alquiler, su banco).",
    "bucle": "BUCLE: abre una incógnita nueva ligada al mecanismo («Pero hay algo que no cuadra…», «¿Y quién gana con esto?») "
             "y sube la expectativa hacia la revelación.",
    "climax": "CLÍMAX: conecta las ideas, revela el MECANISMO principal y resuelve TODAS las incógnitas abiertas.",
    "cta": "CTA: cierre breve y natural (pregunta al espectador o frase que enlaza con el hook). Nada de «suscríbete y dale like».",
}

APERTURAS = r"^\W*(sab[ií]as que|hola|buenas|bienvenid|en este v[ií]deo|hoy (te )?(vamos|voy|vengo)|alguna vez te has preguntado|te has preguntado)"
_PROMESA = (r"\b(vas a|ver[aá]s|descubrir[aá]s|entender[aá]s|al final|te (lo )?(explico|cuento|enseño)|aqu[ií] (est[aá]|tienes)|"
            r"la respuesta|por qu[eé]|c[oó]mo|qu[eé] pasa|lo que nadie|qu[eé]date|en (los )?pr[oó]ximos|antes de que acabe)\b")
_ABRE = (r"(\?|¿|\b(pero|sin embargo|aun as[ií]|nadie|hasta que|excepto|qu[eé]|por qu[eé]|c[oó]mo|qui[eé]n|algo|alguien|"
         r"la pregunta|misterio|extraño|raro|truco|trampa|secreto|no cuadra|falta algo|todav[ií]a)\b)")
_SUBE = (r"\b(ni siquiera|lo peor|lo m[aá]s (raro|loco|grave|incre[ií]ble|importante)|la verdadera (raz[oó]n|respuesta|trampa|causa)|"
         r"la verdad|(a[uú]n|todav[ií]a) es peor|no es lo peor|ah[ií] es cuando|y entonces|pero espera|y aqu[ií] viene|cambia todo)\b")
_REVELA = (r"\b(resulta que|la (respuesta|raz[oó]n|verdad|clave|trampa|causa) (es|era|est[aá])|porque|por eso|en realidad|"
           r"el truco (es|est[aá])|la explicaci[oó]n|lo que de verdad|as[ií] funciona|se llama|el nombre es)\b")
_RELLENO = r"\b(b[aá]sicamente|literalmente|realmente|o sea|digamos|en plan|simplemente|la verdad es que|un poco|bastante)\b"
_HIPOTESIS = (r"\b(puede|podr[ií]a|quiz[aá]s?|probablemente|seg[uú]n algunos|se cree|los economistas (creen|piensan|discuten|no se ponen)|"
              r"una teor[ií]a|no est[aá] claro|se estima|alrededor de|cerca de|unos|unas)\b")
_CONECTA = r"\b(pues|incluso|pero|por eso|as[ií] que|entonces|y eso|eso|esto|esa|ese|en realidad|de hecho|o sea|es decir|sin embargo|y no solo)\b"
_TU = r"\b(t[uú]|tus?|te|ti|contigo|usted|su sueldo|vos)\b"
_DINERO = r"(\d|€|\$|\b(euros?|d[oó]lares?|pesos?|c[eé]ntimos?|centavos?|precio|sueldo|salario|alquiler|hipoteca|inter[eé]s|inflaci[oó]n|deuda|ahorro|banco|tarjeta)\b)"
_NUM = r"\d|\b(uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|once|doce|quince|veinte|treinta|cuarenta|cincuenta|cien|ciento|mil|mill[oó]n|millones|mitad|doble|triple)\b"
_CTA_MALO = r"\b(suscr[ií]bete|dale (a )?like|dale me gusta|activa la campan|comparte este v[ií]deo|no olvides)\b"
VACIAS = set("""a al algo ante antes así aquí bien cada como cómo con contra cual cuando de del desde donde dos el ella ellos en
entonces era eres es esa ese eso esta este esto estos está están fue ha hace hacia han hasta hay la las le les lo los más
me mi mis muy nada ni no nos o otra otro para pero por porque que qué se sea ser si sí sin sobre son su sus también te
tiene todo tu tus tú un una uno unos y ya yo él este vas van va ver qué cómo quién""".split())

_NUMEROS_PAL = {"uno": 1, "una": 1, "dos": 2, "tres": 3, "cuatro": 4, "cinco": 5, "seis": 6, "siete": 7, "ocho": 8,
                "nueve": 9, "diez": 10, "once": 11, "doce": 12, "quince": 15, "veinte": 20, "treinta": 30, "cuarenta": 40,
                "cincuenta": 50, "cien": 100, "mil": 1000}


def quitar_etiquetas(t):
    """Quita las etiquetas de Eleven v3 ([emocionado], [susurra]…) y deja el texto que se oye."""
    return re.sub(r"\s+", " ", re.sub(r"\[[^\]]*\]", " ", t)).strip()


def texto_beat(v):
    """Texto hablado de un tramo: cadena, lista de cadenas o lista de líneas {voz, texto} (doblaje)."""
    if isinstance(v, list):
        return " ".join(quitar_etiquetas(x["texto"] if isinstance(x, dict) else str(x)) for x in v)
    return quitar_etiquetas(str(v or ""))


def lineas_beat(v, defecto="narrador"):
    if isinstance(v, list):
        return [(x.get("voz", defecto), x["texto"]) if isinstance(x, dict) else (defecto, str(x)) for x in v]
    return [(defecto, str(v))] if str(v or "").strip() else []


def sin_tildes(s):
    return "".join(c for c in unicodedata.normalize("NFD", s.lower()) if unicodedata.category(c) != "Mn")


def palabras_clave(t):
    return {w for w in re.sub(r"[^a-zñ0-9 ]", " ", sin_tildes(t)).split() if len(w) > 3 and w not in {sin_tildes(v) for v in VACIAS}}


def frases(t):
    return [f for f in re.split(r"(?<=[.!?…])\s+", t.strip()) if f]


def modo_de(fi):
    return "largo" if fi.get("modo") == "largo" else "short"


def ciclos_de(fi):
    """Número de ciclos recompensa/bucle que tiene la ficha (recompensa1…recompensaN)."""
    n = 0
    while f"recompensa{n + 1}" in fi or f"bucle{n + 1}" in fi:
        n += 1
    return n


def tramos(fi):
    """Lista ordenada de (clave, ayuda) según el modo y los ciclos de la ficha."""
    m = MODOS[modo_de(fi)]
    n = max(ciclos_de(fi), m["ciclos"][0])
    out = [("hook", AYUDA["hook"]), ("promesa", AYUDA["promesa"])]
    for i in range(1, n + 1):
        opc = " (OPCIONAL: solo si la historia lo pide)" if i > m["ciclos"][0] else ""
        out.append((f"recompensa{i}", f"RECOMPENSA {i}{opc}: " + AYUDA["recompensa"].split(": ", 1)[1]))
        out.append((f"bucle{i}", f"BUCLE {i}{opc}: " + AYUDA["bucle"].split(": ", 1)[1] + (" En vídeo largo: microgancho hacia el bloque siguiente." if modo_de(fi) == "largo" else "")))
    out += [("climax", AYUDA["climax"]), ("cta", AYUDA["cta"])]
    return out


def texto_guion(fi):
    return [texto_beat(fi.get(k, "")) for k, _ in tramos(fi)]


def objetivo_palabras(fi):
    d = float(fi.get("duracion_s") or MODOS[modo_de(fi)]["duracion"])
    return int(d * PAL_POR_SEG * 0.85), int(d * PAL_POR_SEG * 1.15), d


def _norm_cifra(s):
    s = sin_tildes(s).replace(".", "").replace(",", "").replace(" ", "")
    return re.sub(r"[^0-9a-z%€$]", "", s)


def auditar(fi):
    """Auditoría de la fórmula. Devuelve (nota, desglose {apartado: (puntos, máximo, [debilidades])}, fallos).
    Los fallos bloquean el guion (faltan tramos, no hay fuentes…). Las debilidades restan puntos."""
    modo = modo_de(fi); M = MODOS[modo]
    TR = tramos(fi); claves = [k for k, _ in TR]
    t = {k: texto_beat(fi.get(k, "")).strip() for k in claves}
    todo = " ".join(t[k] for k in claves)
    pal = todo.split(); n = len(pal)
    n_ciclos = ciclos_de(fi)
    obligatorios = ["hook", "promesa", "climax", "cta"] + [f"{p}{i}" for i in range(1, M["ciclos"][0] + 1) for p in ("recompensa", "bucle")]
    fallos = [f"Falta «{k}»: {dict(TR)[k]}" for k in obligatorios if not t.get(k)]
    if modo == "short" and n_ciclos > M["ciclos"][1]:
        fallos.append(f"Short con {n_ciclos} ciclos: máximo {M['ciclos'][1]}. Quita información secundaria.")
    d = {k: [m, []] for k, m in PUNTOS.items()}

    def quita(ap, pts, msg):
        d[ap][0] = max(0, d[ap][0] - pts); d[ap][1].append(msg)

    # ---------- GANCHO ----------
    primera = frases(t["hook"])[0] if t["hook"] else ""
    if len(primera.split()) > M["hook"]:
        quita("gancho", 6, f"La primera frase del hook tiene {len(primera.split())} palabras (máx. {M['hook']}: cabe en 0-3 s).")
    if re.search(APERTURAS, t["hook"].lower()):
        quita("gancho", 9, "El hook empieza presentando («¿Sabías que…?», «Hola», «En este vídeo…»): empieza por lo que choca.")
    if re.search(_REVELA, t["hook"], re.I):
        quita("gancho", 6, "El hook ya explica («porque», «resulta que»): guarda la respuesta para el clímax.")
    if not re.search(r"\d|!|¡|\?|\b(nunca|nadie|nada|solo|gratis|mentira|trampa|pierdes|pagas|regalas|roban|ricos?|pobres?|"
                     r"imposible|mismo|millones|miles)\b", t["hook"], re.I):
        quita("gancho", 4, "El hook no choca (sin cifra, contradicción ni «nunca/nadie/gratis/pagas»): hazlo más concreto o más raro.")
    if t["hook"] and not re.search(_TU + "|" + _DINERO, t["hook"], re.I):
        quita("gancho", 2, "El hook no toca al espectador ni su dinero: conecta con SU bolsillo («tú pagas…», «tu sueldo…»).")
    titulo = (fi.get("titulo") or "").strip()
    if titulo and not 3 <= len(titulo.split()) <= (8 if modo == "short" else 12):
        quita("gancho", 2, f"Título de {len(titulo.split())} palabras: 3-8 en Short (hasta 12 en largo), con intriga.")
    if "#" in titulo:
        fallos.append("El título no lleva hashtags (van en la descripción).")

    # ---------- PROMESA ----------
    if t["promesa"] and not re.search(_PROMESA, t["promesa"], re.I):
        quita("promesa", 5, "La promesa no anticipa nada («vas a entender por qué…», «te explico cómo…»).")
    if re.search(r"\b(resulta que|la (respuesta|raz[oó]n|clave) es|por eso)\b", t["promesa"], re.I):
        quita("promesa", 5, "La promesa desvela la respuesta: anticipa, no resuelvas.")
    if len(t["promesa"].split()) > (24 if modo == "short" else 45):
        quita("promesa", 3, "Promesa larga: una o dos frases.")
    if n and t["promesa"]:
        pos = sum(len(t[k].split()) for k in ("hook",)) / n
        if modo == "short" and pos > 0.2:
            quita("promesa", 2, f"La promesa llega tarde ({pos:.0%} del guion): en un Short, antes del 20 %.")

    # ---------- RECOMPENSAS ----------
    recs = [k for k in claves if k.startswith("recompensa") and t[k]]
    for i, k in enumerate(recs):
        if not re.search(_NUM, t[k], re.I):
            quita("recompensas", 4, f"«{k}» sin cifra ni dato concreto: da un número, fecha, precio o lugar.")
        if len(t[k].split()) < 8:
            quita("recompensas", 3, f"«{k}» muy corta: la recompensa tiene que saciar algo.")
        if i > 0 and not re.search(_CONECTA, t[k], re.I):
            quita("recompensas", 3, f"«{k}» no se conecta con lo anterior («Pero…», «Por eso…», «Y eso…»): acumulación sin conexión.")
    if recs and not any(re.search(_TU, t[k], re.I) and re.search(_DINERO, t[k], re.I) for k in recs):
        quita("recompensas", 4, "Ninguna recompensa baja a un ejemplo concreto de la vida del espectador (tu sueldo, tu súper, tu banco…).")
    if n and recs:
        pos = sum(len(t[k].split()) for k in claves[: claves.index(recs[0])]) / n
        if modo == "short" and pos > 0.3:
            quita("recompensas", 3, f"La primera recompensa llega al {pos:.0%}: en un Short tiene que llegar pronto (< 30 %).")

    # ---------- BUCLES ----------
    bucs = [k for k in claves if k.startswith("bucle") and t[k]]
    for i, k in enumerate(bucs):
        if not re.search(_ABRE, t[k], re.I) and not re.search(_SUBE, t[k], re.I):
            quita("bucles", 6, f"«{k}» no abre ninguna incógnita (pregunta, «Pero…», «Nadie te dice…»).")
        if re.search(r"\b(resulta que|la (respuesta|raz[oó]n|clave) es|por eso)\b", t[k], re.I):
            quita("bucles", 4, f"«{k}» desvela en vez de abrir: deja la respuesta para después.")
    if len(bucs) >= 2 and not any(re.search(_SUBE, t[k], re.I) or "?" in t[k] for k in bucs[1:]):
        quita("bucles", 5, "Los bucles no suben la expectativa hacia la revelación («Y aún es peor…», «la verdadera trampa…»).")
    for i in range(len(bucs) - 1):
        if t[bucs[i]].lower() == t[bucs[i + 1]].lower():
            quita("bucles", 6, "Dos bucles son iguales: cada uno tiene que ir a más.")
    # todo bucle se resuelve después (sus palabras clave vuelven en una recompensa posterior o en el clímax)
    for k in bucs:
        despues = " ".join(t[x] for x in claves[claves.index(k) + 1:])
        kw = palabras_clave(t[k]) - {"pero", "nadie", "algo"}
        if kw and not kw & palabras_clave(despues):
            quita("climax", 3, f"El {k} («{t[k][:40]}…») no se resuelve después: ninguna de sus ideas vuelve. Resuélvelo.")

    # ---------- CLÍMAX ----------
    if t["climax"] and not re.search(_REVELA + r"|\d", t["climax"], re.I):
        quita("climax", 6, "El clímax no suena a revelación del mecanismo («Resulta que…», «La trampa es…», «Por eso…»).")
    if n and t["climax"]:
        pos = sum(len(t[k].split()) for k in claves[: claves.index("climax")]) / n
        if not 0.55 <= pos <= 0.92:
            quita("climax", 5, f"El clímax empieza al {pos:.0%} del guion (ideal 60-90 %).")
    if t["climax"] and len(t["climax"].split()) < (12 if modo == "short" else 40):
        quita("climax", 3, "Clímax corto: el mecanismo merece 2-3 frases (más en largo).")
    clave_p = palabras_clave(t["promesa"]) - {"vamos", "final", "entender", "entenderas", "explico", "descubrir", "vas"}
    if t["promesa"] and t["climax"] and clave_p and not clave_p & palabras_clave(t["climax"] + " " + t["cta"]):
        quita("climax", 4, "El clímax no retoma ninguna idea de la promesa: comprueba que la promesa se cumple.")

    # ---------- RITMO ----------
    largas = [f for f in frases(todo) if len(f.split()) > M["frase"]]
    if largas:
        quita("ritmo", min(6, 2 * len(largas)), f"{len(largas)} frase(s) de más de {M['frase']} palabras: pártelas («{largas[0][:45]}…»).")
    rel = re.findall(_RELLENO, todo, re.I)
    if len(rel) > 2:
        quita("ritmo", 3, f"Relleno: {', '.join(sorted(set(x.lower() for x in rel)))}. Quítalo.")
    inicios = [sin_tildes(f.split()[0]) for f in frases(todo) if f.split()]
    rep = [w for w in set(inicios) if inicios.count(w) > (3 if modo == "short" else 8) and w not in ("y", "pero", "el", "la")]
    if rep:
        quita("ritmo", 2, f"Demasiadas frases empiezan igual: {', '.join(rep)}.")
    lo, hi, dur = objetivo_palabras(fi)
    if not lo <= n <= hi:
        quita("ritmo", 4, f"{n} palabras (≈ {n / PAL_POR_SEG:.0f} s); para {dur:.0f} s apunta a {lo}-{hi}.")
    # cada tramo justifica quedarse: dato, pregunta o avance (puntos de abandono)
    for k in claves:
        if t[k] and k not in ("cta",) and not re.search(r"\d|\?|!|¡|" + _ABRE + "|" + _REVELA + "|" + _SUBE, t[k], re.I):
            quita("ritmo", 2, f"Posible punto de abandono en «{k}»: no trae dato, pregunta ni avance.")
    # redundancias
    fr = [palabras_clave(f) for f in frases(todo)]
    vistos = 0
    for i in range(len(fr)):
        for j in range(i + 1, len(fr)):
            if len(fr[i]) >= 3 and len(fr[j]) >= 3 and len(fr[i] & fr[j]) / min(len(fr[i]), len(fr[j])) > 0.7 and vistos < 2:
                quita("ritmo", 2, f"Redundancia: la frase «{frases(todo)[j][:40]}…» repite una anterior."); vistos += 1
                break
    if re.search(r"[&/=+]|\b\d{5,}\b", todo):
        quita("ritmo", 2, "Símbolos o cifras largas que se leen mal en voz alta: escríbelos como se dicen («cien mil», «por ciento»).")
    if modo == "largo":
        if n_ciclos < 4:
            quita("ritmo", 3, f"Vídeo largo con {n_ciclos} ciclos: lo normal son 4-8 (un giro o sorpresa cada 1-2 minutos).")
        if not re.search(r"\b(imagina|ahora (mira|piensa)|desde el otro lado|ponte en|visto desde|al rev[eé]s)\b", todo, re.I):
            quita("ritmo", 2, "Sin cambio de perspectiva («Imagina que eres el banco…», «Ahora míralo desde el otro lado…»).")

    # ---------- CTA ----------
    if len(t["cta"].split()) > M["cta"]:
        quita("cta", 3, f"CTA largo: ≤ {M['cta']} palabras.")
    if re.search(_CTA_MALO, todo, re.I):
        quita("cta", 3, "«Suscríbete / dale like» no es natural: mejor una pregunta al espectador o una frase que enlace con el hook.")
    if t["cta"] and not re.search(r"\?|…|\.\.\.|¿|sígueme|te leo|cuéntame|comenta", t["cta"], re.I):
        quita("cta", 2, "El CTA no invita a nada: una pregunta («¿Y tú…?») o una frase a medias que enlace con el hook (loop).")

    # ---------- DATOS ----------
    fuentes = fi.get("fuentes") or []
    if not fuentes:
        fallos.append("Faltan «fuentes»: verifica cada cifra en fuentes fiables (banco central, INE, FMI, Banco Mundial, hemeroteca, libro).")
    elif len(fuentes) < 2:
        quita("datos", 4, "Solo una fuente: contrasta los datos clave con al menos dos.")
    if not fi.get("dato"):
        quita("datos", 3, "Falta «dato»: el hecho central comprobado, en una línea.")
    # cada cifra del guion tiene que estar en «cifras» con su fuente (no inventar información)
    cif = [_norm_cifra(c.get("cifra", "")) for c in (fi.get("cifras") or []) if isinstance(c, dict)]
    sin_fuente = []
    for m in re.finditer(r"\d[\d.,]*(\s?(%|por ciento|euros?|d[oó]lares?|millones|mil))?", todo):
        x = _norm_cifra(m.group(0))
        if x and not any(x[:3] in c or c[:3] in x for c in cif if c):
            sin_fuente.append(m.group(0))
    if sin_fuente:
        quita("datos", min(6, 2 * len(sin_fuente)), f"Cifras sin verificar en «cifras» (con su fuente): {', '.join(sorted(set(sin_fuente))[:6])}.")
    if fi.get("hipotesis") and not re.search(_HIPOTESIS, todo, re.I):
        quita("datos", 5, "La ficha marca una hipótesis, pero el guion la cuenta como hecho: di «se estima…», «los economistas creen…».")

    nota = sum(v[0] for v in d.values())
    return nota, {k: (v[0], PUNTOS[k], v[1]) for k, v in d.items()}, fallos


def validar(fi):
    """(fallos, avisos). Por debajo de 90, las debilidades pasan a ser fallos (hay que corregir)."""
    nota, desg, fallos = auditar(fi)
    debil = [f"[{k}] {m}" for k, (_, _, ms) in desg.items() for m in ms]
    if nota < UMBRAL:
        return fallos + [f"Nota {nota}/100 (< {UMBRAL}): corrige los tres puntos más débiles y vuelve a auditar."] + debil, []
    return fallos, debil


def tres_mas_debiles(desg):
    """Los tres apartados que más puntos pierden (para corregir primero)."""
    perd = sorted(((m - p, k, ms) for k, (p, m, ms) in desg.items() if ms), reverse=True)
    return [(k, ms) for _, k, ms in perd[:3]]


def ficha_vacia(titulo, modo="short"):
    M = MODOS[modo]
    fi = {"titulo": titulo, "modo": modo, "duracion_s": M["duracion"], "formula": "inercia",
          "dato": "", "hipotesis": False, "fuentes": [], "cifras": [{"cifra": "", "fuente": ""}],
          "voces": {"narrador": "(voz de ElevenLabs en español)"}, "carpeta": "",
          "escena": {"lugares": {}, "reparto": {}},  # cada lugar/personaje → palabras del guion que lo piden
          "indicaciones": [], "auditoria_manual": {"leido_en_voz_alta": False, "notas": ""}}
    n = M["ciclos"][0] + (2 if modo == "largo" else 0)
    for i in range(1, n + 1):
        fi[f"recompensa{i}"] = ""; fi[f"bucle{i}"] = ""
    orden = {}
    for k, ayuda in tramos(fi):
        orden["_ayuda_" + k] = ayuda
        orden[k] = ""
    return {**{k: v for k, v in fi.items() if not k.startswith(("recompensa", "bucle"))}, **orden}
