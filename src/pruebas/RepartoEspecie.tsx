// Hoja del reparto de la especie del canal: el protagonista y los demás (mismo cuerpo, otros pelos y colores).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFront, Expr, Pen } from "../personaje/toon";
import { REPARTO, vestir, persona } from "../personaje/especie";

const CARAS: Expr[] = ["smile", "grin", "neutral", "smile", "stern", "grin", "smile", "laugh"];

export const RepartoEspecie: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, 1920, 1080);
    const nombres = Object.keys(REPARTO);
    nombres.forEach((n, i) => {
      g.save();
      g.translate(8 + i * 236, 40);
      g.scale(0.52, 0.52);
      bodyFront(new Pen(g), vestir(REPARTO[n]), { mode: "stand", expr: CARAS[i], phase: f / 10, seed: 3 + i, blink: false });
      g.restore();
      g.font = "bold 30px sans-serif"; g.fillStyle = "#241726"; g.textAlign = "center";
      g.fillText(n === "nino" ? "niño" : n, 8 + i * 236 + 156, 600);
    });
    for (let i = 0; i < 12; i++) { // gente de relleno
      g.save();
      g.translate(10 + i * 158, 640);
      g.scale(0.36, 0.36);
      bodyFront(new Pen(g), persona(i + 1), { mode: "stand", expr: (["smile", "neutral", "grin"] as Expr[])[i % 3], seed: 20 + i, blink: false });
      g.restore();
    }
    g.font = "bold 26px sans-serif"; g.fillStyle = "#241726"; g.textAlign = "left";
    g.fillText("gente de relleno (al azar)", 24, 1060);
  }, [f]);
  return (
    <AbsoluteFill style={{ background: "#e8dcc4" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
