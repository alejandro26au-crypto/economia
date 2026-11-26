// ESCENARIOS del vídeo 1 («El conserje que murió con 8 millones»), diseñados a medida. Mundo de 1080 px de alto;
// el ancho lo dice ANCHO_LUGAR. Suelo de los exteriores en y = 860. Todo se mueve un poco (nubes, hojas, luces).
import { Pen } from "../personaje/toon";
import { arbolito, caja, cl, coche, colinas, degradado, forma, G, INK, mix, nubes, os, P2, rect, rnd, tablas, texto, ventana } from "./base";
import { Lugar } from "./tipos";

export const ANCHO_LUGAR: Record<Lugar, number> = {
  pueblo: 3840, camino: 1920, estacion: 1920, gasolinera: 1920, tienda: 2400, casa: 1920, banco: 1920, arbol: 1920,
  wallstreet: 2400, despacho: 1920, mansion: 2400, salon: 1920, pizarra: 1920, duelo: 1920,
};
type Pinta = (g: G, p: Pen, t: number) => void;

const OTONO = ["#c8642f", "#d9a441", "#b8443a", "#e08a3a", "#9a5a2a", "#c98a3e"];

/** casita de madera de Nueva Inglaterra */
const casita = (p: Pen, g: G, x: number, w: number, h: number, c: string, techo: string, cartel?: string, noche = false) => {
  const y = 860;
  rect(p, x, y - h, w, h, c, 4);
  for (let yy = y - h + 22; yy < y; yy += 22) p.stroke([[x + 3, yy], [x + w - 3, yy]], 1.5, os(c, 0.15));
  forma(p, [[x - 20, y - h], [x + w + 20, y - h], [x + w / 2, y - h - w * 0.32]], techo, 4, w);
  const luz = noche ? "#f3d98a" : "#cfe2e8";
  for (let i = 0; i < Math.floor(w / 110); i++) ventana(p, x + 30 + i * 110, y - h + 40, 60, 80, luz);
  rect(p, x + w / 2 - 35, y - 130, 70, 130, os(c, 0.35), 4);
  p.dot(x + w / 2 + 22, y - 65, 5, "#d9b45a");
  if (cartel) { rect(p, x + w / 2 - 150, y - h - 10, 300, 56, "#f1efe9", 4); texto(g, cartel, x + w / 2, y - h + 18, 40); }
};

const pueblo: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 3840, 900, "#9cc3d5", "#e8dcc4");
  nubes(p, t, 3840, 90, 3, 10);
  colinas(p, 0, 3840, 560, 160, "#7c8f6a", 2);
  for (let i = 0; i < 46; i++) arbolito(p, i * 86 + rnd(5, i) * 40, 600 + rnd(6, i) * 40, 0.55 + rnd(7, i) * 0.3, OTONO[i % 6], false, t);
  colinas(p, 0, 3840, 690, 60, "#94a676", 4);
  // iglesia blanca con campanario (Vermont)
  rect(p, 2050, 520, 220, 340, "#f1efe9");
  forma(p, [[2030, 520], [2290, 520], [2160, 420]], "#8c3b4a", 4, 200);
  rect(p, 2125, 300, 70, 140, "#f1efe9"); forma(p, [[2115, 300], [2205, 300], [2160, 170]], "#5d5f66", 4, 100);
  p.ell(2160, 360, 18, 18, "#e9eef0", 3);
  ventana(p, 2120, 600, 80, 130, "#cfe2e8");
  // calle principal
  casita(p, g, 120, 420, 330, "#b8443a", "#5d5f66", "BIBLIOTECA");
  casita(p, g, 600, 300, 270, "#d9b483", "#6b4a32");
  casita(p, g, 960, 520, 380, "#e6dcc6", "#3f5a6a", "HOSPITAL");
  rect(p, 1205, 520, 30, 90, "#c0504a", 0); rect(p, 1175, 550, 90, 30, "#c0504a", 0); // H roja (cartel del hospital)
  casita(p, g, 1540, 380, 300, "#8fa98a", "#5d5f66", "CORREOS");
  casita(p, g, 2380, 360, 260, "#c98a5e", "#6b4a32", "BANCO");
  casita(p, g, 2800, 420, 320, "#9aa9c4", "#3f4a5a");
  casita(p, g, 3280, 480, 280, "#d9a441", "#6b4a32", "ABOGADOS");
  // acera, calzada, farolas y parquímetros
  rect(p, 0, 860, 3840, 50, "#d6cbb8", 0); p.stroke([[0, 860], [3840, 860]], 5);
  rect(p, 0, 910, 3840, 170, "#6d6f76", 0); p.stroke([[0, 910], [3840, 910]], 4);
  for (let x = 40; x < 3840; x += 180) p.band([[x, 1000], [x + 90, 1000]], "#e8e3d6", 8, 0);
  for (let x = 560; x < 3840; x += 640) { p.stroke([[x, 870], [x, 600]], 9); p.ell(x, 598, 24, 16, "#f3d98a", 3); }
  for (const x of [2900, 3050, 3200, 3350, 3500]) { p.stroke([[x, 880], [x, 790]], 7); forma(p, caja(x - 18, 740, 36, 56), "#8d949c", 3, 40); rect(p, x - 10, 752, 20, 14, "#cfe2e8", 2); }
  // hojas que caen
  for (let i = 0; i < 30; i++) {
    const x = (rnd(9, i) * 3840 + Math.sin(t + i) * 40 + t * 20) % 3840, y = (rnd(10, i) * 900 + t * (40 + rnd(11, i) * 30)) % 900;
    forma(p, [[x - 8, y], [x, y - 5], [x + 8, y], [x, y + 5]], OTONO[i % 6], 1.5, 10);
  }
  texto(g, "Brattleboro", 3700, 830, 38, INK, "right");
};

const camino: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 1920, 900, "#a9cfe0", "#f0e6cc");
  nubes(p, t, 1920, 100, 7, 5);
  p.ell(1600, 180, 70, 70, "#f6d77a", 4);
  colinas(p, 0, 1920, 600, 140, "#7c8f6a", 3);
  colinas(p, 0, 1920, 720, 70, "#a3b57c", 6);
  // granja roja y escuelita al fondo
  rect(p, 220, 520, 220, 160, "#b8443a"); forma(p, [[200, 520], [460, 520], [330, 430]], "#5d5f66", 4, 200);
  rect(p, 300, 590, 60, 90, "#f1efe9");
  rect(p, 1450, 560, 200, 130, "#e6dcc6"); forma(p, [[1430, 560], [1670, 560], [1550, 490]], "#8c3b4a", 4, 200);
  rect(p, 1530, 450, 40, 50, "#e6dcc6"); texto(g, "ESCUELA", 1550, 620, 34);
  for (let i = 0; i < 12; i++) arbolito(p, 80 + i * 160, 700, 0.6, OTONO[i % 6], i % 3 === 0, t);
  // camino de tierra
  forma(p, [[0, 860], [1920, 830], [1920, 1080], [0, 1080]], "#c9a978", 4, 1500);
  for (let i = 0; i < 20; i++) p.dot(rnd(3, i) * 1920, 880 + rnd(4, i) * 180, 4, "#a88a5c");
  // valla
  for (let x = 20; x < 1920; x += 120) p.band([[x, 860], [x, 790]], "#d6cbb8", 8, 2);
  p.band([[0, 805], [1920, 800]], "#d6cbb8", 6, 2); p.band([[0, 835], [1920, 830]], "#d6cbb8", 6, 2);
};

const estacion: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 1920, 900, "#b8c9d0", "#e9dcc4");
  nubes(p, t, 1920, 90, 12, 5);
  colinas(p, 0, 1920, 600, 100, "#7c8f6a", 8);
  // edificio de la estación
  rect(p, 1150, 430, 640, 430, "#c98a5e");
  forma(p, [[1120, 430], [1820, 430], [1470, 330]], "#5d5f66", 4, 500);
  rect(p, 1320, 470, 300, 60, "#f1efe9"); texto(g, "ESTACIÓN", 1470, 501, 46);
  for (const x of [1200, 1660]) ventana(p, x, 580, 90, 140, "#cfe2e8");
  rect(p, 1420, 620, 100, 240, os("#c98a5e", 0.4));
  // banderines de bienvenida
  for (let i = 0; i < 14; i++) {
    const x = 1150 + i * 46, y = 400 + Math.sin(i * 0.5) * 6 + Math.sin(t * 2 + i) * 3;
    forma(p, [[x, y], [x + 40, y], [x + 20, y + 40]], ["#b8383a", "#f1efe9", "#2f5fa0"][i % 3], 2, 30);
  }
  // vagón
  rect(p, -20, 560, 900, 260, "#3f5a6a"); rect(p, -20, 540, 900, 30, "#2c3e4a");
  for (let x = 30; x < 860; x += 140) ventana(p, x, 600, 90, 90, "#f3e3a0", "#d9cdb4", false);
  for (const x of [120, 700]) { p.ell(x, 830, 40, 40, "#2a2830", 4); p.ell(x, 830, 15, 15, "#8d949c", 3); }
  tablas(p, 0, 1920, 860, 1080, "#b9a27a", 120);
  // vapor
  for (let i = 0; i < 5; i++) { const k = (t * 0.4 + i / 5) % 1; g.globalAlpha = 0.6 * (1 - k); forma(p, caja(60 + i * 30, 520 - k * 300, 80 + k * 90, 60 + k * 40), "#f1efe9", 0); g.globalAlpha = 1; }
};

const gasolinera: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 1920, 900, "#9cc3d5", "#f2e2c0");
  nubes(p, t, 1920, 90, 15, 5);
  colinas(p, 0, 1920, 640, 90, "#8ea06e", 9);
  // taller con persiana abierta
  rect(p, 980, 380, 860, 480, "#e6dcc6");
  rect(p, 1040, 520, 360, 340, "#4a4c52"); for (let y = 540; y < 860; y += 26) p.stroke([[1045, y], [1395, y]], 2, "#5d6068");
  rect(p, 1460, 560, 300, 200, "#cfe2e8"); p.stroke([[1610, 560], [1610, 760]], 4);
  rect(p, 1000, 400, 820, 90, "#b8383a"); texto(g, "GASOLINA · TALLER", 1410, 446, 64, "#f1efe9");
  // herramientas colgadas y latas de aceite
  for (let i = 0; i < 5; i++) p.stroke([[1080 + i * 60, 560], [1080 + i * 60, 620]], 6, "#9aa1a8");
  for (let i = 0; i < 4; i++) { rect(p, 1480 + i * 70, 800, 50, 60, ["#2f5fa0", "#d9a441", "#3f7a50", "#b8383a"][i], 3); }
  // marquesina y surtidores
  rect(p, 120, 360, 720, 60, "#f1efe9"); p.stroke([[120, 420], [840, 420]], 5);
  for (const x of [200, 760]) p.band([[x, 420], [x, 860]], "#d6cbb8", 18, 3);
  for (const x of [330, 560]) {
    forma(p, caja(x, 620, 110, 240), "#c0504a", 4, 200);
    p.ell(x + 55, 600, 50, 50, "#f1efe9", 4); texto(g, "GAS", x + 55, 600, 34, "#c0504a");
    rect(p, x + 20, 660, 70, 50, "#f3e3a0", 3);
    p.stroke([[x + 110, 700], [x + 140, 720], [x + 150, 820]], 6);
  }
  rect(p, 0, 860, 1920, 220, "#9a9ca3", 0); p.stroke([[0, 860], [1920, 860]], 5);
  for (let i = 0; i < 8; i++) p.ell(200 + i * 230, 960 + (i % 2) * 40, 40, 10, "#55565c", 0);
};

const tienda: Pinta = (g, p, t) => {
  // gran tienda de noche: pared azul fría, lámparas cálidas, estanterías llenas y suelo de baldosas que brilla
  degradado(g, 0, 0, 2400, 860, "#2d3a55", "#45506b");
  for (let x = 120; x < 2400; x += 560) {
    rect(p, x, 90, 300, 220, "#1b2236"); p.ell(x + 220, 160, 26, 26, "#f1efe0", 0); // ventanas con luna
    p.stroke([[x + 150, 90], [x + 150, 310]], 5); p.stroke([[x, 200], [x + 300, 200]], 5);
    for (let i = 0; i < 6; i++) p.dot(x + 30 + rnd(x, i) * 240, 110 + rnd(x, i + 9) * 80, 2.5, "#e9eef0");
  }
  rect(p, 700, 20, 1000, 60, "#8c3b4a"); texto(g, "GRANDES ALMACENES", 1200, 52, 48, "#f3e3a0");
  const colores = ["#3f6fb5", "#d9a441", "#8c3b4a", "#5d7a3a", "#d0703a", "#6e5a9c", "#ecebe6", "#2f7f80"];
  for (let e = 0; e < 4; e++) { // estanterías
    const x = 60 + e * 600;
    rect(p, x, 380, 460, 480, "#6b4a32");
    for (let b = 0; b < 4; b++) {
      const y = 400 + b * 115;
      rect(p, x + 14, y + 95, 432, 14, "#5a3b26", 2);
      for (let i = 0; i < 9; i++) rect(p, x + 22 + i * 47, y + 30 + rnd(e * 9 + b, i) * 20, 38, 65 - rnd(e * 9 + b, i) * 20, colores[(i + b + e) % 8], 2.5);
    }
  }
  // lámparas con cono de luz cálida
  for (let x = 300; x < 2400; x += 600) {
    p.stroke([[x, 0], [x, 330]], 3); forma(p, [[x - 50, 360], [x + 50, 360], [x + 22, 320], [x - 22, 320]], "#d9a441", 3, 60);
    const gr = g.createRadialGradient(x, 360, 10, x, 860, 520); gr.addColorStop(0, "rgba(255,220,140,0.45)"); gr.addColorStop(1, "rgba(255,220,140,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(x - 50, 360); g.lineTo(x + 50, 360); g.lineTo(x + 330, 1080); g.lineTo(x - 330, 1080); g.fill();
  }
  // suelo de baldosas que brilla (recién fregado)
  for (let i = 0; i < 12; i++) for (let j = 0; j < 4; j++) rect(p, i * 200, 860 + j * 60, 200, 60, (i + j) % 2 ? "#c9c2b0" : "#b3ab98", 1.5);
  p.stroke([[0, 860], [2400, 860]], 5);
  for (let i = 0; i < 6; i++) { const x = (i * 410 + t * 25) % 2400; g.globalAlpha = 0.35; p.stroke([[x, 900], [x + 80, 960]], 6, "#ffffff"); g.globalAlpha = 1; }
};

const casa: Pinta = (g, p, t) => {
  // casa de Ronald en invierno: pequeña, con leña apilada y el cochecito de segunda mano
  degradado(g, 0, 0, 1920, 900, "#b8c6d4", "#e9eef0");
  nubes(p, t, 1920, 80, 21, 4, "#f7f7f4");
  colinas(p, 0, 1920, 620, 110, "#e2e8ec", 11);
  for (let i = 0; i < 14; i++) arbolito(p, 60 + i * 140, 700 + (i % 2) * 20, 0.7, "#3f6a4a", true, t);
  rect(p, 560, 470, 560, 390, "#9aa9c4");
  for (let yy = 492; yy < 860; yy += 22) p.stroke([[563, yy], [1117, yy]], 1.5, "#8494ad");
  forma(p, [[530, 470], [1150, 470], [840, 300]], "#5d5f66", 4, 500);
  forma(p, [[540, 470], [1140, 470], [1110, 450], [570, 450]], "#f7f7f4", 3, 400); // nieve en el tejado
  rect(p, 960, 300, 60, 120, "#8c3b4a"); // chimenea con humo
  for (let i = 0; i < 6; i++) { const k = (t * 0.25 + i / 6) % 1; g.globalAlpha = 0.5 * (1 - k); p.ell(990 + k * 60, 290 - k * 230, 22 + k * 40, 18 + k * 30, "#e9eef0", 0); g.globalAlpha = 1; }
  ventana(p, 620, 560, 120, 120, "#f3d98a"); ventana(p, 940, 560, 120, 120, "#f3d98a");
  rect(p, 790, 690, 100, 170, "#6b4a32");
  // leña apilada y tocón
  for (let f = 0; f < 5; f++) for (let i = 0; i < 9 - f; i++) { const x = 1250 + i * 44 + f * 22, y = 840 - f * 40; p.ell(x, y, 22, 20, "#a8743e", 3); p.ell(x, y, 10, 9, "#d9b483", 0); }
  coche(p, 330, 880, 0.9, "#c0504a");
  rect(p, 0, 860, 1920, 220, "#f4f5f2", 0); p.stroke([[0, 860], [1920, 860]], 4);
  for (let i = 0; i < 60; i++) { const x = (rnd(1, i) * 1920 + Math.sin(t + i) * 30) % 1920, y = (rnd(2, i) * 1080 + t * (50 + rnd(3, i) * 40)) % 1080; p.dot(x, y, 4, "#ffffff"); }
};

const banco: Pinta = (g, p) => {
  // cámara acorazada: pared de cajas de seguridad, luz fría y una lámpara cálida sobre la mesa
  degradado(g, 0, 0, 1920, 860, "#5f7280", "#7d8f99");
  for (let i = 0; i < 18; i++) for (let j = 0; j < 9; j++) {
    const x = 40 + i * 104, y = 40 + j * 86;
    rect(p, x, y, 96, 78, j % 2 ? "#b9bcc2" : "#a7adb5", 3);
    p.ell(x + 48, y + 39, 8, 8, "#d9b45a", 2); rect(p, x + 20, y + 10, 56, 14, "#e9eef0", 2);
  }
  rect(p, 0, 820, 1920, 40, "#2c3e4a", 0);
  // puerta redonda de la cámara a la derecha
  p.ell(1700, 470, 250, 250, "#8d949c", 6); p.ell(1700, 470, 190, 190, "#a7adb5", 4);
  for (let a = 0; a < 6; a++) p.stroke([[1700, 470], [1700 + Math.cos(a) * 150, 470 + Math.sin(a) * 150]], 10, "#6c7079");
  p.ell(1700, 470, 40, 40, "#d9b45a", 4);
  // mesa
  forma(p, caja(560, 700, 800, 40), "#7a5232", 4, 600); for (const x of [600, 1300]) rect(p, x, 740, 30, 160, "#5e3d24");
  tablas(p, 0, 1920, 860, 1080, "#4a4c52", 160);
  const gr = g.createRadialGradient(960, 400, 20, 960, 700, 700); gr.addColorStop(0, "rgba(255,220,150,0.35)"); gr.addColorStop(1, "rgba(255,220,150,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
  p.stroke([[960, 0], [960, 250]], 3); forma(p, [[900, 290], [1020, 290], [985, 245], [935, 245]], "#3f7a50", 3, 80);
};

const arbol: Pinta = (g, p, t) => {
  // el campo del ÁRBOL que Ronald nunca cortó: colina con hierba, cielo grande (el árbol lo pinta el objeto «arbol»)
  degradado(g, 0, 0, 1920, 900, "#8fbcd4", "#f3e5c3");
  p.ell(300, 200, 80, 80, "#f6d77a", 4);
  nubes(p, t, 1920, 80, 31, 6);
  colinas(p, 0, 1920, 760, 120, "#9ab27c", 13);
  forma(p, [[0, 900], [500, 860], [960, 840], [1420, 860], [1920, 900], [1920, 1080], [0, 1080]], "#7d9a5c", 5, 1500);
  for (let i = 0; i < 80; i++) { const x = rnd(4, i) * 1920, y = 880 + rnd(5, i) * 190, m = Math.sin(t * 2 + i) * 3; p.stroke([[x, y], [x + m + 4, y - 16]], 3, "#5d7a3a"); }
};

const wallstreet: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 2400, 900, "#a9b8c8", "#d8dde2");
  nubes(p, t, 2400, 60, 41, 6, "#eef0f2");
  const tonos = ["#6c7079", "#55606e", "#7f8794", "#4a5260", "#8d949c"];
  for (let i = 0; i < 14; i++) {
    const x = i * 175 - 20, h = 520 + rnd(8, i) * 380, w = 170;
    rect(p, x, 860 - h, w, h, tonos[i % 5]);
    for (let yy = 860 - h + 30; yy < 820; yy += 46) for (let xx = x + 16; xx < x + w - 20; xx += 34) rect(p, xx, yy, 20, 28, rnd(i, xx + yy) > 0.3 ? "#cfe2e8" : "#f3e3a0", 1.5);
  }
  // columnas de la bolsa
  rect(p, 800, 430, 800, 430, "#e6dcc6");
  forma(p, [[770, 430], [1630, 430], [1200, 300]], "#d6cbb8", 4, 600);
  for (let x = 840; x < 1600; x += 110) { rect(p, x, 470, 50, 390, "#f1efe9", 3); }
  for (let i = 0; i < 4; i++) { const x = 900 + i * 200, y = 300 + Math.sin(t * 2 + i) * 2; p.stroke([[x, 430], [x, 330]], 4); forma(p, [[x, 330], [x + 70, 340 + Math.sin(t * 3 + i) * 6], [x, 370]], "#2f5fa0", 2, 60); }
  rect(p, 60, 700, 220, 60, "#2f5fa0"); texto(g, "WALL ST", 170, 732, 44, "#f1efe9");
  rect(p, 0, 860, 2400, 220, "#8a8d93", 0); p.stroke([[0, 860], [2400, 860]], 5);
};

const despacho: Pinta = (g, p, t) => {
  // despacho de lujo en lo alto de un rascacielos: ventanal con la ciudad, mesa enorme, pantallas con gráficas
  degradado(g, 0, 0, 1920, 860, "#d8c7a6", "#c2ae8a");
  rect(p, 140, 80, 1100, 620, "#9fc3d6");
  p.clip(caja(140, 80, 1100, 620), () => {
    for (let i = 0; i < 12; i++) { const h = 200 + rnd(3, i) * 380; rect(p, 150 + i * 95, 700 - h, 80, h, ["#6f8ca0", "#5b7a90", "#8aa3b4"][i % 3], 2); }
    nubes(p, t, 1300, 120, 51, 3);
  });
  for (const x of [415, 690, 965]) p.stroke([[x, 80], [x, 700]], 8);
  rect(p, 1360, 120, 420, 260, "#26242a"); // pantalla
  const pts: P2[] = []; for (let i = 0; i <= 20; i++) pts.push([1390 + i * 18, 330 - i * 8 - Math.sin(i + t * 2) * 14]);
  p.stroke(pts, 6, "#5fd08a");
  for (let i = 0; i < 4; i++) rect(p, 1380 + i * 100, 450, 80, 120, ["#8c3b4a", "#2f5fa0", "#d9a441", "#3f7a50"][i], 3); // libros
  rect(p, 1360, 570, 420, 16, "#5e3d24");
  tablas(p, 0, 1920, 860, 1080, "#6b4a32", 140);
  forma(p, caja(500, 650, 900, 50), "#4e3320", 4, 800); rect(p, 540, 700, 820, 160, "#5e3d24");
  p.ell(1250, 640, 30, 12, "#d9b45a", 3); rect(p, 1235, 590, 30, 50, "#d9b45a", 3); // trofeo
};

const mansion: Pinta = (g, p, t) => {
  degradado(g, 0, 0, 2400, 900, "#9cc3d5", "#e8e0cc");
  nubes(p, t, 2400, 70, 61, 6);
  colinas(p, 0, 2400, 640, 60, "#7c8f6a", 15);
  // mansión enorme con columnas, dos alas y mil ventanas
  rect(p, 250, 300, 1900, 560, "#ecdfc6");
  forma(p, [[220, 300], [2180, 300], [2000, 200], [400, 200]], "#5d5f66", 4, 1400);
  forma(p, [[900, 310], [1500, 310], [1200, 120]], "#f1efe9", 4, 500);
  for (let x = 940; x < 1480; x += 90) rect(p, x, 330, 40, 530, "#f7f3ea", 3);
  for (let i = 0; i < 14; i++) { const x = 300 + i * 130; if (x > 870 && x < 1500) continue; ventana(p, x, 360, 70, 100, "#cfe2e8"); ventana(p, x, 560, 70, 120, "#cfe2e8"); }
  rect(p, 1140, 680, 120, 180, "#6b4a32");
  for (let i = 0; i < 8; i++) arbolito(p, 120 + i * 300, 880, 0.55, "#4f7a4a", i % 2 === 0, t);
  // fuente
  rect(p, 0, 860, 2400, 220, "#8fb06a", 0); p.stroke([[0, 860], [2400, 860]], 4);
  forma(p, [[1080, 860], [1320, 860], [1420, 1080], [980, 1080]], "#d6cbb8", 3, 300); // camino de entrada
  // fuente a un lado (no detrás de los personajes)
  const fx = 1820;
  p.ell(fx, 960, 200, 46, "#b9bcc2", 4); p.ell(fx, 950, 160, 30, "#8fc3d6", 3);
  for (let i = 0; i < 8; i++) { const k = (t * 1.5 + i / 8) % 1, a = (i / 8) * Math.PI * 2; p.dot(fx + Math.cos(a) * 80 * k, 860 - Math.sin(k * Math.PI) * 90 + 60, 5, "#cfe8f0"); }
  rect(p, fx - 15, 860, 30, 90, "#b9bcc2", 3);
  coche(p, 2250, 1030, 1.1, "#26242a"); coche(p, 420, 1030, 1.1, "#b8383a");
};

const salon: Pinta = (g, p, t) => {
  // TU CASA: piso pequeño de noche, sofá, lámpara cálida, ventana con la ciudad y la nevera con el calendario
  degradado(g, 0, 0, 1920, 860, "#c9b8d8", "#b4a3c4");
  rect(p, 120, 120, 520, 420, "#2d3a55");
  for (let i = 0; i < 8; i++) { const h = 120 + rnd(7, i) * 220; rect(p, 130 + i * 64, 540 - h, 56, h, "#3d4a68", 0); for (let k = 0; k < 6; k++) if (rnd(i, k) > 0.5) rect(p, 140 + i * 64 + (k % 2) * 20, 540 - h + 20 + Math.floor(k / 2) * 40, 12, 16, "#f3d98a", 0); }
  p.stroke([[380, 120], [380, 540]], 8); p.stroke([[120, 330], [640, 330]], 8); rect(p, 104, 104, 552, 452, "#ecebe6", 0); rect(p, 120, 120, 520, 420, "rgba(0,0,0,0)", 6);
  // nevera con calendario
  rect(p, 1580, 280, 260, 580, "#ecebe6"); p.stroke([[1580, 520], [1840, 520]], 5); rect(p, 1800, 340, 14, 120, "#b9bcc2", 2);
  rect(p, 1620, 330, 150, 160, "#f1efe9", 3); rect(p, 1620, 330, 150, 34, "#c0504a", 3); texto(g, "15", 1695, 430, 70, "#c0504a");
  // estantería y planta
  rect(p, 760, 200, 360, 20, "#6b4a32"); for (let i = 0; i < 6; i++) rect(p, 780 + i * 50, 120, 36, 80, ["#3f6fb5", "#d9a441", "#8c3b4a", "#5d7a3a", "#d0703a", "#6e5a9c"][i], 2.5);
  rect(p, 1420, 760, 90, 100, "#c98a5e"); for (let i = 0; i < 5; i++) forma(p, [[1465, 760], [1430 + i * 18, 640 - (i % 2) * 40 + Math.sin(t + i) * 4], [1470 + i * 6, 700]], "#5d7a3a", 3, 60);
  // lámpara de pie con luz cálida
  p.stroke([[1300, 860], [1300, 420]], 7); forma(p, [[1240, 430], [1360, 430], [1330, 360], [1270, 360]], "#d9a441", 4, 80);
  const gr = g.createRadialGradient(1300, 430, 10, 1300, 600, 600); gr.addColorStop(0, "rgba(255,220,140,0.5)"); gr.addColorStop(1, "rgba(255,220,140,0)"); g.fillStyle = gr; g.fillRect(600, 0, 1320, 1080);
  tablas(p, 0, 1920, 860, 1080, "#a8835a", 110);
  // sofá
  forma(p, caja(600, 600, 620, 140), "#3f6fb5", 5, 500); forma(p, caja(560, 700, 700, 140), "#3f6fb5", 5, 600);
  for (const x of [560, 1200]) forma(p, caja(x, 640, 60, 200), os("#3f6fb5", 0.1), 4, 100);
  p.stroke([[910, 610], [910, 730]], 3, os("#3f6fb5", 0.3));
};

const pizarra: Pinta = (g, p) => {
  // pared de papel cálido con cuadrícula: aquí se dibujan las gráficas y las cuentas
  degradado(g, 0, 0, 1920, 1080, "#efe6d2", "#e3d6bb");
  for (let x = 0; x < 1920; x += 60) p.stroke([[x, 0], [x, 1080]], 1.5, "#d8c9aa");
  for (let y = 0; y < 1080; y += 60) p.stroke([[0, y], [1920, y]], 1.5, "#d8c9aa");
  for (let i = 0; i < 300; i++) p.dot(rnd(71, i) * 1920, rnd(72, i) * 1080, 1.6, "#cdbb98");
};

const duelo: Pinta = (g, p, t) => {
  // pantalla partida: a la izquierda el pueblo (cálido), a la derecha Wall Street (frío)
  degradado(g, 0, 0, 960, 1080, "#f0d9a8", "#e3c088");
  degradado(g, 960, 0, 960, 1080, "#9fb1c4", "#7f93a8");
  p.clip(caja(0, 0, 960, 1080), () => { colinas(p, 0, 960, 640, 90, "#b9a26a", 3); for (let i = 0; i < 6; i++) arbolito(p, 80 + i * 170, 700, 0.6, OTONO[i], false, t); casita(p, g, 560, 300, 250, "#b8443a", "#5d5f66"); });
  p.clip(caja(960, 0, 960, 1080), () => { for (let i = 0; i < 7; i++) { const h = 380 + rnd(81, i) * 300; rect(p, 960 + i * 140, 860 - h, 130, h, ["#55606e", "#6c7079", "#4a5260"][i % 3]); for (let y = 860 - h + 30; y < 820; y += 50) rect(p, 985 + i * 140, y, 80, 22, "#cfe2e8", 1.5); } });
  rect(p, 0, 860, 960, 220, "#c9a978", 0); rect(p, 960, 860, 960, 220, "#6d6f76", 0);
  p.stroke([[0, 860], [1920, 860]], 5);
  p.band([[960, 0], [960, 1080]], "#f1efe9", 16, 4);
};

export const LUGARES: Record<Lugar, Pinta> = { pueblo, camino, estacion, gasolinera, tienda, casa, banco, arbol, wallstreet, despacho, mansion, salon, pizarra, duelo };
export const usoMix = mix; // (evita avisos de import sin usar)
export const usoCl = cl;
