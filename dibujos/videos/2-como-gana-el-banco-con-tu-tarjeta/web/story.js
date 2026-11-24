// VÍDEO 2: «Cómo gana el banco con tu tarjeta» — planos atados a cada PALABRA de la voz real (web/tiempos.js).
// SIN pizarra (el guion no la nombra): lo que dice la voz PASA en el decorado — la clienta paga con tarjeta en el datáfono,
// las monedas de la comisión vuelan de la tienda al banco, las etiquetas de precio suben, los sacos de dinero crecen
// delante del banco, el billete del efectivo se va volando y las estrellas de puntos van a quien paga con tarjeta.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';
import { brazosEn } from './gestos.js';
import { PAL, TOTAL_VOZ } from './tiempos.js';
import { BOCA } from './boca.js';
import { INSERTOS } from './insertos.js';
export const FPS = 30, TOTAL = TOTAL_VOZ;

const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');
/** fotograma en que EMPIEZA la n-ésima vez que suena `w` (una o varias palabras seguidas): en('pues no') */
export const en = (w, n = 1) => {
  const ks = w.split(/\s+/).map(norm); let c = 0;
  for (let i = 0; i + ks.length <= PAL.length; i++) if (ks.every((k, j) => norm(PAL[i + j][0]).startsWith(k)) && ++c === n) return PAL[i][1];
  console.log('ERR palabra no encontrada: ' + w); return 0;
};

// ---------- planos (cada uno empieza en una palabra del guion) ----------
const A = { gancho: 0, promesa: en('al final'), comision: en('cuando'), cifra: en('solo'), forma: en('pero esa'), cuotas: en('y eso incluye'),
  raro: en('pero aqui'), precios: en('porque'), fed: en('la reserva'), cadena: en('usas bien'), cta: en('y tu') };
export const SHOTS = [
  { id: 'gancho', light: 'dentro' }, { id: 'promesa', light: 'calle' }, { id: 'comision', light: 'dentro' }, { id: 'cifra', light: 'dentro' },
  { id: 'forma', light: 'nube' }, { id: 'cuotas', light: 'calle' }, { id: 'raro', light: 'dentro' }, { id: 'precios', light: 'dentro' },
  { id: 'fed', light: 'dentro' }, { id: 'cadena', light: 'dorada' }, { id: 'cta', light: 'dentro' },
].map((s, i, L) => ({ ...s, a: A[s.id], b: i + 1 < L.length ? A[L[i + 1].id] - 1 : TOTAL - 1 }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
const fuera = (S) => S.id === 'promesa' || S.id === 'cuotas' || S.id === 'cadena';

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
const CLI = [2.35, 0, -0.15], TEN = [4.95, 0, -0.95], DAT = [3.4, 1.05, -0.65];
const CLI_F = [58.4, 0, -2.9], TEN_F = [57.1, 0, -4.3];
const OJOS = [CLI[0], 1.27, CLI[2]], BANCO_F = [63.5, 1.6, 6.2];
const CAJA = [3.4, 1.05, -0.8], ESTANTES = [-0.6, 1.2, -2.0];

// ---------- cámaras (cuerpo entero o de rodillas arriba; cara a pantalla completa solo en el gancho) ----------
const CAMS = {
  gancho: [{ f: 0, pos: [-0.25, 1.75, 2.75], look: DAT, fov: 46 },                                    // la clienta paga con tarjeta en el datáfono
    { f: en('aunque') - 4, pos: [1.5, 1.5, 0.9], look: DAT, fov: 38 },
    { f: en('aunque') - 3, pos: [2.05, 1.3, 1.25], look: OJOS, fov: 36 },                              // ÚNICO primer plano: «…aunque nunca pagues intereses!»
    { f: A.promesa - 1, pos: [2.1, 1.3, 1.05], look: OJOS, fov: 33 }],
  promesa: [{ f: A.promesa, pos: [62.5, 1.7, 3.6], look: [56.5, 2.0, -5.5], fov: 52 },                     // la calle: la tienda…
    { f: en('tarjeta'), pos: [58.5, 1.7, -3.0], look: [63.5, 2.8, 7], fov: 54 }, { f: A.comision - 1, pos: [58.8, 1.7, -3.3], look: [63.5, 2.9, 7], fov: 52 }],   // …y el banco enfrente
  comision: [{ f: A.comision, pos: [-0.6, 1.85, 3.2], look: CAJA, fov: 48 },                                // la caja: la clienta paga, la tendera cobra
    { f: en('comision'), pos: [-0.1, 1.75, 2.6], look: CAJA, fov: 44, ease: 'easeOut' }, { f: A.cifra - 1, pos: [0.0, 1.75, 2.5], look: CAJA, fov: 43 }],
  cifra: [{ f: A.cifra, pos: [-0.6, 1.5, 3.4], look: ESTANTES, fov: 46 }, { f: A.forma - 1, pos: [-0.8, 1.45, 2.8], look: [-0.8, 1.25, -2.0], fov: 42 }],   // las estanterías
  forma: [{ f: A.forma, pos: [1.0, 1.45, 2.2], look: [2.7, 1.1, -0.5], fov: 44 }, { f: A.cuotas - 1, pos: [1.3, 1.42, 1.8], look: [2.7, 1.1, -0.5], fov: 40 }],
  cuotas: [{ f: A.cuotas, pos: [55.8, 1.6, -4.4], look: [60.3, 1.7, -0.4], fov: 56 },                          // detrás de la clienta: lo que paga se va al banco
    { f: A.raro - 1, pos: [55.8, 1.6, -4.4], look: [59.8, 1.6, -1.1], fov: 52 }],
  raro: [{ f: A.raro, pos: [0.3, 0.75, 2.6], look: [3.4, 1.35, -0.8], fov: 48, roll: -3 }, { f: A.precios - 1, pos: [0.55, 0.8, 2.3], look: [3.4, 1.35, -0.8], fov: 46, roll: -2 }],   // contrapicado
  precios: [{ f: A.precios, pos: [-0.6, 1.5, 3.2], look: ESTANTES, fov: 46 }, { f: en('pagamos') - 2, pos: [-0.9, 1.45, 2.6], look: [-0.9, 1.25, -2.0], fov: 42 },   // las etiquetas suben
    { f: en('pagamos') + 8, pos: [-0.3, 1.6, 2.9], look: [3.2, 1.1, -0.7], fov: 46, ease: 'easeOut' }, { f: A.fed - 1, pos: [-0.1, 1.6, 2.7], look: [3.2, 1.1, -0.7], fov: 45 }],
  fed: [{ f: A.fed, pos: [-0.3, 1.6, 2.9], look: [3.2, 1.1, -0.7], fov: 46 }, { f: A.cadena - 1, pos: [0.0, 1.6, 2.6], look: [3.2, 1.1, -0.7], fov: 44 }],   // el efectivo
  cadena: [{ f: A.cadena, pos: [62.5, 1.8, 3.8], look: [56.5, 1.8, -5.5], fov: 50 },                     // la tienda: las monedas salen…
    { f: en('aun asi'), pos: [58.5, 1.8, -3.2], look: [63.5, 2.8, 7], fov: 54, ease: 'easeOut' }, { f: A.cta - 1, pos: [58.8, 1.8, -3.4], look: [63.5, 2.9, 7], fov: 52 }],   // …y entran en el banco
  cta: [{ f: A.cta, pos: [-0.2, 1.6, 2.8], look: [3.0, 1.1, -0.6], fov: 46 }, { f: TOTAL - 1, pos: [0.3, 1.55, 2.3], look: [3.0, 1.12, -0.6], fov: 43 }],
};
const FL = en('intereses');
const KICKS = [{ f: en('intereses'), a: 0.03 }, { f: en('172'), a: 0.03 }, { f: en('raro'), a: 0.03 }, { f: en('149'), a: 0.03 }, { f: en('gana', 2), a: 0.03 }];
const ZOOMS = [[en('intereses'), 0.12], [en('172'), 0.14], [en('149'), 0.14], [en('rentable'), 0.1]];
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  for (const [z, k] of ZOOMS) { const d = f - (z - 2); if (d >= 0 && d < 16) c.fov *= 1 - k * (d < 3 ? M.easeOut(d / 3) : 1 - M.smooth((d - 3) / 13)); }
  { const de = S.b - f, ds = f - S.a, AMP = 0.5; let w = 0;   // barrido rápido entre planos
    if (de < 4 && S.b !== TOTAL - 1) w = Math.pow((4 - de) / 4, 2) * AMP; else if (ds < 4 && S.a !== 0) w = -Math.pow((4 - ds) / 4, 2) * AMP;
    if (w) { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], L = Math.hypot(dx, dz) || 1, D = Math.hypot(dx, c.look[1] - c.pos[1], dz);
      c.look = [c.look[0] - dz / L * w * D, c.look[1], c.look[2] + dx / L * w * D]; c.roll = (c.roll || 0) + w * 10; } }
  c.flash = f >= FL && f < FL + 3 ? 0.18 * (1 - (f - FL) / 3) : 0;
  c.shadowAt = fuera(S) ? [60, 1, 0] : [2, 1, -0.8];
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (insertoAt(f)) return { focus: D_INS, cinf: 6 };
  if (S.id === 'gancho') return f < en('aunque') - 3 ? { focus: dist(C.pos, DAT), cinf: 9 } : { focus: dist(C.pos, OJOS), cinf: 9 };
  if (S.id === 'forma' || S.id === 'raro' || S.id === 'cta') return { focus: dist(C.pos, OJOS), cinf: 6 };
  if (S.id === 'cuotas') return { focus: dist(C.pos, CLI_F), cinf: 3 };
  if (fuera(S)) return { focus: dist(C.pos, C.look), cinf: 2 };
  return { focus: dist(C.pos, C.look), cinf: 4 };
};

// ---------- el decorado reacciona a la voz ----------
const tr = (f, a, b) => q(clamp((f - a) / Math.max(1, b - a)), 2);
export const worldAt = (f) => ({
  precios: f >= A.precios ? tr(f, en('mete'), en('precios') + 10) : 0,   // «la tienda las mete en sus precios»: las etiquetas suben
  sacos: tr(f, en('172'), en('2023') + 10),                               // los sacos de las comisiones delante del banco
});

// ---------- reparto: SOLO la clienta y la tendera (las nombra el guion). Gestos del kit: caras fijas que cambian en la palabra clave ----------
const CLAVES_C = [{ f: 0, L: 'hang', R: 'reach' }, { f: en('aunque'), L: 'hip', R: 'open' }, { f: A.forma, L: 'cross', R: 'cheek' }, { f: en('cuotas'), L: 'hang', R: 'hold' },
  { f: A.raro, L: 'hip', R: 'point' }, { f: en('pagamos') - 6, L: 'cheek', R: 'hang' }, { f: A.fed, L: 'hang', R: 'hold' }, { f: en('pierde'), L: 'temple', R: 'hang' },
  { f: A.cadena, L: 'hip', R: 'beat' }, { f: A.cta, L: 'hip', R: 'thumb' }];
const CARAS_C = [[0, 'neutral'], [en('aunque'), 'stern'], [A.promesa, 'cejas'], [A.forma, 'cejas'], [en('cuotas'), 'nervous'], [A.raro, 'stern'],
  [en('pagamos'), 'nervous'], [A.fed, 'neutral'], [en('pierde'), 'nervous'], [A.cadena, 'stubborn'], [en('gana', 2), 'stern'], [A.cta, 'grin']];
const CLAVES_T = [{ f: 0, L: 'hang', R: 'belly' }, { f: en('comision'), L: 'hip', R: 'wave' }, { f: en('mete'), L: 'hip', R: 'point' }];
const CARAS_T = [[0, 'grin'], [en('comision'), 'neutral'], [en('mete'), 'grin']];
const caraEn = (L, f) => { let c = 'neutral'; for (const [fk, k] of L) if (f >= fk) c = k; return c; };
const ASIENTE = ['intereses', 'llega', '172', 'mas', 'raro', 'todos', '149', 'gana'].map((w) => en(w));
const asiente = (f) => { let h = 0; for (const g of ASIENTE) { const t = (f - (g - 3)) / 30; if (t >= 0 && t < 0.6) h += -6 * (1 - M.spring(t, 2.2, 6)) * Math.sign(Math.sin(t * Math.PI * 2.2) + 1e-6) * (t < 0.08 ? -0.4 : 1); } return h; };
const niega = (f) => { const a = en('rentable') + 4; return f >= a && f <= a + 29 ? 7 * Math.sin(((f - a) / 29) * Math.PI * 3) * (1 - (f - a) / 40) : 0; };   // «sigues siendo rentable…»
const piso = (f) => { const a = en('pagamos'); return f >= a && f < a + 4 ? 0.02 : 0; };                                                          // pisotón
const card = (who, seed, f, claves, caras, extra = {}) => {
  const id = idle(f, seed), br = brazosEn(f, claves, 10);
  return { ...br, expr: caraEn(caras, f), seed, blink: blinkAt(f, seed), tilt: q(id.tilt, 1), headTilt: q(id.headTilt, 1), bob: q(id.bob, 3), ...extra };
};
export const actorsAt = (f, T) => {
  const S = shotAt(f), out = [];
  const oc = card('clienta', 8, f, CLAVES_C, CARAS_C);
  if ((BOCA[f] ?? 0) > 0.8 && S.id !== 'gancho' && !/laugh|grin|stern/.test(oc.expr)) oc.expr = 'relief_open';
  oc.headTilt = q(oc.headTilt + niega(f) + asiente(f), 1); oc.bob = q(oc.bob + piso(f), 3);
  oc.facing = S.id === 'gancho' && f >= en('aunque') - 3 ? 0 : S.id === 'cuotas' ? 0.6 : fuera(S) ? 0.35 : -0.5; oc.look = oc.facing ? oc.facing * 1.2 : 0;
  const cp = fuera(S) ? CLI_F : CLI;
  out.push({ key: 'cli' + JSON.stringify(oc), draw: (p) => T.romanFront(p, 'clienta', oc), x: cp[0], y: 0, z: cp[2], s: SP * 0.96, order: 3 });
  const ot = card('tendera', 11, f, CLAVES_T, CARAS_T, { facing: 0.4, look: 0.5 });
  const tp = fuera(S) ? TEN_F : TEN;
  out.push({ key: 'ten' + JSON.stringify(ot), draw: (p) => T.romanFront(p, 'tendera', ot), x: tp[0], y: 0, z: tp[2], s: SP * 0.95, order: 3 });
  return out;
};

// ---------- efectos 2D: monedas de la comisión, billete que se va, estrellas de puntos, destellos ----------
const FX = (key, draw, pos, s = 1, o = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 4, noInk: true, ...o });
const moneda = (p) => { p.ell(300, 500, 70, 70, '#e2b544', 10); p.ell(300, 500, 46, 46, '#f2d36a', 6); };
const billete = (p) => { p.poly([[170, 440], [430, 440], [430, 570], [170, 570]], '#8fcf8f', 10); p.ell(300, 505, 38, 38, '#bfe8bf', 6); };
const lerp3 = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
// INSERTOS DE DATOS (solo cifras que dice el guion): una tarjeta delante de la cámara mientras la voz canta la cifra
const miles = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const INS = () => [
  { a: en('172'), b: en('2023') + 24, tipo: 'contador', s: 0.6, up: 0.12, o: (t) => ({ texto: miles(172000 * M.easeOut(t)), etiqueta: 'millones de dólares', color: '#ffd23a' }) },
  { a: en('149'), b: A.cadena - 4, tipo: 'contador', s: 0.5, up: 0.5, o: (t) => ({ texto: '−' + miles(149 * M.easeOut(clamp(t * 1.6))), etiqueta: 'dólares al año', color: '#ff6a4a' }) },
];
const insertoAt = (f) => { for (const I of INS()) if (f >= I.a - 2 && f <= I.b) return I; return null; };
const D_INS = 2.2;
const fxInserto = (f) => {
  const I = insertoAt(f); if (!I) return null;
  const C = camAt(f), dx = C.look[0] - C.pos[0], dy = C.look[1] - C.pos[1], dz = C.look[2] - C.pos[2], L = Math.hypot(dx, dy, dz);
  const s = I.s, c = C.pos.map((v, i) => v + [dx, dy, dz][i] / L * D_INS);
  const ent = clamp((f - I.a + 2) / 8), sal = clamp((I.b - f) / 5), k = q(M.spring(ent, 2.4, 7) * (sal < 1 ? M.smooth(sal) : 1), 2);
  const o = { ...I.o(clamp((f - I.a) / 30), f), k: Math.max(0.01, k) };
  return FX('ins' + I.a + JSON.stringify(o), (p) => INSERTOS[I.tipo](p, o), [c[0], c[1] - 2.25 * s * 0.5 + I.up, c[2]], s, { noInk: false, order: 6 });
};
const S_ = (f) => shotAt(f).id;
const vuelo = (out, id, f, f0, f1, de, a, n, alto, s) => { if (f < f0 || f > f1) return;
  for (let i = 0; i < n; i++) { const t = q(((f - f0) / 40 + i / n) % 1, 2); out.push(FX(id + i + t, moneda, lerp3(de, a, t).map((v, k) => k === 1 ? v + Math.sin(t * Math.PI) * alto : v), s)); } };
export const fxAt = (f, T) => {
  const out = [];
  { const ins = fxInserto(f); if (ins) out.push(ins); }
  // «la tienda paga una comisión. Y una parte llega a tu banco»: monedas del datáfono que se van por la ventana
  vuelo(out, 'mon', f, en('comision'), A.cifra - 1, [DAT[0], 1.1, DAT[2]], [-5.4, 2.4, 0.9], 6, 0.8, 0.4);
  // «cuotas de manejo… anualidades… intereses»: de la clienta al banco, una tanda en cada palabra
  if (S_(f) === 'cuotas') for (const w of [en('cuotas'), en('anualidades'), en('intereses', 2)]) if (f >= w && f < w + 34) { const t = q((f - w) / 34, 2);
    for (let i = 0; i < 4; i++) { const ti = clamp(t * 1.3 - i * 0.1); if (ti > 0 && ti < 1) out.push(FX('cu' + w + i + ti, moneda, lerp3([CLI_F[0] + 0.2, 1.1, CLI_F[2] + 0.3], BANCO_F, ti).map((v, k) => k === 1 ? v + Math.sin(ti * Math.PI) * 2.0 : v), 0.8)); } }
  // «Usas bien tu crédito… y aun así, tu banco gana»: las monedas salen de la tienda y entran en el banco
  if (S_(f) === 'cadena') vuelo(out, 'monf', f, A.cadena, A.cta - 1, [57, 1.4, -5.2], BANCO_F, 10, 2.2, 0.9);
  // «un hogar que paga en efectivo pierde unos 149 dólares al año»: el billete se le va volando a la clienta
  const b0 = en('149');
  if (f >= b0 && f < A.cadena) { const t = q(Math.min(1, (f - b0) / 40), 2); out.push(FX('bil' + t, billete, [CLI[0] + 0.2 + t * 1.2, 1.2 + t * 1.6, CLI[2] + 0.2], 0.35, { roll: t * 2 })); }
  // destello en «¡…intereses!» y polvo en el pisotón de «las pagamos todos»
  const v = en('intereses'); if (f >= v && f < v + 12) { const t = q((f - v) / 12, 2); out.push(FX('burst' + t, (p) => { p.g.translate(0, -120); T.fxBurst(p, t, '#fff3b0', 12, 40, 240); }, [OJOS[0], 0.6, OJOS[2] - 0.3], 1.2, { add: true })); }
  const c = en('pagamos'); if (f >= c && f < c + 20) { const k = q((f - c) / 20, 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k), [CLI[0], 0, CLI[2] + 0.2], 0.9, { alpha: 0.8 })); }
  return out;
};
