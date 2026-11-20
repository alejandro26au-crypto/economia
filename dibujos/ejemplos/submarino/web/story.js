// «You Wake Up in a WWII Submarine» — planos atados a voice.mp3 (52,95 s al 115 %, 30 fps). Fotogramas de cada palabra en tiempos.json.
// 0 You wake up · 16 three hundred feet · 47 underwater! · 65 Eighty men · 107 One steel tube · 147 Zero windows · 187 Your bed? ·
// 207 Still warm · 235 Another sailor just left it · 281 You share it · 306 Every day · 337 The air? · 361 going bad · 392 Light a match ·
// 419 nothing · 443 Not enough oxygen! · 485 Then… · 502 BOOM! · 524 Depth charges! · 551 The enemy is right above you! · 606 The hull groans ·
// 644 The lights die · 678 Nobody moves · 711 Nobody breathes · 747 And it gets worse · 784 Even the toilet can kill you! · 826 One German sub? ·
// 868 Somebody flushed it wrong · 907 Seawater poured in · 943 hit the batteries · 971 and turned into poison gas! · 1026 Sub lost ·
// 1055 Because of a toilet! · 1099 One in five … never came home · 1187 One in five! · 1230 Your only trick? · 1259 Silence · 1289 Go deep ·
// 1312 Wait · 1336 Hours later · 1368 the bombs stop · 1399 You made it! · 1426 You crawl into that warm bed · 1480 Close your eyes ·
// 1517 Ping · 1538 They're back · 1561 And suddenly… (loop → «You wake up»)
import { M, clamp, lerp, lerp3, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';
import { brazosEn } from './gestos.js';
export const FPS = 30, TOTAL = 1592;
const UX = 40;
export const SHOTS = [
  { id: 'hook', a: 0, b: 64, light: 'warm', set: 'in' },
  { id: 'crowd', a: 65, b: 106, light: 'warm', set: 'in' },
  { id: 'tube', a: 107, b: 186, light: 'sea', set: 'out' },
  { id: 'bunk', a: 187, b: 336, light: 'warm', set: 'in' },
  { id: 'air', a: 337, b: 484, light: 'stale', set: 'in' },
  { id: 'boom', a: 485, b: 523, light: 'sea', set: 'out' },
  { id: 'alarm', a: 524, b: 550, light: 'red', set: 'in' },
  { id: 'above', a: 551, b: 605, light: 'sea', set: 'out' },
  { id: 'groan', a: 606, b: 643, light: 'red', set: 'in' },
  { id: 'die', a: 644, b: 710, light: 'red', set: 'in' },
  { id: 'breathe', a: 711, b: 783, light: 'dark', set: 'in' },
  { id: 'toilet', a: 784, b: 825, light: 'ub', set: 'ub' },
  { id: 'german', a: 826, b: 942, light: 'ub', set: 'ub' },
  { id: 'battery', a: 943, b: 1025, light: 'gas', set: 'ub' },
  { id: 'lost', a: 1026, b: 1054, light: 'deepU', set: 'ubout' },
  { id: 'because', a: 1055, b: 1098, light: 'gas', set: 'ub' },
  { id: 'five', a: 1099, b: 1229, light: 'somber', set: 'in' },
  { id: 'trick', a: 1230, b: 1288, light: 'dark', set: 'in' },
  { id: 'deep', a: 1289, b: 1335, light: 'deep', set: 'out' },
  { id: 'made', a: 1336, b: 1425, light: 'dark', set: 'in' },
  { id: 'bed', a: 1426, b: 1591, light: 'warm', set: 'in' },
];
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- luces ----------
const IN = { az: 80, el: 72, sky: '#fff0d8', ground: '#6a5848', hemi: 1.0, sun: '#ffe6c0', sunI: 1.5, fog: '#3a3028', fogNear: 30, fogFar: 90,
  skyTop: '#000', skyHor: '#000', sat: 1.12, lampC: '#ffcf8a', lampI: 7, bulb: '#fff0c0', vig: 0.3, shadowExt: 9, tint: '#ffffff' };
export const LIGHTS = {
  warm: IN,
  stale: { ...IN, fog: '#d2b47a', fogNear: 2.5, fogFar: 16, sat: 1.05, gain: '#fff2dc', tint: '#fff3e0', vig: 0.36 },
  red: { ...IN, sky: '#ff9a8a', ground: '#3a1418', hemi: 0.95, sun: '#ff6a52', sunI: 1.5, lampC: '#ff4a38', lampI: 8, bulb: '#ff7a64', red: true, gain: '#ffe4dc', vig: 0.45, tint: '#ffd2c8', fog: '#2a0a0e' },
  dark: { ...IN, sky: '#5a6cc8', ground: '#160a1c', hemi: 0.62, sun: '#ff3a2e', sunI: 0.9, lampC: '#ff2a1a', lampI: 2.6, bulb: '#2a2022', red: true, xmasOff: false, gain: '#d8dcff', lift: '#06040e', vig: 0.6, tint: '#aeb0e6', fog: '#06040e' },
  somber: { ...IN, hemi: 0.85, lampI: 5, sunI: 1.1, gain: '#f4e8dc', vig: 0.48, sat: 0.95, tint: '#efe4d8' },
  ub: { ...IN, sky: '#e8f2ea', ground: '#4a5248', hemi: 1.05, sun: '#f2f6ea', sunI: 1.3, lampC: '#f4e6b8', lampI: 7, vig: 0.34, tint: '#f6f8f2', fog: '#2a302a' },
  gas: { ...IN, sky: '#d6f2a8', ground: '#3a4a20', hemi: 1.0, sun: '#e2ff9a', sunI: 1.3, lampC: '#d8f080', lampI: 7, fog: '#9fc46a', fogNear: 1.5, fogFar: 14, gain: '#f0ffe0', vig: 0.42, tint: '#eaffd4' },
  sea: { az: 30, el: 78, sky: '#a8e8ff', ground: '#0b3a52', hemi: 1.15, sun: '#e8fbff', sunI: 2.3, fog: '#13628a', fogNear: 25, fogFar: 230,
    skyTop: '#5fd0f0', skyHor: '#0b3a5c', sat: 1.15, vig: 0.32, shadowExt: 40, tint: '#ffffff' },
  deep: { az: 30, el: 78, sky: '#5fa8d0', ground: '#06203a', hemi: 0.95, sun: '#b8e8ff', sunI: 1.7, fog: '#0a3858', fogNear: 15, fogFar: 150,
    skyTop: '#2f8cb8', skyHor: '#041a30', sat: 1.12, vig: 0.42, shadowExt: 40, tint: '#ffffff' },
  deepU: { az: 30, el: 78, sky: '#7ab8d8', ground: '#06203a', hemi: 1.0, sun: '#c8f0ff', sunI: 2.0, fog: '#0d4468', fogNear: 18, fogFar: 170,
    skyTop: '#3fa6cc', skyHor: '#06223c', sat: 1.12, vig: 0.4, shadowExt: 40, tint: '#ffffff' },
};
export const lightFor = (S, f) => {
  const L = { ...LIGHTS[S.light] };
  if (S.id === 'die' && f >= 650) Object.assign(L, LIGHTS.dark);            // «The lights die»: se apagan las bombillas
  if (S.id === 'made' && f >= 1370) { const t = M.smooth(ramp(f, 1370, 1392)); Object.assign(L, t > 0.5 ? LIGHTS.warm : LIGHTS.dark); if (t > 0 && t < 1) L.lampI = lerp(4.5, 7, t); }
  if (S.id === 'bed') {
    if (f >= 1490 && f < 1517) L.lampI = lerp(7, 3.5, ramp(f, 1490, 1515));  // se duerme: luz baja
    if (f >= 1517 && f < 1580) Object.assign(L, LIGHTS.red, { lampI: 8 * (0.7 + 0.3 * Math.abs(Math.sin((f - 1517) * 0.25))) }); // ping: alarma
  }
  if (S.id === 'alarm' || S.id === 'groan') L.lampI *= 0.75 + 0.25 * Math.abs(Math.sin(f * 0.3));
  return L;
};

// ---------- posiciones ----------
const BUNK = { x: -5.5, y: 0.5, z: -1.6 };
const HERO_LIE = [BUNK.x + 0.9, BUNK.y + 0.3, BUNK.z + 0.3]; // pies de la tarjeta tumbada (roll 90°: la cabeza hacia -x)
const FACE_LIE = [BUNK.x - 0.4, BUNK.y + 0.3, BUNK.z + 0.3];
const S_ = 0.82; // escala de los personajes (≈ 1,8 m)

// ---------- cámaras ----------
const C0 = { pos: [FACE_LIE[0] + 0.1, 1.02, 0.4], look: [FACE_LIE[0] - 0.12, 0.82, FACE_LIE[2]], fov: 38, roll: 48 };
const CAMS = {
  hook: [{ f: 0, ...C0 }, { f: 12, ...C0, fov: 33 }, { f: 24, pos: [-1.0, 1.62, -0.55], look: [-0.15, 1.68, -1.92], fov: 30, ease: 'easeOut' }, { f: 64, pos: [-0.85, 1.64, -0.75], look: [-0.15, 1.68, -1.92], fov: 26 }],
  crowd: [{ f: 65, pos: [8.2, 1.75, 0.35], look: [-6, 1.2, -0.1], fov: 42 }, { f: 106, pos: [7.4, 1.7, 0.3], look: [-6, 1.2, -0.1], fov: 40 }],
  tube: [{ f: 107, pos: [52, 10, 62], look: [0, 1, 0], fov: 40 }, { f: 146, pos: [30, 3, 30], look: [-2, 1, 0], fov: 42, ease: 'easeOut' },
    { f: 147, pos: [6, -1.5, 15], look: [-2, 2.5, 0], fov: 44 }, { f: 186, pos: [-2, -1.8, 14], look: [-8, 2.5, 0], fov: 42 }],
  bunk: [{ f: 187, pos: [-3.5, 1.3, 1.2], look: [-5.0, 0.85, -1.2], fov: 50 }, { f: 280, pos: [-3.6, 1.32, 1.1], look: [-5.0, 0.9, -1.2], fov: 47 },
    { f: 281, pos: [-3.4, 1.4, 1.1], look: [-4.4, 1.25, -0.6], fov: 40 }, { f: 336, pos: [-3.6, 1.38, 0.85], look: [-4.4, 1.25, -0.6], fov: 34 }],
  air: [{ f: 337, pos: [-3.0, 1.45, 1.35], look: [-4.3, 1.25, -0.5], fov: 46 }, { f: 420, pos: [-3.4, 1.42, 1.1], look: [-3.95, 1.3, -0.4], fov: 40 },
    { f: 448, pos: [-3.75, 1.42, 0.95], look: [-3.95, 1.4, -0.4], fov: 34, ease: 'easeOut' }, { f: 484, pos: [-3.8, 1.42, 0.9], look: [-3.95, 1.42, -0.4], fov: 32 }],
  boom: [{ f: 485, pos: [10, -18, 44], look: [2, 22, -18], fov: 50 }, { f: 523, pos: [8, -16, 40], look: [0, 18, -16], fov: 48 }],
  alarm: [{ f: 524, pos: [5.6, 1.7, 0.6], look: [-4, 1.3, -0.2], fov: 46 }, { f: 550, pos: [5.0, 1.65, 0.55], look: [-4, 1.3, -0.2], fov: 44 }],
  above: [{ f: 551, pos: [-14, -12, 40], look: [4, 34, -26], fov: 54 }, { f: 605, pos: [-10, -11, 37], look: [10, 36, -26], fov: 52 }],
  groan: [{ f: 606, pos: [0.3, 1.1, 1.75], look: [0.15, 1.75, -1.0], fov: 58 }, { f: 643, pos: [0.3, 1.12, 1.55], look: [0.15, 1.8, -1.0], fov: 54 }],
  die: [{ f: 644, pos: [6.6, 1.75, 0.45], look: [-4, 1.4, -0.2], fov: 44 }, { f: 710, pos: [5.4, 1.7, 0.4], look: [-4, 1.35, -0.2], fov: 40 }],
  breathe: [{ f: 711, pos: [0.0, 1.45, 1.45], look: [-0.5, 1.35, -0.5], fov: 40 }, { f: 746, pos: [-0.1, 1.45, 1.25], look: [-0.5, 1.38, -0.5], fov: 36 },
    { f: 747, pos: [-0.2, 1.45, 1.2], look: [-0.5, 1.4, -0.5], fov: 36 }, { f: 783, pos: [-0.3, 1.45, 1.0], look: [-0.5, 1.42, -0.5], fov: 30 }],
  toilet: [{ f: 784, pos: [UX + 1.2, 1.5, 1.4], look: [UX - 1.4, 0.7, -1.2], fov: 44 }, { f: 812, pos: [UX - 0.6, 1.05, 0.15], look: [UX - 1.4, 0.55, -1.15], fov: 38, ease: 'easeOut' }, { f: 825, pos: [UX - 0.7, 1.0, 0.0], look: [UX - 1.4, 0.55, -1.15], fov: 36 }],
  german: [{ f: 826, pos: [UX + 1.4, 1.55, 1.75], look: [UX - 0.9, 1.0, -0.9], fov: 44 }, { f: 906, pos: [UX + 1.0, 1.45, 1.4], look: [UX - 1.0, 1.0, -0.9], fov: 40 },
    { f: 907, pos: [UX - 1.0, 1.45, 1.75], look: [UX - 0.8, 0.95, -1.0], fov: 54 }, { f: 942, pos: [UX - 0.95, 1.4, 1.55], look: [UX - 0.8, 0.9, -1.0], fov: 50 }],
  battery: [{ f: 943, pos: [UX + 0.35, 2.0, 0.75], look: [UX + 0.1, -0.7, 0.0], fov: 46 }, { f: 970, pos: [UX + 0.3, 1.75, 0.6], look: [UX + 0.1, -0.7, 0.0], fov: 42 },
    { f: 971, pos: [UX + 1.6, 1.4, 1.8], look: [UX - 0.4, 0.9, -0.5], fov: 46 }, { f: 1025, pos: [UX + 1.3, 1.4, 1.5], look: [UX - 0.4, 1.0, -0.5], fov: 42 }],
  lost: [{ f: 1026, pos: [30, 2, 34], look: [0, -6, 0], fov: 44 }, { f: 1054, pos: [26, -2, 30], look: [0, -12, 0], fov: 44 }],
  because: [{ f: 1055, pos: [UX + 0.7, 1.3, 1.2], look: [UX - 1.1, 0.8, -1.0], fov: 42 }, { f: 1098, pos: [UX + 0.3, 1.15, 0.7], look: [UX - 1.2, 0.75, -1.0], fov: 36 }],
  five: [{ f: 1099, pos: [0.05, 1.45, 1.75], look: [0.05, 1.05, -0.9], fov: 52 }, { f: 1186, pos: [0.05, 1.42, 1.55], look: [0.05, 1.05, -0.9], fov: 50 },
    { f: 1204, pos: [0.3, 0.8, 0.6], look: [0.3, 0.1, -0.4], fov: 44, ease: 'easeOut' }, { f: 1229, pos: [0.3, 0.75, 0.5], look: [0.3, 0.1, -0.4], fov: 40 }],
  trick: [{ f: 1230, pos: [0.0, 1.45, 1.45], look: [-0.5, 1.35, -0.5], fov: 40 }, { f: 1288, pos: [-0.25, 1.45, 1.05], look: [-0.5, 1.4, -0.5], fov: 32 }],
  deep: [{ f: 1289, pos: [38, 4, 40], look: [0, -4, 0], fov: 46 }, { f: 1335, pos: [30, -8, 34], look: [-2, -22, 0], fov: 44 }],
  made: [{ f: 1336, pos: [3.2, 1.55, 1.4], look: [0.2, 1.25, -0.8], fov: 50 }, { f: 1398, pos: [2.8, 1.5, 1.3], look: [0.2, 1.25, -0.8], fov: 48 },
    { f: 1399, pos: [2.4, 1.3, 1.25], look: [0.2, 1.4, -0.8], fov: 50, ease: 'easeOut' }, { f: 1425, pos: [2.2, 1.3, 1.2], look: [0.2, 1.4, -0.8], fov: 48 }],
  bed: [{ f: 1426, pos: [-4.2, 1.25, 1.1], look: [-5.4, 0.75, -1.3], fov: 48 }, { f: 1478, pos: [-4.8, 1.05, 0.3], look: [-5.8, 0.8, -1.4], fov: 42 },
    { f: 1515, pos: [C0.pos[0] + 0.05, 0.98, -0.45], look: C0.look, fov: 38, roll: -6 }, { f: 1560, pos: [C0.pos[0] + 0.1, 1.0, -0.3], look: C0.look, fov: 40, roll: -8 },
    { f: 1591, ...C0 }],
};
const KICKS = [{ f: 5, a: 0.02 }, { f: 47, a: 0.04 }, { f: 89, a: 0.02 }, { f: 454, a: 0.03 }, { f: 502, a: 0.09 }, { f: 506, a: 0.06 }, { f: 524, a: 0.05 }, { f: 532, a: 0.05 },
  { f: 587, a: 0.04 }, { f: 617, a: 0.03 }, { f: 814, a: 0.04 }, { f: 893, a: 0.03 }, { f: 929, a: 0.04 }, { f: 988, a: 0.04 }, { f: 1072, a: 0.03 }, { f: 1201, a: 0.02 },
  { f: 1410, a: 0.03 }, { f: 1517, a: 0.04 }];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  // zoom de golpe en las cifras: «three hundred», «Eighty», «One in five» (x2): entra en 3 fotogramas y vuelve suave
  for (const [z, k] of [[16, 0.14], [65, 0.16], [147, 0.12], [306, 0.12], [761, 0.12], [1026, 0.12], [1105, 0.14], [1199, 0.18], [1259, 0.14], [1312, 0.12]]) { const d = f - (z - 2); if (d >= 0 && d < 16) c.fov *= 1 - k * (d < 3 ? M.easeOut(d / 3) : 1 - M.smooth((d - 3) / 13)); }
  // barrido rápido entre planos: sale disparada hacia un lado y el plano nuevo entra desde el otro (4 fotogramas)
  { const de = S.b - f, ds = f - S.a, A = 0.5; let w = 0;
    if (de < 4 && S.b !== TOTAL - 1) w = Math.pow((4 - de) / 4, 2) * A; else if (ds < 4 && S.a !== 0) w = -Math.pow((4 - ds) / 4, 2) * A;
    if (w) { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], L = Math.hypot(dx, dz) || 1, D = Math.hypot(dx, c.look[1] - c.pos[1], dz);
      c.look = [c.look[0] - dz / L * w * D, c.look[1], c.look[2] + dx / L * w * D]; c.roll = (c.roll || 0) + w * 10; } }
  // temblor continuo en la alarma y las cargas
  const shake = S.id === 'alarm' ? 0.06 * (1 - ramp(f, 524, 556)) + 0.012 : S.id === 'groan' ? 0.01 : S.id === 'boom' && f >= 502 ? 0.12 * (1 - ramp(f, 502, 523)) : 0;
  if (shake) { c.look = [c.look[0] + shake * Math.sin(f * 2.1), c.look[1] + shake * Math.sin(f * 2.7 + 1), c.look[2]]; c.roll = (c.roll || 0) + shake * 30 * Math.sin(f * 1.9); }
  c.flash = f >= 502 && f < 506 ? (1 - (f - 502) / 4) * 0.45 : f >= 1517 && f < 1521 ? 0.2 * (1 - (f - 1517) / 4) : 0;
  return c;
};

// ---------- lente ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f), d = dist(C.pos, C.look);
  const near = { hook: 9, bunk: 8, air: 10, breathe: 12, trick: 12, toilet: 8, german: 7, battery: 7, because: 8, five: 7, made: 6, bed: 10, groan: 6, crowd: 5, alarm: 5, die: 5 };
  if (S.set === 'out' || S.set === 'ubout') return { focus: d, cinf: 3 };
  if (S.id === 'crowd' || S.id === 'alarm' || S.id === 'die') return { focus: 4.5, cinf: 5 };
  return { focus: d, cinf: near[S.id] || 6 };
};

// ---------- estado del mundo ----------
const spring = (f, f0) => (f < f0 ? 0 : M.spring((f - f0) / 30, 1.6, 3.2));
export const worldAt = (f) => {
  const S = shotAt(f), W = { set: S.set, depth: 300, swing: 0, wheel: 0, blanket: true, lever: 0, charges: null, sub: { x: 0, y: 0, z: 0, pitch: 0 }, dx: -500 };
  if (S.id === 'hook') W.depth = 300 * spring(f, 16);
  if (S.id === 'alarm') { W.swing = 0.35 * (1 - ramp(f, 524, 560)) + 0.1; W.needleJit = 0.3; W.wheel = Math.sin(f * 0.2) * 0.6; }
  if (S.id === 'groan' || S.id === 'die') { W.swing = 0.08; W.depth = 330; }
  if (S.id === 'breathe' || S.id === 'trick' || S.id === 'five' || S.id === 'made') W.depth = 380;
  if (S.id === 'tube') W.sub = { x: (f - 107) * 0.05, y: 0, z: 0, pitch: 0 };
  if (S.id === 'boom' || S.id === 'above') {
    W.dx = S.id === 'boom' ? -6 : lerp(-40, 10, ramp(f, 551, 605));
    const f0 = S.id === 'boom' ? 485 : 551;
    W.charges = [0, 1, 2, 3, 4, 5].map((i) => { const t = (f - f0 - i * 3) / 30; if (t < 0) return null;
      const y = 46 - t * (S.id === 'boom' ? 52 : 22); if (S.id === 'boom' && f >= 502 && i < 2) return null; return { p: [-6 + i * 4.2 + (S.id === 'above' ? W.dx : 0), y, -22 + (i % 2) * 4 + (S.id === 'boom' ? t * 14 : 0)], r: t * 2 + i }; });
  }
  if (S.id === 'deep') { const t = M.smooth(ramp(f, 1289, 1335)); W.sub = { x: -t * 8, y: -t * 22, z: 0, pitch: -0.22 * Math.sin(Math.min(1, t * 1.6) * Math.PI / 2) * (1 - t * 0.5) }; }
  if (S.id === 'lost') { const t = ramp(f, 1026, 1054); W.usub = { x: 0, y: -2 - t * 10, z: 0, pitch: -0.12 - t * 0.25, roll: 0.15 * t, prop: 0 }; }
  if (S.id === 'german') W.lever = -1.1 * M.back(ramp(f, 880, 890));
  if (S.id === 'battery' || S.id === 'because') W.lever = -1.1;
  if (S.id === 'bunk') W.blanket = true;
  return W;
};

// ---------- personajes ----------
const R = (T, who, o, pos, extra = {}) => ({ key: who + JSON.stringify(o), draw: (p) => T.romanFront(p, who, o), x: pos[0], y: pos[1], z: pos[2], s: S_, ...extra });
const life = (f, seed, o = {}) => { const i = idle(f, seed); return { bob: q(i.bob, 3), tilt: q(i.tilt, 1), headTilt: q(i.headTilt + (o.headTilt || 0), 1), seed, blink: blinkAt(f, seed), ...o }; };
const pop = (f, f0, a = 0.04) => (f >= f0 && f < f0 + 8 ? q(a * Math.sin((f - f0) / 8 * Math.PI), 3) : 0); // salto con impulso en un momento clave
const nod = (f, fs) => { let t = 0; for (const g of fs) { const d = f - g; if (d >= -2 && d < 10) t += -6 * Math.sin(((d + 2) / 12) * Math.PI); } return t; };
const shake = (f, f0, f1) => (f >= f0 && f <= f1 ? q(7 * Math.sin((f - f0) / (f1 - f0) * Math.PI * 4), 1) : 0);

export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], tint = LIGHTS[S.light].tint;
  const L_ = (who, o, pos, extra = {}) => out.push(R(T, who, o, pos, { tint: extra.tint || (S.id === 'die' && f >= 650 ? LIGHTS.dark.tint : S.id === 'made' && f >= 1380 ? '#ffffff' : (S.id === 'bed' && f >= 1517 && f < 1580) ? LIGHTS.red.tint : tint), ...extra }));
  const lying = (who, o, feet, extra = {}) => L_(who, o, feet, { roll: Math.PI / 2, fixedYaw: 0, blob: false, shadow: false, ...extra });
  const crew = (list) => list.forEach(([who, x, z, o = {}]) => L_(who, life(f, Math.abs(Math.round(x * 7 + z * 3)) + 2, o), [x, 0, z]));
  switch (S.id) {
    case 'hook': {
      const awake = f >= 5;
      lying('sailor', { ...life(f, 3), blink: awake ? 0 : 1, expr: awake ? 'shock' : 'neutral', bob: 0, tilt: 0, headTilt: 0, look: f > 20 ? 0.8 : 0 }, HERO_LIE);
      break;
    }
    case 'crowd': {
      crew([['sailorB', 4.8, -0.55, { look: 0.5 }], ['sailorC', 4.0, 0.6, { look: -0.4 }], ['skipper', 2.6, 0.1, { expr: 'stern', L: 'hip' }], ['sailorD', 1.5, -0.8],
        ['sailorE', 0.6, 0.75, { expr: 'smile' }], ['sailorB', -0.6, -0.45], ['sailorC', -1.8, 0.5, { expr: 'grin' }], ['sailorD', -3.2, -0.2], ['sailorE', -4.6, 0.55], ['sailorC', -6.0, -0.3], ['sailorB', -7.6, 0.4]]);
      L_('sailor', life(f, 3, { expr: f >= 89 ? 'cejas' : 'neutral', look: 0, bob: pop(f, 89) }), [5.9, 0, 0.0]);
      break;
    }
    case 'bunk': {
      const walkT = ramp(f, 252, 300);
      if (f < 238) lying('sailorB', { ...life(f, 12), blink: 1, expr: 'snore', tilt: 0, headTilt: 0, bob: 0 }, HERO_LIE);
      else if (walkT < 1) L_('sailorB', life(f, 12, { expr: f < 252 ? 'whistle' : 'smile', blink: f < 252 ? 1 : blinkAt(f, 12), L: f < 252 ? 'up' : 'hang', R: f < 252 ? 'up' : 'hang', step: f >= 252 ? q(((f - 252) / 14) % 1) : 0, bob: pop(f, 238, 0.05) }), [-4.95 + walkT * 3.2, 0, -0.95 + walkT * 0.5]);
      const ex = f < 207 ? 'cejas' : f < 235 ? 'pained' : f < 281 ? 'shock' : f < 306 ? 'nervous' : 'stubborn';
      const arms = brazosEn(f, [{ f: 207, R: 'reach' }, { f: 232, R: 'hang' }, { f: 281, L: 'open', R: 'open' }, { f: 306, L: 'hip', R: 'hip' }]);
      L_('sailor', life(f, 3, { expr: ex, look: f < 281 ? -0.7 : 0, ...arms, lift: 0.0, headTilt: nod(f, [215, 314]) + shake(f, 306, 330), bob: pop(f, 235) }), [-4.35, 0, -0.75]);
      break;
    }
    case 'air': {
      const m = f < 396 ? null : f < 419 ? M.back(ramp(f, 396, 404)) : -ramp(f, 419, 450);
      const arms = brazosEn(f, [{ f: 341, L: 'cheek' }, { f: 365, L: 'hang' }, { f: 392, R: 'hold' }, { f: 443, L: 'cheek', R: 'cheek' }]);
      const ex = f < 361 ? 'nervous' : f < 392 ? 'pained' : f < 419 ? 'cejas' : f < 443 ? 'squint' : 'shock';
      L_('sailor', life(f, 3, { expr: ex, ...arms, match: m === null ? undefined : q(m, 2), sweat: f < 361 ? 1 : 3, sweatT: q((f % 60) / 60, 2), look: f >= 400 && f < 443 ? 0.6 : 0, bob: pop(f, 443, 0.05) }), [-4.1, 0, -0.4]);
      L_('sailorD', life(f, 21, { expr: 'pained', sweat: 2, sweatT: q(((f + 20) % 60) / 60, 2), look: 0.5 }), [-5.6, 0, -0.9]);
      break;
    }
    case 'alarm': case 'die': {
      const dk = S.id === 'die';
      const frozen = dk && f >= 678;
      const ex = dk ? (frozen ? 'shock' : 'nervous') : 'shock';
      const lk = (s) => (frozen ? 0 : q(0.6 * Math.sin(f * 0.2 + s), 1));
      const j = dk ? 0 : 0.02;
      const o = (s) => frozen ? { bob: 0, tilt: 0, headTilt: -4, blink: 0 } : { bob: q(j * Math.sin(f * 1.3 + s), 3) };
      crew([['sailorC', 3.2, -0.6, { expr: ex, look: lk(1), L: 'up', ...o(1) }], ['skipper', 1.8, 0.45, { expr: dk ? 'stern' : 'shock', look: lk(2), R: 'point', ...o(2) }], ['sailorD', 0.3, -0.5, { expr: ex, L: 'cheek', R: 'cheek', ...o(3) }],
        ['sailorE', -1.2, 0.5, { expr: ex, look: lk(4), ...o(4) }], ['sailorB', -2.8, -0.3, { expr: ex, look: lk(5), ...o(5) }], ['sailorC', -4.4, 0.4, { expr: ex, ...o(6) }]]);
      L_('sailor', life(f, 3, { expr: ex, look: lk(0), L: 'up', R: 'up', ...o(0) }), [4.4, 0, 0.1]);
      break;
    }
    case 'groan': {
      L_('sailorD', life(f, 21, { expr: 'nervous', look: -0.6, headTilt: -8, L: 'cheek', R: 'cheek' }), [-0.45, 0, -0.8]);
      L_('sailor', life(f, 3, { expr: f < 617 ? 'nervous' : 'shock', look: 0.4, headTilt: -10 }), [0.75, 0, -0.55]);
      break;
    }
    case 'breathe': {
      const worse = f >= 747;
      const arms = brazosEn(f, [{ f: 711, L: 'cheek', R: 'cheek' }, { f: 750, L: 'hang', R: 'hang' }]);
      L_('sailor', life(f, 3, { expr: worse ? (f >= 761 ? 'shock' : 'nervous') : 'hold', puff: !worse, ...arms, sweat: 3, sweatT: q((f - 711) / 90, 2), blink: worse ? 0 : blinkAt(f, 3), look: worse ? -0.8 : 0, bob: pop(f, 761, 0.04), headTilt: f < 747 ? 0 : -4 }), [-0.5, 0, -0.5]);
      break;
    }
    case 'toilet': break;
    case 'german': case 'battery': case 'because': {
      const g = S.id === 'german', b = S.id === 'battery';
      const ex = g ? (f < 868 ? 'neutral' : f < 893 ? 'grin' : 'shock') : b ? (f < 971 ? 'shock' : 'pained') : 'dazed';
      const arms = brazosEn(f, [{ f: 830, L: 'hip' }, { f: 868, L: 'hang', R: 'reach' }, { f: 895, R: 'cheek', L: 'cheek' }, { f: 975, L: 'mouth', R: 'hang' }, { f: 1055, L: 'temple', R: 'hang' }]);
      const pos = g && f >= 907 ? [UX - 0.15, 0, -0.95] : g ? [UX - 0.75, 0, -0.65] : b ? [UX - 0.9, 0, -0.75] : [UX - 0.55, 0, -0.6];
      L_('german', life(f, 9, { expr: ex, ...arms, lift: 0.0, look: g && f < 868 ? q(0.6 * Math.sin(f * 0.08), 1) : 0, swirl: q((f * 0.35) % 6.283, 1), bob: pop(f, 893) + pop(f, 988, 0.03),
        headTilt: b && f >= 975 ? q(6 * Math.sin(f * 0.6), 1) : 0, sweat: b ? 2 : 0, sweatT: q((f % 50) / 50, 2) }), pos);
      break;
    }
    case 'five': {
      const fade = 1 - M.smooth(ramp(f, 1150, 1185));
      const sad = { expr: 'neutral', look: 0, headTilt: -6 };
      [['sailorE', -0.6, -1.05], ['skipper', 0.05, -1.1], ['sailorD', 0.7, -1.05]].forEach(([w, x, z], i) => L_(w, life(f, 30 + i, { ...sad }), [x, 0, z]));
      L_('sailorB', life(f, 41, { ...sad }), [-0.32, 0, -0.45]);
      if (fade > 0.01) L_('sailorC', life(f, 42, { expr: 'smile', look: 0 }), [0.38, 0, -0.42], { alpha: q(fade, 2), order: 3 });
      break;
    }
    case 'trick': {
      const arms = brazosEn(f, [{ f: 1259, L: 'shh' }]);
      L_('sailor', life(f, 3, { expr: f < 1259 ? 'cejas' : 'squint', ...arms, sweat: 2, sweatT: q((f % 70) / 70, 2), look: f < 1259 ? 0 : -0.3 }), [-0.5, 0, -0.5]);
      break;
    }
    case 'made': {
      const lit = f >= 1376, yay = f >= 1399;
      const ex = yay ? 'laugh' : lit ? 'cejas' : 'squint';
      const cheer = (s) => yay ? { L: 'cheer', R: 'cheer', bob: q(Math.abs(Math.sin((f + s) * 0.5)) * 0.03, 3), tilt: q(4 * Math.sin(f * 0.5 + s), 1) } : { headTilt: lit ? -6 : 0, look: lit ? 0.3 : 0 };
      crew([['sailorC', -1.4, -0.9, { expr: ex, ...cheer(1) }], ['skipper', 0.0, -1.0, { expr: yay ? 'relief_open' : ex, ...(yay ? { R: 'thumb', L: 'hip' } : {}) }], ['sailorD', 1.3, -0.95, { expr: ex, ...cheer(3) }]]);
      L_('sailor', life(f, 3, { expr: yay ? 'laugh' : lit ? 'relief' : 'squint', ...cheer(0), sweat: yay ? 0 : 2, sweatT: q((f % 70) / 70, 2) }), [0.6, 0, -0.3]);
      break;
    }
    case 'bed': {
      const inT = 1;
      const ex = f < 1480 ? 'relief' : f < 1517 ? 'relief' : f < 1538 ? 'shock' : f < 1561 ? 'nervous' : 'shock';
      const bl = f >= 1490 && f < 1517 ? (f < 1500 ? 0.5 : 1) : f >= 1585 ? 1 : (f >= 1517 ? 0 : blinkAt(f, 3));
      L_('sailor', { ...life(f, 3), expr: ex, blink: bl, look: f >= 1538 && f < 1561 ? q(0.8 * Math.sin(f * 0.15), 1) : 0, tilt: 0, headTilt: 0, bob: 0 },
        [lerp(BUNK.x + 0.4, HERO_LIE[0], inT), inT < 1 ? lerp(0, HERO_LIE[1], inT) : HERO_LIE[1], lerp(-0.7, HERO_LIE[2], inT)], { roll: lerp(0, Math.PI / 2, inT), fixedYaw: inT > 0.5 ? 0 : undefined, blob: inT < 0.3, shadow: false });
      break;
    }
  }
  return out;
};

// ---------- efectos 2D ----------
const FX = (key, draw, c, size, extra = {}) => { const s = size / 2.25; return { key, draw, x: c[0], y: c[1] - 1.069 * s, z: c[2], s, blob: false, shadow: false, order: 5, ...extra }; };
const steam = (p, t) => { for (let i = 0; i < 4; i++) { const pts = []; const x0 = 140 + i * 100, k = (t + i * 0.25) % 1; for (let j = 0; j < 12; j++) pts.push([x0 + Math.sin(j * 0.8 + k * 6) * 18, 760 - j * 34 - k * 120]); const g = p.g; g.save(); g.globalAlpha = Math.sin(k * Math.PI); p.stroke(pts, 10, '#ffffff'); g.restore(); } };
const bubbles = (p, t, n = 14, seed = 1) => { for (let i = 0; i < n; i++) { const k = (t + i / n) % 1, x = 300 + Math.sin(i * 2.3 + seed) * 200 + Math.sin(k * 8 + i) * 20, y = 950 - k * 900, r = 8 + (i % 4) * 7; p.ell(x, y, r, r, 'rgba(220,245,255,.55)', 3); p.dot(x - r * 0.35, y - r * 0.35, r * 0.25, '#ffffff'); } };
const spray = (p, t) => { for (let i = 0; i < 22; i++) { const k = ((t + i / 22) % 1), sx = (i % 2 ? 1 : -1) * (40 + (i * 37) % 140), x = 300 + sx * k * 1.6, y = 800 - Math.sin(k * Math.PI) * 520 + k * 120, r = 12 + (i % 3) * 5; p.ell(x, y, r, r * 1.4, '#9fd8ff', 4); } p.poly([[270, 800], [330, 800], [360, 420], [240, 420]], 'rgba(160,220,255,.75)', 5); };
const hat = (p) => { p.ell(300, 860, 120, 46, '#f4f4f0', 7); p.ell(300, 832, 82, 54, '#fbfbf8', 7, 180, 360); p.stroke([[200, 850], [400, 846]], 4, '#c9cdd6'); };
const ping = (p, t) => { const g = p.g; for (let k = 0; k < 3; k++) { const u = t - k * 0.18; if (u <= 0 || u >= 1) continue; g.beginPath(); g.arc(300, 500, 40 + 260 * u, 0, Math.PI * 2); g.strokeStyle = `rgba(140,255,200,${(1 - u).toFixed(2)})`; g.lineWidth = 16 * (1 - u) + 3; g.stroke(); } };
const blast = (p, t) => { const g = p.g, r = 80 + 220 * M.easeOut(t), gr = g.createRadialGradient(300, 500, 0, 300, 500, r); gr.addColorStop(0, `rgba(255,255,240,${(1 - t).toFixed(2)})`); gr.addColorStop(0.6, `rgba(190,240,255,${(0.7 * (1 - t)).toFixed(2)})`); gr.addColorStop(1, 'rgba(120,220,255,0)'); g.fillStyle = gr; g.beginPath(); g.arc(300, 500, r, 0, 7); g.fill(); };
const word = (p, txt, col, t) => { const g = p.g; g.save(); g.translate(300, 500); const s = 0.6 + 0.4 * M.back(clamp(t * 3)); g.scale(s, s); g.rotate(-0.12); g.font = '900 150px Arial Black, Arial'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round'; g.lineWidth = 34; g.strokeStyle = '#241726'; g.strokeText(txt, 0, 0); g.fillStyle = col; g.fillText(txt, 0, 0); g.restore(); };

export const fxAt = (f, T) => {
  const S = shotAt(f), out = [];
  if (S.id === 'bunk' && f >= 238 && f < 252) { const t = q((f - 238) / 14, 2); out.push(FX('puffB' + t, (p) => { p.g.translate(150, 350); T.fxPuff(p, t); }, [-4.95, 0.3, -0.9], 1.2)); }
  if (S.id === 'bunk' && f >= 207 && f < 280) { const t = q(((f - 207) / 40) % 1, 2); out.push(FX('steam' + t, (p) => steam(p, t), [BUNK.x + 0.1, BUNK.y + 0.7, BUNK.z + 0.25], 1.0, { alpha: 0.85 })); }
  if (S.set === 'out' || S.set === 'ubout') { // nieve marina y burbujas
    for (let i = 0; i < 3; i++) { const t = q(((f * 0.004) + i / 3) % 1, 3); out.push(FX('bub' + i + t, (p) => bubbles(p, t, 10, i), [-14 + i * 14, 6 + i * 3, 6 - i * 4], 14, { noInk: true })); }
  }
  if (S.id === 'boom' && f >= 502) { const t = q(ramp(f, 502, 523), 2);
    out.push(FX('blast' + t, (p) => blast(p, t), [-2, 12, 4], 36, { noInk: true, add: true }));
    out.push(FX('burst' + t, (p) => { p.g.translate(50, 250); T.fxBurst(p, t, '#fff6c8', 14, 60, 240); }, [-2, 12, 4], 30, { noInk: true }));
    out.push(FX('bb' + t, (p) => bubbles(p, t, 22, 4), [-2, 14, 2], 26, { noInk: true })); }
  if (S.id === 'groan') { const t = q(((f - 606) / 24) % 1, 2); out.push(FX('creak' + t, (p) => { p.g.translate(150, 300); T.fxCreak(p, t); }, [0.7, 3.05, -0.7], 1.1)); out.push(FX('creak2' + t, (p) => { p.g.translate(150, 300); T.fxCreak(p, (t + 0.4) % 1); }, [-0.5, 2.9, -1.2], 1.0)); }
  if (S.id === 'toilet' && f >= 812) out.push(FX('skull', (p) => word(p, '!', '#ff5a3a', clamp((f - 812) / 10)), [UX - 1.0, 1.35, -1.0], 0.9, { order: 6 }));
  if ((S.id === 'german' && f >= 907) || S.id === 'battery') { const t = q((f % 20) / 20, 2); out.push(FX('spray' + t, (p) => spray(p, t), [UX - 1.4, 1.1, -1.0], 1.6)); }
  if (S.id === 'battery' && f >= 950) { // chispas en la batería y gas venenoso que sube
    if (f < 985) { const t = q(((f - 950) % 8) / 8, 2); out.push(FX('spark' + t, (p) => { p.g.translate(50, 250); T.fxBurst(p, t, '#fff07a', 8, 30, 160); }, [UX + 0.1, -0.5, 0.2], 0.9)); }
    if (f >= 971) for (let i = 0; i < 4; i++) { const k = q(clamp((f - 971 - i * 6) / 50), 2); if (k > 0) out.push(FX('gas' + i + k, (p) => T.fxDust(p, k, '#9ee06a'), [UX + 0.1 - i * 0.35, -0.2 + k * 1.6 + i * 0.15, 0.1 + (i % 2) * 0.4], 1.0 + k * 1.4, { alpha: 0.8, tint: '#c8ff9a' })); }
  }
  if (S.id === 'because') for (let i = 0; i < 3; i++) { const k = q(((f - 1055) / 60 + i / 3) % 1, 2); out.push(FX('gas2' + i + k, (p) => T.fxDust(p, k, '#9ee06a'), [UX - 1.6 + i * 0.9, 0.3 + k * 0.9, -1.1], 1.3, { alpha: 0.4, tint: '#c8ff9a' })); }
  if (S.id === 'lost') { const t = q(((f - 1026) / 28) % 1, 2); out.push(FX('ubb' + t, (p) => bubbles(p, t, 20, 7), [0, 2, 0], 20, { noInk: true })); }
  if (S.id === 'five' && f >= 1165) out.push(FX('hat', hat, [0.38, 0.45, -0.42], 0.8, { order: 3 }));
  if (S.id === 'bed' && f >= 1517 && f < 1560) { const t = q((f - 1517) / 30 % 1, 2); out.push(FX('ping' + t, (p) => ping(p, t), [FACE_LIE[0] + 0.1, 0.95, -1.0], 1.2, { noInk: true, add: true })); }
  return out;
};
