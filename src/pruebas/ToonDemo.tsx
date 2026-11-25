// PRUEBA: el protagonista dibujado con la librería de los romanos (toon.ts): cabeza de judía, cuerpo de alubia,
// contorno grueso-fino y sombra pintada. Identidad: pelo negro, camiseta negra.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { bodyFront, Outfit, Pen } from "../personaje/toon";

const PROTA: Outfit = { jacket: "#26242a", pants: "#2c2b31", boots: "#1b1a1f", hat: "hair", hair: "#1d1b20", skin: "#fff6ec", buttons: "#26242a" };
// mechones despeinados encima del casquete (espacio de diseño 600x1000; cabeza centrada en x≈293, coronilla y≈183)
const MECHONES: [number, number, number, number, number, number][] = [
  [210, 250, 168, 300, -10, 16], [222, 232, 170, 262, -8, 15],
  [228, 222, 200, 172, 10, 17], [256, 206, 250, 152, 12, 17], [284, 200, 302, 146, 12, 18],
  [312, 202, 350, 152, 12, 17], [338, 212, 390, 178, 10, 16], [358, 228, 414, 220, 6, 15], [366, 248, 410, 270, 4, 13],
  [270, 204, 256, 128, 8, 6], [300, 202, 330, 126, 10, 6],
];
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
      g.lineCap = "round";
      MECHONES.forEach(([x0, y0, x1, y1, c, w]) => {
        const mx = (x0 + x1) / 2 + c * 0.6, my = (y0 + y1) / 2 - c;
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(mx, my, x1, y1);
        g.strokeStyle = "#241726"; g.lineWidth = w + 7; g.stroke();
        g.strokeStyle = "#1d1b20"; g.lineWidth = w; g.stroke();
      });
      g.restore();
    });
  }, [f]);
  return (
    <AbsoluteFill style={{ background: "#c9d8d2" }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, bottom: 0, background: "#b79a72", borderTop: "8px solid #241726" }} />
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
