// CHEQUEO SIN RENDERIZAR (segundos): revisa web/story.js de un vídeo ANTES de sacar fotos o montar.
//   node dibujos/herramientas/chequeo.mjs dibujos/videos/<N-titulo>      (o: ./inercia chequeo N)
// ERRORES (paran fotos/montar): palabras de en('…') que no están en la voz, story.js que no carga, sin SONIDOS.
// AVISOS (para corregir antes de enseñar): cabeza cortada, persona cortada por un lado, persona pegada a la cámara,
// más de 2 planos de cara, destello delante de la cámara, cuadro de cifras sobre una cara, subtítulo sobre una cara.
// No ve el decorado: si una pared o un mueble tapa a alguien, eso solo se ve en las fotos.
import path from 'path'; import { pathToFileURL } from 'url';
import { persona, proyecta } from '../plantilla/web/encuadre.js';
const dir = path.resolve(process.argv[2] || '.');
const errores = [], avisos = new Map();
const log0 = console.log; const palabras = new Set();
console.log = (...a) => { const t = a.join(' '); const m = t.match(/ERR palabra no encontrada: (.*)/); if (m) palabras.add(m[1]); else log0(...a); };
let S;
try { S = await import(pathToFileURL(path.join(dir, 'web', 'story.js')).href); }
catch (e) { console.log = log0; console.log('✗ story.js no carga: ' + e.message); process.exit(1); }
const { SHOTS, camAt, actorsAt, fxAt, TOTAL } = S;
const T = new Proxy({}, { get: () => () => {} });
const aviso = (plano, tipo, f) => { const k = plano + '|' + tipo; const v = avisos.get(k) || { plano, tipo, de: f, a: f, n: 0 }; v.a = f; v.n++; avisos.set(k, v); };
const caras = new Set();
for (let f = 0; f < TOTAL; f += 2) {
  const sh = SHOTS.find((s) => f >= s.a && f <= s.b) || SHOTS[SHOTS.length - 1];
  const barrido = f - sh.a < 5 || sh.b - f < 5;                       // en el barrido entre planos solo se mira quién se pega a la cámara
  const c = camAt(f); let acts = [], fx = [];
  try { acts = actorsAt(f, T); fx = fxAt(f, T); } catch (e) { errores.push(`fotograma ${f}: actorsAt/fxAt fallan (${e.message})`); break; }
  const ins = fx.filter((a) => String(a.key).startsWith('ins')).map((a) => { const s = a.s || 1, w = 0.6 * s, h0 = a.y + 2.25 * s * 0.22, h1 = a.y + 2.25 * s * 0.78;
    const P = [[a.x - w, h0, a.z], [a.x + w, h1, a.z]].map((q) => proyecta(c, q)); return { x0: Math.min(P[0].x, P[1].x), x1: Math.max(P[0].x, P[1].x), y0: Math.min(P[0].y, P[1].y), y1: Math.max(P[0].y, P[1].y) }; });
  for (const a of acts) {
    const who = a.nombre || String(a.key).replace(/[^a-záéíóúñ].*$/i, '') || 'alguien', P = persona([a.x, a.y || 0, a.z], a.s || 0.8);
    const ojo = proyecta(c, P.ojos), pie = proyecta(c, [a.x, 0.05, a.z]), top = proyecta(c, P.cabeza), med = proyecta(c, [a.x, P.alto * 0.5, a.z]);
    if (ojo.z <= 0.2) continue;
    if (barrido) { if (!caras.has(sh.id) && Math.abs(ojo.x) < 1.3 && Math.abs(ojo.y) < 1.3 && ojo.z < 1.6) aviso(sh.id, `${who} se cruza pegada a la cámara en el cambio de plano`, f); continue; }
    const dentro = Math.abs(ojo.x) < 1 && Math.abs(ojo.y) < 1;
    const altoPant = (top.y - pie.y) / 2;                              // fracción de la pantalla que ocupa de pies a cabeza
    if (dentro && (top.y - ojo.y) / 2 * 3.5 > 0.55) { caras.add(sh.id); continue; }   // primer plano: la cara llena la pantalla
    if (Math.abs(med.x) > 0.7 && Math.abs(med.x) < 1.15 && Math.abs(med.y) < 1) aviso(sh.id, `${who} cortada por un lado`, f);
    if (dentro && top.y > 1.0 && altoPant < 1.6) aviso(sh.id, `a ${who} se le corta la cabeza`, f);
    if (dentro && ojo.z < 1.1) aviso(sh.id, `${who} pegada a la cámara (${ojo.z.toFixed(1)} m)`, f);
    if (dentro && ojo.y > -0.62 && ojo.y < -0.3 && Math.abs(ojo.x) < 0.55) aviso(sh.id, `el subtítulo tapa la cara de ${who}`, f);
    for (const b of ins) if (dentro && ojo.x > b.x0 && ojo.x < b.x1 && ojo.y > b.y0 && ojo.y < b.y1) aviso(sh.id, `el cuadro de cifras tapa la cara de ${who}`, f);
  }
  if (barrido) continue;
  for (const a of fx) if (a.add) { const p = proyecta(c, [a.x, a.y + 1, a.z]); if (p.z > 0 && p.z < 2.5) aviso(sh.id, 'destello delante de la cámara (vela la imagen)', f); }
}
console.log = log0;
for (const w of palabras) errores.push(`en('${w}'): esa palabra no está en la voz (web/tiempos.js). Cámbiala por una que diga el guion.`);
if (!S.SONIDOS || !S.SONIDOS.length) errores.push('story.js no exporta SONIDOS: el vídeo saldría sin efectos (copia el bloque SONIDOS de la plantilla).');
if (caras.size > 2) avisos.set('caras', { plano: [...caras].join(', '), tipo: `${caras.size} planos de cara a pantalla completa (máximo 1-2)`, de: 0, a: 0, n: 1 });
const seg = (f) => (f / 30).toFixed(1) + ' s';
console.log(`CHEQUEO SIN RENDERIZAR — ${path.basename(dir)}: ${SHOTS.length} planos, ${TOTAL} fotogramas, ${S.SONIDOS?.length || 0} sonidos, planos de cara: ${[...caras].join(', ') || 'ninguno'}`);
for (const e of errores) console.log('  ✗ ' + e);
for (const v of [...avisos.values()].filter((v) => v.n >= 3 || /cara a pantalla|cambio de plano/.test(v.tipo))) console.log(`  ⚠ [${v.plano}] ${v.tipo}` + (v.a ? `  (${seg(v.de)}-${seg(v.a)})` : ''));
if (!errores.length && ![...avisos.values()].some((v) => v.n >= 3)) console.log('  ✓ Todo en su sitio (el decorado tapando a alguien solo se ve en las fotos).');
process.exit(errores.length ? 1 : 0);
