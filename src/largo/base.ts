// Herramientas de dibujo del motor 2D (estilo del canal: color plano, sombra pintada, contorno de tinta).
import { bodyFront, Expr, FrontOpts, INK, mix, Outfit, Pen } from "../personaje/toon";

export type P2 = [number, number];
export type G = CanvasRenderingContext2D;
export const L = -Math.PI * 0.66; // luz desde arriba a la izquierda
export const os = (c: string, k = 0.25) => mix(c, "#000000", k);
export const cl = (c: string, k = 0.25) => mix(c, "#ffffff", k);
export const caja = (x: number, y: number, w: number, h: number): P2[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const suave = (x: number) => { const t = clamp(x); return t * t * (3 - 2 * t); };
export const rnd = (s: number, k = 0) => { const x = Math.sin(s * 127.1 + k * 311.7) * 43758.5453; return x - Math.floor(x); };
export { INK, mix };

/** forma con sombra pintada y contorno */
export const forma = (p: Pen, pts: P2[], c: string, ol = 4, r = 220) => { p.shadedFill(pts, c, os(c), L, r, 0.4); if (ol) p.poly(pts, null, ol); };
/** rectángulo con sombra pintada */
export const rect = (p: Pen, x: number, y: number, w: number, h: number, c: string, ol = 4) => forma(p, caja(x, y, w, h), c, ol, Math.max(w, h) * 0.8);
/** degradado vertical (cielos, paredes) */
export const degradado = (g: G, x: number, y: number, w: number, h: number, a: string, b: string) => {
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, a); gr.addColorStop(1, b);
  g.fillStyle = gr; g.fillRect(x, y, w, h);
};
export const FUENTE = "Inter Display Black";
export const MANO = "Patrick Hand";
/** texto escrito a mano (carteles del decorado) */
export const texto = (g: G, t: string, x: number, y: number, tam: number, col = INK, alinea: CanvasTextAlign = "center", gira = 0) => {
  g.save(); g.translate(x, y); g.rotate(gira);
  g.font = `${tam}px "${MANO}", sans-serif`; g.fillStyle = col; g.textAlign = alinea; g.textBaseline = "middle"; g.fillText(t, 0, 0);
  g.restore();
};
/** letras gordas con borde negro (estilo miniatura) */
export const gordo = (g: G, t: string, x: number, y: number, tam: number, col = "#ffd23f", borde?: number) => {
  g.font = `${tam}px "${FUENTE}", sans-serif`; g.textAlign = "center"; g.textBaseline = "middle"; g.lineJoin = "round";
  g.lineWidth = borde ?? Math.max(6, tam * 0.16); g.strokeStyle = INK; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
};
/** personaje del kit con los pies en (x, y) */
export const gente = (g: G, o: Outfit, x: number, y: number, k: number, opts: FrontOpts) => {
  g.save(); g.translate(x - 300 * k, y - 975 * k); g.scale(k, k);
  bodyFront(new Pen(g), o, opts);
  g.restore();
};
export type { Expr };

// ---------------------------------------------------------------- piezas de decorado
export const nube = (p: Pen, x: number, y: number, s: number, c = "#f4f1ea") => {
  const pts: P2[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = (i / 40) * Math.PI * 2, r = 1 + 0.18 * Math.sin(a * 5) ** 2;
    pts.push([x + Math.cos(a) * 90 * s * r, y + Math.min(0.35, Math.sin(a)) * 42 * s * r]);
  }
  forma(p, pts, c, 3 * s, 100 * s);
};
export const nubes = (p: Pen, t: number, ancho: number, y0 = 110, semilla = 1, n = 6, c?: string) => {
  for (let i = 0; i < n; i++) {
    const v = 6 + rnd(semilla, i) * 10, base = rnd(semilla, i + 20) * (ancho + 600);
    const x = ((base + t * v) % (ancho + 600)) - 300;
    nube(p, x, y0 + rnd(semilla, i + 40) * 140, 0.6 + rnd(semilla, i + 60) * 0.7, c);
  }
};
/** colinas onduladas */
export const colinas = (p: Pen, x0: number, x1: number, y: number, amp: number, c: string, semilla = 1, ol = 3) => {
  const pts: P2[] = [[x0, 1080]];
  for (let x = x0; x <= x1; x += 40) pts.push([x, y - amp * (0.5 + 0.5 * Math.sin(x / (230 + semilla * 37) + semilla) * Math.cos(x / 517 + semilla * 2))]);
  pts.push([x1, 1080]);
  forma(p, pts, c, ol, 1400);
};
/** árbol decorativo (otoño de Vermont o pino) */
export const arbolito = (p: Pen, x: number, y: number, s: number, c: string, pino = false, t = 0) => {
  const m = Math.sin(t * 1.3 + x) * 3 * s;
  if (pino) {
    rect(p, x - 8 * s, y - 40 * s, 16 * s, 40 * s, "#6b4a32", 3);
    for (let i = 0; i < 3; i++) forma(p, [[x - (70 - i * 15) * s, y - (40 + i * 55) * s], [x + (70 - i * 15) * s, y - (40 + i * 55) * s], [x + m, y - (130 + i * 60) * s]], c, 3, 120 * s);
    return;
  }
  p.band([[x, y], [x, y - 90 * s]], "#6b4a32", 14 * s, 3);
  const pts: P2[] = [];
  for (let i = 0; i <= 36; i++) { const a = (i / 36) * Math.PI * 2; pts.push([x + m + Math.cos(a) * 70 * s * (1 + 0.1 * Math.sin(a * 6)), y - 150 * s + Math.sin(a) * 78 * s * (1 + 0.1 * Math.cos(a * 5))]); }
  forma(p, pts, c, 3.5, 110 * s);
};
export const ventana = (p: Pen, x: number, y: number, w: number, h: number, luz: string, marco = "#f1efe9", cruz = true) => {
  rect(p, x - 6, y - 6, w + 12, h + 12, marco, 3);
  rect(p, x, y, w, h, luz, 3);
  if (cruz) { p.stroke([[x + w / 2, y], [x + w / 2, y + h]], 4); p.stroke([[x, y + h / 2], [x + w, y + h / 2]], 4); }
};
/** suelo de tablas o baldosas */
export const tablas = (p: Pen, x0: number, x1: number, y0: number, y1: number, c: string, paso = 90) => {
  rect(p, x0, y0, x1 - x0, y1 - y0, c, 0);
  for (let y = y0 + 30; y < y1; y += 34) p.stroke([[x0, y], [x1, y]], 2, os(c, 0.18));
  for (let x = x0; x < x1; x += paso) p.stroke([[x, y0], [x - 60, y1]], 2, os(c, 0.12));
  p.stroke([[x0, y0], [x1, y0]], 5);
};
export const coche = (p: Pen, x: number, y: number, s: number, c: string, capoAbierto = false) => {
  const cu: P2[] = [[x - 150 * s, y - 30 * s], [x - 140 * s, y - 75 * s], [x - 70 * s, y - 85 * s], [x - 40 * s, y - 135 * s], [x + 60 * s, y - 135 * s], [x + 95 * s, y - 85 * s], [x + 150 * s, y - 75 * s], [x + 155 * s, y - 30 * s]];
  forma(p, cu, c, 4, 200 * s);
  forma(p, [[x - 30 * s, y - 88 * s], [x - 10 * s, y - 124 * s], [x + 50 * s, y - 124 * s], [x + 78 * s, y - 88 * s]], "#cfe2e8", 3, 60 * s);
  p.stroke([[x + 20 * s, y - 124 * s], [x + 20 * s, y - 88 * s]], 3);
  if (capoAbierto) forma(p, [[x + 95 * s, y - 85 * s], [x + 150 * s, y - 75 * s], [x + 175 * s, y - 175 * s], [x + 120 * s, y - 170 * s]], os(c, 0.1), 4, 80 * s);
  for (const r of [x - 95 * s, x + 95 * s]) { p.ell(r, y - 28 * s, 30 * s, 30 * s, "#2a2830", 4); p.ell(r, y - 28 * s, 13 * s, 13 * s, "#b9bcc2", 3); }
  p.ell(x + 148 * s, y - 60 * s, 9 * s, 9 * s, "#f3e3a0", 3);
};
