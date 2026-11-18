// Una PERSONA (BENT o alguien de su especie) dibujada en 2D DENTRO del escenario 3D. Es un muñeco articulado
// (src/bent/rig.tsx) que se anima solo (src/bent/animaciones.ts): anda, corre, habla moviendo la boca, señala…
// Se proyecta su posición en el mundo con la misma cámara que pinta el 3D, así crece, se aleja y se mueve con la
// cámara como si estuviera allí. La luz del escenario lo tiñe y, si está lejos, se pierde en la niebla.
import React from "react";
import * as THREE from "three";
import { Anim, Expresion, poseCompleta } from "../bent/animaciones";
import { ATUENDOS, Muneco } from "../bent/rig";
import { Figura, caraReparto } from "../reparto/figura";
import { REPARTO } from "../reparto/reparto";
import { aPantalla } from "./camara";
import { DatosEscenario } from "./escenarios-datos";
import { EstadoActor, mundo } from "./estado";
import { ALTO_DIBUJO, PERSONAS } from "./personajes";
import { Actor, Cara, Pose } from "./tipos";

const ALTO_MUNECO = 950; // unidades del muñeco de los pies a lo alto de la gorra

export const ANIM: Record<Pose, Anim> = {
  bolsillos: "quieto",
  brazos: "habla",
  camina: "camina",
  corre: "corre",
  senala: "senala",
  piensa: "piensa",
  encoge: "encoge",
  saluda: "saluda",
  victoria: "victoria",
  celebra: "victoria",
  asustado: "asustado",
  cruza: "cruza",
  salta: "salta",
  mira: "mira",
};
export const EXPRESION: Record<Cara, Expresion> = {
  normal: "seria",
  chulo: "chulo",
  enfadado: "enfadado",
  feliz: "feliz",
  risa: "risa",
  sorpresa: "sorpresa",
  asustado: "asustado",
  triste: "triste",
  piensa: "piensa",
  dormido: "dormido",
  aburrido: "aburrido",
};

/** Boca al hablar: se abre y cierra de forma irregular (parece que dice palabras). */
export const abreBoca = (f: number, semilla: number) => {
  const v = Math.abs(Math.sin(f * 0.85 + semilla) * 0.6 + Math.sin(f * 1.37 + semilla * 2) * 0.4);
  return Math.min(1, v * 1.1);
};

/** ¿Se pinta en 2D? (muñeco de BENT con extra.dosd o una figura del reparto con extra.figura) */
export const es2D = (a: Actor) => a.extra?.dosd === true || typeof a.extra?.figura === "string";

export const ActorEscena: React.FC<{ actor: Actor; e: EstadoActor; i: number; f: number; cam: THREE.PerspectiveCamera; esc: DatosEscenario; variante: number }> = ({ actor, e, i, f, cam, esc, variante }) => {
  if (!(PERSONAS.includes(actor.tipo) || es2D(actor)) || !e.visible || e.opacidad <= 0.01) return null;
  const semilla = (variante * 31 + i * 7) % 100;
  const base = mundo(esc, e);
  const altoM = e.anchoM * (ALTO_DIBUJO[actor.tipo] / 200);
  const p0 = aPantalla(cam, base);
  const p1 = aPantalla(cam, [base[0], base[1] + altoM, base[2]]);
  if (!p0.delante || p0.dist < 0.15) return null;
  const altoPx = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  if (altoPx > 6000) return null; // pegado a la cámara
  const inclina = (Math.atan2(p1.x - p0.x, p0.y - p1.y) * 180) / Math.PI; // sigue el giro de la cámara
  const niebla = Math.min(0.85, Math.max(0, (p0.dist - esc.nieblaPersonajes[0]) / (esc.nieblaPersonajes[1] - esc.nieblaPersonajes[0])));
  const filtro = [e.brillo > 0 ? `drop-shadow(0 0 ${30 * e.brillo}px rgba(160,240,255,${0.9 * e.brillo}))` : "", niebla > 0.02 ? `brightness(${1 - niebla * 0.55}) saturate(${1 - niebla * 0.5})` : ""].join(" ").trim() || undefined;

  let anim = ANIM[e.pose];
  let ant = ANIM[e.poseAnt];
  let t = e.tPose;
  if (anim === "quieto" && e.habla) {
    // al hablar gesticula
    anim = "habla";
    ant = "quieto";
    t = 30;
  }
  const abre = e.habla ? abreBoca(f, semilla) : 0;
  const pose0 = poseCompleta({ anim, animAnt: ant, t, expresion: EXPRESION[e.cara], abre, semilla, f });
  const pose = typeof actor.extra?.figura === "string" ? { ...pose0, ...caraReparto(EXPRESION[e.cara], abre, f + semilla) } : pose0;
  const k = (altoPx / ALTO_MUNECO) * e.pop;
  return (
    <div style={{ position: "absolute", left: p0.x, top: p0.y, width: 0, height: 0, opacity: e.opacidad * (1 - niebla * 0.35), transform: `rotate(${inclina}deg)`, filter: filtro }}>
      <svg width={1} height={1} style={{ overflow: "visible", position: "absolute" }}>
        <defs>
          <filter id={`luz${i}`} x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
            <feFlood floodColor={esc.tinte} result="c" />
            <feComposite in="c" in2="SourceGraphic" operator="in" result="m" />
            <feBlend in="m" in2="SourceGraphic" mode="multiply" />
          </filter>
        </defs>
        <g filter={`url(#luz${i})`} transform={`scale(${k * e.mira} ${k}) rotate(${e.giro} 0 -475)`}>
          {typeof actor.extra?.figura === "string" && REPARTO[actor.extra.figura] ? (
            <Figura p={pose} d={REPARTO[actor.extra.figura]} f={f + semilla} id={`a${i}`} />
          ) : (
            <Muneco p={pose} a={ATUENDOS[actor.tipo] ?? ATUENDOS.bent} f={f + semilla} id={`a${i}`} />
          )}
        </g>
      </svg>
    </div>
  );
};
