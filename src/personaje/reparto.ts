// EL REPARTO de «Inercia del consumo»: todos son de la MISMA ESPECIE (referencias/personaje.png), cada uno con su
// ropa y accesorios. En una idea se eligen por nombre: { quien: "banquero", … }. Para uno nuevo, añade un Diseno.
import { Diseno } from "./figura";

export const REPARTO: Record<string, Diseno> = {
  // ---- canal «Inercia del consumo»: la especie de referencias/personaje.png (pelo de pinchos por defecto)
  protagonista: { nombre: "Protagonista", ropa: "camiseta", color: "#2b2a2f", pantalon: "#1f1e22", colorPelo: "#16141a" },
  banquero: { nombre: "Banquero", ropa: "traje", color: "#4a4e58", color2: "#f4f2ea", corbata: "#c9a24a", colorPelo: "#2a2622", gafas: true, lleva: "maletin", barriga: 0.5 },
  inversor: { nombre: "Inversor", ropa: "traje", color: "#34445e", color2: "#f4f2ea", corbata: "ninguna", colorPelo: "#4a3220", lleva: "billetes" },
  politico: { nombre: "Político", ropa: "traje", color: "#3a3a42", color2: "#f4f2ea", corbata: "#a04a3a", pelo: "canoso", colorPelo: "#d6d6d0", insignia: "#c9a24a", barriga: 0.8, escala: [1.05, 1] },
  trabajador: { nombre: "Trabajador", ropa: "chaleco-obra", color: "#c98c4e", pantalon: "#4a5a7a", pantalonLargo: true, sombrero: "casco", colorSombrero: "#d9b44a", bigote: "grueso", colorPelo: "#3a2a1c" },
  monarca: { nombre: "Rey", ropa: "chaqueta", color: "#7a2a34", color2: "#efe6d0", sombrero: "corona", banda: "#7a8a5a", bigote: "grueso", barba: "perilla", colorPelo: "#5a4026", barriga: 0.8, cinturon: true, escala: [1.06, 1] },
  estafador: { nombre: "Estafador", ropa: "gabardina", color: "#b09a6a", color2: "#efe6d0", corbata: "#5a6a4a", sombrero: "fedora", colorSombrero: "#3a3634", bigote: "fino", colorPelo: "#1a1614", lleva: "bolsa" },
  // ---- más papeles para las historias (misma especie, otra ropa)
  economista: { nombre: "Economista", ropa: "chaleco", color: "#5a6a4a", color2: "#efe6d0", gafas: true, colorPelo: "#6a6a70", lleva: "papel" },
  magnate: { nombre: "Magnate (1900)", ropa: "traje", color: "#2a2a30", color2: "#efe6d0", corbata: "#8a2a2a", sombrero: "chistera", colorSombrero: "#1a1a1e", bigote: "manillar", barriga: 1, lleva: "bolsa", escala: [1.08, 1] },
  vecina: { nombre: "Vecina", ropa: "camisa", color: "#c98a8a", pelo: "melena", colorPelo: "#5a3a22", pantalon: "#4a5a7a" },
};
