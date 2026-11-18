// Idea 8: Why Don't Submarines Sink (John Holland, el maestro del que se rio la Marina).
// Guion y fuentes en «Textos/8 - Why Don't Submarines Sink.json» (DIB, Wikipedia: Fenian Ram y USS Holland, patente
// US702729, CRS 2026). La voz empieza con «Ever wondered why…?» y cierra con «Now you know.».
// Formato base (vídeos 4 y 5): tono efusivo, golpes/líneas/zoom/rótulos, reparto que camina hacia lo que se nombra.
// Escenarios PROPIOS para cada momento (escenarios-holland.tsx). Las escenas empiezan por ÍNDICE de palabra.
import { Idea } from "../motor/tipos";

const HOLLAND = { narra: true, figura: "maestro" };

export const idea8: Idea = {
  n: 8,
  titulo: "Why Don't Submarines Sink",
  escenas: [
    // GANCHO: en el muelle del astillero al atardecer, el submarino flota junto a Holland
    {
      escenario: "astillero",
      actores: [
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.72,
          z: 0.55,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { ...HOLLAND },
          acciones: [
            { en: "floats", hace: "pose", pose: "senala" },
            { en: "floats", hace: "cara", cara: "sorpresa" },
            { en: "74", hace: "cara", cara: "piensa" },
            { en: "sink", hace: "pose", pose: "encoge" },
            { en: "schoolteacher", hace: "cara", cara: "chulo" },
            { en: "schoolteacher", hace: "pose", pose: "victoria" },
            { en: "laughed", hace: "cara", cara: "enfadado" },
            { en: "laughed", hace: "pose", pose: "cruza" },
          ],
        },
        { tipo: "holland", nombre: "sub", x: 1.85, z: 1.9, alto: -0.75, tam: 16, mira: 1, extra: { rumbo: 90 } },
      ],
      planos: [
        { en: 0, tipo: "general", a: "sub" },
        { en: "74", tipo: "contrapicado", a: "sub" },
        { en: "sink", tipo: "cerca", a: "holland" },
        { en: "schoolteacher", tipo: "contrapicado", a: "holland" },
        { en: "Navy", tipo: "cerca", a: "holland" },
      ],
      efectos: [
        { tipo: "zoom", en: "floats", a: 1.12 },
        { tipo: "golpe", en: "74", fuerza: 1.2 },
        { tipo: "golpe", en: "sink" },
        { tipo: "lineas", en: "Navy", hasta: "him" },
        { tipo: "golpe", en: "him", fuerza: 0.9 },
      ],
      rotulos: [
        { en: 0, texto: "WHY DOES IT FLOAT?", y: 0.14, tam: 110, color: "#9fe8ff", hasta: "74" },
        { en: "74", texto: "74 TONS OF STEEL", y: 0.14, tam: 110, color: "#ffd166", hasta: "A" },
        { en: "schoolteacher", texto: "A SCHOOLTEACHER", y: 0.14, tam: 110, color: "#ffd166", hasta: "Navy" },
        { en: "laughed", texto: "THE NAVY LAUGHED", y: 0.14, tam: 110, color: "#ff8a6b" },
      ],
    },
    // RIVAL: 1875, de noche en el aula de Paterson, Holland escribe a la Marina
    {
      desde: 23, // «1875.»
      escenario: "aula",
      actores: [
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.45,
          z: 1.1,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { ...HOLLAND },
          acciones: [
            { en: "1875", hace: "cara", cara: "piensa" },
            { en: "design", hace: "pose", pose: "senala" },
            { en: "design", hace: "cara", cara: "feliz" },
            { en: "Navy", hace: "pose", pose: "victoria" },
            { en: "Navy", hace: "cara", cara: "chulo" },
          ],
        },
      ],
      planos: [
        { en: "1875", tipo: "general", a: "holland" },
        { en: "John", tipo: "cerca", a: "holland" },
        { en: "design", tipo: "cerca", a: "holland" },
        { en: "Navy", tipo: "contrapicado", a: "holland" },
      ],
      efectos: [
        { tipo: "golpe", en: "1875" },
        { tipo: "lineas", en: "sends", hasta: "Navy" },
        { tipo: "chispas", en: "Navy", x: 0.5, y: 0.35 },
      ],
      rotulos: [
        { en: "1875", texto: "1875", y: 0.14, tam: 170, color: "#ffd166", hasta: "sends" },
        { en: "sends", texto: "TO: THE US NAVY", y: 0.14, tam: 110, color: "#9fe8ff" },
      ],
    },
    // BURLAS + PISTA FALSA: en el despacho de la Marina; el almirante se ríe y suelta la bola de acero en la pecera
    {
      desde: 33, // «Their answer?»
      escenario: "ministerio",
      actores: [
        {
          tipo: "bent",
          nombre: "almirante",
          x: 0.55,
          z: 1.05,
          mira: -1,
          cara: "normal",
          pose: "bolsillos",
          extra: { narra: true, figura: "almirante" },
          acciones: [
            { en: "answer", hace: "cara", cara: "chulo" },
            { en: "fantastic", hace: "pose", pose: "senala" },
            { en: "landsman", hace: "rie" },
            { en: "landsman", hace: "cara", cara: "risa" },
            { en: "Back", hace: "pose", pose: "brazos" },
            { en: "teacher", hace: "cara", cara: "risa" },
            { en: "Everybody", hace: "va", a: "pecera" },
            { en: "steel", hace: "cara", cara: "chulo" },
            { en: "Period", hace: "pose", pose: "cruza" },
            { en: "Period", hace: "cara", cara: "feliz" },
          ],
        },
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.12,
          z: 0.45,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          entra: { en: "Back", desde: "izq" },
          extra: { figura: "maestro", quieto: true },
          acciones: [
            { en: "teacher", hace: "cara", cara: "triste" },
            { en: "sinks", hace: "cara", cara: "enfadado" },
            { en: "Period", hace: "pose", pose: "cruza" },
          ],
        },
        // la bola de acero sobre la pecera: cae y se hunde en «sinks»
        { tipo: "lastre", nombre: "bola", x: -0.15, z: 1.133, alto: 1.6, tam: 0.2, mira: 1, extra: { caida: 3.2 }, acciones: [{ en: "sinks", hace: "chasca" }] },
      ],
      planos: [
        { en: "Their", tipo: "general", a: "almirante" },
        { en: "fantastic", tipo: "contrapicado", a: "almirante" },
        { en: "landsman", tipo: "cerca", a: "almirante" },
        { en: "Back", tipo: "general", a: "holland" },
        { en: "Everybody", tipo: "general", a: "almirante" },
        { en: "steel", tipo: "lateral", a: "almirante" },
        { en: "Period", tipo: "cerca", a: "almirante" },
      ],
      efectos: [
        { tipo: "zoom", en: "answer", a: 1.15 },
        { tipo: "golpe", en: "landsman", fuerza: 1.1 },
        { tipo: "golpe", en: "teacher", fuerza: 0.8 },
        { tipo: "golpe", en: "sinks", fuerza: 1.1 },
        { tipo: "golpe", en: "Period", fuerza: 1.3 },
      ],
      rotulos: [
        { en: "fantastic", texto: "A FANTASTIC SCHEME", y: 0.14, tam: 104, color: "#ff8a6b", hasta: "civilian" },
        { en: "civilian", texto: "CIVILIAN LANDSMAN", y: 0.14, tam: 110, color: "#ffd166", hasta: "Back" },
        { en: "Back", texto: "BACK TO CLASS!", y: 0.14, tam: 120, color: "#ff8a6b", hasta: "Everybody" },
        { en: "steel", texto: "STEEL SINKS", y: 0.14, tam: 140, color: "#9fe8ff", hasta: "Period" },
        { en: "Period", texto: "PERIOD.", y: 0.14, tam: 150, color: "#ff5a5a" },
      ],
    },
    // «THEN SOMETHING WEIRD HAPPENED»: los rebeldes fenianos le pagan para hundir buques británicos
    {
      desde: 51, // «Then something weird happened.»
      escenario: "guarida",
      actores: [
        {
          tipo: "bent",
          nombre: "rebelde",
          x: 0.3,
          z: 1.0,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { narra: true, figura: "rebelde" },
          acciones: [
            { en: "weird", hace: "cara", cara: "chulo" },
            { en: "paid", hace: "pose", pose: "senala" },
            { en: "paid", hace: "cara", cara: "feliz" },
            { en: "sink", hace: "cara", cara: "enfadado" },
            { en: "warships", hace: "pose", pose: "victoria" },
          ],
        },
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.82,
          z: 0.55,
          mira: -1,
          cara: "normal",
          pose: "bolsillos",
          extra: { figura: "maestro", quieto: true },
          acciones: [
            { en: "paid", hace: "cara", cara: "sorpresa" },
            { en: "one", hace: "pose", pose: "brazos" },
            { en: "one", hace: "cara", cara: "feliz" },
            { en: "warships", hace: "cara", cara: "asustado" },
          ],
        },
      ],
      planos: [
        { en: "Then", tipo: "general", a: "rebelde" },
        { en: "Irish", tipo: "cerca", a: "rebelde" },
        { en: "paid", tipo: "contrapicado", a: "rebelde" },
        { en: "sink", tipo: "cerca", a: "rebelde" },
        { en: "warships", tipo: "general", a: "holland" },
      ],
      efectos: [
        { tipo: "zoom", en: "weird", a: 1.12 },
        { tipo: "golpe", en: "paid" },
        { tipo: "lineas", en: "sink", hasta: "Then#2" },
        { tipo: "golpe", en: "warships", fuerza: 1.3 },
      ],
      rotulos: [
        { en: "Irish", texto: "IRISH REBELS", y: 0.14, tam: 120, color: "#7ae08a", hasta: "To" },
        { en: "To", texto: "SINK BRITISH WARSHIPS", y: 0.14, tam: 92, color: "#ff5a5a" },
      ],
    },
    // «THEN IT GOT WEIRDER»: de noche en la dársena, los suyos se llevan el Fenian Ram... y no saben manejarlo
    {
      desde: 66, // «Then it got weirder.»
      escenario: "canal",
      actores: [
        {
          tipo: "bent",
          nombre: "rebelde",
          x: 0.65,
          z: 0.8,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { narra: true, figura: "rebelde" },
          acciones: [
            { en: "weirder", hace: "cara", cara: "chulo" },
            { en: "stole", hace: "pose", pose: "corre", hasta: "Nobody" },
            { en: "stole", hace: "mueve", a: { x: 1.05, z: 1.0 }, dura: 1.2 },
            { en: "stole", hace: "cara", cara: "risa" },
            { en: "Nobody", hace: "pose", pose: "piensa" },
            { en: "Nobody", hace: "cara", cara: "piensa" },
            { en: "drive", hace: "pose", pose: "encoge" },
            { en: "drive", hace: "cara", cara: "triste" },
          ],
        },
        {
          tipo: "bent",
          nombre: "rebelde2",
          x: 0.15,
          z: 0.5,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { figura: "rebelde", quieto: true },
          acciones: [
            { en: "stole", hace: "cara", cara: "risa" },
            { en: "drive", hace: "cara", cara: "aburrido" },
            { en: "drive", hace: "pose", pose: "cruza" },
          ],
        },
        // el Fenian Ram en su grada
        { tipo: "holland", nombre: "ram", x: 1.65, z: 1.53, alto: 0.25, tam: 9.5, mira: -1, extra: { ram: true } },
      ],
      planos: [
        { en: "Then", tipo: "general", a: "ram" },
        { en: "own", tipo: "cerca", a: "rebelde" },
        { en: "stole", tipo: "lateral", a: "rebelde" },
        { en: "sub", tipo: "contrapicado", a: "ram" },
        { en: "Nobody", tipo: "cerca", a: "rebelde" },
      ],
      efectos: [
        { tipo: "zoom", en: "weirder", a: 1.12 },
        { tipo: "lineas", en: "stole", hasta: "sub" },
        { tipo: "golpe", en: "sub", fuerza: 1.3 },
        { tipo: "golpe", en: "drive", fuerza: 0.8 },
      ],
      rotulos: [
        { en: "stole", texto: "STOLEN!", y: 0.14, tam: 160, color: "#ff5a5a", hasta: "Nobody" },
        { en: "Nobody", texto: "NOBODY COULD DRIVE IT", y: 0.14, tam: 92, color: "#ffd166" },
      ],
    },
    // «THEN THE WEIRDEST PART»: 1900, día de fiesta en el muelle, la misma Marina le paga 150.000 $
    {
      desde: 80, // «Then the weirdest part.»
      escenario: "astillero-fiesta",
      actores: [
        {
          tipo: "bent",
          nombre: "almirante",
          x: 0.25,
          z: 1.4,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { narra: true, figura: "almirante", quieto: true },
          acciones: [
            { en: "same", hace: "cara", cara: "triste" },
            { en: "laughed", hace: "pose", pose: "encoge" },
            { en: "paid", hace: "pose", pose: "senala" },
            { en: "paid", hace: "cara", cara: "feliz" },
            { en: "America's", hace: "pose", pose: "saluda" },
          ],
        },
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.72,
          z: 0.9,
          mira: -1,
          cara: "normal",
          pose: "bolsillos",
          extra: { figura: "maestro", quieto: true },
          acciones: [
            { en: "weirdest", hace: "cara", cara: "piensa" },
            { en: "150,000", hace: "cara", cara: "sorpresa" },
            { en: "150,000", hace: "salta" },
            { en: "dollars", hace: "pose", pose: "celebra" },
            { en: "dollars", hace: "cara", cara: "risa" },
            { en: "submarine", hace: "pose", pose: "victoria" },
          ],
        },
        // el cheque gigante aparece en «150,000»
        { tipo: "cheque", nombre: "cheque", x: 0.48, z: 1.2, alto: 0.9, tam: 1.3, mira: 1, entra: { en: "150,000", desde: "pop" }, acciones: [{ en: "150,000", hace: "chasca" }] },
        { tipo: "holland", nombre: "sub", x: 1.85, z: 1.9, alto: -0.75, tam: 16, mira: 1, extra: { rumbo: 90 } },
      ],
      planos: [
        { en: "Then", tipo: "general", a: "sub" },
        { en: "1900", tipo: "contrapicado", a: "almirante" },
        { en: "laughed", tipo: "cerca", a: "almirante" },
        { en: "150,000", tipo: "cerca", a: "cheque" },
        { en: "dollars", tipo: "cerca", a: "holland" },
        { en: "America's", tipo: "general", a: "sub" },
      ],
      efectos: [
        { tipo: "zoom", en: "weirdest", a: 1.12 },
        { tipo: "golpe", en: "1900" },
        { tipo: "lineas", en: "same", hasta: "150,000" },
        { tipo: "golpe", en: "150,000", fuerza: 1.5 },
        { tipo: "chispas", en: "dollars", x: 0.5, y: 0.35 },
        { tipo: "chispas", en: "submarine", x: 0.5, y: 0.45 },
      ],
      rotulos: [
        { en: "1900", texto: "1900", y: 0.14, tam: 170, color: "#ffd166", hasta: "same" },
        { en: "same", texto: "THE SAME NAVY", y: 0.14, tam: 110, color: "#9fe8ff", hasta: "150,000" },
        { en: "150,000", texto: "$150,000", y: 0.14, tam: 170, color: "#7ae08a", hasta: "America's" },
        { en: "America's", texto: "AMERICA'S FIRST NAVY SUB", y: 0.14, tam: 86, color: "#ffd166" },
      ],
    },
    // GIRO + CIENCIA (1): en el taller, el submarino abierto en el tanque: baja al llenar los tanques, sube con aire
    {
      desde: 98, // «The teacher was right.»
      escenario: "taller",
      actores: [
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.2,
          z: 0.7,
          mira: 1,
          cara: "normal",
          pose: "bolsillos",
          extra: { ...HOLLAND },
          acciones: [
            { en: "right", hace: "pose", pose: "victoria" },
            { en: "right", hace: "cara", cara: "risa" },
            { en: "floats", hace: "cara", cara: "normal" },
            { en: "lighter", hace: "pose", pose: "brazos" },
            { en: "Flood", hace: "pose", pose: "senala" },
            { en: "Flood", hace: "cara", cara: "sorpresa" },
            { en: "Blow", hace: "va", a: "compresor" },
            { en: "rises", hace: "cara", cara: "feliz" },
          ],
        },
        // el submarino abierto en el tanque: flota, baja al llenar los tanques y sube al soplarlos
        {
          tipo: "holland",
          nombre: "maqueta",
          x: 0.65,
          z: 1.233,
          alto: 1.92,
          tam: 2.2,
          mira: 1,
          extra: { corte: true, prof: 0.9 },
          acciones: [
            { en: "Flood", hace: "mueve", a: { alto: 1.0 }, dura: 2.2 },
            { en: "Blow", hace: "chasca" },
            { en: "air", hace: "mueve", a: { alto: 1.92 }, dura: 2 },
          ],
        },
      ],
      planos: [
        { en: "The", tipo: "contrapicado", a: "holland" },
        { en: "floats", tipo: "general", a: "maqueta" },
        { en: "water", tipo: "general", a: "maqueta" },
        { en: "Flood", tipo: "general", a: "maqueta" },
        { en: "dives", tipo: "lateral", a: "holland" },
        { en: "Blow", tipo: "general", a: "maqueta" },
        { en: "rises", tipo: "cerca", a: "holland" },
      ],
      efectos: [
        { tipo: "golpe", en: "right", fuerza: 1.2 },
        { tipo: "chispas", en: "right", x: 0.5, y: 0.35 },
        { tipo: "zoom", en: "lighter", a: 1.12 },
        { tipo: "lineas", en: "Flood", hasta: "dives" },
        { tipo: "golpe", en: "dives" },
        { tipo: "golpe", en: "rises" },
      ],
      rotulos: [
        { en: "teacher", texto: "THE TEACHER WAS RIGHT", y: 0.14, tam: 92, color: "#7ae08a", hasta: "A" },
        { en: "lighter", texto: "LIGHTER THAN THE WATER", y: 0.14, tam: 92, color: "#9fe8ff", hasta: "Flood" },
        { en: "Flood", texto: "FLOOD = DIVE", y: 0.14, tam: 130, color: "#5ab8ff", hasta: "Blow" },
        { en: "Blow", texto: "AIR = RISE", y: 0.14, tam: 130, color: "#ffd166" },
      ],
    },
    // CIENCIA (2): bajo el agua, el Holland baja con las aletas, se para el motor y sube solo
    {
      desde: 125, // «Holland's trick?»
      escenario: "bahia",
      actores: [
        {
          tipo: "holland",
          nombre: "sub",
          x: 0.45,
          z: 0.6,
          alto: 7,
          tam: 16,
          mira: 1,
          extra: { narra: true, prof: 4.5, cabecea: true },
          acciones: [
            { en: "Dive", hace: "mueve", a: { x: 0.7, alto: 2.5 }, dura: 2.2 },
            { en: "dies", hace: "chasca" },
            { en: "pops", hace: "mueve", a: { x: 0.8, alto: 9.5 }, dura: 1.8 },
          ],
        },
      ],
      planos: [
        { en: "Holland's", tipo: "general", a: "sub" },
        { en: "300", tipo: "lateral", a: "sub" },
        { en: "Dive", tipo: "lateral", a: "sub" },
        { en: "Engine", tipo: "cerca", a: "sub" },
        { en: "pops", tipo: "contrapicado", a: "sub" },
      ],
      efectos: [
        { tipo: "zoom", en: "trick", a: 1.12 },
        { tipo: "golpe", en: "300", fuerza: 1.2 },
        { tipo: "lineas", en: "Dive", hasta: "Engine" },
        { tipo: "zoom", en: "dies", a: 1.15 },
        { tipo: "golpe", en: "pops", fuerza: 1.2 },
        { tipo: "chispas", en: "up", x: 0.5, y: 0.4 },
      ],
      rotulos: [
        { en: "300", texto: "300 LB LIGHT", y: 0.14, tam: 140, color: "#ffd166", hasta: "Dive" },
        { en: "Dive", texto: "DIVE ON THE FINS", y: 0.14, tam: 104, color: "#9fe8ff", hasta: "Engine" },
        { en: "Engine", texto: "ENGINE DIES?", y: 0.14, tam: 120, color: "#ff5a5a", hasta: "pops" },
        { en: "pops", texto: "IT POPS BACK UP!", y: 0.14, tam: 110, color: "#7ae08a" },
      ],
    },
    // FINAL: en la nave de hoy, el gigante de 5.000 millones; Holland pequeñito delante. «Now you know.»
    {
      desde: 142, // «The company born from his sub…»
      escenario: "nave",
      actores: [
        {
          tipo: "bent",
          nombre: "holland",
          x: 0.45,
          z: 0.7,
          mira: -1,
          cara: "normal",
          pose: "bolsillos",
          extra: { ...HOLLAND },
          acciones: [
            { en: "company", hace: "pose", pose: "mira" },
            { en: "company", hace: "cara", cara: "sorpresa" },
            { en: "billion", hace: "cara", cara: "sorpresa" },
            { en: "billion", hace: "salta" },
            { en: "Not", hace: "pose", pose: "cruza" },
            { en: "landsman", hace: "cara", cara: "chulo" },
            { en: "Now", hace: "pose", pose: "victoria" },
            { en: "Now", hace: "cara", cara: "risa" },
          ],
        },
        // el submarino clase Virginia sobre sus cunas, detrás
        { tipo: "virginia", nombre: "virginia", x: 0.9, z: 9.33, alto: 7.2, tam: 115, mira: 1 },
        {
          tipo: "bent",
          nombre: "operario",
          x: 0.85,
          z: 0.4,
          mira: -1,
          cara: "normal",
          pose: "bolsillos",
          extra: { figura: "operario", quieto: true },
          acciones: [
            { en: "billion", hace: "pose", pose: "senala" },
            { en: "landsman", hace: "cara", cara: "risa" },
            { en: "know", hace: "rie" },
          ],
        },
      ],
      planos: [
        { en: "The", tipo: "contrapicado", a: "holland" },
        { en: "builds", tipo: "general", a: "virginia" },
        { en: "5", tipo: "cerca", a: "holland" },
        { en: "Not", tipo: "general", a: "operario" },
        { en: "Now", tipo: "cerca", a: "holland" },
      ],
      efectos: [
        { tipo: "lineas", en: "still", hasta: "5" },
        { tipo: "golpe", en: "billion", fuerza: 1.5 },
        { tipo: "chispas", en: "each", x: 0.5, y: 0.35 },
        { tipo: "zoom", en: "landsman", a: 1.12 },
        { tipo: "golpe", en: "Now" },
      ],
      rotulos: [
        { en: "still", texto: "STILL BUILDING AMERICA'S SUBS", y: 0.14, tam: 80, color: "#9fe8ff", hasta: "5" },
        { en: "5", texto: "$5 BILLION EACH", y: 0.14, tam: 130, color: "#7ae08a", hasta: "Not" },
        { en: "Not", texto: "NOT BAD FOR A LANDSMAN", y: 0.14, tam: 86, color: "#ffd166", hasta: "Now" },
        { en: "Now", texto: "NOW YOU KNOW", y: 0.14, tam: 130, color: "#9fe8ff" },
      ],
    },
  ],
};
