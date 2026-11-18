// LA CÁMARA (nunca para): en cada escena elige planos que cambian con la voz (cada ~3 s, siempre al empezar una
// palabra tras una pausa) y llega a cada uno con un movimiento rápido y llamativo («zoom golpe» con rebote);
// mientras tanto deriva despacio (se acerca, se desliza y se ladea un poco). Entre LUGARES vuela siguiendo a un
// billete: se aleja, cruza la ciudad y vuelve a entrar («sigue el dinero»). En las escenas con NUBE sube y entra.
import { Easing } from "remotion";
import { LUGARES, SUELO } from "../mundo/ciudad";
import { NUBE_H, NUBE_W } from "../mundo/nube";
import { CtxEscena, EstadoActor, cabezaDe, estadoActor } from "./actores";
import { FPS, azar, indicePalabra, mezcla, tramo } from "./tiempo";
import { Escena, TipoPlano } from "./tipos";

export type Cam = { x: number; y: number; z: number; r: number };

export type Toma = { ini: number; tipo: TipoPlano | "nube"; escena: number; actor: number; vuelo: boolean };

export type EscenaCalc = { e: Escena; k: number; c: CtxEscena };

const CICLO: TipoPlano[] = ["medio", "cerca", "general", "contra", "medio", "edificio", "cerca", "dos"];

/** Centro de la nube de una escena (encima del primer actor). */
export function posNube(ec: EscenaCalc, f: number, variante: number): { x: number; y: number; cabeza: [number, number] } {
  const a = ec.e.actores?.[0];
  const s = a ? estadoActor(a, 0, ec.e, ec.c, f, variante) : null;
  const cab = s ? cabezaDe(s) : ([LUGARES[ec.e.lugar].x, SUELO - 250] as [number, number]);
  return { x: cab[0] + 380, y: cab[1] - NUBE_H / 2 - 220, cabeza: [cab[0] + 40, cab[1] - 120] };
}

/** Lista de tomas de todo el vídeo. */
export function planificar(escenas: EscenaCalc[], variante: number): Toma[] {
  const tomas: Toma[] = [];
  for (const ec of escenas) {
    const { e, k, c } = ec;
    if (c.fin <= c.ini) continue;
    const nAct = e.actores?.length ?? 0;
    const forzados = (e.planos ?? []).map((p) => ({ f: Math.round(c.palabras[indicePalabra(c.palabras, p.en, c.base)].ini * FPS), tipo: p.tipo, actor: Math.max(0, e.actores?.findIndex((a) => a.quien === p.a) ?? 0) }));
    // primera toma: tras volar, se ve el edificio (si cambió de lugar) o un plano medio
    const cambia = k === 0 || escenas[k - 1].e.lugar !== e.lugar;
    tomas.push({ ini: c.ini, tipo: e.nube ? "medio" : cambia && k > 0 ? "edificio" : k === 0 ? "general" : "medio", escena: k, actor: 0, vuelo: cambia && k > 0 });
    if (e.nube) {
      // a los ~1,5 s sube a la nube y se queda dentro (con algún plano del personaje si la escena es larga)
      tomas.push({ ini: Math.min(c.fin - 20, c.ini + 45), tipo: "nube", escena: k, actor: 0, vuelo: false });
      continue;
    }
    // cortes automáticos: palabras que empiezan tras una pausa, cada 2,5-4 s
    let ultimo = c.ini;
    let j = Math.floor(azar(variante, k) * CICLO.length);
    for (let i = c.base; i < c.palabras.length; i++) {
      const fi = Math.round(c.palabras[i].ini * FPS);
      if (fi >= c.fin - 30) break;
      const forz = forzados.find((p) => Math.abs(p.f - fi) < 3);
      const pausa = i > 0 && /[.,;:!?…]$/.test(c.palabras[i - 1].p);
      const hueco = fi - ultimo;
      if (forz || (hueco > 75 && pausa) || hueco > 120) {
        let tipo = forz?.tipo ?? CICLO[j++ % CICLO.length];
        if (tipo === "dos" && nAct < 2) tipo = "medio";
        if ((tipo === "medio" || tipo === "cerca" || tipo === "contra") && nAct === 0) tipo = "edificio";
        const actor = forz ? forz.actor : nAct ? Math.floor(azar(variante, k, i) * nAct) : 0;
        tomas.push({ ini: fi, tipo, escena: k, actor, vuelo: false });
        ultimo = fi;
      }
    }
    for (const p of forzados) if (!tomas.some((t) => Math.abs(t.ini - p.f) < 3)) tomas.push({ ini: p.f, tipo: p.tipo, escena: k, actor: p.actor, vuelo: false });
  }
  return tomas.sort((a, b) => a.ini - b.ini);
}

/** A dónde mira una toma en el fotograma f (sigue a los personajes si se mueven). */
function objetivo(t: Toma, ec: EscenaCalc, f: number, variante: number): Cam {
  const { e } = ec;
  const L = LUGARES[e.lugar];
  const estados: EstadoActor[] = (e.actores ?? []).map((a, i) => estadoActor(a, i, e, ec.c, Math.max(f, ec.c.ini), variante));
  const s = estados[t.actor] ?? estados[0];
  const lado = azar(variante, t.ini) > 0.5 ? 1 : -1;
  switch (t.tipo) {
    case "general":
      return { x: L.x, y: SUELO - 380, z: 0.55, r: 0 };
    case "edificio":
      return { x: L.foco[0], y: L.foco[1], z: L.zoomEdificio, r: lado * 1.5 };
    case "detalle":
      return { x: L.foco[0], y: L.foco[1], z: L.zoomEdificio * 1.8, r: lado * 2 };
    case "medio":
      return s ? { x: s.x + lado * 140, y: s.y - 230, z: 1.35, r: 0 } : { x: L.x, y: SUELO - 300, z: 0.9, r: 0 };
    case "cerca": {
      if (!s) return { x: L.x, y: SUELO - 300, z: 1.2, r: 0 };
      const [cx, cy] = cabezaDe(s);
      return { x: cx + lado * 60, y: cy + 60, z: 2.5, r: lado * 2 };
    }
    case "contra":
      return s ? { x: s.x, y: s.y - 300, z: 1.15, r: -lado * 4 } : { x: L.x, y: SUELO - 300, z: 1, r: 0 };
    case "dos": {
      const vis = estados.filter((q) => q.visible);
      if (vis.length < 2) return { x: L.x, y: SUELO - 300, z: 1.1, r: 0 };
      const xs = vis.map((q) => q.x);
      const ancho = Math.max(...xs) - Math.min(...xs) + 500;
      return { x: (Math.max(...xs) + Math.min(...xs)) / 2, y: vis[0].y - 230, z: Math.min(1.5, 1920 / ancho), r: 0 };
    }
    case "nube": {
      const n = posNube(ec, f, variante);
      return { x: n.x, y: n.y, z: Math.min(1920 / (NUBE_W + 380), 1080 / (NUBE_H + 260)), r: 0 };
    }
  }
}

/** Cámara en el fotograma f. */
export function camaraEn(f: number, tomas: Toma[], escenas: EscenaCalc[], variante: number): Cam & { velocidad: number; volando: number } {
  let k = 0;
  for (let i = 0; i < tomas.length; i++) if (tomas[i].ini <= f) k = i;
  const t = tomas[k];
  const ec = escenas[t.escena];
  const dest = objetivo(t, ec, f, variante);
  // deriva: siempre se mueve un poco (se acerca, se desliza y se ladea)
  const dt = (f - t.ini) / FPS;
  const dir = azar(variante, t.ini, "d") > 0.5 ? 1 : -1;
  const deriva = (c: Cam): Cam => ({ x: c.x + dir * dt * 14, y: c.y - dt * 3, z: c.z * (1 + dt * 0.018), r: c.r + Math.sin(dt * 0.9 + t.ini) * 0.6 });
  if (k === 0) return { ...deriva(dest), velocidad: 0, volando: 0 };
  const ant = tomas[k - 1];
  const origen0 = objetivo(ant, escenas[ant.escena], f, variante);
  const dtA = (t.ini - ant.ini) / FPS;
  const dirA = azar(variante, ant.ini, "d") > 0.5 ? 1 : -1;
  const origen: Cam = { x: origen0.x + dirA * dtA * 14, y: origen0.y - dtA * 3, z: origen0.z * (1 + dtA * 0.018), r: origen0.r };
  if (t.vuelo) {
    // VUELO entre lugares: se aleja (zoom 0.32) a mitad de camino, cruza y vuelve a entrar
    const dur = 34;
    const u = tramo(f, t.ini, t.ini + dur, Easing.inOut(Easing.cubic));
    const sube = Math.sin(u * Math.PI);
    const z = Math.exp(mezcla(Math.log(origen.z), Math.log(dest.z), u)) * (1 - sube * 0.55);
    const d = deriva(dest);
    const vel = Math.abs(Math.cos(u * Math.PI - Math.PI / 2)) * (f < t.ini + dur ? 1 : 0);
    return { x: mezcla(origen.x, d.x, u), y: mezcla(origen.y, d.y, u) - sube * 380, z, r: mezcla(origen.r, d.r, u) + sube * 6, velocidad: vel, volando: f < t.ini + dur ? u : 0 };
  }
  // ZOOM GOLPE: llega rápido (12 fotogramas) con un pequeño rebote
  const dur = t.tipo === "nube" ? 26 : 12;
  const u = tramo(f, t.ini, t.ini + dur, t.tipo === "nube" ? Easing.inOut(Easing.cubic) : Easing.out(Easing.back(1.25)));
  const d = deriva(dest);
  const lin = tramo(f, t.ini, t.ini + dur);
  return {
    x: mezcla(origen.x, d.x, u),
    y: mezcla(origen.y, d.y, u),
    z: Math.exp(mezcla(Math.log(origen.z), Math.log(d.z), u)),
    r: mezcla(origen.r, d.r, u),
    velocidad: Math.sin(lin * Math.PI) * (f < t.ini + dur ? 1 : 0),
    volando: 0,
  };
}
