// MOTOR 2D DE VÍDEOS LARGOS (estilo del canal: fondos planos con contorno de tinta y personajes de la especie).
// Una IDEA LARGA es una lista de ESCENAS; cada escena es UN PLANO (cambia en cada idea del guion) que empieza en una
// palabra del guion. Todo se ata a palabras, así el dibujo va al ritmo de la voz. La cámara nunca para: va de `cam`
// a `a` durante la escena (si no hay `a`, se acerca sola un poco) y da golpes de zoom en las palabras fuertes.
import { Expr } from "../personaje/toon";
import { En, Sonido } from "../motor/tipos";

export type Lugar =
  | "pueblo" | "camino" | "estacion" | "gasolinera" | "tienda" | "casa" | "banco" | "arbol" | "wallstreet"
  | "despacho" | "mansion" | "salon" | "pizarra" | "duelo";

export type Quien =
  | "ronald" // Ronald Read mayor: pelo blanco, arrugas, abrigo con imperdibles
  | "ronald_joven" // en la gasolinera: manos con grasa
  | "ronald_nino"
  | "ronald_soldado"
  | "fuscone" // Richard Fuscone: traje marino y corbata roja
  | "tu" // el protagonista del canal
  | "abogado" | "enfermera" | "bibliotecaria" | "empresario" | "banquero" | "actor"
  | "gente"; // persona de relleno (cambia con `semilla`)

export type Modo = "stand" | "stroll" | "sit" | "fall";
export type Cosa = "fregona" | "telefono" | "carta" | "maleta" | "papeles" | "billete";

/** Algo que hace un actor a partir de una palabra. */
export type AccionL = {
  en: En;
  expr?: Expr;
  modo?: Modo;
  x?: number; // anda hasta esta x (mundo) en `dura` segundos
  y?: number;
  dura?: number;
  senala?: boolean; // levanta el brazo (señala / saluda) ~1,6 s
  salta?: boolean;
  tiembla?: boolean;
  cosa?: Cosa | "nada";
  hacha?: boolean; // corta leña
  mira?: -1 | 0 | 1;
};

export type ActorL = {
  quien: Quien;
  semilla?: number;
  x: number; // pies, en coordenadas del mundo (px)
  y: number;
  k?: number; // escala (0.5 ≈ 490 px de alto)
  expr?: Expr;
  modo?: Modo;
  cosa?: Cosa;
  hacha?: boolean;
  mira?: -1 | 0 | 1;
  entra?: En; // aparece en esa palabra (con un pequeño salto)
  sombra?: boolean; // silueta negra (misterio)
  acciones?: AccionL[];
};

/** Objeto animado (src/largo/objetos.ts). Los demás campos dependen del tipo. */
export type ObjetoL = { tipo: string; x: number; y: number; k?: number; en?: En; hasta?: En; delante?: boolean; [clave: string]: unknown };

/** [x, y, zoom]: centro del encuadre en el mundo y zoom (1 = 1920×1080 del mundo en pantalla). */
export type Cam = [number, number, number];

export type RotuloL = {
  en: En;
  texto?: string;
  hasta?: En;
  x?: number;
  y?: number;
  tam?: number;
  color?: string;
  giro?: number;
  /** cifra que crece: de → a en `dura` segundos */
  cuenta?: { de: number; a: number; dura?: number; pre?: string; suf?: string; dec?: number };
};

export type EscenaL = {
  desde?: En;
  lugar: Lugar;
  cam: Cam;
  a?: Cam;
  actores?: ActorL[];
  objetos?: ObjetoL[];
  rotulos?: RotuloL[];
  golpes?: { en: En; z?: number }[];
  sonidos?: { en: En; s: Sonido; vol?: number }[];
  noche?: boolean;
};

export type IdeaLarga = { n: number; titulo: string; largo: true; escenas: EscenaL[] };
