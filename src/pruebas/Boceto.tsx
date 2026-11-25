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
export type CaraProta = "curioso" | "feliz" | "sorpresa" | "chulo" | "risa" | "piensa";
export type BrazosProta = "mejilla-cadera" | "senala" | "abiertos" | "cruzados" | "victoria" | "explica";

/** Pelo despeinado: casquete con borde de mechones irregulares, flequillo en picos y unos pelos sueltos de punta. */
function peloDespeinado(cy: number, r: number) {
  const g = Math.PI / 180;
  const fuera: string[] = [];
  const N = 22;
  for (let t = 0; t <= N; t++) {
    const a = (196 + (t * 148) / N) * g;
    const pico = t % 2 ? 8 + ((t * 7) % 4) * 5 : 0;
    fuera.push(`${Math.cos(a) * (r + pico)} ${cy + Math.sin(a) * (r + pico)}`);
  }
  // flequillo: de derecha a izquierda, en picos que bajan por la frente
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

const BRAZOS: Record<BrazosProta, { a: [number, number][]; b: [number, number][]; manoA?: "dedo"; manoB?: "dedo" }> = {
  // a = brazo izquierdo de la pantalla, b = derecho; [hombro, codo, mano]
  "mejilla-cadera": { a: [[-44, -388], [-84, -330], [-70, -468]], b: [[44, -388], [92, -326], [50, -262]] },
  senala: { a: [[-44, -388], [-62, -318], [-60, -250]], b: [[44, -388], [104, -418], [160, -462]], manoB: "dedo" },
  abiertos: { a: [[-44, -388], [-112, -372], [-158, -432]], b: [[44, -388], [112, -372], [158, -432]] },
  cruzados: { a: [[-44, -388], [-70, -322], [34, -334]], b: [[44, -388], [70, -318], [-30, -326]] },
  victoria: { a: [[-44, -388], [-92, -326], [-50, -262]], b: [[44, -388], [96, -456], [92, -548]] },
  explica: { a: [[-44, -388], [-70, -318], [-60, -250]], b: [[44, -388], [96, -330], [140, -380]] },
};

const Prota: React.FC<{ cara: CaraProta; brazos: BrazosProta; f: number }> = ({ cara: c, brazos, f }) => {
  const respira = Math.sin(f / 14) * 3;
  const cy = -505 + respira;
  const r = 94;
  const br = BRAZOS[brazos];
  const brazo = (pts: [number, number][]) => `M ${pts[0][0]} ${pts[0][1] + respira} Q ${pts[1][0]} ${pts[1][1]} ${pts[2][0]} ${pts[2][1]}`;
  const mano = (pts: [number, number][], dedo?: "dedo") => {
    const [x, y] = pts[2];
    const [cx, cyy] = pts[1];
    const ang = Math.atan2(y - cyy, x - cx);
    return (
      <g>
        {dedo ? <B grosor={6}>{(p) => <path d={`M ${x} ${y} L ${x + Math.cos(ang) * 30} ${y + Math.sin(ang) * 30}`} {...p} />}</B> : null}
        <B color="#fbf8ef" grosor={4}>{(p) => <circle cx={x} cy={y} r={15} {...p} />}</B>
      </g>
    );
  };
  // mirada y gestos de cada cara
  const ojo = {
    curioso: { px: 6, py: -9, alto: 21 },
    feliz: { px: 3, py: 0, alto: 21 },
    sorpresa: { px: 0, py: 0, alto: 25 },
    chulo: { px: 4, py: 2, alto: 21 },
    risa: { px: 0, py: 0, alto: 21 },
    piensa: { px: -6, py: -10, alto: 21 },
  }[c];
  const cejas = {
    curioso: `M -46 ${cy - 38} Q -30 ${cy - 48} -12 ${cy - 40} M 12 ${cy - 46} Q 30 ${cy - 62} 48 ${cy - 48}`,
    feliz: `M -46 ${cy - 40} Q -30 ${cy - 52} -12 ${cy - 42} M 12 ${cy - 42} Q 30 ${cy - 52} 46 ${cy - 40}`,
    sorpresa: `M -46 ${cy - 50} Q -30 ${cy - 66} -12 ${cy - 54} M 12 ${cy - 54} Q 30 ${cy - 66} 46 ${cy - 50}`,
    chulo: `M -46 ${cy - 32} Q -30 ${cy - 36} -12 ${cy - 32} M 12 ${cy - 42} Q 30 ${cy - 60} 48 ${cy - 46}`,
    risa: `M -46 ${cy - 42} Q -30 ${cy - 54} -12 ${cy - 44} M 12 ${cy - 44} Q 30 ${cy - 54} 46 ${cy - 42}`,
    piensa: `M -46 ${cy - 46} Q -30 ${cy - 60} -12 ${cy - 48} M 12 ${cy - 38} Q 30 ${cy - 44} 46 ${cy - 38}`,
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
    }
  };
  return (
    <g>
      <ellipse cx={4} cy={6} rx={92} ry={13} fill="url(#rayado)" opacity={0.5} />
      {/* piernas largas de palo y zapatos */}
      <B grosor={8}>{(p) => <path d="M -16 -236 Q -20 -120 -26 -12 M 16 -236 Q 22 -120 30 -12" {...p} />}</B>
      <B color="#2f2d2c" grosor={4}>{(p) => <path d="M -24 -18 Q -66 -18 -70 4 L -12 4 Q -8 -10 -24 -18 Z" {...p} />}</B>
      <B color="#2f2d2c" grosor={4}>{(p) => <path d="M 28 -18 Q 72 -18 76 4 L 18 4 Q 14 -10 28 -18 Z" {...p} />}</B>
      {/* camiseta negra con mangas cortas */}
      <B color="#363537" raya grosor={6}>
        {(p) => <path d={`M -38 ${-402 + respira} Q -62 ${-396 + respira} -70 -350 L -50 -340 Q -54 -290 -48 -226 Q 0 -216 48 -226 Q 54 -290 50 -340 L 70 -350 Q 62 ${-396 + respira} 38 ${-402 + respira} Q 0 ${-388 + respira} -38 ${-402 + respira} Z`} {...p} />}
      </B>
      <B grosor={8}>{(p) => <path d={brazo(br.a)} {...p} />}</B>
      <B grosor={8}>{(p) => <path d={brazo(br.b)} {...p} />}</B>
      {/* cabeza */}
      <B grosor={6}>{(p) => <path d={`M 0 ${-394 + respira} L 0 ${cy + r - 6}`} {...p} />}</B>
      <B color="#fbf8ef" grosor={7}>{(p) => <circle cx={0} cy={cy} r={r} {...p} />}</B>
      <ellipse cx={50} cy={cy + 34} rx={24} ry={36} fill="url(#rayadoFino)" opacity={0.3} />
      <B color="#2a2826" raya grosor={4}>{(p) => <path d={peloDespeinado(cy, r)} {...p} />}</B>
      <B grosor={4}>{(p) => <path d={`M -20 ${cy - r - 6} Q -34 ${cy - r - 40} -58 ${cy - r - 44} M 6 ${cy - r - 8} Q 4 ${cy - r - 46} 22 ${cy - r - 60} M 34 ${cy - r + 2} Q 56 ${cy - r - 26} 80 ${cy - r - 24}`} {...p} />}</B>
      {/* ojos */}
      {[-30, 30].map((dx) =>
        c === "risa" ? (
          <B key={dx} grosor={6}>{(p) => <path d={`M ${dx - 16} ${cy + 2} Q ${dx} ${cy - 18} ${dx + 16} ${cy + 2}`} {...p} />}</B>
        ) : (
          <g key={dx}>
            <B color="#ffffff" grosor={4}>{(p) => <ellipse cx={dx} cy={cy} rx={17} ry={ojo.alto} {...p} />}</B>
            <circle cx={dx + ojo.px} cy={cy + ojo.py} r={c === "sorpresa" ? 6 : 8.5} fill={LAPIZ} />
            <circle cx={dx + ojo.px + 2.5} cy={cy + ojo.py - 3} r={2.6} fill="#fff" />
            {c === "chulo" ? <path d={`M ${dx - 19} ${cy - 4} Q ${dx} ${cy - 12} ${dx + 19} ${cy - 4} L ${dx + 19} ${cy - 24} L ${dx - 19} ${cy - 24} Z`} fill="#fbf8ef" stroke={LAPIZ} strokeWidth={4} /> : null}
          </g>
        ),
      )}
      <B grosor={5}>{(p) => <path d={cejas} {...p} />}</B>
      {boca()}
      <ellipse cx={-54} cy={cy + 30} rx={14} ry={8} fill="#f0a8a0" opacity={0.55} filter="url(#acuarela)" />
      <ellipse cx={58} cy={cy + 26} rx={14} ry={8} fill="#f0a8a0" opacity={0.55} filter="url(#acuarela)" />
      {mano(br.a, br.manoA)}
      {mano(br.b, br.manoB)}
    </g>
  );
};

const Protagonista: React.FC<{ x: number; y: number; tam: number; f: number; cara?: CaraProta; brazos?: BrazosProta }> = ({ x, y, tam, f, cara: c = "curioso", brazos = "mejilla-cadera" }) => (
  <g transform={`translate(${x} ${y}) scale(${tam})`}>
    <Prota cara={c} brazos={brazos} f={f} />
  </g>
);

/** Hoja del protagonista: seis caras y gestos para elegir. */
export const HojaProtagonista: React.FC = () => {
  useFuente();
  const f = useCurrentFrame();
  const vinetas: [CaraProta, BrazosProta, string][] = [
    ["curioso", "mejilla-cadera", "Curioso"],
    ["feliz", "explica", "Explica contento"],
    ["sorpresa", "abiertos", "¡Sorpresa!"],
    ["chulo", "cruzados", "Seguro de sí"],
    ["risa", "victoria", "¡Lo sabía!"],
    ["piensa", "senala", "Mira esto"],
  ];
  return (
    <AbsoluteFill style={{ background: "#f6f0e2" }}>
      <svg width={W} height={H}>
        <Filtros />
        <rect width={W} height={H} fill="#f8f4ea" />
        {vinetas.map(([c, b, nombre], i) => {
          const x = 40 + (i % 3) * 620;
          const y = 30 + Math.floor(i / 3) * 520;
          return (
            <g key={i}>
              <B color="#fffdf7" grosor={5}>{(p) => <rect x={x} y={y} width={600} height={500} {...p} />}</B>
              <text x={x + 24} y={y + 52} style={{ font: `44px ${MANO}` }} fill={LAPIZ}>{nombre}</text>
              <g transform={`translate(${x + 330} ${y + 478}) scale(0.64)`}>
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
