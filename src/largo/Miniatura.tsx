// MINIATURA del vídeo 1 (1280×720) hecha con el motor: Ronald con su fregona y la caja del banco abierta, llena
// de títulos que brillan. Texto amarillo con borde negro (estilo del canal). Se dibuja en 1920×1080 y se escala.
import React, { useEffect, useRef, useState } from "react";
import { AbsoluteFill, continueRender, delayRender, staticFile } from "remotion";
import { Pen } from "../personaje/toon";
import { degradado, FUENTE, gente, gordo, MANO, rect, rnd, texto } from "./base";
import { OBJETOS } from "./objetos";
import { traje } from "./reparto";

export const Miniatura: React.FC<{ variante?: "A" | "B" }> = ({ variante = "A" }) => {
  const ref = useRef<HTMLCanvasElement>(null);
  const [listo, setListo] = useState(false);
  const [espera] = useState(() => delayRender("fuentes"));
  useEffect(() => {
    const fs = [new FontFace(FUENTE, `url(${staticFile("fuentes/InterDisplay-Black.otf")})`), new FontFace(MANO, `url(${staticFile("fuentes/patrick-hand.woff2")})`)];
    Promise.all(fs.map((x) => x.load())).then((r) => { r.forEach((x) => document.fonts.add(x)); setListo(true); continueRender(espera); });
  }, [espera]);
  useEffect(() => {
    if (!listo) return;
    const g = ref.current!.getContext("2d")!;
    g.setTransform(2 / 3, 0, 0, 2 / 3, 0, 0);
    g.lineJoin = "round"; g.lineCap = "round";
    const p = new Pen(g);
    const c = { t: 3, vida: 3, T: () => 0, f: 90 };
    if (variante === "A") {
      degradado(g, 0, 0, 1920, 1080, "#2f6f73", "#1d4a50");
      for (let i = 0; i < 40; i++) p.dot(rnd(1, i) * 1920, rnd(2, i) * 1080, 3, "rgba(255,255,255,0.12)");
      // halo dorado detrás de la caja
      const gr = g.createRadialGradient(1300, 560, 40, 1300, 560, 700); gr.addColorStop(0, "rgba(255,220,120,0.75)"); gr.addColorStop(1, "rgba(255,220,120,0)");
      g.fillStyle = gr; g.fillRect(0, 0, 1920, 1080);
      OBJETOS.cajafuerte(g, p, { tipo: "cajafuerte", x: 1300, y: 900, k: 1.25, abre: 0 } as never, c);
      OBJETOS.monton(g, p, { tipo: "monton", x: 1300, y: 830, k: 1.5, alto: 300, en: 0 } as never, c);
      OBJETOS.dinero(g, p, { tipo: "dinero", x: 1300, y: 1060, k: 1.4, n: 0, en: 0, lluvia: true } as never, { ...c, vida: 1.7 });
      gente(g, traje("ronald"), 470, 1160, 1.02, { mode: "stand", expr: "smile_closed", prop: { cosa: "fregona" }, seed: 3, headTilt: -4, facing: 1 });
      g.save(); g.translate(1330, 175); g.rotate(-0.04); gordo(g, "8 MILLONES", 0, 0, 190, "#ffd23f", 30); g.restore();
      g.save(); g.translate(1330, 330); g.rotate(-0.04); gordo(g, "LIMPIANDO SUELOS", 0, 0, 84, "#ffffff", 18); g.restore();
    } else {
      degradado(g, 0, 0, 960, 1080, "#f0d9a8", "#e3c088");
      degradado(g, 960, 0, 960, 1080, "#7f93a8", "#5f7088");
      p.band([[960, 0], [960, 1080]], "#ffffff", 18, 5);
      g.save(); g.beginPath(); g.rect(0, 0, 950, 1080); g.clip();
      OBJETOS.dinero(g, p, { tipo: "dinero", x: 480, y: 1060, k: 1.3, n: 0, en: 0, lluvia: true } as never, { ...c, vida: 1.2 });
      g.restore();
      gente(g, traje("ronald"), 480, 1180, 1.0, { mode: "stand", expr: "grin", prop: { cosa: "fregona" }, seed: 3 });
      OBJETOS.facturas(g, p, { tipo: "facturas", x: 1440, y: 560, n: 9, r: 420 } as never, { ...c, vida: 3 });
      gente(g, traje("fuscone"), 1440, 1180, 1.0, { mode: "stand", expr: "shock", seed: 5 });
      rect(p, 1250, 820, 380, 110, "#c0392b", 6); texto(g, "SUBASTA", 1440, 875, 80, "#ffffff");
      gordo(g, "¿QUIÉN GANÓ?", 960, 150, 170, "#ffd23f", 28);
    }
  }, [listo, variante]);
  return (
    <AbsoluteFill>
      <canvas ref={ref} width={1280} height={720} />
    </AbsoluteFill>
  );
};
