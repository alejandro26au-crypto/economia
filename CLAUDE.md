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
- FÓRMULA DEL CANAL apuntada en «Guion» (25 nov). ENSAYO de guion (no es el primer vídeo): `Textos/ensayo - El efecto cobra.txt` (v4, promesa y recordatorio sutiles; promesa con el DATO y no con «quédate hasta el final», anticipo al final de cada historia y recordatorio hacia el min 5; regla aprendida: tramos con cifras de empresas aburren → contarlos con PERSONAS y un giro; prometer al inicio algo ÚTIL que se da al final) + `.fuentes.md`.
- PRIMER VÍDEO (25 nov, rama `claude/loving-volta-radjoc`): «El conserje que murió con 8 millones» (Ronald Read).
  Paquete de publicación (borrador) en `Textos/1 - … .publicar.md`. SIGUIENTE: ficha (`./canal guion nuevo 1`) → escenas → prueba → voz → montar → miniatura propia + paquete.
  Guion v1.1 APROBADO (26 nov, repaso de puntuación y palabras neutras: es el texto de la voz) en `Textos/1 - El conserje que murió con 8 millones.txt` + `.fuentes.md`; el usuario saca la voz.
  El ensayo «El efecto cobra» queda solo como ensayo.
- MOTOR 2D DE VÍDEOS LARGOS (26 nov, rama `claude/cool-wright-21sjvd`): `src/largo/` (Largo.tsx = composición
  «largo»; lugares.ts = escenarios a medida; objetos.ts = objetos animados: árbol que crece con frutos y tormenta,
  montón de títulos, caja del banco, gráfica del interés compuesto, móvil con la app del banco, cesta de huevos,
  calendario, cartel, facturas, billetes…; reparto.ts; tipos.ts). Escena = UN PLANO que empieza en una palabra;
  cámara de `cam` a `a` (nunca quieta), golpes de zoom, iris de tinta al cambiar de escenario, rótulos y cifras que
  crecen, sonidos solos. Cada `desde` se busca DESPUÉS del inicio de la escena anterior. Subtítulos solo en las
  pruebas sin voz. Armario nuevo: abrigo, imperdibles, arrugas, manchas de grasa, pelo blanco; objetos en la mano
  (fregona, teléfono, carta, maleta, papeles, billete, hacha). `canal montar` hace los largos POR TRAMOS de 90 s
  (se reanuda si se corta) + sonido aparte + `.srt`; `canal revisar` da hojas de 16 fotos. Ficha larga:
  `canal guion nuevo` / `canal guion N` (no toca el .txt). Miniaturas con el motor: `miniatura-1`, `miniatura-1b`.
  Red: el modelo de la voz baja de `us.aws.cdn.hf.co` (permitido en el entorno el 26 nov); usar `HF_HUB_DISABLE_XET=1`.
- VÍDEO 1 MONTADO (26 nov): `Vídeos listos/1 - El conserje que murió con 8 millones (2363).mp4` (8 min 15 s, 143
  planos, sin subtítulos) + `.srt`. Montaje en la nube: 15 min. SIGUIENTE: el usuario saca miniaturas en Nano Banana
  (16:9) con los prompts del `.publicar.md` → compararlas con las del motor (`Vídeos listos/1 - miniatura A/B.png`).
- MINIATURAS vídeo 1 (26 nov): las de Nano Banana (`Vídeos listos/1 - miniatura Nano Banana A/B.jpg`) GANAN a las
  del motor: cara MUY grande (1/3 de la miniatura), más detalle (abrigo roto, imperdibles grandes), brillo fuerte en
  el objeto. Lección para las del motor: encuadre más cerrado y cara grande. ESTILO DE MINIATURA DEL CANAL (A, B y C)
  guardado en `docs/publicacion.md`: usarlo en TODOS los vídeos.
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
- **BANCO DE TEMAS GUARDADOS (usar en este orden o según convenga): `docs/temas-primer-video.md`** (6 temas con
  historia, identificación, dato útil y fuentes). Tema 1 (el conserje Ronald Read) = PRIMER VÍDEO, en guion.
- Ideas: John Law y la burbuja del Mississippi, Lehman Brothers, los hermanos Hunt y la plata, LTCM (los Nobel que
  perdieron 4.600 millones), Michael Burry (se rieron de él y tenía razón), Alemania 1923, el corralito argentino,
  la crisis española de 2008, Pablo Escobar y su dinero, el Banco de Inglaterra contra Soros.

## Guion (vídeo largo)
- **LÍMITE DE ELEVENLABS (usuario, 25 nov 2026): máximo 10.000 créditos al mes → vídeos de ~8 MINUTOS con unos
  7.500-8.000 CARACTERES (1 crédito ≈ 1 carácter con espacios; ≈ 1.250-1.350 palabras).** Contar los caracteres
  antes de enseñar el guion (`python3 -c "print(len(open(F).read()))"`). (Sustituye a la línea siguiente.)
- (antes) 1.500-2.200 palabras (10-15 min). Español neutro (que se entienda en España y Latinoamérica). Cifras en dólares y,
  si ayuda, en euros.
- **HABLAR DIRECTO AL ESPECTADOR PARA QUE SE SIENTA IDENTIFICADO** (lo que al usuario, como espectador, le engancha;
  25 nov 2026): frases en «tú» que describen lo que siente o vive, sin juzgarle. Ejemplos: «Intentas salir de deudas,
  pero sientes que no eres capaz», «Cobras, pagas el alquiler… y a día 15 ya no queda nada», «Ahorras, y siempre
  llega un imprevisto que te deja a cero». Usarlas en el GANCHO (las primeras palabras), al volver de cada giro y en
  el cierre, y quitar la culpa SOLO cuando el tema lo pida («no es que seas malo con el dinero: el sistema está hecho así»). La historia real
  del vídeo se conecta siempre con eso que siente el espectador.
- **Tono EFUSIVO** como el de los shorts: frases cortas, exclamaciones, preguntas al espectador y comparaciones con su
  vida (su sueldo, su alquiler, su banco, su hipoteca).
- **FÓRMULA DEL CANAL (aprobada por el usuario, 25 nov 2026; modelo: `Textos/ensayo - El efecto cobra.txt`;
  sale de los análisis de Zenn, Dalio y Los Ecomonos en `docs/`).** Sustituye a la estructura anterior:
  1. IDENTIFICACIÓN (0-15 s): frase en «tú» sobre lo que vive, quiere o le preocupa al espectador. Quitarle la
     culpa («no eres tú») SOLO si el tema lo pide (deudas, no llegar a fin de mes…). En temas de ahorro, inversión
     o trucos, la identificación es su deseo o su duda («quieres que tu dinero crezca, pero no sabes por dónde
     empezar»). El canal tratará temas variados: historias, ahorro, inversión, consejos.
  2. METÁFORA que une todo el vídeo (la cobra en tu cartera) y PROMESA en forma de lista si encaja («antes de ver
     la tuya, conoce otras tres»).
  3. PROMESA ÚTIL con un DATO concreto que se da al final («verás cómo 10 € al mes te ahorran más de 1.000»).
     Nada de «quédate hasta el final»: se promete con contenido, y el premio tiene que estar a la altura.
     SUTIL, NUNCA COMO CEBO (usuario, 25 nov): que suene a dato curioso dentro de la historia, no a anuncio.
     Mal: «quédate y te enseño un truco que te ahorra 1.000 €». Bien: «y lo más curioso: la cobra que llevas tú
     se vence con diez euros al mes».
  4. HISTORIAS REALES con escalada y un GIRO cada 1-2 min («y aún es peor», «esta historia nunca pasó»). Las partes
     de empresas o cifras se cuentan con PERSONAS («imagina que trabajas allí…»), no con listas de números.
  5. ANTICIPO al final de cada historia («la siguiente lleva traje y corbata») y RECORDATORIO de la promesa hacia
     el minuto 5, metido en la historia y sutil, sin anunciarlo. Mal: «no me olvido de tus mil euros, llegan
     pronto». Bien: «guarda esta idea de la cola cortada: tu tarjeta funciona exactamente igual».
  6. LA LECCIÓN en una frase sencilla, sin tecnicismos.
  7. TU BOLSILLO: la historia aplicada al espectador con un cálculo REAL y cifras pequeñas.
  8. ACCIÓN CONCRETA que pueda hacer hoy (esta noche, en el móvil) y entrega del premio prometido.
  9. CIERRE CIRCULAR: la última frase vuelve a la primera.
  Si el vídeo es UNA sola historia larga (John Law, Lehman…), no hay lista: se mantienen los pasos 1, 3, 4, 5, 7,
  8 y 9. Cifras en euros y, si ayuda, también en dólares (público de España y Latinoamérica).
- Datos REALES comprobados, con `dato` y `fuentes` en la ficha `Textos/N - Título.json` (bancos centrales, FMI,
  Banco Mundial, hemerotecas, libros de historia económica). Lo cómico es dramatización; las cifras, nunca.
- **REVISIÓN OBLIGATORIA DE CADA GUION (usuario, 25 nov 2026):** antes de enseñarlo, comprobar punto por punto
  que cumple la FÓRMULA DEL CANAL y apuntar el resultado al enseñarlo. Lista:
  1. ¿Las PRIMERAS palabras son una frase en «tú» de identificación? ¿Culpa quitada solo si el tema lo pide?
  2. ¿Hay UNA metáfora que une todo el vídeo y una frase mantra repetida 4-6 veces?
  3. ¿La promesa útil tiene un DATO concreto, suena sutil (no a cebo) y se entrega al final?
  4. ¿Historias reales con un giro cada 1-2 min («y aún es peor…»), contadas con PERSONAS y no con listas de cifras?
  5. ¿Anticipo al final de cada historia y recordatorio sutil de la promesa hacia el minuto 4-5?
  6. ¿Lección en una frase sencilla? 7. ¿Tu bolsillo con un cálculo REAL y cifras pequeñas?
  8. ¿Acción concreta para hoy (en el móvil, esta noche)? 9. ¿Cierre circular (la última frase vuelve a la primera)?
  10. ¿7.500-8.000 caracteres? ¿Cada cifra está en el `.fuentes.md` como comprobada, calculada o dramatización?
  Si falla algún punto, se corrige ANTES de enseñarlo.
- Enseñar el guion en un bloque para copiar. El usuario hace la voz en ElevenLabs con el texto EXACTO.

## Escenarios
- Reutilizar todo lo posible de `docs/catalogo.md` (despachos, salas del trono, bancos, tabernas, oficinas, muelles,
  guaridas, aulas…) y crear los que pida la historia con `src/motor/plantilla-escenario.tsx` y `atrezo.ts`.
- Nivel de calidad: el del CAMAROTE (muchos objetos con textura pintada, luz cálida contra fría, centro libre).
- Puntos de interés y obstáculos en METROS (`metros: true`); actores con `...enMetros("escenario", x, z)`.

## Proceso
- **REVISIÓN RÁPIDA DE LA HOJA (lista corta, sin extenderse):** ¿el personaje está bien apoyado (pies en el suelo, sentado
  en su silla, nunca «de pie sobre la mesa» ni flotando)? ¿se le ve entero o bien encuadrado? ¿caras correctas? ¿textos
  sin cortar ni tapando caras? ¿objetos reconocibles? Corregir y solo entonces montar.
- **MOVIMIENTO Y VARIEDAD (usuario, 25 nov 2026):** nada plano en un mismo sitio. Cambio de escena o de toma según
  cada frase o idea del guion (plano general, medio, detalle del objeto, reacción), varios escenarios por vídeo
  (los que pida la historia), personajes que se mueven (andan, se sientan, señalan, cogen cosas) y cámara viva.
- **SIN SUBTÍTULOS EN EL VÍDEO (usuario, 25 nov 2026):** como Zenn, Dalio o Los Ecomonos, el vídeo final va sin
  subtítulos quemados; se genera un `.srt` con el texto exacto y los tiempos de la voz para subirlo a YouTube (CC).
  En las pruebas sin voz se pueden poner subtítulos solo para entender el ritmo.
- **REGLA (usuario, 25 nov 2026): REVISAR Y CORREGIR ANTES DE MONTAR.** Primero una hoja de fotos de los momentos
  clave; la reviso YO (personaje tapado o cortado, caras raras, textos cortados, objetos mal hechos) y CORRIJO todo
  lo que vea. Solo cuando la hoja está limpia se monta el vídeo final, una sola vez. Nunca montar sabiendo que hay
  fallos ni contarlos después.
1. Guion aprobado → `./canal guion nuevo N "Título"`, rellenar la ficha, `./canal guion N`.
2. Escenas en `src/ideas/N.ts` (apúntala en `src/ideas/lista.ts`) → `npx tsc --noEmit -p .`
3. `./canal prueba N` + `./canal revisar N --prueba`: hoja de escenas + chequeo automático de planos.
4. Llega el MP3 → «Pon aquí tu voz» → `./canal voz N` → `./canal revisar N` → fotos clave → `./canal montar N`
   (en segundo plano) → enviar el vídeo.
5. La variante (cámara) se guarda por idea en `Textos/variantes.json`.
6. **PAQUETE DE PUBLICACIÓN (usuario, 25 nov 2026), después de CADA vídeo:** enviar prompt de Nano Banana para la
   miniatura (variantes A y B), título (+2 alternativas), descripción con fuentes, etiquetas, comentario fijado,
   ajustes de YouTube y hora. Plantilla y reglas en `docs/publicacion.md`; se guarda en `Textos/N - Título.publicar.md`.
7. Guardar y subir; actualizar el «Estado» de arriba.

## Órdenes (`./canal …`)
`comprobar` · `ideas` · `guion nuevo N "Título"` · `guion N` · `voz N` · `prueba N` · `revisar N [--prueba]` ·
`foto N SEG [--prueba]` · `montar N [--prueba] [--rapido] [--nueva | --variante S]` · `todo N` (voz + montar).
En la nube, antes de `voz`: `pip install -r instalador/requirements.txt` y `npm ci`.
