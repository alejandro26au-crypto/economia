// Texturas "pintadas a mano" hechas con código (canvas): piedra con mortero, losas, tablones de madera, alfombra
// persa, mosaico, pergamino con mapa. Llevan línea de tinta para que encajen con el acabado ilustrado.
import * as THREE from "three";
import { azar } from "./azar";

const cache = new Map<string, THREE.CanvasTexture>();
const R = (k: string, ...n: (string | number)[]) => azar(77, k, ...n);
const TINTA = "rgba(18,14,28,";

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

const hsl = (h: number, s: number, l: number) => `hsl(${h},${s}%,${l}%)`;

/** Muro de sillares: hileras desplazadas, cada piedra con su tono, mortero oscuro, brillo arriba y desconchones. */
export function texPiedra(tono: number, sat: number, luz: number, filas = 8, cols = 4, rep: [number, number] = [1, 1]) {
  return lienzo(`piedra${tono}-${sat}-${luz}-${filas}-${cols}`, 1024, 1024, (x) => {
    x.fillStyle = hsl(tono, sat * 0.6, luz * 0.45);
    x.fillRect(0, 0, 1024, 1024);
    const h = 1024 / filas;
    for (let f = 0; f < filas; f++) {
      const w = 1024 / cols;
      const off = f % 2 ? w / 2 : 0;
      for (let c = -1; c <= cols; c++) {
        const x0 = c * w + off + 6, y0 = f * h + 6, ww = w - 12, hh = h - 12;
        const l = luz + (R("pl", f, c) - 0.5) * 14;
        x.fillStyle = hsl(tono + (R("pt", f, c) - 0.5) * 10, sat, l);
        x.beginPath();
        x.roundRect(x0, y0, ww, hh, 10);
        x.fill();
        // luz arriba, sombra abajo
        x.fillStyle = "rgba(255,255,255,0.10)";
        x.fillRect(x0 + 6, y0 + 4, ww - 12, hh * 0.18);
        x.fillStyle = "rgba(0,0,0,0.16)";
        x.fillRect(x0 + 4, y0 + hh * 0.78, ww - 8, hh * 0.2);
        // motas
        for (let i = 0; i < 18; i++) {
          x.fillStyle = `rgba(0,0,0,${0.05 + R("m", f, c, i) * 0.08})`;
          x.beginPath();
          x.arc(x0 + R("mx", f, c, i) * ww, y0 + R("my", f, c, i) * hh, 2 + R("mr", f, c, i) * 6, 0, 7);
          x.fill();
        }
        // grieta ocasional
        if (R("g", f, c) > 0.78) {
          x.strokeStyle = TINTA + "0.55)";
          x.lineWidth = 3;
          x.beginPath();
          let px = x0 + ww * (0.2 + R("gx", f, c) * 0.6), py = y0 + 4;
          x.moveTo(px, py);
          for (let i = 0; i < 4; i++) {
            px += (R("gd", f, c, i) - 0.5) * 30;
            py += hh / 4;
            x.lineTo(px, py);
          }
          x.stroke();
        }
        x.strokeStyle = TINTA + "0.85)";
        x.lineWidth = 5;
        x.beginPath();
        x.roundRect(x0, y0, ww, hh, 10);
        x.stroke();
      }
    }
  }, rep);
}

/** Suelo de losas grandes e irregulares. */
export function texLosas(tono: number, sat: number, luz: number, rep: [number, number] = [1, 1]) {
  return lienzo(`losas${tono}-${sat}-${luz}`, 1024, 1024, (x) => {
    x.fillStyle = hsl(tono, sat * 0.6, luz * 0.5);
    x.fillRect(0, 0, 1024, 1024);
    const n = 4;
    const t = 1024 / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const partir = R("lp", i, j) > 0.6;
        const piezas: [number, number, number, number][] = partir ? [[i * t, j * t, t / 2, t], [i * t + t / 2, j * t, t / 2, t]] : [[i * t, j * t, t, t]];
        piezas.forEach(([x0, y0, w, h], k) => {
          x.fillStyle = hsl(tono + (R("lt", i, j, k) - 0.5) * 8, sat, luz + (R("ll", i, j, k) - 0.5) * 12);
          x.beginPath();
          x.roundRect(x0 + 5, y0 + 5, w - 10, h - 10, 8);
          x.fill();
          for (let m = 0; m < 25; m++) {
            x.fillStyle = `rgba(${R("c", i, j, m) > 0.5 ? "255,255,255" : "0,0,0"},${0.04 + R("a", i, j, m) * 0.05})`;
            x.beginPath();
            x.arc(x0 + R("x", i, j, k, m) * w, y0 + R("y", i, j, k, m) * h, 3 + R("r", i, j, m) * 10, 0, 7);
            x.fill();
          }
          x.strokeStyle = TINTA + "0.8)";
          x.lineWidth = 6;
          x.beginPath();
          x.roundRect(x0 + 5, y0 + 5, w - 10, h - 10, 8);
          x.stroke();
        });
      }
  }, rep);
}

/** Tablones de madera con veta, nudos, juntas oscuras y clavos. */
export function texMadera(tono: number, sat: number, luz: number, tablas = 6, rep: [number, number] = [1, 1]) {
  return lienzo(`madera${tono}-${sat}-${luz}-${tablas}`, 1024, 1024, (x) => {
    const h = 1024 / tablas;
    for (let i = 0; i < tablas; i++) {
      const y0 = i * h;
      const l = luz + (R("ml", i) - 0.5) * 10;
      x.fillStyle = hsl(tono + (R("mt", i) - 0.5) * 6, sat, l);
      x.fillRect(0, y0, 1024, h);
      // veta
      for (let v = 0; v < 9; v++) {
        x.strokeStyle = `rgba(40,20,8,${0.12 + R("va", i, v) * 0.15})`;
        x.lineWidth = 2 + R("vw", i, v) * 3;
        x.beginPath();
        const yb = y0 + (v + 0.5) * (h / 9);
        x.moveTo(0, yb);
        for (let s = 0; s <= 16; s++) x.lineTo(s * 64, yb + Math.sin(s * 0.9 + i * 3 + v) * 4 * R("vs", i, v));
        x.stroke();
      }
      // nudos
      if (R("n", i) > 0.4) {
        const nx = R("nx", i) * 1024, ny = y0 + h * (0.3 + R("ny", i) * 0.4);
        x.strokeStyle = "rgba(50,24,8,0.5)";
        x.lineWidth = 3;
        for (let r = 1; r <= 3; r++) {
          x.beginPath();
          x.ellipse(nx, ny, 10 * r, 5 * r, 0, 0, 7);
          x.stroke();
        }
      }
      // brillo arriba de cada tablón
      x.fillStyle = "rgba(255,230,190,0.08)";
      x.fillRect(0, y0 + 3, 1024, h * 0.15);
      // junta y testas
      x.fillStyle = TINTA + "0.85)";
      x.fillRect(0, y0, 1024, 5);
      const corte = R("tc", i) * 1024;
      x.fillRect(corte, y0, 5, h);
      x.fillStyle = "rgba(30,24,20,0.8)";
      [corte - 18, corte + 22].forEach((cx) => {
        x.beginPath();
        x.arc(cx, y0 + h * 0.3, 4, 0, 7);
        x.arc(cx, y0 + h * 0.7, 4, 0, 7);
        x.fill();
      });
    }
  }, rep);
}

/** Alfombra persa: borde con franjas, campo con rombos y medallón central. */
export function texAlfombra(a: string, b: string, c: string) {
  return lienzo(`alf${a}${b}${c}`, 1024, 1024, (x) => {
    x.fillStyle = a;
    x.fillRect(0, 0, 1024, 1024);
    const banda = (m: number, w: number, col: string) => {
      x.strokeStyle = col;
      x.lineWidth = w;
      x.strokeRect(m, m, 1024 - m * 2, 1024 - m * 2);
    };
    banda(30, 40, b);
    banda(80, 14, c);
    banda(110, 26, b);
    // rombos en el campo
    x.fillStyle = b;
    for (let i = 0; i < 8; i++)
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2) continue;
        const cx = 170 + i * 98, cy = 170 + j * 98;
        x.beginPath();
        x.moveTo(cx, cy - 22);
        x.lineTo(cx + 16, cy);
        x.lineTo(cx, cy + 22);
        x.lineTo(cx - 16, cy);
        x.fill();
      }
    // medallón
    x.fillStyle = c;
    x.beginPath();
    x.ellipse(512, 512, 230, 170, 0, 0, 7);
    x.fill();
    x.fillStyle = b;
    x.beginPath();
    x.ellipse(512, 512, 170, 120, 0, 0, 7);
    x.fill();
    x.fillStyle = a;
    for (let k = 0; k < 8; k++) {
      const an = (k / 8) * Math.PI * 2;
      x.beginPath();
      x.ellipse(512 + Math.cos(an) * 95, 512 + Math.sin(an) * 65, 26, 16, an, 0, 7);
      x.fill();
    }
    x.fillStyle = c;
    x.beginPath();
    x.arc(512, 512, 40, 0, 7);
    x.fill();
    // flecos (manchas de uso)
    for (let i = 0; i < 60; i++) {
      x.fillStyle = `rgba(0,0,0,${R("u", i) * 0.06})`;
      x.beginPath();
      x.arc(R("ux", i) * 1024, R("uy", i) * 1024, 20 + R("ur", i) * 60, 0, 7);
      x.fill();
    }
  });
}

/** Mosaico antiguo (azules y oro) con greca. */
export function texMosaico(rep: [number, number] = [1, 1]) {
  return lienzo("mosaico", 1024, 1024, (x) => {
    const n = 20;
    const t = 1024 / n;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const borde = i < 3 || j < 3 || i > n - 4 || j > n - 4;
        const ola = Math.abs(Math.sin((i + j) * 0.5) * Math.cos((i - j) * 0.35)) > 0.7;
        const base = borde ? (((i + j) % 4 < 2) ? [42, 75, 55] : [205, 60, 30]) : ola ? [190, 55, 45] : [205, 45, 72];
        x.fillStyle = hsl(base[0] + (R("mt", i, j) - 0.5) * 12, base[1], base[2] + (R("ml", i, j) - 0.5) * 12);
        x.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
      }
    x.strokeStyle = TINTA + "0.5)";
    x.lineWidth = 3;
    for (let i = 0; i <= n; i++) {
      x.beginPath();
      x.moveTo(i * t, 0);
      x.lineTo(i * t, 1024);
      x.moveTo(0, i * t);
      x.lineTo(1024, i * t);
      x.stroke();
    }
  }, rep);
}

/** Pergamino con un mapa (costas, rosa de los vientos, ruta punteada y una X). */
export function texMapa() {
  return lienzo("mapa", 1024, 768, (x) => {
    const g = x.createRadialGradient(512, 384, 100, 512, 384, 600);
    g.addColorStop(0, "#f1deb0");
    g.addColorStop(1, "#b98f55");
    x.fillStyle = g;
    x.fillRect(0, 0, 1024, 768);
    x.strokeStyle = "rgba(70,40,15,0.85)";
    x.lineWidth = 6;
    x.fillStyle = "#d9b77a";
    [
      [250, 260, 170, 120],
      [720, 480, 210, 150],
      [640, 180, 90, 60],
    ].forEach(([cx, cy, rx, ry], k) => {
      x.beginPath();
      for (let i = 0; i <= 40; i++) {
        const a = (i / 40) * Math.PI * 2;
        const r = 1 + 0.22 * Math.sin(a * 5 + k) + 0.1 * Math.sin(a * 11 + k * 2);
        const px = cx + Math.cos(a) * rx * r, py = cy + Math.sin(a) * ry * r;
        if (i) x.lineTo(px, py);
        else x.moveTo(px, py);
      }
      x.fill();
      x.stroke();
    });
    x.setLineDash([14, 12]);
    x.strokeStyle = "rgba(150,30,20,0.9)";
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(330, 330);
    x.bezierCurveTo(450, 520, 560, 300, 700, 470);
    x.stroke();
    x.setLineDash([]);
    x.lineWidth = 10;
    x.beginPath();
    x.moveTo(680, 450);
    x.lineTo(720, 490);
    x.moveTo(720, 450);
    x.lineTo(680, 490);
    x.stroke();
    // rosa de los vientos
    x.translate(860, 160);
    x.fillStyle = "rgba(70,40,15,0.9)";
    for (let k = 0; k < 8; k++) {
      x.rotate(Math.PI / 4);
      x.beginPath();
      x.moveTo(0, 0);
      x.lineTo(10, 0);
      x.lineTo(0, k % 2 ? 50 : 90);
      x.lineTo(-10, 0);
      x.fill();
    }
    x.setTransform(1, 0, 0, 1, 0, 0);
    x.strokeStyle = "rgba(70,40,15,0.6)";
    x.lineWidth = 8;
    x.strokeRect(14, 14, 996, 740);
  });
}

/** Bandera / estandarte con un ancla dorada. */
export function texEstandarte(fondo: string, oro: string) {
  return lienzo(`est${fondo}${oro}`, 256, 512, (x) => {
    x.fillStyle = fondo;
    x.fillRect(0, 0, 256, 512);
    x.fillStyle = "rgba(0,0,0,0.18)";
    for (let i = 0; i < 6; i++) x.fillRect(i * 46 + 18, 0, 14, 512);
    x.strokeStyle = oro;
    x.lineWidth = 12;
    x.strokeRect(16, 16, 224, 480);
    // ancla
    x.lineWidth = 18;
    x.lineCap = "round";
    x.beginPath();
    x.arc(128, 150, 22, 0, 7);
    x.moveTo(128, 172);
    x.lineTo(128, 380);
    x.moveTo(80, 220);
    x.lineTo(176, 220);
    x.moveTo(60, 320);
    x.quadraticCurveTo(80, 400, 128, 400);
    x.quadraticCurveTo(176, 400, 196, 320);
    x.stroke();
  });
}

// ---------------------------------------------------------------- texturas del vídeo del seguro pirata
const pergamino = (x: CanvasRenderingContext2D, w: number, h: number) => {
  const g = x.createRadialGradient(w / 2, h / 2, 60, w / 2, h / 2, Math.max(w, h) * 0.7);
  g.addColorStop(0, "#f3e2b8");
  g.addColorStop(1, "#b8915a");
  x.fillStyle = g;
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 40; i++) {
    x.fillStyle = `rgba(90,60,20,${R("pm", i) * 0.08})`;
    x.beginPath();
    x.arc(R("pmx", i) * w, R("pmy", i) * h, 10 + R("pmr", i) * 50, 0, 7);
    x.fill();
  }
};

/** Contrato pirata: «ARTICLES» y la tabla de precios por cada parte del cuerpo, con firmas y una X. */
export function texContrato() {
  return lienzo("contrato", 768, 1024, (x) => {
    pergamino(x, 768, 1024);
    x.fillStyle = "#3a2410";
    x.textAlign = "center";
    x.font = "bold 92px Georgia, serif";
    x.fillText("ARTICLES", 384, 120);
    x.font = "italic 34px Georgia, serif";
    x.fillText("No prey, no pay", 384, 175);
    x.textAlign = "left";
    x.font = "bold 46px Georgia, serif";
    const filas: [string, string][] = [["Right arm", "600"], ["Left arm", "500"], ["Right leg", "500"], ["Left leg", "400"], ["An eye", "100"], ["A finger", "100"]];
    filas.forEach(([a, b], i) => {
      const y = 280 + i * 92;
      x.fillText(a, 80, y);
      x.textAlign = "right";
      x.fillText(b, 690, y);
      x.textAlign = "left";
      x.strokeStyle = "rgba(58,36,16,0.35)";
      x.lineWidth = 3;
      x.setLineDash([6, 10]);
      x.beginPath();
      x.moveTo(360, y - 12);
      x.lineTo(590, y - 12);
      x.stroke();
      x.setLineDash([]);
    });
    x.strokeStyle = "#2a1808";
    x.lineWidth = 5;
    for (let k = 0; k < 4; k++) {
      x.beginPath();
      const y = 880 + (k % 2) * 50;
      const x0 = 80 + k * 160;
      x.moveTo(x0, y);
      for (let s = 0; s < 8; s++) x.lineTo(x0 + s * 14, y + Math.sin(s * 1.7 + k) * 14);
      x.stroke();
    }
    x.fillStyle = "#8a1a1a";
    x.beginPath();
    x.arc(640, 920, 44, 0, 7);
    x.fill();
  });
}

/** Cartel de «WANTED» con un monigote pirata dibujado y la recompensa. */
export function texWanted(n: number) {
  return lienzo(`wanted${n}`, 512, 720, (x) => {
    pergamino(x, 512, 720);
    x.fillStyle = "#2a1808";
    x.textAlign = "center";
    x.font = "bold 96px Georgia, serif";
    x.fillText("WANTED", 256, 110);
    x.strokeStyle = "#2a1808";
    x.lineWidth = 8;
    x.strokeRect(96, 150, 320, 330);
    // retrato: cabeza blanca con parche o pañuelo
    x.fillStyle = "#f4f2ea";
    x.beginPath();
    x.arc(256, 300, 92, 0, 7);
    x.fill();
    x.stroke();
    x.fillStyle = "#2a1808";
    if (n % 2) {
      x.beginPath();
      x.ellipse(220, 290, 26, 22, 0, 0, 7);
      x.fill();
      x.fillRect(160, 250, 200, 8);
    } else {
      x.beginPath();
      x.ellipse(222, 292, 9, 13, 0, 0, 7);
      x.ellipse(290, 292, 9, 13, 0, 0, 7);
      x.fill();
      x.fillStyle = "#a0202a";
      x.fillRect(164, 206, 184, 46);
    }
    x.fillStyle = "#2a1808";
    x.fillRect(220, 344, 70, 8);
    x.font = "bold 46px Georgia, serif";
    x.fillText(n % 2 ? "SEA RAT" : "BUCCANEER", 256, 560);
    x.font = "bold 58px Georgia, serif";
    x.fillText(`${(n % 3 + 1) * 500} PESOS`, 256, 640);
  });
}

/** Pizarra de taberna con tiza. */
export function texPizarra(lineas: string[]) {
  return lienzo(`pizarra${lineas.join("|")}`, 768, 1024, (x) => {
    x.fillStyle = "#1e2a24";
    x.fillRect(0, 0, 768, 1024);
    for (let i = 0; i < 30; i++) {
      x.fillStyle = `rgba(255,255,255,${R("pz", i) * 0.04})`;
      x.beginPath();
      x.arc(R("pzx", i) * 768, R("pzy", i) * 1024, 30 + R("pzr", i) * 90, 0, 7);
      x.fill();
    }
    x.fillStyle = "#f2efe4";
    x.textAlign = "center";
    lineas.forEach((l, i) => {
      x.font = i === 0 ? "bold 110px Georgia, serif" : "bold 72px Georgia, serif";
      x.fillText(l, 384, 150 + i * 150);
    });
    x.strokeStyle = "#6a4a2a";
    x.lineWidth = 40;
    x.strokeRect(0, 0, 768, 1024);
  });
}

/** Tapiz real: rojo con orla dorada, escudo con castillo y león estilizados. */
export function texTapiz() {
  return lienzo("tapiz", 512, 1024, (x) => {
    x.fillStyle = "#8a1622";
    x.fillRect(0, 0, 512, 1024);
    x.strokeStyle = "#e0b04a";
    x.lineWidth = 24;
    x.strokeRect(30, 30, 452, 964);
    x.lineWidth = 6;
    x.strokeRect(62, 62, 388, 900);
    // escudo
    x.fillStyle = "#e0b04a";
    x.beginPath();
    x.moveTo(140, 300);
    x.lineTo(372, 300);
    x.lineTo(372, 560);
    x.quadraticCurveTo(256, 700, 140, 560);
    x.closePath();
    x.fill();
    x.fillStyle = "#8a1622";
    x.fillRect(176, 390, 70, 110);
    x.fillRect(166, 370, 20, 30);
    x.fillRect(208, 370, 20, 30);
    x.fillRect(236, 370, 20, 30);
    x.fillStyle = "#6a1a8a";
    x.beginPath();
    x.arc(310, 450, 46, 0, 7);
    x.fill();
    // corona encima
    x.fillStyle = "#e0b04a";
    x.beginPath();
    x.moveTo(170, 280);
    x.lineTo(190, 210);
    x.lineTo(220, 250);
    x.lineTo(256, 190);
    x.lineTo(292, 250);
    x.lineTo(322, 210);
    x.lineTo(342, 280);
    x.closePath();
    x.fill();
    // flecos
    for (let i = 0; i < 20; i++) {
      x.fillRect(40 + i * 22, 990, 8, 34);
    }
  });
}

/** Moqueta de oficina en losetas grises. */
export function texMoqueta(rep: [number, number] = [1, 1]) {
  return lienzo("moqueta", 512, 512, (x) => {
    for (let i = 0; i < 4; i++)
      for (let j = 0; j < 4; j++) {
        x.fillStyle = (i + j) % 2 ? "#5c6168" : "#666b72";
        x.fillRect(i * 128, j * 128, 128, 128);
        for (let k = 0; k < 200; k++) {
          x.fillStyle = `rgba(${R("mq", i, j, k) > 0.5 ? "255,255,255" : "0,0,0"},0.06)`;
          x.fillRect(i * 128 + R("mqx", i, j, k) * 128, j * 128 + R("mqy", i, j, k) * 128, 3, 3);
        }
      }
    x.strokeStyle = "rgba(20,20,26,0.5)";
    x.lineWidth = 3;
    for (let i = 0; i <= 4; i++) {
      x.beginPath();
      x.moveTo(i * 128, 0);
      x.lineTo(i * 128, 512);
      x.moveTo(0, i * 128);
      x.lineTo(512, i * 128);
      x.stroke();
    }
  }, rep);
}

/** Pantalla de ordenador con el sello rojo «CLAIM DENIED». */
export function texDenegado() {
  return lienzo("denegado", 1024, 640, (x) => {
    x.fillStyle = "#dfe7f0";
    x.fillRect(0, 0, 1024, 640);
    x.fillStyle = "#2a5fa8";
    x.fillRect(0, 0, 1024, 70);
    x.fillStyle = "#ffffff";
    x.font = "bold 38px sans-serif";
    x.fillText("CLAIM #48213  -  Policy holder: YOU", 30, 48);
    x.fillStyle = "#9aa6b4";
    for (let i = 0; i < 7; i++) x.fillRect(60, 120 + i * 40, 500 + (i % 3) * 120, 14);
    x.save();
    x.translate(560, 420);
    x.rotate(-0.18);
    x.strokeStyle = "#d0202a";
    x.lineWidth = 14;
    x.strokeRect(-330, -90, 660, 180);
    x.fillStyle = "#d0202a";
    x.font = "bold 130px sans-serif";
    x.textAlign = "center";
    x.fillText("DENIED", 0, 46);
    x.restore();
  });
}
