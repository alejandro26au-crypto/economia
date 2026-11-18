// Signos de cómic a tinta que acompañan al personaje (como en referencias/expresiones.png): ¡!, ¿?, garabato de
// enfado, gotas de sudor, rayas de susto y rayas de velocidad. Unidades de la figura (cabeza de radio ~125 en
// (6, -380) respecto a la cadera). Se dibujan con trazo de lápiz y aparecen con un pequeño «pop».
import React from "react";
export const TINTA = "#141316";

export type Signo = "exclama" | "pregunta" | "enfado" | "sudor" | "susto" | "velocidad" | "idea" | "dinero";

const st = { fill: "none", stroke: TINTA, strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

/** Un signo junto a la cabeza. t = fotogramas desde que aparece (para el pop y el temblor). */
export const SignoDibujo: React.FC<{ s: Signo; t?: number }> = (props) => (
  // las medidas de abajo son respecto a la cadera; la cadera de la figura de pie está a ~418 del suelo
  <g transform="translate(0 -220)">
    <SignoCadera {...props} />
  </g>
);

const SignoCadera: React.FC<{ s: Signo; t?: number }> = ({ s, t = 30 }) => {
  const pop = Math.min(1, t / 6) * (1 + 0.25 * Math.sin(Math.min(1, t / 10) * Math.PI));
  const vib = Math.sin(t * 1.3) * 3;
  switch (s) {
    case "exclama":
      return (
        <g transform={`translate(150 -560) rotate(14) scale(${pop})`}>
          <path d="M -8 -70 L 8 -70 L 3 10 L -3 10 Z" fill={TINTA} stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
          <circle cx={0} cy={34} r={10} fill={TINTA} />
        </g>
      );
    case "pregunta":
      return (
        <g transform={`translate(160 -560) rotate(8) scale(${pop})`}>
          <path d="M -30 -40 Q -30 -78 4 -78 Q 38 -78 38 -46 Q 38 -22 10 -10 Q 0 -4 0 16" {...st} strokeWidth={11} />
          <circle cx={0} cy={44} r={10} fill={TINTA} />
        </g>
      );
    case "enfado":
      // nube de garabato encima de la cabeza
      return (
        <g transform={`translate(${170 + vib} -560) scale(${pop})`}>
          <path d="M -40 0 C -60 -40 20 -60 30 -20 C 50 20 -30 40 -30 0 C -30 -30 30 -40 34 -4 C 36 24 -10 30 -16 4 C -20 -18 20 -20 16 2 M -30 30 Q -40 50 -56 52 Q -44 60 -60 74" {...st} strokeWidth={5} />
        </g>
      );
    case "sudor":
      return (
        <g transform={`scale(${pop})`} fill="#ffffff" stroke={TINTA} strokeWidth={5}>
          {[
            [-140, -420],
            [160, -400],
            [176, -300],
          ].map(([x, y], i) => (
            <path key={i} transform={`translate(${x} ${y + ((t * 2 + i * 9) % 30)})`} d="M 0 -18 Q 12 2 10 10 Q 6 20 0 20 Q -6 20 -10 10 Q -12 2 0 -18 Z" />
          ))}
        </g>
      );
    case "susto":
      // rayitas alrededor de la cabeza que tiemblan
      return (
        <g transform={`translate(6 -380) scale(${pop})`}>
          {[-150, -125, -95, -55, -25, 0, 30].map((a, i) => {
            const r0 = 170 + (i % 2) * 10 + vib;
            const ang = (a * Math.PI) / 180;
            return <path key={i} d={`M ${Math.cos(ang) * r0} ${Math.sin(ang) * r0} L ${Math.cos(ang) * (r0 + 34)} ${Math.sin(ang) * (r0 + 34)}`} {...st} strokeWidth={6} />;
          })}
        </g>
      );
    case "velocidad":
      return (
        <g opacity={Math.min(1, t / 4)}>
          {[-420, -340, -240, -160].map((y, i) => (
            <path key={y} d={`M ${-200 - i * 30} ${y} L ${-320 - i * 30 - ((t * 9) % 40)} ${y}`} {...st} strokeWidth={5} />
          ))}
        </g>
      );
    case "idea":
      return (
        <g transform={`translate(170 -580) scale(${pop})`}>
          <path d="M -26 10 Q -50 -20 -30 -50 Q 0 -80 30 -50 Q 50 -20 26 10 L 22 30 L -22 30 Z" fill="#f2d36a" stroke={TINTA} strokeWidth={6} strokeLinejoin="round" />
          <path d="M -18 42 L 18 42 M -14 54 L 14 54" {...st} strokeWidth={6} />
          {[-160, -110, -60, -20].map((a) => (
            <path key={a} d={`M ${Math.cos((a * Math.PI) / 180) * 70} ${-20 + Math.sin((a * Math.PI) / 180) * 70} L ${Math.cos((a * Math.PI) / 180) * 92} ${-20 + Math.sin((a * Math.PI) / 180) * 92}`} {...st} strokeWidth={5} />
          ))}
        </g>
      );
    case "dinero":
      // símbolos de dólar que salen de la cabeza (pensando en dinero)
      return (
        <g>
          {[0, 1, 2].map((i) => {
            const k = ((t + i * 12) % 36) / 36;
            return (
              <text key={i} x={120 + i * 40} y={-520 - k * 80} fontSize={70} fontWeight={900} fill="#6a8a4a" stroke={TINTA} strokeWidth={3} opacity={1 - k} fontFamily="Georgia, serif">
                $
              </text>
            );
          })}
        </g>
      );
  }
};
