# Canal de economía (en español)

Vídeos LARGOS (10-15 min, horizontal 1920×1080, en español) con historias REALES de dinero y economía: escenarios
3D (Three.js, acabado "3D ilustrado" con contorno de tinta) con personajes 2D dentro, cámara que nunca para y efectos
de sonido en cada cambio. El motor viene del canal del océano (repositorio `oceano-animado-`). Historias y
personajes propios: no copiar otros canales.
Habla con el usuario en español llano, frases cortas y pasos numerados. Puede trabajar solo mientras está fuera.

**Lee `docs/catalogo.md` SOLO cuando haga falta:** catálogo de escenarios, modelos 3D y reparto heredados del
océano (para reutilizar) y estructura del código. Piezas para decorados: `src/motor/atrezo.ts`.

## Estado (18 nov 2026)
- Canal: **Inercia del consumo** (youtube.com/@Inercial.delconsumo). Logo `public/marca/logo.png`, portada
  `referencias/portada.png`, personaje `referencias/personaje.png` y caras `referencias/expresiones.png`.
- HECHO: especie del canal (`src/reparto/figura.tsx`, boceto a tinta como la referencia: cabeza redonda, pelo de
  mechones, ojos blancos grandes, camiseta oscura rayada a lápiz, palitos) y reparto de ejemplo en `reparto.ts`
  (protagonista, banquero, inversor, politico, trabajador, monarca, estafador). Hojas: `especie` y `reparto`
  (`npx remotion still src/index.ts especie salida/especie.png`). Signos de cómic (`signos.tsx`): acción
  `{ hace: "signo", signo: "pregunta" | "exclama" | "enfado" | "sudor" | "susto" | "velocidad" | "idea" | "dinero" }`.
  Poses nuevas: `cabeza` (manos a la cabeza) y `agotado`. `alcanza()` lleva una mano a un punto (PUNTOS).
- HECHO: estilo PAPEL Y LÁPIZ para todo el 3D (`ilustrado.tsx`, `papel`): color apagado tipo acuarela, rayado en
  sombras y grano. Letra de la portada (Rubik Dirt, `public/fuentes`): subtítulos en tinta azul noche con halo de
  papel; rótulos como etiquetas de papel. Colores de marca en `textos.tsx` (PAPEL, TINTA_MARCA, ORO, SALVIA).
- HECHO: montaje POR TRAMOS (`canal montar N`): tramos de 45 s que se guardan; si se corta, se relanza la misma orden
  y sigue. En la nube para solo a los 100 min (`--max-minutos`). Audio entero aparte; une sin recomprimir.
  Velocidad medida: ~0,7 s por fotograma → 12 min de vídeo ≈ 4 h (3 lanzamientos en la nube).
- HECHO: borrador automático (`canal borrador N`): escenas cada 40-80 palabras, escenario por palabras clave,
  reparto que se nombra, caras/poses/signos por frase, rótulos con las cifras. Luego se retoca a mano.
- HECHO: escenarios nuevos `banco` (cámara acorazada abierta) y `salon` (tu casa: facturas, hucha, tele con IPC)
  en `escenarios-economia.tsx`. Idea 90 = EJEMPLO de 15 s (no es guion del canal).
- PENDIENTE: decisiones del usuario (voz, nombre del protagonista, visto bueno a la especie y al estilo papel);
  más escenarios de economía (bolsa, despacho del gobierno, calle/supermercado, fábrica…); guion del piloto.
- Público: España y Latinoamérica (español neutro).

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
1. Guion aprobado → `./canal guion nuevo N "Título"`, rellenar la ficha (campo `guion` = texto EXACTO), `./canal guion N`
   (escribe el .txt y el BORRADOR automático de escenas, ya apuntado en `src/ideas/lista.ts`).
2. Retocar las escenas en `src/ideas/N.ts` (planos, acciones, rótulos) → `npx tsc --noEmit -p .`
3. `./canal prueba N` + `./canal revisar N --prueba`: hoja de escenas + chequeo automático de planos.
4. Llega el MP3 → «Pon aquí tu voz» → `./canal voz N` → `./canal revisar N` → fotos clave → `./canal montar N`
   (en segundo plano; si para por tiempo, relanzar la MISMA orden hasta que diga «Vídeo listo») → enviar el vídeo.
5. La variante (cámara) se guarda por idea en `Textos/variantes.json`.
6. Guardar y subir; actualizar el «Estado» de arriba.

## Órdenes (`./canal …`)
`comprobar` · `ideas` · `guion nuevo N "Título"` · `guion N` · `borrador N [--forzar]` · `voz N` · `prueba N` · `revisar N [--prueba]` ·
`foto N SEG [--prueba]` · `montar N [--prueba] [--rapido] [--nueva | --variante S] [--tramo S] [--max-minutos M]` · `todo N` (voz + montar).
En la nube, antes de `voz`: `pip install -r instalador/requirements.txt` y `npm ci`.
