// PRUEBA DE ESTILOS para los vídeos largos (2D): la MISMA escena dibujada de tres maneras para elegir.
// Escena: «el banco se hunde» — el banquero asustado ante una gráfica que cae y un ahorrador sorprendido.
//   estilo-plano     → dibujo plano tipo explicativo (colores lisos, formas simples)
//   estilo-ilustrado → ilustración pintada (textura de papel, luz cálida contra fría, mucho detalle)
//   estilo-mezcla    → fondo 2D con objetos 3D sueltos (moneda que gira y barras de la gráfica)
// Foto:  npx remotion still src/index.ts estilo-plano salida/estilo-plano.png --frame=40
import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import * as THREE from "three";
import { POSE_BASE, Pose } from "../bent/rig";
import { Anim, Expresion, cara, cuerpo } from "../bent/animaciones";
import { Figura, caraReparto, TINTA } from "../reparto/figura";
import { REPARTO } from "../reparto/reparto";

const W = 1920;
const H = 1080;

// ------------------------------------------------------------------ comunes
const Personaje: React.FC<{ quien: string; anim: Anim; cara: Expresion; x: number; y: number; tam: number; f: number; espejo?: boolean }> = ({ quien, anim, cara: c, x, y, tam, f, espejo }) => {
  const p = { ...POSE_BASE, ...cuerpo(anim, f, 3), ...cara(c, 0), ...caraReparto(c, 0, f) } as Pose;
  return (
    <g transform={`translate(${x} ${y}) scale(${espejo ? -tam : tam} ${tam})`}>
      <Figura p={p} d={REPARTO[quien]} f={f} id={quien} />
    </g>
  );
};

const Subtitulo: React.FC<{ texto: string; claro?: boolean }> = ({ texto, claro }) => (
  <div style={{ position: "absolute", left: 0, right: 0, bottom: 70, textAlign: "center" }}>
    <span style={{ font: "900 58px 'Arial Black', Arial, sans-serif", color: claro ? "#fff" : "#fff", padding: "6px 26px", WebkitTextStroke: "3px #09080d", paintOrder: "stroke", textShadow: "0 6px 0 #09080d" }}>{texto}</span>
  </div>
);

const Etiqueta: React.FC<{ texto: string }> = ({ texto }) => (
  <div style={{ position: "absolute", left: 40, top: 34, font: "700 30px Arial, sans-serif", color: "#fff", background: "rgba(9,8,13,0.75)", padding: "8px 18px", borderRadius: 10 }}>{texto}</div>
);

// línea de la bolsa que sube y luego se hunde (forma inventada, solo para la prueba)
const PUNTOS = [0.62, 0.58, 0.6, 0.52, 0.47, 0.5, 0.42, 0.38, 0.4, 0.33, 0.36, 0.55, 0.7, 0.66, 0.85, 0.93];
const linea = (x0: number, y0: number, w: number, h: number) => PUNTOS.map((v, i) => `${i ? "L" : "M"} ${x0 + (i / (PUNTOS.length - 1)) * w} ${y0 + v * h}`).join(" ");

// ------------------------------------------------------------------ 1) PLANO
const FondoPlano: React.FC<{ conGrafica?: boolean }> = ({ conGrafica = true }) => (
  <>
    <rect width={W} height={H} fill="#f4ead6" />
    <circle cx={1500} cy={250} r={420} fill="#efdfc2" />
    <rect y={820} width={W} height={260} fill="#d9c7a4" />
    {/* banco */}
    <g stroke={TINTA} strokeWidth={8} strokeLinejoin="round">
      <rect x={150} y={360} width={620} height={460} fill="#e9e2d2" />
      <polygon points="120,370 460,190 800,370" fill="#dcd2bc" />
      <rect x={120} y={360} width={680} height={36} fill="#cfc4ab" />
      {[210, 340, 470, 600].map((x) => (
        <rect key={x} x={x} y={410} width={60} height={370} fill="#f7f3ea" />
      ))}
      <rect x={110} y={780} width={700} height={40} fill="#cfc4ab" />
      <rect x={400} y={600} width={120} height={180} fill="#5a4a3a" />
    </g>
    <text x={460} y={330} textAnchor="middle" fill={TINTA} style={{ font: "900 56px 'Arial Black', Arial" }}>BANCO</text>
    {conGrafica ? (
      <g>
        <rect x={1020} y={170} width={760} height={470} rx={24} fill="#ffffff" stroke={TINTA} strokeWidth={8} />
        <text x={1060} y={235} style={{ font: "900 40px 'Arial Black', Arial" }} fill={TINTA}>ACCIONES DEL BANCO</text>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1={1060} x2={1740} y1={300 + i * 80} y2={300 + i * 80} stroke="#e6dccb" strokeWidth={4} />
        ))}
        <path d={linea(1060, 220, 680, 400)} fill="none" stroke="#e23b3b" strokeWidth={14} strokeLinejoin="round" strokeLinecap="round" />
        <polygon points="1740,592 1712,560 1765,555" fill="#e23b3b" />
      </g>
    ) : null}
  </>
);

const MonedaPlana: React.FC<{ x: number; y: number; r: number; g?: number }> = ({ x, y, r, g = 0 }) => (
  <g transform={`translate(${x} ${y}) rotate(${g})`}>
    <ellipse rx={r} ry={r} fill="#f2b632" stroke={TINTA} strokeWidth={6} />
    <ellipse rx={r * 0.7} ry={r * 0.7} fill="none" stroke="#c98a12" strokeWidth={5} />
    <text y={r * 0.3} textAnchor="middle" style={{ font: `900 ${r}px 'Arial Black', Arial` }} fill="#c98a12">$</text>
  </g>
);

export const EstiloPlano: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={W} height={H}>
        <FondoPlano />
        <MonedaPlana x={880} y={300} r={46} g={-15} />
        <MonedaPlana x={960} y={430} r={34} g={20} />
        <MonedaPlana x={850} y={560} r={28} g={5} />
        <Personaje quien="millonario" anim="asustado" cara="asustado" x={1120} y={960} tam={0.5} f={f} />
        <Personaje quien="oficinista" anim="encoge" cara="sorpresa" x={1560} y={960} tam={0.5} f={f} espejo />
      </svg>
      <Subtitulo texto="¡Y AÚN ES PEOR!" />
      <Etiqueta texto="Estilo 1 · Plano (explicativo)" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 2) ILUSTRADO
const Pintura: React.FC = () => (
  <defs>
    <filter id="papel" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={3} seed={4} result="ruido" />
      <feColorMatrix type="saturate" values="0" />
      <feComponentTransfer>
        <feFuncA type="table" tableValues="0 0.16" />
      </feComponentTransfer>
      <feComposite in2="SourceGraphic" operator="in" />
    </filter>
    <filter id="pincel" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={2} seed={9} result="t" />
      <feDisplacementMap in="SourceGraphic" in2="t" scale={7} />
    </filter>
    <filter id="manchas">
      <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={4} seed={2} />
      <feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.12  0 0 0 0 0.05  0 0 0 0.55 -0.12" />
    </filter>
    <filter id="borroso">
      <feGaussianBlur stdDeviation="30" />
    </filter>
    <linearGradient id="pared" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#3a2a24" />
      <stop offset="1" stopColor="#6e4a32" />
    </linearGradient>
    <linearGradient id="suelo" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#5a3a26" />
      <stop offset="1" stopColor="#24160f" />
    </linearGradient>
    <linearGradient id="noche" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#14203e" />
      <stop offset="1" stopColor="#36507a" />
    </linearGradient>
    <linearGradient id="marmol" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stopColor="#b8ab96" />
      <stop offset="0.35" stopColor="#efe6d4" />
      <stop offset="1" stopColor="#8a7c68" />
    </linearGradient>
    <linearGradient id="madera" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stopColor="#8a4e2a" />
      <stop offset="1" stopColor="#4a2814" />
    </linearGradient>
    <radialGradient id="luzCalida" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stopColor="#ffcf7a" stopOpacity={0.75} />
      <stop offset="1" stopColor="#ffcf7a" stopOpacity={0} />
    </radialGradient>
    <radialGradient id="vineta" cx="0.5" cy="0.5" r="0.75">
      <stop offset="0.55" stopColor="#000" stopOpacity={0} />
      <stop offset="1" stopColor="#000" stopOpacity={0.6} />
    </radialGradient>
  </defs>
);

const Columna: React.FC<{ x: number }> = ({ x }) => (
  <g filter="url(#pincel)">
    <rect x={x - 70} y={150} width={140} height={40} fill="#d8ccb6" stroke={TINTA} strokeWidth={6} />
    <rect x={x - 52} y={190} width={104} height={560} fill="url(#marmol)" stroke={TINTA} strokeWidth={6} />
    {[-30, -10, 10, 30].map((d) => (
      <line key={d} x1={x + d} x2={x + d} y1={196} y2={744} stroke="#7a6c58" strokeOpacity={0.35} strokeWidth={4} />
    ))}
    <path d={`M ${x - 30} 260 q 30 60 10 130 t 25 140`} fill="none" stroke="#8a7a66" strokeOpacity={0.5} strokeWidth={3} />
    <rect x={x - 75} y={750} width={150} height={44} fill="#c8bba4" stroke={TINTA} strokeWidth={6} />
  </g>
);

export const EstiloIlustrado: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#2a1c16" }}>
      <svg width={W} height={H}>
        <Pintura />
        {/* pared y suelo */}
        <rect width={W} height={H} fill="url(#pared)" />
        <rect width={W} height={H} filter="url(#manchas)" />
        {/* ventanal de noche con lluvia (luz fría) */}
        <g filter="url(#pincel)">
          <path d="M 1290 120 L 1290 700 L 1770 700 L 1770 120 Q 1530 -40 1290 120 Z" fill="url(#noche)" stroke={TINTA} strokeWidth={10} />
          {[1350, 1430, 1520, 1600, 1680].map((x, i) => (
            <rect key={x} x={x} y={430 - (i % 3) * 70} width={60} height={270 + (i % 3) * 70} fill="#0e1628" />
          ))}
          {[1365, 1445, 1535, 1615, 1695].map((x, i) => (
            <rect key={x} x={x} y={470 - (i % 3) * 70} width={14} height={14} fill="#ffd27a" opacity={0.9} />
          ))}
          <line x1={1530} x2={1530} y1={40} y2={700} stroke={TINTA} strokeWidth={9} />
          <line x1={1290} x2={1770} y1={400} y2={400} stroke={TINTA} strokeWidth={9} />
        </g>
        {Array.from({ length: 40 }, (_, i) => {
          const x = 1300 + ((i * 97) % 460);
          const y = 130 + ((i * 173 + f * 18) % 560);
          return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 34} stroke="#9fb8e8" strokeOpacity={0.45} strokeWidth={3} />;
        })}
        <polygon points="1290,700 1770,700 1640,1080 1050,1080" fill="#6a8ac8" opacity={0.12} />
        {/* columnas */}
        <Columna x={170} />
        <Columna x={1150} />
        {/* pizarra de la bolsa con la gráfica en tiza */}
        <g filter="url(#pincel)">
          <rect x={330} y={150} width={690} height={420} rx={10} fill="#1f3a2c" stroke="#5a3a20" strokeWidth={22} />
          <rect x={330} y={150} width={690} height={420} rx={10} fill="none" stroke={TINTA} strokeWidth={6} />
          <text x={370} y={215} style={{ font: "700 40px Georgia, serif" }} fill="#efe9d8" opacity={0.9}>BOLSA · ACCIONES DEL BANCO</text>
          {[0, 1, 2].map((i) => (
            <line key={i} x1={370} x2={980} y1={290 + i * 85} y2={290 + i * 85} stroke="#efe9d8" strokeOpacity={0.15} strokeWidth={3} strokeDasharray="10 12" />
          ))}
          <path d={linea(370, 210, 610, 330)} fill="none" stroke="#ff8a7a" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={0.95} />
          <path d={linea(372, 214, 610, 330)} fill="none" stroke="#ffd0c4" strokeWidth={3} strokeLinecap="round" opacity={0.5} />
        </g>
        {/* lámpara de banquero (luz cálida) */}
        <circle cx={560} cy={760} r={420} fill="url(#luzCalida)" />
        {/* suelo de madera */}
        <rect y={790} width={W} height={290} fill="url(#suelo)" />
        {Array.from({ length: 12 }, (_, i) => (
          <line key={i} x1={i * 180 - 40} y1={790} x2={i * 230 - 400} y2={1080} stroke="#1a0e08" strokeOpacity={0.5} strokeWidth={4} />
        ))}
        {/* mostrador del banco */}
        <g filter="url(#pincel)">
          <rect x={300} y={640} width={560} height={260} fill="url(#madera)" stroke={TINTA} strokeWidth={8} />
          <rect x={285} y={620} width={590} height={34} fill="#a8683a" stroke={TINTA} strokeWidth={8} />
          {[340, 520, 700].map((x) => (
            <rect key={x} x={x} y={690} width={130} height={170} fill="none" stroke="#2a160a" strokeWidth={6} opacity={0.7} />
          ))}
          {/* lámpara verde */}
          <rect x={555} y={560} width={12} height={62} fill="#c9a24a" stroke={TINTA} strokeWidth={4} />
          <path d="M 490 570 Q 561 520 632 570 Z" fill="#2f7a4a" stroke={TINTA} strokeWidth={6} />
          <ellipse cx={561} cy={622} rx={50} ry={10} fill="#c9a24a" stroke={TINTA} strokeWidth={4} />
          {/* papeles y monedas sobre el mostrador */}
          <polygon points="360,612 470,600 480,618 370,630" fill="#efe6cf" stroke={TINTA} strokeWidth={4} />
          {[700, 735, 770].map((x, i) => (
            <ellipse key={x} cx={x} cy={614 - i * 3} rx={26} ry={9} fill="#e8b23a" stroke={TINTA} strokeWidth={4} />
          ))}
        </g>
        {/* papeles volando */}
        {[
          [1000, 330, -25],
          [1220, 470, 18],
          [930, 560, 40],
        ].map(([x, y, g], i) => (
          <g key={i} transform={`translate(${x} ${y + Math.sin((f + i * 20) / 9) * 10}) rotate(${g})`} filter="url(#pincel)">
            <rect x={-46} y={-32} width={92} height={64} fill="#f2ead6" stroke={TINTA} strokeWidth={5} />
            {[-14, 0, 14].map((d) => (
              <line key={d} x1={-32} x2={30} y1={d} y2={d} stroke="#8a7a66" strokeWidth={3} />
            ))}
          </g>
        ))}
        {/* personajes */}
        <Personaje quien="millonario" anim="asustado" cara="asustado" x={1010} y={985} tam={0.5} f={f} />
        <Personaje quien="oficinista" anim="encoge" cara="sorpresa" x={1460} y={995} tam={0.52} f={f} espejo />
        {/* acabado: viñeta y grano de papel */}
        <rect width={W} height={H} fill="url(#vineta)" />
        <rect width={W} height={H} fill="#fff" filter="url(#papel)" />
      </svg>
      <Subtitulo texto="¡Y AÚN ES PEOR!" />
      <Etiqueta texto="Estilo 2 · Ilustración con detalle" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ 3) MEZCLA (fondo 2D + objetos 3D)
const toon = (color: string) => new THREE.MeshToonMaterial({ color });
const contorno = new THREE.MeshBasicMaterial({ color: TINTA, side: THREE.BackSide });

/** Pieza 3D con contorno de tinta (casco invertido un poco más grande). */
const ConTinta: React.FC<{ geo: THREE.BufferGeometry; color: string; grosor?: number; pos?: [number, number, number]; rot?: [number, number, number] }> = ({ geo, color, grosor = 1.06, pos, rot }) => (
  <group position={pos} rotation={rot}>
    <mesh geometry={geo} material={toon(color)} />
    <mesh geometry={geo} material={contorno} scale={grosor} />
  </group>
);

const Escena3D: React.FC<{ f: number }> = ({ f }) => {
  const moneda = React.useMemo(() => new THREE.CylinderGeometry(1, 1, 0.18, 48), []);
  const relieve = React.useMemo(() => new THREE.TorusGeometry(0.78, 0.05, 8, 48), []);
  const barra = React.useMemo(() => new THREE.BoxGeometry(0.62, 1, 0.62), []);
  const alturas = [2.9, 2.4, 1.8, 1.1, 0.5];
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[4, 6, 6]} intensity={2.2} />
      <directionalLight position={[-5, 2, -2]} intensity={0.6} color="#8fb0ff" />
      {/* moneda gigante que gira (sobre su eje vertical) */}
      <group position={[-0.4, 2.2, 1]} rotation={[0.15, 0.65 + (f - 40) * 0.06, 0.12]}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <ConTinta geo={moneda} color="#f2b632" grosor={1.05} />
          <mesh geometry={relieve} material={toon("#c98a12")} position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />
          <mesh geometry={relieve} material={toon("#c98a12")} position={[0, -0.1, 0]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      </group>
      {/* barras de la gráfica que se hunden */}
      <group position={[1.3, -0.45, 0]} rotation={[0.2, -0.3, 0]} scale={0.9}>
        {alturas.map((h, i) => (
          <group key={i} position={[i * 0.95, h / 2, 0]} scale={[1, h, 1]}>
            <mesh geometry={barra} material={toon(i < 2 ? "#4aa86a" : "#e23b3b")} />
            <mesh geometry={barra} material={contorno} scale={[1.08, 1.02, 1.08]} />
          </group>
        ))}
      </group>
    </>
  );
};

export const EstiloMezcla: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <FondoPlano conGrafica={false} />
        <rect x={1020} y={170} width={760} height={470} rx={24} fill="#ffffff" stroke={TINTA} strokeWidth={8} />
        <text x={1060} y={235} style={{ font: "900 40px 'Arial Black', Arial" }} fill={TINTA}>ACCIONES DEL BANCO</text>
      </svg>
      <ThreeCanvas width={W} height={H} dpr={1} style={{ position: "absolute" }} gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }} camera={{ fov: 35, position: [0, 0, 14] }}>
        <Escena3D f={f} />
      </ThreeCanvas>
      <svg width={W} height={H} style={{ position: "absolute" }}>
        <Personaje quien="millonario" anim="asustado" cara="asustado" x={700} y={985} tam={0.5} f={f} />
        <Personaje quien="oficinista" anim="encoge" cara="sorpresa" x={1600} y={985} tam={0.5} f={f} espejo />
      </svg>
      <Subtitulo texto="¡Y AÚN ES PEOR!" />
      <Etiqueta texto="Estilo 3 · Mezcla (fondo 2D + objetos 3D)" />
    </AbsoluteFill>
  );
};
