// Escenarios del vídeo «For 100 Years, Sailors Who Saw Giant Waves Were Called Liars» (idea 7). Nivel del camarote,
// cada uno con su sitio, época, luz y paleta:
// - tormenta: cubierta de un velero en plena tormenta de noche (relámpagos, lluvia, farol) con la ola gigante detrás.
// - academia: sala de conferencias de 1900 (pizarra con ecuaciones e «IMPOSSIBLE», lámparas de gas, estanterías,
//   tanque de olas, globo, ventanales con la tormenta).
// - expediente: despacho de la investigación marítima (tablón «LOST AT SEA», carpetas «CASE CLOSED», sello, máquina
//   de escribir, campana de barco, mapa con chinchetas).
// - draupner: plataforma de gas Draupner E en el mar del Norte, noche del 1 de enero de 1995 (patas de acero, grúa,
//   antorcha de gas, luces de sodio, helipuerto y el láser rojo que mide cada ola).
// - control: sala de control de la plataforma en 1995 (pantalla con el pico de 25,6 m, registrador de papel, alarma).
// - espacio: la Tierra desde la órbita, el sol y el océano barrido por el radar del satélite.
// - bar: bar de marineros en el puerto, de noche (neón «THE ROGUE WAVE», grifos de cerveza, foto de la ola, red).
import React from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { azar } from "./azar";
import { Ambiente } from "./escenarios";
import { Estrellas, Halo, Haz, Letrero, Mar } from "./escenarios-azorian";
import { LamparaVerde, Lluvia, Nubes, Telefono } from "./escenarios-habakkuk";
import { Barril, Caja, Fuego, Resplandor, TCaja, TPlano } from "./escenarios-nuevos";
import { Botella, Farol, Humo, Jarra, VelaBarco, Ventana } from "./escenarios-pirata";
import { Torre } from "./modelos-azorian";
import { OlaGigante } from "./modelos-olas";
import { Cielo, Pieza } from "./piezas3d";
import { texAlfombra, texLosas, texMadera, texPiedra } from "./texturas-pintadas";
import { texAcero, texCarpeta, texCartaNorte, texFotoOla, texMonitor, texNeon, texPantallaOla, texPapelRegistro, texPizarraOlas, texTablonPerdidos, texTierra } from "./texturas-olas";

type V3 = [number, number, number];
const R = (s: number, ...k: (string | number)[]) => azar(s, "ol", ...k);
const AMARILLO = "#f2c41e";

// ---------------------------------------------------------------- piezas comunes
/** Relámpago: destello periódico (luz fría que lo baña todo) y el rayo dibujado en el cielo. */
export const Relampago: React.FC<{ s: number; pos: V3; periodo?: number; fuerza?: number }> = ({ s, pos, periodo = 95, fuerza = 1 }) => {
  const f = useCurrentFrame();
  const t = (f + s * 23) % periodo;
  const k = t < 3 ? 1 : t < 6 ? 0.35 : t < 8 ? 0.8 : 0;
  const tramos = Array.from({ length: 8 }, (_, i) => [(R(s, "rx", i, Math.floor((f + s * 23) / periodo)) - 0.5) * 14, -i * 9] as [number, number]);
  return (
    <group>
      {k > 0 && (
        <group position={pos}>
          {tramos.slice(1).map(([x, y], i) => {
            const [x0, y0] = tramos[i];
            const dx = x - x0, dy = y - y0;
            const l = Math.hypot(dx, dy);
            return <Pieza key={i} forma={{ f: "caja", t: [0.9, l, 0.9] }} color="#f4f8ff" basica pos={[(x + x0) / 2, (y + y0) / 2, 0]} rot={[0, 0, Math.atan2(-dx, dy)]} />;
          })}
          <Resplandor pos={[0, -30, 0]} r={40} color="#b8d0ff" o={0.15 * k} />
        </group>
      )}
      <directionalLight position={[pos[0], pos[1], pos[2] + 40]} intensity={1.8 * k * fuerza} color="#d8e6ff" />
    </group>
  );
};

/** Rollo de cabo en cubierta. */
export const Cabo: React.FC<{ pos: V3; r?: number }> = ({ pos, r = 0.35 }) => (
  <group position={pos}>
    {[0, 1, 2, 3].map((i) => (
      <Pieza key={i} forma={{ f: "aro", r: r - i * 0.05, g: 0.035 }} color="#b8a070" pos={[0, 0.04 + i * 0.06, 0]} rot={[Math.PI / 2, 0, 0]} />
    ))}
  </group>
);

/** Estantería con libros de lomos de colores. */
export const Estanteria: React.FC<{ pos: V3; rot?: V3; ancho?: number; alto?: number; s: number }> = ({ pos, rot, ancho = 2.4, alto = 2.6, s }) => {
  const mad = texMadera(22, 46, 26, 4);
  const baldas = Math.floor(alto / 0.45);
  return (
    <group position={pos} rotation={rot}>
      <TCaja t={[ancho, alto, 0.4]} pos={[0, alto / 2, -0.05]} map={mad} color="#6a4a30" />
      {Array.from({ length: baldas }, (_, j) => {
        let x = -ancho / 2 + 0.1;
        const libros: React.ReactNode[] = [];
        let i = 0;
        while (x < ancho / 2 - 0.15) {
          const w = 0.05 + R(s, "lw", j, i) * 0.06;
          const h = 0.26 + R(s, "lh", j, i) * 0.12;
          libros.push(
            <Pieza key={i} forma={{ f: "caja", t: [w, h, 0.26] }} color={["#7a1a22", "#1a3a6a", "#2a5a2a", "#8a6a2a", "#3a2a1a", "#5a2a5a", "#c0a060"][(i + j * 3) % 7]} pos={[x + w / 2, 0.12 + j * 0.45 + h / 2, 0.08]} rot={[0, 0, R(s, "lr", j, i) > 0.92 ? 0.2 : 0]} />,
          );
          x += w + 0.008;
          i++;
        }
        return <group key={j}>{libros}</group>;
      })}
    </group>
  );
};

/** Lámpara de gas de pared (latón y globo de cristal) con luz cálida. */
export const LamparaGas: React.FC<{ pos: V3; rot?: V3; luz?: number; s: number }> = ({ pos, rot, luz = 5, s }) => {
  const f = useCurrentFrame();
  const k = 0.9 + 0.1 * Math.sin(f * 0.4 + s);
  return (
    <group position={pos} rotation={rot}>
      <Pieza forma={{ f: "tubo", r: 0.02, h: 0.3 }} color="#b8903a" pos={[0, 0, 0.15]} rot={[Math.PI / 2, 0, 0]} metal={0.8} rugoso={0.3} />
      <Pieza forma={{ f: "bola", r: 0.11, seg: 14 }} color="#fff0c8" brillo="#ffc870" intensidad={1.4} pos={[0, 0.1, 0.3]} basica />
      <Resplandor pos={[0, 0.1, 0.3]} r={0.5} color="#ffb860" o={0.25 * k} />
      {luz > 0 && <pointLight position={[0, 0.1, 0.45]} intensity={luz * k} distance={7} decay={1.6} color="#ffc070" />}
    </group>
  );
};

/** Ventanal alto con la tormenta fuera (lluvia que corre y el destello de los relámpagos). */
export const VentanalTormenta: React.FC<{ pos: V3; rot?: V3; ancho?: number; alto?: number; s: number }> = ({ pos, rot, ancho = 1.4, alto = 2.4, s }) => {
  const f = useCurrentFrame();
  const t = (f + s * 23) % 95;
  const destello = t < 3 ? 1 : t < 8 ? 0.4 : 0;
  return (
    <group position={pos} rotation={rot}>
      <Pieza forma={{ f: "caja", t: [ancho, alto, 0.02] }} color={destello ? "#c8d8ff" : "#22345a"} basica />
      {Array.from({ length: 16 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.012, 0.12, 0.01] }} color="#8aa8d8" basica pos={[(R(s, "gx", i) - 0.5) * ancho * 0.9, alto / 2 - ((f * 0.03 + R(s, "gy", i) * alto) % alto), 0.02]} />
      ))}
      {[-ancho / 2, 0, ancho / 2].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.07, alto + 0.08, 0.1] }} color="#2a1a10" pos={[x, 0, 0.04]} />
      ))}
      {[-alto / 2, -alto / 6, alto / 6, alto / 2].map((y) => (
        <Pieza key={y} forma={{ f: "caja", t: [ancho + 0.08, 0.07, 0.1] }} color="#2a1a10" pos={[0, y, 0.04]} />
      ))}
      <pointLight position={[0, 0, 0.6]} intensity={2 + 10 * destello} distance={6} color="#a8c0ff" />
    </group>
  );
};

/** Barandilla amarilla de acero (plataforma). */
export const Barandilla: React.FC<{ pos: V3; largo: number; rot?: V3 }> = ({ pos, largo, rot }) => (
  <group position={pos} rotation={rot}>
    {[0.5, 1.05].map((y) => (
      <Pieza key={y} forma={{ f: "tubo", r: 0.025, h: largo }} color={AMARILLO} pos={[0, y, 0]} rot={[Math.PI / 2, 0, 0]} metal={0.4} rugoso={0.5} />
    ))}
    {Array.from({ length: Math.floor(largo / 1.2) + 1 }, (_, i) => (
      <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 1.1 }} color={AMARILLO} pos={[0, 0.55, -largo / 2 + i * 1.2]} metal={0.4} rugoso={0.5} />
    ))}
  </group>
);

/** Foco de sodio (naranja) de la plataforma. */
export const FocoSodio: React.FC<{ pos: V3; luz?: number; rot?: V3 }> = ({ pos, luz = 12, rot = [0.5, 0, 0] }) => (
  <group position={pos}>
    <Pieza forma={{ f: "caja", t: [0.3, 0.18, 0.2] }} color="#3a3c40" metal={0.6} />
    <Pieza forma={{ f: "caja", t: [0.26, 0.02, 0.16] }} color="#ffd890" brillo="#ffb050" intensidad={2} basica pos={[0, -0.1, 0]} />
    <Resplandor pos={[0, -0.12, 0]} r={0.6} color="#ffaa40" o={0.35} />
    <Haz pos={[0, -0.12, 0]} rot={rot} largo={8} ancho={2.6} color="#ffb860" o={0.035} />
    {luz > 0 && <pointLight position={[0, -0.4, 0]} intensity={luz} distance={14} decay={1.5} color="#ffb060" />}
  </group>
);

// ================================================================ TORMENTA (cubierta de un velero en tormenta, de noche)
const Tormenta: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const cubierta = texMadera(28, 30, 30, 8, [2, 6]);
  const borda = texMadera(22, 36, 22, 4, [6, 1]);
  const casco = texMadera(18, 30, 16, 10, [4, 1]);
  const ola = Math.min(1, 0.7 + f * 0.0015); // la ola gigante crece despacio al fondo
  return (
    <group>
      <Ambiente niebla={["#14222e", 30, 260]} fondo="#0a141e" />
      <Cielo arriba="#060c14" medio="#2a3e50" abajo="#101c26" radio={330} />
      <Nubes s={s} color="#1e2c3a" n={14} y={70} />
      <hemisphereLight args={["#6a8aa8", "#0a1218", 0.55]} />
      <directionalLight position={[-30, 40, -60]} intensity={0.8} color="#9ab8d8" />
      <Relampago s={s} pos={[40, 120, -200]} />
      <Mar y={-2.4} color="#16323e" amp={1.4} ola={0.7} brillo={0.35} tam={900} />
      {/* la ola monstruo detrás de la popa */}
      <group position={[-4, -2.4, -78 + Math.min(f, 260) * 0.09]} scale={130}>
        <OlaGigante sube={ola} rompe={0.2} seva={0} alto={0.34} color="#1e5462" />
      </group>
      {/* cubierta */}
      <TPlano w={6} h={22} pos={[0, 0, -5]} rot={[-Math.PI / 2, 0, 0]} map={cubierta} />
      {[-3, 3].map((x) => (
        <TCaja key={x} t={[0.25, 1.0, 22]} pos={[x, 0.5, -5]} map={borda} />
      ))}
      <TCaja t={[6.6, 3, 22]} pos={[0, -1.55, -5]} map={casco} />
      {/* mástil con velas rasgadas que flamean y la jarcia */}
      <group position={[0, 0, -6]}>
        <Pieza forma={{ f: "tubo", r: 0.2, h: 18 }} color="#3a2414" pos={[0, 9, 0]} />
        <VelaBarco pos={[0, 7, 0.3]} ancho={5.4} alto={4} s={s} color="#c8bca0" />
        <VelaBarco pos={[0, 12, 0.3]} ancho={4.2} alto={3} s={s + 4} color="#c0b498" rot={[0, 0, 0.12]} />
        {[-1, 1].map((l) =>
          Array.from({ length: 5 }, (_, i) => (
            <Pieza key={`${l}${i}`} forma={{ f: "tubo", r: 0.015, h: 11 }} color="#5a4a36" pos={[l * (1.3 + i * 0.22), 5.2, 0.4 - i * 0.3]} rot={[0, 0, l * 0.3]} />
          )),
        )}
      </group>
      {/* timón al fondo, campana y bitácora */}
      <group position={[0, 0, -13]}>
        <Pieza forma={{ f: "tubo", r: 0.1, h: 1.1 }} color="#4a2c14" pos={[0, 0.55, 0]} />
        <group position={[0, 1.3, 0.12]}>
          <Pieza forma={{ f: "aro", r: 0.55, g: 0.05 }} color="#6a3c1a" />
          {Array.from({ length: 8 }, (_, i) => (
            <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 1.5 }} color="#6a3c1a" rot={[0, 0, (i / 8) * Math.PI]} />
          ))}
        </group>
      </group>
      <group position={[2.2, 0, -2.8]}>
        <Pieza forma={{ f: "tubo", r: 0.05, h: 1.6 }} color="#3a2414" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.18, r2: 0.08, h: 0.3, seg: 14 }} color="#c89a3a" pos={[0, 1.4, 0.15]} metal={0.9} rugoso={0.25} />
      </group>
      {/* farol que se mece: la única luz cálida contra la tormenta */}
      <Farol pos={[-1.6, 3.1, 1]} s={s} cadena={0.6} luz={10} />
      <Farol pos={[1.4, 3.4, -9]} s={s + 3} cadena={0.4} luz={6} />
      {/* carga suelta, barriles y cabos */}
      <Barril pos={[-2.4, 0, 3.2]} />
      <Barril pos={[-2.5, 0, 2.4]} rot={[Math.PI / 2, 0.6, 0]} />
      <Caja pos={[2.3, 0, 3.4]} tam={0.7} rot={[0, 0.4, 0]} />
      <Cabo pos={[1.8, 0, 0.6]} />
      <Cabo pos={[-2.2, 0, -4]} r={0.3} />
      {/* agua que barre la cubierta y rocío */}
      {Array.from({ length: 6 }, (_, i) => {
        const t = ((f + i * 25) % 150) / 150;
        return <Pieza key={i} forma={{ f: "caja", t: [0.6 + i * 0.1, 0.02, 0.4] }} color="#c8e0ec" opacidad={0.45 * Math.sin(t * Math.PI)} pos={[-3 + t * 6, 0.03, -2 + i * 0.9]} basica />;
      })}
      <Lluvia s={s} n={260} zona={30} alto={18} />
    </group>
  );
};

// ================================================================ ACADEMIA (sala de conferencias, 1900)
const Academia: React.FC<{ s: number }> = ({ s }) => {
  const suelo = texMadera(26, 44, 32, 10, [3, 3]);
  const pared = texMadera(20, 40, 22, 12, [3, 1]);
  const pizarra = texPizarraOlas();
  const alfombra = texAlfombra("#5a1a22", "#c99a3a", "#2a1a14");
  const W = 12, D = 10, H = 4.6;
  return (
    <group>
      <Ambiente niebla={["#1a120c", 16, 50]} fondo="#0e0a08" />
      <hemisphereLight args={["#ffdcb0", "#1a120a", 0.35]} />
      <ambientLight intensity={0.1} color="#ffe0c0" />
      {/* suelo, paredes con boiserie y techo con molduras */}
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={4} h={6} pos={[0, 0.01, -1.5]} rot={[-Math.PI / 2, 0, 0]} map={alfombra} />
      <TPlano w={W} h={H} pos={[0, H / 2, -6]} map={pared} color="#a07a5a" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} color="#a07a5a" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} color="#a07a5a" />
      <TPlano w={W} h={H} pos={[0, H / 2, 4]} rot={[0, Math.PI, 0]} map={pared} color="#a07a5a" />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#3a2618" pos={[0, H, -1]} />
      {[-4, -1.5, 1].map((z) => (
        <Pieza key={z} forma={{ f: "caja", t: [W, 0.25, 0.3] }} color="#4a301e" pos={[0, H - 0.15, z]} />
      ))}
      {/* LA pizarra al fondo, con su marco y la repisa de tizas */}
      <group position={[0, 0, -5.9]}>
        <TPlano w={5.2} h={2.6} pos={[0, 2.35, 0.02]} map={pizarra} brillo={0.15} />
        <Pieza forma={{ f: "caja", t: [5.3, 0.08, 0.2] }} color="#4a2c14" pos={[0, 1.02, 0.1]} />
        {[-1.6, -0.4, 0.9].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.1, 0.025, 0.025] }} color="#f4f2ea" pos={[x, 1.07, 0.12]} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.25, 0.08, 0.1] }} color="#8a6a4a" pos={[1.8, 1.08, 0.12]} />
      </group>
      {/* atril del conferenciante y mesa con el tanque de olas, el globo y el modelo de barco */}
      <group position={[-2.6, 0, -3.6]}>
        <Pieza forma={{ f: "caja", t: [0.7, 1.15, 0.5] }} color="#5a3820" pos={[0, 0.58, 0]} />
        <Pieza forma={{ f: "caja", t: [0.8, 0.06, 0.6] }} color="#6a4428" pos={[0, 1.2, 0.02]} rot={[0.3, 0, 0]} />
        <Pieza forma={{ f: "caja", t: [0.4, 0.02, 0.3] }} color="#f2ead8" pos={[0, 1.25, 0.04]} rot={[0.3, 0, 0]} />
      </group>
      <group position={[2.4, 0, -3.8]}>
        <TCaja t={[2.4, 0.08, 1]} pos={[0, 0.85, 0]} map={texMadera(24, 46, 30, 3)} />
        {[-1.1, 1.1].map((x) => [-0.4, 0.4].map((z) => <Pieza key={`${x}${z}`} forma={{ f: "tubo", r: 0.04, h: 0.85 }} color="#3a2414" pos={[x, 0.42, z]} />))}
        {/* tanque de olas de cristal */}
        <Pieza forma={{ f: "caja", t: [1.3, 0.4, 0.4] }} color="#cfe8f0" opacidad={0.3} pos={[-0.3, 1.1, 0]} />
        <Pieza forma={{ f: "caja", t: [1.26, 0.22, 0.36] }} color="#3a8aa8" opacidad={0.7} pos={[-0.3, 1.0, 0]} />
        {/* globo terráqueo */}
        <group position={[0.85, 0.89, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.08, h: 0.06 }} color="#3a2414" pos={[0, 0.03, 0]} />
          <Pieza forma={{ f: "bola", r: 0.24, seg: 24 }} color="#c8b47a" pos={[0, 0.34, 0]} />
          <Pieza forma={{ f: "aro", r: 0.27, g: 0.012, arco: Math.PI }} color="#b8903a" pos={[0, 0.34, 0]} rot={[0, 0, 0.4]} metal={0.8} />
        </group>
      </group>
      {/* estanterías llenas de libros a los lados */}
      <Estanteria pos={[-5.8, 0, -2.5]} rot={[0, Math.PI / 2, 0]} ancho={3} alto={3.2} s={s} />
      <Estanteria pos={[5.8, 0, -1]} rot={[0, -Math.PI / 2, 0]} ancho={2.6} alto={3.2} s={s + 1} />
      {/* bancadas escalonadas del público (científicos con chistera) */}
      {[-3.9, 3.9].map((x) =>
        [0, 1].map((fila) => (
          <group key={`${x}${fila}`} position={[x, fila * 0.35, 0.2 + fila * 0.9]} rotation={[0, x < 0 ? 0.5 : -0.5, 0]}>
            <TCaja t={[2.6, 0.12, 0.6]} pos={[0, 0.48, 0]} map={texMadera(24, 44, 26, 3)} />
            <TCaja t={[2.6, 0.7, 0.08]} pos={[0, 0.75, 0.3]} map={texMadera(22, 44, 22, 3)} />
            {[-0.8, 0, 0.8].map((k) => (
              <group key={k} position={[k, 0.55, 0.05]}>
                <Pieza forma={{ f: "tubo", r: 0.15, h: 0.06 }} color="#16141a" />
                <Pieza forma={{ f: "tubo", r: 0.09, h: 0.18 }} color="#16141a" pos={[0, 0.1, 0]} />
              </group>
            ))}
          </group>
        )),
      )}
      {/* retratos de sabios en las paredes y un cuadro de barco */}
      {[[-5.95, 2.9, -4.8, Math.PI / 2], [5.95, 2.9, -3.4, -Math.PI / 2], [5.95, 2.9, 1.2, -Math.PI / 2]].map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]} rotation={[0, r, 0]}>
          <Pieza forma={{ f: "caja", t: [0.9, 1.1, 0.06] }} color="#b8903a" metal={0.7} rugoso={0.35} />
          <Pieza forma={{ f: "caja", t: [0.74, 0.94, 0.02] }} color={["#3a2a22", "#2a2a36", "#22303a"][i]} pos={[0, 0, 0.035]} />
          <Pieza forma={{ f: "bola", r: 0.16, seg: 14 }} color="#e8dcc8" pos={[0, 0.12, 0.05]} esc={[1, 1.2, 0.3]} />
          <Pieza forma={{ f: "caja", t: [0.44, 0.34, 0.02] }} color="#1a1a20" pos={[0, -0.24, 0.05]} />
        </group>
      ))}
      {/* ventanales con la tormenta (luz fría) y lámparas de gas (luz cálida) */}
      <VentanalTormenta pos={[-5.92, 2.4, 0.8]} rot={[0, Math.PI / 2, 0]} s={s} />
      <VentanalTormenta pos={[-5.92, 2.4, 2.8]} rot={[0, Math.PI / 2, 0]} s={s + 2} />
      <LamparaGas pos={[-2.9, 2.6, -5.95]} s={s} luz={6} />
      <LamparaGas pos={[2.9, 2.6, -5.95]} s={s + 1} luz={6} />
      <LamparaGas pos={[5.95, 2.6, -2.2]} rot={[0, -Math.PI / 2, 0]} s={s + 2} luz={4} />
      {/* araña de gas en el centro */}
      <group position={[0, H - 0.9, -1.8]}>
        <Pieza forma={{ f: "tubo", r: 0.015, h: 0.8 }} color="#b8903a" pos={[0, 0.5, 0]} metal={0.8} />
        <Pieza forma={{ f: "aro", r: 0.5, g: 0.03 }} color="#b8903a" rot={[Math.PI / 2, 0, 0]} metal={0.8} rugoso={0.3} />
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[Math.cos((i / 6) * Math.PI * 2) * 0.5, 0.08, Math.sin((i / 6) * Math.PI * 2) * 0.5]}>
            <Pieza forma={{ f: "bola", r: 0.07, seg: 10 }} color="#fff0c8" basica />
            <Resplandor pos={[0, 0, 0]} r={0.3} color="#ffb860" o={0.25} />
          </group>
        ))}
        <pointLight intensity={14} distance={10} decay={1.5} color="#ffc070" />
      </group>
      <Letrero texto="ROYAL INSTITUTE OF OCEAN SCIENCE" pos={[0, 4.05, -5.94]} ancho={5} alto={0.32} fondo="#2a1a10" tinta="#e0b860" />
    </group>
  );
};

// ================================================================ EXPEDIENTE (despacho de la investigación marítima)
const Expediente: React.FC<{ s: number }> = ({ s }) => {
  const suelo = texLosas(30, 14, 40, [5, 5]);
  const pared = texMadera(28, 26, 34, 14, [3, 1]);
  const tablon = texTablonPerdidos();
  const carpeta = texCarpeta();
  const mapa = texCartaNorte();
  const mesa = texMadera(22, 50, 28, 4);
  const W = 10, D = 9, H = 3.4;
  return (
    <group>
      <Ambiente niebla={["#14181c", 12, 40]} fondo="#0a0c10" />
      <hemisphereLight args={["#d8e0e8", "#14100c", 0.3]} />
      <ambientLight intensity={0.1} color="#c8d0d8" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={pared} color="#8a8070" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} color="#8a8070" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} color="#8a8070" />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={pared} color="#8a8070" />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#2a2622" pos={[0, H, -1]} />
      {/* tablón «LOST AT SEA» y mapa del mar con chinchetas */}
      <TPlano w={1.7} h={2.1} pos={[-1.3, 1.9, -5.45]} map={tablon} />
      <TPlano w={2.2} h={1.65} pos={[1.4, 1.95, -5.45]} map={mapa} />
      {Array.from({ length: 9 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.03, seg: 8 }} color="#d0202a" pos={[0.5 + R(s, "cx", i) * 1.8, 1.3 + R(s, "cy", i) * 1.2, -5.42]} />
      ))}
      {/* escritorio con carpetas, sello, máquina de escribir, teléfono y lámpara verde */}
      <group position={[0, 0, -2.6]}>
        <TCaja t={[2.6, 0.08, 1.2]} pos={[0, 0.78, 0]} map={mesa} />
        <TCaja t={[0.9, 0.74, 1.1]} pos={[-0.8, 0.37, 0]} map={mesa} color="#a07858" />
        <TCaja t={[0.9, 0.74, 1.1]} pos={[0.8, 0.37, 0]} map={mesa} color="#a07858" />
        {/* montón de expedientes */}
        {Array.from({ length: 7 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.5, 0.04, 0.36] }} color={i % 2 ? "#d8b878" : "#c8a868"} pos={[-0.85 + (R(s, "ex", i) - 0.5) * 0.04, 0.84 + i * 0.045, -0.2]} rot={[0, (R(s, "er", i) - 0.5) * 0.3, 0]} />
        ))}
        <TPlano w={0.42} h={0.56} pos={[0.1, 0.825, 0.15]} rot={[-Math.PI / 2, 0, 0.1]} map={carpeta} />
        {/* sello de goma */}
        <Pieza forma={{ f: "tubo", r: 0.045, h: 0.13 }} color="#3a2414" pos={[0.55, 0.9, 0.2]} />
        <Pieza forma={{ f: "bola", r: 0.06, seg: 12 }} color="#3a2414" pos={[0.55, 0.98, 0.2]} />
        <Pieza forma={{ f: "caja", t: [0.14, 0.04, 0.09] }} color="#b02028" pos={[0.55, 0.84, 0.2]} />
        {/* máquina de escribir */}
        <group position={[0.75, 0.82, -0.25]}>
          <Pieza forma={{ f: "caja", t: [0.44, 0.12, 0.34] }} color="#1a1c20" metal={0.4} rugoso={0.35} />
          <Pieza forma={{ f: "tubo", r: 0.04, h: 0.5 }} color="#2a2c30" pos={[0, 0.12, -0.12]} rot={[0, 0, Math.PI / 2]} />
          <Pieza forma={{ f: "caja", t: [0.3, 0.2, 0.005] }} color="#f4f0e4" pos={[0, 0.22, -0.13]} rot={[-0.2, 0, 0]} />
        </group>
        <Telefono pos={[-0.3, 0.86, -0.35]} />
        <LamparaVerde pos={[0, 1.95, -0.1]} cable={1.4} />
      </group>
      {/* archivadores con cajones abiertos y campana de barco (se tocaba por cada barco perdido) */}
      {[-4.3, -3.6].map((x, i) => (
        <group key={i} position={[x, 0, -4.8]}>
          <Pieza forma={{ f: "caja", t: [0.65, 1.4, 0.7] }} color="#5a6058" pos={[0, 0.7, 0]} metal={0.5} rugoso={0.45} />
          {[0.35, 0.75, 1.15].map((y) => (
            <Pieza key={y} forma={{ f: "caja", t: [0.18, 0.04, 0.03] }} color="#c8ccd0" pos={[0, y, 0.36]} metal={0.8} />
          ))}
        </group>
      ))}
      <group position={[3.8, 0, -4.6]}>
        <Pieza forma={{ f: "caja", t: [0.9, 0.08, 0.5] }} color="#3a2414" pos={[0, 2.2, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.3, r2: 0.16, h: 0.5, seg: 18 }} color="#c89a3a" pos={[0, 1.88, 0]} metal={0.9} rugoso={0.25} />
        <Pieza forma={{ f: "bola", r: 0.05, seg: 8 }} color="#8a6a2a" pos={[0, 1.6, 0]} metal={0.8} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 2.2 }} color="#3a2414" pos={[-0.4, 1.1, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 2.2 }} color="#3a2414" pos={[0.4, 1.1, 0]} />
      </group>
      {/* ventana con la lluvia, perchero con gabardina y sombrero */}
      <VentanalTormenta pos={[4.92, 1.9, -1.5]} rot={[0, -Math.PI / 2, 0]} ancho={1.6} alto={1.6} s={s} />
      <group position={[-4.3, 0, 1.6]}>
        <Pieza forma={{ f: "tubo", r: 0.03, h: 1.9 }} color="#2a1a10" pos={[0, 0.95, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.22, r2: 0.16, h: 1.0 }} color="#6a5a40" pos={[0.05, 1.3, 0.05]} />
        <Pieza forma={{ f: "tubo", r: 0.17, r2: 0.13, h: 0.1 }} color="#2a2420" pos={[0, 1.95, 0]} />
      </group>
      <Pieza forma={{ f: "caja", t: [1.4, 0.04, 0.5] }} color="#f2f6fa" brillo="#e8f0f8" intensidad={1.2} basica pos={[0, H - 0.03, -1.5]} />
      <pointLight position={[0, H - 0.4, -1.5]} intensity={5} distance={8} color="#dce6f0" />
      <Letrero texto="BOARD OF MARINE INQUIRY" pos={[0, 3.05, -5.44]} ancho={3.2} alto={0.3} fondo="#1a1a20" tinta="#e0c070" />
    </group>
  );
};

// ================================================================ DRAUPNER (plataforma de gas en el mar del Norte, 1995)
/** Pata tubular de la plataforma con anillos de espuma donde rompe el mar. */
const Pata: React.FC<{ pos: V3; alto: number; r?: number; s: number }> = ({ pos, alto, r = 1.1, s }) => {
  const f = useCurrentFrame();
  return (
    <group position={pos}>
      <Pieza forma={{ f: "tubo", r, h: alto, seg: 20 }} color="#c8b030" metal={0.4} rugoso={0.55} pos={[0, -alto / 2, 0]} />
      {[0.3, 0.55, 0.8].map((k) => (
        <Pieza key={k} forma={{ f: "aro", r: r + 0.02, g: 0.08 }} color="#2a2c30" pos={[0, -alto * k, 0]} rot={[Math.PI / 2, 0, 0]} />
      ))}
      <Pieza forma={{ f: "aro", r: r + 0.5 + 0.2 * Math.sin(f * 0.1 + s), g: 0.3 }} color="#e8f4f8" opacidad={0.6} pos={[0, -alto + 0.4, 0]} rot={[Math.PI / 2, 0, 0]} />
    </group>
  );
};

const Draupner: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const rejilla = texAcero("#5a5e62", [4, 8]);
  const chapa = texAcero("#8a8c86");
  const ALTO = 22; // del agua a la cubierta
  return (
    <group>
      <Ambiente niebla={["#141c26", 40, 300]} fondo="#080c14" />
      <Cielo arriba="#04070e" medio="#1a2636" abajo="#0e1620" radio={400} />
      <Nubes s={s} color="#1a2430" n={12} y={80} />
      <hemisphereLight args={["#7a90b0", "#0a0e14", 0.5]} />
      <directionalLight position={[60, 50, 40]} intensity={0.6} color="#a8bcd8" />
      <Mar y={-ALTO} color="#122a36" amp={2.2} ola={0.55} brillo={0.35} tam={1200} seg={140} />
      {/* patas de la estructura y travesaños en X bajo la cubierta */}
      {[[-6, -2], [6, -2], [-6, -12], [6, -12]].map(([x, z], i) => (
        <Pata key={i} pos={[x, 0, z]} alto={ALTO + 6} s={s + i} />
      ))}
      {[-2, -12].map((z) => (
        <group key={z}>
          {[0, 1].map((k) => (
            <Pieza key={k} forma={{ f: "tubo", r: 0.35, h: 15 }} color="#c8b030" pos={[0, -ALTO * 0.5, z]} rot={[0, 0, (k ? 1 : -1) * 0.95]} metal={0.4} rugoso={0.55} />
          ))}
        </group>
      ))}
      {/* cubierta de rejilla, barandillas amarillas y vigas */}
      <TPlano w={16} h={18} pos={[0, 0, -5]} rot={[-Math.PI / 2, 0, 0]} map={rejilla} />
      <Pieza forma={{ f: "caja", t: [16, 1.2, 18] }} color="#3a3c40" pos={[0, -0.62, -5]} metal={0.5} />
      <Barandilla pos={[4.2, 0, -1]} largo={10} />
      <Pieza forma={{ f: "caja", t: [16, 1.2, 0.3] }} color={AMARILLO} pos={[0, -0.6, 4]} metal={0.4} />
      {/* módulos de la planta con el nombre */}
      <group position={[-3.5, 0, -9]}>
        <TCaja t={[7, 4.5, 6]} pos={[0, 2.25, 0]} map={chapa} color="#e8e4d8" />
        <Letrero texto="DRAUPNER E" pos={[0, 3.6, 3.02]} ancho={5} alto={0.8} fondo="#1a3a7a" tinta="#ffffff" />
        <Letrero texto="NO SMOKING  -  H2S AREA" pos={[0, 1.4, 3.02]} ancho={3} alto={0.3} fondo={AMARILLO} tinta="#1a1a1a" />
        {[-2.6, 2.6].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.9, 2.1, 0.06] }} color="#c0242c" pos={[x, 1.05, 3.02]} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.6, 0.4, 0.05] }} color="#ffe8b0" brillo="#ffc870" intensidad={1.2} basica pos={[-2.4 + i * 1.2, 2.8, 3.03]} />
        ))}
        {/* tuberías por la fachada */}
        {[0.6, 0.9].map((y) => (
          <Pieza key={y} forma={{ f: "tubo", r: 0.12, h: 7 }} color={y > 0.7 ? "#c0242c" : "#2a6aa8"} pos={[0, y, 3.2]} rot={[0, 0, Math.PI / 2]} metal={0.5} />
        ))}
      </group>
      {/* helipuerto encima con su H */}
      <group position={[-3.5, 5.6, -9]}>
        <Pieza forma={{ f: "tubo", r: 4, h: 0.3, seg: 32 }} color="#2a6a3a" />
        <Letrero texto="H" pos={[0, 0.16, 0]} rot={[-Math.PI / 2, 0, 0]} ancho={2.4} alto={2.4} fondo="transparent" tinta="#ffffff" letra={0.9} />
        {Array.from({ length: 12 }, (_, i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.08, seg: 6 }} color="#7affa0" basica pos={[Math.cos((i / 12) * 6.28) * 3.9, 0.2, Math.sin((i / 12) * 6.28) * 3.9]} />
        ))}
      </group>
      {/* grúa de celosía */}
      <group position={[4.5, 0, -11]} rotation={[0, 0, 0]}>
        <Pieza forma={{ f: "tubo", r: 0.7, h: 3 }} color={AMARILLO} pos={[0, 1.5, 0]} metal={0.4} />
        <group position={[0, 3, 0]} rotation={[0, 0.6, -0.9]}>
          <Torre alto={16} base={1} arriba={0.4} color={AMARILLO} />
        </group>
      </group>
      {/* brazo de la antorcha de gas con su llama (la luz cálida enorme) */}
      <group position={[-9, 2, -6]} rotation={[0, 0, 0.5]}>
        <Torre alto={14} base={1.2} arriba={0.6} color="#9a9ca0" />
        <group position={[0, 14.5, 0]}>
          <Fuego pos={[0, 0, 0]} tam={6} luz={60} s={s} />
        </group>
      </group>
      {/* focos de sodio */}
      <FocoSodio pos={[2.5, 4, 0.5]} />
      <FocoSodio pos={[-1, 5, -5.8]} luz={10} />
      <FocoSodio pos={[4.2, 3.2, -6]} luz={8} rot={[0.4, 0, -0.4]} />
      {/* el láser: soporte en la barandilla y el haz rojo hasta el mar */}
      <group position={[5.2, 0, -3.4]}>
        <Pieza forma={{ f: "caja", t: [1.6, 0.12, 0.12] }} color="#3a3c40" pos={[0.8, 1.0, 0]} metal={0.6} />
        <Pieza forma={{ f: "caja", t: [0.28, 0.32, 0.28] }} color="#e8e8ec" pos={[1.6, 0.85, 0]} metal={0.4} />
        <Pieza forma={{ f: "tubo", r: 0.04, h: ALTO }} color="#ff2a2a" basica opacidad={0.75} pos={[1.6, 0.7 - ALTO / 2, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.18, h: ALTO }} color="#ff4a3a" basica opacidad={0.12} pos={[1.6, 0.7 - ALTO / 2, 0]} />
        <Resplandor pos={[1.6, -ALTO + 0.6 + Math.sin(f * 0.04) * 1.5, 0]} r={1.4} color="#ff3a2a" o={0.6} />
        <Resplandor pos={[1.6, 0.7, 0]} r={0.3} color="#ff3a2a" o={0.7} />
      </group>
      {/* otra plataforma a lo lejos, con sus luces */}
      <group position={[90, -ALTO, -220]}>
        <Pieza forma={{ f: "caja", t: [20, 30, 14] }} color="#1a1e24" pos={[0, 15, 0]} />
        {Array.from({ length: 14 }, (_, i) => (
          <Pieza key={i} forma={{ f: "bola", r: 0.5, seg: 6 }} color="#ffc070" basica pos={[(R(s, "px", i) - 0.5) * 20, 18 + R(s, "py", i) * 14, 7.2]} />
        ))}
        <Fuego pos={[12, 34, 0]} tam={4} s={s + 3} />
      </group>
      {/* cajas, botellas de gas y manguera en la cubierta */}
      <Caja pos={[-1.8, 0, 2.6]} tam={0.8} />
      <Caja pos={[-1.0, 0, 3.0]} tam={0.6} rot={[0, 0.5, 0]} />
      {[0, 1, 2].map((i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.14, h: 1.3 }} color={i === 1 ? "#2a6aa8" : "#c0242c"} pos={[-4 + i * 0.32, 0.65, 2.2]} metal={0.5} rugoso={0.4} />
      ))}
      <Lluvia s={s} n={220} zona={30} alto={16} />
    </group>
  );
};

// ================================================================ CONTROL (sala de control de la plataforma, 1995)
const Control: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texLosas(210, 6, 46, [5, 5]);
  const pantallaOla = texPantallaOla();
  const papel = texPapelRegistro();
  const carta = texCartaNorte();
  const W = 9, D = 8, H = 3;
  const gira = f * 0.18;
  const alarma = 0.5 + 0.5 * Math.sin(f * 0.35);
  return (
    <group>
      <Ambiente niebla={["#0c1416", 10, 36]} fondo="#060a0c" />
      <hemisphereLight args={["#b8d0d8", "#0c0e10", 0.28]} />
      <ambientLight intensity={0.08} color="#c0d8e0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#9aa29c" pos={[0, H / 2, -5]} />
      <Pieza forma={{ f: "caja", t: [0.1, H, D] }} color="#9aa29c" pos={[-W / 2, H / 2, -1]} />
      <Pieza forma={{ f: "caja", t: [0.1, H, D] }} color="#9aa29c" pos={[W / 2, H / 2, -1]} />
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#9aa29c" pos={[0, H / 2, 3]} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#c8ccc8" pos={[0, H, -1]} />
      {/* consola larga al fondo con la pantalla grande del láser y monitores */}
      <group position={[0, 0, -4.2]}>
        <Pieza forma={{ f: "caja", t: [6.4, 0.9, 0.9] }} color="#c8c0a8" pos={[0, 0.45, 0]} />
        <Pieza forma={{ f: "caja", t: [6.4, 0.5, 0.6] }} color="#b8b098" pos={[0, 1.05, -0.15]} rot={[-0.5, 0, 0]} />
        {/* botones y pilotos */}
        {Array.from({ length: 30 }, (_, i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.06, 0.03, 0.06] }} color={["#ff4a3a", "#7affa0", "#ffd04a", "#e8e8e8"][i % 4]} basica={i % 3 === 0} pos={[-3 + (i % 15) * 0.42, 1.12 + Math.floor(i / 15) * 0.12, -0.05 - Math.floor(i / 15) * 0.1]} rot={[-0.5, 0, 0]} />
        ))}
        {/* pantalla grande con el pico */}
        <Pieza forma={{ f: "caja", t: [1.9, 1.25, 0.5] }} color="#2a2c2e" pos={[0, 1.95, -0.3]} />
        <TPlano w={1.7} h={1.06} pos={[0, 1.95, -0.04]} map={pantallaOla} brillo={1.1} />
        <Resplandor pos={[0, 1.95, 0.1]} r={1.2} color="#3dff7a" o={0.12} />
        <pointLight position={[0, 1.9, 0.6]} intensity={4} distance={4} color="#5aff90" />
        {/* monitores CRT a los lados */}
        {[-2.1, -1.2, 1.2, 2.1].map((x, i) => (
          <group key={x} position={[x, 1.55, -0.2]}>
            <Pieza forma={{ f: "caja", t: [0.75, 0.6, 0.6] }} color="#d8d0b8" />
            <TPlano w={0.6} h={0.45} pos={[0, 0.02, 0.31]} map={texMonitor([["WAVE  H  m", "12.1  11.8", "10.9  12.4"], ["WIND  N 24", "m/s  GUST 31"], ["PRESSURE", "966 hPa"], ["SEA STATE 7", "HS  12.0 m"]][i], i === 2 ? "#ffd04a" : "#6dff9e")} brillo={1} />
          </group>
        ))}
      </group>
      {/* registrador de papel con el rollo y el pico */}
      <group position={[3.4, 0, -2.4]}>
        <Pieza forma={{ f: "caja", t: [0.9, 1.0, 0.7] }} color="#c8c0a8" pos={[0, 0.5, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.08, h: 0.7 }} color="#e8e4d8" pos={[0, 1.05, -0.15]} rot={[0, 0, Math.PI / 2]} />
        <TPlano w={0.6} h={1.1} pos={[0, 1.05, 0.2]} rot={[-1.2, 0, 0]} map={papel} />
      </group>
      {/* carta del mar del Norte, calendario de enero de 1995 y reloj */}
      <TPlano w={2} h={1.5} pos={[-4.44, 1.8, -2]} rot={[0, Math.PI / 2, 0]} map={carta} />
      <Letrero texto="JANUARY 1995" pos={[-4.44, 0.95, -0.6]} rot={[0, Math.PI / 2, 0]} ancho={0.8} alto={0.3} fondo="#f4f0e4" tinta="#c0202a" />
      <group position={[2.4, 2.45, -4.94]}>
        <Pieza forma={{ f: "tubo", r: 0.22, h: 0.05, seg: 24 }} color="#f4f4f0" rot={[Math.PI / 2, 0, 0]} />
        <Pieza forma={{ f: "caja", t: [0.02, 0.16, 0.01] }} color="#1a1a1a" pos={[0, 0.06, 0.03]} rot={[0, 0, -0.5]} />
        <Pieza forma={{ f: "caja", t: [0.02, 0.12, 0.01] }} color="#1a1a1a" pos={[0.03, -0.03, 0.03]} rot={[0, 0, 2.3]} />
      </group>
      {/* mesa con café, casco y prismáticos */}
      <group position={[-2.6, 0, -1.6]}>
        <Pieza forma={{ f: "caja", t: [1.4, 0.06, 0.8] }} color="#8a8a80" pos={[0, 0.75, 0]} metal={0.4} />
        {[-0.65, 0.65].map((x) => <Pieza key={x} forma={{ f: "tubo", r: 0.03, h: 0.75 }} color="#5a5c5e" pos={[x, 0.37, 0]} />)}
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.1 }} color="#c0242c" pos={[0.3, 0.83, 0.1]} />
        <Pieza forma={{ f: "bola", r: 0.17, seg: 14 }} esc={[1, 0.7, 1.15]} color="#f4f4f0" pos={[-0.3, 0.84, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.18 }} color="#1a1a1a" pos={[0.05, 0.82, -0.2]} rot={[0, 0, Math.PI / 2]} />
      </group>
      {/* ventana con la noche del mar del Norte y la lluvia */}
      <VentanalTormenta pos={[4.44, 1.7, 0]} rot={[0, -Math.PI / 2, 0]} ancho={2} alto={1.3} s={s} />
      {/* fluorescentes fríos y la baliza roja de alarma que gira */}
      {[-2, 2].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [1.2, 0.04, 0.3] }} color="#eaf4f8" brillo="#e0f0f8" intensidad={1.1} basica pos={[x, H - 0.03, -1.5]} />
      ))}
      <pointLight position={[0, H - 0.4, -1.5]} intensity={4} distance={8} color="#dcecf0" />
      <group position={[-1.5, H - 0.2, -4.6]}>
        <Pieza forma={{ f: "tubo", r: 0.12, h: 0.2 }} color="#ff3a2a" brillo="#ff2a1a" intensidad={alarma * 2} basica />
        <Resplandor pos={[0, 0, 0]} r={0.6} color="#ff3a2a" o={0.4 * alarma} />
        <pointLight position={[Math.cos(gira) * 0.4, -0.2, Math.sin(gira) * 0.4]} intensity={8 * alarma} distance={9} color="#ff3a2a" />
      </group>
      <Letrero texto="CONTROL ROOM" pos={[-2.6, 2.6, -4.94]} ancho={1.6} alto={0.26} fondo="#1a3a7a" tinta="#ffffff" />
    </group>
  );
};

// ================================================================ ESPACIO (la Tierra desde la órbita)
const Espacio: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const tierra = texTierra();
  const giro = f * 0.0006;
  // los 10 puntos rojos: olas de más de 25 m que encuentra el radar (laten)
  const puntos = Array.from({ length: 11 }, (_, i) => {
    const lat = (R(s, "pl", i) - 0.5) * 1.6;
    const lon = -0.9 + R(s, "pn", i) * 1.8;
    return [lat, lon] as [number, number];
  });
  const RT = 120;
  return (
    <group>
      <Ambiente niebla={["#000000", 2000, 4000]} fondo="#01020a" />
      <Estrellas s={s} n={700} />
      <ambientLight intensity={0.06} color="#8aa0d0" />
      <directionalLight position={[300, 120, 200]} intensity={2.6} color="#fff4e0" />
      {/* el sol */}
      <Pieza forma={{ f: "bola", r: 8, seg: 20 }} color="#fff8e0" basica pos={[380, 160, -500]} />
      <Halo pos={[380, 160, -500]} r={60} color="#ffe8b0" o={0.18} />
      {/* la Tierra con su atmósfera */}
      <group position={[0, -RT - 26, -60]} rotation={[0.25, giro - 0.6, 0]}>
        <mesh>
          <sphereGeometry args={[RT, 96, 64]} />
          <meshStandardMaterial map={tierra} roughness={0.6} metalness={0.1} />
        </mesh>
        {puntos.map(([la, lo], i) => {
          const k = 0.6 + 0.4 * Math.sin(f * 0.2 + i);
          const p: V3 = [Math.cos(la) * Math.sin(lo) * (RT + 0.4), Math.sin(la) * (RT + 0.4), Math.cos(la) * Math.cos(lo) * (RT + 0.4)];
          return (
            <group key={i}>
              <Pieza forma={{ f: "bola", r: 0.7, seg: 8 }} color="#ff3a2a" basica pos={p} />
              <Resplandor pos={p} r={2.4 * k} color="#ff4a3a" o={0.5} />
            </group>
          );
        })}
      </group>
      <mesh position={[0, -RT - 26, -60]}>
        <sphereGeometry args={[RT * 1.025, 64, 48]} />
        <meshBasicMaterial color="#5aa0ff" transparent opacity={0.14} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
      </mesh>
      <Halo pos={[0, -RT - 26, -60]} r={RT * 1.08} color="#4a90ff" o={0.06} />
    </group>
  );
};

// ================================================================ BAR (bar de marineros en el puerto, de noche)
const Bar: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texMadera(22, 40, 22, 10, [3, 3]);
  const pared = texPiedra(18, 20, 34, 9, 4, [3, 1]);
  const madera = texMadera(24, 52, 30, 5);
  const neon = texNeon("The Rogue Wave", "#3ae0ff");
  const neon2 = texNeon("OPEN", "#ff3a6a");
  const foto = texFotoOla();
  const W = 10, D = 9, H = 3.2;
  const zumba = f % 61 < 2 ? 0.5 : 1;
  return (
    <group>
      <Ambiente niebla={["#140c10", 12, 40]} fondo="#0a0608" />
      <hemisphereLight args={["#ffc8a0", "#140a0c", 0.3]} />
      <ambientLight intensity={0.08} color="#ffd0b0" />
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={pared} color="#8a6a5a" />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} color="#8a6a5a" />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} color="#8a6a5a" />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={pared} color="#8a6a5a" />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#1a1210" pos={[0, H, -1]} />
      {[-3.5, -1, 1.5].map((z) => (
        <TCaja key={z} t={[W, 0.22, 0.26]} pos={[0, H - 0.12, z]} map={texMadera(20, 40, 18, 3)} />
      ))}
      {/* barra con grifos de cerveza y estanterías de botellas iluminadas */}
      <group position={[0, 0, -3.6]}>
        <TCaja t={[6, 1.1, 0.7]} pos={[0, 0.55, 0]} map={madera} color="#8a5a3a" />
        <TCaja t={[6.2, 0.08, 0.85]} pos={[0, 1.14, 0]} map={madera} color="#b8804a" />
        <Pieza forma={{ f: "tubo", r: 0.04, h: 6 }} color="#c89a3a" pos={[0, 0.2, 0.4]} rot={[0, 0, Math.PI / 2]} metal={0.9} rugoso={0.25} />
        {[-0.9, -0.6, -0.3, 0].map((x, i) => (
          <group key={i} position={[x, 1.2, -0.15]}>
            <Pieza forma={{ f: "tubo", r: 0.03, h: 0.4 }} color="#d8d8dc" pos={[0, 0.2, 0]} metal={0.9} rugoso={0.2} />
            <Pieza forma={{ f: "tubo", r: 0.025, h: 0.18 }} color={["#c0242c", "#2a5a2a", "#1a1a1a", "#c89a3a"][i]} pos={[0, 0.48, 0]} />
          </group>
        ))}
        {[1.4, 1.95].map((y, j) => (
          <group key={y}>
            <TCaja t={[5, 0.05, 0.3]} pos={[0, y, -0.95]} map={madera} color="#6a4428" />
            <Pieza forma={{ f: "caja", t: [5, 0.02, 0.25] }} color="#ffb860" brillo="#ff9a40" intensidad={1.2} basica pos={[0, y + 0.03, -0.95]} />
            {Array.from({ length: 16 }, (_, i) => (
              <Botella key={i} pos={[-2.3 + i * 0.3 + j * 0.1, y + 0.03, -0.95]} color={["#3a7a3a", "#7a2a1a", "#c08a2a", "#2a4a7a", "#d8d0b0"][(i + j) % 5]} alto={0.25 + (i % 3) * 0.06} />
            ))}
          </group>
        ))}
        {[-2, 1.2, 2.2].map((x, i) => <Jarra key={i} pos={[x, 1.18, 0.1]} />)}
        {/* taburetes */}
        {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
          <group key={x} position={[x, 0, 0.75]}>
            <Pieza forma={{ f: "tubo", r: 0.04, h: 0.7 }} color="#2a2a2e" pos={[0, 0.35, 0]} metal={0.7} />
            <Pieza forma={{ f: "tubo", r: 0.2, h: 0.08 }} color="#7a1a22" pos={[0, 0.72, 0]} />
          </group>
        ))}
      </group>
      {/* neón del nombre sobre la barra y el OPEN en la ventana */}
      <mesh position={[0, 2.65, -5.42]}>
        <planeGeometry args={[3.6, 0.9]} />
        <meshBasicMaterial map={neon} transparent depthWrite={false} opacity={zumba} />
      </mesh>
      <pointLight position={[0, 2.6, -4.6]} intensity={6 * zumba} distance={7} color="#3ae0ff" />
      {/* foto de la ola, salvavidas, timón y red con boyas */}
      <group position={[-4.92, 1.8, -2]} rotation={[0, Math.PI / 2, 0]}>
        <Pieza forma={{ f: "caja", t: [1.1, 0.85, 0.05] }} color="#2a1a10" />
        <TPlano w={0.96} h={0.72} pos={[0, 0, 0.03]} map={foto} />
      </group>
      <group position={[-4.92, 1.9, 0.2]} rotation={[0, Math.PI / 2, 0]}>
        <Pieza forma={{ f: "aro", r: 0.32, g: 0.09 }} color="#e85a2a" />
        {[0, 1, 2, 3].map((i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.1, 0.2, 0.2] }} color="#f4f4f0" pos={[Math.cos((i * Math.PI) / 2) * 0.32, Math.sin((i * Math.PI) / 2) * 0.32, 0]} rot={[0, 0, (i * Math.PI) / 2]} />
        ))}
      </group>
      <group position={[4.92, 1.9, -2.2]} rotation={[0, -Math.PI / 2, 0]}>
        <Pieza forma={{ f: "aro", r: 0.5, g: 0.05 }} color="#6a3c1a" />
        {Array.from({ length: 8 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 1.4 }} color="#6a3c1a" rot={[0, 0, (i / 8) * Math.PI]} />
        ))}
      </group>
      {Array.from({ length: 9 }, (_, i) => (
        <Pieza key={i} forma={{ f: "bola", r: 0.1, seg: 10 }} color={i % 2 ? "#f2c41e" : "#e85a2a"} pos={[-3 + i * 0.75, H - 0.45 - Math.sin((i / 8) * Math.PI) * 0.35, -0.5]} />
      ))}
      {Array.from({ length: 8 }, (_, i) => (
        <Pieza key={i} forma={{ f: "tubo", r: 0.006, h: 6 }} color="#8a7a5a" pos={[0, H - 0.5 - Math.sin(((i + 0.5) / 8) * Math.PI) * 0.3, -0.5]} rot={[0, 0, Math.PI / 2 + (i - 4) * 0.02]} />
      ))}
      {/* gramola que brilla */}
      <group position={[3.8, 0, -4.6]}>
        <Pieza forma={{ f: "caja", t: [0.8, 1.3, 0.5] }} color="#6a2a1a" pos={[0, 0.65, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.4, h: 0.5, seg: 20 }} color="#ffb860" brillo="#ff8a3a" intensidad={1.5} basica pos={[0, 1.3, 0]} rot={[Math.PI / 2, 0, 0]} />
        <Resplandor pos={[0, 1.2, 0.3]} r={0.9} color="#ff8a3a" o={0.3} />
        <pointLight position={[0, 1.2, 0.6]} intensity={4} distance={5} color="#ff9a50" />
      </group>
      {/* mesa redonda con vela, ventana al puerto con lluvia y el OPEN */}
      <group position={[-2.8, 0, 1.4]}>
        <Pieza forma={{ f: "tubo", r: 0.55, h: 0.06, seg: 24 }} color="#5a3418" pos={[0, 0.78, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.06, h: 0.76 }} color="#3a2410" pos={[0, 0.38, 0]} />
        <Jarra pos={[0.2, 0.81, 0.1]} />
        <Pieza forma={{ f: "tubo", r: 0.03, h: 0.12 }} color="#f4ecd8" pos={[-0.15, 0.87, -0.1]} />
        <Fuego pos={[-0.15, 0.93, -0.1]} tam={0.25} luz={2} s={s} />
      </group>
      <VentanalTormenta pos={[4.92, 1.6, 1.2]} rot={[0, -Math.PI / 2, 0]} ancho={1.6} alto={1.4} s={s} />
      <mesh position={[4.88, 2.0, 1.2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, 0.24]} />
        <meshBasicMaterial map={neon2} transparent depthWrite={false} />
      </mesh>
      <Farol pos={[-1.6, H, -1.6]} s={s} luz={6} cadena={0.4} />
      <Farol pos={[2, H, 0.6]} s={s + 2} luz={5} cadena={0.4} />
      <Barril pos={[-4.2, 0, -4.6]} />
      <Ventana pos={[-1, 1.9, 3.45]} rot={[0, Math.PI, 0]} cielo="#1a2a4a" />
    </group>
  );
};

export const ESCENARIOS_OLAS = { tormenta: Tormenta, academia: Academia, expediente: Expediente, draupner: Draupner, control: Control, espacio: Espacio, bar: Bar };
