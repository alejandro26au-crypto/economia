// ---------- world: DECORADO A MEDIDA DE ESTE VÍDEO ----------
// Construye aquí SOLO los lugares que nombra el guion (apúntalos en la ficha, «escena.lugares», con sus palabras;
// `./inercia escena N` lo comprueba). Piezas en _piezas.js: casa, cipres, pino, paisaje, letrero, estante, crearPizarra
// y trazos a mano (trazo, escribe, flecha, tacha, etiqueta, ticket, vestido, coche, cerebro, tarjetaT, bancoT, billeteT,
// tiendaT). Texturas pintadas: paint.js (P.*). Ejemplos completos: dibujos/ejemplos/ y dibujos/videos/.
const DECK = 0;
const world = new THREE.Group(); scene.add(world);
// EJEMPLO MÍNIMO (bórralo y construye el tuyo): un camino de tierra, un par de casas y el paisaje del kit
add(new THREE.PlaneGeometry(6, 200), MK.dirt, 0, 0.01, -60, world, { cast: false }).rotation.x = -Math.PI / 2;
casa(world, -5, 0, -8, 5, 4, 4.5, 0.2); casa(world, 6, 0, -12, 4.5, 4, 5.5, -0.3, MK.plaster2);
for (let i = 0; i < 8; i++) cipres(world, (i % 2 ? 1 : -1) * (9 + i), 0, -20 - i * 6, 6 + (i % 3));
paisaje(world);
function worldLight(L, f) { }
function worldState(S, f) { }
