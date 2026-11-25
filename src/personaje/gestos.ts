// GESTOS AL HABLAR (traídos del kit de los romanos, motor de dibujos del océano) para el protagonista 2D:
//   abreBoca(f, BOCA)        -> la boca sigue el volumen real de la voz (BOCA sale de `canal voz`, en tiempos.json)
//   brazosEn(f, CLAVES)      -> pose de cada brazo: el gesto empieza 3 fotogramas antes de su palabra y llega con
//                               impulso (se pasa un poco y se asienta), no de golpe ni como un robot
//   cabezaEn(f, GOLPES)      -> asiente en las palabras fuertes (remates y cifras)
import { Brazo } from "../bent/rig";

export type Gesto = "cuelga" | "senala" | "arriba" | "cadera" | "abre" | "golpe" | "barbilla" | "cruza" | "pulgar" | "encoge" | "puno";

/** Poses del brazo DERECHO de la pantalla (el de delante); el izquierdo es su espejo. */
const DERECHO: Record<Gesto, Brazo> = {
  cuelga: { h: 8, c: -6, mano: "puno" },
  senala: { h: 92, c: -6, mano: "senala" },
  arriba: { h: 150, c: 18, mano: "abierta" },
  cadera: { h: 30, c: -90, mano: "puno" },
  abre: { h: 52, c: 48, mano: "abierta", giroMano: 30 },
  golpe: { h: 36, c: 78, mano: "puno" },
  barbilla: { h: 70, c: -190, mano: "puno" },
  cruza: { h: 8, c: -108, mano: "puno" },
  pulgar: { h: 42, c: 92, mano: "pulgar" },
  encoge: { h: 40, c: 80, mano: "abierta", giroMano: 200 },
  puno: { h: 150, c: 10, mano: "puno" },
};
const espejo = (b: Brazo): Brazo => ({ ...b, h: -b.h, c: -b.c, giroMano: b.giroMano ? 360 - b.giroMano : 0 });
export const poseBrazo = (g: Gesto, lado: "izq" | "der"): Brazo => (lado === "der" ? DERECHO[g] : g === "cruza" ? { h: -6, c: 112, mano: "puno" } : espejo(DERECHO[g]));

/** Clave de gesto: en el fotograma `f` (el de la palabra), cada brazo pasa a su gesto. */
export type ClaveGesto = { f: number; izq?: Gesto; der?: Gesto };

const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
/** Llega con impulso: se pasa un 10 % y se asienta. */
const impulso = (t: number) => {
  const c1 = 1.6;
  const c3 = c1 + 1;
  return 1 + c3 * (t - 1) ** 3 + c1 * (t - 1) ** 2;
};
const mezcla = (a: Brazo, b: Brazo, t: number): Brazo => ({
  h: a.h + (b.h - a.h) * t,
  c: a.c + (b.c - a.c) * t,
  mano: t < 0.45 ? a.mano : b.mano,
  giroMano: (a.giroMano ?? 0) + ((b.giroMano ?? 0) - (a.giroMano ?? 0)) * t,
});

export function brazosEn(f: number, claves: ClaveGesto[], dur = 7): { bA: Brazo; bB: Brazo } {
  let L: Gesto = "cuelga", R: Gesto = "cuelga", Lp: Gesto = "cuelga", Rp: Gesto = "cuelga", Lf = -99, Rf = -99;
  for (const k of claves) {
    const fk = k.f - 3;
    if (fk > f) break;
    if (k.izq && k.izq !== L) { Lp = L; L = k.izq; Lf = fk; }
    if (k.der && k.der !== R) { Rp = R; R = k.der; Rf = fk; }
  }
  const tL = impulso(clamp((f - Lf) / dur));
  const tR = impulso(clamp((f - Rf) / dur));
  // un poco de vida: la mano que gesticula se mueve con la voz
  const vivo = (b: Brazo, g: Gesto, s: number) => (g === "abre" || g === "golpe" ? { ...b, c: b.c + Math.sin(f * 0.17 + s) * 8 } : b);
  return {
    bA: vivo(mezcla(poseBrazo(Lp, "izq"), poseBrazo(L, "izq"), tL), L, 1),
    bB: vivo(mezcla(poseBrazo(Rp, "der"), poseBrazo(R, "der"), tR), R, 0),
  };
}

/** Asiente en las palabras fuertes (grados de cabeza) y respira siempre. */
export function cabezaEn(f: number, golpes: number[]) {
  let giro = 0;
  for (const g of golpes) {
    const d = f - (g - 2);
    if (d >= 0 && d < 10) giro += 6 * Math.sin((d / 10) * Math.PI) * (1 - d / 14);
  }
  return giro;
}

/** Apertura de la boca (0..1) según el volumen de la voz en ese fotograma; cerrada en los silencios. */
export function abreBoca(f: number, boca: number[] | null | undefined) {
  if (!boca) return 0;
  const a = boca[Math.max(0, Math.min(boca.length - 1, Math.round(f)))] ?? 0;
  return a > 0.12 ? Math.min(1, a) : 0;
}
