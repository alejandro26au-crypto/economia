#!/usr/bin/env bash
# Instala el canal de economía DENTRO de esta carpeta (Mac o Linux): Node, el motor de vídeo, Python y el modelo que
# escucha la voz. Si ya hay un Node 18+ o uv en el sistema, los usa. Si se repite, solo completa lo que falte.
set -e
cd "$(dirname "$0")/.."
RAIZ="$PWD"
NODE_V="v22.12.0"
echo "== el canal de economía: instalación =="

case "$(uname -s)" in Darwin) SO="darwin"; SO_UV="apple-darwin" ;; *) SO="linux"; SO_UV="unknown-linux-gnu" ;; esac
case "$(uname -m)" in arm64|aarch64) ARQ="arm64"; ARQ_UV="aarch64" ;; *) ARQ="x64"; ARQ_UV="x86_64" ;; esac

# 1) Node (el del sistema si es 18 o más; si no, uno portátil en ./node)
if [ -x node/bin/node ]; then
  export PATH="$RAIZ/node/bin:$PATH"
elif ! command -v node >/dev/null 2>&1 || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 18 ]; then
  echo "Descargo Node $NODE_V…"
  curl -fsSL "https://nodejs.org/dist/$NODE_V/node-$NODE_V-$SO-$ARQ.tar.gz" -o node.tar.gz
  mkdir -p node && tar -xzf node.tar.gz -C node --strip-components=1 && rm node.tar.gz
  export PATH="$RAIZ/node/bin:$PATH"
fi

# 2) Motor de vídeo
echo "Instalo el motor de vídeo…"
npm ci --no-audit --no-fund --loglevel=error
npx remotion browser ensure >/dev/null 2>&1 || echo "  (el navegador del motor se descargará con el primer vídeo)"

# 3) Python (con uv: del sistema o portátil en ./uv)
UV="$(command -v uv || true)"
if [ -z "$UV" ]; then
  if [ ! -x uv/uv ]; then
    echo "Descargo uv (gestor de Python)…"
    mkdir -p uv
    curl -fsSL "https://github.com/astral-sh/uv/releases/latest/download/uv-$ARQ_UV-$SO_UV.tar.gz" | tar -xz -C uv --strip-components=1
  fi
  UV="$RAIZ/uv/uv"
fi
echo "Preparo Python y sus librerías…"
[ -x .venv/bin/python ] || "$UV" venv .venv --python 3.12 --quiet
"$UV" pip install --quiet --python .venv/bin/python -r instalador/requirements.txt
echo "Descargo el modelo que escucha la voz (~500 MB, solo la primera vez)…"
.venv/bin/python -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')" >/dev/null 2>&1 || echo "  (se descargará con la primera voz)"

chmod +x canal
echo
./canal comprobar
