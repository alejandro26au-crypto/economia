// Chequeo automático de planos (lo lanza «oceano revisar»): para cada plano de cada escena mira, en tres momentos,
// si la cámara está metida dentro de un objeto del decorado o de un modelo 3D, y si el personaje al que apunta queda
// fuera del encuadre. Escribe los avisos en la consola («CHEQUEO: …») y también los pinta en la imagen.
import React, { useMemo } from "react";
import { AbsoluteFill } from "remotion";
import { ajustesPlanos, aPantalla, camaraThree, vistaEn } from "./camara";
import { es2D } from "./actor";
import { DATOS } from "./escenarios-datos";
import { estadoActor, mundo } from "./estado";
import { ALTO_DIBUJO, MODELOS_3D } from "./personajes";
import { buscarIdea, prepararShort } from "./Short";
import { ALTO, ANCHO, FPS, herramientas } from "./tiempo";
import { PropsShort } from "./tipos";

const PERSONAS = new Set(["bent", "marinero", "capitan", "rey", "cientifico", "millonario", "agente", "sovietico", "inventor", "almirante", "churchill"]);

export function chequearPlanos(props: PropsShort): string[] {
  const idea = buscarIdea(props.n);
  const total = Math.ceil((props.duracion + 0.7) * FPS);
  const { escenas } = prepararShort(idea, props.palabras, props.variante, total);
  const avisos: string[] = [];
  for (const { e, k, ini, fin, ctx, planos } of escenas) {
    if (fin <= ini) continue;
    const { F, sonando, variante } = herramientas(ctx);
    const esc = DATOS[e.escenario];
    const actores = e.actores ?? [];
    const estadosEn = (fr: number) => actores.map((a) => estadoActor(a, fr, F, sonando));
    const ajustes = ajustesPlanos(planos, esc, estadosEn, actores, variante);
    planos.forEach((p, j) => {
      const problemas = new Set<string>();
      for (const u of [0.25, 0.5, 0.85]) {
        const f = Math.round(p.ini + u * (p.fin - p.ini));
        const estados = estadosEn(f);
        const cam = camaraThree(vistaEn(f, planos, esc, estados, actores, variante, ajustes), undefined, esc.lejos);
        const c = cam.position;
        // 1) cámara dentro de un obstáculo del escenario
        for (const [x, z, r, h] of esc.obstaculos ?? []) if (Math.hypot(c.x - x, c.z - z) < r * 0.9 && c.y < esc.suelo + h) problemas.add("cámara DENTRO de un objeto del decorado");
        // 2) cámara dentro de un modelo 3D (submarino, barco…)
        actores.forEach((a, i) => {
          const st = estados[i];
          if (!st.visible || es2D(a) || PERSONAS.has(a.tipo) || !MODELOS_3D.includes(a.tipo)) return;
          const w = mundo(esc, st);
          if (Math.hypot(c.x - w[0], c.y - w[1], c.z - w[2]) < st.anchoM * 0.12) problemas.add(`cámara DENTRO de «${a.nombre ?? a.tipo}»`);
        });
        // 3) el personaje del plano no sale en pantalla
        if (p.foco !== null && p.tipo !== "general") {
          const st = estados[p.foco];
          const a = actores[p.foco];
          if (st?.visible) {
            const w = mundo(esc, st);
            const alto = st.anchoM * (ALTO_DIBUJO[a.tipo] / 200);
            const q = aPantalla(cam, [w[0], w[1] + alto * 0.5, w[2]]);
            if (!q.delante || q.x < -40 || q.x > ANCHO + 40 || q.y < 0 || q.y > ALTO) problemas.add(`«${a.nombre ?? a.tipo}» NO sale en el encuadre`);
          }
        }
      }
      if (problemas.size) {
        const seg = ((ini + p.ini) / FPS).toFixed(1);
        const quien = p.foco !== null ? ` a «${actores[p.foco]?.nombre ?? actores[p.foco]?.tipo}»` : "";
        avisos.push(`escena ${k + 1} (${e.escenario}), ${seg} s, plano ${p.tipo}${quien}: ${[...problemas].join("; ")}`);
      }
    });
  }
  return avisos;
}

export const Chequeo: React.FC<PropsShort> = (props) => {
  const avisos = useMemo(() => chequearPlanos(props), [props]);
  useMemo(() => {
    if (!avisos.length) console.log("CHEQUEO: ningún plano con problemas");
    for (const a of avisos) console.log(`CHEQUEO: ${a}`);
  }, [avisos]);
  return (
    <AbsoluteFill style={{ background: "#111", color: "#fff", padding: 40, fontSize: 26, fontFamily: "monospace" }}>
      {avisos.length ? avisos.map((a, i) => <div key={i}>{a}</div>) : <div>Ningún plano con problemas.</div>}
    </AbsoluteFill>
  );
};
