// Escenarios NUEVOS (estilo "3D ilustrado" con mucho detalle, luz de cine cálida contra fría):
// - fortaleza: muralla de una fortaleza marina de noche, con antorchas, torre, cañón, luna, faro y el pueblo abajo.
// - camarote: camarote del capitán de un galeón, ventanales a popa con el mar a la luz de la luna, velas y tesoro.
// - templo: templo hundido bajo el mar, columnas con coral, mosaico, cabeza de estatua y el tridente dorado.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente } from "./escenarios";
import { Estrellas, Haz, Mar } from "./escenarios-azorian";
import { Cielo, Pieza, texturaPunto } from "./piezas3d";
import { texAlfombra, texEstandarte, texLosas, texMadera, texMapa, texMosaico, texPiedra } from "./texturas-pintadas";

type V3 = [number, number, number];
const R = (s: number, ...k: (string | number)[]) => azar(s, "nv", ...k);

// ---------------------------------------------------------------- piezas comunes
/** Caja con textura pintada. */
export const TCaja: React.FC<{ t: V3; pos?: V3; rot?: V3; map: THREE.Texture; color?: string; rugoso?: number }> = ({ t, pos, rot, map, color = "#ffffff", rugoso = 0.9 }) => (
  <mesh position={pos} rotation={rot}>
    <boxGeometry args={t} />
    <meshStandardMaterial map={map} color={color} roughness={rugoso} />
  </mesh>
);

/** Plano con textura (suelos, paredes, alfombras, mapas). */
export const TPlano: React.FC<{ w: number; h: number; pos?: V3; rot?: V3; map: THREE.Texture; color?: string; brillo?: number }> = ({ w, h, pos, rot, map, color = "#ffffff", brillo = 0 }) => (
  <mesh position={pos} rotation={rot}>
    <planeGeometry args={[w, h]} />
    <meshStandardMaterial map={map} color={color} roughness={0.95} emissive={brillo ? "#ffffff" : "#000000"} emissiveMap={brillo ? map : null} emissiveIntensity={brillo} />
  </mesh>
);

/** Halo de luz suave (sprite con degradado radial) que no se pierde en la niebla. */
export const Resplandor: React.FC<{ pos: V3; r: number; color: string; o: number }> = ({ pos, r, color, o }) => {
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: texturaPunto(), color, transparent: true, opacity: o, blending: THREE.AdditiveBlending, depthWrite: false, fog: false }), [color]); // eslint-disable-line react-hooks/exhaustive-deps
  mat.opacity = o;
  return <sprite material={mat} position={pos} scale={[r * 2.2, r * 2.2, 1]} />;
};

/** Fuego: lenguas que bailan + resplandor + (opcional) luz real. */
export const Fuego: React.FC<{ pos: V3; tam?: number; luz?: number; s: number }> = ({ pos, tam = 1, luz = 0, s }) => {
  const f = useCurrentFrame();
  const k = 0.75 + 0.25 * Math.sin(f * 0.55 + s) * Math.sin(f * 0.21 + s * 2);
  return (
    <group position={pos}>
      {[0, 1, 2, 3, 4].map((i) => {
        const h = tam * (0.28 + 0.12 * Math.sin(f * 0.7 + i * 1.9 + s)) * (i === 2 ? 1.5 : 1);
        return (
          <mesh key={i} position={[(i - 2) * 0.045 * tam, h / 2, Math.sin(i * 2.1) * 0.03 * tam]} rotation={[0, 0, Math.sin(f * 0.4 + i) * 0.15]}>
            <coneGeometry args={[0.07 * tam, h, 7]} />
            <meshBasicMaterial color={i === 2 ? "#fff1a8" : i % 2 ? "#ffb63a" : "#ff6a1a"} fog={false} />
          </mesh>
        );
      })}
      <Resplandor pos={[0, 0.18 * tam, 0]} r={0.45 * tam} color="#ff9a3a" o={0.28 * k} />
      <Resplandor pos={[0, 0.18 * tam, 0]} r={1.1 * tam} color="#ff7a2a" o={0.08 * k} />
      {luz > 0 && <pointLight position={[0, 0.4 * tam, 0.2]} intensity={luz * k} distance={9} decay={1.6} color="#ff9e50" />}
    </group>
  );
};

export const Antorcha: React.FC<{ pos: V3; luz?: number; s: number }> = ({ pos, luz = 0, s }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.045, h: 0.7 }} color="#3a2414" pos={[0, 0.35, 0]} />
    <Pieza forma={{ f: "tubo", r: 0.16, r2: 0.08, h: 0.18, seg: 10 }} color="#2a2a30" pos={[0, 0.76, 0]} metal={0.7} rugoso={0.4} />
    <Fuego pos={[0, 0.82, 0]} tam={1.2} luz={luz} s={s} />
  </group>
);

export const Luna: React.FC<{ pos: V3; r: number }> = ({ pos, r }) => (
  <group position={pos}>
    <mesh>
      <sphereGeometry args={[r, 32, 24]} />
      <meshBasicMaterial color="#fff6dc" fog={false} />
    </mesh>
    {[1.35, 2.2, 4].map((k, i) => (
      <Resplandor key={i} pos={[0, 0, 0]} r={r * k} color="#cfe0ff" o={[0.35, 0.14, 0.06][i]} />
    ))}
  </group>
);

export const Barril: React.FC<{ pos: V3; rot?: V3; s?: number }> = ({ pos, rot }) => {
  const mad = texMadera(26, 50, 34, 6);
  return (
    <group position={pos} rotation={rot}>
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.32, 0.32, 0.9, 20]} />
        <meshStandardMaterial map={mad} roughness={0.85} />
      </mesh>
      <Pieza forma={{ f: "tubo", r: 0.36, h: 0.62, seg: 20 }} color="#5a3a1e" pos={[0, 0.45, 0]} />
      {[0.12, 0.78].map((y) => (
        <Pieza key={y} forma={{ f: "tubo", r: 0.345, h: 0.06, seg: 20 }} color="#2e2e34" pos={[0, y, 0]} metal={0.7} rugoso={0.45} />
      ))}
      <Pieza forma={{ f: "tubo", r: 0.3, h: 0.02, seg: 20 }} color="#6a4524" pos={[0, 0.905, 0]} />
    </group>
  );
};

export const Caja: React.FC<{ pos: V3; tam?: number; rot?: V3 }> = ({ pos, tam = 0.7, rot }) => {
  const mad = texMadera(32, 42, 46, 4);
  return (
    <group position={pos} rotation={rot}>
      <TCaja t={[tam, tam, tam]} pos={[0, tam / 2, 0]} map={mad} />
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "caja", t: [tam * 1.02, tam * 0.1, tam * 1.02] }} color="#4a2c14" pos={[0, tam / 2 + l * tam * 0.36, 0]} />
      ))}
    </group>
  );
};

// ================================================================ FORTALEZA (muralla sobre el mar, de noche)
const Fortaleza: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const losas = texLosas(220, 14, 58, [2, 22]);
  const muro = texPiedra(225, 12, 56, 8, 3, [18, 5]);
  const muroBajo = texPiedra(225, 12, 52, 8, 3, [10, 1]);
  const almena = texPiedra(222, 12, 60, 2, 1);
  const torre = texPiedra(28, 18, 62, 10, 4, [5, 4]);
  const estandarte = texEstandarte("#8e1b24", "#f2c14e");
  const largo = 60;
  const z0 = 12;
  const zc = z0 - largo / 2;
  const merlones = Array.from({ length: 34 }, (_, i) => z0 - 0.6 - i * 1.75);
  const antorchas = [5, -1, -7, -13, -19];
  const faro = f * 0.035;
  return (
    <group>
      <Ambiente niebla={["#1a2a5e", 35, 260]} fondo="#0b1640" />
      <Cielo arriba="#070f33" medio="#24447e" abajo="#141a3a" radio={330} />
      <Estrellas s={s} n={420} />
      <Luna pos={[-40, 62, -170]} r={7} />
      <hemisphereLight args={["#7d9be8", "#1a1a34", 0.55]} />
      <directionalLight position={[-40, 62, -60]} intensity={1.5} color="#b8ccff" />
      <ambientLight intensity={0.12} color="#8fa4e0" />
      {/* camino de ronda */}
      <TPlano w={5} h={largo} pos={[0, 0, zc]} rot={[-Math.PI / 2, 0, 0]} map={losas} />
      {/* muro exterior (hacia el mar) con almenas */}
      <TCaja t={[0.9, 16, largo]} pos={[2.95, -7.4, zc]} map={muro} />
      {merlones.map((z, i) => (
        <TCaja key={i} t={[0.9, 0.95, 1.05]} pos={[2.95, 1.07 + 0.0, z]} map={almena} />
      ))}
      <TCaja t={[0.9, 0.6, largo]} pos={[2.95, 0.3, zc]} map={muroBajo} />
      {/* pretil interior y caída al puerto */}
      <TCaja t={[0.55, 0.75, largo]} pos={[-2.75, 0.37, zc]} map={muroBajo} />
      <TCaja t={[0.55, 14, largo]} pos={[-2.75, -7, zc]} map={muro} />
      {/* antorchas sobre el pretil y entre almenas */}
      {antorchas.map((z, i) => (
        <React.Fragment key={z}>
          <Antorcha pos={[-2.75, 0.75, z]} luz={i < 3 ? 7 : 0} s={s + i} />
          <Antorcha pos={[2.95, 1.55, z - 2.6]} luz={i < 2 ? 5 : 0} s={s + i + 9} />
        </React.Fragment>
      ))}
      {/* estandartes colgando del muro del mar */}
      {[2.2, -9.8].map((z) => (
        <group key={z} position={[2.45, 0.2, z]}>
          <TPlano w={0.75} h={1.5} pos={[0, 0.95, 0]} rot={[0, -Math.PI / 2, 0]} map={estandarte} />
          <Pieza forma={{ f: "tubo", r: 0.03, h: 0.95 }} color="#d9a63a" pos={[0, 1.72, 0]} rot={[Math.PI / 2, 0, 0]} metal={0.8} rugoso={0.3} />
        </group>
      ))}
      {/* cañón asomado a una tronera */}
      <group position={[1.9, 0, -3.2]} rotation={[0, -Math.PI / 2, 0]}>
        <Pieza forma={{ f: "caja", t: [0.9, 0.35, 0.7] }} color="#6a4424" pos={[0, 0.3, 0]} />
        {[-0.38, 0.38].map((x) =>
          [-0.3, 0.3].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "tubo", r: 0.17, h: 0.08, seg: 16 }} color="#4a2c14" pos={[x, 0.17, z]} rot={[Math.PI / 2, 0, 0]} />),
        )}
        <Pieza forma={{ f: "tubo", r: 0.16, r2: 0.12, h: 1.7, seg: 18 }} color="#2a2c34" pos={[0, 0.62, -0.45]} rot={[Math.PI / 2 - 0.12, 0, 0]} metal={0.75} rugoso={0.35} />
        <Pieza forma={{ f: "aro", r: 0.16, g: 0.035 }} color="#3a3c44" pos={[0, 0.7, -1.25]} metal={0.75} />
      </group>
      {/* balas de cañón en pirámide, barriles, cajas y cubo */}
      {[[0, 0, 0], [0.24, 0, 0], [0.12, 0, 0.2], [0.12, 0.19, 0.07]].map(([x, y, z], i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.12, seg: 14 }} color="#1e2026" pos={[1.7 + x, 0.12 + y, -1.4 + z]} metal={0.6} rugoso={0.4} />
      ))}
      <Barril pos={[-2.05, 0, -4.6]} />
      <Barril pos={[-1.95, 0, -5.4]} />
      <Barril pos={[-2.1, 0, 1.8]} />
      <Caja pos={[2.0, 0, -8.6]} tam={0.75} rot={[0, 0.3, 0]} />
      <Caja pos={[1.95, 0, -9.4]} tam={0.55} rot={[0, -0.2, 0]} />
      <Caja pos={[2.0, 0.75, -8.65]} tam={0.45} rot={[0, 0.6, 0]} />
      {/* torre del fondo con tejado de pizarra, puerta y ventanas encendidas */}
      <group position={[0, 0, -27]}>
        <mesh position={[0, 5, 0]}>
          <cylinderGeometry args={[3.4, 3.7, 18, 40]} />
          <meshStandardMaterial map={torre} roughness={0.9} />
        </mesh>
        {Array.from({ length: 16 }, (_, i) => {
          const a = (i / 16) * Math.PI * 2;
          return <TCaja key={i} t={[0.8, 0.8, 0.6]} pos={[Math.sin(a) * 3.55, 14.4, Math.cos(a) * 3.55]} rot={[0, a, 0]} map={almena} color="#e8d8c0" />;
        })}
        <Pieza forma={{ f: "cono", r: 3.9, h: 5.2, seg: 32 }} color="#2a3566" pos={[0, 17.4, 0]} rugoso={0.6} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 2.2 }} color="#3a2a1a" pos={[0, 21, 0]} />
        <Pieza forma={{ f: "caja", t: [1.1, 0.6, 0.03] }} color="#a51e2a" pos={[0.55, 21.7, 0]} rot={[0, 0, Math.sin(f * 0.15) * 0.1]} doble />
        {/* puerta en arco */}
        <Pieza forma={{ f: "caja", t: [1.5, 2.3, 0.4] }} color="#1a0e06" pos={[0, 1.15, 3.42]} />
        <Pieza forma={{ f: "tubo", r: 0.75, h: 0.4, seg: 24 }} color="#1a0e06" pos={[0, 2.3, 3.42]} rot={[Math.PI / 2, 0, 0]} />
        <Pieza forma={{ f: "caja", t: [1.2, 2.0, 0.05] }} color="#ffb860" brillo="#ffa040" intensidad={1.6} pos={[0, 1.0, 3.6]} basica />
        <pointLight position={[0, 1.5, 4.6]} intensity={10} distance={10} color="#ffae5a" />
        {[[-1.6, 6.5, 0.45], [1.5, 9.5, -0.4], [0, 12, 0]].map(([x, y, a], i) => (
          <group key={i} position={[Math.sin(a) * 3.45, y, Math.cos(a) * 3.45]} rotation={[0, a, 0]}>
            <Pieza forma={{ f: "caja", t: [0.5, 0.85, 0.1] }} color="#ffc070" brillo="#ffa040" intensidad={1.4} basica />
            <Resplandor pos={[0, 0, 0.2]} r={0.7} color="#ffa040" o={0.12} />
          </group>
        ))}
      </group>
      {/* el mar abajo, con el reflejo de la luna */}
      <Mar y={-14} color="#16306a" brillo={0.5} />
      {/* el pueblo del puerto abajo a la izquierda: tejados y ventanas encendidas */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = -8 - R(s, "cx", i) * 22;
        const z = 8 - i * 2.6 - R(s, "cz", i) * 2;
        const h = 2 + R(s, "ch", i) * 3;
        const w = 2 + R(s, "cw", i) * 2;
        return (
          <group key={i} position={[x, -14 + h / 2, z]}>
            <Pieza forma={{ f: "caja", t: [w, h, 2.2] }} color={["#d8c4a0", "#c8a888", "#b8c0c8", "#d0b090"][i % 4]} />
            <Pieza forma={{ f: "cono", r: w * 0.78, h: 1.4, seg: 4 }} color={["#8a3a2a", "#6a3424", "#7a4a2a"][i % 3]} pos={[0, h / 2 + 0.7, 0]} rot={[0, Math.PI / 4, 0]} esc={[1, 1, 0.75]} />
            {R(s, "cv", i) > 0.35 && <Pieza forma={{ f: "caja", t: [0.4, 0.55, 0.05] }} color="#ffc070" basica pos={[w * 0.18, 0.2, 1.13]} />}
          </group>
        );
      })}
      {/* islas lejanas con un faro que barre la noche */}
      {[[-60, -230, 40, 16], [70, -260, 55, 22], [10, -300, 70, 14]].map(([x, z, r, h], i) => (
        <mesh key={i} position={[x, -14, z]} scale={[1, h / r, 0.6]}>
          <sphereGeometry args={[r, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={["#1c2c4a", "#16243e", "#202e52"][i]} roughness={1} />
        </mesh>
      ))}
      <group position={[70, 7, -255]}>
        <Pieza forma={{ f: "tubo", r: 1.2, r2: 0.9, h: 8 }} color="#e8e0d0" pos={[0, 0, 0]} />
        <Resplandor pos={[0, 4.5, 0]} r={2.2} color="#fff2b0" o={0.45} />
        <group rotation={[0, faro, 0]} position={[0, 4.5, 0]}>
          <Haz pos={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} largo={140} ancho={9} color="#fff4c0" o={0.05} />
        </group>
      </group>
    </group>
  );
};

// ================================================================ CAMAROTE (del capitán, en un galeón, de noche)
const Camarote: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texMadera(26, 48, 30, 8, [3, 3]);
  const pared = texMadera(24, 40, 26, 10, [2, 1]);
  const viga = texMadera(22, 45, 20, 3);
  const alfombra = texAlfombra("#7a1620", "#1d2a52", "#d9a63a");
  const mapa = texMapa();
  const W = 9, D = 9, H = 3.2;
  const mece = Math.sin(f * 0.06) * 0.12;
  // ventanales al fondo (z = -D/2): 4 huecos
  const huecos = [-2.7, -0.9, 0.9, 2.7];
  return (
    <group>
      <Ambiente niebla={["#140c08", 16, 60]} fondo="#08101e" />
      {/* fuera: noche, luna y mar */}
      <Cielo arriba="#081538" medio="#2a4a86" abajo="#10204a" radio={200} />
      <Estrellas s={s} n={300} />
      <Luna pos={[14, 16, -90]} r={5} />
      <Mar y={-2.5} color="#173a78" brillo={0.6} tam={600} />
      <hemisphereLight args={["#e6e0e8", "#1a140e", 0.45]} />
      <ambientLight intensity={0.08} color="#ffe0c0" />
      {/* luz de luna que entra por los ventanales */}
      <directionalLight position={[3, 5, -14]} intensity={1.4} color="#a8c0ff" />
      {huecos.map((x, i) => (
        <Haz key={i} pos={[x, 2.35, -D / 2 + 0.1]} rot={[-1.05, 0, 0]} largo={5.5} ancho={0.75} color="#a8c4ff" o={0.022} />
      ))}
      {/* suelo y alfombra */}
      <TPlano w={W} h={D} pos={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={4.2} h={3.0} pos={[0, 0.006, 0.4]} rot={[-Math.PI / 2, 0, 0]} map={alfombra} />
      {/* paredes laterales y delantera, techo y vigas */}
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, 0]} rot={[0, Math.PI / 2, 0]} map={pared} />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, 0]} rot={[0, -Math.PI / 2, 0]} map={pared} />
      <TPlano w={W} h={H} pos={[0, H / 2, D / 2]} rot={[0, Math.PI, 0]} map={pared} />
      <TPlano w={W} h={D} pos={[0, H, 0]} rot={[Math.PI / 2, 0, 0]} map={pared} color="#8a6a50" />
      {Array.from({ length: 8 }, (_, i) => (
        <TCaja key={i} t={[W, 0.22, 0.26]} pos={[0, H - 0.11, -D / 2 + 0.6 + i * 1.15]} map={viga} />
      ))}
      {[-W / 2 + 0.12, W / 2 - 0.12].map((x) =>
        [-3, 0, 3].map((z) => <TCaja key={`${x}${z}`} t={[0.24, H, 0.26]} pos={[x, H / 2, z]} map={viga} />),
      )}
      {/* zócalo */}
      {[-W / 2 + 0.05, W / 2 - 0.05].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.08, 0.9, D] }} color="#3a2010" pos={[x, 0.45, 0]} />
      ))}
      {/* pared del fondo con los ventanales de popa */}
      <group position={[0, 0, -D / 2]}>
        <TCaja t={[W, 0.95, 0.3]} pos={[0, 0.475, 0]} map={pared} />
        <TCaja t={[W, 0.75, 0.3]} pos={[0, H - 0.375, 0]} map={pared} />
        {[-4.05, -1.8, 0, 1.8, 4.05].map((x, i) => (
          <TCaja key={i} t={[i === 0 || i === 4 ? 0.9 : 0.25, H, 0.32]} pos={[x, H / 2, 0]} map={viga} />
        ))}
        {huecos.map((x) => (
          <group key={x} position={[x, 1.7, 0.02]}>
            {[-0.4, 0, 0.4].map((dx) => (
              <Pieza key={dx} forma={{ f: "caja", t: [0.05, 1.5, 0.06] }} color="#2a160a" pos={[dx, 0, 0]} />
            ))}
            {[-0.5, 0, 0.5].map((dy) => (
              <Pieza key={dy} forma={{ f: "caja", t: [1.5, 0.05, 0.06] }} color="#2a160a" pos={[0, dy, 0]} />
            ))}
            <Pieza forma={{ f: "caja", t: [1.6, 0.12, 0.35] }} color="#4a2a14" pos={[0, -0.8, 0.12]} />
          </group>
        ))}
      </group>
      {/* escritorio con mapa, brújula, velas, libro y reloj de arena */}
      <group position={[0, 0, -2.9]}>
        <TCaja t={[2.6, 0.1, 1.2]} pos={[0, 0.82, 0]} map={viga} color="#c89a70" />
        {[-1.15, 1.15].map((x) => (
          <TCaja key={x} t={[0.3, 0.78, 1.1]} pos={[x, 0.39, 0]} map={viga} />
        ))}
        <TPlano w={1.3} h={0.95} pos={[-0.15, 0.876, 0.05]} rot={[-Math.PI / 2, 0, 0.05]} map={mapa} />
        <Pieza forma={{ f: "tubo", r: 0.13, h: 0.05, seg: 24 }} color="#c99a3a" pos={[0.75, 0.9, 0.25]} metal={0.85} rugoso={0.3} />
        <Pieza forma={{ f: "caja", t: [0.02, 0.01, 0.2] }} color="#b02020" pos={[0.75, 0.93, 0.25]} rot={[0, 0.6, 0]} basica />
        {/* libro abierto */}
        <group position={[0.85, 0.88, -0.25]} rotation={[0, -0.4, 0]}>
          <Pieza forma={{ f: "caja", t: [0.28, 0.04, 0.38] }} color="#f0e2c0" pos={[-0.14, 0.02, 0]} rot={[0, 0, 0.08]} />
          <Pieza forma={{ f: "caja", t: [0.28, 0.04, 0.38] }} color="#f0e2c0" pos={[0.14, 0.02, 0]} rot={[0, 0, -0.08]} />
        </group>
        {/* reloj de arena */}
        <group position={[-1.0, 0.87, -0.3]}>
          <Pieza forma={{ f: "cono", r: 0.08, h: 0.13 }} color="#e8d090" pos={[0, 0.08, 0]} rot={[Math.PI, 0, 0]} opacidad={0.7} />
          <Pieza forma={{ f: "cono", r: 0.08, h: 0.13 }} color="#d8b060" pos={[0, 0.2, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.1, h: 0.02 }} color="#5a3216" pos={[0, 0.01, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.1, h: 0.02 }} color="#5a3216" pos={[0, 0.27, 0]} />
        </group>
        {/* velas */}
        {[[-0.85, 0.3], [-0.7, 0.42], [0.45, -0.38]].map(([x, z], i) => (
          <group key={i} position={[x, 0.87, z]}>
            <Pieza forma={{ f: "tubo", r: 0.035, h: 0.2 + i * 0.06 }} color="#f4ecd8" pos={[0, 0.1 + i * 0.03, 0]} />
            <Fuego pos={[0, 0.2 + i * 0.06, 0]} tam={0.35} luz={i === 0 ? 6 : 0} s={s + i * 3} />
          </group>
        ))}
        {/* sillón del capitán */}
        <group position={[0, 0, -0.95]}>
          <Pieza forma={{ f: "caja", t: [0.8, 0.12, 0.7] }} color="#6a1a1e" pos={[0, 0.5, 0]} rugoso={0.5} />
          <Pieza forma={{ f: "caja", t: [0.85, 1.2, 0.12] }} color="#4a2a14" pos={[0, 0.95, -0.32]} />
          <Pieza forma={{ f: "caja", t: [0.7, 0.9, 0.04] }} color="#7a1e24" pos={[0, 1.0, -0.25]} rugoso={0.5} />
        </group>
      </group>
      {/* bola del mundo */}
      <group position={[-3.2, 0, -2.6]}>
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.9 }} color="#4a2a14" pos={[0, 0.45, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.3, r2: 0.2, h: 0.08 }} color="#4a2a14" pos={[0, 0.04, 0]} />
        <Pieza forma={{ f: "bola", r: 0.42, seg: 32 }} color="#3f7fb0" pos={[0, 1.3, 0]} rugoso={0.4} />
        {[0, 1, 2].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.15 + i * 0.03, seg: 12 }} color="#d9b77a" pos={[Math.sin(i * 2.1) * 0.32, 1.3 + Math.cos(i * 1.7) * 0.2, Math.cos(i * 2.1) * 0.3]} esc={[1, 0.5, 0.25]} />
        ))}
        <Pieza forma={{ f: "aro", r: 0.48, g: 0.025 }} color="#c99a3a" pos={[0, 1.3, 0]} rot={[0, 0.5, 0.35]} metal={0.85} rugoso={0.3} />
      </group>
      {/* cofre del tesoro abierto, con monedas que brillan */}
      <group position={[3.0, 0, -0.6]} rotation={[0, -0.5, 0]}>
        <TCaja t={[1.0, 0.55, 0.6]} pos={[0, 0.28, 0]} map={viga} color="#b07a50" />
        {[-0.35, 0.35].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.07, 0.57, 0.62] }} color="#3a3a42" pos={[x, 0.28, 0]} metal={0.7} rugoso={0.4} />
        ))}
        <group position={[0, 0.55, -0.3]} rotation={[-1.9, 0, 0]}>
          <TCaja t={[1.0, 0.08, 0.6]} pos={[0, 0, 0.3]} map={viga} color="#b07a50" />
        </group>
        {Array.from({ length: 26 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.06, h: 0.015, seg: 12 }} color="#ffd24a" brillo="#ffb820" intensidad={0.5} metal={0.9} rugoso={0.25} pos={[(R(s, "mx", i) - 0.5) * 0.85, 0.56 + R(s, "my", i) * 0.08, (R(s, "mz", i) - 0.5) * 0.45]} rot={[R(s, "mr", i), 0, R(s, "mq", i)]} />
        ))}
        <Resplandor pos={[0, 0.65, 0]} r={0.6} color="#ffc84a" o={0.12} />
        <pointLight position={[0, 0.9, 0.3]} intensity={2.5} distance={3} color="#ffcc66" />
      </group>
      {/* estantería con libros en la pared izquierda */}
      <group position={[-W / 2 + 0.25, 0, 1.0]} rotation={[0, Math.PI / 2, 0]}>
        <TCaja t={[2.4, 2.2, 0.4]} pos={[0, 1.1, 0]} map={viga} color="#9a7050" />
        {[0.45, 1.05, 1.65].map((y) =>
          Array.from({ length: 14 }, (_, i) => (
            <Pieza key={`${y}${i}`} forma={{ f: "caja", t: [0.13, 0.42 + R(s, "lb", y, i) * 0.1, 0.28] }} color={["#7a1a1a", "#1a4a3a", "#2a2a5a", "#8a6a2a", "#4a2a1a"][(i + Math.round(y * 5)) % 5]} pos={[-1.05 + i * 0.155, y + 0.22, 0.08]} rot={[0, 0, R(s, "li", y, i) > 0.85 ? 0.25 : 0]} />
          )),
        )}
      </group>
      {/* timón decorativo y sables cruzados en la pared derecha */}
      <group position={[W / 2 - 0.08, 1.85, 1.6]} rotation={[0, -Math.PI / 2, 0]}>
        <Pieza forma={{ f: "aro", r: 0.55, g: 0.05 }} color="#6a3c1a" />
        <Pieza forma={{ f: "tubo", r: 0.12, h: 0.12, seg: 16 }} color="#c99a3a" rot={[Math.PI / 2, 0, 0]} metal={0.8} />
        {Array.from({ length: 8 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 1.5 }} color="#6a3c1a" rot={[0, 0, (i / 8) * Math.PI]} />
        ))}
      </group>
      <group position={[W / 2 - 0.08, 1.9, -1.4]} rotation={[0, -Math.PI / 2, 0]}>
        {[-0.6, 0.6].map((a) => (
          <group key={a} rotation={[0, 0, a]}>
            <Pieza forma={{ f: "caja", t: [0.06, 1.1, 0.02] }} color="#d8dce4" metal={0.9} rugoso={0.25} pos={[0, 0.15, 0]} />
            <Pieza forma={{ f: "caja", t: [0.25, 0.05, 0.05] }} color="#c99a3a" metal={0.85} pos={[0, -0.4, 0]} />
          </group>
        ))}
      </group>
      {/* barriles y cajas en las esquinas delanteras */}
      <Barril pos={[-3.7, 0, 3.4]} />
      <Barril pos={[-3.0, 0, 3.7]} />
      <Barril pos={[-3.5, 0.9, 3.55]} rot={[0, 0, 0]} />
      <Caja pos={[3.6, 0, 3.4]} tam={0.8} rot={[0, 0.25, 0]} />
      <Caja pos={[3.7, 0.8, 3.4]} tam={0.5} rot={[0, -0.3, 0]} />
      {/* farol que cuelga y se mece con el barco */}
      <group position={[0, H - 0.2, 0.2]} rotation={[mece, 0, mece * 0.4]}>
        <Pieza forma={{ f: "tubo", r: 0.012, h: 0.6 }} color="#2a2a2e" pos={[0, -0.3, 0]} />
        <group position={[0, -0.8, 0]}>
          <Pieza forma={{ f: "cono", r: 0.2, h: 0.16, seg: 8 }} color="#b8862e" pos={[0, 0.28, 0]} metal={0.8} rugoso={0.35} />
          <Pieza forma={{ f: "tubo", r: 0.14, h: 0.34, seg: 8 }} color="#ffd890" brillo="#ffb04a" intensidad={1.5} basica opacidad={0.95} />
          {[0, 1, 2, 3].map((i) => (
            <Pieza key={i} forma={{ f: "caja", t: [0.025, 0.36, 0.025] }} color="#b8862e" pos={[Math.sin((i * Math.PI) / 2) * 0.15, 0, Math.cos((i * Math.PI) / 2) * 0.15]} metal={0.8} />
          ))}
          <Pieza forma={{ f: "tubo", r: 0.17, h: 0.04, seg: 8 }} color="#b8862e" pos={[0, -0.19, 0]} metal={0.8} />
          <Resplandor pos={[0, 0, 0]} r={0.55} color="#ffb04a" o={0.22} />
          <Resplandor pos={[0, 0, 0]} r={1.4} color="#ff9a3a" o={0.06} />
          <pointLight intensity={6} distance={8} decay={1.6} color="#ffc490" />
        </group>
      </group>
    </group>
  );
};

/** Coral: mezcla de tubos y ramas en abanico (colores vivos). */
export const Coral: React.FC<{ pos: V3; color: string; s: number; tam?: number }> = ({ pos, color, s, tam = 1 }) => (
  <group position={pos} scale={tam}>
    {Array.from({ length: 6 }, (_, k) => {
      const a = R(s, "ca", k) * Math.PI * 2;
      const h = 0.25 + R(s, "ch", k) * 0.35;
      const inc = 0.25 + R(s, "ci", k) * 0.4;
      return (
        <group key={k} rotation={[Math.cos(a) * inc, 0, Math.sin(a) * inc]}>
          <Pieza forma={{ f: "tubo", r: 0.045, r2: 0.03, h }} color={color} pos={[0, h / 2, 0]} brillo={color} intensidad={0.15} />
          <Pieza forma={{ f: "bola", r: 0.05, seg: 8 }} color={color} pos={[0, h, 0]} brillo={color} intensidad={0.3} />
        </group>
      );
    })}
    <Pieza forma={{ f: "bola", r: 0.14, seg: 12 }} color={color} esc={[1, 0.5, 1]} />
  </group>
);

// ================================================================ TEMPLO (hundido bajo el mar)
const Templo: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const mosaico = texMosaico([1.5, 2.7]);
  const piedra = texPiedra(40, 20, 72, 6, 2, [2, 2]);
  const fuste = texPiedra(38, 18, 76, 1, 10, [1, 3]);
  const arena = texLosas(42, 30, 66, [12, 12]);
  const columnas: [number, number, number, number][] = [
    // x, z, alto, roto (inclinación)
    [-3.4, 3, 6.5, 0], [3.4, 3, 6.5, 0], [-3.4, -1, 6.5, 0], [3.4, -1, 3.2, 0.08],
    [-3.4, -5, 4.4, 0], [3.4, -5, 6.5, 0], [-3.4, -9, 6.5, 0], [3.4, -9, 6.5, 0],
  ];
  const corales = ["#ff6f61", "#ff9f43", "#c77dff", "#ef476f", "#06d6a0", "#ffd166"];
  return (
    <group>
      <Ambiente niebla={["#0f6a86", 10, 60]} fondo="#0a4a66" />
      <Cielo arriba="#7fe2f2" medio="#1e8fb0" abajo="#06324a" radio={160} />
      <hemisphereLight args={["#9ff0ff", "#0a3040", 0.7]} />
      <directionalLight position={[4, 20, 6]} intensity={1.6} color="#e8fff8" />
      <ambientLight intensity={0.15} color="#9fe8ff" />
      {/* rayos de luz desde la superficie */}
      {[-6, -2.5, 1, 4.5, 8].map((x, i) => (
        <Haz key={i} pos={[x + Math.sin(f * 0.02 + i) * 0.4, 22, -4 - i * 1.5]} rot={[0.12, 0, 0.18 - i * 0.05]} largo={30} ancho={1.4 + (i % 2) * 0.9} color="#d8fbff" o={0.05 + 0.02 * Math.sin(f * 0.05 + i * 2)} />
      ))}
      {/* fondo de arena y el mosaico del templo */}
      <TPlano w={120} h={120} pos={[0, -0.02, -20]} rot={[-Math.PI / 2, 0, 0]} map={arena} color="#d8e8e0" />
      <TPlano w={9.5} h={17} pos={[0, 0.01, -3]} rot={[-Math.PI / 2, 0, 0]} map={mosaico} />
      {/* escalinata y altar con el tridente */}
      {[0, 1, 2].map((i) => (
        <TCaja key={i} t={[8 - i * 1.5, 0.35, 1.4 - i * 0.2]} pos={[0, 0.175 + i * 0.35, -11.4 - i * 0.9]} map={piedra} />
      ))}
      <TCaja t={[4, 1.0, 2.4]} pos={[0, 1.55, -14.4]} map={piedra} />
      <group position={[0, 2.05, -14.2]}>
        <Pieza forma={{ f: "tubo", r: 0.09, h: 5 }} color="#f2c24a" pos={[0, 2.5, 0]} metal={0.9} rugoso={0.25} brillo="#a07010" intensidad={0.3} />
        <Pieza forma={{ f: "caja", t: [1.6, 0.14, 0.14] }} color="#f2c24a" pos={[0, 4.6, 0]} metal={0.9} rugoso={0.25} />
        {[-0.75, 0, 0.75].map((x) => (
          <group key={x} position={[x, 5.15, 0]}>
            <Pieza forma={{ f: "tubo", r: 0.07, h: 0.9 }} color="#f2c24a" metal={0.9} rugoso={0.25} />
            <Pieza forma={{ f: "cono", r: 0.14, h: 0.4, seg: 4 }} color="#ffd96a" pos={[0, 0.6, 0]} metal={0.9} rugoso={0.25} />
          </group>
        ))}
        <Pieza forma={{ f: "bola", r: 0.35, seg: 24 }} color="#9ffcff" brillo="#4ff0ff" intensidad={2} basica pos={[0, 4.6, 0.1]} />
        <Resplandor pos={[0, 4.6, 0.1]} r={1.1} color="#5ff4ff" o={0.25 + 0.08 * Math.sin(f * 0.12)} />
        <Resplandor pos={[0, 4.6, 0.1]} r={3} color="#3fe0ff" o={0.07} />
        <pointLight position={[0, 4.6, 1]} intensity={22} distance={14} color="#6ff2ff" />
      </group>
      {/* cabeza colosal de una estatua, medio enterrada y ladeada */}
      <group position={[-6.5, 0.4, -10]} rotation={[0.15, 0.6, 0.35]}>
        <Pieza forma={{ f: "bola", r: 2.2, seg: 32 }} color="#cfc6b0" esc={[1, 1.15, 1]} />
        <Pieza forma={{ f: "caja", t: [0.45, 1.1, 0.7] }} color="#c4bba4" pos={[0, 0.1, 2.1]} rot={[0.2, 0, 0]} />
        {[-0.75, 0.75].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.6, 0.12, 0.2] }} color="#8a826e" pos={[x, 0.75, 1.98]} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.9, 0.12, 0.2] }} color="#8a826e" pos={[0, -0.75, 1.95]} />
        <Pieza forma={{ f: "aro", r: 2.0, g: 0.18 }} color="#d9a63a" pos={[0, 1.6, 0]} rot={[Math.PI / 2, 0, 0]} metal={0.8} rugoso={0.4} />
        {Array.from({ length: 7 }, (_, i) => (
          <Pieza key={i} forma={{ f: "cono", r: 0.22, h: 0.8, seg: 4 }} color="#e0b04a" metal={0.8} rugoso={0.4} pos={[Math.sin(-1.2 + i * 0.4) * 2.0, 2.0, Math.cos(-1.2 + i * 0.4) * 2.0]} />
        ))}
        {/* coral que le crece encima */}
        {[0, 1, 2].map((i) => (
          <Coral key={i} pos={[-1.0 + i * 0.9, 2.1 - i * 0.2, -0.4]} color={corales[i]} s={s + 40 + i} tam={1.2} />
        ))}
      </group>
      {/* columnas acanaladas (algunas rotas), con capitel, basa y coral */}
      {columnas.map(([x, z, h, inc], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, 0, inc]}>
          <Pieza forma={{ f: "caja", t: [1.15, 0.35, 1.15] }} color="#d6ccb4" pos={[0, 0.175, 0]} />
          <mesh position={[0, 0.35 + h / 2, 0]}>
            <cylinderGeometry args={[0.42, 0.48, h, 20]} />
            <meshStandardMaterial map={fuste} roughness={0.9} />
          </mesh>
          {h > 6 ? (
            <>
              <Pieza forma={{ f: "tubo", r: 0.55, r2: 0.45, h: 0.3, seg: 20 }} color="#d6ccb4" pos={[0, 0.5 + h, 0]} />
              <Pieza forma={{ f: "caja", t: [1.3, 0.3, 1.3] }} color="#d6ccb4" pos={[0, 0.8 + h, 0]} />
            </>
          ) : (
            <Pieza forma={{ f: "roca", r: 0.48, s: i }} color="#cfc6b0" pos={[0, 0.35 + h, 0]} esc={[1, 0.35, 1]} />
          )}
          <Coral pos={[Math.sin(i) * 0.6, 0.35, Math.cos(i) * 0.6]} color={corales[i % corales.length]} s={s + i} />
          <Coral pos={[Math.sin(i + 2.5) * 0.6, 0.35, Math.cos(i + 2.5) * 0.6]} color={corales[(i + 2) % corales.length]} s={s + i + 20} tam={0.7} />
        </group>
      ))}
      {/* dinteles sobre las columnas enteras */}
      <TCaja t={[1.3, 0.6, 4.6]} pos={[-3.4, 7.75, 1]} map={piedra} />
      <TCaja t={[1.3, 0.6, 4.6]} pos={[3.4, 7.75, -7]} map={piedra} />
      {/* columna caída y bloques sueltos */}
      <mesh position={[4.6, 0.45, 1.2]} rotation={[0.1, 0.4, Math.PI / 2]}>
        <cylinderGeometry args={[0.42, 0.46, 3.4, 20]} />
        <meshStandardMaterial map={fuste} roughness={0.9} />
      </mesh>
      {[[-1.9, -7.4, 0.3], [2.4, 4.6, -0.5], [-5.4, 4.8, 0.9]].map(([x, z, r], i) => (
        <TCaja key={i} t={[0.9, 0.55, 0.7]} pos={[x, 0.27, z]} rot={[0, r, 0.1]} map={piedra} />
      ))}
      {/* ánforas y monedas por el suelo */}
      {[[-2.3, 2.2, 0.4], [2.6, -3.2, -0.3], [-2.5, -8.2, 1.2], [1.9, 5.2, 0.8]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={i % 2 ? [0, r, 1.3] : [0, r, 0]}>
          <Pieza forma={{ f: "bola", r: 0.28, seg: 16 }} color="#c0603a" pos={[0, 0.32, 0]} esc={[1, 1.25, 1]} />
          <Pieza forma={{ f: "tubo", r: 0.09, r2: 0.12, h: 0.32 }} color="#b0502e" pos={[0, 0.78, 0]} />
          <Pieza forma={{ f: "aro", r: 0.1, g: 0.03 }} color="#b0502e" pos={[0.14, 0.72, 0]} />
          <Pieza forma={{ f: "aro", r: 0.1, g: 0.03 }} color="#b0502e" pos={[-0.14, 0.72, 0]} />
        </group>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.07, h: 0.015, seg: 12 }} color="#ffd24a" brillo="#ffb020" intensidad={0.4} metal={0.9} rugoso={0.25} pos={[(R(s, "tx", i) - 0.5) * 3.2, 0.72 + R(s, "ty", i) * 0.12, -12.9 + (R(s, "tz", i) - 0.5) * 1.0]} rot={[R(s, "tr", i), 0, R(s, "tq", i)]} />
      ))}
      {/* ruinas lejanas entre la niebla */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = (i % 2 ? 1 : -1) * (10 + R(s, "rx", i) * 14);
        const z = -14 - R(s, "rz", i) * 30;
        const h = 3 + R(s, "rh", i) * 7;
        return <Pieza key={i} forma={{ f: "tubo", r: 0.55, h, seg: 14 }} color="#b8c8c0" pos={[x, h / 2, z]} rot={[0, 0, (R(s, "ri", i) - 0.5) * 0.3]} />;
      })}
      {[-16, 14].map((x, i) => (
        <Pieza key={i} forma={{ f: "roca", r: 7, s: i + 3 }} color="#4a7a80" pos={[x, 1, -22 - i * 6]} esc={[1, 1.4, 1]} />
      ))}
      {/* algas y anémonas */}
      {Array.from({ length: 26 }, (_, i) => {
        const x = (R(s, "ax", i) - 0.5) * 22;
        const z = 4 - R(s, "az", i) * 24;
        if (Math.abs(x) < 2.6 && z > -11) return null;
        const h = 1 + R(s, "ah", i) * 2.4;
        const m = Math.sin(f * 0.05 + i) * 0.15;
        return (
          <group key={i} position={[x, 0, z]} rotation={[m, 0, m * 0.6]}>
            <Pieza forma={{ f: "tubo", r: 0.04, r2: 0.015, h }} color={i % 3 ? "#3aa86a" : "#7ab83a"} pos={[0, h / 2, 0]} />
            <Pieza forma={{ f: "tubo", r: 0.035, r2: 0.012, h: h * 0.8 }} color="#2f9a5a" pos={[0.12, h * 0.4, 0.05]} rot={[0, 0, -0.15]} />
          </group>
        );
      })}
      {/* medusas que brillan */}
      {[[-4.5, 5, -6], [5.5, 6.5, -10], [1.5, 7.5, -16], [-2, 4.2, 2]].map(([x, y, z], i) => {
        const b = Math.sin(f * 0.12 + i * 2);
        return (
          <group key={i} position={[x, y + Math.sin(f * 0.03 + i) * 0.3, z]}>
            <Pieza forma={{ f: "bola", r: 0.32, seg: 16 }} color="#ffb0f0" brillo="#ff70e0" intensidad={1.2} basica opacidad={0.8} esc={[1 + b * 0.08, 0.7 - b * 0.06, 1 + b * 0.08]} />
            {[0, 1, 2, 3].map((k) => (
              <Pieza key={k} forma={{ f: "tubo", r: 0.012, h: 0.7 }} color="#ffc8f4" basica pos={[Math.sin(k * 1.6) * 0.15, -0.4, Math.cos(k * 1.6) * 0.15]} rot={[Math.sin(f * 0.1 + k) * 0.2, 0, 0]} />
            ))}
            <Resplandor pos={[0, 0, 0]} r={0.9} color="#ff80e8" o={0.1} />
          </group>
        );
      })}
      {/* peces de colores que dan vueltas */}
      {Array.from({ length: 30 }, (_, i) => {
        const a = f * 0.012 + (i / 30) * Math.PI * 2;
        const r = 7 + (i % 5) * 0.8;
        const y = 3.5 + (i % 7) * 0.45;
        return (
          <group key={i} position={[Math.cos(a) * r, y, -5 + Math.sin(a) * r * 0.6]} rotation={[0, -a - Math.PI / 2, 0]}>
            <Pieza forma={{ f: "bola", r: 0.14, seg: 10 }} color={i % 3 ? "#ffd166" : "#4cc9f0"} esc={[1.6, 0.8, 0.45]} brillo={i % 3 ? "#ffb020" : "#20a0ff"} intensidad={0.25} />
            <Pieza forma={{ f: "cono", r: 0.09, h: 0.16, seg: 4 }} color={i % 3 ? "#ff9f43" : "#2a8ad0"} pos={[-0.25, 0, 0]} rot={[0, 0, Math.PI / 2]} esc={[1, 1, 0.3]} />
          </group>
        );
      })}
    </group>
  );
};

export const ESCENARIOS_NUEVOS = { fortaleza: Fortaleza, camarote: Camarote, templo: Templo };
