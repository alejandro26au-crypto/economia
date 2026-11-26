// REPARTO del vídeo 1, hecho con el kit de la especie (src/personaje/especie.ts) y su armario.
import { Outfit } from "../personaje/toon";
import { con, Ficha, persona, PROTAGONISTA, REPARTO, vestir } from "../personaje/especie";
import { Quien } from "./tipos";

const RONALD: Ficha = { pelo: "corto", cabello: "blanco", camiseta: "gris", pantalon: "gris", zapatos: "marrones", piel: "rosada", piezas: { abrigo: "marron", imperdibles: true, arrugas: true } };
const FICHAS: Partial<Record<Quien, Ficha>> = {
  ronald: RONALD,
  ronald_joven: { pelo: "corto", cabello: "castano", camiseta: "azul", pantalon: "marron", zapatos: "marrones", piel: "rosada", cuello: "igual", bolsillo: true, piezas: { manchas: true } },
  ronald_nino: { pelo: "corto", cabello: "castano", camiseta: "mostaza", pantalon: "marron", zapatos: "marrones", piel: "rosada", nino: true },
  ronald_soldado: { pelo: "rapado", cabello: "castano", camiseta: "verde", pantalon: "marron", zapatos: "negros", piel: "rosada", cinturon: "cuero", bolsillo: true },
  fuscone: { pelo: "tupe", cabello: "castano", camiseta: "blanca", pantalon: "negro", zapatos: "negros", piel: "clara", piezas: { traje: "marino", corbata: "roja" } },
  tu: PROTAGONISTA,
  abogado: con(REPARTO.banquero, {}),
  vecina: REPARTO.vecina,
  enfermera: { pelo: "rizos", cabello: "castano", camiseta: "blanca", pantalon: "blanco" as never, zapatos: "blancos", piel: "media", cuello: "celeste" },
  bibliotecaria: { pelo: "corto", cabello: "pelirrojo", camiseta: "granate", pantalon: "negro", zapatos: "rojos", piel: "clara", cuello: "blanco", piezas: { gafas: true } },
  empresario: { pelo: "tupe", cabello: "negro", camiseta: "gris", pantalon: "negro", zapatos: "negros", piel: "media", piezas: { traje: "gris", corbata: "dorada" } },
  banquero: REPARTO.banquero,
  actor: { pelo: "tupe", cabello: "rubio", camiseta: "turquesa", pantalon: "beige", zapatos: "blancos", piel: "clara", piezas: { gafas: true } },
};
// la enfermera lleva pantalón gris (no hay blanco en el kit)
FICHAS.enfermera = { ...FICHAS.enfermera!, pantalon: "gris" };

export const traje = (q: Quien, semilla = 1): Outfit => (q === "gente" ? persona(semilla) : vestir(FICHAS[q] ?? PROTAGONISTA));
