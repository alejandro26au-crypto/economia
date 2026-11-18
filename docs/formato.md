# Formato del canal: «SIGUE EL DINERO» (Inercia del consumo)

Vídeos de 10-15 min, horizontales, en español neutro. Cada vídeo es UNA historia real de dinero contada como un
VIAJE por la **Ciudad Inercia** (el mundo del canal), con el protagonista (el espectador) dentro.

## Por qué este formato (lo que dicen los datos, vidIQ 18 nov 2026)
- En español funcionan los vídeos que tocan TU dinero y una verdad escondida («Cómo los ricos usan la deuda» 17x,
  «La verdad oculta de los bancos» 36x). Las historias de economía bien contadas están poco explotadas en español.
- En inglés funcionan las historias largas (John Law, Lehman, 35-47 min): la gente se queda si hay HISTORIA.
- Por eso: historia real + «qué significa para tu bolsillo», y un mundo y un personaje que se reconocen al
  instante en la miniatura y en los 2 primeros segundos (marca propia, no un canal de stock genérico).

## Los 6 sellos del formato (lo que se repite en todos los vídeos)
1. **El contador del bolsillo** (arriba a la izquierda): «TU DINERO: 1.000 €». Aparece en el gancho y cambia con
   cada golpe de la historia (sonido de caja registradora). Es el hilo que mantiene la tensión 15 minutos.
2. **Sigue el dinero**: entre lugares la cámara vuela siguiendo a un billete (se aleja, cruza la ciudad y vuelve
   a entrar). Es la «inercia» del nombre del canal y la transición de marca.
3. **El sello «¡PERO!»** estampado SOLO en los giros de verdad (5-7 por vídeo): «¡PERO!», «¡Y AÚN PEOR!», «¡Y ENTONCES!».
4. **La nube de pensamiento**: cuando toca explicar cifras, sale de la cabeza del protagonista y la cámara entra:
   gráfico que se dibuja, cifra gigante o comparación de barras (tu sueldo contra…).
5. **El protagonista eres tú**: reacciona a cada cifra (sudor, manos a la cabeza, enfado) con signos de cómic.
6. **La vuelta a casa**: el final siempre vuelve a «TU CASA» con el contador: qué significa esto hoy para ti.

## Estructura del guion (1.500-2.200 palabras)
| Tramo | Tiempo | Lugar típico | Qué pasa |
|---|---|---|---|
| Gancho | 0:00-0:30 | casa | Cifra brutal en el contador + pregunta al espectador. Promesa: «al final sabrás…». |
| Arranque | 0:30-2:00 | el lugar de la historia | Quién, cuándo, cuánto dinero. Rival y burlas. |
| Escalada | 2:00-8:00 | 3-5 lugares (vuelo entre ellos) | Un giro con sello cada 60-90 s; pista falsa; cifras que crecen (lluvia de billetes). |
| La verdad | 8:00-11:00 | nube | La ciencia económica con 2-3 cifras comprobadas, en la nube (gráfico o comparación). |
| Tu bolsillo | 11:00-13:00 | casa | Qué significa hoy: el contador hace la cuenta con el sueldo/alquiler/ahorro del espectador. |
| Cierre | últimos 30 s | casa | Frase redonda + pregunta para comentarios + gancho al siguiente vídeo. |

## Ritmo para vídeo LARGO (19 nov 2026: «tantos efectos en un vídeo largo aburren»)
Lo especial solo funciona si es raro. El vídeo sube y baja de intensidad, como una buena historia:
- **Ritmo por escena** (`ritmo` en la idea; el borrador lo pone solo):
  - `alta` (gancho y giros, ~15 % del vídeo): plano cada 3-4 s con «zoom golpe» y whoosh.
  - `normal` (contar la historia, ~60 %): plano cada 6-8 s, movimientos suaves de ~1 s, SIN sonido de cámara.
  - `calma` (la nube, explicar cifras, ~25 %): plano cada 9-12 s, la cámara flota despacio.
- **Límites automáticos** (`limitarEfectos` en `src/motor/Video.tsx`): sello ≥ 60 s entre uno y otro · lluvia de
  billetes ≥ 2 min · temblor y zoom ≥ 20 s · signos del mismo personaje ≥ 12 s. Lo que sobra se quita.
- **Transiciones:** el vuelo del billete (la de marca) como mucho una vez cada ~75 s; los demás cambios de lugar,
  fundido suave en papel.
- **Sonido:** la música y la voz llevan el vídeo; efectos solo en momentos marcados (vuelo, sello, caja registradora
  del contador, ritmo alto).
- **Subtítulos:** frases de 3-5 palabras, sin rebote; la palabra que suena en dorado.
- **Presupuesto orientativo para 12 min:** 5-7 sellos, 1-3 lluvias, 6-10 cambios del contador, 3-5 nubes,
  4-6 vuelos.

## Miniatura (pendiente de probar)
El protagonista grande con la cara de la emoción del vídeo + el contador con una cifra en rojo + 2-3 palabras con
la letra de la portada. Fondo: el lugar de la ciudad de esa historia.
