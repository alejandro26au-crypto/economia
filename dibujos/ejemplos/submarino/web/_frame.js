// ---------- per-frame state ----------
const tmpV = new THREE.Vector3();
function applyLight(L, f) {
  hemi.color.set(L.sky); hemi.groundColor.set(L.ground); hemi.intensity = L.hemi;
  sun.color.set(L.sun); sun.intensity = L.sunI;
  scene.fog.color.set(L.fog); scene.fog.near = L.fogNear; scene.fog.far = L.fogFar;
  skyU.top.value.set(L.skyTop); skyU.hor.value.set(L.skyHor); skyU.sunCol.value.set('#000'); skyU.sunSize.value = 0;
  inkU.sat.value = L.sat; inkU.gain.value.set(L.gain || '#ffffff'); inkU.lift.value.set(L.lift || '#000000');
  surfU.fcol.value.set(L.fog); surfU.ffar.value = L.fogFar;
  for (const l of plights) { l.color.set(L.lampC || '#ffd49a'); l.intensity = L.lampI ?? 6; }
  for (const b of bulbs) b.material.color.set(L.bulb || '#ffe9b0');
  for (const m of redLamps) m.material.color.set(L.red ? '#ff3a2a' : '#5a1a1a');
  for (const m of xmas) m.material.color.set(L.xmasOff ? '#2a2a2a' : m.userData.on);
}
function placeSun(L, focus) {
  const az = rx(L.az), el = rx(L.el); tmpV.set(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(focus).addScaledVector(tmpV, 60); sun.target.position.copy(focus);
  const ext = L.shadowExt || 12, sc = sun.shadow.camera; sc.left = -ext; sc.right = ext; sc.top = ext; sc.bottom = -ext; sc.near = 1; sc.far = 160; sc.updateProjectionMatrix();
}
const valueAngle = (v, max) => -(Math.PI * 0.75 + Math.PI * 1.5 * Math.max(0, Math.min(1, v / max)));
function worldState(S, f) {
  inside.visible = S.set === 'in'; uboat.visible = S.set === 'ub'; outside.visible = S.set === 'out'; ubOut.visible = S.set === 'ubout';
  sky.visible = S.set === 'out' || S.set === 'ubout';
  depthNeedle.rotation.z = valueAngle(S.depth ?? 300, 400);
  smallNeedles.forEach((n, i) => { n.rotation.z = valueAngle((0.45 + 0.08 * Math.sin(f * 0.07 + i * 2) + (S.needleJit || 0) * Math.sin(f * 1.7 + i)) * 1, 1); });
  planeWheels.forEach((w, i) => { w.rotation.z = (S.wheel || 0) * (i ? -1 : 1); });
  lamps.forEach((l, i) => { l.rotation.x = (S.swing || 0) * Math.sin(f * 0.35 + i * 0.7); l.rotation.z = (S.swing || 0) * 0.6 * Math.cos(f * 0.3 + i); });
  heroBlanket.visible = S.blanket !== false;
  lever.rotation.z = S.lever || 0;
  // exterior
  const sp = S.sub || { x: 0, y: 0, z: 0, pitch: 0 };
  sub.position.set(sp.x, sp.y, sp.z); sub.rotation.z = sp.pitch || 0;
  for (const p of sub.userData.props) p.rotation.x = f * 0.25;
  const up = S.usub || { x: 0, y: 0, z: 0, pitch: 0, roll: 0 };
  uSub.position.set(up.x, up.y, up.z); uSub.rotation.set(up.roll || 0, 0, up.pitch || 0);
  for (const p of uSub.userData.props) p.rotation.x = f * (up.prop ?? 0.2);
  charges.forEach((c, i) => { const k = S.charges && S.charges[i]; c.visible = !!k; if (k) { c.position.set(...k.p); c.rotation.set(k.r, 0, k.r * 0.6); } });
  destroyer.position.x = 6 + (S.dx || 0);
  surfU.t.value = f / 30;
  for (const m of shafts) m.material.opacity = 0.45 + 0.12 * Math.sin(f * 0.05 + m.position.x);
}

function drawActors(list, cam) {
  cards.forEach((c) => { c.mesh.visible = c.blob.visible = false; });
  list.forEach((a, i) => {
    const c = getCard(i);
    c.draw(a.key, a.draw);
    c.mesh.visible = true; c.mesh.position.set(a.x, a.y, a.z);
    const s = a.s || 1; c.mesh.scale.set(s * (a.flip ? -1 : 1), s, s);
    c.mesh.rotation.set(0, a.fixedYaw ?? (Math.atan2(cam.position.x - a.x, cam.position.z - a.z) + (a.yaw || 0)), a.roll || 0);
    c.mat.color.set(a.tint || '#ffffff'); c.mat.opacity = a.alpha ?? 1; c.mat.transparent = true;
    c.mat.blending = a.add ? THREE.AdditiveBlending : THREE.NormalBlending; c.mat.depthWrite = !a.add && (a.alpha ?? 1) > 0.95;
    c.mesh.castShadow = a.shadow !== false;
    c.mesh.renderOrder = a.order || 2;
    c.mesh.userData.ndSkip = !!a.noInk;
    if (a.blob !== false && Math.abs(a.y - (a.ground ?? DECK)) < 0.3) { c.blob.visible = true; c.blob.position.set(a.x, (a.ground ?? DECK) + 0.02, a.z); c.blob.scale.set(0.95 * s, 0.6 * s, 1); }
  });
}

const swapForNd = (on) => {
  scene.traverse((o) => {
    if (!o.isMesh) return;
    if (on) {
      o.userData.mat0 = o.material;
      if (o.userData.ndSkip) { o.userData.vis0 = o.visible; o.visible = false; return; }
      if (o === sky || o.userData.sky) { o.userData.vis0 = o.visible; o.visible = false; return; }
      o.material = o.userData.nd || ndMat;
    } else {
      o.material = o.userData.mat0; if (o.userData.vis0 !== undefined) { o.visible = o.userData.vis0; delete o.userData.vis0; }
    }
  });
};

window.renderFrame = (f) => {
  const S = shotAt(f), W_ = worldAt(f), L = lightFor(S, f, W_), C = camAt(f);
  applyLight(L, f);
  camera.position.set(...C.pos); camera.up.set(0, 1, 0); camera.lookAt(...C.look); camera.rotateZ(rx(C.roll || 0));
  camera.fov = C.fov; camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  worldState(W_, f);
  placeSun(L, new THREE.Vector3(...(C.shadowAt || C.look)));
  drawActors([...actorsAt(f, T), ...fxAt(f, T)], camera);
  sky.position.copy(camera.position);
  renderer.setRenderTarget(rtColor); renderer.setClearColor(0x000000, 1); renderer.clear(); renderer.render(scene, camera);
  const fog = scene.fog; scene.fog = null; const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false; renderer.shadowMap.autoUpdate = false;
  swapForNd(true); renderer.setRenderTarget(rtNd); renderer.setClearColor(0x000000, 0); renderer.clear(); renderer.render(scene, camera); swapForNd(false);
  scene.fog = fog; renderer.shadowMap.enabled = sm; renderer.shadowMap.autoUpdate = true;
  const D = dofAt(f);
  inkU.px.value = 2.5; inkU.flash.value = C.flash || 0; inkU.vig.value = L.vig ?? 0.22;
  renderer.setRenderTarget(rtInk); renderer.render(inkScene, fsCam);
  dofU.focus.value = D.focus; dofU.cinf.value = D.cinf; dofU.near.value = D.near ?? 1;
  renderer.setRenderTarget(null); renderer.render(dofScene, fsCam);
  return true;
};
window.TOTAL = TOTAL;
window.ready = true;
