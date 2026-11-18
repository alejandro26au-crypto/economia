// Escenarios 3D (Three.js) con aspecto cinematográfico: luz realista, niebla de profundidad, siluetas lejanas y
// cosas en primer plano para que la cámara tenga capas (delante, medio, fondo). Los personajes 2D se colocan
// dentro (ver Short.tsx). Medidas en metros: el suelo está en y = 0 y la cámara mira, por defecto, hacia -z.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";
import { azar } from "./azar";
import { Cielo, Pieza, texturaBaldosas } from "./piezas3d";
import { Escenario } from "./tipos";
import { ESCENARIOS_AZORIAN } from "./escenarios-azorian";
import { ESCENARIOS_NUEVOS } from "./escenarios-nuevos";
import { ESCENARIOS_PIRATA } from "./escenarios-pirata";
import { ESCENARIOS_OLAS } from "./escenarios-olas";
import { ESCENARIOS_HOLLAND } from "./escenarios-holland";
import { ESCENARIOS_HABAKKUK } from "./escenarios-habakkuk";

const R = (s: number, ...k: (string | number)[]) => azar(s, "esc", ...k);
type V3 = [number, number, number];

// ---------------------------------------------------------------- comunes
/** Niebla y color de fondo de la ESCENA (no de un grupo). */
export const Ambiente: React.FC<{ niebla: [string, number, number]; fondo?: string }> = ({ niebla, fondo }) => {
  const scene = useThree((st) => st.scene);
  scene.fog = new THREE.Fog(niebla[0], niebla[1], niebla[2]);
  scene.background = new THREE.Color(fondo ?? niebla[0]);
  return null;
};

/** Terreno con relieve (plano en el sitio de los personajes, más abrupto lejos). Caras planas: aspecto low-poly. */
export const Terreno: React.FC<{ color: string; s: number; amp?: number; tam?: number }> = ({ color, s, amp = 0.8, tam = 180 }) => {
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(tam, tam, 90, 90);
    g.rotateX(-Math.PI / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i);
      const z = p.getZ(i);
      const lejos = Math.min(1, Math.max(0, (Math.hypot(x, z + 2.5) - 4) / 10));
      const h = Math.sin(x * 0.3 + s) + Math.sin(z * 0.23 + s * 2) * 0.8 + Math.sin((x + z) * 0.8 + s * 3) * 0.3 + Math.sin(x * 1.7 - z * 1.3) * 0.12;
      p.setY(i, lejos * amp * h + lejos * lejos * Math.max(0, -z - 25) * 0.06 - 0.02);
    }
    g.computeVertexNormals();
    return g;
  }, [s, amp, tam]);
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} roughness={0.95} flatShading />
    </mesh>
  );
};

/** Superficie del mar vista desde abajo, ondulando y brillando. */
const TechoAgua: React.FC<{ y: number; color: string; opacidad?: number }> = ({ y, color, opacidad = 0.45 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(240, 240, 48, 48);
    g.rotateX(Math.PI / 2);
    return g;
  }, []);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, Math.sin(x * 0.25 + f * 0.05) * 0.6 + Math.cos(z * 0.3 + f * 0.04) * 0.6);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshBasicMaterial color={color} transparent opacity={opacidad} side={THREE.DoubleSide} fog={false} />
    </mesh>
  );
};

/** Haces de luz que bajan desde la superficie. */
export const Rayos3D: React.FC<{ fuerza?: number; s: number; alto?: number; color?: string }> = ({ fuerza = 1, s, alto = 22, color = "#bfe6ff" }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => {
        const x = -16 + i * 4 + R(s, "rx", i) * 2;
        const z = -3 - R(s, "rz", i) * 18;
        const o = (0.035 + 0.025 * Math.sin(f * 0.04 + i * 2)) * fuerza;
        return (
          <mesh key={i} position={[x, alto / 2 - 1, z]} rotation={[0.15 * Math.sin(f * 0.008 + i), 0, 0.3 + Math.sin(f * 0.01 + i) * 0.04]}>
            <cylinderGeometry args={[0.4, 2 + R(s, "rw", i) * 2.2, alto + 6, 16, 1, true]} />
            <meshBasicMaterial color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} fog={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Alga alta que se mece. */
const Alga: React.FC<{ pos: V3; alto: number; color: string; fase: number }> = ({ pos, alto, color, fase }) => {
  const f = useCurrentFrame();
  const n = 8;
  const tramo = alto / n;
  let x = 0;
  let y = 0;
  const trozos: React.ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    const ang = Math.sin(f * 0.035 + fase + i * 0.45) * 0.1 * (i / n + 0.3);
    trozos.push(<Pieza key={i} forma={{ f: "caja", t: [0.28 - i * 0.018, tramo * 1.1, 0.05] }} color={color} pos={[pos[0] + x, pos[1] + y + tramo / 2, pos[2]]} rot={[0, fase, ang]} rugoso={0.6} doble />);
    x -= Math.sin(ang) * tramo;
    y += Math.cos(ang) * tramo;
  }
  return <group>{trozos}</group>;
};

const CoralRama: React.FC<{ pos: V3; tam: number; color: string; s: number }> = ({ pos, tam, color, s }) => (
  <group position={pos} scale={tam}>
    <Pieza forma={{ f: "tubo", r: 0.1, r2: 0.06, h: 0.9 }} color={color} pos={[0, 0.45, 0]} />
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 + s;
      return (
        <group key={i} position={[0, 0.45 + i * 0.1, 0]} rotation={[Math.cos(a) * 0.75, a, Math.sin(a) * 0.75]}>
          <Pieza forma={{ f: "tubo", r: 0.06, r2: 0.035, h: 0.75 }} color={color} pos={[0, 0.37, 0]} />
          <group position={[0, 0.6, 0]} rotation={[0.6, 0, 0]}>
            <Pieza forma={{ f: "tubo", r: 0.035, r2: 0.02, h: 0.35 }} color={color} pos={[0, 0.17, 0]} />
          </group>
        </group>
      );
    })}
  </group>
);

/** Peces lejanos (siluetas oscuras) dando vueltas. */
const Peces: React.FC<{ s: number; n?: number; color: string; radio?: number; alto?: [number, number] }> = ({ s, n = 14, color, radio = 10, alto = [2, 8] }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const vel = 0.004 + R(s, "pv", i) * 0.005;
        const a = f * vel + R(s, "pa", i) * Math.PI * 2;
        const r = radio + R(s, "pr", i) * 8;
        const y = alto[0] + R(s, "py", i) * (alto[1] - alto[0]) + Math.sin(f * 0.05 + i) * 0.2;
        const t = 0.6 + R(s, "pt", i) * 0.8;
        return (
          <group key={i} position={[Math.cos(a) * r, y, -12 + Math.sin(a) * r * 0.6]} rotation={[0, -a + Math.PI, 0]} scale={t}>
            <Pieza forma={{ f: "bola", r: 0.25, seg: 10 }} esc={[1.3, 0.55, 0.3]} color={color} rugoso={0.5} />
            <Pieza forma={{ f: "cono", r: 0.16, h: 0.3, seg: 4 }} color={color} pos={[-0.38, 0, 0]} rot={[0, 0, Math.PI / 2 + Math.sin(f * 0.4 + i) * 0.35]} />
          </group>
        );
      })}
    </group>
  );
};

/** Coloca cosas alrededor del escenario sin taparlo. */
function alrededor(s: number, n: number, clave: string, zMin = -24, zMax = 2, libre = 4.5) {
  const out: { x: number; z: number; r: number; i: number }[] = [];
  for (let i = 0; out.length < n && i < n * 8; i++) {
    const x = (R(s, clave, "x", i) - 0.5) * 38;
    const z = zMin + R(s, clave, "z", i) * (zMax - zMin);
    if (Math.abs(x) < libre && z > -7) continue; // deja libre el sitio de los personajes y la vista
    out.push({ x, z, r: R(s, clave, "r", i), i });
  }
  return out;
}

/** Acantilados enormes al fondo, que se pierden en la niebla (dan escala y profundidad). */
const Acantilados: React.FC<{ s: number; color: string; z?: number }> = ({ s, color, z = -38 }) => (
  <group>
    {Array.from({ length: 9 }, (_, i) => (
      <Pieza key={i} forma={{ f: "roca", r: 6 + R(s, "ac", i) * 7, s: i * 3 + s }} esc={[1.4, 1 + R(s, "ah", i) * 0.9, 1]} color={color} pos={[-48 + i * 12 + R(s, "ax", i) * 5, 0, z - R(s, "az", i) * 14]} rot={[0, R(s, "ar", i) * 6, 0]} />
    ))}
  </group>
);

/** Rocas cerca de la cámara (a los lados): al moverse, pasan por delante y dan sensación de profundidad. */
const PrimerPlano: React.FC<{ s: number; color: string; algas?: string }> = ({ s, color, algas }) => (
  <group>
    {[
      [-6.5, 5],
      [7, 3.5],
      [-8, -1],
      [8.5, 7],
    ].map(([x, z], i) => (
      <Pieza key={i} forma={{ f: "roca", r: 1 + R(s, "pp", i) * 1.2, s: s + i * 7 }} esc={[1.2, 0.9, 1]} color={color} pos={[x, 0.1, z]} rot={[0, R(s, "ppr", i) * 6, 0]} />
    ))}
    {algas && [-5.8, 6.4].map((x, i) => <Alga key={`a${i}`} pos={[x, 0, 4 + i * 2]} alto={4 + i} color={algas} fase={i * 2 + s} />)}
  </group>
);

// ---------------------------------------------------------------- ARRECIFE (≈ -15 m)
const CORALES = ["#ff7b6b", "#ffb347", "#b388ff", "#3fd6b0", "#ffd166", "#ff5fa2"];
const Arrecife: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Cielo arriba="#8fe8ff" medio="#1aa6d6" abajo="#075a88" />
    <Ambiente niebla={["#1f9ccc", 12, 90]} />
    <hemisphereLight args={["#bfefff", "#8a6e46", 1.15]} />
    <directionalLight position={[3, 14, 4]} intensity={2.7} color="#fff1d6" />
    <directionalLight position={[-6, 3, -8]} intensity={0.9} color="#6fdcff" />
    <ambientLight intensity={0.15} color="#bff4ff" />
    <Terreno color="#c29c5e" s={s} />
    <TechoAgua y={16} color="#d6f6ff" opacidad={0.35} />
    <Rayos3D s={s} fuerza={1.25} />
    <Acantilados s={s} color="#3f8fb5" />
    {alrededor(s, 18, "rama").map(({ x, z, r, i }) => (
      <CoralRama key={`c${i}`} pos={[x, 0, z]} tam={0.9 + r * 1.4} color={CORALES[i % CORALES.length]} s={r * 6} />
    ))}
    {alrededor(s, 12, "bola").map(({ x, z, r, i }) => (
      <Pieza key={`b${i}`} forma={{ f: "roca", r: 0.5 + r * 0.7, s: i }} esc={[1, 0.65, 1]} color={CORALES[(i + 2) % CORALES.length]} pos={[x, 0.1, z]} facetas={false} />
    ))}
    {alrededor(s, 14, "roca").map(({ x, z, r, i }) => (
      <Pieza key={`r${i}`} forma={{ f: "roca", r: 0.6 + r * 1.6, s: i * 5 }} esc={[1.3, 0.75, 1]} color="#9a95a6" pos={[x, 0.1, z]} rot={[0, r * 6, 0]} />
    ))}
    {alrededor(s, 12, "alga", -26, -6).map(({ x, z, r, i }) => (
      <Alga key={`a${i}`} pos={[x, 0, z]} alto={4 + r * 6} color={i % 2 ? "#4fbf6a" : "#3a9a55"} fase={r * 6} />
    ))}
    <Pieza forma={{ f: "roca", r: 0.9, s: 4 }} esc={[1.6, 0.6, 1.1]} color="#a39d94" pos={[-3.9, 0.15, -2.5]} />
    <Pieza forma={{ f: "roca", r: 0.7, s: 9 }} esc={[1.4, 0.6, 1.2]} color="#aaa39a" pos={[4, 0.1, -1.4]} rot={[0, 1, 0]} />
    <PrimerPlano s={s} color="#8f8a9c" algas="#3fa85e" />
    <Peces s={s} color="#ffb547" />
  </group>
);

// ---------------------------------------------------------------- PROFUNDO (oscuridad casi total)
const Profundo: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  return (
    <group>
      <Cielo arriba="#2f7fd0" medio="#123f80" abajo="#071a3e" />
      <Ambiente niebla={["#14407a", 7, 50]} />
      <hemisphereLight args={["#7fb8ff", "#1a2440", 1.6]} />
      <directionalLight position={[0, 12, 6]} intensity={2.1} color="#b8d8ff" />
      <directionalLight position={[-8, 3, 6]} intensity={1.2} color="#5fe0ff" />
      <ambientLight intensity={0.3} color="#8fb8ff" />
      <Terreno color="#5a6b96" s={s} amp={1.1} />
      <Acantilados s={s} color="#24508a" z={-30} />
      {alrededor(s, 20, "roca", -26, 3, 5).map(({ x, z, r, i }) => (
        <Pieza key={`r${i}`} forma={{ f: "roca", r: 0.8 + r * 2.2, s: i * 3 }} esc={[1.3, 0.8 + r * 0.7, 1]} color="#6a79a6" pos={[x, 0.1, z]} rot={[r, r * 6, 0]} />
      ))}
      {alrededor(s, 8, "tubos", -16, 0, 5).map(({ x, z, r, i }) => (
        <group key={`t${i}`} position={[x, 0, z]}>
          {[0, 1, 2, 3, 4].map((k) => (
            <group key={k} position={[Math.cos(k * 1.7) * 0.25, 0, Math.sin(k * 1.7) * 0.25]}>
              <Pieza forma={{ f: "tubo", r: 0.06, h: 1 + r + k * 0.2 }} color="#bdb6a8" pos={[0, (1 + r + k * 0.2) / 2, 0]} />
              <Pieza forma={{ f: "bola", r: 0.11, seg: 10 }} color="#b3242a" pos={[0, 1 + r + k * 0.2, 0]} brillo="#ff2b2b" intensidad={0.5} />
            </group>
          ))}
        </group>
      ))}
      {Array.from({ length: 30 }, (_, i) => {
        const b = 0.5 + 0.5 * Math.sin(f * (0.03 + R(s, "lb", i) * 0.07) + i);
        return <Pieza key={`l${i}`} forma={{ f: "bola", r: 0.05 + R(s, "lr", i) * 0.07, seg: 8 }} color={i % 3 ? "#58e6ff" : "#9bff6e"} basica opacidad={0.25 + b * 0.75} pos={[(R(s, "lx", i) - 0.5) * 30, 1 + R(s, "ly", i) * 9, -5 - R(s, "lz", i) * 20]} />;
      })}
      <PrimerPlano s={s} color="#4f5c86" />
    </group>
  );
};

// ---------------------------------------------------------------- NAUFRAGIO (barco hundido, como en el logo)
const BarcoHundido: React.FC<{ s: number }> = ({ s }) => {
  const madera = "#7a5a3c";
  const musgo = "#5f7f45";
  const largo = 16;
  return (
    <group position={[2.5, -0.7, -9]} rotation={[0.04, -0.55, 0.22]}>
      {/* casco: medio cilindro (fondo redondo) abierto por arriba, con un boquete */}
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]}>
        <cylinderGeometry args={[2.4, 2.4, largo, 32, 1, true, Math.PI * 1.02, Math.PI * 0.82]} />
        <meshStandardMaterial color={madera} roughness={0.95} side={THREE.DoubleSide} flatShading />
      </mesh>
      <mesh position={[0, 2.2, 0]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1, 0.8]}>
        <cylinderGeometry args={[2.42, 2.42, largo * 0.55, 32, 1, true, Math.PI * 1.84, Math.PI * 0.16]} />
        <meshStandardMaterial color={musgo} roughness={0.95} side={THREE.DoubleSide} flatShading />
      </mesh>
      {/* tracas (líneas de las tablas) */}
      {[0.25, 0.45, 0.65, 0.85].map((k, i) => {
        const a = Math.PI * (1.02 + 0.82 * k);
        return <Pieza key={`t${i}`} forma={{ f: "caja", t: [largo, 0.05, 0.05] }} color="#221b16" pos={[0, 2.2 + Math.sin(a) * 2.43, Math.cos(a) * 2.43 * 0.8]} />;
      })}
      {/* cubierta rota */}
      <Pieza forma={{ f: "caja", t: [6, 0.15, 3.4] }} color={madera} pos={[-4, 3.6, 0]} rot={[0, 0, 0.05]} />
      <Pieza forma={{ f: "caja", t: [2.6, 1.8, 2.2] }} color="#2f2722" pos={[-5.5, 4.4, 0]} />
      {/* mástil roto e inclinado */}
      <Pieza forma={{ f: "tubo", r: 0.22, r2: 0.16, h: 9 }} color="#2b231d" pos={[1, 7.5, 0.3]} rot={[0.1, 0, -0.5]} />
      <Pieza forma={{ f: "tubo", r: 0.1, h: 4 }} color="#2b231d" pos={[-0.6, 9.5, 0.3]} rot={[0, 0, 1.1]} />
      <Pieza forma={{ f: "tubo", r: 0.18, h: 5 }} color="#2b231d" pos={[-6, 6.5, 0]} rot={[0.2, 0, 0.3]} />
      {/* proa y timón */}
      <Pieza forma={{ f: "cono", r: 2, h: 3.4, seg: 16 }} color={madera} pos={[largo / 2 + 1.6, 2.2, 0]} rot={[0, 0, -Math.PI / 2]} esc={[1, 1, 0.8]} />
      <Pieza forma={{ f: "caja", t: [0.2, 2.2, 1.2] }} color="#2b231d" pos={[-largo / 2 - 0.3, 1.2, 0]} />
      {/* algas creciendo encima */}
      {[-6, -2, 3, 6].map((x, i) => (
        <Alga key={i} pos={[x, 3.6, (i % 2) - 0.5]} alto={2 + i * 0.4} color="#4f9a5a" fase={i * 1.3} />
      ))}
    </group>
  );
};

const Naufragio: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Cielo arriba="#7fd8ff" medio="#1f8fca" abajo="#0b4f80" />
    <Ambiente niebla={["#1a78ad", 12, 85]} />
    <hemisphereLight args={["#b6e6ff", "#6f5f44", 1.15]} />
    <directionalLight position={[-4, 16, 2]} intensity={2.7} color="#ffefd2" />
    <directionalLight position={[8, 4, -10]} intensity={0.85} color="#6fd0ff" />
    <ambientLight intensity={0.15} color="#bfefff" />
    <Terreno color="#ad8e5c" s={s} amp={1} />
    <TechoAgua y={20} color="#d6f6ff" opacidad={0.32} />
    <Rayos3D s={s} fuerza={1.4} />
    <Acantilados s={s} color="#3d86b8" />
    <BarcoHundido s={s} />
    {/* ancla y cadena junto a los personajes */}
    <group position={[-3.6, 0.2, -1.8]} rotation={[0.3, 0.6, 1.2]}>
      <Pieza forma={{ f: "tubo", r: 0.08, h: 1.8 }} color="#3c3f44" metal={0.6} rugoso={0.7} />
      <Pieza forma={{ f: "aro", r: 0.55, g: 0.08, arco: Math.PI }} color="#3c3f44" pos={[0, -0.9, 0]} rot={[0, 0, Math.PI]} metal={0.6} rugoso={0.7} />
      <Pieza forma={{ f: "aro", r: 0.18, g: 0.05 }} color="#3c3f44" pos={[0, 1.05, 0]} metal={0.6} rugoso={0.7} />
    </group>
    {alrededor(s, 16, "roca", -26, 3, 5).map(({ x, z, r, i }) => (
      <Pieza key={`r${i}`} forma={{ f: "roca", r: 0.6 + r * 1.8, s: i * 4 }} esc={[1.3, 0.7, 1]} color="#8a8e9a" pos={[x, 0.1, z]} rot={[0, r * 6, 0]} />
    ))}
    {alrededor(s, 10, "alga", -22, -6, 5).map(({ x, z, r, i }) => (
      <Alga key={`a${i}`} pos={[x, 0, z]} alto={3 + r * 5} color="#4aa860" fase={r * 6} />
    ))}
    <PrimerPlano s={s} color="#7f8594" algas="#3f9a55" />
    <Peces s={s} color="#ffcf5a" n={18} />
  </group>
);

// ---------------------------------------------------------------- SUBMARINO (dentro, años 40)
const Submarino: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const barrido = (f * 0.06) % (Math.PI * 2);
  const casco = "#7f9488";
  const metal = { metal: 0.55, rugoso: 0.5 };
  return (
    <group>
      <Ambiente niebla={["#55625c", 10, 32]} />
      <hemisphereLight args={["#fff0d6", "#4a4842", 1.15]} />
      <ambientLight intensity={0.15} color="#fff0d8" />
      <pointLight position={[-3, 3.6, 0.5]} intensity={26} distance={12} color="#ffc878" />
      <pointLight position={[3, 3.6, 0.5]} intensity={22} distance={12} color="#ffc878" />
      <pointLight position={[0, 3, 4]} intensity={15} distance={12} color="#fff1dc" />
      <pointLight position={[0, 1.6, -1.2]} intensity={5} distance={5} color="#39ff88" />
      <pointLight position={[-5, 2, 2]} intensity={4} distance={8} color="#ff3b30" />
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[3.4, 3.4, 16, 48, 1, true, Math.PI * 0.62, Math.PI * 1.25]} />
        <meshStandardMaterial color={casco} roughness={0.6} metalness={0.4} side={THREE.DoubleSide} />
      </mesh>
      {[-6, -4, -2, 0, 2, 4, 6].map((x) => (
        <mesh key={x} position={[x, 1.6, 0]} rotation={[Math.PI * 0.62 + Math.PI / 2, Math.PI / 2, 0]}>
          <torusGeometry args={[3.33, 0.1, 8, 48, Math.PI * 1.25]} />
          <meshStandardMaterial color="#5f7068" roughness={0.5} metalness={0.5} />
        </mesh>
      ))}
      <Pieza forma={{ f: "caja", t: [16, 0.2, 6.2] }} color="#5a6462" pos={[0, -0.1, 0]} {...metal} />
      {Array.from({ length: 15 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.05, 0.02, 6] }} color="#3a4240" pos={[-7 + i, 0.01, 0]} />
      ))}
      {(
        [
          [4.25, -1.2, 0.12, "#8a5a33"],
          [4.05, -1.75, 0.09, "#6e2a24"],
          [3.75, -2.25, 0.14, "#7a6a3a"],
          [3.2, -2.75, 0.1, "#7c858a"],
          [2.6, -3.0, 0.07, "#5c6468"],
        ] as [number, number, number, string][]
      ).map(([y, z, r, c], i) => (
        <Pieza key={i} forma={{ f: "tubo", r, h: 15 }} color={c} pos={[0, y, z]} rot={[0, 0, Math.PI / 2]} {...metal} />
      ))}
      {[-4.5, 4.2].map((x, i) => (
        <group key={x} position={[x, 2.2, -2.75]} rotation={[0.3, 0, i]}>
          <Pieza forma={{ f: "aro", r: 0.32, g: 0.05 }} color="#7a1f1f" {...metal} />
          <Pieza forma={{ f: "caja", t: [0.64, 0.05, 0.05] }} color="#7a1f1f" {...metal} />
          <Pieza forma={{ f: "caja", t: [0.05, 0.64, 0.05] }} color="#7a1f1f" {...metal} />
        </group>
      ))}
      {[-2.6, -1.9, 1.9, 2.6].map((x, i) => (
        <group key={x} position={[x, 2.7, -2.55]} rotation={[0.35, 0, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.2, h: 0.1 }} color="#8a7238" rot={[Math.PI / 2, 0, 0]} metal={0.8} rugoso={0.35} />
          <Pieza forma={{ f: "disco", r: 0.16 }} color="#cfc8b0" pos={[0, 0, 0.06]} basica />
          <Pieza forma={{ f: "caja", t: [0.02, 0.13, 0.01] }} color="#16122a" pos={[0, 0, 0.07]} rot={[0, 0, Math.sin(f * 0.07 + i * 2) * 0.6 + i]} basica />
        </group>
      ))}
      {/* consola del sonar */}
      <group position={[0, 0, -1.9]}>
        <Pieza forma={{ f: "caja", t: [2.4, 1.25, 0.9] }} color="#5d7268" pos={[0, 0.62, 0]} {...metal} />
        <Pieza forma={{ f: "caja", t: [2.4, 0.9, 0.5] }} color="#6a8076" pos={[0, 1.6, -0.2]} rot={[-0.25, 0, 0]} {...metal} />
        <group position={[0, 1.62, 0.07]} rotation={[-0.25, 0, 0]}>
          <Pieza forma={{ f: "disco", r: 0.36 }} color="#04200f" basica />
          <mesh position={[0, 0, 0.02]} rotation={[0, 0, -barrido]}>
            <circleGeometry args={[0.34, 24, 0, 0.7]} />
            <meshBasicMaterial color="#39ff88" transparent opacity={0.6} />
          </mesh>
          <Pieza forma={{ f: "aro", r: 0.36, g: 0.03 }} color="#555c58" pos={[0, 0, 0.01]} metal={0.8} />
          <Pieza forma={{ f: "disco", r: 0.035 }} color="#9dffc4" basica pos={[0.12, 0.1, 0.03]} />
        </group>
        {[-0.85, -0.6, 0.6, 0.85].map((x, i) => (
          <Pieza key={x} forma={{ f: "bola", r: 0.045, seg: 8 }} color={["#ff3b30", "#ffb020", "#39ff88", "#ff3b30"][i]} basica opacidad={0.6 + 0.4 * Math.sin(f * 0.3 + i)} pos={[x, 1.25, 0.46]} />
        ))}
      </group>
      <Pieza forma={{ f: "tubo", r: 0.16, h: 4.4 }} color="#6c7478" pos={[3.3, 2.2, -1.1]} {...metal} />
      <Pieza forma={{ f: "caja", t: [0.5, 0.35, 0.4] }} color="#555c60" pos={[3.3, 1.75, -0.9]} {...metal} />
      <Pieza forma={{ f: "caja", t: [1.2, 2.4, 1.4] }} color="#6a7f78" pos={[-5.6, 1.2, -1.5]} {...metal} />
      <Pieza forma={{ f: "caja", t: [1.2, 2.4, 1.4] }} color="#6a7f78" pos={[5.6, 1.2, -1.5]} {...metal} />
      {[-4.5, -1.5, 1.5, 4.5].map((x) => (
        <Pieza key={x} forma={{ f: "bola", r: 0.12, seg: 10 }} color="#ffd9a0" basica pos={[x, 4.45, -0.4]} />
      ))}
      {/* tubería cerca de la cámara (primer plano) */}
      <Pieza forma={{ f: "tubo", r: 0.12, h: 6 }} color="#5a4a3a" pos={[-4.8, 2, 3.2]} {...metal} />
    </group>
  );
};

// ---------------------------------------------------------------- BARCO (buque gris al atardecer)
const Barco: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const vaiven = Math.sin(f * 0.035) * 0.03;
  const mar = useMemo(() => {
    const g = new THREE.PlaneGeometry(320, 320, 100, 100);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const p = mar.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, Math.sin(x * 0.16 + f * 0.05) * 0.45 + Math.cos(z * 0.2 + f * 0.045) * 0.45 + Math.sin((x + z) * 0.6 + f * 0.09) * 0.1);
  }
  p.needsUpdate = true;
  mar.computeVertexNormals();
  const gris = "#7a8590";
  const metal = { metal: 0.45, rugoso: 0.55 };
  return (
    <group>
      <group rotation={[vaiven * 0.5, 0, vaiven]}>
        <Cielo arriba="#4fa8ff" medio="#ffd9a0" abajo="#2f7fb5" />
        <mesh geometry={mar} position={[0, -2.2, 0]}>
          <meshStandardMaterial color="#2a8fca" roughness={0.25} metalness={0.3} flatShading />
        </mesh>
        <Pieza forma={{ f: "bola", r: 7, seg: 24 }} color="#fff2b8" basica pos={[-70, 14, -220]} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 9 + R(s, "nr", i) * 6 }} esc={[3, 0.5, 1]} color="#fff4ea" basica pos={[-120 + i * 50, 30 + R(s, "ny", i) * 22, -200]} />
        ))}
      </group>
      <Ambiente niebla={["#d9ecf8", 50, 280]} />
      <hemisphereLight args={["#cfe6ff", "#7a5e42", 1.25]} />
      <directionalLight position={[-12, 9, -10]} intensity={2.8} color="#ffd29a" />
      <directionalLight position={[6, 10, 8]} intensity={1.1} color="#cfe4ff" />
      <ambientLight intensity={0.12} />
      {/* cubierta de acero */}
      <Pieza forma={{ f: "caja", t: [7, 0.3, 14] }} color="#86684a" pos={[0, -0.15, -1]} rugoso={0.8} />
      {Array.from({ length: 13 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [7, 0.01, 0.03] }} color="#6e5640" pos={[0, 0.005, -7.5 + i * 1.1]} />
      ))}
      <Pieza forma={{ f: "caja", t: [7.2, 2.2, 14.2] }} color={gris} pos={[0, -1.4, -1]} {...metal} />
      {[-3.4, 3.4].map((x) => (
        <group key={x}>
          <Pieza forma={{ f: "tubo", r: 0.025, h: 14 }} color="#8a9096" pos={[x, 1, -1]} rot={[Math.PI / 2, 0, 0]} metal={0.7} />
          <Pieza forma={{ f: "tubo", r: 0.025, h: 14 }} color="#8a9096" pos={[x, 0.55, -1]} rot={[Math.PI / 2, 0, 0]} metal={0.7} />
          {Array.from({ length: 9 }, (_, i) => (
            <Pieza key={i} forma={{ f: "tubo", r: 0.035, h: 1.05 }} color="#6b7178" pos={[x, 0.52, -7 + i * 1.6]} metal={0.6} />
          ))}
        </group>
      ))}
      {/* superestructura, chimenea y mástil de radar */}
      <Pieza forma={{ f: "caja", t: [3.4, 2.6, 3]} } color={gris} pos={[-1.4, 1.3, -6.4]} {...metal} />
      <Pieza forma={{ f: "caja", t: [2.6, 1.4, 2.4]} } color={gris} pos={[-1.4, 3.3, -6.6]} {...metal} />
      {[-2.2, -1.4, -0.6].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.5, 0.3, 0.05]} } color="#ffcf8a" basica pos={[x, 3.4, -5.38]} />
      ))}
      <Pieza forma={{ f: "tubo", r: 0.75, r2: 0.65, h: 3 }} color="#3e454d" pos={[1.6, 1.5, -7.6]} rot={[0.1, 0, 0]} {...metal} />
      <Pieza forma={{ f: "tubo", r: 0.08, h: 9 }} color="#5a6168" pos={[-1.4, 6.5, -6.6]} metal={0.6} />
      <Pieza forma={{ f: "caja", t: [1.6, 0.5, 0.1]} } color="#5a6168" pos={[-1.4, 9.3, -6.6]} rot={[0, f * 0.03, 0]} metal={0.6} />
      {/* torreta del cañón, fuera del sitio de los personajes */}
      <group position={[3.6, 0.5, 3.2]} rotation={[0, -0.7, 0]}>
        <Pieza forma={{ f: "tubo", r: 0.9, h: 0.8 }} color={gris} {...metal} />
        <Pieza forma={{ f: "caja", t: [1.4, 0.7, 1.6]} } color={gris} pos={[0, 0.6, 0]} {...metal} />
        <Pieza forma={{ f: "tubo", r: 0.08, h: 3 }} color="#3a3f45" pos={[0, 0.7, 1.9]} rot={[Math.PI / 2 - 0.1, 0, 0]} metal={0.6} />
      </group>
      <group position={[3.47, 0.7, -2]} rotation={[0, Math.PI / 2, 0]}>
        <Pieza forma={{ f: "aro", r: 0.3, g: 0.08 }} color="#c2652e" />
      </group>
      {[
        [-2.8, -2.6],
        [-2.3, -3.3],
      ].map(([x, z], i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.3, h: 0.8 }} color="#4a3a2a" pos={[x, 0.4, z]} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- LABORATORIO (años 40, en penumbra)
const Laboratorio: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#c4bcae", "#9b9283", 6), []);
  return (
    <group>
      <Ambiente niebla={["#efe2c8", 14, 44]} />
      <hemisphereLight args={["#fff6e6", "#6f6250", 1.25]} />
      <ambientLight intensity={0.15} color="#fff6e8" />
      <directionalLight position={[4, 8, 6]} intensity={1.9} color="#fff0d8" />
      <pointLight position={[-3.5, 2.6, -1.4]} intensity={20} distance={9} color="#ffc070" />
      <pointLight position={[3.6, 2, -1.8]} intensity={18} distance={8} color="#5fdcff" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial map={suelo} roughness={0.5} metalness={0.1} />
      </mesh>
      <Pieza forma={{ f: "caja", t: [12, 4.6, 0.2] }} color="#cdbd9c" pos={[0, 2.3, -3.7]} />
      <Pieza forma={{ f: "caja", t: [0.2, 4.6, 14] }} color="#c2b192" pos={[-6, 2.3, 0]} />
      <Pieza forma={{ f: "caja", t: [0.2, 4.6, 14] }} color="#c2b192" pos={[6, 2.3, 0]} />
      <Pieza forma={{ f: "caja", t: [12, 1.1, 0.25] }} color="#8a6a4a" pos={[0, 0.55, -3.6]} />
      {/* pizarra con ecuaciones */}
      <Pieza forma={{ f: "caja", t: [4, 1.8, 0.1] }} color="#2f5a46" pos={[-0.6, 2.6, -3.55]} />
      {Array.from({ length: 16 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.2 + R(s, "tz", i) * 0.7, 0.03, 0.01] }} color="#cfd2c8" basica opacidad={0.8} pos={[-2.2 + (i % 4) * 1 + R(s, "tx", i) * 0.3, 3.2 - Math.floor(i / 4) * 0.36, -3.49]} rot={[0, 0, (R(s, "tr", i) - 0.5) * 0.3]} />
      ))}
      {/* acuario iluminado (la luz principal de la sala) */}
      <group position={[3.6, 0, -2.6]}>
        <Pieza forma={{ f: "caja", t: [2.6, 0.9, 1.3] }} color="#1d1f24" pos={[0, 0.45, 0]} metal={0.4} />
        <Pieza forma={{ f: "caja", t: [2.5, 1.5, 1.2] }} color="#2aa5d6" opacidad={0.5} brillo="#1c7fb0" intensidad={0.6} pos={[0, 1.65, 0]} />
        <Pieza forma={{ f: "caja", t: [2.4, 0.2, 1.1] }} color="#7a6a50" pos={[0, 1, 0]} />
        {[0, 1, 2].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.08, seg: 10 }} esc={[1.6, 0.8, 0.5]} color="#c06a3a" pos={[Math.sin(f * 0.03 + i * 2) * 0.9, 1.5 + i * 0.2, 0.1]} />
        ))}
      </group>
      {/* mesa con frascos de especímenes y lámpara */}
      <group position={[-3.5, 0, -2.4]}>
        <Pieza forma={{ f: "caja", t: [2.8, 0.1, 1.2] }} color="#4a3626" pos={[0, 1, 0]} />
        {[-1.2, 1.2].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.1, 1, 0.1] }} color="#2a2018" pos={[x, 0.5, 0.4]} />
        ))}
        {[-0.9, -0.4, 0.1, 0.5].map((x, i) => (
          <group key={i} position={[x, 1.05, 0]}>
            <Pieza forma={{ f: "tubo", r: 0.14, h: 0.42 }} color={["#b08a3a", "#8a9a4a", "#a8703a", "#7a8a8a"][i]} opacidad={0.75} brillo={["#6a4a10", "#3a4a10", "#6a3a10", "#2a3a3a"][i]} intensidad={0.5} pos={[0, 0.21, 0]} />
            <Pieza forma={{ f: "tubo", r: 0.15, h: 0.06 }} color="#2a2a2a" pos={[0, 0.45, 0]} metal={0.5} />
          </group>
        ))}
        <Pieza forma={{ f: "tubo", r: 0.03, h: 0.7 }} color="#2a2a2a" pos={[1, 1.4, -0.2]} rot={[0, 0, 0.3]} metal={0.6} />
        <Pieza forma={{ f: "cono", r: 0.22, h: 0.3, seg: 16 }} color="#3a4a3a" pos={[0.85, 1.75, -0.2]} rot={[0, 0, 2.6]} metal={0.4} />
        <Pieza forma={{ f: "bola", r: 0.07, seg: 8 }} color="#ffd59a" basica pos={[0.78, 1.66, -0.2]} />
      </group>
      {/* estantería con libros */}
      <group position={[-5.6, 0, 0.6]}>
        {[0.8, 1.6, 2.4].map((y) => (
          <Pieza key={y} forma={{ f: "caja", t: [0.5, 0.06, 2] }} color="#2a2018" pos={[0, y, 0]} />
        ))}
        {Array.from({ length: 15 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.35, 0.5, 0.1] }} color={["#5a2a24", "#26364a", "#2f4a32", "#6a5a2a", "#3a2a4a"][i % 5]} pos={[0, 0.8 + Math.floor(i / 5) * 0.8 + 0.28, -0.85 + (i % 5) * 0.32]} />
        ))}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- PALACIO (sala del trono a la luz de las velas)
const Palacio: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#d2c4a8", "#a8977a", 7), []);
  const piedra = "#d8ccb4";
  return (
    <group>
      <Ambiente niebla={["#b89a6c", 18, 60]} />
      <hemisphereLight args={["#ffefd2", "#5e4630", 1.15]} />
      <ambientLight intensity={0.12} color="#fff2dc" />
      <directionalLight position={[-5, 10, 6]} intensity={2.0} color="#ffeccb" />
      <pointLight position={[0, 6, -1.5]} intensity={20} distance={16} color="#ffd39a" />
      {[-4.8, 4.8].map((x, i) => (
        <pointLight key={x} position={[x, 2.5, -4]} intensity={12 + Math.sin(f * 0.4 + i) * 1.5} distance={8} color="#ffb060" />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[16, 22]} />
        <meshStandardMaterial map={suelo} roughness={0.35} metalness={0.15} />
      </mesh>
      <Pieza forma={{ f: "caja", t: [2.4, 0.02, 20] }} color="#8f1d2a" pos={[0, 0.01, 0]} />
      <Pieza forma={{ f: "caja", t: [16, 9, 0.3] }} color="#b79c74" pos={[0, 4.5, -7.2]} />
      {[-6, -3.6, 3.6, 6].map((x) =>
        [-5, 0.5].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Pieza forma={{ f: "tubo", r: 0.42, h: 7.4, seg: 12 }} color={piedra} pos={[0, 3.7, 0]} facetas />
            <Pieza forma={{ f: "caja", t: [1.1, 0.35, 1.1] }} color="#c9a24a" pos={[0, 7.5, 0]} metal={0.6} rugoso={0.4} />
            <Pieza forma={{ f: "caja", t: [1.1, 0.3, 1.1] }} color="#c9a24a" pos={[0, 0.15, 0]} metal={0.6} rugoso={0.4} />
          </group>
        )),
      )}
      <group position={[0, 0, -5.6]}>
        <Pieza forma={{ f: "caja", t: [2.2, 0.5, 1.6] }} color="#cfc2a8" pos={[0, 0.25, 0]} />
        <Pieza forma={{ f: "caja", t: [1.6, 0.6, 1.1] }} color="#b08a3a" pos={[0, 0.8, 0]} metal={0.8} rugoso={0.35} />
        <Pieza forma={{ f: "caja", t: [1.4, 0.2, 0.9] }} color="#a8243a" pos={[0, 1.2, 0.05]} />
        <Pieza forma={{ f: "caja", t: [1.6, 2.6, 0.25] }} color="#b08a3a" pos={[0, 2.3, -0.45]} metal={0.8} rugoso={0.35} />
        <Pieza forma={{ f: "caja", t: [1.2, 2.1, 0.05] }} color="#a8243a" pos={[0, 2.25, -0.31]} />
      </group>
      {[-4.8, 4.8].map((x) => (
        <group key={x}>
          <Pieza forma={{ f: "caja", t: [1.3, 3.6, 0.05] }} color="#a8243a" pos={[x, 5, -7]} />
          <Pieza forma={{ f: "tubo", r: 0.06, h: 1.4 }} color="#2a2420" pos={[x, 0.7, -4]} metal={0.5} />
          <Pieza forma={{ f: "bola", r: 0.09, seg: 8 }} color="#ffcf7a" basica pos={[x, 1.5, -4]} esc={[1, 1.6 + Math.sin(f * 0.5) * 0.2, 1]} />
        </group>
      ))}
      {[-2.2, 2.2].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [1.1, 2.6, 0.05] }} color="#a9d8f2" basica pos={[x, 5.6, -7.03]} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- PISO (el piso de BENT en la ciudad, al atardecer)
const Piso: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#8a6a4c", "#7a5c40", 10), []);
  const gota = (f % 40) / 40;
  return (
    <group>
      <Ambiente niebla={["#5a4a40", 14, 40]} fondo="#2b2a3a" />
      <hemisphereLight args={["#ffe9d0", "#4a3a2c", 1.1]} />
      <ambientLight intensity={0.15} color="#fff0dc" />
      <directionalLight position={[-6, 4, -8]} intensity={2.4} color="#ffb070" />
      <pointLight position={[1.5, 3.2, 1]} intensity={14} distance={9} color="#ffe2b0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 12]} />
        <meshStandardMaterial map={suelo} roughness={0.6} />
      </mesh>
      {/* paredes */}
      <Pieza forma={{ f: "caja", t: [12, 3.2, 0.2] }} color="#b9a48a" pos={[0, 1.6, -3.6]} />
      <Pieza forma={{ f: "caja", t: [0.2, 3.2, 12] }} color="#a9937a" pos={[-5.5, 1.6, 0]} />
      <Pieza forma={{ f: "caja", t: [0.2, 3.2, 12] }} color="#a9937a" pos={[5.5, 1.6, 0]} />
      <Pieza forma={{ f: "caja", t: [12, 0.2, 12] }} color="#d8cbb6" pos={[0, 3.25, 0]} />
      {/* ventana con la ciudad al atardecer */}
      <group position={[-1.6, 1.8, -3.48]}>
        <Pieza forma={{ f: "caja", t: [2.6, 1.6, 0.05] }} color="#ffa86a" basica />
        {Array.from({ length: 9 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.22 + R(s, "ed", i) * 0.15, 0.4 + R(s, "eh", i) * 0.9, 0.02] }} color="#3a3048" basica pos={[-1.1 + i * 0.27, -0.8 + (0.4 + R(s, "eh", i) * 0.9) / 2, 0.03]} />
        ))}
        <Pieza forma={{ f: "caja", t: [2.7, 0.08, 0.1] }} color="#e8dccb" pos={[0, 0.82, 0.04]} />
        <Pieza forma={{ f: "caja", t: [2.7, 0.08, 0.1] }} color="#e8dccb" pos={[0, -0.82, 0.04]} />
        <Pieza forma={{ f: "caja", t: [0.06, 1.7, 0.1] }} color="#e8dccb" pos={[0, 0, 0.04]} />
      </group>
      {/* sofá */}
      <group position={[3.2, 0, -2.6]}>
        <Pieza forma={{ f: "caja", t: [2.4, 0.5, 0.9] }} color="#5a6f8a" pos={[0, 0.35, 0]} />
        <Pieza forma={{ f: "caja", t: [2.4, 0.7, 0.25] }} color="#4f6380" pos={[0, 0.8, -0.35]} />
        <Pieza forma={{ f: "caja", t: [0.25, 0.6, 0.9] }} color="#4f6380" pos={[-1.2, 0.55, 0]} />
        <Pieza forma={{ f: "caja", t: [0.25, 0.6, 0.9] }} color="#4f6380" pos={[1.2, 0.55, 0]} />
      </group>
      {/* cocina con el fregadero que gotea (el casero nunca lo arregla) */}
      <group position={[-4.2, 0, -2.2]}>
        <Pieza forma={{ f: "caja", t: [1.8, 0.95, 0.7] }} color="#d6d0c4" pos={[0, 0.47, 0]} />
        <Pieza forma={{ f: "caja", t: [0.7, 0.05, 0.45] }} color="#9aa2aa" pos={[0, 0.96, 0]} metal={0.7} rugoso={0.3} />
        <Pieza forma={{ f: "tubo", r: 0.025, h: 0.35 }} color="#b8c0c8" pos={[0, 1.12, -0.18]} metal={0.8} />
        <Pieza forma={{ f: "bola", r: 0.025, seg: 8 }} color="#9fd8ff" pos={[0, 1.22 - gota * 0.25, -0.05]} basica opacidad={1 - gota} />
      </group>
      {/* lámpara de pie y cuadro */}
      <Pieza forma={{ f: "tubo", r: 0.03, h: 1.7 }} color="#2a2a2a" pos={[1.6, 0.85, -3.1]} metal={0.5} />
      <Pieza forma={{ f: "cono", r: 0.25, h: 0.3, seg: 16 }} color="#f2d9a8" pos={[1.6, 1.75, -3.1]} brillo="#ffcf80" intensidad={0.8} />
      <Pieza forma={{ f: "caja", t: [0.9, 0.6, 0.04] }} color="#3a6a8a" pos={[3.2, 2.1, -3.48]} />
    </group>
  );
};

/** Textura con un letrero (felpudo, sobres…). */
function texturaTexto(texto: string, fondo: string, tinta: string, ancho = 256, alto = 96) {
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const x = c.getContext("2d")!;
  x.fillStyle = fondo;
  x.fillRect(0, 0, ancho, alto);
  x.fillStyle = tinta;
  x.font = `bold ${Math.round(alto * 0.62)}px sans-serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(texto, ancho / 2, alto / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * La "casa" de BENT en el fondo del mar: una caja de cristal (como una pecera al revés) con luz cálida dentro,
 * colchón deshecho, lámpara, mini nevera, sofá y planta; fuera, felpudo de HOME, buzón lleno de cartas del
 * alquiler, tubo de aire y cable que suben a la superficie, y peces curioseando pegados al cristal.
 */
const CajaCristal: React.FC<{ pos: V3 }> = ({ pos }) => {
  const f = useCurrentFrame();
  const felpudo = useMemo(() => texturaTexto("HOME", "#7a4a2a", "#f2e2c4"), []);
  const carta = useMemo(() => texturaTexto("RENT", "#f4efe4", "#b3202f", 128, 64), []);
  const W = 3.6;
  const H = 2.6;
  const D = 2.8;
  const metal = { metal: 0.7, rugoso: 0.35 };
  return (
    <group position={pos} rotation={[0, 0.35, 0]}>
      {/* luz cálida de dentro (se ve desde lejos: contrasta con el azul) */}
      <pointLight position={[0, 2.1, 0]} intensity={40} distance={8} color="#ffb860" />
      <pointLight position={[0.8, 0.9, 0.6]} intensity={14} distance={5} color="#ffcf8a" />
      {/* resplandor cálido dentro del cristal */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W - 0.15, H - 0.15, D - 0.15]} />
        <meshBasicMaterial color="#ff9a3a" transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* cristal */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#ffe2b0" emissive="#ff9a3c" emissiveIntensity={0.25} transparent opacity={0.2} roughness={0.05} metalness={0.2} depthWrite={false} />
      </mesh>
      {/* marco metálico */}
      {[
        [-W / 2, -D / 2],
        [W / 2, -D / 2],
        [-W / 2, D / 2],
        [W / 2, D / 2],
      ].map(([x, z], i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.09, H, 0.09] }} color="#7f8a94" pos={[x, H / 2, z]} {...metal} />
      ))}
      {[0.03, H].map((y) =>
        [-D / 2, D / 2].map((z) => <Pieza key={`${y}${z}`} forma={{ f: "caja", t: [W + 0.09, 0.09, 0.09] }} color="#7f8a94" pos={[0, y, z]} {...metal} />),
      )}
      {[0.03, H].map((y) =>
        [-W / 2, W / 2].map((x) => <Pieza key={`l${y}${x}`} forma={{ f: "caja", t: [0.09, 0.09, D + 0.09] }} color="#7f8a94" pos={[x, y, 0]} {...metal} />),
      )}
      {/* puerta en el cristal de delante, con pomo */}
      <Pieza forma={{ f: "caja", t: [0.06, 2.1, 0.05] }} color="#7f8a94" pos={[0.45, 1.05, D / 2 + 0.02]} {...metal} />
      <Pieza forma={{ f: "caja", t: [1.0, 0.06, 0.05] }} color="#7f8a94" pos={[0.95, 2.1, D / 2 + 0.02]} {...metal} />
      <Pieza forma={{ f: "bola", r: 0.05, seg: 10 }} color="#d1a94c" pos={[1.25, 1.05, D / 2 + 0.06]} metal={0.8} rugoso={0.3} />
      {/* suelo de madera dentro */}
      <Pieza forma={{ f: "caja", t: [W - 0.1, 0.06, D - 0.1] }} color="#8a6440" pos={[0, 0.06, 0]} rugoso={0.7} />
      {/* colchón deshecho con sábana y almohada */}
      <group position={[-0.95, 0, -0.55]}>
        <Pieza forma={{ f: "caja", t: [1.5, 0.28, 1.9] }} color="#e9e2d2" pos={[0, 0.23, 0]} />
        <Pieza forma={{ f: "caja", t: [1.4, 0.1, 1.1] }} color="#6f8fbf" pos={[0.05, 0.4, 0.35]} rot={[0.05, 0.15, 0.04]} />
        <Pieza forma={{ f: "caja", t: [0.9, 0.16, 0.45] }} color="#ffffff" pos={[0, 0.45, -0.65]} rot={[0, 0.1, 0.05]} />
      </group>
      {/* lámpara de pie encendida */}
      <group position={[-1.5, 0, 0.85]}>
        <Pieza forma={{ f: "tubo", r: 0.03, h: 1.5 }} color="#2a2a2a" pos={[0, 0.8, 0]} metal={0.5} />
        <Pieza forma={{ f: "cono", r: 0.24, h: 0.3, seg: 16 }} color="#ffd27a" pos={[0, 1.65, 0]} basica />
        <mesh position={[0, 1.55, 0]}>
          <sphereGeometry args={[0.45, 16, 12]} />
          <meshBasicMaterial color="#ffc070" transparent opacity={0.25} depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      {/* mini nevera con un imán */}
      <group position={[1.35, 0, -0.9]}>
        <Pieza forma={{ f: "caja", t: [0.6, 1.0, 0.6] }} color="#e8ecef" pos={[0, 0.56, 0]} rugoso={0.35} />
        <Pieza forma={{ f: "caja", t: [0.04, 0.35, 0.04] }} color="#9aa2aa" pos={[-0.22, 0.75, 0.32]} metal={0.7} />
        <Pieza forma={{ f: "bola", r: 0.05, seg: 8 }} color="#e5484d" pos={[0.1, 0.85, 0.31]} />
      </group>
      {/* sofá pequeño */}
      <group position={[0.75, 0, 0.55]} rotation={[0, -0.5, 0]}>
        <Pieza forma={{ f: "caja", t: [1.2, 0.35, 0.6] }} color="#b5523b" pos={[0, 0.3, 0]} />
        <Pieza forma={{ f: "caja", t: [1.2, 0.5, 0.18] }} color="#a0482f" pos={[0, 0.6, -0.25]} />
      </group>
      {/* planta de interior (en el fondo del mar) */}
      <group position={[1.4, 0, 0.95]}>
        <Pieza forma={{ f: "tubo", r: 0.16, r2: 0.12, h: 0.32 }} color="#b86a3c" pos={[0, 0.25, 0]} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.14, seg: 10 }} esc={[0.5, 1.4, 0.2]} color="#3f9a55" pos={[Math.cos(i * 1.3) * 0.08, 0.6, Math.sin(i * 1.3) * 0.08]} rot={[Math.sin(i) * 0.5, i * 1.3, Math.cos(i) * 0.5]} />
        ))}
      </group>
      {/* felpudo "HOME" fuera de la puerta */}
      <mesh position={[0.95, 0.02, D / 2 + 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, 0.45]} />
        <meshStandardMaterial map={felpudo} roughness={1} />
      </mesh>
      {/* buzón lleno de cartas del alquiler */}
      <group position={[2.35, 0, 1.35]}>
        <Pieza forma={{ f: "tubo", r: 0.04, h: 1.0 }} color="#5a5f66" pos={[0, 0.5, 0]} metal={0.5} />
        <Pieza forma={{ f: "caja", t: [0.3, 0.28, 0.45] }} color="#2f5f9a" pos={[0, 1.12, 0]} />
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0, 1.2 + i * 0.03, 0.27 + i * 0.02]} rotation={[-0.3 - i * 0.1, 0, (i - 1) * 0.15]}>
            <planeGeometry args={[0.24, 0.13]} />
            <meshStandardMaterial map={carta} side={THREE.DoubleSide} roughness={0.9} />
          </mesh>
        ))}
      </group>
      {/* tubo de aire y cable que suben hasta la superficie */}
      <Pieza forma={{ f: "tubo", r: 0.07, h: 14 }} color="#e0b13a" pos={[-1.6, H + 7, -1.2]} rot={[0.05, 0, 0.06]} />
      <Pieza forma={{ f: "tubo", r: 0.025, h: 14 }} color="#1e1e22" pos={[-1.35, H + 7, -1.3]} rot={[0.04, 0, 0.1]} />
      <Pieza forma={{ f: "caja", t: [0.3, 0.2, 0.2] }} color="#c9a33a" pos={[-1.6, H + 0.05, -1.2]} metal={0.6} />
      {/* peces curioseando pegados al cristal */}
      {[0, 1, 2, 3].map((i) => {
        const a = f * 0.012 + i * 1.6;
        const x = Math.cos(a) * (W / 2 + 0.35);
        const z = Math.sin(a) * (D / 2 + 0.35);
        return (
          <group key={i} position={[x, 0.9 + i * 0.35 + Math.sin(f * 0.05 + i) * 0.08, z]} rotation={[0, -a, 0]}>
            <Pieza forma={{ f: "bola", r: 0.12, seg: 10 }} esc={[1.4, 0.8, 0.45]} color={["#ffb547", "#ff7a59", "#f2c94c", "#6fc6ff"][i]} />
            <Pieza forma={{ f: "cono", r: 0.08, h: 0.14, seg: 5 }} color={["#ffb547", "#ff7a59", "#f2c94c", "#6fc6ff"][i]} pos={[-0.2, 0, 0]} rot={[0, 0, Math.PI / 2 + Math.sin(f * 0.4 + i) * 0.35]} />
          </group>
        );
      })}
    </group>
  );
};

const FondoCasa: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Arrecife s={s} />
    <CajaCristal pos={[-2.4, 0, -5.4]} />
  </group>
);

/** Base submarina tipo Aquarius: cilindro sobre patas, con ojos de buey iluminados y escotilla. */
const Habitat: React.FC<{ pos: V3 }> = ({ pos }) => {
  const f = useCurrentFrame();
  return (
    <group position={pos} rotation={[0, 0.5, 0]}>
      {/* base de hormigón y patas */}
      <Pieza forma={{ f: "caja", t: [12, 0.6, 5] }} color="#8d8a84" pos={[0, 0.3, 0]} />
      {[-4.5, -1.5, 1.5, 4.5].map((x) =>
        [-1.4, 1.4].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "tubo", r: 0.18, h: 1.4 }} color="#c9a33a" pos={[x, 1.3, z]} metal={0.4} rugoso={0.5} />),
      )}
      {/* cuerpo: cilindro tumbado */}
      <group position={[0, 3.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Pieza forma={{ f: "tubo", r: 1.6, h: 11, seg: 32 }} color="#e8e4da" metal={0.3} rugoso={0.45} />
        <Pieza forma={{ f: "bola", r: 1.6, seg: 32 }} color="#e8e4da" pos={[0, 5.5, 0]} esc={[1, 0.4, 1]} metal={0.3} rugoso={0.45} />
        <Pieza forma={{ f: "bola", r: 1.6, seg: 32 }} color="#e8e4da" pos={[0, -5.5, 0]} esc={[1, 0.4, 1]} metal={0.3} rugoso={0.45} />
        {[-4, -2, 0, 2, 4].map((y) => (
          <Pieza key={y} forma={{ f: "aro", r: 1.62, g: 0.07 }} color="#b8b2a4" pos={[0, y, 0]} rot={[Math.PI / 2, 0, 0]} metal={0.5} />
        ))}
      </group>
      {/* ojos de buey con luz cálida */}
      {[-3, -1, 1, 3].map((x, i) => (
        <group key={x} position={[x, 3.8, 1.58]}>
          <Pieza forma={{ f: "aro", r: 0.32, g: 0.07 }} color="#8a8f96" metal={0.7} />
          <Pieza forma={{ f: "disco", r: 0.3 }} color="#ffd690" basica opacidad={0.75 + 0.25 * Math.sin(f * 0.05 + i)} />
        </group>
      ))}
      <pointLight position={[0, 3.8, 3]} intensity={18} distance={10} color="#ffd690" />
      {/* escotilla y torre de aire */}
      <Pieza forma={{ f: "tubo", r: 0.6, h: 1.4 }} color="#d9d3c6" pos={[4.2, 5.6, 0]} metal={0.3} />
      <Pieza forma={{ f: "tubo", r: 0.7, h: 0.15 }} color="#c9a33a" pos={[4.2, 6.35, 0]} metal={0.5} />
      <Pieza forma={{ f: "tubo", r: 0.12, h: 14 }} color="#d64a3a" pos={[-4.6, 10, -0.6]} />
      {/* letrero */}
      <Pieza forma={{ f: "caja", t: [3.2, 0.5, 0.05] }} color="#1d3f6a" pos={[0, 2.35, 1.58]} rot={[-0.15, 0, 0]} />
    </group>
  );
};

const FondoAquarius: React.FC<{ s: number }> = ({ s }) => (
  <group>
    <Arrecife s={s} />
    <Habitat pos={[1.5, 0, -10]} />
  </group>
);

export const ESCENARIOS3D: Record<Escenario, React.FC<{ s: number }>> = {
  arrecife: Arrecife,
  profundo: Profundo,
  naufragio: Naufragio,
  submarino: Submarino,
  barco: Barco,
  laboratorio: Laboratorio,
  palacio: Palacio,
  piso: Piso,
  casa: FondoCasa,
  aquarius: FondoAquarius,
  ...ESCENARIOS_AZORIAN,
  ...ESCENARIOS_HABAKKUK,
  ...ESCENARIOS_NUEVOS,
  ...ESCENARIOS_PIRATA,
  ...ESCENARIOS_OLAS,
  ...ESCENARIOS_HOLLAND,
};
