// Animaciones de BENT (y de toda su especie): cada una devuelve la pose en el fotograma t (desde que empezó).
// Se mezclan solas al pasar de una a otra. Las caras se ponen aparte (cara.ts), así cualquier animación vale con
// cualquier expresión.
import { Brazo, Pose, POSE_BASE, mezclaPose } from "./pose";
import { PUNTOS, alcanza } from "./figura";

export type Anim = "quieto" | "camina" | "corre" | "habla" | "senala" | "piensa" | "encoge" | "saluda" | "victoria" | "asustado" | "cruza" | "salta" | "mira" | "cabeza" | "agotado";

const s = Math.sin;
const B = POSE_BASE;
const brazo = (h: number, c: number, mano: Brazo["mano"], giroMano = 0): Brazo => ({ h, c, mano, giroMano });

/** Pose del cuerpo (sin cara) de una animación en el fotograma t. */
export function cuerpo(anim: Anim, t: number, semilla = 0): Partial<Pose> {
  const r = s(t * 0.08 + semilla) * 0.5 + s(t * 0.031 + semilla * 2) * 0.5; // respiración
  switch (anim) {
    case "quieto": {
      // de pie con las manos en los bolsillos; se balancea un poco y cambia el peso de pierna
      const peso = s(t * 0.025 + semilla);
      return { respira: r, inclina: peso * 1.2, cabeza: s(t * 0.02 + semilla) * 3, pA: { h: -5 + peso * 2, r: 2 }, pB: { h: 9 - peso * 2, r: -3 } };
    }
    case "camina": {
      // paso de 3/4: cada pierna se levanta por turnos (rodilla arriba), sin cruzarse
      const c = t * 0.26;
      const a = s(c);
      const subeA = Math.max(0, a);
      const subeB = Math.max(0, -a);
      return {
        respira: r,
        y: -Math.abs(a) * 12 + 4,
        inclina: 2,
        cabeza: s(c * 2) * 1.5,
        pA: { h: -6 + subeA * 26, r: -subeA * 50 },
        pB: { h: 8 - subeB * 26, r: subeB * 50 },
        bA: brazo(-12 + a * 16, 22, "puno"),
        bB: brazo(12 + a * 16, -22, "puno"),
      };
    }
    case "corre": {
      const c = t * 0.42;
      const a = s(c);
      const subeA = Math.max(0, a);
      const subeB = Math.max(0, -a);
      return {
        y: -Math.abs(a) * 34 + 8,
        inclina: 8,
        cabeza: -3,
        pA: { h: -8 + subeA * 50, r: -subeA * 90 },
        pB: { h: 10 - subeB * 50, r: subeB * 90 },
        bA: brazo(-18 + a * 40, 80, "puno"),
        bB: brazo(18 + a * 40, -80, "puno"),
      };
    }
    case "habla": {
      // gesticula con la mano derecha, la otra en el bolsillo
      const g = s(t * 0.17 + semilla);
      const g2 = s(t * 0.11 + semilla * 3);
      return { respira: r, inclina: g2 * 2, cabeza: g * 3, bB: brazo(30 + g * 14, 70 + g2 * 25, g2 > 0.3 ? "abierta" : "puno", 20 + g * 20) };
    }
    case "senala": {
      const k = Math.min(1, t / 7);
      return { respira: r, inclina: 2, bB: brazo(20 + 72 * k, -6 * k, "senala"), cabeza: -2 };
    }
    case "piensa":
      return { respira: r, cabeza: -7 + s(t * 0.05) * 2, inclina: -1, bB: brazo(28, -152 + s(t * 0.1) * 4, "puno") };
    case "encoge": {
      const k = Math.min(1, t / 6);
      return { hombros: k, cabeza: 7 * k, bA: brazo(-40 * k - 16 * (1 - k), -80 * k + 64 * (1 - k), k > 0.4 ? "abierta" : "bolsillo", 160), bB: brazo(40 * k + 16 * (1 - k), 80 * k - 64 * (1 - k), k > 0.4 ? "abierta" : "bolsillo", 200) };
    }
    case "saluda": {
      const w = s(t * 0.45);
      return { respira: r, bB: brazo(150, 20 + w * 25, "abierta", -10 + w * 10), cabeza: 3 };
    }
    case "victoria": {
      const b = Math.abs(s(t * 0.3));
      return { y: -b * 26, bA: brazo(-155, -10 + b * 6, "v"), bB: brazo(155, 10 - b * 6, "v"), cabeza: s(t * 0.3) * 3 };
    }
    case "asustado": {
      const tiembla = s(t * 2.1) * (t < 20 ? 3 : 1);
      return { x: tiembla, inclina: -7, bA: brazo(-72, -58, "abierta"), bB: brazo(72, 58, "abierta"), pA: { h: -16, r: 4 }, pB: { h: 18, r: -6 }, cabeza: -4 };
    }
    case "cruza":
      return { respira: r, bA: brazo(-6, 112, "puno"), bB: brazo(8, -108, "puno"), cabeza: 2 + s(t * 0.03) * 2 };
    case "salta": {
      // se agacha, salta y cae
      const ciclo = Math.min(1, t / 26);
      const agacha = ciclo < 0.25 ? ciclo / 0.25 : ciclo > 0.85 ? (1 - ciclo) / 0.15 : 0;
      const vuelo = ciclo > 0.25 && ciclo < 0.85 ? s(((ciclo - 0.25) / 0.6) * Math.PI) : 0;
      return {
        y: -vuelo * 160,
        pA: { h: -10 - agacha * 30, r: agacha * 60 + vuelo * 30 },
        pB: { h: 12 + agacha * 30, r: -agacha * 60 - vuelo * 30 },
        bA: brazo(-30 - vuelo * 120, 20, "puno"),
        bB: brazo(30 + vuelo * 120, -20, "puno"),
      };
    }
    case "cabeza": {
      // manos a la cabeza (la viñeta 3 de referencias/expresiones.png); tiembla un poco al principio
      const k = Math.min(1, t / 6);
      const tiembla = s(t * 1.9) * (t < 18 ? 2 : 0.5);
      const a = alcanza(PUNTOS.hombroA, PUNTOS.orejaA, 1);
      const b = alcanza(PUNTOS.hombroB, PUNTOS.orejaB, -1);
      return { x: tiembla, hombros: 0.3 * k, bA: brazo(-20 + (a.h + 20) * k, a.c * k, "abierta", 180), bB: brazo(20 + (b.h - 20) * k, b.c * k, "abierta", 180) };
    }
    case "agotado": {
      // encorvado, brazos colgando y la cabeza baja (la viñeta 5)
      const bal = s(t * 0.06 + semilla) * 2;
      return { respira: r * 0.5, inclina: 16 + bal, cabeza: 14, hombros: 0.6, bA: brazo(4 + bal, 6, "abierta"), bB: brazo(14 + bal, 4, "abierta"), pA: { h: -14, r: 12 }, pB: { h: 18, r: -2 } };
    }
    case "mira": {
      // se gira a mirar algo, con la mano de visera
      return { respira: r, cabeza: -4, inclina: 3, bB: brazo(150, -40, "abierta", 80) };
    }
  }
}

/** Cara según la expresión. abre = boca al hablar (0..1). */
export type Expresion = "seria" | "chulo" | "enfadado" | "feliz" | "risa" | "sorpresa" | "asustado" | "triste" | "piensa" | "dormido" | "aburrido";
export function cara(e: Expresion, abre: number): Partial<Pose> {
  switch (e) {
    case "seria":
      return { cejas: 0.8, alzaCejas: 0, ojos: "normal", boca: "seria", abre };
    case "chulo":
      return { cejas: 0.5, alzaCejas: 0.15, ojos: "entornados", boca: "media", abre };
    case "enfadado":
      return { cejas: 1.4, alzaCejas: 0, ojos: "normal", boca: "triste", abre };
    case "feliz":
      return { cejas: -0.2, alzaCejas: 0.2, ojos: "feliz", boca: "sonrisa", abre };
    case "risa":
      return { cejas: -0.3, alzaCejas: 0.3, ojos: "feliz", boca: "risa", abre: Math.max(abre, 0.6) };
    case "sorpresa":
      return { cejas: -0.4, alzaCejas: 1, ojos: "abiertos", boca: "o", abre };
    case "asustado":
      return { cejas: -0.9, alzaCejas: 1, ojos: "abiertos", boca: "asustada", abre };
    case "triste":
      return { cejas: -1, alzaCejas: 0.4, ojos: "normal", boca: "triste", abre };
    case "piensa":
      return { cejas: 0.3, alzaCejas: 0.5, ojos: "normal", boca: "media", mira: 0.9, abre };
    case "dormido":
      return { cejas: 0, alzaCejas: 0, ojos: "cerrados", boca: "seria", abre: 0 };
    case "aburrido":
      return { cejas: 0, alzaCejas: 0, ojos: "entornados", boca: "seria", abre };
  }
}

/** Pose completa: animación actual mezclada con la anterior (transición de 8 fotogramas) + cara. */
export function poseCompleta(o: { anim: Anim; animAnt: Anim; t: number; expresion: Expresion; abre: number; semilla: number; f: number }): Pose {
  const actual = { ...B, ...cuerpo(o.anim, o.t, o.semilla) } as Pose;
  const antes = { ...B, ...cuerpo(o.animAnt, o.t + 1000, o.semilla) } as Pose;
  const k = Math.min(1, o.t / 8);
  const suave = k * k * (3 - 2 * k);
  const p = mezclaPose(antes, actual, suave);
  return { ...p, ...cara(o.expresion, o.abre) };
}
