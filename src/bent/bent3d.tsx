// BENT y toda su especie en 3D: piezas con sombreado de cómic (3 tonos) y contorno negro (casco invertido).
// La cara es una TEXTURA dibujada en cada fotograma (cejas, ojos y boca de BENT), así conserva sus expresiones.
// Cada persona cambia de ATUENDO (ropa, sombrero, barba, gafas…), pero todas tienen su cuerpo y su cabeza blanca.
// Medidas en metros (mide ~1,85 m). Mira hacia +z (la cámara) y gira con `rumbo`.
import React, { useMemo } from "react";
import * as THREE from "three";
import { Pose } from "./rig";

const TINTA = "#060608";
const BORDE = 0.012;

let _grad: THREE.DataTexture | null = null;
/** Sombreado de cómic en 3 tonos, más claro que el de los escenarios (si no, la ropa negra se pierde). */
function gradiente() {
  if (_grad) return _grad;
  const d = new Uint8Array([150, 150, 150, 255, 205, 205, 205, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = THREE.NearestFilter;
  _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

// ---------------------------------------------------------------- piezas con contorno
type Geo = { t: "capsula"; r: number; l: number } | { t: "bola"; r: number } | { t: "caja"; s: [number, number, number] } | { t: "tubo"; r1: number; r2: number; h: number } | { t: "aro"; r: number; g: number };
const Geometria: React.FC<{ g: Geo; extra?: number }> = ({ g, extra = 0 }) => {
  switch (g.t) {
    case "capsula":
      return <capsuleGeometry args={[g.r + extra, g.l, 6, 16]} />;
    case "bola":
      return <sphereGeometry args={[g.r + extra, 24, 16]} />;
    case "caja":
      return <boxGeometry args={[g.s[0] + extra * 2, g.s[1] + extra * 2, g.s[2] + extra * 2]} />;
    case "tubo":
      return <cylinderGeometry args={[g.r1 + extra, g.r2 + extra, g.h + extra * 2, 20]} />;
    case "aro":
      return <torusGeometry args={[g.r, g.g + extra, 10, 32]} />;
  }
};
const Parte: React.FC<{ g: Geo; color: string; pos?: [number, number, number]; rot?: [number, number, number]; esc?: [number, number, number]; borde?: number; brillo?: number }> = ({ g, color, pos, rot, esc, borde = BORDE, brillo = 0 }) => (
  <group position={pos} rotation={rot} scale={esc}>
    <mesh>
      <Geometria g={g} />
      <meshToonMaterial color={color} gradientMap={gradiente()} emissive={color} emissiveIntensity={brillo} />
    </mesh>
    {borde > 0 && (
      <mesh>
        <Geometria g={g} extra={borde} />
        <meshBasicMaterial color={TINTA} side={THREE.BackSide} />
      </mesh>
    )}
  </group>
);

// ---------------------------------------------------------------- cara (textura)
function dibujaCara(ctx: CanvasRenderingContext2D, p: Pose, f: number) {
  const W = 1024;
  const H = 512;
  ctx.fillStyle = "#f2f3f6";
  ctx.fillRect(0, 0, W, H);
  // el frente de la esfera está en x = W/4 (u = 0.25) y el ecuador en y = H/2
  const cx = W * 0.25;
  const cy = H * 0.5;
  const k = (f + 17) % 113;
  const parpadea = k < 4;
  const ojos = (p.ojos === "normal" || p.ojos === "entornados") && parpadea ? "cerrados" : p.ojos;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(1.35, 1.35);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = TINTA;
  ctx.strokeStyle = TINTA;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const ojo = (x: number, y: number, s: number) => {
    if (ojos === "feliz") {
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(x - 15 * s, y + 6);
      ctx.quadraticCurveTo(x, y - 12, x + 15 * s, y + 6);
      ctx.stroke();
      return;
    }
    if (ojos === "cerrados") {
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(x - 15 * s, y + 3);
      ctx.quadraticCurveTo(x, y + 8, x + 15 * s, y + 3);
      ctx.stroke();
      return;
    }
    if (ojos === "abiertos") {
      ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.ellipse(x, y + 2, 16 * s, 19, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = TINTA;
      ctx.beginPath();
      ctx.arc(x + p.mira * 4, y + 3, 6, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const alto = ojos === "entornados" ? 7 : 15;
    ctx.beginPath();
    ctx.moveTo(x - 18 * s, y - 3);
    ctx.lineTo(x + 18 * s, y - 8);
    ctx.quadraticCurveTo(x + 16 * s, y + alto, x, y + alto);
    ctx.quadraticCurveTo(x - 16 * s, y + alto - 1, x - 18 * s, y - 3);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(x + 5, y + 1, 3.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = TINTA;
  };
  const ceja = (x: number, y: number, lado: number) => {
    const sube = -p.alzaCejas * 20;
    const xi = x - lado * 10;
    const xe = x + lado * 32;
    const yi = y - 22 + 10 * p.cejas + sube;
    const ye = y - 28 - 8 * p.cejas + sube + (p.cejas < 0 ? 7 * -p.cejas : 0);
    ctx.beginPath();
    ctx.moveTo(xe, ye);
    ctx.quadraticCurveTo((xi + xe) / 2, Math.min(yi, ye) - 5, xi, yi);
    ctx.lineTo(xi - lado * 2, yi + 13);
    ctx.quadraticCurveTo((xi + xe) / 2, Math.min(yi, ye) + 11, xe + lado * 3, ye + 5);
    ctx.closePath();
    ctx.fill();
  };
  const ey = cy + 26;
  ceja(cx - 44, ey, -1);
  ceja(cx + 44, ey - 3, 1);
  ojo(cx - 44, ey, 1);
  ojo(cx + 44, ey - 3, 1);
  // boca
  const bx = cx;
  const by = cy + 92;
  const a = p.abre;
  ctx.lineWidth = 6.5;
  if (p.boca === "risa" || (p.boca === "sonrisa" && a > 0.3)) {
    const h = 26 + a * 10;
    ctx.fillStyle = "#4a0f18";
    ctx.beginPath();
    ctx.moveTo(bx - 34, by - 8);
    ctx.quadraticCurveTo(bx, by - 2, bx + 34, by - 10);
    ctx.quadraticCurveTo(bx + 22, by + h, bx, by + h);
    ctx.quadraticCurveTo(bx - 22, by + h, bx - 34, by - 8);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(bx - 26, by - 8, 52, 9);
    ctx.fillStyle = "#e45a6a";
    ctx.beginPath();
    ctx.ellipse(bx, by + h - 8, 16, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  } else if (p.boca === "dientes") {
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(bx - 38, by - 12);
    ctx.quadraticCurveTo(bx, by + 2, bx + 38, by - 16);
    ctx.quadraticCurveTo(bx + 26, by + 20, bx, by + 20);
    ctx.quadraticCurveTo(bx - 26, by + 18, bx - 38, by - 12);
    ctx.fill();
    ctx.stroke();
  } else if (p.boca === "o" || p.boca === "asustada" || a > 0.15) {
    const rx = p.boca === "asustada" ? 22 : p.boca === "o" ? 11 : 15;
    const ry = p.boca === "asustada" ? 20 : p.boca === "o" ? 13 : 3 + a * 15;
    ctx.fillStyle = "#4a0f18";
    ctx.beginPath();
    ctx.ellipse(bx, by + ry * 0.4, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    ctx.beginPath();
    const curva = p.boca === "sonrisa" ? 10 : p.boca === "triste" ? -8 : p.boca === "media" ? 4 : -3;
    ctx.moveTo(bx - 24, by + (p.boca === "triste" ? 6 : 1));
    ctx.quadraticCurveTo(bx, by + curva, bx + 24, by + (p.boca === "media" ? -7 : 3));
    ctx.stroke();
  }
  ctx.restore();
}

/** Textura de la gorra: azul marino con el hueco del cierre por delante (frente blanca y tira con agujeros). */
function texturaGorra() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const x = c.getContext("2d")!;
  x.fillStyle = "#1c2444";
  x.fillRect(0, 0, 1024, 256);
  // costuras
  x.strokeStyle = "#0d1226";
  x.lineWidth = 6;
  for (let i = 0; i < 6; i++) {
    x.beginPath();
    x.moveTo((i * 1024) / 6, 0);
    x.lineTo((i * 1024) / 6, 256);
    x.stroke();
  }
  // hueco delantero (u = 0.25 → x = 256), junto al borde (abajo)
  x.fillStyle = "#f2f3f6";
  x.strokeStyle = TINTA;
  x.lineWidth = 8;
  x.beginPath();
  x.moveTo(176, 256);
  x.quadraticCurveTo(180, 120, 256, 112);
  x.quadraticCurveTo(332, 120, 336, 256);
  x.closePath();
  x.fill();
  x.stroke();
  x.fillStyle = "#0f1428";
  x.fillRect(176, 214, 160, 30);
  x.fillStyle = "#5b6280";
  for (let i = 0; i < 5; i++) {
    x.beginPath();
    x.arc(200 + i * 28, 229, 5, 0, Math.PI * 2);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ---------------------------------------------------------------- articulaciones (a partir de la pose 2D)
const rad = (g: number) => (g * Math.PI) / 180;
const PIEL = "#f2f3f6";

// ---------------------------------------------------------------- atuendos (toda la especie)
export type Atuendo3D = {
  ropa: string;
  sombra: string;
  pantalon: string;
  zapato: string;
  mochila?: boolean;
  capucha?: boolean;
  bolsillo?: boolean;
  bata?: boolean; // bata blanca larga (científico)
  botones?: string; // chaqueta con botones
  capa?: string;
  cuello?: "camiseta" | "marinero" | "camisa";
  sombrero: "gorra-atras" | "marinero" | "capitan" | "corona" | "canoso" | "pelo-corto" | "gorro" | "calvo" | "fedora" | "ushanka" | "almirante";
  pajarita?: string; // pajarita (Churchill)
  puro?: boolean; // puro en la boca, con la punta encendida
  galones?: string; // galones dorados en los puños (almirante)
  corbata?: string; // traje con corbata
  gafasSol?: boolean; // gafas de sol negras (agente)
  colorSombrero?: string;
  barba?: string;
  bigote?: string;
  gafas?: boolean;
  escala?: [number, number]; // complexión: ancho, alto
  luz?: boolean; // luz propia de cine (solo el protagonista)
};

export const ATUENDOS_3D: Record<string, Atuendo3D> = {
  bent: { ropa: "#2e2e35", sombra: "#1b1b20", pantalon: "#1d1d22", zapato: "#18181d", mochila: true, capucha: true, bolsillo: true, cuello: "camiseta", sombrero: "gorra-atras", luz: true },
  marinero: { ropa: "#2c4170", sombra: "#1d2c4f", pantalon: "#1d2740", zapato: "#141418", cuello: "marinero", sombrero: "marinero", colorSombrero: "#eef0f3" },
  capitan: { ropa: "#1c2540", sombra: "#121a30", pantalon: "#161c2e", zapato: "#0f0f12", botones: "#d1a94c", cuello: "camisa", sombrero: "capitan", barba: "#c4c7cf", escala: [1.12, 1] },
  cientifico: { ropa: "#d6dae1", sombra: "#b3b9c3", pantalon: "#33373f", zapato: "#2a2420", bata: true, cuello: "camisa", sombrero: "canoso", colorSombrero: "#d5d8de", gafas: true, escala: [0.95, 0.97] },
  millonario: { ropa: "#8a8070", sombra: "#6a6254", pantalon: "#6f675a", zapato: "#2a1d14", corbata: "#7a1d24", cuello: "camisa", sombrero: "fedora", colorSombrero: "#4a4036", bigote: "#3a2a20", escala: [0.96, 1.02] },
  agente: { ropa: "#1d1f25", sombra: "#121317", pantalon: "#17181d", zapato: "#0c0c0e", corbata: "#0e0e10", cuello: "camisa", sombrero: "pelo-corto", colorSombrero: "#2a2420", gafasSol: true, escala: [1.05, 1] },
  sovietico: { ropa: "#3d4438", sombra: "#2a3027", pantalon: "#262a24", zapato: "#121210", botones: "#c9a24a", cuello: "camisa", sombrero: "ushanka", colorSombrero: "#5a4e44", escala: [1.1, 1] },
  // vídeo 3 (Proyecto Habakkuk, 1942-43)
  inventor: { ropa: "#5d4c3a", sombra: "#43362a", pantalon: "#3f362c", zapato: "#2a1d14", corbata: "#2e3a2a", cuello: "camisa", sombrero: "pelo-corto", colorSombrero: "#3a2c22", barba: "#3a2c22", gafas: true, escala: [0.88, 1.05] },
  almirante: { ropa: "#151a2c", sombra: "#0d111e", pantalon: "#121626", zapato: "#0a0a0c", botones: "#d8b04e", corbata: "#0a0a0c", cuello: "camisa", sombrero: "almirante", galones: "#d8b04e", bigote: "#b8bcc4", escala: [1.08, 1] },
  churchill: { ropa: "#24252c", sombra: "#16171c", pantalon: "#2a2b32", zapato: "#0e0e10", pajarita: "#2c3e7a", cuello: "camisa", sombrero: "calvo", colorSombrero: "#d8c6ae", puro: true, escala: [1.3, 0.93] },
  rey: { ropa: "#6b1b2c", sombra: "#4a1220", pantalon: "#2a1420", zapato: "#1a0f0c", botones: "#d1a94c", capa: "#3a0e18", cuello: "camisa", sombrero: "corona", colorSombrero: "#3a2a22", bigote: "#5a4030", escala: [1.14, 1] },
};

// ---------------------------------------------------------------- manos
const Mano3D: React.FC<{ mano: string }> = ({ mano }) => {
  if (mano === "bolsillo") return null;
  const dedo = (x: number, y: number, z: number, l: number, rz = 0, rx = 0, k = 0) => <Parte key={k} g={{ t: "capsula", r: 0.016, l }} color={PIEL} pos={[x, y, z]} rot={[rx, 0, rz]} borde={0.007} />;
  return (
    <group>
      <Parte g={{ t: "bola", r: 0.056 }} color={PIEL} esc={[1, 1.05, 0.85]} borde={0.009} />
      {/* pulgar */}
      {dedo(0.05, -0.02, 0.025, mano === "abierta" ? 0.045 : 0.03, 0.9, -0.3)}
      {mano === "senala" && dedo(0.012, -0.095, 0.01, 0.075, 0, 0, 1)}
      {mano === "v" && (
        <group>
          {dedo(0.02, -0.09, 0.01, 0.07, 0.25, 0, 1)}
          {dedo(-0.02, -0.09, 0.01, 0.07, -0.25, 0, 2)}
        </group>
      )}
      {mano === "abierta" && [-0.036, -0.012, 0.012, 0.036].map((x, i) => dedo(x, -0.085, 0.006, 0.055 + (i === 1 || i === 2 ? 0.01 : 0), -x * 5, 0, i + 3))}
      {(mano === "puno" || mano === "senala") && <Parte g={{ t: "caja", s: [0.08, 0.012, 0.05] }} color="#d9dce3" pos={[0, -0.045, 0.02]} borde={0} />}
    </group>
  );
};

/** Brazo: cuelga del hombro. `adelante` y `fuera` en radianes; `codo` dobla hacia delante. Manga abultada. */
const Brazo3D: React.FC<{ lado: -1 | 1; adelante: number; fuera: number; codo: number; mano: string; at: Atuendo3D }> = ({ lado, adelante, fuera, codo, mano, at }) => (
  <group rotation={[-adelante, 0, fuera * lado]}>
    <Parte g={{ t: "bola", r: 0.085 }} color={at.ropa} pos={[0, -0.01, 0]} esc={[1, 0.9, 1]} />
    <Parte g={{ t: "capsula", r: 0.072, l: 0.19 }} color={at.ropa} pos={[0, -0.135, 0]} />
    <group position={[0, -0.27, 0]} rotation={[-codo, 0, 0]}>
      <Parte g={{ t: "bola", r: 0.07 }} color={at.sombra} borde={0} />
      <Parte g={{ t: "capsula", r: 0.066, l: 0.16 }} color={at.ropa} pos={[0, -0.11, 0]} />
      <Parte g={{ t: "tubo", r1: 0.06, r2: 0.068, h: 0.055 }} color={at.galones ?? at.sombra} pos={[0, -0.235, 0]} brillo={at.galones ? 0.12 : undefined} />
      <group position={[0, -0.3, 0]}>
        <Mano3D mano={mano} />
      </group>
    </group>
  </group>
);

const Pierna3D: React.FC<{ adelante: number; rodilla: number; fuera: number; at: Atuendo3D }> = ({ adelante, rodilla, fuera, at }) => (
  <group rotation={[-adelante, 0, fuera]}>
    <Parte g={{ t: "capsula", r: 0.105, l: 0.24 }} color={at.pantalon} pos={[0, -0.19, 0]} />
    <group position={[0, -0.38, 0]} rotation={[rodilla, 0, 0]}>
      <Parte g={{ t: "capsula", r: 0.098, l: 0.2 }} color={at.pantalon} pos={[0, -0.16, 0]} />
      {/* pernera arrugada sobre la zapatilla */}
      <Parte g={{ t: "tubo", r1: 0.1, r2: 0.112, h: 0.06 }} color={at.pantalon} pos={[0, -0.3, 0]} />
      {/* zapatilla alta: caña, puntera redonda, cordones y suela blanca */}
      <group position={[0, -0.36, 0.04]} rotation={[-rodilla * 0.3, 0, 0]}>
        <Parte g={{ t: "caja", s: [0.15, 0.13, 0.26] }} color={at.zapato} pos={[0, -0.02, 0]} />
        <Parte g={{ t: "bola", r: 0.075 }} color={at.zapato} pos={[0, -0.04, 0.13]} esc={[1, 0.7, 0.9]} />
        {[0, 1, 2].map((i) => (
          <Parte key={i} g={{ t: "caja", s: [0.08, 0.008, 0.012] }} color="#4a4a54" pos={[0, 0.02 - i * 0.03, 0.135 - i * 0.012]} borde={0} />
        ))}
        <Parte g={{ t: "caja", s: [0.16, 0.04, 0.33] }} color="#eceef2" pos={[0, -0.1, 0.03]} />
      </group>
    </group>
  </group>
);

// ---------------------------------------------------------------- sombreros y detalles de la cabeza (radio RC)
const RC = 0.255;
const Sombrero3D: React.FC<{ at: Atuendo3D; gorra: THREE.Texture }> = ({ at, gorra }) => {
  const c = at.colorSombrero ?? "#1c2444";
  switch (at.sombrero) {
    case "gorra-atras":
      return (
        <group rotation={[-0.38, 0, -0.12]}>
          <mesh>
            <sphereGeometry args={[RC + 0.013, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshToonMaterial map={gorra} gradientMap={gradiente()} side={THREE.DoubleSide} />
          </mesh>
          <mesh>
            <sphereGeometry args={[RC + 0.013 + BORDE, 32, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshBasicMaterial color={TINTA} side={THREE.BackSide} />
          </mesh>
          <group position={[0, -0.005, -0.24]} rotation={[0.22, 0, 0]}>
            <Parte g={{ t: "tubo", r1: 0.15, r2: 0.15, h: 0.016 }} color="#151b35" esc={[1, 1, 0.75]} />
          </group>
          <Parte g={{ t: "bola", r: 0.026 }} color="#1c2444" pos={[0, RC + 0.013, 0]} esc={[1, 0.5, 1]} borde={0.006} />
        </group>
      );
    case "marinero":
      return (
        <group rotation={[-0.15, 0, 0.15]} position={[0, 0.17, 0]}>
          <Parte g={{ t: "tubo", r1: 0.17, r2: 0.2, h: 0.14 }} color={c} pos={[0, 0.06, 0]} />
          <Parte g={{ t: "bola", r: 0.17 }} color={c} pos={[0, 0.12, 0]} esc={[1, 0.35, 1]} />
          <Parte g={{ t: "aro", r: 0.21, g: 0.03 }} color="#ffffff" pos={[0, 0, 0]} rot={[Math.PI / 2, 0, 0]} />
        </group>
      );
    case "capitan":
      return (
        <group position={[0, 0.16, 0]} rotation={[-0.08, 0, 0]}>
          <Parte g={{ t: "tubo", r1: 0.22, r2: 0.21, h: 0.07 }} color="#121318" />
          <Parte g={{ t: "tubo", r1: 0.28, r2: 0.23, h: 0.07 }} color="#f2f3f5" pos={[0, 0.07, -0.01]} esc={[1, 1, 0.95]} />
          <group position={[0, -0.03, 0.17]} rotation={[0.45, 0, 0]}>
            <Parte g={{ t: "tubo", r1: 0.15, r2: 0.15, h: 0.014 }} color="#0a0b0e" esc={[1, 1, 0.55]} />
          </group>
          <Parte g={{ t: "caja", s: [0.06, 0.04, 0.01] }} color="#d1a94c" pos={[0, 0.005, 0.22]} brillo={0.15} borde={0.006} />
        </group>
      );
    case "corona":
      return (
        <group position={[0, 0.16, 0]}>
          <Parte g={{ t: "bola", r: RC + 0.01 }} color={c} pos={[0, -0.13, -0.01]} esc={[1, 0.7, 1]} />
          <Parte g={{ t: "tubo", r1: 0.16, r2: 0.15, h: 0.07 }} color="#d8b04e" pos={[0, 0.06, 0]} brillo={0.12} />
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2;
            return <Parte key={i} g={{ t: "bola", r: 0.025 }} color={i % 2 ? "#9b1b2a" : "#d8b04e"} pos={[Math.sin(a) * 0.155, 0.12, Math.cos(a) * 0.155]} borde={0.006} />;
          })}
        </group>
      );
    case "canoso":
      return (
        <group>
          {[
            [-0.22, 0.02, -0.04],
            [0.22, 0.02, -0.04],
            [-0.2, 0.1, -0.1],
            [0.2, 0.1, -0.1],
            [0, 0.12, -0.2],
            [-0.12, 0.18, -0.14],
            [0.12, 0.18, -0.14],
          ].map((q, i) => (
            <Parte key={i} g={{ t: "bola", r: 0.05 + (i % 3) * 0.01 }} color={c} pos={[q[0] * 1.05, q[1], q[2]]} borde={0.007} />
          ))}
        </group>
      );
    case "pelo-corto":
      return (
        <mesh rotation={[-0.25, 0, 0]}>
          <sphereGeometry args={[RC + 0.012, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          <meshToonMaterial color={c} gradientMap={gradiente()} />
        </mesh>
      );
    case "gorro":
      return (
        <group>
          <mesh rotation={[-0.15, 0, 0]}>
            <sphereGeometry args={[RC + 0.02, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
            <meshToonMaterial color={c} gradientMap={gradiente()} />
          </mesh>
          <Parte g={{ t: "aro", r: RC - 0.01, g: 0.035 }} color={c} pos={[0, 0.03, 0.03]} rot={[Math.PI / 2 + 0.15, 0, 0]} />
        </group>
      );
    case "fedora":
      return (
        <group position={[0, 0.17, 0]} rotation={[-0.12, 0, 0.06]}>
          <Parte g={{ t: "tubo", r1: 0.35, r2: 0.35, h: 0.018 }} color={c} pos={[0, -0.02, 0.01]} esc={[1, 1, 0.92]} />
          <Parte g={{ t: "tubo", r1: 0.2, r2: 0.23, h: 0.15 }} color={c} pos={[0, 0.06, 0]} esc={[1, 1, 0.9]} />
          <Parte g={{ t: "bola", r: 0.2 }} color={c} pos={[0, 0.13, 0]} esc={[1, 0.3, 0.9]} />
          <Parte g={{ t: "tubo", r1: 0.232, r2: 0.232, h: 0.035 }} color="#1a1612" pos={[0, 0.0, 0]} esc={[1, 1, 0.9]} borde={0.004} />
        </group>
      );
    case "almirante":
      return (
        <group position={[0, 0.16, 0]} rotation={[-0.06, 0, 0]}>
          <Parte g={{ t: "tubo", r1: 0.22, r2: 0.21, h: 0.07 }} color="#0c0d12" />
          <Parte g={{ t: "tubo", r1: 0.285, r2: 0.235, h: 0.075 }} color="#141a2c" pos={[0, 0.072, -0.01]} esc={[1, 1, 0.95]} />
          <group position={[0, -0.03, 0.17]} rotation={[0.45, 0, 0]}>
            <Parte g={{ t: "tubo", r1: 0.15, r2: 0.15, h: 0.014 }} color="#0a0b0e" esc={[1, 1, 0.55]} />
            <Parte g={{ t: "caja", s: [0.2, 0.004, 0.02] }} color="#d8b04e" pos={[0, 0.009, 0.06]} brillo={0.2} borde={0} />
          </group>
          <Parte g={{ t: "bola", r: 0.035 }} color="#d8b04e" pos={[0, 0.01, 0.222]} esc={[1.3, 1, 0.3]} brillo={0.2} borde={0.006} />
        </group>
      );
    case "calvo":
      return (
        <group>
          {[-1, 1].map((l) =>
            [0, 1, 2].map((k) => <Parte key={`${l}${k}`} g={{ t: "bola", r: 0.045 }} color={c} pos={[l * 0.235, 0.02 + k * 0.03, -0.05 - k * 0.06]} esc={[0.6, 1, 1]} borde={0.006} />),
          )}
        </group>
      );
    case "ushanka":
      return (
        <group position={[0, 0.12, 0]}>
          <mesh rotation={[-0.1, 0, 0]}>
            <sphereGeometry args={[RC + 0.045, 32, 14, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
            <meshToonMaterial color={c} gradientMap={gradiente()} />
          </mesh>
          <Parte g={{ t: "aro", r: RC + 0.02, g: 0.05 }} color={c} pos={[0, -0.01, 0]} rot={[Math.PI / 2 - 0.1, 0, 0]} />
          {[-1, 1].map((l) => (
            <Parte key={l} g={{ t: "caja", s: [0.05, 0.16, 0.16] }} color={c} pos={[l * 0.26, -0.1, -0.02]} rot={[0, 0, l * 0.15]} />
          ))}
          <Parte g={{ t: "caja", s: [0.05, 0.05, 0.01] }} color="#c42a2a" pos={[0, 0.04, 0.285]} brillo={0.2} borde={0.004} />
        </group>
      );
    default:
      return null;
  }
};

// ---------------------------------------------------------------- persona entera
export const Persona3D: React.FC<{ p: Pose; f: number; rumbo: number; anim: string; t: number; at?: Atuendo3D }> = ({ p, f, rumbo, anim, t, at = ATUENDOS_3D.bent }) => {
  const caraTex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 512;
    const tx = new THREE.CanvasTexture(c);
    tx.colorSpace = THREE.SRGBColorSpace;
    return { c, t: tx };
  }, []);
  const gorra = useMemo(() => texturaGorra(), []);
  dibujaCara(caraTex.c.getContext("2d")!, p, f);
  caraTex.t.needsUpdate = true;

  // de la pose (ángulos de la animación) a 3D
  const brazoDe = (h: number, c: number, mano: string, lado: -1 | 1) =>
    mano === "bolsillo" ? { adelante: 0.35, fuera: 0.3, codo: 1.15 } : { adelante: Math.max(0, Math.min(1.6, Math.abs(rad(c)) * 0.6)), fuera: rad(h * lado), codo: Math.min(2.4, Math.abs(rad(c))) };
  const brazoA = brazoDe(p.bA.h, p.bA.c, p.bA.mano, -1);
  const brazoB = brazoDe(p.bB.h, p.bB.c, p.bB.mano, 1);
  let piernaA = { adelante: rad(p.pA.h + 5) * 1.2, rodilla: rad(Math.abs(p.pA.r)) };
  let piernaB = { adelante: rad(9 - p.pB.h) * 1.2, rodilla: rad(Math.abs(p.pB.r)) };
  if (anim === "camina" || anim === "corre") {
    const corre = anim === "corre";
    const c = t * (corre ? 0.42 : 0.26);
    const a = Math.sin(c);
    const amp = corre ? 0.8 : 0.42;
    piernaA = { adelante: a * amp, rodilla: Math.max(0, a) * (corre ? 1.3 : 0.55) + 0.08 };
    piernaB = { adelante: -a * amp, rodilla: Math.max(0, -a) * (corre ? 1.3 : 0.55) + 0.08 };
    Object.assign(brazoA, { adelante: -a * (corre ? 0.9 : 0.4), fuera: 0.12, codo: corre ? 1.5 : 0.35 });
    Object.assign(brazoB, { adelante: a * (corre ? 0.9 : 0.4), fuera: 0.12, codo: corre ? 1.5 : 0.35 });
  }
  const caderaY = 0.82 + (-p.y / 950) * 1.85 - Math.max(piernaA.rodilla, piernaB.rodilla) * 0.05;
  const hombros = p.hombros * 0.05;
  const [ex, ey] = at.escala ?? [1, 1];
  const torso = at.bata ? at.ropa : at.ropa;
  return (
    <group rotation={[0, rumbo, 0]} scale={[ex, ey, ex]}>
      {at.luz && (
        <>
          {/* luz de relleno que acompaña al protagonista (como en el cine) y luz de contorno por detrás */}
          <pointLight position={[0.8, 1.9, 2.2]} intensity={6} distance={6} color="#fff1e0" />
          <pointLight position={[-0.6, 2.2, -1.6]} intensity={5} distance={5} color="#9fc8ff" />
        </>
      )}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.32, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <group position={[0, caderaY, 0]}>
        <group position={[-0.1, 0, 0]}>
          <Pierna3D {...piernaA} fuera={-0.04} at={at} />
        </group>
        <group position={[0.1, 0, 0]}>
          <Pierna3D {...piernaB} fuera={0.04} at={at} />
        </group>
        {/* tronco */}
        <group rotation={[rad(p.inclina), 0, 0]}>
          {at.capa && <Parte g={{ t: "caja", s: [0.5, 0.95, 0.03] }} color={at.capa} pos={[0, 0.06, -0.2]} rot={[0.08, 0, 0]} />}
          {/* sudadera: tronco amplio con pecho y espalda redondeados */}
          <Parte g={{ t: "capsula", r: 0.215, l: 0.3 }} color={torso} pos={[0, 0.28, 0]} esc={[1.06, 1, 0.76]} />
          <Parte g={{ t: "bola", r: 0.2 }} color={torso} pos={[0, 0.42, 0.03]} esc={[1.15, 0.6, 0.8]} borde={0} />
          {/* bajo elástico */}
          <Parte g={{ t: "aro", r: 0.21, g: 0.035 }} color={at.sombra} pos={[0, 0.06, 0]} rot={[Math.PI / 2, 0, 0]} esc={[1.06, 0.76, 1]} />
          {/* pliegues a los lados */}
          {[-1, 1].map((l) => (
            <Parte key={l} g={{ t: "capsula", r: 0.012, l: 0.14 }} color={at.sombra} pos={[l * 0.2, 0.2, 0.05]} rot={[0, 0, l * 0.25]} borde={0} />
          ))}
          {at.bata && (
            <group>
              {/* faldones de la bata */}
              <Parte g={{ t: "tubo", r1: 0.225, r2: 0.25, h: 0.28 }} color={at.ropa} pos={[0, -0.08, 0]} esc={[1.06, 1, 0.78]} />
              <Parte g={{ t: "caja", s: [0.008, 0.6, 0.01] }} color={TINTA} pos={[0, 0.12, 0.17]} borde={0} />
              <Parte g={{ t: "caja", s: [0.07, 0.07, 0.01] }} color="#cfd4dc" pos={[0.1, 0.38, 0.165]} />
              <Parte g={{ t: "capsula", r: 0.008, l: 0.05 }} color="#2b3a55" pos={[0.09, 0.42, 0.17]} borde={0.004} />
            </group>
          )}
          {at.bolsillo && (
            <group>
              <Parte g={{ t: "caja", s: [0.27, 0.13, 0.025] }} color="#26262c" pos={[0, 0.165, 0.158]} rot={[-0.12, 0, 0]} />
              <Parte g={{ t: "caja", s: [0.21, 0.01, 0.01] }} color={TINTA} pos={[0, 0.232, 0.17]} borde={0} />
              <Parte g={{ t: "caja", s: [0.008, 0.38, 0.01] }} color={TINTA} pos={[0.01, 0.32, 0.162]} borde={0} />
            </group>
          )}
          {at.corbata && (
            <group>
              <Parte g={{ t: "caja", s: [0.13, 0.42, 0.01] }} color="#eceef2" pos={[0, 0.34, 0.158]} rot={[-0.05, 0, 0]} borde={0} />
              <Parte g={{ t: "caja", s: [0.045, 0.3, 0.012] }} color={at.corbata} pos={[0, 0.36, 0.168]} rot={[-0.05, 0, 0]} borde={0.004} />
              {[-1, 1].map((l) => (
                <Parte key={l} g={{ t: "caja", s: [0.05, 0.3, 0.012] }} color={at.sombra} pos={[l * 0.085, 0.38, 0.165]} rot={[-0.05, 0, l * -0.3]} borde={0.004} />
              ))}
            </group>
          )}
          {at.pajarita && (
            <group position={[0, 0.505 + hombros, 0.145]}>
              {[-1, 1].map((l) => (
                <Parte key={l} g={{ t: "tubo", r1: 0.004, r2: 0.038, h: 0.06 }} color={at.pajarita!} pos={[l * 0.03, 0, 0]} rot={[0, 0, (l * Math.PI) / 2]} borde={0.004} />
              ))}
              <Parte g={{ t: "bola", r: 0.016 }} color={at.pajarita} borde={0.004} />
              {[[-0.03, 0.01], [0.032, -0.008], [-0.022, -0.012], [0.026, 0.012]].map(([x, y], i) => (
                <Parte key={`p${i}`} g={{ t: "bola", r: 0.005 }} color="#e8e8f0" pos={[x, y, 0.02]} borde={0} />
              ))}
            </group>
          )}
          {at.botones &&
            [0.12, 0.22, 0.32, 0.42].map((y) => <Parte key={y} g={{ t: "bola", r: 0.016 }} color={at.botones!} pos={[0, y, 0.165]} brillo={0.1} borde={0.005} />)}
          {/* capucha: caída por la espalda y alrededor del cuello, con cordones */}
          {at.capucha && (
            <group>
              <Parte g={{ t: "aro", r: 0.125, g: 0.06 }} color={at.ropa} pos={[0, 0.52 + hombros, -0.02]} rot={[Math.PI / 2 - 0.3, 0, 0]} />
              <Parte g={{ t: "bola", r: 0.15 }} color={at.ropa} pos={[0, 0.5 + hombros, -0.15]} esc={[1, 0.75, 0.6]} />
              {[-0.04, 0.05].map((x) => (
                <Parte key={x} g={{ t: "capsula", r: 0.009, l: 0.12 }} color="#3a3a42" pos={[x, 0.42, 0.162]} borde={0.005} />
              ))}
            </group>
          )}
          {/* cuello */}
          {at.cuello === "camiseta" && <Parte g={{ t: "tubo", r1: 0.06, r2: 0.065, h: 0.06 }} color="#eceef2" pos={[0, 0.54 + hombros, 0]} />}
          {at.cuello === "camisa" && (
            <group>
              <Parte g={{ t: "tubo", r1: 0.07, r2: 0.08, h: 0.06 }} color="#eceef2" pos={[0, 0.54 + hombros, 0]} />
              {[-1, 1].map((l) => (
                <Parte key={l} g={{ t: "caja", s: [0.06, 0.05, 0.01] }} color="#eceef2" pos={[l * 0.035, 0.5 + hombros, 0.13]} rot={[0, 0, l * 0.5]} borde={0.005} />
              ))}
            </group>
          )}
          {at.cuello === "marinero" && (
            <group>
              <Parte g={{ t: "tubo", r1: 0.07, r2: 0.08, h: 0.06 }} color="#eceef2" pos={[0, 0.54 + hombros, 0]} />
              <Parte g={{ t: "caja", s: [0.32, 0.22, 0.02] }} color="#1b2740" pos={[0, 0.44 + hombros, -0.17]} rot={[-0.2, 0, 0]} />
              <Parte g={{ t: "caja", s: [0.3, 0.012, 0.01] }} color="#ffffff" pos={[0, 0.37 + hombros, -0.18]} borde={0} />
              <Parte g={{ t: "bola", r: 0.035 }} color="#8a1a26" pos={[0, 0.44, 0.165]} esc={[1, 1.4, 0.6]} borde={0.006} />
            </group>
          )}
          {/* mochila con bolsillo, asa y tirantes */}
          {at.mochila && (
            <group>
              <Parte g={{ t: "capsula", r: 0.09, l: 0.3 }} color="#1b1b20" pos={[0, 0.3, -0.24]} esc={[1.85, 1, 0.95]} />
              <Parte g={{ t: "caja", s: [0.24, 0.16, 0.06] }} color="#222228" pos={[0, 0.2, -0.33]} />
              <Parte g={{ t: "aro", r: 0.04, g: 0.01 }} color="#111114" pos={[0, 0.55, -0.24]} />
              {[-0.12, 0.12].map((x) => (
                <Parte key={x} g={{ t: "caja", s: [0.05, 0.36, 0.02] }} color="#131317" pos={[x, 0.34, 0.168]} rot={[-0.08, 0, 0]} />
              ))}
              <Parte g={{ t: "caja", s: [0.28, 0.03, 0.02] }} color="#131317" pos={[0, 0.38, 0.175]} />
              <Parte g={{ t: "caja", s: [0.05, 0.05, 0.02] }} color="#2a2a31" pos={[0, 0.38, 0.185]} borde={0.006} />
            </group>
          )}
          {/* brazos */}
          <group position={[-0.25, 0.47 + hombros, 0]}>
            <Brazo3D lado={-1} {...brazoA} mano={p.bA.mano} at={at} />
          </group>
          <group position={[0.25, 0.47 + hombros, 0]}>
            <Brazo3D lado={1} {...brazoB} mano={p.bB.mano} at={at} />
          </group>
          {/* cabeza */}
          <group position={[0, 0.8 + hombros * 0.6, 0.01]} rotation={[rad(p.cabeza) * 0.6, 0, rad(-p.cabeza) * 0.3]}>
            <mesh>
              <sphereGeometry args={[RC, 40, 28]} />
              <meshToonMaterial map={caraTex.t} gradientMap={gradiente()} emissive="#ffffff" emissiveMap={caraTex.t} emissiveIntensity={0.28} />
            </mesh>
            <mesh>
              <sphereGeometry args={[RC + BORDE, 32, 20]} />
              <meshBasicMaterial color={TINTA} side={THREE.BackSide} />
            </mesh>
            {at.barba && <Parte g={{ t: "bola", r: 0.12 }} color={at.barba} pos={[0, -0.3, 0.1]} esc={[1.15, 0.62, 0.7]} />}
            {at.bigote && <Parte g={{ t: "capsula", r: 0.022, l: 0.1 }} color={at.bigote} pos={[0, -0.148, 0.215]} rot={[0, 0, Math.PI / 2]} borde={0.006} />}
            {at.puro && (
              <group position={[0.07, -0.165, 0.225]} rotation={[0.25, 0.35, 0]}>
                <Parte g={{ t: "capsula", r: 0.018, l: 0.13 }} color="#6a4426" pos={[0, 0, 0.06]} rot={[Math.PI / 2, 0, 0]} borde={0.005} />
                <Parte g={{ t: "tubo", r1: 0.019, r2: 0.019, h: 0.012 }} color="#c9a24a" pos={[0, 0, 0.03]} rot={[Math.PI / 2, 0, 0]} borde={0} />
                <Parte g={{ t: "bola", r: 0.017 }} color="#ff7a30" pos={[0, 0, 0.13]} brillo={0.9} borde={0} />
              </group>
            )}
            {at.gafas && (
              <group position={[0, -0.055, 0.25]}>
                {[-0.088, 0.088].map((x) => (
                  <Parte key={x} g={{ t: "aro", r: 0.048, g: 0.006 }} color="#1a1a1f" pos={[x, 0, 0]} borde={0} />
                ))}
                <Parte g={{ t: "capsula", r: 0.005, l: 0.06 }} color="#1a1a1f" pos={[0, 0.005, 0.01]} rot={[0, 0, Math.PI / 2]} borde={0} />
              </group>
            )}
            {at.gafasSol && (
              <group position={[0, -0.05, 0.245]}>
                {[-0.085, 0.085].map((x) => (
                  <Parte key={x} g={{ t: "caja", s: [0.11, 0.06, 0.015] }} color="#050507" pos={[x, 0, 0]} rot={[0, x * 2.2, 0]} borde={0.004} />
                ))}
                <Parte g={{ t: "caja", s: [0.06, 0.012, 0.012] }} color="#050507" pos={[0, 0.02, 0.005]} borde={0} />
              </group>
            )}
            <Sombrero3D at={at} gorra={gorra} />
          </group>
        </group>
      </group>
    </group>
  );
};
