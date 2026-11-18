// Ficha de BENT: el muñeco junto a la referencia, en varias poses (para comparar y afinar el dibujo).
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Muneco, POSE_BASE, Pose } from "./rig";

export const POSES_FICHA: Record<string, Partial<Pose>> = {
  normal: {},
  habla: { bB: { h: 30, c: 70, mano: "abierta", giroMano: 20 }, boca: "media", abre: 0.6, cejas: 0.4 },
  senala: { bB: { h: 95, c: -5, mano: "senala" }, cejas: 0.9, boca: "media", mira: 1 },
  victoria: { bA: { h: -155, c: -10, mano: "v" }, bB: { h: 155, c: 10, mano: "v" }, ojos: "feliz", boca: "risa", abre: 0.8, cejas: -0.2 },
  piensa: { bB: { h: 25, c: -150, mano: "puno" }, cabeza: -6, cejas: 0.3, alzaCejas: 0.4, boca: "media", mira: 0.8 },
  asustado: { bA: { h: -70, c: -60, mano: "abierta" }, bB: { h: 70, c: 60, mano: "abierta" }, inclina: -6, ojos: "abiertos", boca: "asustada", cejas: -0.8, alzaCejas: 1, pA: { h: -16, r: 4 }, pB: { h: 18, r: -6 } },
  corre: { inclina: 8, pA: { h: -45, r: -55 }, pB: { h: 40, r: 30 }, bA: { h: 40, c: 70, mano: "puno" }, bB: { h: -40, c: -70, mano: "puno" }, boca: "dientes", cejas: 1, y: -30 },
  encoge: { hombros: 1, bA: { h: -40, c: -80, mano: "abierta", giroMano: 160 }, bB: { h: 40, c: 80, mano: "abierta", giroMano: 200 }, boca: "triste", cejas: -0.4, alzaCejas: 0.7, cabeza: 6 },
};

export const Ficha: React.FC = () => {
  const f = useCurrentFrame();
  const nombres = Object.keys(POSES_FICHA);
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <Img src={staticFile("marca/personaje.jpg")} style={{ position: "absolute", left: 0, top: 0, width: 640, height: 640 }} />
      <svg width={2560} height={1440} style={{ position: "absolute", left: 0, top: 0 }}>
        {nombres.map((n, i) => {
          const col = i < 2 ? i : (i - 2) % 4;
          const fila = i < 2 ? 0 : 1 + Math.floor((i - 2) / 4);
          const x = i < 2 ? 900 + col * 560 : 330 + col * 600;
          const y = fila === 0 ? 640 : 640 + fila * 690;
          return (
            <g key={n} transform={`translate(${x} ${y}) scale(0.55)`}>
              <Muneco p={{ ...POSE_BASE, ...POSES_FICHA[n] }} f={f} id={n} />
              <text x={0} y={90} textAnchor="middle" fontSize={60} fontFamily="sans-serif" fill="#555">
                {n}
              </text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

/** Comparación grande: referencia a la izquierda, muñeco a la derecha (misma altura). */
export const FichaCerca: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#ffffff" }}>
      <Img src={staticFile("marca/personaje.jpg")} style={{ position: "absolute", left: -60, top: -40, width: 1100, height: 1100 }} />
      <svg width={2000} height={1000} style={{ position: "absolute", left: 0, top: 0 }}>
        <g transform="translate(1450 950) scale(0.94)">
          <Muneco p={POSE_BASE} f={f} id="cerca" />
        </g>
      </svg>
    </AbsoluteFill>
  );
};
