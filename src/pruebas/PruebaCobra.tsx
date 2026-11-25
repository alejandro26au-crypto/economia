// PRUEBA (20 s): el gancho del ensayo «El efecto cobra». Sin voz todavía: subtítulos al ritmo de la locución.
// Escena a medida: el protagonista de noche en su mesa con facturas; la deuda que sube, la hucha que se vacía,
// la calculadora en rojo… y la cobra que sale de su cartera. Cámara siempre en movimiento.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { bodyFront, Expr, INK, mix, Pen } from "../personaje/toon";
import { PROTAGONISTA, vestir } from "../personaje/especie";

type P2 = [number, number];
const caja = (x: number, y: number, w: number, h: number): P2[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const L = -Math.PI * 0.66;
const forma = (p: Pen, pts: P2[], c: string, ol = 5, r = 300) => { p.shadedFill(pts, c, mix(c, "#000000", 0.28), L, r, 0.4); p.poly(pts, null, ol); };
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const PROTA = vestir(PROTAGONISTA);

// subtítulos (texto exacto del guion) con su momento en segundos
const SUBS: [number, number, string][] = [
  [0.2, 2.2, "Intentas salir de deudas…"], [2.2, 4.0, "y cada mes debes más."],
  [4.0, 5.6, "Intentas ahorrar…"], [5.6, 7.2, "y siempre pasa algo."],
  [7.2, 9.8, "Haces cuentas a final de mes, y no salen."],
  [9.8, 12.6, "Y piensas: «el problema soy yo»."],
  [12.6, 13.4, "No."], [13.4, 14.8, "No eres tú."],
  [14.8, 16.8, "Te ha mordido una cobra."], [16.8, 20, "Una cobra invisible que vive en tu cartera."],
];

const rotulo = (g: CanvasRenderingContext2D, t: string, x: number, y: number, tam: number, col = "#ffffff", borde = 10) => {
  g.font = `800 ${tam}px sans-serif`; g.textAlign = "center"; g.lineJoin = "round";
  g.lineWidth = borde; g.strokeStyle = INK; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
};

/** cobra que sale de la cartera: cuerpo en S que se balancea, capucha, ojos y lengua */
const cobra = (g: CanvasRenderingContext2D, p: Pen, x: number, y: number, sube: number, f: number) => {
  if (sube <= 0) return;
  const alto = 330 * sube, n = 24, pts: P2[] = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    pts.push([x + Math.sin(k * 5 + f / 9) * 40 * k * (1 - k * 0.4), y - k * alto]);
  }
  p.band(pts, "#6f8a3a", 46, 6, "round");
  p.stroke(pts.map(([a, b]) => [a + 6, b] as P2), 12, "#c9c98a"); // vientre claro
  const [hx, hy] = pts[n];
  // capucha
  forma(p, [[hx - 70, hy + 30], [hx - 58, hy - 40], [hx, hy - 62], [hx + 58, hy - 40], [hx + 70, hy + 30], [hx, hy + 52]], "#7d9a42", 6, 120);
  p.stroke([[hx - 40, hy + 10], [hx - 30, hy - 20]], 4, "#4f6a2a"); p.stroke([[hx + 40, hy + 10], [hx + 30, hy - 20]], 4, "#4f6a2a");
  forma(p, [[hx - 30, hy - 30], [hx + 30, hy - 30], [hx + 24, hy + 18], [hx - 24, hy + 18]], "#8bab4a", 5, 60); // cabeza
  for (const s of [-1, 1]) { p.ell(hx + s * 14, hy - 12, 9, 11, "#f0d24a", 3); p.ell(hx + s * 14, hy - 12, 2.5, 9, INK, 0); }
  if (Math.sin(f / 3) > 0) p.stroke([[hx, hy + 16], [hx, hy + 40], [hx - 8, hy + 50]], 4, "#d0404a"), p.stroke([[hx, hy + 40], [hx + 8, hy + 50]], 4, "#d0404a");
};

export const PruebaCobra: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, 1920, 1080);
    g.lineJoin = "round"; g.lineCap = "round";
    const p = new Pen(g);
    const t = f / fps;

    // ---------------- cámara: empuje lento hacia él (culpa), golpe hacia atrás en «No.», susto con temblor
    const empuje = interpolate(t, [0, 12.6], [1.0, 1.28], { ...cl, easing: Easing.inOut(Easing.quad) });
    const suelta = interpolate(t, [12.6, 13.1], [0, 1], { ...cl, easing: Easing.out(Easing.back(2)) });
    const zCobra = interpolate(t, [15, 16.5], [0, 0.18], { ...cl, easing: Easing.out(Easing.cubic) });
    const z = empuje + (1.0 - empuje) * suelta + zCobra;
    const tiembla = t > 14.9 && t < 15.8 ? Math.sin(f * 2.3) * 12 * (15.8 - t) : 0;
    const fx = interpolate(t, [0, 12.6, 13.1, 16.5], [960, 900, 960, 1180], cl), fy = interpolate(t, [0, 12.6, 13.1, 16.5], [560, 470, 560, 620], cl);
    g.save();
    g.translate(960 + tiembla, 540 + tiembla * 0.5); g.scale(z, z); g.translate(-fx, -fy);

    // ---------------- habitación de noche: pared azul apagada, ventana con luna, lámpara cálida
    const triste = interpolate(t, [9.8, 12.6, 13.1], [0, 1, 0], cl); // la culpa apaga el color
    const pared = mix("#3d5068", "#2c3340", triste);
    forma(p, caja(-300, -300, 2520, 1100), pared, 0, 2000);
    forma(p, caja(160, 140, 340, 300), "#1d2838", 7, 400); // ventana
    p.ell(400, 220, 34, 34, "#f3e7b8", 4); p.ell(388, 214, 30, 30, "#1d2838", 0);
    for (const [sx, sy] of [[220, 200], [260, 330], [460, 380]] as P2[]) p.dot(sx, sy, 3, "#f3e7b8");
    p.stroke([[330, 140], [330, 440]], 6); p.stroke([[160, 290], [500, 290]], 6);
    // cono de luz cálida de la lámpara
    g.save(); g.globalAlpha = 0.18 * (1 - triste * 0.6);
    p.poly([[1420, 150], [1060, 900], [1780, 900]], "#ffd98a", 0); g.restore();
    p.stroke([[1420, -300], [1420, 120]], 5); forma(p, [[1370, 150], [1470, 150], [1450, 110], [1390, 110]], "#d9a441", 5, 80);
    // calendario en la pared: las hojas pasan mientras sube la deuda
    const mes = Math.min(3, Math.floor(interpolate(t, [0.4, 3.6], [0, 3.99], cl)));
    forma(p, caja(1650, 200, 180, 210), "#f1efe9", 5, 200); forma(p, caja(1650, 200, 180, 50), "#c0504a", 5, 200);
    g.font = "800 30px sans-serif"; g.fillStyle = "#fff"; g.textAlign = "center"; g.fillText(["ENE", "FEB", "MAR", "ABR"][mes], 1740, 236);
    g.font = "900 96px sans-serif"; g.fillStyle = INK; g.fillText("30", 1740, 370);
    // suelo
    forma(p, caja(-300, 900, 2520, 500), "#4a3a2e", 0, 2000);

    // ---------------- protagonista detrás de la mesa
    const expr: Expr = t < 4 ? "nervous" : t < 7.2 ? "smile" : t < 9.8 ? "nervous" : t < 12.6 ? "pained" : t < 14.8 ? "neutral" : "shock";
    const exprOk: Expr = (["nervous", "smile", "pained", "neutral", "shock"] as Expr[]).includes(expr) ? expr : "neutral";
    const salto = t > 14.9 && t < 15.5 ? Math.sin(((t - 14.9) / 0.6) * Math.PI) * 50 : 0;
    g.save(); g.translate(900 - 300 * 0.7, 1010 - 975 * 0.7 - salto); g.scale(0.7, 0.7);
    bodyFront(new Pen(g), PROTA, { mode: "stand", expr: exprOk, phase: f / 14, seed: 3, blink: f % 97 < 4, look: t > 14.8 ? 1 : 0 });
    g.restore();

    // ---------------- mesa con facturas
    forma(p, caja(380, 760, 1200, 40), "#7a5232", 6, 900); forma(p, caja(420, 800, 1120, 260), "#5e3d24", 6, 900);
    for (let i = 0; i < 4; i++) { g.save(); g.translate(500 + i * 40, 740 - i * 6); g.rotate(-0.15 + i * 0.1); forma(p, caja(0, 0, 120, 30), "#f1efe9", 3, 80); g.restore(); }

    // 1) la DEUDA que sube cada mes (0-4 s)
    if (t < 7.2) {
      const deuda = [1200, 1350, 1520, 1710][mes];
      const salta = spring({ frame: f - Math.round((0.4 + mes * 0.8) * fps), fps, config: { damping: 8 } });
      g.save(); g.translate(640, 640); g.scale(0.85 + 0.15 * salta, 0.85 + 0.15 * salta);
      forma(p, caja(-140, -60, 280, 110), "#f1efe9", 5, 200);
      g.font = "800 26px sans-serif"; g.fillStyle = INK; g.textAlign = "center"; g.fillText("DEUDA", 0, -24);
      g.font = "900 54px sans-serif"; g.fillStyle = "#c0504a"; g.fillText(`${deuda.toLocaleString("es-ES")} €`, 0, 34);
      g.restore();
    }
    // 2) la HUCHA se llena… y una avería se la come (4-7,2 s)
    if (t > 4 && t < 9.8) {
      const llena = interpolate(t, [4, 5.4], [0, 1], cl), vacia = interpolate(t, [5.8, 6.6], [0, 1], cl);
      g.save(); g.translate(1250, 700);
      forma(p, [[-70, -10], [-50, -45], [10, -55], [60, -35], [75, 0], [60, 35], [-50, 40], [-75, 20]], "#e7a3b0", 5, 120);
      p.ell(78, -2, 14, 18, "#d98d9c", 3); p.dot(40, -20, 5);
      for (let i = 0; i < 6; i++) { // monedas que entran y luego salen volando
        const ti = 4 + i * 0.22, ent = interpolate(t, [ti, ti + 0.3], [0, 1], cl);
        if (ent <= 0) continue;
        const sx = vacia > 0 ? -40 + i * 30 + vacia * (i - 2.5) * 140 : 0, sy = vacia > 0 ? -60 - vacia * 220 + vacia * vacia * 260 : -140 + ent * 90;
        if (ent < 1 || vacia > 0) p.ell(sx, sy, 16, 16, "#f0c75a", 3);
      }
      g.restore();
      if (t > 5.6 && t < 7.4) { const s = spring({ frame: f - Math.round(5.6 * fps), fps, config: { damping: 9 } }); g.save(); g.translate(1250, 520); g.scale(s, s); rotulo(g, "¡AVERÍA!", 0, 0, 56, "#ffd23f"); g.restore(); }
      void llena;
    }
    // 3) la calculadora en rojo (7,2-9,8 s)
    if (t > 7.2 && t < 12.6) {
      const s = spring({ frame: f - Math.round(7.2 * fps), fps, config: { damping: 10 } });
      g.save(); g.translate(1150, 700); g.scale(s, s); g.rotate(0.06);
      forma(p, caja(-90, -120, 180, 230), "#55565c", 5, 200); forma(p, caja(-70, -100, 140, 60), "#cfe3d6", 3, 100);
      const parpadea = Math.floor(t * 3) % 2 === 0;
      g.font = "900 40px sans-serif"; g.fillStyle = parpadea ? "#c0504a" : "#7a2a2a"; g.textAlign = "right"; g.fillText("-87 €", 60, -56);
      for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) forma(p, caja(-66 + c * 46, -20 + r * 40, 38, 30), "#e8e3d6", 2, 30);
      g.restore();
    }
    // 4) la cartera… y la cobra (14,8-20 s)
    const cart = spring({ frame: f - Math.round(13.4 * fps), fps, config: { damping: 12 } });
    if (t > 13.4) {
      g.save(); g.translate(1250, 740); g.scale(cart, cart);
      forma(p, [[-110, -40], [110, -40], [120, 40], [-120, 40]], "#5a3b2a", 6, 200);
      forma(p, [[-110, -40], [110, -40], [90, -70], [-90, -70]], "#6b4a32", 5, 200);
      g.restore();
      const sube = interpolate(t, [14.8, 15.6], [0, 1], { ...cl, easing: Easing.out(Easing.back(1.4)) });
      cobra(g, p, 1250, 700, sube, f);
    }
    g.restore(); // fin cámara

    // ---------------- subtítulos (fijos) y título final
    const sub = SUBS.find(([a, b]) => t >= a && t < b);
    if (sub) {
      const k = spring({ frame: f - Math.round(sub[0] * fps), fps, config: { damping: 14 } });
      g.save(); g.translate(960, 965); g.scale(0.9 + 0.1 * k, 0.9 + 0.1 * k);
      rotulo(g, sub[2], 0, 0, sub[2].length < 6 ? 92 : 58, sub[2].startsWith("No") ? "#ffd23f" : "#ffffff", 11);
      g.restore();
    }
    if (t > 18.2) {
      const s = spring({ frame: f - Math.round(18.2 * fps), fps, config: { damping: 9 } });
      g.save(); g.translate(960, 150); g.scale(s, s); rotulo(g, "EL EFECTO COBRA", 0, 0, 110, "#ffd23f", 16); g.restore();
    }
  }, [f, fps]);
  return (
    <AbsoluteFill style={{ background: "#2c3340" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
