// EL VÍDEO: reparte las escenas según la voz, mueve la cámara por la Ciudad Inercia (capas con paralaje), pone a
// los personajes, la nube de pensamiento, los golpes de pantalla, el contador del bolsillo, los subtítulos y los
// efectos de sonido. Todo se calcula desde las palabras (sin estado): cualquier fotograma se dibuja solo, así el
// montaje por tramos encaja exacto.
import React, { useEffect, useMemo, useState } from "react";
import { AbsoluteFill, Audio, Sequence, cancelRender, continueRender, delayRender, staticFile, useCurrentFrame } from "remotion";
import { Cielo, Ciudad, Delante, Lejos, SUELO } from "../mundo/ciudad";
import { NubeMundo } from "../mundo/nube";
import { PatronesLapiz } from "../mundo/trazo";
import { Figura } from "../personaje/figura";
import { REPARTO } from "../personaje/reparto";
import { SignoDibujo } from "../personaje/signos";
import { CtxEscena, estadoActor } from "./actores";
import { Cam, EscenaCalc, camaraEn, planificar, posNube } from "./camara";
import { BilleteVolador, ContadorBolsillo, Flash, Lineas, Lluvia, Rotulo, Sello, Subtitulos } from "./pantalla";
import { ALTO, ANCHO, FPS, azar, indicePalabra, normal } from "./tiempo";
import { Idea, PropsVideo } from "./tipos";
import { IDEAS } from "../ideas/lista";

const FUENTES: [string, string][] = [
  ["Marca", "fuentes/RubikDirt.woff2"],
  ["MarcaLimpia", "fuentes/Rubik-Black.woff2"],
  ["Mano", "fuentes/PermanentMarker.woff2"],
];
export function useFuentes() {
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

type Sonido = { f: number; s: string; vol: number };

/** Escenas con sus fotogramas, tomas de cámara y sonidos (sin hooks: también lo usa la hoja de revisión). */
export function preparar(idea: Idea, palabras: PropsVideo["palabras"], variante: number, total: number) {
  const bases: number[] = [];
  let desde = 0;
  idea.escenas.forEach((e, k) => {
    const i = k === 0 ? 0 : e.desde === undefined ? desde : indicePalabra(palabras, e.desde, desde);
    bases.push(i);
    desde = i;
  });
  const inicios = bases.map((i, k) => (k === 0 ? 0 : Math.max(1, Math.round(palabras[i].ini * FPS) - 4)));
  const escenas: EscenaCalc[] = idea.escenas.map((e, k) => ({ e, k, c: { palabras, base: bases[k], ini: inicios[k], fin: k + 1 < inicios.length ? inicios[k + 1] : total } as CtxEscena }));
  const tomas = planificar(escenas, variante);
  const F = (c: CtxEscena, en: number | string) => Math.round(palabras[indicePalabra(palabras, en, c.base)].ini * FPS);
  const sonidos: Sonido[] = [];
  tomas.forEach((t, i) => {
    if (i === 0) return;
    sonidos.push({ f: t.ini - 3, s: t.vuelo ? "vuelo" : ["whoosh1", "whoosh2", "whoosh3"][Math.floor(azar(variante, i) * 3)], vol: t.vuelo ? 0.55 : 0.32 });
    if (t.tipo === "nube") sonidos.push({ f: t.ini, s: "lapiz", vol: 0.5 });
  });
  for (const { e, c } of escenas) {
    for (const g of e.golpes ?? []) {
      const f = F(c, g.en);
      if (g.tipo === "sello") sonidos.push({ f, s: "sello", vol: 0.8 });
      if (g.tipo === "temblor") sonidos.push({ f, s: "golpe", vol: 0.7 });
      if (g.tipo === "zoom") sonidos.push({ f: f - 2, s: "whoosh3", vol: 0.45 });
      if (g.tipo === "lineas") sonidos.push({ f: f - 2, s: "whoosh2", vol: 0.45 });
      if (g.tipo === "lluvia") sonidos.push({ f, s: "caja", vol: 0.6 });
      if (g.tipo === "flash") sonidos.push({ f, s: "ding", vol: 0.4 });
    }
    for (const a of e.actores ?? []) for (const ac of a.acciones ?? []) if (ac.hace === "signo") sonidos.push({ f: F(c, ac.en), s: "pop", vol: 0.45 });
    for (const r of e.rotulos ?? []) sonidos.push({ f: F(c, r.en), s: "pop", vol: 0.35 });
  }
  for (const v of idea.contador?.valores ?? []) sonidos.push({ f: Math.round(palabras[indicePalabra(palabras, v.en)].ini * FPS), s: "caja", vol: 0.5 });
  return { escenas, tomas, sonidos: sonidos.filter((x) => x.f >= 0 && x.f < total).sort((a, b) => a.f - b.f), F };
}

/** Transformación de una capa con paralaje p (1 = la ciudad; <1 lejos; >1 delante). */
function capa(cam: Cam, p: number, ancla: [number, number]) {
  const z = 1 + (cam.z - 1) * p;
  const cx = cam.x * p + (1 - p) * ancla[0];
  const cy = cam.y * p + (1 - p) * ancla[1];
  return `translate(${ANCHO / 2} ${ALTO / 2}) rotate(${cam.r}) scale(${z}) translate(${-cx} ${-cy})`;
}

export const Video: React.FC<PropsVideo> = (props) => {
  useFuentes();
  const f = useCurrentFrame();
  const { palabras, variante } = props;
  const idea = buscarIdea(props.n);
  const total = Math.ceil((props.duracion + 0.7) * FPS);
  const { escenas, tomas, sonidos, F } = useMemo(() => preparar(idea, palabras, variante, total), [idea, palabras, variante, total]);
  const ec = escenas.find((x) => f >= x.c.ini && f < x.c.fin) ?? escenas[escenas.length - 1];
  const { e, c } = ec;
  const cam0 = camaraEn(f, tomas, escenas, variante);
  // golpes de esta escena
  const golpes = (e.golpes ?? []).map((g) => ({ g, t: f - F(c, g.en), fin: "hasta" in g && g.hasta !== undefined ? F(c, g.hasta) - F(c, g.en) : 60 }));
  const temblor = golpes.filter((x) => (x.g.tipo === "temblor" || x.g.tipo === "sello") && x.t >= 0 && x.t < 16).reduce((m, x) => Math.max(m, (1 - x.t / 16) * ("fuerza" in x.g && x.g.fuerza ? x.g.fuerza : 1)), 0);
  const zoomGolpe = golpes.filter((x) => x.g.tipo === "zoom" && x.t >= 0).reduce((m, x) => Math.max(m, ((("a" in x.g && x.g.a) || 1.15) - 1) * Math.min(1, x.t / 5) * (x.t < 60 ? 1 : Math.max(0, 1 - (x.t - 60) / 10))), 0);
  const cam: Cam = { x: cam0.x + (azar(f, "tx") - 0.5) * 40 * temblor / cam0.z, y: cam0.y + (azar(f, "ty") - 0.5) * 40 * temblor / cam0.z, z: cam0.z * (1 + zoomGolpe), r: cam0.r + (azar(f, "tr") - 0.5) * 2 * temblor };
  const estados = (e.actores ?? []).map((a, i) => ({ a, i, s: estadoActor(a, i, e, c, f, variante) })).sort((p, q) => p.s.y - q.s.y);
  const nube = e.nube ? posNube(ec, f, variante) : null;
  const tNube = f - (c.ini + 30);
  // contador del bolsillo
  const vals = (idea.contador?.valores ?? []).map((v) => ({ f: Math.round(palabras[indicePalabra(palabras, v.en)].ini * FPS), valor: v.valor }));
  const kc = vals.filter((v) => v.f <= f).length - 1;
  // los rótulos visibles quitan esas palabras del subtítulo (no se repite lo mismo dos veces)
  const rotulos = (e.rotulos ?? []).map((r, i) => ({ r, i, a: F(c, r.en), b: r.hasta !== undefined ? F(c, r.hasta) : Math.min(c.fin, F(c, r.en) + 75) }));
  const ocultas = new Set(rotulos.filter((x) => f >= x.a && f <= x.b).flatMap((x) => x.r.texto.split(/\s+/).map(normal)));
  const desenfoque = cam0.velocidad * (cam0.volando ? 5 : 2);
  return (
    <AbsoluteFill style={{ background: "#f4efe2", overflow: "hidden" }}>
      <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0, filter: desenfoque > 0.3 ? `blur(${desenfoque.toFixed(1)}px)` : undefined }}>
        <defs>
          <PatronesLapiz />
          {/* trazo a mano: las líneas tiemblan un poco, como dibujadas con rotulador */}
          <filter id="lapiz" filterUnits="userSpaceOnUse" x={0} y={0} width={ANCHO} height={ALTO}>
            <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves={2} seed={Math.floor(f / 4) % 3} />
            <feDisplacementMap in="SourceGraphic" scale={4} />
          </filter>
        </defs>
        <g filter="url(#lapiz)">
          <g transform={capa(cam, 0.15, [3000, 900])}>
            <Cielo f={f} noche={e.noche} />
          </g>
          <g transform={capa(cam, 0.5, [0, SUELO * 0.95])}>
            <Lejos f={f} />
          </g>
          <g transform={capa(cam, 1, [0, 0])}>
            <Ciudad f={f} bolsa={e.bolsa} noche={e.noche} />
            {estados.map(({ a, i, s }) =>
              s.visible && REPARTO[a.quien] ? (
                <g key={i} transform={`translate(${s.x} ${s.y}) scale(${s.esc * s.mira} ${s.esc})`}>
                  <Figura p={s.pose} d={REPARTO[a.quien]} f={f + i * 17} id={`a${i}`} simple />
                  {s.signo && (
                    <g transform={`translate(${s.pose.x} ${s.pose.y}) scale(${s.mira} 1)`}>
                      <SignoDibujo s={s.signo.s} t={s.signo.t} />
                    </g>
                  )}
                </g>
              ) : null,
            )}
            {nube && e.nube && tNube >= 0 && <NubeMundo x={nube.x} y={nube.y} cabeza={nube.cabeza} t={tNube} nube={e.nube} />}
          </g>
          <g transform={capa(cam, 1.3, [4800, SUELO])}>
            <Delante f={f} />
          </g>
        </g>
      </svg>
      {/* grano de papel por encima de todo */}
      <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.28, pointerEvents: "none" }}>
        <filter id="grano">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={4} />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.4  0 0 0 0 0.32  0 0 0 0.6 0" />
        </filter>
        <rect width={ANCHO} height={ALTO} filter="url(#grano)" />
      </svg>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 70% at 50% 48%, rgba(0,0,0,0) 60%, rgba(60,45,30,0.25) 100%)" }} />
      {golpes.map(({ g, t, fin }, i) => (g.tipo === "lineas" && t >= 0 && t <= fin ? <Lineas key={i} f={f} /> : null))}
      {golpes.map(({ g, t, fin }, i) => (g.tipo === "lluvia" && t >= 0 && t <= Math.max(fin, 75) ? <Lluvia key={`l${i}`} t={t} /> : null))}
      <BilleteVolador u={cam0.volando} />
      {rotulos.map(({ r, i, a, b }) => (
        <Rotulo key={i} i={i} texto={r.texto} a={a} b={b} f={f} x={r.x} y={r.y} tam={r.tam} color={r.color} giro={r.giro} />
      ))}
      {idea.contador && kc >= 0 && (
        <ContadorBolsillo titulo={idea.contador.titulo ?? "TU DINERO"} valor={vals[kc].valor} anterior={kc > 0 ? vals[kc - 1].valor : vals[kc].valor} t={f - vals[kc].f} unidad={idea.contador.unidad ?? "€"} />
      )}
      {golpes.map(({ g, t }, i) => (g.tipo === "sello" ? <Sello key={`s${i}`} texto={g.texto ?? "¡PERO!"} t={t} /> : null))}
      {golpes.map(({ g, t }, i) => (g.tipo === "flash" ? <Flash key={`f${i}`} t={t} /> : null))}
      {f < c.ini + 6 && ec.k > 0 && escenas[ec.k - 1].e.lugar === e.lugar && <Flash t={f - c.ini} />}
      <Subtitulos palabras={palabras} f={f} ocultas={ocultas} />
      {sonidos.map((x, i) => (
        <Sequence key={`s${i}`} from={x.f} durationInFrames={Math.round(FPS * 1.6)}>
          <Audio src={staticFile(`sfx/${x.s}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
      {props.voz && <Audio src={staticFile(props.voz)} />}
      {props.musica && <Audio src={staticFile(props.musica)} volume={0.08} loop />}
    </AbsoluteFill>
  );
};
