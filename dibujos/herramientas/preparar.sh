#!/usr/bin/env bash
# Prepara un vídeo para montarlo (sin descargar nada):  bash dibujos/herramientas/preparar.sh dibujos/videos/<nombre>
# Copia las librerías guardadas (vendor), junta la librería de personajes con el reparto del vídeo (toon.js) y
# enlaza Playwright. El vídeo tiene su propio web/ (main.js con SU decorado, story.js con SUS planos, roman.js con SU ropa).
set -e
D="$(cd "$(dirname "$0")/.." && pwd)"; V="${1:?carpeta del vídeo}"
mkdir -p "$V/web/lib" "$V/frames" "$V/stills" "$V/out"
cp "$D/kit/vendor/three.module.js" "$V/web/lib/"
node -e "const m=require('node:module'),fs=require('fs');fs.writeFileSync('$V/web/toonbase.js',m.stripTypeScriptTypes(fs.readFileSync('$D/kit/vendor/toon.ts','utf8'),{mode:'transform'}))"
cat "$V/web/toonbase.js" "$V/web/roman.js" > "$V/web/toon.js"
cp "$D/kit/tools/sheet.py" "$V/" ; cp "$D/herramientas/gestos.js" "$V/web/"; [ -f "$V/render.mjs" ] || cp "$D/kit/tools/render.mjs" "$V/"
mkdir -p "$V/node_modules"; [ -e "$V/node_modules/playwright" ] || ln -sf "$(npm root -g)/playwright" "$V/node_modules/playwright"
echo "listo: $V   (tras cambiar la ropa en roman.js: cat web/toonbase.js web/roman.js > web/toon.js)"
