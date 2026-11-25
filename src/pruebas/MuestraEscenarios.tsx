// HOJA DE MUESTRA (solo para hacerse una idea): escenarios y objetos en el estilo de la especie (colores apagados,
// contorno de tinta, sombra pintada). Cada escenario de verdad se diseña a medida de cada vídeo.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill } from "remotion";
import { bodyFront, Expr, INK, mix, Pen } from "../personaje/toon";
import { PROTAGONISTA, REPARTO, persona, vestir } from "../personaje/especie";

type P2 = [number, number];
const caja = (x: number, y: number, w: number, h: number): P2[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const L = -Math.PI * 0.66; // luz desde arriba a la izquierda
const os = (c: string) => mix(c, "#000000", 0.25);

/** pinta una forma con sombra pintada y contorno */
const forma = (p: Pen, pts: P2[], c: string, ol = 4, r = 200) => { p.shadedFill(pts, c, os(c), L, r, 0.4); p.poly(pts, null, ol); };
const texto = (g: CanvasRenderingContext2D, t: string, x: number, y: number, tam: number, col = INK) => {
  g.font = `bold ${tam}px sans-serif`; g.fillStyle = col; g.textAlign = "center"; g.fillText(t, x, y);
};
/** personaje del kit a una escala, con los pies en (x, y) */
const gente = (g: CanvasRenderingContext2D, o: ReturnType<typeof vestir>, x: number, y: number, k: number, expr: Expr, seed = 3) => {
  g.save(); g.translate(x - 300 * k, y - 975 * k); g.scale(k, k);
  bodyFront(new Pen(g), o, { mode: "stand", expr, seed, blink: false });
  g.restore();
};

// ---------------------------------------------------------------- escenarios (paneles de 600 x 430)
const banco = (g: CanvasRenderingContext2D, p: Pen) => {
  forma(p, caja(0, 0, 600, 330), "#9fb8b0", 0, 600);
  for (const x of [40, 520]) { forma(p, caja(x, 40, 40, 290), "#e6dcc6"); forma(p, caja(x - 8, 30, 56, 16), "#d8ccb2"); } // columnas
  forma(p, caja(170, 30, 260, 50), "#2f5f6a"); texto(g, "BANCO", 300, 68, 34, "#f1efe9");
  p.ell(470, 120, 26, 26, "#f1efe9", 4); p.stroke([[470, 120], [470, 104]], 3); p.stroke([[470, 120], [482, 126]], 3); // reloj
  forma(p, caja(0, 330, 600, 100), "#b49a72", 0, 600);
  for (let x = 0; x < 600; x += 60) p.stroke([[x, 330], [x - 20, 430]], 2, "#9a8260");
  gente(g, vestir(REPARTO.banquero), 300, 360, 0.3, "smile", 5);
  forma(p, caja(110, 230, 380, 130), "#7a5232"); // mostrador
  forma(p, caja(100, 220, 400, 18), "#5e3d24");
  for (const x of [160, 440]) forma(p, caja(x - 40, 140, 80, 82), "#cfe3e6", 3, 80); // ventanillas
  for (const x of [160, 440]) for (const k of [-20, 0, 20]) p.stroke([[x + k, 142], [x + k, 220]], 2.5);
  gente(g, vestir(PROTAGONISTA), 90, 420, 0.3, "nervous");
};
const calle = (g: CanvasRenderingContext2D, p: Pen) => {
  forma(p, caja(0, 0, 600, 300), "#bcd3dc", 0, 600);
  const edif: [number, number, number, string][] = [[0, 70, 150, "#c98a5e"], [150, 30, 140, "#d9b483"], [290, 90, 150, "#8fa98a"], [440, 50, 160, "#b97a7a"]];
  for (const [x, y, w, c] of edif) {
    forma(p, caja(x, y, w, 300 - y), c);
    for (let yy = y + 25; yy < 240; yy += 55) for (let xx = x + 20; xx < x + w - 30; xx += 45) forma(p, caja(xx, yy, 26, 32), "#e9eef0", 3, 40);
  }
  forma(p, caja(300, 215, 130, 85), "#f1efe9"); forma(p, caja(290, 200, 150, 22), "#c0504a"); texto(g, "TIENDA", 365, 218, 18, "#fff");
  forma(p, caja(0, 300, 600, 50), "#d6cbb8", 0, 600); forma(p, caja(0, 350, 600, 80), "#6d6f76", 0, 600);
  for (let x = 20; x < 600; x += 110) p.band([[x, 392], [x + 50, 392]], "#e8e3d6", 6, 0);
  p.stroke([[540, 300], [540, 150]], 8); p.ell(540, 148, 18, 12, "#f3d98a", 3); // farola
  gente(g, persona(3), 90, 330, 0.24, "smile", 21);
  gente(g, persona(8), 470, 330, 0.24, "neutral", 26);
  gente(g, vestir(PROTAGONISTA), 215, 345, 0.27, "grin");
};
const despacho = (g: CanvasRenderingContext2D, p: Pen) => {
  forma(p, caja(0, 0, 600, 330), "#d8c7a6", 0, 600);
  forma(p, caja(60, 50, 200, 150), "#9fc3d6"); // ventana con ciudad
  p.clip(caja(60, 50, 200, 150), () => { for (const [x, h] of [[70, 80], [110, 120], [160, 60], [200, 100]]) forma(p, caja(x, 200 - h, 36, h), "#6f8ca0", 2, 60); });
  p.stroke([[160, 50], [160, 200]], 4); p.stroke([[60, 125], [260, 125]], 4);
  forma(p, caja(360, 40, 200, 16), "#7a5232"); forma(p, caja(360, 130, 200, 16), "#7a5232"); // estantería
  for (let i = 0; i < 7; i++) forma(p, caja(370 + i * 26, 56 - (i % 3) * 6 + 18, 20, 56 + (i % 3) * 6 - 18), ["#8c3b4a", "#3f6fb5", "#d9a441", "#5d7a3a"][i % 4], 2, 30);
  forma(p, caja(0, 330, 600, 100), "#8a6a4a", 0, 600);
  gente(g, vestir(REPARTO.jefa), 230, 330, 0.26, "stern", 7);
  forma(p, caja(80, 260, 380, 24), "#5e3d24"); forma(p, caja(100, 284, 22, 120), "#5e3d24"); forma(p, caja(420, 284, 22, 120), "#5e3d24"); // mesa
  forma(p, caja(300, 180, 130, 84), "#2c2b31"); forma(p, caja(308, 188, 114, 64), "#e9f1ea", 2, 60); // pantalla con gráfica
  p.stroke([[316, 240], [345, 226], [370, 232], [410, 198]], 4, "#3f7a50");
  p.ell(500, 300, 40, 14, "#c97a4a", 3); p.ell(500, 260, 34, 40, "#5d8a3a", 3); // planta
};

// ---------------------------------------------------------------- objetos (cada uno en una celda de 300 x 220)
const OBJETOS: [string, (g: CanvasRenderingContext2D, p: Pen) => void][] = [
  ["billete", (g, p) => { forma(p, caja(-80, -40, 160, 80), "#8fb88a"); p.ell(0, 0, 26, 26, "#b8d8b0", 3); texto(g, "$", 0, 12, 34, "#2e5a32"); texto(g, "100", -52, -16, 16, "#2e5a32"); }],
  ["monedas", (g, p) => { for (let i = 0; i < 5; i++) { p.ell(-30, 40 - i * 14, 40, 14, "#d9a441", 3); } p.ell(-30, -16, 40, 14, "#f0c75a", 3); for (let i = 0; i < 3; i++) p.ell(50, 40 - i * 14, 34, 12, "#d9a441", 3); p.ell(50, 12, 34, 12, "#f0c75a", 3); }],
  ["fajo", (g, p) => { for (let i = 0; i < 4; i++) forma(p, caja(-80 + i * 3, 10 - i * 12, 160, 40), "#8fb88a", 3); forma(p, caja(-16, -36, 32, 82), "#e8e3d6", 3); }],
  ["gráfica sube", (g, p) => { p.stroke([[-90, 60], [-90, -60]], 4); p.stroke([[-90, 60], [90, 60]], 4); for (const [x, h, c] of [[-60, 40, "#6aa86a"], [-15, 70, "#6aa86a"], [30, 100, "#3f7a50"]] as [number, number, string][]) forma(p, caja(x, 60 - h, 34, h), c, 3); p.stroke([[-70, 30], [-10, 0], [40, -40], [80, -70]], 5, "#c0504a"); p.poly([[80, -70], [62, -66], [74, -54]], "#c0504a", 2); }],
  ["gráfica cae", (g, p) => { p.stroke([[-90, 60], [-90, -60]], 4); p.stroke([[-90, 60], [90, 60]], 4); p.stroke([[-80, -50], [-30, -30], [10, -40], [70, 40]], 6, "#c0504a"); p.poly([[70, 40], [54, 30], [62, 50]], "#c0504a", 2); }],
  ["hucha", (g, p) => { forma(p, [[-70, -10], [-50, -45], [10, -55], [60, -35], [75, 0], [60, 35], [-50, 40], [-75, 20]], "#e7a3b0"); p.ell(78, -2, 14, 18, "#d98d9c", 3); p.dot(40, -20, 5); forma(p, caja(-20, -52, 40, 8), "#8c3b4a", 2); for (const x of [-45, 35]) forma(p, caja(x, 38, 16, 18), "#d98d9c", 3); }],
  ["cajero", (g, p) => { forma(p, caja(-60, -80, 120, 170), "#6c7079"); forma(p, caja(-44, -62, 88, 54), "#9fd0c8", 3); texto(g, "1234", 0, -28, 18, "#2f5f6a"); for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) forma(p, caja(-36 + c * 26, 4 + r * 20, 20, 14), "#e8e3d6", 2, 20); forma(p, caja(-40, 70, 80, 8), "#26242a", 2); }],
  ["maletín", (g, p) => { forma(p, caja(-80, -36, 160, 100), "#6b4a32"); p.arc(0, -36, 30, 24, 180, 360, 8); forma(p, caja(-80, -10, 160, 10), "#5a3b2a", 2); forma(p, caja(-10, -14, 20, 18), "#d9b45a", 2); }],
  ["tarjeta", (g, p) => { forma(p, [[-90, -50], [90, -50], [90, 50], [-90, 50]], "#3f6fb5"); forma(p, caja(-70, -24, 34, 26), "#d9b45a", 2, 30); texto(g, "•••• 4821", 20, 30, 20, "#e8eef8"); }],
  ["casa (hipoteca)", (g, p) => { forma(p, caja(-60, -10, 120, 80), "#e8d6b0"); forma(p, [[-80, -10], [0, -70], [80, -10]], "#c0504a"); forma(p, caja(-16, 26, 32, 44), "#7a5232", 3); forma(p, caja(26, 6, 24, 24), "#9fd0e0", 3); }],
];

export const MuestraEscenarios: React.FC = () => {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, 1920, 1080);
    g.lineJoin = "round"; g.lineCap = "round";
    const p = new Pen(g);
    const ESC: [string, (g: CanvasRenderingContext2D, p: Pen) => void][] = [["banco", banco], ["calle", calle], ["despacho", despacho]];
    ESC.forEach(([n, fn], i) => {
      const x = 30 + i * 630, y = 50;
      g.save(); g.translate(x, y);
      p.clip(caja(0, 0, 600, 430), () => fn(g, p));
      p.poly(caja(0, 0, 600, 430), null, 6);
      g.restore();
      texto(g, n, x + 300, 38, 30);
    });
    OBJETOS.forEach(([n, fn], i) => {
      const cx = 192 + (i % 5) * 384, cy = 600 + Math.floor(i / 5) * 250;
      g.save(); g.translate(cx, cy); fn(g, p); g.restore();
      texto(g, n, cx, cy + 112, 24);
    });
  }, []);
  return (
    <AbsoluteFill style={{ background: "#efe6d3" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
