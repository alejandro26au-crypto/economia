// ---------- world: VÍDEO 2 «Cómo gana el banco con tu tarjeta» — DECORADO A MEDIDA DEL GUION ----------
// Lo que nombra el guion: la TIENDA (donde pagas con tarjeta), tu BANCO, los PRECIOS, la tarjeta y el efectivo.
// A) DENTRO DE LA TIENDA (x≈0): baldosas, estanterías con productos y etiquetas de precio, la CAJA con el datáfono,
//    la tarjeta, billetes y monedas, y la PIZARRA DE PRECIOS de la tienda colgada en la pared (dibuja cada frase).
// B) LA CALLE (x≈60): la fachada de la tienda con toldo y, enfrente, el BANCO con columnas; adoquines, farolas, árboles.
const DECK = 0;
const M = {
  plank: texM(P.planks(1), 1, 6), beam: texM(P.beam(2), 1, 2), beamDark: texM(P.beam(3, [28, 36, 30]), 1, 2),
  stone: texM(P.stone(4), 1, 1), cobble: texM(P.stone(23, 30, 12, 58, 64, 64), 1, 1),
  grass: texM(P.grass(6), 40, 40), plaster: texM(P.plaster(8), 1, 1), plaster2: texM(P.plaster(18, 28), 1, 1),
  roof: texM(P.roof(9), 2, 2), marble: texM(P.marble(10), 1, 1), marbleTop: toon({ color: '#ece2cf' }),
  trunk: toon({ color: '#6a4a32' }), cypress: toon({ color: '#3f6b36' }), pine: toon({ color: '#5c8a3c' }), bush: toon({ color: '#6c9a42' }),
  hill: toon({ color: '#7aa64c' }), hillFar: toon({ color: '#86ad60' }), mount: toon({ color: '#8fa7b8' }), snow: toon({ color: '#f4f6fa' }),
  iron: toon({ color: '#3a3836' }), wood: toon({ color: '#7a5434' }), door: toon({ color: '#5a3a24' }), window: toon({ color: '#2b2430' }),
  glass: toon({ color: '#bfe0f2', emissive: new THREE.Color('#9fd0ee'), emissiveIntensity: 0.45 }), gold: toon({ color: '#e2b544' }),
  shelf: toon({ color: '#e9e2d2' }), green: toon({ color: '#3f6b5a' }), red: toon({ color: '#b8282b' }), dark: toon({ color: '#2b2f36' }),
};
const world = new THREE.Group(); scene.add(world);
const clouds = [];
// ---- suelo de baldosas de la tienda (ajedrezado pintado, con grano de piedra) ----
const baldosa = (() => { const c = document.createElement('canvas'); c.width = c.height = 256; const g = c.getContext('2d'); const r = P.rng(31);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { g.fillStyle = (i + j) % 2 ? '#e8dcc4' : '#b8573e'; g.fillRect(i * 64, j * 64, 64, 64);
    for (let k = 0; k < 30; k++) { g.fillStyle = `rgba(0,0,0,${0.02 + r() * 0.04})`; g.fillRect(i * 64 + r() * 64, j * 64 + r() * 64, 2 + r() * 4, 2 + r() * 4); } }
  g.strokeStyle = 'rgba(60,40,30,0.35)'; g.lineWidth = 2; for (let i = 0; i <= 4; i++) { g.beginPath(); g.moveTo(i * 64, 0); g.lineTo(i * 64, 256); g.moveTo(0, i * 64); g.lineTo(256, i * 64); g.stroke(); }
  return c; })();
const RW = 5.5, RB = -2.4, RF = 6, RH = 4.0;
add(tbox(RW * 2, 0.2, RF - RB, 1), texM(baldosa, 1, 1), 0, -0.1, (RF + RB) / 2, world, { cast: false });
// paredes de yeso con zócalo de madera; ventana grande a la izquierda (la calle con sol)
const yeso = texM(P.plaster(8, 36), 1, 1, '#f3e2c2');
add(tbox(RW * 2, RH, 0.2, 2.2), yeso, 0, RH / 2, RB - 0.1, world, { cast: false });
add(tbox(0.2, RH, RF - RB, 2.2), yeso, RW + 0.1, RH / 2, (RF + RB) / 2, world, { cast: false });
for (const [z0, z1] of [[RB, -0.6], [2.4, RF]]) add(tbox(0.2, RH, z1 - z0, 2.2), yeso, -RW - 0.1, RH / 2, (z0 + z1) / 2, world, { cast: false });
add(tbox(0.2, 1.0, 3.0, 2.2), yeso, -RW - 0.1, 0.5, 0.9, world, { cast: false }); add(tbox(0.2, 0.8, 3.0, 2.2), yeso, -RW - 0.1, RH - 0.4, 0.9, world, { cast: false });
add(tbox(0.06, 2.2, 3.0, 1), M.glass, -RW - 0.05, 2.1, 0.9, world, { cast: false });
for (const z of [-0.55, 0.9, 2.35]) add(tbox(0.12, 2.3, 0.1, 1), M.wood, -RW + 0.02, 2.1, z, world);
add(tbox(RW * 2, 0.9, 0.06, 1.2), M.beam, 0, 0.45, RB + 0.03, world, { cast: false });
add(tbox(0.06, 0.9, RF - RB, 1.2), M.beam, RW - 0.03, 0.45, (RF + RB) / 2, world, { cast: false });
// lámparas colgantes de latón
for (const x of [-2.6, 0.6, 3.4]) { add(new THREE.CylinderGeometry(0.01, 0.01, 1.0, 4), M.iron, x, RH - 0.5, 0.4, world); add(new THREE.ConeGeometry(0.28, 0.24, 18, 1, true), M.gold, x, RH - 1.05, 0.4, world); add(new THREE.SphereGeometry(0.08, 10, 8), toon({ color: '#fff4c8', emissive: new THREE.Color('#ffe9a0'), emissiveIntensity: 1 }), x, RH - 1.14, 0.4, world); }
// estanterías con productos: cajas, botes, botellas y latas de colores, cada balda con sus etiquetas de precio
const productos = ['#c8392e', '#2f6fa8', '#e8b830', '#3f8a4a', '#d9832f', '#7b5ac9', '#f4f1ea', '#c25a7a'];
const estante = (x, z, rot, seed) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; world.add(g); const r = P.rng(seed);
  add(tbox(1.9, 2.4, 0.06, 1), M.shelf, 0, 1.2, -0.25, g); for (const sx of [-0.95, 0.95]) add(tbox(0.06, 2.4, 0.5, 1), M.shelf, sx, 1.2, 0, g); add(tbox(1.96, 0.08, 0.52, 1), M.shelf, 0, 2.42, 0, g); 
  for (let b = 0; b < 4; b++) { const y = 0.3 + b * 0.55; add(tbox(1.86, 0.04, 0.5, 1), M.beam, 0, y, 0.02, g);
    let px = -0.85; while (px < 0.8) { const tipo = r(), col = productos[(r() * 8) | 0], w = 0.12 + r() * 0.1;
      if (tipo < 0.4) add(tbox(w, 0.22 + r() * 0.12, 0.2, 1), toon({ color: col }), px + w / 2, y + 0.15, 0.05, g);
      else if (tipo < 0.7) { add(new THREE.CylinderGeometry(w * 0.4, w * 0.4, 0.2, 12), toon({ color: col }), px + w / 2, y + 0.12, 0.05, g); add(new THREE.CylinderGeometry(w * 0.41, w * 0.41, 0.04, 12), toon({ color: '#f4f1ea' }), px + w / 2, y + 0.12, 0.05, g); }
      else { add(new THREE.CylinderGeometry(0.035, 0.055, 0.3, 10), toon({ color: col }), px + 0.06, y + 0.17, 0.05, g); add(new THREE.CylinderGeometry(0.02, 0.02, 0.06, 6), toon({ color: '#2b2430' }), px + 0.06, y + 0.35, 0.05, g); }
      px += w + 0.03; }
    for (let k = 0; k < 3; k++) add(box(0.14, 0.06, 0.01), toon({ color: k % 2 ? '#f2d23a' : '#ffffff' }), -0.6 + k * 0.6, y - 0.03, 0.28, g, { cast: false }); }
  return g; };
estante(-3.6, RB + 0.35, 0, 5); estante(-1.5, RB + 0.35, 0, 8); estante(0.6, RB + 0.35, 0, 9); estante(-RW + 0.35, 4.2, Math.PI / 2, 6); estante(RW - 0.35, 3.6, -Math.PI / 2, 7);
// fruta en cajas junto a la ventana
for (let i = 0; i < 3; i++) { const x = -4.6, z = -0.2 + i * 0.7; add(tbox(0.55, 0.5, 0.6, 1), M.plank, x, 0.25, z, world); const col = ['#f08a24', '#c8302a', '#f2d23a'][i]; const r = P.rng(40 + i);
  for (let k = 0; k < 9; k++) add(new THREE.SphereGeometry(0.075, 10, 8), toon({ color: col }), x - 0.17 + (k % 3) * 0.17, 0.55 + r() * 0.04, z - 0.18 + Math.floor(k / 3) * 0.18, world); }
// LA CAJA: mostrador con cinta, caja registradora, el DATÁFONO, la tarjeta dorada, un billete y monedas
const mesa = new THREE.Group(); mesa.position.set(3.1, 0, -0.9); mesa.rotation.y = -0.5; world.add(mesa);
add(tbox(2.2, 0.95, 0.75, 1), M.beam, 0, 0.475, 0, mesa); add(tbox(2.3, 0.06, 0.85, 1), M.marbleTop, 0, 0.98, 0, mesa);
add(box(1.2, 0.02, 0.5), M.dark, -0.4, 1.02, 0, mesa, { cast: false });
const caja = new THREE.Group(); caja.position.set(0.55, 1.01, -0.15); mesa.add(caja);
add(tbox(0.46, 0.22, 0.4, 1), M.green, 0, 0.11, 0, caja); add(tbox(0.3, 0.16, 0.06, 1), M.dark, 0, 0.32, -0.12, caja);
add(box(0.22, 0.1, 0.01), toon({ color: '#7fd88a', emissive: new THREE.Color('#3fae58'), emissiveIntensity: 0.6 }), 0, 0.33, -0.088, caja, { cast: false });
const dat = new THREE.Group(); dat.position.set(0.85, 1.01, 0.22); dat.rotation.set(-0.35, 0.3, 0); mesa.add(dat);
add(tbox(0.16, 0.05, 0.26, 1), M.dark, 0, 0.025, 0, dat);
add(box(0.12, 0.006, 0.08), toon({ color: '#7fd88a', emissive: new THREE.Color('#3fae58'), emissiveIntensity: 0.6 }), 0, 0.053, -0.07, dat, { cast: false });
for (let i = 0; i < 9; i++) add(box(0.028, 0.008, 0.022), toon({ color: '#e8e4da' }), -0.035 + (i % 3) * 0.035, 0.054, 0.02 + Math.floor(i / 3) * 0.032, dat, { cast: false });
const tarjeta = add(box(0.17, 0.006, 0.11), M.gold, 0.55, 1.02, 0.28, mesa); tarjeta.rotation.y = 0.4;
add(box(0.04, 0.008, 0.03), toon({ color: '#c9c4bd' }), 0.53, 1.025, 0.27, mesa, { cast: false });
add(box(0.2, 0.004, 0.1), toon({ color: '#8fcf8f' }), 0.1, 1.015, 0.25, mesa).rotation.y = -0.3;
for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 12), M.gold, -0.1 + i * 0.05, 1.015 + (i % 2) * 0.01, 0.3, mesa);
mesa.userData.lona = new THREE.Object3D();

// ---- B) LA CALLE: la tienda y, enfrente, el banco (x ≈ 60) ----
const CX = 60, calle = new THREE.Group(); calle.position.set(CX, 0, 0); world.add(calle);
add(tbox(40, 0.2, 40, 1.4), M.cobble, 0, -0.1, -6, calle, { cast: false });
add(tbox(40, 0.18, 2.6, 1), M.stone, 0, 0.09, -4.3, calle, { cast: false }); add(tbox(40, 0.18, 2.6, 1), M.stone, 0, 0.09, 4.3, calle, { cast: false }); // aceras
// fachada de la TIENDA (lado izquierdo de la calle, z<0): escaparate, puerta, toldo de rayas, cajas de fruta en la puerta
const tf = new THREE.Group(); tf.position.set(-4, 0, -6); calle.add(tf);
add(tbox(7, 6, 3, 2.2), M.plaster2, 0, 3, -1.5, tf); const rf = add(tbox(7.6, 0.4, 3.6, 2), M.roof, 0, 6.15, -1.4, tf);
add(tbox(3.2, 2.0, 0.08, 1), M.glass, -1.5, 1.6, 0.02, tf, { cast: false }); add(tbox(1.2, 2.3, 0.1, 1), M.door, 1.9, 1.15, 0.02, tf, { cast: false });
{ const c = document.createElement('canvas'); c.width = 512; c.height = 64; const g = c.getContext('2d'); for (let i = 0; i < 12; i++) { g.fillStyle = i % 2 ? '#f3e7cc' : '#2f6fa8'; g.fillRect(i * 43, 0, 43, 64); }
  const lona = add(box(6.6, 0.06, 1.6), toon({ map: P.tex(c) }), 0, 3.1, 0.7, tf); lona.rotation.x = 0.35; }
for (let i = 0; i < 3; i++) { add(tbox(0.6, 0.45, 0.5, 1), M.plank, -2.6 + i * 0.7, 0.4, 0.6, tf); const r = P.rng(60 + i); for (let k = 0; k < 6; k++) add(new THREE.SphereGeometry(0.08, 8, 6), toon({ color: ['#f08a24', '#c8302a', '#f2d23a'][i] }), -2.75 + i * 0.7 + (k % 3) * 0.15, 0.7 + r() * 0.03, 0.5 + Math.floor(k / 3) * 0.18, tf); }
// el BANCO (enfrente, z>0): escalinata, columnas, frontón, puerta de bronce
const bk = new THREE.Group(); bk.position.set(3.5, 0, 7.5); bk.rotation.y = Math.PI; calle.add(bk);
add(tbox(10, 7.5, 4, 2.2), M.marble, 0, 3.75 + 0.6, -2, bk);
for (let i = 0; i < 3; i++) add(tbox(10.4 - i * 0.4, 0.2, 1.6 - i * 0.4, 1), M.stone, 0, 0.1 + i * 0.2, 0.9 - i * 0.2, bk);
const colG = new THREE.CylinderGeometry(0.32, 0.36, 5.6, 14); colG.translate(0, 2.8, 0);
for (let i = 0; i < 6; i++) add(colG, M.marble, -3.75 + i * 1.5, 0.6, 0.45, bk);
add(tbox(9.4, 0.7, 1.1, 2), M.marbleTop, 0, 6.55, 0.4, bk);
{ const sh = new THREE.Shape(); sh.moveTo(-4.9, 0); sh.lineTo(4.9, 0); sh.lineTo(0, 1.9); sh.closePath(); add(new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: false }), M.marbleTop, 0, 6.9, -0.1, bk); }
add(tbox(1.6, 2.8, 0.1, 1), toon({ color: '#b08a4a' }), 0, 2.0, 0.02, bk, { cast: false });
add(new THREE.CylinderGeometry(0.35, 0.35, 0.06, 20), M.gold, 0, 7.6, 0.95, bk).rotation.x = Math.PI / 2;
// letreros con la palabra que dice el guion: «BANCO» y «TIENDA» (pintados como el resto: tinta y colores planos)
const letrero = (txt, w, h, fondo, tinta) => { const c = document.createElement('canvas'); c.width = 1024; c.height = Math.round(1024 * h / w); const g = c.getContext('2d');
  g.fillStyle = fondo; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#241726'; g.lineWidth = 18; g.strokeRect(9, 9, c.width - 18, c.height - 18);
  g.font = `bold ${c.height * 0.62}px "DejaVu Serif", serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = tinta; g.fillText(txt, c.width / 2, c.height * 0.54);
  return toon({ map: P.tex(c) }); };
add(new THREE.PlaneGeometry(5.2, 0.9), letrero('BANCO', 5.2, 0.9, '#ece2cf', '#3a2a1e'), 0, 6.55, 0.97, bk, { cast: false });
add(new THREE.PlaneGeometry(4.2, 0.8), letrero('TIENDA', 4.2, 0.8, '#2f6fa8', '#f3e7cc'), 0, 4.2, 0.03, tf, { cast: false });
// farolas, árboles, casas al fondo de la calle, colinas, montañas y nubes (kit)
for (const [x, z] of [[-14, -4.6], [-2, -4.6], [10, -4.6], [-8, 4.6], [4, 4.6]]) { add(new THREE.CylinderGeometry(0.06, 0.08, 4, 8), M.iron, x, 2, z, calle); add(new THREE.SphereGeometry(0.22, 10, 8), toon({ color: '#fff4c8' }), x, 4.1, z, calle); }
const house = (x, z, w, d, h, rot, mat) => { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; calle.add(g);
  add(tbox(w, h, d, 2), mat, 0, h / 2, 0, g); const r = add(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + 0.5, 1.8, 4), M.roof, 0, h + 0.9, 0, g); r.rotation.y = Math.PI / 4; r.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414);
  add(box(0.9, 1.8, 0.1), M.door, 0, 0.9, d / 2 + 0.03, g, { cast: false }); for (const s of [-1, 1]) add(box(0.6, 0.7, 0.1), M.window, s * w * 0.3, h * 0.62, d / 2 + 0.03, g, { cast: false }); };
const rh = P.rng(12);
for (let i = 0; i < 7; i++) { house(-16 + i * 5.2 + (i > 1 && i < 4 ? 8 : 0), -8.5, 4.5, 4, 4.5 + rh() * 3, 0, i % 2 ? M.plaster : M.plaster2); house(-14 + i * 6, 9.5 + rh(), 4.5, 4, 4 + rh() * 3, Math.PI, i % 2 ? M.plaster2 : M.plaster); }
const cypress = (x, z, h = 7) => { const g = new THREE.Group(); g.position.set(x, 0, z); world.add(g); add(new THREE.CylinderGeometry(0.15, 0.2, 1, 6), M.trunk, 0, 0.5, 0, g); const c = add(new THREE.SphereGeometry(1, 10, 10), M.cypress, 0, 0.9 + h / 2, 0, g); c.scale.set(0.95, h / 2, 0.95); };
const rt = P.rng(44);
for (let i = 0; i < 24; i++) cypress(CX - 40 - rt() * 60 + (i % 2) * 120, -30 + rt() * 60, 6 + rt() * 4);
add(new THREE.PlaneGeometry(2400, 2400), M.grass, 0, -0.3, 0, world, { cast: false }).rotation.x = -Math.PI / 2;
for (let i = 0; i < 16; i++) { const a = rt() * Math.PI * 2, d = 160 + rt() * 160; const h = add(new THREE.SphereGeometry(40 + rt() * 40, 20, 10), i % 2 ? M.hill : M.hillFar, CX + Math.cos(a) * d, -12, Math.sin(a) * d, world, { cast: false }); h.scale.y = 0.5 + rt() * 0.3; }
for (let i = 0; i < 14; i++) { const a = rt() * Math.PI * 2, d = 520 + rt() * 200, hh = 120 + rt() * 120, r_ = 110 + rt() * 70; const g = new THREE.Group(); g.position.set(CX + Math.cos(a) * d, -5, Math.sin(a) * d); world.add(g); add(new THREE.ConeGeometry(r_, hh, 7), M.mount, 0, hh / 2, 0, g, { cast: false }); add(new THREE.ConeGeometry(r_ * 0.3, hh * 0.3, 7), M.snow, 0, hh * 0.86, 0, g, { cast: false }); }
{ const r = P.rng(90);
  for (let i = 0; i < 14; i++) {
    const c = document.createElement('canvas'); c.width = 600; c.height = 400; const pen = new T.Pen(c.getContext('2d')); pen.ol = 0;
    pen.g.translate(300, 200); pen.g.scale(1.4, 1.2); pen.g.translate(-300, -200); T.fxCloud(pen, i + 1);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.667), new THREE.MeshBasicMaterial({ map: P.tex(c), transparent: true, fog: false, depthWrite: false }));
    const a = r() * Math.PI * 2, d = 650 + r() * 250; m.position.set(Math.cos(a) * d, 120 + r() * 160, Math.sin(a) * d); m.scale.setScalar(160 + r() * 140);
    m.userData.ndSkip = true; m.renderOrder = -1; scene.add(m); clouds.push(m);
  } }

// ---------- lo que pasa en el decorado con la voz ----------
// etiquetas de precio de las baldas que SUBEN (crecen y se ponen rojas) en «¡Y acaban en tus precios!»
const etiquetas = []; world.traverse((o) => { if (o.isMesh && o.geometry.type === 'BoxGeometry' && o.geometry.parameters.width === 0.14 && o.geometry.parameters.height === 0.06) etiquetas.push(o); });
const rojaM = toon({ color: '#e0442e' });
// la montaña de sacos de dinero delante del BANCO (los 172.000 millones en comisiones): crece con la voz
const sacos = []; { const r = P.rng(77); for (let i = 0; i < 26; i++) { const g = new THREE.Group(); const a = r() * 6.28, d = r() * 1.6;
  g.position.set(CX + 3.5 + Math.cos(a) * d, 0, 4.4 + Math.sin(a) * d * 0.5); world.add(g);
  add(new THREE.SphereGeometry(0.32, 12, 10), toon({ color: '#c9a46a' }), 0, 0.3, 0, g).scale.set(1, 0.9, 1);
  add(new THREE.CylinderGeometry(0.08, 0.14, 0.14, 10), toon({ color: '#a88450' }), 0, 0.6, 0, g);
  add(new THREE.CylinderGeometry(0.1, 0.1, 0.012, 14), M.gold, 0, 0.42, 0.31, g).rotation.x = Math.PI / 2;
  g.userData.y = Math.floor(i / 8) * 0.45; g.userData.i = i; sacos.push(g); } }
function worldLight(L, f) { }
function worldState(S, f) {
  const sube = S.precios || 0;
  etiquetas.forEach((m, i) => { const k = Math.max(0, Math.min(1, sube * 1.6 - (i % 7) * 0.08)); m.scale.set(1 + k * 0.8, 1 + k * 0.8, 1); m.material = k > 0.5 ? rojaM : m.userData.m0 || (m.userData.m0 = m.material); });
  const n = Math.round((S.sacos || 0) * sacos.length);
  sacos.forEach((g, i) => { g.visible = i < n; g.position.y = g.userData.y; });
}
