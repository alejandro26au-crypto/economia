// Plan de planos: «El efecto cangrejo» (profesor de economía adinerado que habla a cámara; la pizarra dibuja
// lo que dice). TIEMPOS ESTIMADOS (sin voz todavía): se reajustan con timing.py cuando llegue la voz.
// Frases (fotogramas a 30 fps): F1 0-102 «En el camino a la riqueza…» | F2 108-186 «A esto se le llama…» |
// F3 195-414 «Si metes 10 cangrejos…» | F4 423-558 «Tu círculo actual…» | F5 567-666 «Corta el lastre…» | F6 675-702 «Y sígueme.»
export const FPS = 30, TOTAL = 721, DECK = 0;
// TIEMPOS REALES de la voz (voice.mp3, 24.03 s, faster-whisper en español + emparejado con el guion)
export const FRASES = [[0, 90], [109, 181], [200, 399], [417, 572], [589, 680], [698, 712]];
export const SHOTS = [
  { id: 'gancho', a: 0, b: 105, light: 'aula' },
  { id: 'efecto', a: 106, b: 195, light: 'aula' },
  { id: 'balde', a: 196, b: 365, light: 'aula' },
  { id: 'reaccion', a: 366, b: 414, light: 'aula' },
  { id: 'circulo', a: 415, b: 584, light: 'aula' },
  { id: 'barco', a: 585, b: 692, light: 'aula' },
  { id: 'sigueme', a: 693, b: 720, light: 'aula' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const smooth = (t) => { t = clamp(t); return t * t * t * (t * (t * 6 - 15) + 10); };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => a.map((v, i) => lerp(v, b[i], t));
const ramp = (f, a, b) => clamp((f - a) / (b - a));
const q = (x, n = 2) => Math.round(x * 10 ** n) / 10 ** n;

// ---------- luz: aula a media tarde, sol cálido por la ventana de la izquierda ----------
export const LIGHTS = {
  // la MISMA luz de día que el ejemplo de los romanos (story.js del kit, LIGHTS.day), con el sol entrando por la ventana
  aula: { az: 200, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 40, fogFar: 120,
    skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, waterDeep: '#000', waterShal: '#000', glint: '#fff', vig: 0.2, shadowExt: 8 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- cámaras (el profesor en P; los ojos a 1.45 m) ----------
const P = [-0.9, 0, -1.5], OJOS = [-0.9, 1.45, -1.5];
const PIZ = [0.35, 1.9, -2.94];
const CAMS = {
  gancho: [ // primer plano de frente y se abre a la pizarra
    { f: 0, pos: [-0.78, 1.5, 0.35], look: OJOS, fov: 36 },
    { f: 40, pos: [-0.8, 1.5, 0.15], look: OJOS, fov: 35 },
    { f: 82, pos: [-0.05, 1.75, 3.1], look: [-0.05, 1.7, -2.9], fov: 40 },
    { f: 105, pos: [-0.05, 1.75, 2.9], look: [-0.05, 1.7, -2.9], fov: 39 },
  ],
  efecto: [ // desde la derecha, el profesor señala la pizarra
    { f: 106, pos: [-0.05, 1.65, 3.9], look: [-0.04, 1.62, -2.9], fov: 45, roll: 0 },
    { f: 195, pos: [-0.1, 1.65, 3.6], look: [-0.04, 1.62, -2.9], fov: 44 },
  ],
  balde: [ // la pizarra de cerca
    { f: 196, pos: [0.36, 1.9, 2.75], look: [0.35, 1.9, -2.94], fov: 38 },
    { f: 365, pos: [0.36, 1.9, 2.3], look: [0.35, 1.9, -2.94], fov: 37 },
  ],
  reaccion: [ // contrapicado desde la izquierda: el profesor serio, la pizarra detrás
    { f: 366, pos: [-2.4, 1.05, -0.1], look: [-0.7, 1.55, -1.7], fov: 38, roll: -3 },
    { f: 414, pos: [-2.2, 1.1, -0.2], look: [-0.7, 1.55, -1.7], fov: 36, roll: -2 },
  ],
  circulo: [ // plano abierto en arco
    { f: 415, pos: [-0.6, 1.45, 3.9], look: [0.08, 1.62, -2.9], fov: 41 },
    { f: 584, pos: [0.1, 1.55, 3.6], look: [0.08, 1.62, -2.9], fov: 40 },
  ],
  barco: [ // de la pizarra al profesor
    { f: 585, pos: [0.36, 1.9, 2.75], look: [0.35, 1.9, -2.94], fov: 38 },
    { f: 645, pos: [0.36, 1.9, 2.5], look: [0.35, 1.9, -2.94], fov: 37 },
    { f: 675, pos: [-0.1, 1.6, 2.6], look: [-0.25, 1.62, -2.6], fov: 40 },
    { f: 692, pos: [-0.12, 1.6, 2.4], look: [-0.25, 1.62, -2.6], fov: 39 },
  ],
  sigueme: [ // primer plano final de frente
    { f: 693, pos: [-0.15, 1.62, 3.8], look: [-0.04, 1.62, -2.9], fov: 45 },
    { f: 720, pos: [-0.15, 1.62, 3.5], look: [-0.04, 1.62, -2.9], fov: 44 },
  ],
};
export const camAt = (f) => {
  const S = shotAt(f), K = CAMS[S.id];
  let i = 0; while (i < K.length - 1 && f > K[i + 1].f) i++;
  const a = K[i], b = K[Math.min(i + 1, K.length - 1)];
  const t = b.f > a.f ? smooth((f - a.f) / (b.f - a.f)) : 0;
  const c = { pos: lerp3(a.pos, b.pos, t), look: lerp3(a.look, b.look, t), fov: lerp(a.fov, b.fov, t), roll: lerp(a.roll || 0, b.roll || 0, t) };
  // ligero balanceo de cámara en mano: nada queda quieto
  c.pos = [c.pos[0] + Math.sin(f * 0.031) * 0.012, c.pos[1] + Math.sin(f * 0.043) * 0.008, c.pos[2]];
  c.flash = 0;
  c.shadowAt = [-0.4, 1, -1.8];
  return c;
};

// ---------- lente ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  switch (S.id) {
    case 'gancho': return f < 45 ? { focus: dist(C.pos, OJOS), cinf: 11 } : { focus: dist(C.pos, PIZ), cinf: lerp(11, 0, smooth(ramp(f, 45, 75))) };
    case 'reaccion': return { focus: dist(C.pos, OJOS), cinf: 9 };
    case 'barco': return f > 660 ? { focus: dist(C.pos, OJOS), cinf: 4 } : { focus: dist(C.pos, PIZ), cinf: 0 };
  }
  return { focus: 10, cinf: 0 };
};

// ---------- la pizarra: qué dibuja en cada frase ----------
export const worldAt = (f) => {
  const fr = (i, a = 0.15, b = 0.85) => { const [x, y] = FRASES[i]; return q(clamp((f - x) / ((y - x) * b) - a / b + a), 2); };
  let pizarra = { tema: 'camino', k: q(clamp((f - 8) / 80), 2) }; // «riqueza» 25, «amigos» 78: los amigos se tachan
  if (f >= 106) pizarra = { tema: 'efecto', k: q(ramp(f, 112, 182), 2) }; // «efecto cangrejo» 150-181
  if (f >= 196) pizarra = { tema: 'balde', k: q(ramp(f, 200, 262), 2), sube: q(smooth(ramp(f, 262, 304)), 2), baja: q(smooth(ramp(f, 334, 362)), 2) }; // «escapar» 290, «jalarán… abajo» 334-362
  if (f >= 415) pizarra = { tema: 'circulo', k: q(ramp(f, 418, 572), 2) }; // «éxito» 512, «mediocridad» 551
  if (f >= 585) pizarra = { tema: 'barco', k: q(ramp(f, 586, 605), 2), corta: q(smooth(ramp(f, 600, 640)), 2) }; // «Corta» 589, «lastre» 605
  if (f >= 693) pizarra = { tema: 'sigueme', k: q(ramp(f, 698, 716), 2) }; // «sígueme» 701-712 + logo de YouTube en tiza
  return { pizarra };
};

// ---------- el profesor: GESTOS DEL KIT (como el vídeo de los romanos, motion.js) ----------
// No mueve la boca al ritmo de la voz: REACCIONA con caras claras que cambian en momentos clave, respira y se mece
// siempre (idle), y hace acciones de cuerpo con impulso (anticipación → sobrepaso → asiento con rebote).
import { M, idle, blinkAt } from './motion.js';
import { BOCA } from './boca.js';
import { brazosEn } from './gestos.js';
// brazos tranquilos: solo en los momentos clave (la transición tiene impulso y asiento)
const CLAVES = [
  { f: 0, L: 'hang', R: 'hang' }, { f: 149, L: 'hip', R: 'point' },            // señala la pizarra en «efecto cangrejo»
  { f: 366, L: 'cross', R: 'cheek' },                                            // «para que muera con ellos»: pensativo
  { f: 417, L: 'hip', R: 'point' },                                              // vuelve a la pizarra: el círculo
  { f: 589, L: 'hang', R: 'point' }, { f: 698, L: 'hip', R: 'thumb' },          // «Corta…» / «sígueme»
];
// caras del kit, fijas, que cambian en la palabra justa
const CARAS = [[0, 'stern'], [41, 'stubborn'], [109, 'neutral'], [161, 'grin'], [200, 'neutral'], [290, 'nervous'], [334, 'stern'], [366, 'stubborn'],
  [417, 'stern'], [512, 'grin'], [551, 'laugh'], [585, 'stern'], [669, 'grin']];
const caraEn = (f) => { let c = 'neutral'; for (const [fk, k] of CARAS) if (f >= fk) c = k; return c; };
// asiente en las palabras fuertes (anticipación + rebote con spring)
const ASIENTE = [78, 161, 213, 353, 375, 512, 589, 669, 701];
const asiente = (f) => { let h = 0; for (const g of ASIENTE) { const t = (f - (g - 3)) / 30; if (t >= 0 && t < 0.6) h += -6 * (1 - M.spring(t, 2.2, 6)) * Math.sign(Math.sin(t * Math.PI * 2.2) + 1e-6) * (t < 0.08 ? -0.4 : 1); } return h; };
// acciones de cuerpo como los romanos
const niega = (f) => (f >= 41 && f <= 70 ? 7 * Math.sin(((f - 41) / 29) * Math.PI * 3) * (1 - (f - 41) / 40) : 0);       // «no puedes»: niega con la cabeza
const piso = (f) => (f >= 78 && f < 82 ? 0.02 : 0);                                                                             // «amigos»: pisotón (se hunde 2-4 fotogramas)
const risa = (f) => (f >= 551 && f < 585 ? { tilt: -4 + 3 * Math.sin(f * 0.55), bob: Math.abs(Math.sin(f * 0.55)) * 0.022 } : { tilt: 0, bob: 0 }); // «mediocridad»: se ríe balanceándose
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = idle(f, 5), br = brazosEn(f, CLAVES, 10), rs = risa(f);
  const fuerte = (BOCA[f] ?? 0) > 0.8; // solo en lo más fuerte la boca se abre un instante
  const base = caraEn(f);
  const expr = fuerte && !/laugh|grin/.test(base) ? 'relief_open' : base;
  const facing = S.id === 'reaccion' ? -0.2 : S.id === 'gancho' && f < 60 ? 0 : 0.3;
  const op = { ...br, expr, facing, look: facing ? 0.5 : 0, seed: 5, blink: blinkAt(f, 5),
    tilt: q(id.tilt + rs.tilt, 1), headTilt: q(id.headTilt + niega(f) + asiente(f), 1), bob: q(id.bob + piso(f) + rs.bob, 3) };
  return [{ key: 'profe' + JSON.stringify(op), draw: (p) => T.romanFront(p, 'profesor', op), x: P[0], y: DECK, z: P[2], s: 1, order: 3 }];
};
export const fxAt = () => [];
