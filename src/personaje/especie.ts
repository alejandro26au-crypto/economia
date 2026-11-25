// KIT DE LA ESPECIE DEL CANAL (como el kit de los romanos, pero propio): todos los personajes comparten el cuerpo
// y la cara del protagonista (cabeza de judía, ojos grandes con brillo, manos blancas, camiseta de manga corta) y
// cambian el PELO (estilo y color), la CAMISETA, el PANTALÓN, los ZAPATOS y la PIEL para ser otra persona.
// Dibujo: src/personaje/toon.ts (bodyFront). Uso: bodyFront(pen, persona(7), { mode: "stand", expr: "smile" }).
import { Outfit } from "./toon";

export type Pelo = "despeinado" | "corto" | "rizos" | "tupe" | "rapado";

export const PIELES = { clara: "#fff6ec", rosada: "#ffe2c2", media: "#f0c49c", morena: "#c99067", oscura: "#8d5a3c" };
export const CABELLOS = { negro: "#1f1c1e", castano: "#5a3b2a", rubio: "#e0b252", pelirrojo: "#c4562c", canoso: "#b9b6b0" };
// colores apagados (estilo del canal) para camisetas y pantalones
export const CAMISETAS = {
  negra: "#26242a", azul: "#3f6fb5", verde: "#5d7a3a", mostaza: "#d9a441", granate: "#8c3b4a",
  gris: "#8a8d93", blanca: "#ecebe6", turquesa: "#2f7f80", naranja: "#d0703a", morada: "#6e5a9c",
};
export const PANTALONES = { negro: "#2c2b31", vaquero: "#3b5b9a", gris: "#55565c", marron: "#6b4a32", beige: "#b9a27a" };
export const ZAPATOS = { negros: "#1b1a1f", marrones: "#5a3b2a", blancos: "#f1efe9", rojos: "#b8383a" };

export type Ficha = {
  pelo: Pelo; cabello: keyof typeof CABELLOS; camiseta: keyof typeof CAMISETAS; pantalon: keyof typeof PANTALONES;
  zapatos: keyof typeof ZAPATOS; piel: keyof typeof PIELES; robusto?: boolean; nino?: boolean;
  /** detalles de la ropa */
  cinturon?: keyof typeof CINTURONES; bolsillo?: boolean; cuello?: keyof typeof CUELLOS;
};
export const CINTURONES = { marron: "#5a3b2a", negro: "#1b1a1f", cuero: "#8a5a32" };
export const CUELLOS = { blanco: "#f1efe9", igual: "", celeste: "#bcd3ea" }; // «igual»: del color de la camiseta

/** Convierte una ficha en el traje que entiende toon.ts. */
export const vestir = (f: Ficha): Outfit => ({
  jacket: CAMISETAS[f.camiseta], pants: PANTALONES[f.pantalon], boots: ZAPATOS[f.zapatos], hat: `pelo:${f.pelo}`,
  hair: CABELLOS[f.cabello], skin: PIELES[f.piel], buttons: "none", prota: true,
  build: f.nino ? "kid" : f.robusto ? "stout" : "adult",
  cinturon: f.cinturon ? CINTURONES[f.cinturon] : undefined, bolsillo: !!f.bolsillo,
  cuelloCamisa: f.cuello ? (CUELLOS[f.cuello] || CAMISETAS[f.camiseta]) : undefined,
});

/** EL PROTAGONISTA: pelo despeinado negro y camiseta negra (fijo, no cambiar). */
export const PROTAGONISTA: Ficha = { pelo: "despeinado", cabello: "negro", camiseta: "negra", pantalon: "negro", zapatos: "negros", piel: "clara", cinturon: "marron", bolsillo: true, cuello: "igual" };

/** Reparto fijo con nombre, para reutilizar la misma «persona» en varios vídeos. */
export const REPARTO: Record<string, Ficha> = {
  protagonista: PROTAGONISTA,
  vecina: { pelo: "rizos", cabello: "castano", camiseta: "mostaza", pantalon: "vaquero", zapatos: "blancos", piel: "media", bolsillo: true },
  banquero: { pelo: "corto", cabello: "canoso", camiseta: "gris", pantalon: "negro", zapatos: "negros", piel: "rosada", robusto: true, cinturon: "negro", cuello: "blanco" },
  amigo: { pelo: "tupe", cabello: "rubio", camiseta: "azul", pantalon: "beige", zapatos: "marrones", piel: "clara", cinturon: "cuero" },
  jefa: { pelo: "corto", cabello: "pelirrojo", camiseta: "granate", pantalon: "negro", zapatos: "rojos", piel: "clara", cuello: "blanco", cinturon: "negro" },
  tendero: { pelo: "rapado", cabello: "negro", camiseta: "verde", pantalon: "marron", zapatos: "marrones", piel: "morena", robusto: true, bolsillo: true, cinturon: "cuero" },
  estudiante: { pelo: "despeinado", cabello: "castano", camiseta: "turquesa", pantalon: "vaquero", zapatos: "blancos", piel: "oscura", cuello: "igual" },
  nino: { pelo: "despeinado", cabello: "rubio", camiseta: "naranja", pantalon: "vaquero", zapatos: "rojos", piel: "rosada", nino: true, bolsillo: true },
};

/** Persona de relleno (público, gente por la calle): cambia pelo, colores y piel según la semilla. */
export const persona = (semilla: number): Outfit => {
  const elige = <T,>(lista: T[], k: number) => lista[Math.floor(Math.abs(Math.sin(semilla * 12.9898 + k * 78.233) * 43758.5453) % lista.length)];
  const f: Ficha = {
    pelo: elige(["despeinado", "corto", "rizos", "tupe", "rapado"] as Pelo[], 1),
    cabello: elige(Object.keys(CABELLOS) as Ficha["cabello"][], 2),
    camiseta: elige((Object.keys(CAMISETAS) as Ficha["camiseta"][]).filter((c) => c !== "negra"), 3), // la negra es del protagonista
    pantalon: elige(Object.keys(PANTALONES) as Ficha["pantalon"][], 4),
    zapatos: elige(Object.keys(ZAPATOS) as Ficha["zapatos"][], 5),
    piel: elige(Object.keys(PIELES) as Ficha["piel"][], 6),
    robusto: elige([false, false, true], 7),
    cinturon: elige([undefined, "marron", "negro", "cuero"] as Ficha["cinturon"][], 8),
    bolsillo: elige([false, true], 9),
    cuello: elige([undefined, undefined, "blanco", "igual", "celeste"] as Ficha["cuello"][], 10),
  };
  return vestir(f);
};
