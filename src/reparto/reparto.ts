// Catálogo del reparto: cada vídeo elige su protagonista (y secundarios) por nombre: extra: { figura: "pirata" }.
// Para uno nuevo, añade aquí un Diseno (ropa, colores, pelo, sombrero, bigote/barba, complexión).
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
  // ---- heredados del canal del océano (misma especie, otra ropa)
  pirata: { nombre: "Pirata", ropa: "chaqueta", color: "#7a1a22", color2: "#f0e6d0", sombrero: "tricornio", colorSombrero: "#1e1a22", bigote: "manillar", barba: "perilla", colorPelo: "#2a1a10", parche: true, cinturon: true, zapato: "#3a2414" },
  grumete: { nombre: "Grumete", ropa: "rayas", color: "#f4f2ec", color2: "#2a4a8a", sombrero: "bandana", colorSombrero: "#c0242c", pelo: "rizado", colorPelo: "#5a3218", escala: [0.92, 0.9], zapato: "#3a2414" },
  capitan: { nombre: "Capitán", ropa: "chaqueta", color: "#1c2a52", color2: "#f4f4f6", sombrero: "capitan", barba: "corta", colorPelo: "#9a9ca6", barriga: 0.6, escala: [1.08, 1] },
  marinero: { nombre: "Marinero", ropa: "rayas", color: "#ffffff", color2: "#1d3a7a", sombrero: "marinero", panuelo: "#c0242c", zapato: "#22222a" },
  farero: { nombre: "Farero", ropa: "jersey", color: "#2f4a6a", sombrero: "gorro-lana", colorSombrero: "#c0602a", barba: "larga", colorPelo: "#d8dbe2", escala: [1, 0.96] },
  pescador: { nombre: "Pescador", ropa: "jersey", color: "#d8c8a0", sombrero: "sueste", colorSombrero: "#f2c41e", bigote: "grueso", colorPelo: "#4a3220", cinturon: true },
  cocinero: { nombre: "Cocinero", ropa: "delantal", color: "#e8e8ee", sombrero: "cocinero", bigote: "grueso", colorPelo: "#2a1a10", barriga: 1, escala: [1.1, 0.97] },
  cientifica: { nombre: "Científica", ropa: "bata", color: "#5a7a9a", pelo: "coleta", colorPelo: "#7a3a1a", gafas: true },
  exploradora: { nombre: "Exploradora", ropa: "camisa", color: "#b89a5a", sombrero: "salacot", colorSombrero: "#e0cc98", pelo: "melena", colorPelo: "#2a1a10", cinturon: true, panuelo: "#3a7a5a" },
  rey: { nombre: "Rey", ropa: "chaqueta", color: "#6a1424", color2: "#f0e6d0", sombrero: "corona", bigote: "grueso", barba: "corta", colorPelo: "#c99a3a", barriga: 0.8, cinturon: true, escala: [1.08, 1] },
  hoplita: { nombre: "Soldado griego", ropa: "armadura", color: "#a8862e", sombrero: "casco-griego", colorSombrero: "#b3202f", zapato: "#5a3a1e", cinturon: true },
  millonario: { nombre: "Millonario", ropa: "traje", color: "#2a2a30", detalle: "#c0242c", sombrero: "chistera", bigote: "fino", barriga: 0.7 },
  turista: { nombre: "Turista", ropa: "camisa", color: "#3fb0a0", pelo: "tupe", colorPelo: "#e0c070", gafas: true },
  cirujano: { nombre: "Cirujano", ropa: "chaleco", color: "#3a2a22", color2: "#f0e6d0", pelo: "melena", colorPelo: "#4a2a18", bigote: "fino", gafas: true, panuelo: "#f2efe4" },
  oficial: { nombre: "Oficial español", ropa: "chaqueta", color: "#1e3a7a", color2: "#c0242c", detalle: "#e0b04a", sombrero: "tricornio", colorSombrero: "#16161c", bigote: "fino", barba: "perilla", colorPelo: "#1a1410", cinturon: true },
  oficinista: { nombre: "Oficinista", ropa: "traje", color: "#6a707a", detalle: "#2a5fa8", pelo: "corto", colorPelo: "#5a4a3a", gafas: true },
  operario: { nombre: "Operario de plataforma", ropa: "jersey", color: "#e8641e", sombrero: "casco", colorSombrero: "#f4f4f0", bigote: "grueso", colorPelo: "#5a3a22", cinturon: true, zapato: "#2a2a30" },
  profesor: { nombre: "Profesor (1900)", ropa: "traje", color: "#3a3430", detalle: "#c9a24a", sombrero: "bombin", colorSombrero: "#1a1614", bigote: "manillar", colorPelo: "#c8c8cc", gafas: true, barriga: 0.6, escala: [1.05, 1] },
  // vídeo de los submarinos de Holland (idea 8)
  maestro: { nombre: "John Holland (maestro, 1875)", ropa: "traje", color: "#5a4632", detalle: "#c9a24a", sombrero: "bombin", colorSombrero: "#2a2018", bigote: "grueso", colorPelo: "#3a2a1c", gafas: true, panuelo: "#1a1a20" },
  almirante: { nombre: "Almirante de EE. UU. (1875)", ropa: "chaqueta", color: "#16224a", color2: "#f4f4f6", detalle: "#e0b04a", sombrero: "capitan", colorSombrero: "#16224a", bigote: "manillar", barba: "corta", colorPelo: "#e0e2e8", barriga: 0.9, cinturon: true, escala: [1.1, 1] },
  rebelde: { nombre: "Rebelde feniano", ropa: "chaleco", color: "#2a5a32", color2: "#e8e0cc", sombrero: "gorra", colorSombrero: "#4a4038", barba: "larga", colorPelo: "#b04a1e", panuelo: "#2f8a3e", zapato: "#2a1a10", escala: [1.05, 1] },
  sabio: { nombre: "Sabio", ropa: "tunica", color: "#e8e0cc", color2: "#3a6ab0", pelo: "canoso", barba: "larga", colorPelo: "#e4e6ec" },
};
