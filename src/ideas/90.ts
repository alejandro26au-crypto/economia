// Idea 90: EJEMPLO de 15 s para ver la edición del canal (cámara, efectos, subtítulos, rótulos, personaje).
// NO es un guion del canal: solo enseña el estilo. Hecho a partir del borrador automático («canal borrador 90»)
// y retocado a mano. Escenarios nuevos: salon (tu casa) y banco (escenarios-economia.tsx).
import { Idea } from "../motor/tipos";

const YO = { figura: "protagonista", narra: true };

export const idea90: Idea = {
  n: 90,
  titulo: "Prueba del motor",
  escenas: [
    // ¿Sabes cuánto dinero pierdes…? Si guardas 1.000 euros en casa… ¡La inflación se los come!
    {
      escenario: "salon",
      actores: [
        {
          tipo: "bent",
          nombre: "yo",
          x: 0.45,
          z: 0.35,
          mira: 1,
          extra: YO,
          acciones: [
            { en: 0, hace: "pose", pose: "piensa" },
            { en: 0, hace: "cara", cara: "piensa" },
            { en: 8, hace: "signo", signo: "pregunta" },
            { en: 9, hace: "pose", pose: "brazos" },
            { en: 9, hace: "cara", cara: "normal" },
            { en: 11, hace: "va", a: "mesita" },
            { en: 18, hace: "cara", cara: "sorpresa" },
            { en: 20, hace: "signo", signo: "sudor" },
            { en: 20, hace: "cara", cara: "triste" },
            { en: 22, hace: "pose", pose: "cabeza" },
            { en: 22, hace: "cara", cara: "asustado" },
            { en: 22, hace: "signo", signo: "susto" },
          ],
        },
      ],
      planos: [
        { en: 0, tipo: "general", a: "yo" },
        { en: 9, tipo: "lateral", a: "yo" },
        { en: 18, tipo: "cerca", a: "yo" },
        { en: 22, tipo: "cerca", a: "yo" },
      ],
      rotulos: [
        { en: 11, texto: "1.000 €", y: 0.2, tam: 140, hasta: 15 },
        { en: 19, texto: "−300 €", y: 0.2, tam: 160, color: "#b03a2e", hasta: 22 },
        { en: 23, texto: "INFLACIÓN", y: 0.18, tam: 150, hasta: 27 },
      ],
      efectos: [
        { tipo: "zoom", en: 11, a: 1.1 },
        { tipo: "golpe", en: 20, fuerza: 1.1 },
        { tipo: "lineas", en: 22, hasta: 26 },
      ],
    },
    // Y el banco lo sabe. Te paga un interés ridículo mientras presta tu dinero a otros.
    {
      desde: 27,
      escenario: "banco",
      actores: [
        { tipo: "bent", nombre: "banquero", x: 0.62, z: 0.55, mira: -1, cara: "chulo", pose: "cruza", extra: { figura: "banquero" }, acciones: [{ en: 32, hace: "habla", hasta: 37 }, { en: 36, hace: "cara", cara: "risa" }, { en: 36, hace: "pose", pose: "brazos" }, { en: 38, hace: "signo", signo: "dinero" }] },
        { tipo: "bent", nombre: "yo", x: 0.3, z: 0.3, mira: 1, extra: YO, acciones: [{ en: 27, hace: "pose", pose: "senala" }, { en: 27, hace: "cara", cara: "enfadado" }, { en: 35, hace: "signo", signo: "enfado" }, { en: 37, hace: "pose", pose: "cruza" }] },
      ],
      planos: [
        { en: 27, tipo: "general", a: "banquero" },
        { en: 32, tipo: "cerca", a: "banquero" },
        { en: 37, tipo: "orbita", a: "yo" },
      ],
      rotulos: [{ en: 35, texto: "INTERÉS: 0,5 %", y: 0.18, tam: 120, hasta: 38 }],
      efectos: [{ tipo: "golpe", en: 29 }, { tipo: "zoom", en: 36, a: 1.12 }],
    },
  ],
};
