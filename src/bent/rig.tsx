// BENT como muñeco articulado (animación por recortes), dibujado en código a partir de referencias/personaje.jpg:
// cabeza blanca redonda, gorra azul marino hacia atrás, sudadera negra con capucha, cordones y bolsillo canguro,
// mochila, pantalón negro y zapatillas altas de suela blanca.
// Unidades: los pies están en y = 0 y la persona mide ~900 de alto. Vista de 3/4 casi frontal, como la referencia:
// la cara mira un poco a la DERECHA (+x) y la mochila asoma por la izquierda. Ángulos en pantalla: 0 = hacia abajo,
// positivo = gira hacia la derecha (+x). bA = brazo izquierdo de la pantalla; bB = derecho.
// Toda la población es de su especie: el mismo cuerpo con otra ropa, sombrero y detalles (ver `Atuendo`).
import React from "react";

export const TINTA = "#060608";
const L = 7; // grosor del contorno

// ---------------------------------------------------------------- pose
export type Mano = "puno" | "abierta" | "senala" | "v" | "bolsillo" | "pulgar";
export type Ojos = "normal" | "abiertos" | "feliz" | "cerrados" | "entornados";
export type Boca = "seria" | "media" | "sonrisa" | "risa" | "dientes" | "o" | "asustada" | "triste";
export type Brazo = { h: number; c: number; mano: Mano; giroMano?: number }; // h: hombro (0 = colgando); c: codo (se suma)
export type Pierna = { h: number; r: number }; // h: cadera (0 = recta); r: rodilla (se suma)
export type Pose = {
  x: number; // desplazamiento del cuerpo (unidades)
  y: number; // salto (negativo = arriba)
  inclina: number; // inclinación del tronco (grados, + hacia delante)
  cabeza: number; // giro de la cabeza (grados, + mira abajo/delante)
  hombros: number; // 0..1 encoger hombros
  respira: number; // -1..1
  bA: Brazo; // brazo del fondo
  bB: Brazo; // brazo de delante
  pA: Pierna;
  pB: Pierna;
  cejas: number; // -1 tristes/preocupadas … 0 normales … 1 enfadadas
  alzaCejas: number; // 0..1 sorpresa
  ojos: Ojos;
  mira: number; // -1..1 hacia dónde miran las pupilas
  boca: Boca;
  abre: number; // 0..1 boca abierta al hablar
};

export const POSE_BASE: Pose = {
  x: 0,
  y: 0,
  inclina: 0,
  cabeza: 0,
  hombros: 0,
  respira: 0,
  bA: { h: -22, c: 64, mano: "bolsillo" },
  bB: { h: 22, c: -64, mano: "bolsillo" },
  pA: { h: -5, r: 2 },
  pB: { h: 9, r: -3 },
  cejas: 0.8,
  alzaCejas: 0,
  ojos: "normal",
  mira: 0.3,
  boca: "seria",
  abre: 0,
};

const mezN = (a: number, b: number, t: number) => a + (b - a) * t;
/** Mezcla dos poses (t = 0 → a, 1 → b). Lo que no es número cambia a mitad. */
export function mezclaPose(a: Pose, b: Pose, t: number): Pose {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const br = (x: Brazo, y: Brazo): Brazo => ({ h: mezN(x.h, y.h, t), c: mezN(x.c, y.c, t), mano: t < 0.5 ? x.mano : y.mano, giroMano: mezN(x.giroMano ?? 0, y.giroMano ?? 0, t) });
  const pi = (x: Pierna, y: Pierna): Pierna => ({ h: mezN(x.h, y.h, t), r: mezN(x.r, y.r, t) });
  return {
    x: mezN(a.x, b.x, t),
    y: mezN(a.y, b.y, t),
    inclina: mezN(a.inclina, b.inclina, t),
    cabeza: mezN(a.cabeza, b.cabeza, t),
    hombros: mezN(a.hombros, b.hombros, t),
    respira: mezN(a.respira, b.respira, t),
    bA: br(a.bA, b.bA),
    bB: br(a.bB, b.bB),
    pA: pi(a.pA, b.pA),
    pB: pi(a.pB, b.pB),
    cejas: mezN(a.cejas, b.cejas, t),
    alzaCejas: mezN(a.alzaCejas, b.alzaCejas, t),
    ojos: t < 0.5 ? a.ojos : b.ojos,
    mira: mezN(a.mira, b.mira, t),
    boca: t < 0.5 ? a.boca : b.boca,
    abre: mezN(a.abre, b.abre, t),
  };
}

// ---------------------------------------------------------------- atuendo (toda la especie)
export type Atuendo = {
  sudadera: string; // color principal de la parte de arriba
  sudaderaSombra: string;
  pantalon: string;
  zapato: string;
  suela: string;
  mochila: boolean;
  capucha: boolean;
  cremallera: boolean;
  bolsillo: boolean;
  cuello?: "camiseta" | "marinero" | "camisa";
  bata?: boolean; // científico: bata blanca abierta encima
  botones?: string; // chaqueta con botones dorados
  capa?: string;
  sombrero: "gorra-atras" | "marinero" | "capitan" | "corona" | "pelo-corto" | "canoso" | "gorro" | "calvo";
  colorSombrero: string;
  barba?: string;
  bigote?: string;
  gafas?: boolean;
  escala?: [number, number]; // complexión: ancho, alto
};

export const BENT: Atuendo = {
  sudadera: "#232328",
  sudaderaSombra: "#15151a",
  pantalon: "#1d1d22",
  zapato: "#18181d",
  suela: "#eceef2",
  mochila: true,
  capucha: true,
  cremallera: true,
  bolsillo: true,
  cuello: "camiseta",
  sombrero: "gorra-atras",
  colorSombrero: "#1c2444",
};

// ---------------------------------------------------------------- geometría
const rad = (g: number) => (g * Math.PI) / 180;
type P = [number, number];
const sumaP = (p: P, ang: number, largo: number): P => [p[0] + Math.sin(rad(ang)) * largo, p[1] + Math.cos(rad(ang)) * largo];

// proporciones medidas en referencias/personaje.jpg: piernas cortas, tronco ancho, cabeza grande
const MUSLO = 150;
const PANTORRILLA = 146;
const TOBILLO = 66;
const BRAZO = 120;
const ANTEBRAZO = 110;
const R = 110; // radio de la cabeza
const HOMBRO_Y = -300; // altura de los hombros sobre la cadera
const CABEZA: P = [6, -425]; // centro de la cabeza sobre la cadera

/** Extremidad gruesa (manga o pernera) con contorno, sombra, brillo y arrugas en la articulación. */
const Extremidad: React.FC<{ pts: P[]; ancho: number; color: string; sombra: string; brillo?: string }> = ({ pts, ancho, color, sombra, brillo = "#3d3d46" }) => {
  const d = `M ${pts.map((p) => p.join(" ")).join(" L ")}`;
  const desplaza = (dx: number, dy: number) => `M ${pts.map((p) => [p[0] + dx, p[1] + dy].join(" ")).join(" L ")}`;
  const [a, b, c] = pts;
  const pliegue = (q: P, k: number) => <path d={`M ${q[0] - ancho * 0.28} ${q[1] - 6 * k} Q ${q[0]} ${q[1] + 4} ${q[0] + ancho * 0.28} ${q[1] - 6 * k}`} fill="none" stroke="#000" strokeOpacity={0.55} strokeWidth={3.5} strokeLinecap="round" />;
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} stroke={TINTA} strokeWidth={ancho + L * 2} />
      <path d={d} stroke={color} strokeWidth={ancho} />
      <path d={desplaza(-ancho * 0.22, 0)} stroke={sombra} strokeWidth={ancho * 0.42} />
      <path d={desplaza(ancho * 0.22, -2)} stroke={brillo} strokeWidth={ancho * 0.1} strokeOpacity={0.8} />
      {b && c && pliegue(b, 1)}
    </g>
  );
};

/** Mano blanca redondeada en su gesto. Dibujada apuntando hacia +y local. */
export const ManoDibujo: React.FC<{ mano: Mano; piel?: string }> = ({ mano, piel = "#f4f5f7" }) => {
  const st = { stroke: TINTA, strokeWidth: L * 0.8, strokeLinejoin: "round" as const };
  if (mano === "bolsillo") return null;
  const dedo = (x: number, y: number, ang: number, largo = 32) => <rect x={-8} y={0} width={16} height={largo} rx={8} fill={piel} {...st} transform={`translate(${x} ${y}) rotate(${ang})`} />;
  return (
    <g>
      {mano === "senala" && dedo(4, 18, -6, 42)}
      {mano === "v" && (
        <g>
          {dedo(-8, 16, 16, 42)}
          {dedo(8, 16, -14, 42)}
        </g>
      )}
      {mano === "pulgar" && dedo(-20, -4, 160, 30)}
      {mano === "abierta" && (
        <g>
          {dedo(-18, 12, 30, 28)}
          {dedo(-7, 18, 8, 34)}
          {dedo(6, 18, -6, 34)}
          {dedo(17, 14, -22, 30)}
        </g>
      )}
      <ellipse cx={0} cy={16} rx={27} ry={25} fill={piel} {...st} />
      <path d="M -12 26 Q 0 32 14 26" fill="none" stroke="#c4c8d1" strokeWidth={4} strokeLinecap="round" />
      {(mano === "puno" || mano === "senala" || mano === "pulgar") && <path d="M -14 6 L -14 18 M -3 4 L -3 16 M 8 4 L 8 16" stroke="#b5b9c4" strokeWidth={3} strokeLinecap="round" />}
    </g>
  );
};

// ---------------------------------------------------------------- cara (3/4 mirando a la derecha)
export const Cara: React.FC<{ p: Pose; f: number }> = ({ p, f }) => {
  const fx = 16;
  const fy = 30;
  const ojoA: P = [fx - 34, fy];
  const ojoB: P = [fx + 32, fy - 4];
  const k = (f + 17) % 113;
  const parpadeo = k < 4 ? 1 - Math.abs(k - 2) / 2 : 0;
  const ojos = (p.ojos === "normal" || p.ojos === "entornados") && parpadeo > 0.6 ? "cerrados" : p.ojos;
  const ceja = (o: P, lado: -1 | 1) => {
    const sube = -p.alzaCejas * 20;
    const xi = o[0] - lado * 10;
    const xe = o[0] + lado * 30;
    const yi = o[1] - 22 + 10 * p.cejas + sube;
    const ye = o[1] - 28 - 8 * p.cejas + sube + (p.cejas < 0 ? 7 * -p.cejas : 0);
    const g = 13;
    return <path d={`M ${xe} ${ye} Q ${(xi + xe) / 2} ${Math.min(yi, ye) - 5} ${xi} ${yi} L ${xi - lado * 2} ${yi + g} Q ${(xi + xe) / 2} ${Math.min(yi, ye) + g - 2} ${xe + lado * 3} ${ye + 5} Z`} fill={TINTA} stroke={TINTA} strokeWidth={3} strokeLinejoin="round" />;
  };
  const ojo = (o: P, kx: number) => {
    const [x, y] = o;
    const m = p.mira * 4;
    if (ojos === "feliz") return <path d={`M ${x - 13 * kx} ${y + 5} Q ${x} ${y - 11} ${x + 13 * kx} ${y + 5}`} fill="none" stroke={TINTA} strokeWidth={7} strokeLinecap="round" />;
    if (ojos === "cerrados") return <path d={`M ${x - 13 * kx} ${y + 2} Q ${x} ${y + 7} ${x + 13 * kx} ${y + 2}`} fill="none" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />;
    if (ojos === "abiertos")
      return (
        <g>
          <ellipse cx={x} cy={y + 2} rx={15 * kx} ry={18} fill="#ffffff" stroke={TINTA} strokeWidth={5} />
          <circle cx={x + m} cy={y + 3} r={5.5} fill={TINTA} />
        </g>
      );
    const alto = ojos === "entornados" ? 7 : 14;
    return (
      <g>
        <path d={`M ${x - 17 * kx} ${y - 3} L ${x + 17 * kx} ${y - 8} Q ${x + 15 * kx} ${y + alto} ${x + m * 0.3} ${y + alto} Q ${x - 15 * kx} ${y + alto - 1} ${x - 17 * kx} ${y - 3} Z`} fill={TINTA} />
        <circle cx={x + 5 + m * 0.4} cy={y + 1} r={3.2} fill="#ffffff" opacity={0.85} />
      </g>
    );
  };
  const bx = fx + 2;
  const by = fy + 50;
  const a = p.abre;
  const st = { stroke: TINTA, strokeWidth: 5.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let boca: React.ReactNode;
  if (p.boca === "risa" || (p.boca === "sonrisa" && a > 0.3)) {
    const h = 24 + a * 10;
    boca = (
      <g>
        <path d={`M ${bx - 30} ${by - 8} Q ${bx} ${by - 2} ${bx + 30} ${by - 10} Q ${bx + 20} ${by + h} ${bx} ${by + h} Q ${bx - 20} ${by + h} ${bx - 30} ${by - 8} Z`} fill="#4a0f18" {...st} />
        <path d={`M ${bx - 16} ${by + h - 4} Q ${bx} ${by + h * 0.45} ${bx + 16} ${by + h - 5} Q ${bx} ${by + h + 1} ${bx - 16} ${by + h - 4} Z`} fill="#e45a6a" />
        <path d={`M ${bx - 25} ${by - 7} L ${bx + 25} ${by - 9} L ${bx + 22} ${by} L ${bx - 22} ${by + 1} Z`} fill="#ffffff" />
      </g>
    );
  } else if (p.boca === "dientes") {
    boca = (
      <g>
        <path d={`M ${bx - 36} ${by - 12} Q ${bx} ${by + 2} ${bx + 36} ${by - 16} Q ${bx + 26} ${by + 18} ${bx} ${by + 18} Q ${bx - 26} ${by + 16} ${bx - 36} ${by - 12} Z`} fill="#ffffff" {...st} />
        <path d={`M ${bx - 31} ${by - 2} Q ${bx} ${by + 9} ${bx + 31} ${by - 5} M ${bx - 14} ${by - 6} L ${bx - 14} ${by + 15} M ${bx} ${by - 4} L ${bx} ${by + 17} M ${bx + 14} ${by - 7} L ${bx + 14} ${by + 15}`} fill="none" stroke={TINTA} strokeWidth={3} />
      </g>
    );
  } else if (p.boca === "o" || p.boca === "asustada" || a > 0.15) {
    const rx = p.boca === "asustada" ? 20 : p.boca === "o" ? 10 : 13;
    const ry = p.boca === "asustada" ? 18 : p.boca === "o" ? 12 : 3 + a * 13;
    boca = (
      <g>
        <ellipse cx={bx} cy={by + ry * 0.4} rx={rx} ry={ry} fill="#4a0f18" {...st} />
        {ry > 8 && <ellipse cx={bx} cy={by + ry * 0.85} rx={rx * 0.6} ry={ry * 0.35} fill="#e45a6a" />}
      </g>
    );
  } else if (p.boca === "sonrisa") {
    boca = <path d={`M ${bx - 18} ${by - 2} Q ${bx} ${by + 10} ${bx + 20} ${by - 7}`} fill="none" {...st} />;
  } else if (p.boca === "media") {
    boca = <path d={`M ${bx - 16} ${by + 2} Q ${bx + 2} ${by + 3} ${bx + 18} ${by - 7}`} fill="none" {...st} />;
  } else if (p.boca === "triste") {
    boca = <path d={`M ${bx - 17} ${by + 6} Q ${bx} ${by - 7} ${bx + 17} ${by + 5}`} fill="none" {...st} />;
  } else {
    boca = <path d={`M ${bx - 22} ${by + 1} Q ${bx} ${by - 4} ${bx + 22} ${by + 3}`} fill="none" {...st} strokeWidth={6.5} />;
  }
  return (
    <g>
      {ceja(ojoA, -1)}
      {ceja(ojoB, 1)}
      {ojo(ojoA, 0.9)}
      {ojo(ojoB, 1)}
      {boca}
    </g>
  );
};

// ---------------------------------------------------------------- sombreros (cabeza de radio R, centro en 0,0)
const Sombrero: React.FC<{ a: Atuendo; delante: boolean }> = ({ a, delante }) => {
  const c = a.colorSombrero;
  const st = { stroke: TINTA, strokeWidth: L, strokeLinejoin: "round" as const };
  switch (a.sombrero) {
    case "gorra-atras":
      return delante ? (
        <g transform="rotate(-9)">
          {/* copa: cubre la mitad de arriba de la cabeza y un poco más */}
          <path d={`M -122 2 Q -136 -142 -4 -160 Q 124 -168 126 -16 Q 96 -42 50 -46 Q -40 -48 -122 2 Z`} fill={c} {...st} />
          <path d={`M -104 -80 Q -76 -136 -20 -150`} fill="none" stroke="#3b4a7c" strokeWidth={10} strokeLinecap="round" opacity={0.55} />
          <path d={`M -70 -124 Q -44 -88 -44 -46 M 40 -156 Q 64 -110 66 -48`} fill="none" stroke="#0c1124" strokeWidth={4.5} />
          <ellipse cx={-4} cy={-162} rx={15} ry={8} fill={c} {...st} strokeWidth={4.5} />
          {/* hueco del cierre (delante): frente blanca y tira con agujeros */}
          <path d={`M -44 -46 Q -42 -100 0 -104 Q 44 -102 50 -44 Q 0 -54 -44 -46 Z`} fill="#f4f5f7" {...st} strokeWidth={5.5} />
          <path d={`M -44 -47 Q 2 -58 50 -45 L 50 -32 Q 2 -46 -44 -34 Z`} fill="#0f1428" stroke={TINTA} strokeWidth={3.5} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={-28 + i * 15} cy={-41 - Math.sin((i / 4) * Math.PI) * 3} r={2.8} fill="#5b6280" />
          ))}
        </g>
      ) : (
        // visera hacia atrás, asomando por la derecha (nuca)
        <g transform="rotate(-9)">
          <path d={`M 80 -52 Q 180 -48 214 18 Q 160 34 96 2 Z`} fill="#161c38" {...st} />
          <path d={`M 104 -30 Q 170 -24 200 14`} fill="none" stroke="#2e3a66" strokeWidth={6} strokeLinecap="round" />
        </g>
      );
    case "marinero":
      return delante ? (
        <g transform="rotate(-8)">
          <path d={`M -88 -64 Q -92 -160 0 -164 Q 92 -160 88 -64 Z`} fill="#eef0f3" {...st} />
          <path d={`M 26 -156 Q 82 -140 82 -70 L 50 -70 Z`} fill="#c9ced8" />
          <path d={`M -116 -62 Q 0 -40 116 -62 Q 118 -94 0 -104 Q -118 -94 -116 -62 Z`} fill="#f8f9fb" {...st} />
        </g>
      ) : null;
    case "capitan":
      return delante ? (
        <g>
          <path d={`M -98 -66 L -96 -104 L 98 -104 L 100 -66 Z`} fill="#121318" {...st} />
          <path d={`M -100 -102 Q -152 -150 -10 -162 Q 146 -156 100 -102 Z`} fill="#f2f3f5" {...st} />
          <path d={`M 14 -156 Q 112 -150 94 -106 L 48 -106 Z`} fill="#c8ccd5" />
          <path d={`M -70 -68 Q 10 -26 92 -64 Q 20 -76 -70 -68 Z`} fill="#0a0b0e" {...st} />
          <path d={`M 2 -92 l 16 -13 l 16 13 l -16 13 Z`} fill="#d1a94c" stroke={TINTA} strokeWidth={3.5} />
        </g>
      ) : null;
    case "corona":
      return delante ? (
        <g {...st}>
          <path d={`M -108 -30 Q -118 -100 -60 -100 L 60 -100 Q 118 -100 108 -30 Q 86 -72 0 -74 Q -86 -72 -108 -30 Z`} fill={c} />
          <path d={`M -74 -92 L -86 -168 L -38 -128 L 0 -180 L 38 -128 L 86 -168 L 74 -92 Z`} fill="#d8b04e" />
          {[-40, 0, 40].map((x, i) => (
            <circle key={x} cx={x} cy={-108} r={8} fill={["#9b1b2a", "#1f4fa0", "#9b1b2a"][i]} strokeWidth={3.5} />
          ))}
        </g>
      ) : null;
    case "pelo-corto":
      return delante ? <path d={`M -112 -10 Q -126 -132 0 -128 Q 122 -126 112 -28 Q 92 -64 48 -66 Q 0 -52 -44 -72 Q -92 -60 -112 -10 Z`} fill={c} {...st} /> : null;
    case "canoso":
      return delante ? (
        <g fill={c} {...st}>
          <path d={`M -86 -76 q -60 -12 -50 36 q -44 12 -20 42 q -28 24 10 30 Q -104 0 -86 -76 Z`} />
          <path d={`M 86 -76 q 60 -12 50 36 q 44 12 20 42 q 28 24 -10 30 Q 104 0 86 -76 Z`} />
          <path d={`M -48 -100 q 8 -48 40 -16 q 22 -44 48 -8 q 34 -30 40 12 Q 40 -84 -48 -100 Z`} />
        </g>
      ) : null;
    case "gorro":
      return delante ? (
        <g {...st}>
          <path d={`M -104 -46 Q -114 -156 0 -160 Q 114 -156 104 -46 Z`} fill={c} />
          <path d={`M -112 -38 L 112 -38 L 110 -74 L -110 -74 Z`} fill={c} />
          <path d={`M -72 -74 L -72 -40 M -36 -74 L -36 -38 M 0 -74 L 0 -38 M 36 -74 L 36 -38 M 72 -74 L 72 -40`} stroke="#000" strokeOpacity={0.25} strokeWidth={5} />
        </g>
      ) : null;
    default:
      return null;
  }
};

const Cabeza: React.FC<{ p: Pose; a: Atuendo; f: number; id: string }> = ({ p, a, f, id }) => (
  <g>
    <Sombrero a={a} delante={false} />
    <circle r={R} fill="#f4f5f7" stroke={TINTA} strokeWidth={L} />
    <clipPath id={`cab${id}`}>
      <circle r={R - 3} />
    </clipPath>
    <g clipPath={`url(#cab${id})`}>
      {/* sombra en el lado de la nuca (derecha) y bajo la barbilla */}
      <ellipse cx={128} cy={10} rx={64} ry={140} fill="#c4c7d0" />
      <ellipse cx={0} cy={140} rx={140} ry={44} fill="#d4d7de" />
    </g>
    {a.barba && <path d={`M -86 40 Q -76 140 22 146 Q 110 136 100 36 Q 80 76 44 82 Q 10 92 -24 76 Q -60 70 -86 40 Z`} fill={a.barba} stroke={TINTA} strokeWidth={L * 0.9} strokeLinejoin="round" />}
    <Cara p={p} f={f} />
    {a.bigote && <path d={`M 26 58 Q 0 48 -24 66 Q 4 64 26 68 Q 52 64 76 66 Q 54 48 26 58 Z`} fill={a.bigote} stroke={TINTA} strokeWidth={4} />}
    {a.gafas && (
      <g fill="#dff3ff" fillOpacity={0.18} stroke={TINTA} strokeWidth={5.5}>
        <circle cx={-8} cy={22} r={22} />
        <circle cx={52} cy={19} r={22} />
        <path d="M 14 21 L 30 20" fill="none" />
      </g>
    )}
    <Sombrero a={a} delante />
  </g>
);

// ---------------------------------------------------------------- cuerpo entero
export const Muneco: React.FC<{ p: Pose; a?: Atuendo; f: number; id?: string }> = ({ p, a = BENT, f, id = "b" }) => {
  const caderaA: P = [-42, -6];
  const caderaB: P = [42, -6];
  const pierna = (c: P, q: Pierna) => {
    const rodilla = sumaP(c, q.h, MUSLO);
    const tobillo = sumaP(rodilla, q.h + q.r, PANTORRILLA);
    return { rodilla, tobillo };
  };
  const pa = pierna(caderaA, p.pA);
  const pb = pierna(caderaB, p.pB);
  const altoCadera = Math.max(pa.tobillo[1], pb.tobillo[1]) + TOBILLO;
  const raiz: P = [p.x, -altoCadera + p.y];
  const T = (q: P): P => [q[0] + raiz[0], q[1] + raiz[1]];
  const respira = p.respira * 4;
  const ropa = a.bata ? "#e6e9ee" : a.sudadera;
  const ropaSombra = a.bata ? "#c4c9d2" : a.sudaderaSombra;

  // zapatilla alta de 3/4: lado -1 = punta hacia la izquierda
  const zapato = (tob: P, lado: -1 | 1, ang: number) => (
    <g transform={`translate(${tob[0]} ${tob[1]}) rotate(${ang * 0.3}) scale(${lado} 1)`}>
      <path d="M -40 -8 Q -46 -44 -16 -50 L 22 -48 Q 32 -26 52 -18 Q 90 -10 94 22 L 94 40 L -44 40 Z" fill={a.zapato} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" transform="translate(0 20)" />
      <path d="M -46 56 L 96 56 L 96 72 Q 30 78 -46 74 Z" fill={a.suela} stroke={TINTA} strokeWidth={L * 0.8} strokeLinejoin="round" />
      <path d="M 0 -6 L 18 8 M 10 -14 L 28 0 M 20 -20 L 36 -8" stroke="#3d3d47" strokeWidth={4.5} strokeLinecap="round" />
      <path d="M -36 40 Q 20 46 86 40" fill="none" stroke="#3d3d47" strokeWidth={4} />
    </g>
  );

  const hombroY = HOMBRO_Y - p.hombros * 30 + respira;
  const hA: P = [-96, hombroY + 18];
  const hB: P = [96, hombroY + 16];
  const brazo = (h: P, b: Brazo) => {
    const codo = sumaP(h, b.h, BRAZO);
    const muneca = sumaP(codo, b.h + b.c, ANTEBRAZO);
    return { codo, muneca, ang: b.h + b.c };
  };
  const ba = brazo(hA, p.bA);
  const bb = brazo(hB, p.bB);
  const manga = (x: ReturnType<typeof brazo>, h: P, b: Brazo) => {
    // con la mano en el bolsillo, el antebrazo se mete en el bolsillo (se acorta y no se ve la mano)
    const fin: P = b.mano === "bolsillo" ? [h[0] + (x.muneca[0] - h[0]) * 0.97, x.muneca[1] - 6] : x.muneca;
    return (
      <g>
        <Extremidad pts={[h, x.codo, fin]} ancho={60} color={ropa} sombra={ropaSombra} />
        {b.mano !== "bolsillo" && (
          <g transform={`translate(${x.muneca[0]} ${x.muneca[1]}) rotate(${-x.ang})`}>
            <rect x={-29} y={-18} width={58} height={22} rx={9} fill={ropaSombra} stroke={TINTA} strokeWidth={L * 0.8} />
            <g transform={`translate(0 2) rotate(${b.giroMano ?? 0})`}>
              <ManoDibujo mano={b.mano} />
            </g>
          </g>
        )}
      </g>
    );
  };
  const [ex, ey] = a.escala ?? [1, 1];
  const cab = CABEZA;
  return (
    <g transform={`scale(${ex} ${ey})`}>
      <ellipse cx={p.x + 10} cy={6} rx={170 - Math.min(90, -p.y * 0.3)} ry={20} fill="#000" opacity={0.25} />
      {/* mochila: asoma por detrás, a la izquierda */}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {a.capa && <path d={`M -150 ${hombroY} Q -200 -80 -170 ${80} L 170 80 Q 200 -80 150 ${hombroY} Z`} fill={a.capa} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />}
        {a.mochila && (
          <g strokeLinejoin="round">
            <rect x={-160} y={hombroY + 10} width={110} height={262} rx={40} fill="#1a1a1f" stroke={TINTA} strokeWidth={L} />
            <rect x={-172} y={hombroY + 120} width={56} height={124} rx={20} fill="#202026" stroke={TINTA} strokeWidth={L * 0.8} />
            <path d={`M -166 ${hombroY + 74} L -128 ${hombroY + 74} M -170 ${hombroY + 176} L -120 ${hombroY + 176}`} stroke="#0d0d11" strokeWidth={6} />
            <path d={`M -126 ${hombroY + 14} L -126 ${hombroY + 256}`} stroke="#2c2c34" strokeWidth={4} />
          </g>
        )}
      </g>
      {/* piernas */}
      <Extremidad pts={[T(caderaA), T(pa.rodilla), T(pa.tobillo)]} ancho={86} color={a.pantalon} sombra="#121216" brillo="#34343c" />
      <Extremidad pts={[T(caderaB), T(pb.rodilla), T(pb.tobillo)]} ancho={86} color={a.pantalon} sombra="#121216" brillo="#34343c" />
      {zapato(T(pa.tobillo), -1, p.pA.h + p.pA.r)}
      {zapato(T(pb.tobillo), 1, p.pB.h + p.pB.r)}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {/* sudadera ancha */}
        <path d={`M -100 ${hombroY + 14} Q -124 -150 -102 -10 L -100 26 Q 0 42 102 24 L 104 -12 Q 124 -150 98 ${hombroY + 12} Q 66 ${hombroY - 24} 26 ${hombroY - 28} L -30 ${hombroY - 28} Q -74 ${hombroY - 22} -100 ${hombroY + 14} Z`} fill={ropa} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
        <path d={`M 98 ${hombroY + 12} Q 124 -150 104 -12 L 102 24 Q 86 28 72 28 Q 96 -150 66 ${hombroY - 12} Z`} fill={ropaSombra} />
        <path d={`M -94 ${hombroY + 40} Q -106 -150 -88 -30`} fill="none" stroke="#3d3d46" strokeWidth={8} strokeLinecap="round" opacity={a.bata ? 0 : 1} />
        <path d={`M -101 -16 Q 0 4 104 -18`} fill="none" stroke={TINTA} strokeWidth={4.5} />
        {[-80, -52, -24, 4, 32, 60, 84].map((x) => (
          <path key={x} d={`M ${x} -10 L ${x + 1} 26`} stroke="#000" strokeOpacity={0.3} strokeWidth={3.5} />
        ))}
        {a.bata && (
          <g>
            <path d={`M 8 ${hombroY - 26} L 22 36 L 122 24 L 126 -12 Q 150 -150 118 ${hombroY + 10} Z`} fill="#eef0f4" stroke={TINTA} strokeWidth={L * 0.8} strokeLinejoin="round" />
            <rect x={50} y={-190} width={40} height={32} rx={5} fill="#d4d9e1" stroke={TINTA} strokeWidth={4} />
            <path d="M 62 -190 L 62 -212 M 76 -190 L 76 -206" stroke="#2b3a55" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {a.cremallera && <path d={`M 10 ${hombroY - 22} Q 16 -150 8 -14`} fill="none" stroke={TINTA} strokeWidth={4.5} />}
        {a.botones && [-250, -195, -140, -85, -35].map((y) => <circle key={y} cx={16} cy={y} r={9} fill={a.botones} stroke={TINTA} strokeWidth={3.5} />)}
        {a.bolsillo && (
          <g fill="none" stroke={TINTA} strokeWidth={5} strokeLinejoin="round">
            <path d="M -66 -20 L -54 -124 Q 6 -134 64 -122 L 78 -22" />
            <path d="M -54 -124 Q -66 -80 -82 -44 M 64 -122 Q 78 -80 92 -46" />
            <path d="M -42 -106 Q 6 -116 54 -104" stroke="#3d3d46" strokeWidth={6} opacity={0.8} />
          </g>
        )}
        {/* capucha alrededor del cuello */}
        {a.capucha && (
          <g strokeLinejoin="round">
            <path d={`M -88 ${hombroY + 10} Q -108 ${hombroY - 60} -36 ${hombroY - 68} Q 36 ${hombroY - 76} 84 ${hombroY - 26} Q 44 ${hombroY - 4} 4 ${hombroY - 10} Q -46 ${hombroY - 8} -88 ${hombroY + 10} Z`} fill={ropa} stroke={TINTA} strokeWidth={L} />
            <path d={`M 84 ${hombroY - 22} Q 70 ${hombroY - 58} 20 ${hombroY - 62}`} fill="none" stroke={ropaSombra} strokeWidth={16} strokeLinecap="round" />
            <path d={`M -88 ${hombroY - 6} Q -98 ${hombroY - 50} -46 ${hombroY - 58}`} fill="none" stroke="#3d3d46" strokeWidth={7} strokeLinecap="round" />
          </g>
        )}
        {a.cuello === "camiseta" && <path d={`M -30 ${hombroY - 32} Q 4 ${hombroY - 6} 42 ${hombroY - 34} L 40 ${hombroY - 20} Q 6 ${hombroY + 6} -28 ${hombroY - 18} Z`} fill="#eceef2" stroke={TINTA} strokeWidth={4.5} />}
        {a.cuello === "marinero" && (
          <g strokeLinejoin="round">
            <path d={`M -86 ${hombroY - 22} L -48 ${hombroY + 74} L 8 ${hombroY + 14} L 64 ${hombroY + 74} L 98 ${hombroY - 24} Z`} fill="#1b2740" stroke={TINTA} strokeWidth={L * 0.8} />
            <path d={`M -72 ${hombroY - 12} L -44 ${hombroY + 54} M 86 ${hombroY - 16} L 60 ${hombroY + 54}`} stroke="#e9eaee" strokeWidth={6} />
            <path d={`M -8 ${hombroY + 18} L 8 ${hombroY + 62} L 24 ${hombroY + 18} Z`} fill="#8a1a26" stroke={TINTA} strokeWidth={4.5} />
          </g>
        )}
        {a.cuello === "camisa" && <path d={`M -28 ${hombroY - 32} L 8 ${hombroY + 6} L 44 ${hombroY - 34} L 36 ${hombroY - 14} L 8 ${hombroY + 20} L -20 ${hombroY - 12} Z`} fill="#eceef2" stroke={TINTA} strokeWidth={4.5} />}
        {a.capucha && (
          <g strokeLinecap="round">
            <path d={`M -8 ${hombroY - 14} Q -12 ${hombroY + 34} -14 ${hombroY + 66}`} fill="none" stroke="#2f2f37" strokeWidth={8} />
            <path d={`M 32 ${hombroY - 16} Q 36 ${hombroY + 30} 36 ${hombroY + 60}`} fill="none" stroke="#2f2f37" strokeWidth={8} />
            <rect x={-20} y={hombroY + 62} width={12} height={18} rx={3} fill="#8b8f99" stroke={TINTA} strokeWidth={3} />
            <rect x={30} y={hombroY + 56} width={12} height={18} rx={3} fill="#8b8f99" stroke={TINTA} strokeWidth={3} />
          </g>
        )}
        {a.mochila && (
          <g fill="#141418" stroke={TINTA} strokeWidth={5} strokeLinejoin="round">
            <path d={`M -74 ${hombroY - 12} L -50 ${hombroY - 18} L -46 -150 L -70 -146 Z`} />
            <path d={`M 50 ${hombroY - 20} L 74 ${hombroY - 12} L 70 -150 L 46 -154 Z`} />
            <rect x={-66} y={-232} width={140} height={18} rx={5} />
            <rect x={-6} y={-240} width={30} height={32} rx={6} fill="#26262d" />
            <path d="M -58 -150 L -58 -126 M 58 -152 L 58 -128" stroke="#2a2a31" strokeWidth={7} />
          </g>
        )}
        {/* brazos (los dos por delante, a los lados del tronco) */}
        {manga(ba, hA, p.bA)}
        {manga(bb, hB, p.bB)}
        {/* cabeza */}
        <g transform={`translate(${cab[0]} ${cab[1] - p.hombros * 18 + respira * 0.5}) rotate(${p.cabeza})`}>
          <Cabeza p={p} a={a} f={f} id={id} />
        </g>
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- la población (misma especie, otra ropa)
const BASE_ESPECIE: Atuendo = { ...BENT, mochila: false, capucha: false, cremallera: false, bolsillo: false, cuello: "camisa" };
export const ATUENDOS: Record<string, Atuendo> = {
  bent: BENT,
  marinero: { ...BASE_ESPECIE, sudadera: "#2b3f6c", sudaderaSombra: "#1c2b4d", pantalon: "#1b2438", cuello: "marinero", sombrero: "marinero", colorSombrero: "#eef0f3" },
  capitan: { ...BASE_ESPECIE, sudadera: "#18203a", sudaderaSombra: "#0f1528", pantalon: "#141a2c", botones: "#d1a94c", sombrero: "capitan", colorSombrero: "#f2f3f5", barba: "#a3a6ae", escala: [1.1, 1] },
  cientifico: { ...BASE_ESPECIE, sudadera: "#3a3f48", sudaderaSombra: "#2a2e35", pantalon: "#2e323a", bata: true, sombrero: "canoso", colorSombrero: "#d3d6dc", gafas: true, escala: [0.95, 0.97] },
  rey: { ...BASE_ESPECIE, sudadera: "#6b1b2c", sudaderaSombra: "#4a1220", pantalon: "#2a1420", botones: "#d1a94c", capa: "#3a0e18", sombrero: "corona", colorSombrero: "#3a2a22", bigote: "#5a4030", escala: [1.12, 1] },
};
