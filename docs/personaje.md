# Ficha del personaje — «Inercia del consumo»

Referencias: `referencias/personaje.png` (pose y cara), `referencias/expresiones.png` (6 caras), logo
`public/marca/logo.png` y portada `referencias/portada.png`. Código: `src/personaje/figura.tsx` (dibujo),
`pose.ts` (esqueleto), `animaciones.ts` (movimientos), `reparto.ts` (ropa de cada uno), `signos.tsx` (¡! ¿? …).
Hojas para comparar: `npx remotion still src/index.ts especie salida/especie.png` y `… reparto salida/reparto.png`.

## REGLA (19 nov 2026, decisión del usuario)
El personaje debe ser EXACTAMENTE igual a la referencia, sin diferencias. Por eso NO se dibuja con código: se usan
SUS DIBUJOS tal cual, recortados del fondo con `programa/recortar.py` (fondo blanco y huecos entre brazo y cuerpo
→ transparentes; cara y manos se quedan) y guardados en `public/personaje/NOMBRE.png`. Las medidas (dónde está la
cara, si se ven los pies) se apuntan solas en `src/personaje/poses.ts`. El motor los anima como «imágenes
animadas» (`src/personaje/Dibujo.tsx`): respira, bota al hablar, «pop» al cambiar de dibujo, línea que hierve.

Dibujos que hay: piensa (de pie, mano en la mejilla), corre, lee (sentado con libro), cabeza (manos a la cabeza),
enfadado (brazos cruzados), agotado, sentado (piensa sentado). cabeza, enfadado y sentado están CORTADOS por las
rodillas en la hoja original: la cámara los encuadra de cintura para arriba.
Para añadir uno: `python3 programa/recortar.py imagen.png nombre [x0 y0 x1 y1]` y usarlo en `dibujoPara`
(`src/motor/actores.ts`).

FALTAN (pedir al usuario, con el mismo estilo y fondo blanco, cuerpo entero): de pie neutro, hablando con la mano
abierta, señalando, contento/riendo de pie, triste de pie, sorprendido de pie, caminando (2-4 fotogramas) y los
otros personajes (banquero, inversor, político, trabajador, rey, estafador) con su ropa.

## La especie (todos los personajes la comparten)
- **Estilo:** boceto a tinta negra sobre papel crema, trazo a mano a varias pasadas (filtro «lápiz»), sombras con
  rayado a lápiz. Colores apagados; acentos verde salvia, amarillo dorado y beige.
- **Proporciones (medidas en la referencia):** cabeza = 1/3 del alto; tronco tan alto como la cabeza y algo más de la
  mitad de ancho; piernas = 1,6 cabezas. Cuello muy corto. Alto total ~950 unidades (pies en y = 0).
- **Cabeza:** círculo blanco grande con sombra rayada a la derecha y abajo; barba de tres días a puntitos grises.
- **Pelo:** casquete negro con flequillo en mechones y mechones finos y afilados que se escapan (despeinado).
- **Ojos:** óvalos BLANCOS grandes con contorno y pupila negra grande con brillo, muy juntos. Al pensar miran arriba.
- **Cejas:** cortas y finas; cuentan la emoción. **Boca:** pequeña.
- **Cuerpo:** camiseta oscura de manga corta con rayado a lápiz; pantalón corto oscuro; brazos y piernas de palito
  negro; manos blancas pequeñas con dedos; zapatos negros.

## El protagonista
- `protagonista`: camiseta gris carbón `#2b2a2f`, pantalón `#1f1e22`, pelo `#16141a`. Sin nombre todavía
  (decisión del usuario). Es «el espectador»: le pasa lo que le pasa a tu dinero.
- Personalidad: curioso, un poco ingenuo, se sorprende y se agobia con las cifras, pero al final entiende el truco.

## Reparto de ejemplo (misma especie, otra ropa)
banquero (traje gris, corbata dorada, gafas, maletín) · inversor (traje azul, sin corbata, fajo de billetes) ·
politico (traje, corbata roja, pin dorado, canoso) · trabajador (chaleco naranja, casco amarillo, bigote) ·
monarca (chaqueta granate, corona, banda verde) · estafador (gabardina beige, sombrero, bigote fino, saco de $) ·
economista · magnate (1900, chistera) · vecina.

## Caras y poses
- Caras: normal, piensa, feliz, risa, sorpresa, asustado, triste, enfadado, chulo, aburrido, dormido.
- Poses: bolsillos (jarras), brazos (habla), camina, corre, senala, piensa (mano a la mejilla), encoge, saluda,
  victoria, asustado, cruza (brazos cruzados), salta, mira, cabeza (manos a la cabeza), agotado (encorvado).
- Signos: pregunta, exclama, enfado (garabato), sudor, susto (rayitas), velocidad, idea (bombilla), dinero ($).
- Regla: la cara cambia en la PALABRA exacta (sorpresa al descubrir, risa en el remate, triste al perder…).

## Prompt de referencia (Gemini, del usuario) — solo como guía, manda el dibujo de la referencia
Boceto expresivo a tinta dibujado a mano («doodle» o «servilleta»), papel blanco roto con textura. Líneas negras
sueltas e imperfectas, a varias pasadas, como en las animaciones de pizarra. Mucho rayado y rayado cruzado para
sombras. Personaje de palitos con cabeza redonda y expresiva, pelo negro despeinado de pinchos, manos pequeñas,
extremidades finas y camiseta oscura sombreada. Colores apagados: tinta negra, carbón y toques de verde salvia,
amarillo dorado y beige que no siempre encajan con el contorno. Letra a mano, bocadillos de pensamiento, garabatos
y signos de exclamación. Aspecto de boceto escaneado con textura de papel.
