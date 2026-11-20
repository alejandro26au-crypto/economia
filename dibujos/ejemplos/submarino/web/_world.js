// ---------- world: SUBMARINO (decorado a medida, piezas y texturas al estilo del kit) ----------
const DECK = 0;
const M = {
  hull: texM(P.hullPaint(50), 12, 16), ub: texM(P.hullPaint(60, 95, 12, 76), 10, 6),
  deck: texM(P.deckPlate(51), 6, 1.2), tick: texM(P.ticking(52), 2, 1), blanket: texM(P.blanket(53), 1, 1), blanket2: texM(P.blanket(57, '#4d5f7a'), 1, 1),
  battery: texM(P.battery(54), 3, 3), hullOut: texM(P.hullOut(55, [212, 18, 40]), 12, 2), ubOut: texM(P.hullOut(56, [120, 6, 44]), 10, 2),
  rib: toon({ color: '#8d9a8b' }), ribUb: toon({ color: '#9aa39a' }), panel: toon({ color: '#3f6352' }), panel2: toon({ color: '#567a66' }),
  steel: toon({ color: '#b9c0c6' }), dark: toon({ color: '#2b3036' }), brass: toon({ color: '#d4a84a' }), white: toon({ color: '#f4f2ec' }),
  pRed: toon({ color: '#c8392e' }), pGreen: toon({ color: '#3f9a58' }), pYel: toon({ color: '#e8b830' }), pBlue: toon({ color: '#3d74b8' }), pOra: toon({ color: '#d9832f' }),
  locker: toon({ color: '#6f8f86' }), wood: toon({ color: '#8a5a34' }), pillow: toon({ color: '#f6f3ea' }), black: toon({ color: '#1e2226' }),
  sand: toon({ color: '#3f7f86' }), rock: toon({ color: '#2f5c66' }), destroyer: toon({ color: '#1d2a36' }), charge: toon({ color: '#2a2f35' }),
};
const glow = (c) => new THREE.MeshBasicMaterial({ color: c, fog: false });
const inside = new THREE.Group(), uboat = new THREE.Group(), outside = new THREE.Group(), ubOut = new THREE.Group();
[inside, uboat, outside, ubOut].forEach((g) => scene.add(g));

// ===== INTERIOR (EE. UU., clase Gato): eje del casco en y=HY, a lo largo de x =====
const HR = 2.5, HY = 1.3, X0 = -12, X1 = 9, XL = X1 - X0, XC = (X0 + X1) / 2;
{
  const h = add(new THREE.CylinderGeometry(HR, HR, XL, 48, 1, true), M.hull, XC, HY, 0, inside, { cast: false });
  h.rotation.z = Math.PI / 2; h.material.side = THREE.DoubleSide;
  for (let x = X0 + 0.6; x < X1; x += 1.2) { const r = add(new THREE.TorusGeometry(HR - 0.04, 0.07, 8, 48), M.rib, x, HY, 0, inside, { cast: false }); r.rotation.y = Math.PI / 2; }
  add(tbox(XL, 0.12, 4.3, 1.4), M.deck, XC, -0.06, 0, inside, { cast: false });
  for (const x of [X0, X1]) { const b = add(new THREE.CylinderGeometry(HR, HR, 0.14, 48), M.hull, x, HY, 0, inside, { cast: false }); b.rotation.z = Math.PI / 2; }
}
// tuberías de colores por el techo, con abrazaderas y volantes
const PIPES = [[3.38, 0.55, 0.075, M.pRed], [3.48, -0.15, 0.12, M.steel], [3.32, -0.8, 0.09, M.pGreen], [3.1, 1.3, 0.065, M.pYel], [3.05, -1.45, 0.07, M.pBlue], [2.85, 1.72, 0.05, M.pOra], [3.18, 0.95, 0.05, M.steel]];
for (const [y, z, r, m] of PIPES) {
  const p = add(new THREE.CylinderGeometry(r, r, XL, 12), m, XC, y, z, inside); p.rotation.z = Math.PI / 2;
  for (let x = X0 + 1; x < X1; x += 2.4) { const c = add(new THREE.CylinderGeometry(r + 0.025, r + 0.025, 0.08, 12), M.dark, x, y, z, inside); c.rotation.z = Math.PI / 2; }
}
const wheel = (x, y, z, R, m, parent, face = 'down') => {
  const g = new THREE.Group(); g.position.set(x, y, z); parent.add(g);
  add(new THREE.TorusGeometry(R, R * 0.14, 8, 24), m, 0, 0, 0, g);
  for (let k = 0; k < 3; k++) { const s = add(box(R * 2, R * 0.12, R * 0.12), m, 0, 0, 0, g); s.rotation.z = k * Math.PI / 3; }
  add(new THREE.CylinderGeometry(R * 0.2, R * 0.2, R * 0.3, 10), M.dark, 0, 0, 0, g).rotation.x = Math.PI / 2;
  if (face === 'down') g.rotation.x = Math.PI / 2; return g;
};
for (const [x, i] of [[-10.4, 0], [-6.5, 1], [-2.8, 2], [1.6, 3], [6.2, 4]]) { const P_ = PIPES[i % 3 === 0 ? 0 : i % 3 === 1 ? 2 : 3]; wheel(x, P_[0] - P_[2] - 0.12, P_[1], 0.16, M.pRed, inside); }
// lámparas de jaula (bombillas que brillan) + luces puntuales cálidas
const bulbs = [], lamps = [], plights = [];
for (let x = X0 + 1.4; x < X1; x += 2.6) {
  const g = new THREE.Group(); g.position.set(x, 3.62, 0.15); inside.add(g); lamps.push(g);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.25, 6), M.dark, 0, -0.12, 0, g);
  add(new THREE.CylinderGeometry(0.16, 0.12, 0.06, 16), M.dark, 0, -0.27, 0, g);
  const b = add(new THREE.SphereGeometry(0.1, 16, 12), glow('#ffe9b0'), 0, -0.37, 0, g, { cast: false }); b.userData.ndSkip = false; bulbs.push(b);
  for (let k = 0; k < 4; k++) { const c = add(new THREE.TorusGeometry(0.13, 0.012, 6, 12, Math.PI), M.dark, 0, -0.3, 0, g, { cast: false }); c.rotation.y = k * Math.PI / 4; c.rotation.x = Math.PI; }
}
for (const x of [-9.4, -5.6, -1.8, 2.2, 6.4]) { const l = new THREE.PointLight('#ffd49a', 6, 9, 1.4); l.position.set(x, 3.0, 0.2); inside.add(l); plights.push(l); }
// luces rojas de emergencia en las paredes
const redLamps = [];
for (const x of [-8.6, -3.6, 0.6, 5.2]) for (const z of [-1, 1]) { const y = 2.75, zz = z * Math.sqrt(HR * HR - (y - HY) ** 2) * 0.93; const m = add(box(0.16, 0.12, 0.1), glow('#5a1a1a'), x, y, zz, inside, { cast: false }); redLamps.push(m); }

// ---- literas (tres alturas a cada lado) ----
const BUNK_X = [-9.9, -7.7, -5.5], BUNK_Y = [0.42, 1.12, 1.82], BZ = 1.6;
const heroBunk = { x: -5.5, y: 0.42 + 0.08, z: -BZ };
for (const s of [-1, 1]) for (const bx of BUNK_X) {
  for (const dx of [-0.96, 0.96]) for (const dz of [-0.36, 0.36]) add(new THREE.CylinderGeometry(0.025, 0.025, 2.45, 8), M.steel, bx + dx, 1.22, s * BZ + dz, inside);
  BUNK_Y.forEach((y, ti) => {
    add(tbox(1.86, 0.03, 0.7, 1), M.dark, bx, y - 0.04, s * BZ, inside);
    add(tbox(1.84, 0.14, 0.68, 0.9), M.tick, bx, y + 0.06, s * BZ, inside);
    const r = add(new THREE.CylinderGeometry(0.022, 0.022, 1.92, 8), M.steel, bx, y + 0.02, s * (BZ - 0.36), inside); r.rotation.z = Math.PI / 2;
    const hero = s < 0 && bx === heroBunk.x && ti === 0;
    if (!hero) {
      const occupied = (ti + bx * 3 + s) % 3 === 0;
      add(tbox(1.05, occupied ? 0.22 : 0.08, 0.7, 1.2), ti % 2 ? M.blanket2 : M.blanket, bx + 0.3, y + (occupied ? 0.24 : 0.17), s * BZ, inside);
      const pw = add(new THREE.SphereGeometry(0.2, 12, 8), M.pillow, bx - 0.62, y + 0.2, s * (BZ + 0.12), inside); pw.scale.set(1.0, 0.45, 0.9);
    }
  });
}
// almohada y manta de la litera del protagonista (la manta tapa las piernas de la tarjeta tumbada)
{ const pw = add(new THREE.SphereGeometry(0.2, 12, 8), M.pillow, heroBunk.x - 0.62, heroBunk.y + 0.12, -BZ - 0.12, inside); pw.scale.set(1.0, 0.45, 0.9); }
const heroBlanket = add(tbox(1.0, 0.36, 0.74, 1.2), M.blanket, heroBunk.x + 0.55, heroBunk.y + 0.2, -BZ + 0.02, inside);
// taquillas al fondo y en la pared de enfrente
for (let i = 0; i < 4; i++) { const g = add(tbox(0.5, 1.7, 0.45, 1), M.locker, -11.6 + 0.02, 0.85, -1.05 + i * 0.52, inside); g.rotation.y = Math.PI / 2; add(box(0.02, 0.25, 0.3), M.dark, -11.33, 1.45, -1.05 + i * 0.52, inside); }
// ---- sala de control ----
const board = add(tbox(4.6, 1.75, 0.16, 1), M.panel, 1.1, 1.55, -2.02, inside);
add(tbox(4.7, 0.08, 0.3, 1), M.dark, 1.1, 2.47, -1.98, inside); add(tbox(4.7, 0.08, 0.3, 1), M.dark, 1.1, 0.64, -1.98, inside);
const dials = [];
const dialMesh = (x, y, R, tex_, z = -1.92) => {
  const g = new THREE.Group(); g.position.set(x, y, z); inside.add(g);
  add(new THREE.CylinderGeometry(R * 1.12, R * 1.12, 0.08, 32), M.brass, 0, 0, 0, g).rotation.x = Math.PI / 2;
  const face = new THREE.Mesh(new THREE.CircleGeometry(R, 40), new THREE.MeshToonMaterial({ gradientMap: grad, map: P.tex(tex_) })); face.position.z = 0.045; g.add(face);
  const nd = new THREE.Group(); nd.position.z = 0.06; g.add(nd);
  add(box(R * 0.82, R * 0.07, 0.012), M.pRed, R * 0.36, 0, 0, nd, { cast: false }); add(new THREE.CylinderGeometry(R * 0.08, R * 0.08, 0.02, 12), M.dark, 0, 0, 0.01, nd).rotation.x = Math.PI / 2;
  dials.push({ g, nd }); return nd;
};
const depthNeedle = dialMesh(-0.15, 1.68, 0.42, P.dial('FEET', 400, 50, 0.82));
const dialSet = [[0.85, 1.95, 0.2, P.dial('PSI', 600, 100, 0.85)], [1.35, 1.95, 0.2, P.dial('AIR', 3000, 500, 0.9)], [0.85, 1.42, 0.2, P.dial('TRIM', 100, 20, 0.95)], [1.35, 1.42, 0.2, P.dial('AMPS', 4000, 1000, 0.9)]];
const smallNeedles = dialSet.map(([x, y, R, t]) => dialMesh(x, y, R, t));
// «árbol de Navidad»: luces rojas y verdes del casco
const xmas = [];
for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const m = add(new THREE.SphereGeometry(0.035, 10, 8), glow((r + c) % 3 ? '#4dff7a' : '#ff4a3a'), 2.15 + c * 0.13, 1.45 + r * 0.13, -1.92, inside, { cast: false }); m.userData.on = (r + c) % 3 ? '#4dff7a' : '#ff4a3a'; xmas.push(m); }
add(tbox(0.95, 0.7, 0.05, 1), M.dark, 2.47, 1.65, -1.95, inside);
// volantes de los timones de profundidad
const planeWheels = [wheel(-0.35, 1.0, -1.72, 0.32, M.brass, inside, 'face'), wheel(0.55, 1.0, -1.72, 0.32, M.brass, inside, 'face')];
// periscopio y escalera a la torre
add(new THREE.CylinderGeometry(0.15, 0.15, 3.9, 16), M.steel, 3.6, 1.95, -1.05, inside);
add(tbox(0.5, 0.3, 0.32, 1), M.dark, 3.6, 1.55, -0.85, inside); for (const s of [-1, 1]) add(tbox(0.28, 0.06, 0.06, 1), M.dark, 3.6 + s * 0.38, 1.45, -0.85, inside);
for (const z of [1.25, 1.65]) add(new THREE.CylinderGeometry(0.03, 0.03, 3.6, 8), M.steel, 5.6, 1.8, z, inside);
for (let y = 0.3; y < 3.6; y += 0.32) { const r = add(new THREE.CylinderGeometry(0.022, 0.022, 0.4, 8), M.steel, 5.6, y, 1.45, inside); r.rotation.x = Math.PI / 2; }
// mesa de cartas y taquillas en la pared de enfrente
add(tbox(1.6, 0.08, 0.7, 1), M.wood, 0.6, 1.0, 1.75, inside); add(tbox(1.5, 0.9, 0.6, 1), M.locker, 0.6, 0.5, 1.8, inside);
for (let i = 0; i < 3; i++) add(tbox(0.55, 1.6, 0.45, 1), M.locker, -2.4 + i * 0.58, 0.8, 1.95, inside);
// escotilla estanca redonda en el mamparo de proa
add(new THREE.TorusGeometry(0.62, 0.1, 10, 32), M.steel, X1 - 0.1, 1.2, 0, inside).rotation.y = Math.PI / 2;
add(new THREE.CircleGeometry(0.6, 32), M.black, X1 - 0.08, 1.2, 0, inside).rotation.y = -Math.PI / 2;
{ const d = add(new THREE.CylinderGeometry(0.6, 0.6, 0.1, 32), M.steel, X1 - 0.5, 1.2, 0.85, inside); d.rotation.z = Math.PI / 2; d.rotation.y = -0.9; wheel(X1 - 0.6, 1.2, 0.95, 0.18, M.pRed, inside, 'face').rotation.y = -0.9; }

// ===== U-BOOT ALEMÁN (el váter del U-1206): otro casco, gris verdoso, x ~ 40 =====
const UX = 40, UR = 2.2, UY = 1.15;
{
  const h = add(new THREE.CylinderGeometry(UR, UR, 9, 40, 1, true), M.ub, UX, UY, 0, uboat, { cast: false }); h.rotation.z = Math.PI / 2; h.material.side = THREE.DoubleSide;
  for (let x = UX - 4.2; x < UX + 4.5; x += 1.0) { const r = add(new THREE.TorusGeometry(UR - 0.04, 0.06, 8, 40), M.ribUb, x, UY, 0, uboat, { cast: false }); r.rotation.y = Math.PI / 2; }
  for (const x of [UX - 4.5, UX + 4.5]) { const b = add(new THREE.CylinderGeometry(UR, UR, 0.14, 40), M.ub, x, UY, 0, uboat, { cast: false }); b.rotation.z = Math.PI / 2; }
  // suelo con trampilla abierta: debajo, la batería
  add(tbox(3.8, 0.12, 3.8, 1.4), M.deck, UX - 2.6, -0.06, 0, uboat, { cast: false });
  add(tbox(3.6, 0.12, 3.8, 1.4), M.deck, UX + 2.7, -0.06, 0, uboat, { cast: false });
  add(tbox(1.6, 0.12, 1.2, 1.4), M.deck, UX + 0.1, -0.06, -1.25, uboat, { cast: false }); add(tbox(1.6, 0.12, 1.0, 1.4), M.deck, UX + 0.1, -0.06, 1.4, uboat, { cast: false });
  add(tbox(1.6, 0.05, 1.6, 1), M.battery, UX + 0.1, -0.75, 0.1, uboat, { cast: false });
  for (const s of [-1, 1]) add(tbox(1.6, 0.7, 0.05, 1), M.dark, UX + 0.1, -0.4, 0.1 + s * 0.8, uboat, { cast: false });
  const tr = add(tbox(1.5, 0.06, 1.1, 1), M.deck, UX + 0.1, 0.5, 0.95, uboat); tr.rotation.x = -1.9; tr.position.z = 1.15; // tapa de la trampilla, levantada
  for (const [y, z, r, m] of [[3.05, 0.4, 0.07, M.pRed], [3.15, -0.3, 0.1, M.steel], [2.95, -1.0, 0.06, M.pYel], [2.85, 1.1, 0.06, M.pGreen]]) { const p = add(new THREE.CylinderGeometry(r, r, 9, 10), m, UX, y, z, uboat); p.rotation.z = Math.PI / 2; }
  const l = new THREE.PointLight('#ffe0a0', 5, 8, 1.4); l.position.set(UX, 2.7, 0.3); uboat.add(l); plights.push(l);
  const pit = new THREE.PointLight('#ffd890', 3, 2.5, 1.2); pit.position.set(UX + 0.1, -0.2, 0.1); uboat.add(pit);
  const b = add(new THREE.SphereGeometry(0.1, 16, 12), glow('#ffe9b0'), UX, 3.0, 0.3, uboat, { cast: false }); bulbs.push(b);
}
// el váter de alta presión: taza, asiento, tuberías, válvulas y la palanca que se acciona mal
const toilet = new THREE.Group(); toilet.position.set(UX - 1.4, 0, -1.25); uboat.add(toilet);
{
  const prof = [[0, 0], [0.16, 0], [0.18, 0.08], [0.15, 0.2], [0.2, 0.36], [0.24, 0.42], [0.22, 0.45]].map(([r, y]) => new THREE.Vector2(r, y));
  add(new THREE.LatheGeometry(prof, 24), M.white, 0, 0, 0.1, toilet);
  const seat = add(new THREE.TorusGeometry(0.2, 0.04, 8, 24), M.wood, 0, 0.47, 0.1, toilet); seat.rotation.x = Math.PI / 2;
  add(new THREE.CylinderGeometry(0.05, 0.05, 1.6, 10), M.steel, 0, 1.0, -0.22, toilet);
  const hp = add(new THREE.CylinderGeometry(0.05, 0.05, 0.9, 10), M.steel, 0.4, 1.75, -0.22, toilet); hp.rotation.z = Math.PI / 2;
  wheel(0, 1.3, -0.12, 0.13, M.pRed, toilet, 'face'); wheel(0.55, 1.6, -0.12, 0.11, M.brass, toilet, 'face');
  add(tbox(0.3, 0.25, 0.12, 1), M.brass, -0.35, 1.05, -0.18, toilet);
}
const lever = new THREE.Group(); lever.position.set(0.3, 0.95, -0.1); toilet.add(lever);
add(new THREE.CylinderGeometry(0.025, 0.025, 0.5, 8), M.steel, 0, 0.25, 0, lever); add(new THREE.SphereGeometry(0.05, 10, 8), M.pRed, 0, 0.5, 0, lever);

// ===== EXTERIOR: mar abierto, submarino, destructor arriba y cargas de profundidad =====
const makeSub = (L, R, mat, parent, german = false) => {
  const g = new THREE.Group(); parent.add(g);
  const prof = [[0, -L / 2], [R * 0.35, -L / 2 + 0.8], [R * 0.75, -L / 2 + 3.2], [R, -L / 2 + 8], [R, L / 2 - 14], [R * 0.75, L / 2 - 6], [R * 0.3, L / 2 - 1.2], [0, L / 2]].map(([r, y]) => new THREE.Vector2(r, y));
  const h = add(new THREE.LatheGeometry(prof, 40), mat, 0, 0, 0, g); h.rotation.z = -Math.PI / 2; // proa hacia +x
  add(tbox(L * 0.82, R * 0.35, R * 1.0, 3), mat, -L * 0.02, R * 0.92, 0, g);
  add(tbox(L * 0.8, 0.12, R * 1.05, 3), M.wood, -L * 0.02, R * 1.1, 0, g);
  const tw = new THREE.Group(); tw.position.set(L * 0.06, R * 1.1, 0); g.add(tw);
  add(tbox(german ? 5.5 : 8, R * 1.05, R * 0.72, 2), mat, 0, R * 0.52, 0, tw);
  add(tbox(german ? 3 : 4.2, 0.5, R * 0.78, 2), mat, 0.6, R * 1.12, 0, tw);
  for (const [dx, hh] of [[-0.6, 4.5], [0.4, 5.6], [1.4, 3.8]]) add(new THREE.CylinderGeometry(0.16, 0.2, hh, 10), M.steel, dx, R + hh / 2, 0, tw);
  if (!german) { add(new THREE.CylinderGeometry(0.28, 0.4, 0.8, 12), mat, -L * 0.16, R * 1.4, 0, g); const gun = add(new THREE.CylinderGeometry(0.12, 0.14, 4.2, 10), mat, -L * 0.16 + 2, R * 1.5, 0, g); gun.rotation.z = Math.PI / 2; }
  for (const s of [-1, 1]) { add(tbox(1.6, 0.12, 2.2, 1), mat, L / 2 - 7, 0.1, s * (R + 0.9), g); add(tbox(1.8, 0.12, 2.4, 1), mat, -L / 2 + 4, 0, s * (R * 0.55 + 1.1), g); }
  add(tbox(2.0, 3.2, 0.12, 1), mat, -L / 2 + 2.6, 0, 0, g);
  const props = [];
  for (const s of [-1, 1]) { const p = new THREE.Group(); p.position.set(-L / 2 + 1.2, -0.3, s * 1.6); g.add(p); for (let k = 0; k < 4; k++) { const b = add(tbox(0.12, 1.4, 0.45, 1), M.brass, 0, 0, 0, p); b.rotation.x = k * Math.PI / 4 * 2; b.geometry.translate(0, 0.6, 0); } props.push(p); }
  g.userData.props = props; return g;
};
const sub = makeSub(62, 3.3, M.hullOut, outside);
const uSub = makeSub(46, 2.6, M.ubOut, ubOut, true);
// superficie vista desde abajo: ondas brillantes
const surfU = { t: { value: 0 }, a: { value: new THREE.Color('#8fe6ff') }, b: { value: new THREE.Color('#2a9cc8') }, fcol: { value: new THREE.Color('#13628a') }, ffar: { value: 260 } };
const surfMat = new THREE.ShaderMaterial({ uniforms: surfU, side: THREE.DoubleSide, fog: false,
  vertexShader: `varying vec2 vP; varying float vD; void main(){ vP = position.xy; vec4 mv = modelViewMatrix*vec4(position,1.); vD = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float t, ffar; uniform vec3 a, b, fcol; varying vec2 vP; varying float vD;
    float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float noise(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f); return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x), f.y); }
    void main(){ vec2 p = vP*.06; float n = noise(p+vec2(t*.2,0.))*.6+noise(p*2.7-vec2(0.,t*.3))*.4; float cell = smoothstep(.55,.62,n);
      gl_FragColor = vec4(mix(mix(b, a, .25+cell*.75), fcol, smoothstep(ffar*.35, ffar, vD)), 1.); }` });
const surf = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), surfMat); surf.rotation.x = Math.PI / 2; surf.position.y = 48; surf.userData.ndSkip = true; outside.add(surf);
const surf2 = surf.clone(); ubOut.add(surf2);
// destructor en la superficie (silueta oscura vista desde abajo)
const destroyer = new THREE.Group(); destroyer.position.set(6, 47, -30); destroyer.scale.set(0.8, 0.8, 0.7); outside.add(destroyer);
{
  // silueta vista desde abajo: planta del casco (proa en punta, popa redonda), con quilla y hélices
  const sh = new THREE.Shape(); sh.moveTo(44, 0); sh.quadraticCurveTo(30, 5.2, 14, 5.4); sh.lineTo(-30, 5.2); sh.quadraticCurveTo(-38, 4.6, -38, 0); sh.quadraticCurveTo(-38, -4.6, -30, -5.2); sh.lineTo(14, -5.4); sh.quadraticCurveTo(30, -5.2, 44, 0);
  const hg = new THREE.ExtrudeGeometry(sh, { depth: 4.2, bevelEnabled: true, bevelThickness: 1.2, bevelSize: 1.2, bevelSegments: 2 }); hg.rotateX(Math.PI / 2);
  add(hg, M.destroyer, 0, 0, 0, destroyer, { cast: false });
  add(tbox(70, 1.4, 0.8, 2), M.destroyer, 2, -5.6, 0, destroyer, { cast: false });
  for (let i = 0; i < 2; i++) { const p = add(tbox(0.3, 3, 1.2, 1), M.destroyer, -30, -4.4, (i ? 1 : -1) * 2.4, destroyer, { cast: false }); p.rotation.x = 0.2; }
}
// rayos de sol que bajan (tarjetas aditivas, sin tinta)
const shaftTex = P.tex(P.shaft()); const shafts = [];
for (let i = 0; i < 10; i++) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shaftTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, opacity: 0.55 }));
  m.geometry.translate(0, -0.5, 0); m.position.set(-60 + i * 13 + Math.sin(i * 7) * 5, 48, -20 + Math.cos(i * 3) * 18); m.scale.set(4 + (i % 3) * 3, 90, 1); m.rotation.z = 0.18;
  m.userData.ndSkip = true; m.renderOrder = 3; outside.add(m); shafts.push(m);
  const m2 = m.clone(); ubOut.add(m2); shafts.push(m2);
}
// fondo: arena y rocas, muy abajo
for (const grp of [outside, ubOut]) {
  const bed = add(new THREE.PlaneGeometry(1200, 1200, 40, 40), M.sand, 0, -70, 0, grp, { cast: false }); bed.rotation.x = -Math.PI / 2;
  const pa = bed.geometry.attributes.position; for (let i = 0; i < pa.count; i++) pa.setZ(i, Math.sin(pa.getX(i) * 0.05) * 3 + Math.cos(pa.getY(i) * 0.07) * 2); bed.geometry.computeVertexNormals();
  const r = P.rng(grp === outside ? 70 : 71); for (let i = 0; i < 26; i++) { const k = add(new THREE.DodecahedronGeometry(4 + r() * 8, 0), M.rock, (r() - 0.5) * 300, -70, (r() - 0.5) * 300, grp, { cast: false }); k.scale.y = 0.5 + r() * 0.6; }
}
// cargas de profundidad (barriles que se hunden)
const charges = [];
for (let i = 0; i < 6; i++) { const g = new THREE.Group(); g.scale.setScalar(2.4); outside.add(g); add(new THREE.CylinderGeometry(0.55, 0.55, 1.3, 16), M.charge, 0, 0, 0, g); for (const y of [-0.45, 0.45]) add(new THREE.TorusGeometry(0.56, 0.05, 6, 20), M.steel, 0, y, 0, g).rotation.x = Math.PI / 2; charges.push(g); }
const bubbleTex = P.tex(P.radial('230,250,255', 0.9));
