// PRUEBA DEL ESTILO «BOCETO» (el que eligió el usuario, como su foto de perfil): lápiz tembloroso con doble trazo,
// color de acuarela que se sale un poco de la línea, rayado a lápiz en las sombras y papel crema.
// El protagonista es el muñeco de la foto de perfil del canal: cabeza redonda, pelo de pinchos, camiseta negra.
// Foto:  npx remotion still src/index.ts estilo-boceto salida/estilo-boceto.png --frame=40
import React from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";

const W = 1920;
const H = 1080;
const LAPIZ = "#2b2925";
const MANO = "Mano, 'Patrick Hand', sans-serif";

// ------------------------------------------------------------------ letra a mano
let fuenteLista: Promise<void> | null = null;
function cargaFuente() {
  if (!fuenteLista) {
    const ff = new FontFace("Mano", `url(${staticFile("fuentes/patrick-hand.woff2")})`);
    fuenteLista = ff.load().then((f) => {
      document.fonts.add(f);
    });
  }
  return fuenteLista;
}
const useFuente = () => {
  const [espera] = React.useState(() => delayRender("letra a mano"));
  React.useEffect(() => {
    cargaFuente().then(() => continueRender(espera));
  }, [espera]);
};

// ------------------------------------------------------------------ filtros de dibujo
const Filtros: React.FC = () => (
  <defs>
    <filter id="trazo" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={1} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={4} xChannelSelector="R" yChannelSelector="G" />
    </filter>
    <filter id="trazo2" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves={2} seed={7} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={8} xChannelSelector="G" yChannelSelector="R" />
    </filter>
    <filter id="acuarela" x="-10%" y="-10%" width="120%" height="120%">
      <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves={3} seed={3} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={16} xChannelSelector="R" yChannelSelector="G" result="d" />
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={5} result="n" />
      <feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -0.55 0 0 0 1.2" result="m" />
      <feComposite in="d" in2="m" operator="in" />
    </filter>
    <filter id="papel" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} seed={11} />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.13" />
      </feComponentTransfer>
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <pattern id="rayado" width="11" height="11" patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
      <line x1={0} y1={0} x2={0} y2={11} stroke={LAPIZ} strokeWidth={1.8} />
    </pattern>
    <pattern id="rayadoFino" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(-50)">
      <line x1={0} y1={0} x2={0} y2={7} stroke={LAPIZ} strokeWidth={1.2} />
    </pattern>
  </defs>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Trazo = Record<string, any>;
/** Dibuja una forma «a mano»: mancha de acuarela desplazada, rayado opcional y dos pasadas de lápiz. */
const B: React.FC<{ color?: string; raya?: boolean; grosor?: number; sinLinea?: boolean; children: (p: Trazo) => React.ReactNode }> = ({ color, raya, grosor = 4, sinLinea, children }) => (
  <g>
    {color ? (
      <g filter="url(#acuarela)" transform="translate(4 3)">
        {children({ fill: color, stroke: "none" })}
      </g>
    ) : null}
    {raya ? <g opacity={0.35}>{children({ fill: "url(#rayado)", stroke: "none" })}</g> : null}
    {sinLinea ? null : (
      <>
        <g filter="url(#trazo)">{children({ fill: "none", stroke: LAPIZ, strokeWidth: grosor, strokeLinecap: "round", strokeLinejoin: "round" })}</g>
        <g filter="url(#trazo2)" opacity={0.4}>
          {children({ fill: "none", stroke: LAPIZ, strokeWidth: grosor * 0.55, strokeLinecap: "round", strokeLinejoin: "round" })}
        </g>
      </>
    )}
  </g>
);

/** Contorno de nube con bultos (para el bocadillo de pensamiento y las nubes del cielo). */
function nube(cx: number, cy: number, rx: number, ry: number, n: number) {
  const pts: [number, number][] = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % n];
    const m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    const dx = m[0] - cx;
    const dy = m[1] - cy;
    const k = 1.22 + ((i * 37) % 10) / 60;
    d += ` Q ${cx + dx * k} ${cy + dy * k} ${q[0]} ${q[1]}`;
  }
  return d + " Z";
}

// ------------------------------------------------------------------ objetos de dinero
const Billetes: React.FC<{ x: number; y: number; g?: number; n?: number }> = ({ x, y, g = 0, n = 4 }) => (
  <g transform={`translate(${x} ${y}) rotate(${g})`}>
    {Array.from({ length: n }, (_, i) => (
      <g key={i} transform={`translate(${-i * 3} ${-i * 9})`}>
        <B color="#7fb46a">{(p) => <rect x={-80} y={-34} width={160} height={68} rx={4} {...p} />}</B>
      </g>
    ))}
    <g transform={`translate(${-(n - 1) * 3} ${-(n - 1) * 9})`}>
      <B color="#b9dca0" grosor={3}>{(p) => <ellipse rx={26} ry={22} {...p} />}</B>
      <text y={12} textAnchor="middle" style={{ font: `40px ${MANO}` }} fill="#2f5a2a">$</text>
      <B grosor={2.5}>{(p) => <rect x={-70} y={-26} width={140} height={52} rx={3} {...p} />}</B>
    </g>
  </g>
);

const Saco: React.FC<{ x: number; y: number; color: string; tam?: number }> = ({ x, y, color, tam = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${tam})`}>
    <B color={color} raya>
      {(p) => <path d="M -20 -70 Q -30 -50 -14 -44 Q -78 -20 -72 30 Q -66 70 0 70 Q 66 70 72 30 Q 78 -20 14 -44 Q 30 -50 20 -70 Q 0 -60 -20 -70 Z" {...p} />}
    </B>
    <B grosor={3}>{(p) => <path d="M -22 -46 Q 0 -38 22 -46" {...p} />}</B>
    <text y={36} textAnchor="middle" style={{ font: `64px ${MANO}` }} fill={LAPIZ}>$</text>
  </g>
);

const Moneda: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 22 }) => (
  <g transform={`translate(${x} ${y})`}>
    <B color="#f0bd3a" grosor={3}>{(p) => <circle r={r} {...p} />}</B>
    <text y={r * 0.4} textAnchor="middle" style={{ font: `${r * 1.3}px ${MANO}` }} fill="#9a6a10">$</text>
  </g>
);

const Pila: React.FC<{ x: number; y: number; n: number }> = ({ x, y, n }) => (
  <g transform={`translate(${x} ${y})`}>
    {Array.from({ length: n }, (_, i) => (
      <B key={i} color="#e9b232" grosor={2.5}>{(p) => <ellipse cy={-i * 11} rx={30} ry={10} {...p} />}</B>
    ))}
  </g>
);

const Cofre: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <B color="#a8683a" raya>{(p) => <rect x={-70} y={-40} width={140} height={74} rx={4} {...p} />}</B>
    <B color="#c07a44">{(p) => <path d="M -70 -40 Q -70 -88 0 -88 Q 70 -88 70 -40 Z" {...p} />}</B>
    <B color="#e9b232" grosor={3}>{(p) => <rect x={-12} y={-50} width={24} height={26} {...p} />}</B>
    <B grosor={3}>{(p) => <path d="M -40 -86 L -40 34 M 40 -86 L 40 34" {...p} />}</B>
  </g>
);

// ------------------------------------------------------------------ el protagonista (el de la foto de perfil)
// Reglas fijas en docs/estilo.md. Medidas en unidades del motor: pies en y = 0, ~600 hasta la punta del pelo.
export type CaraProta = "curioso" | "feliz" | "sorpresa" | "chulo" | "risa" | "piensa" | "preocupado" | "asustado" | "enfadado";
export type BrazosProta = "mejilla-cadera" | "senala" | "abiertos" | "cruzados" | "victoria" | "explica" | "manos-cabeza" | "encoge";
type Mano = "abierta" | "dedo" | "puno" | "palma";

/** Pelo despeinado: casquete con borde de mechones irregulares y flequillo en picos que deja ver la frente. */
function peloDespeinado(cy: number, r: number) {
  const g = Math.PI / 180;
  const fuera: string[] = [];
  const N = 22;
  for (let t = 0; t <= N; t++) {
    const a = (196 + (t * 148) / N) * g;
    const pico = t % 2 ? 8 + ((t * 7) % 4) * 5 : 0;
    fuera.push(`${Math.cos(a) * (r + pico)} ${cy + Math.sin(a) * (r + pico)}`);
  }
  const dentro: string[] = [];
  const M = 9;
  for (let t = 0; t <= M; t++) {
    const x = r * 0.9 - (t * r * 1.8) / M;
    const base = cy - r * 0.62 + (Math.abs(x) / r) ** 2 * r * 0.28;
    const y = t % 2 ? base + 12 + (t % 3) * 4 : base - 3;
    dentro.push(`${x} ${y}`);
  }
  return `M ${fuera.join(" L ")} L ${dentro.join(" L ")} Z`;
}

type Brazo = { p: [number, number][]; mano: Mano };
const BRAZOS: Record<BrazosProta, { a: Brazo; b: Brazo }> = {
  // a = brazo izquierdo de la pantalla, b = derecho; p = [hombro, codo, mano]
  "mejilla-cadera": { a: { p: [[-44, -388], [-86, -330], [-76, -470]], mano: "abierta" }, b: { p: [[44, -388], [94, -326], [52, -262]], mano: "puno" } },
  senala: { a: { p: [[-44, -388], [-62, -318], [-60, -250]], mano: "puno" }, b: { p: [[44, -388], [104, -418], [158, -462]], mano: "dedo" } },
  abiertos: { a: { p: [[-44, -388], [-112, -372], [-156, -432]], mano: "abierta" }, b: { p: [[44, -388], [112, -372], [156, -432]], mano: "abierta" } },
  cruzados: { a: { p: [[-44, -388], [-72, -322], [34, -334]], mano: "puno" }, b: { p: [[44, -388], [72, -318], [-30, -326]], mano: "puno" } },
  victoria: { a: { p: [[-44, -388], [-92, -326], [-52, -262]], mano: "puno" }, b: { p: [[44, -388], [98, -456], [92, -550]], mano: "puno" } },
  explica: { a: { p: [[-44, -388], [-70, -318], [-60, -250]], mano: "puno" }, b: { p: [[44, -388], [98, -330], [146, -384]], mano: "palma" } },
  "manos-cabeza": { a: { p: [[-44, -388], [-126, -400], [-96, -508]], mano: "abierta" }, b: { p: [[44, -388], [126, -400], [96, -508]], mano: "abierta" } },
  encoge: { a: { p: [[-44, -380], [-96, -316], [-142, -318]], mano: "palma" }, b: { p: [[44, -380], [96, -316], [142, -318]], mano: "palma" } },
};

/** Dedo con contorno: trazo negro grueso y blanco encima (como la mano dibujada a tinta). */
const Dedo: React.FC<{ x: number; y: number; ang: number; largo: number; ancho?: number }> = ({ x, y, ang, largo, ancho = 18 }) => {
  const d = `M ${x} ${y} L ${x + Math.cos(ang) * largo} ${y + Math.sin(ang) * largo}`;
  return (
    <g filter="url(#trazo)">
      <path d={d} stroke={LAPIZ} strokeWidth={ancho} strokeLinecap="round" />
      <path d={d} stroke="#fbf8ef" strokeWidth={ancho - 8} strokeLinecap="round" />
    </g>
  );
};

const ManoProta: React.FC<{ b: Brazo; lado: -1 | 1 }> = ({ b, lado }) => {
  const [x, y] = b.p[2];
  const [cx, cy] = b.p[1];
  const ang = Math.atan2(y - cy, x - cx); // hacia donde apunta el antebrazo
  const pulgar = ang - lado * 1.2;
  return (
    <g>
      {b.mano === "abierta" &&
        [-0.45, -0.1, 0.25].map((d) => <Dedo key={d} x={x + Math.cos(ang) * 6} y={y + Math.sin(ang) * 6} ang={ang + d * lado} largo={32} />)}
      {b.mano === "palma" &&
        [-0.35, 0, 0.35].map((d) => <Dedo key={d} x={x} y={y} ang={-Math.PI / 2 + d + lado * 0.5} largo={28} />)}
      {b.mano === "dedo" && <Dedo x={x} y={y} ang={ang} largo={46} />}
      {b.mano !== "puno" && <Dedo x={x} y={y} ang={b.mano === "palma" ? -Math.PI / 2 - lado * 0.6 : pulgar} largo={22} />}
      <B color="#fbf8ef" grosor={4}>{(p) => <circle cx={x} cy={y} r={b.mano === "puno" ? 17 : 16} {...p} />}</B>
      {b.mano === "puno" && <B grosor={2.5}>{(p) => <path d={`M ${x - 6} ${y - 8} Q ${x} ${y - 2} ${x - 6} ${y + 6}`} {...p} />}</B>}
    </g>
  );
};

/** Gota de sudor azul. */
const Sudor: React.FC<{ x: number; y: number; tam?: number }> = ({ x, y, tam = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${tam})`}>
    <B color="#9cc8ec" grosor={3.5}>{(p) => <path d="M 0 -22 Q 14 0 12 8 Q 8 20 0 20 Q -8 20 -12 8 Q -14 0 0 -22 Z" {...p} />}</B>
    <path d="M -4 4 Q -4 12 2 14" stroke="#fff" strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);

const Prota: React.FC<{ cara: CaraProta; brazos: BrazosProta; f: number }> = ({ cara: c, brazos, f }) => {
  const respira = Math.sin(f / 14) * 3;
  const tiembla = c === "asustado" ? Math.sin(f * 2.1) * 2 : 0;
  const cy = -505 + respira;
  const r = 94;
  const br = BRAZOS[brazos];
  const brazo = (b: Brazo) => `M ${b.p[0][0]} ${b.p[0][1] + respira} Q ${b.p[1][0]} ${b.p[1][1]} ${b.p[2][0]} ${b.p[2][1]}`;
  const ojo = {
    curioso: { px: 6, py: -9, alto: 21, pu: 8.5 },
    feliz: { px: 3, py: 0, alto: 21, pu: 8.5 },
    sorpresa: { px: 0, py: 0, alto: 25, pu: 6 },
    chulo: { px: 4, py: 2, alto: 21, pu: 8.5 },
    risa: { px: 0, py: 0, alto: 21, pu: 8.5 },
    piensa: { px: -6, py: -10, alto: 21, pu: 8.5 },
    preocupado: { px: -2, py: 5, alto: 22, pu: 8 },
    asustado: { px: 0, py: 0, alto: 26, pu: 5 },
    enfadado: { px: 2, py: 3, alto: 18, pu: 9 },
  }[c];
  const cejas = {
    curioso: `M -48 ${cy - 38} Q -32 ${cy - 48} -14 ${cy - 40} M 14 ${cy - 46} Q 32 ${cy - 62} 50 ${cy - 48}`,
    feliz: `M -48 ${cy - 40} Q -32 ${cy - 52} -14 ${cy - 42} M 14 ${cy - 42} Q 32 ${cy - 52} 48 ${cy - 40}`,
    sorpresa: `M -48 ${cy - 52} Q -32 ${cy - 68} -14 ${cy - 56} M 14 ${cy - 56} Q 32 ${cy - 68} 48 ${cy - 52}`,
    chulo: `M -48 ${cy - 32} Q -32 ${cy - 36} -14 ${cy - 32} M 14 ${cy - 42} Q 32 ${cy - 60} 50 ${cy - 46}`,
    risa: `M -48 ${cy - 42} Q -32 ${cy - 54} -14 ${cy - 44} M 14 ${cy - 44} Q 32 ${cy - 54} 48 ${cy - 42}`,
    piensa: `M -48 ${cy - 46} Q -32 ${cy - 60} -14 ${cy - 48} M 14 ${cy - 38} Q 32 ${cy - 44} 48 ${cy - 38}`,
    preocupado: `M -50 ${cy - 34} Q -32 ${cy - 38} -14 ${cy - 52} M 14 ${cy - 52} Q 32 ${cy - 38} 50 ${cy - 34}`,
    asustado: `M -50 ${cy - 42} Q -34 ${cy - 50} -14 ${cy - 64} M 14 ${cy - 64} Q 34 ${cy - 50} 50 ${cy - 42}`,
    enfadado: `M -50 ${cy - 50} L -12 ${cy - 30} M 12 ${cy - 30} L 50 ${cy - 50}`,
  }[c];
  const boca = () => {
    switch (c) {
      case "curioso":
        return <B grosor={5}>{(p) => <path d={`M -20 ${cy + 42} Q 6 ${cy + 56} 34 ${cy + 36}`} {...p} />}</B>;
      case "feliz":
        return <B color="#7a2a26" grosor={5}>{(p) => <path d={`M -30 ${cy + 34} Q 4 ${cy + 40} 38 ${cy + 32} Q 30 ${cy + 72} 4 ${cy + 72} Q -24 ${cy + 70} -30 ${cy + 34} Z`} {...p} />}</B>;
      case "sorpresa":
        return <B color="#7a2a26" grosor={5}>{(p) => <ellipse cx={4} cy={cy + 52} rx={14} ry={18} {...p} />}</B>;
      case "chulo":
        return <B grosor={5}>{(p) => <path d={`M -16 ${cy + 46} Q 10 ${cy + 52} 34 ${cy + 34}`} {...p} />}</B>;
      case "risa":
        return <B color="#7a2a26" grosor={5}>{(p) => <path d={`M -36 ${cy + 30} Q 4 ${cy + 38} 44 ${cy + 28} Q 36 ${cy + 84} 4 ${cy + 84} Q -30 ${cy + 82} -36 ${cy + 30} Z`} {...p} />}</B>;
      case "piensa":
        return <B grosor={5}>{(p) => <path d={`M -18 ${cy + 46} Q 4 ${cy + 54} 26 ${cy + 42}`} {...p} />}</B>;
      case "preocupado":
        return <B grosor={5}>{(p) => <path d={`M -24 ${cy + 52} Q -14 ${cy + 44} -4 ${cy + 52} Q 6 ${cy + 60} 16 ${cy + 52} Q 24 ${cy + 46} 30 ${cy + 50}`} {...p} />}</B>;
      case "asustado":
        return <B color="#7a2a26" grosor={5}>{(p) => <path d={`M -22 ${cy + 44} Q -10 ${cy + 38} 4 ${cy + 42} Q 18 ${cy + 38} 30 ${cy + 44} Q 34 ${cy + 76} 4 ${cy + 78} Q -26 ${cy + 76} -22 ${cy + 44} Z`} {...p} />}</B>;
      case "enfadado":
        return <B grosor={5}>{(p) => <path d={`M -22 ${cy + 58} Q 4 ${cy + 40} 30 ${cy + 58}`} {...p} />}</B>;
    }
  };
  const lineasImpacto = (
    <B grosor={4}>
      {(p) => (
        <path
          d={[-150, -120, -60, -20, 20, 60].map((a) => {
            const g = (a * Math.PI) / 180;
            return `M ${Math.cos(g) * (r + 40)} ${cy + Math.sin(g) * (r + 40)} L ${Math.cos(g) * (r + 66)} ${cy + Math.sin(g) * (r + 66)}`;
          }).join(" ")}
          {...p}
        />
      )}
    </B>
  );
  return (
    <g transform={`translate(${tiembla} 0)`}>
      <ellipse cx={4} cy={6} rx={92} ry={13} fill="url(#rayado)" opacity={0.5} />
      {/* pantalón negro recto, zapatos */}
      <B color="#2c2b2d" raya grosor={5}>{(p) => <path d="M -40 -236 L 40 -236 L 34 -16 L 10 -16 L 4 -180 L -4 -180 L -10 -16 L -34 -16 Z" {...p} />}</B>
      <B color="#2f2d2c" grosor={4}>{(p) => <path d="M -26 -20 Q -70 -20 -74 4 L -12 4 Q -8 -12 -26 -20 Z" {...p} />}</B>
      <B color="#2f2d2c" grosor={4}>{(p) => <path d="M 28 -20 Q 74 -20 78 4 L 14 4 Q 10 -12 28 -20 Z" {...p} />}</B>
      {/* camiseta negra de manga corta */}
      <B color="#363537" raya grosor={6}>
        {(p) => <path d={`M -38 ${-402 + respira} Q -62 ${-396 + respira} -70 -350 L -50 -340 Q -54 -290 -50 -226 Q 0 -218 50 -226 Q 54 -290 50 -340 L 70 -350 Q 62 ${-396 + respira} 38 ${-402 + respira} Q 0 ${-388 + respira} -38 ${-402 + respira} Z`} {...p} />}
      </B>
      {/* cabeza */}
      <B grosor={6}>{(p) => <path d={`M 0 ${-394 + respira} L 0 ${cy + r - 6}`} {...p} />}</B>
      <B color="#fbf8ef" grosor={7}>{(p) => <circle cx={0} cy={cy} r={r} {...p} />}</B>
      <ellipse cx={50} cy={cy + 34} rx={24} ry={36} fill="url(#rayadoFino)" opacity={0.3} />
      <B color="#2a2826" raya grosor={4}>{(p) => <path d={peloDespeinado(cy, r)} {...p} />}</B>
      <B grosor={4}>{(p) => <path d={`M -20 ${cy - r - 6} Q -34 ${cy - r - 40} -58 ${cy - r - 44} M 6 ${cy - r - 8} Q 4 ${cy - r - 46} 22 ${cy - r - 60} M 34 ${cy - r + 2} Q 56 ${cy - r - 26} 80 ${cy - r - 24}`} {...p} />}</B>
      {[-30, 30].map((dx) =>
        c === "risa" ? (
          <B key={dx} grosor={6}>{(p) => <path d={`M ${dx - 16} ${cy + 2} Q ${dx} ${cy - 18} ${dx + 16} ${cy + 2}`} {...p} />}</B>
        ) : (
          <g key={dx}>
            <B color="#ffffff" grosor={4}>{(p) => <ellipse cx={dx} cy={cy} rx={17} ry={ojo.alto} {...p} />}</B>
            <circle cx={dx + ojo.px} cy={cy + ojo.py} r={ojo.pu} fill={LAPIZ} />
            <circle cx={dx + ojo.px + 2.5} cy={cy + ojo.py - 3} r={2.6} fill="#fff" />
            {c === "chulo" ? <path d={`M ${dx - 19} ${cy - 4} Q ${dx} ${cy - 12} ${dx + 19} ${cy - 4} L ${dx + 19} ${cy - 24} L ${dx - 19} ${cy - 24} Z`} fill="#fbf8ef" stroke={LAPIZ} strokeWidth={4} /> : null}
          </g>
        ),
      )}
      <B grosor={5}>{(p) => <path d={cejas} {...p} />}</B>
      {boca()}
      {c === "enfadado" ? null : (
        <>
          <ellipse cx={-56} cy={cy + 30} rx={14} ry={8} fill="#f0a8a0" opacity={0.55} filter="url(#acuarela)" />
          <ellipse cx={60} cy={cy + 26} rx={14} ry={8} fill="#f0a8a0" opacity={0.55} filter="url(#acuarela)" />
        </>
      )}
      {/* brazos y manos (delante de la cabeza: así la mano puede ir a la mejilla) */}
      <B grosor={8}>{(p) => <path d={brazo(br.a)} {...p} />}</B>
      <B grosor={8}>{(p) => <path d={brazo(br.b)} {...p} />}</B>
      <ManoProta b={br.a} lado={-1} />
      <ManoProta b={br.b} lado={1} />
      {/* extras de la emoción */}
      {c === "preocupado" ? <Sudor x={82} y={cy - 46} /> : null}
      {c === "asustado" ? (
        <>
          <Sudor x={-104} y={cy - 6} tam={0.8} />
          <Sudor x={108} y={cy + 10} tam={0.9} />
          {lineasImpacto}
        </>
      ) : null}
      {c === "sorpresa" ? lineasImpacto : null}
      {c === "piensa" ? <text x={96} y={cy - 90} style={{ font: `90px ${MANO}` }} fill={LAPIZ}>?</text> : null}
      {c === "enfadado" ? (
        <B grosor={3}>{(p) => <path d={`M 90 ${cy - 120} c 30 -20 50 10 20 20 c -30 10 -40 -30 -5 -35 c 40 -5 45 40 5 45 c -35 5 -50 -35 -15 -50`} {...p} />}</B>
      ) : null}
    </g>
  );
};

const Protagonista: React.FC<{ x: number; y: number; tam: number; f: number; cara?: CaraProta; brazos?: BrazosProta }> = ({ x, y, tam, f, cara: c = "curioso", brazos = "mejilla-cadera" }) => (
  <g transform={`translate(${x} ${y}) scale(${tam})`}>
    <Prota cara={c} brazos={brazos} f={f} />
  </g>
);

/** Hoja del protagonista: todas las caras con su gesto típico. */
export const HojaProtagonista: React.FC = () => {
  useFuente();
  const f = useCurrentFrame();
  const vinetas: [CaraProta, BrazosProta, string][] = [
    ["curioso", "mejilla-cadera", "curioso"],
    ["feliz", "explica", "feliz"],
    ["risa", "victoria", "risa"],
    ["sorpresa", "abiertos", "sorpresa"],
    ["chulo", "cruzados", "chulo"],
    ["piensa", "senala", "piensa"],
    ["preocupado", "encoge", "preocupado"],
    ["asustado", "manos-cabeza", "asustado"],
    ["enfadado", "cruzados", "enfadado"],
  ];
  const cols = 5;
  const aw = 366;
  const ah = 510;
  return (
    <AbsoluteFill style={{ background: "#f6f0e2" }}>
      <svg width={W} height={H}>
        <Filtros />
        <rect width={W} height={H} fill="#f8f4ea" />
        {vinetas.map(([c, b, nombre], i) => {
          const fila = Math.floor(i / cols);
          const enFila = fila === 0 ? cols : vinetas.length - cols;
          const x0 = (W - (enFila * aw + (enFila - 1) * 14)) / 2;
          const x = x0 + (i % cols) * (aw + 14);
          const y = 22 + fila * (ah + 16);
          return (
            <g key={i}>
              <B color="#fffdf7" grosor={4.5}>{(p) => <rect x={x} y={y} width={aw} height={ah} {...p} />}</B>
              <text x={x + 18} y={y + 44} style={{ font: `38px ${MANO}` }} fill={LAPIZ}>{nombre}</text>
              <g transform={`translate(${x + aw / 2} ${y + ah - 26}) scale(0.68)`}>
                <Prota cara={c} brazos={b} f={f + i * 9} />
              </g>
            </g>
          );
        })}
        <rect width={W} height={H} fill="#fff" filter="url(#papel)" />
      </svg>
    </AbsoluteFill>
  );
};

/** Gente pequeña al fondo (palitos con camiseta y maletín o saco). */
const Paseante: React.FC<{ x: number; y: number; tam: number; color: string; lleva?: "maletin" | "saco"; espejo?: boolean }> = ({ x, y, tam, color, lleva, espejo }) => (
  <g transform={`translate(${x} ${y}) scale(${espejo ? -tam : tam} ${tam})`}>
    <B grosor={7}>{(p) => <path d="M -10 -150 L -34 -4 M 10 -150 L 30 -4" {...p} />}</B>
    <B color={color} grosor={5}>{(p) => <path d="M -32 -270 Q -38 -200 -30 -150 L 30 -150 Q 38 -200 32 -270 Q 0 -282 -32 -270 Z" {...p} />}</B>
    <B grosor={7}>{(p) => <path d="M -30 -262 L -56 -170 M 30 -262 L 58 -176" {...p} />}</B>
    <B color="#fbf8ef" grosor={6}>{(p) => <circle cy={-330} r={52} {...p} />}</B>
    <circle cx={10} cy={-334} r={5} fill={LAPIZ} />
    <circle cx={30} cy={-334} r={5} fill={LAPIZ} />
    <B grosor={4}>{(p) => <path d="M 4 -306 Q 20 -296 36 -308" {...p} />}</B>
    {lleva === "maletin" ? <B color="#8a5a30" grosor={5}>{(p) => <rect x={42} y={-180} width={56} height={44} rx={4} {...p} />}</B> : null}
    {lleva === "saco" ? (
      <g transform="translate(-58 -150) scale(0.55)">
        <Saco x={0} y={0} color="#8ab86e" />
      </g>
    ) : null}
  </g>
);

// ------------------------------------------------------------------ decorado
const Ciudad: React.FC = () => {
  const edificios: [number, number, number, string][] = [
    [40, 280, 150, "#c8d4de"],
    [770, 300, 130, "#d4dbe2"],
    [920, 210, 110, "#c2cfda"],
    [1240, 260, 140, "#cbd6df"],
    [1400, 170, 120, "#bccad6"],
    [1540, 330, 150, "#d0d9e1"],
    [1710, 230, 170, "#c4d0da"],
  ];
  return (
    <g>
      {edificios.map(([x, top, w, c], i) => (
        <g key={i}>
          <B color={c} grosor={3.5}>{(p) => <rect x={x} y={top} width={w} height={760 - top} {...p} />}</B>
          {Array.from({ length: Math.floor((700 - top) / 60) }, (_, fi) =>
            Array.from({ length: Math.floor(w / 46) }, (_, ci) => (
              <rect key={`${fi}-${ci}`} x={x + 16 + ci * 44} y={top + 26 + fi * 60} width={20} height={30} fill="#9fb4c6" opacity={0.6} stroke={LAPIZ} strokeOpacity={0.5} strokeWidth={1.5} />
            )),
          )}
        </g>
      ))}
    </g>
  );
};

const Banco: React.FC = () => (
  <g>
    <B color="#e9dcc0" raya>{(p) => <polygon points="110,380 430,210 750,380" {...p} />}</B>
    <B color="#efe4cc">{(p) => <rect x={100} y={378} width={660} height={44} {...p} />}</B>
    <B color="#e4d6b8">{(p) => <rect x={140} y={420} width={580} height={300} {...p} />}</B>
    <B color="#7a5a3e" raya>{(p) => <path d="M 385 720 L 385 560 Q 430 520 475 560 L 475 720 Z" {...p} />}</B>
    {[170, 280, 560, 670].map((x) => (
      <g key={x}>
        <B color="#f6efe0">{(p) => <rect x={x} y={430} width={50} height={280} {...p} />}</B>
        <rect x={x + 32} y={432} width={16} height={276} fill="url(#rayado)" opacity={0.4} />
      </g>
    ))}
    <B color="#ddd0b2">{(p) => <rect x={110} y={712} width={640} height={24} {...p} />}</B>
    <B color="#d4c6a6" raya>{(p) => <rect x={80} y={736} width={700} height={26} {...p} />}</B>
    <text x={430} y={352} textAnchor="middle" style={{ font: `66px ${MANO}` }} fill={LAPIZ}>BANCO</text>
  </g>
);

const Grafica: React.FC = () => (
  <g>
    <B grosor={6}>{(p) => <path d="M 1560 640 L 1560 800" {...p} />}</B>
    <B color="#fffdf6" grosor={5}>{(p) => <rect x={1390} y={440} width={340} height={210} rx={6} {...p} />}</B>
    <text x={1410} y={485} style={{ font: `38px ${MANO}` }} fill={LAPIZ}>ACCIONES</text>
    <B grosor={3}>{(p) => <path d="M 1414 510 L 1414 625 L 1710 625" {...p} />}</B>
    <B grosor={7}>{(p) => <path d="M 1420 600 L 1480 575 L 1520 585 L 1580 530 L 1610 545" {...p} stroke="#4a9a52" />}</B>
    <B grosor={7}>{(p) => <path d="M 1610 545 L 1650 590 L 1670 578 L 1700 615" {...p} stroke="#d0403a" />}</B>
    <B grosor={6}>{(p) => <path d="M 1680 612 L 1702 617 L 1700 596" {...p} stroke="#d0403a" />}</B>
  </g>
);

const Pensamiento: React.FC<{ f: number }> = ({ f }) => {
  const flota = (i: number) => Math.sin((f + i * 17) / 12) * 6;
  return (
    <g>
      <B color="#ffffff" grosor={4.5}>{(p) => <path d={nube(960, 215, 330, 150, 14)} {...p} />}</B>
      <B color="#ffffff" grosor={4}>{(p) => <ellipse cx={1030} cy={392} rx={22} ry={15} {...p} />}</B>
      <B color="#ffffff" grosor={3.5}>{(p) => <ellipse cx={1050} cy={428} rx={12} ry={9} {...p} />}</B>
      <g transform={`translate(0 ${flota(0)})`}>
        <Billetes x={760} y={210} g={-8} />
      </g>
      <g transform={`translate(0 ${flota(1)})`}>
        <Saco x={930} y={200} color="#8ab86e" />
      </g>
      <g transform={`translate(0 ${flota(2)})`}>
        <Saco x={1060} y={180} color="#f0c050" tam={0.85} />
      </g>
      <g transform={`translate(0 ${flota(3)})`}>
        <Cofre x={1170} y={270} />
      </g>
      <g transform={`translate(0 ${flota(4)})`}>
        <Pila x={850} y={320} n={5} />
      </g>
      <Moneda x={720} y={110} r={20} />
      <Moneda x={1010} y={300} r={24} />
      <Moneda x={1210} y={130} r={20} />
      <Moneda x={1260} y={210} r={16} />
      <text x={830} y={110} style={{ font: `44px ${MANO}` }} fill="#4a8a40">$</text>
      <text x={1130} y={100} style={{ font: `40px ${MANO}` }} fill="#c99a20">$</text>
      <text x={680} y={280} style={{ font: `36px ${MANO}` }} fill="#5a7ab0">$</text>
    </g>
  );
};

// ------------------------------------------------------------------ fotograma
export const EstiloBoceto: React.FC = () => {
  useFuente();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#f6f0e2" }}>
      <svg width={W} height={H}>
        <Filtros />
        <rect width={W} height={H} fill="#f6f0e2" />
        {/* cielo de acuarela */}
        <rect x={-20} y={-20} width={W + 40} height={720} fill="#c6deeb" opacity={0.75} filter="url(#acuarela)" />
        <B color="#fbf8f0" grosor={2.5}>{(p) => <path d={nube(240, 120, 110, 36, 9)} {...p} />}</B>
        <B color="#fbf8f0" grosor={2.5}>{(p) => <path d={nube(1640, 90, 130, 34, 9)} {...p} />}</B>
        <B grosor={3}>{(p) => <path d="M 1480 150 q 12 -12 24 0 q 12 -12 24 0 M 1560 120 q 9 -9 18 0 q 9 -9 18 0" {...p} />}</B>
        <Ciudad />
        {/* acera */}
        <B color="#e4d4b4" grosor={4}>{(p) => <rect x={-20} y={760} width={W + 40} height={340} {...p} />}</B>
        {Array.from({ length: 9 }, (_, i) => (
          <B key={i} grosor={2.5}>{(p) => <path d={`M ${i * 240 - 60} 1080 L ${i * 200 + 40} 762`} {...p} />}</B>
        ))}
        <Banco />
        <Grafica />
        <Paseante x={560} y={900} tam={0.42} color="#7a8ea6" lleva="maletin" />
        <Paseante x={260} y={930} tam={0.46} color="#a8846a" lleva="saco" espejo />
        <Pensamiento f={f} />
        <Protagonista x={1150} y={1000} tam={0.98} f={f} cara="curioso" brazos="mejilla-cadera" />
        {/* grano de papel */}
        <rect width={W} height={H} fill="#fff" filter="url(#papel)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 34, textAlign: "center" }}>
        <span style={{ font: `66px ${MANO}`, color: "#fff", WebkitTextStroke: `8px ${LAPIZ}`, paintOrder: "stroke", letterSpacing: 1 }}>¿Y si tu dinero no está en el banco?</span>
      </div>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ escena ISOMÉTRICA (estilo infografía)
// Mundo en metros: x hacia abajo-derecha, y hacia abajo-izquierda, z hacia arriba.
const ISO = { ox: 960, oy: 300, s: 40 };
const iso = (x: number, y: number, z = 0): [number, number] => [ISO.ox + (x - y) * 0.866 * ISO.s, ISO.oy + (x + y) * 0.5 * ISO.s - z * ISO.s];
const pts = (...ps: [number, number][]) => ps.map((p) => p.join(",")).join(" ");

/** Bloque de edificio isométrico: techo, fachada izquierda (y = y1) y fachada derecha (x = x1, rayada). */
const Bloque: React.FC<{ x0: number; x1: number; y0: number; y1: number; h: number; techo: string; izq: string; der: string; ventanas?: string; nombre?: string; tamNombre?: number }> = ({ x0, x1, y0, y1, h, techo, izq, der, ventanas, nombre, tamNombre = 46 }) => {
  const filas = Math.floor((h - 0.6) / 1.2);
  const vIzq: React.ReactNode[] = [];
  const vDer: React.ReactNode[] = [];
  if (ventanas) {
    for (let f = 0; f < filas; f++) {
      const z0 = 0.7 + f * 1.2;
      for (let u = x0 + 0.5; u + 0.6 <= x1 - 0.3; u += 1.1) vIzq.push(<polygon key={`i${f}-${u}`} points={pts(iso(u, y1, z0), iso(u + 0.6, y1, z0), iso(u + 0.6, y1, z0 + 0.7), iso(u, y1, z0 + 0.7))} fill={ventanas} stroke={LAPIZ} strokeWidth={1.8} strokeOpacity={0.7} />);
      for (let v = y0 + 0.5; v + 0.6 <= y1 - 0.3; v += 1.1) vDer.push(<polygon key={`d${f}-${v}`} points={pts(iso(x1, v, z0), iso(x1, v + 0.6, z0), iso(x1, v + 0.6, z0 + 0.7), iso(x1, v, z0 + 0.7))} fill={ventanas} stroke={LAPIZ} strokeWidth={1.8} strokeOpacity={0.6} />);
    }
  }
  const [nx, ny] = iso((x0 + x1) / 2 - 0.2 * (x1 - x0), y1, h - 0.4);
  return (
    <g>
      <B color={izq}>{(p) => <polygon points={pts(iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x0, y1, h))} {...p} />}</B>
      <B color={der} raya>{(p) => <polygon points={pts(iso(x1, y0, 0), iso(x1, y1, 0), iso(x1, y1, h), iso(x1, y0, h))} {...p} />}</B>
      <B color={techo}>{(p) => <polygon points={pts(iso(x0, y0, h), iso(x1, y0, h), iso(x1, y1, h), iso(x0, y1, h))} {...p} />}</B>
      {vIzq}
      <g opacity={0.85}>{vDer}</g>
      {nombre ? (
        <text transform={`matrix(0.866 0.5 0 1 ${nx} ${ny})`} style={{ font: `${tamNombre}px ${MANO}` }} fill={LAPIZ}>{nombre}</text>
      ) : null}
    </g>
  );
};

/** El banco en isométrica: zócalo, columnas en la fachada y frontón. */
const BancoIso: React.FC = () => {
  const x0 = 2, x1 = 8, y0 = 11, y1 = 16, h = 3.6;
  return (
    <g>
      <B color="#d8caa8" raya>{(p) => <polygon points={pts(iso(x0 - 0.4, y1 + 0.6, 0), iso(x1 + 0.4, y1 + 0.6, 0), iso(x1 + 0.4, y1 + 0.6, 0.4), iso(x0 - 0.4, y1 + 0.6, 0.4))} {...p} />}</B>
      <B color="#e6d9bc">{(p) => <polygon points={pts(iso(x0 - 0.4, y0 - 0.4, 0.4), iso(x1 + 0.4, y0 - 0.4, 0.4), iso(x1 + 0.4, y1 + 0.6, 0.4), iso(x0 - 0.4, y1 + 0.6, 0.4))} {...p} />}</B>
      <Bloque x0={x0} x1={x1} y0={y0} y1={y1} h={h} techo="#e9dcc0" izq="#eadfc6" der="#d9c9a6" />
      {/* columnas delante de la fachada */}
      {[2.5, 3.8, 5.1, 6.4, 7.6].map((u) => (
        <B key={u} color="#f7f1e2">{(p) => <polygon points={pts(iso(u - 0.22, y1 + 0.3, 0.4), iso(u + 0.22, y1 + 0.3, 0.4), iso(u + 0.22, y1 + 0.3, h), iso(u - 0.22, y1 + 0.3, h))} {...p} />}</B>
      ))}
      {/* frontón (triángulo) y tejado */}
      <B color="#d4c4a0" raya>{(p) => <polygon points={pts(iso(x1 + 0.3, y1 + 0.5, h), iso(x1 + 0.3, y0 - 0.3, h), iso(x1 + 0.3 - 3.3, y0 - 0.3, h + 1.6), iso(x1 + 0.3 - 3.3, y1 + 0.5, h + 1.6))} {...p} />}</B>
      <B color="#efe4cc">{(p) => <polygon points={pts(iso(x0 - 0.3, y1 + 0.5, h), iso(x1 + 0.3, y1 + 0.5, h), iso((x0 + x1) / 2, y1 + 0.5, h + 1.6))} {...p} />}</B>
      <text transform={`matrix(0.866 0.5 0 1 ${iso(3.6, y1 + 0.5, h + 0.45)[0]} ${iso(3.6, y1 + 0.5, h + 0.45)[1]})`} style={{ font: `40px ${MANO}` }} fill={LAPIZ}>BANCO</text>
    </g>
  );
};

/** Barco de carga en el canal con contenedores. */
const Barco: React.FC<{ f: number }> = ({ f }) => {
  const dz = Math.sin(f / 10) * 0.05;
  const x0 = 17.9, x1 = 20.1;
  const y0 = 8 + f * 0.01, y1 = 14.5 + f * 0.01;
  return (
    <g transform={`translate(0 ${-dz * ISO.s})`}>
      <B color="#5a6e8a" raya>{(p) => <polygon points={pts(iso(x0, y1, 0), iso(x1, y1, 0), iso(x1, y1 + 1.2, 0.9), iso(x0 + 1.1, y1 + 1.6, 1), iso(x0, y1 + 1.2, 0.9))} {...p} />}</B>
      <Bloque x0={x0} x1={x1} y0={y0} y1={y1} h={0.9} techo="#8a5a4a" izq="#c0504a" der="#9a3a36" />
      <Bloque x0={x0 + 0.2} x1={x1 - 0.2} y0={y0 + 0.5} y1={y0 + 2.6} h={2.1} techo="#9ac0d8" izq="#7aa8c8" der="#5a88a8" />
      <Bloque x0={x0 + 0.2} x1={x1 - 0.2} y0={y0 + 2.9} y1={y0 + 5} h={2.1} techo="#f0c050" izq="#e9b232" der="#c99020" />
      <text transform={`matrix(0.866 0.5 0 1 ${iso(x0 + 0.5, y0 + 5, 1.7)[0]} ${iso(x0 + 0.5, y0 + 5, 1.7)[1]})`} style={{ font: `34px ${MANO}` }} fill={LAPIZ}>$</text>
      <Bloque x0={x0 + 0.4} x1={x1 - 0.4} y0={y0 - 0.2} y1={y0 + 0.4} h={2.8} techo="#eae4d8" izq="#f4efe4" der="#d8d0c0" />
    </g>
  );
};

const Arbol: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const [X, Y] = iso(x, y);
  return (
    <g>
      <B grosor={5}>{(p) => <path d={`M ${X} ${Y} L ${X} ${Y - 40}`} {...p} />}</B>
      <B color="#8fbf78" raya grosor={3.5}>{(p) => <path d={nube(X, Y - 66, 34, 32, 8)} {...p} />}</B>
    </g>
  );
};

export const EstiloIsometrico: React.FC = () => {
  useFuente();
  const f = useCurrentFrame();
  const flota = (i: number) => Math.sin((f + i * 15) / 11) * 7;
  const suelo = pts(iso(-8, -8), iso(32, -8), iso(32, 32), iso(-8, 32));
  const canal = pts(iso(17, -8), iso(21, -8), iso(21, 32), iso(17, 32));
  const calle = pts(iso(-8, 17.4), iso(17, 17.4), iso(17, 19.6), iso(-8, 19.6));
  const calle2 = pts(iso(15, -8), iso(16.6, -8), iso(16.6, 17.4), iso(15, 17.4));
  return (
    <AbsoluteFill style={{ background: "#f6f0e2" }}>
      <svg width={W} height={H}>
        <Filtros />
        <rect width={W} height={H} fill="#f6f0e2" />
        <rect x={-20} y={-20} width={W + 40} height={420} fill="#cfe2ec" opacity={0.7} filter="url(#acuarela)" />
        <B color="#fbf8f0" grosor={2.5}>{(p) => <path d={nube(300, 110, 120, 36, 9)} {...p} />}</B>
        <B color="#fbf8f0" grosor={2.5}>{(p) => <path d={nube(1580, 80, 140, 34, 9)} {...p} />}</B>
        <B grosor={3}>{(p) => <path d="M 1420 150 q 12 -12 24 0 q 12 -12 24 0 M 1500 120 q 9 -9 18 0 q 9 -9 18 0" {...p} />}</B>
        {/* suelo, canal y calles */}
        <B color="#e8dbbf" grosor={3}>{(p) => <polygon points={suelo} {...p} />}</B>
        <B color="#dcd3c2" grosor={3}>{(p) => <polygon points={calle} {...p} />}</B>
        <B color="#dcd3c2" grosor={3}>{(p) => <polygon points={calle2} {...p} />}</B>
        <B color="#9cc4dc" grosor={4}>{(p) => <polygon points={canal} {...p} />}</B>
        {Array.from({ length: 10 }, (_, i) => {
          const [X, Y] = iso(18 + (i % 3) * 1.1, -4 + i * 3.4);
          return <B key={i} grosor={2.5}>{(p) => <path d={`M ${X} ${Y} q 10 -6 20 0 q 10 6 20 0`} {...p} stroke="#5a88a8" />}</B>;
        })}
        {/* edificios, de atrás hacia delante */}
        <Bloque x0={1} x1={4} y0={1} y1={4} h={10} techo="#b8c8d6" izq="#cbd6df" der="#aebccb" ventanas="#9fb8cc" />
        <Bloque x0={6} x1={9.5} y0={-1} y1={2.5} h={8.5} techo="#c2d0da" izq="#d4dde4" der="#b4c2ce" ventanas="#a8c0d2" />
        <Bloque x0={-1} x1={2.5} y0={6} y1={9} h={7.5} techo="#c0cdd8" izq="#cdd7e0" der="#b2c0cc" ventanas="#a4bcd0" />
        <Bloque x0={9} x1={14} y0={4} y1={9} h={6} techo="#d6dde2" izq="#e2e6ea" der="#c4ccd4" ventanas="#9ec4d8" nombre="BOLSA" />
        {/* pantalla de la bolsa con flecha que sube */}
        <g transform={`translate(0 ${flota(0)})`}>
          <B color="#fffdf6" grosor={4}>{(p) => <rect x={1090} y={300} width={190} height={120} rx={6} {...p} />}</B>
          <B grosor={6}>{(p) => <path d="M 1110 396 L 1150 372 L 1180 384 L 1220 340 L 1256 326" {...p} stroke="#4a9a52" />}</B>
          <B grosor={5}>{(p) => <path d="M 1236 322 L 1258 325 L 1252 346" {...p} stroke="#4a9a52" />}</B>
        </g>
        <BancoIso />
        <Arbol x={9} y={16.5} />
        <Arbol x={12} y={14} />
        <Arbol x={1} y={20.5} />
        <Barco f={f} />
        {/* gente y dinero en la calle */}
        <Paseante x={iso(10, 18.5)[0]} y={iso(10, 18.5)[1]} tam={0.3} color="#7a8ea6" lleva="maletin" />
        <Paseante x={iso(6.5, 18.8)[0]} y={iso(6.5, 18.8)[1]} tam={0.3} color="#a8846a" lleva="saco" espejo />
        <Paseante x={iso(12.5, 11)[0]} y={iso(12.5, 11)[1]} tam={0.27} color="#8a9a6a" />
        <Moneda x={iso(13.5, 18)[0]} y={iso(13.5, 18)[1] - 14} r={16} />
        <Moneda x={iso(14, 18.8)[0]} y={iso(14, 18.8)[1] - 12} r={14} />
        {/* símbolos flotantes */}
        <g transform={`translate(0 ${flota(1)})`}>
          <text x={560} y={420} style={{ font: `70px ${MANO}` }} fill="#4a8a40">$</text>
        </g>
        <g transform={`translate(0 ${flota(2)})`}>
          <text x={1500} y={330} style={{ font: `64px ${MANO}` }} fill="#c99a20">$</text>
        </g>
        {/* protagonista en primer término con su pensamiento */}
        <B color="#ffffff" grosor={4.5}>{(p) => <path d={nube(1640, 520, 150, 80, 11)} {...p} />}</B>
        <B color="#ffffff" grosor={3.5}>{(p) => <ellipse cx={1610} cy={630} rx={18} ry={12} {...p} />}</B>
        <B color="#ffffff" grosor={3}>{(p) => <ellipse cx={1626} cy={662} rx={10} ry={7} {...p} />}</B>
        <Moneda x={1580} y={515} r={30} />
        <text x={1640} y={548} style={{ font: `90px ${MANO}` }} fill={LAPIZ}>?</text>
        <Protagonista x={1640} y={1060} tam={0.62} f={f} cara="curioso" brazos="mejilla-cadera" />
        <rect width={W} height={H} fill="#fff" filter="url(#papel)" />
      </svg>
    </AbsoluteFill>
  );
};
