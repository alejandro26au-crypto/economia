// Tipos del motor 2D. Una IDEA es una lista de ESCENAS; cada escena pasa en un LUGAR de la Ciudad Inercia (el
// mundo ilustrado de src/mundo) con personajes de la especie del canal. La cámara se mueve sola (nunca para) y
// entre lugares sigue a un billete que vuela: «sigue el dinero». Todo se ata a PALABRAS del guion.
import type { Signo } from "../personaje/signos";

export type Palabra = { p: string; ini: number; fin: number };

/** Lo que el programa (programa/canal.py) le pasa al vídeo. */
export type PropsVideo = {
  n: number;
  variante: number;
  duracion: number; // segundos de voz
  palabras: Palabra[];
  voz: string | null; // ruta dentro de public/ (o null en modo prueba)
  musica: string | null;
};

/** Palabra del guion: número = índice (lo más seguro); "banco" = la 1ª vez desde que empieza la escena; "banco#2" = la 2ª. */
export type En = string | number;

/** Lugares de la Ciudad Inercia (src/mundo/ciudad.tsx), de izquierda a derecha. */
export type Lugar = "casa" | "banco" | "bolsa" | "mercado" | "puerto" | "cajeros" | "gobierno";

export type Cara = "normal" | "feliz" | "sorpresa" | "triste" | "dormido" | "chulo" | "enfadado" | "risa" | "asustado" | "piensa" | "aburrido";
export type Pose =
  | "bolsillos" | "brazos" | "camina" | "corre" | "senala" | "piensa" | "encoge" | "saluda" | "victoria" | "asustado"
  | "cruza" | "salta" | "mira" | "cabeza" | "agotado";

export type Accion =
  | { en: En; hace: "cara"; cara: Cara }
  | { en: En; hace: "pose"; pose: Pose; hasta?: En }
  | { en: En; hace: "habla"; hasta?: En }
  | { en: En; hace: "signo"; signo: Signo; hasta?: En }
  | { en: En; hace: "va"; x: number; corre?: boolean } // camina (o corre) hasta x (desplazamiento desde el lugar, en px del mundo)
  | { en: En; hace: "mira"; lado: 1 | -1 };

export type Actor = {
  quien: string; // del reparto (src/personaje/reparto.ts): protagonista, banquero, inversor…
  x?: number; // desplazamiento desde el centro del lugar (px del mundo; ±400 cabe en un plano medio)
  fondo?: number; // 0 delante … 1 al fondo del paseo (por defecto 0.4)
  mira?: 1 | -1;
  cara?: Cara;
  pose?: Pose;
  narra?: boolean; // mueve la boca con la voz
  entra?: { en: En; desde: "izq" | "der" | "pop" };
  acciones?: Accion[];
};

/** Lo que se ve dentro de la NUBE de pensamiento (la «pizarra» para explicar con cifras). */
export type Nube =
  | { tipo: "grafico"; titulo: string; valores: number[]; color?: "sube" | "baja"; etiquetas?: string[] }
  | { tipo: "cifra"; texto: string; sub?: string }
  | { tipo: "compara"; a: { texto: string; valor: number }; b: { texto: string; valor: number }; unidad?: string }
  | { tipo: "dinero" }; // la nube llena de billetes, sacos y monedas (como la portada)

export type Rotulo = { en: En; texto: string; hasta?: En; x?: number; y?: number; tam?: number; color?: string; giro?: number };

/** Golpes de pantalla para las frases fuertes. */
export type Golpe =
  | { tipo: "sello"; en: En; texto?: string } // sello «¡PERO!» que cae (marca el giro de la historia)
  | { tipo: "temblor"; en: En; fuerza?: number }
  | { tipo: "zoom"; en: En; a?: number } // acercamiento de golpe
  | { tipo: "lineas"; en: En; hasta?: En } // líneas de concentración (manga)
  | { tipo: "lluvia"; en: En; hasta?: En } // lluvia de billetes
  | { tipo: "flash"; en: En };

/** El contador del bolsillo (esquina de arriba): «TU DINERO» y cómo cambia en cada palabra. */
export type Contador = { titulo?: string; valores: { en: En; valor: number }[]; unidad?: string };

export type TipoPlano = "general" | "edificio" | "medio" | "cerca" | "contra" | "dos" | "detalle";
export type Plano = { en: En; tipo: TipoPlano; a?: string };

export type Escena = {
  desde?: En; // palabra en la que empieza (la primera escena empieza en 0)
  lugar: Lugar;
  nube?: Nube; // si la hay, la cámara sube y entra en la nube de pensamiento (explicación)
  actores?: Actor[];
  planos?: Plano[]; // para forzar planos; si no, la cámara elige sola
  rotulos?: Rotulo[];
  golpes?: Golpe[];
  bolsa?: "sube" | "baja"; // la pantalla de la bolsa
  noche?: boolean;
};

export type Idea = {
  n: number;
  titulo: string;
  contador?: Contador;
  escenas: Escena[];
};
