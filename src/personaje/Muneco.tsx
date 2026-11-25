// EL PROTAGONISTA DEL CANAL, animado por partes. Estilo LIMPIO (como Zenn): colores planos, contorno negro
// uniforme, sin lápiz ni rayados. Cabeza grande blanca, pelo negro despeinado, ojos grandes, cejas gruesas, camiseta negra,
// brazos y piernas de palo negros, manos blancas con dedos y zapatos negros.
// Lo mueve el esqueleto del motor (src/bent/animaciones.ts): camina, corre, habla, señala, piensa, encoge,
// saluda, victoria, asustado, cruza, salta, mira; y la cara (expresión + boca al hablar + parpadeo).
import React from "react";
import { Brazo, ManoDibujo, Pierna, Pose } from "../bent/rig";
import { Anim, Expresion, poseCompleta } from "../bent/animaciones";
import { abreBoca, brazosEn, cabezaEn, ClaveGesto } from "./gestos";

export const NEGRO = "#151515";
const PIEL = "#ffffff";
const SOMBRA_PIEL = "#ebe8e2"; // sombra lisa (sin rayado)
const ROPA = "#222124";
const ROPA_LUZ = "#3a393d"; // cuello y pliegue, en liso
const CONTORNO = 7; // grosor único del contorno

// proporciones (pies en y = 0; mide ~650 hasta la punta del pelo)
const MUSLO = 112;
const PANTORRILLA = 112;
const BRAZO = 110;
const ANTEBRAZO = 102;
const R = 104; // radio de la cabeza
const TORSO = 185; // de la cadera al hombro
const CUELLO = 14;
const PALO = 18; // grosor de brazos y piernas (más gruesos, como en los dibujos del usuario)

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const sumaP = (p: P, ang: number, largo: number): P => [p[0] + Math.sin(rad(ang)) * largo, p[1] + Math.cos(rad(ang)) * largo];

/** Antes llevaba el filtro de lápiz y las tramas; en el estilo limpio no hace falta nada (se deja por compatibilidad). */
export const DefsMuneco: React.FC = () => null;

// ---------------------------------------------------------------- pelo
// PELO SENCILLO HECHO CON LÍNEAS (como los dibujos del usuario en public/protagonista/): un casquete negro pegado a
// la coronilla y, encima, trazos cortos de puntas redondas barridos hacia la derecha. Sin pinchos.
// [x0, y0, x1, y1, curva, grosor] en coordenadas de la cabeza (centro 0,0; radio R = 104)
const TRAZOS: [number, number, number, number, number, number][] = [
  // izquierda: flequillo que cae hacia la sien y la frente
  [-60, -96, -112, -40, -10, 13],
  [-50, -104, -120, -76, -6, 12],
  [-40, -88, -84, -50, -4, 11],
  // arriba: trazos gruesos que se juntan, suben y se doblan a la derecha
  [-70, -96, -96, -134, 12, 13],
  [-50, -106, -60, -152, 14, 14],
  [-28, -112, -14, -160, 14, 14],
  [-6, -114, 30, -158, 14, 14],
  [14, -112, 66, -150, 12, 14],
  [34, -106, 96, -132, 10, 13],
  [50, -96, 122, -110, 8, 12],
  // derecha: barridos a la derecha
  [64, -84, 132, -80, 6, 11],
  [74, -70, 124, -50, 4, 9],
  // pelos sueltos finos arriba
  [-36, -116, -58, -172, 10, 4.5],
  [0, -118, 22, -176, 10, 4.5],
  [30, -110, 92, -160, 10, 4],
];

const Pelo: React.FC<{ f: number }> = ({ f }) => {
  const v = Math.sin(f / 13) * 1.5; // se mueve un poco con el cuerpo
  return (
    <g>
      {/* casquete: sigue la cabeza por arriba y deja la frente libre */}
      <path
        d="M -100 -28 Q -112 -92 -60 -118 Q 0 -140 58 -114 Q 104 -92 104 -48 Q 86 -64 60 -66 Q 30 -74 0 -72 Q -34 -70 -62 -60 Q -84 -50 -100 -28 Z"
        fill={NEGRO}
      />
      <g fill="none" stroke={NEGRO} strokeLinecap="round">
        {TRAZOS.map(([x0, y0, x1, y1, c, w], i) => {
          const mx = (x0 + x1) / 2 + c * 0.6;
          const my = (y0 + y1) / 2 - c;
          const m = v * ((i % 3) + 1) * 0.5;
          return <path key={i} d={`M ${x0} ${y0} Q ${mx} ${my} ${x1 + m} ${y1}`} strokeWidth={w} />;
        })}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- cara
const OJO_A: P = [-34, 4];
const OJO_B: P = [40, 0];

const Ojo: React.FC<{ c: P; p: Pose; parpadea: boolean }> = ({ c, p, parpadea }) => {
  const [x, y] = c;
  const tipo = parpadea && (p.ojos === "normal" || p.ojos === "abiertos" || p.ojos === "entornados") ? "cerrados" : p.ojos;
  if (tipo === "feliz") return <path d={`M ${x - 19} ${y + 8} Q ${x} ${y - 18} ${x + 19} ${y + 8}`} stroke={NEGRO} strokeWidth={8} fill="none" strokeLinecap="round" />;
  if (tipo === "cerrados") return <path d={`M ${x - 19} ${y + 2} Q ${x} ${y + 12} ${x + 19} ${y + 2}`} stroke={NEGRO} strokeWidth={7} fill="none" strokeLinecap="round" />;
  const abiertos = tipo === "abiertos";
  const rx = abiertos ? 27 : 25;
  const ry = abiertos ? 33 : 30;
  const pr = abiertos ? 7.5 : 10;
  const px = x + p.mira * 8;
  const py = y + (abiertos ? 0 : 3);
  return (
    <g>
      <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ffffff" stroke={NEGRO} strokeWidth={4.5} />
      <circle cx={px} cy={py} r={pr} fill={NEGRO} />
      <circle cx={px + pr * 0.35} cy={py - pr * 0.4} r={pr * 0.3} fill="#fff" />
      {tipo === "entornados" ? <path d={`M ${x - rx - 2} ${y - 2} Q ${x} ${y - 10} ${x + rx + 2} ${y - 2} L ${x + rx + 2} ${y - ry - 3} L ${x - rx - 2} ${y - ry - 3} Z`} fill={PIEL} stroke={NEGRO} strokeWidth={6} strokeLinejoin="round" /> : null}
    </g>
  );
};

/** Ceja gruesa: lado = -1 (ojo izquierdo, el centro de la cara queda a su derecha) o 1. */
const Ceja: React.FC<{ c: P; lado: -1 | 1; p: Pose }> = ({ c, lado, p }) => {
  const by = c[1] - 44 - p.alzaCejas * 14;
  const dentro = by + p.cejas * 9; // + enfadado: la punta interior baja
  const fuera = by - p.cejas * 4;
  const xi = c[0] - lado * 18;
  const xo = c[0] + lado * 24;
  return <path d={`M ${xo} ${fuera} Q ${(xi + xo) / 2} ${Math.min(dentro, fuera) - 7} ${xi} ${dentro}`} stroke={NEGRO} strokeWidth={10} fill="none" strokeLinecap="round" />;
};

const BocaMuneco: React.FC<{ p: Pose }> = ({ p }) => {
  const st = { stroke: NEGRO, strokeWidth: 6.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const dentro = "#2b1c1c";
  const abierta = (alto: number, sonrie: number) => {
    // boca abierta: borde de arriba en sonrisa, dientes arriba y lengua abajo
    const top = 38 - sonrie * 4;
    const d = `M -20 ${top} Q 8 ${top + 6 + sonrie * 4} 36 ${top - 2} Q 30 ${top + alto} 8 ${top + alto + 2} Q -16 ${top + alto} -20 ${top} Z`;
    return (
      <g>
        <path d={d} fill={dentro} {...st} />
        <clipPath id="mn-boca">
          <path d={d} />
        </clipPath>
        <g clipPath="url(#mn-boca)">
          <rect x={-24} y={top - 4} width={64} height={Math.min(10, alto * 0.3) + 4} fill="#fff" />
          <ellipse cx={10} cy={top + alto} rx={16} ry={Math.max(4, alto * 0.3)} fill="#9a6a6a" />
        </g>
        <path d={d} fill="none" {...st} />
      </g>
    );
  };
  return <g transform="translate(8 44) scale(1.3) translate(-8 -44)">{bocaForma()}</g>;
  function bocaForma() {
  if (p.abre > 0.08 && (p.boca === "seria" || p.boca === "media" || p.boca === "sonrisa" || p.boca === "triste")) return abierta(10 + p.abre * 30, p.boca === "triste" ? -1 : 1);
  switch (p.boca) {
    case "seria":
      return <path d="M -14 46 Q 8 50 30 44" fill="none" {...st} />;
    case "media":
      return <path d="M -12 48 Q 12 54 32 38" fill="none" {...st} />;
    case "sonrisa":
      return <path d="M -22 38 Q 6 66 38 34" fill="none" {...st} />;
    case "triste":
      return <path d="M -16 58 Q 8 40 30 56" fill="none" {...st} />;
    case "o":
      return <ellipse cx={8} cy={54} rx={12 + p.abre * 3} ry={16 + p.abre * 6} fill={dentro} {...st} />;
    case "risa":
    case "dientes":
      return abierta(40 + p.abre * 10, 2);
    case "asustada": {
      const d = "M -22 40 Q -8 32 8 38 Q 24 32 36 40 Q 38 78 8 80 Q -24 78 -22 40 Z";
      return (
        <g>
          <path d={d} fill={dentro} {...st} />
          <path d="M -16 40 Q 8 36 32 40 L 31 48 Q 8 44 -15 48 Z M -14 72 Q 8 76 30 72 L 28 66 Q 8 70 -12 66 Z" fill="#fff" />
          <path d={d} fill="none" {...st} />
        </g>
      );
    }
  }
  }
};

const Cabeza: React.FC<{ p: Pose; f: number; id: string; parpadea: boolean; lapiz?: boolean }> = ({ p, f, id, parpadea, lapiz }) => {
  // plana: blanco con una sombra lisa muy suave abajo a la izquierda y contorno negro uniforme
  const ox = 26;
  const oy = -22;
  const rr = R * 0.97;
  const luna = `M ${-R - 6} ${-R - 6} H ${R + 6} V ${R + 6} H ${-R - 6} Z M ${ox + rr} ${oy} A ${rr} ${rr} 0 1 0 ${ox - rr} ${oy} A ${rr} ${rr} 0 1 0 ${ox + rr} ${oy} Z`;
  return (
    <g>
      <circle r={R} fill={PIEL} />
      <clipPath id={`mn-cab-${id}`}>
        <circle r={R} />
      </clipPath>
      <path d={luna} fillRule="evenodd" fill={SOMBRA_PIEL} clipPath={`url(#mn-cab-${id})`} />
      {lapiz ? <path d={luna} fillRule="evenodd" fill="url(#lp-rayado)" opacity={0.5} clipPath={`url(#mn-cab-${id})`} /> : null}
      <circle r={R} fill="none" stroke={NEGRO} strokeWidth={CONTORNO} />
      <Pelo f={f} />
      <Ojo c={OJO_A} p={p} parpadea={parpadea} />
      <Ojo c={OJO_B} p={p} parpadea={parpadea} />
      <Ceja c={OJO_A} lado={-1} p={p} />
      <Ceja c={OJO_B} lado={1} p={p} />
      <BocaMuneco p={p} />
    </g>
  );
};

// ---------------------------------------------------------------- cuerpo
/** El muñeco completo en una pose (unidades del motor, pies en y = 0). */
/** lapiz: sombras con rayado de grafito (necesita <DefsLapiz/> de ./lapiz; el temblor lo pone la escena). */
export const Muneco: React.FC<{ p: Pose; f: number; id?: string; lapiz?: boolean }> = ({ p, f, id = "mn", lapiz = false }) => {
  const caderaA: P = [-20, -4];
  const caderaB: P = [20, -4];
  const pierna = (c: P, q: Pierna) => {
    const rodilla = sumaP(c, q.h, MUSLO);
    const tobillo = sumaP(rodilla, q.h + q.r, PANTORRILLA);
    return { rodilla, tobillo };
  };
  const pa = pierna(caderaA, p.pA);
  const pb = pierna(caderaB, p.pB);
  const altoCadera = Math.max(pa.tobillo[1], pb.tobillo[1]) + 16;
  const raiz: P = [p.x, -altoCadera + p.y];
  const T = (q: P): P => [q[0] + raiz[0], q[1] + raiz[1]];
  const hy = -TORSO + p.respira * 3 - p.hombros * 14;
  const hA: P = [-48, hy + 18];
  const hB: P = [48, hy + 16];
  const brazo = (h: P, b: Brazo) => {
    // sin bolsillos: con «bolsillo» los brazos cuelgan relajados
    const bb = b.mano === "bolsillo" ? { ...b, h: b.h * 0.3, c: b.c * 0.2, mano: "puno" as const } : b;
    const codo = sumaP(h, bb.h, BRAZO);
    const muneca = sumaP(codo, bb.h + bb.c, ANTEBRAZO);
    return { codo, muneca, ang: bb.h + bb.c, mano: bb.mano, giro: bb.giroMano ?? 0 };
  };
  const palo = (a: P, b: P, c: P) => <path d={`M ${a[0]} ${a[1]} Q ${b[0]} ${b[1]} ${c[0]} ${c[1]}`} fill="none" stroke={NEGRO} strokeWidth={PALO} strokeLinecap="round" />;
  const brazoDibujo = (h: P, b: Brazo) => {
    const x = brazo(h, b);
    return (
      <g>
        {palo(h, x.codo, x.muneca)}
        <g transform={`translate(${x.muneca[0]} ${x.muneca[1]}) rotate(${-x.ang}) scale(0.92)`}>
          <g transform={`rotate(${x.giro})`}>
            <ManoDibujo mano={x.mano} piel="#f8f8f6" />
          </g>
        </g>
      </g>
    );
  };
  const zapato = (tob: P) => (
    <g transform={`translate(${tob[0]} ${tob[1]})`}>
      <path d="M -20 -8 Q -24 -26 -2 -24 Q 18 -24 26 -12 Q 50 -8 52 10 L 52 16 L -24 16 Z" fill={NEGRO} stroke={NEGRO} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
  // camiseta (coordenadas del tronco: cadera en y = 0)
  const camiseta = `M -42 ${hy + 4} Q -60 ${hy + 8} -76 ${hy + 52} L -54 ${hy + 66} Q -48 ${hy + 110} -46 4 Q 0 20 46 4 Q 48 ${hy + 110} 54 ${hy + 66} L 76 ${hy + 52} Q 60 ${hy + 8} 42 ${hy + 4} Q 0 ${hy - 8} -42 ${hy + 4} Z`;
  const cuello: P = [4, hy - 2];
  const centroCabeza: P = [10, hy - CUELLO - R + 10];
  return (
    <g strokeLinejoin="round">
      <ellipse cx={p.x + 6} cy={10} rx={90 - Math.min(60, -p.y * 0.3)} ry={12} fill={lapiz ? "url(#lp-rayado2)" : "#000"} opacity={lapiz ? 0.6 : 0.14} />
      {palo(T(caderaA), T(pa.rodilla), T(pa.tobillo))}
      {palo(T(caderaB), T(pb.rodilla), T(pb.tobillo))}
      {zapato(T(pa.tobillo))}
      {zapato(T(pb.tobillo))}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {brazoDibujo(hA, p.bA)}
        <path d={camiseta} fill={ROPA} stroke={NEGRO} strokeWidth={CONTORNO} strokeLinejoin="round" />
        <path d={`M -26 ${hy + 6} Q 4 ${hy + 24} 32 ${hy + 6}`} stroke={ROPA_LUZ} strokeWidth={5} fill="none" strokeLinecap="round" />
        <path d={`M ${cuello[0]} ${cuello[1]} L ${cuello[0] + 2} ${cuello[1] - CUELLO - 6}`} stroke={NEGRO} strokeWidth={PALO} strokeLinecap="round" />
        <g transform={`translate(${centroCabeza[0]} ${centroCabeza[1] + p.respira * 1.5}) rotate(${p.cabeza} 0 ${R})`}>
          <Cabeza p={p} f={f} id={id} parpadea={parpadeo(f)} lapiz={lapiz} />
        </g>
        {brazoDibujo(hB, p.bB)}
      </g>
    </g>
  );
};

/** Parpadea 4 fotogramas cada ~3 s (con algo de azar fijo). */
function parpadeo(f: number) {
  const ciclo = 97;
  const k = f % ciclo;
  return k < 4 || (Math.floor(f / ciclo) % 3 === 1 && k > 12 && k < 16);
}

// ---------------------------------------------------------------- guion de movimientos
export type Tramo = { desde: number; anim: Anim; cara: Expresion; habla?: boolean };

/** Pose del muñeco en el fotograma f según una lista de tramos (cambia de animación con mezcla suave). */
/** Extras del kit de los romanos: boca con la voz real, gestos atados a palabras y cabeza que asiente. */
export type Habla = { boca?: number[] | null; claves?: ClaveGesto[]; golpes?: number[] };

export function poseEnTramos(tramos: Tramo[], f: number, semilla = 0, habla: Habla = {}): Pose {
  let i = 0;
  while (i + 1 < tramos.length && tramos[i + 1].desde <= f) i++;
  const tr = tramos[i];
  const ant = i > 0 ? tramos[i - 1] : tr;
  const t = f - tr.desde;
  const abre = habla.boca ? abreBoca(f, habla.boca) : tr.habla ? Math.max(0, Math.abs(Math.sin(f * 0.55)) * 0.85 * (Math.sin(f * 0.13 + 1) > -0.5 ? 1 : 0.1)) : 0;
  const p = poseCompleta({ anim: tr.anim, animAnt: ant.anim, t, expresion: tr.cara, abre, semilla, f });
  const q = ajusta(p, tr, t);
  const libre = tr.anim === "quieto" || tr.anim === "habla";
  if (habla.claves && libre) Object.assign(q, brazosEn(f, habla.claves));
  if (habla.golpes) q.cabeza += cabezaEn(f, habla.golpes);
  return q;
}

/** Ajustes a sus proporciones: feliz con los ojos abiertos; al pensar, la mano llega a la barbilla. */
function ajusta(p: Pose, tr: Tramo, t: number): Pose {
  const q = { ...p };
  if (tr.cara === "feliz") q.ojos = "normal";
  if (tr.anim === "piensa") {
    const k = Math.min(1, t / 8);
    q.bB = { h: 22 + 48 * k, c: -64 - 126 * k, mano: "puno", giroMano: 0 };
  }
  return q;
}
