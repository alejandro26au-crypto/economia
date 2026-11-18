// Borrador AUTOMÁTICO hecho por «canal borrador 90» a partir del guion. Ajusta escenarios, personajes, acciones,
// rótulos y planos a mano. Las escenas y acciones van por ÍNDICE de palabra del guion (lo más seguro).
import { Idea } from "../motor/tipos";

export const idea90: Idea = {
  n: 90,
  titulo: "Prueba del motor",
  escenas: [
    // 1. ¿Sabes cuánto dinero pierdes cada año sin hacer nada? Si guardas 1.000 euros en casa, en d…
    {
      escenario: "piso",
      actores: [
        { tipo: "bent", nombre: "protagonista", x: 0.32, z: 0.45, mira: 1, extra: {"figura": "protagonista", "narra": true}, acciones: [{"en": 0, "hace": "cara", "cara": "piensa"}, {"en": 0, "hace": "pose", "pose": "piensa"}, {"en": 8, "hace": "signo", "signo": "pregunta"}, {"en": 9, "hace": "cara", "cara": "normal"}, {"en": 9, "hace": "pose", "pose": "brazos"}, {"en": 22, "hace": "cara", "cara": "sorpresa"}, {"en": 22, "hace": "signo", "signo": "exclama"}, {"en": 27, "hace": "cara", "cara": "normal"}, {"en": 27, "hace": "pose", "pose": "brazos"}, {"en": 36, "hace": "cara", "cara": "risa"}, {"en": 36, "hace": "pose", "pose": "brazos"}] },
        { tipo: "bent", nombre: "banquero", x: 0.68, z: 0.45, mira: -1, extra: {"figura": "banquero"}, acciones: [] },
      ],
      rotulos: [{"en": 11, "texto": "1.000 EUROS", "y": 0.2, "tam": 130, "hasta": 19}],
      efectos: [{"tipo": "golpe", "en": 11}],
    },
  ],
};
