// ---------- world: DECORADO A MEDIDA DE ESTE VÍDEO ----------
// Construye aquí SOLO los lugares que nombra el guion (apúntalos en la ficha, «escena.lugares», con sus palabras;
// `./inercia escena N` lo comprueba). Piezas en _piezas.js: casa, cipres, pino, paisaje, letrero, estante, crearPizarra
// y trazos a mano (trazo, escribe, flecha, tacha, etiqueta, ticket, vestido, coche, cerebro, tarjetaT, bancoT, billeteT,
// tiendaT). Texturas pintadas: paint.js (P.*). Ejemplos completos: dibujos/ejemplos/ y dibujos/videos/.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
// PRUEBA: la tienda (el guion dice «tienda»): suelo, estanterías con precios y el letrero
add(tbox(14, 0.2, 14, 1.2), MK.plank, 0, -0.1, -8, world, { cast: false });
estante(world, -2.2, -10.2, 0, 5); estante(world, 0, -10.2, 0, 6); estante(world, 2.2, -10.2, 0, 7);
add(new THREE.PlaneGeometry(3.2, 0.7), letrero('TIENDA', 3.2, 0.7, '#2f6fa8', '#f3e7cc'), 0, 3.1, -10.4, world, { cast: false });
casa(world, -9, 0, -16, 5, 4, 4.5, 0.2); paisaje(world);
function worldLight(L, f) { }
function worldState(S, f) { }
