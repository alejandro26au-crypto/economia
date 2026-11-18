// Modelos 3D del vídeo de las olas monstruo (idea 7): la ola gigante (sube, rompe y desaparece) y el satélite de
// radar que escanea el océano. Miden 1 de ancho.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Resplandor } from "./escenarios-nuevos";
import { Pieza, texturaPunto } from "./piezas3d";

const suave = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Perfil de una ola que rompe (z = adelante, y = arriba), de 0 (atrás) a 1 (pie delantero). b = cuánto rompe. */
function perfil(b: number): THREE.Vector2[] {
  return [
    new THREE.Vector2(-0.7, 0),
    new THREE.Vector2(-0.42, 0.08),
    new THREE.Vector2(-0.18, 0.38),
    new THREE.Vector2(-0.05, 0.78),
    new THREE.Vector2(0.03 + 0.1 * b, 1 - 0.08 * b),
    new THREE.Vector2(0.1 + 0.2 * b, 0.9 - 0.3 * b),
    new THREE.Vector2(0.1 + 0.12 * b, 0.62 - 0.2 * b),
    new THREE.Vector2(0.08, 0.32),
    new THREE.Vector2(0.18, 0.06),
    new THREE.Vector2(0.4, 0),
  ];
}

/**
 * Ola monstruo: una pared de agua oscura con espuma en la cresta, más alta en el centro que en los lados (es UNA
 * ola, el doble que las demás). sube = 0..1 cuánto ha crecido, rompe = 0..1, se va = 0..1 (se hunde y desaparece).
 * Ancho 1; alto máximo `alto` (proporción del ancho).
 */
export const OlaGigante: React.FC<{ sube: number; rompe: number; seva: number; alto?: number; color?: string; avanza?: number }> = ({ sube, rompe, seva, alto = 0.45, color = "#1a4a58", avanza = 0 }) => {
  const f = useCurrentFrame();
  const NX = 56;
  const NU = 44;
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array((NX + 1) * (NU + 1) * 3), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array((NX + 1) * (NU + 1) * 3), 3));
    const idx: number[] = [];
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < NU; j++) {
        const a = i * (NU + 1) + j;
        const b = (i + 1) * (NU + 1) + j;
        idx.push(a, b, a + 1, b, b + 1, a + 1);
      }
    g.setIndex(idx);
    return g;
  }, []);
  const H = alto * Math.max(0.02, suave(sube) * (1 - suave(seva)));
  const curva = new THREE.SplineCurve(perfil(suave(rompe)));
  const pts = curva.getSpacedPoints(NU);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = geo.attributes.color as THREE.BufferAttribute;
  const base = new THREE.Color(color);
  const hondo = new THREE.Color("#06141c");
  const espuma = new THREE.Color("#f2fbff");
  const c = new THREE.Color();
  for (let i = 0; i <= NX; i++) {
    const x = -0.5 + i / NX;
    const g = 0.18 + 0.82 * Math.exp(-Math.pow(x / 0.22, 2)); // pico en el centro
    for (let j = 0; j <= NU; j++) {
      const p = pts[j];
      const ondula = Math.sin(x * 40 + j * 0.5 + f * 0.15) * 0.004;
      const y = p.y * H * g + ondula;
      const z = p.x * alto * (0.6 + 0.4 * g);
      pos.setXYZ(i * (NU + 1) + j, x, y, z);
      const alt = p.y;
      const cresta = j > NU * 0.38 && j < NU * 0.72 ? Math.max(0, alt - 0.55) / 0.45 : 0;
      // vetas de espuma que bajan por la cara de la ola (se leen como agua, no como una pared lisa)
      const veta = Math.pow(Math.max(0, Math.sin(x * 70 + Math.sin(j * 0.35) * 2) * Math.sin(x * 19 - j * 0.15)), 2) * (j > NU * 0.5 && alt > 0.5 ? 0.55 : 0.08);
      c.copy(hondo).lerp(base, Math.min(1, alt * 1.4)).lerp(espuma, Math.min(1, cresta * 1.3 * g + veta * g + (j > NU * 0.85 ? 0.5 : 0)));
      col.setXYZ(i * (NU + 1) + j, c.r, c.g, c.b);
    }
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();
  geo.computeBoundingSphere();
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: texturaPunto(), color: "#eef8ff", transparent: true, depthWrite: false }), []);
  const crestaZ = (0.05 + 0.2 * suave(rompe)) * alto;
  const dz = avanza * (suave(sube) * 0.7 + suave(rompe) * 0.3);
  // estallido de espuma al romper: muchas bolas blancas que salen hacia delante y caen
  const golpe = rompe > 0 && rompe < 2.2 ? Math.min(1, rompe) : 0;
  return (
    <group position={[0, 0, dz]}>
      {golpe > 0 &&
        Array.from({ length: 70 }, (_, i) => {
          const t = Math.min(1, Math.max(0, rompe - (i % 7) * 0.04) / 1.6);
          const m = mat.clone();
          m.opacity = 0.85 * Math.sin(Math.min(1, t * 1.4) * Math.PI) * (1 - suave(seva));
          const x = (((i * 53) % 70) / 70 - 0.5) * 0.4;
          const sale = 0.08 + ((i * 31) % 17) / 17 * 0.22;
          const sc = (0.025 + ((i * 13) % 11) / 11 * 0.05) * (1 + t * 1.5);
          return <sprite key={`g${i}`} material={m} position={[x, alto * (0.9 + 0.5 * Math.sin(t * Math.PI) - t * 0.6), crestaZ + sale * t]} scale={[sc, sc, 1]} />;
        })}
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.35} metalness={0.45} side={THREE.DoubleSide} />
      </mesh>
      {/* espuma y rocío que salta de la cresta */}
      {H > 0.05 &&
        Array.from({ length: 26 }, (_, i) => {
          const t = ((f * 0.9 + i * 11) % 40) / 40;
          const m = mat.clone();
          m.opacity = 0.7 * (1 - t) * (1 - suave(seva));
          const x = (((i * 37) % 26) / 26 - 0.5) * 0.36;
          const g = 0.18 + 0.82 * Math.exp(-Math.pow(x / 0.22, 2));
          const sc = 0.03 + t * 0.06;
          return <sprite key={i} material={m} position={[x, H * g * (0.95 + t * 0.25), crestaZ + t * 0.08 * (1 + rompe)]} scale={[sc, sc, 1]} />;
        })}
    </group>
  );
};

/** Satélite de radar (tipo ERS): cuerpo dorado, panel solar largo, antena de radar y el haz que barre el mar. */
export const Satelite3D: React.FC<{ haz?: boolean }> = ({ haz = true }) => {
  const f = useCurrentFrame();
  const celdas = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 512;
    cv.height = 128;
    const x = cv.getContext("2d")!;
    x.fillStyle = "#0e1e4a";
    x.fillRect(0, 0, 512, 128);
    x.strokeStyle = "#8aa0d8";
    x.lineWidth = 2;
    for (let i = 0; i <= 32; i++) {
      x.beginPath();
      x.moveTo(i * 16, 0);
      x.lineTo(i * 16, 128);
      x.stroke();
    }
    for (let j = 0; j <= 8; j++) {
      x.beginPath();
      x.moveTo(0, j * 16);
      x.lineTo(512, j * 16);
      x.stroke();
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const lamina = useMemo(() => {
    const cv = document.createElement("canvas");
    cv.width = 256;
    cv.height = 256;
    const x = cv.getContext("2d")!;
    x.fillStyle = "#d8a838";
    x.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 160; i++) {
      const a = (i * 2.399) % 6.28;
      x.fillStyle = i % 3 ? "rgba(255,230,140,0.35)" : "rgba(120,70,10,0.35)";
      x.beginPath();
      x.moveTo(128 + Math.cos(a) * ((i * 37) % 128), 128 + Math.sin(a) * ((i * 53) % 128));
      x.lineTo(128 + Math.cos(a + 0.5) * ((i * 41) % 140), 128 + Math.sin(a + 0.7) * ((i * 29) % 140));
      x.lineTo(128 + Math.cos(a + 1.1) * ((i * 23) % 120), 128 + Math.sin(a + 1.3) * ((i * 31) % 120));
      x.fill();
    }
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  const barre = Math.sin(f * 0.05) * 0.25;
  return (
    <group>
      {/* cuerpo con lámina dorada arrugada */}
      <mesh>
        <boxGeometry args={[0.16, 0.14, 0.14]} />
        <meshStandardMaterial map={lamina} color="#ffffff" metalness={0.85} roughness={0.32} />
      </mesh>
      {/* toberas, barras y antenas */}
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "tubo", r: 0.012, r2: 0.022, h: 0.03, seg: 10 }} color="#5a5c62" pos={[0.06 * l, -0.085, 0.05]} metal={0.8} />
      ))}
      <Pieza forma={{ f: "tubo", r: 0.003, h: 0.22 }} color="#d8d8dc" pos={[-0.02, 0.24, 0.03]} metal={0.8} />
      <Pieza forma={{ f: "tubo", r: 0.003, h: 0.14 }} color="#d8d8dc" pos={[0.04, 0.2, -0.04]} rot={[0.4, 0, 0]} metal={0.8} />
      <Pieza forma={{ f: "bola", r: 0.035, seg: 14 }} esc={[1, 0.35, 1]} color="#f2f2f4" pos={[0.06, 0.16, 0.05]} rot={[0.6, 0, 0]} />
      <Pieza forma={{ f: "caja", t: [0.17, 0.01, 0.15] }} color="#b8bcc4" pos={[0, 0.072, 0]} metal={0.7} rugoso={0.3} />
      <Pieza forma={{ f: "caja", t: [0.17, 0.01, 0.15] }} color="#b8bcc4" pos={[0, -0.072, 0]} metal={0.7} rugoso={0.3} />
      <Pieza forma={{ f: "caja", t: [0.12, 0.08, 0.15] }} color="#c8ccd4" pos={[0, 0.11, 0]} metal={0.7} rugoso={0.35} />
      {/* panel solar largo */}
      <Pieza forma={{ f: "tubo", r: 0.006, h: 0.12 }} color="#9aa0a8" pos={[-0.14, 0, 0]} rot={[0, 0, Math.PI / 2]} metal={0.8} />
      <mesh position={[-0.45, 0, 0]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.5, 0.004, 0.14]} />
        <meshStandardMaterial map={celdas} metalness={0.6} roughness={0.25} emissive="#1a2a6a" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.45, 0, 0]} rotation={[0.3, 0, 0]} scale={[1, 1, 1]}>
        <boxGeometry args={[0.5, 0.006, 0.006]} />
        <meshStandardMaterial color="#c8ccd4" metalness={0.8} />
      </mesh>
      {/* antena de radar (SAR): placa larga bajo el cuerpo */}
      <Pieza forma={{ f: "caja", t: [0.5, 0.012, 0.06] }} color="#e8e8ec" pos={[0.18, -0.1, 0]} rot={[0, 0, -0.2]} metal={0.5} rugoso={0.4} />
      <Pieza forma={{ f: "tubo", r: 0.04, r2: 0.005, h: 0.04, seg: 16 }} color="#f2f2f4" pos={[0.05, -0.1, 0.07]} rot={[Math.PI / 2, 0, 0]} />
      <Resplandor pos={[0.28, -0.12, 0]} r={0.04} color="#ff5a4a" o={0.6 * (f % 30 < 15 ? 1 : 0.2)} />
      {haz && (
        <group position={[0.18, -0.12, 0]} rotation={[barre, 0, -0.25]}>
          <mesh position={[0, -1.5, 0]}>
            <coneGeometry args={[0.6, 3, 24, 1, true]} />
            <meshBasicMaterial color="#7affc8" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
    </group>
  );
};
