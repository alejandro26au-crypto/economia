"""Sonido del vídeo: música por tramos y efectos en cada corte y golpe, sacados de web/story.js (SHOTS y SONIDOS).
Para efectos propios de este vídeo, añádelos a SONIDOS en story.js: {f: fotograma, tipo: 'moneda'|'caja'|'billete'|'estrellas'|'golpe'|'corte'|'remate'}."""
import runpy
from pathlib import Path
for d in (Path("../../herramientas"), Path("../herramientas")):
    if (d / "sonido.py").exists():
        runpy.run_path(str(d / "sonido.py"), run_name="__main__")
        break
