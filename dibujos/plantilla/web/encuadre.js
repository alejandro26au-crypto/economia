// ENCUADRE AUTOMÁTICO: cámaras que se calculan solas para que los personajes quepan enteros en el plano vertical.
// En vez de escribir pos/look/fov a mano, se pide el TIPO de plano y el motor busca la distancia justa.
//   import { persona, plano } from './encuadre.js';
//   const CLI = persona([2.35, 0, -0.15], 0.79);                    // pies en (x, 0, z) y escala de la tarjeta (s)
//   plano.dos(CLI, TEN, { lado: 40 })            → { pos, look, fov }  las dos de cuerpo entero (lado = grados alrededor)
//   plano.cuerpo(CLI, { lado: -20 })             → una persona de cuerpo entero con aire alrededor
//   plano.cara(CLI, { lado: 0 })                 → primer plano (SOLO 1-2 en todo el vídeo)
//   plano.detras(CLI, [63.5, 1.6, 6.2])          → por encima del hombro: la persona en un lado y lo que mira al fondo
//   plano.general([x, y, z], radio, { lado })    → un lugar entero (la calle, la fachada) de radio metros
//   plano.contra(CLI, TEN, { lado })             → contrapicado (cámara baja mirando arriba)
//   acerca(k, 0.12)                              → el mismo plano un 12 % más cerca (para la clave final: empuje lento)
// En CAMS: gancho: [{ f: 0, ...plano.dos(CLI, TEN) }, { f: A.promesa - 1, ...acerca(plano.dos(CLI, TEN), 0.1) }]
// `./inercia chequeo N` comprueba después, sin renderizar, que nadie sale cortado, tapado o pegado a la cámara.
export const ASPECTO = 1080 / 1920;
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, k) => a.map((v) => v * k), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = (a) => { const l = Math.hypot(...a) || 1; return mul(a, 1 / l); };
const rad = (g) => g * Math.PI / 180;

/** una persona del reparto: pies en p, escala s de su tarjeta (alto ≈ 1,9·s m, ojos ≈ 1,6·s m) */
export const persona = (p, s = 0.8) => ({ p, s, alto: 1.9 * s, ojos: [p[0], 1.6 * s, p[2]], cabeza: [p[0], 1.9 * s, p[2]],
  puntos: [[p[0] - 0.32 * s, 0, p[2]], [p[0] + 0.32 * s, 0, p[2]], [p[0] - 0.32 * s, 1.95 * s, p[2]], [p[0] + 0.32 * s, 1.95 * s, p[2]], [p[0], 1.95 * s, p[2] - 0.3 * s], [p[0], 1.95 * s, p[2] + 0.3 * s]] });

/** proyecta un punto con una cámara { pos, look, fov (vertical, grados), roll }: [x, y] en -1..1 (fuera si |x|>1) y z = distancia delante */
export function proyecta(c, q) {
  const f = norm(sub(c.look, c.pos)); let r = norm(cross(f, [0, 1, 0])); let u = cross(r, f);
  if (c.roll) { const a = rad(c.roll), r2 = add(mul(r, Math.cos(a)), mul(u, Math.sin(a))); u = add(mul(u, Math.cos(a)), mul(r, -Math.sin(a))); r = r2; }
  const v = sub(q, c.pos), z = dot(v, f), t = Math.tan(rad(c.fov) / 2);
  return { x: dot(v, r) / z / (t * ASPECTO), y: dot(v, u) / z / t, z };
}

/** cámara mirando a `centro` desde el ángulo `lado` (0 = desde +z, 90 = desde +x), a la distancia justa para que
 *  todos los `puntos` quepan dentro de `margen` (0-1 de la pantalla). `y` = altura de la cámara.
 *  `max` = distancia máxima (DENTRO de un local: la distancia a la pared); si no cabe, abre el objetivo (fov) en vez de alejarse. */
export function encuadra(puntos, { centro, lado = 0, y = 1.6, fov = 46, margen = 0.82, cerca = 0.6, max = Infinity, fovMax = 62 } = {}) {
  const C = centro || mul(puntos.reduce((a, b) => add(a, b), [0, 0, 0]), 1 / puntos.length);
  const dir = [Math.sin(rad(lado)), 0, Math.cos(rad(lado))];
  const cam = (d, fv = fov) => ({ pos: [C[0] + dir[0] * d, y, C[2] + dir[2] * d], look: C, fov: fv });
  const cabe = (d, fv = fov) => puntos.every((q) => { const p = proyecta(cam(d, fv), q); return p.z > cerca && Math.abs(p.x) <= margen && Math.abs(p.y) <= margen; });
  let lo = 0.4, hi = 0.4; while (!cabe(hi) && hi < 400) hi *= 1.5;
  for (let i = 0; i < 30; i++) { const m = (lo + hi) / 2; if (cabe(m)) hi = m; else lo = m; }
  if (hi <= max) return cam(hi);
  let fv = fov; while (fv < fovMax && !cabe(max, fv)) fv += 1;
  return cam(max, fv);
}
/** busca, alrededor de `lado`, el ángulo en que el grupo cabe más cerca SIN que uno tape al otro (separación en pantalla) */
function mejorLado(grupos, o) {
  const base = o.lado ?? 0, abanico = o.abanico ?? 70; let mejor = null;
  for (let g = -abanico; g <= abanico; g += 5) {
    const k = encuadra(grupos.flatMap((P) => P.puntos), { ...o, lado: base + g });
    const xs = grupos.map((P) => proyecta(k, [P.p[0], P.alto * 0.6, P.p[2]]).x).sort((a, b) => a - b);
    const sep = Math.min(...xs.slice(1).map((x, i) => x - xs[i]));
    if (sep < (o.separa ?? 0.3)) continue;
    const coste = Math.hypot(...sub(k.pos, k.look)) * (k.fov / 46) + Math.abs(g) * 0.01;
    if (!mejor || coste < mejor.coste) mejor = { k, coste };
  }
  return (mejor || { k: encuadra(grupos.flatMap((P) => P.puntos), o) }).k;
}

export const plano = {
  /** dos (o más) personas de cuerpo entero */
  dos: (A, B, o = {}) => (o.fijo ? encuadra([...A.puntos, ...B.puntos], { y: 1.55 * Math.max(A.s, B.s) + 0.3, ...o }) : mejorLado([A, B], { y: 1.55 * Math.max(A.s, B.s) + 0.3, ...o })),
  grupo: (L, o = {}) => mejorLado(L, { y: 1.5, ...o }),
  /** una persona entera con aire alrededor (se ve el decorado) */
  cuerpo: (P, o = {}) => encuadra(P.puntos, { margen: 0.6, y: P.ojos[1] + 0.1, centro: [P.p[0], P.alto * 0.55, P.p[2]], ...o }),
  /** primer plano: la cara llena la pantalla (máximo 1-2 por vídeo) */
  cara: (P, o = {}) => { const c = P.ojos; return encuadra([[c[0] - 0.42 * P.s, c[1] - 0.5 * P.s, c[2]], [c[0] + 0.42 * P.s, c[1] + 0.42 * P.s, c[2]]],
    { centro: c, y: c[1], margen: 0.95, fov: 36, ...o }); },
  /** contrapicado: cámara baja mirando hacia arriba */
  contra: (A, B, o = {}) => { const k = B ? plano.dos(A, B, { y: 0.7, margen: 0.78, ...o }) : encuadra(A.puntos, { y: 0.7, margen: 0.7, ...o });
    k.look = [k.look[0], k.look[1] + 0.35, k.look[2]]; k.roll = o.roll ?? -3; return k; },
  /** un sitio entero: centro y radio en metros */
  general: (C, R, o = {}) => encuadra([[C[0] - R, 0, C[2]], [C[0] + R, 0, C[2]], [C[0], C[1] + R * 0.6, C[2]], [C[0], 0, C[2] - R], [C[0], 0, C[2] + R]],
    { centro: C, y: 1.7, fov: 52, margen: 0.9, ...o }),
  /** por encima del hombro: la persona en el tercio izquierdo (o derecho) y `objetivo` al fondo */
  detras: (P, objetivo, { dist = 2.6, alto = 1.5, lado = 1, fov = 54 } = {}) => {
    const d = norm(sub([objetivo[0], 0, objetivo[2]], [P.p[0], 0, P.p[2]])), r = [-d[2], 0, d[0]];   // derecha de quien mira
    const pos = add(add([P.p[0], alto, P.p[2]], mul(d, -dist)), mul(r, lado * 0.45));                 // la cámara un poco al otro lado
    let look = [objetivo[0], alto + 0.25, objetivo[2]];   // mirada casi horizontal: la cara queda por encima del subtítulo
    for (let i = 0; i < 80; i++) { const x = lado * proyecta({ pos, look, fov }, [P.p[0], P.alto * 0.5, P.p[2]]).x;   // la persona en su tercio
      if (x > -0.75 && x < -0.4) break; look = add(look, mul(r, (x <= -0.75 ? -0.15 : 0.15) * lado)); }
    return { pos, look, fov };
  },
};

/** la misma cámara un poco más cerca de lo que mira (k = 0.1 → 10 %) */
export const acerca = (c, k = 0.1) => ({ ...c, pos: add(c.pos, mul(sub(c.look, c.pos), k)) });
/** la misma cámara girada g grados alrededor de lo que mira (para que el plano no esté quieto) */
export const gira = (c, g = 6) => { const v = sub(c.pos, c.look), a = rad(g);
  return { ...c, pos: add(c.look, [v[0] * Math.cos(a) + v[2] * Math.sin(a), v[1], -v[0] * Math.sin(a) + v[2] * Math.cos(a)]) }; };
