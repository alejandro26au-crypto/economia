// Texturas pintadas con código para el vídeo de las olas monstruo (idea 7): pizarra con ecuaciones, tablón de
// barcos perdidos, pantalla del láser con el pico de 25,6 m, papel del registrador, la Tierra vista desde el
// satélite, letrero de neón del bar, foto de la ola y planchas de acero de la plataforma.
import * as THREE from "three";
import { azar } from "./azar";

const cache = new Map<string, THREE.CanvasTexture>();
const R = (k: string, ...n: (string | number)[]) => azar(71, k, ...n);

function lienzo(clave: string, w: number, h: number, pinta: (x: CanvasRenderingContext2D) => void, rep: [number, number] = [1, 1]) {
  const k = `${clave}|${rep.join("x")}`;
  const ya = cache.get(k);
  if (ya) return ya;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const x = c.getContext("2d")!;
  pinta(x);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(rep[0], rep[1]);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  cache.set(k, t);
  return t;
}

const tiza = (x: CanvasRenderingContext2D, txt: string, px: number, py: number, tam: number, color = "#f2efe4") => {
  x.fillStyle = color;
  x.font = `bold ${tam}px Georgia, serif`;
  x.fillText(txt, px, py);
};

/** Pizarra de 1900: ecuaciones de olas, la curva de campana «normal» y «IMPOSSIBLE» subrayado. */
export function texPizarraOlas() {
  return lienzo("pizarra-olas", 2048, 1024, (x) => {
    x.fillStyle = "#1c2a22";
    x.fillRect(0, 0, 2048, 1024);
    for (let i = 0; i < 60; i++) {
      x.fillStyle = `rgba(255,255,255,${R("pz", i) * 0.05})`;
      x.beginPath();
      x.arc(R("pzx", i) * 2048, R("pzy", i) * 1024, 40 + R("pzr", i) * 140, 0, 7);
      x.fill();
    }
    tiza(x, "η(x,t) = a cos(kx − ωt)", 90, 150, 74);
    tiza(x, "ω² = g k tanh(kh)", 90, 270, 70);
    tiza(x, "Hs = 4 √m₀", 90, 390, 70);
    tiza(x, "P(H > 2Hs) ≈ e^(−8)", 90, 510, 70);
    tiza(x, "= once in 10,000 years", 140, 610, 56, "#ffe08a");
    // curva de campana con la cola casi a cero
    x.strokeStyle = "#f2efe4";
    x.lineWidth = 8;
    x.beginPath();
    x.moveTo(1150, 640);
    x.lineTo(1950, 640);
    x.moveTo(1180, 660);
    x.lineTo(1180, 160);
    x.stroke();
    x.beginPath();
    for (let i = 0; i <= 100; i++) {
      const u = i / 100;
      const px = 1190 + u * 740;
      const py = 630 - Math.exp(-Math.pow((u - 0.3) / 0.13, 2)) * 420;
      if (i === 0) x.moveTo(px, py);
      else x.lineTo(px, py);
    }
    x.stroke();
    x.strokeStyle = "#ff8a6b";
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(1800, 650);
    x.lineTo(1800, 420);
    x.stroke();
    tiza(x, "25 m?", 1730, 400, 60, "#ff8a6b");
    tiza(x, "wave height", 1500, 720, 48);
    // IMPOSSIBLE subrayado dos veces
    x.save();
    x.translate(1060, 880);
    x.rotate(-0.05);
    tiza(x, "IMPOSSIBLE", 0, 0, 150, "#ffffff");
    x.strokeStyle = "#ffffff";
    x.lineWidth = 10;
    x.beginPath();
    x.moveTo(0, 30);
    x.lineTo(900, 30);
    x.moveTo(20, 56);
    x.lineTo(880, 56);
    x.stroke();
    x.restore();
    x.strokeStyle = "#5a3a1e";
    x.lineWidth = 50;
    x.strokeRect(0, 0, 2048, 1024);
  });
}

/** Tablón de barcos perdidos: nombres, fechas y «CAUSE: STORM» en todas las filas. */
export function texTablonPerdidos() {
  return lienzo("tablon-perdidos", 1024, 1280, (x) => {
    x.fillStyle = "#e8dcc0";
    x.fillRect(0, 0, 1024, 1280);
    x.fillStyle = "#1a1a22";
    x.font = "bold 92px Georgia, serif";
    x.textAlign = "center";
    x.fillText("LOST AT SEA", 512, 120);
    x.fillRect(80, 150, 864, 8);
    const barcos = ["MV DERBYSHIRE", "SS NORTHERN STAR", "MS MUNCHEN", "SS ADMIRAL", "MV BERGE ISTRA", "SS GRAND ROSE", "MV PACIFIC GLORY", "SS EASTWIND"];
    x.textAlign = "left";
    barcos.forEach((b, i) => {
      const y = 250 + i * 128;
      x.fillStyle = "#1a1a22";
      x.font = "bold 46px monospace";
      x.fillText(b, 70, y);
      x.font = "36px monospace";
      x.fillStyle = "#4a4a52";
      x.fillText(`19${60 + i * 4}  CREW ${20 + ((i * 7) % 30)}`, 70, y + 46);
      x.fillStyle = "#b3202f";
      x.font = "bold 42px monospace";
      x.fillText("CAUSE: STORM", 610, y + 22);
    });
    x.strokeStyle = "#3a2a1a";
    x.lineWidth = 30;
    x.strokeRect(0, 0, 1024, 1280);
  });
}

/** Carpeta del expediente con el sello rojo «CASE CLOSED». */
export function texCarpeta() {
  return lienzo("carpeta", 768, 1024, (x) => {
    x.fillStyle = "#d8b878";
    x.fillRect(0, 0, 768, 1024);
    x.fillStyle = "#f4ecd8";
    x.fillRect(60, 80, 640, 860);
    x.fillStyle = "#2a2a30";
    x.font = "bold 54px monospace";
    x.fillText("MARINE INQUIRY", 110, 180);
    x.font = "34px monospace";
    for (let i = 0; i < 12; i++) {
      x.fillStyle = "#8a8a92";
      x.fillRect(110, 240 + i * 46, 360 + ((i * 97) % 180), 12);
    }
    x.save();
    x.translate(384, 820);
    x.rotate(-0.22);
    x.strokeStyle = "#c0202a";
    x.lineWidth = 12;
    x.strokeRect(-300, -80, 600, 160);
    x.fillStyle = "#c0202a";
    x.font = "bold 92px sans-serif";
    x.textAlign = "center";
    x.fillText("CASE CLOSED", 0, 32);
    x.restore();
  });
}

/** Pantalla del registro del láser (verde fósforo): olas normales y el pico enorme de 25,6 m. */
export function texPantallaOla() {
  return lienzo("pantalla-ola", 1024, 640, (x) => {
    x.fillStyle = "#04140a";
    x.fillRect(0, 0, 1024, 640);
    x.strokeStyle = "rgba(60,255,140,0.15)";
    x.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      x.beginPath();
      x.moveTo(0, i * 56);
      x.lineTo(1024, i * 56);
      x.stroke();
      x.beginPath();
      x.moveTo(i * 92, 0);
      x.lineTo(i * 92, 640);
      x.stroke();
    }
    x.fillStyle = "#6dff9e";
    x.font = "bold 34px monospace";
    x.fillText("DRAUPNER E   01-01-1995   15:20", 24, 46);
    x.font = "28px monospace";
    x.fillText("SURFACE ELEVATION (m)", 24, 600);
    x.strokeStyle = "#6dff9e";
    x.lineWidth = 5;
    x.shadowColor = "#3dff7a";
    x.shadowBlur = 14;
    x.beginPath();
    for (let i = 0; i <= 400; i++) {
      const u = i / 400;
      const pico = Math.exp(-Math.pow((u - 0.62) / 0.012, 2));
      const y = 420 - (Math.sin(u * 70) * 0.5 + Math.sin(u * 43 + 1) * 0.35) * 46 - pico * 300;
      const px = 20 + u * 984;
      if (i === 0) x.moveTo(px, y);
      else x.lineTo(px, y);
    }
    x.stroke();
    x.shadowBlur = 0;
    x.fillStyle = "#ff5a4a";
    x.font = "bold 44px monospace";
    x.fillText("25.6 m !!", 670, 120);
  });
}

/** Pantalla con texto simple (monitores de la sala de control). */
export function texMonitor(lineas: string[], color = "#6dff9e") {
  return lienzo(`monitor${lineas.join("|")}${color}`, 512, 384, (x) => {
    x.fillStyle = "#04120c";
    x.fillRect(0, 0, 512, 384);
    x.fillStyle = color;
    x.font = "bold 30px monospace";
    lineas.forEach((l, i) => x.fillText(l, 22, 50 + i * 42));
  });
}

/** Papel del registrador de olas (rollo con la línea en tinta y el pico). */
export function texPapelRegistro() {
  return lienzo("papel-registro", 512, 1024, (x) => {
    x.fillStyle = "#f2eee0";
    x.fillRect(0, 0, 512, 1024);
    x.strokeStyle = "rgba(200,60,60,0.25)";
    x.lineWidth = 2;
    for (let i = 0; i < 20; i++) {
      x.beginPath();
      x.moveTo(i * 26, 0);
      x.lineTo(i * 26, 1024);
      x.stroke();
    }
    x.strokeStyle = "#1a2a8a";
    x.lineWidth = 4;
    x.beginPath();
    for (let i = 0; i <= 300; i++) {
      const u = i / 300;
      const pico = Math.exp(-Math.pow((u - 0.5) / 0.015, 2));
      const px = 200 + (Math.sin(u * 60) * 0.5 + Math.sin(u * 37) * 0.4) * 40 + pico * 260;
      if (i === 0) x.moveTo(px, u * 1024);
      else x.lineTo(px, u * 1024);
    }
    x.stroke();
  });
}

/** Planchas de acero de la plataforma (rejilla, remaches y óxido). */
export function texAcero(base: string, rep: [number, number] = [1, 1]) {
  return lienzo(`acero${base}`, 512, 512, (x) => {
    x.fillStyle = base;
    x.fillRect(0, 0, 512, 512);
    x.strokeStyle = "rgba(0,0,0,0.35)";
    x.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      x.beginPath();
      x.moveTo(i * 128, 0);
      x.lineTo(i * 128, 512);
      x.moveTo(0, i * 128);
      x.lineTo(512, i * 128);
      x.stroke();
    }
    // rejilla en diagonal
    x.strokeStyle = "rgba(255,255,255,0.08)";
    x.lineWidth = 3;
    for (let i = -512; i < 512; i += 18) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i + 512, 512);
      x.stroke();
    }
    for (let i = 0; i < 70; i++) {
      x.fillStyle = `rgba(${120 + R("ox", i) * 60},${50 + R("oy", i) * 30},20,${0.08 + R("oa", i) * 0.18})`;
      x.beginPath();
      x.arc(R("oxx", i) * 512, R("oyy", i) * 512, 6 + R("or", i) * 40, 0, 7);
      x.fill();
    }
  }, rep);
}

/** La Tierra vista desde la órbita: océanos, continentes, nubes y 10 puntos rojos (las olas gigantes). */
export function texTierra() {
  return lienzo("tierra", 2048, 1024, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 1024);
    g.addColorStop(0, "#d8e8f4");
    g.addColorStop(0.12, "#1a4e8a");
    g.addColorStop(0.5, "#1a5aa0");
    g.addColorStop(0.88, "#1a4e8a");
    g.addColorStop(1, "#e8f0f8");
    x.fillStyle = g;
    x.fillRect(0, 0, 2048, 1024);
    // continentes: manchas orgánicas
    const tierras: [number, number, number, number][] = [
      [430, 300, 220, 150], [520, 600, 120, 220], [1060, 280, 160, 120], [1080, 560, 150, 230], [1420, 300, 330, 150], [1650, 680, 140, 90], [300, 180, 120, 60],
    ];
    tierras.forEach(([cx, cy, rx, ry], k) => {
      for (let i = 0; i < 140; i++) {
        x.fillStyle = i % 6 === 0 ? "#c8a868" : i % 4 === 1 ? "#8a7a48" : i % 2 ? "#3e6e34" : "#5a8a44";
        x.beginPath();
        x.ellipse(cx + (R("tx", k, i) - 0.5) * rx * 1.6, cy + (R("ty", k, i) - 0.5) * ry * 1.6, rx * (0.08 + R("tr", k, i) * 0.25), ry * (0.08 + R("tq", k, i) * 0.25), R("ta", k, i) * 3, 0, 7);
        x.fill();
      }
      // costa con aguas poco profundas más claras
      x.strokeStyle = "rgba(120,200,230,0.25)";
      x.lineWidth = 10;
      x.beginPath();
      x.ellipse(cx, cy, rx * 0.95, ry * 0.95, 0, 0, 7);
      x.stroke();
    });
    // nubes en remolino
    for (let i = 0; i < 160; i++) {
      x.fillStyle = `rgba(255,255,255,${0.12 + R("nb", i) * 0.35})`;
      x.beginPath();
      x.ellipse(R("nx", i) * 2048, 80 + R("ny", i) * 860, 30 + R("nr", i) * 120, 8 + R("nq", i) * 26, (R("na", i) - 0.5) * 0.6, 0, 7);
      x.fill();
    }
  });
}

/** Letrero de neón del bar. */
export function texNeon(texto: string, color: string) {
  return lienzo(`neon${texto}${color}`, 1024, 256, (x) => {
    x.clearRect(0, 0, 1024, 256);
    x.font = "bold italic 130px Georgia, serif";
    x.textAlign = "center";
    x.textBaseline = "middle";
    x.shadowColor = color;
    for (const b of [40, 20, 6]) {
      x.shadowBlur = b;
      x.fillStyle = b === 6 ? "#ffffff" : color;
      x.fillText(texto, 512, 130);
    }
  });
}

/** Foto enmarcada de una ola gigante contra un barco (en la pared del bar). */
export function texFotoOla() {
  return lienzo("foto-ola", 640, 480, (x) => {
    x.fillStyle = "#e8e4d8";
    x.fillRect(0, 0, 640, 480);
    const g = x.createLinearGradient(0, 30, 0, 450);
    g.addColorStop(0, "#5a6470");
    g.addColorStop(1, "#1a2028");
    x.fillStyle = g;
    x.fillRect(30, 30, 580, 420);
    x.fillStyle = "#24343e";
    x.beginPath();
    x.moveTo(30, 450);
    x.lineTo(30, 330);
    x.quadraticCurveTo(300, 300, 420, 80);
    x.quadraticCurveTo(520, 120, 560, 210);
    x.quadraticCurveTo(600, 330, 610, 450);
    x.fill();
    x.fillStyle = "rgba(240,248,255,0.85)";
    for (let i = 0; i < 40; i++) {
      x.beginPath();
      x.arc(400 + R("fx", i) * 160, 80 + R("fy", i) * 120, 4 + R("fr", i) * 14, 0, 7);
      x.fill();
    }
    x.fillStyle = "#0a0a0c";
    x.fillRect(150, 400, 120, 18);
    x.fillRect(200, 370, 14, 30);
  });
}

/** Tiras de cartas náuticas/mapa del mar del Norte para la sala de control. */
export function texCartaNorte() {
  return lienzo("carta-norte", 1024, 768, (x) => {
    x.fillStyle = "#cfe0e8";
    x.fillRect(0, 0, 1024, 768);
    x.fillStyle = "#d8c898";
    x.beginPath();
    x.moveTo(620, 0);
    x.quadraticCurveTo(700, 200, 760, 300);
    x.quadraticCurveTo(820, 420, 1024, 460);
    x.lineTo(1024, 0);
    x.fill();
    x.beginPath();
    x.moveTo(0, 220);
    x.quadraticCurveTo(160, 340, 140, 768);
    x.lineTo(0, 768);
    x.fill();
    x.strokeStyle = "rgba(30,60,120,0.3)";
    for (let i = 0; i < 9; i++) {
      x.beginPath();
      x.moveTo(0, i * 90);
      x.lineTo(1024, i * 90);
      x.stroke();
    }
    x.fillStyle = "#c0202a";
    x.beginPath();
    x.arc(560, 420, 14, 0, 7);
    x.fill();
    x.fillStyle = "#1a1a22";
    x.font = "bold 40px sans-serif";
    x.fillText("DRAUPNER", 590, 430);
    x.font = "bold 56px Georgia, serif";
    x.fillText("NORTH SEA", 300, 300);
    x.font = "bold 40px sans-serif";
    x.fillText("NORWAY", 820, 200);
  });
}
