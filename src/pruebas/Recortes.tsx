// PRUEBA ANIMADA con los dibujos del usuario (recortados en public/protagonista y public/objetos).
// 10 s en tres planos: el protagonista llega al banco → primer plano curioso con el dinero apareciendo →
// sorpresa con lluvia de dinero y gráfica que crece.
// Vídeo:  npx remotion render src/index.ts prueba-recortes salida/prueba-recortes.mp4
import React from "react";
import { AbsoluteFill, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig, continueRender, delayRender } from "remotion";

const MANO = "Mano, 'Patrick Hand', sans-serif";
const LAPIZ = "#2b2925";

let fuente: Promise<void> | null = null;
const useFuente = () => {
  const [h] = React.useState(() => delayRender("letra"));
  React.useEffect(() => {
    if (!fuente) {
      const ff = new FontFace("Mano", `url(${staticFile("fuentes/patrick-hand.woff2")})`);
      fuente = ff.load().then((f) => {
        document.fonts.add(f);
      });
    }
    fuente.then(() => continueRender(h));
  }, [h]);
};

const prota = (n: string) => staticFile(`protagonista/${n}.png`);
const obj = (n: string) => staticFile(`objetos/${n}.png`);

/** Papel crema con viñeta suave. */
const Papel: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, #fbf7ee 0%, #f3ead8 70%, #e6dac2 100%)" }}>
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <filter id="grano">
        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves={3} seed={3} />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncA type="table" tableValues="0 0.12" />
        </feComponentTransfer>
        <feComposite in2="SourceGraphic" operator="in" />
      </filter>
      <rect width={1920} height={1080} fill="#fff" filter="url(#grano)" />
    </svg>
  </AbsoluteFill>
);

const Subtitulo: React.FC<{ texto: string }> = ({ texto }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", opacity: o }}>
      <span style={{ font: `72px ${MANO}`, color: "#fff", WebkitTextStroke: `9px ${LAPIZ}`, paintOrder: "stroke" }}>{texto}</span>
    </div>
  );
};

/** Imagen que «salta» al aparecer (muelle) y luego respira. */
const Aparece: React.FC<{ src: string; x: number; y: number; alto: number; desde: number; giro?: number; flota?: number; ancla?: "abajo" | "centro" }> = ({ src, x, y, alto, desde, giro = 0, flota = 0, ancla = "centro" }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: f - desde, fps, config: { damping: 9, stiffness: 140 } });
  const dy = Math.sin((f + desde * 3) / 12) * flota;
  return (
    <Img
      src={src}
      style={{
        position: "absolute",
        left: x,
        top: y + dy,
        height: alto,
        transform: `translate(-50%, ${ancla === "abajo" ? "-100%" : "-50%"}) scale(${s}) rotate(${giro + Math.sin((f + desde) / 15) * flota * 0.3}deg)`,
        transformOrigin: ancla === "abajo" ? "50% 100%" : "50% 50%",
      }}
    />
  );
};

/** El protagonista: respira (se estira un poco) y se balancea. */
const Prota: React.FC<{ pose: string; x: number; y: number; alto: number; anda?: boolean; entra?: boolean; espejo?: boolean }> = ({ pose, x, y, alto, anda, entra, espejo }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const respira = 1 + Math.sin(f / 9) * 0.012;
  const paso = anda ? Math.abs(Math.sin(f / 4.5)) * -14 : 0;
  const balanceo = anda ? Math.sin(f / 4.5) * 2.5 : Math.sin(f / 20) * 0.8;
  const s = entra ? spring({ frame: f, fps, config: { damping: 10, stiffness: 160 } }) : 1;
  return (
    <>
      <div style={{ position: "absolute", left: x - alto * 0.22, top: y - 18, width: alto * 0.44, height: 30, borderRadius: "50%", background: "rgba(60,50,40,0.18)", filter: "blur(4px)" }} />
      <Img
        src={prota(pose)}
        style={{ position: "absolute", left: x, top: y + paso, height: alto, transform: `translate(-50%, -100%) rotate(${balanceo}deg) scale(${s}) scaleY(${respira}) scaleX(${espejo ? -1 : 1})`, transformOrigin: "50% 100%" }}
      />
    </>
  );
};

/** Cámara: acerca y desliza todo el plano. */
const Camara: React.FC<{ de: [number, number, number]; a: [number, number, number]; dur: number; children: React.ReactNode }> = ({ de, a, dur, children }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [0, dur], [0, 1], { extrapolateRight: "clamp" });
  const e = t * t * (3 - 2 * t);
  const [z, x, y] = de.map((v, i) => v + (a[i] - v) * e);
  return <AbsoluteFill style={{ transform: `scale(${z}) translate(${x}px, ${y}px)`, transformOrigin: "50% 50%" }}>{children}</AbsoluteFill>;
};

const Fundido: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const f = useCurrentFrame();
  const o = interpolate(f, [0, 6, dur - 6, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

const Suelo: React.FC<{ y: number }> = ({ y }) => (
  <svg width={1920} height={1080} style={{ position: "absolute" }}>
    <path d={`M -20 ${y} Q 480 ${y - 8} 960 ${y + 2} T 1940 ${y - 4}`} stroke={LAPIZ} strokeOpacity={0.55} strokeWidth={4} fill="none" />
    {Array.from({ length: 14 }, (_, i) => (
      <path key={i} d={`M ${i * 150 + 20} ${y + 30 + (i % 3) * 18} l 50 -4`} stroke={LAPIZ} strokeOpacity={0.25} strokeWidth={3} />
    ))}
  </svg>
);

/** Lluvia de dinero: billetes y monedas que caen girando. */
const Lluvia: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {Array.from({ length: 16 }, (_, i) => {
        const x = ((i * 397) % 1800) + 60;
        const v = 9 + (i % 4) * 2.5;
        const y = -200 + (f - i * 4) * v;
        if (y < -200) return null;
        const esMoneda = i % 3 === 0;
        return (
          <Img
            key={i}
            src={obj(esMoneda ? "moneda" : i % 3 === 1 ? "billete-volando" : "billetes-sueltos")}
            style={{ position: "absolute", left: x, top: y, height: esMoneda ? 80 : 130, transform: `translate(-50%,-50%) rotate(${(f + i * 30) * (i % 2 ? 4 : -3)}deg)` }}
          />
        );
      })}
    </>
  );
};

export const PruebaRecortes: React.FC = () => {
  useFuente();
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Papel />
      {/* PLANO 1 (0-3,5 s): llega andando al banco */}
      <Sequence from={0} durationInFrames={108}>
        <Fundido dur={108}>
          <Camara de={[1, 0, 0]} a={[1.08, 40, 10]} dur={108}>
            <Suelo y={860} />
            <Aparece src={obj("banco")} x={560} y={870} alto={640} desde={0} ancla="abajo" />
            <Aparece src={obj("cajero")} x={1000} y={870} alto={300} desde={10} ancla="abajo" />
            <Aparece src={obj("dolar")} x={250} y={180} alto={110} desde={20} flota={8} />
            <PlanoAnda />
          </Camara>
          <Subtitulo texto="Cada día pasas por delante de tu banco…" />
        </Fundido>
      </Sequence>
      {/* PLANO 2 (3,5-6,5 s): primer plano, curioso; el dinero aparece a su lado */}
      <Sequence from={102} durationInFrames={96}>
        <Fundido dur={96}>
          <Camara de={[1.04, 0, 0]} a={[1.1, -30, 0]} dur={96}>
            <Prota pose="curioso" x={1300} y={1100} alto={980} entra />
            <Aparece src={obj("saco-verde")} x={360} y={330} alto={250} desde={10} flota={10} giro={-6} />
            <Aparece src={obj("fajo-billetes")} x={700} y={260} alto={190} desde={22} flota={9} giro={5} />
            <Aparece src={obj("pila-monedas")} x={520} y={600} alto={200} desde={34} flota={7} />
            <Aparece src={obj("cofre")} x={830} y={560} alto={210} desde={46} flota={6} giro={-3} />
          </Camara>
          <Subtitulo texto="Pero… ¿sabes qué hace con tu dinero?" />
        </Fundido>
      </Sequence>
      {/* PLANO 3 (6,5-10 s): sorpresa, lluvia de dinero y la gráfica crece */}
      <Sequence from={192} durationInFrames={108}>
        <Fundido dur={108}>
          <Camara de={[1.12, 0, 20]} a={[1, 0, 0]} dur={40}>
            <Suelo y={900} />
            <Prota pose="sorprendido" x={760} y={910} alto={720} entra />
            <Aparece src={obj("grafica-sube")} x={1430} y={880} alto={480} desde={14} ancla="abajo" />
            <Aparece src={obj("saco-dorado")} x={1180} y={830} alto={200} desde={26} ancla="abajo" />
            <Lluvia />
          </Camara>
          <Subtitulo texto="¡La respuesta te va a sorprender!" />
        </Fundido>
      </Sequence>
      <div style={{ position: "absolute", right: 30, top: 24, font: `30px ${MANO}`, color: LAPIZ, opacity: 0.5 }}>prueba · {(f / 30).toFixed(1)} s</div>
    </AbsoluteFill>
  );
};

const PlanoAnda: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 80], [2050, 1330], { extrapolateRight: "clamp" });
  const anda = f < 80;
  return <Prota pose={anda ? "caminando" : "seguro"} x={x} y={872} alto={anda ? 520 : 470} anda={anda} espejo={anda} />;
};
