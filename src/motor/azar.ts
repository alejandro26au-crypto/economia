// Azar con semilla: la misma variante da siempre el mismo vídeo; otra variante, otro vídeo.

export function azar(semilla: number, ...claves: (string | number)[]): number {
  let h = (2166136261 ^ semilla) >>> 0;
  const s = claves.join("|");
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= h >>> 15;
  h = Math.imul(h, 2246822507) >>> 0;
  h ^= h >>> 13;
  h = Math.imul(h, 3266489909) >>> 0;
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

export const elige = <T,>(semilla: number, lista: T[], ...claves: (string | number)[]): T =>
  lista[Math.floor(azar(semilla, ...claves) * lista.length)];

/** Paletas de agua: cada variante tiñe el mar de un tono distinto. [claro, medio, oscuro] */
export const AGUAS: [string, string, string][] = [
  ["#5fd3f3", "#1f8fc7", "#0b3f73"],
  ["#62e0d6", "#1a9ab0", "#0c4560"],
  ["#7ab8ff", "#2f6fd6", "#14306e"],
  ["#5ef0c0", "#16a596", "#0b4f5c"],
];

/** Colores alegres para criaturas cuando la idea no fija uno. */
export const COLORES = ["#ff7a59", "#ff5d8f", "#ffb547", "#a77bff", "#4fd1a5", "#ff8fb1", "#f2c94c"];

/** Pequeño ruido suave (para que todo se mueva un poco, como a mano). */
export const ondula = (f: number, semilla: number, vel = 0.05) =>
  Math.sin(f * vel + semilla * 1.7) * 0.6 + Math.sin(f * vel * 2.3 + semilla * 3.1) * 0.4;
