// LA NUBE DE PENSAMIENTO: sale de la cabeza del protagonista y la cámara entra en ella para explicar con cifras
// (gráfico que se dibuja, cifra gigante, comparación de barras o la nube llena de dinero como la portada).
import React from "react";
import { Easing } from "remotion";
import { tramo } from "../motor/tiempo";
import { Nube } from "../motor/tipos";
import { Billete, C, Forma, INK, Linea, Moneda, Saco, rect } from "./trazo";

export const NUBE_W = 1300;
export const NUBE_H = 760;

/** Contorno de nube (bultos) alrededor del rectángulo w×h centrado en 0,0. */
function contorno(w: number, h: number) {
  const pts: string[] = [];
  const n = 16;
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const a1 = ((i + 1) / n) * Math.PI * 2;
    const p = (a: number, k: number) => [Math.cos(a) * (w / 2) * k, Math.sin(a) * (h / 2) * k];
    const [x0, y0] = p(a0, 1);
    const [x1, y1] = p(a1, 1);
    const [cx, cy] = p((a0 + a1) / 2, 1.22);
    if (i === 0) pts.push(`M ${x0.toFixed(0)} ${y0.toFixed(0)}`);
    pts.push(`Q ${cx.toFixed(0)} ${cy.toFixed(0)} ${x1.toFixed(0)} ${y1.toFixed(0)}`);
  }
  return pts.join(" ") + " Z";
}

/** La nube en el mundo: centro (x, y); `cabeza` = de dónde salen las burbujas; t = fotogramas desde que aparece. */
export const NubeMundo: React.FC<{ x: number; y: number; cabeza: [number, number]; t: number; nube: Nube }> = ({ x, y, cabeza, t, nube }) => {
  const pop = tramo(t, 0, 12, Easing.out(Easing.back(1.6)));
  const burbujas = [0.25, 0.5, 0.75].map((k) => [cabeza[0] + (x - cabeza[0]) * k * 0.7, cabeza[1] + (y + NUBE_H / 2 - cabeza[1]) * k] as const);
  return (
    <g>
      {burbujas.map(([bx, by], i) => (
        <circle key={i} cx={bx} cy={by} r={(14 + i * 12) * tramo(t, i * 2, i * 2 + 6)} fill="#ffffff" stroke={INK} strokeWidth={4} />
      ))}
      <g transform={`translate(${x} ${y}) scale(${pop})`}>
        <path d={contorno(NUBE_W, NUBE_H)} fill="#ffffff" transform="translate(8 6)" opacity={0.95} />
        <path d={contorno(NUBE_W, NUBE_H)} fill="#fbf8ef" stroke={INK} strokeWidth={6} strokeLinejoin="round" />
        <Contenido nube={nube} t={t - 10} />
      </g>
    </g>
  );
};

const Contenido: React.FC<{ nube: Nube; t: number }> = ({ nube, t }) => {
  const W = NUBE_W * 0.78;
  const H = NUBE_H * 0.68;
  switch (nube.tipo) {
    case "grafico": {
      const v = nube.valores;
      const rango = Math.max(...v) - Math.min(...v) || 1;
      const max = Math.max(...v) + rango * 0.15;
      const min = Math.min(...v) - rango * 0.15;
      const sube = nube.color ? nube.color === "sube" : v[v.length - 1] >= v[0];
      const color = sube ? "#5f9a4a" : C.rojo;
      const prog = tramo(t, 0, 45, Easing.inOut(Easing.cubic));
      const pts = v.map((val, i) => [-W / 2 + 40 + (i / (v.length - 1)) * (W - 80), H / 2 - 30 - ((val - min) / (max - min)) * (H - 120)] as const);
      const n = Math.max(1, prog * (pts.length - 1));
      const vis = pts.slice(0, Math.floor(n) + 1).map((p) => p.join(" "));
      const k = n - Math.floor(n);
      const a = pts[Math.floor(n)];
      const b = pts[Math.min(pts.length - 1, Math.floor(n) + 1)];
      const punta = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
      return (
        <g>
          <text x={0} y={-H / 2 + 10} textAnchor="middle" fontSize={64} fontFamily="Marca, sans-serif" fill={INK}>
            {nube.titulo}
          </text>
          <Linea d={`M ${-W / 2 + 20} ${-H / 2 + 50} L ${-W / 2 + 20} ${H / 2 - 20} L ${W / 2 - 10} ${H / 2 - 20}`} w={5} />
          <Linea d={`M ${vis.join(" L ")} L ${punta.join(" ")}`} w={11} color={color} />
          <circle cx={punta[0]} cy={punta[1]} r={14} fill={color} stroke={INK} strokeWidth={4} />
          {nube.etiquetas?.map((e, i) => (
            <text key={i} x={pts[i]?.[0] ?? 0} y={H / 2 + 26} textAnchor="middle" fontSize={34} fontFamily="Mano, sans-serif" fill={INK} opacity={tramo(t, (i / v.length) * 45, (i / v.length) * 45 + 6)}>
              {e}
            </text>
          ))}
        </g>
      );
    }
    case "cifra": {
      const k = tramo(t, 0, 10, Easing.out(Easing.back(2)));
      return (
        <g>
          <text x={0} y={40} textAnchor="middle" fontSize={190 * k} fontFamily="Marca, sans-serif" fill={INK}>
            {nube.texto}
          </text>
          {nube.sub && (
            <text x={0} y={150} textAnchor="middle" fontSize={56} fontFamily="Mano, sans-serif" fill={C.rojo} opacity={tramo(t, 12, 20)}>
              {nube.sub}
            </text>
          )}
        </g>
      );
    }
    case "compara": {
      const max = Math.max(nube.a.valor, nube.b.valor);
      const barra = (lado: -1 | 1, d: { texto: string; valor: number }, col: string, ret: number) => {
        const h = (d.valor / max) * (H - 160) * tramo(t, ret, ret + 25, Easing.out(Easing.cubic));
        const x = lado * 190 - 90;
        return (
          <g>
            <Forma d={rect(x, H / 2 - 60 - h, 180, Math.max(1, h))} color={col} w={5} sombra />
            <text x={x + 90} y={H / 2 - 74 - h} textAnchor="middle" fontSize={60} fontFamily="Marca, sans-serif" fill={INK}>
              {Math.round(d.valor * tramo(t, ret, ret + 25)).toLocaleString("es-ES")}
              {nube.unidad ?? ""}
            </text>
            <text x={x + 90} y={H / 2 - 4} textAnchor="middle" fontSize={44} fontFamily="Mano, sans-serif" fill={INK}>
              {d.texto}
            </text>
          </g>
        );
      };
      return (
        <g>
          {barra(-1, nube.a, C.salvia, 0)}
          {barra(1, nube.b, C.oro, 14)}
        </g>
      );
    }
    case "dinero":
      return (
        <g>
          {[
            [-380, -60, -12, 1.4],
            [-120, -150, 10, 1.1],
            [230, -110, -20, 1.2],
            [380, 60, 18, 1.0],
            [-260, 120, 25, 1.0],
            [60, 140, -8, 1.3],
          ].map(([x, y, g, e], i) => (
            <Billete key={i} x={x} y={y + Math.sin(t * 0.1 + i) * 10} giro={g + Math.sin(t * 0.07 + i) * 6} esc={e * tramo(t, i * 3, i * 3 + 8, Easing.out(Easing.back(2)))} />
          ))}
          <Saco x={-30} y={60} esc={1.3 * tramo(t, 6, 14, Easing.out(Easing.back(2)))} color={C.salvia} />
          <Saco x={170} y={40} esc={1.1 * tramo(t, 10, 18, Easing.out(Easing.back(2)))} color={C.oro} />
          {[-450, -320, 300, 460, -60].map((x, i) => (
            <Moneda key={x} x={x} y={-180 + (i % 3) * 140 + Math.sin(t * 0.12 + i) * 8} r={26} giro={t * 7 + i * 50} />
          ))}
        </g>
      );
  }
};
