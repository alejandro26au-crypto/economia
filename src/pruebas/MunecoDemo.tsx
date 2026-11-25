// Demo del protagonista animado: entra andando, habla, señala, se asusta, piensa y celebra.
// Vídeo:  npx remotion render src/index.ts muneco-demo salida/muneco-demo.mp4
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { DefsMuneco, Muneco, poseEnTramos, Tramo } from "../personaje/Muneco";
import { ClaveGesto } from "../personaje/gestos";
import { DefsLapiz, PapelLapiz, Rayado } from "../personaje/lapiz";

// gestos atados a «palabras» (fotogramas) y voz de mentira con sílabas y pausas, para la demo
const CLAVES: ClaveGesto[] = [
  { f: 100, der: "abre" },
  { f: 122, izq: "cadera" },
  { f: 140, der: "golpe" },
  { f: 160, der: "pulgar", izq: "cuelga" },
];
const GOLPES = [110, 140, 160];
const BOCA = Array.from({ length: 420 }, (_, f) => (f > 95 && f < 185 && Math.sin(f * 0.07) > -0.7 ? Math.abs(Math.sin(f * 0.6)) * (0.5 + 0.5 * Math.abs(Math.sin(f * 0.23))) : 0));

const TRAMOS: Tramo[] = [
  { desde: 0, anim: "camina", cara: "feliz" },
  { desde: 95, anim: "habla", cara: "feliz", habla: true },
  { desde: 185, anim: "senala", cara: "sorpresa" },
  { desde: 240, anim: "asustado", cara: "asustado" },
  { desde: 290, anim: "piensa", cara: "piensa" },
  { desde: 345, anim: "victoria", cara: "risa" },
];
const NOMBRE: Record<string, string> = { camina: "camina", habla: "habla: boca con la voz y gestos en sus palabras", senala: "señala", asustado: "se asusta", piensa: "piensa", victoria: "¡lo celebra!" };

/** lapiz = muñeco y mundo a lápiz; sin él, el estilo limpio. */
export const MunecoDemo: React.FC<{ lapiz?: boolean }> = ({ lapiz = false }) => {
  const f = useCurrentFrame();
  const p = poseEnTramos(TRAMOS, f, 0, { boca: BOCA, claves: CLAVES, golpes: GOLPES });
  const x = interpolate(f, [0, 95], [-250, 900], { extrapolateRight: "clamp" });
  const tr = [...TRAMOS].reverse().find((t) => t.desde <= f)!;
  return (
    <AbsoluteFill style={{ background: "#e8d9b8" }}>
      <svg width={1920} height={1080}>
        <DefsMuneco />
        {lapiz ? <DefsLapiz /> : null}
        <g filter={lapiz ? "url(#lp-trazo)" : undefined}>
          {/* fondo plano de prueba (estilo Zenn): pared lisa y suelo liso con contorno */}
          <rect x={-10} y={900} width={1940} height={200} fill="#c9b48c" stroke="#151515" strokeWidth={7} />
          {lapiz ? <Rayado d="M -10 900 H 1930 V 1100 H -10 Z" opacidad={0.35} /> : null}
          <g transform={`translate(${x} 900) scale(0.95)`}>
            <Muneco p={p} f={f} lapiz={lapiz} />
          </g>
        </g>
        {lapiz ? <PapelLapiz /> : null}
      </svg>
      <div style={{ position: "absolute", left: 40, top: 30, font: "600 40px Inter, sans-serif", color: "#2b2925", opacity: 0.6 }}>{NOMBRE[tr.anim]}</div>
    </AbsoluteFill>
  );
};
