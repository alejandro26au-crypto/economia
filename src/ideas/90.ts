// Idea 90: EJEMPLO de 15 s del formato «Sigue el dinero» (no es un guion del canal). Enseña: el contador del
// bolsillo, la cámara que nunca para con «zoom golpe», el sello «¡PERO!», la nube de pensamiento con el gráfico,
// el vuelo del billete de un lugar a otro de la Ciudad Inercia y la lluvia de billetes.
import { Idea } from "../motor/tipos";

export const idea90: Idea = {
  n: 90,
  titulo: "Ejemplo del formato",
  contador: { titulo: "TU DINERO", valores: [{ en: 1, valor: 1000 }, { en: 17, valor: 940 }] },
  escenas: [
    // Tienes 1.000 euros guardados en casa. Parece seguro, ¿verdad?
    {
      lugar: "casa",
      actores: [
        {
          quien: "protagonista",
          x: 120,
          mira: -1,
          narra: true,
          acciones: [
            { en: 1, hace: "cara", cara: "feliz" },
            { en: 1, hace: "pose", pose: "victoria", hasta: 4 },
            { en: 6, hace: "pose", pose: "piensa" },
            { en: 6, hace: "cara", cara: "piensa" },
            { en: 8, hace: "signo", signo: "pregunta" },
          ],
        },
      ],
      planos: [
        { en: 0, tipo: "general" },
        { en: 1, tipo: "medio" },
        { en: 6, tipo: "cerca" },
      ],
      rotulos: [{ en: 1, texto: "1.000 €", hasta: 5, y: 0.22 }],
    },
    // Pero cada año la inflación se come un trozo. (nube con el gráfico)
    {
      desde: 9,
      lugar: "casa",
      nube: { tipo: "grafico", titulo: "LO QUE VALEN TUS 1.000 €", valores: [1000, 985, 968, 955, 940], color: "baja", etiquetas: ["hoy", "1 año", "2", "3", "4"] },
      actores: [{ quien: "protagonista", x: 120, mira: 1, narra: true, cara: "sorpresa", pose: "cabeza", acciones: [{ en: 13, hace: "signo", signo: "sudor" }, { en: 13, hace: "cara", cara: "asustado" }] }],
      golpes: [{ tipo: "sello", en: 9, texto: "¡PERO!" }],
    },
    // Y el banco lo sabe: te paga casi nada mientras presta tu dinero a otros.
    {
      desde: 18,
      lugar: "banco",
      actores: [
        { quien: "protagonista", x: -200, mira: 1, narra: true, acciones: [{ en: 20, hace: "pose", pose: "senala" }, { en: 20, hace: "cara", cara: "enfadado" }, { en: 25, hace: "signo", signo: "enfado" }, { en: 28, hace: "pose", pose: "cruza" }] },
      ],
      planos: [{ en: 23, tipo: "cerca" }],
      rotulos: [{ en: 25, texto: "INTERÉS: 0,5 %", hasta: 27, y: 0.2 }],
      golpes: [{ tipo: "zoom", en: 25, a: 1.12 }, { tipo: "lluvia", en: 28, hasta: 32 }],
    },
  ],
};
