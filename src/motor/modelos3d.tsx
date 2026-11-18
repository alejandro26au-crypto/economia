// Personajes que son modelos 3D (vehículos): se colocan en el escenario igual que los 2D (x, z, alto, tam, mira,
// acciones de moverse), pero se pintan DENTRO del 3D, con su luz y su niebla.
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { DatosEscenario } from "./escenarios-datos";
import { EstadoActor, mundo } from "./estado";
import { Pieza } from "./piezas3d";
import { Avion3D, Bala3D, Bloque3D, Carguero3D, Grieta3D, Habakkuk3D, Plano3D, Prototipo3D, Titanic3D, Torpedo3D, Uboot3D, Vaso3D } from "./modelos-habakkuk";
import { OlaGigante, Satelite3D } from "./modelos-olas";
import { Cheque3D, Holland3D, Lastre3D, Virginia3D } from "./modelos-holland";
import { Actor } from "./tipos";
import { ATUENDOS_3D, Persona3D } from "../bent/bent3d";
import { poseCompleta } from "../bent/animaciones";
import { ANIM, EXPRESION, abreBoca } from "./actor";
import { BuqueSovietico3D, Garra3D, Glomar3D, K1293D, Lata3D, Nodulo3D } from "./modelos-azorian";

/** Submarino de los años 40 (largo = tam). Mira hacia +x (o -x con mira -1). */
const Submarino3D: React.FC<{ color: string; foco: boolean }> = ({ color, foco }) => {
  const f = useCurrentFrame();
  const m = { metal: 0.5, rugoso: 0.45 };
  return (
    <group>
      {/* casco: cápsula alargada (escala 1 = 1 m de largo) */}
      <group rotation={[0, 0, Math.PI / 2]}>
        <Pieza forma={{ f: "tubo", r: 0.075, h: 0.72, seg: 24 }} color={color} {...m} />
        <Pieza forma={{ f: "bola", r: 0.075, seg: 20 }} color={color} pos={[0, 0.36, 0]} {...m} />
        <Pieza forma={{ f: "cono", r: 0.075, h: 0.22, seg: 24 }} color={color} pos={[0, -0.47, 0]} rot={[Math.PI, 0, 0]} {...m} />
      </group>
      {/* torreta y periscopio */}
      <Pieza forma={{ f: "caja", t: [0.16, 0.09, 0.06] }} color={color} pos={[0.06, 0.1, 0]} {...m} />
      <Pieza forma={{ f: "tubo", r: 0.006, h: 0.09 }} color="#2a2e33" pos={[0.1, 0.18, 0]} metal={0.7} />
      <Pieza forma={{ f: "caja", t: [0.5, 0.008, 0.05] }} color="#2a2e33" pos={[0, 0.07, 0]} metal={0.6} />
      {/* timones y hélice */}
      <Pieza forma={{ f: "caja", t: [0.06, 0.004, 0.2] }} color="#2a2e33" pos={[-0.5, 0, 0]} />
      <Pieza forma={{ f: "caja", t: [0.06, 0.14, 0.004] }} color="#2a2e33" pos={[-0.5, 0, 0]} />
      <group position={[-0.59, 0, 0]} rotation={[f * 0.6, 0, 0]}>
        <Pieza forma={{ f: "caja", t: [0.01, 0.1, 0.02] }} color="#8a7a4a" metal={0.8} />
        <Pieza forma={{ f: "caja", t: [0.01, 0.02, 0.1] }} color="#8a7a4a" metal={0.8} />
      </group>
      {foco && (
        <group position={[0.46, 0, 0]}>
          <Pieza forma={{ f: "bola", r: 0.012, seg: 8 }} color="#fff4c8" basica />
          <pointLight position={[0.4, 0, 0]} intensity={30} distance={14} color="#fff1c8" />
          <mesh position={[0.9, -0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
            <coneGeometry args={[0.3, 1.8, 24, 1, true]} />
            <meshBasicMaterial color="#fff1c8" transparent opacity={0.07} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      )}
      {/* ojos de buey iluminados */}
      {[-0.15, 0, 0.15].map((x) => (
        <Pieza key={x} forma={{ f: "bola", r: 0.008, seg: 6 }} color="#ffcf7a" basica pos={[x, 0.025, 0.07]} />
      ))}
    </group>
  );
};

/** Gamba pistola (Alpheus) con aspecto real: caparazón, abdomen segmentado, abanico de cola, UNA pinza enorme
 *  que se cierra de golpe y la burbuja de cavitación que se forma y revienta con un destello (`chasca`).
 *  Mide 1 de largo (escala = tam) y mira hacia +x. */
const Gamba3D: React.FC<{ chasca: number }> = ({ chasca }) => {
  const f = useCurrentFrame();
  const cuerpo = "#b8452c";
  const claro = "#e08a5c";
  const oscuro = "#6e2416";
  const m = { rugoso: 0.32, metal: 0.05 };
  const cerrada = chasca >= 0 && chasca < 14;
  const dedo = cerrada ? 0.02 : 0.55;
  const b = chasca >= 0 && chasca < 16 ? chasca : -1; // burbuja: crece 0-7, revienta 7-9, onda después
  const rB = b < 0 ? 0 : b < 7 ? 0.03 + b * 0.012 : b < 9 ? 0.11 * (1 - (b - 7) / 2) : 0;
  const onda = b >= 8 ? (b - 8) / 8 : -1;
  const flash = b >= 7 && b < 11 ? 1 - Math.abs(b - 8.5) / 2 : 0;
  const patas = Math.sin(f * 0.5) * 0.08;
  return (
    <group position={[0, 0.13, 0]}>
      {/* caparazón */}
      <Pieza forma={{ f: "bola", r: 1, seg: 28 }} esc={[0.26, 0.11, 0.1]} color={cuerpo} pos={[0.12, 0.02, 0]} {...m} />
      <Pieza forma={{ f: "bola", r: 1, seg: 20 }} esc={[0.1, 0.06, 0.06]} color={claro} pos={[0.33, 0.04, 0]} {...m} />
      {/* ojos bajo el capuchón */}
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "bola", r: 0.018, seg: 10 }} color="#0b0b0e" pos={[0.38, 0.06, l * 0.035]} rugoso={0.1} />
      ))}
      {/* abdomen segmentado que se curva hacia abajo */}
      {[0, 1, 2, 3, 4].map((i) => (
        <Pieza key={i} forma={{ f: "bola", r: 1, seg: 24 }} esc={[0.1, 0.1 - i * 0.011, 0.088 - i * 0.008]} color={i % 2 ? cuerpo : "#a9402a"} pos={[-0.1 - i * 0.082, 0.02 - i * i * 0.007, 0]} rot={[0, 0, 0.12 * i]} {...m} />
      ))}
      {/* abanico de la cola */}
      {[-0.5, 0, 0.5].map((a, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 1, seg: 14 }} esc={[0.08, 0.012, 0.04]} color={i === 1 ? oscuro : cuerpo} pos={[-0.52, -0.1, a * 0.06]} rot={[0, a, -0.5]} {...m} />
      ))}
      {/* antenas */}
      {[-1, 1].map((l) => (
        <group key={l} position={[0.38, 0.06, l * 0.03]} rotation={[l * 0.25, l * 0.15, 0.35 + Math.sin(f * 0.07 + l) * 0.05]}>
          <Pieza forma={{ f: "tubo", r: 0.004, h: 0.75, seg: 5 }} color={oscuro} pos={[0.37, 0, 0]} rot={[0, 0, Math.PI / 2]} />
        </group>
      ))}
      {/* patas */}
      {[0.18, 0.1, 0.02, -0.06].map((x, i) =>
        [-1, 1].map((l) => (
          <group key={`${i}${l}`} position={[x, -0.06, l * 0.06]} rotation={[l * (0.6 + (i % 2 ? patas : -patas)), 0, 0.15]}>
            <Pieza forma={{ f: "tubo", r: 0.006, h: 0.16, seg: 5 }} color={claro} pos={[0, -0.07, 0]} />
          </group>
        )),
      )}
      {/* pinza pequeña */}
      <group position={[0.34, -0.02, -0.07]} rotation={[0, 0.3, -0.2]}>
        <Pieza forma={{ f: "tubo", r: 0.012, h: 0.18, seg: 6 }} color={cuerpo} pos={[0.08, 0, 0]} rot={[0, 0, Math.PI / 2]} {...m} />
        <Pieza forma={{ f: "bola", r: 1, seg: 12 }} esc={[0.05, 0.02, 0.02]} color={claro} pos={[0.2, 0, 0]} {...m} />
      </group>
      {/* LA PINZA GIGANTE (casi la mitad del cuerpo) */}
      <group position={[0.34, -0.01, 0.08]} rotation={[0, -0.25, 0.08]}>
        <Pieza forma={{ f: "tubo", r: 0.025, h: 0.16, seg: 8 }} color={cuerpo} pos={[0.06, 0, 0]} rot={[0, 0, Math.PI / 2]} {...m} />
        <Pieza forma={{ f: "bola", r: 1, seg: 24 }} esc={[0.2, 0.085, 0.07]} color={cuerpo} pos={[0.3, 0.01, 0]} {...m} />
        <Pieza forma={{ f: "bola", r: 1, seg: 16 }} esc={[0.08, 0.035, 0.03]} color={claro} pos={[0.48, -0.02, 0]} {...m} />
        {/* dedo móvil: gira desde su bisagra */}
        <group position={[0.42, 0.06, 0]} rotation={[0, 0, dedo]}>
          <Pieza forma={{ f: "bola", r: 1, seg: 16 }} esc={[0.11, 0.03, 0.035]} color={oscuro} pos={[0.09, -0.01, 0]} rot={[0, 0, -0.15]} {...m} />
        </group>
        {/* burbuja de cavitación y destello */}
        {rB > 0 && (
          <mesh position={[0.62, 0.0, 0]}>
            <sphereGeometry args={[rB, 20, 14]} />
            <meshStandardMaterial color="#e8fbff" transparent opacity={0.45} roughness={0} metalness={0.2} emissive="#9fe8ff" emissiveIntensity={0.4} />
          </mesh>
        )}
        {flash > 0 && (
          <group position={[0.62, 0, 0]}>
            <pointLight intensity={60 * flash} distance={4} color="#fff2c4" />
            <mesh>
              <sphereGeometry args={[0.035 + flash * 0.03, 12, 10]} />
              <meshBasicMaterial color="#fffbe8" transparent opacity={flash} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        )}
        {onda >= 0 && (
          <mesh position={[0.62, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <ringGeometry args={[0.05 + onda * 0.9, 0.07 + onda * 0.95, 40]} />
            <meshBasicMaterial color="#dff6ff" transparent opacity={(1 - onda) * 0.6} side={THREE.DoubleSide} depthWrite={false} />
          </mesh>
        )}
      </group>
    </group>
  );
};

/** Pulpo de venas (Amphioctopus marginatus) con aspecto real: manto moteado, ocho brazos que ondulan y dos mitades
 *  de coco que lleva consigo como casa portátil. Si `anda`, camina "de puntillas" sobre dos brazos (como el real).
 *  Mide ~1 de alto (escala = tam). Mira hacia +x. */
const Pulpo3D: React.FC<{ anda: boolean }> = ({ anda }) => {
  const f = useCurrentFrame();
  const piel = "#c4774f";
  const oscuro = "#7a3a22";
  const claro = "#f0c09a";
  const m = { rugoso: 0.38, metal: 0.05 };
  const paso = Math.sin(f * 0.25);
  /** Brazo: cadena de 12 segmentos que se estrechan y se curvan; la cara de abajo más clara (ventosas). */
  const brazo = (k: number, ang: number, baja: number, curva: number, largo = 0.075) => {
    let nodo: React.ReactNode = null;
    const n = 12;
    for (let i = n - 1; i >= 0; i--) {
      const r = 0.06 * (1 - i / (n + 1)) + 0.008;
      const onda = Math.sin(f * 0.12 + k * 0.9 + i * 0.5) * 0.12;
      nodo = (
        <group position={[0, -largo, 0]} rotation={[0, 0, (i === 0 ? 0 : curva) + onda]}>
          <Pieza forma={{ f: "bola", r, seg: 10 }} color={piel} {...m} />
          <Pieza forma={{ f: "tubo", r: r * 0.92, r2: r, h: largo }} color={piel} pos={[0, largo / 2, 0]} {...m} />
          <Pieza forma={{ f: "bola", r: r * 0.45, seg: 6 }} color={claro} pos={[r * 0.75, largo * 0.5, 0]} {...m} />
          {nodo}
        </group>
      );
    }
    return (
      <group key={k} rotation={[0, ang, 0]}>
        <group rotation={[0, 0, baja]}>{nodo}</group>
      </group>
    );
  };
  return (
    <group position={[0, anda ? 0.42 + Math.abs(paso) * 0.04 : 0.3, 0]}>
      {/* manto: bolsa redondeada, inclinada hacia atrás, con manchas y venas oscuras */}
      <group position={[-0.1, 0.36, 0]} rotation={[0, 0, 0.55]}>
        <Pieza forma={{ f: "bola", r: 0.19, seg: 32 }} esc={[1, 1.35, 1]} color={piel} {...m} />
        {[
          [0.1, 0.1, 0.13, 0.04],
          [-0.08, 0.02, 0.16, 0.035],
          [0.02, -0.1, 0.17, 0.03],
          [0.11, -0.03, -0.14, 0.04],
          [-0.05, 0.16, -0.12, 0.035],
          [0.0, 0.2, 0.08, 0.03],
        ].map((q, i) => (
          <Pieza key={i} forma={{ f: "bola", r: q[3], seg: 10 }} esc={[1.4, 0.5, 0.35]} color={oscuro} pos={[q[0], q[1], q[2]]} {...m} />
        ))}
      </group>
      {/* cabeza con ojos saltones a los lados y pupila horizontal */}
      <Pieza forma={{ f: "bola", r: 0.13, seg: 24 }} esc={[1.1, 0.85, 1.15]} color={piel} pos={[0.06, 0.17, 0]} {...m} />
      {[-1, 1].map((l) => (
        <group key={l} position={[0.1, 0.24, l * 0.1]}>
          <Pieza forma={{ f: "bola", r: 0.05, seg: 14 }} color={claro} {...m} />
          <Pieza forma={{ f: "bola", r: 0.032, seg: 12 }} esc={[0.6, 1, 1]} color="#e9d8a6" pos={[0.03, 0.005, l * 0.015]} rugoso={0.15} />
          <Pieza forma={{ f: "caja", t: [0.01, 0.012, 0.045] }} color="#0b0b0e" pos={[0.05, 0.005, l * 0.015]} rugoso={0.1} />
        </group>
      ))}
      {/* brazos: dos traseros para andar de puntillas, el resto abrazando los cocos */}
      <group position={[0.04, 0.1, 0]}>
        {anda ? (
          <group>
            {brazo(0, Math.PI * 0.85, 0.12 + paso * 0.3, 0.015, 0.045)}
            {brazo(1, -Math.PI * 0.85, 0.12 - paso * 0.3, -0.015, 0.045)}
            {[2, 3, 4, 5, 6, 7].map((k) => brazo(k, (k / 8) * Math.PI * 2, 0.95, -0.2, 0.04))}
          </group>
        ) : (
          <group>{[0, 1, 2, 3, 4, 5, 6, 7].map((k) => brazo(k, (k / 8) * Math.PI * 2 + 0.2, 1.0 + (k % 2) * 0.15, -0.14, 0.05))}</group>
        )}
      </group>
      {/* las dos mitades de coco (casa portátil), apiladas bajo el cuerpo: cáscara oscura y carne blanca */}
      <group position={[0.05, -0.04, 0]} rotation={[0, 0, anda ? 0.12 : 0.04]}>
        <mesh rotation={[Math.PI, 0, 0]}>
          <sphereGeometry args={[0.2, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#3f2a1a" roughness={1} side={THREE.DoubleSide} />
        </mesh>
        <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.045, 0]}>
          <sphereGeometry args={[0.185, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#f2ead8" roughness={0.7} side={THREE.BackSide} />
        </mesh>
        <mesh rotation={[Math.PI, 0, 0]} position={[0, 0.045, 0]}>
          <sphereGeometry args={[0.19, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a3220" roughness={1} side={THREE.FrontSide} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.045, 0]}>
          <ringGeometry args={[0.165, 0.19, 32]} />
          <meshStandardMaterial color="#f2ead8" roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      </group>
    </group>
  );
};

/** El Holland lee su profundidad: al bajar (respecto a su alto inicial, hasta extra.prof metros) llena los tanques
 *  y, con extra.cabecea, baja de proa con las aletas. chasca = sopla los tanques con aire (burbujas) y, con
 *  cabecea, el motor se para y sube de proa. */
const HollandActor: React.FC<{ actor: Actor; e: EstadoActor }> = ({ actor, e }) => {
  const alto0 = actor.alto ?? 0;
  const prof = typeof actor.extra?.prof === "number" ? actor.extra.prof : 1;
  const prog = Math.max(0, Math.min(1, (alto0 - e.alto) / prof));
  const sopla = e.chasca >= 0;
  const cabecea = actor.extra?.cabecea === true;
  const llena = sopla ? Math.max(0, 1 - e.chasca / 40) : Math.min(1, prog * 2.5);
  const cabeceo = cabecea ? (sopla ? 0.28 : -0.24) * Math.sin(Math.PI * prog) : 0;
  const rumbo = typeof actor.extra?.rumbo === "number" ? (actor.extra.rumbo * Math.PI) / 180 : 0;
  return <group rotation={[0, rumbo, 0]}><Holland3D ram={actor.extra?.ram === true} corte={actor.extra?.corte === true} llena={llena} cabeceo={cabeceo} helice={!(cabecea && sopla)} burbujas={sopla && e.chasca < 80 ? 1 - e.chasca / 80 : 0} /></group>;
};

export const Modelo3D: React.FC<{ actor: Actor; e: EstadoActor; esc: DatosEscenario; color: string; f?: number }> = ({ actor, e, esc, color, f = 0 }) => {
  if (!e.visible || e.opacidad <= 0.01) return null;
  const p = mundo(esc, e);
  if (ATUENDOS_3D[actor.tipo]) {
    let anim = ANIM[e.pose];
    let ant = ANIM[e.poseAnt];
    let t = e.tPose;
    if (anim === "quieto" && e.habla) {
      anim = "habla";
      ant = "quieto";
      t = 30;
    }
    const pose = poseCompleta({ anim, animAnt: ant, t, expresion: EXPRESION[e.cara], abre: e.habla ? abreBoca(f, 3) : 0, semilla: (actor.nombre?.length ?? 3) % 7, f });
    const anda = anim === "camina" || anim === "corre";
    // extra.rumbo (grados) fuerza hacia dónde mira el cuerpo: 0 = a cámara, 180 = de espaldas
    const rumbo = typeof actor.extra?.rumbo === "number" ? (actor.extra.rumbo * Math.PI) / 180 : e.mira * (anda ? Math.PI / 2 : 0.4);
    return (
      <group position={[p[0], p[1], p[2]]} scale={(e.anchoM / 0.73) * e.pop}>
        <Persona3D p={pose} f={f + (actor.nombre?.length ?? 0) * 13} rumbo={rumbo} anim={anim} t={t} at={ATUENDOS_3D[actor.tipo]} />
      </group>
    );
  }
  const t = e.anchoM * e.pop;
  return (
    <group position={[p[0], p[1] + (actor.tipo === "submarino" ? t * 0.09 : 0), p[2]]} scale={t} rotation={[0, e.mira < 0 ? Math.PI : 0, 0]}>
      {actor.tipo === "submarino" && <Submarino3D color={color} foco={actor.extra?.foco === true} />}
      {actor.tipo === "gamba" && <Gamba3D chasca={e.chasca} />}
      {actor.tipo === "pulpo" && <Pulpo3D anda={e.pose === "camina" || e.pose === "corre"} />}
      {actor.tipo === "glomar" && <Glomar3D noche={actor.extra?.noche === true} />}
      {actor.tipo === "buque" && <BuqueSovietico3D foco={actor.extra?.foco === true} noche={actor.extra?.noche === true} fase={(actor.nombre?.length ?? 0) * 1.7} />}
      {actor.tipo === "garra" && <Garra3D cierra={e.chasca} />}
      {actor.tipo === "k129" && <K1293D rompe={e.chasca} alto={e.alto} escala={t} />}
      {actor.tipo === "lata" && <Lata3D aplasta={e.chasca} />}
      {actor.tipo === "nodulo" && <Nodulo3D />}
      {actor.tipo === "habakkuk" && <Habakkuk3D aviones={typeof actor.extra?.aviones === "number" ? actor.extra.aviones : 18} noche={actor.extra?.noche === true} derrite={e.chasca < 0 ? 0 : Math.min(0.9, e.chasca / 150)} />}
      {actor.tipo === "uboot" && <Uboot3D />}
      {actor.tipo === "carguero" && <Carguero3D hunde={e.chasca} luces={actor.extra?.luces === true} />}
      {actor.tipo === "avion" && <Avion3D motores={actor.extra?.motores === 2 ? 2 : 4} color={actor.color} />}
      {actor.tipo === "titanic" && <Titanic3D />}
      {actor.tipo === "hielo" && <Bloque3D clase="hielo" golpe={e.chasca} />}
      {actor.tipo === "pykrete" && <Bloque3D clase="pykrete" golpe={e.chasca} />}
      {actor.tipo === "bala" && <Bala3D />}
      {actor.tipo === "torpedo" && <Torpedo3D />}
      {actor.tipo === "vaso" && <Vaso3D />}
      {actor.tipo === "plano" && <Plano3D />}
      {actor.tipo === "prototipo" && <Prototipo3D />}
      {actor.tipo === "grieta" && <Grieta3D corre={e.chasca} />}
      {actor.tipo === "ola" && (
        // chasca: sube en ~3 s, rompe hacia delante y a los ~5 s se hunde y desaparece
        <group rotation={[0, typeof actor.extra?.rumbo === "number" ? (actor.extra.rumbo * Math.PI) / 180 : 0, 0]}>
          <OlaGigante sube={e.chasca < 0 ? 0 : e.chasca / 95} rompe={e.chasca < 0 ? 0 : (e.chasca - 85) / 45} seva={e.chasca < 0 ? 0 : (e.chasca - 150) / 45} alto={typeof actor.extra?.alto === "number" ? actor.extra.alto : 0.45} avanza={typeof actor.extra?.avanza === "number" ? actor.extra.avanza : 0} />
        </group>
      )}
      {actor.tipo === "satelite" && <Satelite3D />}
      {actor.tipo === "holland" && <HollandActor actor={actor} e={e} />}
      {actor.tipo === "virginia" && <Virginia3D />}
      {actor.tipo === "cheque" && <Cheque3D chasca={e.chasca} />}
      {actor.tipo === "lastre" && <Lastre3D chasca={e.chasca} caida={typeof actor.extra?.caida === "number" ? actor.extra.caida : 1.4} />}
    </group>
  );
};
