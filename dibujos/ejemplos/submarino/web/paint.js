// Canvas2D painted textures (our own). All deterministic.
import * as THREE from './lib/three.module.js';

export const rng = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
const cv = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; };
export const tex = (c, rx = 1, ry = 1) => {
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rx, ry);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
};
const hsl = (h, s, l, a = 1) => `hsla(${h},${s}%,${l}%,${a})`;
const speckle = (g, w, h, r, n, cols, rad = [1, 3]) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; g.beginPath(); g.ellipse(r() * w, r() * h, rad[0] + r() * rad[1], rad[0] + r() * rad[1] * 0.7, r() * 3, 0, 7); g.fill(); } };

export function planks(seed = 1, rot = 0) {
  const [c, g] = cv(512, 512), r = rng(seed), n = 8, w = 512 / n;
  for (let i = 0; i < n; i++) {
    const L = 52 + r() * 10, H = 30 + r() * 6;
    g.fillStyle = hsl(H, 42, L); g.fillRect(i * w, 0, w, 512);
    for (let k = 0; k < 14; k++) { g.strokeStyle = hsl(H - 4, 40, L - 10 - r() * 8, 0.5); g.lineWidth = 1 + r() * 2; g.beginPath(); const x = i * w + 4 + r() * (w - 8); g.moveTo(x, 0); g.bezierCurveTo(x + r() * 6 - 3, 170, x + r() * 6 - 3, 340, x + r() * 4 - 2, 512); g.stroke(); }
    const cut = r() * 512; g.fillStyle = 'rgba(40,24,14,.9)'; g.fillRect(i * w, cut, w, 4);
    for (const y of [cut - 18, cut + 18]) { g.fillStyle = '#2b2620'; g.beginPath(); g.arc(i * w + w * 0.3, y, 2.6, 0, 7); g.arc(i * w + w * 0.7, y, 2.6, 0, 7); g.fill(); }
    g.fillStyle = 'rgba(30,18,10,.95)'; g.fillRect(i * w, 0, 3, 512);
    if (r() < 0.5) { g.fillStyle = hsl(H, 40, L - 16, .8); g.beginPath(); g.ellipse(i * w + w / 2, r() * 512, 5, 9, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function beam(seed = 2, base = [30, 40, 40]) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 256, 512);
  for (let k = 0; k < 40; k++) { g.strokeStyle = hsl(base[0] - 3, base[1], base[2] - 8 - r() * 10, .45); g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 8, 170, x - 8, 340, x + r() * 10 - 5, 512); g.stroke(); }
  return c;
}
/** rotting pile: wet dark lower part, moss, rot holes, pale fungus streaks */
export function rotten(seed = 3) {
  const [c, g] = cv(256, 1024), r = rng(seed);
  const gr = g.createLinearGradient(0, 0, 0, 1024); gr.addColorStop(0, '#6b4a2e'); gr.addColorStop(0.45, '#4f3722'); gr.addColorStop(0.8, '#33281c'); gr.addColorStop(1, '#22231a');
  g.fillStyle = gr; g.fillRect(0, 0, 256, 1024);
  for (let k = 0; k < 50; k++) { g.strokeStyle = `rgba(20,12,6,${.3 + r() * .4})`; g.lineWidth = 1 + r() * 3; g.beginPath(); const x = r() * 256; g.moveTo(x, 0); g.bezierCurveTo(x + 10, 300, x - 10, 700, x + r() * 10 - 5, 1024); g.stroke(); }
  // moss bands near the water line and patches
  for (let i = 0; i < 260; i++) { const y = 650 + Math.pow(r(), 0.6) * 374; g.fillStyle = hsl(85 + r() * 25, 45, 26 + r() * 14, .85); g.beginPath(); g.ellipse(r() * 256, y, 4 + r() * 12, 3 + r() * 6, 0, 0, 7); g.fill(); }
  for (let i = 0; i < 70; i++) { g.fillStyle = hsl(95, 40, 30 + r() * 10, .8); g.beginPath(); g.ellipse(r() * 256, r() * 650, 3 + r() * 8, 2 + r() * 5, 0, 0, 7); g.fill(); }
  // rot holes with cracks
  for (let i = 0; i < 9; i++) {
    const x = r() * 256, y = 200 + r() * 760, w = 10 + r() * 26, h = 18 + r() * 50;
    g.fillStyle = '#120c08'; g.beginPath(); g.ellipse(x, y, w, h, 0, 0, 7); g.fill();
    g.strokeStyle = '#8a6a48'; g.lineWidth = 3; g.beginPath(); g.ellipse(x - 2, y - 2, w, h, 0, 3.6, 5.6); g.stroke();
    g.strokeStyle = '#120c08'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x, y - h); g.lineTo(x + 6, y - h - 40 - r() * 60); g.moveTo(x, y + h); g.lineTo(x - 5, y + h + 30 + r() * 50); g.stroke();
  }
  // pale fungus spots
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(226,214,180,${.5 + r() * .4})`; g.beginPath(); g.ellipse(r() * 256, 150 + r() * 700, 2 + r() * 4, 2 + r() * 3, 0, 0, 7); g.fill(); }
  return c;
}
export function stone(seed = 4, hue = 36, sat = 14, lig = 66, bw = 128, bh = 64) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#4a4238'; g.fillRect(0, 0, 512, 512);
  for (let row = 0; row < 512 / bh; row++) for (let col = -1; col < 512 / bw + 1; col++) {
    const x = col * bw + (row % 2) * bw / 2, y = row * bh, L = lig - 6 + r() * 12;
    g.fillStyle = hsl(hue + r() * 8 - 4, sat, L); g.beginPath(); g.roundRect(x + 3, y + 3, bw - 6, bh - 6, 6); g.fill();
    g.fillStyle = hsl(hue, sat, L + 7, .6); g.fillRect(x + 6, y + 5, bw - 14, 5);
    g.fillStyle = hsl(hue, sat, L - 12, .5); g.fillRect(x + 6, y + bh - 10, bw - 12, 5);
    speckle(g, 0, 0, r, 0, ['#000']);
    for (let k = 0; k < 6; k++) { g.fillStyle = hsl(hue, sat, L - 8 - r() * 8, .6); g.beginPath(); g.ellipse(x + r() * bw, y + r() * bh, 2 + r() * 5, 1 + r() * 3, 0, 0, 7); g.fill(); }
  }
  return c;
}
export function mossy(c0, seed = 5, amt = 1) {
  const [c, g] = cv(c0.width, c0.height), r = rng(seed); g.drawImage(c0, 0, 0);
  for (let i = 0; i < 500 * amt; i++) { const y = c.height * (0.4 + 0.6 * Math.pow(r(), 0.5)); g.fillStyle = hsl(90 + r() * 30, 40, 28 + r() * 16, .85); g.beginPath(); g.ellipse(r() * c.width, y, 4 + r() * 10, 3 + r() * 6, 0, 0, 7); g.fill(); }
  // ivy strands with leaves
  for (let s = 0; s < 8 * amt; s++) {
    let x = r() * c.width, y = c.height;
    for (let k = 0; k < 40; k++) { x += (r() - 0.5) * 18; y -= 8 + r() * 6; g.fillStyle = hsl(100 + r() * 20, 45, 30 + r() * 15); g.beginPath(); g.ellipse(x, y, 7, 5, r() * 3, 0, 7); g.fill(); g.strokeStyle = '#1d2b14'; g.lineWidth = 1.5; g.stroke(); }
  }
  return c;
}
export function grass(seed = 6) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#6fa04a'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 90; i++) { g.fillStyle = hsl(85 + r() * 20, 42, 38 + r() * 14, .5); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 12 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 1400; i++) { const x = r() * 512, y = r() * 512; g.strokeStyle = hsl(80 + r() * 30, 45, 30 + r() * 25, .9); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + r() * 4 - 2, y - 5 - r() * 7); g.stroke(); }
  for (let i = 0; i < 30; i++) { g.fillStyle = ['#f3e27a', '#ffffff', '#e8a0c0'][i % 3]; g.beginPath(); g.arc(r() * 512, r() * 512, 2.5, 0, 7); g.fill(); }
  return c;
}
export function dirt(seed = 7) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#a88a62'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 300; i++) { g.fillStyle = hsl(30 + r() * 10, 25, 40 + r() * 25, .6); g.beginPath(); g.ellipse(r() * 512, r() * 512, 3 + r() * 14, 2 + r() * 8, r() * 3, 0, 7); g.fill(); }
  return c;
}
export function plaster(seed = 8, hue = 40) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = hsl(hue, 40, 86); g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 40; i++) { g.fillStyle = hsl(hue, 30, 76 + r() * 8, .5); g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 6 + r() * 16, 0, 0, 7); g.fill(); }
  g.fillStyle = hsl(hue, 20, 60, .5); g.fillRect(0, 236, 256, 20);
  return c;
}
export function roof(seed = 9) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#7b2e1c'; g.fillRect(0, 0, 256, 256);
  for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
    const x = col * 32 + (row % 2) * 16, y = row * 32; g.fillStyle = hsl(12 + r() * 8, 58, 42 + r() * 10);
    g.beginPath(); g.ellipse(x + 16, y + 16, 14, 17, 0, 0, Math.PI); g.lineTo(x + 2, y); g.fill();
    g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(x + 6, y + 2, 5, 22);
  }
  return c;
}
export function marble(seed = 10) {
  const [c, g] = cv(256, 512), r = rng(seed);
  g.fillStyle = '#efe7d6'; g.fillRect(0, 0, 256, 512);
  for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(160,140,110,.25)'; g.fillRect(i * 32 + 2, 0, 6, 512); }
  for (let k = 0; k < 10; k++) { g.strokeStyle = 'rgba(150,140,130,.35)'; g.lineWidth = 1.5; g.beginPath(); let x = r() * 256, y = 0; g.moveTo(x, y); while (y < 512) { x += r() * 30 - 15; y += 20 + r() * 30; g.lineTo(x, y); } g.stroke(); }
  return c;
}
export function banner() {
  const [c, g] = cv(256, 512);
  g.fillStyle = '#b8282b'; g.fillRect(0, 0, 256, 512);
  g.fillStyle = '#8a1c22'; for (let i = 0; i < 5; i++) g.fillRect(20 + i * 50, 0, 12, 512);
  g.strokeStyle = '#e6b84a'; g.lineWidth = 12; g.strokeRect(14, 14, 228, 484);
  g.fillStyle = '#e6b84a'; g.font = 'bold 66px DejaVu Serif, serif'; g.textAlign = 'center'; g.fillText('SPQR', 128, 300);
  g.lineWidth = 9; g.beginPath(); g.arc(128, 180, 60, 0.4, Math.PI - 0.4, true); g.stroke();
  for (let i = 0; i < 9; i++) { const a = Math.PI + 0.35 + i * 0.3; g.beginPath(); g.ellipse(128 + Math.cos(a) * 60, 180 - Math.sin(a) * 60 * -1, 10, 5, a, 0, 7); g.fill(); }
  for (let i = 0; i < 9; i++) { g.beginPath(); g.moveTo(i * 32, 512); g.lineTo(i * 32 + 16, 470); g.lineTo(i * 32 + 32, 512); g.fillStyle = '#000'; g.globalCompositeOperation = 'destination-out'; g.fill(); g.globalCompositeOperation = 'source-over'; }
  return c;
}
/** interior of the helmet, planar-mapped: rusty iron + the carved message */
export function helmetInside(reveal = 1) {
  const [c, g] = cv(1024, 1024), r = rng(77);
  const gr = g.createRadialGradient(512, 512, 40, 512, 512, 520); gr.addColorStop(0, '#6d675e'); gr.addColorStop(0.7, '#575148'); gr.addColorStop(1, '#3a352f');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 220; i++) { g.fillStyle = hsl(22 + r() * 12, 55, 28 + r() * 16, .35 + r() * .4); g.beginPath(); g.ellipse(r() * 1024, r() * 1024, 4 + r() * 26, 3 + r() * 14, r() * 3, 0, 7); g.fill(); }
  for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(30,26,22,${.2 + r() * .3})`; g.lineWidth = 1 + r() * 2; g.beginPath(); const x = r() * 1024, y = r() * 1024; g.moveTo(x, y); g.lineTo(x + r() * 60 - 30, y + r() * 60 - 30); g.stroke(); }
  const lines = ['THE BRIDGE', 'IS NOT', 'SAFE'], ys = [400, 530, 670], sz = [104, 112, 150];
  g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((t, li) => {
    g.font = `bold ${sz[li]}px DejaVu Serif, serif`;
    const w = g.measureText(t).width; let x = 512 - w / 2;
    for (const ch of t) {
      const cw = g.measureText(ch).width, a = (r() - 0.5) * 0.12, dy = (r() - 0.5) * 10;
      g.save(); g.translate(x + cw / 2, ys[li] + dy); g.rotate(a);
      g.fillStyle = '#d6cdbd'; g.fillText(ch, 3, 4);       // lit lower lip of the groove
      g.fillStyle = '#16120f'; g.fillText(ch, 0, 0);       // groove
      g.fillStyle = 'rgba(70,60,50,.9)'; g.fillText(ch, -2, -3);
      g.restore(); x += cw;
    }
  });
  // scratch-out flourish under the words
  g.strokeStyle = '#16120f'; g.lineWidth = 7; g.beginPath(); g.moveTo(330, 765); g.lineTo(700, 760); g.stroke();
  g.strokeStyle = '#cbbfa9'; g.lineWidth = 3; g.beginPath(); g.moveTo(332, 772); g.lineTo(702, 767); g.stroke();
  return c;
}
export function radial(col = '0,0,0', a = 0.55) {
  const [c, g] = cv(128, 128), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(0.55, `rgba(${col},${a * 0.6})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128); return c;
}

// ================= SUBMARINO (texturas pintadas nuevas, mismo estilo que las del kit) =================
/** chapa pintada del casco por dentro: paneles con remaches, roces y manchas de óxido */
export function hullPaint(seed = 50, hue = 48, sat = 30, lig = 80) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(hue, sat, lig); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 60; i++) { g.fillStyle = hsl(hue + r() * 8 - 4, sat - 6, lig - 4 - r() * 8, .45); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 50, 10 + r() * 30, r() * 3, 0, 7); g.fill(); }
  for (const y of [0, 256]) { g.fillStyle = hsl(hue, sat - 10, lig - 22, .9); g.fillRect(0, y, 512, 4); g.fillStyle = hsl(hue, sat, lig + 8, .8); g.fillRect(0, y + 4, 512, 3); }
  for (const x of [0, 256]) { g.fillStyle = hsl(hue, sat - 10, lig - 22, .9); g.fillRect(x, 0, 4, 512); }
  for (const y of [14, 242, 270, 498]) for (let x = 12; x < 512; x += 24) { g.fillStyle = hsl(hue, sat - 12, lig - 30); g.beginPath(); g.arc(x, y, 3.4, 0, 7); g.fill(); g.fillStyle = hsl(hue, sat, lig + 12); g.beginPath(); g.arc(x - 1, y - 1, 1.4, 0, 7); g.fill(); }
  for (let i = 0; i < 14; i++) { const x = r() * 512, y = r() * 512; const gr = g.createLinearGradient(x, y, x, y + 40 + r() * 60); gr.addColorStop(0, 'rgba(150,80,30,.55)'); gr.addColorStop(1, 'rgba(150,80,30,0)'); g.fillStyle = gr; g.fillRect(x, y, 2 + r() * 4, 100); }
  return c;
}
/** suelo de chapa estriada (diamond plate) con desgaste */
export function deckPlate(seed = 51) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = '#6d7276'; g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(${r() < .5 ? '40,44,48' : '150,156,160'},.25)`; g.beginPath(); g.ellipse(r() * 512, r() * 512, 30 + r() * 60, 20 + r() * 40, r() * 3, 0, 7); g.fill(); }
  for (let y = 0; y < 512; y += 32) for (let x = (y / 32) % 2 * 16; x < 512; x += 32) {
    g.save(); g.translate(x, y); g.rotate(((x + y) / 32) % 2 ? 0.7 : -0.7);
    g.fillStyle = '#4c5155'; g.fillRect(-9, -3, 18, 6); g.fillStyle = '#a3a9ad'; g.fillRect(-9, -3, 18, 2); g.restore();
  }
  g.fillStyle = '#2b2f33'; g.fillRect(0, 0, 512, 5); g.fillRect(0, 0, 5, 512);
  return c;
}
/** colchón de rayas (ticking) */
export function ticking(seed = 52) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#efe9da'; g.fillRect(0, 0, 256, 256);
  for (let x = 0; x < 256; x += 32) { g.fillStyle = '#3d5c8c'; g.fillRect(x + 4, 0, 7, 256); g.fillStyle = '#7d96bc'; g.fillRect(x + 16, 0, 3, 256); }
  for (let i = 0; i < 30; i++) { g.fillStyle = 'rgba(160,140,100,.18)'; g.beginPath(); g.ellipse(r() * 256, r() * 256, 10 + r() * 30, 8 + r() * 20, 0, 0, 7); g.fill(); }
  return c;
}
/** manta de lana de la Marina con raya */
export function blanket(seed = 53, base = '#5b6f4a') {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(${r() < .5 ? '0,0,0' : '255,255,255'},.07)`; g.fillRect(r() * 256, r() * 256, 2 + r() * 4, 1 + r() * 2); }
  g.fillStyle = 'rgba(240,230,200,.8)'; g.fillRect(0, 196, 256, 10); g.fillRect(0, 212, 256, 4);
  return c;
}
/** esfera de manómetro: números grandes y rótulo */
export function dial(label = 'FEET', max = 400, step = 50, red = 0.82, face = '#f4ecd6') {
  const [c, g] = cv(512, 512);
  g.fillStyle = '#2a2420'; g.beginPath(); g.arc(256, 256, 256, 0, 7); g.fill();
  g.fillStyle = face; g.beginPath(); g.arc(256, 256, 236, 0, 7); g.fill();
  const A0 = Math.PI * 0.75, A1 = Math.PI * 2.25;
  g.strokeStyle = '#c4302b'; g.lineWidth = 26; g.beginPath(); g.arc(256, 256, 196, A0 + (A1 - A0) * red, A1); g.stroke();
  g.fillStyle = '#1e1a18'; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let v = 0; v <= max; v += step / 5) {
    const a = A0 + (A1 - A0) * v / max, big = v % step === 0;
    g.strokeStyle = '#1e1a18'; g.lineWidth = big ? 7 : 3; g.beginPath(); g.moveTo(256 + Math.cos(a) * (big ? 168 : 186), 256 + Math.sin(a) * (big ? 168 : 186)); g.lineTo(256 + Math.cos(a) * 210, 256 + Math.sin(a) * 210); g.stroke();
    if (big && v % (step * 2) === 0) { g.font = 'bold 50px DejaVu Sans, Arial'; g.fillText(String(v), 256 + Math.cos(a) * 128, 256 + Math.sin(a) * 128); }
  }
  g.font = 'bold 44px DejaVu Sans, Arial'; g.fillText(label, 256, 370);
  return c;
}
/** batería: tapas de celdas con bornes */
export function battery(seed = 54) {
  const [c, g] = cv(256, 256), r = rng(seed);
  g.fillStyle = '#1d1f22'; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 256; y += 64) for (let x = 0; x < 256; x += 64) {
    g.fillStyle = '#5a5f66'; g.fillRect(x + 4, y + 4, 56, 56); g.fillStyle = '#7a8088'; g.fillRect(x + 4, y + 4, 56, 8);
    g.fillStyle = '#c9a24a'; g.beginPath(); g.arc(x + 20, y + 32, 7, 0, 7); g.arc(x + 44, y + 32, 7, 0, 7); g.fill();
    g.fillStyle = '#c4302b'; g.beginPath(); g.arc(x + 20, y + 32, 3, 0, 7); g.fill();
  }
  return c;
}
/** gradiente vertical para rayos de luz y brillos */
export function shaft(col = '200,240,255') {
  const [c, g] = cv(64, 256), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, `rgba(${col},.55)`); gr.addColorStop(1, `rgba(${col},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 256);
  const gx = g.createLinearGradient(0, 0, 64, 0); gx.addColorStop(0, 'rgba(0,0,0,1)'); gx.addColorStop(.5, 'rgba(0,0,0,0)'); gx.addColorStop(1, 'rgba(0,0,0,1)');
  g.globalCompositeOperation = 'destination-out'; g.fillStyle = gx; g.fillRect(0, 0, 64, 256);
  return c;
}
/** casco exterior: chapa oscura con remaches y línea de flotación */
export function hullOut(seed = 55, base = [210, 8, 26]) {
  const [c, g] = cv(512, 512), r = rng(seed);
  g.fillStyle = hsl(base[0], base[1], base[2]); g.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 80; i++) { g.fillStyle = hsl(base[0], base[1], base[2] + (r() - .5) * 10, .4); g.beginPath(); g.ellipse(r() * 512, r() * 512, 20 + r() * 60, 8 + r() * 20, 0, 0, 7); g.fill(); }
  for (let x = 0; x < 512; x += 128) { g.fillStyle = hsl(base[0], base[1], base[2] - 10); g.fillRect(x, 0, 3, 512); for (let y = 8; y < 512; y += 20) { g.fillStyle = hsl(base[0], base[1], base[2] + 14); g.beginPath(); g.arc(x + 8, y, 2.4, 0, 7); g.fill(); } }
  for (let i = 0; i < 10; i++) { g.fillStyle = 'rgba(150,90,50,.35)'; g.fillRect(r() * 512, r() * 512, 3 + r() * 5, 40 + r() * 60); }
  return c;
}
