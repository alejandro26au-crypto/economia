// ---------- world: DECORADO DE EJEMPLO — «la terraza del profesor» (Inercia del Consumo) ----------
// Cada vídeo construye AQUÍ su decorado A MEDIDA con las piezas y texturas del kit (y lo nuevo en su mismo estilo).
// Este ejemplo: terraza de piedra de una villa sobre una colina, el pueblo y los cipreses al fondo (la misma luz de día
// que los romanos), la PIZARRA del profesor en un caballete (dibuja cada frase: ver «pizarra» abajo), mesa con café,
// sombrilla y limoneros en maceta. Se cambia entero en cada vídeo; la pizarra y sus trazos de tiza se pueden reutilizar.
const DECK = 0;
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  stone: texM(P.stone(4), 1, 1), tiles: texM(P.stone(21, 28, 34, 70, 96, 96), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#3a3836' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }), cream: toon({ color: '#f3e7cc' }), pot: toon({ color: '#b5653f' }),
  lemon: toon({ color: '#f2d23a' }), leaf: toon({ color: '#4d7f37' }), cup: toon({ color: '#f6f2ea' }), gold: toon({ color: '#e2b544' }),
};
const world = new THREE.Group(); scene.add(world);
const clouds = [];

// --- la terraza: suelo de baldosas de piedra, muro bajo con balaustrada al fondo (se ve el paisaje) ---
const TX = 7, TZ0 = -4.2, TZ1 = 6;
add(tbox(TX * 2, 0.4, TZ1 - TZ0, 1.6), M.tiles, 0, -0.2, (TZ0 + TZ1) / 2, world, { cast: false });
add(tbox(TX * 2 + 0.6, 6, 0.8, 2.4), M.stone, 0, -3.4, TZ0 - 0.1, world, { cast: false });           // muro de contención (cara al valle)
add(tbox(TX * 2, 0.16, 0.42, 1), M.marbleTop, 0, 0.92, TZ0 + 0.1, world);                          // pasamanos
add(tbox(TX * 2, 0.14, 0.42, 1), M.marbleTop, 0, 0.07, TZ0 + 0.1, world);
for (let x = -TX + 0.3; x <= TX - 0.3; x += 0.36) {                                                     // balaustres torneados
  const b = add(new THREE.CylinderGeometry(0.06, 0.09, 0.74, 10), M.marble, x, 0.5, TZ0 + 0.1, world); b.scale.set(1, 1, 1);
  add(new THREE.SphereGeometry(0.085, 10, 8), M.marble, x, 0.62, TZ0 + 0.1, world);
}
for (const x of [-TX + 0.2, -2.5, 2.5, TX - 0.2]) add(tbox(0.36, 1.1, 0.5, 1), M.stone, x, 0.5, TZ0 + 0.1, world);   // pilares
// --- la villa a la izquierda: pared de yeso, puerta, ventanas con contraventanas, alero de tejas ---
const villa = new THREE.Group(); villa.position.set(-TX - 1.5, 0, 1); world.add(villa);
add(tbox(3, 6.4, 12, 2.2), M.plaster2, 0, 3.2, 0, villa);
add(tbox(0.12, 2.3, 1.2, 1), M.door, 1.52, 1.15, 1.5, villa, { cast: false });
for (const z of [-2.6, -0.4]) {
  add(tbox(0.1, 1.2, 0.9, 1), M.window, 1.52, 2.0, z, villa, { cast: false });
  for (const s of [-1, 1]) add(tbox(0.08, 1.25, 0.46, 1), toon({ color: '#3f6b5a' }), 1.56, 2.0, z + s * 0.7, villa);
}
const alero = add(tbox(2.2, 0.25, 12.4, 2), M.roof, 2.2, 6.25, 0, villa); alero.rotation.z = -0.32;
// buganvilla sobre la puerta (manchas de color, como los arbustos del kit)
{ const r = P.rng(70); for (let i = 0; i < 16; i++) add(new THREE.SphereGeometry(0.22 + r() * 0.18, 10, 8), toon({ color: i % 3 ? '#c2407a' : '#5c8a3c' }), 1.6 + r() * 0.2, 2.6 + r() * 1.4, 0.6 + r() * 2, villa); }

// --- LA PIZARRA en un caballete (textura que se redibuja con cada frase) ---
const PZ = { x: 0.9, y: 1.75, z: -2.3, w: 2.2, h: 1.6, rot: -0.12 };
const pizG = new THREE.Group(); pizG.position.set(PZ.x, 0, PZ.z); pizG.rotation.y = PZ.rot; world.add(pizG);
const pizC = document.createElement('canvas'); pizC.width = 1320; pizC.height = 960;
const pizT = new THREE.CanvasTexture(pizC); pizT.colorSpace = THREE.SRGBColorSpace; pizT.anisotropy = 4;
const pizM = new THREE.MeshToonMaterial({ gradientMap: grad, map: pizT, emissive: new THREE.Color('#ffffff'), emissiveMap: pizT, emissiveIntensity: 0.16 });
add(new THREE.PlaneGeometry(PZ.w, PZ.h), pizM, 0, PZ.y, 0.05, pizG, { cast: false });
add(tbox(PZ.w + 0.1, PZ.h + 0.1, 0.06, 1), M.beamDark, 0, PZ.y, 0, pizG);
for (const [w, h, x, y] of [[PZ.w + 0.24, 0.1, 0, PZ.h / 2 + 0.05], [PZ.w + 0.24, 0.1, 0, -PZ.h / 2 - 0.05], [0.1, PZ.h + 0.2, -PZ.w / 2 - 0.05, 0], [0.1, PZ.h + 0.2, PZ.w / 2 + 0.05, 0]])
  add(tbox(w, h, 0.09, 1), M.beam, x, PZ.y + y, 0.06, pizG);
for (const s of [-1, 1]) { const l = add(tbox(0.09, 2.9, 0.09, 1), M.beam, s * 0.9, 1.35, 0.12, pizG); l.rotation.z = s * 0.06; }   // patas del caballete
const pata = add(tbox(0.08, 2.7, 0.08, 1), M.beam, 0, 1.25, -0.55, pizG); pata.rotation.x = 0.36;
add(tbox(PZ.w + 0.1, 0.05, 0.16, 1), M.beam, 0, PZ.y - PZ.h / 2 - 0.13, 0.14, pizG);                  // repisa de tizas
for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.014, 0.014, 0.1, 6), toon({ color: ['#ffffff', '#f4e27a', '#f2a0a0'][i] }), -0.8 + i * 0.16, PZ.y - PZ.h / 2 - 0.09, 0.16, pizG).rotation.z = Math.PI / 2;
add(tbox(0.18, 0.05, 0.07, 1), M.wood, 0.8, PZ.y - PZ.h / 2 - 0.08, 0.16, pizG);

// --- mesa de jardín con café, periódico y monedas; sombrilla de rayas; sillas; limoneros en maceta ---
const mesa = new THREE.Group(); mesa.position.set(3.6, 0, -0.4); world.add(mesa);
add(new THREE.CylinderGeometry(0.62, 0.62, 0.05, 28), M.marbleTop, 0, 0.76, 0, mesa);
add(new THREE.CylinderGeometry(0.05, 0.07, 0.74, 10), M.iron, 0, 0.37, 0, mesa);
add(new THREE.CylinderGeometry(0.3, 0.34, 0.04, 16), M.iron, 0, 0.02, 0, mesa);
add(new THREE.CylinderGeometry(0.05, 0.042, 0.09, 14), M.cup, -0.18, 0.83, 0.12, mesa);
add(new THREE.CylinderGeometry(0.085, 0.085, 0.012, 18), M.cup, -0.18, 0.785, 0.12, mesa);
add(box(0.42, 0.012, 0.3), toon({ color: '#ece6d6' }), 0.16, 0.79, -0.08, mesa).rotation.y = 0.4;
for (let i = 0; i < 5; i++) add(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 14), M.gold, 0.32, 0.79 + i * 0.013, 0.22, mesa);
{ // sombrilla: lona de rayas pintada (canvas) sobre un cono
  const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d');
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? '#f3e7cc' : '#c8392e'; g.fillRect(i * 32, 0, 32, 64); }
  const lona = add(new THREE.ConeGeometry(1.7, 0.55, 16, 1, true), toon({ map: P.tex(c), side: THREE.DoubleSide }), 0, 2.5, 0, mesa);
  add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 8), M.wood, 0, 1.3, 0, mesa);
  mesa.userData.lona = lona;
}
const silla = (x, z, r) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = r; world.add(g);
  add(tbox(0.46, 0.05, 0.44, 1), M.iron, 0, 0.46, 0, g); for (const [a, b] of [[-0.2, -0.19], [0.2, -0.19], [-0.2, 0.19], [0.2, 0.19]]) add(tbox(0.04, 0.46, 0.04, 1), M.iron, a, 0.23, b, g);
  add(tbox(0.46, 0.5, 0.04, 1), M.iron, 0, 0.72, -0.21, g); };
silla(4.5, -0.9, -2.2); silla(3.0, 0.4, 0.6);
const limonero = (x, z, s = 1) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.scale.setScalar(s); world.add(g);
  add(new THREE.CylinderGeometry(0.3, 0.22, 0.55, 14), M.pot, 0, 0.27, 0, g); add(new THREE.CylinderGeometry(0.05, 0.06, 0.8, 6), M.trunk, 0, 0.9, 0, g);
  const r = P.rng(Math.round(x * 10 + z)); for (let i = 0; i < 7; i++) add(new THREE.SphereGeometry(0.32, 10, 8), M.leaf, (r() - 0.5) * 0.6, 1.45 + r() * 0.45, (r() - 0.5) * 0.6, g);
  for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.06, 8, 6), M.lemon, (r() - 0.5) * 0.8, 1.3 + r() * 0.6, 0.2 + r() * 0.2, g); };
limonero(-5.6, -3.4); limonero(5.8, -3.5, 1.1); limonero(-6.0, 3.5, 0.9); limonero(6.2, 2.8);

// --- el valle: pueblo, cipreses, pinos, colinas, montañas y nubes (piezas del kit, como los romanos) ---
const VY = -7; // el valle está más bajo que la terraza
add(new THREE.PlaneGeometry(2400, 2400), M.grass, 0, VY, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
const ladera = add(new THREE.SphereGeometry(30, 32, 16), M.hill, 0, -27, 14, world, { cast: false }); ladera.scale.set(1.2, 0.98, 1);
const road = add(new THREE.PlaneGeometry(6, 400), M.dirt, -18, VY + 0.02, -120, world, { cast: false }); road.rotation.x = -Math.PI / 2; road.rotation.z = 0.35;
const house = (x, z, w, d, h, rot, mat = M.plaster, y = VY) => {
  const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; world.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g);
  const rf = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), M.roof, 0, h + 0.9, 0, g); rf.rotation.y = Math.PI / 4; rf.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false });
  for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false });
  return g;
};
const rh = P.rng(12);
for (let i = 0; i < 26; i++) { const x = -60 + rh() * 120, z = -30 - rh() * 90; house(x, z, 4 + rh() * 3, 4 + rh() * 2.5, 3.2 + rh() * 3, rh() * 0.8 - 0.4, i % 2 ? M.plaster : M.plaster2); }
{ // el campanario y la plaza del pueblo (la referencia del «súper» del pueblo: mercado con toldos)
  const t = new THREE.Group(); t.position.set(14, VY, -62); world.add(t);
  add(tbox(4, 16, 4, 2), M.stone, 0, 8, 0, t); const tc = add(new THREE.ConeGeometry(3.4, 4, 4), M.roof, 0, 18, 0, t); tc.rotation.y = Math.PI / 4;
  for (let i = 0; i < 4; i++) { const c = document.createElement('canvas'); c.width = 128; c.height = 32; const g = c.getContext('2d'); for (let k = 0; k < 8; k++) { g.fillStyle = k % 2 ? '#f3e7cc' : ['#2f6fa8', '#c8392e', '#3f8a4a', '#d9a441'][i]; g.fillRect(k * 16, 0, 16, 32); }
    const tl = add(box(3, 0.1, 2), toon({ map: P.tex(c) }), -10 + i * 3.4, 2.6, 6, t); tl.rotation.x = 0.25; add(tbox(2.8, 1, 1.4, 1), M.beam, -10 + i * 3.4, 0.5, 6.2, t); }
}
const cypress = (x, z, h = 7, y = VY) => { const g = new THREE.Group(); g.position.set(x, y, z); world.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), M.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), M.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(0.95, h / 2, 0.95); return g; };
const pine = (x, z, h = 6, y = VY) => { const g = new THREE.Group(); g.position.set(x, y, z); world.add(g); const t = add(new THREE.CylinderGeometry(0.2, 0.3, h, 6), M.trunk, 0, h / 2, 0, g); t.rotation.z = 0.08; const c = add(new THREE.SphereGeometry(1, 12, 8), M.pine, 0.3, h + 0.3, 0, g); c.scale.set(3.2, 1.1, 3.2); return g; };
const rt = P.rng(44);
for (let i = 0; i < 46; i++) { const x = -90 + rt() * 180, z = -14 - rt() * 130; (i % 3 ? cypress : pine)(x, z, 5 + rt() * 4); }
for (const [x, z] of [[-9, -7], [-11.5, -9], [9.5, -7.5], [12, -10], [-14, -6]]) cypress(x, z, 7 + rt() * 2, -3);
for (let i = 0; i < 14; i++) add(new THREE.SphereGeometry(0.9 + rt() * 0.8, 10, 8), M.bush, -40 + rt() * 80, VY + 0.3, -12 - rt() * 40, world).scale.y = 0.7;
for (let i = 0; i < 16; i++) { const a = Math.PI * (1.05 + rt() * 0.9), d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, Math.cos(a) * d, VY - 12, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.5 + rt() * 0.3; }
for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 120 + rt() * 120, r_ = 110 + rt() * 70; const g = new THREE.Group(); g.position.set(Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.3, 7), M.snow, 0, hh * 0.86, 0, g, { cast: false }); }
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = Math.PI * (1.1 + r() * 0.8), d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ================= LA PIZARRA: dibujos de tiza que se trazan con la voz (reutilizable) =================
const TIZA = 'rgba(244,244,236,0.95)', AMA = 'rgba(250,226,120,0.98)', ROJA = 'rgba(242,130,130,0.95)', AZUL = 'rgba(160,210,255,0.95)';
function pizarraFondo(g) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2d4a3a'; g.fillRect(0, 0, 1320, 960);
  const r = P.rng(3); for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * 1320, r() * 960, 40 + r() * 140, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
}
/** línea de tiza que aparece de 0 a 1 (k) */
function trazo(g, pts, k, ancho = 7, col = TIZA) {
  if (k <= 0) return; ancho *= 1.9; let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let resto = L * Math.min(1, k); g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && resto > 0; i++) { const t = Math.min(1, resto / seg[i - 1]); g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t); resto -= seg[i - 1]; }
  g.stroke();
}
const circ = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 40, ry = r) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * ry]; });
/** texto de tiza que se escribe de izquierda a derecha (centrado si cx) */
function escribe(g, txt, x, y, tam, k, col = TIZA, centro = false) {
  if (k <= 0) return; tam *= 1.25; g.save(); g.font = `bold ${tam}px "DejaVu Sans", Arial`; g.textBaseline = 'middle';
  const w = g.measureText(txt).width; if (centro) x -= w / 2;
  g.beginPath(); g.rect(x - 4, y - tam, (w + 8) * Math.min(1, k), tam * 2); g.clip(); g.fillStyle = col; g.fillText(txt, x, y); g.restore();
}
const flecha = (g, x0, y0, x1, y1, k, col = AMA, w = 8) => { const a = Math.atan2(y1 - y0, x1 - x0), L = 40;
  trazo(g, [[x0, y0], [x1, y1]], k * 1.4, w, col); if (k > 0.7) trazo(g, [[x1 - L * Math.cos(a - 0.5), y1 - L * Math.sin(a - 0.5)], [x1, y1], [x1 - L * Math.cos(a + 0.5), y1 - L * Math.sin(a + 0.5)]], (k - 0.7) / 0.3, w, col); };
const tacha = (g, x0, y0, x1, y1, k, col = ROJA) => { trazo(g, [[x0, y0], [x1, y1]], k * 2, 8, col); trazo(g, [[x1, y0], [x0, y1]], k * 2 - 1, 8, col); };
function vestido(g, x, y, s, k, col = TIZA) { // silueta de un vestido en una percha
  trazo(g, [[x - 18 * s, y - 120 * s], [x, y - 140 * s], [x + 18 * s, y - 120 * s]], k * 3, 5 * s, col);
  trazo(g, [[x - 40 * s, y - 110 * s], [x - 30 * s, y - 40 * s], [x - 80 * s, y + 90 * s], [x + 80 * s, y + 90 * s], [x + 30 * s, y - 40 * s], [x + 40 * s, y - 110 * s], [x - 40 * s, y - 110 * s]], k * 3 - 0.6, 6 * s, col);
  trazo(g, [[x - 30 * s, y - 40 * s], [x + 30 * s, y - 40 * s]], k * 3 - 1.8, 5 * s, col);
}
function etiqueta(g, x, y, txt, k, col = AMA, tam = 70) { // etiqueta de precio con su agujero
  const w = 70 + txt.length * tam * 0.62, h = tam * 1.5;
  trazo(g, [[x, y], [x + 30, y - h / 2], [x + w, y - h / 2], [x + w, y + h / 2], [x + 30, y + h / 2], [x, y]], k * 2, 6, col);
  trazo(g, circ(x + 26, y, 7, 0, 7, 10), k * 2 - 0.5, 4, col); escribe(g, txt, x + 52, y, tam, k * 2 - 1, col);
}
function ticket(g, x, y, lineas, k) { // ticket de la compra con dientes abajo
  const w = 420, h = 110 + lineas.length * 86;
  const dientes = []; for (let i = 0; i <= 10; i++) dientes.push([x + w - i * w / 10, y + h + (i % 2 ? 16 : 0)]);
  trazo(g, [[x, y + h], [x, y], [x + w, y], [x + w, y + h], ...dientes], k * 2, 6);
  lineas.forEach(([a, b, col], i) => { escribe(g, a, x + 30, y + 80 + i * 86, 44, k * 3 - 1 - i * 0.3, TIZA); escribe(g, b, x + w - 30 - b.length * 34, y + 80 + i * 86, 56, k * 3 - 1.2 - i * 0.3, col || TIZA); });
}
function coche(g, x, y, s, k, col = TIZA) {
  trazo(g, [[x - 150 * s, y], [x - 150 * s, y - 50 * s], [x - 90 * s, y - 60 * s], [x - 50 * s, y - 120 * s], [x + 60 * s, y - 120 * s], [x + 110 * s, y - 60 * s], [x + 160 * s, y - 50 * s], [x + 160 * s, y], [x - 150 * s, y]], k * 2, 6 * s, col);
  for (const dx of [-85, 95]) trazo(g, circ(x + dx * s, y + 4 * s, 34 * s, 0, 7, 20), k * 2 - 0.8, 6 * s, col);
}
function cerebro(g, x, y, s, k, col = TIZA) {
  const pts = []; for (let i = 0; i <= 60; i++) { const a = Math.PI * (1 - i / 60) * 1.0 + Math.PI * 0; const r = (150 + 18 * Math.sin(i * 1.3)) * s; pts.push([x + Math.cos(Math.PI + a) * r * 1.25, y - Math.abs(Math.sin(Math.PI + a)) * r]); }
  trazo(g, pts, k * 2, 7 * s, col); trazo(g, [[x - 190 * s, y], [x + 190 * s, y]], k * 2 - 0.6, 7 * s, col);
  for (let i = 0; i < 4; i++) trazo(g, circ(x - 120 * s + i * 80 * s, y - 70 * s, 30 * s, Math.PI, Math.PI * 2.3, 12), k * 2 - 1, 5 * s, col);
}
let pizKey = '';
function dibujaPizarra(B) {
  const key = JSON.stringify(B); if (key === pizKey) return; pizKey = key;
  const g = pizC.getContext('2d'); pizarraFondo(g);
  const q = B.k ?? 1, K = (a, b) => Math.max(0, Math.min(1, (q - a) / (b - a)));
  switch (B.tema) {
    case 'vestido': { // «Mismo vestido, cinco dólares más caro… ¡y se vendió más!»
      vestido(g, 330, 500, 2.0, K(0, 0.35));
      etiqueta(g, 650, 330, '44 $', K(0.2, 0.45), TIZA, 90); if (B.sube > 0) tacha(g, 650, 270, 1060, 390, B.sube);
      etiqueta(g, 650, 560, '49 $', K(0.4, 0.7), AMA, 90); flecha(g, 1180, 620, 1180, 300, K(0.45, 0.7), AMA);
      if (B.vende > 0) { escribe(g, '+ VENTAS', 640, 800, 84, B.vende, AMA); }
      break; }
    case 'catalogo': { // «el mismo vestido a 44, 49 y 54 dólares. ¿El que más vendió? El de 49.»
      [['44 $', 230], ['49 $', 660], ['54 $', 1090]].forEach(([t, x], i) => { vestido(g, x, 470, 1.35, K(i * 0.12, 0.3 + i * 0.12)); escribe(g, t, x, 720, 88, K(0.2 + i * 0.12, 0.4 + i * 0.12), i === 1 ? AMA : TIZA, true); });
      if (B.gana > 0) { trazo(g, circ(660, 480, 230, 0, 7, 40, 290), B.gana, 8, AMA); trazo(g, [[560, 140], [600, 60], [630, 120], [660, 40], [690, 120], [720, 60], [760, 140], [560, 140]], B.gana * 1.5 - 0.3, 7, AMA); }
      break; }
    case 'duda': { // «¿Más caro… y se vende más? Algo no cuadra.»
      escribe(g, '49 $', 170, 300, 120, K(0, 0.3), AMA); escribe(g, '>', 610, 300, 120, K(0.25, 0.4)); escribe(g, '44 $', 820, 300, 120, K(0.35, 0.6));
      escribe(g, '?', 560, 640, 260, K(0.6, 0.9), ROJA); break; }
    case 'ticket': { // «Pero mira tu ticket: 2,99. 9,99. Para ti, 2,99 es «dos y algo».»
      ticket(g, 120, 140, [['ARTÍCULO', '2,99', AMA], ['ARTÍCULO', '9,99', AMA]], K(0, 0.5));
      if (B.dos > 0) { escribe(g, '2', 720, 420, 300, B.dos, AMA); escribe(g, 'Y ALGO', 900, 470, 90, B.dos * 1.5 - 0.4, TIZA); trazo(g, circ(810, 400, 140, 0, 7, 30, 170), B.dos * 1.4 - 0.2, 7, AMA); }
      break; }
    case 'coche': { // «Pasa hasta con coches… 22 millones… 80.000 millas… entre 150 y 200 dólares»
      coche(g, 360, 470, 1.6, K(0, 0.25));
      escribe(g, '22 MILLONES', 80, 120, 80, K(0.15, 0.35), AMA);
      trazo(g, [[760, 300], [1240, 300], [1240, 420], [760, 420], [760, 300]], K(0.3, 0.45), 6);
      escribe(g, B.cuenta || '79.999', 790, 360, 86, K(0.35, 0.5), B.cuenta === '80.000' ? ROJA : TIZA);
      escribe(g, 'MILLAS', 880, 480, 56, K(0.4, 0.55));
      if (B.cae > 0) { flecha(g, 1000, 560, 1000, 800, B.cae, ROJA); escribe(g, '-150/200 $', 640, 880, 80, B.cae * 1.4 - 0.3, ROJA); }
      break; }
    case 'cerebro': { // «Tu cerebro… lee la primera cifra… Se llama efecto del dígito izquierdo… 49 es «cuarenta y algo»»
      cerebro(g, 660, 380, 1.4, K(0, 0.3));
      escribe(g, '4', 470, 690, 200, K(0.25, 0.4), AMA); escribe(g, '9', 620, 690, 200, K(0.3, 0.45), 'rgba(244,244,236,0.35)');
      flecha(g, 520, 560, 560, 420, K(0.35, 0.5), AMA);
      escribe(g, 'DÍGITO IZQUIERDO', 660, 860, 70, K(0.5, 0.8), AMA, true);
      break; }
    case 'nueves': { // «Mira tu último ticket… ¿cuántos nueves cuentas?»
      ticket(g, 360, 90, [['', '0,99', AMA], ['', '4,99', AMA], ['', '19,99', AMA]], K(0, 0.6));
      escribe(g, '?', 1000, 520, 220, K(0.6, 0.9), AMA); break; }
    case 'texto': { (B.lineas || []).forEach((l, i) => escribe(g, l, 660, 200 + i * 200, 110, K(i * 0.25, 0.25 + i * 0.25), i ? TIZA : AMA, true)); break; }
  }
  pizT.needsUpdate = true;
}

// ---------- estado del decorado en cada fotograma ----------
function worldLight(L, f) { /* este decorado no tiene lámparas: la luz es la del sol del plano */ }
function worldState(S, f) {
  dibujaPizarra(S.pizarra || { tema: 'texto', lineas: [] });
  mesa.userData.lona.rotation.y = 0.03 * Math.sin(f * 0.05);   // la sombrilla se mece con la brisa
}
