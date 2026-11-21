#!/usr/bin/env bash
# junta las partes de main.js y del reparto (tras editar _piezas.js, _world.js, _frame.js o roman.js)
cd "$(dirname "$0")/web" && cat _head.js _piezas.js _world.js _tail.js _frame.js > main.js && cat toonbase.js roman.js > toon.js
for d in ../../herramientas ../../../herramientas; do [ -f "$d/gestos.js" ] && cp "$d/gestos.js" . && break; done; true
