# Replicar un viral (método traído del motor de curiosidades)

Así salió el Short de las fresas (réplica del viral de las naranjas, youtube.com/shorts/iD4fjW7Emt8): no se copia
el vídeo, se copia su **estructura de beats** y sus **acciones plano a plano**, con una historia propia y real del
océano.

## ⚠ Créditos de vidIQ: NUNCA sin permiso
Antes de cada llamada, decir al usuario la herramienta y su coste, y **esperar su «sí»**:
- `vidiq_video_transcript` → **5 créditos** (el texto del viral con sus tiempos).
- `vidiq_watch_shortform_content` → **10 créditos** (qué se ve en cada plano).
- Buscar candidatos (`vidiq_outliers`, `vidiq_youtube_search`…): consultar el coste en la herramienta y decirlo antes.
Total de una réplica: 15 créditos.

## Pasos
1. **Elegir el viral** (en inglés, Short de 30-70 s, muchas vistas para su canal). El usuario lo elige o pide buscar
   candidatos (diciendo el coste).
2. **Transcripción** (5 créditos, con permiso) → cortar el texto en BEATS con su segundo de inicio. Apuntarlo en la
   ficha, campo `referencia`: `"0-3 s gancho: …; 3-6 s burla: …"`.
3. **Ver el vídeo** (10 créditos, con permiso) → una tabla plano a plano: segundo, qué se ve, qué se mueve, qué
   cambia (hielo que crece, fuego que se apaga, fruta que se parte…), qué tipo de plano. Guardarla en la ficha
   (`referencia`) o en `docs/` si es larga.
4. **Guion propio** con la MISMA estructura de beats: si el viral usa rival, `./oceano guion nuevo N "Title" --rival`
   (fórmula con rival: gancho, burla con apodo, apuesta con números, rival, proceso, escalada con cuenta atrás,
   giro, «The trick is…», desenlace, remate que repite el apodo y hace loop). Reglas del canal: inglés de EE. UU.,
   110-140 palabras, gancho en 0-3 s, final en loop. Datos reales con `fuentes`. `./oceano guion N` lo revisa.
5. **Doblaje** si el viral tiene diálogo: en la ficha, un tramo puede ser una lista de líneas
   `{"voz": "capitan", "texto": "[laughs] Nice try, Berry Boy!"}` y `"voces": {"capitan": "nombre en ElevenLabs"}`.
   `./oceano guion N` escribe `Textos/N - Title.voces.txt` (un bloque por voz para Eleven v3).
6. **Puesta en escena calcando las acciones**: una escena por beat (o por cambio de sitio del viral); cada acción de
   la tabla → una acción de actor en la palabra exacta (`chasca`, `mueve`, `pose`…) y los objetos que cambian
   (`hielocambia`, `fogata`, `fruta`, `compradores`). Los planos forzados en los mismos momentos que el viral.
   Luz por paletas si el viral tiene un ambiente claro (`luz: { hora: "tarde", lugar: "playa" }`).
7. Lo de siempre: `./oceano prueba N` + `./oceano revisar N --prueba`, revisar cada imagen, voz, montar.

## Qué NO se copia
El texto, los personajes, la música, la imagen ni el título del viral. Solo el ritmo de beats y el tipo de acción.
Tampoco las tarjetas/rótulos pequeños de esquina del motor de curiosidades: en Benthara no hacen falta.
