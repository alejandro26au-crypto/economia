// MOTOR 2D DE VÍDEOS LARGOS: un lienzo que pinta el plano de cada momento (escenario + objetos + personajes),
// con la cámara siempre en movimiento, golpes de zoom, rótulos y cifras que crecen, y sonidos en cada cambio.
import React, { useEffect, useMemo, useRef, useState } from "react";
import { AbsoluteFill, Audio, cancelRender, continueRender, delayRender, Easing, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FrontOpts, Pen } from "../personaje/toon";
import { FPS, indicePalabra } from "../motor/tiempo";
import { En, PropsShort, Sonido } from "../motor/tipos";
import { IDEAS_LARGAS } from "../ideas/lista";
import { clamp, FUENTE, G, gente, gordo, INK, MANO, rnd, suave } from "./base";
import { ANCHO_LUGAR, LUGARES } from "./lugares";
import { OBJETOS } from "./objetos";
import { traje } from "./reparto";
import { ActorL, Cam, EscenaL, IdeaLarga } from "./tipos";

type Plan = { e: EscenaL; ini: number; fin: number; base: number; i: number };

/** Palabra de inicio de una escena. Si va en MAYÚSCULA («Y», «No»), solo vale una palabra del guion que también
 *  empiece en mayúscula (inicio de frase): así «Y» no se confunde con la «y» de «treinta y nueve». */
export const buscarDesde = (pal: PropsShort["palabras"], en: En, desde: number): number => {
  if (typeof en === "number") return indicePalabra(pal, en, desde);
  const [texto, vez] = en.split("#");
  if (texto[0] !== texto[0].toUpperCase() || texto[0] === texto[0].toLowerCase()) return indicePalabra(pal, en, desde);
  let veces = Number(vez || 1);
  const n = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9ñ]/g, "");
  for (let i = desde; i < pal.length; i++) {
    const w = pal[i].p.replace(/^[¿¡"«(…]+/, "");
    if (w[0] && w[0] === w[0].toUpperCase() && w[0] !== w[0].toLowerCase() && n(w) === n(texto) && --veces === 0) return i;
  }
  return indicePalabra(pal, en, desde);
};

/** fotogramas de inicio de cada escena (según su palabra `desde`) */
export const planificar = (idea: IdeaLarga, props: PropsShort): Plan[] => {
  const pal = props.palabras, total = Math.ceil((props.duracion + 0.7) * FPS);
  const out: Plan[] = [];
  let base = 0;
  idea.escenas.forEach((e, i) => {
    let ini = 0;
    if (i > 0 && e.desde !== undefined) { base = buscarDesde(pal, e.desde, i === 1 ? 0 : base + 1); /* busca DESPUÉS del inicio de la escena anterior */ ini = Math.max(0, Math.round(pal[base].ini * FPS) - 3); }
    out.push({ e, ini, fin: total, base, i });
  });
  for (let i = 0; i < out.length - 1; i++) out[i].fin = out[i + 1].ini;
  return out.filter((x) => x.fin > x.ini);
};

const fmt = (v: number, dec = 0) => {
  const [ent, d] = v.toFixed(dec).split(".");
  // como en español: 4 cifras sin punto (2015, 1700); desde 10.000 con punto de miles
  return (Math.abs(v) >= 10000 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : ent) + (d ? "," + d : "");
};

/** estado de un actor en el segundo t de la escena */
const estado = (a: ActorL, t: number, T: (en: En | undefined, d?: number) => number) => {
  let x = a.x, y = a.y, expr = a.expr ?? "neutral", modo = a.modo ?? "stand", cosa: string | undefined = a.cosa, hacha = !!a.hacha, mira = a.mira ?? 0;
  let wave: number | undefined, salto = 0, tiembla = 0, andando = false;
  for (const ac of a.acciones ?? []) {
    const ta = T(ac.en, 0);
    if (t < ta) continue;
    const d = t - ta;
    if (ac.expr) expr = ac.expr;
    if (ac.modo) modo = ac.modo;
    if (ac.cosa) cosa = ac.cosa === "nada" ? undefined : ac.cosa;
    if (ac.hacha !== undefined) hacha = ac.hacha;
    if (ac.mira !== undefined) mira = ac.mira;
    if (ac.senala && d < 1.8) wave = Math.min(1, d / 0.25) * (d > 1.5 ? (1.8 - d) / 0.3 : 1);
    if (ac.salta && d < 0.5) salto = Math.sin((d / 0.5) * Math.PI) * 70;
    if (ac.tiembla && d < 0.8) tiembla = Math.sin(d * 60) * 8 * (1 - d / 0.8);
    if (ac.x !== undefined || ac.y !== undefined) {
      const dura = ac.dura ?? 1.6, u = suave(d / dura), x2 = ac.x ?? x, y2 = ac.y ?? y;
      if (d < dura) { andando = true; mira = x2 > x ? 1 : x2 < x ? -1 : mira; }
      x = x + (x2 - x) * u; y = y + (y2 - y) * u;
    }
  }
  return { x: x + tiembla, y: y - salto, expr, modo: andando ? "stroll" : modo, cosa, hacha, mira, wave };
};

export const Largo: React.FC<PropsShort> = (props) => {
  const f = useCurrentFrame();
  const ref = useRef<HTMLCanvasElement>(null);
  const idea = IDEAS_LARGAS.find((x) => x.n === props.n) ?? IDEAS_LARGAS[0];
  const plan = useMemo(() => planificar(idea, props), [idea, props]);
  const [listo, setListo] = useState(false);
  const [espera] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    const fuentes = [new FontFace(FUENTE, `url(${staticFile("fuentes/InterDisplay-Black.otf")})`), new FontFace(MANO, `url(${staticFile("fuentes/patrick-hand.woff2")})`)];
    Promise.all(fuentes.map((x) => x.load())).then((fs) => { fs.forEach((x) => document.fonts.add(x)); setListo(true); continueRender(espera); }).catch((e) => cancelRender(e));
  }, [espera]);

  const k = Math.max(0, plan.findIndex((x) => f >= x.ini && f < x.fin));
  const P = plan[k] ?? plan[plan.length - 1];

  useEffect(() => {
    if (!listo || !ref.current) return;
    const g = ref.current.getContext("2d") as G;
    const p = new Pen(g);
    const e = P.e, t = (f - P.ini) / FPS, dur = (P.fin - P.ini) / FPS, gt = f / FPS;
    const T = (en: En | undefined, d = 0) => {
      if (en === undefined) return d;
      try { const i = indicePalabra(props.palabras, en, P.base); return props.palabras[i].ini - P.ini / FPS; } catch { return d; }
    };
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, 1920, 1080);
    g.lineJoin = "round"; g.lineCap = "round";
    // ---------------- cámara
    const a: Cam = e.a ?? [e.cam[0], e.cam[1], e.cam[2] * 1.08];
    const u = Easing.inOut(Easing.cubic)(clamp(t / Math.max(0.5, dur)));
    let cx = e.cam[0] + (a[0] - e.cam[0]) * u, cy = e.cam[1] + (a[1] - e.cam[1]) * u, z = e.cam[2] + (a[2] - e.cam[2]) * u;
    z *= 1 + 0.045 * Math.exp(-t * 7); // asentamiento al cortar
    cx += Math.sin(gt * 0.7) * 6; cy += Math.sin(gt * 0.9 + 1) * 4; // respiración de la cámara
    let sx = 0, sy = 0;
    for (const gp of e.golpes ?? []) {
      const d = t - T(gp.en, -99);
      if (d >= 0 && d < 1.2) { const b = d < 0.12 ? d / 0.12 : Math.exp(-(d - 0.12) * 3.5); z *= 1 + ((gp.z ?? 1.15) - 1) * b; if (d < 0.4) { sx = Math.sin(d * 80) * 10 * (1 - d / 0.4); sy = Math.cos(d * 70) * 7 * (1 - d / 0.4); } }
    }
    const W = ANCHO_LUGAR[e.lugar], vw = 960 / z, vh = 540 / z;
    cx = W > 2 * vw ? clamp(cx, vw, W - vw) : W / 2; cy = 1080 > 2 * vh ? clamp(cy, vh, 1080 - vh) : 540;
    g.save();
    g.translate(960 + sx, 540 + sy); g.scale(z, z); g.translate(-cx, -cy);
    LUGARES[e.lugar](g, p, gt);
    const objs = e.objetos ?? [];
    const pintaObj = (delante: boolean) => {
      for (const o of objs) {
        if (!!o.delante !== delante) continue;
        const ta = o.en !== undefined ? T(o.en as En, 0) : 0;
        if (t < ta) continue;
        const vida = t - ta;
        let alfa = 1;
        if (o.hasta !== undefined) { const th = T(o.hasta as En, 1e9); if (t > th + 0.3) continue; if (t > th) alfa = 1 - (t - th) / 0.3; }
        const pop = o.en !== undefined && o.sinPop !== true ? Math.min(1, vida / 0.12) * (1 + 0.12 * Math.sin(Math.min(1, vida / 0.35) * Math.PI)) : 1;
        g.save(); g.globalAlpha = alfa;
        if (pop !== 1) { g.translate(o.x, o.y); g.scale(pop, pop); g.translate(-o.x, -o.y); }
        OBJETOS[o.tipo]?.(g, p, o, { t, vida, T, f });
        g.restore();
      }
    };
    pintaObj(false);
    const act = [...(e.actores ?? [])].map((ac, i) => ({ ac, i, s: estado(ac, t, T) })).sort((x, y) => x.s.y - y.s.y);
    for (const { ac, i, s } of act) {
      let kk = ac.k ?? 0.5, dy = 0;
      if (ac.entra !== undefined) { const d = t - T(ac.entra, 0); if (d < 0) continue; const pr = Math.min(1, d / 0.3); dy = (1 - pr) * 60; kk *= 0.6 + 0.4 * pr + 0.06 * Math.sin(pr * Math.PI); }
      const blink = (f + i * 37) % 97 < 4 || (f + i * 53) % 151 < 3;
      const opts: FrontOpts = {
        mode: s.modo as FrontOpts["mode"], expr: s.expr, phase: gt * 1.3 + i * 0.3, seed: 3 + i, blink, wave: s.wave, facing: s.mira,
        prop: s.hacha ? ["hacha", Math.abs(Math.sin(gt * Math.PI * 1.2))] : s.cosa ? { cosa: s.cosa as never } : null,
        headTilt: Math.sin(gt * 1.1 + i) * 2.5, tilt: s.modo === "stand" ? Math.sin(gt * 0.8 + i) * 1.2 : 0,
      };
      // sombra en el suelo
      g.save(); g.globalAlpha = 0.18; g.fillStyle = INK; g.beginPath(); g.ellipse(s.x, s.y, 130 * kk * 2, 18 * kk * 2, 0, 0, Math.PI * 2); g.fill(); g.restore();
      g.save();
      if (ac.sombra) g.filter = "brightness(0)";
      gente(g, traje(ac.quien, ac.semilla ?? 1), s.x, s.y + dy, kk, opts);
      g.restore();
    }
    pintaObj(true);
    g.restore();
    // ---------------- rótulos (fijos en pantalla)
    for (const r of e.rotulos ?? []) {
      const ta = T(r.en, 0);
      if (t < ta) continue;
      const th = r.hasta !== undefined ? T(r.hasta, dur) : dur;
      if (t > th + 0.25) continue;
      const d = t - ta, pop = Math.min(1, d / 0.14) * (1 + 0.15 * Math.sin(Math.min(1, d / 0.4) * Math.PI)), fuera = t > th ? 1 - (t - th) / 0.25 : 1;
      let txt = r.texto ?? "";
      if (r.cuenta) { const c = r.cuenta, v = c.de + (c.a - c.de) * Easing.out(Easing.cubic)(clamp(d / (c.dura ?? 1.6))); txt = (c.pre ?? "") + fmt(v, c.dec ?? 0) + (c.suf ?? ""); }
      g.save(); g.globalAlpha = fuera; g.translate(r.x ?? 960, r.y ?? 150); g.rotate(r.giro ?? 0); g.scale(pop, pop);
      gordo(g, txt, 0, 0, r.tam ?? 96, r.color ?? "#ffd23f");
      g.restore();
    }
    // ---------------- transición: iris de tinta al cambiar de escenario
    const antes = plan[k - 1];
    if (antes && antes.e.lugar !== e.lugar && t < 0.45) {
      const rr = Easing.out(Easing.cubic)(t / 0.45) * 1250;
      g.save(); g.fillStyle = INK; g.beginPath(); g.rect(0, 0, 1920, 1080); g.arc(960, 540, Math.max(1, rr), 0, Math.PI * 2, true); g.fill("evenodd"); g.restore();
    }
    // viñeta suave
    const vg = g.createRadialGradient(960, 540, 500, 960, 540, 1150); vg.addColorStop(0, "rgba(36,23,38,0)"); vg.addColorStop(1, "rgba(36,23,38,0.28)");
    g.fillStyle = vg; g.fillRect(0, 0, 1920, 1080);
    if (e.noche) { g.fillStyle = "rgba(20,25,60,0.18)"; g.fillRect(0, 0, 1920, 1080); }
    // subtítulos SOLO en las pruebas sin voz (para ver el ritmo); el vídeo final va sin subtítulos
    if (!props.voz) {
      const s = f / FPS, i0 = props.palabras.findIndex((w) => w.fin >= s);
      if (i0 >= 0) {
        const linea = props.palabras.slice(Math.max(0, i0 - 4), i0 + 5).map((w) => w.p).join(" ");
        g.font = `40px "${MANO}"`; g.textAlign = "center"; g.fillStyle = "rgba(0,0,0,0.55)"; const w = g.measureText(linea).width;
        g.fillRect(960 - w / 2 - 20, 1000, w + 40, 56); g.fillStyle = "#ffffff"; g.fillText(linea, 960, 1040);
      }
      g.font = `28px "${MANO}"`; g.textAlign = "left"; g.fillStyle = "#ffffff"; g.fillText(`escena ${P.i + 1} · ${e.lugar}`, 24, 40);
    }
  }, [f, listo, P, plan, k, props]);

  // ---------------- sonidos
  const sonidos = useMemo(() => {
    const out: { f: number; s: Sonido; vol: number }[] = [];
    plan.forEach((pl, i) => {
      const T = (en: En) => { try { return Math.round(props.palabras[indicePalabra(props.palabras, en, pl.base)].ini * FPS); } catch { return pl.ini; } };
      if (i > 0) out.push({ f: pl.ini, s: pl.e.lugar !== plan[i - 1].e.lugar ? "whoosh2" : (["whoosh1", "whoosh3"] as Sonido[])[i % 2], vol: pl.e.lugar !== plan[i - 1].e.lugar ? 0.45 : 0.25 });
      for (const r of pl.e.rotulos ?? []) { out.push({ f: T(r.en), s: "pop", vol: 0.3 }); if (r.cuenta) out.push({ f: T(r.en) + Math.round((r.cuenta.dura ?? 1.6) * FPS), s: "ding", vol: 0.3 }); }
      for (const gp of pl.e.golpes ?? []) out.push({ f: T(gp.en), s: "golpe", vol: 0.45 });
      for (const so of pl.e.sonidos ?? []) out.push({ f: T(so.en), s: so.s, vol: so.vol ?? 0.4 });
    });
    return out.filter((x) => x.f >= 0);
  }, [plan, props.palabras]);

  return (
    <AbsoluteFill style={{ background: "#efe6d2" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
      {sonidos.map((x, i) => (
        <Sequence key={i} from={x.f} durationInFrames={Math.round(FPS * 1.6)} name={`sfx ${x.s}`}>
          <Audio src={staticFile(`sfx/${x.s}.wav`)} volume={x.vol} />
        </Sequence>
      ))}
      {props.voz && <Audio src={staticFile(props.voz)} />}
      {props.musica && <Audio src={staticFile(props.musica)} volume={0.08} loop />}
    </AbsoluteFill>
  );
};
export const _r = rnd;
