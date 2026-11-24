import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { TOTAL, shotAt, camAt, dofAt, lightFor, actorsAt, worldAt, fxAt } from './story.js';

const W = 1080, H = 1920;
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(W, H, false);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.NoToneMapping;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(40, W / H, 0.08, 1500);
const rx = (a) => a * Math.PI / 180;

// ---------- materials ----------
const grad = (() => { const d = new Uint8Array([90, 90, 90, 255, 255, 255, 255, 255]); const t = new THREE.DataTexture(d, 2, 1); t.minFilter = t.magFilter = THREE.NearestFilter; t.needsUpdate = true; return t; })();
const toon = (opts) => new THREE.MeshToonMaterial({ gradientMap: grad, ...opts });
const texM = (c, rx_ = 1, ry_ = 1, color = '#ffffff') => toon({ map: P.tex(c, rx_, ry_), color });
// ---------- ink / normal-depth contract ----------
const NOINK = 'noink'; // userData flag: never outlined (cards, fx, water handled specially)
const ndMat = new THREE.ShaderMaterial({
  vertexShader: `varying vec3 vN; varying float vD; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n; gl_FragColor = vec4(n*.5+.5, vD); }`,
  side: THREE.DoubleSide,
});
const cardNd = (map) => new THREE.ShaderMaterial({
  uniforms: { map: { value: map } },
  vertexShader: `varying vec2 vUv; varying float vD; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `uniform sampler2D map; varying vec2 vUv; varying float vD; void main(){ if(texture2D(map,vUv).a<.5) discard; gl_FragColor=vec4(0.,0.,0.,vD); }`,
  side: THREE.DoubleSide,
});
const waterNd = new THREE.ShaderMaterial({
  vertexShader: `varying float vD; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vD=-mv.z; gl_Position=projectionMatrix*mv; }`,
  fragmentShader: `varying float vD; void main(){ gl_FragColor=vec4(.5,1.,.5,vD); }`,
});

// ---------- helpers ----------
const add = (geo, mat, x = 0, y = 0, z = 0, parent = scene, opts = {}) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = opts.cast ?? true; m.receiveShadow = true; parent.add(m); return m;
};
const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
const uvScale = (geo, su, sv) => { const uv = geo.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * su, uv.getY(i) * sv); return geo; };
/** box with world-scaled UVs per face (texel density 1 tile per `t` metres) */
const tbox = (w, h, d, t = 2) => {
  const g = box(w, h, d), uv = g.attributes.uv;
  const dims = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let k = 0; k < 4; k++) { const i = f * 4 + k; uv.setXY(i, uv.getX(i) * dims[f][0] / t, uv.getY(i) * dims[f][1] / t); }
  return g;
};

// ---------- sky ----------
const skyU = { top: { value: new THREE.Color() }, hor: { value: new THREE.Color() }, sunDir: { value: new THREE.Vector3() }, sunCol: { value: new THREE.Color() }, sunSize: { value: 0 } };
const sky = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
  uniforms: skyU, side: THREE.BackSide, depthWrite: false, fog: false,
  vertexShader: `varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform vec3 top, hor, sunDir, sunCol; uniform float sunSize; varying vec3 vP;
    void main(){ float h = clamp(vP.y,0.,1.); vec3 c = mix(hor, top, pow(h, .55)); if(vP.y<0.) c = hor;
      float s = dot(normalize(vP), normalize(sunDir)); c += sunCol * (smoothstep(1.-sunSize, 1.-sunSize*.6, s) + .35*pow(max(s,0.), 24.)*step(.001,sunSize));
      gl_FragColor = vec4(c,1.); }`,
}));
sky.userData.sky = true; scene.add(sky);

// ---------- lights ----------
const hemi = new THREE.HemisphereLight('#ffffff', '#ffffff', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 2); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03; sun.shadow.radius = 2;
scene.add(sun); scene.add(sun.target);
scene.fog = new THREE.Fog('#ffffff', 40, 600);

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
// ---------- world: VÍDEO 2 «Cómo gana el banco con tu tarjeta» — DECORADO A MEDIDA DEL GUION ----------
// Lo que nombra el guion: la TIENDA (donde pagas con tarjeta), tu BANCO, los PRECIOS, la tarjeta y el efectivo.
// A) DENTRO DE LA TIENDA (x≈0): baldosas, estanterías con productos y etiquetas de precio, la CAJA con el datáfono,
//    la tarjeta, billetes y monedas, y más baldas con tarros, cestas, cajas y plantas.
// B) LA CALLE (x≈60): la fachada de la tienda con toldo y, enfrente, el BANCO con columnas; adoquines, farolas, árboles.
const DECK = 0;
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  stone: texM(P.stone(4), 1, 1), cobble: texM(P.stone(23, 30, 12, 58, 64, 64), 1, 1),
  grass: texM(P.grass(6), 40, 40), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#3a3836' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }), window: toon({ color: '#2b2430' }),
  glass: toon({ color: '#bfe0f2', emissive: new THREE.Color('#9fd0ee'), emissiveIntensity: 0.45 }), gold: toon({ color: '#e2b544' }),
  shelf: toon({ color: '#e9e2d2' }), green: toon({ color: '#3f6b5a' }), red: toon({ color: '#b8282b' }), dark: toon({ color: '#2b2f36' }),
};
const world = new THREE.Group(); scene.add(world);
// ---- suelo de baldosas de la tienda (ajedrezado pintado, con grano de piedra) ----
const baldosa = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = P.rng(31);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e8dcc4' : '#b8573e'; g.fillRect(i * 64, j * 64, 64, 64);
    for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; g.fillRect(i * 64 + r() * 64, j * 64 + r() * 64, 2 + r() * 4, 2 + r() * 4); } }
  g.strokeStyle = 'rgba(60,40,30,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  return c; })();
const RW = 5.5, RB = -2.4, RF = 6, RH = 4.0;
add(tbox(RW * 2, 0.2, RF - RB, 1), texM(baldosa, 1, 1), 0, -0.1, (RF + RB) / 2, world, { cast: false });
// paredes de yeso con zócalo de madera; ventana grande a la izquierda (la calle con sol)
const yeso = texM(P.plaster(8, 36), 1, 1, '#f3e2c2');
add(tbox(RW * 2, RH, 0.2, 2.2), yeso, 0, RH / 2, RB - 0.1, world, { cast: false });
add(tbox(0.2, RH, RF - RB, 2.2), yeso, RW + 0.1, RH / 2, (RF + RB) / 2, world, { cast: false });
for (const [z0, z1] of [[RB, -0.6], [2.4, RF]]) add(tbox(0.2, RH, z1 - z0, 2.2), yeso, -RW - 0.1, RH / 2, (z0 + z1) / 2, world, { cast: false });
add(tbox(0.2, 1.0, 3.0, 2.2), yeso, -RW - 0.1, 0.5, 0.9, world, { cast: false }); add(tbox(0.2, 0.8, 3.0, 2.2), yeso, -RW - 0.1, RH - 0.4, 0.9, world, { cast: false });
add(tbox(0.06, 2.2, 3.0, 1), M.glass, -RW - 0.05, 2.1, 0.9, world, { cast: false });
for (const z of [-0.55, 0.9, 2.35]) add(tbox(0.12, 2.3, 0.1, 1), M.wood, -RW + 0.02, 2.1, z, world);
add(tbox(RW * 2, 0.9, 0.06, 1.2), M.beam, 0, 0.45, RB + 0.03, world, { cast: false });
add(tbox(0.06, 0.9, RF - RB, 1.2), M.beam, RW - 0.03, 0.45, (RF + RB) / 2, world, { cast: false });
// lámparas colgantes de latón
for (const x of [-2.6, 0.6, 3.4]) { add(new THREE.CylinderGeometry(0.01, 0.01, 1.0, 4), M.iron, x, RH - 0.5, 0.4, world); add(new THREE.ConeGeometry(0.28, 0.24, 18, 1, true), M.gold, x, RH - 1.05, 0.4, world); add(new THREE.SphereGeometry(0.08, 10, 8), toon({ color: '#fff4c8', emissive: new THREE.Color('#ffe9a0'), emissiveIntensity: 1 }), x, RH - 1.14, 0.4, world); }
const productos = ['#c8392e', '#2f6fa8', '#e8b830', '#3f8a4a', '#d9832f', '#7b5ac9', '#f4f1ea', '#c25a7a'];
// estanterías con productos y etiquetas de precio (pieza del kit: _piezas.js)
const ESTANTES = [estante(world, -3.6, RB + 0.35, 0, 5), estante(world, -1.5, RB + 0.35, 0, 8), estante(world, 0.6, RB + 0.35, 0, 9), estante(world, -RW + 0.35, 4.2, Math.PI / 2, 6), estante(world, RW - 0.35, 3.6, -Math.PI / 2, 7)];
// fruta en cajas junto a la ventana
for (let i = 0; i < 3; i++) { const x = -4.6, z = -0.2 + i * 0.7; add(tbox(0.55, 0.5, 0.6, 1), M.plank, x, 0.25, z, world); const col = ['#f08a24', '#c8302a', '#f2d23a'][i]; const r = P.rng(40 + i);
  for (let k = 0; k < 9; k++) add(new THREE.SphereGeometry(0.075, 10, 8), toon({ color: col }), x - 0.17 + (k % 3) * 0.17, 0.55 + r() * 0.04, z - 0.18 + Math.floor(k / 3) * 0.18, world); }
// MÁS VIDA EN LA TIENDA (nivel camarote/romanos: muchos objetos pintados, centro libre)
// vigas de madera en el techo y techo de yeso
add(tbox(RW * 2, 0.12, RF - RB, 2.2), yeso, 0, RH + 0.06, (RF + RB) / 2, world, { cast: false });
for (let i = 0; i < 5; i++) add(tbox(RW * 2, 0.22, 0.2, 1), M.beamDark, 0, RH - 0.11, RB + 0.6 + i * 1.8, world);
// baldas de pared detrás de la caja: tarros de cristal, panes y botellas
const rp = P.rng(52);
for (const [y, n] of [[1.75, 9], [2.35, 8]]) { add(tbox(2.6, 0.06, 0.32, 1), M.beam, 3.6, y, RB + 0.18, world);
  for (let k = 0; k < 2; k++) add(tbox(0.04, 0.22, 0.28, 1), M.iron, 2.5 + k * 2.2, y - 0.12, RB + 0.18, world);
  for (let i = 0; i < n; i++) { const x = 2.45 + i * (2.3 / n), t = rp(), col = productos[(rp() * 8) | 0];
    if (t < 0.4) { add(new THREE.CylinderGeometry(0.08, 0.08, 0.22, 12), M.glass, x, y + 0.14, RB + 0.18, world); add(new THREE.CylinderGeometry(0.085, 0.085, 0.05, 12), toon({ color: col }), x, y + 0.27, RB + 0.18, world); }
    else if (t < 0.7) { const pan = add(new THREE.CapsuleGeometry(0.06, 0.18, 4, 8), toon({ color: '#d9a35a' }), x, y + 0.1, RB + 0.18, world); pan.rotation.z = Math.PI / 2; }
    else { add(new THREE.CylinderGeometry(0.04, 0.06, 0.3, 10), toon({ color: col }), x, y + 0.18, RB + 0.18, world); add(new THREE.CylinderGeometry(0.022, 0.022, 0.07, 6), M.dark, x, y + 0.37, RB + 0.18, world); } } }
// nevera de bebidas con puerta de cristal (luz fría contra la cálida de las lámparas)
{ const nv = new THREE.Group(); nv.position.set(RW - 0.45, 0, 0.6); nv.rotation.y = -Math.PI / 2; world.add(nv);
  add(tbox(1.3, 2.1, 0.7, 1), toon({ color: '#d8dde2' }), 0, 1.05, 0, nv);
  add(box(1.1, 1.75, 0.02), toon({ color: '#cfeefc', emissive: new THREE.Color('#8fd6ff'), emissiveIntensity: 0.55 }), 0, 1.1, 0.36, nv, { cast: false });
  const rn = P.rng(71); for (let b = 0; b < 4; b++) for (let i = 0; i < 7; i++) { const col = productos[(rn() * 8) | 0];
    add(new THREE.CylinderGeometry(0.045, 0.045, 0.26, 10), toon({ color: col }), -0.45 + i * 0.15, 0.42 + b * 0.42, 0.25, nv); }
  add(tbox(1.3, 0.3, 0.72, 1), toon({ color: '#c8392e' }), 0, 2.2, 0, nv); add(box(0.05, 0.6, 0.05), M.iron, 0.48, 1.1, 0.38, nv); }
// cestas de la compra apiladas junto a la entrada, cajas de cartón y plantas en macetas
for (let i = 0; i < 4; i++) { const g = new THREE.Group(); g.position.set(-1.0, 0.05 + i * 0.12, 3.6); world.add(g);
  add(new THREE.CylinderGeometry(0.3, 0.24, 0.22, 4, 1, true), toon({ color: '#c8302a', side: THREE.DoubleSide }), 0, 0.11, 0, g).rotation.y = Math.PI / 4; }
const carton = toon({ color: '#c49a64' });
for (const [x, y, z, w, h, r] of [[-4.7, 0.25, 3.2, 0.7, 0.5, 0.2], [-4.6, 0.72, 3.25, 0.55, 0.44, -0.1], [-4.0, 0.22, 3.6, 0.5, 0.44, 0.5]]) add(tbox(w, h, w * 0.8, 1), carton, x, y, z, world).rotation.y = r;
for (const [x, z] of [[-4.9, -1.6], [-4.9, 2.9], [4.8, 4.9]]) { add(new THREE.CylinderGeometry(0.22, 0.17, 0.42, 12), toon({ color: '#b5603c' }), x, 0.21, z, world);
  for (let k = 0; k < 5; k++) { const h = add(new THREE.SphereGeometry(0.26, 10, 8), M.bush, x + Math.cos(k * 1.3) * 0.12, 0.62 + k * 0.1, z + Math.sin(k * 1.3) * 0.12, world); h.scale.set(1, 1.3, 1); } }
// alfombrilla de la entrada y el pasillo libre en el centro
add(box(1.6, 0.012, 1.0), toon({ color: '#6a3a2a' }), 1.6, 0.006, 4.6, world, { cast: false });
// LA CAJA: mostrador con cinta, caja registradora, el DATÁFONO, la tarjeta dorada, un billete y monedas
const mesa = new THREE.Group(); mesa.position.set(3.1, 0, -0.9); mesa.rotation.y = -0.5; world.add(mesa);
add(tbox(2.2, 0.95, 0.75, 1), M.beam, 0, 0.475, 0, mesa); add(tbox(2.3, 0.06, 0.85, 1), M.marbleTop, 0, 0.98, 0, mesa);
add(box(1.2, 0.02, 0.5), M.dark, -0.4, 1.02, 0, mesa, { cast: false });
const caja = new THREE.Group(); caja.position.set(0.55, 1.01, -0.15); mesa.add(caja);
add(tbox(0.46, 0.22, 0.4, 1), M.green, 0, 0.11, 0, caja); add(tbox(0.3, 0.16, 0.06, 1), M.dark, 0, 0.32, -0.12, caja);
add(box(0.22, 0.1, 0.01), toon({ color: '#7fd88a', emissive: new THREE.Color('#3fae58'), emissiveIntensity: 0.6 }), 0, 0.33, -0.088, caja, { cast: false });
const dat = new THREE.Group(); dat.position.set(0.85, 1.01, 0.22); dat.rotation.set(-0.35, 0.3, 0); mesa.add(dat);
add(tbox(0.16, 0.05, 0.26, 1), M.dark, 0, 0.025, 0, dat);
add(box(0.12, 0.006, 0.08), toon({ color: '#7fd88a', emissive: new THREE.Color('#3fae58'), emissiveIntensity: 0.6 }), 0, 0.053, -0.07, dat, { cast: false });
for (let i = 0; i < 9; i++) add(box(0.028, 0.008, 0.022), toon({ color: '#e8e4da' }), -0.035 + (i % 3) * 0.035, 0.054, 0.02 + Math.floor(i / 3) * 0.032, dat, { cast: false });
const tarjeta = add(box(0.17, 0.006, 0.11), M.gold, 0.55, 1.02, 0.28, mesa); tarjeta.rotation.y = 0.4;
add(box(0.04, 0.008, 0.03), toon({ color: '#c9c4bd' }), 0.53, 1.025, 0.27, mesa, { cast: false });
add(box(0.2, 0.004, 0.1), toon({ color: '#8fcf8f' }), 0.1, 1.015, 0.25, mesa).rotation.y = -0.3;
for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12), M.gold, -0.1 + i * 0.05, 1.015 + (i % 2) * 0.01, 0.3, mesa);
mesa.userData.lona = new THREE.Object3D();
{ const ce = new THREE.Group(); ce.position.set(-0.7, 1.02, 0.1); mesa.add(ce); add(new THREE.CylinderGeometry(0.24, 0.19, 0.2, 4, 1, true), toon({ color: '#c8302a', side: THREE.DoubleSide }), 0, 0.1, 0, ce).rotation.y = Math.PI / 4;
  add(new THREE.TorusGeometry(0.16, 0.015, 6, 16, Math.PI), M.iron, 0, 0.2, 0, ce);
  for (const [x, z, c] of [[-0.06, 0.03, '#f08a24'], [0.07, -0.04, '#3f8a4a'], [0.0, 0.07, '#e8b830']]) add(new THREE.SphereGeometry(0.06, 10, 8), toon({ color: c }), x, 0.2, z, ce); }
{ const bo = add(tbox(0.26, 0.34, 0.16, 1), carton, -0.15, 1.18, -0.15, mesa); const pan = add(new THREE.CapsuleGeometry(0.045, 0.3, 4, 8), toon({ color: '#d9a35a' }), -0.12, 1.42, -0.15, mesa); pan.rotation.z = 0.3; }
add(new THREE.CylinderGeometry(0.035, 0.035, 0.08, 12), M.marbleTop, 0.3, 1.36, -0.25, mesa).rotation.z = Math.PI / 2;

// ---- B) LA CALLE: la tienda y, enfrente, el banco (x ≈ 60) ----
const CX = 60, calle = new THREE.Group(); calle.position.set(CX, 0, 0); world.add(calle);
add(tbox(40, 0.2, 40, 1.4), M.cobble, 0, -0.1, -6, calle, { cast: false });
add(tbox(40, 0.18, 2.6, 1), M.stone, 0, 0.09, -4.3, calle, { cast: false }); add(tbox(40, 0.18, 2.6, 1), M.stone, 0, 0.09, 4.3, calle, { cast: false }); // aceras
// fachada de la TIENDA (lado izquierdo de la calle, z<0): escaparate, puerta, toldo de rayas, cajas de fruta en la puerta
const tf = new THREE.Group(); tf.position.set(-4, 0, -6); calle.add(tf);
add(tbox(7, 6, 3, 2.2), M.plaster2, 0, 3, -1.5, tf); const rf = add(tbox(7.6, 0.4, 3.6, 2), M.roof, 0, 6.15, -1.4, tf);
add(tbox(3.2, 2.0, 0.08, 1), M.glass, -1.5, 1.6, 0.02, tf, { cast: false }); add(tbox(1.2, 2.3, 0.1, 1), M.door, 1.9, 1.15, 0.02, tf, { cast: false });
{ const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d'); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f3e7cc' : '#2f6fa8'; g.fillRect(i * 43, 0, 43, 64); }
  const lona = add(box(6.6, 0.06, 1.6), toon({ map: P.tex(c) }), 0, 3.1, 0.7, tf); lona.rotation.x = 0.35; }
for (let i = 0; i < 3; i++) { add(tbox(0.6, 0.45, 0.5, 1), M.plank, -2.6 + i * 0.7, 0.4, 0.6, tf); const r = P.rng(60 + i); for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.08, 8, 6), toon({ color: ['#f08a24', '#c8302a', '#f2d23a'][i] }), -2.75 + i * 0.7 + (k % 3) * 0.15, 0.7 + r() * 0.03, 0.5 + Math.floor(k / 3) * 0.18, tf); }
// el BANCO (enfrente, z>0): escalinata, columnas, frontón, puerta de bronce
const bk = new THREE.Group(); bk.position.set(3.5, 0, 7.5); bk.rotation.y = Math.PI; calle.add(bk);
add(tbox(10, 7.5, 4, 2.2), M.marble, 0, 3.75 + 0.6, -2, bk);
for (let i = 0; i < 3; i++) add(tbox(10.4 - i * 0.4, 0.2, 1.6 - i * 0.4, 1), M.stone, 0, 0.1 + i * 0.2, 0.9 - i * 0.2, bk);
const colG = new THREE.CylinderGeometry(0.32, 0.36, 5.6, 14); colG.translate(0, 2.8, 0);
for (let i = 0; i < 6; i++) add(colG, M.marble, -3.75 + i * 1.5, 0.6, 0.45, bk);
add(tbox(9.4, 0.7, 1.1, 2), M.marbleTop, 0, 6.55, 0.4, bk);
{ const sh = new THREE.Shape(); sh.moveTo(-4.9, 0); sh.lineTo(4.9, 0); sh.lineTo(0, 1.9); sh.closePath(); add(new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false }), M.marbleTop, 0, 6.9, -0.1, bk); }
add(tbox(1.6, 2.8, 0.1, 1), toon({ color: '#b08a4a' }), 0, 2.0, 0.02, bk, { cast: false });
add(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), M.gold, 0, 7.6, 0.95, bk).rotation.x = Math.PI / 2;
// letreros con la palabra que dice el guion: «BANCO» y «TIENDA» (pintados como el resto: tinta y colores planos)
add(new THREE.PlaneGeometry(5.2, 0.9), letrero('BANCO', 5.2, 0.9, '#ece2cf', '#3a2a1e'), 0, 6.55, 0.97, bk, { cast: false });
add(new THREE.PlaneGeometry(4.2, 0.8), letrero('TIENDA', 4.2, 0.8, '#2f6fa8', '#f3e7cc'), 0, 4.2, 0.03, tf, { cast: false });
// farolas, árboles, casas al fondo de la calle, colinas, montañas y nubes (kit)
for (const [x, z] of [[-14, -4.6], [-2, -4.6], [10, -4.6], [-8, 4.6], [4, 4.6]]) { add(new THREE.CylinderGeometry(0.06, 0.08, 4, 8), M.iron, x, 2, z, calle); add(new THREE.SphereGeometry(0.22, 10, 8), toon({ color: '#fff4c8' }), x, 4.1, z, calle); }
const house = (x, z, w, d, h, rot, mat) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; calle.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g); const r = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), M.roof, 0, h + 0.9, 0, g); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false }); for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false }); };
const rh = P.rng(12);
for (let i = 0; i < 7; i++) { house(-16 + i * 5.2 + (i > 1 && i < 4 ? 8 : 0), -8.5, 4.5, 4, 4.5 + rh() * 3, 0, i % 2 ? M.plaster : M.plaster2); house(-14 + i * 6, 9.5 + rh(), 4.5, 4, 4 + rh() * 3, Math.PI, i % 2 ? M.plaster2 : M.plaster); }
const cypress = (x, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), M.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), M.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(0.95, h / 2, 0.95); };
const rt = P.rng(44);
for (let i = 0; i < 24; i++) cypress(CX - 40 - rt() * 60 + (i % 2) * 120, -30 + rt() * 60, 6 + rt() * 4);
add(new THREE.PlaneGeometry(2400, 2400), M.grass, 0, -0.3, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
for (let i = 0; i < 16; i++) { const a = rt() * Math.PI * 2, d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, CX + Math.cos(a) * d, -12, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.5 + rt() * 0.3; }
for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 120 + rt() * 120, r_ = 110 + rt() * 70; const g = new THREE.Group(); g.position.set(CX + Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.3, 7), M.snow, 0, hh * 0.86, 0, g, { cast: false }); }
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- lo que pasa en el decorado con la voz ----------
// etiquetas de precio de las baldas que SUBEN (crecen y se ponen rojas) en «¡Y acaban en tus precios!»
const etiquetas = ESTANTES.flatMap((g) => g.userData.etiquetas);
const rojaM = toon({ color: '#e0442e' });
// la montaña de sacos de dinero delante del BANCO (los 172.000 millones en comisiones): crece con la voz
const sacos = []; { const r = P.rng(77); for (let i = 0; i < 26; i++) { const g = new THREE.Group(); const a = r() * 6.28, d = r() * 1.6;
  g.position.set(CX + 3.5 + Math.cos(a) * d, 0, 4.4 + Math.sin(a) * d * 0.5); world.add(g);
  add(new THREE.SphereGeometry(0.32, 12, 10), toon({ color: '#c9a46a' }), 0, 0.3, 0, g).scale.set(1, 0.9, 1);
  add(new THREE.CylinderGeometry(0.08, 0.14, 0.14, 10), toon({ color: '#a88450' }), 0, 0.6, 0, g);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 14), M.gold, 0, 0.42, 0.31, g).rotation.x = Math.PI / 2;
  g.userData.y = Math.floor(i / 8) * 0.45; g.userData.i = i; sacos.push(g); } }
function worldLight(L, f) { }
function worldState(S, f) {
  const sube = S.precios || 0;
  etiquetas.forEach((m, i) => { const k = Math.max(0, Math.min(1, sube * 1.6 - (i % 7) * 0.08)); m.scale.set(1 + k * 0.8, 1 + k * 0.8, 1); m.material = k > 0.5 ? rojaM : m.userData.m0 || (m.userData.m0 = m.material); });
  const n = Math.round((S.sacos || 0) * sacos.length);
  sacos.forEach((g, i) => { g.visible = i < n; g.position.y = g.userData.y; });
}
// ---------- cards ----------
const CW = 1200, CH = 2000, CM = 2.25; // canvas px, card height in metres (design 600x1000 -> 2.25 m)
const cardGeo = new THREE.PlaneGeometry(CM * 0.6, CM); cardGeo.translate(0, CM / 2 - CM * 0.025, 0);
const blobTex = P.tex(P.radial('20,14,30', 0.6));
class Card {
  constructor(scale = 1) {
    [this.c, this.g] = (() => { const c = document.createElement('canvas'); c.width = CW; c.height = CH; return [c, c.getContext('2d')]; })();
    this.t = new THREE.CanvasTexture(this.c); this.t.colorSpace = THREE.SRGBColorSpace; this.t.anisotropy = 4;
    this.mat = new THREE.MeshBasicMaterial({ map: this.t, transparent: true, alphaTest: 0.02, side: THREE.DoubleSide, fog: true });
    this.mesh = new THREE.Mesh(cardGeo, this.mat); this.mesh.userData.nd = cardNd(this.t); this.mesh.castShadow = true;
    this.mesh.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: this.t, alphaTest: 0.5 });
    this.blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false, fog: true }));
    this.blob.rotation.x = -Math.PI / 2; this.blob.userData.ndSkip = true; this.blob.renderOrder = 1;
    scene.add(this.mesh); scene.add(this.blob); this.key = ''; this.mesh.visible = this.blob.visible = false;
  }
  draw(key, fn) {
    if (key === this.key) return; this.key = key;
    const g = this.g; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, CW, CH); g.setTransform(CW / 600, 0, 0, CH / 1000, 0, 0);
    const p = new T.Pen(g); fn(p); this.t.needsUpdate = true;
  }
}
const cards = []; const getCard = (i) => cards[i] || (cards[i] = new Card());

// ---------- render targets & post ----------
const rtColor = new THREE.WebGLRenderTarget(W, H, { samples: 4, type: THREE.HalfFloatType });
const rtNd = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });
const rtInk = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
const fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1), fsGeo = new THREE.PlaneGeometry(2, 2);
const fs = (mat) => { const s = new THREE.Scene(); s.add(new THREE.Mesh(fsGeo, mat)); return s; };
const inkU = { col: { value: rtColor.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, px: { value: 1.6 }, fogCol: { value: new THREE.Color() },
  sat: { value: 1.08 }, lift: { value: new THREE.Color(0, 0, 0) }, gain: { value: new THREE.Color(1, 1, 1) }, vig: { value: 0.22 }, flash: { value: 0 } };
const inkScene = fs(new THREE.ShaderMaterial({ uniforms: inkU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D col, nd; uniform vec2 res; uniform float px, sat, vig, flash; uniform vec3 fogCol, lift, gain; varying vec2 vUv;
  float edgeAt(vec2 uv, float r){
    vec4 c = texture2D(nd, uv); if (dot(c.rgb,c.rgb) < .01) return 0.; float d = c.a; vec3 n = c.rgb*2.-1.;
    float e = 0.; float rr = r * clamp(7./d, .62, 1.25);
    for (int i=0;i<16;i++){ float a = float(i)*.785398 + (i>7 ? .39 : 0.); float k = i>7 ? .5 : 1.;
      vec2 o = vec2(cos(a), sin(a))*rr*k/res; vec4 s = texture2D(nd, uv+o);
      float ds = s.a; bool card = dot(s.rgb,s.rgb) < .01;
      if (card && ds > 0.) continue;            // character cards: never outlined by the world ink
      if (card) ds = 1e4;                        // sky
      vec3 ns = s.rgb*2.-1.;
      e = max(e, smoothstep(.006, .02, (ds - d)/d));                           // depth jump, near side only
      if (!card && abs(ds-d)/d < .06) e = max(e, smoothstep(.88, .72, dot(n, ns)) * .9); // crease
    }
    return e * (1. - smoothstep(140., 520., d)*.8);
  }
  void main(){
    vec3 c = texture2D(col, vUv).rgb;
    float e = edgeAt(vUv, px);
    c = mix(c, vec3(.012,.01,.014), e);
    if (flash < -0.5) c = vec3(e);
    float l = dot(c, vec3(.299,.587,.114)); c = mix(vec3(l), c, sat);
    c = c*gain + lift;
    vec2 q = vUv-.5; c *= 1. - vig*dot(q*vec2(1.,.75), q*vec2(1.,.75))*2.2;
    c = mix(c, vec3(1.), flash);
    gl_FragColor = vec4(c,1.); }` }));
const dofU = { src: { value: rtInk.texture }, nd: { value: rtNd.texture }, res: { value: new THREE.Vector2(W, H) }, focus: { value: 5 }, cinf: { value: 0 }, near: { value: 1 } };
const dofScene = fs(new THREE.ShaderMaterial({ uniforms: dofU, vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `uniform sampler2D src, nd; uniform vec2 res; uniform float focus, cinf, near; varying vec2 vUv;
  float coc(vec2 uv){ float d = texture2D(nd, uv).a; if (d <= 0.) d = 2000.; float k = 1. - focus/d; return k > 0. ? cinf*k : min(-k*cinf*near, cinf*1.4); }
  void main(){
    float c0 = coc(vUv);
    if (cinf < .5 || c0 < .6) { gl_FragColor = linearToOutputTexel(vec4(texture2D(src, vUv).rgb, 1.)); return; }
    vec3 acc = vec3(0.); float wsum = 0.;
    for (int i=0;i<48;i++){ float fi = float(i); float r = sqrt((fi+.5)/48.); float a = fi*2.39996;
      vec2 o = vec2(cos(a), sin(a))*r*c0/res; float cs = coc(vUv+o);
      float w = smoothstep(r*c0-1.5, r*c0+.5, cs + .5);
      acc += texture2D(src, vUv+o).rgb*w; wsum += w; }
    gl_FragColor = linearToOutputTexel(vec4(acc/max(wsum,1e-3), 1.)); }` }));
// final copy with sRGB handled by the renderer output (we render to screen with linear->sRGB in the shader chunk)
dofScene.children[0].material.toneMapped = false;

// ---------- fotograma: luces por plano, tarjetas (fixedYaw, transparencia, aditivo), tinta y lente ----------
// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  worldLight(L, f); // luces propias del decorado (lámparas, ventanas…): en _world.js
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az)); skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 12, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}
// worldState(S, f) y worldLight(L, f) viven en _world.js (cada decorado anima lo suyo)

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, a.fixedYaw ?? (Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0)), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
    c.mat.blending = a.add ? THREE.AdditiveBlending : THREE.NormalBlending; c.mat.depthWrite = !a.add && (a.alpha ?? 1) > 0.95;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    c.mesh.userData.ndSkip = !!a.noInk;
    if (a.blob !== false && Math.abs(a.y - (a.ground ?? DECK)) < 0.3) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), W_ = worldAt(f), L = lightFor(S, f, W_), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position); for (const c of clouds) c.quaternion.copy(camera.quaternion);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
