// Escenarios del vídeo «Pirates Had Better Health Insurance Than You» (idea 6). Nivel de calidad del camarote,
// pero cada uno con su propio sitio, luz y paleta:
// - taberna: taberna pirata del puerto, de noche (faroles, barra con botellas, pizarra, chimenea).
// - trono: salón del trono español, de día (oro, tapices, columnas, alfombra roja, cofres de plata).
// - puerto: muelle español al atardecer (galeón enorme, carteles de WANTED, cajas, faroles).
// - abordaje: cubierta pirata en pleno abordaje al anochecer (fuego, humo, cañonazos, el barco enemigo).
// - consejo: mesa del consejo pirata en cubierta, de noche (contrato, velas, plumas, monedas, estrellas).
// - bodega: bodega del botín (cuadernas, montañas de oro, cofres, joyas, libro de cuentas, luz entre rejillas).
// - enfermeria: enfermería del cirujano bajo cubierta (caja de medicinas, frascos, sierra, hamaca, ojo de buey).
// - aseguradora: oficina de seguros moderna (fluorescentes fríos, cubículos, pantalla «DENIED», ciudad de noche).
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente } from "./escenarios";
import { Estrellas, Haz, Letrero, Mar } from "./escenarios-azorian";
import { Barril, Caja, Fuego, Luna, Resplandor, TCaja, TPlano } from "./escenarios-nuevos";
import { Cielo, Pieza, texturaPunto } from "./piezas3d";
import { texAlfombra, texContrato, texDenegado, texLosas, texMadera, texMapa, texMoqueta, texPiedra, texPizarra, texTapiz, texWanted } from "./texturas-pintadas";

type V3 = [number, number, number];
const R = (s: number, ...k: (string | number)[]) => azar(s, "pi", ...k);
const ORO = { color: "#f2c24a", metal: 0.9, rugoso: 0.25 } as const;

// ---------------------------------------------------------------- piezas comunes
/** Farol colgante (o de pared) con luz cálida que oscila. */
export const Farol: React.FC<{ pos: V3; luz?: number; s: number; cadena?: number; color?: string }> = ({ pos, luz = 6, s, cadena = 0.5, color = "#ffb860" }) => {
  const f = useCurrentFrame();
  const k = 0.85 + 0.15 * Math.sin(f * 0.3 + s) * Math.sin(f * 0.17 + s * 2);
  const mece = Math.sin(f * 0.05 + s) * 0.08;
  return (
    <group position={pos} rotation={[mece, 0, mece * 0.5]}>
      {cadena > 0 && <Pieza forma={{ f: "tubo", r: 0.012, h: cadena }} color="#2a2a2e" pos={[0, -cadena / 2, 0]} />}
      <group position={[0, -cadena - 0.2, 0]}>
        <Pieza forma={{ f: "cono", r: 0.16, h: 0.13, seg: 8 }} color="#8a6a2e" pos={[0, 0.22, 0]} metal={0.7} rugoso={0.4} />
        <Pieza forma={{ f: "tubo", r: 0.11, h: 0.28, seg: 8 }} color="#ffe0a0" brillo={color} intensidad={1.6} basica />
        <Pieza forma={{ f: "tubo", r: 0.13, h: 0.035, seg: 8 }} color="#8a6a2e" pos={[0, -0.16, 0]} metal={0.7} />
        <Resplandor pos={[0, 0, 0]} r={0.45} color={color} o={0.25 * k} />
        <Resplandor pos={[0, 0, 0]} r={1.2} color={color} o={0.07 * k} />
        {luz > 0 && <pointLight intensity={luz * k} distance={8} decay={1.6} color={color} />}
      </group>
    </group>
  );
};

/** Jarra de madera con espuma. */
export const Jarra: React.FC<{ pos: V3 }> = ({ pos }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.07, r2: 0.08, h: 0.17 }} color="#7a4a22" pos={[0, 0.085, 0]} />
    <Pieza forma={{ f: "tubo", r: 0.071, h: 0.03 }} color="#f4eedc" pos={[0, 0.18, 0]} />
    <Pieza forma={{ f: "aro", r: 0.05, g: 0.015, arco: Math.PI }} color="#5a3216" pos={[0.08, 0.09, 0]} rot={[0, 0, -Math.PI / 2]} />
  </group>
);

/** Botella de cristal de color (brilla un poco con la luz). */
export const Botella: React.FC<{ pos: V3; color: string; alto?: number }> = ({ pos, color, alto = 0.3 }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.05, h: alto * 0.65 }} color={color} pos={[0, alto * 0.33, 0]} brillo={color} intensidad={0.25} rugoso={0.15} />
    <Pieza forma={{ f: "tubo", r: 0.018, r2: 0.03, h: alto * 0.3 }} color={color} pos={[0, alto * 0.8, 0]} brillo={color} intensidad={0.25} rugoso={0.15} />
    <Pieza forma={{ f: "tubo", r: 0.02, h: 0.04 }} color="#6a4a2a" pos={[0, alto * 0.97, 0]} />
  </group>
);

/** Montón de monedas de oro (muchas piezas). */
export const Monedas: React.FC<{ pos: V3; n: number; radio: number; alto?: number; s: number }> = ({ pos, n, radio, alto = 0.3, s }) => (
  <group position={pos}>
    <Pieza forma={{ f: "cono", r: radio, h: alto, seg: 16 }} color="#e8b23a" pos={[0, alto / 2, 0]} metal={0.85} rugoso={0.35} brillo="#a07010" intensidad={0.25} />
    {Array.from({ length: n }, (_, i) => {
      const a = R(s, "ma", i) * Math.PI * 2;
      const r = Math.sqrt(R(s, "mr", i)) * radio;
      const y = alto * (1 - r / radio) + 0.01;
      return <Pieza key={i} forma={{ f: "tubo", r: 0.05, h: 0.012, seg: 10 }} {...ORO} pos={[Math.cos(a) * r, y, Math.sin(a) * r]} rot={[R(s, "mx", i) - 0.5, 0, R(s, "mz", i) - 0.5]} brillo="#ffb020" intensidad={0.35} />;
    })}
  </group>
);

/** Cofre de madera con herrajes; abierto con oro dentro si `oro`. */
export const Cofre: React.FC<{ pos: V3; rot?: V3; oro?: boolean; s: number; tam?: number }> = ({ pos, rot, oro, s, tam = 1 }) => {
  const mad = texMadera(26, 50, 34, 4);
  return (
    <group position={pos} rotation={rot} scale={tam}>
      <TCaja t={[1.0, 0.55, 0.62]} pos={[0, 0.28, 0]} map={mad} color="#b07a50" />
      {[-0.36, 0.36].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.07, 0.57, 0.64] }} color="#3a3a42" pos={[x, 0.28, 0]} metal={0.7} rugoso={0.4} />
      ))}
      <Pieza forma={{ f: "caja", t: [0.12, 0.14, 0.04] }} {...ORO} pos={[0, 0.42, 0.32]} />
      {oro ? (
        <>
          <group position={[0, 0.55, -0.31]} rotation={[-1.9, 0, 0]}>
            <TCaja t={[1.0, 0.08, 0.62]} pos={[0, 0, 0.31]} map={mad} color="#b07a50" />
          </group>
          <Monedas pos={[0, 0.5, 0]} n={18} radio={0.38} alto={0.14} s={s} />
          <Resplandor pos={[0, 0.7, 0]} r={0.6} color="#ffc84a" o={0.15} />
        </>
      ) : (
        <TCaja t={[1.02, 0.12, 0.64]} pos={[0, 0.6, 0]} map={mad} color="#9a6a40" />
      )}
    </group>
  );
};

/** Vela de barco (lona curvada) con su verga. */
export const VelaBarco: React.FC<{ pos: V3; ancho: number; alto: number; color?: string; s: number; rot?: V3 }> = ({ pos, ancho, alto, color = "#e8dcc0", s, rot }) => {
  const f = useCurrentFrame();
  const geo = useMemo(() => {
    const g = new THREE.PlaneGeometry(ancho, alto, 10, 10);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / (ancho / 2);
      const y = p.getY(i) / (alto / 2);
      p.setZ(i, (1 - x * x) * (1 - y * y * 0.5) * ancho * 0.12);
    }
    g.computeVertexNormals();
    return g;
  }, [ancho, alto]);
  const k = 1 + Math.sin(f * 0.05 + s) * 0.03;
  return (
    <group position={pos} rotation={rot}>
      <mesh geometry={geo} scale={[1, 1, k]}>
        <meshStandardMaterial color={color} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <Pieza forma={{ f: "tubo", r: 0.06, h: ancho * 1.1 }} color="#4a2c14" pos={[0, alto / 2, 0]} rot={[0, 0, Math.PI / 2]} />
    </group>
  );
};

/** Bocanada de humo (esferas grises que crecen y se desvanecen). */
export const Humo: React.FC<{ pos: V3; s: number; color?: string; tam?: number }> = ({ pos, s, color = "#6a6a72", tam = 1 }) => {
  const f = useCurrentFrame();
  const mat = useMemo(() => new THREE.SpriteMaterial({ map: texturaPunto(), color, transparent: true, depthWrite: false }), [color]);
  return (
    <group position={pos}>
      {Array.from({ length: 7 }, (_, i) => {
        const ciclo = 90;
        const t = ((f + i * (ciclo / 7) + s * 13) % ciclo) / ciclo;
        const m = mat.clone();
        m.opacity = 0.55 * Math.sin(t * Math.PI);
        const sc = (0.8 + t * 3) * tam;
        return <sprite key={i} material={m} position={[Math.sin(i * 2.1 + s) * 0.5 * t * tam, t * 4 * tam, Math.cos(i * 1.7) * 0.3 * tam]} scale={[sc, sc, 1]} />;
      })}
    </group>
  );
};

/** Cañón naval con su cureña; `dispara` = fogonazo periódico. */
export const Canon: React.FC<{ pos: V3; rot?: V3; s: number; dispara?: boolean }> = ({ pos, rot, s, dispara }) => {
  const f = useCurrentFrame();
  const t = (f + s * 37) % 70;
  const fogonazo = dispara && t < 6 ? 1 - t / 6 : 0;
  return (
    <group position={pos} rotation={rot}>
      <Pieza forma={{ f: "caja", t: [0.8, 0.32, 0.65] }} color="#5a3618" pos={[0, 0.28, 0]} />
      {[-0.34, 0.34].map((x) =>
        [-0.26, 0.26].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "tubo", r: 0.15, h: 0.07, seg: 14 }} color="#3a2410" pos={[x, 0.15, z]} rot={[Math.PI / 2, 0, 0]} />),
      )}
      <Pieza forma={{ f: "tubo", r: 0.14, r2: 0.1, h: 1.5, seg: 16 }} color="#25272e" pos={[0, 0.55, -0.45]} rot={[Math.PI / 2 - 0.08, 0, 0]} metal={0.75} rugoso={0.35} />
      {fogonazo > 0 && (
        <>
          <Pieza forma={{ f: "bola", r: 0.35 * fogonazo + 0.1, seg: 12 }} color="#fff0a0" basica pos={[0, 0.6, -1.3]} />
          <Resplandor pos={[0, 0.6, -1.3]} r={2.5} color="#ffb040" o={0.6 * fogonazo} />
          <pointLight position={[0, 0.8, -1.2]} intensity={40 * fogonazo} distance={10} color="#ffb060" />
        </>
      )}
    </group>
  );
};

/** Ventana con cristales y vista nocturna (para interiores). */
export const Ventana: React.FC<{ pos: V3; rot?: V3; ancho?: number; alto?: number; cielo?: string }> = ({ pos, rot, ancho = 1.2, alto = 1.4, cielo = "#2a3e78" }) => (
  <group position={pos} rotation={rot}>
    <Pieza forma={{ f: "caja", t: [ancho, alto, 0.02] }} color={cielo} brillo={cielo} intensidad={0.6} basica />
    {[-ancho / 2, 0, ancho / 2].map((x) => (
      <Pieza key={x} forma={{ f: "caja", t: [0.06, alto + 0.06, 0.08] }} color="#3a2010" pos={[x, 0, 0.03]} />
    ))}
    {[-alto / 2, 0, alto / 2].map((y) => (
      <Pieza key={y} forma={{ f: "caja", t: [ancho + 0.06, 0.06, 0.08] }} color="#3a2010" pos={[0, y, 0.03]} />
    ))}
  </group>
);

/** Habitación de madera: suelo, 3 paredes, techo con vigas. */
export const SalaMadera: React.FC<{ w: number; d: number; h: number; tono?: number; s: number }> = ({ w, d, h, tono = 26 }) => {
  const suelo = texMadera(tono, 46, 30, 8, [3, 3]);
  const pared = texMadera(tono - 2, 40, 27, 10, [2, 1]);
  const viga = texMadera(tono - 4, 45, 20, 3);
  return (
    <group>
      <TPlano w={w} h={d} pos={[0, 0, 0]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={d} h={h} pos={[-w / 2, h / 2, 0]} rot={[0, Math.PI / 2, 0]} map={pared} />
      <TPlano w={d} h={h} pos={[w / 2, h / 2, 0]} rot={[0, -Math.PI / 2, 0]} map={pared} />
      <TPlano w={w} h={h} pos={[0, h / 2, -d / 2]} map={pared} />
      <TPlano w={w} h={h} pos={[0, h / 2, d / 2]} rot={[0, Math.PI, 0]} map={pared} />
      <TPlano w={w} h={d} pos={[0, h, 0]} rot={[Math.PI / 2, 0, 0]} map={pared} color="#8a6a50" />
      {Array.from({ length: Math.floor(d / 1.2) }, (_, i) => (
        <TCaja key={i} t={[w, 0.22, 0.26]} pos={[0, h - 0.11, -d / 2 + 0.6 + i * 1.2]} map={viga} />
      ))}
    </group>
  );
};

// ================================================================ TABERNA
const Taberna: React.FC<{ s: number }> = ({ s }) => {
  const mad = texMadera(24, 48, 30, 6);
  const pizarra = texPizarra(["RUM", "Grog .... 1", "Rum ..... 2", "Fight ... free"]);
  const W = 10, D = 9, H = 3.4;
  return (
    <group>
      <Ambiente niebla={["#1a0f08", 14, 50]} fondo="#0c0806" />
      <hemisphereLight args={["#ffd8a8", "#1a100a", 0.35]} />
      <ambientLight intensity={0.08} color="#ffe0c0" />
      <SalaMadera w={W} d={D} h={H} s={s} />
      {/* barra al fondo con botellas y barriles detrás */}
      <group position={[0, 0, -3.3]}>
        <TCaja t={[6, 1.1, 0.8]} pos={[0, 0.55, 0]} map={mad} color="#a0704a" />
        <TCaja t={[6.2, 0.1, 0.95]} pos={[0, 1.15, 0]} map={mad} color="#c08a5a" />
        {[0.8, 1.6, 2.3].map((y) =>
          <TCaja key={y} t={[5.6, 0.06, 0.35]} pos={[0, y + 0.3, -1.0]} map={mad} color="#8a5a34" />,
        )}
        {[0.8, 1.6, 2.3].map((y, j) =>
          Array.from({ length: 14 }, (_, i) => (
            <Botella key={`${y}${i}`} pos={[-2.6 + i * 0.4 + (j % 2) * 0.15, y + 0.33, -1.0]} color={["#3a7a3a", "#7a2a1a", "#c08a2a", "#2a4a7a", "#5a2a5a"][(i + j) % 5]} alto={0.26 + (i % 3) * 0.06} />
          )),
        )}
        {[-1.8, 0, 1.8].map((x, i) => (
          <Jarra key={i} pos={[x, 1.2, 0.1]} />
        ))}
        <Barril pos={[-3.6, 0, -0.6]} rot={[0, 0, 0]} />
        <Barril pos={[3.6, 0, -0.6]} />
        <Barril pos={[3.6, 0.9, -0.6]} />
      </group>
      {/* pizarra con precios en la pared izquierda */}
      <TPlano w={1.4} h={1.85} pos={[-W / 2 + 0.03, 1.85, -1.2]} rot={[0, Math.PI / 2, 0]} map={pizarra} />
      {/* chimenea a la derecha con fuego */}
      <group position={[W / 2 - 0.4, 0, -0.5]} rotation={[0, -Math.PI / 2, 0]}>
        <TCaja t={[2.2, 1.6, 0.7]} pos={[0, 0.8, 0]} map={texPiedra(20, 18, 50, 6, 3)} />
        <Pieza forma={{ f: "caja", t: [1.2, 0.9, 0.3] }} color="#100806" pos={[0, 0.5, 0.25]} basica />
        <Fuego pos={[0, 0.12, 0.35]} tam={1.6} luz={16} s={s} />
        <TCaja t={[2.6, 0.12, 0.85]} pos={[0, 1.66, 0.05]} map={mad} />
        <Jarra pos={[-0.7, 1.72, 0.1]} />
        <Botella pos={[0.6, 1.72, 0.1]} color="#3a7a3a" />
      </group>
      {/* mesas redondas con jarras y velas, taburetes */}
      {[[-2.6, 0.8], [2.4, 1.6], [-2.2, 3.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Pieza forma={{ f: "tubo", r: 0.6, h: 0.07, seg: 24 }} color="#6a3e1e" pos={[0, 0.78, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.07, h: 0.76 }} color="#4a2a12" pos={[0, 0.38, 0]} />
          <Jarra pos={[0.2, 0.82, 0.1]} />
          <Jarra pos={[-0.25, 0.82, -0.15]} />
          <group position={[0, 0.82, 0.25]}>
            <Pieza forma={{ f: "tubo", r: 0.03, h: 0.16 }} color="#f4ecd8" pos={[0, 0.08, 0]} />
            <Fuego pos={[0, 0.16, 0]} tam={0.3} luz={i === 0 ? 3 : 0} s={s + i} />
          </group>
          {[0, 2.1, 4.2].map((a, k) => (
            <Pieza key={k} forma={{ f: "tubo", r: 0.2, h: 0.48, seg: 12 }} color="#5a3418" pos={[Math.cos(a) * 0.95, 0.24, Math.sin(a) * 0.95]} />
          ))}
        </group>
      ))}
      {/* faroles colgando */}
      <Farol pos={[-1.5, H, 0.5]} s={s} luz={7} />
      <Farol pos={[1.8, H, -1.2]} s={s + 3} luz={7} />
      {/* ventana con el puerto de noche y un timón decorativo */}
      <Ventana pos={[-1.5, 1.9, D / 2 - 0.05]} rot={[0, Math.PI, 0]} />
      <group position={[W / 2 - 0.05, 2.2, 2.4]} rotation={[0, -Math.PI / 2, 0]}>
        <Pieza forma={{ f: "aro", r: 0.5, g: 0.05 }} color="#6a3c1a" />
        {Array.from({ length: 8 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 1.4 }} color="#6a3c1a" rot={[0, 0, (i / 8) * Math.PI]} />
        ))}
      </group>
      <Barril pos={[-4.2, 0, 3.6]} />
      <Barril pos={[-3.5, 0, 3.9]} />
      <Caja pos={[4.0, 0, 3.6]} tam={0.7} rot={[0, 0.3, 0]} />
    </group>
  );
};

// ================================================================ TRONO (salón del trono español)
const Trono: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texLosas(40, 30, 78, [6, 6]);
  const muro = texPiedra(36, 26, 70, 10, 3, [3, 2]);
  const tapiz = texTapiz();
  const alfombra = texAlfombra("#9a1424", "#e0b04a", "#5a0a14");
  const W = 14, D = 18, H = 7;
  return (
    <group>
      <Ambiente niebla={["#3a2614", 20, 70]} fondo="#2a1a0c" />
      <hemisphereLight args={["#fff0d0", "#3a2414", 0.7]} />
      <directionalLight position={[-8, 10, 6]} intensity={1.8} color="#fff0c8" />
      <TPlano w={W} h={D} pos={[0, 0, -4]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={2.6} h={14} pos={[0, 0.01, -3]} rot={[-Math.PI / 2, 0, 0]} map={alfombra} />
      {[-W / 2, W / 2].map((x) => (
        <TPlano key={x} w={D} h={H} pos={[x, H / 2, -4]} rot={[0, x < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} map={muro} />
      ))}
      <TPlano w={W} h={H} pos={[0, H / 2, -13]} map={muro} />
      <TPlano w={W} h={D} pos={[0, H, -4]} rot={[Math.PI / 2, 0, 0]} map={muro} color="#c8a878" />
      {/* columnas doradas */}
      {[-4, 4].map((x) =>
        [2, -2.5, -7].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Pieza forma={{ f: "caja", t: [0.9, 0.4, 0.9] }} color="#e8d8b8" pos={[0, 0.2, 0]} />
            <Pieza forma={{ f: "tubo", r: 0.32, h: 6, seg: 24 }} color="#f0e4c8" pos={[0, 3.4, 0]} />
            {[1.2, 3.4, 5.6].map((y) => (
              <Pieza key={y} forma={{ f: "aro", r: 0.33, g: 0.05 }} {...ORO} pos={[0, y, 0]} rot={[Math.PI / 2, 0, 0]} />
            ))}
            <Pieza forma={{ f: "caja", t: [0.95, 0.35, 0.95] }} {...ORO} pos={[0, 6.55, 0]} />
          </group>
        )),
      )}
      {/* tapices en las paredes */}
      {[-1, 1].map((l) =>
        [0, -5].map((z) => <TPlano key={`${l}${z}`} w={1.6} h={3.2} pos={[l * (W / 2 - 0.05), 3.4, z]} rot={[0, l < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} map={tapiz} />),
      )}
      {/* estrado y trono con dosel */}
      <group position={[0, 0, -11]}>
        {[0, 1, 2].map((i) => (
          <Pieza key={i} forma={{ f: "caja", t: [5 - i * 1.2, 0.25, 3 - i * 0.6] }} color={i === 2 ? "#9a1424" : "#e8d8b8"} pos={[0, 0.125 + i * 0.25, 0]} />
        ))}
        <group position={[0, 0.75, -0.3]}>
          <Pieza forma={{ f: "caja", t: [1.3, 0.2, 1.0] }} {...ORO} pos={[0, 0.45, 0]} />
          <Pieza forma={{ f: "caja", t: [1.0, 0.12, 0.8] }} color="#9a1424" pos={[0, 0.6, 0.05]} rugoso={0.5} />
          <Pieza forma={{ f: "caja", t: [1.3, 2.2, 0.2] }} {...ORO} pos={[0, 1.5, -0.45]} />
          <Pieza forma={{ f: "caja", t: [1.0, 1.8, 0.05] }} color="#9a1424" pos={[0, 1.5, -0.33]} rugoso={0.5} />
          <Pieza forma={{ f: "bola", r: 0.18, seg: 14 }} {...ORO} pos={[-0.6, 2.7, -0.45]} />
          <Pieza forma={{ f: "bola", r: 0.18, seg: 14 }} {...ORO} pos={[0.6, 2.7, -0.45]} />
          {[-0.6, 0.6].map((x) => (
            <Pieza key={x} forma={{ f: "caja", t: [0.15, 0.55, 0.9] }} {...ORO} pos={[x, 0.8, 0]} />
          ))}
        </group>
        <Pieza forma={{ f: "caja", t: [3.4, 0.25, 2.2] }} {...ORO} pos={[0, 5.2, -0.2]} />
        {[-1.6, 1.6].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.08, 4.2, 0.5] }} color="#7a0e1a" pos={[x, 3.1, -0.9]} />
        ))}
      </group>
      {/* cofres de plata y oro (el imperio más rico) */}
      <Cofre pos={[-2.8, 0, -8.5]} rot={[0, 0.5, 0]} oro s={s} />
      <Cofre pos={[2.9, 0, -8.8]} rot={[0, -0.4, 0]} oro s={s + 1} />
      <Monedas pos={[-2.0, 0, -9.6]} n={16} radio={0.5} alto={0.3} s={s + 2} />
      {/* lámparas de araña con velas */}
      {[[0, -2], [0, -7]].map(([x, z], i) => (
        <group key={i} position={[x, H - 1.2, z]}>
          <Pieza forma={{ f: "aro", r: 0.9, g: 0.05 }} {...ORO} rot={[Math.PI / 2, 0, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.02, h: 1.2 }} color="#5a4a2a" pos={[0, 0.6, 0]} />
          {Array.from({ length: 8 }, (_, k) => {
            const a = (k / 8) * Math.PI * 2;
            return (
              <group key={k} position={[Math.cos(a) * 0.9, 0.05, Math.sin(a) * 0.9]}>
                <Pieza forma={{ f: "tubo", r: 0.025, h: 0.15 }} color="#f4ecd8" pos={[0, 0.08, 0]} />
                <Fuego pos={[0, 0.16, 0]} tam={0.25} s={s + k} />
              </group>
            );
          })}
          <pointLight position={[0, -0.2, 0]} intensity={14} distance={10} color="#ffd090" />
        </group>
      ))}
      {/* ventanales con haces de luz de la tarde */}
      {[-3.5, 3.5].map((z, i) => (
        <group key={i}>
          <Pieza forma={{ f: "caja", t: [0.05, 3, 1.4] }} color="#ffe8b0" brillo="#ffd890" intensidad={1.2} basica pos={[-W / 2 + 0.06, 4, z - 3]} />
          <Haz pos={[-W / 2 + 0.2, 5.4, z - 3]} rot={[0, 0, 1.0]} largo={9} ancho={1.0} color="#ffe8b0" o={0.05 + 0.01 * Math.sin(f * 0.04 + i)} />
        </group>
      ))}
    </group>
  );
};

// ================================================================ MUELLE (puerto español al atardecer)
const Muelle: React.FC<{ s: number }> = ({ s }) => {
  const piedra = texLosas(28, 20, 60, [3, 6]);
  const muro = texPiedra(30, 20, 55, 6, 3, [6, 1]);
  const mad = texMadera(26, 40, 40, 6);
  const casco = texMadera(22, 45, 26, 12, [4, 1]);
  return (
    <group>
      <Ambiente niebla={["#c86a4a", 40, 220]} fondo="#e0905a" />
      <Cielo arriba="#3a2a6a" medio="#f08a4a" abajo="#f6c070" radio={300} />
      <hemisphereLight args={["#ffb880", "#3a2a3a", 0.8]} />
      <directionalLight position={[30, 8, -40]} intensity={2.2} color="#ffb070" />
      <Pieza forma={{ f: "bola", r: 9, seg: 24 }} color="#ffd890" basica pos={[60, 14, -200]} />
      <Mar y={-1.4} color="#3a4a8a" brillo={0.7} />
      {/* muelle de piedra */}
      <TPlano w={8} h={40} pos={[-1, 0, -8]} rot={[-Math.PI / 2, 0, 0]} map={piedra} />
      <TCaja t={[0.6, 1.4, 40]} pos={[3.3, -0.7, -8]} map={muro} />
      {/* bolardos y cabos */}
      {[2, -4, -10].map((z) => (
        <group key={z} position={[2.7, 0, z]}>
          <Pieza forma={{ f: "tubo", r: 0.18, r2: 0.22, h: 0.6 }} color="#2a2a30" pos={[0, 0.3, 0]} metal={0.6} />
          <Pieza forma={{ f: "aro", r: 0.22, g: 0.05 }} color="#c8a878" pos={[0, 0.45, 0]} rot={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
      {/* galeón español atracado (casco enorme con troneras) */}
      <group position={[8.5, -1, -6]}>
        <TCaja t={[4.5, 5, 24]} pos={[0, 2.5, 0]} map={casco} color="#8a5a34" />
        <Pieza forma={{ f: "caja", t: [4.6, 0.4, 24.2] }} color="#c8a030" pos={[0, 4.4, 0]} metal={0.5} />
        {Array.from({ length: 9 }, (_, i) =>
          [2.2, 3.4].map((y) => (
            <group key={`${i}${y}`} position={[-2.27, y, -10 + i * 2.5]}>
              <Pieza forma={{ f: "caja", t: [0.05, 0.5, 0.6] }} color="#1a0c06" />
              <Pieza forma={{ f: "tubo", r: 0.1, h: 0.4 }} color="#1e2026" pos={[-0.2, 0, 0]} rot={[0, 0, Math.PI / 2]} metal={0.6} />
            </group>
          )),
        )}
        {[-6, 2, 9].map((z, i) => (
          <group key={z}>
            <Pieza forma={{ f: "tubo", r: 0.22, h: 22 - i * 3 }} color="#4a2c14" pos={[0, 5 + (22 - i * 3) / 2, z]} />
            <VelaBarco pos={[-0.4, 12 - i, z]} ancho={6 - i * 0.6} alto={5} s={s + i} rot={[0, -Math.PI / 2, 0]} color="#f2e8d0" />
            <VelaBarco pos={[-0.4, 18 - i * 2, z]} ancho={5 - i * 0.6} alto={4} s={s + i + 5} rot={[0, -Math.PI / 2, 0]} color="#f2e8d0" />
          </group>
        ))}
        <Pieza forma={{ f: "caja", t: [1.4, 0.9, 0.04] }} color="#c0242c" pos={[0, 24, 9]} doble />
      </group>
      {/* tablón con carteles de WANTED */}
      <group position={[-3.2, 0, -2.5]} rotation={[0, 0.5, 0]}>
        <TCaja t={[2.6, 1.8, 0.12]} pos={[0, 1.6, 0]} map={mad} color="#9a6a40" />
        {[-0.75, 0.75].map((x) => (
          <TCaja key={x} t={[0.14, 2.6, 0.14]} pos={[x * 1.6, 1.3, -0.05]} map={mad} />
        ))}
        {[-0.8, 0, 0.8].map((x, i) => (
          <TPlano key={i} w={0.7} h={0.98} pos={[x, 1.62 + (i % 2) * 0.08, 0.07]} rot={[0, 0, (i - 1) * 0.06]} map={texWanted(i)} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.6, 0.06, 0.06] }} color="#2a2a2e" pos={[0, 2.55, 0.07]} />
      </group>
      {/* cajas, barriles y balas de cañón */}
      <Caja pos={[-2.6, 0, 1.5]} tam={0.8} rot={[0, 0.4, 0]} />
      <Caja pos={[-2.3, 0.8, 1.6]} tam={0.55} rot={[0, -0.2, 0]} />
      <Barril pos={[-3.3, 0, 0.6]} />
      <Barril pos={[1.8, 0, -6.5]} />
      <Barril pos={[2.2, 0, -7.2]} />
      {[[0, 0, 0], [0.26, 0, 0], [0.13, 0, 0.22], [0.13, 0.2, 0.08]].map(([x, y, z], i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.13, seg: 12 }} color="#1e2026" pos={[1.6 + x, 0.13 + y, 0.8 + z]} metal={0.6} rugoso={0.4} />
      ))}
      {/* faroles en postes */}
      {[[-3.6, -6], [2.4, 3]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Pieza forma={{ f: "tubo", r: 0.06, h: 2.6 }} color="#2a2a2e" pos={[0, 1.3, 0]} metal={0.6} />
          <Farol pos={[0, 2.9, 0]} s={s + i} cadena={0} luz={5} />
        </group>
      ))}
      {/* fuerte en la colina, al fondo */}
      <group position={[-30, 0, -90]}>
        <Pieza forma={{ f: "roca", r: 18, s: 4 }} color="#6a4a5a" esc={[1.6, 0.6, 1]} />
        <Pieza forma={{ f: "caja", t: [14, 6, 8] }} color="#c8a080" pos={[0, 12, 0]} />
        <Pieza forma={{ f: "tubo", r: 2.5, h: 9 }} color="#c8a080" pos={[7, 13, 0]} />
      </group>
    </group>
  );
};

// ================================================================ ABORDAJE (cubierta en plena batalla)
const Abordaje: React.FC<{ s: number }> = ({ s }) => {
  const cubierta = texMadera(30, 40, 42, 8, [2, 5]);
  const borda = texMadera(24, 45, 30, 4, [6, 1]);
  const casco = texMadera(20, 40, 22, 10, [4, 1]);
  return (
    <group>
      <Ambiente niebla={["#3a2a3a", 25, 140]} fondo="#2a1a2a" />
      <Cielo arriba="#140c26" medio="#6a2a3a" abajo="#c8582a" radio={250} />
      <Estrellas s={s} n={120} />
      <hemisphereLight args={["#8a6aa8", "#2a1a1a", 0.6]} />
      <directionalLight position={[20, 6, -30]} intensity={1.4} color="#ff9a5a" />
      <Mar y={-2} color="#1a2448" brillo={0.5} />
      {/* cubierta */}
      <TPlano w={7} h={20} pos={[0, 0, -4]} rot={[-Math.PI / 2, 0, 0]} map={cubierta} />
      {[-3.5, 3.5].map((x) => (
        <TCaja key={x} t={[0.25, 1.0, 20]} pos={[x, 0.5, -4]} map={borda} />
      ))}
      <TCaja t={[7.6, 3, 20]} pos={[0, -1.6, -4]} map={casco} />
      {/* mástil con velas, cabos y la bandera pirata */}
      <group position={[0, 0, -4.5]}>
        <Pieza forma={{ f: "tubo", r: 0.22, h: 16 }} color="#4a2c14" pos={[0, 8, 0]} />
        <VelaBarco pos={[0, 6.5, 0.3]} ancho={6} alto={4} s={s} color="#d8c8a8" />
        <VelaBarco pos={[0, 11, 0.3]} ancho={4.8} alto={3.4} s={s + 2} color="#d8c8a8" />
        <Pieza forma={{ f: "caja", t: [1.4, 0.9, 0.03] }} color="#121216" pos={[0.75, 15.6, 0]} doble />
        {[-1, 1].map((l) =>
          Array.from({ length: 4 }, (_, i) => (
            <Pieza key={`${l}${i}`} forma={{ f: "tubo", r: 0.015, h: 9 }} color="#6a5a40" pos={[l * (1.5 + i * 0.25), 4.3, 0]} rot={[0, 0, l * 0.36]} />
          )),
        )}
      </group>
      {/* cañones disparando por la borda */}
      <Canon pos={[2.6, 0, 0]} rot={[0, -Math.PI / 2, 0]} s={s} dispara />
      <Canon pos={[2.6, 0, -6]} rot={[0, -Math.PI / 2, 0]} s={s + 3} dispara />
      <Canon pos={[-2.6, 0, -2]} rot={[0, Math.PI / 2, 0]} s={s + 5} />
      {/* barco enemigo al lado, ardiendo */}
      <group position={[11, -1, -6]}>
        <TCaja t={[5, 5, 18]} pos={[0, 1.5, 0]} map={casco} color="#9a6a3a" />
        <Pieza forma={{ f: "tubo", r: 0.2, h: 14 }} color="#3a2410" pos={[0, 10, -2]} rot={[0, 0, 0.15]} />
        <VelaBarco pos={[-0.6, 9, -2]} ancho={5} alto={4} s={s + 7} rot={[0, -Math.PI / 2, 0.15]} color="#f0e4c8" />
        <Fuego pos={[-1, 4, 3]} tam={4} luz={30} s={s} />
        <Fuego pos={[0.5, 4, -4]} tam={3} s={s + 4} />
        <Humo pos={[-0.5, 6, 0]} s={s} tam={1.8} color="#3a3236" />
      </group>
      {/* humo y fuego en nuestra cubierta, barriles y cabos */}
      <Humo pos={[3.5, 1, -1]} s={s + 2} tam={1.2} />
      <Fuego pos={[-2.6, 0.05, -9]} tam={1.6} luz={10} s={s + 9} />
      <Barril pos={[-2.8, 0, 3]} />
      <Barril pos={[-2.2, 0, 3.4]} rot={[Math.PI / 2, 0.4, 0]} />
      <Caja pos={[2.7, 0, 3.4]} tam={0.7} />
      <Farol pos={[0, 3.2, 2]} s={s} cadena={0.2} luz={6} />
      {/* chispas y ascuas que flotan */}
      {Array.from({ length: 30 }, (_, i) => (
        <Ascua key={i} i={i} s={s} />
      ))}
    </group>
  );
};

const Ascua: React.FC<{ i: number; s: number }> = ({ i, s }) => {
  const f = useCurrentFrame();
  const t = ((f * (0.6 + R(s, "av", i) * 0.8) + R(s, "at", i) * 200) % 200) / 200;
  return <Pieza forma={{ f: "bola", r: 0.03, seg: 6 }} color="#ffb040" basica pos={[-4 + R(s, "ax", i) * 16, t * 9, -12 + R(s, "az", i) * 16 + Math.sin(f * 0.05 + i) * 0.4]} />;
};

// ================================================================ CONSEJO (mesa del contrato en cubierta, de noche)
const Consejo: React.FC<{ s: number }> = ({ s }) => {
  const cubierta = texMadera(28, 36, 34, 8, [2, 4]);
  const borda = texMadera(24, 45, 28, 4, [6, 1]);
  const mesa = texMadera(22, 50, 28, 5);
  const contrato = texContrato();
  const mapa = texMapa();
  return (
    <group>
      <Ambiente niebla={["#0e1430", 25, 160]} fondo="#0a1028" />
      <Cielo arriba="#050a20" medio="#1a2a5a" abajo="#22305a" radio={260} />
      <Estrellas s={s} n={400} />
      <Luna pos={[-30, 40, -120]} r={6} />
      <hemisphereLight args={["#5a6aa8", "#140c0a", 0.4]} />
      <directionalLight position={[-30, 40, -60]} intensity={0.9} color="#a8c0ff" />
      <Mar y={-2} color="#14244a" brillo={0.6} />
      <TPlano w={8} h={16} pos={[0, 0, -3]} rot={[-Math.PI / 2, 0, 0]} map={cubierta} />
      {[-4, 4].map((x) => (
        <TCaja key={x} t={[0.25, 1.0, 16]} pos={[x, 0.5, -3]} map={borda} />
      ))}
      {/* mesa larga con el contrato en el centro */}
      <group position={[0, 0, -1.2]}>
        <TCaja t={[3.4, 0.12, 1.6]} pos={[0, 0.85, 0]} map={mesa} color="#c08a5a" />
        {[-1.5, 1.5].map((x) =>
          [-0.65, 0.65].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "caja", t: [0.12, 0.8, 0.12] }} color="#4a2a12" pos={[x, 0.4, z]} />),
        )}
        <TPlano w={0.75} h={1.0} pos={[0, 0.915, 0.05]} rot={[-Math.PI / 2, 0, 0.08]} map={contrato} />
        <TPlano w={1.0} h={0.75} pos={[-1.05, 0.913, 0.15]} rot={[-Math.PI / 2, 0, -0.2]} map={mapa} />
        {/* tintero y plumas */}
        <Pieza forma={{ f: "tubo", r: 0.06, h: 0.09 }} color="#1a1a22" pos={[0.55, 0.96, -0.3]} />
        <Pieza forma={{ f: "cono", r: 0.025, h: 0.4, seg: 6 }} color="#f4f2ea" pos={[0.58, 1.12, -0.28]} rot={[0.3, 0, -0.4]} />
        {/* monedas, jarras, una daga clavada y velas */}
        <Monedas pos={[1.15, 0.91, 0.2]} n={12} radio={0.22} alto={0.1} s={s} />
        <Jarra pos={[-0.6, 0.91, -0.5]} />
        <Jarra pos={[1.3, 0.91, -0.45]} />
        <group position={[0.2, 1.05, 0.5]} rotation={[0.2, 0, 0]}>
          <Pieza forma={{ f: "caja", t: [0.04, 0.32, 0.01] }} color="#d8dce4" metal={0.9} rugoso={0.2} />
          <Pieza forma={{ f: "caja", t: [0.14, 0.03, 0.04] }} {...ORO} pos={[0, 0.17, 0]} />
          <Pieza forma={{ f: "tubo", r: 0.02, h: 0.12 }} color="#3a2010" pos={[0, 0.25, 0]} />
        </group>
        {[[-0.4, -0.55], [0.9, 0.55], [-1.4, -0.4]].map(([x, z], i) => (
          <group key={i} position={[x, 0.91, z]}>
            <Pieza forma={{ f: "tubo", r: 0.035, h: 0.22 + i * 0.05 }} color="#f4ecd8" pos={[0, 0.11, 0]} />
            <Fuego pos={[0, 0.22 + i * 0.05, 0]} tam={0.35} luz={i === 0 ? 7 : 3} s={s + i * 2} />
          </group>
        ))}
        {/* taburetes y un barril como asiento */}
        {[-1.2, 0, 1.2].map((x, i) => (
          <Barril key={i} pos={[x, 0, -1.3]} />
        ))}
      </group>
      {/* mástil, vela y farol grande colgado sobre la mesa */}
      <Pieza forma={{ f: "tubo", r: 0.22, h: 14 }} color="#4a2c14" pos={[0, 7, -5.5]} />
      <VelaBarco pos={[0, 6.5, -5.2]} ancho={6} alto={4} s={s} color="#c8b898" />
      <Farol pos={[0, 3.6, -1.2]} s={s} cadena={0.6} luz={9} />
      <Caja pos={[3.0, 0, 1.6]} tam={0.7} rot={[0, 0.3, 0]} />
      <Barril pos={[-3.1, 0, 1.8]} />
      <Pieza forma={{ f: "aro", r: 0.35, g: 0.08 }} color="#c8a878" pos={[2.8, 0.08, -3]} rot={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

// ================================================================ BODEGA (del botín)
const Bodega: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const mad = texMadera(24, 45, 26, 10, [2, 2]);
  const W = 8, D = 12;
  return (
    <group>
      <Ambiente niebla={["#1a1208", 12, 45]} fondo="#0a0806" />
      <hemisphereLight args={["#ffd8a0", "#100a06", 0.6]} />
      <ambientLight intensity={0.12} color="#ffe0b0" />
      <pointLight position={[0.6, 1.6, -1.2]} intensity={14} distance={7} color="#ffc860" />
      <pointLight position={[-1.8, 1.4, -3.2]} intensity={9} distance={6} color="#ffb850" />
      <TPlano w={W} h={D} pos={[0, 0, -3]} rot={[-Math.PI / 2, 0, 0]} map={mad} />
      {/* cuadernas curvas del casco a los lados */}
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[0, 0, 2 - i * 1.3]}>
          {[-1, 1].map((l) => (
            <Pieza key={l} forma={{ f: "aro", r: 3.8, g: 0.12, arco: Math.PI / 2 }} color="#5a3418" pos={[0, 0.2, 0]} rot={[0, l < 0 ? Math.PI : 0, l < 0 ? Math.PI / 2 : 0]} />
          ))}
        </group>
      ))}
      {[-1, 1].map((l) => (
        <TPlano key={l} w={D} h={4} pos={[l * 3.6, 2, -3]} rot={[0, l < 0 ? Math.PI / 2 : -Math.PI / 2, 0]} map={mad} color="#7a5a40" />
      ))}
      <TPlano w={W} h={D} pos={[0, 3.8, -3]} rot={[Math.PI / 2, 0, 0]} map={mad} color="#6a4a30" />
      {/* rejilla en el techo por donde entra luz */}
      <group position={[0.5, 3.78, -2]}>
        <Pieza forma={{ f: "caja", t: [1.6, 0.02, 1.6] }} color="#ffe8b0" brillo="#ffe0a0" intensidad={1.5} basica />
        {[-0.6, -0.2, 0.2, 0.6].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.06, 0.08, 1.6] }} color="#3a2010" pos={[x, -0.03, 0]} />
        ))}
        <Haz pos={[0, 0, 0]} rot={[0.1, 0, 0.12]} largo={4.2} ancho={1.0} color="#ffe8b0" o={0.08 + 0.02 * Math.sin(f * 0.05)} />
        <spotLight position={[0, -0.1, 0]} target-position={[0.3, -4, 0.3]} angle={0.5} penumbra={0.6} intensity={20} distance={8} color="#ffe8c0" />
      </group>
      {/* montañas de oro, cofres abiertos, joyas */}
      <Monedas pos={[0.6, 0, -2.5]} n={40} radio={1.3} alto={0.9} s={s} />
      <Monedas pos={[-1.8, 0, -4.2]} n={24} radio={0.9} alto={0.6} s={s + 1} />
      <Cofre pos={[2.0, 0, -0.6]} rot={[0, -0.6, 0]} oro s={s + 2} />
      <Cofre pos={[-2.2, 0, -1.2]} rot={[0, 0.7, 0]} oro s={s + 3} />
      <Cofre pos={[-0.6, 0, -6]} rot={[0, 0.2, 0]} s={s + 4} />
      {Array.from({ length: 10 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.06, seg: 8 }} color={["#e02040", "#20a060", "#3060e0", "#c040e0"][i % 4]} brillo={["#e02040", "#20a060", "#3060e0", "#c040e0"][i % 4]} intensidad={0.8} pos={[0.6 + Math.cos(i * 1.7) * 0.9, 0.3 + (i % 3) * 0.15, -2.5 + Math.sin(i * 1.7) * 0.9]} />
      ))}
      {/* libro de cuentas sobre un barril */}
      <group position={[2.4, 0, -3.6]}>
        <Barril pos={[0, 0, 0]} />
        <Pieza forma={{ f: "caja", t: [0.5, 0.06, 0.36] }} color="#7a1a1a" pos={[0, 0.95, 0]} />
        <Pieza forma={{ f: "caja", t: [0.46, 0.03, 0.32] }} color="#f2e6c8" pos={[0, 0.99, 0]} />
        <Farol pos={[0.2, 1.35, -0.2]} s={s} cadena={0} luz={4} />
      </group>
      <Barril pos={[-2.8, 0, -7]} />
      <Barril pos={[-2.2, 0, -7.4]} />
      <Caja pos={[2.6, 0, -7]} tam={0.8} />
    </group>
  );
};

// ================================================================ ENFERMERÍA (del cirujano, bajo cubierta)
const Enfermeria: React.FC<{ s: number }> = ({ s }) => {
  const mad = texMadera(24, 44, 30, 6);
  const W = 7, D = 7, H = 2.8;
  return (
    <group>
      <Ambiente niebla={["#14100c", 12, 40]} fondo="#0a0806" />
      <hemisphereLight args={["#e8dcc8", "#120c08", 0.35]} />
      <ambientLight intensity={0.06} />
      <SalaMadera w={W} d={D} h={H} tono={28} s={s} />
      {/* ojo de buey con el mar de noche */}
      <group position={[0, 1.7, -D / 2 + 0.05]}>
        <Pieza forma={{ f: "disco", r: 0.38 }} color="#3a5aa8" brillo="#4a6ac8" intensidad={0.8} basica />
        <Pieza forma={{ f: "aro", r: 0.42, g: 0.06 }} color="#c99a3a" metal={0.8} rugoso={0.3} />
        <Haz pos={[0, 0, 0.1]} rot={[-1.3, 0, 0]} largo={3} ancho={0.4} color="#a8c0ff" o={0.05} />
      </group>
      {/* mesa de operaciones con instrumentos */}
      <group position={[0.4, 0, -1.6]}>
        <TCaja t={[2.0, 0.1, 0.9]} pos={[0, 0.85, 0]} map={mad} color="#c09a70" />
        {[-0.9, 0.9].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.1, 0.8, 0.8] }} color="#4a2a12" pos={[x, 0.4, 0]} />
        ))}
        <Pieza forma={{ f: "caja", t: [1.6, 0.04, 0.7] }} color="#e8e0cc" pos={[0, 0.92, 0]} />
        {/* sierra */}
        <group position={[-0.4, 0.95, 0.1]} rotation={[-Math.PI / 2, 0, 0.3]}>
          <Pieza forma={{ f: "caja", t: [0.5, 0.1, 0.01] }} color="#c8ccd4" metal={0.9} rugoso={0.25} />
          <Pieza forma={{ f: "caja", t: [0.14, 0.12, 0.04] }} color="#5a3216" pos={[0.3, 0.02, 0]} />
        </group>
        {/* frascos de colores */}
        {Array.from({ length: 6 }, (_, i) => (
          <Botella key={i} pos={[0.2 + (i % 3) * 0.18, 0.92, -0.2 + Math.floor(i / 3) * 0.2]} color={["#3a8a5a", "#8a2a2a", "#c8a03a", "#3a5aa8"][i % 4]} alto={0.18 + (i % 2) * 0.06} />
        ))}
        <Pieza forma={{ f: "tubo", r: 0.12, h: 0.2 }} color="#e8e0cc" pos={[0.75, 1.0, 0.2]} />
      </group>
      {/* caja de medicinas abierta, con compartimentos */}
      <group position={[-2.4, 0, -1.2]} rotation={[0, 0.5, 0]}>
        <TCaja t={[1.0, 0.6, 0.6]} pos={[0, 0.3, 0]} map={mad} color="#8a5a34" />
        <group position={[0, 0.6, -0.3]} rotation={[-1.9, 0, 0]}>
          <TCaja t={[1.0, 0.06, 0.6]} pos={[0, 0, 0.3]} map={mad} color="#8a5a34" />
        </group>
        {Array.from({ length: 8 }, (_, i) => (
          <Botella key={i} pos={[-0.36 + (i % 4) * 0.24, 0.45, -0.12 + Math.floor(i / 4) * 0.22]} color={["#3a8a5a", "#8a2a2a", "#c8a03a", "#3a5aa8"][(i + 1) % 4]} alto={0.22} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.08, 0.3, 0.3] }} color="#e0e0e0" pos={[0.6, 0.15, 0]} />
      </group>
      {/* hamaca y vendas colgando */}
      <group position={[2.3, 1.2, 0.4]}>
        <Pieza forma={{ f: "bola", r: 1, seg: 18 }} color="#d8ccb0" esc={[0.5, 0.18, 1.1]} />
        <Pieza forma={{ f: "tubo", r: 0.015, h: 1.5 }} color="#8a7a5a" pos={[0, 0.8, -1.0]} rot={[0.5, 0, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.015, h: 1.5 }} color="#8a7a5a" pos={[0, 0.8, 1.0]} rot={[-0.5, 0, 0]} />
      </group>
      {/* escritorio pequeño donde escribe su libro: tintero, pluma, libro abierto */}
      <group position={[-2.6, 0, 1.6]} rotation={[0, Math.PI / 2, 0]}>
        <TCaja t={[1.2, 0.08, 0.6]} pos={[0, 0.78, 0]} map={mad} color="#b08a60" />
        <Pieza forma={{ f: "caja", t: [1.1, 0.74, 0.5] }} color="#5a3418" pos={[0, 0.37, 0]} />
        <Pieza forma={{ f: "caja", t: [0.32, 0.03, 0.42] }} color="#f2e6c8" pos={[-0.17, 0.84, 0]} rot={[0, 0, 0.06]} />
        <Pieza forma={{ f: "caja", t: [0.32, 0.03, 0.42] }} color="#f2e6c8" pos={[0.17, 0.84, 0]} rot={[0, 0, -0.06]} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.07 }} color="#1a1a22" pos={[0.45, 0.85, -0.15]} />
        <Pieza forma={{ f: "cono", r: 0.02, h: 0.35, seg: 6 }} color="#f4f2ea" pos={[0.47, 0.98, -0.13]} rot={[0.3, 0, -0.5]} />
        <group position={[-0.45, 0.82, -0.15]}>
          <Pieza forma={{ f: "tubo", r: 0.035, h: 0.18 }} color="#f4ecd8" pos={[0, 0.09, 0]} />
          <Fuego pos={[0, 0.18, 0]} tam={0.32} luz={5} s={s} />
        </group>
      </group>
      <Farol pos={[0.2, H, 0.3]} s={s} luz={6} cadena={0.3} />
      <Barril pos={[2.6, 0, -2.6]} />
      <Caja pos={[2.7, 0, 2.6]} tam={0.6} />
    </group>
  );
};

// ================================================================ OFICINA (de seguros, moderna y fría)
const Oficina: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const moqueta = texMoqueta([6, 6]);
  const pantalla = texDenegado();
  const W = 12, D = 12, H = 3;
  const parpadeo = f % 47 < 2 ? 0.6 : 1; // un fluorescente que falla
  return (
    <group>
      <Ambiente niebla={["#c8d2dc", 18, 60]} fondo="#aab4be" />
      <hemisphereLight args={["#e8f0ff", "#4a4e56", 0.9]} />
      <ambientLight intensity={0.25} color="#dfe8f4" />
      <TPlano w={W} h={D} pos={[0, 0, -3]} rot={[-Math.PI / 2, 0, 0]} map={moqueta} />
      {/* paredes lisas gris claro, ventanal a la ciudad de noche */}
      <Pieza forma={{ f: "caja", t: [0.1, H, D] }} color="#d6dae0" pos={[-W / 2, H / 2, -3]} />
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#d6dae0" pos={[0, H / 2, D / 2 - 3]} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#eef0f2" pos={[0, H, -3]} />
      <group position={[W / 2, 0, -3]}>
        <Pieza forma={{ f: "caja", t: [0.05, H, D] }} color="#1a2238" basica />
        {Array.from({ length: 40 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.02, 0.08 + R(s, "vh", i) * 0.15, 0.08] }} color="#ffd890" basica pos={[-0.04, 0.4 + R(s, "vy", i) * 2.2, -5.5 + R(s, "vz", i) * 11]} />
        ))}
        {[-3, 0, 3].map((z) => (
          <Pieza key={z} forma={{ f: "caja", t: [0.12, H, 0.1] }} color="#9aa2ac" pos={[-0.05, H / 2, z]} metal={0.6} />
        ))}
      </group>
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#d6dae0" pos={[0, H / 2, -9]} />
      {/* fluorescentes del techo */}
      {[-3, 0, 3].map((x) =>
        [-6, -2.5, 1].map((z) => (
          <group key={`${x}${z}`} position={[x, H - 0.03, z]}>
            <Pieza forma={{ f: "caja", t: [1.2, 0.04, 0.4] }} color="#f4faff" brillo="#e8f4ff" intensidad={x === 3 && z === -2.5 ? 1.4 * parpadeo : 1.4} basica />
          </group>
        )),
      )}
      <pointLight position={[-1, H - 0.3, -1]} intensity={9} distance={9} color="#e8f2ff" />
      <pointLight position={[2, H - 0.3, -5]} intensity={7} distance={9} color="#e8f2ff" />
      {/* cubículos */}
      {[-3.2, 0.2].map((x) =>
        [-6.5, -3.5].map((z) => (
          <group key={`${x}${z}`} position={[x, 0, z]}>
            <Pieza forma={{ f: "caja", t: [2.4, 1.3, 0.06] }} color="#7a8696" pos={[0, 0.65, -0.7]} />
            <Pieza forma={{ f: "caja", t: [0.06, 1.3, 1.4] }} color="#7a8696" pos={[1.2, 0.65, 0]} />
            <Pieza forma={{ f: "caja", t: [2.0, 0.05, 0.8] }} color="#c8b8a0" pos={[0, 0.75, -0.25]} />
            <Pieza forma={{ f: "caja", t: [0.5, 0.32, 0.03] }} color="#1a1c22" pos={[0, 1.0, -0.5]} />
            <Pieza forma={{ f: "caja", t: [0.46, 0.28, 0.01] }} color="#7fb0e8" basica pos={[0, 1.0, -0.48]} />
            <Pieza forma={{ f: "tubo", r: 0.25, h: 0.08 }} color="#2a2c32" pos={[0, 0.45, 0.3]} />
          </group>
        )),
      )}
      {/* EL escritorio: la pantalla con el «DENIED» */}
      <group position={[-1.2, 0, -0.6]}>
        <Pieza forma={{ f: "caja", t: [2.0, 0.06, 0.9] }} color="#d8c8b0" pos={[0, 0.76, 0]} />
        {[-0.95, 0.95].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.06, 0.74, 0.85] }} color="#8a929c" pos={[x, 0.37, 0]} metal={0.4} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.86, 0.54, 0.05] }} color="#16181e" pos={[0.1, 1.15, -0.28]} />
        <TPlano w={0.8} h={0.5} pos={[0.1, 1.15, -0.25]} map={pantalla} brillo={0.9} />
        <Pieza forma={{ f: "caja", t: [0.1, 0.25, 0.08] }} color="#16181e" pos={[0.1, 0.89, -0.3]} />
        <Pieza forma={{ f: "caja", t: [0.5, 0.02, 0.16] }} color="#2a2c32" pos={[0.1, 0.8, 0.05]} />
        <Pieza forma={{ f: "caja", t: [0.35, 0.12, 0.25] }} color="#f4f4f6" pos={[-0.6, 0.85, 0.1]} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.12 }} color="#c0242c" pos={[0.75, 0.85, 0.15]} />
        {/* sello rojo de goma */}
        <Pieza forma={{ f: "tubo", r: 0.04, h: 0.1 }} color="#3a2a1a" pos={[0.55, 0.84, 0.2]} />
        <Pieza forma={{ f: "caja", t: [0.12, 0.03, 0.08] }} color="#c0242c" pos={[0.55, 0.79, 0.2]} />
      </group>
      {/* archivadores, dispensador de agua y planta */}
      {[[-5.3, -1], [-5.3, -2.2]].map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <Pieza forma={{ f: "caja", t: [0.6, 1.3, 1.0] }} color="#9aa2ac" pos={[0, 0.65, 0]} metal={0.5} rugoso={0.4} />
          {[0.3, 0.65, 1.0].map((y) => (
            <Pieza key={y} forma={{ f: "caja", t: [0.02, 0.05, 0.3] }} color="#5a626c" pos={[0.31, y, 0]} metal={0.6} />
          ))}
        </group>
      ))}
      <group position={[4.8, 0, 1.5]}>
        <Pieza forma={{ f: "caja", t: [0.4, 1.0, 0.4] }} color="#e8eaee" pos={[0, 0.5, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.17, h: 0.45 }} color="#9fd0ff" pos={[0, 1.25, 0]} opacidad={0.75} />
      </group>
      <group position={[4.6, 0, -7.6]}>
        <Pieza forma={{ f: "tubo", r: 0.25, r2: 0.2, h: 0.45 }} color="#c8c0b0" pos={[0, 0.22, 0]} />
        {Array.from({ length: 7 }, (_, i) => (
          <Pieza key={i} forma={{ f: "cono", r: 0.14, h: 1.0, seg: 5 }} color="#3a8a4a" pos={[Math.sin(i * 0.9) * 0.15, 0.85, Math.cos(i * 0.9) * 0.15]} rot={[Math.cos(i * 0.9) * 0.35, 0, -Math.sin(i * 0.9) * 0.35]} />
        ))}
      </group>
      <Letrero texto="CLAIMS DEPARTMENT" pos={[0, 2.4, -8.94]} ancho={4} alto={0.45} fondo="#2a5fa8" tinta="#ffffff" />
      <Letrero texto="WE CARE ABOUT YOU" pos={[-5.94, 2.2, -4]} rot={[0, Math.PI / 2, 0]} ancho={3} alto={0.4} fondo="transparent" tinta="#2a5fa8" />
    </group>
  );
};

export const ESCENARIOS_PIRATA = { taberna: Taberna, trono: Trono, puerto: Muelle, abordaje: Abordaje, consejo: Consejo, bodega: Bodega, enfermeria: Enfermeria, aseguradora: Oficina };
