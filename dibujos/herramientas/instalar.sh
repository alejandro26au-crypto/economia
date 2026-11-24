#!/usr/bin/env bash
# Deja el entorno listo para el motor de dibujos (en la nube tras un reinicio, o en un Linux/Mac nuevo):
#   bash dibujos/herramientas/instalar.sh
# Comprueba node (>= 22.6), python3, ffmpeg (con libass para subtítulos), Playwright + Chromium y la fuente Inter;
# instala lo de Python (numpy, Pillow, faster-whisper) y descarga una vez el modelo de voz «small» (~460 MB).
# No gasta dinero ni crea cuentas. Si algo falla, dice qué falta y cómo ponerlo.
set -u
ok() { echo "  ✓ $*"; }; mal() { echo "  ✗ $*"; FALLOS=$((FALLOS+1)); }; FALLOS=0
echo "== Programas"
if command -v node >/dev/null; then v=$(node -p "process.versions.node"); M=${v%%.*}; m=$(echo "$v" | cut -d. -f2)
  if [ "$M" -gt 22 ] || { [ "$M" -eq 22 ] && [ "$m" -ge 6 ]; }; then ok "node $v"; else mal "node $v (hace falta 22.6 o más)"; fi
else mal "node no está (instalar Node.js 22 LTS)"; fi
command -v python3 >/dev/null && ok "$(python3 --version)" || mal "python3 no está"
if command -v ffmpeg >/dev/null; then ok "ffmpeg"; ffmpeg -hide_banner -filters 2>/dev/null | grep -q " ass " && ok "ffmpeg con subtítulos (libass)" || mal "ffmpeg sin libass: no se podrán quemar subtítulos (el .srt sí)"; else mal "ffmpeg no está (apt-get install -y ffmpeg)"; fi
echo "== Python"
python3 -m pip install -q numpy pillow "faster-whisper==1.2.1" "av>=14" 2>&1 | grep -v -i "warning" || true
python3 -c "import numpy, PIL, faster_whisper, av; assert int(av.__version__.split('.')[0]) >= 14" 2>/dev/null && ok "numpy, Pillow, faster-whisper" || mal "faltan paquetes de Python (python3 -m pip install numpy pillow faster-whisper)"
echo "== Modelo de voz (tiempos de cada palabra)"
python3 -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')" >/dev/null 2>&1 && ok "modelo «small» listo" || mal "no se pudo descargar el modelo (necesita salida a huggingface.co)"
echo "== Playwright + Chromium (render)"
PW="$(npm root -g 2>/dev/null)/playwright"
if [ -d "$PW" ]; then ok "playwright global"; else npm install -g playwright >/dev/null 2>&1 && ok "playwright instalado" || mal "playwright no está (npm install -g playwright)"; fi
node -e "const {chromium}=require('$PW');chromium.launch().then(b=>{b.close();process.exit(0)}).catch(()=>process.exit(1))" 2>/dev/null && ok "Chromium arranca" || {
  npx -y playwright install chromium >/dev/null 2>&1 && ok "Chromium instalado" || mal "Chromium no arranca (npx playwright install chromium)"; }
echo "== Fuentes"
fc-list 2>/dev/null | grep -qi "Inter.*Black" && ok "Inter Black (subtítulos)" || echo "  · Inter Black no está: los subtítulos usarán otra letra gruesa (opcional: instalar la fuente Inter)"
echo
[ "$FALLOS" -eq 0 ] && echo "Todo listo." || echo "Faltan $FALLOS cosa(s): mira las ✗."
