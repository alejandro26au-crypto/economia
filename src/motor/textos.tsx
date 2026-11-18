// Textos: subtítulos de 1-2 palabras (los del vídeo entero), rótulos grandes de escena y marcador de profundidad.
import React from "react";
import { AbsoluteFill, Easing, useCurrentFrame } from "remotion";
import { TINTA } from "./estilo";
import { ALTO, ANCHO, FPS, normal, tramo, useVoz } from "./tiempo";
import { Palabra, Rotulo } from "./tipos";

// letra de la portada del canal (Rubik Dirt: redonda, gruesa y gastada); la «limpia» para cifras pequeñas
export const FUENTE = "Marca, MarcaLimpia, 'Arial Black', sans-serif";
export const FUENTE_MANO = "Mano, Marca, sans-serif";
// colores de la marca (los de la portada): papel crema, tinta azul noche, y acentos amarillo dorado y verde salvia
export const PAPEL = "#f6f0e1";
export const TINTA_MARCA = "#2b2e3d";
export const ORO = "#e9b949";
export const SALVIA = "#8fa876";
/** Halo de papel alrededor de la letra (se lee sobre cualquier fondo sin perder la textura gastada). */
export const HALO = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `${(Math.cos((a * Math.PI) / 180) * 7).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * 7).toFixed(1)}px 0 ${PAPEL}`).join(", ") + ", 0 10px 14px rgba(20,18,28,0.45)";

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
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: Math.round(ALTO * (ANCHO > ALTO ? 0.8 : 0.69)) }}>
      <div style={{ transform: `scale(${0.85 + pop * 0.15})`, display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", maxWidth: ANCHO * 0.8 }}>
        {quedan.map((i) => {
          const activa = s >= palabras[i].ini - 0.04;
          return (
            <span key={i} style={{ fontFamily: FUENTE, fontSize: 74, lineHeight: 1, letterSpacing: 2, color: activa && i === quedan[quedan.length - 1] && quedan.length > 1 ? "#b07d1a" : TINTA_MARCA, textShadow: HALO }}>
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
  // etiqueta de papel pegada (como una nota): papel crema, borde a lápiz y letra de la portada en tinta azul noche
  const tam = (r.tam ?? 150) * 0.6;
  return (
    <div
      style={{
        position: "absolute",
        left: (r.x ?? 0.5) * ANCHO,
        top: (r.y ?? 0.22) * ALTO + bote,
        transform: `translate(-50%, -50%) scale(${k}) rotate(${r.giro ?? (i % 2 ? 2.5 : -2)}deg)`,
        opacity: fuera,
        fontFamily: FUENTE,
        fontSize: tam,
        lineHeight: 1,
        color: r.color ?? TINTA_MARCA,
        whiteSpace: "nowrap",
        letterSpacing: 3,
        padding: `${tam * 0.22}px ${tam * 0.42}px ${tam * 0.16}px`,
        background: PAPEL,
        border: `${Math.max(4, tam * 0.05)}px solid ${TINTA_MARCA}`,
        borderRadius: `${tam * 0.12}px ${tam * 0.05}px ${tam * 0.14}px ${tam * 0.06}px`,
        boxShadow: `${tam * 0.08}px ${tam * 0.1}px 0 rgba(20,18,28,0.45)`,
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
    <div style={{ position: "absolute", right: 44, top: 48, opacity: k, transform: `translateX(${(1 - k) * 60}px)`, display: "flex", alignItems: "center", gap: 10, fontFamily: FUENTE, fontSize: 40, letterSpacing: 2, color: PAPEL, ...trazo(7, TINTA_MARCA) }}>
      <span style={{ fontSize: 28 }}>▼</span>
      {texto}
    </div>
  );
};
