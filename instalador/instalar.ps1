# Instala el canal de economía DENTRO de esta carpeta en Windows: Node portátil, el motor de vídeo, Python (uv) y el
# modelo que escucha la voz. Ejecutar con:  powershell -ExecutionPolicy Bypass -File instalador\instalar.ps1
$ErrorActionPreference = "Stop"
Set-Location (Join-Path $PSScriptRoot "..")
$Raiz = (Get-Location).Path
$NodeV = "v22.12.0"
Write-Host "== el canal de economía: instalación (Windows) =="

# 1) Node portátil
if (-not (Test-Path "node\node.exe")) {
  Write-Host "Descargo Node $NodeV…"
  Invoke-WebRequest "https://nodejs.org/dist/$NodeV/node-$NodeV-win-x64.zip" -OutFile node.zip
  Expand-Archive node.zip -DestinationPath . -Force
  Rename-Item "node-$NodeV-win-x64" node
  Remove-Item node.zip
}
$env:PATH = "$Raiz\node;$env:PATH"

# 2) Motor de vídeo
Write-Host "Instalo el motor de vídeo…"
& "$Raiz\node\npm.cmd" ci --no-audit --no-fund --loglevel=error
try { & "$Raiz\node\npx.cmd" remotion browser ensure | Out-Null } catch { Write-Host "  (el navegador se descargará con el primer vídeo)" }

# 3) Python con uv portátil
if (-not (Test-Path "uv\uv.exe")) {
  Write-Host "Descargo uv (gestor de Python)…"
  Invoke-WebRequest "https://github.com/astral-sh/uv/releases/latest/download/uv-x86_64-pc-windows-msvc.zip" -OutFile uv.zip
  Expand-Archive uv.zip -DestinationPath uv -Force
  Remove-Item uv.zip
}
Write-Host "Preparo Python y sus librerías…"
if (-not (Test-Path ".venv\Scripts\python.exe")) { & "uv\uv.exe" venv .venv --python 3.12 --quiet }
& "uv\uv.exe" pip install --quiet --python .venv\Scripts\python.exe -r instalador\requirements.txt
Write-Host "Descargo el modelo que escucha la voz (~500 MB, solo la primera vez)…"
try { & ".venv\Scripts\python.exe" -c "from faster_whisper import WhisperModel; WhisperModel('small', device='cpu', compute_type='int8')" | Out-Null } catch { Write-Host "  (se descargará con la primera voz)" }

# Atajo canal.cmd
Set-Content -Encoding ASCII canal.cmd "@echo off`r`ncd /d %~dp0`r`nset PATH=%~dp0node;%PATH%`r`n.venv\Scripts\python.exe programa\canal.py %*"
& ".\canal.cmd" comprobar
