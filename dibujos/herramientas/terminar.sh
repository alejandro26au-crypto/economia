#!/usr/bin/env bash
# Junta imagen y sonido y revisa (como finish.sh del kit):  cd dibujos/videos/<nombre> && bash ../../herramientas/terminar.sh "Titulo"
# Necesita frames/ (node render.mjs frames "0-N") y out/mix.wav (python3 ../../herramientas/mix.py voice.mp3 music.wav sfx.wav).
# FRAMES=frames_sub (con subtítulos, de subtitulos.py) o frames (sin).
# Segundo argumento opcional: otra mezcla (p. ej. out/mix_sin_musica.wav) -> otro MP4 con «-sin-musica».
set -e; FR="${FRAMES:-frames}"; T="${1:-short}"; M="${2:-out/mix.wav}"; F="out/${T// /-}.mp4"
[ "$M" != "out/mix.wav" ] && F="out/${T// /-}-sin-musica.mp4"
# −14 LUFS en DOS pasadas (medir y corregir): en una sola pasada los clips cortos se quedan en −16
J=$(ffmpeg -hide_banner -i "$M" -af "loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
g() { echo "$J" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
ffmpeg -v error -y -i "$M" -af "loudnorm=I=-14:TP=-1.5:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -ac 2 out/mix_pre.wav
# corrección final: lo que falte hasta −14 con un limitador suave (los picos de la voz frenan la subida de loudnorm)
I=$(ffmpeg -hide_banner -i out/mix_pre.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
D=$(python3 -c "print(round(-14 - float('$I'), 2))")
ffmpeg -v error -y -i out/mix_pre.wav -af "volume=${D}dB,alimiter=limit=0.89:level=false:attack=3:release=60" -ar 48000 -ac 2 out/mix_final.wav
ffmpeg -v error -y -framerate 30 -i $FR/f%04d.jpg -i out/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
ffprobe -v error -show_entries format=duration -show_entries stream=width,height,r_frame_rate -of compact "$F"
echo "--- Revisión (vacío = sin trozos congelados ni negros)"; ffmpeg -i "$F" -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -i "$F" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1
ffmpeg -v error -y -i "$F" -vf "fps=2,scale=180:-1,tile=10x4" -frames:v 1 out/hoja_final.jpg; echo "$F"
# subtítulos .srt para subir a YouTube (si hay tiempos.json)
[ -f tiempos.json ] && python3 "$(dirname "$0")/subtitulos_srt.py" >/dev/null 2>&1 && echo "out/subtitulos.srt (para subirlo a YouTube)" || true
