// OBJETOS ANIMADOS del motor 2D. Cada uno se dibuja en el mundo con su centro/base en (x, y) y escala k.
// `vida` = segundos desde que aparece; T(palabra) = segundo (relativo a la escena) en que la voz dice esa palabra.
import { Pen } from "../personaje/toon";
import { En } from "../motor/tipos";
import { caja, cl, clamp, forma, G, gordo, INK, mix, os, P2, rect, rnd, suave, texto } from "./base";
import { ObjetoL } from "./tipos";

export type CtxObj = { t: number; vida: number; T: (en: En | undefined, defecto?: number) => number; f: number };
type Dibuja = (g: G, p: Pen, o: ObjetoL, c: CtxObj) => void;
const n = (v: unknown, d: number) => (typeof v === "number" ? v : d);
const s = (v: unknown, d: string) => (typeof v === "string" ? v : d);
/** 0 → 1 entre dos palabras (o desde una palabra durante `dura` s) */
const entre = (c: CtxObj, a: unknown, b: unknown, dura = 2) => {
  const ta = c.T(a as En, 0), tb = b !== undefined ? c.T(b as En, ta + dura) : ta + dura;
  return suave((c.t - ta) / Math.max(0.2, tb - ta));
};
const desde = (c: CtxObj, a: unknown) => (a === undefined ? Infinity : c.t - c.T(a as En, 0));

const billete = (p: Pen, x: number, y: number, w: number, giro = 0) => {
  const h = w * 0.45, cs = Math.cos(giro), sn = Math.sin(giro);
  const R = (pts: P2[]): P2[] => pts.map(([a, b]) => [x + a * cs - b * sn, y + a * sn + b * cs]);
  forma(p, R(caja(-w / 2, -h / 2, w, h)), "#9cc08a", 2.5, w);
  p.ell(x, y, h * 0.3, h * 0.3, "#c4dcb4", 2);
  p.poly(R(caja(-w / 2 + 6, -h / 2 + 6, w - 12, h - 12)), null, 1.2);
};
const moneda = (p: Pen, x: number, y: number, r: number) => { p.ell(x, y, r, r, "#e0b84a", Math.max(2, r * 0.12)); p.ell(x, y, r * 0.7, r * 0.7, "#f0d27a", 1.5); p.stroke([[x - r * 0.15, y - r * 0.35], [x - r * 0.15, y + r * 0.35]], r * 0.14, "#b8902a"); };

const carta: Dibuja = (g, p, o, c) => {
  const k = n(o.k, 1), x = o.x, y = o.y, abre = entre(c, o.abre ?? o.en, undefined, 0.8);
  g.save(); g.translate(x, y + Math.sin(c.t * 2) * 6); g.rotate(-0.05 + Math.sin(c.t) * 0.02); g.scale(k, k);
  rect(p, -170, -110, 340, 220, "#f4efe0", 5);
  // la hoja sale del sobre
  const sube = abre * 170;
  rect(p, -140, -90 - sube, 280, 200, "#ffffff", 4);
  texto(g, s(o.texto, ""), 0, -40 - sube, 44, INK);
  texto(g, s(o.texto2, ""), 0, 10 - sube, 36, "#5a4a3a");
  rect(p, -170, -20, 340, 130, "#efe6cf", 5);
  p.stroke([[-170, -20], [0, 60 - abre * 60], [170, -20]], 4);
  forma(p, [[-170, -110], [170, -110], [0, abre > 0.1 ? -230 * abre : 10]], "#e8dcc0", 4, 200);
  p.ell(0, 20, 22, 22, "#b8383a", 3);
  g.restore();
};

const monton: Dibuja = (g, p, o, c) => {
  // montón de títulos de acciones que crece; regla de 13 cm al lado
  const k = n(o.k, 1), alto = n(o.alto, 320) * entre(c, o.en, o.hastaCrece, 3), x = o.x, y = o.y;
  g.save(); g.translate(x, y); g.scale(k, k);
  const hojas = Math.floor(alto / 8);
  for (let i = 0; i < hojas; i++) {
    const dx = (rnd(3, i) - 0.5) * 18, yy = -i * 8;
    forma(p, caja(-130 + dx, yy - 9, 260, 9), i % 7 === 0 ? "#e6d7a8" : "#f1e9cf", 1.6, 200);
    if (i % 7 === 0) p.dot(110 + dx, yy - 4.5, 3, "#b8383a");
  }
  if (o.regla) {
    const r = entre(c, o.regla, undefined, 0.6);
    g.globalAlpha = r;
    rect(p, 170, -n(o.alto, 320), 40, n(o.alto, 320), "#f3d98a", 3);
    for (let i = 0; i <= 13; i++) p.stroke([[170, -i * n(o.alto, 320) / 13], [i % 5 === 0 ? 200 : 188, -i * n(o.alto, 320) / 13]], 2.5);
    gordo(g, "13 cm", 300, -n(o.alto, 320) / 2, 56, "#ffffff");
    g.globalAlpha = 1;
  }
  g.restore();
};

const cajafuerte: Dibuja = (g, p, o, c) => {
  // caja de seguridad alargada sobre la mesa; la tapa se abre y sale luz
  const k = n(o.k, 1), ab = entre(c, o.abre ?? o.en, undefined, 1.2);
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  if (ab > 0) {
    const gr = g.createRadialGradient(0, -60, 10, 0, -200, 420); gr.addColorStop(0, `rgba(255,236,170,${0.75 * ab})`); gr.addColorStop(1, "rgba(255,236,170,0)");
    g.fillStyle = gr; g.beginPath(); g.moveTo(-260, -60); g.lineTo(260, -60); g.lineTo(420, -560); g.lineTo(-420, -560); g.fill();
  }
  forma(p, caja(-280, -70, 560, 130), "#9aa1a8", 5, 400);
  rect(p, -260, -50, 520, 20, "#7d848c", 2);
  p.ell(220, 0, 14, 14, "#d9b45a", 3); texto(g, "Nº 1921", -150, 10, 34, INK);
  // tapa que gira hacia atrás
  const h = 60 * (1 - ab) + 6;
  forma(p, [[-280, -70], [280, -70], [270, -70 - h], [-270, -70 - h]], "#b9bcc2", 4, 400);
  g.restore();
};

/** EL ÁRBOL que Ronald nunca cortó: crece (g de 0 a 1), da frutos (monedas), los frutos caen y brotan árboles nuevos */
const arbol: Dibuja = (g, p, o, c) => {
  const k = n(o.k, 1), g0 = n(o.de, 0), g1 = n(o.a, 1);
  const cre = g0 + (g1 - g0) * entre(c, o.en, o.hastaCrece, n(o.dura, 6));
  const tormenta = o.tormenta !== undefined ? clamp(desde(c, o.tormenta) / 0.5) * (o.calma !== undefined ? 1 - clamp(desde(c, o.calma) / 1) : 1) : 0;
  const viento = Math.sin(c.t * 1.4) * 0.02 + tormenta * Math.sin(c.t * 7) * 0.06;
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  const H = 120 + 520 * cre, W = 18 + 46 * cre;
  // raíces y tronco
  forma(p, [[-W * 1.6, 0], [-W * 0.6, -H * 0.25], [-W * 0.45, -H * 0.85], [W * 0.45, -H * 0.85], [W * 0.6, -H * 0.25], [W * 1.6, 0]], "#7a5232", 5, H);
  p.stroke([[-W * 0.2, -H * 0.2], [-W * 0.1, -H * 0.6]], 3, "#5e3d24");
  // ramas
  const ramas: [number, number, number][] = [[-0.55, 0.62, 0.42], [0.6, 0.55, 0.4], [-0.25, 0.85, 0.3], [0.3, 0.8, 0.34], [0, 0.95, 0.25]];
  const rota = o.rama !== undefined ? desde(c, o.rama) : -1;
  ramas.forEach(([dir, at, lg], i) => {
    if (cre < 0.15 * i) return;
    let a = dir * 1.1 + viento * 4, caida = 0;
    if (i === 0 && rota > 0) caida = Math.min(1, rota / 0.7);
    const x0 = 0, y0 = -H * at, L2 = H * lg;
    const x1 = x0 + Math.sin(a) * L2, y1 = y0 - Math.cos(a) * L2 + caida * caida * 700;
    if (i === 0 && rota > 0) {
      g.save(); g.globalAlpha = 1 - clamp((rota - 1.2) / 0.6);
      p.band([[x0 - 30 - caida * 60, y0 + caida * 500], [x1 - caida * 120, y1]], "#7a5232", 18 + 20 * cre, 4, "round");
      if (o.ramaTexto) texto(g, s(o.ramaTexto, ""), x1 - caida * 120, y1 - 60, 46, "#b8383a");
      g.restore();
      return;
    }
    p.band([[x0, y0], [x1, y1]], "#7a5232", 14 + 22 * cre, 4, "round");
  });
  // copa: varias bolas de hojas que se mueven con el viento
  const copa = clamp((cre - 0.05) / 0.95);
  if (copa > 0) {
    const R = 70 + 270 * copa;
    const bolas: [number, number, number][] = [[0, -H - R * 0.2, 1], [-R * 0.75, -H + R * 0.15, 0.75], [R * 0.75, -H + R * 0.15, 0.75], [-R * 0.45, -H - R * 0.6, 0.6], [R * 0.45, -H - R * 0.6, 0.6], [0, -H + R * 0.35, 0.7]];
    bolas.forEach(([bx, by, r], i) => {
      if (i === 0 && rota > 0) r *= 1;
      const m = viento * 220 * (by / -H);
      p.ell(bx + m, by, R * r * 0.62, R * r * 0.55, i % 2 ? "#5d8a3a" : "#6f9c45", 4.5);
      p.ell(bx + m - R * r * 0.18, by - R * r * 0.2, R * r * 0.22, R * r * 0.16, "#8db85a", 0);
    });
    // frutos: monedas doradas
    if (o.frutos !== undefined) {
      const fr = entre(c, o.frutos, undefined, 1.5), nf = Math.floor(14 * copa);
      for (let i = 0; i < nf; i++) {
        const a = rnd(13, i) * Math.PI * 2, rr = rnd(14, i) * R * 0.75;
        let fx = Math.cos(a) * rr * 0.9 + viento * 150, fy = -H - R * 0.1 + Math.sin(a) * rr * 0.6;
        if (o.caen !== undefined) { // caen, ruedan y se plantan
          const d = desde(c, o.caen) - i * 0.25;
          if (d > 0) {
            const caida = Math.min(1, d / 0.8);
            const dest = (rnd(15, i) - 0.5) * 1200;
            fx = fx + (dest - fx) * caida; fy = fy + (-10 - fy) * caida * caida;
            if (d > 0.8) { // brote nuevo
              const b = clamp((d - 0.8) / 1.5);
              p.stroke([[fx, -4], [fx, -4 - 60 * b]], 6, "#5d7a3a");
              p.ell(fx - 14 * b, -4 - 60 * b, 18 * b + 1, 9 * b + 1, "#6f9c45", 2.5); p.ell(fx + 14 * b, -10 - 60 * b, 18 * b + 1, 9 * b + 1, "#6f9c45", 2.5);
              continue;
            }
          }
        }
        moneda(p, fx, fy, 22 * fr + 0.1);
      }
    }
  }
  if (o.letrero) { rect(p, -120, -60, 240, 50, "#f1efe9", 3); texto(g, s(o.letrero, ""), 0, -35, 36); }
  g.restore();
  // lluvia y rayo
  if (tormenta > 0) {
    g.save(); g.globalAlpha = 0.55 * tormenta;
    for (let i = 0; i < 90; i++) { const x = (rnd(21, i) * 2400 + c.t * 300) % 2400 - 200, y = (rnd(22, i) * 1100 + c.t * 1400) % 1100; p.stroke([[x, y], [x - 12, y + 40]], 3, "#dfe8ee"); }
    g.globalAlpha = 1;
    const fl = (c.t * 0.8) % 1;
    if (fl < 0.06) { g.globalAlpha = 0.5; g.fillStyle = "#ffffff"; g.fillRect(-500, -500, 3000, 2200); g.globalAlpha = 1; p.stroke([[o.x + 380, 0], [o.x + 330, 200], [o.x + 400, 230], [o.x + 340, 470]], 12, "#fff3b0"); }
    g.restore();
  }
};

/** gráfica del interés compuesto: aportado (recta) contra lo que tendrías (curva) */
const grafica: Dibuja = (g, p, o, c) => {
  const W = n(o.w, 1300), H = n(o.h, 680), anos = n(o.anos, 30), m = n(o.mensual, 100), r = n(o.tasa, 0.07), top = n(o.max, 130000);
  const x0 = o.x - W / 2, y0 = o.y;
  rect(p, x0 - 60, y0 - H - 60, W + 120, H + 140, "#fbf7ee", 5);
  p.stroke([[x0, y0], [x0 + W, y0]], 5); p.stroke([[x0, y0], [x0, y0 - H]], 5);
  const valor = (mes: number) => (r === 0 ? m * mes : m * ((Math.pow(1 + r / 12, mes) - 1) / (r / 12)));
  const X = (a: number) => x0 + (a / n(o.anosEje, anos)) * W, Y = (v: number) => y0 - (v / top) * H;
  for (let a = 0; a <= n(o.anosEje, anos); a += 10) { p.stroke([[X(a), y0], [X(a), y0 + 14]], 4); texto(g, `${a} años`, X(a), y0 + 42, 32); }
  const curva = (anosC: number, prog: number, col: string, conInteres: boolean, grosor = 10) => {
    const pts: P2[] = [];
    const hastaMes = anosC * 12 * prog;
    for (let mes = 0; mes <= hastaMes; mes += 3) pts.push([X(mes / 12), Y(conInteres ? valor(mes) : m * mes)]);
    if (pts.length > 1) p.stroke(pts, grosor, col);
    return pts[pts.length - 1];
  };
  const pr = entre(c, o.en, o.hastaDibuja, n(o.dura, 4));
  curva(anos, pr, "#8a8d93", false, 7);
  const fin = curva(anos, pr, "#3f9a5a", true, 11);
  if (fin) { p.ell(fin[0], fin[1], 14, 14, "#3f9a5a", 4); }
  if (o.en2 !== undefined) {
    const pr2 = entre(c, o.en2, o.hasta2, 3), anos2 = n(o.anos2, 40);
    const f2 = curva(anos2, pr2, "#d9a441", true, 11);
    if (f2 && pr2 > 0.02) p.ell(f2[0], f2[1], 14, 14, "#d9a441", 4);
  }
  if (o.leyenda) { texto(g, "lo que pones", x0 + 40, y0 - H + 10, 34, "#6c7079", "left"); texto(g, "lo que tendrías", x0 + 40, y0 - H + 52, 34, "#3f9a5a", "left"); }
};

const telefono: Dibuja = (g, p, o, c) => {
  // móvil grande con la app del banco: «transferencia automática el día de cobro»
  const k = n(o.k, 1), pg = entre(c, o.programa, undefined, 0.6);
  g.save(); g.translate(o.x, o.y + Math.sin(c.t * 1.5) * 5); g.rotate(Math.sin(c.t) * 0.02); g.scale(k, k);
  forma(p, caja(-200, -380, 400, 760), "#26242a", 7, 500);
  rect(p, -176, -340, 352, 680, "#f4f6f2", 3);
  rect(p, -176, -340, 352, 90, "#2f7f80", 0); texto(g, "Mi banco", 0, -295, 46, "#ffffff");
  texto(g, "Transferencia", 0, -200, 44); texto(g, "automática", 0, -155, 44);
  rect(p, -150, -110, 300, 80, "#ffffff", 3); texto(g, s(o.cantidad, "20 €"), 0, -70, 56, "#2f7f80");
  texto(g, "cada mes, el día", 0, 0, 34, "#6c7079"); texto(g, "que cobras", 0, 38, 34, "#6c7079");
  // interruptor
  rect(p, -60, 90, 120, 60, pg > 0.5 ? "#3f9a5a" : "#b9bcc2", 3); p.ell(-30 + 60 * pg, 120, 26, 26, "#ffffff", 3);
  if (pg > 0.9) { gordo(g, "✓ Programada", 0, 230, 48, "#3f9a5a", 8); }
  rect(p, -60, 300, 120, 14, "#26242a", 0);
  g.restore();
};

const ICONOS: Record<string, (p: Pen, g: G) => void> = {
  luz: (p) => { p.ell(0, -20, 46, 50, "#f6d77a", 4); rect(p, -22, 26, 44, 34, "#9aa1a8", 3); p.stroke([[-12, -10], [0, 10], [12, -10]], 4); },
  banco: (p, g) => { forma(p, [[-60, -20], [60, -20], [0, -60]], "#d6cbb8", 4, 80); for (const x of [-40, -10, 20]) rect(p, x, -18, 18, 60, "#f1efe9", 3); rect(p, -60, 42, 120, 16, "#d6cbb8", 3); texto(g, "$", 0, -34, 26); },
  farmacia: (p) => { rect(p, -45, -45, 90, 90, "#ecebe6", 4); rect(p, -12, -32, 24, 64, "#3f9a5a", 0); rect(p, -32, -12, 64, 24, "#3f9a5a", 0); },
  comida: (p) => { forma(p, caja(-36, -40, 72, 90), "#d9a441", 4, 80); rect(p, -42, -56, 84, 20, "#b8383a", 3); p.ell(0, 6, 22, 22, "#b8383a", 3); },
  limpieza: (p) => { forma(p, [[-30, 50], [30, 50], [34, -20], [12, -40], [-12, -40], [-34, -20]], "#3f6fb5", 4, 80); rect(p, -10, -60, 20, 22, "#ecebe6", 3); for (let i = 0; i < 3; i++) p.ell(46 + i * 10, -50 - i * 16, 8, 8, "#cfe8f0", 2); },
  tech: (p) => { rect(p, -60, -50, 120, 80, "#26242a", 4); rect(p, -50, -40, 100, 60, "#5fa0d0", 0); rect(p, -20, 30, 40, 12, "#6c7079", 3); rect(p, -50, 42, 100, 10, "#6c7079", 3); },
};
const iconos: Dibuja = (g, p, o, c) => {
  const lista = (o.lista as string[]) ?? [], ens = (o.ens as En[]) ?? [], paso = n(o.paso, 220), k = n(o.k, 1);
  lista.forEach((tipo, i) => {
    const d = ens[i] !== undefined ? desde(c, ens[i]) : c.vida - i * 0.3;
    if (d < 0) return;
    const sc = Math.min(1.15, d / 0.18) - Math.max(0, Math.min(0.15, (d - 0.18) / 0.2 * 0.15));
    g.save(); g.translate(o.x + i * paso * k, o.y + Math.sin(c.t * 2 + i) * 6); g.scale(k * sc, k * sc);
    p.ell(0, 0, 90, 90, "#fbf7ee", 5);
    ICONOS[tipo]?.(p, g);
    g.restore();
  });
  if (o.tacha !== undefined && desde(c, o.tacha) > 0) {
    const d = clamp(desde(c, o.tacha) / 0.35), x = o.x + (lista.length - 1) * paso * k, r = 80 * k;
    p.stroke([[x - r, o.y - r], [x - r + 2 * r * d, o.y - r + 2 * r * d]], 22, "#c0392b");
    if (d >= 1) p.stroke([[x + r, o.y - r], [x + r - 2 * r * clamp(desde(c, o.tacha) / 0.35 - 1), o.y - r + 2 * r * clamp(desde(c, o.tacha) / 0.35 - 1)]], 22, "#c0392b");
  }
};

const cesta: Dibuja = (g, p, o, c) => {
  // cesta con muchos huevos (las 95 empresas); uno cae y se rompe (Lehman) y la cesta sigue llena
  const k = n(o.k, 1), d = desde(c, o.rompe);
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  for (let i = 0; i < 26; i++) {
    const fila = Math.floor(i / 9), x = -200 + (i % 9) * 50 + fila * 22, y = -110 - fila * 36;
    if (i === 13 && d > 0) continue;
    p.ell(x, y, 26, 32, i % 4 ? "#f4efe0" : "#e9d9b8", 3);
  }
  forma(p, [[-260, -110], [260, -110], [210, 60], [-210, 60]], "#b98a56", 5, 300);
  for (let i = -4; i <= 4; i++) p.stroke([[i * 55, -105], [i * 45, 55]], 3, "#8a6238");
  for (let j = 0; j < 4; j++) p.stroke([[-250 + j * 12, -70 + j * 38], [250 - j * 12, -70 + j * 38]], 3, "#8a6238");
  p.stroke([[-200, -110], [-160, -330], [160, -330], [200, -110]], 14, "#8a6238");
  if (d > 0) {
    const cae = Math.min(1, d / 0.6), x = 300 + cae * 120, y = -180 + cae * cae * 240;
    if (cae < 1) p.ell(x, y, 26, 32, "#f4efe0", 3);
    else { p.ell(x, 62, 70, 16, "#f6d77a", 3); p.ell(x, 58, 24, 12, "#e0a830", 2); p.stroke([[x - 40, 50], [x - 20, 30], [x - 10, 48]], 4); p.stroke([[x + 40, 50], [x + 22, 28], [x + 10, 46]], 4); if (o.texto) texto(g, s(o.texto, ""), x + 10, 130, 44, "#b8383a"); }
  }
  g.restore();
};

const cartel: Dibuja = (g, p, o, c) => {
  const k = n(o.k, 1), w = n(o.w, 360), col = s(o.color, "#f1efe9"), bal = Math.sin(c.t * 2) * 0.03 * (o.balancea ? 1 : 0.3);
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  if (o.poste !== false) p.band([[0, 0], [0, -230]], "#7a5232", 16, 3);
  g.rotate(bal);
  rect(p, -w / 2, -330, w, 120, col, 5);
  texto(g, s(o.texto, ""), 0, -268, n(o.tam, 60), s(o.tinta, INK));
  g.restore();
};

const facturas: Dibuja = (g, p, o, c) => {
  // papeles de deudas que vuelan alrededor
  const N = n(o.n, 10), R = n(o.r, 360);
  for (let i = 0; i < N; i++) {
    const a = c.t * (0.6 + rnd(31, i) * 0.6) + i * 2.1, d = Math.min(1, (c.vida - i * 0.15) / 0.4);
    if (d <= 0) continue;
    const x = o.x + Math.cos(a) * R * (0.6 + rnd(32, i) * 0.5), y = o.y + Math.sin(a * 1.3) * R * 0.45;
    g.save(); g.translate(x, y); g.rotate(Math.sin(a * 2) * 0.6); g.scale(d, d);
    rect(p, -50, -64, 100, 128, "#fbf7ee", 3);
    texto(g, "DEBE", 0, -36, 30, "#b8383a"); for (let k = 0; k < 4; k++) p.stroke([[-34, -6 + k * 16], [30, -6 + k * 16]], 2.5, "#9aa1a8");
    g.restore();
  }
};

const dinero: Dibuja = (g, p, o, c) => {
  // montón de billetes que crece (o lluvia de billetes con `lluvia`)
  const k = n(o.k, 1), cuanto = entre(c, o.en, o.hastaCrece, n(o.dura, 1.5)), N = Math.floor(n(o.n, 40) * cuanto);
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  for (let i = 0; i < N; i++) {
    const fila = Math.floor(i / 8), x = ((i % 8) - 3.5) * 46 + (fila % 2) * 23, y = -fila * 22;
    billete(p, x, y, 110, (rnd(41, i) - 0.5) * 0.3);
  }
  g.restore();
  if (o.lluvia) for (let i = 0; i < 24; i++) { const y = ((c.vida * 260 + rnd(42, i) * 1300) % 1300) - 200; billete(p, o.x + (rnd(43, i) - 0.5) * 1600, y, 120, c.t * 2 + i); }
};

const tacha: Dibuja = (_g, p, o, c) => {
  const d = clamp(c.vida / 0.3), d2 = clamp((c.vida - 0.3) / 0.3), r = n(o.r, 160);
  p.stroke([[o.x - r, o.y - r], [o.x - r + 2 * r * d, o.y - r + 2 * r * d]], 26, "#c0392b");
  if (d2 > 0) p.stroke([[o.x + r, o.y - r], [o.x + r - 2 * r * d2, o.y - r + 2 * r * d2]], 26, "#c0392b");
};
const interroga: Dibuja = (g, _p, o, c) => { g.save(); g.translate(o.x, o.y + Math.sin(c.t * 3) * 14); g.rotate(Math.sin(c.t * 2) * 0.12); gordo(g, s(o.texto, "?"), 0, 0, n(o.tam, 220), s(o.color, "#ffd23f")); g.restore(); };

const cocheObj: Dibuja = (_g, p, o, c) => {
  const pr = entre(c, o.en, o.hasta2, n(o.dura, 3)), x = o.x + (n(o.x2, o.x) - o.x) * pr;
  const bote = pr > 0 && pr < 1 ? Math.abs(Math.sin(c.t * 14)) * 3 : 0;
  // (dibujo del coche en base.ts)
  import_coche(p, x, o.y - bote, n(o.k, 1), s(o.color, "#c0504a"), !!o.capo);
};
import { coche as import_coche } from "./base";

const tronco: Dibuja = (_g, p, o, c) => {
  // tocón con un leño encima y astillas que saltan con cada hachazo (va con el actor que tiene `hacha`)
  rect(p, o.x - 70, o.y - 80, 140, 80, "#8a5a32", 4); p.ell(o.x, o.y - 80, 70, 18, "#d9b483", 4);
  const golpe = (c.t * 0.6) % 1;
  p.ell(o.x, o.y - 110, 26, 26, "#a8743e", 3);
  if (golpe < 0.25) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.4, d = golpe * 500; forma(p, caja(o.x + Math.cos(a) * d, o.y - 110 + Math.sin(a) * d + d * d * 0.004, 16, 8), "#d9b483", 2, 10); }
};

const pabellon: Dibuja = (g, p, o, c) => {
  // ala nueva del hospital con su nombre
  const k = n(o.k, 1), sube = entre(c, o.en, undefined, 1.5);
  g.save(); g.translate(o.x, o.y); g.scale(k, k * sube);
  rect(p, -420, -420, 840, 420, "#e9e2d2", 5);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 2; j++) rect(p, -380 + i * 130, -360 + j * 150, 90, 110, "#bcd6e2", 3);
  rect(p, -80, -150, 160, 150, "#9fc3d6", 4);
  g.restore();
  if (sube > 0.9) { rect(p, o.x - 330 * k, o.y - 520 * k, 660 * k, 90 * k, "#2f5f6a", 4); texto(g, "PABELLÓN RONALD READ", o.x, o.y - 475 * k, 50 * k, "#f3e3a0"); }
};

const semilla: Dibuja = (_g, p, o, c) => {
  const k = n(o.k, 1), b = entre(c, o.brota, undefined, 2);
  p.ell(o.x, o.y, 120 * k, 30 * k, "#8a6238", 4);
  p.ell(o.x, o.y - 10 * k, 26 * k, 18 * k, "#c98a3e", 3);
  if (b > 0) { p.stroke([[o.x, o.y - 10 * k], [o.x, o.y - (10 + 140 * b) * k]], 9 * k, "#5d7a3a"); p.ell(o.x - 30 * b * k, o.y - (10 + 140 * b) * k, 34 * b * k + 1, 16 * b * k + 1, "#6f9c45", 3); p.ell(o.x + 30 * b * k, o.y - (24 + 140 * b) * k, 34 * b * k + 1, 16 * b * k + 1, "#6f9c45", 3); }
};

const flecha: Dibuja = (_g, p, o, c) => {
  // flecha curva que se dibuja (de x,y a x2,y2 pasando por arriba)
  const d = clamp(c.vida / 0.6), x2 = n(o.x2, o.x + 300), y2 = n(o.y2, o.y), alto = n(o.curva, 180);
  const pts: P2[] = [];
  for (let i = 0; i <= 30 * d; i++) { const u = i / 30; pts.push([o.x + (x2 - o.x) * u, o.y + (y2 - o.y) * u - Math.sin(u * Math.PI) * alto]); }
  if (pts.length < 2) return;
  p.stroke(pts, 18, INK); p.stroke(pts, 10, s(o.color, "#ffd23f"));
  if (d >= 1) { const [a, b] = [pts[pts.length - 2], pts[pts.length - 1]]; const ang = Math.atan2(b[1] - a[1], b[0] - a[0]); forma(p, [[b[0] + Math.cos(ang) * 30, b[1] + Math.sin(ang) * 30], [b[0] + Math.cos(ang + 2.4) * 34, b[1] + Math.sin(ang + 2.4) * 34], [b[0] + Math.cos(ang - 2.4) * 34, b[1] + Math.sin(ang - 2.4) * 34]], s(o.color, "#ffd23f"), 5, 40); }
};

const monedas: Dibuja = (_g, p, o, c) => {
  // monedas que saltan de x,y a x2,y2 una tras otra (dividendos que se vuelven a plantar)
  const N = n(o.n, 6);
  for (let i = 0; i < N; i++) {
    const u = ((c.vida * 0.8 + i / N) % 1);
    const x = o.x + (n(o.x2, o.x) - o.x) * u, y = o.y + (n(o.y2, o.y) - o.y) * u - Math.sin(u * Math.PI) * n(o.curva, 200);
    moneda(p, x, y, n(o.r, 26));
  }
};
const sobreLetras: Dibuja = (g, _p, o) => { texto(g, s(o.texto, ""), o.x, o.y, n(o.tam, 60), s(o.color, INK)); };
const foco: Dibuja = (g, _p, o, c) => {
  const gr = g.createRadialGradient(o.x, o.y, 20, o.x, o.y, n(o.r, 400)); const a = 0.5 + 0.1 * Math.sin(c.t * 3);
  gr.addColorStop(0, `rgba(255,236,170,${a})`); gr.addColorStop(1, "rgba(255,236,170,0)"); g.fillStyle = gr; g.fillRect(o.x - 800, o.y - 800, 1600, 1600);
};
const calendario: Dibuja = (g, p, o, c) => {
  // calendario de mesa: las hojas pasan de un año a otro
  const de = n(o.de, 1959), a = n(o.a, 2014), pr = entre(c, o.en, o.hastaCrece, n(o.dura, 4)), ano = Math.round(de + (a - de) * pr);
  const k = n(o.k, 1);
  g.save(); g.translate(o.x, o.y); g.scale(k, k);
  rect(p, -150, -200, 300, 240, "#fbf7ee", 5); rect(p, -150, -200, 300, 60, "#c0504a", 5);
  for (const x of [-80, 80]) p.ell(x, -200, 12, 20, "#9aa1a8", 3);
  gordo(g, `${ano}`, 0, -50, 96, INK, 2);
  const hoja = (c.t * 6) % 1;
  if (pr > 0 && pr < 1) { g.globalAlpha = 1 - hoja; forma(p, [[-150, -140], [150, -140], [150 - 40 * hoja, -140 - 200 * hoja], [-150, -140 - 160 * hoja]], "#ffffff", 3, 100); g.globalAlpha = 1; }
  g.restore();
};

export const OBJETOS: Record<string, Dibuja> = {
  carta, monton, cajafuerte, arbol, grafica, telefono, iconos, cesta, cartel, facturas, dinero, tacha, interroga,
  coche: cocheObj, tronco, pabellon, semilla, flecha, monedas, texto: sobreLetras, foco, calendario,
};
export const _uso = [cl, mix, os];
