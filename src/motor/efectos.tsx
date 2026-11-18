// Efectos. Los de ambiente (burbujas, nieve marina, plancton, banco de peces, alarma, rayos) están DENTRO del
// mundo 3D; destello, oscuridad y linterna se pintan encima de la pantalla.
import React, { useMemo } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Rayos3D } from "./escenarios";
import { Pieza, texturaBurbuja, texturaPunto } from "./piezas3d";
import { ALTO, ANCHO, tramo, useVoz } from "./tiempo";
import { Efecto } from "./tipos";

type Nube = { n: number; s: number; clave: string; color: string; tam: number; tex: THREE.Texture; aditivo?: boolean; pos: (i: number, f: number) => [number, number, number]; opacidad?: number };

const Puntos: React.FC<Nube> = ({ n, s, clave, color, tam, tex, aditivo, pos, opacidad = 1 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [n]);
  const a = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < n; i++) {
    const [x, y, z] = pos(i, f);
    a.setXYZ(i, x, y, z);
  }
  a.needsUpdate = true;
  geo.computeBoundingSphere();
  return (
    <points geometry={geo} key={clave + s}>
      <pointsMaterial map={tex} color={color} size={tam} sizeAttenuation transparent depthWrite={false} opacity={opacidad} blending={aditivo ? THREE.AdditiveBlending : THREE.NormalBlending} />
    </points>
  );
};

const r = (s: number, ...k: (string | number)[]) => azar(s, "ef", ...k);

const Banco3D: React.FC<{ desde: number; color: string; s: number }> = ({ desde, color, s }) => {
  const f = useCurrentFrame();
  const t = f - desde;
  if (t < 0 || t > 160) return null;
  const x0 = -14 + t * 0.2;
  return (
    <group>
      {Array.from({ length: 22 }, (_, i) => {
        const x = x0 + (i % 6) * 0.7 + r(s, "bx", i) * 0.5;
        const y = 1.6 + Math.floor(i / 6) * 0.6 + r(s, "by", i) * 0.4 + Math.sin(t * 0.15 + i) * 0.08;
        const z = -3.5 - r(s, "bz", i) * 2.5;
        return (
          <group key={i} position={[x, y, z]}>
            <Pieza forma={{ f: "bola", r: 0.18, seg: 10 }} esc={[1.3, 0.75, 0.45]} color={color} borde={0.025} />
            <Pieza forma={{ f: "cono", r: 0.12, h: 0.2, seg: 6 }} color={color} pos={[-0.28, 0, 0]} rot={[0, 0, Math.PI / 2 + Math.sin(f * 0.5 + i) * 0.4]} borde={0.02} />
          </group>
        );
      })}
    </group>
  );
};

const Alarma: React.FC<{ desde: number }> = ({ desde }) => {
  const f = useCurrentFrame();
  if (f < desde) return null;
  const a = f * 0.25;
  return (
    <group position={[0, 4.2, -0.6]}>
      <pointLight position={[Math.cos(a) * 1.5, 0, Math.sin(a) * 1.5]} intensity={30} distance={12} color="#ff2a2a" />
      <Pieza forma={{ f: "bola", r: 0.2, seg: 12 }} color="#ff3b3b" brillo="#ff3b3b" intensidad={0.6 + 0.4 * Math.sin(f * 0.5)} />
    </group>
  );
};

/** Efectos que viven en el mundo 3D (van dentro del lienzo de Three). */
export const Efectos3D: React.FC<{ efectos: Efecto[]; s: number }> = ({ efectos, s }) => {
  const { F } = useVoz();
  const burbuja = texturaBurbuja();
  const punto = texturaPunto();
  return (
    <group>
      {efectos.map((e, k) => {
        switch (e.tipo) {
          case "burbujas":
            return (
              <Puntos key={k} n={e.n ?? 40} s={s} clave="b" color="#ffffff" tam={0.22} tex={burbuja} pos={(i, f) => {
                const vel = 0.02 + r(s, "bv", i) * 0.04;
                const y = ((f * vel + r(s, "by", i) * 12) % 12) - 1;
                return [(r(s, "bx", i) - 0.5) * 12 + Math.sin(f * 0.08 + i) * 0.15, y, 2 - r(s, "bz", i) * 10];
              }} />
            );
          case "nieve":
            return (
              <Puntos key={k} n={e.n ?? 260} s={s} clave="n" color="#e6f1ff" tam={0.07} tex={punto} opacidad={0.8} pos={(i, f) => {
                const y = 9 - ((f * (0.006 + r(s, "nv", i) * 0.01) + r(s, "ny", i) * 10) % 10);
                return [(r(s, "nx", i) - 0.5) * 22 + Math.sin(f * 0.02 + i) * 0.2, y, 4 - r(s, "nz", i) * 22];
              }} />
            );
          case "plancton":
            return (
              <Puntos key={k} n={e.n ?? 90} s={s} clave="p" color="#7ff7ff" tam={0.16} tex={punto} aditivo pos={(i, f) => [
                (r(s, "px", i) - 0.5) * 16 + Math.sin(f * 0.02 + i) * 0.3,
                0.3 + r(s, "py", i) * 6 + Math.cos(f * 0.02 + i) * 0.2,
                3 - r(s, "pz", i) * 16,
              ]} />
            );
          case "banco":
            return <Banco3D key={k} desde={F(e.en, 0)} color={e.color ?? "#ffb547"} s={s + k} />;
          case "rayos":
            return <Rayos3D key={k} fuerza={e.fuerza ?? 1} s={s} />;
          case "alarma":
            return <Alarma key={k} desde={F(e.en, 0)} />;
          default:
            return null;
        }
      })}
    </group>
  );
};

/** Efectos que se pintan encima de todo. */
export const EfectosPantalla: React.FC<{ efectos: Efecto[] }> = ({ efectos }) => {
  const f = useCurrentFrame();
  const { F } = useVoz();
  return (
    <>
      {efectos.map((e, k) => {
        switch (e.tipo) {
          case "destello": {
            const d = F(e.en);
            const o = f < d ? 0 : 0.8 * (1 - tramo(f, d, d + 10));
            return <AbsoluteFill key={k} style={{ background: e.color ?? "#ffffff", opacity: o, pointerEvents: "none" }} />;
          }
          case "oscuridad":
            return <AbsoluteFill key={k} style={{ background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 25%, rgba(0,4,15,${0.85 * e.fuerza}) 80%)` }} />;
          case "linterna": {
            const px = e.x * 100 + Math.sin(f * 0.04) * 3;
            return <AbsoluteFill key={k} style={{ background: `radial-gradient(circle at ${px}% ${e.y * 100}%, rgba(255,250,210,0.22) 0%, rgba(255,250,210,0.08) 18%, rgba(0,0,0,0) 32%)`, mixBlendMode: "screen" }} />;
          }
          case "golpe": {
            const d = F(e.en);
            const t = f - d;
            if (t < 0 || t > 14) return null;
            const k = t / 14;
            return (
              <AbsoluteFill key={k + "g" + d} style={{ pointerEvents: "none" }}>
                <AbsoluteFill style={{ background: "#ffffff", opacity: 0.45 * Math.max(0, 1 - t / 4) }} />
                <svg width={ANCHO} height={ALTO} style={{ position: "absolute" }}>
                  <circle cx={ANCHO / 2} cy={ALTO * 0.45} r={120 + k * 900} fill="none" stroke="#ffffff" strokeWidth={60 * (1 - k)} opacity={0.6 * (1 - k)} />
                </svg>
              </AbsoluteFill>
            );
          }
          case "lineas": {
            const d = F(e.en);
            const fin = e.hasta !== undefined ? F(e.hasta) : d + 40;
            if (f < d || f > fin) return null;
            const entra = Math.min(1, (f - d) / 4) * Math.min(1, (fin - f) / 5);
            const j = Math.floor(f / 2); // cambian cada 2 fotogramas, como dibujadas a mano
            return (
              <svg key={"l" + d} width={ANCHO} height={ALTO} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none", opacity: entra }}>
                {Array.from({ length: 70 }, (_, i) => {
                  const a = (i / 70) * Math.PI * 2 + azar(j, "la", i) * 0.08;
                  const r0 = 560 + azar(j, "lr", i) * 260;
                  const w = 6 + azar(j, "lw", i) * 16;
                  const cx = ANCHO / 2, cy = ALTO * 0.45;
                  const x0 = cx + Math.cos(a) * r0, y0 = cy + Math.sin(a) * r0 * 1.5;
                  const x1 = cx + Math.cos(a) * 1600, y1 = cy + Math.sin(a) * 2400;
                  const n = { x: -Math.sin(a) * w, y: Math.cos(a) * w };
                  return <path key={i} d={`M ${x0} ${y0} L ${x1 + n.x} ${y1 + n.y} L ${x1 - n.x} ${y1 - n.y} Z`} fill={e.color ?? "#ffffff"} opacity={0.85} />;
                })}
              </svg>
            );
          }
          case "chispas": {
            const d = F(e.en);
            const t = f - d;
            if (t < 0 || t > 26) return null;
            const cx = (e.x ?? 0.5) * ANCHO, cy = (e.y ?? 0.42) * ALTO;
            return (
              <svg key={"c" + d} width={ANCHO} height={ALTO} style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}>
                {Array.from({ length: 16 }, (_, i) => {
                  const a = (i / 16) * Math.PI * 2 + azar(d, "ca", i) * 0.4;
                  const v = 18 + azar(d, "cv", i) * 22;
                  const x = cx + Math.cos(a) * v * t, y = cy + Math.sin(a) * v * t + t * t * 0.6;
                  const sc = (1 - t / 26) * (0.6 + azar(d, "cs", i) * 0.8);
                  return <path key={i} transform={`translate(${x} ${y}) rotate(${t * 12 + i * 20}) scale(${sc})`} d="M 0 -30 L 8 -8 L 30 0 L 8 8 L 0 30 L -8 8 L -30 0 L -8 -8 Z" fill={e.color ?? "#ffe46a"} stroke="#09080d" strokeWidth={4} />;
                })}
              </svg>
            );
          }
          default:
            return null;
        }
      })}
    </>
  );
};

/** Sacudida y zoom de golpe de toda la imagen (efectos golpe y zoom). */
export function impacto(efectos: Efecto[], f: number, F: (en: any, d?: number) => number): string {
  let dx = 0, dy = 0, rot = 0, esc = 1;
  for (const e of efectos) {
    if (e.tipo === "golpe") {
      const t = f - F(e.en);
      if (t >= 0 && t < 16) {
        const k = (1 - t / 16) * (e.fuerza ?? 1);
        dx += Math.sin(t * 2.7) * 26 * k;
        dy += Math.cos(t * 3.3) * 20 * k;
        rot += Math.sin(t * 2.1) * 1.2 * k;
        esc *= 1 + 0.05 * k;
      }
    }
    if (e.tipo === "zoom") {
      const t = f - F(e.en);
      if (t >= 0) {
        const entra = Math.min(1, t / 5);
        const suelta = t > 40 ? Math.max(0, 1 - (t - 40) / 20) : 1;
        esc *= 1 + ((e.a ?? 1.15) - 1) * (1 - Math.pow(1 - entra, 3)) * suelta;
      }
    }
  }
  return dx || dy || rot || esc !== 1 ? `translate(${dx}px, ${dy}px) rotate(${rot}deg) scale(${esc})` : "none";
}
