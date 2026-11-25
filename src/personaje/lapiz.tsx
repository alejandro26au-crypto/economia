// ESTILO A LÁPIZ para el muñeco Y su mundo (una sola capa para toda la escena, así todo casa):
// - trazo tembloroso de lápiz (desplaza un poco los bordes),
// - grano de papel encima de todo,
// - rayados de grafito para sombras (patrones «lp-rayado» y «lp-rayado2»).
// Uso: <svg><DefsLapiz/> <g filter="url(#lp-trazo)"> …escena… </g> <PapelLapiz/></svg>
import React from "react";

export const DefsLapiz: React.FC<{ temblor?: number }> = ({ temblor = 2.6 }) => (
  <defs>
    <filter id="lp-trazo" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={7} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={temblor} xChannelSelector="R" yChannelSelector="G" result="d" />
      {/* borde de grafito: los negros quedan algo granulados, no de tinta */}
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={3} result="g" />
      <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.9 1.25" result="ga" />
      <feComposite in="d" in2="ga" operator="in" />
    </filter>
    <filter id="lp-papel" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves={3} seed={11} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.35  0 0 0 0 0.32  0 0 0 0 0.28  0 0 0 0.22 0" />
    </filter>
    <pattern id="lp-rayado" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
      <line x1={0} y1={0} x2={0} y2={10} stroke="#3a3833" strokeWidth={1.6} strokeOpacity={0.7} />
    </pattern>
    <pattern id="lp-rayado2" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(-40)">
      <line x1={0} y1={0} x2={0} y2={9} stroke="#3a3833" strokeWidth={1.3} strokeOpacity={0.6} />
    </pattern>
  </defs>
);

/** Grano de papel sobre toda la escena (ponerlo lo último dentro del <svg>). */
export const PapelLapiz: React.FC<{ ancho?: number; alto?: number }> = ({ ancho = 1920, alto = 1080 }) => (
  <rect x={0} y={0} width={ancho} height={alto} filter="url(#lp-papel)" style={{ mixBlendMode: "multiply" }} />
);

/** Rayado de sombra de grafito sobre una forma (d = path). */
export const Rayado: React.FC<{ d: string; denso?: boolean; opacidad?: number }> = ({ d, denso, opacidad = 0.55 }) => (
  <path d={d} fill={`url(#${denso ? "lp-rayado2" : "lp-rayado"})`} opacity={opacidad} />
);
