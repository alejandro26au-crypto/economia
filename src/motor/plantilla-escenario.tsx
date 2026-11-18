// PLANTILLA DE ESCENARIO (no está registrada: cópiala). Pasos para un escenario nuevo «faro»:
// 1. Copia este componente al .tsx del vídeo (p. ej. escenarios-faro.tsx), cámbiale el nombre y llena el decorado
//    con piezas de ./atrezo (lee la cabecera de atrezo.ts: ahí está todo lo que ya existe).
// 2. Exporta el mapa al final: export const ESCENARIOS_FARO = { faro: Faro } y añádelo en escenarios.tsx (ESCENARIOS3D).
// 3. Añade "faro" al tipo Escenario (tipos.ts).
// 4. Copia la entrada de DATOS de abajo en escenarios-datos.ts. Los puntos y obstáculos van en METROS del mundo
//    (las mismas cifras que el decorado): obstaculos [x, z, radio, alto]; puntos con `metros: true`.
// 5. En la idea, coloca actores en metros: { tipo: "bent", ...enMetros("faro", 1.2, -1.5) }.
// 6. `./oceano revisar N --prueba`: la hoja + el chequeo de planos (avisa si la cámara se mete en algo).
//
// Regla de calidad (nivel del camarote): muchos objetos con textura pintada y con historia, 1-3 luces cálidas
// reales contra una fría, fondo con siluetas lejanas y el centro LIBRE para los personajes (x -2..2, z 0..-3).
//
// Entrada de DATOS de ejemplo (sala de 10 x 9 m con el escenario de 4 x 3 m delante del fondo):
//   faro: {
//     centro: [0, 0, 1.2], ancho: 4, fondo: 3, suelo: 0, altoMira: 1.4, distMax: 7, caja: [-4.8, 0.3, -5.2, 4.8, 3.7, 3.2],
//     agua: false, tinte: "#ffdcb8", nieblaPersonajes: [10, 35],
//     obstaculos: [[0, -3.6, 1.2, 1]],
//     puntos: { mesa: { x: 0.8, z: -2.6, metros: true, mira: 1, pose: "senala", claves: ["map", "letter"] } },
//   },
import React from "react";
import { Ambiente, Barril, Farol, LamparaAceite, Pieza, TCaja, TPlano, Ventana, texMadera, texPiedra } from "./atrezo";

export const Plantilla: React.FC<{ s: number }> = ({ s }) => {
  const suelo = texMadera(28, 40, 34, 10, [3, 3]);
  const pared = texPiedra(30, 16, 60, 10, 4, [3, 1]);
  const W = 10, D = 9, H = 3.6;
  return (
    <group>
      <Ambiente niebla={["#140e0a", 12, 40]} fondo="#0a0806" />
      <hemisphereLight args={["#ffd8b0", "#100c08", 0.3]} />
      <ambientLight intensity={0.08} color="#ffe0c0" />
      {/* sala: suelo, 4 paredes y techo */}
      <TPlano w={W} h={D} pos={[0, 0, -1]} rot={[-Math.PI / 2, 0, 0]} map={suelo} />
      <TPlano w={W} h={H} pos={[0, H / 2, -5.5]} map={pared} />
      <TPlano w={D} h={H} pos={[-W / 2, H / 2, -1]} rot={[0, Math.PI / 2, 0]} map={pared} />
      <TPlano w={D} h={H} pos={[W / 2, H / 2, -1]} rot={[0, -Math.PI / 2, 0]} map={pared} />
      <TPlano w={W} h={H} pos={[0, H / 2, 3.5]} rot={[0, Math.PI, 0]} map={pared} />
      <Pieza forma={{ f: "caja", t: [W, 0.1, D] }} color="#2a1e16" pos={[0, H, -1]} />
      {/* el objeto protagonista al fondo (mesa) con su luz cálida */}
      <TCaja t={[2.2, 0.08, 1]} pos={[0, 0.8, -3.6]} map={texMadera(22, 50, 28, 4)} />
      <LamparaAceite pos={[-0.7, 0.84, -3.7]} s={s} luz={6} />
      {/* luz fría: ventana con la noche */}
      <Ventana pos={[W / 2 - 0.05, 1.8, -1]} rot={[0, -Math.PI / 2, 0]} cielo="#1a2a4a" />
      <pointLight position={[W / 2 - 1, 1.8, -1]} intensity={3} distance={5} color="#7a9ad8" />
      {/* atrezo con historia por los lados (deja libre el centro) */}
      <Barril pos={[-4, 0, -4.4]} />
      <Farol pos={[1.6, H, -1.6]} s={s} cadena={0.6} luz={5} />
    </group>
  );
};
