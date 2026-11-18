// Texturas pintadas con código para el vídeo de los submarinos de Holland (idea 8): pizarra del aula con el
// submarino dibujado, carta de la Marina con «REJECTED», plano azul del submarino, mapa de las islas británicas con
// los buques marcados, bandera verde con el arpa, bandera de EE. UU., cuadros de barcos, pizarra de la flotación,
// fajos de dólares, cielo con nieve por la ventana y pared de ladrillo.
import * as THREE from "three";
import { azar } from "./azar";

const cache = new Map<string, THREE.CanvasTexture>();
const R = (k: string, ...n: (string | number)[]) => azar(81, k, ...n);

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

const fondoPizarra = (x: CanvasRenderingContext2D, w: number, h: number, clave: string) => {
  x.fillStyle = "#1c2a22";
  x.fillRect(0, 0, w, h);
  for (let i = 0; i < 70; i++) {
    x.fillStyle = `rgba(255,255,255,${R(clave, i) * 0.05})`;
    x.beginPath();
    x.arc(R(clave + "x", i) * w, R(clave + "y", i) * h, 40 + R(clave + "r", i) * 140, 0, 7);
    x.fill();
  }
};

/** Dibuja un submarino de marsopa con tiza (o con tinta), de perfil. */
function dibujaSub(x: CanvasRenderingContext2D, cx: number, cy: number, L: number, color: string, ancho = 6) {
  x.strokeStyle = color;
  x.lineWidth = ancho;
  x.lineCap = "round";
  x.beginPath();
  x.moveTo(cx - L / 2, cy);
  x.bezierCurveTo(cx - L * 0.3, cy - L * 0.13, cx + L * 0.25, cy - L * 0.13, cx + L / 2, cy);
  x.bezierCurveTo(cx + L * 0.25, cy + L * 0.12, cx - L * 0.3, cy + L * 0.12, cx - L / 2, cy);
  x.stroke();
  x.strokeRect(cx, cy - L * 0.16, L * 0.08, L * 0.06);
  x.beginPath();
  x.moveTo(cx - L / 2 - 10, cy - L * 0.06);
  x.lineTo(cx - L / 2 - 10, cy + L * 0.06);
  x.moveTo(cx - L / 2 - 30, cy);
  x.lineTo(cx - L / 2 + 10, cy);
  x.stroke();
}

/** Pizarra del aula de Paterson (1875): la lección del día y, encima, el submarino de Holland a tiza. */
export function texPizarraAula() {
  return lienzo("pizarra-aula", 2048, 1024, (x) => {
    fondoPizarra(x, 2048, 1024, "pa");
    x.fillStyle = "#f2efe4";
    x.font = "italic 64px Georgia, serif";
    x.fillText("Paterson, N.J.   March 1875", 80, 110);
    x.font = "bold 70px Georgia, serif";
    x.fillText("Lesson:  Archimedes", 80, 220);
    x.font = "56px Georgia, serif";
    x.fillText("A body in water is pushed UP", 80, 320);
    x.fillText("by the weight of the water", 80, 395);
    x.fillText("it pushes away.", 80, 470);
    x.font = "60px Georgia, serif";
    x.fillText("7 x 8 = 56     12 x 12 = 144", 80, 620);
    x.fillText("1875 - 1776 = 99", 80, 710);
    dibujaSub(x, 1500, 360, 760, "#f2efe4", 8);
    x.fillStyle = "#ffd890";
    x.font = "bold 58px Georgia, serif";
    x.fillText("MY SUBMARINE BOAT", 1170, 160);
    x.font = "44px Georgia, serif";
    x.fillStyle = "#f2efe4";
    x.fillText("ballast tank", 1180, 560);
    x.fillText("air", 1690, 560);
    x.beginPath();
    x.moveTo(1300, 520);
    x.lineTo(1330, 410);
    x.moveTo(1720, 520);
    x.lineTo(1700, 410);
    x.stroke();
    x.strokeStyle = "#ffd890";
    x.lineWidth = 6;
    x.strokeRect(1120, 100, 820, 520);
  });
}

/** Carta de la Marina (1875) con el sello rojo «REJECTED» y la frase «a fantastic scheme of a civilian landsman». */
export function texCartaRechazo() {
  return lienzo("carta-rechazo", 768, 1024, (x) => {
    x.fillStyle = "#efe4c8";
    x.fillRect(0, 0, 768, 1024);
    for (let i = 0; i < 40; i++) {
      x.fillStyle = `rgba(120,90,40,${R("cr", i) * 0.06})`;
      x.beginPath();
      x.arc(R("crx", i) * 768, R("cry", i) * 1024, 20 + R("crr", i) * 80, 0, 7);
      x.fill();
    }
    x.fillStyle = "#2a2218";
    x.textAlign = "center";
    x.font = "bold 40px Georgia, serif";
    x.fillText("NAVY DEPARTMENT", 384, 90);
    x.font = "italic 30px Georgia, serif";
    x.fillText("Washington, 1875", 384, 136);
    x.textAlign = "left";
    x.font = "28px Georgia, serif";
    x.fillText("To Mr. J. P. Holland, Paterson, N.J.", 60, 230);
    for (let i = 0; i < 6; i++) x.fillRect(60, 280 + i * 44, 560 + (i % 2) * 60, 4);
    x.font = "italic bold 34px Georgia, serif";
    x.fillText("“a fantastic scheme", 60, 600);
    x.fillText("of a civilian landsman.”", 60, 648);
    x.save();
    x.translate(384, 820);
    x.rotate(-0.2);
    x.strokeStyle = "#c0202a";
    x.lineWidth = 12;
    x.strokeRect(-300, -80, 600, 160);
    x.fillStyle = "#c0202a";
    x.font = "bold 110px sans-serif";
    x.textAlign = "center";
    x.fillText("REJECTED", 0, 40);
    x.restore();
  });
}

/** Plano azul (cianotipo) del submarino. */
export function texPlanoSub() {
  return lienzo("plano-sub", 1024, 640, (x) => {
    x.fillStyle = "#1d4a86";
    x.fillRect(0, 0, 1024, 640);
    x.strokeStyle = "rgba(255,255,255,0.12)";
    x.lineWidth = 1;
    for (let i = 0; i < 1024; i += 32) {
      x.beginPath();
      x.moveTo(i, 0);
      x.lineTo(i, 640);
      x.stroke();
    }
    for (let j = 0; j < 640; j += 32) {
      x.beginPath();
      x.moveTo(0, j);
      x.lineTo(1024, j);
      x.stroke();
    }
    dibujaSub(x, 512, 300, 760, "#e8f2ff", 4);
    x.strokeStyle = "#e8f2ff";
    x.lineWidth = 2;
    x.strokeRect(300, 300, 120, 50);
    x.strokeRect(600, 300, 120, 50);
    x.fillStyle = "#e8f2ff";
    x.font = "bold 34px monospace";
    x.fillText("SUBMARINE TORPEDO BOAT  -  J.P. HOLLAND", 40, 60);
    x.font = "24px monospace";
    x.fillText("BALLAST", 310, 390);
    x.fillText("BALLAST", 610, 390);
    x.fillText("DIVING PLANES", 60, 470);
    x.fillText("SCALE 1:48", 820, 600);
  });
}

/** Mapa de Gran Bretaña e Irlanda con los buques de guerra marcados en rojo (el plan de los fenianos). */
export function texMapaBritanico() {
  return lienzo("mapa-britanico", 1024, 1024, (x) => {
    x.fillStyle = "#c9b48a";
    x.fillRect(0, 0, 1024, 1024);
    x.fillStyle = "#8aa6b0";
    x.fillRect(40, 40, 944, 944);
    // Irlanda
    x.fillStyle = "#4a8a4a";
    x.beginPath();
    x.moveTo(230, 420);
    x.bezierCurveTo(160, 470, 150, 640, 230, 720);
    x.bezierCurveTo(320, 780, 420, 720, 430, 620);
    x.bezierCurveTo(440, 520, 380, 400, 300, 390);
    x.closePath();
    x.fill();
    // Gran Bretaña
    x.fillStyle = "#d8c8a0";
    x.beginPath();
    x.moveTo(520, 160);
    x.bezierCurveTo(470, 220, 500, 330, 540, 380);
    x.bezierCurveTo(500, 450, 560, 520, 580, 600);
    x.bezierCurveTo(520, 660, 480, 760, 560, 800);
    x.bezierCurveTo(680, 830, 800, 800, 820, 740);
    x.bezierCurveTo(780, 640, 740, 520, 680, 440);
    x.bezierCurveTo(660, 340, 640, 220, 560, 150);
    x.closePath();
    x.fill();
    x.strokeStyle = "#3a2a1a";
    x.lineWidth = 4;
    x.stroke();
    // buques británicos marcados con cruces rojas y flechas
    x.strokeStyle = "#c0202a";
    x.lineWidth = 8;
    [[470, 700], [860, 780], [700, 880], [450, 300], [880, 520]].forEach(([px, py]) => {
      x.beginPath();
      x.moveTo(px - 22, py - 22);
      x.lineTo(px + 22, py + 22);
      x.moveTo(px + 22, py - 22);
      x.lineTo(px - 22, py + 22);
      x.stroke();
    });
    x.fillStyle = "#2a1a10";
    x.font = "bold 44px Georgia, serif";
    x.fillText("ROYAL NAVY", 600, 960);
    x.font = "bold 34px Georgia, serif";
    x.fillText("ERIN", 250, 580);
  });
}

/** Bandera verde con el arpa dorada (la de los fenianos). */
export function texBanderaVerde() {
  return lienzo("bandera-verde", 768, 512, (x) => {
    x.fillStyle = "#1f7a3a";
    x.fillRect(0, 0, 768, 512);
    x.strokeStyle = "#f2c24a";
    x.fillStyle = "#f2c24a";
    x.lineWidth = 14;
    // arpa
    x.beginPath();
    x.moveTo(300, 400);
    x.lineTo(300, 140);
    x.quadraticCurveTo(420, 90, 480, 180);
    x.quadraticCurveTo(470, 300, 300, 400);
    x.stroke();
    for (let i = 0; i < 6; i++) {
      x.lineWidth = 4;
      x.beginPath();
      x.moveTo(320 + i * 25, 380 - i * 30);
      x.lineTo(320 + i * 25, 160 + i * 6);
      x.stroke();
    }
    x.beginPath();
    x.arc(300, 130, 20, 0, 7);
    x.fill();
  });
}

/** Bandera de EE. UU. (barras y un cantón con estrellas). */
export function texBanderaEEUU(estrellas = 45) {
  return lienzo(`bandera-eeuu-${estrellas}`, 1024, 540, (x) => {
    for (let i = 0; i < 13; i++) {
      x.fillStyle = i % 2 ? "#f4f2ec" : "#b3202f";
      x.fillRect(0, (i * 540) / 13, 1024, 540 / 13 + 1);
    }
    x.fillStyle = "#1c2a5a";
    x.fillRect(0, 0, 430, (540 * 7) / 13);
    x.fillStyle = "#f4f2ec";
    const filas = 6;
    const porFila = Math.ceil(estrellas / filas);
    let n = 0;
    for (let j = 0; j < filas; j++)
      for (let i = 0; i < porFila && n < estrellas; i++, n++) {
        const cx = 30 + i * (380 / (porFila - 1 || 1));
        const cy = 26 + j * 46;
        x.beginPath();
        for (let k = 0; k < 10; k++) {
          const r = k % 2 ? 6 : 14;
          const a = (k / 10) * Math.PI * 2 - Math.PI / 2;
          x.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
        }
        x.fill();
      }
  });
}

/** Cuadro al óleo de un barco de guerra (fragata de vela o acorazado), con marco pintado aparte. */
export function texCuadroBarco(n: number) {
  return lienzo(`cuadro-barco-${n}`, 768, 512, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, n % 2 ? "#e8b880" : "#9ab8d0");
    g.addColorStop(0.6, n % 2 ? "#c8784a" : "#d8d0b8");
    g.addColorStop(0.61, "#2a4a5a");
    g.addColorStop(1, "#16303a");
    x.fillStyle = g;
    x.fillRect(0, 0, 768, 512);
    for (let i = 0; i < 40; i++) {
      x.strokeStyle = `rgba(255,255,255,${0.1 + R("cb", n, i) * 0.2})`;
      x.lineWidth = 3;
      x.beginPath();
      const y = 330 + R("cby", n, i) * 170;
      const px = R("cbx", n, i) * 768;
      x.moveTo(px, y);
      x.lineTo(px + 40, y - 4);
      x.stroke();
    }
    // casco y mástiles
    x.fillStyle = "#1a120c";
    x.beginPath();
    x.moveTo(200, 300);
    x.lineTo(600, 300);
    x.lineTo(560, 350);
    x.lineTo(240, 350);
    x.closePath();
    x.fill();
    x.fillStyle = "#f2ead0";
    x.fillRect(250, 318, 300, 8);
    [300, 400, 500].forEach((mx, i) => {
      x.fillStyle = "#1a120c";
      x.fillRect(mx - 4, 80 + i * 10, 8, 220);
      x.fillStyle = "#f2ead0";
      for (let k = 0; k < 3; k++) x.fillRect(mx - 55 + k * 8, 100 + i * 10 + k * 62, 110 - k * 16, 50);
    });
    if (n % 2 === 0) {
      x.fillStyle = "#4a4a4a";
      x.fillRect(380, 230, 40, 70);
    }
  });
}

/** Pizarra del taller: la regla de la flotación y las cifras del Holland. */
export function texPizarraTaller() {
  return lienzo("pizarra-taller", 1536, 1024, (x) => {
    fondoPizarra(x, 1536, 1024, "pt");
    x.fillStyle = "#f2efe4";
    x.font = "bold 72px Georgia, serif";
    x.fillText("FLOATS  if  lighter than", 70, 130);
    x.fillText("the water it pushes away", 70, 220);
    x.font = "56px Georgia, serif";
    x.fillText("Tanks FULL  ->  dives", 70, 360);
    x.fillText("Tanks + AIR  ->  rises", 70, 450);
    x.fillStyle = "#ffd890";
    x.font = "bold 64px Georgia, serif";
    x.fillText("Keep 300 lb light!", 70, 600);
    x.fillStyle = "#f2efe4";
    x.font = "52px Georgia, serif";
    x.fillText("74 tons  /  500  =  ~300 lb", 70, 700);
    dibujaSub(x, 1150, 820, 520, "#f2efe4", 6);
    x.strokeStyle = "#9fe8ff";
    x.lineWidth = 6;
    x.beginPath();
    x.moveTo(1150, 700);
    x.lineTo(1150, 600);
    x.lineTo(1130, 625);
    x.moveTo(1150, 600);
    x.lineTo(1170, 625);
    x.stroke();
  });
}

/** Fajo de billetes verdes de dólar (cara de arriba). */
export function texBilletes() {
  return lienzo("billetes", 512, 256, (x) => {
    x.fillStyle = "#cfdcb8";
    x.fillRect(0, 0, 512, 256);
    x.strokeStyle = "#3a6a3a";
    x.lineWidth = 10;
    x.strokeRect(10, 10, 492, 236);
    x.fillStyle = "#3a6a3a";
    x.beginPath();
    x.ellipse(256, 128, 60, 80, 0, 0, 7);
    x.fill();
    x.font = "bold 60px Georgia, serif";
    x.fillText("100", 30, 80);
    x.fillText("100", 380, 230);
    x.fillStyle = "#cfdcb8";
    x.font = "bold 40px Georgia, serif";
    x.textAlign = "center";
    x.fillText("$", 256, 142);
  });
}

/** Noche de invierno por la ventana: nieve, tejados y chimeneas de las fábricas de Paterson. */
export function texNocheNieve() {
  return lienzo("noche-nieve", 512, 512, (x) => {
    const g = x.createLinearGradient(0, 0, 0, 512);
    g.addColorStop(0, "#0e1a36");
    g.addColorStop(1, "#3a4a72");
    x.fillStyle = g;
    x.fillRect(0, 0, 512, 512);
    x.fillStyle = "#121624";
    x.fillRect(0, 360, 512, 152);
    [[40, 250, 30], [140, 200, 24], [330, 230, 28], [430, 180, 22]].forEach(([cx, top, w]) => x.fillRect(cx, top, w, 360 - top));
    x.fillStyle = "#ffcf7a";
    for (let i = 0; i < 18; i++) x.fillRect(20 + R("vn", i) * 470, 380 + R("vny", i) * 100, 12, 14);
    x.fillStyle = "#ffffff";
    for (let i = 0; i < 140; i++) {
      x.globalAlpha = 0.4 + R("nv", i) * 0.6;
      x.beginPath();
      x.arc(R("nvx", i) * 512, R("nvy", i) * 512, 1 + R("nvr", i) * 3, 0, 7);
      x.fill();
    }
    x.globalAlpha = 1;
    x.fillStyle = "#e8eef8";
    x.fillRect(0, 500, 512, 12);
  });
}

/** Pared de ladrillo (rojo oscuro, juntas claras), repetible. */
export function texLadrillo(tono = 12, rep: [number, number] = [1, 1]) {
  return lienzo(`ladrillo-${tono}`, 512, 512, (x) => {
    x.fillStyle = "#6a5a4a";
    x.fillRect(0, 0, 512, 512);
    const fh = 32;
    for (let j = 0; j < 16; j++)
      for (let i = -1; i < 9; i++) {
        const px = i * 64 + (j % 2 ? 32 : 0);
        const l = 26 + R("lad", tono, i, j) * 14;
        x.fillStyle = `hsl(${tono + R("ladh", i, j) * 8}, 45%, ${l}%)`;
        x.fillRect(px + 3, j * fh + 3, 58, fh - 5);
      }
    for (let i = 0; i < 200; i++) {
      x.fillStyle = `rgba(0,0,0,${R("ladm", i) * 0.15})`;
      x.fillRect(R("ladx", i) * 512, R("lady", i) * 512, 6, 6);
    }
  }, rep);
}

/** Chapa de acero con marcas de soldadura (nave del astillero moderno). */
export function texChapaNave(rep: [number, number] = [1, 1]) {
  return lienzo("chapa-nave", 512, 512, (x) => {
    x.fillStyle = "#5a616a";
    x.fillRect(0, 0, 512, 512);
    for (let i = 0; i < 300; i++) {
      x.fillStyle = `rgba(${R("cn", i) > 0.5 ? "255,255,255" : "0,0,0"},0.05)`;
      x.fillRect(R("cnx", i) * 512, R("cny", i) * 512, 10, 3);
    }
    x.strokeStyle = "rgba(20,22,26,0.6)";
    x.lineWidth = 4;
    for (let i = 0; i <= 4; i++) {
      x.beginPath();
      x.moveTo(i * 128, 0);
      x.lineTo(i * 128, 512);
      x.moveTo(0, i * 128);
      x.lineTo(512, i * 128);
      x.stroke();
    }
    x.fillStyle = "#f2c41e";
    x.fillRect(0, 488, 512, 24);
    x.fillStyle = "#1a1a1a";
    for (let i = 0; i < 16; i++) x.fillRect(i * 32, 488, 16, 24);
  }, rep);
}
