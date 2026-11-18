// EL REPARTO: personajes 2D de "palito" con cara expresiva. Cabeza blanca grande, cejas que cuentan la emoción,
// cuerpo pequeño con la ropa del papel que hacen y brazos y piernas finos de tinta. Cada vídeo elige su
// protagonista (pirata, farero, cocinero…) del catálogo (reparto.ts) o uno nuevo.
// Usa la misma pose y las mismas animaciones que el muñeco de BENT (src/bent/animaciones.ts): mismas unidades
// (pies en y = 0, ~950 de alto hasta lo alto del sombrero) y la misma cara (src/bent/rig.tsx).
import React from "react";
import { Brazo, ManoDibujo, Pierna, Pose } from "../bent/rig";

export const TINTA = "#09080d";
const L = 7;

export type Ropa = "camiseta" | "gabardina" | "chaleco-obra" | "camisa" | "rayas" | "chaqueta" | "chaleco" | "armadura" | "bata" | "delantal" | "tunica" | "jersey" | "traje";
export type Pelo = "pinchos" | "corto" | "rizado" | "coleta" | "calvo" | "canoso" | "melena" | "tupe" | "ninguno";
export type Sombrero = "fedora" | "ninguno" | "tricornio" | "bandana" | "gorro-lana" | "capitan" | "salacot" | "corona" | "casco-griego" | "chistera" | "cocinero" | "sueste" | "marinero" | "casco" | "bombin" | "gorra";

export type Diseno = {
  nombre: string;
  ropa: Ropa;
  color: string; // color principal de la ropa
  color2?: string; // segundo color (camisa bajo el chaleco, rayas, forro…)
  detalle?: string; // botones, galones, hebilla (dorado por defecto)
  zapato?: string;
  pelo?: Pelo;
  colorPelo?: string;
  sombrero?: Sombrero;
  colorSombrero?: string;
  bigote?: "fino" | "grueso" | "manillar";
  barba?: "corta" | "larga" | "perilla";
  parche?: boolean;
  gafas?: boolean;
  panuelo?: string; // pañuelo al cuello
  cinturon?: boolean;
  barriga?: number; // 0..1
  escala?: [number, number]; // complexión: ancho, alto
  pantalon?: string; // color del pantalón (corto a la cadera; largo en trajes)
  pantalonLargo?: boolean;
  corbata?: string; // color de la corbata ("ninguna" para quitarla del traje)
  banda?: string; // banda cruzada (políticos, reyes)
  insignia?: string; // pin en el pecho
  lleva?: "maletin" | "bolsa" | "billetes" | "papel"; // en la mano de delante
};

const rad = (g: number) => (g * Math.PI) / 180;
type P = [number, number];
const sumaP = (p: P, ang: number, largo: number): P => [p[0] + Math.sin(rad(ang)) * largo, p[1] + Math.cos(rad(ang)) * largo];

const aclara = (hex: string, k: number) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

// proporciones: cabeza grande, tronco pequeño, piernas de palo largas
const MUSLO = 200;
const PANTORRILLA = 196;
const BRAZO = 112;
const ANTEBRAZO = 104;
const R = 112;
const HOMBRO_Y = -236;
const CABEZA: P = [6, -380];
const PALO = 12; // grosor de brazos y piernas

// ---------------------------------------------------------------- cabeza y pelo/sombreros
const PeloDibujo: React.FC<{ d: Diseno; delante: boolean }> = ({ d, delante }) => {
  const c = d.colorPelo ?? "#3a2618";
  const st = { stroke: TINTA, strokeWidth: L, strokeLinejoin: "round" as const };
  if (!delante) {
    if (d.pelo === "coleta") return <path d="M 96 -40 Q 170 -30 160 70 Q 140 30 100 20 Z" fill={c} {...st} />;
    if (d.pelo === "melena") return <path d="M -110 -20 Q -130 110 -60 120 L 90 120 Q 140 100 112 -20 Z" fill={c} {...st} />;
    return null;
  }
  switch (d.pelo) {
    case "corto":
      return <path d="M -112 -14 Q -122 -128 2 -126 Q 120 -124 112 -30 Q 92 -70 50 -72 Q 10 -58 -36 -76 Q -88 -64 -112 -14 Z" fill={c} {...st} />;
    case "tupe":
      return <path d="M -110 -20 Q -120 -120 -20 -128 Q 40 -170 110 -110 Q 130 -60 112 -34 Q 90 -78 40 -84 Q -40 -70 -110 -20 Z" fill={c} {...st} />;
    case "rizado":
      return (
        <g fill={c} {...st}>
          {Array.from({ length: 9 }, (_, i) => {
            const a = Math.PI * (1.05 + (i / 8) * 0.9);
            return <circle key={i} cx={Math.cos(a) * 104} cy={Math.sin(a) * 104} r={34} />;
          })}
        </g>
      );
    case "coleta":
    case "melena":
      return <path d="M -114 0 Q -126 -130 0 -128 Q 126 -126 114 0 Q 100 -60 40 -78 Q -30 -60 -80 -70 Q -110 -40 -114 0 Z" fill={c} {...st} />;
    case "canoso":
      return (
        <g fill={d.colorPelo ?? "#d8dbe2"} {...st}>
          <path d="M -98 -60 q -50 -6 -40 34 q -34 14 -12 38 q -20 22 12 26 Q -104 10 -98 -60 Z" />
          <path d="M 96 -64 q 52 -6 42 34 q 34 14 12 38 q 20 22 -12 26 Q 104 10 96 -64 Z" />
        </g>
      );
    default:
      return null;
  }
};

const SombreroDibujo: React.FC<{ d: Diseno }> = ({ d }) => {
  const c = d.colorSombrero ?? "#1d1d24";
  const oro = d.detalle ?? "#e0b04a";
  const st = { stroke: TINTA, strokeWidth: L, strokeLinejoin: "round" as const };
  switch (d.sombrero) {
    case "tricornio":
      return (
        <g {...st} transform="rotate(-6)">
          <path d="M -160 -58 Q -120 -96 -60 -92 Q -40 -170 0 -172 Q 46 -170 64 -92 Q 128 -98 170 -56 Q 90 -78 0 -70 Q -90 -78 -160 -58 Z" fill={c} />
          <path d="M -150 -60 Q -80 -84 0 -76 Q 82 -84 160 -58" fill="none" stroke={oro} strokeWidth={8} />
          <path d="M -40 -150 Q 0 -165 40 -150" fill="none" stroke={aclara(c, 0.25)} strokeWidth={8} strokeLinecap="round" />
        </g>
      );
    case "bandana":
      return (
        <g {...st}>
          <path d="M -116 -18 Q -124 -128 0 -128 Q 124 -128 116 -18 Q 60 -54 0 -52 Q -60 -54 -116 -18 Z" fill={c} />
          <path d="M 108 -40 Q 160 -40 176 0 Q 150 -6 130 -10 Q 150 20 140 40 Q 118 4 106 -16 Z" fill={c} />
          {[-60, -10, 40].map((x) => (
            <circle key={x} cx={x} cy={-92} r={9} fill="#ffffff" stroke="none" />
          ))}
        </g>
      );
    case "gorro-lana":
      return (
        <g {...st}>
          <path d="M -108 -36 Q -118 -150 0 -156 Q 118 -150 108 -36 Z" fill={c} />
          <path d="M -116 -26 L 116 -26 L 114 -66 L -114 -66 Z" fill={aclara(c, -0.15)} />
          {[-80, -48, -16, 16, 48, 80].map((x) => (
            <path key={x} d={`M ${x} -64 L ${x} -28`} stroke="#000" strokeOpacity={0.25} strokeWidth={5} />
          ))}
          <circle cx={0} cy={-162} r={22} fill={aclara(c, 0.2)} />
        </g>
      );
    case "marinero":
      return (
        <g {...st} transform="rotate(-8)">
          <path d="M -90 -66 Q -94 -150 0 -154 Q 94 -150 90 -66 Z" fill="#f1f2f5" />
          <path d="M -118 -60 Q 0 -38 118 -60 Q 120 -92 0 -100 Q -120 -92 -118 -60 Z" fill="#fafbfc" />
        </g>
      );
    case "capitan":
      return (
        <g {...st}>
          <path d="M -100 -62 L -98 -100 L 100 -100 L 102 -62 Z" fill="#121318" />
          <path d="M -104 -98 Q -156 -150 -10 -162 Q 150 -156 104 -98 Z" fill={d.colorSombrero ?? "#f2f3f5"} />
          <path d="M -72 -64 Q 10 -22 96 -60 Q 20 -72 -72 -64 Z" fill="#0a0b0e" />
          <path d="M 2 -88 l 18 -14 l 18 14 l -18 14 Z" fill={oro} strokeWidth={3.5} />
        </g>
      );
    case "salacot":
      return (
        <g {...st}>
          <path d="M -170 -44 Q 0 -90 170 -44 Q 150 -24 0 -44 Q -150 -24 -170 -44 Z" fill={aclara(c, -0.1)} />
          <path d="M -104 -54 Q -100 -170 0 -172 Q 100 -170 104 -54 Q 0 -70 -104 -54 Z" fill={c} />
          <path d="M -100 -70 Q 0 -86 100 -70" fill="none" stroke="#5a3a1e" strokeWidth={14} />
        </g>
      );
    case "corona":
      return (
        <g {...st}>
          <path d="M -86 -80 L -100 -176 L -46 -130 L 0 -192 L 46 -130 L 100 -176 L 86 -80 Q 0 -96 -86 -80 Z" fill={oro} />
          {[-48, 0, 48].map((x, i) => (
            <circle key={x} cx={x} cy={-100} r={10} fill={["#b3202f", "#1f5fc0", "#b3202f"][i]} strokeWidth={3.5} />
          ))}
        </g>
      );
    case "casco-griego":
      return (
        <g {...st}>
          <path d="M -116 10 Q -130 -136 0 -136 Q 130 -136 116 10 L 80 10 Q 84 -60 0 -62 Q -84 -60 -80 10 Z" fill={oro} />
          <path d="M -20 -134 Q -60 -230 40 -236 Q 150 -230 140 -120 Q 90 -150 20 -134 Z" fill={d.colorSombrero ?? "#b3202f"} />
          {[0, 1, 2, 3, 4].map((i) => (
            <path key={i} d={`M ${-6 + i * 28} -138 Q ${10 + i * 28} -190 ${30 + i * 26} -214`} fill="none" stroke="#000" strokeOpacity={0.3} strokeWidth={4} />
          ))}
        </g>
      );
    case "chistera":
      return (
        <g {...st}>
          <path d="M -130 -74 Q 0 -98 130 -74 Q 136 -54 0 -64 Q -136 -54 -130 -74 Z" fill={c} />
          <path d="M -76 -80 L -84 -250 Q 0 -266 84 -250 L 76 -80 Q 0 -92 -76 -80 Z" fill={c} />
          <path d="M -80 -112 Q 0 -126 80 -112 L 80 -94 Q 0 -108 -80 -94 Z" fill="#8a1a26" />
        </g>
      );
    case "cocinero":
      return (
        <g {...st}>
          <path d="M -86 -64 L -90 -140 Q -150 -160 -120 -210 Q -90 -250 -40 -226 Q 0 -280 50 -228 Q 110 -250 124 -196 Q 140 -152 90 -140 L 86 -64 Z" fill="#fbfbfd" />
          <path d="M -88 -84 Q 0 -98 88 -84" fill="none" stroke="#c9ccd6" strokeWidth={8} />
        </g>
      );
    case "sueste":
      return (
        <g {...st}>
          <path d="M -160 -20 Q -120 -64 0 -66 Q 130 -64 170 -10 Q 120 -36 0 -40 Q -110 -36 -160 -20 Z" fill={aclara(c, -0.12)} />
          <path d="M -104 -46 Q -104 -150 0 -154 Q 104 -150 104 -46 Q 0 -60 -104 -46 Z" fill={c} />
          <path d="M -60 -140 Q -10 -152 30 -146" fill="none" stroke="#ffffff" strokeOpacity={0.5} strokeWidth={10} strokeLinecap="round" />
        </g>
      );
    case "casco":
      // casco de obra (plataformas, astilleros): visera corta delante y nervio en el centro
      return (
        <g {...st}>
          <path d="M -150 -40 Q -60 -60 0 -58 Q 90 -60 160 -36 Q 120 -24 0 -30 Q -110 -24 -150 -40 Z" fill={aclara(c, -0.12)} />
          <path d="M -108 -48 Q -110 -168 0 -172 Q 110 -168 108 -48 Q 0 -62 -108 -48 Z" fill={c} />
          <path d="M -14 -170 Q -18 -110 -12 -54 L 14 -54 Q 18 -110 14 -170 Z" fill={aclara(c, 0.18)} />
          <path d="M -70 -150 Q -40 -164 -20 -164" fill="none" stroke="#ffffff" strokeOpacity={0.55} strokeWidth={10} strokeLinecap="round" />
        </g>
      );
    case "bombin":
      return (
        <g {...st}>
          <path d="M -140 -66 Q 0 -92 140 -66 Q 150 -46 0 -58 Q -150 -46 -140 -66 Z" fill={c} />
          <path d="M -92 -72 Q -100 -190 0 -192 Q 100 -190 92 -72 Q 0 -86 -92 -72 Z" fill={c} />
          <path d="M -92 -92 Q 0 -106 92 -92 L 92 -76 Q 0 -90 -92 -76 Z" fill="#3a2a22" />
        </g>
      );
    case "gorra":
      // gorra plana de paño (obreros y rebeldes del siglo XIX): copa abombada hacia delante y visera corta
      return (
        <g {...st} transform="rotate(-4)">
          <path d="M -112 -52 Q -120 -150 -10 -154 Q 120 -150 150 -84 Q 150 -62 112 -56 Q 0 -70 -112 -52 Z" fill={c} />
          <path d="M 40 -66 Q 130 -76 176 -58 Q 160 -40 100 -46 Q 60 -50 40 -66 Z" fill={aclara(c, -0.2)} />
          <path d="M -60 -138 Q 20 -150 90 -116" fill="none" stroke="#000" strokeOpacity={0.25} strokeWidth={6} />
          <circle cx={0} cy={-150} r={9} fill={aclara(c, 0.15)} />
        </g>
      );
    case "fedora":
      // sombrero de ala (estafadores, detectives, años 30)
      return (
        <g {...st} transform="rotate(-5)">
          <path d="M -150 -62 Q 0 -96 150 -62 Q 120 -44 0 -56 Q -120 -44 -150 -62 Z" fill={aclara(c, -0.1)} />
          <path d="M -86 -70 Q -96 -160 -20 -170 L 0 -150 L 20 -170 Q 96 -160 86 -70 Q 0 -84 -86 -70 Z" fill={c} />
          <path d="M -88 -92 Q 0 -106 88 -92 L 88 -74 Q 0 -88 -88 -74 Z" fill={d.detalle ?? "#2a2422"} />
        </g>
      );
    default:
      return null;
  }
};

/** Barba que sigue la mandíbula: deja la boca a la vista, borde inferior en mechones y vetas de pelo. */
const Barba: React.FC<{ tipo: "corta" | "larga" | "perilla"; color: string }> = ({ tipo, color }) => {
  const oscuro = aclara(color.startsWith("#") ? color : "#3a2618", -0.3);
  const claro = aclara(color.startsWith("#") ? color : "#3a2618", 0.25);
  const st = { stroke: TINTA, strokeWidth: L * 0.85, strokeLinejoin: "round" as const };
  if (tipo === "perilla")
    return (
      <g>
        <path d="M -2 92 Q 0 84 14 86 Q 28 84 30 92 Q 30 116 14 128 Q -2 116 -2 92 Z" fill={color} {...st} />
        <path d="M 8 96 L 10 116 M 20 96 L 18 116" stroke={oscuro} strokeWidth={3} strokeLinecap="round" />
      </g>
    );
  // borde exterior: sigue el círculo de la cabeza (patilla derecha → izquierda) con mechones redondeados abajo;
  // la barba larga cae en punta. Borde interior: pasa por encima de la boca (la boca se dibuja encima).
  const largo = tipo === "larga";
  const Rb = R + 5;
  const pts: [number, number][] = [];
  const n = 26;
  for (let i = 0; i <= n; i++) {
    const ang = rad(12 + (156 * i) / n);
    let x = Math.cos(ang) * Rb;
    let y = Math.sin(ang) * Rb;
    const t = i / n;
    if (largo) {
      const cae = Math.pow(Math.sin(t * Math.PI), 2.2) * 120; // punta hacia abajo
      y += cae;
      x *= 1 - Math.pow(Math.sin(t * Math.PI), 3) * 0.25;
    }
    const mechon = t > 0.12 && t < 0.88 ? (i % 2 ? 9 : -2) : 0;
    pts.push([x, y + mechon]);
  }
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1];
    const [x1, y1] = pts[i];
    d += ` Q ${((x0 + x1) / 2 + (y1 - y0) * 0.15).toFixed(1)} ${((y0 + y1) / 2 + 4).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`;
  }
  d += ` Q -84 44 -46 52 Q 0 40 14 46 Q 30 40 70 50 Q 100 44 ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)} Z`;
  return (
    <g>
      <path d={d} fill={color} {...st} />
      {/* vetas de pelo */}
      {Array.from({ length: 6 }, (_, i) => {
        const x = -62 + i * 24;
        const y0 = 92 + Math.abs(x - 10) * 0.12;
        const fin = largo ? 150 + Math.cos(((x - 10) / 90) * 1.4) * 60 : y0 + 18;
        return <path key={i} d={`M ${x} ${y0} Q ${x + 6} ${(y0 + fin) / 2} ${x + 2} ${fin}`} fill="none" stroke={oscuro} strokeWidth={3.5} strokeLinecap="round" opacity={0.55} />;
      })}
      <path d="M -96 40 Q -88 76 -56 96" fill="none" stroke={claro} strokeWidth={6} strokeLinecap="round" opacity={0.5} />
      {/* labio inferior: la boca queda encima, limpia */}

    </g>
  );
};

// ---------------------------------------------------------------- LA ESPECIE DEL CANAL (Inercia del consumo)
// Dibujada a partir de referencias/personaje.png, referencias/expresiones.png y el logo: boceto a tinta en papel.
// Cabeza redonda blanca y grande (1/3 del alto), pelo negro de pinchos despeinado, ojos blancos ovalados con pupila
// negra, cejas cortas y gruesas, boca pequeña, cuello de palo, camiseta oscura con rayado a lápiz, brazos y piernas
// de palo, manos blancas pequeñas y zapatos negros. Trazo a varias pasadas (filtro «lápiz»).

/** Pelo de pinchos despeinado (el del protagonista): mechones hacia arriba y hacia los lados y flequillo suelto. */
/** Pelo de la especie (referencias/personaje.png): casquete negro sobre la coronilla con flequillo en mechones y
 *  mechones finos y afilados que se escapan hacia arriba y hacia los lados (despeinado, a trazos). */
const PELO_CASCO =
  "M -110 6 Q -128 -112 -20 -136 Q 84 -146 114 -54 L 100 -50 L 88 -70 L 74 -56 L 58 -82 L 42 -66 L 26 -90 L 10 -72 L -10 -92 L -24 -72 L -44 -90 L -56 -66 L -74 -80 L -84 -52 L -98 -50 L -102 -16 Z";
/** Mechón afilado: de (x0,y0) a la punta (x1,y1), curvado (cu) y con grosor g en la base. */
const hebra = (x0: number, y0: number, x1: number, y1: number, cu: number, g: number) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const l = Math.hypot(dx, dy) || 1;
  const nx = -dy / l;
  const ny = dx / l;
  const mx = (x0 + x1) / 2 + nx * cu;
  const my = (y0 + y1) / 2 + ny * cu;
  return `M ${x0 - nx * g} ${y0 - ny * g} Q ${mx - nx * g * 0.5} ${my - ny * g * 0.5} ${x1} ${y1} Q ${mx + nx * g * 0.5} ${my + ny * g * 0.5} ${x0 + nx * g} ${y0 + ny * g} Z`;
};
const PELO_HEBRAS = [
  hebra(-70, -118, -128, -128, -10, 9),
  hebra(-92, -92, -150, -78, -8, 8),
  hebra(-100, -56, -146, -30, -6, 8),
  hebra(-104, -24, -132, 12, -4, 7),
  hebra(-40, -130, -92, -166, -10, 8),
  hebra(-14, -136, -46, -166, -6, 7),
  hebra(12, -138, 30, -168, 6, 7),
  hebra(36, -136, 86, -160, 10, 8),
  hebra(64, -122, 122, -118, 8, 8),
  hebra(88, -96, 134, -80, 6, 7),
  // mechones del flequillo que caen sobre la frente
  hebra(-30, -96, -44, -64, -4, 6),
  hebra(30, -100, 18, -66, 4, 6),
].join(" ");
/** Trazos finos dentro del pelo (vetas) y pelos sueltos. */
const PELO_VETAS = "M -80 -100 Q -40 -128 10 -126 M -60 -86 Q -20 -112 40 -110 M 20 -124 Q 60 -122 90 -92 M -96 -40 Q -100 -80 -70 -108 M -118 -100 Q -128 -112 -140 -110 M 100 -128 Q 116 -140 132 -138";

/** Rayado a lápiz (sombras): líneas diagonales que se recortan a la forma. */
const Rayado: React.FC<{ id: string; color?: string; paso?: number; ang?: number; op?: number }> = ({ id, color = TINTA, paso = 13, ang = 35, op = 0.55 }) => (
  <pattern id={id} patternUnits="userSpaceOnUse" width={paso} height={paso} patternTransform={`rotate(${ang})`}>
    <path d={`M 0 ${paso / 2} L ${paso} ${paso / 2}`} stroke={color} strokeWidth={2.6} strokeOpacity={op} strokeLinecap="round" />
  </pattern>
);

const CabezaFigura: React.FC<{ p: Pose; d: Diseno; f: number; id: string }> = ({ p, d, f, id }) => {
  const pelo = d.colorPelo ?? "#16141a";
  // toda la especie lleva el pelo de pinchos salvo que el diseño diga otro; con sombrero solo asoman por los lados
  const pinchos = (d.pelo ?? "pinchos") === "pinchos";
  const conSombrero = !!d.sombrero && d.sombrero !== "ninguno";
  return (
    <g>
      <PeloDibujo d={d} delante={false} />
      <circle r={R} fill="#fbfaf6" stroke={TINTA} strokeWidth={L * 0.9} />
      <clipPath id={`fc${id}`}>
        <circle r={R - 3} />
      </clipPath>
      <g clipPath={`url(#fc${id})`}>
        {/* sombra a lápiz por la derecha y abajo, como el boceto */}
        <ellipse cx={128} cy={30} rx={58} ry={150} fill={`url(#ry${id})`} />
        <ellipse cx={20} cy={160} rx={160} ry={52} fill="#e4e1d8" opacity={0.7} />
        <path d="M 70 70 Q 96 40 100 0" fill="none" stroke={TINTA} strokeOpacity={0.25} strokeWidth={3} />
      </g>
      {!d.barba && (
        <g fill="#8a8790" opacity={0.55}>
          {[[-60, 70], [-46, 84], [-30, 92], [52, 84], [66, 72], [38, 92], [-70, 52], [74, 54], [-52, 60], [60, 64]].map(([x, y], k) => (
            <circle key={k} cx={x} cy={y} r={2.2} />
          ))}
        </g>
      )}
      {d.barba && <Barba tipo={d.barba} color={pelo} />}
      {pinchos ? (
        <g>
          <clipPath id={`pp${id}`}>
            <rect x={-300} y={conSombrero ? -78 : -400} width={600} height={600} />
          </clipPath>
          <g clipPath={`url(#pp${id})`} fill={pelo} stroke={TINTA} strokeWidth={L * 0.7} strokeLinejoin="round">
            <path d={PELO_HEBRAS} />
            <path d={PELO_CASCO} />
            <path d={PELO_VETAS} fill="none" stroke="#5a5862" strokeWidth={3} strokeLinecap="round" />
          </g>
        </g>
      ) : (
        <PeloDibujo d={d} delante />
      )}
      <CaraLimpia p={p} f={f} />
      {d.bigote === "fino" && <path d="M 22 66 Q 0 60 -12 70 Q 12 66 22 70 Q 40 66 56 70 Q 42 58 22 66 Z" fill={pelo} stroke={TINTA} strokeWidth={4} />}
      {d.bigote === "grueso" && <path d="M 20 60 Q -10 50 -28 72 Q 2 70 20 74 Q 44 70 70 72 Q 50 48 20 60 Z" fill={pelo} stroke={TINTA} strokeWidth={4.5} />}
      {d.bigote === "manillar" && <path d="M 20 64 Q -8 52 -32 66 Q -54 60 -46 42 Q -60 74 -26 78 Q 2 74 20 74 Q 42 74 68 78 Q 98 72 84 42 Q 90 60 70 66 Q 46 52 20 64 Z" fill={pelo} stroke={TINTA} strokeWidth={4.5} />}
      {d.parche && (
        <g>
          <path d="M -110 -50 L 110 -30" stroke={TINTA} strokeWidth={7} />
          <ellipse cx={-14} cy={4} rx={28} ry={30} fill={TINTA} />
        </g>
      )}
      {d.gafas && (
        <g fill="#e6f6ff" fillOpacity={0.15} stroke={TINTA} strokeWidth={5.5}>
          <circle cx={-14} cy={4} r={29} />
          <circle cx={50} cy={0} r={29} />
          <path d="M 15 2 L 21 1 M -43 0 L -104 -8" fill="none" />
        </g>
      )}
      <SombreroDibujo d={d} />
    </g>
  );
};

// ---------------------------------------------------------------- cara (la de la referencia)
// Ojos: óvalos BLANCOS grandes con contorno y pupila negra con brillo, muy juntos. Cejas cortas y gruesas que
// cuentan la emoción. Boca pequeña. Vista de 3/4 mirando un poco a la derecha.
const CaraLimpia: React.FC<{ p: Pose; f: number }> = ({ p, f }) => {
  const ojos: { x: number; y: number; k: number; lado: -1 | 1 }[] = [
    { x: -22, y: -6, k: 0.92, lado: -1 },
    { x: 42, y: -10, k: 1, lado: 1 },
  ];
  // parpadeo natural (cada ~3-4 s, 4 fotogramas)
  const ciclo = (f + 23) % 107;
  const cierre = ciclo < 4 ? 1 - Math.abs(ciclo - 1.5) / 2.5 : 0;
  const mx = p.mira * 8;
  // al pensar mira hacia arriba (como en la referencia)
  const my = p.ojos === "normal" && p.mira > 0.7 ? -10 : 2;
  const ojo = (o: (typeof ojos)[number]) => {
    const { x, y, k } = o;
    if (p.ojos === "feliz") return <path key={x} d={`M ${x - 17 * k} ${y + 6} Q ${x} ${y - 14} ${x + 17 * k} ${y + 6}`} fill="none" stroke={TINTA} strokeWidth={7} strokeLinecap="round" />;
    if (p.ojos === "cerrados" || cierre > 0.7) return <path key={x} d={`M ${x - 16 * k} ${y + 2} Q ${x} ${y + 9} ${x + 16 * k} ${y + 2}`} fill="none" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />;
    const grande = p.ojos === "abiertos" ? 1.18 : 1;
    const rx = 24 * k * grande;
    const ry = 28 * k * grande * (1 - cierre * 0.6);
    const pr = (p.ojos === "abiertos" ? 7 : 12.5) * k;
    const entorna = p.ojos === "entornados";
    return (
      <g key={x}>
        <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#ffffff" stroke={TINTA} strokeWidth={4.5} />
        <circle cx={x + mx * k} cy={y + my * k} r={pr} fill={TINTA} />
        <circle cx={x + mx * k - pr * 0.35} cy={y + my * k - pr * 0.4} r={pr * 0.32} fill="#ffffff" />
        {entorna && <path d={`M ${x - rx - 2} ${y - 2} L ${x + rx + 2} ${y - 4} L ${x + rx + 2} ${y - ry - 4} L ${x - rx - 2} ${y - ry - 4} Z`} fill="#fbfaf6" />}
        {entorna && <path d={`M ${x - rx} ${y - 2} L ${x + rx} ${y - 4}`} stroke={TINTA} strokeWidth={5} strokeLinecap="round" />}
      </g>
    );
  };
  const ceja = (o: (typeof ojos)[number]) => {
    const { x, y, k, lado } = o;
    // lado -1 = ojo izquierdo: su extremo interior queda a la derecha
    const xi = x - lado * 6 * k;
    const xe = x + lado * 18 * k;
    const sube = p.alzaCejas * 14;
    const base = y - 42 - sube;
    const c = p.cejas;
    const yi = base + (c > 0 ? c * 11 : c * 9); // enfado baja el interior; tristeza lo sube
    const ye = base + (c > 0 ? -c * 4 : -c * 3);
    return <path key={`c${x}`} d={`M ${xe} ${ye} Q ${(xi + xe) / 2} ${Math.min(yi, ye) - 4} ${xi} ${yi}`} fill="none" stroke={TINTA} strokeWidth={6.5 * k} strokeLinecap="round" />;
  };
  const bx = 16;
  const by = 52;
  const a = p.abre;
  const st = { stroke: TINTA, strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let boca: React.ReactNode;
  const abierta = (ancho: number, alto: number, sonrie: number) => (
    <g>
      <path d={`M ${bx - ancho} ${by - sonrie} Q ${bx} ${by - sonrie * 0.2} ${bx + ancho} ${by - sonrie} Q ${bx + ancho * 0.7} ${by + alto} ${bx} ${by + alto} Q ${bx - ancho * 0.7} ${by + alto} ${bx - ancho} ${by - sonrie} Z`} fill="#2a1c20" {...st} />
      {alto > 12 && <path d={`M ${bx - ancho * 0.75} ${by - sonrie * 0.75} Q ${bx} ${by - sonrie * 0.1 + 3} ${bx + ancho * 0.75} ${by - sonrie * 0.75} L ${bx + ancho * 0.7} ${by - sonrie * 0.6 + 5} Q ${bx} ${by + 5} ${bx - ancho * 0.7} ${by - sonrie * 0.6 + 5} Z`} fill="#ffffff" />}
      {alto > 14 && <ellipse cx={bx + 2} cy={by + alto - 5} rx={ancho * 0.42} ry={4.5} fill="#c86a6a" />}
    </g>
  );
  if (p.boca === "risa") boca = abierta(24, 22 + a * 6, 7);
  else if (p.boca === "asustada") boca = <ellipse cx={bx} cy={by + 8} rx={12} ry={16} fill="#2a1c20" {...st} />;
  else if (p.boca === "o") boca = <ellipse cx={bx} cy={by + 5} rx={8} ry={10 + a * 4} fill="#2a1c20" {...st} />;
  else if (a > 0.15) boca = abierta(p.boca === "sonrisa" ? 18 : 13, 4 + a * 15, p.boca === "sonrisa" ? 5 : 0);
  else if (p.boca === "sonrisa") boca = <path d={`M ${bx - 18} ${by - 3} Q ${bx} ${by + 12} ${bx + 20} ${by - 5}`} fill="none" {...st} strokeWidth={5.5} />;
  else if (p.boca === "media") boca = <path d={`M ${bx - 12} ${by + 3} Q ${bx + 2} ${by + 4} ${bx + 15} ${by - 4}`} fill="none" {...st} strokeWidth={5.5} />;
  else if (p.boca === "triste") boca = <path d={`M ${bx - 13} ${by + 6} Q ${bx} ${by - 4} ${bx + 13} ${by + 6}`} fill="none" {...st} strokeWidth={5.5} />;
  else if (p.boca === "dientes") boca = abierta(20, 11, 3);
  else boca = <path d={`M ${bx - 11} ${by + 2} Q ${bx} ${by + 1} ${bx + 11} ${by}`} fill="none" {...st} strokeWidth={5.5} />;
  return (
    <g>
      {ojos.map(ojo)}
      {p.ojos !== "cerrados" && ojos.map(ceja)}
      {boca}
    </g>
  );
};

// ---------------------------------------------------------------- cuerpo (camiseta, camisa, traje…)
const Tronco: React.FC<{ d: Diseno; hy: number; id: string }> = ({ d, hy, id }) => {
  const c = d.color;
  const c2 = d.color2 ?? "#f2f0ea";
  const oro = d.detalle ?? "#c9a24a";
  const b = (d.barriga ?? 0) * 30;
  const ancho = 66 + b; // mitad del ancho en los hombros
  const abajo = 58 + b * 1.2; // mitad del ancho en la cintura
  // tronco de rectángulo suave (la camiseta del boceto) con mangas cortas
  const forma = `M ${-ancho} ${hy + 10} Q ${-ancho} ${hy - 6} ${-ancho + 22} ${hy - 8} L ${ancho - 22} ${hy - 8} Q ${ancho} ${hy - 6} ${ancho} ${hy + 10} Q ${ancho + 6 + b * 0.5} ${hy * 0.45} ${abajo} 14 Q 0 22 ${-abajo} 14 Q ${-ancho - 6 - b * 0.5} ${hy * 0.45} ${-ancho} ${hy + 10} Z`;
  const manga = (lado: -1 | 1) => `M ${lado * (ancho - 24)} ${hy - 7} Q ${lado * (ancho + 22)} ${hy - 4} ${lado * (ancho + 38)} ${hy + 62} L ${lado * (ancho + 4)} ${hy + 80} L ${lado * (ancho - 8)} ${hy + 34} Z`;
  const largo = d.ropa === "tunica" || d.ropa === "bata" || d.ropa === "gabardina" ? 90 : d.ropa === "chaqueta" ? 46 : 0;
  const st = { stroke: TINTA, strokeWidth: L, strokeLinejoin: "round" as const };
  const traje = d.ropa === "traje" || d.ropa === "chaqueta" || d.ropa === "gabardina";
  return (
    <g>
      <defs>
        <clipPath id={`tr${id}`}>
          <path d={forma} />
        </clipPath>
      </defs>
      {/* faldón (abrigos, gabardinas, túnicas y batas) */}
      {largo > 0 && <path d={`M ${-abajo - 4} -10 L ${-abajo - 18} ${largo} Q 0 ${largo + 14} ${abajo + 18} ${largo} L ${abajo + 4} -10 Z`} fill={d.ropa === "bata" ? "#eeeee8" : aclara(c, -0.1)} {...st} />}
      {d.ropa === "gabardina" && <path d={`M 4 -10 L 8 ${largo + 6}`} stroke={TINTA} strokeWidth={5} />}
      <path d={manga(-1)} fill={c} {...st} />
      <path d={manga(1)} fill={c} {...st} />
      <path d={forma} fill={c} {...st} />
      <g clipPath={`url(#tr${id})`}>
        {d.ropa === "rayas" && Array.from({ length: 8 }, (_, i) => <rect key={i} x={-200} y={hy + i * 34} width={400} height={15} fill={c2} />)}
        {d.ropa === "chaleco-obra" && [hy + 120, hy + 160].map((y) => <rect key={y} x={-200} y={y} width={400} height={14} fill="#e8e6dc" opacity={0.9} />)}
        {d.ropa === "armadura" &&
          Array.from({ length: 9 }, (_, j) =>
            Array.from({ length: 9 }, (_, i) => <path key={`${i}-${j}`} d={`M ${-120 + i * 30 + (j % 2) * 15} ${hy - 10 + j * 30} q 15 26 30 0`} fill="none" stroke={aclara(c, 0.35)} strokeWidth={5} />),
          )}
        {d.ropa === "jersey" && Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-90 + i * 30} ${hy} L ${-90 + i * 30} 20`} stroke="#000" strokeOpacity={0.16} strokeWidth={8} />)}
        {/* sombreado a lápiz: rayado en el lado de la sombra y un poco en toda la prenda */}
        <path d={`M ${ancho * 0.15} ${hy - 20} Q ${ancho * 1.2} ${hy * 0.5} ${abajo * 0.5} 30 L 200 30 L 200 ${hy - 40} Z`} fill={`url(#ry${id})`} />
        <rect x={-200} y={hy - 30} width={400} height={-hy + 60} fill={`url(#rf${id})`} />
        <path d={`M ${-ancho + 16} ${hy + 30} Q ${-ancho + 10} ${hy * 0.5} ${-abajo + 14} -10`} fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={8} strokeLinecap="round" />
      </g>
      {/* cuello de la camiseta */}
      {(d.ropa === "camiseta" || d.ropa === "chaleco-obra") && <path d={`M -22 ${hy - 8} Q 6 ${hy + 22} 34 ${hy - 8}`} fill="none" stroke={TINTA} strokeWidth={5} strokeLinecap="round" />}
      {/* detalles de cada ropa */}
      {(d.ropa === "camisa" || traje) && <path d={`M -26 ${hy - 8} L 6 ${hy + 40} L 38 ${hy - 8} Z`} fill={traje ? c2 : aclara(c, 0.3)} {...st} strokeWidth={4.5} />}
      {traje && <path d={`M -26 ${hy - 8} L -44 ${hy + 60} L 6 ${hy + 110} L 56 ${hy + 60} L 38 ${hy - 8}`} fill="none" stroke={TINTA} strokeWidth={5} strokeLinejoin="round" />}
      {(traje || d.corbata) && d.corbata !== "ninguna" && <path d={`M 0 ${hy + 8} L 12 ${hy + 8} L 15 ${hy + 90} L 6 ${hy + 106} L -3 ${hy + 90} Z`} fill={d.corbata ?? d.detalle ?? "#8a2a2a"} {...st} strokeWidth={4} />}
      {traje && [hy + 130, hy + 170].map((y) => <circle key={y} cx={10} cy={y} r={5.5} fill={oro} stroke={TINTA} strokeWidth={3} />)}
      {d.ropa === "camisa" && [hy + 60, hy + 110, hy + 160].map((y) => <circle key={y} cx={8} cy={y} r={5} fill={aclara(c, -0.4)} />)}
      {d.ropa === "chaleco" && (
        <g>
          <path d={`M -22 ${hy - 8} L 6 ${hy + 160} L 34 ${hy - 8} Z`} fill={c2} {...st} strokeWidth={4.5} />
          {[hy + 60, hy + 110].map((y) => <circle key={y} cx={-4} cy={y} r={6} fill={oro} stroke={TINTA} strokeWidth={3} />)}
        </g>
      )}
      {d.ropa === "bata" && <path d={`M 4 ${hy - 8} L 4 ${largo}`} stroke={TINTA} strokeWidth={5} />}
      {d.ropa === "delantal" && <path d={`M -48 ${hy + 50} L 58 ${hy + 50} L 66 22 Q 6 34 -56 22 Z`} fill="#f6f6f0" {...st} />}
      {d.ropa === "tunica" && <path d={`M -70 ${hy + 4} L 70 ${hy + 200}`} stroke={c2} strokeWidth={22} />}
      {d.cinturon && (
        <g>
          <path d={`M ${-abajo - 2} -22 Q 0 -10 ${abajo + 2} -22 L ${abajo} 2 Q 0 14 ${-abajo} 2 Z`} fill="#3a2a1c" {...st} strokeWidth={5} />
          <rect x={-8} y={-20} width={28} height={24} rx={4} fill={oro} stroke={TINTA} strokeWidth={4} />
        </g>
      )}
      {d.banda && <path d={`M ${-ancho + 6} ${hy + 6} L ${abajo - 4} -6 L ${abajo - 16} 18 L ${-ancho - 4} ${hy + 34} Z`} fill={d.banda} {...st} strokeWidth={4.5} />}
      {d.panuelo && (
        <g {...st} strokeWidth={5}>
          <path d={`M -36 ${hy - 6} Q 6 ${hy + 20} 48 ${hy - 6} L 42 ${hy + 12} Q 6 ${hy + 36} -30 ${hy + 12} Z`} fill={d.panuelo} />
          <path d={`M 10 ${hy + 20} L -4 ${hy + 66} L 26 ${hy + 60} Z`} fill={d.panuelo} />
        </g>
      )}
      {d.insignia && <circle cx={-34} cy={hy + 50} r={11} fill={d.insignia} stroke={TINTA} strokeWidth={3.5} />}
    </g>
  );
};

/** Lo que lleva en la mano de delante (maletín, bolsa de dinero, fajo de billetes, papel). */
const Accesorio: React.FC<{ tipo: NonNullable<Diseno["lleva"]> }> = ({ tipo }) => {
  const st = { stroke: TINTA, strokeWidth: 6, strokeLinejoin: "round" as const };
  switch (tipo) {
    case "maletin":
      return (
        <g transform="translate(-60 30)" {...st}>
          <path d="M 42 0 Q 42 -22 60 -22 Q 78 -22 78 0" fill="none" />
          <rect x={0} y={0} width={120} height={84} rx={10} fill="#5a3a24" />
          <path d="M 0 30 L 120 30" stroke="#3a2416" strokeWidth={5} />
          <rect x={52} y={22} width={16} height={14} rx={3} fill="#c9a24a" strokeWidth={3} />
        </g>
      );
    case "bolsa":
      return (
        <g transform="translate(-50 20)" {...st}>
          <path d="M 30 10 Q -10 40 -6 90 Q 0 130 50 130 Q 104 130 108 90 Q 112 40 70 10 Z" fill="#b8a578" />
          <path d="M 26 12 L 74 12 L 64 -6 L 36 -6 Z" fill="#a08f62" />
          <text x={50} y={102} textAnchor="middle" fontSize={56} fontWeight={900} fill="#3a5a3a" stroke="none" fontFamily="Georgia, serif">$</text>
        </g>
      );
    case "billetes":
      return (
        <g transform="translate(-40 10) rotate(-12)" {...st} strokeWidth={4.5}>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${i * 6} ${-i * 7})`}>
              <rect x={0} y={0} width={100} height={52} rx={4} fill="#a9c49a" />
              <circle cx={50} cy={26} r={14} fill="#c8dcb8" strokeWidth={3} />
            </g>
          ))}
        </g>
      );
    case "papel":
      return (
        <g transform="translate(-30 10) rotate(-8)" {...st} strokeWidth={4.5}>
          <rect x={0} y={0} width={80} height={104} fill="#fbfaf2" />
          {[22, 40, 58, 76].map((y) => <path key={y} d={`M 12 ${y} L 68 ${y}`} stroke="#9a968a" strokeWidth={4} />)}
        </g>
      );
  }
};

// ---------------------------------------------------------------- llevar la mano a un punto
/** Puntos útiles del cuerpo, respecto a la cadera (como los hombros), con la figura recta. */
export const PUNTOS = {
  hombroA: [-62, -210] as P,
  hombroB: [62, -212] as P,
  mejillaA: [-90, -326] as P,
  mejillaB: [104, -330] as P,
  orejaA: [-122, -372] as P,
  orejaB: [134, -374] as P,
  barbilla: [30, -286] as P,
  pecho: [10, -140] as P,
  barriga: [20, -70] as P,
};
/** Ángulos (h, c) de un brazo que lleva la mano desde el hombro hasta el punto (codo hacia fuera si fuera = 1). */
export function alcanza(hombro: P, punto: P, fuera: 1 | -1 = 1): { h: number; c: number } {
  const dx = punto[0] - hombro[0];
  const dy = punto[1] - hombro[1];
  const d = Math.min(BRAZO + ANTEBRAZO - 1, Math.max(Math.abs(BRAZO - ANTEBRAZO) + 1, Math.hypot(dx, dy)));
  const th = (Math.atan2(dx, dy) * 180) / Math.PI;
  const al = (Math.acos((BRAZO * BRAZO + d * d - ANTEBRAZO * ANTEBRAZO) / (2 * BRAZO * d)) * 180) / Math.PI;
  const h = th + fuera * al;
  const codo = sumaP(hombro, h, BRAZO);
  const fa = (Math.atan2(punto[0] - codo[0], punto[1] - codo[1]) * 180) / Math.PI;
  let c = fa - h;
  while (c > 180) c -= 360;
  while (c < -180) c += 360;
  return { h, c };
}

// ---------------------------------------------------------------- figura completa
export const Figura: React.FC<{ p: Pose; d: Diseno; f: number; id?: string }> = ({ p, d, f, id = "fg" }) => {
  const caderaA: P = [-26, -6];
  const caderaB: P = [30, -6];
  const pierna = (c: P, q: Pierna) => {
    const rodilla = sumaP(c, q.h, MUSLO);
    const tobillo = sumaP(rodilla, q.h + q.r, PANTORRILLA);
    return { rodilla, tobillo };
  };
  const pa = pierna(caderaA, p.pA);
  const pb = pierna(caderaB, p.pB);
  const altoCadera = Math.max(pa.tobillo[1], pb.tobillo[1]) + 22;
  const raiz: P = [p.x, -altoCadera + p.y];
  const T = (q: P): P => [q[0] + raiz[0], q[1] + raiz[1]];
  const respira = p.respira * 4;
  const hy = HOMBRO_Y - p.hombros * 26 + respira;
  const ancho = 66 + (d.barriga ?? 0) * 30;
  const hA: P = [-ancho + 4, hy + 26];
  const hB: P = [ancho - 4, hy + 24];
  const brazo = (h: P, b: Brazo) => {
    // sin bolsillos: con "bolsillo" las manos van a la cadera (brazos en jarras)
    const bb = b.mano === "bolsillo" ? { ...b, h: b.h * 1.4, c: b.c * 1.25, mano: "puno" as const } : b;
    const codo = sumaP(h, bb.h, BRAZO);
    const muneca = sumaP(codo, bb.h + bb.c, ANTEBRAZO);
    return { codo, muneca, ang: bb.h + bb.c, mano: bb.mano, giro: bb.giroMano ?? 0 };
  };
  const arribaA = brazo(hA, p.bA).muneca[1] < hy - 20;
  const cruzaA = !arribaA && brazo(hA, p.bA).muneca[0] > -10;
  const arribaB = brazo(hB, p.bB).muneca[1] < hy - 20;
  const palo = (pts: P[], grosor = PALO) => {
    const dd = `M ${pts[0][0]} ${pts[0][1]} Q ${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}`;
    return <path d={dd} fill="none" stroke={TINTA} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const brazoDibujo = (h: P, b: Brazo, delante: boolean) => {
    const x = brazo(h, b);
    const dd = `M ${h[0]} ${h[1]} Q ${x.codo[0]} ${x.codo[1]} ${x.muneca[0]} ${x.muneca[1]}`;
    return (
      <g>
        {delante && <path d={dd} fill="none" stroke="#8a8790" strokeWidth={PALO + 9} strokeLinecap="round" strokeLinejoin="round" />}
        {palo([h, x.codo, x.muneca])}
        <g transform={`translate(${x.muneca[0]} ${x.muneca[1]}) rotate(${-x.ang}) scale(0.92)`}>
          <g transform={`rotate(${x.giro})`}>
            {delante && d.lleva && x.mano !== "senala" && x.mano !== "v" && <Accesorio tipo={d.lleva} />}
            <ManoDibujo mano={x.mano} piel="#fbfaf6" />
          </g>
        </g>
      </g>
    );
  };
  const zapato = (tob: P, lado: -1 | 1) => (
    <g transform={`translate(${tob[0]} ${tob[1]}) scale(${lado} 1)`}>
      <path d="M -24 -2 Q -26 -24 0 -24 Q 30 -24 46 -10 Q 62 2 56 16 L -24 16 Z" fill={d.zapato ?? "#1c1a20"} stroke={TINTA} strokeWidth={L * 0.8} strokeLinejoin="round" />
      <path d="M -10 -14 Q 6 -20 20 -14" fill="none" stroke="#ffffff" strokeOpacity={0.3} strokeWidth={5} strokeLinecap="round" />
    </g>
  );
  const pantalon = d.pantalon ?? (d.ropa === "camiseta" ? "#26242a" : aclara(d.color, -0.35));
  const largoPant = d.pantalonLargo ?? !(d.ropa === "camiseta" || d.ropa === "rayas" || d.ropa === "tunica");
  const [ex, ey] = d.escala ?? [1, 1];
  const cuerpo = (
    <g>
      {/* piernas de palo (con pantalón largo: palo más grueso del color del pantalón) */}
      {largoPant ? (
        <g>
          {palo([T(caderaA), T(pa.rodilla), T(pa.tobillo)], PALO + 16)}
          {palo([T(caderaB), T(pb.rodilla), T(pb.tobillo)], PALO + 16)}
          <g stroke={pantalon}>
            {[pa, pb].map((q, i) => (
              <path key={i} d={`M ${T(i ? caderaB : caderaA).join(" ")} Q ${T(q.rodilla).join(" ")} ${T(q.tobillo).join(" ")}`} fill="none" stroke={pantalon} strokeWidth={PALO + 4} strokeLinecap="round" />
            ))}
          </g>
        </g>
      ) : (
        <g>
          {palo([T(caderaA), T(pa.rodilla), T(pa.tobillo)])}
          {palo([T(caderaB), T(pb.rodilla), T(pb.tobillo)])}
        </g>
      )}
      {zapato(T(pa.tobillo), -1)}
      {zapato(T(pb.tobillo), 1)}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {/* pantalón corto oscuro a la cadera (como el boceto) */}
        <path d={`M ${-58 - (d.barriga ?? 0) * 34} -14 L 62 -14 L 64 30 L 10 32 L 6 16 L -2 32 L -58 30 Z`} fill={pantalon} stroke={TINTA} strokeWidth={L} strokeLinejoin="round" />
        {!arribaA && !cruzaA && brazoDibujo(hA, p.bA, false)}
        {/* cuello de palo */}
        <path d={`M 4 ${hy - 4} L 6 ${hy - 20}`} stroke={TINTA} strokeWidth={PALO} strokeLinecap="round" />
        <Tronco d={d} hy={hy} id={id} />
        {cruzaA && brazoDibujo(hA, p.bA, true)}
        {!arribaB && brazoDibujo(hB, p.bB, true)}
        <g transform={`translate(${CABEZA[0]} ${CABEZA[1] - p.hombros * 16 + respira * 0.5}) rotate(${p.cabeza}) scale(1.12)`}>
          <CabezaFigura p={p} d={d} f={f} id={id} />
        </g>
        {/* manos en la cara o en la cabeza: por delante de la cabeza */}
        {arribaA && brazoDibujo(hA, p.bA, true)}
        {arribaB && brazoDibujo(hB, p.bB, true)}
      </g>
    </g>
  );
  return (
    <g transform={`scale(${ex} ${ey})`}>
      <defs>
        <Rayado id={`ry${id}`} />
        <Rayado id={`rf${id}`} paso={26} ang={-50} op={0.08} color="#ffffff" />
        <Rayado id={`rs${id}`} paso={11} ang={20} op={0.45} />
        {/* trazo a lápiz: las líneas tiemblan un poco, como dibujadas a mano */}
        <filter id={`lz${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={3} />
          <feDisplacementMap in="SourceGraphic" scale={5} />
        </filter>
        <filter id={`lz2${id}`} x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves={2} seed={11} />
          <feDisplacementMap in="SourceGraphic" scale={9} />
        </filter>
      </defs>
      {/* sombra rayada en el suelo */}
      <ellipse cx={p.x + 10} cy={6} rx={110 - Math.min(60, -p.y * 0.3)} ry={14} fill={`url(#rs${id})`} />
      <g filter={`url(#lz${id})`}>{cuerpo}</g>
      {/* segunda pasada del trazo, desplazada y suave: el «boceto a varias pasadas» */}
      <g filter={`url(#lz2${id})`} opacity={0.22} transform="translate(3 -2)">
        {cuerpo}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------- expresiones del reparto (naturales)
import type { Expresion } from "../bent/animaciones";
/** Caras más naturales que las de BENT: la neutra relajada, sin ceño. Al hablar las cejas acompañan a la voz. */
export function caraReparto(e: Expresion, abre: number, f: number): Partial<Pose> {
  const voz = abre > 0.05 ? Math.sin(f * 0.21) * 0.12 + abre * 0.1 : 0; // las cejas suben y bajan al hablar
  const base = (o: Partial<Pose>): Partial<Pose> => ({ ...o, alzaCejas: Math.max(0, (o.alzaCejas ?? 0) + voz), abre: o.abre ?? abre });
  switch (e) {
    case "seria":
      return base({ cejas: 0.05, alzaCejas: 0.05, ojos: "normal", boca: "seria" });
    case "chulo":
      return base({ cejas: 0.3, alzaCejas: 0.1, ojos: "normal", boca: "media" });
    case "enfadado":
      return base({ cejas: 1.25, alzaCejas: 0, ojos: "normal", boca: "triste" });
    case "feliz":
      return base({ cejas: -0.15, alzaCejas: 0.25, ojos: "normal", boca: "sonrisa" });
    case "risa":
      return base({ cejas: -0.2, alzaCejas: 0.3, ojos: "feliz", boca: "risa", abre: Math.max(abre, 0.5) });
    case "sorpresa":
      return base({ cejas: -0.25, alzaCejas: 0.75, ojos: "abiertos", boca: "o" });
    case "asustado":
      return base({ cejas: -0.8, alzaCejas: 0.9, ojos: "abiertos", boca: "asustada" });
    case "triste":
      return base({ cejas: -0.85, alzaCejas: 0.25, ojos: "normal", boca: "triste" });
    case "piensa":
      return base({ cejas: 0.25, alzaCejas: 0.35, ojos: "normal", boca: "media", mira: 0.9 });
    case "dormido":
      return { cejas: 0, alzaCejas: 0, ojos: "cerrados", boca: "seria", abre: 0 };
    case "aburrido":
      return base({ cejas: 0, alzaCejas: 0, ojos: "entornados", boca: "seria" });
  }
}
