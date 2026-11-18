// Medidas de cada escenario 3D (en metros). El "escenario" es el rectángulo del suelo donde están los personajes:
// x 0..1 va de izquierda a derecha y z 0..1 de delante hacia el fondo.
import { Escenario } from "./tipos";

export type DatosEscenario = {
  centro: [number, number, number]; // centro del borde DELANTERO del escenario
  ancho: number;
  fondo: number;
  suelo: number; // altura del suelo
  altoMira: number; // a qué altura mira el plano general
  distMax: number; // la cámara no se aleja más que esto
  caja?: [number, number, number, number, number, number]; // límites de la cámara (interiores): x0 y0 z0 x1 y1 z1
  agua: boolean;
  tinte: string; // color de la luz del escenario: los personajes 2D se multiplican por él (blanco = sin cambio)
  nieblaPersonajes: [number, number]; // a qué distancia empiezan / acaban de perderse en la niebla
  lejos?: number; // hasta dónde ve la cámara (por defecto 400 m; mar abierto: más)
  obstaculos?: Obstaculo[]; // cosas grandes que la cámara debe esquivar (columnas, cabina, rocas…)
  puntos?: Record<string, PuntoInteres>; // sitios del decorado a los que los personajes van y con los que interactúan
};

/** Sitio de interés (con `metros: true`, x/z van en METROS del mundo, como el decorado, y se convierten solos): dónde se pone el personaje (x/z del escenario), hacia dónde mira, qué hace al llegar y las
 *  palabras del guion que lo llaman (si una frase dice "map", va al escritorio). */
export type PuntoInteres = { x: number; z: number; metros?: boolean; mira: 1 | -1; pose?: "mira" | "senala" | "piensa" | "brazos" | "cruza" | "saluda" | "asustado" | "encoge"; claves: string[] };

/** Obstáculo para la cámara: cilindro vertical [x, z, radio, alto] en metros (coordenadas del mundo). */
export type Obstaculo = [number, number, number, number];

const ROCAS_PRIMER_PLANO: Obstaculo[] = [
  [-6.5, 5, 2.2, 2],
  [7, 3.5, 2.2, 2],
  [-8, -1, 2.2, 2],
  [8.5, 7, 2.2, 2],
  [-5.8, 4, 0.5, 5],
  [6.4, 6, 0.5, 6],
];

export const DATOS: Record<Escenario, DatosEscenario> = {
  submarino: { centro: [0, 0, 1.1], ancho: 5, fondo: 2.2, suelo: 0, altoMira: 1.3, distMax: 6.4, caja: [-6.2, 0.25, -2.4, 6.2, 4.3, 7.5], agua: false, tinte: "#f4eadb", nieblaPersonajes: [7, 22], obstaculos: [[3.3, -1.1, 0.35, 4.4], [-0.7, -1.9, 0.75, 2.1], [0.7, -1.9, 0.75, 2.1], [-5.6, -1.5, 0.95, 2.4], [5.6, -1.5, 0.95, 2.4], [-4.8, 3.2, 0.3, 5]] },
  arrecife: { centro: [0, 0, 0], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.4, distMax: 16, agua: true, tinte: "#cfe6f4", nieblaPersonajes: [5, 26], obstaculos: [...ROCAS_PRIMER_PLANO, [-3.9, -2.5, 1.5, 0.9], [4, -1.4, 1.1, 0.7]] },
  profundo: { centro: [0, 0, 0], ancho: 8, fondo: 5, suelo: 0, altoMira: 1.6, distMax: 18, agua: true, tinte: "#9fb6dc", nieblaPersonajes: [4, 20], obstaculos: ROCAS_PRIMER_PLANO },
  naufragio: { centro: [0, 0, 2.5], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.6, distMax: 16, agua: true, tinte: "#bcd3ea", nieblaPersonajes: [4, 22], obstaculos: [...ROCAS_PRIMER_PLANO, [-3.6, -1.8, 0.8, 1.2], [2.5, -9, 2.6, 6], [5.9, -6.9, 2.6, 6], [9.3, -4.8, 2.6, 6], [-0.9, -11.1, 2.6, 6], [-4.3, -13.2, 2.6, 6]] },
  barco: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 13, agua: false, tinte: "#f6ece0", nieblaPersonajes: [14, 60], obstaculos: [[-1.4, -6.4, 2.1, 4.2], [1.6, -7.6, 0.95, 3], [-1.4, -6.6, 0.25, 10], [3.6, 3.2, 1.3, 1.6], [-2.8, -2.6, 0.45, 0.9], [-2.3, -3.3, 0.45, 0.9]] },
  laboratorio: { centro: [0, 0, 1], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 8, caja: [-5.6, 0.25, -3.4, 5.6, 4.2, 8], agua: false, tinte: "#f6e9d4", nieblaPersonajes: [9, 30], obstaculos: [[-3.5, -2.4, 1.5, 1.5], [3.6, -2.6, 1.4, 2.5], [-5.6, 0.6, 1.1, 2.7]] },
  palacio: { centro: [0, 0, 1], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.6, distMax: 12, caja: [-7.4, 0.25, -6.5, 7.4, 7, 11], agua: false, tinte: "#f4dcc0", nieblaPersonajes: [10, 35], obstaculos: [[-6, -5, 0.6, 7.8], [-3.6, -5, 0.6, 7.8], [3.6, -5, 0.6, 7.8], [6, -5, 0.6, 7.8], [-6, 0.5, 0.6, 7.8], [-3.6, 0.5, 0.6, 7.8], [3.6, 0.5, 0.6, 7.8], [6, 0.5, 0.6, 7.8], [0, -5.6, 1.2, 3.9], [-4.8, -4, 0.25, 1.6], [4.8, -4, 0.25, 1.6]] },
  piso: { centro: [0, 0, 1.2], ancho: 5, fondo: 2.6, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-5.2, 0.25, -3.3, 5.2, 3.0, 8], agua: false, tinte: "#f6e6d0", nieblaPersonajes: [9, 30], obstaculos: [[3.2, -2.6, 1.3, 1.2], [-4.2, -2.2, 1, 1.2], [1.6, -3.1, 0.3, 1.9]] },
  casa: { centro: [0, 0, 0], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.4, distMax: 16, agua: true, tinte: "#cfe6f4", nieblaPersonajes: [5, 26], obstaculos: [...ROCAS_PRIMER_PLANO, [-3.9, -2.5, 1.5, 0.9], [4, -1.4, 1.1, 0.7], [-2.4, -5.4, 2.4, 2.8], [0.27, -4.93, 0.4, 1.4]] },
  aquarius: { centro: [0, 0, 0], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.8, distMax: 18, agua: true, tinte: "#cfe6f4", nieblaPersonajes: [5, 26], obstaculos: [...ROCAS_PRIMER_PLANO, [-3.9, -2.5, 1.5, 0.9], [4, -1.4, 1.1, 0.7], [1.5, -10, 6, 7]] },
  // vídeo 2 (Proyecto Azorian). En el mar abierto la cámara no baja del agua (caja con y mínima).
  pacifico: { centro: [0, 0, 0], ancho: 120, fondo: 80, suelo: 0, altoMira: 8, distMax: 210, caja: [-900, 1.2, -900, 900, 400, 900], agua: false, tinte: "#ffd9b8", nieblaPersonajes: [200, 700] },
  "pacifico-noche": { centro: [0, 0, 0], ancho: 120, fondo: 80, suelo: 0, altoMira: 8, distMax: 210, caja: [-900, 1.2, -900, 900, 400, 900], agua: false, tinte: "#a8bce0", nieblaPersonajes: [200, 700] },
  muelle: { centro: [0, 0, 1.5], ancho: 6, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 14, agua: false, tinte: "#ffd8b8", nieblaPersonajes: [20, 90], obstaculos: [[-4.6, -2.2, 1.1, 2.4], [-3.2, -2.6, 1.0, 1.2], [-5.4, -0.6, 1.0, 1.2], [-6.5, -3.2, 0.3, 5.2], [6.2, -2.2, 0.3, 5.2]] },
  oficina: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 8, caja: [-5.6, 0.25, -3.6, 5.6, 3.6, 8], agua: false, tinte: "#f2dcc0", nieblaPersonajes: [9, 30], obstaculos: [[-3.2, -1.6, 1.2, 1.0], [4.2, -2.9, 0.9, 1.6], [0, -2.6, 0.5, 1.25]] },
  glomar: { centro: [0, 0, 0], ancho: 6, fondo: 3, suelo: 0, altoMira: 1.6, distMax: 22, agua: false, tinte: "#ffe2c0", nieblaPersonajes: [25, 140], obstaculos: [[-4.3, -5, 0.5, 44], [4.3, -5, 0.5, 44], [-4.3, -13.6, 0.5, 44], [4.3, -13.6, 0.5, 44], [-8.5, -8, 2, 2.4], [8.5, -8, 2, 2.4]] },
  vigia: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 12, agua: false, tinte: "#b8c8e8", nieblaPersonajes: [40, 300], obstaculos: [[-4.2, -2.4, 1.4, 3.5], [4.4, -2.6, 0.3, 9], [-2, -2.9, 0.6, 0.6]] },
  // vídeo 3 (Proyecto Habakkuk). En el mar la cámara no baja del agua.
  atlantico: { centro: [0, 0, 0], ancho: 260, fondo: 160, suelo: 0, altoMira: 14, distMax: 420, caja: [-2000, 2, -2000, 2000, 800, 2000], agua: false, tinte: "#b8d0f0", lejos: 6000, nieblaPersonajes: [400, 1400] },
  "atlantico-alba": { centro: [0, 0, 0], ancho: 260, fondo: 160, suelo: 0, altoMira: 14, distMax: 420, caja: [-2000, 2, -2000, 2000, 800, 2000], agua: false, tinte: "#ffd8c8", lejos: 6000, nieblaPersonajes: [400, 1500] },
  convoy: { centro: [0, 0, 0], ancho: 160, fondo: 100, suelo: 0, altoMira: 8, distMax: 260, caja: [-1500, 1.5, -1500, 1500, 600, 1500], agua: false, tinte: "#b0bcd0", lejos: 5000, nieblaPersonajes: [200, 700] },
  "convoy-dia": { centro: [0, 0, 0], ancho: 160, fondo: 100, suelo: 0, altoMira: 8, distMax: 260, caja: [-1500, 1.5, -1500, 1500, 600, 1500], agua: false, tinte: "#d8dce4", lejos: 5000, nieblaPersonajes: [200, 900] },
  almirantazgo: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 8, caja: [-5.6, 0.25, -6.4, 5.6, 4.1, 6.6], agua: false, tinte: "#f2dcc0", nieblaPersonajes: [9, 30], obstaculos: [[0, -0.45, 1.5, 0.9], [-4.2, -3.8, 1, 1]] },
  club: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 8, caja: [-5.4, 0.25, -6.4, 5.4, 3.5, 6.6], agua: false, tinte: "#f4d4b0", nieblaPersonajes: [9, 30], obstaculos: [[-2.6, -4.6, 0.9, 1.1], [2.6, -4.6, 0.9, 1.1]] },
  frigorifico: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 8, caja: [-5.2, 0.25, -6.0, 5.2, 3.1, 6.2], agua: false, tinte: "#dceeff", nieblaPersonajes: [9, 30], obstaculos: [[-3.6, -2.5, 0.5, 3.4], [3.6, -2.5, 0.5, 3.4]] },
  gabinete: { centro: [0, 0, 1.2], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-4.6, 0.25, -5.0, 4.6, 2.5, 5.2], agua: false, tinte: "#f4dcb8", nieblaPersonajes: [9, 30], obstaculos: [[-1.6, -3.6, 1.2, 1], [-4.8, 0, 0.3, 3], [4.8, 0, 0.3, 3]] },
  cristal: { centro: [0, 0, 0], ancho: 6, fondo: 4, suelo: 0, altoMira: 1.5, distMax: 10, agua: false, tinte: "#d8f0ff", nieblaPersonajes: [6, 30] },
  lago: { centro: [0, 0, 0], ancho: 40, fondo: 30, suelo: 0, altoMira: 3, distMax: 80, caja: [-600, 1.5, -600, 600, 300, 600], agua: false, tinte: "#fff0dc", lejos: 3000, nieblaPersonajes: [90, 500] },
  // escenarios nuevos (3D ilustrado)
  fortaleza: {
    centro: [0, 0, 2.2], ancho: 3.4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 9, caja: [-2.25, 0.3, -24, 2.25, 7, 12], agua: false, tinte: "#e4dcf2", nieblaPersonajes: [30, 120], obstaculos: [[1.9, -3.2, 0.9, 1.3], [-2.0, -5.0, 0.6, 1], [2.0, -9.0, 0.7, 1.6]],
    puntos: {
      canon: { x: 0.79, z: 1.6, mira: 1, pose: "senala", claves: ["cannon", "cannons", "fire", "fired", "shot", "boom", "ball", "gun", "attack"] },
      almenas: { x: 1.15, z: 0.73, mira: 1, pose: "mira", claves: ["sea", "ocean", "water", "waves", "whale", "whales", "fish", "below", "horizon", "yelled", "yell", "scream", "shout"] },
      barriles: { x: 0.14, z: 2.2, mira: -1, pose: "piensa", claves: ["barrel", "barrels", "rum", "drink", "supplies", "food"] },
      pueblo: { x: -0.12, z: 0.5, mira: -1, pose: "mira", claves: ["town", "city", "people", "harbor", "port", "home", "village"] },
      antorcha: { x: -0.1, z: 1.07, mira: -1, pose: "brazos", claves: ["torch", "light", "night", "dark", "flame"] },
    },
  },
  camarote: {
    centro: [0, 0, 1.2], ancho: 3.6, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 6.5, caja: [-4.1, 0.3, -4.0, 4.1, 2.85, 4.2], agua: false, tinte: "#ffe4c4", nieblaPersonajes: [12, 40], obstaculos: [[0, -2.9, 1.4, 1.0], [-3.2, -2.6, 0.6, 1.8], [3.0, -0.6, 0.7, 0.9], [-3.4, 3.5, 0.9, 1.8], [3.6, 3.4, 0.7, 1.3], [0, 0.2, 0.25, 3.2]],
    puntos: {
      escritorio: { x: 0.36, z: 1.15, mira: 1, pose: "piensa", claves: ["map", "maps", "desk", "paper", "write", "wrote", "letter", "candle", "plan", "route"] },
      ventana: { x: -0.05, z: 1.95, mira: -1, pose: "mira", claves: ["sea", "ocean", "window", "moon", "water", "waves", "outside", "seawater", "storm", "gulp"] },
      cofre: { x: 1.1, z: 0.62, mira: 1, pose: "senala", claves: ["treasure", "gold", "coins", "chest", "money", "rich", "salt"] },
      globo: { x: -0.15, z: 1.42, mira: -1, pose: "piensa", claves: ["world", "earth", "globe", "planet", "countries", "map"] },
      timon: { x: 1.42, z: -0.05, mira: 1, pose: "mira", claves: ["ship", "sail", "steer", "wheel", "captain", "crew"] },
      libros: { x: -0.4, z: 0.1, mira: -1, pose: "piensa", claves: ["book", "books", "read", "learn", "science", "history", "kidneys", "body"] },
    },
  },
  templo: {
    centro: [0, 0, 1.6], ancho: 4.2, fondo: 3, suelo: 0, altoMira: 1.6, distMax: 13, agua: true, tinte: "#e6f6fa", nieblaPersonajes: [8, 40], obstaculos: [[-3.4, 3, 0.6, 7], [3.4, 3, 0.6, 7], [-3.4, -1, 0.6, 7], [3.4, -1, 0.6, 3.5], [-3.4, -5, 0.6, 5], [3.4, -5, 0.6, 7], [4.6, 1.2, 1.8, 1], [-6.5, -10, 2.6, 3]],
    puntos: {
      tridente: { x: 0.5, z: 3.9, mira: 1, pose: "mira", claves: ["trident", "altar", "god", "gods", "poseidon", "temple", "power", "atlantis", "found"] },
      estatua: { x: -0.45, z: 3.1, mira: -1, pose: "senala", claves: ["statue", "head", "king", "giant", "face", "plato"] },
      columnas: { x: 1.1, z: 0.95, mira: 1, pose: "mira", claves: ["column", "columns", "stone", "ruins", "built", "city", "ancient", "sank"] },
      anforas: { x: 0.12, z: -0.13, mira: -1, pose: "piensa", claves: ["jar", "jars", "wine", "old", "years", "time", "history"] },
    },
  },
  // vídeo del seguro pirata (idea 6, escenarios-pirata.tsx)
  taberna: {
    centro: [0, 0, 2.2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-4.6, 0.3, -4.2, 4.6, 3.1, 4.2], agua: false, tinte: "#ffe0c0", nieblaPersonajes: [12, 40],
    obstaculos: [[-2, -3.3, 1, 1.2], [0, -3.3, 1, 1.2], [2, -3.3, 1, 1.2], [-2.6, 0.8, 0.8, 1], [2.4, 1.6, 0.8, 1], [-2.2, 3.2, 0.8, 1], [4.6, -0.5, 0.8, 1.7]],
    puntos: {
      barra: { x: 0.58, z: 1.53, mira: 1, pose: "brazos", claves: ["cash", "rum", "drink", "pay", "paid", "money"] },
      pizarra: { x: -0.47, z: 1.13, mira: -1, pose: "senala", claves: ["insurance", "price", "prices", "600", "health", "arm"] },
      chimenea: { x: 1.4, z: 0.87, mira: 1, pose: "mira", claves: ["fire", "warm", "night"] },
    },
  },
  trono: {
    centro: [0, 0, 1.5], ancho: 4, fondo: 4, suelo: 0, altoMira: 1.6, distMax: 12, caja: [-6.6, 0.3, -12.5, 6.6, 6.5, 4.8], agua: false, tinte: "#ffe8c8", nieblaPersonajes: [14, 50],
    obstaculos: [[-4, 2, 0.5, 7], [4, 2, 0.5, 7], [-4, -2.5, 0.5, 7], [4, -2.5, 0.5, 7], [-4, -7, 0.5, 7], [4, -7, 0.5, 7], [0, -11, 2.5, 1], [-2.8, -8.5, 0.7, 0.8], [2.9, -8.8, 0.7, 0.8]],
    puntos: {
      trono: { x: 0.5, z: 2.58, mira: 1, pose: "mira", claves: ["spain", "king", "ruled", "empire", "throne"] },
      cofres: { x: 0.05, z: 2.38, mira: -1, pose: "senala", claves: ["richest", "gold", "silver", "rich", "money"] },
      tapiz: { x: -0.95, z: 0.38, mira: -1, pose: "mira", claves: ["flag", "crown", "royal"] },
    },
  },
  puerto: {
    centro: [-0.5, 0, 2.5], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.5, distMax: 12, caja: [-4.6, 0.3, -20, 2.8, 8, 10], agua: false, tinte: "#ffd8b8", nieblaPersonajes: [30, 120],
    obstaculos: [[-3.2, -2.5, 1.4, 2.6], [-2.5, 1.5, 0.6, 1.4], [-3.3, 0.6, 0.4, 1], [2, -6.8, 0.6, 1], [8.5, -6, 3, 25]],
    puntos: {
      carteles: { x: 0.03, z: 1.3, mira: -1, pose: "senala", claves: ["rats", "rat", "pirates", "wanted", "drunk", "lawless"] },
      galeon: { x: 1.17, z: 1.5, mira: 1, pose: "mira", claves: ["spain", "ship", "ships", "seas", "empire", "navy"] },
      cajas: { x: 0.23, z: 0.43, mira: -1, pose: "piensa", claves: ["cargo", "boxes", "trade"] },
    },
  },
  abordaje: {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.5, distMax: 10, caja: [-3.2, 0.3, -13, 3.2, 9, 6], agua: false, tinte: "#ffc8a0", nieblaPersonajes: [25, 90],
    obstaculos: [[0, -4.5, 0.4, 16], [2.6, 0, 0.7, 1], [2.6, -6, 0.7, 1], [-2.6, -2, 0.7, 1], [-2.6, 3.2, 0.6, 1], [2.7, 3.4, 0.5, 0.8]],
    puntos: {
      borda: { x: 1.0, z: 1.17, mira: 1, pose: "senala", claves: ["fight", "enemy", "attack", "cannon", "everyone", "believed"] },
      mastil: { x: 0.7, z: 1.87, mira: -1, pose: "mira", claves: ["rules", "bosses", "captain"] },
      caos: { x: 0.05, z: 0.5, mira: -1, pose: "asustado", claves: ["himself", "chaos"] },
    },
  },
  consejo: {
    centro: [0, 0, 2.2], ancho: 4, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 8, caja: [-3.7, 0.3, -10, 3.7, 8, 5], agua: false, tinte: "#d8dcf4", nieblaPersonajes: [20, 80],
    obstaculos: [[0, -1.2, 1.8, 1.1], [-1.2, -2.5, 0.5, 1], [0, -2.5, 0.5, 1], [1.2, -2.5, 0.5, 1], [0, -5.5, 0.4, 14]],
    puntos: {
      contrato: { x: 0.6, z: 0.96, mira: -1, pose: "senala", claves: ["contract", "signed", "price", "arm", "leg", "eye", "finger", "body", "parts", "500", "400", "100"] },
      mapa: { x: 0.15, z: 1.0, mira: 1, pose: "piensa", claves: ["voyage", "sat", "sea"] },
    },
  },
  bodega: {
    centro: [0, 0, 2], ancho: 3.6, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-3.2, 0.3, -8.5, 3.2, 3.5, 2.8], agua: false, tinte: "#ffe0b0", nieblaPersonajes: [10, 35],
    obstaculos: [[0.6, -2.5, 1.4, 1], [-1.8, -4.2, 1, 0.7], [2, -0.6, 0.7, 0.8], [-2.2, -1.2, 0.7, 0.8], [2.4, -3.6, 0.5, 1.4]],
    puntos: {
      oro: { x: 0.33, z: 1.38, mira: 1, pose: "senala", claves: ["business", "gold", "rats", "running", "money"] },
      libro: { x: 0.97, z: 2.08, mira: 1, pose: "piensa", claves: ["plan", "benefits", "benefit", "company"] },
      cofre: { x: 0.86, z: 0.83, mira: 1, pose: "mira", claves: ["treasure", "chest"] },
    },
  },
  enfermeria: {
    centro: [0, 0, 1.8], ancho: 3, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 6, caja: [-3.2, 0.3, -3.2, 3.2, 2.6, 3.2], agua: false, tinte: "#f4e6d0", nieblaPersonajes: [10, 35],
    obstaculos: [[0.4, -1.6, 1.1, 1], [-2.4, -1.2, 0.7, 0.8], [2.3, 0.4, 0.6, 1.6], [-2.6, 1.6, 0.7, 1], [2.6, -2.6, 0.5, 1]],
    puntos: {
      libro: { x: -0.13, z: 0.17, mira: -1, pose: "piensa", claves: ["wrote", "1678", "book", "down", "exquemelin", "know"] },
      medicinas: { x: -0.07, z: 1.0, mira: -1, pose: "senala", claves: ["medicine", "chest", "pay"] },
      mesa: { x: 0.63, z: 1.13, mira: 1, pose: "mira", claves: ["surgeon", "real", "deal"] },
    },
  },
  aseguradora: {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.3, distMax: 8, caja: [-5.7, 0.3, -8.7, 5.7, 2.8, 2.8], agua: false, tinte: "#e4ecf6", nieblaPersonajes: [12, 40],
    obstaculos: [[-1.2, -0.6, 1.1, 1.2], [-3.2, -6.5, 1.3, 1.3], [-3.2, -3.5, 1.3, 1.3], [0.2, -6.5, 1.3, 1.3], [0.2, -3.5, 1.3, 1.3], [-5.3, -1.6, 0.8, 1.3], [4.8, 1.5, 0.3, 1.4]],
    puntos: {
      pantalla: { x: 0.23, z: 0.6, mira: 1, pose: "senala", claves: ["insurance", "no", "says", "claim", "denied"] },
      ventana: { x: 1.65, z: 1.33, mira: 1, pose: "mira", claves: ["remember", "time"] },
    },
  },
  // vídeo de las olas monstruo (idea 7, escenarios-olas.tsx)
  tormenta: {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 12, caja: [-2.8, 0.3, -15, 2.8, 12, 9], agua: false, tinte: "#c8d4e4", nieblaPersonajes: [20, 90], lejos: 700,
    obstaculos: [[0, -6, 0.35, 18], [0, -13, 0.7, 1.8], [-2.4, 3.2, 0.5, 1], [-2.5, 2.4, 0.5, 0.7], [2.3, 3.4, 0.5, 0.8], [2.2, -2.8, 0.25, 1.7]],
    puntos: {
      borda: { x: 1.12, z: 0.5, mira: 1, pose: "senala", claves: ["waves", "wave", "giant", "sea", "house", "taller", "wall", "water", "monster", "saw"] },
      mastil: { x: 0.55, z: 2.3, mira: -1, pose: "mira", claves: ["storm", "ship", "sailors", "sailor", "years"] },
      barriles: { x: 0.02, z: -0.15, mira: -1, pose: "piensa", claves: ["rum", "drink", "buy", "liars"] },
    },
  },
  academia: {
    centro: [0, 0, 1.5], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 8, caja: [-5.6, 0.3, -5.6, 5.6, 4.3, 3.7], agua: false, tinte: "#ffe0c0", nieblaPersonajes: [12, 40],
    obstaculos: [[-2.6, -3.6, 0.5, 1.3], [2.4, -3.8, 1.3, 1.2], [-3.9, 0.6, 1.4, 1.3], [3.9, 0.6, 1.4, 1.3], [-5.8, -2.5, 0.6, 3.2], [5.8, -1, 0.6, 3.2]],
    puntos: {
      pizarra: { x: 0.45, z: 2.2, mira: 1, pose: "senala", claves: ["math", "science", "impossible", "period", "wrong", "experts", "called"] },
      tanque: { x: 0.92, z: 1.55, mira: 1, pose: "mira", claves: ["waves", "monster", "real", "big", "those"] },
      ventana: { x: -0.72, z: -0.05, mira: -1, pose: "mira", claves: ["storm", "sailors", "drunk", "rum", "laughed", "stories", "fish"] },
    },
  },
  expediente: {
    centro: [0, 0, 1.2], ancho: 3.6, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-4.7, 0.3, -5.2, 4.7, 3.15, 3.3], agua: false, tinte: "#e0e4e8", nieblaPersonajes: [10, 35],
    obstaculos: [[0, -2.6, 1.4, 1.0], [-4, -4.8, 0.8, 1.4], [3.8, -4.6, 0.6, 2.3], [-4.3, 1.6, 0.3, 2]],
    puntos: {
      tablon: { x: 0.14, z: 2.5, mira: -1, pose: "senala", claves: ["missing", "ship", "lost", "goes"] },
      escritorio: { x: 0.68, z: 1.25, mira: 1, pose: "brazos", claves: ["case", "closed", "blame", "official"] },
      ventana: { x: 1.65, z: 1.1, mira: 1, pose: "mira", claves: ["storm", "storms"] },
    },
  },
  draupner: {
    centro: [0, 0, 2.5], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.6, distMax: 18, caja: [-9, 0.5, -16, 14, 16, 14], agua: false, tinte: "#e8d4c0", nieblaPersonajes: [30, 160], lejos: 1500,
    obstaculos: [[-3.5, -9, 4, 6], [4.5, -11, 0.9, 3], [6.4, -3.4, 0.3, 1.2], [-1.8, 2.6, 0.5, 0.9]],
    puntos: {
      laser: { x: 1.22, z: 1.95, mira: 1, pose: "senala", claves: ["laser", "measuring", "every", "watching"] },
      barandilla: { x: 1.22, z: 0.7, mira: 1, pose: "mira", claves: ["sea", "north", "waves", "wave", "monster", "nowhere", "slammed", "around", "twice"] },
      modulo: { x: 0.3, z: 2.6, mira: -1, pose: "senala", claves: ["gas", "platform", "1995"] },
    },
  },
  control: {
    centro: [0, 0, 1.2], ancho: 3.6, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 6.5, caja: [-4.2, 0.3, -4.7, 4.2, 2.85, 2.8], agua: false, tinte: "#d8f0e8", nieblaPersonajes: [9, 30],
    obstaculos: [[-2.5, -4.2, 0.6, 1.5], [0, -4.3, 0.9, 2.6], [2.5, -4.2, 0.6, 1.5], [3.4, -2.4, 0.6, 1.3], [-2.6, -1.6, 0.8, 0.9]],
    puntos: {
      pantalla: { x: 0.5, z: 1.9, mira: 1, pose: "senala", claves: ["laser", "monster", "caught", "84"] },
      registro: { x: 1.25, z: 1.3, mira: 1, pose: "piensa", claves: ["normal", "waves", "around", "40"] },
      ventana: { x: 1.55, z: 0.5, mira: 1, pose: "mira", claves: ["sea", "rough", "weirder"] },
    },
  },
  espacio: { centro: [0, 0, 0], ancho: 40, fondo: 30, suelo: 0, altoMira: 0, distMax: 60, caja: [-600, -15, -600, 600, 600, 600], agua: false, tinte: "#ffffff", nieblaPersonajes: [800, 3000], lejos: 5000 },
  bar: {
    centro: [0, 0, 1.4], ancho: 3.6, fondo: 2.4, suelo: 0, altoMira: 1.3, distMax: 7, caja: [-4.7, 0.3, -5.2, 4.7, 2.95, 3.3], agua: false, tinte: "#ffd8c0", nieblaPersonajes: [10, 35],
    obstaculos: [[-2, -3.6, 0.8, 1.2], [0, -3.6, 0.8, 1.2], [2, -3.6, 0.8, 1.2], [-2.8, 1.4, 0.7, 0.9], [3.8, -4.6, 0.6, 1.4], [-4.2, -4.6, 0.5, 1]],
    puntos: {
      barra: { x: 0.6, z: 1.65, mira: 1, pose: "brazos", claves: ["drink", "buy", "him"] },
      foto: { x: -0.68, z: 1.4, mira: -1, pose: "senala", claves: ["wave", "wall", "water", "building", "swears", "saw"] },
      ventana: { x: 1.66, z: 0.1, mira: 1, pose: "mira", claves: ["next", "time", "sailor"] },
    },
  },
  // vídeo de los submarinos de Holland (idea 8, escenarios-holland.tsx)
  astillero: {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 16, caja: [-6, 0.4, -14, 9, 12, 9], agua: false, tinte: "#ffd8c0", nieblaPersonajes: [30, 160], lejos: 700,
    obstaculos: [[2.5, 0.8, 0.2, 3.6], [2.5, -6.6, 0.2, 3.6], [-2.6, 1.2, 1.2, 0.6], [-3, 3.8, 0.8, 1], [-3.6, -6, 0.7, 9], [0.6, -8.6, 1.7, 2.8], [-8, -12, 6, 7]],
    puntos: {
      borde: { x: 1.1, z: 0.85, mira: 1, pose: "senala", claves: ["submarine", "floats", "sub", "tons", "should", "sink", "first", "america's"] },
      planchas: { x: 0.1, z: 0.3, mira: -1, pose: "senala", claves: ["steel", "74"] },
      caseta: { x: 0.6, z: 2.6, mira: 1, pose: "mira", claves: ["schoolteacher", "cracked", "laughed"] },
    },
  },
  "astillero-fiesta": {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 16, caja: [-6, 0.4, -14, 9, 12, 9], agua: false, tinte: "#fff0e0", nieblaPersonajes: [30, 160], lejos: 700,
    obstaculos: [[2.5, 0.8, 0.2, 3.6], [2.5, -6.6, 0.2, 3.6], [-2.6, 1.2, 1.2, 0.6], [-3, 3.8, 0.8, 1], [-3.6, -6, 0.7, 9], [0.6, -8.6, 1.7, 2.8], [-8, -12, 6, 7], [-1.6, -4.2, 1.6, 0.4]],
    puntos: {
      borde: { x: 1.1, z: 0.85, mira: 1, pose: "senala", claves: ["submarine", "first", "america's", "weirdest"] },
      tarima: { x: 0.1, z: 2.0, mira: 1, pose: "brazos", claves: ["paid", "dollars", "150000", "same", "laughed"] },
      planchas: { x: 0.1, z: 0.3, mira: -1, pose: "piensa", claves: ["part", "1900"] },
    },
  },
  aula: {
    centro: [0, 0, 1.2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 7, caja: [-5.2, 0.3, -5.2, 5.2, 3.7, 3.2], agua: false, tinte: "#ffdcb8", nieblaPersonajes: [10, 35],
    obstaculos: [[1.4, -3.3, 1.2, 0.9], [-2.6, -1.2, 0.5, 0.8], [-1.3, -1.2, 0.5, 0.8], [-2.6, 0.4, 0.5, 0.8], [-1.3, 0.4, 0.5, 0.8], [3.4, 0.4, 0.5, 0.8], [3.4, -1.2, 0.5, 0.8], [-4.3, -3.8, 0.5, 3.6], [3.6, -4.6, 0.3, 0.8], [-5.2, -0.6, 0.4, 2.2]],
    puntos: {
      pizarra: { x: 0.3, z: 1.87, mira: 1, pose: "senala", claves: ["design", "submarine", "john", "holland"] },
      escritorio: { x: 0.85, z: 1.23, mira: 1, pose: "piensa", claves: ["sends", "letter", "his"] },
      ventana: { x: 1.6, z: 0.73, mira: 1, pose: "mira", claves: ["navy", "us", "1875"] },
    },
  },
  ministerio: {
    centro: [0, 0, 1.2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 7, caja: [-5.2, 0.3, -5.2, 5.2, 4.1, 3.2], agua: false, tinte: "#ffe0c0", nieblaPersonajes: [10, 35],
    obstaculos: [[0, -3.4, 1.5, 1], [0, -4.3, 0.5, 1.4], [-2.6, -2.2, 0.45, 1.4], [3.9, -3.8, 0.9, 1.8], [2.2, -4.6, 0.3, 1.6]],
    puntos: {
      escritorio: { x: 0.725, z: 1.23, mira: -1, pose: "senala", claves: ["answer", "scheme", "fantastic", "landsman", "civilian"] },
      pecera: { x: 0.0, z: 0.9, mira: -1, pose: "senala", claves: ["steel", "sinks", "knew", "everybody", "period"] },
      cuadro: { x: 1.35, z: 1.93, mira: 1, pose: "mira", claves: ["class", "teacher", "back"] },
    },
  },
  guarida: {
    centro: [0, 0, 1.2], ancho: 4, fondo: 2.6, suelo: 0, altoMira: 1.35, distMax: 6.5, caja: [-4.7, 0.3, -4.9, 4.7, 3.1, 3], agua: false, tinte: "#ffd0a8", nieblaPersonajes: [9, 30],
    obstaculos: [[0, -2.6, 1.1, 1.3], [-1.3, -2.2, 0.35, 0.9], [1.3, -2.0, 0.35, 0.9], [4, -4, 0.8, 1], [-4, -4.2, 0.6, 1.8]],
    puntos: {
      mesa: { x: 0.2, z: 1.08, mira: 1, pose: "senala", claves: ["paid", "build", "one", "him", "money"] },
      mapa: { x: 0.95, z: 2.12, mira: 1, pose: "senala", claves: ["british", "warships", "sink"] },
      bandera: { x: 0.1, z: 2.12, mira: -1, pose: "mira", claves: ["irish", "rebels"] },
    },
  },
  canal: {
    centro: [0, 0, 2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 14, caja: [-5, 0.4, -16, 9, 10, 8], agua: false, tinte: "#b0c4ec", nieblaPersonajes: [24, 120], lejos: 700,
    obstaculos: [[-2.8, -0.5, 0.2, 3.6], [-3.5, 2.6, 0.6, 1.5], [-2.6, 3.4, 0.4, 1], [-7, -9, 4.5, 6], [-7, -18, 4.5, 8]],
    puntos: {
      ram: { x: 1.0, z: 1.07, mira: 1, pose: "senala", claves: ["stole", "sub", "drive", "nobody", "backers"] },
      farola: { x: -0.05, z: 0.67, mira: -1, pose: "mira", claves: ["weirder", "got"] },
      almacen: { x: -0.05, z: 2.4, mira: -1, pose: "piensa", claves: ["own", "his"] },
    },
  },
  taller: {
    centro: [0, 0, 1.5], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.45, distMax: 7.5, caja: [-5.2, 0.3, -5.2, 5.2, 4.3, 3.2], agua: false, tinte: "#ffe4c8", nieblaPersonajes: [10, 35],
    obstaculos: [[0.6, -2.2, 1.6, 2.4], [3.6, -2.6, 0.8, 2], [-3.4, -3.4, 1.4, 2.4], [4.3, -4.8, 0.6, 1.3]],
    puntos: {
      tanque: { x: 0.2, z: 0.9, mira: 1, pose: "senala", claves: ["floats", "lighter", "water", "pushes", "flood", "tanks", "dives", "sub"] },
      compresor: { x: 1.2, z: 0.97, mira: 1, pose: "brazos", claves: ["blow", "air", "rises"] },
      banco: { x: -0.15, z: 1.3, mira: -1, pose: "piensa", claves: ["teacher", "right"] },
    },
  },
  bahia: { centro: [0, 0, 0], ancho: 10, fondo: 6, suelo: 0, altoMira: 4, distMax: 30, caja: [-40, 0.6, -40, 40, 13, 30], agua: true, tinte: "#bfeee4", nieblaPersonajes: [10, 60] },
  nave: {
    centro: [0, 0, 4], ancho: 5, fondo: 3, suelo: 0, altoMira: 1.6, distMax: 22, caja: [-28, 0.4, -14, 28, 30, 20], agua: false, tinte: "#dce6ff", nieblaPersonajes: [30, 140],
    obstaculos: [[-40, -17, 4.2, 12], [-27, -17, 4.2, 12], [30, -17, 4.2, 12], [43, -17, 4.2, 12], [7, -2, 1.6, 3], [-8, -8, 1.3, 1.4], [10, -6, 1.3, 1.4], [-12, -4, 1.3, 1.4]],
    puntos: {
      submarino: { x: 0.3, z: 1.0, mira: -1, pose: "mira", claves: ["subs", "builds", "company", "still", "born", "america's"] },
      carretilla: { x: 1.3, z: 1.17, mira: 1, pose: "senala", claves: ["billion", "dollars", "each", "5"] },
      conos: { x: 0.1, z: 0.5, mira: -1, pose: "brazos", claves: ["bad", "landsman", "know"] },
    },
  },
  abismo: { centro: [0, 0, 0], ancho: 9, fondo: 6, suelo: 0, altoMira: 2, distMax: 30, agua: true, tinte: "#9fb4d0", nieblaPersonajes: [6, 40] },
};

/**
 * Posición en METROS del mundo (las mismas cifras que usa el decorado en su .tsx) → x/z del escenario (0..1).
 * En las ideas: `{ tipo: "holland", ...enMetros("taller", 0.6, -2.2), alto: 1.9 }`. Así no hay cuentas a mano.
 */
export function enMetros(nombre: Escenario, x: number, z: number): { x: number; z: number } {
  const d = DATOS[nombre];
  return { x: 0.5 + (x - d.centro[0]) / d.ancho, z: (d.centro[2] - z) / d.fondo };
}

// los puntos de interés escritos en metros pasan a 0..1
for (const nombre of Object.keys(DATOS) as Escenario[])
  for (const pt of Object.values(DATOS[nombre].puntos ?? {}))
    if (pt.metros) {
      Object.assign(pt, enMetros(nombre, pt.x, pt.z));
      pt.metros = false;
    }
