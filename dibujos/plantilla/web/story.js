// PLANTILLA — planos atados a cada PALABRA de la voz (web/tiempos.js: PAL = [[palabra, f0, f1], …] a 30 fps).
// Ejemplo: «El truco del 99 que te engaña» (guion de prueba). Con tiempos ESTIMADOS hasta que llega la voz:
// al llegar, `./inercia voz N` reescribe tiempos.js y todo se recoloca solo (los momentos se buscan por palabra).
// Técnicas (del submarino): luces por plano, camFromKeys con golpes (KICKS), ZOOM DE GOLPE en cifras y remates,
// BARRIDO rápido entre planos, efectos 2D (destellos, estrellas, polvo), gestos del kit en el profesor.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';
import { brazosEn } from './gestos.js';
import { PAL, TOTAL_VOZ } from './tiempos.js';
import { BOCA } from './boca.js';
export const FPS = 30, TOTAL = TOTAL_VOZ;

// ---------- palabras → fotogramas ----------
const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');
/** fotograma en que EMPIEZA la n-ésima vez (1, 2…) que suena `w` (empieza por). Ej.: en('49', 2) */
export const en = (w, n = 1) => { // `w` puede ser varias palabras seguidas: en('más caro', 2)
  const ks = w.split(/\s+/).map(norm); let c = 0;
  for (let i = 0; i + ks.length <= PAL.length; i++) if (ks.every((k, j) => norm(PAL[i + j][0]).startsWith(k)) && ++c === n) return PAL[i][1];
  console.log('ERR palabra no encontrada: ' + w); return 0;
};
const fin = (w, n = 1) => { const k = norm(w); let c = 0; for (const [p, , f1] of PAL) if (norm(p).startsWith(k) && ++c === n) return f1; return 0; };

// ---------- planos (cada uno empieza en una palabra) ----------
const A = { gancho: 0, promesa: en('vas'), catalogo: en('un', 1), duda: en('más caro', 2), ticket: en('pero'), peor: en('aún') - 6,
  coche: en('pues'), cerebro: en('tu', 3), cta: en('mira', 2) };
export const SHOTS = [
  { id: 'gancho', light: 'dia' }, { id: 'promesa', light: 'dia' }, { id: 'catalogo', light: 'dia' }, { id: 'duda', light: 'tarde' },
  { id: 'ticket', light: 'dia' }, { id: 'peor', light: 'nube' }, { id: 'coche', light: 'dia' }, { id: 'cerebro', light: 'dorada' }, { id: 'cta', light: 'dorada' },
].map((s, i, L) => ({ ...s, a: A[s.id], b: i + 1 < L.length ? A[L[i + 1].id] - 1 : TOTAL - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- luces (la de día = la de los romanos) ----------
const DIA = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, vig: 0.2, shadowExt: 14 };
export const LIGHTS = {
  dia: DIA,
  tarde: { ...DIA, az: 200, el: 30, sun: '#ffe2b8', sunI: 2.6, gain: '#fff6ea' },
  nube: { ...DIA, sky: '#aab8cc', hemi: 1.0, sun: '#e8ecf4', sunI: 1.5, skyTop: '#6f86a8', skyHor: '#c9d2de', fog: '#c2ccd8', sat: 0.95, vig: 0.34 },
  dorada: { az: 230, el: 14, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.24, shadowExt: 14 },
};
export const lightFor = (S, f) => ({ ...LIGHTS[S.light] });

// ---------- posiciones ----------
const P = [-0.55, 0, -1.5], OJOS = [P[0], 1.33, P[2]], PIZ = [0.9, 1.75, -2.3], SP = 0.82; // profesor (≈1,8 m) y pizarra
// ---------- cámaras (encuadre: personaje de cuerpo entero o de rodillas arriba, el entorno visible; caras grandes solo 1-2 veces) ----------
const CAMS = {
  gancho: [{ f: 0, pos: [-0.5, 1.36, 0.45], look: OJOS, fov: 36 },                                   // ÚNICO primer plano de cara: el golpe del hook
    { f: en('caro') + 6, pos: [-0.52, 1.36, 0.3], look: OJOS, fov: 34 },
    { f: en('vendio') + 4, pos: [0.1, 1.75, 4.4], look: [0.4, 1.35, -2.0], fov: 46, ease: 'easeOut' }],
  promesa: [{ f: A.promesa, pos: [3.4, 2.6, 6.4], look: [-0.4, 0.7, -6], fov: 50 },                      // plano general: terraza, villa y el valle
    { f: A.catalogo - 1, pos: [2.6, 2.3, 5.6], look: [-0.2, 0.9, -5], fov: 48 }],
  catalogo: [{ f: A.catalogo, pos: [-0.1, 1.75, 4.0], look: [0.6, 1.55, -2.3], fov: 46 },               // pizarra entera y el profesor señalando
    { f: en('49', 2), pos: [0.3, 1.8, 3.3], look: [0.85, 1.7, -2.3], fov: 44, ease: 'easeOut' }, { f: A.duda - 1, pos: [0.3, 1.8, 3.1], look: [0.85, 1.7, -2.3], fov: 44 }],
  duda: [{ f: A.duda, pos: [-3.6, 0.9, 2.4], look: [0.0, 1.5, -1.9], fov: 46, roll: -3 },              // contrapicado desde la izquierda
    { f: A.ticket - 1, pos: [-3.3, 0.95, 2.1], look: [0.0, 1.5, -1.9], fov: 44, roll: -2 }],
  ticket: [{ f: A.ticket, pos: [0.15, 1.8, 3.6], look: [0.85, 1.7, -2.3], fov: 44 }, { f: A.peor - 1, pos: [0.25, 1.8, 3.2], look: [0.85, 1.7, -2.3], fov: 44 }],
  peor: [{ f: A.peor, pos: [4.6, 1.35, 3.0], look: [-0.6, 1.3, -1.4], fov: 42 }, { f: A.coche - 1, pos: [4.0, 1.4, 2.6], look: [-0.6, 1.35, -1.4], fov: 38 }],
  coche: [{ f: A.coche, pos: [0.15, 1.85, 3.8], look: [0.85, 1.72, -2.3], fov: 45 }, { f: en('80'), pos: [0.3, 1.82, 3.2], look: [0.9, 1.75, -2.3], fov: 44, ease: 'easeOut' },
    { f: A.cerebro - 1, pos: [0.3, 1.8, 3.0], look: [0.9, 1.72, -2.3], fov: 44 }],
  cerebro: [{ f: A.cerebro, pos: [-1.2, 1.6, 4.4], look: [0.2, 1.4, -2.0], fov: 46 }, { f: en('llama'), pos: [-0.8, 1.62, 4.0], look: [0.25, 1.45, -2.0], fov: 45 },
    { f: A.cta - 1, pos: [-0.5, 1.62, 3.8], look: [0.25, 1.45, -2.0], fov: 45 }],
  cta: [{ f: A.cta, pos: [-0.2, 1.4, 2.6], look: [-0.45, 1.2, -1.5], fov: 42 }, { f: TOTAL - 1, pos: [-0.3, 1.4, 2.2], look: [-0.5, 1.22, -1.5], fov: 40 }],
};
const GOLPES = ['vendio', 'cinco', '49', 'cuadra', 'peor', '22', '80', 'dolares', 'izquierdo', 'vendio'];
const KICKS = [{ f: en('vendio'), a: 0.03 }, { f: en('49', 2), a: 0.03 }, { f: en('peor'), a: 0.03 }, { f: en('80'), a: 0.03 }, { f: en('golpe'), a: 0.04 }];
// zoom de golpe en las cifras y los remates: [palabra, n, fuerza]
const ZOOMS = [['cinco', 1, 0.14], ['49', 3, 0.12], ['2,99', 1, 0.1], ['22', 1, 0.14], ['80', 1, 0.12], ['150', 1, 0.12], ['izquierdo', 1, 0.1]].map(([w, n, k]) => [en(w, n), k]);
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  for (const [z, k] of ZOOMS) { const d = f - (z - 2); if (d >= 0 && d < 16) c.fov *= 1 - k * (d < 3 ? M.easeOut(d / 3) : 1 - M.smooth((d - 3) / 13)); }
  { // barrido rápido entre planos: sale disparada hacia un lado y el plano nuevo entra desde el otro (4 fotogramas)
    const de = S.b - f, ds = f - S.a, AMP = 0.5; let w = 0;
    if (de < 4 && S.b !== TOTAL - 1) w = Math.pow((4 - de) / 4, 2) * AMP; else if (ds < 4 && S.a !== 0) w = -Math.pow((4 - ds) / 4, 2) * AMP;
    if (w) { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], L = Math.hypot(dx, dz) || 1, D = Math.hypot(dx, c.look[1] - c.pos[1], dz);
      c.look = [c.look[0] - dz / L * w * D, c.look[1], c.look[2] + dx / L * w * D]; c.roll = (c.roll || 0) + w * 10; }
  }
  c.flash = f >= en('vendio') && f < en('vendio') + 3 ? 0.18 * (1 - (f - en('vendio')) / 3) : 0;
  c.shadowAt = [0, 1, -1.5];
  return c;
};

// ---------- lente ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'gancho') return f < en('vendio') ? { focus: dist(C.pos, OJOS), cinf: 10 } : { focus: dist(C.pos, PIZ), cinf: 4 };
  if (S.id === 'promesa') return { focus: dist(C.pos, P), cinf: 2 };
  if (S.id === 'duda' || S.id === 'peor' || S.id === 'cta') return { focus: dist(C.pos, OJOS), cinf: 7 };
  return { focus: dist(C.pos, PIZ), cinf: 3 };
};

// ---------- la pizarra: lo que dibuja en cada frase (SOLO lo que dice el guion) ----------
const tr = (f, a, b) => q(clamp((f - a) / Math.max(1, b - a)), 2);
export const worldAt = (f) => {
  const S = shotAt(f);
  let pizarra;
  switch (S.id) {
    case 'gancho': case 'promesa': pizarra = { tema: 'vestido', k: tr(f, en('mismo'), en('caro') + 10), sube: tr(f, en('cinco'), en('caro')), vende: tr(f, en('vendio'), en('vendio') + 18) }; break;
    case 'catalogo': pizarra = { tema: 'catalogo', k: tr(f, en('mismo', 2), en('dolares', 2) + 8), gana: tr(f, en('49', 2), en('49', 2) + 20) }; break;
    case 'duda': pizarra = { tema: 'duda', k: tr(f, A.duda, en('cuadra') + 12) }; break;
    case 'ticket': case 'peor': pizarra = { tema: 'ticket', k: tr(f, en('ticket'), en('9,99') + 12), dos: tr(f, en('dos'), en('algo', 2) + 8) }; break;
    case 'coche': pizarra = { tema: 'coche', k: tr(f, en('coches'), en('millas') + 8), cuenta: f >= en('80') ? '80.000' : '79.999', cae: tr(f, en('cae'), en('cifra', 1)) }; break;
    case 'cerebro': pizarra = { tema: 'cerebro', k: tr(f, en('cerebro'), en('izquierdo') + 10) }; break;
    default: pizarra = { tema: 'nueves', k: tr(f, en('ticket', 2), en('cuentas') + 6) };
  }
  return { pizarra };
};

// ---------- el PROFESOR: gestos del kit (caras fijas que cambian en la palabra clave, idle siempre, impulso) ----------
const CLAVES = [ // 4-5 cambios de brazos, cada uno en su palabra
  { f: 0, L: 'hang', R: 'hang' }, { f: en('caro'), L: 'hip', R: 'open' }, { f: en('catalogo'), L: 'hip', R: 'point' },
  { f: A.duda, L: 'cross', R: 'cheek' }, { f: en('ticket'), L: 'hang', R: 'point' }, { f: A.cerebro, L: 'hip', R: 'temple' }, { f: A.cta, L: 'hip', R: 'thumb' },
];
const CARAS = [[0, 'stern'], [en('vendio'), 'grin'], [A.promesa, 'neutral'], [en('49', 2), 'grin'], [A.duda, 'cejas'], [en('cuadra'), 'stubborn'],
  [A.ticket, 'neutral'], [en('algo', 2), 'grin'], [A.peor, 'stern'], [en('golpe'), 'nervous'], [A.cerebro, 'neutral'], [en('izquierdo'), 'grin'], [en('vendio', 3), 'laugh'], [A.cta, 'grin']];
const caraEn = (f) => { let c = 'neutral'; for (const [fk, k] of CARAS) if (f >= fk) c = k; return c; };
const ASIENTE = GOLPES.map((w, i) => en(w, w === 'vendio' && i > 0 ? 3 : 1));
const asiente = (f) => { let h = 0; for (const g of ASIENTE) { const t = (f - (g - 3)) / 30; if (t >= 0 && t < 0.6) h += -6 * (1 - M.spring(t, 2.2, 6)) * Math.sign(Math.sin(t * Math.PI * 2.2) + 1e-6) * (t < 0.08 ? -0.4 : 1); } return h; };
const niega = (f) => { const a = en('cuadra') - 4; return f >= a && f <= a + 29 ? 7 * Math.sin(((f - a) / 29) * Math.PI * 3) * (1 - (f - a) / 40) : 0; };   // «no cuadra»: niega con la cabeza
const piso = (f) => { const a = en('golpe'); return f >= a && f < a + 4 ? 0.02 : 0; };                                                       // «de golpe»: pisotón
const risa = (f) => { const a = en('vendio', 3); return f >= a && f < a + 34 ? { tilt: -4 + 3 * Math.sin(f * 0.55), bob: Math.abs(Math.sin(f * 0.55)) * 0.022 } : { tilt: 0, bob: 0 }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = idle(f, 5), br = brazosEn(f, CLAVES, 10), rs = risa(f);
  const base = caraEn(f), fuerte = (BOCA[f] ?? 0) > 0.8;
  const expr = fuerte && !/laugh|grin/.test(base) ? 'relief_open' : base; // solo en lo más fuerte la boca se abre un instante
  const facing = S.id === 'duda' ? -0.25 : S.id === 'gancho' && f < en('vendio') ? 0 : 0.3;
  const op = { ...br, expr, facing, look: facing ? 0.5 : 0, seed: 5, blink: blinkAt(f, 5),
    tilt: q(id.tilt + rs.tilt, 1), headTilt: q(id.headTilt + niega(f) + asiente(f), 1), bob: q(id.bob + piso(f) + rs.bob, 3) };
  return [{ key: 'profe' + JSON.stringify(op), draw: (p) => T.romanFront(p, 'profesor', op), x: P[0], y: 0, z: P[2], s: SP, order: 3 }];
};

// ---------- efectos 2D (tarjetas): destello en «¡vendió más!», estrellas en el 49 ganador, polvo en «de golpe» ----------
const FX = (key, draw, pos, s = 1, o = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 4, noInk: true, ...o });
export const fxAt = (f, T) => {
  const out = [];
  const v = en('vendio'); if (f >= v && f < v + 14) { const t = q((f - v) / 14, 2); out.push(FX('burst' + t, (p) => { p.g.translate(0, -120); T.fxBurst(p, t, '#fff3b0', 12, 40, 240); }, [PIZ[0], 1.2, PIZ[2] + 0.4], 1.2, { add: true })); }
  const g = en('49', 2); if (f >= g && f < g + 24) { const t = q((f - g) / 24, 2); out.push(FX('stars' + t, (p) => T.fxStars(p, t), [PIZ[0] + 0.1, 1.9, PIZ[2] + 0.3], 0.9)); }
  const c = en('golpe'); if (f >= c && f < c + 20) { const k = q((f - c) / 20, 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k), [P[0], 0, P[2] + 0.2], 0.9, { alpha: 0.8 })); }
  return out;
};
