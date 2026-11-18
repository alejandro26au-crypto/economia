// Escenarios 3D del vídeo 3 (Proyecto Habakkuk, 1942-43):
// - atlantico / atlantico-alba: el Atlántico Norte con icebergs, aurora boreal (noche) o amanecer rosa.
// - convoy / convoy-dia: un convoy de 1942 en plena tormenta, un mercante ardiendo y bengalas; o la mañana gris.
// - almirantazgo: sala de mando de Londres con el gran mapa del Atlántico (y el «hueco» sin aviones).
// - club: club de caballeros con chimenea (para la broma del vaso).
// - frigorifico: cámara frigorífica bajo el mercado de Smithfield, donde se probó el pykrete.
// - gabinete: el búnker de Churchill (vigas rojas, teléfonos, mapa del mundo).
// - cristal: dentro del pykrete, a escala microscópica: cristales de hielo y fibras de madera.
// - lago: el lago Patricia (Jasper, Canadá) entre las Rocosas, donde flotó el prototipo.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente } from "./escenarios";
import { Estrellas, Halo, Haz, Letrero, Mar } from "./escenarios-azorian";
import { Carguero3D } from "./modelos-habakkuk";
import { Cielo, Pieza, texturaBaldosas } from "./piezas3d";

const R = (s: number, ...k: (string | number)[]) => azar(s, "hb", ...k);
type V3 = [number, number, number];
const M = { metal: 0.55, rugoso: 0.5 };

// ---------------------------------------------------------------- comunes
/** Aurora boreal: cortinas de luz verde y violeta que ondulan (sombreado propio, se suma al cielo). */
const Aurora: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const mats = useMemo(
    () =>
      [0, 1, 2].map(
        (i) =>
          new THREE.ShaderMaterial({
            transparent: true,
            depthWrite: false,
            fog: false,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            uniforms: { t: { value: 0 }, k: { value: i * 1.7 + s } },
            vertexShader: "varying vec2 v; void main(){ v = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
            fragmentShader: `uniform float t; uniform float k; varying vec2 v;
              void main(){
                float x = v.x * 9.0 + k;
                float bandas = 0.55 + 0.45 * sin(x * 3.1 + t * 0.9) * sin(x * 1.3 - t * 0.4 + k);
                float rayos = 0.6 + 0.4 * sin(v.x * 140.0 + sin(v.x * 7.0 + t) * 4.0);
                float abajo = smoothstep(0.0, 0.12, v.y) * (1.0 - smoothstep(0.35, 1.0, v.y));
                float borde = smoothstep(0.0, 0.15, v.x) * (1.0 - smoothstep(0.85, 1.0, v.x));
                vec3 verde = vec3(0.25, 1.0, 0.55);
                vec3 violeta = vec3(0.55, 0.3, 0.95);
                vec3 c = mix(verde, violeta, smoothstep(0.25, 0.8, v.y));
                gl_FragColor = vec4(c, bandas * rayos * abajo * borde * 0.75);
              }`,
          }),
      ),
    [s],
  );
  mats.forEach((m) => (m.uniforms.t.value = f / 30));
  return (
    <group>
      {mats.map((m, i) => (
        <mesh key={i} position={[-900 + i * 900, 520 + i * 90, -2300 - i * 250]} rotation={[0, 0.3 - i * 0.35, 0]} material={m}>
          <planeGeometry args={[3000, 1500, 1, 1]} />
        </mesh>
      ))}
    </group>
  );
};

/** Icebergs: rocas de hielo con caras planas, parte bajo el agua. */
const Icebergs: React.FC<{ s: number; color?: string; lista: [number, number, number, number][] }> = ({ s, color = "#dceef8", lista }) => (
  <group>
    {lista.map(([x, z, r, alto], i) => (
      <group key={i} position={[x, -r * 0.35, z]} rotation={[0, R(s, "ir", i) * 6, 0]}>
        <Pieza forma={{ f: "roca", r, s: i * 3 + 1 }} esc={[1.3, alto, 1]} color={color} rugoso={0.35} metal={0.05} brillo="#1d4058" intensidad={0.5} />
        {/* la parte de abajo, azul turquesa bajo el agua */}
        <Pieza forma={{ f: "roca", r: r * 1.15, s: i * 3 + 2 }} esc={[1.4, 0.5, 1.1]} color="#4a9ab8" pos={[0, -r * 0.2, 0]} rugoso={0.3} opacidad={0.5} />
      </group>
    ))}
  </group>
);

/** Témpanos pequeños flotando cerca. */
const Tempanos: React.FC<{ s: number; n: number; zona: number }> = ({ s, n, zona }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const x = (R(s, "tx", i) - 0.5) * zona;
      const z = 40 - R(s, "tz", i) * zona;
      if (Math.abs(x) < 60 && z > -170 && z < 30) return null; // deja libre el sitio de los barcos
      const r = 1.5 + R(s, "trr", i) * 5;
      return <Pieza key={i} forma={{ f: "roca", r, s: i }} esc={[1.4, 0.22, 1]} color="#e6f4fb" pos={[x, 0, z]} rugoso={0.4} />;
    })}
  </group>
);

/** Lluvia: rayitas que caen alrededor de la cámara. */
export const Lluvia: React.FC<{ s: number; n?: number; zona?: number; alto?: number }> = ({ s, n = 260, zona = 60, alto = 40 }) => {
  const f = useCurrentFrame();
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const y = alto - ((f * 1.6 + R(s, "ly", i) * alto) % alto);
        return <Pieza key={i} forma={{ f: "caja", t: [0.04, 1.6, 0.04] }} color="#b8c8dc" basica opacidad={0.35} pos={[(R(s, "lx", i) - 0.5) * zona, y, 10 - R(s, "lz", i) * zona]} rot={[0, 0, 0.15]} />;
      })}
    </group>
  );
};

/** Nubes bajas: bolas aplastadas oscuras. */
export const Nubes: React.FC<{ s: number; color: string; n?: number; y?: number }> = ({ s, color, n = 14, y = 90 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => (
      <Pieza key={i} forma={{ f: "bola", r: 60 + R(s, "nr", i) * 60, seg: 14 }} esc={[3, 0.35, 1.4]} color={color} basica pos={[(R(s, "nx", i) - 0.5) * 1600, y + R(s, "ny", i) * 60, -300 - R(s, "nz", i) * 900]} opacidad={0.9} />
    ))}
  </group>
);

/** Mapa del Atlántico Norte de 1942 (textura): costas, rutas de convoy, U-boats y el «hueco» sin aviones. */
function texturaMapaAtlantico() {
  const c = document.createElement("canvas");
  c.width = 1600;
  c.height = 1000;
  const x = c.getContext("2d")!;
  x.fillStyle = "#c9d6d2";
  x.fillRect(0, 0, 1600, 1000);
  // tierra
  x.fillStyle = "#d8c89a";
  x.strokeStyle = "#7a6a48";
  x.lineWidth = 3;
  const tierra = (pts: number[][]) => {
    x.beginPath();
    x.moveTo(pts[0][0], pts[0][1]);
    for (const p of pts.slice(1)) x.lineTo(p[0], p[1]);
    x.closePath();
    x.fill();
    x.stroke();
  };
  tierra([[0, 0], [430, 0], [470, 120], [400, 260], [330, 330], [360, 430], [260, 520], [200, 700], [120, 820], [60, 1000], [0, 1000]]); // Norteamérica
  tierra([[520, 0], [760, 0], [730, 110], [620, 160], [540, 110]]); // Groenlandia
  tierra([[1180, 260], [1260, 230], [1300, 300], [1250, 380], [1190, 360]]); // Irlanda / Gran Bretaña
  tierra([[1270, 180], [1340, 150], [1360, 260], [1330, 400], [1270, 400], [1300, 300]]);
  tierra([[1420, 0], [1600, 0], [1600, 1000], [1440, 1000], [1380, 760], [1420, 560], [1380, 470], [1430, 380], [1400, 200]]); // Europa
  tierra([[900, 120], [980, 110], [1000, 160], [930, 180]]); // Islandia
  // rejilla
  x.strokeStyle = "rgba(60,80,90,0.25)";
  x.lineWidth = 1;
  for (let i = 0; i < 1600; i += 80) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i, 1000);
    x.stroke();
  }
  for (let i = 0; i < 1000; i += 80) {
    x.beginPath();
    x.moveTo(0, i);
    x.lineTo(1600, i);
    x.stroke();
  }
  // el hueco: rayado rojo en mitad del océano
  x.save();
  x.beginPath();
  x.ellipse(800, 420, 210, 260, -0.2, 0, Math.PI * 2);
  x.clip();
  x.fillStyle = "rgba(190,40,40,0.18)";
  x.fillRect(0, 0, 1600, 1000);
  x.strokeStyle = "rgba(170,30,30,0.55)";
  x.lineWidth = 6;
  for (let i = -1000; i < 1600; i += 34) {
    x.beginPath();
    x.moveTo(i, 0);
    x.lineTo(i + 1000, 1000);
    x.stroke();
  }
  x.restore();
  x.strokeStyle = "#a82222";
  x.lineWidth = 4;
  x.beginPath();
  x.ellipse(800, 420, 210, 260, -0.2, 0, Math.PI * 2);
  x.stroke();
  x.fillStyle = "#8a1a1a";
  x.font = "bold 46px serif";
  x.textAlign = "center";
  x.fillText("AIR GAP", 800, 430);
  // rutas de convoy
  x.strokeStyle = "#1d2f5a";
  x.lineWidth = 4;
  x.setLineDash([18, 12]);
  x.beginPath();
  x.moveTo(380, 420);
  x.bezierCurveTo(700, 300, 950, 300, 1200, 320);
  x.stroke();
  x.beginPath();
  x.moveTo(300, 560);
  x.bezierCurveTo(700, 560, 1000, 500, 1240, 380);
  x.stroke();
  x.setLineDash([]);
  x.fillStyle = "#1d2f5a";
  x.font = "bold 34px serif";
  x.fillText("NORTH ATLANTIC", 780, 820);
  return x;
}

/** Sala con paredes, suelo y techo (interiores): w = ancho, d = fondo, h = alto; la pared del fondo en z = -d/2+zc. */
export const Sala: React.FC<{ w: number; d: number; h: number; zc?: number; suelo: THREE.Texture; pared: string; techo: string; zocalo?: string }> = ({ w, d, h, zc = 0, suelo, pared, techo, zocalo }) => (
  <group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, zc]}>
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial map={suelo} roughness={0.6} metalness={0.05} />
    </mesh>
    <Pieza forma={{ f: "caja", t: [w, h, 0.2] }} color={pared} pos={[0, h / 2, zc - d / 2]} />
    <Pieza forma={{ f: "caja", t: [0.2, h, d] }} color={pared} pos={[-w / 2, h / 2, zc]} />
    <Pieza forma={{ f: "caja", t: [0.2, h, d] }} color={pared} pos={[w / 2, h / 2, zc]} />
    <Pieza forma={{ f: "caja", t: [w, 0.2, d] }} color={techo} pos={[0, h + 0.05, zc]} />
    {zocalo && (
      <group>
        <Pieza forma={{ f: "caja", t: [w, 1.1, 0.06] }} color={zocalo} pos={[0, 0.55, zc - d / 2 + 0.12]} />
        <Pieza forma={{ f: "caja", t: [0.06, 1.1, d] }} color={zocalo} pos={[-w / 2 + 0.12, 0.55, zc]} />
        <Pieza forma={{ f: "caja", t: [0.06, 1.1, d] }} color={zocalo} pos={[w / 2 - 0.12, 0.55, zc]} />
      </group>
    )}
  </group>
);

/** Lámpara colgante con pantalla verde (despachos de los 40). */
export const LamparaVerde: React.FC<{ pos: V3; cable: number }> = ({ pos, cable }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.01, h: cable }} color="#1a1a1a" pos={[0, cable / 2, 0]} />
    <Pieza forma={{ f: "cono", r: 0.32, h: 0.22, seg: 20 }} color="#2f5a3a" rugoso={0.35} />
    <Halo pos={[0, -0.12, 0]} r={0.3} color="#ffe2a0" o={0.3} />
    <Haz pos={[0, -0.1, 0]} rot={[0, 0, 0]} largo={2.4} ancho={1.1} color="#ffe8c0" o={0.04} />
    <pointLight position={[0, -0.3, 0]} intensity={14} distance={6} color="#ffd8a0" />
  </group>
);

/** Teléfono de baquelita. */
export const Telefono: React.FC<{ pos: V3; color?: string; rot?: number }> = ({ pos, color = "#121214", rot = 0 }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <Pieza forma={{ f: "caja", t: [0.2, 0.08, 0.16] }} color={color} rugoso={0.2} />
    <Pieza forma={{ f: "disco", r: 0.05 }} color="#d8d4c8" pos={[0, 0.041, 0.02]} rot={[-Math.PI / 2, 0, 0]} />
    <Pieza forma={{ f: "caja", t: [0.24, 0.04, 0.05] }} color={color} pos={[0, 0.1, -0.04]} rugoso={0.2} />
  </group>
);

// ---------------------------------------------------------------- ATLÁNTICO NORTE (noche con aurora / amanecer)
const Atlantico: React.FC<{ s: number; alba?: boolean }> = ({ s, alba }) => {
  const lista = useMemo<[number, number, number, number][]>(
    () => [
      [-260, -420, 46, 1.1],
      [320, -520, 60, 0.9],
      [-520, -760, 80, 1.2],
      [620, -900, 90, 0.8],
      [120, -1000, 70, 1.3],
      [-180, -260, 22, 1.4],
      [240, -230, 18, 1.2],
      [-420, 60, 30, 1],
      [460, 120, 34, 0.9],
    ],
    [],
  );
  return (
    <group>
      {alba ? <Cielo arriba="#2a3c66" medio="#f2a6a0" abajo="#1a2a40" radio={3500} /> : <Cielo arriba="#0a1a3a" medio="#2c5a8c" abajo="#0e2240" radio={3500} />}
      <Ambiente niebla={alba ? ["#c8a8b0", 300, 3000] : ["#21406a", 500, 4000]} />
      <hemisphereLight args={alba ? ["#ffd8d0", "#1d3550", 1.2] : ["#c8e4ff", "#2e4a70", 2.3]} />
      <directionalLight position={alba ? [-300, 60, -800] : [-200, 400, 300]} intensity={alba ? 2.2 : 2.0} color={alba ? "#ffb8a0" : "#d8ecff"} />
      <directionalLight position={[100, 120, 400]} intensity={alba ? 0.6 : 1.1} color={alba ? "#a8c8ff" : "#9fc0ff"} />
      {!alba && <pointLight position={[0, 90, 60]} intensity={60000} distance={600} decay={2} color="#cfe8ff" />}
      <Mar y={0} color={alba ? "#24405a" : "#1e4c7c"} tam={6000} seg={220} ola={0.4} amp={2.2} brillo={0.55} liso />
      {alba ? (
        <group>
          <Pieza forma={{ f: "bola", r: 90, seg: 24 }} color="#ffe0b8" basica pos={[-1100, 90, -2800]} />
          <Halo pos={[-1100, 90, -2800]} r={360} color="#ffa080" o={0.16} />
          <mesh position={[-500, 1.5, -1400]} rotation={[-Math.PI / 2, 0, 0.36]}>
            <planeGeometry args={[120, 2800]} />
            <meshBasicMaterial color="#ffc0a0" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          <Nubes s={s} color="#d89aa0" n={10} y={150} />
        </group>
      ) : (
        <group>
          <group scale={10}>
            <Estrellas s={s} n={500} />
          </group>
          <Aurora s={s} />
          {/* reflejo verde de la aurora en el agua, a lo lejos */}
          <mesh position={[0, 2.5, -1900]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[4000, 1400]} />
            <meshBasicMaterial color="#3aff9a" transparent opacity={0.05} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* luna */}
          <Pieza forma={{ f: "bola", r: 50, seg: 24 }} color="#f2f0e2" basica pos={[1400, 900, -2600]} />
          <Halo pos={[1400, 900, -2600]} r={160} color="#9fb8ff" o={0.12} />
        </group>
      )}
      <Icebergs s={s} lista={lista} color={alba ? "#f2e4e8" : "#d4ecf8"} />
      <Tempanos s={s} n={50} zona={900} />
    </group>
  );
};

// ---------------------------------------------------------------- CONVOY (1942: tormenta de noche / mañana gris)
const Convoy: React.FC<{ s: number; dia?: boolean }> = ({ s, dia }) => {
  const f = useCurrentFrame();
  const barcos: [number, number, number][] = [
    [-180, -260, 70],
    [-40, -330, 64],
    [130, -300, 72],
    [300, -380, 66],
    [-320, -420, 60],
    [60, -480, 62],
  ];
  // bengalas: bajan despacio con su luz
  const bengala = (i: number) => {
    const t = ((f / 30) * 0.06 + i * 0.37) % 1;
    return [(i - 1) * 160 + 40, 160 - t * 120, -220 - i * 60] as V3;
  };
  return (
    <group>
      {dia ? <Cielo arriba="#4a6488" medio="#f2c890" abajo="#2a3a48" radio={3000} /> : <Cielo arriba="#0e1a32" medio="#4a6488" abajo="#101a2a" radio={3000} />}
      <Ambiente niebla={dia ? ["#c8b8a0", 200, 2200] : ["#33465f", 300, 2400]} />
      <hemisphereLight args={dia ? ["#ffe8cc", "#2a323c", 1.35] : ["#d0dcf4", "#38465c", 2.5]} />
      <directionalLight position={dia ? [600, 120, -900] : [-200, 300, 200]} intensity={dia ? 2.2 : 2.3} color={dia ? "#ffd8a8" : "#dce6ff"} />
      {!dia && <directionalLight position={[300, 150, -600]} intensity={1.0} color="#ffb070" />}
      <Mar y={0} color={dia ? "#3a5064" : "#2a4560"} tam={5000} seg={220} ola={0.6} amp={dia ? 1.2 : 2.4} brillo={0.45} />
      <Nubes s={s} color={dia ? "#7a848e" : "#3a4a62"} n={16} y={dia ? 140 : 110} />
      {/* el convoy al fondo: mercantes en fila */}
      {barcos.map(([x, z, t], i) => (
        <group key={i} position={[x, 0, z]} scale={t} rotation={[0, 0.06 * i, Math.sin(f * 0.03 + i) * 0.02]}>
          <Carguero3D hunde={-1} luces={!dia} />
        </group>
      ))}
      {!dia && (
        <group>
          {/* un mercante ardiendo a lo lejos y su reflejo */}
          <group position={[-160, 0, -360]} scale={80} rotation={[0, 0.4, 0]}>
            <Carguero3D hunde={60} />
          </group>
          <pointLight position={[-160, 30, -320]} intensity={6000} distance={700} color="#ff7a2a" />
          <mesh position={[-150, 0.8, -240]} rotation={[-Math.PI / 2, 0, 0.1]}>
            <planeGeometry args={[40, 300]} />
            <meshBasicMaterial color="#ff8a3a" transparent opacity={0.1 + 0.03 * Math.sin(f * 0.4)} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
          {/* columna de humo */}
          {Array.from({ length: 10 }, (_, i) => (
            <Pieza key={i} forma={{ f: "bola", r: 18 + i * 6, seg: 12 }} color="#2a2420" opacidad={0.55 - i * 0.04} pos={[-170 - i * 14, 40 + i * 26, -380]} />
          ))}
          {/* bengalas */}
          {[0, 1, 2].map((i) => {
            const p = bengala(i);
            return (
              <group key={i}>
                <Pieza forma={{ f: "bola", r: 1.4, seg: 8 }} color="#fff4d8" basica pos={p} />
                <pointLight position={p} intensity={900} distance={260} color="#fff0d0" />
              </group>
            );
          })}
          <Lluvia s={s} n={160} zona={80} alto={40} />
          <Pieza forma={{ f: "bola", r: 70, seg: 24 }} color="#f4f2e6" basica pos={[900, 700, -2200]} />
          <Halo pos={[900, 700, -2200]} r={240} color="#b8ccff" o={0.14} />
        </group>
      )}
      {dia && (
        <group>
          <Pieza forma={{ f: "bola", r: 60, seg: 20 }} color="#fff0d0" basica pos={[700, 140, -2200]} />
          <Halo pos={[700, 140, -2200]} r={260} color="#ffd8a0" o={0.16} />
        </group>
      )}
    </group>
  );
};

// ---------------------------------------------------------------- ALMIRANTAZGO (sala de mando, Londres 1942)
const Almirantazgo: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#4a3426", "#3e2c20", 10), []);
  const mapa = useMemo(() => {
    const t = new THREE.CanvasTexture(texturaMapaAtlantico().canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }, []);
  return (
    <group>
      <Ambiente niebla={["#2a2420", 10, 34]} fondo="#141010" />
      <hemisphereLight args={["#ffe2c0", "#2a1e16", 0.7]} />
      <ambientLight intensity={0.12} color="#ffe8cc" />
      <pointLight position={[0, 3.4, -2.8]} intensity={26} distance={8} color="#fff0d8" />
      <Sala w={12} d={14} h={4.4} suelo={suelo} pared="#b8a88a" techo="#3a2e24" zocalo="#5a3e2a" />
      {/* el gran mapa del Atlántico en la pared del fondo */}
      <mesh position={[0, 2.35, -6.88]}>
        <planeGeometry args={[6.4, 4]} />
        <meshStandardMaterial map={mapa} roughness={0.85} emissive="#2a2620" emissiveIntensity={0.35} />
      </mesh>
      <Pieza forma={{ f: "caja", t: [6.6, 0.12, 0.08] }} color="#3a2a1e" pos={[0, 4.4, -6.85]} />
      <Pieza forma={{ f: "caja", t: [6.6, 0.12, 0.08] }} color="#3a2a1e" pos={[0, 0.3, -6.85]} />
      {/* chinchetas de U-boats sobre el mapa (rojas, parpadean) */}
      {Array.from({ length: 9 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.05, seg: 8 }} color="#d02a2a" basica opacidad={0.6 + 0.4 * Math.sin(f * 0.12 + i)} pos={[-0.8 + R(s, "ux", i) * 1.6, 1.8 + R(s, "uy", i) * 1.4, -6.84]} />
      ))}
      <Haz pos={[0, 4.3, -5.2]} rot={[-0.5, 0, 0]} largo={3.2} ancho={1.6} color="#fff0d0" o={0.04} />
      {/* ventanales con cortinas de oscurecimiento */}
      {[-5.88, 5.88].map((x) => (
        <group key={x} position={[x, 2.3, -2.5]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <Pieza forma={{ f: "caja", t: [1.6, 2.6, 0.04] }} color="#1a2438" basica />
          <Pieza forma={{ f: "caja", t: [0.8, 2.9, 0.06] }} color="#3a1c1c" pos={[-0.85, 0, 0.05]} />
          <Pieza forma={{ f: "caja", t: [0.8, 2.9, 0.06] }} color="#3a1c1c" pos={[0.85, 0, 0.05]} />
        </group>
      ))}
      {/* mesa de trazado al fondo, con barquitos y reglas */}
      <group position={[0, 0, -0.45]}>
        <Pieza forma={{ f: "caja", t: [2.8, 0.08, 1.6] }} color="#4a3020" pos={[0, 0.82, 0]} rugoso={0.5} />
        <Pieza forma={{ f: "caja", t: [2.7, 0.01, 1.5] }} color="#3a6a8a" pos={[0, 0.865, 0]} rugoso={0.7} />
        {[-1.3, 1.3].map((x) => [-0.7, 0.7].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "caja", t: [0.1, 0.8, 0.1] }} color="#3a2416" pos={[x, 0.4, z]} />))}
        {Array.from({ length: 12 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.08, 0.03, 0.03] }} color={i < 8 ? "#d8d4c8" : "#2a2a2a"} pos={[-1.1 + R(s, "bx", i) * 2.2, 0.885, -0.6 + R(s, "bz", i) * 1.2]} rot={[0, R(s, "br", i) * 3, 0]} />
        ))}
        <Pieza forma={{ f: "caja", t: [1.1, 0.01, 0.04] }} color="#c8a868" pos={[-0.6, 0.875, 0.5]} rot={[0, 0.4, 0]} />
      </group>
      {/* escritorio lateral con teléfonos y archivadores */}
      <group position={[-4.2, 0, -3.8]}>
        <Pieza forma={{ f: "caja", t: [1.8, 0.08, 0.9] }} color="#4a3020" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "caja", t: [1.7, 0.75, 0.85] }} color="#3a2416" pos={[0, 0.38, 0]} />
        <Telefono pos={[-0.5, 0.88, 0]} />
        <Telefono pos={[0.1, 0.88, 0.1]} color="#2a4a2a" rot={0.3} />
        <Pieza forma={{ f: "caja", t: [0.4, 0.02, 0.3] }} color="#e8dcc0" pos={[0.5, 0.85, 0.1]} rot={[0, -0.2, 0]} />
      </group>
      {[3.9, 4.7].map((x) => (
        <group key={x} position={[x, 0, -6.2]}>
          <Pieza forma={{ f: "caja", t: [0.7, 1.6, 0.6] }} color="#5a5a4a" pos={[0, 0.8, 0]} metal={0.3} />
          {[0.4, 0.8, 1.2].map((y) => (
            <Pieza key={y} forma={{ f: "caja", t: [0.2, 0.04, 0.03] }} color="#b8b8a8" pos={[0, y, 0.31]} metal={0.8} />
          ))}
        </group>
      ))}
      {/* reloj */}
      <group position={[-3.8, 3.4, -6.86]}>
        <Pieza forma={{ f: "disco", r: 0.35 }} color="#f2ead8" />
        <Pieza forma={{ f: "aro", r: 0.36, g: 0.03 }} color="#3a2a1e" />
        <Pieza forma={{ f: "caja", t: [0.02, 0.26, 0.01] }} color="#1a1a1a" pos={[0, 0.1, 0.02]} rot={[0, 0, -f * 0.002]} />
        <Pieza forma={{ f: "caja", t: [0.025, 0.18, 0.01] }} color="#1a1a1a" pos={[0.06, 0.04, 0.02]} rot={[0, 0, -1.1]} />
      </group>
      <LamparaVerde pos={[-1.2, 2.6, -0.45]} cable={1.8} />
      <LamparaVerde pos={[1.2, 2.6, -0.45]} cable={1.8} />
      {/* humo de tabaco flotando */}
      {Array.from({ length: 6 }, (_, i) => (
        <Pieza key={`h${i}`} forma={{ f: "bola", r: 0.8 + i * 0.2, seg: 10 }} color="#8a7a6a" opacidad={0.05} pos={[-3 + i * 1.2, 3 + Math.sin(f * 0.01 + i) * 0.2, -2 - i * 0.5]} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- CLUB (club de caballeros, chimenea)
const Club: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#5a2a22", "#4e241c", 6), []);
  const llama = 0.75 + 0.25 * Math.sin(f * 0.5) * Math.sin(f * 0.23 + 1);
  return (
    <group>
      <Ambiente niebla={["#1e1610", 9, 30]} fondo="#0e0a08" />
      <hemisphereLight args={["#ffd8b0", "#1a120c", 0.55]} />
      <ambientLight intensity={0.1} color="#ffe0c0" />
      <Sala w={12} d={14} h={3.8} suelo={suelo} pared="#24382c" techo="#2a1e16" zocalo="#3e2618" />
      {/* chimenea al fondo con fuego */}
      <group position={[0, 0, -6.8]}>
        <Pieza forma={{ f: "caja", t: [2.6, 1.6, 0.6] }} color="#d8ccb8" pos={[0, 0.8, 0]} rugoso={0.4} />
        <Pieza forma={{ f: "caja", t: [1.4, 1.0, 0.5] }} color="#120c08" pos={[0, 0.55, 0.12]} basica />
        <Pieza forma={{ f: "caja", t: [3, 0.12, 0.8] }} color="#c8bca8" pos={[0, 1.66, 0.05]} />
        {Array.from({ length: 6 }, (_, i) => (
          <Pieza key={i} forma={{ f: "cono", r: 0.12 + (i % 3) * 0.04, h: 0.4 * (0.7 + 0.3 * Math.sin(f * 0.6 + i * 1.7)), seg: 7 }} color={i % 2 ? "#ffb040" : "#ff6a1a"} basica opacidad={0.85} pos={[-0.4 + i * 0.16, 0.32, 0.35]} />
        ))}
        <pointLight position={[0, 0.6, 1.2]} intensity={30 * llama} distance={9} color="#ff9a4a" />
        <Halo pos={[0, 0.5, 0.5]} r={0.7} color="#ff8a3a" o={0.2 * llama} />
        {/* cuadro de un acorazado encima */}
        <Pieza forma={{ f: "caja", t: [1.8, 1.1, 0.06] }} color="#6a4a22" pos={[0, 2.55, 0.0]} metal={0.4} />
        <Pieza forma={{ f: "caja", t: [1.6, 0.9, 0.02] }} color="#3a4a5a" pos={[0, 2.55, 0.04]} />
        <Pieza forma={{ f: "caja", t: [1.0, 0.12, 0.01] }} color="#1a1e24" pos={[0, 2.4, 0.06]} />
        <Pieza forma={{ f: "caja", t: [0.3, 0.16, 0.01] }} color="#1a1e24" pos={[0.1, 2.52, 0.06]} />
      </group>
      {/* estanterías de libros a los lados */}
      {[-5.75, 5.75].map((x) => (
        <group key={x} position={[x, 0, -2]} rotation={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <Pieza forma={{ f: "caja", t: [6, 3.4, 0.4] }} color="#3a2416" pos={[0, 1.7, 0]} />
          {[0.5, 1.2, 1.9, 2.6].map((y) =>
            Array.from({ length: 26 }, (_, i) => (
              <Pieza key={`${y}${i}`} forma={{ f: "caja", t: [0.18, 0.5 + R(s, "lh", y, i) * 0.12, 0.3] }} color={["#5a1a1a", "#1a3a2a", "#2a2a4a", "#6a5a2a", "#3a2a1a"][(i + Math.round(y * 3)) % 5]} pos={[-2.8 + i * 0.22, y + 0.25, 0.22]} />
            )),
          )}
        </group>
      ))}
      {/* sillones chesterfield */}
      {[
        [-2.6, -4.6, 0.5],
        [2.6, -4.6, -0.5],
      ].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Pieza forma={{ f: "caja", t: [1.1, 0.45, 1.0] }} color="#5a2e1a" pos={[0, 0.3, 0]} rugoso={0.45} />
          <Pieza forma={{ f: "caja", t: [1.1, 0.7, 0.25] }} color="#5a2e1a" pos={[0, 0.75, -0.4]} rugoso={0.45} />
          {[-0.55, 0.55].map((l) => (
            <Pieza key={l} forma={{ f: "tubo", r: 0.16, h: 1.0 }} color="#4e2614" pos={[l, 0.6, 0]} rot={[Math.PI / 2, 0, 0]} rugoso={0.45} />
          ))}
        </group>
      ))}
      {/* mesita redonda delante (los objetos van encima, a 0,78 m) */}
      <group position={[0, 0, 0.3]}>
        <Pieza forma={{ f: "tubo", r: 0.75, h: 0.06, seg: 32 }} color="#3a2010" pos={[0, 0.75, 0]} rugoso={0.25} />
        <Pieza forma={{ f: "tubo", r: 0.08, h: 0.72 }} color="#2a1608" pos={[0, 0.37, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.4, r2: 0.3, h: 0.05 }} color="#2a1608" pos={[0, 0.03, 0]} />
      </group>
      {/* lámpara de pie */}
      <group position={[4.2, 0, -3.6]}>
        <Pieza forma={{ f: "tubo", r: 0.03, h: 1.6 }} color="#8a6a30" pos={[0, 0.8, 0]} metal={0.8} />
        <Pieza forma={{ f: "tubo", r: 0.2, r2: 0.32, h: 0.35 }} color="#e8d4a8" pos={[0, 1.75, 0]} brillo="#ffcf90" intensidad={0.6} />
        <pointLight position={[0, 1.6, 0.3]} intensity={10} distance={6} color="#ffcf90" />
      </group>
      <pointLight position={[0, 2.6, 1.6]} intensity={9} distance={6} color="#ffe2c0" />
    </group>
  );
};

// ---------------------------------------------------------------- FRIGORÍFICO (bajo el mercado de Smithfield)
const Frigorifico: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#9aa8b0", "#8e9ca4", 12), []);
  return (
    <group>
      <Ambiente niebla={["#9ab8cc", 6, 26]} fondo="#5a7488" />
      <hemisphereLight args={["#e8f6ff", "#3a4a58", 0.9]} />
      <ambientLight intensity={0.15} color="#d8ecff" />
      <Sala w={11} d={13} h={3.4} suelo={suelo} pared="#d4e2ea" techo="#a8b8c4" />
      {/* escarcha: costras blancas por las paredes */}
      {Array.from({ length: 40 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.15 + R(s, "er", i) * 0.35, seg: 8 }} esc={[1.6, 0.5, 0.3]} color="#f4fbff" pos={[-5 + R(s, "ex", i) * 10, R(s, "ey", i) * 3.2, -6.38]} rugoso={0.3} facetas />
      ))}
      {/* carámbanos del techo */}
      {Array.from({ length: 34 }, (_, i) => (
        <Pieza key={`c${i}`} forma={{ f: "cono", r: 0.03 + R(s, "cr", i) * 0.03, h: 0.15 + R(s, "ch", i) * 0.35, seg: 5 }} color="#e8f8ff" pos={[-5 + R(s, "cx", i) * 10, 3.3, -6 + R(s, "cz", i) * 7]} rot={[Math.PI, 0, 0]} rugoso={0.1} />
      ))}
      {/* raíles del techo con ganchos y piezas de carne envueltas en tela */}
      {[-3.6, 3.6].map((x) => (
        <group key={x} position={[x, 3.1, -2.5]}>
          <Pieza forma={{ f: "caja", t: [0.08, 0.08, 7] }} color="#7a868e" {...M} />
          {[-2.6, -1.2, 0.4, 1.8].map((z, i) => (
            <group key={z} position={[0, 0, z]} rotation={[0, i * 0.4, 0]}>
              <Pieza forma={{ f: "aro", r: 0.06, g: 0.01, arco: Math.PI * 1.4 }} color="#8a949c" pos={[0, -0.12, 0]} metal={0.8} />
              <Pieza forma={{ f: "bola", r: 0.28, seg: 12 }} esc={[0.8, 1.6, 0.6]} color="#e4dcd0" pos={[0, -0.7, 0]} rugoso={0.95} />
            </group>
          ))}
        </group>
      ))}
      {/* sacos de serrín y cubos */}
      {[
        [-4.2, -5.2],
        [-3.5, -5.5],
        [-4.0, -4.4],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Pieza forma={{ f: "bola", r: 0.4, seg: 12 }} esc={[1, 1.2, 0.8]} color="#b89a6a" pos={[0, 0.45, 0]} rugoso={1} />
          <Letrero texto="SAWDUST" pos={[0, 0.5, 0.33]} ancho={0.5} alto={0.12} fondo="transparent" tinta="#3a2a1a" letra={0.7} />
        </group>
      ))}
      <Pieza forma={{ f: "bola", r: 0.9, seg: 14 }} esc={[1.4, 0.35, 1]} color="#c8a878" pos={[-3.2, 0, -3.8]} rugoso={1} />
      {[3.4, 4.1].map((x) => (
        <Pieza key={x} forma={{ f: "tubo", r: 0.22, r2: 0.18, h: 0.4 }} color="#9aa4ac" pos={[x, 0.2, -5]} metal={0.7} rugoso={0.4} />
      ))}
      {/* pilas de bloques de pykrete ya hechos al fondo */}
      {Array.from({ length: 9 }, (_, i) => (
        <Pieza key={`b${i}`} forma={{ f: "caja", t: [0.6, 0.4, 0.4] }} color="#d2c2a2" pos={[3.2 + (i % 3) * 0.62, 0.2 + Math.floor(i / 3) * 0.41, -3.4]} rugoso={0.7} />
      ))}
      {/* banco de trabajo de acero delante (los bloques van encima, a 0,9 m) */}
      <group position={[0, 0, 0.3]}>
        <Pieza forma={{ f: "caja", t: [2.4, 0.06, 0.9] }} color="#9aa4ac" pos={[0, 0.88, 0]} metal={0.7} rugoso={0.35} />
        {[-1.1, 1.1].map((x) => [-0.38, 0.38].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "caja", t: [0.06, 0.86, 0.06] }} color="#7a848c" pos={[x, 0.43, z]} metal={0.7} />))}
      </group>
      {/* puerta de cámara con el letrero */}
      <group position={[0, 0, -6.35]}>
        <Pieza forma={{ f: "caja", t: [1.6, 2.4, 0.15] }} color="#b8c4cc" pos={[0, 1.2, 0]} metal={0.6} rugoso={0.3} />
        <Pieza forma={{ f: "caja", t: [0.12, 0.5, 0.12] }} color="#5a646c" pos={[0.6, 1.2, 0.12]} metal={0.8} />
        <Letrero texto="COLD STORE  -  SMITHFIELD" pos={[0, 2.75, 0.02]} ancho={2.6} alto={0.32} fondo="#1e2a3a" tinta="#e8f2ff" letra={0.5} />
      </group>
      {/* termómetro */}
      <Letrero texto="-15 C" pos={[2.2, 1.8, -6.35]} ancho={0.5} alto={0.22} fondo="#f2f2ea" tinta="#1a3a8a" letra={0.6} />
      {/* bombillas con rejilla y luz fría */}
      {[-2.4, 0, 2.4].map((x, i) => (
        <group key={x} position={[x, 3.0, -1.5 - i * 1.5]}>
          <Pieza forma={{ f: "bola", r: 0.1, seg: 10 }} color="#f4fbff" basica />
          <Halo pos={[0, 0, 0]} r={0.35} color="#cfe8ff" o={0.25} />
          <pointLight position={[0, -0.2, 0]} intensity={16} distance={7} color="#e0f0ff" />
        </group>
      ))}
      {/* vaho frío flotando a ras de suelo */}
      {Array.from({ length: 10 }, (_, i) => (
        <Pieza key={`v${i}`} forma={{ f: "bola", r: 0.7 + R(s, "vr", i) * 0.6, seg: 10 }} esc={[2, 0.3, 1]} color="#ffffff" opacidad={0.08} pos={[-4 + i * 0.9 + Math.sin(f * 0.01 + i) * 0.3, 0.15, -1 - R(s, "vz", i) * 4]} />
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- GABINETE (búnker de Churchill)
const Gabinete: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = useMemo(() => texturaBaldosas("#6a5a40", "#5e5038", 8), []);
  const mapa = useMemo(() => {
    const x = texturaMapaAtlantico();
    const t = new THREE.CanvasTexture(x.canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return (
    <group>
      <Ambiente niebla={["#2a2218", 8, 26]} fondo="#140f0a" />
      <hemisphereLight args={["#ffe0b0", "#2a2016", 0.65]} />
      <ambientLight intensity={0.12} color="#ffe8cc" />
      <Sala w={10} d={11} h={2.9} suelo={suelo} pared="#d8ccaa" techo="#c8bc9a" />
      {/* vigas de acero rojas del techo (refuerzo del búnker) */}
      {[-3, -1, 1, 3].map((z) => (
        <Pieza key={z} forma={{ f: "caja", t: [10, 0.3, 0.22] }} color="#8a2a22" pos={[0, 2.75, z - 1]} metal={0.4} rugoso={0.5} />
      ))}
      {[-4.8, 4.8].map((x) => [-4, 0].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "caja", t: [0.22, 2.9, 0.22] }} color="#8a2a22" pos={[x, 1.45, z]} metal={0.4} />))}
      {/* mapa en la pared */}
      <mesh position={[1.6, 1.6, -5.38]}>
        <planeGeometry args={[3.6, 2.2]} />
        <meshStandardMaterial map={mapa} roughness={0.85} emissive="#2a2620" emissiveIntensity={0.3} />
      </mesh>
      {/* escritorio con teléfonos verde y negro, cenicero con humo y papeles */}
      <group position={[-1.6, 0, -3.6]}>
        <Pieza forma={{ f: "caja", t: [2.2, 0.08, 1.0] }} color="#5a3a22" pos={[0, 0.78, 0]} rugoso={0.4} />
        <Pieza forma={{ f: "caja", t: [2.1, 0.74, 0.95] }} color="#4a2e1a" pos={[0, 0.37, 0]} />
        <Telefono pos={[-0.7, 0.86, -0.1]} color="#2a4a2a" />
        <Telefono pos={[-0.3, 0.86, -0.2]} rot={0.4} />
        <Pieza forma={{ f: "tubo", r: 0.09, r2: 0.07, h: 0.04 }} color="#8a8a90" pos={[0.5, 0.84, 0.1]} metal={0.8} />
        {Array.from({ length: 6 }, (_, i) => {
          const t = (f * 0.008 + i / 6) % 1;
          return <Pieza key={i} forma={{ f: "bola", r: 0.03 + t * 0.12, seg: 8 }} color="#c8c4bc" opacidad={0.3 * (1 - t)} pos={[0.5 + Math.sin(t * 6 + i) * 0.06, 0.9 + t * 1.2, 0.1]} />;
        })}
        <Pieza forma={{ f: "caja", t: [0.5, 0.02, 0.35] }} color="#f0e6cc" pos={[0.1, 0.83, 0.15]} rot={[0, 0.1, 0]} />
        <Letrero texto="ACTION THIS DAY" pos={[0.1, 0.842, 0.15]} rot={[-Math.PI / 2, 0, 0.1]} ancho={0.4} alto={0.06} fondo="#c8302a" tinta="#ffffff" letra={0.6} />
        <LamparaVerde pos={[0, 2.3, 0]} cable={0.5} />
      </group>
      {/* sillón de cuero */}
      <group position={[-1.6, 0, -4.6]}>
        <Pieza forma={{ f: "caja", t: [0.9, 0.5, 0.8] }} color="#3a2214" pos={[0, 0.3, 0]} rugoso={0.4} />
        <Pieza forma={{ f: "caja", t: [0.9, 0.8, 0.2] }} color="#3a2214" pos={[0, 0.8, -0.35]} rugoso={0.4} />
      </group>
      {/* banderines y reloj */}
      <group position={[-3.6, 2.0, -5.38]}>
        <Pieza forma={{ f: "disco", r: 0.3 }} color="#f2ead8" />
        <Pieza forma={{ f: "aro", r: 0.31, g: 0.025 }} color="#2a2018" />
        <Pieza forma={{ f: "caja", t: [0.02, 0.22, 0.01] }} color="#1a1a1a" pos={[0, 0.08, 0.02]} rot={[0, 0, -f * 0.002 + 0.6]} />
      </group>
      {/* tubería y caja de sacos terreros en la esquina */}
      <Pieza forma={{ f: "tubo", r: 0.06, h: 10 }} color="#5a6a5a" pos={[0, 2.45, -5.2]} rot={[0, 0, Math.PI / 2]} metal={0.5} />
      {Array.from({ length: 6 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.3, seg: 10 }} esc={[1.4, 0.5, 0.9]} color="#a8946a" pos={[3.8 + (i % 3) * 0.4 - 0.4, 0.15 + Math.floor(i / 3) * 0.28, -4.6]} rugoso={1} />
      ))}
      <pointLight position={[1.2, 2.3, -1]} intensity={12} distance={7} color="#ffe2b8" />
    </group>
  );
};

// ---------------------------------------------------------------- CRISTAL (dentro del pykrete, a escala microscópica)
const Cristal: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  return (
    <group>
      <Cielo arriba="#0a2a4a" medio="#1a5a8a" abajo="#06182a" />
      <Ambiente niebla={["#14406a", 5, 30]} />
      <hemisphereLight args={["#cfeeff", "#0a2038", 1.0]} />
      <directionalLight position={[3, 8, 4]} intensity={1.4} color="#e8f8ff" />
      <pointLight position={[0, 2, 2]} intensity={20} distance={10} color="#9fe8ff" />
      {/* cristales de hielo: prismas hexagonales translúcidos en todas direcciones */}
      {Array.from({ length: 46 }, (_, i) => {
        const x = (R(s, "kx", i) - 0.5) * 22;
        const y = -2 + R(s, "ky", i) * 8;
        const z = 2 - R(s, "kz", i) * 20;
        if (Math.abs(x) < 2.6 && z > -3) return null; // centro libre para la grieta
        const r = 0.3 + R(s, "kr", i) * 0.9;
        return (
          <Pieza key={i} forma={{ f: "tubo", r, h: r * (1.5 + R(s, "kh", i) * 2), seg: 6 }} color="#bfe6fb" pos={[x, y, z]} rot={[R(s, "ka", i) * 3, R(s, "kb", i) * 3, R(s, "kc", i) * 3]} rugoso={0.08} metal={0.2} opacidad={0.55} brillo="#2a6a9a" intensidad={0.4} />
        );
      })}
      {/* fibras de madera (serrín): hebras marrones retorcidas que atraviesan el hielo */}
      {Array.from({ length: 34 }, (_, i) => {
        const x = (R(s, "fx", i) - 0.5) * 14;
        const y = -1 + R(s, "fy", i) * 5;
        const z = 1.5 - R(s, "fz", i) * 12;
        return (
          <group key={`f${i}`} position={[x, y, z]} rotation={[R(s, "fa", i) * 3, R(s, "fb", i) * 3, R(s, "fc", i) * 3]}>
            <Pieza forma={{ f: "tubo", r: 0.035, h: 1.4 + R(s, "fl", i) * 1.6, seg: 6 }} color="#8a6234" rugoso={0.9} />
            <Pieza forma={{ f: "tubo", r: 0.02, h: 0.9, seg: 5 }} color="#a87a44" pos={[0.05, 0.3, 0]} rot={[0, 0, 0.4]} rugoso={0.9} />
          </group>
        );
      })}
      {/* fibras que cruzan justo el camino de la grieta (la frenan) */}
      {[0.35, 0.55, 0.8].map((x, i) => (
        <group key={`c${i}`} position={[x, 1.5 + (i - 1) * 0.25, 0]} rotation={[0.3 * i, 0, 0.2 + i * 0.3]}>
          <Pieza forma={{ f: "tubo", r: 0.045, h: 2.4, seg: 6 }} color="#9a6e3a" rugoso={0.9} />
        </group>
      ))}
      {/* destellos */}
      {Array.from({ length: 30 }, (_, i) => {
        const b = Math.max(0, Math.sin(f * 0.08 + i * 1.3));
        return <Pieza key={`d${i}`} forma={{ f: "bola", r: 0.03, seg: 6 }} color="#ffffff" basica opacidad={b * 0.9} pos={[(R(s, "dx", i) - 0.5) * 16, R(s, "dy", i) * 6 - 1, -R(s, "dz", i) * 14]} />;
      })}
      <Haz pos={[-2, 9, -2]} rot={[0.2, 0, 0.25]} largo={14} ancho={3} color="#e0f6ff" o={0.05} />
      <Haz pos={[4, 9, -6]} rot={[0.1, 0, -0.2]} largo={14} ancho={2.4} color="#e0f6ff" o={0.04} />
    </group>
  );
};

// ---------------------------------------------------------------- LAGO PATRICIA (Jasper, Canadá)
const Lago: React.FC<{ s: number }> = ({ s }) => {
  const montes: [number, number, number, number][] = [
    [-160, -260, 120, 150],
    [-40, -320, 150, 190],
    [110, -290, 130, 160],
    [240, -240, 110, 130],
    [-280, -200, 100, 110],
    [20, -420, 180, 240],
  ];
  return (
    <group>
      <Cielo arriba="#2a6ab8" medio="#a8d4f0" abajo="#3a6a58" radio={1800} />
      <Ambiente niebla={["#a8c8dc", 90, 620]} />
      <hemisphereLight args={["#e8f4ff", "#3a5a3a", 1.2]} />
      <directionalLight position={[150, 200, 80]} intensity={2.6} color="#fff2d8" />
      <Pieza forma={{ f: "bola", r: 14, seg: 20 }} color="#fff8e0" basica pos={[220, 230, -500]} />
      <Halo pos={[220, 230, -500]} r={50} color="#fff0c0" o={0.2} />
      {/* agua turquesa del lago, casi quieta */}
      <Mar y={0} color="#2a8a98" tam={1400} amp={0.08} brillo={0.12} />
      {/* montañas con nieve */}
      {montes.map(([x, z, r, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <Pieza forma={{ f: "cono", r, h, seg: 7 }} color="#6a6e74" pos={[0, h / 2, 0]} rot={[0, i, 0]} facetas rugoso={0.95} />
          <Pieza forma={{ f: "cono", r: r * 0.36, h: h * 0.36, seg: 7 }} color="#f4f8fc" pos={[0, h - h * 0.18 + 0.5, 0]} rot={[0, i, 0]} facetas rugoso={0.6} />
        </group>
      ))}
      {/* orillas con bosque de abetos */}
      {Array.from({ length: 140 }, (_, i) => {
        const lado = i % 2 ? 1 : -1;
        const x = lado * (56 + R(s, "ax", i) * 150);
        const z = 30 - R(s, "az", i) * 230;
        const h = 8 + R(s, "ah", i) * 10;
        return (
          <group key={i} position={[x, 0, z]}>
            <Pieza forma={{ f: "cono", r: h * 0.28, h, seg: 6 }} color={i % 3 ? "#1e3a26" : "#24442a"} pos={[0, h / 2 + 1.2, 0]} rugoso={1} />
            <Pieza forma={{ f: "tubo", r: 0.3, h: 1.4 }} color="#3a2a1a" pos={[0, 0.7, 0]} />
          </group>
        );
      })}
      {/* el fondo del valle con orilla verde */}
      <Pieza forma={{ f: "caja", t: [700, 2, 120] }} color="#3a5a34" pos={[0, 0.6, -230]} rugoso={1} />
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "caja", t: [160, 2, 400] }} color="#3a5a34" pos={[l * 130, 0.6, -60]} rugoso={1} />
      ))}
      {/* embarcadero de madera */}
      <group position={[-24, 0, 6]}>
        <Pieza forma={{ f: "caja", t: [3, 0.25, 16] }} color="#7a5a3a" pos={[0, 0.6, 0]} rugoso={0.95} />
        {Array.from({ length: 6 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.15, h: 2 }} color="#5a3e26" pos={[i % 2 ? 1.3 : -1.3, 0, -7 + Math.floor(i / 2) * 7]} />
        ))}
      </group>
      {/* nubes blancas */}
      {Array.from({ length: 6 }, (_, i) => (
        <Pieza key={`n${i}`} forma={{ f: "bola", r: 30 + R(s, "nr", i) * 30, seg: 12 }} esc={[3, 0.5, 1]} color="#ffffff" basica opacidad={0.85} pos={[-300 + i * 130, 220 + R(s, "ny", i) * 60, -600]} />
      ))}
    </group>
  );
};

export const ESCENARIOS_HABAKKUK = {
  atlantico: (({ s }) => <Atlantico s={s} />) as React.FC<{ s: number }>,
  "atlantico-alba": (({ s }) => <Atlantico s={s} alba />) as React.FC<{ s: number }>,
  convoy: (({ s }) => <Convoy s={s} />) as React.FC<{ s: number }>,
  "convoy-dia": (({ s }) => <Convoy s={s} dia />) as React.FC<{ s: number }>,
  almirantazgo: Almirantazgo,
  club: Club,
  frigorifico: Frigorifico,
  gabinete: Gabinete,
  cristal: Cristal,
  lago: Lago,
};
