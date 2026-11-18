# Ficha del personaje — «Inercia del consumo»

Referencias: `referencias/personaje.png` (pose y cara), `referencias/expresiones.png` (6 caras), logo
`public/marca/logo.png` y portada `referencias/portada.png`. Código: `src/personaje/figura.tsx` (dibujo),
`pose.ts` (esqueleto), `animaciones.ts` (movimientos), `reparto.ts` (ropa de cada uno), `signos.tsx` (¡! ¿? …).
Hojas para comparar: `npx remotion still src/index.ts especie salida/especie.png` y `… reparto salida/reparto.png`.

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
