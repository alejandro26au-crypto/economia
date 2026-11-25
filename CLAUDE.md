# Canal de economía (en español)

Vídeos LARGOS (10-15 min, horizontal 1920×1080, en español) con historias REALES de dinero y economía: escenarios
3D (Three.js, acabado "3D ilustrado" con contorno de tinta) con personajes 2D dentro, cámara que nunca para y efectos
de sonido en cada cambio. El motor viene del canal del océano (repositorio `oceano-animado-`). Historias y
personajes propios: no copiar otros canales.
Habla con el usuario en español llano, frases cortas y pasos numerados. Puede trabajar solo mientras está fuera.

**Lee `docs/catalogo.md` SOLO cuando haga falta:** catálogo de escenarios, modelos 3D y reparto heredados del
océano (para reutilizar) y estructura del código. Piezas para decorados: `src/motor/atrezo.ts`.

## Estado (25 nov 2026) — rama `claude/nice-babbage-y76v31`
- HECHO: motor horizontal 1920×1080. PROTAGONISTA 2D animado por partes en `src/personaje/Muneco.tsx` (cabeza
  grande con sombreado a lápiz, pelo despeinado copiado de la hoja del usuario, camiseta negra, palos negros, manos
  blancas; lo mueve el esqueleto de `src/bent/animaciones.ts`). Del kit de los romanos (océano, rama
  determined-franklin, `dibujos/`): `src/personaje/gestos.ts` (boca con el volumen real de la voz, gestos atados a
  palabras con impulso, cabeza que asiente); `canal voz` guarda `boca` en tiempos.json. Demo: composición
  `muneco-demo`. Pruebas de estilo descartadas en `src/pruebas/` (boceto, isométrico, recortes): solo referencia.
- ESTILO ELEGIDO: como el canal Zenn (@Zenn0009, 201k subs, vídeos de 8-10 min): muñeco simple y expresivo, fondos
  PLANOS A COLOR con contorno negro limpio y colores apagados, un objeto clave por escena, miniaturas con 1-2 palabras
  amarillas con borde negro. Identidad propia: pelo despeinado y camiseta negra (no copiar a Zenn).
  Pendiente ver un vídeo de Zenn por dentro (movimiento, duración de planos, textos): el usuario manda capturas.
- 25 nov (sesión 2): el usuario cambió a ESTILO A LÁPIZ para el muñeco y su mundo. `src/personaje/lapiz.tsx`
  (DefsLapiz: trazo tembloroso `lp-trazo` para TODA la escena, PapelLapiz: grano de papel, Rayado: sombras de
  grafito); `<Muneco lapiz />`. Pelo: casquete pegado a la cabeza + trazos gruesos de punta redonda barridos a la derecha, copiado de `public/protagonista/` (los dibujos del usuario: MIRARLOS SIEMPRE como referencia). Brazos y piernas más gruesos. Demos: `muneco-lapiz` y `muneco-demo`
  (versión limpia). Esperando su visto bueno.
- 25 nov (sesión 2, después): el protagonista se hace con la librería de los romanos (`src/personaje/toon.ts`,
  copia MIT del kit). Prueba: composición `toon-demo` (`src/pruebas/ToonDemo.tsx`). PELO ELEGIDO por el usuario:
  `hat: "pelo:despeinado"` (negro). Piel blanca (humano, como sus dibujos). Descartados: lápiz, mechones de punta,
  pelo natural con raya, especie moneda (queda `coin` en toon.ts sin usar). Pendiente: ojos grandes como sus
  dibujos, manos blancas con dedos, camiseta de manga corta.
- KIT DE LA ESPECIE (25 nov): `src/personaje/especie.ts`. Todos comparten cuerpo y cara del protagonista
  (`prota: true` en toon.ts: ojos grandes con brillo, manos blancas, ropa SIN MANGAS con textura de tela: trama, motas, cuello, pliegues y dobladillo, y detalles opcionales: cinturón con hebilla, bolsillo y cuello de camisa; referencia del usuario: los personajes de @heymiloq, NO el del traje gris de Benthara) y cambian pelo
  (despeinado, corto, rizos, tupe, rapado), color de pelo, camiseta, pantalón, zapatos y piel. `REPARTO` con nombre
  (protagonista, vecina, banquero, amigo, jefa, tendero, estudiante, nino) y `persona(semilla)` para gente de
  relleno. Hoja: composición `reparto-especie`. La camiseta NEGRA es solo del protagonista.
- ARMARIO (regla del usuario, 25 nov): cada personaje tiene ropa PREDETERMINADA (su ficha) y en cada vídeo se le
  AÑADE lo que pida el guion o la escena con `con(ficha, { traje, corbata, gafas, delantal })` (no se toca la
  ficha). Los de rol típico ya traen sus piezas (banquero: traje gris, corbata y gafas). Detalles MÍNIMOS y
  variados (cinturón, bolsillo, cuello): no todos los llevan, para que cada uno parezca una persona distinta y no
  un uniforme. Si un guion pide una pieza que no existe (casco, gorra, bata…), se añade al armario.
- PERSONAJES APROBADOS por el usuario (25 nov 2026).
- ESCENARIOS: hoja de MUESTRA solo para hacerse una idea (`muestra-escenarios`, `src/pruebas/MuestraEscenarios.tsx`:
  banco, calle, despacho y 10 objetos de dinero). Regla del usuario: cada escenario se DISEÑA A MEDIDA de cada vídeo
  mientras trabajamos en él (no hay un catálogo fijo).
- PRUEBA DE EXPLICACIÓN (25 nov): `prueba-100-euros` (`src/pruebas/Prueba100Euros.tsx`, 20 s): billete que encoge
  con su valor, años que corren, gráfica que se dibuja, personaje que reacciona, cámara con golpe de zoom y temblor.
  `VALOR_HOY = 60` es APROXIMADO: comprobar con Eurostat/INE (la red de la nube bloquea esas webs). Regla del
  usuario: TODO debe moverse y ser atractivo aunque sea 2D (nada estático).
- ANÁLISIS VIRAL (25 nov): `docs/analisis-viral-zenn.md` («What Did Ancient Humans Do at Night?», 8,2 M vistas):
  estructura con tiempos, fórmula, miniatura y qué aplicar. Créditos vidIQ: quedan 120 (25 nov). También `docs/analisis-viral-dalio.md` («How The Economic Machine Works», 144,5 M): metáfora central, frase mantra, números encadenados, gráficos por capas, 3 reglas al final.
- COMPETIDOR DIRECTO: Los Ecomonos (475K, España, finanzas personales con monos animados). Análisis en
  `docs/analisis-viral-ecomonos.md`: promesa numerada, capítulos con anticipo, verdades con nombre propio, cifras
  pequeñas, una acción final, final abierto. Diferenciarnos con historias REALES y su lección para tu bolsillo.
- PENDIENTE (en orden): 1) personaje y especie (APROBADOS); 2) escenarios (muestra hecha; se hacen por vídeo); 3) montaje por tramos para vídeos largos; 4) control de calidad con ffmpeg (congelados,
  negros, borrosos, sin sonido); 5) borrador automático de escenas desde el guion; 6) piloto (candidato: «El efecto
  Cobra»).
- vidIQ: gastar el mínimo de créditos (0 hasta el 9 dic 2026). Público: España y Latinoamérica.

## Lo que dicen los datos (vidIQ, 18 nov 2026)
- En español destacan los vídeos que tocan TU dinero y una verdad escondida: «Cómo los ricos usan la deuda» (17x,
  90.000 vistas), «La verdad oculta de los bancos» (36x), «Aprende la economía y jamás serás manipulado» (316.000
  vistas, 33 min). Las historias de economía bien contadas están poco explotadas en español.
- En inglés funcionan las historias largas de dinero (John Law, Lehman, «por qué EE. UU. es tan rico», 35-47 min).
- Fórmula del canal: historia real de dinero + qué significa para el bolsillo del espectador hoy.
- Ideas: John Law y la burbuja del Mississippi, Lehman Brothers, los hermanos Hunt y la plata, LTCM (los Nobel que
  perdieron 4.600 millones), Michael Burry (se rieron de él y tenía razón), Alemania 1923, el corralito argentino,
  la crisis española de 2008, Pablo Escobar y su dinero, el Banco de Inglaterra contra Soros.

## Guion (vídeo largo)
- 1.500-2.200 palabras (10-15 min). Español neutro (que se entienda en España y Latinoamérica). Cifras en dólares y,
  si ayuda, en euros.
- **HABLAR DIRECTO AL ESPECTADOR PARA QUE SE SIENTA IDENTIFICADO** (lo que al usuario, como espectador, le engancha;
  25 nov 2026): frases en «tú» que describen lo que siente o vive, sin juzgarle. Ejemplos: «Intentas salir de deudas,
  pero sientes que no eres capaz», «Cobras, pagas el alquiler… y a día 15 ya no queda nada», «Ahorras, y siempre
  llega un imprevisto que te deja a cero». Usarlas en el GANCHO (las primeras palabras), al volver de cada giro y en
  el cierre, y quitar la culpa («no es que seas malo con el dinero: el sistema está hecho así»). La historia real
  del vídeo se conecta siempre con eso que siente el espectador.
- **Tono EFUSIVO** como el de los shorts: frases cortas, exclamaciones, preguntas al espectador y comparaciones con su
  vida (su sueldo, su alquiler, su banco, su hipoteca).
- Estructura: gancho fuerte en los primeros 30 s (la pregunta o la cifra brutal) → la historia con rival, burlas,
  pista falsa y escalada → **un giro o sorpresa cada 1-2 minutos** («Y aún es peor…») → la verdad y la ciencia
  económica con cifras → qué significa hoy para tu dinero → cierre. UNA historia continua, sin capítulos.
- Datos REALES comprobados, con `dato` y `fuentes` en la ficha `Textos/N - Título.json` (bancos centrales, FMI,
  Banco Mundial, hemerotecas, libros de historia económica). Lo cómico es dramatización; las cifras, nunca.
- Enseñar el guion en un bloque para copiar. El usuario hace la voz en ElevenLabs con el texto EXACTO.

## Escenarios
- Reutilizar todo lo posible de `docs/catalogo.md` (despachos, salas del trono, bancos, tabernas, oficinas, muelles,
  guaridas, aulas…) y crear los que pida la historia con `src/motor/plantilla-escenario.tsx` y `atrezo.ts`.
- Nivel de calidad: el del CAMAROTE (muchos objetos con textura pintada, luz cálida contra fría, centro libre).
- Puntos de interés y obstáculos en METROS (`metros: true`); actores con `...enMetros("escenario", x, z)`.

## Proceso
1. Guion aprobado → `./canal guion nuevo N "Título"`, rellenar la ficha, `./canal guion N`.
2. Escenas en `src/ideas/N.ts` (apúntala en `src/ideas/lista.ts`) → `npx tsc --noEmit -p .`
3. `./canal prueba N` + `./canal revisar N --prueba`: hoja de escenas + chequeo automático de planos.
4. Llega el MP3 → «Pon aquí tu voz» → `./canal voz N` → `./canal revisar N` → fotos clave → `./canal montar N`
   (en segundo plano) → enviar el vídeo.
5. La variante (cámara) se guarda por idea en `Textos/variantes.json`.
6. Guardar y subir; actualizar el «Estado» de arriba.

## Órdenes (`./canal …`)
`comprobar` · `ideas` · `guion nuevo N "Título"` · `guion N` · `voz N` · `prueba N` · `revisar N [--prueba]` ·
`foto N SEG [--prueba]` · `montar N [--prueba] [--rapido] [--nueva | --variante S]` · `todo N` (voz + montar).
En la nube, antes de `voz`: `pip install -r instalador/requirements.txt` y `npm ci`.
