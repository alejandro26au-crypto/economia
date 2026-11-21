// VÍDEO 2: «Cómo gana el banco con tu tarjeta» — planos atados a cada PALABRA (web/tiempos.js; estimados hasta la voz).
// SIN pizarra (el guion no la nombra): lo que dice la voz PASA en el decorado — la clienta paga con tarjeta en el datáfono,
// las monedas de la comisión vuelan de la tienda al banco, las etiquetas de precio suben, los sacos de dinero crecen
// delante del banco, el billete del efectivo se va volando y las estrellas de puntos van a quien paga con tarjeta.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';
import { brazosEn } from './gestos.js';
import { PAL, TOTAL_VOZ } from './tiempos.js';
import { BOCA } from './boca.js';
export const FPS = 30, TOTAL = TOTAL_VOZ;

const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');
/** fotograma en que EMPIEZA la n-ésima vez que suena `w` (una o varias palabras seguidas): en('pues no') */
export const en = (w, n = 1) => {
  const ks = w.split(/\s+/).map(norm); let c = 0;
  for (let i = 0; i + ks.length <= PAL.length; i++) if (ks.every((k, j) => norm(PAL[i + j][0]).startsWith(k)) && ++c === n) return PAL[i][1];
  console.log('ERR palabra no encontrada: ' + w); return 0;
};

// ---------- planos ----------
const A = { gancho: 0, promesa: en('te explico'), comision: en('cada'), quien: en('y quién'), tu: en('pues tú'), peor: en('y aún'),
  efectivo: en('pues no'), cadena: en('ese es'), cta: en('y tú') };
export const SHOTS = [
  { id: 'gancho', light: 'dentro' }, { id: 'promesa', light: 'calle' }, { id: 'comision', light: 'dentro' }, { id: 'quien', light: 'dentro' },
  { id: 'tu', light: 'dentro' }, { id: 'peor', light: 'nube' }, { id: 'efectivo', light: 'dentro' }, { id: 'cadena', light: 'dorada' }, { id: 'cta', light: 'dentro' },
].map((s, i, L) => ({ ...s, a: A[s.id], b: i + 1 < L.length ? A[L[i + 1].id] - 1 : TOTAL - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const fuera = (S) => S.id === 'promesa' || S.id === 'cadena';

// ---------- luces: la de día de los romanos; dentro, el sol alto por la ventana ----------
const DIA = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  calle: DIA,
  dentro: { ...DIA, az: 200, el: 66, hemi: 1.25, sky: '#ffe9cc', sunI: 2.2, vig: 0.26, shadowExt: 9 },
  nube: { ...DIA, az: 200, el: 66, sky: '#c8ccd8', hemi: 1.05, sun: '#e8ecf4', sunI: 1.4, sat: 0.95, vig: 0.38, shadowExt: 9 },
  dorada: { az: 250, el: 16, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.24, shadowExt: 18 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- posiciones (dentro: la caja en (3.1, -0.9); fuera: la calle en x = 60) ----------
const SP = 0.82;
const PROF = [0.9, 0, -1.0], CLI = [2.35, 0, -0.15], TEN = [4.55, 0, -1.35], DAT = [3.4, 1.05, -0.65];
const PROF_F = [60.5, 0, 0.6], CLI_F = [57.0, 0, -3.6];
const OJOS = [PROF[0], 1.33, PROF[2]], TIENDA_F = [56, 1.6, -5.9], BANCO_F = [63.5, 2.0, 6.8];

// ---------- cámaras (personajes de cuerpo entero o de rodillas arriba; cara grande solo en el gancho) ----------
const CAMS = {
  gancho: [{ f: 0, pos: [3.9, 1.35, 0.35], look: DAT, fov: 34 },                                    // la tarjeta en el datáfono: «Pagas tu tarjeta…»
    { f: en('banco') - 4, pos: [3.7, 1.4, 0.6], look: [3.2, 1.1, -0.8], fov: 40 },
    { f: en('banco') - 3, pos: [1.0, 1.38, 0.3], look: OJOS, fov: 36 },                                // ÚNICO primer plano: «¡Y el banco gana IGUAL!»
    { f: A.promesa - 1, pos: [1.0, 1.38, 0.15], look: OJOS, fov: 33 }],
  promesa: [{ f: A.promesa, pos: [62.5, 1.7, 3.6], look: [56.5, 2.0, -5.5], fov: 52 },                     // la calle: primero la tienda…
    { f: en('centavo'), pos: [58.5, 1.7, -3.0], look: [63.5, 2.8, 7], fov: 54 }, { f: A.comision - 1, pos: [58.8, 1.7, -3.3], look: [63.5, 2.9, 7], fov: 52 }],   // …y el banco enfrente
  comision: [{ f: A.comision, pos: [1.4, 1.6, 3.4], look: [2.6, 1.0, -0.8], fov: 44 },                     // la caja: la clienta paga, la tendera cobra
    { f: en('comision'), pos: [2.0, 1.55, 2.6], look: [3.0, 1.05, -0.8], fov: 42, ease: 'easeOut' }, { f: A.quien - 1, pos: [2.1, 1.55, 2.4], look: [3.0, 1.05, -0.8], fov: 41 }],
  quien: [{ f: A.quien, pos: [-1.6, 0.85, 2.0], look: [1.0, 1.4, -1.0], fov: 44, roll: -3 }, { f: A.tu - 1, pos: [-1.3, 0.9, 1.8], look: [1.0, 1.4, -1.0], fov: 42, roll: -2 }],
  tu: [{ f: A.tu, pos: [2.0, 1.4, 2.6], look: [2.3, 1.1, -0.2], fov: 44 },                                   // «Pues tú»: la clienta
    { f: en('172'), pos: [-0.6, 1.5, 3.4], look: [-0.6, 1.2, -2.0], fov: 46, ease: 'easeOut' },            // las estanterías: los precios
    { f: A.peor - 1, pos: [-0.8, 1.45, 2.8], look: [-0.8, 1.25, -2.0], fov: 42 }],
  peor: [{ f: A.peor, pos: [4.6, 1.7, 1.6], look: [3.2, 1.0, -0.9], fov: 42 }, { f: A.efectivo - 1, pos: [4.2, 1.6, 1.1], look: [3.2, 1.05, -0.8], fov: 38 }],
  efectivo: [{ f: A.efectivo, pos: [1.6, 1.5, 3.9], look: [1.7, 1.1, -0.6], fov: 46 },                    // la clienta (efectivo) y el profesor (tarjeta)
    { f: A.cadena - 1, pos: [1.6, 1.5, 3.4], look: [1.7, 1.1, -0.6], fov: 44 }],
  cadena: [{ f: A.cadena, pos: [62.5, 1.8, 3.8], look: [56.5, 1.8, -5.5], fov: 50 },                     // la tienda: las monedas salen…
    { f: en('banco cobra') + 25, pos: [58.5, 1.8, -3.2], look: [63.5, 2.8, 7], fov: 54, ease: 'easeOut' },   // …y entran en el banco
    { f: en('puntos'), pos: [61.6, 1.6, -2.6], look: [60.4, 1.2, 0.6], fov: 44 }, { f: A.cta - 1, pos: [61.4, 1.6, -2.4], look: [60.4, 1.22, 0.6], fov: 42 }],
  cta: [{ f: A.cta, pos: [1.2, 1.35, 2.4], look: [0.9, 1.15, -1.0], fov: 42 }, { f: TOTAL - 1, pos: [1.1, 1.35, 2.0], look: [0.9, 1.18, -1.0], fov: 40 }],
};
const KICKS = [{ f: en('igual'), a: 0.03 }, { f: en('172'), a: 0.03 }, { f: en('peor'), a: 0.03 }, { f: en('149'), a: 0.03 }, { f: en('1133'), a: 0.03 }];
const ZOOMS = [[en('igual'), 0.12], [en('172'), 0.14], [en('149'), 0.14], [en('1133'), 0.14], [en('intereses', 2), 0.1]];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  for (const [z, k] of ZOOMS) { const d = f - (z - 2); if (d >= 0 && d < 16) c.fov *= 1 - k * (d < 3 ? M.easeOut(d / 3) : 1 - M.smooth((d - 3) / 13)); }
  { const de = S.b - f, ds = f - S.a, AMP = 0.5; let w = 0;   // barrido rápido entre planos
    if (de < 4 && S.b !== TOTAL - 1) w = Math.pow((4 - de) / 4, 2) * AMP; else if (ds < 4 && S.a !== 0) w = -Math.pow((4 - ds) / 4, 2) * AMP;
    if (w) { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], L = Math.hypot(dx, dz) || 1, D = Math.hypot(dx, c.look[1] - c.pos[1], dz);
      c.look = [c.look[0] - dz / L * w * D, c.look[1], c.look[2] + dx / L * w * D]; c.roll = (c.roll || 0) + w * 10; } }
  c.flash = f >= en('igual') && f < en('igual') + 3 ? 0.18 * (1 - (f - en('igual')) / 3) : 0;
  c.shadowAt = fuera(S) ? [60, 1, 0] : [2, 1, -0.8];
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'gancho') return f < en('banco') - 3 ? { focus: dist(C.pos, DAT), cinf: 9 } : { focus: dist(C.pos, OJOS), cinf: 9 };
  if (S.id === 'peor') return { focus: dist(C.pos, DAT), cinf: 6 };
  if (S.id === 'quien' || S.id === 'cta') return { focus: dist(C.pos, OJOS), cinf: 7 };
  if (fuera(S)) return { focus: dist(C.pos, C.look), cinf: 2 };
  return { focus: dist(C.pos, C.look), cinf: 4 };
};

// ---------- el decorado reacciona a la voz ----------
const tr = (f, a, b) => q(clamp((f - a) / Math.max(1, b - a)), 2);
export const worldAt = (f) => ({
  precios: f < A.peor ? tr(f, en('acaban'), en('precios') + 10) : 0,   // «¡Y acaban en tus precios!»: las etiquetas suben
  sacos: f >= A.cadena ? 1 : tr(f, en('172'), en('2023') + 10),
});

// ---------- reparto: gestos del kit (caras fijas que cambian en la palabra clave, idle, impulso) ----------
const CLAVES_P = [{ f: 0, L: 'hang', R: 'hang' }, { f: en('igual'), L: 'hip', R: 'open' }, { f: A.quien, L: 'cross', R: 'cheek' },
  { f: A.tu, L: 'hang', R: 'point' }, { f: en('1133'), L: 'hip', R: 'hold' }, { f: A.cadena, L: 'hip', R: 'beat' }, { f: A.cta, L: 'hip', R: 'thumb' }];
const CARAS_P = [[0, 'neutral'], [en('igual'), 'stern'], [A.promesa, 'cejas'], [A.quien, 'cejas'], [A.tu, 'stern'], [en('peor'), 'stern'],
  [en('pues no'), 'stubborn'], [en('1133'), 'grin'], [A.cadena, 'neutral'], [en('contigo'), 'laugh'], [A.cta, 'grin']];
const CLAVES_C = [{ f: 0, L: 'hang', R: 'reach' }, { f: en('banco', 2) + 10, L: 'hang', R: 'hang' }, { f: en('precios') - 6, L: 'cheek', R: 'hang' },
  { f: A.efectivo, L: 'hang', R: 'hold' }, { f: en('menos'), L: 'temple', R: 'hang' }];
const CARAS_C = [[0, 'neutral'], [A.tu, 'cejas'], [en('precios'), 'nervous'], [A.efectivo, 'neutral'], [en('menos'), 'nervous']];
const caraEn = (L, f) => { let c = 'neutral'; for (const [fk, k] of L) if (f >= fk) c = k; return c; };
const ASIENTE = ['igual', 'centavo', 'pues tú', '172', 'precios', 'peor', '149', '1133', 'contigo'].map((w) => en(w));
const asiente = (f) => { let h = 0; for (const g of ASIENTE) { const t = (f - (g - 3)) / 30; if (t >= 0 && t < 0.6) h += -6 * (1 - M.spring(t, 2.2, 6)) * Math.sign(Math.sin(t * Math.PI * 2.2) + 1e-6) * (t < 0.08 ? -0.4 : 1); } return h; };
const niega = (f) => { const a = en('pues no') + 6; return f >= a && f <= a + 29 ? 7 * Math.sin(((f - a) / 29) * Math.PI * 3) * (1 - (f - a) / 40) : 0; };   // «Pues no»
const piso = (f) => { const a = en('precios'); return f >= a && f < a + 4 ? 0.02 : 0; };                                                           // pisotón
const risa = (f) => { const a = en('contigo'); return f >= a && f < a + 34 ? { tilt: -4 + 3 * Math.sin(f * 0.55), bob: Math.abs(Math.sin(f * 0.55)) * 0.022 } : { tilt: 0, bob: 0 }; };
const card = (who, seed, f, claves, caras, extra = {}) => {
  const id = idle(f, seed), br = brazosEn(f, claves, 10);
  return { ...br, expr: caraEn(caras, f), seed, blink: blinkAt(f, seed), tilt: q(id.tilt, 1), headTilt: q(id.headTilt, 1), bob: q(id.bob, 3), ...extra };
};
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [], rs = risa(f);
  const fuerte = (BOCA[f] ?? 0) > 0.8;
  const op = card('profesor', 5, f, CLAVES_P, CARAS_P);
  if (fuerte && !/laugh|grin/.test(op.expr)) op.expr = 'relief_open';
  op.headTilt = q(op.headTilt + niega(f) + asiente(f), 1); op.tilt = q(op.tilt + rs.tilt, 1); op.bob = q(op.bob + piso(f) + rs.bob, 3);
  op.facing = S.id === 'quien' ? -0.25 : S.id === 'gancho' ? 0 : 0.3; op.look = op.facing ? 0.5 : 0;
  const pp = fuera(S) ? PROF_F : PROF;
  out.push({ key: 'profe' + JSON.stringify(op), draw: (p) => T.romanFront(p, 'profesor', op), x: pp[0], y: 0, z: pp[2], s: SP, order: 3 });
  const oc = card('clienta', 8, f, CLAVES_C, CARAS_C, { facing: -0.5, look: -0.6 });
  const cp = fuera(S) ? CLI_F : CLI;
  out.push({ key: 'cli' + JSON.stringify(oc), draw: (p) => T.romanFront(p, 'clienta', oc), x: cp[0], y: 0, z: cp[2], s: SP * 0.96, order: 3 });
  if (!fuera(S)) { const ot = card('tendera', 11, f, [{ f: 0, L: 'hang', R: 'belly' }, { f: en('comision'), L: 'hip', R: 'wave' }], [[0, 'grin'], [en('comision'), 'neutral']], { facing: 0.4, look: 0.5 });
    out.push({ key: 'ten' + JSON.stringify(ot), draw: (p) => T.romanFront(p, 'tendera', ot), x: TEN[0], y: 0, z: TEN[2], s: SP * 0.95, order: 3 }); }
  return out;
};

// ---------- efectos 2D: monedas de la comisión, billete que se va, estrellas de puntos, destellos ----------
const FX = (key, draw, pos, s = 1, o = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 4, noInk: true, ...o });
const moneda = (p) => { p.ell(300, 500, 70, 70, '#e2b544', 10); p.ell(300, 500, 46, 46, '#f2d36a', 6); };
const billete = (p) => { p.poly([[170, 440], [430, 440], [430, 570], [170, 570]], '#8fcf8f', 10); p.ell(300, 505, 38, 38, '#bfe8bf', 6); };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
export const fxAt = (f, T) => {
  const out = [];
  // la comisión: monedas que salen del datáfono y se van por la ventana (dentro) — «la tienda paga una comisión. Y parte va a tu banco»
  const c0 = en('comision');
  if (f >= c0 && f < A.quien) for (let i = 0; i < 6; i++) { const t = q(((f - c0) / 40 + i / 6) % 1, 2);
    out.push(FX('mon' + i + t, moneda, lerp3([DAT[0], 1.1, DAT[2]], [-5.4, 2.4, 0.9], t).map((v, k) => k === 1 ? v + Math.sin(t * Math.PI) * 0.8 : v), 0.25)); }
  // fuera: las monedas salen de la tienda y entran en el banco — «El banco cobra a la tienda»
  const c1 = en('banco cobra');
  if (S_(f) === 'cadena' && f >= c1) for (let i = 0; i < 8; i++) { const t = q(((f - c1) / 45 + i / 8) % 1, 2);
    out.push(FX('monf' + i + t, moneda, lerp3([57, 1.4, -5.2], [63.5, 1.6, 6.2], t).map((v, k) => k === 1 ? v + Math.sin(t * Math.PI) * 2.2 : v), 0.45)); }
  // el efectivo: el billete se le va volando a la clienta — «unos 149 dólares menos al año»
  const b0 = en('149');
  if (f >= b0 && f < A.cadena) { const t = q(Math.min(1, (f - b0) / 40), 2); out.push(FX('bil' + t, billete, [CLI[0] + 0.2 + t * 1.2, 1.2 + t * 1.6, CLI[2] + 0.2], 0.35, { roll: t * 2 })); }
  // los puntos: estrellas para quien paga con tarjeta — «unos 1.133 más» / «vuelve en puntos»
  for (const [s0, pos] of [[en('1133'), [PROF[0], 1.6, PROF[2] + 0.2]], [en('puntos'), [PROF_F[0], 1.6, PROF_F[2] + 0.2]]]) if (f >= s0 && f < s0 + 30) { const t = q((f - s0) / 30, 2); out.push(FX('st' + s0 + t, (p) => T.fxStars(p, t), pos, 0.9)); }
  // destello en «¡IGUAL!»
  const v = en('igual'); if (f >= v && f < v + 12) { const t = q((f - v) / 12, 2); out.push(FX('burst' + t, (p) => { p.g.translate(0, -120); T.fxBurst(p, t, '#fff3b0', 12, 40, 240); }, [OJOS[0], 0.6, OJOS[2] - 0.3], 1.2, { add: true })); }
  const c = en('precios'); if (f >= c && f < c + 20) { const k = q((f - c) / 20, 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k), [CLI[0], 0, CLI[2] + 0.2], 0.9, { alpha: 0.8 })); }
  return out;
};
const S_ = (f) => shotAt(f).id;
