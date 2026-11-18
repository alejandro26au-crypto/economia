// Cámara 3D que nunca para: reparte la escena en PLANOS de ~2,5 s (cada cambio empieza justo en una palabra),
// elige el tipo de plano y a quién mira, y entre plano y plano hace un barrido rápido (sin cortar).
// Dentro de cada plano sigue moviéndose: se acerca despacio, gira un poco y tiembla como cámara en mano.
import * as THREE from "three";
import { azar, ondula } from "./azar";
import { DatosEscenario, Obstaculo } from "./escenarios-datos";
import { EstadoActor, mundo } from "./estado";
import { ALTO_DIBUJO } from "./personajes";
import { ALTO, ANCHO, FPS, mezcla } from "./tiempo";
import { Actor, Plano, TipoPlano } from "./tipos";

export type V3 = [number, number, number];
export type Vista = { pos: V3; mira: V3; fov: number; giro: number };

export type PlanoCalc = { ini: number; fin: number; tipo: TipoPlano; foco: number | null; lado: 1 | -1 };

export const PLANO_SEG = 2.5; // cada cuánto cambia el ángulo
export const BARRIDO = 9; // fotogramas que dura el barrido de un plano al siguiente
const ASPECTO = ANCHO / ALTO;

type Forma = { az: number; el: number; llena: number; apunta: number; fov: number };
const FORMAS: Record<Exclude<TipoPlano, "general">, Forma> = {
  // az/el en grados; llena = parte del alto de la pantalla que ocupa el personaje (pequeño: que se vea el
  // entorno); apunta = a qué altura de él mira la cámara (más alto = el personaje queda más abajo en pantalla)
  cerca: { az: 26, el: 6, llena: 0.34, apunta: 0.62, fov: 40 },
  detalle: { az: 14, el: 4, llena: 0.46, apunta: 0.66, fov: 34 },
  contrapicado: { az: 22, el: -12, llena: 0.3, apunta: 0.75, fov: 50 },
  picado: { az: 16, el: 38, llena: 0.22, apunta: 0.5, fov: 46 },
  lateral: { az: 64, el: 8, llena: 0.27, apunta: 0.62, fov: 42 },
  orbita: { az: 0, el: 10, llena: 0.24, apunta: 0.6, fov: 46 },
};
/** Desplazamiento horizontal de la parte importante del dibujo (en anchos), mirando a la derecha. */
const CENTRO_X: Partial<Record<Actor["tipo"], number>> = { gamba: 0.2 };
const ROTACION: TipoPlano[] = ["cerca", "lateral", "contrapicado", "detalle", "orbita", "picado", "cerca", "general"];

/**
 * Reparte una escena en planos. `inicios` = fotograma (relativo a la escena) en que empieza cada palabra de la
 * escena, con si va detrás de una pausa. Los cambios caen en el inicio de palabra más cercano a cada 2,5 s.
 */
export function planificar(opc: {
  dur: number;
  inicios: { f: number; pausa: boolean }[];
  actores: Actor[];
  forzados: (Plano & { f: number })[];
  momentos: { f: number; actor: number }[]; // cuándo hace algo cada actor (para mirarle)
  entradas: number[]; // fotograma en que aparece cada actor
  variante: number;
}): PlanoCalc[] {
  const { dur, inicios, actores, forzados, momentos, entradas, variante } = opc;
  const L = Math.round(PLANO_SEG * FPS);
  const cortes: number[] = [0];
  const fijos = forzados.map((p) => p.f).filter((f) => f > 0 && f < dur - 20);
  let t = 0;
  while (t + L * 1.45 < dur) {
    const prox = fijos.find((f) => f > t + 20 && f < t + L * 1.3);
    if (prox !== undefined) {
      cortes.push(prox);
      t = prox;
      continue;
    }
    let mejor = t + L;
    let nota = Infinity;
    for (const w of inicios) {
      if (w.f < t + L * 0.75 || w.f > t + L * 1.3) continue;
      const n = Math.abs(w.f - (t + L)) - (w.pausa ? 22 : 0);
      if (n < nota) {
        nota = n;
        mejor = w.f;
      }
    }
    cortes.push(mejor);
    t = mejor;
  }
  for (const f of fijos) if (!cortes.some((c) => Math.abs(c - f) < 20)) cortes.push(f);
  cortes.sort((a, b) => a - b);

  const planos: PlanoCalc[] = [];
  let r = Math.floor(azar(variante, "rot") * ROTACION.length);
  cortes.forEach((ini, k) => {
    const fin = k + 1 < cortes.length ? cortes[k + 1] : dur;
    const forz = forzados.find((p) => Math.abs(p.f - ini) < 20 || (k === 0 && p.f <= 0));
    let tipo: TipoPlano;
    if (forz?.tipo) tipo = forz.tipo;
    else if (k === 0) tipo = actores.length ? (azar(variante, "p0") < 0.5 ? "general" : "orbita") : "general";
    else {
      tipo = ROTACION[r++ % ROTACION.length];
      if (tipo === planos[k - 1].tipo) tipo = ROTACION[r++ % ROTACION.length];
    }
    // a quién mira: el forzado, el que hace algo en este plano, o se van turnando
    let foco: number | null = null;
    if (forz?.a !== undefined) foco = typeof forz.a === "number" ? forz.a : Math.max(0, actores.findIndex((a) => a.nombre === forz.a));
    else if (actores.length) {
      const presentes = actores.map((_, i) => i).filter((i) => entradas[i] <= ini + 8);
      const m = momentos.find((x) => x.f >= ini - 6 && x.f < fin - 10 && entradas[x.actor] <= x.f);
      if (m) foco = m.actor;
      else if (presentes.length) foco = presentes[(k + Math.floor(azar(variante, "foco") * presentes.length)) % presentes.length];
    }
    if (tipo === "general" && forz?.a === undefined) foco = null;
    if (!actores.length) {
      foco = null;
      tipo = "general";
    }
    planos.push({ ini, fin, tipo, foco, lado: (k + Math.floor(azar(variante, "lado") * 2)) % 2 ? 1 : -1 });
  });
  return planos;
}

const rad = (g: number) => (g * Math.PI) / 180;
const desde = (centro: V3, az: number, el: number, d: number): V3 => [
  centro[0] + Math.sin(rad(az)) * Math.cos(rad(el)) * d,
  centro[1] + Math.sin(rad(el)) * d,
  centro[2] + Math.cos(rad(az)) * Math.cos(rad(el)) * d,
];

/** Distancia para que algo de `alto` metros ocupe `parte` del alto de la pantalla con ese fov. */
const distPara = (alto: number, parte: number, fov: number) => alto / parte / (2 * Math.tan(rad(fov) / 2));

/** Corrección de un plano para esquivar obstáculos: giro extra alrededor del personaje, altura extra y distancia. */
export type Ajuste = { az: number; el: number; dist: number };
const SIN_AJUSTE: Ajuste = { az: 0, el: 0, dist: 1 };

/** Vista de un plano en el momento u (0..1 dentro del plano). */
function vistaPlano(p: PlanoCalc, u: number, f: number, esc: DatosEscenario, estados: EstadoActor[], actores: Actor[], variante: number, aj: Ajuste = SIN_AJUSTE): Vista {
  const deriva = u * (0.9 + 0.2 * azar(variante, "d", p.ini));
  let v: Vista;
  if (p.foco === null || p.tipo === "general" || !(estados[p.foco]?.visible ?? false)) {
    // plano general: todo el escenario dentro del encuadre
    const fov = 54;
    const centro: V3 = [esc.centro[0], esc.suelo + esc.altoMira, esc.centro[2] - esc.fondo * 0.35];
    const anchoVisible = esc.ancho * 1.25;
    const hfov = 2 * Math.atan(Math.tan(rad(fov) / 2) * ASPECTO);
    let d = anchoVisible / 2 / Math.tan(hfov / 2);
    d = Math.min(d, esc.distMax) * (1.08 - 0.12 * deriva) * aj.dist;
    const az = p.lado * (8 + 10 * deriva) + aj.az;
    v = { pos: desde(centro, az, 12 - 4 * deriva + aj.el, d), mira: centro, fov, giro: p.lado * 1.2 * (1 - deriva) };
  } else {
    const e = estados[p.foco] ?? estados[0];
    const a = actores[p.foco] ?? actores[0];
    const forma = FORMAS[p.tipo];
    const altoM = e.anchoM * (ALTO_DIBUJO[a.tipo] / 200);
    const base = mundo(esc, e);
    const dx = e.anchoM * (CENTRO_X[a.tipo] ?? 0) * e.mira; // hay dibujos con la cara a un lado
    const centro: V3 = [base[0] + dx, base[1] + altoM * forma.apunta, base[2]];
    let az = p.lado * forma.az + p.lado * 7 * deriva;
    if (p.tipo === "orbita") az = p.lado * (-38 + 76 * deriva);
    az += aj.az;
    const llena = forma.llena * (1 + 0.16 * deriva); // se acerca despacio
    const d = Math.max(0.35, distPara(altoM, llena, forma.fov) * aj.dist);
    const el = forma.el + (p.tipo === "picado" ? -6 * deriva : 0) + aj.el;
    v = { pos: desde(centro, az, el, Math.min(d, esc.distMax)), mira: centro, fov: forma.fov, giro: p.lado * (p.tipo === "contrapicado" ? 4 : 1.5) * (1 - deriva) };
  }
  // cámara en mano
  const m = 0.012 * Math.max(1, Math.hypot(v.pos[0] - v.mira[0], v.pos[2] - v.mira[2]) * 0.6);
  v.pos = [v.pos[0] + ondula(f, variante, 0.05) * m, v.pos[1] + ondula(f, variante + 5, 0.06) * m, v.pos[2] + ondula(f, variante + 9, 0.04) * m];
  v.giro += ondula(f, variante + 13, 0.03) * 0.5;
  // que no se meta bajo el suelo ni salga de la caja del escenario
  v.pos[1] = Math.max(esc.suelo + 0.12, v.pos[1]);
  if (esc.caja) {
    const [x0, y0, z0, x1, y1, z1] = esc.caja;
    v.pos = [Math.min(x1, Math.max(x0, v.pos[0])), Math.min(y1, Math.max(y0, v.pos[1])), Math.min(z1, Math.max(z0, v.pos[2]))];
  }
  return v;
}

// ---------------------------------------------------------------- esquivar obstáculos
/** ¿Hay algo entre la cámara y lo que mira? Cilindros verticales; se ignora el último tramo (el propio personaje). */
function tapado(cam: V3, obj: V3, cils: Obstaculo[]): boolean {
  const dx = obj[0] - cam[0];
  const dz = obj[2] - cam[2];
  const L = Math.hypot(dx, dz);
  if (L < 0.05) return false;
  for (const [cx, cz, r, h] of cils) {
    // pegado a la cámara: aunque no esté en la línea, ocupa media pantalla
    const dCam = Math.hypot(cx - cam[0], cz - cam[2]);
    const delante = (cx - cam[0]) * dx + (cz - cam[2]) * dz > 0;
    if (delante && dCam < r + 1.1 && cam[1] < h + 0.3) return true;
    const t = Math.max(0, Math.min(1, ((cx - cam[0]) * dx + (cz - cam[2]) * dz) / (L * L)));
    if ((1 - t) * L < 0.45) continue; // pegado al personaje: es él mismo
    const px = cam[0] + t * dx;
    const pz = cam[2] + t * dz;
    if (Math.hypot(px - cx, pz - cz) < r) {
      const y = cam[1] + t * (obj[1] - cam[1]);
      if (y < h) return true;
    }
  }
  return false;
}

const AJUSTES: Ajuste[] = (() => {
  const out: Ajuste[] = [];
  for (const dist of [1, 0.72])
    for (const el of [0, 16])
      for (const az of [0, 22, -22, 45, -45, 70, -70, 100, -100, 140, -140]) out.push({ az, el, dist });
  return out;
})();

/**
 * Para cada plano, el ajuste más pequeño con el que NADA tapa al personaje (ni obstáculos del escenario ni otros
 * personajes), comprobado al principio, en medio y al final del plano. Así el ángulo no salta a mitad de plano.
 */
export function ajustesPlanos(planos: PlanoCalc[], esc: DatosEscenario, estadosEn: (f: number) => EstadoActor[], actores: Actor[], variante: number): Ajuste[] {
  const fijos = esc.obstaculos ?? [];
  return planos.map((p, k) => {
    const muestras = [0.05, 0.5, 0.95].map((u) => {
      const f = Math.round(p.ini + u * (p.fin - p.ini));
      const estados = estadosEn(f);
      // los demás personajes también estorban (no en el plano general: ahí son el tema)
      const otros: Obstaculo[] =
        p.foco === null || p.tipo === "general"
          ? []
          : estados
              .map((e, i) => ({ e, i }))
              .filter(({ e, i }) => i !== p.foco && e.visible && actores[i].tipo !== "gamba")
              .map(({ e, i }) => {
                const w = mundo(esc, e);
                const ancho = e.anchoM * (actores[i].tipo === "submarino" ? 0.25 : 0.55);
                return [w[0], w[2], ancho, w[1] + e.anchoM * (ALTO_DIBUJO[actores[i].tipo] / 200)] as Obstaculo;
              });
      return { u, f, estados, cils: [...fijos, ...otros] };
    });
    let mejor = SIN_AJUSTE;
    let fallos = Infinity;
    for (const aj of AJUSTES) {
      let n = 0;
      for (const m of muestras) {
        const v = vistaPlano(p, m.u, m.f, esc, m.estados, actores, variante + k * 17, aj);
        // el centro y los dos lados del personaje (o del centro del plano general) tienen que verse
        const dx = v.mira[0] - v.pos[0];
        const dz = v.mira[2] - v.pos[2];
        const L = Math.hypot(dx, dz) || 1;
        const lado = p.foco === null || p.tipo === "general" ? 1.2 : 0.4;
        const px = (-dz / L) * lado;
        const pz = (dx / L) * lado;
        const puntos: V3[] = [v.mira, [v.mira[0] + px, v.mira[1], v.mira[2] + pz], [v.mira[0] - px, v.mira[1], v.mira[2] - pz]];
        for (const q of puntos) if (tapado(v.pos, q, m.cils)) n++;
      }
      if (n < fallos) {
        fallos = n;
        mejor = aj;
      }
      if (n === 0) break;
    }
    return mejor;
  });
}

const suave = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Vista de la cámara en el fotograma f de la escena (con barrido entre planos). */
export function vistaEn(f: number, planos: PlanoCalc[], esc: DatosEscenario, estados: EstadoActor[], actores: Actor[], variante: number, ajustes: Ajuste[] = []): Vista {
  let k = 0;
  for (let i = 0; i < planos.length; i++) if (f >= planos[i].ini) k = i;
  const p = planos[k];
  const u = (f - p.ini) / Math.max(1, p.fin - p.ini);
  const actual = vistaPlano(p, u, f, esc, estados, actores, variante + k * 17, ajustes[k]);
  // empujón de entrada de la escena
  if (k === 0) {
    const t = Math.min(1, f / 14);
    const e = 1 - Math.pow(1 - t, 3);
    actual.fov = mezcla(actual.fov * 1.25, actual.fov, e);
    return actual;
  }
  if (f - p.ini >= BARRIDO) return actual;
  const ant = planos[k - 1];
  const previa = vistaPlano(ant, 1, f, esc, estados, actores, variante + (k - 1) * 17, ajustes[k - 1]);
  const t = suave((f - p.ini) / BARRIDO);
  const lerp3 = (a: V3, b: V3): V3 => [mezcla(a[0], b[0], t), mezcla(a[1], b[1], t), mezcla(a[2], b[2], t)];
  // el barrido hace un pequeño arco hacia arriba para no atravesar a nadie
  const pos = lerp3(previa.pos, actual.pos);
  pos[1] += Math.sin(t * Math.PI) * 0.15 * Math.hypot(previa.pos[0] - actual.pos[0], previa.pos[2] - actual.pos[2]);
  return { pos, mira: lerp3(previa.mira, actual.mira), fov: mezcla(previa.fov, actual.fov, t), giro: mezcla(previa.giro, actual.giro, t) + Math.sin(t * Math.PI) * 3 * ant.lado };
}

/** Cámara de Three.js para una vista (la misma sirve para pintar el 3D y para colocar a los personajes 2D). */
export function camaraThree(v: Vista, cam?: THREE.PerspectiveCamera, lejos = 400): THREE.PerspectiveCamera {
  const c = cam ?? new THREE.PerspectiveCamera(v.fov, ASPECTO, 0.05, lejos);
  c.fov = v.fov;
  c.aspect = ASPECTO;
  c.near = lejos > 1000 ? 0.3 : 0.05;
  c.far = lejos;
  c.position.set(v.pos[0], v.pos[1], v.pos[2]);
  c.up.set(Math.sin(rad(v.giro)), Math.cos(rad(v.giro)), 0);
  c.lookAt(v.mira[0], v.mira[1], v.mira[2]);
  c.updateProjectionMatrix();
  c.updateMatrixWorld(true);
  return c;
}

/** Punto del mundo → píxel del vídeo (y la profundidad, para ordenar y para la niebla). */
export function aPantalla(cam: THREE.PerspectiveCamera, p: V3): { x: number; y: number; dist: number; delante: boolean } {
  const v = new THREE.Vector3(p[0], p[1], p[2]);
  const dist = v.distanceTo(cam.position);
  const local = v.clone().applyMatrix4(cam.matrixWorldInverse);
  v.project(cam);
  return { x: ((v.x + 1) / 2) * ANCHO, y: ((1 - v.y) / 2) * ALTO, dist, delante: local.z < -0.05 };
}
