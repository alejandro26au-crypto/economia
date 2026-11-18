// Lo que va ENCIMA de la imagen: subtítulos (letra de la portada), rótulos de papel, el sello «¡PERO!» de los
// giros, el CONTADOR DEL BOLSILLO, líneas de concentración, lluvia de billetes, el billete que vuela entre lugares,
// destellos y el grano de papel. Todo en px de pantalla (1920×1080).
import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { Billete, INK } from "../mundo/trazo";
import { ALTO, ANCHO, FPS, azar, normal, tramo } from "./tiempo";
import { Palabra } from "./tipos";

export const FUENTE = "Marca, MarcaLimpia, 'Arial Black', sans-serif";
export const FUENTE_MANO = "Mano, Marca, sans-serif";
export const PAPEL = "#f6f0e1";
export const TINTA_MARCA = "#2b2e3d";
export const ORO = "#e9b949";
export const ROJO = "#b03a2e";
/** Halo de papel alrededor de la letra: se lee sobre cualquier fondo sin perder la textura gastada. */
export const HALO = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => `${(Math.cos((a * Math.PI) / 180) * 7).toFixed(1)}px ${(Math.sin((a * Math.PI) / 180) * 7).toFixed(1)}px 0 ${PAPEL}`).join(", ") + ", 0 10px 14px rgba(20,18,28,0.45)";

// ---------------------------------------------------------------- subtítulos (1-3 palabras, la última en dorado)
export function grupos(palabras: Palabra[]) {
  const out: { ini: number; fin: number; idx: number[] }[] = [];
  for (let i = 0; i < palabras.length; i++) {
    const g = [i];
    while (g.length < 5) {
      const a = palabras[g[g.length - 1]];
      const b = palabras[g[g.length - 1] + 1];
      if (!b || /[.,;:!?…]$/.test(a.p) || g.reduce((n, k) => n + palabras[k].p.length, 0) + b.p.length > 24 || b.ini - a.fin > 0.25) break;
      g.push(g[g.length - 1] + 1);
    }
    out.push({ ini: palabras[g[0]].ini, fin: palabras[g[g.length - 1]].fin, idx: g });
    i = g[g.length - 1];
  }
  return out;
}

export const Subtitulos: React.FC<{ palabras: Palabra[]; f: number; ocultas: Set<string> }> = ({ palabras, f, ocultas }) => {
  const s = f / FPS;
  const gs = grupos(palabras);
  let k = -1;
  for (let i = 0; i < gs.length; i++) if (s >= gs[i].ini - 0.04) k = i;
  if (k < 0) return null;
  const g = gs[k];
  if (s > Math.min(gs[k + 1]?.ini ?? Infinity, g.fin + 0.6)) return null;
  const quedan = g.idx.filter((i) => !ocultas.has(normal(palabras[i].p)));
  if (!quedan.length) return null;
  const f0 = Math.round(g.ini * FPS);
  const pop = tramo(f, f0 - 1, f0 + 4, Easing.out(Easing.cubic));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: Math.round(ALTO * 0.8) }}>
      <div style={{ transform: `translateY(${(1 - pop) * 10}px)`, opacity: pop, display: "flex", gap: 22, justifyContent: "center", maxWidth: ANCHO * 0.85 }}>
        {quedan.map((i) => {
          const activa = s >= palabras[i].ini - 0.04 && s <= palabras[i].fin + 0.05 && quedan.length > 1;
          return (
            <span key={i} style={{ fontFamily: FUENTE, fontSize: 62, lineHeight: 1, letterSpacing: 2, color: activa ? "#a8761a" : TINTA_MARCA, textShadow: HALO }}>
              {palabras[i].p.replace(/^[¿¡«"(]+|[.,;:!?…»")]+$/g, "").toUpperCase()}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- rótulo: etiqueta de papel pegada
export const Rotulo: React.FC<{ texto: string; a: number; b: number; f: number; x?: number; y?: number; tam?: number; color?: string; giro?: number; i: number }> = ({ texto, a, b, f, x = 0.5, y = 0.2, tam = 130, color = TINTA_MARCA, giro, i }) => {
  if (f < a || f > b) return null;
  const k = tramo(f, a, a + 10, Easing.out(Easing.back(2)));
  const fuera = 1 - tramo(f, b - 6, b);
  const t = tam * 0.6;
  return (
    <div
      style={{
        position: "absolute",
        left: x * ANCHO,
        top: y * ALTO + Math.sin(f * 0.15 + i) * 6,
        transform: `translate(-50%, -50%) scale(${k}) rotate(${giro ?? (i % 2 ? 2.5 : -2)}deg)`,
        opacity: fuera,
        fontFamily: FUENTE,
        fontSize: t,
        lineHeight: 1,
        color,
        whiteSpace: "nowrap",
        letterSpacing: 3,
        padding: `${t * 0.22}px ${t * 0.42}px ${t * 0.16}px`,
        background: PAPEL,
        border: `${Math.max(4, t * 0.05)}px solid ${TINTA_MARCA}`,
        borderRadius: `${t * 0.12}px ${t * 0.05}px ${t * 0.14}px ${t * 0.06}px`,
        boxShadow: `${t * 0.08}px ${t * 0.1}px 0 rgba(20,18,28,0.45)`,
      }}
    >
      {texto}
    </div>
  );
};

// ---------------------------------------------------------------- sello del giro: «¡PERO!» cae y se estampa
export const Sello: React.FC<{ texto: string; t: number }> = ({ texto, t }) => {
  if (t < 0 || t > 50) return null;
  const cae = interpolate(t, [0, 6], [2.6, 1], { extrapolateRight: "clamp", easing: Easing.in(Easing.cubic) });
  const fuera = 1 - tramo(t, 40, 50);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: fuera }}>
      <div style={{ transform: `rotate(-8deg) scale(${cae})`, fontFamily: FUENTE, fontSize: 190, color: ROJO, border: `14px solid ${ROJO}`, borderRadius: 26, padding: "10px 50px 0", background: "rgba(246,240,225,0.85)", letterSpacing: 6, opacity: t < 1 ? 0 : 1 }}>
        {texto}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------- el contador del bolsillo (arriba a la izquierda)
export const ContadorBolsillo: React.FC<{ titulo: string; valor: number; anterior: number; t: number; unidad: string }> = ({ titulo, valor, anterior, t, unidad }) => {
  const k = tramo(t, 0, 24, Easing.out(Easing.cubic));
  const v = anterior + (valor - anterior) * k;
  const baja = valor < anterior;
  const latido = t < 24 ? 1 + Math.sin((t / 24) * Math.PI) * 0.12 : 1;
  return (
    <div style={{ position: "absolute", left: 40, top: 34, transform: `rotate(-2deg) scale(${latido})`, transformOrigin: "0 0", background: PAPEL, border: `6px solid ${TINTA_MARCA}`, borderRadius: "14px 6px 16px 8px", padding: "10px 26px 4px", boxShadow: "8px 10px 0 rgba(20,18,28,0.4)" }}>
      <div style={{ fontFamily: FUENTE_MANO, fontSize: 30, color: TINTA_MARCA }}>{titulo}</div>
      <div style={{ fontFamily: FUENTE, fontSize: 78, lineHeight: 1.05, color: t < 30 && t >= 0 ? (baja ? ROJO : "#4f7a3a") : TINTA_MARCA }}>
        {Math.round(v).toLocaleString("es-ES")} {unidad}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- líneas de concentración (manga, a lápiz)
export const Lineas: React.FC<{ f: number }> = ({ f }) => (
  <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 34 }, (_, i) => {
      const a = (i / 34) * Math.PI * 2 + azar(i, Math.floor(f / 3)) * 0.1;
      const r0 = 520 + azar(i, f) * 160;
      return <line key={i} x1={960 + Math.cos(a) * r0} y1={540 + Math.sin(a) * r0 * 0.62} x2={960 + Math.cos(a) * 1400} y2={540 + Math.sin(a) * 900} stroke={INK} strokeWidth={3 + azar(i) * 5} strokeOpacity={0.55} strokeLinecap="round" />;
    })}
  </svg>
);

// ---------------------------------------------------------------- lluvia de billetes
export const Lluvia: React.FC<{ t: number }> = ({ t }) => (
  <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0 }}>
    {Array.from({ length: 26 }, (_, i) => {
      const x = azar(i, "x") * ANCHO;
      const y = -120 + ((t * (6 + azar(i) * 6) + azar(i, "y") * 1300) % 1300);
      return <Billete key={i} x={x + Math.sin(t * 0.08 + i) * 40} y={y} giro={t * (2 + azar(i) * 4) + i * 30} esc={0.7 + azar(i, "e") * 0.5} />;
    })}
  </svg>
);

/** El billete que vuela delante de la cámara entre lugares («sigue el dinero»). */
export const BilleteVolador: React.FC<{ u: number }> = ({ u }) => {
  if (u <= 0 || u >= 1) return null;
  const x = 960 + Math.sin(u * Math.PI * 2) * 260;
  const y = 540 + Math.cos(u * Math.PI * 1.5) * 120 - Math.sin(u * Math.PI) * 60;
  return (
    <svg width={ANCHO} height={ALTO} style={{ position: "absolute", inset: 0 }}>
      <Billete x={x} y={y} giro={u * 720} esc={1.6 + Math.sin(u * Math.PI) * 0.8} />
    </svg>
  );
};

export const Flash: React.FC<{ t: number }> = ({ t }) => (t < 0 || t > 8 ? null : <AbsoluteFill style={{ background: PAPEL, opacity: 0.8 * (1 - t / 8) }} />);
