// Modelos 3D del vídeo 3 (Proyecto Habakkuk, 1942-43): el portaaviones de hielo, el U-boat alemán, los
// mercantes del convoy, aviones (bimotor del Habakkuk y el Liberator de largo alcance), el Titanic para comparar,
// los bloques de hielo y de pykrete, la bala, el torpedo, el vaso de whisky, el plano secreto, el prototipo del
// lago Patricia y la grieta que se frena en las fibras. Miden 1 de largo (o de ancho) y miran hacia +x.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { texturaLetrero } from "./modelos-azorian";
import { Pieza } from "./piezas3d";

const R = (s: number, ...k: (string | number)[]) => azar(s, "hk", ...k);
const M = { metal: 0.55, rugoso: 0.5 };
const k01 = (t: number, d: number) => (t < 0 ? 0 : Math.min(1, t / d));

/** Hielo: color frío, algo brillante, con caras planas (se ve tallado). */
export const HIELO = { color: "#cfe6f2", rugoso: 0.22, metal: 0.08, facetas: true } as const;

/** Textura de escarcha/pykrete: manchas y vetas (para que el hielo no sea plástico). */
function texturaEscarcha(base: string, veta: string, n = 900, s = 1) {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const x = c.getContext("2d")!;
  x.fillStyle = base;
  x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < n; i++) {
    x.globalAlpha = 0.08 + R(s, "ea", i) * 0.25;
    x.fillStyle = i % 3 ? veta : "#ffffff";
    const w = 2 + R(s, "ew", i) * 14;
    x.save();
    x.translate(R(s, "ex", i) * 512, R(s, "ey", i) * 512);
    x.rotate(R(s, "er", i) * Math.PI);
    x.fillRect(-w / 2, -1, w, 2 + R(s, "eh", i) * 2);
    x.restore();
  }
  x.globalAlpha = 1;
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

// ---------------------------------------------------------------- AVIÓN
/** Avión de la 2ª Guerra Mundial. motores 2 = bimotor (los del Habakkuk), 4 = Liberator de largo alcance
 *  (doble deriva). Largo (envergadura) 1. Hélices girando. */
export const Avion3D: React.FC<{ motores?: 2 | 4; color?: string; fase?: number }> = ({ motores = 4, color = "#5c6458", fase = 0 }) => {
  const f = useCurrentFrame();
  const largo = motores === 4 ? 0.64 : 0.7;
  const pos = motores === 4 ? [-0.32, -0.15, 0.15, 0.32] : [-0.18, 0.18];
  return (
    <group rotation={[0, -Math.PI / 2, 0]}>
      {/* fuselaje (mira a +z antes de girar = +x después) */}
      <Pieza forma={{ f: "tubo", r: 0.042, r2: 0.03, h: largo, seg: 14 }} color={color} rot={[Math.PI / 2, 0, 0]} {...M} />
      <Pieza forma={{ f: "bola", r: 0.042, seg: 14 }} esc={[1, 1, 1.6]} color={color} pos={[0, 0, largo / 2]} {...M} />
      <Pieza forma={{ f: "bola", r: 0.03, seg: 10 }} esc={[1, 0.7, 1.4]} color="#9fb8cc" pos={[0, 0.03, largo / 2 - 0.02]} metal={0.6} rugoso={0.15} />
      {/* ala */}
      <Pieza forma={{ f: "caja", t: [1, 0.012, 0.11] }} color={color} pos={[0, motores === 4 ? 0.03 : 0, 0.06]} {...M} />
      {/* cola */}
      <Pieza forma={{ f: "caja", t: [0.32, 0.01, 0.07] }} color={color} pos={[0, 0.01, -largo / 2 + 0.03]} {...M} />
      {(motores === 4 ? [-0.16, 0.16] : [0]).map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.01, 0.1, 0.07] }} color={color} pos={[x, 0.055, -largo / 2 + 0.03]} {...M} />
      ))}
      {/* motores y hélices */}
      {pos.map((x, i) => (
        <group key={x} position={[x, motores === 4 ? 0.025 : -0.005, 0.12]}>
          <Pieza forma={{ f: "tubo", r: 0.024, r2: 0.02, h: 0.1 }} color="#3c423c" rot={[Math.PI / 2, 0, 0]} {...M} />
          <group position={[0, 0, 0.055]} rotation={[0, 0, f * 1.3 + i + fase]}>
            <Pieza forma={{ f: "caja", t: [0.13, 0.012, 0.004] }} color="#1a1a1a" />
            <Pieza forma={{ f: "caja", t: [0.012, 0.13, 0.004] }} color="#1a1a1a" />
          </group>
          <mesh position={[0, 0, 0.058]}>
            <circleGeometry args={[0.068, 20]} />
            <meshBasicMaterial color="#d0d4d8" transparent opacity={0.05} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* escarapelas */}
      {[-0.35, 0.35].map((x) => (
        <group key={x} position={[x, 0.008 + (motores === 4 ? 0.03 : 0), 0.06]} rotation={[-Math.PI / 2, 0, 0]}>
          <Pieza forma={{ f: "disco", r: 0.028 }} color="#1d2f6a" />
          <Pieza forma={{ f: "disco", r: 0.016 }} color="#f2f2ee" pos={[0, 0, 0.001]} />
          <Pieza forma={{ f: "disco", r: 0.008 }} color="#b8202a" pos={[0, 0, 0.002]} />
        </group>
      ))}
      {/* luces de navegación */}
      <Pieza forma={{ f: "bola", r: 0.008, seg: 6 }} color="#ff3020" basica pos={[-0.5, 0.01, 0.06]} />
      <Pieza forma={{ f: "bola", r: 0.008, seg: 6 }} color="#30ff60" basica pos={[0.5, 0.01, 0.06]} />
    </group>
  );
};

// ---------------------------------------------------------------- HABAKKUK
/** El portaaviones de hielo (diseño Habakkuk II: 2.000 pies de largo, 300 de ancho, 150 aviones). Casco de
 *  bloques de pykrete con escarcha, pista con marcas, isla a estribor, motores en góndolas a los lados y
 *  aviones en cubierta. `aviones` = cuántos se ven. `derrite` 0..1 = cuánto se ha derretido (redondea y hunde). */
export const Habakkuk3D: React.FC<{ aviones?: number; derrite?: number; noche?: boolean }> = ({ aviones = 18, derrite = 0, noche }) => {
  const f = useCurrentFrame();
  const tex = useMemo(() => {
    const t = texturaEscarcha("#d8ecf4", "#8fb4c8", 1400, 3);
    t.repeat.set(6, 1);
    return t;
  }, []);
  const pista = useMemo(() => texturaLetrero("", "#b8d2de", "#b8d2de", 64, 64), []);
  const ancho = 0.15;
  const alto = 0.045 * (1 - derrite * 0.55);
  const hielo = (
    { color: "#d6ebf5", rugoso: 0.3 + derrite * 0.4, metal: 0.05 } as const
  );
  const bloques = 14;
  return (
    <group position={[0, -derrite * 0.02, 0]}>
      {/* casco: bloques de pykrete (cada uno algo distinto) */}
      {Array.from({ length: bloques }, (_, i) => {
        const x = -0.5 + (i + 0.5) / bloques;
        const h = alto * (1 - derrite * R(4, "dh", i) * 0.5);
        return (
          <group key={i} position={[x, h / 2 - 0.012, 0]}>
            <mesh>
              <boxGeometry args={[1 / bloques - 0.002, h, ancho]} />
              <meshStandardMaterial map={tex} color={hielo.color} roughness={hielo.rugoso} metalness={hielo.metal} emissive={noche ? "#2a6a90" : "#1a3040"} emissiveIntensity={noche ? 0.55 : 0.35} />
            </mesh>
          </group>
        );
      })}
      {/* juntas entre bloques (verticales) y estratos (horizontales) en los dos costados */}
      {[-1, 1].map((l) => (
        <group key={`j${l}`}>
          {Array.from({ length: bloques - 1 }, (_, i) => (
            <Pieza key={i} forma={{ f: "caja", t: [0.0025, alto, 0.001] }} color="#5a8aa8" basica pos={[-0.5 + (i + 1) / bloques, alto / 2 - 0.012, l * (ancho / 2 + 0.0006)]} />
          ))}
          {[0.33, 0.66].map((k) => (
            <Pieza key={k} forma={{ f: "caja", t: [1, 0.0018, 0.001] }} color="#7aa6c0" basica pos={[0, alto * k - 0.012, l * (ancho / 2 + 0.0006)]} />
          ))}
          {/* espuma en la línea de flotación */}
          <Pieza forma={{ f: "caja", t: [1.02, 0.003, 0.012] }} color="#f2fbff" basica opacidad={0.6} pos={[0, 0.0005, l * (ancho / 2 + 0.004)]} />
        </group>
      ))}
      {/* proa y popa redondeadas */}
      {[0.5, -0.5].map((x, i) => (
        <mesh key={x} position={[x, alto / 2 - 0.012, 0]} scale={[i ? 0.4 : 0.8, 1, 1]}>
          <cylinderGeometry args={[ancho / 2, ancho / 2, alto, 24, 1, false, i ? Math.PI : 0, Math.PI]} />
          <meshStandardMaterial map={tex} color={hielo.color} roughness={hielo.rugoso} metalness={hielo.metal} emissive={noche ? "#244a66" : "#1a3040"} emissiveIntensity={0.35} />
        </mesh>
      ))}
      {/* cubierta / pista */}
      <mesh position={[0, alto - 0.0115, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.02, ancho * 0.96]} />
        <meshStandardMaterial map={pista} color="#c4dae6" roughness={0.5} emissive="#20384a" emissiveIntensity={0.25} />
      </mesh>
      {Array.from({ length: 22 }, (_, i) => (
        <Pieza key={`m${i}`} forma={{ f: "caja", t: [0.018, 0.0005, 0.002] }} color={noche ? "#ffe2a0" : "#f6f8fa"} basica={noche} pos={[-0.47 + i * 0.044, alto - 0.011, -0.02]} />
      ))}
      {/* luces de pista */}
      {noche &&
        Array.from({ length: 16 }, (_, i) => (
          <Pieza key={`l${i}`} forma={{ f: "bola", r: 0.0022, seg: 6 }} color={i % 2 ? "#ffd27a" : "#9fefff"} basica pos={[-0.46 + i * 0.062, alto - 0.009, i % 2 ? 0.05 : -0.07]} />
        ))}
      {/* isla a estribor: torre de mando de pykrete con puente y mástil */}
      <group position={[0.08, alto - 0.012, 0.058]}>
        <Pieza forma={{ f: "caja", t: [0.12, 0.05, 0.022] }} color="#c8dee8" pos={[0, 0.025, 0]} rugoso={0.35} />
        <Pieza forma={{ f: "caja", t: [0.07, 0.022, 0.026] }} color="#b8ccd8" pos={[0.01, 0.06, 0]} rugoso={0.35} />
        {Array.from({ length: 6 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.008, 0.005, 0.002] }} color={noche ? "#ffd690" : "#22303c"} basica={noche} pos={[-0.015 + i * 0.011, 0.063, -0.0135]} />
        ))}
        <Pieza forma={{ f: "tubo", r: 0.0016, h: 0.06 }} color="#3a4046" pos={[0.01, 0.1, 0]} />
        <Pieza forma={{ f: "caja", t: [0.026, 0.002, 0.002] }} color="#3a4046" pos={[0.01, 0.115, 0]} rot={[0, f * 0.05, 0]} />
        <Pieza forma={{ f: "caja", t: [0.016, 0.01, 0.0008] }} color="#c42a2a" pos={[0.002, 0.128, 0]} rot={[0, Math.sin(f * 0.08) * 0.3, 0]} />
        {noche && <pointLight position={[0, 0.08, -0.04]} intensity={0.6} distance={0.5} color="#ffe2b0" />}
      </group>
      {/* góndolas de los motores eléctricos a los lados (fuera del casco, por el calor) */}
      {[-1, 1].map((l) =>
        Array.from({ length: 6 }, (_, i) => (
          <Pieza key={`g${l}${i}`} forma={{ f: "tubo", r: 0.006, h: 0.03 }} color="#4a5058" pos={[-0.38 + i * 0.15, 0.001, l * (ancho / 2 + 0.006)]} rot={[0, 0, Math.PI / 2]} {...M} />
        )),
      )}
      {/* aviones aparcados en cubierta, en filas */}
      {Array.from({ length: aviones }, (_, i) => {
        const fila = i % 3;
        const col = Math.floor(i / 3);
        return (
          <group key={`a${i}`} position={[-0.42 + col * 0.06, alto - 0.006, -0.045 + fila * 0.028]} scale={0.032} rotation={[0, Math.PI * 0.82, 0]}>
            <Avion3D motores={2} color="#56604e" fase={i} />
          </group>
        );
      })}
      {/* crestas de hielo por los bordes de la cubierta y la proa cubierta de témpanos: parece un iceberg */}
      {Array.from({ length: 36 }, (_, i) => {
        const l = i % 2 ? 1 : -1;
        const x = -0.48 + Math.floor(i / 2) * 0.055 + R(7, "rx", i) * 0.02;
        const r = 0.006 + R(7, "rr", i) * 0.008;
        return <Pieza key={`r${i}`} forma={{ f: "roca", r, s: i }} esc={[1.6, 0.8, 1]} color="#e8f6fd" pos={[x, alto - 0.012 + r * 0.3, l * (ancho / 2 - 0.004)]} rugoso={0.2} brillo="#3a7aa0" intensidad={noche ? 0.5 : 0.2} />;
      })}
      {Array.from({ length: 9 }, (_, i) => (
        <Pieza key={`p${i}`} forma={{ f: "roca", r: 0.02 + R(8, "pr", i) * 0.02, s: i + 40 }} esc={[1.4, 0.9, 1]} color="#dff2fb" pos={[0.47 + R(8, "px", i) * 0.06, alto * 0.5 + R(8, "py", i) * alto * 0.6 - 0.01, (R(8, "pz", i) - 0.5) * ancho * 0.9]} rugoso={0.2} brillo="#3a7aa0" intensidad={noche ? 0.5 : 0.2} />
      ))}
      {/* focos de la isla barriendo el cielo (de noche) */}
      {noche &&
        [0, 1].map((i) => (
          <group key={`f${i}`} position={[0.08 + i * 0.03, alto + 0.05, 0.058]} rotation={[0, f * 0.012 + i * 2.2, 0.35]}>
            <mesh position={[0, 0.6, 0]}>
              <cylinderGeometry args={[0.07, 0.004, 1.2, 16, 1, true]} />
              <meshBasicMaterial color="#e8f6ff" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
            </mesh>
          </group>
        ))}
      {/* carámbanos colgando del borde de la cubierta */}
      {Array.from({ length: 40 }, (_, i) => (
        <Pieza key={`c${i}`} forma={{ f: "cono", r: 0.0016 + R(5, "cr", i) * 0.0015, h: 0.006 + R(5, "ch", i) * 0.01, seg: 5 }} color="#e8f6ff" pos={[-0.49 + i * 0.025, alto - 0.016 - 0.004, (i % 2 ? 1 : -1) * (ancho / 2 + 0.0005)]} rot={[Math.PI, 0, 0]} rugoso={0.15} />
      ))}
      {/* derretido: goteras y charco alrededor */}
      {derrite > 0.05 && (
        <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.55, 0.55 + derrite * 0.3, 48]} />
          <meshBasicMaterial color="#cfe8f8" transparent opacity={0.12 * derrite} depthWrite={false} />
        </mesh>
      )}
      {/* brillo frío alrededor del casco (se ve en la noche) */}
      <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.25, ancho * 2.4]} />
        <meshBasicMaterial color={noche ? "#7fd8ff" : "#d8f2ff"} transparent opacity={noche ? 0.1 : 0.06} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- U-BOAT
/** U-boat tipo VII: casco gris, torreta con la «Wintergarten», cañón de cubierta. Largo 1. */
export const Uboot3D: React.FC = () => {
  const f = useCurrentFrame();
  const gris = "#5a6066";
  return (
    <group>
      <Pieza forma={{ f: "tubo", r: 0.045, h: 0.72, seg: 20 }} color={gris} pos={[0, 0, 0]} rot={[0, 0, Math.PI / 2]} rugoso={0.6} metal={0.4} />
      <Pieza forma={{ f: "cono", r: 0.045, h: 0.2, seg: 20 }} color={gris} pos={[0.46, 0, 0]} rot={[0, 0, -Math.PI / 2]} rugoso={0.6} metal={0.4} />
      <Pieza forma={{ f: "cono", r: 0.045, h: 0.16, seg: 20 }} color={gris} pos={[-0.44, 0, 0]} rot={[0, 0, Math.PI / 2]} rugoso={0.6} metal={0.4} />
      {/* cubierta exterior plana y la línea de flotación */}
      <Pieza forma={{ f: "caja", t: [0.86, 0.008, 0.05] }} color="#4a4e52" pos={[0, 0.042, 0]} rugoso={0.8} />
      {/* torreta */}
      <Pieza forma={{ f: "caja", t: [0.12, 0.07, 0.045] }} color={gris} pos={[0.02, 0.08, 0]} rugoso={0.6} metal={0.4} />
      <Pieza forma={{ f: "bola", r: 0.03, seg: 12 }} esc={[1.4, 1, 0.75]} color={gris} pos={[0.08, 0.08, 0]} rugoso={0.6} metal={0.4} />
      <Pieza forma={{ f: "caja", t: [0.05, 0.012, 0.042] }} color="#4a4e52" pos={[-0.06, 0.07, 0]} />
      <Pieza forma={{ f: "tubo", r: 0.003, h: 0.08 }} color="#2a2c2e" pos={[0.04, 0.15, 0]} />
      <Pieza forma={{ f: "tubo", r: 0.002, h: 0.06 }} color="#2a2c2e" pos={[0.01, 0.14, 0]} />
      {/* número pintado en la torreta */}
      <Pieza forma={{ f: "caja", t: [0.03, 0.02, 0.0005] }} color="#d8d8d0" pos={[0.02, 0.085, 0.0228]} />
      {/* cañón de cubierta */}
      <group position={[0.2, 0.05, 0]}>
        <Pieza forma={{ f: "tubo", r: 0.006, h: 0.02 }} color="#3a3e42" pos={[0, 0.01, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.0035, h: 0.08 }} color="#3a3e42" pos={[0.035, 0.022, 0]} rot={[0, 0, Math.PI / 2 - 0.15]} metal={0.6} />
      </group>
      {/* estela de espuma */}
      <mesh position={[-0.55, 0.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.4, 0.06 + 0.01 * Math.sin(f * 0.3)]} />
        <meshBasicMaterial color="#dfe8f0" transparent opacity={0.25} depthWrite={false} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- MERCANTE
/** Mercante del convoy (tipo Liberty): casco negro, puente blanco en medio, mástiles con plumas, chimenea.
 *  `hunde` = fotogramas desde el torpedo (-1 = a flote): fuego, se inclina y se va al fondo. Largo 1. */
export const Carguero3D: React.FC<{ hunde: number; luces?: boolean }> = ({ hunde, luces }) => {
  const f = useCurrentFrame();
  const k = k01(hunde, 150);
  const fuego = hunde >= 0;
  const casco = "#2a2c30";
  return (
    <group position={[0, -k * 0.16, 0]} rotation={[k * 0.12, 0, k * 0.28]}>
      <Pieza forma={{ f: "caja", t: [0.84, 0.08, 0.13] }} color={casco} pos={[-0.03, 0.025, 0]} rugoso={0.7} metal={0.3} />
      <Pieza forma={{ f: "caja", t: [0.84, 0.018, 0.131] }} color="#6a2a22" pos={[-0.03, -0.008, 0]} />
      <Pieza forma={{ f: "cono", r: 0.066, h: 0.13, seg: 4 }} color={casco} pos={[0.45, 0.025, 0]} rot={[0, Math.PI / 4, -Math.PI / 2]} esc={[1, 1, 0.7]} rugoso={0.7} />
      <Pieza forma={{ f: "caja", t: [0.84, 0.004, 0.125] }} color="#5a4a3a" pos={[-0.03, 0.067, 0]} />
      {/* puente */}
      <Pieza forma={{ f: "caja", t: [0.12, 0.07, 0.11] }} color="#c8c4b8" pos={[-0.02, 0.1, 0]} rugoso={0.6} />
      <Pieza forma={{ f: "caja", t: [0.07, 0.03, 0.12] }} color="#c8c4b8" pos={[-0.01, 0.15, 0]} rugoso={0.6} />
      <Pieza forma={{ f: "tubo", r: 0.018, h: 0.08 }} color="#2a2a2a" pos={[-0.08, 0.17, 0]} />
      {Array.from({ length: 4 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.012, 0.008, 0.002] }} color={luces ? "#ffcf80" : "#20262c"} basica={luces} pos={[-0.04 + i * 0.02, 0.155, 0.061]} />
      ))}
      {/* mástiles, plumas y escotillas con carga */}
      {[0.26, -0.28].map((x) => (
        <group key={x} position={[x, 0.067, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.004, h: 0.2 }} color="#3a3530" pos={[0, 0.1, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.0025, h: 0.13 }} color="#3a3530" pos={[0.05, 0.07, 0]} rot={[0, 0, -0.9]} />
          <Pieza forma={{ f: "caja", t: [0.12, 0.02, 0.08] }} color="#4a4038" pos={[0.04, 0.01, 0]} />
        </group>
      ))}
      {luces && (
        <group>
          <pointLight position={[0, 0.3, 0.25]} intensity={1.6} distance={1.4} color="#ffe2b0" />
          {[0.3, -0.3, 0.42, -0.4].map((x) => (
            <Pieza key={x} forma={{ f: "bola", r: 0.006, seg: 6 }} color="#ffd690" basica pos={[x, 0.09, 0.066]} />
          ))}
        </group>
      )}
      {fuego && (
        <group position={[0.1, 0.07, 0]}>
          {Array.from({ length: 5 }, (_, i) => {
            const a = 0.6 + 0.4 * Math.sin(f * 0.5 + i * 2);
            return <Pieza key={i} forma={{ f: "cono", r: 0.022 + i * 0.004, h: 0.07 * a + 0.03, seg: 7 }} color={i % 2 ? "#ffb040" : "#ff5a1a"} basica opacidad={0.75} pos={[(i - 2) * 0.03, 0.03 * a, 0]} />;
          })}
          {Array.from({ length: 7 }, (_, i) => {
            const t = ((f * 0.01 + i / 7) % 1);
            return <Pieza key={`h${i}`} forma={{ f: "bola", r: 0.03 + t * 0.07, seg: 8 }} color="#1a1816" opacidad={0.5 * (1 - t)} pos={[-t * 0.15, 0.06 + t * 0.5, 0]} />;
          })}
          <pointLight position={[0, 0.1, 0.1]} intensity={2.5 + Math.sin(f * 0.7)} distance={1.6} color="#ff8a30" />
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- TITANIC (silueta para comparar)
/** RMS Titanic (882 pies). Largo 1: casco negro, obra muerta blanca, cuatro chimeneas color ante. */
export const Titanic3D: React.FC<{ fantasma?: boolean }> = ({ fantasma }) => {
  const o = fantasma ? 0.85 : 1;
  return (
    <group>
      <Pieza forma={{ f: "caja", t: [0.9, 0.07, 0.1] }} color="#16171a" pos={[0, 0.02, 0]} opacidad={o} rugoso={0.6} />
      <Pieza forma={{ f: "cono", r: 0.05, h: 0.12, seg: 4 }} color="#16171a" pos={[0.5, 0.02, 0]} rot={[0, Math.PI / 4, -Math.PI / 2]} esc={[1, 1, 0.75]} opacidad={o} />
      <Pieza forma={{ f: "bola", r: 0.05, seg: 14 }} esc={[0.9, 0.7, 1]} color="#16171a" pos={[-0.45, 0.02, 0]} opacidad={o} />
      <Pieza forma={{ f: "caja", t: [0.66, 0.035, 0.09] }} color="#ecebe4" pos={[-0.03, 0.072, 0]} opacidad={o} />
      <Pieza forma={{ f: "caja", t: [0.5, 0.02, 0.08] }} color="#ecebe4" pos={[-0.04, 0.1, 0]} opacidad={o} />
      {[0.17, 0.06, -0.05, -0.16].map((x) => (
        <group key={x} position={[x, 0.15, 0]} rotation={[0, 0, 0.12]}>
          <Pieza forma={{ f: "tubo", r: 0.02, h: 0.08 }} esc={[1, 1, 0.8]} color="#c8913a" opacidad={o} />
          <Pieza forma={{ f: "tubo", r: 0.021, h: 0.018 }} esc={[1, 1, 0.8]} color="#121212" pos={[0, 0.038, 0]} opacidad={o} />
        </group>
      ))}
      {[0.36, -0.32].map((x) => (
        <Pieza key={x} forma={{ f: "tubo", r: 0.0025, h: 0.24 }} color="#2a2a2a" pos={[x, 0.17, 0]} opacidad={o} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- BLOQUES
/** Bloque de 1 de ancho. clase "hielo" (transparente, azulado; `golpe` = se hace añicos) o "pykrete"
 *  (opaco, color pulpa de madera; `golpe` = solo saltan esquirlas y tiembla). */
export const Bloque3D: React.FC<{ clase: "hielo" | "pykrete"; golpe: number }> = ({ clase, golpe }) => {
  const tex = useMemo(() => (clase === "hielo" ? texturaEscarcha("#d8eef8", "#9fc8dc", 300, 1) : texturaEscarcha("#cdbb9c", "#7a5c3a", 2400, 2)), [clase]);
  const k = k01(golpe, 26);
  if (clase === "hielo" && golpe >= 0) {
    // añicos: trozos que salen volando y caen
    return (
      <group>
        {Array.from({ length: 22 }, (_, i) => {
          const dx = (R(1, "tx", i) - 0.5) * 2.2;
          const dz = (R(1, "tz", i) - 0.5) * 2.2;
          const vy = 0.8 + R(1, "ty", i) * 1.4;
          const y = 0.5 + vy * k - 2.6 * k * k;
          return <Pieza key={i} forma={{ f: "roca", r: 0.08 + R(1, "tr", i) * 0.14, s: i }} color="#d6eef8" pos={[dx * k, Math.max(0.05, y), dz * k]} rot={[k * 6 + i, k * 4, i]} rugoso={0.15} opacidad={0.85} />;
        })}
      </group>
    );
  }
  const tiembla = clase === "pykrete" && golpe >= 0 && golpe < 14 ? Math.sin(golpe * 2.5) * 0.02 * (1 - golpe / 14) : 0;
  return (
    <group position={[tiembla, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        {clase === "hielo" ? (
          <meshStandardMaterial map={tex} color="#e0f2fb" roughness={0.12} metalness={0.1} transparent opacity={0.8} emissive="#3a7090" emissiveIntensity={0.25} />
        ) : (
          <meshStandardMaterial map={tex} color="#d8c8a8" roughness={0.7} emissive="#2a2016" emissiveIntensity={0.2} />
        )}
      </mesh>
      {/* aristas brillantes */}
      <lineSegments position={[0, 0.5, 0]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1, 1, 1)]} />
        <lineBasicMaterial color={clase === "hielo" ? "#ffffff" : "#f0e2c8"} transparent opacity={0.5} />
      </lineSegments>
      {/* esquirlas de pykrete y la marca del impacto */}
      {clase === "pykrete" && golpe >= 0 && (
        <group>
          <Pieza forma={{ f: "disco", r: 0.07 }} color="#5a4430" pos={[0, 0.55, 0.501]} />
          {golpe < 30 &&
            Array.from({ length: 8 }, (_, i) => (
              <Pieza key={i} forma={{ f: "caja", t: [0.03, 0.03, 0.03] }} color="#cdbb9c" pos={[Math.cos(i) * k * 0.4, 0.55 + Math.sin(i * 2) * k * 0.3, 0.5 + k * 0.5]} />
            ))}
        </group>
      )}
    </group>
  );
};

/** Bala con trazadora (brilla). Largo 1. */
export const Bala3D: React.FC = () => (
  <group>
    <Pieza forma={{ f: "tubo", r: 0.12, h: 0.6, seg: 12 }} color="#c9a24a" rot={[0, 0, Math.PI / 2]} metal={0.9} rugoso={0.25} />
    <Pieza forma={{ f: "cono", r: 0.12, h: 0.35, seg: 12 }} color="#b07a3a" pos={[0.47, 0, 0]} rot={[0, 0, -Math.PI / 2]} metal={0.9} rugoso={0.25} />
    <mesh position={[-1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.05, 0.11, 2.6, 10, 1, true]} />
      <meshBasicMaterial color="#ffd27a" transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
    <pointLight position={[0, 0, 0.3]} intensity={0.8} distance={3} color="#ffd27a" />
  </group>
);

/** Torpedo con hélice y estela de burbujas. Largo 1. */
export const Torpedo3D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      <Pieza forma={{ f: "tubo", r: 0.05, h: 0.8, seg: 16 }} color="#7a8088" rot={[0, 0, Math.PI / 2]} metal={0.7} rugoso={0.35} />
      <Pieza forma={{ f: "bola", r: 0.05, seg: 16 }} esc={[2, 1, 1]} color="#5a3a2a" pos={[0.4, 0, 0]} metal={0.6} />
      <Pieza forma={{ f: "cono", r: 0.05, h: 0.12, seg: 16 }} color="#7a8088" pos={[-0.46, 0, 0]} rot={[0, 0, Math.PI / 2]} metal={0.7} />
      <group position={[-0.53, 0, 0]} rotation={[f * 0.8, 0, 0]}>
        <Pieza forma={{ f: "caja", t: [0.01, 0.12, 0.02] }} color="#c9a24a" metal={0.8} />
        <Pieza forma={{ f: "caja", t: [0.01, 0.02, 0.12] }} color="#c9a24a" metal={0.8} />
      </group>
      {Array.from({ length: 10 }, (_, i) => {
        const t = (f * 0.04 + i / 10) % 1;
        return <Pieza key={i} forma={{ f: "bola", r: 0.02 + t * 0.03, seg: 8 }} color="#e8f6ff" opacidad={0.5 * (1 - t)} pos={[-0.6 - t * 0.8, Math.sin(i * 3) * 0.04 + t * 0.06, Math.cos(i * 2) * 0.04]} />;
      })}
    </group>
  );
};

/** Vaso de whisky con un cubito que es… el portaaviones. Ancho 1. */
export const Vaso3D: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      {/* whisky */}
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.44, 0.42, 0.55, 32]} />
        <meshStandardMaterial color="#b8641c" roughness={0.1} metalness={0.1} transparent opacity={0.85} emissive="#5a2a08" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.58, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.44, 32]} />
        <meshStandardMaterial color="#d8862e" roughness={0.05} metalness={0.2} emissive="#6a3a10" emissiveIntensity={0.4} />
      </mesh>
      {/* el cristal tallado */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.47, 1, 12, 1, true]} />
        <meshStandardMaterial color="#e8f4ff" roughness={0.05} metalness={0.3} transparent opacity={0.22} side={THREE.DoubleSide} flatShading />
      </mesh>
      <Pieza forma={{ f: "tubo", r: 0.47, h: 0.06, seg: 12 }} color="#dceaf4" pos={[0, 0.03, 0]} rugoso={0.05} opacidad={0.5} facetas />
      {/* el portaaviones flotando como cubito */}
      <group position={[0.02, 0.6, 0]} rotation={[0.08 * Math.sin(f * 0.05), 0.5, 0.06]} scale={0.6}>
        <Habakkuk3D aviones={6} />
      </group>
      <pointLight position={[0.3, 1.2, 0.6]} intensity={1.4} distance={3} color="#ffd8a0" />
    </group>
  );
};

/** Plano secreto (planta y perfil del barco de hielo) sobre la mesa. Ancho 1, tumbado. */
export const Plano3D: React.FC = () => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 700;
    const x = c.getContext("2d")!;
    x.fillStyle = "#1d4a86";
    x.fillRect(0, 0, 1024, 700);
    x.strokeStyle = "rgba(255,255,255,0.18)";
    x.lineWidth = 1;
    for (let i = 0; i < 1024; i += 32) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, 700);
      x.stroke();
    }
    for (let i = 0; i < 700; i += 32) {
      x.beginPath();
      x.moveTo(0, i);
      x.lineTo(1024, i);
      x.stroke();
    }
    x.strokeStyle = "#f2f6ff";
    x.lineWidth = 4;
    // planta
    x.beginPath();
    x.moveTo(90, 200);
    x.lineTo(880, 200);
    x.quadraticCurveTo(960, 260, 880, 320);
    x.lineTo(90, 320);
    x.quadraticCurveTo(50, 260, 90, 200);
    x.stroke();
    x.strokeRect(560, 300, 110, 14);
    for (let i = 0; i < 18; i++) x.strokeRect(120 + i * 40, 240, 26, 8);
    // perfil
    x.beginPath();
    x.moveTo(90, 450);
    x.lineTo(900, 450);
    x.lineTo(870, 540);
    x.lineTo(110, 540);
    x.closePath();
    x.stroke();
    x.strokeRect(560, 410, 110, 40);
    x.setLineDash([10, 8]);
    x.beginPath();
    x.moveTo(60, 500);
    x.lineTo(960, 500);
    x.stroke();
    x.setLineDash([]);
    // cotas
    x.lineWidth = 2;
    x.beginPath();
    x.moveTo(90, 160);
    x.lineTo(900, 160);
    x.stroke();
    x.fillStyle = "#f2f6ff";
    x.font = "bold 34px sans-serif";
    x.textAlign = "center";
    x.fillText("2,000 FT", 495, 150);
    x.font = "bold 44px sans-serif";
    x.fillText("HABAKKUK II", 512, 80);
    x.font = "bold 26px sans-serif";
    x.fillStyle = "#ff8a6b";
    x.fillText("MOST SECRET", 880, 640);
    x.fillStyle = "#f2f6ff";
    x.textAlign = "left";
    x.fillText("MATERIAL: PYKRETE", 60, 640);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  return (
    <group rotation={[0, -0.12, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 0]}>
        <planeGeometry args={[1, 0.68]} />
        <meshStandardMaterial map={tex} roughness={0.85} emissive="#0a1830" emissiveIntensity={0.3} />
      </mesh>
      {/* pisapapeles: un tintero y una regla */}
      <Pieza forma={{ f: "tubo", r: 0.04, h: 0.06 }} color="#1a1a1e" pos={[0.42, 0.03, -0.28]} rugoso={0.2} />
      <Pieza forma={{ f: "caja", t: [0.5, 0.008, 0.04] }} color="#c8a868" pos={[-0.2, 0.008, 0.3]} rot={[0, 0.15, 0]} />
    </group>
  );
};

/** Prototipo del lago Patricia (1943): casco de bloques de pykrete con un cobertizo de madera encima
 *  (aislante), tubos de la máquina de frío y el motorcito de 1 CV. Largo 1. */
export const Prototipo3D: React.FC = () => {
  const f = useCurrentFrame();
  const tex = useMemo(() => texturaEscarcha("#d2c4a8", "#86684a", 1500, 6), []);
  return (
    <group>
      {/* casco de pykrete (asoma algo del agua) */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[1, 0.18, 0.5]} />
        <meshStandardMaterial map={tex} color="#e0d4bc" roughness={0.6} />
      </mesh>
      {/* cobertizo de madera con tejado a dos aguas */}
      <Pieza forma={{ f: "caja", t: [0.96, 0.22, 0.46] }} color="#7a5a3a" pos={[0, 0.26, 0]} rugoso={0.95} />
      {Array.from({ length: 16 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.004, 0.22, 0.465] }} color="#5a3e26" pos={[-0.47 + i * 0.063, 0.26, 0]} />
      ))}
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "caja", t: [1, 0.012, 0.3] }} color="#4a4038" pos={[0, 0.43, l * 0.12]} rot={[l * 0.55, 0, 0]} rugoso={0.9} />
      ))}
      {/* tubos de refrigeración */}
      {[-0.3, 0, 0.3].map((x) => (
        <Pieza key={x} forma={{ f: "tubo", r: 0.012, h: 0.3 }} color="#8a9098" pos={[x, 0.2, 0.245]} metal={0.7} rugoso={0.4} />
      ))}
      <Pieza forma={{ f: "tubo", r: 0.01, h: 0.8 }} color="#8a9098" pos={[0, 0.33, 0.245]} rot={[0, 0, Math.PI / 2]} metal={0.7} />
      {/* el motorcito de 1 caballo, con su humito */}
      <group position={[0.4, 0.37, 0.15]}>
        <Pieza forma={{ f: "caja", t: [0.08, 0.06, 0.06] }} color="#3a4a3a" metal={0.4} />
        <Pieza forma={{ f: "tubo", r: 0.008, h: 0.08 }} color="#2a2a2a" pos={[0.02, 0.06, 0]} />
        {Array.from({ length: 4 }, (_, i) => {
          const t = (f * 0.015 + i / 4) % 1;
          return <Pieza key={i} forma={{ f: "bola", r: 0.012 + t * 0.03, seg: 8 }} color="#d8d8d8" opacidad={0.35 * (1 - t)} pos={[0.02 + t * 0.05, 0.1 + t * 0.2, 0]} />;
        })}
      </group>
      {/* pasarela de tablas hasta la orilla */}
      <Pieza forma={{ f: "caja", t: [0.1, 0.012, 0.6] }} color="#6a4e32" pos={[-0.3, 0.12, 0.55]} />
    </group>
  );
};

/** Grieta que avanza por el hielo y se frena en las fibras. `corre` = fotogramas desde que empieza. Ancho 1. */
export const Grieta3D: React.FC<{ corre: number }> = ({ corre }) => {
  const k = corre < 0 ? 0 : Math.min(1, corre / 22) * 0.55; // se para al 55 %: las fibras la frenan
  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i <= 30; i++) p.push(new THREE.Vector3(-0.5 + i / 30, (R(9, "gy", i) - 0.5) * 0.12, (R(9, "gz", i) - 0.5) * 0.05));
    return p;
  }, []);
  const n = Math.max(2, Math.round(k * 30) + 1);
  const linea = useMemo(() => new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts.slice(0, n)), new THREE.LineBasicMaterial({ color: "#ffffff" })), [pts, n]);
  const punta = pts[n - 1];
  return (
    <group>
      <primitive object={linea} />
      {/* ramitas de la grieta */}
      {pts.slice(1, n).map((q, i) =>
        i % 4 === 1 ? (
          <Pieza key={i} forma={{ f: "caja", t: [0.06, 0.004, 0.004] }} color="#f4fbff" basica pos={[q.x + 0.02, q.y + 0.02, q.z]} rot={[0, 0, (R(9, "gr", i) - 0.5) * 2]} />
        ) : null,
      )}
      {corre >= 0 && (
        <group position={[punta.x, punta.y, punta.z]}>
          <Pieza forma={{ f: "bola", r: 0.025, seg: 10 }} color="#ffffff" basica />
          <mesh>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshBasicMaterial color="#9fe8ff" transparent opacity={0.3} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};
