// CAJA DE ATREZO: todas las piezas reutilizables para montar escenarios, en un solo sitio. Para un escenario nuevo
// importa de aquí (import { Farol, Fuego, TCaja, … } from "./atrezo") y copia la PLANTILLA (plantilla-escenario.tsx).
// V3 = [x, y, z] en metros. s = semilla (la pasa el escenario: ({ s }) => …). luz = intensidad de la luz real.
//
// BÁSICO
//   Pieza {forma:{f:"caja"|"bola"|"tubo"|"cono"|"aro"|"roca"|"disco",…}, color, pos, rot, esc, brillo, intensidad,
//         opacidad, basica (sin luz), metal, rugoso}       pieza 3D cualquiera
//   TCaja {t:[w,h,d], pos, rot, map, color}                caja con textura pintada
//   TPlano {w, h, pos, rot, map, color, brillo}            plano con textura (suelos, paredes, cuadros, mapas)
//   Ambiente {niebla:[color, desde, hasta], fondo}         niebla y fondo de la escena (pon uno por escenario)
//   Cielo {arriba, medio, abajo, radio}                    cúpula con degradado (exteriores: radio ≥ 300)
//   Sala {w, d, h, zc, suelo, pared, techo, zocalo}        habitación (suelo con textura, paredes de color)
//   SalaMadera {w, d, h, tono, s}                          habitación toda de madera con vigas
// LUZ (cálida contra fría: 1-3 luces cálidas reales + una fría de luna, agua o ventana)
//   Fuego {pos, tam, luz, s}  Antorcha {pos, luz, s}  Vela {pos, s, luz, botella?: color}
//   Farol {pos, luz, s, cadena, color} (colgante que se mece)  LamparaAceite {pos, s, luz}  LamparaGas {pos, rot, luz, s}
//   LamparaVerde {pos, cable} (banquero)  Farola {pos, luz, s} (de gas, calle)  FocoSodio {pos, luz, rot} (industrial)
//   Resplandor {pos, r, color, o} (halo que brilla)  Halo {pos, r, color, o}  Haz {pos, rot, largo, ancho, color, o} (cono)
//   Luna {pos, r}  Relampago {s, pos, periodo, fuerza}  Rayos3D {s, fuerza, alto, color} (rayos bajo el agua)
// EXTERIOR Y FONDOS
//   Mar {y, color, tam, amp, brillo, ola}  Nubes {s, color, n, y}  Lluvia {s, n, zona, alto}  Estrellas {s, n}
//   Ciudad {pos, s, ancho, n, color, luces} (siluetas con ventanas)  Gaviotas {s, n, centro}  Terreno {color, s, amp, tam}
//   Humo {pos, s, color, tam}  Coral {pos, color, s, tam}
// PUERTO Y BARCOS
//   Bolardo {pos}  Cabo {pos, r} (rollo de cuerda)  Barril {pos, rot}  Caja {pos, tam, rot}  Planchas {pos, rot, n} (acero)
//   Barandilla {pos, largo, rot} (amarilla, industrial)  VelaBarco {pos, ancho, alto, color, s, rot}  Canon {pos, rot, s, dispara}
// INTERIORES
//   Ventana {pos, rot, ancho, alto, cielo}  VentanaVista {pos, rot, ancho, alto, map, luz, intensidad} (con vista pintada)
//   VentanalTormenta {pos, rot, ancho, alto, s}  Cuadro {pos, rot, ancho, alto, map} (marco dorado)
//   Estanteria {pos, rot, ancho, alto, s} (con libros)  Globo {pos, s} (terráqueo)  Pupitre {pos, s, i}  Telefono {pos, color, rot}
//   Letrero {texto, pos, rot, ancho, alto, fondo, tinta}   Bandera {pos, rot, ancho, alto, map, s, mastil}  Banderines {de, a, n, caida}
// TESORO Y MESA
//   Cofre {pos, rot, oro, s, tam}  Monedas {pos, n, radio, alto, s}  Jarra {pos}  Botella {pos, color, alto}
// TEXTURAS PINTADAS (map=…)
//   genéricas: texMadera(tono, sat, luz, tablas, rep) texPiedra(tono, sat, luz, filas, cols, rep) texLosas(tono, sat, luz, rep)
//     texAlfombra(a, b, c) texMoqueta(rep) texMosaico(rep) texLadrillo(tono, rep) texAcero(base, rep) texChapaNave(rep)
//   con historia: texMapa texEstandarte texContrato texWanted(n) texPizarra(lineas) texTapiz texDenegado texNeon(texto, color)
//     texCarpeta texMonitor(lineas, color) texCuadroBarco(n) texBanderaEEUU(estrellas) texBanderaVerde texBilletes
//     texNocheNieve texPlanoSub texCartaNorte texFotoOla texTierra
export { Pieza, Cielo } from "./piezas3d";
export { Ambiente, Terreno, Rayos3D } from "./escenarios";
export { Mar, Estrellas, Halo, Haz, Letrero } from "./escenarios-azorian";
export { Lluvia, Nubes, Sala, LamparaVerde, Telefono } from "./escenarios-habakkuk";
export { TCaja, TPlano, Resplandor, Fuego, Antorcha, Luna, Barril, Caja, Coral } from "./escenarios-nuevos";
export { Farol, Jarra, Botella, Monedas, Cofre, VelaBarco, Humo, Canon, Ventana, SalaMadera } from "./escenarios-pirata";
export { Relampago, Cabo, Estanteria, LamparaGas, VentanalTormenta, Barandilla, FocoSodio } from "./escenarios-olas";
export { Farola, Bandera, Banderines, Cuadro, Bolardo, Planchas, Vela, LamparaAceite, Globo, VentanaVista, Ciudad, Gaviotas, Pupitre } from "./escenarios-holland";
export { texAlfombra, texContrato, texDenegado, texEstandarte, texLosas, texMadera, texMapa, texMoqueta, texMosaico, texPiedra, texPizarra, texTapiz, texWanted } from "./texturas-pintadas";
export { texAcero, texCartaNorte, texFotoOla, texMonitor, texNeon, texTierra, texCarpeta } from "./texturas-olas";
export { texBanderaEEUU, texBanderaVerde, texBilletes, texChapaNave, texCuadroBarco, texLadrillo, texNocheNieve, texPlanoSub } from "./texturas-holland";
