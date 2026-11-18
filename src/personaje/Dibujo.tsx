// EL PERSONAJE = TUS DIBUJOS (referencias/personaje.png y referencias/expresiones.png), recortados tal cual con
// programa/recortar.py en public/personaje/. Así es idéntico a la referencia. Se anima como «imagen animada»:
// respira, bota y se ladea al hablar, hace «pop» al cambiar de dibujo y la línea hierve un poco (dibujo a mano).
// Para más poses o expresiones: dibujos nuevos con el mismo estilo → `python3 programa/recortar.py img nombre`.
import React from "react";
import { staticFile } from "remotion";
import { DIBUJOS } from "./poses";

/** Ancho de la CARA en px del mundo (todos los dibujos se igualan por la cara). */
export const CARA_MUNDO = 86;
/** De pie (dibujo «piensa»): del centro de la cara a los pies, en caras. */
const CARA_A_PIES = (736 - 216) / 138;

/** ¿Este dibujo está cortado (sin piernas)? La cámara lo encuadra de cintura para arriba. */
export const cortado = (dibujo: string) => !(DIBUJOS[dibujo] ?? DIBUJOS.piensa).pies;

export type Dibujo = keyof typeof DIBUJOS | string;

/** LA ESPECIE: todos son el mismo personaje (los dibujos del usuario) con otro color de camiseta y sus accesorios
 *  dibujados encima con el mismo trazo de tinta. */
export type Diseno = {
  nombre: string;
  camiseta?: string; // color de la camiseta (la tinta negra y la cara blanca no cambian)
  canas?: boolean; // bigote gris (mayor)
  sombrero?: "chistera" | "corona" | "casco" | "bombin" | "fedora";
  colorSombrero?: string;
  gafas?: boolean;
  bigote?: boolean;
  corbata?: string;
  pajarita?: string;
};

export const ESPECIE: Record<string, Diseno> = {
  protagonista: { nombre: "Protagonista" },
  banquero: { nombre: "Banquero", camiseta: "#3e4a62", corbata: "#c9a24a", gafas: true, sombrero: "bombin", colorSombrero: "#2a2a2e" },
  inversor: { nombre: "Inversor", camiseta: "#2f5a4a", corbata: "#b8574a", gafas: true },
  politico: { nombre: "Político", camiseta: "#4a4a54", canas: true, corbata: "#a8352e", bigote: true },
  trabajador: { nombre: "Trabajador", camiseta: "#b9773e", sombrero: "casco", colorSombrero: "#e3b54a", bigote: true },
  monarca: { nombre: "Rey", camiseta: "#7a2a36", sombrero: "corona", colorSombrero: "#e3b54a", bigote: true },
  estafador: { nombre: "Estafador", camiseta: "#7a6a4a", sombrero: "fedora", colorSombrero: "#3a3634", bigote: true, pajarita: "#b8574a" },
  magnate: { nombre: "Magnate", camiseta: "#2c2c32", sombrero: "chistera", colorSombrero: "#1e1e22", bigote: true, pajarita: "#e3e0d6" },
};

/** Rampa de color para la camiseta: negro → color oscuro → blanco (la tinta y la cara se quedan igual). */
function rampa(hex: string, canal: number) {
  const v = parseInt(hex.slice(1 + canal * 2, 3 + canal * 2), 16) / 255;
  // 11 tramos (L = 0, 0.1 … 1): la tinta (L<0.06) sigue negra, la camiseta (L≈0.12-0.3) toma el color, el papel blanco
  return [0, v * 0.12, v * 0.7, v, Math.min(1, v * 1.08 + 0.04), 0.4 + v * 0.45, 0.55 + v * 0.35, 0.72, 0.85, 0.94, 1].map((x) => x.toFixed(3)).join(" ");
}

const T = "#1a1a1c";
/** Dónde están los ojos y la boca en cada dibujo (fracciones del ancho de la cara, desde su centro). */
const CARA: Record<string, { ojos: [number, number]; boca: [number, number] }> = {
  piensa: { ojos: [0.16, -0.16], boca: [0.08, 0.2] },
  corre: { ojos: [0.12, -0.14], boca: [0.06, 0.18] },
  lee: { ojos: [0.0, -0.02], boca: [0.0, 0.2] },
  cabeza: { ojos: [0.0, -0.1], boca: [0.0, 0.24] },
  enfadado: { ojos: [0.06, -0.1], boca: [0.04, 0.2] },
  agotado: { ojos: [0.06, -0.04], boca: [0.0, 0.22] },
  sentado: { ojos: [0.06, -0.16], boca: [0.04, 0.16] },
};
/** Accesorios en px del dibujo, colocados por la cara (cx, cy, w = ancho de la cara). */
const Vestuario: React.FC<{ v: Diseno; dibujo: string; cx: number; cy: number; w: number }> = ({ v, dibujo, cx, cy, w }) => {
  const st = { stroke: T, strokeWidth: w * 0.03, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };
  const frontal = dibujo === "piensa" || dibujo === "cabeza" || dibujo === "enfadado" || dibujo === "sentado";
  const top = cy - w * 0.62; // coronilla (por encima del pelo)
  const cc = CARA[dibujo] ?? CARA.piensa;
  const ox = cx + cc.ojos[0] * w;
  const oy = cy + cc.ojos[1] * w;
  const bx = cx + cc.boca[0] * w;
  const by = cy + cc.boca[1] * w - w * 0.07; // el bigote, encima de la boca
  const c = v.colorSombrero ?? "#2a2a2e";
  return (
    <g>
      {v.gafas && (
        <g fill="#e8f2f6" fillOpacity={0.25} {...st}>
          <circle cx={ox - w * 0.15} cy={oy} r={w * 0.14} />
          <circle cx={ox + w * 0.15} cy={oy} r={w * 0.14} />
          <path d={`M ${ox - w * 0.01} ${oy} L ${ox + w * 0.01} ${oy}`} fill="none" />
        </g>
      )}
      {v.bigote && <path d={`M ${bx - w * 0.15} ${by + w * 0.04} Q ${bx - w * 0.08} ${by - w * 0.05} ${bx} ${by} Q ${bx + w * 0.08} ${by - w * 0.05} ${bx + w * 0.15} ${by + w * 0.04} Q ${bx} ${by + w * 0.03} ${bx - w * 0.15} ${by + w * 0.04} Z`} fill={v.canas ? "#9a9a98" : T} {...st} strokeWidth={w * 0.015} />}
      {frontal && v.corbata && (
        <path d={`M ${cx - w * 0.05} ${cy + w * 0.62} L ${cx + w * 0.05} ${cy + w * 0.62} L ${cx + w * 0.07} ${cy + w * 1.25} L ${cx} ${cy + w * 1.36} L ${cx - w * 0.07} ${cy + w * 1.25} Z`} fill={v.corbata} {...st} />
      )}
      {frontal && v.pajarita && (
        <path d={`M ${cx} ${cy + w * 0.64} L ${cx - w * 0.16} ${cy + w * 0.56} L ${cx - w * 0.16} ${cy + w * 0.74} Z M ${cx} ${cy + w * 0.64} L ${cx + w * 0.16} ${cy + w * 0.56} L ${cx + w * 0.16} ${cy + w * 0.74} Z`} fill={v.pajarita} {...st} />
      )}
      {v.sombrero === "chistera" && (
        <g fill={c} {...st}>
          <path d={`M ${cx - w * 0.62} ${top + w * 0.1} Q ${cx} ${top - w * 0.02} ${cx + w * 0.62} ${top + w * 0.1} Q ${cx} ${top + w * 0.2} ${cx - w * 0.62} ${top + w * 0.1} Z`} />
          <path d={`M ${cx - w * 0.36} ${top + w * 0.08} L ${cx - w * 0.38} ${top - w * 0.62} Q ${cx} ${top - w * 0.68} ${cx + w * 0.38} ${top - w * 0.62} L ${cx + w * 0.36} ${top + w * 0.08} Z`} />
          <path d={`M ${cx - w * 0.36} ${top - w * 0.06} L ${cx + w * 0.36} ${top - w * 0.06}`} stroke="#8a2a2a" strokeWidth={w * 0.06} />
        </g>
      )}
      {v.sombrero === "bombin" && (
        <g fill={c} {...st}>
          <path d={`M ${cx - w * 0.6} ${top + w * 0.12} Q ${cx} ${top} ${cx + w * 0.6} ${top + w * 0.12} Q ${cx} ${top + w * 0.2} ${cx - w * 0.6} ${top + w * 0.12} Z`} />
          <path d={`M ${cx - w * 0.4} ${top + w * 0.1} Q ${cx - w * 0.42} ${top - w * 0.42} ${cx} ${top - w * 0.44} Q ${cx + w * 0.42} ${top - w * 0.42} ${cx + w * 0.4} ${top + w * 0.1} Z`} />
        </g>
      )}
      {v.sombrero === "fedora" && (
        <g fill={c} {...st}>
          <path d={`M ${cx - w * 0.7} ${top + w * 0.14} Q ${cx} ${top - w * 0.02} ${cx + w * 0.7} ${top + w * 0.14} Q ${cx} ${top + w * 0.22} ${cx - w * 0.7} ${top + w * 0.14} Z`} />
          <path d={`M ${cx - w * 0.38} ${top + w * 0.1} Q ${cx - w * 0.42} ${top - w * 0.4} ${cx - w * 0.1} ${top - w * 0.44} L ${cx} ${top - w * 0.34} L ${cx + w * 0.1} ${top - w * 0.44} Q ${cx + w * 0.42} ${top - w * 0.4} ${cx + w * 0.38} ${top + w * 0.1} Z`} />
          <path d={`M ${cx - w * 0.38} ${top} L ${cx + w * 0.38} ${top}`} stroke="#b8574a" strokeWidth={w * 0.05} />
        </g>
      )}
      {v.sombrero === "casco" && (
        <g fill={c} {...st}>
          <path d={`M ${cx - w * 0.66} ${top + w * 0.16} Q ${cx} ${top + w * 0.04} ${cx + w * 0.66} ${top + w * 0.16} L ${cx + w * 0.6} ${top + w * 0.24} Q ${cx} ${top + w * 0.14} ${cx - w * 0.6} ${top + w * 0.24} Z`} />
          <path d={`M ${cx - w * 0.5} ${top + w * 0.14} Q ${cx - w * 0.5} ${top - w * 0.42} ${cx} ${top - w * 0.44} Q ${cx + w * 0.5} ${top - w * 0.42} ${cx + w * 0.5} ${top + w * 0.14} Z`} />
          <path d={`M ${cx - w * 0.06} ${top - w * 0.42} L ${cx - w * 0.06} ${top + w * 0.12} M ${cx + w * 0.06} ${top - w * 0.42} L ${cx + w * 0.06} ${top + w * 0.12}`} fill="none" />
        </g>
      )}
      {v.sombrero === "corona" && (
        <g fill={c} {...st}>
          <path d={`M ${cx - w * 0.42} ${top + w * 0.14} L ${cx - w * 0.48} ${top - w * 0.34} L ${cx - w * 0.22} ${top - w * 0.1} L ${cx} ${top - w * 0.42} L ${cx + w * 0.22} ${top - w * 0.1} L ${cx + w * 0.48} ${top - w * 0.34} L ${cx + w * 0.42} ${top + w * 0.14} Q ${cx} ${top + w * 0.06} ${cx - w * 0.42} ${top + w * 0.14} Z`} />
          {[-0.24, 0, 0.24].map((k, i) => (
            <circle key={k} cx={cx + w * k} cy={top + w * 0.04} r={w * 0.045} fill={["#b8574a", "#4f6f8a", "#b8574a"][i]} strokeWidth={w * 0.012} />
          ))}
        </g>
      )}
    </g>
  );
};

/** Dibujo del personaje con los pies en (0,0). t = fotogramas desde que cambió de dibujo; habla = boca/voz. */
export const PersonajeDibujado: React.FC<{ dibujo: Dibujo; f: number; t: number; habla: boolean; mira: 1 | -1; esc?: number; moviendo?: boolean; id: string; quien?: string }> = ({ dibujo, f, t, habla, mira, esc = 1, moviendo, id, quien = "protagonista" }) => {
  const v = ESPECIE[quien] ?? ESPECIE.protagonista;
  const d = DIBUJOS[dibujo] ?? DIBUJOS.piensa;
  const k = (CARA_MUNDO / d.cara[2]) * esc;
  // anclaje: si se ven los pies, el borde de abajo del dibujo va al suelo; si no, la cara a la altura de alguien de pie
  const ax = d.cara[0];
  const ay = d.pies ? d.caja[3] - 4 : d.cara[1] + CARA_A_PIES * d.cara[2];
  // animación
  const pop = t < 10 ? 1 + Math.sin((t / 10) * Math.PI) * 0.07 : 1;
  const respira = 1 + Math.sin(f * 0.11) * 0.012;
  const bota = habla ? Math.abs(Math.sin(f * 0.42)) * 5 : 0;
  const ladea = habla ? Math.sin(f * 0.17) * 1.6 : Math.sin(f * 0.05) * 0.5;
  const salto = moviendo ? Math.abs(Math.sin(f * 0.5)) * 18 : 0;
  const hierve = Math.floor(f / 4) % 4;
  return (
    <g transform={`translate(0 ${-bota - salto}) rotate(${ladea}) scale(${mira * k * pop} ${k * pop * respira})`}>
      <defs>
        <filter id={`hv${id}`} x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={1} seed={hierve} />
          <feDisplacementMap in="SourceGraphic" scale={2.5} />
        </filter>
        {v.camiseta && (
          <filter id={`ves${id}`} colorInterpolationFilters="sRGB">
            <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
            <feComponentTransfer>
              <feFuncR type="table" tableValues={rampa(v.camiseta, 0)} />
              <feFuncG type="table" tableValues={rampa(v.camiseta, 1)} />
              <feFuncB type="table" tableValues={rampa(v.camiseta, 2)} />
            </feComponentTransfer>
          </filter>
        )}
      </defs>
      {!d.pies && (
        <linearGradient id={`fd${id}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0.8" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
      )}
      {!d.pies && (
        <mask id={`mk${id}`} maskUnits="userSpaceOnUse" x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]}>
          <rect x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]} fill={`url(#fd${id})`} />
        </mask>
      )}
      <g filter={`url(#hv${id})`}>
        <g filter={v.camiseta ? `url(#ves${id})` : undefined}>
          <image mask={d.pies ? undefined : `url(#mk${id})`} href={staticFile(`personaje/${dibujo in DIBUJOS ? dibujo : "piensa"}.png`)} x={-ax} y={-ay} width={d.tam[0]} height={d.tam[1]} />
        </g>
        <g transform={`translate(${-ax} ${-ay})`}>
          <Vestuario v={v} dibujo={dibujo} cx={d.cara[0]} cy={d.cara[1]} w={d.cara[2]} />
        </g>
      </g>
    </g>
  );
};

/** Centro de la cabeza respecto a los pies (px del mundo), para la cámara y la nube. */
export const alturaCabeza = (esc = 1) => CARA_A_PIES * CARA_MUNDO * esc;
