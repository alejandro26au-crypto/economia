// Tipos del motor. Una IDEA es una lista de ESCENAS; cada escena pasa en un ESCENARIO 3D (Three.js) con
// personajes 2D dentro. La cámara se mueve sola: cambia de ángulo cada ~2,5 s (siempre al empezar una palabra)
// y solo hay corte de verdad al cambiar de escena. Todo se ata a PALABRAS del guion, así el dibujo va siempre
// al ritmo de la voz, sea cual sea su velocidad.

/** Una palabra del guion con el segundo en que la voz la dice. */
export type Palabra = { p: string; ini: number; fin: number };

/** Lo que el programa (programa/oceano.py) le pasa al vídeo. */
export type PropsShort = {
  n: number;
  variante: number;
  duracion: number; // segundos de voz
  palabras: Palabra[];
  voz: string | null; // ruta dentro de public/ (o null en modo prueba)
  musica: string | null;
};

/**
 * Referencia a una palabra del guion: "corazones" = la primera vez que aparece desde que empieza la escena;
 * "tres#2" = la segunda vez. Un número = índice de la palabra en el guion.
 */
export type En = string | number;

/** Escenarios 3D (src/motor/escenarios.tsx). */
export type Escenario =
  | "barco" | "submarino" | "arrecife" | "profundo" | "naufragio" | "laboratorio" | "palacio" | "piso" | "casa" | "aquarius"
  // vídeo 2 (Proyecto Azorian, 1974)
  | "pacifico" | "pacifico-noche" | "muelle" | "oficina" | "glomar" | "vigia" | "abismo"
  // vídeo 3 (Proyecto Habakkuk, 1942-43)
  | "atlantico" | "atlantico-alba" | "convoy" | "convoy-dia" | "almirantazgo" | "club" | "frigorifico" | "gabinete" | "cristal" | "lago"
  // escenarios nuevos (3D ilustrado con mucho detalle)
  | "fortaleza" | "camarote" | "templo"
  // vídeo del seguro pirata (idea 6)
  | "taberna" | "trono" | "puerto" | "abordaje" | "consejo" | "bodega" | "enfermeria" | "aseguradora"
  // vídeo de las olas monstruo (idea 7)
  | "tormenta" | "academia" | "expediente" | "draupner" | "control" | "espacio" | "bar"
  // vídeo de los submarinos de Holland (idea 8)
  | "astillero" | "astillero-fiesta" | "aula" | "ministerio" | "guarida" | "canal" | "taller" | "bahia" | "nave";

export type Criatura =
  | "bent" // EL PROTAGONISTA: cabeza blanca, gorra azul marino hacia atrás, sudadera negra y mochila
  // el resto de la población: el mismo cuerpo que BENT con otra ropa y accesorios
  | "marinero"
  | "capitan"
  | "rey"
  | "cientifico"
  | "millonario" // traje, sombrero y bigote (el multimillonario que sirve de tapadera)
  | "agente" // traje negro y gafas de sol (CIA)
  | "sovietico" // oficial soviético con abrigo y gorro de piel
  // animales y vehículos (modelos 3D realistas, src/motor/modelos3d.tsx)
  | "gamba"
  | "pulpo"
  | "submarino"
  | "glomar" // el barco «minero» de la CIA (largo = tam)
  | "buque" // barco espía soviético (extra.foco = reflector)
  | "garra" // garra gigante con su tubo (chasca = se cierra)
  | "k129" // submarino soviético (chasca = se parte y la popa cae al fondo)
  | "lata" // lata de refresco (chasca = la presión la aplasta)
  | "nodulo" // nódulo de manganeso
  // vídeo 3 (Proyecto Habakkuk)
  | "inventor" // Geoffrey Pyke: traje de tweed, barba y gafas redondas
  | "almirante" // almirante británico: uniforme azul con galones dorados
  | "churchill" // Churchill: traje oscuro, pajarita de lunares y puro
  | "habakkuk" // el portaaviones de hielo (extra.aviones, extra.noche; chasca = se derrite poco a poco)
  | "uboot" // U-boat alemán tipo VII
  | "carguero" // mercante del convoy (chasca = torpedo: arde y se hunde; extra.luces)
  | "avion" // avión (extra.motores 2 o 4)
  | "titanic" // el Titanic, para comparar tamaños
  | "hielo" // bloque de hielo (chasca = se hace añicos)
  | "pykrete" // bloque de pykrete (chasca = la bala rebota: tiembla y saltan esquirlas)
  | "bala" // bala trazadora
  | "torpedo"
  | "vaso" // vaso de whisky con el portaaviones de cubito
  | "plano" // plano secreto del Habakkuk (tumbado sobre una mesa)
  | "prototipo" // el prototipo del lago Patricia
  | "grieta" // grieta en el hielo (chasca = avanza y se frena en las fibras)
  // vídeo de las olas monstruo (idea 7)
  | "ola" // ola monstruo (chasca = sube, rompe y desaparece; extra.rumbo = hacia dónde avanza, grados)
  | "satelite" // satélite de radar que barre el océano
  // vídeo de los submarinos de Holland (idea 8)
  | "holland" // el Holland VI (extra.ram = Fenian Ram; extra.corte = tanques a la vista; extra.prof/cabecea)
  | "virginia" // submarino moderno clase Virginia
  | "cheque" // cheque gigante de 150.000 $ (chasca = aparece y brilla)
  | "lastre"; // bola de acero (chasca = cae y se hunde; extra.caida en anchos)

/** Postura (elige la imagen de la persona). */
export type Pose =
  | "bolsillos" // de pie, manos en los bolsillos (por defecto)
  | "brazos" // habla gesticulando
  | "camina"
  | "corre"
  | "senala"
  | "piensa"
  | "encoge" // encoge los hombros
  | "saluda"
  | "victoria"
  | "celebra"
  | "asustado"
  | "cruza" // brazos cruzados
  | "salta"
  | "mira"; // mano de visera

export type Cara = "normal" | "feliz" | "sorpresa" | "triste" | "dormido" | "chulo" | "enfadado" | "risa" | "asustado" | "piensa" | "aburrido";

/** Algo que hace un actor a partir de una palabra. */
export type Accion =
  | { en: En; hace: "cara"; cara: Cara }
  | { en: En; hace: "habla"; hasta?: En } // mueve la boca (hasta esa palabra o ~1,5 s)
  | { en: En; hace: "pose"; pose: Pose; hasta?: En } // cambia la postura (hasta esa palabra, o para siempre)
  | { en: En; hace: "salta" | "gira" | "tiembla" | "late" | "brilla" | "encoge" | "crece" | "desaparece" | "chasca" | "rie" | "senala" }
  | { en: En; hace: "mueve"; a: { x?: number; z?: number; alto?: number }; dura?: number }
  | { en: En; hace: "escala"; a: number; dura?: number } // cambia de tamaño (0.5 = a la mitad)
  | { en: En; hace: "mira"; lado: 1 | -1 }
  | { en: En; hace: "va"; a: string }; // camina hasta un punto de interés del escenario y lo mira/señala (puesta.ts)

export type Actor = {
  tipo: Criatura;
  nombre?: string; // para apuntarle con la cámara: planos: [{ en: "…", a: "capi" }]
  x: number; // 0..1 de izquierda a derecha del escenario
  z?: number; // 0..1 de delante (0) a fondo (1) del escenario
  alto?: number; // metros sobre el suelo (para lo que nada o flota)
  tam?: number; // ANCHO en metros (persona ≈ 0.75 y mide ~1,8 m; gamba de verdad ≈ 0.05)
  pose?: Pose; // postura inicial (por defecto: manos en los bolsillos)
  color?: string;
  mira?: 1 | -1; // 1 = a la derecha
  cara?: Cara;
  entra?: { en?: En; desde: "izq" | "der" | "abajo" | "arriba" | "pop" };
  acciones?: Accion[];
  extra?: Record<string, number | string | boolean>; // narra (boca con toda la voz), foco (luz del submarino)…
};

/** Tipos de plano de la cámara. */
export type TipoPlano = "general" | "cerca" | "detalle" | "contrapicado" | "picado" | "lateral" | "orbita";

/** Para forzar un plano en una palabra (si no, la cámara elige sola). a = nombre o índice del actor. */
export type Plano = { en: En; tipo?: TipoPlano; a?: string | number };

export type Efecto =
  | { tipo: "burbujas"; n?: number }
  | { tipo: "rayos"; fuerza?: number }
  | { tipo: "nieve"; n?: number } // nieve marina
  | { tipo: "plancton"; n?: number } // puntitos que brillan
  | { tipo: "banco"; en?: En; color?: string } // banco de peces que cruza
  | { tipo: "destello"; en: En; color?: string }
  | { tipo: "oscuridad"; fuerza: number } // viñeta oscura
  | { tipo: "linterna"; x: number; y: number } // foco de luz en la oscuridad (pantalla 0..1)
  | { tipo: "alarma"; en?: En } // luz roja que gira (interiores)
  // efectos de impacto (pantalla), para dar energía a las frases fuertes:
  | { tipo: "golpe"; en: En; fuerza?: number } // sacudida de cámara + onda blanca + golpe de sonido
  | { tipo: "lineas"; en: En; hasta?: En; color?: string } // líneas de velocidad/concentración (manga)
  | { tipo: "zoom"; en: En; a?: number } // acercamiento de golpe a la cara (1.15 por defecto)
  | { tipo: "chispas"; en: En; x?: number; y?: number; color?: string }; // estallido de chispas

/** Efectos de sonido (public/sfx). Los cambios de cámara y de escena ya suenan solos. */
export type Sonido = "whoosh1" | "whoosh2" | "whoosh3" | "golpe" | "pop" | "boing" | "raro" | "ding" | "chasquido" | "sonar";

export type Rotulo = {
  en: En;
  texto: string;
  x?: number;
  y?: number;
  tam?: number; // alto de letra en px (vídeo 1080x1920)
  color?: string;
  giro?: number;
  hasta?: En;
};

export type Escena = {
  desde?: En; // palabra en la que empieza (la primera escena empieza en el segundo 0)
  escenario: Escenario;
  actores?: Actor[];
  planos?: Plano[];
  efectos?: Efecto[];
  sonidos?: { en: En; s: Sonido; vol?: number }[];
  rotulos?: Rotulo[];
  profundidad?: string; // marcador en una esquina, p. ej. "-40 m"
  paseo?: boolean; // false = los personajes no se mueven solos por el escenario (puesta en escena automática)
};

export type Idea = {
  n: number;
  titulo: string;
  escenas: Escena[];
};
