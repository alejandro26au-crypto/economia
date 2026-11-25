// Demo del protagonista animado: entra andando, habla, señala, se asusta, piensa y celebra.
// Vídeo:  npx remotion render src/index.ts muneco-demo salida/muneco-demo.mp4
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DefsMuneco, Muneco, poseEnTramos, Tramo } from "../personaje/Muneco";

const TRAMOS: Tramo[] = [
  { desde: 0, anim: "camina", cara: "feliz" },
  { desde: 95, anim: "habla", cara: "feliz", habla: true },
  { desde: 185, anim: "senala", cara: "sorpresa" },
  { desde: 240, anim: "asustado", cara: "asustado" },
  { desde: 290, anim: "piensa", cara: "piensa" },
  { desde: 345, anim: "victoria", cara: "risa" },
];
const NOMBRE: Record<string, string> = { camina: "camina", habla: "habla (boca con la voz)", senala: "señala", asustado: "se asusta", piensa: "piensa", victoria: "¡lo celebra!" };

export const MunecoDemo: React.FC = () => {
  const f = useCurrentFrame();
  const p = poseEnTramos(TRAMOS, f);
  const x = interpolate(f, [0, 95], [-250, 900], { extrapolateRight: "clamp" });
  const tr = [...TRAMOS].reverse().find((t) => t.desde <= f)!;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #ffffff 0%, #f4f1ea 75%, #e6e1d6 100%)" }}>
      <svg width={1920} height={1080}>
        <DefsMuneco />
        <path d="M -20 905 Q 480 897 960 907 T 1940 901" stroke="#2b2925" strokeOpacity={0.5} strokeWidth={4} fill="none" />
        <g transform={`translate(${x} 900) scale(0.95)`}>
          <Muneco p={p} f={f} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 40, top: 30, font: "600 40px Inter, sans-serif", color: "#2b2925", opacity: 0.6 }}>{NOMBRE[tr.anim]}</div>
    </AbsoluteFill>
  );
};
