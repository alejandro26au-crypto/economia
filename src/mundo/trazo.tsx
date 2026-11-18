// Piezas de dibujo del mundo: tinta negra a mano + mancha de acuarela que NO encaja del todo con la línea (como el
// prompt de referencia), rayado a lápiz para las sombras y letreros con la letra de la portada.
import React from "react";

export const INK = "#1d1b20";
// paleta apagada del canal (portada y referencia del mundo)
export const C = {
  papel: "#f4efe2",
  cielo: "#a9c8da",
  cieloClaro: "#dfe8e4",
  piedra: "#d8d0bd",
  piedraSombra: "#b9ae96",
  salvia: "#9cb088",
  salviaOsc: "#6f8a5e",
  oro: "#e3b54a",
  beige: "#d9c4a0",
  tan: "#c49a6c",
  terracota: "#c9805e",
  azul: "#7e9fb8",
  azulOsc: "#4f6f8a",
  cristal: "#b9d3df",
  agua: "#8fb8cc",
  billete: "#9fbe86",
  gris: "#a7a7a2",
  rojo: "#b8574a",
};

/** Rectángulo como camino (para formas a mano). */
export const rect = (x: number, y: number, w: number, h: number) => `M ${x} ${y} L ${x + w} ${y} L ${x + w} ${y + h} L ${x} ${y + h} Z`;

/** Forma dibujada: mancha de color desplazada + contorno de tinta. `sombra` = rayado a lápiz encima. */
export const Forma: React.FC<{ d: string; color?: string; w?: number; sombra?: boolean; desfase?: [number, number]; opacidad?: number }> = ({ d, color, w = 5, sombra, desfase = [7, 5], opacidad = 0.92 }) => (
  <g>
    {color && <path d={d} fill={color} opacity={opacidad} transform={`translate(${desfase[0]} ${desfase[1]})`} />}
    {sombra && <path d={d} fill="url(#ray)" />}
    <path d={d} fill="none" stroke={INK} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
  </g>
);

/** Línea de tinta suelta. */
export const Linea: React.FC<{ d: string; w?: number; op?: number; color?: string }> = ({ d, w = 4, op = 1, color = INK }) => (
  <path d={d} fill="none" stroke={color} strokeWidth={w} strokeOpacity={op} strokeLinecap="round" strokeLinejoin="round" />
);

/** Letrero: tablero con borde de tinta y texto con la letra de la portada (o a mano). */
export const Letrero: React.FC<{ x: number; y: number; w: number; h: number; texto: string; fondo?: string; tinta?: string; letra?: "marca" | "mano"; giro?: number; tam?: number }> = ({ x, y, w, h, texto, fondo = C.papel, tinta = INK, letra = "marca", giro = 0, tam }) => (
  <g transform={`rotate(${giro} ${x + w / 2} ${y + h / 2})`}>
    <Forma d={rect(x, y, w, h)} color={fondo} w={5} desfase={[5, 4]} />
    <text x={x + w / 2} y={y + h / 2 + (tam ?? h * 0.55) * 0.36} textAnchor="middle" fontSize={tam ?? h * 0.55} fill={tinta} fontFamily={letra === "marca" ? "Marca, MarcaLimpia, sans-serif" : "Mano, sans-serif"} letterSpacing={2}>
      {texto}
    </text>
  </g>
);

/** Rejilla de ventanas con cristal azulado, reflejo y alguna con luz. */
export const Ventanas: React.FC<{ x: number; y: number; cols: number; filas: number; w: number; h: number; sx: number; sy: number; luz?: number; semilla?: number }> = ({ x, y, cols, filas, w, h, sx, sy, luz = 0, semilla = 1 }) => (
  <g>
    {Array.from({ length: filas }, (_, j) =>
      Array.from({ length: cols }, (_, i) => {
        const vx = x + i * sx;
        const vy = y + j * sy;
        const encendida = ((i * 7 + j * 13 + semilla * 5) % 11) / 11 < luz;
        return (
          <g key={`${i}-${j}`}>
            <path d={rect(vx, vy, w, h)} fill={encendida ? "#f3d98a" : C.cristal} opacity={0.9} transform="translate(3 2)" />
            <path d={`M ${vx + w * 0.2} ${vy + h * 0.8} L ${vx + w * 0.7} ${vy + h * 0.2}`} stroke="#ffffff" strokeOpacity={0.6} strokeWidth={3} />
            <path d={rect(vx, vy, w, h)} fill="none" stroke={INK} strokeWidth={3.5} />
          </g>
        );
      }),
    )}
  </g>
);

/** Patrones de lápiz (se ponen una vez en el <defs> del mundo). */
export const PatronesLapiz: React.FC = () => (
  <>
    <pattern id="ray" patternUnits="userSpaceOnUse" width={12} height={12} patternTransform="rotate(40)">
      <path d="M 0 6 L 12 6" stroke={INK} strokeWidth={2.2} strokeOpacity={0.45} />
    </pattern>
    <pattern id="rayc" patternUnits="userSpaceOnUse" width={12} height={12} patternTransform="rotate(-40)">
      <path d="M 0 6 L 12 6" stroke={INK} strokeWidth={2} strokeOpacity={0.35} />
    </pattern>
    <pattern id="adoquin" patternUnits="userSpaceOnUse" width={90} height={46}>
      <path d="M 0 45 L 90 45 M 45 0 L 45 22 M 0 22 L 90 22 M 15 22 L 15 45 M 75 22 L 75 45" stroke={INK} strokeWidth={2} strokeOpacity={0.18} fill="none" />
    </pattern>
  </>
);

/** Billete (verde, con su $) — se usa en el mundo, en la nube y volando entre lugares. */
export const Billete: React.FC<{ x?: number; y?: number; giro?: number; esc?: number }> = ({ x = 0, y = 0, giro = 0, esc = 1 }) => (
  <g transform={`translate(${x} ${y}) rotate(${giro}) scale(${esc})`}>
    <path d={rect(-80, -38, 160, 76)} fill={C.billete} transform="translate(5 4)" />
    <path d={rect(-80, -38, 160, 76)} fill="none" stroke={INK} strokeWidth={4.5} />
    <path d={rect(-68, -27, 136, 54)} fill="none" stroke="#4f6e45" strokeWidth={2.5} />
    <circle cx={0} cy={0} r={20} fill="#c9dcb8" stroke={INK} strokeWidth={3} />
    <text x={0} y={11} textAnchor="middle" fontSize={30} fontFamily="Georgia, serif" fontWeight={900} fill="#2f4a2a">
      $
    </text>
    <text x={-56} y={-10} textAnchor="middle" fontSize={16} fontFamily="Georgia, serif" fontWeight={900} fill="#2f4a2a">
      100
    </text>
  </g>
);

/** Moneda dorada. */
export const Moneda: React.FC<{ x?: number; y?: number; r?: number; giro?: number }> = ({ x = 0, y = 0, r = 22, giro = 0 }) => (
  <g transform={`translate(${x} ${y}) scale(${Math.max(0.15, Math.abs(Math.cos((giro * Math.PI) / 180)))} 1)`}>
    <circle r={r} fill={C.oro} transform="translate(3 2)" />
    <circle r={r} fill="none" stroke={INK} strokeWidth={4} />
    <circle r={r * 0.65} fill="none" stroke="#9a7420" strokeWidth={2.5} />
  </g>
);

/** Saco de dinero con $. */
export const Saco: React.FC<{ x: number; y: number; esc?: number; color?: string }> = ({ x, y, esc = 1, color = C.salvia }) => (
  <g transform={`translate(${x} ${y}) scale(${esc})`}>
    <Forma d="M -20 -86 Q -70 -50 -64 -20 Q -60 0 0 0 Q 60 0 64 -20 Q 70 -50 20 -86 Z" color={color} />
    <Forma d="M -22 -86 L 22 -86 L 30 -104 Q 0 -96 -30 -104 Z" color={color} w={4} />
    <text x={0} y={-24} textAnchor="middle" fontSize={44} fontFamily="Georgia, serif" fontWeight={900} fill={INK}>
      $
    </text>
  </g>
);
