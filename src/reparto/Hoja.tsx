// Hoja del reparto: todos los personajes en fila con su nombre y una expresión distinta (para elegir).
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { POSE_BASE, Pose } from "../bent/rig";
import { cara, cuerpo } from "../bent/animaciones";
import { Figura, caraReparto } from "./figura";
import { REPARTO } from "./reparto";

const POSES = ["quieto", "habla", "senala", "cruza", "victoria", "piensa", "saluda", "encoge", "mira", "asustado", "quieto", "habla", "senala", "cruza"] as const;
const CARAS = ["chulo", "risa", "enfadado", "seria", "feliz", "piensa", "feliz", "triste", "sorpresa", "asustado", "chulo", "seria", "chulo", "aburrido"] as const;

export const HojaReparto: React.FC = () => {
  const f = useCurrentFrame();
  const lista = Object.entries(REPARTO);
  const cols = 7;
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#22305a,#0e1530)" }}>
      {lista.map(([k, d], i) => {
        const p: Pose = { ...POSE_BASE, ...cuerpo(POSES[i % POSES.length], 20, i), ...cara(CARAS[i % CARAS.length], 0), ...caraReparto(CARAS[i % CARAS.length], 0, 0) } as Pose;
        const x = 180 + (i % cols) * 340;
        const y = 760 + Math.floor(i / cols) * 900;
        return (
          <React.Fragment key={k}>
            <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
              <g transform="scale(0.62)">
                <Figura p={p} d={d} f={f + i * 20} id={k} />
              </g>
            </svg>
            <div style={{ position: "absolute", left: x - 150, top: y + 40, width: 300, textAlign: "center", color: "#fff", font: "700 34px sans-serif" }}>{d.nombre}</div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
