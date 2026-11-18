// Escenarios del vídeo «Why Don't Submarines Sink» (idea 8, John Holland). Nivel del camarote, cada uno con su sitio,
// época, luz y paleta:
// - astillero: muelle del astillero al atardecer (1898): nave de ladrillo con ventanas encendidas, grúa de madera,
//   grada, planchas de acero, faroles de gas, el agua fría y el Holland flotando junto al muelle.
//   astillero-fiesta: el mismo muelle el día de la compra (1900): banderines, bandera grande, tarima y luz de tarde.
// - aula: aula de Paterson en una noche de invierno (1875): pizarra con el submarino a tiza, pupitres, estufa de
//   hierro con fuego, lámpara de aceite, globo, la carta a la Marina y la nieve por la ventana.
// - ministerio: despacho de la Marina en Washington (1875): escritorio de caoba con la carta «REJECTED», cuadros de
//   barcos, banderas, maqueta de fragata en vitrina, la pecera donde cae la bola de acero y la cúpula del Capitolio.
// - guarida: trastienda de los rebeldes fenianos en Nueva York, de noche: bandera verde con el arpa, mesa con fajos
//   de dólares y la caja fuerte, mapa con los buques británicos tachados, velas en botellas, rifles.
// - canal: dársena del canal Morris en Jersey City (noviembre de 1883), noche de luna: el Fenian Ram en su grada,
//   almacenes, farola de gas, bote de remos, faroles de los ladrones y Manhattan al otro lado del río.
// - taller: taller de pruebas de Holland: el gran tanque de cristal con el submarino abierto (tanques de lastre a la
//   vista), compresor de aire con manómetro, banco de herramientas, planos y la pizarra de la flotación.
// - bahia: bajo el agua en la bahía (pruebas de 1899): superficie que brilla arriba, rayos de luz, fondo de arena con
//   rocas, hierbas, ancla vieja y cadena; el Holland bucea con sus aletas.
// - nave: nave cubierta de un astillero de hoy: un submarino clase Virginia enorme en construcción, andamios,
//   focos fríos, chispas de soldadura cálidas, grúa puente y la bandera gigante.
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente, Rayos3D } from "./escenarios";
import { Estrellas, Haz, Letrero, Mar } from "./escenarios-azorian";
import { Barril, Caja, Fuego, Luna, Resplandor, TCaja, TPlano } from "./escenarios-nuevos";
import { Botella, Farol, Humo, Monedas, Ventana } from "./escenarios-pirata";
import { Holland3D } from "./modelos-holland";
import { Cielo, Pieza } from "./piezas3d";
import { texAlfombra, texLosas, texMadera, texPiedra } from "./texturas-pintadas";
import { texBanderaEEUU, texBanderaVerde, texBilletes, texCartaRechazo, texChapaNave, texCuadroBarco, texLadrillo, texMapaBritanico, texNocheNieve, texPizarraAula, texPizarraTaller, texPlanoSub } from "./texturas-holland";

type V3 = [number, number, number];
const R = (s: number, ...k: (string | number)[]) => azar(s, "ho", ...k);
const LATON = { color: "#c89a3a", metal: 0.85, rugoso: 0.3 } as const;

// ---------------------------------------------------------------- piezas comunes
/** Farola de gas de calle (poste de hierro y farol con luz cálida). */
export const Farola: React.FC<{ pos: V3; luz?: number; s: number }> = ({ pos, luz = 8, s }) => {
  const f = useCurrentFrame();
  const k = 0.9 + 0.1 * Math.sin(f * 0.3 + s);
  return (
    <group position={pos}>
      <Pieza forma={{ f: "tubo", r: 0.06, r2: 0.05, h: 3.2 }} color="#1e2024" pos={[0, 1.6, 0]} metal={0.6} rugoso={0.5} />
      <Pieza forma={{ f: "tubo", r: 0.12, h: 0.3 }} color="#1e2024" pos={[0, 0.15, 0]} metal={0.6} />
      <group position={[0, 3.4, 0]}>
        <Pieza forma={{ f: "cono", r: 0.22, h: 0.18, seg: 6 }} color="#1e2024" pos={[0, 0.25, 0]} metal={0.6} />
        <Pieza forma={{ f: "tubo", r: 0.14, r2: 0.18, h: 0.34, seg: 6 }} color="#ffe0a0" brillo="#ffb860" intensidad={1.6} basica />
        <Resplandor pos={[0, 0, 0]} r={0.6} color="#ffb860" o={0.3 * k} />
        <Resplandor pos={[0, 0, 0]} r={2} color="#ff9a40" o={0.08 * k} />
        {luz > 0 && <pointLight intensity={luz * k} distance={12} decay={1.5} color="#ffb070" />}
      </group>
    </group>
  );
};

/** Bandera que ondea (plano con ondas). */
export const Bandera: React.FC<{ pos: V3; rot?: V3; ancho: number; alto: number; map: THREE.Texture; s: number; mastil?: boolean }> = ({ pos, rot, ancho, alto, map, s, mastil = true }) => {
  const f = useCurrentFrame();
  const geo = React.useMemo(() => new THREE.PlaneGeometry(ancho, alto, 16, 6), [ancho, alto]);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i) + ancho / 2;
    p.setZ(i, Math.sin(x * 2.2 - f * 0.12 + s) * 0.06 * x);
  }
  p.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group position={pos} rotation={rot}>
      {mastil && <Pieza forma={{ f: "tubo", r: 0.03, h: alto + 1.4 }} color="#d8d0b8" pos={[0, -(alto + 1.4) / 2 + alto / 2 + 0.2, 0]} />}
      <mesh geometry={geo} position={[ancho / 2 + 0.03, 0, 0]}>
        <meshStandardMaterial map={map} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Guirnalda de banderines triangulares rojo-blanco-azul entre dos puntos. */
export const Banderines: React.FC<{ de: V3; a: V3; n?: number; caida?: number }> = ({ de, a, n = 14, caida = 0.6 }) => {
  const f = useCurrentFrame();
  const cols = ["#b3202f", "#f4f2ec", "#1c2a5a"];
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = (i + 0.5) / n;
        const x = de[0] + (a[0] - de[0]) * t;
        const z = de[2] + (a[2] - de[2]) * t;
        const y = de[1] + (a[1] - de[1]) * t - Math.sin(t * Math.PI) * caida;
        return (
          <mesh key={i} position={[x, y - 0.15, z]} rotation={[Math.sin(f * 0.1 + i) * 0.2, Math.atan2(a[0] - de[0], a[2] - de[2]) + Math.PI / 2, 0]}>
            <coneGeometry args={[0.14, 0.32, 3]} />
            <meshStandardMaterial color={cols[i % 3]} roughness={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Cuadro con marco dorado. */
export const Cuadro: React.FC<{ pos: V3; rot?: V3; ancho: number; alto: number; map: THREE.Texture }> = ({ pos, rot, ancho, alto, map }) => (
  <group position={pos} rotation={rot}>
    <Pieza forma={{ f: "caja", t: [ancho + 0.16, alto + 0.16, 0.06] }} {...LATON} />
    <TPlano w={ancho} h={alto} pos={[0, 0, 0.035]} map={map} />
  </group>
);

/** Bolardo de hierro del muelle con cabo enrollado. */
export const Bolardo: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.16, r2: 0.12, h: 0.45 }} color="#26282c" pos={[0, 0.22, 0]} metal={0.6} rugoso={0.5} />
    <Pieza forma={{ f: "tubo", r: 0.2, h: 0.06 }} color="#26282c" pos={[0, 0.47, 0]} metal={0.6} />
    <Pieza forma={{ f: "aro", r: 0.2, g: 0.035 }} color="#b8a070" pos={[0, 0.1, 0]} rot={[Math.PI / 2, 0, 0]} />
  </group>
);

/** Pila de planchas de acero. */
export const Planchas: React.FC<{ pos: V3; rot?: V3; n?: number }> = ({ pos, rot, n = 6 }) => (
  <group position={pos} rotation={rot}>
    {Array.from({ length: n }, (_, i) => (
      <Pieza key={i} forma={{ f: "caja", t: [2.2, 0.05, 1.1] }} color={i % 2 ? "#5a5650" : "#6a5a4a"} pos={[(i % 3) * 0.04, 0.12 + i * 0.06, (i % 2) * 0.03]} metal={0.6} rugoso={0.6} />
    ))}
    {[-0.8, 0.8].map((x) => (
      <Pieza key={x} forma={{ f: "caja", t: [0.12, 0.1, 1.2] }} color="#4a3220" pos={[x, 0.05, 0]} />
    ))}
  </group>
);

/** Vela encendida en una botella (o en un candelero). */
export const Vela: React.FC<{ pos: V3; s: number; luz?: number; botella?: string }> = ({ pos, s, luz = 0, botella }) => (
  <group position={pos}>
    {botella && <Botella pos={[0, 0, 0]} color={botella} alto={0.28} />}
    <Pieza forma={{ f: "tubo", r: 0.022, h: 0.12 }} color="#f2ead0" pos={[0, botella ? 0.33 : 0.06, 0]} />
    <Fuego pos={[0, botella ? 0.39 : 0.12, 0]} tam={0.2} luz={luz} s={s} />
  </group>
);

/** Lámpara de aceite de mesa (pie de latón y tubo de cristal con la llama). */
export const LamparaAceite: React.FC<{ pos: V3; s: number; luz?: number }> = ({ pos, s, luz = 6 }) => {
  const f = useCurrentFrame();
  const k = 0.88 + 0.12 * Math.sin(f * 0.37 + s);
  return (
    <group position={pos}>
      <Pieza forma={{ f: "tubo", r: 0.1, r2: 0.07, h: 0.06 }} {...LATON} pos={[0, 0.03, 0]} />
      <Pieza forma={{ f: "bola", r: 0.09, seg: 14 }} color="#7a2a24" pos={[0, 0.14, 0]} rugoso={0.3} />
      <Pieza forma={{ f: "tubo", r: 0.045, r2: 0.06, h: 0.22 }} color="#fff2d0" brillo="#ffc060" intensidad={1.4} opacidad={0.85} pos={[0, 0.34, 0]} />
      <Fuego pos={[0, 0.25, 0]} tam={0.16} s={s} />
      <Resplandor pos={[0, 0.34, 0]} r={0.55} color="#ffb860" o={0.3 * k} />
      {luz > 0 && <pointLight position={[0, 0.4, 0.1]} intensity={luz * k} distance={7} decay={1.6} color="#ffb060" />}
    </group>
  );
};

/** Globo terráqueo sobre un pie. */
export const Globo: React.FC<{ pos: V3; s: number }> = ({ pos, s }) => {
  const f = useCurrentFrame();
  return (
    <group position={pos}>
      <Pieza forma={{ f: "tubo", r: 0.14, r2: 0.04, h: 0.1 }} color="#4a2c14" pos={[0, 0.05, 0]} />
      <Pieza forma={{ f: "tubo", r: 0.02, h: 0.3 }} color="#4a2c14" pos={[0, 0.2, 0]} />
      <group position={[0, 0.55, 0]} rotation={[0.4, f * 0.01 + s, 0]}>
        <Pieza forma={{ f: "bola", r: 0.24, seg: 20 }} color="#c8b47a" />
        {[0, 1, 2].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.1, seg: 10 }} esc={[1, 0.6, 0.4]} color="#5a7a4a" pos={[Math.cos(i * 2.1) * 0.2, (i - 1) * 0.08, Math.sin(i * 2.1) * 0.2]} />
        ))}
      </group>
      <Pieza forma={{ f: "aro", r: 0.27, g: 0.012, arco: Math.PI * 1.2 }} {...LATON} pos={[0, 0.55, 0]} rot={[0, 0, -0.6]} />
    </group>
  );
};

/** Ventana de guillotina con una vista pintada detrás. */
export const VentanaVista: React.FC<{ pos: V3; rot?: V3; ancho: number; alto: number; map: THREE.Texture; marco?: string; luz?: string; intensidad?: number }> = ({ pos, rot, ancho, alto, map, marco = "#3a2416", luz = "#8aa8e0", intensidad = 3 }) => (
  <group position={pos} rotation={rot}>
    <mesh>
      <planeGeometry args={[ancho, alto]} />
      <meshBasicMaterial map={map} />
    </mesh>
    {[-ancho / 2, 0, ancho / 2].map((x) => (
      <Pieza key={x} forma={{ f: "caja", t: [0.07, alto + 0.1, 0.12] }} color={marco} pos={[x, 0, 0.05]} />
    ))}
    {[-alto / 2, -alto / 6, alto / 6, alto / 2].map((y) => (
      <Pieza key={y} forma={{ f: "caja", t: [ancho + 0.1, 0.06, 0.12] }} color={marco} pos={[0, y, 0.05]} />
    ))}
    <Pieza forma={{ f: "caja", t: [ancho + 0.3, 0.08, 0.3] }} color={marco} pos={[0, -alto / 2 - 0.05, 0.12]} />
    {intensidad > 0 && <pointLight position={[0, 0, 0.8]} intensity={intensidad} distance={6} color={luz} />}
  </group>
);

/** Silueta lejana de ciudad con ventanitas encendidas (Manhattan, la orilla de enfrente). */
export const Ciudad: React.FC<{ pos: V3; s: number; ancho?: number; n?: number; color?: string; luces?: string }> = ({ pos, s, ancho = 200, n = 40, color = "#141a26", luces = "#ffcf7a" }) => (
  <group position={pos}>
    {Array.from({ length: n }, (_, i) => {
      const w = 3 + R(s, "cw", i) * 6;
      const h = 4 + R(s, "ch", i) * (i % 7 === 0 ? 14 : 9);
      const x = -ancho / 2 + (i / n) * ancho + R(s, "cx", i) * 3;
      return (
        <group key={i} position={[x, h / 2, R(s, "cz", i) * 6]}>
          <Pieza forma={{ f: "caja", t: [w, h, 3] }} color={color} basica />
          {Array.from({ length: Math.floor(h / 3) }, (_, j) =>
            R(s, "cl", i, j) > 0.55 ? <Pieza key={j} forma={{ f: "caja", t: [0.6, 0.6, 0.1] }} color={luces} basica pos={[(R(s, "clx", i, j) - 0.5) * w * 0.7, -h / 2 + 1.5 + j * 3, 1.55]} /> : null,
          )}
          {i % 7 === 0 && <Pieza forma={{ f: "cono", r: w * 0.25, h: 5, seg: 4 }} color={color} basica pos={[0, h / 2 + 2, 0]} />}
        </group>
      );
    })}
  </group>
);

/** Aves marinas planeando a lo lejos (siluetas en V). */
export const Gaviotas: React.FC<{ s: number; n?: number; centro: V3 }> = ({ s, n = 6, centro }) => {
  const f = useCurrentFrame();
  return (
    <group position={centro}>
      {Array.from({ length: n }, (_, i) => {
        const a = f * 0.006 + i * 1.3 + s;
        const r = 10 + R(s, "gr", i) * 12;
        const ala = Math.sin(f * 0.25 + i) * 0.4;
        return (
          <group key={i} position={[Math.cos(a) * r, R(s, "gy", i) * 6, Math.sin(a) * r * 0.4]} rotation={[0, -a, 0]}>
            <Pieza forma={{ f: "caja", t: [0.7, 0.04, 0.12] }} color="#1a1a20" basica pos={[0.33, 0, 0]} rot={[0, 0, 0.3 + ala]} />
            <Pieza forma={{ f: "caja", t: [0.7, 0.04, 0.12] }} color="#1a1a20" basica pos={[-0.33, 0, 0]} rot={[0, 0, -0.3 - ala]} />
          </group>
        );
      })}
    </group>
  );
};

// ================================================================ ASTILLERO (muelle al atardecer, 1898; o fiesta de 1900)
const AstilleroBase: React.FC<{ s: number; fiesta?: boolean }> = ({ s, fiesta }) => {
  const f = useCurrentFrame();
  const tablas = texMadera(28, 34, 34, 10, [3, 7]);
  const viga = texMadera(22, 36, 22, 3);
  const ladrillo = texLadrillo(12, [6, 3]);
  const bandera = texBanderaEEUU(45);
  return (
    <group>
      {fiesta ? (
        <>
          <Ambiente niebla={["#e8c8a0", 40, 320]} fondo="#c8d8e8" />
          <Cielo arriba="#4a7ab0" medio="#f4d0a0" abajo="#2a4a5a" radio={360} />
          <hemisphereLight args={["#ffe8c8", "#2a3a40", 0.9]} />
          <directionalLight position={[40, 30, 20]} intensity={1.6} color="#ffe0b0" />
        </>
      ) : (
        <>
          <Ambiente niebla={["#6a4a5a", 30, 260]} fondo="#2a2036" />
          <Cielo arriba="#1a1a3a" medio="#ff8a4a" abajo="#1a2a3a" radio={360} />
          <hemisphereLight args={["#ffb080", "#141a2a", 0.55]} />
          <directionalLight position={[-60, 14, -80]} intensity={1.3} color="#ff9a5a" />
          <directionalLight position={[40, 30, 40]} intensity={0.35} color="#6a8ad8" />
          {/* el sol que se pone detrás de la nave */}
          <group position={[-80, 10, -220]}>
            <mesh>
              <sphereGeometry args={[12, 24, 16]} />
              <meshBasicMaterial color="#ffd08a" fog={false} />
            </mesh>
            <Resplandor pos={[0, 0, 0]} r={40} color="#ff8a4a" o={0.3} />
          </group>
        </>
      )}
      <Mar y={-1.2} color={fiesta ? "#2a5a6a" : "#1e3448"} amp={0.18} ola={1.2} brillo={0.2} tam={900} />
      {/* el muelle de tablas sobre pilotes */}
      <TPlano w={7} h={14} pos={[-0.5, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={tablas} />
      <TCaja t={[7, 0.3, 14]} pos={[-0.5, -0.16, -1]} map={viga} color="#6a5040" />
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i}>
          <Pieza forma={{ f: "tubo", r: 0.16, h: 2.4 }} color="#3a2a1c" pos={[3, -1, 5.5 - i * 2]} />
          <Pieza forma={{ f: "tubo", r: 0.16, h: 2.4 }} color="#3a2a1c" pos={[-4, -1, 5.5 - i * 2]} />
        </group>
      ))}
      <Bolardo pos={[2.7, 0, 3.2]} />
      <Bolardo pos={[2.7, 0, -1.6]} />
      <Bolardo pos={[2.7, 0, -5.4]} />
      {/* cabo que amarra el submarino al bolardo */}
      <Pieza forma={{ f: "tubo", r: 0.025, h: 2.6 }} color="#b8a070" pos={[3.6, -0.3, -1.9]} rot={[0.15, 0, 1.2]} />
      {/* nave de ladrillo del astillero con las ventanas encendidas y el letrero */}
      <group position={[-8, 0, -12]}>
        <TCaja t={[10, 7, 12]} pos={[0, 3.5, 0]} map={ladrillo} color="#c88a70" />
        <Pieza forma={{ f: "caja", t: [10.6, 0.4, 12.4] }} color="#2a1e1a" pos={[0, 7.1, 0]} />
        <mesh position={[0, 8.6, 0]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[4.2, 4.2, 12.2]} />
          <meshStandardMaterial color="#3a2a26" roughness={0.9} />
        </mesh>
        {Array.from({ length: 4 }, (_, i) =>
          [0, 1].map((j) => <Pieza key={`${i}${j}`} forma={{ f: "caja", t: [1.2, 1.4, 0.05] }} color={fiesta ? "#8a9aa8" : "#ffd08a"} brillo={fiesta ? undefined : "#ffa040"} intensidad={1.3} basica={!fiesta} pos={[5.03, 1.6 + j * 2.6, -4.2 + i * 2.8]} rot={[0, Math.PI / 2, 0]} />),
        )}
        <Letrero texto="CRESCENT SHIPYARD" pos={[5.05, 5.9, 0]} rot={[0, Math.PI / 2, 0]} ancho={7} alto={0.9} fondo="#f0e6cc" tinta="#2a1a10" />
        {/* portón abierto con la luz del interior */}
        <Pieza forma={{ f: "caja", t: [0.05, 3.6, 3.2] }} color="#ffb860" brillo="#ff9a40" intensidad={fiesta ? 0.4 : 1} basica pos={[5.04, 1.8, 3.6]} />
        {!fiesta && <pointLight position={[6.5, 2, 3.6]} intensity={14} distance={12} color="#ffa050" />}
        {/* chimenea con humo */}
        <Pieza forma={{ f: "tubo", r: 0.6, r2: 0.8, h: 9 }} color="#5a3a2e" pos={[-3, 10, -3]} />
        <Humo pos={[-3, 14.5, -3]} s={s} color={fiesta ? "#d8d0c8" : "#4a4048"} tam={1.6} />
      </group>
      {/* grúa de madera de la grada con su gancho y cadena */}
      <group position={[-3.6, 0, -6]}>
        <Pieza forma={{ f: "caja", t: [0.35, 9, 0.35] }} color="#4a3220" pos={[0, 4.5, 0]} />
        <Pieza forma={{ f: "caja", t: [0.25, 0.25, 8] }} color="#4a3220" pos={[0, 8.4, 3]} rot={[-0.25, 0, 0]} />
        {[-1, 1].map((l) => (
          <Pieza key={l} forma={{ f: "caja", t: [0.15, 9.4, 0.15] }} color="#3a2618" pos={[l * 0.9, 4.4, -0.6]} rot={[0.12, 0, l * -0.1]} />
        ))}
        <Pieza forma={{ f: "tubo", r: 0.025, h: 4 }} color="#2a2a2e" pos={[0, 6.6, 6.6]} metal={0.8} />
        <Pieza forma={{ f: "aro", r: 0.18, g: 0.05, arco: Math.PI * 1.4 }} color="#2a2a2e" pos={[0, 4.5, 6.6]} metal={0.8} />
      </group>
      {/* planchas de acero, barriles, cajas, carretilla y la caseta del capataz */}
      <Planchas pos={[-2.6, 0, 1.2]} rot={[0, 0.3, 0]} />
      <Planchas pos={[-2.4, 0, -2.6]} rot={[0, -0.2, 0]} n={4} />
      <Barril pos={[-3.3, 0, 3.6]} />
      <Barril pos={[-2.6, 0, 4.1]} />
      <Caja pos={[1.6, 0, -6.5]} tam={0.8} rot={[0, 0.3, 0]} />
      <Caja pos={[2.2, 0, -7.2]} tam={0.6} rot={[0, -0.2, 0]} />
      <group position={[0.6, 0, -8.6]}>
        <TCaja t={[2.6, 2.6, 2]} pos={[0, 1.3, 0]} map={texMadera(20, 30, 40, 6)} color="#d8c8b0" />
        <Pieza forma={{ f: "caja", t: [2.9, 0.15, 2.3] }} color="#3a2a22" pos={[0, 2.66, 0]} />
        <Pieza forma={{ f: "caja", t: [0.7, 0.6, 0.04] }} color="#ffd890" brillo="#ffa040" intensidad={fiesta ? 0.3 : 1.2} basica pos={[0, 1.6, 1.02]} />
      </group>
      <Farola pos={[2.5, 0, 0.8]} s={s} luz={fiesta ? 0 : 9} />
      <Farola pos={[2.5, 0, -6.6]} s={s + 2} luz={fiesta ? 0 : 6} />
      {/* la orilla de enfrente y otros barcos lejos */}
      <Ciudad pos={[60, -1.2, -240]} s={s} ancho={260} n={34} color={fiesta ? "#6a7a8a" : "#20202e"} luces={fiesta ? "#9aa8b4" : "#ffcf7a"} />
      {[[40, -120], [-20, -150]].map(([x, z], i) => (
        <group key={i} position={[x, -1.2, z]}>
          <Pieza forma={{ f: "caja", t: [14, 2, 3] }} color="#2a2228" pos={[0, 1, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.15, h: 12 }} color="#2a2228" pos={[0, 7, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.7, h: 4 }} color="#5a2a22" pos={[-3, 4, 0]} />
        </group>
      ))}
      <Gaviotas s={s} centro={[10, 14, -40]} />
      {fiesta && (
        <group>
          {/* bandera grande, banderines por todo el muelle y la tarima de la ceremonia */}
          <Bandera pos={[-2.6, 4.6, -4]} ancho={3.2} alto={1.7} map={bandera} s={s} />
          <Banderines de={[-3.6, 6.5, -6]} a={[2.6, 3.8, 0.8]} n={18} caida={0.9} />
          <Banderines de={[-3.6, 6.5, -6]} a={[-6, 4, 2]} n={10} caida={0.5} />
          <Banderines de={[2.6, 3.8, 0.8]} a={[2.6, 3.8, -6.6]} n={14} caida={0.5} />
          <group position={[-1.6, 0, -4.2]}>
            <TCaja t={[3, 0.3, 1.6]} pos={[0, 0.15, 0]} map={viga} color="#9a6a40" />
            {[0, 1, 2, 3, 4].map((i) => (
              <Pieza key={i} forma={{ f: "caja", t: [0.6, 0.28, 0.02] }} color={["#b3202f", "#f4f2ec", "#1c2a5a"][i % 3]} pos={[-1.2 + i * 0.6, 0.15, 0.81]} />
            ))}
          </group>
          {Array.from({ length: 10 }, (_, i) => {
            const t = ((f * 0.7 + i * 23) % 120) / 120;
            return <Pieza key={i} forma={{ f: "caja", t: [0.06, 0.06, 0.005] }} color={["#ffd166", "#b3202f", "#f4f2ec", "#3a7ae0"][i % 4]} basica pos={[-3 + R(s, "cf", i) * 6, 6 - t * 6, -3 + R(s, "cfz", i) * 6]} rot={[f * 0.1 + i, i, 0]} />;
          })}
        </group>
      )}
    </group>
  );
};
const Astillero: React.FC<{ s: number }> = ({ s }) => <AstilleroBase s={s} />;
const AstilleroFiesta: React.FC<{ s: number }> = ({ s }) => <AstilleroBase s={s} fiesta />;

// ================================================================ AULA (Paterson, noche de invierno de 1875)
export const Pupitre: React.FC<{ pos: V3; s: number; i: number }> = ({ pos, s, i }) => {
  const mad = texMadera(26, 40, 36, 3);
  return (
    <group position={pos}>
      <TCaja t={[0.9, 0.05, 0.5]} pos={[0, 0.72, 0]} rot={[-0.12, 0, 0]} map={mad} color="#a07a50" />
      {[-0.4, 0.4].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.05, 0.72, 0.45] }} color="#2a2a2e" pos={[x, 0.36, 0]} metal={0.5} />
      ))}
      <TCaja t={[0.9, 0.05, 0.3]} pos={[0, 0.42, 0.45]} map={mad} color="#8a6a44" />
      {/* pizarrita y tintero */}
      <Pieza forma={{ f: "caja", t: [0.3, 0.012, 0.22] }} color="#2a3430" pos={[-0.15 + R(s, "pz", i) * 0.1, 0.76, 0]} rot={[-0.12, R(s, "pr", i) * 0.4, 0]} />
      <Pieza forma={{ f: "tubo", r: 0.025, h: 0.04 }} color="#1a1a30" pos={[0.3, 0.77, -0.15]} />
    </group>
  );
};

const Aula: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texMadera(28, 40, 34, 10, [3, 3]);
  const pared = texPiedra(36, 18, 70, 12, 4, [3, 1]);
  const zocalo = texMadera(24, 44, 26, 10, [4, 1]);
  const pizarra = texPizarraAula();
  const plano = texPlanoSub();
  const carta = texCartaRechazo();
  const nieve = texNocheNieve();
  const W = 11, D = 9, H = 4;
  return (
    <group>
      <Ambiente niebla={["#140e0a", 14, 40]} fondo="#0c0806" />
      <hemisphereLight args={["#ffd8b0", "#120c08", 0.28]} />
      <ambientLight intensity={0.08} color="#ffe0c0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={pared} color="#d8c8a8" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} color="#d8c8a8" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} color="#d8c8a8" />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={pared} color="#d8c8a8" />
      {/* zócalo de madera alrededor */}
      <TPlano w={W} h={1} pos={[0, 0.5, -5.48]} map={zocalo} />
      <TPlano w={D} h={1} pos={[-W / 2 + 0.02, 0.5, -1]} rot={[0, Math.PI / 2, 0]} map={zocalo} />
      <TPlano w={D} h={1} pos={[W / 2 - 0.02, 0.5, -1]} rot={[0, -Math.PI / 2, 0]} map={zocalo} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#4a3a2a" pos={[0, H, -1]} />
      {/* la pizarra con el submarino a tiza, su marco y la repisa */}
      <group position={[0, 0, -5.45]}>
        <TPlano w={5.6} h={2.4} pos={[0, 2.2, 0.03]} map={pizarra} brillo={0.12} />
        <Pieza forma={{ f: "caja", t: [5.8, 0.1, 0.08] }} color="#4a2c14" pos={[0, 3.45, 0.04]} />
        <Pieza forma={{ f: "caja", t: [5.8, 0.08, 0.2] }} color="#4a2c14" pos={[0, 0.98, 0.1]} />
        {[-1.8, -0.6, 1.1].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.1, 0.025, 0.025] }} color="#f4f2ea" pos={[x, 1.03, 0.12]} />
        ))}
        {/* reloj de pared y la bandera de 37 estrellas */}
        <group position={[3.6, 3.1, 0.06]}>
          <Pieza forma={{ f: "tubo", r: 0.3, h: 0.08 }} color="#4a2c14" rot={[Math.PI / 2, 0, 0]} />
          <Pieza forma={{ f: "disco", r: 0.25 }} color="#f4eedc" pos={[0, 0, 0.05]} />
          <Pieza forma={{ f: "caja", t: [0.02, 0.18, 0.01] }} color="#1a1a1a" pos={[0, 0.07, 0.06]} />
          <Pieza forma={{ f: "caja", t: [0.14, 0.02, 0.01] }} color="#1a1a1a" pos={[0.06, 0, 0.06]} rot={[0, 0, (f * 0.002) % 6.28]} />
        </group>
        <Bandera pos={[-4.2, 3, 0.15]} ancho={1.2} alto={0.7} map={texBanderaEEUU(37)} s={s} mastil={false} />
      </group>
      {/* mesa del maestro: la lámpara de aceite, la carta para la Marina, el plano, tintero y pluma, maqueta */}
      <group position={[1.4, 0, -3.3]}>
        <TCaja t={[2.2, 0.08, 1]} pos={[0, 0.8, 0]} map={texMadera(22, 50, 28, 4)} color="#a06a40" />
        <TCaja t={[2.1, 0.7, 0.9]} pos={[0, 0.42, 0]} map={texMadera(22, 46, 24, 4)} color="#8a5a34" />
        <LamparaAceite pos={[-0.75, 0.84, -0.15]} s={s} luz={7} />
        <TPlano w={0.9} h={0.56} pos={[0.2, 0.845, 0.05]} rot={[-Math.PI / 2, 0, 0.1]} map={plano} />
        <TPlano w={0.3} h={0.4} pos={[-0.25, 0.85, 0.2]} rot={[-Math.PI / 2, 0, -0.2]} map={carta} />
        <Pieza forma={{ f: "caja", t: [0.32, 0.005, 0.18] }} color="#e8dcc0" pos={[0.75, 0.85, 0.25]} rot={[0, 0.3, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.03, h: 0.06 }} color="#141420" pos={[0.75, 0.87, -0.2]} />
        <Pieza forma={{ f: "tubo", r: 0.004, h: 0.22 }} color="#f4f0e0" pos={[0.78, 0.94, -0.2]} rot={[0.4, 0, 0.3]} />
        {/* maqueta de madera del submarino sobre su soporte */}
        <group position={[0.3, 0.9, -0.3]} scale={0.6}>
          <Holland3D helice={false} />
          <Pieza forma={{ f: "caja", t: [0.04, 0.1, 0.04] }} color="#4a2c14" pos={[0, -0.12, 0]} />
        </group>
        {[-0.3, 0.3].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.12 + (x > 0 ? 0.04 : 0), 0.3, 0.22] }} color={x > 0 ? "#6a1a22" : "#1a3a6a"} pos={[-0.95 + x * 0.3, 0.99, 0.3]} rot={[0, 0.2, 0.1]} />
        ))}
      </group>
      {/* pupitres de los alumnos en filas */}
      {[[-2.6, -1.2], [-1.3, -1.2], [-2.6, 0.4], [-1.3, 0.4], [3.4, 0.4], [3.4, -1.2]].map(([x, z], i) => (
        <Pupitre key={i} pos={[x, 0, z]} s={s} i={i} />
      ))}
      {/* estufa de hierro con el fuego que se ve por la puerta y el tubo hasta el techo */}
      <group position={[-4.3, 0, -3.8]}>
        <Pieza forma={{ f: "tubo", r: 0.4, r2: 0.36, h: 1.1 }} color="#1e1e22" pos={[0, 0.65, 0]} metal={0.6} rugoso={0.5} />
        <Pieza forma={{ f: "tubo", r: 0.12, h: 2.4 }} color="#1e1e22" pos={[0, 2.4, 0]} metal={0.6} />
        <Pieza forma={{ f: "caja", t: [0.36, 0.3, 0.04] }} color="#ff8a3a" brillo="#ff6a1a" intensidad={2} basica pos={[0.28, 0.55, 0.27]} rot={[0, 0.8, 0]} />
        <Resplandor pos={[0.35, 0.55, 0.35]} r={0.8} color="#ff7a2a" o={0.3 * (0.85 + 0.15 * Math.sin(f * 0.5))} />
        <pointLight position={[0.6, 0.6, 0.6]} intensity={5 * (0.85 + 0.15 * Math.sin(f * 0.5))} distance={6} color="#ff7a30" />
        {[0, 1, 2].map((i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.06, h: 0.5 }} color="#5a3a1e" pos={[0.7, 0.06 + i * 0.12, 0.4 - i * 0.05]} rot={[0, i, Math.PI / 2]} />
        ))}
      </group>
      {/* ventanas con la noche nevada (luz fría) */}
      <VentanaVista pos={[W / 2 - 0.05, 2, -2.6]} rot={[0, -Math.PI / 2, 0]} ancho={1.5} alto={2} map={nieve} intensidad={4} />
      <VentanaVista pos={[W / 2 - 0.05, 2, 0.6]} rot={[0, -Math.PI / 2, 0]} ancho={1.5} alto={2} map={nieve} intensidad={3} />
      {/* globo, estantería con libros y el mapa enrollado */}
      <Globo pos={[3.6, 0, -4.6]} s={s} />
      <group position={[-W / 2 + 0.25, 0, -0.6]} rotation={[0, Math.PI / 2, 0]}>
        <TCaja t={[2.2, 2.2, 0.4]} pos={[0, 1.1, 0]} map={texMadera(22, 44, 26, 4)} color="#7a5232" />
        {[0.5, 1.0, 1.5, 2.0].map((y, j) =>
          Array.from({ length: 12 }, (_, i) => <Pieza key={`${j}${i}`} forma={{ f: "caja", t: [0.12, 0.3, 0.26] }} color={["#7a1a22", "#1a3a6a", "#2a5a2a", "#8a6a2a", "#3a2a1a"][(i + j) % 5]} pos={[-0.95 + i * 0.16, y - 0.2, 0.12]} />),
        )}
      </group>
      {/* lámpara de techo de queroseno */}
      <Farol pos={[-1.6, H, -0.8]} s={s} cadena={0.8} luz={4} />
    </group>
  );
};

// ================================================================ MINISTERIO (despacho de la Marina, Washington 1875)
const Ministerio: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texMadera(18, 46, 26, 12, [3, 3]);
  const alfombra = texAlfombra("#1c2a5a", "#c99a3a", "#101830");
  const pared = texMadera(16, 50, 22, 14, [3, 1]);
  const carta = texCartaRechazo();
  const W = 11, D = 9, H = 4.4;
  return (
    <group>
      <Ambiente niebla={["#1a120c", 14, 44]} fondo="#0e0a08" />
      <hemisphereLight args={["#ffdcb0", "#1a120a", 0.35]} />
      <ambientLight intensity={0.1} color="#ffe0c0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={5} h={4} pos={[0, 0.01, -2]} rot={[-Math.PI / 2, 0, 0]} map={alfombra} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={pared} color="#9a6a50" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} color="#9a6a50" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} color="#9a6a50" />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={pared} color="#9a6a50" />
      <Pieza forma={{ f: "caja", t: [W, 0.12, D] }} color="#2a1a12" pos={[0, H, -1]} />
      {/* cornisa dorada */}
      <Pieza forma={{ f: "caja", t: [W, 0.12, 0.12] }} {...LATON} pos={[0, H - 0.3, -5.44]} />
      {/* ventanal con la cúpula del Capitolio al atardecer (luz cálida que entra) */}
      <group position={[0, 2.3, -5.46]}>
        <mesh>
          <planeGeometry args={[2.4, 2.8]} />
          <meshBasicMaterial color="#f2a868" />
        </mesh>
        <group position={[0.2, -0.7, 0.01]}>
          <Pieza forma={{ f: "caja", t: [1.8, 0.4, 0.01] }} color="#5a3a3a" basica />
          <Pieza forma={{ f: "bola", r: 0.35, seg: 16 }} esc={[1, 0.9, 0.02]} color="#6a4444" basica pos={[0, 0.45, 0]} />
          <Pieza forma={{ f: "caja", t: [0.05, 0.3, 0.01] }} color="#6a4444" basica pos={[0, 0.9, 0]} />
        </group>
        {[-1.2, 0, 1.2].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.08, 2.9, 0.12] }} color="#f2ead8" pos={[x, 0, 0.05]} />
        ))}
        {[-1.4, 0, 1.4].map((y) => (
          <Pieza key={y} forma={{ f: "caja", t: [2.5, 0.08, 0.12] }} color="#f2ead8" pos={[0, y, 0.05]} />
        ))}
        {[-1, 1].map((l) => (
          <Pieza key={l} forma={{ f: "caja", t: [0.7, 3.3, 0.06] }} color="#7a1a22" pos={[l * 1.6, 0.1, 0.12]} />
        ))}
        <pointLight position={[0, 0, 1.2]} intensity={7} distance={9} color="#ffb070" />
      </group>
      <Haz pos={[0, 3.2, -5]} rot={[-0.9, 0, 0]} largo={5} ancho={1.4} color="#ffc080" o={0.05} />
      {/* el gran escritorio de caoba con la carta «REJECTED», el tintero, el sello y la campanilla */}
      <group position={[0, 0, -3.4]}>
        <TCaja t={[2.8, 0.1, 1.2]} pos={[0, 0.82, 0]} map={texMadera(14, 56, 24, 4)} color="#a05a3a" />
        <TCaja t={[2.7, 0.75, 1.1]} pos={[0, 0.42, 0]} map={texMadera(14, 52, 20, 4)} color="#8a4a2e" />
        <TPlano w={0.4} h={0.54} pos={[0.2, 0.875, 0.15]} rot={[-Math.PI / 2, 0, -0.15]} map={carta} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.12 }} color="#6a4a2a" pos={[-0.3, 0.93, 0.2]} />
        <Pieza forma={{ f: "caja", t: [0.12, 0.05, 0.08] }} color="#c0202a" pos={[0.7, 0.9, 0.2]} />
        <Pieza forma={{ f: "bola", r: 0.06, seg: 12 }} esc={[1, 0.7, 1]} {...LATON} pos={[-0.9, 0.9, 0.25]} />
        <Pieza forma={{ f: "caja", t: [0.5, 0.18, 0.35] }} color="#3a1a14" pos={[-0.9, 0.96, -0.3]} />
        <LamparaAceite pos={[1.1, 0.87, -0.3]} s={s} luz={5} />
        {/* sillón de cuero */}
        <group position={[0, 0, -0.9]}>
          <Pieza forma={{ f: "caja", t: [0.9, 0.5, 0.8] }} color="#5a1a14" pos={[0, 0.25, 0]} rugoso={0.5} />
          <Pieza forma={{ f: "caja", t: [0.9, 1.1, 0.2] }} color="#5a1a14" pos={[0, 0.95, -0.35]} rugoso={0.5} />
        </group>
      </group>
      {/* cuadros de barcos de guerra y retrato */}
      <Cuadro pos={[-3.6, 2.4, -5.42]} ancho={1.8} alto={1.2} map={texCuadroBarco(1)} />
      <Cuadro pos={[3.6, 2.4, -5.42]} ancho={1.8} alto={1.2} map={texCuadroBarco(2)} />
      <Cuadro pos={[-W / 2 + 0.06, 2.4, -2.4]} rot={[0, Math.PI / 2, 0]} ancho={1.6} alto={1.1} map={texCuadroBarco(3)} />
      {/* banderas a los lados del ventanal */}
      <Bandera pos={[-2.1, 2.6, -5]} ancho={1.1} alto={0.65} map={texBanderaEEUU(37)} s={s} />
      {/* vitrina con la maqueta de la fragata */}
      <group position={[3.9, 0, -3.8]}>
        <Pieza forma={{ f: "caja", t: [1.6, 0.9, 0.7] }} color="#4a2a1a" pos={[0, 0.45, 0]} />
        <Pieza forma={{ f: "caja", t: [1.5, 0.8, 0.6] }} color="#dfefff" opacidad={0.18} pos={[0, 1.3, 0]} />
        <Pieza forma={{ f: "caja", t: [1.1, 0.14, 0.2] }} color="#2a1a10" pos={[0, 1.0, 0]} />
        {[-0.3, 0.05, 0.4].map((x) => (
          <group key={x}>
            <Pieza forma={{ f: "tubo", r: 0.012, h: 0.6 }} color="#2a1a10" pos={[x, 1.35, 0]} />
            <Pieza forma={{ f: "caja", t: [0.26, 0.18, 0.01] }} color="#f2ead0" pos={[x, 1.38, 0.02]} />
          </group>
        ))}
      </group>
      {/* mesita con la pecera de cristal (aquí cae la bola de acero) */}
      <group position={[-2.6, 0, -2.2]}>
        <Pieza forma={{ f: "tubo", r: 0.4, h: 0.06 }} color="#6a3a22" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.8 }} color="#4a2a1a" pos={[0, 0.4, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.3, h: 0.04 }} color="#4a2a1a" pos={[0, 0.02, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.3, h: 0.5, abierto: true }} color="#dff2ff" opacidad={0.25} pos={[0, 1.08, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.29, h: 0.42 }} color="#4aa8d8" opacidad={0.45} brillo="#1a6aa0" intensidad={0.3} pos={[0, 1.04, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.29, h: 0.03 }} color="#d8c890" pos={[0, 0.85, 0]} />
        <Resplandor pos={[0, 1.05, 0]} r={0.4} color="#7ad0ff" o={0.12} />
        {[0, 1].map((i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.03, seg: 8 }} esc={[1.6, 1, 0.6]} color="#f2902a" pos={[Math.cos(f * 0.04 + i * 3) * 0.17, 1.0 + i * 0.1, Math.sin(f * 0.04 + i * 3) * 0.17]} rot={[0, -f * 0.04 - i * 3, 0]} />
        ))}
      </group>
      {/* araña de gas en el techo y apliques */}
      <group position={[0, H - 0.4, -2]}>
        <Pieza forma={{ f: "tubo", r: 0.02, h: 0.4 }} {...LATON} pos={[0, 0.2, 0]} />
        <Pieza forma={{ f: "aro", r: 0.45, g: 0.03 }} {...LATON} rot={[Math.PI / 2, 0, 0]} />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[Math.cos((i / 6) * 6.28) * 0.45, 0.08, Math.sin((i / 6) * 6.28) * 0.45]}>
            <Pieza forma={{ f: "bola", r: 0.06, seg: 10 }} color="#fff0c8" brillo="#ffc070" intensidad={1.3} basica />
            <Resplandor pos={[0, 0, 0]} r={0.22} color="#ffb860" o={0.25} />
          </group>
        ))}
        <pointLight position={[0, -0.2, 0]} intensity={6} distance={9} color="#ffc070" />
      </group>
      {/* telescopio de latón junto a la ventana */}
      <group position={[2.2, 0, -4.6]}>
        {[0, 2.1, 4.2].map((a) => (
          <Pieza key={a} forma={{ f: "tubo", r: 0.02, h: 1.3 }} color="#3a2414" pos={[Math.cos(a) * 0.2, 0.62, Math.sin(a) * 0.2]} rot={[Math.sin(a) * 0.3, 0, -Math.cos(a) * 0.3]} />
        ))}
        <Pieza forma={{ f: "tubo", r: 0.06, r2: 0.04, h: 1 }} {...LATON} pos={[0, 1.35, 0]} rot={[0.3, 0, 1.2]} />
      </group>
    </group>
  );
};

// ================================================================ GUARIDA (trastienda de los fenianos, Nueva York)
const Guarida: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texLosas(30, 14, 30, [3, 3]);
  const ladrillo = texLadrillo(8, [4, 2]);
  const verde = texBanderaVerde();
  const mapa = texMapaBritanico();
  const billetes = texBilletes();
  const W = 10, D = 8.5, H = 3.4;
  return (
    <group>
      <Ambiente niebla={["#100c08", 10, 34]} fondo="#080604" />
      <hemisphereLight args={["#ffc890", "#0a0806", 0.2]} />
      <ambientLight intensity={0.06} color="#ffd0a0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.25]} map={ladrillo} />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={ladrillo} />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={ladrillo} />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.25]} rot={[0, Math.PI, 0]} map={ladrillo} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#1a120c" pos={[0, H, -1]} />
      {[-3.5, -1.2, 1.1].map((z) => (
        <TCaja key={z} t={[W, 0.22, 0.26]} pos={[0, H - 0.12, z]} map={texMadera(20, 40, 16, 3)} />
      ))}
      {/* la bandera verde con el arpa, clavada en la pared del fondo */}
      <group position={[-1.6, 2.1, -5.2]}>
        <TPlano w={2.2} h={1.45} map={verde} />
        {[-1.1, 1.1].map((x) => (
          <Pieza key={x} forma={{ f: "bola", r: 0.04, seg: 8 }} {...LATON} pos={[x, 0.72, 0.02]} />
        ))}
      </group>
      {/* el mapa de las islas británicas con los buques tachados en rojo y las chinchetas */}
      <group position={[1.8, 2, -5.2]}>
        <Pieza forma={{ f: "caja", t: [1.8, 1.8, 0.04] }} color="#5a3a1e" />
        <TPlano w={1.7} h={1.7} pos={[0, 0, 0.025]} map={mapa} />
        {Array.from({ length: 6 }, (_, i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.03, seg: 8 }} color="#d02020" pos={[(R(s, "chx", i) - 0.5) * 1.4, (R(s, "chy", i) - 0.5) * 1.4, 0.05]} />
        ))}
        <Pieza forma={{ f: "tubo", r: 0.004, h: 1.2 }} color="#d02020" pos={[0.1, 0, 0.05]} rot={[0, 0, 1]} />
      </group>
      {/* mesa redonda con fajos de dólares, monedas, la caja fuerte abierta, whisky y velas en botellas */}
      <group position={[0, 0, -2.6]}>
        <Pieza forma={{ f: "tubo", r: 0.95, h: 0.07, seg: 28 }} color="#5a3418" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.08, h: 0.78 }} color="#3a2410" pos={[0, 0.4, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.4, h: 0.05 }} color="#3a2410" pos={[0, 0.03, 0]} />
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} position={[-0.5 + (i % 3) * 0.32, 0.84 + Math.floor(i / 3) * 0.06, -0.1 + (i % 2) * 0.12]} rotation={[0, R(s, "fj", i) * 0.6 - 0.3, 0]}>
            <TCaja t={[0.3, 0.06, 0.14]} map={billetes} color="#e8f0d8" />
            <Pieza forma={{ f: "caja", t: [0.04, 0.065, 0.145] }} color="#c8a86a" />
          </group>
        ))}
        <Monedas pos={[0.45, 0.84, 0.3]} n={14} radio={0.18} alto={0.06} s={s} />
        <group position={[0.5, 0.84, -0.35]} rotation={[0, -0.5, 0]}>
          <Pieza forma={{ f: "caja", t: [0.5, 0.36, 0.4] }} color="#2a2e2a" pos={[0, 0.18, 0]} metal={0.7} rugoso={0.4} />
          <Pieza forma={{ f: "caja", t: [0.5, 0.36, 0.04] }} color="#3a3e3a" pos={[0.18, 0.18, 0.34]} rot={[0, -1.1, 0]} metal={0.7} />
          <Pieza forma={{ f: "tubo", r: 0.05, h: 0.02 }} {...LATON} pos={[0, 0.2, 0.21]} rot={[Math.PI / 2, 0, 0]} />
          <TCaja t={[0.3, 0.12, 0.14]} pos={[0, 0.08, 0.05]} map={billetes} color="#e8f0d8" />
        </group>
        <Vela pos={[-0.55, 0.84, 0.35]} s={s} luz={4} botella="#2a5a2a" />
        <Vela pos={[0.1, 0.84, -0.55]} s={s + 1} luz={3} botella="#5a3a1a" />
        <Botella pos={[-0.15, 0.84, 0.45]} color="#8a5a1a" alto={0.34} />
        {/* periódico con la noticia */}
        <Pieza forma={{ f: "caja", t: [0.5, 0.004, 0.36] }} color="#e8e0c8" pos={[-0.2, 0.845, 0.1]} rot={[0, 0.4, 0]} />
      </group>
      {/* sillas toscas */}
      {[[-1.3, -2.2, 0.6], [1.3, -2.0, -0.6], [0, -1.2, 0]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation={[0, r, 0]}>
          <Pieza forma={{ f: "caja", t: [0.45, 0.05, 0.45] }} color="#4a2c16" pos={[0, 0.46, 0]} />
          {[[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]].map(([a, b], k) => (
            <Pieza key={k} forma={{ f: "tubo", r: 0.025, h: 0.46 }} color="#3a2210" pos={[a, 0.23, b]} />
          ))}
        </group>
      ))}
      {/* caja de rifles, barriles de cerveza negra y sacos */}
      <group position={[-4, 0, -4.2]}>
        <Caja pos={[0, 0, 0]} tam={0.8} />
        {[-0.2, 0, 0.2].map((x) => (
          <Pieza key={x} forma={{ f: "tubo", r: 0.025, h: 1.3 }} color="#3a2a1a" pos={[x, 1.2, 0]} rot={[0, 0, 0.2]} />
        ))}
      </group>
      <Barril pos={[4.1, 0, -4.4]} />
      <Barril pos={[4.2, 0, -3.5]} rot={[Math.PI / 2, 0.4, 0]} />
      <Barril pos={[3.4, 0, -4.6]} />
      {/* ventana a la calle de noche con la farola */}
      <Ventana pos={[W / 2 - 0.05, 1.8, -1]} rot={[0, -Math.PI / 2, 0]} ancho={1.2} alto={1.4} cielo="#1a2a4a" />
      <pointLight position={[W / 2 - 1, 1.8, -1]} intensity={3} distance={5} color="#7a9ad8" />
      {/* farol colgado sobre la mesa: la luz cálida de la conspiración */}
      <Farol pos={[0, H, -2.6]} s={s} cadena={0.7} luz={7} />
      <Humo pos={[0.5, 1.4, -2.2]} s={s} color="#3a3430" tam={0.4} />
      {/* polvo en el aire */}
      {Array.from({ length: 14 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.012, seg: 4 }} color="#ffd8a0" basica pos={[(R(s, "px", i) - 0.5) * 3, 1 + ((f * 0.004 + R(s, "py", i)) % 1) * 1.8, -2.6 + (R(s, "pz", i) - 0.5) * 2]} />
      ))}
    </group>
  );
};

// ================================================================ CANAL (dársena del canal Morris, Jersey City, 1883)
const Canal: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const tablas = texMadera(24, 22, 26, 10, [3, 7]);
  const ladrillo = texLadrillo(10, [5, 2]);
  return (
    <group>
      <Ambiente niebla={["#0e1628", 24, 220]} fondo="#060a16" />
      <Cielo arriba="#03060e" medio="#1a2a4a" abajo="#060c18" radio={330} />
      <Estrellas s={s} n={200} />
      <Luna pos={[70, 70, -220]} r={9} />
      <hemisphereLight args={["#6a8ad8", "#060a14", 0.42]} />
      <directionalLight position={[60, 60, -100]} intensity={0.8} color="#a8c0ff" />
      <Mar y={-1} color="#101e34" amp={0.12} ola={1.3} brillo={0.15} tam={900} />
      {/* reflejo de la luna en el agua */}
      {Array.from({ length: 12 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [2 + R(s, "rl", i) * 4, 0.01, 0.3] }} color="#c8d8ff" opacidad={0.25 + 0.15 * Math.sin(f * 0.1 + i)} basica pos={[22 + Math.sin(i) * 3, -0.95, -40 - i * 14]} />
      ))}
      {/* el muelle de la dársena y la grada inclinada que baja al agua */}
      <TPlano w={7} h={14} pos={[-1, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={tablas} />
      <TCaja t={[7, 0.3, 14]} pos={[-1, -0.16, -1]} map={tablas} color="#5a4a40" />
      {Array.from({ length: 7 }, (_, i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.15, h: 2.2 }} color="#2a2018" pos={[2.5, -1, 5 - i * 2]} />
      ))}
      <group position={[4.6, -0.5, -2.6]} rotation={[0, 0, -0.18]}>
        {[-0.6, 0.6].map((z) => (
          <TCaja key={z} t={[5, 0.2, 0.25]} pos={[0, 0, z]} map={tablas} color="#6a5040" />
        ))}
        {[-1.6, 0, 1.6].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.3, 0.5, 1.5] }} color="#4a3220" pos={[x, 0.25, 0]} />
        ))}
      </group>
      {/* almacenes de ladrillo de la dársena con un par de ventanas encendidas */}
      {[[-7, -9, 8, 6], [-7, -18, 8, 8], [8, -24, 10, 7]].map(([x, z, w, h], i) => (
        <group key={i} position={[x, 0, z]}>
          <TCaja t={[w, h, 8]} pos={[0, h / 2, 0]} map={ladrillo} color="#7a6070" />
          <Pieza forma={{ f: "caja", t: [w + 0.4, 0.3, 8.4] }} color="#141418" pos={[0, h + 0.15, 0]} />
          {Array.from({ length: 6 }, (_, k) => (
            <Pieza key={k} forma={{ f: "caja", t: [0.05, 1.1, 0.9] }} color={k === 2 && i === 0 ? "#ffcf7a" : "#141a2a"} brillo={k === 2 && i === 0 ? "#ffa040" : undefined} intensidad={1.2} basica={k === 2 && i === 0} pos={[w / 2 + 0.03, 1.5 + (k % 2) * 2.4, -2.6 + Math.floor(k / 2) * 2.6]} />
          ))}
        </group>
      ))}
      <Letrero texto="MORRIS CANAL BASIN" pos={[-2.95, 4.6, -9]} rot={[0, Math.PI / 2, 0]} ancho={5} alto={0.7} fondo="#2a2a2a" tinta="#e8e0c8" />
      {/* farola de gas, cajas, barriles y redes */}
      <Farola pos={[-2.8, 0, -0.5]} s={s} luz={8} />
      <Caja pos={[-3.4, 0, 2.6]} tam={0.8} rot={[0, 0.2, 0]} />
      <Caja pos={[-3.6, 0.8, 2.5]} tam={0.6} rot={[0, -0.3, 0]} />
      <Barril pos={[-2.6, 0, 3.4]} />
      <Bolardo pos={[2.2, 0, 1.6]} />
      <Bolardo pos={[2.2, 0, -4.4]} />
      {/* el remolcador que se lo va a llevar, con su chimenea humeando y las luces */}
      <group position={[11, -1, -12]} rotation={[0, -0.4, 0]}>
        <Pieza forma={{ f: "caja", t: [9, 1.6, 3] }} color="#2a1e1a" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "caja", t: [3, 1.8, 2.4] }} color="#4a3a30" pos={[0.5, 2.5, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.45, h: 3 }} color="#1a1a1a" pos={[-1.2, 3.8, 0]} />
        <Humo pos={[-1.2, 5.3, 0]} s={s} color="#3a3a44" tam={1.2} />
        <Pieza forma={{ f: "caja", t: [0.6, 0.5, 0.05] }} color="#ffcf7a" basica pos={[0.6, 2.6, 1.22]} />
        <Resplandor pos={[0.6, 2.6, 1.3]} r={0.8} color="#ffb060" o={0.3} />
        <pointLight position={[0.6, 2.6, 2]} intensity={6} distance={10} color="#ffb060" />
        <Pieza forma={{ f: "bola", r: 0.12, seg: 8 }} color="#ff3030" basica pos={[4.2, 2.2, 1.5]} />
        <Pieza forma={{ f: "bola", r: 0.12, seg: 8 }} color="#30ff60" basica pos={[4.2, 2.2, -1.5]} />
      </group>
      {/* bote de remos amarrado */}
      <group position={[3.6, -0.9, 3]} rotation={[0, 0.3, 0]}>
        <Pieza forma={{ f: "bola", r: 0.8, seg: 16 }} esc={[2.4, 0.4, 0.9]} color="#5a3a24" />
        <Pieza forma={{ f: "tubo", r: 0.03, h: 2.4 }} color="#8a6a44" pos={[0, 0.35, 0.3]} rot={[0, 0, 1.4]} />
      </group>
      {/* faroles de los ladrones en el suelo */}
      <Farol pos={[1.2, 0.6, -3.2]} s={s} cadena={0} luz={5} />
      {/* Manhattan al otro lado del río */}
      <Ciudad pos={[40, -1, -260]} s={s + 5} ancho={300} n={44} color="#141a2a" />
      {/* niebla baja sobre el agua */}
      {Array.from({ length: 6 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [30, 0.6, 6] }} color="#4a5a7a" opacidad={0.08} basica pos={[10 + Math.sin(f * 0.005 + i) * 4, -0.6, -20 - i * 12]} />
      ))}
    </group>
  );
};

// ================================================================ TALLER (el tanque de pruebas de Holland)
const Taller: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texLosas(28, 10, 36, [3, 3]);
  const ladrillo = texLadrillo(14, [4, 2]);
  const pizarra = texPizarraTaller();
  const plano = texPlanoSub();
  const W = 11, D = 9, H = 4.6;
  // el tanque de cristal: centro x 0.6, z -2.2, fondo a 0.6 m, agua hasta 2.05 m
  const TX = 0.6, TZ = -2.2, TB = 0.6, TA = 2.05;
  return (
    <group>
      <Ambiente niebla={["#120e0c", 14, 44]} fondo="#0a0806" />
      <hemisphereLight args={["#ffd8b0", "#100c08", 0.3]} />
      <ambientLight intensity={0.08} color="#ffe0c0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={ladrillo} />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={ladrillo} />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={ladrillo} />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={ladrillo} />
      {/* cerchas de hierro del techo */}
      {[-4, -1.5, 1].map((z) => (
        <group key={z}>
          <Pieza forma={{ f: "caja", t: [W, 0.15, 0.15] }} color="#2a2a2e" pos={[0, H - 0.1, z]} metal={0.6} />
          {[-1, 1].map((l) => (
            <Pieza key={l} forma={{ f: "caja", t: [W / 2 + 0.3, 0.1, 0.1] }} color="#2a2a2e" pos={[l * W * 0.25, H + 0.6, z]} rot={[0, 0, -l * 0.22]} metal={0.6} />
          ))}
        </group>
      ))}
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#1a1612" pos={[0, H + 1.2, -1]} />
      {/* EL TANQUE: soporte de hierro, cristal, agua azul que brilla, burbujitas y el reflejo en el techo */}
      <group position={[TX, 0, TZ]}>
        <Pieza forma={{ f: "caja", t: [3, TB, 1.4] }} color="#2a2a30" pos={[0, TB / 2, 0]} metal={0.6} rugoso={0.5} />
        <Pieza forma={{ f: "caja", t: [2.9, TA - TB - 0.02, 1.3] }} color="#1a6aa8" opacidad={0.4} brillo="#0a3a7a" intensidad={0.5} pos={[0, (TA + TB) / 2, 0]} />
        <Pieza forma={{ f: "caja", t: [2.9, 0.012, 1.3] }} color="#bfe8ff" opacidad={0.5} basica pos={[0, TA, 0]} />
        <Pieza forma={{ f: "caja", t: [3, 1.75, 1.4] }} color="#e8f6ff" opacidad={0.05} pos={[0, TB + 0.87, 0]} />
        {[[-1.5, -0.7], [1.5, -0.7], [-1.5, 0.7], [1.5, 0.7]].map(([x, z], i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.06, 1.8, 0.06] }} color="#3a3a40" pos={[x, TB + 0.9, z]} metal={0.7} />
        ))}
        {[TB + 0.02, TB + 1.78].map((y) => (
          <Pieza key={y} forma={{ f: "caja", t: [3.06, 0.05, 0.06] }} color="#3a3a40" pos={[0, y, 0.7]} metal={0.7} />
        ))}
        {/* arena del fondo y una regla de profundidad pintada */}
        <Pieza forma={{ f: "caja", t: [2.9, 0.04, 1.3] }} color="#c8b080" pos={[0, TB + 0.03, 0]} />
        {Array.from({ length: 6 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [i % 2 ? 0.08 : 0.16, 0.015, 0.01] }} color="#f4f2ea" basica pos={[-1.38, TB + 0.2 + i * 0.25, 0.66]} />
        ))}
        <Resplandor pos={[0, 1.4, 0.7]} r={1.4} color="#3aa8ff" o={0.12} />
        <pointLight position={[0, 1.4, 1.2]} intensity={4} distance={5} color="#5ab8ff" />
        {Array.from({ length: 12 }, (_, i) => {
          const t = ((f * 0.9 + i * 17) % 90) / 90;
          return <Pieza key={i} forma={{ f: "bola", r: 0.012, seg: 6 }} color="#e8f8ff" opacidad={0.7} basica pos={[(R(s, "tb", i) - 0.5) * 2.6, TB + 0.1 + t * (TA - TB - 0.1), (R(s, "tbz", i) - 0.5) * 1.1]} />;
        })}
        {/* manguera de aire del compresor que entra al tanque */}
        <Pieza forma={{ f: "tubo", r: 0.03, h: 2.2 }} color="#2a2a2a" pos={[1.9, 1.9, 0.2]} rot={[0, 0, 1.2]} />
      </group>
      {/* el compresor de aire con su calderín, manómetro y volante */}
      <group position={[3.6, 0, -2.6]}>
        <Pieza forma={{ f: "tubo", r: 0.45, h: 1.6 }} color="#6a2a22" pos={[0, 0.8, 0]} metal={0.5} rugoso={0.4} />
        <Pieza forma={{ f: "bola", r: 0.45, seg: 16 }} color="#6a2a22" pos={[0, 1.6, 0]} metal={0.5} />
        <group position={[0, 1.5, 0.46]}>
          <Pieza forma={{ f: "tubo", r: 0.14, h: 0.05 }} {...LATON} rot={[Math.PI / 2, 0, 0]} />
          <Pieza forma={{ f: "disco", r: 0.12 }} color="#f4eedc" pos={[0, 0, 0.03]} />
          <Pieza forma={{ f: "caja", t: [0.01, 0.1, 0.005] }} color="#c0202a" pos={[0, 0.03, 0.035]} rot={[0, 0, Math.sin(f * 0.05) * 0.8 - 0.4]} />
        </group>
        <group position={[0.7, 0.8, 0]} rotation={[0, 0, f * 0.15]}>
          <Pieza forma={{ f: "aro", r: 0.35, g: 0.03 }} color="#2a2a2e" rot={[0, Math.PI / 2, 0]} metal={0.7} />
          {[0, 1, 2].map((i) => (
            <Pieza key={i} forma={{ f: "caja", t: [0.03, 0.7, 0.03] }} color="#2a2a2e" rot={[(i * Math.PI) / 3, 0, 0]} metal={0.7} />
          ))}
        </group>
        {[0.3, 0.6, 0.9].map((y) => (
          <Pieza key={y} forma={{ f: "tubo", r: 0.025, h: 1.4 }} {...LATON} pos={[-0.6, y + 1, 0.2]} rot={[0, 0, Math.PI / 2]} />
        ))}
      </group>
      {/* banco de trabajo con herramientas, planos, la maqueta de madera y una lámpara */}
      <group position={[-3.4, 0, -3.4]}>
        <TCaja t={[2.6, 0.12, 1]} pos={[0, 0.9, 0]} map={texMadera(28, 40, 30, 4)} color="#9a7048" />
        {[[-1.2, -0.4], [1.2, -0.4], [-1.2, 0.4], [1.2, 0.4]].map(([x, z], i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.1, 0.9, 0.1] }} color="#4a3220" pos={[x, 0.45, z]} />
        ))}
        <TPlano w={1} h={0.62} pos={[0.3, 0.965, 0]} rot={[-Math.PI / 2, 0, 0.15]} map={plano} />
        <group position={[-0.6, 1.05, -0.15]} scale={0.7}>
          <Holland3D helice={false} />
        </group>
        <Pieza forma={{ f: "caja", t: [0.3, 0.04, 0.06] }} color="#5a5a60" pos={[0.9, 0.98, 0.3]} metal={0.8} />
        <Pieza forma={{ f: "tubo", r: 0.02, h: 0.3 }} color="#8a4a22" pos={[0.9, 0.98, 0.15]} rot={[Math.PI / 2, 0, 0.4]} />
        <Pieza forma={{ f: "caja", t: [0.2, 0.15, 0.15] }} color="#3a3a40" pos={[-1.1, 1.04, 0.2]} metal={0.7} />
        <LamparaAceite pos={[0.9, 0.96, -0.3]} s={s} luz={5} />
        {/* herramientas colgadas en el panel */}
        <Pieza forma={{ f: "caja", t: [2.4, 1.1, 0.05] }} color="#7a5a3a" pos={[0, 1.9, -0.48]} />
        {Array.from({ length: 7 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.05, 0.35 + (i % 3) * 0.1, 0.03] }} color={i % 2 ? "#6a6a70" : "#8a4a22"} pos={[-1 + i * 0.33, 1.9, -0.44]} metal={i % 2 ? 0.8 : 0} />
        ))}
      </group>
      {/* pizarra de la flotación en la pared del fondo */}
      <group position={[-2.6, 2.6, -5.44]}>
        <Pieza forma={{ f: "caja", t: [2.9, 2, 0.06] }} color="#4a2c14" />
        <TPlano w={2.7} h={1.8} pos={[0, 0, 0.035]} map={pizarra} brillo={0.12} />
      </group>
      {/* planos clavados, botellas de aire y cajas */}
      <TPlano w={1.4} h={0.9} pos={[2.4, 2.8, -5.46]} map={plano} />
      {[0, 1, 2].map((i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.14, h: 1.3 }} color="#2a4a3a" pos={[4.6 - i * 0.32, 0.65, -4.8]} metal={0.6} rugoso={0.4} />
      ))}
      <Caja pos={[-4.6, 0, 1]} tam={0.7} />
      <Barril pos={[-4.5, 0, 2.1]} />
      {/* lámparas de gas colgadas sobre el tanque */}
      <Farol pos={[-0.4, H, -1.8]} s={s} cadena={1.1} luz={6} />
      <Farol pos={[1.8, H, -1.2]} s={s + 3} cadena={1.2} luz={5} />
      {/* ventanal alto con la noche */}
      <Ventana pos={[W / 2 - 0.05, 2.6, 0.8]} rot={[0, -Math.PI / 2, 0]} ancho={1.6} alto={1.8} cielo="#1a2a4a" />
    </group>
  );
};

// ================================================================ BAHÍA (bajo el agua, pruebas de 1899)
const Bahia: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const arena = texLosas(38, 30, 52, [8, 8]);
  return (
    <group>
      <Ambiente niebla={["#1a5a5a", 6, 70]} fondo="#0e3a40" />
      <Cielo arriba="#5ac8c0" medio="#1a6a6a" abajo="#0a2a30" radio={120} />
      <hemisphereLight args={["#a8f0e0", "#0a2a2a", 0.7]} />
      <directionalLight position={[10, 40, 10]} intensity={1.1} color="#d8fff0" />
      <Rayos3D s={s} fuerza={1.4} alto={26} color="#d8fff0" />
      {/* la superficie vista desde abajo: brilla y se mueve */}
      <mesh position={[0, 14, -10]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[300, 300, 1, 1]} />
        <meshBasicMaterial color="#8ae8e0" transparent opacity={0.5} side={THREE.DoubleSide} />
      </mesh>
      {Array.from({ length: 30 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [3 + R(s, "sw", i) * 5, 0.02, 0.4] }} color="#e8fff8" opacidad={0.3 + 0.2 * Math.sin(f * 0.08 + i)} basica pos={[(R(s, "sx", i) - 0.5) * 60 + Math.sin(f * 0.02 + i) * 2, 13.9, -10 + (R(s, "sz", i) - 0.5) * 60]} rot={[0, R(s, "sr", i), 0]} />
      ))}
      {/* fondo de arena con ondas, rocas, hierba marina, ancla vieja y cadena */}
      <TPlano w={200} h={200} pos={[0, 0, -20]} rot={[-Math.PI / 2, 0, 0]} map={arena} color="#d8c898" />
      {Array.from({ length: 24 }, (_, i) => (
        <Pieza key={i} forma={{ f: "roca", r: 0.4 + R(s, "rr", i) * 1.6, s: i }} color={i % 3 ? "#4a5a50" : "#5a6a5a"} pos={[(R(s, "rx", i) - 0.5) * 50, 0, -4 - R(s, "rz", i) * 40]} esc={[1, 0.6, 1]} />
      ))}
      {Array.from({ length: 60 }, (_, i) => {
        const h = 0.6 + R(s, "hh", i) * 1.6;
        return <Pieza key={i} forma={{ f: "caja", t: [0.05, h, 0.02] }} color={i % 2 ? "#3a7a3a" : "#5a8a2a"} pos={[(R(s, "hx", i) - 0.5) * 40, h / 2, 2 - R(s, "hz", i) * 30]} rot={[Math.sin(f * 0.04 + i) * 0.2, R(s, "hr", i) * 3, Math.sin(f * 0.05 + i * 2) * 0.15]} />;
      })}
      <group position={[-6, 0.2, -6]} rotation={[0.2, 0.5, 1.2]}>
        <Pieza forma={{ f: "tubo", r: 0.12, h: 2.4 }} color="#5a3a2a" metal={0.6} rugoso={0.9} />
        <Pieza forma={{ f: "aro", r: 0.9, g: 0.12, arco: Math.PI }} color="#5a3a2a" pos={[0, -1.1, 0]} rot={[0, 0, Math.PI]} metal={0.6} rugoso={0.9} />
        <Pieza forma={{ f: "aro", r: 0.25, g: 0.06 }} color="#5a3a2a" pos={[0, 1.3, 0]} metal={0.6} />
      </group>
      {Array.from({ length: 10 }, (_, i) => (
        <Pieza key={i} forma={{ f: "aro", r: 0.14, g: 0.04 }} color="#4a3a2a" pos={[-5 + i * 0.25, 0.05, -5 + i * 0.12]} rot={[Math.PI / 2, 0, (i % 2) * 1.5]} metal={0.6} rugoso={0.9} />
      ))}
      {/* pececillos y partículas */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = f * 0.01 + i * 0.4;
        return <Pieza key={i} forma={{ f: "bola", r: 0.08, seg: 8 }} esc={[2, 0.8, 0.5]} color="#c8d8d0" pos={[Math.cos(a) * 8 + 4, 3 + (i % 4) * 0.6, -8 + Math.sin(a) * 3]} rot={[0, -a, 0]} />;
      })}
      {Array.from({ length: 50 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.02, seg: 4 }} color="#e8fff8" opacidad={0.6} basica pos={[(R(s, "nx", i) - 0.5) * 30, (R(s, "ny", i) * 12 + f * 0.005) % 12, -(R(s, "nz", i)) * 20]} />
      ))}
    </group>
  );
};

// ================================================================ NAVE (astillero de hoy: el submarino clase Virginia)
const Nave: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const chapa = texChapaNave([8, 2]);
  const suelo = texLosas(210, 6, 40, [10, 10]);
  const bandera = texBanderaEEUU(50);
  const W = 60, D = 70, H = 34;
  return (
    <group>
      <Ambiente niebla={["#1a2230", 30, 160]} fondo="#0c1018" />
      <hemisphereLight args={["#c8dcff", "#10141c", 0.5]} />
      <ambientLight intensity={0.1} color="#c8d8ff" />
      <TPlano w={W} h={D} pos={[0, 0, -20]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -55]} map={chapa} color="#8a94a0" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -20]} rot={[0, Math.PI / 2, 0]} map={chapa} color="#8a94a0" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -20]} rot={[0, -Math.PI / 2, 0]} map={chapa} color="#8a94a0" />
      {/* cerchas del techo, focos fríos y la grúa puente */}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} position={[0, H, -50 + i * 11]}>
          <Pieza forma={{ f: "caja", t: [W, 0.8, 0.6] }} color="#3a4048" metal={0.6} />
          {[-20, -6, 6, 20].map((x) => (
            <group key={x} position={[x, -1, 0]}>
              <Pieza forma={{ f: "caja", t: [1.2, 0.3, 0.6] }} color="#2a2e34" metal={0.6} />
              <Pieza forma={{ f: "caja", t: [1, 0.05, 0.5] }} color="#f4f8ff" basica pos={[0, -0.18, 0]} />
              <Resplandor pos={[0, -0.4, 0]} r={1.5} color="#d8e8ff" o={0.35} />
              <Haz pos={[0, -0.3, 0]} rot={[0, 0, 0]} largo={30} ancho={6} color="#d8e8ff" o={0.01} />
            </group>
          ))}
        </group>
      ))}
      {[-18, 0, 18].map((x, i) => (
        <pointLight key={x} position={[x, H - 4, -18]} intensity={60} distance={70} decay={1.4} color={i === 1 ? "#e8f0ff" : "#c8d8ff"} />
      ))}
      <group position={[0, H - 4, -22 + Math.sin(f * 0.004) * 2]}>
        <Pieza forma={{ f: "caja", t: [W - 2, 1.6, 1.2] }} color="#e8b020" metal={0.4} />
        <Pieza forma={{ f: "caja", t: [3, 2, 3] }} color="#d8a018" pos={[6, -1.5, 0]} metal={0.4} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 14 }} color="#2a2a2e" pos={[6, -9, 0]} metal={0.8} />
        <Pieza forma={{ f: "caja", t: [1, 0.6, 0.4] }} color="#2a2a2e" pos={[6, -16, 0]} metal={0.8} />
      </group>
      {/* EL SUBMARINO (actor «virginia» de la idea: x 0.9, z 9.33, alto 7.2, tam 115) va sobre estas cunas */}
      <pointLight position={[2, 16, -14]} intensity={40} distance={30} color="#e8f0ff" />
      {Array.from({ length: 7 }, (_, i) => (
        <group key={i} position={[-44 + i * 16, 0, -24]}>
          <Pieza forma={{ f: "caja", t: [3, 2.2, 10] }} color="#3a3e44" pos={[0, 1.1, 0]} metal={0.5} />
          <Pieza forma={{ f: "caja", t: [3.2, 0.2, 10.2] }} color="#f2c41e" pos={[0, 2.2, 0]} />
        </group>
      ))}
      {/* andamios con barandillas y escaleras delante del casco */}
      {[-40, -27, 30, 43].map((x, i) => (
        <group key={x} position={[x, 0, -17]}>
          {[0, 3, 6, 9].map((y) => (
            <Pieza key={y} forma={{ f: "caja", t: [8, 0.12, 1.4] }} color="#6a6e74" pos={[0, y + 1.5, 0]} metal={0.6} />
          ))}
          {[-3.9, 3.9].map((xx) =>
            [-0.65, 0.65].map((zz) => <Pieza key={`${xx}${zz}`} forma={{ f: "tubo", r: 0.05, h: 12 }} color="#8a8e94" pos={[xx, 6, zz]} metal={0.7} />),
          )}
          {[0, 3, 6, 9].map((y) => (
            <Pieza key={`b${y}`} forma={{ f: "tubo", r: 0.03, h: 8 }} color="#f2c41e" pos={[0, y + 2.5, 0.7]} rot={[0, 0, Math.PI / 2]} />
          ))}
          {/* chispas de soldadura: la luz cálida contra el azul */}
          {(() => {
            const y = 4.5 + (i % 3) * 3;
            const k = (f + i * 13) % 40 < 28 ? 1 : 0;
            return (
              <group position={[i - 1.5, y, -1]}>
                {k > 0 &&
                  Array.from({ length: 12 }, (_, j) => {
                    const t = ((f * 2 + j * 7) % 20) / 20;
                    return <Pieza key={j} forma={{ f: "caja", t: [0.03, 0.03, 0.03] }} color="#ffd060" basica pos={[Math.sin(j * 2.3) * t * 1.4, -t * t * 2 + t * 0.6, Math.cos(j * 1.3) * t * 0.6 + 0.4]} />;
                  })}
                <Resplandor pos={[0, 0, 0.3]} r={1.2} color="#ffb040" o={0.5 * k} />
                <pointLight position={[0, 0, 1]} intensity={14 * k} distance={9} color="#ffa040" />
              </group>
            );
          })()}
        </group>
      ))}
      {/* la bandera gigante colgada al fondo */}
      <group position={[-6, 22, -54.5]}>
        <TPlano w={22} h={11.6} map={bandera} />
      </group>
      <Letrero texto="SUBMARINE ASSEMBLY  -  HULL 812" pos={[16, 26, -54.4]} ancho={18} alto={2} fondo="#1a2a4a" tinta="#f4f8ff" />
      {/* cajas de material, carretilla elevadora y conos en el suelo */}
      {[[-8, -8], [10, -6], [-12, -4]].map(([x, z], i) => (
        <Pieza key={i} forma={{ f: "caja", t: [2, 1.4, 1.4] }} color={i % 2 ? "#3a5a8a" : "#7a6a4a"} pos={[x, 0.7, z]} />
      ))}
      <group position={[7, 0, -2]} rotation={[0, -0.6, 0]}>
        <Pieza forma={{ f: "caja", t: [2.2, 1.2, 1.2] }} color="#f2c41e" pos={[0, 0.9, 0]} />
        <Pieza forma={{ f: "caja", t: [1, 1.2, 1] }} color="#2a2a2e" pos={[-0.4, 2, 0]} opacidad={0.6} />
        {[-0.7, 0.7].map((x) => [-0.55, 0.55].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "tubo", r: 0.3, h: 0.25 }} color="#141414" pos={[x, 0.3, z]} rot={[Math.PI / 2, 0, 0]} />))}
        <Pieza forma={{ f: "caja", t: [0.1, 2.4, 1] }} color="#3a3a3e" pos={[1.2, 1.2, 0]} />
      </group>
      {Array.from({ length: 6 }, (_, i) => (
        <Pieza key={i} forma={{ f: "cono", r: 0.18, h: 0.5 }} color="#ff6a1a" pos={[-4 + i * 1.6, 0.25, 0.5]} />
      ))}
      {/* líneas de seguridad pintadas en el suelo */}
      {[-1, 1].map((l) => (
        <Pieza key={l} forma={{ f: "caja", t: [50, 0.01, 0.25] }} color="#f2c41e" basica pos={[0, 0.01, -12 + l * 0.5]} />
      ))}
    </group>
  );
};

export const ESCENARIOS_HOLLAND = { astillero: Astillero, "astillero-fiesta": AstilleroFiesta, aula: Aula, ministerio: Ministerio, guarida: Guarida, canal: Canal, taller: Taller, bahia: Bahia, nave: Nave };
