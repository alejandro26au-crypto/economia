// EL REPARTO: personajes 2D de "palito" con cara expresiva. Cabeza blanca grande, cejas que cuentan la emoción,
// cuerpo pequeño con la ropa del papel que hacen y brazos y piernas finos de tinta. Cada vídeo elige su
// protagonista (pirata, farero, cocinero…) del catálogo (reparto.ts) o uno nuevo.
// Usa la misma pose y las mismas animaciones que el muñeco de BENT (src/bent/animaciones.ts): mismas unidades
// (pies en y = 0, ~950 de alto hasta lo alto del sombrero) y la misma cara (src/bent/rig.tsx).
import React from "react";
import { Brazo, ManoDibujo, Pierna, Pose } from "../bent/rig";

export const TINTA = "#09080d";
const L = 7;

export type Ropa = "camisa" | "rayas" | "chaqueta" | "chaleco" | "armadura" | "bata" | "delantal" | "tunica" | "jersey" | "traje";
export type Pelo = "corto" | "rizado" | "coleta" | "calvo" | "canoso" | "melena" | "tupe" | "ninguno";
export type Sombrero = "ninguno" | "tricornio" | "bandana" | "gorro-lana" | "capitan" | "salacot" | "corona" | "casco-griego" | "chistera" | "cocinero" | "sueste" | "marinero" | "casco" | "bombin" | "gorra";

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
const MUSLO = 150;
const PANTORRILLA = 150;
const BRAZO = 128;
const ANTEBRAZO = 118;
const R = 112;
const HOMBRO_Y = -255;
const CABEZA: P = [6, -398];
const PALO = 15; // grosor de brazos y piernas

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

const CabezaFigura: React.FC<{ p: Pose; d: Diseno; f: number; id: string }> = ({ p, d, f, id }) => {
  const pelo = d.colorPelo ?? "#3a2618";
  return (
    <g>
      <PeloDibujo d={d} delante={false} />
      <circle r={R} fill="#f6f6f9" stroke={TINTA} strokeWidth={L * 1.1} />
      <clipPath id={`fc${id}`}>
        <circle r={R - 4} />
      </clipPath>
      <g clipPath={`url(#fc${id})`}>
        <ellipse cx={132} cy={14} rx={64} ry={150} fill="#cfd0da" />
        <ellipse cx={0} cy={150} rx={150} ry={48} fill="#dcdde5" />
        <ellipse cx={-52} cy={-58} rx={34} ry={20} fill="#ffffff" />
      </g>
      {d.barba && <Barba tipo={d.barba} color={pelo} />}
      <PeloDibujo d={d} delante />
      <CaraLimpia p={p} f={f} />
      {d.bigote === "fino" && <path d="M 18 64 Q -4 58 -20 70 Q 10 66 18 70 Q 40 66 62 70 Q 44 56 18 64 Z" fill={pelo} stroke={TINTA} strokeWidth={4} />}
      {d.bigote === "grueso" && <path d="M 18 58 Q -14 48 -34 72 Q 0 70 18 74 Q 46 70 76 72 Q 54 46 18 58 Z" fill={pelo} stroke={TINTA} strokeWidth={4.5} />}
      {d.bigote === "manillar" && <path d="M 18 62 Q -10 50 -36 64 Q -58 58 -50 40 Q -64 72 -30 76 Q 0 72 18 72 Q 42 72 70 76 Q 102 70 88 40 Q 94 58 74 64 Q 46 50 18 62 Z" fill={pelo} stroke={TINTA} strokeWidth={4.5} />}
      {d.parche && (
        <g>
          <path d="M -110 -40 L 110 -20" stroke={TINTA} strokeWidth={7} />
          <ellipse cx={-18} cy={30} rx={30} ry={26} fill={TINTA} />
        </g>
      )}
      {d.gafas && (
        <g fill="#e6f6ff" fillOpacity={0.2} stroke={TINTA} strokeWidth={6}>
          <circle cx={-18} cy={30} r={25} />
          <circle cx={48} cy={26} r={25} />
          <path d="M 7 29 L 23 28" fill="none" />
        </g>
      )}
      <SombreroDibujo d={d} />
    </g>
  );
};

// ---------------------------------------------------------------- cara (estilo limpio y profesional)
// Ojos: óvalos negros con brillo (blancos solo con sorpresa o miedo). Cejas: trazos gruesos de punta redonda con un
// arco suave que se inclinan con la emoción. Bocas de forma limpia. Vista de 3/4 mirando a la derecha.
const CaraLimpia: React.FC<{ p: Pose; f: number }> = ({ p, f }) => {
  const ojos: { x: number; y: number; k: number; lado: -1 | 1 }[] = [
    { x: -24, y: 22, k: 0.92, lado: -1 },
    { x: 42, y: 18, k: 1, lado: 1 },
  ];
  // parpadeo natural (cada ~3-4 s, 4 fotogramas)
  const ciclo = (f + 23) % 107;
  const cierre = ciclo < 4 ? 1 - Math.abs(ciclo - 1.5) / 2.5 : 0;
  const m = p.mira * 3.5;
  const ojo = (o: (typeof ojos)[number]) => {
    const { x, y, k } = o;
    if (p.ojos === "feliz") return <path key={x} d={`M ${x - 12 * k} ${y + 5} Q ${x} ${y - 10} ${x + 12 * k} ${y + 5}`} fill="none" stroke={TINTA} strokeWidth={7} strokeLinecap="round" />;
    if (p.ojos === "cerrados" || cierre > 0.7) return <path key={x} d={`M ${x - 11 * k} ${y + 1} Q ${x} ${y + 6} ${x + 11 * k} ${y + 1}`} fill="none" stroke={TINTA} strokeWidth={6} strokeLinecap="round" />;
    if (p.ojos === "abiertos")
      return (
        <g key={x}>
          <ellipse cx={x} cy={y} rx={16 * k} ry={19 * k} fill="#ffffff" stroke={TINTA} strokeWidth={5} />
          <ellipse cx={x + m} cy={y + 1} rx={6.5 * k} ry={7.5 * k} fill={TINTA} />
        </g>
      );
    const ry = 14 * k * (1 - cierre * 0.6);
    const entorna = p.ojos === "entornados";
    return (
      <g key={x}>
        <ellipse cx={x + m * 0.4} cy={y} rx={9.5 * k} ry={ry} fill={TINTA} />
        <circle cx={x + m * 0.4 - 3} cy={y - ry * 0.45} r={3.2 * k} fill="#ffffff" opacity={0.9} />
        {entorna && <path d={`M ${x - 13 * k} ${y - 3} L ${x + 13 * k} ${y - 5} L ${x + 13 * k} ${y - 20} L ${x - 13 * k} ${y - 20} Z`} fill="#f6f6f9" />}
        {entorna && <path d={`M ${x - 12 * k} ${y - 3} L ${x + 12 * k} ${y - 5}`} stroke={TINTA} strokeWidth={5} strokeLinecap="round" />}
      </g>
    );
  };
  const ceja = (o: (typeof ojos)[number]) => {
    const { x, y, k, lado } = o;
    // lado -1 = ojo izquierdo: su extremo interior queda a la derecha
    const xi = x - lado * 10 * k;
    const xe = x + lado * 22 * k;
    const sube = p.alzaCejas * 16;
    const base = y - 31 - sube;
    const c = p.cejas;
    const yi = base + (c > 0 ? c * 9 : c * 10); // enfado baja el interior; tristeza lo sube
    const ye = base + (c > 0 ? -c * 3 : -c * 4);
    const arco = 5 + Math.max(0, p.alzaCejas) * 4 - Math.max(0, c) * 3;
    return <path key={`c${x}`} d={`M ${xe} ${ye} Q ${(xi + xe) / 2} ${Math.min(yi, ye) - arco} ${xi} ${yi}`} fill="none" stroke={TINTA} strokeWidth={11 * k} strokeLinecap="round" />;
  };
  const bx = 14;
  const by = 66;
  const a = p.abre;
  const st = { stroke: TINTA, strokeWidth: 5.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  let boca: React.ReactNode;
  const abierta = (ancho: number, alto: number, sonrie: number) => (
    <g>
      <path d={`M ${bx - ancho} ${by - sonrie} Q ${bx} ${by - sonrie * 0.2} ${bx + ancho} ${by - sonrie} Q ${bx + ancho * 0.7} ${by + alto} ${bx} ${by + alto} Q ${bx - ancho * 0.7} ${by + alto} ${bx - ancho} ${by - sonrie} Z`} fill="#3c0e18" {...st} />
      {alto > 12 && <path d={`M ${bx - ancho * 0.75} ${by - sonrie * 0.75} Q ${bx} ${by - sonrie * 0.1 + 3} ${bx + ancho * 0.75} ${by - sonrie * 0.75} L ${bx + ancho * 0.7} ${by - sonrie * 0.6 + 6} Q ${bx} ${by + 6} ${bx - ancho * 0.7} ${by - sonrie * 0.6 + 6} Z`} fill="#ffffff" />}
      {alto > 14 && <ellipse cx={bx + 2} cy={by + alto - 6} rx={ancho * 0.45} ry={5} fill="#d9566a" />}
    </g>
  );
  if (p.boca === "risa") boca = abierta(28, 26 + a * 6, 8);
  else if (p.boca === "asustada")
    // susto: boca abierta con las comisuras hacia abajo y los dientes apretados arriba y abajo
    boca = (
      <g>
        <path d={`M ${bx - 22} ${by + 8} Q ${bx} ${by - 8} ${bx + 22} ${by + 8} Q ${bx + 18} ${by + 30} ${bx} ${by + 30} Q ${bx - 18} ${by + 30} ${bx - 22} ${by + 8} Z`} fill="#3c0e18" {...st} />
        <path d={`M ${bx - 17} ${by + 6} Q ${bx} ${by - 4} ${bx + 17} ${by + 6} L ${bx + 15} ${by + 11} Q ${bx} ${by + 3} ${bx - 15} ${by + 11} Z`} fill="#ffffff" />
        <path d={`M ${bx - 13} ${by + 25} Q ${bx} ${by + 21} ${bx + 13} ${by + 25} L ${bx + 11} ${by + 28} Q ${bx} ${by + 27} ${bx - 11} ${by + 28} Z`} fill="#ffffff" />
      </g>
    );
  else if (p.boca === "o") boca = <ellipse cx={bx} cy={by + 6} rx={9} ry={11 + a * 4} fill="#3c0e18" {...st} />;
  else if (a > 0.15) boca = abierta(p.boca === "sonrisa" ? 22 : 16, 4 + a * 18, p.boca === "sonrisa" ? 6 : 0);
  else if (p.boca === "sonrisa") boca = <path d={`M ${bx - 20} ${by - 2} Q ${bx} ${by + 12} ${bx + 22} ${by - 4}`} fill="none" {...st} strokeWidth={6} />;
  else if (p.boca === "media") boca = <path d={`M ${bx - 14} ${by + 3} Q ${bx + 4} ${by + 5} ${bx + 18} ${by - 5}`} fill="none" {...st} strokeWidth={6} />;
  else if (p.boca === "triste") boca = <path d={`M ${bx - 15} ${by + 6} Q ${bx} ${by - 5} ${bx + 15} ${by + 6}`} fill="none" {...st} strokeWidth={6} />;
  else if (p.boca === "dientes") boca = abierta(24, 12, 4);
  else boca = <path d={`M ${bx - 13} ${by + 1} Q ${bx} ${by + 2.5} ${bx + 13} ${by}`} fill="none" {...st} strokeWidth={6} />;
  return (
    <g>
      {ojos.map(ojo)}
      {p.ojos !== "cerrados" && ojos.map(ceja)}
      {boca}
    </g>
  );
};

// ---------------------------------------------------------------- cuerpo (tronco con su ropa)
const Tronco: React.FC<{ d: Diseno; hy: number; id: string }> = ({ d, hy, id }) => {
  const c = d.color;
  const c2 = d.color2 ?? "#f2f0ea";
  const oro = d.detalle ?? "#e0b04a";
  const b = (d.barriga ?? 0) * 34;
  const ancho = 88 + b;
  const forma = `M ${-ancho * 0.82} ${hy + 16} Q ${-ancho * 0.9} ${hy - 20} -20 ${hy - 26} L 20 ${hy - 26} Q ${ancho * 0.9} ${hy - 20} ${ancho * 0.82} ${hy + 16} Q ${ancho * 1.12} ${(hy - 20) / 2} ${ancho} -26 Q ${ancho * 0.85} 18 0 20 Q ${-ancho * 0.85} 18 ${-ancho} -26 Q ${-ancho * 1.12} ${(hy - 20) / 2} ${-ancho * 0.82} ${hy + 16} Z`;
  const largo = d.ropa === "tunica" || d.ropa === "bata" ? 70 : d.ropa === "chaqueta" ? 46 : 0;
  const st = { stroke: TINTA, strokeWidth: L, strokeLinejoin: "round" as const };
  return (
    <g>
      <defs>
        <clipPath id={`tr${id}`}>
          <path d={forma} />
        </clipPath>
        <linearGradient id={`tg${id}`} x1="0" x2="1" y1="0" y2="0.2">
          <stop offset="0" stopColor={aclara(c, 0.18)} />
          <stop offset="0.55" stopColor={c} />
          <stop offset="1" stopColor={aclara(c, -0.32)} />
        </linearGradient>
      </defs>
      {/* faldón (abrigos, túnicas y batas) */}
      {largo > 0 && <path d={`M ${-ancho * 0.98} -30 L ${-ancho * 1.08} ${largo} Q 0 ${largo + 16} ${ancho * 1.08} ${largo} L ${ancho * 0.98} -30 Z`} fill={d.ropa === "bata" ? "#eef0f4" : aclara(c, -0.1)} {...st} />}
      <path d={forma} fill={`url(#tg${id})`} {...st} />
      <g clipPath={`url(#tr${id})`}>
        {d.ropa === "rayas" && Array.from({ length: 8 }, (_, i) => <rect key={i} x={-200} y={hy - 20 + i * 38} width={400} height={18} fill={c2} />)}
        {d.ropa === "armadura" &&
          Array.from({ length: 9 }, (_, j) =>
            Array.from({ length: 9 }, (_, i) => <path key={`${i}-${j}`} d={`M ${-120 + i * 30 + (j % 2) * 15} ${hy - 10 + j * 30} q 15 26 30 0`} fill="none" stroke={aclara(c, 0.35)} strokeWidth={5} />),
          )}
        {d.ropa === "jersey" && Array.from({ length: 7 }, (_, i) => <path key={i} d={`M ${-90 + i * 30} ${hy} L ${-90 + i * 30} 20`} stroke="#000" strokeOpacity={0.18} strokeWidth={8} />)}
        <path d={`M ${ancho * 0.4} ${hy} Q ${ancho * 1.1} ${(hy - 20) / 2} ${ancho * 0.6} 20 L 200 20 L 200 ${hy - 40} Z`} fill="#000" opacity={0.18} />
      </g>
      {/* detalles de cada ropa */}
      {(d.ropa === "camisa" || d.ropa === "traje") && <path d={`M -34 ${hy - 26} L 6 ${hy + 24} L 46 ${hy - 26} L 40 ${hy - 6} L 6 ${hy + 40} L -28 ${hy - 6} Z`} fill={d.ropa === "traje" ? "#f4f4f6" : aclara(c, 0.3)} {...st} strokeWidth={4.5} />}
      {d.ropa === "traje" && <path d={`M 0 ${hy + 18} L 12 ${hy + 18} L 16 ${hy + 110} L 6 ${hy + 128} L -4 ${hy + 110} Z`} fill={d.detalle ?? "#9b1b2a"} {...st} strokeWidth={4} />}
      {(d.ropa === "camisa" || d.ropa === "traje") && [hy + 70, hy + 120, hy + 170].map((y) => <circle key={y} cx={8} cy={y} r={6} fill={aclara(c, -0.4)} />)}
      {d.ropa === "chaqueta" && (
        <g>
          <path d={`M -30 ${hy - 26} L 6 ${hy + 60} L 42 ${hy - 26} Z`} fill={c2} {...st} strokeWidth={4.5} />
          <path d={`M -30 ${hy - 26} L -60 ${hy + 50} L 6 ${hy + 60} M 42 ${hy - 26} L 72 ${hy + 50} L 6 ${hy + 60}`} fill="none" stroke={aclara(c, -0.45)} strokeWidth={6} />
          {[hy + 90, hy + 140, hy + 190].map((y) => [-22, 34].map((x) => <circle key={`${x}${y}`} cx={x} cy={y} r={8} fill={oro} stroke={TINTA} strokeWidth={3} />))}
        </g>
      )}
      {d.ropa === "chaleco" && (
        <g>
          <path d={`M -26 ${hy - 26} L 6 ${hy + 170} L 38 ${hy - 26} Z`} fill={c2} {...st} strokeWidth={4.5} />
          {[hy + 60, hy + 110].map((y) => <circle key={y} cx={-6} cy={y} r={6} fill={oro} stroke={TINTA} strokeWidth={3} />)}
        </g>
      )}
      {d.ropa === "bata" && (
        <g>
          <path d={`M 4 ${hy - 26} L 4 ${largo}`} stroke={TINTA} strokeWidth={5} />
          <rect x={30} y={hy + 70} width={42} height={36} rx={5} fill="#dfe3ea" stroke={TINTA} strokeWidth={4} />
          <path d={`M 44 ${hy + 70} L 44 ${hy + 48}`} stroke="#2a5fb0" strokeWidth={7} strokeLinecap="round" />
        </g>
      )}
      {d.ropa === "delantal" && <path d={`M -56 ${hy + 50} L 66 ${hy + 50} L 76 22 Q 6 34 -66 22 Z`} fill="#f6f6f8" {...st} />}
      {d.ropa === "tunica" && <path d={`M -90 ${hy + 4} L 80 ${hy + 200}`} stroke={c2} strokeWidth={24} />}
      {d.ropa === "jersey" && <path d={`M -44 ${hy - 26} Q 6 ${hy + 6} 56 ${hy - 26} L 50 ${hy - 2} Q 6 ${hy + 26} -38 ${hy - 2} Z`} fill={aclara(c, -0.12)} {...st} strokeWidth={4.5} />}
      {d.cinturon && (
        <g>
          <path d={`M ${-ancho * 1.02} -40 Q 0 -24 ${ancho * 1.02} -40 L ${ancho * 0.98} -12 Q 0 4 ${-ancho * 0.98} -12 Z`} fill="#3a2414" {...st} strokeWidth={5} />
          <rect x={-10} y={-34} width={34} height={28} rx={4} fill={oro} stroke={TINTA} strokeWidth={4} />
        </g>
      )}
      {d.panuelo && (
        <g {...st} strokeWidth={5}>
          <path d={`M -44 ${hy - 22} Q 6 ${hy + 10} 56 ${hy - 22} L 50 ${hy - 2} Q 6 ${hy + 26} -38 ${hy - 2} Z`} fill={d.panuelo} />
          <path d={`M 10 ${hy + 10} L -6 ${hy + 60} L 26 ${hy + 54} Z`} fill={d.panuelo} />
        </g>
      )}
    </g>
  );
};

// ---------------------------------------------------------------- figura completa
export const Figura: React.FC<{ p: Pose; d: Diseno; f: number; id?: string }> = ({ p, d, f, id = "fg" }) => {
  const caderaA: P = [-34, -10];
  const caderaB: P = [34, -10];
  const pierna = (c: P, q: Pierna) => {
    const rodilla = sumaP(c, q.h, MUSLO);
    const tobillo = sumaP(rodilla, q.h + q.r, PANTORRILLA);
    return { rodilla, tobillo };
  };
  const pa = pierna(caderaA, p.pA);
  const pb = pierna(caderaB, p.pB);
  const altoCadera = Math.max(pa.tobillo[1], pb.tobillo[1]) + 26;
  const raiz: P = [p.x, -altoCadera + p.y];
  const T = (q: P): P => [q[0] + raiz[0], q[1] + raiz[1]];
  const respira = p.respira * 4;
  const hy = HOMBRO_Y - p.hombros * 26 + respira;
  const ancho = 88 + (d.barriga ?? 0) * 34;
  const hA: P = [-ancho * 0.78, hy + 14];
  const hB: P = [ancho * 0.78, hy + 12];
  const brazo = (h: P, b: Brazo) => {
    // sin bolsillos: con "bolsillo" las manos van a la cadera (brazos en jarras)
    const bb = b.mano === "bolsillo" ? { ...b, h: b.h * 1.4, c: b.c * 1.25, mano: "puno" as const } : b;
    const codo = sumaP(h, bb.h, BRAZO);
    const muneca = sumaP(codo, bb.h + bb.c, ANTEBRAZO);
    return { codo, muneca, ang: bb.h + bb.c, mano: bb.mano, giro: bb.giroMano ?? 0 };
  };
  const palo = (pts: P[]) => {
    const dd = `M ${pts[0][0]} ${pts[0][1]} Q ${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}`;
    return <path d={dd} fill="none" stroke={TINTA} strokeWidth={PALO} strokeLinecap="round" strokeLinejoin="round" />;
  };
  const brazoDibujo = (h: P, b: Brazo) => {
    const x = brazo(h, b);
    return (
      <g>
        {palo([h, x.codo, x.muneca])}
        <g transform={`translate(${x.muneca[0]} ${x.muneca[1]}) rotate(${-x.ang}) scale(0.85)`}>
          <g transform={`rotate(${x.giro})`}>
            <ManoDibujo mano={x.mano} />
          </g>
        </g>
      </g>
    );
  };
  const zapato = (tob: P, lado: -1 | 1) => (
    <g transform={`translate(${tob[0]} ${tob[1]}) scale(${lado} 1)`}>
      <path d="M -26 -6 Q -30 -30 -4 -30 Q 20 -30 30 -14 Q 66 -10 70 14 L 70 22 L -30 22 Z" fill={d.zapato ?? "#2a2230"} stroke={TINTA} strokeWidth={L * 0.9} strokeLinejoin="round" />
      <path d="M -16 -18 Q 4 -26 20 -18" fill="none" stroke="#ffffff" strokeOpacity={0.35} strokeWidth={6} strokeLinecap="round" />
    </g>
  );
  const [ex, ey] = d.escala ?? [1, 1];
  return (
    <g transform={`scale(${ex} ${ey})`}>
      <ellipse cx={p.x + 6} cy={10} rx={120 - Math.min(70, -p.y * 0.3)} ry={16} fill="#000" opacity={0.25} />
      {/* piernas de palo */}
      {palo([T(caderaA), T(pa.rodilla), T(pa.tobillo)])}
      {palo([T(caderaB), T(pb.rodilla), T(pb.tobillo)])}
      {zapato(T(pa.tobillo), -1)}
      {zapato(T(pb.tobillo), 1)}
      <g transform={`rotate(${p.inclina} ${raiz[0]} ${raiz[1]}) translate(${raiz[0]} ${raiz[1]})`}>
        {brazoDibujo(hA, p.bA)}
        <Tronco d={d} hy={hy} id={id} />
        {brazoDibujo(hB, p.bB)}
        <g transform={`translate(${CABEZA[0]} ${CABEZA[1] - p.hombros * 16 + respira * 0.5}) rotate(${p.cabeza}) scale(1.12)`}>
          <CabezaFigura p={p} d={d} f={f} id={id} />
        </g>
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
