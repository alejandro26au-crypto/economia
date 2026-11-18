// Modelos 3D del vídeo de los submarinos de Holland (idea 8). Miden 1 de largo (mira hacia +x).
// - holland: el Holland VI (USS Holland, 1900): casco de marsopa, torreta pequeña, hélice, timón y aletas de
//   profundidad detrás de la hélice. extra.ram = el Fenian Ram (1881, más pequeño y con cúpula de vigía).
//   extra.corte = casco de cristal con los tanques de lastre a la vista (se llenan al bajar, se vacían con aire).
// - virginia: submarino moderno clase Virginia (casco negro enorme, vela con aletas, hidrojet).
// - cheque: cheque gigante de 150.000 $ de la Marina (1900).
// - lastre: bola de acero (chasca = cae y se hunde).
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Resplandor } from "./escenarios-nuevos";
import { Pieza, texturaBurbuja } from "./piezas3d";

const suave = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/** Casco de revolución a lo largo de x (de -0.5 popa a 0.5 proa). perfil = radios de popa a proa. */
const Casco: React.FC<{ perfil: [number, number][]; color: string; opacidad?: number; metal?: number; rugoso?: number; map?: THREE.Texture }> = ({ perfil, color, opacidad = 1, metal = 0.45, rugoso = 0.5, map }) => {
  const geo = useMemo(() => {
    const pts = perfil.map(([x, r]) => new THREE.Vector2(r, x));
    const g = new THREE.LatheGeometry(pts, 40);
    g.rotateZ(-Math.PI / 2);
    g.computeVertexNormals();
    return g;
  }, [perfil]);
  const trans = opacidad < 1;
  return (
    <mesh geometry={geo}>
      <meshStandardMaterial color={color} map={map ?? null} metalness={metal} roughness={rugoso} transparent={trans} opacity={opacidad} depthWrite={!trans} side={trans ? THREE.DoubleSide : THREE.FrontSide} />
    </mesh>
  );
};

// perfil de marsopa del Holland VI: proa roma y redonda, lo más ancho a 1/3 de la proa, popa en punta
const PERFIL_HOLLAND: [number, number][] = [
  [-0.5, 0.004], [-0.46, 0.022], [-0.38, 0.05], [-0.25, 0.08], [-0.1, 0.098], [0.08, 0.104], [0.22, 0.1], [0.33, 0.088], [0.41, 0.07], [0.46, 0.048], [0.49, 0.024], [0.5, 0.002],
];
const PERFIL_RAM: [number, number][] = [
  [-0.5, 0.004], [-0.44, 0.03], [-0.3, 0.075], [-0.1, 0.1], [0.12, 0.1], [0.3, 0.085], [0.42, 0.055], [0.48, 0.025], [0.5, 0.003],
];

/** Textura del casco: planchas remachadas, mitad de abajo roja (pintura antiincrustante). */
function texCascoHolland(ram: boolean) {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 256;
  const x = c.getContext("2d")!;
  // en la LatheGeometry, u va alrededor del casco y v a lo largo: pintamos con v = x
  const arriba = ram ? "#3e4a3a" : "#2c3036";
  x.fillStyle = arriba;
  x.fillRect(0, 0, 1024, 256);
  // franja más clara a lo largo (la cubierta) para que se lea la forma
  x.fillStyle = ram ? "#4e5a48" : "#3c424a";
  x.fillRect(0, 0, 1024, 40);
  // planchas
  x.strokeStyle = "rgba(0,0,0,0.35)";
  x.lineWidth = 3;
  for (let i = 0; i <= 16; i++) {
    x.beginPath();
    x.moveTo(i * 64, 0);
    x.lineTo(i * 64, 256);
    x.stroke();
  }
  for (let j = 0; j <= 8; j++) {
    x.beginPath();
    x.moveTo(0, j * 32);
    x.lineTo(1024, j * 32);
    x.stroke();
  }
  // remaches
  x.fillStyle = "rgba(255,255,255,0.18)";
  for (let i = 0; i < 16; i++) for (let j = 0; j < 8; j++) for (let k = 0; k < 4; k++) x.fillRect(i * 64 + 6 + k * 15, j * 32 + 4, 3, 3);
  // óxido y desgaste
  for (let i = 0; i < 260; i++) {
    x.fillStyle = `rgba(${i % 2 ? "140,80,40" : "0,0,0"},${0.04 + ((i * 37) % 10) / 120})`;
    x.beginPath();
    x.arc(((i * 211) % 1024), ((i * 97) % 256), 3 + ((i * 13) % 12), 0, 7);
    x.fill();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/**
 * El Holland VI (o el Fenian Ram con `ram`). llena 0..1 = agua en los tanques (solo se ve con `corte`).
 * cabeceo en radianes (+ = proa arriba). helice = gira la hélice.
 */
export const Holland3D: React.FC<{ ram?: boolean; corte?: boolean; llena?: number; cabeceo?: number; helice?: boolean; burbujas?: number }> = ({ ram, corte, llena = 0, cabeceo = 0, helice = true, burbujas = 0 }) => {
  const f = useCurrentFrame();
  const tex = useMemo(() => texCascoHolland(!!ram), [ram]);
  const mb = useMemo(() => new THREE.SpriteMaterial({ map: texturaBurbuja(), color: "#e8f8ff", transparent: true, depthWrite: false }), []);
  const latón = { color: "#c89a3a", metal: 0.85, rugoso: 0.3 } as const;
  const oscuro = "#1c1e22";
  return (
    <group rotation={[0, 0, cabeceo]}>
      <Casco perfil={ram ? PERFIL_RAM : PERFIL_HOLLAND} color={corte ? "#7ab8d8" : "#ffffff"} map={corte ? undefined : tex} opacidad={corte ? 0.5 : 1} metal={corte ? 0.1 : 0.45} rugoso={corte ? 0.1 : 0.55} />
      {corte && (
        <group>
          {/* costillas del casco y la quilla, para que se lea como un barco de verdad abierto */}
          {[-0.3, -0.18, -0.06, 0.06, 0.18, 0.3].map((x) => (
            <Pieza key={x} forma={{ f: "aro", r: 0.1 - Math.abs(x) * 0.08, g: 0.007 }} color="#1a1e24" pos={[x, 0, 0]} rot={[0, Math.PI / 2, 0]} metal={0.6} />
          ))}
          <Pieza forma={{ f: "caja", t: [0.8, 0.008, 0.02] }} color="#3a4048" pos={[0, -0.085, 0]} />
          {/* tanques de lastre: proa y popa. El agua sube con `llena`; arriba, aire */}
          {[-0.2, 0.18].map((x) => {
            const h = 0.1;
            const w = 0.16;
            return (
              <group key={x} position={[x, -0.02, 0]}>
                <Pieza forma={{ f: "caja", t: [w, h, 0.12] }} color="#e8f4ff" opacidad={0.28} />
                <Pieza forma={{ f: "caja", t: [w * 0.96, Math.max(0.002, h * llena), 0.115] }} color="#1a7ad8" brillo="#0a4aa0" intensidad={0.5} pos={[0, -h / 2 + (h * llena) / 2, 0]} />
                <Pieza forma={{ f: "caja", t: [w + 0.006, 0.004, 0.125] }} color="#c8ccd4" pos={[0, h / 2, 0]} metal={0.7} />
              </group>
            );
          })}
          {/* botellas de aire comprimido, motor y la tripulación (bultos) */}
          {[-0.04, 0.0, 0.04].map((z) => (
            <Pieza key={z} forma={{ f: "tubo", r: 0.012, h: 0.12 }} color="#d8dce4" pos={[-0.02, 0.04, z]} rot={[0, 0, Math.PI / 2]} metal={0.8} rugoso={0.25} />
          ))}
          <Pieza forma={{ f: "caja", t: [0.1, 0.06, 0.07] }} color="#5a5e66" pos={[-0.34, 0.0, 0]} metal={0.6} />
          <Pieza forma={{ f: "tubo", r: 0.004, h: 0.4 }} color="#ffd060" brillo="#ffb030" intensidad={1} pos={[-0.02, 0.06, 0.03]} rot={[0, 0, Math.PI / 2]} basica />
        </group>
      )}
      {/* torreta (pequeña y redonda en el Holland; cúpula de vigía en el Ram) */}
      {ram ? (
        <group position={[0.06, 0.09, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.035, h: 0.04 }} color="#3e4a3a" metal={0.5} />
          <Pieza forma={{ f: "bola", r: 0.035, seg: 16 }} esc={[1, 0.7, 1]} color="#3e4a3a" pos={[0, 0.02, 0]} metal={0.5} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Pieza key={i} forma={{ f: "bola", r: 0.006, seg: 6 }} color="#ffd890" brillo="#ffb040" intensidad={0.9} pos={[Math.cos(i) * 0.033, 0.03, Math.sin(i) * 0.033]} basica />
          ))}
        </group>
      ) : (
        <group position={[0.04, 0.095, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.028, r2: 0.032, h: 0.05 }} color="#2c3036" metal={0.55} rugoso={0.45} />
          <Pieza forma={{ f: "tubo", r: 0.03, h: 0.006 }} {...latón} pos={[0, 0.028, 0]} />
          {[0, 1.6, 3.2, 4.8].map((a) => (
            <Pieza key={a} forma={{ f: "bola", r: 0.005, seg: 6 }} color="#9ad8ff" pos={[Math.cos(a) * 0.03, 0.012, Math.sin(a) * 0.03]} basica />
          ))}
          {/* bandera de proa a popa y barandilla de cubierta */}
          <Pieza forma={{ f: "tubo", r: 0.002, h: 0.08 }} color="#c8c8cc" pos={[-0.02, 0.06, 0]} />
        </group>
      )}
      {/* cubierta plana encima del casco */}
      <Pieza forma={{ f: "caja", t: [0.5, 0.006, 0.05] }} color="#4a3e30" pos={[0.06, 0.098, 0]} />
      {/* cañón dinamitero de proa del Holland */}
      {!ram && <Pieza forma={{ f: "tubo", r: 0.008, h: 0.12 }} color={oscuro} pos={[0.43, 0.04, 0]} rot={[0, 0, Math.PI / 2 - 0.1]} metal={0.6} />}
      {/* popa: timón vertical, aletas de profundidad horizontales y la hélice */}
      <group position={[-0.49, 0, 0]}>
        <Pieza forma={{ f: "caja", t: [0.03, 0.09, 0.004] }} color={oscuro} pos={[-0.03, 0, 0]} metal={0.5} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.004, 0.1] }} color={oscuro} pos={[-0.03, 0, 0]} metal={0.5} />
        <group position={[0.005, 0, 0]} rotation={[helice ? f * 0.7 : 0.3, 0, 0]}>
          {[0, 1, 2].map((i) => (
            <Pieza key={i} forma={{ f: "caja", t: [0.006, 0.05, 0.016] }} {...latón} rot={[(i * Math.PI * 2) / 3, 0, 0.3]} pos={[0, Math.cos((i * Math.PI * 2) / 3) * 0.022, Math.sin((i * Math.PI * 2) / 3) * 0.022]} />
          ))}
          <Pieza forma={{ f: "bola", r: 0.01, seg: 8 }} {...latón} />
        </group>
      </group>
      {/* burbujas al vaciar los tanques (o al moverse) */}
      {burbujas > 0 &&
        Array.from({ length: 24 }, (_, i) => {
          const t = ((f * 1.2 + i * 9) % 60) / 60;
          const m = mb.clone();
          m.opacity = 0.8 * (1 - t) * burbujas;
          const sc = 0.012 + (i % 5) * 0.004;
          return <sprite key={i} material={m} position={[((i * 37) % 60) / 60 * 0.6 - 0.3, 0.08 + t * 0.5, ((i * 17) % 10) / 10 * 0.1 - 0.05]} scale={[sc, sc, 1]} />;
        })}
    </group>
  );
};

/** Submarino moderno clase Virginia (negro mate, vela con aletas, hidrojet en la popa). */
export const Virginia3D: React.FC = () => {
  const perfil: [number, number][] = [
    [-0.5, 0.004], [-0.47, 0.02], [-0.4, 0.036], [-0.3, 0.046], [-0.15, 0.048], [0.3, 0.048], [0.4, 0.046], [0.46, 0.038], [0.49, 0.022], [0.5, 0.002],
  ];
  const negro = "#454a55";
  return (
    <group>
      <Casco perfil={perfil} color={negro} metal={0.25} rugoso={0.75} />
      {/* vela con las aletas */}
      <group position={[0.24, 0.05, 0]}>
        <Pieza forma={{ f: "caja", t: [0.07, 0.05, 0.016] }} color={negro} pos={[0, 0.02, 0]} rugoso={0.7} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.003, 0.07] }} color={negro} pos={[0.01, 0.03, 0]} />
        {[-0.02, 0, 0.02].map((x) => (
          <Pieza key={x} forma={{ f: "tubo", r: 0.0015, h: 0.03 }} color="#3a3c42" pos={[x, 0.06, 0]} />
        ))}
      </group>
      {/* popa: cruz de timones y el hidrojet */}
      <group position={[-0.47, 0, 0]}>
        <Pieza forma={{ f: "caja", t: [0.03, 0.06, 0.003] }} color={negro} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.003, 0.06] }} color={negro} />
        <Pieza forma={{ f: "tubo", r: 0.016, r2: 0.02, h: 0.02 }} color="#2a2c30" pos={[-0.012, 0, 0]} rot={[0, 0, Math.PI / 2]} />
      </group>
      {/* líneas de las secciones del casco (se está construyendo) y marcas de soldadura */}
      {[-0.3, -0.15, 0, 0.15, 0.3].map((x) => (
        <Pieza key={x} forma={{ f: "aro", r: 0.0485, g: 0.0012 }} color="#5a5c62" pos={[x, 0, 0]} rot={[0, Math.PI / 2, 0]} />
      ))}
    </group>
  );
};

function texCheque() {
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 440;
  const x = c.getContext("2d")!;
  const g = x.createLinearGradient(0, 0, 1024, 440);
  g.addColorStop(0, "#f2ecd4");
  g.addColorStop(1, "#e2d6b0");
  x.fillStyle = g;
  x.fillRect(0, 0, 1024, 440);
  x.strokeStyle = "#2a5a3a";
  x.lineWidth = 14;
  x.strokeRect(14, 14, 996, 412);
  x.lineWidth = 3;
  x.strokeRect(34, 34, 956, 372);
  // guilloché de fondo
  x.strokeStyle = "rgba(42,90,58,0.12)";
  for (let i = 0; i < 40; i++) {
    x.beginPath();
    for (let k = 0; k <= 100; k++) x.lineTo(40 + k * 9.5, 220 + Math.sin(k * 0.3 + i * 0.4) * (60 + i * 3));
    x.stroke();
  }
  x.fillStyle = "#1a2a20";
  x.font = "bold 40px Georgia, serif";
  x.fillText("TREASURY OF THE UNITED STATES", 60, 92);
  x.font = "italic 30px Georgia, serif";
  x.fillText("Navy Department  -  April 11, 1900", 60, 136);
  x.font = "34px Georgia, serif";
  x.fillText("PAY TO THE ORDER OF", 60, 214);
  x.font = "italic bold 46px Georgia, serif";
  x.fillText("John P. Holland", 440, 214);
  x.fillRect(430, 226, 520, 3);
  x.fillStyle = "#2a5a3a";
  x.fillRect(60, 270, 480, 100);
  x.fillStyle = "#f8f2dc";
  x.font = "bold 82px Georgia, serif";
  x.fillText("$150,000", 86, 350);
  x.fillStyle = "#1a2a20";
  x.font = "italic 40px Georgia, serif";
  x.fillText("for one submarine boat", 570, 330);
  x.save();
  x.translate(880, 120);
  x.rotate(0.15);
  x.strokeStyle = "#b02020";
  x.lineWidth = 6;
  x.beginPath();
  x.arc(0, 0, 60, 0, 7);
  x.stroke();
  x.fillStyle = "#b02020";
  x.font = "bold 26px sans-serif";
  x.textAlign = "center";
  x.fillText("PAID", 0, 10);
  x.restore();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Cheque gigante (ancho 1, de pie). chasca = aparece de un salto y brilla. */
export const Cheque3D: React.FC<{ chasca: number }> = ({ chasca }) => {
  const tex = useMemo(() => texCheque(), []);
  const k = chasca < 0 ? 1 : 1 + 0.15 * Math.sin(Math.min(1, chasca / 12) * Math.PI);
  return (
    <group scale={k}>
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[1, 0.43, 0.01]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
      {chasca >= 0 && chasca < 40 && <Resplandor pos={[0, 0.25, 0.05]} r={0.8} color="#ffe080" o={0.35 * (1 - chasca / 40)} />}
    </group>
  );
};

/** Bola de acero (ancho 1). chasca = cae (dentro del agua de la pecera) y se queda en el fondo. */
export const Lastre3D: React.FC<{ chasca: number; caida?: number }> = ({ chasca, caida = 1.4 }) => {
  const f = useCurrentFrame();
  const t = chasca < 0 ? 0 : suave(chasca / 22);
  const mb = useMemo(() => new THREE.SpriteMaterial({ map: texturaBurbuja(), color: "#e8f8ff", transparent: true, depthWrite: false }), []);
  return (
    <group position={[0, -t * caida, 0]}>
      <Pieza forma={{ f: "bola", r: 0.5, seg: 28 }} color="#9aa2ac" metal={0.95} rugoso={0.22} />
      <Pieza forma={{ f: "tubo", r: 0.08, h: 0.2 }} color="#6a7078" pos={[0, 0.55, 0]} metal={0.9} />
      {chasca > 6 &&
        chasca < 60 &&
        Array.from({ length: 10 }, (_, i) => {
          const m = mb.clone();
          m.opacity = 0.8 * (1 - chasca / 60);
          return <sprite key={i} material={m} position={[Math.sin(i * 2.3) * 0.6, 0.6 + ((f + i * 7) % 30) / 30 * 1.2, Math.cos(i * 1.7) * 0.3]} scale={[0.2, 0.2, 1]} />;
        })}
    </group>
  );
};
