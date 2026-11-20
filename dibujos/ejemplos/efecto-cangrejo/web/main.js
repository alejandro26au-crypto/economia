import * as THREE from './lib/three.module.js';
import * as T from './toon.js';
import * as P from './paint.js';
import { SHOTS, TOTAL, shotAt, camAt, dofAt, LIGHTS, lightFor, actorsAt, worldAt, fxAt } from './story.js';

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
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  rot: texM(P.rotten(4), 1, 1), rotB: texM(P.rotten(14), 1, 1),
  stone: texM(P.stone(4), 1, 1), stoneMoss: texM(P.mossy(P.stone(4), 5, 1.2), 1, 1),
  grass: texM(P.grass(6), 40, 40), dirt: texM(P.dirt(7), 6, 30), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#5c5a57' }), bronze: toon({ color: '#b08a4a' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }),
  window: toon({ color: '#2b2430' }), red: toon({ color: '#b8282b' }),
};
M.banner = new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(P.banner()), alphaTest: 0.5, side: THREE.DoubleSide });
// helmet
const helmetIn = P.tex(P.helmetInside()); helmetIn.wrapS = helmetIn.wrapT = THREE.ClampToEdgeWrapping;
M.helmIn = new THREE.MeshToonMaterial({ gradientMap: grad, map: helmetIn, side: THREE.BackSide });
M.helmOut = toon({ color: '#8f8a7e' });

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

// ---------- world: AULA DEL PROFESOR DE ECONOMÍA ----------
const DECK = 0; // suelo
const world = new THREE.Group(); scene.add(world);
const waterU = { t: { value: 0 }, deep: { value: new THREE.Color() }, shal: { value: new THREE.Color() }, glint: { value: new THREE.Color() } };
const clouds = [];
const helmet = new THREE.Group(); scene.add(helmet); helmet.visible = false;
const RW = 7, RB = -3.0, RF = 6, RH = 3.6; // medio ancho, pared del fondo (z), frente, alto
// suelo de tablones
const suelo = add(tbox(RW * 2, 0.2, RF - RB, 1.1), M.plank, 0, -0.1, (RF + RB) / 2, world, { cast: false });
// paredes de yeso con zócalo de madera
const yeso = texM(P.plaster(8, 40), 1, 1, '#ffe6bf');
add(tbox(RW * 2, RH, 0.2, 2.2), yeso, 0, RH / 2, RB - 0.1, world, { cast: false });
for (const sx of [-1, 1]) add(tbox(0.2, RH, RF - RB, 2.2), yeso, sx * (RW + 0.1), RH / 2, (RF + RB) / 2, world, { cast: false });
add(tbox(RW * 2, 0.9, 0.06, 1.2), M.beam, 0, 0.45, RB + 0.03, world, { cast: false });
add(tbox(RW * 2, 0.08, 0.1, 1), M.beamDark, 0, 0.92, RB + 0.05, world, { cast: false });
for (const sx of [-1, 1]) add(tbox(0.06, 0.9, RF - RB, 1.2), M.beam, sx * (RW - 0.03), 0.45, (RF + RB) / 2, world, { cast: false });
add(tbox(RW * 2 + 0.4, 0.2, RF - RB, 2), toon({ color: '#efe3cc' }), 0, RH + 0.1, (RF + RB) / 2, world, { cast: false });
// vigas del techo
for (let z = RB + 0.6; z < RF; z += 1.8) add(tbox(RW * 2, 0.22, 0.26, 2), M.beam, 0, RH - 0.11, z, world);
// LA PIZARRA (textura que se redibuja con cada frase)
const PZ = { x: 0.35, y: 1.9, w: 2.2, h: 1.9 };
const pizC = document.createElement('canvas'); pizC.width = 1320; pizC.height = 1140;
const pizT = new THREE.CanvasTexture(pizC); pizT.colorSpace = THREE.SRGBColorSpace; pizT.anisotropy = 4;
const pizM = new THREE.MeshToonMaterial({ gradientMap: grad, map: pizT, emissive: new THREE.Color('#ffffff'), emissiveMap: pizT, emissiveIntensity: 0.18 });
const piz = add(new THREE.PlaneGeometry(PZ.w, PZ.h), pizM, PZ.x, PZ.y, RB + 0.06, world, { cast: false });
// marco de madera y repisa de tizas
for (const [w, h, x, y] of [[PZ.w + 0.24, 0.12, 0, PZ.h / 2 + 0.06], [PZ.w + 0.24, 0.12, 0, -PZ.h / 2 - 0.06], [0.12, PZ.h, -PZ.w / 2 - 0.06, 0], [0.12, PZ.h, PZ.w / 2 + 0.06, 0]])
  add(tbox(w, h, 0.08, 1), M.beam, PZ.x + x, PZ.y + y, RB + 0.07, world);
add(tbox(PZ.w + 0.1, 0.05, 0.16, 1), M.beam, PZ.x, PZ.y - PZ.h / 2 - 0.14, RB + 0.14, world);
for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 6), toon({ color: ['#ffffff', '#f4e27a', '#f2a0a0'][i] }), PZ.x - 0.8 + i * 0.16, PZ.y - PZ.h / 2 - 0.1, RB + 0.15, world).rotation.z = Math.PI / 2;
const borrador = add(tbox(0.18, 0.05, 0.07, 1), M.wood, PZ.x + 0.8, PZ.y - PZ.h / 2 - 0.09, RB + 0.15, world);
// reloj de pared
const reloj = new THREE.Group(); reloj.position.set(-2.4, 2.95, RB + 0.04); world.add(reloj);
add(new THREE.CylinderGeometry(0.26, 0.26, 0.06, 28), M.wood, 0, 0, 0.03, reloj).rotation.x = Math.PI / 2;
add(new THREE.CylinderGeometry(0.22, 0.22, 0.065, 28), toon({ color: '#f6efe0' }), 0, 0, 0.04, reloj).rotation.x = Math.PI / 2;
const aguja1 = add(box(0.018, 0.16, 0.01), toon({ color: '#241726' }), 0, 0.07, 0.08, reloj, { cast: false });
const aguja2 = add(box(0.014, 0.12, 0.01), toon({ color: '#241726' }), 0, 0.05, 0.085, reloj, { cast: false });
// ventana en la pared izquierda (luz de la tarde) y estantería en la derecha
const vent = new THREE.Group(); vent.position.set(-RW + 0.02, 1.9, 0.6); vent.rotation.y = Math.PI / 2; world.add(vent);
add(box(2.2, 1.6, 0.04), toon({ color: '#cfe6f6', emissive: new THREE.Color('#bfe0ff'), emissiveIntensity: 0.8 }), 0, 0, 0.02, vent, { cast: false });
for (const [w, h, x, y] of [[2.36, 0.1, 0, 0.84], [2.36, 0.1, 0, -0.84], [0.1, 1.7, -1.13, 0], [0.1, 1.7, 1.13, 0], [0.06, 1.6, 0, 0], [2.2, 0.06, 0, 0]]) add(tbox(w, h, 0.1, 1), M.wood, x, y, 0.06, vent);
const libros = ['#b8322f', '#2f5f8a', '#d9a441', '#3f6b36', '#7b5ac9', '#8a5d3b', '#c25a7a', '#34425c'];
const est = new THREE.Group(); est.position.set(RW - 0.3, 0, -1.4); est.rotation.y = -Math.PI / 2; world.add(est);
add(tbox(1.8, 2.4, 0.4, 1.2), M.beamDark, 0, 1.2, 0, est);
{ const r = P.rng(5); for (let fila = 0; fila < 4; fila++) { add(tbox(1.7, 0.04, 0.38, 1), M.beam, 0, 0.35 + fila * 0.55, 0.02, est); let x = -0.78; while (x < 0.75) { const w = 0.06 + r() * 0.05, h = 0.3 + r() * 0.14; add(box(w, h, 0.26), toon({ color: libros[(r() * 8) | 0] }), x + w / 2, 0.37 + fila * 0.55 + h / 2, 0.06, est); x += w + 0.01; } } }
// mesa del profesor con libros, taza, manzana y una lámpara
const mesa = new THREE.Group(); mesa.position.set(2.15, 0, -0.9); mesa.rotation.y = -0.35; world.add(mesa);
add(tbox(1.6, 0.08, 0.8, 1), M.beam, 0, 0.78, 0, mesa);
for (const [x, z] of [[-0.72, -0.34], [0.72, -0.34], [-0.72, 0.34], [0.72, 0.34]]) add(tbox(0.08, 0.76, 0.08, 1), M.beamDark, x, 0.38, z, mesa);
add(tbox(1.5, 0.5, 0.04, 1), M.beam, 0, 0.5, 0.36, mesa);
for (let i = 0; i < 3; i++) add(box(0.34 - i * 0.03, 0.06, 0.24), toon({ color: libros[i * 2] }), -0.45, 0.85 + i * 0.06, -0.05, mesa).rotation.y = i * 0.2;
add(new THREE.CylinderGeometry(0.05, 0.045, 0.11, 14), toon({ color: '#f4f1ea' }), 0.15, 0.875, 0.1, mesa);
add(new THREE.SphereGeometry(0.06, 14, 10), toon({ color: '#c8302a' }), 0.42, 0.88, -0.1, mesa);
const globo = add(new THREE.SphereGeometry(0.16, 20, 14), toon({ color: '#4a8ac2' }), 0.55, 1.05, 0.15, mesa);
add(new THREE.CylinderGeometry(0.05, 0.08, 0.1, 10), M.bronze, 0.55, 0.87, 0.15, mesa);
// cortinas rojas a los lados de la ventana, un mapa del mundo y un gráfico enmarcado (color, como los romanos)
for (const dz of [-1.35, 1.35]) { const c = add(tbox(0.08, 2.3, 0.45, 1), toon({ color: '#b8282b' }), -RW + 0.12, 1.95, 0.6 + dz, world); c.castShadow = false; }
add(tbox(0.1, 0.1, 3.4, 1), M.bronze, -RW + 0.15, 3.1, 0.6, world);
{ const mc = document.createElement('canvas'); mc.width = 512; mc.height = 320; const g = mc.getContext('2d');
  g.fillStyle = '#9cc8e6'; g.fillRect(0, 0, 512, 320); g.fillStyle = '#e8c87a';
  for (const [x, y, w, h] of [[60, 60, 120, 90], [90, 160, 60, 110], [230, 50, 70, 60], [240, 120, 70, 120], [320, 50, 140, 90], [400, 210, 70, 50]]) { g.beginPath(); g.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0.3, 0, 7); g.fill(); }
  g.strokeStyle = '#5a3a24'; g.lineWidth = 14; g.strokeRect(0, 0, 512, 320);
  const mapa = add(new THREE.PlaneGeometry(1.5, 0.95), toon({ map: P.tex(mc) }), -3.9, 2.15, RB + 0.05, world, { cast: false }); }
{ const gc = document.createElement('canvas'); gc.width = 256; gc.height = 320; const g = gc.getContext('2d');
  g.fillStyle = '#f6efe0'; g.fillRect(0, 0, 256, 320); g.strokeStyle = '#2f5f8a'; g.lineWidth = 10; g.beginPath(); g.moveTo(30, 260); g.lineTo(90, 200); g.lineTo(140, 220); g.lineTo(220, 70); g.stroke();
  g.fillStyle = '#3f8a4a'; for (let i = 0; i < 4; i++) g.fillRect(40 + i * 50, 290 - (i + 1) * 30, 30, (i + 1) * 30); g.strokeStyle = '#d9a845'; g.lineWidth = 16; g.strokeRect(0, 0, 256, 320);
  add(new THREE.PlaneGeometry(0.62, 0.78), toon({ map: P.tex(gc) }), 2.75, 2.1, RB + 0.05, world, { cast: false }); }
// alfombra verde bajo el profesor
add(new THREE.PlaneGeometry(3.2, 2.0), toon({ color: '#3f6b4a' }), -0.4, 0.012, -1.3, world, { cast: false }).rotation.x = -Math.PI / 2;
// planta en una maceta, papelera y un gráfico enmarcado en la pared
const planta = new THREE.Group(); planta.position.set(-RW + 0.6, 0, -2.4); world.add(planta);
add(new THREE.CylinderGeometry(0.22, 0.16, 0.4, 12), toon({ color: '#b5653f' }), 0, 0.2, 0, planta);
for (let i = 0; i < 6; i++) add(new THREE.SphereGeometry(0.22, 10, 8), toon({ color: i % 2 ? '#3f6b36' : '#5c8a3c' }), Math.cos(i) * 0.15, 0.6 + (i % 3) * 0.2, Math.sin(i * 2) * 0.15, planta);
// pupitres de los alumnos (delante, por si la cámara mira desde atrás)
for (const [x, z] of [[-3.6, 3.2], [-1.2, 3.6], [3.4, 3.0]]) { const pd = new THREE.Group(); pd.position.set(x, 0, z); world.add(pd); add(tbox(1.0, 0.06, 0.6, 1), M.beam, 0, 0.72, 0, pd); for (const [a, b] of [[-0.44, -0.24], [0.44, -0.24], [-0.44, 0.24], [0.44, 0.24]]) add(tbox(0.05, 0.7, 0.05, 1), M.beamDark, a, 0.35, b, pd); }

// ----- dibujos de tiza en la pizarra -----
const TIZA = 'rgba(244,244,236,0.95)';
function pizarraFondo(g) {
  g.setTransform(1, 0, 0, 1, 0, 0); g.fillStyle = '#2d4a3a'; g.fillRect(0, 0, 1320, 1140);
  const r = P.rng(3); for (let i = 0; i < 80; i++) { g.fillStyle = `rgba(255,255,255,${0.02 + r() * 0.04})`; g.beginPath(); g.ellipse(r() * 1320, r() * 1140, 40 + r() * 140, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
}
/** traza una línea de tiza que aparece de 0 a 1 (k) */
function trazo(g, pts, k, ancho = 7, col = TIZA) {
  if (k <= 0) return; ancho *= 1.9; let L = 0; const seg = [];
  for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
  let resto = L * Math.min(1, k); g.strokeStyle = col; g.lineWidth = ancho; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length && resto > 0; i++) { const t = Math.min(1, resto / seg[i - 1]); g.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t); resto -= seg[i - 1]; }
  g.stroke();
}
const circ = (cx, cy, r, a0 = 0, a1 = Math.PI * 2, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
/** texto de tiza que se escribe de izquierda a derecha */
function escribe(g, txt, x, y, tam, k, col = TIZA) {
  if (k <= 0) return; tam *= 1.25; g.save(); g.font = `bold ${tam}px "DejaVu Sans", Arial`; g.textBaseline = 'middle';
  const w = g.measureText(txt).width; g.beginPath(); g.rect(x - 4, y - tam, (w + 8) * Math.min(1, k), tam * 2); g.clip();
  g.fillStyle = col; g.fillText(txt, x, y); g.restore();
}
function monigote(g, x, y, k, cara = 0, s = 1) { // cara: 0 neutro, 1 feliz, -1 enfadado
  trazo(g, circ(x, y - 70 * s, 18 * s), k * 3);
  trazo(g, [[x, y - 52 * s], [x, y]], k * 3 - 1); trazo(g, [[x - 22 * s, y - 34 * s], [x, y - 42 * s], [x + 22 * s, y - 34 * s]], k * 3 - 1.3);
  trazo(g, [[x - 16 * s, y + 40 * s], [x, y], [x + 16 * s, y + 40 * s]], k * 3 - 1.6);
  if (k > 0.8) { g.fillStyle = TIZA; g.fillRect(x - 8 * s, y - 75 * s, 4 * s, 4 * s); g.fillRect(x + 4 * s, y - 75 * s, 4 * s, 4 * s);
    trazo(g, cara > 0 ? circ(x, y - 66 * s, 8 * s, 0.3, Math.PI - 0.3, 10) : cara < 0 ? circ(x, y - 58 * s, 8 * s, Math.PI + 0.4, Math.PI * 2 - 0.4, 10) : [[x - 6 * s, y - 62 * s], [x + 6 * s, y - 62 * s]], 1, 3 * s); }
}
function cangrejo(g, x, y, s, k, col = TIZA) {
  trazo(g, circ(x, y, 26 * s, 0, Math.PI * 2, 30), k * 2, 6 * s, col);
  for (const sd of [-1, 1]) {
    trazo(g, [[x + sd * 20 * s, y - 14 * s], [x + sd * 34 * s, y - 34 * s]], k * 2 - 0.6, 5 * s, col);
    trazo(g, circ(x + sd * 40 * s, y - 42 * s, 10 * s, sd > 0 ? -2.2 : -0.9, sd > 0 ? 2.6 : 4.0, 12), k * 2 - 0.8, 5 * s, col);
    for (let i = 0; i < 3; i++) trazo(g, [[x + sd * 24 * s, y + (-2 + i * 8) * s], [x + sd * 42 * s, y + (6 + i * 12) * s]], k * 2 - 1, 4 * s, col);
  }
  if (k > 0.7) { g.fillStyle = col; g.fillRect(x - 10 * s, y - 34 * s, 5 * s, 9 * s); g.fillRect(x + 5 * s, y - 34 * s, 5 * s, 9 * s); }
}
let pizKey = '';
function dibujaPizarra(B) {
  const key = JSON.stringify(B); if (key === pizKey) return; pizKey = key;
  const g = pizC.getContext('2d'); pizarraFondo(g); g.translate(0, 200);
  const q = B.k ?? 1, K = (a, b) => Math.max(0, Math.min(1, (q - a) / (b - a)));
  switch (B.tema) {
    case 'camino': { // el camino a la riqueza: un sendero que sube hasta una bolsa de dinero; los amigos se quedan atrás
      trazo(g, [[90, 640], [400, 600], [620, 470], [860, 360], [1080, 200]], K(0, 0.5), 9);
      trazo(g, [[150, 690], [430, 650], [660, 520], [900, 410], [1120, 250]], K(0, 0.5), 9);
      trazo(g, circ(1150, 150, 62), K(0.4, 0.7), 9); escribe(g, '$', 1126, 152, 78, K(0.55, 0.75));
      monigote(g, 980, 300, K(0.5, 0.75), 1, 1.6);
      monigote(g, 260, 600, K(0.6, 0.85), -1, 0.9); monigote(g, 380, 580, K(0.65, 0.9), -1, 0.9);
      if (q > 0.8) { trazo(g, [[110, 620], [480, 900]], K(0.85, 1), 8, 'rgba(242,130,130,0.95)'); trazo(g, [[480, 620], [110, 900]], K(0.88, 1), 8, 'rgba(242,130,130,0.95)'); }
      escribe(g, 'RIQUEZA', 70, -80, 110, K(0.2, 0.5));
      break;
    }
    case 'efecto': { escribe(g, 'EFECTO', 90, 60, 130, K(0, 0.35)); escribe(g, 'CANGREJO', 70, 260, 150, K(0.25, 0.65), 'rgba(250,226,120,0.98)');
      trazo(g, [[80, 380], [1240, 380]], K(0.6, 0.8), 8); cangrejo(g, 660, 690, 3.6, K(0.55, 1), 'rgba(242,150,120,0.98)'); break; }
    case 'balde': { // 10 cangrejos en un balde; uno sube y los demás lo jalan
      const bx = 660, by = 430; trazo(g, [[bx - 260, by - 210], [bx - 200, by + 260], [bx + 200, by + 260], [bx + 260, by - 210]], K(0, 0.25), 10);
      trazo(g, circ(bx, by - 210, 260, Math.PI, Math.PI * 2, 30).map(([x, y]) => [x, by - 210 + (y - (by - 210)) * 0.14]), K(0.05, 0.25), 8);
      escribe(g, '10', 70, -90, 120, K(0.1, 0.25), 'rgba(250,226,120,0.98)');
      const n = Math.round(K(0.15, 0.4) * 9);
      for (let i = 0; i < n; i++) cangrejo(g, bx - 150 + (i % 3) * 150 + (Math.floor(i / 3) % 2) * 50, by + 180 - Math.floor(i / 3) * 75, 0.95, 1);
      // el que escapa: sube por el borde (B.sube 0..1) y lo bajan (B.baja 0..1)
      const s1 = B.sube ?? 0, s2 = B.baja ?? 0, y = by + 120 - 360 * s1 + 380 * s2;
      if (q > 0.35) cangrejo(g, bx + 225 - 40 * s1, y, 1.1, 1, 'rgba(250,226,120,0.98)');
      if (s2 > 0) for (const dx of [-60, 0]) trazo(g, [[bx + 140 + dx, by + 150], [bx + 190 + dx * 0.5, y + 30]], Math.min(1, s2 * 3), 6, 'rgba(242,130,130,0.95)');
      if (s1 > 0.2 && s2 < 0.1) trazo(g, [[bx + 330, by + 40], [bx + 330, by - 180], [bx + 300, by - 140], [bx + 330, by - 180], [bx + 360, by - 140]], Math.min(1, (s1 - 0.2) * 3), 7);
      if (s2 > 0.3) trazo(g, [[bx + 330, by - 180], [bx + 330, by + 40], [bx + 300, by], [bx + 330, by + 40], [bx + 360, by]], Math.min(1, (s2 - 0.3) * 3), 7, 'rgba(242,130,130,0.95)');
      break; }
    case 'circulo': { // tu círculo: monigotes enfadados en corro; tú subes con una flecha
      trazo(g, circ(560, 430, 300), K(0, 0.25), 7);
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + i * Math.PI / 3 + 0.5; monigote(g, 560 + Math.cos(a) * 390, 470 + Math.sin(a) * 300, K(0.1 + i * 0.04, 0.4 + i * 0.04), -1, 1.25); }
      const sube = K(0.45, 0.8); monigote(g, 560, 520 - sube * 300, K(0.3, 0.5), 1, 1.5);
      trazo(g, [[760, 560], [760, 160], [720, 210], [760, 160], [800, 210]], sube, 8, 'rgba(250,226,120,0.98)');
      escribe(g, 'ÉXITO', 820, 120, 90, K(0.55, 0.75), 'rgba(250,226,120,0.98)');
      escribe(g, 'MEDIOCRIDAD', 170, 860, 92, K(0.8, 1), 'rgba(242,130,130,0.95)'); if (q > 0.95) trazo(g, [[160, 925], [1160, 925]], 1, 6, 'rgba(242,130,130,0.95)');
      break; }
    case 'barco': { // el barco y el lastre: la cadena se corta y el barco sube
      const corta = B.corta ?? 0, sube = corta > 0.5 ? (corta - 0.5) * 2 : 0, y0 = 300 - sube * 90;
      trazo(g, [[60, 380], [1260, 380]], K(0, 0.2), 6, 'rgba(160,210,255,0.95)');
      trazo(g, [[380, y0], [460, y0 + 110], [820, y0 + 110], [900, y0], [380, y0]], K(0.05, 0.3), 9);
      trazo(g, [[640, y0], [640, y0 - 200], [800, y0 - 30], [640, y0 - 30]], K(0.15, 0.35), 8);
      const fin = corta > 0.4 ? 0.45 : 1; // cadena
      for (let i = 0; i < 7; i++) if (i / 7 < fin) trazo(g, circ(560, y0 + 140 + i * 50 + (corta > 0.4 ? sube * 120 : 0), 16, 0, Math.PI * 2, 12), K(0.25, 0.45), 6);
      const ay = corta > 0.4 ? 690 + sube * 60 : 690; trazo(g, [[520, ay - 40], [600, ay - 40], [560, ay - 40], [560, ay + 40], [500, ay + 10], [560, ay + 40], [620, ay + 10]], K(0.3, 0.5), 9, 'rgba(242,130,130,0.95)');
      escribe(g, 'LASTRE', 660, 640, 70, K(0.35, 0.55), 'rgba(242,130,130,0.95)');
      if (corta > 0) { const sx = 520, sy = y0 + 300; trazo(g, [[sx - 70, sy - 40], [sx + 70, sy + 40]], Math.min(1, corta * 3), 9, 'rgba(250,226,120,0.98)'); trazo(g, [[sx - 70, sy + 40], [sx + 70, sy - 40]], Math.min(1, corta * 3), 9, 'rgba(250,226,120,0.98)'); trazo(g, circ(sx - 90, sy - 52, 20), Math.min(1, corta * 3), 7, 'rgba(250,226,120,0.98)'); trazo(g, circ(sx - 90, sy + 52, 20), Math.min(1, corta * 3), 7, 'rgba(250,226,120,0.98)'); }
      break; }
    case 'sigueme': {
      escribe(g, 'SÍGUEME', 150, 200, 140, K(0, 0.5), 'rgba(250,226,120,0.98)');
      // logo de YouTube dibujado con tiza (sutil, del mismo estilo que la pizarra): rectángulo redondeado rojo y triángulo blanco
      const lx = 660, ly = 560, lw = 300, lh = 210, rr = 60, kl = K(0.45, 0.85);
      const rect = [[lx - lw / 2 + rr, ly - lh / 2], [lx + lw / 2 - rr, ly - lh / 2], ...circ(lx + lw / 2 - rr, ly - lh / 2 + rr, rr, -Math.PI / 2, 0, 8), [lx + lw / 2, ly + lh / 2 - rr], ...circ(lx + lw / 2 - rr, ly + lh / 2 - rr, rr, 0, Math.PI / 2, 8), [lx - lw / 2 + rr, ly + lh / 2], ...circ(lx - lw / 2 + rr, ly + lh / 2 - rr, rr, Math.PI / 2, Math.PI, 8), [lx - lw / 2, ly - lh / 2 + rr], ...circ(lx - lw / 2 + rr, ly - lh / 2 + rr, rr, Math.PI, Math.PI * 1.5, 8)];
      if (kl > 0.6) { g.save(); g.globalAlpha = Math.min(1, (kl - 0.6) * 2.5) * 0.55; g.fillStyle = 'rgba(232,80,80,1)'; g.beginPath(); rect.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill(); g.restore(); }
      trazo(g, rect, kl, 8, 'rgba(240,96,96,0.97)');
      trazo(g, [[lx - 40, ly - 55], [lx + 62, ly], [lx - 40, ly + 55], [lx - 40, ly - 55]], K(0.7, 1), 8);
      break; }
  }
  pizT.needsUpdate = true;
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

// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set(L.sunDisc || '#000'); skyU.sunSize.value = L.sunSize || 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  waterU.deep.value.set(L.waterDeep); waterU.shal.value.set(L.waterShal); waterU.glint.value.set(L.glint);
}
function placeSun(L, focus) {
  // sun direction from azimuth/elevation in world space
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  skyU.sunDir.value.copy(tmpV);
  sun.position.copy(focus).addScaledVector(tmpV, 80); sun.target.position.copy(focus);
  const ext = L.shadowExt || 30, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 200; sc.updateProjectionMatrix();
}

function worldState(S, f) {
  dibujaPizarra(S.pizarra);
  aguja1.parent.rotation.z = 0; aguja2.position.set(0, 0.05, 0.085);
  aguja1.rotation.z = -f * 0.002; aguja2.rotation.z = -f * 0.02;
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    if (a.blob !== false && a.y < DECK + 0.5) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const helmetState = (h) => {
  helmet.visible = !!h; if (!h) return;
  helmet.position.set(h.x, h.y, h.z); helmet.rotation.set(h.rx || 0, h.ry || 0, h.rz || 0); helmet.scale.setScalar(h.s || 0.17);
};

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
  const S = shotAt(f), L = lightFor(S, f), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  const W_ = worldAt(f); worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  helmetState(W_.helmet);
  sky.position.copy(camera.position);
  for (const c of clouds) c.quaternion.copy(camera.quaternion);
  // pass A: colour
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  // pass B: normal + depth
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  if (window.DEBUG_ND) { const dm = new THREE.MeshBasicMaterial({ map: rtNd.texture }); const ds = fs(dm); renderer.setRenderTarget(null); renderer.render(ds, fsCam); return true; }
  // ink + grade
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = window.DEBUG_E ? -1 : (C.flash || 0); inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  // lens
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
