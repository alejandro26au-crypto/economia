import React from "react";
import { AbsoluteFill, Composition, useCurrentFrame } from "remotion";
import { PersonajeDibujado } from "./personaje/Dibujo";
import { DIBUJOS } from "./personaje/poses";
import { Video, useFuentes } from "./motor/Video";
import { FPS, ALTO, ANCHO } from "./motor/tiempo";
import { PropsVideo } from "./motor/tipos";
import { Cielo, Ciudad, Delante, Lejos, ANCHO_MUNDO } from "./mundo/ciudad";
import { PatronesLapiz } from "./mundo/trazo";

const EJEMPLO: PropsVideo = { n: 90, variante: 1, duracion: 15, palabras: [{ p: "…", ini: 0, fin: 1 }], voz: null, musica: null };

/** El mundo entero de un vistazo (para revisar la ciudad): npx remotion still src/index.ts mundo salida/mundo.png */
const VistaMundo: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const z = ANCHO / (ANCHO_MUNDO + 400);
  return (
    <AbsoluteFill style={{ background: "#f4efe2" }}>
      <svg width={ANCHO} height={ALTO}>
        <defs>
          <PatronesLapiz />
        </defs>
        <g transform={`scale(${z}) translate(200 ${-1000 + ALTO / z / 2 - 900})`}>
          <g transform="scale(2)">
            <Cielo f={f} />
          </g>
          <Lejos f={f} />
          <Ciudad f={f} />
          <Delante f={f} />
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** Todos los dibujos del personaje tal como salen en el vídeo: npx remotion still src/index.ts personaje salida/p.png */
const HojaPersonaje: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const nombres = Object.keys(DIBUJOS);
  return (
    <AbsoluteFill style={{ background: "#f4efe2" }}>
      <svg width={ANCHO} height={ALTO}>
        {nombres.map((n, i) => (
          <g key={n} transform={`translate(${150 + i * 270} 820) scale(1.45)`}>
            <PersonajeDibujado dibujo={n} f={f} t={30} habla={false} mira={1} id={n} />
            <text x={0} y={60} textAnchor="middle" fontSize={34} fontFamily="Marca, sans-serif" fill="#2b2e3d">
              {n}
            </text>
          </g>
        ))}
      </svg>
    </AbsoluteFill>
  );
};

export const Root: React.FC = () => (
  <>
    <Composition id="video" component={Video} width={ANCHO} height={ALTO} fps={FPS} durationInFrames={FPS * 10} defaultProps={EJEMPLO} calculateMetadata={({ props }) => ({ durationInFrames: Math.ceil((props.duracion + 0.7) * FPS) })} />
    <Composition id="mundo" component={VistaMundo} width={ANCHO} height={ALTO} fps={FPS} durationInFrames={30} />
    <Composition id="personaje" component={HojaPersonaje} width={ANCHO} height={ALTO} fps={FPS} durationInFrames={30} />
  </>
);
