// Escenarios 3D del vídeo 2 (Proyecto Azorian, 1974): el Pacífico al atardecer y de noche, el muelle donde BENT
// se enrola, el despacho / sala de prensa de los 70, la cubierta del barco con el pozo central (moon pool) y la
// torre, la cubierta del barco espía soviético que vigila, y el fondo abisal a 5.000 m.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente, Terreno } from "./escenarios";
import { Glomar3D, Torre, texturaLetrero } from "./modelos-azorian";
import { Cielo, Pieza, texturaBaldosas, texturaPunto } from "./piezas3d";

const R = (s: number, ...k: (string | number)[]) => azar(s, "az", ...k);
type V3 = [number, number, number];
const M = { metal: 0.55, rugoso: 0.5 };

// ---------------------------------------------------------------- comunes
/** Mar abierto con olas (y = altura media). */
export const Mar: React.FC<{ y: number; color: string; tam?: number; amp?: number; brillo?: number; seg?: number; liso?: boolean; ola?: number }> = ({ y, color, tam = 900, amp = 0.35, brillo = 0.25, seg = 120, liso, ola = 1 }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(tam, tam, seg, seg);
    g.rotateX(-Math.PI / 2);
    return g;
  }, [tam, seg]);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const z = p.getZ(i);
    p.setY(i, (Math.sin(x * 0.11 * ola + f * 0.04) * 0.6 + Math.cos(z * 0.14 * ola + f * 0.035) * 0.6 + Math.sin((x - z) * 0.4 * ola + f * 0.08) * 0.2) * amp);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} position={[0, y, 0]}>
      <meshStandardMaterial color={color} roughness={brillo} metalness={0.35} flatShading={!liso} />
    </mesh>
  );
};

/** Estrellas (puntos fijos en una cúpula lejana). */
export const Estrellas: React.FC<{ s: number; n?: number }> = ({ s, n = 260 }) => {
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      const az = R(s, "ea", i) * Math.PI * 2;
      const el = 0.05 + R(s, "ee", i) * 1.2;
      a.set([Math.cos(az) * Math.cos(el) * 280, Math.sin(el) * 280, Math.sin(az) * Math.cos(el) * 280], i * 3);
    }
    g.setAttribute("position", new THREE.BufferAttribute(a, 3));
    return g;
  }, [s, n]);
  return (
    <points geometry={geo}>
      <pointsMaterial map={texturaPunto()} color="#dfe8ff" size={1.6} transparent depthWrite={false} fog={false} />
    </points>
  );
};

/** Halo de luz (bombilla, foco) que se ve aunque no haya nada que iluminar. */
export const Halo: React.FC<{ pos: V3; r: number; color: string; o?: number }> = ({ pos, r, color, o = 0.25 }) => (
  <mesh position={pos}>
    <sphereGeometry args={[r, 14, 10]} />
    <meshBasicMaterial color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} />
  </mesh>
);

/** Haz de luz cónico (focos, reflectores). Apunta hacia abajo desde `pos` con la inclinación `rot`. */
export const Haz: React.FC<{ pos: V3; rot: V3; largo: number; ancho: number; color: string; o?: number }> = ({ pos, rot, largo, ancho, color, o = 0.06 }) => (
  <group position={pos} rotation={rot}>
    <mesh position={[0, -largo / 2, 0]}>
      <coneGeometry args={[ancho, largo, 24, 1, true]} />
      <meshBasicMaterial color={color} transparent opacity={o} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
  </group>
);

/** Plano con una textura de texto (letreros, carpetas, cajas). */
export const Letrero: React.FC<{ texto: string; pos: V3; rot?: V3; ancho: number; alto: number; fondo: string; tinta: string; letra?: number; basica?: boolean }> = ({ texto, pos, rot, ancho, alto, fondo, tinta, letra = 0.6, basica }) => {
  const tex = useMemo(() => texturaLetrero(texto, fondo, tinta, 1024, Math.round((1024 * alto) / ancho), letra), [texto, fondo, tinta, ancho, alto, letra]);
  return (
    <mesh position={pos} rotation={rot}>
      <planeGeometry args={[ancho, alto]} />
      {basica ? <meshBasicMaterial map={tex} transparent={fondo === "transparent"} depthWrite={fondo !== "transparent"} /> : <meshStandardMaterial map={tex} transparent={fondo === "transparent"} roughness={0.9} />}
    </mesh>
  );
};

// ---------------------------------------------------------------- PACÍFICO (mar abierto: atardecer o noche)
const Pacifico: React.FC<{ s: number; noche?: boolean }> = ({ s, noche }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {noche ? <Cielo arriba="#050a18" medio="#22406e" abajo="#060c18" /> : <Cielo arriba="#28466e" medio="#ff9a5c" abajo="#123049" />}
      <Ambiente niebla={noche ? ["#0d1a33", 40, 420] : ["#c98a68", 80, 620]} />
      <hemisphereLight args={noche ? ["#8fb0e8", "#10182a", 1.1] : ["#ffd2a8", "#1d3550", 1.1]} />
      <directionalLight position={noche ? [60, 80, -120] : [-120, 30, -300]} intensity={noche ? 1.6 : 2.6} color={noche ? "#b8ccff" : "#ffb070"} />
      <directionalLight position={[40, 50, 120]} intensity={noche ? 0.25 : 0.7} color={noche ? "#5a74b0" : "#9fc4ff"} />
      <Mar y={-0.3} color={noche ? "#18305a" : "#1e4766"} brillo={noche ? 0.3 : 0.18} />
      {noche ? (
        <group>
          <Estrellas s={s} />
          <Pieza forma={{ f: "bola", r: 9, seg: 24 }} color="#f2f0e2" basica pos={[110, 120, -250]} />
          <Halo pos={[110, 120, -250]} r={22} color="#9fb8ff" o={0.12} />
          {/* reflejo de la luna en el agua */}
          <mesh position={[40, 0.2, -120]} rotation={[-Math.PI / 2, 0, -0.4]}>
            <planeGeometry args={[14, 220]} />
            <meshBasicMaterial color="#9fb8ff" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      ) : (
        <group>
          <Pieza forma={{ f: "bola", r: 16, seg: 24 }} color="#ffe2a0" basica pos={[-150, 18, -520]} />
          <Halo pos={[-150, 18, -520]} r={60} color="#ffb060" o={0.18} />
          <mesh position={[-60, 0.1, -260]} rotation={[-Math.PI / 2, 0, 0.27]}>
            <planeGeometry args={[18, 520]} />
            <meshBasicMaterial color="#ffc070" transparent opacity={0.12 + 0.03 * Math.sin(f * 0.1)} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Pieza key={i} forma={{ f: "bola", r: 18 + R(s, "nr", i) * 10 }} esc={[3.4, 0.35, 1]} color={i % 2 ? "#e7a07c" : "#c9786a"} basica pos={[-260 + i * 90, 40 + R(s, "ny", i) * 50, -480]} />
          ))}
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- MUELLE (puerto, 1974, al anochecer)
const Muelle: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#77736c", "#6e6a63", 12), []);
  const nombre = useMemo(() => texturaLetrero("HUGHES GLOMAR EXPLORER", "transparent", "#ecebe4", 2048, 160, 0.62), []);
  return (
    <group>
      <Cielo arriba="#1c2a4a" medio="#d97a52" abajo="#2a2a34" />
      <Ambiente niebla={["#7a5a5a", 22, 160]} />
      <hemisphereLight args={["#ffcfa8", "#2a2630", 0.95]} />
      <directionalLight position={[-40, 18, -60]} intensity={1.8} color="#ff9a60" />
      <directionalLight position={[20, 30, 30]} intensity={0.45} color="#8fb0ff" />
      {/* muelle de hormigón */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, -3]}>
        <planeGeometry args={[60, 16]} />
        <meshStandardMaterial map={suelo} roughness={0.95} />
      </mesh>
      <Pieza forma={{ f: "caja", t: [60, 0.3, 0.4] }} color="#c9a33a" pos={[0, 0.05, -10.6]} />
      {/* agua entre el muelle y el barco */}
      <Mar y={-2.2} color="#1b2f44" tam={300} amp={0.15} />
      {/* el casco del barco, enorme, al fondo: ocupa todo el horizonte */}
      <group position={[0, 0, -16]}>
        <Pieza forma={{ f: "caja", t: [90, 13, 8] }} color="#283240" pos={[6, 4.3, -3]} {...M} />
        <Pieza forma={{ f: "caja", t: [90, 0.9, 8.05] }} color="#8a2a22" pos={[6, -1.7, -3]} {...M} />
        {Array.from({ length: 18 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.06, 12.8, 0.06] }} color="#1e2630" pos={[-38 + i * 5, 4.3, 1.02]} />
        ))}
        <mesh position={[2, 3.4, 1.03]}>
          <planeGeometry args={[28, 2.1]} />
          <meshBasicMaterial map={nombre} transparent depthWrite={false} />
        </mesh>
        {/* cubierta y la torre de perforación que asoma por encima */}
        <Pieza forma={{ f: "caja", t: [30, 5, 7] }} color="#e4e2dc" pos={[-26, 13.3, -3]} {...M} />
        {Array.from({ length: 10 }, (_, i) => (
          <Pieza key={`v${i}`} forma={{ f: "caja", t: [1.2, 0.8, 0.05] }} color="#ffd690" basica pos={[-39 + i * 2.8, 13.6, 0.52]} />
        ))}
        <group position={[6, 10.8, -3]}>
          <Torre alto={46} base={10} arriba={3} color="#d8d2c2" luces />
        </group>
        <pointLight position={[6, 30, 4]} intensity={60} distance={60} color="#ffe2b0" />
        <pointLight position={[0, 6, 8]} intensity={40} distance={20} color="#ffb070" />
      </group>
      {/* pasarela del muelle al barco */}
      <group position={[3.2, 0, -12]} rotation={[0.55, 0, 0]}>
        <Pieza forma={{ f: "caja", t: [1.4, 0.12, 9] }} color="#5a5650" pos={[0, 2.2, -3.5]} {...M} />
        {[-0.7, 0.7].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.05, 0.05, 9] }} color="#c9a33a" pos={[x, 3.1, -3.5]} />
        ))}
      </group>
      {/* cajas de "equipo de minería" (la tapadera) */}
      {[
        [-4.6, -2.2, 0],
        [-4.6, -2.2, 1],
        [-3.2, -2.6, 0],
        [-5.4, -0.6, 0],
      ].map(([x, z, n], i) => (
        <group key={i} position={[x, 0.6 + n * 1.2, z]} rotation={[0, 0.2 * i, 0]}>
          <Pieza forma={{ f: "caja", t: [1.6, 1.2, 1.2] }} color="#8a6a44" rugoso={0.95} />
          <Letrero texto="MINING EQUIPMENT" pos={[0, 0, 0.61]} ancho={1.4} alto={0.26} fondo="transparent" tinta="#1e1a14" letra={0.5} />
        </group>
      ))}
      {/* bolardos y cabos */}
      {[-1.6, 5.6].map((x) => (
        <group key={x} position={[x, 0, -9.6]}>
          <Pieza forma={{ f: "tubo", r: 0.28, r2: 0.22, h: 0.6 }} color="#2a2a2e" pos={[0, 0.3, 0]} metal={0.6} />
          <Pieza forma={{ f: "tubo", r: 0.05, h: 7 }} color="#b8a882" pos={[0, 1.6, -3.2]} rot={[1.15, 0, 0]} />
        </group>
      ))}
      {/* farolas */}
      {[-6.5, 6.2].map((x, i) => (
        <group key={x} position={[x, 0, -3.2 + i]}>
          <Pieza forma={{ f: "tubo", r: 0.07, h: 5 }} color="#2a2c30" pos={[0, 2.5, 0]} metal={0.6} />
          <Pieza forma={{ f: "caja", t: [0.5, 0.2, 0.3] }} color="#2a2c30" pos={[0.2, 5, 0]} metal={0.6} />
          <Pieza forma={{ f: "bola", r: 0.12, seg: 10 }} color="#ffcf80" basica pos={[0.25, 4.85, 0]} />
          <Halo pos={[0.25, 4.85, 0]} r={0.7} color="#ffb860" o={0.18 + 0.02 * Math.sin(f * 0.3 + i)} />
          <pointLight position={[0.25, 4.6, 0.3]} intensity={30} distance={14} color="#ffc070" />
        </group>
      ))}
      {/* grúa de carga en silueta */}
      <group position={[-16, 0, -6]}>
        <Torre alto={22} base={3} arriba={1.5} color="#3a3c42" />
        <Pieza forma={{ f: "caja", t: [18, 0.6, 0.6] }} color="#3a3c42" pos={[6, 22, 0]} rot={[0, 0, 0.12]} />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- OFICINA (despacho y sala de prensa, años 70)
const Oficina: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#5a3e2c", "#4e3626", 9), []);
  const madera = "#6a4a32";
  return (
    <group>
      <Ambiente niebla={["#3a2c24", 10, 34]} fondo="#1a1410" />
      <hemisphereLight args={["#ffe2c0", "#2a1e16", 0.75]} />
      <ambientLight intensity={0.12} color="#ffe8cc" />
      <pointLight position={[0, 3.2, -1.6]} intensity={22} distance={9} color="#ffd8a0" />
      <pointLight position={[-3.4, 1.6, -1.2]} intensity={10} distance={5} color="#9fe0a0" />
      <pointLight position={[0, 3.0, -0.6]} intensity={24} distance={7} color="#fff0d0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[12, 14]} />
        <meshStandardMaterial map={suelo} roughness={0.55} metalness={0.1} />
      </mesh>
      {/* paredes con paneles de madera */}
      <Pieza forma={{ f: "caja", t: [12, 3.8, 0.2] }} color="#7a5a40" pos={[0, 1.9, -4]} />
      {Array.from({ length: 12 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.04, 3.7, 0.05] }} color="#4a3220" pos={[-5.5 + i, 1.9, -3.88]} />
      ))}
      <Pieza forma={{ f: "caja", t: [0.2, 3.8, 14] }} color="#6e5038" pos={[-6, 1.9, 0]} />
      <Pieza forma={{ f: "caja", t: [0.2, 3.8, 14] }} color="#6e5038" pos={[6, 1.9, 0]} />
      <Pieza forma={{ f: "caja", t: [12, 0.2, 14] }} color="#3a2c22" pos={[0, 3.85, 0]} />
      {/* ventana con persianas: rayas de luz azul de la noche */}
      <group position={[-3.4, 2.1, -3.88]}>
        <Pieza forma={{ f: "caja", t: [2.2, 1.6, 0.04] }} color="#6f9ad8" basica />
        {Array.from({ length: 11 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [2.24, 0.07, 0.03] }} color="#20242c" pos={[0, -0.75 + i * 0.15, 0.03]} />
        ))}
      </group>
      {/* mapa del Pacífico con una marca roja */}
      <group position={[2.6, 2.3, -3.87]}>
        <Pieza forma={{ f: "caja", t: [2.4, 1.4, 0.03] }} color="#c9b98a" />
        <Pieza forma={{ f: "bola", r: 0.4, seg: 12 }} esc={[1.5, 0.8, 0.05]} color="#8aa070" pos={[-0.6, 0.2, 0.02]} />
        <Pieza forma={{ f: "bola", r: 0.3, seg: 12 }} esc={[1.2, 1.4, 0.05]} color="#8aa070" pos={[0.85, 0.05, 0.02]} />
        <Pieza forma={{ f: "bola", r: 0.06, seg: 8 }} color="#d02a2a" basica pos={[0.05, 0.15, 0.04]} opacidad={0.6 + 0.4 * Math.sin(f * 0.15)} />
      </group>
      {/* atril con micrófonos (centro, al fondo) */}
      <group position={[0, 0, -2.6]}>
        <Pieza forma={{ f: "caja", t: [0.9, 1.15, 0.5] }} color={madera} pos={[0, 0.575, 0]} rugoso={0.6} />
        <Pieza forma={{ f: "caja", t: [1.0, 0.06, 0.6] }} color="#4a3220" pos={[0, 1.18, 0]} rot={[0.15, 0, 0]} />
        {[-0.18, 0, 0.18].map((x, i) => (
          <group key={x} position={[x, 1.2, 0.2]} rotation={[0.5, (i - 1) * 0.3, 0]}>
            <Pieza forma={{ f: "tubo", r: 0.012, h: 0.35 }} color="#1a1a1a" pos={[0, 0.17, 0]} metal={0.6} />
            <Pieza forma={{ f: "bola", r: 0.04, seg: 10 }} esc={[1, 1.4, 1]} color="#2a2a2e" pos={[0, 0.37, 0]} metal={0.6} />
          </group>
        ))}
      </group>
      {/* escritorio con lámpara verde, teléfono y la carpeta secreta */}
      <group position={[-3.2, 0, -1.6]} rotation={[0, 0.35, 0]}>
        <Pieza forma={{ f: "caja", t: [2.2, 0.08, 1.1] }} color="#4a3020" pos={[0, 0.8, 0]} rugoso={0.5} />
        <Pieza forma={{ f: "caja", t: [2.1, 0.75, 1.0] }} color="#3e2818" pos={[0, 0.38, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.02, h: 0.35 }} color="#c9a24a" pos={[-0.7, 1.0, -0.2]} metal={0.8} />
        <Pieza forma={{ f: "tubo", r: 0.08, h: 0.12 }} color="#2f6a3a" pos={[-0.7, 1.2, -0.2]} rot={[0, 0, Math.PI / 2]} rugoso={0.3} />
        <Halo pos={[-0.7, 1.12, -0.2]} r={0.25} color="#9fe0a0" o={0.18} />
        <Pieza forma={{ f: "caja", t: [0.3, 0.1, 0.22] }} color="#1a1a1c" pos={[0.6, 0.89, -0.2]} rugoso={0.3} />
        <Pieza forma={{ f: "caja", t: [0.5, 0.02, 0.36] }} color="#c8a868" pos={[0.05, 0.85, 0.15]} rot={[0, -0.2, 0]} />
        <Letrero texto="TOP SECRET" pos={[0.05, 0.862, 0.15]} rot={[-Math.PI / 2, 0, -0.2]} ancho={0.36} alto={0.08} fondo="transparent" tinta="#b0202a" letra={0.7} />
      </group>
      {/* archivadores */}
      {[3.8, 4.6].map((x) => (
        <group key={x} position={[x, 0, -2.9]}>
          <Pieza forma={{ f: "caja", t: [0.7, 1.5, 0.7] }} color="#5a6058" pos={[0, 0.75, 0]} metal={0.4} rugoso={0.5} />
          {[0.35, 0.75, 1.15].map((y) => (
            <Pieza key={y} forma={{ f: "caja", t: [0.2, 0.04, 0.03] }} color="#b8b8b0" pos={[0, y, 0.36]} metal={0.8} />
          ))}
        </group>
      ))}
      {/* lámpara de techo */}
      <Pieza forma={{ f: "cono", r: 0.35, h: 0.25, seg: 18 }} color="#2a2420" pos={[0, 3.55, -1.6]} />
      <Halo pos={[0, 3.4, -1.6]} r={0.4} color="#ffd8a0" o={0.25} />
      <Haz pos={[0, 3.4, -1.6]} rot={[0, 0, 0]} largo={3.4} ancho={1.4} color="#ffe0b0" o={0.035} />
    </group>
  );
};

// ---------------------------------------------------------------- CUBIERTA DEL GLOMAR (de noche, con el pozo central)
// El pozo (moon pool) va de x -3.5 a 3.5 y de z -9.5 a -4: un agujero en mitad del casco por el que se ve el mar.
const POZO = { x0: -3.5, x1: 3.5, z0: -12, z1: -6.5, agua: -4.5 };
const CubiertaGlomar: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const placas = useMemo(() => texturaBaldosas("#6c6a64", "#646259", 14), []);
  const amarillo = "#d6a830";
  const { x0, x1, z0, z1, agua } = POZO;
  const W = 60;
  return (
    <group>
      <Cielo arriba="#03050c" medio="#14223c" abajo="#05070c" />
      <Estrellas s={s} />
      <Ambiente niebla={["#141c2a", 26, 160]} />
      <hemisphereLight args={["#8fa8d8", "#1a1612", 0.6]} />
      <directionalLight position={[30, 50, -20]} intensity={0.6} color="#b8ccff" />
      {/* focos de la torre sobre la cubierta */}
      <pointLight position={[-4, 9, -2]} intensity={70} distance={26} color="#ffe2b0" />
      <pointLight position={[5, 9, -3]} intensity={60} distance={26} color="#ffe2b0" />
      <pointLight position={[0, 2.5, -9.2]} intensity={18} distance={10} color="#7fe0ff" />
      <pointLight position={[0, 4, 2]} intensity={30} distance={12} color="#ffe2b0" />
      {/* cubierta alrededor del pozo (4 planchas) */}
      {(
        [
          [-W / 2, x0, -40, 30],
          [x1, W / 2, -40, 30],
          [x0, x1, z1, 30],
          [x0, x1, -40, z0],
        ] as [number, number, number, number][]
      ).map(([a, b, c, d], i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[(a + b) / 2, 0, (c + d) / 2]}>
          <planeGeometry args={[b - a, d - c]} />
          <meshStandardMaterial map={placas} roughness={0.7} metalness={0.4} />
        </mesh>
      ))}
      {/* paredes del pozo y el agua dentro, con brillo */}
      {(
        [
          [[(x0 + x1) / 2, agua / 2, z1], [x1 - x0, -agua, 0.1]],
          [[(x0 + x1) / 2, agua / 2, z0], [x1 - x0, -agua, 0.1]],
          [[x0, agua / 2, (z0 + z1) / 2], [0.1, -agua, z1 - z0]],
          [[x1, agua / 2, (z0 + z1) / 2], [0.1, -agua, z1 - z0]],
        ] as [V3, V3][]
      ).map(([pos, t], i) => (
        <Pieza key={i} forma={{ f: "caja", t }} color="#3a3c3e" pos={pos} {...M} />
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[(x0 + x1) / 2, agua + 0.6, (z0 + z1) / 2]}>
        <planeGeometry args={[x1 - x0, z1 - z0, 20, 14]} />
        <meshStandardMaterial color="#0a3a4a" emissive="#0a5a6a" emissiveIntensity={0.35 + 0.1 * Math.sin(f * 0.07)} roughness={0.15} metalness={0.4} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={`o${i}`} rotation={[-Math.PI / 2, 0, 0]} position={[x0 + 0.8 + R(s, "ox", i) * 5.4, agua + 0.62, z0 + 0.6 + R(s, "oz", i) * 4.3]}>
          <ringGeometry args={[0.1 + ((f * 0.01 + R(s, "op", i)) % 1) * 0.8, 0.14 + ((f * 0.01 + R(s, "op", i)) % 1) * 0.8, 24]} />
          <meshBasicMaterial color="#9fefff" transparent opacity={0.25 * (1 - ((f * 0.01 + R(s, "op", i)) % 1))} depthWrite={false} />
        </mesh>
      ))}
      {/* barandilla amarilla alrededor del pozo */}
      {(
        [
          [[(x0 + x1) / 2, z1 + 0.2], x1 - x0, 0],
          [[(x0 + x1) / 2, z0 - 0.2], x1 - x0, 0],
          [[x0 - 0.2, (z0 + z1) / 2], z1 - z0, Math.PI / 2],
          [[x1 + 0.2, (z0 + z1) / 2], z1 - z0, Math.PI / 2],
        ] as [[number, number], number, number][]
      ).map(([[x, z], l, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Pieza forma={{ f: "caja", t: [l, 0.05, 0.05] }} color={amarillo} pos={[0, 1.05, 0]} />
          <Pieza forma={{ f: "caja", t: [l, 0.04, 0.04] }} color={amarillo} pos={[0, 0.55, 0]} />
          {Array.from({ length: Math.round(l / 1.2) + 1 }, (_, k) => (
            <Pieza key={k} forma={{ f: "caja", t: [0.05, 1.05, 0.05] }} color={amarillo} pos={[-l / 2 + k * 1.2, 0.52, 0]} />
          ))}
        </group>
      ))}
      {/* señal de aviso en la barandilla */}
      <Letrero texto="DANGER  -  MOON POOL" pos={[0, 0.8, z1 + 0.24]} ancho={2.4} alto={0.32} fondo="#d6a830" tinta="#141414" letra={0.55} />
      {/* la torre de perforación encima del pozo */}
      <group position={[0, 0, (z0 + z1) / 2]}>
        <Torre alto={44} base={8.6} arriba={2.6} color="#d8d2c2" luces abierta />
      </group>
      {[
        [-4.6, 7, -5],
        [4.6, 7, -5],
      ].map(([x, y, z], i) => (
        <group key={i}>
          <Halo pos={[x, y, z]} r={0.4} color="#ffe2b0" o={0.3} />
          <Haz pos={[x, y, z]} rot={[0.3, 0, -x * 0.04]} largo={y + 2} ancho={3} color="#ffe8c0" o={0.03} />
        </group>
      ))}
      {/* bastidores de tubos a los lados */}
      {[-8.5, 8.5].map((x) => (
        <group key={x} position={[x, 0, -8]}>
          {Array.from({ length: 24 }, (_, i) => (
            <Pieza key={i} forma={{ f: "tubo", r: 0.22, h: 9, seg: 10 }} color={i % 3 ? "#8a7c62" : "#7a6c52"} pos={[(i % 6) * 0.46 - 1.15, 0.24 + Math.floor(i / 6) * 0.44, 0]} rot={[Math.PI / 2, 0, 0]} metal={0.6} rugoso={0.5} />
          ))}
          {[-3.5, 0, 3.5].map((z) => (
            <Pieza key={z} forma={{ f: "caja", t: [3.2, 2.2, 0.15] }} color="#3a3a3c" pos={[0, 1.1, z]} {...M} />
          ))}
        </group>
      ))}
      {/* castillo de popa iluminado al fondo */}
      <group position={[0, 0, -30]}>
        <Pieza forma={{ f: "caja", t: [18, 9, 8] }} color="#d8d6d0" pos={[0, 4.5, 0]} {...M} />
        {Array.from({ length: 16 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [1.1, 0.7, 0.05] }} color="#ffd690" basica pos={[-7.5 + (i % 8) * 2.1, 3 + Math.floor(i / 8) * 3, 4.03]} />
        ))}
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- VIGÍA (cubierta del barco soviético, de noche)
const Vigia: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const placas = useMemo(() => texturaBaldosas("#4e5458", "#474c50", 10), []);
  return (
    <group>
      <Cielo arriba="#03050c" medio="#162845" abajo="#03060c" />
      <Estrellas s={s + 3} />
      <Ambiente niebla={["#0e1a30", 50, 420]} />
      <hemisphereLight args={["#6f8fc8", "#06080c", 0.55]} />
      <directionalLight position={[60, 60, -60]} intensity={0.8} color="#b8ccff" />
      <pointLight position={[0, 4, 2]} intensity={14} distance={10} color="#ffcf90" />
      <pointLight position={[-3.6, 2, -2]} intensity={6} distance={6} color="#ff4a3a" />
      {/* cubierta */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[14, 12]} />
        <meshStandardMaterial map={placas} roughness={0.75} metalness={0.4} />
      </mesh>
      {/* borda: chapa y barandilla al frente (lo que separa del mar) */}
      <Pieza forma={{ f: "caja", t: [14, 0.6, 0.08] }} color="#5a6268" pos={[0, 0.3, -3.6]} {...M} />
      <Pieza forma={{ f: "tubo", r: 0.03, h: 14 }} color="#7a8288" pos={[0, 1.05, -3.6]} rot={[0, 0, Math.PI / 2]} metal={0.7} />
      {Array.from({ length: 12 }, (_, i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.025, h: 1.05 }} color="#7a8288" pos={[-6.5 + i * 1.2, 0.52, -3.6]} metal={0.7} />
      ))}
      {/* mar muy abajo y, al otro lado, el barco de la CIA iluminado */}
      <Mar y={-7} color="#0a1628" />
      <group position={[8, -6.7, -85]} rotation={[0, 0.25, 0]} scale={120}>
        <Glomar3D noche />
      </group>
      <pointLight position={[8, 10, -78]} intensity={400} distance={60} color="#ffe2b0" />
      <Pieza forma={{ f: "bola", r: 9, seg: 24 }} color="#f2f0e2" basica pos={[-120, 110, -260]} />
      <Halo pos={[-120, 110, -260]} r={22} color="#9fb8ff" o={0.12} />
      {/* cúpula de radar y mástil con bandera roja */}
      <group position={[-4.2, 0, -2.4]}>
        <Pieza forma={{ f: "tubo", r: 0.8, h: 1.2 }} color="#6a7278" pos={[0, 0.6, 0]} {...M} />
        <Pieza forma={{ f: "bola", r: 1.3, seg: 28 }} color="#e2e0da" pos={[0, 2.2, 0]} rugoso={0.4} />
      </group>
      <group position={[4.4, 0, -2.6]}>
        <Pieza forma={{ f: "tubo", r: 0.12, h: 9 }} color="#3a4046" pos={[0, 4.5, 0]} metal={0.6} />
        <Pieza forma={{ f: "caja", t: [2.2, 0.08, 0.08] }} color="#3a4046" pos={[0, 7, 0]} metal={0.6} />
        <Pieza forma={{ f: "caja", t: [0.08, 0.08, 1.4] }} color="#3a4046" pos={[0, 8.2, 0]} rot={[0, f * 0.05, 0]} metal={0.6} />
        <group position={[0.05, 8.6, 0]} rotation={[0, Math.sin(f * 0.08) * 0.25, 0]}>
          <Pieza forma={{ f: "caja", t: [1.3, 0.85, 0.02] }} color="#b8202a" pos={[0.7, 0, 0]} brillo="#5a0a0a" intensidad={0.5} />
          <Pieza forma={{ f: "caja", t: [0.18, 0.18, 0.025] }} color="#e8c040" pos={[0.3, 0.2, 0]} brillo="#6a5010" intensidad={0.5} />
        </group>
        <Pieza forma={{ f: "bola", r: 0.1, seg: 8 }} color="#ff3020" basica opacidad={Math.sin(f * 0.15) > 0 ? 1 : 0.3} pos={[0, 9.1, 0]} />
      </group>
      {/* reflector en la borda apuntando al barco americano */}
      <group position={[2.4, 1.2, -3.4]}>
        <Pieza forma={{ f: "tubo", r: 0.08, h: 1.2 }} color="#3a4046" pos={[0, -0.6, 0]} metal={0.6} />
        <Pieza forma={{ f: "tubo", r: 0.3, r2: 0.25, h: 0.5 }} color="#4a5056" rot={[Math.PI / 2 - 0.05, 0.08, 0]} metal={0.6} />
        <Pieza forma={{ f: "disco", r: 0.24 }} color="#fff6d8" basica pos={[0.02, 0.01, -0.26]} rot={[0, Math.PI, 0]} />
        <Haz pos={[0.02, 0.05, -0.3]} rot={[-Math.PI / 2 + 0.05, 0, 0.09]} largo={80} ancho={5} color="#fff2c8" o={0.05} />
      </group>
      {/* cajas de munición y salvavidas */}
      <Pieza forma={{ f: "caja", t: [0.9, 0.6, 0.6] }} color="#4a5038" pos={[-2, 0.3, -2.9]} />
      <group position={[-0.8, 0.85, -3.55]}>
        <Pieza forma={{ f: "aro", r: 0.3, g: 0.08 }} color="#d8642a" />
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- ABISMO (fondo del Pacífico, ~5.000 m)
const Abismo: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  return (
    <group>
      <Cielo arriba="#081428" medio="#040a16" abajo="#02050b" />
      <Ambiente niebla={["#050c1a", 6, 46]} />
      <hemisphereLight args={["#6a8ac0", "#141820", 0.95]} />
      <ambientLight intensity={0.15} color="#8fb0e0" />
      {/* las únicas luces: focos que bajan de arriba (como los de la garra) */}
      <pointLight position={[-1, 7, 1]} intensity={140} distance={26} color="#dce8ff" />
      <pointLight position={[5, 6, -5]} intensity={70} distance={20} color="#9fc0ff" />
      <Haz pos={[-2, 16, 4]} rot={[0.42, 0, -0.08]} largo={20} ancho={5} color="#cfe0ff" o={0.025} />
      <Terreno color="#4a4a4e" s={s} amp={0.5} />
      {/* campo de nódulos de manganeso: piedras negras de metal por todo el fondo */}
      {Array.from({ length: 70 }, (_, i) => {
        const x = (R(s, "nx", i) - 0.5) * 34;
        const z = 4 - R(s, "nz", i) * 30;
        const r = 0.08 + R(s, "nr", i) * 0.16;
        return <Pieza key={i} forma={{ f: "roca", r, s: i }} esc={[1, 0.6, 0.9]} color="#24201c" pos={[x, r * 0.3, z]} rugoso={0.45} metal={0.5} />;
      })}
      {/* rocas lejanas y criaturas de las profundidades: pepinos de mar pálidos y lucecitas */}
      {Array.from({ length: 10 }, (_, i) => (
        <Pieza key={`r${i}`} forma={{ f: "roca", r: 1 + R(s, "rr", i) * 2.5, s: i * 7 }} esc={[1.6, 0.6, 1]} color="#2e3036" pos={[(R(s, "rx", i) - 0.5) * 60, 0, -14 - R(s, "rz", i) * 20]} />
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <Pieza key={`p${i}`} forma={{ f: "bola", r: 0.1, seg: 10 }} esc={[2.4, 0.7, 0.9]} color="#8a6a6e" pos={[(R(s, "px", i) - 0.5) * 16, 0.06, 2 - R(s, "pz", i) * 12]} rot={[0, R(s, "pr", i) * 6, 0]} rugoso={0.4} />
      ))}
      {Array.from({ length: 24 }, (_, i) => {
        const b = 0.5 + 0.5 * Math.sin(f * (0.03 + R(s, "lb", i) * 0.05) + i);
        return <Pieza key={`l${i}`} forma={{ f: "bola", r: 0.04 + R(s, "lr", i) * 0.05, seg: 8 }} color={i % 3 ? "#58e6ff" : "#9bff6e"} basica opacidad={0.15 + b * 0.6} pos={[(R(s, "lx", i) - 0.5) * 30, 1 + R(s, "ly", i) * 8, -4 - R(s, "lz", i) * 20]} />;
      })}
    </group>
  );
};

export const ESCENARIOS_AZORIAN = {
  pacifico: (({ s }) => <Pacifico s={s} />) as React.FC<{ s: number }>,
  "pacifico-noche": (({ s }) => <Pacifico s={s} noche />) as React.FC<{ s: number }>,
  muelle: Muelle,
  oficina: Oficina,
  glomar: CubiertaGlomar,
  vigia: Vigia,
  abismo: Abismo,
};
