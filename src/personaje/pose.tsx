// Pose del personaje (esqueleto de palitos): tipos, pose base, mezcla de poses y la mano dibujada.
// Ángulos en pantalla: 0 = hacia abajo, positivo = hacia la derecha (+x). bA = brazo de atrás (izquierda), bB = de delante.
import React from "react";

export const TINTA = "#09080d";
const L = 7;

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
