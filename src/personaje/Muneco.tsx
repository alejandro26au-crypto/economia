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
const PALO = 12; // grosor de brazos y piernas

type P = [number, number];
const rad = (g: number) => (g * Math.PI) / 180;
const sumaP = (p: P, ang: number, largo: number): P => [p[0] + Math.sin(rad(ang)) * largo, p[1] + Math.cos(rad(ang)) * largo];

/** Antes llevaba el filtro de lápiz y las tramas; en el estilo limpio no hace falta nada (se deja por compatibilidad). */
export const DefsMuneco: React.FC = () => null;

// ---------------------------------------------------------------- pelo
// PELO HECHO CON LÍNEAS (como dibujado a lápiz): una masa oscura y encima muchos trazos curvos que salen de la
// coronilla, barridos hacia arriba y a la derecha, y por la izquierda caen hacia los ojos. Puntas redondas: sin
// pinchos. Los trazos sobresalen un poco de la masa y dan el contorno despeinado.
function azar(n: number) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}
type Trazo = { d: (v: number) => string; w: number; color: string };
const TRAZOS: Trazo[] = (() => {
  const out: Trazo[] = [];
  const N = 40;
  for (let i = 0; i < N; i++) {
    const k = i / (N - 1); // 0 = sien izquierda, 1 = lado derecho
    const lado = k < 0.17; // los de la izquierda caen hacia los ojos
    const grados = lado ? 205 - (k / 0.17) * 45 : 160 - ((k - 0.17) / 0.83) * 150;
    const ang = rad(grados + (azar(i) - 0.5) * 8); // 0 = derecha, 90 = arriba
    const ux = Math.cos(ang);
    const uy = -Math.sin(ang);
    const r0 = R * (0.9 + azar(i + 50) * 0.12); // nacen dentro de la masa
    const largo = R * (0.42 + azar(i + 100) * 0.28) * (lado ? 0.8 : 1);
    // hacia fuera y girados a la derecha (viento); los del lado izquierdo caen hacia abajo
    const giro = lado ? rad(95) : rad(-(25 + azar(i + 150) * 25));
    const dx = ux * Math.cos(giro) - uy * Math.sin(giro);
    const dy = ux * Math.sin(giro) + uy * Math.cos(giro);
    const b: P = [ux * r0, uy * r0];
    const c: P = [b[0] + ux * largo * 0.55, b[1] + uy * largo * 0.55];
    const t: P = [b[0] + dx * largo, b[1] + dy * largo];
    const fase = azar(i + 200) * 6;
    out.push({
      d: (v) => {
        const m = Math.sin(v + fase) * 1.8;
        return `M ${b[0].toFixed(1)} ${b[1].toFixed(1)} Q ${c[0].toFixed(1)} ${c[1].toFixed(1)} ${(t[0] + m).toFixed(1)} ${(t[1] + m * 0.3).toFixed(1)}`;
      },
      w: 4 + azar(i + 250) * 4,
      color: NEGRO,
    });
  }
  // líneas de peinado por dentro de la masa (gris grafito), siguiendo el barrido hacia arriba-derecha
  for (let i = 0; i < 11; i++) {
    const x = -78 + i * 15 + azar(i + 400) * 8;
    const y = -66 - Math.abs(Math.sin((i / 10) * Math.PI)) * 14 - azar(i + 450) * 8;
    const l = 34 + azar(i + 500) * 22;
    out.push({ d: () => `M ${x.toFixed(1)} ${y.toFixed(1)} q ${(l * 0.25).toFixed(1)} ${(-l * 0.6).toFixed(1)} ${(l * 0.7).toFixed(1)} ${(-l * 0.8).toFixed(1)}`, w: 2.6, color: "#6a6866" });
  }
  return out;
})();

const Pelo: React.FC<{ f: number }> = ({ f }) => {
  const v = f / 13; // se mueve un poco con el cuerpo
  return (
    <g>
      {/* masa: de la sien izquierda (baja) a la derecha, con el nacimiento del pelo alto */}
      <path
        d={`M -102 -12 Q -124 -96 -66 -124 Q -14 -150 40 -136 Q 98 -120 108 -60 Q 110 -44 100 -36 Q 84 -56 62 -60 Q 30 -72 0 -70 Q -34 -68 -62 -56 Q -84 -40 -102 -12 Z`}
        fill="#262523"
        stroke={NEGRO}
        strokeWidth={4}
        strokeLinejoin="round"
      />
      <g fill="none" strokeLinecap="round">
        {TRAZOS.map((t, i) => (
          <path key={i} d={t.d(v)} stroke={t.color} strokeWidth={t.w} />
        ))}
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
