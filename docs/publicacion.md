# Paquete de publicación (regla del usuario, 25 nov 2026)

Después de CADA vídeo (al enviar el vídeo montado; si se pide antes, con el guion aprobado) se entrega al usuario
un PAQUETE DE PUBLICACIÓN completo, en bloques para copiar, y se guarda en `Textos/N - Título.publicar.md`.

## Qué lleva (en este orden)
1. **Prompt de Nano Banana para la miniatura** (2 variantes: A y B, para probar con «Probar y comparar» de YouTube).
2. **Título**: el elegido + 2 alternativas. Máx. 60 caracteres. Curiosidad + dinero del espectador.
3. **Descripción** lista para pegar.
4. **Etiquetas** (unas 15, separadas por comas, máx. 500 caracteres).
5. **Comentario fijado** (pregunta al espectador).
6. **Ajustes de YouTube**: categoría, idioma, subtítulos, lista, pantalla final, «contenido alterado».
7. **Hora recomendada** para publicar.

## 1. Miniatura con Nano Banana (Gemini)
Estilo del canal (como Zenn, con identidad propia): fondo PLANO de color apagado, contorno negro limpio, UN
personaje de nuestra especie (cabeza grande, ojos grandes con brillo, manos blancas, ropa sin mangas) con una
emoción clara, UN objeto clave y 1-3 palabras AMARILLAS con borde negro grueso. El texto NO repite el título:
enseña un trozo de la respuesta y crea curiosidad.
- Prompt en INGLÉS (Nano Banana lo entiende mejor) y el texto de la miniatura en español, entre comillas.
- Formato 16:9, 1280×720. Pedir «no other text, no watermark».
- Adjuntar como referencia una imagen de `public/protagonista/` (o una foto del personaje del vídeo) y decir
  «keep the character style of the reference image».
- Comprobar que se lee en pequeño (móvil): pocas palabras, contraste fuerte, cara grande.
- Plantilla:
  ```
  YouTube thumbnail, 16:9, 1280x720. Flat 2D cartoon illustration, clean thick black outlines, muted flat colors,
  simple background in [COLOR]. [PERSONAJE: aspecto, ropa, emoción] [ACCIÓN] with [OBJETO CLAVE], [composición:
  personaje a la izquierda/derecha, objeto grande]. Big bold text "[1-3 PALABRAS]" in bright yellow with a thick
  black outline, [posición]. Keep the character style of the reference image. High contrast, readable at small
  size. No other text, no watermark, no logos.
  ```

## ESTILO DE MINIATURA DEL CANAL (aprobado por el usuario, 26 nov 2026: «A y B me gustan, seguir esas mismas»)
Modelo: las miniaturas A y B del vídeo 1 hechas en Nano Banana (`Vídeos listos/1 - miniatura Nano Banana A/B.jpg`).
Siempre 3 variantes (A, B, C) para «Probar y comparar», con este molde:
- Dibujo plano 2D con contorno negro grueso, colores apagados, fondo liso (oscuro y frío, o partido en dos:
  cálido contra frío para los contrastes) con un halo de luz detrás del objeto o del personaje.
- Personaje de la historia MUY GRANDE (la cara ≈ 1/3 de la imagen), ojos grandes y una emoción clara (sonrisa de
  secreto, susto…), con su seña de identidad muy visible (abrigo con imperdibles, fregona, traje y corbata).
- UN objeto clave que brilla (caja fuerte llena, cartel de SUBASTA, árbol de monedas…).
- Texto: 1-3 palabras AMARILLAS con borde negro grueso, arriba; si hace falta, una segunda línea BLANCA más pequeña.
  El texto no repite el título: da la cifra o la pregunta.
- A = el secreto / la cifra (personaje + objeto que brilla). B = el contraste (pantalla partida, ¿QUIÉN GANÓ?).
  C = la metáfora del vídeo (el árbol, la cobra…) con el personaje en primer plano.
- Prompt en inglés que acaba SIEMPRE en: «Keep the character style of the reference image. High contrast, readable
  at small size. No other text, no watermark, no logos.» Formato 16:9 en Nano Banana.

## 3. Plantilla de la descripción
```
[2 líneas de gancho: la frase de identificación + la promesa (se ven antes de «más»)]

[3-4 líneas: de qué va la historia, sin destripar el giro final]

📌 En este vídeo:
[3-5 puntos de lo que aprende el espectador]

📚 Fuentes:
[las del .fuentes.md, con enlaces]

⚠️ Este vídeo es divulgativo y no es asesoramiento financiero. Las cifras de rentabilidad son ejemplos, no
garantías.

#[hashtag1] #[hashtag2] #[hashtag3]
```
(Sin capítulos: el vídeo es una historia continua.)

## 6. Ajustes fijos
- Categoría: Educación. Idioma del vídeo y del título: español.
- Subtítulos: subir el `.srt` del vídeo (texto exacto de la voz).
- «Contenido alterado o sintético»: NO hace falta marcarlo (animación evidente; la voz narra, no imita a nadie
  real). Revisarlo si algún vídeo usa voz o imagen realista de una persona real.
- Pantalla final (últimos 20 s): «vídeo recomendado» + botón de suscribirse.
- No es contenido para niños.
- Hora: entre las 18:00 y las 20:00 de España (mediodía/tarde en Latinoamérica); jueves a domingo.
