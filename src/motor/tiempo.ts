// Tiempos: todo se ata a PALABRAS del guion (así el dibujo va al ritmo de la voz, sea cual sea su velocidad).
import { Easing, interpolate } from "remotion";
import { En, Palabra } from "./tipos";

export const FPS = 30;
export const ANCHO = 1920; // vídeo HORIZONTAL (YouTube largo)
export const ALTO = 1080;

export const normal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9ñ]/g, "");

/** Índice de la palabra `en`: un número es el índice tal cual; un texto ("banco" o "banco#2") se busca desde `desde`. */
export function indicePalabra(palabras: Palabra[], en: En, desde = 0): number {
  if (typeof en === "number") return Math.max(0, Math.min(palabras.length - 1, en));
  const [texto, vez] = en.split("#");
  const buscada = normal(texto);
  let veces = Number(vez || 1);
  for (let i = desde; i < palabras.length; i++) if (normal(palabras[i].p) === buscada && --veces === 0) return i;
  for (let i = 0; i < palabras.length; i++) if (normal(palabras[i].p) === buscada) return i;
  throw new Error(`La palabra «${en}» no está en el guion. Revisa la idea.`);
}

/** Fotograma (absoluto) en que empieza la palabra `en`. */
export const fotogramaDe = (palabras: Palabra[], en: En, desde = 0) => Math.round(palabras[indicePalabra(palabras, en, desde)].ini * FPS);

/** 0 → 1 entre los fotogramas a y b, suavizado. */
export const tramo = (f: number, a: number, b: number, ease: (t: number) => number = Easing.inOut(Easing.cubic)) =>
  interpolate(f, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

export const mezcla = (a: number, b: number, t: number) => a + (b - a) * t;

/** Azar repetible (misma semilla → mismo número 0..1). */
export function azar(...n: (number | string)[]) {
  let h = 2166136261;
  for (const c of n.join("|")) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
