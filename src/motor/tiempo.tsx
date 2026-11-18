// Tiempos: convierte "palabra del guion" en "fotograma del vídeo".
import React, { createContext, useContext } from "react";
import { Easing, interpolate } from "remotion";
import { En, Palabra } from "./tipos";

export const FPS = 30;
export const ANCHO = 1080;
export const ALTO = 1920;

export const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/** Índice de la palabra `en` buscando desde `desde` (incluido). */
export function indicePalabra(palabras: Palabra[], en: En, desde = 0): number {
  if (typeof en === "number") return Math.max(0, Math.min(palabras.length - 1, en));
  const [texto, vez] = en.split("#");
  const buscada = normal(texto);
  let veces = Number(vez || 1);
  for (let i = desde; i < palabras.length; i++) {
    if (normal(palabras[i].p) === buscada && --veces === 0) return i;
  }
  // si no está desde aquí, la buscamos en todo el guion (mejor eso que romper el vídeo)
  for (let i = 0; i < palabras.length; i++) if (normal(palabras[i].p) === buscada) return i;
  throw new Error(`La palabra «${en}» no está en el guion. Revisa la idea.`);
}

export type Ctx = { palabras: Palabra[]; base: number; inicioEscena: number; finEscena: number; variante: number };
const VozCtx = createContext<Ctx>({ palabras: [], base: 0, inicioEscena: 0, finEscena: 1, variante: 1 });

export const ProveedorVoz: React.FC<{ valor: Ctx; children: React.ReactNode }> = ({ valor, children }) => (
  <VozCtx.Provider value={valor}>{children}</VozCtx.Provider>
);

/** El contexto tal cual (para volver a darlo dentro del lienzo 3D, que no lo hereda). */
export const useCtxVoz = () => useContext(VozCtx);

/** Herramientas de tiempo de una escena (sin hooks: sirven también fuera de React). */
export function herramientas(c: Ctx) {
  /** F("palabra") = fotograma (relativo a la escena) en que se dice esa palabra. */
  const F = (en: En | undefined, defecto = 0): number => {
    if (en === undefined) return defecto;
    const i = indicePalabra(c.palabras, en, c.base);
    return Math.round(c.palabras[i].ini * FPS) - c.inicioEscena;
  };
  /** ¿Está sonando alguna palabra en el fotograma f de la escena? */
  const sonando = (f: number) => {
    const s = (f + c.inicioEscena) / FPS;
    return c.palabras.some((p) => s >= p.ini && s <= p.fin);
  };
  return { F, sonando, dur: c.finEscena - c.inicioEscena, variante: c.variante, palabras: c.palabras };
}

export function useVoz() {
  return herramientas(useContext(VozCtx));
}

/** 0 → 1 entre los fotogramas a y b, suavizado. */
export const tramo = (f: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;
