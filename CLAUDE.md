# Canal «Inercia del consumo» (economía, en español)

Vídeos LARGOS (10-15 min, horizontal 1920×1080, español neutro para España y Latinoamérica) con historias REALES de
dinero. Formato propio **«Sigue el dinero»** (`docs/formato.md`): la historia es un viaje por la **Ciudad Inercia**
(mundo 2D a tinta y acuarela, `src/mundo`) con el protagonista (el espectador) dentro. Motor 2D NUEVO en Remotion
(`src/motor`), sin 3D. Historias y personajes propios: no copiar otros canales.
Habla con el usuario en español llano, frases cortas y pasos numerados. Puede trabajar solo mientras está fuera.

**Personaje:** ficha en `docs/personaje.md` (LEER antes de tocarlo). Debe ser EXACTAMENTE igual a
`referencias/personaje.png` y `referencias/expresiones.png`: por eso se usan los DIBUJOS DEL USUARIO recortados
(`programa/recortar.py` → `public/personaje/`), nunca un dibujo hecho con código (el usuario lo rechazó dos veces).

## Estado (18 nov 2026)
- HECHO: el protagonista = 7 dibujos del usuario recortados (hoja `personaje`). FALTAN dibujos de cuerpo entero
  (de pie neutro, hablando, señalando, contento, caminando…) y los demás personajes: pedirlos al usuario.
- HECHO: motor 2D nuevo. La ciudad (casa, banco, bolsa, mercado, puerto, cajeros, gobierno) con paralaje, cosas que
  se mueven (nubes, pájaros, barcos, bandera, imprenta de billetes, pantalla de bolsa). Cámara automática con «zoom
  golpe», deriva continua y VUELO siguiendo a un billete entre lugares. Nube de pensamiento (gráfico, cifra,
  comparación, dinero). Contador del bolsillo, sello «¡PERO!», rótulos de papel, lluvia de billetes, líneas,
  subtítulos con la letra de la portada (Rubik Dirt). Idea 90 = ejemplo de 15 s (no es guion del canal).
- HECHO: ritmo por escena (calma/normal/alta) y límites automáticos de efectos para vídeo largo (docs/formato.md).
- GUARDADO: todos los gráficos en `graficos/` (LEEME.md). EN PAUSA (19 nov 2026): el usuario va a estudiar y
  replantear el MODO DE EDICIÓN. No crear ni cambiar nada del motor hasta que él traiga la nueva dirección.
- HECHO: montaje POR TRAMOS que se retoma (`canal montar N`); borrador automático (`canal borrador N`).
- PENDIENTE (en este orden, poco a poco con el usuario): 1) visto bueno del ejemplo; 2) más detalle en la ciudad
  y lugares nuevos que pida la historia (fábrica, tienda, aeropuerto, interiores…); 3) elegir voz; 4) guion piloto.
- Decisiones del usuario pendientes: voz de ElevenLabs, nombre del protagonista, idea del piloto.
- El usuario pidió NO guardar cosas del motor viejo del océano (ya borrado; queda en el historial de git).

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

## Cómo se escribe una idea (`src/ideas/N.ts`, tipos en `src/motor/tipos.ts`)
- Escena = `{ desde: índice de palabra, lugar, actores, nube?, planos?, rotulos?, golpes? }`; `contador` en la idea.
- Actores: `{ quien: "banquero", x: desplazamiento en px desde el lugar, mira, narra, acciones }`. Acciones por
  palabra: cara, pose, habla, signo, va (camina a x), mira.
- La cámara elige sola; `planos` solo para forzar (general, edificio, medio, cerca, contra, dos, detalle).

## Proceso
1. Guion aprobado → `./canal guion nuevo N "Título"`, rellenar la ficha (`guion` = texto EXACTO de la voz, `dato`,
   `fuentes`), `./canal guion N` (escribe el .txt y el BORRADOR de escenas, ya apuntado en `src/ideas/lista.ts`).
2. Retocar `src/ideas/N.ts` → `npx tsc --noEmit -p .`
3. `./canal prueba N` + `./canal revisar N --prueba` (hoja con una foto por escena) y fotos sueltas (`foto N SEG`).
4. Llega el MP3 → «Pon aquí tu voz» → `./canal voz N` → `./canal revisar N` → `./canal montar N` (en segundo
   plano; si para por tiempo, relanzar la MISMA orden hasta que diga «Vídeo listo») → enviar el vídeo.
5. La variante se guarda por idea en `Textos/variantes.json`. Guardar y subir; actualizar el «Estado».

## Órdenes (`./canal …`)
`comprobar` · `ideas` · `guion nuevo N "Título"` · `guion N` · `borrador N [--forzar]` · `voz N` · `prueba N` ·
`revisar N [--prueba]` · `foto N SEG [--prueba]` · `montar N [--prueba] [--rapido] [--nueva | --variante S]
[--tramo S] [--max-minutos M]` · `todo N`. Hojas: `npx remotion still src/index.ts mundo|personaje salida/x.png`. Recortar dibujos: `python3 programa/recortar.py img nombre`.
En la nube, antes de nada: `pip install -r instalador/requirements.txt` y `npm ci`.
