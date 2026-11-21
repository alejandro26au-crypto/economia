// PLANTILLA — planos atados a cada PALABRA de la voz (web/tiempos.js: PAL = [[palabra, f0, f1], …] a 30 fps).
// VÍDEO 2: «Cómo gana el banco con tu tarjeta». Con tiempos ESTIMADOS hasta que llega la voz:
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
const A = { gancho: 0, promesa: en('te explico'), comision: en('cada'), quien: en('y quién'), tu: en('pues tú'), peor: en('y aún'),
  efectivo: en('pues no'), cadena: en('ese es'), cta: en('y tú') };
export const SHOTS = [
  { id: 'gancho', light: 'dia' }, { id: 'promesa', light: 'dia' }, { id: 'comision', light: 'dia' }, { id: 'quien', light: 'tarde' },
  { id: 'tu', light: 'dia' }, { id: 'peor', light: 'nube' }, { id: 'efectivo', light: 'dia' }, { id: 'cadena', light: 'dorada' }, { id: 'cta', light: 'dorada' },
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
const PZ_ = (d = 0) => ({ pos: [0.2 + d * 0.05, 1.8, 3.4 - d], look: [0.85, 1.7, -2.3], fov: 44 }); // la pizarra entera (≈ 5,7 m)
const CAMS = {
  gancho: [{ f: 0, pos: [-0.5, 1.36, 0.45], look: OJOS, fov: 36 },                                   // ÚNICO primer plano de cara: el golpe del hook
    { f: en('igual') + 4, pos: [-0.52, 1.36, 0.3], look: OJOS, fov: 34 },
    { f: en('igual') + 16, pos: [0.1, 1.75, 4.4], look: [0.4, 1.35, -2.0], fov: 46, ease: 'easeOut' }],
  promesa: [{ f: A.promesa, pos: [3.6, 2.6, 6.6], look: [0.2, 0.7, -6], fov: 50 },                       // plano general: terraza, tienda y el valle
    { f: A.comision - 1, pos: [2.8, 2.3, 5.8], look: [0.4, 0.9, -5], fov: 48 }],
  comision: [{ f: A.comision, ...PZ_(0) }, { f: A.quien - 1, ...PZ_(0.3) }],
  quien: [{ f: A.quien, pos: [-3.6, 0.9, 2.4], look: [0.0, 1.5, -1.9], fov: 46, roll: -3 }, { f: A.tu - 1, pos: [-3.3, 0.95, 2.1], look: [0.0, 1.5, -1.9], fov: 44, roll: -2 }],
  tu: [{ f: A.tu, ...PZ_(0) }, { f: en('172'), ...PZ_(0.3), ease: 'easeOut' }, { f: A.peor - 1, ...PZ_(0.4) }],
  peor: [{ f: A.peor, pos: [6.2, 1.55, 1.8], look: [3.2, 1.0, -1.4], fov: 42 },                          // la tienda y su datáfono; el profesor al fondo
    { f: en('efectivo'), pos: [5.5, 1.55, 1.0], look: [3.5, 1.05, -1.3], fov: 40, ease: 'easeOut' }, { f: A.efectivo - 1, pos: [5.3, 1.52, 0.8], look: [3.55, 1.06, -1.25], fov: 38 }],
  efectivo: [{ f: A.efectivo, ...PZ_(0) }, { f: en('149'), ...PZ_(0.25), ease: 'easeOut' }, { f: A.cadena - 1, ...PZ_(0.4) }],
  cadena: [{ f: A.cadena, pos: [-0.9, 1.65, 4.8], look: [0.55, 1.45, -2.1], fov: 47 }, { f: A.cta - 1, pos: [-0.4, 1.66, 4.3], look: [0.6, 1.48, -2.1], fov: 46 }],
  cta: [{ f: A.cta, pos: [-0.2, 1.4, 2.6], look: [-0.45, 1.2, -1.5], fov: 42 }, { f: TOTAL - 1, pos: [-0.3, 1.4, 2.2], look: [-0.5, 1.22, -1.5], fov: 40 }],
};
const GOLPES = ['igual', 'centavo', 'pues tú', '172', 'precios', 'peor', '149', '1133', 'contigo'];
const KICKS = [{ f: en('igual'), a: 0.03 }, { f: en('172'), a: 0.03 }, { f: en('peor'), a: 0.03 }, { f: en('149'), a: 0.03 }, { f: en('1133'), a: 0.03 }];
// zoom de golpe en las cifras y los remates: [palabra, n, fuerza]
const ZOOMS = [['igual', 1, 0.12], ['172', 1, 0.14], ['149', 1, 0.14], ['1133', 1, 0.14], ['intereses', 2, 0.1]].map(([w, n, k]) => [en(w, n), k]);
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
  c.flash = f >= en('igual') && f < en('igual') + 3 ? 0.18 * (1 - (f - en('igual')) / 3) : 0;
  c.shadowAt = [0, 1, -1.5];
  return c;
};

// ---------- lente ----------
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => {
  const S = shotAt(f), C = camAt(f);
  if (S.id === 'gancho') return f < en('igual') + 10 ? { focus: dist(C.pos, OJOS), cinf: 10 } : { focus: dist(C.pos, PIZ), cinf: 4 };
  if (S.id === 'promesa') return { focus: dist(C.pos, P), cinf: 2 };
  if (S.id === 'peor') return { focus: dist(C.pos, [3.6, 1.06, -1.2]), cinf: 6 };
  if (S.id === 'quien' || S.id === 'cta') return { focus: dist(C.pos, OJOS), cinf: 7 };
  return { focus: dist(C.pos, PIZ), cinf: 3 };
};

// ---------- la pizarra: lo que dibuja en cada frase (SOLO lo que dice el guion) ----------
const tr = (f, a, b) => q(clamp((f - a) / Math.max(1, b - a)), 2);
export const worldAt = (f) => {
  const S = shotAt(f);
  let pizarra;
  switch (S.id) {
    case 'gancho': case 'promesa': pizarra = { tema: 'gana', k: tr(f, en('pagas'), en('igual') + 10), cero: tr(f, en('centavo'), en('intereses') + 8) }; break;
    case 'comision': pizarra = { tema: 'comision', k: tr(f, en('cada'), en('comision') + 8), banco: tr(f, en('banco', 2), en('banco', 2) + 14) }; break;
    case 'quien': pizarra = { tema: 'quien', k: tr(f, A.quien, en('verdad') + 6) }; break;
    case 'tu': pizarra = { tema: 'tu', k: tr(f, A.tu, en('2023') + 8), precios: tr(f, en('acaban'), en('precios') + 8) }; break;
    case 'peor': case 'efectivo': pizarra = { tema: 'efectivo', k: tr(f, en('efectivo'), en('libras') + 10), menos: tr(f, en('149'), en('menos') + 8), mas: tr(f, en('1133'), en('1133') + 16) }; break;
    case 'cadena': pizarra = { tema: 'cadena', k: tr(f, en('banco cobra'), en('usa tarjeta') + 10), cero: tr(f, en('nunca'), en('intereses', 2) + 8) }; break;
    default: pizarra = { tema: 'cta', k: tr(f, A.cta, en('efectivo', 3) + 6) };
  }
  return { pizarra };
};

// ---------- el PROFESOR: gestos del kit (caras fijas que cambian en la palabra clave, idle siempre, impulso) ----------
const CLAVES = [ // 5 cambios de brazos, cada uno en su palabra
  { f: 0, L: 'hang', R: 'hang' }, { f: en('igual'), L: 'hip', R: 'open' }, { f: en('comision'), L: 'hip', R: 'point' },
  { f: A.quien, L: 'cross', R: 'cheek' }, { f: A.tu, L: 'hang', R: 'point' }, { f: A.cadena, L: 'hip', R: 'beat' }, { f: A.cta, L: 'hip', R: 'thumb' },
];
const CARAS = [[0, 'neutral'], [en('igual'), 'stern'], [A.promesa, 'cejas'], [A.comision, 'neutral'], [A.quien, 'cejas'], [A.tu, 'stern'],
  [en('peor'), 'stern'], [en('pues no'), 'stubborn'], [en('1133'), 'grin'], [A.cadena, 'neutral'], [en('contigo'), 'laugh'], [A.cta, 'grin']];
const caraEn = (f) => { let c = 'neutral'; for (const [fk, k] of CARAS) if (f >= fk) c = k; return c; };
const ASIENTE = GOLPES.map((w) => en(w));
const asiente = (f) => { let h = 0; for (const g of ASIENTE) { const t = (f - (g - 3)) / 30; if (t >= 0 && t < 0.6) h += -6 * (1 - M.spring(t, 2.2, 6)) * Math.sign(Math.sin(t * Math.PI * 2.2) + 1e-6) * (t < 0.08 ? -0.4 : 1); } return h; };
const niega = (f) => { const a = en('pues no') + 6; return f >= a && f <= a + 29 ? 7 * Math.sin(((f - a) / 29) * Math.PI * 3) * (1 - (f - a) / 40) : 0; };   // «Pues no»: niega con la cabeza
const piso = (f) => { const a = en('precios'); return f >= a && f < a + 4 ? 0.02 : 0; };                                                       // «¡tus precios!»: pisotón
const risa = (f) => { const a = en('contigo'); return f >= a && f < a + 34 ? { tilt: -4 + 3 * Math.sin(f * 0.55), bob: Math.abs(Math.sin(f * 0.55)) * 0.022 } : { tilt: 0, bob: 0 }; };
export const actorsAt = (f, T) => {
  const S = shotAt(f), id = idle(f, 5), br = brazosEn(f, CLAVES, 10), rs = risa(f);
  const base = caraEn(f), fuerte = (BOCA[f] ?? 0) > 0.8;
  const expr = fuerte && !/laugh|grin/.test(base) ? 'relief_open' : base; // solo en lo más fuerte la boca se abre un instante
  const facing = S.id === 'quien' ? -0.25 : S.id === 'gancho' && f < en('igual') + 10 ? 0 : 0.3;
  const op = { ...br, expr, facing, look: facing ? 0.5 : 0, seed: 5, blink: blinkAt(f, 5),
    tilt: q(id.tilt + rs.tilt, 1), headTilt: q(id.headTilt + niega(f) + asiente(f), 1), bob: q(id.bob + piso(f) + rs.bob, 3) };
  return [{ key: 'profe' + JSON.stringify(op), draw: (p) => T.romanFront(p, 'profesor', op), x: P[0], y: 0, z: P[2], s: SP, order: 3 }];
};

// ---------- efectos 2D (tarjetas): destellos en «igual», «172.000» y «1.133», polvo en «¡tus precios!» ----------
const FX = (key, draw, pos, s = 1, o = {}) => ({ key, draw, x: pos[0], y: pos[1], z: pos[2], s, blob: false, shadow: false, order: 4, noInk: true, ...o });
export const fxAt = (f, T) => {
  const out = [];
  for (const w of ['igual', '172', '1133']) { const v = en(w); if (f >= v && f < v + 14) { const t = q((f - v) / 14, 2); out.push(FX('burst' + w + t, (p) => { p.g.translate(0, -120); T.fxBurst(p, t, '#fff3b0', 12, 40, 240); }, [PIZ[0], 1.2, PIZ[2] + 0.4], 1.2, { add: true })); } }
  const c = en('precios'); if (f >= c && f < c + 20) { const k = q((f - c) / 20, 2); out.push(FX('dust' + k, (p) => T.fxDust(p, k), [P[0], 0, P[2] + 0.2], 0.9, { alpha: 0.8 })); }
  return out;
};
