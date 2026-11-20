# Inercia del Consumo — motor de contenido (shorts de economía, dinero y consumo, en español)

Shorts animados verticales (1080×1920) con el **motor de dibujos** (`dibujos/`): personajes 2D de cabeza de judía
con contorno dentro de un mundo 3D pintado (tinta, desenfoque de lente, luz de día, cámaras que no paran), voz del
usuario (ElevenLabs), subtítulos quemados, música y efectos sintetizados al 50 % de la voz.
Personaje del canal: el **profesor de economía adinerado** (traje, corbata y gafas doradas) y su **pizarra** que
dibuja cada frase (`dibujos/ejemplos/efecto-cangrejo/`). Más adelante, también vídeos largos.
Habla con el usuario en español llano, frases cortas y pasos numerados. Puede trabajar solo mientras está fuera.
**Límite de sesión de 5 h:** guardar y subir (commit + push) cada poco; si se acerca el límite, parar y subir todo.

## Estado (20 nov 2026)
- Rama: `claude/inercia-motor-contenido`. Origen del motor: repo `Oceano-animado-`, rama `claude/fervent-archimedes-c1dp80`
  (solo lectura). Lo anterior de este repo (motor Remotion horizontal para vídeos largos) sigue intacto; sus
  instrucciones están en `docs/CLAUDE-largos-remotion.md`.
- HECHO: kit de dibujos, herramientas, ejemplos (submarino = técnicas; efecto cangrejo = profesor y pizarra) copiados;
  fórmula de guiones con auditoría (`programa/formula.py`, modo Short y largo) y orden `./inercia`.
- HECHO: guion de ejemplo REAL «El truco del 99 que te engaña» (`Textos/1 - …`): primera versión 88/100 (no pasaba),
  corregida → 96/100, más auditoría a mano en voz alta (3 fallos de precisión corregidos).
- PENDIENTE (en este orden):
  1) plantilla nueva `dibujos/plantilla/` con las técnicas del submarino (main.js en piezas + rebuild.sh, luces por
     plano, zoom de golpe en cifras, barridos, efectos 2D, carta.mjs) + el profesor con sus gestos + la pizarra;
  2) subtítulos (`dibujos/herramientas/subtitulos.py`), `tiempos_estimados.py`, `comparar.py` (lado a lado con los romanos),
     y `tiempos_es.py` que avise si la voz no coincide o se pasa de duración;
  3) 3 fotos de prueba de la plantilla con subtítulos junto a una de los romanos → esperar el «aprobado»;
  4) `dibujos/LEEME.md` para Inercia; 5) subir; proponer 3 temas para el primer short.
- Al terminar cada short: pedir a los 2 días la captura de YouTube Studio (Participación) (`./inercia medir`).

## Proceso de un short (todo automático salvo la voz)
1. **Temas:** proponer 3 temas REALES (historia de dinero + qué significa hoy para su bolsillo) y esperar a que elija.
2. **Guion:** `./inercia guion nuevo N "Título"` (o `--largo`) → rellenar la ficha `Textos/N - Título.json` (tramos,
   `dato`, `fuentes`, `cifras` con su fuente, `indicaciones`, `auditoria_manual`) → `./inercia guion N`.
   Por debajo de 90 NO pasa: corregir los tres puntos más débiles y volver a auditar. La nota es una ayuda: yo también
   audito leyendo en voz alta (precisión, naturalidad, que cada cifra diga exactamente lo que dice la fuente).
   Entrega al usuario: 1) guion estructurado, 2) auditoría con nota, 3) guion limpio en bloque para copiar,
   4) pausas, énfasis y ritmo, 5) fuentes (`Textos/N - Título.entrega.md`).
3. **Vídeo:** `./inercia video N` crea `dibujos/videos/N-titulo/` desde la plantilla, con tiempos estimados.
   Decorado A MEDIDA (`web/_world.js`), ropa (`web/roman.js`), planos/gestos/pizarra atados a palabras (`web/story.js`).
4. **Voz:** el usuario la hace en ElevenLabs con el texto EXACTO y la deja en «Pon aquí tu voz/» → `./inercia voz N`
   (tiempos de cada palabra en español; avisa si no coincide con el guion o se pasa de duración).
5. **Fotos:** `./inercia fotos N "f1,f2,…"` → hoja de 4-6 fotos con subtítulos al lado de una de los romanos.
   REVISARLA yo y decir qué falla → enseñarla → esperar el «aprobado» antes de montar.
6. **Montaje:** `./inercia montar N` (segundo plano, ~2 s/fotograma) → `./inercia terminar N` (música y efectos por
   tramos, mezcla al 50 %, con y sin música, subtítulos, −14 LUFS, revisión sin congelados ni negros, hoja final).
   REVISAR la hoja final yo antes de enviar.
7. **Entrega:** los dos MP4 + `./inercia publicar N` → `publicar.md` del vídeo (título, descripción, etiquetas,
   comentario fijado, ajustes de YouTube, hora recomendada, fuentes), enviado en bloques para copiar.
8. **Medición:** a los 2 días pedir la captura de YouTube Studio (Participación).

## FÓRMULA DE GUIONES — Motor de guiones y retención (usuario, 20 nov 2026) — `programa/formula.py`
HOOK (contradicción, dato o afirmación que cuestiona lo que cree saber) · PROMESA (qué mecanismo descubrirá) ·
RECOMPENSA 1 · BUCLE 1 · RECOMPENSA 2 · BUCLE 2 · (más ciclos según duración) · CLÍMAX (conecta, revela el mecanismo,
resuelve todo) · CTA breve y natural.
- Shorts: una historia central, primera recompensa temprana, ritmo ágil, bucles conectados, clímax contundente, sin
  información secundaria (2-3 ciclos). Largos: más profundidad, 4-8 ciclos, microganchos, ejemplos y cambios de
  perspectiva, progresión global, sin acumulaciones sin conexión. Adaptar a la duración, sin forzar extensiones.
- Retención: cada tramo aporta algo nuevo; mecanismos complejos explicados fácil; ejemplos concretos (su sueldo, su
  súper, su banco); sin repeticiones; no sacrificar precisión; resolver todos los bucles.
- Principio de optimización narrativa: las 8 etapas son columna vertebral, no jaula; valor desde el primer segundo;
  buscar puntos de abandono y redundancias; toda promesa se resuelve; que suene natural en voz alta. NO inventar
  tensión, datos ni revelaciones.
- Auditoría: gancho 15, promesa 10, recompensas 15, bucles 15, clímax 15, ritmo 15, CTA 5, datos 10 (cada cifra del
  guion en `cifras` con su fuente). Mínimo 90.
- Tono EFUSIVO: frases cortas, exclamaciones, preguntas al espectador, cifras que golpean. Español neutro (España y
  Latinoamérica). Short: ~2,7 palabras/s (50 s ≈ 115-155 palabras).

## REGLAS DEL MOTOR DE DIBUJOS — ver `dibujos/LEEME.md`
- Calidad = el ejemplo de los romanos (`dibujos/kit/example/soldier/stills.jpg`): comparar lado a lado.
- Decorado A MEDIDA de cada vídeo con las piezas y texturas del kit (y lo nuevo en su mismo estilo). Solo se reutiliza
  algo si el guion lo menciona.
- Gestos del kit: caras fijas que cambian en la palabra clave, `idle()` siempre, impulso, 4-5 cambios de brazos.
- Encuadre: personajes más pequeños o lejos para que se vea el entorno; caras a pantalla completa solo 1-2 veces.
- Subtítulos quemados (activables/desactivables), palabra a palabra o en grupos de 2-3, blancos con borde oscuro,
  cifras y palabras clave en amarillo, centro-bajo sin tapar caras.
- Revisar YO cada imagen antes de enviarla y decir qué falla; nada en pantalla que no diga el guion.
- Entregar con y sin música + ficha para publicar.

## Herramientas
- `./inercia comprobar | temas | guion | video | voz | fotos | montar | terminar | publicar | medir`.
- Doblaje con varias voces: `programa/doblaje.py`. Replicar un viral: `docs/replicar-viral.md`.
- **NUNCA gastar créditos de vidIQ sin decir el coste y esperar el «sí» del usuario.**
- Vídeos largos: la fórmula ya tiene modo largo; el motor de imagen para largos se configura más adelante (no ahora).
