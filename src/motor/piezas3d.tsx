// Piezas básicas 3D. Por defecto: material realista (luz y rugosidad de verdad), sin contorno, para que el
// entorno se vea cinematográfico y los personajes 2D (con su trazo) destaquen encima, como en el logo.
import React, { useMemo } from "react";
import * as THREE from "three";
import { TINTA } from "./estilo";

let _grad: THREE.DataTexture | null = null;
export function gradienteToon() {
  if (_grad) return _grad;
  const d = new Uint8Array([90, 90, 90, 255, 175, 175, 175, 255, 255, 255, 255, 255]);
  _grad = new THREE.DataTexture(d, 3, 1, THREE.RGBAFormat);
  _grad.minFilter = THREE.NearestFilter;
  _grad.magFilter = THREE.NearestFilter;
  _grad.needsUpdate = true;
  return _grad;
}

export type Forma =
  | { f: "caja"; t: [number, number, number] }
  | { f: "bola"; r: number; seg?: number }
  | { f: "tubo"; r: number; h: number; r2?: number; seg?: number; abierto?: boolean }
  | { f: "cono"; r: number; h: number; seg?: number }
  | { f: "aro"; r: number; g: number; arco?: number }
  | { f: "roca"; r: number; s?: number }
  | { f: "disco"; r: number };

/** Roca irregular: icosaedro deformado con ruido (siempre igual para la misma semilla). */
const RocaGeo: React.FC<{ r: number; s: number }> = ({ r, s }) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(r, 2);
    const p = g.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i);
      const n = v.clone().normalize();
      const k = 1 + 0.22 * Math.sin(n.x * 3.1 + s) * Math.cos(n.y * 2.7 + s * 2) + 0.12 * Math.sin(n.z * 5.3 + s * 3) + 0.06 * Math.sin((n.x + n.y) * 9 + s);
      v.copy(n.multiplyScalar(r * k));
      p.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [r, s]);
  return <primitive object={geo} attach="geometry" />;
};

const Geo: React.FC<{ forma: Forma; extra?: number }> = ({ forma, extra = 0 }) => {
  switch (forma.f) {
    case "caja":
      return <boxGeometry args={[forma.t[0] + extra * 2, forma.t[1] + extra * 2, forma.t[2] + extra * 2]} />;
    case "bola":
      return <sphereGeometry args={[forma.r + extra, forma.seg ?? 20, Math.max(8, Math.round((forma.seg ?? 20) * 0.7))]} />;
    case "tubo":
      return <cylinderGeometry args={[(forma.r2 ?? forma.r) + extra, forma.r + extra, forma.h + extra * 2, forma.seg ?? 18, 1, forma.abierto ?? false]} />;
    case "cono":
      return <coneGeometry args={[forma.r + extra, forma.h + extra * 2, forma.seg ?? 14]} />;
    case "aro":
      return <torusGeometry args={[forma.r, forma.g + extra, 10, 32, forma.arco ?? Math.PI * 2]} />;
    case "roca":
      return <RocaGeo r={forma.r + extra} s={forma.s ?? 1} />;
    case "disco":
      return <circleGeometry args={[forma.r + extra, 32]} />;
  }
};

export type PropsPieza = {
  forma: Forma;
  color: string;
  pos?: [number, number, number];
  rot?: [number, number, number];
  esc?: [number, number, number] | number;
  borde?: number; // grosor del contorno en metros (0 = sin contorno)
  brillo?: string; // color emisivo (se ve aunque no haya luz)
  intensidad?: number;
  opacidad?: number;
  basica?: boolean; // sin luces (color plano)
  doble?: boolean;
  toon?: boolean; // sombreado de dibujo animado (3 tonos)
  rugoso?: number; // 0 liso/brillante … 1 mate
  metal?: number;
  facetas?: boolean; // caras planas (rocas, terreno)
};

export const Pieza: React.FC<PropsPieza> = ({ forma, color, pos, rot, esc, borde = 0, brillo, intensidad = 1, opacidad = 1, basica, doble, toon, rugoso = 0.85, metal = 0, facetas }) => {
  const g = gradienteToon();
  const trans = opacidad < 1;
  const lado = doble || forma.f === "disco" ? THREE.DoubleSide : THREE.FrontSide;
  return (
    <group position={pos} rotation={rot} scale={esc as never}>
      <mesh>
        <Geo forma={forma} />
        {basica ? (
          <meshBasicMaterial color={color} transparent={trans} opacity={opacidad} side={lado} depthWrite={!trans} />
        ) : toon ? (
          <meshToonMaterial color={color} gradientMap={g} emissive={brillo ?? "#000000"} emissiveIntensity={brillo ? intensidad : 0} transparent={trans} opacity={opacidad} side={lado} depthWrite={!trans} />
        ) : (
          <meshStandardMaterial color={color} roughness={rugoso} metalness={metal} flatShading={facetas ?? forma.f === "roca"} emissive={brillo ?? "#000000"} emissiveIntensity={brillo ? intensidad : 0} transparent={trans} opacity={opacidad} side={lado} depthWrite={!trans} />
        )}
      </mesh>
      {borde > 0 && !trans && forma.f !== "disco" && (
        <mesh>
          <Geo forma={forma} extra={borde} />
          <meshBasicMaterial color={TINTA} side={THREE.BackSide} />
        </mesh>
      )}
    </group>
  );
};

/** Cielo/agua de fondo: esfera enorme con degradado de arriba a abajo (no le afecta la niebla). */
export const Cielo: React.FC<{ arriba: string; abajo: string; medio?: string; radio?: number }> = ({ arriba, abajo, medio, radio = 300 }) => {
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: { a: { value: new THREE.Color(arriba) }, m: { value: new THREE.Color(medio ?? arriba).lerp(new THREE.Color(abajo), medio ? 0 : 0.5) }, b: { value: new THREE.Color(abajo) } },
        vertexShader: "varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: "uniform vec3 a; uniform vec3 m; uniform vec3 b; varying vec3 p; void main(){ float h = p.y; vec3 c = h > 0.0 ? mix(m, a, smoothstep(0.0, 0.6, h)) : mix(m, b, smoothstep(0.0, 0.5, -h)); gl_FragColor = vec4(c, 1.0); }",
      }),
    [arriba, abajo, medio],
  );
  return (
    <mesh material={mat} renderOrder={-10}>
      <sphereGeometry args={[radio, 32, 16]} />
    </mesh>
  );
};

/** Textura de círculo suave (para burbujas, nieve y lucecitas). */
let _punto: THREE.Texture | null = null;
export function texturaPunto() {
  if (_punto) return _punto;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.5, "rgba(255,255,255,0.8)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  _punto = new THREE.CanvasTexture(c);
  return _punto;
}

/** Textura de burbuja (anillo con brillo). */
let _burbuja: THREE.Texture | null = null;
export function texturaBurbuja() {
  if (_burbuja) return _burbuja;
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  x.strokeStyle = "rgba(255,255,255,0.95)";
  x.lineWidth = 5;
  x.beginPath();
  x.arc(32, 32, 26, 0, Math.PI * 2);
  x.stroke();
  x.fillStyle = "rgba(255,255,255,0.15)";
  x.fill();
  x.fillStyle = "rgba(255,255,255,0.9)";
  x.beginPath();
  x.arc(22, 22, 6, 0, Math.PI * 2);
  x.fill();
  _burbuja = new THREE.CanvasTexture(c);
  return _burbuja;
}

/** Textura de baldosas (suelos de laboratorio y palacio). */
export function texturaBaldosas(a: string, b: string, n: number) {
  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d")!;
  const t = 256 / 8;
  for (let i = 0; i < 8; i++)
    for (let j = 0; j < 8; j++) {
      x.fillStyle = (i + j) % 2 ? a : b;
      x.fillRect(i * t, j * t, t, t);
    }
  x.strokeStyle = "rgba(22,18,42,0.35)";
  x.lineWidth = 2;
  for (let i = 0; i <= 8; i++) {
    x.beginPath();
    x.moveTo(i * t, 0);
    x.lineTo(i * t, 256);
    x.moveTo(0, i * t);
    x.lineTo(256, i * t);
    x.stroke();
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(n, n);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
