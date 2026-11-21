// ---------- PIEZAS del motor (Inercia del Consumo): se usan en _world.js para construir cada decorado A MEDIDA ----------
// REGLA: solo se pone en escena lo que el guion nombra (lo comprueba `./inercia escena N`). Estas piezas son el KIT,
// en el estilo de los romanos; lo nuevo se hace en este mismo estilo y, si sirve para otros vídeos, se añade aquí.
const MK = {
  plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1), roof: texM(P.roof(9), 2, 2), stone: texM(P.stone(4), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), beam: texM(P.beam(2), 1, 2), plank: texM(P.planks(1), 1, 6), marble: texM(P.marble(10), 1, 1),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  door: toon({ color: '#5a3a24' }), window: toon({ color: '#2b2430' }), shelf: toon({ color: '#e9e2d2' }), white: toon({ color: '#f4f1ea' }),
};
const clouds = [];
/** casa del kit (paredes de yeso, tejado de cuatro aguas, puerta y ventanas) */
const casa = (parent, x, y, z, w, d, h, rot = 0, mat = MK.plaster) => { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = rot; parent.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g); const r = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), MK.roof, 0, h + 0.9, 0, g); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), MK.door, 0, 0.9, d / 2 + 0.03, g, { cast: false }); for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), MK.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false }); return g; };
const cipres = (parent, x, y, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), MK.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), MK.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(0.95, h / 2, 0.95); return g; };
const pino = (parent, x, y, z, h = 6) => { const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); const t = add(new THREE.CylinderGeometry(0.2, 0.3, h, 6), MK.trunk, 0, h / 2, 0, g); t.rotation.z = 0.08; const c = add(new THREE.SphereGeometry(1, 12, 8), MK.pine, 0.3, h + 0.3, 0, g); c.scale.set(3.2, 1.1, 3.2); return g; };
/** paisaje del kit alrededor de (cx, cz): hierba, colinas, montañas nevadas y nubes pintadas (como los romanos) */
function paisaje(parent, cx = 0, cz = 0, y = -0.3, seed = 44) {
  const rt = P.rng(seed);
  add(new THREE.PlaneGeometry(2400, 2400), MK.grass, cx, y, cz, parent, { cast: false }).rotation.x = -Math.PI / 2;
  for (let i = 0; i < 16; i++) { const a = rt() * Math.PI * 2, d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? MK.hill : MK.hillFar, cx + Math.cos(a) * d, y - 12, cz + Math.sin(a) * d, parent, { cast: false }); h.scale.y = 0.5 + rt() * 0.3; }
  for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 120 + rt() * 120, r_ = 110 + rt() * 70; const g = new THREE.Group(); g.position.set(cx + Math.cos(a) * d, -5, cz + Math.sin(a) * d); parent.add(g); add(new THREE.ConeGeometry(r_, hh, 7), MK.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.3, 7), MK.snow, 0, hh * 0.86, 0, g, { cast: false }); }
  const r = P.rng(seed + 46);
  for (let i = 0; i < 14; i++) { const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(cx + Math.cos(a) * d, 120 + r() * 160, cz + Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m); }
}
/** letrero pintado con una palabra QUE DIGA EL GUION */
const letrero = (txt, w, h, fondo = '#ece2cf', tinta = '#3a2a1e') => { const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d');
  g.fillStyle = fondo; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#241726'; g.lineWidth = 18; g.strokeRect(9, 9, c.width - 18, c.height - 18);
  g.font = `bold ${c.height * 0.62}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = tinta; g.fillText(txt, c.width / 2, c.height * 0.54);
  return toon({ map: P.tex(c) }); };
/** estantería de tienda con productos y etiquetas de precio (en g.userData.etiquetas) */
const estante = (parent, x, z, rot, seed) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; parent.add(g); const r = P.rng(seed); g.userData.etiquetas = [];
  const cols = ['#c8392e', '#2f6fa8', '#e8b830', '#3f8a4a', '#d9832f', '#7b5ac9', '#f4f1ea', '#c25a7a'];
  add(tbox(1.9, 2.4, 0.06, 1), MK.shelf, 0, 1.2, -0.25, g); for (const sx of [-0.95, 0.95]) add(tbox(0.06, 2.4, 0.5, 1), MK.shelf, sx, 1.2, 0, g); add(tbox(1.96, 0.08, 0.52, 1), MK.shelf, 0, 2.42, 0, g);
  for (let b = 0; b < 4; b++) { const y = 0.3 + b * 0.55; add(tbox(1.86, 0.04, 0.5, 1), MK.beam, 0, y, 0.02, g);
    let px = -0.85; while (px < 0.8) { const tipo = r(), col = cols[(r() * 8) | 0], w = 0.12 + r() * 0.1;
      if (tipo < 0.4) add(tbox(w, 0.22 + r() * 0.12, 0.2, 1), toon({ color: col }), px + w / 2, y + 0.15, 0.05, g);
      else if (tipo < 0.7) { add(new THREE.CylinderGeometry(w * 0.4, w * 0.4, 0.2, 12), toon({ color: col }), px + w / 2, y + 0.12, 0.05, g); add(new THREE.CylinderGeometry(w * 0.41, w * 0.41, 0.04, 12), MK.white, px + w / 2, y + 0.12, 0.05, g); }
      else { add(new THREE.CylinderGeometry(0.035, 0.055, 0.3, 10), toon({ color: col }), px + 0.06, y + 0.17, 0.05, g); add(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), MK.window, px + 0.06, y + 0.35, 0.05, g); }
      px += w + 0.03; }
    for (let k = 0; k < 3; k++) g.userData.etiquetas.push(add(box(0.14, 0.06, 0.01), toon({ color: k % 2 ? '#f2d23a' : '#ffffff' }), -0.6 + k * 0.6, y - 0.03, 0.28, g, { cast: false })); }
  return g; };
// ---------- PIZARRA de tiza (SOLO si el guion habla de una clase, una pizarra o alguien que explica en ella) ----------
// const piz = crearPizarra(world, x, y, z); en worldState: piz.dibuja(estado, (g) => { trazo(g, …); escribe(g, …); })
function crearPizarra(parent, x, y, z, w = 2.2, h = 1.6) {
  const c = document.createElement('canvas'); c.width = 1320; c.height = Math.round(1320 * h / w); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const m = new THREE.MeshToonMaterial({ gradientMap: grad, map: t, emissive: new THREE.Color('#ffffff'), emissiveMap: t, emissiveIntensity: 0.16 });
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g); add(new THREE.PlaneGeometry(w, h), m, 0, 0, 0.05, g, { cast: false });
  for (const [ww, hh, xx, yy] of [[w + 0.24, 0.12, 0, h / 2 + 0.06], [w + 0.24, 0.12, 0, -h / 2 - 0.06], [0.12, h, -w / 2 - 0.06, 0], [0.12, h, w / 2 + 0.06, 0]]) add(tbox(ww, hh, 0.08, 1), MK.beam, xx, yy, 0.06, g);
  let key = ''; return { grupo: g, dibuja: (k, fn) => { const kk = JSON.stringify(k); if (kk === key) return; key = kk; const gg = c.getContext('2d'); pizarraFondo(gg, c.width, c.height); fn(gg); t.needsUpdate = true; } };
}
function pizarraFondo(g, W = 1320, H = 960) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2d4a3a'; g.fillRect(0, 0, W, H);
  const r = P.rng(3); for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * W, r() * H, 40 + r() * 140, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
}
// ---------- trazos de tiza / dibujo a mano (pizarras, carteles, letreros) ----------
const TIZA = 'rgba(244,244,236,0.95)', AMA = 'rgba(250,226,120,0.98)', ROJA = 'rgba(242,130,130,0.95)', AZUL = 'rgba(160,210,255,0.95)';
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
  const w = 560, h = 120 + lineas.length * 130;
  const dientes = []; for (let i = 0; i <= 10; i++) dientes.push([x + w - i * w / 10, y + h + (i % 2 ? 16 : 0)]);
  trazo(g, [[x, y + h], [x, y], [x + w, y], [x + w, y + h], ...dientes], k * 2, 6);
  lineas.forEach(([a, b, col], i) => { if (a) escribe(g, a, x + 30, y + 110 + i * 130, 44, k * 3 - 1 - i * 0.3, TIZA); escribe(g, b, x + w / 2, y + 110 + i * 130, 92, k * 3 - 1.2 - i * 0.3, col || TIZA, true); });
}
function coche(g, x, y, s, k, col = TIZA) {
  trazo(g, [[x - 150 * s, y], [x - 150 * s, y - 50 * s], [x - 90 * s, y - 60 * s], [x - 50 * s, y - 120 * s], [x + 60 * s, y - 120 * s], [x + 110 * s, y - 60 * s], [x + 160 * s, y - 50 * s], [x + 160 * s, y], [x - 150 * s, y]], k * 2, 6 * s, col);
  for (const dx of [-85, 95]) trazo(g, circ(x + dx * s, y + 4 * s, 34 * s, 0, 7, 20), k * 2 - 0.8, 6 * s, col);
}
function cerebro(g, x, y, s, k, col = TIZA) { // cerebro de perfil: contorno de nube con lóbulos, surco central y tronco
  const pts = [], n = 90;
  for (let i = 0; i <= n; i++) { const a = Math.PI * 2 * i / n, r = 1 + 0.07 * Math.sin(a * 9);
    pts.push([x + Math.cos(a) * 210 * s * r, y + Math.sin(a) * 150 * s * r * (Math.sin(a) > 0 ? 0.8 : 1)]); }
  trazo(g, pts, k * 2, 7 * s, col);
  trazo(g, [[x - 10 * s, y - 145 * s], [x - 30 * s, y - 70 * s], [x + 10 * s, y - 20 * s], [x - 20 * s, y + 40 * s]], k * 2 - 0.7, 6 * s, col);
  for (const [cx, cy, r, a0] of [[-110, -40, 50, 3.4], [100, -50, 55, 3.6], [-90, 50, 40, 0.2], [110, 40, 45, -0.2]]) trazo(g, circ(x + cx * s, y + cy * s, r * s, a0, a0 + 2.4, 14), k * 2 - 1, 5 * s, col);
  trazo(g, [[x + 60 * s, y + 118 * s], [x + 80 * s, y + 190 * s]], k * 2 - 1, 7 * s, col);
}
function tarjetaT(g, x, y, s, k, col = AMA) { // tarjeta de crédito: rectángulo redondeado, chip y banda
  const w = 260 * s, h = 165 * s, r = 22 * s, pts = [];
  for (const [cx, cy, a0] of [[x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0], [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI]]) pts.push(...circ(cx, cy, r, a0, a0 + Math.PI / 2, 6));
  pts.push(pts[0]); trazo(g, pts, k * 2, 7 * s, col);
  trazo(g, [[x + 30 * s, y + 55 * s], [x + 80 * s, y + 55 * s], [x + 80 * s, y + 95 * s], [x + 30 * s, y + 95 * s], [x + 30 * s, y + 55 * s]], k * 2 - 1, 5 * s, col);
  trazo(g, [[x + 30 * s, y + 130 * s], [x + 200 * s, y + 130 * s]], k * 2 - 1.2, 6 * s, col);
}
function bancoT(g, x, y, s, k, col = TIZA) { // edificio de banco: frontón, columnas y escalón
  trazo(g, [[x - 150 * s, y - 120 * s], [x, y - 200 * s], [x + 150 * s, y - 120 * s], [x - 150 * s, y - 120 * s]], k * 2, 7 * s, col);
  for (let i = 0; i < 4; i++) trazo(g, [[x - 110 * s + i * 73 * s, y - 110 * s], [x - 110 * s + i * 73 * s, y + 40 * s]], k * 2 - 0.6 - i * 0.1, 7 * s, col);
  trazo(g, [[x - 170 * s, y + 50 * s], [x + 170 * s, y + 50 * s]], k * 2 - 1, 8 * s, col);
}
function billeteT(g, x, y, s, k, col = 'rgba(160,230,160,0.95)') {
  trazo(g, [[x, y], [x + 260 * s, y], [x + 260 * s, y + 130 * s], [x, y + 130 * s], [x, y]], k * 2, 7 * s, col);
  trazo(g, circ(x + 130 * s, y + 65 * s, 40 * s, 0, 7, 20), k * 2 - 0.8, 6 * s, col); escribe(g, '$', x + 116 * s, y + 66 * s, 44 * s, k * 2 - 1.2, col);
}
function tiendaT(g, x, y, s, k, col = TIZA) { // tienda: toldo de ondas y mostrador
  trazo(g, [[x - 140 * s, y - 60 * s], [x - 140 * s, y + 90 * s], [x + 140 * s, y + 90 * s], [x + 140 * s, y - 60 * s]], k * 2, 7 * s, col);
  const t = []; for (let i = 0; i <= 7; i++) t.push(...circ(x - 140 * s + i * 40 * s, y - 60 * s, 20 * s, 0, Math.PI, 6)); trazo(g, t, k * 2 - 0.5, 6 * s, col);
  trazo(g, [[x - 150 * s, y - 60 * s], [x - 120 * s, y - 130 * s], [x + 120 * s, y - 130 * s], [x + 150 * s, y - 60 * s]], k * 2 - 0.8, 6 * s, col);
}
