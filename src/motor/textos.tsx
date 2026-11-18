// Textos: subtítulos de 1-2 palabras (los del vídeo entero), rótulos grandes de escena y marcador de profundidad.
import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { TINTA } from "./estilo";
import { ALTO, ANCHO, FPS, normal, tramo, useVoz } from "./tiempo";
import { Palabra, Rotulo } from "./tipos";

export const FUENTE = "OceanoBlack, 'Inter Display', 'Arial Black', sans-serif";

const trazo = (px: number, color = TINTA): React.CSSProperties => ({
  WebkitTextStroke: `${px}px ${color}`,
  paintOrder: "stroke fill",
});

/** Agrupa el guion en golpes de 1-2 palabras: dos solo si son cortas y la primera no acaba en pausa. */
export function grupos(palabras: Palabra[]): { ini: number; fin: number; idx: number[] }[] {
  const out: { ini: number; fin: number; idx: number[] }[] = [];
  for (let i = 0; i < palabras.length; i++) {
    const a = palabras[i];
    const b = palabras[i + 1];
    const pausa = /[.,;:!?…]$/.test(a.p);
    if (b && !pausa && a.p.length + b.p.length <= 11 && b.ini - a.fin < 0.25) {
      out.push({ ini: a.ini, fin: b.fin, idx: [i, i + 1] });
      i++;
    } else out.push({ ini: a.ini, fin: a.fin, idx: [i] });
  }
  return out;
}

/** Rótulo en pantalla con sus fotogramas absolutos (para no repetir en el subtítulo lo que ya dice el rótulo). */
export type RotuloVisible = { a: number; b: number; palabras: Set<string> };

export const palabrasRotulo = (texto: string) => new Set(texto.split(/\s+/).map(normal).filter(Boolean));

/** Qué palabras del golpe de subtítulo se quitan porque ya están en un rótulo visible: si TODAS están, se quita el
 *  golpe entero; si no, solo las palabras clave (4+ letras o con cifras), nunca un «a», «it», «the» suelto. */
function quitadas(idx: number[], palabras: Palabra[], rotulos: RotuloVisible[], f: number): Set<number> {
  const activos = rotulos.filter((r) => f >= r.a && f <= r.b);
  const fuera = new Set<number>();
  if (!activos.length) return fuera;
  const esta = (i: number) => {
    const w = normal(palabras[i].p);
    return w.length > 0 && activos.some((r) => r.palabras.has(w));
  };
  if (idx.every(esta)) return new Set(idx);
  for (const i of idx) {
    const w = normal(palabras[i].p);
    if (esta(i) && (w.length >= 4 || /\d/.test(w))) fuera.add(i);
  }
  return fuera;
}

export const Subtitulos: React.FC<{ palabras: Palabra[]; rotulos?: RotuloVisible[] }> = ({ palabras, rotulos = [] }) => {
  const f = useCurrentFrame();
  const s = f / FPS;
  const gs = grupos(palabras);
  let k = -1;
  for (let i = 0; i < gs.length; i++) if (s >= gs[i].ini - 0.04) k = i;
  if (k < 0) return null;
  const g = gs[k];
  const siguiente = gs[k + 1]?.ini ?? g.fin + 0.6;
  if (s > Math.min(siguiente, g.fin + 0.6)) return null;
  const fuera = quitadas(g.idx, palabras, rotulos, f);
  const quedan = g.idx.filter((i) => !fuera.has(i));
  if (!quedan.length) return null;
  const f0 = Math.round(g.ini * FPS);
  const pop = tramo(f, f0 - 1, f0 + 5, Easing.out(Easing.back(2.2)));
  const limpia = (t: string) => t.replace(/[.,;:!?…«»"]/g, "").toUpperCase();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: Math.round(ALTO * (ANCHO > ALTO ? 0.82 : 0.69)) }}>
      <div style={{ transform: `scale(${0.85 + pop * 0.15})`, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: ANCHO * 0.8 }}>
        {quedan.map((i) => {
          const activa = s >= palabras[i].ini - 0.04;
          return (
            <span key={i} style={{ fontFamily: FUENTE, fontSize: 60, lineHeight: 1, letterSpacing: 1, color: activa && i === quedan[quedan.length - 1] && quedan.length > 1 ? "#5fd8ff" : "#ffffff", ...trazo(9), textShadow: "0 4px 10px rgba(0,0,0,0.6)" }}>
              {limpia(palabras[i].p)}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const RotuloEscena: React.FC<{ r: Rotulo; i: number }> = ({ r, i }) => {
  const f = useCurrentFrame();
  const { F, dur } = useVoz();
  const a = F(r.en);
  const b = r.hasta !== undefined ? F(r.hasta) : dur;
  if (f < a || f > b) return null;
  const k = tramo(f, a, a + 10, Easing.out(Easing.back(2)));
  const fuera = r.hasta !== undefined ? 1 - tramo(f, b - 6, b) : 1;
  const bote = Math.sin(f * 0.15 + i) * 6;
  return (
    <div
      style={{
        position: "absolute",
        left: (r.x ?? 0.5) * ANCHO,
        top: (r.y ?? 0.22) * ALTO + bote,
        transform: `translate(-50%, -50%) scale(${k}) rotate(${r.giro ?? 0}deg)`,
        opacity: fuera,
        fontFamily: FUENTE,
        fontSize: (r.tam ?? 150) * 0.55,
        color: r.color ?? "#ffffff",
        whiteSpace: "nowrap",
        letterSpacing: 3,
        ...trazo(Math.round((r.tam ?? 150) * 0.06)),
        textShadow: "0 6px 18px rgba(0,0,0,0.7)",
      }}
    >
      {r.texto}
    </div>
  );
};

export const Profundidad: React.FC<{ texto: string }> = ({ texto }) => {
  const f = useCurrentFrame();
  const k = tramo(f, 0, 10, Easing.out(Easing.cubic));
  return (
    <div style={{ position: "absolute", right: 44, top: 48, opacity: k, transform: `translateX(${(1 - k) * 60}px)`, display: "flex", alignItems: "center", gap: 10, fontFamily: FUENTE, fontSize: 36, letterSpacing: 2, color: "#bff6ff", ...trazo(6) }}>
      <span style={{ fontSize: 28 }}>▼</span>
      {texto}
    </div>
  );
};
