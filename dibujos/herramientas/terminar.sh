#!/usr/bin/env bash
# Junta imagen y sonido y revisa:  cd dibujos/videos/<nombre> && bash ../../herramientas/terminar.sh "Titulo"
# Necesita los fotogramas (FRAMES=frames_sub con subtítulos, o frames) y out/mix.wav (+ out/mix_sin_musica.wav si existe).
# AHORRO: la imagen se codifica UNA sola vez (lo lento) y se le pega cada sonido sin recodificar; la revisión de imagen
# (congelados/negros), la hoja final y el .srt se hacen una vez. Salen out/Titulo.mp4 y out/Titulo-sin-musica.mp4.
set -e; FR="${FRAMES:-frames}"; T="${1:-short}"; B="out/${T// /-}"
lufs() { ffmpeg -hide_banner -i "$1" -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}'; }
normaliza() { # $1 mezcla → $2 a −14 LUFS: dos pasadas de loudnorm + lo que falte con un limitador suave
  local J; J=$(ffmpeg -hide_banner -i "$1" -af "loudnorm=I=-14:TP=-1.5:LRA=7:print_format=json" -f null - 2>&1 | sed -n '/^{/,/^}/p')
  g() { echo "$J" | python3 -c "import json,sys; print(json.load(sys.stdin)['$1'])"; }
  ffmpeg -v error -y -i "$1" -af "loudnorm=I=-14:TP=-1.5:LRA=7:measured_I=$(g input_i):measured_TP=$(g input_tp):measured_LRA=$(g input_lra):measured_thresh=$(g input_thresh):offset=$(g target_offset):linear=true" -ar 48000 -ac 2 out/_pre.wav
  local D; D=$(python3 -c "print(round(-14 - float('$(lufs out/_pre.wav)'), 2))")
  ffmpeg -v error -y -i out/_pre.wav -af "volume=${D}dB,alimiter=limit=0.89:level=false:attack=3:release=60" -ar 48000 -ac 2 "$2"; rm -f out/_pre.wav; }
# 1) imagen UNA vez (lo que más tarda)
ffmpeg -v error -y -framerate 30 -i "$FR/f%04d.jpg" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p out/_imagen.mp4
echo "--- Revisión de imagen (vacío = sin trozos congelados ni negros)"
ffmpeg -i out/_imagen.mp4 -vf "freezedetect=n=0.0005:d=0.4,blackdetect=d=0.05" -an -f null - 2>&1 | grep -E "freeze_start|black_start" || true
ffmpeg -v error -y -i out/_imagen.mp4 -vf "fps=2,scale=180:-1,tile=10x4" -frames:v 1 out/hoja_final.jpg
# 2) cada sonido, pegado sin recodificar la imagen
for M in out/mix.wav out/mix_sin_musica.wav; do
  [ -f "$M" ] || continue
  F="$B.mp4"; [ "$M" = out/mix_sin_musica.wav ] && F="$B-sin-musica.mp4"
  normaliza "$M" out/mix_final.wav
  ffmpeg -v error -y -i out/_imagen.mp4 -i out/mix_final.wav -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$F"
  echo "$F  ($(ffprobe -v error -show_entries format=duration -of csv=p=0 "$F" | cut -c1-5) s, $(lufs "$F") LUFS)"
done
rm -f out/_imagen.mp4
# 3) subtítulos .srt para subir a YouTube
[ -f tiempos.json ] && python3 "$(dirname "$0")/subtitulos_srt.py" >/dev/null 2>&1 && echo "out/subtitulos.srt (para subirlo a YouTube)" || true
