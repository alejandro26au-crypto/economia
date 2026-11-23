#!/usr/bin/env bash
# Montaje EN PARALELO (reparte los fotogramas entre varios Chromium):  desde la carpeta del vídeo
#   bash ../../herramientas/montar.sh 0-1799 [trabajadores=núcleos] [carpeta=frames]
# Retoma solo lo que falte (RESUME=1): si se corta, se vuelve a lanzar igual. Cada trabajador deja su registro en
# <carpeta>/montar_N.log. Al acabar comprueba que no falte ningún fotograma.
set -e
R="${1:?rango, p. ej. 0-1799}"; N="${2:-$(nproc)}"; D="${3:-frames}"
A="${R%-*}"; B="${R#*-}"; mkdir -p "$D"
T=$(( (B - A + N) / N )); t0=$(date +%s)
for i in $(seq 0 $((N - 1))); do
  a=$((A + i * T)); b=$((a + T - 1)); [ "$b" -gt "$B" ] && b=$B; [ "$a" -gt "$B" ] && break
  RESUME=1 node render.mjs "$D" "$a-$b" > "$D/montar_$i.log" 2>&1 &
done
wait
faltan=0; for f in $(seq "$A" "$B"); do [ -f "$D/f$(printf %04d "$f").jpg" ] || faltan=$((faltan + 1)); done
s=$(( $(date +%s) - t0 )); echo "montaje $R con $N trabajadores: ${s} s ($(echo "scale=2; $s / ($B - $A + 1)" | bc) s/fotograma)"
[ "$faltan" -eq 0 ] && echo "✓ completo" || { echo "✗ faltan $faltan fotogramas: vuelve a lanzar el mismo comando"; grep -h "ERR" "$D"/montar_*.log | head -3; exit 1; }
