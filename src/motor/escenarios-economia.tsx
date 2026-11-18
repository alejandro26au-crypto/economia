// ESCENARIOS DEL CANAL «Inercia del consumo» (economía). Nivel del camarote: muchos objetos con textura pintada,
// luz cálida contra fría y el centro libre (x -2..2, z 0..-3) para los personajes. Con el filtro de papel y lápiz
// (ilustrado.tsx) quedan como un dibujo acuarelado, a juego con el personaje.
//   banco  sala de un banco: suelo de mármol, columnas, ventanillas con rejas y lámparas verdes, la cámara
//          acorazada ABIERTA al fondo con lingotes y sacos de dinero, ventanales con la ciudad (luz fría).
//   salon  TU casa al anochecer: sofá, mesita con facturas y la hucha, tele con un gráfico que cae (luz fría),
//          lámpara de pie (cálida), cocina con nevera y calendario, ventana con la ciudad.
import React from "react";
import { useCurrentFrame } from "remotion";
import {
  Ambiente, Ciudad, Estanteria, Haz, LamparaVerde, Letrero, Monedas, Pieza, Resplandor, TCaja, TPlano, Telefono,
  texAlfombra, texBilletes, texLosas, texMadera, texPiedra,
} from "./atrezo";
import { lienzo } from "./texturas-pintadas";

type V3 = [number, number, number];

// ---------------------------------------------------------------- texturas propias
/** Papel con renglones y un título (facturas, extractos, contratos). */
export function texPapel(titulo: string, lineas: string[], sello?: string) {
  return lienzo(`papel${titulo}${lineas.join("|")}${sello}`, 512, 680, (x) => {
    x.fillStyle = "#f7f2e4";
    x.fillRect(0, 0, 512, 680);
    x.fillStyle = "#2b2e3d";
    x.font = "bold 54px Georgia, serif";
    x.fillText(titulo, 40, 90);
    x.fillRect(40, 110, 432, 5);
    x.font = "34px Georgia, serif";
    lineas.forEach((l, i) => x.fillText(l, 40, 180 + i * 64));
    if (sello) {
      x.save();
      x.translate(300, 560);
      x.rotate(-0.25);
      x.strokeStyle = "#b03a2e";
      x.fillStyle = "#b03a2e";
      x.lineWidth = 8;
      x.strokeRect(-150, -50, 300, 100);
      x.font = "bold 60px Arial, sans-serif";
      x.textAlign = "center";
      x.fillText(sello, 0, 22);
      x.restore();
    }
    x.strokeStyle = "rgba(18,14,28,0.7)";
    x.lineWidth = 6;
    x.strokeRect(3, 3, 506, 674);
  });
}

/** Pantalla con un gráfico de bolsa que cae (o sube). */
export function texGrafico(cae: boolean, titulo: string) {
  return lienzo(`graf${cae}${titulo}`, 1024, 576, (x) => {
    x.fillStyle = "#1c2433";
    x.fillRect(0, 0, 1024, 576);
    x.strokeStyle = "rgba(255,255,255,0.08)";
    x.lineWidth = 2;
    for (let i = 1; i < 8; i++) {
      x.beginPath();
      x.moveTo(0, i * 72);
      x.lineTo(1024, i * 72);
      x.stroke();
    }
    x.strokeStyle = cae ? "#ff6a5a" : "#7fe08a";
    x.lineWidth = 12;
    x.lineJoin = "round";
    x.beginPath();
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const base = cae ? 120 + t * 330 : 450 - t * 330;
      const y = base + Math.sin(i * 1.7) * 38;
      if (i === 0) x.moveTo(40 + t * 944, y);
      else x.lineTo(40 + t * 944, y);
    }
    x.stroke();
    x.fillStyle = "#ffffff";
    x.font = "bold 64px Arial, sans-serif";
    x.fillText(titulo, 40, 80);
  });
}

// ---------------------------------------------------------------- piezas propias
/** Lingote de oro (tronco de pirámide). */
const Lingote: React.FC<{ pos: V3; rot?: number }> = ({ pos, rot = 0 }) => (
  <group position={pos} rotation={[0, rot, 0]}>
    <Pieza forma={{ f: "caja", t: [0.3, 0.09, 0.13] }} color="#e2b23a" metal={0.8} rugoso={0.3} />
    <Pieza forma={{ f: "caja", t: [0.25, 0.03, 0.09] }} color="#f2cc5a" pos={[0, 0.055, 0]} metal={0.8} rugoso={0.3} />
  </group>
);
/** Pila de lingotes en pirámide. */
const PilaOro: React.FC<{ pos: V3; filas?: number }> = ({ pos, filas = 3 }) => (
  <group position={pos}>
    {Array.from({ length: filas }, (_, f) =>
      Array.from({ length: filas - f }, (_, i) => <Lingote key={`${f}-${i}`} pos={[(i - (filas - f - 1) / 2) * 0.32, 0.045 + f * 0.1, 0]} />),
    )}
  </group>
);
/** Saco de dinero con el signo $. */
const Saco: React.FC<{ pos: V3; tam?: number }> = ({ pos, tam = 1 }) => (
  <group position={pos} scale={tam}>
    <Pieza forma={{ f: "bola", r: 0.24 }} color="#b9a57a" pos={[0, 0.22, 0]} esc={[1, 0.95, 1]} />
    <Pieza forma={{ f: "cono", r: 0.12, h: 0.16 }} color="#a8946a" pos={[0, 0.48, 0]} />
    <Pieza forma={{ f: "aro", r: 0.08, g: 0.02 }} color="#6a4a2a" pos={[0, 0.42, 0]} rot={[Math.PI / 2, 0, 0]} />
    <Letrero texto="$" pos={[0, 0.22, 0.235]} ancho={0.2} alto={0.2} fondo="#b9a57a" tinta="#3a5a3a" letra={0.9} />
  </group>
);
/** Fajos de billetes apilados. */
const Fajos: React.FC<{ pos: V3; n?: number; rot?: number }> = ({ pos, n = 4, rot = 0 }) => {
  const b = texBilletes();
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      {Array.from({ length: n }, (_, i) => (
        <group key={i} position={[(i % 2) * 0.2 - 0.1, 0.03 + Math.floor(i / 2) * 0.06, 0]} rotation={[0, (i % 3) * 0.08, 0]}>
          <TCaja t={[0.18, 0.05, 0.09]} map={b} />
          <Pieza forma={{ f: "caja", t: [0.03, 0.052, 0.092] }} color="#e8e0c8" />
        </group>
      ))}
    </group>
  );
};
/** Hucha de cerdito. */
export const Hucha: React.FC<{ pos: V3; rot?: number; tam?: number }> = ({ pos, rot = 0, tam = 1 }) => (
  <group position={pos} rotation={[0, rot, 0]} scale={tam}>
    <Pieza forma={{ f: "bola", r: 0.14 }} color="#e9a3a8" pos={[0, 0.15, 0]} esc={[1.25, 1, 1]} />
    <Pieza forma={{ f: "tubo", r: 0.05, h: 0.06 }} color="#e08f96" pos={[0.18, 0.15, 0]} rot={[0, 0, Math.PI / 2]} />
    {[[-0.08, -0.06], [0.08, -0.06], [-0.08, 0.06], [0.08, 0.06]].map(([x, z], i) => (
      <Pieza key={i} forma={{ f: "tubo", r: 0.03, h: 0.07 }} color="#e08f96" pos={[x, 0.035, z]} />
    ))}
    <Pieza forma={{ f: "cono", r: 0.04, h: 0.06 }} color="#e08f96" pos={[0.1, 0.28, 0.06]} />
    <Pieza forma={{ f: "cono", r: 0.04, h: 0.06 }} color="#e08f96" pos={[0.1, 0.28, -0.06]} />
    <Pieza forma={{ f: "caja", t: [0.08, 0.01, 0.015] }} color="#2b2e3d" pos={[0, 0.29, 0]} />
  </group>
);
/** Columna clásica con basa y capitel. */
const Columna: React.FC<{ pos: V3; h: number }> = ({ pos, h }) => (
  <group position={pos}>
    <Pieza forma={{ f: "caja", t: [0.8, 0.25, 0.8] }} color="#d9d2c0" pos={[0, 0.125, 0]} />
    <Pieza forma={{ f: "tubo", r: 0.28, h: h - 0.6, seg: 20 }} color="#e6dfcc" pos={[0, h / 2, 0]} />
    <Pieza forma={{ f: "caja", t: [0.85, 0.35, 0.85] }} color="#d9d2c0" pos={[0, h - 0.175, 0]} />
  </group>
);
/** Lámpara de globo colgada del techo (cálida). */
const Globo: React.FC<{ pos: V3; luz?: number; cable: number }> = ({ pos, luz = 0, cable }) => (
  <group position={pos}>
    <Pieza forma={{ f: "tubo", r: 0.01, h: cable }} color="#2b2e3d" pos={[0, cable / 2, 0]} />
    <Pieza forma={{ f: "bola", r: 0.22 }} color="#fff1c8" basica />
    <Resplandor pos={[0, 0, 0]} r={0.9} color="#ffcf80" o={0.3} />
    {luz > 0 && <pointLight intensity={luz} distance={8} color="#ffd59a" />}
  </group>
);

// ---------------------------------------------------------------- BANCO
const Banco: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const marmol = texLosas(38, 16, 74, [4, 4]);
  const piedra = texPiedra(38, 18, 72, 10, 5, [3, 1]);
  const madera = texMadera(18, 45, 26, 6);
  const W = 12, D = 10, H = 4.6;
  const brillo = 0.55 + Math.sin(f * 0.05) * 0.08;
  return (
    <group>
      <Ambiente niebla={["#2a2620", 18, 60]} fondo="#1a1a22" />
      <hemisphereLight args={["#fff2dc", "#2a2016", 0.55]} />
      <ambientLight intensity={0.12} color="#ffe8c8" />
      {/* sala: mármol, piedra y techo artesonado */}
      <TPlano w={W} h={D} pos={[0, 0, -0.5]} rot={[-Math.PI / 2, 0, 0]} map={marmol} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={piedra} />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -0.5]} rot={[0, Math.PI / 2, 0]} map={piedra} />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -0.5]} rot={[0, -Math.PI / 2, 0]} map={piedra} />
      <TPlano w={W} h={H} pos={[0, H / 2, 4.5]} rot={[0, Math.PI, 0]} map={piedra} />
      <Pieza forma={{ f: "caja", t: [W, 0.2, D] }} color="#cfc6b0" pos={[0, H, -0.5]} />
      {[-3, 0, 3].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.3, 0.35, D] }} color="#b8ad94" pos={[x, H - 0.25, -0.5]} />
      ))}
      {/* alfombra roja hacia la cámara acorazada */}
      <TPlano w={2.2} h={7} pos={[0, 0.006, -1]} rot={[-Math.PI / 2, 0, 0]} map={texAlfombra("#7a2a2e", "#5a1c22", "#c9a24a")} />
      {/* columnas a los lados */}
      {[-4.2, 4.2].map((x) => [-4.2, -1.2, 2].map((z) => <Columna key={`${x}${z}`} pos={[x, 0, z]} h={H} />))}
      {/* la cámara acorazada al fondo, ABIERTA: marco redondo, puerta girada y el oro dentro */}
      <group position={[0, 0, -5.45]}>
        <Pieza forma={{ f: "caja", t: [3.6, 3.6, 0.3] }} color="#8a8a8e" pos={[0, 1.8, 0]} metal={0.6} rugoso={0.45} />
        <Pieza forma={{ f: "tubo", r: 1.45, h: 0.32, seg: 40 }} color="#2a2420" pos={[0, 1.7, 0.02]} rot={[Math.PI / 2, 0, 0]} />
        <Pieza forma={{ f: "aro", r: 1.45, g: 0.12 }} color="#b9b9be" pos={[0, 1.7, 0.18]} metal={0.8} rugoso={0.3} />
        {/* interior iluminado */}
        <pointLight position={[0, 1.6, 0.6]} intensity={5 * brillo} distance={5} color="#ffc966" />
        <Resplandor pos={[0, 1.4, 0.3]} r={1.4} color="#ffcf66" o={0.35 * brillo} />
        <PilaOro pos={[-0.55, 0.5, 0.25]} filas={4} />
        <PilaOro pos={[0.6, 0.5, 0.25]} filas={3} />
        <Pieza forma={{ f: "caja", t: [2.6, 0.08, 0.5] }} color="#6a6a70" pos={[0, 0.5, 0.25]} metal={0.5} />
        <Saco pos={[0.25, 0.54, 0.35]} tam={0.8} />
        {/* la puerta abierta (disco grueso con volante), girada sobre su bisagra */}
        <group position={[1.6, 1.7, 0.3]} rotation={[0, -1.15, 0]}>
          <group position={[1.4, 0, 0]}>
            <Pieza forma={{ f: "tubo", r: 1.4, h: 0.45, seg: 40 }} color="#a6a6ac" rot={[Math.PI / 2, 0, 0]} metal={0.75} rugoso={0.35} />
            <Pieza forma={{ f: "aro", r: 0.45, g: 0.05 }} color="#d8d8de" pos={[0, 0, 0.28]} metal={0.9} rugoso={0.2} />
            {[0, 1, 2].map((i) => (
              <Pieza key={i} forma={{ f: "caja", t: [0.9, 0.06, 0.06] }} color="#d8d8de" pos={[0, 0, 0.28]} rot={[0, 0, (i * Math.PI) / 3]} metal={0.9} />
            ))}
            {[-1, 1].map((k) => [-0.8, 0, 0.8].map((y) => <Pieza key={`${k}${y}`} forma={{ f: "tubo", r: 0.06, h: 0.3 }} color="#c8c8ce" pos={[k * 1.32, y, 0]} rot={[0, 0, Math.PI / 2]} metal={0.9} />))}
          </group>
        </group>
        <Letrero texto="CÁMARA ACORAZADA" pos={[0, 3.85, 0.17]} ancho={3} alto={0.4} fondo="#2b2e3d" tinta="#e9b949" letra={0.6} />
      </group>
      {/* ventanillas a la izquierda: mostrador de madera con encimera de mármol, rejas de latón y lámparas verdes */}
      <group position={[-3.0, 0, -2.6]} rotation={[0, Math.PI / 2, 0]}>
        <TCaja t={[4.8, 1.1, 0.7]} pos={[0, 0.55, 0]} map={madera} />
        <Pieza forma={{ f: "caja", t: [5, 0.08, 0.85] }} color="#e6dfcc" pos={[0, 1.14, 0]} />
        {Array.from({ length: 25 }, (_, i) => (
          <Pieza key={i} forma={{ f: "tubo", r: 0.015, h: 1.0 }} color="#c9a24a" pos={[-2.4 + i * 0.2, 1.68, -0.2]} metal={0.8} rugoso={0.3} />
        ))}
        <Pieza forma={{ f: "caja", t: [5, 0.06, 0.06] }} color="#c9a24a" pos={[0, 2.2, -0.2]} metal={0.8} />
        {[-1.6, 0, 1.6].map((x, i) => (
          <group key={x}>
            <Letrero texto={`CAJA ${i + 1}`} pos={[x, 2.45, -0.2]} ancho={0.9} alto={0.3} fondo="#2b2e3d" tinta="#f6f0e1" letra={0.6} />
            <LamparaVerde pos={[x + 0.4, 1.18, 0.1]} cable={0} />
            <Fajos pos={[x - 0.3, 1.18, 0.15]} n={3 + i} />
          </group>
        ))}
        <Telefono pos={[0.8, 1.18, 0.2]} />
      </group>
      {/* derecha: ventanales altos con la ciudad (luz fría) y bancos de espera */}
      {[-3.4, -0.6, 2.2].map((z) => (
        <group key={z} position={[W / 2 - 0.08, 2.3, z]} rotation={[0, -Math.PI / 2, 0]}>
          <Pieza forma={{ f: "caja", t: [1.5, 2.8, 0.05] }} color="#9fb7d8" basica />
          <Pieza forma={{ f: "caja", t: [0.08, 2.8, 0.08] }} color="#3a3530" />
          <Pieza forma={{ f: "caja", t: [1.5, 0.08, 0.08] }} color="#3a3530" pos={[0, 0.5, 0]} />
          <Pieza forma={{ f: "caja", t: [1.7, 0.12, 0.2] }} color="#cfc6b0" pos={[0, -1.45, 0.05]} />
        </group>
      ))}
      <directionalLight position={[10, 6, -1]} intensity={0.9} color="#a9c4ff" />
      {[-3.4, -0.6, 2.2].map((z) => (
        <Haz key={z} pos={[W / 2 - 0.2, 3.4, z]} rot={[0, 0, -1.0]} largo={6} ancho={0.9} color="#bcd2ff" o={0.03} />
      ))}
      <group position={[4.6, 0, 0.6]}>
        <TCaja t={[0.6, 0.45, 2.2]} pos={[0, 0.25, 0]} map={madera} />
        <TCaja t={[0.12, 0.6, 2.2]} pos={[0.28, 0.7, 0]} map={madera} />
      </group>
      {/* postes con cordón de terciopelo delante (la cola del banco) */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i, a) => (
        <group key={x} position={[x + 1.2, 0, 1.6]}>
          <Pieza forma={{ f: "tubo", r: 0.03, h: 0.95 }} color="#c9a24a" pos={[0, 0.48, 0]} metal={0.8} rugoso={0.3} />
          <Pieza forma={{ f: "tubo", r: 0.14, h: 0.04 }} color="#c9a24a" pos={[0, 0.02, 0]} metal={0.8} />
          <Pieza forma={{ f: "bola", r: 0.05 }} color="#e9c25a" pos={[0, 0.97, 0]} metal={0.8} />
          {i < a.length - 1 && <Pieza forma={{ f: "tubo", r: 0.025, h: 1.2 }} color="#8a1c26" pos={[0.6, 0.82, 0]} rot={[0, 0, Math.PI / 2]} />}
        </group>
      ))}
      {/* lámparas de globo del techo (cálidas) y reloj */}
      <Globo pos={[-1.5, 3.6, -1.5]} cable={1} luz={4} />
      <Globo pos={[1.5, 3.6, -1.5]} cable={1} luz={4} />
      <Globo pos={[0, 3.6, 1.2]} cable={1} luz={3} />
      <group position={[-2.6, 3.4, -5.3]}>
        <Pieza forma={{ f: "tubo", r: 0.42, h: 0.08, seg: 32 }} color="#f6f0e1" rot={[Math.PI / 2, 0, 0]} />
        <Pieza forma={{ f: "aro", r: 0.42, g: 0.04 }} color="#c9a24a" metal={0.8} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.3, 0.02] }} color="#2b2e3d" pos={[0, 0.12, 0.05]} />
        <Pieza forma={{ f: "caja", t: [0.22, 0.03, 0.02] }} color="#2b2e3d" pos={[0.1, 0, 0.05]} />
      </group>
      {/* sacos y monedas junto a la cámara */}
      <Saco pos={[-2.0, 0, -4.6]} />
      <Saco pos={[-2.5, 0, -4.2]} tam={0.8} />
      <Monedas pos={[2.2, 0, -4.4]} n={40} radio={0.5} alto={0.25} s={s} />
    </group>
  );
};

// ---------------------------------------------------------------- SALÓN (tu casa)
const Salon: React.FC<{ s: number }> = ({ s }) => {
  const f = useCurrentFrame();
  const suelo = texMadera(30, 38, 50, 9, [3, 3]);
  const mueble = texMadera(26, 40, 38, 4);
  const W = 10, D = 9, H = 3;
  const parpadeo = 0.85 + Math.sin(f * 0.37) * 0.08 + Math.sin(f * 1.3) * 0.05;
  const factura = texPapel("FACTURA", ["Luz ......... 98,40 €", "Gas ......... 61,15 €", "Agua ........ 34,90 €", "TOTAL ...... 194,45 €"], "PAGAR");
  const alquiler = texPapel("ALQUILER", ["Mes: noviembre", "Importe: 950 €", "Subida: +8 %"], "URGENTE");
  return (
    <group>
      <Ambiente niebla={["#1e1a24", 14, 50]} fondo="#141826" />
      <hemisphereLight args={["#ffe6c8", "#241c18", 0.5]} />
      <ambientLight intensity={0.1} color="#ffe4c8" />
      {/* suelo, alfombra, paredes de papel pintado verde salvia y techo */}
      <TPlano w={W} h={D} pos={[0, 0, -0.5]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={4} h={3} pos={[0, 0.006, -0.8]} rot={[-Math.PI / 2, 0, 0]} map={texAlfombra("#8a9a72", "#5e6e4c", "#d9b45a")} />
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#a9b48e" pos={[0, H / 2, -5]} />
      <Pieza forma={{ f: "caja", t: [0.1, H, D] }} color="#b7c09c" pos={[-W / 2, H / 2, -0.5]} />
      <Pieza forma={{ f: "caja", t: [0.1, H, D] }} color="#b7c09c" pos={[W / 2, H / 2, -0.5]} />
      <Pieza forma={{ f: "caja", t: [W, H, 0.1] }} color="#b7c09c" pos={[0, H / 2, 4]} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#efe8d8" pos={[0, H, -0.5]} />
      {[-W / 2 + 0.07, W / 2 - 0.07].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.05, 0.14, D] }} color="#f2ece0" pos={[x, 0.07, -0.5]} />
      ))}
      {/* ventana del fondo: anochecer con la ciudad (luz fría) */}
      <group position={[1.6, 1.65, -4.94]}>
        <Pieza forma={{ f: "caja", t: [2.2, 1.5, 0.02] }} color="#e9a86a" basica />
        <Pieza forma={{ f: "caja", t: [2.2, 0.7, 0.03] }} color="#5a6a9a" pos={[0, 0.4, 0]} basica />
        <Pieza forma={{ f: "caja", t: [0.06, 1.5, 0.06] }} color="#f2ece0" />
        <Pieza forma={{ f: "caja", t: [2.3, 0.08, 0.2] }} color="#f2ece0" pos={[0, -0.78, 0.08]} />
        {[-0.4, -0.15, 0.25, 0.6, 0.85].map((x, i) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.22, 0.4 + (i % 3) * 0.18, 0.02] }} color="#3a3a52" pos={[x - 0.2, -0.55 + (0.4 + (i % 3) * 0.18) / 2, 0.01]} basica />
        ))}
        {/* cortinas */}
        {[-1.35, 1.35].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.5, 1.9, 0.08] }} color="#c9785a" pos={[x, 0.05, 0.1]} />
        ))}
      </group>
      <pointLight position={[1.6, 1.8, -3.6]} intensity={2} distance={6} color="#9ab0e8" />
      {/* sofá a la izquierda, mirando a la tele */}
      <group position={[-2.6, 0, -2.6]} rotation={[0, 0.5, 0]}>
        <Pieza forma={{ f: "caja", t: [2.2, 0.45, 0.9] }} color="#4a6a8a" pos={[0, 0.3, 0]} />
        <Pieza forma={{ f: "caja", t: [2.2, 0.6, 0.25] }} color="#3e5c7a" pos={[0, 0.75, -0.35]} />
        {[-1.1, 1.1].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.25, 0.65, 0.9] }} color="#3e5c7a" pos={[x, 0.4, 0]} />
        ))}
        {[-0.5, 0.5].map((x) => (
          <Pieza key={x} forma={{ f: "caja", t: [0.9, 0.12, 0.75] }} color="#5a7a9a" pos={[x, 0.58, 0.05]} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.4, 0.35, 0.12] }} color="#e9b949" pos={[-0.7, 0.8, -0.18]} rot={[0.2, 0, 0.2]} />
      </group>
      {/* mesita con las facturas, la hucha, la taza y la calculadora */}
      <group position={[-0.9, 0, -1.6]}>
        <TCaja t={[1.3, 0.06, 0.7]} pos={[0, 0.45, 0]} map={mueble} />
        {[[-0.58, -0.28], [0.58, -0.28], [-0.58, 0.28], [0.58, 0.28]].map(([x, z], i) => (
          <Pieza key={i} forma={{ f: "caja", t: [0.06, 0.45, 0.06] }} color="#4a3220" pos={[x, 0.22, z]} />
        ))}
        <TPlano w={0.3} h={0.4} pos={[-0.25, 0.485, 0.05]} rot={[-Math.PI / 2, 0, 0.3]} map={factura} />
        <TPlano w={0.3} h={0.4} pos={[0.05, 0.487, -0.1]} rot={[-Math.PI / 2, 0, -0.2]} map={alquiler} />
        <Hucha pos={[0.42, 0.48, 0.05]} rot={-0.6} tam={0.9} />
        <Pieza forma={{ f: "tubo", r: 0.05, h: 0.1 }} color="#f6f0e1" pos={[0.25, 0.53, 0.25]} />
        <Pieza forma={{ f: "caja", t: [0.12, 0.02, 0.18] }} color="#2b2e3d" pos={[-0.45, 0.49, -0.2]} rot={[0, 0.4, 0]} />
      </group>
      {/* tele en un mueble a la derecha con el gráfico que cae (luz fría que parpadea) */}
      <group position={[3.4, 0, -3.0]} rotation={[0, -0.65, 0]}>
        <TCaja t={[1.8, 0.5, 0.5]} pos={[0, 0.25, 0]} map={mueble} />
        <Pieza forma={{ f: "caja", t: [1.5, 0.88, 0.06] }} color="#121216" pos={[0, 1.0, 0]} />
        <TPlano w={1.4} h={0.78} pos={[0, 1.0, 0.035]} map={texGrafico(true, "IPC +8 %")} brillo={0.9} />
        <pointLight position={[0, 1.0, 0.6]} intensity={2.2 * parpadeo} distance={4} color="#8fb0ff" />
      </group>
      {/* cocina al fondo a la izquierda: nevera, encimera y calendario */}
      <group position={[-3.6, 0, -4.4]}>
        <Pieza forma={{ f: "caja", t: [0.8, 1.9, 0.7] }} color="#eeeeea" pos={[0, 0.95, 0]} />
        <Pieza forma={{ f: "caja", t: [0.04, 0.5, 0.04] }} color="#9a9a9e" pos={[0.33, 1.3, 0.37]} />
        <Pieza forma={{ f: "caja", t: [0.8, 0.02, 0.02] }} color="#b8b8bc" pos={[0, 1.2, 0.36]} />
        <TPlano w={0.25} h={0.32} pos={[0, 1.55, 0.36]} map={texPapel("LISTA", ["leche", "pan", "huevos"])} />
        <TCaja t={[1.6, 0.9, 0.6]} pos={[1.3, 0.45, 0.05]} map={mueble} />
        <Pieza forma={{ f: "caja", t: [1.7, 0.05, 0.65] }} color="#d8d2c4" pos={[1.3, 0.92, 0.05]} />
        <Pieza forma={{ f: "tubo", r: 0.12, h: 0.18 }} color="#c95a3a" pos={[1.0, 1.04, 0.05]} />
        <Letrero texto="NOVIEMBRE" pos={[1.4, 1.75, -0.32]} ancho={0.6} alto={0.16} fondo="#f6f0e1" tinta="#b03a2e" letra={0.6} />
        <Pieza forma={{ f: "caja", t: [0.6, 0.5, 0.01] }} color="#f6f0e1" pos={[1.4, 1.42, -0.33]} />
      </group>
      {/* estantería y cuadros */}
      <Estanteria pos={[-4.8, 0, -1.2]} rot={[0, Math.PI / 2, 0]} ancho={1.6} alto={2.2} s={s} />
      <group position={[-1.4, 1.9, -4.93]}>
        <Pieza forma={{ f: "caja", t: [0.9, 0.65, 0.04] }} color="#3a2a1c" />
        <Pieza forma={{ f: "caja", t: [0.78, 0.53, 0.02] }} color="#e9d9a8" pos={[0, 0, 0.02]} />
        <Pieza forma={{ f: "bola", r: 0.12 }} color="#c95a3a" pos={[0.15, 0.08, 0.04]} esc={[1, 1, 0.2]} />
      </group>
      {/* lámpara de pie (cálida) junto al sofá */}
      <group position={[-3.9, 0, -3.6]}>
        <Pieza forma={{ f: "tubo", r: 0.02, h: 1.6 }} color="#2b2e3d" pos={[0, 0.8, 0]} />
        <Pieza forma={{ f: "tubo", r: 0.18, h: 0.03 }} color="#2b2e3d" pos={[0, 0.02, 0]} />
        <Pieza forma={{ f: "cono", r: 0.3, h: 0.35 }} color="#f2e2b8" pos={[0, 1.7, 0]} />
        <Resplandor pos={[0, 1.6, 0]} r={0.8} color="#ffd590" o={0.35} />
        <pointLight position={[0, 1.55, 0.2]} intensity={4} distance={7} color="#ffcf8a" />
      </group>
      <Ciudad pos={[0, -2, -40]} s={s} ancho={80} n={20} color="#3a3a52" luces="#ffd88a" />
    </group>
  );
};

export const ESCENARIOS_ECONOMIA = { banco: Banco, salon: Salon };
