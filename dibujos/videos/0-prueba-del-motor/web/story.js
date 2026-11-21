// PLANTILLA — planos atados a cada PALABRA de la voz (web/tiempos.js: PAL = [[palabra, f0, f1], …] a 30 fps).
// Sin personajes ni lugares de serie: se ponen SOLO los que nombra el guion (`./inercia escena N` lo comprueba).
// Ya funciona solo: un plano por frase, ZOOM DE GOLPE en cada cifra, BARRIDO entre planos, luz por plano, golpes de
// cámara (KICKS), y exporta SONIDOS para que herramientas/sonido.py ponga efectos en cada corte y cada golpe.
// Para un vídeo: cambia SHOTS (agrupa frases), CAMS (cámaras a medida del decorado), actorsAt (reparto) y fxAt.
import { M, clamp, lerp, ramp, camFromKeys, idle, blinkAt, q } from './motion.js';
import { brazosEn } from './gestos.js';
import { PAL, TOTAL_VOZ } from './tiempos.js';
import { BOCA } from './boca.js';
export const FPS = 30, TOTAL = TOTAL_VOZ;

// ---------- palabras → fotogramas ----------
const norm = (w) => w.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ]/g, '');
/** fotograma en que EMPIEZA la n-ésima vez que suena `w` (una o varias palabras seguidas): en('pues no', 1) */
export const en = (w, n = 1) => {
  const ks = w.split(/\s+/).map(norm); let c = 0;
  for (let i = 0; i + ks.length <= PAL.length; i++) if (ks.every((k, j) => norm(PAL[i + j][0]).startsWith(k)) && ++c === n) return PAL[i][1];
  console.log('ERR palabra no encontrada: ' + w); return 0;
};
/** inicio de cada frase (después de . ! ? …) */
const FRASES = PAL.reduce((acc, [p, f0], i) => { if (i === 0 || /[.!?…]$/.test(PAL[i - 1][0])) acc.push(f0); return acc; }, []);

// ---------- planos: por defecto, uno por frase (agrúpalos a medida: cada plano empieza en una palabra) ----------
const LUZ = ['dia', 'dia', 'tarde', 'dia', 'nube', 'dia', 'dorada'];
export const SHOTS = FRASES.map((a, i) => ({ id: 's' + i, a: i ? a - 2 : 0, b: (FRASES[i + 1] ?? TOTAL + 2) - 3, light: LUZ[i % LUZ.length] }));
export const shotAt = (f) => SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];

// ---------- luces (la de día = la de los romanos) ----------
const DIA = { az: 140, el: 46, sky: '#c4d6f2', ground: '#8a8262', hemi: 1.15, sun: '#fff1dc', sunI: 2.5, fog: '#cadcf0', fogNear: 70, fogFar: 900,
  skyTop: '#3f80d4', skyHor: '#c3daf2', sat: 1.1, vig: 0.2, shadowExt: 16 };
export const LIGHTS = {
  dia: DIA,
  tarde: { ...DIA, az: 200, el: 30, sun: '#ffe2b8', sunI: 2.6, gain: '#fff6ea' },
  nube: { ...DIA, sky: '#aab8cc', hemi: 1.0, sun: '#e8ecf4', sunI: 1.5, skyTop: '#6f86a8', skyHor: '#c9d2de', fog: '#c2ccd8', sat: 0.95, vig: 0.34 },
  dorada: { az: 230, el: 14, sky: '#9a90c8', ground: '#6a4c40', hemi: 1.0, sun: '#ffb46c', sunI: 2.9, fog: '#f0b88c', fogNear: 60, fogFar: 760,
    skyTop: '#6f6eb0', skyHor: '#ffc27e', sunDisc: '#fff0c8', sunSize: 0.0035, sat: 1.12, gain: '#fff2e2', vig: 0.24, shadowExt: 16 },
  // dentro de un local: sol alto entrando por ventanas; alarma/tensión: luz roja (como el submarino)
  dentro: { ...DIA, az: 200, el: 66, hemi: 1.25, sky: '#ffe9cc', sunI: 2.2, vig: 0.26, shadowExt: 9 },
};
export const lightFor = (S) => ({ ...LIGHTS[S.light] });

// ---------- cámaras: por defecto, un recorrido distinto por plano alrededor del centro de la escena ----------
const CENTRO = [0, 1.3, -9];
const CAMS = Object.fromEntries(SHOTS.map((s, i) => { const a = -0.4 + (i % 5) * 0.2, d = 6 - (i % 3) * 1;
  return [s.id, [{ f: s.a, pos: [CENTRO[0] + Math.sin(a) * d, 1.7 + (i % 2) * 0.6, CENTRO[2] + Math.cos(a) * d], look: CENTRO, fov: 46 },
    { f: s.b, pos: [CENTRO[0] + Math.sin(a + 0.12) * (d - 1.2), 1.7 + (i % 2) * 0.6, CENTRO[2] + Math.cos(a + 0.12) * (d - 1.2)], look: CENTRO, fov: 44 }]]; }));
// cifras: zoom de golpe AUTOMÁTICO en cada palabra con número; golpes de cámara en los remates con «!»
const CIFRA = /\d|^(cero|uno|una|dos|tres|cuatro|cinco|seis|siete|ocho|nueve|diez|cien|mil|millon|millones|mitad|doble|triple)$/;
export const ZOOMS = PAL.filter(([p]) => CIFRA.test(norm(p))).map(([, f0]) => [f0, 0.12]);
const KICKS = PAL.filter(([p]) => /!$/.test(p)).map(([, , f1]) => ({ f: f1 - 4, a: 0.03 }));
export const camAt = (f) => {
  const S = shotAt(f);
  const c = camFromKeys(CAMS[S.id], f, { creep: 0.0008, kicks: KICKS });
  for (const [z, k] of ZOOMS) { const d = f - (z - 2); if (d >= 0 && d < 16) c.fov *= 1 - k * (d < 3 ? M.easeOut(d / 3) : 1 - M.smooth((d - 3) / 13)); }
  { const de = S.b - f, ds = f - S.a, AMP = 0.5; let w = 0;   // barrido rápido entre planos (4 fotogramas)
    if (de < 4 && S.b !== TOTAL - 1 && S !== SHOTS[SHOTS.length - 1]) w = Math.pow((4 - de) / 4, 2) * AMP; else if (ds < 4 && S.a !== 0) w = -Math.pow((4 - ds) / 4, 2) * AMP;
    if (w) { const dx = c.look[0] - c.pos[0], dz = c.look[2] - c.pos[2], L = Math.hypot(dx, dz) || 1, D = Math.hypot(dx, c.look[1] - c.pos[1], dz);
      c.look = [c.look[0] - dz / L * w * D, c.look[1], c.look[2] + dx / L * w * D]; c.roll = (c.roll || 0) + w * 10; } }
  c.flash = 0; c.shadowAt = CENTRO;
  return c;
};
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
export const dofAt = (f) => { const C = camAt(f); return { focus: dist(C.pos, C.look), cinf: 3 }; };

// ---------- el decorado reacciona a la voz (lo lee worldState en _world.js) ----------
export const worldAt = (f) => ({});

// ---------- reparto: VACÍO. Solo personajes que nombra el guion («escena.reparto» de la ficha). ----------
// Ejemplo (gestos del kit: CLAVES de brazos, CARAS en la palabra clave, idle, asentir): ver dibujos/ejemplos/truco-del-99/web/story.js
export const actorsAt = (f, T) => { const id = idle(f, 8), br = brazosEn(f, [{ f: 0, L: 'hang', R: 'hang' }, { f: en('tarjeta'), L: 'hang', R: 'reach' }, { f: en('banco'), L: 'hip', R: 'point' }], 10);
  const op = { ...br, expr: f < en('quien') ? 'neutral' : f < en('banco') ? 'cejas' : 'stern', seed: 8, blink: blinkAt(f, 8), tilt: q(id.tilt, 1), headTilt: q(id.headTilt, 1), bob: q(id.bob, 3), facing: 0.3, look: 0.4 };
  return [{ key: 'cli' + JSON.stringify(op), draw: (p) => T.romanFront(p, 'clienta', op), x: 0.3, y: 0, z: -8.6, s: 0.8, order: 3 }]; };

// ---------- efectos 2D (tarjetas): destellos, estrellas, polvo, monedas… (ejemplos en dibujos/videos/2-…/web/story.js) ----------
export const fxAt = (f, T) => [];

// ---------- sonido: lo lee herramientas/sonido.py (cortes = «whoosh», golpes = «impacto», y los que añadas) ----------
export const SONIDOS = [...SHOTS.slice(1).map((s) => ({ f: s.a, tipo: 'corte' })), ...ZOOMS.map(([f]) => ({ f, tipo: 'golpe' })), ...KICKS.map((k) => ({ f: k.f, tipo: 'remate' }))];
