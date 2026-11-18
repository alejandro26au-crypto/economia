// El short: reparte las escenas según la voz; en cada una pinta el escenario 3D, coloca dentro a los personajes 2D,
// mueve la cámara (un ángulo nuevo cada ~2,5 s) y pone un efecto de sonido en cada cambio de cámara.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Ilustrado } from "./ilustrado";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { ActorEscena, es2D } from "./actor";
import { elige } from "./azar";
import { PlanoCalc, Vista, ajustesPlanos, camaraThree, planificar, vistaEn } from "./camara";
import { Efectos3D, EfectosPantalla, impacto } from "./efectos";
import { puestaEnEscena } from "./puesta";
import { ESCENARIOS3D } from "./escenarios";
import { DATOS } from "./escenarios-datos";
import { estadoActor, momentosActores, mundo } from "./estado";
import { Modelo3D } from "./modelos3d";
import { COLOR_BASE, MODELOS_3D } from "./personajes";
import { Profundidad, RotuloEscena, RotuloVisible, Subtitulos, palabrasRotulo } from "./textos";
import { ALTO, ANCHO, Ctx, FPS, ProveedorVoz, herramientas, indicePalabra, tramo, useCtxVoz } from "./tiempo";
import { Escena, Idea, PropsShort, Sonido } from "./tipos";
import { IDEAS } from "../ideas/lista";

/** Letras del canal: «Marca» = Rubik Dirt (la de la portada), «Mano» = Permanent Marker (notas a mano). */
const FUENTES: [string, string][] = [
  ["Marca", "fuentes/RubikDirt.woff2"],
  ["MarcaLimpia", "fuentes/Rubik-Black.woff2"],
  ["Mano", "fuentes/PermanentMarker.woff2"],
];
export function useFuente() {
  const [h] = useState(() => delayRender("Cargando las letras"));
  useEffect(() => {
    Promise.all(FUENTES.map(([n, f]) => new FontFace(n, `url(${staticFile(f)})`).load().then((ff) => document.fonts.add(ff))))
      .then(() => continueRender(h))
      .catch((e) => cancelRender(e));
  }, [h]);
}

export const buscarIdea = (n: number): Idea => {
  const idea = IDEAS.find((i) => i.n === n);
  if (!idea) throw new Error(`No existe la idea ${n} en src/ideas/lista.ts`);
  return idea;
};

/** Planos de cámara de una escena (sin hooks: también se usan para colocar los sonidos). */
export function planosEscena(e: Escena, c: Ctx): PlanoCalc[] {
  const { F, dur } = herramientas(c);
  const inicios: { f: number; pausa: boolean }[] = [];
  for (let i = c.base; i < c.palabras.length; i++) {
    const f = Math.round(c.palabras[i].ini * FPS) - c.inicioEscena;
    if (f >= dur) break;
    if (f > 0) inicios.push({ f, pausa: i > 0 && /[.,;:!?…]$/.test(c.palabras[i - 1].p) });
  }
  const actores = e.actores ?? [];
  return planificar({
    dur,
    inicios,
    actores,
    forzados: (e.planos ?? []).map((p) => ({ ...p, f: F(p.en) })),
    momentos: momentosActores(actores, F),
    entradas: actores.map((a) => (a.entra ? F(a.entra.en, 0) + (a.entra.desde === "pop" ? 0 : 8) : 0)),
    variante: c.variante,
  });
}

/** Mueve la cámara de Three a la vista calculada. */
const CamaraSync: React.FC<{ v: Vista; lejos?: number }> = ({ v, lejos }) => {
  const cam = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  camaraThree(v, cam, lejos);
  return null;
};

/** Etalonaje: viñeta suave y un velo de color muy ligero (luminoso, nada de oscurecer el entorno). */
const Etalonaje: React.FC<{ agua: boolean }> = ({ agua }) => (
  <>
    <AbsoluteFill style={{ background: agua ? "linear-gradient(180deg, rgba(180,240,255,0.10), rgba(0,40,80,0.10))" : "linear-gradient(180deg, rgba(255,220,170,0.08), rgba(40,20,0,0.06))", pointerEvents: "none" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 65% at 50% 46%, rgba(0,0,0,0) 62%, rgba(0,0,0,0.22) 100%)", pointerEvents: "none" }} />
  </>
);

/** Destello corto al entrar en una escena nueva (el único corte de verdad). */
const Corte: React.FC = () => {
  const f = useCurrentFrame();
  const o = 0.45 * (1 - tramo(f, 0, 7));
  return <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 40%, #ffffff, #bff3ff 60%)", opacity: o, pointerEvents: "none" }} />;
};

const EscenaVista: React.FC<{ e: Escena; k: number; planos: PlanoCalc[] }> = ({ e, k, planos }) => {
  const f = useCurrentFrame();
  const ctx = useCtxVoz();
  const { F, sonando, variante } = herramientas(ctx);
  const esc = DATOS[e.escenario];
  const Escenario3D = ESCENARIOS3D[e.escenario];
  const actores = e.actores ?? [];
  const estados = actores.map((a) => estadoActor(a, f, F, sonando));
  // ángulo despejado para cada plano (se calcula una vez por escena)
  const ajustes = useMemo(() => ajustesPlanos(planos, esc, (fr) => actores.map((a) => estadoActor(a, fr, F, sonando)), actores, variante), [planos, esc, actores, variante]); // eslint-disable-line react-hooks/exhaustive-deps
  const vista = vistaEn(f, planos, esc, estados, actores, variante, ajustes);
  const cam = camaraThree(vista, undefined, esc.lejos);
  const orden = actores
    .map((a, i) => ({ a, i, d: cam.position.distanceTo(new THREE.Vector3(...mundo(esc, estados[i]))) }))
    .sort((p, q) => q.d - p.d);
  const s = variante % 997;
  const transf = impacto(e.efectos ?? [], f, F);
  return (
    <AbsoluteFill style={{ transform: transf, transformOrigin: "50% 45%" }}>
      <ThreeCanvas width={ANCHO} height={ALTO} dpr={1} gl={{ antialias: true, preserveDrawingBuffer: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.0 }} camera={{ fov: vista.fov, near: (esc.lejos ?? 400) > 1000 ? 0.3 : 0.05, far: esc.lejos ?? 400 }}>
        <ProveedorVoz valor={ctx}>
          <CamaraSync v={vista} lejos={esc.lejos} />
          <Escenario3D s={s} />
          {/* sombra redonda bajo cada personaje: los "pega" al suelo */}
          {actores.map((a, i) =>
            MODELOS_3D.includes(a.tipo) && !es2D(a) ? <Modelo3D key={`m${i}`} actor={a} e={estados[i]} esc={esc} color={a.color ?? COLOR_BASE[a.tipo]} f={f} /> : null,
          )}
          {actores.map((a, i) => {
            const st = estados[i];
            if (!st.visible || (MODELOS_3D.includes(a.tipo) && !es2D(a))) return null;
            const p = mundo(esc, { ...st, alto: 0 });
            const o = 0.45 * st.opacidad * Math.max(0, 1 - st.alto / 3);
            return (
              <mesh key={i} position={[p[0], esc.suelo + 0.015, p[2]]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[st.anchoM * 0.55 * st.pop, 24]} />
                <meshBasicMaterial color="#000000" transparent opacity={o} depthWrite={false} />
              </mesh>
            );
          })}
          <Efectos3D efectos={e.efectos ?? []} s={s} />
          <Ilustrado />
        </ProveedorVoz>
      </ThreeCanvas>
      {orden.map(({ a, i }) => (
        <ActorEscena key={i} actor={a} e={estados[i]} i={i} f={f} cam={cam} esc={esc} variante={variante} />
      ))}
      <EfectosPantalla efectos={e.efectos ?? []} />
      <Etalonaje agua={esc.agua} />
      {(e.rotulos ?? []).map((r, i) => (
        <RotuloEscena key={i} r={r} i={i} />
      ))}
      {e.profundidad && <Profundidad texto={e.profundidad} />}
      {k > 0 && <Corte />}
    </AbsoluteFill>
  );
};

type Golpe = { f: number; s: Sonido; vol: number };

/** Reparte las escenas según la voz y calcula planos, sonidos y rótulos (sin hooks: lo usan el short y el chequeo). */
export function prepararShort(idea: Idea, palabras: PropsShort["palabras"], variante: number, total: number) {
  // cuándo empieza cada escena (y desde qué palabra se buscan sus referencias)
  const bases: number[] = [];
  let desde = 0;
  idea.escenas.forEach((e, k) => {
    const i = k === 0 ? 0 : e.desde === undefined ? desde : indicePalabra(palabras, e.desde, desde);
    bases.push(i);
    desde = i;
  });
  const inicios = bases.map((i, k) => (k === 0 ? 0 : Math.max(1, Math.round(palabras[i].ini * FPS) - 2)));
  const escenas = idea.escenas.map((e0, k) => {
    const e = puestaEnEscena(e0, palabras, bases[k], k + 1 < bases.length ? bases[k + 1] : palabras.length, variante + k * 31);
    const ini = inicios[k];
    const fin = k + 1 < inicios.length ? inicios[k + 1] : total;
    const ctx: Ctx = { palabras, base: bases[k], inicioEscena: ini, finEscena: fin, variante: variante + k * 101 };
    return { e, k, ini, fin, ctx, planos: fin > ini ? planosEscena(e, ctx) : [] };
  });
  // efectos de sonido: corte de escena, cada cambio de cámara, acciones y "weird"
  const sonidos: Golpe[] = [];
  for (const { e, k, ini, fin, ctx, planos } of escenas) {
    if (fin <= ini) continue;
    const { F } = herramientas(ctx);
    if (k > 0) sonidos.push({ f: ini, s: "golpe", vol: 0.5 });
    planos.slice(1).forEach((p, j) => sonidos.push({ f: ini + p.ini - 3, s: elige(variante, WHOOSH, k, j), vol: 0.42 }));
    for (const a of e.actores ?? []) {
      if (a.entra?.desde === "pop") sonidos.push({ f: ini + F(a.entra.en, 0), s: "pop", vol: 0.5 });
      for (const ac of a.acciones ?? []) {
        if (ac.hace === "chasca") sonidos.push({ f: ini + F(ac.en), s: "chasquido", vol: 0.7 });
        if (ac.hace === "salta") sonidos.push({ f: ini + F(ac.en), s: "boing", vol: 0.4 });
      }
    }
    for (const ef of e.efectos ?? []) {
      if (ef.tipo === "golpe") sonidos.push({ f: ini + F(ef.en), s: "golpe", vol: 0.75 });
      if (ef.tipo === "lineas") sonidos.push({ f: ini + F(ef.en) - 2, s: "whoosh2", vol: 0.5 });
      if (ef.tipo === "zoom") sonidos.push({ f: ini + F(ef.en) - 2, s: "whoosh3", vol: 0.45 });
      if (ef.tipo === "chispas") sonidos.push({ f: ini + F(ef.en), s: "ding", vol: 0.35 });
    }
    for (const x of e.sonidos ?? []) sonidos.push({ f: ini + F(x.en), s: x.s, vol: x.vol ?? 0.5 });
  }
  palabras.forEach((p) => {
    if (/^weird/i.test(p.p)) sonidos.push({ f: Math.max(0, Math.round(p.ini * FPS) - 2), s: "raro", vol: 0.45 });
  });
  // rótulos con sus fotogramas absolutos: el subtítulo no repite lo que ya dice el rótulo grande
  const rotulos: RotuloVisible[] = [];
  for (const { e, ini, fin, ctx } of escenas) {
    if (fin <= ini) continue;
    const { F } = herramientas(ctx);
    for (const r of e.rotulos ?? []) {
      const a = ini + F(r.en);
      const b = Math.min(fin, r.hasta !== undefined ? ini + F(r.hasta) : fin);
      rotulos.push({ a, b, palabras: palabrasRotulo(r.texto) });
    }
  }
  return { escenas, rotulos, sonidos: sonidos.filter((x) => x.f >= 0 && x.f < total).sort((a, b) => a.f - b.f) };
}


const WHOOSH: Sonido[] = ["whoosh1", "whoosh2", "whoosh3"];

export const Short: React.FC<PropsShort> = (props) => {
  useFuente();
  const { palabras, variante } = props;
  const idea = buscarIdea(props.n);
  const total = Math.ceil((props.duracion + 0.7) * FPS);

  const { escenas, rotulos, sonidos } = useMemo(() => prepararShort(idea, palabras, variante, total), [idea, palabras, variante, total]);

  return (
    <AbsoluteFill style={{ background: "#000", overflow: "hidden" }}>
      {escenas.map(({ e, k, ini, fin, ctx, planos }) =>
        fin <= ini ? null : (
          <Sequence key={k} from={ini} durationInFrames={fin - ini} name={`Escena ${k + 1} (${e.escenario})`}>
            <ProveedorVoz valor={ctx}>
              <EscenaVista e={e} k={k} planos={planos} />
            </ProveedorVoz>
          </Sequence>
        ),
      )}
      {sonidos.map((x, i) => (
        <Sequence key={`s${i}`} from={x.f} durationInFrames={Math.round(FPS * 1.6)} name={`sfx ${x.s}`}>
          <Audio src={staticFile(`sfx/${x.s}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
      <Subtitulos palabras={palabras} rotulos={rotulos} />
      {props.voz && <Audio src={staticFile(props.voz)} />}
      {props.musica && <Audio src={staticFile(props.musica)} volume={0.1} loop />}
    </AbsoluteFill>
  );
};
