// Modelos 3D del vídeo 2 (Proyecto Azorian, 1974): el barco «minero» de la CIA con su torre de perforación,
// el barco espía soviético con sus cúpulas de radar, la garra gigante colgada del tubo, el submarino K-129 que se
// parte al subir, una lata que la presión aplasta y un nódulo de manganeso. Todos miden 1 de largo (o de ancho)
// y miran hacia +x; la escala la pone `tam`.
import React, { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import * as THREE from "three";
import { Pieza } from "./piezas3d";

const M = { metal: 0.55, rugoso: 0.5 };

/** Letrero pintado (nombre del barco, número de casco…). */
export function texturaLetrero(texto: string, fondo: string, tinta: string, ancho = 1024, alto = 128, letra = 0.62) {
  const c = document.createElement("canvas");
  c.width = ancho;
  c.height = alto;
  const x = c.getContext("2d")!;
  if (fondo === "transparent") x.clearRect(0, 0, ancho, alto);
  else {
    x.fillStyle = fondo;
    x.fillRect(0, 0, ancho, alto);
  }
  x.fillStyle = tinta;
  x.font = `bold ${Math.round(alto * letra)}px sans-serif`;
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.fillText(texto, ancho / 2, alto / 2 + 2);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/** Torre de celosía (derrick): 4 patas que se estrechan y travesaños en X. Base en y = 0. */
export const Torre: React.FC<{ alto: number; base: number; arriba: number; color: string; luces?: boolean; abierta?: boolean }> = ({ alto, base, arriba, color, luces, abierta }) => {
  const f = useCurrentFrame();
  const n = 9;
  const anchoEn = (y: number) => base + (arriba - base) * (y / alto);
  const patas = [
    [-1, -1],
    [1, -1],
    [1, 1],
    [-1, 1],
  ];
  const r = base * 0.035;
  const piezas: React.ReactNode[] = [];
  // patas inclinadas
  patas.forEach(([sx, sz], i) => {
    const x0 = (sx * base) / 2;
    const z0 = (sz * base) / 2;
    const x1 = (sx * arriba) / 2;
    const z1 = (sz * arriba) / 2;
    const largo = Math.hypot(x1 - x0, alto, z1 - z0);
    const q = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(x1 - x0, alto, z1 - z0).normalize());
    const e = new THREE.Euler().setFromQuaternion(q);
    piezas.push(<Pieza key={`p${i}`} forma={{ f: "tubo", r, h: largo, seg: 6 }} color={color} pos={[(x0 + x1) / 2, alto / 2, (z0 + z1) / 2]} rot={[e.x, e.y, e.z]} {...M} />);
  });
  // travesaños horizontales y diagonales en cada cara
  for (let k = 0; k <= n; k++) {
    const y = (alto * k) / n;
    const w = anchoEn(y);
    for (let c = 0; c < 4; c++) {
      // abierta: la cara de delante (+z) sin travesaños abajo (la "puerta" de la torre), para ver a través
      if (abierta && c === 0 && k < n - 2) continue;
      const vertical = c % 2 === 0;
      const lado = c < 2 ? 1 : -1;
      piezas.push(
        <Pieza key={`h${k}${c}`} forma={{ f: "caja", t: vertical ? [w, r * 1.4, r * 1.4] : [r * 1.4, r * 1.4, w] }} color={color} pos={vertical ? [0, y, (lado * w) / 2] : [(lado * w) / 2, y, 0]} {...M} />,
      );
      if (k < n) {
        const y2 = (alto * (k + 1)) / n;
        const wm = anchoEn((y + y2) / 2);
        const dy = y2 - y;
        const diag = Math.hypot(wm, dy);
        const ang = Math.atan2(dy, wm) * (k % 2 ? 1 : -1);
        piezas.push(
          <Pieza key={`d${k}${c}`} forma={{ f: "caja", t: [diag, r, r] }} color={color} pos={vertical ? [0, (y + y2) / 2, (lado * wm) / 2] : [(lado * wm) / 2, (y + y2) / 2, 0]} rot={vertical ? [0, 0, ang] : [ang, Math.PI / 2, 0]} {...M} />,
        );
      }
    }
  }
  return (
    <group>
      {piezas}
      {/* corona de la torre y luz de aviso roja que parpadea */}
      <Pieza forma={{ f: "caja", t: [arriba * 1.3, alto * 0.03, arriba * 1.3] }} color={color} pos={[0, alto, 0]} {...M} />
      <Pieza forma={{ f: "bola", r: base * 0.05, seg: 8 }} color="#ff3020" basica opacidad={0.4 + 0.6 * (Math.sin(f * 0.15) > 0 ? 1 : 0)} pos={[0, alto * 1.04, 0]} />
      {luces &&
        [0.25, 0.5, 0.75].map((k) => (
          <Pieza key={k} forma={{ f: "bola", r: base * 0.03, seg: 8 }} color="#fff0c8" basica pos={[(anchoEn(alto * k) / 2) * 1.02, alto * k, (anchoEn(alto * k) / 2) * 1.02]} />
        ))}
    </group>
  );
};

/** El Hughes Glomar Explorer (en la realidad, 189 m): casco largo, torre de perforación en medio, los dos
 *  brazos de atraque, castillo de popa con el puente y bastidores de tubos. De noche, con focos y ventanas. */
export const Glomar3D: React.FC<{ noche?: boolean }> = ({ noche }) => {
  const f = useCurrentFrame();
  const nombre = useMemo(() => texturaLetrero("HUGHES GLOMAR EXPLORER", "transparent", "#f2f2ee", 2048, 128, 0.6), []);
  const casco = "#283240";
  const blanco = "#e4e2dc";
  const cub = "#8c8a84";
  return (
    <group>
      {/* casco: cuerpo + proa en cuña; la línea de flotación roja queda justo en el agua (y = 0) */}
      <Pieza forma={{ f: "caja", t: [0.84, 0.1, 0.165] }} color={casco} pos={[-0.04, 0.03, 0]} {...M} />
      <Pieza forma={{ f: "caja", t: [0.84, 0.025, 0.166] }} color="#8a2a22" pos={[-0.04, -0.008, 0]} {...M} />
      <Pieza forma={{ f: "cono", r: 0.083, h: 0.13, seg: 4 }} color={casco} pos={[0.445, 0.03, 0]} rot={[0, Math.PI / 4, -Math.PI / 2]} esc={[1, 1, 0.72]} {...M} />
      {/* cubierta */}
      <Pieza forma={{ f: "caja", t: [0.84, 0.006, 0.16] }} color={cub} pos={[-0.04, 0.083, 0]} rugoso={0.85} />
      {/* nombre en el costado */}
      <mesh position={[0.02, 0.055, 0.0835]}>
        <planeGeometry args={[0.5, 0.032]} />
        <meshBasicMaterial map={nombre} transparent depthWrite={false} toneMapped={false} />
      </mesh>
      {/* torre de perforación sobre el pozo central */}
      <group position={[0.02, 0.086, 0]}>
        <Pieza forma={{ f: "caja", t: [0.12, 0.03, 0.1] }} color="#6c6a64" pos={[0, 0.015, 0]} {...M} />
        <group position={[0, 0.03, 0]}>
          <Torre alto={0.27} base={0.07} arriba={0.022} color="#d8d2c2" luces={noche} />
        </group>
        {/* brazos de atraque (los dos pórticos a los lados del pozo) */}
        {[-0.1, 0.1].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            <Pieza forma={{ f: "caja", t: [0.018, 0.13, 0.018] }} color="#b8b2a2" pos={[0, 0.065, -0.05]} {...M} />
            <Pieza forma={{ f: "caja", t: [0.018, 0.13, 0.018] }} color="#b8b2a2" pos={[0, 0.065, 0.05]} {...M} />
            <Pieza forma={{ f: "caja", t: [0.022, 0.016, 0.12] }} color="#b8b2a2" pos={[0, 0.13, 0]} {...M} />
          </group>
        ))}
      </group>
      {/* bastidores con los tubos (millas de tubo apiladas) */}
      {[0.2, 0.28].map((x) => (
        <group key={x} position={[x, 0.09, 0]}>
          {Array.from({ length: 12 }, (_, i) => (
            <Pieza key={i} forma={{ f: "tubo", r: 0.0045, h: 0.07, seg: 6 }} color="#9a8c72" pos={[0, 0.005 + Math.floor(i / 6) * 0.009, -0.03 + (i % 6) * 0.012]} rot={[0, 0, Math.PI / 2]} metal={0.6} rugoso={0.5} />
          ))}
        </group>
      ))}
      {/* castillo de popa: bloques blancos con ventanas, puente y chimenea */}
      <group position={[-0.36, 0.086, 0]}>
        <Pieza forma={{ f: "caja", t: [0.12, 0.05, 0.15] }} color={blanco} pos={[0, 0.025, 0]} {...M} />
        <Pieza forma={{ f: "caja", t: [0.09, 0.035, 0.12] }} color={blanco} pos={[0.005, 0.068, 0]} {...M} />
        <Pieza forma={{ f: "caja", t: [0.06, 0.02, 0.15] }} color={blanco} pos={[0.015, 0.095, 0]} {...M} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.05, 0.03] }} color="#3a3f46" pos={[-0.04, 0.1, 0]} {...M} />
        <Pieza forma={{ f: "tubo", r: 0.002, h: 0.08 }} color="#3a3f46" pos={[0.015, 0.14, 0]} />
        <Pieza forma={{ f: "caja", t: [0.03, 0.004, 0.004] }} color="#3a3f46" pos={[0.015, 0.165, 0]} rot={[0, f * 0.05, 0]} />
        {[0, 1].map((fila) =>
          Array.from({ length: 6 }, (_, i) => (
            <Pieza key={`${fila}${i}`} forma={{ f: "caja", t: [0.008, 0.006, 0.002] }} color={noche ? "#ffd690" : "#2a3440"} basica={noche} pos={[0.061, 0.018 + fila * 0.048, -0.05 + i * 0.02]} rot={[0, Math.PI / 2, 0]} />
          )),
        )}
        {Array.from({ length: 5 }, (_, i) => (
          <Pieza key={`v${i}`} forma={{ f: "caja", t: [0.01, 0.007, 0.002] }} color={noche ? "#ffd690" : "#22303c"} basica={noche} pos={[-0.04 + i * 0.022, 0.03, 0.0755]} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.07, 0.003, 0.07] }} color="#4a5a4a" pos={[-0.04, 0.0505, 0]} />
      </group>
      {/* castillo de proa */}
      <Pieza forma={{ f: "caja", t: [0.08, 0.025, 0.15] }} color={blanco} pos={[0.33, 0.098, 0]} {...M} />
      {/* luces de noche: focos sobre la cubierta y reflejo en el agua */}
      {noche && (
        <group>
          <pointLight position={[0.02, 0.25, 0.1]} intensity={0.9} distance={0.9} color="#fff1cc" />
          <pointLight position={[-0.3, 0.2, 0.12]} intensity={0.5} distance={0.6} color="#ffd690" />
          {[-0.2, 0.02, 0.22].map((x) => (
            <mesh key={x} position={[x, 0.16, 0]}>
              <sphereGeometry args={[0.05, 12, 10]} />
              <meshBasicMaterial color="#ffe2a0" transparent opacity={0.12} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          ))}
          <mesh position={[0, 0.002, 0.25]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.32]} />
            <meshBasicMaterial color="#ffcf80" transparent opacity={0.1 + 0.03 * Math.sin(f * 0.2)} blending={THREE.AdditiveBlending} depthWrite={false} />
          </mesh>
        </group>
      )}
    </group>
  );
};

/** Barco espía soviético (como el Chazhma de 1974): casco gris, cúpulas de radar blancas, mástil y bandera roja.
 *  Con `foco`, un reflector que barre el mar. */
export const BuqueSovietico3D: React.FC<{ foco?: boolean; noche?: boolean; fase?: number }> = ({ foco, noche, fase = 0 }) => {
  const f = useCurrentFrame();
  const gris = "#59616a";
  const barrido = Math.sin(f * 0.025 + fase) * 0.7;
  return (
    <group>
      <Pieza forma={{ f: "caja", t: [0.8, 0.09, 0.13] }} color={gris} pos={[-0.03, 0.03, 0]} {...M} />
      <Pieza forma={{ f: "caja", t: [0.8, 0.02, 0.131] }} color="#6a2a22" pos={[-0.03, -0.004, 0]} {...M} />
      <Pieza forma={{ f: "cono", r: 0.066, h: 0.16, seg: 4 }} color={gris} pos={[0.45, 0.03, 0]} rot={[0, Math.PI / 4, -Math.PI / 2]} esc={[1, 1, 0.7]} {...M} />
      <Pieza forma={{ f: "caja", t: [0.8, 0.005, 0.125] }} color="#6e6a62" pos={[-0.03, 0.078, 0]} />
      {/* superestructura */}
      <Pieza forma={{ f: "caja", t: [0.22, 0.07, 0.1] }} color="#7c838a" pos={[-0.02, 0.115, 0]} {...M} />
      <Pieza forma={{ f: "caja", t: [0.12, 0.04, 0.08] }} color="#7c838a" pos={[0.02, 0.17, 0]} {...M} />
      {Array.from({ length: 5 }, (_, i) => (
        <Pieza key={i} forma={{ f: "caja", t: [0.012, 0.008, 0.002] }} color={noche ? "#ffcf80" : "#20262c"} basica={noche} pos={[-0.02 + i * 0.02, 0.175, 0.041]} />
      ))}
      {/* mástil con antenas */}
      <Pieza forma={{ f: "tubo", r: 0.004, h: 0.2 }} color="#3a4046" pos={[0.02, 0.29, 0]} />
      <Pieza forma={{ f: "caja", t: [0.06, 0.004, 0.004] }} color="#3a4046" pos={[0.02, 0.33, 0]} />
      <Pieza forma={{ f: "caja", t: [0.004, 0.004, 0.05] }} color="#3a4046" pos={[0.02, 0.36, 0]} rot={[0, f * 0.06, 0]} />
      {/* cúpulas de radar */}
      {[-0.17, 0.2].map((x, i) => (
        <group key={x} position={[x, 0.08, 0]}>
          <Pieza forma={{ f: "tubo", r: 0.025, h: 0.04 }} color="#7c838a" pos={[0, 0.02, 0]} {...M} />
          <Pieza forma={{ f: "bola", r: 0.05 - i * 0.008, seg: 20 }} color="#e8e6e0" pos={[0, 0.07, 0]} rugoso={0.4} />
        </group>
      ))}
      {/* bandera roja en popa */}
      <Pieza forma={{ f: "tubo", r: 0.002, h: 0.07 }} color="#2a2a2a" pos={[-0.42, 0.115, 0]} />
      <Pieza forma={{ f: "caja", t: [0.04, 0.025, 0.002] }} color="#c42a2a" pos={[-0.44, 0.137, 0]} rot={[0, Math.sin(f * 0.1) * 0.3, 0]} brillo={noche ? "#6a1010" : undefined} intensidad={0.6} />
      {foco && (
        <group position={[0.08, 0.2, 0.03]} rotation={[0, barrido, 0]}>
          <Pieza forma={{ f: "bola", r: 0.008, seg: 8 }} color="#fff6d8" basica />
          <mesh position={[0.6, -0.11, 0]} rotation={[0, 0, Math.PI / 2 + 0.18]}>
            <coneGeometry args={[0.09, 1.2, 24, 1, true]} />
            <meshBasicMaterial color="#fff2c8" transparent opacity={0.09} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          <pointLight position={[0.9, -0.15, 0]} intensity={1.2} distance={1.2} color="#fff2c8" />
        </group>
      )}
    </group>
  );
};

/** La garra gigante (la «Clementine» de la CIA): bastidor de acero con brazos curvos que se cierran (`cierra`
 *  = fotogramas desde que se cierra, -1 = abierta), focos y el tubo que sube hasta el barco. Ancho 1. */
export const Garra3D: React.FC<{ cierra: number; tubo?: boolean }> = ({ cierra, tubo = true }) => {
  const f = useCurrentFrame();
  const k = cierra < 0 ? 0 : Math.min(1, cierra / 16);
  const abre = 0.75 * (1 - k) + 0.05;
  const acero = "#8a8f94";
  const amarillo = "#c9a33a";
  return (
    <group>
      {/* bastidor */}
      <Pieza forma={{ f: "caja", t: [1, 0.08, 0.32] }} color={amarillo} pos={[0, 0.62, 0]} {...M} />
      {[-0.45, 0.45].map((x) => (
        <Pieza key={x} forma={{ f: "caja", t: [0.06, 0.3, 0.3] }} color={amarillo} pos={[x, 0.5, 0]} {...M} />
      ))}
      <Pieza forma={{ f: "tubo", r: 0.08, h: 0.24 }} color={acero} pos={[0, 0.78, 0]} {...M} />
      {tubo && <Pieza forma={{ f: "tubo", r: 0.035, h: 80, seg: 10 }} color="#6a6e72" pos={[0, 40.8, 0]} metal={0.7} rugoso={0.4} />}
      {/* brazos: 4 por lado, curvos, que giran desde el bastidor */}
      {[-1, 1].map((lado) =>
        [-0.36, -0.12, 0.12, 0.36].map((x, i) => (
          <group key={`${lado}${i}`} position={[x, 0.6, lado * 0.15]} rotation={[lado * abre, 0, 0]}>
            <Pieza forma={{ f: "caja", t: [0.07, 0.34, 0.04] }} color={acero} pos={[0, -0.17, 0]} {...M} />
            <group position={[0, -0.34, 0]} rotation={[-lado * 0.9, 0, 0]}>
              <Pieza forma={{ f: "caja", t: [0.065, 0.24, 0.04] }} color={acero} pos={[0, -0.12, 0]} {...M} />
              <Pieza forma={{ f: "cono", r: 0.035, h: 0.08, seg: 4 }} color="#5a5e62" pos={[0, -0.27, 0]} rot={[Math.PI, 0, 0]} {...M} />
            </group>
          </group>
        )),
      )}
      {/* focos (la única luz a 5.000 m) */}
      {[-0.42, 0.42].map((x, i) => (
        <group key={x} position={[x, 0.42, 0.17]}>
          <Pieza forma={{ f: "bola", r: 0.03, seg: 8 }} color="#fff6dc" basica />
          <mesh position={[0, -0.9, 0.25]} rotation={[0.25, 0, 0]}>
            <coneGeometry args={[0.45, 1.8, 20, 1, true]} />
            <meshBasicMaterial color="#e8f4ff" transparent opacity={0.05 + 0.01 * Math.sin(f * 0.1 + i)} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      <pointLight position={[0, 0.1, 0.6]} intensity={2.2} distance={4} color="#e8f4ff" />
    </group>
  );
};

/** Submarino soviético K-129 (clase Golf II, de diésel, con 3 misiles nucleares en la vela). `rompe` =
 *  fotogramas desde que se parte (-1 = entero): la popa se suelta y cae hasta el fondo (`alto` = metros que hay
 *  hasta el fondo, `escala` = metros por unidad). Largo 1, mira a +x. */
export const K1293D: React.FC<{ rompe: number; alto: number; escala: number }> = ({ rompe, alto, escala }) => {
  const f = useCurrentFrame();
  const negro = "#3c434a";
  const oxido = "#5a3a2a";
  const k = rompe < 0 ? 0 : Math.min(1, rompe / 70);
  const caida = k * k; // cae acelerando
  const bajada = (alto / escala) * caida;
  const corte = -0.08; // punto por donde se parte (justo detrás de la vela)
  const tramo = (x0: number, x1: number, color = negro) => (
    <group>
      <Pieza forma={{ f: "tubo", r: 0.05, h: x1 - x0, seg: 22 }} color={color} pos={[(x0 + x1) / 2, 0, 0]} rot={[0, 0, Math.PI / 2]} rugoso={0.7} metal={0.35} />
    </group>
  );
  return (
    <group position={[0, 0.06, 0]}>
      <pointLight position={[0.1, 0.5, 0.4]} intensity={3} distance={1.2} color="#cfe0ff" />
      {/* parte delantera (la que la garra se lleva) */}
      <group>
        {tramo(corte, 0.4)}
        <Pieza forma={{ f: "bola", r: 0.05, seg: 20 }} esc={[1.8, 1, 1]} color={negro} pos={[0.4, 0, 0]} rugoso={0.7} metal={0.35} />
        {/* vela larga con los 3 tubos de misiles */}
        <Pieza forma={{ f: "caja", t: [0.19, 0.07, 0.04] }} color={negro} pos={[0.07, 0.08, 0]} rugoso={0.7} metal={0.35} />
        <Pieza forma={{ f: "caja", t: [0.06, 0.03, 0.035] }} color={negro} pos={[0.15, 0.125, 0]} rugoso={0.7} />
        {[0.0, 0.05, 0.1].map((x) => (
          <Pieza key={x} forma={{ f: "tubo", r: 0.012, h: 0.006 }} color="#8a2a22" pos={[x, 0.118, 0]} brillo="#5a0a0a" intensidad={rompe < 0 ? 0.4 + 0.3 * Math.sin(f * 0.2) : 0.1} />
        ))}
        <Pieza forma={{ f: "caja", t: [0.06, 0.004, 0.13] }} color={negro} pos={[0.33, 0.01, 0]} />
        {/* óxido y desperfectos */}
        <Pieza forma={{ f: "bola", r: 0.02, seg: 8 }} esc={[2, 0.4, 1]} color={oxido} pos={[0.22, 0.04, 0.035]} />
        <Pieza forma={{ f: "bola", r: 0.018, seg: 8 }} esc={[2.4, 0.5, 1]} color={oxido} pos={[-0.02, -0.02, 0.04]} />
      </group>
      {/* parte trasera (la que vuelve al fondo) */}
      <group position={[corte, -bajada, 0]} rotation={[k * 0.3, 0, -k * 0.35]}>
        <group position={[-corte, 0, 0]}>
          {tramo(-0.4, corte - 0.004, "#353b42")}
          <Pieza forma={{ f: "cono", r: 0.05, h: 0.14, seg: 22 }} color={negro} pos={[-0.47, 0, 0]} rot={[0, 0, Math.PI / 2]} rugoso={0.7} metal={0.35} />
          <Pieza forma={{ f: "caja", t: [0.05, 0.004, 0.13] }} color={negro} pos={[-0.48, 0, 0]} />
          <Pieza forma={{ f: "caja", t: [0.05, 0.12, 0.004] }} color={negro} pos={[-0.49, 0, 0]} />
          <Pieza forma={{ f: "bola", r: 0.02, seg: 8 }} esc={[2.2, 0.5, 1]} color={oxido} pos={[-0.25, 0.03, 0.035]} />
        </group>
      </group>
      {/* astillas y burbujas en la rotura */}
      {rompe >= 0 && rompe < 60 &&
        Array.from({ length: 10 }, (_, i) => {
          const t = rompe / 60;
          return <Pieza key={i} forma={{ f: "caja", t: [0.012, 0.008, 0.01] }} color="#3a3a3a" pos={[corte + Math.cos(i * 2.3) * 0.08 * t, -t * t * 0.3 * (1 + (i % 3)), Math.sin(i * 1.7) * 0.06 * t]} rot={[i, t * 6, i * 2]} />;
        })}
    </group>
  );
};

/** Lata de refresco: `aplasta` = fotogramas desde que la presión la aplasta (-1 = intacta). Ancho 1. */
export const Lata3D: React.FC<{ aplasta: number }> = ({ aplasta }) => {
  const etiqueta = useMemo(() => texturaLetrero("COLA", "#b3202f", "#f4efe4", 512, 256, 0.5), []);
  const k = aplasta < 0 ? 0 : Math.min(1, aplasta / 10);
  const sy = 1 - 0.55 * k;
  const sx = 1 - 0.25 * k;
  return (
    <group scale={[sx, sy, 1 + 0.15 * k]} rotation={[0, -Math.PI / 2, 0.08 * k]}>
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 1.6, 32]} />
        <meshStandardMaterial map={etiqueta} metalness={0.5} roughness={0.35} />
      </mesh>
      <Pieza forma={{ f: "tubo", r: 0.42, r2: 0.5, h: 0.12 }} color="#c4c8cc" pos={[0, 0.06, 0]} metal={0.8} rugoso={0.3} />
      <Pieza forma={{ f: "tubo", r: 0.42, h: 0.12 }} color="#c4c8cc" pos={[0, 1.76, 0]} metal={0.8} rugoso={0.3} />
      {k > 0 && [0.5, 0.9, 1.3].map((y, i) => <Pieza key={i} forma={{ f: "aro", r: 0.5, g: 0.05 }} color="#7a1018" pos={[0, y, 0]} rot={[Math.PI / 2 + (i - 1) * 0.15, 0, 0]} />)}
    </group>
  );
};

/** Nódulo de manganeso: la «piedra de metal» que el barco decía que iba a recoger. Ancho 1. */
export const Nodulo3D: React.FC = () => (
  <group>
    <Pieza forma={{ f: "roca", r: 0.5, s: 7 }} esc={[1, 0.62, 0.85]} color="#2a2420" pos={[0, 0.3, 0]} rugoso={0.45} metal={0.55} />
    {[0, 1, 2, 3, 4].map((i) => (
      <Pieza key={i} forma={{ f: "bola", r: 0.09, seg: 8 }} color="#3a3028" pos={[Math.cos(i * 1.3) * 0.36, 0.4 + Math.sin(i) * 0.1, Math.sin(i * 1.3) * 0.3]} rugoso={0.4} metal={0.6} />
    ))}
  </group>
);
