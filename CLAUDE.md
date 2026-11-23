# Inercia del Consumo — motor de contenido (shorts de economía, dinero y consumo, en español)

Shorts animados verticales (1080×1920) con el **motor de dibujos** (`dibujos/`): personajes 2D de cabeza de judía
con contorno dentro de un mundo 3D pintado (tinta, desenfoque de lente, luz de día, cámaras que no paran), voz del
usuario (ElevenLabs), subtítulos quemados, música y efectos sintetizados al 50 % de la voz.
**Cada vídeo, su mundo:** lugares y personajes SOLO si el guion los nombra (`./inercia escena N` lo comprueba).
El profesor de economía (traje y gafas doradas) y su pizarra son HERRAMIENTAS opcionales del motor (`roman.js`,
`_piezas.js`, `dibujos/ejemplos/`), nunca salen por defecto. Más adelante, también vídeos largos.
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
- HECHO (21 nov 2026): plantilla `dibujos/plantilla/` (técnicas del submarino + profesor con gestos + pizarra de tiza +
  terraza de ejemplo), subtítulos, tiempos estimados, avisos de voz, comparación con los romanos, `dibujos/LEEME.md`.
  3 fotos de prueba con subtítulos junto a los romanos: `dibujos/plantilla/hoja_prueba.jpg`.
- REGLA (usuario, 21 nov 2026): espacios y personajes SOLO si el guion los nombra; nada de reutilizar lo guardado.
  `./inercia escena N` lo comprueba con `escena.lugares`/`escena.reparto` de la ficha. El profesor = narrador, solo si se pide.
- Vídeo 2 «Cómo gana el banco con tu tarjeta» (`Textos/2 - …`, 8 pasos, 95/100): PAUSADO hasta tener el motor completo.
  Decorado a medida hecho (dentro de la tienda + calle con el banco); falta quitar al profesor (no lo nombra el guion).
- MOTOR (21 nov 2026): plantilla genérica con `_piezas.js`, sonido genérico (`herramientas/sonido.py`), comprobación de
  escena, prueba completa con voz de espeak (`Textos/0 - Prueba del motor`, `dibujos/videos/0-prueba-del-motor/`).
- MOTOR (23 nov 2026): traído lo mejor de Citrino/océano (instalar.sh, montaje en paralelo reanudable, subtítulos CapCut +
  .srt, insertos de datos `plantilla/web/insertos.js`, `docs/RESULTADOS.md`); −14 LUFS en dos pasadas; palabras sin
  reconocer con tiempo rellenado. PRUEBA COMPLETA (voz de espeak, NO la del usuario): voz → montar → terminar → 2 MP4 OK.
- Al terminar cada short: pedir a los 2 días la captura de YouTube Studio (Participación) (`./inercia medir`) y apuntarla
  en `docs/RESULTADOS.md` (segundo de abandono → etapa del guion → lección).

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
- Subtítulos (estilo CapCut del usuario, 21 nov 2026): una palabra cada vez (las cortas se unen a su vecina), minúsculas,
  sin puntuación, blanca gruesa con borde negro fino, ~80 px, a ~73 % de la altura, sin tapar caras; cifras en amarillo
  (`"amarillo": false` lo quita). `subtitulos.json` por vídeo; además sale `out/subtitulos.srt` para subirlo a YouTube.
- Revisar YO cada imagen antes de enviarla y decir qué falla; nada en pantalla que no diga el guion.
- Entregar con y sin música + ficha para publicar.

## Herramientas
- `./inercia instalar | comprobar | temas | guion | video | voz | fotos | montar | terminar | publicar | medir`.
- Doblaje con varias voces: `programa/doblaje.py`. Replicar un viral: `docs/replicar-viral.md`.
- **NUNCA gastar créditos de vidIQ sin decir el coste y esperar el «sí» del usuario.**
- Vídeos largos: la fórmula ya tiene modo largo; el motor de imagen para largos se configura más adelante (no ahora).
