// PRUEBA (20 s): «¿Cuánto valen hoy tus 100 € del año 2000?». Cómo explicar con gráficos animados: cifras grandes,
// el gráfico se construye mientras avanza, el personaje reacciona, una metáfora (el billete que encoge) y una idea.
// OJO: VALOR_HOY es APROXIMADO (IPCA zona euro 2000 → 2025, ~+65-70 %). Comprobar con Eurostat/INE antes de publicar.
import React, { useEffect, useRef } from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { bodyFront, Expr, INK, mix, Pen } from "../personaje/toon";
import { PROTAGONISTA, vestir } from "../personaje/especie";

const VALOR_HOY = 60; // € de 2000 que «quedan» hoy (aprox., pendiente de comprobar)
const SUBIDA = Math.round((100 / VALOR_HOY - 1) * 100); // % que han subido los precios
type P2 = [number, number];
const caja = (x: number, y: number, w: number, h: number): P2[] => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const L = -Math.PI * 0.66;
const forma = (p: Pen, pts: P2[], c: string, ol = 5, r = 300) => { p.shadedFill(pts, c, mix(c, "#000000", 0.25), L, r, 0.4); p.poly(pts, null, ol); };
const PROTA = vestir(PROTAGONISTA);
const cl = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** texto grande con borde negro (estilo miniatura) */
const rotulo = (g: CanvasRenderingContext2D, t: string, x: number, y: number, tam: number, col = "#ffd23f", borde = 12) => {
  g.font = `900 ${tam}px sans-serif`; g.textAlign = "center"; g.lineJoin = "round";
  g.lineWidth = borde; g.strokeStyle = INK; g.strokeText(t, x, y); g.fillStyle = col; g.fillText(t, x, y);
};

/** billete de 100 € (centrado en 0,0; ancho 520) */
const billete = (g: CanvasRenderingContext2D, p: Pen, valor: string) => {
  forma(p, caja(-260, -130, 520, 260), "#c9a978", 7);
  forma(p, caja(-236, -106, 472, 212), "#dcc196", 3);
  p.ell(110, 0, 70, 70, "#e8d4ad", 4);
  g.font = "900 64px sans-serif"; g.textAlign = "center"; g.fillStyle = "#6b4a32"; g.fillText("€", 110, 22);
  g.font = "900 96px sans-serif"; g.fillStyle = "#6b4a32"; g.textAlign = "left"; g.fillText(valor, -220, 30);
  for (let i = 0; i < 5; i++) p.stroke([[-220, 60 + i * 0], [-60 - i * 20, 60]], 3, "#a88a5c");
};

const personaje = (g: CanvasRenderingContext2D, x: number, y: number, k: number, expr: Expr, f: number, wave?: number) => {
  g.save(); g.translate(x - 300 * k, y - 975 * k); g.scale(k, k);
  bodyFront(new Pen(g), PROTA, { mode: "stand", expr, phase: f / 12, seed: 3, blink: f % 97 < 4, wave });
  g.restore();
};

export const Prueba100Euros: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const g = ref.current!.getContext("2d")!;
    g.clearRect(0, 0, 1920, 1080);
    g.lineJoin = "round"; g.lineCap = "round";
    const p = new Pen(g);
    const t = f / fps;
    // CÁMARA que nunca para: empuje lento, golpe de zoom hacia el billete en el susto (12,5 s) y temblor
    const golpe = interpolate(t, [12.3, 12.7, 14, 14.6], [0, 1, 1, 0], { ...cl, easing: Easing.out(Easing.cubic) });
    const z = 1 + 0.05 * (t / 20) + 0.22 * golpe;
    const tiembla = t > 12.4 && t < 13.3 ? Math.sin(f * 2.1) * 9 * (13.3 - t) : 0;
    const fx = 960 + (1240 - 960) * golpe * 0.6, fy = 540 + (470 - 540) * golpe * 0.6;
    g.save();
    g.translate(960 + tiembla, 540 + tiembla * 0.6); g.scale(z, z); g.translate(-fx, -fy);
    // fondo plano: pared y suelo
    forma(p, caja(-200, -200, 2320, 1060), "#a9c4c9", 0, 1500);
    forma(p, caja(-200, 860, 2320, 420), "#c9b48c", 0, 1500);
    p.stroke([[-200, 860], [2120, 860]], 7);
    // ventana y cuadro en la pared (para que la cámara tenga referencias al moverse)
    forma(p, caja(80, 180, 260, 300), "#d6e6ea", 6, 300); p.stroke([[210, 180], [210, 480]], 5); p.stroke([[80, 330], [340, 330]], 5);
    forma(p, caja(1640, 520, 160, 120), "#d9a441", 5, 200); forma(p, caja(1656, 536, 128, 88), "#8fb5c4", 3, 150);

    // tiempos (30 fps): 0-4 s presentación · 4-14 s pasan los años · 14-20 s conclusión
    const k = interpolate(t, [4.5, 12.5], [0, 1], { ...cl, easing: Easing.inOut(Easing.cubic) }); // avance de los años
    const anio = Math.round(2000 + 25 * k);
    const valor = Math.round(100 - (100 - VALOR_HOY) * k);
    const entra = spring({ frame: f - 10, fps, config: { damping: 11 } });

    // 1) el billete: aparece con rebote y luego ENCOGE con su valor real
    const esc = (0.55 + 0.45 * (valor / 100)) * Math.max(0.01, entra);
    const vuelo = interpolate(t, [0.3, 1.4], [1, 0], { ...cl, easing: Easing.out(Easing.back(1.6)) });
    const bx = interpolate(t, [14, 15], [1240, 1300], cl) + vuelo * 900, by = 470 - vuelo * 300 + Math.sin(f / 15) * 8;
    // trozos del billete que se caen mientras pierde valor
    for (let i = 0; i < 14; i++) {
      const t0 = 5 + i * 0.55, d = t - t0;
      if (d < 0 || d > 2.2) continue;
      const sx = bx + 180 * esc * Math.cos(i * 2.3), sy = by + 60 * esc * Math.sin(i * 1.7) + d * d * 260;
      g.save(); g.translate(sx, sy); g.rotate(d * (i % 2 ? 4 : -4)); g.globalAlpha = Math.min(1, (2.2 - d) * 1.5);
      forma(p, [[-16, -10], [14, -14], [18, 8], [-12, 12]], "#c9a978", 3, 30); g.restore();
    }
    g.save(); g.translate(bx, by); g.rotate(-0.05 + Math.sin(f / 20) * 0.03 + vuelo * 0.8); g.scale(esc, esc);
    billete(g, p, `${valor}`);
    g.restore();

    // 3) el personaje reacciona: contento → preocupado → asustado → señala la conclusión
    const expr: Expr = t < 6 ? "grin" : t < 10 ? "nervous" : t < 14 ? "shock" : "stern";
    const wave = t > 14.5 ? 0.5 + 0.5 * Math.sin(f / 6) : undefined;
    const px = interpolate(t, [0, 1.6], [-250, 520], { ...cl, easing: Easing.out(Easing.quad) });
    const anda = t < 1.6;
    g.save(); g.translate(px - 300 * 0.62, 900 - 975 * 0.62 - (t > 12.4 && t < 12.9 ? Math.sin((t - 12.4) * Math.PI / 0.5) * 40 : 0)); g.scale(0.62, 0.62);
    bodyFront(new Pen(g), PROTA, { mode: anda ? "stroll" : "stand", expr, phase: f / 12, seed: 3, blink: f % 97 < 4, wave });
    g.restore();
    g.restore(); // fin de la cámara (los rótulos van fijos en pantalla)
    // 2) contador de años y gráfica de precios que se dibuja mientras pasan los años
    if (t > 4) {
      const a = interpolate(t, [4, 4.6], [0, 1], cl);
      g.globalAlpha = a;
      const lat = 1 + 0.08 * Math.max(0, 1 - ((t * 25 / 8) % 1) * 4) * (k > 0 && k < 1 ? 1 : 0);
      g.save(); g.translate(960, 120); g.scale(lat, lat); rotulo(g, `Año ${anio}`, 0, 0, 92, "#ffffff", 14); g.restore();
      // mini gráfica de precios (arriba a la derecha)
      const gx = 1500, gy = 260, gw = 360, gh = 170;
      forma(p, caja(gx - 20, gy - gh - 40, gw + 40, gh + 80), "#f1efe9", 5, 400);
      p.stroke([[gx, gy], [gx + gw, gy]], 4); p.stroke([[gx, gy], [gx, gy - gh]], 4);
      const pts: P2[] = [];
      for (let i = 0; i <= 50; i++) {
        const s = (i / 50) * k, sub = SUBIDA / 100;
        const curva = s < 0.84 ? s * 0.62 / 0.84 * sub / (sub) * 0.62 : 0.62 + (s - 0.84) / 0.16 * 0.38; // sube despacio y se dispara en 2021-2023
        pts.push([gx + s * gw, gy - curva * gh * 0.95]);
      }
      if (pts.length > 1) p.stroke(pts, 7, "#c0504a");
      g.font = "bold 26px sans-serif"; g.fillStyle = INK; g.textAlign = "left"; g.fillText("Precios", gx + 6, gy - gh - 10);
      g.textAlign = "right"; g.fillText(`+${Math.round(SUBIDA * k)} %`, gx + gw, gy - gh - 10);
      g.globalAlpha = 1;
    }


    // 4) rótulos: una idea por momento
    if (t < 4) rotulo(g, "Año 2000: tienes 100 €", 960, 130, 84, "#ffffff", 14);
    if (t > 14) {
      const s = spring({ frame: f - 14 * fps, fps, config: { damping: 9 } });
      g.save(); g.translate(1300, 820); g.scale(s, s);
      rotulo(g, `HOY VALEN ${VALOR_HOY} €`, 0, 0, 96, "#ffd23f", 16);
      g.restore();
      const s2 = spring({ frame: f - 16 * fps, fps, config: { damping: 10 } });
      g.save(); g.translate(1300, 945); g.scale(s2, s2);
      rotulo(g, "en el cajón, tu dinero se encoge", 0, 0, 54, "#ffffff", 10);
      g.restore();
    }
  }, [f, fps]);
  return (
    <AbsoluteFill style={{ background: "#a9c4c9" }}>
      <canvas ref={ref} width={1920} height={1080} style={{ position: "absolute", inset: 0 }} />
    </AbsoluteFill>
  );
};
