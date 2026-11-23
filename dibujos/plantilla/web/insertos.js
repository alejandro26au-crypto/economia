// INSERTOS DE DATOS (traídos del motor de Zingo y redibujados en el estilo del kit: tinta gruesa, colores planos, rebote).
// Se dibujan en una tarjeta de efecto (lienzo 600x1000) mientras la voz canta la cifra. Solo si el guion la dice.
// Todas reciben (p, o) con p = Pen del kit y o = { v (valor actual), k (0-1 entrada con rebote), ...opciones }.
//   termometro: { min, max, unidad, etiqueta } · manometro: { min, max, unidad, etiqueta } · contador: { texto?, unidad, etiqueta, color }
//   reloj: { horas (decimal), texto? } · comparativa: { items: [{ etiqueta, valor, color }], unidad, etiqueta, t (0-1 crecen) }
//   barra: { min, max, unidad, etiqueta } · capas: { capas: [{ color, etiqueta }], t }
// En story.js: inserto('termometro', f, f0, f1, { de: 20, a: -2, unidad: '°', min: -10, max: 30 }) → { v, k } para pasar aquí.
const INK = '#241726';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const fmt = (v, dec = 0) => v.toFixed(dec).replace('-', '−');
const mixc = (a, b, t) => { const h = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const A = h(a), B = h(b); return `rgb(${A.map((x, i) => Math.round(x + (B[i] - x) * t)).join(',')})`; };
const rr = (g, x, y, w, h, r) => { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); };
const fillInk = (g, col, lw = 9) => { g.fillStyle = col; g.fill(); if (lw) { g.lineWidth = lw; g.strokeStyle = INK; g.lineJoin = 'round'; g.stroke(); } };
const txt = (g, s, x, y, size, col = INK, stroke = 0) => { g.font = `900 ${size}px Arial Black, DejaVu Sans, Arial`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  if (stroke) { g.lineWidth = stroke; g.strokeStyle = INK; g.strokeText(s, x, y); } g.fillStyle = col; g.fillText(s, x, y); };
/** panel crema con sombra y rebote (centro 300,500 del lienzo) */
const panel = (g, w, h, k) => { g.translate(300, 500); g.scale(k, k); rr(g, -w / 2 + 8, -h / 2 + 12, w, h, 40); g.fillStyle = 'rgba(0,0,0,.25)'; g.fill(); rr(g, -w / 2, -h / 2, w, h, 40); fillInk(g, '#fffcf4', 9); };

export function termometro(p, o) {
  const g = p.g; g.save(); panel(g, 520, 560, o.k);
  const lo = o.min ?? 0, hi = o.max ?? 100, f = clamp((o.v - lo) / (hi - lo)), x0 = -120, y0 = -210, H = 330, col = mixc('#4d9bff', '#f03a26', f);
  rr(g, x0 - 30, y0 - 10, 60, H + 30, 30); fillInk(g, '#ffffff', 8);
  rr(g, x0 - 16, y0 + H * (1 - f), 32, H * f + 26, 16); g.fillStyle = col; g.fill();
  g.beginPath(); g.arc(x0, y0 + H + 44, 50, 0, 7); fillInk(g, col, 8);
  for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(x0 + 36, y0 + i * H / 8); g.lineTo(x0 + 54, y0 + i * H / 8); g.lineWidth = 5; g.strokeStyle = INK; g.stroke(); }
  txt(g, fmt(o.v, o.dec) + (o.unidad || ''), 90, -20, 96, col, 12);
  if (o.etiqueta) txt(g, o.etiqueta, 90, 110, 40);
  g.restore();
}
export function manometro(p, o) {
  const g = p.g; g.save(); panel(g, 540, 560, o.k);
  const lo = o.min ?? 0, hi = o.max ?? 100, f = clamp((o.v - lo) / (hi - lo));
  g.beginPath(); g.arc(0, 10, 200, 0, 7); fillInk(g, '#f6f2e6', 10);
  g.beginPath(); g.arc(0, 10, 172, -Math.PI * 1.25 + Math.PI * 1.5 * 0.8, -Math.PI * 1.25 + Math.PI * 1.5); g.lineWidth = 18; g.strokeStyle = '#c4302b'; g.stroke();
  for (let i = 0; i <= 10; i++) { const a = -Math.PI * 1.25 + Math.PI * 1.5 * i / 10, r0 = i % 5 ? 160 : 140; g.beginPath(); g.moveTo(Math.cos(a) * r0, 10 + Math.sin(a) * r0); g.lineTo(Math.cos(a) * 186, 10 + Math.sin(a) * 186); g.lineWidth = 6; g.strokeStyle = INK; g.stroke(); }
  const a = -Math.PI * 1.25 + Math.PI * 1.5 * f; g.beginPath(); g.moveTo(0, 10); g.lineTo(Math.cos(a) * 150, 10 + Math.sin(a) * 150); g.lineWidth = 12; g.strokeStyle = '#d8261c'; g.lineCap = 'round'; g.stroke();
  g.beginPath(); g.arc(0, 10, 18, 0, 7); g.fillStyle = INK; g.fill();
  txt(g, fmt(o.v, o.dec) + (o.unidad ? ' ' + o.unidad : ''), 0, 140, 70);
  if (o.etiqueta) txt(g, o.etiqueta, 0, -225, 40);
  g.restore();
}
export function contador(p, o) {
  const g = p.g; g.save(); panel(g, 560, 300, o.k);
  const s = o.texto ?? fmt(o.v, o.dec) + (o.unidad ? ' ' + o.unidad : '');
  txt(g, s, 0, o.etiqueta ? 25 : 0, s.length < 7 ? 120 : 84, o.color || '#ffd23a', 16);
  if (o.etiqueta) txt(g, o.etiqueta, 0, -100, 40, '#5a5060');
  g.restore();
}
export function barra(p, o) {
  const g = p.g; g.save(); panel(g, 560, 340, o.k);
  const f = clamp((o.v - (o.min ?? 0)) / ((o.max ?? 100) - (o.min ?? 0)));
  txt(g, fmt(o.v, o.dec) + (o.unidad ? ' ' + o.unidad : ''), 0, -30, 90, '#ffd23a', 14);
  rr(g, -230, 70, 460, 40, 20); fillInk(g, '#e8e2d4', 6); rr(g, -230, 70, Math.max(40, 460 * f), 40, 20); fillInk(g, '#f0662a', 6);
  if (o.etiqueta) txt(g, o.etiqueta, 0, -120, 38, '#5a5060');
  g.restore();
}
export function reloj(p, o) {
  const g = p.g; g.save(); panel(g, 520, 600, o.k);
  g.beginPath(); g.arc(0, -20, 210, 0, 7); fillInk(g, '#fffdf2', 10);
  for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; g.beginPath(); g.moveTo(Math.sin(a) * 172, -20 - Math.cos(a) * 172); g.lineTo(Math.sin(a) * 194, -20 - Math.cos(a) * 194); g.lineWidth = 8; g.strokeStyle = INK; g.stroke(); }
  const h = o.v, ah = (h % 12) / 12 * Math.PI * 2, am = (h % 1) * Math.PI * 2; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, -20); g.lineTo(Math.sin(ah) * 105, -20 - Math.cos(ah) * 105); g.lineWidth = 16; g.strokeStyle = INK; g.stroke();
  g.beginPath(); g.moveTo(0, -20); g.lineTo(Math.sin(am) * 165, -20 - Math.cos(am) * 165); g.lineWidth = 9; g.strokeStyle = '#d8261c'; g.stroke();
  g.beginPath(); g.arc(0, -20, 14, 0, 7); g.fillStyle = INK; g.fill();
  txt(g, o.texto || `${Math.floor(h) % 24}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`, 0, 240, 60, '#ffffff', 12);
  g.restore();
}
export function comparativa(p, o) {
  const g = p.g; g.save(); panel(g, 580, 620, o.k);
  const items = o.items || [], n = items.length, mx = Math.max(...items.map((i) => i.valor)) || 1, t = o.t ?? 1;
  items.forEach((it, j) => { const x = n > 1 ? -190 + j * 380 / (n - 1) : 0, h = 340 * it.valor / mx * t;
    rr(g, x - 60, 200 - h, 120, h + 1, 16); fillInk(g, it.color || '#4d9bff', 8);
    txt(g, fmt(it.valor * t, o.dec) + (it.unidad ?? o.unidad ?? ''), x, 200 - h - 40, 50); txt(g, it.etiqueta || '', x, 250, 36, '#3a3040'); });
  if (o.etiqueta) txt(g, o.etiqueta, 0, -270, 38, '#5a5060');
  g.restore();
}
export function capas(p, o) {
  const g = p.g; g.save(); panel(g, 560, 560, o.k);
  const L = o.capas || [], n = L.length, t = o.t ?? 1;
  L.forEach((c, j) => { const r = 230 * (1 - j / (n + 0.4)) * (0.6 + 0.4 * t); g.beginPath(); g.arc(0, 0, r, 0, 7); fillInk(g, c.color, 8); });
  L.forEach((c, j) => { const r = 230 * (1 - j / (n + 0.4)); txt(g, c.etiqueta || '', 0, -r + 36, 36, '#ffffff', 9); });
  g.restore();
}
export const INSERTOS = { termometro, manometro, contador, barra, reloj, comparativa, capas };
