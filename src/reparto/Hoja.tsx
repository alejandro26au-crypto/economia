// Hojas del reparto de «Inercia del consumo»:
// - "especie": tu referencia al lado de nuestro personaje en la misma pose y las 6 caras de referencias/expresiones.png
// - "reparto": el protagonista y el reparto de ejemplo (banquero, inversor, político, trabajador, rey, estafador)
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { Brazo, POSE_BASE, Pose } from "../bent/rig";
import { cara, cuerpo } from "../bent/animaciones";
import { Figura, PUNTOS, alcanza, caraReparto } from "./figura";
import { REPARTO } from "./reparto";
import { Signo, SignoDibujo } from "./signos";

export const PAPEL = "#f4efe2";

/** Fondo de papel con grano y viñeta suave (el de la portada). */
export const Papel: React.FC<{ semilla?: number }> = ({ semilla = 4 }) => (
  <AbsoluteFill>
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 45%, #faf6ec 0%, ${PAPEL} 60%, #e6dcc6 100%)` }} />
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.35 }}>
      <filter id={`grano${semilla}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={semilla} />
        <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.32  0 0 0 0.55 0" />
      </filter>
      <rect width="100%" height="100%" filter={`url(#grano${semilla})`} />
    </svg>
  </AbsoluteFill>
);

const pose = (o: Partial<Pose>): Pose => ({ ...POSE_BASE, ...o }) as Pose;
const B = (h: number, c: number, mano: Brazo["mano"], giroMano = 0): Brazo => ({ h, c, mano, giroMano });

const A = (punto: [number, number], mano: Brazo["mano"], fuera: 1 | -1 = 1, giroMano = 0): Brazo => ({ ...alcanza(PUNTOS.hombroA, punto, fuera), mano, giroMano });
const Bd = (punto: [number, number], mano: Brazo["mano"], fuera: 1 | -1 = -1, giroMano = 0): Brazo => ({ ...alcanza(PUNTOS.hombroB, punto, fuera), mano, giroMano });

// las poses de referencias/personaje.png y referencias/expresiones.png
export const POSES_ESPECIE: Record<string, Partial<Pose>> = {
  // mano en la mejilla, la otra en la cadera, mira arriba (personaje.png y la viñeta 6)
  piensa: { ...caraReparto("piensa", 0, 0), bA: A(PUNTOS.mejillaA, "abierta", 1, 170), bB: Bd(PUNTOS.barriga, "abierta", -1, 90), cabeza: -5, cejas: -0.45, alzaCejas: 0.45, boca: "triste", mira: 0.9 },
  corre: { ...caraReparto("risa", 0.6, 0), inclina: 8, y: -24, pA: { h: -40, r: -70 }, pB: { h: 55, r: -50 }, bA: B(-55, 40, "puno"), bB: B(40, 90, "puno") },
  lee: { ...caraReparto("seria", 0, 0), cejas: 0.35, mira: 0, cabeza: 12, pA: { h: -88, r: 128 }, pB: { h: 88, r: -128 }, bA: A([-100, -150], "abierta", 1, 90), bB: Bd([120, -150], "abierta", -1, -90), boca: "seria" },
  cabeza: { ...caraReparto("asustado", 0, 0), bA: A(PUNTOS.orejaA, "abierta", 1, 180), bB: Bd(PUNTOS.orejaB, "abierta", -1, 180) },
  enfadado: { ...caraReparto("enfadado", 0, 0), bA: A([70, -120], "puno", 1), bB: Bd([-70, -134], "puno", -1), cabeza: 2, mira: -0.7 },
  agotado: { ...caraReparto("triste", 0.3, 0), inclina: 20, cabeza: 18, hombros: 0.7, bA: B(4, 6, "abierta"), bB: B(14, 4, "abierta"), pA: { h: -16, r: 14 }, pB: { h: 20, r: -2 }, ojos: "entornados" },
};

const Personaje: React.FC<{ x: number; y: number; k: number; p: Pose; d: string; id: string; f: number; nombre?: string; libro?: boolean; signo?: Signo }> = ({ x, y, k, p, d, id, f, nombre, libro, signo }) => (
  <>
    <svg width={1} height={1} style={{ position: "absolute", left: x, top: y, overflow: "visible" }}>
      <g transform={`scale(${k})`}>
        <Figura p={p} d={REPARTO[d]} f={f} id={id} />
        {signo && <g transform={`translate(${p.x} ${-(p.y < 0 ? -p.y : 0)})`}><SignoDibujo s={signo} t={30} /></g>}
        {libro && (
          <g transform="translate(10 -330) scale(1.35)" stroke="#09080d" strokeWidth={6} strokeLinejoin="round">
            <path d="M -120 -20 L 0 0 L 120 -20 L 120 120 L 0 140 L -120 120 Z" fill="#f7f4ea" />
            <path d="M 0 0 L 0 140" />
            {[20, 44, 68, 92].map((yy) => <path key={yy} d={`M -100 ${yy - 6} L -20 ${yy + 6} M 20 ${yy + 6} L 100 ${yy - 6}`} strokeWidth={3} stroke="#9a968a" />)}
          </g>
        )}
      </g>
    </svg>
    {nombre && <div style={{ position: "absolute", left: x - 160, top: y + 30, width: 320, textAlign: "center", color: "#2a2622", font: "400 44px 'Rubik Dirt', 'Permanent Marker', sans-serif" }}>{nombre}</div>}
  </>
);

const SIGNOS: Record<string, Signo> = { corre: "velocidad", lee: "exclama", cabeza: "susto", enfadado: "enfado", agotado: "sudor", piensa: "pregunta" };

export const HojaEspecie: React.FC = () => {
  const f = useCurrentFrame();
  const nombres = ["corre", "lee", "cabeza", "enfadado", "agotado", "piensa"];
  const titulo = { position: "absolute" as const, font: "700 40px sans-serif", color: "#2a2622" };
  return (
    <AbsoluteFill>
      <Papel />
      <div style={{ ...titulo, left: 40, top: 20 }}>Tu referencia</div>
      <div style={{ ...titulo, left: 1000, top: 20 }}>Nuestro personaje</div>
      <Img src={staticFile("marca/referencia-personaje.png")} style={{ position: "absolute", left: 150, top: 70, width: 700, mixBlendMode: "multiply" }} />
      <Personaje x={1440} y={590} k={0.47} p={pose(POSES_ESPECIE.piensa)} d="protagonista" id="esp" f={f} />
      <Img src={staticFile("marca/referencia-expresiones.png")} style={{ position: "absolute", left: 20, top: 640, width: 920, mixBlendMode: "multiply" }} />
      {nombres.map((n, i) => {
        const x0 = 980 + (i % 3) * 307;
        const y0 = 652 + Math.floor(i / 3) * 336;
        return (
          <div key={n} style={{ position: "absolute", left: x0, top: y0, width: 290, height: 318, border: "5px solid #1a181c", overflow: "hidden" }}>
            <Personaje x={135} y={306} k={0.27} p={pose(POSES_ESPECIE[n])} d="protagonista" id={`e${i}`} f={f + i * 13} libro={n === "lee"} signo={SIGNOS[n]} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

const POSES = ["piensa", "habla", "senala", "cruza", "victoria", "encoge", "saluda"] as const;
const CARAS = ["piensa", "risa", "chulo", "enfadado", "feliz", "triste", "sorpresa"] as const;

export const HojaReparto: React.FC = () => {
  const f = useCurrentFrame();
  const lista = ["protagonista", "banquero", "inversor", "politico", "trabajador", "monarca", "estafador"];
  return (
    <AbsoluteFill>
      <Papel />
      {lista.map((k, i) => {
        const p = i === 0 ? pose(POSES_ESPECIE.piensa) : pose({ ...cuerpo(POSES[i], 20, i), ...cara(CARAS[i], 0), ...caraReparto(CARAS[i], i === 1 ? 0.5 : 0, 0) });
        return <Personaje key={k} x={150 + i * 270} y={820} k={0.62} p={p} d={k} id={k} f={f + i * 20} nombre={REPARTO[k].nombre} />;
      })}
    </AbsoluteFill>
  );
};
