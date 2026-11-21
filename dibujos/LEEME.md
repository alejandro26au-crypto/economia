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
  `fuentes/` (Inter Black, licencia OFL).
- `plantilla/`: punto de partida de cada vídeo (ver abajo). `videos/<N-titulo>/`: un vídeo cada uno (`./inercia video N`).
- `ejemplos/submarino/`: SOLO de consulta (de dónde salen las técnicas). `ejemplos/efecto-cangrejo/`: el profesor y su
  pizarra en el aula (primer short del canal).

## La plantilla (técnicas del submarino, NO el submarino)
- `web/_head.js` (motor) + `web/_world.js` (DECORADO A MEDIDA) + `web/_tail.js` (tarjetas y postproceso) + `web/_frame.js`
  (luces por plano, tarjetas con `fixedYaw`, transparencia y modo aditivo). `bash rebuild.sh` los junta en `main.js`
  y junta el reparto (`toon.js`). Ejecutarlo tras cada cambio.
- `web/_world.js` de ejemplo: la terraza del profesor (villa, valle con pueblo, cipreses, nubes del kit, luz de día de
  los romanos) y **la pizarra de tiza** con sus trazos reutilizables: `trazo`, `escribe`, `flecha`, `tacha`, `etiqueta`
  (precio), `ticket`, `vestido`, `coche`, `cerebro`, `monigote` (del cangrejo). Cada frase = un `tema` en
  `dibujaPizarra`, y SOLO dibuja lo que dice el guion.
- `web/story.js`: planos que empiezan en una PALABRA (`en('palabra', n)` o `en('más caro', 2)` sobre `web/tiempos.js`),
  luces por plano (día, tarde, nublado, dorada), `camFromKeys` con golpes (KICKS), **zoom de golpe en cifras**
  (ZOOMS), **barrido rápido entre planos**, efectos 2D (destello, estrellas, polvo), y el **profesor** con los gestos
  del kit: CLAVES (4-5 cambios de brazos), CARAS que cambian en la palabra clave, asentir, negar, pisotón, risa, `idle`.
- `web/roman.js`: OUTFITS (el `profesor`: traje, corbata y gafas doradas; mismo cuerpo y cara del kit) y poses
  (hang, point, up, wave, hip, belly, temple, lift, reach, cheek, cross, thumb, open, beat, shh, hold, mouth, cheer).
- `carta.mjs`: prueba de personajes sueltos: `node carta.mjs carta.png '[["profesor",{"R":"point","expr":"grin"}]]'`.
- `audio.py`: música por tramos y efectos en cortes y golpes (el del submarino: reescribir la tabla de cada vídeo).
- `subtitulos.json` (opcional, en la carpeta del vídeo): activar/desactivar, modo palabra o grupos, altura, tramos sin
  subtítulo y palabras clave en amarillo (ver la cabecera de `herramientas/subtitulos.py`).

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
