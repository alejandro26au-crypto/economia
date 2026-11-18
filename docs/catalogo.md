# Catálogo heredado del canal del océano

Se lee SOLO cuando hace falta (buscar un escenario, modelo o personaje para reutilizar, o recordar un vídeo viejo).
Lo esencial y las reglas están en CLAUDE.md. Las piezas sueltas para decorados están en `src/motor/atrezo.ts`.

## Índice rápido para REUTILIZAR escenarios (nombre → qué es, luz)

| Archivo | Escenarios |
|---|---|
| `escenarios-economia.tsx` (canal de economía) | banco (sala de mármol, ventanillas, cámara acorazada abierta con oro, ventanales fríos) · salon (tu casa al anochecer: sofá, mesita con facturas y hucha, tele con IPC, cocina, lámpara cálida) |
| `escenarios-holland.tsx` (vídeo 8) | astillero (muelle 1898, atardecer) · astillero-fiesta (mismo muelle, día, banderas) · aula (escuela 1875, noche de nieve) · ministerio (despacho oficial, atardecer por la ventana) · guarida (trastienda de conspiradores, velas) · canal (dársena de noche, luna) · taller (tanque de cristal, compresor) · bahia (bajo el agua, verde) · nave (astillero moderno, focos fríos) |
| `escenarios-olas.tsx` (vídeo 5) | tormenta (cubierta en tormenta) · academia (sala de científicos 1900) · expediente (oficina de investigación) · draupner (plataforma de gas de noche) · control (sala de control 1995) · espacio (Tierra y satélite) · bar (bar de puerto con neón) |
| `escenarios-pirata.tsx` (vídeo 4) | taberna · trono · puerto (muelle español, atardecer) · abordaje · consejo (cubierta de noche) · bodega (botín) · enfermeria · aseguradora (oficina moderna) |
| `escenarios-nuevos.tsx` | fortaleza (muralla de noche) · camarote (del capitán, el listón de calidad) · templo (hundido) |
| `escenarios-habakkuk.tsx` (vídeo 3) | atlantico / atlantico-alba (mar con icebergs) · convoy / convoy-dia · almirantazgo (sala de mapas) · club (chimenea) · frigorifico · gabinete (búnker) · cristal · lago |
| `escenarios-azorian.tsx` (vídeo 2) | pacifico / pacifico-noche · muelle (1974) · oficina (años 70) · glomar · vigia · abismo |
| `escenarios.tsx` (vídeos 0-1) | barco · submarino (interior) · arrecife · profundo · naufragio · laboratorio (años 40) · palacio · piso · casa · aquarius |

Modelos 3D útiles para reutilizar: holland (submarino antiguo; ram, corte con tanques), virginia (submarino moderno),
cheque, lastre (bola que cae), ola (ola monstruo), satelite, glomar, buque, garra, k129, uboot, carguero, avion, titanic,
torpedo, submarino (años 40), gamba, pulpo. Reparto 2D: ver `src/reparto/reparto.ts` (pirata, grumete, capitan,
marinero, farero, pescador, cocinero, cientifica, exploradora, rey, hoplita, millonario, turista, sabio, cirujano,
oficial, oficinista, operario, profesor, maestro, almirante, rebelde).

## Historial de vídeos

- **Hecho:** vídeo 4 = idea 6 «Pirates Had Better Health Insurance Than You» (65 s, voz de ElevenLabs «Skylar -
  Viral Zillennial»), montado y entregado. Es la referencia del formato actual: 8 escenarios propios
  (`escenarios-pirata.tsx`), reparto 2D, tono efusivo, golpes/líneas/zoom/rótulos, puesta en escena automática.
- **Vídeo 5 = idea 7 «For 100 Years, Sailors Who Saw Giant Waves Were Called Liars» (olas monstruo):** guion de
  165 palabras con tono efusivo; PRUEBA DE FORMATO: la voz DICE «Did you know?» y cierra con «Now you know.» (sin
  loop). Voz de ElevenLabs (Skylar, 67,5 s). 9 escenas y 7 escenarios PROPIOS (`escenarios-olas.tsx`): tormenta
  (velero en tormenta con la ola gigante) | academia (sala de científicos de 1900, pizarra «IMPOSSIBLE») |
  expediente (investigación marítima: «LOST AT SEA», «CASE CLOSED») | draupner (plataforma de gas, 1995, láser rojo,
  antorcha, grúa, helipuerto) | control (pantalla con el pico de 25,6 m, registrador, alarma) | espacio (Tierra y
  satélite de radar) | bar («The Rogue Wave»). Modelos nuevos (`modelos-olas.tsx`): ola (chasca = sube ~3 s, rompe y
  se hunde; extra.rumbo) y satelite. Reparto nuevo: operario (casco de obra) y profesor (bombín). Texturas en
  `texturas-olas.ts`. En `src/ideas/7.ts` las escenas empiezan por ÍNDICE de palabra (`desde: 53`), lo más seguro.
- **Vídeo 8 = idea 8 «Why Don't Submarines Sink» (John Holland, el maestro del que se rio la Marina):** tema
  pedido por el usuario («¿por qué flotan los submarinos?»). 164 palabras, tono efusivo; la voz EMPIEZA con «Ever
  wondered why a submarine floats?» (decisión del usuario, variante del «Did you know?») y cierra con «Now you
  know.». Voz de ElevenLabs (Skylar, 70,4 s). 9 escenas por índice de palabra y 8 escenarios PROPIOS
  (`escenarios-holland.tsx`): astillero (muelle de 1898 al atardecer, el Holland flotando) | astillero-fiesta (el
  mismo muelle en 1900 con banderines y bandera) | aula (Paterson 1875, pizarra con el submarino a tiza, estufa,
  nieve) | ministerio (despacho de la Marina, carta «REJECTED», pecera) | guarida (fenianos: bandera verde con
  arpa, fajos de dólares, mapa con buques tachados) | canal (dársena del canal Morris de noche, el Fenian Ram) |
  taller (tanque de cristal con el submarino abierto, compresor) | bahia (bajo el agua) | nave (astillero de hoy
  con el Virginia). Modelos (`modelos-holland.tsx`): holland (extra.ram = Fenian Ram; extra.corte = tanques a la
  vista que se llenan al bajar respecto a su alto inicial hasta extra.prof y se vacían con chasca; extra.cabecea =
  baja de proa y, con chasca, se para el motor y sube; extra.rumbo gira el casco) | virginia | cheque (chasca =
  brilla) | lastre (bola de acero: chasca = cae extra.caida anchos). Reparto nuevo: maestro (Holland: bombín,
  gafas, bigote), almirante (EE. UU. 1875) y rebelde (feniano: gorra plana nueva «gorra», barba pelirroja).
  Texturas en `texturas-holland.ts`. Ojo: los planos «detalle» de modelos pequeños o dentro de un tanque meten la
  cámara dentro; usa «cerca», «lateral» o «general».

**ESTADO (nov 2026):** vídeo 3 = idea 4 «The Warship Made of Ice» (Proyecto Habakkuk, 1942-43), formato NUEVO
«Did you know?» SIN BENT: la historia y los escenarios son los protagonistas (el usuario lo prefiere así para este
formato). 13 escenas, 10 escenarios nuevos (aurora boreal, convoy en tormenta, Almirantazgo, club, frigorífico de
Smithfield, búnker de Churchill, interior del pykrete, lago Patricia), 3 personas y 12 modelos nuevos. La cámara ve
hasta `lejos` metros (DatosEscenario; por defecto 400): en mar abierto hace falta más, y el `Cielo` necesita `radio`.
Antes: vídeo 2 = idea 2 «The Mining Ship That Never Mined» (Proyecto Azorian, historia real de
la CIA en 1974): 10 escenas, 7 escenarios nuevos, 3 personajes y 6 modelos 3D nuevos. Regla del usuario: cada
vídeo MEJOR que el anterior y en sitios distintos; crear escenarios, personajes y situaciones nuevos siempre que
ayude a que cada palabra tenga su imagen. Formatos en prueba: premisa absurda de la vida real (vídeo 1) e
historia real contada con la fórmula (vídeo 2). Idea 3 (el pez que zumba en Sausalito) queda guardada.
Antes: primer vídeo de verdad = idea 1 «How to Build a House at the Bottom of the Sea» (tono
adulto, absurdo y seco; voz de ElevenLabs en «Pon aquí tu voz»). Motor, estilo y personajes 3D terminados.
Estilo de guion preferido: premisa absurda de la vida real (alquiler, casero…) llevada al océano + datos reales;
narrador serio e irónico, nada de tono de cuento infantil. Idea 0 = vídeo de prueba de 60 s (gamba pistola
y sonar en la 2ª Guerra Mundial, con BENT de operador de sonar). La primera idea de verdad será la 1. Contenido en
inglés; más adelante se puede sacar también en español (solo cambian guion, voz y rótulos).

## Dirección «What if…?» y acabado ilustrado (15 nov 2026)

**DIRECCIÓN NUEVA (15 nov 2026): formato «What if…?» + acabado "3D ilustrado".** El vídeo 3 solo tuvo ~30 vistas:
se cambia de rumbo. Referencia visual: los shorts de Rick's Clips (personajes 2D de contorno grueso dentro de
escenarios 3D muy detallados), pero con identidad propia y MEJOR: más detalle, luz cálida contra fría, contorno
de tinta en todo el 3D.
- **Contenido:** cada short es una pregunta «What if you…?» que el espectador se imagina haciendo (gritar al mar,
  beber agua de mar, encontrar la Atlántida, caer a la fosa…), contestada con un dato REAL y sorprendente. El
  gancho es la propia pregunta en el primer segundo; el protagonista del reparto la vive en pantalla; la respuesta llega rápido y seca.
  Ejemplos cortos (8 s) para ver el estilo: ideas 90 (fortaleza: pirata y grumete), 91 (camarote: grumete y
  capitán) y 92 (templo: exploradora y Platón/sabio).
- **Acabado ilustrado (`src/motor/ilustrado.tsx`), para TODOS los escenarios:** sombra en bandas (los materiales
  realistas pasan a "toon"), contorno de tinta automático en siluetas y aristas (bordes por profundidad y normales,
  se pierden con la niebla) y etalonaje (más saturación, sombras frías y luces cálidas). Lo transparente, los
  sprites, lo "basica" y los efectos no llevan contorno.
- **NIVEL DE CALIDAD (15 nov 2026): el del CAMAROTE (ejemplo 91).** Al usuario le gusta su CALIDAD gráfica, no
  que todo se parezca a él: el camarote es el listón, NO una plantilla. Cada escena necesita su PROPIO entorno,
  distinto e interesante, pensado para lo que cuenta esa frase (una taberna, la sala de un faro, una cubierta en
  tormenta, una playa, un almirantazgo…): variedad de sitios, épocas, luz (día, noche, tormenta, fuego, bajo el
  agua) y paletas. Lo que se mantiene en todos es el NIVEL: muchos objetos con texturas pintadas y con historia,
  luces que brillan (cálidas contra frías), colores ricos, contorno de tinta y el personaje grande con el decorado
  lleno detrás. Si un escenario no llega a ese nivel, se mejora antes de usarlo.
- **Escenarios nuevos (`src/motor/escenarios-nuevos.tsx`), el nivel a partir de ahora:** fortaleza (muralla de
  una fortaleza marina de noche: antorchas, torre, cañón, luna, faro y pueblo abajo) | camarote (del capitán:
  ventanales de popa con el mar a la luz de la luna, escritorio con mapa y velas, farol que se mece, cofre del
  tesoro) | templo (templo hundido: columnas con coral, mosaico, cabeza colosal, tridente dorado, medusas). Usan
  texturas pintadas con código (`src/motor/texturas-pintadas.ts`: piedra, losas, madera, alfombra, mosaico, mapa,
  estandarte). Para un escenario nuevo: muchos objetos con textura pintada, 1-3 luces cálidas reales (fuego,
  farol, velas: `Fuego`, `Resplandor`) contra una luz fría de luna o agua, y fondo con siluetas lejanas.
- **EL REPARTO (protagonista distinto en cada vídeo, decisión del usuario):** BENT deja de ser la mascota fija. Cada
  vídeo elige el protagonista que pide la historia del catálogo `src/reparto/reparto.ts`: pirata, grumete, capitan,
  marinero, farero, pescador, cocinero, cientifica, exploradora, rey, hoplita, millonario, turista, sabio. Son
  personajes 2D de "palito" (`src/reparto/figura.tsx`): cabeza blanca grande, cara limpia (ojos ovalados negros con
  brillo, cejas gruesas de punta redonda que cuentan la emoción, bocas limpias; `caraReparto` = expresiones
  naturales, la neutra sin ceño y las cejas acompañan la voz), tronco pequeño con la ropa del papel y brazos y
  piernas de tinta. Usan las mismas poses y animaciones que BENT. En la idea: cualquier persona con
  `extra: { figura: "pirata" }` (el `tipo` solo da tamaño; usa una persona: bent, marinero, capitan…).
  Hoja para ver a todos: composición `reparto` (`npx remotion still src/index.ts reparto salida/reparto.png`).
  Para uno nuevo: añade un `Diseno` en reparto.ts (ropa, colores, pelo, sombrero, bigote/barba, parche, gafas,
  barriga, escala). Las caras deben COINCIDIR con la frase: neutra por defecto, cambia en la palabra exacta
  (enfadado al gritar, sorpresa al descubrir, risa en el remate, triste al perder…); nada de "chulo" por defecto.
- BENT 2D sigue disponible con `extra: { dosd: true }` (muñeco `src/bent/rig.tsx`); sin nada, las personas van en 3D.

## Estilo anterior y BENT (vídeos 1-3)

**Estilo anterior (vídeos 1-3):** oscuro y cinematográfico, como el logo (`referencias/logo.jpg`). Entornos 3D con luz
realista, niebla, rayos de luz y siluetas lejanas; personajes PEQUEÑOS en el encuadre (que se vea el entorno);
subtítulos pequeños (60 px). Aspecto para ADULTOS: nada de caricatura infantil (ni mofletes, ni ojos saltones,
ni colores chillones), tampoco en animales ni entornos.
- Protagonista: **BENT** (tipo `bent`), referencia en `referencias/personaje.jpg`. Es un personaje **3D** hecho con
  piezas en código (`src/bent/bent3d.tsx`), con sombreado de cómic (3 tonos) y contorno negro: cabeza blanca con su
  cara pintada como textura (cambia de expresión y mueve la boca), gorra azul marino hacia atrás, sudadera con
  capucha y bolsillo, mochila, pantalón ancho y zapatillas. Lleva su propia luz de cine. Se anima solo
  (`src/bent/animaciones.ts`): quieto, camina, corre, habla (gesticula), senala, piensa, encoge, saluda, victoria,
  asustado, cruza, salta, mira. Caras: seria, chulo, enfadado, feliz, risa, sorpresa, asustado, triste, piensa,
  dormido, aburrido. Claude puede añadir animaciones nuevas libremente.
- **Toda la población es de su ESPECIE** (mismo cuerpo 3D y cabeza blanca) pero cada uno con su atuendo
  (`ATUENDOS_3D` en bent3d.tsx): marinero (gorro blanco, cuello azul), capitan (gorra de capitán, barba, más
  corpulento), cientifico (bata, gafas, pelo canoso), rey (corona, capa, bigote). Para uno nuevo: añade un
  `Atuendo3D`, su tipo en `Criatura` (tipos.ts) y en `personajes.ts` (MODELOS_3D, colores y tamaños).
- La versión 2D del muñeco (`src/bent/rig.tsx`) queda de reserva; `ficha-cerca` la compara con la referencia.
- Ejemplos cortos (~9 s, ~2 min de montaje): 93 = escenarios nuevos, 97 = población, 98 = BENT 3D, 99 = BENT 2D (`prueba N`, `montar N --prueba`).
- Animales y vehículos: MODELOS 3D con material realista (`modelos3d.tsx`: gamba, submarino), no dibujos.

## Catálogo de escenarios, modelos y reparto


Una idea = 5-8 escenas (cada cambio de escena es un corte con golpe de sonido: pocos). Cada escena:
- `desde`: palabra donde empieza ("so#2" = la 2ª vez contando desde el inicio de la escena anterior).
- `escenario` del vídeo del seguro pirata (`escenarios-pirata.tsx`): taberna | trono (salón del trono español) |
  puerto (muelle español al atardecer con carteles WANTED) | abordaje | consejo (mesa del contrato en cubierta, de
  noche) | bodega (del botín) | enfermeria (del cirujano) | aseguradora (oficina de seguros moderna). Reparto
  nuevo: cirujano, oficial (español), oficinista.
- `escenario` NUEVOS (`escenarios-nuevos.tsx`): fortaleza (camino de ronda: x 0..1 = de pretil a almenas, el mar
  a la derecha, la torre al fondo) | camarote (alfombra en el centro, escritorio al fondo, cofre a la derecha) |
  templo (pasillo de columnas, escalinata y tridente al fondo).
- `escenario` (3D, `src/motor/escenarios.tsx`): barco (buque al atardecer) | submarino (interior) | arrecife |
  profundo | naufragio (barco hundido, como el logo) | laboratorio (años 40) | palacio | piso (piso de BENT en la
  ciudad) | casa (fondo del mar con la caja de cristal de BENT) | aquarius (base submarina real, cilindro sobre patas)
  | pacifico / pacifico-noche (mar abierto; barcos con alto -0.3) | muelle (puerto de 1974) | oficina (despacho y
  sala de prensa de los 70, con atril: persona detrás en z 1.43) | glomar (cubierta de noche con el pozo central y
  la torre; garra colgada en x 0.5, z 3.08) | vigia (cubierta soviética mirando al barco iluminado) | abismo
  (fondo a 5.000 m con nódulos). Código en `escenarios-azorian.tsx`.
  Vídeo 3 (`escenarios-habakkuk.tsx`): atlantico (noche con aurora boreal e icebergs) | atlantico-alba (amanecer
  rosa) | convoy (1942, tormenta, mercante ardiendo, bengalas) | convoy-dia | almirantazgo (mapa del Atlántico con
  el «AIR GAP»; mesa de trazado: lo que va encima en z 0.55, alto 0.875) | club (chimenea; mesita en x 0.5 z 0.3,
  alto 0.78) | frigorifico (cámara de Smithfield; banco en z 0.3, alto 0.91) | gabinete (búnker de Churchill) |
  cristal (dentro del pykrete: cristales y fibras) | lago (lago Patricia entre las Rocosas).
- `actores`: `tipo` = bent | marinero | capitan | rey | cientifico (personas 3D, `src/bent/bent3d.tsx`) o
  gamba | pulpo (con sus dos cocos; anda de puntillas con pose camina) | submarino (modelos 3D, `modelos3d.tsx`).
  Vídeo 2 (`modelos-azorian.tsx`): glomar (barco con torre; extra.noche) | buque (espía soviético; extra.foco,
  extra.noche) | garra (chasca = se cierra) | k129 (chasca = se parte y la popa cae) | lata (chasca = aplastada) |
  nodulo. Personas nuevas: millonario (traje y sombrero), agente (CIA, gafas de sol), sovietico (gorro de piel).
  Vídeo 3 (`modelos-habakkuk.tsx`): habakkuk (portaaviones de hielo; extra.noche, extra.aviones; chasca = se
  derrite) | uboot | carguero (chasca = torpedo: arde y se hunde) | avion (extra.motores 2 o 4; color) | titanic |
  hielo (chasca = añicos) | pykrete (chasca = la bala rebota) | bala | torpedo | vaso (whisky con el barco de
  cubito) | plano (plano secreto) | prototipo | grieta (chasca = avanza y se frena). Personas: inventor (Pyke),
  almirante, churchill (pajarita y puro). En `src/ideas/4.ts` las palabras van por índice con `w("palabra", vez)`.
  `extra.rumbo` (grados) gira el cuerpo de una persona: 180 = de espaldas (para que miren algo del fondo). `x` 0..1 (izq→der del escenario), `z` 0..1 (delante→fondo), `alto` metros sobre el
  suelo, `tam` ANCHO en metros (persona ≈ 0.73 → 1,8 m de alto), `nombre` para la cámara, `pose` inicial.
  `acciones` atadas a palabras: cara (normal, chulo, enfadado, feliz, risa, sorpresa, asustado, triste, piensa,
  dormido, aburrido), pose (bolsillos, brazos, camina, corre, senala, piensa, encoge, saluda, victoria, celebra,
  asustado, cruza, salta, mira; con `hasta` opcional). Para andar: pose camina + mueve. habla, rie, senala,
  chasca (gamba), salta, gira, tiembla, late, brilla, encoge, crece, escala, desaparece, mueve, mira.
- `planos` (opcional): `{ en, tipo, a }` fuerza un plano en una palabra. Tipos: general, cerca, detalle,
  contrapicado, picado, lateral, orbita. Si no, la cámara elige sola cada ~2,5 s y mira a quien hace algo.
- `efectos`: burbujas, rayos, nieve, plancton, banco, alarma (en 3D); destello, oscuridad, linterna (pantalla).
- `sonidos`: `{ en, s }` con whoosh1-3, golpe, pop, boing, raro, ding, chasquido, sonar. Ya suenan solos: whoosh en
  cada cambio de cámara, golpe en cada escena, raro en cada "weird", pop/boing/chasquido con sus acciones.
- `rotulos` (textos grandes, y≈0.15) y `profundidad` ("-20 m"). Sin emojis ni símbolos raros en la letra.
- Subtítulos abajo (y ≈ 0.70); rótulos arriba (y ≈ 0.14), sobrios. Los personajes quedan en el centro.
- **Subtítulo sin repetir el rótulo (decisión del usuario, 17 nov 2026, `textos.tsx`):** mientras un rótulo está en
  pantalla, el subtítulo quita las palabras que ya dice (comparadas sin signos: «$150,000» = «150,000»). Si todas
  las palabras del golpe están en el rótulo, no sale subtítulo; si solo algunas, se quitan las palabras clave (4+
  letras o cifras) y quedan las cortas («HIM»). Automático en todos los vídeos: escribe los rótulos con las mismas
  palabras que dice la voz cuando quieras que sustituyan al subtítulo.

## Estructura

- `src/motor/`: `Short.tsx` (montaje y sonidos), `camara.ts` (planos y movimiento), `escenarios.tsx` +
  `escenarios-datos.ts` (3D: medidas, color de luz que tiñe a los personajes y niebla), `piezas3d.tsx` (piezas con
  material realista, rocas irregulares), `modelos3d.tsx` (vehículos 3D), `actor.tsx` (personaje 2D proyectado en
  el 3D), `src/bent/` (muñeco y animaciones), `estado.ts`, `personajes.ts` (registro), `efectos.tsx`,
  `textos.tsx`, `tiempo.tsx`, `estilo.ts`.
- `referencias/`: logo y hojas del personaje (solo para mirar; no se usan en el vídeo). `public/marca/logo.jpg`.
- La cámara esquiva obstáculos: antes de cada plano comprueba que nada (obstáculos del escenario u otros
  personajes) tape al personaje y, si hace falta, gira alrededor de él, sube o se acerca (`ajustesPlanos` en
  camara.ts). Los obstáculos de cada escenario son cilindros `[x, z, radio, alto]` en `obstaculos`
  (escenarios-datos.ts): si añades algo grande a un escenario, apúntalo ahí.
- Nuevo escenario: añádelo en `escenarios.tsx`, sus medidas y obstáculos en `escenarios-datos.ts` y el nombre en `Escenario`.
  Deja libre el centro (los personajes 2D siempre se pintan delante del 3D).
- `programa/oceano.py` — las órdenes. Los efectos de sonido se generan con ffmpeg en `public/sfx/`.
- En la nube el 3D se dibuja por software (lento: ~6 min por short a media resolución); en Mac/PC usa la gráfica.
