// EL PROTAGONISTA DEL CANAL, animado por partes (estilo de la hoja del usuario: lápiz, blanco y negro).
// Cabeza grande con sombreado a lápiz, pelo negro despeinado, ojos grandes, cejas gruesas, camiseta negra,
// brazos y piernas de palo negros, manos blancas con dedos y zapatos negros.
// Lo mueve el esqueleto del motor (src/bent/animaciones.ts): camina, corre, habla, señala, piensa, encoge,
// saluda, victoria, asustado, cruza, salta, mira; y la cara (expresión + boca al hablar + parpadeo).
import React from "react";
import { Brazo, ManoDibujo, Pierna, Pose } from "../bent/rig";
import { Anim, Expresion, poseCompleta } from "../bent/animaciones";

export const NEGRO = "#151515";
const PIEL = "#fbfbf9";
const ROPA = "#1f1e20";

// proporciones (pies en y = 0; mide ~650 hasta la punta del pelo)
const MUSLO = 112;
const PANTORRILLA = 112;
const BRAZO = 110;
const ANTEBRAZO = 102;
const R = 104; // radio de la cabeza
const TORSO = 185; // de la cadera al hombro
const CUELLO = 14;
const PALO = 12; // grosor de brazos y piernas

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const sumaP = (p: P, ang: number, largo: number): P => [p[0] + Math.sin(rad(ang)) * largo, p[1] + Math.cos(rad(ang)) * largo];

/** Filtros y tramas del muñeco (ponerlo una vez dentro del <svg>). */
export const DefsMuneco: React.FC = () => (
  <defs>
    <filter id="mn-lapiz" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves={2} seed={4} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={3} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <pattern id="mn-rayado" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1={0} y1={0} x2={0} y2={9} stroke="#3a3a3a" strokeWidth={1.6} />
    </pattern>
    <pattern id="mn-rayado2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1={0} y1={0} x2={0} y2={9} stroke="#3a3a3a" strokeWidth={1.2} />
    </pattern>
    <pattern id="mn-brillo" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(70)">
      <line x1={0} y1={0} x2={0} y2={12} stroke="#8a8a8c" strokeWidth={2} />
    </pattern>
  </defs>
);

// ---------------------------------------------------------------- pelo
/** Mechón afilado: de la base (b) a la punta (t), curvado hacia un lado. */
function mechon(b: P, t: P, ancho: number, curva: number) {
  const mx = (b[0] + t[0]) / 2;
  const my = (b[1] + t[1]) / 2;
  const dx = t[0] - b[0];
  const dy = t[1] - b[1];
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const c: P = [mx + nx * curva, my + ny * curva];
  return `M ${b[0] - nx * ancho} ${b[1] - ny * ancho} Q ${c[0] - nx * ancho * 0.4} ${c[1] - ny * ancho * 0.4} ${t[0]} ${t[1]} Q ${c[0] + nx * ancho * 0.4} ${c[1] + ny * ancho * 0.4} ${b[0] + nx * ancho} ${b[1] + ny * ancho} Z`;
}

// Pelo copiado de la hoja del usuario: masa negra sobre la coronilla con la frente despejada, mechones largos
// y afilados barridos hacia ARRIBA y a la DERECHA, y mechones que caen por el lado IZQUIERDO hasta los ojos.
// [base, punta, ancho en la base, curva]
const MECHONES: [P, P, number, number][] = [
  // lado izquierdo: caen pegados a la cabeza hasta los ojos
  [[-92, -30], [-122, 22], 10, -12],
  [[-96, -56], [-134, -14], 11, -12],
  [[-86, -78], [-136, -62], 11, -10],
  // arriba: suben y se doblan hacia la derecha (como con viento)
  [[-66, -90], [-96, -140], 12, 14],
  [[-44, -100], [-52, -152], 12, 16],
  [[-18, -104], [10, -160], 13, 18],
  [[8, -104], [60, -152], 13, 18],
  [[32, -98], [100, -136], 13, 16],
  // derecha: barridos hacia la derecha
  [[56, -86], [134, -104], 12, 14],
  [[76, -70], [148, -66], 11, 12],
  [[90, -50], [136, -26], 9, 8],
  // capa de mechones finos entre los gruesos
  [[-56, -96], [-84, -150], 7, 12],
  [[-4, -104], [24, -166], 7, 16],
  [[20, -102], [84, -150], 7, 16],
  [[46, -94], [124, -126], 7, 12],
];
// pelos sueltos finos
const SUELTOS: [P, P, number, number][] = [
  [[-28, -102], [-60, -166], 3, 10],
  [[40, -98], [120, -150], 3, 12],
];
const PICOS: [P, P, number, number][] = [];

const Pelo: React.FC<{ f: number }> = ({ f }) => {
  const v = Math.sin(f / 13) * 1.8; // se mueve un poco con el cuerpo
  const mueve = (t: P, i: number): P => [t[0] + v * ((i % 3) + 1) * 0.6, t[1] + v * 0.4];
  return (
    <g fill={NEGRO}>
      {/* masa: de la sien izquierda (baja) a la derecha, con el nacimiento del pelo alto y casi recto */}
      <path
        d={`M -100 -16 Q -118 -84 -70 -112 Q -24 -142 26 -130 Q 84 -118 100 -64 Q 104 -46 98 -36 Q 84 -56 62 -60 Q 30 -72 0 -70 Q -34 -68 -62 -56 Q -82 -42 -100 -16 Z`}
      />
      {MECHONES.map(([b, t, a, c], i) => (
        <path key={i} d={mechon(b, mueve(t, i), a, c)} />
      ))}
      {SUELTOS.map(([b, t, a, c], i) => (
        <path key={`s${i}`} d={mechon(b, mueve(t, i + 1), a, c)} />
      ))}
      {PICOS.map(([b, t, a, c], i) => (
        <path key={`p${i}`} d={mechon(b, t, a, c)} />
      ))}
      {/* vetas a lápiz siguiendo el peinado */}
      <path d="M -60 -80 Q -40 -110 -20 -124 M -20 -92 Q 10 -118 40 -128 M 20 -86 Q 60 -100 96 -108 M -84 -50 Q -100 -40 -112 -10" stroke="#5a5a5c" strokeWidth={2.5} fill="none" strokeLinecap="round" />
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

const Cabeza: React.FC<{ p: Pose; f: number; id: string; parpadea: boolean }> = ({ p, f, id, parpadea }) => {
  // sombreado a lápiz: media luna abajo a la izquierda
  const ox = 22;
  const oy = -18;
  const rr = R * 0.93;
  const luna = `M ${-R - 6} ${-R - 6} H ${R + 6} V ${R + 6} H ${-R - 6} Z M ${ox + rr} ${oy} A ${rr} ${rr} 0 1 0 ${ox - rr} ${oy} A ${rr} ${rr} 0 1 0 ${ox + rr} ${oy} Z`;
  return (
    <g>
      <circle r={R} fill={PIEL} />
      <clipPath id={`mn-cab-${id}`}>
        <circle r={R - 3} />
      </clipPath>
      <g clipPath={`url(#mn-cab-${id})`}>
        <path d={luna} fillRule="evenodd" fill="#d8d8d6" opacity={0.7} />
        <path d={luna} fillRule="evenodd" fill="url(#mn-rayado)" opacity={0.6} />
      </g>
      <circle r={R} fill="none" stroke={NEGRO} strokeWidth={8} />
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
export const Muneco: React.FC<{ p: Pose; f: number; id?: string }> = ({ p, f, id = "mn" }) => {
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
      <path d="M -10 -14 Q 6 -20 18 -14" fill="none" stroke="#8a8a8c" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  // camiseta (coordenadas del tronco: cadera en y = 0)
  const camiseta = `M -42 ${hy + 4} Q -60 ${hy + 8} -76 ${hy + 52} L -54 ${hy + 66} Q -48 ${hy + 110} -46 4 Q 0 20 46 4 Q 48 ${hy + 110} 54 ${hy + 66} L 76 ${hy + 52} Q 60 ${hy + 8} 42 ${hy + 4} Q 0 ${hy - 8} -42 ${hy + 4} Z`;
  const cuello: P = [4, hy - 2];
  const centroCabeza: P = [10, hy - CUELLO - R + 10];
  return (
    <g filter="url(#mn-lapiz)">
      <ellipse cx={p.x + 6} cy={10} rx={95 - Math.min(60, -p.y * 0.3)} ry={13} fill="url(#mn-rayado2)" opacity={0.5} />
      {palo(T(caderaA), T(pa.rodilla), T(pa.tobillo))}
      {palo(T(caderaB), T(pb.rodilla), T(pb.tobillo))}
      {zapato(T(pa.tobillo))}
      {zapato(T(pb.tobillo))}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {brazoDibujo(hA, p.bA)}
        <path d={camiseta} fill={ROPA} stroke={NEGRO} strokeWidth={6} strokeLinejoin="round" />
        <path d={camiseta} fill="url(#mn-brillo)" opacity={0.35} />
        <path d={`M -40 ${hy + 30} Q -46 ${hy + 100} -40 -10`} stroke="#6a6a6c" strokeWidth={3} fill="none" opacity={0.6} />
        <path d={`M -28 ${hy + 6} Q 4 ${hy + 22} 34 ${hy + 6}`} stroke="#6a6a6c" strokeWidth={3} fill="none" />
        <path d={`M ${cuello[0]} ${cuello[1]} L ${cuello[0] + 2} ${cuello[1] - CUELLO - 6}`} stroke={NEGRO} strokeWidth={PALO} strokeLinecap="round" />
        <g transform={`translate(${centroCabeza[0]} ${centroCabeza[1] + p.respira * 1.5}) rotate(${p.cabeza} 0 ${R})`}>
          <Cabeza p={p} f={f} id={id} parpadea={parpadeo(f)} />
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
export function poseEnTramos(tramos: Tramo[], f: number, semilla = 0): Pose {
  let i = 0;
  while (i + 1 < tramos.length && tramos[i + 1].desde <= f) i++;
  const tr = tramos[i];
  const ant = i > 0 ? tramos[i - 1] : tr;
  const t = f - tr.desde;
  const abre = tr.habla ? Math.max(0, Math.abs(Math.sin(f * 0.55)) * 0.85 * (Math.sin(f * 0.13 + 1) > -0.5 ? 1 : 0.1)) : 0;
  const p = poseCompleta({ anim: tr.anim, animAnt: ant.anim, t, expresion: tr.cara, abre, semilla, f });
  return ajusta(p, tr, t);
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
