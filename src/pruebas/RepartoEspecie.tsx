// Hoja del reparto de la especie del canal: el protagonista y los demás (mismo cuerpo, otros pelos y colores).
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFront, Expr, Pen } from "../personaje/toon";
import { con, PROTAGONISTA, REPARTO, vestir, persona } from "../personaje/especie";

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
    // el PROTAGONISTA con piezas añadidas para una escena (su ficha no cambia)
    const ESCENAS: [string, ReturnType<typeof vestir>][] = [
      ["en una boda", vestir(con(PROTAGONISTA, { traje: "marino", corbata: "roja" }))],
      ["leyendo", vestir(con(PROTAGONISTA, { gafas: true }))],
      ["de camarero", vestir(con(PROTAGONISTA, { delantal: "blanco" }))],
    ];
    ESCENAS.forEach(([t, o], i) => {
      g.save(); g.translate(10 + i * 210, 640); g.scale(0.4, 0.4);
      bodyFront(new Pen(g), o, { mode: "stand", expr: "smile", seed: 3, blink: false });
      g.restore();
      g.font = "bold 24px sans-serif"; g.fillStyle = "#241726"; g.textAlign = "center"; g.fillText(t, 10 + i * 210 + 120, 1060);
    });
    for (let i = 0; i < 8; i++) { // gente de relleno
      g.save();
      g.translate(660 + i * 158, 640);
      g.scale(0.36, 0.36);
      bodyFront(new Pen(g), persona(i + 1), { mode: "stand", expr: (["smile", "neutral", "grin"] as Expr[])[i % 3], seed: 20 + i, blink: false });
      g.restore();
    }
    g.font = "bold 26px sans-serif"; g.fillStyle = "#241726"; g.textAlign = "left";
    g.fillText("gente de relleno (al azar)", 1200, 1060);
  }, [f]);
  return (
    <AbsoluteFill style={{ background: "#e8dcc4" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
