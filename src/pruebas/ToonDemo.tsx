// PRUEBA: el protagonista dibujado con la librería de los romanos (toon.ts): cabeza de judía, cuerpo de alubia,
// contorno grueso-fino y sombra pintada. Identidad: pelo negro, camiseta negra.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFront, Outfit, Pen } from "../personaje/toon";

const PROTA: Outfit = { jacket: "#26242a", pants: "#2c2b31", boots: "#1b1a1f", hat: "mop", hair: "#2e2622", skin: "#fff6ec", buttons: "none" };
const EXPR = ["smile", "grin", "shock", "nervous", "laugh"] as const;

export const ToonDemo: React.FC = () => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, 1920, 1080);
    EXPR.forEach((e, i) => {
      g.save();
      g.translate(160 + i * 380, 130);
      g.scale(0.82, 0.82);
      const p = new Pen(g);
      bodyFront(p, PROTA, { mode: "stand", expr: e, phase: f / 10, seed: 3, blink: false });
      g.restore();
    });
  }, [f]);
  return (
    <AbsoluteFill style={{ background: "#8fb5c4" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: "#b79a72", borderTop: "8px solid #241726" }} />
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
