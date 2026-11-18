// Acabado "3D ilustrado" para TODOS los escenarios (estilo de los shorts animados que funcionan):
// 1) sombra en bandas: los materiales realistas pasan a sombreado de dibujo animado (con su color y textura);
// 2) contorno de tinta: líneas negras en siluetas y aristas de todo el decorado (detección de bordes por
//    profundidad y normales), que se pierden con la niebla;
// 3) etalonaje: más saturación y contraste, sombras frías y luces cálidas.
// Va dentro del ThreeCanvas y toma el control del dibujo (useFrame con prioridad 1).
import React, { useEffect, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

let _rampa: THREE.DataTexture | null = null;
function rampa() {
  if (_rampa) return _rampa;
  const t = [95, 160, 215, 255];
  const d = new Uint8Array(t.length * 4);
  t.forEach((v, i) => d.set([v, v, v, 255], i * 4));
  _rampa = new THREE.DataTexture(d, t.length, 1, THREE.RGBAFormat);
  _rampa.minFilter = _rampa.magFilter = THREE.NearestFilter;
  _rampa.needsUpdate = true;
  return _rampa;
}

const convertidos = new WeakMap<THREE.Material, THREE.Material>();
/** Cambia MeshStandard/Physical/Lambert/Phong por MeshToon conservando color, textura, brillo y transparencia. */
function aToon(m: THREE.Material): THREE.Material {
  const ya = convertidos.get(m);
  if (ya) return ya;
  const s = m as THREE.MeshStandardMaterial;
  if (!(s.isMeshStandardMaterial || (m as THREE.MeshLambertMaterial).isMeshLambertMaterial || (m as THREE.MeshPhongMaterial).isMeshPhongMaterial)) return m;
  const metal = s.isMeshStandardMaterial ? s.metalness ?? 0 : 0;
  const t = new THREE.MeshToonMaterial({
    color: s.color.clone().multiplyScalar(metal > 0.5 ? 1.15 : 1),
    map: s.map ?? null,
    gradientMap: rampa(),
    emissive: s.emissive ?? new THREE.Color(0),
    emissiveIntensity: s.emissiveIntensity ?? 1,
    emissiveMap: s.emissiveMap ?? null,
    transparent: s.transparent,
    opacity: s.opacity,
    side: s.side,
    depthWrite: s.depthWrite,
    alphaTest: s.alphaTest,
    vertexColors: s.vertexColors,
    fog: s.fog,
  });
  t.name = (m.name || "") + "·toon";
  convertidos.set(m, t);
  return t;
}

const FINAL = /* glsl */ `
uniform sampler2D tColor, tNormal, tProf; uniform vec2 uRes; uniform float uCerca, uLejos, uNieblaIni, uNieblaFin, uGrosor, uSat, uTinta;
uniform vec3 uColorTinta; varying vec2 vUv;
float lin(float d){ float z = d*2.0-1.0; return (2.0*uCerca*uLejos)/(uLejos+uCerca - z*(uLejos-uCerca)); }
vec3 nrm(vec2 uv){ return texture2D(tNormal, uv).xyz*2.0-1.0; }
void main(){
  vec4 c = texture2D(tColor, vUv);
  vec2 px = uGrosor / uRes;
  float d0 = lin(texture2D(tProf, vUv).r);
  vec3 n0 = nrm(vUv);
  float bordeP = 0.0, bordeN = 0.0;
  vec2 offs[4]; offs[0]=vec2(px.x,0.0); offs[1]=vec2(-px.x,0.0); offs[2]=vec2(0.0,px.y); offs[3]=vec2(0.0,-px.y);
  for (int i=0;i<4;i++){
    float d = lin(texture2D(tProf, vUv+offs[i]).r);
    bordeP += abs(d - d0);
    vec3 n = nrm(vUv+offs[i]);
    bordeN += (1.0 - clamp(dot(n, n0), 0.0, 1.0));
  }
  float relP = bordeP / max(d0, 0.001);
  float e = max(smoothstep(0.06, 0.16, relP), smoothstep(0.45, 0.9, bordeN));
  if (length(n0) < 0.5) e *= smoothstep(0.06, 0.2, relP); // el cielo no dibuja aristas propias
  float lejos = smoothstep(uNieblaIni, uNieblaFin, d0);
  e *= (1.0 - lejos*0.9) * uTinta;
  vec3 col = c.rgb;
  // etalonaje: saturación, contraste suave, sombras frías y luces cálidas
  float l = dot(col, vec3(0.2126,0.7152,0.0722));
  col = mix(vec3(l), col, uSat);
  col = col * mix(vec3(0.94,0.97,1.08), vec3(1.06,1.0,0.93), smoothstep(0.1, 0.9, l));
  col = mix(col, uColorTinta, e*0.92);
  gl_FragColor = vec4(col, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;

export const Ilustrado: React.FC<{ tinta?: number; saturacion?: number }> = ({ tinta = 1, saturacion = 1.18 }) => {
  const { gl, size } = useThree();
  const W = size.width * gl.getPixelRatio();
  const H = size.height * gl.getPixelRatio();
  const rt = useMemo(() => {
    const color = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
    // normales y profundidad a media resolución: el contorno casi no cambia y el dibujo va mucho más rápido
    const normal = new THREE.WebGLRenderTarget(Math.round(W / 2), Math.round(H / 2), { type: THREE.UnsignedByteType });
    normal.depthTexture = new THREE.DepthTexture(Math.round(W / 2), Math.round(H / 2));
    normal.depthTexture.type = THREE.UnsignedIntType;
    return { color, normal };
  }, [W, H]);
  useEffect(() => () => { rt.color.dispose(); rt.normal.dispose(); }, [rt]);
  const matNormal = useMemo(() => new THREE.MeshNormalMaterial(), []);
  const quad = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        tColor: { value: null }, tNormal: { value: null }, tProf: { value: null }, uRes: { value: new THREE.Vector2(W, H) },
        uCerca: { value: 0.1 }, uLejos: { value: 400 }, uNieblaIni: { value: 30 }, uNieblaFin: { value: 120 }, uGrosor: { value: 2.2 * (H / 1920) },
        uSat: { value: saturacion }, uTinta: { value: tinta }, uColorTinta: { value: new THREE.Color("#120e1c") },
      },
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: FINAL,
      depthTest: false,
      depthWrite: false,
    });
    const escena = new THREE.Scene();
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat);
    m.frustumCulled = false;
    escena.add(m);
    return { escena, mat, cam: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  }, [W, H, saturacion, tinta]);

  useFrame(({ scene, camera }) => {
    // 1) sombreado en bandas para todo lo que tenga luz realista
    const ocultar: THREE.Object3D[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if ((o as THREE.Sprite).isSprite) { if (o.visible) ocultar.push(o); return; }
      if (!mesh.isMesh && !(o as THREE.Points).isPoints) return;
      if (mesh.isMesh) {
        const mm = mesh.material;
        if (Array.isArray(mm)) mesh.material = mm.map(aToon);
        else if (mm) mesh.material = aToon(mm);
      }
      // lo transparente, sin luz o de efectos no dibuja contorno
      const mat = (Array.isArray(mesh.material) ? mesh.material[0] : mesh.material) as THREE.Material & { isMeshBasicMaterial?: boolean; isShaderMaterial?: boolean };
      if ((o as THREE.Points).isPoints || !mat || mat.transparent || mat.isMeshBasicMaterial || mat.isShaderMaterial || (mat as THREE.MeshToonMaterial).side === THREE.BackSide) {
        if (o.visible) ocultar.push(o);
      }
    });
    // 2) color
    gl.setRenderTarget(rt.color);
    gl.clear();
    gl.render(scene, camera);
    // 3) normales y profundidad (sin efectos ni cielo)
    const fondo = scene.background;
    const niebla = scene.fog;
    scene.background = null;
    scene.fog = null;
    ocultar.forEach((o) => (o.visible = false));
    scene.overrideMaterial = matNormal;
    gl.setRenderTarget(rt.normal);
    gl.setClearColor(0x000000, 0);
    gl.clear();
    gl.render(scene, camera);
    scene.overrideMaterial = null;
    ocultar.forEach((o) => (o.visible = true));
    scene.background = fondo;
    scene.fog = niebla;
    // 4) composición final
    const cam = camera as THREE.PerspectiveCamera;
    const u = quad.mat.uniforms;
    u.tColor.value = rt.color.texture;
    u.tNormal.value = rt.normal.texture;
    u.tProf.value = rt.normal.depthTexture;
    u.uCerca.value = cam.near;
    u.uLejos.value = cam.far;
    const f = niebla as THREE.Fog | null;
    u.uNieblaIni.value = f && "near" in f ? f.near : 40;
    u.uNieblaFin.value = f && "far" in f ? f.far : 160;
    gl.setRenderTarget(null);
    gl.render(quad.escena, quad.cam);
  }, 1);
  return null;
};
