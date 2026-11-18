// LA CIUDAD INERCIA: el mundo del canal, un panorama dibujado a tinta y acuarela (como la referencia del mundo:
// banco con columnas, bolsa con su pantalla, mercado, río con barcos, cajeros, banco central…). La cámara viaja
// por él; los personajes caminan por el paseo de delante. Va en CAPAS con paralaje (cielo, lejos, ciudad, delante).
// Coordenadas: px del mundo; el suelo de los edificios está en y = SUELO; el paseo va de SUELO a SUELO + 300.
import React from "react";
import { Lugar } from "../motor/tipos";
import { Billete, C, Forma, INK, Letrero, Linea, Moneda, Saco, Ventanas, rect } from "./trazo";

export const SUELO = 2000;
export const ANCHO_MUNDO = 9600;

/** Los lugares de izquierda a derecha: x = centro; foco = punto del edificio que enseña el plano «edificio». */
export const LUGARES: Record<Lugar, { x: number; foco: [number, number]; zoomEdificio: number }> = {
  casa: { x: 700, foco: [760, 1620], zoomEdificio: 0.9 },
  banco: { x: 2050, foco: [2050, 1560], zoomEdificio: 0.85 },
  bolsa: { x: 3450, foco: [3450, 1450], zoomEdificio: 0.75 },
  mercado: { x: 4750, foco: [4750, 1760], zoomEdificio: 1.0 },
  puerto: { x: 6100, foco: [6150, 1800], zoomEdificio: 0.85 },
  cajeros: { x: 7450, foco: [7450, 1720], zoomEdificio: 0.95 },
  gobierno: { x: 8750, foco: [8750, 1500], zoomEdificio: 0.8 },
};

// ---------------------------------------------------------------- CIELO (paralaje 0.15)
export const Cielo: React.FC<{ f: number; noche?: boolean }> = ({ f, noche }) => (
  <g>
    <defs>
      <linearGradient id="gcielo" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0" stopColor={noche ? "#33405e" : C.cielo} />
        <stop offset="0.6" stopColor={noche ? "#6a6f86" : C.cieloClaro} />
        <stop offset="1" stopColor={noche ? "#a99f9a" : "#efe7d4"} />
      </linearGradient>
    </defs>
    <rect x={-3000} y={-2000} width={9000} height={4600} fill="url(#gcielo)" />
    {/* sol (o luna) */}
    <circle cx={1300} cy={420} r={110} fill={noche ? "#f2ead0" : "#f6e3a6"} opacity={0.9} />
    <circle cx={1300} cy={420} r={110} fill="none" stroke={INK} strokeWidth={3} strokeOpacity={0.5} />
    {/* nubes que se mueven despacio */}
    {[
      [200, 300, 1],
      [900, 620, 0.8],
      [2100, 260, 1.2],
      [2900, 560, 0.9],
      [3700, 330, 1.1],
      [4500, 600, 0.8],
    ].map(([x, y, k], i) => {
      const dx = ((x + f * (0.4 + i * 0.07)) % 5200) - 600;
      return (
        <g key={i} transform={`translate(${dx} ${y}) scale(${k})`}>
          <Forma d="M -120 20 Q -130 -20 -80 -26 Q -60 -70 -10 -56 Q 30 -90 70 -50 Q 130 -54 126 0 Q 140 26 100 30 L -100 30 Q -126 30 -120 20 Z" color="#ffffff" w={4} desfase={[4, 3]} />
        </g>
      );
    })}
    {/* pájaros */}
    {Array.from({ length: 7 }, (_, i) => {
      const x = ((i * 610 + f * 2.2) % 4800) - 400;
      const y = 380 + ((i * 97) % 260) + Math.sin(f * 0.05 + i) * 12;
      const a = Math.sin(f * 0.4 + i * 2) * 10;
      return <Linea key={i} d={`M ${x - 18} ${y - a} Q ${x - 8} ${y - 8} ${x} ${y} Q ${x + 8} ${y - 8} ${x + 18} ${y - a}`} w={3.5} />;
    })}
  </g>
);

// ---------------------------------------------------------------- LEJOS (paralaje 0.5): ciudad pálida con gráficos
export const Lejos: React.FC<{ f: number }> = ({ f }) => (
  <g opacity={0.85}>
    {Array.from({ length: 34 }, (_, i) => {
      const x = -1200 + i * 230 + ((i * 53) % 90);
      const h = 380 + ((i * 137) % 420);
      const w = 150 + ((i * 71) % 90);
      const y = SUELO - 120 - h;
      const dolar = i % 7 === 3;
      const grafico = i % 9 === 5;
      return (
        <g key={i}>
          <Forma d={rect(x, y, w, h + 120)} color={i % 2 ? "#c6d3d8" : "#d3dbd8"} w={3.5} desfase={[5, 4]} />
          <Ventanas x={x + 20} y={y + 30} cols={Math.floor((w - 30) / 40)} filas={Math.floor(h / 70)} w={18} h={26} sx={40} sy={70} />
          {dolar && (
            <g>
              <circle cx={x + w / 2} cy={y + 70} r={42} fill="#e8e0b0" stroke={INK} strokeWidth={3.5} />
              <text x={x + w / 2} y={y + 88} textAnchor="middle" fontSize={54} fontFamily="Georgia, serif" fontWeight={900} fill="#3a4a2a">
                $
              </text>
            </g>
          )}
          {grafico && (
            <g transform={`translate(${x + 10} ${y - 160})`}>
              {[50, 80, 120].map((hb, k) => (
                <Forma key={k} d={rect(10 + k * 40, 140 - hb, 28, hb)} color={[C.azul, C.oro, C.salvia][k]} w={3} desfase={[3, 2]} />
              ))}
              <Linea d="M 0 120 L 50 90 L 90 100 L 150 20" w={5} color="#4f7a3a" />
              <Linea d="M 130 18 L 152 18 L 150 40" w={5} color="#4f7a3a" />
            </g>
          )}
        </g>
      );
    })}
    {/* dirigible con publicidad que cruza despacio */}
    <g transform={`translate(${((f * 1.2) % 6000) - 800} 520)`}>
      <Forma d="M -160 0 Q -150 -60 0 -62 Q 150 -60 170 0 Q 150 60 0 62 Q -150 60 -160 0 Z" color={C.beige} w={4} />
      <text x={0} y={14} textAnchor="middle" fontSize={40} fontFamily="Marca, sans-serif" fill={INK}>
        ¡COMPRA YA!
      </text>
      <Forma d={rect(-40, 62, 80, 26)} color={C.tan} w={3.5} />
    </g>
  </g>
);

// ---------------------------------------------------------------- piezas de calle
const Arbol: React.FC<{ x: number; y?: number; k?: number; f: number }> = ({ x, y = SUELO, k = 1, f }) => (
  <g transform={`translate(${x} ${y}) scale(${k}) rotate(${Math.sin(f * 0.04 + x) * 1.2})`}>
    <Forma d="M -10 0 L -8 -120 L 8 -120 L 10 0 Z" color={C.tan} w={4} />
    <Forma d="M -90 -150 Q -110 -230 -40 -250 Q -10 -320 60 -270 Q 120 -260 110 -190 Q 130 -120 60 -110 Q 0 -90 -50 -110 Q -110 -110 -90 -150 Z" color={C.salvia} w={4.5} sombra />
  </g>
);
const Farola: React.FC<{ x: number; y?: number; luz?: boolean }> = ({ x, y = SUELO, luz }) => (
  <g transform={`translate(${x} ${y})`}>
    <Linea d="M 0 0 L 0 -300 Q 0 -330 30 -330 L 50 -330" w={7} />
    <Forma d="M 30 -330 L 70 -330 L 64 -300 L 36 -300 Z" color={luz ? "#f6dc8a" : C.papel} w={4} />
    {luz && <circle cx={50} cy={-300} r={70} fill="#ffe7a0" opacity={0.25} />}
  </g>
);

/** Pantalla gigante de bolsa con el gráfico que se dibuja (sube o baja). */
const PantallaBolsa: React.FC<{ x: number; y: number; w: number; h: number; f: number; sentido: "sube" | "baja" }> = ({ x, y, w, h, f, sentido }) => {
  const n = 14;
  const prog = Math.min(1, ((f % 240) / 160));
  const pts = Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1);
    const base = sentido === "sube" ? 0.85 - t * 0.65 : 0.2 + t * 0.65;
    return [x + 20 + t * (w - 40), y + 30 + (base + Math.sin(i * 2.1) * 0.07) * (h - 50)];
  });
  const vis = pts.slice(0, Math.max(2, Math.ceil(prog * n)));
  const color = sentido === "sube" ? "#5f9a4a" : C.rojo;
  return (
    <g>
      <Forma d={rect(x, y, w, h)} color="#eef0e6" w={6} />
      {[0.25, 0.5, 0.75].map((k) => (
        <Linea key={k} d={`M ${x + 10} ${y + h * k} L ${x + w - 10} ${y + h * k}`} w={2} op={0.2} />
      ))}
      <Linea d={`M ${vis.map((p) => p.join(" ")).join(" L ")}`} w={9} color={color} />
      {[0.3, 0.55, 0.8].map((k, i) => (
        <Forma key={k} d={rect(x + w * k, y + h - 20 - (sentido === "sube" ? 30 + i * 30 : 90 - i * 30), 26, sentido === "sube" ? 30 + i * 30 : 90 - i * 30)} color={i === 1 ? C.oro : C.azul} w={3} desfase={[3, 2]} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- CIUDAD (paralaje 1): edificios y calle
export const Ciudad: React.FC<{ f: number; bolsa?: "sube" | "baja"; noche?: boolean }> = ({ f, bolsa = "sube", noche }) => {
  const luz = noche ? 0.6 : 0.08;
  return (
    <g>
      {/* ---- TU CASA: edificio de alquiler detrás, casita delante con buzón, árbol y valla */}
      <g>
        <Forma d={rect(250, 1080, 520, 920)} color="#d9c9a8" sombra={false} />
        <Ventanas x={290} y={1130} cols={5} filas={9} w={60} h={70} sx={95} sy={95} luz={luz + 0.15} semilla={2} />
        <Letrero x={330} y={1010} w={360} h={70} texto="SE ALQUILA" fondo={C.papel} tinta={C.rojo} letra="mano" giro={-3} />
        <Forma d="M 560 1700 L 820 1480 L 1080 1700 Z" color={C.terracota} w={5.5} sombra />
        <Forma d={rect(590, 1700, 460, 300)} color="#efe2c4" w={5.5} />
        <Forma d={rect(770, 1820, 90, 180)} color={C.azulOsc} w={5} />
        <circle cx={845} cy={1915} r={6} fill={C.oro} stroke={INK} strokeWidth={2.5} />
        <Ventanas x={630} y={1760} cols={1} filas={1} w={100} h={90} sx={0} sy={0} luz={noche ? 1 : 0} />
        <Ventanas x={910} y={1760} cols={1} filas={1} w={100} h={90} sx={0} sy={0} luz={noche ? 1 : 0} />
        <Letrero x={700} y={1600} w={240} h={60} texto="TU CASA" fondo={C.papel} letra="mano" />
        {/* buzón con facturas asomando */}
        <Forma d={rect(1120, 1880, 70, 60)} color={C.rojo} w={4} />
        <Linea d="M 1155 1940 L 1155 2000" w={6} />
        <Forma d={rect(1130, 1862, 44, 26)} color={C.papel} w={3} />
        <Arbol x={160} f={f} k={1.2} />
        {Array.from({ length: 9 }, (_, i) => (
          <Linea key={i} d={`M ${1210 + i * 30} ${SUELO} L ${1210 + i * 30} ${SUELO - 70}`} w={5} />
        ))}
        <Linea d={`M 1200 ${SUELO - 50} L 1460 ${SUELO - 50}`} w={5} />
      </g>
      <Farola x={1480} luz={noche} />

      {/* ---- BANCO: templo de columnas con frontón */}
      <g>
        <Forma d={rect(1560, 1180, 980, 820)} color={C.piedra} w={5} />
        <Forma d="M 1520 1240 L 2050 980 L 2580 1240 Z" color={C.piedra} w={6} sombra />
        <Forma d={rect(1520, 1240, 1060, 70)} color={C.piedraSombra} w={5} />
        <Letrero x={1830} y={1110} w={440} h={110} texto="BANCO" fondo={C.papel} tam={84} />
        {[0, 1, 2, 3, 4, 5].map((i) => {
          const x = 1620 + i * 170;
          return (
            <g key={i}>
              <Forma d={rect(x, 1330, 70, 560)} color="#ece6d6" w={4.5} />
              <Linea d={`M ${x + 22} 1340 L ${x + 22} 1880 M ${x + 46} 1340 L ${x + 46} 1880`} w={2} op={0.35} />
              <Forma d={rect(x - 12, 1310, 94, 26)} color={C.piedraSombra} w={4} />
            </g>
          );
        })}
        <path d={rect(1600, 1330, 900, 560)} fill="url(#rayc)" opacity={0.5} />
        <Forma d={rect(1960, 1620, 180, 270)} color="#6f5a44" w={5} />
        {[0, 1, 2].map((k) => (
          <Forma key={k} d={rect(1540 - k * 30, 1890 + k * 36, 1020 + k * 60, 36)} color={C.piedra} w={4.5} />
        ))}
        <Saco x={1500} y={SUELO} esc={0.8} color={C.oro} />
      </g>
      <Arbol x={2720} f={f} />

      {/* ---- BOLSA: torre de cristal con la pantalla y un rascacielos con el $ */}
      <g>
        <Forma d={rect(3720, 820, 380, 1180)} color="#c7d6dc" w={5} />
        <Ventanas x={3750} y={860} cols={4} filas={13} w={58} h={60} sx={88} sy={85} luz={luz} semilla={5} />
        <circle cx={3910} cy={760} r={70} fill="#eadfa8" stroke={INK} strokeWidth={5} />
        <text x={3910} y={790} textAnchor="middle" fontSize={88} fontFamily="Georgia, serif" fontWeight={900} fill="#3a4a2a">
          $
        </text>
        <Forma d={rect(2950, 900, 760, 1100)} color={C.cristal} w={6} />
        <path d={rect(2950, 900, 760, 1100)} fill="url(#ray)" opacity={0.25} />
        {Array.from({ length: 8 }, (_, i) => (
          <Linea key={i} d={`M ${2950 + i * 95} 900 L ${2950 + i * 95} 2000`} w={2.5} op={0.4} />
        ))}
        <Letrero x={3070} y={940} w={520} h={120} texto="BOLSA" fondo={C.papel} tam={92} />
        <PantallaBolsa x={3090} y={1150} w={480} h={300} f={f} sentido={bolsa} />
        <Forma d={rect(3200, 1760, 260, 240)} color="#8aa6b4" w={5} />
        <Linea d="M 3330 1760 L 3330 2000" w={4} />
      </g>
      <Farola x={4180} luz={noche} />

      {/* ---- MERCADO: puestos con toldo de rayas (MERCADO, INVERSIÓN, AHORRO) */}
      {[
        ["MERCADO", 4300, C.salvia],
        ["INVERSIÓN", 4700, C.oro],
        ["AHORRO", 5100, C.terracota],
      ].map(([t, x0, col], i) => {
        const x = x0 as number;
        return (
          <g key={i}>
            <Linea d={`M ${x - 150} ${SUELO} L ${x - 150} 1660 M ${x + 150} ${SUELO} L ${x + 150} 1660`} w={7} />
            <Forma d={`M ${x - 175} 1660 L ${x + 175} 1660 L ${x + 160} 1580 L ${x - 160} 1580 Z`} color={col as string} w={5} />
            {[0, 1, 2, 3, 4, 5, 6].map((k) => (
              <path key={k} d={`M ${x - 160 + k * 48} 1580 L ${x - 150 + k * 48} 1660 L ${x - 128 + k * 48} 1660 L ${x - 136 + k * 48} 1580 Z`} fill={C.papel} opacity={0.85} />
            ))}
            <Letrero x={x - 140} y={1480} w={280} h={80} texto={t as string} fondo={C.papel} tam={i === 1 ? 50 : 56} giro={i === 1 ? 2 : -2} />
            <Forma d={rect(x - 160, 1840, 320, 160)} color={C.tan} w={5} sombra />
            <Saco x={x - 80} y={1840} esc={0.6} color={i === 2 ? C.beige : C.salvia} />
            <Saco x={x + 50} y={1840} esc={0.75} color={C.oro} />
            {i === 1 && <Moneda x={x + 130} y={1820} r={18} giro={f * 6} />}
          </g>
        );
      })}
      <Arbol x={5330} f={f} k={0.9} />

      {/* ---- PUERTO: el río por detrás del muelle, con barcos y una grúa */}
      <g>
        <Forma d={rect(5450, 1620, 1300, 390)} color={C.agua} w={4} />
        {Array.from({ length: 10 }, (_, i) => {
          const x = 5480 + ((i * 140 + f * 3) % 1250);
          const y = 1680 + (i % 4) * 80;
          return <Linea key={i} d={`M ${x} ${y} q 20 -12 40 0 t 40 0`} w={3} color="#ffffff" op={0.8} />;
        })}
        {/* carguero que avanza despacio por el río */}
        <g transform={`translate(${5500 + ((f * 1.5) % 1300)} 1700)`}>
          <Forma d="M -170 0 L 170 0 L 140 60 L -150 60 Z" color={C.azulOsc} w={5} />
          {[-130, -60, 10, 80].map((x, k) => (
            <Forma key={x} d={rect(x, -50, 64, 50)} color={[C.terracota, C.oro, C.salvia, C.azul][k]} w={3.5} desfase={[3, 2]} />
          ))}
          <Forma d={rect(110, -90, 50, 90)} color={C.papel} w={4} />
        </g>
        {/* barca de COMERCIO amarrada */}
        <g transform="translate(6250 1930)">
          <Forma d="M -260 0 L 260 0 L 220 70 L -230 70 Z" color={C.tan} w={5} sombra />
          <Forma d={rect(-150, -150, 300, 150)} color={C.beige} w={5} />
          <text x={0} y={-50} textAnchor="middle" fontSize={64} fontFamily="Marca, sans-serif" fill={INK}>
            $ COMERCIO
          </text>
        </g>
        {/* grúa */}
        <g transform="translate(6640 2000)">
          <Linea d="M 0 0 L 0 -760 L -420 -760 M 0 -760 L 60 -760 M 0 -700 L -60 -760 M -340 -760 L -340 -560" w={8} />
          {Array.from({ length: 10 }, (_, i) => (
            <Linea key={i} d={`M 0 ${-i * 76} L 26 ${-(i + 1) * 76}`} w={3} op={0.6} />
          ))}
          <Forma d={rect(-390, -560, 100, 70)} color={C.terracota} w={4} />
        </g>
        <Forma d={rect(5440, SUELO - 20, 1320, 30)} color={C.piedraSombra} w={4} />
      </g>

      {/* ---- CAJEROS: edificio moderno con dos cajeros y la gente haciendo cola */}
      <g>
        <Forma d={rect(7000, 1320, 900, 680)} color="#d6dcd8" w={5} />
        <Ventanas x={7050} y={1360} cols={6} filas={3} w={110} h={80} sx={140} sy={110} luz={luz} semilla={9} />
        {[7180, 7560].map((x, i) => (
          <g key={x}>
            <Forma d={rect(x, 1720, 170, 280)} color={C.azul} w={5} />
            <Forma d={rect(x + 25, 1760, 120, 80)} color="#dfeee8" w={4} />
            <Forma d={rect(x + 35, 1870, 100, 14)} color={INK} w={3} />
            <Letrero x={x + 10} y={1660} w={150} h={50} texto="CAJERO" fondo={C.papel} tam={34} />
            <text x={x + 85} y={1812} textAnchor="middle" fontSize={26} fontFamily="MarcaLimpia, sans-serif" fill={INK}>
              {i === 0 ? "0,00 €" : "SIN SALDO"}
            </text>
          </g>
        ))}
      </g>
      {/* furgón blindado */}
      <g transform="translate(8000 2000)">
        <Forma d="M -200 -30 L -200 -220 L 110 -220 L 170 -140 L 200 -140 L 200 -30 Z" color="#dcdcd4" w={5.5} />
        <Forma d={rect(120, -200, 60, 56)} color={C.cristal} w={4} />
        <circle cx={-110} cy={-30} r={40} fill="#3a3a3e" stroke={INK} strokeWidth={5} />
        <circle cx={120} cy={-30} r={40} fill="#3a3a3e" stroke={INK} strokeWidth={5} />
        <Forma d="M -40 -170 L 0 -190 L 40 -170 L 40 -120 Q 0 -90 -40 -120 Z" color={C.azul} w={4} />
      </g>

      {/* ---- GOBIERNO / BANCO CENTRAL: cúpula, bandera y la imprenta de billetes */}
      <g>
        <Forma d={rect(8300, 1300, 900, 700)} color="#e6dcc4" w={5.5} />
        <Forma d="M 8520 1300 Q 8520 1020 8750 1000 Q 8980 1020 8980 1300 Z" color={C.salvia} w={5.5} sombra />
        <Linea d="M 8750 1000 L 8750 860" w={6} />
        <path d={`M 8752 860 Q ${8810 + Math.sin(f * 0.2) * 10} ${880} 8870 ${870 + Math.sin(f * 0.2 + 1) * 8} L 8870 ${930 + Math.sin(f * 0.2 + 1) * 8} Q 8810 940 8752 920 Z`} fill={C.rojo} stroke={INK} strokeWidth={4} />
        <Letrero x={8470} y={1320} w={560} h={100} texto="BANCO CENTRAL" fondo={C.papel} tam={70} />
        {[0, 1, 2, 3, 4].map((i) => (
          <Forma key={i} d={rect(8380 + i * 180, 1460, 60, 460)} color="#f2ecdc" w={4} />
        ))}
        <path d={rect(8340, 1440, 820, 480)} fill="url(#rayc)" opacity={0.4} />
        {/* imprenta: billetes que salen sin parar */}
        <Forma d={rect(9250, 1700, 260, 300)} color={C.gris} w={5} />
        <Letrero x={9250} y={1630} w={260} h={60} texto="IMPRENTA" fondo={C.papel} tam={40} />
        {Array.from({ length: 5 }, (_, i) => {
          const k = ((f * 0.02 + i / 5) % 1);
          return <Billete key={i} x={9380 + k * 160} y={1700 - k * 420 + Math.sin(k * 9) * 30} giro={k * 300} esc={0.5} />;
        })}
      </g>

      {/* ---- el paseo (por donde caminan los personajes) */}
      <Forma d={rect(-1000, SUELO, ANCHO_MUNDO + 2000, 700)} color="#ece3cc" w={5} desfase={[0, 0]} />
      <rect x={-1000} y={SUELO} width={ANCHO_MUNDO + 2000} height={700} fill="url(#adoquin)" />
      <Linea d={`M -1000 ${SUELO + 6} L ${ANCHO_MUNDO + 1000} ${SUELO + 6}`} w={7} />
      {/* monedas tiradas que brillan (pistas de dinero por el camino) */}
      {[1350, 2900, 4150, 5600, 6900, 8250].map((x, i) => (
        <Moneda key={x} x={x} y={SUELO + 230 + (i % 2) * 50} r={16} giro={f * 4 + i * 40} />
      ))}
    </g>
  );
};

// ---------------------------------------------------------------- DELANTE (paralaje 1.3): matas, piedras, farolas
export const Delante: React.FC<{ f: number }> = ({ f }) => (
  <g>
    {Array.from({ length: 30 }, (_, i) => {
      const x = -600 + i * 380 + ((i * 97) % 160);
      const y = SUELO + 560;
      const sway = Math.sin(f * 0.06 + i) * 4;
      return (
        <g key={i}>
          {i % 3 === 0 ? (
            <Forma d={`M ${x - 50} ${y} Q ${x - 40} ${y - 50} ${x} ${y - 46} Q ${x + 50} ${y - 50} ${x + 56} ${y} Z`} color={C.gris} w={4} />
          ) : (
            <Linea d={`M ${x} ${y} Q ${x - 10 + sway} ${y - 60} ${x - 26 + sway} ${y - 90} M ${x + 8} ${y} Q ${x + 10 + sway} ${y - 70} ${x + 24 + sway} ${y - 100} M ${x + 16} ${y} Q ${x + 30 + sway} ${y - 40} ${x + 50 + sway} ${y - 60}`} w={4.5} color="#4f5e3e" />
          )}
        </g>
      );
    })}
  </g>
);
