# Motor de dibujos — Inercia del Consumo

Personajes 2D de «cabeza de judía» (con contorno) dentro de un mundo 3D pintado, con tinta, desenfoque de lente y
cámaras que no paran. Three.js dentro de Chromium, ~2 s por fotograma en la nube. Sin descargas: las librerías están
en `kit/vendor/`. Viene del repo del océano (rama `claude/fervent-archimedes-c1dp80`).

## Carpetas
- `kit/`: el kit original. `kit/example/soldier/stills.jpg` = **la referencia de calidad (romanos)**.
- `herramientas/`: `tiempos_es.py` (tiempos reales de la voz; avisa si no coincide con el guion o se pasa de duración),
  `tiempos_estimados.py` (antes de la voz), `subtitulos.py` (subtítulos quemados), `comparar.py` (hoja junto a los
  romanos), `mix.py` (música y efectos al 50 % de la voz), `boca.py`, `gestos.js`, `preparar.sh`, `terminar.sh`
  (−14 LUFS y revisión sin congelados ni negros; `FRAMES=frames_sub` para usar los fotogramas con subtítulos),
  `fuentes/` (Inter Black, licencia OFL), `montar.sh` (montaje en paralelo y reanudable), `instalar.sh` (entorno listo
  tras un reinicio), `subtitulos_srt.py` (`.srt` para YouTube), `sonido.py` + `cortes.mjs` (música y efectos por tramos).
- `plantilla/`: punto de partida de cada vídeo (ver abajo). `videos/<N-titulo>/`: un vídeo cada uno (`./inercia video N`).
- `ejemplos/` (SOLO de consulta, NO se copian): `submarino/` (de dónde salen las técnicas), `efecto-cangrejo/` (el profesor y
  su pizarra en el aula), `truco-del-99/` (terraza, profesor con gestos y pizarra: primera prueba de la plantilla).

## La plantilla (técnicas del submarino, NO el submarino; SIN personajes ni lugares de serie)
- `web/_head.js` (motor) + `web/_piezas.js` (KIT de piezas) + `web/_world.js` (DECORADO A MEDIDA) + `web/_tail.js`
  (tarjetas y postproceso) + `web/_frame.js` (luces por plano, tarjetas con `fixedYaw`, transparencia, modo aditivo).
  `bash rebuild.sh` los junta en `main.js` y junta el reparto (`toon.js`). Ejecutarlo tras cada cambio.
- `web/_piezas.js`: `casa`, `cipres`, `pino`, `paisaje` (hierba, colinas, montañas y nubes del kit), `letrero` (una palabra
  QUE DIGA EL GUION), `estante` (tienda con productos y etiquetas de precio), `crearPizarra` (SOLO si el guion habla de
  una clase o una pizarra) y trazos a mano (`trazo`, `escribe`, `flecha`, `tacha`, `etiqueta`, `ticket`, `tarjetaT`,
  `bancoT`, `billeteT`, `tiendaT`, `coche`, `cerebro`, `vestido`). Lo nuevo que sirva para más vídeos se añade aquí.
- `web/story.js`: ya funciona solo con la voz: un plano por frase, ZOOM DE GOLPE automático en cada cifra, golpes de
  cámara en los «!», BARRIDO entre planos, luces por plano (día, tarde, nublado, dorada, dentro). Cada vídeo lo cambia:
  planos agrupados y atados a palabras (`en('palabra', n)`, `en('pues no')`), cámaras a medida, `actorsAt` (reparto),
  `fxAt` (efectos 2D: destellos, estrellas, polvo, monedas, billetes…), `worldAt` (lo que cambia en el decorado) y
  `SONIDOS` (efectos en su fotograma).
- `audio.py` → `herramientas/sonido.py`: música por tramos (acorde y carácter según la luz de cada plano, silencio antes
  de cada remate) y efectos (corte, golpe, remate, moneda, caja, billete, estrellas) sacados de story.js.
- `web/roman.js`: OUTFITS (mismo cuerpo y cara del kit; solo cambia la ropa) y poses. Ropa de hoy: `tshirt`, `apron`,
  `pants`, `sleeve`, `suit`, `tie`, `glasses`… Ejemplos: `clienta`, `tendera` (vídeo 2), `profesor` (cangrejo).
- `carta.mjs`: prueba de personajes sueltos: `node carta.mjs carta.png '[["clienta",{"R":"reach","expr":"grin"}]]'`.
- `web/insertos.js` (de Zingo/Citrino, en el estilo del kit): termómetro, manómetro, contador, reloj, comparativa, barra y
  capas, que se dibujan en una tarjeta de efecto mientras la voz canta la cifra (solo cifras que dice el guion).
- `subtitulos.json` (opcional): activar/desactivar, modo palabra o grupos, altura (`y`), tramos sin subtítulo, claves.

## REGLA DEL USUARIO: espacios y personajes SOLO si el guion los nombra (21 nov 2026)
- Nada de reutilizar lo guardado (terraza, profesor, pizarra…) si el guion no lo pide. Cada vídeo, su mundo.
- La ficha apunta `escena.lugares` y `escena.reparto` con las PALABRAS del guion que los justifican;
  `./inercia escena N` lo comprueba (y `fotos`/`montar` no siguen si falla, ni si story.js saca a alguien no apuntado).
- El profesor del canal es el NARRADOR: solo sale si el usuario o el guion lo piden (hablar a cámara al espectador).
- Lo que dice la voz PASA en el decorado (la tarjeta en el datáfono, las monedas que van al banco, las etiquetas que
  suben), no escrito en una pizarra. Textos en pantalla: solo palabras del guion (letreros) y los subtítulos.

## Hacer un vídeo
1. `./inercia video N` (copia la plantilla, pone el guion y tiempos estimados).
2. Decorado A MEDIDA en `web/_world.js`, ropa en `web/roman.js`, planos/pizarra/gestos en `web/story.js` → `bash rebuild.sh`.
3. Voz: `./inercia voz N` → tiempos reales; los planos se recolocan solos (se buscan por palabra).
4. Fotos: `./inercia fotos N "f1,f2,…"` → `stills/hoja.jpg` (con subtítulos y los romanos al lado). REVISAR cada
   imagen: textos cortados, personaje fuera de plano, cámara metida en algo, subtítulo sobre una cara, algo que no diga
   el guion. Corregir y enseñar. Esperar el «aprobado».
5. `./inercia montar N` (segundo plano) → `./inercia terminar N` → revisar `out/hoja_final.jpg` → enviar los 2 MP4.
6. `./inercia publicar N` → `publicar.md`.

## Reglas (del usuario)
- Calidad = romanos, lado a lado. Decorado A MEDIDA; solo se reutiliza algo si el guion lo menciona.
- Gestos del kit: caras fijas que cambian en la palabra clave (no mover la boca con la voz), `idle()` siempre, impulso.
- Encuadre: personajes más pequeños/lejos para que se vea el entorno; caras a pantalla completa solo 1-2 veces.
- Plano vertical estrecho: para leer una pizarra de 2,2 m entera, la cámara a ~5,5-6 m con fov 44-46.
- Textos de tiza grandes y trazos gruesos; nada pegado a los bordes de la pizarra (las patas del caballete van fuera).
- Subtítulos: centro-bajo (y = 0,70), blancos con borde oscuro, cifras y claves en amarillo; si tapan una cara, moverlos
  con `posiciones` en `subtitulos.json`.
